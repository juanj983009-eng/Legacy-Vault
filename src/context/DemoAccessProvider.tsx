import { useEffect, useRef, useState, type ReactNode } from 'react';
import { requestAccount, type AccountProfile } from '../services/accountsApi';
import { DemoAccessContext, type ProfileResult } from './demoAccessContext';

type Profile = AccountProfile | { alias: string; email?: never };

export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const changes = useRef(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionPending, setSessionPending] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const version = changes.current;
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]);
    void requestAccount('session', undefined, signal).then((restored) => {
      if (!controller.signal.aborted && changes.current === version && restored && typeof restored === 'object') {
        setProfile(restored);
      }
    }).catch(() => { /* El catálogo y la compra como invitado siguen disponibles. */ }).finally(() => {
      if (!controller.signal.aborted) setSessionPending(false);
    });
    return () => controller.abort();
  }, []);

  async function authenticate(action: 'register' | 'login', credentials: { email: string; password: string; alias?: string }): Promise<ProfileResult> {
    const version = ++changes.current;
    const result = await requestAccount(action, credentials);
    if (result === null) throw new Error('No se pudo iniciar sesión.');
    if (typeof result === 'string') return result;
    if (changes.current === version) setProfile(result);
    return 'ok';
  }

  async function leave() {
    const version = ++changes.current;
    if (profile?.email) await requestAccount('logout');
    if (version === changes.current) setProfile(null);
  }

  return (
    <DemoAccessContext.Provider value={{
      alias: profile?.alias ?? null,
      email: profile?.email,
      sessionPending,
      enterGuest: () => { changes.current++; setProfile({ alias: 'Visitante' }); },
      register: (alias, email, password) => authenticate('register', { alias, email, password }),
      signIn: (email, password) => authenticate('login', { email, password }),
      leave,
    }}>
      {children}
    </DemoAccessContext.Provider>
  );
}
