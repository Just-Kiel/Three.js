precision mediump float;

uniform vec2 u_resolution;

varying vec2 vUv;

void main()
{
    float strength = step(0.95, mod(vUv.y * 33.0, 1.0));
    strength += step(0.9, mod(vUv.x *120.0, 1.0));
    strength = clamp(strength, 0.0, 1.0);

    vec3 blue = vec3(0.0);
    vec3 second = vec3(0.05, 0.77, 0.99);

    vec3 mixed = mix(blue, second, strength);

    //vec2 st = gl_FragCoord.xy/u_resolution.xy;

    gl_FragColor = vec4(mixed, 1.0);
}