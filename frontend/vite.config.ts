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
  server: {
    port: 5173,
    host: true,
  },
});
