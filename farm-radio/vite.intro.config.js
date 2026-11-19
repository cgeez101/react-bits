// Builds the 15-second investor intro (intro/) as one self-contained HTML file.
import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.js';
import { fileURLToPath } from 'node:url';

export default mergeConfig(base, defineConfig({
  root: fileURLToPath(new URL('./intro', import.meta.url)),
  build: { outDir: fileURLToPath(new URL('./dist-intro', import.meta.url)), emptyOutDir: true }
}));
