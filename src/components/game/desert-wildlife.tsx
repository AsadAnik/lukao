import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';
import { audioManager } from './audio-manager';

// ══════════════════════════════════════════════════════════════════════════
// 1. DESERT ARABIAN HORSES DRINKING FROM OASIS POND (ঘোড়া পানি খাচ্ছে)
// ══════════════════════════════════════════════════════════════════════════
function DrinkingArabianHorse({
  position,
  rotation = [0, 0, 0],
  coatColor = '#b45309', // Chestnut
  maneColor = '#451a03',
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  coatColor?: string;
  maneColor?: string;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const neighCooldown = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    neighCooldown.current -= dt;

    // Rhythmic Drinking Cycle (Period ~ 8 seconds):
    // Dips neck down to drink water with gentle ripples, pauses, lifts head to look around
    const drinkCycle = (t * 0.4) % 8;
    let targetNeckPitch = 0.85; // Default drinking posture (neck lowered into pond)

    if (drinkCycle < 5.0) {
      // Drinking phase: gentle muzzle water bobbing
      targetNeckPitch = 0.88 + Math.sin(t * 3.5) * 0.06;
      if (rippleRef.current) {
        const rippleScale = 1.0 + (drinkCycle % 1.5) * 0.8;
        rippleRef.current.scale.set(rippleScale, 1, rippleScale);
        (rippleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - (drinkCycle % 1.5) * 0.4);
      }
    } else {
      // Alert head-raise phase: lifts head to scan desert horizon
      targetNeckPitch = -0.25 + Math.sin(t * 2.0) * 0.1;
      if (rippleRef.current) {
        (rippleRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }

    if (neckRef.current) {
      neckRef.current.rotation.x = THREE.MathUtils.lerp(neckRef.current.rotation.x, targetNeckPitch, 5.0 * dt);
    }

    // Swishing Horse Tail (মাছি তাড়ানোর লেজ নাড়া)
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 4.5) * 0.35;
      tailRef.current.rotation.x = -0.4 + Math.sin(t * 2.2) * 0.15;
    }

    // Interactive Neigh when player runs near (< 3.2m)
    const worldX = -85 + position[0];
    const worldZ = 75 + position[2];
    const distToPlayer = Math.hypot(playerTransform.position.x - worldX, playerTransform.position.z - worldZ);
    if (distToPlayer < 3.2 && neighCooldown.current <= 0) {
      audioManager.playHorseNeigh();
      neighCooldown.current = 6.0;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={rootRef}>
      {/* Sleek Muscular Horse Torso */}
      <mesh castShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[0.65, 0.75, 1.6]} />
        <meshStandardMaterial color={coatColor} roughness={0.65} />
      </mesh>

      {/* Articulated Neck, Head & Mane (Lowers into water to drink!) */}
      <group position={[0, 1.45, 0.7]} ref={neckRef}>
        {/* Tapered Arched Neck */}
        <mesh castShadow position={[0, -0.3, 0.35]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.34, 0.85, 0.45]} />
          <meshStandardMaterial color={coatColor} roughness={0.65} />
        </mesh>
        {/* Flowing Dark Mane along Neck */}
        <mesh position={[0, -0.2, 0.2]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.1, 0.9, 0.2]} />
          <meshStandardMaterial color={maneColor} roughness={0.9} />
        </mesh>

        {/* Sculpted Arabian Horse Head & Muzzle */}
        <group position={[0, -0.65, 0.75]} rotation={[-0.45, 0, 0]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.32, 0.45]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          {/* Tapered Muzzle dipping into water */}
          <mesh position={[0, -0.05, 0.28]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.22, 0.22, 0.35]} />
            <meshStandardMaterial color="#292524" roughness={0.8} />
          </mesh>
          {/* Pricked Alert Ears */}
          {[-0.1, 0.1].map((ex, i) => (
            <mesh key={i} position={[ex, 0.28, -0.1]} rotation={[-0.2, 0, ex > 0 ? -0.15 : 0.15]}>
              <coneGeometry args={[0.045, 0.16, 4]} />
              <meshStandardMaterial color={coatColor} />
            </mesh>
          ))}
          {/* Gentle Eyes */}
          {[-0.15, 0.15].map((ey, i) => (
            <mesh key={ey} position={[ey, 0.12, 0.08]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshStandardMaterial color="#0c0a09" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 4 Sturdy Horse Legs */}
      {[
        [-0.25, 0.55, 0.6],
        [0.25, 0.55, 0.6],
        [-0.25, 0.55, -0.6],
        [0.25, 0.55, -0.6],
      ].map(([lx, ly, lz], i) => (
        <group key={i} position={[lx, ly, lz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.09, 1.1, 6]} />
            <meshStandardMaterial color={coatColor} roughness={0.7} />
          </mesh>
          {/* Dark Hoof */}
          <mesh position={[0, -0.55, 0.02]}>
            <cylinderGeometry args={[0.09, 0.1, 0.15, 8]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Swishing Tail */}
      <group ref={tailRef} position={[0, 1.45, -0.8]} rotation={[-0.5, 0, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.06, 0.12, 0.95, 6]} />
          <meshStandardMaterial color={maneColor} roughness={0.9} />
        </mesh>
      </group>

      {/* Dynamic Water Ripple Ring below muzzle in the pond */}
      <mesh ref={rippleRef} position={[0, 0.06, 1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.28, 16]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 2. DESERT CARAVAN CAMELS (মরুভূমির উট — জাবর কাটা ও মালপত্র বহন)
// ══════════════════════════════════════════════════════════════════════════
function AnimatedDesertCamel({
  position,
  rotation = [0, 0, 0],
  isResting = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  isResting?: boolean;
}) {
  const jawRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const gruntCooldown = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    gruntCooldown.current -= dt;

    // Iconic Camel Cud-Chewing Motion (মুখ নাড়িয়ে জাবর কাটা)
    if (jawRef.current) {
      jawRef.current.rotation.y = Math.sin(t * 3.5) * 0.14;
      jawRef.current.position.x = Math.sin(t * 3.5) * 0.03;
    }

    // Gentle head sway
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.08;
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.12;
    }

    // Grunt when player approaches
    const worldX = -85 + position[0];
    const worldZ = 75 + position[2];
    const distToPlayer = Math.hypot(playerTransform.position.x - worldX, playerTransform.position.z - worldZ);
    if (distToPlayer < 3.2 && gruntCooldown.current <= 0) {
      audioManager.playCamelGrunt();
      gruntCooldown.current = 5.0;
    }
  });

  const bodyY = isResting ? 0.75 : 1.75;

  return (
    <group position={position} rotation={rotation}>
      {/* Camel Main Torso (Tawny Desert Fur) */}
      <mesh castShadow position={[0, bodyY, 0]}>
        <boxGeometry args={[0.95, 0.9, 2.1]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} />
      </mesh>

      {/* Two Iconic Camel Humps (দুটো কুঁজ) */}
      <mesh castShadow position={[0, bodyY + 0.65, 0.45]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, bodyY + 0.65, -0.45]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>

      {/* Woven Desert Caravan Saddlebags (মরুভূমির মালপত্রের থলি) */}
      <group position={[0, bodyY + 0.35, 0]}>
        {[-0.55, 0.55].map((sx, i) => (
          <mesh key={i} position={[sx, -0.2, 0]}>
            <boxGeometry args={[0.22, 0.65, 1.2]} />
            <meshStandardMaterial color={i === 0 ? '#991b1b' : '#1e3a8a'} roughness={0.8} />
          </mesh>
        ))}
        {/* Brass Caravan Bells */}
        <mesh position={[0, 0, 1.1]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
      </group>

      {/* S-Curved Long Camel Neck & Head */}
      <group position={[0, bodyY + 0.4, 1.0]}>
        <mesh castShadow position={[0, 0.35, 0.3]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 1.1, 8]} />
          <meshStandardMaterial color="#d97706" roughness={0.85} />
        </mesh>

        {/* Head & Chewing Muzzle */}
        <group ref={headRef} position={[0, 0.95, 0.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.32, 0.45]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
          {/* Chewing Cud Jaw */}
          <group ref={jawRef} position={[0, -0.15, 0.2]}>
            <mesh>
              <boxGeometry args={[0.28, 0.2, 0.35]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
          </group>
          {/* Sleepy Eyelids & Eyes */}
          {[-0.18, 0.18].map((ex, i) => (
            <mesh key={i} position={[ex, 0.08, 0.1]}>
              <sphereGeometry args={[0.045, 6, 6]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))}
          {/* Camel Small Ears */}
          {[-0.16, 0.16].map((ex, i) => (
            <mesh key={i} position={[ex, 0.22, -0.1]}>
              <coneGeometry args={[0.05, 0.12, 4]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Camel Legs (Standing vs Resting Kneeling) */}
      {!isResting ? (
        // Standing Long Pillar Legs
        [
          [-0.35, 0.8, 0.75],
          [0.35, 0.8, 0.75],
          [-0.35, 0.8, -0.75],
          [0.35, 0.8, -0.75],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} castShadow position={[lx, ly, lz]}>
            <cylinderGeometry args={[0.11, 0.13, 1.6, 6]} />
            <meshStandardMaterial color="#b45309" roughness={0.85} />
          </mesh>
        ))
      ) : (
        // Resting Tucked Knees on Warm Sand
        [
          [-0.45, 0.25, 0.65],
          [0.45, 0.25, 0.65],
          [-0.45, 0.25, -0.65],
          [0.45, 0.25, -0.65],
        ].map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.65, 6]} />
            <meshStandardMaterial color="#b45309" roughness={0.85} />
          </mesh>
        ))
      )}

      {/* Small Tufted Tail */}
      <mesh position={[0, bodyY + 0.2, -1.1]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.75, 5]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 3. SLITHERING DESERT HORNED SAND VIPER (মরুভূমির বুকে আঁকাবাঁকা সাপের চলন)
// ══════════════════════════════════════════════════════════════════════════
function SlitheringSandSnake({ pathCenter = [-12.0, 0.15, 8.0] }: { pathCenter?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const segmentRefs = useRef<(THREE.Mesh | null)[]>([]);

  const segmentsCount = 9;

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.elapsedTime;

    // Snake slithers along a patrol path across the warm golden sand dunes
    const pathAngle = t * 0.35;
    const posX = pathCenter[0] + Math.cos(pathAngle) * 3.8;
    const posZ = pathCenter[2] + Math.sin(pathAngle * 2.0) * 1.8;
    const heading = Math.atan2(Math.cos(pathAngle * 2.0) * 3.6, -Math.sin(pathAngle) * 3.8);

    rootRef.current.position.set(posX, pathCenter[1], posZ);
    rootRef.current.rotation.y = heading;

    // Realistic Sinusoidal Travelling Serpentine Wave Motion (আঁকাবাঁকা তরঙ্গায়িত চলন)
    segmentRefs.current.forEach((seg, idx) => {
      if (seg) {
        seg.position.x = Math.sin(t * 6.0 + idx * 0.65) * 0.16;
      }
    });

    // Alert head raising & tongue flick
    if (headRef.current) {
      headRef.current.position.y = 0.14 + Math.sin(t * 4.0) * 0.05;
      headRef.current.rotation.z = Math.sin(t * 6.0) * 0.15;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Snake Head with Horned Viper Crest & Flicking Red Tongue */}
      <group ref={headRef} position={[0, 0.12, 0.4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.6} />
        </mesh>
        {/* Amber Viper Eyes */}
        {[-0.06, 0.06].map((ex, i) => (
          <mesh key={i} position={[ex, 0.04, 0.06]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        ))}
        {/* Red Forked Flicking Tongue */}
        <mesh position={[0, -0.02, 0.14]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 4]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Articulated Body Segments Tapering to Tail */}
      {Array.from({ length: segmentsCount }).map((_, idx) => {
        const radius = 0.09 * (1 - (idx / segmentsCount) * 0.6);
        return (
          <mesh
            key={idx}
            ref={(el) => { segmentRefs.current[idx] = el; }}
            position={[0, 0.08, -idx * 0.18]}
            castShadow
          >
            <sphereGeometry args={[radius, 8, 8]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#ca8a04' : '#a16207'}
              roughness={0.65}
            />
          </mesh>
        );
      })}
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 4. SOARING DESERT EAGLES (আকাশে চক্কর দেওয়া ঈগল — খেলোয়াড়দের নজরদারি)
// ══════════════════════════════════════════════════════════════════════════
function SoaringDesertEagle({
  center = [-85, 16, 75],
  orbitRadius = 16.0,
  speed = 0.4,
  phase = 0,
}: {
  center?: [number, number, number];
  orbitRadius?: number;
  speed?: number;
  phase?: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const wingLRef = useRef<THREE.Group>(null);
  const wingRRef = useRef<THREE.Group>(null);
  const screechCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime * speed + phase;
    screechCooldown.current -= dt;

    // High Thermal Thermal Soaring Orbit (বৃত্তাকারে আকাশে ওড়া)
    const angle = t;
    const x = center[0] + Math.cos(angle) * orbitRadius;
    const z = center[2] + Math.sin(angle) * orbitRadius;
    const heading = -angle; // Tangent heading along circular orbit

    // Dynamic Player Surveillance ("seeing always characters what happening"):
    // Checks if player is running across open desert; if so, swoops lower to inspect!
    const distToPlayer = Math.hypot(playerTransform.position.x - x, playerTransform.position.z - z);
    const isInspecting = distToPlayer < 12.0;

    let targetY = center[1] + Math.sin(t * 1.5) * 1.8;
    if (isInspecting) {
      targetY -= 5.0; // Swoop down to watch characters!
      if (screechCooldown.current <= 0) {
        audioManager.playEagleScreech();
        screechCooldown.current = 7.0;
      }
    }

    rootRef.current.position.set(x, targetY, z);
    // Bank roll into the turn
    rootRef.current.rotation.set(0.15, heading, -0.32);

    // Thermal Gliding Wing Flap (Long majestic glides with periodic flapping bursts)
    const isFlapping = Math.sin(t * 3.5) > 0.5;
    const flapAngle = isFlapping ? Math.sin(state.clock.elapsedTime * 9.0) * 0.35 : 0.05;
    if (wingLRef.current) wingLRef.current.rotation.z = flapAngle;
    if (wingRRef.current) wingRRef.current.rotation.z = -flapAngle;
  });

  return (
    <group ref={rootRef}>
      {/* Sleek Aerodynamic Eagle Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.3, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>
      {/* White Feathered Head with Sharp Curved Golden Beak */}
      <group position={[0, 0.2, 0.75]}>
        <mesh>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* Curved Predator Beak looking down towards the ground! */}
        <mesh position={[0, -0.1, 0.16]} rotation={[0.6, 0, 0]}>
          <coneGeometry args={[0.07, 0.22, 5]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} />
        </mesh>
      </group>

      {/* Massive Sweeping Feathered Wings (বিশাল ডানা) */}
      <group ref={wingLRef} position={[-0.2, 0.1, 0]}>
        <mesh position={[-1.1, 0, 0]}>
          <boxGeometry args={[2.0, 0.06, 0.7]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.8} />
        </mesh>
        {/* Tapered Wingtips */}
        <mesh position={[-2.3, 0, -0.05]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#1e1b18" />
        </mesh>
      </group>

      <group ref={wingRRef} position={[0.2, 0.1, 0]}>
        <mesh position={[1.1, 0, 0]}>
          <boxGeometry args={[2.0, 0.06, 0.7]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.8} />
        </mesh>
        <mesh position={[2.3, 0, -0.05]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshStandardMaterial color="#1e1b18" />
        </mesh>
      </group>

      {/* Fan-Shaped White Tail Feathers */}
      <mesh position={[0, 0.05, -0.75]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.65, 0.04, 0.55]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 5. MASTER EXPORT: DESERT WILDLIFE KINGDOM (মরুভূমির প্রাণীজগৎ)
// ══════════════════════════════════════════════════════════════════════════
export function DesertWildlife() {
  return (
    <group>
      {/* ── 1. Arabian Horses Drinking at the Oasis Pond ── */}
      {/* Horse 1: Chestnut Arabian Horse drinking directly from pond */}
      <DrinkingArabianHorse
        position={[-8.5, 0.12, -7.5]}
        rotation={[0, 0.85, 0]}
        coatColor="#b45309"
        maneColor="#451a03"
      />
      {/* Horse 2: Palomino Golden Arabian Horse drinking beside palms */}
      <DrinkingArabianHorse
        position={[-6.2, 0.12, -10.2]}
        rotation={[0, 1.6, 0]}
        coatColor="#facc15"
        maneColor="#ffffff"
      />

      {/* ── 2. Animated Desert Camels ── */}
      {/* Camel 1: Standing camel chewing cud with caravan saddlebags */}
      <AnimatedDesertCamel
        position={[10.5, 0.12, -8.5]}
        rotation={[0, -0.6, 0]}
        isResting={false}
      />
      {/* Camel 2: Resting kneeling camel on warm sand */}
      <AnimatedDesertCamel
        position={[13.5, 0.12, -7.0]}
        rotation={[0, 0.4, 0]}
        isResting={true}
      />

      {/* ── 3. Slithering Desert Sand Snake on the Dunes ── */}
      <SlitheringSandSnake pathCenter={[-11.5, 0.12, 11.0]} />

      {/* ── 4. High-Altitude Soaring Desert Eagles (Watching Characters Below) ── */}
      <SoaringDesertEagle center={[-85, 17, 75]} orbitRadius={18.0} speed={0.42} phase={0} />
      <SoaringDesertEagle center={[-85, 19, 75]} orbitRadius={23.0} speed={0.35} phase={Math.PI} />
    </group>
  );
}

