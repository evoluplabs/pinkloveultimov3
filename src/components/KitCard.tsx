// KitCard — card com mini-viewer 360 interativo (lazy-mount no hover/touch).
// Estilo MHOUSE: imersão direta no catálogo antes de abrir o detalhe.

import { useRef, useState, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { RotateCw, Sparkles, Star, X } from "lucide-react";
import type { Kit } from "@/data/types";
import { formatBRL } from "@/lib/money";

// Lazy: só baixa three.js quando o usuário pede o 360
const Product360 = lazy(() =>
  import("./Product360").then((m) => ({ default: m.Product360 })),
);

const TYPE_LABEL: Record<Kit["type"], string> = {
  "decoracao-montada": "Decoração montada",
  "pegue-e-monte": "Pegue & monte",
  "locacao": "Locação",
};

export function KitCard({ kit, showPrice = true }: { kit: Kit; showPrice?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [show360, setShow360] = useState(false);

  const fromPrice = Math.min(...kit.tiers.map((t) => t.price));

  const onMove = (e: React.MouseEvent) => {
    if (show360) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: x * 8, y: -y * 8 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="group relative block rounded-3xl overflow-hidden bg-card border border-border shadow-card hover:shadow-petal transition-shadow"
      style={{
        transform: show360
          ? "none"
          : `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: "transform 200ms ease-out",
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 30%, ${kit.accent}55, transparent 65%)` }}
        />

        {/* Mini viewer 360 — lazy-mount, com touch/drag interno */}
        {show360 ? (
          <div className="absolute inset-0 bg-secondary">
            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              }
            >
              <Product360
                kitName={kit.name}
                theme={kit.theme}
                accent={kit.accent}
                photoSrc={kit.coverImage}
                compact
                className="absolute inset-0"
              />
            </Suspense>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow360(false);
              }}
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-card/90 border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground transition"
              aria-label="Fechar 360"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/kits/$kitId"
            params={{ kitId: kit.id }}
            className="absolute inset-0 block"
            aria-label={`Ver detalhes do ${kit.name}`}
          >
            <img
              src={kit.coverImage}
              alt={kit.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/85 to-transparent" />
          </Link>
        )}

        {!show360 && kit.badges?.[0] && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-widest font-bold pointer-events-none">
            <Sparkles className="h-3 w-3" /> {kit.badges[0]}
          </div>
        )}
        {!show360 && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/85 backdrop-blur px-2.5 py-1 text-xs font-semibold border border-border pointer-events-none">
            <Star className="h-3 w-3 fill-primary text-primary" /> {kit.rating.toFixed(1)}
          </div>
        )}

        {/* CTA 360 — único elemento que ativa o viewer dentro do card */}
        {!show360 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShow360(true);
            }}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-petal hover:brightness-110 transition"
          >
            <RotateCw className="h-3.5 w-3.5" /> 360°
          </button>
        )}
      </div>

      <Link
        to="/kits/$kitId"
        params={{ kitId: kit.id }}
        className="relative -mt-12 p-5 space-y-2 block"
      >
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
      </Link>

      <motion.div
        initial={false}
        animate={{ opacity: !show360 && tilt.x !== 0 ? 0.5 : 0 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}
