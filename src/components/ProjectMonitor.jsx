import React, { useState, useRef } from 'react';
import { ToonObject } from './Room';
import { Color } from 'three';
import { useFrame } from '@react-three/fiber';

const ProjectMonitor = ({ position = [0, 0, 0], onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const monitorRef = useRef();
  const floatOffset = useRef(0);

  // Floating animation
  useFrame((state) => {
    if (monitorRef.current) {
      // Gentle floating motion
      floatOffset.current = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      monitorRef.current.position.y = position[1] + floatOffset.current;
      
      // Subtle rotation when floating
      monitorRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group 
      ref={monitorRef}
      position={[position[0], position[1] + 0.5, position[2]]} // Raised position
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Monitor Screen */}
      <ToonObject
        geometry={<boxGeometry args={[2.5, 1.8, 0.1]} />}
        position={[0, 0, 0]}
        color={new Color(0.1, 0.1, 0.1)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Screen Content */}
      <ToonObject
        geometry={<boxGeometry args={[2.4, 1.7, 0.01]} />}
        position={[0, 0, 0.06]}
        color={new Color(0.2, 0.2, 0.25)}
        outlineWidth={0.01}
        materialType="plastic"
      />

      {/* Monitor Stand */}
      <ToonObject
        geometry={<boxGeometry args={[0.4, 0.8, 0.2]} />}
        position={[0, -1.3, 0]}
        color={new Color(0.2, 0.2, 0.2)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Monitor Base */}
      <ToonObject
        geometry={<boxGeometry args={[1.2, 0.1, 0.8]} />}
        position={[0, -1.7, 0]}
        color={new Color(0.2, 0.2, 0.2)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Decorative Elements */}
      {/* Screen Border */}
      <ToonObject
        geometry={<boxGeometry args={[2.6, 1.9, 0.05]} />}
        position={[0, 0, -0.03]}
        color={new Color(0.3, 0.3, 0.35)}
        outlineWidth={0.01}
        materialType="metal"
      />

      {/* Bottom Accent */}
      <ToonObject
        geometry={<boxGeometry args={[2.6, 0.1, 0.15]} />}
        position={[0, -0.9, 0]}
        color={new Color(0.3, 0.3, 0.35)}
        outlineWidth={0.01}
        materialType="metal"
      />

      {/* Hover Effect */}
      {isHovered && (
        <ToonObject
          geometry={<boxGeometry args={[2.7, 2, 0.02]} />}
          position={[0, 0, 0.11]}
          color={new Color(0.4, 0.4, 0.5)}
          outlineWidth={0.01}
          materialType="plastic"
        />
      )}

      {/* Glow Effect when hovered */}
      {isHovered && (
        <ToonObject
          geometry={<boxGeometry args={[2.8, 2.1, 0.01]} />}
          position={[0, 0, 0.12]}
          color={new Color(0.5, 0.5, 0.6)}
          outlineWidth={0.01}
          materialType="plastic"
        />
      )}
    </group>
  );
};

export default ProjectMonitor; 