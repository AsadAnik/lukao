import React from 'react';

interface ContainerProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  size?: [number, number, number];
}

function ShippingContainer({ position, rotation = [0, 0, 0], color, size = [5, 2.5, 2.2] }: ContainerProps) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={rotation}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Corrugated Ridges / Edge Trims */}
      <mesh position={[0, 0, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.95, h * 0.9, 0.02]} />
        <meshStandardMaterial color="#2d3748" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -d / 2 - 0.02]}>
        <boxGeometry args={[w * 0.95, h * 0.9, 0.02]} />
        <meshStandardMaterial color="#2d3748" roughness={0.6} />
      </mesh>
    </group>
  );
}

function WoodenCrate({ position, rotation = [0, 0, 0], size = 1.4 }: { position: [number, number, number]; rotation?: [number, number, number]; size?: number }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#b7791f" roughness={0.8} />
      </mesh>
      {/* Metal banding */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 1.01, size * 0.15, size * 1.01]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function CrateYard({ position = [-12, 0, 8] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ground Container 1 (Coral Pink) */}
      <ShippingContainer position={[0, 1.25, 0]} color="#f56565" />

      {/* Ground Container 2 (Teal) - perpendicular forming an L-alley */}
      <ShippingContainer position={[3.6, 1.25, 3.5]} rotation={[0, Math.PI / 2, 0]} color="#38b2ac" />

      {/* Stacked Container 3 (Indigo) - elevated on top of Container 1 */}
      <ShippingContainer position={[0.5, 3.75, 0.2]} rotation={[0, 0.15, 0]} color="#5a67d8" />

      {/* Stacked Container 4 (Sunshine Yellow) */}
      <ShippingContainer position={[-4, 1.25, -2]} rotation={[0, -0.4, 0]} color="#ecc94b" />

      {/* Wooden Crates forming a climbing staircase to container roofs */}
      <WoodenCrate position={[-3, 0.7, 1.5]} />
      <WoodenCrate position={[-3, 0.7, 3]} />
      <WoodenCrate position={[-3, 2.1, 2.2]} />
      
      {/* Secret Hiding Nook Crates */}
      <WoodenCrate position={[1.5, 0.7, 4.5]} rotation={[0, 0.2, 0]} />
      <WoodenCrate position={[1.5, 0.7, 6]} rotation={[0, -0.3, 0]} />
      <WoodenCrate position={[2.8, 0.7, 6.2]} />
      <WoodenCrate position={[2.1, 2.1, 5.5]} />

      {/* Red Barrel / Fuel Drums */}
      {[
        [-1, 0.6, 3.5],
        [-0.2, 0.6, 3.8],
        [-0.6, 1.8, 3.65],
      ].map(([x, y, z], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, y, z]}>
          <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
          <meshStandardMaterial color="#e53e3e" roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

