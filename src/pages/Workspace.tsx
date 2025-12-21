import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendulumSimulation, PendulumSimulationHandle } from "@/components/simulations/PendulumSimulation";
import { ProjectileSimulation, ProjectileSimulationHandle } from "@/components/simulations/ProjectileSimulation";
import { SpringSimulation, SpringSimulationHandle } from "@/components/simulations/SpringSimulation";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { 
  Play, Pause, RotateCcw, Maximize2, Settings2, Download,
  FlaskConical, Atom, Target, Activity, Gauge
} from "lucide-react";

const Workspace = () => {
  const [searchParams] = useSearchParams();
  const [activeSimulation, setActiveSimulation] = useState<string>(
    searchParams.get('type') || 'pendulum'
  );

  // Shared controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);

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

  // Simulation refs for reset
  const pendulumRef = useRef<PendulumSimulationHandle>(null);
  const projectileRef = useRef<ProjectileSimulationHandle>(null);
  const springRef = useRef<SpringSimulationHandle>(null);

  const simulations = [
    { id: 'pendulum', name: 'Pendulum', icon: Activity, category: 'Physics' },
    { id: 'projectile', name: 'Projectile', icon: Target, category: 'Physics' },
    { id: 'spring', name: 'Spring', icon: Activity, category: 'Physics' },
    { id: 'chemistry', name: 'Chemistry Lab', icon: FlaskConical, category: 'Chemistry' },
  ];

  const activeSim = simulations.find(s => s.id === activeSimulation);

  const handleReset = () => {
    setIsPlaying(false);
    if (activeSimulation === 'pendulum') {
      pendulumRef.current?.reset();
    } else if (activeSimulation === 'projectile') {
      projectileRef.current?.reset();
    } else if (activeSimulation === 'spring') {
      springRef.current?.reset();
    }
  };

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
            <Tabs value={activeSimulation} onValueChange={(v) => { setActiveSimulation(v); setIsPlaying(false); }}>
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
            <div className="flex-1 relative bg-gradient-to-b from-muted/50 to-muted">
              {activeSimulation === 'pendulum' && (
                <PendulumSimulation
                  ref={pendulumRef}
                  mass={pendulumMass[0]}
                  length={pendulumLength[0]}
                  gravity={pendulumGravity[0]}
                  angle={pendulumAngle[0]}
                  isPlaying={isPlaying}
                  speed={speed[0]}
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
                />
              )}
              {activeSimulation === 'chemistry' && <ChemistryWorkspace />}
            </div>

            {/* Playback Controls - only for physics simulations */}
            {activeSimulation !== 'chemistry' && (
              <div className="h-20 border-t bg-card px-4 flex items-center gap-6">
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Workspace;
