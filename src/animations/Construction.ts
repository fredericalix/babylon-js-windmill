/**
 * Construction and deconstruction animation management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { AnimationConfig } from '../types';
import { logger } from '../utils/logger';

export class Construction {
  private scene: BABYLON.Scene;
  private meshes: BABYLON.AbstractMesh[];
  private constructAnimGroup: BABYLON.AnimationGroup;
  private deconstructAnimGroup: BABYLON.AnimationGroup;
  private isConstructed: boolean = true;
  private config: AnimationConfig;

  /**
   * Create construction animation controller
   * @param scene - The Babylon.js scene
   * @param meshes - Meshes to animate
   * @param config - Animation configuration
   */
  constructor(
    scene: BABYLON.Scene, 
    meshes: BABYLON.AbstractMesh[], 
    config: AnimationConfig
  ) {
    this.scene = scene;
    this.meshes = meshes;
    this.config = config;

    // Create animation groups
    this.constructAnimGroup = new BABYLON.AnimationGroup("constructGroup", scene);
    this.deconstructAnimGroup = new BABYLON.AnimationGroup("deconstructGroup", scene);

    // Setup animations
    this.setupAnimations();

    logger.info('Construction animation controller initialized');
  }

  /**
   * Setup construction and deconstruction animations
   */
  private setupAnimations(): void {
    this.meshes.forEach((mesh, index) => {
      // Ensure mesh starts visible and at full scale
      mesh.visibility = 1;
      mesh.scaling = new BABYLON.Vector3(1, 1, 1);

      // Construction Animation (Scale from 0 to 1)
      const constructAnim = new BABYLON.Animation(
        `meshConstruct_${index}`, 
        "scaling", 
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        this.config.loopMode
      );
      
      constructAnim.setKeys([
        { frame: 0, value: new BABYLON.Vector3(0.001, 0.001, 0.001) },
        { frame: this.config.duration, value: new BABYLON.Vector3(1, 1, 1) }
      ]);

      // Deconstruction Animation (Scale from 1 to 0)
      const deconstructAnim = new BABYLON.Animation(
        `meshDeconstruct_${index}`, 
        "scaling", 
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        this.config.loopMode
      );
      
      deconstructAnim.setKeys([
        { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
        { frame: this.config.duration, value: new BABYLON.Vector3(0.001, 0.001, 0.001) }
      ]);

      // Add animations to groups
      this.constructAnimGroup.addTargetedAnimation(constructAnim, mesh);
      this.deconstructAnimGroup.addTargetedAnimation(deconstructAnim, mesh);
    });

    // Normalize animation groups
    this.constructAnimGroup.normalize(0, this.config.duration);
    this.deconstructAnimGroup.normalize(0, this.config.duration);

    logger.debug('Construction animations setup complete');
  }

  /**
   * Start construction animation
   * @returns Promise that resolves when animation completes
   */
  public construct(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isConstructed) {
        resolve();
        return;
      }

      // Stop any ongoing animation
      this.stop();

      logger.info('Starting construction animation');

      // Ensure meshes are visible
      this.meshes.forEach(mesh => {
        mesh.visibility = 1;
      });

      // Play construction animation
      this.constructAnimGroup.play();
      
      // Resolve when animation completes
      this.constructAnimGroup.onAnimationGroupEndObservable.addOnce(() => {
        this.isConstructed = true;
        logger.info('Construction animation complete');
        resolve();
      });
    });
  }

  /**
   * Start deconstruction animation
   * @returns Promise that resolves when animation completes
   */
  public deconstruct(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isConstructed) {
        resolve();
        return;
      }

      // Stop any ongoing animation
      this.stop();

      logger.info('Starting deconstruction animation');

      // Ensure meshes are visible
      this.meshes.forEach(mesh => {
        mesh.visibility = 1;
      });

      // Play deconstruction animation
      this.deconstructAnimGroup.play();
      
      // Resolve when animation completes
      this.deconstructAnimGroup.onAnimationGroupEndObservable.addOnce(() => {
        this.isConstructed = false;
        logger.info('Deconstruction animation complete');
        resolve();
      });
    });
  }

  /**
   * Toggle construction state
   * @returns Promise that resolves when animation completes
   */
  public toggle(): Promise<void> {
    return this.isConstructed ? this.deconstruct() : this.construct();
  }

  /**
   * Stop all ongoing animations
   */
  public stop(): void {
    this.constructAnimGroup.stop();
    this.deconstructAnimGroup.stop();
  }

  /**
   * Get construction state
   * @returns Whether the object is constructed
   */
  public isBuilt(): boolean {
    return this.isConstructed;
  }

  /**
   * Reset to constructed state without animation
   */
  public reset(): void {
    this.stop();
    
    this.meshes.forEach(mesh => {
      mesh.scaling = new BABYLON.Vector3(1, 1, 1);
      mesh.visibility = 1;
    });
    
    this.isConstructed = true;
    logger.debug('Construction state reset');
  }

  /**
   * Dispose of the construction controller
   */
  public dispose(): void {
    this.stop();
    this.constructAnimGroup.dispose();
    this.deconstructAnimGroup.dispose();
    
    logger.info('Construction animation controller disposed');
  }
} 