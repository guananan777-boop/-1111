import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { randomSpherePoint } from '../utils/generators';

interface TopStarProps {
  progress: number;
}

const createStarShape = (outerRadius: number, innerRadius: number) => {
  const shape = new THREE.Shape();
  const points = 5;
  // Start from top point
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    // Angle offset to point straight up
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

const TopStar: React.FC<TopStarProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Tree top position (Moved up from 7.5 to 8.0)
  const treePos = useMemo(() => new THREE.Vector3(0, 8.0, 0), []);
  const scatterPos = useMemo(() => randomSpherePoint(30), []);
  
  // Current interpolated position
  const currentPos = useRef(new THREE.Vector3());

  const starShape = useMemo(() => createStarShape(1.2, 0.5), []);
  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  }), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Interpolate position
    const t = progress; 
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    currentPos.current.lerpVectors(scatterPos, treePos, easeT);
    meshRef.current.position.copy(currentPos.current);
    
    // Rotate Star
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;

    // Scale effect
    const scale = easeT * 1.0 + 0.1; // Small when scattered
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={meshRef}>
      {/* Physical Star Shape (Extruded 5-point star) - Pure Gold */}
      <Center>
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[starShape, extrudeSettings]} />
          <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={1.0}
          />
        </mesh>
      </Center>
      
      {/* Light Source from Star */}
      <pointLight color="#FFD700" intensity={progress * 2.5} distance={20} decay={2} />
    </group>
  );
};

export default TopStar;