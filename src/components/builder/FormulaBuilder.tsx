import { useState } from 'react';
import { Search, Atom, Check, X, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { availableMolecules, moleculeInfo } from '@/components/chemistry/MoleculeVisualization';

interface FormulaBuilderProps {
  onMoleculeSelect?: (moleculeKey: string) => void;
  className?: string;
}

// Parse formula like "H2O", "C6H12O6" into element counts
const parseFormula = (formula: string): Record<string, number> | null => {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const result: Record<string, number> = {};
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) {
      const element = match[1];
      const count = match[2] ? parseInt(match[2], 10) : 1;
      result[element] = (result[element] || 0) + count;
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
};

// Normalize formula for comparison (remove subscripts, spaces)
const normalizeFormula = (formula: string): string => {
  return formula
    .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
    .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
    .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8')
    .replace(/₉/g, '9').replace(/\s/g, '');
};

export function FormulaBuilder({ onMoleculeSelect, className = '' }: FormulaBuilderProps) {
  const [inputFormula, setInputFormula] = useState('');
  const [matchedMolecule, setMatchedMolecule] = useState<string | null>(null);
  const [parsedElements, setParsedElements] = useState<Record<string, number> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleFormulaChange = (value: string) => {
    setInputFormula(value);
    
    if (!value.trim()) {
      setMatchedMolecule(null);
      setParsedElements(null);
      setSuggestions([]);
      return;
    }

    // Parse the input formula
    const parsed = parseFormula(value);
    setParsedElements(parsed);

    // Find exact match
    const normalizedInput = normalizeFormula(value).toLowerCase();
    const exactMatch = availableMolecules.find(key => {
      const info = moleculeInfo[key];
      const normalizedKey = key.toLowerCase();
      const normalizedMolFormula = info?.formula ? normalizeFormula(info.formula).toLowerCase() : '';
      const normalizedName = info?.name?.toLowerCase() || '';
      
      return normalizedKey === normalizedInput || 
             normalizedMolFormula === normalizedInput ||
             normalizedName === normalizedInput;
    });

    setMatchedMolecule(exactMatch || null);

    // Find suggestions (partial matches)
    const matchingSuggestions = availableMolecules.filter(key => {
      const info = moleculeInfo[key];
      const normalizedKey = key.toLowerCase();
      const normalizedMolFormula = info?.formula ? normalizeFormula(info.formula).toLowerCase() : '';
      const normalizedName = info?.name?.toLowerCase() || '';
      
      return normalizedKey.includes(normalizedInput) || 
             normalizedMolFormula.includes(normalizedInput) ||
             normalizedName.includes(normalizedInput);
    }).slice(0, 8);

    setSuggestions(matchingSuggestions);
  };

  const handleSelect = (moleculeKey: string) => {
    setMatchedMolecule(moleculeKey);
    const info = moleculeInfo[moleculeKey];
    setInputFormula(info?.name || moleculeKey);
    onMoleculeSelect?.(moleculeKey);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Atom className="h-4 w-4" />
          Molecular Formula Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputFormula}
            onChange={(e) => handleFormulaChange(e.target.value)}
            placeholder="Enter formula (e.g., H2O, C6H12O6)"
            className="pl-9"
          />
        </div>

        {/* Status indicator */}
        {inputFormula && (
          <div className="flex items-center gap-2">
            {matchedMolecule ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Found: {moleculeInfo[matchedMolecule]?.name || matchedMolecule}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {moleculeInfo[matchedMolecule]?.formula}
                </Badge>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No exact match found
                </span>
              </>
            )}
          </div>
        )}

        {/* Parsed elements */}
        {parsedElements && Object.keys(parsedElements).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(parsedElements).map(([element, count]) => (
              <Badge key={element} variant="outline" className="text-xs">
                {element}: {count}
              </Badge>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !matchedMolecule && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Suggestions:
            </p>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {suggestions.map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-sm flex items-center justify-between"
                  >
                    <span>{moleculeInfo[key]?.name || key}</span>
                    <Badge variant="secondary" className="text-xs">
                      {moleculeInfo[key]?.formula || key}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* View button */}
        {matchedMolecule && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onMoleculeSelect?.(matchedMolecule)}
          >
            View 3D Structure
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
