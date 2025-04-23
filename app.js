// Initialize BabylonJS engine and scene
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const createScene = function() {
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    
    // Add primary light to illuminate the scene
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Add directional light for better shadows
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
    dirLight.intensity = 0.5;
    
    // Create a fixed camera that matches the requested view
    // Position determined from the screenshot provided
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 3, 12), scene);
    camera.setTarget(new BABYLON.Vector3(0, 2, 0)); // Looking at the middle of the windmill
    
    // Disable camera controls to keep the view fixed
    camera.attachControl(canvas, false);
    
    // Add a toggle control for changing between fixed view and free navigation
    let freeCamera = false;
    let verticalKeys = {};
    const toggleCameraButton = document.createElement("button");
    toggleCameraButton.textContent = "Toggle Camera Controls";
    toggleCameraButton.style.position = "absolute";
    toggleCameraButton.style.bottom = "10px";
    toggleCameraButton.style.right = "10px";
    toggleCameraButton.style.zIndex = "100";
    toggleCameraButton.style.padding = "10px";
    toggleCameraButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    toggleCameraButton.style.color = "white";
    toggleCameraButton.style.border = "none";
    toggleCameraButton.style.borderRadius = "5px";
    toggleCameraButton.style.cursor = "pointer";
    
    // Setup scene action manager for keyboard controls
    scene.actionManager = new BABYLON.ActionManager(scene);
    
    // Space key for moving up
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 32 }, // Space key
            function() { verticalKeys[32] = true; }
        )
    );
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: 32 },
            function() { verticalKeys[32] = false; }
        )
    );
    
    // Shift key for moving down
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 16 }, // Shift key
            function() { verticalKeys[16] = true; }
        )
    );
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: 16 },
            function() { verticalKeys[16] = false; }
        )
    );
    
    // Handle vertical movement in the render loop when camera is free
    scene.registerBeforeRender(() => {
        if (freeCamera) {
            if (verticalKeys[32]) { // Space key for up
                camera.position.y += 0.1;
            }
            if (verticalKeys[16]) { // Shift key for down
                camera.position.y -= 0.1;
            }
        }
    });
    
    toggleCameraButton.onclick = function() {
        freeCamera = !freeCamera;
        
        if (freeCamera) {
            // Enable free camera controls
            camera.attachControl(canvas, true);
            // Set up keyboard controls
            camera.keysUp = [87, 38];       // W and up arrow
            camera.keysDown = [83, 40];     // S and down arrow
            camera.keysLeft = [65, 37];     // A and left arrow
            camera.keysRight = [68, 39];    // D and right arrow
            camera.speed = 0.5;             // Movement speed
            camera.inertia = 0.7;           // Camera inertia for smoother movement
            toggleCameraButton.textContent = "Return to Fixed View";
        } else {
            // Return to fixed view
            camera.position = new BABYLON.Vector3(0, 3, 12);
            camera.setTarget(new BABYLON.Vector3(0, 2, 0));
            camera.attachControl(canvas, false);
            toggleCameraButton.textContent = "Toggle Camera Controls";
        }
    };
    document.body.appendChild(toggleCameraButton);
    
    // Set up a skybox for better visual context
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://assets.babylonjs.com/skyboxes/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    
    // Add ground with hexagonal pattern
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    
    // Using a slightly more contrasting ground color
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.3, 0.1);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    
    // Load the windmill model
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "building_windmill_blue.gltf", scene).then((result) => {
        // Get the root mesh of the loaded model
        const windmill = result.meshes[0];

        // Position and scale the windmill appropriately
        windmill.position = new BABYLON.Vector3(0, 0, 0);
        
        // Find the windmill fan mesh and animate it
        let fanMesh = null;
        
        // Log all mesh names to console for debugging
        console.log("Available meshes in the model:");
        result.meshes.forEach(mesh => {
            console.log(mesh.name);
            
            // Find the fan mesh specifically
            if (mesh.name.includes("building_windmill_top_fan_blue")) {
                fanMesh = mesh;
            }
        });
        
        // If we found the fan mesh, animate it with a slow rotation on Z axis
        if (fanMesh) {
            console.log("Found fan mesh, applying rotation animation");
            
            // Apply a slow continuous rotation to the fan
            const rotationSpeed = 0.005; // Very slow rotation speed
            scene.registerBeforeRender(() => {
                fanMesh.rotate(BABYLON.Axis.Z, rotationSpeed, BABYLON.Space.LOCAL);
            });
        } else {
            console.log("Fan mesh not found by exact name, trying alternative search");
            
            // If the exact name wasn't found, try to find a mesh that might be the fan
            result.meshes.forEach(mesh => {
                if (mesh.name.includes("fan") || mesh.name.includes("blade") || mesh.name.includes("sail")) {
                    console.log("Found potential fan mesh:", mesh.name);
                    const rotationSpeed = 0.005; // Very slow rotation speed
                    scene.registerBeforeRender(() => {
                        mesh.rotate(BABYLON.Axis.Z, rotationSpeed, BABYLON.Space.LOCAL);
                    });
                }
            });
        }
        
        console.log("Windmill loaded successfully");
    }).catch(error => {
        console.error("Error loading windmill model:", error);
    });
    
    return scene;
};

// Create the scene
const scene = createScene();

// Register a render loop
engine.runRenderLoop(() => {
    scene.render();
});

// Handle browser resize
window.addEventListener("resize", () => {
    engine.resize();
});
