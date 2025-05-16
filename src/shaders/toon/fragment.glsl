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