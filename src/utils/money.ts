const PEN_FORMAT = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(priceCents: number): string {
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
    throw new RangeError('El importe debe ser un entero seguro de céntimos no negativo.');
  }

  const soles = Math.floor(priceCents / 100);
  const cents = String(priceCents % 100).padStart(2, '0');
  return PEN_FORMAT.formatToParts(soles)
    .map((part) => part.type === 'fraction' ? cents : part.value)
    .join('');
}
