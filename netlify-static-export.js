import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { build } from 'vite';

// Configuration for Netlify static export
const config = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      input: resolve(__dirname, 'client/src/index.html')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@server': resolve(__dirname, './server'),
      '@shared': resolve(__dirname, './shared'),
      '@assets': resolve(__dirname, './attached_assets'),
      '@components': resolve(__dirname, './client/src/components'),
      '@styles': resolve(__dirname, './client/src/styles'),
      '@lib': resolve(__dirname, './client/src/lib'),
      '@hooks': resolve(__dirname, './client/src/hooks')
    }
  }
});

// Run the build
async function main() {
  try {
    console.log('Building for Netlify static export...');
    await build(config);
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();