import { Component, type ReactNode } from 'react';
import { Button } from '../components/ui/Button';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-xl space-y-4 px-4 py-12">
        <h1 className="font-display text-3xl font-bold">No pudimos mostrar esta página</h1>
        <p className="text-arena">Vuelve al inicio o intenta cargar la página de nuevo.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="/" className="inline-flex min-h-11 items-center text-bronce underline">Volver al inicio</a>
          <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </main>
    );
  }
}
