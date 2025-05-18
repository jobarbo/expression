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


    gl_FragColor = texColor;
}