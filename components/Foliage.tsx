import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { randomConePoint, randomSpherePoint } from '../utils/generators';

const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0, // 0 = Scattered, 1 = Tree
    uColorGreen: new THREE.Color('#022D18'),
    uColorGold: new THREE.Color('#D4AF37'),
    uPixelRatio: 1,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying float vY; // Pass height to fragment
    
    float cubicInOut(float t) {
      return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    void main() {
      float t = cubicInOut(uProgress);
      
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Animation
      float movementScale = mix(2.0, 0.1, t);
      float speed = mix(0.5, 2.0, t);
      
      pos.x += sin(uTime * speed + aRandom * 10.0) * movementScale * 0.1;
      pos.y += cos(uTime * speed * 0.8 + aRandom * 20.0) * movementScale * 0.1;
      pos.z += sin(uTime * speed * 0.5 + aRandom * 5.0) * movementScale * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      gl_PointSize = (mix(60.0, 35.0, t) * aRandom + 10.0) * uPixelRatio * (1.0 / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Pass normalized height (assuming tree is roughly -6 to +6)
      vY = (aTreePos.y + 6.0) / 12.0; 
      
      // Calculate Gold Sparkle
      float sparkle = sin(uTime * 3.0 + aRandom * 100.0);
      float goldMix = smoothstep(0.9, 1.0, sparkle);
      
      // Base color logic will be handled in fragment
      vColor = vec3(goldMix); // Pass just the mix factor
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorGreen;
    uniform vec3 uColorGold;
    varying vec3 vColor;
    varying float vY;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0); // Sharper falloff
      
      // Gradient: Darker green at bottom, Lighter/Gold at top
      vec3 bottomGreen = uColorGreen * 0.8; // Darker
      vec3 topGreen = uColorGreen * 1.5; // Lighter
      
      // Mix green based on height
      vec3 baseColor = mix(bottomGreen, topGreen, clamp(vY, 0.0, 1.0));
      
      // Add gold sparkles from varying
      float goldFactor = vColor.r;
      vec3 finalColor = mix(baseColor, uColorGold * 1.5, goldFactor);
      
      gl_FragColor = vec4(finalColor, strength * 0.95);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

import { extend } from '@react-three/fiber';
extend({ FoliageMaterial });

interface FoliageProps {
  count?: number;
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ count = 5000, progress }) => {
  const materialRef = useRef<any>(null);
  
  const pointsData = useMemo(() => {
    // Increased particle density for fuller look
    const realCount = Math.floor(count * 1.2); 
    const treePositions = new Float32Array(realCount * 3);
    const scatterPositions = new Float32Array(realCount * 3);
    const randoms = new Float32Array(realCount);

    for (let i = 0; i < realCount; i++) {
      // Params are ignored by new generator logic but kept for sig
      const treeP = randomConePoint(12, 5); 
      const scatterP = randomSpherePoint(30);

      treePositions.set([treeP.x, treeP.y, treeP.z], i * 3);
      scatterPositions.set([scatterP.x, scatterP.y, scatterP.z], i * 3);
      randoms[i] = Math.random();
    }

    return { treePositions, scatterPositions, randoms, count: realCount };
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
          count={pointsData.count}
          array={pointsData.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={pointsData.count}
          array={pointsData.treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={pointsData.count}
          array={pointsData.scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={pointsData.count}
          array={pointsData.randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <foliageMaterial 
        ref={materialRef} 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
