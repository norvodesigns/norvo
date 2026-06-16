"use client";
import { useRef, useMemo, useState, useEffect, Suspense, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { motion, AnimatePresence, useInView } from "motion/react";
import * as THREE from "three";
import { useDeviceTilt } from "./DeviceTilt";

type LookRef = React.MutableRefObject<{ x: number; y: number }>;

// Error boundary — prevents a crashed WebGL canvas from breaking the page
class CanvasBoundary extends Component<{children:ReactNode},{err:boolean}>{
  constructor(p:any){super(p);this.state={err:false};}
  static getDerivedStateFromError(){return{err:true};}
  componentDidCatch(e:Error,i:ErrorInfo){console.warn("[Norvo] Canvas error:",e.message);}
  render(){
    if(this.state.err)return(
      <div style={{width:"100%",height:"100%",background:"#f8f7ff"}}/>
    );
    return this.props.children;
  }
}

type V3 = [number, number, number];
const smoothstep=(e0:number,e1:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CAPS = [
  {
    label:"Immersive Design",
    sub:"Sites that feel like places",
    detail:"We design digital spaces with real depth — layered parallax, spatial motion, and WebGL environments that reward exploration. Every scroll reveals something new.",
    bullets:["3D-feeling layouts","Scroll & cursor interactions","WebGL backgrounds","Motion-driven storytelling"],
    color:[0.051,0.478,0.478] as V3, hex:"#0D7A7A", speed:0.11, ftype:0,
  },
  {
    label:"Mobile First",
    sub:"Premium on every screen & touch",
    detail:"Mobile isn't an afterthought — it's a first-class canvas. Touch gestures, native-feeling physics, and layouts crafted specifically for how people actually hold their phones.",
    bullets:["Gesture-native interactions","Touch-optimised physics","Responsive 3D scenes","Performance on any device"],
    color:[0.07,0.63,0.42] as V3, hex:"#12A06B", speed:0.086, ftype:1,
  },
  {
    label:"Launch & Grow",
    sub:"We stay involved after you ship",
    detail:"Shipping is the beginning. We monitor performance, iterate on what the data shows, and keep your site feeling fresh as your brand evolves.",
    bullets:["Post-launch iteration","Analytics & optimisation","CMS & content updates","Long-term partnership"],
    color:[0.851,0.643,0.255] as V3, hex:"#D9A441", speed:0.14, ftype:2,
  },
];
const DESKTOP_POS: V3[] = [[-3.3,0,0],[0,-1.5,0],[3.3,0,0]]; // centre rises from below
const MOBILE_POS:  V3[] = [[-1.8,0,0],[0,-0.9,0],[1.8,0,0]]; // same as desktop, scaled for mobile

// Clear white glass bubble colors — no rainbow, just white refraction
const EXPLODE_COLS: V3[] = [
  [1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],
  [1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],
  [1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],
  [1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],
];

const FLOWERS = [
  { layers:[
      { n:12,len:2.9,w:0.40,oa:16,rot:0, del:0.00,peak:0.28,sharp:1.5 },
      { n:8, len:2.1,w:0.36,oa:36,rot:15,del:0.24,peak:0.28,sharp:1.5 },
      { n:5, len:1.3,w:0.26,oa:64,rot:9, del:0.50,peak:0.28,sharp:1.5 },
    ],
    cols:[[0.72,0.84,0.97],[0.34,0.58,0.95],[0.16,0.40,0.92]] as V3[],
    tipCol:[0.88,0.94,1.00] as V3, centerCol:[0.90,0.95,1.00] as V3,
  },
  { layers:[
      { n:8, len:2.7,w:0.90,oa:10,rot:0,   del:0.00,peak:0.40,sharp:0.55 },
      { n:8, len:1.9,w:0.70,oa:28,rot:22.5,del:0.32,peak:0.38,sharp:0.55 },
      { n:6, len:1.1,w:0.45,oa:55,rot:12,  del:0.58,peak:0.35,sharp:0.60 },
    ],
    cols:[[0.55,0.35,0.94],[0.44,0.20,0.90],[0.36,0.12,0.86]] as V3[],
    tipCol:[0.72,0.58,0.98] as V3, centerCol:[0.85,0.80,1.00] as V3,
  },
  { layers:[
      { n:16,len:2.5,w:0.44,oa:20,rot:0, del:0.00,peak:0.32,sharp:1.2 },
      { n:13,len:1.9,w:0.38,oa:36,rot:11,del:0.18,peak:0.32,sharp:1.2 },
      { n:10,len:1.4,w:0.30,oa:54,rot:6, del:0.35,peak:0.30,sharp:1.2 },
      { n:7, len:0.9,w:0.22,oa:70,rot:20,del:0.52,peak:0.28,sharp:1.2 },
    ],
    cols:[[0.88,0.54,0.92],[0.74,0.22,0.82],[0.60,0.09,0.74],[0.48,0.06,0.66]] as V3[],
    tipCol:[0.92,0.72,0.96] as V3, centerCol:[0.95,0.78,0.97] as V3,
  },
];

const RU=30,RV=18;

// ─── Geometry builder ─────────────────────────────────────────────────────────
function petalV(u:number,vc:number,len:number,wid:number,oa_deg:number,az:number,peak:number,sharp:number):V3{
  const rise=u<peak?u/peak:(1-u)/(1-peak);
  const w=Math.pow(Math.max(0,rise),sharp)*wid;
  const oa=oa_deg*Math.PI/180,cr=Math.cos(az),sr=Math.sin(az);
  const clX=Math.cos(oa)*cr,clY=Math.cos(oa)*sr,clZ=Math.sin(oa);
  const tX=-sr,tY=cr;
  const nX=-Math.sin(oa)*cr,nY=-Math.sin(oa)*sr,nZ=Math.cos(oa);
  const bowl=Math.sin(u*Math.PI)*0.36+vc*vc*0.20;
  const al=u*len;
  return[al*clX+vc*w*tX-bowl*nX,al*clY+vc*w*tY-bowl*nY,al*clZ-bowl*nZ];
}

function buildFlowerGeo(ftype:number){
  const fl=FLOWERS[ftype];
  const VPP=RU*RV,TP=fl.layers.reduce((s,l)=>s+l.n,0);
  const TV=TP*VPP,TI=TP*(RU-1)*(RV-1)*6;
  const oP=new Float32Array(TV*3),cP=new Float32Array(TV*3);
  const col=new Float32Array(TV*3),del=new Float32Array(TV),uvA=new Float32Array(TV*2);
  const idx=new Uint16Array(TI);
  let vo=0,io=0;
  fl.layers.forEach((layer,li)=>{
    const lc=fl.cols[Math.min(li,fl.cols.length-1)],tc=fl.tipCol;
    for(let pi=0;pi<layer.n;pi++){
      const h1=((pi*1618+li*2017)%1000)/1000,h2=((pi*3141+li*1337)%1000)/1000,h3=((pi*997+li*577)%1000)/1000;
      const lenV=layer.len*(1+(h1-0.5)*0.14),widV=layer.w*(1+(h2-0.5)*0.08),aoV=layer.oa+(h3-0.5)*3.5;
      const az=(pi/layer.n)*Math.PI*2+(layer.rot*Math.PI/180)+Math.PI/2+(h1-0.5)*0.07;
      for(let ui=0;ui<RU;ui++){for(let vi=0;vi<RV;vi++){
        const u=ui/(RU-1),v01=vi/(RV-1),vc=v01*2-1;
        const[ox,oy,oz]=petalV(u,vc,lenV,widV,aoV,az,layer.peak,layer.sharp);
        const CS=0.15;
        const[cx,cy,cz]=petalV(u,vc,lenV*CS,widV*CS,86,az,layer.peak,layer.sharp);
        const vi3=(vo+ui*RV+vi)*3,vi1=vo+ui*RV+vi;
        oP[vi3]=ox;oP[vi3+1]=oy;oP[vi3+2]=oz;
        cP[vi3]=cx;cP[vi3+1]=cy;cP[vi3+2]=cz;
        const cf=u*0.5;col[vi3]=lc[0]+(tc[0]-lc[0])*cf;col[vi3+1]=lc[1]+(tc[1]-lc[1])*cf;col[vi3+2]=lc[2]+(tc[2]-lc[2])*cf;
        del[vi1]=layer.del;uvA[vi1*2]=u;uvA[vi1*2+1]=v01;
      }}
      for(let ui=0;ui<RU-1;ui++)for(let vi=0;vi<RV-1;vi++){
        const a=vo+ui*RV+vi;idx[io++]=a;idx[io++]=a+1;idx[io++]=a+RV;idx[io++]=a+1;idx[io++]=a+RV+1;idx[io++]=a+RV;
      }
      vo+=VPP;
    }
  });
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",  new THREE.BufferAttribute(oP,3));
  g.setAttribute("aClosedPos",new THREE.BufferAttribute(cP,3));
  g.setAttribute("aCol",      new THREE.BufferAttribute(col,3));
  g.setAttribute("aDel",      new THREE.BufferAttribute(del,1));
  g.setAttribute("aUV",       new THREE.BufferAttribute(uvA,2));
  g.setIndex(new THREE.BufferAttribute(idx,1));
  g.computeVertexNormals();
  return g;
}

// ─── Shaders ──────────────────────────────────────────────────────────────────
const meshVert=`
  attribute vec3 aClosedPos,aCol; attribute float aDel; attribute vec2 aUV;
  uniform float uBloom,uTime;
  varying vec3 vCol,vNorm,vViewPos; varying vec2 vUV; varying float vBE;
  void main(){
    float b=clamp((uBloom-aDel)/max(0.001,1.0-aDel*0.50),0.0,1.0);
    float bE=b*b*(3.0-2.0*b);
    vec3 pos=mix(aClosedPos,position,bE);
    pos.z+=sin(bE*3.14159)*0.72;
    pos*=1.0+sin(uTime*0.44+aDel*6.28)*bE*bE*0.018;
    vCol=aCol; vUV=aUV; vBE=bE;
    vNorm=normalize(normalMatrix*normal);
    vec4 mvp=modelViewMatrix*vec4(pos,1.0); vViewPos=mvp.xyz;
    gl_Position=projectionMatrix*mvp;
  }
`;
const meshFrag=`
  varying vec3 vCol,vNorm,vViewPos; varying vec2 vUV; varying float vBE;
  uniform float uFade;
  void main(){
    float u=vUV.x,vc=vUV.y*2.0-1.0;
    float edge=smoothstep(1.0,0.88,abs(vc));
    float mask=edge*smoothstep(0.0,0.04,u)*smoothstep(1.0,0.92,u);
    if(mask<0.15)discard;
    vec3 N=normalize(vNorm); if(!gl_FrontFacing)N=-N;
    // Top-left key light, soft fill from right, subtle back rim
    vec3 V=normalize(-vViewPos),L1=normalize(vec3(-0.65,0.75,0.70)),L2=normalize(vec3(0.55,-0.15,0.45)),L3=normalize(vec3(0.0,0.6,-0.5));
    float d1=max(0.0,dot(N,L1)),d2=max(0.0,dot(N,L2))*0.22,d3=max(0.0,dot(N,L3))*0.12;
    float sp=pow(max(0.0,dot(N,normalize(L1+V))),32.0)*0.55;
    vec3 lit=vCol*(0.22+d1*0.62+d2+d3)+vec3(sp*0.55+sp*sp*0.20);
    float vein=max(0.0,1.0-abs(vc)*3.8)*smoothstep(0.0,0.25,u)*smoothstep(1.0,0.55,u)*0.22;
    lit+=vec3(vein);
    float edgeZ=smoothstep(0.60,1.0,abs(vc)); lit+=edgeZ*vec3(0.03,0.09,0.10)*vBE;
    float center=max(0.0,1.0-u*6.0)*max(0.0,1.0-abs(vc)*5.0);
    lit+=vec3(0.25)*center*vBE;
    // Steep alpha ramp: nearly binary (opaque inside, invisible outside).
    // Avoids the x-ray look of soft alpha edges on a light background.
    float a = clamp(mask * 6.0 - 0.3, 0.0, 1.0) * uFade;
    gl_FragColor=vec4(lit, a);
  }
`;
const orbVert=`
  attribute float aPhase;
  uniform float uTime,uBloom,uHover,uScrollVel,uSize,uFade;
  uniform vec2 uRes;
  varying float vA;
  void main(){
    vec3 p=normalize(position);
    float sm=max(0.18,1.0-uBloom*1.1);
    float r=1.0+sin(uTime*0.38+aPhase)*0.042*sm
              +sin(uTime*0.72+p.y*5.2+aPhase*1.8)*0.034*sm
              +sin(uTime*0.54+p.x*4.1+p.z*3.2+aPhase)*0.026*sm
              +sin(uTime*3.6+aPhase*2.9)*uHover*0.12*sm
              +uBloom*uBloom*0.85
              +sin(uTime*5.8+aPhase*2.3)*uScrollVel*0.14;
    vec4 mv=modelViewMatrix*vec4(p*r,1.0);
    gl_PointSize=uSize*uRes.y/(-mv.z);
    gl_Position=projectionMatrix*mv;
    vA = uFade;
  }
`;
const orbFrag=`
  uniform vec3 uColor;
  varying float vA;
  void main(){
    float d=length(gl_PointCoord-0.5);
    if(d>0.5)discard;
    gl_FragColor=vec4(uColor,pow(1.0-d*2.0,1.8)*vA);
  }
`;

// ─── Electron orbit shader (shape 1) ──────────────────────────────────────────
const orbitVert=`
  attribute float aBasePhase,aRingTilt,aRingAz,aTrailOffset,aSpeed,aType;
  uniform float uTime,uBloom,uFade,uSize;
  uniform vec2 uRes;
  varying float vA,vTailT;
  void main(){
    vec3 pos;
    if(aType<0.5){
      float angle=aBasePhase+uTime*aSpeed-aTrailOffset*0.10;
      float lx=cos(angle); float lz=sin(angle);
      float ct=cos(aRingTilt),st=sin(aRingTilt);
      float ry=-lz*st; float rz=lz*ct;
      float ca=cos(aRingAz),sa=sin(aRingAz);
      pos=vec3(lx*ca-rz*sa, ry, lx*sa+rz*ca);
      pos*=(1.0+uBloom*0.45);
      float tailT=aTrailOffset/28.0;
      vTailT=tailT;
      bool isHead=aTrailOffset<0.5;
      vA=uFade*(1.0-tailT)*(1.0-tailT)*(isHead ? 2.8 : 1.0);
      float sizeScale=isHead ? 1.6 : (1.0-tailT*0.80);
      vec4 mv=modelViewMatrix*vec4(pos,1.0);
      gl_PointSize=uSize*sizeScale*uRes.y/(-mv.z);
      gl_Position=projectionMatrix*mv;
    } else {
      float angle=aBasePhase+uTime*3.5;
      float nr=0.16+sin(uTime*2.2+aBasePhase)*0.04;
      pos=vec3(cos(angle)*nr,sin(aBasePhase*2.7)*nr*0.8,sin(angle)*nr);
      pos*=(1.0+uBloom*0.45);
      vA=uFade*1.0; vTailT=0.0;
      vec4 mv=modelViewMatrix*vec4(pos,1.0);
      gl_PointSize=uSize*0.45*uRes.y/(-mv.z);
      gl_Position=projectionMatrix*mv;
    }
  }
`;
const orbitFrag=`
  uniform vec3 uColor;
  varying float vA,vTailT;
  void main(){
    float d=length(gl_PointCoord-0.5)*2.0;
    if(d>1.0)discard;
    float core=pow(1.0-d,6.0);
    // Deep saturated head → lighter transparent tail
    // Multiply head by 1.4 to punch the color, tail fades to lighter tint
    vec3 col=mix(uColor*1.4, uColor*0.55, vTailT);
    gl_FragColor=vec4(col, core*vA);
  }
`;

// ─── DNA helix shader (shape 2) ───────────────────────────────────────────────
// ─── Fibonacci spiral shader (shape 2) ───────────────────────────────────────
const spiralVert=`
  attribute float aRadius,aAngle;
  uniform float uTime,uBloom,uFade,uSize;
  uniform vec2 uRes;
  varying float vA,vR;
  void main(){
    // Gentle breathing ripple radiates outward from centre
    float wave=sin(uTime*1.4+aRadius*5.5)*0.055;
    // Bowl shape: centre raised, edge dips slightly
    float bowl=-aRadius*aRadius*0.28+wave;
    float expand=1.0+uBloom*0.45;
    vec3 pos=vec3(aRadius*cos(aAngle), bowl, aRadius*sin(aAngle))*expand;
    vR=aRadius;
    // Centre dots slightly more opaque for that bright-core look
    vA=uFade*(0.80+0.20*(1.0-aRadius/1.15));
    vec4 mv=modelViewMatrix*vec4(pos,1.0);
    gl_PointSize=uSize*uRes.y/(-mv.z);
    gl_Position=projectionMatrix*mv;
  }
`;
const spiralFrag=`
  uniform vec3 uColor;
  varying float vA,vR;
  void main(){
    float d=length(gl_PointCoord-0.5)*2.0;
    if(d>1.0)discard;
    float core=pow(1.0-d,3.0);
    // Slightly brighter at centre of spiral
    vec3 col=uColor*(0.90+0.40*(1.0-vR/1.15));
    gl_FragColor=vec4(col,core*vA*1.2);
  }
`;
const expVert=`
  attribute vec3 aDir,aECol; attribute float aMaxR,aBlobSz;
  uniform float uBloom,uSize; uniform vec2 uRes;
  varying vec3 vECol; varying float vA; varying vec3 vDir;
  void main(){
    float dist=aMaxR*uBloom;
    vec3 pos=aDir*dist;
    vECol=aECol;
    vDir=aDir;
    vA=smoothstep(0.0,0.14,uBloom)*0.70;
    vec4 mv=modelViewMatrix*vec4(pos,1.0);
    gl_PointSize=vA>0.01 ? aBlobSz*uRes.y/(-mv.z)*(0.7+uBloom*1.6) : 0.0;
    gl_Position=projectionMatrix*mv;
  }
`;
const expFrag=`
  varying vec3 vECol; varying float vA; varying vec3 vDir;
  void main(){
    vec2 uv=gl_PointCoord-0.5; // -0.5 to 0.5
    float d=length(uv)*2.0;    // 0 at center, 1 at edge
    if(d>1.0)discard;
    
    // Top-left light source: base highlight lives at upper-left
    // But each bubble faces slightly differently based on its travel direction,
    // so we nudge the highlight by a small fraction of aDir.xy to vary per-bubble
    vec2 dirOffset=vec2(-vDir.x, vDir.y)*0.08; // subtle, not overwhelming
    vec2 hlBase=vec2(-0.16, 0.20);              // base: upper-left
    vec2 hlCenter=hlBase + dirOffset;           // unique per bubble
    
    // 1. Ultra-thin edge ring
    float edgeOuter=smoothstep(1.0, 0.955, d);
    float edgeInner=smoothstep(0.955, 0.915, d);
    float ring=(edgeOuter-edgeInner)*0.40;
    
    // 2. Primary crescent — bright specular from top-left
    float hlDist=length(uv-hlCenter)*2.0;
    float crescent=exp(-hlDist*hlDist*22.0)*0.90;
    
    // 3. Tiny refraction glint — opposite corner, unique per bubble
    vec2 gl2=vec2(0.10,-0.14)-dirOffset*0.5;
    float hl2Dist=length(uv-gl2)*2.0;
    float glint=exp(-hl2Dist*hl2Dist*40.0)*0.30;
    
    // 4. Nearly invisible interior — just the faintest fog
    float interior=max(0.0,1.0-d*d)*0.03;
    
    float alpha=(ring + crescent + glint + interior)*vA;
    gl_FragColor=vec4(1.0, 1.0, 1.0, alpha);
  }
`;

const arcVert=`
  attribute float aT; uniform float uTime,uSpeed; uniform vec3 uP0,uP1,uP2; uniform float uSize; uniform vec2 uRes; varying float vV;
  void main(){float t=mod(aT+uTime*uSpeed,1.0),it=1.0-t;vec3 p=it*it*uP0+2.0*it*t*uP1+t*t*uP2;float v=smoothstep(0.0,0.06,t)*smoothstep(0.28,0.20,t);vV=v;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=v>0.01?uSize*uRes.y/(-mv.z):0.0;gl_Position=projectionMatrix*mv;}
`;
const arcFrag=`uniform vec3 uColor;varying float vV;void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;gl_FragColor=vec4(uColor,pow(1.0-d*2.0,1.6)*vV*0.68);}`;

// ─── Camera adjuster ──────────────────────────────────────────────────────────
function CameraAdjust({isMobile}:{isMobile:boolean}){
  const{camera}=useThree();
  useEffect(()=>{
    const cam=camera as THREE.PerspectiveCamera;
    if(isMobile){cam.position.set(0,0,9.8);cam.fov=58;}
    else{cam.position.set(0,0.3,7.5);cam.fov=54;}
    cam.updateProjectionMatrix();
  },[isMobile,camera]);
  return null;
}

// ─── Explosion particles ──────────────────────────────────────────────────────
function ExplosionParticles({bloomRef}:{bloomRef:React.MutableRefObject<number>}){
  const matRef=useRef<THREE.ShaderMaterial>(null);
  const{size}=useThree(), N=520;
  const{geo,u}=useMemo(()=>{
    const dirs=new Float32Array(N*3),maxR=new Float32Array(N),cols=new Float32Array(N*3),blobSz=new Float32Array(N);
    for(let i=0;i<N;i++){
      const angle=Math.random()*Math.PI*2;
      const zLean=(Math.random()-0.5)*(Math.random()<0.7?0.35:0.9);
      const r=Math.sqrt(Math.max(0,1-zLean*zLean));
      dirs[i*3]=r*Math.cos(angle); dirs[i*3+1]=r*Math.sin(angle); dirs[i*3+2]=zLean;
      maxR[i]=2.8+Math.random()*4.8; // 2.8–7.6 units — fills near-screen without overwhelming
      const c=EXPLODE_COLS[Math.floor(Math.random()*EXPLODE_COLS.length)];
      cols[i*3]=c[0]; cols[i*3+1]=c[1]; cols[i*3+2]=c[2];
      const t=Math.random();
      blobSz[i]= t<0.55 ? 0.04+Math.random()*0.07
               : t<0.82 ? 0.12+Math.random()*0.10
               :          0.22+Math.random()*0.14;
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",  new THREE.BufferAttribute(new Float32Array(N*3),3));
    g.setAttribute("aDir",      new THREE.BufferAttribute(dirs,3));
    g.setAttribute("aMaxR",     new THREE.BufferAttribute(maxR,1));
    g.setAttribute("aECol",     new THREE.BufferAttribute(cols,3));
    g.setAttribute("aBlobSz",   new THREE.BufferAttribute(blobSz,1));
    g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),15);
    return{geo:g,u:{uBloom:{value:0},uSize:{value:0.10},uRes:{value:new THREE.Vector2(size.width,size.height)}}};
  },[]);
  useFrame(()=>{
    if(!matRef.current)return;
    matRef.current.uniforms.uBloom.value=bloomRef.current;
    matRef.current.uniforms.uRes.value.set(size.width,size.height);
  });
  return(<points geometry={geo}><shaderMaterial ref={matRef} uniforms={u} vertexShader={expVert} fragmentShader={expFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points>);
}

// ─── Center disc ──────────────────────────────────────────────────────────────
function CenterDisc({color,bloomRef}:{color:V3;bloomRef:React.MutableRefObject<number>}){
  const matRef=useRef<THREE.MeshBasicMaterial>(null);
  // Wider band + hard opacity cap + softer geometry so the near-white center can
  // never read as a solid white plate — especially over the dark purple petals,
  // where (with bloom postprocessing disabled on mobile) it used to flash in.
  useFrame(()=>{if(matRef.current)matRef.current.opacity=THREE.MathUtils.smoothstep(bloomRef.current,0.40,0.95)*0.5;});
  return(<mesh position={[0,0,0.25]}><circleGeometry args={[0.42,48]}/><meshBasicMaterial ref={matRef} color={new THREE.Color(...color)} transparent opacity={0} depthWrite={false}/></mesh>);
}

// ─── Particle shapes ──────────────────────────────────────────────────────────
type OrbProps={color:V3;speed:number;bloomRef:React.MutableRefObject<number>;hoverRef:React.MutableRefObject<number>;scrollVelRef:React.MutableRefObject<number>;fadeRef:React.MutableRefObject<number>};

// Shape 0: Fibonacci dot sphere (original)
function FibSphere({color,speed,bloomRef,hoverRef,scrollVelRef,fadeRef}:OrbProps){
  const matRef=useRef<THREE.ShaderMaterial>(null),grpRef=useRef<THREE.Group>(null);
  const{size}=useThree(),N=600;
  const{geo,u}=useMemo(()=>{
    const pos=new Float32Array(N*3),ph=new Float32Array(N);
    for(let i=0;i<N;i++){const phi=Math.acos(1-2*(i+0.5)/N),th=Math.PI*(1+Math.sqrt(5))*i;pos[i*3]=Math.sin(phi)*Math.cos(th);pos[i*3+1]=Math.cos(phi);pos[i*3+2]=Math.sin(phi)*Math.sin(th);ph[i]=Math.random()*Math.PI*2;}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("aPhase",new THREE.BufferAttribute(ph,1));
    return{geo:g,u:{uTime:{value:0},uBloom:{value:0},uHover:{value:0},uScrollVel:{value:0},uColor:{value:new THREE.Vector3(...color)},uSize:{value:0.18},uRes:{value:new THREE.Vector2(size.width,size.height)},uFade:{value:1}}};
  },[]);
  useFrame(({clock})=>{
    if(!matRef.current||!grpRef.current)return;
    const t=clock.getElapsedTime(),b=bloomRef.current,h=hoverRef.current,sv=scrollVelRef.current;
    matRef.current.uniforms.uTime.value=t;matRef.current.uniforms.uBloom.value=b;
    matRef.current.uniforms.uHover.value=h;matRef.current.uniforms.uScrollVel.value=sv;
    matRef.current.uniforms.uRes.value.set(size.width,size.height);
    matRef.current.uniforms.uFade.value=fadeRef.current;
    grpRef.current.rotation.y+=speed*(0.22+0.78*(1-b))/4+sv*0.06;
    grpRef.current.rotation.x=0;
  });
  return(<group ref={grpRef}><points geometry={geo}><shaderMaterial ref={matRef} uniforms={u} vertexShader={orbVert} fragmentShader={orbFrag} transparent depthWrite={false} blending={THREE.NormalBlending}/></points></group>);
}

// Shape 1: Electron shell orbits — discrete electron dots with comet tails
function ElectronOrb({color,speed,bloomRef,hoverRef,scrollVelRef,fadeRef}:OrbProps){
  const matRef=useRef<THREE.ShaderMaterial>(null),grpRef=useRef<THREE.Group>(null);
  const{size}=useThree();
  // 3 rings, 2 electrons each, 15 particles per electron (1 head + 14 tail), 80 nucleus
  const RINGS=[
    {tilt:0,            az:0,              spd:2.40},
    {tilt:Math.PI/3,    az:Math.PI/4,      spd:1.85},
    {tilt:-Math.PI/3,   az:Math.PI/2,      spd:2.95},
    {tilt:Math.PI/2,    az:Math.PI/6,      spd:2.20},
  ];
  const ELECTRONS_PER_RING=5, TAIL=28, NUCLEUS=80;
  const PARTICLES_PER_ELECTRON=1+TAIL;
  const ELECTRON_TOTAL=RINGS.length*ELECTRONS_PER_RING*PARTICLES_PER_ELECTRON;
  const N=ELECTRON_TOTAL+NUCLEUS;

  const{geo,u}=useMemo(()=>{
    const aBasePhase=new Float32Array(N),aRingTilt=new Float32Array(N);
    const aRingAz=new Float32Array(N),aTrailOffset=new Float32Array(N);
    const aSpeed=new Float32Array(N),aType=new Float32Array(N);
    const pos=new Float32Array(N*3); // dummy position buffer

    let idx=0;
    RINGS.forEach(ring=>{
      for(let e=0;e<ELECTRONS_PER_RING;e++){
        const phase=(e/ELECTRONS_PER_RING)*Math.PI*2; // evenly space electrons per ring
        for(let t=0;t<PARTICLES_PER_ELECTRON;t++){
          aBasePhase[idx]=phase;
          aRingTilt[idx]=ring.tilt;
          aRingAz[idx]=ring.az;
          aTrailOffset[idx]=t;    // 0=head, 1-14=tail
          aSpeed[idx]=ring.spd;
          aType[idx]=0;
          idx++;
        }
      }
    });
    // Nucleus — small glowing sphere
    for(let i=0;i<NUCLEUS;i++){
      aBasePhase[idx]=Math.random()*Math.PI*2;
      aRingTilt[idx]=Math.random()*Math.PI;
      aRingAz[idx]=Math.random()*Math.PI*2;
      aTrailOffset[idx]=0;
      aSpeed[idx]=1.0;
      aType[idx]=1;
      idx++;
    }

    const g=new THREE.BufferGeometry();
    g.setAttribute("position",  new THREE.BufferAttribute(pos,3));
    g.setAttribute("aBasePhase",new THREE.BufferAttribute(aBasePhase,1));
    g.setAttribute("aRingTilt", new THREE.BufferAttribute(aRingTilt,1));
    g.setAttribute("aRingAz",   new THREE.BufferAttribute(aRingAz,1));
    g.setAttribute("aTrailOffset",new THREE.BufferAttribute(aTrailOffset,1));
    g.setAttribute("aSpeed",    new THREE.BufferAttribute(aSpeed,1));
    g.setAttribute("aType",     new THREE.BufferAttribute(aType,1));
    return{geo:g,u:{uTime:{value:0},uBloom:{value:0},uFade:{value:1},
      uColor:{value:new THREE.Vector3(...color)},uSize:{value:0.52},
      uRes:{value:new THREE.Vector2(size.width,size.height)}}};
  },[]);

  useFrame(({clock})=>{
    if(!matRef.current||!grpRef.current)return;
    const t=clock.getElapsedTime(),b=bloomRef.current;
    matRef.current.uniforms.uTime.value=t;
    matRef.current.uniforms.uBloom.value=b;
    matRef.current.uniforms.uFade.value=fadeRef.current;
    matRef.current.uniforms.uRes.value.set(size.width,size.height);
    // Slow autonomous rotation — NOT linked to scroll, just shows 3D depth
    grpRef.current.rotation.y+=0.0018;
    grpRef.current.rotation.x=Math.sin(t*0.15)*0.14;
  });

  return(<group ref={grpRef}><points geometry={geo}><shaderMaterial ref={matRef} uniforms={u} vertexShader={orbitVert} fragmentShader={orbitFrag} transparent depthWrite={false} blending={THREE.NormalBlending}/></points></group>);
}

// Shape 2: DNA double helix
// Shape 2: Fibonacci spiral disk
function FibSpiral({color,speed,bloomRef,hoverRef,scrollVelRef,fadeRef}:OrbProps){
  const matRef=useRef<THREE.ShaderMaterial>(null),grpRef=useRef<THREE.Group>(null);
  const{size}=useThree();
  const N=700;
  const{geo,u}=useMemo(()=>{
    const pos=new Float32Array(N*3);
    const aRadius=new Float32Array(N),aAngle=new Float32Array(N);
    const goldenAngle=Math.PI*(3-Math.sqrt(5)); // ≈ 2.3999 rad
    const MAX_R=1.15;
    for(let i=0;i<N;i++){
      const t=(i+0.5)/N;
      const r=Math.sqrt(t)*MAX_R;
      const ang=i*goldenAngle;
      const bowl=-r*r*0.28;
      pos[i*3]=r*Math.cos(ang); pos[i*3+1]=bowl; pos[i*3+2]=r*Math.sin(ang);
      aRadius[i]=r; aAngle[i]=ang;
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.BufferAttribute(pos,3));
    g.setAttribute("aRadius",new THREE.BufferAttribute(aRadius,1));
    g.setAttribute("aAngle", new THREE.BufferAttribute(aAngle,1));
    g.computeBoundingSphere();
    return{geo:g,u:{uTime:{value:0},uBloom:{value:0},uFade:{value:1},
      uColor:{value:new THREE.Vector3(...color)},uSize:{value:0.22},
      uRes:{value:new THREE.Vector2(size.width,size.height)}}};
  },[]);
  useFrame(({clock})=>{
    if(!matRef.current||!grpRef.current)return;
    const t=clock.getElapsedTime(),b=bloomRef.current;
    matRef.current.uniforms.uTime.value=t;
    matRef.current.uniforms.uBloom.value=b;
    matRef.current.uniforms.uFade.value=fadeRef.current;
    matRef.current.uniforms.uRes.value.set(size.width,size.height);
    // Spin around Y — this is what makes the spiral hypnotic
    grpRef.current.rotation.y+=0.006;
    // -PI/2 = disc faces camera directly; -0.25 offset = slight tilt like reference image
    grpRef.current.rotation.x=-(Math.PI/2-0.01)+Math.sin(t*0.10)*0.02;
  });
  return(
    <group ref={grpRef}>
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial ref={matRef} uniforms={u} vertexShader={spiralVert} fragmentShader={spiralFrag}
          transparent depthWrite={false} blending={THREE.NormalBlending}/>
      </points>
    </group>
  );
}

// Dispatcher — picks shape by index
function ParticleOrb(props:OrbProps&{shape:number}){
  if(props.shape===1) return <ElectronOrb {...props}/>;
  if(props.shape===2) return <FibSpiral {...props}/>;
  return <FibSphere {...props}/>;
}

// ─── Flower mesh ──────────────────────────────────────────────────────────────
function FlowerMesh({ftype,bloomRef}:{ftype:number;bloomRef:React.MutableRefObject<number>}){
  const matRef=useRef<THREE.ShaderMaterial>(null);
  const geo=useMemo(()=>buildFlowerGeo(ftype),[ftype]);
  const u=useMemo(()=>({uBloom:{value:0},uTime:{value:0},uFade:{value:0}}),[]);
  useFrame(({clock})=>{
    if(!matRef.current)return;
    const b=bloomRef.current;
    matRef.current.uniforms.uBloom.value=b; matRef.current.uniforms.uTime.value=clock.getElapsedTime();
    matRef.current.uniforms.uFade.value=THREE.MathUtils.smoothstep(b,0.10,0.60);
  });
  return(<mesh geometry={geo}><shaderMaterial ref={matRef} uniforms={u} vertexShader={meshVert} fragmentShader={meshFrag} transparent depthWrite={false} side={THREE.DoubleSide}/></mesh>);
}

// ─── Sphere group — purely scroll-driven, no time-based lerp ─────────────────
function SphereGroup({cap,pos,index,scrollRef,maxBloomRef,isMobile,bloomsArr,lookRef}:{
  cap:typeof CAPS[0]; pos:V3; index:number;
  scrollRef:React.MutableRefObject<number>;
  maxBloomRef:React.MutableRefObject<number>;
  isMobile:boolean;
  bloomsArr:React.MutableRefObject<number[]>;
  lookRef:LookRef;
}){
  const bloomCur=useRef(0),hoverCur=useRef(0);
  const fadeRef=useRef(1); // 0=hidden, 1=visible — driven by other spheres' bloom
  const groupRef=useRef<THREE.Group>(null);
  const flowerSpinRef=useRef<THREE.Group>(null);
  const prevScrollY=useRef(0);
  const scrollVelRef=useRef(0);
  const tiltCur=useRef({x:0,y:0}); // smoothed tilt toward the look direction

  useFrame(()=>{
    const raw=scrollRef.current;
    const SPHERE_START=0.01, SPHERE_END=0.99;
    const sp=Math.max(0,Math.min(1,(raw-SPHERE_START)/(SPHERE_END-SPHERE_START)));
    const seg=1/3, s=index*seg, e=(index+1)*seg;
    const t  =Math.max(0,Math.min(1,(sp-s)/(e-s)));

    let bloom=0;
    if(t<0.28)      bloom=smoothstep(0,0.28,t);
    else if(t<0.68) bloom=1;
    else            bloom=1-smoothstep(0.68,1.0,t);
    // Ease bloom instead of teleporting it. During an iOS momentum scroll
    // scrollRef jumps in large discrete steps, so a hard assignment made bloom
    // leap across thresholds in a single frame — snapping the center disc, petal
    // open/close and explosion in/out (the flashes). Easing makes it glide.
    bloomCur.current += (bloom - bloomCur.current) * 0.18;

    // Write our bloom into the shared array, then read the max of the other two
    bloomsArr.current[index]=bloomCur.current;
    const otherBloom=Math.max(
      bloomsArr.current[(index+1)%3],
      bloomsArr.current[(index+2)%3]
    );
    // When another sphere is at peak bloom, fade this orb to ~10%
    // Smooth lerp so it doesn't snap
    const targetFade=1-otherBloom*0.90;
    fadeRef.current += (targetFade - fadeRef.current) * 0.06;

    const currentY = typeof window!=="undefined" ? window.scrollY : 0;
    const pixelDelta = Math.abs(currentY - prevScrollY.current);
    prevScrollY.current = currentY;
    scrollVelRef.current = scrollVelRef.current * 0.78 + pixelDelta;
    const normVel = Math.min(1, scrollVelRef.current / 80);

    hoverCur.current += (Math.max(bloom*0.25, normVel) - hoverCur.current) * 0.18;
    maxBloomRef.current = Math.max(maxBloomRef.current*0.92, bloom);
    scrollVelRef.current = normVel;

    if(flowerSpinRef.current){
      const spinT = Math.max(0,Math.min(1, t / 0.68));
      flowerSpinRef.current.rotation.z = spinT * Math.PI;
    }

    if(!groupRef.current)return;

    const TRAVEL=2.2;
    let gY=0;
    if(t<0.28)      gY=-TRAVEL+TRAVEL*(t/0.28);
    else if(t<0.72) gY=0;
    else            gY=TRAVEL*((t-0.72)/0.28);

    let gX=pos[0];
    if(t<0.28)      gX=pos[0]*(1-t/0.28);
    else if(t<0.72) gX=0;
    else            gX=pos[0]*((t-0.72)/0.28);

    const baseScale = isMobile ? 0.52 : 1;
    const scale = baseScale * (1 + bloom * 0.45);

    groupRef.current.position.set(gX, gY, 0);
    groupRef.current.scale.setScalar(scale);

    // Tilt the whole assembly toward the look direction (cursor / phone tilt).
    // Runs continuously — including during scroll — so the flowers tilt and
    // scroll together. It's cheap: this lerp lives inside the WebGL frame loop
    // that already runs every frame, so it adds no scroll-time DOM work.
    const MAXT = 0.30;
    tiltCur.current.x += (lookRef.current.y * MAXT - tiltCur.current.x) * 0.06;
    tiltCur.current.y += (lookRef.current.x * MAXT - tiltCur.current.y) * 0.06;
    groupRef.current.rotation.x = tiltCur.current.x;
    groupRef.current.rotation.y = tiltCur.current.y;
  });

  const fl=FLOWERS[cap.ftype];
  return(
    <group ref={groupRef} position={pos} renderOrder={index}>
      <ParticleOrb shape={index} color={cap.color} speed={cap.speed} bloomRef={bloomCur} hoverRef={hoverCur} scrollVelRef={scrollVelRef} fadeRef={fadeRef}/>
      <group ref={flowerSpinRef}>
        <FlowerMesh  ftype={cap.ftype} bloomRef={bloomCur}/>
        <CenterDisc  color={fl.centerCol} bloomRef={bloomCur}/>
      </group>
      <ExplosionParticles bloomRef={bloomCur}/>
    </group>
  );
}

// ─── Arc + Grid ───────────────────────────────────────────────────────────────
function ConnectionArc({from,to,color,speed}:{from:V3;to:V3;color:V3;speed:number}){
  const mA=useRef<THREE.ShaderMaterial>(null),mB=useRef<THREE.ShaderMaterial>(null);
  const{size}=useThree(),N=90;
  const{gA,gB,uA,uB}=useMemo(()=>{
    const ctrl=new THREE.Vector3((from[0]+to[0])/2,Math.max(from[1],to[1])+1.9,0);
    const aT=Float32Array.from({length:N},(_,i)=>i/N),dummy=new Float32Array(N*3);
    const mg=()=>{const g=new THREE.BufferGeometry();g.setAttribute("aT",new THREE.BufferAttribute(aT.slice(),1));g.setAttribute("position",new THREE.BufferAttribute(dummy.slice(),3));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),10);return g;};
    const mu=()=>({uTime:{value:0},uSpeed:{value:speed},uP0:{value:new THREE.Vector3(...from)},uP1:{value:ctrl.clone()},uP2:{value:new THREE.Vector3(...to)},uColor:{value:new THREE.Vector3(...color)},uSize:{value:0.036},uRes:{value:new THREE.Vector2(size.width,size.height)}});
    return{gA:mg(),gB:mg(),uA:mu(),uB:mu()};
  },[]);
  useFrame(({clock})=>{const t=clock.getElapsedTime();[mA,mB].forEach((r,i)=>{if(r.current){r.current.uniforms.uTime.value=t+i*0.5;r.current.uniforms.uRes.value.set(size.width,size.height);}});});
  return(<><points geometry={gA}><shaderMaterial ref={mA} uniforms={uA} vertexShader={arcVert} fragmentShader={arcFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points><points geometry={gB}><shaderMaterial ref={mB} uniforms={uB} vertexShader={arcVert} fragmentShader={arcFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points></>);
}

// ─── Background gradient — inside Three.js so canvas is fully opaque ─────────
// Blobs of brand colour on a pale base; uScroll shifts their positions.

const bgVert=`
  varying vec2 vUv;
  void main(){
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`;
const bgFrag=`
  precision mediump float;
  varying vec2 vUv;
  uniform float uScroll;
  uniform float uReveal;   // 0=pure white, 1=full colour — driven by scroll
  uniform float uColorPhase; // 0-1, drives which color scheme

  float blob(vec2 uv, vec2 centre, float radius){
    return clamp(1.0 - length(uv - centre)/radius, 0.0, 1.0);
  }

  void main(){
    vec2 uv = vUv;
    float s = uScroll;

    float b1 = blob(uv, vec2(0.10 + s*0.08, 0.30 - s*0.05), 0.58);
    float b2 = blob(uv, vec2(0.78 - s*0.07, 0.12 + s*0.10), 0.64);
    float b3 = blob(uv, vec2(0.45 + s*0.05, 0.62 - s*0.08), 0.60);
    float b4 = blob(uv, vec2(0.18 - s*0.05, 0.72 + s*0.07), 0.54);
    float b5 = blob(uv, vec2(0.82 + s*0.04, 0.52 - s*0.07), 0.56);

    vec3 base = vec3(0.97, 0.96, 0.93);

    // Three color schemes — Warm Gold, Emerald Green, Deep Teal
    // Palette 0: Warm Gold — rich, sophisticated
    vec3 p0_b1 = vec3(0.85, 0.64, 0.26);
    vec3 p0_b2 = vec3(0.90, 0.70, 0.33);
    vec3 p0_b3 = vec3(0.95, 0.77, 0.42);
    vec3 p0_b4 = vec3(0.87, 0.66, 0.29);
    vec3 p0_b5 = vec3(0.80, 0.58, 0.21);
    
    // Palette 1: Emerald Green — rich, natural, luxurious
    vec3 p1_b1 = vec3(0.05, 0.55, 0.35);
    vec3 p1_b2 = vec3(0.08, 0.62, 0.42);
    vec3 p1_b3 = vec3(0.10, 0.68, 0.48);
    vec3 p1_b4 = vec3(0.06, 0.58, 0.38);
    vec3 p1_b5 = vec3(0.04, 0.52, 0.32);
    
    // Palette 2: Deep Teal — cool, sophisticated, modern
    vec3 p2_b1 = vec3(0.08, 0.50, 0.62);
    vec3 p2_b2 = vec3(0.12, 0.58, 0.70);
    vec3 p2_b3 = vec3(0.15, 0.65, 0.78);
    vec3 p2_b4 = vec3(0.10, 0.52, 0.65);
    vec3 p2_b5 = vec3(0.06, 0.48, 0.58);

    // Interpolate between palettes based on phase
    float phase = mod(uColorPhase, 3.0);
    vec3 c_b1, c_b2, c_b3, c_b4, c_b5;
    
    if (phase < 1.0) {
      // Blend 0 → 1
      float t = phase;
      c_b1 = mix(p0_b1, p1_b1, t);
      c_b2 = mix(p0_b2, p1_b2, t);
      c_b3 = mix(p0_b3, p1_b3, t);
      c_b4 = mix(p0_b4, p1_b4, t);
      c_b5 = mix(p0_b5, p1_b5, t);
    } else if (phase < 2.0) {
      // Blend 1 → 2
      float t = phase - 1.0;
      c_b1 = mix(p1_b1, p2_b1, t);
      c_b2 = mix(p1_b2, p2_b2, t);
      c_b3 = mix(p1_b3, p2_b3, t);
      c_b4 = mix(p1_b4, p2_b4, t);
      c_b5 = mix(p1_b5, p2_b5, t);
    } else {
      // Blend 2 → 0
      float t = phase - 2.0;
      c_b1 = mix(p2_b1, p0_b1, t);
      c_b2 = mix(p2_b2, p0_b2, t);
      c_b3 = mix(p2_b3, p0_b3, t);
      c_b4 = mix(p2_b4, p0_b4, t);
      c_b5 = mix(p2_b5, p0_b5, t);
    }

    vec3 col = base;
    col = mix(col, c_b1, b1 * 0.95);
    col = mix(col, c_b2, b2 * 0.92);
    col = mix(col, c_b3, b3 * 0.90);
    col = mix(col, c_b4, b4 * 0.94);
    col = mix(col, c_b5, b5 * 0.91);

    vec3 final = mix(vec3(1.0), col, uReveal);
    
    // Top-left light source: subtle brightness falloff from upper-left corner
    // uv.x: 0=left, 1=right  |  uv.y: 0=bottom, 1=top
    float topLeftBias = (1.0 - uv.x) * uv.y; // bright at top-left, dark at bottom-right
    float lightLift = topLeftBias * 0.10 * uReveal; // only visible when colors are showing
    final = clamp(final + lightLift, 0.0, 1.0);
    
    gl_FragColor = vec4(final, 1.0);
  }
`;

function BackgroundPlane({scrollRef}:{scrollRef:React.MutableRefObject<number>}){
  const matRef=useRef<THREE.ShaderMaterial>(null);
  const u=useMemo(()=>({uScroll:{value:0},uReveal:{value:0},uColorPhase:{value:0}}),[]);
  useFrame(()=>{
    if(!matRef.current)return;
    const p=scrollRef.current;
    // Gentle 8% fade: colours ease in over the first ~160vh of scroll, not instantly
    const fadeIn  = Math.min(1, 0.05 + 0.95 * (p / 0.08));
    const fadeOut = Math.min(1, 0.05 + 0.95 * ((1-p) / 0.04));
    matRef.current.uniforms.uScroll.value  = p;
    matRef.current.uniforms.uReveal.value  = fadeIn * fadeOut;
    // Color phase: 0-3, cycles through 3 color palettes as you scroll
    // Each sphere gets 1/3 of the total scroll range
    matRef.current.uniforms.uColorPhase.value = p * 3;
  });
  return(
    <mesh position={[0,0,-5]} renderOrder={-1}>
      <planeGeometry args={[32,20]}/>
      <shaderMaterial ref={matRef} uniforms={u} vertexShader={bgVert} fragmentShader={bgFrag}
        depthTest={false} depthWrite={false}/>
    </mesh>
  );
}

function Scene({positions,isMobile,scrollRef,maxBloomRef,lookRef}:{positions:V3[];isMobile:boolean;scrollRef:React.MutableRefObject<number>;maxBloomRef:React.MutableRefObject<number>;lookRef:LookRef;}){
  const bloomsArr=useRef([0,0,0]);
  return(<>
    <CameraAdjust isMobile={isMobile}/>
    <BackgroundPlane scrollRef={scrollRef}/>
    {CAPS.map((c,i)=>(
      <SphereGroup key={i} cap={c} pos={positions[i]} index={i} scrollRef={scrollRef} maxBloomRef={maxBloomRef} isMobile={isMobile} bloomsArr={bloomsArr} lookRef={lookRef}/>
    ))}
    {!isMobile&&<>
      <ConnectionArc from={positions[0]} to={positions[1]} color={CAPS[0].color} speed={0.13}/>
      <ConnectionArc from={positions[1]} to={positions[2]} color={CAPS[1].color} speed={0.10}/>
    </>}
  </>);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function CapabilitySpheres(){
  const sectionRef  = useRef<HTMLElement>(null);
  const scrollRef   = useRef(0);
  const maxBloomRef = useRef(0);
  const[isMobile,setIsMobile]=useState(false);
  const[activeIndex,setActiveIndex]=useState<number|null>(null);

  // DOM refs — animated directly by rAF
  const headlineRef  = useRef<HTMLDivElement>(null);
  const hlWordRef    = useRef<HTMLDivElement>(null);
  const hlScriptRef  = useRef<HTMLDivElement>(null);
  const hlLineRef    = useRef<HTMLDivElement>(null);
  const entryStartRef = useRef<number|null>(null);
  const glRef        = useRef<THREE.WebGLRenderer|null>(null);
  const pillRef      = useRef<HTMLDivElement>(null);
  const cardWrapRef  = useRef<HTMLDivElement>(null);
  const detailRef    = useRef<HTMLDivElement>(null);
  const bulletRefs   = useRef<(HTMLLIElement|null)[]>([]);

  useEffect(()=>{
    setIsMobile(window.matchMedia("(pointer:coarse)").matches||window.innerWidth<768);
  },[]);

  // Shared "look" direction the flowers tilt toward: cursor on desktop, gyro on
  // mobile. A plain ref bridges the gyro MotionValue across the R3F boundary.
  const tilt = useDeviceTilt();
  const lookRef = useRef({x:0,y:0});
  // Pause the WebGL render loop whenever the scene is off-screen. Two
  // frameloop:"always" canvases (this + the Hero backdrop) rendering at retina
  // the whole time were the dominant cause of scroll stutter. 200px margin keeps
  // it warm just before entry so there's no cold first frame.
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(stageRef, { margin: "200px" });
  useEffect(()=>{
    // Desktop only — on touch the scrolling finger fires pointermove and would
    // yank the flowers around mid-scroll. Touch uses the gyro instead (below).
    if(window.matchMedia("(pointer:coarse)").matches)return;
    const onMove=(e:PointerEvent)=>{
      if(e.pointerType==="touch")return;
      lookRef.current.x=(e.clientX/window.innerWidth)*2-1;
      lookRef.current.y=(e.clientY/window.innerHeight)*2-1;
    };
    window.addEventListener("pointermove",onMove,{passive:true});
    return()=>window.removeEventListener("pointermove",onMove);
  },[]);
  useEffect(()=>{
    if(!tilt?.enabled)return;
    const apply=()=>{lookRef.current.x=tilt.tiltX.get();lookRef.current.y=tilt.tiltY.get();};
    apply();
    const ux=tilt.tiltX.on("change",apply);
    const uy=tilt.tiltY.on("change",apply);
    return()=>{ux();uy();};
  },[tilt]);

  // Inject Dancing Script handwriting font
  useEffect(()=>{
    if(!document.querySelector('#norvo-dancing')){
      const l=document.createElement('link');
      l.id='norvo-dancing'; l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
      document.head.appendChild(l);
    }
  },[]);

  // Force WebGL context disposal on unmount — prevents context limit (max ~8) on reloads
  useEffect(()=>{
    return()=>{
      const gl=glRef.current;
      if(gl){
        gl.dispose();
        const ctx=gl.domElement?.getContext('webgl2')||gl.domElement?.getContext('webgl');
        (ctx as any)?.getExtension('WEBGL_lose_context')?.loseContext();
        glRef.current=null;
      }
    };
  },[]);

  useEffect(()=>{
    const onScroll=()=>{
      const el=sectionRef.current; if(!el)return;
      const rect=el.getBoundingClientRect();
      const total=el.offsetHeight-window.innerHeight;
      scrollRef.current=Math.max(0,Math.min(1,-rect.top/total));
      // Trigger headline animation when section is roughly 50% visible
      if(rect.top < window.innerHeight * 0.5 && entryStartRef.current===null){
        entryStartRef.current=performance.now();
      }
      const SPHERE_START=0.01,SPHERE_END=0.99;
      const sp=Math.max(0,Math.min(1,(scrollRef.current-SPHERE_START)/(SPHERE_END-SPHERE_START)));
      const seg=1/3;
      let next:number|null=null;
      for(let i=0;i<3;i++){
        const t=(sp-i*seg)/seg;
        if(t>0&&t<1){next=i;break;}
      }
      setActiveIndex(a=>a===next?a:next);
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    onScroll();
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);

  useEffect(()=>{
    let raf=0;
    const tick=()=>{
      const p=scrollRef.current;
      const SPHERE_START=0.01,SPHERE_END=0.99;
      const sp=Math.max(0,Math.min(1,(p-SPHERE_START)/(SPHERE_END-SPHERE_START)));
      const seg=1/3;
      let t=0;
      for(let i=0;i<3;i++){
        const ti=(sp-i*seg)/seg;
        if(ti>0&&ti<1){t=ti;break;}
      }

      // ── Headline ────────────────────────────────────────────────────────────
      const entryRaw = entryStartRef.current ? Math.min(1,(performance.now()-entryStartRef.current)/1300) : 0;
      const ease=(t:number)=>1-Math.pow(1-t,3);
      // Scroll-linked exit: gone by p=0.18 (before first flower is centered)
      const hlOut = Math.max(0,Math.min(1,1-(p-0.07)/0.11));
      const hlY   = Math.max(0,(p-0.12)/0.06)*(-28);
      if(headlineRef.current){
        headlineRef.current.style.opacity=hlOut.toFixed(3);
        headlineRef.current.style.transform=`translateY(${hlY.toFixed(1)}px)`;
      }
      // "experience" — rises in at entry start
      const wordT = ease(Math.min(1,entryRaw/0.40));
      if(hlWordRef.current){
        hlWordRef.current.style.opacity=(wordT*hlOut).toFixed(3);
        hlWordRef.current.style.transform=`translateY(${((1-wordT)*22).toFixed(1)}px)`;
      }
      // "Design" — clip-path wipe left→right (handwriting), starts 0.22s in
      const scriptT = ease(Math.max(0,Math.min(1,(entryRaw-0.22)/0.65)));
      if(hlScriptRef.current){
        hlScriptRef.current.style.clipPath=`inset(0 ${((1-scriptT)*100).toFixed(1)}% 0 0)`;
        hlScriptRef.current.style.opacity=hlOut.toFixed(3);
      }
      // Gradient line — grows after Design is mostly drawn
      const lineT = ease(Math.max(0,Math.min(1,(entryRaw-0.60)/0.38)));
      if(hlLineRef.current){
        hlLineRef.current.style.transform=`scaleX(${lineT.toFixed(3)})`;
        hlLineRef.current.style.opacity=(lineT*hlOut).toFixed(3);
      }

      // ── Index pill ──────────────────────────────────────────────────────
      const pillIn  = Math.max(0,Math.min(1,(t-0.08)/0.14));
      const pillOut = Math.max(0,Math.min(1,(t-0.86)/0.11));
      const pillA   = pillIn*(1-pillOut);
      if(pillRef.current){
        pillRef.current.style.opacity=pillA.toFixed(3);
        pillRef.current.style.transform=`translateY(${((1-pillA)*-10).toFixed(1)}px)`;
      }

      // ── Card ────────────────────────────────────────────────────────────
      const cardIn  = Math.max(0,Math.min(1,(t-0.36)/0.16));
      const cardOut = Math.max(0,Math.min(1,(t-0.82)/0.14));
      const cardA   = cardIn*(1-cardOut);
      if(cardWrapRef.current){
        cardWrapRef.current.style.opacity=cardA.toFixed(3);
        cardWrapRef.current.style.transform=
          `translateY(${((1-cardIn)*24).toFixed(1)}px) scale(${(0.82+cardIn*0.18).toFixed(3)})`;
      }

      // ── Detail ──────────────────────────────────────────────────────────
      const detIn  = Math.max(0,Math.min(1,(t-0.52)/0.12));
      const detOut = Math.max(0,Math.min(1,(t-0.84)/0.12));
      if(detailRef.current){
        detailRef.current.style.opacity=(detIn*(1-detOut)).toFixed(3);
        detailRef.current.style.transform=`translateY(${((1-detIn)*14).toFixed(1)}px)`;
      }

      // ── Bullets ─────────────────────────────────────────────────────────
      bulletRefs.current.forEach((el,i)=>{
        if(!el)return;
        const bIn  = Math.max(0,Math.min(1,(t-0.60-i*0.03)/0.10));
        const bOut = Math.max(0,Math.min(1,(t-0.85)/0.11));
        el.style.opacity=(bIn*(1-bOut)).toFixed(3);
        el.style.transform=`translateX(${((1-bIn)*-8).toFixed(1)}px)`;
      });

      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[]);

  const positions=isMobile?MOBILE_POS:DESKTOP_POS;
  const c=activeIndex!==null?CAPS[activeIndex]:null;

  return(
    <section ref={sectionRef} style={{height:"2000vh",position:"relative"}}>
      <div style={{
        position:"sticky",top:0,height:"100vh",overflow:"hidden",
        display:"flex",flexDirection:"column",
        zIndex:1,
      }}>
        {/* ── Scroll headline ─────────────────────────────────────────────── */}
        <div ref={headlineRef} style={{
          position:"absolute",inset:0,pointerEvents:"none",zIndex:5,
          display:"flex",alignItems:"flex-start",justifyContent:"center",
          paddingTop:"18vh",
        }}>
          <div style={{textAlign:"center",userSelect:"none"}}>
            {/* "experience" — minimal tracked uppercase, rises in */}
            <div ref={hlWordRef} style={{
              fontFamily:"var(--font-sora)",fontWeight:300,
              fontSize:isMobile?"15px":"20px",
              letterSpacing:"0.48em",textTransform:"uppercase",
              color:"rgba(10,10,10,0.50)",
              opacity:0,paddingLeft:"0.48em",
              marginBottom:isMobile?"6px":"10px",
            }}>
              experience
            </div>

            {/* "Design" — Dancing Script, flowing cursive, gradient, draws in */}
            <div ref={hlScriptRef} style={{
              fontFamily:"'Dancing Script',cursive",fontWeight:700,
              fontSize:isMobile?"88px":"152px",
              lineHeight:0.88,
              background:"linear-gradient(135deg,#0D7A7A 15%,#D9A441 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              clipPath:"inset(0 100% 0 0)",
              display:"block",letterSpacing:"-0.01em",
            }}>
              Design
            </div>

            {/* Gradient underline grows left→right */}
            <div style={{display:"flex",justifyContent:"center",marginTop:isMobile?"14px":"20px"}}>
              <div ref={hlLineRef} style={{
                width:isMobile?"160px":"270px",height:"1.5px",
                background:"linear-gradient(90deg,#0D7A7A,#D9A441)",
                transformOrigin:"left center",transform:"scaleX(0)",opacity:0,
              }}/>
            </div>
          </div>
        </div>
        <div ref={stageRef} style={{flex:1,position:"relative"}}>
          <CanvasBoundary>
          <Canvas frameloop={sceneInView ? "always" : "never"} camera={{position:[0,0.3,7.5],fov:54}} dpr={[1, isMobile ? 1.25 : 2]}
            gl={{antialias:!isMobile,alpha:false,powerPreference:"high-performance"}}
            onCreated={({gl})=>{gl.setClearColor(0xf8f7ff,1);glRef.current=gl;}}>
            <Suspense fallback={null}>
              <Scene positions={positions} isMobile={isMobile} scrollRef={scrollRef} maxBloomRef={maxBloomRef} lookRef={lookRef}/>
            </Suspense>
            {!isMobile && (
              <EffectComposer>
                <Bloom intensity={0.85} luminanceThreshold={0.88} luminanceSmoothing={0.88} mipmapBlur/>
                <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0009,0.0009)}/>
                <Vignette offset={0.30} darkness={0.32} blendFunction={BlendFunction.NORMAL}/>
              </EffectComposer>
            )}
          </Canvas>
          </CanvasBoundary>

          {/* Top: white → transparent — thin edge blend with Projects above */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10"
               style={{height:"12%",background:"linear-gradient(to bottom,#ffffff 0%,transparent 100%)"}}/>

          {/* Bottom: transparent → white — small fade at bottom only */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
               style={{height:"20%",background:"linear-gradient(to top, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 12%, transparent 30%)"}}/>

          {/* Index pill */}
          <div ref={pillRef} className="pointer-events-none absolute left-0 right-0 flex justify-center"
               style={{top: isMobile ? "calc(env(safe-area-inset-top, 0px) + 4.75rem)" : "clamp(16px,2.5vh,32px)", opacity:0, zIndex:5}}>
            {c&&(
              <div style={{
                display:"flex",alignItems:"center",gap:"10px",
                background:"rgba(255,255,255,0.08)",
                backdropFilter:"blur(24px) saturate(180%)",
                WebkitBackdropFilter:"blur(24px) saturate(180%)",
                border:"1px solid rgba(255,255,255,0.32)",
                borderRadius:"999px",
                padding: isMobile ? "6px 16px" : "7px 20px",
                backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 100%)",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.65), inset 1px 0 0 rgba(255,255,255,0.30), 0 4px 24px rgba(80,60,200,0.08)",
              }}>
                <span style={{fontSize: isMobile?"10px":"11px",letterSpacing:"0.35em",textTransform:"uppercase",color:c.hex,fontFamily:"var(--font-sora)",fontWeight:400}}>
                  {String(activeIndex!+1).padStart(2,"0")}
                </span>
                <span style={{width:1,height:12,background:"rgba(255,255,255,0.35)"}}/>
                <span style={{fontSize: isMobile?"10px":"11px",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(20,10,60,0.65)",fontFamily:"var(--font-sora)",fontWeight:300}}>
                  {c.sub}
                </span>
              </div>
            )}
          </div>

          {/* Card — bottom-anchored on mobile so it never overlaps the sphere */}
          <div ref={cardWrapRef} className="pointer-events-none absolute left-0 right-0 flex justify-center"
               style={{
                 ...(isMobile ? {bottom:"22%"} : {top:"52%"}),
                 opacity:0, transformOrigin:"50% 100%",
                 transform:"translateY(24px) scale(0.82)", zIndex:5,
               }}>
            {c&&(
              <div style={{
                background:"rgba(255,255,255,0.22)",
                backdropFilter:"blur(32px) saturate(200%)",
                WebkitBackdropFilter:"blur(32px) saturate(200%)",
                border:"1px solid rgba(255,255,255,0.28)",
                borderRadius: isMobile ? "16px" : "20px",
                padding: isMobile ? "14px 18px" : "clamp(16px,2.2vw,28px) clamp(20px,3vw,38px)",
                maxWidth: isMobile ? "92vw" : "clamp(280px,48vw,520px)",
                width:"90%",
                // Top-left light: bright top-left corner sheen, darker bottom-right
                backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.14) 55%, rgba(255,255,255,0.06) 100%)",
                boxShadow:`inset 0 1px 0 rgba(255,255,255,0.70), inset 1px 0 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(255,255,255,0.15)`,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px"}}>
                  <span style={{fontSize:"10px",letterSpacing:"0.3em",textTransform:"uppercase",color:c.hex,fontFamily:"var(--font-sora)",fontWeight:400,transition:"color 0.4s ease"}}>{String(activeIndex!+1).padStart(2,"0")}</span>
                  <span style={{flex:1,height:"0.5px",background:`linear-gradient(to right,${c.hex}70,transparent)`,transition:"background 0.4s ease"}}/>
                  <span style={{fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(20,10,60,0.38)",fontFamily:"var(--font-sora)",fontWeight:300}}>of 03</span>
                </div>
                <p style={{fontSize: isMobile ? "clamp(20px,5.5vw,28px)" : "clamp(17px,2vw,26px)",fontWeight:500,letterSpacing:"-0.02em",fontFamily:"var(--font-sora)",color:"rgba(10,5,40,0.90)",lineHeight:1.15,marginBottom:"4px"}}>{c.label}</p>
                <p style={{fontSize: isMobile ? "clamp(12px,3.5vw,15px)" : "clamp(11px,1vw,14px)",color:"rgba(20,10,60,0.52)",fontFamily:"var(--font-sora)",fontWeight:300,letterSpacing:"0.02em"}}>{c.sub}</p>
                <div ref={detailRef} style={{opacity:0,transform:"translateY(14px)",marginTop:"12px"}}>
                  {!isMobile && (
                    <p style={{fontSize:"clamp(11px,1.05vw,14px)",color:"rgba(10,5,40,0.70)",fontFamily:"var(--font-sora)",fontWeight:300,lineHeight:1.72,letterSpacing:"0.005em",marginBottom:"12px"}}>{c.detail}</p>
                  )}
                  <ul style={{listStyle:"none",padding:0,margin:0,display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap: isMobile ? "6px" : "7px 14px"}}>
                    {c.bullets.map((b,i)=>(
                      <li key={i} ref={el=>{bulletRefs.current[i]=el;}}
                          style={{display:"flex",alignItems:"center",gap:"7px",fontSize: isMobile ? "clamp(12px,3vw,14px)" : "clamp(10px,0.9vw,12px)",color:"rgba(10,5,40,0.60)",fontFamily:"var(--font-sora)",fontWeight:300,opacity:0,transform:"translateX(-8px)"}}>
                        <span style={{width:4,height:4,borderRadius:"50%",background:c.hex,flexShrink:0,boxShadow:`0 0 6px ${c.hex}cc`,transition:"background 0.4s ease, box-shadow 0.4s ease"}}/>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}