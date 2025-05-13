// Special Vite configuration for Netlify builds
// This file is used by the Netlify build process to handle dynamic imports

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Set up manual chunks for hooks to avoid dynamic import issues
      output: {
        manualChunks: {
          'hooks': [
            './client/src/hooks/index.ts',
            './client/src/hooks/use-toast.ts', 
            './client/src/hooks/use-gamification.tsx'
          ]
        }
      }
    }
  },
});