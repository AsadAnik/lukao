import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lukaoStore, GameState } from './game-state';
import { dolphinRide, startDolphinRide, balloonRide, startBalloonRide } from './game-engine-state';

export function GameHUD() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isClient, setIsClient] = useState(false);
  const [store, setStore] = useState<GameState>(() => lukaoStore.getState());
  const [isRidingDolphin, setIsRidingDolphin] = useState(false);
  const [canRideDolphin, setCanRideDolphin] = useState(false);
  const [dolphinPromptText, setDolphinPromptText] = useState('');
  const [isFlyingBalloon, setIsFlyingBalloon] = useState(false);
  const [canFlyBalloon, setCanFlyBalloon] = useState(false);
  const [balloonPromptText, setBalloonPromptText] = useState('');

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

    // Fast sync for dolphin ride & balloon ride state
    const transportSync = setInterval(() => {
      if (dolphinRide.isRiding !== isRidingDolphin) {
        setIsRidingDolphin(dolphinRide.isRiding);
      }
      if (dolphinRide.canRide !== canRideDolphin) {
        setCanRideDolphin(dolphinRide.canRide);
      }
      if (dolphinRide.promptText !== dolphinPromptText) {
        setDolphinPromptText(dolphinRide.promptText);
      }

      if (balloonRide.isFlying !== isFlyingBalloon) {
        setIsFlyingBalloon(balloonRide.isFlying);
      }
      if (balloonRide.canFly !== canFlyBalloon) {
        setCanFlyBalloon(balloonRide.canFly);
      }
      if (balloonRide.promptText !== balloonPromptText) {
        setBalloonPromptText(balloonRide.promptText);
      }
    }, 50);

    return () => {
      unsub();
      clearInterval(interval);
      clearInterval(transportSync);
    };
  }, [isRidingDolphin, canRideDolphin, dolphinPromptText, isFlyingBalloon, canFlyBalloon, balloonPromptText]);

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

          {/* Player Points & Archipelago Rank Card */}
          <View style={[styles.glassCard, styles.pointsCard, isMobile && styles.pointsCardMobile]}>
            <Text style={styles.pointsLabel}>⭐ LUKAO POINTS</Text>
            <Text style={[styles.pointsValue, isMobile && styles.pointsValueMobile]}>
              {store.progression.totalPoints} <Text style={styles.pointsSubText}>PTS</Text>
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

      {/* ── Game Over Modal with Milestone 1 Progression & Star Rating ── */}
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

            {/* Performance Ranking & Points Card */}
            {store.lastMatchResult && (
              <View style={styles.scoringCard}>
                <View style={styles.rankStarsRow}>
                  <Text style={styles.rankStarsText}>
                    {'⭐'.repeat(store.lastMatchResult.stars)}
                  </Text>
                  <Text style={styles.rankBadgeText}>
                    {store.lastMatchResult.rankTitle}
                  </Text>
                </View>

                <View style={styles.pointsEarnedBanner}>
                  <Text style={styles.pointsEarnedLabel}>POINTS EARNED</Text>
                  <Text style={styles.pointsEarnedValue}>
                    +{store.lastMatchResult.pointsEarned} PTS
                  </Text>
                </View>

                {/* Points Breakdown */}
                <View style={styles.breakdownList}>
                  {store.lastMatchResult.breakdown.map((item, idx) => (
                    <View key={idx} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>• {item.label}</Text>
                      <Text style={styles.breakdownPoints}>+{item.points}</Text>
                    </View>
                  ))}
                </View>

                {/* Account Total Balance */}
                <View style={styles.totalPointsRow}>
                  <Text style={styles.totalPointsLabel}>Total Account Points:</Text>
                  <Text style={styles.totalPointsValue}>
                    {store.lastMatchResult.newTotalPoints} PTS ({store.progression.highestRank})
                  </Text>
                </View>

                {/* Celebratory Unlock Card if Island Unlocked */}
                {store.lastMatchResult.newlyUnlockedIsland && (
                  <View style={styles.unlockCelebrationBanner}>
                    <Text style={styles.unlockCelebrationTitle}>
                      🎉 NEW ISLAND UNLOCKED!
                    </Text>
                    <Text style={styles.unlockCelebrationSubtitle}>
                      🐬 Level {store.lastMatchResult.newlyUnlockedIsland.number}: {store.lastMatchResult.newlyUnlockedIsland.name} ({store.lastMatchResult.newlyUnlockedIsland.nameBn})
                    </Text>
                    <Text style={styles.unlockCelebrationHint}>
                      Dolphin sea ride is now open at the South Beach pier!
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Game Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>
                  {store.lastMatchResult ? `${store.lastMatchResult.timeTaken}s` : `${75 - store.timeLeft}s`}
                </Text>
              </View>
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

      {/* ── Active Dolphin Ride Cinematic Banner ── */}
      {isRidingDolphin && (
        <View style={styles.floatingCenterBanner} pointerEvents="none">
          <View style={styles.dolphinRidingBadge}>
            <Text style={styles.dolphinRidingText}>
              {dolphinRide.promptText || '🌊 LEAPING THROUGH THE SEA...'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Active Hot Air Balloon Flying Banner ── */}
      {isFlyingBalloon && (
        <View style={styles.floatingCenterBanner} pointerEvents="none">
          <View style={[styles.dolphinRidingBadge, { backgroundColor: '#ea580c', borderColor: '#facc15' }]}>
            <Text style={styles.dolphinRidingText}>
              {balloonRide.promptText || '☁️ SOARING ABOVE CLOUDS...'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Floating Dolphin Ride Interaction & Gatekeeper Banner ── */}
      {dolphinPromptText !== '' && !isRidingDolphin && !isFlyingBalloon && (
        <View style={styles.floatingCenterPrompt} pointerEvents="box-none">
          {canRideDolphin ? (
            <Pressable
              style={styles.dolphinPromptCard}
              onPress={(e) => {
                e?.stopPropagation?.();
                startDolphinRide();
                setIsRidingDolphin(true);
              }}
            >
              <Text style={styles.dolphinPromptText}>
                {dolphinPromptText || (dolphinRide.currentLocation === 'home'
                  ? '🐬 PRESS [E] OR TAP TO RIDE TO ICE AGE ISLAND (হিমেল দ্বীপে চলো!)'
                  : '🐬 PRESS [E] OR TAP TO RETURN HOME (মূল দ্বীপে ফিরে চলো)')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.dolphinLockedCard}>
              <Text style={styles.dolphinLockedTitle}>
                🔒 LEVEL 2: ICE AGE ISLAND LOCKED (পয়েন্ট প্রয়োজন: 500)
              </Text>
              <Text style={styles.dolphinLockedSubtitle}>
                Progress: {store.progression.totalPoints} / 500 Points ({Math.min(100, Math.floor((store.progression.totalPoints / 500) * 100))}%)
              </Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (store.progression.totalPoints / 500) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.dolphinLockedHint}>
                Win matches as Hider or Seeker to earn points and unlock ocean passage!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Floating Hot Air Balloon Ride Interaction & Gatekeeper Banner ── */}
      {balloonPromptText !== '' && !isFlyingBalloon && !isRidingDolphin && (
        <View style={styles.floatingCenterPrompt} pointerEvents="box-none">
          {canFlyBalloon ? (
            <Pressable
              style={[styles.dolphinPromptCard, { backgroundColor: 'rgba(234, 88, 12, 0.95)', borderColor: '#facc15' }]}
              onPress={(e) => {
                e?.stopPropagation?.();
                startBalloonRide();
                setIsFlyingBalloon(true);
              }}
            >
              <Text style={styles.dolphinPromptText}>
                {balloonRide.promptText}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.dolphinLockedCard, { borderColor: '#ea580c' }]}>
              <Text style={[styles.dolphinLockedTitle, { color: '#facc15' }]}>
                🔒 LEVEL 3: DESERT WORLD LOCKED (পয়েন্ট প্রয়োজন: 1200)
              </Text>
              <Text style={styles.dolphinLockedSubtitle}>
                Progress: {store.progression.totalPoints} / 1200 Points ({Math.min(100, Math.floor((store.progression.totalPoints / 1200) * 100))}%)
              </Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: '#ea580c', width: `${Math.min(100, (store.progression.totalPoints / 1200) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.dolphinLockedHint}>
                Win matches to earn points and unlock high-altitude balloon flight to the Pyramids!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Bottom Tool Bar: Only rendered on Desktop View ── */}
      {!isMobile && store.phase !== 'game_over' && !isRidingDolphin && (
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
  pointsCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(236, 201, 75, 0.16)',
    borderColor: 'rgba(236, 201, 75, 0.45)',
  },
  pointsCardMobile: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  pointsLabel: {
    color: '#ecc94b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  pointsValueMobile: {
    fontSize: 13,
  },
  pointsSubText: {
    fontSize: 10,
    color: '#ecc94b',
    fontWeight: '700',
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
  dolphinPromptCard: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#e0f2fe',
    shadowColor: '#0284c7',
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingCenterPrompt: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  floatingCenterBanner: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  dolphinRidingBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0f2fe',
    shadowColor: '#0284c7',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  dolphinRidingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  dolphinPromptText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
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
  scoringCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 8,
  },
  rankStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rankStarsText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  rankBadgeText: {
    color: '#ecc94b',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pointsEarnedBanner: {
    backgroundColor: 'rgba(236, 201, 75, 0.15)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ecc94b',
  },
  pointsEarnedLabel: {
    color: '#ecc94b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pointsEarnedValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  breakdownList: {
    gap: 3,
    paddingHorizontal: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownPoints: {
    color: '#68d391',
    fontSize: 11,
    fontWeight: '800',
  },
  totalPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalPointsLabel: {
    color: '#a0aec0',
    fontSize: 11,
    fontWeight: '700',
  },
  totalPointsValue: {
    color: '#ecc94b',
    fontSize: 12,
    fontWeight: '900',
  },
  unlockCelebrationBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderColor: '#10b981',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  unlockCelebrationTitle: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  unlockCelebrationSubtitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  unlockCelebrationHint: {
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  dolphinLockedCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.94)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 420,
    alignItems: 'center',
    gap: 6,
  },
  dolphinLockedTitle: {
    color: '#f59e0b',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dolphinLockedSubtitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ecc94b',
    borderRadius: 4,
  },
  dolphinLockedHint: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '600',
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
