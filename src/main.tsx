import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for 100% offline mobile play and instant asset caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Automatic silent update on new release
    },
    onOfflineReady() {
      console.log('[TOWER//SHIFT] Ready for offline mobile play');
    },
  });
}

// Global error handlers to prevent unhandled crashes or unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    if (reasonStr.toLowerCase().includes('websocket')) {
      event.preventDefault();
      return;
    }
    console.warn('[Global] Suppressed unhandled promise rejection:', event.reason);
    event.preventDefault();
  });

  // Capture phase listener to suppress resource and script errors cleanly
  window.addEventListener(
    'error',
    (event) => {
      const msg = String(event?.message || event?.error?.message || '');
      if (msg.toLowerCase().includes('websocket')) {
        event.preventDefault();
        return true;
      }
      console.warn('[Global] Handled window error event:', event.message || event.error);
      event.preventDefault();
      return true;
    },
    true
  );

  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (msg.toLowerCase().includes('websocket')) {
      return true; // Ignore WebSocket errors
    }
    console.warn('[Global] Handled window.onerror:', message, source, lineno, colno, error);
    return true; // Prevents default browser logging of uncaught errors
  };
}

const container = document.getElementById('root')!;
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    console.warn('[React] Contained uncaught error:', error, errorInfo);
  },
  onCaughtError: (error, errorInfo) => {
    console.warn('[React] Contained caught boundary error:', error, errorInfo);
  },
  onRecoverableError: (error, errorInfo) => {
    console.warn('[React] Recoverable error:', error, errorInfo);
  },
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
