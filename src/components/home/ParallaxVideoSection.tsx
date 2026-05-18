import { useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/ui/Parallax";
import { useReducedMotion, useCinematicVideoEnabled } from "@/hooks/useAccessibility";
import { useIsMobile } from "@/hooks/use-mobile";
import videoAsset from "../../../public/videos/parallax-hero.mp4.asset.json";
import posterImg from "../../../public/videos/parallax-hero-poster.jpg";
import { LoopQualityOverlay } from "@/components/dev/LoopQualityOverlay";
import { trackVideoEvent } from "@/lib/analytics";

/**
 * Detect a "low bandwidth" hint via the Network Information API.
 * Falls back to false where unsupported.
 */
function useLowBandwidth(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (!conn) return;
    const recompute = () => {
      const slow = ["slow-2g", "2g", "3g"].includes(conn.effectiveType);
      setLow(Boolean(conn.saveData) || slow);
    };
    recompute();
    conn.addEventListener?.("change", recompute);
    return () => conn.removeEventListener?.("change", recompute);
  }, []);
  return low;
}

export function ParallaxVideoSection() {
  const reduced = useReducedMotion();
  const cinematicOn = useCinematicVideoEnabled();
  const isMobile = useIsMobile();
  const lowBandwidth = useLowBandwidth();

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const shouldAutoplay = !reduced && cinematicOn;
  const shouldLoadVideo = shouldAutoplay && !lowBandwidth;

  const [nearViewport, setNearViewport] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Emit a fallback-reason event as soon as we know we will NOT autoplay.
  useEffect(() => {
    if (shouldLoadVideo) return;
    const reason = reduced
      ? "reduced_motion"
      : !cinematicOn
        ? "user_pref_off"
        : lowBandwidth
          ? "low_bandwidth"
          : "unknown";
    trackVideoEvent("video_fallback_poster", { reason });
  }, [shouldLoadVideo, reduced, cinematicOn, lowBandwidth]);

  // Preload only when the hero section is near the viewport.
  useEffect(() => {
    if (!shouldLoadVideo) return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setNearViewport(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!shouldLoadVideo) setCanPlay(false);
  }, [shouldLoadVideo]);

  // Attempt autoplay + capture timing
  useEffect(() => {
    if (!shouldLoadVideo || !nearViewport) return;
    const v = videoRef.current;
    if (!v) return;
    trackVideoEvent("video_autoplay_attempt", {});
    const onCanPlay = () => trackVideoEvent("video_canplay", { ms: Date.now() - mountTimeRef.current });
    v.addEventListener("canplay", onCanPlay, { once: true });
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => trackVideoEvent("video_autoplay_success", {}))
        .catch((err) => {
          trackVideoEvent("video_autoplay_blocked", { error: String(err?.name || err) });
          trackVideoEvent("video_fallback_poster", { reason: "autoplay_blocked" });
        });
    }
    return () => v.removeEventListener("canplay", onCanPlay);
  }, [shouldLoadVideo, nearViewport]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-background"
    >
      <Parallax speed={0.3} enableOnMobile className="absolute inset-0 -top-[10%] -bottom-[10%]">
        {/* Poster — always present, acts as the LCP background and reduced-motion fallback. */}
        <img
          src={posterImg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: canPlay ? 0 : 1,
            transition: "opacity 800ms ease-out",
          }}
        />

        {shouldLoadVideo && nearViewport && (
          <video
            ref={videoRef}
            src={videoAsset.url}
            poster={posterImg}
            autoPlay
            muted
            loop
            playsInline
            preload={isMobile ? "none" : "metadata"}
            onCanPlay={() => setCanPlay(true)}
            onPlaying={() => setCanPlay(true)}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: canPlay ? 1 : 0,
              transition: "opacity 800ms ease-out",
            }}
          />
        )}
      </Parallax>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background)/0.7)_100%)] pointer-events-none" />

      {/* Centered overlay text */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary mb-4 animate-fade-in">
            Computational Science · Live Simulations
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            A laboratory that lives <span className="text-gradient">in your browser</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-slide-up stagger-1">
            Real reactions, real physics, real feedback — rendered in real time.
          </p>
        </div>
      </div>

      {/* Loop seam debug overlay (Shift+L or ?loopcheck=1) */}
      <LoopQualityOverlay videoRef={videoRef} posterSrc={posterImg} />
    </section>
  );
}
