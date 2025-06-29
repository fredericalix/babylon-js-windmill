/**
 * Generic model loading utilities
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import '@babylonjs/loaders';
import { logger } from '../utils/logger';

export class ModelLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelLoadError';
  }
}

/**
 * Load a 3D model from a file
 * @param path - Path to the assets directory
 * @param filename - Name of the model file
 * @param scene - The Babylon.js scene
 * @returns Promise resolving to the loaded meshes
 * @throws ModelLoadError if loading fails
 */
export async function loadModel(
  path: string,
  filename: string,
  scene: BABYLON.Scene
): Promise<BABYLON.AbstractMesh[]> {
  try {
    logger.info(`Loading model: ${filename}`);
    
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      path,
      filename,
      scene
    );
    
    logger.info(`Model loaded successfully: ${filename} (${result.meshes.length} meshes)`);
    return result.meshes;
  } catch (error) {
    logger.error(`Failed to load model: ${filename}`, error);
    throw new ModelLoadError(`Failed to load model: ${filename}`);
  }
}

/**
 * Clone a mesh with all its children
 * @param mesh - The mesh to clone
 * @param name - Name for the cloned mesh
 * @param parent - Optional parent for the cloned mesh
 * @returns The cloned mesh
 */
export function cloneMesh(
  mesh: BABYLON.AbstractMesh,
  name: string,
  parent?: BABYLON.TransformNode
): BABYLON.AbstractMesh | null {
  const clone = mesh.clone(name, parent || null);
  
  if (clone) {
    logger.debug(`Mesh cloned: ${name}`);
  } else {
    logger.warn(`Failed to clone mesh: ${name}`);
  }
  
  return clone;
}

/**
 * Find a mesh by name in a collection
 * @param meshes - Collection of meshes to search
 * @param namePattern - Name or pattern to search for
 * @returns The found mesh or null
 */
export function findMeshByName(
  meshes: BABYLON.AbstractMesh[],
  namePattern: string
): BABYLON.AbstractMesh | null {
  logger.debug(`Searching for mesh with pattern: ${namePattern} in ${meshes.length} meshes`);
  
  for (const mesh of meshes) {
    const meshName = (mesh as any).name || '';
    logger.debug(`Checking mesh: ${meshName}`);
    if (typeof meshName === 'string' && meshName.includes(namePattern)) {
      logger.info(`Found mesh: ${meshName}`);
      return mesh;
    }
  }
  
  logger.warn(`Mesh not found with pattern: ${namePattern}`);
  return null;
}

/**
 * Get all child meshes recursively
 * @param rootMesh - The root mesh
 * @returns Array of all descendant meshes
 */
export function getAllChildMeshes(
  rootMesh: BABYLON.AbstractMesh
): BABYLON.AbstractMesh[] {
  return [rootMesh, ...rootMesh.getChildMeshes(true)];
}

/**
 * Dispose of a mesh and all its children
 * @param mesh - The mesh to dispose
 * @param doNotRecurse - Whether to dispose children recursively
 */
export function disposeMesh(
  mesh: BABYLON.AbstractMesh,
  doNotRecurse: boolean = false
): void {
  const meshName = (mesh as any).name || 'unknown';
  mesh.dispose(doNotRecurse);
  logger.debug(`Mesh disposed: ${meshName}`);
} 