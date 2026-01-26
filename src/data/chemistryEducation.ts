// Chemistry Lab Educational Content - Safety Guidelines and Interactive Tutorials

export interface SafetyGuideline {
  id: string;
  title: string;
  icon: string;
  description: string;
  tips: string[];
  severity: 'critical' | 'important' | 'recommended';
}

export interface ChemistryTutorial {
  id: string;
  title: string;
  description: string;
  steps: {
    instruction: string;
    hint?: string;
    elements?: string[];
  }[];
  expectedReaction?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
}

export interface ChemistryFact {
  id: string;
  title: string;
  fact: string;
  category: 'element' | 'reaction' | 'history' | 'application';
}

export const labSafetyGuidelines: SafetyGuideline[] = [
  {
    id: 'ppe',
    title: 'Personal Protective Equipment',
    icon: '🥽',
    description: 'Always wear appropriate protective gear when handling chemicals.',
    tips: [
      'Safety goggles protect your eyes from splashes and fumes',
      'Lab coats shield your skin and clothing from spills',
      'Gloves prevent direct contact with hazardous substances',
      'Closed-toe shoes protect your feet from broken glass and spills'
    ],
    severity: 'critical'
  },
  {
    id: 'ventilation',
    title: 'Proper Ventilation',
    icon: '💨',
    description: 'Work in well-ventilated areas or use fume hoods for volatile chemicals.',
    tips: [
      'Fume hoods capture and remove harmful vapors',
      'Never smell chemicals directly - waft gently toward your nose',
      'Keep containers closed when not in use',
      'Ensure air circulation in the work area'
    ],
    severity: 'critical'
  },
  {
    id: 'disposal',
    title: 'Chemical Disposal',
    icon: '🗑️',
    description: 'Never pour chemicals down the drain without proper authorization.',
    tips: [
      'Use designated waste containers for different chemical types',
      'Neutralize acids and bases before disposal when appropriate',
      'Label all waste containers clearly',
      'Follow local regulations for hazardous waste disposal'
    ],
    severity: 'critical'
  },
  {
    id: 'mixing',
    title: 'Safe Mixing Practices',
    icon: '⚗️',
    description: 'Add chemicals in the correct order to prevent dangerous reactions.',
    tips: [
      'Always add acid to water, never water to acid (AAA: Always Add Acid)',
      'Add chemicals slowly while stirring',
      'Be aware of exothermic reactions that release heat',
      'Never mix unknown chemicals together'
    ],
    severity: 'important'
  },
  {
    id: 'storage',
    title: 'Chemical Storage',
    icon: '📦',
    description: 'Store chemicals properly to prevent accidents and degradation.',
    tips: [
      'Keep incompatible chemicals separate',
      'Store flammables away from heat sources',
      'Label all containers clearly with contents and date',
      'Check for expiration dates and signs of degradation'
    ],
    severity: 'important'
  },
  {
    id: 'emergency',
    title: 'Emergency Procedures',
    icon: '🚨',
    description: 'Know what to do in case of spills, fires, or exposure.',
    tips: [
      'Know the location of safety showers and eyewash stations',
      'Keep fire extinguishers accessible and know how to use them',
      'Have a first aid kit nearby',
      'Report all accidents and near-misses immediately'
    ],
    severity: 'critical'
  },
  {
    id: 'handling',
    title: 'Proper Handling',
    icon: '🧪',
    description: 'Handle all chemicals with care and respect.',
    tips: [
      'Read Safety Data Sheets (SDS) before working with any chemical',
      'Use appropriate tools for transferring chemicals',
      'Never pipette by mouth',
      'Keep work areas clean and organized'
    ],
    severity: 'important'
  },
  {
    id: 'food',
    title: 'No Food or Drink',
    icon: '🚫',
    description: 'Never eat, drink, or store food in the laboratory.',
    tips: [
      'Chemical contamination can occur unknowingly',
      'Wash hands thoroughly before eating',
      'Keep personal items outside the lab area',
      'Use designated break areas for meals'
    ],
    severity: 'recommended'
  }
];

export const chemistryTutorials: ChemistryTutorial[] = [
  {
    id: 'water-formation',
    title: 'Making Water',
    description: 'Learn how hydrogen and oxygen combine to form water - one of the most important reactions in chemistry.',
    steps: [
      {
        instruction: 'Drag two Hydrogen atoms to the workspace',
        hint: 'Find H in the element palette',
        elements: ['H', 'H']
      },
      {
        instruction: 'Add one Oxygen atom',
        hint: 'Oxygen is represented by O',
        elements: ['O']
      },
      {
        instruction: 'Click the "React" button to combine the elements',
        hint: 'This is an exothermic reaction that releases energy'
      }
    ],
    expectedReaction: '2H₂ + O₂ → 2H₂O',
    difficulty: 'beginner',
    duration: 5
  },
  {
    id: 'salt-synthesis',
    title: 'Making Table Salt',
    description: 'Combine sodium and chlorine to create sodium chloride - common table salt.',
    steps: [
      {
        instruction: 'Add a Sodium (Na) atom to the workspace',
        hint: 'Sodium is a highly reactive alkali metal',
        elements: ['Na']
      },
      {
        instruction: 'Add a Chlorine (Cl) atom',
        hint: 'Chlorine is a halogen element',
        elements: ['Cl']
      },
      {
        instruction: 'Trigger the reaction',
        hint: 'This synthesis reaction creates an ionic compound'
      }
    ],
    expectedReaction: '2Na + Cl₂ → 2NaCl',
    difficulty: 'beginner',
    duration: 5
  },
  {
    id: 'rust-formation',
    title: 'Understanding Rust',
    description: 'See how iron reacts with oxygen to form iron oxide (rust).',
    steps: [
      {
        instruction: 'Add Iron (Fe) to the workspace',
        hint: 'Iron is a transition metal',
        elements: ['Fe']
      },
      {
        instruction: 'Add two Oxygen atoms',
        hint: 'Oxygen in air causes this slow reaction',
        elements: ['O', 'O']
      },
      {
        instruction: 'Click React to see oxidation in action',
        hint: 'This is why iron objects corrode over time'
      }
    ],
    expectedReaction: '4Fe + 3O₂ → 2Fe₂O₃',
    difficulty: 'beginner',
    duration: 5
  },
  {
    id: 'combustion-methane',
    title: 'Methane Combustion',
    description: 'Explore how natural gas burns by combining methane components with oxygen.',
    steps: [
      {
        instruction: 'Add Carbon (C) atom',
        elements: ['C']
      },
      {
        instruction: 'Add four Hydrogen atoms',
        hint: 'CH₄ represents methane',
        elements: ['H', 'H', 'H', 'H']
      },
      {
        instruction: 'Add two Oxygen atoms',
        hint: 'Combustion requires oxygen',
        elements: ['O', 'O']
      },
      {
        instruction: 'Trigger the combustion reaction',
        hint: 'Watch for CO₂ and H₂O products!'
      }
    ],
    expectedReaction: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    difficulty: 'intermediate',
    duration: 8
  },
  {
    id: 'acid-base',
    title: 'Acid-Base Neutralization',
    description: 'Learn how acids and bases neutralize each other.',
    steps: [
      {
        instruction: 'Create a simple base by adding Na, O, and H',
        hint: 'This represents sodium hydroxide (NaOH)',
        elements: ['Na', 'O', 'H']
      },
      {
        instruction: 'Add H and Cl for hydrochloric acid',
        hint: 'HCl is a strong acid',
        elements: ['H', 'Cl']
      },
      {
        instruction: 'Trigger the neutralization reaction',
        hint: 'Salt and water are produced'
      }
    ],
    expectedReaction: 'NaOH + HCl → NaCl + H₂O',
    difficulty: 'intermediate',
    duration: 8
  },
  {
    id: 'thermite',
    title: 'Thermite Reaction',
    description: 'Explore the highly exothermic thermite reaction (educational simulation only!).',
    steps: [
      {
        instruction: 'Add Iron oxide components: Fe, Fe, O, O, O',
        hint: 'This represents Fe₂O₃',
        elements: ['Fe', 'Fe', 'O', 'O', 'O']
      },
      {
        instruction: 'Add Aluminum: Al, Al',
        hint: 'Aluminum is more reactive than iron',
        elements: ['Al', 'Al']
      },
      {
        instruction: 'Set temperature above 1500°C and react',
        hint: 'This reaction produces molten iron!'
      }
    ],
    expectedReaction: 'Fe₂O₃ + 2Al → 2Fe + Al₂O₃',
    difficulty: 'advanced',
    duration: 10
  }
];

export const chemistryFacts: ChemistryFact[] = [
  {
    id: 'water-molecule',
    title: 'The Universal Solvent',
    fact: 'Water is called the "universal solvent" because it can dissolve more substances than any other liquid. This is due to its polar molecular structure.',
    category: 'application'
  },
  {
    id: 'periodic-table',
    title: 'Mendeleev\'s Dream',
    fact: 'Dmitri Mendeleev reportedly dreamed the periodic table arrangement. He was so confident in his organization that he left gaps for elements that hadn\'t been discovered yet.',
    category: 'history'
  },
  {
    id: 'gold-rare',
    title: 'Rare Gold',
    fact: 'All the gold ever mined would fit into a cube measuring only 21 meters on each side. That\'s about 190,000 tonnes!',
    category: 'element'
  },
  {
    id: 'hydrogen-abundant',
    title: 'Most Abundant Element',
    fact: 'Hydrogen makes up about 75% of all normal matter in the universe by mass. It\'s the fuel that powers stars, including our Sun.',
    category: 'element'
  },
  {
    id: 'acid-rain',
    title: 'Natural Acid Rain',
    fact: 'Even clean rain is slightly acidic (pH ~5.6) due to dissolved carbon dioxide forming carbonic acid. This has been occurring naturally for billions of years.',
    category: 'reaction'
  },
  {
    id: 'silicon-chips',
    title: 'Silicon Valley',
    fact: 'Silicon, the second most abundant element in Earth\'s crust, is used in computer chips because it\'s a semiconductor—it can be made to conduct or insulate electricity.',
    category: 'application'
  },
  {
    id: 'noble-gases',
    title: 'The Noble Loners',
    fact: 'Noble gases were called "noble" because they were thought not to react with "common" elements. However, some compounds of noble gases have since been synthesized.',
    category: 'element'
  },
  {
    id: 'fireworks',
    title: 'Colorful Chemistry',
    fact: 'Firework colors come from metal salts: strontium (red), barium (green), copper (blue), and sodium (yellow). The electrons absorb energy and release it as specific colors.',
    category: 'reaction'
  }
];

// Get a random chemistry fact
export function getRandomFact(): ChemistryFact {
  return chemistryFacts[Math.floor(Math.random() * chemistryFacts.length)];
}

// Get tutorials by difficulty
export function getTutorialsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ChemistryTutorial[] {
  return chemistryTutorials.filter(t => t.difficulty === difficulty);
}

// Get critical safety guidelines
export function getCriticalSafetyGuidelines(): SafetyGuideline[] {
  return labSafetyGuidelines.filter(g => g.severity === 'critical');
}
