import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Flame, Filter } from "lucide-react";

const plants = [
  { name: "Red Cabbage", emoji: "🥬", pigment: "Anthocyanin" },
  { name: "Turmeric", emoji: "🟡", pigment: "Curcumin" },
  { name: "Hibiscus Petals", emoji: "🌺", pigment: "Anthocyanin" },
  { name: "Beetroot", emoji: "🫐", pigment: "Betalain" },
];

const testSolutions = [
  { name: "Strong Acid (pH 1)", pH: 1 },
  { name: "Lemon Juice (pH 2.5)", pH: 2.5 },
  { name: "Vinegar (pH 3)", pH: 3 },
  { name: "Coffee (pH 5)", pH: 5 },
  { name: "Pure Water (pH 7)", pH: 7 },
  { name: "Baking Soda (pH 8.5)", pH: 8.5 },
  { name: "Soap (pH 10)", pH: 10 },
  { name: "Strong Base (pH 14)", pH: 14 },
];

const getExtractColor = (plant: number, pH: number): string => {
  switch (plant) {
    case 0: // Red Cabbage
      if (pH <= 2) return "#ff0044";
      if (pH <= 4) return "#cc0066";
      if (pH <= 6) return "#9933cc";
      if (pH <= 7) return "#6644aa";
      if (pH <= 8) return "#3366cc";
      if (pH <= 10) return "#009966";
      return "#cccc00";
    case 1: // Turmeric
      return pH > 8.5 ? "#8B2500" : "#FFD700";
    case 2: // Hibiscus
      if (pH <= 3) return "#ff1744";
      if (pH <= 6) return "#e91e63";
      if (pH <= 8) return "#9c27b0";
      return "#2e7d32";
    case 3: // Beetroot
      if (pH <= 4) return "#d50000";
      if (pH <= 7) return "#ad1457";
      return "#f9a825";
    default: return "#fff";
  }
};

export function PlantExtractSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const steamRef = useRef<{ x: number; y: number; vy: number; opacity: number }[]>([]);

  const [selectedPlant, setSelectedPlant] = useState(0);
  const [selectedSolution, setSelectedSolution] = useState(4); // Pure Water
  const [temperature, setTemperature] = useState([25]);
  const [isHeating, setIsHeating] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [extractReady, setExtractReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const plant = plants[selectedPlant];
  const solution = testSolutions[selectedSolution];
  const extractColor = getExtractColor(selectedPlant, solution.pH);

  // Auto-heat
  useEffect(() => {
    if (!isHeating || !isPlaying) return;
    const interval = setInterval(() => {
      setTemperature((prev) => {
        const next = Math.min(prev[0] + 1, 100);
        if (next >= 80) setExtractReady(true);
        return [next];
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isHeating, isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "hsl(240, 10%, 8%)";
    ctx.fillRect(0, 0, w, h);

    // Lab bench
    ctx.fillStyle = "hsl(30, 20%, 25%)";
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    // Heating plate
    if (isHeating) {
      ctx.fillStyle = `rgba(255, ${Math.max(0, 100 - temperature[0])}, 0, ${0.3 + temperature[0] / 200})`;
      ctx.fillRect(w * 0.12, h * 0.74, w * 0.35, h * 0.06);
    }

    // Boiling beaker (left)
    const bx = w * 0.15, by = h * 0.2, bw = w * 0.3, bh = h * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Water + plant material
    const rawColor = extractReady ? getExtractColor(selectedPlant, 7) + "88" : "#88ccff44";
    ctx.fillStyle = rawColor;
    ctx.fillRect(bx + 2, by + bh * 0.3, bw - 4, bh * 0.68);

    // Plant pieces floating
    ctx.font = `${Math.min(20, w * 0.04)}px sans-serif`;
    ctx.textAlign = "center";
    for (let i = 0; i < 4; i++) {
      const px = bx + bw * 0.2 + (i % 2) * bw * 0.5;
      const py = by + bh * 0.45 + (i > 1 ? bh * 0.2 : 0) + (isPlaying ? Math.sin(Date.now() / 500 + i) * 3 : 0);
      ctx.fillText(plant.emoji, px, py);
    }

    // Steam when heating
    if (temperature[0] > 60 && isPlaying) {
      if (Math.random() < 0.15) {
        steamRef.current.push({
          x: bx + bw * 0.2 + Math.random() * bw * 0.6,
          y: by + bh * 0.25,
          vy: 0.5 + Math.random() * 1,
          opacity: 0.5,
        });
      }
    }
    steamRef.current = steamRef.current.filter((s) => {
      if (isPlaying) { s.y -= s.vy; s.opacity -= 0.008; }
      if (s.opacity <= 0) return false;
      ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,200,${s.opacity})`; ctx.fill();
      return true;
    });

    // Arrow → filter → test beaker
    if (extractReady) {
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(bx + bw + 10, h * 0.5); ctx.lineTo(w * 0.52, h * 0.5); ctx.stroke();
      ctx.setLineDash([]);

      // Filter funnel
      if (isFiltered) {
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.52, h * 0.35); ctx.lineTo(w * 0.56, h * 0.5); ctx.lineTo(w * 0.48, h * 0.5); ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fill();
      }

      // Test beaker (right)
      const tx = w * 0.6, ty = h * 0.25, tw = w * 0.25, th = h * 0.45;
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th); ctx.lineTo(tx + tw, ty + th); ctx.lineTo(tx + tw, ty);
      ctx.stroke();

      // Extract + solution color
      if (isFiltered) {
        ctx.fillStyle = extractColor + "aa";
        ctx.fillRect(tx + 2, ty + th * 0.3, tw - 4, th * 0.68);

        // Color chart below
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(tx, ty + th + 8, tw, 35);
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`${plant.name} in ${solution.name}`, tx + tw / 2, ty + th + 22);
        ctx.fillStyle = extractColor;
        ctx.fillRect(tx + 5, ty + th + 28, tw - 10, 10);
      }
    }

    // Temperature display
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`${plant.name} Extract — ${temperature[0]}°C`, w * 0.3, h * 0.92);
    if (extractReady) {
      ctx.fillStyle = "rgba(100,255,100,0.7)"; ctx.font = "11px sans-serif";
      ctx.fillText("Extract ready! Filter and test →", w * 0.3, h * 0.96);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [selectedPlant, selectedSolution, temperature, isHeating, isFiltered, extractReady, isPlaying, plant, solution, extractColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = Math.min(parent.clientWidth * 0.65, 500); }
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const handleReset = () => {
    setTemperature([25]);
    setIsHeating(false);
    setIsFiltered(false);
    setExtractReady(false);
    steamRef.current = [];
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Plant Material</h3>
          <Select value={selectedPlant.toString()} onValueChange={(v) => { setSelectedPlant(parseInt(v)); handleReset(); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {plants.map((p, i) => <SelectItem key={i} value={i.toString()}>{p.emoji} {p.name} ({p.pigment})</SelectItem>)}
            </SelectContent>
          </Select>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Temperature</span>
              <span className="font-mono">{temperature[0]}°C</span>
            </div>
            <Slider value={temperature} onValueChange={setTemperature} min={25} max={100} step={1} />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant={isHeating ? "destructive" : "outline"} onClick={() => setIsHeating(!isHeating)} className="gap-1 flex-1">
              <Flame className="w-4 h-4" /> {isHeating ? "Stop Heating" : "Heat"}
            </Button>
            <Button size="sm" variant="outline" disabled={!extractReady} onClick={() => setIsFiltered(true)} className="gap-1 flex-1">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Test Solution</h3>
          <Select value={selectedSolution.toString()} onValueChange={(v) => setSelectedSolution(parseInt(v))} disabled={!isFiltered}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {testSolutions.map((s, i) => <SelectItem key={i} value={i.toString()}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {isFiltered && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span>Indicator:</span><span className="font-medium">{plant.name}</span></div>
              <div className="flex justify-between"><span>Pigment:</span><span className="font-mono">{plant.pigment}</span></div>
              <div className="flex justify-between"><span>Solution pH:</span><span className="font-mono">{solution.pH}</span></div>
              <div className="flex justify-between items-center">
                <span>Result:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: extractColor }} />
                  <Badge variant={solution.pH < 7 ? "destructive" : solution.pH > 7 ? "default" : "secondary"}>
                    {solution.pH < 7 ? "Acidic" : solution.pH > 7 ? "Basic" : "Neutral"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Color spectrum */}
          {isFiltered && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{plant.name} pH Color Spectrum</p>
              <div className="flex h-6 rounded overflow-hidden">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: getExtractColor(selectedPlant, i + 1) }} title={`pH ${i + 1}`} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>pH 1</span><span>pH 7</span><span>pH 14</span>
              </div>
            </div>
          )}

          <Button size="sm" variant="outline" onClick={handleReset} className="w-full">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset Experiment
          </Button>
        </div>
      </div>
    </div>
  );
}
