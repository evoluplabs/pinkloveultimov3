// Product360 v3 — DIORAMA CURVO COM PARALLAX
// A foto REAL do decorador é o herói: vai numa parede curva (cilíndrica) que
// o usuário gira/inclina com gestos. Acessórios extras flutuam como camadas
// 3D em frente à cena e podem ser ligados/desligados pelo usuário.
// Sem cenário sintético sobrepondo a foto.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  ContactShadows,
  Html,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { Hand, MoveVertical, Plus, Check, ImageOff } from "lucide-react";
import type { Extra } from "@/data/types";

// ============= CURVED PHOTO BILLBOARD =============
// Plano cilíndrico côncavo (vista de dentro) — dá sensação 360 mesmo com 1 foto.
function CurvedPhoto({ src, accent }: { src: string; accent: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState(1.5);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
        if (t.image?.width) setAspect(t.image.width / t.image.height);
      },
      undefined,
      () => setFailed(true),
    );
    return () => {
      tex?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Cilindro côncavo: altura fixa, largura derivada do aspect da foto.
  const height = 2.6;
  const width = height * aspect;
  // arco proporcional à largura (foto larga = arco maior; foto retrato = arco menor)
  const arc = Math.min(Math.PI * 0.95, Math.max(Math.PI * 0.45, width * 0.32));
  const radius = width / (2 * Math.sin(arc / 2));
  const geo = useMemo(
    () =>
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        96,
        1,
        true,
        -arc / 2 - Math.PI / 2,
        arc,
      ),
    [radius, height, arc],
  );

  if (failed) {
    return (
      <mesh position={[0, height / 2 - 0.2, 0]}>
        <planeGeometry args={[2.4, 1.8]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
        <Html center>
          <div className="flex flex-col items-center gap-1 text-white/80">
            <ImageOff className="h-6 w-6" />
            <span className="text-[10px] uppercase tracking-widest">sem foto</span>
          </div>
        </Html>
      </mesh>
    );
  }

  if (!tex) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Foto curvada */}
      <mesh geometry={geo} position={[0, height / 2 - 0.1, 0]}>
        <meshBasicMaterial
          map={tex}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {/* Moldura dourada superior */}
      <mesh position={[0, height - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.995, 0.025, 12, 96, arc]} />
        <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Brilho lateral suave (parallax fake) */}
      <pointLight
        position={[-radius * 0.7, height * 0.5, radius * 0.3]}
        color={accent}
        intensity={0.6}
        distance={6}
      />
      <pointLight
        position={[radius * 0.7, height * 0.5, radius * 0.3]}
        color="#fff5fa"
        intensity={0.5}
        distance={6}
      />
    </group>
  );
}

// ============= FLOOR =============
function Floor({ accent }: { accent: string }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[4.2, 64]} />
        <meshStandardMaterial color="#1a0a14" roughness={0.9} />
      </mesh>
      {/* halo no chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[0.6, 2.6, 64]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

// ============= ACCESSORIES (3D toggleable) =============
const ACCESSORY_EMOJI: Record<string, string> = {
  default: "🎁",
  bolo: "🎂",
  cake: "🎂",
  topo: "🎉",
  topper: "👑",
  balao: "🎈",
  balões: "🎈",
  flor: "🌸",
  floral: "🌸",
  rosa: "🌹",
  vela: "🕯️",
  candle: "🕯️",
  doce: "🍭",
  cupcake: "🧁",
  mesa: "🪑",
  cadeira: "🪑",
  presente: "🎁",
  letreiro: "💡",
  led: "💡",
  glitter: "✨",
  brinde: "🥂",
  tapete: "🟥",
  arco: "🌈",
  unicornio: "🦄",
  leão: "🦁",
  princesa: "👸",
  coroa: "👑",
};
function emojiForExtra(name: string, fallbackEmoji?: string) {
  if (fallbackEmoji) return fallbackEmoji;
  const k = name.toLowerCase();
  for (const key of Object.keys(ACCESSORY_EMOJI)) {
    if (k.includes(key)) return ACCESSORY_EMOJI[key];
  }
  return ACCESSORY_EMOJI.default;
}

function AccessoryNode({
  emoji,
  angle,
  accent,
}: {
  emoji: string;
  angle: number;
  accent: string;
}) {
  const radius = 2.4;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius * 0.55 + 0.6;
  const y = 0.55 + Math.sin(angle * 2) * 0.15;
  return (
    <Float speed={1.6} floatIntensity={0.5} rotationIntensity={0.2}>
      <Html
        position={[x, y, z]}
        center
        transform
        distanceFactor={4}
        sprite
      >
        <div
          className="pointer-events-none select-none"
          style={{
            fontSize: 64,
            filter: `drop-shadow(0 10px 22px ${accent}88)`,
          }}
        >
          {emoji}
        </div>
      </Html>
    </Float>
  );
}

// ============= SCENE =============
function DioramaScene({
  photoSrc,
  accent,
  accessories,
}: {
  photoSrc?: string;
  accent: string;
  accessories: { id: string; emoji: string }[];
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Floor accent={accent} />
      <Suspense fallback={null}>
        {photoSrc ? (
          <CurvedPhoto src={photoSrc} accent={accent} />
        ) : (
          <mesh position={[0, 1.2, 0]}>
            <planeGeometry args={[3.2, 2.2]} />
            <meshStandardMaterial color={accent} roughness={0.5} />
          </mesh>
        )}
      </Suspense>

      {accessories.map((a, i) => {
        // distribui em semicírculo na frente da cena
        const t = accessories.length === 1 ? 0 : i / (accessories.length - 1);
        const angle = -Math.PI / 3 + t * (Math.PI / 1.5);
        return (
          <AccessoryNode
            key={a.id}
            emoji={a.emoji}
            angle={angle}
            accent={accent}
          />
        );
      })}

      <ContactShadows
        position={[0, -0.04, 0]}
        opacity={0.55}
        scale={6}
        blur={2.6}
        far={3}
        color="#1a0a14"
      />
      <Environment preset="apartment" />
    </>
  );
}

// ============= PUBLIC COMPONENT =============
type Props = {
  kitName: string;
  theme?: string;
  accent?: string;
  photoSrc?: string;
  className?: string;
  /** Acessórios do kit para o usuário ligar/desligar na cena */
  extras?: Extra[];
  /** IDs selecionados — controlado externamente (no detalhe) */
  selectedExtraIds?: string[];
  /** Toggle local (usado quando viewer é standalone, ex.: cards) */
  allowExtraToggle?: boolean;
  /** Modo compacto = sem UI de acessórios, autoRotate, dpr menor (para cards) */
  compact?: boolean;
};

export function Product360({
  accent = "#e879a0",
  photoSrc,
  className = "",
  extras = [],
  selectedExtraIds,
  allowExtraToggle = true,
  compact = false,
}: Props) {
  const [interacted, setInteracted] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const selected = selectedExtraIds ?? localSelected;

  const visibleAccessories = useMemo(
    () =>
      extras
        .filter((e) => selected.includes(e.id))
        .map((e) => ({ id: e.id, emoji: emojiForExtra(e.name, e.emoji) })),
    [extras, selected],
  );

  const toggle = (id: string) => {
    if (selectedExtraIds && !allowExtraToggle) return;
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.4, 4.2], fov: 42 }}
        dpr={compact ? [1, 1.5] : [1, 2]}
        onPointerDown={() => setInteracted(true)}
        onWheel={() => setInteracted(true)}
        style={{
          background: `radial-gradient(circle at 50% 55%, ${accent}26, transparent 70%)`,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <DioramaScene
            photoSrc={photoSrc}
            accent={accent}
            accessories={visibleAccessories}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={!compact}
            enableDamping
            dampingFactor={0.1}
            target={[0, 1.2, 0]}
            minDistance={3.0}
            maxDistance={6.5}
            minPolarAngle={Math.PI / 2.8}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 2.2}
            maxAzimuthAngle={Math.PI / 2.2}
            autoRotate={!interacted || compact}
            autoRotateSpeed={compact ? 1.4 : 0.6}
          />
        </Suspense>
      </Canvas>

      {/* HUD com gestos */}
      {!compact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 h-9 rounded-full bg-card/80 backdrop-blur border border-border text-[10px] uppercase tracking-widest font-bold">
            <span className="inline-flex items-center gap-1.5">
              <Hand className="h-3 w-3 text-primary" /> arraste p/ girar
            </span>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MoveVertical className="h-3 w-3 text-primary" /> incline
            </span>
          </div>
        </div>
      )}

      {!compact && !interacted && (
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-widest font-bold animate-pulse">
          gire em 360° ✨
        </div>
      )}

      {/* Toggle de acessórios */}
      {!compact && extras.length > 0 && (
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 max-h-24 overflow-auto">
          {extras.map((e) => {
            const on = selected.includes(e.id);
            return (
              <button
                key={e.id}
                onClick={() => toggle(e.id)}
                className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold border transition backdrop-blur ${
                  on
                    ? "bg-primary text-primary-foreground border-primary shadow-petal"
                    : "bg-card/80 text-foreground/80 border-border hover:border-primary/50"
                }`}
                title={on ? "Remover da cena" : "Adicionar à cena"}
              >
                <span className="text-sm leading-none">
                  {emojiForExtra(e.name, e.emoji)}
                </span>
                <span className="hidden sm:inline">{e.name}</span>
                {on ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// keep loaders tree-shake friendly
void useLoader;
void useFrame;
