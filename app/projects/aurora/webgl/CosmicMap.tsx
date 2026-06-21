"use client";

import {
  useRef, useState, useEffect, useCallback, useMemo,
  Component, type ReactNode, type ErrorInfo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Destination, DestinationId } from "../types";
import { ROUTES } from "../data";

// ─── Constants ────────────────────────────────────────────────────────────────

const FOV = 50;
const DEFAULT_Z = 10;
const FLY_Z = 3.8;

// ─── Types ────────────────────────────────────────────────────────────────────

type CameraCtrl = {
  x: number; y: number; z: number;
  driftX: number; driftY: number;
  flyId: string | null;
  onFlyComplete: (() => void) | null;
};

type CamState = { x: number; y: number; z: number; aspect: number };

// ─── Shaders ──────────────────────────────────────────────────────────────────

const bgVert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const bgFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uMouse;
uniform float uAspect;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 17.5);
  return fract(p.x * p.y);
}

vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz - vec4(i1, 0.0, 0.0);
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0*fract(p*C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x*x0.x   + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m, g);
}

float fbm(vec2 p) {
  float v=0.0; float a=0.5;
  for(int i=0;i<4;i++){v+=a*snoise(p);p*=2.1;a*=0.45;}
  return v*0.5+0.5;
}

float starLayer(vec2 uv, float density, float maxSize, float thresh) {
  vec2 gUv = uv * density;
  vec2 gi = floor(gUv); vec2 gf = fract(gUv);
  float h = hash21(gi);
  if (h > thresh) return 0.0;
  vec2 pos = vec2(hash21(gi+vec2(0.17,0.31)), hash21(gi+vec2(0.71,0.53)));
  float br  = 0.25 + hash21(gi+vec2(1.3,2.7))*0.75;
  float sz  = maxSize*(0.25 + hash21(gi+vec2(3.1,0.9))*0.75);
  float twk = 1.0 + sin(uTime*(0.7+hash21(gi)*1.1)+hash21(gi+vec2(4.0,0.0))*6.28)*0.18;
  float d   = length(gf - pos);
  return smoothstep(sz, 0.0, d)*br*twk;
}

float shootingStar(vec2 uv) {
  float id   = floor(uTime / 9.0);
  float phase = fract(uTime / 9.0);
  if (phase > 0.10) return 0.0;
  float t = phase / 0.10;
  vec2 dir   = normalize(vec2(hash21(vec2(id,0.1))*2.0-1.0, hash21(vec2(id,0.2))*2.0-1.0));
  vec2 start = vec2(hash21(vec2(id,0.3))*uAspect, hash21(vec2(id,0.4)));
  vec2 tip   = start + dir * t * 0.35;
  vec2 tail  = start + dir * max(0.0, t-0.06) * 0.35;
  vec2 seg   = tip - tail;
  float segLen = length(seg);
  if (segLen < 0.001) return 0.0;
  vec2 toUv = uv - tail;
  float proj = clamp(dot(toUv, seg/segLen)/segLen, 0.0, 1.0);
  float d    = length(toUv - proj*seg);
  return smoothstep(0.004, 0.0, d) * (1.0-proj) * smoothstep(1.0, 0.3, t);
}

void main() {
  vec2 uv = vUv;
  uv.x *= uAspect;
  vec2 mp = uMouse * 0.016;

  // Background
  vec3 col = mix(vec3(0.024,0.026,0.032), vec3(0.006,0.007,0.012), vUv.y);

  // Nebula wisps — very subtle
  vec2 np1 = uv*0.28 + vec2(uTime*0.005, uTime*0.003);
  float n1 = fbm(np1); float n2 = fbm(np1*1.4+vec2(4.2,2.0));
  float nb = smoothstep(0.44,0.66,n1)*smoothstep(0.40,0.62,n2);
  col += vec3(0.04,0.06,0.14)*nb*0.12;

  vec2 np2 = uv*0.22 + vec2(-uTime*0.004, uTime*0.006)+vec2(3.8,-1.2);
  float n3 = fbm(np2);
  col += vec3(0.06,0.05,0.18)*smoothstep(0.50,0.72,n3)*0.08;

  // Distant gold-haze nebula (subtle Titan-direction warmth)
  vec2 np3 = uv*0.16 + vec2(uTime*0.002,-uTime*0.003)+vec2(-2.5,3.0);
  col += vec3(0.12,0.08,0.02)*smoothstep(0.55,0.75,fbm(np3))*0.06;

  // Stars
  float s0 = starLayer(uv, 340.0, 0.008, 0.015);
  col += vec3(0.88,0.88,0.90)*s0*0.55;
  float s1 = starLayer(uv+mp*0.35, 125.0, 0.013, 0.020);
  col += vec3(0.95,0.95,0.96)*s1*0.80;
  float s2 = starLayer(uv+mp, 42.0, 0.022, 0.026);
  col += vec3(1.0,1.0,1.0)*s2*1.05;

  // Blue-tinted bright star cluster
  float s3 = starLayer(uv+mp*0.6+vec2(1.3,0.7), 18.0, 0.030, 0.012);
  col += vec3(0.80,0.88,1.00)*s3*1.20;

  // Shooting star
  col += vec3(0.95,0.97,1.00) * shootingStar(uv) * 0.9;

  // Vignette
  vec2 vig = vUv*2.0-1.0; vig.x *= uAspect;
  col *= 1.0 - smoothstep(0.28,1.50,length(vig)*0.70);

  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}`;

// ─── Planet shader ────────────────────────────────────────────────────────────

const planetVert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const planetFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uType;
uniform float uTime;
uniform float uHover;
uniform float uSelected;

float hash(vec2 p) {
  p = fract(p*vec2(127.1,311.7)); p += dot(p, p.yx+19.19); return fract(p.x*p.y);
}
float noise(vec2 p) {
  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(100.0);a*=0.45;} return v;
}
vec3 sphereNormal(vec2 c, float r) {
  float nx=c.x/r; float ny=c.y/r;
  return normalize(vec3(nx, ny, sqrt(max(0.0,1.0-nx*nx-ny*ny))));
}

void main() {
  vec2 c = vUv - 0.5;
  float dist = length(c);

  const float r = 0.33;
  const float aR = 0.48;
  if (dist > aR + 0.02) discard;

  bool inP = dist < r;
  vec3 nrm = inP ? sphereNormal(c, r) : vec3(0.0,0.0,1.0);
  vec3 lDir = normalize(vec3(0.38, 0.52, 0.90));
  float diff = max(dot(nrm, lDir), 0.0);
  float light = 0.28 + 0.72*diff;

  vec2 sUv = (c/r)*0.5 + 0.5;
  vec3 surface = vec3(0.1);
  vec3 aCol = vec3(0.5,0.7,1.0);
  float aOp = 0.7;
  int pt = int(uType);

  if (pt == 0) { // Earth
    float nO = fbm(sUv*3.5+vec2(0.5,0.3)+uTime*0.007);
    float nL = fbm(sUv*4.2+vec2(2.1,1.4));
    float nC = fbm(sUv*6.5+vec2(1.0)-uTime*0.010);
    vec3 oc = vec3(0.05,0.16,0.52);
    vec3 la = vec3(0.12,0.30,0.12);
    vec3 ar = vec3(0.38,0.28,0.14);
    vec3 cl = vec3(0.86,0.88,0.94);
    surface = mix(oc, mix(la,ar,nL*0.7), step(0.50,nO));
    surface = mix(surface, cl, smoothstep(0.60,0.72,nC)*0.80);
    surface *= light;
    aCol = vec3(0.26,0.55,1.00); aOp = 0.88;
  } else if (pt == 1) { // Luna
    float n = fbm(sUv*5.0);
    surface = vec3(0.28+n*0.12)*(0.80+noise(sUv*9.0)*0.20);
    float cr = smoothstep(0.0,0.05,abs(noise(sUv*12.0)-0.5)-0.10);
    surface *= 0.72 + cr*0.28;
    surface *= light*0.88 + 0.12;
    aCol = vec3(0.62,0.68,0.76); aOp = 0.15;
  } else if (pt == 2) { // Mars
    float n = fbm(sUv*3.0+uTime*0.005);
    vec3 ru = vec3(0.60,0.19,0.07);
    vec3 du = vec3(0.76,0.38,0.17);
    surface = mix(ru, du, n*0.88);
    float pole = smoothstep(0.36,0.12,abs(sUv.y-0.5));
    surface = mix(surface, vec3(0.86,0.83,0.80), pole*0.65);
    surface *= light;
    aCol = vec3(0.85,0.44,0.16); aOp = 0.60;
  } else if (pt == 3) { // Europa
    float n = fbm(sUv*2.5);
    surface = mix(vec3(0.68,0.80,0.94), vec3(0.32,0.48,0.74), n*0.55);
    float fx = abs(sin(sUv.x*24.0+n*4.2+uTime*0.008));
    float fy = abs(sin(sUv.y*18.0+n*3.5-uTime*0.006));
    surface = mix(surface, vec3(0.52,0.30,0.18), smoothstep(0.10,0.02,min(fx,fy))*0.72);
    surface *= light;
    aCol = vec3(0.50,0.80,1.00); aOp = 0.65;
  } else if (pt == 4) { // Titan
    float n = fbm(sUv*2.0+vec2(uTime*0.004,0.0));
    surface = mix(vec3(0.46,0.26,0.05), vec3(0.70,0.50,0.13), n);
    surface *= 0.86+sin(sUv.y*14.0+n*1.5)*0.14;
    surface *= light*0.82+0.18;
    aCol = vec3(0.90,0.60,0.16); aOp = 0.95;
  } else if (pt == 5) { // Kepler
    float n = fbm(sUv*3.5+vec2(uTime*0.005,uTime*0.003));
    surface = mix(vec3(0.04,0.05,0.30), mix(vec3(0.20,0.26,0.65),vec3(0.10,0.32,0.42),n*0.6), n*0.9);
    surface += vec3(0.08,0.06,0.22)*fbm(sUv*4.0-uTime*0.006)*0.5;
    surface *= light;
    aCol = vec3(0.32,0.42,1.00); aOp = 0.80;
  } else { // Orion Station
    vec2 grid = fract(sUv*8.0);
    float gx = 1.0-smoothstep(0.0,0.04,min(grid.x,1.0-grid.x));
    float gy = 1.0-smoothstep(0.0,0.04,min(grid.y,1.0-grid.y));
    surface = mix(vec3(0.12,0.16,0.22), vec3(0.20,0.26,0.36), noise(sUv*4.0)*0.4);
    surface = mix(surface, vec3(0.55,0.70,0.95), max(gx,gy)*0.72);
    float pulse = 0.7+sin(uTime*1.8)*0.3;
    surface += vec3(0.60,0.80,1.00)*(1.0-smoothstep(0.0,r*0.45,dist))*0.52*pulse;
    surface *= light*0.78+0.22;
    aCol = vec3(0.70,0.84,1.00); aOp = 0.38;
  }

  // Atmosphere
  float atmosGrad;
  float edgeFade = 1.0-smoothstep(r*0.6, r, dist);
  if (inP) {
    atmosGrad = (1.0-edgeFade)*0.45;
  } else {
    float t = (dist-r)/(aR-r);
    atmosGrad = pow(max(0.0,1.0-t), 2.4)*aOp;
  }

  vec3 col;
  float alpha;
  if (inP) {
    col   = surface + aCol*atmosGrad;
    alpha = 1.0;
  } else {
    col   = aCol*atmosGrad;
    alpha = atmosGrad;
  }

  // Hover boost
  float hb = uHover*(1.0-dist/aR)*0.55;
  col   += aCol*hb;
  alpha  = min(alpha+hb*0.25, 1.0);

  // Selection ring
  if (!inP) {
    float ringD = abs(dist - r*1.10);
    float ring  = smoothstep(0.018,0.004,ringD)*uSelected;
    col  += aCol*ring*2.2;
    alpha = min(alpha+ring*0.85, 1.0);
  }

  gl_FragColor = vec4(col, alpha);
}`;

// ─── Route line shaders ───────────────────────────────────────────────────────

const routeVert = /* glsl */`
attribute float aProgress;
varying float vProgress;
void main() {
  vProgress = aProgress;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const routeFrag = /* glsl */`
precision mediump float;
varying float vProgress;
uniform float uTime;
uniform float uOpacity;
void main() {
  float t = fract(vProgress*10.0 - uTime*0.22);
  float dash = smoothstep(0.65,0.85,t);
  gl_FragColor = vec4(0.50, 0.68, 1.0, dash*uOpacity);
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function halfH(camZ: number) {
  return camZ * Math.tan((FOV / 2) * (Math.PI / 180));
}

function hitTest(
  mx: number, my: number,
  destinations: Destination[],
  cs: CamState,
  rect: { width: number; height: number },
  extraR = 0
): DestinationId | null {
  const hH = halfH(cs.z);
  const hW = hH * cs.aspect;
  for (const d of destinations) {
    const rx = (d.worldX - cs.x) / hW;
    const ry = (d.worldY - cs.y) / hH;
    const sx = ((rx + 1) / 2) * rect.width;
    const sy = ((1 - ry) / 2) * rect.height;
    const screenR = (d.radius / hH) * (rect.height / 2) + extraR;
    if (Math.hypot(mx - sx, my - sy) < screenR * 1.6) return d.id;
  }
  return null;
}

// ─── Error boundary ───────────────────────────────────────────────────────────

class CanvasBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: Error, _: ErrorInfo) { console.warn("[CosmicMap] WebGL error:", e.message); }
  render() {
    if (this.state.err) return <div style={{ position: "absolute", inset: 0, background: "#030507" }} />;
    return this.props.children;
  }
}

// ─── Background plane ─────────────────────────────────────────────────────────

function StarfieldBg({ lookRef }: { lookRef: React.RefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useRef({
    uTime:   { value: 0 },
    uMouse:  { value: new THREE.Vector2() },
    uAspect: { value: 1 },
  });

  useFrame(({ clock, viewport }) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value   = clock.elapsedTime;
    m.uniforms.uMouse.value.set(lookRef.current?.x ?? 0, lookRef.current?.y ?? 0);
    m.uniforms.uAspect.value = viewport.aspect;
    if (meshRef.current) meshRef.current.scale.set(viewport.width, viewport.height, 1);
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        depthTest={false} depthWrite={false}
        uniforms={uniforms.current}
        vertexShader={bgVert}
        fragmentShader={bgFrag}
      />
    </mesh>
  );
}

// ─── Planet mesh ──────────────────────────────────────────────────────────────

function PlanetMesh({
  dest, hovered, selected,
}: {
  dest: Destination;
  hovered: boolean;
  selected: boolean;
}) {
  const meshRef    = useRef<THREE.Mesh>(null);
  const matRef     = useRef<THREE.ShaderMaterial>(null);
  const ringMatRef = useRef<THREE.LineBasicMaterial>(null);
  const hoverProg  = useRef(0);

  const uniforms = useMemo(() => ({
    uType:     { value: dest.planetType },
    uTime:     { value: 0 },
    uHover:    { value: 0 },
    uSelected: { value: 0 },
  }), [dest.planetType]);

  // Circle ring geometry — built once
  const ringGeo = useMemo(() => {
    const pts: number[] = [];
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts.push(Math.cos(a), Math.sin(a), 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);

  useFrame(({ clock }, delta) => {
    // Animate hover progress
    const target = hovered ? 1 : 0;
    hoverProg.current += (target - hoverProg.current) * Math.min(delta * 5, 1);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value     = clock.elapsedTime;
      matRef.current.uniforms.uHover.value    = hoverProg.current;
      matRef.current.uniforms.uSelected.value = selected ? 1 : 0;
    }
    if (ringMatRef.current) {
      ringMatRef.current.opacity = hoverProg.current * 0.35 + (selected ? 0.28 : 0);
    }
  });

  const r = dest.radius;
  const orbitR = r * 2.4;
  const quadSize = r * 2.4; // quad covers planet + atmosphere

  return (
    <group position={[dest.worldX, dest.worldY, 0]}>
      {/* Planet quad */}
      <mesh ref={meshRef} scale={[quadSize, quadSize, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={planetVert}
          fragmentShader={planetFrag}
        />
      </mesh>

      {/* Orbit ring */}
      <lineLoop
        geometry={ringGeo}
        scale={[orbitR, orbitR, 1]}
      >
        <lineBasicMaterial
          ref={ringMatRef}
          color={dest.glowColor}
          transparent
          opacity={0}
        />
      </lineLoop>
    </group>
  );
}

// ─── Route line ───────────────────────────────────────────────────────────────

function RouteLine({
  from, to,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useRef({
    uTime:    { value: 0 },
    uOpacity: { value: 0.22 },
  });

  const geo = useMemo(() => {
    const SEGMENTS = 40;
    const cx = (from.x + to.x) / 2 + (to.y - from.y) * 0.18;
    const cy = (from.y + to.y) / 2 + (from.x - to.x) * 0.18;
    const positions = new Float32Array((SEGMENTS + 1) * 3);
    const progress  = new Float32Array(SEGMENTS + 1);
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const mt = 1 - t;
      const x = mt * mt * from.x + 2 * mt * t * cx + t * t * to.x;
      const y = mt * mt * from.y + 2 * mt * t * cy + t * t * to.y;
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
      progress[i] = t;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));
    return g;
  }, [from.x, from.y, to.x, to.y]);

  const lineObj = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: uniforms.current,
      vertexShader: routeVert,
      fragmentShader: routeFrag,
    });
    matRef.current = mat;
    return new THREE.Line(geo, mat);
  }, [geo]);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return <primitive object={lineObj} />;
}

// ─── Camera controller ────────────────────────────────────────────────────────

function CameraController({
  controlRef,
  camStateRef,
}: {
  controlRef: React.RefObject<CameraCtrl>;
  camStateRef: React.RefObject<CamState>;
}) {
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    const ctrl = controlRef.current;
    const lerpT = 1 - Math.exp(-7 * delta);

    const tx = ctrl.x + ctrl.driftX;
    const ty = ctrl.y + ctrl.driftY;

    camera.position.x += (tx - camera.position.x) * lerpT;
    camera.position.y += (ty - camera.position.y) * lerpT;
    camera.position.z += (ctrl.z - camera.position.z) * (lerpT * 0.65);
    (camera as THREE.PerspectiveCamera).lookAt(camera.position.x, camera.position.y, 0);

    camStateRef.current.x      = camera.position.x;
    camStateRef.current.y      = camera.position.y;
    camStateRef.current.z      = camera.position.z;
    camStateRef.current.aspect = size.width / size.height;

    // Fly-to completion
    if (ctrl.flyId) {
      const ex = camera.position.x - tx;
      const ey = camera.position.y - ty;
      const ez = camera.position.z - ctrl.z;
      if (Math.sqrt(ex * ex + ey * ey + ez * ez) < 0.08) {
        ctrl.flyId = null;
        ctrl.onFlyComplete?.();
      }
    }
  });

  return null;
}

// ─── Screen projector ─────────────────────────────────────────────────────────

function ScreenProjector({
  destinations,
  screenPosRef,
}: {
  destinations: Destination[];
  screenPosRef: React.RefObject<Record<string, { x: number; y: number }>>;
}) {
  const { camera, size } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    for (const d of destinations) {
      tmp.set(d.worldX, d.worldY, 0);
      tmp.project(camera);
      screenPosRef.current[d.id] = {
        x: ((tmp.x + 1) / 2) * size.width,
        y: ((1 - tmp.y) / 2) * size.height,
      };
    }
  });

  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export type CosmicMapProps = {
  destinations: Destination[];
  flyToId: DestinationId | null;
  viewingId: DestinationId | null;
  onSelect: (id: DestinationId) => void;
  onHover: (id: DestinationId | null) => void;
  onFlyComplete: () => void;
  screenPosRef: React.RefObject<Record<string, { x: number; y: number }>>;
};

export default function CosmicMap({
  destinations,
  flyToId,
  viewingId,
  onSelect,
  onHover,
  onFlyComplete,
  screenPosRef,
}: CosmicMapProps) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const controlRef = useRef<CameraCtrl>({
    x: 0, y: 0, z: DEFAULT_Z,
    driftX: 0, driftY: 0,
    flyId: null,
    onFlyComplete: null,
  });
  const camStateRef = useRef<CamState>({ x: 0, y: 0, z: DEFAULT_Z, aspect: 16 / 9 });
  const lookRef    = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragMoved  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const glRef      = useRef<THREE.WebGLRenderer | null>(null);

  const [hoveredId, setHoveredId] = useState<DestinationId | null>(null);

  // Fly-to effect
  useEffect(() => {
    if (!flyToId) {
      controlRef.current.z      = DEFAULT_Z;
      controlRef.current.flyId  = null;
      controlRef.current.onFlyComplete = null;
      return;
    }
    const dest = destinations.find(d => d.id === flyToId);
    if (!dest) return;
    controlRef.current.x = dest.worldX;
    controlRef.current.y = dest.worldY;
    controlRef.current.z = FLY_Z;
    controlRef.current.flyId = flyToId;
    controlRef.current.onFlyComplete = onFlyComplete;
  }, [flyToId, destinations, onFlyComplete]);

  // WebGL cleanup
  useEffect(() => {
    return () => {
      const ctx = glRef.current?.getContext() as WebGLRenderingContext | null;
      (ctx as unknown as { getExtension: (n: string) => { loseContext: () => void } | null })
        ?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  // ── Pointer events (desktop) ─────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    isDragging.current = true;
    dragMoved.current  = false;
    lastPos.current    = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cs = camStateRef.current;

    if (isDragging.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      if (Math.hypot(dx, dy) > 3) dragMoved.current = true;
      if (dragMoved.current) {
        const hh = halfH(cs.z);
        controlRef.current.x -= (dx / rect.width) * hh * 2 * cs.aspect;
        controlRef.current.y += (dy / rect.height) * hh * 2;
        controlRef.current.flyId = null;
      }
    } else {
      const nx = (mx / rect.width) * 2 - 1;
      const ny = -((my / rect.height) * 2 - 1);
      lookRef.current.x = nx;
      lookRef.current.y = ny;
      controlRef.current.driftX = nx * 0.14;
      controlRef.current.driftY = ny * 0.09;
      const hid = hitTest(mx, my, destinations, cs, rect);
      setHoveredId(hid);
      onHover(hid);
    }
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [destinations]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (!dragMoved.current) {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top, destinations, camStateRef.current, rect);
        if (hit) onSelect(hit);
      }
    }
    isDragging.current = false;
    dragMoved.current  = false;
  }, [destinations, onSelect]);

  const onPointerLeave = useCallback(() => {
    isDragging.current = false;
    controlRef.current.driftX = 0;
    controlRef.current.driftY = 0;
    lookRef.current.x = 0;
    lookRef.current.y = 0;
    setHoveredId(null);
    onHover(null);
  }, [onHover]);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const f = 1 + e.deltaY * 0.0009;
    controlRef.current.z = Math.max(2.0, Math.min(18, controlRef.current.z * f));
    controlRef.current.flyId = null;
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Touch events (mobile) ────────────────────────────────────────────────────

  const touchCtrl = useRef({ lx: 0, ly: 0, iDist: 0, iZ: DEFAULT_Z, vx: 0, vy: 0, lt: 0 });
  const momentumId = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (momentumId.current != null) cancelAnimationFrame(momentumId.current);
    const t = e.touches;
    if (t.length === 1) {
      touchCtrl.current = {
        ...touchCtrl.current,
        lx: t[0].clientX, ly: t[0].clientY,
        vx: 0, vy: 0, lt: Date.now(),
      };
    } else if (t.length === 2) {
      touchCtrl.current.iDist = Math.hypot(
        t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY
      );
      touchCtrl.current.iZ = controlRef.current.z;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cs = camStateRef.current;
    const t = e.touches;
    const now = Date.now();
    const dt = Math.max(now - touchCtrl.current.lt, 1);

    if (t.length === 1) {
      const dx = t[0].clientX - touchCtrl.current.lx;
      const dy = t[0].clientY - touchCtrl.current.ly;
      const hh = halfH(cs.z);
      const wx = -(dx / rect.width) * hh * 2 * cs.aspect;
      const wy = (dy / rect.height) * hh * 2;
      controlRef.current.x += wx;
      controlRef.current.y += wy;
      touchCtrl.current.vx = wx / (dt / 1000);
      touchCtrl.current.vy = wy / (dt / 1000);
      touchCtrl.current.lx = t[0].clientX;
      touchCtrl.current.ly = t[0].clientY;
      touchCtrl.current.lt = now;
    } else if (t.length === 2) {
      const d = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      controlRef.current.z = Math.max(2.0, Math.min(18, touchCtrl.current.iZ * (touchCtrl.current.iDist / d)));
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const speed = Math.hypot(touchCtrl.current.vx, touchCtrl.current.vy);
    if (speed < 0.08 && e.changedTouches.length > 0) {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        const tt = e.changedTouches[0];
        const hit = hitTest(tt.clientX - rect.left, tt.clientY - rect.top, destinations, camStateRef.current, rect, 28);
        if (hit) { onSelect(hit); return; }
      }
    }
    let vx = touchCtrl.current.vx;
    let vy = touchCtrl.current.vy;
    const tick = () => {
      vx *= 0.94; vy *= 0.94;
      controlRef.current.x += vx * 0.016;
      controlRef.current.y += vy * 0.016;
      if (Math.hypot(vx, vy) > 0.01) momentumId.current = requestAnimationFrame(tick);
    };
    momentumId.current = requestAnimationFrame(tick);
  }, [destinations, onSelect]);

  // ── Resolve route positions ──────────────────────────────────────────────────

  const destMap = useMemo(
    () => Object.fromEntries(destinations.map(d => [d.id, d])),
    [destinations]
  );

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute", inset: 0,
        cursor: hoveredId ? "pointer" : "none",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CanvasBoundary>
        <Canvas
          camera={{ fov: FOV, position: [0, 0, DEFAULT_Z], near: 0.1, far: 200 }}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => { glRef.current = gl; }}
          style={{ position: "absolute", inset: 0 }}
        >
          <StarfieldBg lookRef={lookRef} />

          {/* Route lines */}
          {ROUTES.map(r => {
            const f = destMap[r.from];
            const t = destMap[r.to];
            if (!f || !t) return null;
            return (
              <RouteLine
                key={`${r.from}-${r.to}`}
                from={{ x: f.worldX, y: f.worldY }}
                to={{ x: t.worldX, y: t.worldY }}
              />
            );
          })}

          {/* Planet meshes */}
          {destinations.map(d => (
            <PlanetMesh
              key={d.id}
              dest={d}
              hovered={hoveredId === d.id}
              selected={viewingId === d.id}
            />
          ))}

          <CameraController controlRef={controlRef} camStateRef={camStateRef} />
          <ScreenProjector destinations={destinations} screenPosRef={screenPosRef} />

          <EffectComposer>
            <Bloom intensity={0.75} luminanceThreshold={0.45} luminanceSmoothing={0.92} />
            <Vignette offset={0.28} darkness={0.62} />
          </EffectComposer>
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
