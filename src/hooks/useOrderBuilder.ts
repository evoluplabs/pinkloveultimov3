// useOrderBuilder — estado local do construtor de pedido.
// Cliente seleciona tier, data, extras e frete. Tudo derivado.

import { useMemo, useState } from "react";
import type {
  CatalogConfig,
  FreightOption,
  Kit,
  OrderExtra,
  TierLevel,
} from "@/data/types";

export function useOrderBuilder(kit: Kit | null | undefined, config?: CatalogConfig) {
  const firstAvailableTier =
    kit?.tiers.find((t) => t.available)?.level ?? "bronze";
  const [tier, setTier] = useState<TierLevel>(firstAvailableTier);
  const [eventDate, setEventDate] = useState("");
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [freightEnabled, setFreightEnabled] = useState(false);
  const [freightOption, setFreightOption] = useState<FreightOption>("ida-volta");
  const [freightCustomPrice, setFreightCustomPrice] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const selectedTier = kit?.tiers.find((t) => t.level === tier);

  const orderExtras: OrderExtra[] = useMemo(() => {
    if (!kit) return [];
    return Object.entries(extras)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const e = kit.extras.find((x) => x.id === id)!;
        return { extraId: id, name: e.name, qty, unitPrice: e.price };
      });
  }, [extras, kit]);

  const freightPrice = useMemo(() => {
    if (!freightEnabled || !config?.freight.enabled) return 0;
    if (freightCustomPrice !== null) return freightCustomPrice;
    if (freightOption === "ida") return config.freight.ida;
    if (freightOption === "volta") return config.freight.volta;
    return config.freight.idaVolta;
  }, [freightEnabled, freightOption, freightCustomPrice, config]);

  const subtotal = useMemo(() => {
    const tierP = selectedTier?.price ?? 0;
    const extrasP = orderExtras.reduce((s, e) => s + e.qty * e.unitPrice, 0);
    return tierP + extrasP;
  }, [selectedTier, orderExtras]);

  const total = subtotal + freightPrice;

  const setExtraQty = (id: string, qty: number) =>
    setExtras((m) => ({ ...m, [id]: Math.max(0, qty) }));

  return {
    // state
    tier, setTier,
    eventDate, setEventDate,
    extras, setExtraQty,
    freightEnabled, setFreightEnabled,
    freightOption, setFreightOption,
    freightCustomPrice, setFreightCustomPrice,
    address, setAddress,
    notes, setNotes,
    // derived
    selectedTier,
    orderExtras,
    freightPrice,
    subtotal,
    total,
  };
}

export type OrderBuilder = ReturnType<typeof useOrderBuilder>;
