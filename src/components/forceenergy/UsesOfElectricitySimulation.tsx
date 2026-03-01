import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface Appliance {
  id: string;
  name: string;
  icon: string;
  powerW: number;
  conversion: string;
  category: string;
  isOn: boolean;
}

const defaultAppliances: Appliance[] = [
  { id: "bulb", name: "LED Bulb", icon: "💡", powerW: 10, conversion: "Electrical → Light", category: "home", isOn: false },
  { id: "fan", name: "Ceiling Fan", icon: "🌀", powerW: 75, conversion: "Electrical → Mechanical", category: "home", isOn: false },
  { id: "heater", name: "Heater", icon: "🔥", powerW: 1500, conversion: "Electrical → Heat", category: "home", isOn: false },
  { id: "tv", name: "Television", icon: "📺", powerW: 100, conversion: "Electrical → Light + Sound", category: "home", isOn: false },
  { id: "fridge", name: "Refrigerator", icon: "🧊", powerW: 150, conversion: "Electrical → Cooling", category: "home", isOn: false },
  { id: "computer", name: "Computer", icon: "💻", powerW: 200, conversion: "Electrical → Processing", category: "school", isOn: false },
  { id: "projector", name: "Projector", icon: "📽️", powerW: 300, conversion: "Electrical → Light", category: "school", isOn: false },
  { id: "motor", name: "Electric Motor", icon: "🏭", powerW: 2000, conversion: "Electrical → Mechanical", category: "workshop", isOn: false },
  { id: "welder", name: "Welder", icon: "⚡", powerW: 3000, conversion: "Electrical → Heat + Light", category: "workshop", isOn: false },
  { id: "solar", name: "Solar Panel", icon: "☀️", powerW: -500, conversion: "Light → Electrical", category: "renewable", isOn: false },
];

const environments = [
  { id: "home", name: "Home", icon: "🏠" },
  { id: "school", name: "School", icon: "🏫" },
  { id: "workshop", name: "Workshop", icon: "🏭" },
  { id: "all", name: "All", icon: "🔌" },
];

export function UsesOfElectricitySimulation() {
  const [appliances, setAppliances] = useState(defaultAppliances);
  const [environment, setEnvironment] = useState("all");
  const [hours, setHours] = useState(1);

  const toggleAppliance = (id: string) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, isOn: !a.isOn } : a));
  };

  const filtered = environment === "all" ? appliances : appliances.filter(a => a.category === environment || (environment === "home" && a.category === "renewable"));

  const totalPower = appliances.filter(a => a.isOn).reduce((sum, a) => sum + a.powerW, 0);
  const energyKwh = (Math.max(totalPower, 0) * hours) / 1000;
  const maxCapacity = 5000; // 5kW max
  const loadPercent = (Math.max(totalPower, 0) / maxCapacity) * 100;
  const isOverloaded = totalPower > maxCapacity;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Power Dashboard</span>
            {isOverloaded && <Badge variant="destructive" className="animate-pulse">⚠️ OVERLOADED!</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Power</p>
              <p className={`text-lg font-bold ${isOverloaded ? "text-destructive" : ""}`}>{totalPower} W</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Energy ({hours}h)</p>
              <p className="text-lg font-bold">{energyKwh.toFixed(2)} kWh</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Active Devices</p>
              <p className="text-lg font-bold">{appliances.filter(a => a.isOn).length}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Circuit Load</span>
              <span>{loadPercent.toFixed(0)}% of {maxCapacity}W</span>
            </div>
            <Progress value={Math.min(loadPercent, 100)} className={isOverloaded ? "[&>div]:bg-destructive" : ""} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {environments.map(env => (
          <Button key={env.id} variant={environment === env.id ? "default" : "outline"} size="sm" onClick={() => setEnvironment(env.id)} className="gap-1">
            <span>{env.icon}</span>{env.name}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(app => (
          <Card key={app.id} className={`transition-all ${app.isOn ? "border-primary/50 shadow-md" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.powerW > 0 ? `${app.powerW}W` : `Generates ${Math.abs(app.powerW)}W`}</p>
                  </div>
                </div>
                <Switch checked={app.isOn} onCheckedChange={() => toggleAppliance(app.id)} />
              </div>
              <Badge variant="secondary" className="text-xs">{app.conversion}</Badge>
              {app.isOn && app.powerW > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Cost: ~{((app.powerW * hours / 1000) * 25).toFixed(1)} KSh/day
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm">Usage Duration:</span>
            {[1, 4, 8, 12, 24].map(h => (
              <Button key={h} variant={hours === h ? "default" : "outline"} size="sm" onClick={() => setHours(h)}>{h}h</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
