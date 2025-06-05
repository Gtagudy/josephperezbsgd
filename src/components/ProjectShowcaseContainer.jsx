import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { ToonObject } from './Room';
import { Color } from 'three';

const ProjectShowcaseContainer = ({ 
  isVisible = false,
  onSectionClick,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  handleProjectClick
}) => {
  const containerRef = useRef();
  const sectionsRef = useRef({
    games: useRef(),
    software: useRef(),
    others: useRef()
  });

  // Animation states
  const targetPosition = useRef([...position]);
  const targetRotation = useRef([...rotation]);
  const currentPosition = useRef([...position]);
  const currentRotation = useRef([...rotation]);

  // Smooth animation
  useFrame((state, delta) => {
    if (containerRef.current) {
      // Smooth position transition
      currentPosition.current = currentPosition.current.map((pos, i) => {
        return pos + (targetPosition.current[i] - pos) * delta * 2;
      });
      containerRef.current.position.set(...currentPosition.current);

      // Smooth rotation transition
      currentRotation.current = currentRotation.current.map((rot, i) => {
        return rot + (targetRotation.current[i] - rot) * delta * 2;
      });
      containerRef.current.rotation.set(...currentRotation.current);
    }
  });

  // Section colors
  const sectionColors = {
    games: new Color(0.2, 0.4, 0.6),      // Blue-ish
    software: new Color(0.4, 0.6, 0.2),   // Green-ish
    others: new Color(0.6, 0.2, 0.4)      // Purple-ish
  };

  return (
    <group ref={containerRef} position={position} rotation={rotation}>
      {/* Main Container Background */}
      <ToonObject
        geometry={<boxGeometry args={[12, 8, 0.5]} />}
        position={[0, 0, -0.25]}
        color={new Color(0.15, 0.15, 0.15)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Section Containers */}
      <group position={[-4, 0, 0]}>
        {/* Games Section */}
        <ToonObject
          ref={sectionsRef.current.games}
          geometry={<boxGeometry args={[3.5, 7, 0.1]} />}
          position={[0, 0, 0]}
          color={sectionColors.games}
          outlineWidth={0.02}
          materialType="plastic"
          onClick={() => handleProjectClick && handleProjectClick('games', position)}
        />
        <ToonObject
          geometry={<boxGeometry args={[3.5, 0.5, 0.15]} />}
          position={[0, 3.5, 0.05]}
          color={sectionColors.games}
          outlineWidth={0.01}
          materialType="metal"
        />
      </group>

      <group position={[0, 0, 0]}>
        {/* Software/Web Section */}
        <ToonObject
          ref={sectionsRef.current.software}
          geometry={<boxGeometry args={[3.5, 7, 0.1]} />}
          position={[0, 0, 0]}
          color={sectionColors.software}
          outlineWidth={0.02}
          materialType="plastic"
          onClick={() => handleProjectClick && handleProjectClick('software', position)}
        />
        <ToonObject
          geometry={<boxGeometry args={[3.5, 0.5, 0.15]} />}
          position={[0, 3.5, 0.05]}
          color={sectionColors.software}
          outlineWidth={0.01}
          materialType="metal"
        />
      </group>

      <group position={[4, 0, 0]}>
        {/* Others Section */}
        <ToonObject
          ref={sectionsRef.current.others}
          geometry={<boxGeometry args={[3.5, 7, 0.1]} />}
          position={[0, 0, 0]}
          color={sectionColors.others}
          outlineWidth={0.02}
          materialType="plastic"
          onClick={() => handleProjectClick && handleProjectClick('others', position)}
        />
        <ToonObject
          geometry={<boxGeometry args={[3.5, 0.5, 0.15]} />}
          position={[0, 3.5, 0.05]}
          color={sectionColors.others}
          outlineWidth={0.01}
          materialType="metal"
        />
      </group>

      {/* Decorative Elements */}
      <ToonObject
        geometry={<boxGeometry args={[12.2, 8.2, 0.1]} />}
        position={[0, 0, -0.3]}
        color={new Color(0.2, 0.2, 0.2)}
        outlineWidth={0.01}
        materialType="metal"
      />
    </group>
  );
};

export default ProjectShowcaseContainer; 