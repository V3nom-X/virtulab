export interface ForceEnergyExperiment {
  id: string;
  title: string;
  description: string;
  icon: string;
  overview: string[];
  howItWorks: { step: number; title: string; description: string }[];
  keyConcepts: { title: string; description: string }[];
  applications: { title: string; description: string }[];
  summary: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number }[];
}

export const forceEnergyExperiments: ForceEnergyExperiment[] = [
  {
    id: "sources-of-electricity",
    title: "Sources of Electricity",
    description: "Explore renewable and non-renewable electricity sources with interactive energy conversion simulations.",
    icon: "⚡",
    overview: [
      "This experiment allows learners to explore how electricity is generated from different sources — both renewable and non-renewable. Interact with batteries, generators, solar panels, wind turbines, and hydroelectric systems.",
      "Each station demonstrates a different energy conversion: chemical to electrical (batteries), mechanical to electrical (generators, wind, hydro), and light to electrical (solar panels).",
      "Adjust variables like voltage, rotation speed, light intensity, and water flow to observe real-time changes in electrical output."
    ],
    howItWorks: [
      { step: 1, title: "Select Energy Source", description: "Choose from battery, generator, solar panel, wind turbine, or hydroelectric system." },
      { step: 2, title: "Adjust Parameters", description: "Use sliders to change voltage, rotation speed, light intensity, or water flow rate." },
      { step: 3, title: "Observe Output", description: "Watch real-time voltage and current readings as energy is converted to electricity." },
      { step: 4, title: "Compare Sources", description: "Switch between sources to compare efficiency and output characteristics." },
      { step: 5, title: "Electron Flow View", description: "Toggle molecular view to see animated electron flow through circuits." }
    ],
    keyConcepts: [
      { title: "Energy Conversion", description: "Energy cannot be created or destroyed, only converted from one form to another. Batteries convert chemical energy, generators convert mechanical energy, and solar panels convert light energy into electrical energy." },
      { title: "Electromagnetic Induction", description: "Moving magnets relative to coils induces current in conductors. Faraday's Law explains the relationship between coil turns, magnetic flux, and induced EMF." },
      { title: "Photovoltaic Effect", description: "Absorption of photons excites electrons in semiconductors, producing electric current. Solar energy is converted directly to electrical energy." },
      { title: "Renewable vs Non-Renewable", description: "Renewable sources (solar, wind, hydro) are sustainable and environmentally friendly. Non-renewable sources (fossil fuels) are finite and produce pollution." },
      { title: "Energy Efficiency", description: "Energy losses occur through heat, friction, and incomplete conversion. Different sources have varying efficiency depending on environmental conditions." }
    ],
    applications: [
      { title: "Household Electricity", description: "Understanding batteries, generators, and solar panels explains how homes are powered." },
      { title: "Renewable Energy Planning", description: "Knowledge of solar, wind, and hydroelectric generation is essential for sustainable energy systems." },
      { title: "Industrial Applications", description: "Generators and turbines power factories, machinery, and large-scale electricity grids." },
      { title: "Portable Devices", description: "Batteries power electronics, mobile devices, and medical equipment." },
      { title: "Environmental Protection", description: "Understanding renewable energy encourages sustainable choices, reducing carbon footprints." }
    ],
    summary: [
      "Electricity can be generated from chemical, mechanical, light, and gravitational energy sources.",
      "Generators use electromagnetic induction to convert mechanical motion into electrical current.",
      "Solar panels use the photovoltaic effect to convert light directly into electricity.",
      "Renewable energy sources are sustainable and produce minimal environmental impact.",
      "Energy efficiency varies between sources and depends on environmental conditions."
    ],
    quizQuestions: [
      { question: "Which energy conversion occurs in a battery?", options: ["Light → Electrical", "Chemical → Electrical", "Mechanical → Electrical", "Thermal → Electrical"], correctIndex: 1 },
      { question: "What principle does a generator use to produce electricity?", options: ["Photovoltaic effect", "Electromagnetic induction", "Nuclear fission", "Thermoelectric effect"], correctIndex: 1 },
      { question: "Which is a renewable energy source?", options: ["Coal", "Natural gas", "Solar panels", "Diesel generators"], correctIndex: 2 },
      { question: "What does a solar panel convert?", options: ["Heat to electricity", "Light to electricity", "Wind to electricity", "Sound to electricity"], correctIndex: 1 },
      { question: "In a hydroelectric system, what form of energy does water possess before falling?", options: ["Kinetic energy", "Chemical energy", "Gravitational potential energy", "Thermal energy"], correctIndex: 2 }
    ]
  },
  {
    id: "flow-of-electric-current",
    title: "Flow of Electric Current",
    description: "Build series and parallel circuits, measure voltage and current, and visualize electron flow.",
    icon: "🔌",
    overview: [
      "This experiment helps learners understand how electric current flows through a circuit, how voltage, resistance, and current are interrelated (Ohm's Law), and how different components affect circuit behavior.",
      "Build series and parallel circuits on a virtual breadboard, add resistors, bulbs, and switches, then measure voltage and current with virtual instruments.",
      "Toggle electron-flow animations to visualize current at a microscopic level and see how resistance causes energy dissipation."
    ],
    howItWorks: [
      { step: 1, title: "Select Circuit Type", description: "Choose between series or parallel circuit configuration." },
      { step: 2, title: "Set Battery Voltage", description: "Adjust the voltage source that drives current through the circuit." },
      { step: 3, title: "Add Resistance", description: "Add resistors and observe how resistance affects current flow." },
      { step: 4, title: "Measure Values", description: "Read ammeter and voltmeter displays showing real-time circuit measurements." },
      { step: 5, title: "Toggle Electron View", description: "Visualize animated electrons flowing through conductors and components." }
    ],
    keyConcepts: [
      { title: "Electric Current", description: "The flow of electric charge (electrons) through a conductor, measured in amperes (A). Current flows from negative to positive terminal." },
      { title: "Voltage (Potential Difference)", description: "The driving force that pushes current through a circuit, measured in volts (V). Higher voltage means more current flow." },
      { title: "Resistance", description: "Opposition to the flow of current, measured in ohms (Ω). High resistance reduces current; low resistance increases it." },
      { title: "Ohm's Law", description: "V = I × R. Voltage equals current multiplied by resistance. This fundamental relationship governs all circuit behavior." },
      { title: "Series vs Parallel Circuits", description: "In series circuits, current is constant and voltage divides. In parallel circuits, voltage is constant and current divides among branches." },
      { title: "Energy Transformation", description: "Electrical energy is converted to light in bulbs, heat in resistors, and mechanical energy in motors." }
    ],
    applications: [
      { title: "Household Wiring", description: "Understanding current flow helps in safe installation of electrical circuits in homes." },
      { title: "Electronics Design", description: "Knowledge of current and resistance is fundamental in designing circuits for phones and computers." },
      { title: "Electrical Safety", description: "Understanding open/closed circuits and resistance aids in preventing shocks and short circuits." },
      { title: "Industrial Applications", description: "Electric current drives motors, conveyor belts, and machinery in factories." },
      { title: "Troubleshooting", description: "Enables identification of faulty circuits and understanding why components fail." }
    ],
    summary: [
      "Electric current is the flow of electrons through a conductor, measured in amperes.",
      "Voltage provides the driving force for current to flow through a circuit.",
      "Resistance opposes current flow and is measured in ohms.",
      "Ohm's Law (V = I × R) describes the relationship between voltage, current, and resistance.",
      "Series circuits have constant current; parallel circuits have constant voltage across branches."
    ],
    quizQuestions: [
      { question: "What is Ohm's Law?", options: ["P = IV", "V = IR", "E = mc²", "F = ma"], correctIndex: 1 },
      { question: "In a series circuit, what remains constant?", options: ["Voltage", "Current", "Resistance", "Power"], correctIndex: 1 },
      { question: "What unit is resistance measured in?", options: ["Amperes", "Volts", "Ohms", "Watts"], correctIndex: 2 },
      { question: "What happens to current when resistance increases (voltage constant)?", options: ["Increases", "Decreases", "Stays the same", "Doubles"], correctIndex: 1 },
      { question: "In a parallel circuit, what remains constant across branches?", options: ["Current", "Resistance", "Voltage", "Power"], correctIndex: 2 }
    ]
  },
  {
    id: "uses-of-electricity",
    title: "Uses of Electricity in Daily Life",
    description: "Explore how electrical energy powers household, school, and industrial appliances with energy conversion demos.",
    icon: "🏠",
    overview: [
      "This experiment helps learners explore how electrical energy is applied in households, schools, and industries. It demonstrates practical applications of electricity in everyday life.",
      "Interact with virtual appliances — lights, fans, heaters, refrigerators, and computers — to observe energy conversion from electrical to light, heat, mechanical, or sound energy.",
      "Measure energy consumption, optimize electricity use, and explore renewable energy integration for powering daily devices."
    ],
    howItWorks: [
      { step: 1, title: "Select Environment", description: "Choose between home, school, or workshop setting." },
      { step: 2, title: "Toggle Appliances", description: "Turn devices on and off to observe electricity consumption." },
      { step: 3, title: "Observe Conversions", description: "Watch animated energy transformations (electrical → light, heat, mechanical, sound)." },
      { step: 4, title: "Measure Consumption", description: "Read power ratings and calculate energy usage in kWh." },
      { step: 5, title: "Optimize Usage", description: "Try to reduce total energy consumption by selecting efficient alternatives." }
    ],
    keyConcepts: [
      { title: "Energy Transformation", description: "Light bulbs convert electrical to light + heat energy. Heaters convert to thermal energy. Fans convert to mechanical energy. Speakers convert to sound energy." },
      { title: "Power and Consumption", description: "Power (Watts) measures the rate of energy use. Energy consumption in kWh is calculated as Power × Time. This determines electricity bills." },
      { title: "Efficiency", description: "Energy loss occurs in heat, sound, or friction depending on the device. LED bulbs are more efficient than incandescent bulbs." },
      { title: "Safety Principles", description: "Overloading circuits, short circuits, and improper handling are unsafe. Insulation, circuit breakers, and fuses ensure safe electricity use." },
      { title: "Renewable Integration", description: "Solar-powered devices reduce reliance on the grid. Wind or hydroelectric-powered devices illustrate sustainable electricity use." }
    ],
    applications: [
      { title: "Household Management", description: "Understanding device consumption allows for better budgeting and energy-saving practices." },
      { title: "Energy Efficiency", description: "Identifying high-efficiency devices to reduce costs and environmental impact." },
      { title: "Renewable Integration", description: "Exploring solar panels, batteries, and wind turbines in powering household devices." },
      { title: "Health and Safety", description: "Demonstrates safe handling of electrical devices and preventive measures." },
      { title: "Sustainable Living", description: "Promotes awareness of reducing electricity waste and adopting renewable sources." }
    ],
    summary: [
      "Electricity powers everyday devices by converting electrical energy to light, heat, motion, or sound.",
      "Power is measured in watts; energy consumption is measured in kilowatt-hours (kWh).",
      "Energy-efficient appliances reduce costs and environmental impact.",
      "Circuit safety devices like fuses and breakers prevent overloading and fires.",
      "Renewable energy sources can supplement or replace grid electricity for daily use."
    ],
    quizQuestions: [
      { question: "What energy conversion occurs in a light bulb?", options: ["Electrical → Mechanical", "Electrical → Light + Heat", "Chemical → Electrical", "Light → Electrical"], correctIndex: 1 },
      { question: "What unit measures energy consumption?", options: ["Watts", "Amperes", "Kilowatt-hours (kWh)", "Volts"], correctIndex: 2 },
      { question: "Which appliance converts electrical energy to mechanical energy?", options: ["Light bulb", "Heater", "Fan", "Speaker"], correctIndex: 2 },
      { question: "What device protects circuits from overloading?", options: ["Resistor", "Fuse / Circuit breaker", "Capacitor", "Transformer"], correctIndex: 1 },
      { question: "Which is more energy-efficient?", options: ["Incandescent bulb", "LED bulb", "Halogen lamp", "Fluorescent tube"], correctIndex: 1 }
    ]
  }
];
