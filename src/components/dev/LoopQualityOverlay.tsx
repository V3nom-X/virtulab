import { RefObject, useEffect, useRef, useState } from "react";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  posterSrc: string;
}

/**
 * Loop seam debug tool. Toggled via Shift+L or ?loopcheck=1.
 *
 * Captures the FIRST frame and the LAST frame of the video and shows them
 * side-by-side with a per-channel mean-absolute-difference score. Low score
 * = seamless loop. >12 on a 0–255 scale is usually visible.
 */
export function LoopQualityOverlay({ videoRef, posterSrc }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [first, setFirst] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [diff, setDiff] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const probedRef = useRef(false);

  // Enable via URL flag or shortcut
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URLSearchParams(window.location.search);
    const initial =
      url.get("loopcheck") === "1" ||
      localStorage.getItem("virtulab-loop-overlay") === "1";
    setEnabled(initial);

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "L" || e.key === "l")) {
        const next = !enabled;
        setEnabled(next);
        try {
          localStorage.setItem("virtulab-loop-overlay", next ? "1" : "0");
        } catch {}
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  // Probe the first and last frames once the video can seek
  useEffect(() => {
    if (!enabled || probedRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    const run = async () => {
      try {
        // Wait for metadata
        if (!Number.isFinite(video.duration) || video.duration === 0) {
          await new Promise<void>((resolve) => {
            const handler = () => {
              video.removeEventListener("loadedmetadata", handler);
              resolve();
            };
            video.addEventListener("loadedmetadata", handler);
          });
        }
        const dur = video.duration;
        setDuration(dur);

        // Need to clone into an offscreen <video> so we can seek without
        // breaking the autoplay/loop on the live one.
        const clone = document.createElement("video");
        clone.src = video.currentSrc;
        clone.crossOrigin = "anonymous";
        clone.muted = true;
        clone.playsInline = true;
        clone.preload = "auto";

        await new Promise<void>((res, rej) => {
          clone.addEventListener("loadedmetadata", () => res(), { once: true });
          clone.addEventListener("error", () => rej(new Error("clone failed")), { once: true });
        });

        const grab = (t: number) =>
          new Promise<ImageData>((resolve, reject) => {
            const onSeek = () => {
              clone.removeEventListener("seeked", onSeek);
              const c = document.createElement("canvas");
              c.width = 160;
              c.height = 90;
              const ctx = c.getContext("2d", { willReadFrequently: true });
              if (!ctx) return reject(new Error("no ctx"));
              try {
                ctx.drawImage(clone, 0, 0, c.width, c.height);
                resolve(ctx.getImageData(0, 0, c.width, c.height));
              } catch (err) {
                reject(err);
              }
            };
            clone.addEventListener("seeked", onSeek);
            clone.currentTime = t;
          });

        const firstImg = await grab(0.05);
        const lastImg = await grab(Math.max(0, dur - 0.05));

        // Encode to data URLs for display
        const toUrl = (img: ImageData) => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          c.getContext("2d")!.putImageData(img, 0, 0);
          return c.toDataURL("image/png");
        };
        setFirst(toUrl(firstImg));
        setLast(toUrl(lastImg));

        // Mean absolute difference across RGB
        let sum = 0;
        let n = 0;
        const a = firstImg.data;
        const b = lastImg.data;
        for (let i = 0; i < a.length; i += 4) {
          sum += Math.abs(a[i] - b[i]);
          sum += Math.abs(a[i + 1] - b[i + 1]);
          sum += Math.abs(a[i + 2] - b[i + 2]);
          n += 3;
        }
        setDiff(sum / n);
        probedRef.current = true;
      } catch (err) {
        console.warn("[loop-check] failed", err);
      }
    };

    run();
  }, [enabled, videoRef]);

  if (!enabled) return null;

  const seamColor =
    diff == null ? "hsl(var(--muted-foreground))"
      : diff < 6 ? "hsl(140 70% 45%)"
      : diff < 12 ? "hsl(45 90% 55%)"
      : "hsl(0 80% 60%)";

  const seamLabel =
    diff == null ? "measuring…"
      : diff < 6 ? "seamless"
      : diff < 12 ? "minor seam"
      : "visible seam";

  return (
    <div
      className="fixed bottom-3 right-3 z-[200] rounded-md border bg-background/90 backdrop-blur px-3 py-2 shadow-lg text-[10px] font-mono"
      style={{ maxWidth: 360 }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold uppercase tracking-wider">Loop check</span>
        <span style={{ color: seamColor }}>{seamLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-1">
        <figure className="space-y-0.5">
          <img
            src={first ?? posterSrc}
            alt="first frame"
            className="w-full rounded-sm border"
          />
          <figcaption className="text-muted-foreground">t=0.00s</figcaption>
        </figure>
        <figure className="space-y-0.5">
          <img
            src={last ?? posterSrc}
            alt="last frame"
            className="w-full rounded-sm border"
          />
          <figcaption className="text-muted-foreground">
            t={duration ? (duration - 0.05).toFixed(2) : "…"}s
          </figcaption>
        </figure>
      </div>
      <div className="text-muted-foreground">
        Δ {diff == null ? "…" : diff.toFixed(2)} / 255 · dur {duration?.toFixed(1) ?? "…"}s
      </div>
    </div>
  );
}
