/**
 * UI controls and instruction display
 */

import { logger } from '../utils/logger';

export interface UIInstruction {
  text: string;
  top: number;
  updateText?: (state: boolean) => string;
}

export class UIControls {
  private instructions: Map<string, HTMLDivElement> = new Map();

  /**
   * Create UI controls manager
   */
  constructor() {
    logger.info('UI controls initialized');
  }

  /**
   * Add an instruction element to the UI
   * @param id - Unique identifier for the instruction
   * @param instruction - Instruction configuration
   */
  public addInstruction(id: string, instruction: UIInstruction): void {
    // Remove existing instruction if present
    this.removeInstruction(id);

    // Create new instruction element
    const element = document.createElement("div");
    element.textContent = instruction.text;
    element.style.position = "absolute";
    element.style.top = `${instruction.top}px`;
    element.style.left = "10px";
    element.style.zIndex = "100";
    element.style.padding = "10px";
    element.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    element.style.color = "white";
    element.style.border = "none";
    element.style.borderRadius = "5px";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.fontSize = "14px";

    // Store element with its config
    this.instructions.set(id, element);
    
    // Store update function if provided
    if (instruction.updateText) {
      (element as any).updateText = instruction.updateText;
    }

    document.body.appendChild(element);
    
    logger.debug(`UI instruction added: ${id}`);
  }

  /**
   * Update instruction text
   * @param id - Instruction identifier
   * @param state - State to pass to update function
   */
  public updateInstruction(id: string, state: boolean): void {
    const element = this.instructions.get(id);
    
    if (element && (element as any).updateText) {
      element.textContent = (element as any).updateText(state);
    }
  }

  /**
   * Update instruction text directly
   * @param id - Instruction identifier
   * @param text - New text content
   */
  public setInstructionText(id: string, text: string): void {
    const element = this.instructions.get(id);
    
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Remove an instruction from the UI
   * @param id - Instruction identifier
   */
  public removeInstruction(id: string): void {
    const element = this.instructions.get(id);
    
    if (element) {
      element.remove();
      this.instructions.delete(id);
      logger.debug(`UI instruction removed: ${id}`);
    }
  }

  /**
   * Show all instructions
   */
  public showAll(): void {
    this.instructions.forEach(element => {
      element.style.display = "block";
    });
  }

  /**
   * Hide all instructions
   */
  public hideAll(): void {
    this.instructions.forEach(element => {
      element.style.display = "none";
    });
  }

  /**
   * Create a loading indicator
   * @param message - Loading message
   * @returns Function to remove the loading indicator
   */
  public showLoading(message: string = "Loading..."): () => void {
    const loadingDiv = document.createElement("div");
    loadingDiv.textContent = message;
    loadingDiv.style.position = "fixed";
    loadingDiv.style.top = "50%";
    loadingDiv.style.left = "50%";
    loadingDiv.style.transform = "translate(-50%, -50%)";
    loadingDiv.style.padding = "20px";
    loadingDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingDiv.style.color = "white";
    loadingDiv.style.borderRadius = "10px";
    loadingDiv.style.fontSize = "18px";
    loadingDiv.style.zIndex = "1000";

    document.body.appendChild(loadingDiv);

    return () => {
      loadingDiv.remove();
    };
  }

  /**
   * Show an error message
   * @param message - Error message
   * @param duration - Duration in milliseconds (0 = permanent)
   */
  public showError(message: string, duration: number = 5000): void {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = message;
    errorDiv.style.position = "fixed";
    errorDiv.style.bottom = "20px";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translateX(-50%)";
    errorDiv.style.padding = "15px 30px";
    errorDiv.style.backgroundColor = "rgba(200, 0, 0, 0.9)";
    errorDiv.style.color = "white";
    errorDiv.style.borderRadius = "5px";
    errorDiv.style.fontSize = "16px";
    errorDiv.style.zIndex = "1000";

    document.body.appendChild(errorDiv);

    if (duration > 0) {
      setTimeout(() => {
        errorDiv.remove();
      }, duration);
    }
  }

  /**
   * Dispose of all UI elements
   */
  public dispose(): void {
    this.instructions.forEach(element => {
      element.remove();
    });
    this.instructions.clear();
    
    logger.info('UI controls disposed');
  }
} 