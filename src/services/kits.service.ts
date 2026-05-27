import { dataAdapter } from "@/config/data-source";

export const kitsService = {
  list: () => dataAdapter.listKits(),
  get: (id: string) => dataAdapter.getKit(id),
  top: (limit?: number) => dataAdapter.topKits(limit),
};
