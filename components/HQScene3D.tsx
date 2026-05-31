"use client";
// NRP HQ — 3D spike (Phase 0). A react-three-fiber proof-of-concept: procedural
// "voxel" agents (built from boxes, no external 3D assets yet) seated at desks in
// a 3D room, an orbit camera you can drag to rotate, and click→AGENT DETAIL via
// R3F raycasting. Goal: validate feasibility + perf BEFORE investing in real
// voxel/model assets (see decisions/ADR-004). Pixel/chunky look = flatShading +
// antialias off. Loaded lazily (dynamic ssr:false) so three.js stays out of the
// main bundle until the 3D view is opened.

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { PIPELINE_STAGES } from "@/lib/pipeline";

// Per-agent look. At the team-overview zoom what reads is SILHOUETTE + COLOUR,
// so the differentiators are: outfit colour, hair colour, and hair *style*
// (the only geometry worth varying). Outfit colours are matched to each portrait.
// To swap in a real model later: add a <GltfAgent url> branch where ProceduralAgent
// is rendered (clean seam) — not wired now since there's no .glb to test against.
type HairStyle = "bob" | "bun" | "ponytail" | "long" | "curly" | "spiky";
const PROFILE: Record<string, { outfit: string; hair: string; style: HairStyle }> = {
  nora: { outfit: "#1565c0", hair: "#1a1a1a", style: "bob" },
  aria: { outfit: "#9e9e9e", hair: "#a0522d", style: "bun" },
  mia:  { outfit: "#e57399", hair: "#7a4a28", style: "bob" },
  luna: { outfit: "#37474f", hair: "#1a1a2e", style: "ponytail" },
  sage: { outfit: "#4caf50", hair: "#6d4c2f", style: "curly" },
  vera: { outfit: "#283593", hair: "#1c1c1c", style: "long" },
  rex:  { outfit: "#3949ab", hair: "#e65100", style: "spiky" },
  iris: { outfit: "#b0bec5", hair: "#cfd8dc", style: "bob" },
  zoe:  { outfit: "#d81b60", hair: "#e6c200", style: "curly" },
  nova: { outfit: "#f5c518", hair: "#9c27b0", style: "spiky" },
  lyra: { outfit: "#7cb342", hair: "#a0522d", style: "ponytail" },
};
const SKIN = "#ebc8a8";

// Hair geometry per style — 1–2 boxes each (silhouette differentiator).
function Hair({ color, style }: { color: string; style: HairStyle }) {
  const mat = <meshStandardMaterial color={color} flatShading />;
  return (
    <group>
      {/* base cap on top of the head */}
      <mesh position={[0, 1.76, -0.02]}>
        <boxGeometry args={[0.56, style === "curly" ? 0.34 : 0.24, 0.56]} />
        {mat}
      </mesh>
      {style === "bun" && (
        <mesh position={[0, 1.98, -0.05]}><boxGeometry args={[0.26, 0.26, 0.26]} />{mat}</mesh>
      )}
      {style === "ponytail" && (
        <mesh position={[0, 1.35, -0.34]}><boxGeometry args={[0.22, 0.7, 0.22]} />{mat}</mesh>
      )}
      {style === "long" && (
        <>
          <mesh position={[-0.3, 1.3, -0.05]}><boxGeometry args={[0.14, 0.7, 0.5]} />{mat}</mesh>
          <mesh position={[0.3, 1.3, -0.05]}><boxGeometry args={[0.14, 0.7, 0.5]} />{mat}</mesh>
        </>
      )}
      {style === "bob" && (
        <>
          <mesh position={[-0.29, 1.5, 0]}><boxGeometry args={[0.12, 0.4, 0.5]} />{mat}</mesh>
          <mesh position={[0.29, 1.5, 0]}><boxGeometry args={[0.12, 0.4, 0.5]} />{mat}</mesh>
        </>
      )}
      {style === "spiky" && (
        <>
          <mesh position={[-0.16, 1.96, 0]}><boxGeometry args={[0.12, 0.18, 0.12]} />{mat}</mesh>
          <mesh position={[0.04, 2.0, 0]}><boxGeometry args={[0.12, 0.22, 0.12]} />{mat}</mesh>
          <mesh position={[0.2, 1.95, 0]}><boxGeometry args={[0.12, 0.16, 0.12]} />{mat}</mesh>
        </>
      )}
    </group>
  );
}

// 4×3 desk grid → 3D positions (x, z). Centred on origin.
function deskPos(i: number): [number, number] {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return [(col - 1.5) * 2.4, (row - 1) * 2.8];
}

function VoxelAgent({
  x, z, stageId, selected, onSelect,
}: {
  x: number; z: number; stageId: string;
  selected: boolean; onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const p = PROFILE[stageId] ?? { outfit: "#888", hair: "#333", style: "bob" as HairStyle };
  const lift = selected ? 0.15 : 0;
  const hot = selected || hover;
  return (
    <group
      position={[x, lift, z]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "default"; }}
      scale={selected ? 1.12 : 1}
    >
      {/* legs */}
      <mesh position={[-0.16, 0.28, 0]} castShadow><boxGeometry args={[0.22, 0.55, 0.32]} /><meshStandardMaterial color="#2a2f3a" flatShading /></mesh>
      <mesh position={[0.16, 0.28, 0]} castShadow><boxGeometry args={[0.22, 0.55, 0.32]} /><meshStandardMaterial color="#2a2f3a" flatShading /></mesh>
      {/* torso (outfit) — emissive lifts on hover/select */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.72, 0.78, 0.44]} />
        <meshStandardMaterial color={p.outfit} flatShading emissive={p.outfit} emissiveIntensity={hot ? 0.5 : 0.14} />
      </mesh>
      {/* shoulders/arms */}
      <mesh position={[-0.46, 0.98, 0]} castShadow><boxGeometry args={[0.2, 0.62, 0.34]} /><meshStandardMaterial color={p.outfit} flatShading /></mesh>
      <mesh position={[0.46, 0.98, 0]} castShadow><boxGeometry args={[0.2, 0.62, 0.34]} /><meshStandardMaterial color={p.outfit} flatShading /></mesh>
      {/* head */}
      <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[0.5, 0.5, 0.46]} /><meshStandardMaterial color={SKIN} flatShading /></mesh>
      {/* hair (style-specific silhouette) */}
      <Hair color={p.hair} style={p.style} />

      {/* desk in front */}
      <mesh position={[0, 0.6, 0.78]} castShadow receiveShadow><boxGeometry args={[1.3, 0.12, 0.72]} /><meshStandardMaterial color="#3a4a63" flatShading /></mesh>
      <mesh position={[0, 0.3, 1.08]}><boxGeometry args={[1.2, 0.55, 0.08]} /><meshStandardMaterial color="#2e3b50" flatShading /></mesh>

      {/* selection ring */}
      {selected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 1.0, 28]} />
          <meshBasicMaterial color={p.outfit} />
        </mesh>
      )}
    </group>
  );
}

export default function HQScene3D({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <Canvas
      shadows
      dpr={1}
      gl={{ antialias: false }}
      camera={{ position: [0, 6.5, 9], fov: 45 }}
      style={{ position: "absolute", inset: 0, background: "#0a0e17" }}
      onPointerMissed={() => { /* click empty space: keep current selection */ }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow
        shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={["#2a3b55", "#0a0e17", 0.4]} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#1a2433" flatShading />
      </mesh>
      {/* grid lines for the HUD feel */}
      <gridHelper args={[24, 24, "#22d3ee", "#16202e"]} position={[0, 0.01, 0]} />

      {PIPELINE_STAGES.map((s, i) => {
        const [x, z] = deskPos(i);
        return (
          <VoxelAgent
            key={s.id}
            x={x}
            z={z}
            stageId={s.id}
            selected={selectedId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        );
      })}

      <OrbitControls enablePan={false} minDistance={5} maxDistance={16} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}
