import '@/polyfills';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import * as THREE from 'three';

interface GameCanvasProps {
  children: React.ReactNode;
}

export function GameCanvas({ children }: GameCanvasProps) {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 4, 8], fov: 65, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        onCreated={(state) => {
          const { width, height } = state.size;
          const cam = state.camera as THREE.PerspectiveCamera;
          if (cam && cam.isPerspectiveCamera && width > 0 && height > 0) {
            cam.aspect = width / height;
            cam.updateProjectionMatrix();
          }
          state.camera.lookAt(0, 0.75, 0);
          state.gl.setClearColor(new THREE.Color('#90cdf4'), 1);
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
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#90cdf4',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
