import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';

const LOADING_TIPS = [
  '🏡 Exploring the Bangladeshi Village with Tin House & Grazing Cow!',
  '🌿 Deep bushes and haystacks conceal your body and nametag from the Seeker!',
  '📦 Crouch behind cover and climb onto the roof to break line of sight.',
  '💓 Listen closely for the heartbeat pulse when danger approaches!',
  '🗼 Climb the lookout tower for a commanding 360° arena view.',
];

const STAGES = [
  'Preparing Bangladeshi Village Homestead & 3D Assets...',
  'Spawning Pip, Milo, Kiko & Hunter-9...',
  'Calibrating Wide-Angle Action Cam...',
  'Playground Ready!',
];

interface GameLoaderProps {
  onLoaded: () => void;
}

export function GameLoader({ onLoaded }: GameLoaderProps) {
  const [progress, setProgress] = useState(15);
  const [stageIndex, setStageIndex] = useState(0);
  const hasFinished = useRef(false);
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for title
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Reliable single-run loader (completes in ~1.2s or tap to skip)
  const finishLoading = useRef(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    Animated.timing(fadeOutAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onLoaded();
    });
  }).current;

  useEffect(() => {
    const start = Date.now();
    const duration = 1200; // Fast 1.2s initial load

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct > 30 && pct <= 65) setStageIndex(1);
      else if (pct > 65 && pct < 100) setStageIndex(2);
      else if (pct >= 100) {
        setStageIndex(3);
        clearInterval(timer);
        setTimeout(finishLoading, 200);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [finishLoading]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAnim }]}>
      {/* Offline Badge */}
      <View style={styles.offlineBadge}>
        <Text style={styles.offlineBadgeText}>📶 100% OFFLINE • NO INTERNET NEEDED</Text>
      </View>

      {/* Main Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.titleText}>LUKAO</Text>
        <Text style={styles.bengaliTitle}>লুকোচুরি</Text>
        <Text style={styles.subtitleText}>3D HIDE & SEEK ARENA</Text>
      </Animated.View>

      {/* Progress Track */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.stageText}>{STAGES[stageIndex]}</Text>
          <Text style={styles.percentText}>{progress}%</Text>
        </View>

        <View style={styles.trackBar}>
          <View style={[styles.fillBar, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Tip Card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>{LOADING_TIPS[stageIndex % LOADING_TIPS.length]}</Text>
      </View>

      {/* Instant Skip / Enter Button (so user never gets stuck) */}
      <Pressable style={styles.skipBtn} onPress={finishLoading}>
        <Text style={styles.skipBtnText}>⚡ TAP TO ENTER ARENA</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    paddingHorizontal: 24,
  },
  offlineBadge: {
    backgroundColor: 'rgba(56, 161, 105, 0.2)',
    borderColor: '#38a169',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  offlineBadgeText: {
    color: '#68d391',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: '#3182ce',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  bengaliTitle: {
    color: '#ecc94b',
    fontSize: 22,
    fontWeight: '800',
    marginTop: -4,
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitleText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  progressSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stageText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  percentText: {
    color: '#ecc94b',
    fontSize: 12,
    fontWeight: '900',
  },
  trackBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    backgroundColor: '#ecc94b',
    borderRadius: 4,
  },
  tipCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: 440,
    marginBottom: 18,
  },
  tipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  skipBtnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
