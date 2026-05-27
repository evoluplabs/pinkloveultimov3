// ============================================================
// WhatsApp service — formata mensagem e gera link wa.me
// Sem API paga: o WhatsApp abre com o texto pré-formatado.
// ============================================================

import type { Order } from "@/data/types";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/date";

function buildMessage(order: Order, business: string): string {
  const lines: string[] = [];
  lines.push(`Olá ${business}! Gostaria de solicitar um orçamento 💕`);
  lines.push("");
  lines.push(`🎀 Kit: ${order.kitName} — ${order.tierLabel}`);
  lines.push(`📅 Data do evento: ${formatDateBR(order.eventDate)}`);
  if (order.freight.enabled && order.freight.address) {
    lines.push(`📍 Local: ${order.freight.address}`);
  }
  lines.push("");
  lines.push("📦 Itens:");
  lines.push(`• ${order.tierLabel} — ${formatBRL(order.tierPrice)}`);
  order.extras.forEach((e) => {
    lines.push(
      `• Extra: ${e.name} — ${e.qty} × ${formatBRL(e.unitPrice)} = ${formatBRL(e.qty * e.unitPrice)}`,
    );
  });
  if (order.freight.enabled && order.freight.price > 0) {
    const label =
      order.freight.option === "ida"
        ? "Frete (só ida)"
        : order.freight.option === "volta"
        ? "Frete (só volta)"
        : "Frete (ida + volta)";
    lines.push(`• ${label} — ${formatBRL(order.freight.price)}`);
  }
  lines.push("");
  lines.push(`💰 Total estimado: ${formatBRL(order.total)}`);
  if (order.notes) {
    lines.push("");
    lines.push(`📝 Obs: ${order.notes}`);
  }
  lines.push("");
  lines.push(`Código do pedido: ${order.code}`);
  return lines.join("\n");
}

function sanitizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export const whatsappService = {
  buildMessage,
  buildLink(order: Order, phone: string, business: string): string {
    const msg = encodeURIComponent(buildMessage(order, business));
    return `https://wa.me/${sanitizePhone(phone)}?text=${msg}`;
  },
};
