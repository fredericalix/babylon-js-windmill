/**
 * Hexagonal grid calculation utilities
 * Based on axial coordinate system
 * @see https://www.redblobgames.com/grids/hexagons/
 */

import * as BABYLON from '@babylonjs/core';

/**
 * Calculates the position of a hexagon in a hexagonal grid
 * @param q - The column coordinate in axial system
 * @param r - The row coordinate in axial system
 * @param size - The size of each hexagon
 * @param height - The vertical offset from ground
 * @returns The 3D position vector for the hexagon
 */
export function getHexPosition(
  q: number, 
  r: number, 
  size: number, 
  height: number
): BABYLON.Vector3 {
  // For a pointy-top hexagon layout:
  const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const z = size * (3 / 2 * r);
  return new BABYLON.Vector3(x, height, z);
}

/**
 * Default hexagonal grid coordinates for the island
 * Format: [q, r] in axial coordinates
 * (0,0) is the center tile
 */
export const DEFAULT_HEX_COORDINATES: Array<[number, number]> = [
  // Center ring
  [0, 0],   // Center tile
  [1, 0],   // East
  [0, 1],   // Southeast
  [-1, 1],  // Southwest
  [-1, 0],  // West
  [0, -1],  // Northwest
  [1, -1],  // Northeast
  
  // Outer ring
  [2, 0],   // Far East
  [2, -1],  // East-Northeast
  [2, -2],  // Northeast-Northeast
  [1, -2],  // Far Northeast
  [0, -2],  // Far Northwest
  [-1, -1], // Northwest-Northwest
  [-2, 0],  // Far West
  [-2, 1],  // West-Southwest
  [-2, 2],  // Southwest-Southwest
  [-1, 2],  // Far Southwest
  [0, 2],   // Far Southeast
  [1, 1]    // Southeast-Southeast
];

/**
 * Calculate distance between two hexagons
 * @param q1 - Q coordinate of first hexagon
 * @param r1 - R coordinate of first hexagon
 * @param q2 - Q coordinate of second hexagon
 * @param r2 - R coordinate of second hexagon
 * @returns Distance in hexagon steps
 */
export function hexDistance(
  q1: number, 
  r1: number, 
  q2: number, 
  r2: number
): number {
  return (Math.abs(q1 - q2) + 
          Math.abs(q1 + r1 - q2 - r2) + 
          Math.abs(r1 - r2)) / 2;
}

/**
 * Get neighboring hexagon coordinates
 * @param q - Q coordinate
 * @param r - R coordinate
 * @returns Array of neighboring coordinates
 */
export function getHexNeighbors(
  q: number, 
  r: number
): Array<[number, number]> {
  return [
    [q + 1, r],      // East
    [q + 1, r - 1],  // Northeast
    [q, r - 1],      // Northwest
    [q - 1, r],      // West
    [q - 1, r + 1],  // Southwest
    [q, r + 1]       // Southeast
  ];
} 