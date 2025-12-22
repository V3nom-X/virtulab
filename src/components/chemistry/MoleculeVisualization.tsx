import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Search, RotateCcw, ZoomIn, ZoomOut, Move, Info, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Atomic weights for molecular weight calculation
const atomicWeights: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, S: 32.065, P: 30.974,
  Cl: 35.453, Na: 22.990, F: 18.998, Br: 79.904, I: 126.90
};

// Helper functions for molecule properties
const calculateMolecularWeight = (atoms: Atom[]): number => {
  return atoms.reduce((sum, atom) => sum + (atomicWeights[atom.symbol] || 0), 0);
};

const countAtomsByElement = (atoms: Atom[]): Record<string, number> => {
  return atoms.reduce((acc, atom) => {
    acc[atom.symbol] = (acc[atom.symbol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const countBondsByOrder = (bonds: Bond[]): { single: number; double: number; triple: number } => {
  return bonds.reduce((acc, bond) => {
    if (bond.order === 1) acc.single++;
    else if (bond.order === 2) acc.double++;
    else if (bond.order === 3) acc.triple++;
    return acc;
  }, { single: 0, double: 0, triple: 0 });
};
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
  category?: string;
}

interface MoleculeVisualizationProps {
  molecule: string;
  className?: string;
  showControls?: boolean;
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
    category: 'Basic',
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
    category: 'Basic',
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
    category: 'Basic',
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
    category: 'Acid',
    atoms: [
      { symbol: 'H', position: [-0.65, 0, 0], color: atomColors.H, radius: 0.35 },
      { symbol: 'Cl', position: [0.65, 0, 0], color: atomColors.Cl, radius: 0.8 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
  },
  NaCl: {
    name: 'Sodium Chloride',
    formula: 'NaCl',
    category: 'Basic',
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
    category: 'Hydrocarbon',
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
    category: 'Hydrocarbon',
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

// Auto-assign categories to molecules that don't have one
const categoryAssignments: Record<string, string> = {
  // Hydrocarbons
  C3H8: 'Hydrocarbon', C4H10: 'Hydrocarbon', C2H4: 'Hydrocarbon', C3H6: 'Hydrocarbon',
  C2H2: 'Hydrocarbon', C6H6: 'Aromatic', C7H8: 'Aromatic',
  // Alcohols
  CH3OH: 'Alcohol', C2H5OH: 'Alcohol',
  // Aldehydes & Ketones
  CH2O: 'Aldehyde', C3H6O: 'Ketone',
  // Acids
  CH3COOH: 'Acid', H2SO4: 'Acid', HNO3: 'Acid',
  // Sugars
  C6H12O6: 'Sugar', C12H22O11: 'Sugar',
  // Amino Acids
  C2H5NO2: 'Amino Acid', C3H7NO2: 'Amino Acid', C5H11NO2: 'Amino Acid',
  C6H13NO2: 'Amino Acid', C9H11NO2: 'Amino Acid', C3H7NO3: 'Amino Acid',
  C4H9NO3: 'Amino Acid', C3H7NO2S: 'Amino Acid', C5H11NO2S: 'Amino Acid',
  C4H7NO4: 'Amino Acid', C5H9NO4: 'Amino Acid', C6H14N2O2: 'Amino Acid',
  C6H14N4O2: 'Amino Acid', C6H9N3O2: 'Amino Acid', C11H12N2O2: 'Amino Acid',
  C5H9NO2: 'Amino Acid', C9H11NO3: 'Amino Acid', C4H8N2O3: 'Amino Acid',
  C5H10N2O3: 'Amino Acid',
  // DNA Bases
  Adenine: 'DNA Base', Thymine: 'DNA Base',
  // Pharmaceuticals  
  C8H10N4O2: 'Pharmaceutical', C9H8O4: 'Pharmaceutical', C8H9NO2: 'Pharmaceutical',
  // Vitamins
  C6H8O6: 'Vitamin',
  // Neurotransmitters
  C8H11NO2: 'Neurotransmitter', C10H12N2O: 'Neurotransmitter', C9H13NO3: 'Neurotransmitter',
  // Other organics
  CH4N2O: 'Organic', C5H4N4O3: 'Organic', C3H6O3: 'Organic', C6H8O7: 'Organic',
  C2H2O4: 'Organic', C4H6O6: 'Organic', C4H6O5: 'Organic', C4H6O4: 'Organic', C4H4O4: 'Organic',
  C2H7NO: 'Organic', C5H14NO: 'Organic', C4H9NO2: 'Organic', C5H9N3: 'Organic',
  // Gases
  O2: 'Gas', N2: 'Gas',
};

Object.entries(moleculeData).forEach(([key, mol]) => {
  if (!mol.category) {
    mol.category = categoryAssignments[key] || 'Other';
  }
});

export function MoleculeVisualization({ molecule, className = '', showControls = false }: MoleculeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number>(0);
  const isAutoRotating = useRef(true);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const data = moleculeData[molecule];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 8;
    cameraRef.current = camera;

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

    if (data) {
      const moleculeGroup = new THREE.Group();
      moleculeGroupRef.current = moleculeGroup;

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
        if (isAutoRotating.current && !isDragging.current) {
          moleculeGroup.rotation.y += 0.008;
          moleculeGroup.rotation.x += 0.002;
        }
        renderer.render(scene, camera);
      };
      animate();
    }

    // Mouse controls for rotate/pan
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      isAutoRotating.current = false;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !moleculeGroupRef.current) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.current.x,
        y: e.clientY - previousMousePosition.current.y
      };

      if (e.shiftKey) {
        // Pan when shift is held
        moleculeGroupRef.current.position.x += deltaMove.x * 0.01;
        moleculeGroupRef.current.position.y -= deltaMove.y * 0.01;
      } else {
        // Rotate normally
        moleculeGroupRef.current.rotation.y += deltaMove.x * 0.01;
        moleculeGroupRef.current.rotation.x += deltaMove.y * 0.01;
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    // Zoom with wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cameraRef.current) {
        cameraRef.current.position.z += e.deltaY * 0.01;
        cameraRef.current.position.z = Math.max(3, Math.min(20, cameraRef.current.position.z));
      }
    };

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        isAutoRotating.current = false;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !moleculeGroupRef.current || e.touches.length !== 1) return;
      
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.current.x,
        y: e.touches[0].clientY - previousMousePosition.current.y
      };

      moleculeGroupRef.current.rotation.y += deltaMove.x * 0.01;
      moleculeGroupRef.current.rotation.x += deltaMove.y * 0.01;

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    container.addEventListener('touchend', onTouchEnd);

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
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [molecule, data]);

  const handleReset = () => {
    if (moleculeGroupRef.current && cameraRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
      moleculeGroupRef.current.position.set(0, 0, 0);
      cameraRef.current.position.z = 8;
      isAutoRotating.current = true;
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 1);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(20, cameraRef.current.position.z + 1);
    }
  };

  const [showProperties, setShowProperties] = useState(false);
  
  const molecularWeight = data ? calculateMolecularWeight(data.atoms) : 0;
  const atomCounts = data ? countAtomsByElement(data.atoms) : {};
  const bondCounts = data ? countBondsByOrder(data.bonds) : { single: 0, double: 0, triple: 0 };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Molecule name and formula overlay */}
      {data && (
        <div className="absolute top-2 left-2 right-2 z-10 text-center pointer-events-none">
          <h3 className="text-lg font-bold text-foreground drop-shadow-lg">{data.name}</h3>
          <p className="text-sm text-muted-foreground drop-shadow-md">{data.formula}</p>
        </div>
      )}
      
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Properties Panel */}
      {showProperties && data && (
        <div className="absolute top-14 right-2 z-10 w-48 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Molecular Weight</p>
              <p className="text-sm font-semibold">{molecularWeight.toFixed(2)} g/mol</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <Badge variant="secondary" className="text-xs mt-0.5">{data.category || 'Unknown'}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Atoms ({data.atoms.length} total)</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {Object.entries(atomCounts).map(([element, count]) => (
                  <Badge key={element} variant="outline" className="text-xs">
                    {element}: {count}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bonds ({data.bonds.length} total)</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {bondCounts.single > 0 && <Badge variant="outline" className="text-xs">Single: {bondCounts.single}</Badge>}
                {bondCounts.double > 0 && <Badge variant="outline" className="text-xs">Double: {bondCounts.double}</Badge>}
                {bondCounts.triple > 0 && <Badge variant="outline" className="text-xs">Triple: {bondCounts.triple}</Badge>}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Control buttons */}
      {showControls && (
        <div className="absolute bottom-2 right-2 z-10 flex gap-1">
          <Button 
            variant={showProperties ? 'default' : 'secondary'} 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setShowProperties(!showProperties)} 
            title="Properties"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Control hints */}
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground opacity-70">
        <p>Drag: Rotate • Scroll: Zoom • Shift+Drag: Pan</p>
      </div>
    </div>
  );
}

// Molecule Search & Filter Component
interface MoleculeSearchProps {
  onSelect: (moleculeKey: string) => void;
  selectedMolecule?: string;
}

export function MoleculeSearch({ onSelect, selectedMolecule }: MoleculeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(moleculeData).forEach(mol => {
      if (mol.category) cats.add(mol.category);
    });
    return Array.from(cats).sort();
  }, []);

  const filteredMolecules = useMemo(() => {
    return Object.entries(moleculeData).filter(([key, mol]) => {
      const matchesSearch = searchQuery === '' || 
        (mol.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (mol.formula?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        key.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || mol.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or formula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>
      
      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filteredMolecules.length} molecule{filteredMolecules.length !== 1 ? 's' : ''} found
      </p>
      
      {/* Molecule list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 pr-3">
          {filteredMolecules.map(([key, mol]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedMolecule === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <p className="font-medium text-sm">{mol.name || key}</p>
              <p className={`text-xs ${selectedMolecule === key ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {mol.formula || key}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export const availableMolecules = Object.keys(moleculeData);
export const moleculeInfo = Object.fromEntries(
  Object.entries(moleculeData).map(([key, data]) => [key, { name: data.name, formula: data.formula, category: data.category }])
);

// Molecule Comparison Component
interface MoleculeComparisonProps {
  className?: string;
}

export function MoleculeComparison({ className = '' }: MoleculeComparisonProps) {
  const [molecule1, setMolecule1] = useState<string>('H2O');
  const [molecule2, setMolecule2] = useState<string>('CH4');

  const data1 = moleculeData[molecule1];
  const data2 = moleculeData[molecule2];

  const mw1 = data1 ? calculateMolecularWeight(data1.atoms) : 0;
  const mw2 = data2 ? calculateMolecularWeight(data2.atoms) : 0;
  const atoms1 = data1 ? countAtomsByElement(data1.atoms) : {};
  const atoms2 = data2 ? countAtomsByElement(data2.atoms) : {};
  const bonds1 = data1 ? countBondsByOrder(data1.bonds) : { single: 0, double: 0, triple: 0 };
  const bonds2 = data2 ? countBondsByOrder(data2.bonds) : { single: 0, double: 0, triple: 0 };

  const molecules = Object.entries(moleculeData).map(([key, mol]) => ({
    key,
    name: mol.name || key,
    formula: mol.formula || key
  }));

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Side by side viewers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Molecule 1 */}
        <div className="flex flex-col gap-2">
          <Select value={molecule1} onValueChange={setMolecule1}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select molecule" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-64">
                {molecules.map(mol => (
                  <SelectItem key={mol.key} value={mol.key}>
                    {mol.name} ({mol.formula})
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <div className="h-64 bg-muted/30 rounded-lg border border-border overflow-hidden">
            <MoleculeVisualization molecule={molecule1} showControls />
          </div>
        </div>

        {/* Molecule 2 */}
        <div className="flex flex-col gap-2">
          <Select value={molecule2} onValueChange={setMolecule2}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select molecule" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-64">
                {molecules.map(mol => (
                  <SelectItem key={mol.key} value={mol.key}>
                    {mol.name} ({mol.formula})
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <div className="h-64 bg-muted/30 rounded-lg border border-border overflow-hidden">
            <MoleculeVisualization molecule={molecule2} showControls />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Property Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-muted-foreground">Property</th>
                  <th className="text-center py-2 font-medium">{data1?.name || molecule1}</th>
                  <th className="text-center py-2 font-medium">{data2?.name || molecule2}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Formula</td>
                  <td className="py-2 text-center">{data1?.formula}</td>
                  <td className="py-2 text-center">{data2?.formula}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Molecular Weight</td>
                  <td className="py-2 text-center">{mw1.toFixed(2)} g/mol</td>
                  <td className="py-2 text-center">{mw2.toFixed(2)} g/mol</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Total Atoms</td>
                  <td className="py-2 text-center">{data1?.atoms.length || 0}</td>
                  <td className="py-2 text-center">{data2?.atoms.length || 0}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Total Bonds</td>
                  <td className="py-2 text-center">{data1?.bonds.length || 0}</td>
                  <td className="py-2 text-center">{data2?.bonds.length || 0}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Category</td>
                  <td className="py-2 text-center">
                    <Badge variant="secondary" className="text-xs">{data1?.category || 'Unknown'}</Badge>
                  </td>
                  <td className="py-2 text-center">
                    <Badge variant="secondary" className="text-xs">{data2?.category || 'Unknown'}</Badge>
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">Atom Composition</td>
                  <td className="py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {Object.entries(atoms1).map(([el, count]) => (
                        <Badge key={el} variant="outline" className="text-xs">{el}:{count}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {Object.entries(atoms2).map(([el, count]) => (
                        <Badge key={el} variant="outline" className="text-xs">{el}:{count}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Bond Types</td>
                  <td className="py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {bonds1.single > 0 && <Badge variant="outline" className="text-xs">S:{bonds1.single}</Badge>}
                      {bonds1.double > 0 && <Badge variant="outline" className="text-xs">D:{bonds1.double}</Badge>}
                      {bonds1.triple > 0 && <Badge variant="outline" className="text-xs">T:{bonds1.triple}</Badge>}
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {bonds2.single > 0 && <Badge variant="outline" className="text-xs">S:{bonds2.single}</Badge>}
                      {bonds2.double > 0 && <Badge variant="outline" className="text-xs">D:{bonds2.double}</Badge>}
                      {bonds2.triple > 0 && <Badge variant="outline" className="text-xs">T:{bonds2.triple}</Badge>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
