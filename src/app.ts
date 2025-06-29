/**
 * Main application entry point
 * Coordinates all modules and initializes the 3D scene
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import '@babylonjs/loaders';

// Core modules
import { Engine } from './core/Engine';
import { SceneManager } from './core/Scene';
import { CameraController } from './core/Camera';

// Model modules
import { Terrain } from './models/Terrain';
import { Windmill } from './models/Windmill';

// Control modules
import { KeyboardControls } from './controls/KeyboardControls';
import { UIControls } from './controls/UIControls';

// Animation modules
import { FanRotation } from './animations/FanRotation';
import { Construction } from './animations/Construction';

// Utilities
import { logger, LogLevel } from './utils/logger';
import { DEFAULT_HEX_COORDINATES } from './utils/hexGrid';

// Types
import { CameraConfig, TerrainConfig, WindmillConfig, AnimationConfig } from './types';

/**
 * Main application class
 */
class WindmillApp {
  private engine!: Engine;
  private sceneManager!: SceneManager;
  private cameraController!: CameraController;
  private terrain!: Terrain;
  private windmill!: Windmill;
  private keyboardControls!: KeyboardControls;
  private uiControls!: UIControls;
  private fanRotation: FanRotation | null = null;
  private construction: Construction | null = null;

  /**
   * Initialize the application
   */
  public async init(): Promise<void> {
    try {
      // Set logger level
      logger.setLevel(LogLevel.DEBUG);

      // Show loading indicator
      this.uiControls = new UIControls();
      const hideLoading = this.uiControls.showLoading("Loading 3D scene...");

      // Initialize engine
      this.engine = new Engine("renderCanvas");
      
      // Create scene
      this.sceneManager = new SceneManager(this.engine.getEngine());
      
      // Setup camera
      this.setupCamera();
      
      // Setup controls
      this.setupControls();
      
      // Load models
      await this.loadModels();
      
      // Setup animations
      this.setupAnimations();
      
      // Setup UI
      this.setupUI();
      
      // Start render loop
      this.engine.startRenderLoop(this.sceneManager.getScene());
      
      // Hide loading indicator
      hideLoading();
      
      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', error);
      this.uiControls?.showError('Failed to load 3D scene. Please refresh the page.');
      throw error;
    }
  }

  /**
   * Setup camera with configuration
   */
  private setupCamera(): void {
    const cameraConfig: CameraConfig = {
      target: new BABYLON.Vector3(0, 2, 0),
      alpha: Math.PI,
      beta: Math.PI / 2.5,
      radius: 15,
      lowerRadiusLimit: 5,
      upperRadiusLimit: 50,
      wheelPrecision: 0.1,
      pinchPrecision: 0.01,
      panningSensibility: 50,
      inertia: 0.5
    };

    this.cameraController = new CameraController(
      this.sceneManager.getScene(),
      this.engine.getCanvas(),
      cameraConfig
    );
  }

  /**
   * Setup keyboard controls
   */
  private setupControls(): void {
    this.keyboardControls = new KeyboardControls(this.sceneManager.getScene());
    
    // Register vertical movement
    this.keyboardControls.registerVerticalMovement();
    
    // Update camera position based on vertical movement
    this.sceneManager.registerBeforeRender(() => {
      const deltaY = this.keyboardControls.getVerticalDelta();
      if (deltaY !== 0) {
        this.cameraController.moveVertically(deltaY);
      }
    });
  }

  /**
   * Load 3D models
   */
  private async loadModels(): Promise<void> {
    // Create terrain
    const terrainConfig: TerrainConfig = {
      hexSize: 1.0,
      hexHeight: 0.3,
      coordinates: DEFAULT_HEX_COORDINATES
    };
    
    this.terrain = new Terrain(this.sceneManager.getScene(), terrainConfig);
    await this.terrain.create();
    this.terrain.enableShadows();
    
    // Create windmill
    const windmillConfig: WindmillConfig = {
      position: new BABYLON.Vector3(0, 0, 0),
      scale: 1,
      rotationSpeed: 0.005
    };
    
    this.windmill = new Windmill(this.sceneManager.getScene(), windmillConfig);
    await this.windmill.load();
    
    // Parent windmill to central hex tile
    const centralMesh = this.terrain.getCentralMesh();
    if (centralMesh) {
      this.windmill.setParent(centralMesh);
    }
    
    // Enable shadows for windmill
    this.windmill.enableShadows(this.sceneManager.getShadowGenerator());
  }

  /**
   * Setup animations
   */
  private setupAnimations(): void {
    // Fan rotation animation
    const fanMesh = this.windmill.getFanMesh();
    
    if (!fanMesh) {
      logger.warn('Fan mesh not found, rotation will not work');
    }
    
    this.fanRotation = new FanRotation(fanMesh, 0.005);
    
    // Update fan rotation each frame
    this.sceneManager.registerAfterRender(() => {
      this.fanRotation?.update();
    });
    
    // Construction animation
    const animationConfig: AnimationConfig = {
      duration: 60,
      loopMode: BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    };
    
    this.construction = new Construction(
      this.sceneManager.getScene(),
      this.windmill.getAllMeshes(),
      animationConfig
    );
    
    // Register keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Setup keyboard shortcuts for animations
   */
  private setupKeyboardShortcuts(): void {
    // R key for fan rotation toggle
    this.keyboardControls.registerKey(82, () => {
      this.fanRotation?.toggle();
      this.uiControls.updateInstruction('fanRotation', this.fanRotation?.isActive() || false);
      logger.info(`Fan rotation toggled: ${this.fanRotation?.isActive() ? 'ON' : 'OFF'}`);
    });
    
    // C key for construction toggle
    this.keyboardControls.registerKey(67, () => {
      this.construction?.toggle();
      logger.info(`Construction animation triggered`);
    });
  }

  /**
   * Setup UI instructions
   */
  private setupUI(): void {
    // Fan rotation instruction
    this.uiControls.addInstruction('fanRotation', {
      text: `Press 'R' to toggle fan rotation (ON)`,
      top: 10,
      updateText: (state: boolean) => `Press 'R' to toggle fan rotation (${state ? 'ON' : 'OFF'})`
    });
    
    // Construction instruction
    this.uiControls.addInstruction('construction', {
      text: "Press 'C' to Construct/Deconstruct",
      top: 60
    });
    
    // Vertical movement instruction
    this.uiControls.addInstruction('verticalMovement', {
      text: "Space/Shift: Move camera up/down (in free view)",
      top: 110
    });
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    this.fanRotation?.dispose();
    this.construction?.dispose();
    this.keyboardControls?.dispose();
    this.uiControls?.dispose();
    this.windmill?.dispose();
    this.terrain?.dispose();
    this.cameraController?.dispose();
    this.sceneManager?.dispose();
    this.engine?.dispose();
    
    logger.info('Application disposed');
  }
}

// Initialize application when DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
  const app = new WindmillApp();
  
  try {
    await app.init();
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
  
  // Handle cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});
