"use client";

import { useRef, useState, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useInView } from "motion/react";
import * as THREE from "three";

type LookRef  = React.RefObject<{ x: number; y: number }>;
type ScrollRef = React.RefObject<number>;

export type AuroraBackgroundProps = {
  lookRef:      LookRef;
  scrollRafRef: ScrollRef;
};

class CanvasBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: Error, _: ErrorInfo) { console.warn("[Aurora] WebGL error:", e.message); }
  render() {
    if (this.state.err) return <div style={{ position: "absolute", inset: 0, background: "#020209" }} />;
    return this.props.children;
  }
}

// ── Background space shader ───────────────────────────────────────────────────

const bgVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const bgFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uAspect;

// ── Hash / noise utilities ────────────────────────────────────────────────────
float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 17.5);
  return fract(p.x * p.y);
}

vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz - vec4(i1, 0.0, 0.0);
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.1; a *= 0.45; }
  return v * 0.5 + 0.5;
}

// ── Procedural stars ──────────────────────────────────────────────────────────
// density  = cells per UV unit (higher → more stars, smaller)
// maxSize  = maximum star radius in UV space
// thresh   = fraction of cells that contain a star
float starLayer(vec2 uv, float density, float maxSize, float thresh) {
  vec2 gUv = uv * density;
  vec2 gi  = floor(gUv);
  vec2 gf  = fract(gUv);

  float h = hash21(gi);
  if (h > thresh) return 0.0;

  vec2  pos  = vec2(hash21(gi + vec2(0.17, 0.31)), hash21(gi + vec2(0.71, 0.53)));
  float br   = 0.25 + hash21(gi + vec2(1.3, 2.7)) * 0.75;
  float sz   = maxSize * (0.25 + hash21(gi + vec2(3.1, 0.9)) * 0.75);
  float twkl = 1.0 + sin(uTime * (0.7 + hash21(gi) * 1.1) + hash21(gi + vec2(4.0, 0.0)) * 6.28) * 0.18;
  float d    = length(gf - pos);
  return smoothstep(sz, 0.0, d) * br * twkl;
}

void main() {
  vec2 uv = vUv;
  uv.x *= uAspect;

  // Mouse-driven parallax — different amounts per star layer
  vec2 mp = uMouse * 0.018;

  // ── Deep-space background gradient ───────────────────────────────────────
  vec3 col = mix(vec3(0.010, 0.008, 0.020), vec3(0.006, 0.006, 0.014), vUv.y);

  // ── Nebula wisps ──────────────────────────────────────────────────────────
  // Blue nebula (upper-left quadrant, slow drift)
  vec2 np1 = uv * 0.32 + vec2(uTime * 0.006,  uTime * 0.004) + vec2(0.0, 0.5);
  float n1 = fbm(np1);
  float n2 = fbm(np1 * 1.5 + vec2(4.4, 2.1));
  float nb = smoothstep(0.42, 0.68, n1) * smoothstep(0.38, 0.62, n2);
  col += vec3(0.04, 0.06, 0.24) * nb * 0.28;

  // Purple-indigo nebula (lower-right, opposite drift)
  vec2 np2 = uv * 0.26 + vec2(-uTime * 0.005, uTime * 0.007) + vec2(3.8, -1.2);
  float n3 = fbm(np2);
  float np = smoothstep(0.48, 0.72, n3);
  col += vec3(0.09, 0.03, 0.20) * np * 0.22;

  // Faint silver-white molecular cloud
  vec2 np3 = uv * 0.18 + vec2(uTime * 0.003, -uTime * 0.003) + vec2(-2.0, 3.0);
  float n4 = fbm(np3);
  float nc = smoothstep(0.52, 0.72, n4) * (1.0 - smoothstep(0.72, 0.90, n4));
  col += vec3(0.12, 0.12, 0.18) * nc * 0.12;

  // ── Star layers (near → far, more parallax for nearer stars) ─────────────
  // Distant dense background stars — no parallax, tiny, dim
  float s0 = starLayer(uv,              350.0, 0.008, 0.016);
  col += vec3(0.75, 0.80, 1.00) * s0 * 0.55;

  // Mid-range stars — slight parallax
  float s1 = starLayer(uv + mp * 0.35,  130.0, 0.013, 0.020);
  col += vec3(0.88, 0.92, 1.00) * s1 * 0.78;

  // Nearby bright stars — full parallax, occasional colour tint
  vec2  nuv = uv + mp;
  float s2  = starLayer(nuv, 45.0, 0.022, 0.028);
  float sh  = hash21(floor(nuv * 45.0));
  vec3  sc  = mix(vec3(1.00, 1.00, 1.00), mix(vec3(0.70, 0.84, 1.00), vec3(1.00, 0.88, 0.76), step(0.5, sh)), 0.55);
  col += sc * s2 * 1.05;

  // ── Engine glow (subtle blue-white from below) ────────────────────────────
  float glow = pow(max(0.0, 1.0 - vUv.y), 5.0) * 0.06;
  glow += exp(-pow((vUv.x - (0.5 + uMouse.x * 0.04)) * uAspect * 2.4, 2.0)) * pow(max(0.0, 1.0 - vUv.y), 3.0) * 0.04;
  col += vec3(0.18, 0.28, 1.00) * glow;

  // ── Vignette ──────────────────────────────────────────────────────────────
  vec2 vig = vUv * 2.0 - 1.0;
  vig.x *= uAspect;
  float v = 1.0 - smoothstep(0.25, 1.45, length(vig) * 0.72);
  col *= v;

  // Scroll darkening
  col *= 1.0 - uScroll * 0.08;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// ── Bright star particles (get Bloom from EffectComposer) ────────────────────

const starPtVert = /* glsl */ `
attribute float aPhase;
attribute float aSize;
attribute float aColor;

uniform float uTime;
uniform vec2  uMouse;
uniform float uRes;

varying float vAlpha;
varying float vColor;

void main() {
  vec3 pos = position;

  // Very slow independent drift per star
  float drift = uTime * 0.006;
  pos.x += sin(drift + aPhase)         * 0.04;
  pos.y += cos(drift * 0.87 + aPhase)  * 0.025;

  // Mouse parallax — nearby bright stars respond more
  float depth = 0.5 + aSize * 0.5;
  pos.x += uMouse.x * 0.05 * depth;
  pos.y += uMouse.y * 0.04 * depth;

  // Twinkle
  float twk = 0.6 + sin(uTime * (1.2 + aPhase * 0.4) + aPhase * 3.14) * 0.35 + 0.05;
  vAlpha = twk * (0.55 + aSize * 0.45);
  vColor = aColor;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = max((aSize * 2.8 + 0.6) * (uRes / 480.0), 0.8);
  gl_Position  = projectionMatrix * mvPos;
}`;

const starPtFrag = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying float vColor;

void main() {
  vec2  uv = gl_PointCoord - 0.5;
  float d  = length(uv) * 2.0;
  if (d > 1.0) discard;
  float a = pow(1.0 - d, 2.2) * vAlpha;
  // blend from pure white to soft blue-white
  vec3  col = mix(vec3(1.0, 1.0, 1.0), vec3(0.74, 0.85, 1.00), vColor * 0.6);
  gl_FragColor = vec4(col, a);
}`;

// ── Scene components ──────────────────────────────────────────────────────────

function BackgroundPlane({ lookRef, scrollRafRef }: AuroraBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useRef({
    uTime:   { value: 0 },
    uMouse:  { value: new THREE.Vector2() },
    uScroll: { value: 0 },
    uAspect: { value: 1 },
  });

  useFrame(({ clock, viewport }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value   = clock.elapsedTime;
    m.uniforms.uMouse.value.set(lookRef.current?.x ?? 0, lookRef.current?.y ?? 0);
    m.uniforms.uScroll.value = scrollRafRef.current ?? 0;
    m.uniforms.uAspect.value = viewport.aspect;
    if (meshRef.current) meshRef.current.scale.set(viewport.width, viewport.height, 1);
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        depthTest={false}
        depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={bgVert}
        fragmentShader={bgFrag}
      />
    </mesh>
  );
}

const STAR_COUNT = 280;

function BrightStars({ lookRef }: { lookRef: LookRef }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [attrs] = useState(() => {
    const pos   = new Float32Array(STAR_COUNT * 3);
    const phase = new Float32Array(STAR_COUNT);
    const size  = new Float32Array(STAR_COUNT);
    const color = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 12;
      pos[i*3+1] = (Math.random() - 0.5) * 8;
      pos[i*3+2] = 0;
      phase[i]   = Math.random() * Math.PI * 2;
      size[i]    = Math.random();
      color[i]   = Math.random(); // 0 = white, 1 = blue-white
    }
    return { pos, phase, size, color };
  });

  const uniforms = useRef({
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uRes:   { value: 800 },
  });

  useFrame(({ clock, size }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value  = clock.elapsedTime;
    m.uniforms.uMouse.value.set(lookRef.current?.x ?? 0, lookRef.current?.y ?? 0);
    m.uniforms.uRes.value   = size.height;
  });

  return (
    <points renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.pos,   3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[attrs.phase, 1]} />
        <bufferAttribute attach="attributes-aSize"    args={[attrs.size,  1]} />
        <bufferAttribute attach="attributes-aColor"   args={[attrs.color, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={starPtVert}
        fragmentShader={starPtFrag}
      />
    </points>
  );
}

function Scene({ lookRef, scrollRafRef }: AuroraBackgroundProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => { setIsDesktop(!window.matchMedia("(pointer: coarse)").matches); }, []);

  return (
    <>
      <BackgroundPlane lookRef={lookRef} scrollRafRef={scrollRafRef} />
      <BrightStars     lookRef={lookRef} />
      {isDesktop && (
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.65} luminanceSmoothing={0.85} />
          <Vignette offset={0.30} darkness={0.60} />
        </EffectComposer>
      )}
    </>
  );
}

// ── Exported component ─────────────────────────────────────────────────────────

export default function AuroraBackground({ lookRef, scrollRafRef }: AuroraBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef   = useRef<THREE.WebGLRenderer | null>(null);
  const inView  = useInView(wrapRef, { margin: "400px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    return () => {
      const ctx = glRef.current?.getContext() as WebGLRenderingContext | null;
      (ctx as unknown as { getExtension: (n: string) => { loseContext: () => void } | null })
        ?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      {isMobile ? (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 100% 60% at 50% 70%, rgba(28,28,96,0.18) 0%, #020209 65%)",
        }} />
      ) : (
        <CanvasBoundary>
          <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 5], fov: 75 }}
            onCreated={({ gl }) => { glRef.current = gl; }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Scene lookRef={lookRef} scrollRafRef={scrollRafRef} />
          </Canvas>
        </CanvasBoundary>
      )}
    </div>
  );
}
