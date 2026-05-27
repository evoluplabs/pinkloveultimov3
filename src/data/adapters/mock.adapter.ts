// ============================================================
// MOCK ADAPTER — Zustand + dataset estático.
// Implementa DataAdapter. Trocar para Firebase = trocar adapter.
// ============================================================

import type {
  AvailabilityResult,
  CatalogConfig,
  DataAdapter,
  Kit,
  Order,
  OrderStatus,
  TierLevel,
  Unsubscribe,
} from "@/data/types";
import { mockKits, mockBookedDates } from "@/data/mock-kits";
import { useStore } from "@/lib/store";

const delay = <T>(v: T, ms = 60): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

const genCode = () =>
  "PL-" + Math.random().toString(36).slice(2, 7).toUpperCase();

const visibleKits = (cfg: CatalogConfig): Kit[] => {
  const hidden = new Set(cfg.hiddenKitIds);
  let list = mockKits.filter((k) => k.active && !hidden.has(k.id));
  if (cfg.order?.length) {
    const ix = (id: string) => {
      const i = cfg.order.indexOf(id);
      return i === -1 ? 999 : i;
    };
    list = [...list].sort((a, b) => ix(a.id) - ix(b.id));
  }
  return list;
};

export const mockAdapter: DataAdapter = {
  // ─── CATALOG CONFIG ───────────────────────────────────
  async getCatalogConfig() {
    return delay(useStore.getState().config);
  },
  async updateCatalogConfig(patch) {
    useStore.getState().setConfig(patch);
    return useStore.getState().config;
  },

  // ─── KITS ─────────────────────────────────────────────
  async listKits() {
    return delay(visibleKits(useStore.getState().config));
  },
  async getKit(id) {
    return delay(mockKits.find((k) => k.id === id) ?? null);
  },
  async topKits(limit = 3) {
    // mock: ordena por rating + badges
    const sorted = [...mockKits]
      .filter((k) => k.active)
      .sort((a, b) => {
        const aBadge = a.badges?.includes("Mais pedido") ? 1 : 0;
        const bBadge = b.badges?.includes("Mais pedido") ? 1 : 0;
        if (aBadge !== bBadge) return bBadge - aBadge;
        return b.rating - a.rating;
      });
    return delay(sorted.slice(0, limit));
  },

  // ─── AVAILABILITY ─────────────────────────────────────
  async checkAvailability(
    kitId: string,
    tier: TierLevel,
    eventDate: string,
  ): Promise<AvailabilityResult> {
    await delay(null, 350); // simula latência de Cloud Function
    const kit = mockKits.find((k) => k.id === kitId);
    if (!kit) return { available: false, missing: [] };

    // 1) tier flag
    const t = kit.tiers.find((x) => x.level === tier);
    if (!t || !t.available)
      return {
        available: false,
        missing: [
          { componentId: "tier", name: `Tier ${tier}`, needed: 1, have: 0 },
        ],
      };

    // 2) agenda
    const booked = mockBookedDates[kitId] ?? [];
    if (booked.includes(eventDate))
      return {
        available: false,
        missing: [
          { componentId: "date", name: "Data já reservada", needed: 1, have: 0 },
        ],
      };

    return { available: true, missing: [] };
  },

  // ─── ORDERS ───────────────────────────────────────────
  async listOrders() {
    return delay(useStore.getState().orders);
  },
  async getOrder(id) {
    return delay(useStore.getState().orders.find((o) => o.id === id) ?? null);
  },
  async placeOrder(input) {
    const order: Order = {
      ...input,
      id: crypto.randomUUID(),
      code: genCode(),
      createdAt: Date.now(),
      status: "enviado",
    };
    useStore.getState().pushOrder(order);
    return delay(order);
  },
  async updateOrderStatus(id: string, status: OrderStatus) {
    useStore.getState().setOrderStatus(id, status);
  },
  subscribeOrders(cb): Unsubscribe {
    cb(useStore.getState().orders);
    return useStore.subscribe((s, prev) => {
      if (s.orders !== prev.orders) cb(s.orders);
    });
  },
};
