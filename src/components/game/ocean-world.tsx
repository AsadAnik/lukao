import React, { useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── 1. Animated Expansive Ocean (উত্তাল নীল সমুদ্র) ──
function OceanWater() {
  const meshRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);
  const foamOuterRef = useRef<THREE.Mesh>(null);
  const lagoonRef = useRef<THREE.Mesh>(null);
  const ripplesRef = useRef<THREE.Group>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const isWeb = Platform.OS === 'web';
  const frameCount = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    frameCount.current++;

    // 1. Ocean Wave Swell:
    // On native mobile (Hermes), animate rotation/position to eliminate CPU vertex recalculations & buffer uploads.
    // On web, run throttled vertex displacement every 2nd frame for maximum framerate.
    if (isWeb && geomRef.current && frameCount.current % 2 === 0) {
      const posAttr = geomRef.current.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getY(i);
        const w1 = Math.sin(u * 0.05 + t * 1.6) * Math.cos(v * 0.05 + t * 1.3) * 0.16;
        const w2 = Math.sin((u + v) * 0.09 + t * 2.2) * 0.07;
        posAttr.setZ(i, w1 + w2);
      }
      posAttr.needsUpdate = true;
      geomRef.current.computeVertexNormals();
    }

    // 2. Oceanic swell vertical and angular motion
    if (meshRef.current) {
      meshRef.current.position.y = -0.52 + Math.sin(t * 1.1) * 0.035;
      meshRef.current.rotation.z = Math.sin(t * 0.8) * 0.005;
    }

    // 3. Shallow coastal lagoon shimmer
    if (lagoonRef.current) {
      lagoonRef.current.position.y = -0.45 + Math.sin(t * 1.3) * 0.02;
    }

    // 4. Shoreline Surf Foam Waves (Surge & Ebb Cycle)
    if (foamRef.current) {
      // Periodic tidal surf surge: quick rush in, slow recession
      const waveCycle = (Math.sin(t * 1.8) + 1) * 0.5; // 0 to 1
      const foamScale = 0.99 + waveCycle * 0.035;
      foamRef.current.scale.set(foamScale, 1, foamScale);
      (foamRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 + waveCycle * 0.4;
    }

    if (foamOuterRef.current) {
      const outerCycle = (Math.cos(t * 1.5) + 1) * 0.5;
      const outerScale = 1.0 + outerCycle * 0.04;
      foamOuterRef.current.scale.set(outerScale, 1, outerScale);
      (foamOuterRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + outerCycle * 0.45;
    }

    // 5. Stylized Madbox-style animated surf ripples floating near coastlines
    if (ripplesRef.current) {
      ripplesRef.current.position.y = Math.sin(t * 1.6) * 0.025;
    }
  });

  // Stylized wave wake stroke coordinates around the island
  const surfRipples = useMemo(() => {
    return [
      { pos: [18, -0.44, 31], rot: 0.6, scale: 1.2 },
      { pos: [-16, -0.44, 32], rot: -0.5, scale: 1.3 },
      { pos: [32, -0.44, 12], rot: 1.3, scale: 1.0 },
      { pos: [-33, -0.44, 10], rot: -1.2, scale: 1.1 },
      { pos: [28, -0.44, -18], rot: 2.2, scale: 1.2 },
      { pos: [-27, -0.44, -20], rot: -2.1, scale: 1.4 },
      { pos: [4, -0.44, 36], rot: 0.1, scale: 1.1 },
      { pos: [-6, -0.44, 35], rot: -0.15, scale: 1.2 },
      { pos: [12, -0.44, -32], rot: 3.1, scale: 1.0 },
      { pos: [-14, -0.44, -30], rot: -3.0, scale: 1.1 },
    ];
  }, []);

  return (
    <group>
      {/* Expansive Animated Deep Sea Surface with Dynamic Wave Displacement */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.52, 0]}
        receiveShadow
      >
        <planeGeometry ref={geomRef} args={[1200, 1200, 24, 24]} />
        <meshStandardMaterial
          color="#00a8e8"
          roughness={0.12}
          metalness={0.15}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Shallow Coastal Lagoon Water (হালকা নীল উপকূলীয় জল) */}
      <mesh
        ref={lagoonRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.45, 0]}
        receiveShadow
      >
        <ringGeometry args={[31.8, 58, 64]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Primary Shoreline Seafoam Ring (সৈকতের সাদা ঢেউ ও ফেনা) */}
      <mesh
        ref={foamRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.38, 0]}
      >
        <ringGeometry args={[32.5, 34.6, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary Outer Foam Ripple (বাইরের হালকা ফেনা বলয়) */}
      <mesh
        ref={foamOuterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.40, 0]}
      >
        <ringGeometry args={[35.0, 37.2, 64]} />
        <meshBasicMaterial
          color="#e0f2fe"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stylized Floating Surf Ripple Strokes (Madbox-style coastal wakes) */}
      <group ref={ripplesRef}>
        {surfRipples.map((ripple, idx) => (
          <mesh
            key={idx}
            position={ripple.pos as [number, number, number]}
            rotation={[-Math.PI / 2, 0, ripple.rot]}
            scale={[ripple.scale, ripple.scale, 1]}
          >
            <ringGeometry args={[1.2, 1.5, 16, 1, 0, Math.PI * 0.7]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 2. Stepped Island Terraces & Golden Sand Beach (দ্বীপের ধাপে ধাপে বালুকাবেলা) ──
function IslandTerraces() {
  return (
    <group>
      {/* Level 1: Submerged Reef Base (সমুদ্রের নিচের প্রবাল স্তর) */}
      <mesh receiveShadow position={[0, -0.62, 0]}>
        <cylinderGeometry args={[36.0, 37.6, 0.26, 64]} />
        <meshStandardMaterial color="#0891b2" roughness={0.8} />
      </mesh>

      {/* Level 2: Wet Shoreline Sand Shelf (ভেজা বালুর সৈকত স্তর) */}
      <mesh receiveShadow position={[0, -0.46, 0]}>
        <cylinderGeometry args={[34.6, 36.2, 0.22, 64]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>

      {/* Level 3: Golden Sand Beach Shelf (সোনালী বালুকাময় সমুদ্র সৈকত) */}
      <mesh receiveShadow position={[0, -0.32, 0]}>
        <cylinderGeometry args={[33.3, 34.8, 0.24, 64]} />
        <meshStandardMaterial color="#fde047" roughness={0.9} />
      </mesh>

      {/* Level 4: Sandstone Cliff Contour Step (পাথুরে স্তর - strictly below grass plateau) */}
      <mesh receiveShadow position={[0, -0.16, 0]}>
        <cylinderGeometry args={[32.2, 33.4, 0.22, 64]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.85} />
      </mesh>

      {/* Decorative Beach Boulders & Coral Rocks (সৈকতের বড় পাথর) */}
      {[
        [24, -0.3, 23],
        [-26, -0.35, 21],
        [-22, -0.32, -24],
        [27, -0.35, -19],
        [-31, -0.38, 5],
        [32, -0.36, 7],
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh castShadow receiveShadow position={[0, 0.35, 0]} rotation={[0.2, idx * 0.7, 0.1]}>
            <dodecahedronGeometry args={[0.85 + (idx % 3) * 0.35, 1]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0.7, 0.2, 0.4]} rotation={[0.4, idx, 0]}>
            <dodecahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Shoreline Coconut Palms by the Beach (সৈকতের নারিকেল গাছ) */}
      {[
        [21, 0, 24, 0.3],
        [-23, 0, 22, -0.4],
        [-25, 0, -19, 0.5],
        [25, 0, -18, -0.3],
      ].map(([px, py, pz, rotZ], idx) => (
        <BeachPalm key={idx} position={[px, py, pz]} leanAngle={rotZ} />
      ))}
    </group>
  );
}

// Low-Poly Leaning Shoreline Palm Tree
function BeachPalm({
  position,
  leanAngle = 0.2,
}: {
  position: [number, number, number];
  leanAngle?: number;
}) {
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI, leanAngle]}>
      {/* Curved Palm Trunk */}
      <mesh castShadow position={[0, 2.5, 0]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 5.2, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      {/* Trunk segment rings */}
      {[1.0, 2.0, 3.0, 4.0].map((h, i) => (
        <mesh key={i} position={[0, h, 0]}>
          <torusGeometry args={[0.24 - i * 0.015, 0.03, 6, 12]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      ))}
      {/* Palm Canopy Crown */}
      <group position={[0, 5.0, 0.6]}>
        {Array.from({ length: 8 }).map((_, fIdx) => {
          const frondAngle = (fIdx / 8) * Math.PI * 2;
          return (
            <mesh
              key={fIdx}
              position={[Math.cos(frondAngle) * 1.5, -0.35, Math.sin(frondAngle) * 1.5]}
              rotation={[0.42, frondAngle, 0]}
              castShadow
            >
              <coneGeometry args={[0.75, 2.9, 5]} />
              <meshStandardMaterial
                color={fIdx % 2 === 0 ? '#15803d' : '#22c55e'}
                roughness={0.65}
              />
            </mesh>
          );
        })}
        {/* Coconuts Cluster */}
        {[-0.2, 0.2, 0].map((cx, cIdx) => (
          <mesh
            key={cIdx}
            position={[cx, -0.22, cIdx === 2 ? 0.22 : 0.08]}
            castShadow
          >
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color={cIdx === 1 ? '#84cc16' : '#713f12'}
              roughness={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 3. Beach Pier & Moored Wooden Boat (ঘাট ও কাঠের নৌকা) ──
function BeachDockAndBoat() {
  const boatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Authentic marine buoyancy: gentle rocking and vertical water bobbing
    if (boatRef.current) {
      boatRef.current.position.y = -0.44 + Math.sin(t * 1.6) * 0.04;
      boatRef.current.rotation.z = Math.sin(t * 1.4) * 0.03;
      boatRef.current.rotation.x = Math.cos(t * 1.8) * 0.02;
    }
  });

  return (
    <group position={[0, 0, 30.5]}>
      {/* ── Extended Wooden Pier / Jetty reaching out into deep ocean water ── */}
      {/* Main Walkway Platform: extends from sand path (z = -0.5) to deep sea (z = 7.5) */}
      <mesh castShadow receiveShadow position={[0, 0.12, 3.5]}>
        <boxGeometry args={[2.8, 0.22, 8.2]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      {/* Pier Timber Planks along the entire walkway */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const pz = -0.4 + idx * 0.70;
        return (
          <mesh key={idx} receiveShadow position={[0, 0.24, pz]}>
            <boxGeometry args={[2.9, 0.04, 0.38]} />
            <meshStandardMaterial color="#b45309" roughness={0.75} />
          </mesh>
        );
      })}

      {/* Support Timber Piles extending deep into the water and seabed */}
      {[
        [-1.2, 0.2],
        [1.2, 0.2],
        [-1.2, 2.5],
        [1.2, 2.5],
        [-1.2, 4.8],
        [1.2, 4.8],
        [-1.2, 7.0],
        [1.2, 7.0],
      ].map(([px, pz], pIdx) => (
        <mesh key={pIdx} castShadow position={[px, -0.65, pz]}>
          <cylinderGeometry args={[0.11, 0.13, 2.2, 8]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      ))}

      {/* Mooring Bollard Posts (ঘাট বাঁধার খুঁটি) at the deep end */}
      <mesh castShadow position={[-1.25, 0.45, 7.0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[1.25, 0.45, 7.0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Mooring Hemp Rope to boat on left */}
      <mesh position={[-1.6, 0.08, 6.2]} rotation={[0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* ── Moored Wooden Boat on left side of the pier tip in deep water ── */}
      <group ref={boatRef} position={[-2.2, -0.44, 6.0]} rotation={[0, -0.15, 0]}>
        {/* Boat Hull Main Keel */}
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[1.5, 0.55, 3.6]} />
          <meshStandardMaterial color="#b45309" roughness={0.75} />
        </mesh>

        {/* Hollow Interior Floor */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[1.25, 0.35, 3.3]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>

        {/* Pointed Bow / Front Stem */}
        <mesh castShadow position={[0, 0.26, 2.1]} rotation={[0.45, 0, 0]}>
          <coneGeometry args={[0.75, 1.2, 4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>

        {/* Stern / Transom */}
        <mesh castShadow position={[0, 0.26, -2.0]} rotation={[-0.45, 0, 0]}>
          <coneGeometry args={[0.75, 1.0, 4]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} />
        </mesh>

        {/* Wooden Bench Seats */}
        {[-0.8, 0, 0.8].map((bz, bIdx) => (
          <mesh key={bIdx} castShadow position={[0, 0.38, bz]}>
            <boxGeometry args={[1.35, 0.08, 0.4]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
        ))}

        {/* Wooden Oars */}
        <mesh position={[-0.55, 0.5, 0.2]} rotation={[0.3, 0.2, 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.8} />
        </mesh>
        <mesh position={[0.55, 0.5, 0.2]} rotation={[0.3, -0.2, -0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.8} />
        </mesh>

        {/* Brass Lantern on Bow */}
        <mesh position={[0, 0.7, 1.8]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.22, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.7, 1.8]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Floating Lifebuoy Ring in deep water */}
      <FloatingLifebuoy position={[-3.2, -0.44, 4.5]} />
    </group>
  );
}

// ── Floating Lifebuoy / Donut Ring (ভাসমান লাইফ রিং) ──
function FloatingLifebuoy({ position }: { position: [number, number, number] }) {
  const buoyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (buoyRef.current) {
      buoyRef.current.position.y = position[1] + Math.sin(t * 2.2) * 0.04;
      buoyRef.current.rotation.z = Math.sin(t * 1.5) * 0.08;
      buoyRef.current.rotation.x = Math.cos(t * 1.8) * 0.06;
      buoyRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={buoyRef} position={position}>
      {/* Main Yellow Donut Ring */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[0.55, 0.18, 16, 24]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>
      {/* Red Safety Stripes */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.55, 0, Math.sin(angle) * 0.55]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[0.08, 0.38, 0.38]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ── Stylized Hot Air Balloon (Madbox-style ভাসমান বেলুন) ──
function MadboxHotAirBalloon() {
  const balloonRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (balloonRef.current) {
      // Gentle atmospheric vertical bobbing & sway
      balloonRef.current.position.y = 22 + Math.sin(t * 0.8) * 0.6;
      balloonRef.current.rotation.y = Math.sin(t * 0.3) * 0.12;
      balloonRef.current.rotation.z = Math.sin(t * 0.6) * 0.03;
    }
  });

  return (
    <group ref={balloonRef} position={[-28, 22, 45]} scale={1.2}>
      {/* Teardrop Balloon Envelope */}
      <group position={[0, 4.2, 0]}>
        {/* Main upper sphere */}
        <mesh castShadow>
          <sphereGeometry args={[3.2, 24, 24]} />
          <meshStandardMaterial color="#ec4899" roughness={0.4} />
        </mesh>
        {/* Striped vertical segments (Pink & Yellow Madbox aesthetic) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rotY = (i / 8) * Math.PI * 2;
          if (i % 2 === 0) return null;
          return (
            <mesh key={i} rotation={[0, rotY, 0]}>
              <sphereGeometry args={[3.22, 16, 16, 0, Math.PI / 4]} />
              <meshStandardMaterial color="#facc15" roughness={0.4} />
            </mesh>
          );
        })}
        {/* Lower tapered cone neck */}
        <mesh position={[0, -2.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.2, 2.6, 24]} />
          <meshStandardMaterial color="#ec4899" roughness={0.4} />
        </mesh>
      </group>

      {/* Ropes / Suspension Cables */}
      {[-0.65, 0.65].map((rx, xi) =>
        [-0.65, 0.65].map((rz, zi) => (
          <mesh key={`${xi}-${zi}`} position={[rx, 1.2, rz]}>
            <cylinderGeometry args={[0.02, 0.02, 2.2, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Wicker Passenger Basket */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 0.9, 1.3]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>
      {/* Basket white trim */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.4, 0.1, 1.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 4. Distant Archipelago Islands (দূরের দ্বীপপুঞ্জ - Madbox রেফারেন্স অনুযায়ী) ──
function DistantArchipelago() {
  return (
    <group>
      {/* Distant Island 2: North Highland Ridge (উত্তরের উঁচু দ্বীপ) */}
      <group position={[-80, -0.6, -95]}>
        <mesh receiveShadow position={[0, 0.8, 0]}>
          <cylinderGeometry args={[18, 24, 2.4, 24]} />
          <meshStandardMaterial color="#fde047" roughness={0.9} />
        </mesh>
        <mesh receiveShadow position={[0, 2.4, 0]}>
          <coneGeometry args={[15, 3.2, 16]} />
          <meshStandardMaterial color="#4ade80" roughness={0.8} />
        </mesh>
        {/* Distant Palm */}
        <BeachPalm position={[2, 4.0, 1]} leanAngle={0.25} />
      </group>

      {/* Distant Island 3: South Lagoon Atoll (দক্ষিণের শান্ত দ্বীপ) */}
      <group position={[-75, -0.6, 80]}>
        <mesh receiveShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[14, 18, 1.6, 20]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.9} />
        </mesh>
        <mesh receiveShadow position={[0, 1.4, 0]}>
          <cylinderGeometry args={[9, 12, 1.0, 20]} />
          <meshStandardMaterial color="#38a169" roughness={0.8} />
        </mesh>
        <BeachPalm position={[0, 1.9, 0]} leanAngle={0.2} />
      </group>
    </group>
  );
}

// ── 5. Stylized Low-Poly Cartoon Clouds (ভাসমান শুভ্র মেঘমালা) ──
function SkyClouds() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Gentle celestial orbit of clouds across the tropical sky
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.008;
    }
  });

  const cloudClusters = useMemo(() => {
    return [
      { pos: [55, 32, -45], scale: 1.4 },
      { pos: [-65, 36, -60], scale: 1.6 },
      { pos: [70, 30, 50], scale: 1.2 },
      { pos: [-50, 34, 65], scale: 1.5 },
      { pos: [0, 38, -85], scale: 1.8 },
      { pos: [0, 35, 90], scale: 1.3 },
    ];
  }, []);

  return (
    <group ref={cloudsRef}>
      {cloudClusters.map((cloud, idx) => (
        <group
          key={idx}
          position={cloud.pos as [number, number, number]}
          scale={cloud.scale}
        >
          {/* Main cloud puffy sphere cluster */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[4.2, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[3.2, -0.6, 0.5]}>
            <sphereGeometry args={[3.2, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[-3.0, -0.5, -0.4]}>
            <sphereGeometry args={[3.0, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[1.4, 1.4, 0.2]}>
            <sphereGeometry args={[2.8, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[-1.2, 1.2, -0.3]}>
            <sphereGeometry args={[2.5, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Master Export: The Complete Ocean World Environment ──
export function OceanWorld() {
  return (
    <group>
      {/* 1. Infinite Animated Ocean with Coastal Foam */}
      <OceanWater />

      {/* 2. Stepped Terraces & Sand Beach perimeter */}
      <IslandTerraces />

      {/* 3. Beach Dock & Moored Wooden Boat */}
      <BeachDockAndBoat />

      {/* 4. Distant Neighboring Archipelago */}
      <DistantArchipelago />

      {/* 5. Drifting Low-Poly Cartoon Clouds */}
      <SkyClouds />

      {/* 6. Stylized Madbox Hot Air Balloon */}
      <MadboxHotAirBalloon />
    </group>
  );
}
