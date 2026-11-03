import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';
import { audioManager } from './audio-manager';

// ── 1. Interactive Sliding Stone Door (খুলে ও বন্ধ হওয়া পাথরের দরজা) ──
function SlidingStoneDoor({
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  height = 2.8,
  triggerDist = 2.8,
  parentCenter = [-85, 78.5],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  triggerDist?: number;
  parentCenter?: [number, number];
}) {
  const doorRef = useRef<THREE.Mesh>(null);
  const [isOpen, setIsOpen] = useState(false);
  const slideProgress = useRef(0);
  const soundCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!doorRef.current) return;
    const dt = Math.min(delta, 0.05);
    soundCooldown.current -= dt;

    const worldX = parentCenter[0] + position[0];
    const worldZ = parentCenter[1] + position[2];
    const distToPlayer = Math.hypot(
      playerTransform.position.x - worldX,
      playerTransform.position.z - worldZ
    );

    const shouldOpen = distToPlayer < triggerDist;
    if (shouldOpen !== isOpen) {
      setIsOpen(shouldOpen);
      if (soundCooldown.current <= 0) {
        audioManager.playStoneDoorSlide();
        soundCooldown.current = 1.8;
      }
    }

    const targetProgress = isOpen ? 1.0 : 0.0;
    slideProgress.current = THREE.MathUtils.lerp(slideProgress.current, targetProgress, 6.0 * dt);
    doorRef.current.position.y = (height / 2) + slideProgress.current * (height * 0.92);
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Stone Arch Portal Frame */}
      <mesh position={[-width / 2 - 0.22, height / 2, 0]}>
        <boxGeometry args={[0.44, height + 0.4, 0.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      <mesh position={[width / 2 + 0.22, height / 2, 0]}>
        <boxGeometry args={[0.44, height + 0.4, 0.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      <mesh position={[0, height + 0.25, 0]}>
        <boxGeometry args={[width + 0.88, 0.5, 0.55]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>

      {/* The Heavy Carved Sandstone Slab Door */}
      <mesh ref={doorRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.22]} />
        <meshStandardMaterial color="#d97706" roughness={0.75} />
      </mesh>
      <mesh position={[0, height * 0.65, 0.12]}>
        <circleGeometry args={[0.28, 12]} />
        <meshStandardMaterial color="#facc15" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── 2. Walk-In Almira / Wardrobe (পোশাকের আলমিরা — ওয়াক-ইন প্রাইম হাইডিং স্পট) ──
function EgyptianWalkInAlmira({
  position,
  rotationY = Math.PI / 2,
  woodColor = '#451a03',
  trimColor = '#b45309',
  tunicColors = ['#1e40af', '#b91c1c', '#ca8a04'],
}: {
  position: [number, number, number];
  rotationY?: number;
  woodColor?: string;
  trimColor?: string;
  tunicColors?: string[];
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Back Panel */}
      <mesh position={[0, 1.4, -0.75]}>
        <boxGeometry args={[2.3, 2.6, 0.08]} />
        <meshStandardMaterial color={woodColor} roughness={0.85} />
      </mesh>
      {/* Top Cornice Crown */}
      <mesh position={[0, 2.75, 0]}>
        <boxGeometry args={[2.45, 0.18, 1.7]} />
        <meshStandardMaterial color={trimColor} roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.92, 0.75]}>
        <circleGeometry args={[0.25, 12]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Bottom Plinth */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.35, 0.16, 1.6]} />
        <meshStandardMaterial color={woodColor} roughness={0.85} />
      </mesh>
      {/* Side Walls */}
      <mesh position={[-1.12, 1.4, 0]}>
        <boxGeometry args={[0.08, 2.55, 1.55]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>
      <mesh position={[1.12, 1.4, 0]}>
        <boxGeometry args={[0.08, 2.55, 1.55]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>

      {/* Interior Robe Rail with Royal Ceremonial Tunics */}
      <mesh position={[0, 2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} />
      </mesh>
      {tunicColors.map((color, i) => (
        <mesh key={i} position={[(i - 1) * 0.65, 1.5, 0]}>
          <boxGeometry args={[0.38, 1.25, 0.75]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}

      {/* Left Door (Open 75° for walk-in access!) */}
      <group position={[-1.12, 1.4, 0.8]} rotation={[0, -1.35, 0]}>
        <mesh position={[0.54, 0, 0]}>
          <boxGeometry args={[1.08, 2.45, 0.06]} />
          <meshStandardMaterial color={trimColor} roughness={0.75} />
        </mesh>
        <mesh position={[0.96, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.018, 6, 12]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
      </group>

      {/* Right Door (Ajar 60°) */}
      <group position={[1.12, 1.4, 0.8]} rotation={[0, 1.05, 0]}>
        <mesh position={[-0.54, 0, 0]}>
          <boxGeometry args={[1.08, 2.45, 0.06]} />
          <meshStandardMaterial color={trimColor} roughness={0.75} />
        </mesh>
        <mesh position={[-0.96, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.018, 6, 12]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Temple Fire Brazier (আগুনের কুণ্ডলী) ──
function TempleFireBrazier({
  position,
  lightColor = '#f59e0b',
}: {
  position: [number, number, number];
  lightColor?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 1.2, 8]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.48, 0.32, 0.28, 10]} />
        <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={1.4}
          roughness={0.1}
        />
      </mesh>
      <pointLight position={[0, 1.75, 0]} color={lightColor} intensity={0.9} distance={8.0} />
    </group>
  );
}

// ── 4. Grand Entrance Portal Pylons & Walkway ──
function GrandEntrancePortal({
  doorWidth = 2.8,
  doorHeight = 3.0,
  pylonHeight = 4.2,
  brazierColor = '#f59e0b',
}: {
  doorWidth?: number;
  doorHeight?: number;
  pylonHeight?: number;
  brazierColor?: string;
}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Left Monumental Pylon Tower */}
      <mesh position={[-doorWidth / 2 - 1.2, pylonHeight / 2, 0]} castShadow>
        <boxGeometry args={[1.8, pylonHeight, 1.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      {/* Right Monumental Pylon Tower */}
      <mesh position={[doorWidth / 2 + 1.2, pylonHeight / 2, 0]} castShadow>
        <boxGeometry args={[1.8, pylonHeight, 1.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      {/* Massive Overhanging Lintel with Winged Sun Disc */}
      <mesh position={[0, doorHeight + 0.5, 0]} castShadow>
        <boxGeometry args={[doorWidth + 4.2, 0.9, 1.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.75} />
      </mesh>
      <mesh position={[0, doorHeight + 0.5, 0.72]}>
        <circleGeometry args={[0.45, 16]} />
        <meshStandardMaterial color="#facc15" metalness={0.9} emissive="#ca8a04" emissiveIntensity={0.8} />
      </mesh>

      {/* Two Blazing Fire Braziers Flanking Entrance Approach */}
      <TempleFireBrazier position={[-doorWidth / 2 - 2.5, 0, 1.5]} lightColor={brazierColor} />
      <TempleFireBrazier position={[doorWidth / 2 + 2.5, 0, 1.5]} lightColor={brazierColor} />

      {/* Red Carpet / Sandstone Approach Ramp */}
      <mesh position={[0, 0.08, 2.2]} receiveShadow>
        <boxGeometry args={[doorWidth + 0.6, 0.14, 4.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PYRAMID 1: THE GREAT CENTRAL CITADEL PALACE OF RA (26m x 26m — 7 ROOMS)
// Center in world coordinates: [-85.0, 0, 78.5]
// ════════════════════════════════════════════════════════════════════════════
export function PharaohPyramid({ position = [0, 0, 3.5] }: { position?: [number, number, number] }) {
  const PARENT_CENTER: [number, number] = [-85.0, 78.5];

  return (
    <group position={position}>
      {/* ── EXTERIOR STEPPED SANDSTONE SHELL (Open Entrance Portal Cutout!) ── */}
      {/* North Wall Tier 1 */}
      <mesh position={[0, 1.95, 12.2]} receiveShadow castShadow>
        <boxGeometry args={[26.4, 3.9, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>
      {/* East Wall Tier 1 */}
      <mesh position={[12.2, 1.95, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.0, 3.9, 26.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>
      {/* West Wall Tier 1 */}
      <mesh position={[-12.2, 1.95, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.0, 3.9, 26.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>
      {/* South Wall Left of Portal */}
      <mesh position={[-7.6, 1.95, -12.2]} receiveShadow castShadow>
        <boxGeometry args={[11.2, 3.9, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>
      {/* South Wall Right of Portal */}
      <mesh position={[7.6, 1.95, -12.2]} receiveShadow castShadow>
        <boxGeometry args={[11.2, 3.9, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>
      {/* South Wall Lintel over Portal */}
      <mesh position={[0, 3.45, -12.2]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.9, 2.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>

      {/* Second Tier (21m x 21m) */}
      <mesh receiveShadow position={[0, 5.65, 0]}>
        <boxGeometry args={[21.4, 3.5, 21.4]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>
      {/* Third Tier (16m x 16m) */}
      <mesh position={[0, 8.9, 0]}>
        <boxGeometry args={[16.4, 3.0, 16.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* Fourth Tier (11m x 11m) */}
      <mesh position={[0, 11.7, 0]}>
        <boxGeometry args={[11.4, 2.6, 11.4]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>
      {/* Golden Capstone (Apex at y = 17.5m!) */}
      <mesh position={[0, 16.2, 0]}>
        <coneGeometry args={[3.4, 4.4, 4]} />
        <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.85} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── HIGHLY VISIBLE GRAND ENTRANCE PORTAL (OUTSIDE SOUTH FACE) ── */}
      <group position={[0, 0, -12.2]}>
        <GrandEntrancePortal doorWidth={2.8} doorHeight={3.0} brazierColor="#f59e0b" />
      </group>

      {/* ── 100% ENCLOSED PALACE INTERIOR (NO OUTER WORLD VISIBLE!) ── */}
      {/* Floor (23.6m x 23.6m — y = 0.22) */}
      <mesh receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[23.8, 0.06, 23.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Solid Sandstone Ceiling Slab (y = 3.75m) — COMPLETELY BLOCKS SKY! */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[23.8, 0.35, 23.8]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Solid Interior Perimeter Walls */}
      <mesh position={[-6.8, 1.9, -11.8]}>
        <boxGeometry args={[10.2, 3.4, 0.35]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6.8, 1.9, -11.8]}>
        <boxGeometry args={[10.2, 3.4, 0.35]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Main South Sliding Stone Door */}
      <SlidingStoneDoor position={[0, 0.22, -11.8]} width={2.8} height={2.9} parentCenter={PARENT_CENTER} />

      {/* North Interior Wall & Balcony Escape */}
      <mesh position={[-6.8, 1.9, 11.8]}>
        <boxGeometry args={[10.2, 3.4, 0.35]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6.8, 1.9, 11.8]}>
        <boxGeometry args={[10.2, 3.4, 0.35]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <SlidingStoneDoor position={[0, 0.22, 11.8]} width={2.6} height={2.9} parentCenter={PARENT_CENTER} />
      <mesh receiveShadow position={[0, 0.22, 13.8]}>
        <boxGeometry args={[7.2, 0.35, 4.0]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>

      {/* West Interior Wall & Oasis Escape Doorway */}
      <mesh position={[-11.8, 1.9, -6.8]}>
        <boxGeometry args={[0.35, 3.4, 10.2]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-11.8, 1.9, 5.2]}>
        <boxGeometry args={[0.35, 3.4, 13.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <SlidingStoneDoor position={[-11.8, 0.22, -1.8]} rotation={[0, Math.PI / 2, 0]} width={2.4} height={2.8} parentCenter={PARENT_CENTER} />

      {/* East Interior Wall (Solid Continuous) */}
      <mesh position={[11.8, 1.9, 0]}>
        <boxGeometry args={[0.35, 3.4, 23.8]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* ── INTERIOR ROOM PARTITIONS (7 ROOMS) ── */}
      {/* Wall A (West Partition, x = -4.5) */}
      <mesh position={[-4.5, 1.9, -7.5]}><boxGeometry args={[0.3, 3.4, 8.6]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-4.5, 1.9, 5.5]}><boxGeometry args={[0.3, 3.4, 7.5]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[-4.5, 0.22, 0.5]} rotation={[0, Math.PI / 2, 0]} width={2.2} height={2.8} parentCenter={PARENT_CENTER} />

      {/* Wall B (East Partition, x = 4.5) */}
      <mesh position={[4.5, 1.9, -7.5]}><boxGeometry args={[0.3, 3.4, 8.6]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[4.5, 1.9, 5.5]}><boxGeometry args={[0.3, 3.4, 7.5]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[4.5, 0.22, 0.5]} rotation={[0, Math.PI / 2, 0]} width={2.2} height={2.8} parentCenter={PARENT_CENTER} />

      {/* Wall C (South Foyer Wall, z = -6.0) */}
      <mesh position={[-2.8, 1.9, -6.0]}><boxGeometry args={[3.4, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[2.8, 1.9, -6.0]}><boxGeometry args={[3.4, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, -6.0]} width={2.4} height={2.8} parentCenter={PARENT_CENTER} />

      {/* Wall D (North Secret Bypass Wall, z = 9.2) */}
      <mesh position={[-7.5, 1.9, 9.2]}><boxGeometry args={[8.0, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[7.5, 1.9, 9.2]}><boxGeometry args={[8.0, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, 9.2]} width={2.2} height={2.8} parentCenter={PARENT_CENTER} />

      {/* Wall E & F (Bedchamber/Scribe & Treasury/Armory Divides at z = -3.2) */}
      <mesh position={[-8.5, 1.9, -3.2]}><boxGeometry args={[6.6, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[8.5, 1.9, -3.2]}><boxGeometry args={[6.6, 3.4, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>

      {/* ── ROOM 1: Central Hypostyle Hall of Ra ── */}
      {/* 6 Lotus Columns */}
      {[-2.8, 2.8].map((cx, i) =>
        [-3.8, 0, 3.8].map((cz, j) => (
          <group key={`${i}-${j}`} position={[cx, 0.22, cz]}>
            <mesh position={[0, 1.75, 0]} castShadow><cylinderGeometry args={[0.42, 0.48, 2.9, 12]} /><meshStandardMaterial color="#b45309" /></mesh>
            <mesh position={[0, 3.3, 0]}><cylinderGeometry args={[0.7, 0.45, 0.6, 12]} /><meshStandardMaterial color="#d97706" /></mesh>
          </group>
        ))
      )}
      {/* Feast Table (Crawl underneath to hide!) */}
      <group position={[0, 0.22, -1.8]}>
        <mesh position={[0, 0.85, 0]} castShadow><boxGeometry args={[3.8, 0.14, 1.35]} /><meshStandardMaterial color="#78350f" /></mesh>
        <mesh position={[0, 0.93, 0]}><boxGeometry args={[3.6, 0.02, 0.75]} /><meshStandardMaterial color="#b91c1c" /></mesh>
        {[-1.6, 1.6].map((lx, i) =>
          [-0.45, 0.45].map((lz, j) => (
            <mesh key={`${i}-${j}`} position={[lx, 0.4, lz]}><cylinderGeometry args={[0.07, 0.1, 0.78, 8]} /><meshStandardMaterial color="#451a03" /></mesh>
          ))
        )}
      </group>
      {/* Pharaoh Throne on Dais */}
      <group position={[0, 0.22, 5.8]}>
        <mesh position={[0, 0.18, 0]}><boxGeometry args={[2.6, 0.36, 2.2]} /><meshStandardMaterial color="#92400e" /></mesh>
        <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[1.5, 0.65, 1.3]} /><meshStandardMaterial color="#facc15" metalness={0.7} /></mesh>
        <mesh position={[0, 1.75, -0.6]}><boxGeometry args={[1.5, 1.5, 0.22]} /><meshStandardMaterial color="#d97706" metalness={0.6} /></mesh>
      </group>
      {/* 4 Fire Braziers */}
      <TempleFireBrazier position={[-3.6, 0.22, 6.2]} />
      <TempleFireBrazier position={[3.6, 0.22, 6.2]} />
      <TempleFireBrazier position={[-3.6, 0.22, -5.2]} />
      <TempleFireBrazier position={[3.6, 0.22, -5.2]} />

      {/* ── ROOM 2: Royal Bedchamber (North-West) ── */}
      <EgyptianWalkInAlmira position={[-10.6, 0.22, 5.5]} />
      {/* Royal Canopy Daybed (crawl underneath) */}
      <group position={[-7.8, 0.22, 7.8]}>
        <mesh position={[0, 0.78, 0]} castShadow><boxGeometry args={[2.1, 0.14, 1.35]} /><meshStandardMaterial color="#92400e" /></mesh>
        <mesh position={[0, 0.92, 0]}><boxGeometry args={[1.95, 0.16, 1.25]} /><meshStandardMaterial color="#0284c7" /></mesh>
        {[-1.1, 1.1].map((px, i) =>
          [-0.7, 0.7].map((pz, j) => (
            <mesh key={`${i}-${j}`} position={[px, 1.35, pz]}><cylinderGeometry args={[0.05, 0.06, 2.5, 8]} /><meshStandardMaterial color="#facc15" metalness={0.8} /></mesh>
          ))
        )}
      </group>

      {/* ── ROOM 3: Scribe Archives (South-West) ── */}
      <group position={[-10.6, 0.22, -8.0]}>
        {[-0.9, 0.9].map((bx, i) => (
          <mesh key={i} position={[bx, 1.35, 0]} castShadow><boxGeometry args={[1.4, 2.6, 0.6]} /><meshStandardMaterial color="#5c2c16" /></mesh>
        ))}
      </group>

      {/* ── ROOM 4: Royal Treasury & Gold Vault (North-East) ── */}
      <group position={[9.5, 0.22, 5.5]}>
        <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.6, 0.85, 1.1]} /><meshStandardMaterial color="#78350f" /></mesh>
        <mesh position={[0, 0.78, 0]}><boxGeometry args={[1.4, 0.18, 0.9]} /><meshStandardMaterial color="#facc15" metalness={0.9} emissive="#ca8a04" emissiveIntensity={0.6} /></mesh>
      </group>

      {/* ── ROOM 5: Palace Armory (South-East) ── */}
      <group position={[10.2, 0.22, -8.0]}>
        <mesh position={[0, 1.0, 0]}><boxGeometry args={[0.2, 2.0, 2.4]} /><meshStandardMaterial color="#5c2c16" /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PYRAMID 2: THE TEMPLE OF ANUBIS & ARCANE CRYPTS (18m x 18m — 4 ROOMS)
// Center in world coordinates: [-110.0, 0, 75.0]
// ════════════════════════════════════════════════════════════════════════════
export function AnubisPyramid({ position = [-25, 0, 0] }: { position?: [number, number, number] }) {
  const PARENT_CENTER: [number, number] = [-110.0, 75.0];

  return (
    <group position={position}>
      {/* ── EXTERIOR STEPPED SANDSTONE SHELL (Open Entrance Portal Cutout!) ── */}
      {/* North Wall */}
      <mesh position={[0, 1.8, 8.4]} receiveShadow castShadow>
        <boxGeometry args={[18.4, 3.6, 1.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* East & West Walls */}
      <mesh position={[8.4, 1.8, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.6, 3.6, 18.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[-8.4, 1.8, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.6, 3.6, 18.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* South Wall Left & Right of Entrance */}
      <mesh position={[-5.4, 1.8, -8.4]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 3.6, 1.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[5.4, 1.8, -8.4]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 3.6, 1.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.2, -8.4]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.8, 1.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Second Tier (14m x 14m) */}
      <mesh receiveShadow position={[0, 4.8, 0]}>
        <boxGeometry args={[14.4, 3.0, 14.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      {/* Third Tier (10m x 10m) */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[10.4, 2.6, 10.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      {/* Fourth Tier (6m x 6m) */}
      <mesh position={[0, 9.8, 0]}>
        <boxGeometry args={[6.4, 2.2, 6.4]} />
        <meshStandardMaterial color="#92400e" roughness={0.85} />
      </mesh>
      {/* Silver & Obsidian Capstone (Apex at y = 13.5m!) */}
      <mesh position={[0, 12.0, 0]}>
        <coneGeometry args={[2.5, 3.2, 4]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.7} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── GRAND VISIBLE ENTRANCE PORTAL (OUTSIDE SOUTH FACE) ── */}
      <group position={[0, 0, -8.4]}>
        <GrandEntrancePortal doorWidth={2.4} doorHeight={2.8} pylonHeight={3.8} brazierColor="#06b6d4" />
      </group>

      {/* ── 100% ENCLOSED INTERIOR (NO SKY LEAK) ── */}
      {/* Floor (16.0m x 16.0m — y = 0.22) */}
      <mesh receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[16.2, 0.05, 16.2]} />
        <meshStandardMaterial color="#1e1b18" roughness={0.9} />
      </mesh>
      {/* Solid Stone Ceiling Slab (y = 3.4m) */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[16.2, 0.3, 16.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Solid Perimeter Interior Walls */}
      <mesh position={[-4.5, 1.8, -8.0]}><boxGeometry args={[7.2, 3.2, 0.3]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>
      <mesh position={[4.5, 1.8, -8.0]}><boxGeometry args={[7.2, 3.2, 0.3]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, -8.0]} width={2.4} height={2.6} parentCenter={PARENT_CENTER} />

      {/* North Wall & Dune Escape */}
      <mesh position={[-4.5, 1.8, 8.0]}><boxGeometry args={[7.2, 3.2, 0.3]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>
      <mesh position={[4.5, 1.8, 8.0]}><boxGeometry args={[7.2, 3.2, 0.3]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, 8.0]} width={2.2} height={2.6} parentCenter={PARENT_CENTER} />

      {/* East & West Solid Walls */}
      <mesh position={[8.0, 1.8, 0]}><boxGeometry args={[0.3, 3.2, 16.2]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-8.0, 1.8, 0]}><boxGeometry args={[0.3, 3.2, 16.2]} /><meshStandardMaterial color="#334155" side={THREE.DoubleSide} /></mesh>

      {/* ── INTERIOR ROOMS (ANUBIS CRYPTS) ── */}
      {/* Center Dividing Spine Walls (x = -3.2 and x = 3.2) */}
      <mesh position={[-3.2, 1.8, -3.5]}><boxGeometry args={[0.3, 3.2, 6.0]} /><meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-3.2, 1.8, 4.5]}><boxGeometry args={[0.3, 3.2, 4.0]} /><meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[-3.2, 0.22, 1.0]} rotation={[0, Math.PI / 2, 0]} width={2.0} height={2.6} parentCenter={PARENT_CENTER} />

      <mesh position={[3.2, 1.8, -3.5]}><boxGeometry args={[0.3, 3.2, 6.0]} /><meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} /></mesh>
      <mesh position={[3.2, 1.8, 4.5]}><boxGeometry args={[0.3, 3.2, 4.0]} /><meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[3.2, 0.22, 1.0]} rotation={[0, Math.PI / 2, 0]} width={2.0} height={2.6} parentCenter={PARENT_CENTER} />

      {/* Room 1: Central Hall of Columns */}
      {[-1.8, 1.8].map((cx, i) =>
        [-2.5, 2.5].map((cz, j) => (
          <mesh key={`${i}-${j}`} position={[cx, 1.6, cz]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 2.8, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}
      {/* Sacred Relic Stone Altar Table (crawl under to hide!) */}
      <group position={[0, 0.22, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2.8, 0.16, 1.4]} /><meshStandardMaterial color="#0f172a" /></mesh>
        {[-1.2, 1.2].map((ax, i) => (
          <mesh key={i} position={[ax, 0.38, 0]}><boxGeometry args={[0.3, 0.72, 1.2]} /><meshStandardMaterial color="#1e293b" /></mesh>
        ))}
      </group>
      <TempleFireBrazier position={[0, 0.22, -4.5]} lightColor="#06b6d4" />
      <TempleFireBrazier position={[0, 0.22, 4.5]} lightColor="#06b6d4" />

      {/* Room 2 (West): High Priest's Laboratory with Walk-In Canopic Almira */}
      <EgyptianWalkInAlmira position={[-6.8, 0.22, 3.5]} woodColor="#0f172a" trimColor="#0284c7" tunicColors={['#0369a1', '#0284c7', '#38bdf8']} />
      <group position={[-5.8, 0.22, -4.5]}>
        <mesh position={[0, 0.7, 0]}><boxGeometry args={[1.8, 0.1, 0.9]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0.85, 0]}><sphereGeometry args={[0.15, 8, 8]} /><meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} /></mesh>
      </group>

      {/* Room 3 (East): Sacred Crypt of the Golden Scarab */}
      <group position={[5.8, 0.22, 3.5]}>
        <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.5, 0.85, 1.1]} /><meshStandardMaterial color="#1e1b18" /></mesh>
        <mesh position={[0, 0.8, 0]}><boxGeometry args={[1.3, 0.15, 0.9]} /><meshStandardMaterial color="#38bdf8" metalness={0.8} emissive="#0284c7" emissiveIntensity={0.6} /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PYRAMID 3: CITADEL OF BASTET & QUEEN'S PALACE (16m x 16m — 4 ROOMS)
// Center in world coordinates: [-65.0, 0, 53.0]
// ════════════════════════════════════════════════════════════════════════════
export function BastetPyramid({ position = [20, 0, -22] }: { position?: [number, number, number] }) {
  const PARENT_CENTER: [number, number] = [-65.0, 53.0];

  return (
    <group position={position}>
      {/* ── EXTERIOR STEPPED SANDSTONE SHELL (Open Entrance Portal Cutout!) ── */}
      {/* North Wall */}
      <mesh position={[0, 1.7, 7.4]} receiveShadow castShadow>
        <boxGeometry args={[16.4, 3.4, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* East & West Walls */}
      <mesh position={[7.4, 1.7, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 3.4, 16.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      <mesh position={[-7.4, 1.7, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 3.4, 16.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* South Wall Left & Right of Entrance */}
      <mesh position={[-4.8, 1.7, -7.4]} receiveShadow castShadow>
        <boxGeometry args={[6.8, 3.4, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      <mesh position={[4.8, 1.7, -7.4]} receiveShadow castShadow>
        <boxGeometry args={[6.8, 3.4, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.0, -7.4]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.8, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>

      {/* Second Tier (12m x 12m) */}
      <mesh receiveShadow position={[0, 4.6, 0]}>
        <boxGeometry args={[12.4, 2.8, 12.4]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>
      {/* Third Tier (8m x 8m) */}
      <mesh position={[0, 7.0, 0]}>
        <boxGeometry args={[8.4, 2.4, 8.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      {/* Rose Gold & Bronze Capstone (Apex at y = 11.5m!) */}
      <mesh position={[0, 9.8, 0]}>
        <coneGeometry args={[2.2, 3.0, 4]} />
        <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.8} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── GRAND VISIBLE ENTRANCE PORTAL (OUTSIDE SOUTH FACE) ── */}
      <group position={[0, 0, -7.4]}>
        <GrandEntrancePortal doorWidth={2.4} doorHeight={2.6} pylonHeight={3.6} brazierColor="#f97316" />
      </group>

      {/* ── 100% ENCLOSED INTERIOR (NO SKY LEAK) ── */}
      {/* Floor (14.0m x 14.0m — y = 0.22) */}
      <mesh receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[14.2, 0.05, 14.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Solid Stone Ceiling Slab (y = 3.3m) */}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[14.2, 0.3, 14.2]} />
        <meshStandardMaterial color="#451a03" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Perimeter Interior Walls */}
      <mesh position={[-3.8, 1.7, -7.0]}><boxGeometry args={[6.4, 3.0, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[3.8, 1.7, -7.0]}><boxGeometry args={[6.4, 3.0, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, -7.0]} width={2.4} height={2.6} parentCenter={PARENT_CENTER} />

      {/* North Wall & Dune Escape */}
      <mesh position={[-3.8, 1.7, 7.0]}><boxGeometry args={[6.4, 3.0, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[3.8, 1.7, 7.0]}><boxGeometry args={[6.4, 3.0, 0.3]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[0, 0.22, 7.0]} width={2.2} height={2.6} parentCenter={PARENT_CENTER} />

      {/* East & West Solid Walls */}
      <mesh position={[7.0, 1.7, 0]}><boxGeometry args={[0.3, 3.0, 14.2]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-7.0, 1.7, 0]}><boxGeometry args={[0.3, 3.0, 14.2]} /><meshStandardMaterial color="#92400e" side={THREE.DoubleSide} /></mesh>

      {/* ── INTERIOR ROOMS (QUEEN'S CITADEL) ── */}
      {/* Center Dividing Spine Walls */}
      <mesh position={[-2.8, 1.7, -3.0]}><boxGeometry args={[0.3, 3.0, 5.0]} /><meshStandardMaterial color="#78350f" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-2.8, 1.7, 3.8]}><boxGeometry args={[0.3, 3.0, 3.5]} /><meshStandardMaterial color="#78350f" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[-2.8, 0.22, 0.8]} rotation={[0, Math.PI / 2, 0]} width={1.8} height={2.4} parentCenter={PARENT_CENTER} />

      <mesh position={[2.8, 1.7, -3.0]}><boxGeometry args={[0.3, 3.0, 5.0]} /><meshStandardMaterial color="#78350f" side={THREE.DoubleSide} /></mesh>
      <mesh position={[2.8, 1.7, 3.8]}><boxGeometry args={[0.3, 3.0, 3.5]} /><meshStandardMaterial color="#78350f" side={THREE.DoubleSide} /></mesh>
      <SlidingStoneDoor position={[2.8, 0.22, 0.8]} rotation={[0, Math.PI / 2, 0]} width={1.8} height={2.4} parentCenter={PARENT_CENTER} />

      {/* Room 1: The Queen's Silk Bedchamber (West) with Walk-In Almira */}
      <EgyptianWalkInAlmira position={[-5.8, 0.22, 2.5]} woodColor="#5c2c16" trimColor="#d97706" tunicColors={['#ec4899', '#f59e0b', '#8b5cf6']} />
      <group position={[-5.2, 0.22, -3.8]}>
        <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.9, 0.14, 1.2]} /><meshStandardMaterial color="#92400e" /></mesh>
        <mesh position={[0, 0.88, 0]}><boxGeometry args={[1.75, 0.14, 1.1]} /><meshStandardMaterial color="#ec4899" /></mesh>
      </group>

      {/* Room 2: Feast Hall of Bastet (Center) */}
      <group position={[0, 0.22, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2.4, 0.14, 1.2]} /><meshStandardMaterial color="#78350f" /></mesh>
        {[-1.0, 1.0].map((bx, i) => (
          <mesh key={i} position={[bx, 0.38, 0]}><cylinderGeometry args={[0.07, 0.09, 0.72, 8]} /><meshStandardMaterial color="#451a03" /></mesh>
        ))}
      </group>
      <TempleFireBrazier position={[0, 0.22, -3.8]} lightColor="#f97316" />
      <TempleFireBrazier position={[0, 0.22, 3.8]} lightColor="#f97316" />

      {/* Room 3: Treasury of Bastet (East) */}
      <group position={[5.2, 0.22, 2.5]}>
        <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.4, 0.8, 1.0]} /><meshStandardMaterial color="#78350f" /></mesh>
        <mesh position={[0, 0.75, 0]}><boxGeometry args={[1.2, 0.14, 0.85]} /><meshStandardMaterial color="#facc15" metalness={0.9} emissive="#ea580c" emissiveIntensity={0.6} /></mesh>
      </group>
    </group>
  );
}
