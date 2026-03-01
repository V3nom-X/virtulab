import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RotateCcw, Zap, Droplets, Flame } from "lucide-react";

const substances = [
  { name: "Hydrochloric Acid", pH: 1, type: "acid" as const, conductivity: 95, taste: "Sour", feel: "Watery", reactsWithMetal: true },
  { name: "Vinegar", pH: 3, type: "acid" as const, conductivity: 40, taste: "Sour", feel: "Watery", reactsWithMetal: true },
  { name: "Pure Water", pH: 7, type: "neutral" as const, conductivity: 2, taste: "Tasteless", feel: "Normal", reactsWithMetal: false },
  { name: "Soap Solution", pH: 10, type: "base" as const, conductivity: 55, taste: "Bitter", feel: "Slippery", reactsWithMetal: false },
  { name: "Sodium Hydroxide", pH: 14, type: "base" as const, conductivity: 98, taste: "Bitter", feel: "Slippery", reactsWithMetal: true },
];

export function PhysicalPropertiesSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bubblesRef = useRef<{ x: number; y: number; vy: number; r: number; opacity: number }[]>([]);
  const sparkRef = useRef<{ x: number; y: number; life: number }[]>([]);

  const [selectedSubstance, setSelectedSubstance] = useState(0);
  const [activeTest, setActiveTest] = useState<"conductivity" | "metal" | "texture" | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const substance = substances[selectedSubstance];

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

    // Beaker
    const bx = w * 0.2, by = h * 0.15, bw = w * 0.35, bh = h * 0.55;
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Liquid
    const liquidH = bh * 0.7;
    const liquidY = by + bh - liquidH;
    const liqColor = substance.type === "acid" ? "#ff666688" : substance.type === "base" ? "#6688ff88" : "#88ccff44";
    ctx.fillStyle = liqColor;
    ctx.fillRect(bx + 2, liquidY, bw - 4, liquidH - 2);

    // Conductivity test
    if (activeTest === "conductivity") {
      // Electrodes
      ctx.fillStyle = "#888"; ctx.fillRect(bx + bw * 0.3, by - 20, 6, liquidY - by + 40);
      ctx.fillRect(bx + bw * 0.65, by - 20, 6, liquidY - by + 40);
      ctx.fillStyle = "#ccc"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("−", bx + bw * 0.33, by - 25); ctx.fillText("+", bx + bw * 0.68, by - 25);

      // Wire and bulb
      const bulbX = bx + bw * 0.48, bulbY = by - 50;
      ctx.strokeStyle = "#666"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.33, by - 20); ctx.lineTo(bulbX - 15, bulbY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.68, by - 20); ctx.lineTo(bulbX + 15, bulbY); ctx.stroke();

      // Bulb glow based on conductivity
      const brightness = substance.conductivity / 100;
      if (brightness > 0.1 && isPlaying) {
        ctx.beginPath(); ctx.arc(bulbX, bulbY, 18, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 100, ${brightness * 0.4})`; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(bulbX, bulbY, 12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, ${Math.round(100 + brightness * 155)}, ${0.3 + brightness * 0.7})`; ctx.fill();
      ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1; ctx.stroke();

      // Spark particles for strong conductors
      if (substance.conductivity > 70 && isPlaying && Math.random() < 0.3) {
        sparkRef.current.push({ x: bulbX + (Math.random() - 0.5) * 20, y: bulbY + (Math.random() - 0.5) * 20, life: 1 });
      }
      sparkRef.current = sparkRef.current.filter((s) => {
        s.life -= 0.05;
        if (s.life <= 0) return false;
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 150, ${s.life})`; ctx.fill();
        return true;
      });

      // Conductivity label
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`Conductivity: ${substance.conductivity}%`, bx + bw / 2, h * 0.82);
    }

    // Metal reaction test
    if (activeTest === "metal") {
      // Zinc piece
      ctx.fillStyle = "#aaa";
      ctx.fillRect(bx + bw * 0.4, liquidY + 20, 20, 15);
      ctx.fillStyle = "#ccc"; ctx.font = "8px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Zn", bx + bw * 0.4 + 10, liquidY + 30);

      if (substance.reactsWithMetal && isPlaying) {
        // Bubbles (H₂ gas)
        if (Math.random() < 0.2) {
          bubblesRef.current.push({
            x: bx + bw * 0.4 + Math.random() * 20, y: liquidY + 20,
            vy: 0.5 + Math.random() * 1.5, r: 2 + Math.random() * 3, opacity: 0.8,
          });
        }
      }

      bubblesRef.current = bubblesRef.current.filter((b) => {
        if (isPlaying) { b.y -= b.vy; b.opacity -= 0.008; }
        if (b.y < liquidY || b.opacity <= 0) return false;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${b.opacity})`; ctx.lineWidth = 1; ctx.stroke();
        return true;
      });

      ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(substance.reactsWithMetal ? "H₂ gas produced! ↑" : "No reaction", bx + bw / 2, h * 0.82);
    }

    // Texture test
    if (activeTest === "texture") {
      // Hand silhouette
      ctx.fillStyle = "#d4a574"; ctx.strokeStyle = "#c4956a"; ctx.lineWidth = 2;
      const hx = bx + bw * 0.4, hy = liquidY + 10;
      ctx.beginPath();
      ctx.ellipse(hx, hy + 15, 15, 20, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Fingers
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(hx + i * 8, hy - 5, 4, 12, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }

      // Slippery effect for bases
      if (substance.type === "base" && isPlaying) {
        ctx.fillStyle = "rgba(150, 200, 255, 0.15)";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(hx + (Math.random() - 0.5) * 30, hy + 10 + Math.random() * 20, 8, 3, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`Feel: ${substance.feel}`, bx + bw / 2, h * 0.82);
    }

    // Properties panel on right
    const px = w * 0.62, py = h * 0.1;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(px, py, w * 0.35, h * 0.7);
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.strokeRect(px, py, w * 0.35, h * 0.7);

    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(substance.name, px + 12, py + 25);

    const props = [
      ["Type", substance.type === "acid" ? "Acidic" : substance.type === "base" ? "Basic" : "Neutral"],
      ["pH", substance.pH.toString()],
      ["Taste", substance.taste],
      ["Feel", substance.feel],
      ["Conductivity", `${substance.conductivity}%`],
      ["Reacts with Metal", substance.reactsWithMetal ? "Yes (H₂↑)" : "No"],
    ];
    ctx.font = "11px sans-serif";
    props.forEach(([label, val], i) => {
      const y = py + 50 + i * 22;
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText(label + ":", px + 12, y);
      ctx.fillStyle = "#fff"; ctx.fillText(val, px + 120, y);
    });

    // Info
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(substance.name, w * 0.4, h * 0.92);

    animRef.current = requestAnimationFrame(draw);
  }, [substance, activeTest, isPlaying]);

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

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Select Substance</h3>
          <Select value={selectedSubstance.toString()} onValueChange={(v) => { setSelectedSubstance(parseInt(v)); setActiveTest(null); bubblesRef.current = []; }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {substances.map((s, i) => <SelectItem key={i} value={i.toString()}>{s.name} (pH {s.pH})</SelectItem>)}
            </SelectContent>
          </Select>
          <div>
            <Label className="text-sm mb-2 block">Choose Test</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={activeTest === "conductivity" ? "default" : "outline"} onClick={() => setActiveTest("conductivity")} className="gap-1">
                <Zap className="w-4 h-4" /> Conductivity
              </Button>
              <Button size="sm" variant={activeTest === "metal" ? "default" : "outline"} onClick={() => { setActiveTest("metal"); bubblesRef.current = []; }} className="gap-1">
                <Flame className="w-4 h-4" /> Metal Reaction
              </Button>
              <Button size="sm" variant={activeTest === "texture" ? "default" : "outline"} onClick={() => setActiveTest("texture")} className="gap-1">
                <Droplets className="w-4 h-4" /> Texture
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Properties Comparison</h3>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Nature:</span>
              <Badge variant={substance.type === "acid" ? "destructive" : substance.type === "base" ? "default" : "secondary"}>
                {substance.type === "acid" ? "Acidic" : substance.type === "base" ? "Basic" : "Neutral"}
              </Badge>
            </div>
            <div className="flex justify-between"><span>Taste:</span><span className="font-mono">{substance.taste}</span></div>
            <div className="flex justify-between"><span>Conductivity:</span><span className="font-mono">{substance.conductivity}%</span></div>
            <div className="flex justify-between"><span>Feel:</span><span className="font-mono">{substance.feel}</span></div>
            <div className="flex justify-between"><span>Reacts with Zn:</span><span className="font-mono">{substance.reactsWithMetal ? "Yes ↑H₂" : "No"}</span></div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setActiveTest(null); setSelectedSubstance(0); }} className="w-full">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
