import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { GameCanvas } from './game-canvas';
import { LukaoScene } from './lukao-scene';
import { GameHUD } from './game-hud';
import { VirtualJoystick } from './virtual-joystick';
import { MainMenuModal } from './main-menu-modal';
import { lukaoStore, GameState } from './game-state';

export function LukaoGameView() {
  const { width } = useWindowDimensions();
  const [store, setStore] = useState<GameState>(() => lukaoStore.getState());

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      setStore({ ...lukaoStore.getState() });
    });
    return () => {
      unsub();
    };
  }, []);

  // Responsive Viewport Check: Mobile viewport width (<= 960px) or native mobile or touch screen
  useEffect(() => {
    const isMobileWidth = width <= 960;
    const isNative = Platform.OS !== 'web';
    let isTouch = false;

    if (typeof window !== 'undefined') {
      isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Automatically enable on mobile viewport or touch devices, disable on wide desktop by default
    const shouldShow = isNative || isMobileWidth || isTouch;
    lukaoStore.getState().setShowTouchControls(shouldShow);
  }, [width]);

  return (
    <View style={styles.container}>
      {/* 3D WebGL Canvas Arena (Always full screen) */}
      <GameCanvas>
        <LukaoScene />
      </GameCanvas>

      {/* Game HUD (Title, Timer, Roles, Stealth Indicator, Fisheye Controls, UI Toggle) */}
      <GameHUD />

      {/* On-screen touch controller (Highest layer for immediate responsive touch capture, hidden when Menu is open) */}
      {store.showTouchControls && !store.isMenuOpen && <VirtualJoystick />}

      {/* Animated Main Menu & Missions Modal (Flows into play area) */}
      {store.isMenuOpen && <MainMenuModal />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1a202c',
    overflow: 'hidden',
  },
});
