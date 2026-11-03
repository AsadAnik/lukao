import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { inputState } from './input-manager';
import { playerTransform, gameEngine, dolphinRide, balloonRide } from './game-engine-state';
import { lukaoStore } from './game-state';

interface CameraRigProps {
  playerTarget?: THREE.Vector3;
  children: React.ReactNode;
  cameraMode?: 'follow' | 'free';
}

function SmoothFollowCamera({ target, isFree = false }: { target?: THREE.Vector3; isFree?: boolean }) {
  const currentPos = useRef(new THREE.Vector3(0, 3.8, 6.8));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.8, 0));
  const wasRidingRef = useRef(false);
  const wasFlyingRef = useRef(false);
  const castleInteriorFactor = useRef(0);

  useFrame((state, delta) => {
    const isMenu = lukaoStore.getState().isMenuOpen;
    const safeDelta = Math.min(Number.isFinite(delta) && delta > 0 ? delta : 0.016, 0.05);

    // Dynamic Projection Matrix & Aspect Ratio Auto-Sync
    const persp = state.camera as THREE.PerspectiveCamera;
    if (persp && persp.isPerspectiveCamera && state.size.width > 0 && state.size.height > 0) {
      const currentAspect = state.size.width / state.size.height;
      if (!Number.isFinite(persp.aspect) || Math.abs(persp.aspect - currentAspect) > 0.01) {
        persp.aspect = currentAspect;
        persp.updateProjectionMatrix();
      }
    }

    // Smoothly slow down the game simulation when menu is open, smoothly accelerate when resumed
    const targetScale = isMenu ? 0.05 : 1.0;
    gameEngine.timeScale = THREE.MathUtils.lerp(gameEngine.timeScale, targetScale, 6 * safeDelta);

    // In menu phase, slowly and cinematically orbit the 3D playground arena
    if (isMenu) {
      inputState.cameraYaw += 0.22 * safeDelta;
    }

    // Strict numerical bounds & NaN defense
    let yaw = Number.isFinite(inputState.cameraYaw) ? inputState.cameraYaw : 0;
    let pitch = Number.isFinite(inputState.cameraPitch) ? inputState.cameraPitch : 0.45;

    const desiredPos = new THREE.Vector3();
    const desiredLookAt = new THREE.Vector3();

    if (dolphinRide.isRiding) {
      // ── Dedicated High-Performance Dolphin Chase Rig ──
      // Locks camera directly behind the leaping dolphin along its movement trajectory,
      // framing the ocean leaps and island horizon with cinematic clarity.
      const dPos = dolphinRide.dolphinPosition;
      const heading = Number.isFinite(dolphinRide.dolphinRotation) ? dolphinRide.dolphinRotation : 0;
      const camDist = 7.5;
      const camHeight = 3.6;

      const safeDX = Number.isFinite(dPos.x) ? dPos.x : 1.9;
      const safeDY = Number.isFinite(dPos.y) ? dPos.y : -0.48;
      const safeDZ = Number.isFinite(dPos.z) ? dPos.z : 36.0;

      const camX = safeDX - Math.sin(heading) * camDist;
      const camZ = safeDZ - Math.cos(heading) * camDist;
      const camY = Math.max(safeDY + camHeight, 2.4);

      desiredPos.set(camX, camY, camZ);
      // Look directly at the player mounted on the dolphin's back
      desiredLookAt.set(safeDX, safeDY + 0.85, safeDZ);

      // Keep yaw and pitch aligned so dismounting smoothly hands back control
      inputState.cameraYaw = heading + Math.PI;
      inputState.cameraPitch = 0.38;

      // On the initial frame when ride begins, snap camera position directly behind dolphin
      // to eliminate any disorienting wild camera pan from previous island exploration
      if (!wasRidingRef.current) {
        currentPos.current.copy(desiredPos);
        currentLookAt.current.copy(desiredLookAt);
      }
      wasRidingRef.current = true;
    } else if (balloonRide.isFlying) {
      wasRidingRef.current = false;

      // ── Dedicated High-Altitude Hot Air Balloon Chase Rig ──
      // Frames the balloon soaring through the clouds, the player in the basket,
      // and the panoramic ocean archipelago below!
      const bPos = balloonRide.balloonPosition;
      const heading = Number.isFinite(balloonRide.balloonRotation) ? balloonRide.balloonRotation : -Math.PI / 2;
      const camDist = 9.5;
      const camHeight = 4.8;

      const safeBX = Number.isFinite(bPos.x) ? bPos.x : 0;
      const safeBY = Number.isFinite(bPos.y) ? bPos.y : 18;
      const safeBZ = Number.isFinite(bPos.z) ? bPos.z : 78;

      const camX = safeBX - Math.sin(heading) * camDist;
      const camZ = safeBZ - Math.cos(heading) * camDist;
      const camY = safeBY + camHeight;

      desiredPos.set(camX, camY, camZ);
      // Look directly at passenger basket carrying player
      desiredLookAt.set(safeBX, safeBY + 1.2, safeBZ);

      inputState.cameraYaw = heading + Math.PI;
      inputState.cameraPitch = 0.35;

      if (!wasFlyingRef.current) {
        currentPos.current.copy(desiredPos);
        currentLookAt.current.copy(desiredLookAt);
      }
      wasFlyingRef.current = true;
    } else {
      wasRidingRef.current = false;
      wasFlyingRef.current = false;

      // ── Standard Follow / Free Orbit Camera / Interior Castle Rig ──
      let pos = new THREE.Vector3(0, 0.75, 0);

      if (!isFree) {
        const rawPos = target || playerTransform.position;
        if (rawPos && Number.isFinite(rawPos.x) && Number.isFinite(rawPos.y) && Number.isFinite(rawPos.z)) {
          pos = rawPos;
        }
      } else {
        pos.set(0, 1.2, 0);
      }

      // Detect if player is inside Level 2 Frost Castle OR any of the Level 3 Grand Pyramids
      // Castle: center [84.0, 0, 68.5], bounds [77.2, 90.8] x [62.8, 74.2], y < 3.2m
      // Pyramid 1 (Pharaoh): center [-85.0, 0, 78.5], 26m x 26m Palace, bounds [-96.5, -73.5] x [66.8, 90.2], y < 3.8m
      // Pyramid 2 (Anubis): center [-110.0, 0, 75.0], 18m x 18m, bounds [-117.5, -102.5] x [67.5, 82.5], y < 3.5m
      // Pyramid 3 (Bastet): center [-65.0, 0, 53.0], 16m x 16m, bounds [-71.5, -58.5] x [46.5, 59.5], y < 3.4m
      const isInsideCastle =
        !isFree &&
        pos.x >= 77.2 &&
        pos.x <= 90.8 &&
        pos.z >= 62.8 &&
        pos.z <= 74.2 &&
        pos.y < 3.2;

      const isInsidePyramid1 =
        !isFree &&
        pos.x >= -96.5 &&
        pos.x <= -73.5 &&
        pos.z >= 66.8 &&
        pos.z <= 90.2 &&
        pos.y < 3.8;

      const isInsidePyramid2 =
        !isFree &&
        pos.x >= -117.5 &&
        pos.x <= -102.5 &&
        pos.z >= 67.5 &&
        pos.z <= 82.5 &&
        pos.y < 3.5;

      const isInsidePyramid3 =
        !isFree &&
        pos.x >= -71.5 &&
        pos.x <= -58.5 &&
        pos.z >= 46.5 &&
        pos.z <= 59.5 &&
        pos.y < 3.4;

      const isInsidePyramid = isInsidePyramid1 || isInsidePyramid2 || isInsidePyramid3;
      const isInsideMonument = isInsideCastle || isInsidePyramid;

      // Smoothly blend in/out of interior monument camera mode
      const targetInteriorFactor = isInsideMonument ? 1.0 : 0.0;
      castleInteriorFactor.current = THREE.MathUtils.lerp(
        castleInteriorFactor.current,
        targetInteriorFactor,
        7.5 * safeDelta
      );

      // Outdoor standard camera distance is 7.0m; inside monument dynamically tightens to close-up 2.2m!
      const baseDistance = isFree ? 16.0 : 7.0;
      const targetDistance = THREE.MathUtils.lerp(baseDistance, 2.2, castleInteriorFactor.current);

      // Pitch: clamp to comfortable indoor angle when inside so camera stays under stone/timber ceilings
      const minPitch = THREE.MathUtils.lerp(0.18, 0.10, castleInteriorFactor.current);
      const maxPitch = THREE.MathUtils.lerp(0.85, 0.28, castleInteriorFactor.current);
      pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
      inputState.cameraPitch = pitch;
      inputState.cameraYaw = yaw;

      const horizDist = targetDistance * Math.cos(pitch);
      const vertDist = targetDistance * Math.sin(pitch);

      let desiredX = pos.x + Math.sin(yaw) * horizDist;
      let desiredZ = pos.z + Math.cos(yaw) * horizDist;

      // Outdoor height vs interior height bounded strictly below ceilings (y < 2.5m)
      const outdoorY = Math.max(pos.y + vertDist, 1.4);
      const interiorY = Math.min(Math.max(pos.y + 0.85, pos.y + vertDist * 0.45), 2.45);
      const desiredY = THREE.MathUtils.lerp(outdoorY, interiorY, castleInteriorFactor.current);

      // When inside monument, constrain camera horizontal coordinates within interior room walls
      // to guarantee camera NEVER clips through exterior stone walls!
      if (castleInteriorFactor.current > 0.05) {
        if (isInsideCastle) {
          const clampedX = THREE.MathUtils.clamp(desiredX, 77.8, 90.2);
          const clampedZ = THREE.MathUtils.clamp(desiredZ, 63.4, 73.8);
          desiredX = THREE.MathUtils.lerp(desiredX, clampedX, castleInteriorFactor.current);
          desiredZ = THREE.MathUtils.lerp(desiredZ, clampedZ, castleInteriorFactor.current);
        } else if (isInsidePyramid1) {
          const clampedX = THREE.MathUtils.clamp(desiredX, -95.8, -74.2);
          const clampedZ = THREE.MathUtils.clamp(desiredZ, 67.8, 89.2);
          desiredX = THREE.MathUtils.lerp(desiredX, clampedX, castleInteriorFactor.current);
          desiredZ = THREE.MathUtils.lerp(desiredZ, clampedZ, castleInteriorFactor.current);
        } else if (isInsidePyramid2) {
          const clampedX = THREE.MathUtils.clamp(desiredX, -117.0, -103.0);
          const clampedZ = THREE.MathUtils.clamp(desiredZ, 68.0, 82.0);
          desiredX = THREE.MathUtils.lerp(desiredX, clampedX, castleInteriorFactor.current);
          desiredZ = THREE.MathUtils.lerp(desiredZ, clampedZ, castleInteriorFactor.current);
        } else if (isInsidePyramid3) {
          const clampedX = THREE.MathUtils.clamp(desiredX, -71.0, -59.0);
          const clampedZ = THREE.MathUtils.clamp(desiredZ, 47.0, 59.0);
          desiredX = THREE.MathUtils.lerp(desiredX, clampedX, castleInteriorFactor.current);
          desiredZ = THREE.MathUtils.lerp(desiredZ, clampedZ, castleInteriorFactor.current);
        }
      }

      desiredPos.set(desiredX, desiredY, desiredZ);

      // Focus directly on upper torso / head for intimate interior room exploration & hiding
      const lookAtHeight = THREE.MathUtils.lerp(0.65, 0.72, castleInteriorFactor.current);
      desiredLookAt.set(pos.x, pos.y + lookAtHeight, pos.z);
    }

    // Guard against identical position/lookAt degenerating camera matrix
    if (desiredPos.distanceTo(desiredLookAt) < 0.5) {
      desiredPos.y += 2.0;
    }

    // Defense against corrupted refs
    if (!Number.isFinite(currentPos.current.x) || !Number.isFinite(currentPos.current.y) || !Number.isFinite(currentPos.current.z)) {
      currentPos.current.copy(desiredPos);
    }
    if (!Number.isFinite(currentLookAt.current.x) || !Number.isFinite(currentLookAt.current.y) || !Number.isFinite(currentLookAt.current.z)) {
      currentLookAt.current.copy(desiredLookAt);
    }

    // Dynamic lerp speed (snappy 14 for dolphin, floaty 10 for aerial balloon, smooth 12 for walking)
    const lerpSpeed = dolphinRide.isRiding ? 14 : balloonRide.isFlying ? 10 : 12;
    currentPos.current.lerp(desiredPos, lerpSpeed * safeDelta);
    currentLookAt.current.lerp(desiredLookAt, (lerpSpeed + 2) * safeDelta);

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}

export function FisheyeCameraRig({
  playerTarget,
  children,
  cameraMode = 'follow',
}: CameraRigProps) {
  return (
    <>
      <SmoothFollowCamera target={playerTarget} isFree={cameraMode === 'free'} />
      {children}
    </>
  );
}
