import { useState, useMemo } from "react";
import { elements, Element, getCategoryColor, getPhaseIcon, ElementCategory } from "@/data/elements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Droplets, Wind, Layers, Search } from "lucide-react";

interface PeriodicTableProps {
  onElementSelect?: (element: Element) => void;
  selectedElements?: Element[];
}

export function PeriodicTable({ onElementSelect, selectedElements = [] }: PeriodicTableProps) {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Search elements by name, symbol, or atomic number
  const searchedElement = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    return elements.find(e => 
      e.symbol.toLowerCase() === query ||
      e.name.toLowerCase() === query ||
      e.atomicNumber.toString() === query
    );
  }, [searchQuery]);

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

  // Highlight searched element
  const isSearchHighlighted = (element: Element) => {
    if (!searchedElement) return false;
    return element.atomicNumber === searchedElement.atomicNumber;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-end">
        <div className="flex-1 min-w-0 max-w-full sm:max-w-xs">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-1.5 block">Search Elements</label>
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Name, symbol, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 sm:pl-9 h-8 sm:h-10 text-sm"
            />
          </div>
          {searchQuery && !searchedElement && (
            <p className="text-[10px] sm:text-xs text-destructive mt-1">No element found</p>
          )}
          {searchedElement && (
            <p className="text-[10px] sm:text-xs text-primary mt-1">
              Found: {searchedElement.name} ({searchedElement.symbol})
            </p>
          )}
        </div>
      </div>

      {/* Filters - Scrollable on mobile */}
      <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto pb-1">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">Filter:</span>
        <Button
          variant={filterPhase === 'solid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'solid' ? null : 'solid')}
          className="h-7 sm:h-8 text-xs flex-shrink-0"
        >
          <Layers className="w-3 h-3 mr-1" />
          Solid
        </Button>
        <Button
          variant={filterPhase === 'liquid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'liquid' ? null : 'liquid')}
          className="h-7 sm:h-8 text-xs flex-shrink-0"
        >
          <Droplets className="w-3 h-3 mr-1" />
          Liquid
        </Button>
        <Button
          variant={filterPhase === 'gas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterPhase(filterPhase === 'gas' ? null : 'gas')}
          className="h-7 sm:h-8 text-xs flex-shrink-0"
        >
          <Wind className="w-3 h-3 mr-1" />
          Gas
        </Button>
        {(filterPhase || filterCategory || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterPhase(null); setFilterCategory(null); setSearchQuery(""); }}
            className="h-7 sm:h-8 text-xs flex-shrink-0"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Legend - Scrollable on mobile */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(filterCategory === cat.key ? null : cat.key)}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filterCategory === cat.key ? 'ring-2 ring-primary' : ''
            }`}
            style={{ backgroundColor: getCategoryColor(cat.key), color: 'white' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Periodic Table Grid - Horizontally scrollable */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid gap-0.5 p-2 sm:p-4 min-w-[700px] sm:min-w-[900px]" style={{ 
          gridTemplateColumns: 'repeat(18, minmax(32px, 1fr))',
          gridTemplateRows: 'repeat(10, auto)'
        }}>
          {elements.filter(e => e.category !== 'lanthanide' && e.category !== 'actinide').map((element) => {
            const pos = getGridPosition(element);
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            const isHighlighted = isSearchHighlighted(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-0.5 sm:p-1 min-h-[40px] sm:min-h-[50px] flex flex-col justify-center items-center border touch-manipulation ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${isHighlighted ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 scale-110 z-20' : ''} ${filtered && !isHighlighted ? 'opacity-20' : 'hover:scale-110 hover:z-10 active:scale-95'}`}
                style={{
                  gridRow: pos.row,
                  gridColumn: pos.col,
                  backgroundColor: getCategoryColor(element.category),
                  borderColor: isSelected ? 'hsl(var(--primary))' : isHighlighted ? 'hsl(45, 93%, 47%)' : 'transparent',
                }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[8px] sm:text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-xs sm:text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[6px] sm:text-[8px] text-white/70 truncate w-full text-center hidden sm:block">{element.name}</span>
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
        <div className="grid gap-0.5 px-2 sm:px-4 pb-2" style={{ 
          gridTemplateColumns: 'repeat(15, minmax(32px, 1fr))',
          marginLeft: '4%'
        }}>
          <div className="col-span-15 text-[10px] sm:text-xs text-muted-foreground mb-1">Lanthanides</div>
          {elements.filter(e => e.category === 'lanthanide').map((element) => {
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-0.5 sm:p-1 min-h-[40px] sm:min-h-[50px] flex flex-col justify-center items-center touch-manipulation ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${filtered ? 'opacity-20' : 'hover:scale-110 hover:z-10 active:scale-95'}`}
                style={{ backgroundColor: getCategoryColor(element.category) }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[8px] sm:text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-xs sm:text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[6px] sm:text-[8px] text-white/70 truncate w-full text-center hidden sm:block">{element.name}</span>
              </div>
            );
          })}
        </div>

        {/* Actinides */}
        <div className="grid gap-0.5 px-2 sm:px-4 pb-4" style={{ 
          gridTemplateColumns: 'repeat(15, minmax(32px, 1fr))',
          marginLeft: '4%'
        }}>
          <div className="col-span-15 text-[10px] sm:text-xs text-muted-foreground mb-1">Actinides</div>
          {elements.filter(e => e.category === 'actinide').map((element) => {
            const isSelected = selectedElements.some(e => e.atomicNumber === element.atomicNumber);
            const filtered = isFiltered(element);
            
            return (
              <div
                key={element.atomicNumber}
                className={`relative cursor-pointer transition-all duration-200 rounded p-0.5 sm:p-1 min-h-[40px] sm:min-h-[50px] flex flex-col justify-center items-center touch-manipulation ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${filtered ? 'opacity-20' : 'hover:scale-110 hover:z-10 active:scale-95'}`}
                style={{ backgroundColor: getCategoryColor(element.category) }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick(element)}
              >
                <span className="text-[8px] sm:text-[10px] text-white/80">{element.atomicNumber}</span>
                <span className="text-xs sm:text-sm font-bold text-white">{element.symbol}</span>
                <span className="text-[6px] sm:text-[8px] text-white/70 truncate w-full text-center hidden sm:block">{element.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Element Details Tooltip/Panel - Responsive positioning */}
      {(hoveredElement || selectedElement) && (
        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-card border rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 w-[calc(100vw-1rem)] sm:w-72 max-w-72 z-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold text-white"
                style={{ backgroundColor: getCategoryColor((hoveredElement || selectedElement)!.category) }}
              >
                {(hoveredElement || selectedElement)!.symbol}
              </span>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{(hoveredElement || selectedElement)!.name}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Atomic #{(hoveredElement || selectedElement)!.atomicNumber}
                </p>
              </div>
            </div>
            {selectedElement && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedElement(null)} className="h-7 w-7 sm:h-8 sm:w-8">
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs sm:text-sm">
            <div className="bg-muted/50 rounded p-1.5 sm:p-2">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Mass</div>
              <div className="font-mono text-xs sm:text-sm">{(hoveredElement || selectedElement)!.atomicMass}</div>
            </div>
            <div className="bg-muted/50 rounded p-1.5 sm:p-2">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Phase</div>
              <div className="capitalize flex items-center gap-1 text-xs sm:text-sm">
                {getPhaseIcon((hoveredElement || selectedElement)!.phaseAtRTP)}
                {(hoveredElement || selectedElement)!.phaseAtRTP}
              </div>
            </div>
          </div>
          
          {(hoveredElement || selectedElement)!.oxidationStates && (
            <div className="mt-2 sm:mt-3">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Oxidation States</div>
              <div className="flex flex-wrap gap-0.5 sm:gap-1">
                {(hoveredElement || selectedElement)!.oxidationStates!.slice(0, 6).map(state => (
                  <Badge key={state} variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">
                    {state > 0 ? `+${state}` : state}
                  </Badge>
                ))}
                {(hoveredElement || selectedElement)!.oxidationStates!.length > 6 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1">
                    +{(hoveredElement || selectedElement)!.oxidationStates!.length - 6}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
