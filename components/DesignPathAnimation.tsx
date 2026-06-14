"use client";
import { useEffect, useRef, useMemo } from "react";

/**
 * Apple-quality handwriting path animation for "Design"
 * Uses real SVG path strokes with stroke-dasharray/stroke-dashoffset
 * NO masks, clips, wipes, or opacity reveals — pure pen-drawing motion
 */
function DesignPathAnimation({ 
  startTime, 
  isMobile 
}: { 
  startTime: number | null; 
  isMobile: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  // SVG paths for "Design" in flowing cursive
  // Each path is a single continuous stroke representing one or more connected letterforms
  const paths = useMemo(() => [
    // D — curved stem with loop
    {
      d: "M 8,8 Q 8,2 14,2 Q 20,2 20,8 Q 20,14 14,14 Q 8,14 8,20",
      name: "D"
    },
    // e — open circular with horizontal bar
    {
      d: "M 28,10 Q 28,4 33,4 Q 38,4 38,9 Q 38,11 28,11 L 38,11 Q 38,16 33,16 Q 28,16 28,12",
      name: "e"
    },
    // s — double curve
    {
      d: "M 48,6 Q 48,4 51,4 Q 54,4 54,6 Q 54,8 51,9 Q 48,10 48,12 Q 48,14 51,14 Q 54,14 54,12",
      name: "s"
    },
    // i — simple stem with dot
    {
      d: "M 60,4 L 60,14 M 60,2 Q 60,0 62,0 Q 64,0 64,2 Q 64,4 62,4 Q 60,4 60,2",
      name: "i"
    },
    // g — descender loop
    {
      d: "M 72,4 Q 72,2 76,2 Q 80,2 80,6 Q 80,10 76,10 L 72,10 Q 72,16 76,18 Q 80,20 82,18",
      name: "g"
    },
    // n — double hump
    {
      d: "M 90,14 L 90,4 Q 90,2 93,2 Q 96,2 96,4 L 96,14 M 96,4 Q 96,2 99,2 Q 102,2 102,4 L 102,14",
      name: "n"
    },
  ], []);

  // Calculate path lengths and set up stroke animation
  useEffect(() => {
    if (!svgRef.current) return;

    // Store path lengths and set initial stroke-dasharray
    const pathLengths = pathRefs.current.map((path, idx) => {
      if (!path) return 0;
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      return len;
    });

    if (startTime === null) return;

    // Animation parameters
    const totalDrawTime = 1100; // ms — total time to draw all letters
    const staggerDelay = 60; // ms — delay between letters starting
    const animationStart = performance.now();

    const animate = () => {
      const elapsed = performance.now() - animationStart;
      const progress = Math.min(1, elapsed / totalDrawTime);

      // Draw each path with stagger
      pathRefs.current.forEach((path, idx) => {
        if (!path) return;
        const pathLen = pathLengths[idx];
        
        // When does this letter start drawing? (staggered)
        const letterStartTime = idx * staggerDelay;
        const letterProgress = Math.max(0, Math.min(1, (elapsed - letterStartTime) / (totalDrawTime * 0.7)));
        
        // Ease function — cubic ease-out for natural deceleration
        const eased = 1 - Math.pow(1 - letterProgress, 3);
        
        // Animate stroke-dashoffset from pathLen to 0
        path.style.strokeDashoffset = `${pathLen * (1 - eased)}`;
        
        // Fade in stroke opacity as it draws (slight emphasis)
        path.style.opacity = letterProgress > 0 ? "1" : "0";
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Drawing complete — fade in the filled version
        if (svgRef.current) {
          svgRef.current.style.transition = "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        }
      }
    };

    requestAnimationFrame(animate);
  }, [startTime]);

  const fontSize = isMobile ? 88 : 152;
  const scale = fontSize / 120; // Base font size for path design is 120px

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 110 24"
      width={fontSize}
      height={fontSize * 0.2}
      style={{
        overflow: "visible",
        filter: "drop-shadow(0 0 0.5px rgba(13, 122, 122, 0.1))",
      }}
    >
      {/* Stroke layer — draws first */}
      <g
        style={{
          fill: "none",
          stroke: "url(#designGradient)",
          strokeWidth: 1.2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        {paths.map((pathData, idx) => (
          <path
            key={idx}
            ref={(el) => {
              pathRefs.current[idx] = el;
            }}
            d={pathData.d}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="designGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0D7A7A" />
          <stop offset="100%" stopColor="#D9A441" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default DesignPathAnimation;