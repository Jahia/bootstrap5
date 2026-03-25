import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@jahia/javascript-modules-library': fileURLToPath(new URL('./src/test/mocks/jahia-lib.tsx', import.meta.url)),
      'react-i18next': fileURLToPath(new URL('./src/test/mocks/react-i18next.ts', import.meta.url)),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/test/**/*.test.{ts,tsx}'],
  },
});
