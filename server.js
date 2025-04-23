// Simple HTTP server for Babylon.js application
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file if it exists
dotenv.config();

// Create Express app
const app = express();

// Set the port from environment variable, .env file, or default to 8000
const PORT = process.env.PORT || 8000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});
