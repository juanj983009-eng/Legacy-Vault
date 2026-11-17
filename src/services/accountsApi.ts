import { supabase } from './supabase';

export type AccountProfile = { alias: string; email: string };
export type SessionResult = { profile: AccountProfile | null };

export async function requestAccount(action: 'session' | 'register' | 'login' | 'logout', data?: object, signal?: AbortSignal) {
  if (import.meta.env.PROD) {
    if (action === 'session') {
      const { data: result, error } = await supabase.auth.getSession();
      if (error) throw error;
      const user = result.session?.user;
      return user?.email ? { alias: String(user.user_metadata.alias ?? user.email.split('@')[0]), email: user.email } : null;
    }
    if (action === 'logout') {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    }
    const credentials = data as { email: string; password: string; alias?: string };
    const { data: result, error } = action === 'register'
      ? await supabase.auth.signUp({ email: credentials.email, password: credentials.password,
          options: { data: { alias: credentials.alias }, emailRedirectTo: `${window.location.origin}/login` } })
      : await supabase.auth.signInWithPassword({ email: credentials.email, password: credentials.password });
    if (error) {
      if (action === 'login' && error.status === 400) return 'invalid' as const;
      throw error;
    }
    if (!result.session && action === 'register') return 'confirmation' as const;
    const user = result.user;
    if (!user?.email) throw new Error('Respuesta de cuenta incorrecta.');
    return { alias: String(user.user_metadata.alias ?? user.email.split('@')[0]), email: user.email };
  }
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

