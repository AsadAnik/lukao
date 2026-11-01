import { Platform } from 'react-native';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  joystickX: number; // -1 to 1
  joystickY: number; // -1 to 1
  cameraYaw: number; // camera horizontal angle in radians
  cameraPitch: number; // camera vertical angle in radians
}

export const inputState: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  crouch: false,
  joystickX: 0,
  joystickY: 0,
  cameraYaw: 0,
  cameraPitch: 0.45,
};

let initialized = false;

export function setupKeyboardControls() {
  if (
    Platform.OS !== 'web' ||
    typeof window === 'undefined' ||
    typeof window.addEventListener !== 'function' ||
    initialized
  ) {
    return;
  }
  initialized = true;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        inputState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        inputState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        inputState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        inputState.right = true;
        break;
      case 'Space':
        inputState.jump = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        inputState.sprint = true;
        break;
      case 'KeyC':
        inputState.crouch = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        inputState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        inputState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        inputState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        inputState.right = false;
        break;
      case 'Space':
        inputState.jump = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        inputState.sprint = false;
        break;
      case 'KeyC':
        inputState.crouch = false;
        break;
    }
  };

  // Mouse drag for camera orbit in Follow Mode
  let isPointerDown = false;
  let lastX = 0;
  let lastY = 0;

  const handleMouseDown = (e: MouseEvent) => {
    // Only capture if clicking the canvas (button 0 or 2)
    if ((e.target as HTMLElement)?.tagName === 'CANVAS') {
      isPointerDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPointerDown) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    inputState.cameraYaw -= dx * 0.005;
    inputState.cameraPitch = Math.max(0.18, Math.min(0.85, inputState.cameraPitch + dy * 0.004));
  };

  const handleMouseUp = () => {
    isPointerDown = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    initialized = false;
  };
}
