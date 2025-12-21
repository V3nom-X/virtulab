import { useState } from "react";
import { elements, Element, getCategoryColor, getPhaseIcon, ElementCategory } from "@/data/elements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Droplets, Wind, Layers } from "lucide-react";

interface PeriodicTableProps {
  onElementSelect?: (element: Element) => void;
  selectedElements?: Element[];
}

export function PeriodicTable({ onElementSelect, selectedElements = [] }: PeriodicTableProps) {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const getGridPosition = (element: Element) => {
    // Handle lanthanides and actinides separately
    if (element.category === 'lanthanide') {
      const lanthanideIndex = element.atomicNumber - 57;
      return { row: 9, col: lanthanideIndex + 3 };
    }
    if (element.category === 'actinide') {
      const actinideIndex = element.atomicNumber - 89;
      return { row: 10, col: actinideIndex + 3 };
    }
    
    // Standard periodic table layout
    const positions: Record<number, { row: number; col: number }> = {
      1: { row: 1, col: 1 }, 2: { row: 1, col: 18 },
      3: { row: 2, col: 1 }, 4: { row: 2, col: 2 },
      5: { row: 2, col: 13 }, 6: { row: 2, col: 14 }, 7: { row: 2, col: 15 }, 8: { row: 2, col: 16 }, 9: { row: 2, col: 17 }, 10: { row: 2, col: 18 },
      11: { row: 3, col: 1 }, 12: { row: 3, col: 2 },
      13: { row: 3, col: 13 }, 14: { row: 3, col: 14 }, 15: { row: 3, col: 15 }, 16: { row: 3, col: 16 }, 17: { row: 3, col: 17 }, 18: { row: 3, col: 18 },
    };
    
    // Period 4-7 main group and transition metals
    if (element.period >= 4 && element.period <= 7) {
      if (element.group >= 1 && element.group <= 2) {
        return { row: element.period, col: element.group };
      }
      if (element.group >= 3 && element.group <= 12) {
        return { row: element.period, col: element.group };
      }
      if (element.group >= 13) {
        return { row: element.period, col: element.group };
      }
    }
    
    return positions[element.atomicNumber] || { row: element.period, col: element.group };
  };

  const isFiltered = (element: Element) => {
    if (filterPhase && element.phaseAtRTP !== filterPhase) return true;
    if (filterCategory && element.category !== filterCategory) return true;
    return false;
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    onElementSelect?.(element);
  };

  const categories: { key: ElementCategory; label: string }[] = [
    { key: 'alkali-metal', label: 'Alkali Metals' },
    { key: 'alkaline-earth', label: 'Alkaline Earth' },
    { key: 'transition-metal', label: 'Transition Metals' },
    { key: 'post-transition-metal', label: 'Post-Transition' },
    { key: 'metalloid', label: 'Metalloids' },
    { key: 'nonmetal', label: 'Nonmetals' },
    { key: 'halogen', label: 'Halogens' },
    { key: 'noble-gas', label: 'Noble Gases' },
    { key: 'lanthanide', label: 'Lanthanides' },
    { key: 'actinide', label: 'Actinides' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <Button
          variant={filterPhase === 'solid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'solid' ? null : 'solid')}
        >
          <Layers className="w-3 h-3 mr-1" />
          Solid
        </Button>
        <Button
          variant={filterPhase === 'liquid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'liquid' ? null : 'liquid')}
        >
          <Droplets className="w-3 h-3 mr-1" />
          Liquid
        </Button>
        <Button
          variant={filterPhase === 'gas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'gas' ? null : 'gas')}
        >
          <Wind className="w-3 h-3 mr-1" />
          Gas
        </Button>
        {(filterPhase || filterCategory) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterPhase(null); setFilterCategory(null); }}
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(filterCategory === cat.key ? null : cat.key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              filterCategory === cat.key ? 'ring-2 ring-primary' : ''
            }`}
            style={{ backgroundColor: getCategoryColor(cat.key), color: 'white' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Periodic Table Grid */}
      <div className="overflow-x-auto">
        <div className="grid gap-0.5 p-4 min-w-[900px]" style={{ 
          gridTemplateColumns: 'repeat(18, minmax(40px, 1fr))',
          gridTemplateRows: 'repeat(10, auto)'
        }}>
          {elements.filter(e => e.category !== 'lanthanide' && e.category !== 'actinide').map((element) => {
            const pos = getGridPosition(element);
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-1 min-h-[50px] flex flex-col justify-center items-center border ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${filtered ? 'opacity-20' : 'hover:scale-110 hover:z-10'}`}
                style={{
                  gridRow: pos.row,
                  gridColumn: pos.col,
                  backgroundColor: getCategoryColor(element.category),
                  borderColor: isSelected ? 'hsl(var(--primary))' : 'transparent',
                }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[8px] text-white/70 truncate w-full text-center">{element.name}</span>
              </div>
            );
          })}

          {/* Lanthanide row indicator */}
          <div 
            className="flex items-center justify-center text-xs font-medium text-muted-foreground"
            style={{ gridRow: 6, gridColumn: 3 }}
          >
            57-71
          </div>
          
          {/* Actinide row indicator */}
          <div 
            className="flex items-center justify-center text-xs font-medium text-muted-foreground"
            style={{ gridRow: 7, gridColumn: 3 }}
          >
            89-103
          </div>
        </div>

        {/* Lanthanides */}
        <div className="grid gap-0.5 px-4 pb-2" style={{ 
          gridTemplateColumns: 'repeat(15, minmax(40px, 1fr))',
          marginLeft: '6%'
        }}>
          <div className="col-span-15 text-xs text-muted-foreground mb-1">Lanthanides</div>
          {elements.filter(e => e.category === 'lanthanide').map((element) => {
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-1 min-h-[50px] flex flex-col justify-center items-center ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${filtered ? 'opacity-20' : 'hover:scale-110 hover:z-10'}`}
                style={{ backgroundColor: getCategoryColor(element.category) }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[8px] text-white/70 truncate w-full text-center">{element.name}</span>
              </div>
            );
          })}
        </div>

        {/* Actinides */}
        <div className="grid gap-0.5 px-4 pb-4" style={{ 
          gridTemplateColumns: 'repeat(15, minmax(40px, 1fr))',
          marginLeft: '6%'
        }}>
          <div className="col-span-15 text-xs text-muted-foreground mb-1">Actinides</div>
          {elements.filter(e => e.category === 'actinide').map((element) => {
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-1 min-h-[50px] flex flex-col justify-center items-center ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${filtered ? 'opacity-20' : 'hover:scale-110 hover:z-10'}`}
                style={{ backgroundColor: getCategoryColor(element.category) }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[8px] text-white/70 truncate w-full text-center">{element.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Element Details Tooltip/Panel */}
      {(hoveredElement || selectedElement) && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-xl shadow-xl p-4 w-72 z-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: getCategoryColor((hoveredElement || selectedElement)!.category) }}
                >
                  {(hoveredElement || selectedElement)!.symbol}
                </span>
                <div>
                  <h3 className="font-semibold">{(hoveredElement || selectedElement)!.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Atomic #{(hoveredElement || selectedElement)!.atomicNumber}
                  </p>
                </div>
              </div>
            </div>
            {selectedElement && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedElement(null)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">Mass</div>
              <div className="font-mono">{(hoveredElement || selectedElement)!.atomicMass}</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">Phase (RTP)</div>
              <div className="capitalize flex items-center gap-1">
                {getPhaseIcon((hoveredElement || selectedElement)!.phaseAtRTP)}
                {(hoveredElement || selectedElement)!.phaseAtRTP}
              </div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">Crystal</div>
              <div className="text-xs">{(hoveredElement || selectedElement)!.crystalStructure}</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-xs text-muted-foreground">Electronegativity</div>
              <div className="font-mono">{(hoveredElement || selectedElement)!.electronegativity || 'N/A'}</div>
            </div>
          </div>
          
          {(hoveredElement || selectedElement)!.oxidationStates && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">Oxidation States</div>
              <div className="flex flex-wrap gap-1">
                {(hoveredElement || selectedElement)!.oxidationStates!.map(state => (
                  <Badge key={state} variant="secondary" className="text-xs">
                    {state > 0 ? `+${state}` : state}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
