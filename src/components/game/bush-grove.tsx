import React from 'react';

interface BushProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

// ── Madbox-Style Volumetric Concealment Bush (ঘন সুন্দর ঝোপঝাড়) ──
export function StylizedBush({ position, scale = 1, color = '#16a34a' }: BushProps) {
  return (
    <group position={position} scale={scale}>
      {/* Central main foliage cluster */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <dodecahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} flatShading />
      </mesh>
      {/* Front right puff */}
      <mesh castShadow receiveShadow position={[0.55, 0.45, 0.35]}>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#22c55e" roughness={0.65} flatShading />
      </mesh>
      {/* Back left puff */}
      <mesh castShadow receiveShadow position={[-0.45, 0.55, -0.3]}>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#15803d" roughness={0.75} flatShading />
      </mesh>
      {/* Top crown bud */}
      <mesh castShadow receiveShadow position={[0.1, 1.1, 0.1]}>
        <dodecahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} flatShading />
      </mesh>
      {/* Small Berry dots */}
      <mesh position={[0.4, 0.8, 0.7]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <mesh position={[-0.4, 0.6, 0.7]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── Madbox-Style Tiered Pine / Alpine Conifer (ম্যাডবক্স ধাঁচের দেবদারু গাছ) ──
export function StylizedPineTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Warm Amber Timber Trunk */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.22, 0.38, 2.2, 8]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      {/* Tier 1 (Bottom broad cone) */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[1.9, 1.9, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} flatShading />
      </mesh>
      {/* Tier 2 (Middle cone) */}
      <mesh castShadow position={[0, 3.6, 0]}>
        <coneGeometry args={[1.45, 1.7, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.65} flatShading />
      </mesh>
      {/* Tier 3 (Top bright cone) */}
      <mesh castShadow position={[0, 4.6, 0]}>
        <coneGeometry args={[0.95, 1.4, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

// ── Madbox-Style Volumetric Cloud Tree (গোল সুন্দর ডালপালার গাছ) ──
export function StylizedCanopyTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk with slight curve */}
      <mesh castShadow position={[0, 1.5, 0]} rotation={[0.04, 0, -0.06]}>
        <cylinderGeometry args={[0.24, 0.44, 3.0, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      {/* Volumetric Puffy Canopy */}
      <group position={[0, 3.5, 0]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <dodecahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#22c55e" roughness={0.65} flatShading />
        </mesh>
        <mesh castShadow position={[-0.8, -0.1, 0.3]}>
          <dodecahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} flatShading />
        </mesh>
        <mesh castShadow position={[0.8, 0.1, -0.3]}>
          <dodecahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#4ade80" roughness={0.6} flatShading />
        </mesh>
        <mesh castShadow position={[0, 1.1, 0]}>
          <dodecahedronGeometry args={[1.0, 1]} />
          <meshStandardMaterial color="#86efac" roughness={0.55} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// Backward-compatible alias
export const StylizedTree = StylizedPineTree;

// ── Strategic Bush Thicket Zone (ঝোপের লুকোচুরি আঙিনা) ──
export function BushGrove({ position = [10, 0, 10] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Mix of stylized canopy tree and pine trees */}
      <StylizedCanopyTree position={[-2.2, 0, -2]} scale={1.15} />
      <StylizedPineTree position={[2.8, 0, -1]} scale={1.1} />
      <StylizedPineTree position={[0, 0, 3.4]} scale={1.25} />

      {/* Concealment Bushes creating a hiding thicket */}
      <StylizedBush position={[0, 0, 0]} scale={1.9} color="#15803d" />
      <StylizedBush position={[-1.6, 0, 1.2]} scale={1.6} color="#16a34a" />
      <StylizedBush position={[1.4, 0, 1.5]} scale={1.7} color="#22c55e" />
      <StylizedBush position={[1.8, 0, -1.8]} scale={1.5} color="#15803d" />
      <StylizedBush position={[-1.2, 0, -1.5]} scale={1.4} color="#16a34a" />

      {/* Forest Mushrooms */}
      {[
        [-0.8, 0.2, 1.8],
        [-0.5, 0.15, 2.1],
        [1.8, 0.18, 0.5],
        [0.2, 0.15, -1.4],
      ].map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.2, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.13, 10, 10]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#ef4444' : '#f59e0b'} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
