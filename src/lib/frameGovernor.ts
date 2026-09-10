/**
 * Global frame governor.
 *
 * Every animated scene in the app drives itself with requestAnimationFrame.
 * Rather than teaching each one about device tiers separately, this installs a
 * single tier-aware cap on the browser's frame callbacks: weak phones tick at
 * 30 fps instead of fighting for 60, and hidden tabs drop to a trickle. All
 * callbacks scheduled in the same native frame are released together, so
 * animations stay in sync with each other.
 */
import { budgetFor, detectInitialTier, type DeviceTier } from "@/lib/renderBudget";

const STORAGE_KEY = "virtulab-render-tier";
const HIDDEN_FPS = 4;

let installed = false;
let targetFps = 60;

function storedTier(): DeviceTier | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "low" || raw === "medium" || raw === "high" ? raw : null;
  } catch {
    return null;
  }
}

/** Re-read the tier (the FPS watchdog may have stepped it down). */
export function refreshFrameCap(): void {
  const tier = storedTier() ?? detectInitialTier();
  targetFps = budgetFor(tier).targetFps;
}

function minInterval(): number {
  if (typeof document !== "undefined" && document.hidden) return 1000 / HIDDEN_FPS;
  if (targetFps >= 60) return 0;
  return 1000 / targetFps;
}

export function installFrameGovernor(): void {
  if (installed || typeof window === "undefined" || !window.requestAnimationFrame) return;
  installed = true;
  refreshFrameCap();

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);

  const pending = new Map<number, number>();
  let handleSeq = 1;
  let lastReleased = -Infinity;
  let lastReleasedTs = Number.NaN;

  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    const handle = handleSeq++;

    const step = (ts: number) => {
      if (!pending.has(handle)) return;
      const interval = minInterval();
      const sameFrame = ts === lastReleasedTs;

      if (interval === 0 || sameFrame || ts - lastReleased >= interval - 1) {
        pending.delete(handle);
        lastReleased = ts;
        lastReleasedTs = ts;
        callback(ts);
        return;
      }
      pending.set(handle, nativeRaf(step));
    };

    pending.set(handle, nativeRaf(step));
    return handle;
  };

  window.cancelAnimationFrame = (handle: number): void => {
    const native = pending.get(handle);
    if (native !== undefined) {
      pending.delete(handle);
      nativeCancel(native);
      return;
    }
    nativeCancel(handle);
  };

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) refreshFrameCap();
  });
  document.addEventListener("visibilitychange", refreshFrameCap);
}
