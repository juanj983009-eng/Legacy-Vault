import { useState } from 'react';

export function BrandLogo() {
  const [crestUnavailable, setCrestUnavailable] = useState(false);

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5 sm:gap-3">
      {crestUnavailable ? (
        <span data-brand-fallback="" aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-control border border-bronce bg-pizarra font-display text-lg font-bold text-bronce-hover max-[359px]:size-9 sm:size-14">
          LV
        </span>
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}images/escudo-legacy-vault.webp`}
          alt=""
          width={192}
          height={192}
          onError={() => setCrestUnavailable(true)}
          className="size-11 shrink-0 object-contain max-[359px]:size-9 sm:size-14"
        />
      )}
      <span className="flex flex-col justify-center sm:border-l sm:border-bronce/45 sm:pl-3">
        <span className="whitespace-nowrap font-display text-sm leading-none font-bold tracking-wide text-marfil max-[359px]:max-w-20 max-[359px]:whitespace-normal sm:text-[1.375rem]">
          LEGACY VAULT
        </span>
        <span className="mt-1.5 hidden text-[9px] leading-none font-semibold tracking-[0.14em] text-arena uppercase sm:block">
          Antigüedades &amp; Colección
        </span>
      </span>
    </span>
  );
}
