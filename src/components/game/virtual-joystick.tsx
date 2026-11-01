import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lukaoStore } from './game-state';
import { inputState } from './input-manager';

const JOYSTICK_RADIUS = 46;

type TouchId = number | string;

export function VirtualJoystick() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [canTag, setCanTag] = useState(false);
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

  const [isPressingJump, setIsPressingJump] = useState(false);
  const [isPressingCrouch, setIsPressingCrouch] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Synchronous refs to prevent stale closures during rapid touch events
  const isCrouchingRef = useRef(false);
  const canTagRef = useRef(false);

  // Active touch pointer tracking by unique identifier
  const joystickTouchId = useRef<TouchId | null>(null);
  const cameraTouchId = useRef<TouchId | null>(null);
  const sprintTouchId = useRef<TouchId | null>(null);
  const jumpTouchId = useRef<TouchId | null>(null);
  const crouchTouchId = useRef<TouchId | null>(null);

  const cameraLastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      const tagPossible = lukaoStore.getState().canTag;
      setCanTag(tagPossible);
      canTagRef.current = tagPossible;
    });
    return () => {
      unsub();
    };
  }, []);

  // Geometry: Base offsets for Joystick and Action Buttons
  const baseLeft = Math.max(insets.left + 24, 28);
  const baseBottom = Math.max(insets.bottom + 18, 22);
  const baseCenterX = baseLeft + 60;
  const baseCenterY = screenHeight - baseBottom - 60;

  const rightOffset = Math.max(insets.right + 16, 20);
  const bottomOffset = Math.max(insets.bottom + 14, 20);

  // Joystick displacement logic
  const handleJoystick = useCallback((pageX: number, pageY: number) => {
    const dx = pageX - baseCenterX;
    const dy = pageY - baseCenterY;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (dist > JOYSTICK_RADIUS) {
      clampedX = (dx / dist) * JOYSTICK_RADIUS;
      clampedY = (dy / dist) * JOYSTICK_RADIUS;
    }

    setKnobOffset({ x: clampedX, y: clampedY });

    // Dead-zone check (5px)
    if (dist > 5) {
      inputState.joystickX = clampedX / JOYSTICK_RADIUS;
      inputState.joystickY = -clampedY / JOYSTICK_RADIUS; // up on screen is forward (+Y)
    } else {
      inputState.joystickX = 0;
      inputState.joystickY = 0;
    }
  }, [baseCenterX, baseCenterY]);

  const resetJoystick = useCallback(() => {
    setKnobOffset({ x: 0, y: 0 });
    setIsJoystickActive(false);
    inputState.joystickX = 0;
    inputState.joystickY = 0;
  }, []);

  // Dynamic button hitboxes (with precise, non-overlapping partitioning and generous touch slop)
  const getButtonHitBoxes = useCallback(() => {
    const slop = 14;
    const rightEdge = screenWidth - rightOffset;
    const bottomEdge = screenHeight - bottomOffset;

    // 1. Jump Button: 78x78 circle at bottom-right
    const jumpBox = {
      minX: rightEdge - 78 - slop,
      maxX: rightEdge + slop,
      minY: bottomEdge - 78 - slop,
      maxY: bottomEdge + slop,
    };

    // Secondary row (Crouch & Sprint) vertical boundaries:
    // Jump button is 78px tall + 10px gap. Secondary row is 64px tall.
    const secMinY = bottomEdge - 78 - 10 - 64 - slop; // bottomEdge - 152 - slop
    const secMaxY = bottomEdge - 78 - 10 + slop;        // bottomEdge - 88 + slop

    // In the secondary row, Sprint is on the right (64px) and Crouch is on the left (64px) with 10px gap.
    // Total row width is 138px. Midpoint between Crouch and Sprint is rightEdge - 69.
    // 2. Sprint Button Box (right half of secondary row)
    const sprintBox = {
      minX: rightEdge - 69,
      maxX: rightEdge + slop,
      minY: secMinY,
      maxY: secMaxY,
    };

    // 3. Crouch Button Box (left half of secondary row)
    const crouchBox = {
      minX: rightEdge - 138 - slop,
      maxX: rightEdge - 69,
      minY: secMinY,
      maxY: secMaxY,
    };

    // 4. Tag Button Box: 82x44 pill stacked above secondary row (when within reach of a bot)
    const tagBox = {
      minX: rightEdge - 82 - slop,
      maxX: rightEdge + slop,
      minY: bottomEdge - 78 - 10 - 64 - 10 - 44 - slop,
      maxY: bottomEdge - 78 - 10 - 64 - 10 + slop,
    };

    return { jumpBox, sprintBox, crouchBox, tagBox };
  }, [screenWidth, screenHeight, rightOffset, bottomOffset]);

  const isInside = (x: number, y: number, box: { minX: number; maxX: number; minY: number; maxY: number }) => {
    return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
  };

  // Process a new touch down event
  const processTouchDown = useCallback(
    (touch: { identifier?: TouchId; pageX: number; pageY: number }) => {
      const id = touch.identifier ?? 'touch_default';
      const px = touch.pageX;
      const py = touch.pageY;

      // Avoid double-assigning an already registered touch identifier
      if (
        id === joystickTouchId.current ||
        id === cameraTouchId.current ||
        id === sprintTouchId.current ||
        id === jumpTouchId.current ||
        id === crouchTouchId.current
      ) {
        return;
      }

      const { jumpBox, sprintBox, crouchBox, tagBox } = getButtonHitBoxes();

      // 1. Tag Button (highest priority if active)
      if (canTagRef.current && isInside(px, py, tagBox)) {
        lukaoStore.getState().performTagAction();
        return;
      }

      // 2. Jump Button
      if (isInside(px, py, jumpBox)) {
        jumpTouchId.current = id;
        setIsPressingJump(true);
        inputState.jump = true;
        return;
      }

      // 3. Sprint Button (held down for continuous sprinting)
      if (isInside(px, py, sprintBox)) {
        sprintTouchId.current = id;
        setIsSprinting(true);
        inputState.sprint = true;
        return;
      }

      // 4. Crouch Button (toggle stance with tactile press feedback)
      if (isInside(px, py, crouchBox)) {
        crouchTouchId.current = id;
        setIsPressingCrouch(true);
        const next = !isCrouchingRef.current;
        isCrouchingRef.current = next;
        setIsCrouching(next);
        inputState.crouch = next;
        return;
      }

      // 5. Joystick Zone (left 42% of screen or proximity to joystick base)
      const distFromJoy = Math.hypot(px - baseCenterX, py - baseCenterY);
      if (joystickTouchId.current === null && (px < screenWidth * 0.42 || distFromJoy < 110)) {
        joystickTouchId.current = id;
        setIsJoystickActive(true);
        handleJoystick(px, py);
        return;
      }

      // 6. Camera Look Zone (right side outside the buttons)
      if (cameraTouchId.current === null && px >= screenWidth * 0.35) {
        cameraTouchId.current = id;
        cameraLastPos.current = { x: px, y: py };
        return;
      }
    },
    [baseCenterX, baseCenterY, getButtonHitBoxes, handleJoystick, screenWidth]
  );

  // Process touch lift/cancel
  const processTouchUp = useCallback(
    (touch: { identifier?: TouchId }) => {
      const id = touch.identifier ?? 'touch_default';

      if (id === joystickTouchId.current) {
        joystickTouchId.current = null;
        resetJoystick();
      }
      if (id === cameraTouchId.current) {
        cameraTouchId.current = null;
      }
      if (id === sprintTouchId.current) {
        sprintTouchId.current = null;
        setIsSprinting(false);
        inputState.sprint = false;
      }
      if (id === crouchTouchId.current) {
        crouchTouchId.current = null;
        setIsPressingCrouch(false);
      }
      if (id === jumpTouchId.current) {
        jumpTouchId.current = null;
        setIsPressingJump(false);
        setTimeout(() => {
          inputState.jump = false;
        }, 150);
      }
    },
    [resetJoystick]
  );

  const resetAllTouches = useCallback(() => {
    joystickTouchId.current = null;
    cameraTouchId.current = null;
    sprintTouchId.current = null;
    jumpTouchId.current = null;
    crouchTouchId.current = null;
    resetJoystick();
    setIsSprinting(false);
    inputState.sprint = false;
    setIsPressingJump(false);
    setIsPressingCrouch(false);
    inputState.jump = false;
  }, [resetJoystick]);

  // Keep callback refs fresh for PanResponder to prevent stale closure captures
  const processTouchDownRef = useRef(processTouchDown);
  processTouchDownRef.current = processTouchDown;

  const processTouchUpRef = useRef(processTouchUp);
  processTouchUpRef.current = processTouchUp;

  const handleJoystickRef = useRef(handleJoystick);
  handleJoystickRef.current = handleJoystick;

  const resetAllTouchesRef = useRef(resetAllTouches);
  resetAllTouchesRef.current = resetAllTouches;

  // ── Unified Android & iOS Multi-Touch PanResponder ──
  // A single top-level responder view eliminates Android's single-JS-responder collision lock,
  // enabling simultaneous Joystick + Sprint + Camera Orbit + Crouch/Jump.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.changedTouches || evt.nativeEvent.touches;
        if (touches) {
          for (let i = 0; i < touches.length; i++) {
            processTouchDownRef.current(touches[i]);
          }
        }
      },

      onPanResponderStart: (evt) => {
        const touches = evt.nativeEvent.changedTouches || evt.nativeEvent.touches;
        if (touches) {
          for (let i = 0; i < touches.length; i++) {
            processTouchDownRef.current(touches[i]);
          }
        }
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (!touches || touches.length === 0) return;

        for (let i = 0; i < touches.length; i++) {
          const t = touches[i];
          const id = t.identifier ?? 'touch_default';

          if (id === joystickTouchId.current) {
            handleJoystickRef.current(t.pageX, t.pageY);
          } else if (id === cameraTouchId.current) {
            const curX = t.pageX;
            const curY = t.pageY;
            const dx = curX - cameraLastPos.current.x;
            const dy = curY - cameraLastPos.current.y;
            cameraLastPos.current = { x: curX, y: curY };

            if (Number.isFinite(dx) && Number.isFinite(dy)) {
              inputState.cameraYaw -= dx * 0.007;
              inputState.cameraPitch = Math.max(0.18, Math.min(0.85, inputState.cameraPitch + dy * 0.004));
            }
          }
        }
      },

      onPanResponderEnd: (evt) => {
        const changed = evt.nativeEvent.changedTouches;
        if (changed) {
          for (let i = 0; i < changed.length; i++) {
            processTouchUpRef.current(changed[i]);
          }
        }
        if (!evt.nativeEvent.touches || evt.nativeEvent.touches.length === 0) {
          resetAllTouchesRef.current();
        }
      },

      onPanResponderRelease: (evt) => {
        const changed = evt.nativeEvent.changedTouches;
        if (changed) {
          for (let i = 0; i < changed.length; i++) {
            processTouchUpRef.current(changed[i]);
          }
        }
        if (!evt.nativeEvent.touches || evt.nativeEvent.touches.length === 0) {
          resetAllTouchesRef.current();
        }
      },

      onPanResponderTerminate: () => {
        resetAllTouchesRef.current();
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.fullScreenOverlay,
        { top: Math.max(insets.top + 48, 54) },
      ]}
      collapsable={false}
      {...panResponder.panHandlers}
    >
      {/* ── Fixed Joystick Base Visual (pointerEvents="none") ── */}
      <View
        pointerEvents="none"
        style={[
          styles.joystickBase,
          {
            left: baseLeft,
            bottom: baseBottom,
            borderColor: isJoystickActive ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.4)',
            backgroundColor: isJoystickActive ? 'rgba(26, 32, 44, 0.72)' : 'rgba(26, 32, 44, 0.45)',
          },
        ]}
      >
        {/* Subtle directional chevrons/crosshairs */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />
        <View style={styles.innerRing} />

        {/* Directional Labels */}
        <Text style={[styles.dirLabel, styles.dirUp]}>▲</Text>
        <Text style={[styles.dirLabel, styles.dirDown]}>▼</Text>
        <Text style={[styles.dirLabel, styles.dirLeft]}>◀</Text>
        <Text style={[styles.dirLabel, styles.dirRight]}>▶</Text>

        {/* Analog Knob */}
        <View
          style={[
            styles.joystickKnob,
            {
              backgroundColor: isJoystickActive ? '#ecc94b' : 'rgba(255, 255, 255, 0.92)',
              transform: [
                { translateX: knobOffset.x },
                { translateY: knobOffset.y },
              ],
            },
          ]}
        >
          <View style={styles.knobPip} />
        </View>
      </View>

      {/* ── Action Buttons Visual (pointerEvents="none" so all touches route to unified PanResponder) ── */}
      <View
        pointerEvents="none"
        style={[
          styles.actionButtonsContainer,
          {
            bottom: bottomOffset,
            right: rightOffset,
          },
        ]}
      >
        {/* Pulsing TAG Button when within reach of an AI Hider */}
        {canTag && (
          <View style={[styles.btnBase, styles.btnTag]}>
            <Text style={styles.btnTextTag}>🎯 TAG!</Text>
          </View>
        )}

        {/* Row for Secondary Buttons: Crouch & Sprint */}
        <View style={styles.secondaryRow}>
          {/* Crouch Button */}
          <View
            style={[
              styles.btnBase,
              styles.btnSmall,
              styles.btnCrouch,
              isCrouching && styles.btnCrouchActive,
              isPressingCrouch && styles.btnPressed,
            ]}
          >
            <Text style={styles.btnTextSmall} numberOfLines={1} adjustsFontSizeToFit>
              CROUCH
            </Text>
          </View>

          {/* Sprint Button */}
          <View
            style={[
              styles.btnBase,
              styles.btnSmall,
              styles.btnSprint,
              isSprinting && styles.btnSprintActive,
            ]}
          >
            <Text style={styles.btnTextSmall} numberOfLines={1} adjustsFontSizeToFit>
              SPRINT
            </Text>
          </View>
        </View>

        {/* Big Jump Button */}
        <View
          style={[
            styles.btnBase,
            styles.btnLarge,
            styles.btnJump,
            isPressingJump && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnTextJump} numberOfLines={1} adjustsFontSizeToFit>
            JUMP
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.001)', // Non-zero alpha guarantees native touch registration on Android
  },
  joystickBase: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  innerRing: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderStyle: 'dashed',
  },
  crosshairH: {
    position: 'absolute',
    width: 104,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  crosshairV: {
    position: 'absolute',
    height: 104,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dirLabel: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 9,
    fontWeight: '900',
  },
  dirUp: {
    top: 6,
  },
  dirDown: {
    bottom: 6,
  },
  dirLeft: {
    left: 8,
  },
  dirRight: {
    right: 8,
  },
  joystickKnob: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  knobPip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(26, 32, 44, 0.35)',
  },
  actionButtonsContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 25,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnBase: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  btnSmall: {
    width: 64,
    height: 64,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    paddingHorizontal: 2,
  },
  btnLarge: {
    width: 78,
    height: 78,
    borderWidth: 3,
    borderColor: '#ffffff',
    paddingHorizontal: 4,
  },
  btnCrouch: {
    backgroundColor: '#4a5568',
  },
  btnCrouchActive: {
    backgroundColor: '#3182ce',
    borderColor: '#90cdf4',
    transform: [{ scale: 1.05 }],
  },
  btnSprint: {
    backgroundColor: '#38a169',
  },
  btnSprintActive: {
    backgroundColor: '#276749',
    transform: [{ scale: 0.95 }],
  },
  btnJump: {
    backgroundColor: '#ecc94b',
  },
  btnTag: {
    width: 82,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e53e3e',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#e53e3e',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  btnTextTag: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  btnPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.93 }],
  },
  btnTextSmall: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 8.5,
    letterSpacing: 0,
    textAlign: 'center',
  },
  btnTextJump: {
    color: '#744210',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
