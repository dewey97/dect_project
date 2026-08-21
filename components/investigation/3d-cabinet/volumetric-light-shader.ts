import * as THREE from 'three'

export const VolumetricLightBeamShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#fbbf24') },
    uMaxOpacity: { value: 0.22 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uMaxOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // 1. Mờ dần theo chiều dọc: từ chao đèn (1.0) xuống chân tủ (0.0)
      float verticalFade = pow(vUv.y, 1.8);

      // 2. Mờ dần 2 bên rìa: tâm luồng sáng (1.0) lan ra 2 mép bên trái/phải (0.0)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float sideRimFade = pow(abs(dot(normal, viewDir)), 1.3);

      float opacity = verticalFade * sideRimFade * uMaxOpacity;
      gl_FragColor = vec4(uColor, opacity);
    }
  `,
}
