/**
 * Babylon.js engine initialization and management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { logger } from '../utils/logger';

export class Engine {
  private engine: BABYLON.Engine;
  private canvas: HTMLCanvasElement;

  /**
   * Initialize the Babylon.js engine
   * @param canvasId - The ID of the canvas element
   * @throws Error if canvas element is not found
   */
  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    
    if (!canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true); // true enables anti-aliasing
    
    logger.info('Babylon.js engine initialized');
    
    // Handle window resize
    this.setupResizeHandler();
  }

  /**
   * Get the Babylon.js engine instance
   * @returns The engine instance
   */
  public getEngine(): BABYLON.Engine {
    return this.engine;
  }

  /**
   * Get the canvas element
   * @returns The canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Start the render loop
   * @param scene - The scene to render
   */
  public startRenderLoop(scene: BABYLON.Scene): void {
    this.engine.runRenderLoop(() => {
      scene.render();
    });
    
    logger.info('Render loop started');
  }

  /**
   * Stop the render loop
   */
  public stopRenderLoop(): void {
    this.engine.stopRenderLoop();
    logger.info('Render loop stopped');
  }

  /**
   * Setup window resize handler
   */
  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Dispose of the engine and clean up resources
   */
  public dispose(): void {
    this.stopRenderLoop();
    this.engine.dispose();
    logger.info('Engine disposed');
  }
} 