import { motion } from "motion/react";
import { CalendarHeart, Sparkles, Truck } from "lucide-react";

const STEPS = [
  { icon: Sparkles, title: "Escolha o kit", desc: "Explore os temas e selecione o tier (Bronze, Prata ou Ouro)." },
  { icon: CalendarHeart, title: "Agende a data", desc: "Verificamos a disponibilidade em tempo real para o seu evento." },
  { icon: Truck, title: "Receba ou retire", desc: "Montamos no local ou enviamos a caixa pegue & monte com tutorial." },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
            · Como funciona ·
          </span>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl text-balance">
            Três passos até a festa perfeita
          </h2>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-3xl border border-border bg-card p-7"
            >
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-2xl bg-accent grid place-items-center text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl text-muted-foreground/40">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
