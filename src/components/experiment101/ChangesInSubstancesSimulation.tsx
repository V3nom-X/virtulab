import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SimulationLoader } from "@/components/simulations/SimulationLoader";
import { Play, RotateCcw, Undo2 } from "lucide-react";

type ProcessKey = "melting" | "boiling" | "dissolving" | "burningPaper" | "burningMagnesium" | "rusting" | "cookingEgg";

interface ProcessDef {
  label: string;
  icon: string;
  reversible: boolean;
  type: "Physical (temporary)" | "Chemical (permanent)";
  startState: string;
  endState: string;
  observations: string[];
  products: string;
  explanation: string;
  startColor: string;
  endColor: string;
}

const PROCESSES: Record<ProcessKey, ProcessDef> = {
  melting: {
    label: "Melting ice",
    icon: "🧊",
    reversible: true,
    type: "Physical (temporary)",
    startState: "Solid ice at 0 °C",
    endState: "Liquid water at 0 °C",
    observations: ["Solid softens and collapses", "Temperature holds at 0 °C while melting", "No new substance appears"],
    products: "Water (H₂O) — same substance, different state",
    explanation: "Only the arrangement of particles changes. Cooling the water re-freezes it, so the change is reversible.",
    startColor: "hsl(200 40% 85%)",
    endColor: "hsl(205 80% 60%)",
  },
  boiling: {
    label: "Boiling water",
    icon: "💧",
    reversible: true,
    type: "Physical (temporary)",
    startState: "Liquid water at 25 °C",
    endState: "Steam at 100 °C",
    observations: ["Bubbles form throughout the liquid", "Temperature stays at 100 °C", "Steam condenses back to water on a cold surface"],
    products: "Water vapour — same substance, different state",
    explanation: "Particles gain enough energy to escape the liquid. Condensing the steam returns the original water.",
    startColor: "hsl(205 80% 60%)",
    endColor: "hsl(205 20% 92%)",
  },
  dissolving: {
    label: "Dissolving salt",
    icon: "🧂",
    reversible: true,
    type: "Physical (temporary)",
    startState: "Salt crystals and water",
    endState: "Clear salt solution",
    observations: ["Crystals disappear as they spread through the water", "Solution tastes salty", "No gas, no colour change, no heat given out"],
    products: "Sodium chloride solution — salt is still salt",
    explanation: "The salt particles separate and mix among the water particles. Evaporating the water recovers the salt crystals.",
    startColor: "hsl(0 0% 92%)",
    endColor: "hsl(190 30% 80%)",
  },
  burningPaper: {
    label: "Burning paper",
    icon: "📄",
    reversible: false,
    type: "Chemical (permanent)",
    startState: "Dry white paper",
    endState: "Black ash, smoke and gases",
    observations: ["Flame and heat given out", "Smoke and carbon dioxide released", "Mass of solid left is far less than the paper"],
    products: "Carbon dioxide, water vapour, ash and soot",
    explanation: "The cellulose reacts with oxygen to form completely new substances. Ash can never be turned back into paper.",
    startColor: "hsl(0 0% 96%)",
    endColor: "hsl(0 0% 20%)",
  },
  burningMagnesium: {
    label: "Burning magnesium",
    icon: "✨",
    reversible: false,
    type: "Chemical (permanent)",
    startState: "Shiny grey magnesium ribbon",
    endState: "White magnesium oxide powder",
    observations: ["Blinding white flame", "Large amount of heat and light released", "White powder is heavier than the ribbon"],
    products: "Magnesium oxide (2Mg + O₂ → 2MgO)",
    explanation: "Magnesium combines with oxygen from the air. The white oxide is a brand-new compound and the change cannot be undone by cooling.",
    startColor: "hsl(0 0% 70%)",
    endColor: "hsl(0 0% 99%)",
  },
  rusting: {
    label: "Rusting iron",
    icon: "🔩",
    reversible: false,
    type: "Chemical (permanent)",
    startState: "Clean iron nail",
    endState: "Flaky red-brown rust",
    observations: ["Slow reddish-brown coating forms", "Surface becomes rough and flaky", "Needs both water and oxygen"],
    products: "Hydrated iron(III) oxide (rust)",
    explanation: "Iron reacts with oxygen and water to form a new compound. Drying the nail does not remove the rust.",
    startColor: "hsl(210 8% 62%)",
    endColor: "hsl(20 70% 38%)",
  },
  cookingEgg: {
    label: "Cooking an egg",
    icon: "🍳",
    reversible: false,
    type: "Chemical (permanent)",
    startState: "Runny transparent raw egg",
    endState: "Firm white cooked egg",
    observations: ["Clear liquid turns opaque white", "Texture becomes firm and rubbery", "Cooling does not soften it back"],
    products: "Denatured, coagulated protein",
    explanation: "Heat permanently unfolds and joins the protein chains, so the original raw egg cannot be recovered.",
    startColor: "hsl(45 60% 88%)",
    endColor: "hsl(0 0% 98%)",
  },
};

export function ChangesInSubstancesSimulation() {
  const [processKey, setProcessKey] = useState<ProcessKey>("melting");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [verdict, setVerdict] = useState<string | null>(null);

  const proc = PROCESSES[processKey];
  const procRef = useRef(proc);
  useEffect(() => {
    procRef.current = PROCESSES[processKey];
  }, [processKey]);

  useEffect(() => {
    setRunning(false);
    setProgress(0);
    setDirection(1);
    setVerdict(null);
  }, [processKey]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setProgress((p) => {
        const next = p + direction * dt * 0.45;
        if (next >= 1) {
          setRunning(false);
          return 1;
        }
        if (next <= 0) {
          setRunning(false);
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, direction]);

  const runForward = () => {
    setVerdict(null);
    setDirection(1);
    setRunning(true);
  };

  const attemptReverse = () => {
    if (proc.reversible) {
      setVerdict(`Reversed successfully — ${proc.label.toLowerCase()} is a temporary physical change.`);
      setDirection(-1);
      setRunning(true);
    } else {
      setVerdict(`Cannot be reversed — ${proc.products} is a new substance. This is a permanent chemical change.`);
    }
  };

  const reset = () => {
    setRunning(false);
    setProgress(0);
    setDirection(1);
    setVerdict(null);
  };

  const mixColor = progress < 0.5 ? proc.startColor : proc.endColor;
  const stage = progress === 0 ? "start" : progress >= 1 ? "end" : "changing";
  const particleCount = 14;

  return (
    <SimulationLoader simulationName="Temporary and Permanent Changes">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border bg-card overflow-hidden min-w-0">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
            <span className="text-sm font-medium truncate">{proc.icon} {proc.label}</span>
            <Badge variant={proc.reversible ? "secondary" : "destructive"} className="shrink-0">{proc.reversible ? "Reversible" : "Irreversible"}</Badge>
          </div>
          <div className="p-4 space-y-4">
            <svg viewBox="0 0 620 260" className="w-full h-auto rounded-lg bg-muted/40">
              {/* vessel */}
              <path d="M170 40 h280 v150 a30 30 0 0 1 -30 30 h-220 a30 30 0 0 1 -30 -30 z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />
              {/* substance body */}
              <rect x={176} y={196 - 130 * (0.55 + progress * 0.2)} width={268} height={130 * (0.55 + progress * 0.2)} rx={16} fill={mixColor} opacity={0.85} style={{ transition: "fill 300ms linear" }} />
              {/* particles */}
              {Array.from({ length: particleCount }).map((_, i) => {
                const spread = 0.3 + progress * 0.7;
                const cx = 200 + ((i * 37) % 220) + Math.sin(i + progress * 6) * 14 * spread;
                const cy = 180 - ((i % 5) * 22) * spread - progress * 20;
                return <circle key={i} cx={cx} cy={cy} r={5} fill="hsl(var(--foreground) / 0.35)" />;
              })}
              {/* gas / smoke for chemical changes */}
              {!proc.reversible && progress > 0.3 && Array.from({ length: 6 }).map((_, i) => (
                <circle key={`g${i}`} cx={240 + i * 30} cy={40 - progress * 20 + (i % 2) * 10} r={8 + progress * 6} fill="hsl(var(--muted-foreground) / 0.25)" />
              ))}
              {proc.reversible && progress > 0.6 && Array.from({ length: 5 }).map((_, i) => (
                <circle key={`v${i}`} cx={250 + i * 26} cy={46 - progress * 16} r={5} fill="hsl(200 60% 70% / 0.45)" />
              ))}
              {/* burner */}
              <rect x={280} y={228} width={60} height={10} rx={4} fill="hsl(var(--border))" />
              {running && <path d="M310 228 q-12 -18 0 -30 q12 12 0 30" fill="hsl(30 95% 55%)" />}
              <text x={186} y={30} fontSize="12" fill="hsl(var(--muted-foreground))">{stage === "end" ? proc.endState : stage === "start" ? proc.startState : "changing…"}</text>
            </svg>

            <div className="flex items-center gap-3">
              <Progress value={progress * 100} className="flex-1" />
              <span className="text-sm font-mono shrink-0">{Math.round(progress * 100)}%</span>
            </div>

            {verdict && (
              <div className={`rounded-lg border p-3 text-sm ${proc.reversible ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400" : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                {verdict}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3 min-w-0">
                <p className="font-medium mb-1">Observations</p>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  {proc.observations.map((o, i) => <li key={i} className="break-words">• {o}</li>)}
                </ul>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 min-w-0">
                <p className="font-medium mb-1">Classification</p>
                <p className="text-xs text-muted-foreground break-words">{proc.type}</p>
                <p className="text-xs text-muted-foreground mt-1 break-words"><span className="font-medium">Products:</span> {proc.products}</p>
                <p className="text-xs text-muted-foreground mt-1 break-words">{proc.explanation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-5 min-w-0">
          <div>
            <Label className="text-xs mb-2 block">Choose a process</Label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(PROCESSES) as ProcessKey[]).map((k) => (
                <Button key={k} size="sm" variant={processKey === k ? "default" : "outline"} className="justify-start text-xs h-auto py-2 whitespace-normal text-left" onClick={() => setProcessKey(k)}>
                  <span className="mr-2">{PROCESSES[k].icon}</span>{PROCESSES[k].label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full gap-1" onClick={runForward} disabled={running || progress >= 1}><Play className="w-4 h-4" />Run change</Button>
            <Button className="w-full gap-1" variant="secondary" onClick={attemptReverse} disabled={running || progress < 1}><Undo2 className="w-4 h-4" />Attempt to reverse</Button>
            <Button className="w-full gap-1" variant="outline" onClick={reset}><RotateCcw className="w-4 h-4" />Reset</Button>
          </div>
          <p className="text-xs text-muted-foreground">Run the change to completion, then try to reverse it. Physical changes go back; chemical changes do not.</p>
        </div>
      </div>
    </SimulationLoader>
  );
}
