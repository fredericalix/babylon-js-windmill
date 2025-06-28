/**
 * Scene setup and configuration
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { logger } from '../utils/logger';

export class SceneManager {
  private scene: BABYLON.Scene;
  private hemisphericLight!: BABYLON.HemisphericLight;
  private directionalLight!: BABYLON.DirectionalLight;
  private shadowGenerator!: BABYLON.ShadowGenerator;

  /**
   * Create and configure the scene
   * @param engine - The Babylon.js engine instance
   */
  constructor(engine: BABYLON.Engine) {
    this.scene = new BABYLON.Scene(engine);
    
    // Setup lighting
    this.setupLighting();
    
    // Setup skybox
    this.setupSkybox();
    
    // Initialize action manager
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    
    logger.info('Scene created and configured');
  }

  /**
   * Get the scene instance
   * @returns The scene instance
   */
  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  /**
   * Get the shadow generator
   * @returns The shadow generator instance
   */
  public getShadowGenerator(): BABYLON.ShadowGenerator {
    return this.shadowGenerator;
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Hemispheric light for ambient lighting
    this.hemisphericLight = new BABYLON.HemisphericLight(
      "light", 
      new BABYLON.Vector3(0, 1, 0), 
      this.scene
    );
    this.hemisphericLight.intensity = 0.7;
    
    // Directional light for shadows
    this.directionalLight = new BABYLON.DirectionalLight(
      "dirLight", 
      new BABYLON.Vector3(-0.5, -0.5, -0.5), 
      this.scene
    );
    this.directionalLight.intensity = 0.5;
    
    // Setup shadow generator
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.directionalLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
    
    logger.info('Lighting configured');
  }

  /**
   * Setup scene skybox
   */
  private setupSkybox(): void {
    // Set scene clear color
    this.scene.clearColor = new BABYLON.Color4(0.4, 0.6, 0.9, 1.0);
    
    // Create skybox material
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    
    // Create skybox dome
    const skybox = BABYLON.MeshBuilder.CreateSphere(
      "skyBox", 
      { diameter: 1000, segments: 32 }, 
      this.scene
    );
    skybox.material = skyboxMaterial;
    
    // Invert the dome so we see it from the inside
    skybox.scaling.y = -1;
    
    logger.info('Skybox created');
  }

  /**
   * Register a mesh for shadow casting
   * @param mesh - The mesh to cast shadows
   */
  public addShadowCaster(mesh: BABYLON.AbstractMesh): void {
    this.shadowGenerator.addShadowCaster(mesh);
  }

  /**
   * Register a mesh to receive shadows
   * @param mesh - The mesh to receive shadows
   */
  public addShadowReceiver(mesh: BABYLON.AbstractMesh): void {
    mesh.receiveShadows = true;
  }

  /**
   * Register an action with the scene action manager
   * @param action - The action to register
   */
  public registerAction(action: BABYLON.Action): void {
    if (this.scene.actionManager) {
      this.scene.actionManager.registerAction(action);
    }
  }

  /**
   * Register a function to run before each render
   * @param func - The function to run
   */
  public registerBeforeRender(func: () => void): void {
    this.scene.registerBeforeRender(func);
  }

  /**
   * Register a function to run after each render
   * @param func - The function to run
   */
  public registerAfterRender(func: () => void): void {
    this.scene.registerAfterRender(func);
  }

  /**
   * Dispose of the scene and clean up resources
   */
  public dispose(): void {
    this.scene.dispose();
    logger.info('Scene disposed');
  }
} 