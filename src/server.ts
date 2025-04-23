// Simple HTTP server for Babylon.js application
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

// Create Express app
const app = express();

// Set the port from environment variable, .env file, or default to 8000
const PORT: number = parseInt(process.env.PORT || '8000', 10);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});

export default app;
