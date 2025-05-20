import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getBuildingColors } from './BuildingMaterials';

export const BackgroundCity = () => {
  const instancedMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Create a single instanced mesh for all background buildings
  const { instancedMesh, buildingCount } = useMemo(() => {
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: '#424242',
        emissive: '#424242',
        emissiveIntensity: 0.2,
        roughness: 0.8,
        metalness: 0.2
      }),
      1000 // Maximum number of buildings
    );
    
    // Generate building positions and scales
    const positions = [];
    const scales = [];
    const colors = getBuildingColors();
    
    for (let i = 0; i < 1000; i++) {
      // Create a grid of buildings in the background
      const x = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      
      // Only place buildings in a ring around the center
      if (Math.sqrt(x * x + z * z) > 200) {
        const height = 10 + Math.random() * 40;
        const width = 5 + Math.random() * 10;
        const depth = 5 + Math.random() * 10;
        
        // Set position and scale
        dummy.position.set(x, height / 2, z);
        dummy.scale.set(width, height, depth);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        
        // Set building color
        const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
        mesh.setColorAt(i, color);
        
        positions.push({ x, y: height / 2, z });
        scales.push({ x: width, y: height, z: depth });
      }
    }
    
    return { instancedMesh: mesh, buildingCount: positions.length };
  }, []);

  return (
    <primitive 
      object={instancedMesh} 
      ref={instancedMeshRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}; 