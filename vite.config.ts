import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/client', // Output directory for client build
    sourcemap: true, // Generate source maps for debugging
  },
  server: {
    port: 3000, // Port for the Vite development server (frontend only)
    open: true // Automatically open the browser
  },
});
