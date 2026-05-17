import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { useParallax } from "@/hooks/useParallax";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  enableOnMobile?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Element that defines the scroll window (defaults to the parallax wrapper itself). */
  as?: "div" | "section";
}

/**
 * Subtle GPU-only translate parallax wrapper. Wrap a decorative layer with this.
 * Honors prefers-reduced-motion and disables on mobile by default.
 */
export function Parallax({
  children,
  speed = 0.2,
  enableOnMobile = false,
  className,
  style,
  as = "div",
}: ParallaxProps) {
  const { ref, y, disabled } = useParallax({ speed, enableOnMobile });
  const Comp = as === "section" ? motion.section : motion.div;

  return (
    <Comp
      ref={ref as any}
      data-parallax
      style={{
        ...style,
        y: disabled ? 0 : y,
        willChange: disabled ? undefined : "transform",
      }}
      className={className}
    >
      {children}
    </Comp>
  );
}
