import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { ToonObject } from './Room';
import { Color } from 'three';
import { AnimatedGlass } from '../materials/GlassMaterial';

export const ProjectDetail3D = ({ 
  project,
  position = [0, 0, 0],
  onClose,
  onNext,
  onPrev,
  isActive = true
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const portalRef = useRef();

  // Animation springs
  const springs = useSpring({
    scale: hovered ? [1.1, 1.1, 1.1] : [1, 1, 1],
    rotation: hovered ? [0, Math.PI * 0.1, 0] : [0, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Floating animation
  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Project Card with Animation */}
      <animated.group
        ref={meshRef}
        scale={springs.scale}
        rotation={springs.rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ToonObject
          geometry={<boxGeometry args={[2, 3, 0.1]} />}
          position={[0, 0, 0]}
          color={new Color(0.2, 0.2, 0.25)}
          outlineWidth={0.02}
          materialType="metal"
        />
        
        {/* Project Media */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.8, 2.8]} />
          <meshBasicMaterial 
            map={project.media.thumbnail}
            transparent
            opacity={0.9}
          />
        </mesh>
      </animated.group>

      {/* Portal Panel */}
      <group ref={portalRef} position={[-4, 0, 0]}>
        <ToonObject
          geometry={<boxGeometry args={[3, 4, 0.1]} />}
          position={[0, 0, 0]}
          color={new Color(0.15, 0.15, 0.2)}
          outlineWidth={0.02}
          materialType="glass"
        />
        
        {/* Portal Content */}
        <Html
          position={[0, 0, 0.06]}
          transform
          occlude
          style={{
            width: '300px',
            height: '400px',
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '8px',
            color: '#fff',
            overflow: 'auto'
          }}
        >
          <div className="project-portal-content">
            <h2>{project.title}</h2>
            <div className="tech-stack">
              {project.technologies.map((tech, i) => (
                <span key={i} className="tech-tag">{tech}</span>
              ))}
            </div>
            <p>{project.description}</p>
          </div>
        </Html>
      </group>

      {/* Navigation Controls */}
      <group position={[-5.5, 0, 0]}>
        {/* Close Button */}
        <ToonObject
          geometry={<boxGeometry args={[0.5, 0.5, 0.1]} />}
          position={[0, 1.5, 0]}
          color={new Color(0.8, 0.2, 0.2)}
          outlineWidth={0.02}
          materialType="metal"
          onClick={onClose}
        />
        
        {/* Navigation Arrows */}
        <ToonObject
          geometry={<boxGeometry args={[0.5, 0.5, 0.1]} />}
          position={[0, 0.5, 0]}
          color={new Color(0.2, 0.6, 0.8)}
          outlineWidth={0.02}
          materialType="metal"
          onClick={onPrev}
        />
        
        <ToonObject
          geometry={<boxGeometry args={[0.5, 0.5, 0.1]} />}
          position={[0, -0.5, 0]}
          color={new Color(0.2, 0.6, 0.8)}
          outlineWidth={0.02}
          materialType="metal"
          onClick={onNext}
        />
      </group>
    </group>
  );
}; 