// Clean up globalThis.__dirname if injected by tsx (confuses some ESM packages)
if (typeof (globalThis as any).__dirname !== 'undefined') {
  delete (globalThis as any).__dirname;
}

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        output: {
          // Keep third-party libraries in their own long-lived cached chunks
          manualChunks: {
            react: ['react', 'react-dom'],
            motion: ['framer-motion', 'motion'],
            zustand: ['zustand'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false as const,
      ws: false as const,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: null,
    },
  };
});
