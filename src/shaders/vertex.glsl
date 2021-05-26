uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // modelPosition.x += tan(modelPosition.z *100.0 + uTime);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;

    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}