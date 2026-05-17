import { useEffect, useRef, useState } from "react";
import { useParallaxEnabled, useReducedMotion } from "@/hooks/useAccessibility";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Lightweight FPS / jank reporter for parallax debugging.
 * Hidden unless:
 *   - URL contains ?perf=1, OR
 *   - localStorage["virtulab-perf-overlay"] === "1"
 * Toggle with Shift+P.
 */
export function ParallaxPerfOverlay() {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [maxFrame, setMaxFrame] = useState(0);
  const [longFrames, setLongFrames] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const parallaxOn = useParallaxEnabled();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const scrollTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const urlFlag = url.searchParams.get("perf") === "1";
    const lsFlag = localStorage.getItem("virtulab-perf-overlay") === "1";
    setVisible(urlFlag || lsFlag);

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "P" || e.key === "p")) {
        const next = !(localStorage.getItem("virtulab-perf-overlay") === "1");
        localStorage.setItem("virtulab-perf-overlay", next ? "1" : "0");
        setVisible(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let elapsed = 0;
    let localMax = 0;
    let longs = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;
      elapsed += dt;
      if (dt > localMax) localMax = dt;
      if (dt > 50) longs++;

      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed));
        setMaxFrame(Math.round(localMax));
        setLongFrames((prev) => prev + longs);
        frames = 0;
        elapsed = 0;
        localMax = 0;
        longs = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      setScrolling(true);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => setScrolling(false), 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, [visible]);

  if (!visible) return null;

  const state = reduced
    ? "reduced-motion"
    : !parallaxOn
    ? "user-off"
    : isMobile
    ? "mobile (decor only)"
    : "active";

  const fpsColor = fps >= 55 ? "#86efac" : fps >= 40 ? "#fde68a" : "#fca5a5";

  return (
    <div
      aria-hidden
      className="fixed bottom-3 left-3 z-[200] pointer-events-none select-none rounded-md border border-white/10 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white shadow-lg backdrop-blur"
      style={{ minWidth: 150 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="opacity-70">FPS</span>
        <span style={{ color: fpsColor, fontWeight: 700 }}>{fps}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="opacity-70">max frame</span>
        <span>{maxFrame}ms</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="opacity-70">jank (&gt;50ms)</span>
        <span>{longFrames}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="opacity-70">scroll</span>
        <span>{scrolling ? "yes" : "idle"}</span>
      </div>
      <div className="mt-1 border-t border-white/10 pt-1 flex items-center justify-between gap-3">
        <span className="opacity-70">parallax</span>
        <span>{state}</span>
      </div>
      <div className="opacity-40 mt-0.5">Shift+P to hide</div>
    </div>
  );
}
