import React, { useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export const CityDebugTools = ({ lodRef }) => {
  const [stats, setStats] = useState({
    currentLevel: 0,
    distance: 0,
    buildingCount: 0,
    memoryUsage: 0
  });
  
  const { camera } = useThree();

  useFrame(() => {
    if (lodRef.current && camera) {
      const distance = camera.position.distanceTo(lodRef.current.position);
      const currentLevel = lodRef.current.getCurrentLevel();
      const buildingCount = lodRef.current.children[currentLevel]?.children.length || 0;
      
      // Estimate memory usage (rough calculation)
      const memoryUsage = buildingCount * 1000; // Rough estimate of memory per building
      
      setStats({
        currentLevel,
        distance: Math.round(distance),
        buildingCount,
        memoryUsage
      });
    }
  });

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <group position={[0, 50, 0]}>
      {/* Debug information */}
      <Text
        position={[0, 0, 0]}
        color="white"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
      >
        {`LOD Level: ${stats.currentLevel}`}
      </Text>
      <Text
        position={[0, -3, 0]}
        color="white"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
      >
        {`Distance: ${stats.distance}m`}
      </Text>
      <Text
        position={[0, -6, 0]}
        color="white"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
      >
        {`Buildings: ${stats.buildingCount}`}
      </Text>
      <Text
        position={[0, -9, 0]}
        color="white"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
      >
        {`Memory: ${Math.round(stats.memoryUsage / 1000)}KB`}
      </Text>

      {/* Visual LOD level indicator */}
      <mesh position={[0, -15, 0]}>
        <boxGeometry args={[10, 2, 10]} />
        <meshStandardMaterial 
          color={stats.currentLevel === 0 ? '#4caf50' : stats.currentLevel === 1 ? '#ff9800' : '#f44336'}
          emissive={stats.currentLevel === 0 ? '#4caf50' : stats.currentLevel === 1 ? '#ff9800' : '#f44336'}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}; 