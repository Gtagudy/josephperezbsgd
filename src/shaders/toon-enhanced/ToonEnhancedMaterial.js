import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Vector3, Color } from 'three';

// Define shaders as template strings
const vertexShader = `
    precision highp float;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying vec4 vScreenPos;

    uniform float outlineWidth;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        
        // Regular position calculation
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = worldPosition.xyz;
        
        // Calculate view position for rim lighting
        vViewPosition = -worldPosition.xyz;
        
        // For outline - slightly expand the vertex along its normal
        vec3 pos = position + normal * outlineWidth;
        
        // Calculate screen position for depth-based effects
        vec4 screenPos = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vScreenPos = screenPos;
        
        gl_Position = screenPos;
    }
`;

const fragmentShader = `
    precision highp float;

    uniform vec3 color;
    uniform vec3 outlineColor;
    uniform vec3 rimColor;
    uniform vec3 lightPosition;
    uniform vec3 specularColor;
    uniform float steps;
    uniform float lightIntensity;
    uniform float rimPower;
    uniform float rimIntensity;
    uniform float specularIntensity;
    uniform float specularShininess;
    uniform float halftoneScale;
    uniform float halftoneIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying vec4 vScreenPos;

    // Halftone pattern function
    float halftone(vec2 uv, float intensity) {
        float scale = halftoneScale;
        vec2 pattern = uv * scale;
        vec2 grid = fract(pattern) - 0.5;
        float dist = length(grid);
        return step(dist, intensity * 0.5);
    }

    void main() {
        vec3 viewDirection = normalize(vViewPosition);
        vec3 lightDir = normalize(lightPosition - vPosition);
        
        // Basic diffuse lighting
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        
        // Multi-band cel shading
        float celShade;
        if (diffuse > 0.8) {
            celShade = 1.0;
        } else if (diffuse > 0.6) {
            celShade = 0.8;
        } else if (diffuse > 0.3) {
            celShade = 0.5;
        } else {
            celShade = 0.2;
        }
        
        // Specular highlight calculation
        vec3 halfwayDir = normalize(lightDir + viewDirection);
        float specular = pow(max(dot(vNormal, halfwayDir), 0.0), specularShininess);
        float toonSpec = step(0.5, specular) * specularIntensity;
        
        // Rim lighting with smoother falloff
        float rimDot = 1.0 - max(dot(viewDirection, vNormal), 0.0);
        float rimFactor = smoothstep(0.0, 1.0, pow(rimDot, rimPower)) * rimIntensity;
        
        // Edge detection combining normal and depth
        float normalEdge = length(fwidth(vNormal));
        float depthEdge = length(fwidth(vScreenPos.xyz/vScreenPos.w));
        float edge = step(0.8, max(normalEdge, depthEdge * 10.0));
        
        // Halftone effect for shadows
        vec2 screenUV = gl_FragCoord.xy / 1000.0; // Adjust scale as needed
        float halftonePattern = halftone(screenUV, (1.0 - celShade) * halftoneIntensity);
        celShade = mix(celShade, celShade * halftonePattern, step(celShade, 0.5) * halftoneIntensity);
        
        // Final color calculation
        vec3 finalColor;
        if (edge > 0.0) {
            // Outline
            finalColor = outlineColor;
        } else {
            // Base color with all effects
            finalColor = color * celShade * lightIntensity;
            finalColor += specularColor * toonSpec; // Add specular
            finalColor += rimColor * rimFactor; // Add rim lighting
            finalColor = mix(finalColor, color * 0.2, step(celShade, 0.3) * (1.0 - halftonePattern) * halftoneIntensity);
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const ToonEnhancedMaterial = shaderMaterial(
    {
        // Base material properties
        color: new Color(1.0, 1.0, 1.0),
        lightPosition: new Vector3(0, 10, 10),
        steps: 4.0,
        lightIntensity: 1.0,
        
        // Outline properties
        outlineColor: new Color(0.0, 0.0, 0.0),
        outlineWidth: 0.05,
        
        // Rim lighting properties
        rimColor: new Color(1.0, 1.0, 1.0),
        rimPower: 3.0,
        rimIntensity: 0.5,
        
        // Specular properties
        specularColor: new Color(1.0, 1.0, 1.0),
        specularIntensity: 0.5,
        specularShininess: 32.0,
        
        // Halftone properties
        halftoneScale: 100.0,
        halftoneIntensity: 0.3
    },
    vertexShader,
    fragmentShader
);

// Extend for use in JSX
extend({ ToonEnhancedMaterial });

export default ToonEnhancedMaterial; 