import { Outlet } from 'react-router';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-carbon text-marfil font-body antialiased selection:bg-bronce selection:text-carbon">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-bronce focus:p-3 focus:font-semibold focus:text-carbon focus:outline-none"
        href="#contenido"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="w-full flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
