# Babylon.js Windmill Viewer

A 3D viewer application built with Babylon.js to display a windmill 3D model.

## Features

- Loads and displays the `building_windmill_blue.gltf` 3D model
- Implements orbit camera controls for easy navigation
- Includes environmental elements (skybox and ground) for better visual context
- Auto-rotates the model for better viewing

## Project Structure

```
/
├── index.html         # Main HTML file
├── app.js             # JavaScript application code
└── assets/            # 3D models and textures
    ├── building_windmill_blue.gltf
    ├── building_windmill_blue.bin
    └── hexagons_medieval.png
```

## Running the Application

This application can be served using any HTTP server. Here are a few options:

### Using Python's built-in HTTP server:

```bash
python -m http.server
```

### Using Node.js with a package like http-server:

```bash
# Install http-server if not already installed
npm install -g http-server

# Run the server
http-server
```

Then open your browser and navigate to the provided URL (typically http://localhost:8000 or http://localhost:8080).

## Controls

- Left mouse button: Rotate the camera around the model
- Right mouse button: Pan the camera
- Mouse wheel: Zoom in/out
