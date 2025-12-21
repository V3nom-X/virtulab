import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Settings2, 
  Download,
  ChevronRight,
  Info,
  LineChart,
  BookOpen,
  StickyNote,
  Gauge
} from "lucide-react";

const Workspace = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [mass, setMass] = useState([1.5]);
  const [length, setLength] = useState([1]);
  const [gravity, setGravity] = useState([9.8]);
  const [angle, setAngle] = useState([45]);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Main Simulation Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Physics</Badge>
              <h1 className="font-semibold">Pendulum Motion</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Simulation Canvas */}
          <div className="flex-1 relative bg-gradient-to-b from-muted/50 to-muted flex items-center justify-center">
            {/* Simulated Pendulum Visualization */}
            <div className="relative w-full max-w-lg aspect-square">
              {/* Pivot Point */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground rounded-full z-10" />
              
              {/* String */}
              <svg className="absolute inset-0 w-full h-full">
                <line
                  x1="50%"
                  y1="32"
                  x2={`${50 + Math.sin((angle[0] * Math.PI) / 180) * 35}%`}
                  y2={`${32 + Math.cos((angle[0] * Math.PI) / 180) * 35}%`}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />
              </svg>

              {/* Bob */}
              <div
                className="absolute w-12 h-12 bg-primary rounded-full shadow-glow transition-all duration-100"
                style={{
                  left: `calc(50% + ${Math.sin((angle[0] * Math.PI) / 180) * 35}% - 24px)`,
                  top: `calc(32px + ${Math.cos((angle[0] * Math.PI) / 180) * 35}% - 24px)`,
                  transform: `scale(${0.8 + mass[0] * 0.2})`,
                }}
              />

              {/* Ground Line */}
              <div className="absolute bottom-16 left-1/4 right-1/4 h-0.5 bg-border" />
            </div>

            {/* Info Overlay */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span className="font-medium">Simple Harmonic Motion</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Observe how the pendulum swings back and forth under the influence of gravity.
              </p>
            </div>

            {/* Live Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3">
              <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border">
                <div className="text-xs text-muted-foreground">Period</div>
                <div className="text-lg font-mono font-semibold">
                  {(2 * Math.PI * Math.sqrt(length[0] / gravity[0])).toFixed(3)}s
                </div>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border">
                <div className="text-xs text-muted-foreground">Frequency</div>
                <div className="text-lg font-mono font-semibold">
                  {(1 / (2 * Math.PI * Math.sqrt(length[0] / gravity[0]))).toFixed(3)} Hz
                </div>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border">
                <div className="text-xs text-muted-foreground">Angular Velocity</div>
                <div className="text-lg font-mono font-semibold">
                  {Math.sqrt(gravity[0] / length[0]).toFixed(2)} rad/s
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="h-20 border-t bg-card px-4 flex items-center gap-6">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button variant="outline" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <div className="w-32">
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.25}
                  max={4}
                  step={0.25}
                />
              </div>
              <span className="text-sm font-mono w-12">{speed[0]}x</span>
            </div>

            {/* Quick Variable Controls */}
            <div className="flex-1 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Angle</span>
                <div className="w-24">
                  <Slider
                    value={angle}
                    onValueChange={setAngle}
                    min={5}
                    max={90}
                    step={1}
                  />
                </div>
                <span className="text-sm font-mono w-10">{angle[0]}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 border-l bg-card flex flex-col">
          <Tabs defaultValue="controls" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-12 px-2 bg-transparent">
              <TabsTrigger value="controls" className="gap-1.5 data-[state=active]:bg-muted">
                <Settings2 className="w-4 h-4" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-1.5 data-[state=active]:bg-muted">
                <LineChart className="w-4 h-4" />
                Data
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-1.5 data-[state=active]:bg-muted">
                <BookOpen className="w-4 h-4" />
                Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="flex-1 p-4 space-y-6 overflow-auto m-0">
              {/* Mass Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Mass (kg)</label>
                  <span className="text-sm font-mono text-muted-foreground">{mass[0].toFixed(1)}</span>
                </div>
                <Slider
                  value={mass}
                  onValueChange={setMass}
                  min={0.5}
                  max={5}
                  step={0.1}
                />
              </div>

              {/* Length Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Length (m)</label>
                  <span className="text-sm font-mono text-muted-foreground">{length[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  min={0.2}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Gravity Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Gravity (m/s²)</label>
                  <span className="text-sm font-mono text-muted-foreground">{gravity[0].toFixed(1)}</span>
                </div>
                <Slider
                  value={gravity}
                  onValueChange={setGravity}
                  min={1}
                  max={20}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Moon (1.6)</span>
                  <span>Earth (9.8)</span>
                  <span>Jupiter (24.8)</span>
                </div>
              </div>

              {/* Initial Angle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Initial Angle (°)</label>
                  <span className="text-sm font-mono text-muted-foreground">{angle[0]}</span>
                </div>
                <Slider
                  value={angle}
                  onValueChange={setAngle}
                  min={5}
                  max={90}
                  step={1}
                />
              </div>

              {/* Presets */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setMass([1]); setLength([1]); setGravity([9.8]); setAngle([30]); }}>
                    Earth Standard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setMass([1]); setLength([1]); setGravity([1.6]); setAngle([30]); }}>
                    Moon Gravity
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setMass([5]); setLength([2]); setGravity([9.8]); setAngle([45]); }}>
                    Heavy & Long
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setMass([0.5]); setLength([0.5]); setGravity([9.8]); setAngle([15]); }}>
                    Quick Swing
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="flex-1 p-4 overflow-auto m-0">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Calculated Values</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period (T)</span>
                      <span className="font-mono">{(2 * Math.PI * Math.sqrt(length[0] / gravity[0])).toFixed(4)} s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency (f)</span>
                      <span className="font-mono">{(1 / (2 * Math.PI * Math.sqrt(length[0] / gravity[0]))).toFixed(4)} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Angular Freq. (ω)</span>
                      <span className="font-mono">{Math.sqrt(gravity[0] / length[0]).toFixed(4)} rad/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Velocity</span>
                      <span className="font-mono">{(Math.sqrt(gravity[0] / length[0]) * length[0] * Math.sin((angle[0] * Math.PI) / 180)).toFixed(4)} m/s</span>
                    </div>
                  </div>
                </div>

                <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Graph visualization</p>
                    <p className="text-xs">Data will appear here during simulation</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data (CSV)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="guide" className="flex-1 p-4 overflow-auto m-0">
              <div className="space-y-4">
                <div className="bg-accent/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Objective</h4>
                  <p className="text-sm text-muted-foreground">
                    Understand how the period of a simple pendulum depends on its length and the gravitational acceleration.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Steps</h4>
                  <div className="space-y-2">
                    {[
                      "Set initial angle to 30° or less for accurate results",
                      "Observe the period for different lengths",
                      "Compare Earth vs Moon gravity",
                      "Note that mass doesn't affect the period",
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-medium">
                          {idx + 1}
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Formulas</h4>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm space-y-1">
                    <p>T = 2π√(L/g)</p>
                    <p>f = 1/T</p>
                    <p>ω = √(g/L)</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Workspace;
