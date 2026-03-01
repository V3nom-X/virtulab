import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface LabelTarget {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

const maleTargets: LabelTarget[] = [
  { id: "bladder", name: "Bladder", x: 50, y: 18 },
  { id: "seminal-vesicle", name: "Seminal Vesicle", x: 73, y: 28 },
  { id: "prostate", name: "Prostate Gland", x: 50, y: 34 },
  { id: "cowpers-gland", name: "Cowper's Gland", x: 50, y: 42 },
  { id: "vas-deferens", name: "Vas Deferens", x: 68, y: 50 },
  { id: "urethra", name: "Urethra", x: 36, y: 55 },
  { id: "penis", name: "Penis", x: 28, y: 72 },
  { id: "testes", name: "Testicle", x: 52, y: 85 },
  { id: "epididymis", name: "Epididymis", x: 62, y: 82 },
  { id: "scrotum", name: "Scrotum", x: 55, y: 95 },
];

const femaleTargets: LabelTarget[] = [
  { id: "fallopian-tube", name: "Fallopian Tube", x: 22, y: 18 },
  { id: "uterine-fundus", name: "Uterine Fundus", x: 50, y: 16 },
  { id: "ovary", name: "Ovary", x: 13, y: 35 },
  { id: "fimbriae", name: "Fimbriae", x: 10, y: 26 },
  { id: "perimetrium", name: "Perimetrium", x: 72, y: 22 },
  { id: "uterus", name: "Uterus", x: 50, y: 42 },
  { id: "endometrium", name: "Endometrium", x: 70, y: 48 },
  { id: "myometrium", name: "Myometrium", x: 72, y: 38 },
  { id: "ovarian-ligament", name: "Ovarian Ligament", x: 25, y: 32 },
  { id: "cervix", name: "Cervix", x: 50, y: 72 },
  { id: "vagina", name: "Vagina", x: 50, y: 88 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LabelingExercise({ system }: { system: "male" | "female" }) {
  const targets = system === "male" ? maleTargets : femaleTargets;
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [incorrect, setIncorrect] = useState<string | null>(null);
  const [bank, setBank] = useState<LabelTarget[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const correctCount = Object.entries(placed).filter(([targetId, labelId]) => targetId === labelId).length;
  const allCorrect = correctCount === targets.length;

  useEffect(() => {
    setBank(shuffle(targets));
    setPlaced({});
    setIncorrect(null);
    setSelectedLabel(null);
  }, [system]);

  const resetExercise = () => {
    setBank(shuffle(targets));
    setPlaced({});
    setIncorrect(null);
    setSelectedLabel(null);
  };

  const handleDrop = useCallback((targetId: string, labelId: string) => {
    if (targetId === labelId) {
      setPlaced(p => ({ ...p, [targetId]: labelId }));
      setBank(b => b.filter(l => l.id !== labelId));
      setIncorrect(null);
    } else {
      setIncorrect(targetId);
      setTimeout(() => setIncorrect(null), 600);
    }
    setSelectedLabel(null);
  }, []);

  // Click-to-place: select label from bank, then click target
  const handleLabelClick = (id: string) => {
    setSelectedLabel(prev => prev === id ? null : id);
  };

  const handleTargetClick = (targetId: string) => {
    if (placed[targetId]) return; // already placed
    if (selectedLabel) {
      handleDrop(targetId, selectedLabel);
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            🏷️ Labeling Exercise
            <Badge variant="secondary">{system === "male" ? "Male" : "Female"}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{correctCount}/{targets.length}</span>
            <Button size="sm" variant="ghost" onClick={resetExercise}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {allCorrect && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <p className="font-semibold text-green-800 dark:text-green-300">🎉 All labels placed correctly!</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {selectedLabel
            ? "Now click the correct position on the diagram below."
            : "Select a label from the bank below, then click the matching target on the diagram. You can also drag labels."}
        </p>

        {/* Label bank - placed ABOVE diagram for better UX */}
        <div className="flex flex-wrap gap-2">
          {bank.map(label => (
            <div
              key={label.id}
              draggable
              onClick={() => handleLabelClick(label.id)}
              onDragStart={e => {
                e.dataTransfer.setData("text/plain", label.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer select-none transition-all ${
                selectedLabel === label.id
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/40 scale-105"
                  : "bg-primary/10 border-primary/30 hover:bg-primary/20"
              }`}
            >
              {label.name}
            </div>
          ))}
          {bank.length === 0 && !allCorrect && (
            <span className="text-xs text-muted-foreground italic">All labels placed!</span>
          )}
        </div>

        {/* Diagram with drop targets */}
        <div
          ref={containerRef}
          className="relative w-full h-[420px] bg-muted/20 rounded-lg overflow-hidden border"
          style={{ background: "hsl(220, 15%, 12%)" }}
        >
          {/* SVG guide lines from center to targets */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {targets.map(target => (
              <line
                key={target.id}
                x1="50" y1="50"
                x2={target.x} y2={target.y}
                stroke="hsl(0, 0%, 30%)"
                strokeWidth="0.15"
                strokeDasharray="0.5,0.5"
              />
            ))}
          </svg>

          {/* Drop targets */}
          {targets.map(target => {
            const isPlaced = placed[target.id] === target.id;
            const isWrong = incorrect === target.id;
            return (
              <div
                key={target.id}
                data-target-id={target.id}
                onClick={() => handleTargetClick(target.id)}
                className={`absolute flex items-center justify-center rounded-md border-2 text-xs px-2 py-1 transition-all duration-200 min-w-[70px] text-center cursor-pointer ${
                  isPlaced
                    ? "border-green-500 bg-green-500/20 text-green-300 border-solid"
                    : isWrong
                      ? "border-red-500 bg-red-500/20 text-red-300 animate-pulse"
                      : selectedLabel
                        ? "border-primary/60 bg-primary/10 border-dashed hover:bg-primary/20 hover:border-primary"
                        : "border-muted-foreground/30 bg-background/30 border-dashed"
                }`}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDrop={e => {
                  e.preventDefault();
                  const labelId = e.dataTransfer.getData("text/plain");
                  if (labelId) handleDrop(target.id, labelId);
                }}
              >
                {isPlaced ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> {target.name}
                  </span>
                ) : isWrong ? (
                  <span className="text-red-400">✗</span>
                ) : (
                  <span className="text-muted-foreground/60">?</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
