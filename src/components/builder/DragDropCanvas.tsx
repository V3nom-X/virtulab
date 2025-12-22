import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Settings, Trash2, Copy, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface CanvasComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  connections?: string[];
}

interface DragDropCanvasProps {
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  onComponentSelect?: (component: CanvasComponent | null) => void;
  selectedId?: string | null;
  gridSize?: number;
  className?: string;
}

export function DragDropCanvas({
  components,
  onComponentsChange,
  onComponentSelect,
  selectedId,
  gridSize = 20,
  className = ''
}: DragDropCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Snap to grid
  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  // Handle drop from palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('component');
    if (!data) return;

    const componentData = JSON.parse(data);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = snapToGrid(e.clientX - rect.left - panOffset.x - 75);
    const y = snapToGrid(e.clientY - rect.top - panOffset.y - 40);

    const newComponent: CanvasComponent = {
      id: `comp_${Date.now()}`,
      type: componentData.id,
      name: componentData.name,
      icon: componentData.icon,
      x,
      y,
      width: 150,
      height: 80,
      properties: componentData.defaultProps || {}
    };

    onComponentsChange([...components, newComponent]);
    toast.success(`Added ${componentData.name}`);
  }, [components, onComponentsChange, panOffset, gridSize]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle component drag
  const handleComponentMouseDown = (e: React.MouseEvent, comp: CanvasComponent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    const rect = (e.target as HTMLElement).closest('.canvas-component')?.getBoundingClientRect();
    if (!rect) return;

    setDragging(comp.id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    onComponentSelect?.(comp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = snapToGrid(e.clientX - rect.left - panOffset.x - dragOffset.x);
      const y = snapToGrid(e.clientY - rect.top - panOffset.y - dragOffset.y);

      onComponentsChange(
        components.map(c => 
          c.id === dragging 
            ? { ...c, x: Math.max(0, x), y: Math.max(0, y) }
            : c
        )
      );
    } else if (isPanning) {
      setPanOffset({
        x: panOffset.x + e.clientX - panStart.x,
        y: panOffset.y + e.clientY - panStart.y
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, isPanning, dragOffset, panOffset, panStart, components, onComponentsChange, gridSize]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle canvas pan (middle click or shift+drag)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0) {
      onComponentSelect?.(null);
    }
  };

  // Component actions
  const handleDelete = (id: string) => {
    onComponentsChange(components.filter(c => c.id !== id));
    if (selectedId === id) onComponentSelect?.(null);
    toast.success('Component removed');
  };

  const handleDuplicate = (comp: CanvasComponent) => {
    const newComp: CanvasComponent = {
      ...comp,
      id: `comp_${Date.now()}`,
      x: comp.x + 20,
      y: comp.y + 20
    };
    onComponentsChange([...components, newComp]);
    toast.success('Component duplicated');
  };

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] cursor-default ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseDown={handleCanvasMouseDown}
      style={{ backgroundPosition: `${panOffset.x}px ${panOffset.y}px` }}
    >
      {/* Components layer */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
      >
        {components.map(comp => (
          <div
            key={comp.id}
            className={`canvas-component absolute bg-card rounded-xl border shadow-md p-3 cursor-move group select-none transition-shadow ${
              selectedId === comp.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
            }`}
            style={{
              left: comp.x,
              top: comp.y,
              width: comp.width,
              minHeight: comp.height
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, comp)}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              <span className="text-lg">{comp.icon}</span>
              <span className="font-medium text-sm flex-1 truncate">{comp.name}</span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onComponentSelect?.(comp);
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(comp);
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(comp.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Connection points */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/50 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/50 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Move className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop Components</h3>
            <p className="text-muted-foreground">
              Drag components from the palette on the left to start building your experiment.
            </p>
          </div>
        </div>
      )}

      {/* Pan indicator */}
      {isPanning && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/20 rounded text-xs text-primary">
          Panning
        </div>
      )}
    </div>
  );
}
