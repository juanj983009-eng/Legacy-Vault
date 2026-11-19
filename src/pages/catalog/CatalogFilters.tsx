import { useState, type Ref, type SubmitEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { IconSearch } from '../../components/ui/Icons';
import { categories } from '../../data/catalog';
import { parseCatalogQuery, serializeCatalogQuery, type CatalogQuery } from '../../utils/catalogQuery';

const FIELD_CLASS = 'form-field block min-h-11 w-full min-w-0 rounded-control border border-arena/35 bg-carbon/80 px-3 py-2 text-sm text-marfil placeholder:text-arena/45 hover:border-bronce/65';

export type CatalogSelect = 'categoria' | 'orden';

type CatalogFiltersProps = {
  query: CatalogQuery;
  formRef: Ref<HTMLFormElement>;
  onApply: (params: URLSearchParams, keepFocus?: CatalogSelect) => void;
};

export function CatalogFilters({ query, formRef, onApply }: CatalogFiltersProps) {
  const [draftError, setDraftError] = useState<string>();
  const defaults = serializeCatalogQuery(query);
  const error = draftError ?? query.error;

  function applyForm(form: HTMLFormElement, keepFocus?: CatalogSelect) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === 'string') params.set(key, value);
    }
    const next = parseCatalogQuery(params);
    if (next.error) {
      setDraftError(next.error);
      return;
    }
    onApply(serializeCatalogQuery(next), keepFocus);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    applyForm(event.currentTarget);
  }

  return (
    <form ref={formRef} aria-labelledby="catalog-filters" onSubmit={handleSubmit} className="min-w-0 space-y-5 rounded-tarjeta border border-contorno bg-pizarra p-4 sm:p-5">
      <div className="border-b border-contorno pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bronce-hover">Explora la colección</span>
        <h2 id="catalog-filters" className="mt-1 font-display text-xl font-bold text-marfil">Filtros</h2>
      </div>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-arena">Buscar productos</span>
        <span className="relative block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bronce" />
          <input className={`${FIELD_CLASS} pl-9`} type="search" name="buscar" maxLength={100} placeholder="Ej. reloj de bolsillo" defaultValue={query.q} />
        </span>
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-arena">Categoría</span>
        <select className={FIELD_CLASS} name="categoria" defaultValue={query.categoryId ?? ''}
          onChange={({ currentTarget }) => { if (currentTarget.form) applyForm(currentTarget.form, 'categoria'); }}>
          <option value="">Todas las categorías</option>
          {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-arena">Rango de precios <span className="text-arena/60">(S/)</span></legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 space-y-1.5 text-xs text-arena/75">
            <span>Mínimo</span>
            <input className={FIELD_CLASS} aria-label="Precio mínimo (S/)" name="min" inputMode="decimal" placeholder="0" defaultValue={defaults.get('min') ?? ''} maxLength={17}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'catalog-price-error' : undefined} />
          </label>
          <label className="min-w-0 space-y-1.5 text-xs text-arena/75">
            <span>Máximo</span>
            <input className={FIELD_CLASS} aria-label="Precio máximo (S/)" name="max" inputMode="decimal" placeholder="Sin límite" defaultValue={defaults.get('max') ?? ''} maxLength={17}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'catalog-price-error' : undefined} />
          </label>
        </div>
        {error && <p role="alert" id="catalog-price-error" className="mt-2 border-l-2 border-error pl-2 text-sm text-marfil">{error}</p>}
      </fieldset>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-arena">Ordenar por</span>
        <select className={FIELD_CLASS} name="orden" defaultValue={query.order}
          onChange={({ currentTarget }) => { if (currentTarget.form) applyForm(currentTarget.form, 'orden'); }}>
          <option value="nombre-asc">Nombre (A–Z)</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
        </select>
      </label>
      <div className="grid gap-2 border-t border-contorno pt-4 sm:grid-cols-2 lg:grid-cols-1">
        <Button type="submit">Aplicar filtros</Button>
        <Button variant="outline" onClick={() => onApply(new URLSearchParams())}>Limpiar filtros</Button>
      </div>
    </form>
  );
}
