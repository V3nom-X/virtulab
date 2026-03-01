import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Droplets } from "lucide-react";

interface UrineDrop {
  x: number;
  y: number;
  progress: number; // 0-1 along path
  speed: number;
}

export function UrinarySystemSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dropsRef = useRef<UrineDrop[]>([]);

  const [hydration, setHydration] = useState([70]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [bladderFill, setBladderFill] = useState(0);

  const hydrationLevel = hydration[0];
  const urineRate = hydrationLevel / 100;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "hsl(220, 15%, 10%)";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;

    // --- Kidneys ---
    const kidneyY = h * 0.15;
    const kidneyW = w * 0.12, kidneyH = h * 0.18;

    // Left kidney
    const lkx = cx - w * 0.18;
    ctx.fillStyle = selectedOrgan === "kidney" ? "rgba(180, 60, 60, 0.9)" : "rgba(150, 50, 50, 0.8)";
    ctx.beginPath();
    ctx.ellipse(lkx, kidneyY + kidneyH / 2, kidneyW / 2, kidneyH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = selectedOrgan === "kidney" ? "#ff8888" : "rgba(200, 80, 80, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right kidney
    const rkx = cx + w * 0.18;
    ctx.fillStyle = selectedOrgan === "kidney" ? "rgba(180, 60, 60, 0.9)" : "rgba(150, 50, 50, 0.8)";
    ctx.beginPath();
    ctx.ellipse(rkx, kidneyY + kidneyH / 2, kidneyW / 2, kidneyH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = selectedOrgan === "kidney" ? "#ff8888" : "rgba(200, 80, 80, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Left Kidney", lkx, kidneyY - 8);
    ctx.fillText("Right Kidney", rkx, kidneyY - 8);

    // Renal arteries (red)
    ctx.strokeStyle = "rgba(255, 60, 60, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, kidneyY + kidneyH * 0.3);
    ctx.lineTo(lkx + kidneyW / 2, kidneyY + kidneyH * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, kidneyY + kidneyH * 0.3);
    ctx.lineTo(rkx - kidneyW / 2, kidneyY + kidneyH * 0.4);
    ctx.stroke();

    // Renal veins (blue)
    ctx.strokeStyle = "rgba(60, 100, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, kidneyY + kidneyH * 0.5);
    ctx.lineTo(lkx + kidneyW / 2, kidneyY + kidneyH * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, kidneyY + kidneyH * 0.5);
    ctx.lineTo(rkx - kidneyW / 2, kidneyY + kidneyH * 0.55);
    ctx.stroke();

    // Aorta & Vena Cava
    ctx.strokeStyle = "rgba(255, 40, 40, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 8, 0);
    ctx.lineTo(cx - 8, h * 0.6);
    ctx.stroke();
    ctx.strokeStyle = "rgba(40, 80, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(cx + 8, 0);
    ctx.lineTo(cx + 8, h * 0.6);
    ctx.stroke();

    // --- Ureters ---
    const ureterColor = selectedOrgan === "ureter" ? "rgba(255, 200, 100, 0.8)" : "rgba(200, 160, 80, 0.5)";
    ctx.strokeStyle = ureterColor;
    ctx.lineWidth = selectedOrgan === "ureter" ? 4 : 3;
    
    const bladderY = h * 0.65;
    // Left ureter
    ctx.beginPath();
    ctx.moveTo(lkx, kidneyY + kidneyH);
    ctx.quadraticCurveTo(lkx + 10, bladderY - 30, cx - 15, bladderY);
    ctx.stroke();
    // Right ureter
    ctx.beginPath();
    ctx.moveTo(rkx, kidneyY + kidneyH);
    ctx.quadraticCurveTo(rkx - 10, bladderY - 30, cx + 15, bladderY);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "9px sans-serif";
    ctx.fillText("Ureter", lkx + 20, (kidneyY + kidneyH + bladderY) / 2);
    ctx.fillText("Ureter", rkx - 20, (kidneyY + kidneyH + bladderY) / 2);

    // --- Bladder ---
    const bladderW = w * 0.12 + bladderFill * w * 0.04;
    const bladderH2 = h * 0.1 + bladderFill * h * 0.03;
    ctx.fillStyle = selectedOrgan === "bladder" ? "rgba(255, 180, 100, 0.7)" : `rgba(255, 200, 100, ${0.3 + bladderFill * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx, bladderY + bladderH2 / 2, bladderW / 2, bladderH2 / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = selectedOrgan === "bladder" ? "#ffaa44" : "rgba(220, 170, 80, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Bladder", cx, bladderY + bladderH2 + 15);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`${(bladderFill * 500).toFixed(0)} mL`, cx, bladderY + bladderH2 / 2 + 4);

    // --- Urethra ---
    const urethraEnd = h * 0.92;
    ctx.strokeStyle = selectedOrgan === "urethra" ? "rgba(255, 200, 100, 0.8)" : "rgba(200, 160, 80, 0.4)";
    ctx.lineWidth = selectedOrgan === "urethra" ? 4 : 3;
    ctx.beginPath();
    ctx.moveTo(cx, bladderY + bladderH2);
    ctx.lineTo(cx, urethraEnd);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "9px sans-serif";
    ctx.fillText("Urethra", cx + 20, (bladderY + bladderH2 + urethraEnd) / 2);

    // Animated urine flow
    if (isPlaying) {
      if (Math.random() < urineRate * 0.1) {
        const side = Math.random() > 0.5 ? lkx : rkx;
        dropsRef.current.push({ x: side, y: kidneyY + kidneyH, progress: 0, speed: 0.005 + Math.random() * 0.005 });
      }
      setBladderFill((prev) => Math.min(prev + urineRate * 0.0003, 1));
    }

    dropsRef.current = dropsRef.current.filter((d) => {
      d.progress += d.speed;
      if (d.progress > 1) return false;
      const py = d.y + (bladderY - d.y) * d.progress;
      const px = d.x + (cx - d.x) * d.progress;
      ctx.fillStyle = "rgba(255, 220, 100, 0.7)";
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    // Info panel
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(5, h - 35, w * 0.5, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Hydration: ${hydrationLevel}% | Daily filtrate: ~180L | Urine: ~${(urineRate * 2).toFixed(1)}L/day`, 10, h - 16);

    animRef.current = requestAnimationFrame(draw);
  }, [isPlaying, hydrationLevel, urineRate, selectedOrgan, bladderFill]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = Math.min(parent.clientWidth * 0.8, 550); }
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Controls</h3>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <Label className="flex items-center gap-1"><Droplets className="w-4 h-4" /> Hydration Level</Label>
              <span className="font-mono">{hydrationLevel}%</span>
            </div>
            <Slider value={hydration} onValueChange={setHydration} min={10} max={100} step={5} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={isPlaying ? "default" : "outline"} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Play</>}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setBladderFill(0); dropsRef.current = []; }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Explore Organs</h3>
          {[
            { id: "kidney", label: "Kidneys", desc: "Filter blood, produce urine" },
            { id: "ureter", label: "Ureters", desc: "Transport urine to bladder" },
            { id: "bladder", label: "Bladder", desc: "Stores urine (~500 mL)" },
            { id: "urethra", label: "Urethra", desc: "Expels urine from body" },
          ].map((organ) => (
            <button
              key={organ.id}
              onClick={() => setSelectedOrgan(selectedOrgan === organ.id ? null : organ.id)}
              className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${selectedOrgan === organ.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
            >
              <span className="font-medium">{organ.label}</span>
              <p className="text-xs text-muted-foreground">{organ.desc}</p>
            </button>
          ))}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between"><span>Bladder Fill:</span><Badge variant={bladderFill > 0.8 ? "destructive" : "secondary"}>{(bladderFill * 100).toFixed(0)}%</Badge></div>
          </div>
        </div>
      </div>
    </div>
  );
}
