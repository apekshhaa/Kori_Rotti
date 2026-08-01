import { Canvas } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import { CoinModel } from './CoinModel';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

function GlowingHalo() {
  // Memoize geometry to prevent recreation
  const geometry = useMemo(() => new THREE.CircleGeometry(1.8, 32), []);
  
  return (
    <mesh position={[0, -0.5, -0.5]} geometry={geometry}>
      <meshBasicMaterial 
        color="#b50063" 
        transparent 
        opacity={0.15}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Scene() {
  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]} // Lower DPR for better mobile performance (60 FPS target)
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false, // Disable stencil for performance
          depth: true
        }}
        camera={{ 
          position: [0, 0, 5], 
          fov: 45,
          near: 0.1,
          far: 100
        }}
        performance={{ min: 0.5 }} // Allow downscaling for performance
      >
        {/* Premium lighting setup */}
        <ambientLight intensity={0.6} color="#ffffff" />
        
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={512} // Reduced shadow resolution for performance
          shadow-mapSize-height={512}
          shadow-camera-far={15}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        
        {/* Rim light for premium edge definition */}
        <directionalLight
          position={[-5, 2, -5]}
          intensity={0.8}
          color="#ffb0c9"
        />
        
        {/* Fill light for soft shadows */}
        <pointLight
          position={[0, -5, 0]}
          intensity={0.3}
          color="#ffffff"
        />

        {/* Additional hemisphere light for natural ambient lighting */}
        <hemisphereLight
          args={['#ffffff', '#e3e1ec', 0.3]}
          position={[0, 10, 0]}
        />

        {/* Soft contact shadows */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={5}
          resolution={128} // Reduced resolution for performance
          color="#b50063"
        />

        {/* Glowing halo behind the coin */}
        <GlowingHalo />

        {/* Coin model with float wrapper */}
        <Float
          speed={2}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <Suspense fallback={null}>
            <CoinModel />
          </Suspense>
        </Float>
      </Canvas>
    </div>
  );
}
