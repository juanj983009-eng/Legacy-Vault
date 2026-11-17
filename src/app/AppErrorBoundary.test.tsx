import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenPage(): never {
  throw new Error('detalle interno de prueba');
}

it('ofrece recuperación sin mostrar el detalle del error de renderizado', () => {
  render(<AppErrorBoundary><BrokenPage /></AppErrorBoundary>, { onCaughtError: vi.fn() });
  expect(screen.getByRole('heading', { name: 'No pudimos mostrar esta página' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  expect(screen.queryByText('detalle interno de prueba')).toBeNull();
});
