import * as THREE from 'three';

export interface BoxCollider {
  type: 'box';
  min: THREE.Vector3;
  max: THREE.Vector3;
  isClimbable?: boolean;
}

export interface CylinderCollider {
  type: 'cylinder';
  center: THREE.Vector2; // X, Z
  radius: number;
  minY: number;
  maxY: number;
}

export interface RampCollider {
  type: 'ramp';
  start: THREE.Vector3; // low point
  end: THREE.Vector3;   // high point
  width: number;
}

export class CollisionWorld {
  boxes: BoxCollider[] = [];
  cylinders: CylinderCollider[] = [];
  ramps: RampCollider[] = [];
  arenaRadius = 31.0;

  constructor() {
    this.initArenaColliders();
  }

  private addBox(center: [number, number, number], size: [number, number, number], climbable = true) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = size;
    this.boxes.push({
      type: 'box',
      min: new THREE.Vector3(cx - sx / 2, cy - sy / 2, cz - sz / 2),
      max: new THREE.Vector3(cx + sx / 2, cy + sy / 2, cz + sz / 2),
      isClimbable: climbable,
    });
  }

  private addCylinder(center: [number, number], radius: number, minY: number, maxY: number) {
    this.cylinders.push({
      type: 'cylinder',
      center: new THREE.Vector2(center[0], center[1]),
      radius,
      minY,
      maxY,
    });
  }

  private addRamp(start: [number, number, number], end: [number, number, number], width: number) {
    this.ramps.push({
      type: 'ramp',
      start: new THREE.Vector3(...start),
      end: new THREE.Vector3(...end),
      width,
    });
  }

  initArenaColliders() {
    // 1. Plaza stepping pads
    this.addBox([-6, 0.2, -6], [4, 0.4, 4]);
    this.addBox([-9, 0.4, -9], [3.5, 0.8, 3.5]);
    this.addRamp([-2.0, 0, -6], [-4.5, 0.4, -6], 2.5);

    // 2. Bangladeshi Village Homestead (Center at [-12, 0, 9])
    const vX = -12;
    const vZ = 9;

    // Raised Mud Plinth (মাটির ভিটা) - step up to y = 0.6m
    this.addBox([vX + 0.0, 0.3, vZ + 0.0], [7.4, 0.6, 6.4]);
    // Main House Solid Walls (মাটির ঘর)
    this.addBox([vX + 0.0, 1.85, vZ - 0.6], [6.6, 2.5, 4.4]);
    // Veranda Step (বারান্দার সিঁড়ি)
    this.addBox([vX + 0.0, 0.15, vZ + 3.35], [3.4, 0.3, 0.7]);
    // Climbable Roof Deck (টিনের চাল)
    this.addBox([vX + 0.0, 3.8, vZ - 0.2], [7.8, 0.4, 4.8]);
    // Climbing straw bales to roof (চালে ওঠার খড়ের ধাপ)
    this.addBox([vX + 3.6, 0.6, vZ - 1.8], [1.3, 1.2, 1.3]);
    this.addBox([vX + 3.6, 1.8, vZ - 1.8], [1.2, 1.2, 1.2]);
    this.addRamp([vX + 3.4, 2.2, vZ - 1.5], [vX + 2.4, 3.6, vZ - 1.5], 1.2);

    // Golden Haystacks (খড়ের গাদা)
    this.addCylinder([vX - 5.8, vZ - 2.2], 2.4, 0, 2.0);
    this.addCylinder([vX - 5.8, vZ - 2.2], 1.6, 2.0, 3.2);
    this.addCylinder([vX - 5.8, vZ - 2.2], 0.8, 3.2, 4.2);
    this.addCylinder([vX - 7.8, vZ - 0.6], 1.8, 0, 1.8);

    // Tubewell platform & pump (চাপাকল)
    this.addCylinder([vX + 5.2, vZ + 2.8], 1.5, 0, 0.2);
    this.addCylinder([vX + 5.2, vZ + 2.8], 0.25, 0.2, 1.5);

    // Cow body obstacle & Feeding Trough (গরু ও জাবনা চাড়ি)
    this.addBox([vX - 5.4, 0.8, vZ + 2.8], [1.4, 1.6, 2.2]);
    this.addCylinder([vX - 5.4, vZ + 4.7], 0.6, 0, 0.6);

    // 3. Seeker's Tower (Center at [14, 0, -12])
    const twX = 14;
    const twZ = -12;

    // Base podium
    this.addCylinder([twX, twZ], 4.5, 0, 0.8);
    // Observation Deck
    this.addBox([twX, 6.6, twZ], [6.5, 0.4, 6.5]);
    // Ramp to deck
    this.addRamp([twX + 4.2, 0.8, twZ - 4], [twX + 4.2, 6.6, twZ + 3.5], 1.6);

    // 4. Arch Bridge & Tunnel (Center at [-2, 0, -13])
    const brX = -2;
    const brZ = -13;

    // Bridge Deck
    this.addBox([brX, 1.8, brZ], [10, 0.4, 3.2]);
    // Bridge Left Approach Ramp
    this.addRamp([brX - 7.5, 0, brZ], [brX - 4.5, 1.8, brZ], 3.2);
    // Bridge Right Approach Ramp
    this.addRamp([brX + 7.5, 0, brZ], [brX + 4.5, 1.8, brZ], 3.2);
  }

  // Find surface height below a point
  getSurfaceHeight(x: number, z: number, currentY: number): number {
    let highestFloor = 0; // default arena ground

    // 1. Check ramps
    for (const ramp of this.ramps) {
      const vRamp = new THREE.Vector3().subVectors(ramp.end, ramp.start);
      const vRampXZ = new THREE.Vector2(vRamp.x, vRamp.z);
      const rampLen = vRampXZ.length();
      if (rampLen < 0.001) continue;

      const normDir = vRampXZ.clone().normalize();
      const perpDir = new THREE.Vector2(-normDir.y, normDir.x);

      const toPoint = new THREE.Vector2(x - ramp.start.x, z - ramp.start.z);
      const projAlong = toPoint.dot(normDir);
      const projPerp = Math.abs(toPoint.dot(perpDir));

      if (projAlong >= -0.3 && projAlong <= rampLen + 0.3 && projPerp <= ramp.width / 2 + 0.2) {
        const t = Math.max(0, Math.min(1, projAlong / rampLen));
        const rampY = ramp.start.y + t * (ramp.end.y - ramp.start.y);
        if (currentY >= rampY - 0.5) {
          highestFloor = Math.max(highestFloor, rampY);
        }
      }
    }

    // 2. Check box platforms
    for (const box of this.boxes) {
      if (
        x >= box.min.x - 0.15 &&
        x <= box.max.x + 0.15 &&
        z >= box.min.z - 0.15 &&
        z <= box.max.z + 0.15
      ) {
        // If player is above or close to the top of this box
        if (currentY >= box.max.y - 0.6) {
          highestFloor = Math.max(highestFloor, box.max.y);
        }
      }
    }

    // 3. Check cylinders
    for (const cyl of this.cylinders) {
      const dist = Math.hypot(x - cyl.center.x, z - cyl.center.y);
      if (dist <= cyl.radius + 0.1) {
        if (currentY >= cyl.maxY - 0.6) {
          highestFloor = Math.max(highestFloor, cyl.maxY);
        }
      }
    }

    return highestFloor;
  }

  // Resolve horizontal collisions (push player out of solid box walls)
  resolveHorizontalCollisions(
    oldX: number,
    oldZ: number,
    newX: number,
    newZ: number,
    playerY: number,
    playerRadius = 0.45
  ): { x: number; z: number } {
    let resolvedX = newX;
    let resolvedZ = newZ;

    // Check arena circular boundary
    const distFromCenter = Math.hypot(resolvedX, resolvedZ);
    if (distFromCenter > this.arenaRadius) {
      const angle = Math.atan2(resolvedZ, resolvedX);
      resolvedX = Math.cos(angle) * this.arenaRadius;
      resolvedZ = Math.sin(angle) * this.arenaRadius;
    }

    // Check solid box walls
    for (const box of this.boxes) {
      // If player is within vertical range of the box (i.e. not on top of it)
      if (playerY < box.max.y - 0.25 && playerY + 1.2 > box.min.y) {
        const expandedMinX = box.min.x - playerRadius;
        const expandedMaxX = box.max.x + playerRadius;
        const expandedMinZ = box.min.z - playerRadius;
        const expandedMaxZ = box.max.z + playerRadius;

        if (
          resolvedX > expandedMinX &&
          resolvedX < expandedMaxX &&
          resolvedZ > expandedMinZ &&
          resolvedZ < expandedMaxZ
        ) {
          // Push out in the shallowest penetration axis
          const leftPen = resolvedX - expandedMinX;
          const rightPen = expandedMaxX - resolvedX;
          const backPen = resolvedZ - expandedMinZ;
          const frontPen = expandedMaxZ - resolvedZ;

          const minPen = Math.min(leftPen, rightPen, backPen, frontPen);
          if (minPen === leftPen) resolvedX = expandedMinX;
          else if (minPen === rightPen) resolvedX = expandedMaxX;
          else if (minPen === backPen) resolvedZ = expandedMinZ;
          else resolvedZ = expandedMaxZ;
        }
      }
    }

    return { x: resolvedX, z: resolvedZ };
  }
}

export const collisionWorld = new CollisionWorld();

