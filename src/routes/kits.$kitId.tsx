import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { motion } from "motion/react";
import { ArrowLeft, Camera, ImageIcon, RotateCw, Upload, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Product360 } from "@/components/Product360";
import { VenueVisualizer } from "@/components/VenueVisualizer";
import { TierSelector } from "@/components/TierSelector";
import { BomList } from "@/components/BomList";
import { AvailabilityChecker } from "@/components/AvailabilityChecker";
import { ExtrasGrid } from "@/components/ExtrasGrid";
import { FreightSelector } from "@/components/FreightSelector";
import { OrderSummary } from "@/components/OrderSummary";
import { useKit, useCatalogConfig } from "@/hooks/useCatalog";
import { useOrderBuilder } from "@/hooks/useOrderBuilder";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type KitView = "foto" | "360" | "local";

export const Route = createFileRoute("/kits/$kitId")({
  head: ({ params }) => ({
    meta: [
      { title: `Kit ${params.kitId} — Pink Love` },
      { name: "description", content: "Detalhes do kit: tiers, BOM, disponibilidade e extras." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { view?: KitView } => {
    const v = s.view;
    return v === "foto" || v === "360" || v === "local" ? { view: v } : {};
  },
  component: KitDetailPage,
});

function KitDetailPage() {
  const { kitId } = Route.useParams();
  const { view: initialView } = Route.useSearch();
  const navigate = useNavigate();
  const { data: kit, isLoading } = useKit(kitId);
  const { data: config } = useCatalogConfig();
  const builder = useOrderBuilder(kit, config);
  const [view, setView] = useState<KitView>(initialView ?? "foto");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // libera object URL ao desmontar / trocar
  useEffect(() => {
    return () => {
      if (customPhoto?.startsWith("blob:")) URL.revokeObjectURL(customPhoto);
    };
  }, [customPhoto]);

  const onPickPhoto = (file?: File | null) => {
    if (!file) return;
    if (customPhoto?.startsWith("blob:")) URL.revokeObjectURL(customPhoto);
    setCustomPhoto(URL.createObjectURL(file));
  };

  if (isLoading) return <CenterLoader />;
  if (!kit || !config)
    return (
      <div className="min-h-screen grid place-items-center">
        <p>Kit não encontrado.</p>
      </div>
    );

  const startCheckout = () => {
    if (!builder.selectedTier || !builder.eventDate) return;
    // persiste rascunho em sessionStorage para o checkout reidratar
    sessionStorage.setItem(
      "pl_checkout_draft",
      JSON.stringify({
        kitId: kit.id,
        tier: builder.tier,
        eventDate: builder.eventDate,
        extras: builder.extras,
        freightEnabled: builder.freightEnabled,
        freightOption: builder.freightOption,
        freightCustomPrice: builder.freightCustomPrice,
        address: builder.address,
        notes: builder.notes,
      }),
    );
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate({ to: "/kits" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar aos kits
        </button>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          {/* GALERIA / 360 / VENUE */}
          <div>
            {view === "local" ? (
              <VenueVisualizer
                kitImage={customPhoto ?? kit.coverImage}
                kitName={kit.name}
                whatsappNumber={config.social.whatsapp}
                businessName={config.businessName}
                accent={kit.accent}
                orderSummary={{
                  tierLabel: builder.selectedTier?.label,
                  eventDate: builder.eventDate,
                  extras: builder.orderExtras.map((e) => ({
                    name: e.name,
                    qty: e.qty,
                    unitPrice: e.unitPrice,
                  })),
                  freightLabel: builder.freightEnabled
                    ? `Frete (${builder.freightOption.replace("-", " + ")})`
                    : undefined,
                  freightPrice: builder.freightPrice,
                  total: builder.total,
                }}
              />
            ) : (
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border">
                {view === "360" ? (
                  <Product360
                    kitName={kit.name}
                    theme={kit.theme}
                    accent={kit.accent}
                    photoSrc={customPhoto ?? kit.coverImage}
                    extras={kit.extras}
                    selectedExtraIds={kit.extras
                      .filter((e) => (builder.extras[e.id] ?? 0) > 0)
                      .map((e) => e.id)}
                    className="absolute inset-0"
                  />
                ) : (
                  <motion.img
                    key={customPhoto ?? kit.coverImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={customPhoto ?? kit.coverImage}
                    alt={kit.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <div className="flex gap-1 rounded-full bg-card border border-border p-1">
                <TabBtn active={view === "foto"} onClick={() => setView("foto")} icon={<ImageIcon className="h-3.5 w-3.5" />}>
                  Foto
                </TabBtn>
                <TabBtn active={view === "360"} onClick={() => setView("360")} icon={<RotateCw className="h-3.5 w-3.5" />}>
                  360°
                </TabBtn>
                <TabBtn active={view === "local"} onClick={() => setView("local")} icon={<Camera className="h-3.5 w-3.5" />}>
                  No seu local
                </TabBtn>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickPhoto(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-card hover:border-primary/50 text-xs font-semibold transition"
                title="Use uma foto real do kit (modo de teste)"
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                {customPhoto ? "Trocar foto" : "Testar foto real"}
              </button>
              {customPhoto && (
                <button
                  onClick={() => {
                    if (customPhoto.startsWith("blob:")) URL.revokeObjectURL(customPhoto);
                    setCustomPhoto(null);
                  }}
                  className="inline-flex items-center gap-1 h-9 px-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> remover
                </button>
              )}
            </div>

            {customPhoto && (
              <p className="mt-2 text-[11px] text-center text-muted-foreground">
                Modo de teste: a foto está sendo usada como textura no palco 3D e na pré-visualização no local.
              </p>
            )}


            {view !== "local" && kit.gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {kit.gallery.map((g, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border border-border"
                  >
                    <img src={g} alt={`${kit.name} foto ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO + BUILDER */}
          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">
                {kit.theme}
              </div>
              <h1 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">{kit.name}</h1>
              <p className="mt-3 text-muted-foreground">{kit.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Escolha o pacote</h3>
              <TierSelector
                tiers={kit.tiers}
                value={builder.tier}
                onChange={builder.setTier}
                showPrice={config.showPrices}
              />
            </div>

            {builder.selectedTier && <BomList items={builder.selectedTier.bom} />}

            {config.showAvailability && (
              <AvailabilityChecker
                kitId={kit.id}
                tier={builder.tier}
                eventDate={builder.eventDate}
                onChange={builder.setEventDate}
              />
            )}

            <ExtrasGrid
              extras={kit.extras}
              values={builder.extras}
              onChange={builder.setExtraQty}
            />

            <FreightSelector
              config={config}
              enabled={builder.freightEnabled}
              option={builder.freightOption}
              customPrice={builder.freightCustomPrice}
              address={builder.address}
              onToggle={builder.setFreightEnabled}
              onOption={builder.setFreightOption}
              onCustomPrice={builder.setFreightCustomPrice}
              onAddress={builder.setAddress}
              computedPrice={builder.freightPrice}
            />

            <OrderSummary
              kit={kit}
              tier={builder.selectedTier}
              eventDate={builder.eventDate}
              extras={builder.orderExtras}
              freightLabel={
                builder.freightEnabled
                  ? `Frete (${builder.freightOption.replace("-", " + ")})`
                  : undefined
              }
              freightPrice={builder.freightPrice}
              total={builder.total}
            />

            <button
              onClick={startCheckout}
              disabled={!builder.eventDate}
              className="w-full h-14 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal disabled:opacity-50 disabled:shadow-none transition"
            >
              Quero este kit →
            </button>
          </div>
        </div>
      </main>

      {/* Sticky CTA mobile */}
      <div className="lg:hidden sticky bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</div>
          <div className="font-display text-xl text-primary leading-none truncate">
            {builder.total > 0 ? `R$ ${builder.total.toFixed(2).replace(".", ",")}` : "Escolha o pacote"}
          </div>
        </div>
        <button
          onClick={startCheckout}
          disabled={!builder.eventDate}
          className="h-12 px-5 rounded-full bg-gradient-pink text-primary-foreground text-sm font-semibold shadow-petal disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
        >
          Quero este kit →
        </button>
      </div>

      <Footer />
    </div>
  );
}

function CenterLoader() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="h-5 w-32 rounded bg-secondary animate-pulse-soft mb-6" />
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div>
            <div className="aspect-square rounded-3xl bg-secondary animate-pulse-soft" />
            <div className="mt-3 h-9 w-64 rounded-full bg-secondary animate-pulse-soft mx-auto" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-secondary animate-pulse-soft" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-secondary animate-pulse-soft" />
            <div className="h-12 w-3/4 rounded bg-secondary animate-pulse-soft" />
            <div className="h-20 w-full rounded bg-secondary animate-pulse-soft" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-secondary animate-pulse-soft" />
              ))}
            </div>
            <div className="h-40 w-full rounded-2xl bg-secondary animate-pulse-soft" />
            <div className="h-14 w-full rounded-full bg-secondary animate-pulse-soft" />
          </div>
        </div>
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 h-9 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition",
        active ? "bg-primary text-primary-foreground shadow-petal" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// noop reference to suppress unused warning for useStore (kept for parity with MHOUSE imports if needed later)
void useStore;
