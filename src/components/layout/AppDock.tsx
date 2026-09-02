import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import {
  Home,
  Library,
  FlaskConical,
  Hammer,
  Video,
  Users,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useAccessibility";

interface DockItem {
  label: string;
  to: string;
  icon: typeof Home;
  /** Primary destinations stay visible on small screens. */
  primary?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  { label: "Home", to: "/", icon: Home, primary: true },
  { label: "Library", to: "/library", icon: Library, primary: true },
  { label: "Experiment 101", to: "/experiment-101", icon: FlaskConical, primary: true },
  { label: "Builder", to: "/builder", icon: Hammer, primary: true },
  { label: "Videos", to: "/videos", icon: Video },
  { label: "Community", to: "/community", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

const BASE = 44; // px — meets the 44x44 minimum tap target
const MAX_SCALE = 1.45;
const INFLUENCE = 110; // px of horizontal magnetic influence


function DockButton({
  item,
  active,
  pointerX,
  magnetic,
}: {
  item: DockItem;
  active: boolean;
  pointerX: ReturnType<typeof useMotionValue<number | null>>;
  magnetic: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [scale, setScale] = useState(1);
  const Icon = item.icon;

  // Magnetic scaling is driven from the parent's pointermove; touch devices and
  // reduced-motion users get a plain, statically sized row.
  const updateScale = () => {
    if (!magnetic || !ref.current) return;
    const x = pointerX.get();
    if (x === null) {
      setScale(1);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(center - x);
    const t = Math.max(0, 1 - distance / INFLUENCE);
    setScale(1 + (MAX_SCALE - 1) * t * t);
  };

  pointerX.on?.("change", updateScale);

  return (
    <motion.div
      animate={{ width: BASE * (magnetic ? scale : 1) }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className="shrink-0"
      style={{ height: BASE }}
    >
      <Link
        ref={ref}
        to={item.to}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        title={item.label}
        className={cn(
          "flex h-11 w-full items-center justify-center rounded-xl border transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          active
            ? "border-primary/60 bg-primary/15 text-primary"
            : "border-border/60 bg-card/70 text-muted-foreground hover:text-foreground hover:border-primary/40",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

/**
 * Magnetic dock — a compact secondary nav strip that sits directly under the
 * main navbar. Horizontally scrollable so it never overflows narrow phones,
 * keyboard reachable, and kept below the AURA launcher in the stacking order.
 */
export function AppDock({ className }: { className?: string }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const pointerX = useMotionValue<number | null>(null);
  const [magnetic, setMagnetic] = useState(false);

  const enableMagnetic =
    !reduced &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  return (
    <nav
      aria-label="Quick navigation"
      data-testid="app-dock"
      data-magnetic={enableMagnetic ? "true" : "false"}
      className={cn(
        "relative z-20 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain",
        "px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      onPointerMove={(e) => {
        if (!enableMagnetic || e.pointerType !== "mouse") return;
        pointerX.set(e.clientX);
        setMagnetic(true);
      }}
      onPointerLeave={() => {
        pointerX.set(null);
        setMagnetic(false);
      }}
    >
      <ul className="mx-auto flex w-max items-center gap-2 rounded-2xl border border-border/60 bg-background/70 p-1.5 backdrop-blur-md">
        {DOCK_ITEMS.map((item) => (
          <li key={item.to} className="flex">
            <DockButton
              item={item}
              active={
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to)
              }
              pointerX={pointerX}
              magnetic={magnetic && enableMagnetic}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
