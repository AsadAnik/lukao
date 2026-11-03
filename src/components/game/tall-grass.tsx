import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';

/**
 * Strategic Tall Long Grass & Kashful Grove Coordinates on Main Island (কাশফুলের বন ও দীর্ঘ বুনো ঘাস)
 * Used both for 3D rendering and for real-time player stealth/concealment detection.
 */
export const TALL_GRASS_PATCHES: [number, number, number][] = [
  [-17.0, 0, 14.5], // 1. Village garden / courtyard edge (near banana grove)
  [-16.5, 0, 2.5],  // 2. Village back perimeter behind haystacks
  [-6.5, 0, 24.5],  // 3. South-west coastal dune approach to dolphin pier
  [6.2, 0, 21.0],   // 4. South-east grassy meadow slope
  [-6.8, 0, -17.5], // 5. Arch bridge stream approach (riverbank wild reeds)
  [3.5, 0, -16.8],  // 6. Arch bridge creek basin
  [17.5, 0, -3.2],  // 7. East wild meadow ridge behind central plaza
  [11.0, 0, 4.5],   // 8. Forest margin near Seeker hillock
];

interface BladeData {
  offset: [number, number, number];
  height: number;
  width: number;
  leanX: number;
  leanZ: number;
  color: string;
  hasKashful: boolean;
  kashfulHeight: number;
  phase: number;
}

/**
 * Lush Clustered Kashful Patch (কাশফুল ও দীর্ঘ বুনো ঘাস)
 * Rich dense stalks with feathery white Kashful plumes and natural wind sway.
 */
function SingleTallGrassPatch({
  position,
  seed = 0,
}: {
  position: [number, number, number];
  seed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Full lush 14-stalk cluster with authentic variety
  const blades = useMemo<BladeData[]>(() => {
    const list: BladeData[] = [];
    const count = 14;
    const rng = (s: number) => {
      const v = Math.sin(s) * 10000;
      return v - Math.floor(v);
    };

    const palette = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#14532d'];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng(seed * 11 + i * 3) * 0.45;
      const radius = 0.2 + rng(seed * 19 + i * 7) * 0.85;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;

      const height = 1.35 + rng(seed * 31 + i * 13) * 0.55;
      const width = 0.05 + rng(seed * 43 + i * 17) * 0.02;
      const leanX = (rng(seed * 53 + i * 23) - 0.5) * 0.26;
      const leanZ = (rng(seed * 67 + i * 29) - 0.5) * 0.26;
      const color = palette[i % palette.length];
      const hasKashful = i % 2 === 0;
      const kashfulHeight = 0.38 + rng(seed * 71 + i * 31) * 0.22;
      const phase = rng(seed * 83 + i * 37) * Math.PI * 2;

      list.push({
        offset: [bx, 0, bz],
        height,
        width,
        leanX,
        leanZ,
        color,
        hasKashful,
        kashfulHeight,
        phase,
      });
    }
    return list;
  }, [seed]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Check player proximity for interactive rustle
    const pX = playerTransform.position.x;
    const pZ = playerTransform.position.z;
    const distToPlayer = Math.hypot(pX - position[0], pZ - position[2]);
    const isInside = distToPlayer < 1.7;
    const boost = isInside ? 2.2 : 1.0;

    // Natural wind wave sway across the patch
    const wind = Math.sin(time * 2.2 * boost + seed * 0.5);
    groupRef.current.rotation.z = wind * 0.05 * boost;
    groupRef.current.rotation.x = Math.cos(time * 1.8 * boost + seed * 0.5) * 0.03 * boost;
  });

  return (
    <group position={position}>
      {/* Fertile earthen mound at base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[1.05, 1.2, 0.06, 10]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>

      {/* Swaying Stalks Container */}
      <group ref={groupRef}>
        {blades.map((b, idx) => (
          <group
            key={idx}
            position={b.offset}
            rotation={[b.leanZ, 0, b.leanX]}
          >
            {/* Main Tapered Grass Blade */}
            <mesh position={[0, b.height / 2, 0]}>
              <coneGeometry args={[b.width, b.height, 4]} />
              <meshStandardMaterial color={b.color} roughness={0.7} />
            </mesh>

            {/* White Silvery Kashful Plume Flower (কাশফুলের নরম সাদা চামর) */}
            {b.hasKashful && (
              <group position={[0, b.height * 0.92, 0]}>
                {/* Fluffy plume base */}
                <mesh position={[0, b.kashfulHeight * 0.35, 0]}>
                  <cylinderGeometry
                    args={[b.width * 1.5, b.width * 0.8, b.kashfulHeight * 0.7, 5]}
                  />
                  <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                </mesh>
                {/* Silky plume tip */}
                <mesh position={[0, b.kashfulHeight * 0.75, 0]}>
                  <coneGeometry
                    args={[b.width * 1.4, b.kashfulHeight * 0.55, 5]}
                  />
                  <meshStandardMaterial color="#ffffff" roughness={0.85} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * Master Tall Long Grass Groves Component (কাশফুলের বন)
 * Renders lush, authentic Kashful groves across the main island.
 */
export function TallGrassGroves() {
  return (
    <group>
      {TALL_GRASS_PATCHES.map((pos, idx) => (
        <SingleTallGrassPatch key={idx} position={pos} seed={idx + 42} />
      ))}
    </group>
  );
}
