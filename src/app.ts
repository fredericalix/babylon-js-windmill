// Import Babylon.js core modules using the legacy structure for compatibility
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
// Import loaders needed for specific model formats (e.g., glTF/GLB)
import '@babylonjs/loaders';
// Optional: Import the Babylon.js Inspector for debugging the scene
// import '@babylonjs/inspector';

// --- Engine and Scene Setup ---

// Get the canvas element from the HTML document where the scene will be rendered
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
// Initialize the Babylon.js 3D engine
const engine = new BABYLON.Engine(canvas, true); // 'true' enables anti-aliasing

// --- Interfaces ---

// Define an interface to track the state (pressed/released) of vertical movement keys
interface VerticalKeys {
    [key: number]: boolean; // Maps key codes (numbers) to boolean states
}

// --- Scene Creation Function ---

// Function to create and configure the Babylon.js scene
const createScene = function(): BABYLON.Scene {
    // Create a new scene object associated with the engine
    const scene = new BABYLON.Scene(engine);
    
    // --- Lighting Setup ---

    // Add a HemisphericLight: provides ambient lighting from above
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7; // Adjust brightness
    
    // Add a DirectionalLight: simulates light from a specific direction (like the sun)
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
    dirLight.intensity = 0.5; // Adjust brightness, contributes to shadows
    
    // --- Camera Setup ---

    // Create an ArcRotateCamera: allows orbiting, zooming, and panning around a target point
    // Parameters: name, alpha (horizontal angle), beta (vertical angle), radius (distance), target position, scene
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 2, 0), scene);
    // Attach camera controls to the canvas, allowing user interaction (true by default)
    camera.attachControl(canvas, true);
    // Set limits for zooming in and out
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;
    // Adjust sensitivity for mouse wheel (zoom) and touch pinch (zoom)
    camera.wheelPrecision = 0.1;
    camera.pinchPrecision = 0.01;
    // Adjust sensitivity for panning (moving the camera target)
    camera.panningSensibility = 50;
    // Add camera inertia for smoother movement after interaction stops
    camera.inertia = 0.5;
    // Set the initial camera target point (where the camera looks)
    camera.target = new BABYLON.Vector3(0, 2, 0);
    
    // Commented out: Initially disable camera controls if a fixed view is desired from the start
    // camera.attachControl(canvas, false);
    
    // --- Camera View Toggle Logic ---

    // Flag to track if the camera is in fixed view mode or free navigation mode
    let isFixedView = true;
    // Define the parameters for the fixed camera view
    const fixedCameraTarget = new BABYLON.Vector3(0, 2, 0); // Target position for the fixed view
    const fixedCameraAlpha = Math.PI;                     // Horizontal angle for the fixed view (front view)
    const fixedCameraBeta = Math.PI / 2.5;                   // Vertical angle for the fixed view (slightly looking down)
    const fixedCameraRadius = 15;                      // Distance from the target for the fixed view
    
    // --- Keyboard Input Setup ---

    // Initialize the scene's action manager to handle keyboard events
    scene.actionManager = new BABYLON.ActionManager(scene);
    
    // Create an object to store the state of vertical movement keys (Space and Shift)
    const verticalKeys: VerticalKeys = {};
    
    // Register action for pressing the Space key (key code 32)
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 32 }, // Trigger on key down, parameter is key code
            function() { verticalKeys[32] = true; } // Set the key state to true (pressed)
        )
    );
    // Register action for releasing the Space key
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: 32 },   // Trigger on key up
            function() { verticalKeys[32] = false; } // Set the key state to false (released)
        )
    );
    
    // Register action for pressing the Shift key (key code 16)
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 16 },
            function() { verticalKeys[16] = true; }
        )
    );
    // Register action for releasing the Shift key
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: 16 },
            function() { verticalKeys[16] = false; }
        )
    );
    
    // --- Vertical Movement Logic ---

    // Register a function to run before each frame is rendered
    scene.registerBeforeRender(() => {
        // Only allow vertical movement if the camera is in free navigation mode
        if (!isFixedView) {
            // If the Space key is pressed, move the camera up
            if (verticalKeys[32]) {
                camera.position.y += 0.1; // Adjust speed as needed
            }
            // If the Shift key is pressed, move the camera down
            if (verticalKeys[16]) {
                camera.position.y -= 0.1; // Adjust speed as needed
            }
        }
    });
    
    // --- UI Button for Camera Toggle ---

    // Create an HTML button element to toggle the camera view
    const toggleCameraButton = document.createElement("button");
    toggleCameraButton.textContent = "Toggle Camera View"; // Initial button text
    // Style the button for visibility
    toggleCameraButton.style.position = "absolute";
    toggleCameraButton.style.bottom = "10px";
    toggleCameraButton.style.right = "10px";
    toggleCameraButton.style.zIndex = "100"; // Ensure it's above the canvas
    toggleCameraButton.style.padding = "10px";
    toggleCameraButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    toggleCameraButton.style.color = "white";
    toggleCameraButton.style.border = "none";
    toggleCameraButton.style.borderRadius = "5px";
    toggleCameraButton.style.cursor = "pointer";
    // Add the button to the HTML document body
    document.body.appendChild(toggleCameraButton);
    
    // Define the click event handler for the button
    toggleCameraButton.onclick = function() {
        // Flip the state of the fixed view flag
        isFixedView = !isFixedView;
        
        // If switching back to fixed view
        if (isFixedView) {
            // Reset camera parameters to the defined fixed view settings
            camera.alpha = fixedCameraAlpha;
            camera.beta = fixedCameraBeta;
            camera.radius = fixedCameraRadius;
            camera.target = fixedCameraTarget;
            // Detach camera controls to prevent user interaction
            camera.attachControl(canvas, false);
            // Update button text
            toggleCameraButton.textContent = "Switch to Free View";
        } else { // If switching to free view
            // Attach camera controls to allow user interaction
            camera.attachControl(canvas, true);
            // Update button text
            toggleCameraButton.textContent = "Return to Fixed View";
        }
    };
    
    // --- Skybox Setup ---

    // Instead of using a texture-based skybox that requires external files,
    // we'll create a simple color gradient for the scene background
    
    // Set the scene clear color to a light blue gradient
    scene.clearColor = new BABYLON.Color4(0.4, 0.6, 0.9, 1.0);
    
    // Create a simple skybox dome with a gradient material
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    
    // Use emissive color for a solid color that's not affected by lighting
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    
    // Create a dome instead of a box for a more natural sky appearance
    const skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 1000, segments: 32 }, scene);
    skybox.material = skyboxMaterial;
    
    // Invert the dome so we see it from the inside
    skybox.scaling.y = -1;
    
    // --- Model Loading and Positioning ---

    // Variables to store the base meshes
    let centralBaseMesh: BABYLON.AbstractMesh | null = null;
    let baseMeshes: BABYLON.AbstractMesh[] = [];
    
    // Function to calculate the position of a hexagon tile at a given grid coordinate
    // Using axial coordinates (q,r) for hexagonal grid positioning
    // See: https://www.redblobgames.com/grids/hexagons/ for detailed explanation
    const getHexPosition = (q: number, r: number, size: number, height: number): BABYLON.Vector3 => {
        // For a pointy-top hexagon layout:
        const x = size * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
        const z = size * (3/2 * r);
        return new BABYLON.Vector3(x, height, z);
    };
    
    // Load the base model first (e.g., grass hexagon)
    BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "hex_grass_bottom.gltf", scene).then((baseResult) => {
        // Create a parent node for all hex tiles to make management easier
        const hexParent = new BABYLON.TransformNode("hexParent", scene);
        
        // Define the hexagonal grid coordinates for our island
        // Format: [q, r] in axial coordinates
        // (0,0) is the center tile where the windmill will be placed
        const hexCoords = [
            [0, 0],   // Center tile
            [1, 0],   // East
            [0, 1],   // Southeast
            [-1, 1],  // Southwest
            [-1, 0],  // West
            [0, -1],  // Northwest
            [1, -1],  // Northeast
            // Add a second ring of hexagons for a larger island
            [2, 0],   // Far East
            [2, -1],  // East-Northeast
            [2, -2],  // Northeast-Northeast
            [1, -2],  // Far Northeast
            [0, -2],  // Far Northwest
            [-1, -1], // Northwest-Northwest
            [-2, 0],  // Far West
            [-2, 1],  // West-Southwest
            [-2, 2],  // Southwest-Southwest
            [-1, 2],  // Far Southwest
            [0, 2],   // Far Southeast
            [1, 1]    // Southeast-Southeast
        ];
        
        // Clone the base mesh for each hex coordinate
        const hexSize = 1.0;  // Size factor for positioning
        const hexHeight = 0.3; // Height offset from ground
        
        // Get the root mesh from the loaded model
        const originalMesh = baseResult.meshes[0];
        originalMesh.setEnabled(false); // Hide the original mesh, we'll use clones
        
        // Create all the hex tiles
        hexCoords.forEach(([q, r], index) => {
            // Clone the original mesh
            const hexClone = originalMesh.clone(`hex_${q}_${r}`, hexParent);
            if (hexClone) {
                // Scale the hex tile
                hexClone.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                
                // Position according to hex grid coordinates
                const position = getHexPosition(q, r, hexSize, hexHeight);
                hexClone.position = position;
                
                // Enable the clone
                hexClone.setEnabled(true);
                
                // Add to our array of base meshes
                baseMeshes.push(hexClone);
                
                // If this is the center tile (0,0), store it separately
                if (q === 0 && r === 0) {
                    centralBaseMesh = hexClone;
                }
            }
        });
        
        // Log confirmation of base model loading
        console.log("Hexagonal island created with", baseMeshes.length, "tiles");
        
        // Chain the loading of the windmill model after the base is loaded
        return BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "building_windmill_blue.gltf", scene);
    }).then((result) => { // This 'then' block executes after the windmill model is loaded
        // Get the root mesh of the loaded windmill model
        const windmillRoot = result.meshes[0];
        // Get all descendant meshes for potential manipulation (like animation)
        const windmillMeshes = [windmillRoot, ...windmillRoot.getChildMeshes(true)];
        
        // Log the names of all loaded windmill meshes for debugging
        console.log("Windmill meshes:", result.meshes.map(mesh => mesh.name));

        // --- Parenting the Windmill to the Base ---
        // Check if the central base mesh was loaded successfully
        if (centralBaseMesh) {
            // Set the central base mesh as the parent of the windmill's root mesh
            // This makes the windmill's position relative to the base
            windmillRoot.parent = centralBaseMesh;
            // Set the windmill's position relative to its parent (the base)
            // (0, 0, 0) places the windmill's origin at the base's origin
            windmillRoot.position = new BABYLON.Vector3(0, 0, 0); 
            // Safely get the name of the central base mesh for logging
            const meshName = centralBaseMesh ? (centralBaseMesh as any).name || 'unknown' : 'unknown';
            console.log(`Windmill parented to ${meshName}. Relative position set to (0,0,0).`);
        } else {
            // If the central base mesh failed to load, log a warning and position the windmill absolutely
            console.warn("Central base mesh not found, cannot parent windmill. Setting absolute position.");
            windmillRoot.position = new BABYLON.Vector3(0, 0, 0); // Fallback position
        }
        // Optional: Adjust the scale of the windmill if needed
        // windmillRoot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

        // --- Fan Rotation Logic ---
        // Variable to store the fan mesh once found
        let fanMesh: BABYLON.AbstractMesh | null = null;
        // Flag to control whether the fan is currently rotating
        let isRotating = true; 
        // Speed of the fan rotation (radians per frame)
        const rotationSpeed = 0.005;

        // Find the specific mesh representing the fan blades
        // Iterate through all meshes loaded with the windmill model
        result.meshes.forEach(mesh => {
            // Safely access the mesh name (some meshes might not have one)
            const meshName = (mesh as any).name || '';
            // Check if the mesh name contains the identifier for the fan part
            if (typeof meshName === 'string' && meshName.includes("building_windmill_top_fan_blue")) {
                // Assign the found mesh to the fanMesh variable
                fanMesh = mesh;
            }
        });

        if (fanMesh) {
            // Safe way to log mesh name
            console.log("Found fan mesh, setting up rotation:", (fanMesh as any).name || 'unknown'); // Log fan mesh name
            const animateFan = () => {
                // Log current state inside the animation loop
                // console.log(`animateFan called: isRotating = ${isRotating}, fanMesh = ${fanMesh ? fanMesh.name : 'null'}`); // Optional: Very verbose log
                if (isRotating && fanMesh) {
                    // Log right before attempting rotation
                    // console.log("Attempting fan rotation...");
                    fanMesh.rotate(BABYLON.Axis.Z, rotationSpeed, BABYLON.Space.LOCAL);
                }
            };
            // Use registerAfterRender instead of registerBeforeRender
            scene.registerAfterRender(animateFan);

            // --- Add instruction text for fan rotation (controlled by 'R') ---
            const fanInstructionText = document.createElement("div");
            fanInstructionText.textContent = `Press 'R' to toggle fan rotation (${isRotating ? "ON" : "OFF"})`; // Initial state
            fanInstructionText.style.position = "absolute";
            fanInstructionText.style.top = "10px"; // Position below the other text
            fanInstructionText.style.left = "10px";
            fanInstructionText.style.zIndex = "100";
            fanInstructionText.style.padding = "10px";
            fanInstructionText.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            fanInstructionText.style.color = "white";
            fanInstructionText.style.border = "none";
            fanInstructionText.style.borderRadius = "5px";
            document.body.appendChild(fanInstructionText); // Add to body

        } else {
            console.log("Fan mesh not found.");
        }
        // --- End Fan Rotation Logic ---


        // --- Construction/Deconstruction Animation ---
        let isConstructed = true; // Start in constructed state
        const animationDuration = 60; // Duration in frames

        const constructAnimGroup = new BABYLON.AnimationGroup("constructGroup");
        const deconstructAnimGroup = new BABYLON.AnimationGroup("deconstructGroup");

        windmillMeshes.forEach((mesh, index) => {
            // Ensure mesh starts visible and at full scale
            mesh.visibility = 1;
            mesh.scaling = new BABYLON.Vector3(1, 1, 1);

            // Construction Animation (Scale from 0 to 1)
            const constructAnim = new BABYLON.Animation(
                `meshConstruct_${index}`, "scaling", 60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            constructAnim.setKeys([
                { frame: 0, value: new BABYLON.Vector3(0.001, 0.001, 0.001) },
                { frame: animationDuration, value: new BABYLON.Vector3(1, 1, 1) }
            ]);

            // Deconstruction Animation (Scale from 1 to 0)
            const deconstructAnim = new BABYLON.Animation(
                `meshDeconstruct_${index}`, "scaling", 60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            deconstructAnim.setKeys([
                { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
                { frame: animationDuration, value: new BABYLON.Vector3(0.001, 0.001, 0.001) }
            ]);

            constructAnimGroup.addTargetedAnimation(constructAnim, mesh);
            deconstructAnimGroup.addTargetedAnimation(deconstructAnim, mesh);
        });

        constructAnimGroup.normalize(0, animationDuration);
        deconstructAnimGroup.normalize(0, animationDuration);


        // Ensure Action Manager exists
        if (!scene.actionManager) {
            scene.actionManager = new BABYLON.ActionManager(scene);
        }

        // --- Remove potentially incorrect 'R' key binding (from previous edit) ---
        const oldRKeyActionIndex = scene.actionManager.actions.findIndex(action =>
            action.triggerOptions && (action.triggerOptions as any).parameter === 82 && // Find 'R' key action
             action.trigger === BABYLON.ActionManager.OnKeyDownTrigger
        );
         if (oldRKeyActionIndex > -1) {
             console.log("Removing potentially incorrect 'R' key action.");
             scene.actionManager.actions.splice(oldRKeyActionIndex, 1);
         }


        // --- Remove old/incorrect instruction text ---
         const oldInstructionText = document.querySelector("div[style*='Press \\'R\\' to Construct/Deconstruct']"); // Find old text
        if (oldInstructionText) {
            console.log("Removing old instruction text for R=Construct/Deconstruct.");
            oldInstructionText.remove();
        }

        // --- Add instruction text for construction/deconstruction (controlled by 'C') ---
        const constructionInstructionText = document.createElement("div");
        // Position this text slightly below the fan rotation text
        constructionInstructionText.textContent = "Press 'C' to Construct/Deconstruct";
        constructionInstructionText.style.position = "absolute";
        constructionInstructionText.style.top = "60px"; // Adjust top position
        constructionInstructionText.style.left = "10px";
        constructionInstructionText.style.zIndex = "100";
        constructionInstructionText.style.padding = "10px";
        constructionInstructionText.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        constructionInstructionText.style.color = "white";
        constructionInstructionText.style.border = "none";
        constructionInstructionText.style.borderRadius = "5px";
        document.body.appendChild(constructionInstructionText);


        // --- Register 'R' key (keyCode 82) for Fan Rotation Toggle ---
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 82 }, // 'R' key
                function() {
                    console.log("'R' key pressed. Current isRotating state:", isRotating); // Log key press and current state
                    if (fanMesh) { // Only toggle if fan exists
                        isRotating = !isRotating;
                        console.log("Toggled isRotating state to:", isRotating); // Log new state
                        // Update fan instruction text
                        const fanTextElement = document.querySelector("div[style*='toggle fan rotation']"); // Find the text element
                         if (fanTextElement) {
                            fanTextElement.textContent = `Press 'R' to toggle fan rotation (${isRotating ? "ON" : "OFF"})`;
                        }
                    }
                }
            )
        );

        // --- Register 'C' key (keyCode 67) for Construction/Deconstruction ---
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: 67 }, // 'C' key
                function() {
                    // Stop any ongoing animation
                    constructAnimGroup.stop();
                    deconstructAnimGroup.stop();

                    if (isConstructed) {
                        console.log("Deconstructing windmill (Key C)...");
                        windmillMeshes.forEach(mesh => {
                            if (mesh) mesh.visibility = 1;
                        });
                        deconstructAnimGroup.play().onAnimationGroupEndObservable.addOnce(() => {
                             console.log("Deconstruction complete.");
                        });
                    } else {
                        console.log("Constructing windmill (Key C)...");
                        windmillMeshes.forEach(mesh => {
                            if (mesh) mesh.visibility = 1;
                        });
                        constructAnimGroup.play().onAnimationGroupEndObservable.addOnce(() => {
                             console.log("Construction complete.");
                        });
                    }
                    isConstructed = !isConstructed; // Toggle state
                }
            )
        );
        // --- End Construction/Deconstruction Animation ---


        // Add shadow generator (if needed, ensure lights and meshes are set up)
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        // Add all windmill meshes as shadow casters
        windmillMeshes.forEach(mesh => {
             shadowGenerator.addShadowCaster(mesh, true); // Add children as well
        });

        console.log("Windmill model loaded and animations set up.");

    }).catch((error) => {
        console.error("Error loading models:", error);
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
