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
import { OhmsLawSimulation, OhmsLawSimulationHandle } from "@/components/simulations/OhmsLawSimulation";
import { InclinedPlaneSimulation, InclinedPlaneSimulationHandle } from "@/components/simulations/InclinedPlaneSimulation";
import { LightOpticsSimulation, LightOpticsSimulationHandle } from "@/components/simulations/LightOpticsSimulation";
import { BuoyancySimulation, BuoyancySimulationHandle } from "@/components/simulations/BuoyancySimulation";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { AcidBaseSimulation, AcidBaseSimulationHandle } from "@/components/simulations/AcidBaseSimulation";
import { FrictionSimulation, FrictionSimulationHandle } from "@/components/simulations/FrictionSimulation";
import { LeverSimulation, LeverSimulationHandle } from "@/components/simulations/LeverSimulation";
import { ExpansionSimulation, ExpansionSimulationHandle } from "@/components/simulations/ExpansionSimulation";
import { StatesOfMatterSimulation, StatesOfMatterSimulationHandle } from "@/components/simulations/StatesOfMatterSimulation";
import { DiffusionOsmosisSimulation, DiffusionOsmosisSimulationHandle } from "@/components/simulations/DiffusionOsmosisSimulation";
import { MobileParametersDrawer } from "@/components/workspace/MobileParametersDrawer";
import { ExperimentEducation } from "@/components/workspace/ExperimentEducation";
import { DataVisualizationPanel } from "@/components/workspace/DataVisualizationPanel";
import { exportToCSV, exportToJSON, generatePDFReport } from "@/utils/exportData";
import { SimulationLoader } from "@/components/simulations/SimulationLoader";
import { toast } from "sonner";
import { physicsPresets } from "@/data/physicsPresets";
import { 
  Play, Pause, RotateCcw, Download, FileText, Braces,
  FlaskConical, Target, Activity, Gauge, Waves, Zap, Radio, Info, HelpCircle,
  BarChart3, BookOpen, Cpu, Mountain, Sun, Droplets
} from "lucide-react";

interface DataPoint {
  time: number;
  [key: string]: number;
}

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
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const maxDataPoints = 500;
  
  const acceptDataRef = useRef(true);

  const [pendulumMass, setPendulumMass] = useState([1.5]);
  const [pendulumLength, setPendulumLength] = useState([1]);
  const [pendulumGravity, setPendulumGravity] = useState([9.8]);
  const [pendulumAngle, setPendulumAngle] = useState([45]);
  const [pendulumPreset, setPendulumPreset] = useState('earth');

  const [projectileVelocity, setProjectileVelocity] = useState([20]);
  const [projectileAngle, setProjectileAngle] = useState([45]);
  const [projectileGravity, setProjectileGravity] = useState([9.8]);
  const [projectilePreset, setProjectilePreset] = useState('earth');

  const [springMass, setSpringMass] = useState([1]);
  const [springConstant, setSpringConstant] = useState([50]);
  const [springDamping, setSpringDamping] = useState([0.1]);
  const [springDisplacement, setSpringDisplacement] = useState([2]);

  const [waveFrequency, setWaveFrequency] = useState([1]);
  const [waveAmplitude, setWaveAmplitude] = useState([1]);
  const [waveWavelength, setWaveWavelength] = useState([2]);
  const [waveType, setWaveType] = useState<'transverse' | 'longitudinal'>('transverse');

  const [collisionMass1, setCollisionMass1] = useState([2]);
  const [collisionMass2, setCollisionMass2] = useState([1]);
  const [collisionVelocity1, setCollisionVelocity1] = useState([5]);
  const [collisionVelocity2, setCollisionVelocity2] = useState([3]);
  const [collisionType, setCollisionType] = useState<'elastic' | 'inelastic'>('elastic');

  // New simulation states
  const [ohmsVoltage, setOhmsVoltage] = useState([12]);
  const [ohmsResistance, setOhmsResistance] = useState([100]);

  const [inclineAngle, setInclineAngle] = useState([30]);
  const [inclineMass, setInclineMass] = useState([2]);
  const [inclineFriction, setInclineFriction] = useState([0.2]);

  const [opticsAngle, setOpticsAngle] = useState([45]);
  const [opticsMedium1, setOpticsMedium1] = useState<'air' | 'water' | 'glass'>('air');
  const [opticsMedium2, setOpticsMedium2] = useState<'air' | 'water' | 'glass'>('glass');
  const [opticsSurface, setOpticsSurface] = useState<'mirror' | 'transparent'>('transparent');

  const [buoyancyObjectDensity, setBuoyancyObjectDensity] = useState([500]);
  const [buoyancyFluidDensity, setBuoyancyFluidDensity] = useState([1000]);
  const [buoyancyVolume, setBuoyancyVolume] = useState([1]);

  // New experiment states
  const [acidBasePH, setAcidBasePH] = useState([7]);
  const [acidBaseIndicator, setAcidBaseIndicator] = useState<'litmus' | 'phenolphthalein' | 'methyl_orange' | 'universal'>('universal');

  const [frictionMass, setFrictionMass] = useState([2]);
  const [frictionAppliedForce, setFrictionAppliedForce] = useState([15]);
  const [frictionCoeff, setFrictionCoeff] = useState([0.3]);
  const [frictionSurface, setFrictionSurface] = useState<'wood' | 'ice' | 'rubber' | 'steel'>('wood');

  const [leverLoadMass, setLeverLoadMass] = useState([5]);
  const [leverEffortForce, setLeverEffortForce] = useState([20]);
  const [leverFulcrumPos, setLeverFulcrumPos] = useState([0.3]);

  const [expansionTemp, setExpansionTemp] = useState([100]);
  const [expansionMaterial, setExpansionMaterial] = useState<'iron' | 'copper' | 'aluminum' | 'glass'>('iron');

  const [statesTemp, setStatesTemp] = useState([25]);
  const [statesSubstance, setStatesSubstance] = useState<'water' | 'iron' | 'oxygen' | 'wax'>('water');

  const [diffusionMode, setDiffusionMode] = useState<'diffusion' | 'osmosis'>('diffusion');
  const [diffusionConcLeft, setDiffusionConcLeft] = useState([8]);
  const [diffusionConcRight, setDiffusionConcRight] = useState([2]);
  const [diffusionPermeability, setDiffusionPermeability] = useState([0.5]);

  const pendulumRef = useRef<PendulumSimulationHandle>(null);
  const projectileRef = useRef<ProjectileSimulationHandle>(null);
  const springRef = useRef<SpringSimulationHandle>(null);
  const waveRef = useRef<WaveSimulationHandle>(null);
  const collisionRef = useRef<CollisionSimulationHandle>(null);
  const ohmsLawRef = useRef<OhmsLawSimulationHandle>(null);
  const inclinedPlaneRef = useRef<InclinedPlaneSimulationHandle>(null);
  const lightOpticsRef = useRef<LightOpticsSimulationHandle>(null);
  const buoyancyRef = useRef<BuoyancySimulationHandle>(null);
  const acidBaseRef = useRef<AcidBaseSimulationHandle>(null);
  const frictionRef = useRef<FrictionSimulationHandle>(null);
  const leverRef = useRef<LeverSimulationHandle>(null);
  const expansionRef = useRef<ExpansionSimulationHandle>(null);
  const statesOfMatterRef = useRef<StatesOfMatterSimulationHandle>(null);
  const diffusionOsmosisRef = useRef<DiffusionOsmosisSimulationHandle>(null);

  const simulations = [
    { id: 'pendulum', name: 'Pendulum', icon: Activity, category: 'Physics', shortName: 'Pend' },
    { id: 'projectile', name: 'Projectile', icon: Target, category: 'Physics', shortName: 'Proj' },
    { id: 'spring', name: 'Spring', icon: Activity, category: 'Physics', shortName: 'Sprg' },
    { id: 'wave', name: 'Wave', icon: Waves, category: 'Physics', shortName: 'Wave' },
    { id: 'collision', name: 'Collision', icon: Zap, category: 'Physics', shortName: 'Coll' },
    { id: 'ohmslaw', name: "Ohm's Law", icon: Cpu, category: 'Physics', shortName: 'Ohm' },
    { id: 'inclinedplane', name: 'Inclined Plane', icon: Mountain, category: 'Physics', shortName: 'Incl' },
    { id: 'lightoptics', name: 'Light Optics', icon: Sun, category: 'Physics', shortName: 'Opt' },
    { id: 'buoyancy', name: 'Buoyancy', icon: Droplets, category: 'Physics', shortName: 'Buoy' },
    { id: 'friction', name: 'Friction', icon: Activity, category: 'Physics', shortName: 'Fric' },
    { id: 'lever', name: 'Lever', icon: Activity, category: 'Physics', shortName: 'Levr' },
    { id: 'expansion', name: 'Expansion', icon: Activity, category: 'Physics', shortName: 'Exp' },
    { id: 'emspectrum', name: 'EM Spectrum', icon: Radio, category: 'Physics', shortName: 'EM' },
    { id: 'acidbase', name: 'Acids & Bases', icon: FlaskConical, category: 'Chemistry', shortName: 'Acid' },
    { id: 'statesofmatter', name: 'States of Matter', icon: FlaskConical, category: 'Chemistry', shortName: 'SoM' },
    { id: 'chemistry', name: 'Chemistry Lab', icon: FlaskConical, category: 'Chemistry', shortName: 'Chem' },
    { id: 'diffusionosmosis', name: 'Diffusion', icon: Droplets, category: 'Biology', shortName: 'Diff' },
  ];

  const getDataSeries = () => {
    switch (activeSimulation) {
      case 'pendulum':
        return [
          { key: 'angle', name: 'Angle', color: 'hsl(var(--primary))', unit: '°' },
          { key: 'velocity', name: 'Angular Velocity', color: 'hsl(142, 71%, 45%)', unit: 'rad/s' },
          { key: 'energy', name: 'Energy', color: 'hsl(45, 93%, 47%)', unit: 'J' },
        ];
      case 'projectile':
        return [
          { key: 'x', name: 'X Position', color: 'hsl(var(--primary))', unit: 'm' },
          { key: 'y', name: 'Y Position', color: 'hsl(142, 71%, 45%)', unit: 'm' },
          { key: 'velocity', name: 'Velocity', color: 'hsl(45, 93%, 47%)', unit: 'm/s' },
        ];
      case 'spring':
        return [
          { key: 'displacement', name: 'Displacement', color: 'hsl(var(--primary))', unit: 'm' },
          { key: 'velocity', name: 'Velocity', color: 'hsl(142, 71%, 45%)', unit: 'm/s' },
          { key: 'energy', name: 'Energy', color: 'hsl(45, 93%, 47%)', unit: 'J' },
        ];
      case 'wave':
        return [
          { key: 'amplitude', name: 'Amplitude', color: 'hsl(var(--primary))', unit: 'm' },
          { key: 'phase', name: 'Phase', color: 'hsl(142, 71%, 45%)', unit: 'rad' },
        ];
      case 'collision':
        return [
          { key: 'momentum', name: 'Total Momentum', color: 'hsl(var(--primary))', unit: 'kg·m/s' },
          { key: 'kineticEnergy', name: 'Kinetic Energy', color: 'hsl(142, 71%, 45%)', unit: 'J' },
        ];
      case 'ohmslaw':
        return [
          { key: 'current', name: 'Current', color: 'hsl(var(--primary))', unit: 'A' },
          { key: 'power', name: 'Power', color: 'hsl(142, 71%, 45%)', unit: 'W' },
        ];
      case 'inclinedplane':
        return [
          { key: 'position', name: 'Position', color: 'hsl(var(--primary))', unit: 'm' },
          { key: 'velocity', name: 'Velocity', color: 'hsl(142, 71%, 45%)', unit: 'm/s' },
          { key: 'acceleration', name: 'Acceleration', color: 'hsl(45, 93%, 47%)', unit: 'm/s²' },
        ];
      case 'lightoptics':
        return [
          { key: 'incidenceAngle', name: 'Incidence Angle', color: 'hsl(var(--primary))', unit: '°' },
          { key: 'refractionAngle', name: 'Refraction Angle', color: 'hsl(142, 71%, 45%)', unit: '°' },
        ];
      case 'buoyancy':
        return [
          { key: 'buoyantForce', name: 'Buoyant Force', color: 'hsl(var(--primary))', unit: 'N' },
          { key: 'weight', name: 'Weight', color: 'hsl(142, 71%, 45%)', unit: 'N' },
          { key: 'netForce', name: 'Net Force', color: 'hsl(45, 93%, 47%)', unit: 'N' },
        ];
      case 'acidbase':
        return [
          { key: 'pH', name: 'pH', color: 'hsl(var(--primary))', unit: '' },
          { key: 'hConcentration', name: 'H⁺ Concentration', color: 'hsl(142, 71%, 45%)', unit: 'M' },
        ];
      case 'friction':
        return [
          { key: 'position', name: 'Position', color: 'hsl(var(--primary))', unit: 'm' },
          { key: 'velocity', name: 'Velocity', color: 'hsl(142, 71%, 45%)', unit: 'm/s' },
          { key: 'acceleration', name: 'Acceleration', color: 'hsl(45, 93%, 47%)', unit: 'm/s²' },
        ];
      case 'lever':
        return [
          { key: 'mechanicalAdvantage', name: 'Mech. Advantage', color: 'hsl(var(--primary))', unit: '' },
          { key: 'effortRequired', name: 'Effort Required', color: 'hsl(142, 71%, 45%)', unit: 'N' },
        ];
      case 'expansion':
        return [
          { key: 'expansion', name: 'Expansion', color: 'hsl(var(--primary))', unit: 'mm' },
          { key: 'temperature', name: 'Temperature', color: 'hsl(142, 71%, 45%)', unit: '°C' },
        ];
      case 'statesofmatter':
        return [
          { key: 'temperature', name: 'Temperature', color: 'hsl(var(--primary))', unit: '°C' },
        ];
      case 'diffusionosmosis':
        return [
          { key: 'leftConc', name: 'Left Concentration', color: 'hsl(var(--primary))', unit: 'M' },
          { key: 'rightConc', name: 'Right Concentration', color: 'hsl(142, 71%, 45%)', unit: 'M' },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    acceptDataRef.current = false;
    setIsPlaying(false);
    setGraphData([]);
    setActiveSimulation(experimentType);
    pendulumRef.current?.reset();
    projectileRef.current?.reset();
    springRef.current?.reset();
    waveRef.current?.reset();
    collisionRef.current?.reset();
    const timeoutId = setTimeout(() => { acceptDataRef.current = true; }, 100);
    return () => clearTimeout(timeoutId);
  }, [experimentType, experimentId]);

  const activeSim = simulations.find(s => s.id === activeSimulation);

  const handleDataUpdate = useCallback((data: DataPoint) => {
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
    else if (activeSimulation === 'ohmslaw') ohmsLawRef.current?.reset();
    else if (activeSimulation === 'inclinedplane') inclinedPlaneRef.current?.reset();
    else if (activeSimulation === 'lightoptics') lightOpticsRef.current?.reset();
    else if (activeSimulation === 'buoyancy') buoyancyRef.current?.reset();
    else if (activeSimulation === 'acidbase') acidBaseRef.current?.reset();
    else if (activeSimulation === 'friction') frictionRef.current?.reset();
    else if (activeSimulation === 'lever') leverRef.current?.reset();
    else if (activeSimulation === 'expansion') expansionRef.current?.reset();
    else if (activeSimulation === 'statesofmatter') statesOfMatterRef.current?.reset();
    else if (activeSimulation === 'diffusionosmosis') diffusionOsmosisRef.current?.reset();
  };

  const handleSimulationChange = (v: string) => {
    setActiveSimulation(v);
    setIsPlaying(false);
    setGraphData([]);
  };

  const handleExportCSV = () => {
    if (graphData.length === 0) { toast.error('No data to export. Run the simulation first.'); return; }
    exportToCSV(graphData, { simulationType: activeSimulation });
    toast.success('CSV exported successfully!');
  };

  const handleExportPDF = () => {
    if (graphData.length === 0) { toast.error('No data to export. Run the simulation first.'); return; }
    generatePDFReport(graphData, { simulationType: activeSimulation });
    toast.success('PDF report generated!');
  };

  const handleExportJSON = () => {
    if (graphData.length === 0) { toast.error('No data to export. Run the simulation first.'); return; }
    exportToJSON(graphData, { simulationType: activeSimulation });
    toast.success('JSON exported successfully!');
  };

  const handlePendulumPresetChange = (presetId: string) => {
    setPendulumPreset(presetId);
    const preset = physicsPresets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') setPendulumGravity([preset.gravity]);
  };

  const handleProjectilePresetChange = (presetId: string) => {
    setProjectilePreset(presetId);
    const preset = physicsPresets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') setProjectileGravity([preset.gravity]);
  };

  const hasPlayControls = !['chemistry', 'emspectrum', 'acidbase'].includes(activeSimulation);

  const renderParameterControls = () => (
    <div className="space-y-4">
      {activeSimulation === 'pendulum' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Environment Preset</Label>
            <Select value={pendulumPreset} onValueChange={handlePendulumPresetChange}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select environment" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {physicsPresets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <span className="flex items-center gap-2"><span>{preset.icon}</span><span>{preset.name}</span><span className="text-muted-foreground text-xs">({preset.gravity} m/s²)</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Mass affects momentum and kinetic energy."><span>Mass (kg)</span></ParamTooltip><Input type="number" value={pendulumMass[0]} onChange={(e) => setPendulumMass([parseFloat(e.target.value) || 0.5])} className="w-16 h-6 text-xs text-right" min={0.5} max={5} step={0.1} /></div>
            <Slider value={pendulumMass} onValueChange={setPendulumMass} min={0.5} max={5} step={0.1} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Longer pendulums have longer periods (T ∝ √L)."><span>Length (m)</span></ParamTooltip><span className="font-mono">{pendulumLength[0].toFixed(2)}</span></div>
            <Slider value={pendulumLength} onValueChange={setPendulumLength} min={0.2} max={3} step={0.1} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Higher gravity = faster swings."><span>Gravity (m/s²)</span></ParamTooltip><span className="font-mono">{pendulumGravity[0].toFixed(1)}</span></div>
            <Slider value={pendulumGravity} onValueChange={(v) => { setPendulumGravity(v); setPendulumPreset('custom'); }} min={1} max={20} step={0.1} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Initial angle from vertical."><span>Initial Angle (°)</span></ParamTooltip><span className="font-mono">{pendulumAngle[0]}</span></div>
            <Slider value={pendulumAngle} onValueChange={setPendulumAngle} min={5} max={90} step={1} />
          </div>
          <p className="text-xs text-muted-foreground">Reset to apply changes.</p>
        </div>
      )}
      {activeSimulation === 'projectile' && (
        <div className="space-y-4">
          <div><Label className="text-sm mb-2 block">Environment Preset</Label><Select value={projectilePreset} onValueChange={handleProjectilePresetChange}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent className="bg-popover">{physicsPresets.map(p => <SelectItem key={p.id} value={p.id}><span className="flex items-center gap-2"><span>{p.icon}</span><span>{p.name}</span></span></SelectItem>)}</SelectContent></Select></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Initial velocity."><span>Velocity (m/s)</span></ParamTooltip><span className="font-mono">{projectileVelocity[0]}</span></div><Slider value={projectileVelocity} onValueChange={setProjectileVelocity} min={5} max={50} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="45° gives maximum range."><span>Launch Angle (°)</span></ParamTooltip><span className="font-mono">{projectileAngle[0]}</span></div><Slider value={projectileAngle} onValueChange={setProjectileAngle} min={5} max={85} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Gravitational acceleration."><span>Gravity (m/s²)</span></ParamTooltip><span className="font-mono">{projectileGravity[0].toFixed(1)}</span></div><Slider value={projectileGravity} onValueChange={(v) => { setProjectileGravity(v); setProjectilePreset('custom'); }} min={1} max={20} step={0.1} /></div>
        </div>
      )}
      {activeSimulation === 'spring' && (
        <div className="space-y-4">
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Heavier masses oscillate slower."><span>Mass (kg)</span></ParamTooltip><span className="font-mono">{springMass[0].toFixed(1)}</span></div><Slider value={springMass} onValueChange={setSpringMass} min={0.5} max={5} step={0.1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Spring stiffness (F = -kx)."><span>Spring Constant (N/m)</span></ParamTooltip><span className="font-mono">{springConstant[0]}</span></div><Slider value={springConstant} onValueChange={setSpringConstant} min={10} max={200} step={5} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Damping removes energy."><span>Damping</span></ParamTooltip><span className="font-mono">{springDamping[0].toFixed(2)}</span></div><Slider value={springDamping} onValueChange={setSpringDamping} min={0} max={1} step={0.05} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Initial displacement."><span>Displacement (m)</span></ParamTooltip><span className="font-mono">{springDisplacement[0].toFixed(1)}</span></div><Slider value={springDisplacement} onValueChange={setSpringDisplacement} min={0.5} max={5} step={0.5} /></div>
        </div>
      )}
      {activeSimulation === 'wave' && (
        <div className="space-y-4">
          <div><Label className="text-sm mb-2 block">Wave Type</Label><Select value={waveType} onValueChange={(v) => setWaveType(v as 'transverse' | 'longitudinal')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="transverse">Transverse</SelectItem><SelectItem value="longitudinal">Longitudinal</SelectItem></SelectContent></Select></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Oscillations per second."><span>Frequency (Hz)</span></ParamTooltip><span className="font-mono">{waveFrequency[0].toFixed(1)}</span></div><Slider value={waveFrequency} onValueChange={setWaveFrequency} min={0.1} max={5} step={0.1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Maximum displacement."><span>Amplitude (m)</span></ParamTooltip><span className="font-mono">{waveAmplitude[0].toFixed(1)}</span></div><Slider value={waveAmplitude} onValueChange={setWaveAmplitude} min={0.1} max={3} step={0.1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Distance between crests."><span>Wavelength (m)</span></ParamTooltip><span className="font-mono">{waveWavelength[0].toFixed(1)}</span></div><Slider value={waveWavelength} onValueChange={setWaveWavelength} min={0.5} max={10} step={0.5} /></div>
        </div>
      )}
      {activeSimulation === 'collision' && (
        <div className="space-y-4">
          <div><Label className="text-sm mb-2 block">Collision Type</Label><Select value={collisionType} onValueChange={(v) => setCollisionType(v as 'elastic' | 'inelastic')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="elastic">Elastic</SelectItem><SelectItem value="inelastic">Inelastic</SelectItem></SelectContent></Select></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Mass of object 1."><span>Mass 1 (kg)</span></ParamTooltip><span className="font-mono">{collisionMass1[0].toFixed(1)}</span></div><Slider value={collisionMass1} onValueChange={setCollisionMass1} min={0.5} max={5} step={0.5} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Mass of object 2."><span>Mass 2 (kg)</span></ParamTooltip><span className="font-mono">{collisionMass2[0].toFixed(1)}</span></div><Slider value={collisionMass2} onValueChange={setCollisionMass2} min={0.5} max={5} step={0.5} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Velocity of object 1."><span>Velocity 1 (m/s)</span></ParamTooltip><span className="font-mono">{collisionVelocity1[0]}</span></div><Slider value={collisionVelocity1} onValueChange={setCollisionVelocity1} min={0} max={10} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Velocity of object 2."><span>Velocity 2 (m/s)</span></ParamTooltip><span className="font-mono">{collisionVelocity2[0]}</span></div><Slider value={collisionVelocity2} onValueChange={setCollisionVelocity2} min={0} max={10} step={1} /></div>
        </div>
      )}
      {activeSimulation === 'ohmslaw' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Electric potential difference (V = IR)"><span>Voltage (V)</span></ParamTooltip>
              <span className="font-mono">{ohmsVoltage[0]}</span>
            </div>
            <Slider value={ohmsVoltage} onValueChange={setOhmsVoltage} min={1} max={24} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Opposition to current flow (Ohms)"><span>Resistance (Ω)</span></ParamTooltip>
              <span className="font-mono">{ohmsResistance[0]}</span>
            </div>
            <Slider value={ohmsResistance} onValueChange={setOhmsResistance} min={10} max={1000} step={10} />
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Current (I = V/R):</span><span className="font-mono">{(ohmsVoltage[0] / ohmsResistance[0]).toFixed(4)} A</span></div>
            <div className="flex justify-between"><span>Power (P = V²/R):</span><span className="font-mono">{(ohmsVoltage[0] * ohmsVoltage[0] / ohmsResistance[0]).toFixed(3)} W</span></div>
          </div>
        </div>
      )}
      {activeSimulation === 'inclinedplane' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Angle of the inclined plane from horizontal"><span>Angle (°)</span></ParamTooltip>
              <span className="font-mono">{inclineAngle[0]}</span>
            </div>
            <Slider value={inclineAngle} onValueChange={setInclineAngle} min={5} max={60} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Mass of the object on the plane"><span>Mass (kg)</span></ParamTooltip>
              <span className="font-mono">{inclineMass[0].toFixed(1)}</span>
            </div>
            <Slider value={inclineMass} onValueChange={setInclineMass} min={0.5} max={10} step={0.5} />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Coefficient of kinetic friction (μ)"><span>Friction (μ)</span></ParamTooltip>
              <span className="font-mono">{inclineFriction[0].toFixed(2)}</span>
            </div>
            <Slider value={inclineFriction} onValueChange={setInclineFriction} min={0} max={1} step={0.05} />
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Acceleration:</span><span className="font-mono">{(9.8 * (Math.sin(inclineAngle[0] * Math.PI / 180) - inclineFriction[0] * Math.cos(inclineAngle[0] * Math.PI / 180))).toFixed(2)} m/s²</span></div>
          </div>
        </div>
      )}
      {activeSimulation === 'lightoptics' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Angle of the incident light ray"><span>Incidence Angle (°)</span></ParamTooltip>
              <span className="font-mono">{opticsAngle[0]}</span>
            </div>
            <Slider value={opticsAngle} onValueChange={setOpticsAngle} min={0} max={89} step={1} />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Surface Type</Label>
            <Select value={opticsSurface} onValueChange={(v) => setOpticsSurface(v as 'mirror' | 'transparent')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mirror">Mirror (Reflection)</SelectItem>
                <SelectItem value="transparent">Transparent (Refraction)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {opticsSurface === 'transparent' && (
            <>
              <div>
                <Label className="text-sm mb-2 block">Medium 1 (Incident)</Label>
                <Select value={opticsMedium1} onValueChange={(v) => setOpticsMedium1(v as 'air' | 'water' | 'glass')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air">Air (n=1.00)</SelectItem>
                    <SelectItem value="water">Water (n=1.33)</SelectItem>
                    <SelectItem value="glass">Glass (n=1.52)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Medium 2 (Refracted)</Label>
                <Select value={opticsMedium2} onValueChange={(v) => setOpticsMedium2(v as 'air' | 'water' | 'glass')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air">Air (n=1.00)</SelectItem>
                    <SelectItem value="water">Water (n=1.33)</SelectItem>
                    <SelectItem value="glass">Glass (n=1.52)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      )}
      {activeSimulation === 'buoyancy' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Density of the submerged object"><span>Object Density (kg/m³)</span></ParamTooltip>
              <span className="font-mono">{buoyancyObjectDensity[0]}</span>
            </div>
            <Slider value={buoyancyObjectDensity} onValueChange={setBuoyancyObjectDensity} min={100} max={5000} step={50} />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Fluid Type</Label>
            <Select value={buoyancyFluidDensity[0].toString()} onValueChange={(v) => setBuoyancyFluidDensity([parseInt(v)])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">Water (1000 kg/m³)</SelectItem>
                <SelectItem value="800">Oil (800 kg/m³)</SelectItem>
                <SelectItem value="13600">Mercury (13600 kg/m³)</SelectItem>
                <SelectItem value="1025">Seawater (1025 kg/m³)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <ParamTooltip tip="Volume of the object"><span>Object Volume (m³)</span></ParamTooltip>
              <span className="font-mono">{buoyancyVolume[0].toFixed(2)}</span>
            </div>
            <Slider value={buoyancyVolume} onValueChange={setBuoyancyVolume} min={0.1} max={5} step={0.1} />
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Buoyant Force:</span><span className="font-mono">{(buoyancyFluidDensity[0] * 9.8 * buoyancyVolume[0]).toFixed(1)} N</span></div>
            <div className="flex justify-between"><span>Object Weight:</span><span className="font-mono">{(buoyancyObjectDensity[0] * 9.8 * buoyancyVolume[0]).toFixed(1)} N</span></div>
            <div className="flex justify-between font-medium">
              <span>Status:</span>
              <span className={buoyancyObjectDensity[0] < buoyancyFluidDensity[0] ? 'text-success' : buoyancyObjectDensity[0] === buoyancyFluidDensity[0] ? 'text-warning' : 'text-destructive'}>
                {buoyancyObjectDensity[0] < buoyancyFluidDensity[0] ? 'Floats' : buoyancyObjectDensity[0] === buoyancyFluidDensity[0] ? 'Neutral' : 'Sinks'}
              </span>
            </div>
          </div>
        </div>
      )}
      {activeSimulation === 'acidbase' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Acidity/alkalinity (0-14 scale)."><span>pH Value</span></ParamTooltip><span className="font-mono">{acidBasePH[0].toFixed(1)}</span></div>
            <Slider value={acidBasePH} onValueChange={setAcidBasePH} min={0} max={14} step={0.1} />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Indicator</Label>
            <Select value={acidBaseIndicator} onValueChange={(v) => setAcidBaseIndicator(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="universal">Universal</SelectItem>
                <SelectItem value="litmus">Litmus</SelectItem>
                <SelectItem value="phenolphthalein">Phenolphthalein</SelectItem>
                <SelectItem value="methyl_orange">Methyl Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Nature:</span><span className="font-mono">{acidBasePH[0] < 7 ? 'Acidic' : acidBasePH[0] > 7 ? 'Basic' : 'Neutral'}</span></div>
            <div className="flex justify-between"><span>H⁺ Concentration:</span><span className="font-mono">{Math.pow(10, -acidBasePH[0]).toExponential(2)} M</span></div>
          </div>
        </div>
      )}
      {activeSimulation === 'friction' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Surface</Label>
            <Select value={frictionSurface} onValueChange={(v) => setFrictionSurface(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wood">Wood (μ=0.3)</SelectItem>
                <SelectItem value="ice">Ice (μ=0.05)</SelectItem>
                <SelectItem value="rubber">Rubber (μ=0.7)</SelectItem>
                <SelectItem value="steel">Steel (μ=0.15)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Object mass."><span>Mass (kg)</span></ParamTooltip><span className="font-mono">{frictionMass[0].toFixed(1)}</span></div><Slider value={frictionMass} onValueChange={setFrictionMass} min={0.5} max={10} step={0.5} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Force applied horizontally."><span>Applied Force (N)</span></ParamTooltip><span className="font-mono">{frictionAppliedForce[0]}</span></div><Slider value={frictionAppliedForce} onValueChange={setFrictionAppliedForce} min={0} max={100} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Coefficient of friction (μ)."><span>Friction Coeff (μ)</span></ParamTooltip><span className="font-mono">{frictionCoeff[0].toFixed(2)}</span></div><Slider value={frictionCoeff} onValueChange={setFrictionCoeff} min={0} max={1} step={0.05} /></div>
        </div>
      )}
      {activeSimulation === 'lever' && (
        <div className="space-y-4">
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Load mass on lever."><span>Load Mass (kg)</span></ParamTooltip><span className="font-mono">{leverLoadMass[0].toFixed(1)}</span></div><Slider value={leverLoadMass} onValueChange={setLeverLoadMass} min={1} max={20} step={0.5} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Effort force applied."><span>Effort Force (N)</span></ParamTooltip><span className="font-mono">{leverEffortForce[0]}</span></div><Slider value={leverEffortForce} onValueChange={setLeverEffortForce} min={1} max={100} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Fulcrum position (0=left, 1=right)."><span>Fulcrum Position</span></ParamTooltip><span className="font-mono">{leverFulcrumPos[0].toFixed(2)}</span></div><Slider value={leverFulcrumPos} onValueChange={setLeverFulcrumPos} min={0.1} max={0.9} step={0.05} /></div>
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Mech. Advantage:</span><span className="font-mono">{(leverFulcrumPos[0] / (1 - leverFulcrumPos[0])).toFixed(2)}</span></div>
          </div>
        </div>
      )}
      {activeSimulation === 'expansion' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Material</Label>
            <Select value={expansionMaterial} onValueChange={(v) => setExpansionMaterial(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="iron">Iron</SelectItem>
                <SelectItem value="copper">Copper</SelectItem>
                <SelectItem value="aluminum">Aluminum</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Target temperature in °C."><span>Temperature (°C)</span></ParamTooltip><span className="font-mono">{expansionTemp[0]}</span></div><Slider value={expansionTemp} onValueChange={setExpansionTemp} min={-50} max={500} step={5} /></div>
        </div>
      )}
      {activeSimulation === 'statesofmatter' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Substance</Label>
            <Select value={statesSubstance} onValueChange={(v) => setStatesSubstance(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="iron">Iron</SelectItem>
                <SelectItem value="oxygen">Oxygen</SelectItem>
                <SelectItem value="wax">Wax</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Adjust temperature to see phase changes."><span>Temperature (°C)</span></ParamTooltip><span className="font-mono">{statesTemp[0]}</span></div><Slider value={statesTemp} onValueChange={setStatesTemp} min={-250} max={3000} step={5} /></div>
        </div>
      )}
      {activeSimulation === 'diffusionosmosis' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Mode</Label>
            <Select value={diffusionMode} onValueChange={(v) => setDiffusionMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diffusion">Diffusion</SelectItem>
                <SelectItem value="osmosis">Osmosis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Left side concentration."><span>Left Conc.</span></ParamTooltip><span className="font-mono">{diffusionConcLeft[0]}</span></div><Slider value={diffusionConcLeft} onValueChange={setDiffusionConcLeft} min={0} max={10} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Right side concentration."><span>Right Conc.</span></ParamTooltip><span className="font-mono">{diffusionConcRight[0]}</span></div><Slider value={diffusionConcRight} onValueChange={setDiffusionConcRight} min={0} max={10} step={1} /></div>
          <div><div className="flex justify-between mb-2 text-sm"><ParamTooltip tip="Membrane permeability (0-1)."><span>Permeability</span></ParamTooltip><span className="font-mono">{diffusionPermeability[0].toFixed(2)}</span></div><Slider value={diffusionPermeability} onValueChange={setDiffusionPermeability} min={0} max={1} step={0.05} /></div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        <div className="h-12 sm:h-14 border-b flex items-center justify-between px-2 sm:px-4 bg-card flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">{activeSim?.category}</Badge>
            <h1 className="font-semibold text-sm sm:text-base truncate">{activeSim?.name}</h1>
          </div>
          <div className="flex-1 mx-2 sm:mx-4 overflow-x-auto">
            <Tabs value={activeSimulation} onValueChange={handleSimulationChange}>
                <TabsList className="h-8 sm:h-9 inline-flex w-max">
                  {simulations.map(sim => (
                    <TabsTrigger key={sim.id} value={sim.id} className="text-xs gap-1 px-2 sm:px-3 whitespace-nowrap">
                      <sim.icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{sim.name}</span>
                      <span className="sm:hidden">{sim.shortName}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
          </div>
          <div className="flex items-center gap-1">
            <Button variant={showEducation ? "secondary" : "ghost"} size="icon" onClick={() => setShowEducation(!showEducation)} title="Learn" className="h-8 w-8"><BookOpen className="w-4 h-4" /></Button>
            {hasPlayControls && <Button variant={showDataPanel ? "secondary" : "ghost"} size="icon" onClick={() => setShowDataPanel(!showDataPanel)} title="Data Visualization" className="h-8 w-8"><BarChart3 className="w-4 h-4" /></Button>}
            <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Export CSV" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleExportJSON} title="Export JSON" className="h-8 w-8 hidden sm:inline-flex"><Braces className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleExportPDF} title="Export PDF" className="h-8 w-8 hidden md:inline-flex"><FileText className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative bg-gradient-to-b from-muted/50 to-muted min-h-[250px] sm:min-h-[350px] lg:min-h-[400px]">
              <SimulationLoader simulationName={activeSim?.name}>
              {activeSimulation === 'pendulum' && <PendulumSimulation ref={pendulumRef} mass={pendulumMass[0]} length={pendulumLength[0]} gravity={pendulumGravity[0]} angle={pendulumAngle[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'projectile' && <ProjectileSimulation ref={projectileRef} velocity={projectileVelocity[0]} angle={projectileAngle[0]} gravity={projectileGravity[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'spring' && <SpringSimulation ref={springRef} mass={springMass[0]} springConstant={springConstant[0]} damping={springDamping[0]} displacement={springDisplacement[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'wave' && <WaveSimulation ref={waveRef} frequency={waveFrequency[0]} amplitude={waveAmplitude[0]} wavelength={waveWavelength[0]} waveType={waveType} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'collision' && <CollisionSimulation ref={collisionRef} mass1={collisionMass1[0]} mass2={collisionMass2[0]} velocity1={collisionVelocity1[0]} velocity2={collisionVelocity2[0]} collisionType={collisionType} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'ohmslaw' && <OhmsLawSimulation ref={ohmsLawRef} voltage={ohmsVoltage[0]} resistance={ohmsResistance[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'inclinedplane' && <InclinedPlaneSimulation ref={inclinedPlaneRef} angle={inclineAngle[0]} mass={inclineMass[0]} friction={inclineFriction[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'lightoptics' && <LightOpticsSimulation ref={lightOpticsRef} incidenceAngle={opticsAngle[0]} medium1={opticsMedium1} medium2={opticsMedium2} surfaceType={opticsSurface} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'buoyancy' && <BuoyancySimulation ref={buoyancyRef} objectDensity={buoyancyObjectDensity[0]} fluidDensity={buoyancyFluidDensity[0]} objectVolume={buoyancyVolume[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'emspectrum' && <EMSpectrumVisualization />}
              {activeSimulation === 'chemistry' && <ChemistryWorkspace />}
              {activeSimulation === 'acidbase' && <AcidBaseSimulation ref={acidBaseRef} pH={acidBasePH[0]} indicator={acidBaseIndicator} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'friction' && <FrictionSimulation ref={frictionRef} mass={frictionMass[0]} appliedForce={frictionAppliedForce[0]} frictionCoeff={frictionCoeff[0]} surface={frictionSurface} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'lever' && <LeverSimulation ref={leverRef} loadMass={leverLoadMass[0]} effortForce={leverEffortForce[0]} fulcrumPosition={leverFulcrumPos[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'expansion' && <ExpansionSimulation ref={expansionRef} temperature={expansionTemp[0]} material={expansionMaterial} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'statesofmatter' && <StatesOfMatterSimulation ref={statesOfMatterRef} temperature={statesTemp[0]} substance={statesSubstance} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              {activeSimulation === 'diffusionosmosis' && <DiffusionOsmosisSimulation ref={diffusionOsmosisRef} mode={diffusionMode} concentrationLeft={diffusionConcLeft[0]} concentrationRight={diffusionConcRight[0]} membranePermeability={diffusionPermeability[0]} isPlaying={isPlaying} speed={speed[0]} onDataUpdate={handleDataUpdate} />}
              </SimulationLoader>
            </div>
            {hasPlayControls && (
              <div className="h-12 sm:h-16 border-t bg-card px-2 sm:px-4 flex items-center gap-2 sm:gap-6 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant={isPlaying ? "secondary" : "default"} size="icon" onClick={() => setIsPlaying(!isPlaying)} className="h-8 w-8 sm:h-10 sm:w-10">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}</Button>
                  <Button variant="outline" size="icon" onClick={handleReset} className="h-8 w-8 sm:h-10 sm:w-10"><RotateCcw className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <Gauge className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <div className="flex-1 min-w-[60px]"><Slider value={speed} onValueChange={setSpeed} min={0.25} max={4} step={0.25} /></div>
                  <span className="text-xs font-mono w-8 sm:w-12">{speed[0]}x</span>
                </div>
                {graphData.length > 0 && <div className="ml-auto text-xs text-muted-foreground hidden sm:block">{graphData.length} pts</div>}
                <MobileParametersDrawer title={`${activeSim?.name} Parameters`}>{renderParameterControls()}</MobileParametersDrawer>
              </div>
            )}
          </div>
          {hasPlayControls && (
            <div className="hidden lg:block w-72 xl:w-80 border-l bg-card p-4 space-y-6 overflow-auto flex-shrink-0">
              <h3 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" />Parameters</h3>
              {renderParameterControls()}
            </div>
          )}
        </div>
        <DataVisualizationPanel data={graphData} series={getDataSeries()} isOpen={showDataPanel} onClose={() => setShowDataPanel(false)} simulationType={activeSimulation} />
        <ExperimentEducation experimentId={activeSimulation} isOpen={showEducation} onClose={() => setShowEducation(false)} />
      </div>
    </Layout>
  );
};

export default Workspace;
