"use client";
// HeroRoom3D — a procedural low-poly isometric workspace, in the style of the
// david-hckh.com reference (and image/istockphoto room). Built entirely from R3F
// primitives (no external .glb yet) so it's free + editable. Gently auto-rotates.
// Transparent background → sits on the light /hire hero. A real .glb avatar/room
// can replace this later via a clean component swap.

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const BRAND = "#c96442";

function Books({ x }: { x: number }) {
  const cols = ["#c96442", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9"];
  return (
    <group position={[x, 2.6, -2.55]}>
      {cols.map((c, i) => (
        <mesh key={i} position={[i * 0.18 - 0.45, 0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.44, 0.3]} />
          <meshStandardMaterial color={c} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[7, 7, 0.3]} />
        <meshStandardMaterial color="#f3ece1" flatShading />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 1.85, -3.35]} receiveShadow>
        <boxGeometry args={[7, 4.5, 0.3]} />
        <meshStandardMaterial color="#fbf4ea" flatShading />
      </mesh>
      {/* left wall */}
      <mesh position={[-3.35, 1.85, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.5, 7]} />
        <meshStandardMaterial color="#f6eddf" flatShading />
      </mesh>

      {/* window on left wall */}
      <group position={[-3.18, 2.3, 0.4]}>
        <mesh><boxGeometry args={[0.12, 2.2, 2.6]} /><meshStandardMaterial color="#ffffff" flatShading /></mesh>
        <mesh position={[0.08, 0, 0]}><boxGeometry args={[0.04, 1.9, 2.3]} /><meshStandardMaterial color="#dbeafe" emissive="#dbeafe" emissiveIntensity={0.5} flatShading /></mesh>
      </group>

      {/* shelf + books on back wall */}
      <mesh position={[1.4, 2.45, -3.05]} castShadow><boxGeometry args={[3, 0.12, 0.6]} /><meshStandardMaterial color="#ffffff" flatShading /></mesh>
      <Books x={1.0} />
      <Books x={2.2} />
      {/* picture frame */}
      <mesh position={[-1.4, 2.6, -3.18]}><boxGeometry args={[0.7, 0.9, 0.06]} /><meshStandardMaterial color={BRAND} flatShading /></mesh>

      {/* desk top */}
      <mesh position={[0.2, 1.05, -2.0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.16, 1.6]} />
        <meshStandardMaterial color="#efe7da" flatShading />
      </mesh>
      {/* desk legs */}
      {[[-1.7, -2.6], [2.0, -2.6], [-1.7, -1.4], [2.0, -1.4]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx + 0.2, 0.5, lz + 0.6]} castShadow><boxGeometry args={[0.12, 1.0, 0.12]} /><meshStandardMaterial color="#d9cdbb" flatShading /></mesh>
      ))}

      {/* dual monitors */}
      <group position={[-0.6, 1.7, -2.35]}>
        <mesh castShadow><boxGeometry args={[1.5, 0.95, 0.08]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[1.36, 0.82, 0.02]} /><meshStandardMaterial color="#1e2433" emissive="#1e2433" emissiveIntensity={0.6} flatShading /></mesh>
        {/* code lines */}
        {[0.28, 0.14, 0, -0.14, -0.28].map((yy, i) => (
          <mesh key={i} position={[-0.3 + (i % 2) * 0.1, yy, 0.07]}><boxGeometry args={[0.5 + (i % 3) * 0.18, 0.04, 0.01]} /><meshStandardMaterial color={["#34d399", "#22d3ee", "#fbbf24", "#f87171", "#a78bfa"][i]} /></mesh>
        ))}
        <mesh position={[0, -0.62, 0.1]}><boxGeometry args={[0.18, 0.3, 0.1]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>
      </group>
      <group position={[1.05, 1.62, -2.4]} rotation={[0, -0.35, 0]}>
        <mesh castShadow><boxGeometry args={[1.2, 0.8, 0.08]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[1.06, 0.68, 0.02]} /><meshStandardMaterial color="#eef4ff" emissive="#eef4ff" emissiveIntensity={0.4} flatShading /></mesh>
        <mesh position={[0, -0.52, 0.1]}><boxGeometry args={[0.16, 0.26, 0.1]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>
      </group>

      {/* keyboard + mouse + mug */}
      <mesh position={[0, 1.16, -1.6]} castShadow><boxGeometry args={[1.1, 0.06, 0.4]} /><meshStandardMaterial color="#2e3440" flatShading /></mesh>
      <mesh position={[0.95, 1.16, -1.55]} castShadow><boxGeometry args={[0.22, 0.06, 0.32]} /><meshStandardMaterial color="#3a4150" flatShading /></mesh>
      <mesh position={[-1.4, 1.25, -1.7]} castShadow><cylinderGeometry args={[0.13, 0.13, 0.28, 12]} /><meshStandardMaterial color={BRAND} flatShading /></mesh>

      {/* chair (brand colour) */}
      <group position={[0.2, 0, -0.4]}>
        <mesh position={[0, 0.95, 0]} castShadow><boxGeometry args={[0.95, 0.16, 0.9]} /><meshStandardMaterial color={BRAND} flatShading /></mesh>
        <mesh position={[0, 1.5, 0.45]} castShadow><boxGeometry args={[0.95, 1.1, 0.16]} /><meshStandardMaterial color={BRAND} flatShading /></mesh>
        <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.08, 0.08, 0.7, 10]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.45, 0.16, Math.sin(a) * 0.45]} castShadow><boxGeometry args={[0.4, 0.12, 0.12]} /><meshStandardMaterial color="#33373f" flatShading /></mesh>;
        })}
      </group>

      {/* plant */}
      <group position={[-2.5, 0, -2.3]}>
        <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.28, 0.22, 0.5, 10]} /><meshStandardMaterial color={BRAND} flatShading /></mesh>
        <mesh position={[0, 0.95, 0]} castShadow><dodecahedronGeometry args={[0.45, 0]} /><meshStandardMaterial color="#4caf50" flatShading /></mesh>
        <mesh position={[0.15, 1.25, 0.1]} castShadow><dodecahedronGeometry args={[0.28, 0]} /><meshStandardMaterial color="#43a047" flatShading /></mesh>
      </group>

      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.16, -0.2]} receiveShadow>
        <boxGeometry args={[3.4, 2.8, 0.04]} />
        <meshStandardMaterial color="#fdf3ef" flatShading />
      </mesh>
    </group>
  );
}

export default function HeroRoom3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8.5, 7, 8.5], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 11, 5]} intensity={1.15} castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <hemisphereLight args={["#ffffff", "#e8dfd0", 0.5]} />
      <Room />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.6}
        target={[0, 0.6, -1]}
      />
    </Canvas>
  );
}
