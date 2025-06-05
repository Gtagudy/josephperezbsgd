import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import { OrbitControls } from '@react-three/drei';

// Default camera settings
const DEFAULT_CAMERA_SETTINGS = {
  distance: 12, // Default distance from target
  height: 8,    // Default height above target
  fov: 45,      // Default field of view
  transition: {
    mass: 1,
    tension: 120,
    friction: 20,
    precision: 0.001
  }
};

// Calculate camera position based on target and parameters
const calculateCameraPosition = (target, params = {}) => {
  const {
    distance = DEFAULT_CAMERA_SETTINGS.distance,
    height = DEFAULT_CAMERA_SETTINGS.height,
    angle = 0 // Angle in radians from the front
  } = params;

  return [
    target[0] + Math.sin(angle) * distance,
    target[1] + height,
    target[2] + Math.cos(angle) * distance
  ];
};

export const useCameraTransition = (target, params = {}) => {
  const { camera } = useThree();
  const prevTargetRef = useRef(target);
  const isInitialMount = useRef(true);

  // Merge default settings with provided parameters
  const settings = {
    ...DEFAULT_CAMERA_SETTINGS,
    ...params,
    transition: {
      ...DEFAULT_CAMERA_SETTINGS.transition,
      ...(params.transition || {})
    }
  };

  // Calculate camera position based on target and parameters
  const cameraPosition = calculateCameraPosition(target, settings);

  // Animate camera position and target
  const { position, lookAt } = useSpring({
    position: cameraPosition,
    lookAt: target,
    config: settings.transition,
    immediate: isInitialMount.current
  });

  // Update camera on each frame
  useFrame(() => {
    if (!isInitialMount.current) {
      camera.position.set(
        position.get()[0],
        position.get()[1],
        position.get()[2]
      );
      camera.lookAt(
        lookAt.get()[0],
        lookAt.get()[1],
        lookAt.get()[2]
      );
      camera.fov = settings.fov;
      camera.updateProjectionMatrix();
    }
  });

  // Set initial camera position
  useEffect(() => {
    if (isInitialMount.current) {
      camera.position.set(...cameraPosition);
      camera.lookAt(...target);
      camera.fov = settings.fov;
      camera.updateProjectionMatrix();
      isInitialMount.current = false;
    }
    prevTargetRef.current = target;
  }, [camera, target, cameraPosition, settings.fov]);

  return { position, lookAt };
};

export const CameraController = ({ 
  target = [0, 0, 0],
  params = {},
  children 
}) => {
  const controlsRef = useRef();
  const { position, lookAt } = useCameraTransition(target, params);

  // Calculate initial camera position
  const initialPosition = calculateCameraPosition(target, params);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 2.5}
      maxAzimuthAngle={Math.PI / 4}
      minAzimuthAngle={-Math.PI / 4}
      maxDistance={50}
      minDistance={8}
      zoomSpeed={0.5}
      rotateSpeed={0.5}
      target={[lookAt.get()[0], lookAt.get()[1], lookAt.get()[2]]}
      position={[position.get()[0], position.get()[1], position.get()[2]]}
      makeDefault
    >
      {children}
    </OrbitControls>
  );
};

// Example usage:
/*
const MyComponent = () => {
  const target = [6, 8, -10]; // Target position
  const params = {
    distance: 15,    // Custom distance
    height: 10,      // Custom height
    angle: Math.PI/4, // Custom angle
    fov: 50,         // Custom FOV
    transition: {    // Custom transition settings
      tension: 100,
      friction: 15
    }
  };

  return (
    <CameraController target={target} params={params}>
      {/* Your scene content }
    </CameraController>
  );
};
*/