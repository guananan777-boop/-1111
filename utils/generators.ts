import * as THREE from 'three';
import { DualPosition } from '../types';

// Tree Configuration
const TREE_HEIGHT = 14; // Slightly taller
const TREE_RADIUS_BASE = 6.5; // Wider base for grandeur
const SCATTER_RADIUS = 35; // Wider scatter

export const randomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to get a point on the "surface" of the tree at a given height and angle
// Used for ornament placement to ensure they sit on the boughs
const getTreeRadiusAtHeight = (y: number, angle: number): number => {
  const normalizedY = y / TREE_HEIGHT; // 0 to 1
  
  // Base cone shape (slightly curved for elegance)
  let r = TREE_RADIUS_BASE * Math.pow(1 - normalizedY, 0.9);
  
  // Add "Layers" or "Boughs" logic
  // We want the tree to have indentations, like a real spruce
  const layers = 8;
  const layerIndentation = 0.15; // Depth of layer cuts
  // Sawtooth-like wave for layers
  const layerPhase = normalizedY * layers * Math.PI * 2;
  const layerMod = Math.cos(layerPhase); 
  r *= (1.0 - layerIndentation * (0.5 + 0.5 * layerMod));

  return r;
};

export const randomConePoint = (height: number, radiusBase: number): THREE.Vector3 => {
  // We ignore passed height/radiusBase in favor of the global config for consistency
  // but we keep the signature compatible if needed.
  
  const y = Math.random() * TREE_HEIGHT;
  const angle = Math.random() * Math.PI * 2;
  
  // Max radius at this height (surface)
  const maxR = getTreeRadiusAtHeight(y, angle);
  
  // Volume distribution:
  // We want dense foliage at the surface, but also some inner volume.
  // Power 0.5 (sqrt) is uniform on disk. Power > 0.5 pushes to edge.
  const rRandom = Math.pow(Math.random(), 0.4); 
  const r = maxR * rRandom;

  return new THREE.Vector3(
    r * Math.cos(angle),
    y - TREE_HEIGHT / 2, 
    r * Math.sin(angle)
  );
};

export const generateOrnamentData = (count: number): DualPosition[] => {
  const data: DualPosition[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random position on the tree surface
    const y = Math.random() * TREE_HEIGHT;
    const angle = Math.random() * Math.PI * 2;
    
    // Ornaments sit closer to the surface
    const maxR = getTreeRadiusAtHeight(y, angle);
    const r = maxR * (0.8 + 0.2 * Math.random()); // 80% to 100% of radius

    const treePos = new THREE.Vector3(
      r * Math.cos(angle),
      y - TREE_HEIGHT / 2,
      r * Math.sin(angle)
    );

    data.push({
      tree: treePos,
      scatter: randomSpherePoint(SCATTER_RADIUS),
      scale: 0.5 + Math.random() * 0.5,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      speed: 0.5 + Math.random(),
      phase: Math.random() * Math.PI * 2,
    });
  }
  return data;
};
