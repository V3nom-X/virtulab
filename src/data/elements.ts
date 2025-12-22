// Complete Periodic Table Data with all element properties
export type PhaseAtRTP = 'gas' | 'liquid' | 'solid';
export type MolecularForm = 'monatomic' | 'diatomic' | 'metallic' | 'network' | 'molecular';
export type CrystalStructure = 
  | 'Simple Hexagonal' 
  | 'Face-centered Cubic' 
  | 'Body-centered Cubic'
  | 'Base-centered Monoclinic'
  | 'Base Orthorhombic'
  | 'Simple Trigonal'
  | 'Tetrahedral Packing'
  | 'Simple Triclinic'
  | 'Face-centered Orthorhombic'
  | 'Centered Tetragonal'
  | 'Simple Monoclinic'
  | 'Simple Orthorhombic'
  | 'Simple Cubic'
  | 'N/A';

export type ElementCategory = 
  | 'alkali-metal' 
  | 'alkaline-earth' 
  | 'transition-metal' 
  | 'post-transition-metal'
  | 'metalloid' 
  | 'nonmetal' 
  | 'halogen' 
  | 'noble-gas' 
  | 'lanthanide' 
  | 'actinide';

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  phaseAtRTP: PhaseAtRTP;
  molecularForm: MolecularForm;
  crystalStructure: CrystalStructure;
  category: ElementCategory;
  group: number;
  period: number;
  electronegativity?: number;
  electronConfiguration?: string;
  oxidationStates?: number[];
}

export const elements: Element[] = [
  // Period 1
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, phaseAtRTP: 'gas', molecularForm: 'diatomic', crystalStructure: 'Simple Hexagonal', category: 'nonmetal', group: 1, period: 1, electronegativity: 2.20, oxidationStates: [1, -1] },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.003, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'Face-centered Cubic', category: 'noble-gas', group: 18, period: 1, oxidationStates: [0] },
  
  // Period 2
  { atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.941, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkali-metal', group: 1, period: 2, electronegativity: 0.98, oxidationStates: [1] },
  { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.012, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'alkaline-earth', group: 2, period: 2, electronegativity: 1.57, oxidationStates: [2] },
  { atomicNumber: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Simple Trigonal', category: 'metalloid', group: 13, period: 2, electronegativity: 2.04, oxidationStates: [3] },
  { atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.01, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Simple Hexagonal', category: 'nonmetal', group: 14, period: 2, electronegativity: 2.55, oxidationStates: [4, 2, -4] },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.01, phaseAtRTP: 'gas', molecularForm: 'diatomic', crystalStructure: 'Simple Hexagonal', category: 'nonmetal', group: 15, period: 2, electronegativity: 3.04, oxidationStates: [5, 4, 3, 2, 1, -1, -2, -3] },
  { atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 16.00, phaseAtRTP: 'gas', molecularForm: 'diatomic', crystalStructure: 'Base-centered Monoclinic', category: 'nonmetal', group: 16, period: 2, electronegativity: 3.44, oxidationStates: [-2, -1, 1, 2] },
  { atomicNumber: 9, symbol: 'F', name: 'Fluorine', atomicMass: 19.00, phaseAtRTP: 'gas', molecularForm: 'diatomic', crystalStructure: 'Base-centered Monoclinic', category: 'halogen', group: 17, period: 2, electronegativity: 3.98, oxidationStates: [-1] },
  { atomicNumber: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.18, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'Face-centered Cubic', category: 'noble-gas', group: 18, period: 2, oxidationStates: [0] },
  
  // Period 3
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.99, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkali-metal', group: 1, period: 3, electronegativity: 0.93, oxidationStates: [1] },
  { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.31, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'alkaline-earth', group: 2, period: 3, electronegativity: 1.31, oxidationStates: [2] },
  { atomicNumber: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.98, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'post-transition-metal', group: 13, period: 3, electronegativity: 1.61, oxidationStates: [3] },
  { atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.09, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Tetrahedral Packing', category: 'metalloid', group: 14, period: 3, electronegativity: 1.90, oxidationStates: [4, 2, -4] },
  { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.97, phaseAtRTP: 'solid', molecularForm: 'molecular', crystalStructure: 'Simple Triclinic', category: 'nonmetal', group: 15, period: 3, electronegativity: 2.19, oxidationStates: [5, 3, -3] },
  { atomicNumber: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.07, phaseAtRTP: 'solid', molecularForm: 'molecular', crystalStructure: 'Face-centered Orthorhombic', category: 'nonmetal', group: 16, period: 3, electronegativity: 2.58, oxidationStates: [6, 4, 2, -2] },
  { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, phaseAtRTP: 'gas', molecularForm: 'diatomic', crystalStructure: 'Base Orthorhombic', category: 'halogen', group: 17, period: 3, electronegativity: 3.16, oxidationStates: [7, 5, 3, 1, -1] },
  { atomicNumber: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.95, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'Face-centered Cubic', category: 'noble-gas', group: 18, period: 3, oxidationStates: [0] },
  
  // Period 4
  { atomicNumber: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.10, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkali-metal', group: 1, period: 4, electronegativity: 0.82, oxidationStates: [1] },
  { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.08, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'alkaline-earth', group: 2, period: 4, electronegativity: 1.00, oxidationStates: [2] },
  { atomicNumber: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.96, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 3, period: 4, electronegativity: 1.36, oxidationStates: [3] },
  { atomicNumber: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.87, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 4, period: 4, electronegativity: 1.54, oxidationStates: [4, 3, 2] },
  { atomicNumber: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.94, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 5, period: 4, electronegativity: 1.63, oxidationStates: [5, 4, 3, 2] },
  { atomicNumber: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 52.00, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 6, period: 4, electronegativity: 1.66, oxidationStates: [6, 3, 2] },
  { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.94, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 7, period: 4, electronegativity: 1.55, oxidationStates: [7, 4, 3, 2] },
  { atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.85, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 8, period: 4, electronegativity: 1.83, oxidationStates: [3, 2] },
  { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.93, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 9, period: 4, electronegativity: 1.88, oxidationStates: [3, 2] },
  { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.69, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 10, period: 4, electronegativity: 1.91, oxidationStates: [2, 3] },
  { atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.55, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 11, period: 4, electronegativity: 1.90, oxidationStates: [2, 1] },
  { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 12, period: 4, electronegativity: 1.65, oxidationStates: [2] },
  { atomicNumber: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.72, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Base Orthorhombic', category: 'post-transition-metal', group: 13, period: 4, electronegativity: 1.81, oxidationStates: [3] },
  { atomicNumber: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.63, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Face-centered Cubic', category: 'metalloid', group: 14, period: 4, electronegativity: 2.01, oxidationStates: [4, 2] },
  { atomicNumber: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.92, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Simple Trigonal', category: 'metalloid', group: 15, period: 4, electronegativity: 2.18, oxidationStates: [5, 3, -3] },
  { atomicNumber: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.97, phaseAtRTP: 'solid', molecularForm: 'molecular', crystalStructure: 'Simple Monoclinic', category: 'nonmetal', group: 16, period: 4, electronegativity: 2.55, oxidationStates: [6, 4, -2] },
  { atomicNumber: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.90, phaseAtRTP: 'liquid', molecularForm: 'diatomic', crystalStructure: 'Base Orthorhombic', category: 'halogen', group: 17, period: 4, electronegativity: 2.96, oxidationStates: [7, 5, 3, 1, -1] },
  { atomicNumber: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.80, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'Face-centered Cubic', category: 'noble-gas', group: 18, period: 4, electronegativity: 3.00, oxidationStates: [2, 0] },
  
  // Period 5
  { atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.47, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkali-metal', group: 1, period: 5, electronegativity: 0.82, oxidationStates: [1] },
  { atomicNumber: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.62, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'alkaline-earth', group: 2, period: 5, electronegativity: 0.95, oxidationStates: [2] },
  { atomicNumber: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 3, period: 5, electronegativity: 1.22, oxidationStates: [3] },
  { atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.22, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 4, period: 5, electronegativity: 1.33, oxidationStates: [4] },
  { atomicNumber: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 5, period: 5, electronegativity: 1.6, oxidationStates: [5, 3] },
  { atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.95, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 6, period: 5, electronegativity: 2.16, oxidationStates: [6, 4, 2] },
  { atomicNumber: 43, symbol: 'Tc', name: 'Technetium', atomicMass: 98, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 7, period: 5, electronegativity: 1.9, oxidationStates: [7, 4] },
  { atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.07, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 8, period: 5, electronegativity: 2.2, oxidationStates: [4, 3, 2] },
  { atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 9, period: 5, electronegativity: 2.28, oxidationStates: [3] },
  { atomicNumber: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.42, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 10, period: 5, electronegativity: 2.20, oxidationStates: [4, 2] },
  { atomicNumber: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.87, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 11, period: 5, electronegativity: 1.93, oxidationStates: [1] },
  { atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.41, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 12, period: 5, electronegativity: 1.69, oxidationStates: [2] },
  { atomicNumber: 49, symbol: 'In', name: 'Indium', atomicMass: 114.82, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Centered Tetragonal', category: 'post-transition-metal', group: 13, period: 5, electronegativity: 1.78, oxidationStates: [3] },
  { atomicNumber: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.71, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Centered Tetragonal', category: 'post-transition-metal', group: 14, period: 5, electronegativity: 1.96, oxidationStates: [4, 2] },
  { atomicNumber: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.76, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Simple Trigonal', category: 'metalloid', group: 15, period: 5, electronegativity: 2.05, oxidationStates: [5, 3, -3] },
  { atomicNumber: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.60, phaseAtRTP: 'solid', molecularForm: 'network', crystalStructure: 'Simple Trigonal', category: 'metalloid', group: 16, period: 5, electronegativity: 2.1, oxidationStates: [6, 4, -2] },
  { atomicNumber: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90, phaseAtRTP: 'solid', molecularForm: 'diatomic', crystalStructure: 'Base Orthorhombic', category: 'halogen', group: 17, period: 5, electronegativity: 2.66, oxidationStates: [7, 5, 1, -1] },
  { atomicNumber: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.29, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'Face-centered Cubic', category: 'noble-gas', group: 18, period: 5, electronegativity: 2.60, oxidationStates: [8, 6, 4, 2, 0] },
  
  // Period 6
  { atomicNumber: 55, symbol: 'Cs', name: 'Caesium', atomicMass: 132.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkali-metal', group: 1, period: 6, electronegativity: 0.79, oxidationStates: [1] },
  { atomicNumber: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkaline-earth', group: 2, period: 6, electronegativity: 0.89, oxidationStates: [2] },
  { atomicNumber: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.10, oxidationStates: [3] },
  { atomicNumber: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.12, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.12, oxidationStates: [4, 3] },
  { atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.91, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.13, oxidationStates: [4, 3] },
  { atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.24, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.14, oxidationStates: [3] },
  { atomicNumber: 61, symbol: 'Pm', name: 'Promethium', atomicMass: 145, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'lanthanide', group: 3, period: 6, oxidationStates: [3] },
  { atomicNumber: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.36, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Trigonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.17, oxidationStates: [3, 2] },
  { atomicNumber: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.96, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.2, oxidationStates: [3, 2] },
  { atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.25, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.20, oxidationStates: [3] },
  { atomicNumber: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.93, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.2, oxidationStates: [4, 3] },
  { atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.50, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.22, oxidationStates: [3] },
  { atomicNumber: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.93, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.23, oxidationStates: [3] },
  { atomicNumber: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.26, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.24, oxidationStates: [3] },
  { atomicNumber: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.93, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.25, oxidationStates: [3, 2] },
  { atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.05, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.1, oxidationStates: [3, 2] },
  { atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.97, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'lanthanide', group: 3, period: 6, electronegativity: 1.27, oxidationStates: [3] },
  { atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.49, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 4, period: 6, electronegativity: 1.3, oxidationStates: [4] },
  { atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.95, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 5, period: 6, electronegativity: 1.5, oxidationStates: [5] },
  { atomicNumber: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.84, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'transition-metal', group: 6, period: 6, electronegativity: 2.36, oxidationStates: [6, 4, 2] },
  { atomicNumber: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.21, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 7, period: 6, electronegativity: 1.9, oxidationStates: [7, 6, 4] },
  { atomicNumber: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.23, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'transition-metal', group: 8, period: 6, electronegativity: 2.2, oxidationStates: [8, 6, 4, 3, 2] },
  { atomicNumber: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.22, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 9, period: 6, electronegativity: 2.20, oxidationStates: [6, 4, 3] },
  { atomicNumber: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.08, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 10, period: 6, electronegativity: 2.28, oxidationStates: [4, 2] },
  { atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'transition-metal', group: 11, period: 6, electronegativity: 2.54, oxidationStates: [3, 1] },
  { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59, phaseAtRTP: 'liquid', molecularForm: 'metallic', crystalStructure: 'Simple Trigonal', category: 'transition-metal', group: 12, period: 6, electronegativity: 2.00, oxidationStates: [2, 1] },
  { atomicNumber: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'post-transition-metal', group: 13, period: 6, electronegativity: 1.62, oxidationStates: [3, 1] },
  { atomicNumber: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'post-transition-metal', group: 14, period: 6, electronegativity: 2.33, oxidationStates: [4, 2] },
  { atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Base-centered Monoclinic', category: 'post-transition-metal', group: 15, period: 6, electronegativity: 2.02, oxidationStates: [5, 3] },
  { atomicNumber: 84, symbol: 'Po', name: 'Polonium', atomicMass: 209, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Cubic', category: 'metalloid', group: 16, period: 6, electronegativity: 2.0, oxidationStates: [6, 4, 2] },
  { atomicNumber: 85, symbol: 'At', name: 'Astatine', atomicMass: 210, phaseAtRTP: 'solid', molecularForm: 'diatomic', crystalStructure: 'N/A', category: 'halogen', group: 17, period: 6, electronegativity: 2.2, oxidationStates: [7, 5, 3, 1, -1] },
  { atomicNumber: 86, symbol: 'Rn', name: 'Radon', atomicMass: 222, phaseAtRTP: 'gas', molecularForm: 'monatomic', crystalStructure: 'N/A', category: 'noble-gas', group: 18, period: 6, electronegativity: 2.2, oxidationStates: [2, 0] },
  
  // Period 7
  { atomicNumber: 87, symbol: 'Fr', name: 'Francium', atomicMass: 223, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'alkali-metal', group: 1, period: 7, electronegativity: 0.7, oxidationStates: [1] },
  { atomicNumber: 88, symbol: 'Ra', name: 'Radium', atomicMass: 226, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Body-centered Cubic', category: 'alkaline-earth', group: 2, period: 7, electronegativity: 0.9, oxidationStates: [2] },
  { atomicNumber: 89, symbol: 'Ac', name: 'Actinium', atomicMass: 227, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'actinide', group: 3, period: 7, electronegativity: 1.1, oxidationStates: [3] },
  { atomicNumber: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.04, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Face-centered Cubic', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [4] },
  { atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.04, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Centered Tetragonal', category: 'actinide', group: 3, period: 7, electronegativity: 1.5, oxidationStates: [5, 4] },
  { atomicNumber: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Base Orthorhombic', category: 'actinide', group: 3, period: 7, electronegativity: 1.38, oxidationStates: [6, 5, 4, 3] },
  { atomicNumber: 93, symbol: 'Np', name: 'Neptunium', atomicMass: 237, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Orthorhombic', category: 'actinide', group: 3, period: 7, electronegativity: 1.36, oxidationStates: [6, 5, 4, 3] },
  { atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: 244, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Monoclinic', category: 'actinide', group: 3, period: 7, electronegativity: 1.28, oxidationStates: [6, 5, 4, 3] },
  { atomicNumber: 95, symbol: 'Am', name: 'Americium', atomicMass: 243, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [6, 5, 4, 3] },
  { atomicNumber: 96, symbol: 'Cm', name: 'Curium', atomicMass: 247, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [4, 3] },
  { atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: 247, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [4, 3] },
  { atomicNumber: 98, symbol: 'Cf', name: 'Californium', atomicMass: 251, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'Simple Hexagonal', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [4, 3] },
  { atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: 252, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [3] },
  { atomicNumber: 100, symbol: 'Fm', name: 'Fermium', atomicMass: 257, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [3] },
  { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: 258, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [3, 2] },
  { atomicNumber: 102, symbol: 'No', name: 'Nobelium', atomicMass: 259, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [3, 2] },
  { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: 266, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'actinide', group: 3, period: 7, electronegativity: 1.3, oxidationStates: [3] },
  { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: 267, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 4, period: 7, oxidationStates: [4] },
  { atomicNumber: 105, symbol: 'Db', name: 'Dubnium', atomicMass: 268, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 5, period: 7, oxidationStates: [5] },
  { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: 269, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 6, period: 7, oxidationStates: [6] },
  { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: 270, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 7, period: 7, oxidationStates: [7] },
  { atomicNumber: 108, symbol: 'Hs', name: 'Hassium', atomicMass: 269, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 8, period: 7, oxidationStates: [8] },
  { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: 278, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 9, period: 7, oxidationStates: [9] },
  { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: 281, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 10, period: 7, oxidationStates: [8, 6] },
  { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: 282, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 11, period: 7, oxidationStates: [3, 1] },
  { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: 285, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'transition-metal', group: 12, period: 7, oxidationStates: [2, 0] },
  { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: 286, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'post-transition-metal', group: 13, period: 7, oxidationStates: [3, 1] },
  { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: 289, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'post-transition-metal', group: 14, period: 7, oxidationStates: [6, 4, 2] },
  { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: 290, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'post-transition-metal', group: 15, period: 7, oxidationStates: [3, 1] },
  { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: 293, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'post-transition-metal', group: 16, period: 7, oxidationStates: [4, 2] },
  { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: 294, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'halogen', group: 17, period: 7, oxidationStates: [5, 3, 1, -1] },
  { atomicNumber: 118, symbol: 'Og', name: 'Oganesson', atomicMass: 294, phaseAtRTP: 'solid', molecularForm: 'metallic', crystalStructure: 'N/A', category: 'noble-gas', group: 18, period: 7, oxidationStates: [6, 4, 2, 0] },
];

export const getElementBySymbol = (symbol: string): Element | undefined => {
  return elements.find(e => e.symbol.toLowerCase() === symbol.toLowerCase());
};

export const getElementByNumber = (atomicNumber: number): Element | undefined => {
  return elements.find(e => e.atomicNumber === atomicNumber);
};

export const getElementsByCategory = (category: ElementCategory): Element[] => {
  return elements.filter(e => e.category === category);
};

export const getElementsByPhase = (phase: PhaseAtRTP): Element[] => {
  return elements.filter(e => e.phaseAtRTP === phase);
};

export const getCategoryColor = (category: ElementCategory): string => {
  const colors: Record<ElementCategory, string> = {
    'alkali-metal': 'hsl(15, 80%, 55%)',           // Warm orange-red
    'alkaline-earth': 'hsl(45, 85%, 50%)',         // Golden yellow
    'transition-metal': 'hsl(210, 60%, 50%)',      // Steel blue
    'post-transition-metal': 'hsl(180, 50%, 45%)', // Teal
    'metalloid': 'hsl(270, 50%, 55%)',             // Purple
    'nonmetal': 'hsl(142, 71%, 45%)',              // Green
    'halogen': 'hsl(291, 64%, 42%)',               // Violet
    'noble-gas': 'hsl(199, 89%, 48%)',             // Sky blue
    'lanthanide': 'hsl(45, 93%, 47%)',             // Gold
    'actinide': 'hsl(14, 100%, 57%)',              // Orange
  };
  return colors[category];
};

export const getPhaseIcon = (phase: PhaseAtRTP): string => {
  const icons: Record<PhaseAtRTP, string> = {
    'gas': '💨',
    'liquid': '💧',
    'solid': '🔲',
  };
  return icons[phase];
};
