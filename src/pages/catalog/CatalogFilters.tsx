import { useState, type Ref, type SubmitEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { categories } from '../../data/catalog';
import { parseCatalogQuery, serializeCatalogQuery, type CatalogQuery } from '../../utils/catalogQuery';

const FIELD_CLASS = 'form-field block min-h-11 w-full min-w-0 rounded-control border border-arena/50 bg-carbon px-3 py-2 text-sm text-marfil';

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
    <form ref={formRef} aria-labelledby="catalog-filters" onSubmit={handleSubmit} className="min-w-0 space-y-4 rounded-tarjeta border border-contorno bg-pizarra p-4 sm:p-5">
      <h2 id="catalog-filters" className="font-display text-xl font-bold">Filtros</h2>
      <label className="block space-y-1.5 text-sm">
        <span>Buscar productos</span>
        <input className={FIELD_CLASS} type="search" name="buscar" maxLength={100} defaultValue={query.q} />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>Categoría</span>
        <select className={FIELD_CLASS} name="categoria" defaultValue={query.categoryId ?? ''}
          onChange={({ currentTarget }) => { if (currentTarget.form) applyForm(currentTarget.form, 'categoria'); }}>
          <option value="">Todas las categorías</option>
          {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm">Rango de precios</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 space-y-1.5 text-sm">
            <span>Precio mínimo (S/)</span>
            <input className={FIELD_CLASS} name="min" inputMode="decimal" defaultValue={defaults.get('min') ?? ''} maxLength={17}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'catalog-price-error' : undefined} />
          </label>
          <label className="min-w-0 space-y-1.5 text-sm">
            <span>Precio máximo (S/)</span>
            <input className={FIELD_CLASS} name="max" inputMode="decimal" defaultValue={defaults.get('max') ?? ''} maxLength={17}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'catalog-price-error' : undefined} />
          </label>
        </div>
        {error && <p role="alert" id="catalog-price-error" className="mt-2 border-l-2 border-error pl-2 text-sm text-marfil">{error}</p>}
      </fieldset>
      <label className="block space-y-1.5 text-sm">
        <span>Ordenar por</span>
        <select className={FIELD_CLASS} name="orden" defaultValue={query.order}
          onChange={({ currentTarget }) => { if (currentTarget.form) applyForm(currentTarget.form, 'orden'); }}>
          <option value="nombre-asc">Nombre (A–Z)</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <Button type="submit">Aplicar filtros</Button>
        <Button variant="outline" onClick={() => onApply(new URLSearchParams())}>Limpiar filtros</Button>
      </div>
    </form>
  );
}
