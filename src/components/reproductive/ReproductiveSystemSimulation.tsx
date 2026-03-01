import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Organ {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const maleOrgans: Organ[] = [
  { id: "testes", name: "Testes", description: "Produce sperm (spermatogenesis) and secrete testosterone.", x: 0.42, y: 0.75, w: 0.16, h: 0.12, color: "hsl(200, 60%, 50%)" },
  { id: "epididymis", name: "Epididymis", description: "Coiled tube where sperm matures and is stored.", x: 0.58, y: 0.72, w: 0.08, h: 0.08, color: "hsl(160, 60%, 45%)" },
  { id: "vas-deferens", name: "Vas Deferens", description: "Transports mature sperm from epididymis to urethra during ejaculation.", x: 0.55, y: 0.45, w: 0.06, h: 0.25, color: "hsl(30, 70%, 50%)" },
  { id: "seminal-vesicle", name: "Seminal Vesicle", description: "Secretes fructose-rich fluid that nourishes sperm and aids mobility.", x: 0.62, y: 0.35, w: 0.12, h: 0.1, color: "hsl(280, 50%, 55%)" },
  { id: "prostate", name: "Prostate Gland", description: "Produces alkaline fluid that forms part of semen, protecting sperm.", x: 0.42, y: 0.42, w: 0.14, h: 0.08, color: "hsl(340, 50%, 50%)" },
  { id: "urethra", name: "Urethra", description: "Shared passage for urine and semen (at different times).", x: 0.44, y: 0.52, w: 0.05, h: 0.2, color: "hsl(45, 70%, 50%)" },
  { id: "penis", name: "Penis", description: "Delivers semen into the female reproductive tract.", x: 0.3, y: 0.6, w: 0.12, h: 0.2, color: "hsl(15, 60%, 55%)" },
];

const femaleOrgans: Organ[] = [
  { id: "ovaries", name: "Ovaries", description: "Produce eggs (ova) and secrete estrogen and progesterone.", x: 0.25, y: 0.4, w: 0.1, h: 0.08, color: "hsl(330, 60%, 55%)" },
  { id: "ovary-right", name: "Ovary (Right)", description: "One of two ovaries that alternately release eggs during ovulation.", x: 0.65, y: 0.4, w: 0.1, h: 0.08, color: "hsl(330, 60%, 55%)" },
  { id: "fallopian-left", name: "Fallopian Tube (Left)", description: "Transports egg from ovary to uterus; usual site of fertilization.", x: 0.2, y: 0.3, w: 0.2, h: 0.06, color: "hsl(280, 50%, 55%)" },
  { id: "fallopian-right", name: "Fallopian Tube (Right)", description: "Lined with cilia that move the egg toward the uterus.", x: 0.6, y: 0.3, w: 0.2, h: 0.06, color: "hsl(280, 50%, 55%)" },
  { id: "uterus", name: "Uterus", description: "Muscular organ where fertilized egg implants and fetus develops. Endometrium thickens each cycle.", x: 0.35, y: 0.4, w: 0.3, h: 0.25, color: "hsl(350, 60%, 50%)" },
  { id: "cervix", name: "Cervix", description: "Lower narrow part of uterus opening into vagina. Gateway that protects from infection.", x: 0.43, y: 0.65, w: 0.14, h: 0.06, color: "hsl(0, 50%, 45%)" },
  { id: "vagina", name: "Vagina", description: "Muscular canal; birth canal and receives semen during intercourse.", x: 0.44, y: 0.72, w: 0.12, h: 0.15, color: "hsl(10, 50%, 50%)" },
];

export function ReproductiveSystemSimulation({ system }: { system: "male" | "female" }) {
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [showPathway, setShowPathway] = useState(false);
  const [showMicroscopic, setShowMicroscopic] = useState(false);
  const [cycleDay, setCycleDay] = useState(14);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const organs = system === "male" ? maleOrgans : femaleOrgans;

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

      // Background body outline
      ctx.fillStyle = "hsl(220, 15%, 15%)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.4, h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(220, 15%, 25%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw organs
      organs.forEach(organ => {
        const ox = organ.x * w, oy = organ.y * h;
        const ow = organ.w * w, oh = organ.h * h;

        const isSelected = selectedOrgan?.id === organ.id;

        if (isSelected) {
          ctx.shadowColor = organ.color;
          ctx.shadowBlur = 15;
        }

        ctx.fillStyle = isSelected ? organ.color : organ.color.replace("50%", "35%").replace("55%", "40%").replace("45%", "30%");
        ctx.globalAlpha = isSelected ? 1 : 0.7;

        if (organ.id.includes("fallopian")) {
          // Draw as curved tube
          ctx.beginPath();
          ctx.ellipse(ox + ow / 2, oy + oh / 2, ow / 2, oh / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (organ.id === "uterus") {
          // Draw as triangle/pear shape
          ctx.beginPath();
          ctx.moveTo(ox + ow / 2, oy);
          ctx.quadraticCurveTo(ox + ow, oy + oh * 0.3, ox + ow * 0.7, oy + oh);
          ctx.lineTo(ox + ow * 0.3, oy + oh);
          ctx.quadraticCurveTo(ox, oy + oh * 0.3, ox + ow / 2, oy);
          ctx.fill();

          // Endometrium thickness based on cycle day (for female)
          if (system === "female") {
            const thickness = cycleDay <= 5 ? 0.1 : cycleDay <= 14 ? 0.1 + (cycleDay - 5) * 0.05 : 0.55 - (cycleDay - 14) * 0.02;
            ctx.fillStyle = `hsl(350, 70%, ${40 + thickness * 30}%)`;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(ox + ow * 0.35, oy + oh * 0.3);
            ctx.quadraticCurveTo(ox + ow / 2, oy + oh * (0.3 + thickness * 0.5), ox + ow * 0.65, oy + oh * 0.3);
            ctx.fill();
          }
        } else {
          // Draw as rounded rect
          ctx.beginPath();
          ctx.roundRect(ox, oy, ow, oh, 8);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = "hsl(0, 0%, 95%)";
        ctx.font = `${isSelected ? "bold " : ""}10px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(organ.name, ox + ow / 2, oy - 5);
      });

      // Animated pathway
      if (showPathway) {
        const pathPoints = system === "male"
          ? [
            { x: 0.5, y: 0.75 }, { x: 0.6, y: 0.72 }, { x: 0.57, y: 0.55 },
            { x: 0.55, y: 0.45 }, { x: 0.49, y: 0.42 }, { x: 0.46, y: 0.55 }, { x: 0.36, y: 0.7 }
          ]
          : [
            { x: 0.3, y: 0.44 }, { x: 0.3, y: 0.33 }, { x: 0.4, y: 0.33 },
            { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.55 }, { x: 0.5, y: 0.65 }
          ];

        ctx.strokeStyle = "hsl(45, 90%, 60%)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        pathPoints.forEach((p, i) => {
          const px = p.x * w, py = p.y * h;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated gamete
        const prog = (timeRef.current * 0.15) % 1;
        const idx = Math.floor(prog * (pathPoints.length - 1));
        const t = (prog * (pathPoints.length - 1)) - idx;
        const p1 = pathPoints[idx], p2 = pathPoints[Math.min(idx + 1, pathPoints.length - 1)];
        const gx = (p1.x + (p2.x - p1.x) * t) * w;
        const gy = (p1.y + (p2.y - p1.y) * t) * h;

        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.fillStyle = system === "male" ? "hsl(200, 100%, 70%)" : "hsl(330, 80%, 65%)";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tail for sperm
        if (system === "male") {
          ctx.strokeStyle = "hsl(200, 100%, 70%)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + 8 * Math.sin(timeRef.current * 8), gy + 5, gx + 3, gy + 12);
          ctx.stroke();
        }
      }

      // Microscopic view overlay
      if (showMicroscopic) {
        ctx.fillStyle = "hsl(220, 15%, 10% / 0.8)";
        ctx.fillRect(w * 0.6, h * 0.02, w * 0.38, h * 0.35);
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.6, h * 0.02, w * 0.38, h * 0.35);

        ctx.fillStyle = "hsl(var(--foreground))";
        ctx.font = "bold 11px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(system === "male" ? "Spermatogenesis" : "Oogenesis", w * 0.79, h * 0.07);

        // Animated cells
        const cellCount = 6;
        for (let i = 0; i < cellCount; i++) {
          const cx = w * 0.65 + (i % 3) * w * 0.1;
          const cy = h * 0.12 + Math.floor(i / 3) * h * 0.1;
          const pulse = 1 + Math.sin(timeRef.current * 2 + i) * 0.1;

          ctx.beginPath();
          ctx.arc(cx, cy, 8 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = system === "male" ? `hsl(200, ${50 + i * 8}%, ${50 + i * 5}%)` : `hsl(330, ${50 + i * 8}%, ${50 + i * 5}%)`;
          ctx.fill();

          // nucleus
          ctx.beginPath();
          ctx.arc(cx, cy, 3 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = "hsl(220, 20%, 20%)";
          ctx.fill();
        }

        const stages = system === "male"
          ? ["Spermatogonia", "1° Spermatocyte", "2° Spermatocyte", "Spermatid", "Mature Sperm", "Released"]
          : ["Oogonia", "1° Oocyte", "2° Oocyte", "Mature Ovum", "Released", "Polar Body"];

        ctx.font = "8px system-ui";
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        for (let i = 0; i < cellCount; i++) {
          const cx = w * 0.65 + (i % 3) * w * 0.1;
          const cy = h * 0.12 + Math.floor(i / 3) * h * 0.1 + 16;
          ctx.fillText(stages[i], cx, cy);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [system, selectedOrgan, showPathway, showMicroscopic, cycleDay, organs]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const clicked = organs.find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h);
    setSelectedOrgan(clicked || null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-[350px] rounded-lg bg-muted/30 cursor-pointer"
            style={{ display: "block" }}
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Controls</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={showPathway} onCheckedChange={setShowPathway} />
              <span className="text-sm">
                {system === "male" ? "Show Sperm Pathway" : "Show Egg Pathway"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showMicroscopic} onCheckedChange={setShowMicroscopic} />
              <span className="text-sm">Microscopic View</span>
            </div>
            {system === "female" && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Menstrual Cycle Day</span>
                  <span className="font-mono">Day {cycleDay}</span>
                </div>
                <input
                  type="range" min={1} max={28} value={cycleDay}
                  onChange={e => setCycleDay(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {cycleDay <= 5 ? "Menstruation phase" : cycleDay <= 13 ? "Follicular phase" : cycleDay === 14 ? "Ovulation" : "Luteal phase"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">
              {selectedOrgan ? selectedOrgan.name : "Click an organ to learn more"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {selectedOrgan ? (
              <div className="space-y-2">
                <Badge variant="secondary">{system === "male" ? "Male" : "Female"} System</Badge>
                <p className="text-sm text-muted-foreground">{selectedOrgan.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on any organ in the diagram to view its name, function, and key characteristics.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
