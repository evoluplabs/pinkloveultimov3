import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderSummary } from "@/components/OrderSummary";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useCatalogConfig, useKit } from "@/hooks/useCatalog";
import { useOrderBuilder } from "@/hooks/useOrderBuilder";
import { ordersService } from "@/services/orders.service";
import { whatsappService } from "@/services/whatsapp.service";
import type { TierLevel } from "@/data/types";

type Draft = {
  kitId: string;
  tier: TierLevel;
  eventDate: string;
  extras: Record<string, number>;
  freightEnabled: boolean;
  freightOption: "ida" | "volta" | "ida-volta";
  freightCustomPrice: number | null;
  address: string;
  notes: string;
};

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Pink Love" },
      { name: "description", content: "Revise seu pedido e envie pelo WhatsApp." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("pl_checkout_draft");
    if (raw) setDraft(JSON.parse(raw) as Draft);
  }, []);

  const { data: kit } = useKit(draft?.kitId ?? "");
  const { data: config } = useCatalogConfig();
  const builder = useOrderBuilder(kit, config);

  // re-hidrata o builder
  useEffect(() => {
    if (!draft || !kit) return;
    builder.setTier(draft.tier);
    builder.setEventDate(draft.eventDate);
    Object.entries(draft.extras).forEach(([id, qty]) => builder.setExtraQty(id, qty));
    builder.setFreightEnabled(draft.freightEnabled);
    builder.setFreightOption(draft.freightOption);
    builder.setFreightCustomPrice(draft.freightCustomPrice);
    builder.setAddress(draft.address);
    builder.setNotes(draft.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, kit?.id]);

  if (!draft) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Nenhum pedido em rascunho</h1>
          <p className="mt-3 text-muted-foreground">Escolha um kit para começar.</p>
          <Link
            to="/kits"
            className="inline-flex mt-6 items-center justify-center h-12 px-6 rounded-full bg-gradient-pink text-primary-foreground font-semibold"
          >
            Ver kits
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!kit || !config) return null;

  const handleSubmit = async () => {
    if (!builder.selectedTier) return;
    const order = await ordersService.place({
      kitId: kit.id,
      kitName: kit.name,
      tier: builder.tier,
      tierLabel: builder.selectedTier.label,
      tierPrice: builder.selectedTier.price,
      eventDate: builder.eventDate,
      extras: builder.orderExtras,
      freight: {
        enabled: builder.freightEnabled,
        option: builder.freightEnabled ? builder.freightOption : undefined,
        price: builder.freightPrice,
        address: builder.address,
      },
      subtotal: builder.subtotal,
      total: builder.total,
      customer: { name, phone },
      notes: builder.notes,
    });
    sessionStorage.removeItem("pl_checkout_draft");
    navigate({ to: "/pedido/$id", params: { id: order.id } });
  };

  const previewOrder = {
    id: "preview",
    code: "PREVIEW",
    createdAt: Date.now(),
    kitId: kit.id,
    kitName: kit.name,
    tier: builder.tier,
    tierLabel: builder.selectedTier?.label ?? "",
    tierPrice: builder.selectedTier?.price ?? 0,
    eventDate: builder.eventDate,
    extras: builder.orderExtras,
    freight: {
      enabled: builder.freightEnabled,
      option: builder.freightEnabled ? builder.freightOption : undefined,
      price: builder.freightPrice,
      address: builder.address,
    },
    subtotal: builder.subtotal,
    total: builder.total,
    status: "rascunho" as const,
    customer: { name, phone },
    notes: builder.notes,
  };
  const waHref = whatsappService.buildLink(previewOrder, config.social.whatsapp, config.businessName);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate({ to: "/kits/$kitId", params: { kitId: kit.id } })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao kit
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl text-balance"
        >
          Finalize o seu orçamento
        </motion.h1>
        <p className="mt-2 text-muted-foreground max-w-lg">
          Confira o resumo e envie pelo WhatsApp. Você fala direto com a decoradora.
        </p>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          <div className="space-y-4">
            <h2 className="font-display text-2xl">Seus dados</h2>
            <Field label="Seu nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Como podemos te chamar?"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field label="Observações (opcional)">
              <textarea
                value={builder.notes}
                onChange={(e) => builder.setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Alguma personalização ou pedido especial?"
              />
            </Field>
          </div>

          <div className="space-y-4">
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
            <WhatsAppButton
              href={waHref}
              label="Enviar pedido pelo WhatsApp"
              onClick={handleSubmit}
            />
            <p className="text-center text-xs text-muted-foreground inline-flex items-center gap-1.5 justify-center w-full">
              <MessageCircle className="h-3 w-3" /> O WhatsApp abre com a mensagem pronta
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
