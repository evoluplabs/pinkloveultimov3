import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, MessageCircle, RotateCw, Sparkles } from "lucide-react";
import { useRef } from "react";
import type { CatalogConfig } from "@/data/types";

export function Hero({ config }: { config: CatalogConfig }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const wa = `https://wa.me/${config.social.whatsapp.replace(/\D/g, "")}`;

  const [first, ...rest] = config.tagline.split(",");
  const second = rest.join(",").trim() || "do seu jeito";

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={config.coverPhoto}
          alt={`${config.businessName} — capa`}
          className="h-full w-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-romance" />
        <div className="absolute inset-0 bg-gradient-veil" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-32 pb-28 sm:pb-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3.5 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold">
            <Sparkles className="h-3 w-3" /> {config.businessName} · catálogo imersivo
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] text-balance">
            {first}
            <span className="block text-primary italic">{second}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Mais do que um catálogo. Você gira cada cenário em 360°, vê a lista exata
            do que vai chegar e <b className="text-foreground">faz upload da foto do salão</b>
            {" "}pra visualizar como o kit vai ficar — antes de fechar.
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
              Entrar no catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-13 px-7 py-4 rounded-full border border-border bg-card/80 backdrop-blur font-semibold hover:border-primary/60 transition"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a decoradora
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground"
          >
            <Feature icon={<RotateCw className="h-3.5 w-3.5" />} label="Cenário em 360°" />
            <Feature icon={<Camera className="h-3.5 w-3.5" />} label="Visualize no seu local" />
            <Feature icon={<Sparkles className="h-3.5 w-3.5" />} label="Disponibilidade em tempo real" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-7 w-7 rounded-full bg-card border border-border grid place-items-center text-primary">
        {icon}
      </span>
      <span className="font-semibold tracking-wide uppercase text-[10px]">{label}</span>
    </span>
  );
}
