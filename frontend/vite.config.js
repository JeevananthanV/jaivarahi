import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { defineConfig, loadEnv } from 'vite' // Added loadEnv
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the frontend config directory.
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [
      react(),
      {
        name: 'rewrite-admin',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Rewrite all non-file requests starting with /admin to /admin.html
            if (req.url.startsWith('/admin') && !req.url.includes('.')) {
              req.url = '/admin.html';
            }
            next();
          });
        }
      }
    ],
    server: {
      proxy: {
        '/api': {
          // Use env.VITE_BACKEND_URL instead of process.env
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err.message);
            });
          },
        },
      },
    },
    build: {
      modulePreload: false,
      cssCodeSplit: false,
      minify: 'terser',
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      target: 'es2021',
      terserOptions: {
        compress: {
          passes: 2,
        },
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split vendor by package depth to avoid single huge chunk
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/react-router-dom')) {
                return 'vendor-router';
              }
              if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) {
                return 'vendor-charts';
              }
              if (id.includes('node_modules/axios')) {
                return 'vendor-axios';
              }
              if (id.includes('node_modules/lucide-react')) {
                return 'vendor-icons';
              }
              return 'vendor-libs';
            }
          },
        },
      },
    },
  }
})
