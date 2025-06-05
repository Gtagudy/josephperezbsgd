import React from 'react';
import { ToonObject } from './Room';
import { Color } from 'three';

const ProjectShowcase = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Main showcase frame */}
      <ToonObject
        geometry={<boxGeometry args={[8, 6, 0.5]} />}
        position={[0, 0, -0.5]}
        color={new Color(0.15, 0.15, 0.2)}
        outlineWidth={0.02}
        materialType="metal"
      />
      
      {/* Inner frame with gradient effect */}
      <ToonObject
        geometry={<boxGeometry args={[7.8, 5.8, 0.1]} />}
        position={[0, 0, -0.4]}
        color={new Color(0.2, 0.2, 0.25)}
        outlineWidth={0.01}
        materialType="metal"
      />

      {/* Decorative elements */}
      {/* Top accent */}
      <ToonObject
        geometry={<boxGeometry args={[8.2, 0.2, 0.6]} />}
        position={[0, 3.1, -0.3]}
        color={new Color(0.3, 0.3, 0.4)}
        outlineWidth={0.01}
        materialType="metal"
      />
      
      {/* Bottom accent */}
      <ToonObject
        geometry={<boxGeometry args={[8.2, 0.2, 0.6]} />}
        position={[0, -3.1, -0.3]}
        color={new Color(0.3, 0.3, 0.4)}
        outlineWidth={0.01}
        materialType="metal"
      />

      {/* Side accents */}
      <ToonObject
        geometry={<boxGeometry args={[0.2, 6.2, 0.6]} />}
        position={[4.1, 0, -0.3]}
        color={new Color(0.3, 0.3, 0.4)}
        outlineWidth={0.01}
        materialType="metal"
      />
      <ToonObject
        geometry={<boxGeometry args={[0.2, 6.2, 0.6]} />}
        position={[-4.1, 0, -0.3]}
        color={new Color(0.3, 0.3, 0.4)}
        outlineWidth={0.01}
        materialType="metal"
      />

      {/* Corner accents */}
      {[
        [4.1, 3.1], [-4.1, 3.1],
        [4.1, -3.1], [-4.1, -3.1]
      ].map(([x, y], i) => (
        <ToonObject
          key={`corner-${i}`}
          geometry={<boxGeometry args={[0.4, 0.4, 0.7]} />}
          position={[x, y, -0.3]}
          color={new Color(0.4, 0.4, 0.5)}
          outlineWidth={0.01}
          materialType="metal"
        />
      ))}
    </group>
  );
};

export default ProjectShowcase; 