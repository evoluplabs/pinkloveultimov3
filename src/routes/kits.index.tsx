import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { KitsGrid } from "@/components/KitsGrid";

export const Route = createFileRoute("/kits/")({
  head: () => ({
    meta: [
      { title: "Kits — Pink Love" },
      { name: "description", content: "Veja todos os kits de festa disponíveis: temas, tiers e preços." },
      { property: "og:title", content: "Todos os kits — Pink Love" },
    ],
  }),
  component: KitsPage,
});

function KitsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-5xl sm:text-6xl text-balance">Nosso catálogo</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Filtre por tipo de serviço e clique em qualquer kit para mergulhar no 360°,
            ver tiers, BOM e simular a montagem no seu salão.
          </p>
        </div>
      </div>
      <KitsGrid />
      <Footer />
    </div>
  );
}
