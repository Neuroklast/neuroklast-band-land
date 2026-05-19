import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'dist', 'src/_theme_inbox'],
  },
})
