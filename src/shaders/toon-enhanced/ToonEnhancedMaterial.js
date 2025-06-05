import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Vector3, Color } from 'three';

// Define shaders as template strings. We have the Vertex and then Fragment shader. 
const vertexShader = `
    precision highp float;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying vec4 vScreenPos;
    varying vec2 vUv;

    uniform float outlineWidth;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        
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
    uniform float softShadowIntensity;
    uniform float colorTransitionSmoothness;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying vec4 vScreenPos;
    varying vec2 vUv;

    // Improved halftone pattern function with smoother transitions
    float halftone(vec2 uv, float intensity) {
        float scale = halftoneScale;
        vec2 pattern = uv * scale;
        vec2 grid = fract(pattern) - 0.5;
        float dist = length(grid);
        return smoothstep(0.0, 0.5, intensity * 0.5 - dist);
    }

    // Soft shadow calculation
    float softShadow(vec3 normal, vec3 lightDir) {
        float NdotL = dot(normal, lightDir);
        return smoothstep(0.0, softShadowIntensity, NdotL);
    }

    // Anime-style color transition
    vec3 animeColorTransition(vec3 baseColor, float intensity) {
        float transition = smoothstep(0.0, colorTransitionSmoothness, intensity);
        vec3 shadowColor = mix(baseColor * 0.5, baseColor, transition);
        return shadowColor;
    }

    void main() {
        vec3 viewDirection = normalize(vViewPosition);
        vec3 lightDir = normalize(lightPosition - vPosition);
        
        // Basic diffuse lighting with soft shadows
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        float softShadow = softShadow(vNormal, lightDir);
        
        // Multi-band cel shading with smoother transitions
        float celShade;
        if (diffuse > 0.8) {
            celShade = 1.0;
        } else if (diffuse > 0.6) {
            celShade = mix(0.8, 1.0, smoothstep(0.6, 0.8, diffuse));
        } else if (diffuse > 0.3) {
            celShade = mix(0.5, 0.8, smoothstep(0.3, 0.6, diffuse));
        } else {
            celShade = mix(0.2, 0.5, smoothstep(0.0, 0.3, diffuse));
        }
        
        // Enhanced specular highlight calculation
        vec3 halfwayDir = normalize(lightDir + viewDirection);
        float specular = pow(max(dot(vNormal, halfwayDir), 0.0), specularShininess);
        float toonSpec = smoothstep(0.5, 0.6, specular) * specularIntensity;
        
        // Improved rim lighting with anime-style edge glow
        float rimDot = 1.0 - max(dot(viewDirection, vNormal), 0.0);
        float rimFactor = smoothstep(0.0, 1.0, pow(rimDot, rimPower)) * rimIntensity;
        
        // Edge detection combining normal and depth
        float normalEdge = length(fwidth(vNormal));
        float depthEdge = length(fwidth(vScreenPos.xyz/vScreenPos.w));
        float edge = smoothstep(0.8, 0.9, max(normalEdge, depthEdge * 10.0));
        
        // Halftone effect for shadows with smoother transitions
        vec2 screenUV = gl_FragCoord.xy / 1000.0;
        float halftonePattern = halftone(screenUV, (1.0 - celShade) * halftoneIntensity);
        celShade = mix(celShade, celShade * halftonePattern, step(celShade, 0.5) * halftoneIntensity);
        
        // Final color calculation with anime-style transitions
        vec3 finalColor;
        if (edge > 0.0) {
            // Outline with slight glow
            finalColor = mix(outlineColor, rimColor, rimFactor * 0.5);
        } else {
            // Base color with all effects
            vec3 baseColor = animeColorTransition(color, celShade);
            finalColor = baseColor * celShade * lightIntensity;
            finalColor += specularColor * toonSpec; // Add specular
            finalColor += rimColor * rimFactor; // Add rim lighting
            finalColor = mix(finalColor, color * 0.2, step(celShade, 0.3) * (1.0 - halftonePattern) * halftoneIntensity);
            
            // Add soft shadow influence
            finalColor = mix(finalColor, finalColor * 0.7, (1.0 - softShadow) * softShadowIntensity);
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
        halftoneIntensity: 0.3,

        // New anime-style properties
        softShadowIntensity: 0.5,
        colorTransitionSmoothness: 0.2
    },
    vertexShader,
    fragmentShader
);

// Extend for use in JSX
extend({ ToonEnhancedMaterial });

export default ToonEnhancedMaterial; 