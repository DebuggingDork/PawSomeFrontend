import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const TextHoverEffect = ({
  text,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  // Controls the scroll-triggered draw animation (0 → 1)
  const [drawProgress, setDrawProgress] = useState(0);

  // Scroll-triggered draw: starts when footer enters viewport at ~80% scroll point
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Smoothly animate drawProgress from 0 → 1 over 2.5 s
          const start = performance.now();
          const duration = 2500;

          const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-in-out cubic
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            setDrawProgress(eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      // Trigger when 20% of the element is visible
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update mask position to follow cursor
  useEffect(() => {
    if (!svgRef.current || !hovered) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = ((cursor.x - rect.left) / rect.width) * 100;
    const cy = ((cursor.y - rect.top) / rect.height) * 100;
    setMaskPosition({
      cx: `${Math.min(100, Math.max(0, cx))}%`,
      cy: `${Math.min(100, Math.max(0, cy))}%`,
    });
  }, [cursor, hovered]);

  // Total path length estimate for the text — large enough to cover any text
  const TOTAL_LENGTH = 2000;
  const dashOffset = TOTAL_LENGTH * (1 - drawProgress);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMaskPosition({ cx: "50%", cy: "50%" });
      }}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none cursor-pointer w-full h-full", className)}
    >
      <defs>
        {/* Rainbow gradient for hover reveal */}
        <linearGradient
          id="pawsome-rainbow"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="1000"
          y2="0"
        >
          <stop offset="0%"   stopColor="#eab308" />
          <stop offset="20%"  stopColor="#ef4444" />
          <stop offset="40%"  stopColor="#ff6b35" />
          <stop offset="60%"  stopColor="#ec4899" />
          <stop offset="80%"  stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Radial mask that follows cursor */}
        <radialGradient
          id="pawsome-reveal"
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="25%"
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="pawsome-cursor-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pawsome-reveal)" />
        </mask>
      </defs>

      {/* Layer 1 — ghost outline, always visible, very faint */}
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="180"
        fontWeight="900"
        fontFamily="helvetica, Arial, sans-serif"
        strokeWidth="0.8"
        stroke="rgba(255,255,255,0.08)"
        fill="transparent"
        letterSpacing="-2"
      >
        {text}
      </text>

      {/* Layer 2 — scroll-triggered draw animation in orange */}
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="180"
        fontWeight="900"
        fontFamily="helvetica, Arial, sans-serif"
        strokeWidth="1"
        stroke="#ff6b35"
        fill="transparent"
        letterSpacing="-2"
        style={{
          strokeDasharray: TOTAL_LENGTH,
          strokeDashoffset: dashOffset,
          // No CSS transition — we drive it via rAF for true smoothness
        }}
      >
        {text}
      </text>

      {/* Layer 3 — rainbow revealed only under cursor on hover */}
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="180"
        fontWeight="900"
        fontFamily="helvetica, Arial, sans-serif"
        strokeWidth="1.2"
        stroke="url(#pawsome-rainbow)"
        fill="transparent"
        mask="url(#pawsome-cursor-mask)"
        letterSpacing="-2"
        style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        {text}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255,107,53,0.12) 0%, transparent 70%)",
      }}
    />
  );
};
