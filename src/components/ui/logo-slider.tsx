import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LogoSliderProps {
  logos: ReactNode[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

export function LogoSlider({
  logos,
  speed = 60,
  direction = "left",
  className,
}: LogoSliderProps) {
  const animationDirection = direction === "left" ? "normal" : "reverse";
  const duration = `${speed}s`;

  return (
    <div className={cn("overflow-hidden relative", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
      <div
        className="flex gap-12 items-center w-max animate-logo-scroll"
        style={{
          "--duration": duration,
          "--direction": animationDirection,
        } as React.CSSProperties}
      >
        {/* Double the logos for seamless loop */}
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex-shrink-0 flex items-center justify-center h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            {logo}
          </div>
        ))}
      </div>
    </div>
  );
}
