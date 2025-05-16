precision highp float;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uPixelationRadius;
uniform float uPixelSize;
uniform float uTime;
uniform float uDevicePixelRatio;

// Function to add some subtle color shifting
vec3 colorShift(vec3 color, float shift) {
    return vec3(
        color.r + sin(shift * 0.3) * 0.1,
        color.g + sin(shift * 0.2) * 0.1,
        color.b + sin(shift * 0.1) * 0.1
    );
}

void main(void) {
    // Get texture coordinates
    vec2 uv = vTextureCoord;

    // Convert to pixel coordinates
    vec2 pixelCoord = uv * uResolution;

    // Get mouse coordinates
    vec2 mouseCoord = uMouse * uResolution;

    // Calculate distance to mouse
    float dist = distance(pixelCoord, mouseCoord);

    // Use the uPixelationRadius uniform to control the area of effect
    // If uPixelationRadius is 0, use default values
    float innerRadius = uPixelationRadius > 0.0 ? uPixelationRadius * 0.9 : 1150.0;
    float outerRadius = uPixelationRadius > 0.0 ? uPixelationRadius : 600.0;

    // Use smoothstep for a nicer transition
    // We want smaller pixels (more pixelation) closer to the mouse
    // Increasing the range (50->innerRadius, 300->outerRadius) makes the effect area larger
    float pixelSizeFactor = 1.0 - smoothstep(innerRadius, outerRadius, dist);

    // Start with a small pixelation and increase it based on mouse proximity
    // Using a more conservative range to avoid extreme pixelation
    float pixelSize = mix(1.0, max(15.0, uPixelSize), pixelSizeFactor) / uDevicePixelRatio;

    // Simple, robust pixelation approach
    vec2 pixelCoords = uv;

    if (pixelSize > 1.0) {
        // Pixelate by using a lower resolution sampling
        pixelCoords = floor(uv * uResolution / pixelSize) * pixelSize / uResolution;
    }

    // Ensure texture coordinates stay within valid range
    pixelCoords = clamp(pixelCoords, 0.0, 1.0);

    // Optional: Add a subtle animation
    if (pixelSizeFactor > 0.1) {
        float animOffset = sin(uTime * 0.5) * 0.002 * pixelSizeFactor;
        pixelCoords += vec2(animOffset);
        // Clamp again after animation
        pixelCoords = clamp(pixelCoords, 0.0, 1.0);
    }

    // Sample the texture
    vec4 texColor = texture2D(uSampler, pixelCoords);

    // Add subtle color shifting based on proximity to mouse
    if (pixelSizeFactor > 0.1) {
        vec3 shiftedColor = colorShift(texColor.rgb, uTime);
        texColor.rgb = mix(texColor.rgb, shiftedColor, pixelSizeFactor * 0.3);
    }

    gl_FragColor = texColor;
}