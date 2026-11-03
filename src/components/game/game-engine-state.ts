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

/**
 * Dolphin Ride & Ocean Navigation State.
 * Enables riding dolphins between islands with cinematic ocean leaps.
 * Route 1: Level 1 (home) <-> Level 2 (atoll)
 * Route 2: Level 3 (desert) <-> Level 4 (hill)
 */
export interface DolphinRideState {
  isRiding: boolean;
  canRide: boolean;
  promptText: string;
  rideProgress: number; // 0 to 1
  direction: 'to_atoll' | 'to_home' | 'to_hill' | 'to_desert';
  currentLocation: 'home' | 'atoll' | 'desert' | 'hill';
  dolphinPosition: THREE.Vector3;
  dolphinRotation: number;
  activeRoute?: 'route_1' | 'route_2';
}

export const dolphinRide: DolphinRideState = {
  isRiding: false,
  canRide: false,
  promptText: '',
  rideProgress: 0,
  direction: 'to_atoll',
  currentLocation: 'home',
  dolphinPosition: new THREE.Vector3(1.9, -0.48, 36.0),
  dolphinRotation: 0.22,
  activeRoute: 'route_1',
};

export function startDolphinRide() {
  if (dolphinRide.isRiding || !dolphinRide.canRide) return;
  dolphinRide.isRiding = true;
  dolphinRide.rideProgress = 0;

  if (dolphinRide.activeRoute === 'route_2') {
    const isFromDesert = dolphinRide.currentLocation === 'desert';
    dolphinRide.direction = isFromDesert ? 'to_hill' : 'to_desert';
    const startPos = isFromDesert
      ? new THREE.Vector3(-61.0, -0.48, 43.0)
      : new THREE.Vector3(-60.0, -0.48, -42.0);
    dolphinRide.dolphinPosition.copy(startPos);
    dolphinRide.dolphinRotation = isFromDesert ? -3.14 : 0.0;
    playerTransform.position.copy(startPos);
    playerTransform.position.y += 0.65;
    playerTransform.rotation = dolphinRide.dolphinRotation;
    return;
  }

  // Default Route 1: Level 1 <-> Level 2
  const isFromHome = dolphinRide.currentLocation === 'home';
  dolphinRide.direction = isFromHome ? 'to_atoll' : 'to_home';

  // Explicitly initialize starting dock coordinates and heading in deep water
  const startPos = isFromHome
    ? new THREE.Vector3(1.9, -0.48, 36.0)
    : new THREE.Vector3(73.5, -0.48, 54.5);
  dolphinRide.dolphinPosition.copy(startPos);
  dolphinRide.dolphinRotation = isFromHome ? 0.78 : -2.35;
  playerTransform.position.copy(startPos);
  playerTransform.position.y += 0.65;
  playerTransform.rotation = dolphinRide.dolphinRotation;
}

/**
 * Hot Air Balloon Ride & Aerial Navigation State (Level 2 <-> Level 3).
 * Enables flying high across the sky above clouds between Ice Age Island and Desert Pyramids.
 */
export interface BalloonRideState {
  isFlying: boolean;
  canFly: boolean;
  promptText: string;
  flightProgress: number; // 0 to 1
  direction: 'to_desert' | 'to_ice';
  currentLocation: 'ice' | 'desert';
  balloonPosition: THREE.Vector3;
  balloonRotation: number;
}

export const balloonRide: BalloonRideState = {
  isFlying: false,
  canFly: false,
  promptText: '',
  flightProgress: 0,
  direction: 'to_desert',
  currentLocation: 'ice',
  balloonPosition: new THREE.Vector3(68.5, 1.2, 78.5),
  balloonRotation: -Math.PI / 2,
};

export function startBalloonRide() {
  if (balloonRide.isFlying || !balloonRide.canFly) return;
  balloonRide.isFlying = true;
  balloonRide.flightProgress = 0;
  const isFromIce = balloonRide.currentLocation === 'ice';
  balloonRide.direction = isFromIce ? 'to_desert' : 'to_ice';

  const startPos = isFromIce
    ? new THREE.Vector3(68.5, 1.2, 78.5)
    : new THREE.Vector3(-68.5, 1.2, 78.5);
  balloonRide.balloonPosition.copy(startPos);
  balloonRide.balloonRotation = isFromIce ? -Math.PI / 2 : Math.PI / 2;

  playerTransform.position.copy(startPos);
  playerTransform.position.y += 0.45; // Inside the passenger basket!
  playerTransform.rotation = balloonRide.balloonRotation;
}
