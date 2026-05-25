import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run test files sequentially to avoid DB conflicts
    pool: 'forks',
    singleFork: true,
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://leila:leila_password@localhost:5432/salao_test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'super_secret_jwt_key_123456_change_me_in_production',
      JWT_REFRESH_SECRET: 'super_secret_refresh_jwt_key_123456_change_me_in_production',
      ALLOWED_ORIGINS: 'http://localhost:4200',
      PORT: '3001',
    },
  },
});
