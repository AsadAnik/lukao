import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inputState } from './input-manager';
import { lukaoStore } from './game-state';

const JOYSTICK_RADIUS = 46;

export function VirtualJoystick() {
  const insets = useSafeAreaInsets();
  const [canTag, setCanTag] = useState(false);
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

  const [isPressingJump, setIsPressingJump] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      setCanTag(lukaoStore.getState().canTag);
    });
    return () => {
      unsub();
    };
  }, []);

  // Fixed Joystick base geometry (static bottom-left position)
  const baseLeft = Math.max(insets.left + 24, 28);
  const baseBottom = Math.max(insets.bottom + 18, 22);

  // Center of the joystick base relative to leftTouchZone
  const zoneCenter = useRef<{ x: number; y: number }>({
    x: baseLeft + 60,
    y: 260, // default fallback until onLayout fires
  });

  const handleJoystick = (locX: number, locY: number) => {
    const dx = locX - zoneCenter.current.x;
    const dy = locY - zoneCenter.current.y;
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
  };

  const resetJoystick = () => {
    setKnobOffset({ x: 0, y: 0 });
    setIsJoystickActive(false);
    inputState.joystickX = 0;
    inputState.joystickY = 0;
  };

  // ── 1. Independent Multi-Touch Joystick Handler (Left Half of Screen) ──
  const joystickTouchId = useRef<number | string | null>(null);

  const onJoystickTouchStart = (evt: GestureResponderEvent) => {
    const touches = evt.nativeEvent.changedTouches;
    if (!touches || touches.length === 0) return;
    // Capture the first touch dedicated to this joystick
    if (joystickTouchId.current === null) {
      const touch = touches[0];
      joystickTouchId.current = touch.identifier;
      setIsJoystickActive(true);
      handleJoystick(touch.locationX, touch.locationY);
    }
  };

  const onJoystickTouchMove = (evt: GestureResponderEvent) => {
    if (joystickTouchId.current === null) return;
    const touches = evt.nativeEvent.touches;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === joystickTouchId.current) {
        handleJoystick(touches[i].locationX, touches[i].locationY);
        break;
      }
    }
  };

  const onJoystickTouchEnd = (evt: GestureResponderEvent) => {
    if (joystickTouchId.current === null) return;
    const changed = evt.nativeEvent.changedTouches;
    for (let i = 0; i < changed.length; i++) {
      if (changed[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        resetJoystick();
        break;
      }
    }
  };

  // ── 2. Independent Multi-Touch Camera Look Handler (Right Half of Screen) ──
  const cameraTouchId = useRef<number | string | null>(null);
  const cameraLastPos = useRef({ x: 0, y: 0 });

  const onCameraTouchStart = (evt: GestureResponderEvent) => {
    const touches = evt.nativeEvent.changedTouches;
    if (!touches || touches.length === 0) return;
    if (cameraTouchId.current === null) {
      const touch = touches[0];
      cameraTouchId.current = touch.identifier;
      cameraLastPos.current = { x: touch.pageX, y: touch.pageY };
    }
  };

  const onCameraTouchMove = (evt: GestureResponderEvent) => {
    if (cameraTouchId.current === null) return;
    const touches = evt.nativeEvent.touches;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === cameraTouchId.current) {
        const curX = touches[i].pageX;
        const curY = touches[i].pageY;
        const dx = curX - cameraLastPos.current.x;
        const dy = curY - cameraLastPos.current.y;
        cameraLastPos.current = { x: curX, y: curY };

        // Smooth camera rotation with safe pitch bounds
        inputState.cameraYaw -= dx * 0.007;
        inputState.cameraPitch = Math.max(0.18, Math.min(0.85, inputState.cameraPitch + dy * 0.004));
        break;
      }
    }
  };

  const onCameraTouchEnd = (evt: GestureResponderEvent) => {
    if (cameraTouchId.current === null) return;
    const changed = evt.nativeEvent.changedTouches;
    for (let i = 0; i < changed.length; i++) {
      if (changed[i].identifier === cameraTouchId.current) {
        cameraTouchId.current = null;
        break;
      }
    }
  };

  return (
    <View style={styles.fullScreenOverlay} pointerEvents="box-none">
      {/* ── LEFT HALF: Fixed Joystick Multi-Touch Zone ── */}
      <View
        style={styles.leftTouchZone}
        pointerEvents="auto"
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          zoneCenter.current = {
            x: baseLeft + 60,
            y: height - baseBottom - 60,
          };
        }}
        onTouchStart={onJoystickTouchStart}
        onTouchMove={onJoystickTouchMove}
        onTouchEnd={onJoystickTouchEnd}
        onTouchCancel={onJoystickTouchEnd}
      >
        {/* Fixed Joystick Base (Always anchored at bottom-left; pointerEvents none so touches hit leftTouchZone) */}
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
      </View>

      {/* ── RIGHT HALF: Camera Touch Swipe Zone (Runs simultaneously with left joystick!) ── */}
      <View
        style={styles.rightTouchZone}
        pointerEvents="auto"
        onTouchStart={onCameraTouchStart}
        onTouchMove={onCameraTouchMove}
        onTouchEnd={onCameraTouchEnd}
        onTouchCancel={onCameraTouchEnd}
      />

      {/* ── RIGHT CORNER: Multi-Touch Action Buttons (Tag, Jump, Crouch, Sprint) ── */}
      <View
        style={[
          styles.actionButtonsContainer,
          {
            bottom: Math.max(insets.bottom + 14, 20),
            right: Math.max(insets.right + 16, 20),
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Pulsing TAG Button when within reach of an AI Hider */}
        {canTag && (
          <View
            accessible
            role="button"
            style={[styles.btnBase, styles.btnTag]}
            onTouchStart={(e) => {
              e.stopPropagation();
              lukaoStore.getState().performTagAction();
            }}
          >
            <Text style={styles.btnTextTag}>🎯 TAG!</Text>
          </View>
        )}

        {/* Row for Secondary Buttons: Crouch & Sprint */}
        <View style={styles.secondaryRow} pointerEvents="box-none">
          {/* Crouch Button */}
          <View
            accessible
            role="button"
            style={[
              styles.btnBase,
              styles.btnSmall,
              styles.btnCrouch,
              isCrouching && styles.btnCrouchActive,
            ]}
            onTouchStart={(e) => {
              e.stopPropagation();
              const next = !isCrouching;
              setIsCrouching(next);
              inputState.crouch = next;
            }}
          >
            <Text style={styles.btnTextSmall} numberOfLines={1} adjustsFontSizeToFit>
              CROUCH
            </Text>
          </View>

          {/* Sprint Button */}
          <View
            accessible
            role="button"
            style={[
              styles.btnBase,
              styles.btnSmall,
              styles.btnSprint,
              isSprinting && styles.btnSprintActive,
            ]}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsSprinting(true);
              inputState.sprint = true;
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setIsSprinting(false);
              inputState.sprint = false;
            }}
            onTouchCancel={(e) => {
              e.stopPropagation();
              setIsSprinting(false);
              inputState.sprint = false;
            }}
          >
            <Text style={styles.btnTextSmall} numberOfLines={1} adjustsFontSizeToFit>
              SPRINT
            </Text>
          </View>
        </View>

        {/* Big Jump Button */}
        <View
          accessible
          role="button"
          style={[
            styles.btnBase,
            styles.btnLarge,
            styles.btnJump,
            isPressingJump && styles.btnPressed,
          ]}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsPressingJump(true);
            inputState.jump = true;
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsPressingJump(false);
            setTimeout(() => {
              inputState.jump = false;
            }, 150);
          }}
          onTouchCancel={(e) => {
            e.stopPropagation();
            setIsPressingJump(false);
            setTimeout(() => {
              inputState.jump = false;
            }, 150);
          }}
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
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  leftTouchZone: {
    position: 'absolute',
    left: 0,
    top: 50,
    bottom: 0,
    width: '50%',
    overflow: 'hidden',
  },
  rightTouchZone: {
    position: 'absolute',
    right: 0,
    top: 50,
    bottom: 0,
    width: '50%',
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
    right: 20,
    bottom: 24,
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
