export interface LabQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LabBenchItem {
  type: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
}

export interface LabExperiment {
  id: "titration" | "pendulum" | "buoyancy" | "ohms-law" | "hookes-law" | "diffusion";
  title: string;
  icon: string;
  subject: string;
  summary: string;
  objective: string;
  apparatus: string[];
  procedure: string[];
  bench: LabBenchItem[];
  quiz: LabQuizQuestion[];
}

export const LAB_PASS_MARK = 3;

export const labExperiments: LabExperiment[] = [
  {
    id: "ohms-law", title: "Ohm’s Law", icon: "⚡", subject: "Physics",
    summary: "Measure current through a resistor as voltage changes.",
    objective: "Verify V = IR and compare the current through different resistances.",
    apparatus: ["Variable DC supply", "Resistor", "Ammeter", "Voltmeter", "Connecting leads"],
    procedure: ["Connect the ammeter and resistor in series with the supply.", "Place the voltmeter across the resistor.", "Set resistance to 100 Ω and voltage to 2 V; record the current.", "Repeat at 4 V, 6 V and 8 V, keeping resistance constant.", "Change resistance to 200 Ω and compare current at the same voltage."],
    bench: [
      { type: "battery", name: "DC supply", icon: "🔋", x: 40, y: 40, properties: { voltage: 6 } },
      { type: "resistor", name: "Resistor", icon: "〓", x: 220, y: 40, properties: { resistance: 100 } },
      { type: "ammeter", name: "Ammeter", icon: "A", x: 40, y: 160, properties: {} },
    ],
    quiz: [
      { question: "6 V across 100 Ω produces what current?", options: ["0.06 A", "6 A", "100 A", "600 A"], correctIndex: 0, explanation: "I = V/R = 6/100 = 0.06 A." },
      { question: "Doubling voltage at constant resistance makes current…", options: ["Halve", "Double", "Stay the same", "Zero"], correctIndex: 1, explanation: "Current is directly proportional to voltage." },
      { question: "An ammeter is connected…", options: ["In parallel", "Across the supply only", "In series", "Without leads"], correctIndex: 2, explanation: "An ammeter measures the current passing through it in series." },
      { question: "Doubling resistance at constant voltage makes current…", options: ["Double", "Halve", "Quadruple", "Stay constant"], correctIndex: 1, explanation: "I = V/R, so doubling R halves I." },
    ],
  },
  {
    id: "hookes-law", title: "Hooke’s Law", icon: "〰️", subject: "Physics",
    summary: "Load a spring and measure its extension.",
    objective: "Verify F = kx within the elastic limit using a 50 N/m spring.",
    apparatus: ["Retort stand", "Spring", "Mass hanger", "Slotted masses", "Metre ruler"],
    procedure: ["Attach the unloaded spring to the stand and note its length.", "Set the spring constant to 50 N/m.", "Add a 100 g mass and let the oscillation settle.", "Record the extension, then repeat with 200 g, 300 g and 400 g.", "Calculate F = mg and divide by extension to check the spring constant."],
    bench: [
      { type: "spring", name: "Spring", icon: "〰️", x: 60, y: 40, properties: { k: 50, mass: 0.1, displacement: 0.02 } },
      { type: "ruler", name: "Ruler", icon: "📏", x: 240, y: 40, properties: { unit: "cm" } },
    ],
    quiz: [
      { question: "A force of 1 N extends a 50 N/m spring by…", options: ["50 m", "0.02 m", "2 m", "0.5 m"], correctIndex: 1, explanation: "x = F/k = 1/50 = 0.02 m." },
      { question: "Doubling load within the elastic limit makes extension…", options: ["Double", "Halve", "Stay unchanged", "Zero"], correctIndex: 0, explanation: "F and x are proportional in Hooke’s law." },
      { question: "The unit of spring constant is…", options: ["kg", "m/s", "N/m", "J/s"], correctIndex: 2, explanation: "k is force divided by extension, measured in N/m." },
      { question: "Beyond the elastic limit a spring may…", options: ["Lose all mass", "Deform permanently", "Become weightless", "Always obey F = kx"], correctIndex: 1, explanation: "Beyond the elastic limit it may not return to its original length." },
    ],
  },
  {
    id: "diffusion", title: "Diffusion in Water", icon: "💧", subject: "Chemistry",
    summary: "Compare how dye spreads through cold and warm water.",
    objective: "Observe concentration equalising as particles move, and investigate temperature’s effect on diffusion.",
    apparatus: ["Beaker of water", "Dye", "Thermometer", "Stopwatch"],
    procedure: ["Set the water temperature to 20 °C.", "Reset the beaker to place dye at its centre.", "Start diffusion and observe the spread without stirring.", "Repeat at 60 °C with the same amount of dye.", "Compare the spread after equal times and explain the effect of temperature."],
    bench: [
      { type: "beaker", name: "Water and dye", icon: "🧪", x: 60, y: 80, properties: { volume: 250, content: "water" } },
      { type: "thermometer", name: "Thermometer", icon: "🌡️", x: 240, y: 40, properties: { unit: "C" } },
      { type: "stopwatch", name: "Stopwatch", icon: "⏱️", x: 240, y: 160, properties: {} },
    ],
    quiz: [
      { question: "Net diffusion moves particles from…", options: ["Low to high concentration", "High to low concentration", "Cold to hot only", "Bottom to top only"], correctIndex: 1, explanation: "Random motion produces net movement down the concentration gradient." },
      { question: "Warmer water generally makes diffusion…", options: ["Faster", "Slower", "Stop", "Reverse"], correctIndex: 0, explanation: "Higher temperature increases particle motion." },
      { question: "After concentration becomes uniform, particles…", options: ["Stop moving", "Disappear", "Keep moving randomly", "All sink"], correctIndex: 2, explanation: "Dynamic equilibrium has random motion but no net concentration change." },
      { question: "Which should stay the same when testing temperature?", options: ["The amount of dye", "Nothing", "The temperature", "The final colour only"], correctIndex: 0, explanation: "Keep dye amount and water volume constant for a fair comparison." },
    ],
  },
  {
    id: "titration",
    title: "Acid–Base Titration",
    icon: "🧪",
    subject: "Chemistry",
    summary: "Neutralise hydrochloric acid with sodium hydroxide and find the end point.",
    objective: "Find the volume of 0.10 M NaOH that exactly neutralises 25 mL of 0.10 M HCl.",
    apparatus: ["Burette", "Conical flask", "Phenolphthalein indicator", "White tile", "Beaker"],
    procedure: [
      "Rinse the burette with sodium hydroxide and fill it to the 0 mL mark.",
      "Pipette 25 mL of hydrochloric acid into the conical flask and add 2 drops of indicator.",
      "Add sodium hydroxide quickly at first, swirling the flask all the time.",
      "Near 20 mL, add it drop by drop and watch for a faint pink colour that stays.",
      "Record the burette reading at the end point and work out the volume used.",
    ],
    bench: [
      { type: "titration", name: "Titration Setup", icon: "🧫", x: 120, y: 60, properties: { concentration: 0.1 } },
      { type: "beaker", name: "Beaker", icon: "🧪", x: 320, y: 160, properties: { volume: 250, content: "HCl" } },
    ],
    quiz: [
      { question: "What is the pH at the end point of a strong acid–strong base titration?", options: ["1", "4", "7", "12"], correctIndex: 2, explanation: "Equal moles of H⁺ and OH⁻ form neutral salt and water, so pH ≈ 7." },
      { question: "Why do we add the base drop by drop near the end point?", options: ["To save chemicals", "So we don't overshoot the colour change", "To heat the flask", "To dilute the acid"], correctIndex: 1, explanation: "The pH jumps sharply near equivalence; a single extra drop can overshoot." },
      { question: "Phenolphthalein in a basic solution is…", options: ["Colourless", "Pink", "Yellow", "Blue"], correctIndex: 1, explanation: "Phenolphthalein turns pink above about pH 8.2." },
      { question: "25 mL of 0.10 M HCl needs how much 0.10 M NaOH?", options: ["12.5 mL", "25 mL", "50 mL", "10 mL"], correctIndex: 1, explanation: "Same concentration and a 1:1 reaction means equal volumes." },
    ],
  },
  {
    id: "pendulum",
    title: "Simple Pendulum & Gravity",
    icon: "⏱️",
    subject: "Physics",
    summary: "Time a swinging pendulum to measure the strength of gravity.",
    objective: "Show that the period depends on length, not mass, and calculate g from T = 2π√(L/g).",
    apparatus: ["Retort stand and clamp", "String", "Pendulum bob", "Metre ruler", "Stopwatch"],
    procedure: [
      "Clamp the string so the length from pivot to the centre of the bob is 0.50 m.",
      "Pull the bob aside by a small angle (under 15°) and release it gently.",
      "Time 10 full swings and divide by 10 to get the period T.",
      "Repeat for lengths of 0.75 m and 1.00 m, then change the mass and repeat.",
      "Calculate g = 4π²L / T² for each length and find the average.",
    ],
    bench: [
      { type: "pendulum", name: "Pendulum", icon: "🔄", x: 140, y: 60, properties: { length: 1, mass: 0.2, angle: 10 } },
      { type: "stopwatch", name: "Stopwatch", icon: "⏱️", x: 340, y: 80, properties: {} },
      { type: "ruler", name: "Ruler", icon: "📏", x: 340, y: 200, properties: { unit: "cm" } },
    ],
    quiz: [
      { question: "If you make the pendulum 4× longer, the period becomes…", options: ["4× longer", "2× longer", "The same", "Half as long"], correctIndex: 1, explanation: "T ∝ √L, and √4 = 2." },
      { question: "Doubling the bob's mass changes the period by…", options: ["Doubling it", "Halving it", "Nothing", "Quadrupling it"], correctIndex: 2, explanation: "Mass cancels out of the equation of motion." },
      { question: "Why time 10 swings instead of 1?", options: ["It reduces timing error", "The pendulum speeds up", "It is the rule", "To tire the bob"], correctIndex: 0, explanation: "Your reaction-time error is spread across 10 swings." },
      { question: "A 1.00 m pendulum on Earth has a period close to…", options: ["0.5 s", "1.0 s", "2.0 s", "4.0 s"], correctIndex: 2, explanation: "T = 2π√(1/9.8) ≈ 2.01 s." },
    ],
  },
  {
    id: "buoyancy",
    title: "Archimedes' Principle",
    icon: "⚓",
    subject: "Physics",
    summary: "Lower objects into water and compare their weight with the water they push aside.",
    objective: "Show that the upthrust on an object equals the weight of fluid it displaces.",
    apparatus: ["Spring balance", "Eureka (overflow) can", "Measuring cylinder", "Objects of different density", "Water"],
    procedure: [
      "Fill the overflow can until water drips from the spout, then wait for it to stop.",
      "Weigh the object in air with the spring balance.",
      "Lower the object fully into the water and collect the overflow in the cylinder.",
      "Read the new balance reading and the volume of water collected.",
      "Compare the loss in weight with the weight of the displaced water.",
    ],
    bench: [
      { type: "beaker", name: "Overflow can", icon: "🧪", x: 160, y: 120, properties: { volume: 1000, content: "water" } },
      { type: "scale", name: "Spring balance", icon: "⚖️", x: 160, y: 20, properties: { precision: 0.01 } },
    ],
    quiz: [
      { question: "Upthrust equals…", options: ["The object's mass", "The weight of fluid displaced", "The volume of the can", "Zero in water"], correctIndex: 1, explanation: "That is Archimedes' principle." },
      { question: "An object floats when its density is…", options: ["Greater than water's", "Less than water's", "Exactly 2 g/cm³", "Unrelated"], correctIndex: 1, explanation: "Less dense objects displace their own weight before fully sinking." },
      { question: "A 100 cm³ object fully under water displaces about how much water?", options: ["10 g", "50 g", "100 g", "1000 g"], correctIndex: 2, explanation: "Water is about 1 g/cm³, so 100 cm³ ≈ 100 g." },
      { question: "Salt water gives more upthrust because it is…", options: ["Warmer", "Denser", "Clearer", "Thinner"], correctIndex: 1, explanation: "Denser fluid weighs more per volume displaced." },
    ],
  },
];

export const getLabExperiment = (id?: string) => labExperiments.find((l) => l.id === id);

// ---- local progress ----
export const LAB_PROGRESS_KEY = "virtulab-lab-progress";

export interface LabProgressRecord {
  quizScore: number;
  completed: boolean;
  stepsDone: number[];
}

export function readLabProgress(): Record<string, LabProgressRecord> {
  try {
    return JSON.parse(localStorage.getItem(LAB_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeLabProgress(id: string, rec: LabProgressRecord) {
  const all = readLabProgress();
  all[id] = rec;
  try {
    localStorage.setItem(LAB_PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

/** Pure grading helper (tested). */
export function gradeLabQuiz(exp: LabExperiment, answers: (number | undefined)[]) {
  const score = exp.quiz.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  return { score, passed: score >= LAB_PASS_MARK };
}
