import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface PaletteComponent {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  defaultProps?: Record<string, any>;
}

interface ComponentPaletteProps {
  components?: PaletteComponent[];
  className?: string;
}

const defaultComponents: PaletteComponent[] = [
  // Physics
  { id: 'pendulum', name: 'Pendulum', icon: '🔄', category: 'Physics', description: 'Simple harmonic motion', defaultProps: { length: 1, mass: 1, angle: 45 } },
  { id: 'spring', name: 'Spring', icon: '〰️', category: 'Physics', description: 'Hooke\'s law demonstration', defaultProps: { k: 50, mass: 1, displacement: 0.5 } },
  { id: 'ramp', name: 'Inclined Plane', icon: '📐', category: 'Physics', description: 'Friction and motion', defaultProps: { angle: 30, friction: 0.3 } },
  { id: 'projectile', name: 'Projectile', icon: '🎯', category: 'Physics', description: 'Projectile motion', defaultProps: { velocity: 20, angle: 45 } },
  { id: 'collision', name: 'Collision', icon: '💥', category: 'Physics', description: 'Momentum conservation', defaultProps: { mass1: 1, mass2: 1, elastic: true } },
  { id: 'wave', name: 'Wave', icon: '🌊', category: 'Physics', description: 'Wave properties', defaultProps: { amplitude: 1, frequency: 1, wavelength: 2 } },
  
  // Chemistry
  { id: 'beaker', name: 'Beaker', icon: '🧪', category: 'Chemistry', description: 'Container for reactions', defaultProps: { volume: 500, content: 'water' } },
  { id: 'burner', name: 'Bunsen Burner', icon: '🔥', category: 'Chemistry', description: 'Heat source', defaultProps: { temperature: 500, active: false } },
  { id: 'molecule', name: 'Molecule', icon: '⚛️', category: 'Chemistry', description: '3D molecule viewer', defaultProps: { molecule: 'H2O' } },
  { id: 'titration', name: 'Titration Setup', icon: '🧫', category: 'Chemistry', description: 'Acid-base titration', defaultProps: { concentration: 1 } },
  { id: 'electrochemistry', name: 'Electrochemical Cell', icon: '🔋', category: 'Chemistry', description: 'Redox reactions', defaultProps: { voltage: 1.5 } },
  
  // Biology
  { id: 'cell', name: 'Cell', icon: '🔬', category: 'Biology', description: 'Cell structure', defaultProps: { type: 'animal' } },
  { id: 'microscope', name: 'Microscope', icon: '🔭', category: 'Biology', description: 'Magnification tool', defaultProps: { magnification: 100 } },
  { id: 'dna', name: 'DNA Helix', icon: '🧬', category: 'Biology', description: 'DNA structure', defaultProps: { basePairs: 10 } },
  
  // Electronics
  { id: 'circuit', name: 'Circuit Board', icon: '⚡', category: 'Electronics', description: 'Electronic circuit', defaultProps: { voltage: 9 } },
  { id: 'resistor', name: 'Resistor', icon: '〓', category: 'Electronics', description: 'Electrical resistance', defaultProps: { resistance: 100, unit: 'Ω' } },
  { id: 'capacitor', name: 'Capacitor', icon: '⊥', category: 'Electronics', description: 'Energy storage', defaultProps: { capacitance: 100, unit: 'µF' } },
  { id: 'led', name: 'LED', icon: '💡', category: 'Electronics', description: 'Light emitter', defaultProps: { color: 'red', voltage: 2 } },
  { id: 'battery', name: 'Battery', icon: '🔋', category: 'Electronics', description: 'Power source', defaultProps: { voltage: 9 } },
  
  // Magnetics
  { id: 'magnet', name: 'Magnet', icon: '🧲', category: 'Magnetics', description: 'Magnetic field', defaultProps: { strength: 1, poles: 'NS' } },
  { id: 'compass', name: 'Compass', icon: '🧭', category: 'Magnetics', description: 'Field direction', defaultProps: {} },
  { id: 'electromagnet', name: 'Electromagnet', icon: '⚡🧲', category: 'Magnetics', description: 'Electric magnet', defaultProps: { coils: 100, current: 1 } },
  
  // Measurement
  { id: 'stopwatch', name: 'Stopwatch', icon: '⏱️', category: 'Measurement', description: 'Time measurement', defaultProps: {} },
  { id: 'scale', name: 'Scale', icon: '⚖️', category: 'Measurement', description: 'Mass measurement', defaultProps: { precision: 0.01 } },
  { id: 'thermometer', name: 'Thermometer', icon: '🌡️', category: 'Measurement', description: 'Temperature', defaultProps: { unit: 'C' } },
  { id: 'ruler', name: 'Ruler', icon: '📏', category: 'Measurement', description: 'Length measurement', defaultProps: { unit: 'cm' } },
  { id: 'voltmeter', name: 'Voltmeter', icon: 'V', category: 'Measurement', description: 'Voltage measurement', defaultProps: {} },
  { id: 'ammeter', name: 'Ammeter', icon: 'A', category: 'Measurement', description: 'Current measurement', defaultProps: {} },
];

export function ComponentPalette({ components = defaultComponents, className = '' }: ComponentPaletteProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Physics', 'Chemistry']);

  // Group by category
  const categories = components.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, PaletteComponent[]>);

  // Filter by search
  const filteredCategories = Object.entries(categories).reduce((acc, [cat, comps]) => {
    const filtered = comps.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, PaletteComponent[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDragStart = (e: React.DragEvent, comp: PaletteComponent) => {
    e.dataTransfer.setData('component', JSON.stringify(comp));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Component list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(filteredCategories).map(([category, comps]) => (
            <div key={category} className="mb-2">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedCategories.includes(category) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {category}
                <Badge variant="secondary" className="ml-auto text-xs h-5">
                  {comps.length}
                </Badge>
              </button>

              {/* Components grid */}
              {expandedCategories.includes(category) && (
                <div className="grid grid-cols-2 gap-1.5 mt-1 pl-2">
                  {comps.map(comp => (
                    <div
                      key={comp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp)}
                      className="p-2 bg-muted/50 rounded-lg border border-transparent hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all text-center group"
                      title={comp.description}
                    >
                      <div className="text-xl mb-0.5">{comp.icon}</div>
                      <div className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {comp.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No components found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
