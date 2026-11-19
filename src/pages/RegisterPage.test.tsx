import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { DemoAccessContext } from '../context/demoAccessContext';
import { RegisterPage } from './RegisterPage';

function renderRegister(registerMock = vi.fn().mockResolvedValue('ok')) {
  const value = {
    alias: null,
    email: undefined,
    sessionPending: false,
    enterGuest: vi.fn(),
    register: registerMock,
    signIn: vi.fn(),
    leave: vi.fn(),
  };
  render(
    <MemoryRouter>
      <DemoAccessContext.Provider value={value}>
        <RegisterPage />
      </DemoAccessContext.Provider>
    </MemoryRouter>
  );
  return { registerMock };
}

describe('RegisterPage (Rechazo de contraseñas y accesibilidad)', () => {
  it('muestra mensaje accesible y enfoca el campo cuando la contraseña no cumple requisitos de seguridad', async () => {
    const user = userEvent.setup();
    const { registerMock } = renderRegister(vi.fn().mockResolvedValue('weak_password'));

    await user.type(screen.getByLabelText('Nombre'), 'Ana Demo');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    await user.type(passwordInput, 'clave-insegura');
    await user.type(screen.getByLabelText('Repetir contraseña', { selector: 'input' }), 'clave-insegura');

    await user.click(screen.getByRole('button', { name: 'Crear mi perfil' }));

    expect(registerMock).toHaveBeenCalledWith('Ana Demo', 'ana@example.com', 'clave-insegura');
    const errorMsg = await screen.findByText('Esta contraseña no cumple los requisitos de seguridad. Elige otra.');
    expect(errorMsg).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'profile-password-error');
    expect(passwordInput).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra mensaje de filtración cuando la respuesta incluye la señal de filtración pública', async () => {
    const user = userEvent.setup();
    renderRegister(vi.fn().mockResolvedValue('leaked_password'));

    await user.type(screen.getByLabelText('Nombre'), 'Carlos Demo');
    await user.type(screen.getByLabelText('Correo electrónico'), 'carlos@example.com');
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    await user.type(passwordInput, 'clave-filtrada');
    await user.type(screen.getByLabelText('Repetir contraseña', { selector: 'input' }), 'clave-filtrada');

    await user.click(screen.getByRole('button', { name: 'Crear mi perfil' }));

    const errorMsg = await screen.findByText('Esta contraseña ha aparecido en filtraciones públicas. Elige otra.');
    expect(errorMsg).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveFocus();
  });

  it('mantiene el mensaje genérico ante un error no relacionado y no culpa al campo de contraseña', async () => {
    const user = userEvent.setup();
    renderRegister(vi.fn().mockRejectedValue(new Error('Fallo de conexión')));

    await user.type(screen.getByLabelText('Nombre'), 'Diana Demo');
    await user.type(screen.getByLabelText('Correo electrónico'), 'diana@example.com');
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    await user.type(passwordInput, 'clave-valida-123');
    await user.type(screen.getByLabelText('Repetir contraseña', { selector: 'input' }), 'clave-valida-123');

    await user.click(screen.getByRole('button', { name: 'Crear mi perfil' }));

    const problemAlert = await screen.findByRole('alert');
    expect(problemAlert).toHaveTextContent('No se pudo crear el perfil. Intenta de nuevo.');
    expect(passwordInput).not.toHaveAttribute('aria-invalid');
  });

  it('permite corregir la contraseña rechazada y volver a intentar el registro exitosamente', async () => {
    const user = userEvent.setup();
    const registerMock = vi.fn()
      .mockResolvedValueOnce('weak_password')
      .mockResolvedValueOnce('confirmation');

    renderRegister(registerMock);

    await user.type(screen.getByLabelText('Nombre'), 'Elena Demo');
    await user.type(screen.getByLabelText('Correo electrónico'), 'elena@example.com');
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    const repeatInput = screen.getByLabelText('Repetir contraseña', { selector: 'input' });
    const submitBtn = screen.getByRole('button', { name: 'Crear mi perfil' });

    // 1er intento con contraseña que resulta rechazada
    await user.type(passwordInput, 'clave-debil-1');
    await user.type(repeatInput, 'clave-debil-1');
    await user.click(submitBtn);

    expect(await screen.findByText('Esta contraseña no cumple los requisitos de seguridad. Elige otra.')).toBeInTheDocument();

    // Corregir la contraseña y reintentar
    await user.clear(passwordInput);
    await user.type(passwordInput, 'nueva-clave-robusta');
    await user.clear(repeatInput);
    await user.type(repeatInput, 'nueva-clave-robusta');

    // Botón debe estar habilitado para reintentar
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(registerMock).toHaveBeenLastCalledWith('Elena Demo', 'elena@example.com', 'nueva-clave-robusta');
    expect(await screen.findByText(/Revisa tu correo para confirmar tu cuenta/i)).toBeInTheDocument();
  });
});
