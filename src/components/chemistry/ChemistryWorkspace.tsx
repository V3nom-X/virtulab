import { useState, useRef } from "react";
import { Element, elements, getElementBySymbol } from "@/data/elements";
import { DraggableElement } from "./DraggableElement";
import { PeriodicTable } from "./PeriodicTable";
import { MoleculeVisualization, MoleculeSearch, availableMolecules } from "./MoleculeVisualization";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  RotateCcw, 
  FlaskConical, 
  Beaker, 
  Thermometer,
  Flame,
  Snowflake,
  Zap,
  Atom,
  X,
  Search
} from "lucide-react";
import { toast } from "sonner";

interface PlacedElement {
  id: string;
  element: Element;
  position: { x: number; y: number };
}

interface Reaction {
  reactants: string[];
  products: { symbol: string; name: string; formula: string }[];
  description: string;
  type: 'combustion' | 'synthesis' | 'decomposition' | 'single-replacement' | 'double-replacement' | 'acid-base' | 'oxidation';
  conditions?: { minTemp?: number; maxTemp?: number; catalyst?: string };
  energyChange: 'exothermic' | 'endothermic';
  color?: string;
}

const commonReactions: Reaction[] = [
  // Combustion reactions
  { 
    reactants: ['H', 'H', 'O'], 
    products: [{ symbol: 'H₂O', name: 'Water', formula: 'H2O' }],
    description: '2H₂ + O₂ → 2H₂O (Combustion of Hydrogen)',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'blue'
  },
  { 
    reactants: ['C', 'O', 'O'], 
    products: [{ symbol: 'CO₂', name: 'Carbon Dioxide', formula: 'CO2' }],
    description: 'C + O₂ → CO₂ (Combustion)',
    type: 'combustion',
    energyChange: 'exothermic'
  },
  { 
    reactants: ['C', 'H', 'H', 'H', 'H', 'O', 'O'], 
    products: [
      { symbol: 'CO₂', name: 'Carbon Dioxide', formula: 'CO2' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: 'CH₄ + 2O₂ → CO₂ + 2H₂O (Methane Combustion)',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'orange'
  },
  // Synthesis reactions
  { 
    reactants: ['Na', 'Cl'], 
    products: [{ symbol: 'NaCl', name: 'Sodium Chloride', formula: 'NaCl' }],
    description: '2Na + Cl₂ → 2NaCl (Formation of Table Salt)',
    type: 'synthesis',
    energyChange: 'exothermic',
    color: 'white'
  },
  { 
    reactants: ['Fe', 'O', 'O'], 
    products: [{ symbol: 'Fe₂O₃', name: 'Iron(III) Oxide (Rust)', formula: 'Fe2O3' }],
    description: '4Fe + 3O₂ → 2Fe₂O₃ (Rusting)',
    type: 'oxidation',
    energyChange: 'exothermic',
    color: 'red-brown'
  },
  { 
    reactants: ['N', 'N', 'H', 'H', 'H', 'H', 'H', 'H'], 
    products: [{ symbol: 'NH₃', name: 'Ammonia', formula: 'NH3' }],
    description: 'N₂ + 3H₂ → 2NH₃ (Haber Process)',
    type: 'synthesis',
    conditions: { minTemp: 400, catalyst: 'Iron' },
    energyChange: 'exothermic'
  },
  { 
    reactants: ['Ca', 'O'], 
    products: [{ symbol: 'CaO', name: 'Calcium Oxide (Quicklime)', formula: 'CaO' }],
    description: '2Ca + O₂ → 2CaO',
    type: 'synthesis',
    energyChange: 'exothermic'
  },
  { 
    reactants: ['Mg', 'O'], 
    products: [{ symbol: 'MgO', name: 'Magnesium Oxide', formula: 'MgO' }],
    description: '2Mg + O₂ → 2MgO (Bright white light)',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'bright-white'
  },
  { 
    reactants: ['S', 'O', 'O'], 
    products: [{ symbol: 'SO₂', name: 'Sulfur Dioxide', formula: 'SO2' }],
    description: 'S + O₂ → SO₂',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'blue'
  },
  // Acid formation
  { 
    reactants: ['H', 'Cl'], 
    products: [{ symbol: 'HCl', name: 'Hydrochloric Acid', formula: 'HCl' }],
    description: 'H₂ + Cl₂ → 2HCl',
    type: 'synthesis',
    energyChange: 'exothermic'
  },
  // Metal reactions
  { 
    reactants: ['Zn', 'O'], 
    products: [{ symbol: 'ZnO', name: 'Zinc Oxide', formula: 'ZnO' }],
    description: '2Zn + O₂ → 2ZnO',
    type: 'oxidation',
    energyChange: 'exothermic',
    color: 'white'
  },
  { 
    reactants: ['Cu', 'O'], 
    products: [{ symbol: 'CuO', name: 'Copper(II) Oxide', formula: 'CuO' }],
    description: '2Cu + O₂ → 2CuO',
    type: 'oxidation',
    energyChange: 'exothermic',
    color: 'black'
  },
  { 
    reactants: ['Al', 'Al', 'O', 'O', 'O'], 
    products: [{ symbol: 'Al₂O₃', name: 'Aluminum Oxide', formula: 'Al2O3' }],
    description: '4Al + 3O₂ → 2Al₂O₃',
    type: 'oxidation',
    energyChange: 'exothermic'
  },
  // Water reactions
  { 
    reactants: ['Na', 'Na', 'H', 'H', 'O'], 
    products: [
      { symbol: 'NaOH', name: 'Sodium Hydroxide', formula: 'NaOH' },
      { symbol: 'H₂', name: 'Hydrogen Gas', formula: 'H2' }
    ],
    description: '2Na + 2H₂O → 2NaOH + H₂↑ (Violent reaction!)',
    type: 'single-replacement',
    energyChange: 'exothermic',
    color: 'explosive'
  },
  { 
    reactants: ['K', 'K', 'H', 'H', 'O'], 
    products: [
      { symbol: 'KOH', name: 'Potassium Hydroxide', formula: 'KOH' },
      { symbol: 'H₂', name: 'Hydrogen Gas', formula: 'H2' }
    ],
    description: '2K + 2H₂O → 2KOH + H₂↑ (Very violent reaction!)',
    type: 'single-replacement',
    energyChange: 'exothermic',
    color: 'explosive-purple'
  },
  // Neutralization
  { 
    reactants: ['Na', 'O', 'H', 'H', 'Cl'], 
    products: [
      { symbol: 'NaCl', name: 'Sodium Chloride', formula: 'NaCl' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: 'NaOH + HCl → NaCl + H₂O (Neutralization)',
    type: 'acid-base',
    energyChange: 'exothermic'
  },
  // NEW REACTIONS (14 more to reach 30)
  // Precipitation reactions
  { 
    reactants: ['Ag', 'Na', 'Cl'], 
    products: [
      { symbol: 'AgCl', name: 'Silver Chloride', formula: 'AgCl' },
      { symbol: 'NaNO₃', name: 'Sodium Nitrate', formula: 'NaNO3' }
    ],
    description: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃ (White precipitate)',
    type: 'double-replacement',
    energyChange: 'exothermic',
    color: 'white'
  },
  { 
    reactants: ['Ba', 'Cl', 'Na', 'S', 'O'], 
    products: [
      { symbol: 'BaSO₄', name: 'Barium Sulfate', formula: 'BaSO4' },
      { symbol: 'NaCl', name: 'Sodium Chloride', formula: 'NaCl' }
    ],
    description: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl (White precipitate)',
    type: 'double-replacement',
    energyChange: 'exothermic',
    color: 'white'
  },
  // Decomposition reactions
  { 
    reactants: ['H', 'H', 'O', 'O'], 
    products: [
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' },
      { symbol: 'O₂', name: 'Oxygen Gas', formula: 'O2' }
    ],
    description: '2H₂O₂ → 2H₂O + O₂↑ (Hydrogen peroxide decomposition)',
    type: 'decomposition',
    conditions: { catalyst: 'MnO₂' },
    energyChange: 'exothermic'
  },
  { 
    reactants: ['Ca', 'C', 'O', 'O', 'O'], 
    products: [
      { symbol: 'CaO', name: 'Calcium Oxide', formula: 'CaO' },
      { symbol: 'CO₂', name: 'Carbon Dioxide', formula: 'CO2' }
    ],
    description: 'CaCO₃ → CaO + CO₂↑ (Limestone decomposition)',
    type: 'decomposition',
    conditions: { minTemp: 800 },
    energyChange: 'endothermic'
  },
  // Displacement reactions
  { 
    reactants: ['Zn', 'Cu', 'S', 'O'], 
    products: [
      { symbol: 'ZnSO₄', name: 'Zinc Sulfate', formula: 'ZnSO4' },
      { symbol: 'Cu', name: 'Copper', formula: 'Cu' }
    ],
    description: 'Zn + CuSO₄ → ZnSO₄ + Cu (Zinc displaces copper)',
    type: 'single-replacement',
    energyChange: 'exothermic',
    color: 'copper'
  },
  { 
    reactants: ['Fe', 'Cu', 'S', 'O'], 
    products: [
      { symbol: 'FeSO₄', name: 'Iron(II) Sulfate', formula: 'FeSO4' },
      { symbol: 'Cu', name: 'Copper', formula: 'Cu' }
    ],
    description: 'Fe + CuSO₄ → FeSO₄ + Cu (Iron displaces copper)',
    type: 'single-replacement',
    energyChange: 'exothermic',
    color: 'copper'
  },
  // More acid-base reactions
  { 
    reactants: ['Ca', 'O', 'H', 'H', 'Cl'], 
    products: [
      { symbol: 'CaCl₂', name: 'Calcium Chloride', formula: 'CaCl2' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: 'Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O',
    type: 'acid-base',
    energyChange: 'exothermic'
  },
  { 
    reactants: ['N', 'H', 'H', 'H', 'Cl'], 
    products: [{ symbol: 'NH₄Cl', name: 'Ammonium Chloride', formula: 'NH4Cl' }],
    description: 'NH₃ + HCl → NH₄Cl (White smoke)',
    type: 'acid-base',
    energyChange: 'exothermic',
    color: 'white-smoke'
  },
  // Thermite reaction
  { 
    reactants: ['Fe', 'Fe', 'O', 'O', 'O', 'Al', 'Al'], 
    products: [
      { symbol: 'Fe', name: 'Iron', formula: 'Fe' },
      { symbol: 'Al₂O₃', name: 'Aluminum Oxide', formula: 'Al2O3' }
    ],
    description: 'Fe₂O₃ + 2Al → 2Fe + Al₂O₃ (Thermite reaction - extremely hot!)',
    type: 'single-replacement',
    conditions: { minTemp: 1500 },
    energyChange: 'exothermic',
    color: 'molten-iron'
  },
  // Ethanol combustion
  { 
    reactants: ['C', 'C', 'H', 'H', 'H', 'H', 'H', 'H', 'O', 'O', 'O'], 
    products: [
      { symbol: 'CO₂', name: 'Carbon Dioxide', formula: 'CO2' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O (Ethanol combustion)',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'blue-flame'
  },
  // Propane combustion
  { 
    reactants: ['C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'O', 'O', 'O', 'O', 'O'], 
    products: [
      { symbol: 'CO₂', name: 'Carbon Dioxide', formula: 'CO2' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O (Propane combustion)',
    type: 'combustion',
    energyChange: 'exothermic',
    color: 'orange-flame'
  },
  // Water electrolysis (reverse)
  { 
    reactants: ['H', 'H', 'O', 'O'], 
    products: [
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: '2H₂ + O₂ → 2H₂O (Hydrogen-oxygen explosion)',
    type: 'synthesis',
    energyChange: 'exothermic',
    color: 'explosive'
  },
  // Chlorine water reaction
  { 
    reactants: ['Cl', 'Cl', 'H', 'H', 'O'], 
    products: [
      { symbol: 'HCl', name: 'Hydrochloric Acid', formula: 'HCl' },
      { symbol: 'HOCl', name: 'Hypochlorous Acid', formula: 'HOCl' }
    ],
    description: 'Cl₂ + H₂O → HCl + HOCl (Chlorine in water)',
    type: 'acid-base',
    energyChange: 'exothermic'
  },
  // Sulfuric acid neutralization
  { 
    reactants: ['Na', 'Na', 'O', 'H', 'S', 'O', 'O', 'O', 'O'], 
    products: [
      { symbol: 'Na₂SO₄', name: 'Sodium Sulfate', formula: 'Na2SO4' },
      { symbol: 'H₂O', name: 'Water', formula: 'H2O' }
    ],
    description: '2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O',
    type: 'acid-base',
    energyChange: 'exothermic'
  },
];

// Helper function to count elements
function countElements(symbols: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  symbols.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  return counts;
}

// Check if placed elements contain the required reactants
function matchesReaction(placedSymbols: string[], reactionSymbols: string[]): boolean {
  const placedCounts = countElements(placedSymbols);
  const reactionCounts = countElements(reactionSymbols);
  
  // Check if all required reactants are present with sufficient quantity
  for (const [element, count] of Object.entries(reactionCounts)) {
    if ((placedCounts[element] || 0) < count) {
      return false;
    }
  }
  return true;
}

export function ChemistryWorkspace() {
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [reactionResult, setReactionResult] = useState<Reaction | null>(null);
  const [showMoleculeViewer, setShowMoleculeViewer] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
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

  // Handle drop from quick-add tiles
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const symbol = e.dataTransfer.getData('element');
    if (!symbol) return;
    
    const element = getElementBySymbol(symbol);
    if (!element) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newElement: PlacedElement = {
      id: `${element.symbol}-${Date.now()}`,
      element,
      position: { 
        x: e.clientX - rect.left - 25,
        y: e.clientY - rect.top - 25
      }
    };
    setPlacedElements(prev => [...prev, newElement]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragStart = (e: React.DragEvent, symbol: string) => {
    e.dataTransfer.setData('element', symbol);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const checkReaction = () => {
    if (placedElements.length < 2) {
      toast.error('Add at least 2 elements to check for reactions');
      return;
    }
    
    setIsReacting(true);
    const symbols = placedElements.map(e => e.element.symbol);
    
    // Find a matching reaction using the improved matching logic
    for (const reaction of commonReactions) {
      if (matchesReaction(symbols, reaction.reactants)) {
        // Check temperature conditions
        if (reaction.conditions?.minTemp && temperature < reaction.conditions.minTemp) {
          toast.error(`Reaction requires minimum ${reaction.conditions.minTemp}°C. Current: ${temperature}°C`);
          setIsReacting(false);
          return;
        }
        if (reaction.conditions?.maxTemp && temperature > reaction.conditions.maxTemp) {
          toast.error(`Reaction requires maximum ${reaction.conditions.maxTemp}°C. Current: ${temperature}°C`);
          setIsReacting(false);
          return;
        }
        
        setTimeout(() => {
          setReactionResult(reaction);
          setIsReacting(false);
          
          // Check if we can visualize the product
          const productFormula = reaction.products[0]?.formula;
          if (productFormula && availableMolecules.includes(productFormula)) {
            setSelectedMolecule(productFormula);
            setShowMoleculeViewer(true);
          }
          
          toast.success(`Reaction complete! ${reaction.energyChange === 'exothermic' ? '🔥 Exothermic' : '❄️ Endothermic'}`);
        }, 800);
        return;
      }
    }
    
    setTimeout(() => {
      setReactionResult(null);
      setIsReacting(false);
      toast.info("No reaction found with these elements. Try different combinations!");
    }, 500);
  };

  const clearWorkspace = () => {
    setPlacedElements([]);
    setReactionResult(null);
    setSelectedMolecule(null);
    setShowMoleculeViewer(false);
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
    { symbol: 'S', name: 'Sulfur' },
    { symbol: 'Al', name: 'Aluminum' },
    { symbol: 'Mg', name: 'Magnesium' },
    { symbol: 'K', name: 'Potassium' },
  ];

  const reactionTypeColors: Record<string, string> = {
    'combustion': 'bg-orange-500/20 text-orange-600',
    'synthesis': 'bg-blue-500/20 text-blue-600',
    'decomposition': 'bg-purple-500/20 text-purple-600',
    'single-replacement': 'bg-green-500/20 text-green-600',
    'double-replacement': 'bg-cyan-500/20 text-cyan-600',
    'acid-base': 'bg-pink-500/20 text-pink-600',
    'oxidation': 'bg-red-500/20 text-red-600',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Chemistry Lab</h2>
          <Badge variant="outline" className="ml-2">
            {commonReactions.length} Reactions Available
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <input
              type="range"
              min="-50"
              max="2000"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-24"
            />
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-mono w-16">{temperature}°C</span>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            onClick={checkReaction}
            disabled={placedElements.length < 2 || isReacting}
          >
            {isReacting ? (
              <Zap className="w-4 h-4 mr-1 animate-pulse" />
            ) : (
              <Beaker className="w-4 h-4 mr-1" />
            )}
            React
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMoleculeViewer(true)}
          >
            <Atom className="w-4 h-4 mr-1" />
            Molecules
          </Button>
          <Button variant="outline" size="sm" onClick={clearWorkspace}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Element Palette */}
        <div className="w-52 border-r bg-card p-3 space-y-3 overflow-auto">
          <div className="text-sm font-medium mb-2">Quick Add Elements</div>
          <p className="text-xs text-muted-foreground mb-2">Drag or click to add</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAddElements.map(({ symbol }) => {
              const element = getElementBySymbol(symbol);
              if (!element) return null;
              return (
                <button
                  key={symbol}
                  draggable
                  onDragStart={(e) => handleDragStart(e, symbol)}
                  onClick={() => addElement(element)}
                  className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing"
                >
                  <div className="text-lg font-bold">{symbol}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{element.name}</div>
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
            Full Periodic Table
          </Button>

          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">Reaction Types</div>
            <div className="space-y-1 text-xs">
              {Object.entries(reactionTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
                  <span className="capitalize">{type.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div 
          className="flex-1 relative bg-muted/20 overflow-hidden" 
          ref={containerRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Reaction animation overlay */}
          {isReacting && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
                <span className="text-lg font-medium">Analyzing reaction...</span>
              </div>
            </div>
          )}

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
                <p className="text-sm">Drag elements from the palette or click to add</p>
                <p className="text-xs">Combine elements and click "React" to see chemical reactions</p>
              </div>
            </div>
          )}

          {/* Reaction Result */}
          {reactionResult && (
            <div className="absolute bottom-4 left-4 right-4 bg-card border rounded-xl p-4 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={reactionTypeColors[reactionResult.type] || 'bg-green-500/20 text-green-600'}>
                  {reactionResult.type.charAt(0).toUpperCase() + reactionResult.type.slice(1).replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className={reactionResult.energyChange === 'exothermic' ? 'text-orange-500' : 'text-blue-500'}>
                  {reactionResult.energyChange === 'exothermic' ? '🔥 Exothermic' : '❄️ Endothermic'}
                </Badge>
                {reactionResult.conditions?.catalyst && (
                  <Badge variant="secondary">
                    Catalyst: {reactionResult.conditions.catalyst}
                  </Badge>
                )}
              </div>
              <p className="font-mono text-sm mb-2">{reactionResult.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Products:</span>
                {reactionResult.products.map((product, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      if (availableMolecules.includes(product.formula)) {
                        setSelectedMolecule(product.formula);
                        setShowMoleculeViewer(true);
                      }
                    }}
                  >
                    {product.symbol} - {product.name}
                    {availableMolecules.includes(product.formula) && (
                      <Atom className="w-3 h-3 ml-1" />
                    )}
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
            <>
              {placedElements.map((placed) => (
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
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={clearWorkspace}
              >
                Clear All
              </Button>
            </>
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
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <PeriodicTable onElementSelect={addElement} />
            </div>
          </div>
        </div>
      )}

      {/* Molecule Viewer Modal with Search */}
      {showMoleculeViewer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-card border rounded-2xl shadow-2xl w-[900px] h-[600px] flex flex-col">
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">3D Molecule Viewer</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMoleculeViewer(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Search Panel */}
              <div className="w-64 border-r p-4">
                <MoleculeSearch 
                  onSelect={setSelectedMolecule}
                  selectedMolecule={selectedMolecule || undefined}
                />
              </div>
              {/* Viewer */}
              <div className="flex-1 p-4">
                {selectedMolecule ? (
                  <MoleculeVisualization molecule={selectedMolecule} showControls />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Atom className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Select a molecule to view its 3D structure</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
