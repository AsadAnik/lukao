import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getCowArrayBuffer } from './cow-model-data';
import { VillageChickens } from './village-chickens';

// ── 1. Traditional Bangladeshi Tin-Roofed Homestead (টিনের দোচালা ঘর ও বারান্দা) ──
function TinHomestead({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  // Corrugated tin roof ridge lines for authentic metallic texture
  const numRoofRidges = 14;

  return (
    <group position={position}>
      {/* ── Raised Clay Plinth (মাটির ভিটা) ── */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[7.4, 0.6, 6.4]} />
        <meshStandardMaterial color="#c05621" roughness={0.92} />
      </mesh>

      {/* Veranda Step (বারান্দার সিঁড়ি) */}
      <mesh castShadow receiveShadow position={[0, 0.15, 3.35]}>
        <boxGeometry args={[3.4, 0.3, 0.7]} />
        <meshStandardMaterial color="#dd6b20" roughness={0.9} />
      </mesh>

      {/* ── Main House Walls (মাটির ও বাঁশের তৈরি দেওয়াল) ── */}
      <mesh castShadow receiveShadow position={[0, 1.85, -0.6]}>
        <boxGeometry args={[6.6, 2.5, 4.4]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.85} />
      </mesh>

      {/* Wooden Windows with Teal Shutters (গ্রামের রঙিন কাঠের জানালা) */}
      {[-1.9, 1.9].map((wx, wIdx) => (
        <group key={wIdx} position={[wx, 2.0, 1.62]}>
          {/* White wooden outer trim */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.05, 1.15, 0.05]} />
            <meshStandardMaterial color="#edf2f7" roughness={0.6} />
          </mesh>
          {/* Teal Shutter Panels */}
          <mesh position={[-0.24, 0, 0.04]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.42, 0.98, 0.04]} />
            <meshStandardMaterial color="#319795" roughness={0.5} />
          </mesh>
          <mesh position={[0.24, 0, 0.04]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.42, 0.98, 0.04]} />
            <meshStandardMaterial color="#319795" roughness={0.5} />
          </mesh>
          {/* Window iron security bars (জানালার সিক) */}
          {[-0.12, 0, 0.12].map((bx, bIdx) => (
            <mesh key={bIdx} position={[bx, 0, 0.02]}>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
              <meshStandardMaterial color="#2d3748" metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Wooden Front Door (কাঠের সদর দরজা) */}
      <group position={[0, 1.55, 1.62]}>
        {/* Door frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.35, 2.1, 0.05]} />
          <meshStandardMaterial color="#4a5568" roughness={0.7} />
        </mesh>
        {/* Dark polished wood planks */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.2, 1.95, 0.04]} />
          <meshStandardMaterial color="#744210" roughness={0.7} />
        </mesh>
        {/* Metal door handle / latch (শিকল ও তালা) */}
        <mesh position={[0.45, 0, 0.07]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ecc94b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Open Veranda (আঙিনা ও বারান্দা) ── */}
      {/* Veranda Wooden Pillars (বারান্দার গোল কাঠের খুঁটি) */}
      {[-3.0, -1.0, 1.0, 3.0].map((px, i) => (
        <mesh key={i} castShadow position={[px, 1.5, 2.7]}>
          <cylinderGeometry args={[0.08, 0.09, 2.4, 12]} />
          <meshStandardMaterial color="#744210" roughness={0.8} />
        </mesh>
      ))}

      {/* Veranda Low Bamboo Railing / Seating bench (দাওয়ায় বসার মাচা / রেলিং) */}
      <mesh position={[-2.0, 0.85, 2.7]}>
        <boxGeometry args={[1.8, 0.55, 0.08]} />
        <meshStandardMaterial color="#b7791f" roughness={0.85} />
      </mesh>
      <mesh position={[2.0, 0.85, 2.7]}>
        <boxGeometry args={[1.8, 0.55, 0.08]} />
        <meshStandardMaterial color="#b7791f" roughness={0.85} />
      </mesh>

      {/* ── Iconic Corrugated Tin Roof (টিনের দোচালা ছাদ) ── */}
      {/* Front Pitch Roof (সামনের টিনের চালা) */}
      <group position={[0, 3.45, 1.25]} rotation={[0.52, 0, 0]}>
        {/* Main Silver Corrugated Tin Sheet */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.8, 0.1, 3.7]} />
          <meshStandardMaterial
            color="#cbd5e0"
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
        {/* Corrugated Tin Fluted Ridges (টিনের ঢেউখেলানো খাঁজ) */}
        {Array.from({ length: numRoofRidges }).map((_, rIdx) => {
          const rx = -3.6 + (rIdx / (numRoofRidges - 1)) * 7.2;
          return (
            <mesh key={rIdx} position={[rx, 0.06, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 3.7, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Back Pitch Roof (পেছনের টিনের চালা) */}
      <group position={[0, 3.75, -1.65]} rotation={[-0.52, 0, 0]}>
        {/* Main Silver Sheet */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.8, 0.1, 3.5]} />
          <meshStandardMaterial
            color="#cbd5e0"
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
        {/* Corrugated Ridges */}
        {Array.from({ length: numRoofRidges }).map((_, rIdx) => {
          const rx = -3.6 + (rIdx / (numRoofRidges - 1)) * 7.2;
          return (
            <mesh key={rIdx} position={[rx, 0.06, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 3.5, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Red Metal Ridge Cap (টিনের ঘরের ঐতিহ্যবাহী লাল মটকা / মাটকা) */}
      <mesh castShadow position={[0, 4.4, -0.3]}>
        <boxGeometry args={[8.0, 0.22, 0.28]} />
        <meshStandardMaterial color="#e53e3e" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Wooden Gable Triangle Ends (ঘরের ছাদের দুপাশের কাঠের চালের ত্রিকোণ) */}
      <mesh position={[-3.31, 3.6, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[2.5, 1.45, 4]} />
        <meshStandardMaterial color="#b7791f" roughness={0.8} />
      </mesh>
      <mesh position={[3.31, 3.6, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[2.5, 1.45, 4]} />
        <meshStandardMaterial color="#b7791f" roughness={0.8} />
      </mesh>

      {/* ── Rooftop Climbing Straw Bales & Ramp (চালে ওঠার খড়ের ধাপ) ── */}
      <mesh castShadow receiveShadow position={[3.6, 0.6, -1.8]}>
        <boxGeometry args={[1.3, 1.2, 1.3]} />
        <meshStandardMaterial color="#d69e2e" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[3.6, 1.8, -1.8]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[3.4, 2.9, -1.5]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[1.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#b7791f" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── 2. High-Quality 3D Animated Village Cow (গরু ঘাস খাচ্ছে - Cow.glb) ──
function GrazingCow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [cowScene, setCowScene] = useState<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      const arrayBuffer = getCowArrayBuffer();
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          if (!isMounted) return;

          // Scale and position Cow model appropriately
          gltf.scene.scale.set(0.36, 0.36, 0.36);
          gltf.scene.position.set(0, 0, 0);

          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Play authentic 'Eating' animation (chewing grass / head dipping)
          const mixer = new THREE.AnimationMixer(gltf.scene);
          mixerRef.current = mixer;
          const eatClip =
            gltf.animations.find((a) => a.name === 'Eating') || gltf.animations[0];
          if (eatClip) {
            const action = mixer.clipAction(eatClip);
            action.play();
          }

          setCowScene(gltf.scene);
        },
        (err) => {
          console.warn('[GrazingCow] Cow.glb parse error:', err);
        }
      );
    } catch (err) {
      console.warn('[GrazingCow] Error loading Cow.glb:', err);
    }

    return () => {
      isMounted = false;
      mixerRef.current?.stopAllAction();
    };
  }, []);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 3D Animated Cow (Eating grass) */}
      {cowScene ? (
        <primitive object={cowScene} />
      ) : (
        /* Instant placeholder geometry while parsing in 0ms */
        <mesh castShadow position={[0, 0.75, 0]}>
          <boxGeometry args={[0.9, 0.8, 1.8]} />
          <meshStandardMaterial color="#f7fafc" roughness={0.7} />
        </mesh>
      )}

      {/* ── Feeding Trough / Manger (জাবনা খাওয়ার চাড়ি / গামলা) ── */}
      <group position={[0, 0, 1.9]}>
        {/* Clay / Concrete bowl */}
        <mesh castShadow position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.55, 0.45, 0.55, 16]} />
          <meshStandardMaterial color="#b7791f" roughness={0.85} />
        </mesh>
        {/* Straw / Dry Grass inside (খড় ও ভুসি) */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
          <meshStandardMaterial color="#ecc94b" roughness={0.9} />
        </mesh>
        {/* Tethering Wooden Post (খুঁটি) */}
        <mesh castShadow position={[-0.8, 0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 1.1, 8]} />
          <meshStandardMaterial color="#744210" roughness={0.8} />
        </mesh>
        {/* Tether Rope */}
        <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.015, 0.015, 0.85, 6]} />
          <meshStandardMaterial color="#d69e2e" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ── 3. Golden Haystack (খড়ের গাদা / পালের মটকা) ──
function VillageHaystack({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Bottom haystack layer */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[2.2, 2.5, 2.0, 16]} />
        <meshStandardMaterial color="#d69e2e" roughness={0.95} />
      </mesh>
      {/* Middle conical dome layer */}
      <mesh castShadow receiveShadow position={[0, 2.6, 0]}>
        <coneGeometry args={[2.25, 1.8, 16]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.9} />
      </mesh>
      {/* Top cone peak */}
      <mesh castShadow position={[0, 3.8, 0]}>
        <coneGeometry args={[1.3, 1.2, 16]} />
        <meshStandardMaterial color="#faf089" roughness={0.85} />
      </mesh>
      {/* Central Bamboo Pole sticking through the top (খড়ের গাদার বাঁশের খুঁটি) */}
      <mesh castShadow position={[0, 4.4, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 1.8, 8]} />
        <meshStandardMaterial color="#744210" roughness={0.8} />
      </mesh>
      {/* Loose straw tufts on ground */}
      <mesh position={[1.4, 0.1, 1.2]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── 5. Village Tubewell (সবুজ চাপাকল / টিউবওয়েল) ──
function VillageTubewell({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Concrete Wash Platform (টিউবওয়েলের পাকা ঘাটলা) */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.4, 1.5, 0.16, 24]} />
        <meshStandardMaterial color="#cbd5e0" roughness={0.7} />
      </mesh>

      {/* Base Flange */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#22543d" roughness={0.5} />
      </mesh>

      {/* Main Cast-Iron Green Body Cylinder (সবুজ টিউবওয়েল বডি) */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 1.0, 12]} />
        <meshStandardMaterial color="#276749" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Pump Head Top Cap */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 0.22, 12]} />
        <meshStandardMaterial color="#22543d" roughness={0.4} />
      </mesh>

      {/* Water Spout (পানির নল) */}
      <mesh castShadow position={[0, 0.85, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 12]} />
        <meshStandardMaterial color="#276749" roughness={0.4} />
      </mesh>

      {/* Classic Long Pump Handle (চাপাকলের হাতল) */}
      <mesh castShadow position={[0, 1.32, -0.45]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.05, 0.06, 0.95]} />
        <meshStandardMaterial color="#1a202c" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Red Plastic Bucket (পানির লাল বালতি) */}
      <mesh castShadow position={[0, 0.35, 0.55]}>
        <cylinderGeometry args={[0.26, 0.19, 0.45, 12]} />
        <meshStandardMaterial color="#e53e3e" roughness={0.5} />
      </mesh>
      {/* Clear Water inside bucket */}
      <mesh position={[0, 0.48, 0.55]}>
        <circleGeometry args={[0.24, 12]} />
        <meshStandardMaterial color="#63b3ed" roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  );
}

// ── 6. Tropical Banana Trees & Coconut Palms (কলা গাছ ও নারিকেল গাছ) ──
function BananaPlant({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Green Trunk (কলার ভেলি/গাছ) */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 2.4, 10]} />
        <meshStandardMaterial color="#48bb78" roughness={0.7} />
      </mesh>

      {/* Wide Arching Banana Leaves (চওড়া কলা পাতা) */}
      {[0, 1.0, 2.1, 3.2, 4.3, 5.4].map((angle, i) => (
        <group key={i} position={[0, 2.2, 0]} rotation={[0, angle, 0]}>
          <mesh castShadow position={[0.7, 0.4, 0]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[1.5, 0.04, 0.55]} />
            <meshStandardMaterial color="#38a169" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Bunch of Green Bananas (সবুজ কলার ছড়ি) */}
      <mesh position={[0.2, 1.8, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#68d391" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CoconutPalm({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tall Curved Trunk (নারিকেল গাছের গুঁড়ি) */}
      <mesh castShadow position={[0.2, 3.2, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.2, 0.32, 6.4, 12]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>

      {/* Trunk Ring Bands */}
      {[1.2, 2.4, 3.6, 4.8].map((h, i) => (
        <mesh key={i} position={[0.2 - i * 0.02, h, 0]}>
          <torusGeometry args={[0.25 - i * 0.015, 0.035, 6, 12]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
      ))}

      {/* Palm Fronds / Canopy (নারিকেল গাছের ডালপালা) */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6].map((angle, i) => (
        <group key={i} position={[0.45, 6.3, 0]} rotation={[0, angle, 0]}>
          <mesh castShadow position={[1.4, -0.4, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[2.8, 0.06, 0.45]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Cluster of Coconuts (ডাব ও নারিকেল) */}
      <mesh position={[0.45, 6.0, 0.2]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#84cc16" roughness={0.65} />
      </mesh>
      <mesh position={[0.6, 6.0, -0.1]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#713f12" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── 7. Earthen Stove & Clay Pitchers (মাটির চুলা ও মাটির কলসি) ──
function ClayStoveAndPots({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Mud Stove (গ্রামের মাটির চুলা) */}
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.38, 0.45, 0.44, 12]} />
        <meshStandardMaterial color="#c05621" roughness={0.9} />
      </mesh>
      {/* Pot on Stove (হাঁড়ি) */}
      <mesh castShadow position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Stacked Clay Pitchers (মাটির কলসি) */}
      <mesh castShadow position={[0.65, 0.26, 0.15]}>
        <sphereGeometry args={[0.26, 12, 12]} />
        <meshStandardMaterial color="#dd6b20" roughness={0.85} />
      </mesh>
      <mesh position={[0.65, 0.55, 0.15]}>
        <cylinderGeometry args={[0.12, 0.08, 0.12, 12]} />
        <meshStandardMaterial color="#c05621" roughness={0.85} />
      </mesh>

      <mesh castShadow position={[-0.55, 0.22, 0.3]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#c05621" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ── Master Component: Bangladeshi Village Area (গ্রামের লুকোচুরি আঙিনা) ──
export function BangladeshiVillage({ position = [-12, 0, 9] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 1. Traditional Bangladeshi Tin-Roofed Homestead (টিনের দোচালা ঘর ও বারান্দা) */}
      <TinHomestead position={[0, 0, 0]} />

      {/* 2. Domestic Cow grazing grass by the homestead (গরু ঘাস খাচ্ছে - Cow.glb with Eating animation) */}
      <GrazingCow position={[-5.4, 0, 2.8]} rotation={[0, 0.8, 0]} />

      {/* 3. Golden Haystacks (খড়ের গাদা - চমৎকার লুকানোর জায়গা) */}
      <VillageHaystack position={[-5.8, 0, -2.2]} scale={1.1} />
      <VillageHaystack position={[-7.8, 0, -0.6]} scale={0.75} />

      {/* 4. Traditional Free-Range Village Chickens & Rooster (দেশি মুরগি ও মোরগের ঝাঁক) */}
      <VillageChickens position={[-0.5, 0, 4.2]} />

      {/* 5. Tubewell with Concrete Pad (চাপাকল) */}
      <VillageTubewell position={[5.2, 0, 2.8]} />

      {/* 6. Tropical Banana Grove & Coconut Palms (কলাবাগান ও নারিকেল গাছ) */}
      <BananaPlant position={[5.4, 0, 0.5]} />
      <BananaPlant position={[5.8, 0, -3.2]} />
      <CoconutPalm position={[5.6, 0, -5.2]} />
      <CoconutPalm position={[-6.8, 0, 4.6]} />

      {/* 7. Clay Oven & Traditional Pots (মাটির চুলা ও কলসি) */}
      <ClayStoveAndPots position={[-4.8, 0, -4.2]} />
    </group>
  );
}
