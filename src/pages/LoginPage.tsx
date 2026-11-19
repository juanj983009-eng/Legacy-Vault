import { useRef, useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { DemoField } from '../components/forms/DemoField';
import { PasswordField } from '../components/forms/PasswordField';
import { Button } from '../components/ui/Button';
import { IconArrowRight, IconCart, IconHeart, IconHistory, IconMuseum, IconSearch } from '../components/ui/Icons';
import { useDemoAccess } from '../context/demoAccessContext';
import { useFormErrors } from '../hooks/useFormErrors';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { getOrdersCount } from '../services/ordersStorage';
import { readAccessCredentials, validateCredentials } from '../utils/validation';
import { AccessFrame } from './access/AccessFrame';

export function LoginPage() {
  const { alias, email, sessionPending, enterGuest, leave, signIn } = useDemoAccess();
  const { itemCount } = useCart();
  const { favoriteCount } = useFavorites();
  const { formRef, errors, setErrors } = useFormErrors<'email' | 'password'>();
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  const initials =
    alias
      ?.normalize('NFC')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase('es') ?? '')
      .join('') || (email ? 'LV' : 'VI');

  const cartUnitLabel = itemCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas';
  const favoritesUnitLabel = favoriteCount === 1 ? 'pieza guardada' : 'piezas guardadas';
  const ordersCount = getOrdersCount();
  const ordersUnitLabel = ordersCount === 1 ? 'pedido simulado' : 'pedidos simulados';

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
    <AccessFrame scene={alias ? 'account' : 'login'} showAccessOptions={!alias && !sessionPending}>
      {sessionPending ? (
        <div role="status" className="flex items-center gap-3 py-6 text-sm text-arena">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-bronce border-t-transparent" aria-hidden="true" />
          <span>Comprobando sesión…</span>
        </div>
      ) : alias ? (
        <div className="space-y-6">
          {/* IDENTIDAD DEL USUARIO / VISITANTE */}
          <div role="status" className="flex min-w-0 items-center gap-4 border-y border-contorno py-5 sm:gap-5">
            <span
              aria-hidden="true"
              className="grid size-16 shrink-0 place-items-center rounded-full border border-bronce/60 bg-madera/30 font-display text-2xl font-bold text-bronce-hover sm:size-20 sm:text-3xl"
            >
              {initials}
            </span>
            <div className="min-w-0 wrap-break-word">
              <p className="text-xs font-semibold tracking-wider text-bronce-hover uppercase">
                {email ? 'Perfil registrado' : 'Modo visitante'}
              </p>
              <p className="mt-1 font-display text-xl font-bold leading-tight text-marfil sm:text-2xl">{alias}</p>
              {email ? (
                <p className="mt-1 text-sm leading-relaxed text-arena">{email}</p>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-arena/80">
                  Navegación temporal sin cuenta. Tus favoritos y carrito se conservan en este navegador.
                </p>
              )}
            </div>
          </div>

          {/* ACCESOS PRINCIPALES CON CONTADORES REALES */}
          <nav aria-label="Accesos de la cuenta" className="grid gap-3 sm:grid-cols-2">
            <Link
              to={PATHS.favorites}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 p-3.5 text-sm transition-colors hover:border-bronce/60 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon border border-contorno/60 text-bronce">
                  <IconHeart className="size-4" filled={favoriteCount > 0} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-marfil group-hover:text-bronce transition-colors">
                    Mis favoritos
                  </span>
                  <span className="mt-0.5 block text-xs text-arena truncate">
                    {favoriteCount === 0 ? 'Sin piezas guardadas' : `${favoriteCount} ${favoritesUnitLabel}`}
                  </span>
                </span>
              </div>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={PATHS.cart}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 p-3.5 text-sm transition-colors hover:border-bronce/60 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon border border-contorno/60 text-bronce">
                  <IconCart className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-marfil group-hover:text-bronce transition-colors">
                    Mi carrito
                  </span>
                  <span className="mt-0.5 block text-xs text-arena truncate">
                    {itemCount === 0 ? 'Sin piezas seleccionadas' : `${itemCount} ${cartUnitLabel}`}
                  </span>
                </span>
              </div>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={PATHS.orders}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 p-3.5 text-sm transition-colors hover:border-bronce/60 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon border border-contorno/60 text-bronce">
                  <IconHistory className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-marfil group-hover:text-bronce transition-colors">
                    Mis pedidos
                  </span>
                  <span className="mt-0.5 block text-xs text-arena truncate">
                    {ordersCount === 0 ? 'Sin pedidos registrados' : `${ordersCount} ${ordersUnitLabel}`}
                  </span>
                </span>
              </div>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={PATHS.collections}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 p-3.5 text-sm transition-colors hover:border-bronce/60 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon border border-contorno/60 text-bronce">
                  <IconMuseum className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-marfil group-hover:text-bronce transition-colors">
                    Colecciones
                  </span>
                  <span className="mt-0.5 block text-xs text-arena truncate">Explorar por categoría</span>
                </span>
              </div>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={PATHS.catalog}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-control border border-contorno bg-pizarra/60 p-3.5 text-sm transition-colors hover:border-bronce/60 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon border border-contorno/60 text-bronce">
                  <IconSearch className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-marfil group-hover:text-bronce transition-colors">
                    Catálogo
                  </span>
                  <span className="mt-0.5 block text-xs text-arena truncate">Ver todas las piezas</span>
                </span>
              </div>
              <IconArrowRight className="size-4 shrink-0 text-bronce-hover transition-transform group-hover:translate-x-0.5" />
            </Link>
          </nav>

          {/* ACCIONES DEL PERFIL */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-contorno/70 pt-5">
            {!email ? (
              <Link
                to={PATHS.register}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 text-sm font-semibold text-carbon hover:bg-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce"
              >
                Crear un perfil <IconArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                to={PATHS.catalog}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 text-sm font-semibold text-carbon hover:bg-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce"
              >
                Explorar catálogo <IconArrowRight className="size-4" />
              </Link>
            )}

            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void signOut()}
              className="min-h-11"
            >
              {busy ? 'Cerrando sesión…' : email ? 'Cerrar sesión' : 'Salir del perfil'}
            </Button>
          </div>

          {problem && (
            <p role="alert" className="rounded-control border border-error/70 bg-error/10 p-3 text-sm text-marfil">
              {problem}
            </p>
          )}
        </div>
      ) : (
        <>
          <form
            ref={formRef}
            onSubmit={(event) => void submit(event)}
            noValidate
            autoComplete="off"
            aria-label="Iniciar sesión"
            className="space-y-4"
          >
            <DemoField
              id="login-email"
              name="email"
              label="Correo electrónico"
              type="email"
              required
              autoComplete="username"
              maxLength={254}
              placeholder="nombre@ejemplo.com"
              error={errors.email}
            />
            <PasswordField
              id="login-password"
              name="password"
              label="Contraseña"
              autoComplete="current-password"
              error={errors.password}
            />
            {problem && (
              <p role="alert" className="rounded-control border border-error/70 bg-error/10 p-3 text-sm text-marfil">
                {problem}
              </p>
            )}
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? 'Verificando…' : 'Iniciar sesión'} <IconArrowRight className="size-4 shrink-0" />
            </Button>
          </form>
          <div className="grid gap-3 border-t border-contorno pt-4 sm:grid-cols-2">
            <Button variant="outline" disabled={busy} onClick={enterGuest}>
              Entrar como visitante
            </Button>
            <Link
              to={PATHS.register}
              className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-bronce-hover underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-bronce"
            >
              Crear un perfil
            </Link>
          </div>
        </>
      )}
    </AccessFrame>
  );
}
