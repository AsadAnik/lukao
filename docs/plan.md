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
2. **The Crate & Container Maze:**
   - Stacked shipping containers, wooden crates, and barrels creating narrow alleys and dead-ends for hiding.
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

### Phase 4: Polish & Multiplayer Networking
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

