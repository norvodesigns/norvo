"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceTilt } from "./DeviceTilt";

type LookRef = React.MutableRefObject<{ x: number; y: number; gyro: boolean }>;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uAspect;

  vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for(int i=0;i<4;i++){ v += a*snoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    uv.x *= uAspect;

    float t = uTime * 0.15;
    vec2 mv = uMouse * 0.5;

    vec2 p = uv * 1.6;
    p += vec2(
      sin(uv.y * 3.0 + uTime * 0.5),
      cos(uv.x * 3.0 + uTime * 0.42)
    ) * 0.14;
    p += mv;

    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    float n  = fbm(p + q * 1.3 + vec2(t, -t * 0.8));
    n = n * 0.5 + 0.5;
    float n2 = fbm(p * 1.2 + q - vec2(t * 1.2, 0.0)) * 0.5 + 0.5;

    vec3 white  = vec3(1.0);
    vec3 teal   = vec3(0.051, 0.478, 0.478);
    vec3 gold   = vec3(0.851, 0.643, 0.255);

    vec3 col = white;
    col = mix(col, teal,   smoothstep(0.42, 0.9, n) * 0.32);
    col = mix(col, gold,   smoothstep(0.5, 0.95, n2) * 0.28);
    col = mix(white, col, 0.93);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function FlowPlane({ lookRef }: { lookRef: LookRef }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    // On a phone the gyro takes over as the "cursor"; otherwise use the pointer.
    const look = lookRef.current;
    const tx = look.gyro ? look.x : mouse.current.tx;
    const ty = look.gyro ? look.y : mouse.current.ty;
    mouse.current.x += (tx - mouse.current.x) * 0.04;
    mouse.current.y += (ty - mouse.current.y) * 0.04;
    // Write directly into the live material — guaranteed to reach the shader
    m.uniforms.uTime.value   = state.clock.getElapsedTime();
    m.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    m.uniforms.uAspect.value = size.width / size.height;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function WebGLBackdrop() {
  const tilt = useDeviceTilt();
  // Bridge the gyro signal (a React-side MotionValue) across the R3F renderer
  // boundary via a plain ref the useFrame loop can read each frame.
  const lookRef = useRef({ x: 0, y: 0, gyro: false });

  useEffect(() => {
    if (!tilt?.enabled) return;
    const apply = () => {
      // gamma → x (flip to feel like the cursor), beta → y
      lookRef.current.x = -tilt.tiltX.get();
      lookRef.current.y = -tilt.tiltY.get();
      lookRef.current.gyro = true;
    };
    apply();
    const ux = tilt.tiltX.on("change", apply);
    const uy = tilt.tiltY.on("change", apply);
    return () => {
      ux();
      uy();
      lookRef.current.gyro = false;
    };
  }, [tilt]);

  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop="always"
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <FlowPlane lookRef={lookRef} />
      </Canvas>
    </div>
  );
}