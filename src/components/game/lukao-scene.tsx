import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArenaGround } from './arena-ground';
import { SeekerTower } from './seeker-tower';
import { BangladeshiVillage } from './bangladeshi-village';
import { BushGrove } from './bush-grove';
import { TunnelBridge } from './tunnel-bridge';
import { PlayerCharacter } from './player-character';
import { AIBots } from './ai-bots';
import { FisheyeCameraRig } from './fisheye-camera';
import { lukaoStore } from './game-state';
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
      {/* Sky Background Color (renders on WebGL clearing pass, zero lag, cross-platform) */}
      <color attach="background" args={['#90cdf4']} />

      {/* Balanced, saturated cartoon playground lighting */}
      <ambientLight intensity={0.65} color="#ffffff" />
      <directionalLight
        position={[20, 32, 16]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={['#90cdf4', '#38a169', 0.55]} />

      {/* The Playground Grounding Arena */}
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

      {/* AI Bot Players (Hiders or Seeker based on role) */}
      <AIBots />

      {/* Player Character */}
      <PlayerCharacter />
    </FisheyeCameraRig>
  );
}
