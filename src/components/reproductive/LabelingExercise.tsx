import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface LabelTarget {
  id: string;
  name: string;
  x: number;
  y: number;
}

const maleTargets: LabelTarget[] = [
  { id: "testes", name: "Testes", x: 0.42, y: 0.75 },
  { id: "epididymis", name: "Epididymis", x: 0.62, y: 0.72 },
  { id: "vas-deferens", name: "Vas Deferens", x: 0.58, y: 0.45 },
  { id: "seminal-vesicle", name: "Seminal Vesicle", x: 0.68, y: 0.35 },
  { id: "prostate", name: "Prostate Gland", x: 0.42, y: 0.42 },
  { id: "urethra", name: "Urethra", x: 0.44, y: 0.55 },
  { id: "penis", name: "Penis", x: 0.28, y: 0.65 },
];

const femaleTargets: LabelTarget[] = [
  { id: "ovaries", name: "Ovaries", x: 0.25, y: 0.4 },
  { id: "fallopian", name: "Fallopian Tubes", x: 0.22, y: 0.28 },
  { id: "uterus", name: "Uterus", x: 0.5, y: 0.45 },
  { id: "cervix", name: "Cervix", x: 0.5, y: 0.65 },
  { id: "vagina", name: "Vagina", x: 0.5, y: 0.78 },
  { id: "ovary-right", name: "Ovary (Right)", x: 0.75, y: 0.4 },
  { id: "fallopian-right", name: "Fallopian Tube (R)", x: 0.72, y: 0.28 },
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
  const [dragging, setDragging] = useState<string | null>(null);
  const [touchDrag, setTouchDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const correctCount = Object.entries(placed).filter(([targetId, labelId]) => targetId === labelId).length;
  const allCorrect = correctCount === targets.length;

  useEffect(() => {
    setBank(shuffle(targets));
    setPlaced({});
    setIncorrect(null);
  }, [system]);

  const resetExercise = () => {
    setBank(shuffle(targets));
    setPlaced({});
    setIncorrect(null);
  };

  const handleDrop = (targetId: string, labelId: string) => {
    if (targetId === labelId) {
      setPlaced(p => ({ ...p, [targetId]: labelId }));
      setBank(b => b.filter(l => l.id !== labelId));
      setIncorrect(null);
    } else {
      setIncorrect(targetId);
      setTimeout(() => setIncorrect(null), 800);
    }
    setDragging(null);
  };

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchDrag({ id, x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDrag) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchDrag(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null);
  };

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchDrag || !containerRef.current) return;
    e.preventDefault();
    const dropElements = document.elementsFromPoint(touchDrag.x, touchDrag.y);
    const dropZone = dropElements.find(el => el.getAttribute("data-target-id"));
    if (dropZone) {
      const targetId = dropZone.getAttribute("data-target-id")!;
      handleDrop(targetId, touchDrag.id);
    }
    setTouchDrag(null);
  }, [touchDrag]);

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

        {/* Diagram area with drop targets */}
        <div
          ref={containerRef}
          className="relative w-full h-[350px] bg-muted/30 rounded-lg overflow-hidden"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Body outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-4/5 border-2 border-muted-foreground/20 rounded-full" />
          </div>

          {/* Drop targets */}
          {targets.map(target => {
            const isPlaced = placed[target.id] === target.id;
            const isWrong = incorrect === target.id;
            return (
              <div
                key={target.id}
                data-target-id={target.id}
                className={`absolute flex items-center justify-center rounded-md border-2 border-dashed text-xs px-2 py-1 transition-all duration-300 min-w-[80px] text-center ${
                  isPlaced
                    ? "border-green-500 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-solid"
                    : isWrong
                      ? "border-red-500 bg-red-100 dark:bg-red-900/40 animate-pulse"
                      : "border-muted-foreground/40 bg-background/60"
                }`}
                style={{
                  left: `${target.x * 100}%`,
                  top: `${target.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDrop={e => {
                  e.preventDefault();
                  const labelId = e.dataTransfer.getData("text/plain");
                  handleDrop(target.id, labelId);
                }}
              >
                {isPlaced ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {target.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">?</span>
                )}
              </div>
            );
          })}

          {/* Connecting lines from center */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {targets.map(target => (
              <line
                key={target.id}
                x1="50" y1="50"
                x2={target.x * 100} y2={target.y * 100}
                stroke="currentColor"
                className="text-muted-foreground/15"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            ))}
          </svg>

          {/* Touch drag ghost */}
          {touchDrag && (
            <div
              className="fixed z-50 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg pointer-events-none"
              style={{ left: touchDrag.x - 40, top: touchDrag.y - 15 }}
            >
              {targets.find(t => t.id === touchDrag.id)?.name}
            </div>
          )}
        </div>

        {/* Label bank */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Drag labels to the correct positions:</p>
          <div className="flex flex-wrap gap-2">
            {bank.map(label => (
              <div
                key={label.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData("text/plain", label.id);
                  setDragging(label.id);
                }}
                onDragEnd={() => setDragging(null)}
                onTouchStart={e => handleTouchStart(label.id, e)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-all ${
                  dragging === label.id
                    ? "opacity-50 scale-95"
                    : "bg-primary/10 border-primary/30 hover:bg-primary/20"
                }`}
              >
                {label.name}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
