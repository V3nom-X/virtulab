import { useState, useCallback } from 'react';
import { Code2, Play, AlertCircle, Check, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ScriptEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onExecute?: (code: string) => void;
  variables?: Record<string, number>;
  className?: string;
}

const defaultCode = `// Custom behavior script
// Access simulation variables via 'vars' object
// Example: vars.gravity, vars.mass, vars.velocity

function onUpdate(time, dt) {
  // Called every frame
  // time: total elapsed time (seconds)
  // dt: delta time since last frame
  
  // Example: oscillating force
  // return { force: Math.sin(time) * 10 };
}

function onCollision(objectA, objectB) {
  // Called when two objects collide
  // Return custom response
}

// Return functions to expose
return { onUpdate, onCollision };`;

const codeTemplates = [
  {
    name: 'Gravity Override',
    code: `// Custom gravity behavior
function onUpdate(time, dt) {
  // Sinusoidal gravity
  const g = 9.8 + Math.sin(time) * 5;
  return { gravity: g };
}
return { onUpdate };`
  },
  {
    name: 'Spring Force',
    code: `// Hooke's Law spring
const k = 50; // spring constant
const restLength = 1;

function onUpdate(time, dt) {
  const displacement = vars.position - restLength;
  const force = -k * displacement;
  return { force };
}
return { onUpdate };`
  },
  {
    name: 'Damped Oscillation',
    code: `// Damped harmonic motion
const damping = 0.1;
const frequency = 2;

function onUpdate(time, dt) {
  const amplitude = Math.exp(-damping * time);
  const position = amplitude * Math.cos(frequency * time * Math.PI * 2);
  return { position };
}
return { onUpdate };`
  },
  {
    name: 'Collision Response',
    code: `// Custom collision handling
function onCollision(a, b) {
  // Log collision
  console.log('Collision:', a.id, 'with', b.id);
  
  // Return coefficient of restitution
  return { restitution: 0.8 };
}
return { onCollision };`
  }
];

export function ScriptEditor({ 
  initialCode = defaultCode, 
  onCodeChange, 
  onExecute,
  variables = {},
  className = '' 
}: ScriptEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const validateCode = useCallback((codeToValidate: string) => {
    try {
      // Basic syntax check using Function constructor
      new Function('vars', codeToValidate);
      setError(null);
      setIsValid(true);
      return true;
    } catch (e) {
      setError((e as Error).message);
      setIsValid(false);
      return false;
    }
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    validateCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleExecute = () => {
    if (validateCode(code)) {
      onExecute?.(code);
      toast.success('Script executed successfully');
    } else {
      toast.error('Script has syntax errors');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleLoadTemplate = (template: typeof codeTemplates[0]) => {
    setCode(template.code);
    validateCode(template.code);
    onCodeChange?.(template.code);
    toast.success(`Loaded "${template.name}" template`);
  };

  const handleReset = () => {
    setCode(defaultCode);
    validateCode(defaultCode);
    onCodeChange?.(defaultCode);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Script Editor
          </CardTitle>
          <div className="flex items-center gap-1">
            {isValid ? (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                <Check className="h-3 w-3 mr-1" /> Valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" /> Error
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Templates */}
        <div className="flex flex-wrap gap-1">
          {codeTemplates.map(template => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleLoadTemplate(template)}
            >
              {template.name}
            </Button>
          ))}
        </div>

        {/* Code editor */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-48 p-3 font-mono text-xs bg-muted/50 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive font-mono">{error}</p>
          </div>
        )}

        {/* Variables preview */}
        {Object.keys(variables).length > 0 && (
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Available variables:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(variables).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs font-mono">
                  {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleExecute} disabled={!isValid} className="flex-1">
            <Play className="h-4 w-4 mr-1" /> Run
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
