import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
const cookieName = 'legacy_vault_session';
const sessionSeconds = 60 * 60 * 24 * 7;
const bodyLimit = 4096;
const settings = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const dummySalt = randomBytes(16).toString('hex');
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

function sessionToken(request) {
  return request.headers.cookie?.match(new RegExp('(?:^|;\\s*)' + cookieName + '=([a-f0-9]{64})(?:;|$)'))?.[1];
}

function send(response, status, json, cookie) {
  if (cookie) response.setHeader('Set-Cookie', cookie);
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(json));
}

function sessionCookie(token, seconds) {
  return `${cookieName}=${token}; Path=/; Max-Age=${seconds}; HttpOnly; SameSite=Strict`;
}

async function readCredentials(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '')) return null;
  let size = 0;
  const chunks = [];
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > bodyLimit) { request.resume(); return null; }
    chunks.push(chunk);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
    const alias = typeof data?.alias === 'string' ? data.alias.trim() : '';
    const password = data?.password;
    if (email.length > 254 || !emailPattern.test(email) || typeof password !== 'string' ||
      password.length < 8 || password.length > 72) return null;
    return { email, alias, password };
  } catch {
    return null;
  }
}

export function createAccounts(databasePath) {
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      email TEXT PRIMARY KEY NOT NULL,
      alias TEXT NOT NULL,
      salt TEXT NOT NULL,
      verifier TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY NOT NULL,
      account_email TEXT NOT NULL REFERENCES accounts(email) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    ) STRICT;
  `);
  const getAccount = database.prepare('SELECT alias, email, salt, verifier FROM accounts WHERE email = ?');
  const addAccount = database.prepare('INSERT OR IGNORE INTO accounts VALUES (?, ?, ?, ?)');
  const getProfile = database.prepare('SELECT a.alias, a.email FROM sessions s JOIN accounts a ON a.email = s.account_email WHERE s.token_hash = ? AND s.expires_at > ?');
  const expireSessions = database.prepare('DELETE FROM sessions WHERE expires_at <= ?');
  const deleteSession = database.prepare('DELETE FROM sessions WHERE token_hash = ?');
  const addSession = database.prepare('INSERT INTO sessions VALUES (?, ?, ?)');
  let windowEnds = 0;
  let attempts = 0;
  let inFlight = 0;

  return async function accounts(request, response) {
    const path = request.url;
    const token = sessionToken(request);
    const now = Date.now();
    const sameHost = /^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(request.headers.host ?? '');
    if (!sameHost) return send(response, 403, { error: 'Origen no permitido' });
    if (path === '/auth/session' && request.method === 'GET') {
      return send(response, 200, { profile: token ? (getProfile.get(hashToken(token), now) ?? null) : null });
    }
    if (request.method !== 'POST') return send(response, 405, { error: 'Método no permitido' });
    if (request.headers.origin !== 'http://' + request.headers.host) return send(response, 403, { error: 'Origen no permitido' });
    if (path === '/auth/logout') {
      if (token) deleteSession.run(hashToken(token));
      return send(response, 200, { profile: null }, sessionCookie('', 0));
    }
    if (path !== '/auth/login' && path !== '/auth/register') return send(response, 404, { error: 'Ruta no encontrada' });

    if (now >= windowEnds) { windowEnds = now + 60_000; attempts = 0; }
    if (inFlight >= 4 || attempts >= 30) return send(response, 429, { error: 'Demasiados intentos' });
    attempts++;
    inFlight++;
    try {
      const credentials = await readCredentials(request);
      const registering = path === '/auth/register';
      if (!credentials || (registering && (credentials.alias.length < 2 || credentials.alias.length > 40))) {
        return send(response, 400, { error: 'Datos inválidos' });
      }
      const { alias, email, password } = credentials;
      const account = getAccount.get(email);
      const salt = registering ? randomBytes(16).toString('hex') : (account?.salt ?? dummySalt);
      const verifier = await derive(password, salt, 32, settings);
      if (registering) {
        if (!addAccount.run(email, alias, salt, verifier.toString('hex')).changes) {
          return send(response, 409, { error: 'Correo ya registrado' });
        }
      } else if (!account || !timingSafeEqual(verifier, Buffer.from(account.verifier, 'hex'))) {
        return send(response, 401, { error: 'Credenciales inválidas' });
      }
      expireSessions.run(now);
      if (token) deleteSession.run(hashToken(token));
      const nextToken = randomBytes(32).toString('hex');
      addSession.run(hashToken(nextToken), email, now + sessionSeconds * 1000);
      return send(response, registering ? 201 : 200, { profile: { alias: registering ? alias : account.alias, email } }, sessionCookie(nextToken, sessionSeconds));
    } finally {
      inFlight--;
    }
  };
}
