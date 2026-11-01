import React from 'react';

interface BushProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function StylizedBush({ position, scale = 1, color = '#2f855a' }: BushProps) {
  return (
    <group position={position} scale={scale}>
      {/* Cluster of overlapping soft spheres */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 0.5, 0.3]}>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#38a169" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.4, 0.6, -0.3]}>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#276749" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export function StylizedTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 2.4, 8]} />
        <meshStandardMaterial color="#7b341e" roughness={0.9} />
      </mesh>
      {/* Foliage Tiers */}
      <mesh castShadow position={[0, 2.7, 0]}>
        <coneGeometry args={[1.8, 2, 7]} />
        <meshStandardMaterial color="#2f855a" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[0, 3.8, 0]}>
        <coneGeometry args={[1.4, 1.8, 7]} />
        <meshStandardMaterial color="#38a169" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[0, 4.7, 0]}>
        <coneGeometry args={[0.9, 1.4, 7]} />
        <meshStandardMaterial color="#48bb78" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

export function BushGrove({ position = [10, 0, 10] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Grove Trees */}
      <StylizedTree position={[-2, 0, -2]} scale={1.2} />
      <StylizedTree position={[2.5, 0, -1]} scale={1.0} />
      <StylizedTree position={[0, 0, 3]} scale={1.3} />

      {/* Concealment Bushes creating a hiding thicket */}
      <StylizedBush position={[0, 0, 0]} scale={1.8} color="#276749" />
      <StylizedBush position={[-1.6, 0, 1.2]} scale={1.5} color="#2f855a" />
      <StylizedBush position={[1.4, 0, 1.5]} scale={1.6} color="#38a169" />
      <StylizedBush position={[1.8, 0, -1.8]} scale={1.4} color="#22543d" />
      <StylizedBush position={[-1.2, 0, -1.5]} scale={1.3} color="#2f855a" />

      {/* Small decorative mushrooms */}
      {[
        [-0.8, 0.2, 1.8],
        [-0.5, 0.15, 2.1],
        [1.8, 0.18, 0.5],
      ].map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.2, 8]} />
            <meshStandardMaterial color="#f7fafc" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#e53e3e" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

