import React from 'react';
import { useFrame } from '@react-three/fiber';

export const CityLoadingState = () => {
  const ref = React.useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Loading indicator */}
      <mesh ref={ref} position={[0, 0, -50]}>
        <torusGeometry args={[10, 1, 16, 32]} />
        <meshStandardMaterial color="#2196f3" emissive="#2196f3" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Placeholder buildings */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[i * 10 - 20, -20, -50]}>
          <boxGeometry args={[5, 20 + i * 5, 5]} />
          <meshStandardMaterial 
            color="#424242" 
            emissive="#424242"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}; 