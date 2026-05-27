// Product360 — visualizador imersivo drag-to-rotate (mobile + desktop).
// Sem WebGL. Funciona com 1 imagem (fake 3D) ou com frames pré-renderizados.

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { RotateCw } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  accent?: string;
  frames?: string[];
  className?: string;
};

export function Product360({ src, alt, accent = "#e879a0", frames, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onStart = useCallback((clientX: number) => {
    dragging.current = true;
    lastX.current = clientX;
    setShowHint(false);
  }, []);
  const onMove = useCallback((clientX: number) => {
    if (!dragging.current) return;
    const dx = clientX - lastX.current;
    lastX.current = clientX;
    setAngle((a) => a + dx * 0.6);
  }, []);
  const onEnd = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const normalized = ((angle % 360) + 360) % 360;
  const frameIndex = frames ? Math.floor((normalized / 360) * frames.length) % frames.length : 0;
  const currentSrc = frames ? frames[frameIndex] : src;
  const rotateY = frames ? 0 : normalized;
  const tilt = Math.sin((normalized * Math.PI) / 180) * 6;
  const brightness = 0.9 + 0.2 * Math.cos((normalized * Math.PI) / 180);

  return (
    <div
      ref={ref}
      className={`relative touch-none select-none cursor-grab active:cursor-grabbing perspective-deep ${className}`}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 w-3/4 rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{ background: accent }}
      />
      <motion.img
        key={frames ? frameIndex : "spin"}
        src={currentSrc}
        alt={alt}
        draggable={false}
        className="relative h-full w-full object-contain pointer-events-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
        style={{
          transform: `rotateY(${rotateY}deg) rotateZ(${tilt}deg)`,
          filter: `brightness(${brightness}) saturate(1.05)`,
          transformStyle: "preserve-3d",
        }}
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 h-8 rounded-full bg-card/80 backdrop-blur border border-border text-[10px] uppercase tracking-widest font-bold pointer-events-none">
        <RotateCw className="h-3 w-3 text-primary" /> 360°
      </div>
      {showHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.6, times: [0, 0.2, 0.8, 1] }}
          className="absolute inset-x-0 top-6 text-center text-xs text-muted-foreground pointer-events-none uppercase tracking-widest"
        >
          ← arraste para girar →
        </motion.div>
      )}
    </div>
  );
}
