import React, { useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 1. Real 3D Grass Tufts (ত্রিমাত্রিক ঘাসের গুচ্ছ - অপ্টিমাইজড) ──
function RealGrassTufts() {
  // Generate random positions on green grass zones (avoiding roads and structures)
  const grassPositions = useMemo(() => {
    const list: [number, number, number, number][] = [];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let count = 0;
    for (let i = 0; i < 75; i++) {
      const angle = rng(i * 13.7) * Math.PI * 2;
      const radius = 6 + rng(i * 29.3) * 22;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Avoid main south road (|x| < 2.8 && z > 0)
      if (Math.abs(x) < 3.2 && z > -2 && z < 32) continue;
      // Avoid village house center ([-12, 9])
      if (Math.hypot(x - (-12), z - 9) < 6) continue;
      // Avoid seeker tower ([14, -12])
      if (Math.hypot(x - 14, z - (-12)) < 5.5) continue;
      // Avoid bridge tunnel ([-2, -13])
      if (Math.hypot(x - (-2), z - (-13)) < 5) continue;

      list.push([x, 0.02, z, rng(i * 7.1) * Math.PI * 2]);
      count++;
      if (count >= 48) break;
    }
    return list;
  }, []);

  return (
    <group>
      {grassPositions.map(([x, y, z, rotY], idx) => (
        <group key={idx} position={[x, y, z]} rotation={[0, rotY, 0]}>
          {/* Individual blade 1 - No castShadow for high mobile performance */}
          <mesh position={[0, 0.22, 0]} rotation={[0.15, 0, 0]}>
            <coneGeometry args={[0.04, 0.45, 4]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
          {/* Blade 2 */}
          <mesh position={[0.08, 0.18, 0]} rotation={[-0.2, 0.5, 0.2]}>
            <coneGeometry args={[0.035, 0.38, 4]} />
            <meshStandardMaterial color="#4ade80" roughness={0.65} />
          </mesh>
          {/* Blade 3 */}
          <mesh position={[-0.07, 0.16, 0.04]} rotation={[0.2, -0.6, -0.22]}>
            <coneGeometry args={[0.035, 0.34, 4]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
          {/* Occasional Meadow Wildflower */}
          {idx % 4 === 0 && (
            <group position={[0, 0.38, 0]}>
              <mesh>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshStandardMaterial
                  color={idx % 8 === 0 ? '#ef4444' : '#fef08a'}
                  roughness={0.4}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// ── 2. Madbox-Style Lush Volumetric Canopy Tree (ম্যাডবক্স ধাঁচের সুন্দর গোল ডালপালার গাছ) ──
export function MadboxDioramaTree({
  position,
  scale = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Tapered Wood Trunk */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.22, 0.42, 2.8, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>

      {/* Fluffy Volumetric Spherical Canopy Clustered like Madbox */}
      <group position={[0, 3.4, 0]}>
        {/* Central main foliage sphere */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <dodecahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#22c55e" roughness={0.65} flatShading />
        </mesh>
        {/* Left puff */}
        <mesh castShadow position={[-0.9, -0.1, 0.3]}>
          <dodecahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} flatShading />
        </mesh>
        {/* Right puff */}
        <mesh castShadow position={[0.85, 0.05, -0.25]}>
          <dodecahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial color="#4ade80" roughness={0.65} flatShading />
        </mesh>
        {/* Top crown puff */}
        <mesh castShadow position={[0.1, 1.1, -0.1]}>
          <dodecahedronGeometry args={[0.95, 1]} />
          <meshStandardMaterial color="#86efac" roughness={0.6} flatShading />
        </mesh>
        {/* Front puff */}
        <mesh castShadow position={[0.2, -0.2, 0.85]}>
          <dodecahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Smooth Low-Poly Trail Boulders (মসৃণ রঙিন পাথরের স্তূপ) ──
function TrailRocks() {
  const rockSpots: [number, number, number, number, string][] = [
    [3.5, 0.25, 8, 0.7, '#cbd5e1'],
    [-3.4, 0.2, 14, 0.65, '#94a3b8'],
    [3.6, 0.3, 22, 0.85, '#e2e8f0'],
    [-3.2, 0.25, 26, 0.75, '#94a3b8'],
    [-7.5, 0.2, 4.5, 0.6, '#cbd5e1'],
    [7.5, 0.25, -6.5, 0.7, '#94a3b8'],
  ];

  return (
    <group>
      {rockSpots.map(([x, y, z, scale, col], i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[x, y, z]}
          rotation={[0.3, i * 0.9, 0.2]}
          scale={scale}
        >
          <dodecahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial color={col} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Master Component: Arena Ground with Green Grass, Sand Roads & Real Grass ──
export function ArenaGround() {
  return (
    <group>
      {/* ── 1. Main Island Lush Green Plateau (মূল দ্বীপের প্রাণবন্ত সবুজ সমতল ভূমি) ── */}
      <mesh receiveShadow position={[0, -0.16, 0]}>
        <cylinderGeometry args={[31.8, 32.2, 0.32, 64]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.65}
          metalness={0.03}
        />
      </mesh>

      {/* Decorative Turf Ring Inset (গাঢ় সবুজ বৃত্তাকার প্যাটার্ন) */}
      <mesh receiveShadow position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 23.5, 64]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>

      {/* ── 2. Sand-Colored Roads & Trails (সোনালী বালুকাময় পথ ও রাস্তা) ── */}
      {/* Main South Beach Road leading to Pier (ঘাটের দিকে যাওয়া প্রধান বালির পথ) */}
      <mesh receiveShadow position={[0, 0.012, 16.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 27]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* Wooden boardwalk cross slats along the beach road */}
      {Array.from({ length: 15 }).map((_, i) => {
        const pz = 4.5 + i * 1.8;
        return (
          <mesh key={i} receiveShadow position={[0, 0.022, pz]}>
            <boxGeometry args={[4.0, 0.025, 0.35]} />
            <meshStandardMaterial color="#b45309" roughness={0.75} />
          </mesh>
        );
      })}

      {/* Trail to Bangladeshi Village Homestead (গ্রামের বাড়ির দিকে যাওয়া মাটির পথ) */}
      <mesh
        receiveShadow
        position={[-6, 0.012, 4.5]}
        rotation={[-Math.PI / 2, 0, 0.65]}
      >
        <planeGeometry args={[3.0, 14]} />
        <meshStandardMaterial color="#fde047" roughness={0.92} />
      </mesh>

      {/* Trail to Seeker Tower (টাওয়ারের দিকে যাওয়া বালুর পথ) */}
      <mesh
        receiveShadow
        position={[7, 0.012, -6]}
        rotation={[-Math.PI / 2, 0, -0.72]}
      >
        <planeGeometry args={[2.8, 16]} />
        <meshStandardMaterial color="#fde047" roughness={0.92} />
      </mesh>

      {/* Trail to Bush Thicket (ঝোপঝাড়ের দিকে যাওয়া বালুর পথ) */}
      <mesh
        receiveShadow
        position={[5.5, 0.012, 5.5]}
        rotation={[-Math.PI / 2, 0, 0.78]}
      >
        <planeGeometry args={[2.6, 12]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* Central Plaza Pattern (কেন্দ্রীয় মিলন চত্বর) */}
      <mesh receiveShadow position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 4.2, 32]} />
        <meshStandardMaterial color="#fde047" roughness={0.6} />
      </mesh>
      <mesh receiveShadow position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 32]} />
        <meshStandardMaterial color="#4ade80" roughness={0.65} />
      </mesh>

      {/* ── 3. Real 3D Grass Tufts & Wildflowers (Web only for 60FPS on phone) ── */}
      {Platform.OS === 'web' && <RealGrassTufts />}

      {/* ── 4. Trail Rocks & Boulders ── */}
      <TrailRocks />

      {/* ── 5. Madbox Stylized Diorama Canopy Trees ── */}
      <MadboxDioramaTree position={[-8, 0, -8]} scale={1.25} />
      <MadboxDioramaTree position={[18, 0, 4]} scale={1.15} />
      <MadboxDioramaTree position={[-18, 0, -14]} scale={1.3} />
      <MadboxDioramaTree position={[4, 0, -18]} scale={1.2} />

      {/* ── 6. Outer Bumper Ring / Perimeter (সুরক্ষা ঘেরাও) ── */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[31.8, 0.55, 16, 64]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Decorative Boundary Posts with Warm Lantern Lights */}
      {Array.from({ length: 16 }).map((_, i) => {
        // Skip southern pier opening at index 4 (around angle PI/2 / z ~ 31)
        if (i === 4) return null;

        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 31;
        const z = Math.sin(angle) * 31;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 1.4, 12]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#38bdf8' : '#f59e0b'}
                emissive={i % 2 === 0 ? '#38bdf8' : '#f59e0b'}
                emissiveIntensity={0.65}
              />
            </mesh>
          </group>
        );
      })}

      {/* Stepping Pads & Low Ramps */}
      <mesh castShadow receiveShadow position={[-6, 0.2, -6]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial color="#f87171" roughness={0.6} />
      </mesh>

      <mesh castShadow receiveShadow position={[-9, 0.4, -9]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[3.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#fb923c" roughness={0.6} />
      </mesh>

      {/* Ramp leading up */}
      <mesh castShadow receiveShadow position={[-3.5, 0.25, -6]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[3, 0.2, 2.5]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.6} />
      </mesh>
    </group>
  );
}
