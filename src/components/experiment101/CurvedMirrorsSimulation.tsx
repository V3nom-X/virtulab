import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulationLoader } from "@/components/simulations/SimulationLoader";

type MirrorType = "concave" | "convex";

export function CurvedMirrorsSimulation() {
  const [mirror, setMirror] = useState<MirrorType>("concave");
  const [f, setF] = useState(12);
  const [u, setU] = useState(30);
  const [h, setH] = useState(6);
  const [showRays, setShowRays] = useState(true);

  const fSigned = mirror === "concave" ? f : -f;
  // 1/f = 1/u + 1/v  =>  v = uf/(u - f)
  const denom = u - fSigned;
  const atFocus = mirror === "concave" && Math.abs(denom) < 0.4;
  const v = atFocus ? Infinity : (u * fSigned) / denom;
  const m = atFocus ? Infinity : -v / u;
  const imgH = atFocus ? Infinity : m * h;
  const isReal = !atFocus && v > 0;

  // Diagram geometry (SVG units)
  const W = 640;
  const H = 340;
  const axisY = H / 2;
  const poleX = W - 90;
  const scale = 4.2; // px per cm

  const x = (cm: number) => poleX - cm * scale;
  const objX = x(u);
  const objTopY = axisY - h * scale;
  const focusX = x(mirror === "concave" ? f : -f);
  const centreX = x(mirror === "concave" ? 2 * f : -2 * f);
  const imgX = atFocus ? null : x(v);
  const imgTopY = atFocus ? axisY : axisY - (imgH as number) * scale;

  const mirrorPath =
    mirror === "concave"
      ? `M ${poleX - 26} ${axisY - 120} Q ${poleX + 34} ${axisY} ${poleX - 26} ${axisY + 120}`
      : `M ${poleX + 26} ${axisY - 120} Q ${poleX - 34} ${axisY} ${poleX + 26} ${axisY + 120}`;

  const nature = atFocus
    ? "No image forms — reflected rays emerge parallel"
    : `${isReal ? "Real" : "Virtual"}, ${(m as number) < 0 ? "inverted" : "upright"}, ${Math.abs(m as number) > 1.02 ? "magnified" : Math.abs(m as number) < 0.98 ? "diminished" : "same size"}`;

  return (
    <SimulationLoader simulationName="Curved Mirrors">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
            <span className="text-sm font-medium capitalize">{mirror} mirror · f = {f} cm</span>
            <Badge variant="secondary" className="shrink-0">R = {2 * f} cm</Badge>
          </div>
          <div className="p-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-muted/40">
              {/* principal axis */}
              <line x1={20} y1={axisY} x2={W - 20} y2={axisY} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
              {/* mirror */}
              <path d={mirrorPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={4} strokeLinecap="round" />
              {/* markers */}
              {[{ px: focusX, l: "F" }, { px: centreX, l: "C" }, { px: poleX, l: "P" }].map((p) => (
                <g key={p.l}>
                  <circle cx={p.px} cy={axisY} r={3} fill="hsl(var(--muted-foreground))" />
                  <text x={p.px} y={axisY + 18} fontSize="11" textAnchor="middle" fill="hsl(var(--muted-foreground))">{p.l}</text>
                </g>
              ))}

              {/* object */}
              <line x1={objX} y1={axisY} x2={objX} y2={objTopY} stroke="hsl(var(--foreground))" strokeWidth={3} />
              <polygon points={`${objX - 5},${objTopY + 8} ${objX + 5},${objTopY + 8} ${objX},${objTopY - 2}`} fill="hsl(var(--foreground))" />
              <text x={objX} y={axisY + 18} fontSize="11" textAnchor="middle" fill="hsl(var(--foreground))">O</text>

              {showRays && (
                <g strokeWidth={1.6} fill="none">
                  {/* parallel ray to mirror then through F */}
                  <line x1={objX} y1={objTopY} x2={poleX - 8} y2={objTopY} stroke="hsl(45 90% 55%)" />
                  <line
                    x1={poleX - 8}
                    y1={objTopY}
                    x2={mirror === "concave" ? 30 : poleX - 8 - 300}
                    y2={
                      mirror === "concave"
                        ? objTopY + ((axisY - objTopY) / (poleX - 8 - focusX)) * (poleX - 8 - 30)
                        : objTopY - ((axisY - objTopY) / (focusX - (poleX - 8))) * 300
                    }
                    stroke="hsl(45 90% 55%)"
                  />
                  {mirror === "convex" && (
                    <line x1={poleX - 8} y1={objTopY} x2={focusX} y2={axisY} stroke="hsl(45 90% 55%)" strokeDasharray="4 4" />
                  )}
                  {/* ray through pole */}
                  <line x1={objX} y1={objTopY} x2={poleX} y2={axisY} stroke="hsl(200 80% 60%)" />
                  <line
                    x1={poleX}
                    y1={axisY}
                    x2={poleX - (poleX - objX)}
                    y2={axisY + (axisY - objTopY)}
                    stroke="hsl(200 80% 60%)"
                    strokeDasharray={isReal ? undefined : "4 4"}
                  />
                </g>
              )}

              {/* image */}
              {imgX !== null && Number.isFinite(imgTopY) && (
                <g opacity={0.95}>
                  <line
                    x1={imgX}
                    y1={axisY}
                    x2={imgX}
                    y2={imgTopY}
                    stroke={isReal ? "hsl(142 70% 45%)" : "hsl(280 70% 65%)"}
                    strokeWidth={3}
                    strokeDasharray={isReal ? undefined : "5 4"}
                  />
                  <text x={imgX} y={imgTopY > axisY ? imgTopY + 16 : imgTopY - 6} fontSize="11" textAnchor="middle" fill={isReal ? "hsl(142 70% 45%)" : "hsl(280 70% 65%)"}>
                    I
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 pb-3 text-center">
            {[
              { label: "Object dist. u", value: `${u} cm` },
              { label: "Image dist. v", value: atFocus ? "∞" : `${(v as number).toFixed(1)} cm` },
              { label: "Magnification m", value: atFocus ? "∞" : (m as number).toFixed(2) },
              { label: "Image height", value: atFocus ? "∞" : `${(imgH as number).toFixed(1)} cm` },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 p-2 min-w-0">
                <div className="text-[11px] text-muted-foreground truncate">{s.label}</div>
                <div className="text-sm font-semibold truncate">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mirror === "concave" ? "default" : "outline"} onClick={() => setMirror("concave")}>Concave</Button>
            <Button variant={mirror === "convex" ? "default" : "outline"} onClick={() => setMirror("convex")}>Convex</Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Focal length</Label>
              <span className="text-xs text-muted-foreground shrink-0">{f} cm</span>
            </div>
            <Slider min={5} max={40} step={1} value={[f]} onValueChange={([val]) => setF(val)} />
            <p className="text-xs text-muted-foreground">Radius of curvature R = 2f = {2 * f} cm</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Object distance</Label>
              <span className="text-xs text-muted-foreground shrink-0">{u} cm</span>
            </div>
            <Slider min={4} max={110} step={1} value={[u]} onValueChange={([val]) => setU(val)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Object height</Label>
              <span className="text-xs text-muted-foreground shrink-0">{h} cm</span>
            </div>
            <Slider min={2} max={16} step={1} value={[h]} onValueChange={([val]) => setH(val)} />
          </div>

          <Button variant={showRays ? "default" : "outline"} className="w-full" onClick={() => setShowRays((s) => !s)}>
            {showRays ? "Hide principal rays" : "Show principal rays"}
          </Button>

          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Image nature</p>
            <p className="text-sm font-semibold break-words">{nature}</p>
            <p className="text-xs text-muted-foreground break-words">Using 1/f = 1/u + 1/v and m = −v/u</p>
          </div>
        </div>
      </div>
    </SimulationLoader>
  );
}
