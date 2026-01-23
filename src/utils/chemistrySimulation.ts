// Chemistry Simulation utilities
// Note: RDKit.js requires WebAssembly and is heavy, so we implement a lightweight 
// chemistry simulation engine with common molecular calculations

export interface Atom {
  symbol: string;
  atomicNumber: number;
  mass: number;
  electronegativity: number;
  valenceElectrons: number;
}

export interface Bond {
  atom1Index: number;
  atom2Index: number;
  order: number; // 1 = single, 2 = double, 3 = triple
  type: 'covalent' | 'ionic' | 'metallic' | 'hydrogen';
}

export interface Molecule {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
  properties: MoleculeProperties;
}

export interface MoleculeProperties {
  molecularWeight: number;
  polarityIndex: number;
  boilingPoint?: number;
  meltingPoint?: number;
  density?: number;
  solubility?: 'soluble' | 'insoluble' | 'slightly_soluble';
  pKa?: number;
  isAcid?: boolean;
  isBase?: boolean;
}

// Periodic table data for calculations
const ELEMENTS: Record<string, Atom> = {
  H: { symbol: 'H', atomicNumber: 1, mass: 1.008, electronegativity: 2.20, valenceElectrons: 1 },
  C: { symbol: 'C', atomicNumber: 6, mass: 12.011, electronegativity: 2.55, valenceElectrons: 4 },
  N: { symbol: 'N', atomicNumber: 7, mass: 14.007, electronegativity: 3.04, valenceElectrons: 5 },
  O: { symbol: 'O', atomicNumber: 8, mass: 15.999, electronegativity: 3.44, valenceElectrons: 6 },
  F: { symbol: 'F', atomicNumber: 9, mass: 18.998, electronegativity: 3.98, valenceElectrons: 7 },
  Na: { symbol: 'Na', atomicNumber: 11, mass: 22.990, electronegativity: 0.93, valenceElectrons: 1 },
  Mg: { symbol: 'Mg', atomicNumber: 12, mass: 24.305, electronegativity: 1.31, valenceElectrons: 2 },
  Al: { symbol: 'Al', atomicNumber: 13, mass: 26.982, electronegativity: 1.61, valenceElectrons: 3 },
  Si: { symbol: 'Si', atomicNumber: 14, mass: 28.086, electronegativity: 1.90, valenceElectrons: 4 },
  P: { symbol: 'P', atomicNumber: 15, mass: 30.974, electronegativity: 2.19, valenceElectrons: 5 },
  S: { symbol: 'S', atomicNumber: 16, mass: 32.065, electronegativity: 2.58, valenceElectrons: 6 },
  Cl: { symbol: 'Cl', atomicNumber: 17, mass: 35.453, electronegativity: 3.16, valenceElectrons: 7 },
  K: { symbol: 'K', atomicNumber: 19, mass: 39.098, electronegativity: 0.82, valenceElectrons: 1 },
  Ca: { symbol: 'Ca', atomicNumber: 20, mass: 40.078, electronegativity: 1.00, valenceElectrons: 2 },
  Fe: { symbol: 'Fe', atomicNumber: 26, mass: 55.845, electronegativity: 1.83, valenceElectrons: 2 },
  Cu: { symbol: 'Cu', atomicNumber: 29, mass: 63.546, electronegativity: 1.90, valenceElectrons: 1 },
  Zn: { symbol: 'Zn', atomicNumber: 30, mass: 65.380, electronegativity: 1.65, valenceElectrons: 2 },
  Br: { symbol: 'Br', atomicNumber: 35, mass: 79.904, electronegativity: 2.96, valenceElectrons: 7 },
  I: { symbol: 'I', atomicNumber: 53, mass: 126.904, electronegativity: 2.66, valenceElectrons: 7 },
};

// Parse molecular formula to get atom counts
export function parseFormula(formula: string): Map<string, number> {
  const counts = new Map<string, number>();
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    counts.set(element, (counts.get(element) || 0) + count);
  }
  
  return counts;
}

// Calculate molecular weight from formula
export function calculateMolecularWeight(formula: string): number {
  const atomCounts = parseFormula(formula);
  let totalMass = 0;
  
  atomCounts.forEach((count, symbol) => {
    const element = ELEMENTS[symbol];
    if (element) {
      totalMass += element.mass * count;
    }
  });
  
  return Math.round(totalMass * 1000) / 1000;
}

// Determine bond type based on electronegativity difference
export function determineBondType(atom1: Atom, atom2: Atom): 'covalent' | 'ionic' | 'metallic' {
  const diff = Math.abs(atom1.electronegativity - atom2.electronegativity);
  
  if (diff >= 1.7) return 'ionic';
  if (atom1.electronegativity < 1.7 && atom2.electronegativity < 1.7) return 'metallic';
  return 'covalent';
}

// Calculate bond polarity
export function calculateBondPolarity(atom1: Atom, atom2: Atom): number {
  return Math.abs(atom1.electronegativity - atom2.electronegativity);
}

// Predict molecular geometry based on VSEPR theory
export function predictGeometry(centralAtom: Atom, bondedAtoms: Atom[], lonePairs: number): string {
  const stericNumber = bondedAtoms.length + lonePairs;
  
  const geometries: Record<number, Record<number, string>> = {
    2: { 0: 'Linear' },
    3: { 0: 'Trigonal planar', 1: 'Bent' },
    4: { 0: 'Tetrahedral', 1: 'Trigonal pyramidal', 2: 'Bent' },
    5: { 0: 'Trigonal bipyramidal', 1: 'Seesaw', 2: 'T-shaped', 3: 'Linear' },
    6: { 0: 'Octahedral', 1: 'Square pyramidal', 2: 'Square planar' },
  };
  
  return geometries[stericNumber]?.[lonePairs] || 'Unknown';
}

// Predict if molecule is polar or nonpolar
export function predictPolarity(molecule: Molecule): 'polar' | 'nonpolar' {
  // Simple heuristic based on electronegativity differences
  let totalPolarity = 0;
  
  molecule.bonds.forEach(bond => {
    const atom1 = molecule.atoms[bond.atom1Index];
    const atom2 = molecule.atoms[bond.atom2Index];
    totalPolarity += calculateBondPolarity(atom1, atom2);
  });
  
  const avgPolarity = totalPolarity / molecule.bonds.length;
  return avgPolarity > 0.5 ? 'polar' : 'nonpolar';
}

// Chemical reaction types
export type ReactionType = 
  | 'synthesis' 
  | 'decomposition' 
  | 'single_replacement' 
  | 'double_replacement'
  | 'combustion'
  | 'acid_base'
  | 'redox'
  | 'precipitation';

export interface ChemicalReaction {
  reactants: string[];
  products: string[];
  type: ReactionType;
  isBalanced: boolean;
  deltaH?: number; // Enthalpy change in kJ/mol
  isExothermic?: boolean;
  conditions?: string[];
}

// Balance a chemical equation (simplified)
export function balanceEquation(reactants: string[], products: string[]): { coefficients: number[]; balanced: boolean } {
  // This is a simplified balancing - real implementation would use linear algebra
  const allFormulas = [...reactants, ...products];
  const coefficients = allFormulas.map(() => 1);
  
  // Count atoms on each side
  const countSide = (formulas: string[], coeffs: number[]) => {
    const counts = new Map<string, number>();
    formulas.forEach((formula, i) => {
      const atoms = parseFormula(formula);
      atoms.forEach((count, symbol) => {
        counts.set(symbol, (counts.get(symbol) || 0) + count * coeffs[i]);
      });
    });
    return counts;
  };
  
  // Check if balanced
  const reactantCounts = countSide(reactants, coefficients.slice(0, reactants.length));
  const productCounts = countSide(products, coefficients.slice(reactants.length));
  
  let balanced = true;
  const allElements = new Set([...reactantCounts.keys(), ...productCounts.keys()]);
  allElements.forEach(element => {
    if (reactantCounts.get(element) !== productCounts.get(element)) {
      balanced = false;
    }
  });
  
  return { coefficients, balanced };
}

// Predict reaction type
export function predictReactionType(reactants: string[], products: string[]): ReactionType {
  if (reactants.length === 2 && products.length === 1) return 'synthesis';
  if (reactants.length === 1 && products.length >= 2) return 'decomposition';
  
  // Check for combustion (hydrocarbon + O2 -> CO2 + H2O)
  if (reactants.some(r => r.includes('C') && r.includes('H')) && 
      reactants.includes('O2') &&
      products.includes('CO2') && products.includes('H2O')) {
    return 'combustion';
  }
  
  // Check for acid-base (H+ donor + H+ acceptor)
  if (reactants.some(r => r.startsWith('H')) && products.includes('H2O')) {
    return 'acid_base';
  }
  
  return 'double_replacement';
}

// Simulation state for chemistry experiments
export interface ChemistrySimulationState {
  temperature: number; // Kelvin
  pressure: number; // atm
  volume: number; // liters
  substances: Map<string, { moles: number; state: 'solid' | 'liquid' | 'gas' | 'aqueous' }>;
  reactionProgress: number; // 0-1
  equilibriumConstant?: number;
}

// Calculate reaction rate using Arrhenius equation
export function calculateReactionRate(
  activationEnergy: number, // kJ/mol
  temperature: number, // Kelvin
  preExponentialFactor: number = 1e10 // s^-1
): number {
  const R = 8.314e-3; // kJ/(mol·K)
  return preExponentialFactor * Math.exp(-activationEnergy / (R * temperature));
}

// Ideal gas law calculation
export function idealGasLaw(
  n: number, // moles
  T: number, // Kelvin
  P?: number, // atm
  V?: number // liters
): { P?: number; V?: number } {
  const R = 0.0821; // L·atm/(mol·K)
  
  if (P === undefined && V !== undefined) {
    return { P: (n * R * T) / V };
  }
  if (V === undefined && P !== undefined) {
    return { V: (n * R * T) / P };
  }
  return {};
}

// Calculate pH from H+ concentration
export function calculatePH(hConcentration: number): number {
  return -Math.log10(hConcentration);
}

// Calculate pOH from OH- concentration
export function calculatePOH(ohConcentration: number): number {
  return -Math.log10(ohConcentration);
}

// Chemistry simulation observer pattern
type SimulationObserver = (state: ChemistrySimulationState) => void;

export class ChemistrySimulation {
  private state: ChemistrySimulationState;
  private observers: Set<SimulationObserver> = new Set();
  private animationId: number | null = null;
  private lastTime: number = 0;

  constructor(initialState?: Partial<ChemistrySimulationState>) {
    this.state = {
      temperature: 298, // Room temperature
      pressure: 1, // 1 atm
      volume: 1, // 1 liter
      substances: new Map(),
      reactionProgress: 0,
      ...initialState
    };
  }

  subscribe(observer: SimulationObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notify(): void {
    this.observers.forEach(observer => observer(this.state));
  }

  addSubstance(formula: string, moles: number, state: 'solid' | 'liquid' | 'gas' | 'aqueous'): void {
    this.state.substances.set(formula, { moles, state });
    this.notify();
  }

  setTemperature(T: number): void {
    this.state.temperature = T;
    this.notify();
  }

  setPressure(P: number): void {
    this.state.pressure = P;
    this.notify();
  }

  start(): void {
    if (this.animationId) return;
    
    this.lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      this.update(dt);
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private update(dt: number): void {
    // Update reaction progress based on temperature
    const rate = calculateReactionRate(50, this.state.temperature);
    this.state.reactionProgress = Math.min(1, this.state.reactionProgress + rate * dt * 0.001);
    this.notify();
  }

  getState(): ChemistrySimulationState {
    return { ...this.state };
  }
}
