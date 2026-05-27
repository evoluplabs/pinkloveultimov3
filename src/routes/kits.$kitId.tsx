import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ImageIcon, RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Product360 } from "@/components/Product360";
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

export const Route = createFileRoute("/kits/$kitId")({
  head: ({ params }) => ({
    meta: [
      { title: `Kit ${params.kitId} — Pink Love` },
      { name: "description", content: "Detalhes do kit: tiers, BOM, disponibilidade e extras." },
    ],
  }),
  component: KitDetailPage,
});

function KitDetailPage() {
  const { kitId } = Route.useParams();
  const navigate = useNavigate();
  const { data: kit, isLoading } = useKit(kitId);
  const { data: config } = useCatalogConfig();
  const builder = useOrderBuilder(kit, config);
  const [view, setView] = useState<"foto" | "360">("foto");

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
          {/* GALERIA / 360 */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border">
              {view === "360" ? (
                <Product360
                  src={kit.coverImage}
                  alt={kit.name}
                  accent={kit.accent}
                  frames={kit.frames360}
                  className="absolute inset-0"
                />
              ) : (
                <motion.img
                  key={kit.coverImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={kit.coverImage}
                  alt={kit.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute top-3 right-3 flex gap-1 rounded-full bg-card/90 backdrop-blur border border-border p-1">
                <button
                  onClick={() => setView("foto")}
                  className={cn(
                    "px-3 h-8 rounded-full text-xs font-semibold inline-flex items-center gap-1.5",
                    view === "foto" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <ImageIcon className="h-3 w-3" /> Foto
                </button>
                <button
                  onClick={() => setView("360")}
                  className={cn(
                    "px-3 h-8 rounded-full text-xs font-semibold inline-flex items-center gap-1.5",
                    view === "360" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <RotateCw className="h-3 w-3" /> 360°
                </button>
              </div>
            </div>

            {kit.gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
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
      <Footer />
    </div>
  );
}

function CenterLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// noop reference to suppress unused warning for useStore (kept for parity with MHOUSE imports if needed later)
void useStore;
