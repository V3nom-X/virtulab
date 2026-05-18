/**
 * Lightweight client analytics shim. Emits to console + a window event so
 * a real analytics SDK can be wired up later without touching call sites.
 */
type AnalyticsProps = Record<string, string | number | boolean | undefined | null>;

export function trackEvent(name: string, props: AnalyticsProps = {}) {
  try {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, props);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vl:analytics", { detail: { name, props, t: Date.now() } }));
    }
  } catch {
    /* no-op */
  }
}

export const trackVideoEvent = (
  name:
    | "video_autoplay_attempt"
    | "video_autoplay_success"
    | "video_autoplay_blocked"
    | "video_canplay"
    | "video_fallback_poster",
  props: AnalyticsProps = {},
) => trackEvent(name, props);
