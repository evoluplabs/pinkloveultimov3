// VenueVisualizer — upload da foto do local + composição com a foto do kit.
// Funciona puramente client-side (Canvas API). Export PNG e envio p/ WhatsApp.

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

type Props = {
  kitImage: string;
  kitName: string;
  whatsappNumber?: string;
  accent?: string;
};

type Overlay = {
  x: number; // % from left of stage
  y: number; // % from top of stage
  scale: number; // 0.2 - 2
  rotation: number; // deg
  opacity: number; // 0 - 1
};

const DEFAULT_OVERLAY: Overlay = {
  x: 50,
  y: 62,
  scale: 0.55,
  rotation: 0,
  opacity: 1,
};

export function VenueVisualizer({ kitImage, kitName, whatsappNumber, accent = "#e879a0" }: Props) {
  const [venueUrl, setVenueUrl] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(DEFAULT_OVERLAY);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ ox: number; oy: number; px: number; py: number } | null>(null);

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
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

  const handlePointerDown = (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const rect = stage.getBoundingClientRect();
    dragging.current = {
      ox: overlay.x,
      oy: overlay.y,
      px: ((e.clientX - rect.left) / rect.width) * 100,
      py: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    setOverlay((o) => ({
      ...o,
      x: clamp(dragging.current!.ox + (cx - dragging.current!.px), 0, 100),
      y: clamp(dragging.current!.oy + (cy - dragging.current!.py), 0, 100),
    }));
  };
  const handlePointerUp = () => {
    dragging.current = null;
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setOverlay((o) => ({ ...o, scale: clamp(o.scale - e.deltaY * 0.001, 0.15, 2.2) }));
  };

  const exportComposite = useCallback(async (): Promise<Blob | null> => {
    if (!venueUrl) return null;
    const venue = await loadImage(venueUrl);
    const kit = await loadImage(kitImage, true);
    const canvas = document.createElement("canvas");
    canvas.width = venue.naturalWidth;
    canvas.height = venue.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(venue, 0, 0);
    // overlay
    const baseW = canvas.width * 0.55 * overlay.scale;
    const ratio = kit.naturalHeight / kit.naturalWidth || 1;
    const baseH = baseW * ratio;
    const cx = (overlay.x / 100) * canvas.width;
    const cy = (overlay.y / 100) * canvas.height;
    ctx.save();
    ctx.globalAlpha = overlay.opacity;
    ctx.translate(cx, cy);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
    // subtle shadow for realism
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = baseW * 0.08;
    ctx.shadowOffsetY = baseH * 0.04;
    ctx.drawImage(kit, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();
    // watermark
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `${Math.max(14, canvas.width * 0.014)}px Inter, sans-serif`;
    ctx.fillText("Pink Love · prévia ilustrativa", 24, canvas.height - 24);
    return await new Promise((res) => canvas.toBlob((b) => res(b), "image/png", 0.95));
  }, [venueUrl, kitImage, overlay]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await exportComposite();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `previa-${slug(kitName)}.png`;
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
      const msg = encodeURIComponent(
        `Olá! Fiz uma prévia do *${kitName}* no meu local e adorei. Pode me confirmar disponibilidade?`,
      );
      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], "previa.png", { type: "image/png" })] })) {
        try {
          await navigator.share({
            text: decodeURIComponent(msg),
            files: [new File([blob], `previa-${slug(kitName)}.png`, { type: "image/png" })],
          });
          return;
        } catch {
          // fallback below
        }
      }
      // Fallback: baixa a imagem e abre wa.me
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `previa-${slug(kitName)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener,noreferrer");
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
              prévia visual · arraste, gire, redimensione
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
          >
            <img
              src={venueUrl!}
              alt="seu local"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <motion.img
              src={kitImage}
              alt={kitName}
              draggable={false}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute h-auto w-[55%] cursor-grab active:cursor-grabbing pointer-events-auto drop-shadow-[0_30px_30px_rgba(0,0,0,0.45)]"
              style={overlayStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: overlay.opacity }}
            />
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-black/55 text-white text-[10px] uppercase tracking-widest font-bold backdrop-blur">
              <Maximize2 className="h-3 w-3" /> arraste · scroll p/ zoom
            </div>
          </div>

          <div className="p-5 space-y-4">
            <Slider
              label="Tamanho"
              min={15}
              max={220}
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
                  <MessageCircle className="h-4 w-4" /> Enviar prévia no WhatsApp
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Esta prévia é ilustrativa: dimensões reais podem variar conforme o espaço
              e o pacote contratado.
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
