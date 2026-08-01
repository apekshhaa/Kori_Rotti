import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

export function CoinModel() {
  const groupRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(0);
  
  // Load the GLB model with memoization
  const { scene } = useGLTF('/round logo sign 3d model.glb');
  
  // Clone scene to avoid reference issues
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  useEffect(() => {
    if (scene) {
      setLoaded(true);
      // Smooth fade-in animation using requestAnimationFrame for performance
      let animationFrameId;
      const animateFade = () => {
        setFadeIn((prev) => {
          if (prev >= 1) {
            return 1;
          }
          animationFrameId = requestAnimationFrame(animateFade);
          return Math.min(prev + 0.02, 1);
        });
      };
      animationFrameId = requestAnimationFrame(animateFade);
      
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Smooth rotation around Y axis
    groupRef.current.rotation.y = time * 0.5 * fadeIn;
    
    // Subtle floating animation using sine wave
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.15 * fadeIn;
    
    // Very slight tilt for natural rotation feel (2-3 degrees)
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(2.5) * fadeIn;
    groupRef.current.rotation.z = THREE.MathUtils.degToRad(1.5) * fadeIn;
  });

  if (!loaded) {
    return (
      <Html center>
        <div className="text-[#b50063] text-sm font-semibold">Loading model...</div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={clonedScene} 
        scale={fadeIn * 2.5}
      />
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload('/round logo sign 3d model.glb');
