import { useState, useRef, useCallback } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import { Code2, Play, AlertCircle, Check, Copy, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { validateScript, runScriptInWorker } from '@/lib/scriptSandbox';

interface MonacoScriptEditorProps {
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

export function MonacoScriptEditor({ 
  initialCode = defaultCode, 
  onCodeChange, 
  onExecute,
  variables = {},
  className = '' 
}: MonacoScriptEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<any>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const validateCode = useCallback((codeToValidate: string) => {
    const result = validateScript(codeToValidate);
    if (!result.valid) {
      setError(result.error);
      setIsValid(false);
      return false;
    }
    setError(null);
    setIsValid(true);
    return true;
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure JavaScript with custom type definitions
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add custom type definitions for simulation API
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare const vars: {
        gravity: number;
        mass: number;
        velocity: number;
        position: number;
        time: number;
        dt: number;
        [key: string]: number;
      };
      
      interface SimulationObject {
        id: string;
        position: { x: number; y: number; z: number };
        velocity: { x: number; y: number; z: number };
        mass: number;
        temperature?: number;
      }
      
      declare function onUpdate(time: number, dt: number): { [key: string]: any } | void;
      declare function onCollision(objectA: SimulationObject, objectB: SimulationObject): { restitution?: number } | void;
    `, 'simulation.d.ts');

    // Custom theme
    monaco.editor.defineTheme('simulation-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a4a',
        'editorCursor.foreground': '#00d4aa',
        'editor.selectionBackground': '#264f78',
      }
    });
    
    monaco.editor.setTheme('simulation-dark');
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    validateCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleExecute = async () => {
    if (!validateCode(code)) {
      toast.error('Script contains blocked patterns or is too long');
      return;
    }

    // Cancel any in-flight run, then execute in a hardened, time-boxed worker.
    cancelRef.current?.();
    const { promise, cancel } = runScriptInWorker(code, variables);
    cancelRef.current = cancel;

    const outcome = await promise;
    cancelRef.current = null;

    if (outcome.success) {
      onExecute?.(code);
      toast.success('Script executed successfully');
    } else {
      setError(outcome.error ?? 'Execution error');
      setIsValid(false);
      toast.error(outcome.error ?? 'Execution error');
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
    <Card className={cn("flex flex-col", isExpanded && "fixed inset-4 z-50", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Monaco Script Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            {isValid ? (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                <Check className="h-3 w-3 mr-1" /> Valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" /> Error
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col overflow-hidden">
        {/* Templates */}
        <div className="flex flex-wrap gap-1 flex-shrink-0">
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

        {/* Monaco Editor */}
        <div className={cn("border border-border rounded-md overflow-hidden", isExpanded ? "flex-1" : "h-64")}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              folding: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading editor...
              </div>
            }
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex-shrink-0">
            <p className="text-xs text-destructive font-mono">{error}</p>
          </div>
        )}

        {/* Variables preview */}
        {Object.keys(variables).length > 0 && (
          <div className="p-2 bg-muted/50 rounded-md flex-shrink-0">
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
        <div className="flex gap-2 flex-shrink-0">
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
