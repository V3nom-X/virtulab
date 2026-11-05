import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export const circuitCurrent = (voltage: number, resistance: number) => voltage / resistance;
export const springExtension = (mass: number, stiffness: number) => mass * 9.8 / stiffness;

export function OhmsLawLab() {
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(100);
  const current = circuitCurrent(voltage, resistance);
  return <div className="space-y-4">
    <svg viewBox="0 0 360 220" className="w-full h-64 bg-muted/40 rounded-lg" role="img" aria-label={`Circuit, current ${current.toFixed(3)} amperes`}>
      <path d="M60 70H140l10 -15 20 30 20 -30 20 30 10 -15H300V170H60Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M45 95H75M50 110H70" stroke="currentColor" strokeWidth="5" />
      <circle cx="180" cy="170" r="26" className="fill-background stroke-primary" strokeWidth="3" />
      <text x="180" y="177" textAnchor="middle" className="fill-foreground">A</text>
      <text x="180" y="40" textAnchor="middle" className="fill-foreground">{resistance} Ω</text>
      <text x="180" y="215" textAnchor="middle" className="fill-foreground">{(current * 1000).toFixed(1)} mA</text>
    </svg>
    <p className="text-sm">I = V/R = {current.toFixed(3)} A · Power = {(voltage * current).toFixed(2)} W</p>
    <p>Voltage: {voltage} V</p><Slider aria-label="Supply voltage" min={0} max={12} step={1} value={[voltage]} onValueChange={([v]) => setVoltage(v)} />
    <p>Resistance: {resistance} Ω</p><Slider aria-label="Circuit resistance" min={50} max={500} step={50} value={[resistance]} onValueChange={([v]) => setResistance(v)} />
  </div>;
}

export function HookesLawLab() {
  const [mass, setMass] = useState(0.1);
  const [k, setK] = useState(50);
  const extension = springExtension(mass, k);
  const bottom = 95 + extension * 450;
  const points = Array.from({ length: 17 }, (_, i) => `${i === 0 || i === 16 ? 180 : 180 + (i % 2 ? -12 : 12)},${25 + (bottom - 25) * i / 16}`).join(" ");
  return <div className="space-y-4">
    <svg viewBox="0 0 360 270" className="w-full h-64 bg-muted/40 rounded-lg" role="img" aria-label={`Loaded spring, extension ${(extension * 100).toFixed(2)} centimetres`}>
      <path d="M120 20H240" stroke="currentColor" strokeWidth="6" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="160" y={bottom} width="40" height="35" rx="4" className="fill-primary" />
      <text x="250" y="160" className="fill-foreground">{(extension * 100).toFixed(2)} cm</text>
    </svg>
    <p className="text-sm">Force: {(mass * 9.8).toFixed(2)} N · Extension: {(extension * 100).toFixed(2)} cm</p>
    <p>Mass: {(mass * 1000).toFixed(0)} g</p><Slider aria-label="Spring load mass" min={0} max={0.5} step={0.05} value={[mass]} onValueChange={([v]) => setMass(v)} />
    <p>Spring constant: {k} N/m</p><Slider aria-label="Spring constant" min={20} max={100} step={10} value={[k]} onValueChange={([v]) => setK(v)} />
  </div>;
}

export function DiffusionLab() {
  const [temperature, setTemperature] = useState(20);
  const [seconds, setSeconds] = useState(0);
  const spread = Math.sqrt(seconds * (temperature + 273) / 293) * 9;
  return <div className="space-y-4">
    <svg viewBox="0 0 360 240" className="w-full h-64 bg-muted/40 rounded-lg" role="img" aria-label={`Dye diffusion after ${seconds} seconds at ${temperature} degrees Celsius`}>
      <rect x="20" y="20" width="320" height="200" className="fill-muted stroke-foreground" />
      {Array.from({ length: 80 }, (_, i) => {
        const a = i * 2.39996;
        const r = Math.sqrt((i + 1) / 80) * spread;
        return <circle key={i} cx={180 + Math.cos(a) * Math.min(145, r)} cy={120 + Math.sin(a) * Math.min(90, r)} r="3" className="fill-primary" />;
      })}
    </svg>
    <p>Temperature: {temperature} °C · Elapsed: {seconds} s</p>
    <Slider aria-label="Water temperature" min={5} max={80} step={5} value={[temperature]} onValueChange={([v]) => setTemperature(v)} />
    <Slider aria-label="Diffusion elapsed time" min={0} max={120} step={5} value={[seconds]} onValueChange={([v]) => setSeconds(v)} />
    <div className="flex gap-2"><Button variant="outline" onClick={() => setSeconds((s) => Math.min(120, s + 10))}>Advance 10 s</Button><Button variant="ghost" onClick={() => setSeconds(0)}>Reset dye</Button></div>
  </div>;
}