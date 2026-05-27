// Product360 v2 — visualizador 3D REAL com react-three-fiber.
// Cada kit ganha uma cena estilizada (painel + arco de balões + bolo + props).
// Drag = rotaciona / Scroll = zoom / Auto-rotate quando ocioso.

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  ContactShadows,
  Html,
  Text3D,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { RotateCw, ZoomIn, MousePointer2 } from "lucide-react";

type Theme =
  | "princesa"
  | "safari"
  | "unicornio"
  | "floral"
  | "circo"
  | "rose"
  | "trono"
  | "generic";

function themeFromKit(kitName: string, theme: string): Theme {
  const s = `${kitName} ${theme}`.toLowerCase();
  if (s.includes("prince")) return "princesa";
  if (s.includes("safari")) return "safari";
  if (s.includes("unic")) return "unicornio";
  if (s.includes("flor")) return "floral";
  if (s.includes("circ")) return "circo";
  if (s.includes("ros")) return "rose";
  if (s.includes("trono")) return "trono";
  return "generic";
}

// =========== CENAS ===========

function Backdrop({ accent, theme }: { accent: string; theme: Theme }) {
  // Painel curvo atrás da composição
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(2.6, 2.6, 3.2, 64, 1, true, -0.9, 1.8);
    return g;
  }, []);

  const decorations = {
    princesa: "🏰",
    safari: "🌅",
    unicornio: "🌈",
    floral: "🌸",
    circo: "🎪",
    rose: "💗",
    trono: "👑",
    generic: "✨",
  }[theme];

  return (
    <group position={[0, 0.6, -0.6]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={accent}
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {/* Moldura dourada no topo */}
      <mesh position={[0, 1.7, 0]}>
        <torusGeometry args={[2.6, 0.04, 12, 80, Math.PI * 1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Letreiro 3D temático */}
      <Float floatIntensity={0.4} rotationIntensity={0.2} speed={1.2}>
        <Html position={[0, 1.1, 0.05]} center transform distanceFactor={3.2}>
          <div
            style={{
              fontSize: 28,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
              pointerEvents: "none",
            }}
          >
            {decorations}
          </div>
        </Html>
      </Float>
    </group>
  );
}

function BalloonArch({ accent }: { accent: string }) {
  const colors = useMemo(() => {
    const base = new THREE.Color(accent);
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);
    const c2 = new THREE.Color().setHSL((hsl.h + 0.05) % 1, hsl.s, Math.min(0.85, hsl.l + 0.15));
    const c3 = new THREE.Color("#ffffff");
    const c4 = new THREE.Color("#d4af37");
    return [base, c2, c3, c4];
  }, [accent]);

  const balloons = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; color: THREE.Color }[] = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = Math.PI * (0.15 + t * 0.7); // arco em cima
      const r = 2.2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r + 0.4;
      const z = -0.2 + Math.sin(t * Math.PI) * 0.3;
      const scale = 0.22 + Math.random() * 0.14;
      arr.push({
        pos: [x, y, z],
        scale,
        color: colors[i % colors.length],
      });
    }
    return arr;
  }, [colors]);

  return (
    <group>
      {balloons.map((b, i) => (
        <Float key={i} speed={1.6 + (i % 3) * 0.3} floatIntensity={0.25} rotationIntensity={0.1}>
          <mesh position={b.pos}>
            <sphereGeometry args={[b.scale, 24, 24]} />
            <meshStandardMaterial color={b.color} roughness={0.25} metalness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Cake({ accent, theme }: { accent: string; theme: Theme }) {
  const topper = {
    princesa: "👑",
    safari: "🦁",
    unicornio: "🦄",
    floral: "🌸",
    circo: "🤡",
    rose: "🌹",
    trono: "♛",
    generic: "🎂",
  }[theme];

  return (
    <group position={[0, -0.55, 0.4]}>
      {/* Base da mesa */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.18, 48]} />
        <meshStandardMaterial color="#f4e4d6" roughness={0.6} />
      </mesh>
      {/* Bolo 3 andares */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.45, 40]} />
        <meshStandardMaterial color="#fff5fa" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.35, 40]} />
        <meshStandardMaterial color={accent} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.3, 40]} />
        <meshStandardMaterial color="#fff5fa" roughness={0.4} />
      </mesh>
      {/* Topper */}
      <Float speed={2} floatIntensity={0.6} rotationIntensity={0.4}>
        <Html position={[0, 1.25, 0]} center transform distanceFactor={4}>
          <div style={{ fontSize: 24, pointerEvents: "none" }}>{topper}</div>
        </Html>
      </Float>
    </group>
  );
}

function Props3D({ theme, accent }: { theme: Theme; accent: string }) {
  const items: { emoji: string; pos: [number, number, number]; scale?: number }[] = useMemo(() => {
    switch (theme) {
      case "safari":
        return [
          { emoji: "🦁", pos: [-1.5, -0.5, 0.8] },
          { emoji: "🦒", pos: [1.5, -0.3, 0.7], scale: 1.2 },
          { emoji: "🐘", pos: [-1.8, -0.5, -0.3] },
          { emoji: "🌿", pos: [1.7, -0.5, -0.2] },
        ];
      case "unicornio":
        return [
          { emoji: "🦄", pos: [-1.5, -0.4, 0.7] },
          { emoji: "☁️", pos: [-1.6, 1.2, 0.2] },
          { emoji: "☁️", pos: [1.7, 0.9, -0.1] },
          { emoji: "🌈", pos: [1.5, -0.4, 0.7] },
        ];
      case "princesa":
        return [
          { emoji: "👸", pos: [-1.4, -0.4, 0.8] },
          { emoji: "🏰", pos: [1.6, -0.3, 0.6] },
          { emoji: "🎀", pos: [-1.7, 1.0, 0.1] },
          { emoji: "💎", pos: [1.7, 1.0, 0.1] },
        ];
      case "floral":
        return [
          { emoji: "🌸", pos: [-1.5, -0.4, 0.7] },
          { emoji: "🌷", pos: [1.5, -0.4, 0.7] },
          { emoji: "🌿", pos: [-1.8, 0.7, 0] },
          { emoji: "💐", pos: [1.8, 0.7, 0] },
        ];
      case "circo":
        return [
          { emoji: "🤡", pos: [-1.5, -0.4, 0.7] },
          { emoji: "🎪", pos: [1.5, -0.4, 0.6], scale: 1.3 },
          { emoji: "🎈", pos: [-1.8, 1.1, 0] },
          { emoji: "🍿", pos: [1.7, -0.5, 0] },
        ];
      case "rose":
        return [
          { emoji: "🌹", pos: [-1.4, -0.4, 0.7] },
          { emoji: "🥂", pos: [1.4, -0.4, 0.7] },
          { emoji: "✨", pos: [-1.7, 1.0, 0.1] },
          { emoji: "✨", pos: [1.7, 1.0, 0.1] },
        ];
      case "trono":
        return [
          { emoji: "👑", pos: [0, 1.4, 0.2], scale: 1.3 },
          { emoji: "🟥", pos: [-1.4, -0.55, 0.8] },
          { emoji: "🪟", pos: [1.4, 0.4, 0] },
        ];
      default:
        return [
          { emoji: "🎉", pos: [-1.5, -0.4, 0.7] },
          { emoji: "🎁", pos: [1.5, -0.4, 0.7] },
          { emoji: "✨", pos: [0, 1.6, 0.1] },
        ];
    }
  }, [theme]);

  return (
    <group>
      {items.map((it, i) => (
        <Float key={i} speed={1.4 + i * 0.2} floatIntensity={0.3} rotationIntensity={0.15}>
          <Html position={it.pos} center transform distanceFactor={3.4 / (it.scale ?? 1)}>
            <div
              style={{
                fontSize: 56,
                pointerEvents: "none",
                filter: `drop-shadow(0 6px 14px ${accent}55)`,
              }}
            >
              {it.emoji}
            </div>
          </Html>
        </Float>
      ))}
    </group>
  );
}

function Sparkles({ count = 50, accent }: { count?: number; accent: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = Math.random() * 3.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={accent} size={0.06} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
      <circleGeometry args={[3.5, 64]} />
      <meshStandardMaterial color="#f6e8ee" roughness={0.85} />
    </mesh>
  );
}

function StageScene({
  accent,
  theme,
  showCake = true,
}: {
  accent: string;
  theme: Theme;
  showCake?: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, 3]} color={accent} intensity={1.2} distance={10} />
      <pointLight position={[3, 1, -2]} color="#ffffff" intensity={0.6} distance={8} />

      <Floor />
      <Backdrop accent={accent} theme={theme} />
      <BalloonArch accent={accent} />
      {showCake && <Cake accent={accent} theme={theme} />}
      <Props3D theme={theme} accent={accent} />
      <Sparkles accent={accent} />

      <ContactShadows
        position={[0, -0.58, 0]}
        opacity={0.45}
        scale={6}
        blur={2.5}
        far={3}
        color="#1a0a14"
      />
      <Environment preset="apartment" />
    </>
  );
}

// =========== COMPONENTE PÚBLICO ===========

type Props = {
  src?: string;
  alt?: string;
  accent?: string;
  kitName: string;
  theme: string;
  className?: string;
};

export function Product360({
  accent = "#e879a0",
  kitName,
  theme,
  className = "",
}: Props) {
  const t = themeFromKit(kitName, theme);
  const [interacted, setInteracted] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.0, 6.5], fov: 45 }}
        dpr={[1, 2]}
        onPointerDown={() => setInteracted(true)}
        onWheel={() => setInteracted(true)}
        style={{ background: `radial-gradient(circle at 50% 40%, ${accent}30, transparent 70%)` }}
      >
        <Suspense fallback={null}>
          <StageScene accent={accent} theme={t} />
          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            target={[0, 0.8, 0]}
            minDistance={5}
            maxDistance={10}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={interacted ? 0 : 0.8}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="inline-flex items-center gap-3 px-4 h-9 rounded-full bg-card/80 backdrop-blur border border-border text-[10px] uppercase tracking-widest font-bold">
          <span className="inline-flex items-center gap-1.5">
            <RotateCw className="h-3 w-3 text-primary" /> 360°
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointer2 className="h-3 w-3 text-primary" /> arraste
          </span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1.5">
            <ZoomIn className="h-3 w-3 text-primary" /> zoom
          </span>
        </div>
      </div>

      {!interacted && (
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-widest font-bold animate-pulse">
          mergulhe na cena ✨
        </div>
      )}
    </div>
  );
}

// Sub-cena exportada (caso queira reaproveitar)
export { StageScene };
// noop import to keep tree-shaken types
void Center;
void Text3D;
