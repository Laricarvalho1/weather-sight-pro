import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function GlobeElements() {
  const globeRef = useRef();

  // Load our single, lightweight continent texture
  const [continentTexture] = useTexture(['/textures/continents.png']);

  // Animate the rotation on every frame
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() / 10;
    }
  });

  return (
    <>
      {/* Starfield background */}
      <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade={true} />

      
      {/* Main Globe Mesh */}
      <mesh ref={globeRef} >
        <sphereGeometry args={[1, 32, 32]} />
        {/* MeshToonMaterial creates the cel-shaded, cartoon look.
          - The 'color' property sets the base color (our ocean blue).
          - The 'map' property overlays our continent texture on top.
        */}
        <meshToonMaterial 
          map={continentTexture} 
          color="#5a9dcd" 
          transparent={true} // The texture has transparency
        />
      </mesh>
    </>
  );
}

const GlobeAnimation = () => {
  return (
    <div className="w-64 h-64 md:w-80 md:h-80 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        {/* We use a point light to create the distinct shadow of the toon shader */}
        <pointLight color="white" position={[2, 2, 5]} intensity={80} />
        <ambientLight intensity={0.7} />
        
        <Suspense fallback={null}>
          <GlobeElements />
        </Suspense>

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default GlobeAnimation;