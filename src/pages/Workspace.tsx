import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendulumSimulation } from "@/components/simulations/PendulumSimulation";
import { ProjectileSimulation } from "@/components/simulations/ProjectileSimulation";
import { SpringSimulation } from "@/components/simulations/SpringSimulation";
import { ChemistryWorkspace } from "@/components/chemistry/ChemistryWorkspace";
import { 
  Maximize2, 
  Settings2, 
  Download,
  BookOpen,
  FlaskConical,
  Atom,
  Target,
  Activity
} from "lucide-react";

const Workspace = () => {
  const [searchParams] = useSearchParams();
  const [activeSimulation, setActiveSimulation] = useState<string>(
    searchParams.get('type') || 'pendulum'
  );

  const simulations = [
    { id: 'pendulum', name: 'Pendulum', icon: Activity, category: 'Physics' },
    { id: 'projectile', name: 'Projectile', icon: Target, category: 'Physics' },
    { id: 'spring', name: 'Spring', icon: Activity, category: 'Physics' },
    { id: 'chemistry', name: 'Chemistry Lab', icon: FlaskConical, category: 'Chemistry' },
  ];

  const activeSim = simulations.find(s => s.id === activeSimulation);

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
            <Tabs value={activeSimulation} onValueChange={setActiveSimulation}>
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

        {/* Simulation Area */}
        <div className="flex-1">
          {activeSimulation === 'pendulum' && <PendulumSimulation />}
          {activeSimulation === 'projectile' && <ProjectileSimulation />}
          {activeSimulation === 'spring' && <SpringSimulation />}
          {activeSimulation === 'chemistry' && <ChemistryWorkspace />}
        </div>
      </div>
    </Layout>
  );
};

export default Workspace;
