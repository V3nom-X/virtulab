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

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort: 'in' | 'out';
  toPort: 'in' | 'out';
}

interface DragDropCanvasProps {
  components: CanvasComponent[];
  onComponentsChange: (components: CanvasComponent[]) => void;
  onComponentSelect?: (component: CanvasComponent | null) => void;
  selectedId?: string | null;
  gridSize?: number;
  className?: string;
  connections?: Connection[];
  onConnectionsChange?: (connections: Connection[]) => void;
}

export function DragDropCanvas({
  components,
  onComponentsChange,
  onComponentSelect,
  selectedId,
  gridSize = 20,
  className = '',
  connections = [],
  onConnectionsChange
}: DragDropCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ id: string; port: 'in' | 'out' } | null>(null);

  // Snap to grid
  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  // Handle drop from palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData('component');
    if (!data) return;

    try {
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
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 150,
        height: 80,
        properties: componentData.defaultProps || {}
      };

      onComponentsChange([...components, newComponent]);
      toast.success(`Added ${componentData.name}`);
    } catch (err) {
      console.error('Failed to parse drop data:', err);
    }
  }, [components, onComponentsChange, panOffset, gridSize]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      setConnectingFrom(null);
    }
  };

  // Component actions
  const handleDelete = (id: string) => {
    onComponentsChange(components.filter(c => c.id !== id));
    onConnectionsChange?.(connections.filter(c => c.fromId !== id && c.toId !== id));
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

  // Handle connection port click
  const handlePortClick = (e: React.MouseEvent, compId: string, port: 'in' | 'out') => {
    e.stopPropagation();
    
    if (!connectingFrom) {
      setConnectingFrom({ id: compId, port });
      toast.info('Click another port to connect');
    } else {
      if (connectingFrom.id === compId) {
        setConnectingFrom(null);
        return;
      }
      
      // Create connection
      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        fromId: connectingFrom.id,
        toId: compId,
        fromPort: connectingFrom.port,
        toPort: port
      };
      
      onConnectionsChange?.([...connections, newConnection]);
      setConnectingFrom(null);
      toast.success('Components connected');
    }
  };

  // Get port position for SVG line
  const getPortPosition = (comp: CanvasComponent, port: 'in' | 'out') => {
    return {
      x: comp.x + panOffset.x + (port === 'out' ? comp.width : 0),
      y: comp.y + panOffset.y + comp.height / 2
    };
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
      {/* Connection lines SVG */}
      <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        {connections.map(conn => {
          const fromComp = components.find(c => c.id === conn.fromId);
          const toComp = components.find(c => c.id === conn.toId);
          if (!fromComp || !toComp) return null;
          
          const from = getPortPosition(fromComp, conn.fromPort);
          const to = getPortPosition(toComp, conn.toPort);
          
          // Bezier curve control points
          const midX = (from.x + to.x) / 2;
          
          return (
            <g key={conn.id}>
              <path
                d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="none"
                className="pointer-events-auto cursor-pointer hover:stroke-destructive"
                onClick={() => onConnectionsChange?.(connections.filter(c => c.id !== conn.id))}
              />
              {/* Arrow head */}
              <circle cx={to.x} cy={to.y} r="4" fill="hsl(var(--primary))" />
            </g>
          );
        })}
        
        {/* Temporary connection line while connecting */}
        {connectingFrom && (
          <circle 
            cx={getPortPosition(components.find(c => c.id === connectingFrom.id)!, connectingFrom.port).x}
            cy={getPortPosition(components.find(c => c.id === connectingFrom.id)!, connectingFrom.port).y}
            r="8"
            fill="hsl(var(--primary))"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Components layer */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {components.map(comp => (
          <div
            key={comp.id}
            className={`canvas-component absolute bg-card rounded-xl border shadow-md p-3 cursor-move group select-none transition-shadow ${
              selectedId === comp.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
            } ${connectingFrom?.id === comp.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
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
            <button
              className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${
                connectingFrom ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              } ${connectingFrom?.id === comp.id && connectingFrom.port === 'in' ? 'bg-primary border-primary' : 'bg-primary/50 border-primary hover:bg-primary'}`}
              onClick={(e) => handlePortClick(e, comp.id, 'in')}
            />
            <button
              className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${
                connectingFrom ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              } ${connectingFrom?.id === comp.id && connectingFrom.port === 'out' ? 'bg-primary border-primary' : 'bg-primary/50 border-primary hover:bg-primary'}`}
              onClick={(e) => handlePortClick(e, comp.id, 'out')}
            />
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
              Drag components from the palette on the left, or click them to add to the canvas.
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
      
      {/* Connecting indicator */}
      {connectingFrom && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-primary/20 rounded text-xs text-primary">
          Click another port to connect (ESC to cancel)
        </div>
      )}
    </div>
  );
}
