// ============================================================
// CONTRATOS PÚBLICOS — domínio Pink Love (catálogo de festas)
// Todo componente consome via /services. Qualquer adapter
// (mock, Firebase, REST) DEVE implementar a interface abaixo.
// ============================================================

export type TierLevel = "bronze" | "prata" | "ouro";

export type BomComponent = {
  id: string;
  name: string;
  qty: number;
  unit?: string;     // "un", "m", "kit"
  emoji?: string;
};

export type Tier = {
  level: TierLevel;
  label: string;          // "Bronze", "Prata", "Ouro"
  emoji: string;          // "🥉" "🥈" "🥇"
  price: number;
  description: string;
  bom: BomComponent[];
  available: boolean;
};

export type KitType = "decoracao-montada" | "pegue-e-monte" | "locacao";

export type Extra = {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  description?: string;
};

export type Kit = {
  id: string;
  name: string;
  theme: string;          // "Princesa", "Safari"
  type: KitType;
  tagline: string;
  description: string;
  coverImage: string;     // URL da foto principal
  gallery: string[];      // thumbs
  frames360?: string[];   // opcional para o viewer 360
  accent: string;         // cor temática (hex)
  tiers: Tier[];
  extras: Extra[];
  rating: number;
  badges?: string[];      // ["Mais pedido"]
  active: boolean;
};

export type FreightOption = "ida" | "volta" | "ida-volta";

export type FreightConfig = {
  enabled: boolean;
  ida: number;
  volta: number;
  idaVolta: number;
  radiusKm: number;
};

export type SocialLinks = {
  whatsapp: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
};

export type CatalogConfig = {
  slug: string;
  businessName: string;
  tagline: string;
  logo?: string;
  coverPhoto?: string;
  primaryColor: string;       // hex
  backgroundColor: string;    // hex
  showPrices: boolean;
  showAvailability: boolean;
  freight: FreightConfig;
  social: SocialLinks;
  hiddenKitIds: string[];
  order: string[];            // ordem custom de kits
};

export type AvailabilityResult = {
  available: boolean;
  missing: { componentId: string; name: string; needed: number; have: number }[];
};

export type OrderExtra = { extraId: string; name: string; qty: number; unitPrice: number };

export type FreightSelection = {
  enabled: boolean;
  option?: FreightOption;
  price: number;
  address?: string;
};

export type Order = {
  id: string;
  code: string;
  createdAt: number;
  kitId: string;
  kitName: string;
  tier: TierLevel;
  tierLabel: string;
  tierPrice: number;
  eventDate: string;          // ISO yyyy-mm-dd
  extras: OrderExtra[];
  freight: FreightSelection;
  subtotal: number;
  total: number;
  status: OrderStatus;
  customer: { name?: string; phone?: string };
  notes?: string;
};

export type OrderStatus =
  | "rascunho"
  | "enviado"       // mandado via whatsapp
  | "confirmado"
  | "em-preparacao"
  | "entregue"
  | "cancelado";

export type Unsubscribe = () => void;

// ============================================================
// Interface única — TODOS os adapters implementam.
// Espelha o shape do Firestore (getDoc/getDocs/onSnapshot/addDoc).
// ============================================================
export interface DataAdapter {
  // Catalog config (white-label da decoradora)
  getCatalogConfig(slug?: string): Promise<CatalogConfig>;
  updateCatalogConfig(patch: Partial<CatalogConfig>): Promise<CatalogConfig>;

  // Kits
  listKits(): Promise<Kit[]>;
  getKit(id: string): Promise<Kit | null>;
  topKits(limit?: number): Promise<Kit[]>;

  // Availability (verifica estoque + agenda para a data)
  checkAvailability(kitId: string, tier: TierLevel, eventDate: string): Promise<AvailabilityResult>;

  // Orders / Solicitações
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  placeOrder(input: Omit<Order, "id" | "code" | "createdAt" | "status">): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
  subscribeOrders(cb: (orders: Order[]) => void): Unsubscribe;
}
