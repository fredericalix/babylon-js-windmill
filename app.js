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
    // Position adjusted to be in front of the windmill
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 3, -12), scene); // Changed Z from 12 to -12
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
            camera.position = new BABYLON.Vector3(0, 3, -12); // Use the new front-facing position
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
        const windmillRoot = result.meshes[0];
        // Get all descendant meshes including the root itself for animation
        const windmillMeshes = [windmillRoot, ...windmillRoot.getChildMeshes(true)];

        // Position and scale the windmill appropriately (applied to the root)
        windmillRoot.position = new BABYLON.Vector3(0, 0, 0);

        // --- Fan Rotation Logic ---
        let fanMesh = null;
        let isRotating = true; // Variable to control rotation state
        const rotationSpeed = 0.005;

        // Find the fan mesh by iterating through the loaded meshes directly
        result.meshes.forEach(mesh => {
            if (mesh.name.includes("building_windmill_top_fan_blue")) {
                fanMesh = mesh;
            }
        });

        if (fanMesh) {
            console.log("Found fan mesh, setting up rotation:", fanMesh.name); // Log fan mesh name
            const animateFan = () => {
                // Log current state inside the animation loop
                // console.log(`animateFan called: isRotating = ${isRotating}, fanMesh = ${fanMesh ? fanMesh.name : 'null'}`); // Optional: Very verbose log
                if (isRotating) {
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
            action.triggerOptions && action.triggerOptions.parameter === 82 && // Find 'R' key action
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
                        windmillMeshes.forEach(mesh => mesh.visibility = 1);
                        deconstructAnimGroup.play().onAnimationGroupEndObservable.addOnce(() => {
                             console.log("Deconstruction complete.");
                        });
                    } else {
                        console.log("Constructing windmill (Key C)...");
                        windmillMeshes.forEach(mesh => mesh.visibility = 1);
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
        // Ensure ground receives shadows (already set)
        // ground.receiveShadows = true;

        console.log("Windmill model loaded and animations set up.");

    }).catch((error) => {
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
