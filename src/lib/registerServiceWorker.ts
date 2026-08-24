/**
 * The single place that registers (or refuses to register) the app-shell
 * service worker. Offline caching must never activate in dev or inside a
 * Lovable preview iframe, where a stale worker would serve deleted chunks.
 */

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true; // cross-origin frame
  }

  const { hostname, search } = window.location;
  if (new URLSearchParams(search).get("sw") === "off") return true;
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;

  const blockedSuffixes = [
    "lovableproject.com",
    "lovableproject-dev.com",
    "beta.lovable.dev",
  ];
  return blockedSuffixes.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

async function unregisterAppWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((reg) => {
        const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
        return url.endsWith(SW_URL);
      })
      .map((reg) => reg.unregister()),
  );
}

export function registerServiceWorker(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  if (isRefusedContext()) {
    void unregisterAppWorkers();
    return;
  }

  void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
    /* offline caching is a progressive enhancement */
  });
}
