import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HillTallGrassSystem } from './hill-tall-grass';
import { CelestialMaidensKingdom } from './celestial-maidens';

// ── 1. Monsoon Rain & Atmospheric Droplets ──
function MonsoonRainWeather({
  count = 140,
  center = [0, 0, 0],
  radius = 45,
}: {
  count?: number;
  center?: [number, number, number];
  radius?: number;
}) {
  const rainRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      pos[i * 3] = center[0] + Math.cos(angle) * dist;
      pos[i * 3 + 1] = 0.5 + Math.random() * 18.0;
      pos[i * 3 + 2] = center[2] + Math.sin(angle) * dist;
      spd[i] = 13.0 + Math.random() * 7.0;
    }

    return [pos, spd];
  }, [count, center, radius]);

  useFrame((_, delta) => {
    if (!rainRef.current) return;
    const dt = Math.min(delta, 0.05);
    const geom = rainRef.current.geometry;
    const posAttr = geom.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 1] -= speeds[i] * dt;
      arr[idx] += 0.8 * dt; // Wind drift

      if (arr[idx + 1] < 0.2) {
        arr[idx + 1] = 16.5 + Math.random() * 3.5;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * radius;
        arr[idx] = center[0] + Math.cos(angle) * dist;
        arr[idx + 2] = center[2] + Math.sin(angle) * dist;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#bae6fd"
        size={0.18}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── 2. Glowing Night Fireflies (জোনাকি পোকা) ──
function EerieFireflySwarm({ count = 48 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4.0 + Math.random() * 34.0;
      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = 0.8 + Math.random() * 5.5;
      pos[i * 3 + 2] = Math.sin(angle) * dist;
      ph[i] = Math.random() * Math.PI * 2;
    }

    return [pos, ph];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx] += Math.sin(t * 1.6 + phases[i]) * 0.45 * dt;
      arr[idx + 1] += Math.cos(t * 1.3 + phases[i]) * 0.28 * dt;
      arr[idx + 2] += Math.cos(t * 1.7 + phases[i]) * 0.45 * dt;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a3e635"
        size={0.3}
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── 3. Madbox-Style Conic Pine Trees (ম্যাডবক্স স্টাইলের কোন আকৃতির পাইন গাছ) ──
function MadboxPineTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Cylindrical Trunk */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.3, 7]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* 3 Tiered Faceted Cones */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <coneGeometry args={[1.4, 1.6, 7]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 2.7, 0]}>
        <coneGeometry args={[1.1, 1.4, 7]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[0.75, 1.2, 7]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── 4. Madbox-Style Cozy Mountain Timber Lodge / Cabin ──
function MadboxMountainLodge({
  position = [11.0, 4.2, -10.0],
  rotationY = -0.4,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Cabin Base Walls */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[4.2, 2.2, 3.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* Front Overhanging Porch Deck */}
      <mesh castShadow receiveShadow position={[0, 0.15, 2.2]}>
        <boxGeometry args={[4.6, 0.3, 1.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Porch Columns */}
      {[-1.9, 1.9].map((px, i) => (
        <mesh key={i} position={[px, 1.1, 2.7]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 2.2, 6]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
      ))}
      {/* Gabled Shingle Roof */}
      <mesh castShadow position={[0, 2.8, 0.3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3.2, 1.8, 4]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
      </mesh>
      {/* Stone Chimney */}
      <mesh castShadow position={[1.4, 3.2, -0.6]}>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Warm Glowing Front Lantern */}
      <mesh position={[0, 1.7, 1.75]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 1.7, 2.1]} color="#f59e0b" intensity={0.9} distance={5.0} />
    </group>
  );
}

// ── 5. Mountain Lake & Madbox Cliff Waterfall (পাহাড়ের লেক ও জলপ্রপাত) ──
function MadboxWaterfallCascade({ position = [2.0, 0, -14.0] }: { position?: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (waterRef.current) {
      waterRef.current.scale.x = 1.0 + Math.sin(t * 7.0) * 0.05;
    }
    if (foamRef.current) {
      const p = 1.0 + Math.sin(t * 5.0) * 0.08;
      foamRef.current.scale.set(p, 1.0, p);
    }
  });

  return (
    <group position={position}>
      {/* High Stepped Waterfall Cliff Backdrop (Madbox earth tone) */}
      <mesh position={[0, 4.4, -2.5]} receiveShadow>
        <boxGeometry args={[14.0, 8.8, 4.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>

      {/* Secret Cave Behind Waterfall Curtain (হাইডারের লুকানোর স্থান) */}
      <group position={[0, 0.4, -1.8]}>
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[6.5, 0.4, 3.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[7.0, 0.3, 3.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Cave Luminous Crystal Lantern */}
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>
        <pointLight position={[0, 1.8, 0]} color="#38bdf8" intensity={0.9} distance={6.0} />
      </group>

      {/* Vertical Translucent Waterfall Sheet */}
      <mesh ref={waterRef} position={[0, 4.2, 0.2]}>
        <planeGeometry args={[4.8, 8.4]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive="#38bdf8"
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Foaming Water Base Plunge Ring */}
      <mesh ref={foamRef} position={[0, 0.9, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 4.5, 24]} />
        <meshStandardMaterial
          color="#f0f9ff"
          emissive="#7dd3fc"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ── 6. Wooden Rope Suspension Bridge (Madbox Style Footbridge Across Gorge) ──
function MadboxRopeBridge({
  start = [-3.0, 4.2, 5.0],
  end = [8.0, 4.2, 8.0],
}: {
  start?: [number, number, number];
  end?: [number, number, number];
}) {
  const plankCount = 14;
  const len = Math.hypot(end[0] - start[0], end[2] - start[2]);

  return (
    <group>
      {/* Anchor Posts */}
      {[start, end].map((pt, i) => (
        <group key={i} position={[pt[0], pt[1], pt[2]]}>
          {[-0.8, 0.8].map((offset, j) => (
            <mesh key={j} position={[offset, 1.0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 2.0, 6]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
          ))}
          {/* Lantern on post */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#fef08a" emissive="#d97706" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}

      {/* Wooden Planks with Catenary Sag */}
      {Array.from({ length: plankCount }).map((_, i) => {
        const u = (i + 0.5) / plankCount;
        const px = start[0] + (end[0] - start[0]) * u;
        const pz = start[2] + (end[2] - start[2]) * u;
        const sag = Math.sin(u * Math.PI) * -0.45;
        const py = start[1] + sag;

        return (
          <mesh key={i} position={[px, py + 0.05, pz]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.1, len / plankCount - 0.05]} />
            <meshStandardMaterial color="#78350f" roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── 7. LARGE RED SUSPENSION BRIDGE TO LEVEL 5 (like Golden Gate Bridge in Madbox screenshot) ──
// Spans across the open ocean from Level 4 west edge towards Level 5 with a locked security gatehouse!
function LargeRedSuspensionBridge({
  start = [-16.0, 0, 0], // Local to Level 4 -> World [-76.0, 0, -85.0]
  length = 36.0,
  deckHeight = 6.4,
}: {
  start?: [number, number, number];
  length?: number;
  deckHeight?: number;
}) {
  const redColor = '#dc2626'; // Iconic Golden Gate red / vermilion
  const darkSteel = '#991b1b';

  return (
    <group position={start}>
      {/* ── Highway Approach Ramp from Main Plateau up to Bridge Deck ── */}
      <group position={[4.0, (deckHeight + 0.85) * 0.5, 0]} rotation={[0, 0, -Math.atan2(deckHeight - 0.85, 8.0)]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[Math.hypot(8.0, deckHeight - 0.85), 0.45, 4.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Double Yellow Line on Approach Ramp */}
        <mesh position={[0, 0.23, 0]}>
          <boxGeometry args={[Math.hypot(8.0, deckHeight - 0.85) - 0.2, 0.02, 0.22]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        {/* Red Railings along Approach Ramp */}
        {[-2.05, 2.05].map((rz, i) => (
          <mesh key={i} position={[0, 0.75, rz]}>
            <boxGeometry args={[Math.hypot(8.0, deckHeight - 0.85), 0.08, 0.08]} />
            <meshStandardMaterial color={redColor} />
          </mesh>
        ))}
      </group>

      {/* ── Highway Bridge Deck (Spanning 36m out over the ocean!) ── */}
      <mesh
        castShadow
        receiveShadow
        position={[-length * 0.5, deckHeight, 0]}
      >
        <boxGeometry args={[length, 0.45, 4.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Deck Underside Red Steel Truss Girder */}
      <mesh position={[-length * 0.5, deckHeight - 0.55, 0]}>
        <boxGeometry args={[length, 0.65, 3.8]} />
        <meshStandardMaterial color={darkSteel} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Road Center Line (Double Yellow) */}
      <mesh position={[-length * 0.5, deckHeight + 0.23, 0]}>
        <boxGeometry args={[length - 0.4, 0.02, 0.22]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* Red Steel Safety Railings */}
      {[-2.05, 2.05].map((rz, i) => (
        <group key={i} position={[-length * 0.5, deckHeight + 0.75, rz]}>
          <mesh>
            <boxGeometry args={[length, 0.08, 0.08]} />
            <meshStandardMaterial color={redColor} />
          </mesh>
          {Array.from({ length: 18 }).map((_, j) => (
            <mesh key={j} position={[-length * 0.5 + (j + 0.5) * (length / 18), -0.35, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.75, 4]} />
              <meshStandardMaterial color={redColor} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Massive Twin Red Suspension Towers ── */}
      {[-10.0, -26.0].map((tx, idx) => (
        <group key={idx} position={[tx, 0, 0]}>
          {/* Concrete Oceanic Pier Foundation (Submerged in Sea) */}
          <mesh receiveShadow position={[0, deckHeight * 0.5 - 0.5, 0]}>
            <cylinderGeometry args={[3.2, 3.6, deckHeight + 2.0, 16]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>

          {/* Twin Red Tower Legs rising up to y = 17.5m! */}
          {[-2.3, 2.3].map((tz, legIdx) => (
            <mesh key={legIdx} castShadow position={[0, deckHeight + 5.5, tz]}>
              <boxGeometry args={[1.2, 11.5, 1.2]} />
              <meshStandardMaterial color={redColor} metalness={0.5} roughness={0.3} />
            </mesh>
          ))}

          {/* Tower Top Crossbar Portal Arch */}
          <mesh position={[0, deckHeight + 11.0, 0]}>
            <boxGeometry args={[1.3, 1.2, 5.8]} />
            <meshStandardMaterial color={redColor} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, deckHeight + 7.5, 0]}>
            <boxGeometry args={[1.1, 0.8, 5.8]} />
            <meshStandardMaterial color={darkSteel} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Tower Top Aircraft Warning Beacons */}
          {[-2.3, 2.3].map((tz, bIdx) => (
            <group key={bIdx} position={[0, deckHeight + 11.8, tz]}>
              <mesh>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.8} />
              </mesh>
              <pointLight color="#ef4444" intensity={0.9} distance={7.0} />
            </group>
          ))}
        </group>
      ))}

      {/* ── Suspension Main Cables Draping from Towers ── */}
      {[-2.3, 2.3].map((cz, i) => (
        <group key={i}>
          {/* Left Sag Cable */}
          <mesh position={[-5.0, deckHeight + 5.8, cz]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[11.5, 0.12, 0.12]} />
            <meshStandardMaterial color="#fca5a5" metalness={0.7} />
          </mesh>
          {/* Mid Span Parabolic Cable */}
          <mesh position={[-18.0, deckHeight + 6.5, cz]} rotation={[0, 0, 0]}>
            <boxGeometry args={[16.0, 0.14, 0.14]} />
            <meshStandardMaterial color="#fca5a5" metalness={0.7} />
          </mesh>
          {/* Right Reach Cable */}
          <mesh position={[-31.0, deckHeight + 5.8, cz]} rotation={[0, 0, 0.45]}>
            <boxGeometry args={[11.5, 0.12, 0.12]} />
            <meshStandardMaterial color="#fca5a5" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ── FAR END: SECURITY GATEHOUSE & LOCKED BARRIER TO LEVEL 5 ── */}
      <group position={[-length, deckHeight, 0]}>
        {/* Concrete Fortress Gatehouse Pier */}
        <mesh position={[0, -deckHeight * 0.5, 0]}>
          <boxGeometry args={[4.5, deckHeight + 0.5, 6.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* Gate Arch Pillars */}
        {[-2.2, 2.2].map((pz, i) => (
          <mesh key={i} position={[0, 1.8, pz]} castShadow>
            <boxGeometry args={[1.2, 3.6, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}

        {/* Gate Top Arch Beam */}
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[1.4, 0.8, 5.6]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* ── Heavy Locked Iron Portcullis Security Gate (LOCKED FOR NOW) ── */}
        <group position={[0, 1.5, 0]}>
          {/* Vertical Iron Bars */}
          {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map((bz, i) => (
            <mesh key={i} position={[0, 0, bz]}>
              <cylinderGeometry args={[0.05, 0.05, 2.8, 6]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Horizontal Crossbars */}
          {[-0.8, 0, 0.8].map((by, i) => (
            <mesh key={i} position={[0, by, 0]}>
              <boxGeometry args={[0.15, 0.12, 3.6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Yellow & Black Hazard Striped Barrier Board */}
          <mesh position={[0.1, -0.2, 0]}>
            <boxGeometry args={[0.1, 0.45, 3.8]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>

          {/* Big Glowing Red Padlock Symbol */}
          <mesh position={[0.2, 0.4, 0]}>
            <boxGeometry args={[0.25, 0.6, 0.5]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.4} />
          </mesh>

          {/* Flashing Red Warning Beacons */}
          {[-1.6, 1.6].map((sz, i) => (
            <group key={i} position={[0.1, 1.5, sz]}>
              <mesh>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.8} />
              </mesh>
              <pointLight color="#ef4444" intensity={1.2} distance={5.5} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

// ── 8. Master Component: Level 4 Mayabi Hill Tracts (Madbox Style Island) ──
// Center in world: [-60, 0, -85]
export function HillTractsIsland() {
  const riverRef = useRef<THREE.Mesh>(null);
  const lakeRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (riverRef.current) {
      riverRef.current.position.y = 0.12 + Math.sin(t * 1.6) * 0.015;
    }
    if (lakeRef.current) {
      lakeRef.current.position.y = 8.25 + Math.sin(t * 1.4) * 0.015;
    }
  });

  return (
    <group position={[-60, 0, -85]}>
      {/* ── 1. Submerged Coastal Sand Reef Shelf (Radius ~48m) ── */}
      <mesh receiveShadow position={[0, -0.65, 0]}>
        <cylinderGeometry args={[46.0, 49.5, 0.45, 48]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ── 2. MADBOX LAYER 1: Base Island Sandy Shore Tier (y = 0.2m) ── */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[43.0, 46.0, 0.45, 48]} />
        <meshStandardMaterial color="#f5d061" roughness={0.9} />
      </mesh>

      {/* ── 3. MADBOX LAYER 2: Main Verdant Plateau with Vertical Sandstone Cliffs (y = 0.85m) ── */}
      <group position={[0, 0.45, 0]}>
        {/* Vertical Cliff Edge Wall (Warm Madbox clay tone) */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[39.5, 41.5, 0.9, 44]} />
          <meshStandardMaterial color="#d97706" roughness={0.92} />
        </mesh>
        {/* Lush Green Top Surface */}
        <mesh receiveShadow position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[39.5, 44]} />
          <meshStandardMaterial color="#16a34a" roughness={0.88} />
        </mesh>
      </group>

      {/* ── 4. MADBOX LAYER 3: Mid Mountain Plateau (y = 4.2m) with Sandstone Cliffs ── */}
      <group position={[8.0, 2.5, -6.0]}>
        {/* Vertical Cliff Edge */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[18.5, 21.0, 3.4, 28]} />
          <meshStandardMaterial color="#b45309" roughness={0.92} />
        </mesh>
        {/* Green Plateau Top (y = 4.2m) */}
        <mesh receiveShadow position={[0, 1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[18.5, 28]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
      </group>

      {/* ── 5. MADBOX LAYER 4: High Summit Peak Plateau (y = 8.2m) with Mountain Reservoir Lake ── */}
      <group position={[-6.0, 6.2, -14.0]}>
        {/* High Vertical Cliff */}
        <mesh receiveShadow castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[12.5, 14.5, 4.0, 24]} />
          <meshStandardMaterial color="#78350f" roughness={0.95} />
        </mesh>
        {/* Green Summit Surface (y = 8.2m) */}
        <mesh receiveShadow position={[0, 2.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[12.5, 24]} />
          <meshStandardMaterial color="#14532d" roughness={0.85} />
        </mesh>
        {/* Elevated Mountain Reservoir Lake Surface (Turquoise Clear Water) */}
        <mesh ref={lakeRef} position={[0, 2.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[7.5, 24]} />
          <meshStandardMaterial
            color="#06b6d4"
            roughness={0.08}
            metalness={0.25}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>

      {/* ── 6. Winding Mountain River Gorge through the Valley ── */}
      <mesh
        ref={riverRef}
        position={[-6.0, 0.12, 10.0]}
        rotation={[-Math.PI / 2, 0, -0.22]}
        receiveShadow
      >
        <planeGeometry args={[9.5, 38.0]} />
        <meshStandardMaterial
          color="#0891b2"
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ── 7. Madbox Cliff Waterfall into River Gorge ── */}
      <MadboxWaterfallCascade position={[-6.0, 0, -6.0]} />

      {/* ── 8. Madbox Cozy Mountain Timber Lodge ── */}
      <MadboxMountainLodge position={[12.0, 4.2, -8.0]} rotationY={-0.45} />

      {/* ── 9. Madbox Wooden Rope Footbridge Crossing Gorge ── */}
      <MadboxRopeBridge start={[-3.0, 4.2, 5.0]} end={[8.0, 4.2, 8.0]} />

      {/* ── Natural Stepped Terraces (Climbable Stone Stairs to Plateaus) ── */}
      {/* Steps from Main Plateau (0.85m) up to Mid Plateau (4.2m) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const u = (i + 1) / 8;
        return (
          <mesh
            key={`st1-${i}`}
            receiveShadow
            castShadow
            position={[8.0, 0.85 + u * (4.2 - 0.85), 14.0 - u * 8.0]}
          >
            <boxGeometry args={[3.2, 0.45, 1.2]} />
            <meshStandardMaterial color="#b45309" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Steps from Mid Plateau (4.2m) up to High Summit Peak (8.2m) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const u = (i + 1) / 8;
        return (
          <mesh
            key={`st2-${i}`}
            receiveShadow
            castShadow
            position={[-1.0 - u * 5.0, 4.2 + u * (8.2 - 4.2), -10.0 - u * 4.0]}
          >
            <boxGeometry args={[2.8, 0.45, 1.2]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        );
      })}

      {/* ── 10. LARGE RED SUSPENSION BRIDGE LEADING OUT TO LEVEL 5 (WITH LOCKED GATE) ── */}
      {/* Starts at West Plateau edge [-16.0, 0, 0] and spans 36m out to Level 5 ocean outpost */}
      <LargeRedSuspensionBridge start={[-16.0, 0, 0]} length={36.0} deckHeight={6.4} />

      {/* ── 11. Madbox Pine Tree Groves ── */}
      <MadboxPineTree position={[4.0, 4.2, -18.0]} scale={1.3} />
      <MadboxPineTree position={[15.0, 4.2, -16.0]} scale={1.2} />
      <MadboxPineTree position={[18.0, 4.2, -4.0]} scale={1.1} />
      <MadboxPineTree position={[6.0, 4.2, -2.0]} scale={1.25} />
      <MadboxPineTree position={[-16.0, 0.85, 12.0]} scale={1.35} />
      <MadboxPineTree position={[-24.0, 0.85, 4.0]} scale={1.2} />
      <MadboxPineTree position={[20.0, 0.85, 14.0]} scale={1.15} />
      <MadboxPineTree position={[-12.0, 8.2, -18.0]} scale={1.1} />

      {/* ── 12. Dense Mountain Tall Grass Fields (কাশফুল — 100% Stealth Escape) ── */}
      <HillTallGrassSystem />

      {/* ── 13. Winged Celestial Maidens ("Hoors") Patrolling Bridges & Peaks ── */}
      <CelestialMaidensKingdom />

      {/* ── 14. Rivermouth Arrival Pier for Dolphin Transport Route 2 ── */}
      <group position={[0, 0, 25.0]}>
        <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
          <boxGeometry args={[3.6, 0.25, 7.5]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
        {[-1.5, 1.5].map((bx, i) => (
          <mesh key={i} position={[bx, 0.5, 3.2]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.75, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        ))}
        {/* Navigation Beacon */}
        <mesh position={[1.5, 1.6, 3.2]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>
        <pointLight position={[1.5, 1.5, 3.2]} color="#38bdf8" intensity={1.2} distance={7.5} />
      </group>

      {/* ── 15. Monsoon Raindrops Particles Engine (Single Draw Call) ── */}
      <MonsoonRainWeather count={140} center={[0, 0, 0]} radius={45} />

      {/* ── 16. Night Fireflies Swarm (48 Glowing Insects) ── */}
      <EerieFireflySwarm count={48} />

      {/* ── 17. Glowing Silver Crescent Moon in Sky Overhead ── */}
      <mesh ref={moonRef} position={[-15, 24, -20]} rotation={[0.4, 0.2, 0.5]}>
        <torusGeometry args={[2.0, 0.38, 12, 32, Math.PI * 1.15]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#e0f2fe"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
