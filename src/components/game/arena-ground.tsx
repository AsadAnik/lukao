import React from 'react';

export function ArenaGround() {
  return (
    <group>
      {/* Main Ground Disc / Platform */}
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[32, 33, 0.5, 64]} />
        <meshStandardMaterial
          color="#38a169"
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Decorative Turf Ring Inset */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 22, 64]} />
        <meshStandardMaterial color="#2f855a" roughness={0.7} />
      </mesh>

      {/* Raised outer bumper ring / perimeter */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[31.8, 0.6, 16, 64]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Decorative boundary posts with soft glow lights */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 31;
        const z = Math.sin(angle) * 31;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 1.5, 16]} />
              <meshStandardMaterial color="#4a5568" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#48bb78' : '#ed8936'}
                emissive={i % 2 === 0 ? '#48bb78' : '#ed8936'}
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* Central Plaza Pattern */}
      <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.2, 32]} />
        <meshStandardMaterial color="#faf089" roughness={0.5} />
      </mesh>

      <mesh receiveShadow position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 32]} />
        <meshStandardMaterial color="#48bb78" roughness={0.6} />
      </mesh>

      {/* Stepping Pads & Low Ramps */}
      <mesh castShadow receiveShadow position={[-6, 0.2, -6]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial color="#fc8181" roughness={0.6} />
      </mesh>

      <mesh castShadow receiveShadow position={[-9, 0.4, -9]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[3.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#f6ad55" roughness={0.6} />
      </mesh>

      {/* Ramp leading up */}
      <mesh castShadow receiveShadow position={[-3.5, 0.25, -6]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[3, 0.2, 2.5]} />
        <meshStandardMaterial color="#63b3ed" roughness={0.6} />
      </mesh>
    </group>
  );
}
