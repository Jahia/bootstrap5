import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  define: {
    __PACKAGE_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@jahia/javascript-modules-library': fileURLToPath(new URL('./src/test/mocks/jahia-lib.tsx', import.meta.url)),
      'react-i18next': fileURLToPath(new URL('./src/test/mocks/react-i18next.ts', import.meta.url)),
      // Force a single React instance across the yarn workspace.
      // react-bootstrap (hoisted to root node_modules) and our local code must share
      // the same React so that hooks work correctly in tests.
      'react': fileURLToPath(new URL('../node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('../node_modules/react-dom', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
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
    coverage: {
      provider: 'v8',
      // lcov is read by SonarQube (sonar.javascript.lcov.reportPaths in pom.xml)
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**'],
    },
    server: {
      deps: {
        // Force Vite's ESM transform for react-bootstrap and its CJS deps so that
        // the react/react-dom aliases above apply to all require() calls.
        inline: ['react-bootstrap', '@restart/ui', 'uncontrollable', '@restart/hooks'],
      },
    },
  },
});
