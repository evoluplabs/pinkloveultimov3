# Migração para Firebase — Pink Love Catálogo

Toda a app já está desacoplada da camada de dados. Para trocar do mock
(Zustand + localStorage + dataset estático) para Firestore, siga **4 passos**.

## 1. Instalar SDK

```bash
bun add firebase
```

## 2. Criar `src/data/firebase.ts`

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 3. Implementar `src/data/adapters/firebase.adapter.ts`

O arquivo já existe com **stubs** e comentários `TODO` em cada método.
Cada TODO contém a chamada Firestore equivalente.

### Multi-tenant por subdomínio (slug → userId)

| Coleção                            | Documento                |
|------------------------------------|--------------------------|
| `slugs/{slug}`                     | `{ userId }`             |
| `users/{uid}/catalog/config`       | doc único da decoradora  |
| `users/{uid}/kits/{kitId}`         | um por kit               |
| `users/{uid}/bookings/{bookingId}` | datas reservadas         |
| `users/{uid}/orders/{orderId}`     | pedidos                  |
| `users/{uid}/sales/{saleId}`       | histórico p/ ranking     |

O slug deve ser detectado via subdomínio (Cloudflare Worker injeta
`X-Catalog-Slug`). Em dev, usar `VITE_CATALOG_SLUG`.

### Cloud Functions necessárias

- `getCatalog(slug)` → resolve slug→userId e retorna `{ kits, config, topKitIds }`.
- `checkAvailability(userId, kitId, tier, eventDate)` → combina estoque
  e agenda para responder em tempo real.

## 4. Ativar o adapter

No `.env`:

```bash
VITE_DATA_SOURCE=firebase
VITE_CATALOG_SLUG=decoramontes   # dev only
```

Pronto. **Nenhum componente precisa ser alterado** — todos consomem via
`src/services/*` e `src/hooks/*`.

## Onde estão as chamadas

| Domínio              | Arquivo                                  |
|----------------------|------------------------------------------|
| Config white-label   | `src/services/catalog.service.ts`        |
| Kits / catálogo      | `src/services/kits.service.ts`           |
| Disponibilidade      | `src/services/availability.service.ts`   |
| Pedidos              | `src/services/orders.service.ts`         |
| Mensagem WhatsApp    | `src/services/whatsapp.service.ts`       |
| Tema dinâmico        | `src/services/theme.service.ts`          |

A interface canônica está em `src/data/types.ts → DataAdapter`.
Qualquer backend (Firebase, Supabase, REST próprio) basta implementar
essa interface.

## Regras de Firestore sugeridas (resumo)

```
match /slugs/{slug} {
  allow read: if true;             // resolução pública do subdomínio
  allow write: if request.auth != null && request.auth.uid == resource.data.userId;
}

match /users/{uid}/catalog/{doc} {
  allow read: if true;             // catálogo é público
  allow write: if request.auth.uid == uid;
}

match /users/{uid}/kits/{kitId} {
  allow read: if true;
  allow write: if request.auth.uid == uid;
}

match /users/{uid}/bookings/{bookingId} {
  allow read: if true;             // necessário p/ checkAvailability
  allow write: if request.auth.uid == uid;
}

match /users/{uid}/orders/{orderId} {
  allow create: if true;           // cliente público cria pedido
  allow read, update: if request.auth.uid == uid;
}
```

## Configuração de subdomínio (Cloudflare Worker)

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const slug = url.hostname.split(".")[0];
    if (slug === "www" || slug === "pinklovegestao") return fetch(request);
    const newRequest = new Request(request, {
      headers: { ...request.headers, "X-Catalog-Slug": slug },
    });
    return fetch(newRequest);
  },
};
```

## Arquitetura resumida

```
src/
├── config/data-source.ts            ← seletor mock|firebase
├── data/
│   ├── types.ts                     ← DataAdapter (contrato)
│   ├── mock-kits.ts                 ← dataset estático (dev)
│   └── adapters/
│       ├── mock.adapter.ts          ← in-memory + Zustand
│       └── firebase.adapter.ts      ← stubs prontos
├── services/                        ← API que componentes consomem
│   ├── catalog.service.ts
│   ├── kits.service.ts
│   ├── availability.service.ts
│   ├── orders.service.ts
│   ├── whatsapp.service.ts
│   └── theme.service.ts
├── hooks/                           ← React Query + estado UI
│   ├── useCatalog.ts
│   ├── useAvailability.ts
│   ├── useOrderBuilder.ts
│   └── useTheme.ts
└── components/                      ← UI pura (zero dados diretos)
```
