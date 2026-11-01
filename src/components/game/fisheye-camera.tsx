import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { inputState } from './input-manager';
import { playerTransform, gameEngine } from './game-engine-state';
import { lukaoStore } from './game-state';

interface CameraRigProps {
  playerTarget?: THREE.Vector3;
  children: React.ReactNode;
  cameraMode?: 'follow' | 'free';
}

function SmoothFollowCamera({ target, isFree = false }: { target?: THREE.Vector3; isFree?: boolean }) {
  const currentPos = useRef(new THREE.Vector3(0, 3.8, 6.8));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.8, 0));
  const CAMERA_DISTANCE = isFree ? 16.0 : 7.0;

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
    pitch = Math.max(0.18, Math.min(0.85, pitch));
    inputState.cameraPitch = pitch;
    inputState.cameraYaw = yaw;

    // Anchor target: In free mode, orbit center arena (0, 1.2, 0); in follow mode, track player
    let pos = new THREE.Vector3(0, 0.75, 0);
    if (!isFree) {
      const rawPos = target || playerTransform.position;
      if (rawPos && Number.isFinite(rawPos.x) && Number.isFinite(rawPos.y) && Number.isFinite(rawPos.z)) {
        pos = rawPos;
      }
    } else {
      pos.set(0, 1.2, 0);
    }

    const horizDist = CAMERA_DISTANCE * Math.cos(pitch);
    const vertDist = CAMERA_DISTANCE * Math.sin(pitch);

    // Camera sits behind the target along the yaw angle
    const desiredX = pos.x + Math.sin(yaw) * horizDist;
    const desiredZ = pos.z + Math.cos(yaw) * horizDist;
    const desiredY = Math.max(pos.y + vertDist, 1.4);

    const desiredPos = new THREE.Vector3(desiredX, desiredY, desiredZ);
    const desiredLookAt = new THREE.Vector3(pos.x, pos.y + 0.65, pos.z);

    // Defense against corrupted refs
    if (!Number.isFinite(currentPos.current.x) || !Number.isFinite(currentPos.current.y) || !Number.isFinite(currentPos.current.z)) {
      currentPos.current.set(0, 3.8, 6.8);
    }
    if (!Number.isFinite(currentLookAt.current.x) || !Number.isFinite(currentLookAt.current.y) || !Number.isFinite(currentLookAt.current.z)) {
      currentLookAt.current.set(0, 0.8, 0);
    }

    // Smooth lerp for buttery camera movement
    currentPos.current.lerp(desiredPos, 12 * safeDelta);
    currentLookAt.current.lerp(desiredLookAt, 14 * safeDelta);

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
