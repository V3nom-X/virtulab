"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MatrixRainProps {
  className?: string;
  /** "default" follows the current theme; "fixed" uses `fixedColor`. */
  variant?: "default" | "fixed";
  width?: number;
  height?: number;
  fontSize?: number;
  /** Bigger = slower trail decay (default 0.05 = classic Matrix). */
  speed?: number;
  fixedColor?: string;
}

const GLYPHS =
  "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789Z:・.\"=*+-<>¦｜çﾘｸ";

function getThemeColors(variant: MatrixRainProps["variant"], fixedColor?: string, trailBoost = 1) {
  // trailBoost < 1 means longer trails (less fade per frame). Larger screens get longer strips.
  if (variant === "fixed" && fixedColor) {
    return { bg: `rgba(0,0,0,${0.08 * trailBoost})`, fg: fixedColor };
  }
  const isDark = document.documentElement.classList.contains("dark");
  return isDark
    ? { bg: `rgba(0,0,0,${0.12 * trailBoost})`, fg: "#00ff9c" }
    : { bg: `rgba(255,255,255,${0.18 * trailBoost})`, fg: "#00cc66" };
}

export function MatrixRain({
  className,
  variant = "default",
  width,
  height,
  fontSize = 16,
  speed = 0.05,
  fixedColor,
}: MatrixRainProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");

    let raf = 0;
    let drops: number[] = [];

    let trailBoost = 1;
    let dropSpeedMul = 1;

    const sizeCanvas = () => {
      if (width) canvas.width = width;
      else canvas.width = canvas.offsetWidth || window.innerWidth;
      if (height) canvas.height = height;
      else canvas.height = canvas.offsetHeight || window.innerHeight;

      const columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -20);

      // Larger screens => longer drops & strips.
      // Reduce per-frame background fade (smaller trailBoost) and slightly bump speed.
      const w = canvas.width;
      if (w >= 1920) { trailBoost = 0.45; dropSpeedMul = 1.35; }
      else if (w >= 1280) { trailBoost = 0.6; dropSpeedMul = 1.2; }
      else if (w >= 768) { trailBoost = 0.8; dropSpeedMul = 1.1; }
      else { trailBoost = 1; dropSpeedMul = 1; }
    };

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(canvas);

    const draw = () => {
      const { bg, fg } = getThemeColors(variant, fixedColor, trailBoost);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = fg;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speed * 4 * dropSpeedMul;
      }
    };

    if (reduceMotion) {
      draw();
      draw();
      return () => ro.disconnect();
    }

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [variant, fixedColor, fontSize, speed, width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-shader
      className={cn("size-full block rounded-[inherit] bg-black", className)}
      style={{ width, height }}
    />
  );
}
