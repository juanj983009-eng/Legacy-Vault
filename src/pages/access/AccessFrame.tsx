import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { PATHS } from '../../app/paths';
import { IconArrowRight, IconUser } from '../../components/ui/Icons';
import { usePageMetadata } from '../../hooks/usePageMetadata';

const scenes = {
  login: {
    image: '/images/editorial-biblioteca-login.webp',
    imageHeight: 626,
    label: 'Acceso',
    title: 'Acceso',
    introduction: 'Descubre piezas y colecciones en Legacy Vault.',
    panelDescription: 'Accede con tu perfil o continúa como visitante.',
  },
  account: {
    image: '/images/editorial-biblioteca-login.webp',
    imageHeight: 626,
    label: 'Cuenta',
    title: 'Mi cuenta',
    introduction: 'Sigue explorando las colecciones de Legacy Vault.',
    panelDescription: 'Consulta los datos de tu perfil.',
  },
  register: {
    image: '/images/editorial-biblioteca-registro.webp',
    imageHeight: 628,
    label: 'Cuenta',
    title: 'Crear perfil',
    introduction: 'Identifícate al explorar la colección y rellena tus datos de contacto al preparar un pedido.',
    panelDescription: 'Completa tus datos para empezar.',
  },
} as const;

const links = {
  login: { to: PATHS.login, label: 'Acceder', Icon: IconArrowRight },
  register: { to: PATHS.register, label: 'Crear perfil', Icon: IconUser },
} as const;

type AccessFrameProps = {
  scene: keyof typeof scenes;
  children: ReactNode;
  showAccessOptions?: boolean;
};

const editorialHeadingClass = 'mt-3 max-w-[14ch] font-display text-3xl leading-[1.08] font-bold tracking-tight text-marfil sm:text-4xl lg:text-[clamp(3rem,4.2vw,4.5rem)]';
const panelHeadingClass = 'font-display text-2xl leading-tight font-bold text-marfil sm:text-3xl';
const accessLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-control px-2 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-bronce-hover ${isActive
    ? 'bg-bronce/20 text-bronce-hover'
    : 'text-arena hover:bg-superficie hover:text-marfil'}`;

export function AccessFrame({ scene, children, showAccessOptions = scene !== 'account' }: AccessFrameProps) {
  const data = scenes[scene];
  const heading = usePageMetadata(data.title);
  const isRegister = scene === 'register';
  const panelTitleId = `${scene}-title`;
  const linkOrder = isRegister ? [links.register, links.login] : [links.login, links.register];

  return (
    <div className="relative isolate overflow-hidden bg-carbon">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={data.image}
          alt=""
          width={1440}
          height={data.imageHeight}
          fetchPriority="high"
          className="h-full w-full object-cover object-[22%_center] lg:object-[15%_center]"
        />
        <div className="absolute inset-0 bg-carbon/70 lg:bg-transparent lg:bg-linear-to-r lg:from-carbon/25 lg:via-transparent lg:to-carbon/65" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_14%_47%,rgba(11,11,11,0.65),transparent_50%)] lg:block" />
      </div>

      <div className="mx-auto grid max-w-[91rem] gap-5 px-4 py-7 sm:gap-8 sm:px-8 sm:py-10 lg:min-h-[39rem] lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-12 lg:py-12 xl:px-16">
        <div className="min-w-0 lg:self-start lg:pt-19 xl:pl-8">
          <p className="flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-bronce-hover uppercase">
            <span aria-hidden="true" className="h-px w-7 bg-bronce" />
            {data.label}
          </p>
          {isRegister ? (
            <h1 ref={heading} tabIndex={-1} className={`${editorialHeadingClass} max-sm:max-w-none focus:outline-none`}>
              {data.title}
            </h1>
          ) : (
            <p className={editorialHeadingClass}>Bienvenido de nuevo</p>
          )}
          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-arena sm:text-base lg:text-lg">
            {data.introduction}
          </p>
        </div>

        <section aria-labelledby={panelTitleId} className="flex w-full max-w-xl min-w-0 flex-col gap-5 rounded-tarjeta border border-bronce/50 bg-carbon/95 p-5 sm:p-7 lg:justify-self-end xl:p-9">
          <header>
            {isRegister ? (
              <h2 id={panelTitleId} className={panelHeadingClass}>Tu perfil</h2>
            ) : (
              <h1 id={panelTitleId} ref={heading} tabIndex={-1} className={`${panelHeadingClass} focus:outline-none`}>
                {data.title}
              </h1>
            )}
            <p className="mt-2 text-sm leading-relaxed text-arena sm:text-base">{data.panelDescription}</p>
          </header>
          {showAccessOptions && (
            <nav aria-label="Opciones de acceso" className="order-first grid grid-cols-2 gap-1 rounded-control border border-contorno p-1">
              {linkOrder.map(({ to, label, Icon }) => (
                <NavLink key={to} end to={to} className={accessLinkClass}>
                  <Icon className="size-4 shrink-0" /> {label}
                </NavLink>
              ))}
            </nav>
          )}
          {children}
        </section>
      </div>
    </div>
  );
}
