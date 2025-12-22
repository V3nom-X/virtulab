import { useState } from 'react';
import { Sliders, Plus, Trash2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Variable {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

interface VariableControlsProps {
  variables: Variable[];
  onVariableChange: (id: string, value: number) => void;
  onAddVariable?: (variable: Variable) => void;
  onRemoveVariable?: (id: string) => void;
  onReset?: () => void;
  showAddButton?: boolean;
  className?: string;
}

const presetVariables: Omit<Variable, 'id'>[] = [
  { name: 'Gravity', value: 9.8, min: 0, max: 20, step: 0.1, unit: 'm/s²' },
  { name: 'Mass', value: 1, min: 0.1, max: 100, step: 0.1, unit: 'kg' },
  { name: 'Velocity', value: 0, min: -50, max: 50, step: 0.5, unit: 'm/s' },
  { name: 'Friction', value: 0.3, min: 0, max: 1, step: 0.01, unit: '' },
  { name: 'Temperature', value: 25, min: -50, max: 200, step: 1, unit: '°C' },
  { name: 'Pressure', value: 101.3, min: 0, max: 500, step: 0.1, unit: 'kPa' },
  { name: 'Angle', value: 45, min: 0, max: 90, step: 1, unit: '°' },
  { name: 'Spring Constant', value: 50, min: 1, max: 200, step: 1, unit: 'N/m' },
];

export function VariableControls({
  variables,
  onVariableChange,
  onAddVariable,
  onRemoveVariable,
  onReset,
  showAddButton = true,
  className = ''
}: VariableControlsProps) {
  const [showPresets, setShowPresets] = useState(false);

  const handleAddPreset = (preset: Omit<Variable, 'id'>) => {
    if (onAddVariable) {
      onAddVariable({
        ...preset,
        id: `var_${Date.now()}`
      });
    }
    setShowPresets(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Variable Controls
          </CardTitle>
          <div className="flex items-center gap-1">
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-7 w-7 p-0">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            {showAddButton && onAddVariable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                className="h-7"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset selector */}
        {showPresets && (
          <div className="p-2 bg-muted/50 rounded-md space-y-2">
            <p className="text-xs text-muted-foreground">Select a variable preset:</p>
            <div className="flex flex-wrap gap-1">
              {presetVariables.map((preset, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleAddPreset(preset)}
                  disabled={variables.some(v => v.name === preset.name)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Variables list */}
        {variables.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No variables added. Click "Add" to add variable controls.
          </p>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-4 pr-2">
              {variables.map((variable) => (
                <div key={variable.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      {variable.name}
                      {variable.unit && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          {variable.unit}
                        </Badge>
                      )}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {variable.value.toFixed(variable.step < 1 ? 2 : 0)}
                      </span>
                      {onRemoveVariable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveVariable(variable.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[variable.value]}
                    min={variable.min}
                    max={variable.max}
                    step={variable.step}
                    onValueChange={([value]) => onVariableChange(variable.id, value)}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{variable.min}{variable.unit}</span>
                    <span>{variable.max}{variable.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
