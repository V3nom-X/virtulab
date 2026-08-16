import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimulationLoader } from "@/components/simulations/SimulationLoader";
import { Camera, RotateCcw, Satellite } from "lucide-react";

type Platform = "satellite" | "aircraft" | "drone";
type Sensor = "optical" | "infrared" | "radar";
type Band = "visible" | "nir" | "thermal" | "microwave";
type Sky = "clear" | "cloudy" | "hazy";

const REGIONS = [
  { id: "turkana", name: "Turkana Basin (drought)", base: [0.18, 0.34, 0.62], greenness: 0.15 },
  { id: "tana", name: "Tana River Basin (floods)", base: [0.2, 0.45, 0.35], greenness: 0.55 },
  { id: "mara", name: "Maasai Mara (wildlife)", base: [0.3, 0.5, 0.25], greenness: 0.7 },
  { id: "mau", name: "Mau Forest (fire & forest)", base: [0.12, 0.42, 0.2], greenness: 0.85 },
];

const PLATFORM_ALT: Record<Platform, [number, number]> = {
  satellite: [400, 800],
  aircraft: [3, 12],
  drone: [0.05, 0.5],
};

// Deterministic value noise so captures are repeatable
function noise(x: number, y: number, seed: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 3.1415) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, seed: number) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    const xi = Math.floor(x * f);
    const yi = Math.floor(y * f);
    const fx = x * f - xi;
    const fy = y * f - yi;
    const a = noise(xi, yi, seed);
    const b = noise(xi + 1, yi, seed);
    const c = noise(xi, yi + 1, seed);
    const d = noise(xi + 1, yi + 1, seed);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    v += amp * (a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy);
    amp *= 0.5;
    f *= 2;
  }
  return v;
}

export function RemoteSensingSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const [platform, setPlatform] = useState<Platform>("satellite");
  const [sensor, setSensor] = useState<Sensor>("optical");
  const [band, setBand] = useState<Band>("visible");
  const [sky, setSky] = useState<Sky>("clear");
  const [altitude, setAltitude] = useState(600);
  const [resolution, setResolution] = useState(30);
  const [day, setDay] = useState(0);
  const [ndvi, setNdvi] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Keep altitude inside the selected platform's range
  useEffect(() => {
    const [lo, hi] = PLATFORM_ALT[platform];
    setAltitude((a) => Math.min(hi, Math.max(lo, a > hi || a < lo ? (lo + hi) / 2 : a)));
  }, [platform]);

  useEffect(() => {
    if (sensor === "radar") setBand("microwave");
    else if (sensor === "infrared") setBand("thermal");
    else setBand("visible");
  }, [sensor]);

  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];

  const capture = () => {
    const opticalBlocked = sky === "cloudy" && (sensor === "optical" || sensor === "infrared");
    setBlocked(opticalBlocked);
    setCaptured(true);
  };

  const reset = () => {
    setCaptured(false);
    setBlocked(false);
    setNdvi(false);
    setDay(0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!captured) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < W; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      for (let j = 0; j < H; j += 32) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(W, j);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No image yet — press Capture Image", W / 2, H / 2);
      return;
    }

    if (blocked) {
      ctx.fillStyle = "#c9ced6";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 900; i++) {
        const x = noise(i, 1, 7) * W;
        const y = noise(i, 2, 11) * H;
        const r = 12 + noise(i, 3, 13) * 40;
        ctx.fillStyle = `rgba(255,255,255,${0.05 + noise(i, 4, 17) * 0.12})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(20,20,30,0.75)";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Cloud cover blocks this passive sensor", W / 2, H / 2);
      ctx.font = "13px sans-serif";
      ctx.fillText("Switch the sensor to radar and capture again", W / 2, H / 2 + 22);
      return;
    }

    // Pixel block size grows with coarser resolution
    const px = Math.max(1, Math.round(resolution / 3));
    const seed = region.id.length + day * 0.37;
    // Dry season progression: greenness falls then partially recovers
    const seasonal = region.greenness * (1 - 0.5 * Math.sin((day / 90) * Math.PI));

    for (let y = 0; y < H; y += px) {
      for (let x = 0; x < W; x += px) {
        const nx = x / W * 6;
        const ny = y / H * 6;
        const h = fbm(nx, ny, seed);
        const veg = Math.min(1, Math.max(0, h * 1.4 * seasonal + 0.05));
        const water = h < 0.32 ? 1 : 0;
        let r: number, g: number, b: number;

        if (ndvi) {
          const idx = water ? -0.2 : veg;
          if (water) {
            r = 30; g = 60; b = 140;
          } else if (idx > 0.55) {
            r = 20; g = 160; b = 60;
          } else if (idx > 0.35) {
            r = 140; g = 200; b = 70;
          } else if (idx > 0.2) {
            r = 220; g = 190; b = 80;
          } else {
            r = 170; g = 90; b = 50;
          }
        } else if (sensor === "radar") {
          const s = 60 + h * 160 + (water ? -45 : 0);
          r = s; g = s; b = s * 1.05;
        } else if (sensor === "infrared") {
          const heat = 1 - veg;
          r = 60 + heat * 190;
          g = 40 + veg * 120;
          b = 90 - heat * 40;
        } else {
          r = (region.base[0] + (1 - veg) * 0.45) * 255;
          g = (region.base[1] * (0.5 + veg)) * 255;
          b = (region.base[2] * (water ? 1.4 : 0.55)) * 255;
        }

        if (sky === "hazy") {
          r = r * 0.75 + 200 * 0.25;
          g = g * 0.75 + 200 * 0.25;
          b = b * 0.75 + 210 * 0.25;
        }

        ctx.fillStyle = `rgb(${Math.round(Math.min(255, r))},${Math.round(Math.min(255, g))},${Math.round(Math.min(255, b))})`;
        ctx.fillRect(x, y, px, px);
      }
    }

    // Scale/overlay annotations
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(8, H - 34, 190, 26);
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${resolution} m/pixel · day ${day}`, 16, H - 16);
  }, [captured, blocked, resolution, sensor, ndvi, day, region, sky]);

  const swath = Math.round(altitude * 0.35 + resolution * 2);
  const revisit = platform === "satellite" ? 16 : platform === "aircraft" ? 3 : 1;

  return (
    <SimulationLoader simulationName="Remote Sensing">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <Satellite className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{region.name}</span>
            </div>
            <Badge variant="secondary" className="shrink-0">{sensor === "radar" ? "Active" : "Passive"} sensor</Badge>
          </div>
          <div className="p-3">
            <canvas ref={canvasRef} width={640} height={400} className="w-full h-auto rounded-lg bg-[#0b1220]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 pb-3 text-center">
            {[
              { label: "Altitude", value: `${altitude} km` },
              { label: "Resolution", value: `${resolution} m/px` },
              { label: "Swath", value: `${swath} km` },
              { label: "Revisit", value: `${revisit} days` },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 p-2 min-w-0">
                <div className="text-[11px] text-muted-foreground truncate">{s.label}</div>
                <div className="text-sm font-semibold truncate">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="space-y-2">
            <Label>Region of interest</Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite (wide, repeat coverage)</SelectItem>
                <SelectItem value="aircraft">Aircraft (medium detail)</SelectItem>
                <SelectItem value="drone">Drone (very high detail)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sensor</Label>
            <Select value={sensor} onValueChange={(v) => setSensor(v as Sensor)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="optical">Optical — visible light</SelectItem>
                <SelectItem value="infrared">Infrared — heat & plant health</SelectItem>
                <SelectItem value="radar">Radar — sees through cloud</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Band: {band}</p>
          </div>

          <div className="space-y-2">
            <Label>Atmosphere</Label>
            <Select value={sky} onValueChange={(v) => setSky(v as Sky)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear sky</SelectItem>
                <SelectItem value="cloudy">Cloud cover</SelectItem>
                <SelectItem value="hazy">Haze / dust</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Altitude</Label>
              <span className="text-xs text-muted-foreground shrink-0">{altitude} km</span>
            </div>
            <Slider
              min={PLATFORM_ALT[platform][0]}
              max={PLATFORM_ALT[platform][1]}
              step={PLATFORM_ALT[platform][1] > 50 ? 10 : 0.05}
              value={[altitude]}
              onValueChange={([v]) => setAltitude(Number(v.toFixed(2)))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Spatial resolution</Label>
              <span className="text-xs text-muted-foreground shrink-0">{resolution} m/px</span>
            </div>
            <Slider min={1} max={250} step={1} value={[resolution]} onValueChange={([v]) => setResolution(v)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="min-w-0">Simulated day</Label>
              <span className="text-xs text-muted-foreground shrink-0">{day}</span>
            </div>
            <Slider min={0} max={90} step={30} value={[day]} onValueChange={([v]) => setDay(v)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={capture} className="gap-2 flex-1 min-w-[8rem]">
              <Camera className="w-4 h-4" /> Capture Image
            </Button>
            <Button variant={ndvi ? "default" : "outline"} onClick={() => setNdvi((v) => !v)} disabled={!captured || blocked} className="flex-1 min-w-[8rem]">
              NDVI filter
            </Button>
            <Button variant="outline" size="icon" onClick={reset} aria-label="Reset capture">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {captured && (
            <p className="text-xs text-muted-foreground">
              {blocked
                ? "Passive sensors cannot see through cloud. Radar emits its own microwave pulses and is unaffected."
                : ndvi
                  ? "Green = vigorous vegetation, yellow = stressed, brown = bare/built-up, blue = water."
                  : "Lower resolution values give sharper detail; higher values give a coarse regional overview."}
            </p>
          )}
        </div>
      </div>
    </SimulationLoader>
  );
}
