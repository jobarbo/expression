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
    // Create an elliptical distance by scaling the X and Y components differently
    vec2 distVec = pixelCoord - mouseCoord;
    float xScale = 1.5; // Make X distance appear larger (narrower effect)
    float yScale = 0.7; // Make Y distance appear smaller (taller effect)
    float dist = length(vec2(distVec.x * xScale, distVec.y * yScale));

    // Use the uPixelationRadius uniform to control the area of effect
    // If uPixelationRadius is 0, use default values
    float innerRadius = uPixelationRadius > 0.0 ? uPixelationRadius * 0.9 : 1150.0;
    float outerRadius = uPixelationRadius > 0.0 ? uPixelationRadius * 3.0 : 1800.0;

    // Custom cubic smoothstep for an even smoother transition
    float t = clamp((dist - innerRadius) / (outerRadius - innerRadius), 0.0, 1.0);
    float smoothT = t * t * (3.0 - 2.0 * t);

    // Use advanced smoothing for a more gradual transition with an expanded outer edge
    float pixelSizeFactor = 1.0 - smoothT;

    // Apply a gentler power curve for an ultra-smooth falloff at the edges
    pixelSizeFactor = pow(pixelSizeFactor, 1.35);

    // Start with a small pixelation and increase it based on mouse proximity
    // Using a more conservative range to avoid extreme pixelation
    float pixelSize = mix(10.1, max(0.1, uPixelSize), pixelSizeFactor *0.1) / uDevicePixelRatio;

    // Simple, robust pixelation approach
    vec2 pixelCoords = uv;

    if (pixelSize > 0.02) {
        // Apply asymmetric pixelation to stretch pixels vertically
        float verticalStretch = mix(12.0, 12.0, pixelSizeFactor);

        // Pixelate by using a lower resolution sampling with vertical stretching
        pixelCoords.x = floor(uv.x * uResolution.x / pixelSize) * pixelSize / uResolution.x;
        pixelCoords.y = floor(uv.y * uResolution.y / (pixelSize / verticalStretch)) * (pixelSize / verticalStretch) / uResolution.y;
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

    // Original texture without pixelation
    vec4 originalColor = texture2D(uSampler, uv);

    // Add subtle color shifting based on proximity to mouse
    if (pixelSizeFactor > 0.1) {
        vec3 shiftedColor = colorShift(texColor.rgb, uTime);
        texColor.rgb = mix(texColor.rgb, shiftedColor, pixelSizeFactor * 0.3);
    }

    // Remove the horizontal compression effect
    // Blend between pixelated and original texture based on distance for smoother transition
    // Use a different falloff curve specifically for the blend
    float blendFactor = smoothstep(innerRadius * 0.9, outerRadius * 1.1, dist);
    gl_FragColor = mix(texColor, originalColor, blendFactor);
}