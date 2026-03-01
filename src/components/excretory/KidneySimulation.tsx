import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Play, Pause, RotateCcw } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "water" | "glucose" | "urea" | "salt" | "protein";
  opacity: number;
  reabsorbed: boolean;
}

export function KidneySimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const [adh, setAdh] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMolecular, setShowMolecular] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [view, setView] = useState<"kidney" | "nephron">("kidney");

  const adhLevel = adh[0];
  const waterReabsorption = adhLevel / 100;

  // Initialize particles for nephron view
  useEffect(() => {
    if (view !== "nephron") return;
    const parts: Particle[] = [];
    for (let i = 0; i < 15; i++) parts.push({ x: 0, y: 0, vx: 1, vy: 0, type: "water", opacity: 0.8, reabsorbed: false });
    for (let i = 0; i < 5; i++) parts.push({ x: 0, y: 0, vx: 1, vy: 0, type: "glucose", opacity: 0.8, reabsorbed: false });
    for (let i = 0; i < 6; i++) parts.push({ x: 0, y: 0, vx: 1, vy: 0, type: "urea", opacity: 0.8, reabsorbed: false });
    for (let i = 0; i < 4; i++) parts.push({ x: 0, y: 0, vx: 1, vy: 0, type: "salt", opacity: 0.8, reabsorbed: false });
    for (let i = 0; i < 3; i++) parts.push({ x: 0, y: 0, vx: 1, vy: 0, type: "protein", opacity: 0.8, reabsorbed: false });
    particlesRef.current = parts;
  }, [view]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "hsl(220, 15%, 10%)";
    ctx.fillRect(0, 0, w, h);

    if (view === "kidney") {
      // Draw kidney cross-section
      const cx = w * 0.45, cy = h * 0.5;
      const kw = w * 0.35, kh = h * 0.7;

      // Kidney outline
      ctx.fillStyle = "rgba(150, 50, 50, 0.8)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, kw / 2, kh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 80, 80, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cortex (outer ring)
      ctx.fillStyle = selectedPart === "cortex" ? "rgba(200, 90, 90, 0.9)" : "rgba(180, 70, 70, 0.7)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, kw / 2 - 5, kh / 2 - 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Medulla (inner)
      ctx.fillStyle = selectedPart === "medulla" ? "rgba(160, 80, 80, 0.9)" : "rgba(130, 60, 60, 0.8)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, kw / 3, kh / 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Renal pelvis (center)
      ctx.fillStyle = selectedPart === "pelvis" ? "rgba(255, 220, 150, 0.8)" : "rgba(220, 180, 120, 0.6)";
      ctx.beginPath();
      ctx.ellipse(cx + kw * 0.1, cy, kw / 6, kh / 5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Medullary pyramids
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * kw * 0.22;
        const py = cy + Math.sin(angle) * kh * 0.22;
        ctx.fillStyle = "rgba(140, 50, 50, 0.6)";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(angle + 0.3) * 15, py + Math.sin(angle + 0.3) * 15);
        ctx.lineTo(px + Math.cos(angle - 0.3) * 15, py + Math.sin(angle - 0.3) * 15);
        ctx.closePath();
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Cortex", cx - kw * 0.25, cy - kh * 0.35);
      ctx.fillText("Medulla", cx, cy - kh * 0.15);
      ctx.fillText("Renal Pelvis", cx + kw * 0.15, cy + 5);

      // Renal artery & vein
      ctx.strokeStyle = "rgba(255, 40, 40, 0.7)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + kw / 2 + 5, cy - 10);
      ctx.lineTo(w * 0.85, cy - 10);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Renal Artery", w * 0.72, cy - 18);

      ctx.strokeStyle = "rgba(40, 80, 255, 0.7)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + kw / 2 + 5, cy + 10);
      ctx.lineTo(w * 0.85, cy + 10);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillText("Renal Vein", w * 0.72, cy + 25);

      // Ureter
      ctx.strokeStyle = "rgba(200, 160, 80, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + kw * 0.1, cy + kh / 2);
      ctx.quadraticCurveTo(cx + kw * 0.1, h * 0.92, cx, h * 0.95);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.fillText("Ureter", cx + kw * 0.15, h * 0.9);

      // Nephron hint
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("~1 million nephrons", cx, h * 0.95);

    } else {
      // Nephron view
      const startX = w * 0.1, startY = h * 0.2;

      // Glomerulus (ball of capillaries)
      ctx.fillStyle = selectedPart === "glomerulus" ? "rgba(255, 80, 80, 0.8)" : "rgba(200, 60, 60, 0.6)";
      ctx.beginPath();
      ctx.arc(startX + 50, startY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 100, 100, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Capillary loops
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(startX + 50 + Math.cos(i * 1.2) * 10, startY + Math.sin(i * 1.2) * 10, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 50, 50, 0.4)";
        ctx.stroke();
      }

      // Bowman's capsule
      ctx.strokeStyle = selectedPart === "bowmans" ? "rgba(100, 200, 255, 0.8)" : "rgba(100, 180, 220, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(startX + 50, startY, 35, 0, Math.PI * 2);
      ctx.stroke();

      // Proximal convoluted tubule
      ctx.strokeStyle = selectedPart === "proximal" ? "rgba(100, 255, 150, 0.8)" : "rgba(80, 200, 120, 0.5)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(startX + 85, startY);
      for (let i = 0; i < 8; i++) {
        ctx.lineTo(startX + 100 + i * 20, startY + (i % 2 === 0 ? -15 : 15));
      }
      ctx.stroke();

      // Loop of Henle
      const loopX = startX + w * 0.55;
      ctx.strokeStyle = selectedPart === "loop" ? "rgba(255, 200, 100, 0.8)" : "rgba(220, 170, 80, 0.5)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(loopX - 30, startY + 15);
      ctx.lineTo(loopX - 30, h * 0.75);
      ctx.quadraticCurveTo(loopX, h * 0.82, loopX + 30, h * 0.75);
      ctx.lineTo(loopX + 30, startY + 60);
      ctx.stroke();

      // Distal convoluted tubule
      ctx.strokeStyle = selectedPart === "distal" ? "rgba(200, 100, 255, 0.8)" : "rgba(160, 80, 200, 0.5)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(loopX + 30, startY + 60);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(loopX + 50 + i * 18, startY + 50 + (i % 2 === 0 ? -12 : 12));
      }
      ctx.stroke();

      // Collecting duct
      ctx.strokeStyle = selectedPart === "collecting" ? "rgba(255, 150, 50, 0.8)" : "rgba(220, 130, 50, 0.5)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w * 0.85, startY + 50);
      ctx.lineTo(w * 0.85, h * 0.88);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Glomerulus", startX + 50, startY - 42);
      ctx.fillText("Bowman's", startX + 50, startY + 50);
      ctx.fillText("Capsule", startX + 50, startY + 62);
      ctx.fillText("Proximal Tubule", startX + 160, startY - 28);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("(reabsorbs glucose,", startX + 160, startY - 16);
      ctx.fillText("amino acids, water)", startX + 160, startY - 4);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("Loop of Henle", loopX, h * 0.88);
      ctx.fillText("Distal Tubule", loopX + 70, startY + 30);
      ctx.fillText("Collecting Duct", w * 0.85, startY + 35);

      // ADH effect indicator on collecting duct
      const adhPermeability = waterReabsorption;
      ctx.fillStyle = `rgba(100, 200, 255, ${adhPermeability * 0.4})`;
      ctx.fillRect(w * 0.85 - 10, startY + 55, 20, h * 0.82 - startY - 55);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "8px sans-serif";
      ctx.fillText(`ADH: ${adhLevel}%`, w * 0.85, h * 0.92);
      ctx.fillText(adhLevel > 50 ? "Concentrated urine" : "Dilute urine", w * 0.85, h * 0.95);

      // Molecular view
      if (showMolecular) {
        // Filtration arrows
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        // Show arrows from glomerulus outward
        for (let i = 0; i < 4; i++) {
          const angle = -0.5 + i * 0.4;
          ctx.beginPath();
          ctx.moveTo(startX + 50 + Math.cos(angle) * 25, startY + Math.sin(angle) * 25);
          ctx.lineTo(startX + 50 + Math.cos(angle) * 40, startY + Math.sin(angle) * 40);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Legend
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(5, h - 50, w * 0.45, 45);
        ctx.font = "9px sans-serif";
        const legend = [
          { color: "rgba(100,200,255,0.8)", label: "H₂O" },
          { color: "rgba(255,200,50,0.8)", label: "Glucose" },
          { color: "rgba(200,100,255,0.8)", label: "Urea" },
          { color: "rgba(100,255,100,0.8)", label: "Salts" },
        ];
        legend.forEach((l, i) => {
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.arc(15 + i * 55, h - 25, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.textAlign = "left";
          ctx.fillText(l.label, 23 + i * 55, h - 22);
        });
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [view, selectedPart, showMolecular, waterReabsorption, adhLevel, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = Math.min(parent.clientWidth * 0.7, 520); }
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
          <div className="flex gap-2">
            <Button size="sm" variant={view === "kidney" ? "default" : "outline"} onClick={() => setView("kidney")}>Kidney View</Button>
            <Button size="sm" variant={view === "nephron" ? "default" : "outline"} onClick={() => setView("nephron")}>Nephron View</Button>
          </div>
          {view === "nephron" && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <Label>ADH Level</Label>
                <span className="font-mono">{adhLevel}%</span>
              </div>
              <Slider value={adh} onValueChange={setAdh} min={0} max={100} step={5} />
              <p className="text-xs text-muted-foreground mt-1">ADH controls water reabsorption in collecting duct</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant={showMolecular ? "default" : "outline"} onClick={() => setShowMolecular(!showMolecular)}>
              {showMolecular ? <><EyeOff className="w-4 h-4 mr-1" /> Hide Molecular</> : <><Eye className="w-4 h-4 mr-1" /> Molecular View</>}
            </Button>
          </div>
        </div>
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm">{view === "kidney" ? "Kidney Regions" : "Nephron Parts"}</h3>
          {view === "kidney" ? (
            ["cortex", "medulla", "pelvis"].map((part) => (
              <button key={part} onClick={() => setSelectedPart(selectedPart === part ? null : part)}
                className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${selectedPart === part ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}>
                <span className="font-medium capitalize">{part === "pelvis" ? "Renal Pelvis" : part}</span>
                <p className="text-xs text-muted-foreground">
                  {part === "cortex" && "Outer layer with glomeruli"}
                  {part === "medulla" && "Inner layer with loops of Henle"}
                  {part === "pelvis" && "Collects urine → ureter"}
                </p>
              </button>
            ))
          ) : (
            ["glomerulus", "bowmans", "proximal", "loop", "distal", "collecting"].map((part) => (
              <button key={part} onClick={() => setSelectedPart(selectedPart === part ? null : part)}
                className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${selectedPart === part ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}>
                <span className="font-medium">{
                  part === "bowmans" ? "Bowman's Capsule" :
                  part === "proximal" ? "Proximal Tubule" :
                  part === "loop" ? "Loop of Henle" :
                  part === "distal" ? "Distal Tubule" :
                  part === "collecting" ? "Collecting Duct" :
                  "Glomerulus"
                }</span>
              </button>
            ))
          )}
          {view === "nephron" && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span>Filtration:</span><span>Glomerulus → Bowman's</span></div>
              <div className="flex justify-between"><span>Reabsorption:</span><span>Proximal tubule</span></div>
              <div className="flex justify-between"><span>Concentration:</span><span>Loop of Henle</span></div>
              <div className="flex justify-between"><span>Water reabsorption:</span><Badge>{(waterReabsorption * 100).toFixed(0)}%</Badge></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
