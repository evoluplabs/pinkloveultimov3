import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { CheckCircle2, Clock, MessageCircle, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ordersService } from "@/services/orders.service";
import { useCatalogConfig } from "@/hooks/useCatalog";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/date";
import { whatsappService } from "@/services/whatsapp.service";

export const Route = createFileRoute("/pedido/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Pedido ${params.id} — Pink Love` },
      { name: "description", content: "Acompanhe o status do seu pedido." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.get(id),
  });
  const { data: config } = useCatalogConfig();

  if (isLoading) return null;
  if (!order || !config)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Pedido não encontrado</h1>
          <Link to="/" className="mt-4 inline-block text-primary font-semibold">Voltar ao início</Link>
        </div>
        <Footer />
      </div>
    );

  const waHref = whatsappService.buildLink(order, config.social.whatsapp, config.businessName);

  const STEPS = [
    { id: "enviado", label: "Enviado" },
    { id: "confirmado", label: "Confirmado" },
    { id: "em-preparacao", label: "Em preparação" },
    { id: "entregue", label: "Entregue" },
  ];
  const activeIx = Math.max(0, STEPS.findIndex((s) => s.id === order.status));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="inline-flex h-14 w-14 rounded-full bg-gradient-pink text-primary-foreground items-center justify-center shadow-petal">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Pedido recebido!</h1>
          <p className="mt-2 text-muted-foreground">
            Código <span className="font-mono text-foreground">{order.code}</span> ·
            criado em {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </motion.div>

        {/* timeline */}
        <div className="mt-10 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="text-center">
              <div className={`mx-auto h-8 w-8 rounded-full grid place-items-center ${i <= activeIx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < activeIx ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div className={`mt-2 text-[11px] uppercase tracking-widest ${i <= activeIx ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* resumo */}
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
                Pedido
              </div>
              <h2 className="font-display text-2xl">{order.kitName} — {order.tierLabel}</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-display text-3xl text-primary">{formatBRL(order.total)}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Data do evento: <span className="text-foreground font-medium">{formatDateBR(order.eventDate)}</span>
          </div>
          {order.freight.enabled && order.freight.address && (
            <div className="text-sm text-muted-foreground">
              Endereço: <span className="text-foreground">{order.freight.address}</span>
            </div>
          )}
        </div>

        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 w-full justify-center h-14 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal"
        >
          <MessageCircle className="h-5 w-5" /> Reabrir conversa no WhatsApp
        </a>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar ao catálogo</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
