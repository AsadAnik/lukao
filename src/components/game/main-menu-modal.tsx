import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lukaoStore, GameState, MISSIONS_LIST, Mission, GameRole } from './game-state';
import { audioManager } from './audio-manager';

export function MainMenuModal() {
  const insets = useSafeAreaInsets();
  const [store, setStore] = useState<GameState>(() => lukaoStore.getState());
  const [selectedRole, setSelectedRole] = useState<GameRole>('hider');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsub = lukaoStore.subscribe(() => {
      setStore({ ...lukaoStore.getState() });
    });
    return () => {
      unsub();
    };
  }, []);

  if (!store.isMenuOpen) return null;

  // Immediate, glitch-free actions (zero animation lag or callback lockups)
  const handlePlayOrResume = () => {
    audioManager.playGameStart();
    lukaoStore.getState().closeMenu();
  };

  const handleStartMission = (mission: Mission) => {
    audioManager.playGameStart();
    lukaoStore.getState().startMission(mission);
  };

  const handleSelectRoleAndPlay = (role: GameRole) => {
    audioManager.playGameStart();
    setSelectedRole(role);
    lukaoStore.getState().startQuickPlay(role);
  };

  const handleRestart = () => {
    audioManager.playClick();
    lukaoStore.getState().restartGame();
  };

  const isMatchInProgress = store.timeLeft < 20 || store.currentMission !== null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View
        style={[
          styles.modalCard,
          {
            paddingTop: Math.max(insets.top + 8, 14),
            paddingBottom: Math.max(insets.bottom + 8, 14),
            paddingLeft: Math.max(insets.left + 14, 18),
            paddingRight: Math.max(insets.right + 14, 18),
          },
        ]}
      >
        {/* ── Header Row ── */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeText}>
                {isMatchInProgress ? 'GAME PAUSED (SLOW-MO)' : '3D LIVE ARENA READY'}
              </Text>
            </View>
            <Text style={styles.titleText}>LUKAO ARENA</Text>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              style={styles.soundBtn}
              onPress={() => {
                const next = !isMuted;
                setIsMuted(next);
                audioManager.setMuted(next);
              }}
            >
              <Text style={styles.soundBtnText}>{isMuted ? '🔇' : '🔊'}</Text>
            </Pressable>

            {isMatchInProgress && (
              <Pressable style={styles.closeBtn} onPress={handlePlayOrResume}>
                <Text style={styles.closeBtnText}>✕ RESUME</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── BIG HERO PLAY BUTTON (Instant Launch) ── */}
        <Pressable
          style={styles.heroPlayBtn}
          onPress={handlePlayOrResume}
        >
          <Text style={styles.heroPlayIcon}>▶</Text>
          <View style={styles.heroPlayTextCol}>
            <Text style={styles.heroPlayTitle}>
              {isMatchInProgress ? 'RESUME GAME' : 'PLAY GAME NOW'}
            </Text>
            <Text style={styles.heroPlaySubtitle}>
              {store.role === 'hider' ? '🙈 Scramble & Hide from Hunter' : '🔍 Hunt & Tag all Hiders with Scanner'}
            </Text>
          </View>
        </Pressable>

        {/* ── Quick Role Selector Pills ── */}
        <View style={styles.rolePickerRow}>
          <Pressable
            style={[
              styles.rolePill,
              store.role === 'hider' && styles.rolePillActiveHider,
            ]}
            onPress={() => handleSelectRoleAndPlay('hider')}
          >
            <Text style={styles.rolePillIcon}>🙈</Text>
            <Text style={styles.rolePillText}>Play as Hider</Text>
            {store.role === 'hider' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            style={[
              styles.rolePill,
              store.role === 'seeker' && styles.rolePillActiveSeeker,
            ]}
            onPress={() => handleSelectRoleAndPlay('seeker')}
          >
            <Text style={styles.rolePillIcon}>🔍</Text>
            <Text style={styles.rolePillText}>Play as Seeker</Text>
            {store.role === 'seeker' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        </View>

        {/* ── MISSIONS & LEVELS (Instant Click to Play Any Level) ── */}
        <View style={styles.levelsSection}>
          <Text style={styles.sectionTitle}>🎯 SELECT LEVEL / MISSION TO PLAY</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelsScroll}
          >
            {MISSIONS_LIST.map((m) => {
              const isCurrent = store.currentMission?.id === m.id;
              return (
                <Pressable
                  key={m.id}
                  style={[
                    styles.levelCard,
                    isCurrent && styles.levelCardCurrent,
                  ]}
                  onPress={() => handleStartMission(m)}
                >
                  <View style={styles.levelCardHeader}>
                    <View style={styles.levelNumBadge}>
                      <Text style={styles.levelNumText}>LEVEL {m.number}</Text>
                    </View>
                    <Text style={styles.starsText}>{'★'.repeat(m.stars)}</Text>
                  </View>

                  <Text style={styles.levelIcon}>{m.icon}</Text>
                  <Text style={styles.levelTitle} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={styles.levelGoal} numberOfLines={2}>
                    {m.objective}
                  </Text>

                  <View style={styles.btnPlayLevelCard}>
                    <Text style={styles.btnPlayLevelCardText}>
                      PLAY LEVEL #{m.number} ▶
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Footer Controls ── */}
        <View style={styles.footerRow}>
          <Pressable
            style={styles.footerBtn}
            onPress={() => {
              audioManager.playClick();
              lukaoStore.getState().toggleTouchControls();
            }}
          >
            <Text style={styles.footerBtnText}>
              📱 Touch UI: {store.showTouchControls ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.footerBtn}
            onPress={() => {
              audioManager.playClick();
              lukaoStore.getState().setCameraMode(store.cameraMode === 'follow' ? 'free' : 'follow');
            }}
          >
            <Text style={styles.footerBtnText}>
              {store.cameraMode === 'follow' ? '🎥 Follow Cam' : '🌐 Free Cam'}
            </Text>
          </Pressable>

          <Pressable style={styles.footerBtn} onPress={handleRestart}>
            <Text style={styles.footerBtnText}>🔄 Restart Arena</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 29, 0.28)', // Highly transparent! The live 3D arena is clearly visible behind!
    zIndex: 100,
  },
  modalCard: {
    width: '90%',
    maxWidth: 620,
    maxHeight: '88%',
    backgroundColor: 'rgba(15, 23, 42, 0.62)', // Translucent frosted glass!
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ecc94b',
  },
  badgeText: {
    color: '#ecc94b',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  soundBtnText: {
    fontSize: 14,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeBtnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroPlayBtn: {
    backgroundColor: '#10b981',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
  },
  heroPlayIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  heroPlayTextCol: {
    flex: 1,
  },
  heroPlayTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroPlaySubtitle: {
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: '700',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  rolePillActiveHider: {
    backgroundColor: 'rgba(49, 130, 206, 0.28)',
    borderColor: '#63b3ed',
  },
  rolePillActiveSeeker: {
    backgroundColor: 'rgba(229, 62, 62, 0.28)',
    borderColor: '#fc8181',
  },
  rolePillIcon: {
    fontSize: 16,
  },
  rolePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  checkMark: {
    color: '#68d391',
    fontSize: 12,
    fontWeight: '900',
  },
  levelsSection: {
    gap: 6,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelsScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  levelCard: {
    width: 140,
    backgroundColor: 'rgba(30, 41, 59, 0.72)',
    borderRadius: 14,
    padding: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
    gap: 4,
  },
  levelCardCurrent: {
    borderColor: '#ecc94b',
    backgroundColor: 'rgba(236, 201, 75, 0.18)',
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelNumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  levelNumText: {
    color: '#cbd5e1',
    fontSize: 8,
    fontWeight: '900',
  },
  starsText: {
    color: '#ecc94b',
    fontSize: 9.5,
  },
  levelIcon: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 2,
  },
  levelTitle: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
  },
  levelGoal: {
    color: '#94a3b8',
    fontSize: 8.5,
    lineHeight: 11,
    minHeight: 22,
  },
  btnPlayLevelCard: {
    backgroundColor: '#ecc94b',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 2,
  },
  btnPlayLevelCardText: {
    color: '#1a202c',
    fontSize: 8.5,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  footerBtnText: {
    color: '#cbd5e1',
    fontSize: 9.5,
    fontWeight: '800',
  },
});
