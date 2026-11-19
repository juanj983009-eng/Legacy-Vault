import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';
import { ORDERS_STORAGE_KEY, loadOrders } from '../services/ordersStorage';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function open(path = '/pedidos') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Historial de pedidos simulados (OrdersPage & Checkout)', () => {
  it('muestra estado vacío cuidado con enlace al catálogo si no hay pedidos', async () => {
    open('/pedidos');

    expect(screen.getByRole('heading', { name: 'Mis pedidos', level: 1 })).toBeVisible();
    const emptyHeading = screen.getByRole('heading', { name: 'No tienes pedidos registrados.', level: 2 });
    expect(emptyHeading).toBeVisible();
    expect(
      screen.getByText(/cuando completes un pedido, encontrarás aquí sus piezas, cantidades y total/i)
    ).toBeVisible();

    const emptySection = emptyHeading.closest('section')!;
    const catalogLink = within(emptySection).getByRole('link', { name: /explorar catálogo/i });
    expect(catalogLink).toHaveAttribute('href', '/catalogo');

    // Avisos claros y discretos
    expect(screen.getByText(/tu historial se guarda en este navegador y no se sincroniza entre dispositivos/i)).toBeVisible();
  });

  it('permite confirmar un pedido en checkout, guardarlo localmente sin datos personales y consultarlo tras recargar', async () => {
    const user = userEvent.setup();

    // 1. Simular un carrito con un reloj suizo
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
      })
    );

    // 2. Abrir checkout
    open('/checkout');

    expect(await screen.findByRole('heading', { name: 'Finaliza tu pedido', level: 1 })).toBeVisible();

    // Esperar a que el formulario cargue y llenarlo con datos de contacto ficticios
    const nameInput = await screen.findByLabelText('Nombre del comprador');
    await user.type(nameInput, 'Carlos Comprador');
    await user.type(screen.getByLabelText('Correo electrónico'), 'carlos@ejemplo.com');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Principal 456');
    await user.type(screen.getByLabelText('Ciudad o distrito'), 'Lima');
    await user.type(screen.getByLabelText('Teléfono'), '999888777');

    // Pasar al paso de revisión
    const reviewButton = screen.getByRole('button', { name: 'Revisar pedido' });
    await user.click(reviewButton);

    // Confirmar pedido
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar pedido' });
    await user.click(confirmButton);

    // 3. Verificar pantalla de confirmación
    expect(await screen.findByRole('heading', { name: 'Pedido confirmado', level: 2 })).toBeVisible();
    expect(screen.getByText(/el resumen del pedido se ha guardado en el historial de este navegador/i)).toBeVisible();

    // Comprobar que existe enlace hacia 'Ver mis pedidos'
    const ordersLink = screen.getByRole('link', { name: 'Ver mis pedidos' });
    expect(ordersLink).toHaveAttribute('href', '/pedidos');

    // 4. VERIFICACIÓN CRÍTICA: Asegurar que NO se guardaron datos personales en localStorage
    const stored = loadOrders();
    expect(stored.orders).toHaveLength(1);
    const savedOrder = stored.orders[0]!;
    expect(savedOrder.id).toMatch(/^DEMO-[A-F0-9]{16}$/);
    expect(savedOrder.lines[0]?.name).toBe('Reloj de Bolsillo Suizo (c. 1912)');
    expect(savedOrder.totals.totalCents).toBe(245000);

    const rawStorage = localStorage.getItem(ORDERS_STORAGE_KEY) || '';
    expect(rawStorage).not.toContain('Carlos Comprador');
    expect(rawStorage).not.toContain('carlos@ejemplo.com');
    expect(rawStorage).not.toContain('Av. Principal 456');
    expect(rawStorage).not.toContain('999888777');

    // 5. El carrito debe haberse vaciado
    const cartStorage = localStorage.getItem(CART_STORAGE_KEY) || '';
    expect(cartStorage).toContain('"items":[]');

    // 6. Navegar a /pedidos mediante el enlace de confirmación
    await user.click(ordersLink);
    expect(await screen.findByRole('heading', { name: 'Mis pedidos', level: 1 })).toBeVisible();
    expect(screen.getByText(savedOrder.id)).toBeVisible();
    expect(screen.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();
    expect(screen.getByText('1 pedido guardado')).toBeVisible();

    // 7. Simular recarga de página (desmontar y montar en /pedidos)
    cleanup();
    open('/pedidos');
    expect(await screen.findByRole('heading', { name: 'Mis pedidos', level: 1 })).toBeVisible();
    expect(screen.getByText(savedOrder.id)).toBeVisible();
    expect(screen.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();
  });

  it('ordena múltiples pedidos del más reciente al más antiguo', () => {
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        orders: [
          {
            id: 'DEMO-1111111111111111',
            createdAt: '2026-11-10T10:00:00.000Z',
            lines: [{ productId: 'moneda-carlos-iii', name: 'Moneda Carlos III', quantity: 1, subtotalCents: 98000 }],
            totals: { itemCount: 1, subtotalCents: 98000, shippingCents: 0, totalCents: 98000 },
          },
          {
            id: 'DEMO-2222222222222222',
            createdAt: '2026-11-17T18:00:00.000Z',
            lines: [{ productId: 'reloj-bolsillo-suizo', name: 'Reloj Suizo', quantity: 2, subtotalCents: 490000 }],
            totals: { itemCount: 2, subtotalCents: 490000, shippingCents: 0, totalCents: 490000 },
          },
        ],
      })
    );

    open('/pedidos');

    const headings = screen.getAllByRole('heading', { level: 2 });
    const orderNumbers = headings.map((h) => h.textContent).filter((t) => t?.startsWith('DEMO-'));
    expect(orderNumbers).toEqual(['DEMO-2222222222222222', 'DEMO-1111111111111111']);
  });

  it('permite cancelar la eliminación conservando los pedidos', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        orders: [
          {
            id: 'DEMO-AAAAAAAAAAAA1111',
            createdAt: '2026-11-17T18:00:00.000Z',
            lines: [{ productId: 'reloj-bolsillo-suizo', name: 'Reloj Suizo', quantity: 1, subtotalCents: 245000 }],
            totals: { itemCount: 1, subtotalCents: 245000, shippingCents: 0, totalCents: 245000 },
          },
        ],
      })
    );

    open('/pedidos');

    expect(screen.getByText('DEMO-AAAAAAAAAAAA1111')).toBeVisible();

    const deleteBtn = screen.getByRole('button', { name: /eliminar historial/i });
    await user.click(deleteBtn);

    expect(screen.getByText(/¿deseas eliminar todo el historial de pedidos de este navegador\?/i)).toBeVisible();

    // Cancelar
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelBtn);

    // Los pedidos deben seguir existiendo
    expect(screen.getByText('DEMO-AAAAAAAAAAAA1111')).toBeVisible();
    expect(loadOrders().orders).toHaveLength(1);
  });

  it('elimina el historial tras confirmación y anuncia el cambio accesiblemente', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        orders: [
          {
            id: 'DEMO-BBBBBBBBBBBB2222',
            createdAt: '2026-11-17T18:00:00.000Z',
            lines: [{ productId: 'reloj-bolsillo-suizo', name: 'Reloj Suizo', quantity: 1, subtotalCents: 245000 }],
            totals: { itemCount: 1, subtotalCents: 245000, shippingCents: 0, totalCents: 245000 },
          },
        ],
      })
    );

    open('/pedidos');

    const deleteBtn = screen.getByRole('button', { name: /eliminar historial/i });
    await user.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar eliminación' });
    await user.click(confirmBtn);

    // Estado vacío visible
    expect(screen.getByText('No tienes pedidos registrados.')).toBeVisible();
    expect(screen.getByText(/se ha eliminado el historial de pedidos de este navegador/i)).toBeVisible();

    // Storage vacío
    expect(loadOrders().orders).toHaveLength(0);
  });

  it('muestra aviso claro ante JSON corrupto sin afirmar que se recuperaron pedidos', () => {
    localStorage.setItem(ORDERS_STORAGE_KEY, '{ json corrupto total !!!');

    open('/pedidos');

    expect(screen.getByRole('alert')).toHaveTextContent(/datos no válidos/i);
    expect(screen.getByText('No tienes pedidos registrados.')).toBeVisible();
    expect(screen.queryByRole('heading', { name: /^DEMO-/ })).toBeNull();
  });

  it('en checkout conserva la confirmación visible y comunica advertencia si el almacenamiento local falla', async () => {
    const user = userEvent.setup();

    // Carrito con 1 pieza
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
      })
    );

    // Simular que setItem en localStorage falla por cuota o restricción
    const originalSetItem = localStorage.setItem.bind(localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      if (key === ORDERS_STORAGE_KEY) {
        throw new Error('QuotaExceededError');
      }
      return originalSetItem(key, value);
    });

    open('/checkout');

    expect(await screen.findByRole('heading', { name: 'Finaliza tu pedido', level: 1 })).toBeVisible();

    const nameInput = await screen.findByLabelText('Nombre del comprador');
    await user.type(nameInput, 'María Cliente');
    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@ejemplo.com');
    await user.type(screen.getByLabelText('Dirección'), 'Calle Los Cedros 123');
    await user.type(screen.getByLabelText('Ciudad o distrito'), 'Arequipa');
    await user.type(screen.getByLabelText('Teléfono'), '987654321');

    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }));

    const confirmButton = await screen.findByRole('button', { name: 'Confirmar pedido' });
    await user.click(confirmButton);

    // Confirmación sigue visible
    expect(await screen.findByRole('heading', { name: 'Pedido confirmado', level: 2 })).toBeVisible();
    // No debe afirmar que se guardó en el historial
    expect(screen.queryByText(/el resumen del pedido se ha guardado/i)).toBeNull();
    // Debe mostrar advertencia del fallo de almacenamiento
    expect(screen.getByText(/no se pudo guardar el pedido en el historial/i)).toBeVisible();
  });

  it('en checkout con JSON existente corrupto mantiene visible la confirmación, informa que no pudo añadirse al historial y no sobrescribe los datos previos', async () => {
    const user = userEvent.setup();

    // 1. Storage contiene JSON previo corrupto
    const corruptJson = '{ corrupto total no parseable';
    localStorage.setItem(ORDERS_STORAGE_KEY, corruptJson);

    // 2. Carrito con 1 pieza
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
      })
    );

    open('/checkout');

    expect(await screen.findByRole('heading', { name: 'Finaliza tu pedido', level: 1 })).toBeVisible();

    await user.type(await screen.findByLabelText('Nombre del comprador'), 'Juan Comprador');
    await user.type(screen.getByLabelText('Correo electrónico'), 'juan@ejemplo.com');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Historia 789');
    await user.type(screen.getByLabelText('Ciudad o distrito'), 'Cusco');
    await user.type(screen.getByLabelText('Teléfono'), '955443322');

    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    await user.click(await screen.findByRole('button', { name: 'Confirmar pedido' }));

    // 3. Confirmación actual se mantiene visible
    expect(await screen.findByRole('heading', { name: 'Pedido confirmado', level: 2 })).toBeVisible();
    expect(screen.getByText(/^DEMO-[A-F0-9]{16}$/)).toBeVisible();

    // 4. No informa falso éxito
    expect(screen.queryByText(/el resumen del pedido se ha guardado/i)).toBeNull();

    // 5. Comunica claramente que no pudo añadirse al historial por datos no válidos
    expect(screen.getByText(/no se pudo añadir el pedido al historial/i)).toBeVisible();

    // 6. Los datos previos no fueron sobrescritos
    expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(corruptJson);
  });

  it('en checkout si el historial supera el límite de bytes conserva los datos previos, mantiene visible la confirmación y avisa del límite', async () => {
    const user = userEvent.setup();

    // 1. Simular historial previo al borde del límite de tamaño (50,895 bytes de 51,200 máx)
    const heavyLines = (offset: number) =>
      Array.from({ length: 50 }, (_, i) => ({
        productId: 'reloj-bolsillo-suizo' as const,
        name: `Pieza previa ${offset}-${i} ${'A'.repeat(168)}`,
        quantity: 1,
        subtotalCents: 100000,
        image: { src: '/images/reloj-bolsillo.webp', alt: 'Pieza previa' },
      }));

    const heavyOrders = [
      {
        id: 'DEMO-PREVHEAVY00001',
        createdAt: '2026-11-17T10:00:00.000Z',
        lines: heavyLines(1),
        totals: { itemCount: 50, subtotalCents: 5000000, shippingCents: 0, totalCents: 5000000 },
      },
      {
        id: 'DEMO-PREVHEAVY00002',
        createdAt: '2026-11-17T11:00:00.000Z',
        lines: heavyLines(2),
        totals: { itemCount: 50, subtotalCents: 5000000, shippingCents: 0, totalCents: 5000000 },
      },
      {
        id: 'DEMO-PREVHEAVY00003',
        createdAt: '2026-11-17T12:00:00.000Z',
        lines: heavyLines(3),
        totals: { itemCount: 50, subtotalCents: 5000000, shippingCents: 0, totalCents: 5000000 },
      },
    ];

    const priorRaw = JSON.stringify({ version: 1, orders: heavyOrders });
    localStorage.setItem(ORDERS_STORAGE_KEY, priorRaw);

    // 2. Carrito para confirmar otro pedido
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
      })
    );

    open('/checkout');

    expect(await screen.findByRole('heading', { name: 'Finaliza tu pedido', level: 1 })).toBeVisible();

    await user.type(await screen.findByLabelText('Nombre del comprador'), 'Ana Compradora');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.com');
    await user.type(screen.getByLabelText('Dirección'), 'Calle Nueva 456');
    await user.type(screen.getByLabelText('Ciudad o distrito'), 'Trujillo');
    await user.type(screen.getByLabelText('Teléfono'), '911223344');

    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    await user.click(await screen.findByRole('button', { name: 'Confirmar pedido' }));

    // 3. Confirmación visible
    expect(await screen.findByRole('heading', { name: 'Pedido confirmado', level: 2 })).toBeVisible();

    // 4. Sin falso éxito
    expect(screen.queryByText(/el resumen del pedido se ha guardado/i)).toBeNull();

    // 5. Aviso de límite de tamaño
    expect(screen.getByText(/supera el límite de tamaño/i)).toBeVisible();

    // 6. Conservación del historial anterior
    expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(priorRaw);
  });

  describe('recuperación de historial inválido y distinción de errores', () => {
    it('con historial corrupto permite solicitar eliminación de datos dañados y cancelar manteniendo los datos intactos', async () => {
      const user = userEvent.setup();
      const corrupt = '{ json corrupto no parseable';
      localStorage.setItem(ORDERS_STORAGE_KEY, corrupt);

      open('/pedidos');

      expect(screen.getByRole('alert')).toHaveTextContent(/datos no válidos/i);
      const clearDamagedBtn = screen.getByRole('button', { name: /eliminar datos dañados/i });
      expect(clearDamagedBtn).toBeVisible();

      // Solicitar eliminación abre el diálogo de confirmación
      await user.click(clearDamagedBtn);
      expect(
        screen.getByText(/¿deseas eliminar los datos locales dañados y empezar un historial nuevo\?/i)
      ).toBeVisible();

      // Cancelar
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      // Los datos corruptos se mantienen en localStorage y el aviso continúa
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(corrupt);
      expect(screen.getByRole('alert')).toHaveTextContent(/datos no válidos/i);
      expect(screen.getByRole('button', { name: /eliminar datos dañados/i })).toBeVisible();
    });

    it('con historial corrupto elimina los datos dañados tras confirmación y permite empezar un historial nuevo limpio', async () => {
      const user = userEvent.setup();
      const corrupt = '{ json corrupto no parseable';
      localStorage.setItem(ORDERS_STORAGE_KEY, corrupt);

      open('/pedidos');

      const clearDamagedBtn = screen.getByRole('button', { name: /eliminar datos dañados/i });
      await user.click(clearDamagedBtn);

      await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));

      // Storage ha sido limpiado
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBeNull();

      // Mensaje accesible de confirmación
      expect(screen.getByText(/se han eliminado los datos locales dañados/i)).toBeVisible();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByText('No tienes pedidos registrados.')).toBeVisible();
    });

    it('comunica advertencia si ocurre un fallo al intentar eliminar los datos dañados sin afirmar éxito', async () => {
      const user = userEvent.setup();
      const corrupt = '{ json corrupto no parseable';
      localStorage.setItem(ORDERS_STORAGE_KEY, corrupt);

      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('AccessDeniedError');
      });

      open('/pedidos');

      const clearDamagedBtn = screen.getByRole('button', { name: /eliminar datos dañados/i });
      await user.click(clearDamagedBtn);

      await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));

      // Informa del error sin reportar éxito
      expect(screen.getByText(/no se pudo eliminar el historial de pedidos/i)).toBeVisible();
      expect(screen.queryByText(/se han eliminado los datos locales dañados/i)).toBeNull();

      // Datos corruptos previos no se eliminaron
      vi.restoreAllMocks();
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(corrupt);
    });

    it('tras eliminar los datos dañados permite confirmar y guardar exitosamente un pedido nuevo en checkout', async () => {
      const user = userEvent.setup();
      const corrupt = '{ json corrupto que bloqueaba guardados';
      localStorage.setItem(ORDERS_STORAGE_KEY, corrupt);

      // 1. Visitar /pedidos y eliminar los datos dañados confirmando la acción
      open('/pedidos');
      await user.click(screen.getByRole('button', { name: /eliminar datos dañados/i }));
      await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBeNull();

      // 2. Preparar carrito para nuevo pedido
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
        })
      );

      // 3. Abrir checkout y confirmar pedido
      cleanup();
      open('/checkout');

      expect(await screen.findByRole('heading', { name: 'Finaliza tu pedido', level: 1 })).toBeVisible();

      await user.type(await screen.findByLabelText('Nombre del comprador'), 'David Recuperado');
      await user.type(screen.getByLabelText('Correo electrónico'), 'david@ejemplo.com');
      await user.type(screen.getByLabelText('Dirección'), 'Av. Renovación 101');
      await user.type(screen.getByLabelText('Ciudad o distrito'), 'Lima');
      await user.type(screen.getByLabelText('Teléfono'), '900112233');

      await user.click(screen.getByRole('button', { name: 'Revisar pedido' }));
      await user.click(await screen.findByRole('button', { name: 'Confirmar pedido' }));

      // 4. Confirmación exitosa y guardado en historial
      expect(await screen.findByRole('heading', { name: 'Pedido confirmado', level: 2 })).toBeVisible();
      expect(screen.getByText(/el resumen del pedido se ha guardado en el historial/i)).toBeVisible();

      // 5. Verificar que el nuevo pedido está correctamente almacenado
      const stored = loadOrders();
      expect(stored.orders).toHaveLength(1);
      expect(stored.orders[0]?.lines[0]?.productId).toBe('reloj-bolsillo-suizo');
      expect(stored.warning).toBeUndefined();
    });

    it('distingue un fallo de acceso al almacenamiento y no ofrece la opción de eliminar datos dañados', () => {
      // Simular que getItem falla por almacenamiento bloqueado / excepción de seguridad
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: LocalStorage access blocked');
      });

      open('/pedidos');

      // Muestra alerta del error de acceso
      expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron leer los pedidos guardados/i);

      // NO debe ofrecer el botón para eliminar datos dañados ni eliminar historial
      expect(screen.queryByRole('button', { name: /eliminar datos dañados/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /eliminar historial/i })).toBeNull();
    });
  });
});
