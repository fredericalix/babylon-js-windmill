/**
 * Hexagonal terrain management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { TerrainConfig } from '../types';
import { getHexPosition } from '../utils/hexGrid';
import { loadModel, cloneMesh } from './ModelLoader';
import { logger } from '../utils/logger';

export class Terrain {
  private scene: BABYLON.Scene;
  private config: TerrainConfig;
  private baseMeshes: BABYLON.AbstractMesh[] = [];
  private centralBaseMesh: BABYLON.AbstractMesh | null = null;
  private hexParent: BABYLON.TransformNode;
  private originalMesh: BABYLON.AbstractMesh | null = null;

  /**
   * Create the hexagonal terrain
   * @param scene - The Babylon.js scene
   * @param config - Terrain configuration
   */
  constructor(scene: BABYLON.Scene, config: TerrainConfig) {
    this.scene = scene;
    this.config = config;
    
    // Create parent node for all hex tiles
    this.hexParent = new BABYLON.TransformNode("hexParent", scene);
    
    logger.info('Terrain controller initialized');
  }

  /**
   * Load and create the terrain
   * @returns Promise that resolves when terrain is loaded
   */
  public async create(): Promise<void> {
    try {
      // Load the base hex model
      const meshes = await loadModel("assets/", "hex_grass_bottom.gltf", this.scene);
      
      if (meshes.length === 0) {
        throw new Error('No meshes loaded from hex model');
      }
      
      // Get the root mesh and hide it
      this.originalMesh = meshes[0];
      this.originalMesh.setEnabled(false);
      
      // Create hex tiles
      this.createHexTiles();
      
      logger.info(`Hexagonal island created with ${this.baseMeshes.length} tiles`);
    } catch (error) {
      logger.error('Failed to create terrain', error);
      throw error;
    }
  }

  /**
   * Create individual hex tiles
   */
  private createHexTiles(): void {
    if (!this.originalMesh) {
      logger.error('Original mesh not loaded');
      return;
    }

    this.config.coordinates.forEach(([q, r]) => {
      const hexClone = cloneMesh(
        this.originalMesh!,
        `hex_${q}_${r}`,
        this.hexParent
      );

      if (hexClone) {
        // Scale the hex tile
        hexClone.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        
        // Position according to hex grid coordinates
        const position = getHexPosition(
          q, 
          r, 
          this.config.hexSize, 
          this.config.hexHeight
        );
        hexClone.position = position;
        
        // Enable the clone
        hexClone.setEnabled(true);
        
        // Add to our array of base meshes
        this.baseMeshes.push(hexClone);
        
        // Store the central tile
        if (q === 0 && r === 0) {
          this.centralBaseMesh = hexClone;
        }
      }
    });
  }

  /**
   * Get the central base mesh
   * @returns The central hex tile or null
   */
  public getCentralMesh(): BABYLON.AbstractMesh | null {
    return this.centralBaseMesh;
  }

  /**
   * Get all base meshes
   * @returns Array of all hex tiles
   */
  public getAllMeshes(): BABYLON.AbstractMesh[] {
    return this.baseMeshes;
  }

  /**
   * Enable shadow receiving for all terrain meshes
   */
  public enableShadows(): void {
    this.baseMeshes.forEach(mesh => {
      mesh.receiveShadows = true;
    });
    logger.debug('Shadows enabled for terrain');
  }

  /**
   * Get hex tile at specific coordinates
   * @param q - Q coordinate
   * @param r - R coordinate
   * @returns The hex mesh at those coordinates or null
   */
  public getHexAt(q: number, r: number): BABYLON.AbstractMesh | null {
    const name = `hex_${q}_${r}`;
    return this.baseMeshes.find(mesh => 
      (mesh as any).name === name
    ) || null;
  }

  /**
   * Dispose of the terrain
   */
  public dispose(): void {
    this.baseMeshes.forEach(mesh => {
      mesh.dispose();
    });
    
    if (this.originalMesh) {
      this.originalMesh.dispose();
    }
    
    this.hexParent.dispose();
    
    logger.info('Terrain disposed');
  }
} 