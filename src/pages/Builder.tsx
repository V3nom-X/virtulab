import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  Save, 
  Share2, 
  Play, 
  Undo, 
  Redo,
  Plus,
  GripVertical,
  Settings,
  Trash2,
  Copy
} from "lucide-react";

const componentPalette = [
  { id: "pendulum", name: "Pendulum", icon: "🔄" },
  { id: "spring", name: "Spring", icon: "〰️" },
  { id: "ramp", name: "Inclined Plane", icon: "📐" },
  { id: "beaker", name: "Beaker", icon: "🧪" },
  { id: "burner", name: "Bunsen Burner", icon: "🔥" },
  { id: "cell", name: "Cell", icon: "🔬" },
  { id: "circuit", name: "Circuit", icon: "⚡" },
  { id: "magnet", name: "Magnet", icon: "🧲" },
];

const Builder = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Component Palette */}
        <div className="w-full lg:w-64 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Components
            </h2>
          </div>
          <div className="flex-1 p-3 overflow-auto">
            <div className="grid grid-cols-2 gap-2">
              {componentPalette.map((comp) => (
                <div
                  key={comp.id}
                  className="p-3 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 cursor-grab transition-all text-center group"
                  draggable
                >
                  <div className="text-2xl mb-1">{comp.icon}</div>
                  <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {comp.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3">Variables</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Untitled Experiment" 
                className="w-48 h-8 text-sm font-medium bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] overflow-auto">
            {/* Empty State */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Building</h3>
                <p className="text-muted-foreground mb-6">
                  Drag components from the left panel onto this canvas to create your custom experiment.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline">Load Template</Button>
                  <Button>Start from Scratch</Button>
                </div>
              </div>
            </div>

            {/* Example Placed Component */}
            <div className="absolute top-20 left-1/3 bg-card rounded-xl border shadow-md p-4 w-48 cursor-move group">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-lg">🔄</span>
                <span className="font-medium text-sm">Pendulum</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-full lg:w-72 border-l bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Properties</h2>
          </div>
          <div className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a component to edit its properties</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Builder;
