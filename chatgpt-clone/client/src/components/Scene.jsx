import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';

function FloatingGeometry() {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4);
    meshRef.current.rotation.y = Math.sin(time / 2);
    
    // Parallax effect tied to mouse
    meshRef.current.position.x = (state.pointer.x * state.viewport.width) * 0.02;
    meshRef.current.position.y = (state.pointer.y * state.viewport.height) * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[0, 0, -2]}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          wireframe 
          emissive="#1d4ed8" 
          emissiveIntensity={0.8} 
          transparent
          opacity={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        
        <FloatingGeometry />
        
        <Sparkles count={200} scale={14} size={1.5} speed={0.4} opacity={0.6} color="#60a5fa" />
        <Sparkles count={100} scale={10} size={2.5} speed={0.2} opacity={0.4} color="#c084fc" />
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
