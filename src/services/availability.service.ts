import { dataAdapter } from "@/config/data-source";
import type { TierLevel } from "@/data/types";

export const availabilityService = {
  check: (kitId: string, tier: TierLevel, eventDate: string) =>
    dataAdapter.checkAvailability(kitId, tier, eventDate),
};
