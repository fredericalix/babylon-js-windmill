/**
 * Camera controls and management
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { CameraConfig } from '../types';
import { logger } from '../utils/logger';

export class CameraController {
  private camera: BABYLON.ArcRotateCamera;
  private canvas: HTMLCanvasElement;
  private isFixedView: boolean = true;
  private fixedViewConfig: CameraConfig;
  private toggleButton: HTMLButtonElement | null = null;

  /**
   * Initialize the camera controller
   * @param scene - The Babylon.js scene
   * @param canvas - The canvas element
   * @param config - Camera configuration
   */
  constructor(
    scene: BABYLON.Scene, 
    canvas: HTMLCanvasElement, 
    config: CameraConfig
  ) {
    this.canvas = canvas;
    this.fixedViewConfig = config;

    // Create ArcRotateCamera
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      config.alpha,
      config.beta,
      config.radius,
      config.target,
      scene
    );

    // Configure camera limits and sensitivity
    this.camera.lowerRadiusLimit = config.lowerRadiusLimit;
    this.camera.upperRadiusLimit = config.upperRadiusLimit;
    this.camera.wheelPrecision = config.wheelPrecision;
    this.camera.pinchPrecision = config.pinchPrecision;
    this.camera.panningSensibility = config.panningSensibility;
    this.camera.inertia = config.inertia;

    // Start in fixed view mode
    this.setFixedView(true);

    // Create toggle button
    this.createToggleButton();

    logger.info('Camera controller initialized');
  }

  /**
   * Get the camera instance
   * @returns The camera instance
   */
  public getCamera(): BABYLON.ArcRotateCamera {
    return this.camera;
  }

  /**
   * Set fixed view mode
   * @param fixed - Whether to enable fixed view
   */
  public setFixedView(fixed: boolean): void {
    this.isFixedView = fixed;

    if (fixed) {
      // Reset to fixed view parameters
      this.camera.alpha = this.fixedViewConfig.alpha;
      this.camera.beta = this.fixedViewConfig.beta;
      this.camera.radius = this.fixedViewConfig.radius;
      this.camera.target = this.fixedViewConfig.target;
      this.camera.attachControl(this.canvas, false);
    } else {
      // Enable free navigation
      this.camera.attachControl(this.canvas, true);
    }

    // Update button text
    this.updateButtonText();

    logger.debug(`Camera view mode changed to: ${fixed ? 'fixed' : 'free'}`);
  }

  /**
   * Toggle between fixed and free view
   */
  public toggleView(): void {
    this.setFixedView(!this.isFixedView);
  }

  /**
   * Create the toggle button UI
   */
  private createToggleButton(): void {
    this.toggleButton = document.createElement("button");
    this.toggleButton.style.position = "absolute";
    this.toggleButton.style.bottom = "10px";
    this.toggleButton.style.right = "10px";
    this.toggleButton.style.zIndex = "100";
    this.toggleButton.style.padding = "10px";
    this.toggleButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    this.toggleButton.style.color = "white";
    this.toggleButton.style.border = "none";
    this.toggleButton.style.borderRadius = "5px";
    this.toggleButton.style.cursor = "pointer";

    this.updateButtonText();

    this.toggleButton.onclick = () => {
      this.toggleView();
    };

    document.body.appendChild(this.toggleButton);
  }

  /**
   * Update toggle button text
   */
  private updateButtonText(): void {
    if (this.toggleButton) {
      this.toggleButton.textContent = this.isFixedView 
        ? "Switch to Free View" 
        : "Return to Fixed View";
    }
  }

  /**
   * Get current camera position
   * @returns The camera position
   */
  public getPosition(): BABYLON.Vector3 {
    return this.camera.position;
  }

  /**
   * Set camera position
   * @param position - The new position
   */
  public setPosition(position: BABYLON.Vector3): void {
    this.camera.position = position;
  }

  /**
   * Enable vertical movement
   * @param deltaY - The vertical movement delta
   */
  public moveVertically(deltaY: number): void {
    if (!this.isFixedView) {
      this.camera.position.y += deltaY;
    }
  }

  /**
   * Dispose of the camera controller
   */
  public dispose(): void {
    if (this.toggleButton) {
      this.toggleButton.remove();
    }
    this.camera.dispose();
    logger.info('Camera controller disposed');
  }
} 