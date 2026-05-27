import { Heart, Instagram, Mail, MessageCircle } from "lucide-react";
import { useCatalogConfig } from "@/hooks/useCatalog";

export function Footer() {
  const { data: config } = useCatalogConfig();
  if (!config) return null;
  const wa = `https://wa.me/${config.social.whatsapp.replace(/\D/g, "")}`;

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-gradient-pink grid place-items-center text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <span className="font-display text-xl">{config.businessName}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{config.tagline}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
            Contato
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          {config.social.instagram && (
            <a
              href={`https://instagram.com/${config.social.instagram.replace("@", "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary"
            >
              <Instagram className="h-4 w-4" /> {config.social.instagram}
            </a>
          )}
          {config.social.email && (
            <a href={`mailto:${config.social.email}`} className="flex items-center gap-2 hover:text-primary">
              <Mail className="h-4 w-4" /> {config.social.email}
            </a>
          )}
        </div>
        <div className="text-xs text-muted-foreground self-end">
          <p>© {new Date().getFullYear()} {config.businessName}</p>
          <p className="mt-1">
            Powered by{" "}
            <span className="text-primary font-semibold">Pink Love Gestão</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
