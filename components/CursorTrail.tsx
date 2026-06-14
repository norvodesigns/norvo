"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Routes where the cursor trail is suppressed (prototype/demo pages)
const TRAIL_HIDDEN_ROUTES = ["/projects/strata", "/projects/aurora"];

// ─────────────────────────────────────────────────────────────────────────────
// WebGL Fluid Simulation — inspired by Pavel Dobryakov's implementation
// This is the actual technique Lusion and other high-end studios use.
// Navier-Stokes equations solved per-frame on GPU via ping-pong framebuffers.
// ─────────────────────────────────────────────────────────────────────────────

const SIM_RES  = 128;   // velocity/pressure field resolution
const DYE_RES  = 512;   // reduced — more subtle, still smooth
const PRESSURE_ITERS = 4;
const CURL     = 18;    // reduced vorticity — elegant not chaotic
const VEL_DISS = 0.975; // velocity fades a little faster
const DYE_DISS = 0.900; // dye dissolves very quickly (was 0.970)
const SPLAT_R  = 0.00042; // balanced with the elongation ratio

// Shared vertex shader — fullscreen triangle
const baseVS = `
  precision highp float;
  attribute vec2 aPos;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main(){
    vUv = aPos*0.5+0.5;
    vL = vUv - vec2(texelSize.x, 0);
    vR = vUv + vec2(texelSize.x, 0);
    vT = vUv + vec2(0, texelSize.y);
    vB = vUv - vec2(0, texelSize.y);
    gl_Position = vec4(aPos,0,1);
  }
`;

const advectFS = `
  precision highp float;
  uniform sampler2D uVelocity; uniform sampler2D uSource;
  uniform vec2 texelSize; uniform vec2 dyeTexelSize;
  uniform float dt; uniform float dissipation;
  varying vec2 vUv;
  vec4 bilerp(sampler2D sam, vec2 uv, vec2 tSize){
    vec2 st = uv/tSize - 0.5;
    vec2 iuv = floor(st); vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv+vec2(0.5,0.5))*tSize);
    vec4 b = texture2D(sam, (iuv+vec2(1.5,0.5))*tSize);
    vec4 c = texture2D(sam, (iuv+vec2(0.5,1.5))*tSize);
    vec4 d = texture2D(sam, (iuv+vec2(1.5,1.5))*tSize);
    return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);
  }
  void main(){
    vec2 coord = vUv - dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
    gl_FragColor = dissipation*bilerp(uSource,coord,dyeTexelSize);
    gl_FragColor.a = 1.0;
  }
`;

const curlFS = `
  precision mediump float;
  uniform sampler2D uVelocity;
  varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  void main(){
    float L=texture2D(uVelocity,vL).y, R=texture2D(uVelocity,vR).y;
    float T=texture2D(uVelocity,vT).x, B=texture2D(uVelocity,vB).x;
    gl_FragColor = vec4(0.5*(R-L-T+B),0,0,1);
  }
`;

const vorticityFS = `
  precision highp float;
  uniform sampler2D uVelocity; uniform sampler2D uCurl;
  uniform float curl; uniform float dt; uniform vec2 texelSize;
  varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  void main(){
    float L=texture2D(uCurl,vL).x, R=texture2D(uCurl,vR).x;
    float T=texture2D(uCurl,vT).x, B=texture2D(uCurl,vB).x;
    float C=texture2D(uCurl,vUv).x;
    vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
    force/=length(force)+0.0001;
    force*=curl*C; force.y*=-1.0;
    vec2 v=texture2D(uVelocity,vUv).xy+force*dt;
    gl_FragColor=vec4(v,0,1);
  }
`;

const divergenceFS = `
  precision mediump float;
  uniform sampler2D uVelocity;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  void main(){
    float L=texture2D(uVelocity,vL).x, R=texture2D(uVelocity,vR).x;
    float T=texture2D(uVelocity,vT).y, B=texture2D(uVelocity,vB).y;
    gl_FragColor=vec4(0.5*(R-L+T-B),0,0,1);
  }
`;

const clearFS = `
  precision mediump float;
  uniform sampler2D uTexture; uniform float value;
  varying vec2 vUv;
  void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }
`;

const pressureFS = `
  precision mediump float;
  uniform sampler2D uPressure; uniform sampler2D uDivergence;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; varying vec2 vUv;
  void main(){
    float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
    float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
    float d=texture2D(uDivergence,vUv).x;
    gl_FragColor=vec4((L+R+T+B-d)*0.25,0,0,1);
  }
`;

const gradSubtractFS = `
  precision mediump float;
  uniform sampler2D uPressure; uniform sampler2D uVelocity;
  varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  void main(){
    float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
    float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
    vec2 v=texture2D(uVelocity,vUv).xy - 0.5*vec2(R-L,T-B);
    gl_FragColor=vec4(v,0,1);
  }
`;

const splatFS = `
  precision highp float;
  uniform sampler2D uTarget;
  uniform vec2 point; uniform vec3 color;
  uniform float radius; uniform float aspectRatio;
  uniform vec2 uDir; // normalised movement direction (or zero when still)
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    float splat;
    float dirLen = length(uDir);
    if(dirLen > 0.001){
      vec2 dir  = uDir / dirLen;
      vec2 perp = vec2(-dir.y, dir.x);
      float along  = dot(p, dir);
      float across = dot(p, perp);
      // Long behind, very thin across — teardrop / comet shape
      splat = exp(-along*along/(radius*5.0) - across*across/(radius*0.52));
    } else {
      splat = exp(-dot(p,p)/radius);
    }
    vec3 base = texture2D(uTarget,vUv).xyz;
    gl_FragColor = vec4(base + splat*color, 1.0);
  }
`;

const displayFS = `
  precision highp float;
  uniform sampler2D uDye;
  varying vec2 vUv;
  void main(){
    vec3 dye = texture2D(uDye, vUv).rgb;
    float gw = dye.r;            // gold weight
    float tw = dye.b;            // teal weight
    float amt = gw + tw;
    vec3 gold = vec3(0.851, 0.643, 0.255);
    vec3 teal = vec3(0.051, 0.478, 0.478);
    vec3 col = gold*gw + teal*tw;
    // Subtle: low alpha cap so it reads as a hint, not a blaze
    float alpha = clamp(amt*0.30, 0.0, 0.55);
    gl_FragColor = vec4(col * 0.95, alpha);
  }
`;

// ── WebGL helpers ─────────────────────────────────────────────────────────
function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src); gl.compileShader(s);
  return s;
}
function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  // cache uniform locations
  const locs: Record<string, WebGLUniformLocation> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i)!.name;
    locs[name] = gl.getUniformLocation(p, name)!;
  }
  return { p, locs };
}

function fbo(gl: WebGLRenderingContext, w: number, h: number, fmt: number, type: number, filter: number) {
  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, fmt, type, null);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { tex, fb, w, h, attach(id: number){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
}

function doubleFbo(gl: WebGLRenderingContext, w: number, h: number, fmt: number, type: number, filter: number) {
  let r = fbo(gl,w,h,fmt,type,filter), w_ = fbo(gl,w,h,fmt,type,filter);
  return {
    get read(){ return r; }, get write(){ return w_; },
    swap(){ [r,w_]=[w_,r]; }
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CursorTrail() {
  const pathname   = usePathname();
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Suppress on prototype / demo routes
    if (TRAIL_HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", {
      alpha: true, premultipliedAlpha: true,
      antialias: false, preserveDrawingBuffer: false,
    }) as WebGLRenderingContext;
    if (!gl) return;

    // Resize
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    gl.clearColor(0,0,0,0);

    // Fullscreen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, -1,-1, 1,1, 1,-1]), gl.STATIC_DRAW);

    const bindQuad = (prog: { p: WebGLProgram, locs: any }) => {
      gl.useProgram(prog.p);
      const loc = gl.getAttribLocation(prog.p, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    // Detect float texture support
    const extFloat = gl.getExtension("OES_texture_float");
    const extHalf  = gl.getExtension("OES_texture_half_float");
    const extLinF  = gl.getExtension("OES_texture_float_linear");
    const extLinH  = gl.getExtension("OES_texture_half_float_linear");
    const HALF_FLOAT = extHalf ? extHalf.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const FMT        = gl.RGBA;
    const FILTER     = (extFloat && extLinF) || (extHalf && extLinH) ? gl.LINEAR : gl.NEAREST;

    // Compile programs
    const prAdvect   = program(gl, baseVS, advectFS);
    const prCurl     = program(gl, baseVS, curlFS);
    const prVorticity= program(gl, baseVS, vorticityFS);
    const prDivergence = program(gl, baseVS, divergenceFS);
    const prClear    = program(gl, baseVS, clearFS);
    const prPressure = program(gl, baseVS, pressureFS);
    const prGradSub  = program(gl, baseVS, gradSubtractFS);
    const prSplat    = program(gl, baseVS, splatFS);
    const prDisplay  = program(gl, baseVS, displayFS);

    // FBOs
    const velocity   = doubleFbo(gl, SIM_RES, SIM_RES, FMT, HALF_FLOAT, FILTER);
    const dye        = doubleFbo(gl, DYE_RES, DYE_RES, FMT, HALF_FLOAT, FILTER);
    const curlFbo    = fbo(gl, SIM_RES, SIM_RES, FMT, HALF_FLOAT, FILTER);
    const divergFbo  = fbo(gl, SIM_RES, SIM_RES, FMT, HALF_FLOAT, FILTER);
    const pressure   = doubleFbo(gl, SIM_RES, SIM_RES, FMT, HALF_FLOAT, FILTER);

    const blit = (target: { fb: WebGLFramebuffer, w: number, h: number } | null) => {
      if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb); gl.viewport(0,0,target.w,target.h); }
      else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0,0,W,H); }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Mouse state
    let mx=-1, my=-1, pmx=-1, pmy=-1, active=false;
    const onMove = (e: MouseEvent) => {
      pmx=mx; pmy=my;
      mx=e.clientX/W; my=1-e.clientY/H;
      if (!active){ pmx=mx; pmy=my; }
      active=true;
    };
    const onLeave = () => { active=false; mx=-1; my=-1; };
    window.addEventListener("mousemove", onMove, { passive:true });
    document.addEventListener("mouseleave", onLeave);

    // Splat helper — injects at a point with a directional elongated gaussian
    const splat = (x: number, y: number, dx: number, dy: number, r: number, g: number, b: number) => {
      bindQuad(prSplat);
      const {locs:l} = prSplat;
      const aspect = W/H;
      const velLen = Math.sqrt(dx*dx + dy*dy);
      const dirX = velLen > 0.001 ? dx/velLen : 0;
      const dirY = velLen > 0.001 ? dy/velLen : 0;
      // Offset injection point behind cursor so trail sits behind, not on top
      const behind = 0.018;
      const ox = x - dirX * behind;
      const oy = y - dirY * behind;

      gl.uniform1i(l.uTarget, velocity.read.attach(0));
      gl.uniform1f(l.aspectRatio, aspect);
      gl.uniform2f(l.point, ox, oy);
      gl.uniform2f(l.uDir, dirX, dirY);
      gl.uniform3f(l.color, dx, dy, 0);
      gl.uniform1f(l.radius, SPLAT_R);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(l.uTarget, dye.read.attach(0));
      gl.uniform3f(l.color, r, g, b);
      blit(dye.write);
      dye.swap();
    };

    let last = 0, raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now-last)/1000, 0.016);
      last = now;

      const aspect = W/H;
      const simTS = { x: 1/SIM_RES, y: 1/SIM_RES };
      const dyeTS = { x: 1/DYE_RES, y: 1/DYE_RES };

      // ── Inject splats along cursor path ────────────────────────────
      // Interpolate multiple splats between previous and current position
      // so fast cursor movement never creates gaps/disconnected dots.
      if (active && mx >= 0 && (mx !== pmx || my !== pmy)) {
        const vx = (mx - pmx) * aspect * 180;
        const vy = (my - pmy) * 180;
        const speed = Math.sqrt(vx*vx + vy*vy);
        const hue = Math.atan2(vy, vx) / (2*Math.PI) + 0.5;
        // Teal↔gold by movement direction: r channel = gold weight, b channel = teal weight
        const intensity = 0.45 + speed*0.0022;
        const cr = hue * intensity;          // gold-leaning
        const cg = 0.0;
        const cb = (1.0 - hue) * intensity;  // teal-leaning

        // How many pixels did the cursor travel? Emit one splat every 4px.
        const pixDist = Math.sqrt(((mx-pmx)*W)**2 + ((my-pmy)*H)**2);
        const steps = Math.max(1, Math.ceil(pixDist / 4));
        for (let s = 0; s < steps; s++) {
          const t  = (s + 0.5) / steps;
          const ix = pmx + (mx - pmx) * t;
          const iy = pmy + (my - pmy) * t;
          splat(ix, iy, vx / steps, vy / steps, cr / steps, cg / steps, cb / steps);
        }
      }
      pmx = mx; pmy = my;

      // ── Curl ───────────────────────────────────────────────────────
      bindQuad(prCurl);
      gl.uniform2f(prCurl.locs.texelSize, simTS.x, simTS.y);
      gl.uniform1i(prCurl.locs.uVelocity, velocity.read.attach(0));
      blit(curlFbo);

      // ── Vorticity confinement ──────────────────────────────────────
      bindQuad(prVorticity);
      gl.uniform2f(prVorticity.locs.texelSize, simTS.x, simTS.y);
      gl.uniform1i(prVorticity.locs.uVelocity, velocity.read.attach(0));
      gl.uniform1i(prVorticity.locs.uCurl,     curlFbo.attach(1));
      gl.uniform1f(prVorticity.locs.curl, CURL);
      gl.uniform1f(prVorticity.locs.dt,   dt);
      blit(velocity.write);
      velocity.swap();

      // ── Divergence ────────────────────────────────────────────────
      bindQuad(prDivergence);
      gl.uniform2f(prDivergence.locs.texelSize, simTS.x, simTS.y);
      gl.uniform1i(prDivergence.locs.uVelocity, velocity.read.attach(0));
      blit(divergFbo);

      // ── Clear pressure ────────────────────────────────────────────
      bindQuad(prClear);
      gl.uniform1i(prClear.locs.uTexture, pressure.read.attach(0));
      gl.uniform1f(prClear.locs.value, 0.8);
      blit(pressure.write);
      pressure.swap();

      // ── Pressure solve ────────────────────────────────────────────
      bindQuad(prPressure);
      gl.uniform2f(prPressure.locs.texelSize, simTS.x, simTS.y);
      gl.uniform1i(prPressure.locs.uDivergence, divergFbo.attach(1));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl.uniform1i(prPressure.locs.uPressure, pressure.read.attach(0));
        blit(pressure.write);
        pressure.swap();
      }

      // ── Gradient subtraction ──────────────────────────────────────
      bindQuad(prGradSub);
      gl.uniform2f(prGradSub.locs.texelSize, simTS.x, simTS.y);
      gl.uniform1i(prGradSub.locs.uPressure, pressure.read.attach(0));
      gl.uniform1i(prGradSub.locs.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // ── Advect velocity ───────────────────────────────────────────
      bindQuad(prAdvect);
      gl.uniform2f(prAdvect.locs.texelSize,    simTS.x, simTS.y);
      gl.uniform2f(prAdvect.locs.dyeTexelSize, simTS.x, simTS.y);
      gl.uniform1i(prAdvect.locs.uVelocity, velocity.read.attach(0));
      gl.uniform1i(prAdvect.locs.uSource,   velocity.read.attach(0));
      gl.uniform1f(prAdvect.locs.dt,          dt);
      gl.uniform1f(prAdvect.locs.dissipation, VEL_DISS);
      blit(velocity.write);
      velocity.swap();

      // ── Advect dye ────────────────────────────────────────────────
      gl.uniform2f(prAdvect.locs.dyeTexelSize, dyeTS.x, dyeTS.y);
      gl.uniform1i(prAdvect.locs.uVelocity, velocity.read.attach(0));
      gl.uniform1i(prAdvect.locs.uSource,   dye.read.attach(1));
      gl.uniform1f(prAdvect.locs.dissipation, DYE_DISS);
      blit(dye.write);
      dye.swap();

      // ── Display ───────────────────────────────────────────────────
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      bindQuad(prDisplay);
      gl.uniform1i(prDisplay.locs.uDye, dye.read.attach(0));
      blit(null);
      gl.disable(gl.BLEND);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // No canvas rendered on prototype routes (trail is suppressed via useEffect too)
  if (TRAIL_HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 }}
    />
  );
}