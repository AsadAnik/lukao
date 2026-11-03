import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dolphinRide, playerTransform } from './game-engine-state';
import { lukaoStore } from './game-state';
import { IceAgeIsland } from './ice-age-island';

// ── 1. Smooth Organic Dolphin Geometries (প্রাকৃতিক মসৃণ জৈবিক ডলফিন অ্যানাটমি) ──
function useOrganicDolphinGeometries() {
  return useMemo(() => {
    // 1. Thorax & Head Lathe Profile (Revolves around axis; will lie along +Z forward)
    // Points in (r, y) where +y is forward along beak/melon, -y is towards lumbar collar
    const thoraxPoints = [
      new THREE.Vector2(0.001, 1.45),  // Rostrum beak apex tip
      new THREE.Vector2(0.052, 1.34),  // Rostrum mid taper
      new THREE.Vector2(0.105, 1.18),  // Rostrum base / mouth junction
      new THREE.Vector2(0.22, 1.02),   // Anterior melon slope
      new THREE.Vector2(0.35, 0.78),   // Acoustic melon forehead crest (কপাল)
      new THREE.Vector2(0.41, 0.52),   // Blowhole crown & neck depression
      new THREE.Vector2(0.44, 0.22),   // Thoracic widest girth (বুকের সর্বোচ্চ পরিধি)
      new THREE.Vector2(0.42, -0.10),  // Mid-flank torso
      new THREE.Vector2(0.37, -0.36),  // Posterior lumbar joint collar
      new THREE.Vector2(0.001, -0.38), // Inner socket receiver
    ];
    const thoraxGeom = new THREE.LatheGeometry(thoraxPoints, 32);
    thoraxGeom.computeVertexNormals();

    // 2. Articulated Lumbar Spine Lathe Profile
    const lumbarPoints = [
      new THREE.Vector2(0.001, 0.06),  // Spherical ball joint apex
      new THREE.Vector2(0.31, 0.03),   // Seamless ball cap dome
      new THREE.Vector2(0.37, 0.0),    // Tangent with thorax collar
      new THREE.Vector2(0.33, -0.22),  // Tapering muscular flank
      new THREE.Vector2(0.24, -0.44),  // Caudal joint socket collar
      new THREE.Vector2(0.001, -0.46), // Inner socket cap
    ];
    const lumbarGeom = new THREE.LatheGeometry(lumbarPoints, 28);
    lumbarGeom.computeVertexNormals();

    // 3. Caudal Peduncle Lathe Profile (Tail Shank)
    const pedunclePoints = [
      new THREE.Vector2(0.001, 0.05),  // Inner ball cap
      new THREE.Vector2(0.24, 0.0),    // Tangent with lumbar
      new THREE.Vector2(0.16, -0.20),  // Mid peduncle
      new THREE.Vector2(0.095, -0.38), // Narrow tail shank
      new THREE.Vector2(0.05, -0.48),  // Fluke insertion keel (লেজের গোড়া)
      new THREE.Vector2(0.001, -0.50), // Tip insertion
    ];
    const peduncleGeom = new THREE.LatheGeometry(pedunclePoints, 24);
    peduncleGeom.computeVertexNormals();

    // 4. Falcate Dorsal Fin with Natural Concave Notch (বাঁকানো খাঁজযুক্ত পিঠের ডানা)
    const dorsalShape = new THREE.Shape();
    dorsalShape.moveTo(0, 0);
    dorsalShape.quadraticCurveTo(0.12, 0.35, 0.04, 0.72); // Swept leading edge
    dorsalShape.quadraticCurveTo(-0.06, 0.38, -0.32, 0.02); // Swept concave trailing notch
    dorsalShape.quadraticCurveTo(-0.16, -0.04, 0, 0);       // Smooth base fillet
    dorsalShape.closePath();

    const dorsalGeom = new THREE.ExtrudeGeometry(dorsalShape, {
      depth: 0.042,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.02,
      bevelThickness: 0.014,
    });
    dorsalGeom.center();
    dorsalGeom.computeVertexNormals();

    // 5. Hydrofoil Curved Pectoral Flipper (হাইড্রোফয়েল পেক্টোরাল ফ্লিপার - sleek backward sweep)
    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.quadraticCurveTo(0.18, -0.15, 0.28, -0.58); // Swept backwards along flank
    flipperShape.quadraticCurveTo(0.14, -0.48, 0.02, -0.18); // Tapered trailing edge back to body
    flipperShape.closePath();

    const flipperGeom = new THREE.ExtrudeGeometry(flipperShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.015,
      bevelThickness: 0.012,
    });
    flipperGeom.computeVertexNormals();

    // 6. Horizontal Caudal Tail Flukes with Central Median Notch (প্রাকৃতিক অনুভূমিক লেজের ডানা)
    const flukeShape = new THREE.Shape();
    flukeShape.moveTo(0, 0); // Median notch center (মাঝের খাঁজ)
    flukeShape.quadraticCurveTo(-0.24, 0.05, -0.48, -0.04); // Left fluke tip
    flukeShape.quadraticCurveTo(-0.36, -0.16, -0.04, -0.11); // Left trailing edge
    flukeShape.lineTo(0, -0.05); // Distinct median notch dip
    flukeShape.lineTo(0.04, -0.11); // Right trailing edge start
    flukeShape.quadraticCurveTo(0.36, -0.16, 0.48, -0.04); // Right fluke tip
    flukeShape.quadraticCurveTo(0.24, 0.05, 0, 0); // Right leading edge back to notch
    flukeShape.closePath();

    const flukeGeom = new THREE.ExtrudeGeometry(flukeShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.012,
      bevelThickness: 0.008,
    });
    flukeGeom.center();
    flukeGeom.computeVertexNormals();

    // 7. Flush Ventral Underbelly Countershading Geometries (মসৃণ সাদা কাউন্টারশেডিং)
    // Seamless thoracic belly shell
    const bellyThoraxGeom = new THREE.CapsuleGeometry(0.28, 0.82, 12, 20);
    bellyThoraxGeom.computeVertexNormals();

    // Seamless lumbar belly shell
    const bellyLumbarGeom = new THREE.CapsuleGeometry(0.21, 0.42, 10, 16);
    bellyLumbarGeom.computeVertexNormals();

    // Rostrum lower mandible chin
    const lowerJawGeom = new THREE.ConeGeometry(0.082, 0.36, 16);
    lowerJawGeom.computeVertexNormals();

    return {
      thoraxGeom,
      lumbarGeom,
      peduncleGeom,
      dorsalGeom,
      flipperGeom,
      flukeGeom,
      bellyThoraxGeom,
      bellyLumbarGeom,
      lowerJawGeom,
    };
  }, []);
}

// ── 2. Realistic Organic Dolphin Model Component (প্রাকৃতিক জৈবিক ডলফিন) ──
export function RealisticDolphinMesh({
  swimSpeed = 3.5,
  waveIntensity = 0.5,
  phaseOffset = 0,
  isRiding = false,
}: {
  swimSpeed?: number;
  waveIntensity?: number;
  phaseOffset?: number;
  isRiding?: boolean;
}) {
  const geoms = useOrganicDolphinGeometries();

  // Three.js direct Object3D refs for 60/120 FPS seamless spinal wave
  const headRef = useRef<THREE.Group>(null);
  const lumbarRef = useRef<THREE.Group>(null);
  const peduncleRef = useRef<THREE.Group>(null);
  const flukeRef = useRef<THREE.Group>(null);
  const leftFlipperRef = useRef<THREE.Group>(null);
  const rightFlipperRef = useRef<THREE.Group>(null);

  // Oceanic Cetacean Color Palette & Wet Skin Shading
  const DORSAL_COLOR = '#1e3a5f';    // Deep Oceanic Sapphire Slate Navy (পিঠের মসৃণ গাঢ় নীল)
  const FLANK_COLOR = '#2563eb';     // Vibrant Oceanic Royal Azure (পাশের প্রাণবন্ত নীল)
  const VENTRAL_COLOR = '#ffffff';   // Pure Pearlescent White Underbelly (বুকের উজ্জ্বল সাদা)
  const WET_ROUGHNESS = 0.20;        // Wet marine skin glistening reflection
  const WET_METALNESS = 0.10;

  useFrame((state) => {
    const t = state.clock.elapsedTime + phaseOffset;

    if (isRiding) {
      // High-energy swimming wave during ocean leaps
      const freq = 11.5;
      if (lumbarRef.current) lumbarRef.current.rotation.x = Math.sin(t * freq) * 0.14;
      if (peduncleRef.current) peduncleRef.current.rotation.x = Math.sin(t * freq - 0.70) * 0.28;
      if (flukeRef.current) flukeRef.current.rotation.x = Math.sin(t * freq - 1.40) * 0.48;
      if (leftFlipperRef.current) leftFlipperRef.current.rotation.z = 0.45 + Math.cos(t * freq) * 0.12;
      if (rightFlipperRef.current) rightFlipperRef.current.rotation.z = -0.45 - Math.cos(t * freq) * 0.12;
      if (headRef.current) headRef.current.rotation.x = -Math.sin(t * freq) * 0.04;
    } else {
      // Natural living cetacean idle at dock:
      // Gentle buoyant breathing, subtle head greeting lift, and soft tail drift in current
      const breathCycle = Math.sin(t * 1.6);
      const currentDrift = Math.sin(t * 0.9);

      if (headRef.current) {
        headRef.current.rotation.x = 0.06 + breathCycle * 0.02;
        headRef.current.rotation.y = Math.sin(t * 0.7) * 0.05;
      }
      if (lumbarRef.current) {
        lumbarRef.current.rotation.x = -0.03 + breathCycle * 0.04;
        lumbarRef.current.rotation.y = currentDrift * 0.06;
      }
      if (peduncleRef.current) {
        peduncleRef.current.rotation.x = -0.04 + Math.sin(t * 1.6 - 0.5) * 0.06;
        peduncleRef.current.rotation.y = Math.sin(t * 0.9 - 0.5) * 0.08;
      }
      if (flukeRef.current) {
        flukeRef.current.rotation.x = Math.sin(t * 1.6 - 1.0) * 0.08;
        flukeRef.current.rotation.y = Math.sin(t * 0.9 - 1.0) * 0.10;
      }
      if (leftFlipperRef.current) {
        leftFlipperRef.current.rotation.z = 0.38 + Math.cos(t * 1.4) * 0.04;
      }
      if (rightFlipperRef.current) {
        rightFlipperRef.current.rotation.z = -0.38 - Math.cos(t * 1.4) * 0.04;
      }
    }
  });

  return (
    <group ref={headRef}>
      {/* ── 1. Main Head & Thoracic Torso (মসৃণ মস্তক ও মূল দেহকাণ্ড) ── */}
      <group position={[0, 0, 0]}>
        {/* Dorsal Slate-Navy Lathe Body (Forward along +Z) */}
        <mesh
          castShadow
          receiveShadow
          geometry={geoms.thoraxGeom}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={DORSAL_COLOR}
            roughness={WET_ROUGHNESS}
            metalness={WET_METALNESS}
          />
        </mesh>

        {/* Ventral Pearlescent White Underbelly Plate (বুকের মসৃণ কাউন্টারশেডিং) */}
        <mesh
          position={[0, -0.14, 0.22]}
          rotation={[-0.08, 0, 0]}
          scale={[0.76, 0.48, 1.0]}
          geometry={geoms.bellyThoraxGeom}
        >
          <meshStandardMaterial
            color={VENTRAL_COLOR}
            roughness={0.25}
            metalness={0.02}
          />
        </mesh>

        {/* Rostrum Lower Mandible (নিচের চোয়াল ও প্রাকৃতিক মুখের স্মাইল খাঁজ) */}
        <group position={[0, -0.06, 1.18]} rotation={[1.48, 0, 0]}>
          <mesh geometry={geoms.lowerJawGeom}>
            <meshStandardMaterial
              color={VENTRAL_COLOR}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* Subtle Dark Rostrum Mouth Smile Crease ("Dolphin Smile" খাঁজকাটা মুখের রেখা) */}
        {[-0.08, 0.08].map((mx, idx) => (
          <mesh
            key={`mouth-${idx}`}
            position={[mx, -0.02, 1.12]}
            rotation={[0, idx === 0 ? 0.18 : -0.18, 0]}
          >
            <cylinderGeometry args={[0.007, 0.007, 0.22, 6]} />
            <meshBasicMaterial color="#080e18" />
          </mesh>
        ))}

        {/* Organic Falcate Dorsal Fin with Fleshy Spine Fillet (পিঠের মসৃণ বাঁকানো ডানা) */}
        <mesh
          castShadow
          geometry={geoms.dorsalGeom}
          position={[0, 0.42, 0.04]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <meshStandardMaterial
            color={DORSAL_COLOR}
            roughness={WET_ROUGHNESS}
            metalness={WET_METALNESS}
          />
        </mesh>

        {/* Hydrofoil Left Pectoral Flipper with Organic Shoulder Mound */}
        <group
          ref={leftFlipperRef}
          position={[-0.36, -0.16, 0.40]}
          rotation={[0.10, -0.18, 0.35]}
        >
          <mesh position={[0.04, 0.02, 0]} scale={[0.14, 0.10, 0.20]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color={FLANK_COLOR} roughness={WET_ROUGHNESS} />
          </mesh>
          <mesh
            castShadow
            geometry={geoms.flipperGeom}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={DORSAL_COLOR}
              roughness={WET_ROUGHNESS}
              metalness={WET_METALNESS}
            />
          </mesh>
        </group>

        {/* Hydrofoil Right Pectoral Flipper with Organic Shoulder Mound */}
        <group
          ref={rightFlipperRef}
          position={[0.36, -0.16, 0.40]}
          rotation={[0.10, 0.18, -0.35]}
        >
          <mesh position={[-0.04, 0.02, 0]} scale={[0.14, 0.10, 0.20]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color={FLANK_COLOR} roughness={WET_ROUGHNESS} />
          </mesh>
          <mesh
            castShadow
            scale={[-1, 1, 1]}
            geometry={geoms.flipperGeom}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={DORSAL_COLOR}
              roughness={WET_ROUGHNESS}
              metalness={WET_METALNESS}
            />
          </mesh>
        </group>

        {/* Crescent Blowhole Slit on Crown (মাথার শীর্ষের প্রাকৃতিক শ্বাসছিদ্র) */}
        <mesh position={[0, 0.43, 0.50]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.048, 0.012, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#080c14" roughness={0.3} />
        </mesh>

        {/* Natural Almond Eyes with Dark Orbital Blubber Patches (জীবন্ত প্রাকৃতিক চোখ) */}
        {[-0.26, 0.26].map((ex, i) => (
          <group key={`eye-${i}`} position={[ex, 0.10, 0.82]}>
            {/* Dark Orbital Blubber Skin Patch */}
            <mesh scale={[0.035, 0.065, 0.09]} rotation={[0, ex > 0 ? 0.2 : -0.2, 0]}>
              <sphereGeometry args={[1, 10, 10]} />
              <meshStandardMaterial color="#0f1926" roughness={0.35} />
            </mesh>
            {/* Deep Glassy Cornea */}
            <mesh position={[ex > 0 ? 0.014 : -0.014, 0, 0.01]}>
              <sphereGeometry args={[0.030, 12, 12]} />
              <meshStandardMaterial
                color="#060912"
                roughness={0.02}
                metalness={0.12}
              />
            </mesh>
            {/* Subtle Sunlight Specular Catchlight */}
            <mesh position={[ex > 0 ? 0.024 : -0.024, 0.012, 0.020]}>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* ── 2. Articulated Spinal Joint 1: Lumbar Section with Spherical Ball Socket ── */}
        <group ref={lumbarRef} position={[0, 0, -0.36]}>
          {/* Dorsal Lathe Body (Forward along +Z) */}
          <mesh
            castShadow
            receiveShadow
            geometry={geoms.lumbarGeom}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={DORSAL_COLOR}
              roughness={WET_ROUGHNESS}
              metalness={WET_METALNESS}
            />
          </mesh>

          {/* Articulated Ventral Countershading Belly Plate */}
          <mesh
            position={[0, -0.11, -0.20]}
            rotation={[-0.04, 0, 0]}
            scale={[0.70, 0.42, 1.0]}
            geometry={geoms.bellyLumbarGeom}
          >
            <meshStandardMaterial
              color={VENTRAL_COLOR}
              roughness={0.25}
              metalness={0.02}
            />
          </mesh>

          {/* ── 3. Articulated Spinal Joint 2: Caudal Peduncle (Laterally Compressed Tail) ── */}
          <group ref={peduncleRef} position={[0, 0, -0.44]}>
            {/* Laterally compressed peduncle: flattened horizontally, deeper vertically */}
            <mesh
              castShadow
              geometry={geoms.peduncleGeom}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.74, 1.28, 1.0]}
            >
              <meshStandardMaterial
                color={DORSAL_COLOR}
                roughness={WET_ROUGHNESS}
                metalness={WET_METALNESS}
              />
            </mesh>

            {/* Ventral Keel Pearl Tone */}
            <mesh position={[0, -0.06, -0.24]} scale={[0.05, 0.07, 0.46]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={VENTRAL_COLOR} roughness={0.3} />
            </mesh>

            {/* ── 4. Articulated Spinal Joint 3: Horizontal Caudal Flukes (লেজের জোড়া ডানা) ── */}
            <group ref={flukeRef} position={[0, 0, -0.48]}>
              <mesh
                castShadow
                geometry={geoms.flukeGeom}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial
                  color={DORSAL_COLOR}
                  roughness={WET_ROUGHNESS}
                  metalness={WET_METALNESS}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// ── 3. Interactive Rideable Dolphin Companion ("Tutu") ──
export function RideableDolphin() {
  const groupRef = useRef<THREE.Group>(null);

  // Pier positions & docking postures in deep ocean water beside the pier
  const HOME_DOCK = useMemo(() => new THREE.Vector3(1.9, -0.48, 36.0), []);
  const ATOLL_DOCK = useMemo(() => new THREE.Vector3(73.5, -0.48, 54.5), []);
  const MID_CURVE = useMemo(() => new THREE.Vector3(42, -0.48, 62), []);

  useFrame((_, delta) => {
    const safeDelta = Number.isFinite(delta) && delta > 0 ? delta : 0.016;
    const dt = Math.min(safeDelta, 0.08);
    const t = performance.now() * 0.001;

    const isRoute1Riding = dolphinRide.isRiding && (dolphinRide.activeRoute === 'route_1' || !dolphinRide.activeRoute);

    if (!isRoute1Riding) {
      // Idle Floating & Natural Surface Breathing at Pier in deep water
      const isHome = dolphinRide.currentLocation === 'home';
      const dockPos = isHome ? HOME_DOCK : ATOLL_DOCK;
      const targetRot = isHome ? 0.22 : -2.6;

      const breathY = Math.sin(t * 1.6) * 0.035;
      const breathRoll = Math.sin(t * 0.9) * 0.03;
      const swayX = Math.cos(t * 0.8) * 0.08;
      const swayZ = Math.sin(t * 0.8) * 0.08;

      if (groupRef.current) {
        groupRef.current.position.set(
          dockPos.x + swayX,
          dockPos.y + breathY,
          dockPos.z + swayZ
        );
        groupRef.current.rotation.set(
          0.04 + Math.sin(t * 1.2) * 0.02,
          targetRot + Math.sin(t * 0.6) * 0.04,
          breathRoll
        );
      }

      // Proximity check for interaction prompt & Level Gatekeeper (Temporarily unlocked for testing)
      const playerPos = playerTransform.position;
      const distToPlayer = Math.hypot(playerPos.x - dockPos.x, playerPos.z - dockPos.z);
      const isNear = distToPlayer < 4.8;
      const isAtollUnlocked = true; // All levels temporarily unlocked for testing

      if (isNear && !dolphinRide.isRiding) {
        dolphinRide.activeRoute = 'route_1';
        if (isHome) {
          dolphinRide.canRide = true;
          dolphinRide.promptText = '🐬 LEVEL 2 UNLOCKED! RIDE TO ICE AGE ISLAND (হিমেল দ্বীপে চলো!)';
        } else {
          // Returning home from atoll is always unlocked
          dolphinRide.canRide = true;
          dolphinRide.promptText = '🐬 RETURN TO MAIN ISLAND (মূল দ্বীপে চলো!)';
        }
      } else if (dolphinRide.activeRoute === 'route_1') {
        dolphinRide.canRide = false;
        dolphinRide.promptText = '';
      }
    } else {
      // Active Dolphin Ride: Ocean Crossing with Parabolic Leaps
      dolphinRide.canRide = false;
      dolphinRide.promptText = '🌊 LEAPING THROUGH THE SEA...';

      const TRIP_DURATION = 4.4;
      const currentProg = Number.isFinite(dolphinRide.rideProgress) ? dolphinRide.rideProgress : 0;
      dolphinRide.rideProgress = Math.min(1.0, Math.max(0, currentProg + dt / TRIP_DURATION));
      const p = dolphinRide.rideProgress;

      const start = dolphinRide.direction === 'to_atoll' ? HOME_DOCK : ATOLL_DOCK;
      const end = dolphinRide.direction === 'to_atoll' ? ATOLL_DOCK : HOME_DOCK;

      // Quadratic Bezier curve
      const invP = 1 - p;
      const bx = invP * invP * start.x + 2 * invP * p * MID_CURVE.x + p * p * end.x;
      const bz = invP * invP * start.z + 2 * invP * p * MID_CURVE.z + p * p * end.z;

      const dx = 2 * (1 - p) * (MID_CURVE.x - start.x) + 2 * p * (end.x - MID_CURVE.x);
      const dz = 2 * (1 - p) * (MID_CURVE.z - start.z) + 2 * p * (end.z - MID_CURVE.z);
      const rawHeading = Math.atan2(dx, dz);
      const heading = Number.isFinite(rawHeading) ? rawHeading : (dolphinRide.direction === 'to_atoll' ? 0.82 : -2.35);

      // 3 High-Energy Parabolic Leaps out of the ocean
      const leapPhase = p * Math.PI * 6;
      const rawLeap = Math.sin(leapPhase);
      const leapHeight = Math.max(-0.15, rawLeap) * 1.85;
      const by = -0.48 + leapHeight;

      const pitch = Math.cos(leapPhase) * 0.44;
      const bankRoll = Math.sin(p * Math.PI) * (dolphinRide.direction === 'to_atoll' ? 0.15 : -0.15);

      if (Number.isFinite(bx) && Number.isFinite(by) && Number.isFinite(bz)) {
        if (groupRef.current) {
          groupRef.current.position.set(bx, by, bz);
          groupRef.current.rotation.set(pitch, heading, bankRoll);
        }
        dolphinRide.dolphinPosition.set(bx, by, bz);
        dolphinRide.dolphinRotation = heading;
      }

      if (p >= 1.0) {
        dolphinRide.isRiding = false;
        dolphinRide.currentLocation = dolphinRide.direction === 'to_atoll' ? 'atoll' : 'home';
        dolphinRide.rideProgress = 0;
        dolphinRide.promptText = '';

        const dismountPos =
          dolphinRide.currentLocation === 'atoll'
            ? new THREE.Vector3(75, 0.25, 54.5)
            : new THREE.Vector3(0.5, 0.25, 35.5);
        playerTransform.position.copy(dismountPos);

        const newDock = dolphinRide.currentLocation === 'atoll' ? ATOLL_DOCK : HOME_DOCK;
        const newHeading = dolphinRide.currentLocation === 'atoll' ? -2.6 : 0.22;
        dolphinRide.dolphinPosition.copy(newDock);
        dolphinRide.dolphinRotation = newHeading;
        if (groupRef.current) {
          groupRef.current.position.copy(newDock);
          groupRef.current.rotation.set(0, newHeading, 0);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[1.9, -0.48, 36.0]}>
      {/* 3D Smooth Organic Dolphin Model with 60 FPS Direct Spinal Undulation */}
      <RealisticDolphinMesh
        swimSpeed={dolphinRide.isRiding ? 11.5 : 3.4}
        waveIntensity={dolphinRide.isRiding ? 1.0 : 0.40}
        isRiding={dolphinRide.isRiding}
      />
    </group>
  );
}

// ── 4. Interactive Route 2 Dolphin Companion ("Nilkanto" — Level 3 Desert <-> Level 4 Hill Tracts) ──
export function HillTractsDolphin() {
  const groupRef = useRef<THREE.Group>(null);

  const DESERT_DOCK = useMemo(() => new THREE.Vector3(-61.0, -0.48, 43.0), []);
  const HILL_DOCK = useMemo(() => new THREE.Vector3(-60.0, -0.48, -42.0), []);
  const MID_CURVE = useMemo(() => new THREE.Vector3(-74.0, -0.48, 0.5), []);

  useFrame((_, delta) => {
    const safeDelta = Number.isFinite(delta) && delta > 0 ? delta : 0.016;
    const dt = Math.min(safeDelta, 0.08);
    const t = performance.now() * 0.001;

    const isRoute2Riding = dolphinRide.isRiding && dolphinRide.activeRoute === 'route_2';

    if (!isRoute2Riding) {
      // Idle at Desert Pier or Hill Tracts Pier
      const isDesert = dolphinRide.currentLocation === 'desert' || dolphinRide.currentLocation === 'home' || dolphinRide.currentLocation === 'atoll';
      const dockPos = isDesert ? DESERT_DOCK : HILL_DOCK;
      const targetRot = isDesert ? -0.2 : 3.0;

      const breathY = Math.sin(t * 1.5) * 0.035;
      const breathRoll = Math.sin(t * 0.8) * 0.03;
      const swayX = Math.cos(t * 0.7) * 0.08;
      const swayZ = Math.sin(t * 0.7) * 0.08;

      if (groupRef.current) {
        groupRef.current.position.set(
          dockPos.x + swayX,
          dockPos.y + breathY,
          dockPos.z + swayZ
        );
        groupRef.current.rotation.set(
          0.04 + Math.sin(t * 1.1) * 0.02,
          targetRot + Math.sin(t * 0.5) * 0.04,
          breathRoll
        );
      }

      // Proximity check for interaction prompt & Level 4 Unlock Gatekeeper (Temporarily unlocked for testing)
      const playerPos = playerTransform.position;
      const distToPlayer = Math.hypot(playerPos.x - dockPos.x, playerPos.z - dockPos.z);
      const isNear = distToPlayer < 5.2;
      const isHillUnlocked = true; // All levels temporarily unlocked for testing

      if (isNear && !dolphinRide.isRiding) {
        dolphinRide.activeRoute = 'route_2';
        if (isDesert) {
          dolphinRide.canRide = true;
          dolphinRide.currentLocation = 'desert';
          dolphinRide.promptText = '🐬 LEVEL 4 UNLOCKED! RIDE TO MAYABI HILL TRACTS (পাহাড়ী দ্বীপে চলো!)';
        } else {
          // Returning to desert from hill tracts is always unlocked
          dolphinRide.canRide = true;
          dolphinRide.currentLocation = 'hill';
          dolphinRide.promptText = '🐬 RETURN TO DESERT WORLD (মরুভূমি দ্বীপে চলো!)';
        }
      } else if (dolphinRide.activeRoute === 'route_2') {
        dolphinRide.canRide = false;
        dolphinRide.promptText = '';
      }
    } else {
      // Active Dolphin Route 2 Ride across open sea
      dolphinRide.canRide = false;
      dolphinRide.promptText = '🌊 LEAPING TOWARDS THE MISTY HILL TRACTS...';

      const TRIP_DURATION = 4.8;
      const currentProg = Number.isFinite(dolphinRide.rideProgress) ? dolphinRide.rideProgress : 0;
      dolphinRide.rideProgress = Math.min(1.0, Math.max(0, currentProg + dt / TRIP_DURATION));
      const p = dolphinRide.rideProgress;

      const start = dolphinRide.direction === 'to_hill' ? DESERT_DOCK : HILL_DOCK;
      const end = dolphinRide.direction === 'to_hill' ? HILL_DOCK : DESERT_DOCK;

      // Quadratic Bezier curve
      const invP = 1 - p;
      const bx = invP * invP * start.x + 2 * invP * p * MID_CURVE.x + p * p * end.x;
      const bz = invP * invP * start.z + 2 * invP * p * MID_CURVE.z + p * p * end.z;

      const dx = 2 * (1 - p) * (MID_CURVE.x - start.x) + 2 * p * (end.x - MID_CURVE.x);
      const dz = 2 * (1 - p) * (MID_CURVE.z - start.z) + 2 * p * (end.z - MID_CURVE.z);
      const rawHeading = Math.atan2(dx, dz);
      const heading = Number.isFinite(rawHeading) ? rawHeading : (dolphinRide.direction === 'to_hill' ? -3.0 : 0.1);

      // 3 High-Energy Parabolic Leaps out of the ocean
      const leapPhase = p * Math.PI * 6;
      const rawLeap = Math.sin(leapPhase);
      const leapHeight = Math.max(-0.15, rawLeap) * 1.95;
      const by = -0.48 + leapHeight;

      const pitch = Math.cos(leapPhase) * 0.44;
      const bankRoll = Math.sin(p * Math.PI) * (dolphinRide.direction === 'to_hill' ? -0.15 : 0.15);

      if (Number.isFinite(bx) && Number.isFinite(by) && Number.isFinite(bz)) {
        if (groupRef.current) {
          groupRef.current.position.set(bx, by, bz);
          groupRef.current.rotation.set(pitch, heading, bankRoll);
        }
        dolphinRide.dolphinPosition.set(bx, by, bz);
        dolphinRide.dolphinRotation = heading;
      }

      if (p >= 1.0) {
        dolphinRide.isRiding = false;
        dolphinRide.currentLocation = dolphinRide.direction === 'to_hill' ? 'hill' : 'desert';
        dolphinRide.rideProgress = 0;
        dolphinRide.promptText = '';

        const dismountPos =
          dolphinRide.currentLocation === 'hill'
            ? new THREE.Vector3(-60.0, 0.25, -42.0)
            : new THREE.Vector3(-61.0, 0.25, 43.0);
        playerTransform.position.copy(dismountPos);

        const newDock = dolphinRide.currentLocation === 'hill' ? HILL_DOCK : DESERT_DOCK;
        const newHeading = dolphinRide.currentLocation === 'hill' ? 3.0 : -0.2;
        dolphinRide.dolphinPosition.copy(newDock);
        dolphinRide.dolphinRotation = newHeading;
        if (groupRef.current) {
          groupRef.current.position.copy(newDock);
          groupRef.current.rotation.set(0, newHeading, 0);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[-61.0, -0.48, 43.0]}>
      <RealisticDolphinMesh
        swimSpeed={dolphinRide.isRiding ? 12.0 : 3.5}
        waveIntensity={dolphinRide.isRiding ? 1.0 : 0.45}
        isRiding={dolphinRide.isRiding}
      />
    </group>
  );
}

// ── 5. Wild Ocean Dolphins Pod with Realistic Dorsoventral Undulation ──
export function WildOceanDolphins() {
  const dolphin1Ref = useRef<THREE.Group>(null);
  const dolphin2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Wild Dolphin 1: Natural cruising in west lagoon
    if (dolphin1Ref.current) {
      const angle = t * 0.32;
      const x = -48 + Math.cos(angle) * 19;
      const z = 25 + Math.sin(angle) * 15;
      const heading = angle + Math.PI / 2;

      const leapCycle = t * 2.6;
      const leap = Math.max(0, Math.sin(leapCycle)) * 1.5;
      const pitch = Math.cos(leapCycle) * 0.4;

      dolphin1Ref.current.position.set(x, -0.42 + leap, z);
      dolphin1Ref.current.rotation.set(pitch, heading, 0.1);
    }

    // Wild Dolphin 2: Natural swimming in north bay
    if (dolphin2Ref.current) {
      const angle = -t * 0.28 + 1.2;
      const x = 35 + Math.cos(angle) * 21;
      const z = -45 + Math.sin(angle) * 17;
      const heading = angle - Math.PI / 2;

      const leapCycle = t * 2.4 + 1.6;
      const leap = Math.max(0, Math.sin(leapCycle)) * 1.45;
      const pitch = Math.cos(leapCycle) * 0.38;

      dolphin2Ref.current.position.set(x, -0.42 + leap, z);
      dolphin2Ref.current.rotation.set(pitch, heading, -0.1);
    }
  });

  return (
    <group>
      {/* Wild Dolphin 1 */}
      <group ref={dolphin1Ref} position={[-48, -0.42, 25]} scale={0.94}>
        <RealisticDolphinMesh swimSpeed={7.8} waveIntensity={0.8} phaseOffset={0} />
      </group>

      {/* Wild Dolphin 2 */}
      <group ref={dolphin2Ref} position={[35, -0.42, -45]} scale={0.9}>
        <RealisticDolphinMesh swimSpeed={7.2} waveIntensity={0.8} phaseOffset={2.4} />
      </group>
    </group>
  );
}

// ── Master Export: The Complete Dolphin & Ocean Navigation System ──
export function DolphinSystem() {
  return (
    <group>
      {/* 1. Interactive Rideable Dolphin Companion Route 1 (Level 1 <-> Level 2) */}
      <RideableDolphin />

      {/* 2. Interactive Rideable Dolphin Companion Route 2 (Level 3 <-> Level 4) */}
      <HillTractsDolphin />

      {/* 3. Autonomous Wild Ocean Dolphins Pod */}
      <WildOceanDolphins />

      {/* 4. Level 2 Destination: The Ice Age Island (হিমেল দ্বীপ) */}
      <IceAgeIsland />
    </group>
  );
}
