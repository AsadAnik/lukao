import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { balloonRide, playerTransform } from './game-engine-state';
import { lukaoStore } from './game-state';

// Station coordinates in world space:
// Level 2 (Ice Age Island) Alpine Station: [68.5, 0.45, 78.5]
// Level 3 (Desert World Island) Oasis Station: [-68.5, 0.45, 78.5]
const ICE_STATION = new THREE.Vector3(68.5, 1.2, 78.5);
const DESERT_STATION = new THREE.Vector3(-68.5, 1.2, 78.5);
const SKY_MID_CURVE = new THREE.Vector3(0, 22.0, 92.0); // Apex cruising altitude over ocean

// ── 1. The Interactive Transport Hot Air Balloon 3D Model ──
function TransportBalloonMesh({
  isFlying,
}: {
  isFlying: boolean;
}) {
  const burnerFlameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Flickering burner flame inside the balloon neck
    if (burnerFlameRef.current) {
      const flicker = 1.0 + Math.sin(state.clock.elapsedTime * 24) * 0.18;
      burnerFlameRef.current.scale.set(flicker, isFlying ? 1.4 * flicker : 0.8 * flicker, flicker);
    }
  });

  return (
    <group>
      {/* ── Teardrop Hot Air Balloon Envelope (রঙিন বেলুন) ── */}
      <group position={[0, 4.2, 0]}>
        {/* Main Upper Sphere (Vibrant Golden Amber) */}
        <mesh castShadow>
          <sphereGeometry args={[3.2, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* Vertical Striped Segments (Crimson Red & Royal Gold Madbox Aesthetic) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rotY = (i / 8) * Math.PI * 2;
          if (i % 2 === 0) return null;
          return (
            <mesh key={i} rotation={[0, rotY, 0]}>
              <sphereGeometry args={[3.22, 16, 16, 0, Math.PI / 4]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} />
            </mesh>
          );
        })}

        {/* Lower Tapered Cone Neck */}
        <mesh position={[0, -2.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.2, 2.6, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* Burner Brass Ring & Glowing Propane Flame */}
        <mesh position={[0, -3.8, 0]}>
          <torusGeometry args={[0.42, 0.06, 8, 16]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.8} />
        </mesh>
        <mesh ref={burnerFlameRef} position={[0, -3.6, 0]}>
          <coneGeometry args={[0.22, 0.65, 6]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <pointLight position={[0, -3.6, 0]} color="#ea580c" intensity={1.5} distance={8} />
      </group>

      {/* ── 4 Suspension Cables connecting Envelope to Basket ── */}
      {[-0.65, 0.65].map((rx, xi) =>
        [-0.65, 0.65].map((rz, zi) => (
          <mesh key={`${xi}-${zi}`} position={[rx, 1.2, rz]}>
            <cylinderGeometry args={[0.02, 0.02, 2.2, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* ── Wicker Passenger Basket (যাত্রীদের বসার ঝুড়ি) ── */}
      <group position={[0, 0, 0]}>
        {/* Wicker Base & Walls */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.9, 1.5]} />
          <meshStandardMaterial color="#d97706" roughness={0.85} />
        </mesh>
        {/* Hollow Interior Floor */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.35, 0.75, 1.35]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Padded White Upper Rim */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.6, 0.12, 1.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Decorative Sandbags on Basket Sides */}
        {[-0.8, 0.8].map((sx, i) => (
          <mesh key={i} position={[sx, 0.35, 0]}>
            <sphereGeometry args={[0.16, 6, 6]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 2. Clouds along the Flight Road (বেলুন যাত্রার আকাশপথে ভাসমান মেঘমালা) ──
function AerialFlightClouds() {
  const clouds = [
    { pos: [45, 19, 82], scale: 1.5 },
    { pos: [22, 21, 90], scale: 1.8 },
    { pos: [0, 22.5, 93], scale: 2.1 },
    { pos: [-24, 20.5, 88], scale: 1.7 },
    { pos: [-48, 18.5, 83], scale: 1.4 },
  ];

  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos as [number, number, number]} scale={c.scale}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3.2, 10, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[2.2, -0.4, 0.4]}>
            <sphereGeometry args={[2.4, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[-2.2, -0.4, -0.3]}>
            <sphereGeometry args={[2.2, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0.8, 1.1, 0.2]}>
            <sphereGeometry args={[2.0, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 3. Alpine & Desert Balloon Mooring Platforms ──
function BalloonPlatform({
  position,
  label,
  isIce = false,
}: {
  position: [number, number, number];
  label: string;
  isIce?: boolean;
}) {
  return (
    <group position={position}>
      {/* Octagonal Wooden / Sandstone Docking Pad */}
      <mesh receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.3, 8]} />
        <meshStandardMaterial color={isIce ? '#78350f' : '#b45309'} roughness={0.85} />
      </mesh>
      {/* Target Ring on Pad */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.8, 16]} />
        <meshBasicMaterial color={isIce ? '#bae6fd' : '#facc15'} />
      </mesh>
      {/* Mooring Bollards */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((ang, i) => (
        <group key={i} position={[Math.cos(ang) * 2.5, 0.3, Math.sin(ang) * 2.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.6, 6]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.13, 6, 6]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 4. Master Transport Balloon System Component ──
export function TransportBalloonSystem() {
  const activeBalloonRef = useRef<THREE.Group>(null);
  const staticIceBalloonRef = useRef<THREE.Group>(null);
  const staticDesertBalloonRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    if (!balloonRide.isFlying) {
      // Idle at dock: gentle float and buoyancy sway
      const isAtIce = balloonRide.currentLocation === 'ice';
      const dockPos = isAtIce ? ICE_STATION : DESERT_STATION;
      const targetRot = isAtIce ? -Math.PI / 2 : Math.PI / 2;

      const idleY = dockPos.y + Math.sin(t * 1.6) * 0.12;
      const swayZ = Math.sin(t * 1.2) * 0.08;

      if (activeBalloonRef.current) {
        activeBalloonRef.current.position.set(dockPos.x, idleY, dockPos.z + swayZ);
        activeBalloonRef.current.rotation.set(0, targetRot, Math.sin(t * 1.4) * 0.03);
      }
      balloonRide.balloonPosition.set(dockPos.x, idleY, dockPos.z + swayZ);
      balloonRide.balloonRotation = targetRot;

      // Proximity check for boarding interaction (Temporarily unlocked for testing)
      const playerPos = playerTransform.position;
      const distToPlayer = Math.hypot(playerPos.x - dockPos.x, playerPos.z - dockPos.z);
      const isNear = distToPlayer < 4.2;
      const isDesertUnlocked = true; // All levels temporarily unlocked for testing

      if (isNear) {
        if (isAtIce) {
          balloonRide.canFly = true;
          balloonRide.promptText = '🎈 LEVEL 3 UNLOCKED! FLY TO DESERT WORLD (মরুভূমি ও পিরামিডে ওড়ো!)';
        } else {
          // Returning from desert to ice age island
          balloonRide.canFly = true;
          balloonRide.promptText = '🎈 FLY RETURN TO ICE AGE ISLAND (হিমেল দ্বীপে ফিরে চলো)';
        }
      } else {
        balloonRide.canFly = false;
        balloonRide.promptText = '';
      }
    } else {
      // Active Flight: Soaring across the ocean and passing through clouds!
      balloonRide.canFly = false;
      const isToDesert = balloonRide.direction === 'to_desert';
      balloonRide.promptText = isToDesert
        ? '☁️ SOARING ABOVE CLOUDS TO DESERT WORLD...'
        : '☁️ SOARING ABOVE CLOUDS TO ICE AGE ISLAND...';

      const FLIGHT_DURATION = 5.8;
      const currentProg = Number.isFinite(balloonRide.flightProgress) ? balloonRide.flightProgress : 0;
      balloonRide.flightProgress = Math.min(1.0, Math.max(0, currentProg + dt / FLIGHT_DURATION));
      const p = balloonRide.flightProgress;

      const start = isToDesert ? ICE_STATION : DESERT_STATION;
      const end = isToDesert ? DESERT_STATION : ICE_STATION;

      // Quadratic Bezier Curve in 3D: takes off, climbs into clouds (y = 22m), and descends to landing pad
      const invP = 1 - p;
      const bx = invP * invP * start.x + 2 * invP * p * SKY_MID_CURVE.x + p * p * end.x;
      const bz = invP * invP * start.z + 2 * invP * p * SKY_MID_CURVE.z + p * p * end.z;

      // Smooth parabolic altitude arch reaching cruising clouds
      const altFactor = Math.sin(p * Math.PI);
      const by = THREE.MathUtils.lerp(start.y, end.y, p) + altFactor * 19.5;

      const dx = 2 * (1 - p) * (SKY_MID_CURVE.x - start.x) + 2 * p * (end.x - SKY_MID_CURVE.x);
      const dz = 2 * (1 - p) * (SKY_MID_CURVE.z - start.z) + 2 * p * (end.z - SKY_MID_CURVE.z);
      const rawHeading = Math.atan2(dx, dz);
      const heading = Number.isFinite(rawHeading) ? rawHeading : (isToDesert ? -Math.PI / 2 : Math.PI / 2);

      // Gentle flight pitch & tilt into wind
      const pitch = (0.5 - p) * 0.12;
      const roll = Math.sin(p * Math.PI * 3) * 0.04;

      if (activeBalloonRef.current) {
        activeBalloonRef.current.position.set(bx, by, bz);
        activeBalloonRef.current.rotation.set(pitch, heading, roll);
      }
      balloonRide.balloonPosition.set(bx, by, bz);
      balloonRide.balloonRotation = heading;

      // Mount player character snugly inside the passenger basket!
      playerTransform.position.set(bx, by + 0.35, bz);
      playerTransform.rotation = heading;

      if (p >= 1.0) {
        // Smooth Landing!
        balloonRide.isFlying = false;
        balloonRide.currentLocation = isToDesert ? 'desert' : 'ice';
        balloonRide.flightProgress = 0;
        balloonRide.promptText = '';

        const dismountPos = isToDesert
          ? new THREE.Vector3(-70.5, 1.2, 78.5)
          : new THREE.Vector3(70.5, 1.2, 78.5);
        playerTransform.position.copy(dismountPos);

        const newDock = isToDesert ? DESERT_STATION : ICE_STATION;
        const newHeading = isToDesert ? Math.PI / 2 : -Math.PI / 2;
        balloonRide.balloonPosition.copy(newDock);
        balloonRide.balloonRotation = newHeading;
        if (activeBalloonRef.current) {
          activeBalloonRef.current.position.copy(newDock);
          activeBalloonRef.current.rotation.set(0, newHeading, 0);
        }
      }
    }
  });

  return (
    <group>
      {/* ── 1. The Active Transport Hot Air Balloon ── */}
      <group ref={activeBalloonRef} position={[68.5, 1.2, 78.5]}>
        <TransportBalloonMesh isFlying={balloonRide.isFlying} />
      </group>

      {/* ── 2. Fluffy Flight Corridor Clouds (মেঘমালা) ── */}
      <AerialFlightClouds />

      {/* ── 3. Level 2 (Ice Age Island) Balloon Platform ── */}
      <BalloonPlatform position={[68.5, 0.12, 78.5]} label="LEVEL 2 ALPINE LAUNCH" isIce={true} />

      {/* ── 4. Level 3 (Desert World) Balloon Platform ── */}
      <BalloonPlatform position={[-68.5, 0.12, 78.5]} label="LEVEL 3 DESERT OASIS LAUNCH" isIce={false} />
    </group>
  );
}

