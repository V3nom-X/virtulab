import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PendulumSimulation, PendulumSimulationHandle } from "@/components/simulations/PendulumSimulation";
import { ProjectileSimulation, ProjectileSimulationHandle } from "@/components/simulations/ProjectileSimulation";
import { SpringSimulation, SpringSimulationHandle } from "@/components/simulations/SpringSimulation";
import { WaveSimulation, WaveSimulationHandle } from "@/components/simulations/WaveSimulation";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, Pause, RotateCcw, Maximize2, Settings2, Download,
  FlaskConical, Target, Activity, Gauge, Waves, Trash2, BarChart3
} from "lucide-react";

interface DataPoint {
  time: number;
  [key: string]: number;
}

const Workspace = () => {
  const [searchParams] = useSearchParams();
  const [activeSimulation, setActiveSimulation] = useState<string>(
    searchParams.get('type') || 'pendulum'
  );
  const [showGraphs, setShowGraphs] = useState(true);

  // Shared controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);

  // Graph data
  const [graphData, setGraphData] = useState<DataPoint[]>([]);
  const maxDataPoints = 150;

  // Pendulum state
  const [pendulumMass, setPendulumMass] = useState([1.5]);
  const [pendulumLength, setPendulumLength] = useState([1]);
  const [pendulumGravity, setPendulumGravity] = useState([9.8]);
  const [pendulumAngle, setPendulumAngle] = useState([45]);

  // Projectile state
  const [projectileVelocity, setProjectileVelocity] = useState([20]);
  const [projectileAngle, setProjectileAngle] = useState([45]);
  const [projectileGravity, setProjectileGravity] = useState([9.8]);

  // Spring state
  const [springMass, setSpringMass] = useState([1]);
  const [springConstant, setSpringConstant] = useState([50]);
  const [springDamping, setSpringDamping] = useState([0.1]);
  const [springDisplacement, setSpringDisplacement] = useState([2]);

  // Wave state
  const [waveFrequency, setWaveFrequency] = useState([1]);
  const [waveAmplitude, setWaveAmplitude] = useState([1]);
  const [waveWavelength, setWaveWavelength] = useState([2]);
  const [waveType, setWaveType] = useState<'transverse' | 'longitudinal'>('transverse');

  // Simulation refs for reset
  const pendulumRef = useRef<PendulumSimulationHandle>(null);
  const projectileRef = useRef<ProjectileSimulationHandle>(null);
  const springRef = useRef<SpringSimulationHandle>(null);
  const waveRef = useRef<WaveSimulationHandle>(null);

  const simulations = [
    { id: 'pendulum', name: 'Pendulum', icon: Activity, category: 'Physics' },
    { id: 'projectile', name: 'Projectile', icon: Target, category: 'Physics' },
    { id: 'spring', name: 'Spring', icon: Activity, category: 'Physics' },
    { id: 'wave', name: 'Wave', icon: Waves, category: 'Physics' },
    { id: 'chemistry', name: 'Chemistry Lab', icon: FlaskConical, category: 'Chemistry' },
  ];

  const activeSim = simulations.find(s => s.id === activeSimulation);

  const handleDataUpdate = useCallback((data: DataPoint) => {
    setGraphData(prev => {
      const newData = [...prev, data];
      if (newData.length > maxDataPoints) {
        return newData.slice(-maxDataPoints);
      }
      return newData;
    });
  }, []);

  const handleReset = () => {
    setIsPlaying(false);
    setGraphData([]);
    if (activeSimulation === 'pendulum') {
      pendulumRef.current?.reset();
    } else if (activeSimulation === 'projectile') {
      projectileRef.current?.reset();
    } else if (activeSimulation === 'spring') {
      springRef.current?.reset();
    } else if (activeSimulation === 'wave') {
      waveRef.current?.reset();
    }
  };

  const handleSimulationChange = (v: string) => {
    setActiveSimulation(v);
    setIsPlaying(false);
    setGraphData([]);
  };

  const getGraphConfig = () => {
    switch (activeSimulation) {
      case 'pendulum':
        return {
          lines: [
            { dataKey: 'angle', name: 'Angle (°)', color: 'hsl(168, 76%, 46%)' },
            { dataKey: 'velocity', name: 'Velocity (m/s)', color: 'hsl(0, 84%, 60%)' },
            { dataKey: 'energy', name: 'Energy (J)', color: 'hsl(45, 93%, 47%)' },
          ]
        };
      case 'projectile':
        return {
          lines: [
            { dataKey: 'x', name: 'X Position', color: 'hsl(168, 76%, 46%)' },
            { dataKey: 'y', name: 'Y Position', color: 'hsl(0, 84%, 60%)' },
            { dataKey: 'vx', name: 'Vx', color: 'hsl(45, 93%, 47%)' },
            { dataKey: 'vy', name: 'Vy', color: 'hsl(280, 65%, 60%)' },
          ]
        };
      case 'spring':
        return {
          lines: [
            { dataKey: 'displacement', name: 'Displacement (m)', color: 'hsl(168, 76%, 46%)' },
            { dataKey: 'velocity', name: 'Velocity (m/s)', color: 'hsl(0, 84%, 60%)' },
            { dataKey: 'force', name: 'Force (N)', color: 'hsl(45, 93%, 47%)' },
          ]
        };
      case 'wave':
        return {
          lines: [
            { dataKey: 'displacement', name: 'Displacement', color: 'hsl(168, 76%, 46%)' },
            { dataKey: 'velocity', name: 'Velocity', color: 'hsl(0, 84%, 60%)' },
            { dataKey: 'energy', name: 'Energy', color: 'hsl(45, 93%, 47%)' },
          ]
        };
      default:
        return { lines: [] };
    }
  };

  const graphConfig = getGraphConfig();

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{activeSim?.category}</Badge>
            <h1 className="font-semibold">{activeSim?.name} Simulation</h1>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={activeSimulation} onValueChange={handleSimulationChange}>
              <TabsList className="h-9">
                {simulations.map(sim => (
                  <TabsTrigger key={sim.id} value={sim.id} className="text-xs gap-1">
                    <sim.icon className="w-3 h-3" />
                    {sim.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="w-px h-6 bg-border mx-2" />
            <Button 
              variant={showGraphs ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setShowGraphs(!showGraphs)}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
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

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Simulation Canvas */}
          <div className="flex-1 flex flex-col">
            <div className={`${showGraphs && activeSimulation !== 'chemistry' ? 'flex-[2]' : 'flex-1'} relative bg-gradient-to-b from-muted/50 to-muted`}>
              {activeSimulation === 'pendulum' && (
                <PendulumSimulation
                  ref={pendulumRef}
                  mass={pendulumMass[0]}
                  length={pendulumLength[0]}
                  gravity={pendulumGravity[0]}
                  angle={pendulumAngle[0]}
                  isPlaying={isPlaying}
                  speed={speed[0]}
                  onDataUpdate={handleDataUpdate}
                />
              )}
              {activeSimulation === 'projectile' && (
                <ProjectileSimulation
                  ref={projectileRef}
                  velocity={projectileVelocity[0]}
                  angle={projectileAngle[0]}
                  gravity={projectileGravity[0]}
                  isPlaying={isPlaying}
                  speed={speed[0]}
                  onDataUpdate={handleDataUpdate}
                />
              )}
              {activeSimulation === 'spring' && (
                <SpringSimulation
                  ref={springRef}
                  mass={springMass[0]}
                  springConstant={springConstant[0]}
                  damping={springDamping[0]}
                  displacement={springDisplacement[0]}
                  isPlaying={isPlaying}
                  speed={speed[0]}
                  onDataUpdate={handleDataUpdate}
                />
              )}
              {activeSimulation === 'wave' && (
                <WaveSimulation
                  ref={waveRef}
                  frequency={waveFrequency[0]}
                  amplitude={waveAmplitude[0]}
                  wavelength={waveWavelength[0]}
                  waveType={waveType}
                  isPlaying={isPlaying}
                  speed={speed[0]}
                  onDataUpdate={handleDataUpdate}
                />
              )}
              {activeSimulation === 'chemistry' && <ChemistryWorkspace />}
            </div>

            {/* Real-time Graphs */}
            {showGraphs && activeSimulation !== 'chemistry' && (
              <div className="flex-1 border-t bg-card p-4">
                <Card className="h-full">
                  <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">Real-time Data</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setGraphData([])}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-2 h-[calc(100%-3rem)]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => v.toFixed(1)}
                          stroke="hsl(var(--muted-foreground))"
                          label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => v.toFixed(1)}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          labelFormatter={(v) => `Time: ${Number(v).toFixed(2)}s`}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        {graphConfig.lines.map((line) => (
                          <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Playback Controls - only for physics simulations */}
            {activeSimulation !== 'chemistry' && (
              <div className="h-16 border-t bg-card px-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <div className="w-32">
                    <Slider value={speed} onValueChange={setSpeed} min={0.25} max={4} step={0.25} />
                  </div>
                  <span className="text-sm font-mono w-12">{speed[0]}x</span>
                </div>

                {graphData.length > 0 && (
                  <div className="ml-auto text-xs text-muted-foreground">
                    {graphData.length} data points
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Controls */}
          {activeSimulation !== 'chemistry' && (
            <div className="w-72 border-l bg-card p-4 space-y-6 overflow-auto">
              <h3 className="font-semibold">Parameters</h3>

              {activeSimulation === 'pendulum' && (
                <>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Mass (kg)</span>
                      <span className="font-mono">{pendulumMass[0].toFixed(1)}</span>
                    </div>
                    <Slider value={pendulumMass} onValueChange={setPendulumMass} min={0.5} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Length (m)</span>
                      <span className="font-mono">{pendulumLength[0].toFixed(2)}</span>
                    </div>
                    <Slider value={pendulumLength} onValueChange={setPendulumLength} min={0.2} max={3} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Gravity (m/s²)</span>
                      <span className="font-mono">{pendulumGravity[0].toFixed(1)}</span>
                    </div>
                    <Slider value={pendulumGravity} onValueChange={setPendulumGravity} min={1} max={20} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Initial Angle (°)</span>
                      <span className="font-mono">{pendulumAngle[0]}</span>
                    </div>
                    <Slider value={pendulumAngle} onValueChange={setPendulumAngle} min={5} max={90} step={1} />
                  </div>
                </>
              )}

              {activeSimulation === 'projectile' && (
                <>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Velocity (m/s)</span>
                      <span className="font-mono">{projectileVelocity[0]}</span>
                    </div>
                    <Slider value={projectileVelocity} onValueChange={setProjectileVelocity} min={5} max={50} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Launch Angle (°)</span>
                      <span className="font-mono">{projectileAngle[0]}</span>
                    </div>
                    <Slider value={projectileAngle} onValueChange={setProjectileAngle} min={5} max={85} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Gravity (m/s²)</span>
                      <span className="font-mono">{projectileGravity[0].toFixed(1)}</span>
                    </div>
                    <Slider value={projectileGravity} onValueChange={setProjectileGravity} min={1} max={20} step={0.1} />
                  </div>
                </>
              )}

              {activeSimulation === 'spring' && (
                <>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Mass (kg)</span>
                      <span className="font-mono">{springMass[0].toFixed(1)}</span>
                    </div>
                    <Slider value={springMass} onValueChange={setSpringMass} min={0.5} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Spring Constant (N/m)</span>
                      <span className="font-mono">{springConstant[0]}</span>
                    </div>
                    <Slider value={springConstant} onValueChange={setSpringConstant} min={10} max={200} step={5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Damping</span>
                      <span className="font-mono">{springDamping[0].toFixed(2)}</span>
                    </div>
                    <Slider value={springDamping} onValueChange={setSpringDamping} min={0} max={1} step={0.05} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Initial Displacement (m)</span>
                      <span className="font-mono">{springDisplacement[0].toFixed(1)}</span>
                    </div>
                    <Slider value={springDisplacement} onValueChange={setSpringDisplacement} min={0.5} max={5} step={0.5} />
                  </div>
                </>
              )}

              {activeSimulation === 'wave' && (
                <>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Wave Type</span>
                    </div>
                    <Select value={waveType} onValueChange={(v) => setWaveType(v as 'transverse' | 'longitudinal')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transverse">Transverse</SelectItem>
                        <SelectItem value="longitudinal">Longitudinal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Frequency (Hz)</span>
                      <span className="font-mono">{waveFrequency[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveFrequency} onValueChange={setWaveFrequency} min={0.1} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Amplitude (m)</span>
                      <span className="font-mono">{waveAmplitude[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveAmplitude} onValueChange={setWaveAmplitude} min={0.1} max={3} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Wavelength (m)</span>
                      <span className="font-mono">{waveWavelength[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveWavelength} onValueChange={setWaveWavelength} min={0.5} max={10} step={0.5} />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Wave Properties</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Wave Speed (v)</span>
                        <span className="font-mono">{(waveFrequency[0] * waveWavelength[0]).toFixed(2)} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Period (T)</span>
                        <span className="font-mono">{(1 / waveFrequency[0]).toFixed(2)} s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Angular Frequency (ω)</span>
                        <span className="font-mono">{(2 * Math.PI * waveFrequency[0]).toFixed(2)} rad/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wave Number (k)</span>
                        <span className="font-mono">{(2 * Math.PI / waveWavelength[0]).toFixed(2)} rad/m</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Workspace;
