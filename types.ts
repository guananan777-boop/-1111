import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  tree: THREE.Vector3;
  scatter: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
  speed: number; // For floating animation
  phase: number; // Random offset for animation
}

export interface OrnamentData {
  id: number;
  type: 'box' | 'bauble';
  positionData: DualPosition;
  color: THREE.Color;
}