"use client";

import { useRef, useState, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useInView } from "motion/react";
import * as THREE from "three";

type LookRef = React.RefObject<{ x: number; y: number }>;
type ScrollRef = React.RefObject<number>;

export type AtmosphereProps = {
  lookRef: LookRef;
  scrollRafRef: ScrollRef;
};

class CanvasBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: Error, _i: ErrorInfo) { console.warn("[Strata] WebGL error:", e.message); }
  render() {
    if (this.state.err) return <div style={{ position: "absolute", inset: 0, background: "#0D0D0B" }} />;
    return this.props.children;
  }
}

// ── Background quad shaders ────────────────────────────────────────────────────

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

void main() {
  vec3 col = vec3(0.051, 0.051, 0.043);
  col = mix(col, vec3(0.065, 0.058, 0.038), 1.0 - vUv.y);

  // Gold volumetric glow drifts with cursor
  vec2 gp = vec2(0.5 + uMouse.x * 0.06, 0.68 + uMouse.y * 0.04);
  vec2 gd = vUv - gp;
  gd.x *= uAspect;
  float glow = exp(-dot(gd, gd) * 10.0) * 0.055;
  col += vec3(0.769, 0.604, 0.180) * glow;

  // Warm floor-reflection in lower-left
  float warm = (1.0 - smoothstep(0.0, 0.5, vUv.y)) * (1.0 - smoothstep(0.0, 0.5, vUv.x)) * 0.025;
  col += vec3(0.769, 0.604, 0.180) * warm;

  // Vignette
  vec2 vig = (vUv * 2.0 - 1.0);
  vig.x *= uAspect;
  col *= 1.0 - smoothstep(0.4, 1.6, length(vig) * 0.7);

  col *= 1.0 - uScroll * 0.1;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// ── Dust field shaders ─────────────────────────────────────────────────────────

const dustVert = /* glsl */ `
attribute float aPhase;
attribute float aSpeed;

uniform float uTime;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uRes;

varying float vAlpha;
varying float vGold;

void main() {
  float t = uTime * aSpeed * 0.5;
  vec3 pos = position;

  // Lissajous drift
  pos.x += sin(t * 0.18 + aPhase) * 0.07 + cos(t * 0.12 + aPhase * 1.3) * 0.04;
  pos.y += cos(t * 0.15 + aPhase * 0.9) * 0.05 + sin(t * 0.19 + aPhase) * 0.03;

  // Slow upward float, wrap in [-3, 3]
  float rise = mod(uTime * aSpeed * 0.008 + aPhase * 0.16, 6.0) - 3.0;
  pos.y += rise * 0.5;

  // Scroll parallax by depth
  pos.y -= uScroll * 1.2 * (1.0 + position.z * 0.4);

  // Mouse repulsion
  pos.x += uMouse.x * 0.07 * (0.5 + position.z * 0.5);
  pos.y += uMouse.y * 0.05 * (0.5 + position.z * 0.5);

  float pulse = 0.08 + sin(t * 0.6 + aPhase) * 0.04;
  vAlpha = pulse * (0.4 + position.z * 0.6);
  vGold  = position.z;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = max((1.2 + position.z * 1.0) * (uRes / 480.0), 1.0);
  gl_Position  = projectionMatrix * mvPos;
}`;

const dustFrag = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying float vGold;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  if (d > 1.0) discard;
  float a   = pow(1.0 - d, 2.0) * vAlpha;
  vec3  col = mix(vec3(0.94, 0.91, 0.85), vec3(0.91, 0.84, 0.62), vGold);
  gl_FragColor = vec4(col, a);
}`;

// ── Scene objects ──────────────────────────────────────────────────────────────

function BackgroundQuad({ lookRef, scrollRafRef }: AtmosphereProps) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const matRef   = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock, viewport }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value   = clock.elapsedTime;
    m.uniforms.uMouse.value.set(lookRef.current?.x ?? 0, lookRef.current?.y ?? 0);
    m.uniforms.uScroll.value = scrollRafRef.current ?? 0;
    m.uniforms.uAspect.value = viewport.aspect;
    if (meshRef.current) meshRef.current.scale.set(viewport.width, viewport.height, 1);
  });

  const uniforms = useRef({
    uTime:   { value: 0 },
    uMouse:  { value: new THREE.Vector2() },
    uScroll: { value: 0 },
    uAspect: { value: 1 },
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

const COUNT = 3500;

function DustField({ lookRef, scrollRafRef }: AtmosphereProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [{ base, phase, speed }] = useState(() => {
    const b = new Float32Array(COUNT * 3);
    const p = new Float32Array(COUNT);
    const s = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      b[i * 3]     = (Math.random() - 0.5) * 10;
      b[i * 3 + 1] = (Math.random() - 0.5) * 7;
      b[i * 3 + 2] = Math.random();
      p[i] = Math.random() * Math.PI * 2;
      s[i] = 0.35 + Math.random() * 0.65;
    }
    return { base: b, phase: p, speed: s };
  });

  const uniforms = useRef({
    uTime:   { value: 0 },
    uMouse:  { value: new THREE.Vector2() },
    uScroll: { value: 0 },
    uRes:    { value: 800 },
  });

  useFrame(({ clock, size }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value   = clock.elapsedTime;
    m.uniforms.uMouse.value.set(lookRef.current?.x ?? 0, lookRef.current?.y ?? 0);
    m.uniforms.uScroll.value = scrollRafRef.current ?? 0;
    m.uniforms.uRes.value    = size.height;
  });

  return (
    <points renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base, 3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[phase, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
      />
    </points>
  );
}

function Scene({ lookRef, scrollRafRef }: AtmosphereProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <>
      <BackgroundQuad lookRef={lookRef} scrollRafRef={scrollRafRef} />
      <DustField      lookRef={lookRef} scrollRafRef={scrollRafRef} />
      {isDesktop && (
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.9} />
          <Vignette offset={0.35} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

// ── Exported component ─────────────────────────────────────────────────────────

export default function StrataAtmosphere({ lookRef, scrollRafRef }: AtmosphereProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef   = useRef<THREE.WebGLRenderer | null>(null);
  const inView  = useInView(wrapRef, { margin: "400px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    return () => {
      const ctx = glRef.current?.getContext() as WebGLRenderingContext | null;
      (ctx as any)?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      {isMobile ? (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 45% at 50% 28%, rgba(196,154,46,0.06) 0%, #0D0D0B 68%)",
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
