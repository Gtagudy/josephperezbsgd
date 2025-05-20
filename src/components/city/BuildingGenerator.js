import { Group, BoxGeometry, MeshStandardMaterial, Color, Mesh } from 'three';

// Define building presets with fixed dimensions
const BUILDING_PRESETS = [
  // Main buildings (closer to the room)
  {
    width: 8,
    height: 40,
    depth: 8,
    color: new Color(0.1, 0.1, 0.15),
    windowColor: new Color(0.9, 0.9, 0.7)
  },
  {
    width: 10,
    height: 35,
    depth: 10,
    color: new Color(0.15, 0.15, 0.2),
    windowColor: new Color(0.95, 0.95, 0.8)
  },
  {
    width: 12,
    height: 45,
    depth: 12,
    color: new Color(0.12, 0.12, 0.17),
    windowColor: new Color(0.85, 0.85, 0.65)
  },
  // Background buildings (further away)
  {
    width: 6,
    height: 30,
    depth: 6,
    color: new Color(0.08, 0.08, 0.12),
    windowColor: new Color(0.8, 0.8, 0.6)
  },
  {
    width: 7,
    height: 25,
    depth: 7,
    color: new Color(0.1, 0.1, 0.14),
    windowColor: new Color(0.9, 0.9, 0.7)
  }
];

// Create materials for buildings with different detail levels
const createBuildingMaterials = (detailLevel) => {
  const baseMaterial = new MeshStandardMaterial({
    metalness: 0.2,
    roughness: 0.7,
    emissive: new Color(0.05, 0.05, 0.1),
    emissiveIntensity: 0.5
  });

  if (detailLevel === 'high') {
    const windowMaterial = new MeshStandardMaterial({
      emissive: new Color(0.9, 0.9, 0.7),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    return { base: baseMaterial, windows: windowMaterial };
  }

  return { base: baseMaterial };
};

// Create a single building with the given preset
export const createBuilding = (preset, materials, detailLevel) => {
  const buildingGroup = new Group();
  
  // Main building structure
  const building = new Mesh(
    new BoxGeometry(
      preset.width, 
      preset.height, 
      preset.depth,
      detailLevel === 'high' ? 2 : 1,
      detailLevel === 'high' ? 2 : 1,
      detailLevel === 'high' ? 2 : 1
    ),
    materials.base.clone()
  );
  
  building.material.color = preset.color;
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
    const windowsX = Math.floor(preset.width / windowSpacing);
    const windowsY = Math.floor(preset.height / windowSpacing);
    const windowsZ = Math.floor(preset.depth / windowSpacing);
    
    // Create window geometry
    const windowGeometry = new BoxGeometry(windowSize, windowSize, windowDepth);
    
    // Add windows to each face
    for (let wx = 0; wx < windowsX; wx++) {
      for (let wy = 0; wy < windowsY; wy++) {
        // Front face
        const frontWindow = new Mesh(windowGeometry, materials.windows.clone());
        frontWindow.material.color = preset.windowColor;
        frontWindow.position.set(
          (wx - windowsX/2 + 0.5) * windowSpacing,
          (wy - windowsY/2 + 0.5) * windowSpacing,
          preset.depth/2 + windowDepth/2
        );
        buildingGroup.add(frontWindow);
        
        // Back face
        const backWindow = new Mesh(windowGeometry, materials.windows.clone());
        backWindow.material.color = preset.windowColor;
        backWindow.position.set(
          (wx - windowsX/2 + 0.5) * windowSpacing,
          (wy - windowsY/2 + 0.5) * windowSpacing,
          -preset.depth/2 - windowDepth/2
        );
        buildingGroup.add(backWindow);
      }
    }
    
    // Side windows
    for (let wz = 0; wz < windowsZ; wz++) {
      for (let wy = 0; wy < windowsY; wy++) {
        // Left face
        const leftWindow = new Mesh(windowGeometry, materials.windows.clone());
        leftWindow.material.color = preset.windowColor;
        leftWindow.position.set(
          -preset.width/2 - windowDepth/2,
          (wy - windowsY/2 + 0.5) * windowSpacing,
          (wz - windowsZ/2 + 0.5) * windowSpacing
        );
        leftWindow.rotation.y = Math.PI/2;
        buildingGroup.add(leftWindow);
        
        // Right face
        const rightWindow = new Mesh(windowGeometry, materials.windows.clone());
        rightWindow.material.color = preset.windowColor;
        rightWindow.position.set(
          preset.width/2 + windowDepth/2,
          (wy - windowsY/2 + 0.5) * windowSpacing,
          (wz - windowsZ/2 + 0.5) * windowSpacing
        );
        rightWindow.rotation.y = Math.PI/2;
        buildingGroup.add(rightWindow);
      }
    }
  }
  
  return buildingGroup;
};

// Create buildings at specified positions
export const createCityBuildings = (offsetX, offsetZ, count = 1, detailLevel = 'high') => {
  const buildings = [];
  const materials = createBuildingMaterials(detailLevel);
  
  // Use a preset based on the position
  const preset = BUILDING_PRESETS[Math.floor(Math.random() * BUILDING_PRESETS.length)];
  
  // Create building
  const building = createBuilding(preset, materials, detailLevel);
  building.position.set(offsetX, 0, offsetZ);
  buildings.push(building);

  return buildings;
}; 