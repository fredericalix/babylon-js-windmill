// Simple HTTP server for Babylon.js application
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

// Create Express app
const app = express();

// Set the port from environment variable, .env file, or default to 8080
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// Determine paths based on whether we're running in production or development
const rootDir = path.join(__dirname, '..');
const distClientDir = path.join(rootDir, 'dist', 'client');

// Check if we're running the compiled server.js (production) or via ts-node (development)
const isProduction = path.basename(__dirname) === 'dist';

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

if (isProduction) {
  console.log('Running in production mode');
  console.log('Serving static files from:', distClientDir);
  
  // Serve all static files from the dist/client directory
  app.use(express.static(distClientDir));
  
  // IMPORTANT: Also serve the original assets directory for 3D models
  // This ensures the models can be loaded correctly
  app.use('/assets', express.static(path.join(rootDir, 'assets')));
  console.log('Serving original assets from:', path.join(rootDir, 'assets'));
  
  // Serve index.html for the root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(distClientDir, 'index.html'));
  });
} else {
  console.log('Running in development mode');
  console.log('In development, you should use the Vite dev server (npm run dev)');
  console.log('Serving static files from project root as fallback');
  
  // In development, serve static files from the project root
  app.use(express.static(rootDir));
  
  // Explicitly serve the assets directory
  app.use('/assets', express.static(path.join(rootDir, 'assets')));
  
  // Serve the index.html file for the root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});

export default app;
