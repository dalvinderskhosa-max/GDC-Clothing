'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Suspense, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

/**
 * The drop, staged as a camera move rather than a grid.
 *
 * Each product sits on its own plane receding along -Z. Scroll drives the
 * camera forward past them, so the collection is experienced as a dolly shot.
 * Progress arrives through a ref rather than props so scrolling never triggers
 * a React render — the whole sequence runs on the r3f frame loop.
 *
 * The grade lives in the fragment shader: the catalogue is shot on a light grey
 * studio backdrop, and this is what pulls that backdrop down into the site's
 * blacks while keeping the garment's contrast.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uPlaneAspect;
  uniform float uImgAspect;
  uniform float uOpacity;
  uniform float uFocus;   // 0 = passing by, 1 = dead centre
  varying vec2 vUv;

  // Cover-fit: fill the plane without distorting the photograph.
  vec2 coverUv(vec2 uv, float planeA, float imgA) {
    vec2 s = planeA > imgA
      ? vec2(1.0, imgA / planeA)
      : vec2(planeA / imgA, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uPlaneAspect, uImgAspect);
    float edge = length(vUv - 0.5);

    // Chromatic split — strongest out of focus and toward the frame edge.
    float ca = (1.0 - uFocus) * 0.005 + edge * 0.002;
    vec3 c;
    c.r = texture2D(uTex, uv + vec2(ca, 0.0)).r;
    c.g = texture2D(uTex, uv).g;
    c.b = texture2D(uTex, uv - vec2(ca, 0.0)).b;

    // The panel is the light source in a dark room, so it stays bright — it is
    // only pulled toward the site's neutrals, not crushed to black.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, 0.82);
    c = (c - 0.5) * 1.16 + 0.5;
    c = clamp(c, 0.0, 1.0);

    // Depth: whatever is not the current piece falls back into the dark.
    c *= mix(0.34, 1.0, uFocus);

    // Feather the rectangle away at its edges. This is the move that stops it
    // reading as a photograph pasted onto a black page.
    float fx = smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x));
    float fy = smoothstep(0.0, 0.10, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
    float feather = fx * fy;

    gl_FragColor = vec4(c, uOpacity * feather);
    #include <colorspace_fragment>
  }
`;

/** Where the camera sits for a given scroll progress. */
function cameraZ(progress: number, count: number): number {
  return 4 - progress * (count - 1) * GAP;
}

/** Focus and opacity for one panel at a given progress. Peaks ~5 units ahead. */
function state(index: number, count: number, progress: number) {
  const dist = -index * GAP - cameraZ(progress, count);
  const off = Math.abs(dist + 5);
  return {
    focus: Math.min(1, Math.max(0, 1 - off / 6.5)),
    opacity: Math.min(1, Math.max(0, 1 - off / 11)),
  };
}

const GAP = 7.0;        // world units between products
const PLANE_W = 2.6;
const PLANE_H = 3.25;

function Panel({
  url,
  index,
  progressRef,
  count,
}: {
  url: string;
  index: number;
  progressRef: MutableRefObject<number>;
  count: number;
}) {
  const tex = useTexture(url);
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  const imgAspect = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    return img?.width && img?.height ? img.width / img.height : 1.25;
  }, [tex]);

  const initial = useMemo(() => state(index, count, progressRef.current), [index, count, progressRef]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uPlaneAspect: { value: PLANE_W / PLANE_H },
      uImgAspect: { value: imgAspect },
      uOpacity: { value: initial.opacity },
      uFocus: { value: initial.focus },
    }),
    [tex, imgAspect, initial],
  );

  // The type lives in the left third, so the panels are staged right of centre.
  // A small alternation keeps the dolly from feeling like a straight tunnel.
  const offsetX = 1.75 + (index % 2 === 0 ? -0.28 : 0.28);
  const baseZ = -index * GAP;

  useFrame(() => {
    const m = mesh.current;
    const material = mat.current;
    if (!m || !material) return;

    const { focus, opacity } = state(index, count, progressRef.current);

    material.uniforms.uFocus.value = THREE.MathUtils.lerp(
      material.uniforms.uFocus.value, focus, 0.12,
    );
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.uniforms.uOpacity.value, opacity, 0.12,
    );

    // Drift and turn slightly toward the lens as it comes into focus.
    m.position.x = offsetX - focus * 0.18;
    m.position.y = Math.sin(index * 1.7) * 0.22;
    m.rotation.y = -(0.40 - focus * 0.30);
    m.rotation.z = Math.sin(index * 2.3) * 0.012;
  });

  return (
    <mesh ref={mesh} position={[offsetX, 0, baseZ]}>
      <planeGeometry args={[PLANE_W, PLANE_H, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Rig({ progressRef, count }: { progressRef: MutableRefObject<number>; count: number }) {
  const { camera } = useThree();
  const target = useRef(0);

  useFrame(() => {
    target.current = THREE.MathUtils.lerp(target.current, progressRef.current, 0.09);
    camera.position.z = cameraZ(target.current, count);
    // A touch of lateral sway so the move never feels like a slider.
    camera.position.x = 0.15 + Math.sin(target.current * Math.PI * 2) * 0.22;
    camera.lookAt(camera.position.x, 0, camera.position.z - 6);
  });

  return null;
}

export default function DropSequence({
  images,
  progressRef,
}: {
  images: string[];
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, position: [0, 0, 4], near: 0.1, far: 120 }}
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={['#08080A', 10, 34]} />
      <Suspense fallback={null}>
      {images.map((url, i) => (
        <Panel
          key={url}
          url={url}
          index={i}
          count={images.length}
          progressRef={progressRef}
        />
      ))}
      </Suspense>
      <Rig progressRef={progressRef} count={images.length} />
    </Canvas>
  );
}
