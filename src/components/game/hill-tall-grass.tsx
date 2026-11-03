import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';

/**
 * Strategic Tall Mountain Grass (কাশফুল ও দীর্ঘ পাহাড়ি ঘাস) Coordinates for Level 4: Mayabi Hill Tracts.
 * Centered around Level 4 Island at [-60, 0, -85].
 * Used for both 3D visual rendering and kinematic player stealth/concealment detection.
 */
export const HILL_TALL_GRASS_PATCHES: [number, number, number][] = [
  [-68.0, 0.2, -72.0], // 1. Rivermouth marshland approach from dock
  [-52.0, 0.2, -74.0], // 2. East riverbank lower bend
  [-66.0, 0.4, -82.0], // 3. Lower gorge west bank under bridge shadow
  [-54.0, 0.4, -84.0], // 4. Lower gorge east bank near arched footbridge
  [-74.0, 2.5, -88.0], // 5. West hill lower terrace meadow
  [-46.0, 2.2, -88.0], // 6. East hill lower terrace meadow
  [-64.0, 0.6, -96.0], // 7. Plunge pool mist bank near waterfall
  [-56.0, 0.6, -98.0], // 8. Deep waterfall spray clearing
  [-76.0, 6.5, -96.0], // 9. Emerald peak mid-tier mountain trail
  [-44.0, 5.5, -94.0], // 10. Cloud crag mid-tier mountain trail
  [-70.0, 8.2, -84.0], // 11. Suspension bridge west anchor clearing
  [-50.0, 8.2, -84.0], // 12. Suspension bridge east anchor clearing
];

interface BladeData {
  offset: [number, number, number];
  height: number;
  width: number;
  leanX: number;
  leanZ: number;
  color: string;
  hasPlume: boolean;
  plumeHeight: number;
  phase: number;
}

/**
 * Dense Mountain Pampas / Kashful Cluster with Feathery White Plumes & Wind Sway
 */
function SingleHillGrassPatch({
  position,
  seed = 0,
}: {
  position: [number, number, number];
  seed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const blades = useMemo<BladeData[]>(() => {
    const list: BladeData[] = [];
    const count = 16;
    const rng = (s: number) => {
      const v = Math.sin(s) * 10000;
      return v - Math.floor(v);
    };

    const palette = ['#15803d', '#16a34a', '#22c55e', '#166534', '#14532d'];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng(seed * 13 + i * 3) * 0.45;
      const radius = 0.2 + rng(seed * 17 + i * 7) * 0.95;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;

      // Tall stalks: 1.6m to 2.2m for complete crouching stealth
      const height = 1.6 + rng(seed * 7 + i * 11) * 0.65;
      const width = 0.08 + rng(seed * 5 + i * 13) * 0.05;
      const leanX = (rng(seed * 3 + i * 17) - 0.5) * 0.45;
      const leanZ = (rng(seed * 19 + i * 5) - 0.5) * 0.45;
      const color = palette[Math.floor(rng(seed * 23 + i) * palette.length)];

      // 60% of blades have fluffy mountain kashful plumes
      const hasPlume = rng(seed * 31 + i) > 0.4;
      const plumeHeight = 0.45 + rng(seed * 37 + i) * 0.25;
      const phase = rng(seed * 41 + i) * Math.PI * 2;

      list.push({
        offset: [bx, 0, bz],
        height,
        width,
        leanX,
        leanZ,
        color,
        hasPlume,
        plumeHeight,
        phase,
      });
    }

    return list;
  }, [seed]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Mountain breeze with gentle gusting turbulence
    const gust = Math.sin(t * 1.8 + seed) * 0.08 + Math.cos(t * 0.7) * 0.04;
    groupRef.current.rotation.z = gust;
    groupRef.current.rotation.x = Math.cos(t * 1.5 + seed * 0.5) * 0.05;

    // React to player movement: part the grass when player steps through
    const playerPos = playerTransform.position;
    const dx = playerPos.x - position[0];
    const dz = playerPos.z - position[2];
    const distSq = dx * dx + dz * dz;

    if (distSq < 1.8 && distSq > 0.01) {
      const dist = Math.sqrt(distSq);
      const pushFactor = (1.35 - dist) * 0.22;
      groupRef.current.rotation.z += (dx / dist) * pushFactor;
      groupRef.current.rotation.x += (dz / dist) * pushFactor;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {blades.map((b, i) => (
        <group
          key={i}
          position={b.offset}
          rotation={[b.leanX, (i * Math.PI) / 8, b.leanZ]}
        >
          {/* Slender Flexible Green Stalk */}
          <mesh position={[0, b.height * 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.015, b.width * 0.4, b.height, 5]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Feathery White/Silver Kashful Plume Crown */}
          {b.hasPlume && (
            <mesh position={[0, b.height - 0.05, 0]} castShadow>
              <coneGeometry args={[0.11, b.plumeHeight, 6]} />
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/**
 * Master Hill Tall Grass System for Level 4
 */
export function HillTallGrassSystem() {
  return (
    <group>
      {HILL_TALL_GRASS_PATCHES.map((pos, idx) => (
        <SingleHillGrassPatch key={idx} position={pos} seed={idx * 17 + 3} />
      ))}
    </group>
  );
}

