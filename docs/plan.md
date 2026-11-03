# Lukao 3D (Hide & Seek) — Project Plan & Roadmap

## 1. Game Overview
**Lukao** (লুকোচুরি / Hide & Seek) is a cross-platform 3D multiplayer/singleplayer hide-and-seek casual game built for Web & Mobile using Expo (React Native & WebGL).

### Visual Aesthetic & Inspiration
- **Visual Style:** Playful, vibrant, low-poly cartoon arena inspired by [`pmndrs ecctrl-fisheye`](https://pmndrs.github.io/examples/ecctrl-fisheye/).
- **Camera Perspective:** Wide-angle / Fisheye stylized lens effect providing a dynamic miniature-planet perspective.
- **Atmosphere:** Warm pastel lighting, soft shadows, rounded edges, and colorful architectural elements.

---

## 2. Core Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   LUKAO CLIENT ARCHITECTURE            │
├────────────────────────────────────────────────────────┤
│ Presentation Layer (Expo Router + UI)                 │
│  - HUD, Joysticks, Radar, Timers, Role Announcements   │
├────────────────────────────────────────────────────────┤
│ Rendering & Physics Engine                             │
│  - WebGL / Three.js / React Three Fiber               │
│  - Drei (Fisheye lens distortion, Environment tools)  │
│  - Kinematic / Rapier Physics Controller              │
├────────────────────────────────────────────────────────┤
│ Platform Adapters                                      │
│  - Web: Native WebGL Canvas (Mouse + Keyboard)         │
│  - Mobile: Touch Joystick + Responsive WebGL View     │
└────────────────────────────────────────────────────────┘
```

### Dependencies
- **Core Engine:** `three`, `@react-three/fiber`, `@react-three/drei`
- **Framework:** Expo SDK 58, React 19, Expo Router
- **Controls:** Custom virtual dual-joystick for Mobile; WASD + Mouse Orbit for Web
- **Sound & Haptics:** `expo-av` / `expo-haptics`

---

## 3. Map Design: The Grounding Area ("The Arena")

For an engaging Hide and Seek experience, the ground environment contains strategic zones:

1. **The Lookout Tower (Seeker's Spire):**
   - High elevated platform located near the map edge/center.
   - Used for the Seeker's countdown phase and strategic scanning.
2. **The Bangladeshi Village Homestead (গ্রামের বাড়ি ও খড়ের গাদা):**
   - Traditional corrugated tin-roof house (টিনের দোচালা ঘর) with a raised mud plinth (মাটির ভিটা), wooden pillars, and veranda (বারান্দা).
   - Climbable straw bales and roof ramp allowing players to scramble onto the tin roof for aerial vantage.
   - Golden tiered haystacks (খড়ের গাদা / পালের মটকা) with bamboo spire for prime stealth hiding.
   - Animated domestic cow (দেশি গরু) chewing grass with rhythmic head-bobbing and tail swishing near a mud feeding trough (জাবনা চাড়ি).
   - Classic green cast-iron tubewell (চাপাকল) with concrete platform and red water bucket.
   - Tropical banana grove (কলা গাছ) and coconut palms (নারিকেল গাছ) with traditional clay oven and pots (মাটির চুলা ও কলসি).
3. **The Hedge Grove & Hollow Trees:**
   - Soft foliage and low-poly bushes where players can crouch to conceal their nametag/body.
4. **Tunnels, Underpasses & Bridges:**
   - Low clearance structures where seekers can be bypassed or juked.
5. **The Bouncy Perimeter:**
   - Curved rim preventing players from falling into the void while maintaining high vertical energy.

---

## 4. Phase-by-Phase Roadmap

### Phase 1: Grounding Area & Fisheye Environment (Completed)
- [x] Install Three.js, React Three Fiber, Drei, and expo-gl.
- [x] Create 3D Arena scene with stylized checkered ground, perimeter walls, ramps, and lighting.
- [x] Build Seeker's Tower, Crate Yard, Bush Groves, and Arch Tunnel/Bridge.
- [x] Implement the Fisheye camera effect (`<Fisheye>` distortion rig with adjustable zoom).
- [x] Implement dual-mode input:
  - Desktop: WASD + Space (Jump) + Shift (Sprint) + Mouse Orbit/Follow.
  - Mobile: On-screen virtual analog joystick + Jump + Sprint buttons.
- [x] Add game HUD (Role switcher, countdown phase timer, dynamic stealth indicator).
- [x] Real-time stealth zone detection (in bushes/tunnel -> "HIDDEN", behind crates -> "PARTIAL COVER", open plaza -> "EXPOSED").
- [x] Fullscreen Game Canvas (removed template Expo Starter tabs, Expo docs links, and splash overlay from `_layout.tsx`).

### Phase 2: Character Controller & Physics (Completed)
- [x] Integrate low-poly stylized character model with multi-part rig (head, torso, swinging arms, stride legs, explorer backpack).
- [x] Character animations:
  - Dynamic run cycle with limb swinging, footstep pacing, and banking roll into turns.
  - In-air jumping pose with tucked legs and raised arms.
  - Crouching / sneaking posture with squashed body height and muffled movement.
- [x] Seeker vs Hider role visuals (Seeker spotlight scanner beam, glowing red visor, vs Hider blue explorer suit).
- [x] 3D Kinematic Collision World (`CollisionWorld`):
  - Climbing stair crates and walking on container roofs.
  - Climbing the Seeker Tower ramp up to the observation deck (`y = 6.6`).
  - Climbing and crossing the Arch Bridge (`y = 1.8`) and running through the hollow pipe tunnel.
  - Horizontal obstacle wall sliding and step-up handling (0.5m).
- [x] 360° Camera Orbit & Follow:
  - Mouse drag look on Web / Desktop.
  - Touch swipe look on right half of mobile screen (drag from any empty place to look).
  - Smooth elevation tracking and Fisheye lens curvature.
  - Camera-relative omnidirectional movement mapping (ensures forward, backward, left, right are always true to the camera screen perspective regardless of 360° orbit rotation).
- [x] Responsive Dynamic Mobile Controller (Dual-Mode):
  - Dynamic Floating Analog Joystick (appears wherever thumb touches on left half of screen).
  - Full-screen empty space touch drag look (right half of screen).
  - Dedicated tactile action buttons: JUMP, CROUCH, SPRINT.
  - Viewport-responsive auto-detection (activates on mobile width <= 960px, touch screens, and native apps).
  - Clean Mobile Canvas: Desktop titles, subtitles, keyboard hints, and camera button panels automatically hide on mobile view to provide an unobstructed, immersive mobile gaming experience.
  - SSR Hydration-Proof: Client-only mounting guard (`isClient`) in `HomeScreen` and `GameHUD` eliminates SSR vs client HTML tree mismatch errors on web.
  - Manual HUD toggle button (`📱 Touch UI: ON/OFF`) for testing on any screen size.
  - Simultaneous desktop keyboard + mouse controls (`WASD`, `Space`, `Shift`, `C`, mouse drag look) remain active at all times.

### Phase 3: Hide and Seek Game Loop (Completed)
- [x] **Complete Game State Machine:**
  - `HIDING_PHASE` (20s): Hiders scramble to hiding spots; Seeker is blinded at the Seeker Tower.
  - `SEEKING_PHASE` (75s): Seeker is released with scanner flashlight to track and tag all hiders.
  - `GAME_OVER`: Win/loss screens with caught hider statistics, MVP banners, and instant "PLAY AGAIN" button.
- [x] **Intelligent AI Bots:**
  - AI Hider bots ("Pip", "Milo", "Kiko") run to hiding spots (bush grove, crate alley, tunnel), crouch into stealth, and panic/flee when discovered.
  - AI Seeker bot ("Hunter-9") patrols arena waypoints and chases the player when line-of-sight is exposed.
- [x] **Stealth & Line-of-Sight Mechanics:**
  - 3D Floating Nametags with automatic opacity fading when hiding in bushes or under cover.
  - Proximity Heartbeat Alert: Audio pulse and warning banner ("⚠️ SEEKER NEARBY!") when the seeker approaches within 9m.
  - Proximity Tag Detection: When within 2.2m of a hider, triggers the `🎯 TAG!` action button.
- [x] **Web Audio Procedural Sound Synthesizer:**
  - Zero external MP3 downloads; native browser synthesis for countdown ticks, proximity heartbeat pulses, tag chimes, and victory/defeat fanfares.
- [x] **React Native / Hermes Native Engine Compatibility:**
  - Added global `process.emitWarning` polyfill and automated `postinstall` patch for `three.cjs` to eliminate Android/iOS Hermes crashes when loading CommonJS 3D bundles.
  - Native Event & DOM Safety Guards: Guarded keyboard listeners (`window.addEventListener`) and canvas creation with `Platform.OS === 'web'` to eliminate mobile render crashes on native iOS/Android.
  - Safe-Area Insets & Dynamic Island Support: Wrapped root layout in `SafeAreaProvider` and dynamic padding to prevent notch/island clipping.
  - High-Performance Mobile Action-Cam: Adjusted native FOV (75°) and tuned lighting to eliminate overexposure whiteouts and multi-pass cube camera 180° inversion on mobile.
- [x] **Horizontal Landscape Presentation & Zero-Lag Mobile Performance:**
  - Configured `"orientation": "landscape"` in `app.json` for immersive presentation ergonomics on iPhone and mobile devices.
  - High-Frequency Engine Decoupling (`game-engine-state.ts`): Decoupled 60/120 FPS player physics, smooth camera follow, and AI bot navigation from React component state cycles, resolving the FrontBoard watchdog timeout (`0x8BADF00D` / `semwait_signal`) deadlock.
  - Horizon & Pitch Clamping: Locked camera pitch between `0.18` and `0.85` radians with a default 26° downward tilt (`0.45` rad) to keep the player character and 3D arena perfectly framed without sky or ground clipping.
  - Landscape Virtual HUD: Added dynamic safe-insets for the Dynamic Island / notch and separated the top status HUD from Expo Go's developer menu button.
  - Fixed Position Joystick & Analog Velocity Scaling: Replaced the dynamic floating joystick with an anchored fixed console joystick in the bottom-left corner with crosshairs, dashed guide ring, and directional chevrons. Replaced local event coordinates (`locationX/Y`) with screen-absolute `pageX/Y` to eliminate coordinate jumping and inverted movements on mobile touches. Scaled player velocity by analog displacement (`inputMagnitude`) for responsive sneak-to-sprint control.
  - iOS Simulator & Landscape Local Touch Normalization: Re-anchored the touch gesture responder strictly to local layout bounds (`leftTouchZone` onLayout) with `pointerEvents="none"` on inner joystick components, resolving unresponsiveness and coordinate offsets in landscape on iOS Simulator. Fixed text cut-off on secondary buttons (`CROUCH` and `SPRINT`) with auto-scaling font size and expanded button hitboxes. Latching jump trigger so instantaneous mouse clicks on Simulator register reliably.
  - True Concurrent Multi-Touch Architecture: Replaced React Native's singleton `PanResponder` lock with independent `onTouchStart/Move/End` event streams tracked by touch `identifier`. Players can now move the fixed joystick with their left thumb, orbit the camera with their right thumb, and tap Jump, Crouch, Sprint, or Tag simultaneously with zero responder cancellation or touch lockouts. Added `e.stopPropagation()` on action buttons to prevent camera swipe interference.
- [x] **App Launch Loader & Flowing Animated Missions Menu:**
  - Game Launch Loader (`GameLoader`): 100% offline initial boot screen with pulsing 3D logo, dynamic progress bar (0% to 100%), asset readiness stages, and cycling gameplay tips. Smoothly fades out to reveal the 3D playground arena. Includes instant "⚡ TAP TO ENTER ARENA" skip button so the loader can never get stuck.
  - 100% Offline Engine: Explicitly configured all 3D WebGL assets, AI bots, collision physics, and audio synthesis to run locally with zero network or backend dependency.
  - Animated Flowing Main Menu (`MainMenuModal`): Features spring physics (`flowAnim` from above + `scaleAnim` bounce + `fadeAnim`). When selecting "PLAY GAME" or picking a mission, the menu flows forward and transitions into the 3D play area.
  - Numbered Missions Challenge System: Added 5 unique missions with names, numbers, descriptions, objectives, stars, time limits, and reward badges:
    - `#01: The Great Bush Scramble` [🌿 Easy ★☆☆]
    - `#02: Bridge Over Hunter River` [🌉 Medium ★★☆]
    - `#03: Crate Yard Star Heist` [⭐ Medium ★★☆]
    - `#04: Ghost In The Shadows` [👻 Hard ★★★]
    - `#05: Apex Hunter Strike` [🎯 Extreme ★★★]
  - Role selection card (🙈 Hider vs 🔍 Seeker) with instant quick-play.
  - In-Game HUD Menu Button: Allows players to re-open the menu at any time to switch roles or pick another mission. Camera slowly showcases the 3D arena during menu browsing.
- [x] **Persistent 3D Arena Loading & Live Background Visibility:**
  - **Eliminated Root Scene Re-render Cycles ([`lukao-scene.tsx`](src/components/game/lukao-scene.tsx)):** Uncoupled root WebGL scene from full store state updates. The 3D scene only responds to `cameraMode` changes, preventing the 3D canvas from re-evaluating or flashing empty blue on timer ticks or menu toggles.
  - **Camera Numerical Bounds & NaN Defense ([`fisheye-camera.tsx`](src/components/game/fisheye-camera.tsx)):** Added `Number.isFinite` guards and instant fallback recovery for `cameraYaw`, `cameraPitch`, and player coordinates, eliminating camera teleportation into the void.
  - **Idle Pose Engine During Pause:** While `isMenuOpen` is active, player character and AI bots lock into stable ground idle poses without running physics collisions or velocity accumulations.
  - **Ultra-Translucent Frosted Glass Overlay ([`main-menu-modal.tsx`](src/components/game/main-menu-modal.tsx)):** Scaled modal card to 620px max-width with ultra-clear `rgba(15, 23, 42, 0.62)` frosted transparency, making the 3D ground, trees, and character 100% visible through and around the menu.

- [x] **Universal Mobile & iOS/Android Native Concurrent Multi-Touch Fix:**
  - **Single Unified Multi-Touch Container (`virtual-joystick.tsx`):** Eliminated Android's single-JS-responder collision bottleneck where sibling `PanResponder`s or individual child `onTouchStart` views cancelled each other out.
  - **Dynamic Hitbox Evaluation & Touch Pointer ID Routing:** A single root `PanResponder` with `collapsable={false}` and `rgba(0,0,0,0.001)` bounds receives all active touches (`evt.nativeEvent.touches`) across the window and tracks them by unique pointer `identifier`.
  - **Simultaneous 3+ Finger Inputs:** Players on Android (as well as iOS and Web) can now concurrently:
    1. Move the fixed analog joystick with their left thumb (`joystickX`, `joystickY`).
    2. Hold down the Sprint button with their right thumb (`inputState.sprint = true`).
    3. Swipe and orbit the camera in 360° with another finger (`cameraYaw`, `cameraPitch`).
    4. Tap Jump or Crouch simultaneously with zero responder cancellation or touch lockouts.
  - **Tactile Stance Toggling for Crouch (`virtual-joystick.tsx`):** Fixed double-trigger cancellation by tracking `crouchTouchId` within the unified responder lifecycle. Partitioned Crouch and Sprint secondary row boundaries cleanly at the midpoint (`rightEdge - 69`) with visual press depression (`isPressingCrouch`) and persistent blue active highlight (`isCrouching`) during stealth sneaking.
  - **Child `pointerEvents="none"` Layout Isolation:** Child UI buttons and joystick visuals render cleanly with `pointerEvents="none"`, ensuring Android's native `MotionEvent` pipeline dispatches all multi-pointer events cleanly to the unified container.
  - **Dynamic Projection Matrix & Aspect Sync (`fisheye-camera.tsx`):** Added proactive camera aspect ratio validation and `updateProjectionMatrix()` inside `useFrame`, eliminating degenerate projection matrix culling that turned the canvas solid blue on iPhone orientation switches.
  - **Zero Drei Dependencies on Native:** Replaced `@react-three/drei`'s `<Float>` and DOM-dependent `<OrbitControls>` with 100% native Three.js/R3F rigs (`FloatingStar` and mathematical spherical orbit), eliminating crashes on native iOS `expo-gl`.
  - **Explicit Native Canvas Geometry (`game-canvas.tsx`):** Configured `{ flex: 1, width: '100%', height: '100%' }` with `onCreated` projection initialization so `onLayout` always registers full-screen viewport bounds before WebGL frame starts.
  - **Synchronous Native Startup (`src/app/index.tsx`):** Eliminated the SSR null-return on native iOS/Android engines, ensuring immediate 3D arena mounting.
  - **Live Transparent Menu Backdrop:** 3D arena ground, character, and bots remain 100% loaded and visible behind the frosted menu at startup, gently orbiting in cinematic slow-motion until the user taps Play.

### Phase 4: Polish, Bangladeshi Village & Multiplayer
- [x] **Bangladeshi Village Map Expansion (`bangladeshi-village.tsx`):**
  - **Traditional Bangladeshi Tin-Roofed Homestead (টিনের দোচালা ঘর ও বারান্দা):** Crafted in procedural stylized Three.js geometry matching the vibrant cartoon aesthetic of Lukao. Features a raised clay plinth (`মাটির ভিটা`), veranda step (`সিঁড়ি`), teal double-shutter wooden windows with security bars, dark wood front door with metal latch, open veranda with turned timber pillars and bamboo seating railing, silver corrugated tin roof with fluted ridges (`টিনের ঢেউ`), and the signature red metal ridge cap (`লাল মটকা`).
  - **Zero-External Asset Architecture:** 100% self-contained Three.js geometry with zero external texture downloads, zero Metro bundler memory overhead, and instant 0ms mount across Web, iOS, and Android.
  - **Climbable Straw Bales & Rooftop Access:** Side steps and ramp allowing players to scramble onto the tin roof for high-ground scouting.
  - **Animated Domestic Cow (গরু ঘাস খাচ্ছে - Cow.glb):** Integrated the high-quality 3D animated `Cow.glb` asset. Rigged and skinned with authentic looping `'Eating'` animation (head lowering and chewing grass beside the manger) via `GLTFLoader` and `AnimationMixer` with zero runtime network fetching (`cow-model-data.ts`). Tethered to a wooden post beside a clay feeding manger (`জাবনা চাড়ি`) filled with straw.
  - **Golden Haystacks (খড়ের গাদা):** Conical tiered straw mounds with a central bamboo spire, creating natural hiding spots that trigger `"🌿 HIDDEN"` stealth cover.
  - **Classic Cast-Iron Tubewell (সবুজ চাপাকল):** Green hand pump with pump handle, concrete soaking base (`পাকা ঘাটলা`), and red water bucket.
  - **Rural Foliage & Kitchen:** Broad-leaf banana trees with green banana bunches, tall coconut palms, outdoor clay cooking stove (`মাটির চুলা`), and stacked earthen pots (`মাটির কলসি`).
  - **3D Physics & Collision Integration (`collision-system.ts`):** Complete collision bounds matching the homestead plinth, veranda, walls, tin roof, climbing ramps, haystacks, cow, and tubewell.
  - **AI Bots & Missions Integration:** AI hider bots now utilize the veranda and haystack as strategic hiding waypoints; updated Mission `#03` to *"Gramer Bari Star Heist"*.

### Phase 5: Ocean World & Madbox-Inspired Visual Realism (Completed)
- [x] **Madbox-Inspired Tropical Ocean Archipelago Environment (`ocean-world.tsx`):**
  - **Dynamic Wave Swells & Vertex Displacement:** Subdivided ocean grid geometry with multi-frequency Gerstner/sinusoidal vertex wave displacement and real-time normal updates, giving realistic dynamic sunlight reflections on moving ocean swells.
  - **Shoreline Surf Foam Waves (Surge & Ebb Cycle):** Authentic coastal surf waves with fast wash up the beach and gradual recession with animated foam wake crescents.
  - **Stepped Island Terraces (Topographic Diorama):** Fixed elevation hierarchy so the lush green grass plateau sits proudly on top at $y = 0.0$, stepping down cleanly to sandstone cliffs (`#fed7aa`, $y = -0.16$), golden beach shelf (`#fde047`, $y = -0.32$), wet shoreline (`#d97706`, $y = -0.46$), and submerged reefs (`#0891b2`, $y = -0.62$).
  - **Beach Dock & Moored Wooden Boat (ডিঙি নৌকা ও ঘাট):** Wooden stilt pier walkway leading off the south beach with mooring bollards, rope, and a buoyant handcrafted wooden boat that gently rolls, pitches, and bobs on ocean waves.
  - **Boardwalk & Seamless Collision Integration:** Sandy boardwalk path connecting the central plaza to the south dock; updated `CollisionWorld` to allow walking freely out onto the pier over the water with boundary safety clamping.
  - **Floating Playful Lifebuoy:** Vibrant yellow and red striped donut float bobbing rhythmically in the coastal water beside the pier.
  - **Madbox Hot Air Balloon:** Signature low-poly hot air balloon drifting high above the islands with vibrant vertical stripes, suspension ropes, and passenger basket.
  - **Distant Archipelago Islands & Drifting Cumulus Clouds:** Low-poly neighboring atolls, coconut palms, and fluffy white cumulus clouds slowly orbiting across the tropical horizon.
  - **Cinematic ACES Filmic Tone Mapping & Soft Shadows:** Configured `ACESFilmicToneMapping` (exposure `1.15`), `PCFSoftShadowMap`, and dual-tone hemisphere lighting (sky cyan `#7dd3fc` and sand bounce `#fef08a`) across Web and Native for rich, warm, inviting visual depth.

- [x] **Vibrant Island Grounds, Real Grass & Sand Dust Smoke (`arena-ground.tsx`, `player-character.tsx`, `bush-grove.tsx`):**
  - **Rich Green Grass Island Surface:** Upgraded main plateau to rich vibrant lawn green (`#22c55e` and `#16a34a`) positioned above the coastal cliff tiers.
  - **Network of Warm Sand-Colored Roads:** Organic sand trails (`#fde047` and `#fef08a`) connecting the central plaza to South Beach Pier, the Bangladeshi Tin Homestead, the Seeker Tower, and Bush Thickets.
  - **Real 3D Grass Tufts (`RealGrassTufts`):** High-performance static 3D tapered grass blades across the meadow dotted with colorful wildflowers, optimized without shadow-caster overhead.
  - **Dynamic Sand Smoke / Dust Particle System (`SandDustParticles`):** Lightweight 8-mesh particle pool with fast squared-distance terrain checks that puffs out expanding cartoon dust when sprinting over sand roads or beaches.
  - **Madbox Volumetric Diorama Trees & Foliage:** Volumetric cloud-shaped canopies (`MadboxDioramaTree` / `StylizedCanopyTree`), warm amber timber trunks, layered alpine pines (`StylizedPineTree`), segmented beach coconut palms, and smooth trail boulders.
  - **Rock-Solid Mobile 60 FPS Optimization & Zero-Lag Action Buttons:**
    - Replaced React state knob updates in `VirtualJoystick` with native `Animated.ValueXY` (`knobAnim`), eliminating 100% of React component re-renders during movement.
    - Disabled dynamic shadow-map passes on native mobile (`state.gl.shadowMap.enabled = false`), eliminating multi-pass shadow buffer rendering while keeping sharp contact blob shadows beneath characters.
    - Made `SandDustParticles` and `RealGrassTufts` Web-only, eliminating particle matrix calculations and 144 individual blade draw calls on phones.
    - Tuned player physics with higher base speed (`9.2`), sprint multiplier (`1.55`), and a 140ms input jump buffer for immediate, agile tactile response on mobile touchscreens.

- [x] **Dolphins in Ocean & Island-Hopping Navigation System (`dolphin-system.tsx`, `fisheye-camera.tsx`, `ocean-world.tsx`, `game-canvas.tsx`):**
  - **Sleek Organic Cetacean Sculpt & Waterline Parking Posture:** Unified all coordinate orientations along the forward $+Z$ axis with `[Math.PI / 2, 0, 0]` lathe revolution, completely eliminating inverted/backwards geometry where the beak and tail intersected. Crafted authentic Bottlenose Dolphin anatomy: acoustic melon forehead, tapered rostrum beak with smiling jawline, glassy almond eyes with specular catchlights, crown blowhole, falcate dorsal fin, and crescent caudal flukes with median notch.
  - **Natural Dock Waterline Posture & Hydrodynamic Flipper Rig:**
    - Extended wooden pier walkway out past the shoreline sand shelf ($z = 37.5$) into deep ocean water, repositioning the wooden boat to the left tip and docking the dolphin right alongside the deep pier railing (`1.9, -0.48, 36.0`).
    - Completely cleared the solid golden beach shelf collision boundary ($r = 36.05 > 34.8$): the dolphin is 100% in open crystal-clear water with zero sand clipping, resting directly next to the player's feet at the pier edge.
    - Calibrated vertical waterline height to $y = -0.48$: the dolphin's body is half-submerged in the blue sea while the glossy dorsal fin, back, blowhole, and smiling rostrum crest naturally above the surface.
    - Completely redesigned pectoral flipper geometry and mounting: replaced flat, horizontal $90^\circ$ airplane-wing flippers with curved, hydrodynamic hydrofoils swept sleekly backward along the dolphin's flanks at a natural $38^\circ$ angle (`scale={[-1, 1, 1]}` mirrored).
    - Upgraded cetacean palette with rich sapphire slate navy (`#1e3a5f`), vibrant royal azure flank (`#2563eb`), and pure white underbelly (`#ffffff`) with wet glistening specular highlights (`roughness = 0.20`, `metalness = 0.10`).
    - Removed artificial white splash wake ring from the dolphin's torso, completely eliminating the white circle flying through the air during ocean leaps.
    - True horizontal caudal tail flukes (`rotation={[-Math.PI / 2, 0, 0]}`): rescaled `flukeShape` to a natural $0.96$m span (tips at $\pm 0.48$) with central median notch, aligning flukes flat and parallel with the ocean surface rather than standing vertically like an upright bowtie.
  - **Fail-Safe Ocean Ride Chase Camera & NaN Elimination ([`fisheye-camera.tsx`](src/components/game/fisheye-camera.tsx)):**
    - Added instant transition detection (`wasRidingRef`) on frame 1 of riding: instantly sets initial camera chase coordinates behind the dolphin, completely eliminating the wild disorienting camera sweep through the middle of the island.
    - Bulletproof numeric safeguards: guarded `dt` in `dolphin-system.tsx` with `Number.isFinite(delta)` and capped frame steps at `0.033s` (30 FPS step limit) to guarantee the journey always plays for the full 4.4 seconds across 3 parabolic leaps without skipping or jumping.
    - Robust numeric bounds (`safeDX`, `safeDY`, `safeDZ`) in `fisheye-camera.tsx` to eliminate any possible `NaN` matrix degeneration that previously caused Three.js to clear to solid sky blue.
    - Centered camera chase framing directly on the mounted player character (`safeDY + 0.85`), elevated at $y \ge 2.4$, keeping the character, dolphin, leaps, and ocean swell clearly framed in third-person throughout the journey.
  - **Double-Sided Ocean Water & Expanded Frustum ([`ocean-world.tsx`](src/components/game/ocean-world.tsx), [`game-canvas.tsx`](src/components/game/game-canvas.tsx)):**
    - Configured `side={THREE.DoubleSide}` on the expansive ocean plane so wave swells and aerial leaps never cull the water surface when viewed from any camera angle.
    - Increased `camera.far` from 200 to 500 across Web and Mobile Canvas, ensuring distant archipelago islands, clouds, and Dolphin Atoll remain visible across the ocean horizon.
  - **Immediate HUD State Synchronisation ([`game-hud.tsx`](src/components/game/game-hud.tsx)):** Added high-frequency 50ms polling interval for `dolphinRide.isRiding` and `canRide` so the desktop prompt and active leaping banner ("🌊 LEAPING THROUGH THE SEA...") update instantly on touch/click.
  - **Seamless Multi-Island Dismount & Collision Integration:** Calibrated landing coordinates directly onto the wooden pier planks at Dolphin Atoll (`(75, 0.25, 54)`) and Home Pier (`(3.5, 0.25, 30.5)`). Added explicit pier deck heights ($y = 0.22$) and circular boundary partitioning in `CollisionWorld` to prevent falling through piers or being clamped into the sea.
  - **Continuous Ventral Countershading:** Integrated articulated pearlescent white underbelly plates (`#f1f5f9`) that stretch smoothly along the throat, chest, lumbar spine, and tail keel.
  - **Direct Three.js 60/120 FPS Spinal Wave Engine:** Replaced static React prop passing with direct Three.js Object3D `Group` rotation matrices updated inside `useFrame`, enabling fluid propagating travelling waves (head $\rightarrow$ lumbar $\rightarrow$ peduncle $\rightarrow$ flukes) with flipper hydrodynamic trim and cervical pitch stabilization.
  - **Autonomous Wild Dolphins Pod:** 2 wild dolphins swimming in wide patrol loops around the west lagoon and north bay, leaping gracefully out of the turquoise sea with splash rings.
  - **Interactive Rideable Dolphin Companion ("Tutu"):** Moored at the South Beach Pier. When approaching, triggers the prompt **"🐬 RIDE TO DOLPHIN ATOLL"** on HUD and mobile touch controls (or `[E]` on desktop).
  - **Dolphin Atoll Destination Island (ডলফিন প্রবাল দ্বীপ):** Reachable island across the bay (`[85, 0, 65]`) featuring stepped golden beaches, lush green palm terraces, climbable hillock, Sacred Golden Trophy Star collectible, and a return pier to leap back home!

- [x] **Bangladeshi Village Cultural Adventures & Tall Kashful Long Grass Thickets ([`village-chickens.tsx`](src/components/game/village-chickens.tsx), [`tall-grass.tsx`](src/components/game/tall-grass.tsx), [`bangladeshi-village.tsx`](src/components/game/bangladeshi-village.tsx), [`player-character.tsx`](src/components/game/player-character.tsx)):**
  - **Authentic Free-Range Village Chickens & Rooster Flock (দেশি মুরগি ও মোরগের ঝাঁক):**
    - **Village Rooster (লাল ঝুঁটিওয়ালা দেশি মোরগ):** Proud stance, brilliant sawtoothed crimson comb (`ঝুঁটি`), double pendulous chin wattles, golden-amber neck hackles (`#eab308`), rich terracotta breast, and sweeping arched iridescent teal/black tail sickles (`#0f766e`).
    - **Native Hens (বাদামি দেশি মুরগি):** Warm speckled terracotta and buff plumage, foraging, rhythmic head dipping to peck the ground, and scratching feet.
    - **Baby Chicks (তুলতুলে হলুদ মুরগির ছানা):** Tiny golden-yellow fluffball puffballs (`#fde047`), pinpoint eyes, tiny orange beaks, rapid scurrying feet, and playful following behavior behind the mother hen.
    - **Village Courtyard Accessories:** Woven bamboo winnowing fan (*ধান ঝাড়ার কুলা*) with spilled golden paddy grains (`#eab308`) and an earthen shallow water saucer (*মাটির সানকি*).
    - **Autonomous AI & Playful Adventures:**
      - Periodic pecking cycles, alert head tilting, and cheerful little hops with flapping wings.
      - **Interactive Player Scatter Reaction:** When the player runs near ($< 2.5$m), chickens enter an alarmed state—flapping wings rapidly, emitting cheerful cluck audio cues (`audioManager.playChickenCluck()`), and scurrying away at $3.2\times$ speed with flutter hops before settling down.
  - **Tall Long Grass Groves & Feathery White Kashful (কাশফুল ও দীর্ঘ বুনো ঘাসের বন):**
    - 8 strategic clusters of tall, slender grass stalks (1.35m - 1.9m) with natural curvature and feathery white Kashful plumes (*শরতের কাশফুল* / `#ffffff`) swaying gently in the breeze.
    - **Dynamic Wind Sway & Interactive Rustle:** `useFrame` wind wave simulation; grass blades part and rustle excitedly when the player runs through the grove.
    - **Hide & Seek Stealth Integration:** Standing or crouching inside any of the 8 tall grass groves conceals the player from the Seeker, dynamically transitioning stealth status (`'hidden'` when crouching, `'partially_hidden'` when standing).

- [x] **Grand Bangladeshi Mango Tree & Village Chatal Platform ([`mango-tree.tsx`](src/components/game/mango-tree.tsx)):**
  - **100% Procedural High-Performance Architecture:** Completely removed external 6.7MB `mango_tree.glb` asset and GLTF loading overhead. Built a custom, stylized procedural Mango Tree using lightweight Three.js compound primitives (<200 triangles total).
  - **Aesthetic & Cultural Detail:**
    - Weathered thick trunk with flaring buttress roots (`#78350f` / `#5c2c16`).
    - Sprawling wide boughs and tiered volumetric emerald-green foliage lobes (`#15803d`, `#16a34a`, `#22c55e`).
    - Clusters of hanging ripe golden-yellow and fresh lime-green mangoes (*হিমসাগর ও ল্যাংড়া আম*).
    - Circular terracotta stepped seating platform (*বাঁধানো চাতাল*) with an authentic earthen water pitcher (*মাটির কলসি*).
    - Soft contact circular shadow blob on the ground with zero dynamic shadow map overhead.
  - **Kashful Grass Optimization ([`tall-grass.tsx`](src/components/game/tall-grass.tsx)):**

### Phase 6: Archipelago Island Levels & Frost Citadel Castle (Completed)
- [x] **Island Progression & Scoring System Architecture ([`docs/island-levels-and-progression-plan.md`](docs/island-levels-and-progression-plan.md)):**
  - Converted archipelago islands into unlockable game levels (Level 1: Shonali Gram, Level 2: Ice Age Atoll).
  - Designed scoring engine awarding points based on time-to-win, speed ranks (S/A/B tier), and stealth quality.
  - Implemented persistent player profile (`progression-types.ts`, `progression-storage.ts`).
  - Added Level 2 gatekeeper logic on the South Beach pier requiring 500 Lukao Points to unlock dolphin travel.
- [x] **Expansive Level 2 Ice Age Island ([`ice-age-island.tsx`](src/components/game/ice-age-island.tsx)):**
  - Enlarged island footprint to ~32m radius with submerged reef, ice shelf, packed snow cliffs, and expansive plateau.
  - Lightweight 60 FPS single-draw-call 110-particle snowfall weather system with horizontal wind drift.
  - Dual-tier animated glacial waterfall with hidden walk-in cave behind the falling water curtain.
  - Giant Prehistoric Woolly Mammoth skeleton with 5-rib walk-through tunnel.
  - Deep glacial crevasse with arching translucent ice bridge and crawlway escape tunnel.
  - Multi-chamber Sabertooth ice cavern with dual hiding alcoves.
  - Camouflaged snowmen decoy grove with quirky hats and twig arms for fooling seekers.
  - Floating lagoon ice floes stepping stones leading to an isolated outcrop with a sacred golden star.
- [x] **The Grand Frost Citadel Castle with 100% Woody Interior & Zero Ice ([`frost-castle.tsx`](src/components/game/frost-castle.tsx)):**
  - **100% Ice-Free Interior:** Repositioned high glacier hills, summit ridge, stepped ice stairs, and glacial waterfall to the Northwest quadrant (`[-14, 0, 18]`), ensuring zero glacier or ice cylinders intersect the castle interior.
  - **Cozy Woody Citadel Interior:**
    - Dark polished oak timber plank flooring across the entire ground floor (`y = 0.22`) with royal ruby carpet runner.
    - Warm timber wall paneling / wainscoting lining all interior perimeter and partition walls (`#5c2c16`, `#78350f`).
    - Heavy dark oak rafter beams running across the ceiling (`y = 3.25`).
    - Medieval wooden wheel chandelier with warm flickering candles in central foyer.
    - Stone chimney hearth fireplace in Banquet Hall with roaring fire logs, glowing orange/amber embers, and stacked oak firewood.
    - Warm golden wall sconces with torch flames illuminating wooden walls.
  - **4 Interactive Woody Hiding Rooms:**
    - **Room 1 (South-West): Banquet Hall:** Long timber feast table with open crawlspace underneath to hide, dining chairs, and warm hearth.
    - **Room 2 (North-West): Master Bedchamber:** Walk-In Almira (carved wardrobe with doors wide open, hanging fur coats to walk inside and conceal player), wardrobe drawers bureau with stepped pull-out drawer, and four-poster royal canopy bed.
    - **Room 3 (North-East): Wizard's Arcane Library:** Tall oak bookshelves with colorful spellbooks, rolling library ladder, and study desk & chair.
    - **Room 4 (South-East): Royal Treasury:** Giant oak & brass treasure chest with open lid (duck inside or behind) and stacked wooden storage barrels.
  - **Interior Camera Rig & View System ([`fisheye-camera.tsx`](src/components/game/fisheye-camera.tsx)):**
    - Seamlessly detects when player enters the castle ground floor.
    - Smoothly transitions camera distance from outdoor `7.0m` to close-up interior `2.2m`.
    - Clamps vertical height strictly below ceiling beams (`y < 2.45m`) and clamps horizontal position inside interior wall margins (`[77.8, 90.2]` x `[63.4, 73.8]`).
    - Eliminates camera clipping into exterior walls or roof deck, providing an immersive, cozy third-person view for exploring rooms and hiding inside furniture!
  - **Collision & Stealth Synchronization ([`collision-system.ts`](src/components/game/collision-system.ts), [`player-character.tsx`](src/components/game/player-character.tsx)):**
    - Synchronized interior floor level (`y = 0.22`), open entrance doorway (`x = [82.1, 85.9]`), table crawlspace, and external solid walls.
    - Configured exact stealth hiding zones for Almira, banquet table, drawers, bookshelf, and treasury.

- [x] **Prehistoric Ice Age Animals Kingdom ([`ice-age-animals.tsx`](src/components/game/ice-age-animals.tsx), [`audio-manager.ts`](src/components/game/audio-manager.ts)):**
  - **The Arctic Penguin Colony (3 Animated Penguins Doing Jobs):**
    - **Pip (The Waddling Fisherman):** Waddles back and forth along the ice floes between a wooden fish bucket and water hole, dips head to catch a wiggling silver fish, and deposits it in the bucket.
    - **Pudge (The Belly-Slider):** Drops onto its belly with splayed flippers, slides smoothly across the slick ice into the edge of the lagoon, pops up, shakes off snow feathers, and waddles back.
    - **Percy (The Coastal Lookout):** Perched high on a coastal ice podium, bobbing head, scanning the ocean horizon, and flapping flippers with playful squawks.
  - **Frantic Saber-Toothed Squirrel Scrat & Giant Glowing Golden Acorn:**
    - Scampers nervously around the snow clearing, sniffs the ground, and furiously hammers/rams the prized acorn into the ice with comic head and tail bobs.
    - Reacts in panic when players approach ($< 3.2$m), clutching the acorn against its chest and hopping with synthesized squeak audio cues (`audioManager.playScratSqueak()`).
  - **Living Woolly Mammoth Manny:**
    - Massive shaggy dark brown mammoth roaming across the northern tundra meadow.
    - Grazing behavior: articulated 3-segment trunk curls down to frost shrubs, plucks vegetation, and lifts to mouth to chew while large furry ears flap.
    - Greet roar: emits a deep synthesized mammoth trumpet horn when players approach (`audioManager.playMammothTrumpet()`).
  - **Prowling Saber-Toothed Tiger Diego:**
    - Tawny-gold feline prowling along the rocky ledge of the Sabertooth Ice Cavern.
    - Smooth predatory stalking gait, long curved ivory dagger fangs, amber eyes, and sinuous flicking tail.
  - **Lounging Ground Sloth Sid:**
    - Reclined back comfortably on a slanted snowdrift beside an alpine pine.
    - Lazily scratches its belly with long curved front claws, yawns, and waves to passing players.
  - **Mobile 60 FPS Optimization:** 100% procedural low-poly Three.js compound primitives with direct `useFrame` matrix animation, zero GLTF loading overhead, and Web Audio API synthesized animal sounds.
    - Refactored wind sway from 128 individual blade iterations to single parent group matrix transforms, eliminating JS thread micro-stutter on Hermes/Android.
  - **Collision & Stealth:**
    - Climbable circular platform ($y = 0.35$m) and solid trunk collider in [`collision-system.ts`](src/components/game/collision-system.ts).
    - Shaded cover under the canopy in [`player-character.tsx`](src/components/game/player-character.tsx) for dynamic Hide & Seek concealment.
  - **Guaranteed Locked 60 FPS:** 0 external asset fetches, 0 bundle size bloat, and instantaneous rendering on Android/iOS in Expo Go.
  - **Comprehensive Architectural Guide:** Created [`docs/world-design-and-performance-guide.md`](docs/world-design-and-performance-guide.md) documenting mobile hardware limits, triangle & draw call budgets, collision alignment, and best practices for creating new islands.

### Phase 6: Archipelago Island Levels & Progression System (In Progress)
- [x] **Milestone 1: Progression State & Points Engine ([`progression-types.ts`](src/components/game/progression-types.ts), [`progression-storage.ts`](src/components/game/progression-storage.ts), [`game-state.ts`](src/components/game/game-state.ts)):**
  - Integrated persistent `PlayerProgression` state (`totalPoints`, `highestRank`, `unlockedIslands`, `bestTimes`, `matchesPlayed`, `matchesWon`) into `LukaoStore`.
  - Implemented mathematical scoring engine awarding points and 1-3 stars based on Seeker hunt speed (<30s S-Rank: +500 Pts, 31-50s A-Rank: +350 Pts, >50s B-Rank: +250 Pts) and Hider stealth mastery (0s exposed Ghost Run S-Rank: +450 Pts, <10s A-Rank: +320 Pts, >=10s B-Rank: +250 Pts) with consolation points on losses.
  - Added Level 2 (Dolphin Atoll) gatekeeper requiring 500 Pts with live lock prompts and progress meters at the South Beach Pier.
- [x] **Level 2: Expansive Ice Age Island & Unpredictable Playgrounds ([`ice-age-island.tsx`](src/components/game/ice-age-island.tsx), [`collision-system.ts`](src/components/game/collision-system.ts), [`player-character.tsx`](src/components/game/player-character.tsx)):**
  - **Expansive 32m Glacial Terraces:** Expanded island radius to 32m (more than $3\times$ larger explorable area) with multi-level terrain: main alpine snow field ($y = 0.12$m), mid glacier plateau ($y = 0.65$m), high ridge ($y = 1.45$m), and apex summit ($y = 2.4$m).
  - **The Grand Frost Citadel Castle ([`frost-castle.tsx`](src/components/game/frost-castle.tsx)):** Built a massive 14m x 12m stone fortress with 4 corner watchtowers, grand arched doorway, open walkable interior rooms, and rooftop battlements deck.
  - **Interactive Castle Hide & Seek Furniture:**
    - **Walk-in Almira / Wardrobe:** Double doors ajar with interior fur coats; players step inside to be 100% `🌿 HIDDEN`.
    - **Great Banquet Feast Table:** 3.6m long banquet table with crawlspace underneath to hide while crouching.
    - **Wardrobe Drawers Bureau:** Pulled-out drawers providing stepped ducking cover.
    - **Wizard's Arcane Library:** Secret study alcove concealed behind a tilted bookshelf.
    - **Treasury Gold Chest & Barrels:** Open gilded chest and stacked barrels for corner concealment.
    - **Castle Staircase & Battlements:** Climbable stone stairs leading to panoramic roof deck at $y = 3.65$m.
  - **Dual-Tier Waterfall with Walk-In Secret Grotto:** Translucent cascading waterfall with a concealed walk-in cave cavity hidden *directly behind* the falling water curtain.
  - **Giant Woolly Mammoth Skeleton Tunnel:** Walk-through prehistoric ribcage tunnel (height 2.4m, width 2.8m) under the mammoth's belly and between giant furry leg pillars.
  - **Deep Glacial Crevasse with Ice Bridge & Escape Underpass:** Massive canyon split in the ice with an arching ice bridge above, deep trench below, and secret horizontal escape crawlway.
  - **Camouflaged Snowmen Decoy Grove:** 4 quirky cartoon snowmen where players can blend in as a decoy to trick Seekers.
  - **Floating Lagoon Ice Floes:** Stepping stone ice pads bobbing on the water leading to an isolated crystal prize outcrop.
  - **110-Particle Island-Wide Snowfall:** 60 FPS single draw-call buffer particle system covering the entire 32m radius with polar wind drift.
  - **Collision & Dynamic Stealth:** Updated `CollisionWorld` height mapping for all glacier tiers and integrated stealth zones in `player-character.tsx`.
- [ ] **Milestone 2: Match Summary & Star Ranking UI:** Interactive victory card modal displaying time spent, star rating, points gained, and island unlock meter.
- [ ] **Milestone 3: Pier Gatekeeper & Lock Prompts:** Animated progress bar and lock card on mobile and desktop HUD.
- [ ] **Milestone 4: Archipelago Level Map Modal:** Clickable World Map dialog showing all 5 islands, their themes, points required, and current unlock badges.

### Phase 7: Level 3 — Al-Dahna Desert World & Grand Pyramids (Completed)
- [x] **Comprehensive Architectural Plan ([`docs/level-3-desert-world-plan.md`](docs/level-3-desert-world-plan.md)):**
  - Designed full technical blueprint for Level 3: Al-Dahna Desert Oasis & Grand Pyramids located at `[-85, 0, 75]`.
  - Documented interactive sliding stone door mechanics, Egyptian sarcophagus hiding rooms, oasis watering hole, and desert animal behaviors.
- [x] **Grand Giza Trio: 3 Monumental Pyramids with Furnished Interiors ([`desert-pyramids.tsx`](src/components/game/desert-pyramids.tsx)):**
  - **Visible Exterior Entrance Portals (Solves Outside Visibility Issue):** Stepped sandstone base tiers feature dedicated entrance portal cutouts with monumental flanking pylon towers, access ramps, sliding stone doors, and blazing ceremonial fire braziers clearly visible from across the island.
  - **Pyramid 1: The Great Pharaoh's Citadel Palace (Center `[-85.0, 78.5]`, 26m x 26m — 7 Rooms):**
    - 5-tiered stepped pyramid with golden Pyramidion capstone and $556\text{m}^2$ ($23.6\text{m} \times 23.6\text{m}$) enclosed interior.
    - Solid double-sided perimeter walls and thick ceiling slab (`y = 3.75m`) with zero outer world visual leakage.
    - 7 furnished rooms: Grand Central Hypostyle Hall (6 Lotus columns, 3.8m feast banquet table, Sun Throne), Royal Bedchamber (Egyptian Royal Walk-In Almira, Canopy Daybed crawlspace), Treasury & Gold Vault, Scribe Archives, Palace Armory, Arcane Astronomy Chamber, and North Secret Bypass Corridor.
    - 4 escape routes: South Entrance Portal, North Balcony Terrace, West Oasis Shaft, and North Secret Bypass Corridor.
  - **Pyramid 2: The Temple of Anubis & Arcane Crypts (Center `[-110.0, 75.0]`, 18m x 18m — 4 Rooms):**
    - Dark obsidian masonry, cyan braziers, and silver/cyan capstone (Apex at $y = 13.5\text{m}$).
    - 100% enclosed interior ceiling (`y = 3.4m`) and double-sided perimeter masonry.
    - 4 furnished rooms: Central Hall of Columns (4 granite columns, Sacred Relic Altar Table crawlspace), High Priest's Laboratory (Walk-In Canopic Almira), Crypt of the Golden Scarab, and Arcane Scriptorium with North Dune Escape.
  - **Pyramid 3: Citadel of Bastet & Queen's Palace (Center `[-65.0, 53.0]`, 16m x 16m — 4 Rooms):**
    - Warm terracotta masonry, orange braziers, and bronze/amber capstone (Apex at $y = 11.5\text{m}$).
    - 100% enclosed interior ceiling (`y = 3.3m`) and double-sided perimeter masonry.
    - 4 furnished rooms: Feast Hall of Bastet (cedar dining table, bronze fruit bowls), Queen's Silk Bedchamber (Egyptian Walk-In Silk Almira, velvet daybed), Treasury of Bastet (cedar jewel chest, golden chalices), and Citadel Foyer with North Dune Escape.
- [x] **Desert Wildlife Kingdom & Dynamic Behaviors ([`desert-wildlife.tsx`](src/components/game/desert-wildlife.tsx), [`audio-manager.ts`](src/components/game/audio-manager.ts)):**
  - **Drinking Arabian Horses at Oasis Pond:** Positioned at the pond edge with realistic drinking animation cycles (neck lowering into water, water ripple rings beneath muzzle, tail swishing, and alert head raises with synthesized neighs).
  - **Animated Desert Camels:** Standing camel chewing cud with side-to-side jaw motion, carrying woven caravan saddlebags and brass bells; resting camel kneeling on warm sand.
  - **Slithering Desert Horned Sand Viper:** 9-segment articulated snake body slithering across dunes with realistic sinusoidal travelling wave locomotion, pausing on sunning rocks to raise its head with a flicking red tongue.
  - **High-Altitude Soaring Desert Eagles:** Circling high in thermals ($y = 17\text{m} - 19\text{m}$), tilting head down to surveil characters below, dipping down into banking swoops when players sprint across open sand, and climbing back into the sky.
- [x] **Expansive Master Desert World Island ([`desert-world-island.tsx`](src/components/game/desert-world-island.tsx)):**
  - Massively expanded **48m radius footprint** (Reef ~50m, Shoreline ~46m, Terracotta tier ~43m, Sand plateau ~40m).
  - West, East, and South rolling dune ridges ($y = 0.65\text{m} - 1.4\text{m}$).
  - Crystalline turquoise freshwater oasis pond surrounded by feathery papyrus reeds and sunning rocks.
  - Sprawling desert **Joshua Trees ("judge trees")** with spiky green yucca rosettes and fibrous twisted trunks.
  - Slender desert **Date Palms** with clusters of ripe golden dates.
  - Single-draw-call 100-particle drifting sand dust & heat shimmer weather engine (60 FPS on mobile).
- [x] **Physics, Collision & Camera Synchronization ([`collision-system.ts`](src/components/game/collision-system.ts), [`fisheye-camera.tsx`](src/components/game/fisheye-camera.tsx), [`player-character.tsx`](src/components/game/player-character.tsx)):**
  - Island boundary extended to 44m radius with arrival pier support.
  - Solid physical collision planes backing all room walls, doors, and columns across all 3 pyramids; eliminates wall-crossing bugs.
  - Pyramid Interior Camera Rig with close-up 2.2m distance, bounded under ceilings ($y < 2.45\text{m}$) and clamped within walls for Pyramids 1, 2, and 3.
  - Full stealth cover points: Walk-In Almiras (100% `"HIDDEN"` stealth), banquet tables, daybeds, altars, escape tunnels, papyrus reeds, and camel caravan.
- [x] **Level 2 <-> Level 3 Aerial Hot Air Balloon Transport & Cloud Corridor ([`transport-balloon.tsx`](src/components/game/transport-balloon.tsx)):**
  - **Dual Launch Stations:** Station Level 2 (Alpine Pier `[68.5, 0.45, 78.5]`) and Station Level 3 (Desert Oasis Pier `[-68.5, 0.45, 78.5]`) with interactive boarding pads for two-way travel.
  - **Aerial Cloud Road:** High-altitude quadratic flight trajectory climbing up to $y = 20\text{m} - 22.5\text{m}$ across a 137m ocean expanse, passing through procedural cumulus clouds (`AerialFlightClouds`).
  - **Passenger Basket Mounting:** Player character smoothly steps into and mounts inside the wicker passenger basket beneath glowing hot burner fire and suspension cables.
  - **Dedicated Aerial Chase Camera:** Camera rig switches into floaty high-altitude chase mode (`camDist = 9.5`, `camHeight = 4.8`, looking at basket `safeBY + 1.2`), giving players a bird's-eye panorama of all islands.
  - **HUD & Touch Controls:** Desktop (`[E]` / `[R]` / click) and mobile on-screen touch buttons + HUD banner with 1,200 Pts progression requirement.
  - **Coexistence Guarantee:** Preserves the Level 1 <-> Level 2 Dolphin Ride 100% active and untouched, and leaves the decorative floating balloon in `ocean-world.tsx` untouched.

### Phase 8: Level 4 — Mayabi Hill Tracts & Celestial Paradise (Madbox Edition) (Completed)
- [x] **Comprehensive Architectural Plan ([`docs/level-4-hill-tracts-plan.md`](docs/level-4-hill-tracts-plan.md)):**
  - Technical design for Level 4 (Mayabi Hill Tracts) located in the southern quadrant at `[-60, 0, -85]` with a 46m radius footprint.
  - Madbox stylized low-poly art style: clean stepped plateaus with vertical warm sandstone drop cliffs ($y = 0.85\text{m}, 4.2\text{m}, 8.2\text{m}$), natural terraced stone stair pathways, timber mountain cabin with fieldstone chimney, and conic pine trees.
  - Mountain reservoir lake at $y = 8.2\text{m}$ feeding a cascading cliff waterfall into a winding river gorge, with a secret hiding cave behind the water curtain.
  - Madbox wooden rope footbridge crossing high over the gorge.
  - **Global Night Transition (`DynamicArchipelagoLighting`):** When landing on or approaching Level 4, the whole world smoothly dims to midnight (`#030712`), daytime sun dims, and silver moonlight with 48 glowing fireflies illuminates the archipelago.
  - **Large Red Suspension Bridge (Golden Gate Style) to Level 5:** 36-meter highway bridge spanning across the ocean to an offshore security outpost, complete with red twin suspension towers, catenary cables, and an iron portcullis security gate ("gate off locked for now") with yellow/black hazard barricades and locked red padlock beacon.
  - Winged celestial maidens ("Hoors") with fluttering translucent wings, glowing halos, and graceful patrol paths.
  - Dense mountain tall grass (Pampas / কাশফুল) fields providing comprehensive `"HIDDEN"` stealth escape zones.
  - Oceanic Dolphin Route 2 connecting Level 3 Desert South Pier `[-61, 0, 43]` to Level 4 Hill Tracts Pier `[-60, 0, -60]`.
- [ ] Free CC0 assets integration (Kenney & Quaternius packs).
- [ ] Multiplayer room support (WebSocket / PartyKit / Colyseus).
- [ ] Mobile performance tuning (target rock-solid 60 FPS).

---

## 5. Free 3D Assets Directory & Guidelines

| Category | Recommended Pack | Source | License |
| :--- | :--- | :--- | :--- |
| **Playground & Obstacles** | Kenney Playground Kit | [kenney.nl](https://kenney.nl/assets/playground-kit) | CC0 |
| **Foliage & Nature** | Kenney Nature Kit | [kenney.nl](https://kenney.nl/assets/nature-kit) | CC0 |
| **Characters & Avatars** | Quaternius Animated Characters | [quaternius.com](https://quaternius.com) | CC0 |
| **Props & Hiding Spots** | Poly Pizza Low-Poly Models | [polypizza.com](https://polypizza.com) | CC0 / CC-BY |
| **Rigging & Animations** | Adobe Mixamo | [mixamo.com](https://mixamo.com) | Free |

> **Asset Format Rule:** Store all 3D model files in `assets/models/` using the binary glTF (`.glb`) format for optimal loading performance.

