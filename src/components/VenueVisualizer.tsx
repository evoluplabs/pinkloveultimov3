// VenueVisualizer — upload da foto do local + composição com a foto do kit.
// Funciona puramente client-side (Canvas API). Gestos mobile (drag + pinch).
// Export PNG e envio p/ WhatsApp com resumo do pedido.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Download,
  ImageUp,
  MessageCircle,
  Maximize2,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/date";

export type VenueOrderSummary = {
  tierLabel?: string;
  eventDate?: string;
  extras?: { name: string; qty: number; unitPrice: number }[];
  freightLabel?: string;
  freightPrice?: number;
  total?: number;
};

type Props = {
  kitImage: string;
  kitName: string;
  whatsappNumber?: string;
  businessName?: string;
  accent?: string;
  orderSummary?: VenueOrderSummary;
};

type Overlay = {
  x: number; // % from left
  y: number; // % from top
  scale: number;
  rotation: number;
  opacity: number;
};

const DEFAULT_OVERLAY: Overlay = {
  x: 50,
  y: 62,
  scale: 0.55,
  rotation: 0,
  opacity: 1,
};

type Pointer = { id: number; x: number; y: number };

export function VenueVisualizer({
  kitImage,
  kitName,
  whatsappNumber,
  businessName = "a decoradora",
  accent = "#e879a0",
  orderSummary,
}: Props) {
  const [venueUrl, setVenueUrl] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(DEFAULT_OVERLAY);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef<Map<number, Pointer>>(new Map());
  const gestureStart = useRef<{
    overlay: Overlay;
    centerPct: { x: number; y: number };
    distance?: number;
  } | null>(null);

  const onFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setVenueUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setOverlay(DEFAULT_OVERLAY);
  };

  useEffect(() => {
    return () => {
      if (venueUrl) URL.revokeObjectURL(venueUrl);
    };
  }, [venueUrl]);

  // ===== Gestos (drag + pinch) =====
  const stageRect = () => stageRef.current?.getBoundingClientRect();
  const pctFromClient = (cx: number, cy: number) => {
    const r = stageRect();
    if (!r) return { x: 50, y: 50 };
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 };
  };

  const recomputeGestureStart = () => {
    const pts = [...pointers.current.values()];
    if (!pts.length) {
      gestureStart.current = null;
      return;
    }
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const distance =
      pts.length >= 2
        ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        : undefined;
    gestureStart.current = {
      overlay: { ...overlay },
      centerPct: pctFromClient(cx, cy),
      distance,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });
    recomputeGestureStart();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const start = gestureStart.current;
    if (!start) return;

    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const cur = pctFromClient(cx, cy);

    let nextScale = start.overlay.scale;
    if (pts.length >= 2 && start.distance) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / start.distance;
      nextScale = clamp(start.overlay.scale * ratio, 0.15, 2.4);
    }

    setOverlay((o) => ({
      ...o,
      x: clamp(start.overlay.x + (cur.x - start.centerPct.x), 0, 100),
      y: clamp(start.overlay.y + (cur.y - start.centerPct.y), 0, 100),
      scale: nextScale,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    recomputeGestureStart();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setOverlay((o) => ({ ...o, scale: clamp(o.scale - e.deltaY * 0.001, 0.15, 2.4) }));
  };

  // ===== Export =====
  const exportComposite = useCallback(async (): Promise<Blob | null> => {
    if (!venueUrl) return null;
    const venue = await loadImage(venueUrl);
    const kit = await loadImage(kitImage, true).catch(() => null);
    if (!kit) return null;
    const canvas = document.createElement("canvas");
    // Limita a 1600px para mobile não travar
    const maxW = 1600;
    const scaleDown = Math.min(1, maxW / venue.naturalWidth);
    canvas.width = Math.round(venue.naturalWidth * scaleDown);
    canvas.height = Math.round(venue.naturalHeight * scaleDown);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(venue, 0, 0, canvas.width, canvas.height);
    const baseW = canvas.width * 0.55 * overlay.scale;
    const ratio = kit.naturalHeight / kit.naturalWidth || 1;
    const baseH = baseW * ratio;
    const cx = (overlay.x / 100) * canvas.width;
    const cy = (overlay.y / 100) * canvas.height;
    ctx.save();
    ctx.globalAlpha = overlay.opacity;
    ctx.translate(cx, cy);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = baseW * 0.08;
    ctx.shadowOffsetY = baseH * 0.04;
    ctx.drawImage(kit, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `${Math.max(14, canvas.width * 0.014)}px Inter, sans-serif`;
    ctx.fillText("Pink Love · prévia ilustrativa", 24, canvas.height - 24);
    return await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.88));
  }, [venueUrl, kitImage, overlay]);

  // ===== Mensagem WhatsApp com resumo do pedido =====
  const buildWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push(`Olá ${businessName}! Fiz uma prévia do *${kitName}* no meu local 💕`);
    if (orderSummary) {
      lines.push("");
      if (orderSummary.tierLabel) lines.push(`🎀 Pacote: ${orderSummary.tierLabel}`);
      if (orderSummary.eventDate)
        lines.push(`📅 Data: ${formatDateBR(orderSummary.eventDate)}`);
      if (orderSummary.extras?.length) {
        lines.push("✨ Extras:");
        orderSummary.extras.forEach((e) =>
          lines.push(`• ${e.name} — ${e.qty} × ${formatBRL(e.unitPrice)}`),
        );
      }
      if (orderSummary.freightLabel && orderSummary.freightPrice) {
        lines.push(`🚚 ${orderSummary.freightLabel}: ${formatBRL(orderSummary.freightPrice)}`);
      }
      if (orderSummary.total) {
        lines.push("");
        lines.push(`💰 Total estimado: ${formatBRL(orderSummary.total)}`);
      }
    }
    lines.push("");
    lines.push("Mando junto a prévia visual. Pode confirmar disponibilidade?");
    return lines.join("\n");
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await exportComposite();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `previa-${slug(kitName)}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = async () => {
    setBusy(true);
    try {
      const blob = await exportComposite();
      const phone = (whatsappNumber || "").replace(/\D/g, "");
      const msg = buildWhatsAppMessage();
      const file = blob ? new File([blob], `previa-${slug(kitName)}.jpg`, { type: "image/jpeg" }) : null;
      if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ text: msg, files: [file] });
          return;
        } catch {
          // fallback
        }
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `previa-${slug(kitName)}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setBusy(false);
    }
  };

  const ready = !!venueUrl;
  const overlayStyle = useMemo(
    () => ({
      left: `${overlay.x}%`,
      top: `${overlay.y}%`,
      transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${overlay.scale})`,
      opacity: overlay.opacity,
    }),
    [overlay],
  );

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-2xl bg-accent grid place-items-center text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="font-display text-lg leading-none">Veja no seu local</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              arraste · pinça pra escalar
            </div>
          </div>
        </div>
        {ready && (
          <button
            onClick={() => {
              setVenueUrl(null);
              setOverlay(DEFAULT_OVERLAY);
            }}
            className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Trocar foto
          </button>
        )}
      </div>

      {!ready ? (
        <label className="block relative aspect-[4/3] bg-secondary cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-60 transition"
            style={{ background: `radial-gradient(circle at 50% 35%, ${accent}55, transparent 60%)` }}
          />
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            <div>
              <div className="mx-auto h-16 w-16 rounded-full bg-card border border-border grid place-items-center shadow-card">
                <ImageUp className="h-7 w-7 text-primary" />
              </div>
              <div className="mt-4 font-display text-2xl">Suba uma foto do salão</div>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                A gente coloca o cenário do <b>{kitName}</b> sobre a sua foto pra você
                visualizar como vai ficar antes de fechar.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal">
                <Camera className="h-4 w-4" /> Escolher foto do local
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                JPG ou PNG · processado no seu dispositivo, nada sai daqui.
              </p>
            </div>
          </div>
        </label>
      ) : (
        <>
          <div
            ref={stageRef}
            className="relative aspect-[4/3] bg-black overflow-hidden touch-none select-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              src={venueUrl!}
              alt="seu local"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              loading="eager"
              decoding="async"
            />
            <motion.img
              src={kitImage}
              alt={kitName}
              draggable={false}
              loading="eager"
              decoding="async"
              crossOrigin="anonymous"
              className="absolute h-auto w-[55%] cursor-grab active:cursor-grabbing drop-shadow-[0_30px_30px_rgba(0,0,0,0.45)] pointer-events-none"
              style={overlayStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: overlay.opacity }}
            />
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-black/55 text-white text-[10px] uppercase tracking-widest font-bold backdrop-blur">
              <Maximize2 className="h-3 w-3" /> arraste · pinça
            </div>
          </div>

          <div className="p-5 space-y-4">
            <Slider
              label="Tamanho"
              min={15}
              max={240}
              value={Math.round(overlay.scale * 100)}
              onChange={(v) => setOverlay((o) => ({ ...o, scale: v / 100 }))}
            />
            <Slider
              label="Rotação"
              min={-30}
              max={30}
              value={overlay.rotation}
              suffix="°"
              onChange={(v) => setOverlay((o) => ({ ...o, rotation: v }))}
            />
            <Slider
              label="Opacidade"
              min={20}
              max={100}
              value={Math.round(overlay.opacity * 100)}
              suffix="%"
              onChange={(v) => setOverlay((o) => ({ ...o, opacity: v / 100 }))}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setOverlay(DEFAULT_OVERLAY)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border text-sm hover:border-primary/50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Resetar
              </button>
              <button
                onClick={handleDownload}
                disabled={busy}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border text-sm hover:border-primary/50 disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" /> Baixar prévia
              </button>
              {whatsappNumber && (
                <button
                  onClick={handleWhatsApp}
                  disabled={busy}
                  className="ml-auto inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-pink text-primary-foreground text-sm font-semibold shadow-petal hover:brightness-110 disabled:opacity-60"
                >
                  <MessageCircle className="h-4 w-4" />
                  {busy ? "Gerando…" : "Enviar prévia no WhatsApp"}
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {orderSummary?.tierLabel
                ? `A mensagem leva o pacote ${orderSummary.tierLabel}, data e extras já preenchidos.`
                : "Esta prévia é ilustrativa: dimensões reais podem variar conforme o espaço."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
  suffix = "",
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span className="uppercase tracking-widest font-semibold">{label}</span>
        <span className="tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--primary)]"
      />
    </label>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
