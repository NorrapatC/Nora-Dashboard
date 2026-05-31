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

// hair colour per agent (body colour comes from agent.color)
const HAIR: Record<string, string> = {
  nora: "#1a1a1a", aria: "#a0522d", mia: "#7a4a28", luna: "#1a1a2e", sage: "#6d4c2f",
  vera: "#1c1c1c", iris: "#cfd8dc", zoe: "#e6c200", rex: "#e65100", nova: "#9c27b0", lyra: "#a0522d",
};
const SKIN = "#ebc8a8";

// 4×3 desk grid → 3D positions (x, z). Centred on origin.
function deskPos(i: number): [number, number] {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return [(col - 1.5) * 2.4, (row - 1) * 2.8];
}

function VoxelAgent({
  x, z, body, hair, selected, onSelect, name,
}: {
  x: number; z: number; body: string; hair: string;
  selected: boolean; onSelect: () => void; name: string;
}) {
  const [hover, setHover] = useState(false);
  const lift = selected ? 0.15 : 0;
  return (
    <group
      position={[x, lift, z]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "default"; }}
      scale={selected ? 1.12 : 1}
    >
      {/* legs */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.35]} />
        <meshStandardMaterial color="#2a2a2a" flatShading />
      </mesh>
      {/* torso (agent colour) */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.7, 0.75, 0.42]} />
        <meshStandardMaterial color={body} flatShading
          emissive={body} emissiveIntensity={selected || hover ? 0.5 : 0.12} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.48, 0.48, 0.45]} />
        <meshStandardMaterial color={SKIN} flatShading />
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.74, -0.02]} castShadow>
        <boxGeometry args={[0.54, 0.22, 0.52]} />
        <meshStandardMaterial color={hair} flatShading />
      </mesh>
      {/* desk in front */}
      <mesh position={[0, 0.55, 0.75]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.12, 0.7]} />
        <meshStandardMaterial color="#3a4a63" flatShading />
      </mesh>
      <mesh position={[0, 0.25, 1.05]}>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial color="#2e3b50" flatShading />
      </mesh>
      {/* selection ring on the floor */}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.95, 24]} />
          <meshBasicMaterial color={body} />
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
            name={s.agent.name}
            body={s.agent.color}
            hair={HAIR[s.id] ?? "#333"}
            selected={selectedId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        );
      })}

      <OrbitControls enablePan={false} minDistance={5} maxDistance={16} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}
