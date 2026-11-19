import type { CartTotals } from './cart';
import type { DemoOrderLine } from './checkout';

export type StoredDemoOrder = Readonly<{
  id: string;
  createdAt: string;
  lines: readonly DemoOrderLine[];
  totals: CartTotals;
}>;

export type OrdersLoad = {
  orders: StoredDemoOrder[];
  warning?: string;
};
