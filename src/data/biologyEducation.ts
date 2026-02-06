import { ExperimentEducation } from './experimentEducation';

export const biologyEducation: Record<string, ExperimentEducation> = {
  diffusion: {
    id: 'diffusion',
    overview: `Diffusion and osmosis are fundamental processes that govern how molecules move in living organisms. Diffusion is the net movement of particles from an area of higher concentration to lower concentration, while osmosis specifically refers to the movement of water molecules across a semi-permeable membrane. These processes are essential for nutrient absorption, gas exchange, and maintaining cellular homeostasis.`,
    howItWorks: [
      'Molecules are in constant random motion due to kinetic energy.',
      'In areas of high concentration, more molecules move outward than inward.',
      'This creates a net movement from high to low concentration — diffusion.',
      'Semi-permeable membranes allow some molecules through but not others.',
      'Water moves across these membranes via osmosis, following solute concentration gradients.',
      'Cells use these processes to absorb nutrients, expel waste, and maintain water balance.'
    ],
    keyConcepts: [
      { title: 'Concentration Gradient', description: 'The difference in concentration of a substance between two areas, driving the direction of diffusion.' },
      { title: 'Semi-permeable Membrane', description: 'A barrier that allows certain molecules (like water) to pass while blocking others (like large proteins).' },
      { title: 'Osmosis', description: 'The diffusion of water molecules from a dilute solution to a concentrated solution through a semi-permeable membrane.' },
      { title: 'Tonicity', description: 'The relative concentration of solutes: hypertonic (more solute), hypotonic (less solute), isotonic (equal).' },
      { title: 'Active Transport', description: 'Movement of molecules against the concentration gradient, requiring cellular energy (ATP).' }
    ],
    applications: [
      { title: 'Plant Water Uptake', description: 'Roots absorb water from soil via osmosis, and nutrients move into cells by diffusion.' },
      { title: 'Kidney Function', description: 'The kidneys filter blood using osmosis and selective diffusion to remove waste and reabsorb nutrients.' },
      { title: 'Gas Exchange in Lungs', description: 'Oxygen diffuses from alveoli into blood, while CO₂ diffuses from blood into alveoli for exhalation.' },
      { title: 'Food Preservation', description: 'Salting and sugaring foods create hypertonic environments that draw water out of bacteria, preserving food.' }
    ],
    conclusion: `Diffusion and osmosis are the silent engines of life, enabling cells to obtain nutrients, remove waste, and maintain the delicate balance needed for survival. Understanding these processes is key to biology, medicine, and biotechnology.`,
    equations: [
      { name: "Fick's Law", formula: 'J = -D × (dC/dx)', description: 'Rate of diffusion proportional to concentration gradient' },
      { name: 'Osmotic Pressure', formula: 'π = iMRT', description: 'Pressure needed to prevent osmosis' },
      { name: 'Water Potential', formula: 'Ψ = Ψs + Ψp', description: 'Total water potential = solute potential + pressure potential' }
    ]
  }
};

export interface BiologyTutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: { title: string; content: string; }[];
  quiz?: { question: string; options: string[]; correctAnswer: number; explanation: string; }[];
}

export const biologyTutorials: BiologyTutorial[] = [
  {
    id: 'cell-structure',
    title: 'Cell Structure and Function',
    description: 'Explore the basic building blocks of life — cells and their organelles.',
    difficulty: 'beginner',
    duration: '10 min',
    steps: [
      { title: 'What is a Cell?', content: 'A cell is the smallest unit of life. All living organisms are made of one or more cells. Cells carry out essential life processes including obtaining energy, growing, and reproducing.' },
      { title: 'Plant vs Animal Cells', content: 'Both have a nucleus, cytoplasm, and cell membrane. Plant cells additionally have a cell wall, chloroplasts (for photosynthesis), and a large central vacuole.' },
      { title: 'Key Organelles', content: 'Nucleus: contains DNA. Mitochondria: powerhouse of the cell (produces ATP). Ribosomes: make proteins. Endoplasmic reticulum: transport network. Golgi apparatus: packages and ships proteins.' },
      { title: 'Cell Membrane', content: 'The cell membrane is a semi-permeable phospholipid bilayer that controls what enters and exits the cell. It uses diffusion, osmosis, and active transport to regulate molecular movement.' },
    ],
    quiz: [
      { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'], correctAnswer: 1, explanation: 'Mitochondria produce ATP through cellular respiration, earning the nickname "powerhouse of the cell."' },
      { question: 'Which organelle is found in plant cells but NOT animal cells?', options: ['Nucleus', 'Mitochondria', 'Chloroplast', 'Ribosome'], correctAnswer: 2, explanation: 'Chloroplasts are unique to plant cells and are responsible for photosynthesis.' },
      { question: 'What controls what enters and exits a cell?', options: ['Cell wall', 'Nucleus', 'Cell membrane', 'Cytoplasm'], correctAnswer: 2, explanation: 'The cell membrane is semi-permeable, selectively controlling molecular transport.' },
    ]
  },
  {
    id: 'ecosystems',
    title: 'Ecosystems and Food Chains',
    description: 'Understand how energy flows through ecosystems via producers, consumers, and decomposers.',
    difficulty: 'beginner',
    duration: '12 min',
    steps: [
      { title: 'What is an Ecosystem?', content: 'An ecosystem is a community of living organisms (biotic factors) interacting with their physical environment (abiotic factors like temperature, water, sunlight).' },
      { title: 'Producers', content: 'Plants and algae are producers — they make their own food through photosynthesis, converting sunlight into glucose. They form the base of every food chain.' },
      { title: 'Consumers and Decomposers', content: 'Primary consumers (herbivores) eat producers. Secondary consumers (carnivores) eat herbivores. Decomposers (fungi, bacteria) break down dead matter, recycling nutrients back into the soil.' },
      { title: 'Energy Transfer', content: 'Only about 10% of energy transfers between trophic levels. The rest is lost as heat through respiration. This is why there are fewer top predators than producers in any ecosystem.' },
    ],
    quiz: [
      { question: 'What percentage of energy typically transfers between trophic levels?', options: ['100%', '50%', '10%', '1%'], correctAnswer: 2, explanation: 'Only about 10% of energy is passed on; the rest is used in life processes or lost as heat.' },
      { question: 'Which organisms form the base of a food chain?', options: ['Decomposers', 'Consumers', 'Producers', 'Predators'], correctAnswer: 2, explanation: 'Producers (plants) convert sunlight to food energy, forming the foundation of food chains.' },
    ]
  },
  {
    id: 'diffusion-osmosis',
    title: 'Diffusion and Osmosis',
    description: 'Learn how molecules move across cell membranes through passive transport.',
    difficulty: 'intermediate',
    duration: '15 min',
    steps: [
      { title: 'What is Diffusion?', content: 'Diffusion is the movement of particles from high to low concentration. Think of perfume spreading through a room — molecules naturally spread out until evenly distributed.' },
      { title: 'Osmosis Explained', content: 'Osmosis is a special case of diffusion — it\'s the movement of WATER molecules across a semi-permeable membrane from dilute to concentrated solution.' },
      { title: 'Tonicity', content: 'Hypertonic: more solute outside (cell shrinks). Hypotonic: less solute outside (cell swells). Isotonic: equal solute (cell stays same). Plant cells in hypotonic solutions become turgid; animal cells may burst (lyse).' },
      { title: 'In Living Systems', content: 'Lungs use diffusion for gas exchange. Kidneys use osmosis to filter blood. Plant roots absorb water by osmosis. Intestines absorb nutrients by diffusion.' },
    ],
    quiz: [
      { question: 'What happens to an animal cell in a hypotonic solution?', options: ['It shrinks', 'It swells and may burst', 'Nothing happens', 'It becomes rigid'], correctAnswer: 1, explanation: 'In a hypotonic solution, water moves into the cell by osmosis, causing it to swell and potentially lyse (burst).' },
      { question: 'Osmosis is the movement of what?', options: ['Solute molecules', 'Water molecules', 'Oxygen', 'Proteins'], correctAnswer: 1, explanation: 'Osmosis specifically refers to the movement of water molecules across a semi-permeable membrane.' },
    ]
  }
];
