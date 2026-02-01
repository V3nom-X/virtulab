import { QuizQuestion } from "@/components/quiz/QuizSystem";

export interface TutorialQuiz {
  tutorialId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export const chemistryQuizzes: TutorialQuiz[] = [
  {
    tutorialId: "water-formation",
    title: "Water Formation Quiz",
    passingScore: 70,
    questions: [
      {
        id: "wf-1",
        question: "What is the chemical formula for water?",
        options: ["H₂O", "CO₂", "NaCl", "O₂"],
        correctAnswer: 0,
        explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom, written as H₂O."
      },
      {
        id: "wf-2",
        question: "How many hydrogen atoms are needed to form one water molecule?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Each water molecule requires 2 hydrogen atoms bonded to 1 oxygen atom."
      },
      {
        id: "wf-3",
        question: "Is the formation of water an exothermic or endothermic reaction?",
        options: ["Exothermic (releases heat)", "Endothermic (absorbs heat)", "Neither", "Both"],
        correctAnswer: 0,
        explanation: "The formation of water is highly exothermic, releasing significant energy as heat and light."
      },
      {
        id: "wf-4",
        question: "What type of bond holds hydrogen and oxygen together in water?",
        options: ["Ionic bond", "Covalent bond", "Metallic bond", "Van der Waals force"],
        correctAnswer: 1,
        explanation: "Hydrogen and oxygen share electrons in covalent bonds to form water molecules."
      }
    ]
  },
  {
    tutorialId: "salt-synthesis",
    title: "Salt Synthesis Quiz",
    passingScore: 70,
    questions: [
      {
        id: "ss-1",
        question: "What elements combine to form table salt (sodium chloride)?",
        options: ["Sodium and Chlorine", "Sodium and Oxygen", "Potassium and Chlorine", "Calcium and Carbon"],
        correctAnswer: 0,
        explanation: "Table salt (NaCl) is formed when sodium (Na) reacts with chlorine (Cl)."
      },
      {
        id: "ss-2",
        question: "What type of bond is found in sodium chloride?",
        options: ["Covalent bond", "Ionic bond", "Hydrogen bond", "Metallic bond"],
        correctAnswer: 1,
        explanation: "Sodium chloride has ionic bonds where sodium donates an electron to chlorine."
      },
      {
        id: "ss-3",
        question: "Sodium is classified as what type of element?",
        options: ["Noble gas", "Halogen", "Alkali metal", "Transition metal"],
        correctAnswer: 2,
        explanation: "Sodium belongs to the alkali metal group in the periodic table."
      },
      {
        id: "ss-4",
        question: "What is the characteristic property of the salt synthesis reaction?",
        options: ["It absorbs light", "It produces heat and light", "It requires freezing", "Nothing observable happens"],
        correctAnswer: 1,
        explanation: "The reaction between sodium and chlorine is highly exothermic, producing intense heat and light."
      }
    ]
  },
  {
    tutorialId: "rust-formation",
    title: "Rust Formation Quiz",
    passingScore: 70,
    questions: [
      {
        id: "rf-1",
        question: "What is the chemical name for rust?",
        options: ["Iron sulfide", "Iron oxide", "Iron chloride", "Iron carbonate"],
        correctAnswer: 1,
        explanation: "Rust is iron oxide (Fe₂O₃), formed when iron reacts with oxygen."
      },
      {
        id: "rf-2",
        question: "What type of reaction produces rust?",
        options: ["Reduction", "Oxidation", "Neutralization", "Combustion"],
        correctAnswer: 1,
        explanation: "Rusting is an oxidation reaction where iron combines with oxygen from the air."
      },
      {
        id: "rf-3",
        question: "Which condition accelerates rust formation?",
        options: ["Dry environment", "Cold temperature", "Presence of moisture", "Vacuum"],
        correctAnswer: 2,
        explanation: "Moisture (water) accelerates the oxidation process, causing iron to rust faster."
      },
      {
        id: "rf-4",
        question: "What color is typical rust?",
        options: ["Blue-green", "Reddish-brown", "Silver", "Black"],
        correctAnswer: 1,
        explanation: "Iron oxide (rust) has a characteristic reddish-brown color."
      }
    ]
  },
  {
    tutorialId: "combustion-methane",
    title: "Methane Combustion Quiz",
    passingScore: 70,
    questions: [
      {
        id: "mc-1",
        question: "What is the chemical formula for methane?",
        options: ["CO₂", "CH₄", "C₂H₆", "NH₃"],
        correctAnswer: 1,
        explanation: "Methane consists of one carbon atom bonded to four hydrogen atoms (CH₄)."
      },
      {
        id: "mc-2",
        question: "What are the products of complete methane combustion?",
        options: ["Carbon monoxide and water", "Carbon dioxide and water", "Carbon and hydrogen", "Oxygen and nitrogen"],
        correctAnswer: 1,
        explanation: "Complete combustion of methane produces carbon dioxide (CO₂) and water (H₂O)."
      },
      {
        id: "mc-3",
        question: "What is required for combustion to occur?",
        options: ["Oxygen", "Nitrogen", "Helium", "Argon"],
        correctAnswer: 0,
        explanation: "Combustion requires oxygen to react with the fuel (methane)."
      },
      {
        id: "mc-4",
        question: "Methane is the primary component of what fuel?",
        options: ["Gasoline", "Natural gas", "Diesel", "Coal"],
        correctAnswer: 1,
        explanation: "Natural gas is primarily composed of methane."
      }
    ]
  },
  {
    tutorialId: "acid-base",
    title: "Acid-Base Neutralization Quiz",
    passingScore: 70,
    questions: [
      {
        id: "ab-1",
        question: "What products are formed when an acid reacts with a base?",
        options: ["Oxygen and hydrogen", "Salt and water", "Carbon dioxide and water", "Metal and gas"],
        correctAnswer: 1,
        explanation: "Acid-base neutralization produces a salt and water."
      },
      {
        id: "ab-2",
        question: "What is the chemical formula for sodium hydroxide?",
        options: ["NaCl", "NaOH", "HCl", "H₂SO₄"],
        correctAnswer: 1,
        explanation: "Sodium hydroxide is NaOH, a common strong base."
      },
      {
        id: "ab-3",
        question: "What type of compound is HCl?",
        options: ["Base", "Salt", "Acid", "Oxide"],
        correctAnswer: 2,
        explanation: "Hydrochloric acid (HCl) is a strong acid."
      },
      {
        id: "ab-4",
        question: "What happens to pH during neutralization?",
        options: ["Increases dramatically", "Decreases dramatically", "Moves toward 7 (neutral)", "Stays the same"],
        correctAnswer: 2,
        explanation: "During neutralization, the pH moves toward 7 as the acid and base cancel each other out."
      }
    ]
  },
  {
    tutorialId: "thermite",
    title: "Thermite Reaction Quiz",
    passingScore: 70,
    questions: [
      {
        id: "th-1",
        question: "What are the reactants in the thermite reaction?",
        options: ["Iron and oxygen", "Aluminum and iron oxide", "Sodium and chlorine", "Carbon and oxygen"],
        correctAnswer: 1,
        explanation: "The thermite reaction involves aluminum reacting with iron oxide."
      },
      {
        id: "th-2",
        question: "Why is the thermite reaction so hot?",
        options: ["It absorbs ambient heat", "Aluminum is highly reactive with iron oxide", "It uses radioactive materials", "It's cooled by water"],
        correctAnswer: 1,
        explanation: "Aluminum has a stronger affinity for oxygen than iron, causing a highly exothermic displacement reaction."
      },
      {
        id: "th-3",
        question: "What is produced by the thermite reaction?",
        options: ["Iron and aluminum oxide", "Rust and aluminum", "Water and carbon dioxide", "Salt and water"],
        correctAnswer: 0,
        explanation: "Thermite produces molten iron and aluminum oxide (Al₂O₃)."
      },
      {
        id: "th-4",
        question: "What is a practical application of the thermite reaction?",
        options: ["Cooking", "Welding railroad tracks", "Cleaning", "Refrigeration"],
        correctAnswer: 1,
        explanation: "Thermite welding is used to join railroad tracks due to the molten iron produced."
      }
    ]
  }
];

// Lab safety quiz
export const safetyQuiz: TutorialQuiz = {
  tutorialId: "lab-safety",
  title: "Lab Safety Quiz",
  passingScore: 80,
  questions: [
    {
      id: "ls-1",
      question: "What should you always wear when handling chemicals?",
      options: ["Sunglasses", "Safety goggles, lab coat, and gloves", "Just gloves", "Nothing special"],
      correctAnswer: 1,
      explanation: "Personal Protective Equipment (PPE) including goggles, lab coat, and gloves protects against splashes and spills."
    },
    {
      id: "ls-2",
      question: "When adding acid to water, which is correct?",
      options: ["Add water to acid quickly", "Add acid to water slowly", "Mix them simultaneously", "Temperature doesn't matter"],
      correctAnswer: 1,
      explanation: "Always Add Acid to water (AAA rule) slowly to prevent violent exothermic reactions."
    },
    {
      id: "ls-3",
      question: "What should you do if a chemical spills on your skin?",
      options: ["Ignore it", "Rinse with water immediately", "Apply heat", "Wait for it to dry"],
      correctAnswer: 1,
      explanation: "Immediately rinse with plenty of water to dilute and remove the chemical."
    },
    {
      id: "ls-4",
      question: "Why shouldn't you eat or drink in a laboratory?",
      options: ["It's distracting", "Risk of chemical contamination", "Food attracts pests", "It's just a rule"],
      correctAnswer: 1,
      explanation: "Food and drinks can become contaminated with chemicals, leading to accidental ingestion."
    },
    {
      id: "ls-5",
      question: "What is a fume hood used for?",
      options: ["Storage of chemicals", "Removing harmful vapors from the work area", "Heating reactions", "Mixing chemicals faster"],
      correctAnswer: 1,
      explanation: "Fume hoods capture and remove toxic vapors, protecting you from inhaling harmful substances."
    }
  ]
};

// Get quiz by tutorial ID
export function getQuizByTutorialId(tutorialId: string): TutorialQuiz | undefined {
  return chemistryQuizzes.find(q => q.tutorialId === tutorialId);
}
