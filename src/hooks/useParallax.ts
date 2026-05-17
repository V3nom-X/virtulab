import { useRef } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useAccessibility";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParallaxOptions {
  /** Multiplier relative to scroll. Positive = moves slower (down), negative = counter-direction. Try 0.05–0.35. */
  speed?: number;
  /** Enable on mobile (<768px). Defaults to false for perf. */
  enableOnMobile?: boolean;
}

/**
 * Scroll-driven parallax. Returns a ref to attach to the container being observed
 * and a MotionValue<number> in px for `style={{ y }}` (or x) on a child.
 * Automatically disabled under reduced-motion and on mobile (unless opted in).
 */
export function useParallax({ speed = 0.2, enableOnMobile = false }: ParallaxOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  // Range is [-speed*200, speed*200] px translation across the scroll window.
  const range = 200 * speed;
  const y: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    [range, -range],
  );

  const disabled = reduced || (isMobile && !enableOnMobile);

  return { ref, y, disabled } as const;
}
