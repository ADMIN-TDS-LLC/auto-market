import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for deployment
  base: '/',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  
  // Development server
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  }
});