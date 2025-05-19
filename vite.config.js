import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }), // Enable Brotli compression
  ],
  server: {
    port: 3006,
    hmr: true,
  },
  build: {
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    chunkSizeWarningLimit: 500, // Warn if chunks exceed 500KB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy dependencies into separate chunks
          'mapbox': ['mapbox-gl', '@mapbox/search-js-react'],
          'charts': ['chart.js', 'recharts', 'react-chartjs-2'],
          'file-parsing': ['shpjs', 'jszip', 'papaparse', '@tmcw/togeojson'],
          'mantine': ['@mantine/core', '@mantine/dropzone', '@mantine/hooks', '@mantine/notifications'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'shpjs', 'jszip', 'papaparse'], // Pre-bundle heavy deps
  },
});