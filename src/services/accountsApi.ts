export type AccountProfile = { alias: string; email: string };
export type SessionResult = { profile: AccountProfile | null };

export async function requestAccount(action: 'session' | 'register' | 'login' | 'logout', data?: object, signal?: AbortSignal) {
  const response = await fetch('/api/auth/' + action, {
    method: action === 'session' ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: data ? { 'Content-Type': 'application/json' } : {},
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...(signal ? { signal } : {}),
  });
  if (response.status === 409) return 'duplicate' as const;
  if (response.status === 401) return 'invalid' as const;
  if (response.status === 429) throw new Error('Intenta de nuevo en un minuto.');
  if (!response.ok) throw new Error('El servicio de cuentas no está disponible.');
  const { profile } = await response.json() as SessionResult;
  if (profile === null || (typeof profile?.alias === 'string' && typeof profile.email === 'string')) return profile;
  throw new Error('Respuesta de cuenta incorrecta.');
}
