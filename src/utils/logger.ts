/**
 * Simple logger utility for the application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO;

  /**
   * Set the minimum log level
   * @param level - The minimum level to log
   */
  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Log debug message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  public debug(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log info message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  public info(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...data);
    }
  }

  /**
   * Log warning message
   * @param message - The message to log
   * @param data - Optional data to log
   */
  public warn(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  }

  /**
   * Log error message
   * @param message - The message to log
   * @param error - Optional error object
   */
  public error(message: string, error?: any): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error);
    }
  }
}

// Export singleton instance
export const logger = new Logger(); 