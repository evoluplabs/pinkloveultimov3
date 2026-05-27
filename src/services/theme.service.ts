// ============================================================
// Theme service — aplica white-label da decoradora (CSS vars)
// ============================================================

import type { CatalogConfig } from "@/data/types";

function hexToOklchString(hex: string): string {
  // Conversão aproximada hex → oklch (suficiente para tema dinâmico).
  // Para precisão, usar uma lib; aqui mantemos zero-deps.
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  // luminância aproximada
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = (max - min) * 0.4;
  // hue aproximado em graus
  let hueDeg = 0;
  if (max === r) hueDeg = ((g - b) / (max - min || 1)) * 60;
  else if (max === g) hueDeg = ((b - r) / (max - min || 1)) * 60 + 120;
  else hueDeg = ((r - g) / (max - min || 1)) * 60 + 240;
  if (hueDeg < 0) hueDeg += 360;
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hueDeg.toFixed(1)})`;
}

export const themeService = {
  apply(config: CatalogConfig) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (config.primaryColor) {
      root.style.setProperty("--primary", hexToOklchString(config.primaryColor));
      root.style.setProperty("--ring", hexToOklchString(config.primaryColor));
      root.style.setProperty("--pink", hexToOklchString(config.primaryColor));
    }
    if (config.backgroundColor) {
      root.style.setProperty(
        "--background",
        hexToOklchString(config.backgroundColor),
      );
    }
  },
};
