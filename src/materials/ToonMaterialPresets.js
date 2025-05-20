import { Color } from 'three';

export const materialPresets = {
  default: {
    rimIntensity: 0.7,
    specularIntensity: 0.3,
    specularShininess: 16.0,
    halftoneIntensity: 0.5,
    outlineWidth: 0.05,
    rimColor: new Color(1.0, 1.0, 1.0)
  },
  wood: {
    rimIntensity: 0.6,
    specularIntensity: 0.2,
    specularShininess: 12.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.8, 0.7)
  },
  metal: {
    rimIntensity: 1.0,
    specularIntensity: 0.8,
    specularShininess: 32.0,
    halftoneIntensity: 0.2,
    outlineWidth: 0.04,
    rimColor: new Color(0.8, 0.8, 1.0)
  },
  fabric: {
    rimIntensity: 0.4,
    specularIntensity: 0.1,
    specularShininess: 8.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.02,
    rimColor: new Color(1.0, 1.0, 1.0)
  },
  glass: {
    rimIntensity: 1.0,
    specularIntensity: 1.0,
    specularShininess: 64.0,
    halftoneIntensity: 0.1,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.95, 1.0)
  },
  plastic: {
    rimIntensity: 0.8,
    specularIntensity: 0.5,
    specularShininess: 24.0,
    halftoneIntensity: 0.4,
    outlineWidth: 0.03,
    rimColor: new Color(1.0, 1.0, 1.0)
  },
  wall: {
    rimIntensity: 0.5,
    specularIntensity: 0.2,
    specularShininess: 16.0,
    halftoneIntensity: 0.6,
    outlineWidth: 0.02,
    rimColor: new Color(0.9, 0.9, 0.95)
  },
  floor: {
    rimIntensity: 0.4,
    specularIntensity: 0.15,
    specularShininess: 12.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.02,
    rimColor: new Color(0.85, 0.8, 0.75)
  },
  // New enhanced presets
  wallEnhanced: {
    rimIntensity: 0.6,
    specularIntensity: 0.3,
    specularShininess: 20.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.03,
    rimColor: new Color(0.95, 0.95, 1.0)
  },
  floorEnhanced: {
    rimIntensity: 0.5,
    specularIntensity: 0.25,
    specularShininess: 16.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.85, 0.8)
  },
  woodEnhanced: {
    rimIntensity: 0.7,
    specularIntensity: 0.3,
    specularShininess: 16.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.04,
    rimColor: new Color(0.95, 0.85, 0.75)
  },
  glassEnhanced: {
    rimIntensity: 1.2,
    specularIntensity: 1.2,
    specularShininess: 96.0,
    halftoneIntensity: 0.15,
    outlineWidth: 0.04,
    rimColor: new Color(1.0, 1.0, 1.0)
  }
};

// Helper function to get material properties
export const getMaterialProperties = (materialType) => {
  return materialPresets[materialType] || materialPresets.default;
}; 