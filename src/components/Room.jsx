import React, { Suspense, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  useHelper,
  MeshDistortMaterial,
  shaderMaterial,
  Instances,
  Instance,
  Html,
  Edges
} from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { SpotLightHelper, DirectionalLightHelper, Vector3, Color, LOD } from 'three';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { createPortal } from 'react-dom';
import { CameraController } from './CameraController';
import { ProjectCard } from './ProjectCard';
import { projects, baseCardConfig } from '../config/ProjectConfig';
import { useSectionInteractables } from '../hooks/useSectionInteractables';

// Import our toon material and presets
import '../shaders/toon-enhanced/ToonEnhancedMaterial';
import { getMaterialProperties } from '../materials/ToonMaterialPresets';
import { CityLOD } from './city';
import ProjectShowcase from './ProjectShowcase';
import ProjectMonitor from './ProjectMonitor';
import ProjectShowcaseContainer from './ProjectShowcaseContainer';
import { AnimeMaterial } from '../shaders/anime-shader/AnimeMaterial';
import { WindowGlass, TouchGlass, AnimatedGlass } from '../materials/GlassMaterial';
import { ProjectDetailPortal } from './ProjectDetailPortal';

// Export ToonObject component
export const ToonObject = React.forwardRef(({ 
  geometry, 
  position, 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1], 
  color, 
  outlineWidth = 0.05,
  rimColor = new Color(1.0, 1.0, 1.0),
  rimIntensity = 0.5,
  specularIntensity = 0.5,
  halftoneIntensity = 0.3,
  hatchingIntensity = 0.4,
  hatchingScale = 50.0,
  hatchingRotation = 0.0,
  materialType = 'default'
}, ref) => {
  const preset = getMaterialProperties(materialType);

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      {geometry}
      <primitive 
        object={new AnimeMaterial({
          color: color,
          outlineColor: new Color(0.0, 0.0, 0.0),
          outlineWidth: outlineWidth,
          rimColor: rimColor,
          rimPower: 3.0,
          rimIntensity: preset.rimIntensity * 0.5,
          specularColor: new Color(1.0, 1.0, 1.0),
          specularIntensity: preset.specularIntensity * 0.7,
          specularShininess: preset.specularShininess,
          steps: 4.0,
          halftoneScale: 100.0,
          halftoneIntensity: halftoneIntensity,
          hatchingScale: hatchingScale,
          hatchingIntensity: hatchingIntensity,
          hatchingRotation: hatchingRotation,
          softShadowIntensity: 0.5,
          colorTransitionSmoothness: 0.2
        })} 
      />
      <Edges
        scale={1}
        threshold={15} // Edge detection threshold
        color="black"
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
});

// Moon component with subtle glow effect
const Moon = () => {
  return (
    <group position={[-60, 0, -120]}>
      {/* Main moon sphere */}
      <ToonObject
        geometry={<sphereGeometry args={[8, 32, 32]} />}
        position={[0, 0, 0]}
        color={new Color(0.99, 0.98, 0.83)}
        outlineWidth={0.02}
        rimColor={new Color(1.0, 0.95, 0.8)}
        rimIntensity={0.8}
        specularIntensity={0.2}
      />
      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[9, 32, 32]} />
        <TouchGlass 
          color={new THREE.Color(0.99, 0.98, 0.83)}
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};

const InteractiveObject = ({ position, scale, color, hoverColor, glowColor, onClick, children }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Subtle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const springs = useSpring({
    scale: hovered ? scale.map(s => s * 1.1) : scale,
    color: hovered ? hoverColor : color,
    emissive: hovered ? glowColor : color,
    emissiveIntensity: hovered ? 0.8 : 0.3,
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={springs.scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      <animated.meshPhysicalMaterial 
        color={springs.color}
        emissive={springs.emissive}
        emissiveIntensity={springs.emissiveIntensity}
        metalness={0.5}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.2}
      />
    </animated.mesh>
  );
};

// Art supplies components
const Easel = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Easel frame */}
      <ToonObject
        geometry={<boxGeometry args={[0.2, 4, 0.2]} />}
        position={[-0.8, 0, 0]}
        color={new Color(0.4, 0.2, 0.1)}
        outlineWidth={0.02}
      />
      <ToonObject
        geometry={<boxGeometry args={[0.2, 4, 0.2]} />}
        position={[0.8, 0, 0]}
        color={new Color(0.4, 0.2, 0.1)}
        outlineWidth={0.02}
      />
      <ToonObject
        geometry={<boxGeometry args={[1.8, 0.2, 0.2]} />}
        position={[0, 1.5, 0]}
        color={new Color(0.4, 0.2, 0.1)}
        outlineWidth={0.02}
      />
      {/* Canvas */}
      <ToonObject
        geometry={<boxGeometry args={[2, 2.5, 0.1]} />}
        position={[0, 1, 0.1]}
        color={new Color(0.95, 0.95, 0.9)}
        outlineWidth={0.02}
      />
    </group>
  );
};

const ArtSupplies = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Paint palette */}
      <ToonObject
        geometry={<cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />}
        position={[0.5, 0.025, 0]}
        color={new Color(0.6, 0.3, 0.2)}
        outlineWidth={0.02}
      />
      {/* Paint tubes */}
      {[0, 0.2, 0.4].map((x, i) => (
        <ToonObject
          key={`paint-${i}`}
          geometry={<cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />}
          position={[x, 0.15, 0.3]}
          rotation={[Math.PI/2, 0, 0]}
          color={new Color(Math.random(), Math.random(), Math.random())}
          outlineWidth={0.02}
        />
      ))}
    </group>
  );
};

// Writing area components
const Typewriter = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Main body */}
      <ToonObject
        geometry={<boxGeometry args={[1.2, 0.6, 0.8]} />}
        position={[0, 0, 0]}
        color={new Color(0.2, 0.2, 0.2)}
        outlineWidth={0.02}
      />
      {/* Paper roller */}
      <ToonObject
        geometry={<cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />}
        position={[0, 0.3, 0]}
        rotation={[0, 0, Math.PI/2]}
        color={new Color(0.8, 0.8, 0.8)}
        outlineWidth={0.02}
      />
    </group>
  );
};

const WritingBoard = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Cork board */}
      <ToonObject
        geometry={<boxGeometry args={[3, 2, 0.1]} />}
        position={[0, 0, 0]}
        color={new Color(0.8, 0.6, 0.4)}
        outlineWidth={0.02}
      />
      {/* Posted notes */}
      {[[-0.8, 0.5], [0, -0.3], [0.7, 0.2]].map(([x, y], i) => (
        <ToonObject
          key={`note-${i}`}
          geometry={<boxGeometry args={[0.4, 0.4, 0.01]} />}
          position={[x, y, 0.06]}
          color={new Color(1, 1, 0.8)}
          outlineWidth={0.01}
        />
      ))}
    </group>
  );
};

// Developer area components
const MonitorSetup = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Main monitor */}
      <ToonObject
        geometry={<boxGeometry args={[2, 1.2, 0.1]} />}
        position={[0, 1, 0]}
        color={new Color(0.1, 0.1, 0.1)}
        outlineWidth={0.02}
      />
      {/* Screen content */}
      <ToonObject
        geometry={<boxGeometry args={[1.9, 1.1, 0.01]} />}
        position={[0, 1, 0.06]}
        color={new Color(0.2, 0.2, 0.25)}
        outlineWidth={0.01}
      />
      {/* Screen glass */}
      <mesh position={[0, 1, 0.07]}>
        <planeGeometry args={[1.85, 1.05]} />
        <TouchGlass 
          color={new Color(0.2, 0.2, 0.25)}
          opacity={0.9}
          transmission={0.8}
        />
      </mesh>
      {/* Monitor stand */}
      <ToonObject
        geometry={<boxGeometry args={[0.2, 0.8, 0.2]} />}
        position={[0, 0.4, 0]}
        color={new Color(0.3, 0.3, 0.3)}
        outlineWidth={0.02}
      />
      {/* Secondary monitor */}
      <ToonObject
        geometry={<boxGeometry args={[1.5, 1, 0.1]} />}
        position={[1.8, 0.8, 0]}
        rotation={[0, -Math.PI/12, 0]}
        color={new Color(0.1, 0.1, 0.1)}
        outlineWidth={0.02}
      />
      {/* Secondary screen glass */}
      <mesh position={[1.8, 0.8, 0.06]} rotation={[0, -Math.PI/12, 0]}>
        <planeGeometry args={[1.45, 0.95]} />
        <TouchGlass 
          color={new Color(0.2, 0.2, 0.25)}
          opacity={0.9}
          transmission={0.8}
        />
      </mesh>
    </group>
  );
};

const GameDevTools = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* 3D model reference */}
      <ToonObject
        geometry={<boxGeometry args={[0.8, 0.8, 0.8]} />}
        position={[0, 0.4, 0]}
        color={new Color(0.5, 0.7, 0.9)}
        outlineWidth={0.02}
      />
      {/* Game controller */}
      <ToonObject
        geometry={<boxGeometry args={[0.6, 0.2, 0.4]} />}
        position={[1, 0, 0]}
        color={new Color(0.2, 0.2, 0.2)}
        outlineWidth={0.02}
      />
    </group>
  );
};

// Create materials for buildings with different detail levels
const createBuildingMaterials = (detailLevel) => {
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new Color(0.1, 0.1, 0.15),
    metalness: 0.2,
    roughness: 0.7,
    emissive: new Color(0.05, 0.05, 0.1),
    emissiveIntensity: 0.5
  });

  if (detailLevel === 'high') {
    // Add window material for high detail
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: new Color(0.9, 0.9, 0.7),
      emissive: new Color(0.9, 0.9, 0.7),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    return { base: baseMaterial, windows: windowMaterial };
  }

  return { base: baseMaterial };
};

const createCityBuildings = (offsetX, offsetZ, count = 5, detailLevel = 'high') => {
  const buildings = [];
  const materials = createBuildingMaterials(detailLevel);
  
  for (let i = 0; i < count; i++) {
    const height = Math.random() * 60 + 30;
    const width = Math.random() * 6 + 6;
    const depth = Math.random() * 6 + 6;
    const x = (Math.random() - 0.5) * 40 + offsetX;
    const z = (Math.random() - 0.5) * 40 + offsetZ;
    
    // Create building group
    const buildingGroup = new THREE.Group();
    
    // Main building structure
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth, 
        detailLevel === 'high' ? 2 : 1,
        detailLevel === 'high' ? 2 : 1,
        detailLevel === 'high' ? 2 : 1
      ),
      materials.base.clone()
    );
    
    building.position.set(0, 0, 0);
    building.castShadow = true;
    building.receiveShadow = true;
    buildingGroup.add(building);

    // Add windows for high detail buildings
    if (detailLevel === 'high' && materials.windows) {
      const windowSize = 0.8;
      const windowSpacing = 1.2;
      const windowDepth = 0.1;
      
      // Calculate number of windows
      const windowsX = Math.floor(width / windowSpacing);
      const windowsY = Math.floor(height / windowSpacing);
      const windowsZ = Math.floor(depth / windowSpacing);
      
      // Create window geometry
      const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, windowDepth);
      
      // Add windows to each face
      for (let wx = 0; wx < windowsX; wx++) {
        for (let wy = 0; wy < windowsY; wy++) {
          // Front face
          const frontWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          frontWindow.position.set(
            (wx - windowsX/2 + 0.5) * windowSpacing,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            depth/2 + windowDepth/2
          );
          buildingGroup.add(frontWindow);
          
          // Back face
          const backWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          backWindow.position.set(
            (wx - windowsX/2 + 0.5) * windowSpacing,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            -depth/2 - windowDepth/2
          );
          buildingGroup.add(backWindow);
        }
      }
      
      // Side windows
      for (let wz = 0; wz < windowsZ; wz++) {
        for (let wy = 0; wy < windowsY; wy++) {
          // Left face
          const leftWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          leftWindow.position.set(
            -width/2 - windowDepth/2,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            (wz - windowsZ/2 + 0.5) * windowSpacing
          );
          leftWindow.rotation.y = Math.PI/2;
          buildingGroup.add(leftWindow);
          
          // Right face
          const rightWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          rightWindow.position.set(
            width/2 + windowDepth/2,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            (wz - windowsZ/2 + 0.5) * windowSpacing
          );
          rightWindow.rotation.y = Math.PI/2;
          buildingGroup.add(rightWindow);
        }
      }
    }
    
    buildingGroup.position.set(x, -20, z);
    buildings.push(buildingGroup);
  }

  return buildings;
};

// Move ZoomIndicator outside of Three.js context
const ZoomIndicator = ({ zoomLevel }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      width: '20px',
      height: '200px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '10px',
      padding: '2px',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '100%',
        height: `${zoomLevel * 100}%`,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        transition: 'none'
      }} />
    </div>
  );
};

// Create a Three.js component to track zoom
const ZoomTracker = ({ onZoomChange }) => {
  const { camera } = useThree();

  useFrame(() => {
    const distance = camera.position.distanceTo(new Vector3(0, 5, -5));
    const normalizedZoom = Math.min(Math.max((distance - 12) / (30 - 12), 0), 1);
    onZoomChange(normalizedZoom);
  });

  return null;
};

// Create a memoized version of the books to prevent regeneration
const ShelfBooks = React.memo(() => {
  const bookColors = useMemo(() => [
    [0.25, 0.0, 0.71],  // Blue
    [0.0, 0.59, 0.53],  // Teal
    [1.0, 0.76, 0.03],  // Yellow
    [0.38, 0.49, 0.55], // Gray
    [0.91, 0.12, 0.39]  // Pink
  ], []);

  const bookRotations = useMemo(() => 
    [...Array(5)].map(() => Math.random() * 0.2 - 0.1),
    []
  );

  return (
    <>
      {/* Books on Upper Shelf */}
      {[...Array(6)].map((_, i) => (
        <ToonObject
          key={`book-upper-${i}`}
          geometry={<boxGeometry args={[0.8, 2, 1.5]} />}
          position={[-3 + i * 1, 1, 0]}
          rotation={[0, bookRotations[i % 5], 0]}
          color={new Color(
            0.2 + Math.random() * 0.6,
            0.2 + Math.random() * 0.6,
            0.2 + Math.random() * 0.6
          )}
          outlineWidth={0.01}
          materialType="plastic"
        />
      ))}
      
      {/* Books on Lower Shelf */}
      {[...Array(5)].map((_, i) => (
        <ToonObject
          key={`book-lower-${i}`}
          geometry={<boxGeometry args={[0.8, 2, 1.3]} />}
          position={[-2 + i * 1, -2.6, 0]}
          rotation={[0, bookRotations[i], 0]}
          color={new Color(...bookColors[i])}
          outlineWidth={0.01}
          materialType="plastic"
        />
      ))}
    </>
  );
});

// Memoize the RoomScene component
const RoomScene = React.memo(({ setCurrentSection, setContentVisible, setActiveView, activeView, devMode, handleProjectClick }) => {
  const spotLight = useRef();
  const dirLight = useRef();
  const moonLight = useRef();
  const fillLight = useRef();
  const keyLightRef = useRef();
  const { camera, gl } = useThree();

  // Debug helpers (comment out in production)
  useHelper(spotLight, SpotLightHelper, 'white');
  useHelper(dirLight, DirectionalLightHelper, 1, 'red');
  useHelper(fillLight, DirectionalLightHelper, 1, 'blue');

  // Memory management
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (moonLight.current && moonLight.current.geometry && moonLight.current.material) {
        if (typeof moonLight.current.geometry.dispose === 'function') {
          moonLight.current.geometry.dispose();
        }
        if (typeof moonLight.current.material.dispose === 'function') {
          moonLight.current.material.dispose();
        }
      }
    };
  }, []);

  const handleObjectClick = useCallback((section) => {
    setCurrentSection(section);
    setContentVisible(true);
  }, [setCurrentSection, setContentVisible]);

  // Add hover state for buildings
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  return (
    <>
      {/* Moon and Moonlight */}
      <Moon />
      <directionalLight
        ref={moonLight}
        position={[-80, 60, -120]}
        intensity={0.3}
        color="#E6E6FA"
        castShadow
      />

      {/* Roof/Ceiling Structure */}
      <group position={[0, 20, 0]}>
        {/* Main Ceiling */}
        <ToonObject
          geometry={<boxGeometry args={[30, 20, 0.4]} />}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={new Color(0.17, 0.09, 0.06)}
          outlineWidth={0.01}
          materialType="wood"
        />
        {/* Ceiling Trim */}
        <ToonObject
          geometry={<boxGeometry args={[30.4, 0.3, 0.4]} />}
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={new Color(0.2, 0.1, 0.05)}
          outlineWidth={0.01}
          materialType="wood"
        />
        {/* Ceiling Light Fixtures */}
        {[-9, 0, 9].map((x, i) => (
          <group key={`light-${i}`} position={[x, 0, -6]}>
            {/* Light Base */}
            <ToonObject
              geometry={<cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />}
              position={[0, 0.1, 0]}
              color={new Color(0.2, 0.2, 0.2)}
              outlineWidth={0.01}
              materialType="metal"
            />
            {/* Light Shade */}
            <ToonObject
              geometry={<cylinderGeometry args={[0.5, 0.3, 0.4, 16]} />}
              position={[0, -0.2, 0]}
              color={new Color(0.9, 0.9, 0.8)}
              outlineWidth={0.01}
              materialType="fabric"
            />
            {/* Light Source */}
            <pointLight
              position={[0, -0.1, 0]}
              intensity={0.8}
              color="#FFE5B4"
              distance={8}
              decay={2}
            />
          </group>
        ))}
      </group>

      {/* Enhanced Lighting Setup */}
      {/* Main Room Lighting */}
      {/* Key Light - Main dramatic light */}
      <spotLight
        ref={spotLight}
        position={[0, 15, -15]}
        angle={Math.PI / 6}
        penumbra={0.3}
        intensity={0.3}
        color="#FFE5B4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill Light - Much softer fill */}
      <directionalLight
        ref={fillLight}
        position={[-10, 10, 5]}
        intensity={0.04}
        color="#B4E5FF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim Light - Reduced edge highlights */}
      <directionalLight
        ref={dirLight}
        position={[10, 10, 5]}
        intensity={0.08}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Ambient Light - Much darker base lighting */}
      <ambientLight intensity={0.08} color="#404040" />

      {/* Accent Light - Reduced highlights */}
      <spotLight
        position={[5, 8, -8]}
        angle={Math.PI / 6}
        penumbra={0.3}
        intensity={0.15}
        color="#FFB4E5"
        castShadow
      />

      {/* Window Light - Reduced natural light */}
      <spotLight
        position={[0, 10, -12]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={0.2}
        color="#E6E6FA"
        castShadow
      />

      {/* Add corner darkness lights */}
      <spotLight
        position={[-14, 5, -9]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={0.05}
        color="#000000"
        castShadow
      />
      <spotLight
        position={[14, 5, -9]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={0.05}
        color="#000000"
        castShadow
      />
      <spotLight
        position={[-14, 5, 9]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={0.05}
        color="#000000"
        castShadow
      />
      <spotLight
        position={[14, 5, 9]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={0.05}
        color="#000000"
        castShadow
      />

      {/* City Buildings with LOD */}
      <CityLOD />

      {/* Building Structure */}
      {/* Building Exterior - Front */}
      <ToonObject
        geometry={<boxGeometry args={[30, 150, 0.5]} />}
        position={[0, -75.5, 9.5]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Building Exterior - Left Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 31]} />}
        position={[-15.5, -75, -0.7]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Building Exterior - Right Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 31]} />}
        position={[14.6, -75.5, 0]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Floor */}
      <ToonObject
        geometry={<planeGeometry args={[30, 20]} />}
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="floor"
        halftoneIntensity={0.2}
        hatchingIntensity={0.3}
      />

      {/* Main Room Structure */}
      <group>
        {/* Back Wall with Window - Controls the entire window wall structure */}
        <group position={[0, 10, -10]}>
          {/* Top Wall Section - The wall above the window */}
          <ToonObject
            geometry={<boxGeometry args={[30, 8, 0.3]} />}
            position={[0, 10, 0]}
            color={new Color(0.2, 0.25, 0.3)}
            outlineWidth={0.02}
            materialType="wall"
            halftoneIntensity={0.2}
            hatchingIntensity={0.3}
          />

          {/* Bottom Wall Section - The wall below the window */}
          <ToonObject
            geometry={<boxGeometry args={[30, 8, 0.3]} />}
            position={[0, -6, 0]}
            color={new Color(0.2, 0.25, 0.3)}
            outlineWidth={0.02}
            materialType="wall"
            halftoneIntensity={0.2}
            hatchingIntensity={0.3}
          />

          {/* Left Wall Section - The wall to the left of the window */}
          <ToonObject
            geometry={<boxGeometry args={[12, 12, 0.3]} />}
            position={[-15, 0, 0]}
            color={new Color(0.2, 0.25, 0.3)}
            outlineWidth={0.02}
            materialType="wall"
            halftoneIntensity={0.2}
            hatchingIntensity={0.3}
          />

          {/* Right Wall Section - The wall to the right of the window */}
          <ToonObject
            geometry={<boxGeometry args={[12, 12, 0.3]} />}
            position={[15, 0, 0]}
            color={new Color(0.2, 0.25, 0.3)}
            outlineWidth={0.02}
            materialType="wall"
            halftoneIntensity={0.2}
            hatchingIntensity={0.3}
          />
        </group>

        {/* Left Wall */}
        <ToonObject
          geometry={<boxGeometry args={[20, 20, 0.3]} />}
          position={[-15, 10, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={new Color(0.2, 0.25, 0.3)}
          outlineWidth={0.02}
          materialType="wall"
          halftoneIntensity={0.2}
          hatchingIntensity={0.3}
        />

        {/* Right Wall */}
        <ToonObject
          geometry={<boxGeometry args={[20, 20, 0.3]} />}
          position={[15, 10, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={new Color(0.2, 0.25, 0.3)}
          outlineWidth={0.02}
          materialType="wall"
          halftoneIntensity={0.2}
          hatchingIntensity={0.3}
        />

        {/* Main Window Structure - Contains all window components */}
        <group position={[0, 12, -9.7]}>
          {/* Window Glass - Converted from frame to glass */}
          <mesh
            castShadow
            receiveShadow
          >
            <boxGeometry args={[18, 8, 0.1]} />
            <WindowGlass />
          </mesh>

          {/* Window Grid - The decorative grid pattern on the window */}
          <group position={[0, 0, 0.05]}>
            {/* Vertical Dividers - The vertical lines in the grid */}
            {[-5, 0, 5].map((x, i) => (
              <ToonObject
                key={`vertical-${i}`}
                geometry={<boxGeometry args={[0.1, 8, 0.05]} />}
                position={[x * 1.8, 0, 0]}
                color={new Color(0.2, 0.2, 0.2)}
                outlineWidth={0.01}
                materialType="metal"
              />
            ))}
            {/* Horizontal Dividers - The horizontal lines in the grid */}
            {[-4, 0, 4].map((y, i) => (
              <ToonObject
                key={`horizontal-${i}`}
                geometry={<boxGeometry args={[18, 0.1, 0.05]} />}
                position={[0, y, 0]}
                color={new Color(0.2, 0.2, 0.2)}
                outlineWidth={0.01}
                materialType="metal"
              />
            ))}
          </group>
        </group>
      </group>

      {/* Roof */}
      <ToonObject
        geometry={<boxGeometry args={[20, 20, 0.4]} />}
        position={[0, 20, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.17, 0.09, 0.06)}
        outlineWidth={0.01}
        materialType="wood"
      />

      {/* Interactive Objects with Instances */}
      {/* Desk Group */}
      <group position={[0, 0, 0]}>
        {/* Table/Desk */}
        <ToonObject
          geometry={<boxGeometry args={[10, 0.3, 6]} />}
          position={[0, 5, -7.4]}
          color={new Color(0.545, 0.271, 0.075)}
          outlineWidth={0.02}
          materialType="wood"
        />
        
        {/* Table/Desk Legs */}
        {[
          [-4.8, 1.5, -9.2],
          [4.8, 1.5, -9.2],
          [-4.8, 1.5, -5.8],
          [4.8, 1.5, -5.8]
        ].map((pos, idx) => (
          <ToonObject
            key={`desk-leg-${idx}`}
            geometry={<boxGeometry args={[0.4,7, 0.3]} />}
            position={pos}
            color={new Color(0.545, 0.271, 0.075)}
            outlineWidth={0.02}
            materialType="wood"
          />
        ))}

        {/* Interactive Objects */}
        {/* Monitor - Projects */}
        <group position={[0, 7, -9]} rotation={[-0.1, 0, 0]}>
          <ProjectMonitor 
            objectId="project-monitor"
            section="home"
            position={[0, 0, 0]}
            onClick={() => {
              setCurrentSection('projects');
              setActiveView('projects');
              setContentVisible(true);
            }}
          />
          <ToonObject
            geometry={<boxGeometry args={[2.2, 0.1, 1.5]} />}
            position={[0, -0.8, -0.7]}
            color={new Color(0.2, 0.2, 0.2)}
            outlineWidth={0.02}
          />
          <ToonObject
            geometry={<boxGeometry args={[0.1, 0.8, 0.1]} />}
            position={[0, -0.4, -1.4]}
            color={new Color(0.3, 0.3, 0.3)}
            outlineWidth={0.02}
          />
        </group>

        {/* Phone - Contact */}
        <group position={[2.8, 6, -8]} rotation={[-0.5, 0, Math.PI / 2]}>
          {/* Phone Body */}
          <InteractiveToonObject
            objectId="phone-body"
            section="home"
            position={[0, 0, 0]}
            scale={[1, 1.8, 0.1]}
            geometry={<boxGeometry />}
            color={new Color(0.91, 0.12, 0.39)}
            hoverColor={new Color(0.95, 0.2, 0.45)}
            glowColor={new Color(1.0, 0.3, 0.5)}
            materialType="plastic"
            onClick={() => handleObjectClick('contact')}
          />
          {/* Screen */}
          <InteractiveToonObject
            objectId="phone-screen"
            section="home"
            position={[0, 0, 0.06]}
            scale={[0.9, 1.7, 0.01]}
            geometry={<boxGeometry />}
            color={new Color(0.1, 0.1, 0.1)}
            hoverColor={new Color(0.15, 0.15, 0.15)}
            glowColor={new Color(0.2, 0.2, 0.2)}
            materialType="plastic"
            onClick={() => handleObjectClick('contact')}
          />
          {/* Screen Glass */}
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[0.85, 1.65]} />
            <TouchGlass 
              color={new Color(0.1, 0.1, 0.1)}
              opacity={0.95}
              transmission={0.7}
            />
          </mesh>
        </group>

        {/* Drawing Tablet - About */}
        <group position={[-3, 5, -7]} rotation={[-0.4, 0.5, 0]}>
          {/* Tablet Stand */}
          <InteractiveToonObject
            objectId="tablet-stand"
            section="home"
            position={[0, 1, -0.2]}
            scale={[0.2, 0.8, 0.2]}
            geometry={<boxGeometry />}
            color={new Color(0.3, 0.6, 0.3)}
            hoverColor={new Color(0.35, 0.65, 0.35)}
            glowColor={new Color(0.4, 0.7, 0.4)}
            materialType="plastic"
            onClick={() => handleObjectClick('about')}
          />
          {/* Tablet Body */}
          <InteractiveToonObject
            objectId="tablet-body"
            section="home"
            position={[0, 1, 0]}
            scale={[2, 1.4, 0.1]}
            geometry={<boxGeometry />}
            color={new Color(0.4, 0.7, 0.4)}
            hoverColor={new Color(0.45, 0.75, 0.45)}
            glowColor={new Color(0.5, 0.8, 0.5)}
            materialType="plastic"
            onClick={() => handleObjectClick('about')}
          />
          {/* Screen */}
          <InteractiveToonObject
            objectId="tablet-screen"
            section="home"
            position={[0, 1, 0.06]}
            scale={[1.9, 1.3, 0.01]}
            geometry={<boxGeometry />}
            color={new Color(0.1, 0.1, 0.1)}
            hoverColor={new Color(0.15, 0.15, 0.15)}
            glowColor={new Color(0.2, 0.2, 0.2)}
            materialType="plastic"
            onClick={() => handleObjectClick('about')}
          />
          {/* Screen Glass */}
          <mesh position={[0, 1, 0.07]}>
            <planeGeometry args={[1.85, 1.25]} />
            <TouchGlass 
              color={new Color(0.1, 0.1, 0.1)}
              opacity={0.95}
              transmission={0.7}
            />
          </mesh>
          {/* Stylus */}
          <InteractiveToonObject
            objectId="stylus"
            section="home"
            position={[1, 0.4, 0.1]}
            scale={[0.1, 0.8, 0.05]}
            geometry={<boxGeometry />}
            color={new Color(0.3, 0.6, 0.3)}
            hoverColor={new Color(0.35, 0.65, 0.35)}
            glowColor={new Color(0.4, 0.7, 0.4)}
            materialType="plastic"
            onClick={() => handleObjectClick('about')}
          />
        </group>

        {/* Keyboard - Home */}
        <group position={[0, 5.5, -7]}>
          {/* Keyboard Base */}
          <InteractiveToonObject
            objectId="keyboard-base"
            section="home"
            position={[0, 0, 0]}
            scale={[3, 0.2, 2]}
            geometry={<boxGeometry />}
            color={new Color(0.545, 0.271, 0.075)}
            hoverColor={new Color(0.6, 0.3, 0.1)}
            glowColor={new Color(0.7, 0.4, 0.2)}
            materialType="wood"
            onClick={() => {
              setCurrentSection('home');
              setActiveView('home');
              setContentVisible(true);
            }}
          />
          {/* Key Layout */}
          <InteractiveToonObject
            objectId="keyboard-layout"
            section="home"
            position={[0, 0.11, 0]}
            scale={[2.9, 0.1, 1.7]}
            geometry={<boxGeometry />}
            color={new Color(0.4, 0.2, 0.05)}
            hoverColor={new Color(0.5, 0.25, 0.1)}
            glowColor={new Color(0.6, 0.3, 0.15)}
            materialType="wood"
            onClick={() => {
              setCurrentSection('home');
              setActiveView('home');
              setContentVisible(true);
            }}
          />
        </group>
      </group>

      {/* Left Wall Furniture */}
      {/* Filing Cabinet */}
      <group position={[-13, 0, -6]} rotation={[0, Math.PI / 4, 0]}>
        {/* Cabinet Base */}
        <ToonObject
          geometry={<boxGeometry args={[4, 10, 3]} />}
          position={[0, 4, 0]}
          color={new Color(0.3, 0.3, 0.35)}
          outlineWidth={0.02}
          materialType="metal"
        />
        {/* Drawer Handles */}
        {[1, 3, 5, 7].map((y, i) => (
          <ToonObject
            key={`handle-${i}`}
            geometry={<boxGeometry args={[0.8, 0.2, 0.2]} />}
            position={[0, y, 1.6]}
            color={new Color(0.7, 0.7, 0.7)}
            outlineWidth={0.01}
            materialType="metal"
          />
        ))}
      </group>

      {/* Mini Fridge */}
      <group position={[-13, 0, 3]} rotation={[0, -Math.PI / 2, 0]}>
        <ToonObject
          geometry={<boxGeometry args={[3.6, 5, 3]} />}
          position={[0, 2.5, 0]}
          color={new Color(0.9, 0.9, 0.9)}
          outlineWidth={0.02}
          materialType="metal"
        />
        {/* Handle */}
        <ToonObject
          geometry={<boxGeometry args={[0.5, 0.5, 0.3]} />}
          position={[1.5, 3, -2]}
          color={new Color(0.8, 0.8, 0.8)}
          outlineWidth={0.01}
          materialType="metal"
        />
      </group>

      {/* Right Wall Furniture */}
      {/* Couch - Adjusted proportions */}
      <group position={[12, 0, 3]} rotation={[0, Math.PI, 0]}>
        {/* Base/Frame */}
        <ToonObject
          geometry={<boxGeometry args={[6, 0.8, 12]} />}
          position={[0, 0.4, 2]}
          color={new Color(0.15, 0.35, 0.55)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Seat Cushion Base */}
        <ToonObject
          geometry={<boxGeometry args={[6, 0.4, 11.8]} />}
          position={[0, 0.8, 2]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Back Rest Frame */}
        <ToonObject
          geometry={<boxGeometry args={[1.5, 6, 12]} />}
          position={[-2, 5, 1.5]}
          rotation={[Math.PI, 0, 0]}
          color={new Color(0.15, 0.35, 0.55)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Back Rest Cushion */}
        <ToonObject
          geometry={<boxGeometry args={[1, 5, 11]} />}
          position={[-1, 4, 1.5]}
          rotation={[Math.PI, 0, 0]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Side Arms */}
        <ToonObject
          geometry={<boxGeometry args={[6, 4, 1]} />}
          position={[0, 2.5, 8]}
          color={new Color(0.15, 0.35, 0.55)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        <ToonObject
          geometry={<boxGeometry args={[6, 4, 1]} />}
          position={[0, 2.5, -4]}
          color={new Color(0.15, 0.35, 0.55)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Seat Cushions */}
        {[-2, 0, 2].map((x, i) => (
          <ToonObject
            key={`cushion-${i}`}
            geometry={<boxGeometry args={[3, 1, 10]} />}
            position={[x * 1.1, 1.5, 1.5]}
            color={new Color(0.25, 0.45, 0.65)}
            outlineWidth={0.01}
            materialType="fabric"
          />
        ))}
        {/* Back Rest Pillows */}
        {[-2, 0, 2].map((x, i) => (
          <ToonObject
            key={`pillow-${i}`}
            geometry={<boxGeometry args={[2, 1, 10]} />}
            position={[x * 1.1, 2, 1.5]}
            color={new Color(0.3, 0.5, 0.7)}
            outlineWidth={0.01}
            materialType="fabric"
          />
        ))}
      </group>

      {/* Wall decoration above couch - Raised higher */}
      <group position={[14.5, 12, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ProjectShowcaseContainer
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          isVisible={activeView === 'projects'}
          onSectionClick={(section) => {
            console.log('Section clicked:', section);
            // We'll implement the section handling later
          }}
        />
      </group>

      {/* Project Cards */}
      {activeView === 'projects' && (
        <group position={[14.5, 12, 0.2]} rotation={[0, -Math.PI/2, 0]}>
          {Object.entries(projects).map(([id, project], index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const position = [
              (col - 1) * 4,  // Center the cards horizontally
              2 - row * 2,    // Stack them in two rows
              0.2
            ];
            
            return (
              <ProjectCard
                key={id}
                position={position}
                scale={project.scale || baseCardConfig.scale}
                projectInfo={project}
                onClick={() => handleProjectClick(id, position)}
                isActive={true}
              />
            );
          })}
        </group>
      )}

      {/* Side Table */}
      <group position={[13, 0, -9]}>
        {/* Table Top */}
        <ToonObject
          geometry={<boxGeometry args={[6, 0.1, 4]} />}
          position={[-2, 4, 1.5]}
          color={new Color(0.4, 0.2, 0.1)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Table Leg */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.2, 0.2, 7, 8]} />}
          position={[0, 0, 0]}
          color={new Color(0.35, 0.15, 0.05)}
          outlineWidth={0.01}
          materialType="metal"
        />
        {/* Table Base */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />}
          position={[0, -3.5, 0]}
          color={new Color(0.35, 0.15, 0.05)}
          outlineWidth={0.01}
          materialType="metal"
        />
        {/* Lamp */}
        <group position={[-1.7, 4.4, 1.5]}>
          {/* Base */}
          <ToonObject
            geometry={<cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />}
            position={[0, 0, 0]}
            color={new Color(0.2, 0.2, 0.2)}
            outlineWidth={0.01}
            materialType="metal"
          />
          {/* Stem */}
          <ToonObject
            geometry={<cylinderGeometry args={[0.1, 0.1, 2, 8]} />}
            position={[0, 0.8, 0]}
            color={new Color(0.2, 0.2, 0.2)}
            outlineWidth={0.01}
            materialType="metal"
          />
          {/* Shade */}
          <ToonObject
            geometry={<cylinderGeometry args={[0.8, 0.5, 0.7, 16]} />}
            position={[0, 2, 0]}
            color={new Color(0.9, 0.9, 0.8)}
            outlineWidth={0.01}
            materialType="fabric"
          />
        </group>
      </group>

      {/* Bookcase and Books */}
      <group position={[-13, 0, 0]}>
        {/* Bookcase Frame */}
        <ToonObject
          geometry={<boxGeometry args={[4, 20, 1]} />}
          position={[0, 10, 0]}
          color={new Color(0.4, 0.2, 0.1)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Shelves */}
        {[-6, -2, 2, 6].map((y, i) => (
          <ToonObject
            key={`shelf-${i}`}
            geometry={<boxGeometry args={[3.8, 0.1, 0.8]} />}
            position={[0, y + 10, 0]}
            color={new Color(0.35, 0.15, 0.05)}
            outlineWidth={0.01}
            materialType="wood"
          />
        ))}
        {/* Books */}
        <ShelfBooks />
      </group>
    </>
  );
});

// Memoize the CameraControls component
const CameraControls = React.memo(({ devMode, setDevMode, activeView }) => {
  const { camera } = useThree();
  const lastCameraState = useRef(null);
  const controlsRef = useRef();

  // Store camera state when entering dev mode
  const enterDevMode = useCallback(() => {
    if (!devMode && camera) {
      lastCameraState.current = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone()
      };
      setDevMode(true);
    }
  }, [devMode, camera, setDevMode]);

  // Restore camera state when exiting dev mode
  const exitDevMode = useCallback(() => {
    if (devMode && lastCameraState.current && camera) {
      camera.position.copy(lastCameraState.current.position);
      camera.rotation.copy(lastCameraState.current.rotation);
      setDevMode(false);
    }
  }, [devMode, camera, setDevMode]);

  // Add keyboard controls for dev mode
  useEffect(() => {
    if (!devMode || !camera) return;

    const handleKeyDown = (e) => {
      const moveSpeed = 2.0;
      const rotateSpeed = 0.1;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0);

      // Simple directional movement
      switch(e.key.toLowerCase()) {
        case 'w':
          camera.position.addScaledVector(forward, moveSpeed);
          break;
        case 's':
          camera.position.addScaledVector(forward, -moveSpeed);
          break;
        case 'a':
          camera.position.addScaledVector(right, -moveSpeed);
          break;
        case 'd':
          camera.position.addScaledVector(right, moveSpeed);
          break;
        case 'q':
          camera.position.addScaledVector(up, moveSpeed);
          break;
        case 'e':
          camera.position.addScaledVector(up, -moveSpeed);
          break;
        case 'arrowleft':
          camera.rotation.y += rotateSpeed;
          break;
        case 'arrowright':
          camera.rotation.y -= rotateSpeed;
          break;
        case 'arrowup':
          camera.rotation.x += rotateSpeed;
          break;
        case 'arrowdown':
          camera.rotation.x -= rotateSpeed;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [devMode, camera]);

  // Define camera targets based on active view
  const getCameraTarget = useCallback(() => {
    if (devMode) {
      return {
        target: [0, 5, 0],
        params: {
          distance: 12,
          height: 8,
          angle: 0,
          fov: 45
        }
      };
    }

    switch (activeView) {
      case 'projects':
        return {
          target: [15, 12, 0],
          params: {
            distance: 15,
            height: 5,
            angle: -Math.PI/2,
            fov: 40
          }
        };
      case 'books':
        return {
          target: [-8, 11, 1],
          params: {
            distance: 12,
            height: 8,
            angle: Math.PI/2,
            fov: 45
          }
        };
      default: // home
        return {
          target: [0, 7, -7],
          params: {
            distance: 10,
            height: 4,
            angle: 0,
            fov: 45
          }
        };
    }
  }, [devMode, activeView]);

  const cameraConfig = getCameraTarget();

  return (
    <>
      {devMode ? (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
          maxPolarAngle={Math.PI * 2}
          minPolarAngle={-Math.PI * 2}
          maxAzimuthAngle={Math.PI * 2}
          minAzimuthAngle={-Math.PI * 2}
          maxDistance={Infinity}
          minDistance={-Infinity}
          enableDamping={true}
          dampingFactor={0.05}
          mouseButtons={{
            LEFT: THREE.MOUSE.NONE,    // Disable left click for camera control
            MIDDLE: THREE.MOUSE.ROTATE, // Middle click for rotation
            RIGHT: THREE.MOUSE.PAN      // Right click for panning
          }}
        />
      ) : (
        <CameraController 
          target={cameraConfig.target}
          params={cameraConfig.params}
        >
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 2.5}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
            maxDistance={50}
            minDistance={8}
            enableDamping={true}
            dampingFactor={0.05}
            mouseButtons={{
              LEFT: THREE.MOUSE.NONE,    // Disable left click for camera control
              MIDDLE: THREE.MOUSE.ROTATE, // Middle click for rotation
              RIGHT: THREE.MOUSE.PAN      // Right click for panning
            }}
          />
        </CameraController>
      )}
      {devMode && (
        <Html position={[0, 0, 0]}>
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            left: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace'
          }}>
            <div>Dev Mode Active</div>
            <div>WASD: Move</div>
            <div>QE: Up/Down</div>
            <div>Arrows: Rotate</div>
            <div>ESC: Exit Dev Mode</div>
          </div>
        </Html>
      )}
    </>
  );
});

// Memoize the DevModeUI component
const DevModeUI = React.memo(({ devMode, setDevMode }) => {
  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: '#fff',
        cursor: 'pointer'
      }} onClick={() => setDevMode(!devMode)}>
        {devMode ? 'Dev Mode: ON' : 'Dev Mode: OFF'}
      </div>
      {devMode && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div>WASD: Move Camera</div>
          <div>QE: Move Up/Down</div>
          <div>NM: Rotate Left/Right</div>
          <div>Middle Mouse: Rotate Camera</div>
          <div>Right Mouse: Pan Camera</div>
          <div>Scroll: Zoom In/Out</div>
        </div>
      )}
    </>
  );
});

// InteractiveToonObject component - Combines ToonObject with interactive effects
const InteractiveToonObject = ({ 
  objectId,
  section,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  geometry,
  color,
  hoverColor,
  glowColor,
  materialType = "metal",
  outlineWidth = 0.02,
  onClick,
  children,
  floatAmplitude = 0.1,
  rotationAmplitude = 0.05,
  hoverScale = 1.1
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const objectRef = useRef();
  const floatOffset = useRef(0);
  const { isInteractableActive, registerInteractable } = useSectionInteractables();
  const isActive = objectId ? isInteractableActive(objectId) : true; // Default to true if no objectId

  // Register this interactable when mounted
  useEffect(() => {
    if (objectId && section) {
      registerInteractable(objectId, section);
    }
  }, [objectId, section, registerInteractable]);

  // Floating animation
  useFrame((state) => {
    if (objectRef.current && isActive) {
      // Gentle floating motion
      floatOffset.current = Math.sin(state.clock.elapsedTime * 2) * floatAmplitude;
      objectRef.current.position.y = position[1] + floatOffset.current;
      
      // Subtle rotation when floating
      objectRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * rotationAmplitude;
    }
  });

  // Calculate hover colors
  const currentColor = isHovered && isActive ? hoverColor || color : color;
  const currentScale = isHovered && isActive ? scale.map(s => s * hoverScale) : scale;

  return (
    <group 
      ref={objectRef}
      position={position}
      rotation={rotation}
      scale={currentScale}
      onPointerOver={() => isActive && setIsHovered(true)}
      onPointerOut={() => isActive && setIsHovered(false)}
      onClick={isActive ? onClick : undefined}
    >
      {/* Main object */}
      <ToonObject
        geometry={geometry}
        position={[0, 0, 0]}
        color={currentColor}
        outlineWidth={outlineWidth}
        materialType={materialType}
      />

      {/* Hover effect layer */}
      {isHovered && isActive && (
        <ToonObject
          geometry={geometry}
          position={[0, 0, 0.01]}
          color={glowColor || hoverColor || color}
          outlineWidth={outlineWidth * 0.5}
          materialType="plastic"
        />
      )}

      {/* Children components */}
      {children}
    </group>
  );
};

// Add this before the Room component
const PROJECT_POSITIONS = {
  deckSwipe: [-8, 2, -5],
  portfolio3D: [-4, 2, -5],
  gameEngine: [0, 2, -5],
  aiAssistant: [4, 2, -5],
  cloudPlatform: [8, 2, -5],
  mobileApp: [12, 2, -5]
};

// Memoize the Room component
export const Room = React.memo(({ setCurrentSection, setContentVisible }) => {
  const [zoomLevel, setZoomLevel] = useState(0);
  const [activeView, setActiveView] = useState('home');
  const [devMode, setDevMode] = useState(false);
  const canvasRef = useRef();
  const { setSection } = useSectionInteractables();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
  const [cameraParams, setCameraParams] = useState({
    distance: 12,
    height: 8,
    fov: 45
  });

  // Update section when activeView changes
  useEffect(() => {
    setSection(activeView);
  }, [activeView, setSection]);

  const handleNextProject = useCallback(() => {
    const projectIds = Object.keys(projects);
    const currentIndex = projectIds.indexOf(selectedProjectId);
    const nextIndex = (currentIndex + 1) % projectIds.length;
    setSelectedProjectId(projectIds[nextIndex]);
  }, [selectedProjectId]);

  const handlePrevProject = useCallback(() => {
    const projectIds = Object.keys(projects);
    const currentIndex = projectIds.indexOf(selectedProjectId);
    const prevIndex = (currentIndex - 1 + projectIds.length) % projectIds.length;
    setSelectedProjectId(projectIds[prevIndex]);
  }, [selectedProjectId]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailVisible(false);
    setSelectedProjectId(null);
    
    // Reset camera to default position
    setCameraTarget([0, 0, 0]);
    setCameraParams({
      distance: 12,
      height: 8,
      fov: 45,
      transition: {
        mass: 1,
        tension: 120,
        friction: 20
      }
    });
  }, []);

  const handleProjectClick = useCallback((id, position) => {
    console.log('Project clicked:', id, position);
    setSelectedProjectId(id);
    setIsDetailVisible(true);
    console.log('isDetailVisible set to:', true);
    
    // Calculate new camera position
    const [x, y, z] = position;
    // Move camera to be slightly to the left of the card
    const newTarget = [x - 2, y, z];
    setCameraTarget(newTarget);
    
    // Update camera parameters for a closer view
    setCameraParams({
      distance: 8,  // Closer to the card
      height: 4,    // Lower height
      fov: 50,      // Wider field of view
      transition: {
        mass: 1,
        tension: 120,
        friction: 20
      }
    });
  }, []);

  useEffect(() => {
    const handleWheel = (event) => {
      // Your existing wheel event logic
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000000' }}>
      <DevModeUI devMode={devMode} setDevMode={setDevMode} />
      <ZoomIndicator zoomLevel={zoomLevel} />
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          // Set up WebGL context
          gl.setPixelRatio(window.devicePixelRatio);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          
          // Handle context loss
          const handleContextLost = (event) => {
            event.preventDefault();
            console.log('WebGL context lost');
          };

          const handleContextRestored = () => {
            console.log('WebGL context restored');
            gl.setPixelRatio(window.devicePixelRatio);
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          };

          canvasRef.current.addEventListener('webglcontextlost', handleContextLost);
          canvasRef.current.addEventListener('webglcontextrestored', handleContextRestored);

          return () => {
            canvasRef.current?.removeEventListener('webglcontextlost', handleContextLost);
            canvasRef.current?.removeEventListener('webglcontextrestored', handleContextRestored);
          };
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <RoomScene 
            setCurrentSection={setCurrentSection}
            setContentVisible={setContentVisible}
            setActiveView={setActiveView}
            activeView={activeView}
            devMode={devMode}
            handleProjectClick={handleProjectClick}
          />
          <CameraControls 
            devMode={devMode}
            setDevMode={setDevMode}
            activeView={activeView}
          />
          <ZoomTracker onZoomChange={setZoomLevel} />
          <EffectComposer 
            multisampling={0}
            enabled={true}
            autoClear={true}
            depthBuffer={true}
          >
            <Bloom 
              intensity={1.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
              blendFunction={BlendFunction.SCREEN}
              kernelSize={3}
              resolutionScale={0.5}
            />
          </EffectComposer>
          <CityLOD />
        </Suspense>
      </Canvas>
      <ProjectDetailPortal
        projectId={selectedProjectId}
        isVisible={isDetailVisible}
        onClose={handleCloseDetail}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
      />
    </div>
  );
}); 