import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { collisionWorld } from './collision-system';
import { gameEngine, playerTransform } from './game-engine-state';
import { lukaoStore } from './game-state';
import { inputState } from './input-manager';

export function PlayerCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const scannerLightRef = useRef<THREE.SpotLight>(null);

  // Kinematic Physics State
  const position = useRef(new THREE.Vector3(0, 0.75, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const walkCycle = useRef(0);
  const crouchAmount = useRef(0);

  // Speed and Physics Constants
  const BASE_SPEED = 8.5;
  const SPRINT_MULTIPLIER = 1.45;
  const CROUCH_MULTIPLIER = 0.5;
  const JUMP_FORCE = 7.5;
  const GRAVITY = -20.0;
  const MAX_STEP_UP = 0.5; // step up small obstacles automatically

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05) * gameEngine.timeScale;
    const store = lukaoStore.getState();

    // Freeze player if game over or paused in menu
    if (store.phase === 'game_over') return;
    if (store.isMenuOpen) {
      groupRef.current.position.copy(position.current);
      playerTransform.position.copy(position.current);
      return;
    }
    if (store.role === 'seeker' && store.phase === 'hiding') {
      position.current.set(14, 0.8, -12);
      groupRef.current.position.copy(position.current);
      playerTransform.position.copy(position.current);
      return;
    }

    // 1. Gather Screen-Space Directional Input
    let inputForward = 0;
    let inputRight = 0;

    if (inputState.forward) inputForward += 1;
    if (inputState.backward) inputForward -= 1;
    if (inputState.right) inputRight += 1;
    if (inputState.left) inputRight -= 1;

    // Add virtual joystick input (analog: joystickY > 0 is up/forward, joystickX > 0 is right)
    if (Math.abs(inputState.joystickX) > 0.05 || Math.abs(inputState.joystickY) > 0.05) {
      inputRight += inputState.joystickX;
      inputForward += inputState.joystickY;
    }

    const inputLen = Math.hypot(inputRight, inputForward);
    const isMoving = inputLen > 0.05;
    const isCrouching = inputState.crouch;

    // Smooth crouch blend (0 = standing, 1 = crouching)
    crouchAmount.current = THREE.MathUtils.lerp(
      crouchAmount.current,
      isCrouching ? 1 : 0,
      12 * dt
    );

    // Current effective speed
    let currentSpeed = BASE_SPEED;
    if (isCrouching) {
      currentSpeed *= CROUCH_MULTIPLIER;
    } else if (inputState.sprint) {
      currentSpeed *= SPRINT_MULTIPLIER;
    }

    // 2. Camera-Relative Movement
    // Regardless of how much the camera has circled (yaw angle),
    // Forward is always away from the camera, Right is always to the right of the screen.
    const yaw = inputState.cameraYaw;
    let worldMoveX = 0;
    let worldMoveZ = 0;

    if (isMoving) {
      const normRight = inputRight / inputLen;
      const normForward = inputForward / inputLen;

      // Project onto ground plane relative to camera view
      worldMoveX = normRight * Math.cos(yaw) - normForward * Math.sin(yaw);
      worldMoveZ = -normRight * Math.sin(yaw) - normForward * Math.cos(yaw);

      const inputMagnitude = Math.min(1.0, inputLen);
      const targetX = worldMoveX * currentSpeed * inputMagnitude;
      const targetZ = worldMoveZ * currentSpeed * inputMagnitude;

      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, targetX, 16 * dt);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, targetZ, 16 * dt);

      // Character faces world movement direction
      targetRotation.current = Math.atan2(worldMoveX, worldMoveZ);

      // Advance walk cycle
      const cycleSpeed = (isCrouching ? 8 : inputState.sprint ? 20 : 13) * inputMagnitude;
      walkCycle.current += dt * cycleSpeed;
    } else {
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, 14 * dt);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, 14 * dt);
      walkCycle.current = 0;
    }

    // 3. Jump and Gravity
    if (inputState.jump && isGrounded.current && !isCrouching) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
      inputState.jump = false;
    }

    velocity.current.y += GRAVITY * dt;

    // 4. Collision Detection & Movement Resolution
    const oldX = position.current.x;
    const oldZ = position.current.z;
    const desiredX = oldX + velocity.current.x * dt;
    const desiredZ = oldZ + velocity.current.z * dt;
    const desiredY = position.current.y + velocity.current.y * dt;

    // Resolve horizontal obstacle collisions
    const resolved = collisionWorld.resolveHorizontalCollisions(
      oldX,
      oldZ,
      desiredX,
      desiredZ,
      position.current.y
    );

    position.current.x = resolved.x;
    position.current.z = resolved.z;

    // Find the surface height underneath the player
    const surfaceY = collisionWorld.getSurfaceHeight(
      position.current.x,
      position.current.z,
      position.current.y
    );

    // Floor contact height adjusted for crouching
    const playerHalfHeight = THREE.MathUtils.lerp(0.75, 0.45, crouchAmount.current);
    const targetFloorY = surfaceY + playerHalfHeight;

    // Step-up / floor collision
    if (desiredY <= targetFloorY || (position.current.y <= targetFloorY + MAX_STEP_UP && velocity.current.y <= 0)) {
      position.current.y = targetFloorY;
      velocity.current.y = 0;
      isGrounded.current = true;
    } else {
      position.current.y = desiredY;
      isGrounded.current = false;
    }

    // 5. Smooth Angular Facing
    let diff = targetRotation.current - currentRotation.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentRotation.current += diff * Math.min(16 * dt, 1);

    groupRef.current.position.copy(position.current);
    groupRef.current.rotation.y = currentRotation.current;

    // 6. Character Rig Animations (Legs, Arms, Body Bob, Lean)
    const sinCycle = Math.sin(walkCycle.current);
    const cosCycle = Math.cos(walkCycle.current);

    if (bodyRef.current) {
      // Crouch scale compression
      bodyRef.current.scale.set(
        1 + crouchAmount.current * 0.15,
        1 - crouchAmount.current * 0.35,
        1 + crouchAmount.current * 0.15
      );

      if (isMoving && isGrounded.current) {
        bodyRef.current.position.y = Math.abs(sinCycle) * 0.12 - crouchAmount.current * 0.2;
        bodyRef.current.rotation.z = -sinCycle * 0.08; // banking roll
        bodyRef.current.rotation.x = isCrouching ? 0.3 : 0.15; // forward run/sneak lean
      } else if (!isGrounded.current) {
        // In-air jump posture
        bodyRef.current.position.y = 0.05;
        bodyRef.current.rotation.x = -0.15;
        bodyRef.current.rotation.z = 0;
      } else {
        // Idle breathing
        bodyRef.current.position.y = Math.sin(walkCycle.current) * 0.02 - crouchAmount.current * 0.2;
        bodyRef.current.rotation.x = isCrouching ? 0.2 : 0;
        bodyRef.current.rotation.z = 0;
      }
    }

    // Limb swinging
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving && isGrounded.current) {
        leftLegRef.current.rotation.x = sinCycle * 0.65;
        rightLegRef.current.rotation.x = -sinCycle * 0.65;
      } else if (!isGrounded.current) {
        // Legs tucked in jump
        leftLegRef.current.rotation.x = 0.4;
        rightLegRef.current.rotation.x = -0.2;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isMoving && isGrounded.current) {
        leftArmRef.current.rotation.x = -sinCycle * 0.7;
        rightArmRef.current.rotation.x = sinCycle * 0.7;
      } else if (!isGrounded.current) {
        // Arms up in air
        leftArmRef.current.rotation.x = -1.2;
        rightArmRef.current.rotation.x = -1.2;
      } else {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }

    // 7. Dynamic Stealth Proximity Detection
    const distToBushes = Math.hypot(position.current.x - 12, position.current.z - 11);
    const distToBushGrove2 = Math.hypot(position.current.x - (-16), position.current.z - (-8));
    const distToTunnel = Math.hypot(position.current.x - (-2), position.current.z - (-13));
    const distToVillage = Math.hypot(position.current.x - (-12), position.current.z - 9);
    const distToHaystack = Math.hypot(position.current.x - (-17.8), position.current.z - 6.8);

    let detectedStealth: 'hidden' | 'partially_hidden' | 'exposed' = 'exposed';
    if (
      distToBushes < 3.8 ||
      distToBushGrove2 < 3.5 ||
      distToHaystack < 3.8 ||
      (distToTunnel < 2.5 && position.current.y < 1.6)
    ) {
      detectedStealth = 'hidden';
    } else if (distToVillage < 5.8 || isCrouching) {
      detectedStealth = 'partially_hidden';
    }

    if (store.stealthStatus !== detectedStealth) {
      store.setStealthStatus(detectedStealth);
    }

    // Sync high-frequency coordinates without triggering React re-renders
    playerTransform.position.copy(position.current);
    playerTransform.rotation = currentRotation.current;
  });

  const isSeeker = lukaoStore.getState().role === 'seeker';

  return (
    <group ref={groupRef} position={[0, 0.75, 0]}>
      <group ref={bodyRef}>
        {/* Main Character Torso */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.38, 0.55, 16, 24]} />
          <meshStandardMaterial
            color={isSeeker ? '#e53e3e' : '#3182ce'}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Head / Helmet */}
        <group ref={headRef} position={[0, 0.52, 0]}>
          {/* Head Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.34, 20, 20]} />
            <meshStandardMaterial
              color={isSeeker ? '#c53030' : '#2b6cb0'}
              roughness={0.4}
            />
          </mesh>

          {/* Goggles / Eye Visor */}
          <mesh position={[0, 0.04, 0.28]}>
            <boxGeometry args={[0.42, 0.18, 0.15]} />
            <meshStandardMaterial color="#1a202c" roughness={0.1} metalness={0.9} />
          </mesh>

          {/* Glowing Visor Glass */}
          <mesh position={[0, 0.04, 0.35]}>
            <boxGeometry args={[0.38, 0.14, 0.04]} />
            <meshStandardMaterial
              color={isSeeker ? '#feb2b2' : '#bee3f8'}
              emissive={isSeeker ? '#e53e3e' : '#63b3ed'}
              emissiveIntensity={0.9}
            />
          </mesh>

          {/* Seeker Spotlight / Scanner Beam */}
          {isSeeker && (
            <group position={[0, 0, 0.4]}>
              {/* Visible Flashlight Cone Mesh */}
              <mesh position={[0, -0.3, 2.5]} rotation={[Math.PI / 2 + 0.1, 0, 0]}>
                <coneGeometry args={[1.4, 5, 20, 1, true]} />
                <meshBasicMaterial
                  color="#fed7d7"
                  transparent
                  opacity={0.15}
                  side={2}
                  depthWrite={false}
                />
              </mesh>
            </group>
          )}

          {/* Antenna with Pulsing Tip */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.2, 8]} />
            <meshStandardMaterial color="#718096" />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial
              color={isSeeker ? '#feb2b2' : '#faf089'}
              emissive={isSeeker ? '#e53e3e' : '#ecc94b'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>

        {/* Explorer Backpack */}
        <mesh castShadow position={[0, 0.15, -0.34]}>
          <boxGeometry args={[0.42, 0.42, 0.24]} />
          <meshStandardMaterial color="#d69e2e" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.32, -0.34]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
          <meshStandardMaterial color="#ed8936" roughness={0.7} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.45, 0.2, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.1, 0.28, 8, 12]} />
            <meshStandardMaterial color={isSeeker ? '#9b2c2c' : '#2c5282'} roughness={0.4} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.45, 0.2, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.1, 0.28, 8, 12]} />
            <meshStandardMaterial color={isSeeker ? '#9b2c2c' : '#2c5282'} roughness={0.4} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.2, -0.22, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.11, 0.26, 8, 12]} />
            <meshStandardMaterial color="#2d3748" roughness={0.6} />
          </mesh>
          {/* Shoe */}
          <mesh castShadow position={[0, -0.36, 0.05]}>
            <boxGeometry args={[0.18, 0.12, 0.26]} />
            <meshStandardMaterial color="#ecc94b" roughness={0.5} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.2, -0.22, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.11, 0.26, 8, 12]} />
            <meshStandardMaterial color="#2d3748" roughness={0.6} />
          </mesh>
          {/* Shoe */}
          <mesh castShadow position={[0, -0.36, 0.05]}>
            <boxGeometry args={[0.18, 0.12, 0.26]} />
            <meshStandardMaterial color="#ecc94b" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Dynamic Player Shadow */}
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color="#000000" opacity={0.35} transparent />
      </mesh>
    </group>
  );
}
