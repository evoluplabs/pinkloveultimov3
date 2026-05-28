import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useKits } from "@/hooks/useCatalog";
import { KitCard } from "./KitCard";
import { cn } from "@/lib/utils";
import type { KitType } from "@/data/types";

const FILTERS: { id: "all" | KitType; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "decoracao-montada", label: "Decoração montada" },
  { id: "pegue-e-monte", label: "Pegue & monte" },
  { id: "locacao", label: "Locação" },
];

export function KitsGrid() {
  const { data: kits, isLoading } = useKits();
  const [filter, setFilter] = useState<"all" | KitType>("all");

  const filtered = useMemo(() => {
    if (!kits) return [];
    if (filter === "all") return kits;
    return kits.filter((k) => k.type === filter);
  }, [kits, filter]);

  return (
    <section id="kits" className="relative py-20 sm:py-24 bg-secondary/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
              · Nossos kits ·
            </span>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl text-balance">
              Cada kit, uma história diferente
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-4 h-9 rounded-full border transition",
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary shadow-petal"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-secondary animate-pulse-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nenhum kit nesta categoria por enquanto.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <KitCard kit={k} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
