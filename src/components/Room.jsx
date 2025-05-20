import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  useHelper,
  MeshDistortMaterial,
  shaderMaterial,
  Instances,
  Instance
} from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { SpotLightHelper, DirectionalLightHelper, Vector3, Color, LOD } from 'three';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Import our toon material and presets
import '../shaders/toon-enhanced/ToonEnhancedMaterial';
import { getMaterialProperties } from '../materials/ToonMaterialPresets';
import { CityLOD } from './city';

// Moon component with subtle glow effect
const Moon = () => {
  return (
    <group position={[-80, 60, -120]}>
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
        <meshStandardMaterial
          color="#FDF5C4"
          transparent
          opacity={0.15}
          emissive="#FDF5C4"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

const ToonObject = ({ 
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
  materialType = 'default'
}) => {
  const preset = getMaterialProperties(materialType);

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {geometry}
      <toonEnhancedMaterial
        color={color}
        outlineColor={new Color(0.0, 0.0, 0.0)}
        outlineWidth={outlineWidth}
        rimColor={rimColor}
        rimPower={3.0}
        rimIntensity={preset.rimIntensity}
        specularColor={new Color(1.0, 1.0, 1.0)}
        specularIntensity={preset.specularIntensity}
        specularShininess={preset.specularShininess}
        halftoneScale={100.0}
        halftoneIntensity={preset.halftoneIntensity}
        lightIntensity={1.0}
      />
    </mesh>
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

const RoomScene = ({ setCurrentSection, setContentVisible }) => {
  const spotLight = useRef();
  const dirLight = useRef();
  const moonLight = useRef();
  const fillLight = useRef();
  const keyLightRef = useRef();
  const lodRef = useRef();
  const floorRef = useRef();
  const backWallRef = useRef();
  const leftWallRef = useRef();
  const rightWallRef = useRef();
  const windowFrameRef = useRef();
  const windowGlassRef = useRef();
  const [lodInitialized, setLodInitialized] = useState(false);
  const { camera } = useThree();

  // Debug helpers (comment out in production)
  useHelper(spotLight, SpotLightHelper, 'white');
  useHelper(dirLight, DirectionalLightHelper, 1, 'red');
  useHelper(fillLight, DirectionalLightHelper, 1, 'blue');

  // Optimize shadow settings
  const { gl } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.setPixelRatio(window.devicePixelRatio);

  // Memory management
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      gl.dispose();
      if (moonLight.current) {
        moonLight.current.geometry.dispose();
        moonLight.current.material.dispose();
      }
    };
  }, [gl]);

  const handleObjectClick = (section) => {
    setCurrentSection(section);
    setContentVisible(true);
  };

  // Add hover state for buildings
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  // LOD setup with proper cleanup
  useEffect(() => {
    if (!lodRef.current) {
      lodRef.current = new THREE.LOD();
    }

    const lod = lodRef.current;
    
    // Clear existing levels
    while(lod.children.length > 0) {
      const child = lod.children[0];
      child.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      lod.remove(child);
    }

    // Create high detail group
    const highDetailGroup = new THREE.Group();
    createCityBuildings(0, -50, 8, 'high').forEach(building => highDetailGroup.add(building));
    createCityBuildings(-30, -50, 6, 'high').forEach(building => highDetailGroup.add(building));
    createCityBuildings(30, -50, 6, 'high').forEach(building => highDetailGroup.add(building));
    lod.addLevel(highDetailGroup, 0);

    // Create medium detail group
    const mediumDetailGroup = new THREE.Group();
    createCityBuildings(0, -70, 7, 'medium').forEach(building => mediumDetailGroup.add(building));
    createCityBuildings(-50, 10, 5, 'medium').forEach(building => mediumDetailGroup.add(building));
    createCityBuildings(60, 10, 5, 'medium').forEach(building => mediumDetailGroup.add(building));
    lod.addLevel(mediumDetailGroup, 50);

    // Create low detail group
    const lowDetailGroup = new THREE.Group();
    createCityBuildings(-45, -30, 4, 'low').forEach(building => lowDetailGroup.add(building));
    createCityBuildings(-50, -60, 6, 'low').forEach(building => lowDetailGroup.add(building));
    createCityBuildings(45, -30, 4, 'low').forEach(building => lowDetailGroup.add(building));
    createCityBuildings(50, -60, 6, 'low').forEach(building => lowDetailGroup.add(building));
    lod.addLevel(lowDetailGroup, 100);

    setLodInitialized(true);

    return () => {
      lod.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
  }, []);

  // Update LOD and handle hover effects
  useFrame(() => {
    if (lodRef.current && camera) {
      lodRef.current.update(camera);
      
      // Update hover effects
      if (hoveredBuilding) {
        hoveredBuilding.traverse(child => {
          if (child instanceof THREE.Mesh && child.material.emissive) {
            child.material.emissiveIntensity = 1.0;
          }
        });
      }
    }
  });

  // Create interactive objects data
  const createInteractiveObjects = () => {
    const objects = [
      {
        position: [-1.5, 0.3, 0],
        rotation: [0, Math.PI / 4, 0],
        scale: [0.2, 0.2, 0.2],
        color: new Color(0.1, 0.2, 0.3),
        type: 'cube'
      },
      {
        position: [0, 0.3, 0],
        rotation: [0, Math.PI / 3, 0],
        scale: [0.2, 0.2, 0.2],
        color: new Color(0.2, 0.3, 0.4),
        type: 'sphere'
      },
      {
        position: [1.5, 0.3, 0],
        rotation: [0, Math.PI / 6, 0],
        scale: [0.2, 0.2, 0.2],
        color: new Color(0.3, 0.4, 0.5),
        type: 'torus'
      }
    ];

    return objects;
  };

  const interactiveObjects = createInteractiveObjects();

  return (
    <>
      {/* Moon and Moonlight */}
      <Moon />
      <directionalLight
        ref={moonLight}
        position={[-80, 60, -120]}
        intensity={0.5}
        color="#E6E6FA"
        castShadow
      />

      {/* Main Room Lighting */}
      {/* Key Light - Main dramatic light */}
      <spotLight
        ref={spotLight}
        position={[0, 15, -5]}
        angle={Math.PI / 4}
        penumbra={0.2}
        intensity={1.2}
        color="#FFE5B4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill Light - Soft fill from opposite side */}
      <directionalLight
        ref={fillLight}
        position={[-10, 10, 5]}
        intensity={0.3}
        color="#B4E5FF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim Light - Creates edge highlights */}
      <directionalLight
        ref={dirLight}
        position={[10, 10, 5]}
        intensity={0.4}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Ambient Light - Increased for better visibility */}
      <ambientLight intensity={0.4} color="#404040" />

      {/* Accent Light - Highlights specific areas */}
      <spotLight
        position={[5, 8, -8]}
        angle={Math.PI / 6}
        penumbra={0.3}
        intensity={0.6}
        color="#FFB4E5"
        castShadow
      />

      {/* Window Light - Creates natural light effect */}
      <spotLight
        position={[0, 10, -9.5]}
        angle={Math.PI / 3}
        penumbra={0.4}
        intensity={0.8}
        color="#E6E6FA"
        castShadow
      />

      {/* City Buildings with LOD */}
      <CityLOD />

      {/* Building Structure */}
      {/* Building Exterior - Front */}
      <ToonObject
        geometry={<boxGeometry args={[20, 150, 0.5]} />}
        position={[0, -75.5, 9.5]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Building Exterior - Left Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 21]} />}
        position={[-10.5, -75, -0.7]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Building Exterior - Right Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 21]} />}
        position={[9.6, -75.5, 0]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
        materialType="metal"
      />

      {/* Floor */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <toonEnhancedMaterial
          color="#2C3E50"
          materialType="floorEnhanced"
          receiveShadow
        />
      </mesh>

      {/* Main Room Structure */}
      <group>
        {/* Back Wall with Window */}
        <group position={[0, 10, -10]}>
          {/* Top Wall Section */}
          <mesh
            ref={backWallRef}
            position={[0, 6, 0]}
            receiveShadow
          >
            <boxGeometry args={[20, 8, 0.3]} />
            <toonEnhancedMaterial
              color="#34495E"
              materialType="wallEnhanced"
              receiveShadow
            />
          </mesh>

          {/* Bottom Wall Section */}
          <mesh
            position={[0, -6, 0]}
            receiveShadow
          >
            <boxGeometry args={[20, 8, 0.3]} />
            <toonEnhancedMaterial
              color="#34495E"
              materialType="wallEnhanced"
              receiveShadow
            />
          </mesh>

          {/* Left Wall Section */}
          <mesh
            position={[-6, 0, 0]}
            receiveShadow
          >
            <boxGeometry args={[8, 12, 0.3]} />
            <toonEnhancedMaterial
              color="#34495E"
              materialType="wallEnhanced"
              receiveShadow
            />
          </mesh>

          {/* Right Wall Section */}
          <mesh
            position={[6, 0, 0]}
            receiveShadow
          >
            <boxGeometry args={[8, 12, 0.3]} />
            <toonEnhancedMaterial
              color="#34495E"
              materialType="wallEnhanced"
              receiveShadow
            />
          </mesh>
        </group>

        {/* Left Wall */}
        <mesh
          ref={leftWallRef}
          position={[-10, 10, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[20, 20, 0.3]} />
          <toonEnhancedMaterial
            color="#34495E"
            materialType="wallEnhanced"
            receiveShadow
          />
        </mesh>

        {/* Right Wall */}
        <mesh
          ref={rightWallRef}
          position={[10, 10, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[20, 20, 0.3]} />
          <toonEnhancedMaterial
            color="#34495E"
            materialType="wallEnhanced"
            receiveShadow
          />
        </mesh>

        {/* Main Window Structure */}
        <group position={[0, 10, -9.7]}>
          {/* Window Frame - Outer */}
          <mesh
            ref={windowFrameRef}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, 12, 0.3]} />
            <toonEnhancedMaterial
              color="#2C3E50"
              materialType="woodEnhanced"
              castShadow
              receiveShadow
            />
          </mesh>

          {/* Window Frame - Inner */}
          <mesh
            position={[0, 0, 0.15]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.6, 11.6, 0.1]} />
            <toonEnhancedMaterial
              color="#2C3E50"
              materialType="woodEnhanced"
              castShadow
              receiveShadow
            />
          </mesh>

          {/* Window Glass */}
          <mesh
            position={[0, 0, 0.2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[7.4, 11.4, 0.05]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              transparent={true}
              opacity={0.2}
              transmission={0.95}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              envMapIntensity={1.5}
              reflectivity={1}
              ior={1.5}
              side={THREE.DoubleSide}
              toneMapped={true}
              emissive="#FFFFFF"
              emissiveIntensity={0.2}
              depthWrite={false}
            />
          </mesh>

          {/* Window Grid */}
          <group position={[0, 0, 0.2]}>
            {/* Vertical Dividers */}
            {[-2.6, 0, 2.6].map((x, i) => (
              <ToonObject
                key={`vertical-${i}`}
                geometry={<boxGeometry args={[0.1, 11.4, 0.05]} />}
                position={[x, 0, 0]}
                color={new Color(0.2, 0.2, 0.2)}
                outlineWidth={0.01}
                materialType="metal"
              />
            ))}
            {/* Horizontal Dividers */}
            {[-4, 0, 4].map((y, i) => (
              <ToonObject
                key={`horizontal-${i}`}
                geometry={<boxGeometry args={[7.4, 0.1, 0.05]} />}
                position={[0, y, 0]}
                color={new Color(0.2, 0.2, 0.2)}
                outlineWidth={0.01}
                materialType="metal"
              />
            ))}
          </group>
        </group>

        {/* Additional Window in Right Wall */}
        <group position={[9.85, 10, 0]}>
          {/* Window Frame */}
          <ToonObject
            geometry={<boxGeometry args={[0.3, 8, 4]} />}
            position={[0, 0, 0]}
            color={new Color(0.545, 0.271, 0.075)}
            outlineWidth={0.02}
            materialType="wood"
          />
          {/* Glass */}
          <ToonObject
            geometry={<boxGeometry args={[0.1, 7.5, 3.5]} />}
            position={[0.15, 0, 0]}
            color={new Color(0.65, 0.85, 1)}
            outlineWidth={0.01}
            materialType="glass"
          />
          {/* Window Divider */}
          <ToonObject
            geometry={<boxGeometry args={[0.1, 7.5, 0.1]} />}
            position={[0.15, 0, 0]}
            color={new Color(0.2, 0.2, 0.2)}
            outlineWidth={0.01}
            materialType="metal"
          />
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
      <Instances limit={3}>
        <boxGeometry args={[1, 1, 1]} />
        <toonEnhancedMaterial
          outlineColor={new Color(0.0, 0.0, 0.0)}
          outlineWidth={0.03}
          rimIntensity={0.3}
          specularIntensity={0.2}
          halftoneIntensity={0.2}
        />
        {interactiveObjects.map((obj, i) => (
          <Instance
            key={`interactive-${i}`}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
            color={obj.color}
          />
        ))}
      </Instances>

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
        {/* Laptop - Projects */}
        <group position={[0, 5.3, -9]} rotation={[-0.1, 0, 0]}>
          {/* Screen */}
          <InteractiveObject
            position={[0, 1, 0]}
            scale={[3, 2, 0.2]}
            color="#2196f3"
            hoverColor="#1976d2"
            glowColor="#64b5f6"
            onClick={() => handleObjectClick('projects')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Base */}
          <InteractiveObject
            position={[0, 0, 1.5]}
            scale={[2.8, 0.1, 2]}
            color="#1976d2"
            hoverColor="#1565c0"
            glowColor="#64b5f6"
            onClick={() => handleObjectClick('projects')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>

        {/* Phone - Contact */}
        <group position={[2.8, 6, -8]} rotation={[-0.5, 0, Math.PI / 2]}>
          {/* Phone Body */}
          <InteractiveObject
            position={[0, 0, 0]}
            scale={[1, 1.8, 0.1]}
            color="#e91e63"
            hoverColor="#c2185b"
            glowColor="#f48fb1"
            onClick={() => handleObjectClick('contact')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Screen */}
          <InteractiveObject
            position={[0, 0, 0.06]}
            scale={[0.9, 1.7, 0.01]}
            color="#000000"
            hoverColor="#1a1a1a"
            glowColor="#f48fb1"
            onClick={() => handleObjectClick('contact')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>

        {/* Drawing Tablet - About Me */}
        <group position={[-3, 5, -7]} rotation={[-0.4, 0.5, 0]}>
          {/* Tablet Stand */}
          <InteractiveObject
            position={[0, 1, -0.2]}
            scale={[0.2, 0.8, 0.2]}
            color="#388e3c"
            hoverColor="#2e7d32"
            glowColor="#81c784"
            onClick={() => handleObjectClick('about')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Stand Base */}
          <InteractiveObject
            position={[0, 0.3, 0]}
            scale={[0.6, 0.1, 0.4]}
            color="#388e3c"
            hoverColor="#2e7d32"
            glowColor="#81c784"
            onClick={() => handleObjectClick('about')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Tablet Body */}
          <InteractiveObject
            position={[0, 1, 0]}
            scale={[2, 1.4, 0.1]}
            color="#4caf50"
            hoverColor="#388e3c"
            glowColor="#81c784"
            onClick={() => handleObjectClick('about')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Screen */}
          <InteractiveObject
            position={[0, 1, 0.06]}
            scale={[1.9, 1.3, 0.01]}
            color="#222222"
            hoverColor="#2e2e2e"
            glowColor="#81c784"
            onClick={() => handleObjectClick('about')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Stylus */}
          <InteractiveObject
            position={[1, 0.4, 0.1]}
            scale={[0.1, 0.8, 0.05]}
            color="#388e3c"
            hoverColor="#2e7d32"
            glowColor="#81c784"
            onClick={() => handleObjectClick('about')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>

        {/* Keyboard - Home */}
        <group position={[0, 5.5, -7]}>
          {/* Keyboard Base */}
          <InteractiveObject
            position={[0, 0, 0]}
            scale={[3, 0.2, 2]}
            color="#ffd700"
            hoverColor="#ffa000"
            glowColor="#ffeb3b"
            onClick={() => handleObjectClick('home')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Key Layout */}
          <InteractiveObject
            position={[0, 0.11, 0]}
            scale={[2.9, 0.1, 1.7]}
            color="#ffb300"
            hoverColor="#ff8f00"
            glowColor="#ffeb3b"
            onClick={() => handleObjectClick('home')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>
      </group>

      {/* Left Wall Furniture */}
      {/* Filing Cabinet */}
      <group position={[-8, 0, -6]} rotation={[0, Math.PI / 4, 0]}>
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
      <group position={[-7, 0, 3]} rotation={[0, -Math.PI / 2, 0]}>
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
      {/* Couch */}
      <group position={[6, 0, 0]} rotation={[0, -Math.PI /100, 0]}>
        {/* Base */}
        <ToonObject
          geometry={<boxGeometry args={[4, 0.5, 9]} />}
          position={[1, 0.3, 2]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Enhanced Back Rest */}
        <ToonObject
          geometry={<boxGeometry args={[0.9, 5, 10]} />}
          position={[3, 2.5, 1.5]}
          rotation={[Math.PI, 0, 0]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Side Arms */}
        <ToonObject
          geometry={<boxGeometry args={[4, 3, 1]} />}
          position={[1, 2, 6]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        <ToonObject
          geometry={<boxGeometry args={[4, 3, 1]} />}
          position={[1, 2, -3]}
          color={new Color(0.2, 0.4, 0.6)}
          outlineWidth={0.02}
          materialType="fabric"
        />
        {/* Cushions */}
        {[-1, 0, 1].map((x, i) => (
          <ToonObject
            key={`cushion-${i}`}
            geometry={<boxGeometry args={[1.7, 1.2, 8]} />}
            position={[x * 1.8, 1.2, 1.5]}
            color={new Color(0.25, 0.45, 0.65)}
            outlineWidth={0.01}
            materialType="fabric"
          />
        ))}
      </group>

      {/* Plant Corner */}
      <group position={[7, 0, -1]}>
        {/* Plant Pot */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.6, 0.4, 1, 32]} />}
          position={[0, 0.5, 0]}
          color={new Color(0.6, 0.3, 0.2)}
          outlineWidth={0.02}
          materialType="plastic"
        />
        {/* Plant */}
        <ToonObject
          geometry={<sphereGeometry args={[1, 32, 32]} />}
          position={[0, 1.8, 0]}
          color={new Color(0.2, 0.5, 0.3)}
          outlineWidth={0.02}
          materialType="fabric"
        />
      </group>

      {/* Side Table */}
      <group position={[7, 3, -9]}>
        {/* Table Top */}
        <ToonObject
          geometry={<boxGeometry args={[4, 0.1, 4]} />}
          position={[0, 1.5, 2]}
          color={new Color(0.4, 0.2, 0.1)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Table Leg */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.2, 0.2, 5, 8]} />}
          position={[0, -1, 1]}
          color={new Color(0.35, 0.15, 0.05)}
          outlineWidth={0.01}
          materialType="metal"
        />
        {/* Table Base */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />}
          position={[-0, -2.9, 1]}
          color={new Color(0.35, 0.15, 0.05)}
          outlineWidth={0.01}
          materialType="metal"
        />
        {/* Lamp */}
        <group position={[0, 1.55, 2]}>
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

      {/* Wall Decorations */}
      {/* Modern Clock */}
      <group position={[-9.5, 15, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
        {/* Clock Face */}
        <ToonObject
          geometry={<cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />}
          position={[0, 0, 0]}
          color={new Color(0.93, 0.94, 0.95)}
          outlineWidth={0.03}
          materialType="plastic"
        />
        {/* Clock Center and Hands */}
        <ToonObject
          geometry={<cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />}
          position={[0, 0, 0.06]}
          color={new Color(0.17, 0.24, 0.31)}
          outlineWidth={0.01}
          materialType="metal"
        />
        <ToonObject
          geometry={<boxGeometry args={[0.8, 0.08, 0.02]} />}
          position={[-0.4, 0.1, 0]}
          rotation={[0, 0, Math.PI]}
          color={new Color(0.17, 0.24, 0.31)}
          outlineWidth={0.01}
          materialType="metal"
        />
        <ToonObject
          geometry={<boxGeometry args={[1.2, 0.06, 0.02]} />}
          position={[0.5, 0.1, 0]}
          rotation={[0, 0, Math.PI]}
          color={new Color(0.17, 0.24, 0.31)}
          outlineWidth={0.01}
          materialType="metal"
        />
      </group>

      {/* Floating Shelves with Books */}
      <group position={[-8, 11, 1]} rotation={[0, Math.PI / 2, 0]}>
        {/* Upper Shelf */}
        <ToonObject
          geometry={<boxGeometry args={[8, 0.4, 2]} />}
          position={[0, 0, 0]}
          color={new Color(0.29, 0.29, 0.29)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Books on Upper Shelf */}
        {[...Array(6)].map((_, i) => (
          <ToonObject
            key={`book-upper-${i}`}
            geometry={<boxGeometry args={[0.8, 2, 1.5]} />}
            position={[-3 + i * 1, 1, 0]}
            rotation={[0, Math.random() * 0.2 - 0.1, 0]}
            color={new Color(
              0.2 + Math.random() * 0.6,
              0.2 + Math.random() * 0.6,
              0.2 + Math.random() * 0.6
            )}
            outlineWidth={0.01}
            materialType="plastic"
          />
        ))}
        
        {/* Lower Shelf */}
        <ToonObject
          geometry={<boxGeometry args={[6, 0.4, 2]} />}
          position={[0, -4, 0]}
          color={new Color(0.29, 0.29, 0.29)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Books on Lower Shelf */}
        {[...Array(5)].map((_, i) => (
          <ToonObject
            key={`book-lower-${i}`}
            geometry={<boxGeometry args={[0.8, 2, 1.3]} />}
            position={[-2 + i * 1, -2.6, 0]}
            rotation={[0, Math.random() * 0.2 - 0.1, 0]}
            color={new Color(
              [0.25, 0.0, 0.71],  // Blue
              [0.0, 0.59, 0.53],   // Teal
              [1.0, 0.76, 0.03],   // Yellow
              [0.38, 0.49, 0.55],  // Gray
              [0.91, 0.12, 0.39]   // Pink
            )[i]}
            outlineWidth={0.01}
            materialType="plastic"
          />
        ))}
      </group>

      {/* Wall Art and Posters */}
      {/* Art Frame */}
      <group position={[9.5, 8, -2]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Frame */}
        <ToonObject
          geometry={<boxGeometry args={[4, 3, 0.1]} />}
          position={[0, 0, 0]}
          color={new Color(0.17, 0.22, 0.24)}
          outlineWidth={0.02}
          materialType="wood"
        />
        {/* Art Canvas */}
        <ToonObject
          geometry={<boxGeometry args={[3.8, 2.8, 0.05]} />}
          position={[0, 0, 0.06]}
          color={new Color(0.2, 0.27, 0.37)}
          outlineWidth={0.01}
          materialType="fabric"
        />
      </group>

      {/* Posters */}
      <group position={[0, 0, 0]}>
        {/* Poster 1 - Game Art */}
        <ToonObject
          geometry={<planeGeometry args={[5, 5]} />}
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={new Color(0.95, 0.3, 0.3)}
          outlineWidth={0.02}
          materialType="plastic"
        />
      </group>

      <group position={[9.5, 12, 2]}>
        {/* Poster 2 - Tech/Code themed */}
        <ToonObject
          geometry={<planeGeometry args={[4, 3.5]} />}
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          color={new Color(0.3, 0.8, 0.7)}
          outlineWidth={0.02}
          materialType="plastic"
        />
      </group>

      <group position={[-9.5, 12, 7]}>
        {/* Poster 3 - Art/Creative themed */}
        <ToonObject
          geometry={<planeGeometry args={[5, 7]} />}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={new Color(0.27, 0.72, 0.82)}
          outlineWidth={0.02}
          materialType="plastic"
        />
      </group>

      {/* Floor Rug */}
      <ToonObject
        geometry={<planeGeometry args={[12, 8]} />}
        position={[0, 0.02, -4]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.56, 0.27, 0.68)}
        outlineWidth={0.01}
        materialType="fabric"
      />

      {/* Optimized Shadows */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
};

export const Room = ({ setCurrentSection, setContentVisible }) => {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000000' }}>
      <Canvas
        shadows
        camera={{ position: [12, 12, 12], fov: 65 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <RoomScene setCurrentSection={setCurrentSection} setContentVisible={setContentVisible} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            target={[0, 5, -5]}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 3}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
            maxDistance={25}
            minDistance={10}
            zoomSpeed={0.5}
          />
          <Environment 
            preset="night"
            background={false}
          />
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
        </Suspense>
      </Canvas>
    </div>
  );
}; 