import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { DualPosition } from '../types';
import { generateOrnamentData } from '../utils/generators';

interface OrnamentGroupProps {
  count: number;
  type: 'box' | 'sphere';
  progress: number;
  color: string;
  metalness: number;
  roughness: number;
  scaleMultiplier: number;
}

const OrnamentGroup: React.FC<OrnamentGroupProps> = ({ 
  count, type, progress, color, metalness, roughness, scaleMultiplier 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  
  const data = useMemo<DualPosition[]>(() => generateOrnamentData(count), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Reuse vector for calculations to reduce GC
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  
  // Smoothed progress state for this specific component
  const currentProgress = useRef(0);

  useLayoutEffect(() => {
    // Initial setup
    if(meshRef.current && glowRef.current) {
        data.forEach((d, i) => {
            // Main Mesh Scale
            dummy.scale.setScalar(d.scale * scaleMultiplier);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
            
            // Glow Mesh Scale (Slightly larger)
            dummy.scale.setScalar(d.scale * scaleMultiplier * 1.4);
            dummy.updateMatrix();
            glowRef.current?.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        glowRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, scaleMultiplier, dummy]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    // Smooth transition logic
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, progress, 0.04);
    const t = currentProgress.current;
    
    // Easing for position
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const d = data[i];
      
      // Calculate position
      tempVec.lerpVectors(d.scatter, d.tree, easeT);
      
      // Add floating noise
      const floatAmp = (1 - easeT) * 2.0 + 0.1; 
      const floatFreq = d.speed;
      
      tempVec.y += Math.sin(time * floatFreq + d.phase) * floatAmp * 0.2;
      tempVec.x += Math.cos(time * floatFreq * 0.5 + d.phase) * floatAmp * 0.1;
      
      dummy.position.copy(tempVec);
      
      // Rotation
      dummy.rotation.set(
        d.rotation.x + time * 0.2,
        d.rotation.y + time * 0.1,
        d.rotation.z
      );
      
      // 1. Update Main Mesh
      const scaleEffect = d.scale * scaleMultiplier;
      dummy.scale.setScalar(scaleEffect);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // 2. Update Glow Mesh (Uses same position/rotation, but larger scale)
      // Note: Rotation on a sphere glow is irrelevant, but we keep it for box glows
      dummy.scale.setScalar(scaleEffect * 1.3); // 30% larger halo
      dummy.updateMatrix();
      glowRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
        {/* Core Physical Object */}
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
            {type === 'box' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[0.6, 16, 16]} />}
            <meshStandardMaterial 
                color={color} 
                roughness={roughness} 
                metalness={metalness}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </instancedMesh>

        {/* Halo / Glow Layer */}
        <instancedMesh ref={glowRef} args={[undefined, undefined, count]}>
             {type === 'box' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[0.6, 16, 16]} />}
             <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.1} 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
             />
        </instancedMesh>
    </group>
  );
};

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  return (
    <group>
      {/* Heavy Gifts: Gold/Red/Green Boxes */}
      <OrnamentGroup 
        count={100} // Increased from 80
        type="box" 
        progress={progress} 
        color="#8B0000" // Deep Red
        metalness={0.4} 
        roughness={0.4} 
        scaleMultiplier={0.9} // Large
      />
      
      <OrnamentGroup 
        count={100} // Increased from 80
        type="box" 
        progress={progress} 
        color="#D4AF37" // Gold
        metalness={0.8} 
        roughness={0.2} 
        scaleMultiplier={0.7} // Medium-Large
      />

      {/* Light Baubles: Gold/Silver Spheres */}
      <OrnamentGroup 
        count={450} // Increased from 300
        type="sphere" 
        progress={progress} 
        color="#F5E080" // Light Gold
        metalness={0.95} 
        roughness={0.1} 
        scaleMultiplier={0.5} // Medium
      />
      
       <OrnamentGroup 
        count={350} // Increased from 200
        type="sphere" 
        progress={progress} 
        color="#ffffff" // Silver/Pearl
        metalness={0.9} 
        roughness={0.2} 
        scaleMultiplier={0.25} // Small
      />

      {/* Extra Tiny Filler Ornaments for density */}
       <OrnamentGroup 
        count={200} 
        type="sphere" 
        progress={progress} 
        color="#FFD700" // Deep Gold
        metalness={1.0} 
        roughness={0.1} 
        scaleMultiplier={0.15} // Tiny
      />
    </group>
  );
};

export default Ornaments;