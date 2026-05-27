import { dataAdapter } from "@/config/data-source";

export const catalogService = {
  getConfig: (slug?: string) => dataAdapter.getCatalogConfig(slug),
  updateConfig: (patch: Parameters<typeof dataAdapter.updateCatalogConfig>[0]) =>
    dataAdapter.updateCatalogConfig(patch),
};
