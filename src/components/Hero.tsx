import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useRef } from "react";
import type { CatalogConfig } from "@/data/types";

export function Hero({ config }: { config: CatalogConfig }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const wa = `https://wa.me/${config.social.whatsapp.replace(/\D/g, "")}`;

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={config.coverPhoto}
          alt={`${config.businessName} — capa`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-romance" />
        <div className="absolute inset-0 bg-gradient-veil" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-32 pb-24 sm:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3.5 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold">
            <Sparkles className="h-3 w-3" /> {config.businessName}
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] text-balance">
            {config.tagline.split(",")[0]}
            <span className="block text-primary italic">{config.tagline.split(",").slice(1).join(",").trim() || "do seu jeito"}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base sm:text-lg text-muted-foreground">
            Cada kit é montado com carinho, atenção aos detalhes e disponibilidade
            verificada em tempo real para a data do seu evento.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              to="/kits"
              className="inline-flex items-center gap-2 h-13 px-7 py-4 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal hover:brightness-110 transition"
            >
              Ver nossos kits <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-13 px-7 py-4 rounded-full border border-border bg-card/80 backdrop-blur font-semibold hover:border-primary/60 transition"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
