import { motion } from "motion/react";
import type { BomComponent } from "@/data/types";

export function BomList({ items }: { items: BomComponent[] }) {
  return (
    <div className="rounded-2xl bg-secondary/60 border border-border p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-3">
        · O que vem no pacote ·
      </div>
      <motion.ul
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
        className="space-y-2"
      >
        {items.map((c) => (
          <motion.li
            key={c.id}
            variants={{
              hidden: { opacity: 0, x: -8 },
              show: { opacity: 1, x: 0 },
            }}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{c.emoji ?? "•"}</span>
              {c.name}
            </span>
            <span className="text-muted-foreground font-medium">
              {c.qty} {c.unit ?? ""}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
