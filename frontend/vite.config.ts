import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'sync-dist-to-root',
      closeBundle() {
        try {
          const src = path.resolve(__dirname, 'dist');
          const dest = path.resolve(__dirname, '../dist');
          if (fs.existsSync(src)) {
            fs.cpSync(src, dest, { recursive: true });
            if (fs.existsSync(path.join(dest, 'index.html'))) {
              fs.copyFileSync(path.join(dest, 'index.html'), path.join(dest, '404.html'));
            }
            if (fs.existsSync(path.join(src, 'index.html'))) {
              fs.copyFileSync(path.join(src, 'index.html'), path.join(src, '404.html'));
            }
            console.log('✓ Successfully synced build output to root dist and generated 404.html');
          }
        } catch (e) {
          console.error('Notice: Could not sync to root dist:', e);
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            return 'vendor-libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.kosmicowellness.com/api',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://api.kosmicowellness.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
