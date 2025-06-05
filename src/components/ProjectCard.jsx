import React, { useState, useRef, useEffect, memo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { baseCardConfig } from '../config/ProjectConfig';
import * as THREE from 'three';
import { AnimatedGlass } from '../materials/GlassMaterial';

export const ProjectCard = memo(({ 
  position, 
  scale = baseCardConfig.scale,
  projectInfo,
  onClick,
  isActive = true
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const materialRef = useRef();
  const [spriteData, setSpriteData] = useState(null);
  const currentFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const frameDuration = 100; // 100ms per frame (10 FPS)
  
  // Load textures
  const thumbnailTexture = useLoader(THREE.TextureLoader, projectInfo.media.thumbnail);
  const hoverTexture = useLoader(THREE.TextureLoader, projectInfo.media.hover.replace('.gif', '-sprite.png'));
  
  // Load sprite metadata if hover is animated
  useEffect(() => {
    if (projectInfo.media.isAnimated) {
      fetch(projectInfo.media.hover.replace('.gif', '-sprite.json'))
        .then(response => response.json())
        .then(data => {
          setSpriteData(data);
          // Configure sprite texture
          hoverTexture.wrapS = THREE.ClampToEdgeWrapping;
          hoverTexture.wrapT = THREE.ClampToEdgeWrapping;
          hoverTexture.repeat.set(1 / data.frameCount, 1);
          hoverTexture.offset.set(0, 0);
          hoverTexture.needsUpdate = true;
        });
    }
  }, [projectInfo.media, hoverTexture]);

  // Configure textures
  useEffect(() => {
    if (thumbnailTexture) {
      thumbnailTexture.flipY = true;
      thumbnailTexture.needsUpdate = true;
    }
    if (hoverTexture) {
      hoverTexture.flipY = true;
      hoverTexture.needsUpdate = true;
    }
  }, [thumbnailTexture, hoverTexture]);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * baseCardConfig.animation.floatAmplitude;
      // Subtle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * baseCardConfig.animation.rotationAmplitude;
    }

    // Handle sprite animation
    if (hovered && isActive && projectInfo.media.isAnimated && spriteData && materialRef.current) {
      const currentTime = state.clock.elapsedTime * 1000;
      if (currentTime - lastFrameTimeRef.current >= frameDuration) {
        currentFrameRef.current = (currentFrameRef.current + 1) % spriteData.frameCount;
        hoverTexture.offset.x = currentFrameRef.current / spriteData.frameCount;
        hoverTexture.needsUpdate = true;
        lastFrameTimeRef.current = currentTime;
      }
    } else if (!hovered && materialRef.current) {
      materialRef.current.map = thumbnailTexture;
      materialRef.current.needsUpdate = true;
    }
  });

  const springs = useSpring({
    scale: hovered && isActive ? scale.map(s => s * baseCardConfig.animation.hoverScale) : scale,
    color: hovered && isActive ? projectInfo.colors.hover : projectInfo.colors.base,
    emissive: hovered && isActive ? projectInfo.colors.glow : projectInfo.colors.base,
    emissiveIntensity: hovered && isActive ? 0.8 : 0.3,
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={springs.scale}
      onClick={() => isActive && onClick?.(projectInfo.id, position)}
      onPointerOver={() => isActive && setHovered(true)}
      onPointerOut={() => isActive && setHovered(false)}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <AnimatedGlass 
        springs={springs}
      />
      
      {/* Project Media */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={baseCardConfig.media.thumbnailSize} />
        <meshBasicMaterial 
          ref={materialRef}
          map={hovered && isActive && projectInfo.media.isAnimated ? hoverTexture : thumbnailTexture}
          transparent
          opacity={0.9}
          alphaTest={0.1}
          depthWrite={false}
        />
      </mesh>

      {hovered && isActive && (
        <Html
          position={[1.5, 0, 0]}
          style={{
            background: baseCardConfig.hoverInfo.backgroundColor,
            padding: baseCardConfig.hoverInfo.padding,
            borderRadius: baseCardConfig.hoverInfo.borderRadius,
            width: baseCardConfig.hoverInfo.width,
            color: 'white',
            fontSize: baseCardConfig.hoverInfo.fontSize,
            pointerEvents: 'none',
            transform: 'translate3d(0, 0, 0)',
            transition: baseCardConfig.media.transition,
            opacity: hovered ? 1 : 0,
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{projectInfo.title}</h3>
          <p style={{ margin: '0 0 8px 0', color: '#ccc' }}>{projectInfo.description}</p>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {projectInfo.technologies.map((tech, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Html>
      )}
    </animated.mesh>
  );
}); 