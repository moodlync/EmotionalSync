
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'wouter'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@styles': path.resolve(__dirname, './client/src/styles'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@hooks': path.resolve(__dirname, './client/src/hooks')
    }
  }
});
