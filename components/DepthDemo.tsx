"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export default function DepthDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 14 });
  const sy = useSpring(my, { stiffness: 40, damping: 14 });

  const bg1x  = useTransform(sx, v => v * -54);  const bg1y  = useTransform(sy, v => v * -44);
  const bg2x  = useTransform(sx, v => v * -60);  const bg2y  = useTransform(sy, v => v * -48);
  const navx  = useTransform(sx, v => v * -26);  const navy  = useTransform(sy, v => v * -20);
  const herox = useTransform(sx, v => v *  50);  const heroy = useTransform(sy, v => v *  38);
  const card1x= useTransform(sx, v => v *  38);  const card1y= useTransform(sy, v => v *  32);
  const card2x= useTransform(sx, v => v *  72);  const card2y= useTransform(sy, v => v *  58);
  const dotx  = useTransform(sx, v => v * 104);  const doty  = useTransform(sy, v => v *  84);
  const tagx  = useTransform(sx, v => v * 122);  const tagy  = useTransform(sy, v => v *  98);
  const rotateX = useTransform(sy, v => v * -18);
  const rotateY = useTransform(sx, v => v *  18);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      const angle = p * Math.PI * 2;
      const mob = window.innerWidth < 768;
      mx.set(Math.sin(angle) * (mob ? 0.24 : 0.52));
      my.set(Math.sin(angle * 1.5 + Math.PI / 4) * (mob ? 0.18 : 0.38));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mx, my]);

  // Shared chrome elements
  const BrowserFrame = ({ portrait }: { portrait: boolean }) => (
    <motion.div style={{
      position:"absolute", inset:0, borderRadius:"14px",
      background:"linear-gradient(160deg, rgba(255,255,255,0.55), rgba(240,240,255,0.30))",
      border:"1px solid rgba(255,255,255,0.75)",
      boxShadow:"0 2px 0 rgba(255,255,255,0.8) inset, 0 24px 80px rgba(13,122,122,0.10), 0 4px 16px rgba(0,0,0,0.06)",
      backdropFilter:"blur(2px)", x:navx, y:navy,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 14px 8px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ width:9, height:9, borderRadius:"50%", background:"#FF5F57", flexShrink:0 }} />
        <div style={{ width:9, height:9, borderRadius:"50%", background:"#FFBD2E", flexShrink:0 }} />
        <div style={{ width:9, height:9, borderRadius:"50%", background:"#27C840", flexShrink:0 }} />
        <div style={{ flex:1, margin:"0 8px", height:"18px", borderRadius:"5px", background:"rgba(0,0,0,0.06)", display:"flex", alignItems:"center", paddingLeft:"8px" }}>
          <span style={{ fontSize:"9px", color:"rgba(0,0,0,0.35)", fontFamily:"var(--font-geist)" }}>yourbrand.com</span>
        </div>
      </div>
      {portrait ? (
        // Portrait: hamburger nav
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontFamily:"var(--font-sora)", fontSize:"12px", fontWeight:600, background:"linear-gradient(135deg,#0D7A7A,#D9A441)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Studio</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"3px", padding:"2px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width:16, height:1.5, background:"rgba(10,10,10,0.4)", borderRadius:2 }} />)}
          </div>
        </div>
      ) : (
        // Landscape: full nav
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontFamily:"var(--font-sora)", fontSize:"13px", fontWeight:600, background:"linear-gradient(135deg,#0D7A7A,#D9A441)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Studio</div>
          <div style={{ display:"flex", gap:"18px" }}>
            {["Work","About","Services"].map(l => <span key={l} style={{ fontSize:"11px", color:"rgba(10,10,10,0.45)", fontFamily:"var(--font-geist)" }}>{l}</span>)}
          </div>
          <div style={{ fontSize:"11px", fontWeight:500, color:"#0D7A7A", fontFamily:"var(--font-geist)" }}>Start a project →</div>
        </div>
      )}
    </motion.div>
  );

  const glassCard = {
    background:"linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.50) 100%)",
    border:"1px solid rgba(255,255,255,0.90)",
    backdropFilter:"blur(24px) saturate(200%)",
    boxShadow:"0 1px 0 rgba(255,255,255,1.0) inset, 0 12px 40px rgba(13,122,122,0.10), 0 4px 16px rgba(0,0,0,0.06)",
  };

  return (
    <section ref={sectionRef} style={{ position:"relative", height:"240vh", background:"#ffffff" }}>
      <div style={{ position:"sticky", top:0, height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap: isMobile ? "20px" : "28px" }}>

        {/* Label */}
        <div style={{ textAlign:"center", pointerEvents:"none" }}>
          <div style={{ fontFamily:"var(--font-sora)", fontSize:"11px", fontWeight:400, letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(10,10,10,0.38)", marginBottom:"10px" }}>How it feels</div>
          <div style={{ fontFamily:"var(--font-sora)", fontSize: isMobile ? "24px" : "32px", fontWeight:600, color:"#0a0a0a", letterSpacing:"-0.5px", lineHeight:1.2 }}>Real depth, not flat design</div>
        </div>

        {isMobile ? (
          /* ─── PORTRAIT MOBILE DEMO (340×480) ─── */
          <motion.div style={{
            position:"relative", width:340, height:480,
            perspective:900, rotateX, rotateY,
            overflow:"hidden", borderRadius:"14px",
          }}>
            {/* Blobs */}
            <motion.div style={{ position:"absolute", width:"100%", height:"60%", top:"-15%", left:"-10%", background:"radial-gradient(ellipse, rgba(13,122,122,0.16) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(50px)", x:bg1x, y:bg1y }} />
            <motion.div style={{ position:"absolute", width:"80%", height:"55%", right:"-15%", bottom:"-10%", background:"radial-gradient(ellipse, rgba(217,164,65,0.13) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(45px)", x:bg2x, y:bg2y }} />

            <BrowserFrame portrait />

            {/* Hero text — upper half */}
            <motion.div style={{ position:"absolute", left:"6%", top:"28%", x:herox, y:heroy }}>
              <div style={{ fontFamily:"var(--font-sora)", fontSize:"18px", fontWeight:700, color:"rgba(10,10,10,0.88)", lineHeight:1.25, letterSpacing:"-0.3px" }}>
                We craft<br/>immersive digital<br/>experiences.
              </div>
              <div style={{ marginTop:"8px", fontSize:"11px", color:"rgba(10,10,10,0.38)", fontFamily:"var(--font-geist)", lineHeight:1.5 }}>
                Premium web for modern brands.
              </div>
              <div style={{ marginTop:"12px", display:"inline-flex", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", borderRadius:"100px", padding:"5px 12px" }}>
                <span style={{ fontSize:"10px", fontWeight:600, color:"#fff", fontFamily:"var(--font-sora)" }}>See the work</span>
              </div>
            </motion.div>

            {/* Stats card — mid right */}
            <motion.div style={{ position:"absolute", right:"5%", top:"48%", width:116, borderRadius:"14px", padding:"12px", x:card1x, y:card1y, ...glassCard }}>
              <div style={{ fontSize:"9px", color:"rgba(10,10,10,0.40)", fontFamily:"var(--font-geist)", marginBottom:"4px", letterSpacing:"0.3px" }}>SHIPPED</div>
              <div style={{ fontSize:"30px", fontWeight:700, fontFamily:"var(--font-sora)", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>48</div>
              <div style={{ marginTop:"6px", fontSize:"9px", color:"rgba(13,122,122,0.8)", fontFamily:"var(--font-geist)" }}>↑ 12 this quarter</div>
            </motion.div>

            {/* Notification card — lower left */}
            <motion.div style={{ position:"absolute", left:"5%", bottom:"10%", width:158, borderRadius:"12px", padding:"10px 12px", display:"flex", alignItems:"center", gap:"8px", x:card2x, y:card2y, ...glassCard }}>
              <div style={{ width:28, height:28, borderRadius:"8px", flexShrink:0, background:"linear-gradient(135deg,#0D7A7A,#D9A441)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px" }}>✦</div>
              <div>
                <div style={{ fontSize:"10px", fontWeight:600, color:"#0a0a0a", fontFamily:"var(--font-sora)", lineHeight:1.2 }}>Site live!</div>
                <div style={{ fontSize:"9px", color:"rgba(10,10,10,0.45)", fontFamily:"var(--font-geist)", marginTop:"2px" }}>New client — just now</div>
              </div>
            </motion.div>

            {/* Accent dot */}
            <motion.div style={{ position:"absolute", right:"14%", bottom:"22%", width:11, height:11, borderRadius:"50%", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", boxShadow:"0 0 0 3px rgba(13,122,122,0.15), 0 3px 10px rgba(13,122,122,0.35)", x:dotx, y:doty }} />

            {/* Tag pill */}
            <motion.div style={{ position:"absolute", right:"4%", bottom:"9%", background:"linear-gradient(135deg, rgba(13,122,122,0.12), rgba(217,164,65,0.08))", border:"1px solid rgba(13,122,122,0.25)", borderRadius:"100px", padding:"4px 10px", fontSize:"8px", fontWeight:600, fontFamily:"var(--font-sora)", color:"#0D7A7A", letterSpacing:"0.3px", backdropFilter:"blur(8px)", x:tagx, y:tagy }}>
              3D · PARALLAX
            </motion.div>
          </motion.div>

        ) : (
          /* ─── LANDSCAPE DESKTOP DEMO (780×500) ─── */
          <motion.div style={{
            position:"relative", width:780, height:500,
            perspective:1100, rotateX, rotateY,
            overflow:"hidden", borderRadius:"14px",
          }}>
            {/* Blobs */}
            <motion.div style={{ position:"absolute", width:"70%", height:"80%", left:"5%", top:"-10%", background:"radial-gradient(ellipse, rgba(13,122,122,0.18) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(70px)", x:bg1x, y:bg1y }} />
            <motion.div style={{ position:"absolute", width:"55%", height:"70%", right:"0%", bottom:"-5%", background:"radial-gradient(ellipse, rgba(217,164,65,0.14) 0%, transparent 70%)", borderRadius:"50%", filter:"blur(60px)", x:bg2x, y:bg2y }} />

            <BrowserFrame portrait={false} />

            {/* Hero text */}
            <motion.div style={{ position:"absolute", left:"6%", top:"30%", x:herox, y:heroy }}>
              <div style={{ fontFamily:"var(--font-sora)", fontSize:"26px", fontWeight:700, color:"rgba(10,10,10,0.88)", lineHeight:1.2, letterSpacing:"-0.4px" }}>
                We craft immersive<br/>digital experiences.
              </div>
              <div style={{ marginTop:"10px", fontSize:"12px", color:"rgba(10,10,10,0.38)", fontFamily:"var(--font-geist)", lineHeight:1.5 }}>Premium web spaces for modern brands.</div>
              <div style={{ marginTop:"14px", display:"inline-flex", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", borderRadius:"100px", padding:"6px 14px" }}>
                <span style={{ fontSize:"11px", fontWeight:600, color:"#fff", fontFamily:"var(--font-sora)" }}>See the work</span>
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div style={{ position:"absolute", right:"5%", top:"28%", width:154, borderRadius:"16px", padding:"16px", x:card1x, y:card1y, ...glassCard }}>
              <div style={{ fontSize:"10px", color:"rgba(10,10,10,0.40)", fontFamily:"var(--font-geist)", marginBottom:"6px", letterSpacing:"0.3px" }}>PROJECTS SHIPPED</div>
              <div style={{ fontSize:"34px", fontWeight:700, fontFamily:"var(--font-sora)", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>48</div>
              <div style={{ marginTop:"8px", fontSize:"10px", color:"rgba(13,122,122,0.8)", fontFamily:"var(--font-geist)" }}>↑ 12 this quarter</div>
            </motion.div>

            {/* Notification card */}
            <motion.div style={{ position:"absolute", left:"8%", bottom:"14%", width:196, borderRadius:"14px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px", x:card2x, y:card2y, ...glassCard }}>
              <div style={{ width:32, height:32, borderRadius:"10px", flexShrink:0, background:"linear-gradient(135deg,#0D7A7A,#D9A441)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>✦</div>
              <div>
                <div style={{ fontSize:"11px", fontWeight:600, color:"#0a0a0a", fontFamily:"var(--font-sora)", lineHeight:1.2 }}>Site live!</div>
                <div style={{ fontSize:"10px", color:"rgba(10,10,10,0.45)", fontFamily:"var(--font-geist)", marginTop:"2px" }}>New client — just now</div>
              </div>
            </motion.div>

            {/* Accent dot */}
            <motion.div style={{ position:"absolute", right:"18%", bottom:"20%", width:14, height:14, borderRadius:"50%", background:"linear-gradient(135deg,#0D7A7A,#D9A441)", boxShadow:"0 0 0 4px rgba(13,122,122,0.15), 0 4px 14px rgba(13,122,122,0.35)", x:dotx, y:doty }} />

            {/* Tag pill */}
            <motion.div style={{ position:"absolute", right:"6%", bottom:"12%", background:"linear-gradient(135deg, rgba(13,122,122,0.12), rgba(217,164,65,0.08))", border:"1px solid rgba(13,122,122,0.25)", borderRadius:"100px", padding:"5px 14px", fontSize:"10px", fontWeight:600, fontFamily:"var(--font-sora)", color:"#0D7A7A", letterSpacing:"0.3px", backdropFilter:"blur(8px)", x:tagx, y:tagy }}>
              3D · PARALLAX · IMMERSIVE
            </motion.div>
          </motion.div>
        )}

        <div style={{ fontFamily:"var(--font-geist)", fontSize:"11px", color:"rgba(10,10,10,0.28)", letterSpacing:"0.3px", pointerEvents:"none" }}>
          Scroll to feel the depth
        </div>
      </div>
    </section>
  );
}