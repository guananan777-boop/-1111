import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import TopStar from './TopStar';
import Ribbon from './Ribbon';
import { TreeState } from '../types';

interface ExperienceProps {
  treeState: TreeState;
}

const Rig = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(groupRef.current) {
            // Majestic slow rotation
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
        }
    });
    return <group ref={groupRef} />;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const progress = treeState === TreeState.TREE_SHAPE ? 1 : 0;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping,
        toneMappingExposure: 1.5,
        powerPreference: "high-performance" 
      }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.7}
        minDistance={15}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting: Cinematic & Luxurious */}
      <ambientLight intensity={0.15} color="#001a0f" />
      
      {/* Key Light (Warm Gold) */}
      <spotLight 
        position={[15, 25, 15]} 
        angle={0.4} 
        penumbra={1} 
        intensity={2.5} 
        color="#ffd700" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light (Cool Teal/Green) to contrast gold */}
      <pointLight position={[-15, 10, -15]} intensity={1.5} color="#00ffcc" />
      
      {/* Uplight for drama */}
      <pointLight position={[0, -15, 0]} intensity={1} color="#D4AF37" />

      {/* Environment Reflections */}
      <Environment preset="night" background={false} blur={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Main Content Group */}
      {/* Moved up from -5 to -1 to better center the tree */}
      <group position={[0, -1, 0]}>
        {/* Dynamic Rotation Helper */}
        <Rig />
        
        {/* The Tree Topper */}
        <TopStar progress={progress} />

        {/* The Light Ribbon */}
        <Ribbon progress={progress} />

        {/* The Foliage (Particles) */}
        <Foliage count={12000} progress={progress} />

        {/* The Ornaments (Instanced Meshes) */}
        <Ornaments progress={progress} />
        
        {/* Extra Magic: Ambient Sparkles */}
        <Sparkles 
            count={300} 
            scale={30} 
            size={5} 
            speed={0.3} 
            opacity={0.6} 
            color="#FFFDD0"
        />
      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.85} 
            mipmapBlur 
            intensity={1.8} 
            radius={0.5}
        />
        <ToneMapping mode={ToneMappingMode.REINHARD2_ADAPTIVE} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;