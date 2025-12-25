import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, 
  Share2, 
  Play, 
  Pause,
  Undo, 
  Redo,
  Code2,
  Sliders,
  BarChart3,
  Atom,
  Link2,
  Loader2,
  LayoutTemplate,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { ComponentPalette, PaletteComponent } from "@/components/builder/ComponentPalette";
import { DragDropCanvas, CanvasComponent } from "@/components/builder/DragDropCanvas";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { ScriptEditor } from "@/components/builder/ScriptEditor";
import { VariableControls, Variable } from "@/components/builder/VariableControls";
import { DataOutput } from "@/components/builder/DataOutput";
import { FormulaBuilder } from "@/components/builder/FormulaBuilder";
import { BuilderPreview, Connection } from "@/components/builder/BuilderPreview";
import { builderTemplates, ExperimentTemplate } from "@/data/builderTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUndoRedo } from "@/hooks/useUndoRedo";

interface BuilderState {
  components: CanvasComponent[];
  connections: Connection[];
}

const Builder = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sharedId = searchParams.get('id');
  
  const [experimentName, setExperimentName] = useState("Untitled Experiment");
  const [selectedComponent, setSelectedComponent] = useState<CanvasComponent | null>(null);
  const [activeTab, setActiveTab] = useState("components");
  const [isSaving, setIsSaving] = useState(false);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Undo/Redo state for components and connections
  const {
    state: builderState,
    set: setBuilderState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetBuilderState,
  } = useUndoRedo<BuilderState>({ components: [], connections: [] });
  
  // Preview state
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Script state
  const [scriptCode, setScriptCode] = useState("");
  
  // Variables state
  const [variables, setVariables] = useState<Variable[]>([
    { id: 'gravity', name: 'Gravity', value: 9.8, min: 0, max: 20, step: 0.1, unit: 'm/s²' },
    { id: 'friction', name: 'Friction', value: 0.3, min: 0, max: 1, step: 0.01 },
  ]);
  
  // Data output state
  const [dataPoints, setDataPoints] = useState<{ time: number; [key: string]: number }[]>([]);

  // Convenience accessors
  const components = builderState.components;
  const connections = builderState.connections;
  
  const setComponents = useCallback((newComponents: CanvasComponent[] | ((prev: CanvasComponent[]) => CanvasComponent[])) => {
    setBuilderState(prev => ({
      ...prev,
      components: typeof newComponents === 'function' ? newComponents(prev.components) : newComponents
    }));
  }, [setBuilderState]);
  
  const setConnections = useCallback((newConnections: Connection[] | ((prev: Connection[]) => Connection[])) => {
    setBuilderState(prev => ({
      ...prev,
      connections: typeof newConnections === 'function' ? newConnections(prev.connections) : newConnections
    }));
  }, [setBuilderState]);

  const dataSeries = [
    { key: 'x', name: 'X Position', color: 'hsl(var(--primary))', unit: 'm' },
    { key: 'y', name: 'Y Position', color: 'hsl(142, 71%, 45%)', unit: 'm' },
    { key: 'velocity', name: 'Velocity', color: 'hsl(45, 93%, 47%)', unit: 'm/s' },
  ];

  // Load shared experiment
  useEffect(() => {
    if (sharedId) {
      loadExperiment(sharedId);
    }
  }, [sharedId]);

  const loadExperiment = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_experiments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setExperimentName(data.title);
        setExperimentId(data.id);
        resetBuilderState({
          components: (data.components as unknown as CanvasComponent[]) || [],
          connections: []
        });
        const scripts = data.scripts as { code?: string; variables?: Variable[] } | null;
        if (scripts) {
          setScriptCode(scripts.code || '');
          setVariables(scripts.variables || []);
        }
        toast.success('Experiment loaded!');
      }
    } catch (error) {
      toast.error('Failed to load experiment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyChange = (id: string, key: string, value: any) => {
    setComponents(prev => prev.map(c => 
      c.id === id 
        ? { ...c, properties: { ...c.properties, [key]: value } }
        : c
    ));
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, properties: { ...prev.properties, [key]: value } } : null);
    }
  };

  const handleVariableChange = (id: string, value: number) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, value } : v));
  };

  const handleAddVariable = (variable: Variable) => {
    setVariables(prev => [...prev, variable]);
  };

  const handleRemoveVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
  };

  const handleMoleculeSelect = (moleculeKey: string) => {
    const newComponent: CanvasComponent = {
      id: `comp_${Date.now()}`,
      type: 'molecule',
      name: moleculeKey,
      icon: '⚛️',
      x: 100,
      y: 100,
      width: 150,
      height: 80,
      properties: { molecule: moleculeKey }
    };
    setComponents(prev => [...prev, newComponent]);
    toast.success(`Added ${moleculeKey} molecule to canvas`);
  };

  // Add component from palette click
  const handleAddComponent = useCallback((comp: PaletteComponent) => {
    const newComponent: CanvasComponent = {
      id: `comp_${Date.now()}`,
      type: comp.id,
      name: comp.name,
      icon: comp.icon,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 150,
      height: 80,
      properties: comp.defaultProps || {}
    };
    setComponents(prev => [...prev, newComponent]);
    toast.success(`Added ${comp.name}`);
  }, []);

  // Load template
  const handleLoadTemplate = (template: ExperimentTemplate) => {
    setExperimentName(template.name);
    resetBuilderState({
      components: template.components,
      connections: []
    });
    setVariables(template.variables);
    setScriptCode(template.scriptCode);
    setDataPoints([]);
    setIsPreviewing(false);
    setIsRecording(false);
    setExperimentId(null);
    toast.success(`Loaded "${template.name}" template`);
  };

  // Handle preview data
  const handlePreviewData = useCallback((data: { time: number; [key: string]: number }) => {
    if (isRecording) {
      setDataPoints(prev => {
        const newData = [...prev, data];
        return newData.length > 500 ? newData.slice(-500) : newData;
      });
    }
  }, [isRecording]);

  // Save experiment to Supabase
  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save experiments");
      return;
    }

    setIsSaving(true);
    try {
      const experimentData = {
        title: experimentName,
        user_id: user.id,
        components: components as any,
        scripts: { code: scriptCode, variables } as any,
        is_public: false,
        updated_at: new Date().toISOString()
      };

      if (experimentId) {
        await supabase
          .from('custom_experiments')
          .update(experimentData)
          .eq('id', experimentId);
        toast.success("Experiment saved!");
      } else {
        const { data, error } = await supabase
          .from('custom_experiments')
          .insert(experimentData)
          .select()
          .single();
        
        if (error) throw error;
        setExperimentId(data.id);
        toast.success("Experiment created!");
      }
    } catch (error) {
      toast.error("Failed to save experiment");
    } finally {
      setIsSaving(false);
    }
  };

  // Share experiment
  const handleShare = async () => {
    if (!experimentId) {
      toast.error("Save the experiment first to share");
      return;
    }

    await supabase
      .from('custom_experiments')
      .update({ is_public: true })
      .eq('id', experimentId);

    const shareUrl = `${window.location.origin}/builder?id=${experimentId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel */}
        <div className="w-full lg:w-72 border-r border-border bg-card flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid grid-cols-4 m-2">
              <TabsTrigger value="components" className="text-xs px-2">
                <Atom className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="variables" className="text-xs px-2">
                <Sliders className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="script" className="text-xs px-2">
                <Code2 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs px-2">
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="flex-1 m-0 overflow-hidden">
              <ComponentPalette onComponentClick={handleAddComponent} />
            </TabsContent>

            <TabsContent value="variables" className="flex-1 m-0 p-2 overflow-auto">
              <VariableControls
                variables={variables}
                onVariableChange={handleVariableChange}
                onAddVariable={handleAddVariable}
                onRemoveVariable={handleRemoveVariable}
                onReset={() => setVariables([])}
              />
              <div className="mt-4">
                <FormulaBuilder onMoleculeSelect={handleMoleculeSelect} />
              </div>
            </TabsContent>

            <TabsContent value="script" className="flex-1 m-0 p-2 overflow-auto">
              <ScriptEditor
                initialCode={scriptCode}
                onCodeChange={setScriptCode}
                variables={Object.fromEntries(variables.map(v => [v.name.toLowerCase(), v.value]))}
              />
            </TabsContent>

            <TabsContent value="data" className="flex-1 m-0 p-2 overflow-auto">
              <DataOutput
                data={dataPoints}
                series={dataSeries}
                isRecording={isRecording}
                onToggleRecording={() => setIsRecording(!isRecording)}
                onClearData={() => setDataPoints([])}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-3">
              <Input 
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                className="w-48 h-8 text-sm font-medium bg-transparent border-none focus-visible:ring-0"
              />
              <Badge variant="secondary">{experimentId ? 'Saved' : 'Draft'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Templates Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LayoutTemplate className="w-4 h-4 mr-1" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Experiment Templates</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-3">
                      {builderTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleLoadTemplate(template)}
                          className="text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {template.components.length} components • {template.variables.length} variables
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={undo} 
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={redo} 
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              
              {/* Preview Button */}
              <Button 
                variant={isPreviewing ? "secondary" : "outline"} 
                size="sm" 
                onClick={() => {
                  setIsPreviewing(!isPreviewing);
                  if (!isPreviewing) {
                    setDataPoints([]);
                  }
                }}
              >
                {isPreviewing ? <Pause className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {isPreviewing ? 'Stop' : 'Preview'}
              </Button>
              
              {isPreviewing && (
                <Button 
                  variant={isRecording ? "destructive" : "outline"} 
                  size="sm" 
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isRecording ? 'Recording...' : 'Record'}
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleShare} disabled={!experimentId}>
                <Link2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>

          {/* Canvas or Preview */}
          {isPreviewing ? (
            <BuilderPreview
              components={components}
              variables={variables}
              connections={connections}
              isRunning={isPreviewing}
              onDataPoint={handlePreviewData}
              className="flex-1"
            />
          ) : (
            <DragDropCanvas
              components={components}
              onComponentsChange={setComponents}
              onComponentSelect={setSelectedComponent}
              selectedId={selectedComponent?.id}
              connections={connections}
              onConnectionsChange={setConnections}
              className="flex-1"
            />
          )}
        </div>

        {/* Right Properties Panel */}
        <div className="w-full lg:w-72 border-l border-border bg-card">
          <PropertiesPanel
            component={selectedComponent}
            onPropertyChange={handlePropertyChange}
            onClose={() => setSelectedComponent(null)}
          />
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Builder;
