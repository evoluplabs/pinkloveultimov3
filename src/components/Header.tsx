import { Link } from "@tanstack/react-router";
import { Heart, Instagram, Menu, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useCatalogConfig } from "@/hooks/useCatalog";

export function Header() {
  const { data: config } = useCatalogConfig();
  const [open, setOpen] = useState(false);
  const wa = config ? `https://wa.me/${config.social.whatsapp.replace(/\D/g, "")}` : "#";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-full bg-gradient-pink grid place-items-center text-primary-foreground shadow-petal group-hover:scale-105 transition">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg">{config?.businessName ?? "Pink Love"}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              catálogo
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/" className="hover:text-primary transition">Início</Link>
          <Link to="/kits" className="hover:text-primary transition">Kits</Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
            WhatsApp
          </a>
          {config?.social.instagram && (
            <a
              href={`https://instagram.com/${config.social.instagram.replace("@", "")}`}
              target="_blank" rel="noopener noreferrer"
              className="hover:text-primary transition"
            >
              Instagram
            </a>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-pink text-primary-foreground text-sm font-semibold shadow-petal hover:brightness-110 transition"
          >
            <MessageCircle className="h-4 w-4" /> Falar agora
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 grid place-items-center rounded-full border border-border"
            aria-label="menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3 text-sm">
            <Link to="/" onClick={() => setOpen(false)}>Início</Link>
            <Link to="/kits" onClick={() => setOpen(false)}>Kits</Link>
            <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            {config?.social.instagram && (
              <a href={`https://instagram.com/${config.social.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                <Instagram className="inline h-4 w-4 mr-1" /> {config.social.instagram}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
