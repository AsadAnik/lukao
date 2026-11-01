import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SeekerTower({ position = [12, 0, -10] }: { position?: [number, number, number] }) {
  const radarRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  // Animate the radar dish rotation and beacon pulse
  useFrame((state, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 1.5;
    }
    if (beaconRef.current) {
      const material = beaconRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Concrete Foundation Base */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[4.5, 5, 0.8, 8]} />
        <meshStandardMaterial color="#718096" roughness={0.8} />
      </mesh>

      {/* 4 Sturdy Support Columns */}
      {[
        [-2.5, -2.5],
        [2.5, -2.5],
        [-2.5, 2.5],
        [2.5, 2.5],
      ].map(([x, z], idx) => (
        <mesh key={idx} castShadow position={[x, 3.5, z]}>
          <cylinderGeometry args={[0.3, 0.35, 6, 12]} />
          <meshStandardMaterial color="#e53e3e" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}

      {/* Cross Beams for Architectural Detail */}
      <mesh position={[0, 3.5, -2.5]}>
        <boxGeometry args={[5, 0.2, 0.2]} />
        <meshStandardMaterial color="#cbd5e0" />
      </mesh>
      <mesh position={[0, 3.5, 2.5]}>
        <boxGeometry args={[5, 0.2, 0.2]} />
        <meshStandardMaterial color="#cbd5e0" />
      </mesh>
      <mesh position={[-2.5, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5, 0.2, 0.2]} />
        <meshStandardMaterial color="#cbd5e0" />
      </mesh>
      <mesh position={[2.5, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5, 0.2, 0.2]} />
        <meshStandardMaterial color="#cbd5e0" />
      </mesh>

      {/* Observation Deck Platform (Floor) */}
      <mesh castShadow receiveShadow position={[0, 6.6, 0]}>
        <boxGeometry args={[6.5, 0.4, 6.5]} />
        <meshStandardMaterial color="#dd6b20" roughness={0.4} />
      </mesh>

      {/* Safety Railings */}
      {/* Front */}
      <mesh position={[0, 7.3, 3.1]}>
        <boxGeometry args={[6.2, 1, 0.1]} />
        <meshStandardMaterial color="#faf089" roughness={0.3} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 7.3, -3.1]}>
        <boxGeometry args={[6.2, 1, 0.1]} />
        <meshStandardMaterial color="#faf089" roughness={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-3.1, 7.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.2, 1, 0.1]} />
        <meshStandardMaterial color="#faf089" roughness={0.3} />
      </mesh>
      {/* Right (with entrance gap) */}
      <mesh position={[3.1, 7.3, -1.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 1, 0.1]} />
        <meshStandardMaterial color="#faf089" roughness={0.3} />
      </mesh>

      {/* Spiral / Switchback Access Ramp */}
      <mesh castShadow receiveShadow position={[4.2, 3.2, 0]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[1.6, 0.2, 8.5]} />
        <meshStandardMaterial color="#4fd1c5" roughness={0.5} />
      </mesh>

      {/* Center Roof & Canopy */}
      <mesh position={[0, 9.2, 0]}>
        <coneGeometry args={[4.2, 1.8, 8]} />
        <meshStandardMaterial color="#3182ce" roughness={0.3} />
      </mesh>

      {/* Spinning Radar Mast on Top */}
      <group position={[0, 10.3, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
          <meshStandardMaterial color="#718096" metalness={0.8} />
        </mesh>
        
        {/* Pulsing Beacon Light */}
        <mesh ref={beaconRef} position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#e53e3e" emissive="#e53e3e" emissiveIntensity={0.8} />
        </mesh>

        {/* Rotating Radar Dish */}
        <group ref={radarRef} position={[0, 0.6, 0]}>
          <mesh rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.1, 0.15, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

