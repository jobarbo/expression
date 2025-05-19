precision mediump float;

varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;

void main() {
    vec2 aspectRatio = vec2(1.0, 1.0);
    vec2 uv = vUv;
    uv.x = (uv.x - 0.5) * aspectRatio.x + 0.5;

    vec2 gridUV = floor(uv * vec2(22.0, 22.0)) / vec2(22.0, 22.0);
    vec2 centerOfPixel = gridUV + vec2(22.0/1234.0, 22.0/1234.0);

    // Adjust mouse coordinates to match UV space aspect ratio
    vec2 adjustedMouse = u_mouse;
    adjustedMouse.x = (adjustedMouse.x - 0.5) * aspectRatio.x + 0.5;
    vec2 adjustedPrevMouse = u_prevMouse;
    adjustedPrevMouse.x = (adjustedPrevMouse.x - 0.5) * aspectRatio.x + 0.5;

    vec2 mouseDirection = adjustedMouse - adjustedPrevMouse;

    vec2 pixelToMouseDirection = centerOfPixel - adjustedMouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);
    float strength = smoothstep(0.1, 0.01, pixelDistanceToMouse);

    vec2 uvOffset = strength * -mouseDirection * 0.84;
    vec2 finalUV = uv - uvOffset;

    vec4 color = texture2D(u_texture, finalUV);
    gl_FragColor = color;
}