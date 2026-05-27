import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ImmersiveStage } from "@/components/ImmersiveStage";
import { TopSellers } from "@/components/TopSellers";
import { KitsGrid } from "@/components/KitsGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { useCatalogConfig } from "@/hooks/useCatalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pink Love — Catálogo da sua decoradora" },
      { name: "description", content: "Catálogo imersivo de kits de festa: Princesa, Safari, Unicórnio e mais. Disponibilidade em tempo real e checkout pelo WhatsApp." },
      { property: "og:title", content: "Pink Love — Catálogo de festas" },
      { property: "og:description", content: "Kits completos para festas inesquecíveis. Tiers Bronze, Prata e Ouro." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: config, isLoading } = useCatalogConfig();

  if (isLoading || !config) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero config={config} />
      <ImmersiveStage />
      <TopSellers />
      <KitsGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
}
