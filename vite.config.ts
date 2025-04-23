import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'assets', // Copy contents of 'assets' folder to build output root
  build: {
    outDir: 'dist/client', // Output directory for client build
    sourcemap: true, // Generate source maps for debugging
    rollupOptions: {
      output: {
        format: 'es', // Use ES modules format
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000, // Port for the Vite development server (frontend only)
    open: true // Automatically open the browser
  },
});
