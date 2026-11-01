import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lukaoStore, BotState, GameState } from './game-state';
import { collisionWorld } from './collision-system';
import { playerTransform, gameEngine } from './game-engine-state';

// Designated hiding spots around the Lukao arena
const HIDING_WAYPOINTS: [number, number, number][] = [
  [12, 0.75, 11],    // Bush Grove
  [-11, 0.75, 8.5],  // Crate Yard nook
  [-2, 0.75, -13],   // Arch Tunnel interior
  [-16, 0.75, -8],   // Far Bush Grove
  [-9, 1.2, -9],     // Raised platform
];

// Seeker patrol route waypoints
const SEEKER_PATROL_ROUTE: [number, number, number][] = [
  [14, 0.8, -12],    // Seeker Tower
  [0, 0.75, 0],      // Center Plaza
  [-11, 0.75, 7],    // Crate Yard entrance
  [-2, 0.75, -11],   // Tunnel exterior
  [10, 0.75, 9],     // Bush Grove exterior
  [-8, 0.75, -7],    // Stepping pads
];

export function AIBots() {
  const [gameState, setGameState] = useState<GameState>(() => lukaoStore.getState());

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      setGameState({ ...lukaoStore.getState() });
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <group>
      {gameState.bots.map((bot, idx) => (
        <AIBotCharacter
          key={bot.id}
          bot={bot}
          index={idx}
          gameState={gameState}
        />
      ))}
    </group>
  );
}

function AIBotCharacter({
  bot,
  index,
  gameState,
}: {
  bot: BotState;
  index: number;
  gameState: GameState;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Bot AI state
  const pos = useRef(new THREE.Vector3(...bot.position));
  const targetPos = useRef(new THREE.Vector3(...bot.position));
  const currentRotation = useRef(0);
  const walkCycle = useRef(Math.random() * Math.PI);
  const patrolIndex = useRef(index % SEEKER_PATROL_ROUTE.length);
  const isCrouched = useRef(false);

  // Setup initial targets
  useEffect(() => {
    if (bot.role === 'hider') {
      const spot = HIDING_WAYPOINTS[index % HIDING_WAYPOINTS.length];
      targetPos.current.set(...spot);
    } else {
      // Seeker starts at tower
      pos.current.set(14, 0.8, -12);
      targetPos.current.set(14, 0.8, -12);
    }
  }, [gameState.phase, bot.role, index]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05) * gameEngine.timeScale;

    // If game over, tagged, or paused in menu, stay put in idle
    if (gameState.phase === 'game_over' || bot.isTagged || lukaoStore.getState().isMenuOpen) {
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(walkCycle.current) * 0.05;
      }
      return;
    }

    const playerPos = playerTransform.position;
    const distToPlayer = pos.current.distanceTo(playerPos);

    // ─────────────────────────────────────────────────────────
    // 1. AI LOGIC: SEEKER BOT (Hunter-9)
    // ─────────────────────────────────────────────────────────
    if (bot.role === 'seeker') {
      if (gameState.phase === 'hiding') {
        // Seeker is counting down at the tower! Rotate in place
        currentRotation.current += dt * 0.8;
        groupRef.current.rotation.y = currentRotation.current;
        return;
      }

      // In Seeking Phase: Patrol or Chase!
      let speed = 5.5;
      const isPlayerExposed = gameState.stealthStatus === 'exposed';
      const playerInSight = distToPlayer < 7.5 && isPlayerExposed;

      // Heartbeat trigger if within 9m (only dispatch when state changes)
      const shouldAlert = distToPlayer < 9.0;
      if (gameState.alertNearby !== shouldAlert) {
        lukaoStore.getState().setAlertNearby(shouldAlert);
      }

      // Catch player collision check!
      if (distToPlayer < 1.6 && gameState.role === 'hider') {
        lukaoStore.getState().tagPlayer();
        return;
      }

      // Check if Seeker is chasing player or patrolling waypoints
      if (playerInSight) {
        speed = 7.0; // Chase speed!
        targetPos.current.copy(playerPos);
      } else {
        // Continue patrol route
        const distToWaypoint = pos.current.distanceTo(targetPos.current);
        if (distToWaypoint < 1.5) {
          patrolIndex.current = (patrolIndex.current + 1) % SEEKER_PATROL_ROUTE.length;
          targetPos.current.set(...SEEKER_PATROL_ROUTE[patrolIndex.current]);
        }
      }

      // Move toward target
      const moveDir = new THREE.Vector3().subVectors(targetPos.current, pos.current);
      moveDir.y = 0;
      if (moveDir.length() > 0.2) {
        moveDir.normalize();
        pos.current.x += moveDir.x * speed * dt;
        pos.current.z += moveDir.z * speed * dt;

        // Facing
        currentRotation.current = Math.atan2(moveDir.x, moveDir.z);
        walkCycle.current += dt * 14;
      }
    }

    // ─────────────────────────────────────────────────────────
    // 2. AI LOGIC: HIDER BOTS (Pip, Milo, Kiko)
    // ─────────────────────────────────────────────────────────
    if (bot.role === 'hider') {
      let speed = 6.0;

      // Distance to chosen hiding spot
      const distToHidingSpot = pos.current.distanceTo(targetPos.current);

      if (distToHidingSpot > 0.6) {
        // Running to hiding spot
        const moveDir = new THREE.Vector3().subVectors(targetPos.current, pos.current);
        moveDir.y = 0;
        moveDir.normalize();

        pos.current.x += moveDir.x * speed * dt;
        pos.current.z += moveDir.z * speed * dt;
        currentRotation.current = Math.atan2(moveDir.x, moveDir.z);
        walkCycle.current += dt * 13;
        isCrouched.current = false;
      } else {
        // Reached hiding spot! Crouch down & hide
        isCrouched.current = true;

        // If player is the Seeker and is chasing this bot, panic & flee!
        if (gameState.role === 'seeker' && gameState.phase === 'seeking' && distToPlayer < 3.8) {
          const fleeDir = new THREE.Vector3().subVectors(pos.current, playerPos).normalize();
          pos.current.x += fleeDir.x * 6.5 * dt;
          pos.current.z += fleeDir.z * 6.5 * dt;
          currentRotation.current = Math.atan2(fleeDir.x, fleeDir.z);
          walkCycle.current += dt * 16;
          isCrouched.current = false;
        }
      }

      // If player is Seeker, check if this bot can be tagged
      if (gameState.role === 'seeker' && gameState.phase === 'seeking' && !bot.isTagged) {
        if (distToPlayer <= 2.2) {
          if (gameState.nearbyTargetId !== bot.id) {
            lukaoStore.getState().setNearbyTarget(bot.id);
          }
        } else if (gameState.nearbyTargetId === bot.id) {
          lukaoStore.getState().setNearbyTarget(null);
        }
      }
    }

    // Keep bot on surface height
    const surfaceY = collisionWorld.getSurfaceHeight(pos.current.x, pos.current.z, pos.current.y);
    pos.current.y = surfaceY + (isCrouched.current ? 0.45 : 0.75);

    // Apply to mesh
    groupRef.current.position.copy(pos.current);
    groupRef.current.rotation.y = currentRotation.current;

    // Limb animations
    if (leftLegRef.current && rightLegRef.current) {
      if (!isCrouched.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle.current) * 0.55;
        rightLegRef.current.rotation.x = -Math.sin(walkCycle.current) * 0.55;
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }

    if (bodyRef.current) {
      bodyRef.current.scale.set(
        isCrouched.current ? 1.15 : 1,
        isCrouched.current ? 0.65 : 1,
        isCrouched.current ? 1.15 : 1
      );
    }
  });

  const isSeeker = bot.role === 'seeker';
  const isTagged = bot.isTagged;

  return (
    <group ref={groupRef} position={bot.position}>
      {/* 3D Floating Role Indicator (Shrinks/dims when crouching in bushes for stealth!) */}
      <group position={[0, isSeeker ? 1.4 : 1.15, 0]}>
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <octahedronGeometry args={[isSeeker ? 0.16 : 0.12, 0]} />
          <meshStandardMaterial
            color={isTagged ? '#718096' : isSeeker ? '#e53e3e' : bot.color}
            emissive={isTagged ? '#000000' : isSeeker ? '#e53e3e' : bot.color}
            emissiveIntensity={isTagged ? 0 : isCrouched.current ? 0.1 : 0.9}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Main Bot Body */}
      <group ref={bodyRef}>
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.34, 0.48, 12, 16]} />
          <meshStandardMaterial
            color={isTagged ? '#718096' : bot.color}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>

        {/* Visor / Goggles */}
        <mesh position={[0, 0.38, 0.28]}>
          <boxGeometry args={[0.38, 0.16, 0.12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.38, 0.34]}>
          <boxGeometry args={[0.34, 0.12, 0.04]} />
          <meshStandardMaterial
            color={isSeeker ? '#feb2b2' : '#90cdf4'}
            emissive={isSeeker ? '#e53e3e' : '#4299e1'}
            emissiveIntensity={isTagged ? 0.1 : 0.8}
          />
        </mesh>

        {/* Seeker Spotlight Cone */}
        {isSeeker && !isTagged && (
          <group position={[0, 0.38, 0.35]}>
            <mesh position={[0, -0.2, 2.2]} rotation={[Math.PI / 2 + 0.1, 0, 0]}>
              <coneGeometry args={[1.2, 4.5, 16, 1, true]} />
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

        {/* Tagged Halo Ring */}
        {isTagged && (
          <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35, 0.04, 8, 20]} />
            <meshStandardMaterial color="#ecc94b" emissive="#ecc94b" emissiveIntensity={0.6} />
          </mesh>
        )}
      </group>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.18, -0.18, 0]}>
        <mesh castShadow position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.09, 0.22, 6, 8]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.18, -0.18, 0]}>
        <mesh castShadow position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.09, 0.22, 6, 8]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      </group>

      {/* Shadow */}
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.25} transparent />
      </mesh>
    </group>
  );
}
