import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = p => fileURLToPath(new URL(p, import.meta.url));

// Use the local forks of GSAP and Lenis when they sit next to this repo
// (/home/user/Animation-GSAP, /home/user/lenis); otherwise fall back to npm.
const gsapFork = here('../../Animation-GSAP/esm');
const lenisFork = here('../../lenis/packages/core/index.ts');
const alias = [{ find: '@bits', replacement: here('../src/content') }];
if (existsSync(gsapFork)) alias.push({ find: /^gsap$/, replacement: `${gsapFork}/index.js` }, { find: /^gsap\/(.*)$/, replacement: `${gsapFork}/$1.js` });
if (existsSync(lenisFork)) alias.push({ find: /^lenis$/, replacement: lenisFork });

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias, dedupe: ['react', 'react-dom'] },
  server: { fs: { allow: [here('../..')] } },
  build: { assetsInlineLimit: 100_000_000, cssCodeSplit: false, outDir: 'dist' }
});
