import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  useHelper,
  MeshDistortMaterial,
  shaderMaterial
} from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { SpotLightHelper, DirectionalLightHelper, Vector3, Color } from 'three';
import * as THREE from 'three';

// Import our toon material
import '../shaders/toon-enhanced/ToonEnhancedMaterial';

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
  halftoneIntensity = 0.3
}) => {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {geometry}
      <toonEnhancedMaterial
        color={color}
        outlineColor={new Color(0.0, 0.0, 0.0)}
        outlineWidth={outlineWidth}
        rimColor={rimColor}
        rimPower={3.0}
        rimIntensity={rimIntensity}
        specularColor={new Color(1.0, 1.0, 1.0)}
        specularIntensity={specularIntensity}
        specularShininess={32.0}
        halftoneScale={100.0}
        halftoneIntensity={halftoneIntensity}
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

const RoomScene = ({ setCurrentSection, setContentVisible }) => {
  const spotLight = useRef();
  const dirLight = useRef();
  const moonLight = useRef();

  // Debug helpers (comment out in production)
  useHelper(spotLight, SpotLightHelper, 'white');
  useHelper(dirLight, DirectionalLightHelper, 1, 'red');

  const handleObjectClick = (section) => {
    setCurrentSection(section);
    setContentVisible(true);
  };

  const createCityBuildings = (offsetX, offsetZ, count = 5) => {
    const buildingColors = [
      new Color(0.04, 0.07, 0.10),  // Darkest
      new Color(0.08, 0.12, 0.16),  // Dark
      new Color(0.11, 0.16, 0.20),  // Medium
      new Color(0.13, 0.19, 0.24),  // Light
      new Color(0.16, 0.22, 0.28)   // Lightest
    ];

    const buildings = [];
    for (let i = 0; i < count; i++) {
      const height = Math.random() * 60 + 30;
      const width = Math.random() * 6 + 6;
      const depth = Math.random() * 6 + 6;
      const x = (Math.random() - 0.5) * 40 + offsetX;
      const z = (Math.random() - 0.5) * 40 + offsetZ;
      
      const colorIndex = Math.floor(Math.random() * buildingColors.length);
      
      buildings.push(
        <ToonObject
          key={`building-${offsetX}-${offsetZ}-${i}`}
          geometry={<boxGeometry args={[width, height, depth]} />}
          position={[x, -20, z]}
          color={buildingColors[colorIndex]}
          outlineWidth={0.03}
          rimIntensity={0.3}
          specularIntensity={0.2}
          halftoneIntensity={0.2}
        />
      );
    }
    return buildings;
  };

  return (
    <>
      {/* Moon and Moonlight */}
      <Moon />
      <directionalLight
        ref={moonLight}
        position={[-80, 60, -120]}
        intensity={0.2}
        color="#E6E6FA"
        castShadow
      />

      {/* Building Structure */}
      {/* Building Exterior - Front */}
      <ToonObject
        geometry={<boxGeometry args={[20, 150, 0.5]} />}
        position={[0, -75.5, 9.5]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
      />

      {/* Building Exterior - Left Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 21]} />}
        position={[-10.5, -75, -0.7]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
      />

      {/* Building Exterior - Right Side */}
      <ToonObject
        geometry={<boxGeometry args={[0.5, 150, 21]} />}
        position={[9.6, -75.5, 0]}
        color={new Color(0.17, 0.24, 0.31)}
        outlineWidth={0.02}
      />

      {/* Floor */}
      <ToonObject
        geometry={<boxGeometry args={[20, 20, 0.2]} />}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.24, 0.15, 0.14)}
        outlineWidth={0.01}
      />

      {/* Roof */}
      <ToonObject
        geometry={<boxGeometry args={[20, 20, 0.4]} />}
        position={[0, 20, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.17, 0.09, 0.06)}
        outlineWidth={0.01}
      />

      {/* Back Wall with Window */}
      <group position={[0, 10, -10]}>
        {/* Wall Sections */}
        <ToonObject
          geometry={<boxGeometry args={[20, 12, 0.6]} />}
          position={[0, 10.4, 0]}
          color={new Color(0.83, 0.33, 0)}
          outlineWidth={0.02}
        />
        <ToonObject
          geometry={<boxGeometry args={[20, 12, 0.6]} />}
          position={[0, -10.4, 0]}
          color={new Color(0.83, 0.33, 0)}
          outlineWidth={0.02}
        />
        <ToonObject
          geometry={<boxGeometry args={[5, 16, 0.6]} />}
          position={[-7.5, 0, 0]}
          color={new Color(0.83, 0.33, 0)}
          outlineWidth={0.02}
        />
        <ToonObject
          geometry={<boxGeometry args={[5, 15, 0.6]} />}
          position={[7.5, 0, 0]}
          color={new Color(0.83, 0.33, 0)}
          outlineWidth={0.02}
        />

        {/* Window Frame */}
        <group position={[0, 0, 0.3]}>
          {[
            { pos: [0, 4.1, 0], size: [10.2, 0.4, 0.4] },
            { pos: [0, -4.1, 0], size: [10.2, 0.4, 0.4] },
            { pos: [-5.1, 0, 0], size: [0.4, 8.2, 0.4] },
            { pos: [5.1, 0, 0], size: [0.4, 8.2, 0.4] },
            { pos: [0, 0, 0], size: [0.3, 8.2, 0.3] },
            { pos: [0, 0, 0], size: [10.2, 0.3, 0.3] }
          ].map((frame, idx) => (
            <ToonObject
              key={`window-frame-${idx}`}
              geometry={<boxGeometry args={frame.size} />}
              position={frame.pos}
              color={new Color(0.545, 0.271, 0.075)}
              outlineWidth={0.01}
              specularIntensity={0.3}
            />
          ))}
        </group>
      </group>

      {/* Side Wall (thicker) */}
      <ToonObject
        geometry={<boxGeometry args={[20, 20, 0.6]} />}
        position={[-9.9, 10, 0]}
        rotation={[0, Math.PI / 2, 0]}
        color={new Color(0.83, 0.33, 0)}
        outlineWidth={0.02}
      />

      {/* City Buildings */}
      {createCityBuildings(0, -50, 8)}  // Central cluster
      {createCityBuildings(-30, -50, 6)}  // Left cluster
      {createCityBuildings(30, -50, 6)}  // Right cluster
      {createCityBuildings(0, -70, 7)}  // Far cluster
      {createCityBuildings(-50, 10, 5)}  // Far left
      {createCityBuildings(-45, -30, 4)}  // Near left
      {createCityBuildings(-50, -60, 6)}  // Deep left
      {createCityBuildings(60, 10, 5)}   // Far right
      {createCityBuildings(45, -30, 4)}   // Near right
      {createCityBuildings(50, -60, 6)}   // Deep right

      {/* Desk Group - Positioned near window but inside room */}
      <group position={[0, 0, 0]}>  {/* Adjusted Z position to be inside room */}
        {/* Table/Desk */}
        <ToonObject
          geometry={<boxGeometry args={[10, 0.3, 5]} />}
          position={[0, 3, -8]}
          color={new Color(0.545, 0.271, 0.075)}
          outlineWidth={0.02}
          specularIntensity={0.3}
        />
        
        {/* Table/Desk Legs */}
        {[
          [-4.8, 1.5, -9.2],  // Adjusted leg positions relative to desk
          [4.8, 1.5, -9.2],
          [-4.8, 1.5, -6.8],
          [4.8, 1.5, -6.8]
        ].map((pos, idx) => (
          <ToonObject
            key={`desk-leg-${idx}`}
            geometry={<boxGeometry args={[0.3, 3, 0.3]} />}
            position={pos}
            color={new Color(0.545, 0.271, 0.075)}
            outlineWidth={0.02}
            specularIntensity={0.3}
          />
        ))}

        {/* Interactive Objects */}
        {/* Laptop - Projects */}
        <group position={[0, 3.4, -9]} rotation={[-0.1, 0, 0]}>
          {/* Screen */}
          <InteractiveObject
            position={[0, 0.8, 0]}
            scale={[2.5, 1.5, 0.1]}
            color="#2196f3"
            hoverColor="#1976d2"
            glowColor="#64b5f6"
            onClick={() => handleObjectClick('projects')}
          >
            <boxGeometry />
          </InteractiveObject>
          {/* Base */}
          <InteractiveObject
            position={[0, 0, 0.6]}
            scale={[2.5, 0.1, 1]}
            color="#1976d2"
            hoverColor="#1565c0"
            glowColor="#64b5f6"
            onClick={() => handleObjectClick('projects')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>

        {/* Phone - Contact */}
        <group position={[2.8, 4, -8]} rotation={[-0.5, 0, Math.PI / 2]}>
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
        <group position={[-3, 3.4, -7]} rotation={[-0.4, 0.5, 0]}>
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
        <group position={[0, 3.4, -7]}>
          {/* Keyboard Base */}
          <InteractiveObject
            position={[0, 0, 0]}
            scale={[2.2, 0.2, 1]}
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
            scale={[2.1, 0.1, 0.9]}
            color="#ffb300"
            hoverColor="#ff8f00"
            glowColor="#ffeb3b"
            onClick={() => handleObjectClick('home')}
          >
            <boxGeometry />
          </InteractiveObject>
        </group>
      </group>

      {/* Wall Decorations */}
      <group>
        {/* Modern Clock */}
        <group position={[-9.5, 15, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
          {/* Clock Face */}
          <ToonObject
            geometry={<cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />}
            position={[0, 0, 0]}
            color={new Color(0.93, 0.94, 0.95)}
            outlineWidth={0.03}
          />
          {/* Clock Center and Hands */}
          <ToonObject
            geometry={<cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />}
            position={[0, 0, 0.06]}
            color={new Color(0.17, 0.24, 0.31)}
            outlineWidth={0.01}
          />
          <ToonObject
            geometry={<boxGeometry args={[0.8, 0.08, 0.02]} />}
            position={[-0.4, 0.1, 0]}
            rotation={[0, 0, Math.PI]}
            color={new Color(0.17, 0.24, 0.31)}
            outlineWidth={0.01}
          />
          <ToonObject
            geometry={<boxGeometry args={[1.2, 0.06, 0.02]} />}
            position={[0.5, 0.1, 0]}
            rotation={[0, 0, Math.PI]}
            color={new Color(0.17, 0.24, 0.31)}
            outlineWidth={0.01}
          />
        </group>

        {/* Floating Shelves with Books */}
        <group position={[-9.5, 8, -5]} rotation={[0, Math.PI / 2, 0]}>
          {/* Upper Shelf */}
          <ToonObject
            geometry={<boxGeometry args={[4, 0.2, 1]} />}
            position={[0, 0, 0]}
            color={new Color(0.29, 0.29, 0.29)}
            outlineWidth={0.02}
          />
          {/* Books on Upper Shelf */}
          {[...Array(6)].map((_, i) => (
            <ToonObject
              key={`book-upper-${i}`}
              geometry={<boxGeometry args={[0.4, 1.2, 0.8]} />}
              position={[-1.5 + i * 0.5, 0.7, 0]}
              rotation={[0, Math.random() * 0.2 - 0.1, 0]}  // Slight random rotation
              color={new Color(
                0.2 + Math.random() * 0.6,
                0.2 + Math.random() * 0.6,
                0.2 + Math.random() * 0.6
              )}
              outlineWidth={0.01}
            />
          ))}
          
          {/* Lower Shelf */}
          <ToonObject
            geometry={<boxGeometry args={[4, 0.2, 1]} />}
            position={[0, -2, 0]}
            color={new Color(0.29, 0.29, 0.29)}
            outlineWidth={0.02}
          />
          {/* Books on Lower Shelf */}
          {[...Array(5)].map((_, i) => (
            <ToonObject
              key={`book-lower-${i}`}
              geometry={<boxGeometry args={[0.4, 1.2, 0.8]} />}
              position={[-1.0 + i * 0.5, -1.3, 0]}
              rotation={[0, Math.random() * 0.2 - 0.1, 0]}  // Slight random rotation
              color={new Color(
                [0.25, 0.0, 0.71],  // Blue
                [0.0, 0.59, 0.53],   // Teal
                [1.0, 0.76, 0.03],   // Yellow
                [0.38, 0.49, 0.55],  // Gray
                [0.91, 0.12, 0.39]   // Pink
              )[i]}
              outlineWidth={0.01}
            />
          ))}
        </group>

        {/* Wall Art */}
        <group position={[9.5, 8, -2]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Frame */}
          <ToonObject
            geometry={<boxGeometry args={[4, 3, 0.1]} />}
            position={[9.5, 8, -2]}
            rotation={[0, -Math.PI / 2, 0]}
            color={new Color(0.17, 0.22, 0.24)}
          />
          {/* Art Canvas */}
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[3.8, 2.8, 0.05]} />
            <meshStandardMaterial 
              color="#34495e"
              emissive="#3498db"
              emissiveIntensity={0.2}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Posters */}
        <group position={[9.5, 12, -5]}>
          {/* Poster 1 */}
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3, 4]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
        </group>

        <group position={[9.5, 12, 2]}>
          {/* Poster 2 */}
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[2.5, 3.5]} />
            <meshStandardMaterial color="#4ecdc4" />
          </mesh>
        </group>

        <group position={[-9.5, 12, 5]}>
          {/* Poster 3 */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3, 4]} />
            <meshStandardMaterial color="#45b7d1" />
          </mesh>
        </group>
      </group>

      {/* Floor Rug - Raised slightly */}
      <ToonObject
        geometry={<planeGeometry args={[12, 8]} />}
        position={[0, 0.02, -4]}  // Raised slightly
        rotation={[-Math.PI / 2, 0, 0]}
        color={new Color(0.56, 0.27, 0.68)}  // #8e44ad in RGB
        outlineWidth={0.01}
        specularIntensity={0.1}
        halftoneIntensity={0.2}
      />

      {/* Backpack */}
      <group position={[-4, 0.8, -7]}>
        {/* Main body */}
        <mesh>
          <boxGeometry args={[2, 2.5, 1]} />
          <meshStandardMaterial color="#34495e" roughness={0.9} />
        </mesh>
        {/* Front pocket */}
        <mesh position={[0, -0.5, 0.6]}>
          <boxGeometry args={[1.5, 1.2, 0.3]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} />
        </mesh>
        {/* Straps */}
        <mesh position={[-0.7, 0, -0.2]}>
          <boxGeometry args={[0.2, 2, 0.1]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} />
        </mesh>
        <mesh position={[0.7, 0, -0.2]}>
          <boxGeometry args={[0.2, 2, 0.1]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} />
        </mesh>
      </group>

      {/* Additional Window */}
      <group position={[9.5, 10, 0]}>
        {/* Window Frame */}
        <mesh>
          <boxGeometry args={[0.5, 6, 4]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} />
        </mesh>
        {/* Glass */}
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.1, 5.5, 3.5]} />
          <meshStandardMaterial 
            color="#a5d8ff" 
            transparent={true} 
            opacity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Right Wall (Half Height) */}
      <mesh position={[9.9, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 10, 0.6]} />
        <meshStandardMaterial 
          color="#d35400" 
          roughness={0.7}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      
      <spotLight
        ref={spotLight}
        position={[0, 15, -5]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={0.5}
        castShadow={false}
      />

      <directionalLight
        ref={dirLight}
        position={[10, 10, 5]}
        intensity={0.4}
        castShadow={false}
      />
    </>
  );
};

export const Room = ({ setCurrentSection, setContentVisible }) => {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000000' }}>
      <Canvas shadows camera={{ position: [12, 12, 12], fov: 65 }}>
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
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}; 