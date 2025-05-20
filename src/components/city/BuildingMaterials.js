import { Color } from 'three';

export const createBuildingMaterials = (detailLevel) => {
  const baseMaterial = {
    color: new Color(0.1, 0.1, 0.15),
    metalness: 0.2,
    roughness: 0.7,
    emissive: new Color(0.05, 0.05, 0.1),
    emissiveIntensity: 0.5
  };

  if (detailLevel === 'high') {
    return {
      base: baseMaterial,
      windows: {
        color: new Color(0.9, 0.9, 0.7),
        emissive: new Color(0.9, 0.9, 0.7),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      }
    };
  }

  return { base: baseMaterial };
};

export const getBuildingColors = () => ({
  modern: new Color(0.2, 0.2, 0.25),
  classic: new Color(0.3, 0.2, 0.15),
  glass: new Color(0.8, 0.8, 0.9),
  industrial: new Color(0.15, 0.15, 0.15)
}); 