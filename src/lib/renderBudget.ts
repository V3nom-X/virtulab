/**
 * Shared render budget for WebGL scenes so low-end phones stay usable.
 *
 * A device "tier" is derived once from hardware hints, then optionally stepped
 * down at runtime by the FPS watchdog in `useDeviceTier`.
 */

export type DeviceTier = "low" | "medium" | "high";

export interface RenderBudget {
  tier: DeviceTier;
  /** Hard cap for renderer.setPixelRatio */
  pixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  /** Multiplier applied to segment counts of spheres/tubes/etc. */
  geometryDetail: number;
  /** Number of dynamic lights the scene should create beyond ambient. */
  maxLights: number;
  /** Target frames per second; scenes should throttle their loop to this. */
  targetFps: number;
  /** Render only when something changed instead of every frame. */
  renderOnDemand: boolean;
}

const BUDGETS: Record<DeviceTier, Omit<RenderBudget, "tier">> = {
  low: {
    pixelRatio: 1,
    antialias: false,
    shadows: false,
    geometryDetail: 0.5,
    maxLights: 1,
    targetFps: 30,
    renderOnDemand: true,
  },
  medium: {
    pixelRatio: 1.5,
    antialias: true,
    shadows: false,
    geometryDetail: 0.75,
    maxLights: 2,
    targetFps: 45,
    renderOnDemand: false,
  },
  high: {
    pixelRatio: 2,
    antialias: true,
    shadows: true,
    geometryDetail: 1,
    maxLights: 3,
    targetFps: 60,
    renderOnDemand: false,
  },
};

export function budgetFor(tier: DeviceTier): RenderBudget {
  return { tier, ...BUDGETS[tier] };
}

/** Clamp a segment count by the tier's geometry detail, never below 6. */
export function segments(base: number, budget: RenderBudget): number {
  return Math.max(6, Math.round(base * budget.geometryDetail));
}

/** Effective device pixel ratio for a renderer under this budget. */
export function effectivePixelRatio(budget: RenderBudget): number {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return Math.min(dpr, budget.pixelRatio);
}

export const TIER_ORDER: DeviceTier[] = ["low", "medium", "high"];

export function stepDown(tier: DeviceTier): DeviceTier {
  const i = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.max(0, i - 1)];
}

/** Initial tier guess from hardware hints — no rendering required. */
export function detectInitialTier(): DeviceTier {
  if (typeof navigator === "undefined") return "medium";

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const memory = (nav as unknown as { deviceMemory?: number }).deviceMemory ?? (nav as { deviceMemory?: number }).deviceMemory;
  const gb = typeof memory === "number" ? memory : (nav as unknown as { deviceMemory?: number }).deviceMemory;
  const ram = typeof gb === "number" ? gb : (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const saveData = !!nav.connection?.saveData;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 480;
  const deviceMemoryGb =
    typeof (navigator as unknown as { deviceMemory?: number }).deviceMemory === "number"
      ? (navigator as unknown as { deviceMemory?: number }).deviceMemory!
      : typeof ram === "number"
        ? ram
        : undefined;

  if (saveData) return "low";
  if ((deviceMemoryGb !== undefined && deviceMemoryGb <= 2) || cores <= 2) return "low";
  if ((deviceMemoryGb !== undefined && deviceMemoryGb <= 4) || cores <= 4 || (smallScreen && dpr >= 2)) {
    return "medium";
  }
  return "high";
}
