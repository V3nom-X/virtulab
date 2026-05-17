import { useEffect, useRef, useState } from "react";
import { useParallaxEnabled, useReducedMotion } from "@/hooks/useAccessibility";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Lightweight FPS / jank reporter for parallax debugging.
 * Hidden unless:
 *   - URL contains ?perf=1, OR
 *   - localStorage["virtulab-perf-overlay"] === "1"
 * Toggle with Shift+P.
 *
 * Tracks rolling 1s FPS plus session-wide avg / min / max FPS and logs
 * every jank event (>50ms frame) to the console for troubleshooting.
 */
export function ParallaxPerfOverlay() {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [minFps, setMinFps] = useState(0);
  const [maxFps, setMaxFps] = useState(0);
  const [maxFrame, setMaxFrame] = useState(0);
  const [longFrames, setLongFrames] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const parallaxOn = useParallaxEnabled();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const scrollTimer = useRef<number | null>(null);
  const scrollingRef = useRef(false);

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

  // Track scroll state in a ref so the rAF loop can read it cheaply.
  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      scrollingRef.current = true;
      setScrolling(true);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => {
        scrollingRef.current = false;
        setScrolling(false);
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    // Reset session counters when overlay re-opens.
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let elapsed = 0;
    let localMax = 0;
    let longs = 0;
    let totalFrames = 0;
    let totalElapsed = 0;
    let sessionMaxFrame = 0;
    let sessionLongs = 0;
    let sessionMinFps = Infinity;
    let sessionMaxFps = 0;
    let jankCount = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;
      elapsed += dt;
      totalFrames++;
      totalElapsed += dt;
      if (dt > localMax) localMax = dt;
      if (dt > sessionMaxFrame) sessionMaxFrame = dt;

      if (dt > 50) {
        longs++;
        sessionLongs++;
        jankCount++;
        // eslint-disable-next-line no-console
        console.warn(
          `[parallax-perf] jank #${jankCount}: ${dt.toFixed(1)}ms frame` +
            ` — scrolling=${scrollingRef.current} parallax=${
              reduced ? "reduced" : !parallaxOn ? "off" : isMobile ? "mobile" : "on"
            }`,
        );
      }

      if (elapsed >= 1000) {
        const currentFps = Math.round((frames * 1000) / elapsed);
        setFps(currentFps);
        setMaxFrame(Math.round(localMax));
        setLongFrames(sessionLongs);

        if (currentFps < sessionMinFps) sessionMinFps = currentFps;
        if (currentFps > sessionMaxFps) sessionMaxFps = currentFps;
        setMinFps(sessionMinFps === Infinity ? 0 : sessionMinFps);
        setMaxFps(sessionMaxFps);
        setAvgFps(Math.round((totalFrames * 1000) / totalElapsed));

        frames = 0;
        elapsed = 0;
        localMax = 0;
        longs = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduced, parallaxOn, isMobile]);

  if (!visible) return null;

  const state = reduced
    ? "reduced-motion"
    : !parallaxOn
    ? "user-off"
    : isMobile
    ? "mobile (decor only)"
    : "active";

  const fpsColor = fps >= 55 ? "#86efac" : fps >= 40 ? "#fde68a" : "#fca5a5";

  const Row = ({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) => (
    <div className="flex items-center justify-between gap-3">
      <span className="opacity-70">{label}</span>
      <span style={color ? { color, fontWeight: 700 } : undefined}>{value}</span>
    </div>
  );

  return (
    <div
      aria-hidden
      className="fixed bottom-3 left-3 z-[200] pointer-events-none select-none rounded-md border border-white/10 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white shadow-lg backdrop-blur"
      style={{ minWidth: 170 }}
    >
      <Row label="FPS" value={fps} color={fpsColor} />
      <Row label="avg / min / max" value={`${avgFps} / ${minFps} / ${maxFps}`} />
      <Row label="max frame" value={`${maxFrame}ms`} />
      <Row label="jank (>50ms)" value={longFrames} />
      <Row label="scroll" value={scrolling ? "yes" : "idle"} />
      <div className="mt-1 border-t border-white/10 pt-1">
        <Row label="parallax" value={state} />
      </div>
      <div className="opacity-40 mt-0.5">Shift+P to hide · jank → console</div>
    </div>
  );
}
