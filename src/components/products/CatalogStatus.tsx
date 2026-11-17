import { Button } from '../ui/Button';

export function CatalogStatus({ status, retry }: { status: 'loading' | 'error' | 'empty'; retry?: () => void }) {
  return (
    <div className="flex min-h-36 flex-col items-start justify-center gap-3 rounded-tarjeta border border-contorno bg-pizarra p-5">
      {status === 'loading' && <p role="status" className="text-arena">Cargando piezas del catálogo…</p>}
      {status === 'empty' && <p role="status" className="text-arena">El catálogo aún no tiene piezas disponibles.</p>}
      {status === 'error' && (
        <>
          <p role="alert">No pudimos cargar los datos del catálogo.</p>
          <Button onClick={retry}>Reintentar</Button>
        </>
      )}
    </div>
  );
}
