/**
 * Windmill-specific logic and management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { WindmillConfig } from '../types';
import { loadModel, findMeshByName, getAllChildMeshes } from './ModelLoader';
import { logger } from '../utils/logger';

export class Windmill {
  private scene: BABYLON.Scene;
  private config: WindmillConfig;
  private rootMesh: BABYLON.AbstractMesh | null = null;
  private fanMesh: BABYLON.AbstractMesh | null = null;
  private allMeshes: BABYLON.AbstractMesh[] = [];
  private isRotating: boolean = true;
  private parent: BABYLON.AbstractMesh | null = null;

  /**
   * Create the windmill controller
   * @param scene - The Babylon.js scene
   * @param config - Windmill configuration
   */
  constructor(scene: BABYLON.Scene, config: WindmillConfig) {
    this.scene = scene;
    this.config = config;
    
    logger.info('Windmill controller initialized');
  }

  /**
   * Load the windmill model
   * @returns Promise that resolves when model is loaded
   */
  public async load(): Promise<void> {
    try {
      const meshes = await loadModel(
        "assets/", 
        "building_windmill_blue.gltf", 
        this.scene
      );
      
      if (meshes.length === 0) {
        throw new Error('No meshes loaded from windmill model');
      }
      
      // Get the root mesh
      this.rootMesh = meshes[0];
      
      // Store all imported meshes (not just children of root)
      this.allMeshes = meshes;
      
      // Log all mesh names for debugging
      logger.debug('All windmill meshes:');
      this.allMeshes.forEach(mesh => {
        logger.debug(`  - ${(mesh as any).name || 'unnamed'}`);
      });
      
      // Find the fan mesh in all imported meshes
      // Try different patterns as the name might vary
      this.fanMesh = findMeshByName(this.allMeshes, "fan") || 
                     findMeshByName(this.allMeshes, "building_windmill_top_fan") ||
                     findMeshByName(this.allMeshes, "building_windmill_top_fan_blue");
      
      if (!this.fanMesh) {
        logger.warn('Fan mesh not found in windmill model');
      }
      
      // Position the windmill
      this.setPosition(this.config.position);
      
      // Apply scaling if needed
      const scale = this.config.scale || 1;
      this.rootMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
      
      logger.info('Windmill model loaded successfully');
    } catch (error) {
      logger.error('Failed to load windmill model', error);
      throw error;
    }
  }

  /**
   * Set the parent mesh for the windmill
   * @param parent - The parent mesh
   */
  public setParent(parent: BABYLON.AbstractMesh): void {
    if (this.rootMesh) {
      this.rootMesh.parent = parent;
      this.parent = parent;
      
      // Reset position relative to parent
      this.rootMesh.position = new BABYLON.Vector3(0, 0, 0);
      
      const parentName = (parent as any).name || 'unknown';
      logger.info(`Windmill parented to ${parentName}`);
    }
  }

  /**
   * Set windmill position
   * @param position - The new position
   */
  public setPosition(position: BABYLON.Vector3): void {
    if (this.rootMesh) {
      this.rootMesh.position = position;
    }
  }

  /**
   * Start fan rotation
   */
  public startFanRotation(): void {
    this.isRotating = true;
    logger.debug('Fan rotation started');
  }

  /**
   * Stop fan rotation
   */
  public stopFanRotation(): void {
    this.isRotating = false;
    logger.debug('Fan rotation stopped');
  }

  /**
   * Toggle fan rotation
   */
  public toggleFanRotation(): void {
    this.isRotating = !this.isRotating;
    logger.debug(`Fan rotation toggled: ${this.isRotating ? 'ON' : 'OFF'}`);
  }

  /**
   * Get fan rotation status
   * @returns Whether the fan is rotating
   */
  public isFanRotating(): boolean {
    return this.isRotating;
  }

  /**
   * Update function to be called each frame
   */
  public update(): void {
    if (this.isRotating && this.fanMesh) {
      this.fanMesh.rotate(
        BABYLON.Axis.Z, 
        this.config.rotationSpeed, 
        BABYLON.Space.LOCAL
      );
    }
  }

  /**
   * Get all windmill meshes
   * @returns Array of all meshes
   */
  public getAllMeshes(): BABYLON.AbstractMesh[] {
    return this.allMeshes;
  }

  /**
   * Get the root mesh
   * @returns The root mesh or null
   */
  public getRootMesh(): BABYLON.AbstractMesh | null {
    return this.rootMesh;
  }

  /**
   * Get the fan mesh
   * @returns The fan mesh or null
   */
  public getFanMesh(): BABYLON.AbstractMesh | null {
    return this.fanMesh;
  }

  /**
   * Enable shadows for all windmill meshes
   * @param shadowGenerator - The shadow generator
   */
  public enableShadows(shadowGenerator: BABYLON.ShadowGenerator): void {
    this.allMeshes.forEach(mesh => {
      shadowGenerator.addShadowCaster(mesh);
    });
    logger.debug('Shadows enabled for windmill');
  }

  /**
   * Dispose of the windmill
   */
  public dispose(): void {
    this.allMeshes.forEach(mesh => {
      mesh.dispose();
    });
    
    logger.info('Windmill disposed');
  }
} 