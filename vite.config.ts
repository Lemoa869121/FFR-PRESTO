/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the app under /<repository>/ ; override with BASE_PATH if needed.
const base = process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS ? '/FFR-PRESTO/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
