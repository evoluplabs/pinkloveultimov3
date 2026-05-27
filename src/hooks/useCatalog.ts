// Hook de catálogo: carrega config + kits + top kits via services.
// Componentes nunca falam com adapter direto.

import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog.service";
import { kitsService } from "@/services/kits.service";

export function useCatalogConfig() {
  return useQuery({
    queryKey: ["catalog", "config"],
    queryFn: () => catalogService.getConfig(),
    staleTime: 60_000,
  });
}

export function useKits() {
  return useQuery({
    queryKey: ["kits"],
    queryFn: () => kitsService.list(),
    staleTime: 30_000,
  });
}

export function useKit(id: string) {
  return useQuery({
    queryKey: ["kits", id],
    queryFn: () => kitsService.get(id),
    enabled: Boolean(id),
  });
}

export function useTopKits(limit = 3) {
  return useQuery({
    queryKey: ["kits", "top", limit],
    queryFn: () => kitsService.top(limit),
    staleTime: 60_000,
  });
}
