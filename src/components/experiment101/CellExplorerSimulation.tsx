import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

type CellType = "plant" | "animal";
type Presence = "both" | "plant";

interface Organelle {
  id: string;
  name: string;
  presence: Presence;
  fn: string;
  /** position within the 0-100 cell box */
  x: number;
  y: number;
}

const ORGANELLES: Organelle[] = [
  { id: "cell-wall", name: "Cell wall", presence: "plant", fn: "Rigid cellulose layer outside the membrane that gives the plant cell its fixed shape and protects it from bursting.", x: 6, y: 12 },
  { id: "membrane", name: "Cell membrane", presence: "both", fn: "Thin, partially permeable boundary that controls which substances enter and leave the cell.", x: 16, y: 30 },
  { id: "nucleus", name: "Nucleus", presence: "both", fn: "Contains the DNA and controls all cell activities, including growth and division.", x: 50, y: 46 },
  { id: "cytoplasm", name: "Cytoplasm", presence: "both", fn: "Jelly-like medium where most chemical reactions of the cell take place and where organelles sit.", x: 30, y: 68 },
  { id: "mitochondrion", name: "Mitochondrion", presence: "both", fn: "Site of aerobic respiration — releases energy from glucose. Its folded inner membrane gives a large surface area.", x: 72, y: 28 },
  { id: "chloroplast", name: "Chloroplast", presence: "plant", fn: "Contains chlorophyll and carries out photosynthesis, converting light energy into glucose.", x: 74, y: 70 },
  { id: "vacuole", name: "Large permanent vacuole", presence: "plant", fn: "Sap-filled sac that keeps the plant cell turgid and stores water, sugars and salts.", x: 44, y: 76 },
  { id: "ribosome", name: "Ribosomes", presence: "both", fn: "Tiny structures that assemble proteins from amino acids following instructions from the nucleus.", x: 24, y: 48 },
  { id: "er", name: "Endoplasmic reticulum", presence: "both", fn: "Network of membranes that transports proteins and lipids through the cell.", x: 62, y: 56 },
];

export function CellExplorerSimulation() {
  const [cellType, setCellType] = useState<CellType>("plant");
  const [magnification, setMagnification] = useState(400);
  const [showLabels, setShowLabels] = useState(true);
  const [compare, setCompare] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("nucleus");

  // labelling challenge
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const visible = useMemo(
    () => ORGANELLES.filter((o) => (cellType === "plant" ? true : o.presence === "both")),
    [cellType]
  );
  const selected = ORGANELLES.find((o) => o.id === selectedId) ?? null;
  const zoom = 0.7 + (magnification / 1000) * 0.6;

  const quizSlots = useMemo(() => visible.slice(0, 6), [visible]);
  const nameBank = useMemo(
    () => [...quizSlots.map((o) => o.name)].sort((a, b) => a.localeCompare(b)),
    [quizSlots]
  );
  const score = quizSlots.reduce((acc, o) => acc + (answers[o.id] === o.name ? 1 : 0), 0);
  const answeredAll = quizSlots.every((o) => answers[o.id]);

  const resetQuiz = () => { setAnswers({}); setActiveSlot(null); };

  const assign = (name: string) => {
    if (!activeSlot) return;
    setAnswers((prev) => ({ ...prev, [activeSlot]: name }));
    setActiveSlot(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Microscope view */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/40 to-muted">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="relative w-full h-full max-w-[520px] transition-transform duration-500"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* cell body */}
                <div
                  className={`absolute inset-[8%] ${cellType === "plant" ? "rounded-md" : "rounded-[45%]"} border-4 transition-all duration-500`}
                  style={{
                    borderColor: cellType === "plant" ? "hsl(140 45% 40%)" : "hsl(280 40% 55%)",
                    background: cellType === "plant"
                      ? "radial-gradient(circle at 60% 40%, hsl(140 45% 40% / 0.18), hsl(140 45% 40% / 0.06))"
                      : "radial-gradient(circle at 60% 40%, hsl(280 40% 55% / 0.18), hsl(280 40% 55% / 0.06))",
                  }}
                >
                  {cellType === "plant" && (
                    <div className="absolute inset-[4%] rounded-sm border-2 border-dashed" style={{ borderColor: "hsl(140 45% 40% / 0.5)" }} />
                  )}

                  {visible.map((o) => {
                    const isSelected = selectedId === o.id;
                    const highlight = compare && o.presence === "plant";
                    const label = quizMode ? (answers[o.id] ?? "?") : o.name;
                    const isSlot = quizMode && quizSlots.some((s) => s.id === o.id);
                    const correct = quizMode && answeredAll && answers[o.id] === o.name;
                    const wrong = quizMode && answeredAll && answers[o.id] && answers[o.id] !== o.name;
                    return (
                      <button
                        key={o.id}
                        onClick={() => (isSlot ? setActiveSlot(o.id) : setSelectedId(o.id))}
                        aria-label={o.name}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${o.x}%`, top: `${o.y}%` }}
                      >
                        <span
                          className={`block rounded-full transition-all ${isSelected || activeSlot === o.id ? "ring-4 ring-primary/40" : ""}`}
                          style={{
                            width: o.id === "nucleus" ? 40 : o.id === "vacuole" ? 34 : 20,
                            height: o.id === "nucleus" ? 40 : o.id === "vacuole" ? 34 : 20,
                            background: highlight
                              ? "hsl(45 90% 55%)"
                              : o.presence === "plant"
                                ? "hsl(140 50% 42%)"
                                : "hsl(var(--primary))",
                            opacity: 0.85,
                          }}
                        />
                        {(showLabels || quizMode) && (
                          <span
                            className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${
                              correct ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                : wrong ? "bg-destructive/15 text-destructive"
                                : "bg-background/90 text-foreground"
                            }`}
                          >
                            {label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">{cellType} cell</Badge>
              <Badge variant="outline" className="bg-background/80">×{magnification}</Badge>
            </div>
          </div>

          <div className="p-4 border-t flex flex-wrap gap-2">
            <Button variant={cellType === "plant" ? "default" : "outline"} size="sm" onClick={() => setCellType("plant")}>Plant cell</Button>
            <Button variant={cellType === "animal" ? "default" : "outline"} size="sm" onClick={() => setCellType("animal")}>Animal cell</Button>
            <Button
              variant={quizMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => { setQuizMode((q) => !q); resetQuiz(); }}
            >
              {quizMode ? "Exit labelling test" : "Start labelling test"}
            </Button>
          </div>
        </div>

        {/* Controls / info */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <Label>Magnification</Label>
                <span className="text-muted-foreground">×{magnification}</span>
              </div>
              <Slider value={[magnification]} min={100} max={1000} step={100} onValueChange={(v) => setMagnification(v[0])} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="cell-labels" className="text-sm">Show labels</Label>
              <Switch id="cell-labels" checked={showLabels} onCheckedChange={setShowLabels} className="shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="cell-compare" className="text-sm">Compare mode</Label>
              <Switch id="cell-compare" checked={compare} onCheckedChange={setCompare} className="shrink-0" />
            </div>
            {compare && (
              <p className="text-xs text-muted-foreground">
                Gold structures are found only in plant cells: cell wall, chloroplast and the large permanent vacuole.
              </p>
            )}
          </div>

          {!quizMode ? (
            <div className="rounded-xl border bg-card p-4">
              <h4 className="font-semibold mb-2 break-words">{selected?.name ?? "Select an organelle"}</h4>
              {selected && (
                <>
                  <Badge variant="outline" className="mb-2">
                    {selected.presence === "both" ? "Plant & animal cells" : "Plant cells only"}
                  </Badge>
                  <p className="text-sm text-muted-foreground break-words">{selected.fn}</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Labelling test</h4>
                <span className="text-sm text-muted-foreground">{score}/{quizSlots.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeSlot ? "Now pick the correct name below." : "Tap a structure in the cell, then choose its name."}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {nameBank.map((name) => (
                  <button
                    key={name}
                    onClick={() => assign(name)}
                    disabled={!activeSlot}
                    className="p-2 rounded-lg border text-sm text-left transition-colors disabled:opacity-50 hover:bg-muted/50 min-w-0 break-words"
                  >
                    {name}
                  </button>
                ))}
              </div>
              {answeredAll && (
                <div className="flex items-start gap-2 text-sm">
                  {score === quizSlots.length
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                  <span className="text-muted-foreground">
                    You scored {score} out of {quizSlots.length}. Green labels are correct, red ones are misplaced.
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={resetQuiz} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset test
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border bg-card p-4 overflow-x-auto">
        <h4 className="font-semibold mb-3">Plant vs animal cell</h4>
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Structure</th>
              <th className="py-2 pr-3 font-medium">Plant</th>
              <th className="py-2 pr-3 font-medium">Animal</th>
              <th className="py-2 font-medium">Function</th>
            </tr>
          </thead>
          <tbody>
            {ORGANELLES.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="py-2 pr-3 font-medium">{o.name}</td>
                <td className="py-2 pr-3">Yes</td>
                <td className="py-2 pr-3">{o.presence === "both" ? "Yes" : "No"}</td>
                <td className="py-2 text-muted-foreground">{o.fn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
