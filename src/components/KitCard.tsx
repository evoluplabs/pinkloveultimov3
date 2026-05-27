// KitCard — card 3D com mouse-tracking. Sem dado direto: recebe Kit por props.

import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, Star } from "lucide-react";
import type { Kit } from "@/data/types";
import { formatBRL } from "@/lib/money";

const TYPE_LABEL: Record<Kit["type"], string> = {
  "decoracao-montada": "Decoração montada",
  "pegue-e-monte": "Pegue & monte",
  "locacao": "Locação",
};

export function KitCard({ kit, showPrice = true }: { kit: Kit; showPrice?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const fromPrice = Math.min(...kit.tiers.map((t) => t.price));

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <Link
      ref={ref}
      to="/kits/$kitId"
      params={{ kitId: kit.id }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="group relative block rounded-3xl overflow-hidden bg-card border border-border shadow-card hover:shadow-petal transition-shadow preserve-3d"
      style={{
        transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: "transform 200ms ease-out",
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: `radial-gradient(circle at 50% 30%, ${kit.accent}55, transparent 65%)` }}
        />
        <img
          src={kit.coverImage}
          alt={kit.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/85 to-transparent" />
        {kit.badges?.[0] && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
            <Sparkles className="h-3 w-3" /> {kit.badges[0]}
          </div>
        )}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/85 backdrop-blur px-2.5 py-1 text-xs font-semibold border border-border">
          <Star className="h-3 w-3 fill-primary text-primary" /> {kit.rating.toFixed(1)}
        </div>
      </div>

      <div className="relative -mt-12 p-5 space-y-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {TYPE_LABEL[kit.type]}
        </div>
        <h3 className="font-display text-2xl leading-tight">{kit.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{kit.tagline}</p>

        <div className="pt-3 flex items-end justify-between border-t border-border mt-3">
          <div className="flex gap-1.5">
            {kit.tiers.map((t) => (
              <span
                key={t.level}
                className="text-base"
                title={`${t.label} ${formatBRL(t.price)}`}
              >
                {t.emoji}
              </span>
            ))}
          </div>
          {showPrice && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">a partir de</div>
              <div className="font-display text-2xl text-primary leading-none">{formatBRL(fromPrice)}</div>
            </div>
          )}
        </div>
      </div>
      <motion.div
        initial={false}
        animate={{ opacity: tilt.x === 0 ? 0 : 0.5 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
      />
    </Link>
  );
}
