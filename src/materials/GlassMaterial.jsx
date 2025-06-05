import React from 'react';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Base Glass Material with common properties
export const BaseGlassMaterial = ({ 
  color = new THREE.Color(0.9, 0.95, 1.0),
  opacity = 0.2,
  metalness = 0.1,
  roughness = 0.1,
  transmission = 0.95,
  thickness = 0.5,
  envMapIntensity = 2.0,
  clearcoat = 1.0,
  clearcoatRoughness = 0.1,
  ior = 1.5,
  specularIntensity = 1.0,
  specularColor = new THREE.Color(1.0, 1.0, 1.0),
  reflectivity = 1.0,
  chromaticAberration = 0.5,
  distortion = 0.1,
  distortionScale = 0.5,
  temporalDistortion = 0.1,
  emissive,
  emissiveIntensity = 0.3,
  animated = false
}) => {
  const material = {
    color,
    metalness,
    roughness,
    transmission,
    thickness,
    envMapIntensity,
    clearcoat,
    clearcoatRoughness,
    ior,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    specularIntensity,
    specularColor,
    reflectivity,
    chromaticAberration,
    distortion,
    distortionScale,
    temporalDistortion,
    emissive,
    emissiveIntensity
  };

  if (animated) {
    return <animated.meshPhysicalMaterial {...material} />;
  }
  
  return <meshPhysicalMaterial {...material} />;
};

// Window Glass - Optimized for large transparent surfaces
export const WindowGlass = (props) => {
  return (
    <BaseGlassMaterial
      {...props}
      transmission={0.95}
      opacity={0.2}
      metalness={0.1}
      roughness={0.1}
      envMapIntensity={2.0}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      specularIntensity={1.0}
      chromaticAberration={0.5}
      distortion={0.1}
      distortionScale={0.5}
      temporalDistortion={0.1}
    />
  );
};

// Touch Glass - Optimized for interactive surfaces like phone/tablet screens
export const TouchGlass = (props) => {
  return (
    <BaseGlassMaterial
      {...props}
      transmission={0.6}  // Lower transmission for darker appearance
      opacity={0.95}      // Higher opacity for more solid look
      metalness={0.8}     // Higher metalness for stronger reflections
      roughness={0.1}     // Lower roughness for sharper highlights
      envMapIntensity={2.0} // Stronger environment reflections
      clearcoat={1.0}     // Full clearcoat for glossy finish
      clearcoatRoughness={0.1} // Smooth clearcoat for sharp highlights
      specularIntensity={1.0} // Strong specular highlights
      chromaticAberration={0.2} // Subtle color fringing
      distortion={0.05}   // Minimal distortion
      distortionScale={0.2} // Subtle distortion scale
      temporalDistortion={0.02} // Very subtle temporal distortion
      reflectivity={0.8}  // High reflectivity for strong highlights
    />
  );
};

// Animated Glass - Optimized for dynamic/interactive elements
export const AnimatedGlass = ({ springs, ...props }) => {
  const material = {
    ...props,
    animated: true,
    color: springs?.color || new THREE.Color(0.9, 0.95, 1.0),
    opacity: springs?.opacity || 0.8,  // Increased opacity
    emissive: springs?.emissive || new THREE.Color(0.9, 0.95, 1.0),
    emissiveIntensity: springs?.emissiveIntensity || 0.3,
    transmission: 0.3,  // Reduced transmission
    metalness: 0.1,     // Reduced metalness
    roughness: 0.5,     // Increased roughness
    envMapIntensity: 0.5, // Reduced envMap intensity
    clearcoat: 0.3,     // Reduced clearcoat
    clearcoatRoughness: 0.5, // Increased clearcoat roughness
    specularIntensity: 0.3, // Reduced specular
    chromaticAberration: 0.1, // Reduced chromatic aberration
    distortion: 0.01,   // Reduced distortion
    distortionScale: 0.1, // Reduced distortion scale
    temporalDistortion: 0.01 // Reduced temporal distortion
  };

  return <animated.meshPhysicalMaterial {...material} />;
}; 