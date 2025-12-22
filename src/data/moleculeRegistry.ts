// Molecule data exports for use across components
// This file exists to prevent circular dependencies

export interface MoleculeInfo {
  name?: string;
  formula?: string;
  category?: string;
}

// This will be populated by MoleculeVisualization
let moleculeRegistry: Record<string, MoleculeInfo> = {};
let moleculeKeys: string[] = [];

export const registerMolecules = (data: Record<string, MoleculeInfo>) => {
  moleculeRegistry = data;
  moleculeKeys = Object.keys(data);
};

export const getMoleculeInfo = (key: string): MoleculeInfo | undefined => {
  return moleculeRegistry[key];
};

export const getAvailableMolecules = (): string[] => {
  return moleculeKeys;
};

export const getAllMoleculeInfo = (): Record<string, MoleculeInfo> => {
  return moleculeRegistry;
};

// Static list of common molecules for FormulaBuilder to use independently
export const commonMolecules: { key: string; name: string; formula: string; category: string }[] = [
  { key: 'H2O', name: 'Water', formula: 'H₂O', category: 'Basic' },
  { key: 'CO2', name: 'Carbon Dioxide', formula: 'CO₂', category: 'Basic' },
  { key: 'NH3', name: 'Ammonia', formula: 'NH₃', category: 'Basic' },
  { key: 'HCl', name: 'Hydrogen Chloride', formula: 'HCl', category: 'Acid' },
  { key: 'NaCl', name: 'Sodium Chloride', formula: 'NaCl', category: 'Basic' },
  { key: 'CH4', name: 'Methane', formula: 'CH₄', category: 'Hydrocarbon' },
  { key: 'C2H6', name: 'Ethane', formula: 'C₂H₆', category: 'Hydrocarbon' },
  { key: 'C3H8', name: 'Propane', formula: 'C₃H₈', category: 'Hydrocarbon' },
  { key: 'C2H4', name: 'Ethene', formula: 'C₂H₄', category: 'Hydrocarbon' },
  { key: 'C2H2', name: 'Ethyne', formula: 'C₂H₂', category: 'Hydrocarbon' },
  { key: 'C6H6', name: 'Benzene', formula: 'C₆H₆', category: 'Hydrocarbon' },
  { key: 'CH3OH', name: 'Methanol', formula: 'CH₃OH', category: 'Alcohol' },
  { key: 'C2H5OH', name: 'Ethanol', formula: 'C₂H₅OH', category: 'Alcohol' },
  { key: 'CH3COOH', name: 'Acetic Acid', formula: 'CH₃COOH', category: 'Acid' },
  { key: 'H2SO4', name: 'Sulfuric Acid', formula: 'H₂SO₄', category: 'Acid' },
  { key: 'HNO3', name: 'Nitric Acid', formula: 'HNO₃', category: 'Acid' },
  { key: 'NaOH', name: 'Sodium Hydroxide', formula: 'NaOH', category: 'Base' },
  { key: 'C6H12O6', name: 'Glucose', formula: 'C₆H₁₂O₆', category: 'Carbohydrate' },
  { key: 'C8H10N4O2', name: 'Caffeine', formula: 'C₈H₁₀N₄O₂', category: 'Pharmaceutical' },
  { key: 'C9H8O4', name: 'Aspirin', formula: 'C₉H₈O₄', category: 'Pharmaceutical' },
];
