import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
