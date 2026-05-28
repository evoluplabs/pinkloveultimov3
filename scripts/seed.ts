/**
 * Seed do catálogo no Firestore.
 *
 * Pré-requisito (único):
 *   Firebase Console → Configurações do projeto → Contas de serviço
 *   → "Gerar nova chave privada" → salvar como serviceAccountKey.json
 *   na raiz do projeto (já está no .gitignore).
 *
 * Executar:
 *   bun run scripts/seed.ts
 */

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const serviceAccount: ServiceAccount = require(resolve(process.cwd(), "serviceAccountKey.json"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── Configuração ────────────────────────────────────────────
const SLUG = "atelie";
const UID  = "onGeoQkOUYZFbXCp0Ipdqilhplp1";

// ─── Dados do catálogo ───────────────────────────────────────

const catalogConfig = {
  slug:             SLUG,
  businessName:     "Ateliê de Festas",
  tagline:          "Transformamos momentos em memórias inesquecíveis",
  primaryColor:     "#e879a0",
  backgroundColor:  "#fdfaf9",
  showPrices:       true,
  showAvailability: true,
  freight: {
    enabled:  false,
    ida:      0,
    volta:    0,
    idaVolta: 0,
    radiusKm: 0,
  },
  social: {
    whatsapp:  "5511199999999",
    instagram: "",
  },
  hiddenKitIds: [],
  order: ["kit-princesas", "kit-mickey", "kit-minnie", "kit-batman"],
};

const kits = [
  {
    id:          "kit-princesas",
    name:        "Festa das Princesas",
    theme:       "Princesas",
    type:        "decoracao-montada",
    tagline:     "Um conto de fadas real para a sua pequena princesa",
    description: "Decoração completa com painel de flores, mesa de doces encantada, balões metalizados dourados e rosas e muito glitter. Transforma qualquer salão em um verdadeiro castelo.",
    coverImage:  "",
    accent:      "#d4a0c8",
    rating:      4.9,
    badges:      ["top", "novo"],
    active:      true,
    tiers: [
      {
        level:       "bronze",
        label:       "Bronze",
        emoji:       "🥉",
        price:       490,
        description: "Painel de fundo + mesa de doces + balões básicos. Ideal para festas íntimas.",
        bom:         [],
        available:   true,
      },
      {
        level:       "prata",
        label:       "Prata",
        emoji:       "🥈",
        price:       790,
        description: "Tudo do Bronze + topo de bolo personalizado + arranjos florais + cortina de luz.",
        bom:         [],
        available:   true,
      },
      {
        level:       "ouro",
        label:       "Ouro",
        emoji:       "🥇",
        price:       1290,
        description: "Decoração completa com arco de balões, carruagem decorativa, tapete e iluminação LED.",
        bom:         [],
        available:   true,
      },
    ],
    extras: [
      { id: "topo-princesas",  name: "Topo de bolo personalizado", emoji: "👑", price: 80,  maxQty: 1 },
      { id: "balao-gigante",   name: "Balão gigante número",       emoji: "🎈", price: 45,  maxQty: 2 },
      { id: "mesa-doces",      name: "Mesa de doces completa",     emoji: "🍰", price: 150, maxQty: 1 },
    ],
  },
  {
    id:          "kit-mickey",
    name:        "Festa do Mickey",
    theme:       "Mickey Mouse",
    type:        "decoracao-montada",
    tagline:     "O clássico que nunca sai de moda — oh boy!",
    description: "Decoração temática oficial do Mickey Mouse com painel backdrop, orelhas gigantes, balões vermelhos e pretos e mesa de doces temática. Vai arrancar sorrisos de crianças e adultos.",
    coverImage:  "",
    accent:      "#cc0000",
    rating:      4.8,
    badges:      ["top"],
    active:      true,
    tiers: [
      {
        level:       "bronze",
        label:       "Bronze",
        emoji:       "🥉",
        price:       420,
        description: "Painel + balões temáticos + mesa de doces básica.",
        bom:         [],
        available:   true,
      },
      {
        level:       "prata",
        label:       "Prata",
        emoji:       "🥈",
        price:       720,
        description: "Tudo do Bronze + orelhas 3D + topo de bolo + balões metalizados.",
        bom:         [],
        available:   true,
      },
      {
        level:       "ouro",
        label:       "Ouro",
        emoji:       "🥇",
        price:       1150,
        description: "Kit completo com arco de balões, painel luminoso, mobiliário temático e iluminação.",
        bom:         [],
        available:   true,
      },
    ],
    extras: [
      { id: "orelhas-mickey",  name: "Orelhas Mickey gigantes",    emoji: "🐭", price: 60,  maxQty: 2 },
      { id: "topo-mickey",     name: "Topo de bolo personalizado", emoji: "🎂", price: 80,  maxQty: 1 },
      { id: "balao-numero",    name: "Balão número",               emoji: "🎈", price: 40,  maxQty: 2 },
    ],
  },
  {
    id:          "kit-minnie",
    name:        "Festa da Minnie",
    theme:       "Minnie Mouse",
    type:        "decoracao-montada",
    tagline:     "Fofura e estilo em cada detalhe, com laços e bolinhas",
    description: "Decoração encantadora da Minnie com tons rosa e vermelho, laços gigantes, bolinhas de polca, painel floral e mesa de doces com bolos decorados. Perfeito para as fãs da Minnie!",
    coverImage:  "",
    accent:      "#e91e8c",
    rating:      4.7,
    badges:      [],
    active:      true,
    tiers: [
      {
        level:       "bronze",
        label:       "Bronze",
        emoji:       "🥉",
        price:       430,
        description: "Painel temático + balões rosa + laços decorativos + mesa básica.",
        bom:         [],
        available:   true,
      },
      {
        level:       "prata",
        label:       "Prata",
        emoji:       "🥈",
        price:       730,
        description: "Tudo do Bronze + laços gigantes 3D + topo personalizado + arranjos florais.",
        bom:         [],
        available:   true,
      },
      {
        level:       "ouro",
        label:       "Ouro",
        emoji:       "🥇",
        price:       1180,
        description: "Decoração completa: arco de balões, painel com flores, mobiliário rosa e iluminação LED.",
        bom:         [],
        available:   true,
      },
    ],
    extras: [
      { id: "laco-gigante",    name: "Laço Minnie gigante",        emoji: "🎀", price: 55,  maxQty: 2 },
      { id: "topo-minnie",     name: "Topo de bolo personalizado", emoji: "🎂", price: 80,  maxQty: 1 },
      { id: "painel-floral",   name: "Painel floral extra",        emoji: "🌸", price: 120, maxQty: 1 },
    ],
  },
  {
    id:          "kit-batman",
    name:        "Festa do Batman",
    theme:       "Batman",
    type:        "decoracao-montada",
    tagline:     "Gotham chama — o herói da festa chegou",
    description: "Decoração épica do Batman com painel escuro estilizado, morcegos 3D, balões pretos e amarelos, sinal do Batman e mesa de doces temática. Para os pequenos heróis que merecem uma festa de super-herói.",
    coverImage:  "",
    accent:      "#f5c518",
    rating:      4.6,
    badges:      [],
    active:      true,
    tiers: [
      {
        level:       "bronze",
        label:       "Bronze",
        emoji:       "🥉",
        price:       410,
        description: "Painel escuro + balões pretos e amarelos + morcegos decorativos.",
        bom:         [],
        available:   true,
      },
      {
        level:       "prata",
        label:       "Prata",
        emoji:       "🥈",
        price:       690,
        description: "Tudo do Bronze + sinal do Batman iluminado + topo + capa decorativa.",
        bom:         [],
        available:   true,
      },
      {
        level:       "ouro",
        label:       "Ouro",
        emoji:       "🥇",
        price:       1100,
        description: "Kit completo: painel 3D, arco de balões preto/dourado, mobiliário temático e iluminação.",
        bom:         [],
        available:   true,
      },
    ],
    extras: [
      { id: "sinal-batman",    name: "Sinal do Batman iluminado",  emoji: "💡", price: 90,  maxQty: 1 },
      { id: "capa-batman",     name: "Capa do Batman decorativa",  emoji: "🦇", price: 70,  maxQty: 1 },
      { id: "topo-batman",     name: "Topo de bolo personalizado", emoji: "🎂", price: 80,  maxQty: 1 },
    ],
  },
];

// ─── Seed ────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Iniciando seed...\n");

  // 1. slug → userId
  await db.collection("slugs").doc(SLUG).set({ userId: UID });
  console.log(`✅ slugs/${SLUG} → { userId: "${UID}" }`);

  // 2. catalog/config
  await db
    .collection("users").doc(UID)
    .collection("catalog").doc("config")
    .set(catalogConfig);
  console.log("✅ catalog/config criado");

  // 3. kits
  for (const kit of kits) {
    const { id, ...data } = kit;
    await db
      .collection("users").doc(UID)
      .collection("kits").doc(id)
      .set({ ...data, active: true });
    console.log(`✅ kits/${id} — ${kit.name}`);
  }

  console.log("\n🎉 Seed concluído! Acesse o catálogo e o conteúdo real já aparece.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
