// ImmersiveStage — palco 3D rotativo com os top kits.
// Drag-to-rotate, autoplay com prefers-reduced-motion respeitado, copy clara.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, Hand, Sparkles } from "lucide-react";
import { useTopKits } from "@/hooks/useCatalog";
import { formatBRL } from "@/lib/money";

export function ImmersiveStage() {
  const { data: kits } = useTopKits(5);
  const [idx, setIdx] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const reduceMotion = useReducedMotion();

  const drag = useRef<{ x: number; idx: number; id: number } | null>(null);

  useEffect(() => {
    if (!kits?.length || reduceMotion || interacted) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % kits.length), 6500);
    return () => clearInterval(t);
  }, [kits?.length, reduceMotion, interacted]);

  if (!kits?.length) return null;
  const active = kits[idx];
  const fromPrice = Math.min(...active.tiers.map((t) => t.price));

  const prev = () => {
    setInteracted(true);
    setIdx((i) => (i - 1 + kits.length) % kits.length);
  };
  const next = () => {
    setInteracted(true);
    setIdx((i) => (i + 1) % kits.length);
  };

  // ===== Drag-to-rotate =====
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, idx, id: e.pointerId };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    const step = Math.round(dx / 90);
    if (step !== 0) {
      setInteracted(true);
      setIdx((((drag.current.idx - step) % kits.length) + kits.length) % kits.length);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 90, damping: 18 };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-20 sm:py-28">
      <div
        className="absolute inset-0 opacity-60 pointer-events-none transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${active.accent}25, transparent 65%)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
            <Sparkles className="h-3 w-3" /> · Catálogo imersivo ·
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl text-balance leading-[1.05]">
            Entre na festa <span className="italic text-primary">antes</span> de marcar a data
          </h2>
          <p className="mt-4 text-muted-foreground">
            Arraste o palco pra girar, toque num cenário pra abrir em 360° e suba a foto do
            seu salão pra ver o kit instalado.
          </p>
        </div>

        <div
          className="relative perspective-deep touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="region"
          aria-label="Palco 3D de kits — arraste para girar"
        >
          <div className="relative h-[420px] sm:h-[520px] flex items-center justify-center select-none">
            {kits.map((k, i) => {
              const offset = (i - idx + kits.length) % kits.length;
              const rel = offset > kits.length / 2 ? offset - kits.length : offset;
              const isActive = rel === 0;
              const absRel = Math.abs(rel);
              return (
                <motion.button
                  key={k.id}
                  onClick={() => {
                    setInteracted(true);
                    setIdx(i);
                  }}
                  aria-label={`${k.name} — ${k.theme}`}
                  className="absolute top-1/2 left-1/2 will-change-transform"
                  initial={false}
                  animate={{
                    x: `calc(-50% + ${rel * 140}px)`,
                    y: "-50%",
                    rotateY: reduceMotion ? 0 : rel * -22,
                    scale: isActive ? 1 : 0.78 - absRel * 0.05,
                    opacity: absRel > 2 ? 0 : 1 - absRel * 0.18,
                    zIndex: 50 - absRel,
                  }}
                  transition={transition}
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
                      style={{
                        background: `radial-gradient(circle at 50% 25%, ${k.accent}55, transparent 70%)`,
                      }}
                    />
                    <img
                      src={k.coverImage}
                      alt={k.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={isActive ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">
                        {k.theme}
                      </div>
                      <div className="font-display text-xl mt-0.5">{k.name}</div>
                    </div>
                    {isActive && (
                      <div className="absolute top-3 right-3 px-2.5 h-7 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Tocar p/ abrir
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div
            className="mx-auto mt-6 h-12 w-3/4 rounded-[100%] blur-2xl opacity-50 transition-colors"
            style={{ background: active.accent }}
          />

          {!interacted && !reduceMotion && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 border border-border text-[10px] uppercase tracking-widest font-bold backdrop-blur">
              <Hand className="h-3 w-3 text-primary" /> arraste para girar o palco
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
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
          <button
            onClick={prev}
            className="h-11 w-11 rounded-full border border-border bg-card grid place-items-center hover:border-primary/50"
            aria-label="Kit anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {kits.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setInteracted(true);
                  setIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-8 bg-primary" : "w-1.5 bg-border"
                }`}
                aria-label={`Ir para kit ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="h-11 w-11 rounded-full border border-border bg-card grid place-items-center hover:border-primary/50"
            aria-label="Próximo kit"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
