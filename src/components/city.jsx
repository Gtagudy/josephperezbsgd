import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CityLOD = () => {
  const lodRef = useRef(new THREE.LOD());
  const { camera } = useThree();

  // Create shared geometries and materials
  const { buildingGeometry, windowGeometry, materials } = useMemo(() => ({
    buildingGeometry: new THREE.BoxGeometry(1, 1, 1),
    windowGeometry: new THREE.BoxGeometry(0.8, 0.8, 0.1),
    materials: {
      base: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.1, 0.1, 0.15),
        metalness: 0.2,
        roughness: 0.7,
        emissive: new THREE.Color(0.05, 0.05, 0.1),
        emissiveIntensity: 0.5
      }),
      windows: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.9, 0.9, 0.7),
        emissive: new THREE.Color(0.9, 0.9, 0.7),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      })
    }
  }), []);

  useEffect(() => {
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

    // Create high detail group with instancing
    const highDetailGroup = new THREE.Group();
    const highDetailBuildings = createInstancedBuildings(0, -50, 8, 'high', buildingGeometry, windowGeometry, materials);
    highDetailGroup.add(highDetailBuildings);
    lod.addLevel(highDetailGroup, 0);

    // Create medium detail group with instancing
    const mediumDetailGroup = new THREE.Group();
    const mediumDetailBuildings = createInstancedBuildings(0, -70, 7, 'medium', buildingGeometry, windowGeometry, materials);
    mediumDetailGroup.add(mediumDetailBuildings);
    lod.addLevel(mediumDetailGroup, 50);

    // Create low detail group with instancing
    const lowDetailGroup = new THREE.Group();
    const lowDetailBuildings = createInstancedBuildings(-45, -30, 4, 'low', buildingGeometry, windowGeometry, materials);
    lowDetailGroup.add(lowDetailBuildings);
    lod.addLevel(lowDetailGroup, 100);

    return () => {
      lod.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
  }, [buildingGeometry, windowGeometry, materials]);

  useFrame(() => {
    if (lodRef.current && camera) {
      lodRef.current.update(camera);
    }
  });

  return <primitive object={lodRef.current} />;
};

const createInstancedBuildings = (offsetX, offsetZ, count, detailLevel, buildingGeometry, windowGeometry, materials) => {
  const group = new THREE.Group();
  const dummy = new THREE.Object3D();
  
  // Create instanced mesh for buildings
  const buildingMesh = new THREE.InstancedMesh(
    buildingGeometry,
    materials.base,
    count
  );
  
  // Create instanced mesh for windows if high detail
  let windowMesh;
  if (detailLevel === 'high') {
    windowMesh = new THREE.InstancedMesh(
      windowGeometry,
      materials.windows,
      count * 4 // Assuming 4 sides with windows
    );
  }

  // Generate building positions and scales
  for (let i = 0; i < count; i++) {
    const height = Math.random() * 60 + 30;
    const width = Math.random() * 6 + 6;
    const depth = Math.random() * 6 + 6;
    const x = (Math.random() - 0.5) * 40 + offsetX;
    const z = (Math.random() - 0.5) * 40 + offsetZ;
    
    // Set building transform
    dummy.position.set(x, -20, z);
    dummy.scale.set(width, height, depth);
    dummy.updateMatrix();
    buildingMesh.setMatrixAt(i, dummy.matrix);
    
    // Set window transforms if high detail
    if (detailLevel === 'high' && windowMesh) {
      const windowSpacing = 1.2;
      const windowsX = Math.floor(width / windowSpacing);
      const windowsY = Math.floor(height / windowSpacing);
      
      // Front windows
      for (let wx = 0; wx < windowsX; wx++) {
        for (let wy = 0; wy < windowsY; wy++) {
          dummy.position.set(
            x + (wx - windowsX/2 + 0.5) * windowSpacing,
            -20 + (wy - windowsY/2 + 0.5) * windowSpacing,
            z + depth/2 + 0.05
          );
          dummy.updateMatrix();
          windowMesh.setMatrixAt(i * 4 + wx * windowsY + wy, dummy.matrix);
        }
      }
    }
  }
  
  group.add(buildingMesh);
  if (windowMesh) group.add(windowMesh);
  
  return group;
}; 