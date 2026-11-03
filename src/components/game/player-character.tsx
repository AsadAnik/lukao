import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { collisionWorld } from './collision-system';
import { balloonRide, dolphinRide, gameEngine, playerTransform } from './game-engine-state';
import { lukaoStore } from './game-state';
import { inputState } from './input-manager';
import { TALL_GRASS_PATCHES } from './tall-grass';
import { HILL_TALL_GRASS_PATCHES } from './hill-tall-grass';

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
  const isMovingRef = useRef(false);
  const jumpBuffer = useRef(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const walkCycle = useRef(0);
  const crouchAmount = useRef(0);
  const wasRidingDolphin = useRef(false);
  const wasFlyingBalloon = useRef(false);

  // Speed and Physics Constants (Tuned for responsive, snappy casual mobile control)
  const BASE_SPEED = 9.2;
  const SPRINT_MULTIPLIER = 1.55;
  const CROUCH_MULTIPLIER = 0.5;
  const JUMP_FORCE = 7.8;
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

    // Dolphin riding lock: mount player onto dolphin's back during ocean leaps
    if (dolphinRide.isRiding) {
      wasRidingDolphin.current = true;
      const heading = dolphinRide.dolphinRotation;
      position.current.copy(dolphinRide.dolphinPosition);
      position.current.y += 0.58;
      position.current.x += Math.sin(heading) * 0.12;
      position.current.z += Math.cos(heading) * 0.12;
      targetRotation.current = heading;
      currentRotation.current = heading;
      velocity.current.set(0, 0, 0);
      isGrounded.current = true;

      groupRef.current.position.copy(position.current);
      groupRef.current.rotation.y = currentRotation.current;
      playerTransform.position.copy(position.current);
      playerTransform.rotation = currentRotation.current;

      // Riding posture: arms holding on, forward lean
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.1;
        bodyRef.current.rotation.x = 0.25;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.8;
        rightArmRef.current.rotation.x = -0.8;
      }
      return;
    }

    // Seamless dismount transition: restore physical standing posture and sync coordinates
    if (wasRidingDolphin.current) {
      wasRidingDolphin.current = false;
      position.current.copy(playerTransform.position);
      velocity.current.set(0, 0, 0);
      if (bodyRef.current) {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.x = 0;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }

    // Hot air balloon riding lock: mount player inside wicker passenger basket during aerial flight
    if (balloonRide.isFlying) {
      wasFlyingBalloon.current = true;
      const heading = balloonRide.balloonRotation;
      position.current.copy(balloonRide.balloonPosition);
      position.current.y += 0.90; // Standing inside wicker basket (0.15 floor + 0.75 player capsule center)
      targetRotation.current = heading;
      currentRotation.current = heading;
      velocity.current.set(0, 0, 0);
      isGrounded.current = true;

      groupRef.current.position.copy(position.current);
      groupRef.current.rotation.y = currentRotation.current;
      playerTransform.position.copy(position.current);
      playerTransform.rotation = currentRotation.current;

      // Flight posture: standing upright in basket, arms resting on railing
      if (bodyRef.current) {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.x = 0;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.35;
        rightArmRef.current.rotation.x = -0.35;
      }
      return;
    }

    // Seamless balloon dismount transition: sync coordinates to landing location and clear velocity
    if (wasFlyingBalloon.current) {
      wasFlyingBalloon.current = false;
      position.current.copy(playerTransform.position);
      velocity.current.set(0, 0, 0);
      isGrounded.current = true;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.x = 0;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
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
    isMovingRef.current = isMoving;
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

    // 3. Jump Buffer & Gravity (Responsive 140ms input window)
    if (inputState.jump) {
      jumpBuffer.current = 0.14;
      inputState.jump = false;
    }

    if (jumpBuffer.current > 0) {
      jumpBuffer.current -= dt;
      if (isGrounded.current) {
        if (isCrouching) {
          inputState.crouch = false;
        }
        velocity.current.y = JUMP_FORCE;
        isGrounded.current = false;
        jumpBuffer.current = 0;
      }
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

    // Check if player is inside any Tall Long Grass / Kashful Grove (কাশফুলের বন)
    const inTallGrass = TALL_GRASS_PATCHES.some(
      ([gx, _, gz]) => Math.hypot(position.current.x - gx, position.current.z - gz) < 1.7
    );

    // Check if player is shaded under the Grand Mango Tree (আম গাছের ছায়ায়)
    const distToMango = Math.hypot(position.current.x - 15.5, position.current.z - (-2.5));
    const underMangoTree = distToMango < 3.0;

    // Level 2: Expansive Ice Age Island Unpredictable Hiding Spots (হিমেল দ্বীপের বৈচিত্র্যময় গোপন স্থান)
    // 1. Secret Grotto Behind Massive Waterfall [71.0, 86.5]
    const distToWaterfallGrotto = Math.hypot(position.current.x - 71.0, position.current.z - 86.5);
    const inWaterfallGrotto = distToWaterfallGrotto < 3.2;

    // 2. Giant Woolly Mammoth Skeleton & Ribcage Walk-Through Tunnel [98.5, 58.5]
    const distToMammothTunnel = Math.hypot(position.current.x - 98.5, position.current.z - 58.5);
    const inMammothTunnel = distToMammothTunnel < 3.4;

    // 3. Deep Glacial Crevasse Trench & Underpass [70.0, 60.0]
    const distToCrevasse = Math.hypot(position.current.x - 70.0, position.current.z - 60.0);
    const inCrevasse = distToCrevasse < 5.0 && position.current.y < 0.65;

    // 4. Multi-Chamber Sabertooth Cavern [101.5, 78.5]
    const distToSabertoothCave = Math.hypot(position.current.x - 101.5, position.current.z - 78.5);
    const inSabertoothCave = distToSabertoothCave < 3.8;

    // 5. Camouflaged Snowmen Decoy Grove [73.5, 46.5]
    const distToSnowmen = Math.hypot(position.current.x - 73.5, position.current.z - 46.5);
    const inSnowmenDecoy = distToSnowmen < 3.2 && (isCrouching || position.current.y < 0.9);

    // 6. Frost Citadel Castle Interactive Woody Hideouts (তুষার প্রাসাদের ভেতরের কাঠের লুকানোর স্থান)
    // A. Inside the Walk-In Almira / Wardrobe [78.2, 71.7]
    const distToAlmira = Math.hypot(position.current.x - 78.2, position.current.z - 71.7);
    const insideAlmira = distToAlmira < 1.45;

    // B. Under the Long Banquet Feast Table [80.4, 65.5]
    const distToBanquetTable = Math.hypot(position.current.x - 80.4, position.current.z - 65.5);
    const underBanquetTable = distToBanquetTable < 1.85 && (isCrouching || position.current.y < 0.95);

    // C. Behind Wardrobe Drawers Bureau [80.8, 73.5]
    const distToDrawers = Math.hypot(position.current.x - 80.8, position.current.z - 73.5);
    const behindDrawers = distToDrawers < 1.45 && isCrouching;

    // D. Secret Library Bookshelf Alcove [89.8, 71.7]
    const distToBookshelf = Math.hypot(position.current.x - 89.8, position.current.z - 71.7);
    const behindBookshelf = distToBookshelf < 1.45;

    // E. Behind Treasury Gold Chest & Barrels [88.2, 65.3]
    const distToTreasury = Math.hypot(position.current.x - 88.2, position.current.z - 65.3);
    const behindTreasury = distToTreasury < 1.5 && isCrouching;

    // F. General Castle Woody Interior
    const insideCastle = position.current.x >= 77.2 && position.current.x <= 90.8 && position.current.z >= 62.8 && position.current.z <= 74.2;

    // G. Ice Age Animals Cover (ম্যামথ ও পেঙ্গুইন কলোনির আড়াল)
    const distToMammothHerd = Math.hypot(position.current.x - 94.5, position.current.z - 82.0);
    const nearMammoth = distToMammothHerd < 3.4 && isCrouching;

    const distToPenguinColony = Math.hypot(position.current.x - 100.0, position.current.z - 50.0);
    const nearPenguins = distToPenguinColony < 3.2 && isCrouching;

    // ── Level 3: Al-Dahna Desert World & Pyramid Cover Zones ──
    // A. Inside Egyptian Royal Walk-In Almira [-95.6, 84.0] (100% hidden inside robes)
    const distToPyramidAlmira = Math.hypot(position.current.x - (-95.6), position.current.z - 84.0);
    const insidePyramidAlmira = distToPyramidAlmira < 1.45;

    // B. Under Royal Canopy Daybed [-92.8, 86.3] (crawlspace)
    const distToCanopyDaybed = Math.hypot(position.current.x - (-92.8), position.current.z - 86.3);
    const underCanopyDaybed = distToCanopyDaybed < 1.55 && (isCrouching || position.current.y < 0.95);

    // C. Under Pharaoh Feast Banquet Table [-85.0, 76.7] (crawlspace)
    const distToPyramidFeastTable = Math.hypot(position.current.x - (-85.0), position.current.z - 76.7);
    const underPyramidFeastTable = distToPyramidFeastTable < 1.85 && (isCrouching || position.current.y < 0.95);

    // D. Under/Behind Pharaoh's Sun Throne [-85.0, 84.3]
    const distToThrone = Math.hypot(position.current.x - (-85.0), position.current.z - 84.3);
    const underThrone = distToThrone < 1.45 && (isCrouching || position.current.y < 0.95);

    // E. Behind Treasury Chest & Amphoras [-75.5, 84.0]
    const distToTreasuryChest = Math.hypot(position.current.x - (-75.5), position.current.z - 84.0);
    const behindTreasuryChest = distToTreasuryChest < 1.6;

    // F. Behind Scribe Scroll Archives Bookshelves [-95.6, 70.5]
    const distToScrollArchives = Math.hypot(position.current.x - (-95.6), position.current.z - 70.5);
    const behindScrollArchives = distToScrollArchives < 1.5;

    // G. Secret Escape Passages (North Balcony Tunnel, West Oasis Shaft & Secret Bypass)
    const inNorthEscapeTunnel = Math.hypot(position.current.x - (-85.0), position.current.z - 90.3) < 1.8;
    const inWestEscapeTunnel = Math.hypot(position.current.x - (-96.8), position.current.z - 76.7) < 1.8;
    const inSecretBypassCorridor = position.current.z >= 87.5 && position.current.z <= 90.0 && position.current.x >= -96.0 && position.current.x <= -74.0;

    // H. Oasis Papyrus Reeds & Sunning Boulders [-92.5, 66.5]
    const distToOasisReeds = Math.hypot(position.current.x - (-92.5), position.current.z - 66.5);
    const inOasisReeds = distToOasisReeds < 3.8 && (isCrouching || position.current.y < 0.9);

    // I. Expansive 26m x 26m Pyramid 1 Palace [-96.8, -73.2] x [66.8, 90.2]
    const insidePyramid = position.current.x >= -96.8 && position.current.x <= -73.2 && position.current.z >= 66.8 && position.current.z <= 90.2;

    // J. Behind Desert Camel Caravan [-73.5, 67.0]
    const distToCamels = Math.hypot(position.current.x - (-73.5), position.current.z - 67.0);
    const nearCamels = distToCamels < 3.2 && isCrouching;

    // K. Pyramid 2 (Temple of Anubis): Walk-in Canopic Almira [-116.8, 78.5] & Relic Altar Table [-110.0, 75.0]
    const distToAnubisAlmira = Math.hypot(position.current.x - (-116.8), position.current.z - 78.5);
    const insideAnubisAlmira = distToAnubisAlmira < 1.45;
    const distToAnubisAltar = Math.hypot(position.current.x - (-110.0), position.current.z - 75.0);
    const underAnubisAltar = distToAnubisAltar < 1.75 && (isCrouching || position.current.y < 0.95);
    const inAnubisEscape = Math.hypot(position.current.x - (-110.0), position.current.z - 83.0) < 1.8;
    const insideAnubisPyramid = position.current.x >= -117.5 && position.current.x <= -102.5 && position.current.z >= 67.5 && position.current.z <= 82.5;

    // L. Pyramid 3 (Bastet Queen's Palace): Silk Walk-in Almira [-70.8, 55.5] & Queen's Feast Table [-65.0, 53.0]
    const distToBastetAlmira = Math.hypot(position.current.x - (-70.8), position.current.z - 55.5);
    const insideBastetAlmira = distToBastetAlmira < 1.45;
    const distToBastetFeastTable = Math.hypot(position.current.x - (-65.0), position.current.z - 53.0);
    const underBastetFeastTable = distToBastetFeastTable < 1.65 && (isCrouching || position.current.y < 0.95);
    const distToBastetTreasury = Math.hypot(position.current.x - (-59.8), position.current.z - 55.5);
    const behindBastetTreasury = distToBastetTreasury < 1.45;
    const inBastetEscape = Math.hypot(position.current.x - (-65.0), position.current.z - 60.0) < 1.8;
    const insideBastetPyramid = position.current.x >= -71.5 && position.current.x <= -58.5 && position.current.z >= 46.5 && position.current.z <= 59.5;

    // ── Level 4: Mayabi Hill Tracts Stealth Cover Zones ──
    // A. Dense Mountain Tall Grass (Pampas / কাশফুল)
    let inHillTallGrass = false;
    for (const [gx, , gz] of HILL_TALL_GRASS_PATCHES) {
      if (Math.hypot(position.current.x - gx, position.current.z - gz) < 2.6) {
        inHillTallGrass = true;
        break;
      }
    }

    // B. Secret Cave Behind Mountain Waterfall [-60.0, -103.5]
    const inHillWaterfallCave = position.current.x >= -64.0 && position.current.x <= -56.0 && position.current.z >= -105.5 && position.current.z <= -101.0;

    // C. Under High Suspension Bridge Shadow in River Gorge
    const underSuspensionBridge = position.current.x >= -68.0 && position.current.x <= -52.0 && position.current.z >= -87.0 && position.current.z <= -83.0 && position.current.y < 2.5;

    let detectedStealth: 'hidden' | 'partially_hidden' | 'exposed' = 'exposed';
    if (
      distToBushes < 3.8 ||
      distToBushGrove2 < 3.5 ||
      distToHaystack < 3.8 ||
      (distToTunnel < 2.5 && position.current.y < 1.6) ||
      (inTallGrass && (isCrouching || position.current.y < 0.9)) ||
      (underMangoTree && isCrouching) ||
      inWaterfallGrotto ||
      inMammothTunnel ||
      inCrevasse ||
      inSabertoothCave ||
      inSnowmenDecoy ||
      insideAlmira ||
      underBanquetTable ||
      behindDrawers ||
      behindBookshelf ||
      behindTreasury ||
      insidePyramidAlmira ||
      underCanopyDaybed ||
      underPyramidFeastTable ||
      underThrone ||
      behindTreasuryChest ||
      behindScrollArchives ||
      inNorthEscapeTunnel ||
      inWestEscapeTunnel ||
      inSecretBypassCorridor ||
      inOasisReeds ||
      insideAnubisAlmira ||
      underAnubisAltar ||
      inAnubisEscape ||
      insideBastetAlmira ||
      underBastetFeastTable ||
      behindBastetTreasury ||
      inBastetEscape ||
      (inHillTallGrass && (isCrouching || position.current.y < 1.1)) ||
      inHillWaterfallCave
    ) {
      detectedStealth = 'hidden';
    } else if (
      distToVillage < 5.8 ||
      inTallGrass ||
      underMangoTree ||
      distToMammothTunnel < 4.8 ||
      distToSabertoothCave < 5.2 ||
      distToWaterfallGrotto < 4.2 ||
      distToSnowmen < 4.5 ||
      nearMammoth ||
      nearPenguins ||
      nearCamels ||
      (insideCastle && isCrouching) ||
      (insidePyramid && isCrouching) ||
      insidePyramid ||
      (insideAnubisPyramid && isCrouching) ||
      insideAnubisPyramid ||
      (insideBastetPyramid && isCrouching) ||
      insideBastetPyramid ||
      inHillTallGrass ||
      underSuspensionBridge ||
      isCrouching
    ) {
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
    <>
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

    {/* Dynamic Sand Smoke / Dust Particles (Web only to maximize mobile phone 60FPS) */}
    {Platform.OS === 'web' && (
      <SandDustParticles
        playerPos={position}
        playerVel={velocity}
        isMovingRef={isMovingRef}
        isGrounded={isGrounded}
      />
    )}
    </>
  );
}

// ── Fast Sand & Road Surface Detection (বালির রাস্তা ও সৈকত নির্ণয় - অপ্টিমাইজড) ──
function isPositionOnSand(px: number, pz: number): boolean {
  // 1. South beach boulevard & boardwalk leading to south dock
  if (Math.abs(px) < 2.5 && pz > 1.5 && pz < 35) return true;
  // 2. Trail to Bangladeshi Village (squared distance check)
  const dvX = px - (-6);
  const dvZ = pz - 4.5;
  if (dvX * dvX + dvZ * dvZ < 10.24) return true;
  // 3. Courtyard around village homestead
  const dhmX = px - (-12);
  const dhmZ = pz - 9;
  if (dhmX * dhmX + dhmZ * dhmZ < 46.24) return true;
  // 4. Trail to Seeker Tower
  const dtX = px - 7;
  const dtZ = pz - (-6);
  if (dtX * dtX + dtZ * dtZ < 10.24) return true;
  // 5. Trail to Bush Thicket
  const dbX = px - 5.5;
  const dbZ = pz - 5.5;
  if (dbX * dbX + dbZ * dbZ < 9.0) return true;
  // 6. South beach perimeter
  if (pz > 26 && Math.abs(px) < 16) return true;
  return false;
}

// ── Dynamic Sand Dust / Smoke Particle System (ম্যাডবক্স ধাঁচের বালির ধোঁয়া - অপ্টিমাইজড) ──
interface ParticleData {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

function SandDustParticles({
  playerPos,
  playerVel,
  isMovingRef,
  isGrounded,
}: {
  playerPos: React.MutableRefObject<THREE.Vector3>;
  playerVel: React.MutableRefObject<THREE.Vector3>;
  isMovingRef: React.MutableRefObject<boolean>;
  isGrounded: React.MutableRefObject<boolean>;
}) {
  const POOL_SIZE = 8;
  const particles = useRef<ParticleData[]>(
    Array.from({ length: POOL_SIZE }, () => ({
      pos: new THREE.Vector3(0, -999, 0),
      vel: new THREE.Vector3(0, 0, 0),
      life: 0,
      maxLife: 0.35,
      active: false,
    }))
  );
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spawnTimer = useRef(0);
  const nextIdx = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const px = playerPos.current.x;
    const pz = playerPos.current.z;

    const onSand = isPositionOnSand(px, pz);

    if (isMovingRef.current && isGrounded.current && onSand) {
      spawnTimer.current += dt;
      if (spawnTimer.current > 0.1) {
        spawnTimer.current = 0;
        const p = particles.current[nextIdx.current];
        nextIdx.current = (nextIdx.current + 1) % POOL_SIZE;

        p.pos.set(
          px + (Math.random() - 0.5) * 0.25,
          0.06,
          pz + (Math.random() - 0.5) * 0.25
        );
        p.vel.set(
          -playerVel.current.x * 0.12 + (Math.random() - 0.5) * 0.5,
          0.6 + Math.random() * 0.3,
          -playerVel.current.z * 0.12 + (Math.random() - 0.5) * 0.5
        );
        p.life = 0.35;
        p.maxLife = 0.35;
        p.active = true;
      }
    } else {
      spawnTimer.current = 0;
    }

    // Update active dust particles
    for (let idx = 0; idx < POOL_SIZE; idx++) {
      const p = particles.current[idx];
      const mesh = meshRefs.current[idx];
      if (!mesh) continue;

      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          mesh.visible = false;
          continue;
        }

        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;
        p.pos.z += p.vel.z * dt;
        p.vel.y *= 0.93;

        const progress = 1 - p.life / p.maxLife;
        const scale = 0.18 + progress * 0.45;
        const opacity = (1 - progress) * 0.7;

        mesh.position.copy(p.pos);
        mesh.scale.setScalar(scale);
        mesh.visible = true;

        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = opacity;
        }
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: POOL_SIZE }).map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          visible={false}
          position={[0, -999, 0]}
        >
          <sphereGeometry args={[0.26, 6, 6]} />
          <meshBasicMaterial
            color="#fef08a"
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
