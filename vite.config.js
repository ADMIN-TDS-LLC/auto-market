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
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
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
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
});
