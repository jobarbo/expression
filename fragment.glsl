varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;

void main() {
    vec2 gridUV = floor(vUv * vec2(24.0, 24.0)) / vec2(24.0, 24.0);
    vec2 centerOfPixel = gridUV + vec2(24.0/444.0, 24.0/444.0);

    vec2 mouseDirection = u_mouse - u_prevMouse;

    vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);
    float strength = smoothstep(0.3, 0.0001, pixelDistanceToMouse);

    vec2 uvOffset = strength * -mouseDirection * 0.44;
    vec2 uv = vUv - uvOffset;

    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = color;
}