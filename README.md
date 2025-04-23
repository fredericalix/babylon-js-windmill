# Babylon.js Windmill Viewer

A 3D viewer application built with Babylon.js to display a windmill 3D model.

## Features

- Loads and displays the `building_windmill_blue.gltf` 3D model
- Implements orbit camera controls for easy navigation
- Includes environmental elements (skybox and ground) for better visual context
- Fan rotation can be toggled with the 'R' key
- Construction/deconstruction animation can be triggered with the 'C' key

## Project Structure

```
/
├── index.html         # Main HTML file
├── app.js             # JavaScript application code
├── server.js          # Express server for serving the application
├── package.json       # Node.js project configuration
├── .env               # Environment configuration (PORT setting)
└── assets/            # 3D models and textures
    ├── building_windmill_blue.gltf
    ├── building_windmill_blue.bin
    └── hexagons_medieval.png
```

## Running the Application

### Using the included Express server (recommended):

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will start on the port specified in the `.env` file (default: 8000).

### Configuring the server port

You can change the port in one of two ways:

1. Edit the `.env` file and change the PORT value
2. Set the PORT environment variable when starting the server:

```bash
PORT=3000 npm start
```

### Alternative methods

You can also use other HTTP servers:

#### Using Python's built-in HTTP server:

```bash
python -m http.server 8000
```

#### Using Node.js with a package like http-server:

```bash
# Install http-server if not already installed
npm install -g http-server

# Run the server
http-server
```

Then open your browser and navigate to http://localhost:8000 (or the port you configured).

## Controls

### Camera Controls
- Left mouse button: Rotate the camera around the model
- Right mouse button: Pan the camera
- Mouse wheel: Zoom in/out
- Toggle button: Switch between fixed view and free navigation

### Windmill Controls
- 'R' key: Toggle fan rotation on/off
- 'C' key: Trigger construction/deconstruction animation
