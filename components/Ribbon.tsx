import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { randomSpherePoint } from '../utils/generators';

const RibbonMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColor: new THREE.Color('#FFD700'), // Gold
    uPixelRatio: 1,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aSize;
    attribute float aPhase;
    
    varying float vAlpha;

    float cubicInOut(float t) {
      return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    void main() {
      float t = cubicInOut(uProgress);
      
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add subtle floating movement
      float speed = 1.0;
      pos.x += sin(uTime * speed + aPhase) * 0.05;
      pos.y += cos(uTime * speed * 0.8 + aPhase) * 0.05;
      pos.z += sin(uTime * speed * 0.5 + aPhase) * 0.05;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation - INCREASED multiplier for larger, brighter particles
      gl_PointSize = aSize * uPixelRatio * (50.0 / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Twinkle effect
      vAlpha = 0.6 + 0.4 * sin(uTime * 3.0 + aPhase * 10.0); 
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vAlpha;
    
    void main() {
       // Circular particle with soft glow
       vec2 center = gl_PointCoord - 0.5;
       float dist = length(center);
       if (dist > 0.5) discard;
       
       // Smooth gradient from center
       float strength = 1.0 - (dist * 2.0);
       strength = pow(strength, 2.0);
       
       // Boost brightness by multiplying alpha
       gl_FragColor = vec4(uColor, strength * vAlpha * 1.5);
       
       #include <tonemapping_fragment>
       #include <colorspace_fragment>
    }
  `
);

extend({ RibbonMaterial });

interface RibbonProps {
  progress: number;
}

const Ribbon: React.FC<RibbonProps> = ({ progress }) => {
  const materialRef = useRef<any>(null);
  const count = 2500; // Increased particle count for denser, brighter ribbon
  
  const pointsData = useMemo(() => {
    const treePositions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    const turns = 8.5;
    const height = 13; 
    const startY = -6.5; 
    const baseRadius = 7.2; 

    for (let i = 0; i < count; i++) {
      // 1. Calculate main spiral position
      const p = i / (count - 1); 
      
      const angle = p * Math.PI * 2 * turns;
      const yBase = startY + p * height;
      const rBase = baseRadius * (1 - p * 0.95); 

      // 2. Add "Scatter" / "Width" to the ribbon
      // REDUCED SPREAD: Tighter concentration for a cleaner ribbon look
      const spread = 0.05 + Math.random() * 0.15; 
      const randomAngle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * rBase + Math.cos(randomAngle) * spread;
      const y = yBase + (Math.random() - 0.5) * spread;
      const z = Math.sin(angle) * rBase + Math.sin(randomAngle) * spread;

      treePositions.set([x, y, z], i * 3);
      
      // 3. Scatter State position (random chaos)
      const sPos = randomSpherePoint(40);
      scatterPositions.set([sPos.x, sPos.y, sPos.z], i * 3);
      
      // 4. Attributes
      sizes[i] = Math.random() * 1.5 + 0.5; 
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { treePositions, scatterPositions, sizes, phases };
  }, [count]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
      materialRef.current.uProgress = THREE.MathUtils.lerp(
        materialRef.current.uProgress,
        progress,
        0.05
      );
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={pointsData.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={pointsData.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={pointsData.scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={pointsData.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={count}
          array={pointsData.phases}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <ribbonMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Ribbon;