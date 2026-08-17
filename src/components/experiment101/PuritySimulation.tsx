import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulationLoader } from "@/components/simulations/SimulationLoader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Flame } from "lucide-react";

type SampleKey = "ice" | "wax" | "salt" | "tablet";

const SAMPLES: Record<SampleKey, { label: string; mp: number; max: number; unit: string }> = {
  ice: { label: "Ice / Water", mp: 0, max: 40, unit: "°C" },
  wax: { label: "Candle Wax", mp: 58, max: 100, unit: "°C" },
  salt: { label: "Salt (NaCl)", mp: 80, max: 130, unit: "°C" },
  tablet: { label: "Pharmaceutical Powder", mp: 135, max: 190, unit: "°C" },
};

interface Point {
  t: number;
  temp: number;
}

export function PuritySimulation() {
  const [sample, setSample] = useState<SampleKey>("ice");
  const [impurity, setImpurity] = useState(0);
  const [rate, setRate] = useState(4);
  const [running, setRunning] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [temp, setTemp] = useState(-20);
  const [phase, setPhase] = useState<"solid" | "melting" | "liquid">("solid");

  const paramsRef = useRef({ sample, impurity, rate });
  useEffect(() => {
    paramsRef.current = { sample, impurity, rate };
  }, [sample, impurity, rate]);

  const meta = SAMPLES[sample];
  const depression = impurity * 0.45;
  const onsetMp = meta.mp - depression;
  const rangeWidth = impurity === 0 ? 0.3 : 0.3 + impurity * 0.32;
  const startTemp = meta.mp - 25;

  // reset when sample changes
  useEffect(() => {
    setRunning(false);
    setPoints([]);
    setTemp(SAMPLES[sample].mp - 25);
    setPhase("solid");
  }, [sample]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const p = paramsRef.current;
      const m = SAMPLES[p.sample];
      const onset = m.mp - p.impurity * 0.45;
      const width = p.impurity === 0 ? 0.3 : 0.3 + p.impurity * 0.32;

      setTemp((prev) => {
        let next = prev;
        // inside melting range: rise very slowly (latent heat)
        if (prev >= onset && prev <= onset + width) {
          next = prev + p.rate * dt * (p.impurity === 0 ? 0.03 : 0.14);
          setPhase("melting");
        } else if (prev > onset + width) {
          next = prev + p.rate * dt;
          setPhase("liquid");
        } else {
          next = prev + p.rate * dt;
          setPhase("solid");
        }
        if (next >= m.max) {
          setRunning(false);
          return m.max;
        }
        setPoints((pts) => {
          const t = pts.length ? pts[pts.length - 1].t + dt : 0;
          if (pts.length && t - pts[pts.length - 1].t < 0.05) return pts;
          return [...pts, { t, temp: next }];
        });
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setPoints([]);
    setTemp(startTemp);
    setPhase("solid");
  };

  // ---- graph geometry ----
  const W = 620;
  const H = 300;
  const pad = 44;
  const maxT = Math.max(20, points.length ? points[points.length - 1].t : 20);
  const yMin = startTemp;
  const yMax = meta.max;
  const gx = (t: number) => pad + (t / maxT) * (W - pad - 16);
  const gy = (v: number) => H - pad - ((v - yMin) / (yMax - yMin)) * (H - pad - 20);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${gx(p.t).toFixed(1)} ${gy(p.temp).toFixed(1)}`).join(" ");

  // ---- chromatography ----
  const [chromRunning, setChromRunning] = useState(false);
  const [front, setFront] = useState(0);
  const [solvent, setSolvent] = useState<"water" | "ethanol">("water");
  const [mixture, setMixture] = useState<"pure" | "ink" | "dye">("ink");

  const COMPONENTS: Record<string, { name: string; rf: number; color: string }[]> = {
    pure: [{ name: "Single component", rf: 0.62, color: "hsl(200 80% 55%)" }],
    ink: [
      { name: "Yellow dye", rf: 0.82, color: "hsl(48 90% 55%)" },
      { name: "Red dye", rf: 0.55, color: "hsl(0 75% 55%)" },
      { name: "Blue dye", rf: 0.28, color: "hsl(220 75% 55%)" },
    ],
    dye: [
      { name: "Chlorophyll b", rf: 0.45, color: "hsl(140 60% 45%)" },
      { name: "Chlorophyll a", rf: 0.66, color: "hsl(110 55% 40%)" },
      { name: "Carotene", rf: 0.9, color: "hsl(30 90% 55%)" },
    ],
  };
  const solventFactor = solvent === "ethanol" ? 1 : 0.85;

  useEffect(() => {
    if (!chromRunning) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setFront((f) => {
        const next = f + dt * 0.28;
        if (next >= 1) {
          setChromRunning(false);
          return 1;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chromRunning]);

  const PW = 320;
  const PH = 300;
  const baseY = PH - 46;
  const topY = 28;
  const frontY = baseY - front * (baseY - topY);
  const frontCm = (front * 8).toFixed(1);

  return (
    <SimulationLoader simulationName="Pure and Impure Substances">
      <Tabs defaultValue="melting">
        <TabsList className="mb-4">
          <TabsTrigger value="melting">Melting Point</TabsTrigger>
          <TabsTrigger value="chromatography">Chromatography</TabsTrigger>
        </TabsList>

        <TabsContent value="melting">
          <div className="grid lg:grid-cols-[1fr_300px] gap-4">
            <div className="rounded-xl border bg-card overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
                <span className="text-sm font-medium truncate">{meta.label} · {impurity}% impurity</span>
                <Badge variant="secondary" className="shrink-0 capitalize">{phase}</Badge>
              </div>
              <div className="p-3 flex flex-col sm:flex-row gap-3 items-stretch">
                {/* test tube */}
                <div className="flex sm:flex-col items-center justify-center gap-2 sm:w-24 shrink-0">
                  <svg viewBox="0 0 80 190" className="h-40 sm:h-48 w-auto">
                    <rect x="26" y="8" width="28" height="150" rx="14" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
                    <rect
                      x="28"
                      y={158 - 90}
                      width="24"
                      height="88"
                      rx="12"
                      fill={phase === "liquid" ? "hsl(200 80% 55% / 0.7)" : phase === "melting" ? "hsl(200 60% 60% / 0.45)" : "hsl(210 30% 75% / 0.6)"}
                    />
                    {phase !== "solid" && [0, 1, 2].map((i) => (
                      <circle key={i} cx={34 + i * 7} cy={120 - i * 14} r={2.6} fill="hsl(0 0% 100% / 0.6)" />
                    ))}
                    <path d="M40 176 q-8 -12 0 -20 q8 8 0 20" fill={running ? "hsl(30 95% 55%)" : "hsl(var(--muted-foreground) / 0.3)"} />
                  </svg>
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums">{temp.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{meta.unit}</p>
                  </div>
                </div>
                {/* graph */}
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-muted/40 min-w-0">
                  <line x1={pad} y1={20} x2={pad} y2={H - pad} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
                  <line x1={pad} y1={H - pad} x2={W - 16} y2={H - pad} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
                  <text x={10} y={26} fontSize="11" fill="hsl(var(--muted-foreground))">{meta.unit}</text>
                  <text x={W - 46} y={H - pad + 20} fontSize="11" fill="hsl(var(--muted-foreground))">time (s)</text>
                  {/* pure reference */}
                  <line x1={pad} y1={gy(meta.mp)} x2={W - 16} y2={gy(meta.mp)} stroke="hsl(142 70% 45%)" strokeWidth={1} strokeDasharray="5 5" />
                  <text x={pad + 6} y={gy(meta.mp) - 5} fontSize="10" fill="hsl(142 70% 45%)">pure m.p. {meta.mp}{meta.unit}</text>
                  {impurity > 0 && (
                    <>
                      <line x1={pad} y1={gy(onsetMp)} x2={W - 16} y2={gy(onsetMp)} stroke="hsl(0 75% 58%)" strokeWidth={1} strokeDasharray="3 4" />
                      <text x={pad + 6} y={gy(onsetMp) + 14} fontSize="10" fill="hsl(0 75% 58%)">observed onset {onsetMp.toFixed(1)}{meta.unit}</text>
                    </>
                  )}
                  {path && <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.4} strokeLinejoin="round" />}
                </svg>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-5 min-w-0">
              <div>
                <Label className="text-xs mb-2 block">Sample</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SAMPLES) as SampleKey[]).map((k) => (
                    <Button key={k} size="sm" variant={sample === k ? "default" : "outline"} className="text-xs h-auto py-2 whitespace-normal" onClick={() => setSample(k)}>
                      {SAMPLES[k].label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs flex justify-between mb-2"><span>Impurity level</span><span className="font-mono">{impurity}%</span></Label>
                <Slider value={[impurity]} min={0} max={30} step={1} onValueChange={([v]) => setImpurity(v)} />
                <p className="text-xs text-muted-foreground mt-1">Impurities disrupt the crystal lattice, lowering and broadening the melting point.</p>
              </div>
              <div>
                <Label className="text-xs flex justify-between mb-2"><span>Heating rate</span><span className="font-mono">{rate} °C/s</span></Label>
                <Slider value={[rate]} min={1} max={12} step={1} onValueChange={([v]) => setRate(v)} />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                <p className="flex justify-between gap-2"><span className="text-muted-foreground">Melting onset</span><span className="font-mono">{onsetMp.toFixed(1)} {meta.unit}</span></p>
                <p className="flex justify-between gap-2"><span className="text-muted-foreground">Melting range</span><span className="font-mono">{rangeWidth.toFixed(1)} {meta.unit}</span></p>
                <p className="flex justify-between gap-2"><span className="text-muted-foreground">Verdict</span><span className={impurity === 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{impurity === 0 ? "Pure — sharp plateau" : "Impure — broad plateau"}</span></p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-1" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {running ? "Pause" : "Heat"}
                </Button>
                <Button variant="outline" onClick={reset} aria-label="Reset heating"><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chromatography">
          <div className="grid lg:grid-cols-[1fr_300px] gap-4">
            <div className="rounded-xl border bg-card overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
                <span className="text-sm font-medium truncate">Paper chromatography · {solvent}</span>
                <Badge variant="secondary" className="shrink-0">front {frontCm} cm</Badge>
              </div>
              <div className="p-3 flex justify-center">
                <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full max-w-sm h-auto rounded-lg bg-muted/40">
                  {/* beaker */}
                  <rect x={40} y={16} width={PW - 80} height={PH - 32} rx={8} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />
                  {/* solvent pool */}
                  <rect x={42} y={baseY + 10} width={PW - 84} height={PH - 32 - (baseY + 10 - 16)} fill="hsl(200 70% 55% / 0.25)" />
                  {/* paper */}
                  <rect x={PW / 2 - 46} y={topY - 12} width={92} height={baseY - topY + 34} fill="hsl(0 0% 100% / 0.85)" stroke="hsl(var(--border))" />
                  {/* wet region */}
                  <rect x={PW / 2 - 46} y={frontY} width={92} height={baseY - frontY + 24} fill="hsl(200 70% 60% / 0.2)" />
                  {/* baseline */}
                  <line x1={PW / 2 - 46} y1={baseY} x2={PW / 2 + 46} y2={baseY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" />
                  <text x={PW / 2 + 52} y={baseY + 4} fontSize="10" fill="hsl(var(--muted-foreground))">baseline</text>
                  {/* solvent front line */}
                  <line x1={PW / 2 - 46} y1={frontY} x2={PW / 2 + 46} y2={frontY} stroke="hsl(200 80% 50%)" strokeWidth={1.5} />
                  <text x={PW / 2 + 52} y={frontY + 4} fontSize="10" fill="hsl(200 80% 50%)">front</text>
                  {/* spots */}
                  {COMPONENTS[mixture].map((c, i) => {
                    const travelled = front * c.rf * solventFactor;
                    const y = baseY - travelled * (baseY - topY);
                    return <ellipse key={i} cx={PW / 2} cy={y} rx={13} ry={7} fill={c.color} opacity={0.85} />;
                  })}
                </svg>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-5 min-w-0">
              <div>
                <Label className="text-xs mb-2 block">Sample</Label>
                <div className="grid grid-cols-1 gap-2">
                  {([["pure", "Pure substance"], ["ink", "Black ink mixture"], ["dye", "Leaf pigment extract"]] as const).map(([k, l]) => (
                    <Button key={k} size="sm" variant={mixture === k ? "default" : "outline"} className="text-xs justify-start" onClick={() => { setMixture(k); setFront(0); setChromRunning(false); }}>{l}</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Solvent</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["water", "ethanol"] as const).map((s) => (
                    <Button key={s} size="sm" variant={solvent === s ? "default" : "outline"} className="text-xs capitalize" onClick={() => { setSolvent(s); setFront(0); setChromRunning(false); }}>{s}</Button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-2">
                <p className="font-medium">Rf values (Rf = spot ÷ front)</p>
                {COMPONENTS[mixture].map((c, i) => (
                  <p key={i} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} /><span className="truncate">{c.name}</span></span>
                    <span className="font-mono shrink-0">{front > 0.05 ? (c.rf * solventFactor).toFixed(2) : "—"}</span>
                  </p>
                ))}
                <p className="text-muted-foreground pt-1">{COMPONENTS[mixture].length === 1 ? "One spot → the sample is pure." : `${COMPONENTS[mixture].length} spots → at least ${COMPONENTS[mixture].length} components.`}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-1" onClick={() => setChromRunning((r) => !r)} disabled={front >= 1}>
                  <Flame className="w-4 h-4" />{chromRunning ? "Pause" : "Run solvent"}
                </Button>
                <Button variant="outline" onClick={() => { setFront(0); setChromRunning(false); }} aria-label="Reset chromatography"><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </SimulationLoader>
  );
}
