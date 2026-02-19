import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // 30 seconds for LLM calls
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
