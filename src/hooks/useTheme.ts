import { useEffect } from "react";
import { useCatalogConfig } from "./useCatalog";
import { themeService } from "@/services/theme.service";

/** Aplica o tema white-label sempre que a config muda. */
export function useTheme() {
  const { data: config } = useCatalogConfig();
  useEffect(() => {
    if (config) themeService.apply(config);
  }, [config]);
}
