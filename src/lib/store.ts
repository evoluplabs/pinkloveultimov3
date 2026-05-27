// ============================================================
// Store mock — Zustand + persist (localStorage)
// Substituído por Firestore na migração (apenas o adapter muda).
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogConfig, Order } from "@/data/types";
import { defaultCatalogConfig } from "@/data/mock-kits";

type State = {
  config: CatalogConfig;
  orders: Order[];
};

type Actions = {
  setConfig: (patch: Partial<CatalogConfig>) => void;
  pushOrder: (order: Order) => void;
  setOrderStatus: (id: string, status: Order["status"]) => void;
};

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      config: defaultCatalogConfig,
      orders: [],
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),
      pushOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders] })),
      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
    }),
    { name: "pinklove-catalog" },
  ),
);
