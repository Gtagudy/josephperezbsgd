import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Vector3, Color } from 'three';

const vertexShader = `
    precision highp float;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    
    uniform vec3 color;
    uniform vec3 lightPosition;
    uniform float steps;
    uniform float lightIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vec3 lightDirection = normalize(lightPosition - vPosition);
        float intensity = dot(vNormal, lightDirection) * lightIntensity;
        
        // Create smooth steps for cel shading
        intensity = ceil(intensity * steps) / steps;
        
        // Add ambient light to avoid completely dark areas
        float ambient = 0.2;
        intensity = max(intensity, ambient);
        
        vec3 finalColor = color * intensity;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const ToonMaterial = shaderMaterial(
    {
        color: new Color(1.0, 1.0, 1.0),
        lightPosition: new Vector3(0, 10, 10),
        steps: 4.0,
        lightIntensity: 1.0,
    },
    vertexShader,
    fragmentShader
);

// Extend for use in JSX
extend({ ToonMaterial });

export default ToonMaterial; 