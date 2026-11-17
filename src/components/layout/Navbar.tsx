import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { PATHS } from '../../app/paths';
import { useDemoAccess } from '../../context/demoAccessContext';
import { useCart } from '../../hooks/useCart';
import { BrandLogo } from '../ui/BrandLogo';
import { IconCart, IconClose, IconMenu, IconSearch } from '../ui/Icons';

export function Navbar() {
  const { itemCount } = useCart();
  const { alias, email } = useDemoAccess();
  const accountName = email ? alias : null;
  const initials = accountName?.normalize('NFC').trim().split(/\s+/).slice(0, 2)
    .map((part) => part.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase('es') ?? '').join('') || 'LV';
  const unitLabel = itemCount === 1 ? 'unidad' : 'unidades';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar menú al cambiar de ruta sin efectos secundarios síncronos
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) return;

    drawerRef.current?.querySelector('a')?.focus();
    const desktop = window.matchMedia?.('(min-width: 64rem)');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handleBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    desktop?.addEventListener('change', handleBreakpoint);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      desktop?.removeEventListener('change', handleBreakpoint);
    };
  }, [mobileMenuOpen]);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center px-1 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-bronce text-bronce'
        : 'border-transparent text-marfil/85 hover:text-bronce hover:border-bronce/40'
    }`;

  const utilityLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center text-xs tracking-wider transition-colors uppercase ${
      isActive
        ? 'text-bronce font-semibold underline underline-offset-4'
        : 'text-arena/70 hover:text-marfil'
    }`;

  return (
    <header
      className="sticky top-0 z-50 border-b border-contorno bg-carbon/95 backdrop-blur-sm"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMobileMenuOpen(false);
      }}
    >
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-3 max-[359px]:px-2 sm:gap-4 sm:px-6 lg:px-8"
      >
        {/* LOGO CORPORATIVO */}
        <Link
          to={PATHS.home}
          className="inline-flex min-h-11 shrink-0 items-center rounded-control transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-bronce"
        >
          <BrandLogo />
        </Link>

        {/* NAVEGACIÓN PRINCIPAL DESKTOP */}
        <div className="hidden lg:flex items-center gap-7">
          <NavLink end to={PATHS.home} className={navLinkClasses}>
            Inicio
          </NavLink>
          <NavLink to={PATHS.catalog} className={navLinkClasses}>
            Catálogo
          </NavLink>
          <NavLink to={PATHS.collections} className={navLinkClasses}>
            Colecciones
          </NavLink>
          <NavLink to={PATHS.about} className={navLinkClasses}>
            Nosotros
          </NavLink>
          <NavLink to={PATHS.contact} className={navLinkClasses}>
            Contacto
          </NavLink>
        </div>

        {/* ACCIONES GLOBALES */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {!accountName && (
            <div className="hidden xl:flex items-center gap-3.5 border-r border-contorno pr-4">
              <NavLink to={PATHS.login} className={utilityLinkClasses}>Login</NavLink>
              <span className="text-arena/30" aria-hidden="true">•</span>
              <NavLink to={PATHS.register} className={utilityLinkClasses}>Registro</NavLink>
            </div>
          )}

          {/* Acceso a búsqueda en catálogo */}
          <Link
            to={PATHS.catalog}
            aria-label="Búsqueda en catálogo"
            className={`inline-flex min-h-11 min-w-10 sm:min-w-11 items-center justify-center rounded-control p-2 text-arena transition-colors hover:text-bronce focus-visible:outline-2 focus-visible:outline-bronce ${accountName ? 'max-[449px]:hidden' : ''}`}
          >
            <IconSearch className="h-5 w-5" />
          </Link>

          {accountName && (
            <NavLink to={PATHS.login} aria-label={`Mi cuenta, ${accountName}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-bronce/55 bg-pizarra px-1.5 text-sm font-semibold text-marfil transition-colors hover:border-bronce-hover hover:bg-superficie aria-[current=page]:border-bronce-hover aria-[current=page]:text-bronce-hover xl:px-2.5">
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-bronce/20 font-display text-xs font-bold text-bronce-hover">
                {initials}
              </span>
              <span className="hidden xl:inline">Mi cuenta</span>
            </NavLink>
          )}

          {/* Acceso al Carrito */}
          <NavLink
            to={PATHS.cart}
            className="inline-flex min-h-11 items-center gap-1.5 sm:gap-2 rounded-control border border-contorno bg-pizarra px-2.5 sm:px-3.5 py-2 text-sm font-medium text-marfil transition-colors hover:border-bronce focus-visible:outline-2 focus-visible:outline-bronce"
          >
            <IconCart className="h-4 w-4 text-bronce" />
            <span className="sr-only sm:not-sr-only">Carrito</span>{' '}
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-bronce text-[11px] font-bold text-carbon"
            >
              {itemCount}
            </span>
            {' '}<span className="sr-only">{unitLabel}</span>
          </NavLink>

          {/* BOTÓN MENÚ MÓVIL */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            aria-controls="menu-movil-drawer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden min-h-11 min-w-10 sm:min-w-11 items-center justify-center rounded-control border border-contorno p-2 text-marfil transition-colors hover:border-bronce hover:text-bronce focus-visible:outline-2 focus-visible:outline-bronce"
          >
            {mobileMenuOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* DRAWER / MENÚ MÓVIL ACCESIBLE */}
      {mobileMenuOpen && (
        <div
          id="menu-movil-drawer"
          role="dialog"
          aria-label="Menú de navegación móvil"
          ref={drawerRef}
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-y border-contorno bg-carbon shadow-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6">
            <div className="border-b border-contorno pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-bronce">
                Navegación principal
              </span>
              <ul className="mt-3 flex flex-col space-y-1">
                <li>
                  <NavLink
                    end
                    to={PATHS.home}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    Inicio
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={PATHS.catalog}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    Catálogo
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={PATHS.collections}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce aria-[current=page]:bg-pizarra aria-[current=page]:text-bronce"
                  >
                    Colecciones
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={PATHS.about}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    Nosotros
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={PATHS.contact}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    Contacto
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="border-b border-contorno pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-bronce">
                Pedidos y perfil
              </span>
              <ul className="mt-3 flex flex-col space-y-1">
                <li>
                  <NavLink
                    to={PATHS.cart}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center justify-between rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    <span>Carrito de compras</span>{' '}
                    <span className="rounded-full bg-bronce px-2 py-0.5 text-xs font-bold text-carbon">
                      {itemCount}
                    </span>
                    {' '}<span className="sr-only">{unitLabel}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={PATHS.login}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    {accountName ? 'Mi cuenta' : 'Acceder'}
                  </NavLink>
                </li>
                {!accountName && <li>
                  <NavLink
                    to={PATHS.register}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-control px-3 text-base font-medium text-marfil hover:bg-pizarra hover:text-bronce"
                  >
                    Crear perfil
                  </NavLink>
                </li>}
              </ul>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
