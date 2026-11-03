import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ArenaGround } from './arena-ground';
import { OceanWorld } from './ocean-world';
import { DolphinSystem } from './dolphin-system';
import { SeekerTower } from './seeker-tower';
import { BangladeshiVillage } from './bangladeshi-village';
import { BushGrove } from './bush-grove';
import { TunnelBridge } from './tunnel-bridge';
import { TallGrassGroves } from './tall-grass';
import { MangoTree } from './mango-tree';
import { DesertWorldIsland } from './desert-world-island';
import { HillTractsIsland } from './hill-tracts-island';
import { TransportBalloonSystem } from './transport-balloon';
import { PlayerCharacter } from './player-character';
import { AIBots } from './ai-bots';
import { FisheyeCameraRig } from './fisheye-camera';
import { lukaoStore } from './game-state';
import { playerTransform, dolphinRide } from './game-engine-state';
import { setupKeyboardControls } from './input-manager';

function FloatingStar({ position = [0, 3.2, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.035;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.18;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.22;
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial
        color="#faf089"
        emissive="#ecc94b"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// ── Dynamic Archipelago Lighting (Global Night on Level 4) ──
function DynamicArchipelagoLighting() {
  const { scene } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);

  const daySky = useMemo(() => new THREE.Color('#7dd3fc'), []);
  const nightSky = useMemo(() => new THREE.Color('#030712'), []); // Spooky deep midnight
  const currentSky = useMemo(() => new THREE.Color('#7dd3fc'), []);

  const dayAmbient = useMemo(() => new THREE.Color('#ffffff'), []);
  const nightAmbient = useMemo(() => new THREE.Color('#1e1b4b'), []); // Midnight indigo
  const currentAmbient = useMemo(() => new THREE.Color('#ffffff'), []);

  const dayHemiSky = useMemo(() => new THREE.Color('#7dd3fc'), []);
  const nightHemiSky = useMemo(() => new THREE.Color('#020617'), []);
  const dayHemiGround = useMemo(() => new THREE.Color('#fef08a'), []);
  const nightHemiGround = useMemo(() => new THREE.Color('#0f172a'), []);

  const nightFactorRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const px = playerTransform.position.x;
    const pz = playerTransform.position.z;
    const loc = dolphinRide.currentLocation;

    // Check if player is on Level 4 or the Large Red Bridge to Level 5
    const distToHill = Math.hypot(px - (-60), pz - (-85));
    const isOnRedBridge = px <= -74 && px >= -115 && Math.abs(pz - (-85)) < 6;
    const isAtHill = loc === 'hill' || distToHill < 54.0 || isOnRedBridge;

    // Smooth lerp transition
    const target = isAtHill ? 1.0 : 0.0;
    nightFactorRef.current = THREE.MathUtils.damp(nightFactorRef.current, target, 4.0, dt);
    const f = nightFactorRef.current;

    // 1. Sky Horizon Background
    currentSky.copy(daySky).lerp(nightSky, f);
    scene.background = currentSky;

    // 2. Ambient Light
    if (ambientRef.current) {
      currentAmbient.copy(dayAmbient).lerp(nightAmbient, f);
      ambientRef.current.color.copy(currentAmbient);
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.55, 0.22, f);
    }

    // 3. Main Daytime Sun
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(1.25, 0.02, f);
    }

    // 4. Directional Silver Moonlight
    if (moonRef.current) {
      moonRef.current.intensity = THREE.MathUtils.lerp(0.0, 0.85, f);
    }

    // 5. Dual-tone Hemisphere Light
    if (hemiRef.current) {
      hemiRef.current.color.copy(dayHemiSky).lerp(nightHemiSky, f);
      hemiRef.current.groundColor.copy(dayHemiGround).lerp(nightHemiGround, f);
      hemiRef.current.intensity = THREE.MathUtils.lerp(0.65, 0.25, f);
    }
  });

  return (
    <>
      {/* Base Ambient Light */}
      <ambientLight ref={ambientRef} intensity={0.55} color="#ffffff" />

      {/* Warm Main Sun with Soft Contact Shadows */}
      <directionalLight
        ref={sunRef}
        position={[25, 42, 22]}
        intensity={1.25}
        color="#fffbeb"
        castShadow
        shadow-mapSize={Platform.OS === 'web' ? [1024, 1024] : [512, 512]}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
      />

      {/* Spooky Directional Silver Moonlight */}
      <directionalLight
        ref={moonRef}
        position={[-45, 38, -65]}
        intensity={0}
        color="#38bdf8"
      />

      {/* Dual-tone Sky & Ground Ambient Fill */}
      <hemisphereLight ref={hemiRef} args={['#7dd3fc', '#fef08a', 0.65]} />

      {/* Subtle Rim Fill Light from the ocean horizon */}
      <directionalLight
        position={[-25, 18, -25]}
        intensity={0.4}
        color="#e0f2fe"
      />
    </>
  );
}

export function LukaoScene() {
  const [cameraMode, setCameraMode] = useState(lukaoStore.getState().cameraMode);

  useEffect(() => {
    // Only re-render scene if cameraMode actually changes (follow vs free)
    // Never re-render root 3D scene graph on timer ticks or menu toggles!
    const unsubscribe = lukaoStore.subscribe(() => {
      const currentMode = lukaoStore.getState().cameraMode;
      setCameraMode((prev) => (prev !== currentMode ? currentMode : prev));
    });

    // Listen to keyboard controls (Web only, guarded)
    const cleanupKeyboard = setupKeyboardControls();

    return () => {
      unsubscribe();
      if (cleanupKeyboard) cleanupKeyboard();
    };
  }, []);

  return (
    <FisheyeCameraRig cameraMode={cameraMode}>
      {/* Dynamic Lighting System (Smooth Day <-> Night Transitions) */}
      <DynamicArchipelagoLighting />

      {/* ── Expansive Ocean World, Beaches, Pier, Clouds & Distant Isles ── */}
      <OceanWorld />

      {/* ── Dolphins Pod & Island-Hopping Navigation (Houses Level 2 Ice Age Island) ── */}
      <DolphinSystem />

      {/* ── Level 3: Al-Dahna Desert World & Grand Pyramids (মরুভূমি ও পিরামিড) ── */}
      <DesertWorldIsland />

      {/* ── Level 4: Mayabi Hill Tracts & Celestial Paradise (মায়াবী পাহাড় ও নদী) ── */}
      <HillTractsIsland />

      {/* ── Inter-Island Transport Hot Air Balloon (Level 2 <-> Level 3 Aerial Flight) ── */}
      <TransportBalloonSystem />

      {/* The Main Island Playground Grounding Arena */}
      <ArenaGround />

      {/* Strategic Hide & Seek Zones */}
      <SeekerTower position={[14, 0, -12]} />
      <BangladeshiVillage position={[-12, 0, 9]} />
      <BushGrove position={[12, 0, 11]} />
      <TunnelBridge position={[-2, 0, -13]} />

      {/* Floating Collectible Star / Gem */}
      <FloatingStar position={[0, 3.2, 0]} />

      {/* Additional Bush Clusters around the arena */}
      <BushGrove position={[-16, 0, -8]} />

      {/* Tall Long Grass & Kashful Groves (কাশফুল ও দীর্ঘ বুনো ঘাসের বন) */}
      <TallGrassGroves />

      {/* Grand Shaded Mango Tree with Brick Chatal Platform (পূর্ব প্রান্তের আম গাছ ও চাতাল) */}
      <MangoTree position={[15.5, 0, -2.5]} scale={1.05} rotationY={0.8} />

      {/* AI Bot Players (Hiders or Seeker based on role) */}
      <AIBots />

      {/* Player Character */}
      <PlayerCharacter />
    </FisheyeCameraRig>
  );
}
