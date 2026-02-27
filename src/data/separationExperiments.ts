export interface SeparationExperiment {
  id: string;
  title: string;
  icon: string;
  description: string;
  overview: string[];
  howItWorks: { step: number; title: string; description: string }[];
  keyConcepts: { title: string; description: string }[];
  applications: { title: string; description: string }[];
  summary: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number }[];
  simulationConfig: {
    temperatureRange: [number, number];
    defaultTemperature: number;
    substances: string[];
  };
}

export const separationExperiments: SeparationExperiment[] = [
  {
    id: "evaporation",
    title: "Evaporation",
    icon: "🔥💧",
    description: "Separate salt from water using heat energy",
    overview: [
      "Separation of mixtures is an important area of chemistry that helps learners understand how different substances can be separated based on their physical properties. Evaporation is one of the simplest and most fundamental separation techniques.",
      "Evaporation is based on the principle that different substances in a mixture have different boiling points. When a solution containing a dissolved solid is heated, the liquid solvent evaporates first because it has a lower boiling point, while the solid remains as residue.",
      "A mixture is formed when two or more substances are combined without chemical bonding. Each substance retains its properties and can be separated using physical methods. In this experiment, the mixture used is a salt solution, where salt (solute) dissolves in water (solvent).",
      "The dissolved salt cannot be separated by filtration because it forms a uniform solution. Therefore, evaporation is used. This method is widely used in daily life, industry, and environmental processes."
    ],
    howItWorks: [
      { step: 1, title: "Preparation of Salt Solution", description: "Salt is dissolved in water to create a clear solution. The salt particles are evenly distributed in the water." },
      { step: 2, title: "Heating the Solution", description: "The salt solution is poured into an evaporating dish and heated gently. Water molecules gain kinetic energy and temperature rises." },
      { step: 3, title: "Evaporation of Water", description: "As heating continues, water gradually evaporates. The amount of liquid reduces and salt concentration increases." },
      { step: 4, title: "Formation of Residue", description: "After complete evaporation, white salt crystals remain. The salt retains its original properties. No new substance is formed, confirming this is a physical change." }
    ],
    keyConcepts: [
      { title: "Mixtures and Solutions", description: "A mixture consists of substances combined physically. A solution is a uniform mixture formed when a solute dissolves in a solvent." },
      { title: "Boiling Point and Volatility", description: "Different substances have different boiling points. Water evaporates at a lower temperature compared to salt, enabling separation." },
      { title: "Change of State", description: "Evaporation involves change of state from liquid to gas. It demonstrates how heat energy affects matter." },
      { title: "Heat Energy and Particle Motion", description: "Heating increases particle motion, allowing molecules to escape from the liquid surface." },
      { title: "Solubility", description: "Solubility refers to the ability of a substance to dissolve in a solvent. Dissolved substances can still be recovered." },
      { title: "Conservation of Matter", description: "The salt is not destroyed during evaporation. It is simply separated from the solvent." },
      { title: "Concentration of Solutions", description: "As water evaporates, the solution becomes more concentrated before complete separation." }
    ],
    applications: [
      { title: "Salt Production", description: "Salt is produced by evaporating seawater in large shallow ponds. Sunlight provides heat, leaving salt crystals behind." },
      { title: "Water Purification", description: "Evaporation is part of water purification processes where impurities are removed." },
      { title: "Food Industry", description: "Used to produce sugar from sugarcane juice, concentrate fruit juices, and preserve foods." },
      { title: "Drying Processes", description: "Drying clothes, grains, and foods relies on evaporation of water." },
      { title: "Chemical Industry", description: "Industries use evaporation to recover dissolved substances from solutions." },
      { title: "Environmental Processes", description: "The water cycle involves natural evaporation from oceans and lakes." },
      { title: "Medicine and Laboratories", description: "Evaporation is used to concentrate solutions and prepare chemicals." }
    ],
    summary: [
      "Evaporation separates a soluble solid from a liquid by heating",
      "Water evaporates first because it has a lower boiling point than salt",
      "The solid residue retains its original properties",
      "Evaporation is a physical change — no new substances are formed",
      "This method is widely used in salt production, food industry, and water purification"
    ],
    quizQuestions: [
      { question: "What is left behind after evaporating a salt solution?", options: ["Water", "Salt crystals", "Steam", "Nothing"], correctIndex: 1 },
      { question: "Why does water evaporate before salt?", options: ["Water is heavier", "Water has a lower boiling point", "Salt is a gas", "Water is less dense"], correctIndex: 1 },
      { question: "Evaporation is an example of what type of change?", options: ["Chemical change", "Nuclear change", "Physical change", "Biological change"], correctIndex: 2 },
      { question: "Which of the following cannot be separated by evaporation?", options: ["Salt and water", "Sugar and water", "Sand and water", "Copper sulfate and water"], correctIndex: 2 }
    ],
    simulationConfig: { temperatureRange: [20, 120], defaultTemperature: 25, substances: ["Salt solution"] }
  },
  {
    id: "crystallization",
    title: "Crystallization",
    icon: "❄️💎",
    description: "Form pure crystals from saturated solutions",
    overview: [
      "Crystallization is an important separation technique used to obtain a pure solid substance from a solution. It is more advanced than simple evaporation because it allows the recovery of high-quality, well-formed crystals without damaging the substance.",
      "Crystallization is based on the principle of differences in solubility at different temperatures. Most solids dissolve better in hot liquids than in cold liquids. When a hot saturated solution cools, the dissolved solid separates out as crystals.",
      "Unlike evaporation, where all solvent is removed by heating, crystallization carefully controls temperature so that solid particles arrange into organized crystal structures.",
      "This experiment demonstrates separation using substances such as copper sulfate solution, showing how crystals form when a solution becomes saturated and then cools."
    ],
    howItWorks: [
      { step: 1, title: "Preparation of the Solution", description: "A solid such as copper sulfate is dissolved in warm water. As the solution is stirred and heated, solubility increases and more solid dissolves." },
      { step: 2, title: "Formation of a Saturated Solution", description: "The solution is heated further until no more solid can dissolve. This produces a hot saturated solution." },
      { step: 3, title: "Cooling the Solution", description: "The hot solution is left to cool slowly. As temperature decreases, solubility decreases and excess solute begins to separate." },
      { step: 4, title: "Crystal Formation", description: "Crystals begin forming at nucleation points and grow over time. The crystals have regular shapes with organized particle structures." },
      { step: 5, title: "Collection", description: "Crystals are collected by filtration. The remaining liquid (mother liquor) can be reused." }
    ],
    keyConcepts: [
      { title: "Solubility", description: "Solubility is the ability of a substance to dissolve in a solvent. Temperature affects the solubility of solids." },
      { title: "Saturated and Unsaturated Solutions", description: "An unsaturated solution can dissolve more solute. A saturated solution has the maximum solute dissolved at that temperature." },
      { title: "Crystal Structure", description: "Crystals have definite shapes because particles arrange in regular patterns called crystal lattices." },
      { title: "Effect of Temperature", description: "Higher temperatures increase solubility; lower temperatures reduce solubility, causing crystal formation." },
      { title: "Purification of Substances", description: "Crystallization removes impurities, producing pure substances." },
      { title: "Rate of Cooling", description: "Slow cooling produces larger crystals; rapid cooling produces smaller crystals." }
    ],
    applications: [
      { title: "Production of Sugar", description: "Sugar is purified through crystallization in sugar industries." },
      { title: "Salt Production", description: "Salt crystals are obtained from concentrated solutions." },
      { title: "Pharmaceutical Industry", description: "Medicines are purified through crystallization." },
      { title: "Chemical Manufacturing", description: "Pure chemicals are obtained using crystallization." },
      { title: "Food Industry", description: "Crystallization produces candy, chocolate, and other products." },
      { title: "Mineral Formation", description: "Natural crystals form in rocks and caves through geological processes." }
    ],
    summary: [
      "Crystallization separates a pure solid from a solution by controlled cooling",
      "Most solids are more soluble in hot water than cold water",
      "Slow cooling produces larger, purer crystals",
      "Crystallization is different from evaporation — it preserves crystal structure",
      "Used in sugar production, pharmaceuticals, and chemical manufacturing"
    ],
    quizQuestions: [
      { question: "What happens to solubility as temperature decreases?", options: ["It increases", "It decreases", "It stays the same", "It doubles"], correctIndex: 1 },
      { question: "What produces larger crystals?", options: ["Fast cooling", "Slow cooling", "No cooling", "Rapid heating"], correctIndex: 1 },
      { question: "A saturated solution is one that:", options: ["Has no solute", "Can dissolve more solute", "Cannot dissolve more solute", "Has been heated"], correctIndex: 2 },
      { question: "Crystallization is different from evaporation because:", options: ["It uses fire", "It controls cooling to form crystals", "It destroys the solute", "It only works with water"], correctIndex: 1 }
    ],
    simulationConfig: { temperatureRange: [10, 100], defaultTemperature: 80, substances: ["Copper sulfate", "Salt"] }
  },
  {
    id: "simple-distillation",
    title: "Simple Distillation",
    icon: "⚗️💦",
    description: "Separate liquids by boiling point differences",
    overview: [
      "Simple distillation is a separation technique used to separate a liquid from a solution or to separate two liquids with widely different boiling points.",
      "Simple distillation is based on the principle that substances in a mixture have different boiling points. The substance with the lower boiling point vaporizes first when heated. The vapour is then cooled in a condenser, turning back into liquid, and collected separately. This liquid is called the distillate.",
      "The most common classroom example is the separation of salt and water. When salt water is heated, the water evaporates at 100°C, while the salt remains behind because it has a much higher boiling point.",
      "Distillation involves two major physical processes: Evaporation (liquid changes to vapour) and Condensation (vapour cools and returns to liquid form)."
    ],
    howItWorks: [
      { step: 1, title: "Preparation of Salt Solution", description: "Salt is dissolved in water to form a uniform solution. The solution is poured into a round-bottom flask." },
      { step: 2, title: "Heating the Mixture", description: "Heat is applied gradually. Water molecules gain kinetic energy and at 100°C, water begins to boil." },
      { step: 3, title: "Vapour Formation", description: "Water vapour rises from the flask and enters the condenser. Salt particles remain behind as they cannot vaporize at this temperature." },
      { step: 4, title: "Condensation", description: "Cold water flows through the condenser jacket. The vapour cools, loses heat, and particles slow down, reforming liquid droplets." },
      { step: 5, title: "Collection of Distillate", description: "The collected liquid is clear and pure water. Salt remains as residue in the distillation flask." }
    ],
    keyConcepts: [
      { title: "Boiling Point", description: "The boiling point is the temperature at which a liquid changes into vapour. Different substances have different boiling points." },
      { title: "Evaporation and Condensation", description: "Evaporation: liquid → gas. Condensation: gas → liquid. Both are physical changes." },
      { title: "Purification", description: "Distillation purifies liquids by removing dissolved solids." },
      { title: "Change of State", description: "Distillation involves two changes of state: liquid to gas, then gas back to liquid." },
      { title: "Conservation of Matter", description: "No substance is destroyed; components are separated." },
      { title: "The Water Cycle Connection", description: "Evaporation and condensation in distillation mirror natural water cycle processes." }
    ],
    applications: [
      { title: "Water Purification", description: "Distillation is used to obtain clean drinking water from salty or contaminated water." },
      { title: "Production of Distilled Water", description: "Hospitals and laboratories use distilled water for medical and scientific purposes." },
      { title: "Alcohol Production", description: "Alcoholic beverages are purified using distillation." },
      { title: "Chemical Industry", description: "Distillation separates solvents and chemicals." },
      { title: "Desalination Plants", description: "Sea water is distilled to provide fresh water in arid regions." },
      { title: "Perfume and Essential Oil Extraction", description: "Steam distillation extracts essential oils from plants." }
    ],
    summary: [
      "Simple distillation separates liquids with widely different boiling points",
      "It involves evaporation followed by condensation",
      "The distillate (collected liquid) is pure",
      "It is different from evaporation because the solvent is recovered",
      "Used in water purification, alcohol production, and desalination"
    ],
    quizQuestions: [
      { question: "What is the distillate?", options: ["The residue left behind", "The collected pure liquid", "The heat source", "The condenser"], correctIndex: 1 },
      { question: "At what temperature does pure water boil?", options: ["50°C", "75°C", "100°C", "150°C"], correctIndex: 2 },
      { question: "What is the purpose of the condenser?", options: ["To heat the liquid", "To cool vapour back into liquid", "To mix substances", "To filter particles"], correctIndex: 1 },
      { question: "Simple distillation is better than evaporation because:", options: ["It is faster", "It recovers the solvent", "It uses less heat", "It produces more residue"], correctIndex: 1 }
    ],
    simulationConfig: { temperatureRange: [20, 120], defaultTemperature: 25, substances: ["Salt water"] }
  },
  {
    id: "fractional-distillation",
    title: "Fractional Distillation",
    icon: "🏭⚗️",
    description: "Separate liquids with close boiling points",
    overview: [
      "Fractional distillation is a method used to separate two or more liquids that are mixed together and have close boiling points. Unlike simple distillation, fractional distillation provides better separation when boiling points differ only slightly.",
      "The method uses a fractionating column, which allows vapours to condense and re-evaporate several times before being collected. This improves the purity of each separated liquid.",
      "A common classroom example is separating a mixture of water (boiling point 100°C) and ethanol (boiling point 78°C). Because their boiling points are close, simple distillation would not separate them completely.",
      "The fractionating column contains surfaces that cool vapours slightly, cause higher boiling substances to condense and return to the flask, and allow lower boiling vapours to pass upward. This repeated process is called fractionation."
    ],
    howItWorks: [
      { step: 1, title: "Preparing the Liquid Mixture", description: "A mixture of two liquids (e.g., ethanol and water) is placed in the distillation flask." },
      { step: 2, title: "Heating the Mixture", description: "Heat is applied gradually. The lower boiling liquid (ethanol) gains energy first and particles begin moving faster." },
      { step: 3, title: "Vapour Enters the Column", description: "Vapour rises into the fractionating column where temperature decreases upward. Some vapour condenses and higher boiling liquid returns to the flask." },
      { step: 4, title: "Separation of Fractions", description: "The liquid with the lowest boiling point reaches the top first, enters the condenser, cools, and is collected as a fraction." },
      { step: 5, title: "Collection of Different Liquids", description: "After the first fraction is collected, temperature rises and the second liquid begins to distil. A new fraction is collected separately." }
    ],
    keyConcepts: [
      { title: "Boiling Point Differences", description: "Liquids separate based on different boiling temperatures. Even close boiling points can be separated with fractionation." },
      { title: "Repeated Evaporation and Condensation", description: "Multiple cycles of evaporation and condensation increase separation efficiency." },
      { title: "Temperature Gradient", description: "Temperature decreases from the bottom to the top of the fractionating column." },
      { title: "Vapour Pressure", description: "Liquids with higher vapour pressure evaporate more easily at lower temperatures." },
      { title: "Purification of Liquids", description: "Fractional distillation produces high-purity substances." },
      { title: "Industrial Chemistry Applications", description: "Used in petroleum refining and alcohol production." }
    ],
    applications: [
      { title: "Petroleum Refining", description: "Crude oil is separated into petrol, diesel, kerosene, lubricating oil, and bitumen — each with different boiling points." },
      { title: "Alcohol Production", description: "Fractional distillation increases alcohol concentration in beverages." },
      { title: "Air Separation", description: "Liquid air is separated into oxygen and nitrogen using fractional distillation." },
      { title: "Chemical Manufacturing", description: "Used to purify chemicals and solvents." },
      { title: "Fuel Production", description: "Produces fuels for transport and industry." },
      { title: "Food Processing Industry", description: "Used in flavour extraction." }
    ],
    summary: [
      "Fractional distillation separates liquids with close boiling points",
      "It uses a fractionating column for repeated evaporation and condensation",
      "Temperature gradient in the column enables better separation",
      "More effective than simple distillation for mixtures like ethanol and water",
      "Key industrial application: petroleum refining"
    ],
    quizQuestions: [
      { question: "What is the role of the fractionating column?", options: ["To heat the mixture", "To allow repeated condensation and evaporation", "To filter solids", "To cool the liquid"], correctIndex: 1 },
      { question: "Which liquid evaporates first from ethanol-water mixture?", options: ["Water (100°C)", "Ethanol (78°C)", "Both at the same time", "Neither"], correctIndex: 1 },
      { question: "Fractional distillation is better than simple distillation when:", options: ["Substances are solids", "Boiling points are very different", "Boiling points are close", "One is a gas"], correctIndex: 2 },
      { question: "What is a 'fraction' in fractional distillation?", options: ["A broken piece of glass", "A collected liquid with a specific boiling range", "A type of filter", "A chemical reaction product"], correctIndex: 1 }
    ],
    simulationConfig: { temperatureRange: [20, 120], defaultTemperature: 25, substances: ["Ethanol-water mixture"] }
  },
  {
    id: "sublimation",
    title: "Sublimation",
    icon: "🟡💨",
    description: "Separate solids that change directly to gas",
    overview: [
      "Sublimation is a method of separating a mixture in which one solid changes directly into vapour when heated, without passing through the liquid state. This process is a physical change and is reversible.",
      "Sublimation occurs in certain substances such as ammonium chloride, iodine, naphthalene, and dry ice (solid carbon dioxide).",
      "In this experiment, a common classroom mixture is ammonium chloride and sand. Ammonium chloride sublimes when heated, while sand does not. This difference allows the two substances to be separated.",
      "When cooled, the vapour turns directly back into solid. This reverse process is called deposition. The separation is possible because one substance sublimes while the other does not."
    ],
    howItWorks: [
      { step: 1, title: "Preparation of Mixture", description: "A mixture of ammonium chloride and sand is placed in an evaporating dish." },
      { step: 2, title: "Covering with Inverted Funnel", description: "An inverted funnel is placed over the dish. The narrow stem is plugged with cotton wool to prevent vapour from escaping. The funnel acts as a cooling surface." },
      { step: 3, title: "Heating the Mixture", description: "The mixture is heated gently. Ammonium chloride particles gain energy and escape directly into vapour. Sand particles remain in the dish." },
      { step: 4, title: "Sublimation Occurs", description: "Ammonium chloride changes from solid directly to vapour without becoming liquid. White fumes are seen rising." },
      { step: 5, title: "Deposition on the Funnel", description: "When vapour touches the cool funnel surface, it changes from vapour directly back to solid. White crystals form on the inner surface." },
      { step: 6, title: "Separation Completed", description: "Sand remains in the evaporating dish. Ammonium chloride is collected from the funnel." }
    ],
    keyConcepts: [
      { title: "Sublimation", description: "Direct change of a solid to gas without passing through the liquid state." },
      { title: "Deposition", description: "The reverse of sublimation — vapour turns directly back into solid when cooled." },
      { title: "Intermolecular Forces", description: "Substances with weak intermolecular forces can sublime because particles require less energy to escape." },
      { title: "Physical Separation", description: "No chemical change occurs during sublimation. The substances can be recovered." },
      { title: "Temperature and Energy", description: "Heat increases particle kinetic energy, enabling sublimation." },
      { title: "Solid-Solid Separation", description: "Sublimation is useful when only one solid in the mixture can sublime." }
    ],
    applications: [
      { title: "Air Fresheners (Naphthalene Balls)", description: "Mothballs slowly sublime into vapour, releasing fragrance." },
      { title: "Dry Ice (Solid CO₂)", description: "Used for cooling without producing liquid, commonly in food storage and stage effects." },
      { title: "Freeze-Drying Food", description: "Water sublimes from frozen food, preserving it without damaging the structure." },
      { title: "Iodine Purification", description: "Iodine crystals are purified using sublimation in laboratories." },
      { title: "Forensic Science", description: "Sublimation techniques are used to develop latent fingerprints." },
      { title: "Pharmaceutical Industry", description: "Used to purify sensitive compounds without exposing them to liquid solvents." }
    ],
    summary: [
      "Sublimation is a direct change from solid to gas without becoming liquid",
      "Deposition is the reverse — gas directly becomes solid",
      "Used to separate solid-solid mixtures where one component sublimes",
      "Common substances that sublime: ammonium chloride, iodine, naphthalene, dry ice",
      "Applications include freeze-drying, air fresheners, and pharmaceutical purification"
    ],
    quizQuestions: [
      { question: "What is sublimation?", options: ["Liquid to gas", "Solid to gas directly", "Gas to liquid", "Solid to liquid"], correctIndex: 1 },
      { question: "What is deposition?", options: ["Gas to solid directly", "Liquid to solid", "Solid to gas", "Gas to liquid"], correctIndex: 0 },
      { question: "Which substance sublimes in this experiment?", options: ["Sand", "Water", "Ammonium chloride", "Salt"], correctIndex: 2 },
      { question: "Why is an inverted funnel used?", options: ["To heat the mixture", "To filter sand", "To provide a cool surface for deposition", "To mix the substances"], correctIndex: 2 }
    ],
    simulationConfig: { temperatureRange: [20, 200], defaultTemperature: 25, substances: ["Ammonium chloride + Sand"] }
  },
  {
    id: "solvent-extraction",
    title: "Solvent Extraction",
    icon: "🧪🛢️",
    description: "Separate substances using immiscible liquids",
    overview: [
      "Solvent extraction is a method used to separate substances based on their different solubilities in two immiscible liquids (liquids that do not mix). The technique is also called liquid–liquid extraction.",
      "The method works because different substances dissolve better in different solvents. When two non-mixing liquids are combined with a mixture, one substance dissolves in one liquid while the other dissolves in the second liquid, allowing separation.",
      "A common classroom example is separating oil from water or extracting a dissolved substance from water using an organic solvent.",
      "Solvent extraction works due to three main principles: Different Solubilities (a substance dissolves more in one solvent than another), Immiscible Liquids (two liquids do not mix and form separate layers), and Density Differences (one liquid floats above the other)."
    ],
    howItWorks: [
      { step: 1, title: "Preparing the Mixture", description: "A mixture of two immiscible liquids (e.g., oil and water) is placed in a separating funnel. Different colours represent different liquids." },
      { step: 2, title: "Shaking / Mixing", description: "The funnel is shaken to maximize contact between the two liquids, allowing substances to dissolve in their preferred solvent." },
      { step: 3, title: "Formation of Layers", description: "The mixture is allowed to settle. Two layers form: the denser liquid stays at the bottom, the less dense floats on top." },
      { step: 4, title: "Separation Using the Stopcock", description: "The stopcock at the bottom is opened slowly. The lower liquid drains first while the upper liquid remains in the funnel." },
      { step: 5, title: "Complete Separation", description: "Once the lower layer is removed, the tap is closed. The upper layer is poured separately. The mixture is now fully separated." }
    ],
    keyConcepts: [
      { title: "Solubility", description: "Different substances dissolve differently in different solvents. 'Like dissolves like.'" },
      { title: "Immiscible Liquids", description: "Liquids that do not mix form distinct layers when combined." },
      { title: "Density", description: "Denser liquids settle below lighter liquids, enabling physical separation." },
      { title: "Molecular Interactions", description: "Attractive forces between molecules determine which solvent a substance prefers." },
      { title: "Polarity", description: "Polar substances dissolve in polar solvents; non-polar substances dissolve in non-polar solvents." },
      { title: "Distribution of Solute", description: "A solute distributes itself between two solvents based on its relative solubility in each." }
    ],
    applications: [
      { title: "Oil Refining", description: "Different components of crude oil are separated using solvent extraction." },
      { title: "Food Industry", description: "Used to extract vegetable oils, flavours, and food colours from raw materials." },
      { title: "Pharmaceutical Industry", description: "Medicines are purified using solvent extraction." },
      { title: "Environmental Protection", description: "Used to remove pollutants from contaminated water." },
      { title: "Perfume Production", description: "Fragrances are extracted from plant materials using organic solvents." },
      { title: "Metal Extraction", description: "Valuable metals are separated from ores using solvent extraction." }
    ],
    summary: [
      "Solvent extraction separates substances based on different solubilities in immiscible liquids",
      "Immiscible liquids form layers based on density differences",
      "A separating funnel is used to drain and collect layers separately",
      "'Like dissolves like' — polar solvents dissolve polar substances",
      "Widely used in oil refining, pharmaceuticals, food industry, and environmental cleanup"
    ],
    quizQuestions: [
      { question: "What are immiscible liquids?", options: ["Liquids that mix completely", "Liquids that do not mix", "Liquids that react chemically", "Liquids with the same density"], correctIndex: 1 },
      { question: "Which layer is drained first from a separating funnel?", options: ["The top layer", "The bottom (denser) layer", "Both at the same time", "Neither"], correctIndex: 1 },
      { question: "What principle does solvent extraction rely on?", options: ["Boiling point differences", "Different solubilities in different solvents", "Sublimation", "Magnetism"], correctIndex: 1 },
      { question: "Oil floats on water because:", options: ["Oil is heavier", "Oil is less dense than water", "Oil dissolves in water", "Water evaporates faster"], correctIndex: 1 }
    ],
    simulationConfig: { temperatureRange: [20, 50], defaultTemperature: 25, substances: ["Oil and water", "Organic solvent and water"] }
  },
  {
    id: "chromatography",
    title: "Chromatography",
    icon: "🖌️🌈",
    description: "Separate dyes by their different movement rates",
    overview: [
      "Chromatography is a method used to separate mixtures of substances based on their different rates of movement using a solvent. Paper chromatography is commonly taught because it is simple, safe, and visually clear.",
      "The word chromatography comes from Greek words meaning 'colour writing,' because it was first used to separate plant pigments. Today, it is one of the most powerful separation techniques in science.",
      "This experiment usually separates different coloured dyes in ink. Although ink appears to be one colour, it often contains several dyes mixed together. Chromatography allows us to see the different components.",
      "Chromatography works due to: Solubility differences (some substances dissolve better in the solvent), Adsorption differences (some substances stick more strongly to the paper), and Different movement speeds."
    ],
    howItWorks: [
      { step: 1, title: "Drawing the Baseline", description: "A pencil line is drawn near the bottom of the paper strip. Ink is placed as a small dot on the line. Pencil is used because it won't dissolve in the solvent." },
      { step: 2, title: "Placing Paper in Solvent", description: "The paper is placed in a beaker containing a small amount of solvent. The ink spot must not touch the solvent directly — only the bottom of the paper touches it." },
      { step: 3, title: "Solvent Rises (Capillary Action)", description: "The solvent moves upward through the paper due to capillary action. As it rises, it dissolves the ink and different dyes move at different speeds." },
      { step: 4, title: "Separation Occurs", description: "Different coloured spots appear at different heights on the paper. This shows the ink is a mixture of different dyes." },
      { step: 5, title: "Marking the Solvent Front", description: "When the solvent reaches near the top, the paper is removed and the solvent front is marked. Rf values can be calculated for each spot." }
    ],
    keyConcepts: [
      { title: "Stationary and Mobile Phases", description: "The stationary phase is the paper. The mobile phase is the solvent. Substances interact differently with each phase." },
      { title: "Capillary Action", description: "The solvent moves upward through the paper due to adhesive and cohesive forces between molecules." },
      { title: "Rf Value", description: "Rf = Distance moved by substance ÷ Distance moved by solvent. Each substance has a characteristic Rf value." },
      { title: "Adsorption", description: "Some substances stick more strongly to the paper and move slower. Others dissolve better in the solvent and move faster." },
      { title: "Solubility Differences", description: "Substances that are more soluble in the solvent travel further up the paper." },
      { title: "Identification of Substances", description: "Unknown substances can be identified by comparing their Rf values with known substances." }
    ],
    applications: [
      { title: "Forensic Science", description: "Used to analyse ink samples, identify forged documents, and test substances found at crime scenes." },
      { title: "Food Testing", description: "Used to detect artificial colours and additives in food and beverages." },
      { title: "Drug Testing", description: "Chromatography identifies substances in blood, urine, and other body fluids." },
      { title: "Environmental Monitoring", description: "Used to detect pollutants and chemicals in water and air samples." },
      { title: "Pharmaceutical Industry", description: "Used to separate and purify drugs during manufacturing." },
      { title: "Plant Pigment Analysis", description: "Used to separate chlorophyll and other pigments from plant leaves." }
    ],
    summary: [
      "Chromatography separates substances based on their different movement rates in a solvent",
      "It uses a stationary phase (paper) and a mobile phase (solvent)",
      "Capillary action draws the solvent up through the paper",
      "Rf value = distance moved by substance ÷ distance moved by solvent",
      "Used in forensics, food testing, drug analysis, and environmental monitoring"
    ],
    quizQuestions: [
      { question: "What is the stationary phase in paper chromatography?", options: ["The solvent", "The paper", "The ink", "The beaker"], correctIndex: 1 },
      { question: "Why is a pencil line used instead of pen?", options: ["Pencil is cheaper", "Pencil graphite won't dissolve in the solvent", "Pen is too thick", "Pencil is easier to see"], correctIndex: 1 },
      { question: "If a dye has an Rf value of 0.8, it means:", options: ["It didn't move", "It moved 80% as far as the solvent", "It moved 8 cm", "It is 80% pure"], correctIndex: 1 },
      { question: "Which force moves the solvent up the paper?", options: ["Gravity", "Magnetism", "Capillary action", "Heat"], correctIndex: 2 }
    ],
    simulationConfig: { temperatureRange: [20, 30], defaultTemperature: 25, substances: ["Black ink", "Blue ink", "Green ink"] }
  }
];
