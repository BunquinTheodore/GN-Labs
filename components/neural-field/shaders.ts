export const MAX_RIPPLES = 8;

// Dotted plane. Slow layered sines stand in for noise (one cheap draw call);
// ripples are expanding rings, the pointer lifts, pushes apart and lights the
// dots under it. Idle: a slow undulation plus a travelling shimmer, so the
// field is never frozen. Dots are quieter in the central column (where copy
// usually sits) unless the pointer or a ripple is on them.
export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uSize;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform vec4 uRipples[${MAX_RIPPLES}];
  uniform float uPixelRatio;
  uniform float uPointSize;

  varying float vGlow;
  varying float vRipple;
  varying float vFade;
  varying float vShimmer;
  varying float vQuiet;

  void main() {
    vec2 p = position.xy * uSize;

    float wave =
      sin(p.x * 0.55 + uTime * 0.5) * 0.5 +
      sin(p.y * 0.7 - uTime * 0.38 + p.x * 0.2) * 0.35 +
      sin((p.x + p.y) * 0.32 + uTime * 0.26) * 0.4;
    float z = wave * 0.32;

    float ripple = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w > 0.0 && age > 0.0 && age < 4.5) {
        float front = age * 2.4;
        float d = distance(p, r.xy);
        float band = exp(-pow((d - front) * 1.15, 2.0));
        ripple += band * r.w * exp(-age * 0.65);
      }
    }

    vec2 toPointer = p - uPointer;
    float dp = length(toPointer);
    float glow = exp(-dp * dp * 0.2) * uPointerStrength;

    // Lens: dots are pushed gently away from the cursor.
    p += (toPointer / max(dp, 0.001)) * glow * 0.8;
    z += ripple * 0.5 + glow * 0.45;

    vGlow = clamp(glow, 0.0, 1.0);
    vRipple = clamp(ripple, 0.0, 1.0);
    vShimmer = 0.5 + 0.5 * sin(p.x * 0.28 + p.y * 0.22 - uTime * 0.55);
    // Quiet toward the edges so text near them stays readable.
    vFade = smoothstep(0.55, 0.18, length(position.xy * vec2(0.9, 1.1)));

    vec4 mv = modelViewMatrix * vec4(p, z, 1.0);
    gl_Position = projectionMatrix * mv;

    // Central column (hero copy) is dimmed; interaction restores it.
    float ndcX = gl_Position.x / gl_Position.w;
    float centre = 1.0 - 0.4 * smoothstep(0.8, 0.1, abs(ndcX));
    vQuiet = mix(centre, 1.0, clamp(max(vGlow, vRipple) * 1.6, 0.0, 1.0));

    float size = uPointSize * (1.0 + vGlow * 0.85 + vRipple * 0.8 + wave * 0.15);
    gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform vec3 uWarm;

  varying float vGlow;
  varying float vRipple;
  varying float vFade;
  varying float vShimmer;
  varying float vQuiet;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.1, d);

    vec3 color = mix(uBase, uAccent, clamp(vRipple * 1.5, 0.0, 1.0));
    color = mix(color, uWarm, clamp(vGlow * 1.1, 0.0, 1.0) * 0.85);
    float idleAlpha = 0.42 + vShimmer * 0.28;
    float alpha = (idleAlpha + vGlow * 0.5 + vRipple * 0.5) * soft * mix(0.45, 1.0, vFade) * vQuiet;
    gl_FragColor = vec4(color, min(alpha, 0.95));
  }
`;
