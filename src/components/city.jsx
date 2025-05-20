import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CityLOD = () => {
  const lodRef = useRef(new THREE.LOD());
  const { camera } = useThree();

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

    return () => {
      lod.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
  }, []);

  useFrame(() => {
    if (lodRef.current && camera) {
      lodRef.current.update(camera);
    }
  });

  return <primitive object={lodRef.current} />;
};

const createBuildingMaterials = (detailLevel) => {
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.1, 0.1, 0.15),
    metalness: 0.2,
    roughness: 0.7,
    emissive: new THREE.Color(0.05, 0.05, 0.1),
    emissiveIntensity: 0.5
  });

  if (detailLevel === 'high') {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.9, 0.9, 0.7),
      emissive: new THREE.Color(0.9, 0.9, 0.7),
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
    
    const buildingGroup = new THREE.Group();
    
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

    if (detailLevel === 'high' && materials.windows) {
      const windowSize = 0.8;
      const windowSpacing = 1.2;
      const windowDepth = 0.1;
      
      const windowsX = Math.floor(width / windowSpacing);
      const windowsY = Math.floor(height / windowSpacing);
      const windowsZ = Math.floor(depth / windowSpacing);
      
      const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, windowDepth);
      
      for (let wx = 0; wx < windowsX; wx++) {
        for (let wy = 0; wy < windowsY; wy++) {
          const frontWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          frontWindow.position.set(
            (wx - windowsX/2 + 0.5) * windowSpacing,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            depth/2 + windowDepth/2
          );
          buildingGroup.add(frontWindow);
          
          const backWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          backWindow.position.set(
            (wx - windowsX/2 + 0.5) * windowSpacing,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            -depth/2 - windowDepth/2
          );
          buildingGroup.add(backWindow);
        }
      }
      
      for (let wz = 0; wz < windowsZ; wz++) {
        for (let wy = 0; wy < windowsY; wy++) {
          const leftWindow = new THREE.Mesh(windowGeometry, materials.windows.clone());
          leftWindow.position.set(
            -width/2 - windowDepth/2,
            (wy - windowsY/2 + 0.5) * windowSpacing,
            (wz - windowsZ/2 + 0.5) * windowSpacing
          );
          leftWindow.rotation.y = Math.PI/2;
          buildingGroup.add(leftWindow);
          
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