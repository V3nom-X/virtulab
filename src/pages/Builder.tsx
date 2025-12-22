import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Share2, 
  Play, 
  Undo, 
  Redo,
  Code2,
  Sliders,
  BarChart3,
  Atom,
  Link2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ComponentPalette } from "@/components/builder/ComponentPalette";
import { DragDropCanvas, CanvasComponent } from "@/components/builder/DragDropCanvas";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { ScriptEditor } from "@/components/builder/ScriptEditor";
import { VariableControls, Variable } from "@/components/builder/VariableControls";
import { DataOutput } from "@/components/builder/DataOutput";
import { FormulaBuilder } from "@/components/builder/FormulaBuilder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Builder = () => {
  const { user } = useAuth();
  const [experimentName, setExperimentName] = useState("Untitled Experiment");
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<CanvasComponent | null>(null);
  const [activeTab, setActiveTab] = useState("components");
  const [isSaving, setIsSaving] = useState(false);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  
  // Script state
  const [scriptCode, setScriptCode] = useState("");
  
  // Variables state
  const [variables, setVariables] = useState<Variable[]>([
    { id: 'gravity', name: 'Gravity', value: 9.8, min: 0, max: 20, step: 0.1, unit: 'm/s²' },
    { id: 'friction', name: 'Friction', value: 0.3, min: 0, max: 1, step: 0.01 },
  ]);
  
  // Data output state
  const [dataPoints, setDataPoints] = useState<{ time: number; [key: string]: number }[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const dataSeries = [
    { key: 'position', name: 'Position', color: 'hsl(var(--primary))', unit: 'm' },
    { key: 'velocity', name: 'Velocity', color: 'hsl(142, 71%, 45%)', unit: 'm/s' },
    { key: 'energy', name: 'Energy', color: 'hsl(45, 93%, 47%)', unit: 'J' },
  ];

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
              <ComponentPalette />
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="outline" size="sm" onClick={() => setIsRecording(!isRecording)}>
                <Play className="w-4 h-4 mr-1" />
                {isRecording ? 'Stop' : 'Preview'}
              </Button>
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

          {/* Canvas */}
          <DragDropCanvas
            components={components}
            onComponentsChange={setComponents}
            onComponentSelect={setSelectedComponent}
            selectedId={selectedComponent?.id}
            className="flex-1"
          />
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
