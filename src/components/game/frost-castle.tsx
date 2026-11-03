import React from 'react';
import * as THREE from 'three';

// ── 1. The Great Walk-In Almira / Wardrobe (পোশাকের আলমিরা — ওয়াক-ইন প্রাইম হাইডিং স্পট) ──
function WalkInAlmira({ position = [-5.8, 0.22, 3.2] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Almira Heavy Carved Timber Frame (Dark Oak) */}
      {/* Back Panel */}
      <mesh position={[0, 1.35, -0.75]}>
        <boxGeometry args={[2.2, 2.5, 0.08]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.85} />
      </mesh>
      {/* Top Cornice Crown with Carved Scrollwork */}
      <mesh position={[0, 2.62, 0]}>
        <boxGeometry args={[2.35, 0.16, 1.65]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.75} />
      </mesh>
      {/* Bottom Plinth */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.25, 0.16, 1.55]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.85} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-1.08, 1.35, 0]}>
        <boxGeometry args={[0.08, 2.45, 1.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[1.08, 1.35, 0]}>
        <boxGeometry args={[0.08, 2.45, 1.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Interior Clothes Hanging Rail & Hanging Coats (Inside Hiding Cover) */}
      <mesh position={[0, 2.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.1, 8]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
      </mesh>
      {/* Hanging Winter Fur Coats inside (Dark Warm Tones) */}
      {[-0.6, 0.0, 0.6].map((cx, i) => (
        <mesh key={i} position={[cx, 1.45, 0]}>
          <boxGeometry args={[0.36, 1.15, 0.7]} />
          <meshStandardMaterial color={i === 0 ? '#1e3a5f' : i === 1 ? '#7f1d1d' : '#14532d'} roughness={0.9} />
        </mesh>
      ))}

      {/* Left Door (Standing wide open at 75° angle — allowing full walk-in access!) */}
      <group position={[-1.08, 1.35, 0.75]} rotation={[0, -1.35, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1.02, 2.35, 0.06]} />
          <meshStandardMaterial color="#5c2c16" roughness={0.75} />
        </mesh>
        {/* Brass Door Handle */}
        <mesh position={[0.92, 0, 0.05]}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
      </group>

      {/* Right Door (Ajar at 60° angle) */}
      <group position={[1.08, 1.35, 0.75]} rotation={[0, 1.05, 0]}>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[1.02, 2.35, 0.06]} />
          <meshStandardMaterial color="#5c2c16" roughness={0.75} />
        </mesh>
        {/* Brass Door Handle */}
        <mesh position={[-0.92, 0, 0.05]}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ── 2. Wardrobe Drawers Bureau (ড্রয়ার ও লুকানোর টেবিল) ──
function WardrobeDrawers({ position = [-3.2, 0.22, 5.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {/* Bureau Base Chest (Warm Dark Oak) */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[2.2, 1.3, 0.9]} />
        <meshStandardMaterial color="#451a03" roughness={0.75} />
      </mesh>
      {/* Pulled-out Top Drawer (Stepped Cover for Crouching Behind) */}
      <mesh position={[0, 0.95, 0.35]}>
        <boxGeometry args={[1.9, 0.3, 0.8]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.7} />
      </mesh>
      {/* Brass Drawer Pulls */}
      {[-0.6, 0.6].map((dx, i) => (
        <mesh key={i} position={[dx, 0.95, 0.76]}>
          <boxGeometry args={[0.15, 0.05, 0.04]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
      ))}
      {/* Tabletop Candlestick with Warm Golden Flame */}
      <group position={[0.7, 1.35, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.24, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Great Banquet Feast Table with Under-Table Crawlspace (ভোজকক্ষের টেবিল) ──
function BanquetTable({ position = [-3.6, 0.22, -3.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Heavy Polished Timber Tabletop (Height = 0.88m, Length = 3.8m, Width = 1.4m — Open Underneath!) */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.14, 1.4]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.65} />
      </mesh>
      {/* Royal Red Table Runner Cloth */}
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[3.4, 0.03, 0.75]} />
        <meshStandardMaterial color="#991b1b" roughness={0.8} />
      </mesh>

      {/* 4 Sturdy Carved Wooden Legs (Crawlspace Underneath for Complete Stealth Hiding!) */}
      {[
        [-1.7, 0.42, -0.55],
        [1.7, 0.42, -0.55],
        [-1.7, 0.42, 0.55],
        [1.7, 0.42, 0.55],
      ].map(([lx, ly, lz], idx) => (
        <mesh key={idx} position={[lx, ly, lz]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.82, 8]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.8} />
        </mesh>
      ))}

      {/* Wooden Dining Chairs along Table */}
      {[-1.1, 0, 1.1].map((cx, i) => (
        <group key={`chair-s-${i}`} position={[cx, 0, 0.95]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.48, 0.06, 0.48]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0.82, -0.2]}>
            <boxGeometry args={[0.48, 0.74, 0.06]} />
            <meshStandardMaterial color="#5c2c16" />
          </mesh>
        </group>
      ))}
      {[-1.1, 0, 1.1].map((cx, i) => (
        <group key={`chair-n-${i}`} position={[cx, 0, -0.95]}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.48, 0.06, 0.48]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0.82, -0.2]}>
            <boxGeometry args={[0.48, 0.74, 0.06]} />
            <meshStandardMaterial color="#5c2c16" />
          </mesh>
        </group>
      ))}

      {/* Warm Candelabra in Center of Table */}
      <group position={[0, 1.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.09, 0.35, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
        {[-0.2, 0, 0.2].map((fx, i) => (
          <mesh key={i} position={[fx, 0.24, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 4. Warm Fireplace & Stone Chimney Hearth (উষ্ণ অগ্নিকুণ্ড) ──
function FireplaceHearth({ position = [-6.4, 0.22, -3.0] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Stone Chimney Breast */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.2, 3.2, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Heavy Carved Timber Fireplace Mantle */}
      <mesh position={[0, 2.0, 0.35]}>
        <boxGeometry args={[2.5, 0.16, 0.5]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>
      {/* Hearth Chamber Cavity */}
      <mesh position={[0, 0.65, 0.25]}>
        <boxGeometry args={[1.5, 1.1, 0.4]} />
        <meshBasicMaterial color="#1e1b18" />
      </mesh>
      {/* Roaring Burning Oak Fire Logs */}
      {[-0.35, 0, 0.35].map((lx, i) => (
        <mesh key={i} position={[lx, 0.22, 0.22]} rotation={[0, 0, (i - 1) * 0.25]}>
          <cylinderGeometry args={[0.07, 0.08, 0.7, 6]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.9} />
        </mesh>
      ))}
      {/* Glowing Warm Embers & Fire Core */}
      <mesh position={[0, 0.4, 0.22]}>
        <coneGeometry args={[0.38, 0.65, 6]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={1.0}
          roughness={0.1}
        />
      </mesh>
      {/* Cozy Fireplace Ambient Glow */}
      <pointLight position={[0, 0.7, 0.6]} color="#f97316" intensity={1.8} distance={7.5} />

      {/* Stack of Chopped Oak Firewood Beside Hearth */}
      <group position={[1.4, 0, 0.2]}>
        {[0.12, 0.3, 0.48].map((ly, i) => (
          <mesh key={i} position={[0, ly, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.65, 6]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 5. Royal Canopy Bed (বিশাল রাজকীয় খাট) ──
function RoyalCanopyBed({ position = [-3.8, 0.22, 2.2] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Carved Dark Oak Bed Frame */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.1, 0.35, 2.5]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.8} />
      </mesh>
      {/* Bed Mattress and Base (Crawlspace Underneath!) */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.9, 0.45, 2.3]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.85} />
      </mesh>
      {/* Silk Pillows */}
      {[-0.55, 0.55].map((px, i) => (
        <mesh key={i} position={[px, 0.85, -0.85]}>
          <boxGeometry args={[0.65, 0.2, 0.45]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      ))}
      {/* 4 Corner Carved Wooden Canopy Posts */}
      {[
        [-0.98, 1.3, -1.18],
        [0.98, 1.3, -1.18],
        [-0.98, 1.3, 1.18],
        [0.98, 1.3, 1.18],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.06, 0.07, 2.45, 8]} />
          <meshStandardMaterial color="#451a03" roughness={0.7} />
        </mesh>
      ))}
      {/* Overhead Timber Canopy Frame */}
      <mesh position={[0, 2.52, 0]}>
        <boxGeometry args={[2.15, 0.1, 2.55]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.75} />
      </mesh>
    </group>
  );
}

// ── 6. Wizard's Library Bookshelves & Secret Study Nook (গ্রন্থাগার ও পড়ার ঘর) ──
function LibraryBookshelves({ position = [5.8, 0.22, 3.2] }: { position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Main Tall Oak Bookshelf (Dark Timber) */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3.4, 2.8, 0.55]} />
        <meshStandardMaterial color="#3b1a08" roughness={0.85} />
      </mesh>
      {/* Shelves with Colorful Spellbooks */}
      {[0.5, 1.1, 1.7, 2.3].map((sy, i) => (
        <group key={i} position={[0, sy, 0.15]}>
          <mesh>
            <boxGeometry args={[3.1, 0.06, 0.45]} />
            <meshStandardMaterial color="#5c2c16" />
          </mesh>
          {/* Rows of books */}
          {[-1.3, -0.7, -0.1, 0.5, 1.1].map((bx, j) => (
            <mesh key={j} position={[bx, 0.18, 0]}>
              <boxGeometry args={[0.42, 0.32, 0.35]} />
              <meshStandardMaterial
                color={
                  (i + j) % 4 === 0
                    ? '#dc2626'
                    : (i + j) % 4 === 1
                    ? '#2563eb'
                    : (i + j) % 4 === 2
                    ? '#16a34a'
                    : '#ca8a04'
                }
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Rolling Timber Library Ladder */}
      <group position={[1.2, 1.25, 0.5]} rotation={[0.18, 0, 0]}>
        {[-0.2, 0.2].map((rx, idx) => (
          <mesh key={idx} position={[rx, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2.6, 6]} />
            <meshStandardMaterial color="#5c2c16" />
          </mesh>
        ))}
        {[-0.9, -0.4, 0.1, 0.6, 1.1].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
            <meshStandardMaterial color="#5c2c16" />
          </mesh>
        ))}
      </group>

      {/* Study Writing Desk & Chair (Hide under desk or behind chair!) */}
      <group position={[0, 0, 1.8]}>
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.6, 0.1, 0.9]} />
          <meshStandardMaterial color="#5c2c16" roughness={0.7} />
        </mesh>
        {/* Desk legs */}
        {[
          [-0.7, 0.35, -0.35],
          [0.7, 0.35, -0.35],
          [-0.7, 0.35, 0.35],
          [0.7, 0.35, 0.35],
        ].map(([dx, dy, dz], k) => (
          <mesh key={k} position={[dx, dy, dz]}>
            <cylinderGeometry args={[0.04, 0.05, 0.7, 6]} />
            <meshStandardMaterial color="#3b1a08" />
          </mesh>
        ))}
        {/* Desk Candlestick */}
        <mesh position={[0.55, 0.86, 0.2]}>
          <cylinderGeometry args={[0.03, 0.06, 0.18, 6]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
        <mesh position={[0.55, 0.98, 0.2]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ── 7. Treasury Gold Chest & Storage Barrels (গুপ্ত ধনভাণ্ডার ও সিন্দুক) ──
function TreasuryArmory({ position = [4.2, 0.22, -3.2] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Giant Oak & Brass Treasure Chest with Open Lid (Hiders can duck inside or behind!) */}
      <group position={[0, 0, 0]}>
        {/* Chest Base Tub */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.5, 0.75, 1.0]} />
          <meshStandardMaterial color="#451a03" roughness={0.75} />
        </mesh>
        {/* Gold Trim Bands */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.52, 0.77, 0.98]} />
          <meshStandardMaterial color="#facc15" metalness={0.75} roughness={0.3} wireframe />
        </mesh>
        {/* Piles of Glittering Gold Coins Inside */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.35, 0.15, 0.85]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} emissive="#ca8a04" emissiveIntensity={0.35} />
        </mesh>
        {/* Open Hinged Lid (Angled Upwards at 110°) */}
        <group position={[0, 0.8, -0.5]} rotation={[-1.9, 0, 0]}>
          <mesh position={[0, 0.1, 0.5]}>
            <cylinderGeometry args={[0.52, 0.52, 1.5, 8, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#5c2c16" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Stacked Wooden Storage Barrels (Great Corner Hiding Barrier) */}
      {[
        { pos: [-1.4, 0.5, 0.2], h: 1.0, r: 0.4 },
        { pos: [-1.4, 0.5, -0.7], h: 1.0, r: 0.4 },
        { pos: [-1.4, 1.4, -0.25], h: 0.9, r: 0.36 },
      ].map((b, i) => (
        <group key={i} position={b.pos as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[b.r, b.r * 1.15, b.h, 10]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          {/* Iron Hoops */}
          {[-0.3, 0.3].map((hy, j) => (
            <mesh key={j} position={[0, hy, 0]}>
              <cylinderGeometry args={[b.r * 1.16, b.r * 1.16, 0.05, 10]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── 8. Warm Wall-Mounted Timber Torch Sconce (উষ্ণ কাঠের মশাল) ──
function WarmWallTorch({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Carved Wood Mount Sconce Backplate */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.16, 0.38, 0.04]} />
        <meshStandardMaterial color="#3b1a08" />
      </mesh>
      {/* Iron Bracket */}
      <mesh position={[0, -0.04, 0.08]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.22, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Glowing Warm Flame Torch */}
      <mesh position={[0, 0.12, 0.14]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
      {/* Soft Warm Pointlight for Cozy Ambient Glow */}
      <pointLight position={[0, 0.2, 0.2]} color="#f59e0b" intensity={0.75} distance={5.5} />
    </group>
  );
}

// ── 9. Master Frost Citadel Castle (বিশাল তুষার রাজপ্রাসাদ — 100% Woody Interior, 14m x 12m) ──
export function FrostCitadelCastle({ position = [-1.0, 0, 3.5] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── 1. Castle Stone Foundation Platform (15.2m x 13.2m — y = 0.10) ── */}
      <mesh receiveShadow position={[0, 0.10, 0]}>
        <boxGeometry args={[15.2, 0.22, 13.2]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>

      {/* ── 2. WARM 100% WOODY INTERIOR FLOOR (Dark Polished Oak Planks, y = 0.23) ── */}
      {/* Entire interior is clean authentic timber flooring with zero flickering */}
      <mesh receiveShadow position={[0, 0.23, 0]}>
        <boxGeometry args={[13.6, 0.04, 11.6]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>
      {/* Oak Plank Floorboard Separators */}
      {[-4.5, -2.5, -0.5, 1.5, 3.5, 5.5].map((fx, i) => (
        <mesh key={i} position={[fx, 0.245, 0]}>
          <boxGeometry args={[0.04, 0.015, 11.5]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.9} />
        </mesh>
      ))}

      {/* ── 3. WARM TIMBER WALL PANELING & WAINSCOTING (উষ্ণ কাঠের দেয়াল) ── */}
      {/* South Interior Wall Paneling (Left & Right of Grand Entrance) */}
      <mesh position={[-4.7, 1.7, -5.6]}>
        <boxGeometry args={[4.6, 2.9, 0.12]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>
      <mesh position={[4.7, 1.7, -5.6]}>
        <boxGeometry args={[4.6, 2.9, 0.12]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* North Interior Wall Paneling */}
      <mesh position={[0, 1.7, 5.6]}>
        <boxGeometry args={[13.6, 2.9, 0.12]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* West Interior Wall Paneling */}
      <mesh position={[-6.6, 1.7, 0]}>
        <boxGeometry args={[0.12, 2.9, 11.6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* East Interior Wall Paneling */}
      <mesh position={[6.6, 1.7, 0]}>
        <boxGeometry args={[0.12, 2.9, 11.6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* ── 4. HEAVY DARK OAK CEILING RAFTER BEAMS (y = 3.25m — Authentic Woody Lodge Atmosphere!) ── */}
      {[-4.8, -2.4, 0.0, 2.4, 4.8].map((rz, i) => (
        <mesh key={i} position={[0, 3.25, rz]} castShadow>
          <boxGeometry args={[13.6, 0.22, 0.28]} />
          <meshStandardMaterial color="#3b1a08" roughness={0.85} />
        </mesh>
      ))}
      {[-4.5, 0.0, 4.5].map((rx, i) => (
        <mesh key={i} position={[rx, 3.32, 0]}>
          <boxGeometry args={[0.26, 0.18, 11.6]} />
          <meshStandardMaterial color="#451a03" roughness={0.85} />
        </mesh>
      ))}

      {/* Suspended Medieval Wooden Wheel Chandelier with Warm Candles in Central Foyer */}
      <group position={[0, 2.8, 0]}>
        {/* Support chains */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {/* Wooden wheel ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.07, 8, 16]} />
          <meshStandardMaterial color="#5c2c16" roughness={0.7} />
        </mesh>
        {/* 6 Warm Golden Candles */}
        {[0, 1, 2, 3, 4, 5].map((ci) => {
          const ang = (ci * Math.PI) / 3;
          return (
            <mesh key={ci} position={[Math.cos(ang) * 0.9, 0.12, Math.sin(ang) * 0.9]}>
              <octahedronGeometry args={[0.07, 0]} />
              <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1.1} />
            </mesh>
          );
        })}
      </group>

      {/* ── 5. Exterior Fortress Stone Shell (Weather-Resistant Granite Outer Walls) ── */}
      {/* South Wall Left of Entrance */}
      <mesh castShadow receiveShadow position={[-4.7, 1.8, -5.9]}>
        <boxGeometry args={[4.8, 3.4, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* South Wall Right of Entrance */}
      <mesh castShadow receiveShadow position={[4.7, 1.8, -5.9]}>
        <boxGeometry args={[4.8, 3.4, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Grand Entrance Arch Top Lintel (Doorway opening: width = 3.8m, height = 2.8m) */}
      <mesh castShadow position={[0, 3.1, -5.9]}>
        <boxGeometry args={[4.6, 0.8, 0.5]} />
        <meshStandardMaterial color="#334155" roughness={0.75} />
      </mesh>

      {/* Open Studded Timber Castle Doors (Thrown wide open against inside walls) */}
      <mesh position={[-2.1, 1.45, -5.4]} rotation={[0, -1.2, 0]}>
        <boxGeometry args={[1.7, 2.5, 0.1]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      <mesh position={[2.1, 1.45, -5.4]} rotation={[0, 1.2, 0]}>
        <boxGeometry args={[1.7, 2.5, 0.1]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* North Wall */}
      <mesh castShadow receiveShadow position={[0, 1.8, 5.9]}>
        <boxGeometry args={[14.2, 3.4, 0.5]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* West Wall */}
      <mesh castShadow receiveShadow position={[-6.9, 1.8, 0]}>
        <boxGeometry args={[0.5, 3.4, 12.2]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* East Wall */}
      <mesh castShadow receiveShadow position={[6.9, 1.8, 0]}>
        <boxGeometry args={[0.5, 3.4, 12.2]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* ── 6. Four Massive Corner Fortress Watchtowers ── */}
      {[
        [-7.0, 0, -6.0],
        [7.0, 0, -6.0],
        [-7.0, 0, 6.0],
        [7.0, 0, 6.0],
      ].map(([tx, ty, tz], i) => (
        <group key={i} position={[tx, ty, tz]}>
          <mesh castShadow receiveShadow position={[0, 2.8, 0]}>
            <cylinderGeometry args={[1.5, 1.7, 5.6, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <mesh position={[0, 5.7, 0]}>
            <cylinderGeometry args={[1.75, 1.5, 0.6, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, 6.9, 0]}>
            <coneGeometry args={[1.8, 2.2, 10]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.25} />
          </mesh>
          <mesh position={[0, 8.1, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── 7. Interior Timber Room Partitions & Wide Carved Arch Doorways ── */}
      {/* Spine Wall Left (Separates Room 1 Banquet from Room 2 Bedchamber) */}
      <mesh position={[-4.2, 1.6, 0]}>
        <boxGeometry args={[4.8, 2.9, 0.28]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>
      {/* Spine Wall Right (Separates Room 4 Treasury from Room 3 Library) */}
      <mesh position={[4.2, 1.6, 0]}>
        <boxGeometry args={[4.8, 2.9, 0.28]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* Cross Partition Wall South (Leaving 2.8m Wide Central Passage) */}
      <mesh position={[0, 1.6, -3.8]}>
        <boxGeometry args={[0.28, 2.9, 3.6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>
      {/* Cross Partition Wall North */}
      <mesh position={[0, 1.6, 3.8]}>
        <boxGeometry args={[0.28, 2.9, 3.6]} />
        <meshStandardMaterial color="#5c2c16" roughness={0.8} />
      </mesh>

      {/* ── 8. Warm Wall Torches for Interior Cozy Illumination ── */}
      <WarmWallTorch position={[-1.7, 2.1, -5.5]} />
      <WarmWallTorch position={[1.7, 2.1, -5.5]} />
      <WarmWallTorch position={[-6.4, 2.1, 0.5]} rotation={[0, Math.PI / 2, 0]} />
      <WarmWallTorch position={[6.4, 2.1, 0.5]} rotation={[0, -Math.PI / 2, 0]} />
      <WarmWallTorch position={[0.2, 2.1, 2.2]} rotation={[0, Math.PI / 2, 0]} />
      <WarmWallTorch position={[-0.2, 2.1, -2.2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── 9. Castle Interior Rooms & Interactive Woody Hiding Furniture ── */}
      {/* Room 1 (South-West): Banquet Hall with Fireplace & Feast Table */}
      <BanquetTable position={[-3.6, 0.22, -3.0]} />
      <FireplaceHearth position={[-6.4, 0.22, -3.0]} />

      {/* Room 2 (North-West): Master Bedchamber with Almira & Drawers */}
      <RoyalCanopyBed position={[-3.8, 0.22, 2.2]} />
      <WalkInAlmira position={[-5.8, 0.22, 3.2]} />
      <WardrobeDrawers position={[-3.2, 0.22, 5.0]} />

      {/* Room 3 (North-East): Wizard's Arcane Library & Study Nook */}
      <LibraryBookshelves position={[5.8, 0.22, 3.2]} />

      {/* Room 4 (South-East): Treasury Gold Chest & Storage Barrels */}
      <TreasuryArmory position={[4.2, 0.22, -3.2]} />

      {/* ── 10. Central Timber Staircase to Castle Battlements Roof (সিঁড়ি) ── */}
      <group position={[1.4, 0.22, 0]}>
        {[
          { pos: [-0.6, 0.3, 0], size: [0.7, 0.4, 1.4] },
          { pos: [-0.6, 0.9, 0.6], size: [0.7, 0.8, 1.4] },
          { pos: [-0.6, 1.6, 1.2], size: [0.7, 0.8, 1.4] },
          { pos: [-0.6, 2.4, 1.8], size: [0.7, 0.8, 1.4] },
          { pos: [-0.6, 3.2, 2.4], size: [0.7, 0.8, 1.4] },
        ].map((st, i) => (
          <mesh key={i} receiveShadow position={st.pos as [number, number, number]}>
            <boxGeometry args={st.size as [number, number, number]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ── 11. Castle Rooftop & Battlements Deck (y = 3.55m — Walkable Panoramic Roof!) ── */}
      <mesh receiveShadow position={[0, 3.55, 0]}>
        <boxGeometry args={[13.6, 0.22, 11.6]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>
      {/* Snow Drifts ONLY on Outer Castle Roof (NOT Inside!) */}
      <mesh position={[0, 3.68, 0]}>
        <boxGeometry args={[13.2, 0.05, 11.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Rooftop Battlements Crenellations */}
      {[-5.5, -3.5, -1.5, 0.5, 2.5, 4.5].map((bx, i) => (
        <group key={i}>
          <mesh position={[bx, 4.0, -5.8]}>
            <boxGeometry args={[1.1, 0.65, 0.45]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[bx, 4.0, 5.8]}>
            <boxGeometry args={[1.1, 0.65, 0.45]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}

      {/* ── 12. Grand Entrance Arch Lanterns (Outside Entrance) ── */}
      {[-2.2, 2.2].map((lx, i) => (
        <group key={i} position={[lx, 1.8, -6.3]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
