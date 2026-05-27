// ImmersiveStage — palco 3D rotativo com os top kits, depth + parallax.
// CSS 3D + framer-motion. Pensado para a home.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, Sparkles } from "lucide-react";
import { useTopKits } from "@/hooks/useCatalog";
import { formatBRL } from "@/lib/money";

export function ImmersiveStage() {
  const { data: kits } = useTopKits(5);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!kits?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % kits.length), 6500);
    return () => clearInterval(t);
  }, [kits?.length]);

  if (!kits?.length) return null;
  const active = kits[idx];
  const fromPrice = Math.min(...active.tiers.map((t) => t.price));

  const prev = () => setIdx((i) => (i - 1 + kits.length) % kits.length);
  const next = () => setIdx((i) => (i + 1) % kits.length);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-20 sm:py-28">
      <div className="absolute inset-0 opacity-60 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${active.accent}25, transparent 65%)` }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
            <Sparkles className="h-3 w-3" /> · Catálogo imersivo ·
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance leading-[1.05]">
            Entre na festa <span className="italic text-primary">antes</span> de marcar a data
          </h2>
          <p className="mt-4 text-muted-foreground">
            Navegue os cenários em 360°, gire o pacote no espaço e visualize como ele fica no seu salão.
          </p>
        </div>

        <div className="relative perspective-deep">
          <div className="relative h-[420px] sm:h-[520px] flex items-center justify-center">
            {kits.map((k, i) => {
              const offset = ((i - idx + kits.length) % kits.length);
              // distribute around stage
              const rel = offset > kits.length / 2 ? offset - kits.length : offset;
              const isActive = rel === 0;
              const absRel = Math.abs(rel);
              return (
                <motion.button
                  key={k.id}
                  onClick={() => setIdx(i)}
                  aria-label={k.name}
                  className="absolute top-1/2 left-1/2 will-change-transform preserve-3d"
                  initial={false}
                  animate={{
                    x: `calc(-50% + ${rel * 140}px)`,
                    y: "-50%",
                    rotateY: rel * -22,
                    scale: isActive ? 1 : 0.78 - absRel * 0.05,
                    opacity: absRel > 2 ? 0 : 1 - absRel * 0.18,
                    zIndex: 50 - absRel,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 18 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="relative rounded-[2rem] overflow-hidden border border-border shadow-soft w-[260px] sm:w-[340px] aspect-[3/4] bg-card"
                    style={{
                      boxShadow: isActive
                        ? `0 40px 80px -25px ${k.accent}aa, 0 20px 40px -25px rgba(0,0,0,0.4)`
                        : undefined,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: `radial-gradient(circle at 50% 25%, ${k.accent}55, transparent 70%)` }}
                    />
                    <img src={k.coverImage} alt={k.name} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">
                        {k.theme}
                      </div>
                      <div className="font-display text-xl mt-0.5">{k.name}</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* glow floor */}
          <div className="mx-auto mt-6 h-12 w-3/4 rounded-[100%] blur-2xl opacity-50"
            style={{ background: active.accent }} />
        </div>

        {/* Active info card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-8 mx-auto max-w-2xl text-center"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {String(idx + 1).padStart(2, "0")} / {String(kits.length).padStart(2, "0")}
            </div>
            <h3 className="mt-2 font-display text-3xl sm:text-4xl">{active.name}</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">{active.tagline}</p>
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/kits/$kitId"
                params={{ kitId: active.id }}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal hover:brightness-110"
              >
                <Eye className="h-4 w-4" /> Explorar em 360° · a partir de {formatBRL(fromPrice)}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={prev} className="h-11 w-11 rounded-full border border-border bg-card grid place-items-center hover:border-primary/50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {kits.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
                aria-label={`kit ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="h-11 w-11 rounded-full border border-border bg-card grid place-items-center hover:border-primary/50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
