import { afterEach, describe, expect, it, vi } from 'vitest';

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
});
