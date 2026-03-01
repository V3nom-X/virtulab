import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Thermometer, Droplets } from "lucide-react";

interface SweatDrop {
  x: number;
  y: number;
  vy: number;
  opacity: number;
  size: number;
}

export function SkinSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dropsRef = useRef<SweatDrop[]>([]);

  const [temperature, setTemperature] = useState([37]);
  const [showMolecular, setShowMolecular] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const temp = temperature[0];
  const sweatRate = Math.max(0, (temp - 36) / 6); // 0 at 36°C, 1 at 42°C

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "hsl(30, 15%, 12%)";
    ctx.fillRect(0, 0, w, h);

    const layerH = h / 3.5;
    const startY = h * 0.08;

    // --- Epidermis ---
    const epiY = startY;
    const epiGrad = ctx.createLinearGradient(0, epiY, 0, epiY + layerH * 0.6);
    epiGrad.addColorStop(0, selectedLayer === "epidermis" ? "#e8c89e" : "#d4a574");
    epiGrad.addColorStop(1, selectedLayer === "epidermis" ? "#dbb890" : "#c4956a");
    ctx.fillStyle = epiGrad;
    ctx.fillRect(0, epiY, w, layerH * 0.6);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("EPIDERMIS", 10, epiY + 20);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Protective outer layer • No blood vessels", 10, epiY + 34);

    // --- Dermis ---
    const derY = epiY + layerH * 0.6;
    const derGrad = ctx.createLinearGradient(0, derY, 0, derY + layerH * 1.2);
    derGrad.addColorStop(0, selectedLayer === "dermis" ? "#e8a0a0" : "#cc8888");
    derGrad.addColorStop(1, selectedLayer === "dermis" ? "#d08080" : "#bb7070");
    ctx.fillStyle = derGrad;
    ctx.fillRect(0, derY, w, layerH * 1.2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("DERMIS", 10, derY + 20);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Sweat glands • Blood vessels • Nerve endings", 10, derY + 34);

    // Sweat glands (coiled tubes)
    const glandPositions = [w * 0.2, w * 0.5, w * 0.8];
    glandPositions.forEach((gx) => {
      // Coiled gland body
      ctx.strokeStyle = "rgba(100, 180, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const angle = i * 0.6;
        const r = 4 + i * 0.3;
        ctx.lineTo(gx + Math.cos(angle) * r, derY + layerH * 0.7 + Math.sin(angle) * r);
      }
      ctx.stroke();

      // Sweat duct going up
      ctx.strokeStyle = "rgba(100, 180, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, derY + layerH * 0.5);
      ctx.lineTo(gx + 2, derY);
      ctx.lineTo(gx - 1, epiY + 10);
      ctx.lineTo(gx + 1, epiY);
      ctx.stroke();

      // Sweat droplet on surface if sweating
      if (sweatRate > 0.1) {
        ctx.fillStyle = `rgba(100, 200, 255, ${sweatRate * 0.6})`;
        ctx.beginPath();
        ctx.arc(gx, epiY - 3, 3 + sweatRate * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Blood vessels in dermis (vasodilation based on temp)
    const vesselWidth = 1.5 + sweatRate * 3;
    ctx.strokeStyle = `rgba(255, 60, 60, ${0.4 + sweatRate * 0.4})`;
    ctx.lineWidth = vesselWidth;
    ctx.beginPath();
    ctx.moveTo(0, derY + layerH * 0.3);
    for (let x = 0; x < w; x += 20) {
      ctx.lineTo(x + 10, derY + layerH * 0.3 + Math.sin(x * 0.05) * 8);
    }
    ctx.stroke();

    // Hair follicles
    [w * 0.15, w * 0.4, w * 0.65, w * 0.85].forEach((hx) => {
      ctx.strokeStyle = "rgba(80, 60, 40, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, epiY - 15);
      ctx.lineTo(hx + 1, derY + layerH * 0.4);
      ctx.stroke();
    });

    // --- Hypodermis ---
    const hypY = derY + layerH * 1.2;
    const hypGrad = ctx.createLinearGradient(0, hypY, 0, h);
    hypGrad.addColorStop(0, selectedLayer === "hypodermis" ? "#ffe0a0" : "#e8c880");
    hypGrad.addColorStop(1, selectedLayer === "hypodermis" ? "#eec870" : "#d4b060");
    ctx.fillStyle = hypGrad;
    ctx.fillRect(0, hypY, w, h - hypY);
    ctx.fillStyle = "#333";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("HYPODERMIS", 10, hypY + 20);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText("Subcutaneous fat • Insulation", 10, hypY + 34);

    // Fat cells
    for (let fx = 20; fx < w - 20; fx += 30) {
      for (let fy = hypY + 45; fy < h - 10; fy += 25) {
        ctx.fillStyle = "rgba(240, 210, 100, 0.3)";
        ctx.beginPath();
        ctx.ellipse(fx + Math.random() * 5, fy, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 170, 60, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Animated sweat drops
    if (sweatRate > 0.1 && Math.random() < sweatRate * 0.3) {
      const gx = glandPositions[Math.floor(Math.random() * 3)];
      dropsRef.current.push({ x: gx + (Math.random() - 0.5) * 6, y: epiY - 5, vy: -0.5 - Math.random(), opacity: 0.8, size: 2 + Math.random() * 2 });
    }
    dropsRef.current = dropsRef.current.filter((d) => {
      d.y += d.vy;
      d.opacity -= 0.015;
      ctx.fillStyle = `rgba(100, 200, 255, ${d.opacity})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      return d.opacity > 0;
    });

    // Molecular view overlay
    if (showMolecular && sweatRate > 0.1) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(w * 0.6, h * 0.05, w * 0.37, h * 0.25);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.strokeRect(w * 0.6, h * 0.05, w * 0.37, h * 0.25);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sweat Composition", w * 0.785, h * 0.05 + 15);
      ctx.font = "9px sans-serif";
      ctx.textAlign = "left";
      const mx = w * 0.63;
      // Water
      ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
      ctx.beginPath(); ctx.arc(mx, h * 0.05 + 35, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("H₂O (99%)", mx + 12, h * 0.05 + 38);
      // NaCl
      ctx.fillStyle = "rgba(255, 200, 50, 0.8)";
      ctx.beginPath(); ctx.arc(mx, h * 0.05 + 52, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("NaCl (salts)", mx + 12, h * 0.05 + 55);
      // Urea
      ctx.fillStyle = "rgba(200, 100, 255, 0.8)";
      ctx.beginPath(); ctx.arc(mx, h * 0.05 + 67, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("Urea (trace)", mx + 12, h * 0.05 + 70);
    }

    // Temperature indicator
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${temp.toFixed(1)}°C`, w - 10, 20);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = temp > 38 ? "rgba(255,100,100,0.8)" : "rgba(255,255,255,0.5)";
    ctx.fillText(temp > 38 ? "Sweating Active" : "Normal", w - 10, 34);

    animRef.current = requestAnimationFrame(draw);
  }, [temp, showMolecular, selectedLayer, sweatRate]);

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
          <h3 className="font-semibold text-sm">Environmental Controls</h3>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <Label className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> Body Temperature</Label>
              <span className="font-mono">{temp.toFixed(1)}°C</span>
            </div>
            <Slider value={temperature} onValueChange={setTemperature} min={35} max={42} step={0.5} />
            <p className="text-xs text-muted-foreground mt-1">Normal: 36.5-37.5°C • Raise to trigger sweating</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={showMolecular ? "default" : "outline"} onClick={() => setShowMolecular(!showMolecular)}>
              {showMolecular ? <><EyeOff className="w-4 h-4 mr-1" /> Hide Molecular</> : <><Eye className="w-4 h-4 mr-1" /> Molecular View</>}
            </Button>
          </div>
        </div>
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">Explore Layers</h3>
          {["epidermis", "dermis", "hypodermis"].map((layer) => (
            <button
              key={layer}
              onClick={() => setSelectedLayer(selectedLayer === layer ? null : layer)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedLayer === layer ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
            >
              <span className="font-medium capitalize">{layer}</span>
              <p className="text-xs text-muted-foreground">
                {layer === "epidermis" && "Outer protective layer"}
                {layer === "dermis" && "Contains sweat glands & blood vessels"}
                {layer === "hypodermis" && "Fat layer for insulation"}
              </p>
            </button>
          ))}
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Sweat Rate:</span><Badge variant={sweatRate > 0.5 ? "destructive" : "secondary"}>{sweatRate > 0.1 ? `${(sweatRate * 100).toFixed(0)}%` : "Minimal"}</Badge></div>
            <div className="flex justify-between"><span>Blood Vessels:</span><span className="text-xs">{temp > 37.5 ? "Dilated (vasodilation)" : "Normal"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
