import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  server: {
    port: 12000,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '*.prod-runtime.all-hands.dev',
      'work-1-ztlhvdkgmbpjtzat.prod-runtime.all-hands.dev',
      'work-2-ztlhvdkgmbpjtzat.prod-runtime.all-hands.dev'
    ],
  },
  build: {
    outDir: 'build',
  },
});