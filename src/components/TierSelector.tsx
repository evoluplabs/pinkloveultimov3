import type { Tier, TierLevel } from "@/data/types";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  tiers: Tier[];
  value: TierLevel;
  onChange: (level: TierLevel) => void;
  showPrice?: boolean;
};

const ACCENT: Record<TierLevel, string> = {
  bronze: "from-amber-700/15 to-amber-500/5 border-amber-700/30",
  prata: "from-slate-400/15 to-slate-200/5 border-slate-400/30",
  ouro: "from-yellow-500/20 to-yellow-300/5 border-yellow-500/40",
};

export function TierSelector({ tiers, value, onChange, showPrice = true }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {tiers.map((t) => {
        const selected = t.level === value;
        return (
          <button
            key={t.level}
            disabled={!t.available}
            onClick={() => onChange(t.level)}
            className={cn(
              "relative rounded-2xl border-2 bg-gradient-to-br p-4 text-left transition-all",
              ACCENT[t.level],
              selected
                ? "border-primary ring-2 ring-primary/30 shadow-petal scale-[1.02]"
                : "border-border hover:border-primary/40",
              !t.available && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-display text-lg">{t.label}</span>
            </div>
            {showPrice && (
              <div className="mt-2 font-display text-xl text-primary">
                {formatBRL(t.price)}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {t.description}
            </p>
            {!t.available && (
              <div className="absolute top-2 right-2 text-[10px] uppercase font-bold text-destructive bg-card px-2 py-0.5 rounded-full">
                esgotado
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
