// ============================================================
// FIREBASE ADAPTER — STUB pronto para a migração.
// ============================================================
// Como ativar (4 passos):
//
// 1. bun add firebase
// 2. Crie src/data/firebase.ts:
//      import { initializeApp } from "firebase/app";
//      import { getFirestore } from "firebase/firestore";
//      export const app = initializeApp({ /* config */ });
//      export const db = getFirestore(app);
//
// 3. Implemente os TODOs abaixo (são chamadas Firestore padrão).
// 4. No .env: VITE_DATA_SOURCE=firebase
//
// Coleções recomendadas (multi-tenant por slug → userId):
//   slugs/{slug} → { userId }
//   users/{uid}/catalog/config         (doc único)
//   users/{uid}/kits/{kitId}
//   users/{uid}/bookings/{bookingId}   (datas reservadas)
//   users/{uid}/orders/{orderId}
//   users/{uid}/sales/{saleId}         (histórico p/ topKits)
//
// IMPORTANTE: o slug atual deve ser detectado via subdomínio
// (Cloudflare Worker injeta X-Catalog-Slug). Em dev, usar env
// VITE_CATALOG_SLUG.
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

const notImpl = (name: string) => {
  throw new Error(
    `[firebaseAdapter] ${name} ainda não implementado. ` +
      `Veja src/data/adapters/firebase.adapter.ts e MIGRATION.md`,
  );
};

export const firebaseAdapter: DataAdapter = {
  // ─── CATALOG CONFIG ───────────────────────────────────
  async getCatalogConfig(_slug?: string): Promise<CatalogConfig> {
    // TODO:
    //   const slugDoc = await getDoc(doc(db, "slugs", slug));
    //   const { userId } = slugDoc.data();
    //   const cfg = await getDoc(doc(db, `users/${userId}/catalog`, "config"));
    notImpl("getCatalogConfig");
    return {} as CatalogConfig;
  },
  async updateCatalogConfig(_patch) {
    // TODO: updateDoc(doc(db, `users/${uid}/catalog`, "config"), patch)
    notImpl("updateCatalogConfig");
    return {} as CatalogConfig;
  },

  // ─── KITS ─────────────────────────────────────────────
  async listKits(): Promise<Kit[]> {
    // TODO: getDocs(query(collection(db, `users/${uid}/kits`), where("active", "==", true)))
    notImpl("listKits");
    return [];
  },
  async getKit(_id) {
    // TODO: getDoc(doc(db, `users/${uid}/kits`, id))
    notImpl("getKit");
    return null;
  },
  async topKits(_limit = 3) {
    // TODO: agregar sales para gerar ranking, ou chamar Cloud Function
    notImpl("topKits");
    return [];
  },

  // ─── AVAILABILITY ─────────────────────────────────────
  async checkAvailability(
    _kitId: string,
    _tier: TierLevel,
    _eventDate: string,
  ): Promise<AvailabilityResult> {
    // TODO: chamar Cloud Function pública `checkAvailability`
    //       (combina estoque + bookings)
    notImpl("checkAvailability");
    return { available: false, missing: [] };
  },

  // ─── ORDERS ───────────────────────────────────────────
  async listOrders() {
    // TODO: getDocs(query(collection(db, `users/${uid}/orders`), orderBy("createdAt", "desc")))
    notImpl("listOrders");
    return [];
  },
  async getOrder(_id) {
    // TODO: getDoc(doc(db, `users/${uid}/orders`, id))
    notImpl("getOrder");
    return null;
  },
  async placeOrder(_input) {
    // TODO: addDoc(collection(db, `users/${uid}/orders`), { ...input, status: "enviado", createdAt: serverTimestamp() })
    notImpl("placeOrder");
    return {} as Order;
  },
  async updateOrderStatus(_id, _status: OrderStatus) {
    // TODO: updateDoc(doc(db, `users/${uid}/orders`, id), { status })
    notImpl("updateOrderStatus");
  },
  subscribeOrders(_cb): Unsubscribe {
    // TODO: onSnapshot(query(collection(db, `users/${uid}/orders`), orderBy("createdAt", "desc")), (snap) => cb(...))
    notImpl("subscribeOrders");
    return () => {};
  },
};
