import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Componente da Esfera da Terra
function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  // Carrega as texturas
  const [colorMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/world-top-view.jpg', // Caminho para a textura da Terra na pasta 'public'
    '/textures/cloud_combined.png',    // Caminho para a textura das nuvens
  ]);

  // Hook `useFrame` para animar a rotação a cada frame
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    earthRef.current.rotation.y = elapsedTime / 6; // Rotação mais lenta da Terra
    cloudsRef.current.rotation.y = elapsedTime / 5; // Nuvens giram um pouco mais rápido
  });

  return (
    <>
      {/* Luz ambiente para iluminar a cena toda */}
      <ambientLight intensity={0.5} />
      {/* Luz direcional, como o Sol */}
      <directionalLight color="white" position={[2, 0, 5]} intensity={1.5} />
      
      {/* Fundo de estrelas */}
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade={true} />

      {/* Mesh para as Nuvens */}
      <mesh ref={cloudsRef} scale={[1.005, 1.005, 1.005]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          map={cloudsMap}
          opacity={0.4}
          depthWrite={true}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mesh para a Terra */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={colorMap} metalness={0.4} roughness={0.7} />
      </mesh>
    </>
  );
}

// Componente principal do Globo que será exportado
export function Globe() {
  return (
    // O Canvas é onde a cena 3D é renderizada
    <div style={{ width: '100%', height: '100%' }}>
        <Canvas>
            <React.Suspense fallback={null}>
                <Earth />
                {/* Controles para o usuário girar, dar zoom, etc. com o mouse */}
                <OrbitControls enableZoom={true} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} />
            </React.Suspense>
        </Canvas>
    </div>
  );
}