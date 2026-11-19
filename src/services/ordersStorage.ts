import type { StoredDemoOrder, OrdersLoad } from '../types/orders';
import { isCartQuantity } from '../utils/cart';
import { isProductId } from '../utils/catalogContract';

export const ORDERS_STORAGE_KEY = 'legacy-vault:orders:v1';
export const VERSION = 1;
export const MAX_ORDERS = 30;
export const MAX_BYTES = 50 * 1024;

export const INVALID_STORAGE = 'No se pudo recuperar el historial de pedidos por datos no válidos. Puedes empezar un historial nuevo.';
export const CORRUPT_ENTRIES = 'Se descartaron entradas no válidas del historial de pedidos.';
export const READ_ERROR = 'No se pudieron leer los pedidos guardados en este navegador.';
export const SAVE_ERROR = 'No se pudo guardar el pedido en el historial de este navegador.';
export const CLEAR_ERROR = 'No se pudo eliminar el historial de pedidos de este navegador.';
export const STORAGE_LIMIT_EXCEEDED = 'No se pudo añadir el pedido al historial porque supera el límite de tamaño permitido en este navegador.';
export const EXISTING_STORAGE_INVALID = 'No se pudo añadir el pedido al historial porque los datos existentes en este navegador no se pudieron interpretar.';
export const EXISTING_STORAGE_UNREADABLE = 'No se pudo añadir el pedido al historial porque no se pudieron leer los datos existentes en este navegador.';

const ALLOWED_ORDER_KEYS = new Set(['id', 'createdAt', 'lines', 'totals']);
const ALLOWED_LINE_KEYS = new Set(['productId', 'name', 'quantity', 'subtotalCents', 'image']);
const ALLOWED_IMAGE_KEYS = new Set(['src', 'alt']);
const ALLOWED_TOTALS_KEYS = new Set(['itemCount', 'subtotalCents', 'shippingCents', 'totalCents']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyAllowedKeys(record: Record<string, unknown>, allowed: Set<string>): boolean {
  return Object.keys(record).every((key) => allowed.has(key));
}

function isValidOrderId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 6 && id.length <= 50 && /^DEMO-[A-Z0-9]+$/.test(id);
}

function isValidDateString(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string') return false;
  const time = Date.parse(dateStr);
  return Number.isFinite(time);
}

function isValidOrderLine(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!hasOnlyAllowedKeys(value, ALLOWED_LINE_KEYS)) return false;

  const { productId, name, quantity, subtotalCents, image } = value;
  if (!isProductId(productId)) return false;
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) return false;
  if (!isCartQuantity(quantity)) return false;
  if (typeof subtotalCents !== 'number' || !Number.isSafeInteger(subtotalCents) || subtotalCents <= 0) return false;

  if (image !== undefined) {
    if (!isRecord(image)) return false;
    if (!hasOnlyAllowedKeys(image, ALLOWED_IMAGE_KEYS)) return false;
    if (typeof image.src !== 'string' || !image.src.startsWith('/images/')) return false;
    if (typeof image.alt !== 'string') return false;
  }

  return true;
}

function isValidTotals(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!hasOnlyAllowedKeys(value, ALLOWED_TOTALS_KEYS)) return false;

  const { itemCount, subtotalCents, shippingCents, totalCents } = value;
  return (
    typeof itemCount === 'number' &&
    Number.isSafeInteger(itemCount) &&
    itemCount > 0 &&
    typeof subtotalCents === 'number' &&
    Number.isSafeInteger(subtotalCents) &&
    subtotalCents > 0 &&
    typeof shippingCents === 'number' &&
    Number.isSafeInteger(shippingCents) &&
    shippingCents >= 0 &&
    typeof totalCents === 'number' &&
    Number.isSafeInteger(totalCents) &&
    totalCents > 0
  );
}

export function isValidStoredOrder(value: unknown): value is StoredDemoOrder {
  if (!isRecord(value)) return false;
  if (!hasOnlyAllowedKeys(value, ALLOWED_ORDER_KEYS)) return false;

  const { id, createdAt, lines, totals } = value;
  if (!isValidOrderId(id)) return false;
  if (!isValidDateString(createdAt)) return false;
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 50) return false;
  if (!lines.every(isValidOrderLine)) return false;
  if (!isValidTotals(totals)) return false;

  return true;
}

function exceedsMaxBytes(text: string): boolean {
  return text.length > MAX_BYTES || new TextEncoder().encode(text).byteLength > MAX_BYTES;
}

export function loadOrders(): OrdersLoad {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  } catch {
    return { orders: [], warning: READ_ERROR };
  }

  if (raw === null) return { orders: [] };
  if (exceedsMaxBytes(raw)) {
    return { orders: [], warning: INVALID_STORAGE };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { orders: [], warning: INVALID_STORAGE };
  }

  if (
    !isRecord(data) ||
    !('version' in data) ||
    data.version !== VERSION ||
    !('orders' in data) ||
    !Array.isArray(data.orders)
  ) {
    return { orders: [], warning: INVALID_STORAGE };
  }

  const orders: StoredDemoOrder[] = [];
  const seenIds = new Set<string>();

  for (const entry of data.orders) {
    if (!isValidStoredOrder(entry)) continue;
    if (seenIds.has(entry.id)) continue;
    seenIds.add(entry.id);
    orders.push(entry);
  }

  // Ordenar del más reciente al más antiguo
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (orders.length !== data.orders.length) {
    return {
      orders,
      warning: orders.length === 0 ? INVALID_STORAGE : CORRUPT_ENTRIES,
    };
  }

  return { orders };
}

export function saveOrder(order: StoredDemoOrder): { success: boolean; warning?: string } {
  if (!isValidStoredOrder(order)) {
    return { success: false, warning: 'El formato del pedido no es válido para su almacenamiento.' };
  }

  try {
    const loadResult = loadOrders();
    if (loadResult.warning) {
      return {
        success: false,
        warning:
          loadResult.warning === READ_ERROR
            ? EXISTING_STORAGE_UNREADABLE
            : EXISTING_STORAGE_INVALID,
      };
    }

    const current = loadResult.orders;
    // Evitar duplicados por id
    const filtered = current.filter((item) => item.id !== order.id);
    // Prepend el nuevo pedido y limitar tamaño
    const nextOrders = [order, ...filtered].slice(0, MAX_ORDERS);

    const serialized = JSON.stringify({
      version: VERSION,
      orders: nextOrders,
    });

    if (exceedsMaxBytes(serialized)) {
      return {
        success: false,
        warning: STORAGE_LIMIT_EXCEEDED,
      };
    }

    window.localStorage.setItem(ORDERS_STORAGE_KEY, serialized);
    return { success: true };
  } catch {
    return { success: false, warning: SAVE_ERROR };
  }
}

export function clearOrders(): { success: boolean; warning?: string } {
  try {
    window.localStorage.removeItem(ORDERS_STORAGE_KEY);
    return { success: true };
  } catch {
    return { success: false, warning: CLEAR_ERROR };
  }
}

export function getOrdersCount(): number {
  return loadOrders().orders.length;
}
