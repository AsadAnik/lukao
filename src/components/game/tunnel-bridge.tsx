import React from 'react';

export function TunnelBridge({ position = [-2, 0, -12] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Arch Bridge Structure */}
      {/* Deck / Walkway */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[10, 0.4, 3.2]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.5} />
      </mesh>

      {/* Bridge Approach Ramps */}
      <mesh castShadow receiveShadow position={[-5.8, 0.9, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[3, 0.35, 3.2]} />
        <meshStandardMaterial color="#d69e2e" roughness={0.5} />
      </mesh>
      <mesh castShadow receiveShadow position={[5.8, 0.9, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[3, 0.35, 3.2]} />
        <meshStandardMaterial color="#d69e2e" roughness={0.5} />
      </mesh>

      {/* Safety Railings */}
      <mesh position={[0, 2.5, 1.5]}>
        <boxGeometry args={[9.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#ed8936" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, -1.5]}>
        <boxGeometry args={[9.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#ed8936" roughness={0.3} />
      </mesh>

      {/* Hollow Concrete Pipe / Tunnel Underneath */}
      <group position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer Cylinder Pipe */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 4.2, 24, 1, true]} />
          <meshStandardMaterial color="#a0aec0" roughness={0.7} side={2} />
        </mesh>
        {/* Colorful stripes around the pipe mouth */}
        <mesh position={[0, 2.1, 0]}>
          <torusGeometry args={[1.52, 0.08, 12, 32]} />
          <meshStandardMaterial color="#e53e3e" roughness={0.3} />
        </mesh>
        <mesh position={[0, -2.1, 0]}>
          <torusGeometry args={[1.52, 0.08, 12, 32]} />
          <meshStandardMaterial color="#e53e3e" roughness={0.3} />
        </mesh>
      </group>

      {/* Side Support Pillars */}
      {[-3, 3].map((x, i) => (
        <group key={i} position={[x, 0.8, 0]}>
          <mesh castShadow position={[0, 0, 1.4]}>
            <cylinderGeometry args={[0.25, 0.3, 1.7, 12]} />
            <meshStandardMaterial color="#4a5568" />
          </mesh>
          <mesh castShadow position={[0, 0, -1.4]}>
            <cylinderGeometry args={[0.25, 0.3, 1.7, 12]} />
            <meshStandardMaterial color="#4a5568" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

