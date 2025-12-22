import { Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { CanvasComponent } from './DragDropCanvas';

interface PropertyDefinition {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'slider';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  unit?: string;
}

interface PropertiesPanelProps {
  component: CanvasComponent | null;
  onPropertyChange: (id: string, key: string, value: any) => void;
  onClose?: () => void;
  className?: string;
}

// Property definitions by component type
const propertyDefinitions: Record<string, PropertyDefinition[]> = {
  pendulum: [
    { key: 'length', label: 'Length', type: 'slider', min: 0.1, max: 5, step: 0.1, unit: 'm' },
    { key: 'mass', label: 'Mass', type: 'slider', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { key: 'angle', label: 'Initial Angle', type: 'slider', min: 0, max: 90, step: 1, unit: '°' },
    { key: 'damping', label: 'Damping', type: 'slider', min: 0, max: 1, step: 0.01 },
  ],
  spring: [
    { key: 'k', label: 'Spring Constant', type: 'slider', min: 1, max: 200, step: 1, unit: 'N/m' },
    { key: 'mass', label: 'Mass', type: 'slider', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { key: 'displacement', label: 'Initial Displacement', type: 'slider', min: -2, max: 2, step: 0.1, unit: 'm' },
  ],
  ramp: [
    { key: 'angle', label: 'Angle', type: 'slider', min: 0, max: 90, step: 1, unit: '°' },
    { key: 'friction', label: 'Friction Coefficient', type: 'slider', min: 0, max: 1, step: 0.01 },
    { key: 'length', label: 'Ramp Length', type: 'slider', min: 1, max: 10, step: 0.5, unit: 'm' },
  ],
  projectile: [
    { key: 'velocity', label: 'Initial Velocity', type: 'slider', min: 1, max: 100, step: 1, unit: 'm/s' },
    { key: 'angle', label: 'Launch Angle', type: 'slider', min: 0, max: 90, step: 1, unit: '°' },
    { key: 'height', label: 'Initial Height', type: 'slider', min: 0, max: 50, step: 1, unit: 'm' },
  ],
  collision: [
    { key: 'mass1', label: 'Mass 1', type: 'slider', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { key: 'mass2', label: 'Mass 2', type: 'slider', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { key: 'velocity1', label: 'Velocity 1', type: 'slider', min: -20, max: 20, step: 0.5, unit: 'm/s' },
    { key: 'velocity2', label: 'Velocity 2', type: 'slider', min: -20, max: 20, step: 0.5, unit: 'm/s' },
    { key: 'elastic', label: 'Elastic Collision', type: 'boolean' },
  ],
  wave: [
    { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 0.1, max: 5, step: 0.1, unit: 'm' },
    { key: 'frequency', label: 'Frequency', type: 'slider', min: 0.1, max: 10, step: 0.1, unit: 'Hz' },
    { key: 'wavelength', label: 'Wavelength', type: 'slider', min: 0.5, max: 10, step: 0.5, unit: 'm' },
  ],
  beaker: [
    { key: 'volume', label: 'Volume', type: 'slider', min: 50, max: 1000, step: 50, unit: 'mL' },
    { key: 'content', label: 'Content', type: 'select', options: [
      { value: 'water', label: 'Water' },
      { value: 'acid', label: 'Acid' },
      { value: 'base', label: 'Base' },
      { value: 'alcohol', label: 'Alcohol' },
    ]},
    { key: 'temperature', label: 'Temperature', type: 'slider', min: 0, max: 100, step: 1, unit: '°C' },
  ],
  burner: [
    { key: 'temperature', label: 'Temperature', type: 'slider', min: 100, max: 1000, step: 10, unit: '°C' },
    { key: 'active', label: 'Active', type: 'boolean' },
  ],
  molecule: [
    { key: 'molecule', label: 'Molecule', type: 'select', options: [
      { value: 'H2O', label: 'Water (H₂O)' },
      { value: 'CO2', label: 'Carbon Dioxide (CO₂)' },
      { value: 'CH4', label: 'Methane (CH₄)' },
      { value: 'NH3', label: 'Ammonia (NH₃)' },
      { value: 'C6H12O6', label: 'Glucose (C₆H₁₂O₆)' },
      { value: 'C2H5OH', label: 'Ethanol (C₂H₅OH)' },
    ]},
    { key: 'rotate', label: 'Auto Rotate', type: 'boolean' },
  ],
  circuit: [
    { key: 'voltage', label: 'Voltage', type: 'slider', min: 1, max: 24, step: 0.5, unit: 'V' },
  ],
  resistor: [
    { key: 'resistance', label: 'Resistance', type: 'slider', min: 1, max: 10000, step: 1, unit: 'Ω' },
  ],
  capacitor: [
    { key: 'capacitance', label: 'Capacitance', type: 'slider', min: 1, max: 1000, step: 1, unit: 'µF' },
  ],
  led: [
    { key: 'color', label: 'Color', type: 'select', options: [
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'white', label: 'White' },
    ]},
    { key: 'voltage', label: 'Forward Voltage', type: 'slider', min: 1.5, max: 4, step: 0.1, unit: 'V' },
  ],
  battery: [
    { key: 'voltage', label: 'Voltage', type: 'slider', min: 1.5, max: 24, step: 1.5, unit: 'V' },
  ],
  magnet: [
    { key: 'strength', label: 'Field Strength', type: 'slider', min: 0.1, max: 5, step: 0.1, unit: 'T' },
  ],
  cell: [
    { key: 'type', label: 'Cell Type', type: 'select', options: [
      { value: 'animal', label: 'Animal Cell' },
      { value: 'plant', label: 'Plant Cell' },
      { value: 'bacteria', label: 'Bacteria' },
    ]},
  ],
  microscope: [
    { key: 'magnification', label: 'Magnification', type: 'select', options: [
      { value: '40', label: '40x' },
      { value: '100', label: '100x' },
      { value: '400', label: '400x' },
      { value: '1000', label: '1000x' },
    ]},
  ],
  dna: [
    { key: 'basePairs', label: 'Base Pairs', type: 'slider', min: 5, max: 50, step: 1 },
    { key: 'rotate', label: 'Auto Rotate', type: 'boolean' },
  ],
  thermometer: [
    { key: 'unit', label: 'Unit', type: 'select', options: [
      { value: 'C', label: 'Celsius (°C)' },
      { value: 'F', label: 'Fahrenheit (°F)' },
      { value: 'K', label: 'Kelvin (K)' },
    ]},
  ],
};

// Default properties for unknown component types
const defaultProperties: PropertyDefinition[] = [
  { key: 'name', label: 'Name', type: 'string' },
];

export function PropertiesPanel({ 
  component, 
  onPropertyChange, 
  onClose,
  className = '' 
}: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const properties = propertyDefinitions[component.type] || defaultProperties;

  const handleChange = (key: string, value: any) => {
    onPropertyChange(component.id, key, value);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{component.icon}</span>
            <div>
              <h2 className="font-semibold text-sm">{component.name}</h2>
              <p className="text-xs text-muted-foreground">{component.type}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Position info */}
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Position</p>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">X: {component.x}</Badge>
              <Badge variant="outline">Y: {component.y}</Badge>
            </div>
          </div>

          {/* Dynamic properties */}
          {properties.map(prop => (
            <div key={prop.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  {prop.label}
                  {prop.unit && (
                    <span className="text-muted-foreground ml-1">({prop.unit})</span>
                  )}
                </Label>
                {prop.type === 'slider' && (
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {component.properties[prop.key] ?? prop.min}
                  </span>
                )}
              </div>

              {prop.type === 'string' && (
                <Input
                  value={component.properties[prop.key] || ''}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  className="h-8 text-sm"
                />
              )}

              {prop.type === 'number' && (
                <Input
                  type="number"
                  value={component.properties[prop.key] || 0}
                  onChange={(e) => handleChange(prop.key, parseFloat(e.target.value))}
                  min={prop.min}
                  max={prop.max}
                  step={prop.step}
                  className="h-8 text-sm"
                />
              )}

              {prop.type === 'slider' && (
                <>
                  <Slider
                    value={[component.properties[prop.key] ?? prop.min ?? 0]}
                    min={prop.min}
                    max={prop.max}
                    step={prop.step}
                    onValueChange={([value]) => handleChange(prop.key, value)}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{prop.min}</span>
                    <span>{prop.max}</span>
                  </div>
                </>
              )}

              {prop.type === 'boolean' && (
                <Switch
                  checked={component.properties[prop.key] ?? false}
                  onCheckedChange={(checked) => handleChange(prop.key, checked)}
                />
              )}

              {prop.type === 'select' && prop.options && (
                <Select
                  value={component.properties[prop.key] || prop.options[0].value}
                  onValueChange={(value) => handleChange(prop.key, value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prop.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
