import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const sources = [
  { id: "battery", name: "Battery", icon: "🔋", conversion: "Chemical → Electrical", paramLabel: "Voltage (V)", min: 1, max: 12, default: 6, unit: "V" },
  { id: "generator", name: "Generator", icon: "⚙️", conversion: "Mechanical → Electrical", paramLabel: "Rotation Speed (RPM)", min: 100, max: 3000, default: 1500, unit: "RPM" },
  { id: "solar", name: "Solar Panel", icon: "☀️", conversion: "Light → Electrical", paramLabel: "Light Intensity (%)", min: 0, max: 100, default: 75, unit: "%" },
  { id: "wind", name: "Wind Turbine", icon: "🌬️", conversion: "Mechanical → Electrical", paramLabel: "Wind Speed (m/s)", min: 0, max: 25, default: 12, unit: "m/s" },
  { id: "hydro", name: "Hydroelectric", icon: "💧", conversion: "Gravitational → Electrical", paramLabel: "Water Flow (L/s)", min: 0, max: 100, default: 50, unit: "L/s" },
];

function getOutput(sourceId: string, param: number) {
  switch (sourceId) {
    case "battery": return { voltage: param, current: param / 3, power: (param * param) / 3 };
    case "generator": return { voltage: param / 150, current: param / 500, power: (param / 150) * (param / 500) };
    case "solar": return { voltage: param * 0.22, current: param * 0.05, power: param * 0.22 * param * 0.05 };
    case "wind": return { voltage: param * 0.8, current: param * 0.12, power: param * 0.8 * param * 0.12 };
    case "hydro": return { voltage: param * 0.24, current: param * 0.08, power: param * 0.24 * param * 0.08 };
    default: return { voltage: 0, current: 0, power: 0 };
  }
}

export function SourcesOfElectricitySimulation() {
  const [selected, setSelected] = useState("battery");
  const [param, setParam] = useState(6);
  const [showElectrons, setShowElectrons] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const source = sources.find(s => s.id === selected)!;
  const output = getOutput(selected, param);

  useEffect(() => {
    setParam(source.default);
  }, [selected]);

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
      timeRef.current += 0.02;

      const cx = w / 2, cy = h / 2;

      // Source icon area
      ctx.fillStyle = "hsl(220, 15%, 18%)";
      ctx.beginPath();
      ctx.roundRect(cx - 60, cy - 50, 120, 100, 12);
      ctx.fill();
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "36px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(source.icon, cx, cy + 5);
      ctx.font = "bold 11px system-ui";
      ctx.fillText(source.name, cx, cy + 35);

      // Output wire
      ctx.strokeStyle = "hsl(220, 9%, 46%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 60, cy);
      ctx.lineTo(w - 40, cy);
      ctx.stroke();

      // Bulb
      const bulbX = w - 40, bulbR = 18;
      const brightness = Math.min(output.power / 10, 1);
      if (brightness > 0.05) {
        ctx.shadowColor = `hsl(45, 100%, 60%)`;
        ctx.shadowBlur = 15 + brightness * 25;
      }
      ctx.beginPath();
      ctx.arc(bulbX, cy, bulbR, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(45, ${60 + brightness * 40}%, ${20 + brightness * 60}%)`;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "hsl(220, 9%, 46%)";
      ctx.stroke();
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "16px system-ui";
      ctx.fillText("💡", bulbX, cy + 5);

      // Electron flow
      if (showElectrons && output.current > 0.01) {
        const count = Math.min(Math.round(output.current * 5), 15);
        for (let i = 0; i < count; i++) {
          const prog = ((timeRef.current * output.current * 0.5 + i / count) % 1);
          const ex = (cx + 60) + (w - 40 - cx - 60) * prog;
          ctx.beginPath();
          ctx.arc(ex, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "hsl(200, 100%, 60%)";
          ctx.shadowColor = "hsl(200, 100%, 60%)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Meter readings
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`V: ${output.voltage.toFixed(1)} V`, 10, h - 40);
      ctx.fillText(`I: ${output.current.toFixed(2)} A`, 10, h - 24);
      ctx.fillText(`P: ${output.power.toFixed(2)} W`, 10, h - 8);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [selected, param, showElectrons, output]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <canvas ref={canvasRef} className="w-full h-[250px] rounded-lg bg-muted/30" style={{ display: "block" }} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Select Source</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {sources.map(s => (
                <Button key={s.id} variant={selected === s.id ? "default" : "outline"} size="sm" onClick={() => setSelected(s.id)} className="gap-1">
                  <span>{s.icon}</span>{s.name}
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="mt-3">{source.conversion}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Controls</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{source.paramLabel}</span>
                <span className="font-mono">{param} {source.unit}</span>
              </div>
              <Slider value={[param]} onValueChange={([v]) => setParam(v)} min={source.min} max={source.max} step={1} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showElectrons} onCheckedChange={setShowElectrons} />
              <span className="text-sm">Show Electron Flow</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
