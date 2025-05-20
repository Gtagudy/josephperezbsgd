import React from 'react';
import * as THREE from 'three';

export const StreetSystem = () => {
  // Ground level constant - much lower to create more depth
  const GROUND_LEVEL = -15;

  // Create a simple street grid
  const streetGeometry = new THREE.PlaneGeometry(100, 100);
  const streetMaterial = new THREE.MeshStandardMaterial({
    color: '#333333',
    roughness: 0.8,
    metalness: 0.2
  });

  // Create road markings
  const lineGeometry = new THREE.PlaneGeometry(100, 1);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: '#555555',
    roughness: 0.5,
    metalness: 0.1
  });

  // Create sidewalk
  const sidewalkGeometry = new THREE.PlaneGeometry(100, 8);
  const sidewalkMaterial = new THREE.MeshStandardMaterial({
    color: '#444444',
    roughness: 0.9,
    metalness: 0.1
  });

  return (
    <group position={[0, GROUND_LEVEL, 0]}>
      {/* Main street plane */}
      <mesh 
        geometry={streetGeometry} 
        material={streetMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -15]}
      />
      
      {/* Road markings */}
      <mesh 
        geometry={lineGeometry} 
        material={lineMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.1, -15]}
      />
      
      {/* Cross street */}
      <mesh 
        geometry={streetGeometry} 
        material={streetMaterial}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[0, 0, -15]}
      />
      
      {/* Cross street markings */}
      <mesh 
        geometry={lineGeometry} 
        material={lineMaterial}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[0, 0.1, -15]}
      />

      {/* Sidewalks */}
      <mesh 
        geometry={sidewalkGeometry} 
        material={sidewalkMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.2, -15]}
      />
    </group>
  );
}; 