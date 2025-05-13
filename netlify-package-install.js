/**
 * Netlify dependency installer script
 * This script ensures all required dependencies are installed for the build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('======= NETLIFY DEPENDENCY INSTALLER =======');

// These are the critical dependencies required for the build
const requiredDependencies = [
  '@vitejs/plugin-react',
  'vite',
  'typescript',
  '@types/react',
  '@types/react-dom',
  'postcss',
  'tailwindcss',
  'autoprefixer',
  'react',
  'react-dom',
  '@tanstack/react-query',
  'wouter',
  'zod',
  '@hookform/resolvers',
  'react-hook-form',
  '@radix-ui/react-dialog',
  '@radix-ui/react-slot',
  'clsx',
  'class-variance-authority',
  'tailwind-merge',
  'tailwindcss-animate',
  'lucide-react'
];

console.log(`Installing ${requiredDependencies.length} critical dependencies...`);

// Run the install command with --no-save to avoid modifying package.json
try {
  execSync(`npm install --no-save ${requiredDependencies.join(' ')}`, { stdio: 'inherit' });
  console.log('Critical dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  console.error('Trying alternative approach...');
  
  // Try installing one by one
  let installedCount = 0;
  for (const dep of requiredDependencies) {
    try {
      console.log(`Installing ${dep}...`);
      execSync(`npm install --no-save ${dep}`, { stdio: 'inherit' });
      installedCount++;
    } catch (err) {
      console.error(`Failed to install ${dep}: ${err.message}`);
    }
  }
  console.log(`Installed ${installedCount} of ${requiredDependencies.length} dependencies`);
}

// Create a simple Vite project configuration if it doesn't exist
if (!fs.existsSync('./vite.config.js') && !fs.existsSync('./vite.config.ts')) {
  console.log('Creating basic Vite configuration...');
  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    }
  }
});
`;
  fs.writeFileSync('./vite.netlify.js', viteConfig);
  console.log('Basic Vite configuration created at vite.netlify.js');
}

console.log('======= NETLIFY DEPENDENCY INSTALLER COMPLETE =======');