import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { LOD, Group, Mesh } from 'three';
import { createCityBuildings } from './BuildingGenerator';
import { CityErrorBoundary } from './ErrorBoundary';
import { CityLoadingState } from './LoadingState';
import { CityDebugTools } from './DebugTools';
import { StreetSystem } from './StreetSystem';

// Ground level constant - much lower to create more depth
const GROUND_LEVEL = -15;

// Define building positions in three distinct areas
const BUILDING_POSITIONS = [
  // Left area - outside room
  { x: -35, z: -15, size: 2 },
  
  // Right area - outside room
  { x: 35, z: -15, size: 2 },
  
  // Back area - along the street
  { x: -20, z: -25, size: 2 },
  { x: 20, z: -25, size: 2 },
];

// Define background building positions
const BACKGROUND_POSITIONS = [
  // Far left background
  { x: -60, z: -45, size: 1 },
  
  // Far right background
  { x: 60, z: -45, size: 1 },
  
  // Far back background
  { x: -40, z: -65, size: 1 },
  { x: 40, z: -65, size: 1 },
];

export const CityLOD = () => {
  const lodRef = useRef();
  const [lodInitialized, setLodInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { camera } = useThree();

  // LOD setup with proper cleanup
  useEffect(() => {
    setIsLoading(true);
    
    if (!lodRef.current) {
      lodRef.current = new LOD();
    }

    const lod = lodRef.current;
    
    // Clear existing levels
    while(lod.children.length > 0) {
      const child = lod.children[0];
      child.traverse(object => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      lod.remove(child);
    }

    // Create high detail group - only for close buildings
    const highDetailGroup = new Group();
    BUILDING_POSITIONS.forEach(({ x, z, size }) => {
      createCityBuildings(x, z, size, 'high').forEach(building => {
        // Ensure building sits on ground level
        building.position.y = GROUND_LEVEL;
        // Add frustum culling
        building.frustumCulled = true;
        highDetailGroup.add(building);
      });
    });
    lod.addLevel(highDetailGroup, 0);

    // Create medium detail group - for mid-range buildings
    const mediumDetailGroup = new Group();
    BUILDING_POSITIONS.forEach(({ x, z, size }) => {
      createCityBuildings(x, z, size, 'medium').forEach(building => {
        building.position.y = GROUND_LEVEL;
        building.frustumCulled = true;
        mediumDetailGroup.add(building);
      });
    });
    lod.addLevel(mediumDetailGroup, 50);

    // Create low detail group - for far buildings and background
    const lowDetailGroup = new Group();
    
    // Add main buildings in low detail
    BUILDING_POSITIONS.forEach(({ x, z, size }) => {
      createCityBuildings(x, z, size, 'low').forEach(building => {
        building.position.y = GROUND_LEVEL;
        building.frustumCulled = true;
        lowDetailGroup.add(building);
      });
    });
    
    // Add background buildings in low detail
    BACKGROUND_POSITIONS.forEach(({ x, z, size }) => {
      createCityBuildings(x, z, size, 'low').forEach(building => {
        building.position.y = GROUND_LEVEL;
        building.frustumCulled = true;
        lowDetailGroup.add(building);
      });
    });
    
    lod.addLevel(lowDetailGroup, 100);

    setLodInitialized(true);
    setIsLoading(false);

    return () => {
      lod.traverse(child => {
        if (child instanceof Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
  }, []);

  // Update LOD based on camera distance
  useFrame(() => {
    if (lodRef.current && camera) {
      lodRef.current.update(camera);
    }
  });

  return (
    <CityErrorBoundary>
      {isLoading ? (
        <CityLoadingState />
      ) : (
        <>
          <StreetSystem />
          <primitive object={lodRef.current} />
          <CityDebugTools lodRef={lodRef} />
        </>
      )}
    </CityErrorBoundary>
  );
}; 