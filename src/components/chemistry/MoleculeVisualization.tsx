import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Atom {
  symbol: string;
  position: [number, number, number];
  color: string;
  radius: number;
}

interface Bond {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

interface MoleculeData {
  atoms: Atom[];
  bonds: Bond[];
  name?: string;
  formula?: string;
}

interface MoleculeVisualizationProps {
  molecule: string;
  className?: string;
}

// Atom colors based on CPK coloring
const atomColors = {
  H: '#ffffff',
  C: '#333333',
  N: '#3050f8',
  O: '#ff0000',
  S: '#ffff30',
  P: '#ff8000',
  Cl: '#00ff00',
  Na: '#ab82ff',
  F: '#90e050',
  Br: '#a62929',
  I: '#940094',
};

const moleculeData: Record<string, MoleculeData> = {
  // Basic molecules
  H2O: {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { symbol: 'O', position: [0, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [-0.8, 0.6, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.8, 0.6, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }],
  },
  CO2: {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [-1.2, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.2, 0, 0], color: atomColors.O, radius: 0.6 },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 2 }],
  },
  NH3: {
    name: 'Ammonia',
    formula: 'NH₃',
    atoms: [
      { symbol: 'N', position: [0, 0, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'H', position: [0, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.8, -0.45, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.8, -0.45, 0.4], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 }],
  },
  HCl: {
    name: 'Hydrogen Chloride',
    formula: 'HCl',
    atoms: [
      { symbol: 'H', position: [-0.65, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'Cl', position: [0.65, 0, 0], color: atomColors.Cl, radius: 0.8 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  NaCl: {
    name: 'Sodium Chloride',
    formula: 'NaCl',
    atoms: [
      { symbol: 'Na', position: [-0.6, 0, 0], color: atomColors.Na, radius: 0.9 },
      { symbol: 'Cl', position: [0.6, 0, 0], color: atomColors.Cl, radius: 0.8 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  // Alkanes
  CH4: {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [0.6, 0.6, 0.6], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.6, -0.6, 0.6], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.6, -0.6, -0.6], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.6, 0.6, -0.6], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 }],
  },
  C2H6: {
    name: 'Ethane',
    formula: 'C₂H₆',
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.15, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.15, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.15, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 }, { from: 1, to: 6, order: 1 }, { from: 1, to: 7, order: 1 },
    ],
  },
  C3H8: {
    name: 'Propane',
    formula: 'C₃H₈',
    atoms: [
      { symbol: 'C', position: [-1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0, 0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0, -0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 }, { from: 0, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 }, { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 }, { from: 2, to: 9, order: 1 }, { from: 2, to: 10, order: 1 },
    ],
  },
  C4H10: {
    name: 'Butane',
    formula: 'C₄H₁₀',
    atoms: [
      { symbol: 'C', position: [-1.9, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.63, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.63, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.9, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-2.3, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.3, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.3, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.63, 0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.63, -0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.63, 0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.63, -0.9, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.3, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.3, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.3, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 }, { from: 0, to: 5, order: 1 }, { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 }, { from: 1, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 }, { from: 2, to: 10, order: 1 },
      { from: 3, to: 11, order: 1 }, { from: 3, to: 12, order: 1 }, { from: 3, to: 13, order: 1 },
    ],
  },
  // Alkenes
  C2H4: {
    name: 'Ethene',
    formula: 'C₂H₄',
    atoms: [
      { symbol: 'C', position: [-0.67, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.67, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-1.2, 0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.2, -0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.2, 0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.2, -0.9, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 }, { from: 1, to: 5, order: 1 },
    ],
  },
  C3H6: {
    name: 'Propene',
    formula: 'C₃H₆',
    atoms: [
      { symbol: 'C', position: [-1.3, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.3, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-1.8, 0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.8, -0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0, 1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
      { from: 2, to: 6, order: 1 }, { from: 2, to: 7, order: 1 }, { from: 2, to: 8, order: 1 },
    ],
  },
  // Alkynes
  C2H2: {
    name: 'Ethyne (Acetylene)',
    formula: 'C₂H₂',
    atoms: [
      { symbol: 'C', position: [-0.6, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.6, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [-1.5, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.5, 0, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 3 },
      { from: 0, to: 2, order: 1 }, { from: 1, to: 3, order: 1 },
    ],
  },
  // Aromatics
  C6H6: {
    name: 'Benzene',
    formula: 'C₆H₆',
    atoms: [
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [2.5, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, 2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, 2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.5, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.17, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 }, { from: 1, to: 7, order: 1 }, { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 }, { from: 4, to: 10, order: 1 }, { from: 5, to: 11, order: 1 },
    ],
  },
  C7H8: {
    name: 'Toluene',
    formula: 'C₇H₈',
    atoms: [
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [2.9, 0, 0], color: atomColors.C, radius: 0.5 }, // Methyl group
      { symbol: 'H', position: [1.25, 2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, 2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.5, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.17, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.3, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.3, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.3, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 }, { from: 2, to: 8, order: 1 }, { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 }, { from: 5, to: 11, order: 1 },
      { from: 6, to: 12, order: 1 }, { from: 6, to: 13, order: 1 }, { from: 6, to: 14, order: 1 },
    ],
  },
  // Alcohols
  CH3OH: {
    name: 'Methanol',
    formula: 'CH₃OH',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.2, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [1.7, 0.7, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.5, 0.9, 0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.5, -0.9, 0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.5, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 }, { from: 0, to: 5, order: 1 },
    ],
  },
  C2H5OH: {
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.5, 0, 1], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [2.2, 0, 1.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.15, 0.9, -0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.15, -0.9, -0.4], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 }, { from: 0, to: 5, order: 1 }, { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 }, { from: 1, to: 8, order: 1 },
    ],
  },
  // Aldehydes and Ketones
  CH2O: {
    name: 'Formaldehyde',
    formula: 'CH₂O',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.2, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [-0.5, 0.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.5, -0.9, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 },
    ],
  },
  C3H6O: {
    name: 'Acetone',
    formula: 'C₃H₆O',
    atoms: [
      { symbol: 'C', position: [-1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [0, 1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [-1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 1, to: 3, order: 2 },
      { from: 0, to: 4, order: 1 }, { from: 0, to: 5, order: 1 }, { from: 0, to: 6, order: 1 },
      { from: 2, to: 7, order: 1 }, { from: 2, to: 8, order: 1 }, { from: 2, to: 9, order: 1 },
    ],
  },
  // Carboxylic Acids
  CH3COOH: {
    name: 'Acetic Acid',
    formula: 'CH₃COOH',
    atoms: [
      { symbol: 'C', position: [-0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.77, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.2, 1.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.4, -1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [2.1, -1.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.15, 0, -0.9], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 1, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 }, { from: 0, to: 6, order: 1 }, { from: 0, to: 7, order: 1 },
    ],
  },
  // Acids
  H2SO4: {
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    atoms: [
      { symbol: 'S', position: [0, 0, 0], color: atomColors.S, radius: 0.65 },
      { symbol: 'O', position: [0, 1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [0, -1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1, 0, 0.6], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1, 0, 0.6], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [1.6, 0, 1], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.6, 0, 1], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 2 },
      { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 },
      { from: 3, to: 5, order: 1 }, { from: 4, to: 6, order: 1 },
    ],
  },
  HNO3: {
    name: 'Nitric Acid',
    formula: 'HNO₃',
    atoms: [
      { symbol: 'N', position: [0, 0, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'O', position: [1.1, 0.5, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1.1, 0.5, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [0, -1.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [0.5, -1.6, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
    ],
  },
  // Sugars
  C6H12O6: {
    name: 'Glucose',
    formula: 'C₆H₁₂O₆',
    atoms: [
      { symbol: 'C', position: [1.2, 0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.6, 1.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.6, 1.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.2, 0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.6, -0.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [0.6, -0.4, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [2.0, 0.5, 0.8], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.0, 2.2, 0.5], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1.0, 2.2, -0.5], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-2.0, 0.5, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-0.6, -1.2, 0.5], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [2.8, 0.5, 0.2], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [1.5, 2.8, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.5, 2.8, -0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.5, 0.5, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.6, -1.8, 1], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.4, 0.5, 0.7], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 }, { from: 1, to: 7, order: 1 }, { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 }, { from: 4, to: 10, order: 1 }, { from: 6, to: 11, order: 1 },
      { from: 7, to: 12, order: 1 }, { from: 8, to: 13, order: 1 }, { from: 9, to: 14, order: 1 },
      { from: 10, to: 15, order: 1 }, { from: 11, to: 16, order: 1 },
    ],
  },
  // Urea
  CH4N2O: {
    name: 'Urea',
    formula: 'CH₄N₂O',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [0, 1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'N', position: [-1, -0.5, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'N', position: [1, -0.5, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'H', position: [-1.5, -1.2, 0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.5, 0.1, -0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.5, -1.2, 0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.5, 0.1, -0.3], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 },
      { from: 2, to: 4, order: 1 }, { from: 2, to: 5, order: 1 },
      { from: 3, to: 6, order: 1 }, { from: 3, to: 7, order: 1 },
    ],
  },
  // Lactic Acid
  C3H6O3: {
    name: 'Lactic Acid',
    formula: 'C₃H₆O₃',
    atoms: [
      { symbol: 'C', position: [-1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.27, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [0, 1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.7, 1.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.9, -1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [0.5, 1.7, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.5, -1.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, 0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, -0.9, 0.4], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.7, 0, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0, -1, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 },
      { from: 1, to: 3, order: 1 }, { from: 3, to: 6, order: 1 },
      { from: 2, to: 4, order: 2 }, { from: 2, to: 5, order: 1 }, { from: 5, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 }, { from: 0, to: 9, order: 1 }, { from: 0, to: 10, order: 1 },
      { from: 1, to: 11, order: 1 },
    ],
  },
  // Simple amino acids
  C2H5NO2: {
    name: 'Glycine',
    formula: 'C₂H₅NO₂',
    atoms: [
      { symbol: 'C', position: [-0.7, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-1.4, 1, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'O', position: [1.2, 1.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.4, -1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [-0.7, -0.5, 0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.7, -0.5, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1, 1.6, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.3, 1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.1, -1.3, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 },
      { from: 1, to: 3, order: 2 }, { from: 1, to: 4, order: 1 }, { from: 4, to: 9, order: 1 },
      { from: 0, to: 5, order: 1 }, { from: 0, to: 6, order: 1 },
      { from: 2, to: 7, order: 1 }, { from: 2, to: 8, order: 1 },
    ],
  },
  // Caffeine
  C8H10N4O2: {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    atoms: [
      // Purine ring system
      { symbol: 'N', position: [0, 1.2, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [1.1, 0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [1.4, -0.5, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [0.5, -1.3, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.8, -0.9, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.1, 0.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-2.3, 0.8, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [-2.8, -0.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-1.9, -1.3, 0], color: atomColors.N, radius: 0.55 },
      // Oxygen atoms
      { symbol: 'O', position: [2.2, 1.3, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [0.8, -2.4, 0], color: atomColors.O, radius: 0.6 },
      // Methyl groups
      { symbol: 'C', position: [0.3, 2.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [2.8, -0.9, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-2.1, -2.6, 0], color: atomColors.C, radius: 0.5 },
      // Hydrogens
      { symbol: 'H', position: [-3.8, -0.6, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.8, 2.9, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.8, 2.9, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.6, 3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.3, -0.5, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.3, -0.5, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.9, -1.9, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.6, -3, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.6, -3, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.2, -3.1, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
      { from: 8, to: 4, order: 1 },
      { from: 1, to: 9, order: 2 }, { from: 3, to: 10, order: 2 },
      { from: 0, to: 11, order: 1 }, { from: 2, to: 12, order: 1 }, { from: 8, to: 13, order: 1 },
      { from: 7, to: 14, order: 1 },
      { from: 11, to: 15, order: 1 }, { from: 11, to: 16, order: 1 }, { from: 11, to: 17, order: 1 },
      { from: 12, to: 18, order: 1 }, { from: 12, to: 19, order: 1 }, { from: 12, to: 20, order: 1 },
      { from: 13, to: 21, order: 1 }, { from: 13, to: 22, order: 1 }, { from: 13, to: 23, order: 1 },
    ],
  },
  // Aspirin
  C9H8O4: {
    name: 'Aspirin',
    formula: 'C₉H₈O₄',
    atoms: [
      // Benzene ring
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      // Carboxylic acid group
      { symbol: 'C', position: [2.8, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [3.3, 1.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [3.5, -1, 0], color: atomColors.O, radius: 0.6 },
      // Acetyl group
      { symbol: 'O', position: [-2.8, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [-3.5, 1, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [-3.2, 2.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [-4.9, 0.6, 0], color: atomColors.C, radius: 0.5 },
      // Hydrogens
      { symbol: 'H', position: [1.25, 2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, 2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [4.2, -1.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5.3, 1.1, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5.3, 1.1, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5.1, -0.4, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 6, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 },
      { from: 10, to: 12, order: 1 },
      { from: 1, to: 13, order: 1 }, { from: 2, to: 14, order: 1 },
      { from: 4, to: 15, order: 1 }, { from: 5, to: 16, order: 1 },
      { from: 8, to: 17, order: 1 },
      { from: 12, to: 18, order: 1 }, { from: 12, to: 19, order: 1 }, { from: 12, to: 20, order: 1 },
    ],
  },
  // Paracetamol (Acetaminophen)
  C8H9NO2: {
    name: 'Paracetamol',
    formula: 'C₈H₉NO₂',
    atoms: [
      // Benzene ring
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      // Hydroxyl group
      { symbol: 'O', position: [2.7, 0, 0], color: atomColors.O, radius: 0.6 },
      // Amide group
      { symbol: 'N', position: [-2.7, 0, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [-3.4, 1, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [-3.1, 2.1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [-4.8, 0.6, 0], color: atomColors.C, radius: 0.5 },
      // Hydrogens
      { symbol: 'H', position: [3.2, 0.7, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-3.1, -0.8, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, 2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, 2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5.2, 1.1, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5.2, 1.1, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-5, -0.4, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 }, { from: 6, to: 11, order: 1 },
      { from: 3, to: 7, order: 1 }, { from: 7, to: 8, order: 1 }, { from: 7, to: 12, order: 1 },
      { from: 8, to: 9, order: 2 }, { from: 8, to: 10, order: 1 },
      { from: 1, to: 13, order: 1 }, { from: 2, to: 14, order: 1 },
      { from: 4, to: 15, order: 1 }, { from: 5, to: 16, order: 1 },
      { from: 10, to: 17, order: 1 }, { from: 10, to: 18, order: 1 }, { from: 10, to: 19, order: 1 },
    ],
  },
  // Vitamin C
  C6H8O6: {
    name: 'Vitamin C (Ascorbic Acid)',
    formula: 'C₆H₈O₆',
    atoms: [
      { symbol: 'C', position: [0, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.2, 0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.8, -0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [1.1, -1.5, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [-0.2, -1.2, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, -0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [-0.3, 0.9, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [1.8, 1.5, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [3, -0.9, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1.2, -1.8, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-2.5, -1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'H', position: [-1.6, 0.5, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.2, -2, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.3, 1.8, 0.6], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.4, -0.2, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1, -2.5, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-3, -0.8, 0.5], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 0, order: 1 }, { from: 4, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 }, { from: 1, to: 7, order: 1 }, { from: 2, to: 8, order: 2 },
      { from: 4, to: 9, order: 1 }, { from: 5, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 }, { from: 4, to: 12, order: 1 },
      { from: 7, to: 13, order: 1 }, { from: 8, to: 14, order: 1 },
      { from: 9, to: 15, order: 1 }, { from: 10, to: 16, order: 1 },
    ],
  },
  // Neurotransmitters
  C8H11NO2: {
    name: 'Dopamine',
    formula: 'C₈H₁₁NO₂',
    atoms: [
      // Benzene ring
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      // Hydroxyl groups
      { symbol: 'O', position: [1.25, 2.4, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1.25, 2.4, 0], color: atomColors.O, radius: 0.6 },
      // Ethylamine chain
      { symbol: 'C', position: [2.8, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [3.5, 1.2, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [4.9, 1.2, 0], color: atomColors.N, radius: 0.55 },
      // Hydrogens
      { symbol: 'H', position: [1.8, 2.7, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.8, 2.7, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.4, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3, -0.5, 0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3, -0.5, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.2, 1.7, 0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.2, 1.7, -0.9], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [5.3, 0.5, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [5.3, 2, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 1, to: 6, order: 1 }, { from: 2, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 }, { from: 8, to: 9, order: 1 }, { from: 9, to: 10, order: 1 },
      { from: 6, to: 11, order: 1 }, { from: 7, to: 12, order: 1 },
      { from: 3, to: 13, order: 1 }, { from: 4, to: 14, order: 1 }, { from: 5, to: 15, order: 1 },
      { from: 8, to: 16, order: 1 }, { from: 8, to: 17, order: 1 },
      { from: 9, to: 18, order: 1 }, { from: 9, to: 19, order: 1 },
      { from: 10, to: 20, order: 1 }, { from: 10, to: 21, order: 1 },
    ],
  },
  // Serotonin
  C10H12N2O: {
    name: 'Serotonin',
    formula: 'C₁₀H₁₂N₂O',
    atoms: [
      // Indole ring system
      { symbol: 'C', position: [0, 1.2, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.2, 0.6, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.2, -0.8, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, -1.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.2, -0.8, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.2, 0.6, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-2.3, 1.4, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-2, 2.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-0.6, 2.5, 0], color: atomColors.N, radius: 0.55 },
      // Hydroxyl group
      { symbol: 'O', position: [0, -2.7, 0], color: atomColors.O, radius: 0.6 },
      // Ethylamine chain
      { symbol: 'C', position: [-3.7, 1, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-4.4, 2.2, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-5.8, 2.2, 0], color: atomColors.N, radius: 0.55 },
      // Hydrogens
      { symbol: 'H', position: [2.1, 1.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.1, -1.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.1, -1.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.6, 3.5, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-0.1, 3.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.5, -3.2, 0.5], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
      { from: 8, to: 0, order: 1 },
      { from: 3, to: 9, order: 1 }, { from: 9, to: 18, order: 1 },
      { from: 6, to: 10, order: 1 }, { from: 10, to: 11, order: 1 }, { from: 11, to: 12, order: 1 },
      { from: 1, to: 13, order: 1 }, { from: 2, to: 14, order: 1 }, { from: 4, to: 15, order: 1 },
      { from: 7, to: 16, order: 1 }, { from: 8, to: 17, order: 1 },
    ],
  },
  // Adrenaline
  C9H13NO3: {
    name: 'Adrenaline (Epinephrine)',
    formula: 'C₉H₁₃NO₃',
    atoms: [
      // Benzene ring
      { symbol: 'C', position: [1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, 1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.4, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0.7, -1.21, 0], color: atomColors.C, radius: 0.5 },
      // Hydroxyl groups on ring
      { symbol: 'O', position: [1.25, 2.4, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [-1.25, 2.4, 0], color: atomColors.O, radius: 0.6 },
      // Side chain
      { symbol: 'C', position: [2.8, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [3.3, -1.2, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [3.5, 1.2, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [4.9, 1.2, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [5.6, 0, 0], color: atomColors.C, radius: 0.5 },
      // Hydrogens
      { symbol: 'H', position: [1.8, 2.7, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.8, 2.7, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.4, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.25, -2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [3.8, -1.6, 0.5], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [5.3, 2, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 1, to: 6, order: 1 }, { from: 2, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 }, { from: 8, to: 9, order: 1 }, { from: 8, to: 10, order: 1 },
      { from: 10, to: 11, order: 1 }, { from: 11, to: 12, order: 1 },
      { from: 6, to: 13, order: 1 }, { from: 7, to: 14, order: 1 },
      { from: 3, to: 15, order: 1 }, { from: 4, to: 16, order: 1 }, { from: 5, to: 17, order: 1 },
      { from: 9, to: 18, order: 1 }, { from: 11, to: 19, order: 1 },
    ],
  },
  // DNA Bases
  Adenine: {
    name: 'Adenine (DNA Base)',
    formula: 'C₅H₅N₅',
    atoms: [
      { symbol: 'N', position: [0, 1.3, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [1.1, 0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [1.3, -0.6, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [0.2, -1.3, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1, -0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1, 0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-2.2, 1.3, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [-2.8, 0, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [-2.2, -1.2, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'H', position: [2, 1.2, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.3, -2.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.5, 2.2, 0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.5, 2.2, -0.3], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-3.8, 0, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
      { from: 8, to: 4, order: 1 },
      { from: 1, to: 9, order: 1 }, { from: 3, to: 10, order: 1 },
      { from: 6, to: 11, order: 1 }, { from: 6, to: 12, order: 1 }, { from: 7, to: 13, order: 1 },
    ],
  },
  Thymine: {
    name: 'Thymine (DNA Base)',
    formula: 'C₅H₆N₂O₂',
    atoms: [
      { symbol: 'N', position: [0, 1.2, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [1.1, 0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [1.1, -0.9, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [0, -1.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.1, -0.8, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.1, 0.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'O', position: [2.1, 1, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [0, -2.7, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'C', position: [-2.4, -1.5, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'H', position: [0, 2.1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [1.9, -1.4, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2, 1, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.8, -2, 0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2.8, -2, -0.8], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-3.1, -0.8, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 1, to: 6, order: 2 }, { from: 3, to: 7, order: 2 },
      { from: 4, to: 8, order: 1 },
      { from: 0, to: 9, order: 1 }, { from: 2, to: 10, order: 1 }, { from: 5, to: 11, order: 1 },
      { from: 8, to: 12, order: 1 }, { from: 8, to: 13, order: 1 }, { from: 8, to: 14, order: 1 },
    ],
  },
  // Nicotine
  C10H14N2: {
    name: 'Nicotine',
    formula: 'C₁₀H₁₄N₂',
    atoms: [
      // Pyridine ring
      { symbol: 'N', position: [0, 1.3, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [1.1, 0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [1.1, -0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [0, -1.3, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.1, -0.7, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [-1.1, 0.7, 0], color: atomColors.C, radius: 0.5 },
      // Pyrrolidine ring
      { symbol: 'C', position: [2.4, -1.3, 0], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [3.3, -0.2, 0.5], color: atomColors.C, radius: 0.5 },
      { symbol: 'C', position: [3.3, -0.2, -0.5], color: atomColors.C, radius: 0.5 },
      { symbol: 'N', position: [2.4, 0.8, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'C', position: [2.8, 2, 0], color: atomColors.C, radius: 0.5 },
      // Hydrogens
      { symbol: 'H', position: [0, -2.3, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2, -1.2, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [-2, 1.2, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [2.5, -2.3, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
      { from: 2, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 7, to: 9, order: 1 },
      { from: 6, to: 8, order: 1 }, { from: 8, to: 9, order: 1 },
      { from: 9, to: 10, order: 1 },
      { from: 3, to: 11, order: 1 }, { from: 4, to: 12, order: 1 }, { from: 5, to: 13, order: 1 },
      { from: 6, to: 14, order: 1 },
    ],
  },
  // Simple molecules
  H2: {
    name: 'Hydrogen',
    formula: 'H₂',
    atoms: [
      { symbol: 'H', position: [-0.4, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'H', position: [0.4, 0, 0], color: atomColors.H, radius: 0.35 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  O2: {
    name: 'Oxygen',
    formula: 'O₂',
    atoms: [
      { symbol: 'O', position: [-0.6, 0, 0], color: atomColors.O, radius: 0.6 },
      { symbol: 'O', position: [0.6, 0, 0], color: atomColors.O, radius: 0.6 },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }],
  },
  N2: {
    name: 'Nitrogen',
    formula: 'N₂',
    atoms: [
      { symbol: 'N', position: [-0.55, 0, 0], color: atomColors.N, radius: 0.55 },
      { symbol: 'N', position: [0.55, 0, 0], color: atomColors.N, radius: 0.55 },
    ],
    bonds: [{ from: 0, to: 1, order: 3 }],
  },
};

export function MoleculeVisualization({ molecule, className = '' }: MoleculeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const data = moleculeData[molecule];
    if (data) {
      const moleculeGroup = new THREE.Group();

      data.atoms.forEach((atom) => {
        const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: atom.color,
          shininess: 100,
          specular: 0x444444,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...atom.position);
        moleculeGroup.add(sphere);
      });

      data.bonds.forEach((bond) => {
        const from = new THREE.Vector3(...data.atoms[bond.from].position);
        const to = new THREE.Vector3(...data.atoms[bond.to].position);
        const direction = new THREE.Vector3().subVectors(to, from);
        const length = direction.length();

        const bondOffset = bond.order === 1 ? 0 : 0.1;
        
        for (let i = 0; i < bond.order; i++) {
          const offset = (i - (bond.order - 1) / 2) * bondOffset * 2;
          const geometry = new THREE.CylinderGeometry(0.06, 0.06, length, 16);
          const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
          const cylinder = new THREE.Mesh(geometry, material);

          cylinder.position.copy(from).add(to).multiplyScalar(0.5);
          cylinder.position.x += offset * (Math.abs(direction.y) > 0.1 ? 1 : 0);
          cylinder.position.y += offset * (Math.abs(direction.x) > 0.1 ? 1 : 0);
          cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
          );

          moleculeGroup.add(cylinder);
        }
      });

      scene.add(moleculeGroup);

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        moleculeGroup.rotation.y += 0.008;
        moleculeGroup.rotation.x += 0.002;
        renderer.render(scene, camera);
      };
      animate();
    }

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [molecule]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
}

export const availableMolecules = Object.keys(moleculeData);
export const moleculeInfo = Object.fromEntries(
  Object.entries(moleculeData).map(([key, data]) => [key, { name: data.name, formula: data.formula }])
);
