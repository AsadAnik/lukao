import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MaidenProps {
  initialPosition: [number, number, number];
  patrolRadius?: number;
  patrolSpeed?: number;
  robeColor?: string;
  sashColor?: string;
  wingColor?: string;
  phaseOffset?: number;
}

/**
 * Procedural Ethereal Winged Celestial Maiden ("Hoor" / ডানাওয়ালা অপ্সরা)
 * Features graceful fluttering wings, flowing celestial silks, glowing halo, and gentle floating patrol.
 */
function SingleCelestialMaiden({
  initialPosition,
  patrolRadius = 3.5,
  patrolSpeed = 0.45,
  robeColor = '#ec4899',
  sashColor = '#facc15',
  wingColor = '#e0f2fe',
  phaseOffset = 0,
}: MaidenProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime + phaseOffset;

    if (rootRef.current) {
      // 1. Gentle floating levitation above ground
      const floatY = Math.sin(t * 2.2) * 0.15;

      // 2. Slow circular patrol around serene glade
      const angle = t * patrolSpeed;
      const px = initialPosition[0] + Math.cos(angle) * patrolRadius;
      const pz = initialPosition[2] + Math.sin(angle) * patrolRadius;
      const heading = angle + Math.PI / 2;

      rootRef.current.position.set(px, initialPosition[1] + floatY, pz);
      rootRef.current.rotation.y = heading;
    }

    // 3. Graceful fluttering wings animation
    const wingFlap = Math.sin(t * 4.2) * 0.38;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = 0.25 + wingFlap;
      leftWingRef.current.rotation.z = Math.cos(t * 4.2) * 0.12;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = -0.25 - wingFlap;
      rightWingRef.current.rotation.z = -Math.cos(t * 4.2) * 0.12;
    }

    // 4. Pulsing celestial halo
    if (haloRef.current) {
      haloRef.current.rotation.z += 0.8 * dt;
      const pulse = 1.0 + Math.sin(t * 3.0) * 0.08;
      haloRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={rootRef} position={initialPosition}>
      {/* ── 1. Flowing Silk Gown & Skirt (তরঙ্গায়িত রেশমি পোশাক) ── */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.46, 1.25, 14]} />
        <meshStandardMaterial
          color={robeColor}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* Decorative Golden Waist Sash / Kmarband */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.23, 0.24, 0.14, 14]} />
        <meshStandardMaterial
          color={sashColor}
          metalness={0.8}
          roughness={0.25}
          emissive={sashColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Flowing Silk Train Ribbon Tails */}
      {[-0.1, 0.1].map((sx, i) => (
        <mesh key={i} position={[sx, 0.55, -0.26]} rotation={[0.22, 0, (i - 0.5) * 0.15]}>
          <boxGeometry args={[0.09, 0.95, 0.02]} />
          <meshStandardMaterial color={sashColor} roughness={0.4} />
        </mesh>
      ))}

      {/* ── 2. Upper Torso & Bodice ── */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.21, 0.52, 12]} />
        <meshStandardMaterial color={robeColor} roughness={0.5} />
      </mesh>

      {/* Elegant Pearl / Golden Collar Necklace */}
      <mesh position={[0, 1.56, 0]}>
        <torusGeometry args={[0.13, 0.022, 8, 16]} />
        <meshStandardMaterial
          color="#fef08a"
          metalness={0.9}
          roughness={0.2}
          emissive="#eab308"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* ── 3. Head, Graceful Face & Crown ── */}
      <mesh position={[0, 1.76, 0]} castShadow>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>

      {/* Flowing Dark Silken Hair Cascade */}
      <group position={[0, 1.74, -0.06]}>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.185, 12, 12]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.9} />
        </mesh>
        {/* Hair Tresses falling over shoulders */}
        <mesh position={[0, -0.28, -0.1]}>
          <boxGeometry args={[0.24, 0.55, 0.12]} />
          <meshStandardMaterial color="#1e1b18" roughness={0.9} />
        </mesh>
      </group>

      {/* ── 4. Glowing Celestial Halo (আলোকময় অপ্সরা মুকুট) ── */}
      <mesh ref={haloRef} position={[0, 1.98, -0.05]} rotation={[0.45, 0, 0]}>
        <torusGeometry args={[0.22, 0.024, 10, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#67e8f9"
          emissiveIntensity={1.4}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* ── 5. Graceful Extended Arms (মায়াবী বাহুযুগল) ── */}
      {/* Left Arm */}
      <group position={[-0.24, 1.45, 0]} rotation={[0.2, 0, -0.35]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.55, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        {/* Lotus Flower in hand */}
        <mesh position={[0, -0.55, 0.08]}>
          <coneGeometry args={[0.08, 0.14, 6]} />
          <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.24, 1.45, 0]} rotation={[0.2, 0, 0.35]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.04, 0.55, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
      </group>

      {/* ── 6. Ethereal Translucent Wings (মায়াবী উজ্জ্বল ডানা) ── */}
      {/* Left Wing Assembly */}
      <group ref={leftWingRef} position={[-0.12, 1.48, -0.16]}>
        {/* Main Swept Wing Primary Feathers */}
        <mesh position={[-0.72, 0.45, 0]} rotation={[0.2, 0, -0.45]}>
          <boxGeometry args={[1.35, 0.65, 0.03]} />
          <meshStandardMaterial
            color={wingColor}
            emissive="#a5f3fc"
            emissiveIntensity={0.65}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Wing Secondary Shimmer Tip */}
        <mesh position={[-1.25, 0.82, 0]} rotation={[0.2, 0, -0.85]}>
          <coneGeometry args={[0.18, 0.85, 4]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#38bdf8"
            emissiveIntensity={0.9}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Right Wing Assembly */}
      <group ref={rightWingRef} position={[0.12, 1.48, -0.16]}>
        {/* Main Swept Wing Primary Feathers */}
        <mesh position={[0.72, 0.45, 0]} rotation={[0.2, 0, 0.45]}>
          <boxGeometry args={[1.35, 0.65, 0.03]} />
          <meshStandardMaterial
            color={wingColor}
            emissive="#a5f3fc"
            emissiveIntensity={0.65}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Wing Secondary Shimmer Tip */}
        <mesh position={[1.25, 0.82, 0]} rotation={[0.2, 0, 0.85]}>
          <coneGeometry args={[0.18, 0.85, 4]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#38bdf8"
            emissiveIntensity={0.9}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── 7. Soft Ambient Light Aura around Maiden ── */}
      <pointLight color="#7dd3fc" intensity={0.7} distance={3.8} />
    </group>
  );
}

/**
 * Celestial Maidens Kingdom for Level 4: Mayabi Hill Tracts
 * Spawns 4 distinct celestial maidens patrolling key scenic paradise landmarks.
 */
export function CelestialMaidensKingdom() {
  return (
    <group>
      {/* 1. Maiden of the Waterfall Plunge Pool (Rose & Gold silks) */}
      <SingleCelestialMaiden
        initialPosition={[-61.0, 1.1, -94.0]}
        patrolRadius={3.8}
        patrolSpeed={0.35}
        robeColor="#ec4899"
        sashColor="#facc15"
        wingColor="#fce7f3"
        phaseOffset={0}
      />

      {/* 2. Maiden of the High Suspension Bridge (Emerald & Cyan silks) */}
      <SingleCelestialMaiden
        initialPosition={[-60.0, 9.4, -84.0]}
        patrolRadius={4.2}
        patrolSpeed={0.3}
        robeColor="#10b981"
        sashColor="#38bdf8"
        wingColor="#e0f2fe"
        phaseOffset={Math.PI * 0.5}
      />

      {/* 3. Maiden of Cloud Crag Summit (Pearl White & Sapphire silks) */}
      <SingleCelestialMaiden
        initialPosition={[-46.0, 9.8, -92.0]}
        patrolRadius={3.5}
        patrolSpeed={0.4}
        robeColor="#f8fafc"
        sashColor="#6366f1"
        wingColor="#e0e7ff"
        phaseOffset={Math.PI}
      />

      {/* 4. Maiden of the Riverbank Meadow (Amethyst & Amber silks) */}
      <SingleCelestialMaiden
        initialPosition={[-68.0, 0.8, -76.0]}
        patrolRadius={3.6}
        patrolSpeed={0.38}
        robeColor="#8b5cf6"
        sashColor="#f59e0b"
        wingColor="#ede9fe"
        phaseOffset={Math.PI * 1.5}
      />
    </group>
  );
}

