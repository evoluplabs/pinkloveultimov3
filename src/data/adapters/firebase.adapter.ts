// ============================================================
// FIREBASE ADAPTER — implementação completa com Firestore.
//
// Estrutura de coleções (multi-tenant por slug → userId):
//   slugs/{slug}                      → { userId }
//   users/{uid}/catalog/config        → CatalogConfig (doc único)
//   users/{uid}/kits/{kitId}          → Kit
//   users/{uid}/bookings/{bookingId}  → { kitId, eventDate, ... }
//   users/{uid}/orders/{orderId}      → Order
//
// Para ativar:
//   1. bun add firebase
//   2. Preencha .env.local com VITE_FB_* (veja .env.example)
//   3. No .env.local: VITE_DATA_SOURCE=firebase
//   4. Em dev: VITE_CATALOG_SLUG=seuslug
// ============================================================

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/data/firebase";
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

// ─── Slug → userId (cached por sessão) ───────────────────────

let _userId: string | null = null;

function detectSlug(): string {
  // Dev: var explícita tem prioridade
  const envSlug = import.meta.env.VITE_CATALOG_SLUG;
  if (envSlug) return envSlug;
  // Prod: primeiro segmento do subdomínio (ex: "loja" em "loja.pinklove.app")
  if (typeof window !== "undefined") {
    const parts = window.location.hostname.split(".");
    if (parts.length >= 2 && parts[0] !== "www") return parts[0];
  }
  return "demo";
}

async function resolveUserId(): Promise<string> {
  if (_userId) return _userId;
  const slug = detectSlug();
  const slugSnap = await getDoc(doc(db, "slugs", slug));
  if (!slugSnap.exists()) {
    throw new Error(`[firebaseAdapter] Catálogo "${slug}" não encontrado no Firestore.`);
  }
  _userId = (slugSnap.data() as { userId: string }).userId;
  return _userId;
}

// ─── Helpers de referência ────────────────────────────────────

const userCol = (uid: string, ...path: string[]) =>
  collection(db, "users", uid, ...path);

const userDoc = (uid: string, ...path: string[]) =>
  doc(db, "users", uid, ...path);

// ─── Mappers Firestore → TypeScript ───────────────────────────

function mapConfig(data: DocumentData): CatalogConfig {
  return {
    slug:            data.slug            ?? "",
    businessName:    data.businessName    ?? "",
    tagline:         data.tagline         ?? "",
    logo:            data.logo,
    coverPhoto:      data.coverPhoto,
    primaryColor:    data.primaryColor    ?? "#e879a0",
    backgroundColor: data.backgroundColor ?? "#fdfaf9",
    showPrices:      data.showPrices      ?? true,
    showAvailability:data.showAvailability ?? true,
    freight: {
      enabled:  data.freight?.enabled  ?? false,
      ida:      data.freight?.ida      ?? 0,
      volta:    data.freight?.volta    ?? 0,
      idaVolta: data.freight?.idaVolta ?? 0,
      radiusKm: data.freight?.radiusKm ?? 0,
    },
    social: {
      whatsapp:  data.social?.whatsapp  ?? "",
      instagram: data.social?.instagram,
      tiktok:    data.social?.tiktok,
      email:     data.social?.email,
    },
    hiddenKitIds: data.hiddenKitIds ?? [],
    order:        data.order        ?? [],
  };
}

function mapKit(id: string, data: DocumentData): Kit {
  return {
    id,
    name:        data.name        ?? "",
    theme:       data.theme       ?? "",
    type:        data.type        ?? "decoracao-montada",
    tagline:     data.tagline     ?? "",
    description: data.description ?? "",
    coverImage:  data.coverImage  ?? "",
    gallery:     data.gallery     ?? [],
    frames360:   data.frames360,
    accent:      data.accent      ?? "#e879a0",
    tiers:       data.tiers       ?? [],
    extras:      data.extras      ?? [],
    rating:      data.rating      ?? 0,
    badges:      data.badges,
    active:      data.active      ?? true,
  };
}

function mapOrder(id: string, data: DocumentData): Order {
  return {
    id,
    code:       data.code       ?? "",
    // Firestore Timestamp → ms; número bruto caso já seja ms
    createdAt:  data.createdAt?.toMillis?.() ?? (data.createdAt as number) ?? Date.now(),
    kitId:      data.kitId      ?? "",
    kitName:    data.kitName    ?? "",
    tier:       data.tier       ?? "bronze",
    tierLabel:  data.tierLabel  ?? "",
    tierPrice:  data.tierPrice  ?? 0,
    eventDate:  data.eventDate  ?? "",
    extras:     data.extras     ?? [],
    freight:    data.freight    ?? { enabled: false, price: 0 },
    subtotal:   data.subtotal   ?? 0,
    total:      data.total      ?? 0,
    status:     data.status     ?? "rascunho",
    customer:   data.customer   ?? {},
    notes:      data.notes,
  };
}

const genCode = () => "PL-" + Math.random().toString(36).slice(2, 7).toUpperCase();

// ─── Adapter ──────────────────────────────────────────────────

export const firebaseAdapter: DataAdapter = {
  // ─── CATALOG CONFIG ──────────────────────────────────────
  async getCatalogConfig(_slug?: string): Promise<CatalogConfig> {
    const uid  = await resolveUserId();
    const snap = await getDoc(userDoc(uid, "catalog", "config"));
    if (!snap.exists()) throw new Error("[firebaseAdapter] Config do catálogo não encontrada.");
    return mapConfig(snap.data());
  },

  async updateCatalogConfig(patch): Promise<CatalogConfig> {
    const uid = await resolveUserId();
    const ref = userDoc(uid, "catalog", "config");
    await updateDoc(ref, patch as DocumentData);
    const snap = await getDoc(ref);
    return mapConfig(snap.data()!);
  },

  // ─── KITS ────────────────────────────────────────────────
  async listKits(): Promise<Kit[]> {
    const uid = await resolveUserId();

    const [kitsSnap, configSnap] = await Promise.all([
      getDocs(query(userCol(uid, "kits"), where("active", "==", true))),
      getDoc(userDoc(uid, "catalog", "config")),
    ]);

    const config   = configSnap.exists() ? mapConfig(configSnap.data()) : null;
    const hidden   = new Set(config?.hiddenKitIds ?? []);
    const order    = config?.order ?? [];

    let kits = kitsSnap.docs
      .map((d) => mapKit(d.id, d.data()))
      .filter((k) => !hidden.has(k.id));

    if (order.length) {
      const rank = (id: string) => { const i = order.indexOf(id); return i === -1 ? 999 : i; };
      kits.sort((a, b) => rank(a.id) - rank(b.id));
    }

    return kits;
  },

  async getKit(id): Promise<Kit | null> {
    const uid  = await resolveUserId();
    const snap = await getDoc(userDoc(uid, "kits", id));
    if (!snap.exists()) return null;
    return mapKit(snap.id, snap.data());
  },

  async topKits(limit = 3): Promise<Kit[]> {
    const uid  = await resolveUserId();
    const snap = await getDocs(query(userCol(uid, "kits"), where("active", "==", true)));
    return snap.docs
      .map((d) => mapKit(d.id, d.data()))
      // Ordena por salesCount (mantido pelo pink-love-gestao) e desempata pelo rating
      .sort((a, b) => {
        const sA = (a as Kit & { salesCount?: number }).salesCount ?? 0;
        const sB = (b as Kit & { salesCount?: number }).salesCount ?? 0;
        return sB !== sA ? sB - sA : b.rating - a.rating;
      })
      .slice(0, limit);
  },

  // ─── AVAILABILITY ────────────────────────────────────────
  async checkAvailability(
    kitId: string,
    tier: TierLevel,
    eventDate: string,
  ): Promise<AvailabilityResult> {
    const uid = await resolveUserId();

    // 1) Verificar flag tier.available no kit
    const kitSnap = await getDoc(userDoc(uid, "kits", kitId));
    if (!kitSnap.exists()) {
      return { available: false, missing: [{ componentId: "kit", name: "Kit não encontrado", needed: 1, have: 0 }] };
    }
    const kit      = mapKit(kitSnap.id, kitSnap.data());
    const tierData = kit.tiers.find((t) => t.level === tier);
    if (!tierData?.available) {
      return { available: false, missing: [{ componentId: "tier", name: `Pacote ${tier} indisponível`, needed: 1, have: 0 }] };
    }

    // 2) Verificar bookings ativos para kitId + data
    const bookSnap = await getDocs(
      query(
        userCol(uid, "bookings"),
        where("kitId",     "==", kitId),
        where("eventDate", "==", eventDate),
      ),
    );
    if (!bookSnap.empty) {
      return { available: false, missing: [{ componentId: "date", name: "Data já reservada", needed: 1, have: 0 }] };
    }

    return { available: true, missing: [] };
  },

  // ─── ORDERS ──────────────────────────────────────────────
  async listOrders(): Promise<Order[]> {
    const uid  = await resolveUserId();
    const snap = await getDocs(query(userCol(uid, "orders"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => mapOrder(d.id, d.data()));
  },

  async getOrder(id): Promise<Order | null> {
    const uid  = await resolveUserId();
    const snap = await getDoc(userDoc(uid, "orders", id));
    if (!snap.exists()) return null;
    return mapOrder(snap.id, snap.data());
  },

  async placeOrder(input): Promise<Order> {
    const uid  = await resolveUserId();
    const code = genCode();
    const ref  = await addDoc(userCol(uid, "orders"), {
      ...input,
      code,
      status:    "enviado" satisfies OrderStatus,
      createdAt: serverTimestamp(),
    });
    // Retorna com timestamp local enquanto o Firestore processa o serverTimestamp
    return { ...input, id: ref.id, code, createdAt: Date.now(), status: "enviado" };
  },

  async updateOrderStatus(id, status): Promise<void> {
    const uid = await resolveUserId();
    await updateDoc(userDoc(uid, "orders", id), { status });
  },

  subscribeOrders(cb): Unsubscribe {
    let firestoreUnsub: (() => void) | null = null;

    resolveUserId().then((uid) => {
      firestoreUnsub = onSnapshot(
        query(userCol(uid, "orders"), orderBy("createdAt", "desc")),
        (snap) => cb(snap.docs.map((d) => mapOrder(d.id, d.data()))),
        (err) => console.error("[firebaseAdapter] subscribeOrders:", err),
      );
    }).catch((err) => console.error("[firebaseAdapter] resolveUserId:", err));

    return () => firestoreUnsub?.();
  },
};
