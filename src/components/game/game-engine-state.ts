import * as THREE from 'three';

/**
 * High-frequency mutable game engine state (60-120 FPS).
 * Decoupled from React render cycles to guarantee buttery performance
 * and zero frame-drops or semwait stalls on mobile devices.
 */
export interface PlayerTransform {
  position: THREE.Vector3;
  rotation: number;
}

export const playerTransform: PlayerTransform = {
  position: new THREE.Vector3(0, 0.75, 0),
  rotation: 0,
};

/**
 * Global game simulation speed controller.
 * Smoothly transitions into cinematic slow-mo (0.05) when the menu opens,
 * and seamlessly accelerates back to 1.0 on resume.
 */
export const gameEngine = {
  timeScale: 1.0,
};
