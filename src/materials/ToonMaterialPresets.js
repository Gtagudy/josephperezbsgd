import { Color } from 'three';

export const materialPresets = {
  default: {
    rimIntensity: 0.7,
    specularIntensity: 0.3,
    specularShininess: 16.0,
    halftoneIntensity: 0.5,
    outlineWidth: 0.05,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.5,
    colorTransitionSmoothness: 0.2
  },
  wood: {
    rimIntensity: 0.6,
    specularIntensity: 0.2,
    specularShininess: 12.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.8, 0.7),
    softShadowIntensity: 0.6,
    colorTransitionSmoothness: 0.3
  },
  metal: {
    rimIntensity: 1.0,
    specularIntensity: 0.8,
    specularShininess: 32.0,
    halftoneIntensity: 0.2,
    outlineWidth: 0.04,
    rimColor: new Color(0.8, 0.8, 1.0),
    softShadowIntensity: 0.4,
    colorTransitionSmoothness: 0.15
  },
  fabric: {
    rimIntensity: 0.4,
    specularIntensity: 0.1,
    specularShininess: 8.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.02,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.7,
    colorTransitionSmoothness: 0.4
  },
  glass: {
    rimIntensity: 1.0,
    specularIntensity: 1.0,
    specularShininess: 64.0,
    halftoneIntensity: 0.1,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.95, 1.0),
    softShadowIntensity: 0.3,
    colorTransitionSmoothness: 0.1
  },
  plastic: {
    rimIntensity: 0.8,
    specularIntensity: 0.5,
    specularShininess: 24.0,
    halftoneIntensity: 0.4,
    outlineWidth: 0.03,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.5,
    colorTransitionSmoothness: 0.25
  },
  wall: {
    rimIntensity: 0.5,
    specularIntensity: 0.2,
    specularShininess: 16.0,
    halftoneIntensity: 0.6,
    outlineWidth: 0.02,
    rimColor: new Color(0.9, 0.9, 0.95),
    softShadowIntensity: 0.6,
    colorTransitionSmoothness: 0.3
  },
  floor: {
    rimIntensity: 0.4,
    specularIntensity: 0.15,
    specularShininess: 12.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.02,
    rimColor: new Color(0.85, 0.8, 0.75),
    softShadowIntensity: 0.7,
    colorTransitionSmoothness: 0.35
  },
  // New enhanced presets
  wallEnhanced: {
    rimIntensity: 0.6,
    specularIntensity: 0.3,
    specularShininess: 20.0,
    halftoneIntensity: 0.7,
    outlineWidth: 0.03,
    rimColor: new Color(0.95, 0.95, 1.0),
    softShadowIntensity: 0.6,
    colorTransitionSmoothness: 0.3
  },
  floorEnhanced: {
    rimIntensity: 0.5,
    specularIntensity: 0.25,
    specularShininess: 16.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.03,
    rimColor: new Color(0.9, 0.85, 0.8),
    softShadowIntensity: 0.7,
    colorTransitionSmoothness: 0.35
  },
  woodEnhanced: {
    rimIntensity: 0.7,
    specularIntensity: 0.3,
    specularShininess: 16.0,
    halftoneIntensity: 0.8,
    outlineWidth: 0.04,
    rimColor: new Color(0.95, 0.85, 0.75),
    softShadowIntensity: 0.6,
    colorTransitionSmoothness: 0.3
  },
  glassEnhanced: {
    rimIntensity: 1.2,
    specularIntensity: 1.2,
    specularShininess: 96.0,
    halftoneIntensity: 0.15,
    outlineWidth: 0.04,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.3,
    colorTransitionSmoothness: 0.1
  },
  // New anime-style presets
  anime: {
    rimIntensity: 0.8,
    specularIntensity: 0.4,
    specularShininess: 24.0,
    halftoneIntensity: 0.3,
    outlineWidth: 0.03,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.6,
    colorTransitionSmoothness: 0.4
  },
  animeSkin: {
    rimIntensity: 0.6,
    specularIntensity: 0.2,
    specularShininess: 16.0,
    halftoneIntensity: 0.4,
    outlineWidth: 0.02,
    rimColor: new Color(1.0, 0.95, 0.9),
    softShadowIntensity: 0.7,
    colorTransitionSmoothness: 0.5
  },
  animeHair: {
    rimIntensity: 1.0,
    specularIntensity: 0.6,
    specularShininess: 32.0,
    halftoneIntensity: 0.2,
    outlineWidth: 0.03,
    rimColor: new Color(1.0, 1.0, 1.0),
    softShadowIntensity: 0.5,
    colorTransitionSmoothness: 0.3
  }
};

// Helper function to get material properties
export const getMaterialProperties = (materialType) => {
  return materialPresets[materialType] || materialPresets.default;
}; 