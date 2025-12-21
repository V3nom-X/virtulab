import { useState, useRef } from "react";
import { Element, elements, getElementBySymbol } from "@/data/elements";
import { DraggableElement } from "./DraggableElement";
import { PeriodicTable } from "./PeriodicTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  RotateCcw, 
  FlaskConical, 
  Beaker, 
  Thermometer,
  Flame,
  Snowflake
} from "lucide-react";

interface PlacedElement {
  id: string;
  element: Element;
  position: { x: number; y: number };
}

interface Reaction {
  reactants: string[];
  products: { symbol: string; name: string }[];
  description: string;
}

const commonReactions: Reaction[] = [
  { 
    reactants: ['H', 'H', 'O'], 
    products: [{ symbol: 'H₂O', name: 'Water' }],
    description: '2H₂ + O₂ → 2H₂O (Combustion of Hydrogen)'
  },
  { 
    reactants: ['Na', 'Cl'], 
    products: [{ symbol: 'NaCl', name: 'Sodium Chloride' }],
    description: '2Na + Cl₂ → 2NaCl (Formation of Table Salt)'
  },
  { 
    reactants: ['Fe', 'O', 'O'], 
    products: [{ symbol: 'FeO₂', name: 'Iron Oxide (Rust)' }],
    description: '2Fe + O₂ → 2FeO (Rusting)'
  },
  { 
    reactants: ['C', 'O', 'O'], 
    products: [{ symbol: 'CO₂', name: 'Carbon Dioxide' }],
    description: 'C + O₂ → CO₂ (Combustion)'
  },
  { 
    reactants: ['N', 'N', 'H', 'H', 'H'], 
    products: [{ symbol: 'NH₃', name: 'Ammonia' }],
    description: 'N₂ + 3H₂ → 2NH₃ (Haber Process)'
  },
  { 
    reactants: ['Ca', 'O'], 
    products: [{ symbol: 'CaO', name: 'Calcium Oxide (Quickite)' }],
    description: '2Ca + O₂ → 2CaO'
  },
  { 
    reactants: ['Mg', 'O'], 
    products: [{ symbol: 'MgO', name: 'Magnesium Oxide' }],
    description: '2Mg + O₂ → 2MgO (Bright white light)'
  },
];

export function ChemistryWorkspace() {
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [reactionResult, setReactionResult] = useState<Reaction | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addElement = (element: Element) => {
    const newElement: PlacedElement = {
      id: `${element.symbol}-${Date.now()}`,
      element,
      position: { 
        x: Math.random() * 200 + 50, 
        y: Math.random() * 200 + 50 
      }
    };
    setPlacedElements(prev => [...prev, newElement]);
    setShowPeriodicTable(false);
  };

  const removeElement = (id: string) => {
    setPlacedElements(prev => prev.filter(e => e.id !== id));
  };

  const updatePosition = (id: string, position: { x: number; y: number }) => {
    setPlacedElements(prev => 
      prev.map(e => e.id === id ? { ...e, position } : e)
    );
  };

  const checkReaction = () => {
    const symbols = placedElements.map(e => e.element.symbol).sort();
    
    for (const reaction of commonReactions) {
      const reactionSymbols = [...reaction.reactants].sort();
      if (symbols.length === reactionSymbols.length && 
          symbols.every((s, i) => s === reactionSymbols[i])) {
        setReactionResult(reaction);
        return;
      }
    }
    setReactionResult(null);
  };

  const clearWorkspace = () => {
    setPlacedElements([]);
    setReactionResult(null);
  };

  const quickAddElements: { symbol: string; name: string }[] = [
    { symbol: 'H', name: 'Hydrogen' },
    { symbol: 'O', name: 'Oxygen' },
    { symbol: 'C', name: 'Carbon' },
    { symbol: 'N', name: 'Nitrogen' },
    { symbol: 'Na', name: 'Sodium' },
    { symbol: 'Cl', name: 'Chlorine' },
    { symbol: 'Fe', name: 'Iron' },
    { symbol: 'Cu', name: 'Copper' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Chemistry Lab</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <input
              type="range"
              min="-50"
              max="200"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-20"
            />
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-mono w-12">{temperature}°C</span>
          </div>
          <Button variant="outline" size="sm" onClick={checkReaction}>
            <Beaker className="w-4 h-4 mr-1" />
            React
          </Button>
          <Button variant="outline" size="sm" onClick={clearWorkspace}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Element Palette */}
        <div className="w-48 border-r bg-card p-3 space-y-3 overflow-auto">
          <div className="text-sm font-medium mb-2">Quick Add</div>
          <div className="grid grid-cols-2 gap-2">
            {quickAddElements.map(({ symbol }) => {
              const element = getElementBySymbol(symbol);
              if (!element) return null;
              return (
                <button
                  key={symbol}
                  onClick={() => addElement(element)}
                  className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
                >
                  <div className="text-lg font-bold">{symbol}</div>
                  <div className="text-[10px] text-muted-foreground">{element.name}</div>
                </button>
              );
            })}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => setShowPeriodicTable(true)}
          >
            Full Table
          </Button>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 relative bg-muted/20 overflow-hidden" ref={containerRef}>
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Placed Elements */}
          {placedElements.map((placed) => (
            <DraggableElement
              key={placed.id}
              element={placed.element}
              position={placed.position}
              onPositionChange={(pos) => updatePosition(placed.id, pos)}
              onRemove={() => removeElement(placed.id)}
              containerRef={containerRef}
            />
          ))}

          {/* Empty state */}
          {placedElements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Drag elements from the palette</p>
                <p className="text-xs">or click "Full Table" for all elements</p>
              </div>
            </div>
          )}

          {/* Reaction Result */}
          {reactionResult && (
            <div className="absolute bottom-4 left-4 right-4 bg-card border rounded-xl p-4 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  Reaction Found!
                </Badge>
              </div>
              <p className="font-mono text-sm mb-2">{reactionResult.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Products:</span>
                {reactionResult.products.map((product, i) => (
                  <Badge key={i} variant="outline">
                    {product.symbol} - {product.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Placed Elements List */}
        <div className="w-48 border-l bg-card p-3 space-y-2 overflow-auto">
          <div className="text-sm font-medium mb-2">Workspace ({placedElements.length})</div>
          {placedElements.length === 0 ? (
            <p className="text-xs text-muted-foreground">No elements added</p>
          ) : (
            placedElements.map((placed) => (
              <div 
                key={placed.id}
                className="flex items-center justify-between bg-muted/50 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{placed.element.symbol}</span>
                  <span className="text-xs text-muted-foreground">{placed.element.name}</span>
                </div>
                <button 
                  onClick={() => removeElement(placed.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Periodic Table Modal */}
      {showPeriodicTable && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-[1200px] max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select Element</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPeriodicTable(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <PeriodicTable onElementSelect={addElement} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
