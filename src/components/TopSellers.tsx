import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useTopKits } from "@/hooks/useCatalog";
import { KitCard } from "./KitCard";

export function TopSellers() {
  const { data: kits, isLoading } = useTopKits(4);

  if (isLoading) return <SkeletonRow />;
  if (!kits?.length) return null;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between flex-wrap gap-4 mb-8"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
              <Sparkles className="h-3 w-3" /> · Mais pedidos ·
            </span>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl text-balance">
              Quem encantou as últimas festas
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Curadoria automática dos kits com maior procura nesse trimestre.
          </p>
        </motion.div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {kits.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="snap-center shrink-0 w-[78%] sm:w-auto"
            >
              <KitCard kit={k} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonRow() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-3xl bg-secondary animate-pulse-soft" />
        ))}
      </div>
    </section>
  );
}
