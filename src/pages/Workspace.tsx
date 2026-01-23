import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PendulumSimulation, PendulumSimulationHandle } from "@/components/simulations/PendulumSimulation";
import { ProjectileSimulation, ProjectileSimulationHandle } from "@/components/simulations/ProjectileSimulation";
import { SpringSimulation, SpringSimulationHandle } from "@/components/simulations/SpringSimulation";
import { WaveSimulation, WaveSimulationHandle } from "@/components/simulations/WaveSimulation";
import { CollisionSimulation, CollisionSimulationHandle } from "@/components/simulations/CollisionSimulation";
import { EMSpectrumVisualization } from "@/components/simulations/EMSpectrumVisualization";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { exportToCSV, exportToJSON, generatePDFReport } from "@/utils/exportData";
import { toast } from "sonner";
import { physicsPresets } from "@/data/physicsPresets";
import { 
  Play, Pause, RotateCcw, Download, FileText, Braces,
  FlaskConical, Target, Activity, Gauge, Waves, Zap, Radio, Info, HelpCircle
} from "lucide-react";

interface DataPoint {
  time: number;
  [key: string]: number;
}

// Tooltip wrapper for parameter controls
const ParamTooltip = ({ children, tip }: { children: React.ReactNode; tip: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="flex items-center gap-1 cursor-help">
        {children}
        <HelpCircle className="w-3 h-3 text-muted-foreground" />
      </div>
    </TooltipTrigger>
    <TooltipContent side="left" className="max-w-[200px] text-xs">
      {tip}
    </TooltipContent>
  </Tooltip>
);

const Workspace = () => {
  const [searchParams] = useSearchParams();
  const experimentType = searchParams.get('type') || 'pendulum';
  const experimentId = searchParams.get('experiment');
  
  const [activeSimulation, setActiveSimulation] = useState<string>(experimentType);
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
  const [pendulumPreset, setPendulumPreset] = useState('earth');

  // Projectile state
  const [projectileVelocity, setProjectileVelocity] = useState([20]);
  const [projectileAngle, setProjectileAngle] = useState([45]);
  const [projectileGravity, setProjectileGravity] = useState([9.8]);
  const [projectilePreset, setProjectilePreset] = useState('earth');

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

  const handleExportJSON = () => {
    if (graphData.length === 0) {
      toast.error('No data to export. Run the simulation first.');
      return;
    }
    exportToJSON(graphData, { simulationType: activeSimulation });
    toast.success('JSON exported successfully!');
  };

  const handlePendulumPresetChange = (presetId: string) => {
    setPendulumPreset(presetId);
    const preset = physicsPresets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') {
      setPendulumGravity([preset.gravity]);
    }
  };

  const handleProjectilePresetChange = (presetId: string) => {
    setProjectilePreset(presetId);
    const preset = physicsPresets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') {
      setProjectileGravity([preset.gravity]);
    }
  };

  const hasPlayControls = !['chemistry', 'emspectrum'].includes(activeSimulation);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-2 sm:px-4 bg-card flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">{activeSim?.category}</Badge>
            <h1 className="font-semibold text-sm sm:text-base truncate">{activeSim?.name}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <Tabs value={activeSimulation} onValueChange={handleSimulationChange}>
              <TabsList className="h-8 sm:h-9">
                {simulations.map(sim => (
                  <TabsTrigger key={sim.id} value={sim.id} className="text-xs gap-1 px-2 sm:px-3">
                    <sim.icon className="w-3 h-3" />
                    <span className="hidden lg:inline">{sim.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="w-px h-6 bg-border mx-1 sm:mx-2 hidden sm:block" />
            <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Export CSV" className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExportJSON} title="Export JSON" className="h-8 w-8 hidden sm:inline-flex">
              <Braces className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExportPDF} title="Export PDF Report" className="h-8 w-8 hidden sm:inline-flex">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Simulation Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative bg-gradient-to-b from-muted/50 to-muted min-h-[300px] sm:min-h-[400px]">
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

            {/* Bottom Playback Controls */}
            {hasPlayControls && (
              <div className="h-14 sm:h-16 border-t bg-card px-3 sm:px-4 flex items-center gap-3 sm:gap-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant={isPlaying ? "secondary" : "default"} size="icon" onClick={() => setIsPlaying(!isPlaying)} className="h-9 w-9 sm:h-10 sm:w-10">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset} className="h-9 w-9 sm:h-10 sm:w-10">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <div className="w-20 sm:w-32"><Slider value={speed} onValueChange={setSpeed} min={0.25} max={4} step={0.25} /></div>
                  <span className="text-xs sm:text-sm font-mono w-10 sm:w-12">{speed[0]}x</span>
                </div>
                {graphData.length > 0 && <div className="ml-auto text-xs text-muted-foreground hidden sm:block">{graphData.length} data points</div>}
              </div>
            )}
          </div>

          {/* Right Sidebar - Parameters Panel */}
          {hasPlayControls && (
            <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l bg-card p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-auto flex-shrink-0 max-h-[40vh] lg:max-h-none">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4" />
                Parameters
              </h3>

              {activeSimulation === 'pendulum' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Environment Preset</Label>
                    <Select value={pendulumPreset} onValueChange={handlePendulumPresetChange}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {physicsPresets.map(preset => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <span className="flex items-center gap-2">
                              <span>{preset.icon}</span>
                              <span>{preset.name}</span>
                              <span className="text-muted-foreground text-xs">({preset.gravity} m/s²)</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Mass affects the momentum and kinetic energy of the pendulum, but not its period in ideal conditions.">
                        <span>Mass (kg)</span>
                      </ParamTooltip>
                      <Input 
                        type="number" 
                        value={pendulumMass[0]} 
                        onChange={(e) => setPendulumMass([parseFloat(e.target.value) || 0.5])}
                        className="w-16 h-6 text-xs text-right"
                        min={0.5}
                        max={5}
                        step={0.1}
                      />
                    </div>
                    <Slider value={pendulumMass} onValueChange={setPendulumMass} min={0.5} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Longer pendulums have longer periods (T ∝ √L). This is why grandfather clocks use long pendulums.">
                        <span>Length (m)</span>
                      </ParamTooltip>
                      <span className="font-mono">{pendulumLength[0].toFixed(2)}</span>
                    </div>
                    <Slider value={pendulumLength} onValueChange={setPendulumLength} min={0.2} max={3} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Gravitational acceleration determines how quickly the pendulum accelerates. Higher gravity = faster swings.">
                        <span>Gravity (m/s²)</span>
                      </ParamTooltip>
                      <span className="font-mono">{pendulumGravity[0].toFixed(1)}</span>
                    </div>
                    <Slider value={pendulumGravity} onValueChange={(v) => { setPendulumGravity(v); setPendulumPreset('custom'); }} min={1} max={20} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Initial angle from vertical. Small angle approximation (sin θ ≈ θ) works well under 15°.">
                        <span>Initial Angle (°)</span>
                      </ParamTooltip>
                      <span className="font-mono">{pendulumAngle[0]}</span>
                    </div>
                    <Slider value={pendulumAngle} onValueChange={setPendulumAngle} min={5} max={90} step={1} />
                  </div>
                  <p className="text-xs text-muted-foreground">Change parameters then reset to apply.</p>
                </div>
              )}

              {activeSimulation === 'projectile' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Environment Preset</Label>
                    <Select value={projectilePreset} onValueChange={handleProjectilePresetChange}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {physicsPresets.map(preset => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <span className="flex items-center gap-2">
                              <span>{preset.icon}</span>
                              <span>{preset.name}</span>
                              <span className="text-muted-foreground text-xs">({preset.gravity} m/s²)</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Initial velocity determines how far and high the projectile travels. Range is proportional to v².">
                        <span>Velocity (m/s)</span>
                      </ParamTooltip>
                      <span className="font-mono">{projectileVelocity[0]}</span>
                    </div>
                    <Slider value={projectileVelocity} onValueChange={setProjectileVelocity} min={5} max={50} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="45° gives maximum range on flat ground. Steeper angles give more height, shallower angles give more horizontal distance.">
                        <span>Launch Angle (°)</span>
                      </ParamTooltip>
                      <span className="font-mono">{projectileAngle[0]}</span>
                    </div>
                    <Slider value={projectileAngle} onValueChange={setProjectileAngle} min={5} max={85} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Gravitational acceleration affects how quickly the projectile falls. Lower gravity means longer hang time.">
                        <span>Gravity (m/s²)</span>
                      </ParamTooltip>
                      <span className="font-mono">{projectileGravity[0].toFixed(1)}</span>
                    </div>
                    <Slider value={projectileGravity} onValueChange={(v) => { setProjectileGravity(v); setProjectilePreset('custom'); }} min={1} max={20} step={0.1} />
                  </div>
                  <p className="text-xs text-muted-foreground">Gravity updates live. Reset to change velocity/angle.</p>
                </div>
              )}

              {activeSimulation === 'spring' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Heavier masses oscillate slower (T ∝ √m). This is a key principle in mass-spring oscillators.">
                        <span>Mass (kg)</span>
                      </ParamTooltip>
                      <span className="font-mono">{springMass[0].toFixed(1)}</span>
                    </div>
                    <Slider value={springMass} onValueChange={setSpringMass} min={0.5} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Stiffness of the spring. Higher k means faster oscillations and stronger restoring force (F = -kx).">
                        <span>Spring Constant (N/m)</span>
                      </ParamTooltip>
                      <span className="font-mono">{springConstant[0]}</span>
                    </div>
                    <Slider value={springConstant} onValueChange={setSpringConstant} min={10} max={200} step={5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Damping removes energy from the system, causing oscillations to decay over time. Zero = ideal spring.">
                        <span>Damping</span>
                      </ParamTooltip>
                      <span className="font-mono">{springDamping[0].toFixed(2)}</span>
                    </div>
                    <Slider value={springDamping} onValueChange={setSpringDamping} min={0} max={1} step={0.05} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="How far the mass is pulled from equilibrium. Larger displacement = more potential energy stored.">
                        <span>Initial Displacement (m)</span>
                      </ParamTooltip>
                      <span className="font-mono">{springDisplacement[0].toFixed(1)}</span>
                    </div>
                    <Slider value={springDisplacement} onValueChange={setSpringDisplacement} min={0.5} max={5} step={0.5} />
                  </div>
                  <p className="text-xs text-muted-foreground">Spring constant and damping update live.</p>
                </div>
              )}

              {activeSimulation === 'wave' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm"><span>Wave Type</span></div>
                    <Select value={waveType} onValueChange={(v) => setWaveType(v as 'transverse' | 'longitudinal')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transverse">Transverse</SelectItem>
                        <SelectItem value="longitudinal">Longitudinal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Number of complete oscillations per second. Higher frequency = higher pitch for sound waves.">
                        <span>Frequency (Hz)</span>
                      </ParamTooltip>
                      <span className="font-mono">{waveFrequency[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveFrequency} onValueChange={setWaveFrequency} min={0.1} max={5} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Maximum displacement from equilibrium. Related to wave energy (E ∝ A²).">
                        <span>Amplitude (m)</span>
                      </ParamTooltip>
                      <span className="font-mono">{waveAmplitude[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveAmplitude} onValueChange={setWaveAmplitude} min={0.1} max={3} step={0.1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Distance between successive wave crests. Wave speed = frequency × wavelength.">
                        <span>Wavelength (m)</span>
                      </ParamTooltip>
                      <span className="font-mono">{waveWavelength[0].toFixed(1)}</span>
                    </div>
                    <Slider value={waveWavelength} onValueChange={setWaveWavelength} min={0.5} max={10} step={0.5} />
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Wave Properties</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Wave Speed</span><span className="font-mono">{(waveFrequency[0] * waveWavelength[0]).toFixed(2)} m/s</span></div>
                      <div className="flex justify-between"><span>Period</span><span className="font-mono">{(1 / waveFrequency[0]).toFixed(2)} s</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeSimulation === 'collision' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm"><span>Collision Type</span></div>
                    <Select value={collisionType} onValueChange={(v) => setCollisionType(v as 'elastic' | 'inelastic')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elastic">Elastic</SelectItem>
                        <SelectItem value="inelastic">Inelastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Mass of the first object. Heavier objects carry more momentum at the same velocity.">
                        <span>Mass 1 (kg)</span>
                      </ParamTooltip>
                      <span className="font-mono">{collisionMass1[0].toFixed(1)}</span>
                    </div>
                    <Slider value={collisionMass1} onValueChange={setCollisionMass1} min={0.5} max={5} step={0.5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Mass of the second object.">
                        <span>Mass 2 (kg)</span>
                      </ParamTooltip>
                      <span className="font-mono">{collisionMass2[0].toFixed(1)}</span>
                    </div>
                    <Slider value={collisionMass2} onValueChange={setCollisionMass2} min={0.5} max={5} step={0.5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Initial velocity of object 1. Positive values move right.">
                        <span>Velocity 1 (m/s)</span>
                      </ParamTooltip>
                      <span className="font-mono">{collisionVelocity1[0]}</span>
                    </div>
                    <Slider value={collisionVelocity1} onValueChange={setCollisionVelocity1} min={0} max={10} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <ParamTooltip tip="Initial velocity of object 2. Negative values move left (towards object 1).">
                        <span>Velocity 2 (m/s)</span>
                      </ParamTooltip>
                      <span className="font-mono">{collisionVelocity2[0]}</span>
                    </div>
                    <Slider value={collisionVelocity2} onValueChange={setCollisionVelocity2} min={0} max={10} step={1} />
                  </div>
                  <p className="text-xs text-muted-foreground">Reset to apply parameter changes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Workspace;
