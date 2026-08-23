import { useCallback, useEffect, useRef, useState } from "react";
import {
  DeviceTier,
  RenderBudget,
  budgetFor,
  detectInitialTier,
  stepDown,
} from "@/lib/renderBudget";

const STORAGE_KEY = "virtulab-render-tier";
const LOW_FPS = 24;
const CRITICAL_FPS = 15;
const SUSTAIN_MS = 2000;

function readStoredTier(): DeviceTier | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "low" || raw === "medium" || raw === "high" ? raw : null;
  } catch {
    return null;
  }
}

export interface DeviceTierState {
  tier: DeviceTier;
  budget: RenderBudget;
  /** True when the watchdog gave up and the scene should show a static frame. */
  degraded: boolean;
  /** Live FPS as measured by the watchdog (0 until the first sample). */
  fps: number;
  /** Manual escape hatch from the frozen/degraded state. */
  restore: () => void;
}

/**
 * Device capability tier plus an FPS watchdog.
 *
 * The watchdog steps the tier down after ~2s below 24 FPS and, if the lowest
 * tier still can't hold 15 FPS, flips `degraded` so the scene can freeze to a
 * static frame instead of stuttering.
 */
export function useDeviceTier(active = true): DeviceTierState {
  const [tier, setTier] = useState<DeviceTier>(() => readStoredTier() ?? detectInitialTier());
  const [degraded, setDegraded] = useState(false);
  const [fps, setFps] = useState(0);

  const lowSince = useRef<number | null>(null);
  const criticalSince = useRef<number | null>(null);

  useEffect(() => {
    if (!active || degraded || typeof window === "undefined") return;

    let raf = 0;
    let frames = 0;
    let windowStart = performance.now();
    let stopped = false;

    const loop = () => {
      if (stopped) return;
      frames += 1;
      const now = performance.now();
      const elapsed = now - windowStart;

      if (elapsed >= 500) {
        const currentFps = (frames * 1000) / elapsed;
        setFps(Math.round(currentFps));
        frames = 0;
        windowStart = now;

        if (currentFps < CRITICAL_FPS) {
          criticalSince.current ??= now;
        } else {
          criticalSince.current = null;
        }

        if (currentFps < LOW_FPS) {
          lowSince.current ??= now;
        } else {
          lowSince.current = null;
        }

        const lowFor = lowSince.current ? now - lowSince.current : 0;
        const criticalFor = criticalSince.current ? now - criticalSince.current : 0;

        setTier((current) => {
          if (criticalFor >= SUSTAIN_MS && current === "low") {
            setDegraded(true);
            return current;
          }
          if (lowFor >= SUSTAIN_MS && current !== "low") {
            const next = stepDown(current);
            lowSince.current = null;
            try {
              localStorage.setItem(STORAGE_KEY, next);
            } catch {
              /* storage unavailable */
            }
            return next;
          }
          return current;
        });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [active, degraded]);

  const restore = useCallback(() => {
    lowSince.current = null;
    criticalSince.current = null;
    setDegraded(false);
  }, []);

  return { tier, budget: budgetFor(tier), degraded, fps, restore };
}

/**
 * True while an element is on screen and the tab is visible — scenes use this
 * to pause rendering entirely when nobody can see them.
 */
export function useSceneVisible(ref: React.RefObject<HTMLElement>): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let onScreen = true;
    const apply = () => setVisible(onScreen && document.visibilityState === "visible");

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      },
      { rootMargin: "128px" },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", apply);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, [ref]);

  return visible;
}
