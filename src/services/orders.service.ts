import { dataAdapter } from "@/config/data-source";
import type { Order, OrderStatus } from "@/data/types";

export const ordersService = {
  list: () => dataAdapter.listOrders(),
  get: (id: string) => dataAdapter.getOrder(id),
  place: (input: Parameters<typeof dataAdapter.placeOrder>[0]) =>
    dataAdapter.placeOrder(input),
  setStatus: (id: string, status: OrderStatus) =>
    dataAdapter.updateOrderStatus(id, status),
  subscribe: (cb: (o: Order[]) => void) => dataAdapter.subscribeOrders(cb),
};
