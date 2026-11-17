import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el contenedor principal.');

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary><AppProviders><AppRoutes /></AppProviders></AppErrorBoundary>
  </StrictMode>,
);
