import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, Flame, RotateCcw, ShieldAlert } from "lucide-react";

type FuelId = "wood" | "petrol" | "electrical" | "metal" | "oil";
type AgentId = "water" | "foam" | "co2" | "powder" | "wetchem" | "blanket";
type Verdict = "extinguished" | "ineffective" | "dangerous";

interface Fuel {
  id: FuelId;
  label: string;
  fireClass: string;
  emoji: string;
  detail: string;
}

interface Agent {
  id: AgentId;
  label: string;
  emoji: string;
  removes: "heat" | "oxygen" | "fuel";
}

const FUELS: Fuel[] = [
  { id: "wood", label: "Wood & paper", fireClass: "Class A", emoji: "🪵", detail: "Ordinary solid combustibles that leave glowing embers." },
  { id: "petrol", label: "Petrol & solvent", fireClass: "Class B", emoji: "🛢️", detail: "Flammable liquids that float and spread on water." },
  { id: "electrical", label: "Live electrical equipment", fireClass: "Class C (electrical)", emoji: "🔌", detail: "Energised wiring or appliances — conducting agents are lethal." },
  { id: "metal", label: "Reactive metal", fireClass: "Class D", emoji: "⚙️", detail: "Magnesium, sodium or aluminium swarf that reacts violently with water." },
  { id: "oil", label: "Hot cooking oil", fireClass: "Class F / K", emoji: "🍳", detail: "Deep-fat fires far above the boiling point of water." },
];

const AGENTS: Agent[] = [
  { id: "water", label: "Water", emoji: "💧", removes: "heat" },
  { id: "foam", label: "Foam", emoji: "🫧", removes: "oxygen" },
  { id: "co2", label: "Carbon dioxide", emoji: "💨", removes: "oxygen" },
  { id: "powder", label: "Dry powder", emoji: "🧂", removes: "fuel" },
  { id: "wetchem", label: "Wet chemical", emoji: "🧴", removes: "heat" },
  { id: "blanket", label: "Fire blanket", emoji: "🧣", removes: "oxygen" },
];

const OUTCOMES: Record<FuelId, Partial<Record<AgentId, { verdict: Verdict; reason: string }>>> = {
  wood: {
    water: { verdict: "extinguished", reason: "Water cools the embers below their ignition temperature — the correct agent for Class A." },
    foam: { verdict: "extinguished", reason: "Foam both cools and seals the surface, so Class A fires go out." },
    co2: { verdict: "ineffective", reason: "CO₂ displaces oxygen briefly but does not cool deep-seated embers, so the fire re-ignites." },
    powder: { verdict: "extinguished", reason: "Dry powder interrupts the chemical chain reaction and knocks the flames down." },
    wetchem: { verdict: "ineffective", reason: "Wet chemical is formulated for cooking oils; on embers it is a poor substitute for water." },
    blanket: { verdict: "ineffective", reason: "A blanket cannot smother a spreading solid-fuel fire and will burn through." },
  },
  petrol: {
    water: { verdict: "dangerous", reason: "Petrol floats on water — the jet spreads burning liquid across the floor." },
    foam: { verdict: "extinguished", reason: "Foam blankets the liquid surface and cuts off the oxygen supply — the correct agent for Class B." },
    co2: { verdict: "extinguished", reason: "CO₂ smothers the vapour above the liquid without splashing it." },
    powder: { verdict: "extinguished", reason: "Dry powder breaks the flame chain reaction very quickly." },
    wetchem: { verdict: "ineffective", reason: "Wet chemical saponifies cooking fat; on petrol it gives no lasting seal." },
    blanket: { verdict: "ineffective", reason: "A blanket cannot seal a running liquid fire." },
  },
  electrical: {
    water: { verdict: "dangerous", reason: "Water conducts electricity — the stream becomes a path for current back to you. Electrocution risk." },
    foam: { verdict: "dangerous", reason: "Foam is water-based and conductive; never use it on live equipment." },
    co2: { verdict: "extinguished", reason: "CO₂ is non-conductive and leaves no residue — the correct agent for live electrical fires." },
    powder: { verdict: "extinguished", reason: "Dry powder is non-conductive and effective, though it contaminates electronics." },
    wetchem: { verdict: "dangerous", reason: "Wet chemical is a conductive solution — unsafe on energised equipment." },
    blanket: { verdict: "ineffective", reason: "A blanket does not isolate the electrical supply; the fault keeps re-igniting." },
  },
  metal: {
    water: { verdict: "dangerous", reason: "Burning metal splits water into hydrogen — an explosive reaction." },
    foam: { verdict: "dangerous", reason: "Foam is mostly water, so it reacts violently with the burning metal." },
    co2: { verdict: "ineffective", reason: "Reactive metals strip oxygen from CO₂ and keep burning." },
    powder: { verdict: "extinguished", reason: "A special Class D powder (graphite or sodium chloride based) crusts over the metal and smothers it." },
    wetchem: { verdict: "dangerous", reason: "Any water-based agent reacts explosively with burning metal." },
    blanket: { verdict: "ineffective", reason: "Metal fires burn far too hot for a blanket to contain." },
  },
  oil: {
    water: { verdict: "dangerous", reason: "Water sinks, flashes to steam and erupts — a fireball that can reach the ceiling." },
    foam: { verdict: "ineffective", reason: "Standard foam breaks down at deep-fat temperatures and the oil re-ignites." },
    co2: { verdict: "ineffective", reason: "The oil stays above its auto-ignition temperature, so it flares again once the gas clears." },
    powder: { verdict: "ineffective", reason: "Powder knocks the flame down but the oil is still hot enough to re-ignite." },
    wetchem: { verdict: "extinguished", reason: "Wet chemical cools the oil and saponifies it into a soapy crust — the correct agent for Class F/K." },
    blanket: { verdict: "extinguished", reason: "A fire blanket laid over the pan cuts off oxygen safely — the classroom and kitchen answer." },
  },
};

const CORRECT: Record<FuelId, string> = {
  wood: "Water or foam (cooling)",
  petrol: "Foam, CO₂ or dry powder (smothering)",
  electrical: "CO₂ or dry powder (non-conductive)",
  metal: "Class D dry powder only",
  oil: "Wet chemical or a fire blanket",
};

export function ClassesOfFireSimulation() {
  const [fuelId, setFuelId] = useState<FuelId>("wood");
  const [agentId, setAgentId] = useState<AgentId | null>(null);
  const [ignited, setIgnited] = useState(false);
  const [size, setSize] = useState(45);
  const [ventilation, setVentilation] = useState(50);
  const [intensity, setIntensity] = useState(0);
  const [result, setResult] = useState<{ verdict: Verdict; reason: string } | null>(null);
  const timerRef = useRef<number | null>(null);

  const fuel = useMemo(() => FUELS.find((f) => f.id === fuelId)!, [fuelId]);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const reset = () => {
    stopTimer();
    setIgnited(false);
    setAgentId(null);
    setResult(null);
    setIntensity(0);
  };

  const ignite = () => {
    stopTimer();
    setResult(null);
    setIgnited(true);
    setIntensity(size);
    timerRef.current = window.setInterval(() => {
      setIntensity((prev) => Math.min(100, prev + (0.4 + ventilation / 120)));
    }, 250);
  };

  const apply = () => {
    if (!ignited || !agentId) return;
    const outcome = OUTCOMES[fuelId][agentId] ?? { verdict: "ineffective" as Verdict, reason: "This agent has no effect on this fuel." };
    setResult(outcome);
    stopTimer();

    if (outcome.verdict === "extinguished") {
      timerRef.current = window.setInterval(() => {
        setIntensity((prev) => {
          const next = prev - 6;
          if (next <= 0) { stopTimer(); setIgnited(false); return 0; }
          return next;
        });
      }, 90);
    } else if (outcome.verdict === "dangerous") {
      setIntensity((prev) => Math.min(100, prev + 35));
      timerRef.current = window.setInterval(() => {
        setIntensity((prev) => Math.min(100, prev + 2));
      }, 200);
    } else {
      setIntensity((prev) => Math.max(15, prev - 12));
      timerRef.current = window.setInterval(() => {
        setIntensity((prev) => Math.min(100, prev + 1.5));
      }, 250);
    }
  };

  const removedSide = result?.verdict === "extinguished" ? AGENTS.find((a) => a.id === agentId)?.removes : null;
  const flameScale = 0.35 + (intensity / 100) * 0.9;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Scene */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-muted/60 to-muted">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <rect x="0" y="235" width="400" height="65" fill="hsl(var(--muted-foreground) / 0.15)" />
              {/* fuel base */}
              <g>
                <rect x="150" y="215" width="100" height="22" rx="4" fill="hsl(var(--muted-foreground) / 0.35)" />
                <text x="200" y="232" textAnchor="middle" fontSize="16">{fuel.emoji}</text>
              </g>
              {/* flame */}
              {ignited && intensity > 0 && (
                <g transform={`translate(200 215) scale(${flameScale}) translate(-200 -215)`} style={{ transformOrigin: "200px 215px" }}>
                  <path
                    d="M200 95 C232 140 250 168 250 192 C250 220 228 238 200 238 C172 238 150 220 150 192 C150 168 168 140 200 95 Z"
                    fill={result?.verdict === "dangerous" ? "hsl(0 85% 55%)" : "hsl(25 95% 55%)"}
                    opacity="0.85"
                    className="animate-pulse"
                  />
                  <path
                    d="M200 145 C218 175 228 192 228 206 C228 224 216 234 200 234 C184 234 172 224 172 206 C172 192 182 175 200 145 Z"
                    fill="hsl(48 100% 65%)"
                    opacity="0.95"
                  />
                </g>
              )}
              {/* agent spray */}
              {result && agentId && (
                <g opacity="0.8">
                  <text x="60" y="150" fontSize="22">{AGENTS.find((a) => a.id === agentId)?.emoji}</text>
                  <path d="M85 155 Q135 165 165 185" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeDasharray="8 6" />
                </g>
              )}
            </svg>

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{fuel.fireClass}</Badge>
              <Badge variant="outline" className="bg-background/80">Intensity {Math.round(intensity)}%</Badge>
            </div>
          </div>

          <div className="p-4 border-t flex flex-wrap gap-2">
            <Button onClick={ignite} disabled={ignited} className="gap-2">
              <Flame className="w-4 h-4" /> Ignite fire
            </Button>
            <Button onClick={apply} variant="secondary" disabled={!ignited || !agentId}>
              Apply agent
            </Button>
            <Button onClick={reset} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <Label className="text-sm font-semibold">Fuel type</Label>
            <div className="grid grid-cols-1 gap-2">
              {FUELS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFuelId(f.id); reset(); }}
                  className={`text-left p-2.5 rounded-lg border text-sm transition-colors min-w-0 ${fuelId === f.id ? "border-primary bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <span className="font-medium break-words">{f.emoji} {f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.fireClass}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <Label className="text-sm font-semibold">Extinguishing agent</Label>
            <div className="grid grid-cols-2 gap-2">
              {AGENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAgentId(a.id)}
                  className={`p-2 rounded-lg border text-xs text-center transition-colors min-w-0 ${agentId === a.id ? "border-primary bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <span className="block text-lg">{a.emoji}</span>
                  <span className="break-words">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <Label>Fire size</Label>
                <span className="text-muted-foreground">{size}%</span>
              </div>
              <Slider value={[size]} min={10} max={90} step={5} onValueChange={(v) => setSize(v[0])} disabled={ignited} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <Label>Ventilation / oxygen</Label>
                <span className="text-muted-foreground">{ventilation}%</span>
              </div>
              <Slider value={[ventilation]} min={0} max={100} step={5} onValueChange={(v) => setVentilation(v[0])} />
              <p className="text-xs text-muted-foreground mt-2">More airflow feeds the fire and makes it grow faster.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fire triangle + verdict */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h4 className="font-semibold mb-3">Fire triangle</h4>
          <svg viewBox="0 0 220 180" className="w-full max-w-[260px] mx-auto">
            {[
              { key: "heat", label: "Heat", pts: "110,20 200,160", x: 168, y: 96 },
              { key: "oxygen", label: "Oxygen", pts: "200,160 20,160", x: 110, y: 175 },
              { key: "fuel", label: "Fuel", pts: "20,160 110,20", x: 44, y: 96 },
            ].map((side) => {
              const broken = removedSide === side.key;
              return (
                <g key={side.key}>
                  <polyline
                    points={side.pts}
                    stroke={broken ? "hsl(var(--muted-foreground) / 0.3)" : "hsl(25 95% 55%)"}
                    strokeWidth="6"
                    strokeDasharray={broken ? "10 10" : undefined}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <text x={side.x} y={side.y} textAnchor="middle" fontSize="12" fill="currentColor" className={broken ? "opacity-40" : ""}>
                    {side.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-sm text-muted-foreground mt-2">
            {removedSide
              ? `The agent removed ${removedSide} — the triangle is broken and the fire dies.`
              : "Remove any one side — heat, fuel or oxygen — and the fire goes out."}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h4 className="font-semibold mb-3">Result</h4>
          {!result ? (
            <p className="text-sm text-muted-foreground">Ignite the fire, choose an agent, then apply it to see the outcome.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                {result.verdict === "extinguished" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                {result.verdict === "ineffective" && <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />}
                {result.verdict === "dangerous" && <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="font-medium capitalize break-words">{result.verdict}</p>
                  <p className="text-sm text-muted-foreground break-words">{result.reason}</p>
                </div>
              </div>
              <div className="text-sm p-3 rounded-lg bg-muted/60">
                <span className="font-medium">Correct agent for {fuel.fireClass}: </span>
                <span className="text-muted-foreground">{CORRECT[fuelId]}</span>
              </div>
              <p className="text-xs text-muted-foreground">{fuel.detail} If a fire is large or spreading, evacuate and call for help instead of fighting it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
