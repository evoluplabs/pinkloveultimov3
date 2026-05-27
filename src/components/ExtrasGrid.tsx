import { Minus, Plus } from "lucide-react";
import type { Extra } from "@/data/types";
import { formatBRL } from "@/lib/money";

type Props = {
  extras: Extra[];
  values: Record<string, number>;
  onChange: (id: string, qty: number) => void;
};

export function ExtrasGrid({ extras, values, onChange }: Props) {
  if (!extras.length) return null;
  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
        · Acessórios extras ·
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {extras.map((e) => {
          const qty = values[e.id] ?? 0;
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3"
            >
              <div className="h-12 w-12 rounded-xl bg-accent grid place-items-center text-2xl shrink-0">
                {e.emoji ?? "✨"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight truncate">
                  {e.name}
                </div>
                <div className="text-xs text-primary font-medium">
                  {formatBRL(e.price)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onChange(e.id, Math.max(0, qty - 1))}
                  className="h-8 w-8 rounded-full border border-border grid place-items-center hover:border-primary/60 disabled:opacity-40"
                  disabled={qty <= 0}
                  aria-label="diminuir"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => onChange(e.id, qty + 1)}
                  className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center hover:brightness-110"
                  aria-label="aumentar"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
