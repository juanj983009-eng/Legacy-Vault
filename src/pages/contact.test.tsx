import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { NotFoundPage } from './NotFoundPage';

describe('Páginas complementarias de Legacy Vault', () => {
  describe('AboutPage (Nosotros)', () => {
    it('presenta la colección y enlaza el catálogo filtrado', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Nosotros', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'La memoria de los objetos.', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'El oficio detrás de cada pieza' })).toBeInTheDocument();
      const collections = within(screen.getByRole('navigation', { name: 'Explorar por colección' }));
      expect(collections.getAllByRole('link')).toHaveLength(4);
      expect(collections.getByRole('link', { name: 'Relojes vintage' })).toHaveAttribute('href', '/catalogo?categoria=relojes');
      expect(screen.getByText('Recreación editorial')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Explorar catálogo/i })).toHaveAttribute('href', '/catalogo');
    });
  });

  describe('NotFoundPage (404)', () => {
    it('muestra el diseño aprobado con el título exacto y CTA volver al inicio', () => {
      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Página no encontrada', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Esta pieza no está en nuestra colección.', level: 2 })).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /Explorar catálogo/i })).toHaveAttribute('href', '/catalogo');
    });
  });

  describe('ContactPage (Contacto)', () => {
    it('limpia los controles, el contador y los errores', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><ContactPage /></MemoryRouter>);
      const name = screen.getByLabelText(/^Nombre/);
      const message = screen.getByLabelText(/Mensaje detallado/i);
      await user.type(name, 'Nombre de prueba');
      await user.type(message, 'Mensaje breve');
      await user.click(screen.getByRole('button', { name: /Revisar consulta/i }));
      expect(screen.getAllByRole('alert')).not.toHaveLength(0);
      await user.click(screen.getByRole('button', { name: 'Limpiar' }));
      expect(name).toHaveValue('');
      expect(message).toHaveValue('');
      expect(screen.getByText(/0 \/ 500 caracteres/)).toBeVisible();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('rechaza un asunto manipulado y enfoca el selector con su error asociado', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><ContactPage /></MemoryRouter>);
      await user.type(screen.getByLabelText(/^Nombre/), 'Nombre de prueba');
      await user.type(screen.getByLabelText(/Correo electrónico/i), 'demo@example.test');
      await user.type(screen.getByLabelText(/Mensaje detallado/i), 'Esta consulta sintética tiene más de veinte caracteres.');
      const subject = screen.getByRole('combobox', { name: /Asunto/ });
      subject.append(new Option('Asunto alterado', 'alterado'));
      fireEvent.change(subject, { target: { value: 'alterado' } });
      await user.click(screen.getByRole('button', { name: /Revisar consulta/i }));
      expect(subject).toHaveFocus();
      expect(subject).toHaveAccessibleDescription(/asunto válido/i);
      expect(screen.queryByText(/consulta validada/i)).toBeNull();
    });

    it('presenta el formulario de inmediato con el aviso demostrativo', () => {
      render(
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Contáctanos', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('form', { name: 'Escribe una consulta' })).toHaveAccessibleDescription(/sin enviar ni guardar/i);


      expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Asunto de la consulta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mensaje detallado/i)).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: 'Contáctanos', level: 1 })).toHaveFocus();
    });

    it('valida campos inválidos, asocia mensajes de error accesibles y enfoca el primer error', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      );


      const submitButton = screen.getByRole('button', { name: 'Revisar consulta' });
      await user.click(submitButton);

      // Primer campo con error debe recibir foco
      expect(screen.getByLabelText(/^Nombre/)).toHaveFocus();
      expect(screen.getByText('Escribe un nombre de 2 a 80 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('Escribe un correo válido, por ejemplo visitante@example.test.')).toBeInTheDocument();
      expect(screen.getByText('El mensaje debe contener entre 20 y 500 caracteres.')).toBeInTheDocument();
    });

    it('al enviar datos ficticios válidos muestra confirmación honesta sin envío de red', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      );


      const nameInput = screen.getByLabelText(/^Nombre/);
      const emailInput = screen.getByLabelText(/Correo electrónico/i);
      const messageInput = screen.getByLabelText(/Mensaje detallado/i);

      await user.type(nameInput, 'Rodrigo Mendoza');
      await user.type(emailInput, 'rodrigo@example.test');
      await user.type(messageInput, 'Me gustaría conocer más detalles sobre la catalogación del reloj de bolsillo suizo de 1912.');

      await user.click(screen.getByRole('button', { name: 'Revisar consulta' }));

      expect(screen.getByRole('heading', { name: 'Consulta validada', level: 3 })).toBeInTheDocument();
      expect(screen.getByText(/El mensaje no se envió/)).toBeVisible();
      expect(screen.getByText(/Los campos están completos/)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Escribir otra consulta' }));
      expect(screen.getByLabelText(/^Nombre/)).toHaveFocus();
      expect(screen.getByLabelText(/Mensaje detallado/i)).toHaveValue('');
    });
  });
});
