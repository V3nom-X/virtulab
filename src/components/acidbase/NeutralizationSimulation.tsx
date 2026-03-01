import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Eye, EyeOff, Droplets } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const acids = [
  { name: "Hydrochloric Acid (HCl)", pH: 1, color: "#ff4444" },
  { name: "Vinegar (CH₃COOH)", pH: 3, color: "#ff8844" },
  { name: "Lemon Juice", pH: 2.5, color: "#ffaa00" },
];

const bases = [
  { name: "Sodium Hydroxide (NaOH)", pH: 14, color: "#4466ff" },
  { name: "Ammonia (NH₃)", pH: 11, color: "#66aaff" },
  { name: "Baking Soda (NaHCO₃)", pH: 8.5, color: "#88ccff" },
];

const getpHColor = (pH: number): string => {
  if (pH <= 2) return "#ff0000";
  if (pH <= 4) return "#ff6600";
  if (pH <= 6) return "#ffcc00";
  if (pH <= 7.5) return "#66cc00";
  if (pH <= 9) return "#00cc66";
  if (pH <= 11) return "#0066cc";
  if (pH <= 13) return "#3300cc";
  return "#6600cc";
};

export function NeutralizationSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; type: "H+" | "OH-" | "H2O"; opacity: number; age: number }[]>([]);

  const [selectedAcid, setSelectedAcid] = useState(0);
  const [selectedBase, setSelectedBase] = useState(0);
  const [acidVolume, setAcidVolume] = useState([50]);
  const [baseAdded, setBaseAdded] = useState([0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMolecular, setShowMolecular] = useState(true);
  const [isPouring, setIsPouring] = useState(false);
  const [titrationData, setTitrationData] = useState<{ volume: number; pH: number }[]>([]);

  const acid = acids[selectedAcid];
  const base = bases[selectedBase];

  // Calculate resulting pH based on mixing ratio
  const mixRatio = baseAdded[0] / 100;
  const resultingpH = acid.pH + (base.pH - acid.pH) * mixRatio;
  const liquidColor = getpHColor(resultingpH);

  // Initialize particles
  useEffect(() => {
    const ions: typeof particlesRef.current = [];
    const hCount = Math.round((1 - mixRatio) * 20);
    const ohCount = Math.round(mixRatio * 20);
    const waterCount = Math.round(Math.min(mixRatio, 1 - mixRatio) * 15);

    for (let i = 0; i < hCount; i++) {
      ions.push({ x: 80 + Math.random() * 280, y: 180 + Math.random() * 180, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: "H+", opacity: 0.9, age: 0 });
    }
    for (let i = 0; i < ohCount; i++) {
      ions.push({ x: 80 + Math.random() * 280, y: 180 + Math.random() * 180, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, type: "OH-", opacity: 0.9, age: 0 });
    }
    for (let i = 0; i < waterCount; i++) {
      ions.push({ x: 80 + Math.random() * 280, y: 180 + Math.random() * 180, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, type: "H2O", opacity: 0.6, age: 0 });
    }
    particlesRef.current = ions;
  }, [mixRatio]);

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
    ctx.fillRect(0, h * 0.88, w, h * 0.12);

    // Main beaker (acid)
    const bx = w * 0.15, by = h * 0.2, bw = w * 0.4, bh = h * 0.55;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Liquid
    const fillH = bh * 0.7;
    const liquidY = by + bh - fillH;
    const grad = ctx.createLinearGradient(bx, liquidY, bx, by + bh);
    grad.addColorStop(0, liquidColor);
    grad.addColorStop(1, liquidColor + "99");
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 2, liquidY, bw - 4, fillH - 2);

    // Surface shimmer
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(bx + 2, liquidY, bw - 4, 3);

    // Base flask (tilted when pouring)
    const fx = w * 0.6, fy = h * 0.05;
    ctx.save();
    if (isPouring) {
      ctx.translate(fx + 40, fy + 20);
      ctx.rotate(0.4);
      ctx.translate(-(fx + 40), -(fy + 20));
    }
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 20); ctx.lineTo(fx, fy + 80); ctx.lineTo(fx + 50, fy + 80); ctx.lineTo(fx + 50, fy + 20);
    ctx.lineTo(fx + 35, fy); ctx.lineTo(fx + 15, fy); ctx.closePath();
    ctx.stroke();
    // Flask liquid
    const flaskFill = (1 - mixRatio) * 50;
    ctx.fillStyle = base.color + "88";
    ctx.fillRect(fx + 1, fy + 80 - flaskFill, 48, flaskFill);
    ctx.restore();

    // Pouring stream
    if (isPouring && mixRatio < 1) {
      ctx.strokeStyle = base.color + "aa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx + 15, fy + 10);
      ctx.quadraticCurveTo(bx + bw * 0.7, by - 20, bx + bw * 0.6, liquidY);
      ctx.stroke();
    }

    // Molecular view
    if (showMolecular) {
      particlesRef.current.forEach((p) => {
        if (isPlaying) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < bx + 10 || p.x > bx + bw - 10) p.vx *= -1;
          if (p.y < liquidY + 5 || p.y > by + bh - 10) p.vy *= -1;
          p.x = Math.max(bx + 10, Math.min(bx + bw - 10, p.x));
          p.y = Math.max(liquidY + 5, Math.min(by + bh - 10, p.y));
        }
        const r = p.type === "H+" ? 6 : p.type === "OH-" ? 8 : 7;
        const fill = p.type === "H+" ? "rgba(255,80,80,0.8)" : p.type === "OH-" ? "rgba(80,140,255,0.8)" : "rgba(100,200,220,0.6)";
        const stroke = p.type === "H+" ? "#ff3333" : p.type === "OH-" ? "#3366ff" : "#44bbcc";
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.type, p.x, p.y);
      });

      // Legend
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(bx, by + bh + 6, bw, 24);
      ctx.font = "10px sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,80,80,0.8)"; ctx.beginPath(); ctx.arc(bx + 10, by + bh + 18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("H⁺", bx + 18, by + bh + 21);
      ctx.fillStyle = "rgba(80,140,255,0.8)"; ctx.beginPath(); ctx.arc(bx + 50, by + bh + 18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("OH⁻", bx + 58, by + bh + 21);
      ctx.fillStyle = "rgba(100,200,220,0.6)"; ctx.beginPath(); ctx.arc(bx + 100, by + bh + 18, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("H₂O", bx + 108, by + bh + 21);
    }

    // pH scale (right side)
    const sx = w * 0.72, sy = h * 0.08, sw = w * 0.05, sh = h * 0.72;
    const scaleGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    ["#ff0000", "#ff6600", "#ffcc00", "#66cc00", "#00cc66", "#0066cc", "#3300cc", "#6600cc"].forEach((c, i, a) =>
      scaleGrad.addColorStop(i / (a.length - 1), c)
    );
    ctx.fillStyle = scaleGrad; ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1; ctx.strokeRect(sx, sy, sw, sh);

    // pH marker
    const markerY = sy + (resultingpH / 14) * sh;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(sx - 8, markerY); ctx.lineTo(sx, markerY - 5); ctx.lineTo(sx, markerY + 5); ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "9px sans-serif"; ctx.textAlign = "right";
    ctx.fillText("Acid", sx - 10, sy + 10);
    ctx.fillText("Neutral", sx - 10, sy + sh / 2 + 4);
    ctx.fillText("Base", sx - 10, sy + sh - 2);

    // Info
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`Resulting pH: ${resultingpH.toFixed(1)}`, w * 0.4, h * 0.92);
    ctx.font = "11px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    const nature = resultingpH < 6.5 ? "Acidic" : resultingpH > 7.5 ? "Basic" : "≈ Neutral (Neutralized!)";
    ctx.fillText(`${acid.name} + ${base.name} → ${nature}`, w * 0.4, h * 0.96);

    animRef.current = requestAnimationFrame(draw);
  }, [acid, base, liquidColor, resultingpH, showMolecular, isPlaying, isPouring, mixRatio]);

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
    setBaseAdded([0]);
    setIsPouring(false);
    setTitrationData([]);
    particlesRef.current = [];
  };

  const handlePour = () => {
    setIsPouring(true);
    const interval = setInterval(() => {
      setBaseAdded((prev) => {
        const next = Math.min(prev[0] + 2, 100);
        const newpH = acid.pH + (base.pH - acid.pH) * (next / 100);
        setTitrationData((td) => [...td, { volume: next, pH: parseFloat(newpH.toFixed(2)) }]);
        if (next >= 100) { clearInterval(interval); setIsPouring(false); }
        return [next];
      });
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Reactants</h3>
          <div>
            <Label className="text-sm">Acid</Label>
            <Select value={selectedAcid.toString()} onValueChange={(v) => { setSelectedAcid(parseInt(v)); handleReset(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {acids.map((a, i) => <SelectItem key={i} value={i.toString()}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Base</Label>
            <Select value={selectedBase.toString()} onValueChange={(v) => { setSelectedBase(parseInt(v)); handleReset(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {bases.map((b, i) => <SelectItem key={i} value={i.toString()}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Base Added</span>
              <span className="font-mono">{baseAdded[0]}%</span>
            </div>
            <Slider value={baseAdded} onValueChange={setBaseAdded} min={0} max={100} step={1} />
          </div>
          <Button size="sm" onClick={handlePour} disabled={isPouring || baseAdded[0] >= 100} className="w-full gap-2">
            <Droplets className="w-4 h-4" /> Pour Base Slowly
          </Button>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Controls & Results</h3>
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

          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Reaction:</span><span className="font-mono text-xs">Acid + Base → Salt + H₂O</span></div>
            <div className="flex justify-between"><span>Resulting pH:</span><span className="font-mono font-bold">{resultingpH.toFixed(1)}</span></div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant={resultingpH < 6.5 ? "destructive" : resultingpH > 7.5 ? "default" : "secondary"}>
                {resultingpH < 6.5 ? "Acidic" : resultingpH > 7.5 ? "Basic" : "Neutralized ✓"}
              </Badge>
            </div>
            <div className="flex justify-between"><span>[H⁺]:</span><span className="font-mono">{Math.pow(10, -resultingpH).toExponential(2)} M</span></div>
            <div className="flex justify-between"><span>[OH⁻]:</span><span className="font-mono">{Math.pow(10, -(14 - resultingpH)).toExponential(2)} M</span></div>
          </div>

          {Math.abs(resultingpH - 7) < 0.5 && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600 dark:text-green-400">
              🎉 <strong>Neutralization achieved!</strong> The acid and base have reacted to form salt and water.
            </div>
          )}
        </div>
      </div>

      {/* Titration Curve Graph */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold text-sm mb-3">Titration Curve: pH vs Volume of Base Added</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={titrationData.length > 0 ? titrationData : [{ volume: 0, pH: acid.pH }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="volume" tick={{ fontSize: 11 }} label={{ value: "Base Added (%)", position: "insideBottom", offset: -3, fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 14]} tick={{ fontSize: 11 }} label={{ value: "pH", angle: -90, position: "insideLeft", fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} labelFormatter={(v) => `Volume: ${v}%`} />
              <ReferenceLine y={7} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: "Neutral (pH 7)", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Line type="monotone" dataKey="pH" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Click "Pour Base Slowly" to plot the titration curve in real-time.</p>
      </div>
    </div>
  );
}
