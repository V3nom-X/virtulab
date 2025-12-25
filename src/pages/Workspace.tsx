import { useState, useRef, useCallback, useEffect } from "react";
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
import { CollisionSimulation, CollisionSimulationHandle } from "@/components/simulations/CollisionSimulation";
import { EMSpectrumVisualization } from "@/components/simulations/EMSpectrumVisualization";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportToCSV, generatePDFReport } from "@/utils/exportData";
import { toast } from "sonner";
import { 
  Play, Pause, RotateCcw, Maximize2, Settings2, Download, FileText,
  FlaskConical, Target, Activity, Gauge, Waves, Trash2, BarChart3, Zap, Radio
} from "lucide-react";

interface DataPoint {
  time: number;
  [key: string]: number;
}

const Workspace = () => {
  const [searchParams] = useSearchParams();
  const experimentType = searchParams.get('type') || 'pendulum';
  const experimentId = searchParams.get('experiment');
  
  const [activeSimulation, setActiveSimulation] = useState<string>(experimentType);
  const [showGraphs, setShowGraphs] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [graphData, setGraphData] = useState<DataPoint[]>([]);
  const maxDataPoints = 150;
  
  // Guard to prevent data updates during transitions
  const acceptDataRef = useRef(true);

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

  // Collision state
  const [collisionMass1, setCollisionMass1] = useState([2]);
  const [collisionMass2, setCollisionMass2] = useState([1]);
  const [collisionVelocity1, setCollisionVelocity1] = useState([5]);
  const [collisionVelocity2, setCollisionVelocity2] = useState([3]);
  const [collisionType, setCollisionType] = useState<'elastic' | 'inelastic'>('elastic');

  // Simulation refs
  const pendulumRef = useRef<PendulumSimulationHandle>(null);
  const projectileRef = useRef<ProjectileSimulationHandle>(null);
  const springRef = useRef<SpringSimulationHandle>(null);
  const waveRef = useRef<WaveSimulationHandle>(null);
  const collisionRef = useRef<CollisionSimulationHandle>(null);

  const simulations = [
    { id: 'pendulum', name: 'Pendulum', icon: Activity, category: 'Physics' },
    { id: 'projectile', name: 'Projectile', icon: Target, category: 'Physics' },
    { id: 'spring', name: 'Spring', icon: Activity, category: 'Physics' },
    { id: 'wave', name: 'Wave', icon: Waves, category: 'Physics' },
    { id: 'collision', name: 'Collision', icon: Zap, category: 'Physics' },
    { id: 'emspectrum', name: 'EM Spectrum', icon: Radio, category: 'Physics' },
    { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, category: 'Chemistry' },
  ];

  // Reset graph data when experiment type or id changes
  useEffect(() => {
    // Temporarily stop accepting data updates during transition
    acceptDataRef.current = false;
    setIsPlaying(false);
    setGraphData([]);
    setActiveSimulation(experimentType);
    
    // Reset all simulation refs
    pendulumRef.current?.reset();
    projectileRef.current?.reset();
    springRef.current?.reset();
    waveRef.current?.reset();
    collisionRef.current?.reset();
    
    // Re-enable data updates after a short delay to ensure cleanup is complete
    const timeoutId = setTimeout(() => {
      acceptDataRef.current = true;
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [experimentType, experimentId]);

  const activeSim = simulations.find(s => s.id === activeSimulation);

  const handleDataUpdate = useCallback((data: DataPoint) => {
    // Only accept data if the guard allows it
    if (!acceptDataRef.current) return;
    
    setGraphData(prev => {
      const newData = [...prev, data];
      return newData.length > maxDataPoints ? newData.slice(-maxDataPoints) : newData;
    });
  }, []);

  const handleReset = () => {
    setIsPlaying(false);
    setGraphData([]);
    if (activeSimulation === 'pendulum') pendulumRef.current?.reset();
    else if (activeSimulation === 'projectile') projectileRef.current?.reset();
    else if (activeSimulation === 'spring') springRef.current?.reset();
    else if (activeSimulation === 'wave') waveRef.current?.reset();
    else if (activeSimulation === 'collision') collisionRef.current?.reset();
  };

  const handleSimulationChange = (v: string) => {
    setActiveSimulation(v);
    setIsPlaying(false);
    setGraphData([]);
  };

  const handleExportCSV = () => {
    if (graphData.length === 0) {
      toast.error('No data to export. Run the simulation first.');
      return;
    }
    exportToCSV(graphData, { simulationType: activeSimulation });
    toast.success('CSV exported successfully!');
  };

  const handleExportPDF = () => {
    if (graphData.length === 0) {
      toast.error('No data to export. Run the simulation first.');
      return;
    }
    generatePDFReport(graphData, { simulationType: activeSimulation });
    toast.success('PDF report generated!');
  };

  const getGraphConfig = () => {
    switch (activeSimulation) {
      case 'pendulum':
        return { lines: [
          { dataKey: 'angle', name: 'Angle (°)', color: 'hsl(168, 76%, 46%)' },
          { dataKey: 'velocity', name: 'Velocity', color: 'hsl(0, 84%, 60%)' },
          { dataKey: 'energy', name: 'Energy', color: 'hsl(45, 93%, 47%)' },
        ]};
      case 'projectile':
        return { lines: [
          { dataKey: 'x', name: 'X Pos', color: 'hsl(168, 76%, 46%)' },
          { dataKey: 'y', name: 'Y Pos', color: 'hsl(0, 84%, 60%)' },
        ]};
      case 'spring':
        return { lines: [
          { dataKey: 'displacement', name: 'Displacement', color: 'hsl(168, 76%, 46%)' },
          { dataKey: 'velocity', name: 'Velocity', color: 'hsl(0, 84%, 60%)' },
        ]};
      case 'wave':
        return { lines: [
          { dataKey: 'displacement', name: 'Displacement', color: 'hsl(168, 76%, 46%)' },
          { dataKey: 'velocity', name: 'Velocity', color: 'hsl(0, 84%, 60%)' },
        ]};
      case 'collision':
        return { lines: [
          { dataKey: 'momentum', name: 'Momentum', color: 'hsl(168, 76%, 46%)' },
          { dataKey: 'kineticEnergy', name: 'KE', color: 'hsl(0, 84%, 60%)' },
          { dataKey: 'v1', name: 'v₁', color: 'hsl(45, 93%, 47%)' },
          { dataKey: 'v2', name: 'v₂', color: 'hsl(280, 65%, 60%)' },
        ]};
      default:
        return { lines: [] };
    }
  };

  const graphConfig = getGraphConfig();
  const hasPlayControls = !['chemistry', 'emspectrum'].includes(activeSimulation);
  const hasGraph = !['chemistry', 'emspectrum'].includes(activeSimulation);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{activeSim?.category}</Badge>
            <h1 className="font-semibold">{activeSim?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={activeSimulation} onValueChange={handleSimulationChange}>
              <TabsList className="h-9">
                {simulations.map(sim => (
                  <TabsTrigger key={sim.id} value={sim.id} className="text-xs gap-1">
                    <sim.icon className="w-3 h-3" />
                    <span className="hidden md:inline">{sim.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="w-px h-6 bg-border mx-2" />
            {hasGraph && (
              <Button variant={showGraphs ? "secondary" : "ghost"} size="icon" onClick={() => setShowGraphs(!showGraphs)}>
                <BarChart3 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Export CSV">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExportPDF} title="Export PDF Report">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className={`${showGraphs && hasGraph ? 'flex-[2]' : 'flex-1'} relative bg-gradient-to-b from-muted/50 to-muted`}>
              {activeSimulation === 'pendulum' && (
                <PendulumSimulation ref={pendulumRef} mass={pendulumMass[0]} length={pendulumLength[0]} gravity={pendulumGravity[0]} angle={pendulumAngle[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />
              )}
              {activeSimulation === 'projectile' && (
                <ProjectileSimulation ref={projectileRef} velocity={projectileVelocity[0]} angle={projectileAngle[0]} gravity={projectileGravity[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />
              )}
              {activeSimulation === 'spring' && (
                <SpringSimulation ref={springRef} mass={springMass[0]} springConstant={springConstant[0]} damping={springDamping[0]} displacement={springDisplacement[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />
              )}
              {activeSimulation === 'wave' && (
                <WaveSimulation ref={waveRef} frequency={waveFrequency[0]} amplitude={waveAmplitude[0]} wavelength={waveWavelength[0]} waveType={waveType} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />
              )}
              {activeSimulation === 'collision' && (
                <CollisionSimulation ref={collisionRef} mass1={collisionMass1[0]} mass2={collisionMass2[0]} velocity1={collisionVelocity1[0]} velocity2={collisionVelocity2[0]} collisionType={collisionType} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />
              )}
              {activeSimulation === 'emspectrum' && <EMSpectrumVisualization />}
              {activeSimulation === 'chemistry' && <ChemistryWorkspace />}
            </div>

            {/* Graph */}
            {showGraphs && hasGraph && (
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
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        {graphConfig.lines.map((line) => (
                          <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} name={line.name} stroke={line.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Playback Controls */}
            {hasPlayControls && (
              <div className="h-16 border-t bg-card px-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Button variant={isPlaying ? "secondary" : "default"} size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <div className="w-32"><Slider value={speed} onValueChange={setSpeed} min={0.25} max={4} step={0.25} /></div>
                  <span className="text-sm font-mono w-12">{speed[0]}x</span>
                </div>
                {graphData.length > 0 && <div className="ml-auto text-xs text-muted-foreground">{graphData.length} data points</div>}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {hasPlayControls && (
            <div className="w-72 border-l bg-card p-4 space-y-6 overflow-auto">
              <h3 className="font-semibold">Parameters</h3>

              {activeSimulation === 'pendulum' && (
                <>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Mass (kg)</span><span className="font-mono">{pendulumMass[0].toFixed(1)}</span></div><Slider value={pendulumMass} onValueChange={setPendulumMass} min={0.5} max={5} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Length (m)</span><span className="font-mono">{pendulumLength[0].toFixed(2)}</span></div><Slider value={pendulumLength} onValueChange={setPendulumLength} min={0.2} max={3} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Gravity (m/s²)</span><span className="font-mono">{pendulumGravity[0].toFixed(1)}</span></div><Slider value={pendulumGravity} onValueChange={setPendulumGravity} min={1} max={20} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Initial Angle (°)</span><span className="font-mono">{pendulumAngle[0]}</span></div><Slider value={pendulumAngle} onValueChange={setPendulumAngle} min={5} max={90} step={1} /></div>
                  <p className="text-xs text-muted-foreground">Note: Change mass/length/angle then reset to apply.</p>
                </>
              )}

              {activeSimulation === 'projectile' && (
                <>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Velocity (m/s)</span><span className="font-mono">{projectileVelocity[0]}</span></div><Slider value={projectileVelocity} onValueChange={setProjectileVelocity} min={5} max={50} step={1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Launch Angle (°)</span><span className="font-mono">{projectileAngle[0]}</span></div><Slider value={projectileAngle} onValueChange={setProjectileAngle} min={5} max={85} step={1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Gravity (m/s²)</span><span className="font-mono">{projectileGravity[0].toFixed(1)}</span></div><Slider value={projectileGravity} onValueChange={setProjectileGravity} min={1} max={20} step={0.1} /></div>
                  <p className="text-xs text-muted-foreground">Gravity updates live. Reset to change velocity/angle.</p>
                </>
              )}

              {activeSimulation === 'spring' && (
                <>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Mass (kg)</span><span className="font-mono">{springMass[0].toFixed(1)}</span></div><Slider value={springMass} onValueChange={setSpringMass} min={0.5} max={5} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Spring Constant (N/m)</span><span className="font-mono">{springConstant[0]}</span></div><Slider value={springConstant} onValueChange={setSpringConstant} min={10} max={200} step={5} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Damping</span><span className="font-mono">{springDamping[0].toFixed(2)}</span></div><Slider value={springDamping} onValueChange={setSpringDamping} min={0} max={1} step={0.05} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Initial Displacement (m)</span><span className="font-mono">{springDisplacement[0].toFixed(1)}</span></div><Slider value={springDisplacement} onValueChange={setSpringDisplacement} min={0.5} max={5} step={0.5} /></div>
                  <p className="text-xs text-muted-foreground">Spring constant and damping update live.</p>
                </>
              )}

              {activeSimulation === 'wave' && (
                <>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Wave Type</span></div><Select value={waveType} onValueChange={(v) => setWaveType(v as 'transverse' | 'longitudinal')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="transverse">Transverse</SelectItem><SelectItem value="longitudinal">Longitudinal</SelectItem></SelectContent></Select></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Frequency (Hz)</span><span className="font-mono">{waveFrequency[0].toFixed(1)}</span></div><Slider value={waveFrequency} onValueChange={setWaveFrequency} min={0.1} max={5} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Amplitude (m)</span><span className="font-mono">{waveAmplitude[0].toFixed(1)}</span></div><Slider value={waveAmplitude} onValueChange={setWaveAmplitude} min={0.1} max={3} step={0.1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Wavelength (m)</span><span className="font-mono">{waveWavelength[0].toFixed(1)}</span></div><Slider value={waveWavelength} onValueChange={setWaveWavelength} min={0.5} max={10} step={0.5} /></div>
                  <div className="border-t pt-4"><h4 className="text-sm font-medium mb-2">Wave Properties</h4><div className="space-y-1 text-xs text-muted-foreground"><div className="flex justify-between"><span>Wave Speed</span><span className="font-mono">{(waveFrequency[0] * waveWavelength[0]).toFixed(2)} m/s</span></div><div className="flex justify-between"><span>Period</span><span className="font-mono">{(1 / waveFrequency[0]).toFixed(2)} s</span></div></div></div>
                </>
              )}

              {activeSimulation === 'collision' && (
                <>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Collision Type</span></div><Select value={collisionType} onValueChange={(v) => setCollisionType(v as 'elastic' | 'inelastic')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="elastic">Elastic</SelectItem><SelectItem value="inelastic">Inelastic</SelectItem></SelectContent></Select></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Mass 1 (kg)</span><span className="font-mono">{collisionMass1[0].toFixed(1)}</span></div><Slider value={collisionMass1} onValueChange={setCollisionMass1} min={0.5} max={5} step={0.5} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Mass 2 (kg)</span><span className="font-mono">{collisionMass2[0].toFixed(1)}</span></div><Slider value={collisionMass2} onValueChange={setCollisionMass2} min={0.5} max={5} step={0.5} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Velocity 1 (m/s)</span><span className="font-mono">{collisionVelocity1[0]}</span></div><Slider value={collisionVelocity1} onValueChange={setCollisionVelocity1} min={0} max={10} step={1} /></div>
                  <div><div className="flex justify-between mb-2 text-sm"><span>Velocity 2 (m/s)</span><span className="font-mono">{collisionVelocity2[0]}</span></div><Slider value={collisionVelocity2} onValueChange={setCollisionVelocity2} min={0} max={10} step={1} /></div>
                  <p className="text-xs text-muted-foreground">Reset to apply parameter changes.</p>
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
