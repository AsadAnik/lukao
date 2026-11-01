import '@/polyfills';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LukaoGameView } from '@/components/game/lukao-game-view';

export default function HomeScreen() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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
