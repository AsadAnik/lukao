import React from 'react';
import { Canvas } from '@react-three/fiber';

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
        backgroundColor: '#90cdf4',
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 8], fov: 70, near: 0.1, far: 200 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
        }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        {children}
      </Canvas>
    </div>
  );
}
