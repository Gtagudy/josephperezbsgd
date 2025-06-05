import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';

// Default camera settings
const DEFAULT_CAMERA_SETTINGS = {
  distance: 12,
  height: 8,
  fov: 45,
  transition: {
    mass: 1,
    tension: 120,
    friction: 20,
    precision: 0.001
  }
};

// Calculate camera position based on target and parameters
const calculateCameraPosition = (target, params) => {
  const { distance, height, angle = 0 } = params;
  return [
    target[0] + Math.cos(angle) * distance,
    target[1] + height,
    target[2] + Math.sin(angle) * distance
  ];
};

const useCameraTransition = (target, params = {}) => {
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

export default useCameraTransition; 