export interface AcidBaseExperiment {
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
}

export const acidBaseExperiments: AcidBaseExperiment[] = [
  {
    id: "acids-and-bases",
    title: "Acids and Bases",
    icon: "🧪⚗️",
    description: "Explore the fundamental properties and differences between acids and bases",
    overview: [
      "Acids and bases are two important categories of chemical substances that play vital roles in everyday life, industry, and biological processes. Understanding them is central to the study of chemistry.",
      "An acid is a substance that produces hydrogen ions (H⁺) when dissolved in water, while a base produces hydroxide ions (OH⁻). The strength of an acid or base is measured using the pH scale, which ranges from 0 (strongly acidic) to 14 (strongly basic), with 7 being neutral.",
      "Common acids include hydrochloric acid (HCl), sulfuric acid (H₂SO₄), citric acid (in citrus fruits), and acetic acid (in vinegar). Common bases include sodium hydroxide (NaOH), potassium hydroxide (KOH), calcium hydroxide (Ca(OH)₂), and ammonia (NH₃).",
      "When acids react with bases, they undergo a neutralization reaction, producing salt and water. This reaction is fundamental to many chemical processes and has numerous practical applications."
    ],
    howItWorks: [
      { step: 1, title: "Identify Substances", description: "Examine different household and laboratory substances. Acids taste sour, bases taste bitter and feel slippery." },
      { step: 2, title: "Test with Indicators", description: "Use universal indicator or pH paper to determine whether a substance is acidic, basic, or neutral." },
      { step: 3, title: "Measure pH", description: "Record the pH value of each substance. Values below 7 indicate acids, above 7 indicate bases, and 7 is neutral." },
      { step: 4, title: "Observe Reactions", description: "Mix acids with bases to observe neutralization. Note temperature changes and product formation." },
      { step: 5, title: "Analyze Ion Concentration", description: "Understand how H⁺ and OH⁻ ion concentrations determine the acidic or basic nature of a solution." }
    ],
    keyConcepts: [
      { title: "Arrhenius Theory", description: "Acids produce H⁺ ions in water, bases produce OH⁻ ions. This is the simplest definition of acids and bases." },
      { title: "Brønsted-Lowry Theory", description: "Acids are proton donors, bases are proton acceptors. This broader definition applies to non-aqueous solutions too." },
      { title: "pH Scale", description: "A logarithmic scale from 0 to 14 measuring hydrogen ion concentration. Each unit represents a tenfold change in H⁺ concentration." },
      { title: "Neutralization", description: "Acid + Base → Salt + Water. This reaction produces a solution closer to pH 7." },
      { title: "Strong vs Weak Acids/Bases", description: "Strong acids/bases fully dissociate in water. Weak ones only partially dissociate, reaching equilibrium." },
      { title: "Conjugate Acid-Base Pairs", description: "When an acid donates a proton, it becomes a conjugate base. When a base accepts a proton, it becomes a conjugate acid." }
    ],
    applications: [
      { title: "Digestion", description: "Stomach acid (HCl, pH ~2) breaks down food. Antacids neutralize excess acid to relieve heartburn." },
      { title: "Agriculture", description: "Soil pH affects plant growth. Lime (a base) is added to acidic soil, sulfur to basic soil." },
      { title: "Cleaning Products", description: "Bases like ammonia and sodium hydroxide are effective degreasers and cleaning agents." },
      { title: "Food Preservation", description: "Acids like vinegar and citric acid prevent bacterial growth and preserve foods." },
      { title: "Industrial Processes", description: "Sulfuric acid is the most widely used industrial chemical, essential in fertilizer and battery production." },
      { title: "Water Treatment", description: "pH adjustment is crucial in water purification. Chemicals are added to maintain safe pH levels." }
    ],
    summary: [
      "Acids produce H⁺ ions in solution, bases produce OH⁻ ions",
      "The pH scale measures acidity (0–6), neutrality (7), and basicity (8–14)",
      "Neutralization reactions produce salt and water",
      "Strong acids/bases fully dissociate; weak ones partially dissociate",
      "Acids and bases are essential in digestion, agriculture, industry, and cleaning"
    ],
    quizQuestions: [
      { question: "What ions do acids produce in water?", options: ["OH⁻ ions", "H⁺ ions", "Na⁺ ions", "Cl⁻ ions"], correctIndex: 1 },
      { question: "What is the pH of a neutral substance?", options: ["0", "5", "7", "14"], correctIndex: 2 },
      { question: "What is produced when an acid reacts with a base?", options: ["Only water", "Only salt", "Salt and water", "Gas and salt"], correctIndex: 2 },
      { question: "Which of the following is a strong acid?", options: ["Vinegar", "Citric acid", "Carbonic acid", "Hydrochloric acid"], correctIndex: 3 },
      { question: "What does a pH of 2 indicate?", options: ["Strong base", "Weak base", "Neutral", "Strong acid"], correctIndex: 3 }
    ]
  },
  {
    id: "litmus-paper-test",
    title: "Using Litmus Paper to Identify Acids and Bases",
    icon: "🔴🔵",
    description: "Learn to use red and blue litmus paper to classify substances",
    overview: [
      "Litmus paper is one of the oldest and simplest indicators used to test whether a substance is acidic or basic. It is derived from lichens and comes in two forms: red litmus and blue litmus.",
      "Red litmus paper turns blue in the presence of a base, while blue litmus paper turns red in the presence of an acid. Neither paper changes color in a neutral solution. This simple color change makes litmus paper an invaluable tool in chemistry.",
      "In this experiment, you will test various household substances and laboratory solutions with both red and blue litmus paper. By observing the color changes, you can classify each substance as acidic, basic, or neutral.",
      "While litmus paper cannot tell you the exact pH of a substance, it provides a quick and reliable qualitative test. For more precise measurements, universal indicator or a pH meter would be used."
    ],
    howItWorks: [
      { step: 1, title: "Prepare Test Substances", description: "Gather household and lab solutions: lemon juice, soap solution, vinegar, baking soda solution, milk, and pure water." },
      { step: 2, title: "Test with Blue Litmus", description: "Dip blue litmus paper into each substance. If it turns red, the substance is acidic. If no change, it may be basic or neutral." },
      { step: 3, title: "Test with Red Litmus", description: "Dip red litmus paper into each substance. If it turns blue, the substance is basic. If no change, it may be acidic or neutral." },
      { step: 4, title: "Record Observations", description: "Create a table recording the color change (or lack thereof) for both litmus papers with each substance." },
      { step: 5, title: "Classify Substances", description: "Based on both tests, classify each substance as acid, base, or neutral. Neutral substances cause no change in either paper." }
    ],
    keyConcepts: [
      { title: "Litmus as a Natural Indicator", description: "Litmus is extracted from lichens and contains a dye that changes color depending on pH. It's one of the oldest chemical indicators." },
      { title: "Color Change Mechanism", description: "The litmus dye molecule changes structure in acidic vs basic environments, absorbing different wavelengths of light." },
      { title: "Qualitative vs Quantitative Testing", description: "Litmus provides qualitative results (acid/base/neutral) but cannot measure exact pH values." },
      { title: "Acidic Substances", description: "Substances like lemon juice, vinegar, and carbonated water turn blue litmus red due to H⁺ ions." },
      { title: "Basic Substances", description: "Substances like soap, baking soda solution, and ammonia turn red litmus blue due to OH⁻ ions." },
      { title: "Neutral Substances", description: "Pure water and some salt solutions cause no color change in either litmus paper." }
    ],
    applications: [
      { title: "Laboratory Testing", description: "Quick identification of acid or base nature of unknown solutions in chemistry labs." },
      { title: "Soil Testing", description: "Farmers use litmus tests to quickly check if soil is acidic or basic before planting." },
      { title: "Medical Diagnostics", description: "pH testing strips (based on litmus) are used to test body fluids like urine and saliva." },
      { title: "Food Quality Control", description: "Testing acidity of foods and beverages to ensure they meet safety standards." },
      { title: "Environmental Monitoring", description: "Testing water samples from rivers and lakes for acid rain contamination." }
    ],
    summary: [
      "Blue litmus turns red in acids; red litmus turns blue in bases",
      "Neutral substances cause no color change in either litmus paper",
      "Litmus is a natural indicator derived from lichens",
      "It provides qualitative results (acid/base/neutral) but not exact pH",
      "Both papers must be tested to conclusively classify a substance"
    ],
    quizQuestions: [
      { question: "What happens when blue litmus paper is dipped in an acid?", options: ["Stays blue", "Turns red", "Turns green", "Dissolves"], correctIndex: 1 },
      { question: "Red litmus paper turns blue in:", options: ["Acids", "Neutral solutions", "Bases", "All solutions"], correctIndex: 2 },
      { question: "What is litmus derived from?", options: ["Flowers", "Lichens", "Minerals", "Bacteria"], correctIndex: 1 },
      { question: "A substance causes no change in either litmus paper. It is:", options: ["Acidic", "Basic", "Neutral", "Cannot determine"], correctIndex: 2 },
      { question: "Which of these would turn blue litmus red?", options: ["Soap solution", "Baking soda", "Lemon juice", "Pure water"], correctIndex: 2 }
    ]
  },
  {
    id: "physical-properties",
    title: "Physical Properties of Acids and Bases",
    icon: "🫧🧴",
    description: "Investigate taste, touch, conductivity, and reactivity of acids and bases",
    overview: [
      "Acids and bases have distinct physical properties that help scientists identify and classify them. These observable characteristics include taste, touch, conductivity, reaction with metals, and effect on indicators.",
      "Acids generally taste sour (like lemon juice or vinegar), while bases taste bitter (like baking soda). Bases feel slippery or soapy to touch because they react with oils on skin. Safety note: Never taste or touch unknown chemicals in a laboratory!",
      "Both acids and bases conduct electricity when dissolved in water because they produce ions. Strong acids and bases are better conductors due to complete dissociation, producing more ions.",
      "Acids react with metals like zinc and magnesium to produce hydrogen gas and a salt. Bases react with certain metals like aluminum. These reactions help identify unknown substances and have important industrial applications."
    ],
    howItWorks: [
      { step: 1, title: "Observe Physical Appearance", description: "Note that most acids and bases in solution are colorless liquids. Some, like copper sulfate, have distinctive colors." },
      { step: 2, title: "Test Conductivity", description: "Set up a simple circuit with a bulb. Dip electrodes into acid, base, and distilled water. Observe which solutions complete the circuit." },
      { step: 3, title: "React with Metals", description: "Add small pieces of zinc or magnesium to dilute hydrochloric acid. Observe effervescence (hydrogen gas bubbles)." },
      { step: 4, title: "Test Soapy/Slippery Feel", description: "Safely feel dilute base solutions (like soap water) between fingers to note the characteristic slippery texture." },
      { step: 5, title: "Compare Properties", description: "Create a comparison table listing all observed physical properties of acids versus bases." }
    ],
    keyConcepts: [
      { title: "Taste of Acids and Bases", description: "Acids taste sour due to H⁺ ions stimulating taste receptors. Bases taste bitter. Never taste unknown chemicals!" },
      { title: "Slippery Feel of Bases", description: "Bases feel slippery because they react with fatty acids (oils) on skin to form soap-like substances (saponification)." },
      { title: "Electrical Conductivity", description: "Acids and bases conduct electricity because they dissociate into ions in water. Stronger = more ions = better conductivity." },
      { title: "Reaction with Metals", description: "Acids react with reactive metals (Zn, Mg, Fe) to produce hydrogen gas and a salt: Metal + Acid → Salt + H₂" },
      { title: "Effervescence", description: "The bubbling observed when acid reacts with metal or carbonate is due to gas evolution (H₂ or CO₂)." },
      { title: "Corrosive Nature", description: "Concentrated acids and bases are corrosive and can damage skin, clothing, and materials. Safety precautions are essential." }
    ],
    applications: [
      { title: "Battery Technology", description: "Car batteries use sulfuric acid as an electrolyte, exploiting the conductivity of acid solutions." },
      { title: "Soap Manufacturing", description: "The reaction of bases (NaOH/KOH) with fats (saponification) produces soap — a practical use of base properties." },
      { title: "Metal Cleaning", description: "Dilute acids are used to clean metal surfaces, removing oxide layers through chemical reaction." },
      { title: "Food Science", description: "The sour taste of acids is used in flavoring foods. Citric acid enhances taste in candies and drinks." },
      { title: "Electroplating", description: "Acid solutions serve as electrolytes in electroplating processes due to their conductive properties." }
    ],
    summary: [
      "Acids taste sour; bases taste bitter and feel slippery",
      "Both acids and bases conduct electricity due to ion formation",
      "Acids react with metals to produce hydrogen gas and salt",
      "Concentrated acids and bases are corrosive — safety precautions are essential",
      "Physical properties help identify and classify unknown substances"
    ],
    quizQuestions: [
      { question: "Why do bases feel slippery?", options: ["They contain oil", "They react with skin oils (saponification)", "They are very dilute", "They evaporate quickly"], correctIndex: 1 },
      { question: "What gas is produced when acid reacts with zinc?", options: ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"], correctIndex: 2 },
      { question: "Why do acids conduct electricity?", options: ["They contain metals", "They produce ions in water", "They are hot", "They are liquids"], correctIndex: 1 },
      { question: "Which is a physical property of acids?", options: ["Sour taste", "Sweet taste", "No taste", "Salty taste"], correctIndex: 0 },
      { question: "Strong acids are better conductors because:", options: ["They are hotter", "They have more water", "They fully dissociate into more ions", "They contain metals"], correctIndex: 2 }
    ]
  },
  {
    id: "plant-extract-indicators",
    title: "Preparation of Acid-Base Indicators from Plant Extracts",
    icon: "🥬🌺",
    description: "Create natural indicators from cabbage, turmeric, and flower petals",
    overview: [
      "Many plants contain natural pigments called anthocyanins and other compounds that change color in the presence of acids and bases. These natural indicators were used long before synthetic indicators were developed.",
      "Red cabbage is one of the best natural indicators because it contains anthocyanins that produce a wide range of colors across the pH scale — red in strong acids, purple in neutral solutions, green in weak bases, and yellow in strong bases.",
      "Other plants that can be used as indicators include turmeric (turns red-brown in bases), beetroot (changes from red to yellow), hibiscus flowers (red in acid, green in base), and rose petals.",
      "In this experiment, you will prepare indicator solutions from plant materials by boiling or crushing them in water, then test the extract with various acidic and basic substances to observe the beautiful color changes."
    ],
    howItWorks: [
      { step: 1, title: "Collect Plant Material", description: "Gather red cabbage leaves, turmeric powder, or flower petals. These contain natural pigments that act as pH indicators." },
      { step: 2, title: "Extract the Indicator", description: "Boil the plant material in water for 10–15 minutes, or crush and soak in warm water. The pigment dissolves into the water." },
      { step: 3, title: "Filter the Extract", description: "Strain the solution through cloth or filter paper to remove solid plant matter. The colored liquid is your indicator." },
      { step: 4, title: "Test with Acids", description: "Add drops of indicator to acidic solutions (vinegar, lemon juice). Observe color changes — red cabbage turns pink/red in acids." },
      { step: 5, title: "Test with Bases", description: "Add drops to basic solutions (baking soda, soap). Red cabbage turns green/yellow. Turmeric turns reddish-brown." },
      { step: 6, title: "Create a pH Color Chart", description: "Test across a range of pH values to create a reference chart showing the indicator's color at each pH level." }
    ],
    keyConcepts: [
      { title: "Anthocyanins", description: "Water-soluble pigments in plants responsible for red, purple, and blue colors. Their molecular structure changes with pH." },
      { title: "Natural vs Synthetic Indicators", description: "Natural indicators come from plants. Synthetic ones (like phenolphthalein) are manufactured for more precise pH ranges." },
      { title: "Color Change Mechanism", description: "In acidic solutions, H⁺ ions modify the anthocyanin molecule to absorb different wavelengths of light, producing different colors." },
      { title: "Red Cabbage pH Spectrum", description: "Red cabbage indicator shows: Red (pH 1–2), Pink (3–4), Purple (5–6), Blue (7), Green (8–10), Yellow (11–14)." },
      { title: "Turmeric Indicator", description: "Turmeric contains curcumin which is yellow in acidic/neutral solutions and turns reddish-brown in basic solutions (pH > 8.5)." },
      { title: "Extraction Methods", description: "Plant indicators are extracted by boiling, crushing, or soaking in a solvent to dissolve the pigment molecules." }
    ],
    applications: [
      { title: "Home pH Testing", description: "Red cabbage juice can test household substances: cleaning products, foods, and garden soil without buying chemical indicators." },
      { title: "Science Education", description: "Plant indicators make engaging, safe, and inexpensive chemistry experiments for schools." },
      { title: "Food Industry", description: "Natural plant pigments are used as food colorings that change color based on pH — creating fun food science experiments." },
      { title: "Traditional Medicine", description: "Some cultures used color changes of plant extracts to test the acidity of traditional remedies." },
      { title: "Environmental Testing", description: "Natural indicators can provide quick tests for water quality in areas without access to laboratory equipment." },
      { title: "Art and Textiles", description: "Understanding pH-dependent color changes helps in natural dyeing processes for fabrics and art." }
    ],
    summary: [
      "Many plants contain pigments (anthocyanins) that act as natural pH indicators",
      "Red cabbage indicator shows distinct colors across the entire pH scale",
      "Turmeric turns reddish-brown in basic solutions (pH > 8.5)",
      "Natural indicators are extracted by boiling or crushing plant material in water",
      "Plant extract indicators are safe, inexpensive, and effective for pH testing"
    ],
    quizQuestions: [
      { question: "What pigment in red cabbage acts as an indicator?", options: ["Chlorophyll", "Carotene", "Anthocyanins", "Melanin"], correctIndex: 2 },
      { question: "What color does red cabbage indicator turn in a strong base?", options: ["Red", "Purple", "Green/Yellow", "Blue"], correctIndex: 2 },
      { question: "How is the plant indicator extracted?", options: ["Burning the plant", "Boiling in water", "Freezing", "Exposing to light"], correctIndex: 1 },
      { question: "Turmeric turns reddish-brown in:", options: ["Acids", "Neutral solutions", "Bases", "All solutions"], correctIndex: 2 },
      { question: "Why are plant extract indicators useful?", options: ["They are expensive", "They are toxic", "They are safe, cheap, and effective", "They work only in labs"], correctIndex: 2 }
    ]
  },
  {
    id: "neutralization",
    title: "Neutralization Reactions",
    icon: "⚗️💧",
    description: "Mix acids with bases and observe real-time pH changes and salt + water formation",
    overview: [
      "Neutralization is the reaction between an acid and a base to produce salt and water. It is one of the most fundamental reactions in chemistry.",
      "When hydrochloric acid (HCl) reacts with sodium hydroxide (NaOH), the H⁺ ions from the acid combine with OH⁻ ions from the base to form water (H₂O), while the remaining ions form sodium chloride (NaCl) — table salt.",
      "The pH changes dramatically during neutralization. Starting from a low pH (acidic), as base is added the pH rises. At the equivalence point, the pH reaches ~7 (neutral). Adding excess base pushes the pH above 7.",
      "This experiment lets you mix different acids and bases, observe the pH change in real-time, and visualize the molecular interactions as H⁺ and OH⁻ ions combine to form water molecules."
    ],
    howItWorks: [
      { step: 1, title: "Select Reactants", description: "Choose an acid and a base from the available options." },
      { step: 2, title: "Add Base Gradually", description: "Use the slider or pour button to slowly add the base to the acid solution." },
      { step: 3, title: "Observe pH Change", description: "Watch the pH scale and liquid color change as neutralization progresses." },
      { step: 4, title: "View Molecular Interactions", description: "Toggle the molecular view to see H⁺ and OH⁻ ions combining to form H₂O." },
      { step: 5, title: "Reach Equivalence Point", description: "Find the point where pH reaches ~7 — complete neutralization has occurred." }
    ],
    keyConcepts: [
      { title: "Neutralization Equation", description: "Acid + Base → Salt + Water. For example: HCl + NaOH → NaCl + H₂O" },
      { title: "Equivalence Point", description: "The point at which equal moles of acid and base have reacted, resulting in a neutral solution (pH ~7)." },
      { title: "Exothermic Reaction", description: "Neutralization releases heat energy. The temperature of the solution increases during the reaction." },
      { title: "Salt Formation", description: "The salt produced depends on the acid and base used. HCl + NaOH gives NaCl; H₂SO₄ + NaOH gives Na₂SO₄." },
      { title: "pH Titration Curve", description: "Plotting pH against volume of base added produces a characteristic S-shaped curve with a steep rise at the equivalence point." },
      { title: "Indicator Use in Titration", description: "Indicators like phenolphthalein are used to detect the equivalence point by changing color at a specific pH." }
    ],
    applications: [
      { title: "Antacids", description: "Antacid tablets contain bases (like Mg(OH)₂) that neutralize excess stomach acid to relieve heartburn." },
      { title: "Wastewater Treatment", description: "Industrial wastewater is neutralized before discharge to prevent environmental damage." },
      { title: "Soil pH Adjustment", description: "Lime (CaO) neutralizes acidic soil, while sulfur compounds neutralize basic soil." },
      { title: "Toothpaste", description: "Toothpaste is basic and neutralizes acids produced by mouth bacteria, preventing tooth decay." },
      { title: "Titration Analysis", description: "Neutralization titrations determine unknown acid/base concentrations in analytical chemistry." }
    ],
    summary: [
      "Neutralization is the reaction of an acid with a base to form salt and water",
      "The equivalence point occurs when equal moles of H⁺ and OH⁻ have reacted",
      "pH rises from acidic to neutral (~7) to basic as more base is added",
      "Neutralization is exothermic — it releases heat energy",
      "Applications include antacids, wastewater treatment, and titration analysis"
    ],
    quizQuestions: [
      { question: "What are the products of a neutralization reaction?", options: ["Acid and base", "Salt and water", "Gas and salt", "Only water"], correctIndex: 1 },
      { question: "What is the pH at the equivalence point of a strong acid–strong base neutralization?", options: ["0", "3", "7", "14"], correctIndex: 2 },
      { question: "Is neutralization exothermic or endothermic?", options: ["Endothermic", "Exothermic", "Neither", "Depends on the acid"], correctIndex: 1 },
      { question: "What salt is formed when HCl reacts with NaOH?", options: ["Na₂SO₄", "NaCl", "KCl", "CaCl₂"], correctIndex: 1 },
      { question: "Why do antacids relieve heartburn?", options: ["They add more acid", "They neutralize excess stomach acid", "They cool the stomach", "They absorb food"], correctIndex: 1 }
    ]
  }
];
