import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type CircuitType = "series" | "parallel";

export function FlowOfCurrentSimulation() {
  const [circuitType, setCircuitType] = useState<CircuitType>("series");
  const [voltage, setVoltage] = useState(9);
  const [resistance1, setResistance1] = useState(10);
  const [resistance2, setResistance2] = useState(20);
  const [switchClosed, setSwitchClosed] = useState(true);
  const [showElectrons, setShowElectrons] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const totalR = circuitType === "series" ? resistance1 + resistance2 : (resistance1 * resistance2) / (resistance1 + resistance2);
  const totalI = switchClosed ? voltage / totalR : 0;
  const power = voltage * totalI;

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

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.016;

      const pad = 30;
      const cx = w / 2, cy = h / 2;

      if (circuitType === "series") {
        // Series circuit: rectangular loop
        const path = [
          { x: pad, y: cy - 40 }, { x: cx - 30, y: cy - 40 }, // battery to switch
          { x: cx + 30, y: cy - 40 }, { x: w - pad, y: cy - 40 }, // switch to R1
          { x: w - pad, y: cy + 40 }, { x: pad, y: cy + 40 }, // R1 to R2 (bottom)
          { x: pad, y: cy - 40 } // back to battery
        ];

        ctx.strokeStyle = "hsl(220, 9%, 46%)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();

        // Battery
        ctx.fillStyle = "hsl(220, 15%, 20%)";
        ctx.fillRect(pad - 10, cy - 60, 20, 40);
        ctx.strokeStyle = "hsl(45, 93%, 47%)";
        ctx.lineWidth = 2;
        ctx.strokeRect(pad - 10, cy - 60, 20, 40);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "bold 11px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${voltage}V`, pad, cy - 65);

        // Switch
        ctx.fillStyle = switchClosed ? "hsl(120, 70%, 40%)" : "hsl(0, 70%, 40%)";
        ctx.beginPath();
        ctx.arc(cx, cy - 40, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "9px system-ui";
        ctx.fillText(switchClosed ? "ON" : "OFF", cx, cy - 37);

        // R1 (top-right)
        const r1x = w - pad - 15;
        ctx.fillStyle = `hsl(30, ${30 + (totalI / 2) * 40}%, 30%)`;
        ctx.fillRect(r1x, cy - 55, 30, 30);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "10px system-ui";
        ctx.fillText(`R1: ${resistance1}Ω`, r1x + 15, cy - 60);

        // R2 (bottom)
        const r2x = cx - 15;
        ctx.fillStyle = `hsl(30, ${30 + (totalI / 2) * 40}%, 30%)`;
        ctx.fillRect(r2x, cy + 25, 30, 30);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "10px system-ui";
        ctx.fillText(`R2: ${resistance2}Ω`, cx, cy + 68);

        // Bulb indicators
        const b1Brightness = switchClosed ? Math.min((voltage * resistance1 / totalR) / 12, 1) : 0;
        const b2Brightness = switchClosed ? Math.min((voltage * resistance2 / totalR) / 12, 1) : 0;

        // Bulb 1
        if (b1Brightness > 0) {
          ctx.shadowColor = "hsl(45, 100%, 60%)";
          ctx.shadowBlur = b1Brightness * 20;
        }
        ctx.beginPath();
        ctx.arc(w - pad, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(45, 80%, ${20 + b1Brightness * 60}%)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Electrons
        if (showElectrons && switchClosed && totalI > 0) {
          const totalLen = path.reduce((acc, p, i) => {
            if (i === 0) return 0;
            return acc + Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y);
          }, 0);
          const count = Math.min(Math.round(totalI * 4), 12);
          for (let i = 0; i < count; i++) {
            const prog = ((timeRef.current * totalI * 0.3 + i / count) % 1);
            let dist = prog * totalLen, accDist = 0;
            for (let j = 1; j < path.length; j++) {
              const segLen = Math.hypot(path[j].x - path[j - 1].x, path[j].y - path[j - 1].y);
              if (accDist + segLen >= dist) {
                const t = (dist - accDist) / segLen;
                const ex = path[j - 1].x + (path[j].x - path[j - 1].x) * t;
                const ey = path[j - 1].y + (path[j].y - path[j - 1].y) * t;
                ctx.beginPath();
                ctx.arc(ex, ey, 3, 0, Math.PI * 2);
                ctx.fillStyle = "hsl(200, 100%, 60%)";
                ctx.shadowColor = "hsl(200, 100%, 60%)";
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
                break;
              }
              accDist += segLen;
            }
          }
        }
      } else {
        // Parallel circuit
        const topY = cy - 50, botY = cy + 50;
        // Main horizontal lines
        ctx.strokeStyle = "hsl(220, 9%, 46%)";
        ctx.lineWidth = 3;
        // Top wire
        ctx.beginPath(); ctx.moveTo(pad, topY); ctx.lineTo(w - pad, topY); ctx.stroke();
        // Bottom wire
        ctx.beginPath(); ctx.moveTo(pad, botY); ctx.lineTo(w - pad, botY); ctx.stroke();
        // Left vertical
        ctx.beginPath(); ctx.moveTo(pad, topY); ctx.lineTo(pad, botY); ctx.stroke();
        // Right vertical
        ctx.beginPath(); ctx.moveTo(w - pad, topY); ctx.lineTo(w - pad, botY); ctx.stroke();
        // Branch 1 (top)
        ctx.beginPath(); ctx.moveTo(cx - 40, topY); ctx.lineTo(cx - 40, cy - 10); ctx.lineTo(cx + 40, cy - 10); ctx.lineTo(cx + 40, topY); ctx.stroke();
        // Branch 2 (bottom)
        ctx.beginPath(); ctx.moveTo(cx - 40, botY); ctx.lineTo(cx - 40, cy + 10); ctx.lineTo(cx + 40, cy + 10); ctx.lineTo(cx + 40, botY); ctx.stroke();

        // Battery (left)
        ctx.fillStyle = "hsl(220, 15%, 20%)";
        ctx.fillRect(pad - 10, cy - 15, 20, 30);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "bold 11px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${voltage}V`, pad, cy + 30);

        // R1 on branch 1
        ctx.fillStyle = `hsl(30, 40%, 30%)`;
        ctx.fillRect(cx - 10, cy - 22, 20, 24);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "9px system-ui";
        ctx.fillText(`${resistance1}Ω`, cx, cy - 26);

        // R2 on branch 2
        ctx.fillStyle = `hsl(30, 40%, 30%)`;
        ctx.fillRect(cx - 10, cy + 2, 20, 24);
        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "9px system-ui";
        ctx.fillText(`${resistance2}Ω`, cx, cy + 38);

        // Switch
        ctx.fillStyle = switchClosed ? "hsl(120, 70%, 40%)" : "hsl(0, 70%, 40%)";
        ctx.beginPath();
        ctx.arc(w - pad, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Readings
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`I = ${totalI.toFixed(2)} A`, 10, h - 30);
      ctx.fillText(`R_total = ${totalR.toFixed(1)} Ω`, 10, h - 14);
      ctx.textAlign = "right";
      ctx.fillText(`P = ${power.toFixed(2)} W`, w - 10, h - 14);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [circuitType, voltage, resistance1, resistance2, switchClosed, showElectrons, totalI, totalR, power]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <canvas ref={canvasRef} className="w-full h-[250px] rounded-lg bg-muted/30" style={{ display: "block" }} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Circuit Configuration</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="flex gap-2">
              <Button variant={circuitType === "series" ? "default" : "outline"} size="sm" onClick={() => setCircuitType("series")}>Series</Button>
              <Button variant={circuitType === "parallel" ? "default" : "outline"} size="sm" onClick={() => setCircuitType("parallel")}>Parallel</Button>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={switchClosed} onCheckedChange={setSwitchClosed} />
              <span className="text-sm">{switchClosed ? "Switch: Closed (ON)" : "Switch: Open (OFF)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showElectrons} onCheckedChange={setShowElectrons} />
              <span className="text-sm">Show Electron Flow</span>
            </div>
            <Badge variant="secondary">{circuitType === "series" ? "Current constant, voltage divides" : "Voltage constant, current divides"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Parameters</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Battery Voltage</span><span className="font-mono">{voltage} V</span></div>
              <Slider value={[voltage]} onValueChange={([v]) => setVoltage(v)} min={1} max={24} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Resistance 1</span><span className="font-mono">{resistance1} Ω</span></div>
              <Slider value={[resistance1]} onValueChange={([v]) => setResistance1(v)} min={1} max={100} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span>Resistance 2</span><span className="font-mono">{resistance2} Ω</span></div>
              <Slider value={[resistance2]} onValueChange={([v]) => setResistance2(v)} min={1} max={100} step={1} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
