import { useRef, useState, type SubmitEvent } from 'react';
import { Navigate } from 'react-router';
import { PATHS } from '../app/paths';
import { DemoField } from '../components/forms/DemoField';
import { PasswordField } from '../components/forms/PasswordField';
import { Button } from '../components/ui/Button';
import { IconUser } from '../components/ui/Icons';
import { useDemoAccess } from '../context/demoAccessContext';
import { useFormErrors } from '../hooks/useFormErrors';
import { MAX_ALIAS, readAccessCredentials, validateCredentials } from '../utils/validation';
import { AccessFrame } from './access/AccessFrame';

export function RegisterPage() {
  const { register, email, sessionPending } = useDemoAccess();
  const { formRef, errors, setErrors } = useFormErrors<'alias' | 'email' | 'password' | 'confirmation'>();
  const [problem, setProblem] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    const alias = String(data.get('alias') ?? '').trim();
    const credentials = readAccessCredentials(data);
    const next = {
      ...(alias.length < 2 || alias.length > MAX_ALIAS ? { alias: 'Escribe un nombre de 2 a 40 caracteres.' } : {}),
      ...validateCredentials(credentials),
      ...(credentials.password !== data.get('confirmation') ? { confirmation: 'Las contraseñas deben coincidir.' } : {}),
    };
    setErrors(next);
    setProblem('');
    if (Object.keys(next).length) return;

    submitting.current = true;
    setBusy(true);
    try {
      const result = await register(alias, credentials.email, credentials.password);
      if (result === 'confirmation') {
        setConfirmation(true);
        return;
      }
      if (result === 'duplicate') {
        setErrors({ email: 'Este correo ya está registrado. Puedes iniciar sesión.' });
        return;
      }
      if (result !== 'ok') setProblem('No se pudo crear el perfil. Intenta de nuevo.');
    } catch {
      setProblem('No se pudo crear el perfil. Intenta de nuevo.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (email) return <Navigate to={PATHS.login} replace />;
  if (sessionPending) {
    return (
      <AccessFrame scene="register" showAccessOptions={false}>
        <p role="status" className="text-sm text-arena">Comprobando sesión…</p>
      </AccessFrame>
    );
  }

  return (
    <AccessFrame scene="register">
      {confirmation ? <p role="status" className="rounded-control border border-bronce/60 bg-pizarra p-4 text-sm text-marfil">Revisa tu correo para confirmar tu cuenta. Después podrás iniciar sesión.</p> :
      <form ref={formRef} onSubmit={(event) => void submit(event)} noValidate autoComplete="off" aria-label="Datos del perfil" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <DemoField id="profile-alias" name="alias" label="Nombre" required maxLength={MAX_ALIAS}
            placeholder="Ana Demo" error={errors.alias} />
          <DemoField id="profile-email" name="email" label="Correo electrónico" type="email" required maxLength={254}
            autoComplete="username" placeholder="nombre@ejemplo.com" error={errors.email} />
        </div>
        <PasswordField id="profile-password" name="password" label="Contraseña" autoComplete="new-password" error={errors.password} />
        <PasswordField id="profile-confirmation" name="confirmation" label="Repetir contraseña" autoComplete="new-password" error={errors.confirmation} />
        {problem && <p role="alert" className="rounded-control border border-error/70 bg-error/10 p-3 text-sm">{problem}</p>}
        <Button type="submit" size="lg" disabled={busy} className="w-full">
          <IconUser className="size-4 shrink-0" /> {busy ? 'Creando perfil…' : 'Crear mi perfil'}
        </Button>
      </form>}
    </AccessFrame>
  );
}
