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

  useEffect(() => {
    if (svgRef.current && hovered) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${Math.min(100, Math.max(0, cxPercentage))}%`,
        cy: `${Math.min(100, Math.max(0, cyPercentage))}%`,
      });
    }
  }, [cursor, hovered]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMaskPosition({ cx: "50%", cy: "50%" });
      }}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none cursor-pointer", className)}
    >
      <defs>
        {/* Rainbow gradient shown under the reveal mask on hover */}
        <linearGradient
          id="pawsome-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="300"
          y2="0"
        >
          <stop offset="0%"   stopColor="#eab308" />
          <stop offset="20%"  stopColor="#ef4444" />
          <stop offset="40%"  stopColor="#ff6b35" />
          <stop offset="60%"  stopColor="#ec4899" />
          <stop offset="80%"  stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Radial reveal mask — follows cursor */}
        <radialGradient
          id="pawsome-reveal"
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="30%"
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="pawsome-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pawsome-reveal)" />
        </mask>
      </defs>

      {/* Layer 1: always-visible white outline stroke */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        stroke="rgba(255,255,255,0.15)"
        className="fill-transparent font-[helvetica] text-7xl font-bold uppercase"
      >
        {text}
      </text>

      {/* Layer 2: orange stroke that animates in (always plays) */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        stroke="#ff6b35"
        strokeOpacity="0.6"
        className="fill-transparent font-[helvetica] text-7xl font-bold uppercase"
        style={{
          strokeDasharray: 1200,
          strokeDashoffset: hovered ? 0 : 1200,
          transition: "stroke-dashoffset 2s ease-in-out",
        }}
      >
        {text}
      </text>

      {/* Layer 3: rainbow gradient revealed only under cursor */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.6"
        stroke="url(#pawsome-gradient)"
        mask="url(#pawsome-mask)"
        className="fill-transparent font-[helvetica] text-7xl font-bold uppercase"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
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
          "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,107,53,0.15) 0%, transparent 70%)",
      }}
    />
  );
};
