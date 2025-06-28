/**
 * Keyboard controls and input handling
 */

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { VerticalKeys } from '../types';
import { logger } from '../utils/logger';

export type KeyHandler = () => void;

export class KeyboardControls {
  private scene: BABYLON.Scene;
  private verticalKeys: VerticalKeys = {};
  private keyHandlers: Map<number, KeyHandler> = new Map();

  /**
   * Initialize keyboard controls
   * @param scene - The Babylon.js scene
   */
  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    
    if (!scene.actionManager) {
      scene.actionManager = new BABYLON.ActionManager(scene);
    }
    
    logger.info('Keyboard controls initialized');
  }

  /**
   * Register vertical movement keys (Space and Shift)
   */
  public registerVerticalMovement(): void {
    // Space key (32) for up
    this.registerKeyPress(32, () => {
      this.verticalKeys[32] = true;
    });
    
    this.registerKeyRelease(32, () => {
      this.verticalKeys[32] = false;
    });
    
    // Shift key (16) for down
    this.registerKeyPress(16, () => {
      this.verticalKeys[16] = true;
    });
    
    this.registerKeyRelease(16, () => {
      this.verticalKeys[16] = false;
    });
    
    logger.debug('Vertical movement keys registered');
  }

  /**
   * Register a key press handler
   * @param keyCode - The key code
   * @param handler - The handler function
   */
  public registerKey(keyCode: number, handler: KeyHandler): void {
    this.keyHandlers.set(keyCode, handler);
    
    this.scene.actionManager?.registerAction(
      new BABYLON.ExecuteCodeAction(
        { 
          trigger: BABYLON.ActionManager.OnKeyDownTrigger, 
          parameter: keyCode 
        },
        handler
      )
    );
    
    logger.debug(`Key registered: ${keyCode}`);
  }

  /**
   * Register key press action
   * @param keyCode - The key code
   * @param handler - The handler function
   */
  private registerKeyPress(keyCode: number, handler: () => void): void {
    this.scene.actionManager?.registerAction(
      new BABYLON.ExecuteCodeAction(
        { 
          trigger: BABYLON.ActionManager.OnKeyDownTrigger, 
          parameter: keyCode 
        },
        handler
      )
    );
  }

  /**
   * Register key release action
   * @param keyCode - The key code
   * @param handler - The handler function
   */
  private registerKeyRelease(keyCode: number, handler: () => void): void {
    this.scene.actionManager?.registerAction(
      new BABYLON.ExecuteCodeAction(
        { 
          trigger: BABYLON.ActionManager.OnKeyUpTrigger, 
          parameter: keyCode 
        },
        handler
      )
    );
  }

  /**
   * Check if a vertical key is pressed
   * @param keyCode - The key code to check
   * @returns Whether the key is pressed
   */
  public isVerticalKeyPressed(keyCode: number): boolean {
    return this.verticalKeys[keyCode] || false;
  }

  /**
   * Get vertical movement delta
   * @param speed - Movement speed
   * @returns The vertical movement delta
   */
  public getVerticalDelta(speed: number = 0.1): number {
    let delta = 0;
    
    if (this.verticalKeys[32]) { // Space - up
      delta += speed;
    }
    
    if (this.verticalKeys[16]) { // Shift - down
      delta -= speed;
    }
    
    return delta;
  }

  /**
   * Clear all key states
   */
  public clearKeys(): void {
    Object.keys(this.verticalKeys).forEach(key => {
      this.verticalKeys[parseInt(key)] = false;
    });
  }

  /**
   * Dispose of keyboard controls
   */
  public dispose(): void {
    this.clearKeys();
    this.keyHandlers.clear();
    logger.info('Keyboard controls disposed');
  }
} 