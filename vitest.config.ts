import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      clearMocks: true,
      setupFiles: ['./src/test/setup.ts'],
      env: {
        VITE_DOG_API_KEY: 'test-api-key',
        VITE_SUB_ID: 'test-sub-id',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      },
    },
  }),
)
