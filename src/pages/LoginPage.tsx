import { useRef, useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { DemoField } from '../components/forms/DemoField';
import { PasswordField } from '../components/forms/PasswordField';
import { Button } from '../components/ui/Button';
import { IconArrowRight } from '../components/ui/Icons';
import { useDemoAccess } from '../context/demoAccessContext';
import { useFormErrors } from '../hooks/useFormErrors';
import { useCart } from '../hooks/useCart';
import { readAccessCredentials, validateCredentials } from '../utils/validation';
import { AccessFrame } from './access/AccessFrame';

export function LoginPage() {
  const { alias, email, sessionPending, enterGuest, leave, signIn } = useDemoAccess();
  const { itemCount } = useCart();
  const { formRef, errors, setErrors } = useFormErrors<'email' | 'password'>();
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const initials = alias?.normalize('NFC').trim().split(/\s+/).slice(0, 2)
    .map((part) => part.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase('es') ?? '').join('') || 'LV';

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const credentials = readAccessCredentials(new FormData(event.currentTarget));
    const next = validateCredentials(credentials);
    setErrors(next);
    setProblem('');
    if (next.email || next.password) return;
    submitting.current = true;
    setBusy(true);
    try {
      const result = await signIn(credentials.email, credentials.password);
      if (result !== 'ok') setProblem('El correo o la contraseña son incorrectos.');
    } catch {
      setProblem('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function signOut() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setProblem('');
    try {
      await leave();
    } catch {
      setProblem('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <AccessFrame scene={email ? 'account' : 'login'} showAccessOptions={!email && !sessionPending}>
      {sessionPending ? (
        <p role="status" className="text-sm text-arena">Comprobando sesión…</p>
      ) : alias ? (
        <div className="space-y-6">
          <div role="status" className="flex min-w-0 items-center gap-4 border-y border-contorno py-5 sm:gap-5">
            <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full border border-bronce/60 bg-madera/30 font-display text-2xl font-bold text-bronce-hover sm:size-20 sm:text-3xl">
              {initials}
            </span>
            <div className="min-w-0 wrap-break-word">
              <p className="text-xs font-semibold tracking-wider text-bronce-hover uppercase">{email ? 'Perfil' : 'Modo invitado'}</p>
              <p className="mt-1 font-display text-xl font-bold leading-tight text-marfil sm:text-2xl">{alias}</p>
              {email && <p className="mt-1.5 text-sm leading-relaxed text-arena">{email}</p>}
            </div>
          </div>
          <nav aria-label="Accesos de la cuenta" className="grid gap-2 sm:grid-cols-2">
            <Link to={PATHS.cart} className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 px-4 text-sm transition-colors hover:border-bronce/60">
              <span><span className="block font-semibold text-marfil">Mi carrito</span><span className="mt-0.5 block text-xs text-arena">{itemCount === 0 ? 'Sin piezas seleccionadas' : `${itemCount} ${itemCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'}`}</span></span>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover" />
            </Link>
            <Link to={PATHS.collections} className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 px-4 text-sm transition-colors hover:border-bronce/60">
              <span><span className="block font-semibold text-marfil">Colecciones</span><span className="mt-0.5 block text-xs text-arena">Explorar por categoría</span></span>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover" />
            </Link>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={PATHS.catalog} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 text-sm font-semibold text-carbon hover:bg-bronce-hover">
              Explorar catálogo <IconArrowRight className="size-4" />
            </Link>
            <Button variant="outline" disabled={busy} onClick={() => void signOut()}>
              {email ? 'Cerrar sesión' : 'Salir del perfil'}
            </Button>
          </div>
          {problem && <p role="alert" className="rounded-control border border-error/70 bg-error/10 p-3 text-sm">{problem}</p>}
        </div>
      ) : (
        <>
          <form ref={formRef} onSubmit={(event) => void submit(event)} noValidate autoComplete="off" aria-label="Iniciar sesión" className="space-y-4">
            <DemoField id="login-email" name="email" label="Correo electrónico" type="email" required
              autoComplete="username" maxLength={254} placeholder="nombre@ejemplo.com" error={errors.email} />
            <PasswordField id="login-password" name="password" label="Contraseña" autoComplete="current-password" error={errors.password} />
            {problem && <p role="alert" className="rounded-control border border-error/70 bg-error/10 p-3 text-sm text-marfil">{problem}</p>}
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? 'Verificando…' : 'Iniciar sesión'} <IconArrowRight className="size-4 shrink-0" />
            </Button>
          </form>
          <div className="grid gap-3 border-t border-contorno pt-4 sm:grid-cols-2">
            <Button variant="outline" disabled={busy} onClick={enterGuest}>Entrar como visitante</Button>
            <Link to={PATHS.register} className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-bronce-hover underline underline-offset-4">Crear un perfil</Link>
          </div>
        </>
      )}
    </AccessFrame>
  );
}
