import { useQuery } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability.service";
import type { TierLevel } from "@/data/types";

export function useAvailability(
  kitId: string,
  tier: TierLevel,
  eventDate: string,
) {
  return useQuery({
    queryKey: ["availability", kitId, tier, eventDate],
    queryFn: () => availabilityService.check(kitId, tier, eventDate),
    enabled: Boolean(kitId && tier && eventDate),
    staleTime: 10_000,
  });
}
