import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, GripVertical } from "lucide-react";

const testSolutions = [
  { name: "Lemon Juice", pH: 2.5, color: "#fff176" },
  { name: "Vinegar", pH: 3, color: "#ffcc80" },
  { name: "Milk", pH: 6.5, color: "#fafafa" },
  { name: "Pure Water", pH: 7, color: "#e3f2fd" },
  { name: "Baking Soda", pH: 8.5, color: "#e8eaf6" },
  { name: "Soap Solution", pH: 10, color: "#c5cae9" },
  { name: "Ammonia", pH: 11, color: "#b3e5fc" },
  { name: "Unknown A", pH: 4, color: "#ffe0b2" },
  { name: "Unknown B", pH: 9, color: "#dcedc8" },
];

interface LitmusResult {
  solution: string;
  redResult: string;
  blueResult: string;
  classification: "Acid" | "Base" | "Neutral";
}

export function LitmusPaperSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [selectedSolution, setSelectedSolution] = useState(0);
  const [draggedStrip, setDraggedStrip] = useState<"red" | "blue" | null>(null);
  const [redDipped, setRedDipped] = useState(false);
  const [blueDipped, setBlueDipped] = useState(false);
  const [results, setResults] = useState<LitmusResult[]>([]);
  const [stripPositions, setStripPositions] = useState({ red: { x: 0, y: 0 }, blue: { x: 0, y: 0 } });
  const mouseRef = useRef({ x: 0, y: 0 });

  const solution = testSolutions[selectedSolution];
  const redColor = redDipped ? (solution.pH > 7 ? "#3498db" : "#e74c3c") : "#e74c3c";
  const blueColor = blueDipped ? (solution.pH < 7 ? "#e74c3c" : "#3498db") : "#3498db";

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

    // Solution beaker
    const bx = w * 0.3, by = h * 0.25, bw = w * 0.3, bh = h * 0.45;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Liquid
    const liquidH = bh * 0.7;
    const liquidY = by + bh - liquidH;
    ctx.fillStyle = solution.color + "88";
    ctx.fillRect(bx + 2, liquidY, bw - 4, liquidH - 2);

    // Solution label
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(solution.name, bx + bw / 2, by - 8);

    // Red litmus strip (in tray or dragged)
    const redX = draggedStrip === "red" ? mouseRef.current.x - 8 : w * 0.08;
    const redY = draggedStrip === "red" ? mouseRef.current.y - 40 : h * 0.3;
    ctx.fillStyle = redColor;
    ctx.fillRect(redX, redY, 16, 80);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
    ctx.strokeRect(redX, redY, 16, 80);
    ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("R", redX + 8, redY + 10);

    // Blue litmus strip
    const blueX = draggedStrip === "blue" ? mouseRef.current.x - 8 : w * 0.08;
    const blueY = draggedStrip === "blue" ? mouseRef.current.y - 40 : h * 0.55;
    ctx.fillStyle = blueColor;
    ctx.fillRect(blueX, blueY, 16, 80);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
    ctx.strokeRect(blueX, blueY, 16, 80);
    ctx.fillStyle = "#fff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("B", blueX + 8, blueY + 10);

    // Strip labels
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    if (draggedStrip !== "red") ctx.fillText("Red Litmus", w * 0.08 + 8, h * 0.3 - 8);
    if (draggedStrip !== "blue") ctx.fillText("Blue Litmus", w * 0.08 + 8, h * 0.55 - 8);

    // Drag hint
    if (!redDipped && !blueDipped) {
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("← Drag strips into the solution →", w * 0.5, h * 0.82);
    }

    // Result display
    if (redDipped || blueDipped) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(w * 0.65, h * 0.2, w * 0.32, h * 0.5);
      ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("Observations:", w * 0.67, h * 0.28);
      let oy = h * 0.35;
      if (redDipped) {
        ctx.fillStyle = redColor;
        ctx.fillRect(w * 0.67, oy - 4, 10, 10);
        ctx.fillStyle = "#fff"; ctx.font = "11px sans-serif";
        ctx.fillText(solution.pH > 7 ? "Red → Blue (Base)" : "Red stays Red", w * 0.69 + 12, oy + 4);
        oy += 25;
      }
      if (blueDipped) {
        ctx.fillStyle = blueColor;
        ctx.fillRect(w * 0.67, oy - 4, 10, 10);
        ctx.fillStyle = "#fff"; ctx.font = "11px sans-serif";
        ctx.fillText(solution.pH < 7 ? "Blue → Red (Acid)" : "Blue stays Blue", w * 0.69 + 12, oy + 4);
        oy += 25;
      }
      if (redDipped && blueDipped) {
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 11px sans-serif";
        const classification = solution.pH < 7 ? "→ ACIDIC" : solution.pH > 7 ? "→ BASIC" : "→ NEUTRAL";
        ctx.fillText(`Conclusion: ${classification}`, w * 0.67, oy + 8);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [solution, redColor, blueColor, draggedStrip, redDipped, blueDipped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = Math.min(parent.clientWidth * 0.65, 500); }
    };
    resize();
    window.addEventListener("resize", resize);

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = "touches" in e ? e.touches[0] : e;
      return { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      mouseRef.current = pos;
      const w = canvas.width, h = canvas.height;
      // Check if clicking on red strip
      if (pos.x > w * 0.02 && pos.x < w * 0.15 && pos.y > h * 0.25 && pos.y < h * 0.5) {
        setDraggedStrip("red");
      } else if (pos.x > w * 0.02 && pos.x < w * 0.15 && pos.y > h * 0.5 && pos.y < h * 0.7) {
        setDraggedStrip("blue");
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      mouseRef.current = pos;
    };

    const onUp = () => {
      if (!draggedStrip) return;
      const w = canvas.width, h = canvas.height;
      const bx = w * 0.3, by = h * 0.25, bw = w * 0.3, bh = h * 0.45;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      // Check if dropped in beaker
      if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
        if (draggedStrip === "red") setRedDipped(true);
        if (draggedStrip === "blue") setBlueDipped(true);
      }
      setDraggedStrip(null);
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    canvas.addEventListener("touchend", onUp);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [draw, draggedStrip]);

  const handleNextSolution = () => {
    // Record result
    if (redDipped && blueDipped) {
      setResults((prev) => [
        ...prev.filter((r) => r.solution !== solution.name),
        {
          solution: solution.name,
          redResult: solution.pH > 7 ? "Turns Blue" : "Stays Red",
          blueResult: solution.pH < 7 ? "Turns Red" : "Stays Blue",
          classification: solution.pH < 7 ? "Acid" : solution.pH > 7 ? "Base" : "Neutral",
        },
      ]);
    }
    setRedDipped(false);
    setBlueDipped(false);
    setSelectedSolution((prev) => (prev + 1) % testSolutions.length);
  };

  const handleReset = () => {
    setRedDipped(false);
    setBlueDipped(false);
    setResults([]);
    setSelectedSolution(0);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border bg-background">
        <canvas ref={canvasRef} className="w-full cursor-grab active:cursor-grabbing" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2"><GripVertical className="w-4 h-4" /> Instructions</h3>
          <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
            <li>Drag the <span className="text-red-400 font-medium">Red Litmus</span> strip into the beaker</li>
            <li>Drag the <span className="text-blue-400 font-medium">Blue Litmus</span> strip into the beaker</li>
            <li>Observe the color changes</li>
            <li>Click "Next Solution" to test another substance</li>
          </ol>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleNextSolution} disabled={!redDipped && !blueDipped}>
              Next Solution →
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset All
            </Button>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-sm">Observation Log ({results.length}/{testSolutions.length})</h3>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">Test solutions to build your log…</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <span>{r.solution}</span>
                  <Badge variant={r.classification === "Acid" ? "destructive" : r.classification === "Base" ? "default" : "secondary"}>
                    {r.classification}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
