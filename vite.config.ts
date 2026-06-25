import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const BANNER = `/* Font Inspector · Knowware Institute · https://knowware.institute · MIT */`;

export default defineConfig(({ mode }) => {
  // ── Library build: ESM + CJS for npm (React component + vanilla class)
  if (mode === 'lib') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: {
            'index':   'src/FontInspector.tsx',
            'vanilla': 'src/vanilla.ts',
          },
          formats: ['es', 'cjs'],
        },
        rollupOptions: {
          external: ['react', 'react/jsx-runtime'],
          output: { banner: BANNER },
        },
      },
    };
  }

  // ── IIFE build: self-contained bundle for <script> tag / bookmarklet
  if (mode === 'iife') {
    return {
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: 'src/iife.ts',
          name: 'FontInspector',
          fileName: () => 'font-inspector.iife.js',
          formats: ['iife'],
        },
        rollupOptions: {
          output: { banner: BANNER },
        },
      },
    };
  }

  // ── Default: demo app
  return { plugins: [react()] };
});
