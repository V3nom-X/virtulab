import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** pH of 25 mL 0.10 M HCl after adding v mL of 0.10 M NaOH. */
export function titrationPH(v: number): number {
  const acid = 0.0025; // mol
  const base = 0.1 * (v / 1000);
  const total = (25 + v) / 1000;
  if (Math.abs(acid - base) < 1e-9) return 7;
  if (acid > base) return -Math.log10((acid - base) / total);
  return 14 + Math.log10((base - acid) / total);
}

export function pendulumPeriod(lengthM: number, g = 9.8) {
  return 2 * Math.PI * Math.sqrt(lengthM / g);
}

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, reduce ? 0 : (now - start) / 1000);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const hsl = (v: string, a = 1) => `hsl(${css(v)} / ${a})`;

function Titration() {
  const [vol, setVol] = useState(0);
  const ph = titrationPH(vol);
  const pink = ph > 8.2;
  const ref = useCanvas((ctx, w, h, t) => {
    const cx = w * 0.3;
    ctx.strokeStyle = hsl("--foreground", 0.7);
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 8, 10, 16, h * 0.45);
    const level = (1 - vol / 50) * h * 0.45;
    ctx.fillStyle = hsl("--primary", 0.25);
    ctx.fillRect(cx - 7, 10 + (h * 0.45 - level), 14, level);
    const dropY = 10 + h * 0.45 + ((t * 120) % 60);
    if (vol > 0 && vol < 50) { ctx.beginPath(); ctx.arc(cx, dropY, 3, 0, 7); ctx.fill(); }
    ctx.beginPath();
    ctx.moveTo(cx - 20, h * 0.65); ctx.lineTo(cx - 50, h - 10); ctx.lineTo(cx + 50, h - 10); ctx.lineTo(cx + 20, h * 0.65);
    ctx.stroke();
    ctx.fillStyle = pink ? "hsl(330 80% 70% / 0.7)" : hsl("--muted-foreground", 0.15);
    ctx.beginPath(); ctx.moveTo(cx - 38, h * 0.8); ctx.lineTo(cx - 50, h - 10); ctx.lineTo(cx + 50, h - 10); ctx.lineTo(cx + 38, h * 0.8); ctx.fill();
    // pH curve
    const gx = w * 0.55, gw = w * 0.4, gh = h - 30;
    ctx.strokeStyle = hsl("--muted-foreground", 0.5); ctx.lineWidth = 1;
    ctx.strokeRect(gx, 10, gw, gh);
    ctx.strokeStyle = hsl("--primary"); ctx.lineWidth = 2; ctx.beginPath();
    for (let v = 0; v <= 50; v += 0.25) {
      const x = gx + (v / 50) * gw; const y = 10 + gh - (titrationPH(v) / 14) * gh;
      if (v === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = hsl("--foreground");
    ctx.beginPath(); ctx.arc(gx + (vol / 50) * gw, 10 + gh - (ph / 14) * gh, 4, 0, 7); ctx.fill();
    ctx.font = "11px Roboto, sans-serif"; ctx.fillText("pH vs mL NaOH", gx + 4, h - 6);
  }, [vol]);
  return (
    <div className="space-y-3">
      <canvas ref={ref} className="w-full h-64 rounded-lg bg-muted/40" role="img" aria-label={`Titration flask, pH ${ph.toFixed(2)}, ${pink ? "pink" : "colourless"}`} />
      <Label htmlFor="titr">NaOH added: {vol.toFixed(1)} mL · pH {ph.toFixed(2)} · {pink ? "pink" : "colourless"}</Label>
      <Slider id="titr" aria-label="Volume of sodium hydroxide added" min={0} max={50} step={0.1} value={[vol]} onValueChange={([v]) => setVol(v)} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setVol((v) => Math.min(50, v + 1))}>+1 mL</Button>
        <Button size="sm" variant="outline" onClick={() => setVol((v) => Math.min(50, +(v + 0.05).toFixed(2)))}>+1 drop</Button>
        <Button size="sm" variant="ghost" onClick={() => setVol(0)}>Refill</Button>
      </div>
    </div>
  );
}

function Pendulum() {
  const [len, setLen] = useState(0.5);
  const [mass, setMass] = useState(0.1);
  const T = pendulumPeriod(len);
  const ref = useCanvas((ctx, w, h, t) => {
    const px = w / 2, py = 14;
    const L = 40 + len * (h - 80);
    const a = 0.25 * Math.cos((2 * Math.PI * t) / T);
    const bx = px + L * Math.sin(a), by = py + L * Math.cos(a);
    ctx.strokeStyle = hsl("--foreground", 0.8); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(px - 40, py); ctx.lineTo(px + 40, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = hsl("--primary");
    ctx.beginPath(); ctx.arc(bx, by, 8 + mass * 20, 0, 7); ctx.fill();
  }, [len, mass, T]);
  return (
    <div className="space-y-3">
      <canvas ref={ref} className="w-full h-64 rounded-lg bg-muted/40" role="img" aria-label={`Pendulum ${len.toFixed(2)} m long swinging with period ${T.toFixed(2)} seconds`} />
      <p className="text-sm">Period T = {T.toFixed(2)} s · 10 swings = {(T * 10).toFixed(1)} s · g = 4π²L/T² = {((4 * Math.PI ** 2 * len) / T ** 2).toFixed(2)} m/s²</p>
      <Label htmlFor="plen">Length: {len.toFixed(2)} m</Label>
      <Slider id="plen" aria-label="Pendulum length" min={0.2} max={1.5} step={0.05} value={[len]} onValueChange={([v]) => setLen(v)} />
      <Label htmlFor="pmass">Bob mass: {(mass * 1000).toFixed(0)} g (watch: the period doesn't change)</Label>
      <Slider id="pmass" aria-label="Bob mass" min={0.05} max={0.5} step={0.05} value={[mass]} onValueChange={([v]) => setMass(v)} />
    </div>
  );
}

function Buoyancy() {
  const [density, setDensity] = useState(0.6); // g/cm³
  const [salt, setSalt] = useState(false);
  const volume = 100; // cm³
  const fluid = salt ? 1.03 : 1.0;
  const floats = density < fluid;
  const submerged = floats ? density / fluid : 1;
  const weight = (density * volume * 9.8) / 1000;
  const upthrust = (fluid * volume * submerged * 9.8) / 1000;
  const ref = useCanvas((ctx, w, h, t) => {
    const top = h * 0.35;
    ctx.fillStyle = salt ? "hsl(195 60% 55% / 0.45)" : "hsl(205 70% 60% / 0.35)";
    ctx.fillRect(20, top, w - 40, h - top - 10);
    ctx.strokeStyle = hsl("--foreground", 0.6); ctx.strokeRect(20, 20, w - 40, h - 30);
    const s = 60, bob = Math.sin(t * 2) * 2;
    const y = floats ? top - s * (1 - submerged) + bob : h - 10 - s;
    ctx.fillStyle = `hsl(30 ${40 + density * 20}% ${70 - density * 15}%)`;
    ctx.fillRect(w / 2 - s / 2, y, s, s);
  }, [density, salt, floats, submerged]);
  return (
    <div className="space-y-3">
      <canvas ref={ref} className="w-full h-64 rounded-lg bg-muted/40" role="img" aria-label={`Block of density ${density} grams per cubic centimetre ${floats ? "floating" : "sinking"}`} />
      <p className="text-sm">Weight {weight.toFixed(2)} N · Upthrust {upthrust.toFixed(2)} N · Water displaced {(volume * submerged).toFixed(0)} cm³ · {floats ? "Floats" : "Sinks"}</p>
      <Label htmlFor="dens">Block density: {density.toFixed(2)} g/cm³</Label>
      <Slider id="dens" aria-label="Block density" min={0.2} max={3} step={0.05} value={[density]} onValueChange={([v]) => setDensity(v)} />
      <Button size="sm" variant={salt ? "secondary" : "outline"} aria-pressed={salt} onClick={() => setSalt((s) => !s)}>
        {salt ? "Salt water" : "Fresh water"}
      </Button>
    </div>
  );
}

export function LabExperimentSimulation({ id }: { id: string }) {
  if (id === "titration") return <Titration />;
  if (id === "pendulum") return <Pendulum />;
  return <Buoyancy />;
}
