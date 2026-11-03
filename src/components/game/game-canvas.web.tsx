import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface GameCanvasProps {
  children: React.ReactNode;
}

export function GameCanvas({ children }: GameCanvasProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#38bdf8',
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 8], fov: 70, near: 0.1, far: 500 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
        }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={(state) => {
          const { width, height } = state.size;
          const cam = state.camera as THREE.PerspectiveCamera;
          if (cam && cam.isPerspectiveCamera && width > 0 && height > 0) {
            cam.aspect = width / height;
            cam.updateProjectionMatrix();
          }
          state.camera.lookAt(0, 0.75, 0);

          // Cinematic Madbox-Style Stylized Tone Mapping & Soft Shadows
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.15;
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          state.gl.setClearColor(new THREE.Color('#38bdf8'), 1);
        }}
      >
        {children}
      </Canvas>
    </div>
  );
}
