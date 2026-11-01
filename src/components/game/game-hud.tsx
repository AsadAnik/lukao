import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lukaoStore, GameState } from './game-state';

export function GameHUD() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isClient, setIsClient] = useState(false);
  const [store, setStore] = useState<GameState>(() => lukaoStore.getState());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      setStore({ ...lukaoStore.getState() });
    });

    // Run game countdown timer
    const interval = setInterval(() => {
      lukaoStore.getState().decrementTimer();
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const isMobile = isClient ? (width <= 960 || Platform.OS !== 'web') : false;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStealthBadge = () => {
    switch (store.stealthStatus) {
      case 'hidden':
        return { text: '🌿 HIDDEN', bg: '#2f855a', color: '#ffffff' };
      case 'partially_hidden':
        return { text: '📦 PARTIAL COVER', bg: '#d69e2e', color: '#ffffff' };
      default:
        return { text: '👁️ EXPOSED', bg: '#e53e3e', color: '#ffffff' };
    }
  };

  const stealth = getStealthBadge();

  return (
    <View
      style={[
        styles.hudContainer,
        store.isMenuOpen && { opacity: 0.35 },
      ]}
      pointerEvents={store.isMenuOpen ? 'none' : 'box-none'}
    >
      {/* ── Top Header Section (Safely below Dynamic Island & Notch in Landscape) ── */}
      <View
        style={{
          paddingTop: Math.max(insets.top + 4, 8),
          paddingLeft: Math.max(insets.left + 10, 14),
          paddingRight: Math.max(insets.right + (isMobile ? 54 : 10), 14),
          gap: 6,
        }}
        pointerEvents="box-none"
      >
        <View style={[styles.topBar, isMobile && styles.topBarMobile]} pointerEvents="box-none">
          {/* Game Title & Status — Desktop only */}
          {!isMobile && (
            <View style={styles.glassCard}>
              <Text style={styles.title}>LUKAO</Text>
              <Text style={styles.subtitle}>Hide & Seek Arena</Text>
            </View>
          )}

          {/* Phase & Countdown Timer */}
          <View style={[styles.glassCard, styles.timerCard, isMobile && styles.timerCardMobile]}>
            <Text style={styles.phaseLabel}>
              {store.phase === 'hiding' ? '🙈 HIDING PHASE' : store.phase === 'seeking' ? '🔍 SEEKING PHASE' : '🏁 MATCH OVER'}
            </Text>
            <Text style={[styles.timerText, isMobile && styles.timerTextMobile]}>
              {formatTimer(store.timeLeft)}
            </Text>
          </View>

          {/* Hiders Remaining Tracker */}
          <View style={[styles.glassCard, styles.hidersCountCard]}>
            <Text style={styles.hidersCountLabel}>HIDERS ALIVE</Text>
            <Text style={styles.hidersCountValue}>
              {store.hidersRemaining} / {store.totalHiders}
            </Text>
          </View>

          {/* Role Switcher Button */}
          <Pressable
            style={[
              styles.glassCard,
              styles.roleButton,
              isMobile && styles.roleButtonMobile,
              { backgroundColor: store.role === 'seeker' ? 'rgba(229, 62, 62, 0.85)' : 'rgba(49, 130, 206, 0.85)' },
            ]}
            onPress={() => store.toggleRole()}
          >
            {!isMobile && <Text style={styles.roleLabel}>ROLE (TAP TO SWAP)</Text>}
            <Text style={[styles.roleValue, isMobile && styles.roleValueMobile]}>
              {store.role === 'seeker' ? '🔍 Seeker' : '🙈 Hider'}
            </Text>
          </Pressable>

          {/* Main Menu & Missions Launcher */}
          <Pressable
            style={[styles.glassCard, styles.menuButton]}
            onPress={() => lukaoStore.getState().openMenu()}
          >
            <Text style={styles.menuButtonText}>📋 MENU</Text>
          </Pressable>
        </View>

        {/* ── Floating Stealth & Proximity Badges ── */}
        <View style={styles.middleBar} pointerEvents="box-none">
          {/* Active Mission Banner */}
          {store.currentMission && (
            <View style={styles.missionBanner}>
              <Text style={styles.missionBannerText}>
                🎯 #{store.currentMission.number}: {store.currentMission.title}
              </Text>
            </View>
          )}
          {/* Proximity Warning Alert (when seeker is near player hider) */}
          {store.role === 'hider' && store.alertNearby && store.phase === 'seeking' && (
            <View style={styles.dangerAlertBadge}>
              <Text style={styles.dangerAlertText}>⚠️ SEEKER NEARBY! HIDE!</Text>
            </View>
          )}

          {/* Stealth Status Indicator */}
          <View style={[styles.stealthBadge, { backgroundColor: stealth.bg }]}>
            <Text style={[styles.stealthText, { color: stealth.color }]}>{stealth.text}</Text>
          </View>

          {/* Desktop Tag Prompt when close to a bot */}
          {!isMobile && store.role === 'seeker' && store.canTag && store.phase === 'seeking' && (
            <Pressable
              style={styles.desktopTagPrompt}
              onPress={() => store.performTagAction()}
            >
              <Text style={styles.desktopTagText}>🎯 CLICK TO TAG HIDER!</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Blind Countdown Overlay for Seeker during Hiding Phase ── */}
      {store.role === 'seeker' && store.phase === 'hiding' && (
        <View style={styles.seekerBlindOverlay} pointerEvents="none">
          <View style={styles.seekerBlindCard}>
            <Text style={styles.seekerBlindTitle}>🙈 CLOSE YOUR EYES!</Text>
            <Text style={styles.seekerBlindSubtitle}>Hiders are scrambling for hiding spots</Text>
            <Text style={styles.seekerBlindCountdown}>{store.timeLeft}</Text>
            <Text style={styles.seekerBlindHint}>Wait at the Seeker Tower until time expires!</Text>
          </View>
        </View>
      )}

      {/* ── Game Over Modal ── */}
      {store.phase === 'game_over' && (
        <View style={styles.gameOverOverlay} pointerEvents="auto">
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverIcon}>
              {store.winner === 'hiders' ? '🏆' : '🔍'}
            </Text>
            <Text style={styles.gameOverTitle}>
              {store.winner === 'hiders'
                ? 'HIDERS WIN! (লুকানো সফল!)'
                : 'SEEKER WINS! (লুকো শেষ!)'}
            </Text>
            <Text style={styles.gameOverSubtitle}>
              {store.role === 'hider'
                ? store.playerCaught
                  ? 'You were caught by the Seeker!'
                  : 'You survived and stayed hidden!'
                : store.winner === 'seekers'
                ? 'All hiders were captured!'
                : 'Time ran out! Hiders escaped!'}
            </Text>

            {/* Game Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Caught</Text>
                <Text style={styles.statValue}>
                  {store.totalHiders - store.hidersRemaining} / {store.totalHiders}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Your Role</Text>
                <Text style={styles.statValue}>
                  {store.role === 'hider' ? 'Hider' : 'Seeker'}
                </Text>
              </View>
            </View>

            {/* Restart Button */}
            <Pressable
              style={styles.restartButton}
              onPress={() => store.restartGame()}
            >
              <Text style={styles.restartButtonText}>🔄 PLAY AGAIN</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Bottom Tool Bar: Only rendered on Desktop View ── */}
      {!isMobile && store.phase !== 'game_over' && (
        <View style={styles.bottomBar} pointerEvents="box-none">
          {/* Desktop Controls Hint */}
          <View style={[styles.glassCard, styles.desktopHint]}>
            <Text style={styles.hintText}>
              ⌨️ <Text style={styles.boldText}>WASD</Text> Move • <Text style={styles.boldText}>Space</Text> Jump • <Text style={styles.boldText}>Shift</Text> Sprint • <Text style={styles.boldText}>C</Text> Crouch • <Text style={styles.boldText}>Drag</Text> Look
            </Text>
          </View>

          {/* Camera & Fisheye Controls Bar */}
          <View style={[styles.glassCard, styles.cameraControls]}>
            <Pressable
              style={[styles.toggleBtn, store.isFisheyeActive && styles.toggleBtnActive]}
              onPress={() => store.toggleFisheye()}
            >
              <Text style={styles.toggleBtnText}>
                {store.isFisheyeActive ? '🐟 Fisheye ON' : '📷 Normal Lens'}
              </Text>
            </Pressable>

            {store.isFisheyeActive && (
              <View style={styles.zoomButtonsRow}>
                {[0.5, 0.65, 0.85].map((z) => (
                  <Pressable
                    key={z}
                    style={[styles.zoomBtn, store.fisheyeZoom === z && styles.zoomBtnActive]}
                    onPress={() => store.setFisheyeZoom(z)}
                  >
                    <Text style={[styles.zoomBtnText, store.fisheyeZoom === z && styles.zoomBtnTextActive]}>
                      {z === 0.5 ? 'Ultra' : z === 0.65 ? 'Wide' : 'Mild'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              style={[styles.toggleBtn, store.cameraMode === 'free' && styles.toggleBtnActive]}
              onPress={() => store.setCameraMode(store.cameraMode === 'follow' ? 'free' : 'follow')}
            >
              <Text style={styles.toggleBtnText}>
                {store.cameraMode === 'follow' ? '🎥 Follow Player' : '🔄 Free Orbit'}
              </Text>
            </Pressable>

            {/* Mobile Touch Controller Toggle */}
            <Pressable
              style={[styles.toggleBtn, store.showTouchControls && styles.toggleBtnActive]}
              onPress={() => store.toggleTouchControls()}
            >
              <Text style={styles.toggleBtnText}>
                {store.showTouchControls ? '📱 Touch UI: ON' : '📱 Touch UI: OFF'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hudContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  topBarMobile: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(26, 32, 44, 0.78)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: 10,
    fontWeight: '600',
  },
  timerCard: {
    alignItems: 'center',
  },
  timerCardMobile: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  phaseLabel: {
    color: '#ecc94b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  timerTextMobile: {
    fontSize: 16,
  },
  hidersCountCard: {
    alignItems: 'center',
  },
  hidersCountLabel: {
    color: '#90cdf4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hidersCountValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  roleButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  menuButton: {
    backgroundColor: 'rgba(236, 201, 75, 0.22)',
    borderColor: 'rgba(236, 201, 75, 0.65)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#ecc94b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  missionBanner: {
    backgroundColor: 'rgba(236, 201, 75, 0.25)',
    borderColor: '#ecc94b',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missionBannerText: {
    color: '#faf089',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleButtonMobile: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  roleLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '800',
  },
  roleValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  roleValueMobile: {
    fontSize: 12,
  },
  middleBar: {
    alignItems: 'center',
    gap: 8,
  },
  dangerAlertBadge: {
    backgroundColor: '#e53e3e',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: '#e53e3e',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  dangerAlertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stealthBadge: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  stealthText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  desktopTagPrompt: {
    backgroundColor: '#e53e3e',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  desktopTagText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  seekerBlindOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  seekerBlindCard: {
    backgroundColor: 'rgba(26, 32, 44, 0.95)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ecc94b',
    maxWidth: 380,
  },
  seekerBlindTitle: {
    color: '#ecc94b',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  seekerBlindSubtitle: {
    color: '#cbd5e0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  seekerBlindCountdown: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: '900',
    marginVertical: 12,
  },
  seekerBlindHint: {
    color: '#a0aec0',
    fontSize: 11,
    fontStyle: 'italic',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  gameOverCard: {
    backgroundColor: '#1a202c',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: 420,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  gameOverIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  gameOverTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  gameOverSubtitle: {
    color: '#cbd5e0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 20,
    width: '100%',
    justifyContent: 'center',
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statLabel: {
    color: '#a0aec0',
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    color: '#ecc94b',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  restartButton: {
    backgroundColor: '#ecc94b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#744210',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomBar: {
    alignItems: 'center',
    gap: 8,
  },
  desktopHint: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  boldText: {
    color: '#ecc94b',
    fontWeight: '700',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#3182ce',
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  zoomButtonsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  zoomBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  zoomBtnActive: {
    backgroundColor: '#4fd1c5',
  },
  zoomBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
  },
  zoomBtnTextActive: {
    color: '#1a202c',
  },
});
