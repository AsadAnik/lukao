import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PharaohPyramid, AnubisPyramid, BastetPyramid } from './desert-pyramids';
import { DesertWildlife } from './desert-wildlife';

// ── 1. Lightweight 60 FPS Desert Sand Dust & Heat Shimmer Weather (মরুঝড় ও বালুকণা) ──
function DesertSandDriftWeather({
  count = 90,
  center = [-85, 0, 75],
  radius = 32,
}: {
  count?: number;
  center?: [number, number, number];
  radius?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      pos[i * 3] = center[0] + Math.cos(angle) * dist;
      pos[i * 3 + 1] = 0.2 + Math.random() * 6.5; // Dust up to 6.5m
      pos[i * 3 + 2] = center[2] + Math.sin(angle) * dist;

      spd[i] = 1.5 + Math.random() * 2.2; // Horizontal wind speed
      off[i] = Math.random() * Math.PI * 2;
    }

    return [pos, spd, off];
  }, [count, center, radius]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Drift horizontally with desert sirocco wind
      arr[idx] += speeds[i] * dt;
      arr[idx + 1] += Math.sin(t * 2.5 + offsets[i]) * 0.2 * dt; // Gentle thermal turbulence
      arr[idx + 2] += Math.cos(t * 1.8 + offsets[i]) * 0.4 * dt;

      // Wrap around island bounds
      const dx = arr[idx] - center[0];
      const dz = arr[idx + 2] - center[2];
      if (Math.hypot(dx, dz) > radius || arr[idx] > center[0] + radius) {
        arr[idx] = center[0] - radius * 0.9;
        arr[idx + 1] = 0.2 + Math.random() * 4.5;
        arr[idx + 2] = center[2] + (Math.random() - 0.5) * radius * 1.8;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fde047"
        size={0.22}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── 2. Desert Joshua Tree ("Judge Tree" — মরুভূমির জোশুয়া গাছ) ──
function DesertJoshuaTree({
  position,
  scale = 1,
  rotationY = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Fibrous Twisted Trunk Base */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.22, 0.38, 1.8, 6]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>

      {/* Main Fork Left Branch */}
      <group position={[-0.2, 1.7, 0]} rotation={[0, 0, -0.45]}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
        {/* Spiky Yucca Foliage Pom-Pom Crown */}
        <group position={[0, 1.25, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.65, 8, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          {/* Spiky Tuft Daggers */}
          {[-0.3, 0, 0.3].map((px, i) => (
            <mesh key={i} position={[px, 0.3, 0]} rotation={[0, 0, (i - 1) * 0.4]}>
              <coneGeometry args={[0.12, 0.55, 4]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Main Fork Right Branch */}
      <group position={[0.25, 1.6, 0]} rotation={[0.2, 0, 0.5]}>
        <mesh castShadow position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.14, 0.19, 1.4, 6]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
        {/* Second Sub-Branch */}
        <group position={[0.1, 1.3, 0]} rotation={[0, 0, 0.4]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.1, 0.13, 0.7, 6]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          {/* Spiky Foliage Crown */}
          <mesh castShadow position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.55, 8, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ── 3. Desert Oasis Date Palm (খেজুর গাছ ও কাঁচা-পাকা খেজুর) ──
function OasisDatePalm({
  position,
  scale = 1,
  leanAngle = 0.18,
}: {
  position: [number, number, number];
  scale?: number;
  leanAngle?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[leanAngle, 0.6, 0]}>
      {/* Tall Ringed Trunk */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.24, 0.38, 5.0, 7]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Sprawling Palm Fronds Crown */}
      <group position={[0, 5.1, 0]}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const ang = (i / 7) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(ang) * 1.8, -0.4, Math.sin(ang) * 1.8]}
              rotation={[0.45, -ang, 0.3]}
              castShadow
            >
              <boxGeometry args={[0.45, 0.08, 3.2]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          );
        })}

        {/* Clusters of Ripe Golden Desert Dates */}
        {[-0.3, 0.3].map((dx, i) => (
          <mesh key={i} position={[dx, -0.45, 0]}>
            <sphereGeometry args={[0.26, 6, 6]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 4. The Oasis Freshwater Pond & Reeds (মরুদ্যানের পানির ঝিল ও নলখাগড়া) ──
function OasisFreshwaterPond({ position = [-7.5, 0, -8.5] }: { position?: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.08 + Math.sin(state.clock.elapsedTime * 2.0) * 0.015;
    }
  });

  return (
    <group position={position}>
      {/* Pond Sand Depression Basin Shelf */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[4.2, 5.4, 0.35, 24]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>

      {/* Crystal Clear Turquoise Freshwater Surface */}
      <mesh ref={waterRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 28]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Green Oasis Reeds & Papyrus along Pond Edges */}
      {[
        [-2.4, 0, 1.8],
        [2.6, 0, 1.5],
        [-1.8, 0, -2.4],
        [2.2, 0, -2.0],
      ].map(([rx, ry, rz], i) => (
        <group key={i} position={[rx, ry, rz]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 1.3, 5]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <coneGeometry args={[0.1, 0.35, 5]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        </group>
      ))}

      {/* Sunning Boulders around the pond */}
      {[
        [-3.2, 0.25, 0],
        [3.4, 0.3, -0.8],
      ].map(([bx, by, bz], i) => (
        <mesh key={i} castShadow position={[bx, by, bz]}>
          <sphereGeometry args={[0.65, 8, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── 5. Master Component: Expansive Level 3 Desert World Island (মরুভূমি ও পিরামিড — Radius ~48m) ──
export function DesertWorldIsland() {
  return (
    <group position={[-85, 0, 75]}>
      {/* ── 1. Submerged Desert Coastal Sand Reef (Radius ~50m) ── */}
      <mesh receiveShadow position={[0, -0.65, 0]}>
        <cylinderGeometry args={[48.0, 51.5, 0.45, 48]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ── 2. Sandstone Shoreline Shelf (Radius ~46m) ── */}
      <mesh receiveShadow position={[0, -0.32, 0]}>
        <cylinderGeometry args={[44.5, 47.8, 0.35, 48]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.9} />
      </mesh>

      {/* ── 3. Warm Terracotta Coastal Tier (Radius ~43m) ── */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[41.5, 44.5, 0.28, 48]} />
        <meshStandardMaterial color="#fde047" roughness={0.9} />
      </mesh>

      {/* ── 4. Main Expansive Golden Desert Sand Plateau (Radius ~40m — y = 0.10) ── */}
      <mesh receiveShadow position={[0, 0.10, 0]}>
        <cylinderGeometry args={[38.5, 42.0, 0.32, 48]} />
        <meshStandardMaterial color="#facc15" roughness={0.95} />
      </mesh>

      {/* ── 5. Rolling Sand Dunes: West Dune Ridge ── */}
      <group position={[-34.0, 0.48, 14.0]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[8.5, 12.0, 0.55, 24]} />
          <meshStandardMaterial color="#eab308" roughness={0.95} />
        </mesh>
        <mesh receiveShadow position={[1.5, 0.65, -1.0]}>
          <sphereGeometry args={[5.5, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.92} />
        </mesh>
      </group>

      {/* ── 6. Rolling Sand Dunes: East Dune Ridge ── */}
      <group position={[32.0, 0.48, 8.5]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[9.5, 13.0, 0.5, 22]} />
          <meshStandardMaterial color="#eab308" roughness={0.95} />
        </mesh>
      </group>

      {/* ── 7. Rolling Sand Dunes: South Coastal Ridge ── */}
      <group position={[-12.0, 0.45, -30.0]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[7.5, 11.0, 0.5, 20]} />
          <meshStandardMaterial color="#eab308" roughness={0.95} />
        </mesh>
      </group>

      {/* ── 8. Freshwater Oasis Pond with Reeds & Sunning Rocks ── */}
      <OasisFreshwaterPond position={[-7.5, 0, -8.5]} />

      {/* ── 9. Desert Joshua Trees ("Judge Trees") across the expanded landscape ── */}
      <DesertJoshuaTree position={[-18.5, 0.12, 18.5]} scale={1.2} rotationY={0.5} />
      <DesertJoshuaTree position={[14.0, 0.12, 22.5]} scale={1.15} rotationY={-0.8} />
      <DesertJoshuaTree position={[28.5, 0.12, -4.5]} scale={1.25} rotationY={1.2} />
      <DesertJoshuaTree position={[-28.5, 0.12, -18.5]} scale={1.1} rotationY={-0.3} />
      <DesertJoshuaTree position={[-34.5, 0.12, -2.5]} scale={1.3} rotationY={0.9} />
      <DesertJoshuaTree position={[2.5, 0.12, -26.5]} scale={1.15} rotationY={-1.1} />

      {/* ── 10. Desert Date Palms around Oasis & Dunes ── */}
      <OasisDatePalm position={[-11.5, 0.12, -13.5]} scale={1.1} leanAngle={0.22} />
      <OasisDatePalm position={[-4.5, 0.12, -13.0]} scale={1.2} leanAngle={-0.18} />
      <OasisDatePalm position={[-12.5, 0.12, -5.5]} scale={1.0} leanAngle={0.15} />
      <OasisDatePalm position={[-2.5, 0.12, -6.0]} scale={1.15} leanAngle={0.2} />
      <OasisDatePalm position={[30.0, 0.12, -15.0]} scale={1.1} leanAngle={-0.2} />

      {/* ── 11. GRAND GIZA TRIO: 3 PYRAMIDS WITH FULLY ENCLOSED THEMED INTERIORS ── */}
      {/* Pyramid 1: The Great Golden Pharaoh's Palace (26m x 26m — 7 Rooms) */}
      <PharaohPyramid position={[0, 0, 3.5]} />

      {/* Pyramid 2: The Temple of Anubis & Arcane Crypts (18m x 18m — 4 Rooms) */}
      <AnubisPyramid position={[-25, 0, 0]} />

      {/* Pyramid 3: Citadel of Bastet & Queen's Palace (16m x 16m — 4 Rooms) */}
      <BastetPyramid position={[20, 0, -22]} />

      {/* ── 12. Desert Wildlife Kingdom (Drinking Horses, Camels, Snakes, Soaring Eagles) ── */}
      <DesertWildlife />

      {/* ── 13. Desert Arrival Pier & Dolphin/Boat Dock (Edge of Island ~34m) ── */}
      <group position={[24.0, 0, -32.0]} rotation={[0, -0.65, 0]}>
        {/* Main Sandstone Planks */}
        <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[3.0, 0.22, 6.0]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {/* Sand Dusting Layer */}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[2.7, 0.04, 5.7]} />
          <meshStandardMaterial color="#facc15" roughness={0.9} />
        </mesh>
        {/* Heavy Stone Pilings */}
        {[-1.3, 1.3].map((px, i) => (
          <mesh key={i} position={[px, -0.45, 2.6]}>
            <cylinderGeometry args={[0.15, 0.18, 1.8, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ── 14. Drifting Sand Dust Weather Engine (Expanded ~46m Radius) ── */}
      <DesertSandDriftWeather count={100} center={[0, 0, 0]} radius={46} />
    </group>
  );
}

