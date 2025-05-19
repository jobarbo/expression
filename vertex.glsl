attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vUv;

void main() {
    // Fix the texture coordinates by flipping the y-axis
    vUv = vec2(aTexCoord.x, 1.0 - aTexCoord.y);

    // Scale to fill the entire viewport
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0;  // Scale to fill viewport
    gl_Position = positionVec4;
}