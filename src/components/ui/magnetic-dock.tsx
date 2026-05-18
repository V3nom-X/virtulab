"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
}

export interface MagneticDockProps {
  items: DockItemData[];
  iconSize?: number;
  maxScale?: number;
  magneticDistance?: number;
  showLabels?: boolean;
  position?: "bottom" | "top" | "left" | "right";
  variant?: "glass" | "solid" | "transparent";
  className?: string;
}

interface DockItemProps {
  item: DockItemData;
  mousePos: MotionValue<number>;
  iconSize: number;
  maxScale: number;
  magneticDistance: number;
  showLabels: boolean;
  isVertical: boolean;
}

function DockItem({
  item,
  mousePos,
  iconSize,
  maxScale,
  magneticDistance,
  showLabels,
  isVertical,
}: DockItemProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = React.useState(false);

  const distance = useTransform(mousePos, (val: number) => {
    if (!ref.current) return magneticDistance + 1;
    const rect = ref.current.getBoundingClientRect();
    const center = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
    return val - center;
  });

  const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1]);
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothScale = useSpring(scale, springConfig);
  const size = useTransform(smoothScale, (s) => s * iconSize);
  const offset = useTransform(smoothScale, (s) => (s - 1) * -10);
  const smoothOffset = useSpring(offset, springConfig);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={item.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={item.label}
      className={cn(
        "relative flex items-center justify-center rounded-2xl transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        item.isActive && "bg-primary/10",
      )}
      style={{
        width: size,
        height: size,
        y: isVertical ? 0 : smoothOffset,
        x: isVertical ? smoothOffset : 0,
      }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden",
          "bg-gradient-to-b from-card to-muted",
          "border border-border",
          "shadow-lg shadow-foreground/5",
          "flex items-center justify-center",
          "transition-all duration-200",
        )}
      >
        <div className="w-1/2 h-1/2 text-foreground/80">{item.icon}</div>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(var(--foreground)/0.12) 0%, transparent 50%)",
            opacity: hovered ? 0.9 : 0.5,
          }}
        />
      </motion.div>

      <AnimatePresence>
        {typeof item.badge === "number" && item.badge > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center border-2 border-background shadow"
          >
            {item.badge > 99 ? "99+" : item.badge}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {item.isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLabels && hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-sm font-medium whitespace-nowrap border border-border shadow-xl pointer-events-none z-50"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function MagneticDock({
  items,
  iconSize = 48,
  maxScale = 1.5,
  magneticDistance = 150,
  showLabels = true,
  position = "bottom",
  variant = "glass",
  className,
}: MagneticDockProps) {
  const mousePos = useMotionValue<number>(Infinity);
  const isVertical = position === "left" || position === "right";

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      mousePos.set(isVertical ? e.clientY : e.clientX);
    },
    [mousePos, isVertical],
  );

  const handleMouseLeave = () => mousePos.set(Infinity);

  const variantStyles: Record<NonNullable<MagneticDockProps["variant"]>, string> = {
    glass: "bg-background/70 backdrop-blur-xl backdrop-saturate-150 border border-border",
    solid: "bg-card border border-border",
    transparent: "bg-transparent",
  };

  const positionStyles: Record<NonNullable<MagneticDockProps["position"]>, string> = {
    bottom: "fixed bottom-4 left-1/2 -translate-x-1/2 flex-row items-end",
    top: "fixed top-4 left-1/2 -translate-x-1/2 flex-row items-start",
    left: "fixed left-4 top-1/2 -translate-y-1/2 flex-col items-start",
    right: "fixed right-4 top-1/2 -translate-y-1/2 flex-col items-end",
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="navigation"
      aria-label="Primary"
      className={cn(
        "inline-flex gap-2 p-3 rounded-3xl shadow-xl shadow-foreground/10 z-40",
        variantStyles[variant],
        positionStyles[position],
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          item={item}
          mousePos={mousePos}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticDistance={magneticDistance}
          showLabels={showLabels}
          isVertical={isVertical}
        />
      ))}
    </motion.div>
  );
}
