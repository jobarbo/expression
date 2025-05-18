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

    // Calculate absolute distance on each axis separately
    vec2 distVec = pixelCoord - mouseCoord;

    // Use Euclidean distance for a circular radius instead of square
    float dist = length(distVec);

    // Normalize the distance with a fixed value for predictable scaling
    float distanceNormalized = min(1.0, dist / 1300.0);

    // Create pixelation factor that's strongest near the mouse
    // Use a much higher power value to create a more dramatic falloff from mouse position
    float pixelSizeFactor = max(0.0, pow(1.0 - (distanceNormalized / 1.1), 2.0));

    // Apply a minimum pixelation everywhere
    float basePixelSize = 0.01 + distanceNormalized / uDevicePixelRatio;
    float prx = 0.0001 - distanceNormalized / uDevicePixelRatio;
    float pry = 2.0 - distanceNormalized / uDevicePixelRatio;

    // Calculate final pixel size
    float finalPixelSize = mix(basePixelSize, uPixelSize / uDevicePixelRatio, pixelSizeFactor);

    // Create rectangular pixels
    //!this pixellise check it out
    vec2 pixelRatio = vec2(prx, pry); // Make pixels taller than wide
    vec2 scaledResolution = uResolution * pixelRatio;

    // Apply pixelation by snapping to grid
    vec2 pixelCoords = floor(uv * scaledResolution / finalPixelSize) * finalPixelSize / scaledResolution;

    // Add subtle animation
    float animationStrength = 0.007 * pixelSizeFactor;
    pixelCoords.x += sin(pixelCoords.y * 50.0 + uTime * 0.25) * tan(animationStrength);
    pixelCoords.y += cos(pixelCoords.x * 58.0 + uTime * 0.23) * tan(animationStrength);

    // Sample the texture with pixelated coordinates
    vec4 texColor = texture2D(uSampler, pixelCoords);

    // Add subtle color shifting based on proximity to mouse
    if (pixelSizeFactor > 0.1) {
        vec3 shiftedColor = colorShift(texColor.rgb, uTime);
        texColor.rgb = mix(texColor.rgb, shiftedColor, pixelSizeFactor * 0.5);
    }

    gl_FragColor = texColor;
}