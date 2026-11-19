import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthWeakPasswordError } from '@supabase/supabase-js';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(), signOut: vi.fn(), signUp: vi.fn(), signInWithPassword: vi.fn(),
}));
vi.mock('./supabase', () => ({ supabase: { auth } }));
import { requestAccount } from './accountsApi';

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe('cuentas en producción', () => {
  it('solicita confirmación cuando el registro no crea una sesión', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({ data: { user: { email: 'demo@example.test' }, session: null }, error: null });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('confirmation');
    expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ data: { alias: 'Demo' } }) }));
  });

  it('recupera el perfil de una sesión existente', async () => {
    vi.stubEnv('PROD', true);
    auth.getSession.mockResolvedValue({ data: { session: { user: { email: 'demo@example.test', user_metadata: { alias: 'Demo' } } } }, error: null });
    await expect(requestAccount('session')).resolves.toEqual({ alias: 'Demo', email: 'demo@example.test' });
  });

  it('informa credenciales inválidas y permite cerrar sesión', async () => {
    vi.stubEnv('PROD', true);
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: { status: 400 } });
    auth.signOut.mockResolvedValue({ error: null });
    await expect(requestAccount('login', { email: 'demo@example.test', password: 'wrong' })).resolves.toBe('invalid');
    await expect(requestAccount('logout')).resolves.toBeNull();
  });

  it('identifica instancia real de AuthWeakPasswordError con razones [pwned]', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthWeakPasswordError('Password was leaked', 422, ['pwned']),
    });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('leaked_password');
  });

  it('identifica instancia real de AuthWeakPasswordError con otras razones y devuelve weak_password', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthWeakPasswordError('Password does not meet length/character rules', 422, ['length', 'characters']),
    });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('weak_password');
  });

  it('identifica instancia real de AuthWeakPasswordError con lista vacía y devuelve weak_password', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthWeakPasswordError('Weak password', 422, []),
    });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('weak_password');
  });

  it('devuelve weak_password si el mensaje contiene breach pero las razones no incluyen pwned', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthWeakPasswordError('Password identified in security breach audit', 422, ['characters']),
    });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('weak_password');
  });

  it('no clasifica como filtrada si un objeto de error contiene breach en texto libre sin pwned en reasons', async () => {
    vi.stubEnv('PROD', true);
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 422, code: 'weak_password', reasons: ['length'], message: 'Password mentioned in data breach reports' },
    });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).resolves.toBe('weak_password');
  });

  it('no trata un HTTP 422 genérico como contraseña débil o filtrada', async () => {
    vi.stubEnv('PROD', true);
    const genericError = { status: 422, code: 'validation_failed', message: 'Formato inválido' };
    auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: genericError });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).rejects.toEqual(genericError);
  });

  it('lanza errores no relacionados con la validación de contraseña', async () => {
    vi.stubEnv('PROD', true);
    const serverError = { status: 500, message: 'Error interno del servidor' };
    auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: serverError });
    await expect(requestAccount('register', { alias: 'Demo', email: 'demo@example.test', password: 'example123' })).rejects.toEqual(serverError);
  });
});
