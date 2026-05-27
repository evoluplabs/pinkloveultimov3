import type { Kit, Tier, OrderExtra } from "@/data/types";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/date";

type Props = {
  kit: Kit;
  tier: Tier | undefined;
  eventDate: string;
  extras: OrderExtra[];
  freightLabel?: string;
  freightPrice: number;
  total: number;
};

export function OrderSummary({
  kit, tier, eventDate, extras, freightLabel, freightPrice, total,
}: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-petal">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
          Resumo do pedido
        </div>
        <h3 className="font-display text-2xl mt-1">{kit.name}</h3>
        {tier && (
          <div className="text-sm text-muted-foreground">
            {tier.emoji} {tier.label}
          </div>
        )}
      </div>

      <div className="text-sm space-y-2">
        <Row label={eventDate ? `Data: ${formatDateBR(eventDate)}` : "Data: a definir"} value="" />
        {tier && <Row label={tier.label} value={formatBRL(tier.price)} />}
        {extras.map((e) => (
          <Row
            key={e.extraId}
            label={`${e.name} × ${e.qty}`}
            value={formatBRL(e.qty * e.unitPrice)}
          />
        ))}
        {freightPrice > 0 && (
          <Row label={freightLabel ?? "Frete"} value={formatBRL(freightPrice)} />
        )}
      </div>

      <div className="border-t border-border pt-4 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Total estimado
        </span>
        <span className="font-display text-3xl text-primary">
          {formatBRL(total)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-foreground/80">{label}</span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </div>
  );
}
