import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerTransform } from './game-engine-state';
import { audioManager } from './audio-manager';

// ══════════════════════════════════════════════════════════════════════════
// 1. THE ARCTIC PENGUIN COLONY (পেঙ্গুইন কলোনি — মাছ ধরা, পেটে ভর দিয়ে পিছলে যাওয়া)
// ══════════════════════════════════════════════════════════════════════════

// Common High-Performance Procedural Penguin Model
function PenguinModel({
  flipperLRef,
  flipperRRef,
  headRef,
  beakFish = false,
}: {
  flipperLRef: React.RefObject<THREE.Group | null>;
  flipperRRef: React.RefObject<THREE.Group | null>;
  headRef: React.RefObject<THREE.Group | null>;
  beakFish?: boolean;
}) {
  return (
    <group>
      {/* Plump Tuxedo Torso (Black Back, White Belly Apron) */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Crisp Snow-White Belly Apron */}
      <mesh position={[0, 0.44, 0.12]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      {/* Emperor Penguin Golden-Orange Neck Patches */}
      {[-0.14, 0.14].map((px, i) => (
        <mesh key={i} position={[px, 0.62, 0.08]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
      ))}

      {/* Articulated Head & Orange Beak */}
      <group ref={headRef} position={[0, 0.72, 0.04]}>
        {/* Head Sphere */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Cute Glassy Eyes */}
        {[-0.09, 0.09].map((ex, i) => (
          <group key={i} position={[ex, 0.04, 0.14]}>
            <mesh>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <sphereGeometry args={[0.018, 6, 6]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
          </group>
        ))}
        {/* Sharp Triangular Orange Beak */}
        <mesh position={[0, -0.02, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} />
        </mesh>

        {/* Freshly Caught Silver Wiggling Fish in Beak */}
        {beakFish && (
          <group position={[0, -0.04, 0.28]} rotation={[0, 0.4, 0.3]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.05, 0.28, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Fish Tail Fin */}
            <mesh position={[0, -0.15, 0]}>
              <coneGeometry args={[0.05, 0.08, 4]} />
              <meshStandardMaterial color="#64748b" metalness={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* Left Flipper Wing */}
      <group ref={flipperLRef} position={[-0.28, 0.58, 0]} rotation={[0, 0, -0.3]}>
        <mesh position={[-0.04, -0.2, 0]}>
          <boxGeometry args={[0.06, 0.38, 0.16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Flipper Wing */}
      <group ref={flipperRRef} position={[0.28, 0.58, 0]} rotation={[0, 0, 0.3]}>
        <mesh position={[0.04, -0.2, 0]}>
          <boxGeometry args={[0.06, 0.38, 0.16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* Webbed Orange Feet */}
      {[-0.12, 0.12].map((fx, i) => (
        <mesh key={i} position={[fx, 0.06, 0.08]}>
          <boxGeometry args={[0.11, 0.05, 0.18]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
      ))}

      {/* Small Pointed Tail */}
      <mesh position={[0, 0.22, -0.26]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.08, 0.16, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// Penguin 1: "Pip" — The Waddling Fisherman (মাছ ধরে বালতিতে রাখা)
function WaddlingFisherPenguin({ startPos = [14.0, 0.12, -14.5] }: { startPos?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const flipperLRef = useRef<THREE.Group>(null);
  const flipperRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const [hasFish, setHasFish] = React.useState(false);
  const chirpCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    chirpCooldown.current -= dt;

    // Ping-pong waddle cycle between fishing hole and fish barrel (Period ~ 12s)
    const cycle = (t * 0.4) % 12;
    let targetX = startPos[0];
    let targetZ = startPos[2];
    let heading = 0;
    let isWaddling = false;

    if (cycle < 4.5) {
      // Phase 1: Waddle towards ocean ice edge
      const p = cycle / 4.5;
      targetX = THREE.MathUtils.lerp(startPos[0], startPos[0] + 3.2, p);
      targetZ = THREE.MathUtils.lerp(startPos[2], startPos[2] - 2.8, p);
      heading = Math.atan2(-2.8, 3.2);
      isWaddling = true;
      if (hasFish) setHasFish(false);
    } else if (cycle < 7.0) {
      // Phase 2: Fishing at ice hole (dip head down, catch fish!)
      targetX = startPos[0] + 3.2;
      targetZ = startPos[2] - 2.8;
      heading = -0.7;
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 3.5) * 0.45 + 0.35;
      }
      if (cycle > 6.0 && !hasFish) {
        setHasFish(true);
      }
    } else if (cycle < 11.0) {
      // Phase 3: Waddle proudly back with caught fish
      const p = (cycle - 7.0) / 4.0;
      targetX = THREE.MathUtils.lerp(startPos[0] + 3.2, startPos[0], p);
      targetZ = THREE.MathUtils.lerp(startPos[2] - 2.8, startPos[2], p);
      heading = Math.atan2(2.8, -3.2);
      isWaddling = true;
    } else {
      // Phase 4: Deposit fish into wooden fish bucket
      targetX = startPos[0];
      targetZ = startPos[2];
      heading = 0.5;
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 6) * 0.25;
      }
    }

    rootRef.current.position.set(targetX, startPos[1], targetZ);
    rootRef.current.rotation.y = heading;

    // Waddle body sway & flipper flap
    if (isWaddling) {
      rootRef.current.rotation.z = Math.sin(t * 8.5) * 0.16;
      if (flipperLRef.current) flipperLRef.current.rotation.z = -0.3 + Math.sin(t * 8.5) * 0.35;
      if (flipperRRef.current) flipperRRef.current.rotation.z = 0.3 - Math.sin(t * 8.5) * 0.35;
    } else {
      rootRef.current.rotation.z = 0;
      if (flipperLRef.current) flipperLRef.current.rotation.z = -0.3;
      if (flipperRRef.current) flipperRRef.current.rotation.z = 0.3;
    }

    // Interactive Chirp when player runs near (< 2.8m)
    const distToPlayer = Math.hypot(
      playerTransform.position.x - (85 + targetX),
      playerTransform.position.z - (65 + targetZ)
    );
    if (distToPlayer < 2.8 && chirpCooldown.current <= 0) {
      audioManager.playPenguinChirp();
      chirpCooldown.current = 4.0;
    }
  });

  return (
    <group>
      {/* Wooden Fish Bucket at Base Station */}
      <group position={[startPos[0] - 0.4, startPos[1] + 0.18, startPos[2] + 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.22, 0.36, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Water & Shiny Fish Inside Bucket */}
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.3} roughness={0.2} />
        </mesh>
        <mesh position={[0.05, 0.18, 0]} rotation={[0.4, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} />
        </mesh>
      </group>

      <group ref={rootRef}>
        <PenguinModel
          flipperLRef={flipperLRef}
          flipperRRef={flipperRRef}
          headRef={headRef}
          beakFish={hasFish}
        />
      </group>
    </group>
  );
}

// Penguin 2: "Pudge" — The Belly Slider (পেটে ভর দিয়ে বরফে দ্রুত পিছলে চলা)
function BellySlidePenguin({ originPos = [17.5, 0.12, -16.0] }: { originPos?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const flipperLRef = useRef<THREE.Group>(null);
  const flipperRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.elapsedTime;
    const cycle = (t * 0.35) % 8; // 8-second repeating belly-slide cycle

    let posX = originPos[0];
    let posZ = originPos[2];
    let posY = originPos[1];
    let rotX = 0;
    let rotZ = 0;
    let rotY = -2.1;

    if (cycle < 1.5) {
      // Phase 1: Waddle up to the launch mark
      const p = cycle / 1.5;
      posX = originPos[0] + p * 0.8;
      posZ = originPos[2] - p * 0.8;
      rotZ = Math.sin(t * 9) * 0.18;
      if (headRef.current) headRef.current.rotation.x = 0.1;
    } else if (cycle < 5.0) {
      // Phase 2: DIVE ONTO BELLY AND SLIDE!
      const slideP = (cycle - 1.5) / 3.5;
      posX = originPos[0] + 0.8 - slideP * 5.2;
      posZ = originPos[2] - 0.8 - slideP * 3.8;
      posY = originPos[1] - 0.22;
      rotX = -1.25; // Belly down!
      rotY = Math.atan2(-3.8, -5.2);

      // Splayed flippers paddling the ice
      if (flipperLRef.current) flipperLRef.current.rotation.z = -1.2 + Math.sin(t * 14) * 0.25;
      if (flipperRRef.current) flipperRRef.current.rotation.z = 1.2 - Math.sin(t * 14) * 0.25;
      if (headRef.current) headRef.current.rotation.x = -0.55; // Keep head up proudly
    } else if (cycle < 6.2) {
      // Phase 3: Stand up and shake off snow
      posX = originPos[0] + 0.8 - 5.2;
      posZ = originPos[2] - 0.8 - 3.8;
      rotX = 0;
      rotY = 0.5;
      rotZ = Math.sin(t * 26) * 0.2; // Vigorous snow ruffle shake!
      if (flipperLRef.current) flipperLRef.current.rotation.z = Math.sin(t * 26) * 0.45;
      if (flipperRRef.current) flipperRRef.current.rotation.z = -Math.sin(t * 26) * 0.45;
    } else {
      // Phase 4: Waddle back to start position
      const backP = (cycle - 6.2) / 1.8;
      posX = THREE.MathUtils.lerp(originPos[0] + 0.8 - 5.2, originPos[0], backP);
      posZ = THREE.MathUtils.lerp(originPos[2] - 0.8 - 3.8, originPos[2], backP);
      rotX = 0;
      rotY = Math.atan2(originPos[2] - (originPos[2] - 0.8 - 3.8), originPos[0] - (originPos[0] + 0.8 - 5.2));
      rotZ = Math.sin(t * 8) * 0.16;
    }

    rootRef.current.position.set(posX, posY, posZ);
    rootRef.current.rotation.set(rotX, rotY, rotZ);
  });

  return (
    <group ref={rootRef}>
      <PenguinModel flipperLRef={flipperLRef} flipperRRef={flipperRRef} headRef={headRef} />
    </group>
  );
}

// Penguin 3: "Percy" — The Coastal Lookout (পাথরের চূড়ায় দাঁড়িয়ে ডানা ঝাপটানো)
function LookoutPenguin({ position = [-9.5, 0.12, -14.5] }: { position?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const flipperLRef = useRef<THREE.Group>(null);
  const flipperRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.75;
      headRef.current.rotation.x = Math.sin(t * 2.2) * 0.15;
    }
    // Periodic happy wing flap burst
    const flapBurst = Math.sin(t * 1.5) > 0.4;
    const flapAngle = flapBurst ? Math.sin(t * 16) * 0.5 : 0;
    if (flipperLRef.current) flipperLRef.current.rotation.z = -0.3 - flapAngle;
    if (flipperRRef.current) flipperRRef.current.rotation.z = 0.3 + flapAngle;
  });

  return (
    <group position={position}>
      {/* Coastal Lookout Rock Podium */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 0.6, 7]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <group ref={rootRef} position={[0, 0.6, 0]} rotation={[0, 1.2, 0]}>
        <PenguinModel flipperLRef={flipperLRef} flipperRRef={flipperRRef} headRef={headRef} />
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 2. SCRAT — THE FRANTIC PREHISTORIC SABER-TOOTHED SQUIRREL (স্ক্র্যাট ও বাদাম)
// ══════════════════════════════════════════════════════════════════════════
function FranticScratSquirrel({ position = [-6.2, 0.12, -7.5] }: { position?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const acornRef = useRef<THREE.Group>(null);
  const squeakCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    squeakCooldown.current -= dt;

    // Check distance to player for comic high-pitched panic reaction
    const worldX = 85 + position[0] + rootRef.current.position.x;
    const worldZ = 65 + position[2] + rootRef.current.position.z;
    const distToPlayer = Math.hypot(playerTransform.position.x - worldX, playerTransform.position.z - worldZ);
    const isPanicked = distToPlayer < 3.2;

    if (isPanicked) {
      // Trigger Comic Squeak sound
      if (squeakCooldown.current <= 0) {
        audioManager.playScratSqueak();
        squeakCooldown.current = 3.5;
      }
      // Panic Hop & Hug Acorn Tightly
      rootRef.current.position.y = Math.abs(Math.sin(t * 18)) * 0.28;
      rootRef.current.rotation.y += dt * 4.5;
      if (tailRef.current) tailRef.current.rotation.x = 0.8 + Math.sin(t * 22) * 0.35;
      if (headRef.current) headRef.current.rotation.x = -0.3 + Math.sin(t * 24) * 0.2;
      if (acornRef.current) {
        acornRef.current.position.set(0, 0.28, 0.22);
        acornRef.current.rotation.z = Math.sin(t * 20) * 0.15;
      }
      return;
    }

    // Normal Hilarious Scrat Behavior Routine:
    // 1. Scampering between spots -> 2. Sniffing ice -> 3. Furiously ramming acorn into ice!
    const cycle = (t * 0.5) % 10;
    if (cycle < 3.5) {
      // Phase 1: Rapid Scamper along an arc
      const p = cycle / 3.5;
      const ang = p * Math.PI * 2;
      rootRef.current.position.x = Math.cos(ang) * 1.4;
      rootRef.current.position.z = Math.sin(ang) * 1.4;
      rootRef.current.position.y = Math.abs(Math.sin(t * 14)) * 0.12;
      rootRef.current.rotation.y = -ang + Math.PI / 2;

      if (tailRef.current) tailRef.current.rotation.x = 0.5 + Math.sin(t * 16) * 0.25;
      if (acornRef.current) acornRef.current.position.set(0, 0.25, 0.28);
    } else if (cycle < 6.0) {
      // Phase 2: Stop, look around nervously, sniff the ground
      rootRef.current.position.y = 0;
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 5.0) * 0.65;
        headRef.current.rotation.x = Math.sin(t * 8.0) * 0.25 + 0.25;
      }
      if (tailRef.current) tailRef.current.rotation.z = Math.sin(t * 8) * 0.3;
    } else {
      // Phase 3: THE ICONIC ACORN SLAM! (Furiously hammering acorn into ice)
      const slamFreq = t * 14;
      const slamHeight = Math.max(0, Math.sin(slamFreq)) * 0.18;
      if (headRef.current) headRef.current.rotation.x = 0.45 + slamHeight * 1.2;
      if (acornRef.current) {
        acornRef.current.position.y = 0.12 - slamHeight;
      }
      if (armLRef.current) armLRef.current.rotation.x = 0.6 + slamHeight * 2;
      if (armRRef.current) armRRef.current.rotation.x = 0.6 + slamHeight * 2;
      if (tailRef.current) tailRef.current.rotation.x = 0.9 + Math.sin(t * 14) * 0.4;
    }
  });

  return (
    <group position={position}>
      <group ref={rootRef}>
        {/* Scrat Body (Slender Prehistoric Rodent) */}
        <mesh castShadow position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 0.42, 8]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {/* Fluffy Pale Chest */}
        <mesh position={[0, 0.24, 0.08]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.85} />
        </mesh>

        {/* Head with Long Snout, Huge Bulging Eyes & Iconic Saber Fangs */}
        <group ref={headRef} position={[0, 0.45, 0.08]}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
          {/* Tapered Long Snout */}
          <mesh position={[0, 0.02, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.25, 7]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          {/* Tiny Black Nose Tip */}
          <mesh position={[0, 0.02, 0.31]}>
            <sphereGeometry args={[0.024, 6, 6]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* Iconic Long Curved Saber Fangs */}
          {[-0.045, 0.045].map((fx, i) => (
            <mesh key={i} position={[fx, -0.06, 0.2]} rotation={[0.2, i === 0 ? 0.1 : -0.1, 0]}>
              <coneGeometry args={[0.016, 0.15, 6]} />
              <meshStandardMaterial color="#fef9c3" roughness={0.3} />
            </mesh>
          ))}
          {/* Huge Comic Googly Eyes */}
          {[-0.08, 0.08].map((ex, i) => (
            <group key={i} position={[ex, 0.15, 0.08]}>
              <mesh>
                <sphereGeometry args={[0.055, 8, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.04]}>
                <sphereGeometry args={[0.026, 6, 6]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>
          ))}
          {/* Pointed Twitchy Ears */}
          {[-0.08, 0.08].map((erx, i) => (
            <mesh key={erx} position={[erx, 0.18, -0.06]} rotation={[-0.3, 0, erx > 0 ? -0.4 : 0.4]}>
              <coneGeometry args={[0.025, 0.1, 5]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* Arms holding the Acorn */}
        <group ref={armLRef} position={[-0.14, 0.32, 0.08]} rotation={[0.4, 0, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.22, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
        <group ref={armRRef} position={[0.14, 0.32, 0.08]} rotation={[0.4, 0, -0.3]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.22, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>

        {/* THE GIANT GLOWING GOLDEN PREHISTORIC ACORN (মহামূল্যবান বাদাম) */}
        <group ref={acornRef} position={[0, 0.25, 0.26]}>
          {/* Acorn Polished Golden Nut Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial
              color="#eab308"
              emissive="#ca8a04"
              emissiveIntensity={0.55}
              roughness={0.25}
              metalness={0.3}
            />
          </mesh>
          {/* Acorn Pointed Bottom Tip */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.1, 6]} />
            <meshStandardMaterial color="#ca8a04" emissive="#ca8a04" emissiveIntensity={0.4} />
          </mesh>
          {/* Dark Oak Textured Cupule Cap */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.17, 0.15, 0.1, 10]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Curved Acorn Stem */}
          <mesh position={[0, 0.18, 0]} rotation={[0.2, 0, 0.3]}>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 5]} />
            <meshStandardMaterial color="#3b1a08" />
          </mesh>
        </group>

        {/* Big Bushy S-Curved Squirrel Tail (লেজ) */}
        <group ref={tailRef} position={[0, 0.16, -0.16]} rotation={[0.6, 0, 0]}>
          <mesh castShadow position={[0, 0.25, -0.08]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.07, 0.45, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, 0.45, 0.05]} rotation={[0.6, 0, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.9} />
          </mesh>
        </group>

        {/* Hind Paws */}
        {[-0.1, 0.1].map((px, i) => (
          <mesh key={i} position={[px, 0.04, 0.02]}>
            <boxGeometry args={[0.08, 0.06, 0.16]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        ))}
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 3. LIVING WOOLLY MAMMOTH — "MANNY" (বিশালাকায় জীবন্ত পশমি ম্যামথ — শুঁড় নেড়ে ঘাস খাওয়া)
// ══════════════════════════════════════════════════════════════════════════
function LivingWoollyMammoth({ position = [9.5, 0.12, 17.0] }: { position?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const trunkBaseRef = useRef<THREE.Group>(null);
  const trunkMidRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Group>(null);
  const earRRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const legFLRef = useRef<THREE.Group>(null);
  const legFRRef = useRef<THREE.Group>(null);
  const legBLRef = useRef<THREE.Group>(null);
  const legBRRef = useRef<THREE.Group>(null);
  const trumpetCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    trumpetCooldown.current -= dt;

    // Slow, majestic patrol stroll across the North tundra meadow (Radius ~ 4m, Period ~ 24s)
    const patrolAngle = t * 0.16;
    const posX = position[0] + Math.cos(patrolAngle) * 3.5;
    const posZ = position[2] + Math.sin(patrolAngle) * 2.8;
    rootRef.current.position.set(posX, position[1], posZ);
    rootRef.current.rotation.y = -patrolAngle + Math.PI;

    // Heavy majestic leg stride
    const stride = Math.sin(t * 2.2);
    if (legFLRef.current) legFLRef.current.rotation.x = stride * 0.22;
    if (legFRRef.current) legFRRef.current.rotation.x = -stride * 0.22;
    if (legBLRef.current) legBLRef.current.rotation.x = -stride * 0.22;
    if (legBRRef.current) legBRRef.current.rotation.x = stride * 0.22;

    // Rhythmic body sway & shoulder bob
    rootRef.current.position.y = position[1] + Math.abs(Math.sin(t * 4.4)) * 0.08;

    // Head bobbing & ear flapping
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.12;
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    }
    if (earLRef.current) earLRef.current.rotation.y = 0.3 + Math.sin(t * 2.5) * 0.15;
    if (earRRef.current) earRRef.current.rotation.y = -0.3 - Math.sin(t * 2.5) * 0.15;

    // Articulated Trunk Grazing / Curling Motion
    if (trunkBaseRef.current) {
      trunkBaseRef.current.rotation.x = 0.35 + Math.sin(t * 1.8) * 0.35;
    }
    if (trunkMidRef.current) {
      trunkMidRef.current.rotation.x = 0.5 + Math.sin(t * 2.2 + 0.5) * 0.45;
    }

    // Tail swish
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3.0) * 0.35;
    }

    // Greet player with trumpet roar if player runs close (< 4.2m)
    const distToPlayer = Math.hypot(
      playerTransform.position.x - (85 + posX),
      playerTransform.position.z - (65 + posZ)
    );
    if (distToPlayer < 4.2 && trumpetCooldown.current <= 0) {
      audioManager.playMammothTrumpet();
      trumpetCooldown.current = 8.0;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Massive Shaggy Body with Shoulder Hump (বিশাল শরীর ও কুঁজ) */}
      <mesh castShadow position={[0, 2.1, 0]}>
        <sphereGeometry args={[1.5, 14, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* High Shoulder Hump */}
      <mesh castShadow position={[0, 2.7, 0.4]}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.9} />
      </mesh>

      {/* Shaggy Head with Domed Crown */}
      <group ref={headRef} position={[0, 2.8, 1.4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.95, 12, 12]} />
          <meshStandardMaterial color="#5c2c16" roughness={0.9} />
        </mesh>
        {/* Furry Head Crown */}
        <mesh position={[0, 0.65, -0.1]}>
          <sphereGeometry args={[0.65, 8, 8]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.95} />
        </mesh>

        {/* Eyes */}
        {[-0.62, 0.62].map((ex, i) => (
          <mesh key={i} position={[ex, 0.15, 0.65]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}

        {/* Flapping Furry Ears */}
        <group ref={earLRef} position={[-0.85, 0.2, -0.3]}>
          <mesh position={[-0.2, -0.25, 0]}>
            <boxGeometry args={[0.15, 0.75, 0.55]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        </group>
        <group ref={earRRef} position={[0.85, 0.2, -0.3]}>
          <mesh position={[0.2, -0.25, 0]}>
            <boxGeometry args={[0.15, 0.75, 0.55]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        </group>

        {/* Giant Sweeping Ivory Tusks (বিশাল বাঁকানো গজদন্ত) */}
        {[-0.55, 0.55].map((tx, i) => (
          <group key={i} position={[tx, -0.25, 0.6]} rotation={[0.4, i === 0 ? 0.35 : -0.35, i === 0 ? 0.4 : -0.4]}>
            <mesh castShadow position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.12, 0.22, 1.8, 8]} />
              <meshStandardMaterial color="#fffbeb" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh castShadow position={[i === 0 ? 0.35 : -0.35, 1.9, -0.2]} rotation={[0.4, 0, i === 0 ? -0.5 : 0.5]}>
              <coneGeometry args={[0.12, 1.2, 8]} />
              <meshStandardMaterial color="#fef08a" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Articulated Multi-Segment Grazing Trunk (নড়াচড়া করা শুঁড়) */}
        <group ref={trunkBaseRef} position={[0, -0.35, 0.75]}>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.28, 0.22, 1.0, 8]} />
            <meshStandardMaterial color="#5c2c16" roughness={0.8} />
          </mesh>
          <group ref={trunkMidRef} position={[0, -0.9, 0]}>
            <mesh position={[0, -0.45, 0]}>
              <cylinderGeometry args={[0.22, 0.15, 0.9, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* Trunk Tip Nostril */}
            <mesh position={[0, -0.9, 0.05]}>
              <coneGeometry args={[0.15, 0.35, 7]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 4 Massive Pillar Legs (ভারী থামের মতো পা) */}
      <group ref={legFLRef} position={[-0.9, 1.1, 0.8]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.34, 0.42, 1.4, 10]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      </group>
      <group ref={legFRRef} position={[0.9, 1.1, 0.8]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.34, 0.42, 1.4, 10]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      </group>
      <group ref={legBLRef} position={[-0.85, 1.0, -0.8]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.32, 0.4, 1.4, 10]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      </group>
      <group ref={legBRRef} position={[0.85, 1.0, -0.8]}>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.32, 0.4, 1.4, 10]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      </group>

      {/* Shaggy Tail with Tuft */}
      <group ref={tailRef} position={[0, 2.0, -1.4]} rotation={[-0.3, 0, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.9, 6]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#3b1a08" />
        </mesh>
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 4. SABER-TOOTHED TIGER — "DIEGO" (সাবেরা-টুথ চিতা — গুহার সামনে সতর্ক পাহারা)
// ══════════════════════════════════════════════════════════════════════════
function ProwlingSabertoothTiger({ position = [13.2, 0.12, 11.2] }: { position?: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const legFLRef = useRef<THREE.Group>(null);
  const legFRRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    const t = state.clock.elapsedTime;

    // Prowling back and forth along the rocky cavern threshold
    const walkP = Math.sin(t * 0.8);
    rootRef.current.position.z = position[2] + walkP * 2.2;
    rootRef.current.rotation.y = walkP > 0 ? 0.2 : Math.PI - 0.2;

    // Smooth feline leg strides
    const stride = Math.sin(t * 4.0);
    if (legFLRef.current) legFLRef.current.rotation.x = stride * 0.35;
    if (legFRRef.current) legFRRef.current.rotation.x = -stride * 0.35;

    // Sinuous predatory tail swish
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3.5) * 0.45;
      tailRef.current.rotation.z = Math.sin(t * 2.0) * 0.2;
    }

    // Head stalking & looking for prey
    if (headRef.current) {
      headRef.current.rotation.x = 0.15 + Math.sin(t * 2.5) * 0.1;
      headRef.current.rotation.y = Math.sin(t * 1.2) * 0.25;
    }
  });

  return (
    <group ref={rootRef} position={position}>
      {/* Sleek Muscular Tawny Feline Torso */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[0.55, 0.52, 1.4]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>
      {/* Creamy Underbelly */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.48, 0.18, 1.25]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.8} />
      </mesh>

      {/* Fierce Cat Head with Iconic Curved Dagger Saber Teeth */}
      <group ref={headRef} position={[0, 0.95, 0.7]}>
        <mesh castShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[0.46, 0.38, 0.45]} />
          <meshStandardMaterial color="#b45309" roughness={0.65} />
        </mesh>
        {/* Muzzle */}
        <mesh position={[0, -0.02, 0.25]}>
          <boxGeometry args={[0.34, 0.24, 0.28]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
        {/* Black Nose */}
        <mesh position={[0, 0.05, 0.39]}>
          <boxGeometry args={[0.1, 0.08, 0.06]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* FAMOUS SABER-TOOTH CURVED FANGS (বিশাল বাঁকানো শিকারি দাঁত) */}
        {[-0.12, 0.12].map((fx, i) => (
          <mesh key={i} position={[fx, -0.22, 0.32]} rotation={[0.2, i === 0 ? 0.08 : -0.08, 0]}>
            <coneGeometry args={[0.038, 0.36, 6]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.25} />
          </mesh>
        ))}

        {/* Predatory Amber Eyes */}
        {[-0.15, 0.15].map((ex, i) => (
          <mesh key={i} position={[ex, 0.16, 0.22]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.6} />
          </mesh>
        ))}

        {/* Pricked Feline Ears */}
        {[-0.18, 0.18].map((rx, i) => (
          <mesh key={i} position={[rx, 0.3, -0.05]} rotation={[-0.2, 0, rx > 0 ? -0.2 : 0.2]}>
            <coneGeometry args={[0.06, 0.14, 4]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        ))}
      </group>

      {/* Front Prowling Legs */}
      <group ref={legFLRef} position={[-0.24, 0.4, 0.45]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.55, 0.16]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>
      <group ref={legFRRef} position={[0.24, 0.4, 0.45]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.55, 0.16]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>

      {/* Back Muscular Legs */}
      <mesh position={[-0.24, 0.26, -0.45]}>
        <boxGeometry args={[0.16, 0.55, 0.18]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0.24, 0.26, -0.45]}>
        <boxGeometry args={[0.16, 0.55, 0.18]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>

      {/* Sinuous Flicking Tail */}
      <group ref={tailRef} position={[0, 0.75, -0.7]} rotation={[-0.8, 0, 0]}>
        <mesh position={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.05, 0.04, 0.75, 6]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
        <mesh position={[0, 0, -0.74]}>
          <sphereGeometry args={[0.065, 6, 6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 5. GIANT GROUND SLOTH — "SID" (প্রাগৈতিহাসিক অলস স্লথ — বরফে আয়েশ ও পেট চুলকানো)
// ══════════════════════════════════════════════════════════════════════════
function LoungingGroundSloth({ position = [-6.8, 0.12, 8.5] }: { position?: [number, number, number] }) {
  const headRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Comical belly scratch rhythm with long front claws
    if (armRRef.current) {
      armRRef.current.rotation.z = -0.5 + Math.sin(t * 4.5) * 0.35;
      armRRef.current.rotation.x = 0.8 + Math.cos(t * 4.5) * 0.25;
    }

    // Lazy arm wave & icicle nibble
    if (armLRef.current) {
      armLRef.current.rotation.z = 0.4 + Math.sin(t * 1.5) * 0.4;
      armLRef.current.rotation.y = Math.cos(t * 1.5) * 0.3;
    }

    // Goofy sleepy head nodding
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.0) * 0.4;
      headRef.current.rotation.z = Math.sin(t * 0.6) * 0.15;
    }
  });

  return (
    <group position={position} rotation={[0, 0.8, 0]}>
      {/* Comfy Slanted Snowdrift Recliner Mound */}
      <mesh receiveShadow position={[0, 0.28, -0.2]}>
        <cylinderGeometry args={[0.9, 1.25, 0.55, 10]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* Sloth Body Reclined Back (হালকা হেলান দেওয়া শরীর) */}
      <group position={[0, 0.55, 0]} rotation={[-0.45, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.34, 0.65, 8, 12]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.85} />
        </mesh>
        {/* Creamy Belly */}
        <mesh position={[0, 0, 0.18]}>
          <sphereGeometry args={[0.26, 8, 8]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
        </mesh>

        {/* Goofy Sloth Head with Wide Eyes & Bulbous Snout */}
        <group ref={headRef} position={[0, 0.62, 0.15]}>
          <mesh castShadow position={[0, 0, 0]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.8} />
          </mesh>
          {/* Bulbous Snout */}
          <mesh position={[0, -0.04, 0.18]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#78716c" roughness={0.7} />
          </mesh>
          {/* Wide-Set Goofy Googly Eyes */}
          {[-0.14, 0.14].map((ex, i) => (
            <group key={i} position={[ex, 0.1, 0.14]}>
              <mesh>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <sphereGeometry args={[0.024, 6, 6]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>
          ))}
          {/* Hanging Droopy Tooth */}
          <mesh position={[0.04, -0.15, 0.22]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.02, 0.06, 4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Lanky Arms with Iconic Long Sloth Claws */}
        <group ref={armLRef} position={[-0.38, 0.35, 0.1]}>
          <mesh position={[-0.15, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.5, 6]} />
            <meshStandardMaterial color="#a8a29e" />
          </mesh>
          {/* 3 Curved Claws */}
          {[-0.04, 0, 0.04].map((cx, i) => (
            <mesh key={i} position={[-0.15 + cx, -0.48, 0.04]} rotation={[0.5, 0, 0]}>
              <coneGeometry args={[0.015, 0.14, 4]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          ))}
        </group>

        <group ref={armRRef} position={[0.38, 0.35, 0.1]}>
          <mesh position={[0.15, -0.2, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.5, 6]} />
            <meshStandardMaterial color="#a8a29e" />
          </mesh>
          {/* 3 Curved Claws scratching belly! */}
          {[-0.04, 0, 0.04].map((cx, i) => (
            <mesh key={i} position={[0.15 + cx, -0.48, 0.04]} rotation={[0.5, 0, 0]}>
              <coneGeometry args={[0.015, 0.14, 4]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          ))}
        </group>

        {/* Splayed Out Lazy Feet */}
        {[-0.24, 0.24].map((fx, i) => (
          <mesh key={i} position={[fx, -0.45, 0.22]} rotation={[0.4, i === 0 ? -0.3 : 0.3, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.32]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        ))}
      </group>
    </group>
  );
}


// ══════════════════════════════════════════════════════════════════════════
// 6. MASTER COMPONENT: ICE AGE ANIMALS KINGDOM (লেভেল ২ এর জীবন্ত প্রাণী সাম্রাজ্য)
// ══════════════════════════════════════════════════════════════════════════
export function IceAgeAnimals() {
  return (
    <group>
      {/* ── 1. The Penguin Colony (3 Animated Penguins Doing Jobs) ── */}
      {/* Penguin Pip: Fishing at ice hole & waddling with fish to bucket */}
      <WaddlingFisherPenguin startPos={[14.0, 0.12, -14.5]} />
      {/* Penguin Pudge: Belly-sliding across the slick ice into the lagoon */}
      <BellySlidePenguin originPos={[17.5, 0.12, -16.0]} />
      {/* Penguin Percy: Standing on lookout rock podium flapping wings */}
      <LookoutPenguin position={[-9.5, 0.12, -14.5]} />

      {/* ── 2. The Frantic Saber-Toothed Squirrel Scrat (Acorn Hammering & Panic) ── */}
      <FranticScratSquirrel position={[-6.2, 0.12, -7.5]} />

      {/* ── 3. The Living Woolly Mammoth Manny (Trunk Grazing & Stroll) ── */}
      <LivingWoollyMammoth position={[9.5, 0.12, 17.0]} />

      {/* ── 4. The Prowling Saber-Toothed Tiger Diego (Cavern Ledge Prowl) ── */}
      <ProwlingSabertoothTiger position={[13.2, 0.12, 11.2]} />

      {/* ── 5. The Giant Ground Sloth Sid (Snowdrift Lounger & Belly Scratch) ── */}
      <LoungingGroundSloth position={[-6.8, 0.12, 8.5]} />
    </group>
  );
}

