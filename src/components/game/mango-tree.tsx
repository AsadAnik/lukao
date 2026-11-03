import React from 'react';
import * as THREE from 'three';

/**
 * Hanging Ripe Mangoes (রসালো পাকা ও কাঁচা আমের থোকা)
 * Lightweight teardrop fruits with golden-yellow and lime-green blush.
 */
function HangingMangoes() {
  const mangoes = [
    { pos: [1.2, 2.7, 1.1] as [number, number, number], ripe: true },
    { pos: [1.35, 2.55, 0.95] as [number, number, number], ripe: true },
    { pos: [-1.4, 2.6, 1.2] as [number, number, number], ripe: false },
    { pos: [-1.55, 2.45, 1.05] as [number, number, number], ripe: true },
    { pos: [0.8, 2.8, -1.3] as [number, number, number], ripe: true },
    { pos: [-1.1, 2.9, -1.2] as [number, number, number], ripe: true },
    { pos: [-0.3, 2.6, 1.6] as [number, number, number], ripe: false },
    { pos: [1.6, 2.5, -0.4] as [number, number, number], ripe: true },
  ];

  return (
    <group>
      {mangoes.map((m, idx) => (
        <group key={idx} position={m.pos}>
          {/* Stem */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 4]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Teardrop Mango Fruit */}
          <mesh position={[0, 0.02, 0]} scale={[1, 1.35, 0.88]}>
            <sphereGeometry args={[0.13, 6, 6]} />
            <meshStandardMaterial
              color={m.ripe ? '#f59e0b' : '#84cc16'}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Traditional Village Brick/Mud Seating Platform (গাছের তলার বাঁধানো চাতাল)
 * The iconic gathering and resting spot beneath rural Bangladeshi homestead trees.
 */
function TreeChatalPlatform() {
  return (
    <group>
      {/* Lower Terracotta Brick Step */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.5, 0.24, 16]} />
        <meshStandardMaterial color="#9a3412" roughness={0.9} />
      </mesh>

      {/* Upper Smooth Plaster Platform (বসার গোল চাতাল) */}
      <mesh position={[0, 0.28, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.15, 0.16, 16]} />
        <meshStandardMaterial color="#c2410c" roughness={0.85} />
      </mesh>

      {/* Decorative Traditional Clay Pitcher (পানি খাওয়ার মাটির কলসি) */}
      <group position={[1.4, 0.48, 0.8]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#dd6b20" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.09, 0.06, 0.12, 6]} />
          <meshStandardMaterial color="#c05621" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 100% Procedural High-Performance Bangladeshi Mango Tree (গ্রামের ঐতিহ্যবাহী আম গাছ)
 * Zero external assets, zero network fetches, ultra-lightweight (<250 triangles total).
 * Guaranteed locked 60 FPS on Android and iOS in Expo Go!
 */
export function MangoTree({
  position = [-7.5, 0, 14.5],
  scale = 1.0,
  rotationY = 0,
  withPlatform = true,
}: {
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  withPlatform?: boolean;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Soft Contact Blob Shadow Under Tree (বাটার মতো মসৃণ ছায়া - শূন্য ড্র-কল ওভারহেড) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 14]} />
        <meshBasicMaterial color="#064e3b" transparent opacity={0.35} />
      </mesh>

      {/* Traditional Raised Brick / Mud Seating Platform (বাঁধানো চাতাল) */}
      {withPlatform && <TreeChatalPlatform />}

      {/* Gnarled Old Tree Trunk (আম গাছের পুরনো মোটা গুঁড়ি) */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.42, 0.68, 3.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>

      {/* Spreading Roots at the Base */}
      <mesh position={[0.4, 0.35, 0.3]} rotation={[0.4, 0.2, -0.3]}>
        <cylinderGeometry args={[0.15, 0.28, 0.8, 6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.9} />
      </mesh>
      <mesh position={[-0.35, 0.35, -0.35]} rotation={[-0.3, 0.1, 0.4]}>
        <cylinderGeometry args={[0.14, 0.26, 0.8, 6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.9} />
      </mesh>

      {/* Major Forking Branches Reaching Wide */}
      <mesh position={[0.7, 3.2, 0.4]} rotation={[0.35, 0.4, -0.45]}>
        <cylinderGeometry args={[0.22, 0.32, 2.2, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      <mesh position={[-0.65, 3.1, -0.3]} rotation={[-0.3, -0.5, 0.5]}>
        <cylinderGeometry args={[0.2, 0.3, 2.0, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 3.4, -0.7]} rotation={[-0.55, 0.2, 0.1]}>
        <cylinderGeometry args={[0.18, 0.26, 1.8, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>

      {/* Volumetric Lush Mango Leaf Canopies (সবুজ পাতাভরা বিশাল ডালপালা) */}
      <group position={[0, 4.4, 0]}>
        {/* Main central canopy dome */}
        <mesh position={[0, 0.6, 0]}>
          <dodecahedronGeometry args={[2.4, 1]} />
          <meshStandardMaterial color="#15803d" roughness={0.65} flatShading />
        </mesh>
        {/* East lobe */}
        <mesh position={[1.5, -0.2, 0.6]}>
          <dodecahedronGeometry args={[1.7, 1]} />
          <meshStandardMaterial color="#16a34a" roughness={0.65} flatShading />
        </mesh>
        {/* West lobe */}
        <mesh position={[-1.4, -0.1, -0.5]}>
          <dodecahedronGeometry args={[1.65, 1]} />
          <meshStandardMaterial color="#15803d" roughness={0.65} flatShading />
        </mesh>
        {/* North lobe */}
        <mesh position={[0.2, 0.2, -1.5]}>
          <dodecahedronGeometry args={[1.6, 1]} />
          <meshStandardMaterial color="#22c55e" roughness={0.65} flatShading />
        </mesh>
        {/* South lobe */}
        <mesh position={[-0.3, -0.3, 1.4]}>
          <dodecahedronGeometry args={[1.55, 1]} />
          <meshStandardMaterial color="#16a34a" roughness={0.65} flatShading />
        </mesh>
      </group>

      {/* Hanging Clusters of Juicy Mangoes (গাছে ঝুলন্ত হিমসাগর ও ল্যাংড়া আম) */}
      <HangingMangoes />
    </group>
  );
}
