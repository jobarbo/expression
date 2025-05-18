precision highp float;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uPixelationRadius;
uniform float uPixelSize;
uniform float uTime;
uniform float uDevicePixelRatio;

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

    // Sample the texture directly
    vec4 texColor = texture2D(uSampler, uv);

    // Output the sampled color
    gl_FragColor = texColor;
}