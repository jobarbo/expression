varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;

void main() {
    vec2 gridUV = floor(vUv * vec2(64.0, 64.0)) / vec2(64.0, 64.0);
    vec2 centerOfPixel = gridUV + vec2(64.0/11144.0, 64.0/11144.0);

    vec2 mouseDirection = u_mouse - u_prevMouse;

    vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);

    // Separate strength calculations for x and y axes
    float strengthX = smoothstep(0.25, 0.0001, pixelDistanceToMouse);
    float strengthY = smoothstep(0.25, 0.0001, pixelDistanceToMouse) * 0.6; // Reduced strength for y-axis

    vec2 uvOffset = vec2(
        strengthX * -mouseDirection.x * 0.7,
        strengthY * -mouseDirection.y * 0.15
    );
    vec2 uv = vUv - uvOffset;

    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = color;
}