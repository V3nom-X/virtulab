import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Eye, EyeOff } from "lucide-react";

interface Props {
  experimentId: string;
}

const substances: { name: string; pH: number; type: "acid" | "base" | "neutral" }[] = [
  { name: "Battery Acid", pH: 1, type: "acid" },
  { name: "Stomach Acid (HCl)", pH: 2, type: "acid" },
  { name: "Lemon Juice", pH: 2.5, type: "acid" },
  { name: "Vinegar", pH: 3, type: "acid" },
  { name: "Coffee", pH: 5, type: "acid" },
  { name: "Milk", pH: 6.5, type: "acid" },
  { name: "Pure Water", pH: 7, type: "neutral" },
  { name: "Baking Soda", pH: 8.5, type: "base" },
  { name: "Soap Solution", pH: 10, type: "base" },
  { name: "Ammonia", pH: 11, type: "base" },
  { name: "Bleach", pH: 12.5, type: "base" },
  { name: "Drain Cleaner (NaOH)", pH: 14, type: "base" },
];

const indicators = [
  { id: "universal", name: "Universal Indicator" },
  { id: "litmus_red", name: "Red Litmus Paper" },
  { id: "litmus_blue", name: "Blue Litmus Paper" },
  { id: "phenolphthalein", name: "Phenolphthalein" },
  { id: "methyl_orange", name: "Methyl Orange" },
  { id: "cabbage", name: "Red Cabbage Extract" },
  { id: "turmeric", name: "Turmeric Extract" },
];

const getIndicatorColor = (pH: number, indicator: string): string => {
  switch (indicator) {
    case "universal":
      if (pH <= 2) return "#ff0000";
      if (pH <= 4) return "#ff6600";
      if (pH <= 6) return "#ffcc00";
      if (pH <= 7) return "#66cc00";
      if (pH <= 8) return "#00cc66";
      if (pH <= 10) return "#0066cc";
      if (pH <= 12) return "#3300cc";
      return "#6600cc";
    case "litmus_red":
      return pH > 7 ? "#3498db" : "#e74c3c";
    case "litmus_blue":
      return pH < 7 ? "#e74c3c" : "#3498db";
    case "phenolphthalein":
      return pH < 8.2 ? "rgba(255,240,240,0.4)" : "#e91e9c";
    case "methyl_orange":
      return pH < 3.1 ? "#e74c3c" : pH < 4.4 ? "#f39c12" : "#f1c40f";
    case "cabbage":
      if (pH <= 2) return "#ff0044";
      if (pH <= 4) return "#cc0066";
      if (pH <= 6) return "#9933cc";
      if (pH <= 7) return "#6644aa";
      if (pH <= 8) return "#3366cc";
      if (pH <= 10) return "#009966";
      return "#cccc00";
    case "turmeric":
      return pH > 8.5 ? "#8B2500" : "#FFD700";
    default:
      return "#ffffff";
  }
};

const getIndicatorLabel = (pH: number, indicator: string): string => {
  switch (indicator) {
    case "litmus_red":
      return pH > 7 ? "Turns BLUE → Base detected" : "Stays RED → Acid or neutral";
    case "litmus_blue":
      return pH < 7 ? "Turns RED → Acid detected" : "Stays BLUE → Base or neutral";
    case "phenolphthalein":
      return pH < 8.2 ? "Colorless → Acid or weak base" : "Pink/Magenta → Base detected";
    case "methyl_orange":
      return pH < 3.1 ? "Red → Strong acid" : pH < 4.4 ? "Orange → Weak acid" : "Yellow → Neutral or basic";
    case "cabbage":
      return pH < 7 ? "Red/Purple → Acidic" : pH === 7 ? "Blue/Purple → Neutral" : "Green/Yellow → Basic";
    case "turmeric":
      return pH > 8.5 ? "Reddish-brown → Base detected" : "Yellow → Acid or neutral";
    default:
      return pH < 7 ? "Acidic" : pH > 7 ? "Basic" : "Neutral";
  }
};

export function AcidBaseLabSimulation({ experimentId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const bubblesRef = useRef<{ x: number; y: number; r: number; vy: number; opacity: number }[]>([]);
  const ionsRef = useRef<{ x: number; y: number; vx: number; vy: number; type: "H+" | "OH-"; opacity: number }[]>([]);

  const [selectedSubstance, setSelectedSubstance] = useState(6); // Pure Water
  const [selectedIndicator, setSelectedIndicator] = useState("universal");
  const [showMolecular, setShowMolecular] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState([50]);

  const substance = substances[selectedSubstance];
  const liquidColor = getIndicatorColor(substance.pH, selectedIndicator);

  // Initialize ions when substance changes
  useEffect(() => {
    const hCount = substance.pH < 7 ? Math.round((7 - substance.pH) * 4) : 2;
    const ohCount = substance.pH > 7 ? Math.round((substance.pH - 7) * 4) : 2;
    const ions: typeof ionsRef.current = [];
    for (let i = 0; i < hCount; i++) {
      ions.push({ x: 100 + Math.random() * 300, y: 150 + Math.random() * 200, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: "H+", opacity: 0.9 });
    }
    for (let i = 0; i < ohCount; i++) {
      ions.push({ x: 100 + Math.random() * 300, y: 150 + Math.random() * 200, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: "OH-", opacity: 0.9 });
    }
    ionsRef.current = ions;
  }, [selectedSubstance, substance.pH]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "hsl(240, 10%, 8%)";
    ctx.fillRect(0, 0, w, h);

    // Draw lab bench
    ctx.fillStyle = "hsl(30, 20%, 25%)";
    ctx.fillRect(0, h * 0.85, w, h * 0.15);
    ctx.strokeStyle = "hsl(30, 15%, 35%)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.85);
    ctx.lineTo(w, h * 0.85);
    ctx.stroke();

    // Beaker
    const bx = w * 0.2, by = h * 0.15, bw = w * 0.4, bh = h * 0.6;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Measurement marks
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const markY = by + (bh * i) / 5;
      ctx.beginPath();
      ctx.moveTo(bx + 5, markY);
      ctx.lineTo(bx + 20, markY);
      ctx.stroke();
    }

    // Liquid with volume control
    const liquidFill = (volume[0] / 100) * 0.8;
    const liquidH = bh * liquidFill;
    const liquidY = by + bh - liquidH;

    const grad = ctx.createLinearGradient(bx, liquidY, bx, by + bh);
    grad.addColorStop(0, liquidColor);
    grad.addColorStop(1, liquidColor + "99");
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 2, liquidY, bw - 4, liquidH - 2);

    // Surface shimmer
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(bx + 2, liquidY, bw - 4, 3);

    // Bubbles for acids
    if (substance.pH < 5 && isPlaying) {
      if (Math.random() < 0.15) {
        bubblesRef.current.push({
          x: bx + 10 + Math.random() * (bw - 20),
          y: by + bh - 10,
          r: 2 + Math.random() * 4,
          vy: 0.5 + Math.random() * 1.5,
          opacity: 0.7,
        });
      }
    }

    bubblesRef.current = bubblesRef.current.filter((b) => {
      if (isPlaying) {
        b.y -= b.vy;
        b.opacity -= 0.005;
      }
      if (b.y < liquidY || b.opacity <= 0) return false;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${b.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      return true;
    });

    // Molecular view - ions
    if (showMolecular) {
      ionsRef.current.forEach((ion) => {
        if (isPlaying) {
          ion.x += ion.vx;
          ion.y += ion.vy;
          // Bounce within beaker
          if (ion.x < bx + 10 || ion.x > bx + bw - 10) ion.vx *= -1;
          if (ion.y < liquidY + 5 || ion.y > by + bh - 10) ion.vy *= -1;
          ion.x = Math.max(bx + 10, Math.min(bx + bw - 10, ion.x));
          ion.y = Math.max(liquidY + 5, Math.min(by + bh - 10, ion.y));
        }

        const isH = ion.type === "H+";
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, isH ? 6 : 8, 0, Math.PI * 2);
        ctx.fillStyle = isH ? "rgba(255, 80, 80, 0.8)" : "rgba(80, 140, 255, 0.8)";
        ctx.fill();
        ctx.strokeStyle = isH ? "#ff3333" : "#3366ff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ion.type, ion.x, ion.y);
      });

      // Legend
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(bx, by + bh + 8, bw, 30);
      ctx.fillStyle = "rgba(255,80,80,0.8)";
      ctx.beginPath(); ctx.arc(bx + 15, by + bh + 23, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("H⁺ (Hydrogen ion)", bx + 25, by + bh + 26);

      ctx.fillStyle = "rgba(80,140,255,0.8)";
      ctx.beginPath(); ctx.arc(bx + bw / 2 + 15, by + bh + 23, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText("OH⁻ (Hydroxide ion)", bx + bw / 2 + 25, by + bh + 26);
    }

    // pH Scale on right
    const sx = w * 0.72, sy = h * 0.08, sw = w * 0.06, sh = h * 0.75;
    const scaleGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#00cc66", "#0066cc", "#3300cc", "#6600cc"].forEach((c, i, a) =>
      scaleGrad.addColorStop(i / (a.length - 1), c)
    );
    ctx.fillStyle = scaleGrad;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, sw, sh);

    // pH numbers
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    for (let i = 0; i <= 14; i++) {
      const ny = sy + (i / 14) * sh;
      ctx.fillText(`${i}`, sx + sw + 5, ny + 4);
    }

    // pH marker
    const markerY = sy + (substance.pH / 14) * sh;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(sx - 10, markerY);
    ctx.lineTo(sx, markerY - 6);
    ctx.lineTo(sx, markerY + 6);
    ctx.fill();

    // Labels
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "right";
    ctx.fillText("Acid", sx - 14, sy + 10);
    ctx.fillText("Neutral", sx - 14, sy + sh / 2 + 4);
    ctx.fillText("Base", sx - 14, sy + sh - 2);

    // Info panel
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${substance.name} — pH ${substance.pH}`, w * 0.4, h * 0.92);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(getIndicatorLabel(substance.pH, selectedIndicator), w * 0.4, h * 0.96);

    if (isPlaying) timeRef.current += 0.016;
    animRef.current = requestAnimationFrame(draw);
  }, [substance, liquidColor, selectedIndicator, showMolecular, isPlaying, volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = Math.min(parent.clientWidth * 0.65, 500);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  const handleReset = () => {
    setSelectedSubstance(6);
    setVolume([50]);
    bubblesRef.current = [];
    timeRef.current = 0;
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Substance</h3>
          <Select
            value={selectedSubstance.toString()}
            onValueChange={(v) => setSelectedSubstance(parseInt(v))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {substances.map((s, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {s.name} (pH {s.pH})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Label className="text-sm">Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {indicators.map((ind) => (
                  <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Volume</span>
              <span className="font-mono">{volume[0]}%</span>
            </div>
            <Slider value={volume} onValueChange={setVolume} min={10} max={100} step={5} />
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Controls</h3>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={isPlaying ? "default" : "outline"} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Play</>}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" variant={showMolecular ? "default" : "outline"} onClick={() => setShowMolecular(!showMolecular)}>
              {showMolecular ? <><EyeOff className="w-4 h-4 mr-1" /> Hide Ions</> : <><Eye className="w-4 h-4 mr-1" /> Show Ions</>}
            </Button>
          </div>

          {/* Info readout */}
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span>Nature:</span>
              <Badge variant={substance.type === "acid" ? "destructive" : substance.type === "base" ? "default" : "secondary"}>
                {substance.type === "acid" ? "Acidic" : substance.type === "base" ? "Basic" : "Neutral"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>pH:</span>
              <span className="font-mono font-bold">{substance.pH}</span>
            </div>
            <div className="flex justify-between">
              <span>[H⁺]:</span>
              <span className="font-mono">{Math.pow(10, -substance.pH).toExponential(2)} M</span>
            </div>
            <div className="flex justify-between">
              <span>[OH⁻]:</span>
              <span className="font-mono">{Math.pow(10, -(14 - substance.pH)).toExponential(2)} M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
