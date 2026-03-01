import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

type Stage = "idle" | "approach" | "acrosome" | "cortical" | "fusion" | "complete";

const stageInfo: Record<Stage, { title: string; description: string }> = {
  idle: { title: "Ready", description: "Press 'Start Fertilization' to begin the simulation. Sperm cells will swim toward the egg in the fallopian tube." },
  approach: { title: "Sperm Approach (Capacitation)", description: "Sperm cells undergo capacitation, gaining the ability to fertilize. They swim toward the egg through the fallopian tube." },
  acrosome: { title: "Acrosome Reaction", description: "The leading sperm releases enzymes from its acrosome cap to digest the zona pellucida (protective layer) surrounding the egg." },
  cortical: { title: "Cortical Reaction", description: "Once one sperm penetrates, the egg releases cortical granules that harden the zona pellucida, blocking all other sperm (polyspermy prevention)." },
  fusion: { title: "Pronuclei Fusion", description: "The sperm and egg nuclei (pronuclei) migrate toward each other and merge, combining genetic material to form a diploid zygote." },
  complete: { title: "Zygote Formed", description: "Fertilization is complete! The zygote will begin dividing as it travels toward the uterus for implantation." },
};

interface Sperm {
  x: number; y: number; speed: number; phase: number; alive: boolean; leading: boolean;
}

export function FertilizationAnimation() {
  const [stage, setStage] = useState<Stage>("idle");
  const [speed, setSpeed] = useState([1]);
  const [molecularView, setMolecularView] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);
  const stageRef = useRef<Stage>("idle");
  const spermRef = useRef<Sperm[]>([]);
  const stageTimeRef = useRef(0);
  const speedRef = useRef(1);
  const molecularRef = useRef(false);

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { speedRef.current = speed[0]; }, [speed]);
  useEffect(() => { molecularRef.current = molecularView; }, [molecularView]);

  const initSperm = useCallback(() => {
    const sperms: Sperm[] = [];
    for (let i = 0; i < 10; i++) {
      sperms.push({
        x: 0.05 + Math.random() * 0.15,
        y: 0.35 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        alive: true,
        leading: i === 0,
      });
    }
    spermRef.current = sperms;
  }, []);

  const reset = () => {
    setStage("idle");
    stageTimeRef.current = 0;
    timeRef.current = 0;
    initSperm();
  };

  const startFertilization = () => {
    initSperm();
    stageTimeRef.current = 0;
    setStage("approach");
  };

  useEffect(() => {
    initSperm();
  }, [initSperm]);

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

    const eggX = 0.65, eggY = 0.5, eggR = 0.08;

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const dt = 0.016 * speedRef.current;
      timeRef.current += dt;
      stageTimeRef.current += dt;
      const t = timeRef.current;
      const currentStage = stageRef.current;
      const showMol = molecularRef.current;

      // Fallopian tube background
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "hsl(350, 40%, 25%)");
      gradient.addColorStop(1, "hsl(330, 50%, 30%)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.25);
      ctx.quadraticCurveTo(w * 0.3, h * 0.2, w * 0.5, h * 0.25);
      ctx.quadraticCurveTo(w * 0.7, h * 0.3, w, h * 0.35);
      ctx.lineTo(w, h * 0.65);
      ctx.quadraticCurveTo(w * 0.7, h * 0.7, w * 0.5, h * 0.75);
      ctx.quadraticCurveTo(w * 0.3, h * 0.8, 0, h * 0.75);
      ctx.closePath();
      ctx.fill();

      // Tube wall texture (cilia)
      ctx.strokeStyle = "hsl(350, 30%, 35%)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const cx = (i / 30) * w;
        const topY = h * (0.25 + Math.sin(cx / w * Math.PI) * 0.05);
        const sway = Math.sin(t * 3 + i * 0.5) * 3;
        ctx.beginPath();
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx + sway, topY + 8);
        ctx.stroke();
      }

      // Zona pellucida
      const zonaColor = currentStage === "cortical" || currentStage === "fusion" || currentStage === "complete"
        ? "hsl(45, 70%, 55%)" : "hsl(45, 40%, 40%)";
      ctx.beginPath();
      ctx.arc(eggX * w, eggY * h, (eggR + 0.015) * w, 0, Math.PI * 2);
      ctx.strokeStyle = zonaColor;
      ctx.lineWidth = currentStage === "cortical" ? 4 : 2;
      ctx.setLineDash(showMol ? [] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Egg
      let eggColor = "hsl(330, 60%, 65%)";
      if (currentStage === "cortical") eggColor = "hsl(330, 70%, 75%)";
      if (currentStage === "fusion" || currentStage === "complete") eggColor = "hsl(280, 50%, 65%)";

      // Glow during acrosome/cortical
      if (currentStage === "acrosome" || currentStage === "cortical") {
        ctx.shadowColor = "hsl(45, 100%, 70%)";
        ctx.shadowBlur = 20 + Math.sin(t * 6) * 10;
      }
      ctx.beginPath();
      ctx.arc(eggX * w, eggY * h, eggR * w, 0, Math.PI * 2);
      ctx.fillStyle = eggColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Nucleus inside egg
      if (currentStage === "fusion") {
        const merge = Math.min(stageTimeRef.current / 3, 1);
        // Female pronucleus
        ctx.beginPath();
        ctx.arc(eggX * w - (1 - merge) * 12, eggY * h, 6, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(330, 80%, 50%)";
        ctx.fill();
        // Male pronucleus
        ctx.beginPath();
        ctx.arc(eggX * w + (1 - merge) * 12, eggY * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(200, 80%, 50%)";
        ctx.fill();
      } else if (currentStage === "complete") {
        ctx.beginPath();
        ctx.arc(eggX * w, eggY * h, 8, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(260, 60%, 55%)";
        ctx.fill();
        ctx.fillStyle = "hsl(0, 0%, 95%)";
        ctx.font = "bold 8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("2n", eggX * w, eggY * h + 3);
      } else {
        ctx.beginPath();
        ctx.arc(eggX * w, eggY * h, 6, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(330, 40%, 40%)";
        ctx.fill();
      }

      // Sperm
      if (currentStage !== "idle") {
        spermRef.current.forEach((s) => {
          if (!s.alive && !s.leading) return;

          if (currentStage === "approach") {
            s.x += s.speed * dt * 0.12;
            s.y += Math.sin(t * 4 + s.phase) * dt * 0.02;
            if (s.leading && s.x > eggX - eggR - 0.03) {
              setStage("acrosome");
              stageTimeRef.current = 0;
            }
          } else if (currentStage === "acrosome") {
            if (s.leading) {
              s.x += dt * 0.03;
              if (stageTimeRef.current > 2.5) {
                setStage("cortical");
                stageTimeRef.current = 0;
              }
            } else {
              s.x += s.speed * dt * 0.05;
              s.y += Math.sin(t * 4 + s.phase) * dt * 0.02;
            }
          } else if (currentStage === "cortical") {
            if (s.leading) {
              s.x = eggX;
              s.y = eggY;
            } else {
              // Bounce away
              const dx = s.x - eggX, dy = s.y - eggY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.15) {
                s.x += (dx / dist) * dt * 0.15;
                s.y += (dy / dist) * dt * 0.15;
              }
              s.alive = false;
            }
            if (stageTimeRef.current > 2) {
              setStage("fusion");
              stageTimeRef.current = 0;
            }
          } else if (currentStage === "fusion") {
            if (s.leading) { s.x = eggX; s.y = eggY; }
            if (stageTimeRef.current > 3.5) {
              setStage("complete");
              stageTimeRef.current = 0;
            }
          }

          if (!s.leading || (currentStage !== "cortical" && currentStage !== "fusion" && currentStage !== "complete")) {
            const sx = s.x * w, sy = s.y * h;
            // Head
            ctx.beginPath();
            ctx.ellipse(sx, sy, 4, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = s.leading ? "hsl(200, 100%, 70%)" : "hsl(200, 60%, 55%)";
            ctx.fill();
            // Tail
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(sx - 4, sy);
            const wiggle = Math.sin(t * 10 + s.phase) * 4;
            ctx.quadraticCurveTo(sx - 10, sy + wiggle, sx - 18, sy + wiggle * 0.5);
            ctx.stroke();
          }

          // Acrosome enzyme particles
          if (showMol && currentStage === "acrosome" && s.leading) {
            for (let p = 0; p < 8; p++) {
              const px = s.x * w + 6 + Math.cos(t * 5 + p) * (5 + stageTimeRef.current * 4);
              const py = s.y * h + Math.sin(t * 5 + p) * (5 + stageTimeRef.current * 4);
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = "hsl(60, 100%, 70%)";
              ctx.globalAlpha = 0.7;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        });
      }

      // Molecular view labels
      if (showMol) {
        ctx.fillStyle = "hsl(0, 0%, 90%)";
        ctx.font = "9px system-ui";
        ctx.textAlign = "left";
        ctx.fillText("Zona Pellucida", (eggX + eggR + 0.02) * w, (eggY - 0.04) * h);
        ctx.fillText("Egg (Ovum)", (eggX + eggR + 0.02) * w, (eggY + 0.02) * h);
        if (currentStage === "acrosome") {
          ctx.fillText("Acrosome enzymes →", 0.35 * w, 0.38 * h);
        }
        if (currentStage === "cortical") {
          ctx.fillText("Cortical granules hardening zona", (eggX - 0.15) * w, (eggY + eggR + 0.06) * h);
        }
        if (currentStage === "fusion") {
          ctx.fillText("♀ Pronucleus", (eggX - 0.12) * w, (eggY - 0.02) * h);
          ctx.fillText("♂ Pronucleus", (eggX + 0.04) * w, (eggY - 0.02) * h);
        }
      }

      // Stage label on canvas
      ctx.fillStyle = "hsl(0, 0%, 90%)";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(stageInfo[currentStage].title, 10, 18);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4 mt-4">
      <Card className="border-primary/30">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            🧬 Fertilization Animation
            <Badge variant="secondary">Female</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <canvas
            ref={canvasRef}
            className="w-full h-[280px] rounded-lg bg-muted/30"
            style={{ display: "block" }}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm" onClick={startFertilization} disabled={stage !== "idle" && stage !== "complete"}>
                  {stage === "complete" ? "Restart" : "Start Fertilization"}
                </Button>
                <Button size="sm" variant="outline" onClick={reset}>Reset</Button>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Speed</span>
                  <span className="font-mono">{speed[0].toFixed(1)}x</span>
                </div>
                <Slider min={0.5} max={3} step={0.5} value={speed} onValueChange={setSpeed} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={molecularView} onCheckedChange={setMolecularView} />
                <span className="text-sm">Molecular View</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-3">
                <p className="font-semibold text-sm mb-1">{stageInfo[stage].title}</p>
                <p className="text-xs text-muted-foreground">{stageInfo[stage].description}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
