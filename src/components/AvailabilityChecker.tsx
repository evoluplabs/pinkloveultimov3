import { CalendarDays, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import type { TierLevel } from "@/data/types";
import { todayISO } from "@/lib/date";

type Props = {
  kitId: string;
  tier: TierLevel;
  eventDate: string;
  onChange: (iso: string) => void;
};

export function AvailabilityChecker({ kitId, tier, eventDate, onChange }: Props) {
  const { data, isFetching } = useAvailability(kitId, tier, eventDate);

  const renderStatus = () => {
    if (!eventDate)
      return (
        <p className="text-xs text-muted-foreground">
          Escolha uma data para checarmos a disponibilidade em tempo real.
        </p>
      );
    if (isFetching)
      return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> verificando estoque e agenda…
        </p>
      );
    if (!data) return null;
    if (data.available)
      return (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Disponível para esta data!
        </p>
      );
    return (
      <div className="text-sm">
        <p className="flex items-center gap-2 font-medium text-destructive">
          <AlertTriangle className="h-4 w-4" /> Indisponível
        </p>
        {data.missing.length > 0 && (
          <ul className="mt-1 text-xs text-muted-foreground">
            {data.missing.map((m) => (
              <li key={m.componentId}>• {m.name}</li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs text-muted-foreground">Tente outra data.</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        <CalendarDays className="h-3.5 w-3.5 text-primary" /> Data do evento
      </label>
      <input
        type="date"
        min={todayISO()}
        value={eventDate}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      />
      {renderStatus()}
    </div>
  );
}
