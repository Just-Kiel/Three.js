precision mediump float;

varying vec2 vUv;

void main()
{
    float strength = distance(vUv, vec2(1.8, 0.5));

    // vec3 blue = vec3(0.0);
    // vec3 second = vec3(0.05, 0.77, 0.99);

    // vec3 mixed = mix(blue, second, strength);

    gl_FragColor = vec4(vec3(strength), 0.5);
}