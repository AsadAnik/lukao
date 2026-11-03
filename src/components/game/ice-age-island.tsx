import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FrostCitadelCastle } from './frost-castle';
import { IceAgeAnimals } from './ice-age-animals';

// ── 1. Lightweight 60 FPS Snowfall Weather Engine (হিমেল তুষারপাত — ৩৬০° দ্বীপব্যাপী) ──
export function IceAgeSnowfall({
  count = 110,
  center = [85, 0, 65],
  radius = 34,
}: {
  count?: number;
  center?: [number, number, number];
  radius?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize random particle positions & velocities within expanded island radius
  const [positions, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      pos[i * 3] = center[0] + Math.cos(angle) * dist;
      pos[i * 3 + 1] = Math.random() * 10.0; // height up to 10m
      pos[i * 3 + 2] = center[2] + Math.sin(angle) * dist;

      spd[i] = 1.2 + Math.random() * 1.2; // fall speed 1.2 to 2.4 m/s
      off[i] = Math.random() * Math.PI * 2; // sway phase
    }

    return [pos, spd, off];
  }, [count, center, radius]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Fall down
      arr[idx + 1] -= speeds[i] * dt;

      // Gentle horizontal polar wind drift
      arr[idx] += Math.sin(t * 1.4 + offsets[i]) * 0.3 * dt;
      arr[idx + 2] += Math.cos(t * 1.1 + offsets[i]) * 0.3 * dt;

      // Wrap around from below sea level back to cloud height
      if (arr[idx + 1] < -0.3) {
        arr[idx + 1] = 10.0;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * radius;
        arr[idx] = center[0] + Math.cos(angle) * dist;
        arr[idx + 2] = center[2] + Math.sin(angle) * dist;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.18}
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── 2. Dual-Tier Glacial Waterfall & Secret Walk-In Grotto (ঝরনার পেছনের গোপন গুহা) ──
function MassiveGlacialWaterfall() {
  const upperWaterRef = useRef<THREE.Mesh>(null);
  const lowerWaterRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (upperWaterRef.current) {
      upperWaterRef.current.position.y = 1.8 + Math.sin(t * 4.8) * 0.025;
      upperWaterRef.current.scale.x = 1.0 + Math.sin(t * 6.0) * 0.035;
    }
    if (lowerWaterRef.current) {
      lowerWaterRef.current.position.y = 0.72 + Math.sin(t * 5.2) * 0.02;
    }
    if (foamRef.current) {
      foamRef.current.scale.setScalar(1.0 + Math.sin(t * 7.5) * 0.06);
    }
  });

  return (
    <group position={[-14.0, 0, 21.5]} rotation={[0, 0.35, 0]}>
      {/* Upper Glacier Spring Lip */}
      <mesh position={[0, 2.42, -1.2]}>
        <boxGeometry args={[4.2, 0.22, 1.8]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.15} metalness={0.2} />
      </mesh>

      {/* Secret Walk-In Cave Behind the Waterfall Curtain (অপ্রত্যাশিত হাইডিং গুহা) */}
      <mesh position={[0, 1.2, -1.4]}>
        <boxGeometry args={[4.6, 2.2, 2.2]} />
        <meshStandardMaterial color="#0284c7" roughness={0.35} />
      </mesh>
      {/* Glowing Cyan Stalactite in Secret Grotto */}
      <mesh position={[0, 2.1, -1.2]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 1.1, 6]} />
        <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>

      {/* Upper Waterfall Sheet (Drops from y=2.4 down to y=1.2) */}
      <mesh ref={upperWaterRef} position={[0, 1.8, 0.1]} rotation={[0.22, 0, 0]}>
        <planeGeometry args={[3.4, 1.4, 6, 8]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.35}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mid Stepped Lagoon Basin Shelf */}
      <mesh position={[0, 1.18, 0.5]}>
        <boxGeometry args={[3.8, 0.25, 1.6]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.2} />
      </mesh>

      {/* Lower Waterfall Sheet (Drops from y=1.2 down to y=0.15) */}
      <mesh ref={lowerWaterRef} position={[0, 0.72, 1.15]} rotation={[0.32, 0, 0]}>
        <planeGeometry args={[3.6, 1.3, 6, 8]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
          roughness={0.05}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lower Pool Basin Foam Wake */}
      <mesh ref={foamRef} position={[0, 0.14, 1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 20]} />
        <meshBasicMaterial color="#f0f9ff" transparent opacity={0.85} />
      </mesh>

      {/* Crystal Turquoise Glacial Pool */}
      <mesh position={[0, 0.12, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 24]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.15} transparent opacity={0.9} />
      </mesh>

      {/* Row of Sharp Hanging Icicles across the waterfall lip */}
      {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map((ix, idx) => (
        <mesh key={idx} position={[ix, 2.25, -0.2]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, idx % 2 === 0 ? 0.65 : 0.95, 6]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.12} metalness={0.25} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

// ── 3. Giant Prehistoric Woolly Mammoth Skeleton & Ribcage Tunnel (বিশাল ম্যামথ ও কঙ্কালের সুড়ঙ্গ) ──
function GiantWoollyMammothTunnel({ position = [14.0, 0.12, -7.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.75, 0]}>
      {/* Snowdrifts Base Mound */}
      <mesh receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[3.8, 4.8, 0.5, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
      </mesh>

      {/* Giant Mammoth Massive Skull */}
      <group position={[0, 2.4, 2.8]} rotation={[-0.25, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.3, 12, 12]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.55} />
        </mesh>
        {/* Eye sockets */}
        {[-0.65, 0.65].map((ex, i) => (
          <mesh key={i} position={[ex, 0.2, 0.9]}>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        ))}
        {/* Mammoth Trunk Spout */}
        <mesh position={[0, -1.2, 0.8]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.2, 2.2, 8]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.6} />
        </mesh>

        {/* Huge Left Sweeping Ivory Tusk */}
        <group position={[-1.1, -0.4, 0.5]} rotation={[0.4, 0.5, 0.7]}>
          <mesh castShadow position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.18, 0.38, 3.8, 8]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.3} />
          </mesh>
          <mesh castShadow position={[0.65, 3.6, -0.3]} rotation={[0.5, -0.3, -0.7]}>
            <coneGeometry args={[0.18, 1.8, 8]} />
            <meshStandardMaterial color="#fef08a" roughness={0.3} />
          </mesh>
        </group>

        {/* Huge Right Sweeping Ivory Tusk */}
        <group position={[1.1, -0.4, 0.5]} rotation={[0.4, -0.5, -0.7]}>
          <mesh castShadow position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.18, 0.38, 3.8, 8]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.3} />
          </mesh>
          <mesh castShadow position={[-0.65, 3.6, -0.3]} rotation={[0.5, 0.3, 0.7]}>
            <coneGeometry args={[0.18, 1.8, 8]} />
            <meshStandardMaterial color="#fef08a" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Mammoth Spine Arch (Beam connecting over the walk-through tunnel) */}
      <mesh castShadow position={[0, 3.1, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 6.2, 8]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>

      {/* 5 Walk-Through Ribcage Arches (Tunnel Height = 2.4m, Width = 2.8m — Players run inside to hide!) */}
      {[-2.4, -1.2, 0.0, 1.2, 2.4].map((rz, i) => (
        <group key={i} position={[0, 0.3, rz]}>
          {/* Left Rib */}
          <mesh position={[-1.2, 1.4, 0]} rotation={[0, 0, 0.32]}>
            <cylinderGeometry args={[0.12, 0.16, 2.8, 6]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.45} />
          </mesh>
          {/* Right Rib */}
          <mesh position={[1.2, 1.4, 0]} rotation={[0, 0, -0.32]}>
            <cylinderGeometry args={[0.12, 0.16, 2.8, 6]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Massive Furry Frozen Leg Pillars (Provide dense vertical cover) */}
      {[
        [-1.6, 1.1, 1.6],
        [1.6, 1.1, 1.6],
        [-1.6, 1.1, -2.4],
        [1.6, 1.1, -2.4],
      ].map(([lx, ly, lz], i) => (
        <mesh key={i} castShadow position={[lx, ly, lz]}>
          <cylinderGeometry args={[0.42, 0.58, 2.2, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── 4. Deep Glacial Crevasse, Secret Escape Underpass & Ice Bridge (হিমবাহের ফাটল ও বরফের সাঁকো) ──
function GlacialCrevasseAndBridge({ position = [-14.0, 0, -6.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* West Cliff Wall (Height = 1.45m) */}
      <mesh castShadow receiveShadow position={[-2.4, 0.72, 0]}>
        <boxGeometry args={[2.2, 1.45, 12.0]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* East Cliff Wall (Height = 1.45m) */}
      <mesh castShadow receiveShadow position={[2.4, 0.72, 0]}>
        <boxGeometry args={[2.2, 1.45, 12.0]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Deep Crevasse Trench Floor (y = 0.05m — Players drop into trench to hide from Seekers!) */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[2.6, 0.1, 12.0]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.25} />
      </mesh>

      {/* Translucent Arching Ice Bridge Spanning the Crevasse (Bridge Deck at y = 1.45m) */}
      <group position={[0, 1.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.22, 2.2]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Frosted Handrails */}
        {[-1.0, 1.0].map((rz, i) => (
          <mesh key={i} position={[0, 0.35, rz]}>
            <boxGeometry args={[4.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Secret Escape Crawlway Tunnel through East Cliff Wall */}
      <mesh position={[2.4, 0.5, 3.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.65, 0.65, 2.6, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#0369a1" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── 5. Multi-Chamber Frozen Sabertooth Cavern (তুষার বাঘের গুহা) ──
function SabertoothIceCavern({ position = [16.0, 0.12, 14.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -1.8, 0]}>
      {/* Massive Cavern Outer Ice Dome */}
      <mesh castShadow receiveShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[4.2, 5.4, 3.6, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.22} metalness={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Snowdrift Dome Cap */}
      <mesh receiveShadow position={[0, 3.4, 0]}>
        <sphereGeometry args={[3.8, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>

      {/* Interior Split Chambers (Two alcoves inside for multiple players to hide!) */}
      <mesh position={[-1.2, 1.1, -2.0]}>
        <boxGeometry args={[3.0, 2.2, 2.2]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
      <mesh position={[1.4, 1.1, -1.8]}>
        <boxGeometry args={[3.0, 2.2, 2.2]} />
        <meshStandardMaterial color="#0369a1" roughness={0.3} />
      </mesh>

      {/* Sabertooth Fossil Skull Arch at Cave Entrance */}
      <group position={[0, 2.5, 1.2]} rotation={[0.2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.9, 1.6]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
        {/* Iconic Sabertooth Curved Fangs */}
        {[-0.45, 0.45].map((fx, i) => (
          <mesh key={i} position={[fx, -0.75, 0.6]} rotation={[0.3, i === 0 ? 0.15 : -0.15, 0]}>
            <coneGeometry args={[0.08, 1.1, 6]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* Crystalline Stalactite Ice Chandelier */}
      <mesh position={[0, 2.6, -0.6]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1.4, 6]} />
        <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.85} />
      </mesh>
    </group>
  );
}

// ── 6. Camouflaged Snowmen Decoy Grove (তুষারমানব বা স্নোম্যান ছদ্মবেশ) ──
// Unpredictable Hide & Seek spot: Players can crouch right among snowmen to fool seekers!
function CamouflageSnowmenGrove({ position = [-12.0, 0.12, -18.0] }: { position?: [number, number, number] }) {
  const snowmen = [
    { pos: [-1.4, 0, -1.0], scale: 1.1, rot: 0.2 },
    { pos: [1.6, 0, -0.8], scale: 0.9, rot: -0.4 },
    { pos: [0.2, 0, 1.4], scale: 1.0, rot: 1.2 },
    { pos: [-1.8, 0, 1.2], scale: 0.85, rot: -1.0 },
  ];

  return (
    <group position={position}>
      {/* Snowdrifts Clearing */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[3.8, 4.4, 0.25, 14]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.88} />
      </mesh>

      {snowmen.map((sn, idx) => (
        <group key={idx} position={sn.pos as [number, number, number]} scale={sn.scale} rotation={[0, sn.rot, 0]}>
          {/* Bottom Snowball */}
          <mesh castShadow position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.55, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.85} />
          </mesh>
          {/* Mid Snowball */}
          <mesh castShadow position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.42, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.85} />
          </mesh>
          {/* Head Snowball */}
          <mesh castShadow position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.32, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.85} />
          </mesh>
          {/* Carrot Nose */}
          <mesh position={[0, 1.65, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.06, 0.28, 6]} />
            <meshStandardMaterial color="#ea580c" roughness={0.5} />
          </mesh>
          {/* Pebble Buttons */}
          {[0.95, 1.15].map((py, i) => (
            <mesh key={i} position={[0, py, 0.42]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))}
          {/* Twig Arms */}
          <mesh position={[-0.45, 1.15, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 5]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0.45, 1.15, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 5]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Quirky Bucket Hat */}
          <mesh position={[0, 1.95, 0]} rotation={[-0.1, 0, 0.15]}>
            <cylinderGeometry args={[0.18, 0.24, 0.3, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#dc2626' : '#2563eb'} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 7. Floating Lagoon Ice Floes Stepping Stones (ভাসমান বরফখণ্ড) ──
function FloatingLagoonIceFloes() {
  const floe1Ref = useRef<THREE.Group>(null);
  const floe2Ref = useRef<THREE.Group>(null);
  const floe3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (floe1Ref.current) floe1Ref.current.position.y = -0.05 + Math.sin(t * 1.6) * 0.03;
    if (floe2Ref.current) floe2Ref.current.position.y = -0.05 + Math.sin(t * 1.8 + 0.8) * 0.03;
    if (floe3Ref.current) floe3Ref.current.position.y = -0.05 + Math.sin(t * 1.5 + 1.6) * 0.03;
  });

  return (
    <group position={[18.0, 0, -18.0]}>
      {/* Floe 1 */}
      <group ref={floe1Ref} position={[-3.5, 0, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.5, 1.7, 0.28, 7]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.3, 1.4, 0.04, 7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>

      {/* Floe 2 */}
      <group ref={floe2Ref} position={[0, 0, 1.5]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 0.28, 6]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.2, 1.3, 0.04, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>

      {/* Floe 3 */}
      <group ref={floe3Ref} position={[3.5, 0, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.28, 8]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.4, 1.5, 0.04, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>

      {/* Isolated Outcrop Rock with Glowing Ice Star */}
      <group position={[6.5, 0.2, 0.5]}>
        <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.6, 2.2, 1.2, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ── 8. Frosted Snow-Covered Alpine Fir Trees (তুষারাবৃত পাইন গাছ) ──
function FrostedPineTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Weathered Dark Timber Trunk */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.32, 2.4, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>

      {/* Layer 1 Foliage (Dark Evergreen Base with Snow Fringe) */}
      <mesh castShadow position={[0, 2.2, 0]}>
        <coneGeometry args={[1.6, 1.8, 6]} />
        <meshStandardMaterial color="#0f766e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[1.35, 0.7, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>

      {/* Layer 2 Foliage */}
      <mesh castShadow position={[0, 3.3, 0]}>
        <coneGeometry args={[1.25, 1.6, 6]} />
        <meshStandardMaterial color="#115e59" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <coneGeometry args={[1.05, 0.6, 6]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Layer 3 Apex Spire */}
      <mesh castShadow position={[0, 4.3, 0]}>
        <coneGeometry args={[0.85, 1.4, 6]} />
        <meshStandardMaterial color="#0f766e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <coneGeometry args={[0.65, 0.55, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── 9. Glowing Cyan Ice Crystals Cluster (হিম স্ফটিক) ──
function IceCrystalCluster({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.7}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh castShadow position={[-0.4, 0.5, 0.2]} rotation={[0.3, 0.2, 0.5]}>
        <coneGeometry args={[0.24, 1.1, 5]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.55} roughness={0.15} />
      </mesh>
      <mesh castShadow position={[0.4, 0.45, -0.2]} rotation={[-0.2, 0.4, -0.45]}>
        <coneGeometry args={[0.22, 1.0, 5]} />
        <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.6} roughness={0.12} />
      </mesh>
    </group>
  );
}

// ── 10. Master Component: The Complete Expansive Level 2 Ice Age Island (হিমেল দ্বীপ — Radius ~32m) ──
export function IceAgeIsland() {
  return (
    <group position={[85, 0, 65]}>
      {/* ── 1. Submerged Glacial Pack Ice Reef Base (Radius 33.5m) ── */}
      <mesh receiveShadow position={[0, -0.65, 0]}>
        <cylinderGeometry args={[32.0, 34.5, 0.45, 36]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ── 2. Frost-Glazed Shoreline Ice Shelf (Radius 30.5m) ── */}
      <mesh receiveShadow position={[0, -0.32, 0]}>
        <cylinderGeometry args={[29.5, 31.8, 0.35, 36]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* ── 3. Packed Snow Cliff Tier (Radius 28.0m) ── */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[26.5, 28.8, 0.28, 36]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.65} />
      </mesh>

      {/* ── 4. Main Expansive Snow Plateau (Radius 25.5m — y = 0.10) ── */}
      <mesh receiveShadow position={[0, 0.10, 0]}>
        <cylinderGeometry args={[24.0, 26.2, 0.32, 36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.88} />
      </mesh>

      {/* ── 5. Multi-dimensional Hills: Mid Glacier Terrace (Northwest Heights, y = 0.65) ── */}
      {/* Positioned cleanly at [-14.0, 0.48, 17.5], completely isolated from the castle! */}
      <mesh receiveShadow position={[-14.0, 0.48, 17.5]}>
        <cylinderGeometry args={[8.5, 10.5, 0.48, 24]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
      </mesh>

      {/* ── 6. Multi-dimensional Hills: High Glacier Ridge & Peak (y = 1.45m to 2.4m) ── */}
      <group position={[-15.5, 1.15, 18.5]}>
        {/* Summit Ridge */}
        <mesh receiveShadow castShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[5.2, 6.8, 1.1, 20]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.75} />
        </mesh>

        {/* Stepped Ice Stairs to Climb Summit Lookout */}
        {[
          { pos: [5.2, -0.25, 0], size: [1.8, 0.32, 2.0] },
          { pos: [3.8, 0.05, 0], size: [1.8, 0.32, 1.9] },
          { pos: [2.4, 0.35, 0], size: [1.8, 0.32, 1.8] },
          { pos: [1.0, 0.65, 0], size: [1.8, 0.32, 1.7] },
        ].map((st, i) => (
          <mesh key={i} receiveShadow position={st.pos as [number, number, number]}>
            <boxGeometry args={st.size as [number, number, number]} />
            <meshStandardMaterial color="#bae6fd" roughness={0.25} />
          </mesh>
        ))}

        {/* Fast Ice Slide / Chute down to Lower Field (বরফের দ্রুত স্লিপ) */}
        <group position={[-4.5, -0.15, 1.5]} rotation={[-0.32, -0.5, -0.2]}>
          <mesh receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[2.0, 0.15, 5.5]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.08} metalness={0.2} transparent opacity={0.88} />
          </mesh>
          {/* Side rails */}
          {[-1.0, 1.0].map((rx, idx) => (
            <mesh key={idx} position={[rx, 0.15, 0]}>
              <boxGeometry args={[0.15, 0.25, 5.5]} />
              <meshStandardMaterial color="#bae6fd" roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Apex Pinnacle Spire with Sacred Ice Star Trophy (y = 2.4m) */}
        <group position={[0, 1.35, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.9, 1.2, 0.5, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation={[0.2, 0.4, 0]}>
            <octahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial
              color="#facc15"
              emissive="#eab308"
              emissiveIntensity={0.95}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* ── 7. Massive Glacial Waterfall & Secret Walk-In Grotto (Zone A) ── */}
      <MassiveGlacialWaterfall />

      {/* ── 8. Giant Woolly Mammoth Skeleton & Ribcage Tunnel (Zone B) ── */}
      <GiantWoollyMammothTunnel position={[13.5, 0.12, -6.5]} />

      {/* ── 9. Deep Glacial Crevasse, Secret Escape Underpass & Ice Bridge (Zone C) ── */}
      <GlacialCrevasseAndBridge position={[-15.0, 0, -5.0]} />

      {/* ── 10. Multi-Chamber Frozen Sabertooth Cavern (Zone D) ── */}
      <SabertoothIceCavern position={[16.5, 0.12, 13.5]} />

      {/* ── 11. Camouflaged Snowmen Decoy Grove (Zone E) ── */}
      <CamouflageSnowmenGrove position={[-11.5, 0.12, -18.5]} />

      {/* ── 12. Floating Lagoon Ice Floes Stepping Stones (Zone F) ── */}
      <FloatingLagoonIceFloes />

      {/* ── 13. Heavy Frosted Alpine Fir Forest (Zone G) ── */}
      <FrostedPineTree position={[-18.5, 0.15, 8.5]} scale={1.25} />
      <FrostedPineTree position={[-20.0, 0.15, -12.5]} scale={1.1} />
      <FrostedPineTree position={[-8.5, 0.15, 20.5]} scale={1.3} />
      <FrostedPineTree position={[4.5, 0.15, 21.5]} scale={1.15} />
      <FrostedPineTree position={[22.5, 0.15, 2.5]} scale={1.2} />
      <FrostedPineTree position={[8.5, 0.15, -19.5]} scale={1.05} />
      <FrostedPineTree position={[-2.5, 0.65, -14.5]} scale={1.15} />

      {/* ── 14. Glowing Cyan Ice Crystal Clusters ── */}
      <IceCrystalCluster position={[-17.5, 0.15, 2.5]} scale={1.35} />
      <IceCrystalCluster position={[6.5, 0.15, -13.5]} scale={1.2} />
      <IceCrystalCluster position={[21.0, 0.15, 9.5]} scale={1.25} />
      <IceCrystalCluster position={[-6.5, 0.65, 19.5]} scale={1.1} />

      {/* ── 15. Frosted Arrival Pier & Deep Ocean Dolphin Dock ── */}
      {/* Seamless walkway reaching from Island Shoreline out to Deep Dock at [73.5, 54.5] */}
      <group position={[-11.5, 0, -10.5]} rotation={[0, 0.65, 0]}>
        {/* Main Timber Planks */}
        <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[2.8, 0.22, 5.5]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Snow Dusting Layer */}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[2.5, 0.04, 5.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>

        {/* Heavy Timber Pilings */}
        {[-1.2, 1.2].map((px, i) => (
          <mesh key={i} position={[px, -0.45, 2.3]}>
            <cylinderGeometry args={[0.12, 0.14, 1.6, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        ))}

        {/* Ice Lantern Bollard */}
        <mesh position={[1.25, 0.45, 2.3]}>
          <cylinderGeometry args={[0.08, 0.09, 0.6, 8]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <mesh position={[1.25, 0.78, 2.3]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.95} />
        </mesh>
      </group>

      {/* ── 16. The Grand Frost Citadel Castle & Walk-In Woody Interior (Zone H) ── */}
      <FrostCitadelCastle position={[-1.0, 0, 3.5]} />

      {/* ── 17. Ice Age Animated Wildlife Kingdom (Penguins, Scrat, Manny, Diego, Sid) ── */}
      <IceAgeAnimals />

      {/* ── 18. Island-Wide Drifting Snowflakes Weather Particles (60 FPS Single Draw Call) ── */}
      <IceAgeSnowfall count={110} center={[0, 0, 0]} radius={32} />
    </group>
  );
}
