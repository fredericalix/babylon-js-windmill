/**
 * Fan rotation animation management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { logger } from '../utils/logger';

export class FanRotation {
  private fanMesh: BABYLON.AbstractMesh | null = null;
  private isRotating: boolean = true;
  private rotationSpeed: number;

  /**
   * Create fan rotation controller
   * @param fanMesh - The fan mesh to rotate
   * @param rotationSpeed - Rotation speed in radians per frame
   */
  constructor(fanMesh: BABYLON.AbstractMesh | null, rotationSpeed: number = 0.005) {
    this.fanMesh = fanMesh;
    this.rotationSpeed = rotationSpeed;
    
    if (!fanMesh) {
      logger.warn('Fan rotation controller created without fan mesh');
    } else {
      logger.info('Fan rotation controller initialized');
    }
  }

  /**
   * Start fan rotation
   */
  public start(): void {
    this.isRotating = true;
    logger.debug('Fan rotation started');
  }

  /**
   * Stop fan rotation
   */
  public stop(): void {
    this.isRotating = false;
    logger.debug('Fan rotation stopped');
  }

  /**
   * Toggle fan rotation
   */
  public toggle(): void {
    this.isRotating = !this.isRotating;
    logger.debug(`Fan rotation toggled: ${this.isRotating ? 'ON' : 'OFF'}`);
  }

  /**
   * Get rotation status
   * @returns Whether the fan is rotating
   */
  public isActive(): boolean {
    return this.isRotating;
  }

  /**
   * Set rotation speed
   * @param speed - New rotation speed
   */
  public setSpeed(speed: number): void {
    this.rotationSpeed = speed;
  }

  /**
   * Update fan rotation
   * Should be called each frame
   */
  public update(): void {
    if (this.isRotating && this.fanMesh) {
      this.fanMesh.rotate(
        BABYLON.Axis.Z, 
        this.rotationSpeed, 
        BABYLON.Space.LOCAL
      );
    }
  }

  /**
   * Set the fan mesh
   * @param mesh - The new fan mesh
   */
  public setFanMesh(mesh: BABYLON.AbstractMesh): void {
    this.fanMesh = mesh;
    logger.debug('Fan mesh updated');
  }

  /**
   * Dispose of the fan rotation controller
   */
  public dispose(): void {
    this.fanMesh = null;
    logger.info('Fan rotation controller disposed');
  }
} 