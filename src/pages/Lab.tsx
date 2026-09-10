import { useCallback, useEffect, useRef, useState } from "react";

import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileBuilderSheet } from "@/components/builder/MobileBuilderSheet";
import { Atom, Box, Eye, FileDown, FolderOpen, Layers, Pause, Save, Sliders } from "lucide-react";
import { toast } from "sonner";

import { ComponentPalette, PaletteComponent } from "@/components/builder/ComponentPalette";
import { DragDropCanvas, CanvasComponent } from "@/components/builder/DragDropCanvas";
import { BuilderDragGhost } from "@/components/builder/BuilderDragGhost";
import { Builder3DCanvas, Placeable3D } from "@/components/builder/Builder3DCanvas";
import { Builder3DPreview } from "@/components/builder/Builder3DPreview";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { VariableControls, Variable } from "@/components/builder/VariableControls";
import { downloadVlb, readVlbFile, VLB_EXTENSION } from "@/lib/vlbFormat";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "virtulab-lab-setup-v1";

interface StoredSetup {
  name: string;
  mode: "2d" | "3d";
  components: CanvasComponent[];
  bench3D: Placeable3D[];
  variables: Variable[];
}

const DEFAULT_VARIABLES: Variable[] = [
  { id: "gravity", name: "Gravity", value: 9.8, min: 0, max: 20, step: 0.1, unit: "m/s²" },
  { id: "friction", name: "Friction", value: 0.3, min: 0, max: 1, step: 0.01 },
];

/**
 * Lab module: a learner-facing bench where setups are assembled with the same
 * drag-and-drop canvas and physics preview as the experiment builder, saved on
 * the device so they survive going offline, and shared as `.vlb` files.
 */
const Lab = () => {
  const { user } = useAuth();

  const [name, setName] = useState("My lab setup");
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [bench3D, setBench3D] = useState<Placeable3D[]>([]);
  const [hydrate3DToken, setHydrate3DToken] = useState(0);
  const [variables, setVariables] = useState<Variable[]>(DEFAULT_VARIABLES);
  const [selected, setSelected] = useState<CanvasComponent | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [restored, setRestored] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore the last setup from this device (works with no connection).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as StoredSetup;
        setName(saved.name || "My lab setup");
        setMode(saved.mode === "3d" ? "3d" : "2d");
        setComponents(saved.components ?? []);
        setBench3D(saved.bench3D ?? []);
        setVariables(saved.variables?.length ? saved.variables : DEFAULT_VARIABLES);
        setHydrate3DToken((t) => t + 1);
      }
    } catch {
      /* nothing saved yet */
    } finally {
      setRestored(true);
    }
  }, []);

  // Autosave locally so a dropped connection never loses a setup.
  useEffect(() => {
    if (!restored) return;
    const setup: StoredSetup = { name, mode, components, bench3D, variables };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    } catch {
      /* storage full or unavailable */
    }
  }, [restored, name, mode, components, bench3D, variables]);

  const handleAddComponent = useCallback((comp: PaletteComponent) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `lab_${Date.now()}`,
        type: comp.id,
        name: comp.name,
        icon: comp.icon,
        x: 80 + ((prev.length * 40) % 240),
        y: 80 + ((prev.length * 30) % 180),
        width: 150,
        height: 80,
        properties: comp.defaultProps || {},
      },
    ]);
  }, []);

  const handlePropertyChange = (id: string, key: string, value: unknown) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, properties: { ...c.properties, [key]: value } } : c)),
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, properties: { ...prev.properties, [key]: value } } : prev,
    );
  };

  const handleExport = () => {
    downloadVlb({
      title: name,
      author: (user?.user_metadata?.full_name as string | undefined) || user?.email,
      canvasMode: mode,
      components,
      variables,
      bench3D,
    });
    toast.success(`Saved ${name}${VLB_EXTENSION} to your device`);
  };

  const handleOpen = async (file: File) => {
    const result = await readVlbFile(file);
    if (!result.ok || !result.file) {
      toast.error(result.error ?? "This file could not be opened.");
      return;
    }
    const doc = result.file;
    setName(doc.metadata.title);
    setMode(doc.canvasMode);
    setComponents(doc.components as unknown as CanvasComponent[]);
    setBench3D((doc.bench3D as unknown as Placeable3D[]) ?? []);
    setHydrate3DToken((t) => t + 1);
    setVariables((doc.variables as Variable[]).length ? (doc.variables as Variable[]) : DEFAULT_VARIABLES);
    setSelected(null);
    setIsRunning(false);
    toast.success(`Opened "${doc.metadata.title}"`);
    result.warnings.forEach((w) => toast.warning(w));
  };

  const sidebar = (
    <Tabs defaultValue="components" className="flex flex-col h-full">
      <TabsList className="grid grid-cols-2 m-2">
        <TabsTrigger value="components">
          <Atom className="h-4 w-4 mr-1" /> Apparatus
        </TabsTrigger>
        <TabsTrigger value="variables">
          <Sliders className="h-4 w-4 mr-1" /> Conditions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="components" className="flex-1 m-0 overflow-hidden">
        <ComponentPalette onComponentClick={handleAddComponent} />
      </TabsContent>
      <TabsContent value="variables" className="flex-1 m-0 p-2 overflow-auto">
        <VariableControls
          variables={variables}
          onVariableChange={(id, value) =>
            setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, value } : v)))
          }
          onAddVariable={(v) => setVariables((prev) => [...prev, v])}
          onRemoveVariable={(id) => setVariables((prev) => prev.filter((v) => v.id !== id))}
          onReset={() => setVariables(DEFAULT_VARIABLES)}
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col relative">
        <BuilderDragGhost />
        <input
          ref={fileInputRef}
          type="file"
          accept={VLB_EXTENSION + ",application/json"}
          className="sr-only"
          aria-label="Open a saved lab setup file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleOpen(file);
          }}
        />

        <header className="px-4 pt-6 pb-3 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold">Lab module</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag apparatus onto the bench, set the conditions, then run it to watch it behave. Your
            bench is kept on this device, so it is still here without a connection.
          </p>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row">
          <aside className="hidden lg:flex w-72 border-r border-border bg-card flex-col flex-shrink-0">
            {sidebar}
          </aside>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="min-h-14 border-y border-border flex flex-wrap items-center gap-2 px-2 sm:px-4 py-2 bg-card">
              <div className="flex items-center gap-2 lg:hidden">
                <MobileBuilderSheet title="Apparatus" side="left">
                  {sidebar}
                </MobileBuilderSheet>
              </div>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Lab setup name"
                className="w-32 sm:w-56 h-9 text-sm font-medium"
              />
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {components.length + bench3D.length} on the bench
              </Badge>

              <div className="flex items-center gap-1 ml-auto">
                {!isRunning && (
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={mode === "2d" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 min-w-11"
                      aria-pressed={mode === "2d"}
                      onClick={() => setMode("2d")}
                    >
                      <Layers className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">2D</span>
                    </Button>
                    <Button
                      variant={mode === "3d" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 min-w-11"
                      aria-pressed={mode === "3d"}
                      onClick={() => setMode("3d")}
                    >
                      <Box className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">3D</span>
                    </Button>
                  </div>
                )}

                <Button
                  variant={isRunning ? "secondary" : "outline"}
                  size="sm"
                  className="h-9"
                  onClick={() => setIsRunning((r) => !r)}
                >
                  {isRunning ? <Pause className="w-4 h-4 sm:mr-1" /> : <Eye className="w-4 h-4 sm:mr-1" />}
                  <span className="hidden sm:inline">{isRunning ? "Stop" : "Run"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FolderOpen className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Open</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9" onClick={handleExport}>
                  <FileDown className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Save file</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-[420px] flex">
              {isRunning ? (
                <Builder3DPreview
                  components={components}
                  variables={variables}
                  connections={[]}
                  isRunning={isRunning}
                  className="flex-1"
                />
              ) : mode === "3d" ? (
                <Builder3DCanvas
                  className="flex-1"
                  hydrate={bench3D}
                  hydrateToken={hydrate3DToken}
                  onObjectsChange={(objs) =>
                    setBench3D(
                      objs.map((o) => ({
                        componentId: o.componentId,
                        x: o.position.x,
                        z: o.position.z,
                        properties: o.properties,
                      })),
                    )
                  }
                />
              ) : (
                <DragDropCanvas
                  components={components}
                  onComponentsChange={setComponents}
                  onComponentSelect={setSelected}
                  selectedId={selected?.id}
                  connections={[]}
                  onConnectionsChange={() => {}}
                  className="flex-1"
                />
              )}
            </div>
          </div>

          <div className="hidden lg:block w-72 border-l border-border bg-card flex-shrink-0">
            <PropertiesPanel
              component={selected}
              onPropertyChange={handlePropertyChange}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>

        <section className="px-4 py-6">
          <Card className="max-w-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="w-4 h-4" /> How saving works here
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>Your bench saves itself on this device as you work — no sign-in needed.</p>
              <p>“Save file” gives you a shareable lab file you can open again on any device.</p>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
    </Layout>
  );
};

export default Lab;
