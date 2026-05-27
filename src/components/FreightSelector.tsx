import { Truck, ArrowLeftRight, ArrowRight, ArrowLeft } from "lucide-react";
import type { CatalogConfig, FreightOption } from "@/data/types";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  config: CatalogConfig;
  enabled: boolean;
  option: FreightOption;
  customPrice: number | null;
  address: string;
  onToggle: (v: boolean) => void;
  onOption: (o: FreightOption) => void;
  onCustomPrice: (v: number | null) => void;
  onAddress: (v: string) => void;
  computedPrice: number;
};

export function FreightSelector({
  config, enabled, option, customPrice, address,
  onToggle, onOption, onCustomPrice, onAddress, computedPrice,
}: Props) {
  if (!config.freight.enabled) return null;

  const OPTIONS: { id: FreightOption; label: string; icon: typeof Truck; price: number }[] = [
    { id: "ida", label: "Só ida", icon: ArrowRight, price: config.freight.ida },
    { id: "volta", label: "Só volta", icon: ArrowLeft, price: config.freight.volta },
    { id: "ida-volta", label: "Ida + volta", icon: ArrowLeftRight, price: config.freight.idaVolta },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="flex items-center gap-2 font-semibold">
          <Truck className="h-4 w-4 text-primary" />
          Frete (montagem / retirada)
        </span>
        <span className="relative inline-flex h-6 w-11">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <span className="inline-block h-6 w-11 rounded-full bg-secondary peer-checked:bg-primary transition" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition peer-checked:translate-x-5" />
        </span>
      </label>

      {enabled && (
        <div className="space-y-3 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => { onOption(o.id); onCustomPrice(null); }}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition",
                  o.id === option
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/40",
                )}
              >
                <o.icon className="h-4 w-4 text-primary mb-1.5" />
                <div className="text-xs font-bold">{o.label}</div>
                <div className="text-xs text-muted-foreground">{formatBRL(o.price)}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Valor do frete (editável)
            </label>
            <input
              type="number"
              min={0}
              value={customPrice ?? computedPrice}
              onChange={(e) => onCustomPrice(Number(e.target.value) || 0)}
              className="mt-1 w-full h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Endereço de entrega
            </label>
            <input
              type="text"
              placeholder="Rua, número, bairro, cidade"
              value={address}
              onChange={(e) => onAddress(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Atendemos em raio de {config.freight.radiusKm} km
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
