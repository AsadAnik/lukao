import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';
import { audioManager } from './audio-manager';

// ── 1. Rooster 3D Model (ঐতিহ্যবাহী লাল ঝুঁটিওয়ালা দেশি মোরগ) ──
function RoosterMesh({
  headPitchRef,
  wingLRef,
  wingRRef,
  legLRef,
  legRRef,
}: {
  headPitchRef: React.RefObject<THREE.Group | null>;
  wingLRef: React.RefObject<THREE.Group | null>;
  wingRRef: React.RefObject<THREE.Group | null>;
  legLRef: React.RefObject<THREE.Group | null>;
  legRRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group>
      {/* Plump Oval Body (মোরগের বুক ও শরীর) */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color="#9a3412" roughness={0.7} />
      </mesh>
      {/* Golden Breast Hackles (বুকের সোনালি পালক) */}
      <mesh position={[0, 0.36, 0.14]} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#ea580c" roughness={0.65} />
      </mesh>

      {/* Articulated Neck & Head with Red Comb & Wattles */}
      <group position={[0, 0.42, 0.18]} ref={headPitchRef}>
        {/* Golden Neck Hackle Feathers */}
        <mesh position={[0, 0.12, 0.05]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.14, 0.22, 10]} />
          <meshStandardMaterial color="#eab308" roughness={0.6} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.26, 0.09]} castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color="#fef08a" roughness={0.6} />
        </mesh>

        {/* Sharp Amber Beak (ঠোঁট) */}
        <mesh position={[0, 0.25, 0.21]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.04, 0.12, 6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>

        {/* Prominent Sawtooth Red Comb (মোরগের লাল ঝুঁটি) */}
        <group position={[0, 0.38, 0.08]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.035, 0.12, 0.18]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
          {[-0.05, 0, 0.05].map((zOffset, idx) => (
            <mesh key={idx} position={[0, 0.07, zOffset]}>
              <coneGeometry args={[0.025, 0.06, 4]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Double Red Wattles under Chin (গলার লাল লতিকা) */}
        <mesh position={[-0.03, 0.18, 0.14]} castShadow>
          <sphereGeometry args={[0.032, 6, 6]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <mesh position={[0.03, 0.18, 0.14]} castShadow>
          <sphereGeometry args={[0.032, 6, 6]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.09, 0.28, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>
        <mesh position={[0.09, 0.28, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>
      </group>

      {/* Sweeping Arched Tail Feathers (মোরগের সুন্দর কালো-সবুজ বাঁকানো লেজের পালক) */}
      <group position={[0, 0.44, -0.22]} rotation={[-0.45, 0, 0]}>
        {[-0.06, 0, 0.06].map((tx, idx) => (
          <mesh
            key={idx}
            position={[tx, 0.16 + Math.abs(tx) * 0.05, -idx * 0.03]}
            rotation={[0.35 + idx * 0.08, 0, tx * 1.5]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.38, 0.08]} />
            <meshStandardMaterial color="#0f766e" roughness={0.5} metalness={0.25} />
          </mesh>
        ))}
      </group>

      {/* Flapping Wings (ডানা) */}
      <group position={[-0.22, 0.38, 0.02]} ref={wingLRef}>
        <mesh position={[-0.06, -0.06, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.05, 0.18, 0.26]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.7} />
        </mesh>
      </group>
      <group position={[0.22, 0.38, 0.02]} ref={wingRRef}>
        <mesh position={[0.06, -0.06, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.05, 0.18, 0.26]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.7} />
        </mesh>
      </group>

      {/* Slender Yellow Legs with Toes (হলুদ পা ও নখ) */}
      <group position={[-0.1, 0.18, 0]} ref={legLRef}>
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.17, 0.03]}>
          <boxGeometry args={[0.06, 0.02, 0.08]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
      </group>
      <group position={[0.1, 0.18, 0]} ref={legRRef}>
        <mesh position={[0, -0.08, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.17, 0.03]}>
          <boxGeometry args={[0.06, 0.02, 0.08]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ── 2. Native Bangladeshi Hen 3D Model (দেশি মুরগি) ──
function HenMesh({
  color = '#b45309',
  accentColor = '#f59e0b',
  headPitchRef,
  wingLRef,
  wingRRef,
  legLRef,
  legRRef,
}: {
  color?: string;
  accentColor?: string;
  headPitchRef: React.RefObject<THREE.Group | null>;
  wingLRef: React.RefObject<THREE.Group | null>;
  wingRRef: React.RefObject<THREE.Group | null>;
  legLRef: React.RefObject<THREE.Group | null>;
  legRRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group scale={0.88}>
      {/* Plump Hen Body */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {/* Speckled Breast Patch */}
      <mesh position={[0, 0.33, 0.12]} castShadow>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* Head with Smaller Comb */}
      <group position={[0, 0.38, 0.15]} ref={headPitchRef}>
        <mesh position={[0, 0.1, 0.04]} rotation={[0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 0.18, 8]} />
          <meshStandardMaterial color={accentColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.22, 0.07]} castShadow>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.21, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.035, 0.1, 5]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        {/* Small Red Comb */}
        <mesh position={[0, 0.31, 0.06]}>
          <boxGeometry args={[0.025, 0.07, 0.1]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.24, 0.09]}>
          <sphereGeometry args={[0.016, 5, 5]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.07, 0.24, 0.09]}>
          <sphereGeometry args={[0.016, 5, 5]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Perky Short Tail */}
      <mesh position={[0, 0.42, -0.19]} rotation={[-0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.2, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Wings */}
      <group position={[-0.2, 0.34, 0.01]} ref={wingLRef}>
        <mesh position={[-0.05, -0.05, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      </group>
      <group position={[0.2, 0.34, 0.01]} ref={wingRRef}>
        <mesh position={[0.05, -0.05, 0]} rotation={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[-0.08, 0.16, 0]} ref={legLRef}>
        <mesh position={[0, -0.07, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 5]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
      </group>
      <group position={[0.08, 0.16, 0]} ref={legRRef}>
        <mesh position={[0, -0.07, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 5]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Tiny Fluffy Baby Chick (তুলতুলে হলুদ মুরগির ছানা) ──
function ChickMesh({
  headPitchRef,
  wingLRef,
  wingRRef,
  legLRef,
  legRRef,
}: {
  headPitchRef: React.RefObject<THREE.Group | null>;
  wingLRef: React.RefObject<THREE.Group | null>;
  wingRRef: React.RefObject<THREE.Group | null>;
  legLRef: React.RefObject<THREE.Group | null>;
  legRRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group scale={0.52}>
      {/* Round Yellow Puffball Body */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#fde047" roughness={0.8} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.26, 0.08]} ref={headPitchRef}>
        <mesh position={[0, 0.04, 0.02]} castShadow>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshStandardMaterial color="#fef08a" roughness={0.8} />
        </mesh>
        {/* Tiny Orange Beak */}
        <mesh position={[0, 0.04, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.025, 0.06, 4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} />
        </mesh>
        {/* Pinpoint Black Eyes */}
        <mesh position={[-0.07, 0.07, 0.06]}>
          <sphereGeometry args={[0.014, 4, 4]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.07, 0.07, 0.06]}>
          <sphereGeometry args={[0.014, 4, 4]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Tiny Stubby Wings */}
      <group position={[-0.14, 0.2, 0]} ref={wingLRef}>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.1]} />
          <meshStandardMaterial color="#fde047" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.14, 0.2, 0]} ref={wingRRef}>
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.1]} />
          <meshStandardMaterial color="#fde047" roughness={0.8} />
        </mesh>
      </group>

      {/* Tiny Running Legs */}
      <group position={[-0.05, 0.08, 0]} ref={legLRef}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>
      <group position={[0.05, 0.08, 0]} ref={legRRef}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>
    </group>
  );
}

// ── 4. Traditional Village Winnowing Fan (ধানের কুলা ও ছড়িয়ে থাকা চাল) ──
function BambooKulaAndPaddy({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bamboo Kula Tray (বাঁশের তৈরি কুলা) */}
      <mesh position={[0, 0.03, 0]} rotation={[-0.08, 0.25, 0]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.52]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>
      {/* Curved Raised Rim of Kula */}
      <mesh position={[0, 0.06, -0.23]} rotation={[0, 0.25, 0]}>
        <boxGeometry args={[0.66, 0.05, 0.05]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      {/* Golden Unhusked Rice / Paddy (সোনালি ধানের দানা) */}
      <mesh position={[0.05, 0.055, 0.02]}>
        <boxGeometry args={[0.45, 0.02, 0.35]} />
        <meshStandardMaterial color="#eab308" roughness={0.9} />
      </mesh>

      {/* A few scattered grain spots on ground */}
      {[-0.35, 0.25, 0.45, -0.2].map((gx, i) => (
        <mesh key={i} position={[gx, 0.01, 0.2 + (i % 2) * 0.15]}>
          <cylinderGeometry args={[0.06, 0.06, 0.015, 6]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.9} />
        </mesh>
      ))}

      {/* Earthen Shallow Water Pan (মাটির সানকি) */}
      <mesh position={[-0.6, 0.04, -0.2]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.07, 10]} />
        <meshStandardMaterial color="#c05621" roughness={0.9} />
      </mesh>
      {/* Fresh Water Surface */}
      <mesh position={[-0.6, 0.07, -0.2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 10]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ── 5. Autonomous Chicken Entity with Village AI Behaviors ──
interface ChickenState {
  type: 'rooster' | 'hen' | 'chick';
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
  homePos: THREE.Vector3;
  wanderRadius: number;
  rotation: number;
  speed: number;
  state: 'wandering' | 'pecking' | 'playing' | 'alarmed';
  timer: number;
  peckCounter: number;
  hopY: number;
}

function AnimatedChickenEntity({
  initialType,
  homePosition,
  wanderRadius = 2.4,
  seed = 0,
  motherRef,
}: {
  initialType: 'rooster' | 'hen' | 'chick';
  homePosition: [number, number, number];
  wanderRadius?: number;
  seed?: number;
  motherRef?: React.RefObject<THREE.Group | null>;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const headPitchRef = useRef<THREE.Group>(null);
  const wingLRef = useRef<THREE.Group>(null);
  const wingRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);

  const chicken = useRef<ChickenState>({
    type: initialType,
    pos: new THREE.Vector3(...homePosition),
    targetPos: new THREE.Vector3(...homePosition),
    homePos: new THREE.Vector3(...homePosition),
    wanderRadius,
    rotation: seed * 1.5,
    speed: initialType === 'chick' ? 1.6 : 1.2,
    state: 'pecking',
    timer: 1.0 + (seed % 3) * 0.8,
    peckCounter: 0,
    hopY: 0,
  });

  const lastCluckTime = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const c = chicken.current;
    const time = state.clock.elapsedTime;

    // Check player proximity
    const pPos = playerTransform.position;
    const distToPlayer = c.pos.distanceTo(pPos);

    // 1. Behavior State Machine
    if (distToPlayer < 2.5) {
      // STARTLE / SCATTER REACTION! (Player running near chickens)
      if (c.state !== 'alarmed') {
        c.state = 'alarmed';
        c.timer = 1.8 + Math.random() * 0.8;
        if (time - lastCluckTime.current > 3.0 && Math.random() < 0.75) {
          lastCluckTime.current = time;
          audioManager.playChickenCluck();
        }
      }

      // Run directly away from player
      const dirX = c.pos.x - pPos.x;
      const dirZ = c.pos.z - pPos.z;
      const escapeHeading = Math.atan2(dirX, dirZ);
      c.rotation = escapeHeading;

      // Sprint away from player
      const sprintSpeed = (c.type === 'chick' ? 3.6 : 3.0) * dt;
      c.pos.x += Math.sin(escapeHeading) * sprintSpeed;
      c.pos.z += Math.cos(escapeHeading) * sprintSpeed;

      // Constrain within homeland bounds
      const distFromHome = c.pos.distanceTo(c.homePos);
      if (distFromHome > c.wanderRadius * 1.6) {
        c.pos.lerp(c.homePos, 0.03);
      }

      // Frantic Wing Flap & Hop Flutter
      const flap = Math.sin(time * 32) * 0.65;
      if (wingLRef.current) wingLRef.current.rotation.z = 0.3 + flap;
      if (wingRRef.current) wingRRef.current.rotation.z = -0.3 - flap;
      c.hopY = Math.abs(Math.sin(time * 16)) * 0.12;

      // Rapid leg strides
      const legStride = Math.sin(time * 26) * 0.7;
      if (legLRef.current) legLRef.current.rotation.x = legStride;
      if (legRRef.current) legRRef.current.rotation.x = -legStride;
    } else {
      // CALM / PEACEFUL VILLAGE FORAGING & PLAYING
      c.timer -= dt;

      // If chick and mother exists, gravitate towards mother hen
      if (c.type === 'chick' && motherRef?.current) {
        const mPos = motherRef.current.position;
        const distToMother = c.pos.distanceTo(mPos);
        if (distToMother > 1.4) {
          c.targetPos.copy(mPos).add(
            new THREE.Vector3(
              (Math.sin(seed + time * 0.5) * 0.5),
              0,
              (Math.cos(seed + time * 0.5) * 0.5)
            )
          );
          c.state = 'wandering';
        }
      }

      if (c.timer <= 0) {
        // Transition to new action
        const roll = Math.random();
        if (roll < 0.45) {
          // Start pecking for grains
          c.state = 'pecking';
          c.timer = 1.6 + Math.random() * 2.2;
          c.peckCounter = 0;
        } else if (roll < 0.8) {
          // Wander to nearby waypoint
          c.state = 'wandering';
          c.timer = 2.0 + Math.random() * 2.5;
          const angle = Math.random() * Math.PI * 2;
          const rad = Math.random() * c.wanderRadius;
          c.targetPos.set(
            c.homePos.x + Math.cos(angle) * rad,
            c.homePos.y,
            c.homePos.z + Math.sin(angle) * rad
          );
        } else {
          // Playful hop and wing stretch!
          c.state = 'playing';
          c.timer = 1.2 + Math.random() * 1.0;
        }
      }

      if (c.state === 'pecking') {
        // Rhythmic pecking motion (head dips to ground)
        const peckFreq = c.type === 'chick' ? 9 : 6;
        const peckCycle = Math.sin(time * peckFreq);
        const isDipping = peckCycle > 0.3;
        const pitch = isDipping ? 0.95 : 0.05;

        if (headPitchRef.current) {
          headPitchRef.current.rotation.x = THREE.MathUtils.lerp(
            headPitchRef.current.rotation.x,
            pitch,
            16 * dt
          );
        }

        // Idle wings
        if (wingLRef.current) wingLRef.current.rotation.z = 0.25;
        if (wingRRef.current) wingRRef.current.rotation.z = -0.25;
        if (legLRef.current) legLRef.current.rotation.x = 0;
        if (legRRef.current) legRRef.current.rotation.x = 0;
        c.hopY = 0;
      } else if (c.state === 'wandering') {
        // Walk towards target
        const dx = c.targetPos.x - c.pos.x;
        const dz = c.targetPos.z - c.pos.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.08) {
          const moveAngle = Math.atan2(dx, dz);
          // Smooth rotation towards travel
          let diff = moveAngle - c.rotation;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          c.rotation += diff * Math.min(10 * dt, 1);

          const step = Math.min(dist, c.speed * dt);
          c.pos.x += Math.sin(c.rotation) * step;
          c.pos.z += Math.cos(c.rotation) * step;

          // Leg swing
          const walkCycle = Math.sin(time * (c.type === 'chick' ? 18 : 12)) * 0.55;
          if (legLRef.current) legLRef.current.rotation.x = walkCycle;
          if (legRRef.current) legRRef.current.rotation.x = -walkCycle;

          // Gentle head bob when walking
          if (headPitchRef.current) {
            headPitchRef.current.rotation.x = Math.max(0, walkCycle * 0.4);
          }
        }
        c.hopY = 0;
      } else if (c.state === 'playing') {
        // Playful hop and wing flutter
        const flutter = Math.sin(time * 24) * 0.5;
        if (wingLRef.current) wingLRef.current.rotation.z = 0.25 + flutter;
        if (wingRRef.current) wingRRef.current.rotation.z = -0.25 - flutter;
        c.hopY = Math.abs(Math.sin(time * 8)) * 0.16;
        c.rotation += 2.0 * dt; // cheerful little spin
      }
    }

    // Apply computed transform
    rootRef.current.position.set(c.pos.x, c.pos.y + c.hopY, c.pos.z);
    rootRef.current.rotation.y = c.rotation;
  });

  return (
    <group ref={rootRef} position={homePosition}>
      {initialType === 'rooster' && (
        <RoosterMesh
          headPitchRef={headPitchRef}
          wingLRef={wingLRef}
          wingRRef={wingRRef}
          legLRef={legLRef}
          legRRef={legRRef}
        />
      )}
      {initialType === 'hen' && (
        <HenMesh
          color={seed % 2 === 0 ? '#b45309' : '#92400e'}
          accentColor={seed % 2 === 0 ? '#f59e0b' : '#d97706'}
          headPitchRef={headPitchRef}
          wingLRef={wingLRef}
          wingRRef={wingRRef}
          legLRef={legLRef}
          legRRef={legRRef}
        />
      )}
      {initialType === 'chick' && (
        <ChickMesh
          headPitchRef={headPitchRef}
          wingLRef={wingLRef}
          wingRRef={wingRRef}
          legLRef={legLRef}
          legRRef={legRRef}
        />
      )}
    </group>
  );
}

/**
 * Master Village Chickens Flock (গ্রামের দেশি মুরগি ও মোরগের ঝাঁক)
 * Renders authentic Bangladeshi free-range chickens, roosters, and chicks
 * with interactive playing and scattering behaviors.
 */
export function VillageChickens({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const motherHenRef = useRef<THREE.Group>(null);

  return (
    <group position={position}>
      {/* Bamboo Kula with Paddy Grains (উঠোনে রাখা ধান ও সানকি) */}
      <BambooKulaAndPaddy position={[-0.8, 0, 1.4]} />

      {/* 1. Proud Village Rooster (লাল ঝুঁটিওয়ালা বড় মোরগ) */}
      <AnimatedChickenEntity
        initialType="rooster"
        homePosition={[0.8, 0, 1.2]}
        wanderRadius={2.8}
        seed={1}
      />

      {/* 2. Mother Native Hen (বাদামি দেশি মুরগি - মা) */}
      <group ref={motherHenRef}>
        <AnimatedChickenEntity
          initialType="hen"
          homePosition={[-0.6, 0, 1.8]}
          wanderRadius={2.2}
          seed={2}
        />
      </group>

      {/* 3. Second Speckled Hen (আরেকটি লালচে দেশি মুরগি - খড়ের গাদার পাশে) */}
      <AnimatedChickenEntity
        initialType="hen"
        homePosition={[-2.4, 0, -0.6]}
        wanderRadius={2.0}
        seed={3}
      />

      {/* 4. Baby Chick 1 (তুলতুলে হলুদ ছানা ১) */}
      <AnimatedChickenEntity
        initialType="chick"
        homePosition={[-0.3, 0, 2.2]}
        wanderRadius={1.5}
        seed={4}
        motherRef={motherHenRef}
      />

      {/* 5. Baby Chick 2 (তুলতুলে হলুদ ছানা ২) */}
      <AnimatedChickenEntity
        initialType="chick"
        homePosition={[-0.9, 0, 2.1]}
        wanderRadius={1.5}
        seed={5}
        motherRef={motherHenRef}
      />
    </group>
  );
}
