import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

interface SeparationSimulationProps {
  experimentId: string;
}

export interface SeparationSimulationHandle {
  reset: () => void;
}

export const SeparationSimulation = forwardRef<SeparationSimulationHandle, SeparationSimulationProps>(
  ({ experimentId }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const timeRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [temperature, setTemperature] = useState(25);
    const stateRef = useRef<Record<string, number>>({
      liquidLevel: 1,
      crystalCount: 0,
      vapourCount: 0,
      solventFront: 0,
      layerSeparation: 0,
      drainProgress: 0,
    });

    const reset = () => {
      timeRef.current = 0;
      setIsPlaying(false);
      setTemperature(25);
      stateRef.current = {
        liquidLevel: 1,
        crystalCount: 0,
        vapourCount: 0,
        solventFront: 0,
        layerSeparation: 0,
        drainProgress: 0,
      };
    };

    useImperativeHandle(ref, () => ({ reset }), []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      };
      resize();
      window.addEventListener("resize", resize);

      const particles = Array.from({ length: 60 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: 2 + Math.random() * 3,
        type: Math.random() > 0.5 ? "solute" : "solvent",
      }));

      const draw = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);

        const st = stateRef.current;

        if (isPlaying) {
          timeRef.current += 0.016;
          const heatFactor = Math.max(0, (temperature - 25) / 95);

          if (experimentId === "evaporation") {
            st.liquidLevel = Math.max(0.05, st.liquidLevel - heatFactor * 0.0008);
            st.crystalCount = Math.min(1, (1 - st.liquidLevel) * 1.2);
          } else if (experimentId === "crystallization") {
            if (temperature > 60) {
              st.liquidLevel = Math.min(1, st.liquidLevel + 0.001);
              st.crystalCount = Math.max(0, st.crystalCount - 0.001);
            } else if (temperature < 40) {
              st.crystalCount = Math.min(1, st.crystalCount + 0.0005);
            }
          } else if (experimentId === "simple-distillation" || experimentId === "fractional-distillation") {
            if (temperature >= 78) {
              st.vapourCount = Math.min(1, st.vapourCount + 0.001);
              st.liquidLevel = Math.max(0.1, st.liquidLevel - 0.0005);
            }
          } else if (experimentId === "sublimation") {
            if (temperature > 50) {
              st.vapourCount = Math.min(1, st.vapourCount + heatFactor * 0.001);
              st.crystalCount = Math.min(1, st.vapourCount * 0.8);
            }
          } else if (experimentId === "solvent-extraction") {
            st.layerSeparation = Math.min(1, st.layerSeparation + 0.002);
          } else if (experimentId === "chromatography") {
            st.solventFront = Math.min(0.85, st.solventFront + 0.001);
          }
        }

        // Render based on experiment type
        switch (experimentId) {
          case "evaporation": drawEvaporation(ctx, w, h, st, particles, temperature); break;
          case "crystallization": drawCrystallization(ctx, w, h, st, particles, temperature); break;
          case "simple-distillation": drawSimpleDistillation(ctx, w, h, st, particles, temperature); break;
          case "fractional-distillation": drawFractionalDistillation(ctx, w, h, st, particles, temperature); break;
          case "sublimation": drawSublimation(ctx, w, h, st, particles, temperature); break;
          case "solvent-extraction": drawSolventExtraction(ctx, w, h, st, temperature); break;
          case "chromatography": drawChromatography(ctx, w, h, st); break;
        }

        // Temperature display
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "bold 14px system-ui";
        ctx.textAlign = "right";
        ctx.fillText(`${temperature}°C`, w - 15, 25);

        animationRef.current = requestAnimationFrame(draw);
      };

      animationRef.current = requestAnimationFrame(draw);
      return () => {
        cancelAnimationFrame(animationRef.current);
        window.removeEventListener("resize", resize);
      };
    }, [experimentId, isPlaying, temperature]);

    return (
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          <canvas ref={canvasRef} className="w-full" style={{ height: 350, display: "block" }} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={isPlaying ? "secondary" : "default"} onClick={() => setIsPlaying(!isPlaying)} className="gap-1">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>
            <Button size="sm" variant="outline" onClick={reset} className="gap-1">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
          <div className="flex-1 flex items-center gap-3 w-full">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {experimentId === "crystallization" ? "Temperature" : "Heat"}
            </span>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={10}
              max={120}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-12 text-right">{temperature}°C</span>
          </div>
        </div>
      </div>
    );
  }
);

SeparationSimulation.displayName = "SeparationSimulation";

// --- Drawing functions ---

function drawEvaporation(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, particles: any[], temp: number) {
  const beakerX = w * 0.25, beakerW = w * 0.5, beakerY = h * 0.3, beakerH = h * 0.55;

  // Heat source
  if (temp > 30) {
    for (let i = 0; i < 5; i++) {
      const fx = beakerX + beakerW * 0.2 + (beakerW * 0.6 / 5) * i;
      ctx.fillStyle = `hsla(20, 100%, 55%, ${0.5 + Math.sin(Date.now() / 200 + i) * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(fx, beakerY + beakerH + 8, 6, 12 + Math.sin(Date.now() / 300 + i) * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Beaker
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.strokeRect(beakerX, beakerY, beakerW, beakerH);

  // Liquid
  const liquidTop = beakerY + beakerH * (1 - st.liquidLevel);
  const liquidH = beakerH * st.liquidLevel;
  const grad = ctx.createLinearGradient(0, liquidTop, 0, beakerY + beakerH);
  grad.addColorStop(0, `hsla(200, 70%, 60%, ${0.4 + st.liquidLevel * 0.4})`);
  grad.addColorStop(1, "hsla(200, 70%, 45%, 0.8)");
  ctx.fillStyle = grad;
  ctx.fillRect(beakerX + 1, liquidTop, beakerW - 2, liquidH);

  // Salt crystals at bottom
  if (st.crystalCount > 0) {
    ctx.fillStyle = "hsl(0, 0%, 92%)";
    const crystalH = st.crystalCount * 30;
    ctx.fillRect(beakerX + 2, beakerY + beakerH - crystalH, beakerW - 4, crystalH);
    ctx.strokeStyle = "hsl(0, 0%, 80%)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < st.crystalCount * 8; i++) {
      const cx = beakerX + 10 + Math.random() * (beakerW - 20);
      const cy = beakerY + beakerH - Math.random() * crystalH;
      ctx.strokeRect(cx - 3, cy - 3, 6, 6);
    }
  }

  // Vapour particles
  if (temp > 40) {
    const vapourIntensity = Math.min(1, (temp - 40) / 60);
    for (let i = 0; i < vapourIntensity * 15; i++) {
      const vx = beakerX + 20 + Math.random() * (beakerW - 40);
      const vy = liquidTop - 10 - Math.random() * (liquidTop - beakerY + 40);
      const opacity = 0.3 * (1 - (beakerY - vy + 40) / (liquidTop - beakerY + 80));
      ctx.fillStyle = `hsla(200, 60%, 80%, ${Math.max(0, opacity)})`;
      ctx.beginPath();
      ctx.arc(vx, vy + Math.sin(Date.now() / 500 + i) * 3, 4 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Labels
  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Evaporating Dish", w / 2, beakerY + beakerH + 30);
  if (st.liquidLevel < 0.9) ctx.fillText(`Liquid: ${(st.liquidLevel * 100).toFixed(0)}%`, w / 2, beakerY - 10);
}

function drawCrystallization(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, particles: any[], temp: number) {
  const beakerX = w * 0.2, beakerW = w * 0.6, beakerY = h * 0.2, beakerH = h * 0.6;

  // Beaker
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(beakerX, beakerY);
  ctx.lineTo(beakerX, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY);
  ctx.stroke();

  // Solution (blue copper sulfate)
  const grad = ctx.createLinearGradient(0, beakerY + beakerH * 0.3, 0, beakerY + beakerH);
  grad.addColorStop(0, `hsla(210, 80%, 55%, ${0.5 - st.crystalCount * 0.3})`);
  grad.addColorStop(1, `hsla(210, 70%, 45%, ${0.7 - st.crystalCount * 0.3})`);
  ctx.fillStyle = grad;
  ctx.fillRect(beakerX + 1, beakerY + beakerH * 0.3, beakerW - 2, beakerH * 0.7);

  // Crystals
  if (st.crystalCount > 0) {
    const numCrystals = Math.floor(st.crystalCount * 15);
    for (let i = 0; i < numCrystals; i++) {
      const cx = beakerX + 20 + (i / numCrystals) * (beakerW - 40);
      const cy = beakerY + beakerH - 10 - Math.random() * 40 * st.crystalCount;
      const size = 4 + st.crystalCount * 8;
      // Diamond shape
      ctx.fillStyle = `hsla(210, 90%, 65%, ${0.6 + st.crystalCount * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size * 0.6, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size * 0.6, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "hsla(210, 80%, 50%, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Temperature indicator
  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(temp > 60 ? "Heating — dissolving..." : temp < 40 ? "Cooling — crystals forming..." : "Warm solution", w / 2, beakerY - 10);
  ctx.fillText("Beaker", w / 2, beakerY + beakerH + 25);
}

function drawSimpleDistillation(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, particles: any[], temp: number) {
  const flaskX = w * 0.08, flaskW = w * 0.25, flaskY = h * 0.35, flaskH = h * 0.45;

  // Flask
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(flaskX + flaskW * 0.3, flaskY);
  ctx.lineTo(flaskX, flaskY + flaskH * 0.3);
  ctx.lineTo(flaskX, flaskY + flaskH);
  ctx.lineTo(flaskX + flaskW, flaskY + flaskH);
  ctx.lineTo(flaskX + flaskW, flaskY + flaskH * 0.3);
  ctx.lineTo(flaskX + flaskW * 0.7, flaskY);
  ctx.stroke();

  // Liquid in flask
  const lvl = st.liquidLevel;
  ctx.fillStyle = "hsla(200, 70%, 55%, 0.6)";
  ctx.fillRect(flaskX + 1, flaskY + flaskH * (1 - lvl * 0.6), flaskW - 2, flaskH * lvl * 0.6);

  // Condenser tube
  const condStartX = flaskX + flaskW * 0.7;
  const condStartY = flaskY;
  const condEndX = w * 0.7;
  const condEndY = h * 0.55;
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(condStartX, condStartY);
  ctx.lineTo(condEndX, condEndY);
  ctx.stroke();
  // Outer tube
  ctx.beginPath();
  ctx.moveTo(condStartX - 3, condStartY - 8);
  ctx.lineTo(condEndX - 3, condEndY - 8);
  ctx.moveTo(condStartX + 3, condStartY + 8);
  ctx.lineTo(condEndX + 3, condEndY + 8);
  ctx.stroke();

  // Receiving flask
  const recvX = condEndX - 10, recvY = condEndY, recvW = w * 0.2, recvH = h * 0.3;
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.strokeRect(recvX, recvY, recvW, recvH);

  // Distillate in receiving flask
  const distillate = st.vapourCount * 0.8;
  if (distillate > 0) {
    ctx.fillStyle = "hsla(200, 80%, 70%, 0.5)";
    ctx.fillRect(recvX + 1, recvY + recvH * (1 - distillate), recvW - 2, recvH * distillate);
  }

  // Vapour animation along condenser
  if (temp >= 78 && isFinite(st.vapourCount)) {
    for (let i = 0; i < 8; i++) {
      const t = ((Date.now() / 1000 + i * 0.2) % 2) / 2;
      const vx = condStartX + (condEndX - condStartX) * t;
      const vy = condStartY + (condEndY - condStartY) * t;
      ctx.fillStyle = `hsla(200, 60%, 80%, ${0.6 - t * 0.5})`;
      ctx.beginPath();
      ctx.arc(vx, vy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heat source
  if (temp > 30) {
    ctx.fillStyle = `hsla(20, 100%, 55%, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(flaskX + flaskW / 2, flaskY + flaskH + 10, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Labels
  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Flask", flaskX + flaskW / 2, flaskY + flaskH + 30);
  ctx.fillText("Condenser", (condStartX + condEndX) / 2, Math.min(condStartY, condEndY) - 15);
  ctx.fillText("Receiver", recvX + recvW / 2, recvY + recvH + 20);
}

function drawFractionalDistillation(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, particles: any[], temp: number) {
  const flaskX = w * 0.15, flaskW = w * 0.22, flaskY = h * 0.55, flaskH = h * 0.32;
  const colX = flaskX + flaskW * 0.35, colW = flaskW * 0.3, colY = h * 0.08, colH = flaskY - colY;

  // Flask
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.strokeRect(flaskX, flaskY, flaskW, flaskH);

  // Liquid in flask (mixture)
  ctx.fillStyle = "hsla(270, 60%, 55%, 0.5)";
  ctx.fillRect(flaskX + 1, flaskY + flaskH * 0.3, flaskW - 2, flaskH * 0.7 * st.liquidLevel);

  // Fractionating column
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.strokeRect(colX, colY, colW, colH);

  // Temperature zones in column
  const zones = 5;
  for (let i = 0; i < zones; i++) {
    const zy = colY + (colH / zones) * i;
    const zh = colH / zones;
    const hue = 200 + (i / zones) * 160; // blue to red
    ctx.fillStyle = `hsla(${hue}, 50%, 60%, 0.2)`;
    ctx.fillRect(colX + 1, zy, colW - 2, zh);
    // Tray/bead
    ctx.fillStyle = "hsla(0, 0%, 50%, 0.3)";
    ctx.fillRect(colX + 2, zy + zh - 2, colW - 4, 2);
  }

  // Condenser and receiver
  const condEndX = w * 0.75, condEndY = h * 0.3;
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(colX + colW, colY + 10);
  ctx.lineTo(condEndX, condEndY);
  ctx.stroke();

  ctx.strokeRect(condEndX - 5, condEndY, w * 0.15, h * 0.25);
  if (st.vapourCount > 0) {
    ctx.fillStyle = "hsla(210, 80%, 65%, 0.5)";
    ctx.fillRect(condEndX - 4, condEndY + h * 0.25 * (1 - st.vapourCount * 0.6), w * 0.15 - 2, h * 0.25 * st.vapourCount * 0.6);
  }

  // Vapour in column
  if (temp >= 60) {
    for (let i = 0; i < 6; i++) {
      const t = ((Date.now() / 800 + i * 0.3) % 3) / 3;
      const vx = colX + colW / 2 + Math.sin(t * 10) * 3;
      const vy = flaskY - t * colH;
      const color = i < 3 ? "hsla(210, 80%, 65%, 0.6)" : "hsla(0, 70%, 55%, 0.4)";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(vx, vy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Flask", flaskX + flaskW / 2, flaskY + flaskH + 18);
  ctx.fillText("Column", colX + colW / 2, colY - 5);
  ctx.fillText("Ethanol: 78°C", w * 0.72, h * 0.18);
  ctx.fillText("Water: 100°C", w * 0.72, h * 0.22);
}

function drawSublimation(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, particles: any[], temp: number) {
  const dishX = w * 0.2, dishW = w * 0.6, dishY = h * 0.6, dishH = h * 0.12;

  // Evaporating dish
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(dishX + dishW / 2, dishY + dishH / 2, dishW / 2, dishH / 2, 0, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(dishX + dishW / 2, dishY + dishH / 2, dishW / 2, dishH / 2, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Mixture in dish (sand = yellow, ammonium chloride = white)
  const mixAmount = 1 - st.vapourCount * 0.5;
  ctx.fillStyle = "hsla(45, 70%, 55%, 0.7)";
  ctx.beginPath();
  ctx.ellipse(dishX + dishW / 2, dishY + dishH / 2 + 2, dishW * 0.45, dishH * 0.3 * mixAmount, 0, 0, Math.PI);
  ctx.fill();

  if (st.vapourCount < 0.8) {
    ctx.fillStyle = "hsla(0, 0%, 90%, 0.6)";
    for (let i = 0; i < (1 - st.vapourCount) * 10; i++) {
      const px = dishX + dishW * 0.2 + Math.random() * dishW * 0.6;
      ctx.beginPath();
      ctx.arc(px, dishY + dishH * 0.3 + Math.random() * dishH * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inverted funnel
  const funnelY = h * 0.15;
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(dishX + dishW * 0.1, dishY - 5);
  ctx.lineTo(w / 2 - 8, funnelY);
  ctx.lineTo(w / 2 + 8, funnelY);
  ctx.lineTo(dishX + dishW * 0.9, dishY - 5);
  ctx.stroke();
  // Stem
  ctx.strokeRect(w / 2 - 5, funnelY - 20, 10, 20);

  // Rising vapour
  if (temp > 50) {
    const vapourIntensity = Math.min(1, (temp - 50) / 70);
    for (let i = 0; i < vapourIntensity * 12; i++) {
      const vx = dishX + dishW * 0.3 + Math.random() * dishW * 0.4;
      const t = ((Date.now() / 600 + i * 0.4) % 3) / 3;
      const vy = dishY - 10 - t * (dishY - funnelY - 20);
      ctx.fillStyle = `hsla(0, 0%, 90%, ${0.5 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(vx + Math.sin(Date.now() / 300 + i) * 5, vy, 3 + t * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Deposited crystals on funnel
  if (st.crystalCount > 0) {
    for (let i = 0; i < st.crystalCount * 12; i++) {
      const angle = -0.3 + (i / 12) * 0.6 - 0.3;
      const fDist = 0.3 + Math.random() * 0.5;
      const cx = w / 2 + Math.cos(Math.PI + angle) * dishW * fDist * 0.4;
      const cy = funnelY + 15 + fDist * (dishY - funnelY - 30) * 0.5;
      ctx.fillStyle = "hsla(0, 0%, 95%, 0.8)";
      ctx.beginPath();
      ctx.arc(cx, cy, 2 + st.crystalCount * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heat
  if (temp > 30) {
    ctx.fillStyle = `hsla(20, 100%, 55%, ${0.4 + Math.sin(Date.now() / 200) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(w / 2, dishY + dishH + 10, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Evaporating Dish", w / 2, dishY + dishH + 30);
  ctx.fillText("Inverted Funnel", w / 2, funnelY - 25);
}

function drawSolventExtraction(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>, temp: number) {
  const funnelX = w * 0.3, funnelW = w * 0.4, funnelTop = h * 0.1, funnelH = h * 0.6;

  // Separating funnel shape
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  // Neck
  ctx.strokeRect(funnelX + funnelW * 0.4, funnelTop, funnelW * 0.2, funnelH * 0.15);
  // Bulb
  ctx.beginPath();
  ctx.moveTo(funnelX + funnelW * 0.4, funnelTop + funnelH * 0.15);
  ctx.lineTo(funnelX, funnelTop + funnelH * 0.4);
  ctx.lineTo(funnelX, funnelTop + funnelH * 0.85);
  ctx.lineTo(funnelX + funnelW * 0.45, funnelTop + funnelH);
  ctx.lineTo(funnelX + funnelW * 0.55, funnelTop + funnelH);
  ctx.lineTo(funnelX + funnelW, funnelTop + funnelH * 0.85);
  ctx.lineTo(funnelX + funnelW, funnelTop + funnelH * 0.4);
  ctx.lineTo(funnelX + funnelW * 0.6, funnelTop + funnelH * 0.15);
  ctx.stroke();
  // Tap
  ctx.strokeRect(funnelX + funnelW * 0.42, funnelTop + funnelH, funnelW * 0.16, h * 0.08);

  // Liquid layers
  const sep = st.layerSeparation;
  const midY = funnelTop + funnelH * 0.6;

  // Bottom layer (water - denser)
  ctx.fillStyle = `hsla(200, 70%, 55%, ${0.5 + sep * 0.3})`;
  ctx.fillRect(funnelX + 2, midY + 5 * (1 - sep), funnelW - 4, funnelTop + funnelH * 0.85 - midY);

  // Top layer (oil - lighter)
  ctx.fillStyle = `hsla(45, 80%, 55%, ${0.4 + sep * 0.3})`;
  ctx.fillRect(funnelX + 5, funnelTop + funnelH * 0.3, funnelW - 10, midY - funnelTop - funnelH * 0.3 - 5 * (1 - sep));

  // Interface line
  if (sep > 0.3) {
    ctx.strokeStyle = "hsla(0, 0%, 60%, 0.5)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(funnelX + 5, midY);
    ctx.lineTo(funnelX + funnelW - 5, midY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "11px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("Oil (less dense)", funnelX + funnelW + 10, midY - 20);
  ctx.fillText("Water (denser)", funnelX + funnelW + 10, midY + 30);
  ctx.textAlign = "center";
  ctx.fillText("Separating Funnel", w / 2, funnelTop + funnelH + h * 0.12);
  if (sep < 1) ctx.fillText("Settling...", w / 2, funnelTop - 5);
  else ctx.fillText("Layers separated — open tap to drain", w / 2, funnelTop - 5);
}

function drawChromatography(ctx: CanvasRenderingContext2D, w: number, h: number, st: Record<string, number>) {
  const beakerX = w * 0.25, beakerW = w * 0.5, beakerY = h * 0.4, beakerH = h * 0.5;

  // Beaker with solvent
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 2;
  ctx.strokeRect(beakerX, beakerY, beakerW, beakerH);
  ctx.fillStyle = "hsla(200, 60%, 70%, 0.3)";
  ctx.fillRect(beakerX + 1, beakerY + beakerH * 0.7, beakerW - 2, beakerH * 0.3);

  // Paper strip
  const paperX = w / 2 - 15, paperW = 30, paperTop = h * 0.08, paperH = h * 0.82;
  ctx.fillStyle = "hsl(0, 0%, 96%)";
  ctx.fillRect(paperX, paperTop, paperW, paperH);
  ctx.strokeStyle = "hsl(var(--foreground))";
  ctx.lineWidth = 1;
  ctx.strokeRect(paperX, paperTop, paperW, paperH);

  // Baseline (pencil)
  const baselineY = paperTop + paperH * 0.85;
  ctx.strokeStyle = "hsl(0, 0%, 50%)";
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(paperX, baselineY);
  ctx.lineTo(paperX + paperW, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Solvent front
  const frontY = baselineY - st.solventFront * paperH * 0.75;
  ctx.strokeStyle = "hsla(200, 60%, 50%, 0.5)";
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(paperX, frontY);
  ctx.lineTo(paperX + paperW, frontY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wet paper
  if (st.solventFront > 0) {
    ctx.fillStyle = "hsla(200, 50%, 80%, 0.3)";
    ctx.fillRect(paperX + 1, frontY, paperW - 2, baselineY - frontY);
  }

  // Ink spot and separated dyes
  const dyeColors = [
    { color: "hsla(0, 80%, 50%, 0.8)", rf: 0.3 },
    { color: "hsla(210, 80%, 50%, 0.8)", rf: 0.55 },
    { color: "hsla(50, 90%, 50%, 0.8)", rf: 0.75 },
  ];

  // Original spot
  ctx.fillStyle = "hsla(0, 0%, 20%, 0.8)";
  ctx.beginPath();
  ctx.arc(w / 2, baselineY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Separated spots
  if (st.solventFront > 0.1) {
    dyeColors.forEach(dye => {
      const progress = Math.min(1, st.solventFront / dye.rf);
      if (progress > 0.2) {
        const spotY = baselineY - dye.rf * st.solventFront * paperH * 0.75 / 0.85;
        if (spotY > frontY) {
          ctx.fillStyle = dye.color;
          ctx.beginPath();
          ctx.ellipse(w / 2, spotY, 8, 4 + progress * 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  // Labels
  ctx.fillStyle = "hsl(var(--foreground))";
  ctx.font = "11px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("Solvent front", paperX + paperW + 8, frontY + 4);
  ctx.fillText("Baseline", paperX + paperW + 8, baselineY + 4);
  ctx.textAlign = "center";
  ctx.fillText("Paper Chromatography", w / 2, paperTop - 8);

  if (st.solventFront > 0.5) {
    ctx.font = "10px system-ui";
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.fillText("Rf = distance by spot ÷ distance by solvent", w / 2, h - 5);
  }
}
