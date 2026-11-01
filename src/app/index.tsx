import '@/polyfills';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { LukaoGameView } from '@/components/game/lukao-game-view';

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';
  const [isClient, setIsClient] = useState(!isWeb);

  useEffect(() => {
    if (isWeb) {
      setIsClient(true);
    }
  }, [isWeb]);

  if (isWeb && !isClient) return null;

  return (
    <View style={styles.container}>
      {/* Direct, Instant 3D Hide & Seek Arena */}
      <LukaoGameView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#90cdf4',
  },
});
