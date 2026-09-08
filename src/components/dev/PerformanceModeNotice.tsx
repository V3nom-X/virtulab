import { Gauge, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeviceTier } from "@/lib/renderBudget";

interface PerformanceModeNoticeProps {
  /** True when the FPS watchdog froze the scene to a static frame. */
  degraded: boolean;
  tier: DeviceTier;
  fps: number;
  onRestore: () => void;
  className?: string;
}

/**
 * Small badge showing the active quality tier, and — when the scene has been
 * frozen to a still frame after sustained low frame rates — an explanation with
 * a button to turn full motion back on.
 */
export function PerformanceModeNotice({
  degraded,
  tier,
  fps,
  onRestore,
  className,
}: PerformanceModeNoticeProps) {
  if (!degraded) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur",
          className,
        )}
        aria-hidden="true"
      >
        <Gauge className="h-3 w-3" />
        <span className="capitalize">{tier} quality</span>
        {fps > 0 && <span>· {fps} fps</span>}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "absolute bottom-3 left-3 right-3 flex flex-col gap-2 rounded-lg border border-border bg-background/95 p-3 text-sm shadow-lg backdrop-blur sm:max-w-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Performance mode: motion is paused on a still image so this device stays responsive. All
          controls and readings still work.
        </p>
      </div>
      <Button size="sm" variant="secondary" className="min-h-11 self-start" onClick={onRestore}>
        <Play className="mr-1.5 h-4 w-4" />
        Turn motion back on
      </Button>
    </div>
  );
}
