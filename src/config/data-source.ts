// Seletor de adapter — controlado via env.
// Para migrar para Firebase: VITE_DATA_SOURCE=firebase

import type { DataAdapter } from "@/data/types";
import { mockAdapter } from "@/data/adapters/mock.adapter";
import { firebaseAdapter } from "@/data/adapters/firebase.adapter";

const source = import.meta.env.VITE_DATA_SOURCE ?? "mock";

export const dataAdapter: DataAdapter =
  source === "firebase" ? firebaseAdapter : mockAdapter;

export const dataSourceName = source as "mock" | "firebase";
