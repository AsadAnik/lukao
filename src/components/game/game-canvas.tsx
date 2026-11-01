import '@/polyfills';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';

interface GameCanvasProps {
  children: React.ReactNode;
}

export function GameCanvas({ children }: GameCanvasProps) {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 4, 8], fov: 65, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        style={styles.canvas}
      >
        {children}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#90cdf4',
  },
  canvas: {
    ...StyleSheet.absoluteFill,
  },
});
