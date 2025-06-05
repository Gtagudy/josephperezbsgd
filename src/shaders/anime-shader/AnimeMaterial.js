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

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        
        // Regular position calculation
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = worldPosition.xyz;
        
        // Calculate view position for rim lighting
        vViewPosition = -worldPosition.xyz;
        
        // Calculate screen position for depth-based effects
        vec4 screenPos = projectionMatrix * worldPosition;
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
    uniform float hatchingScale;
    uniform float hatchingIntensity;
    uniform float hatchingRotation;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying vec4 vScreenPos;
    varying vec2 vUv;

    // Hatching pattern function - simplified
    float hatching(vec2 uv, float intensity) {
        float scale = hatchingScale * 2.0; // Double the scale for more lines
        vec2 pattern = uv * scale;
        
        // Rotate 45 degrees clockwise (π/4 radians)
        float angle = 0.785; // π/4 in radians
        float cosA = cos(angle);
        float sinA = sin(angle);
        vec2 rotatedPattern = vec2(
            pattern.x * cosA - pattern.y * sinA,
            pattern.x * sinA + pattern.y * cosA
        );
        
        // Option 1: Parallel lines (single direction)
        float parallelLines = mod(rotatedPattern.x * 1.0, 1.0); // Reduced mod value for more frequent lines
        float parallelHatch = step(0.5, parallelLines) * 0.7;
        
        // Option 2: X-pattern crosshatching
        float crossLines1 = mod(rotatedPattern.x + rotatedPattern.y, 1.0); // Reduced mod value
        float crossLines2 = mod(rotatedPattern.x - rotatedPattern.y, 1.0); // Reduced mod value
        float crossHatch = (step(0.5, crossLines1) + step(0.5, crossLines2)) * 0.35;
        
        // Choose between parallel or crosshatching (0.0 for parallel, 1.0 for cross)
        float hatch = mix(parallelHatch, crossHatch, 0.0);
        
        return step(hatch, intensity * 0.5);
    }

    // Halftone pattern function - simplified
    float halftone(vec2 uv, float intensity) {
        float scale = halftoneScale;
        vec2 pattern = uv * scale;
        vec2 grid = fract(pattern) - 0.5;
        float dist = length(grid);
        return step(dist, intensity * 0.5);
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

    // Add distance-based darkness function
    float distanceDarkness(vec3 position) {
        // Calculate distance from center of room
        float distX = abs(position.x) / 15.0; // Room width is 30
        float distZ = abs(position.z) / 10.0; // Room depth is 20
        float dist = max(distX, distZ);
        
        // Create stronger darkness in corners
        return smoothstep(0.0, 1.0, dist) * 0.5;
    }

    void main() {
        vec3 viewDirection = normalize(vViewPosition);
        vec3 lightDir = normalize(lightPosition - vPosition);
        
        // Basic diffuse lighting
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        float softShadow = step(0.0, dot(vNormal, lightDir));
        
        // Add distance-based darkness
        float cornerDarkness = distanceDarkness(vPosition);
        
        // Simplified cel shading
        float celShade;
        if (diffuse > 0.8) celShade = 1.0;
        else if (diffuse > 0.6) celShade = 0.8;
        else if (diffuse > 0.3) celShade = 0.5;
        else celShade = 0.2;
        
        // Apply corner darkness to cel shading
        celShade = mix(celShade, celShade * 0.5, cornerDarkness);
        
        // Simplified specular
        vec3 halfwayDir = normalize(lightDir + viewDirection);
        float specular = pow(max(dot(vNormal, halfwayDir), 0.0), specularShininess);
        float toonSpec = step(0.5, specular) * specularIntensity;
        
        // Simplified rim lighting
        float rimDot = 1.0 - max(dot(viewDirection, vNormal), 0.0);
        float rimFactor = step(0.7, rimDot) * rimIntensity;
        
        // Edge detection - temporarily disabled
        // float normalEdge = length(fwidth(vNormal));
        // float depthEdge = length(fwidth(vScreenPos.xyz/vScreenPos.w));
        // float edge = step(0.8, max(normalEdge, depthEdge * 10.0));
        
        // Halftone and hatching effects
        vec2 screenUV = gl_FragCoord.xy / 1000.0;
        float halftonePattern = halftone(screenUV, (1.0 - celShade) * halftoneIntensity);
        float hatchingPattern = hatching(screenUV, (1.0 - celShade) * hatchingIntensity);
        float combinedPattern = mix(halftonePattern, hatchingPattern, step(celShade, 0.5));
        
        // Base color calculation
        vec3 baseColor = color * (0.5 + celShade * 0.5);
        vec3 finalColor = baseColor * celShade * lightIntensity;
        finalColor += specularColor * toonSpec;
        finalColor += rimColor * rimFactor;
        
        // Apply patterns and shadows
        finalColor = mix(finalColor, finalColor * 0.7, step(celShade, 0.5) * combinedPattern);
        finalColor = mix(finalColor, finalColor * 0.5, (1.0 - softShadow) * softShadowIntensity);
        finalColor = mix(finalColor, finalColor * 0.7, cornerDarkness);
        
        // Edge application - temporarily disabled
        // if (edge > 0.0) {
        //     finalColor = mix(outlineColor, rimColor, rimFactor * 0.3);
        // }
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const AnimeMaterial = shaderMaterial(
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

        // Hatching properties
        hatchingScale: 50.0,
        hatchingIntensity: 0.4,
        hatchingRotation: 0.0,

        // Other properties
        softShadowIntensity: 0.5,
        colorTransitionSmoothness: 0.2
    },
    vertexShader,
    fragmentShader
);

// Extend for use in JSX
extend({ AnimeMaterial });

// Export the material
export { AnimeMaterial }; 