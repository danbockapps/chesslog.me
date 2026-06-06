import {resolve} from 'path'
import {defineConfig} from 'vitest/config'

// Mirror the `@/*` -> repo-root path alias from tsconfig.json so test imports match app imports.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
})
