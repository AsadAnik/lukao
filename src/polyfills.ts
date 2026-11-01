import { Platform } from 'react-native';

// Polyfills strictly for React Native mobile runtimes (Hermes / JSC)
// NEVER mock window or document in Node.js SSR or web environments!
if (Platform.OS !== 'web') {
  if (typeof process !== 'undefined' && typeof (process as any).emitWarning !== 'function') {
    (process as any).emitWarning = function () {
      // no-op warning in React Native
    };
  }

  // Safe event listener stubs for React Native global scope
  if (typeof (globalThis as any).addEventListener !== 'function') {
    (globalThis as any).addEventListener = () => {};
  }
  if (typeof (globalThis as any).removeEventListener !== 'function') {
    (globalThis as any).removeEventListener = () => {};
  }

  if (typeof (globalThis as any).window !== 'undefined') {
    if (typeof (globalThis as any).window.addEventListener !== 'function') {
      (globalThis as any).window.addEventListener = () => {};
    }
    if (typeof (globalThis as any).window.removeEventListener !== 'function') {
      (globalThis as any).window.removeEventListener = () => {};
    }
  }
}

export {};
