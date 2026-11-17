import { createContext, useContext } from 'react';

export type ProfileResult = 'ok' | 'duplicate' | 'invalid';

type DemoAccess = {
  alias: string | null;
  email: string | undefined;
  sessionPending: boolean;
  enterGuest: () => void;
  register: (alias: string, email: string, password: string) => Promise<ProfileResult>;
  signIn: (email: string, password: string) => Promise<ProfileResult>;
  leave: () => Promise<void>;
};

export const DemoAccessContext = createContext<DemoAccess | null>(null);

export function useDemoAccess() {
  const access = useContext(DemoAccessContext);
  if (!access) throw new Error('useDemoAccess requiere DemoAccessProvider.');
  return access;
}
