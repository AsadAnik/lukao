import * as THREE from 'three';
import { dolphinRide, balloonRide } from './game-engine-state';

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
  arenaRadius = 34.6;

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

    // Grand Shaded Mango Tree & Seating Platform (পূর্ব প্রান্তের আম গাছ ও চাতাল)
    this.addCylinder([15.5, -2.5], 2.2, 0, 0.35); // climbable seating platform
    this.addCylinder([15.5, -2.5], 0.65, 0, 4.0); // solid trunk

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

    // 5. Southern Beach Pier / Dock to Moored Boat (সমুদ্রের ঘাট ও নৌকা)
    this.addBox([0, 0.12, 31.7], [2.8, 0.25, 4.4]);
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

    // 4. Level 2: Expansive Ice Age Island (Center at [85, 65], radius 31.0m)
    const distIsland2 = Math.hypot(x - 85, z - 65);
    if (distIsland2 < 31.0) {
      // Default Expansive Alpine Snow Plateau
      highestFloor = Math.max(highestFloor, 0.12);

      // Mid Glacier Terrace (Northwest heights, center at [71.0, 82.5], radius 10.5m)
      const distMidGlacier = Math.hypot(x - 71.0, z - 82.5);
      if (distMidGlacier < 10.5) {
        highestFloor = Math.max(highestFloor, 0.65);

        // High Glacier Ridge & Apex Summit (Center at [69.5, 83.5], radius 6.8m)
        const distHighGlacier = Math.hypot(x - 69.5, z - 83.5);
        if (distHighGlacier < 6.8) {
          if (currentY >= 1.0) {
            highestFloor = Math.max(highestFloor, 1.45);
          }
          // Apex Spire
          if (distHighGlacier < 3.2 && currentY >= 1.6) {
            highestFloor = Math.max(highestFloor, 2.40);
          }
        }

        // Stepped Ice Stairs to Summit (East approach)
        if (x >= 70.0 && x <= 75.5 && z >= 81.5 && z <= 84.5) {
          const stepP = Math.max(0, Math.min(1, (75.5 - x) / 5.5));
          highestFloor = Math.max(highestFloor, 0.65 + stepP * 1.2);
        }

        // Ice Slide Chute (West descent)
        if (x >= 63.5 && x <= 68.5 && z >= 83.0 && z <= 87.0) {
          const slideP = Math.max(0, Math.min(1, (x - 63.5) / 5.0));
          highestFloor = Math.max(highestFloor, 0.65 + slideP * 0.8);
        }
      }

      // Prehistoric Mammoth Skeleton & Ribcage Mound (Center at [98.5, 58.5], radius 4.5m)
      const distMammoth = Math.hypot(x - 98.5, z - 58.5);
      if (distMammoth < 4.5) {
        highestFloor = Math.max(highestFloor, 0.45);
      }

      // Glacial Crevasse Trench (Split from x=68 to 72, z=54 to 66)
      if (x >= 68.0 && x <= 72.0 && z >= 54.0 && z <= 66.0) {
        // Ice Bridge over Crevasse (z around 59 to 61)
        if (z >= 58.5 && z <= 61.5 && currentY >= 1.0) {
          highestFloor = Math.max(highestFloor, 1.45);
        } else {
          // Bottom of Crevasse Trench
          highestFloor = Math.max(highestFloor, 0.05);
        }
      }

      // Floating Lagoon Ice Floes (Stepping stones to isolated outcrop)
      if (x >= 99.0 && x <= 108.0 && z >= 44.0 && z <= 50.0) {
        highestFloor = Math.max(highestFloor, 0.15);
      }

      // Frost Citadel Castle (Center at [84.0, 68.5], size 14m x 12m)
      if (x >= 77.0 && x <= 91.0 && z >= 62.5 && z <= 74.5) {
        // Rooftop battlements floor if player is at roof level
        if (currentY >= 2.6) {
          highestFloor = Math.max(highestFloor, 3.65);
        } else {
          // Inside Castle Ground Floor (100% warm dark oak timber floor at y = 0.22)
          highestFloor = Math.max(highestFloor, 0.22);

          // Internal Castle Staircase from ground (y=0.22) up to roof (y=3.65)
          if (x >= 84.0 && x <= 86.8 && z >= 67.0 && z <= 71.0) {
            const stairProgress = Math.max(0, Math.min(1, (z - 67.0) / 4.0));
            highestFloor = Math.max(highestFloor, 0.22 + stairProgress * 3.4);
          }

          // Banquet table top surface (crawlspace underneath: crouched player stays at y=0.22)
          if (x >= 78.6 && x <= 82.2 && z >= 64.8 && z <= 66.2 && currentY >= 0.75) {
            highestFloor = Math.max(highestFloor, 0.95);
          }
        }
      }

      // Hot Air Balloon Launch Platform (Level 2 Alpine Station: [68.5, 78.5])
      if (Math.hypot(x - 68.5, z - 78.5) < 3.2) {
        highestFloor = Math.max(highestFloor, 0.45);
      }
    }

    // 5. Level 3: Expansive Al-Dahna Desert World & Pyramids (Center at [-85, 75], radius ~48.0m)
    const distIsland3 = Math.hypot(x - (-85), z - 75);
    if (distIsland3 < 48.0) {
      // Default Desert Sand Plateau
      highestFloor = Math.max(highestFloor, 0.12);

      // Hot Air Balloon Landing Platform (Level 3 Desert Station: [-68.5, 78.5])
      if (Math.hypot(x - (-68.5), z - 78.5) < 3.2) {
        highestFloor = Math.max(highestFloor, 0.45);
      }

      // West Dune Ridge (Center at [-119.0, 89.0])
      const distWestDune = Math.hypot(x - (-119.0), z - 89.0);
      if (distWestDune < 12.0) {
        highestFloor = Math.max(highestFloor, 0.65);
        if (distWestDune < 6.0) {
          highestFloor = Math.max(highestFloor, 1.35);
        }
      }

      // East Dune Ridge (Center at [-53.0, 83.5])
      const distEastDune = Math.hypot(x - (-53.0), z - 83.5);
      if (distEastDune < 12.0) {
        highestFloor = Math.max(highestFloor, 0.65);
      }

      // Oasis Freshwater Pond Basin (Center at [-92.5, 66.5], radius 3.8m)
      const distOasis = Math.hypot(x - (-92.5), z - 66.5);
      if (distOasis < 3.8) {
        highestFloor = Math.max(highestFloor, 0.05);
      }

      // ── PYRAMID 1: The Great Pharaoh's Palace (Center at [-85.0, 78.5], 26m x 26m) ──
      if (x >= -98.0 && x <= -72.0 && z >= 65.5 && z <= 91.5) {
        // High Stepped Tiers (Climbable exterior tiers)
        if (currentY >= 14.0) {
          highestFloor = Math.max(highestFloor, 16.2); // Capstone
        } else if (currentY >= 11.0) {
          highestFloor = Math.max(highestFloor, 14.1); // Tier 5
        } else if (currentY >= 8.0) {
          highestFloor = Math.max(highestFloor, 11.7); // Tier 4
        } else if (currentY >= 5.0) {
          highestFloor = Math.max(highestFloor, 8.9);  // Tier 3
        } else if (currentY >= 2.6) {
          highestFloor = Math.max(highestFloor, 5.6);  // Tier 2
        } else {
          // Inside Pyramid Palace Ground Floor (y = 0.22)
          highestFloor = Math.max(highestFloor, 0.22);
        }
      }
      // Rear Escape Terrace Balcony (Center at [-85.0, 92.3], size 7.2m x 4.0m)
      if (x >= -89.0 && x <= -81.0 && z >= 90.5 && z <= 94.5) {
        highestFloor = Math.max(highestFloor, 0.22);
      }

      // ── PYRAMID 2: Temple of Anubis (Center at [-110.0, 75.0], 18m x 18m) ──
      if (x >= -119.0 && x <= -101.0 && z >= 66.0 && z <= 84.0) {
        if (currentY >= 11.5) {
          highestFloor = Math.max(highestFloor, 13.5); // Capstone
        } else if (currentY >= 9.0) {
          highestFloor = Math.max(highestFloor, 10.9); // Tier 4
        } else if (currentY >= 6.5) {
          highestFloor = Math.max(highestFloor, 8.8);  // Tier 3
        } else if (currentY >= 3.6) {
          highestFloor = Math.max(highestFloor, 6.3);  // Tier 2
        } else {
          highestFloor = Math.max(highestFloor, 0.22); // Interior Floor
        }
      }

      // ── PYRAMID 3: Bastet Queen's Palace (Center at [-65.0, 53.0], 16m x 16m) ──
      if (x >= -73.0 && x <= -57.0 && z >= 45.0 && z <= 61.0) {
        if (currentY >= 9.5) {
          highestFloor = Math.max(highestFloor, 11.5); // Capstone
        } else if (currentY >= 6.5) {
          highestFloor = Math.max(highestFloor, 8.2);  // Tier 3
        } else if (currentY >= 3.4) {
          highestFloor = Math.max(highestFloor, 5.2);  // Tier 2
        } else {
          highestFloor = Math.max(highestFloor, 0.22); // Interior Floor
        }
      }
    }

    // 6. Level 4: Mayabi Hill Tracts & Celestial Paradise (Madbox Stepped Plateaus & Red Bridge)
    const distIsland4 = Math.hypot(x - (-60), z - (-85));
    if (distIsland4 < 46.0) {
      // Base Sandy Shore Tier (y = 0.2m)
      highestFloor = Math.max(highestFloor, 0.2);

      // Main Verdant Plateau (y = 0.85m, radius 39.5m)
      if (distIsland4 < 39.5) {
        highestFloor = Math.max(highestFloor, 0.85);
      }

      // Mid Mountain Plateau (Center at [-52, -91], radius 18.5m, y = 4.2m)
      const distMid = Math.hypot(x - (-52), z - (-91));
      if (distMid < 18.5) {
        highestFloor = Math.max(highestFloor, 4.2);
      }

      // High Summit Peak Plateau (Center at [-66, -99], radius 12.5m, y = 8.2m)
      const distSummit = Math.hypot(x - (-66), z - (-99));
      if (distSummit < 12.5) {
        highestFloor = Math.max(highestFloor, 8.2);
      }

      // Stone Steps: Main Plateau (0.85m) up to Mid Plateau (4.2m) (x ~ -52, z in [-79, -71])
      if (x >= -54.0 && x <= -50.0 && z >= -79.0 && z <= -71.0) {
        const u = (-71.0 - z) / 8.0;
        if (u >= 0 && u <= 1) {
          highestFloor = Math.max(highestFloor, 0.85 + u * 3.35);
        }
      }

      // Stone Steps: Mid Plateau (4.2m) up to Summit Peak (8.2m) (from [-61, -95] to [-66, -99])
      const uSt2 = ((-61.0 - x) + (-95.0 - z)) / 9.0;
      if (uSt2 >= 0 && uSt2 <= 1 && Math.abs(x - (-61.0 - uSt2 * 5.0) - (z - (-95.0 - uSt2 * 4.0))) < 3.0) {
        highestFloor = Math.max(highestFloor, 4.2 + uSt2 * 4.0);
      }

      // Wooden Rope Footbridge across Gorge (spans from [-63, -80] to [-52, -77] at y = 4.2m)
      if (x >= -64.0 && x <= -51.0 && z >= -82.0 && z <= -75.0) {
        highestFloor = Math.max(highestFloor, 4.2);
      }

      // Secret Cave Behind Waterfall (Center at [-66.0, -92.8])
      if (x >= -69.5 && x <= -62.5 && z >= -95.0 && z <= -90.5) {
        highestFloor = Math.max(highestFloor, 0.4);
      }
    }

    // Large Red Suspension Bridge Deck & Approach Ramp (Spanning towards Level 5)
    // Approach Ramp from Main Plateau up to Bridge Deck (x in [-76.0, -68.0], z in [-87.2, -82.8])
    if (x >= -76.0 && x <= -68.0 && z >= -87.2 && z <= -82.8) {
      const u = (-68.0 - x) / 8.0;
      highestFloor = Math.max(highestFloor, 0.85 + u * 5.55);
    }
    // Main Red Bridge Highway Deck (x in [-112.5, -76.0], z in [-87.2, -82.8], y = 6.4m)
    if (x >= -112.5 && x <= -76.0 && z >= -87.2 && z <= -82.8) {
      highestFloor = Math.max(highestFloor, 6.4);
    }

    // 7. Wooden Dock Piers Floor Support
    // Main South Pier (connecting main island to extended deep ocean pier)
    if (x >= -2.2 && x <= 2.2 && z >= 27.0 && z <= 38.5) {
      highestFloor = Math.max(highestFloor, 0.22);
    }
    // Dolphin Atoll Arrival Pier
    if (x >= 71.0 && x <= 77.0 && z >= 52.0 && z <= 58.0) {
      highestFloor = Math.max(highestFloor, 0.22);
    }
    // Desert World Arrival Pier (Expanded shore at [-61.0, 43.0])
    if (x >= -63.5 && x <= -58.5 && z >= 39.0 && z <= 46.5) {
      highestFloor = Math.max(highestFloor, 0.22);
    }
    // Hill Tracts Rivermouth Pier (Shore at [-60.0, -60.0])
    if (x >= -62.5 && x <= -57.5 && z >= -64.0 && z <= -56.0) {
      highestFloor = Math.max(highestFloor, 0.22);
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

    // While riding dolphin or flying hot air balloon between islands, bypass land boundaries
    if (dolphinRide.isRiding || balloonRide.isFlying) {
      return { x: resolvedX, z: resolvedZ };
    }

    // Check circular boundaries for Main Island, Level 2 (Ice Age), Level 3 (Desert World), and Level 4 (Hill Tracts)
    const distIsland2 = Math.hypot(resolvedX - 85, resolvedZ - 65);
    const distIsland3 = Math.hypot(resolvedX - (-85), resolvedZ - 75);
    const distIsland4 = Math.hypot(resolvedX - (-60), resolvedZ - (-85));
    const isOnAtollPier = resolvedX >= 71.0 && resolvedX <= 77.0 && resolvedZ >= 52.0 && resolvedZ <= 58.0;
    const isOnDesertPier = resolvedX >= -63.5 && resolvedX <= -58.5 && resolvedZ >= 39.0 && resolvedZ <= 46.5;
    const isOnHillPier = resolvedX >= -62.5 && resolvedX <= -57.5 && resolvedZ >= -64.0 && resolvedZ <= -56.0;
    const isOnRedBridge = resolvedX <= -68.0 && resolvedX >= -113.5 && resolvedZ >= -87.8 && resolvedZ <= -82.2;
    const isOnSouthPier = resolvedX >= -4.5 && resolvedX <= 4.5 && resolvedZ >= 25.0 && resolvedZ <= 39.5;

    if (distIsland3 < 55.0) {
      // Player is exploring Level 3: Al-Dahna Desert World (expanded radius = 44.0m)
      if (distIsland3 > 44.0 && !isOnDesertPier) {
        const angle = Math.atan2(resolvedZ - 75, resolvedX - (-85));
        resolvedX = -85 + Math.cos(angle) * 44.0;
        resolvedZ = 75 + Math.sin(angle) * 44.0;
      }

      // ── PYRAMID 1: The Great Pharaoh's Palace Solid Sandstone Shell (Below tier 1: playerY < 3.7m) ──
      if (playerY < 3.7 && resolvedX >= -98.5 && resolvedX <= -71.5 && resolvedZ >= 65.0 && resolvedZ <= 92.0) {
        // South Portal Wall Left: [-98.2, -86.6] at z=66.7
        if (resolvedZ >= 66.2 && resolvedZ <= 67.2 && resolvedX >= -98.2 && resolvedX <= -86.6) {
          if (oldZ < 66.7) resolvedZ = 66.1;
          else resolvedZ = 67.3;
        }
        // South Portal Wall Right: [-83.4, -71.8] at z=66.7
        if (resolvedZ >= 66.2 && resolvedZ <= 67.2 && resolvedX >= -83.4 && resolvedX <= -71.8) {
          if (oldZ < 66.7) resolvedZ = 66.1;
          else resolvedZ = 67.3;
        }
        // North Balcony Escape Wall Left: [-98.2, -86.5] at z=90.3
        if (resolvedZ >= 89.8 && resolvedZ <= 90.8 && resolvedX >= -98.2 && resolvedX <= -86.5) {
          if (oldZ > 90.3) resolvedZ = 90.9;
          else resolvedZ = 89.7;
        }
        // North Balcony Escape Wall Right: [-83.5, -71.8] at z=90.3
        if (resolvedZ >= 89.8 && resolvedZ <= 90.8 && resolvedX >= -83.5 && resolvedX <= -71.8) {
          if (oldZ > 90.3) resolvedZ = 90.9;
          else resolvedZ = 89.7;
        }
        // West Outer Wall South of Escape Doorway: [65.2, 75.3] at x=-96.8
        if (resolvedX >= -97.3 && resolvedX <= -96.3 && resolvedZ >= 65.2 && resolvedZ <= 75.3) {
          if (oldX < -96.8) resolvedX = -97.4;
          else resolvedX = -96.2;
        }
        // West Outer Wall North of Escape Doorway: [78.1, 91.8] at x=-96.8
        if (resolvedX >= -97.3 && resolvedX <= -96.3 && resolvedZ >= 78.1 && resolvedZ <= 91.8) {
          if (oldX < -96.8) resolvedX = -97.4;
          else resolvedX = -96.2;
        }
        // East Outer Wall: [65.2, 91.8] at x=-73.2
        if (resolvedX >= -73.7 && resolvedX <= -72.7 && resolvedZ >= 65.2 && resolvedZ <= 91.8) {
          if (oldX > -73.2) resolvedX = -72.6;
          else resolvedX = -73.8;
        }

        // ── Interior Room Partition Walls (Solid Walls with Doorway Openings) ──
        // Wall A (West Partition): x = -89.5 (South segment [66.7, 77.9], North segment [80.1, 87.7])
        if (resolvedX >= -89.9 && resolvedX <= -89.1) {
          if ((resolvedZ >= 66.7 && resolvedZ <= 77.9) || (resolvedZ >= 80.1 && resolvedZ <= 87.7)) {
            if (oldX < -89.5) resolvedX = -90.0;
            else resolvedX = -89.0;
          }
        }

        // Wall B (East Partition): x = -80.5 (South segment [66.7, 77.9], North segment [80.1, 87.7])
        if (resolvedX >= -80.9 && resolvedX <= -80.1) {
          if ((resolvedZ >= 66.7 && resolvedZ <= 77.9) || (resolvedZ >= 80.1 && resolvedZ <= 87.7)) {
            if (oldX < -80.5) resolvedX = -81.0;
            else resolvedX = -80.0;
          }
        }

        // Wall C (South Foyer Wall): z = 72.5 (Left [-89.5, -86.2], Right [-83.8, -80.5])
        if (resolvedZ >= 72.1 && resolvedZ <= 72.9) {
          if ((resolvedX >= -89.5 && resolvedX <= -86.2) || (resolvedX >= -83.8 && resolvedX <= -80.5)) {
            if (oldZ < 72.5) resolvedZ = 72.0;
            else resolvedZ = 73.0;
          }
        }

        // Wall D (North Secret Bypass Wall): z = 87.7 (Left [-96.8, -86.1], Right [-83.9, -73.2])
        if (resolvedZ >= 87.3 && resolvedZ <= 88.1) {
          if ((resolvedX >= -96.8 && resolvedX <= -86.1) || (resolvedX >= -83.9 && resolvedX <= -73.2)) {
            if (oldZ < 87.7) resolvedZ = 87.2;
            else resolvedZ = 88.2;
          }
        }

        // Wall E (West Bedchamber vs Scribe Archives): z = 75.3, solid from x = -96.8 to -90.8
        if (resolvedZ >= 74.9 && resolvedZ <= 75.7 && resolvedX >= -96.8 && resolvedX <= -90.8) {
          if (oldZ < 75.3) resolvedZ = 74.8;
          else resolvedZ = 75.8;
        }

        // Wall F (East Treasury vs Armory): z = 75.3, solid from x = -79.2 to -73.2
        if (resolvedZ >= 74.9 && resolvedZ <= 75.7 && resolvedX >= -79.2 && resolvedX <= -73.2) {
          if (oldZ < 75.3) resolvedZ = 74.8;
          else resolvedZ = 75.8;
        }

        // 6 Fluted Lotus Stone Columns in Central Hypostyle Hall
        const PYRAMID_COLUMNS = [
          [-87.8, 74.7], [-82.2, 74.7],
          [-87.8, 78.5], [-82.2, 78.5],
          [-87.8, 82.3], [-82.2, 82.3],
        ];
        for (const [colX, colZ] of PYRAMID_COLUMNS) {
          const distCol = Math.hypot(resolvedX - colX, resolvedZ - colZ);
          const minColDist = 0.52 + playerRadius;
          if (distCol < minColDist && distCol > 0.001) {
            const pushAng = Math.atan2(resolvedZ - colZ, resolvedX - colX);
            resolvedX = colX + Math.cos(pushAng) * minColDist;
            resolvedZ = colZ + Math.sin(pushAng) * minColDist;
          }
        }
      }

      // ── PYRAMID 2: Temple of Anubis Solid Shell & Partitions (Below tier 1: playerY < 3.5m) ──
      // Center: [-110.0, 75.0], 18m x 18m
      if (playerY < 3.5 && resolvedX >= -119.0 && resolvedX <= -101.0 && resolvedZ >= 66.0 && resolvedZ <= 84.0) {
        // South Portal Wall Left of Door: [-118.0, -111.4] at z = 67.0
        if (resolvedZ >= 66.5 && resolvedZ <= 67.5 && resolvedX >= -118.0 && resolvedX <= -111.4) {
          if (oldZ < 67.0) resolvedZ = 66.4;
          else resolvedZ = 67.6;
        }
        // South Portal Wall Right of Door: [-108.6, -102.0] at z = 67.0
        if (resolvedZ >= 66.5 && resolvedZ <= 67.5 && resolvedX >= -108.6 && resolvedX <= -102.0) {
          if (oldZ < 67.0) resolvedZ = 66.4;
          else resolvedZ = 67.6;
        }
        // North Wall Left of Door: [-118.0, -111.3] at z = 83.0
        if (resolvedZ >= 82.5 && resolvedZ <= 83.5 && resolvedX >= -118.0 && resolvedX <= -111.3) {
          if (oldZ > 83.0) resolvedZ = 83.6;
          else resolvedZ = 82.4;
        }
        // North Wall Right of Door: [-108.7, -102.0] at z = 83.0
        if (resolvedZ >= 82.5 && resolvedZ <= 83.5 && resolvedX >= -108.7 && resolvedX <= -102.0) {
          if (oldZ > 83.0) resolvedZ = 83.6;
          else resolvedZ = 82.4;
        }
        // West Outer Wall: x = -118.0
        if (resolvedX >= -118.5 && resolvedX <= -117.5 && resolvedZ >= 66.5 && resolvedZ <= 83.5) {
          if (oldX < -118.0) resolvedX = -118.6;
          else resolvedX = -117.4;
        }
        // East Outer Wall: x = -102.0
        if (resolvedX >= -102.5 && resolvedX <= -101.5 && resolvedZ >= 66.5 && resolvedZ <= 83.5) {
          if (oldX > -102.0) resolvedX = -101.4;
          else resolvedX = -102.6;
        }
        // Interior Dividing Spine West Partition: x = -113.2 (South segment [66.5, 74.8], North segment [77.2, 83.5])
        if (resolvedX >= -113.6 && resolvedX <= -112.8) {
          if ((resolvedZ >= 66.5 && resolvedZ <= 74.8) || (resolvedZ >= 77.2 && resolvedZ <= 83.5)) {
            if (oldX < -113.2) resolvedX = -113.7;
            else resolvedX = -112.7;
          }
        }
        // Interior Dividing Spine East Partition: x = -106.8 (South segment [66.5, 74.8], North segment [77.2, 83.5])
        if (resolvedX >= -107.2 && resolvedX <= -106.4) {
          if ((resolvedZ >= 66.5 && resolvedZ <= 74.8) || (resolvedZ >= 77.2 && resolvedZ <= 83.5)) {
            if (oldX < -106.8) resolvedX = -107.3;
            else resolvedX = -106.3;
          }
        }
        // 4 Columns in Central Column Hall
        const ANUBIS_COLUMNS = [
          [-111.8, 72.5], [-108.2, 72.5],
          [-111.8, 77.5], [-108.2, 77.5],
        ];
        for (const [colX, colZ] of ANUBIS_COLUMNS) {
          const distCol = Math.hypot(resolvedX - colX, resolvedZ - colZ);
          const minColDist = 0.45 + playerRadius;
          if (distCol < minColDist && distCol > 0.001) {
            const pushAng = Math.atan2(resolvedZ - colZ, resolvedX - colX);
            resolvedX = colX + Math.cos(pushAng) * minColDist;
            resolvedZ = colZ + Math.sin(pushAng) * minColDist;
          }
        }
      }

      // ── PYRAMID 3: Citadel of Bastet Solid Shell & Partitions (Below tier 1: playerY < 3.4m) ──
      // Center: [-65.0, 53.0], 16m x 16m
      if (playerY < 3.4 && resolvedX >= -73.0 && resolvedX <= -57.0 && resolvedZ >= 45.0 && resolvedZ <= 61.0) {
        // South Portal Wall Left of Door: [-72.0, -66.4] at z = 46.0
        if (resolvedZ >= 45.5 && resolvedZ <= 46.5 && resolvedX >= -72.0 && resolvedX <= -66.4) {
          if (oldZ < 46.0) resolvedZ = 45.4;
          else resolvedZ = 46.6;
        }
        // South Portal Wall Right of Door: [-63.6, -58.0] at z = 46.0
        if (resolvedZ >= 45.5 && resolvedZ <= 46.5 && resolvedX >= -63.6 && resolvedX <= -58.0) {
          if (oldZ < 46.0) resolvedZ = 45.4;
          else resolvedZ = 46.6;
        }
        // North Wall Left of Door: [-72.0, -66.3] at z = 60.0
        if (resolvedZ >= 59.5 && resolvedZ <= 60.5 && resolvedX >= -72.0 && resolvedX <= -66.3) {
          if (oldZ > 60.0) resolvedZ = 60.6;
          else resolvedZ = 59.4;
        }
        // North Wall Right of Door: [-63.7, -58.0] at z = 60.0
        if (resolvedZ >= 59.5 && resolvedZ <= 60.5 && resolvedX >= -63.7 && resolvedX <= -58.0) {
          if (oldZ > 60.0) resolvedZ = 60.6;
          else resolvedZ = 59.4;
        }
        // West Outer Wall: x = -72.0
        if (resolvedX >= -72.5 && resolvedX <= -71.5 && resolvedZ >= 45.5 && resolvedZ <= 60.5) {
          if (oldX < -72.0) resolvedX = -72.6;
          else resolvedX = -71.4;
        }
        // East Outer Wall: x = -58.0
        if (resolvedX >= -58.5 && resolvedX <= -57.5 && resolvedZ >= 45.5 && resolvedZ <= 60.5) {
          if (oldX > -58.0) resolvedX = -57.4;
          else resolvedX = -58.6;
        }
        // Interior Dividing Spine West Partition: x = -67.8 (South segment [45.5, 52.8], North segment [54.8, 60.5])
        if (resolvedX >= -68.2 && resolvedX <= -67.4) {
          if ((resolvedZ >= 45.5 && resolvedZ <= 52.8) || (resolvedZ >= 54.8 && resolvedZ <= 60.5)) {
            if (oldX < -67.8) resolvedX = -68.3;
            else resolvedX = -67.3;
          }
        }
        // Interior Dividing Spine East Partition: x = -62.2 (South segment [45.5, 52.8], North segment [54.8, 60.5])
        if (resolvedX >= -62.6 && resolvedX <= -61.8) {
          if ((resolvedZ >= 45.5 && resolvedZ <= 52.8) || (resolvedZ >= 54.8 && resolvedZ <= 60.5)) {
            if (oldX < -62.2) resolvedX = -62.7;
            else resolvedX = -61.7;
          }
        }
      }
    } else if (distIsland2 < 42.0) {
      // Player is exploring Level 2: Ice Age Island (expanded radius = 30.5m)
      if (distIsland2 > 30.5 && !isOnAtollPier) {
        const angle = Math.atan2(resolvedZ - 65, resolvedX - 85);
        resolvedX = 85 + Math.cos(angle) * 30.5;
        resolvedZ = 65 + Math.sin(angle) * 30.5;
      }

      // Frost Citadel Castle Exterior Solid Walls (Below Roof level: playerY < 3.4m)
      if (playerY < 3.4 && resolvedX >= 76.0 && resolvedX <= 92.0 && resolvedZ >= 61.5 && resolvedZ <= 75.5) {
        // South Wall Left of Entrance Doorway: [76.4, 82.1] at z=62.6
        if (resolvedZ >= 62.1 && resolvedZ <= 63.1 && resolvedX >= 76.4 && resolvedX <= 82.1) {
          if (oldZ < 62.6) resolvedZ = 62.0;
          else resolvedZ = 63.2;
        }
        // South Wall Right of Entrance Doorway: [85.9, 91.6] at z=62.6
        if (resolvedZ >= 62.1 && resolvedZ <= 63.1 && resolvedX >= 85.9 && resolvedX <= 91.6) {
          if (oldZ < 62.6) resolvedZ = 62.0;
          else resolvedZ = 63.2;
        }
        // North Wall: [76.4, 91.6] at z=74.4
        if (resolvedZ >= 73.9 && resolvedZ <= 74.9 && resolvedX >= 76.4 && resolvedX <= 91.6) {
          if (oldZ > 74.4) resolvedZ = 75.0;
          else resolvedZ = 73.8;
        }
        // West Wall: [62.1, 74.9] at x=77.1
        if (resolvedX >= 76.6 && resolvedX <= 77.6 && resolvedZ >= 62.1 && resolvedZ <= 74.9) {
          if (oldX < 77.1) resolvedX = 76.5;
          else resolvedX = 77.7;
        }
        // East Wall: [62.1, 74.9] at x=90.9
        if (resolvedX >= 90.4 && resolvedX <= 91.4 && resolvedZ >= 62.1 && resolvedZ <= 74.9) {
          if (oldX > 90.9) resolvedX = 91.5;
          else resolvedX = 90.3;
        }
      }
    } else if (distIsland4 < 58.0 || isOnRedBridge) {
      // Player is exploring Level 4: Mayabi Hill Tracts (radius = 42.5m) or Large Red Bridge
      if (isOnRedBridge) {
        // Enforce bridge deck side railings (deck width 4.4m)
        if (resolvedZ < -87.0) resolvedZ = -87.0;
        if (resolvedZ > -83.0) resolvedZ = -83.0;

        // Locked security gate barrier to Level 5 at x = -112.0 ("gate off locked for now")
        if (resolvedX < -111.4) {
          resolvedX = -111.4;
        }
      } else if (distIsland4 > 42.5 && !isOnHillPier) {
        const angle = Math.atan2(resolvedZ - (-85), resolvedX - (-60));
        resolvedX = -60 + Math.cos(angle) * 42.5;
        resolvedZ = -85 + Math.sin(angle) * 42.5;
      }

      // Waterfall High Cliff Wall (z in [-105.5, -102.5], width 18m with open cave arch in middle [-63.5, -56.5])
      if (resolvedZ <= -102.5 && resolvedZ >= -105.5 && resolvedX >= -69.0 && resolvedX <= -51.0) {
        if (resolvedX < -63.5 || resolvedX > -56.5) {
          if (oldZ > -102.5) resolvedZ = -102.4;
          else resolvedZ = -105.6;
        }
      }
    } else {
      // Player is exploring Main Island (shoreline at r = 34.6m, extended pier corridor)
      const distFromCenter = Math.hypot(resolvedX, resolvedZ);
      if (distFromCenter > this.arenaRadius && !isOnSouthPier) {
        const angle = Math.atan2(resolvedZ, resolvedX);
        resolvedX = Math.cos(angle) * this.arenaRadius;
        resolvedZ = Math.sin(angle) * this.arenaRadius;
      }
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

