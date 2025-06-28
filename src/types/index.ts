/**
 * Type definitions for the Babylon.js Windmill project
 */

import * as BABYLON from '@babylonjs/core';

/**
 * Configuration for windmill model
 */
export interface WindmillConfig {
  position: BABYLON.Vector3;
  scale: number;
  rotationSpeed: number;
}

/**
 * Configuration for hexagonal terrain
 */
export interface TerrainConfig {
  hexSize: number;
  hexHeight: number;
  coordinates: Array<[number, number]>;
}

/**
 * Camera view configuration
 */
export interface CameraConfig {
  target: BABYLON.Vector3;
  alpha: number;
  beta: number;
  radius: number;
  lowerRadiusLimit: number;
  upperRadiusLimit: number;
  wheelPrecision: number;
  pinchPrecision: number;
  panningSensibility: number;
  inertia: number;
}

/**
 * Tracks the state of vertical movement keys
 */
export interface VerticalKeys {
  [key: number]: boolean;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  loopMode: number;
} 