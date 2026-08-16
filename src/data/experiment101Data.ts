export interface Experiment101Parameter {
  name: string;
  controls: string;
}

export interface Experiment101 {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  subject: string;
  level: string;
  overview: string[];
  learningOutcomes: string[];
  howItWorks: { step: number; title: string; description: string }[];
  parameters: Experiment101Parameter[];
  procedure: string[];
  keyConcepts: { title: string; description: string }[];
  applications: { title: string; description: string }[];
  advantages: string[];
  summary: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number }[];
}

export const experiment101List: Experiment101[] = [
  {
    id: "remote-sensing",
    title: "Remote Sensing",
    subtitle: "Eyes in the Sky",
    description: "Operate a virtual satellite control room: choose platforms, sensors and bands to image Kenyan landscapes from space.",
    icon: "🛰️",
    subject: "Integrated Science / Geography — Earth and Space",
    level: "Junior Secondary (Grade 8–9) & Senior School",
    overview: [
      "Imagine checking on a maize farm in Bungoma, monitoring the water level of Lake Turkana, or spotting a wildfire in the Mau Forest — all without leaving your classroom. This is the everyday magic of remote sensing: gathering information about the Earth's surface using sensors mounted on satellites, aircraft or drones, without making physical contact with what is being studied.",
      "This module turns the simulator into a virtual satellite control room. You take the role of a remote-sensing analyst who captures, processes and interprets images of the Earth from space, connecting the results to real Kenyan contexts such as drought early warning, flood mapping and wildlife conservation.",
      "You do not simply read what remote sensing is — you discover it by manipulating variables, observing outcomes and interpreting the imagery you produce."
    ],
    learningOutcomes: [
      "Define remote sensing and explain how data is collected without physical contact.",
      "Distinguish between active sensors (radar) and passive sensors (optical, thermal infrared).",
      "Describe how altitude, spatial resolution and spectral band affect the images obtained.",
      "Explain at least three real-world applications of remote sensing relevant to Kenya."
    ],
    howItWorks: [
      { step: 1, title: "Choose a region", description: "Select a Kenyan region of interest — the Tana River basin, Turkana, Budalangi or the Maasai Mara ecosystem." },
      { step: 2, title: "Pick a platform", description: "A satellite in fixed orbit, an aeroplane, or a drone — each balances coverage area against image detail." },
      { step: 3, title: "Select a sensor", description: "Optical (visible light), infrared (heat and plant health), or radar (microwave pulses that see through cloud and darkness)." },
      { step: 4, title: "Set altitude and resolution", description: "Low altitude with high resolution gives sharp detail; high altitude with low resolution gives a wide, coarse overview." },
      { step: 5, title: "Capture and process", description: "Click Capture Image, then apply the NDVI filter to colour healthy vegetation green and stressed or bare land brown." },
      { step: 6, title: "Track change over time", description: "Advance the simulated calendar by 30, 60 and 90 days to watch seasonal change unfold." }
    ],
    parameters: [
      { name: "Platform type", controls: "Determines orbit height and coverage: satellite (wide, repeat coverage), aircraft (medium detail), or drone (very high detail, small area)." },
      { name: "Sensor type", controls: "Passive optical, passive infrared/thermal, or active radar — changes what the image reveals (colour, heat, or surface texture through cloud)." },
      { name: "Altitude (km)", controls: "Higher altitude widens the area covered (swath width) but reduces fine detail." },
      { name: "Spatial resolution (m/pixel)", controls: "Smaller numbers give sharper, more detailed images; larger numbers give broader, coarser images." },
      { name: "Spectral band", controls: "Visible, near-infrared, thermal-infrared or microwave — each band reveals different Earth features (vegetation, water, heat, moisture)." },
      { name: "Atmospheric condition", controls: "Clear sky, cloud cover or haze — tests how optical sensors are blocked by clouds while radar is not." },
      { name: "Revisit time (days)", controls: "How often the same location is re-imaged, important for tracking change such as flood spread or crop growth." }
    ],
    procedure: [
      "Select a Kenyan region of interest from the map menu (Turkana for drought, Budalangi for floods, Maasai Mara for wildlife).",
      "Choose a platform (satellite, aircraft or drone) and record its typical altitude range.",
      "Select a sensor type and spectral band suited to your question — for example thermal-infrared for fire hotspots.",
      "Set the atmospheric condition to 'cloudy' and attempt an optical capture; note what happens.",
      "Switch the sensor to radar and repeat the capture under the same cloudy condition; compare the two results.",
      "Apply the NDVI filter to a vegetation image and record which areas appear healthy (green) versus stressed (brown/red).",
      "Advance the simulated calendar by 30, 60 and 90 days, then write a short interpretation of what happened to the land."
    ],
    keyConcepts: [
      { title: "Passive vs Active Sensors", description: "Passive sensors record energy that already exists — reflected sunlight or emitted heat. Active sensors such as radar generate their own microwave pulses and measure what bounces back, so they work at night and through cloud." },
      { title: "Spatial Resolution", description: "Resolution is the ground size of one pixel. A 0.5 m/pixel drone image shows individual trees and rooftops; a 250 m/pixel satellite image shows only regional patterns such as drought-stressed districts." },
      { title: "Spectral Bands", description: "Different wavelengths reveal different things. Visible light shows what the eye sees, near-infrared reveals plant vigour, thermal-infrared exposes heat sources such as fires, and microwaves penetrate cloud and detect soil moisture." },
      { title: "NDVI (Normalised Difference Vegetation Index)", description: "NDVI = (NIR − Red) / (NIR + Red). Healthy leaves reflect a lot of near-infrared and absorb red light, so high NDVI means vigorous vegetation while low NDVI means stressed, bare or built-up land." },
      { title: "Swath Width and Revisit Time", description: "Higher orbits see a wider swath, so the same place is revisited more often — a trade-off between detail and how frequently change can be monitored." },
      { title: "Ground Truthing", description: "Satellite interpretations must be checked against field measurements. Remote sensing narrows down where to look; people on the ground confirm what is actually there." }
    ],
    applications: [
      { title: "Drought early warning", description: "Kenya's National Drought Management Authority uses satellite NDVI data to detect vegetation stress months before a visible famine, guiding relief distribution." },
      { title: "Flood mapping", description: "Radar satellites see through storm clouds to map flooded areas along the Tana and Nzoia rivers, helping responders plan evacuation routes." },
      { title: "Wildlife conservation", description: "High-resolution imagery and drones help count wildlife and detect illegal grazing or poaching camps in the Maasai Mara and Tsavo." },
      { title: "Precision agriculture", description: "Farmers use NDVI maps to spot under-performing patches of a field and target fertiliser or irrigation only where it is needed." },
      { title: "Forest and fire monitoring", description: "Thermal sensors detect fire hotspots in the Mau and Aberdare forests and track deforestation year on year." },
      { title: "Urban planning", description: "Repeat imagery of Nairobi and other towns shows how settlements expand, guiding roads, water and sanitation planning." }
    ],
    advantages: [
      "Covers vast or inaccessible areas quickly and safely.",
      "Provides repeated, consistent measurements for tracking change over time.",
      "Radar and thermal sensors work at night and through cloud cover.",
      "Cheaper than repeated ground surveys over large regions.",
      "Supports early warning, so decisions can be made before a crisis becomes visible."
    ],
    summary: [
      "Remote sensing gathers information about the Earth without physical contact, using satellites, aircraft or drones.",
      "Passive sensors record existing energy; active radar sensors emit their own pulses and can see through cloud.",
      "Altitude, spatial resolution and spectral band together determine what an image can reveal.",
      "NDVI turns near-infrared and red reflectance into a direct measure of vegetation health.",
      "Kenyan applications include drought early warning, flood mapping, wildlife conservation and urban planning."
    ],
    quizQuestions: [
      { question: "What makes radar an active sensor?", options: ["It records reflected sunlight", "It sends out its own microwave pulses and measures the return", "It measures emitted heat only", "It uses a camera lens"], correctIndex: 1 },
      { question: "Which setting gives the most detailed image of a single farm?", options: ["Satellite at high altitude, 250 m/pixel", "Drone at low altitude, 0.5 m/pixel", "Aircraft at high altitude, 30 m/pixel", "Satellite with microwave band"], correctIndex: 1 },
      { question: "Give a reason radar is more useful than an optical camera during Kenya's rainy season.", options: ["It produces colour photographs", "It works through cloud cover and at night", "It is cheaper to launch", "It has better spatial resolution always"], correctIndex: 1 },
      { question: "What does a low NDVI value indicate?", options: ["Dense, healthy vegetation", "Stressed, bare or built-up land", "Deep clear water only", "High cloud cover"], correctIndex: 1 },
      { question: "Which is a disadvantage of monitoring Maasai Mara wildlife by satellite rather than rangers on foot?", options: ["It cannot cover large areas", "It cannot identify individual animals or behaviour reliably", "It is slower than walking", "It only works at night"], correctIndex: 1 }
    ]
  },
  {
    id: "curved-mirrors",
    title: "Curved Mirrors",
    subtitle: "The Physics of Reflection",
    description: "Trace principal rays on concave and convex mirrors and watch real and virtual images form as you move the object.",
    icon: "🪞",
    subject: "Integrated Science / Physics — Light and Reflection",
    level: "Junior Secondary (Grade 8–9) & Senior School",
    overview: [
      "Curved mirrors are everywhere in Kenyan daily life — the wide-angle mirror at a supermarket entrance, the make-up mirror that magnifies a face, the headlamp reflector that throws a beam far down a dark road. Every one of these depends on how a curved surface bends the path of reflected light.",
      "In this simulation you build ray diagrams yourself. You choose a concave (converging) or convex (diverging) mirror, set the focal length, and slide a luminous object along the principal axis while the simulator draws the principal rays and locates the image in real time.",
      "The numbers on screen are computed from the mirror formula 1/f = 1/u + 1/v and magnification m = −v/u, so what you see agrees exactly with what you calculate on paper."
    ],
    learningOutcomes: [
      "Distinguish concave (converging) from convex (diverging) mirrors and their ray behaviour.",
      "Draw and interpret principal rays to locate an image.",
      "Use the mirror formula and magnification formula to predict image position, size and orientation.",
      "Classify images as real or virtual, upright or inverted, magnified or diminished.",
      "Relate mirror behaviour to real devices such as headlamps, security mirrors and dental mirrors."
    ],
    howItWorks: [
      { step: 1, title: "Choose mirror type", description: "Switch between a concave mirror that converges rays and a convex mirror that diverges them." },
      { step: 2, title: "Set the focal length", description: "The focal length is half the radius of curvature; changing it moves F and C along the axis." },
      { step: 3, title: "Position the object", description: "Slide the object from beyond C, through C, between C and F, and inside F, and watch the image change." },
      { step: 4, title: "Read the ray diagram", description: "The parallel ray, the focal ray and the centre ray are drawn automatically, with dashed lines for virtual rays." },
      { step: 5, title: "Compare with the formula", description: "Image distance, magnification and image nature are displayed and updated live from the mirror equation." }
    ],
    parameters: [
      { name: "Mirror type", controls: "Concave (converging) or convex (diverging) — determines whether rays meet to form a real image or spread apart to form a virtual image." },
      { name: "Focal length (cm)", controls: "Distance from the pole to the principal focus; shorter focal lengths curve the mirror more strongly." },
      { name: "Radius of curvature (cm)", controls: "Equal to twice the focal length; represents the radius of the sphere the mirror's surface is cut from." },
      { name: "Object distance (cm)", controls: "How far the object sits from the pole of the mirror; the single biggest control on image nature." },
      { name: "Object height (cm)", controls: "Sets the size of the object so magnification can be seen directly as image height." },
      { name: "Ray display", controls: "Toggles the parallel, focal and centre principal rays plus the dashed virtual-ray extensions." }
    ],
    procedure: [
      "Select the concave mirror and set the focal length to 12 cm.",
      "Place the object beyond the centre of curvature and record the image position, size and orientation.",
      "Move the object to exactly C, then between C and F, and record the image in each case.",
      "Move the object inside the focal length and note that the image becomes virtual, upright and magnified.",
      "Switch to the convex mirror and repeat the sweep — note that the image is always virtual, upright and diminished.",
      "For an object 30 cm from a mirror of focal length 12 cm, calculate v using 1/f = 1/u + 1/v, then verify with the simulator."
    ],
    keyConcepts: [
      { title: "Laws of Reflection", description: "The angle of incidence equals the angle of reflection, and the incident ray, reflected ray and normal all lie in the same plane. On a curved mirror the normal points along the radius at the point of incidence." },
      { title: "Principal Focus and Focal Length", description: "Rays parallel to the principal axis converge at F on a concave mirror, or appear to diverge from F behind a convex mirror. The focal length f equals half the radius of curvature R." },
      { title: "The Mirror Formula", description: "1/f = 1/u + 1/v links focal length, object distance and image distance. A positive v means a real image in front of the mirror; a negative v means a virtual image behind it." },
      { title: "Magnification", description: "m = −v/u = image height / object height. A negative m means the image is inverted; |m| > 1 means it is magnified." },
      { title: "Real vs Virtual Images", description: "Real images are formed where reflected rays actually meet and can be caught on a screen. Virtual images form where rays only appear to come from and cannot be projected." },
      { title: "Image Positions for a Concave Mirror", description: "Beyond C: real, inverted, diminished. At C: real, inverted, same size. Between C and F: real, inverted, magnified. At F: no image (rays parallel). Inside F: virtual, upright, magnified." }
    ],
    applications: [
      { title: "Vehicle headlamps and torches", description: "A bulb placed at the focus of a concave reflector produces a strong parallel beam that lights the road far ahead." },
      { title: "Security and shop mirrors", description: "Convex mirrors installed in shops and banks let one mirror monitor a wide area, an important loss-prevention tool for small businesses." },
      { title: "Dental and shaving mirrors", description: "Concave mirrors magnify close-up objects, helping dentists see inside a patient's mouth and people see their faces clearly." },
      { title: "Vehicle side mirrors", description: "Convex side mirrors widen the field of view, which is why they carry the warning that objects are closer than they appear." },
      { title: "Solar cookers and concentrators", description: "Large concave reflectors focus sunlight onto a pot or receiver, a practical clean-cooking technology in sunny regions." },
      { title: "Reflecting telescopes", description: "A large concave primary mirror gathers faint starlight and brings it to a focus for imaging." }
    ],
    advantages: [
      "Ray diagrams can be built and rebuilt instantly without a darkened laboratory.",
      "Every configuration is safe — no risk of concentrated sunlight or broken glass.",
      "Numerical answers appear alongside the diagram, linking drawing to calculation.",
      "Extreme cases (object exactly at F, very short focal lengths) can be explored freely.",
      "Learners can repeat the experiment at home on a phone or laptop."
    ],
    summary: [
      "Concave mirrors converge light; convex mirrors diverge it.",
      "Focal length is half the radius of curvature.",
      "The mirror formula 1/f = 1/u + 1/v predicts image distance for any object position.",
      "Magnification m = −v/u tells you both size and orientation of the image.",
      "Convex mirrors always give virtual, upright, diminished images — ideal for wide fields of view."
    ],
    quizQuestions: [
      { question: "A concave mirror has a focal length of 12 cm and the object is 30 cm away. What is the image distance?", options: ["20 cm", "8.6 cm", "42 cm", "−20 cm"], correctIndex: 0 },
      { question: "What kind of image does a convex mirror always form?", options: ["Real, inverted, magnified", "Virtual, upright, diminished", "Real, upright, same size", "Virtual, inverted, magnified"], correctIndex: 1 },
      { question: "Where must a bulb be placed in a torch reflector to give a parallel beam?", options: ["At the centre of curvature", "At the principal focus", "Touching the mirror pole", "Beyond the centre of curvature"], correctIndex: 1 },
      { question: "An object is placed between F and the pole of a concave mirror. The image is:", options: ["Real and inverted", "Virtual, upright and magnified", "Virtual and diminished", "No image forms"], correctIndex: 1 },
      { question: "If the radius of curvature is 40 cm, the focal length is:", options: ["80 cm", "40 cm", "20 cm", "10 cm"], correctIndex: 2 }
    ]
  },
  {
    id: "pure-and-impure-substances",
    title: "Pure and Impure Substances",
    subtitle: "Testing for Purity",
    description: "Heat samples to compare sharp and depressed melting points, and run paper chromatography to calculate Rf values.",
    icon: "⚗️",
    subject: "Integrated Science / Chemistry — Matter",
    level: "Junior Secondary (Grade 8–9)",
    overview: [
      "Is that bottle of cooking oil, that sachet of salt, or that tablet of medicine actually what the label says? Chemists answer this question with purity tests, and two of the simplest are melting-point determination and paper chromatography.",
      "A pure substance melts sharply at one fixed temperature and boils at one fixed temperature. An impurity lowers and broadens the melting point and raises the boiling point, so the thermometer itself becomes a detector of contamination.",
      "In this simulation you load a virtual test tube with a substance, choose how much impurity to add, heat it, and watch a live temperature-versus-time curve. You can then switch to chromatography mode and separate a mixture into its component spots."
    ],
    learningOutcomes: [
      "Define a pure substance and distinguish it from a mixture or impure sample.",
      "Explain how impurities depress and broaden melting points and elevate boiling points.",
      "Read and interpret a heating curve, identifying the melting plateau.",
      "Carry out virtual paper chromatography and calculate Rf values.",
      "Relate purity testing to food safety, medicine and fuel quality in Kenya."
    ],
    howItWorks: [
      { step: 1, title: "Load a sample", description: "Choose a substance such as ice/water, candle wax, salt or a pharmaceutical powder for the virtual test tube." },
      { step: 2, title: "Add impurity", description: "Set the impurity level from 0% (pure) up to a heavily contaminated sample." },
      { step: 3, title: "Heat steadily", description: "Start the burner and watch the temperature climb while the heating curve is plotted in real time." },
      { step: 4, title: "Read the plateau", description: "A pure sample gives a flat, sharp plateau at one temperature; an impure one melts lower and over a range." },
      { step: 5, title: "Run chromatography", description: "Switch modes, spot the sample on paper, let the solvent rise, and measure how far each component travels." },
      { step: 6, title: "Calculate Rf", description: "Rf = distance moved by the spot ÷ distance moved by the solvent front, calculated for each separated component." }
    ],
    parameters: [
      { name: "Substance identity", controls: "Choice of pure or deliberately impure sample loaded into the virtual test tube." },
      { name: "Impurity level (%)", controls: "How much contaminant is mixed in — raises the melting range and depresses the melting point." },
      { name: "Heating rate (°C/s)", controls: "How fast the burner supplies energy, changing the slope of the heating curve." },
      { name: "Mode", controls: "Melting-point testing or paper chromatography separation." },
      { name: "Solvent type", controls: "Water or ethanol — different solvents move components different distances up the paper." },
      { name: "Spot size and distance travelled", controls: "Used to calculate the Rf value, which identifies and compares components in a mixture." }
    ],
    procedure: [
      "Load a pure sample, set impurity to 0% and heat it; record the exact melting temperature and note the flat plateau.",
      "Reset, set the impurity level to 10%, and repeat; record the new melting point and the width of the melting range.",
      "Repeat at 25% impurity and tabulate melting point against impurity level.",
      "Plot or inspect the curves and describe the trend you observe.",
      "Switch to chromatography mode and spot a mixture on the baseline.",
      "Run the solvent and measure the distance travelled by the solvent front and by each spot.",
      "Calculate the Rf value for each component and use it to say how many substances the sample contained."
    ],
    keyConcepts: [
      { title: "Pure Substances", description: "A pure substance contains only one kind of particle — an element or a single compound. It has fixed physical constants: one melting point, one boiling point and one density." },
      { title: "Melting Point Depression", description: "Impurity particles disrupt the regular crystal lattice, so less energy is needed to break it apart. The sample therefore melts at a lower temperature and over a range rather than at a single point." },
      { title: "Boiling Point Elevation", description: "Dissolved impurities lower the vapour pressure of a liquid, so a higher temperature is needed before boiling begins — the reason salted water boils above 100 °C." },
      { title: "Heating Curves", description: "During a change of state the temperature stops rising while energy goes into breaking bonds. A sharp flat plateau signals purity; a sloping, smeared plateau signals a mixture." },
      { title: "Paper Chromatography", description: "Components of a mixture travel up the paper at different rates depending on how strongly they are attracted to the paper versus the solvent, separating into distinct spots." },
      { title: "Rf Value", description: "Rf = distance moved by the component ÷ distance moved by the solvent front. It is always between 0 and 1 and, for a fixed solvent and paper, is characteristic of the substance." }
    ],
    applications: [
      { title: "Food safety", description: "Regulators test cooking fat, sugar and salt for adulteration; a depressed melting point is a quick red flag for contamination." },
      { title: "Pharmaceutical quality control", description: "Drug manufacturers confirm every batch melts sharply at the documented temperature before release, protecting patients from counterfeit medicine." },
      { title: "Fuel quality assurance", description: "Petrol stations and regulators test fuel purity so vehicles run efficiently and engines are not damaged by contaminated fuel." },
      { title: "Forensic science", description: "Chromatography separates the dyes in ink or the components of an unknown powder found at a crime scene, helping detect forged documents." },
      { title: "Water treatment", description: "Purity testing confirms that treated water has had dissolved and suspended contaminants removed before distribution." },
      { title: "Agricultural inputs", description: "Fertiliser and pesticide purity checks ensure farmers get the concentration they paid for." }
    ],
    advantages: [
      "Purity can be tested without expensive laboratory glassware or reagents.",
      "Dangerous heating and volatile solvents are avoided entirely.",
      "Experiments can be repeated instantly at any impurity level.",
      "The heating curve is plotted automatically, so learners focus on interpretation.",
      "Rf calculations are checked immediately, reinforcing the arithmetic."
    ],
    summary: [
      "A pure substance melts at one sharp, fixed temperature; an impure one melts lower and over a range.",
      "Impurities depress melting points and elevate boiling points.",
      "A heating curve's plateau is the direct evidence of a change of state.",
      "Chromatography separates mixtures because components travel at different rates up the paper.",
      "Rf = distance moved by spot ÷ distance moved by solvent front, and identifies components."
    ],
    quizQuestions: [
      { question: "How does a pure substance behave differently from an impure one when heated?", options: ["It melts over a wide range", "It melts sharply at one fixed temperature", "It never melts", "It melts at a lower temperature"], correctIndex: 1 },
      { question: "Adding salt to water makes it boil:", options: ["Below 100 °C", "Above 100 °C", "Exactly at 100 °C", "It stops boiling"], correctIndex: 1 },
      { question: "A chromatography sample produces three separate spots. This tells you the sample:", options: ["Is a pure substance", "Contains at least three components", "Has an Rf of 3", "Is insoluble"], correctIndex: 1 },
      { question: "A spot travels 4 cm while the solvent front travels 8 cm. The Rf value is:", options: ["2.0", "0.5", "4.0", "32"], correctIndex: 1 },
      { question: "A disadvantage of melting-point testing imported cooking fat is that it:", options: ["Requires no equipment", "Identifies the contaminant by name", "Shows impurity is present but not what it is", "Destroys the whole consignment"], correctIndex: 2 }
    ]
  },
  {
    id: "temporary-and-permanent-changes",
    title: "Temporary and Permanent Changes",
    subtitle: "Reversible and Irreversible Reactions",
    description: "Run everyday processes forward, then try to reverse them — and discover which changes create entirely new substances.",
    icon: "🔥",
    subject: "Integrated Science / Chemistry — Matter and Change",
    level: "Junior Secondary (Grade 7–9)",
    overview: [
      "Melting ice can be refrozen. Burnt paper can never be un-burnt. This everyday difference is the boundary between a temporary (physical, reversible) change and a permanent (chemical, irreversible) change, and it is one of the most useful ideas in chemistry.",
      "In this simulation you select a process, run it forward, then press Reverse and see whether the substance can come back. Reversible processes return neatly to their starting state; permanent ones refuse, and the simulator explains what new substance was formed instead.",
      "Each process is drawn from ordinary Kenyan life — boiling water for chai, rusting iron sheets, cooking an egg, ripening a banana, burning firewood."
    ],
    learningOutcomes: [
      "Define temporary (physical) and permanent (chemical) changes and give examples of each.",
      "Identify the signs of a chemical change: new substance, colour change, gas released, heat or light given out, and irreversibility.",
      "Classify everyday Kenyan processes correctly as temporary or permanent.",
      "Explain why energy is absorbed or released during changes of state and reactions."
    ],
    howItWorks: [
      { step: 1, title: "Select a process", description: "Choose melting ice, dissolving salt, boiling water, burning paper, rusting iron, cooking an egg or ripening fruit." },
      { step: 2, title: "Apply the condition", description: "Add heat, add water, expose to air or let time pass, depending on what the process needs." },
      { step: 3, title: "Watch the change", description: "The animated sample changes state, colour or texture as the process runs forward." },
      { step: 4, title: "Attempt reversal", description: "Press Reverse: cool it, evaporate the water, or wait. Only temporary changes come back." },
      { step: 5, title: "Read the verdict", description: "A panel names the change type, lists the observed evidence, and identifies any new substances formed." }
    ],
    parameters: [
      { name: "Process selected", controls: "Which everyday change is loaded into the virtual workspace." },
      { name: "Temperature (°C)", controls: "Heat supplied or removed — drives melting, boiling, freezing and cooking." },
      { name: "Time elapsed", controls: "Slow changes such as rusting and ripening need simulated days rather than seconds." },
      { name: "Exposure to air/moisture", controls: "Oxygen and water availability, which controls whether rusting can occur at all." },
      { name: "Reverse attempt", controls: "Applies the opposite condition to test whether the original substance can be recovered." },
      { name: "Evidence overlay", controls: "Highlights the signs of chemical change — gas bubbles, colour change, heat and light." }
    ],
    procedure: [
      "Select 'melting ice', heat it until it melts, then reverse by cooling; record whether the ice returns.",
      "Select 'dissolving salt', dissolve it, then evaporate the water and note that the salt crystals are recovered unchanged.",
      "Select 'burning paper', run it, then attempt reversal; record what happened and what new substances formed.",
      "Select 'rusting iron' and advance the time slider over several simulated days, with and without moisture.",
      "Select 'cooking an egg' and attempt to reverse it by cooling.",
      "Tabulate all processes as temporary or permanent, listing the evidence you used for each classification."
    ],
    keyConcepts: [
      { title: "Temporary (Physical) Change", description: "Only the physical form changes — state, shape or size. No new substance is made, the mass is unchanged, and the original substance can be recovered. Melting, freezing, boiling, condensing and dissolving are examples." },
      { title: "Permanent (Chemical) Change", description: "New substances with new properties are formed and the original cannot normally be recovered. Burning, rusting, cooking, fermenting and ripening are examples." },
      { title: "Signs of a Chemical Change", description: "A permanent colour change, a gas given off, a precipitate formed, heat or light released or absorbed, and an odour change all suggest that a chemical reaction has occurred." },
      { title: "Energy in Changes", description: "Exothermic changes such as burning and rusting release energy; endothermic changes such as melting and evaporating absorb it. Changes of state absorb or release latent heat without a temperature change." },
      { title: "Rusting as Slow Oxidation", description: "Iron + oxygen + water → hydrated iron(III) oxide. It is slow, but it is still chemical: the rust is a genuinely new substance that cannot be turned back into iron by drying it." },
      { title: "Conservation of Mass", description: "In both types of change the total mass is conserved. Burnt paper seems lighter only because carbon dioxide and water vapour escaped into the air." }
    ],
    applications: [
      { title: "Food preservation", description: "Freezing and drying are temporary changes that preserve food without altering it, while fermenting milk into mursik is a deliberate permanent change." },
      { title: "Cooking", description: "Boiling water is temporary; frying an egg or roasting maize is permanent, which is why cooked food cannot be returned to its raw state." },
      { title: "Construction and metalwork", description: "Understanding rusting drives the use of galvanised iron sheets and paint to protect roofs and gates from permanent corrosion." },
      { title: "Agriculture", description: "Understanding ripening as a chemical process helps farmers time the harvest and transport of bananas and mangoes for maximum freshness at market." },
      { title: "Fireworks and welding", description: "Controlled permanent chemical reactions release the light, heat or bonding needed for celebrations and construction." },
      { title: "Recycling", description: "Melting plastic or metal is a temporary change, which is exactly why these materials can be reshaped and reused many times." }
    ],
    advantages: [
      "Slow changes such as rusting and ripening can be observed in seconds instead of weeks.",
      "Burning and hot cooking are explored with zero risk of injury.",
      "Reversal can be attempted repeatedly, which is impossible in a real lab.",
      "The evidence overlay teaches learners what to look for, not just what to remember.",
      "No consumables are used, so the whole class can experiment."
    ],
    summary: [
      "Temporary changes alter only physical form and are reversible; no new substance is formed.",
      "Permanent changes form new substances and cannot normally be reversed.",
      "Colour change, gas release, heat or light, and irreversibility are the key signs of a chemical change.",
      "Rusting is permanent even though it is slow, because a genuinely new compound is produced.",
      "Mass is conserved in every change, whether temporary or permanent."
    ],
    quizQuestions: [
      { question: "Which of these is a temporary change?", options: ["Burning firewood", "Dissolving salt in water", "Cooking an egg", "Rusting of an iron sheet"], correctIndex: 1 },
      { question: "Which observation is the strongest evidence of a chemical change?", options: ["The substance changed shape", "A new substance with new properties formed", "The substance got colder", "The substance was cut in half"], correctIndex: 1 },
      { question: "Why is rusting classified as permanent even though it is slow?", options: ["It takes many days", "A new compound, hydrated iron oxide, is formed", "It only happens outdoors", "The iron gets lighter"], correctIndex: 1 },
      { question: "Burnt paper appears to lose mass because:", options: ["Mass is destroyed", "Gases escape into the air", "Carbon is heavier than ash", "The paper shrinks"], correctIndex: 1 },
      { question: "Which kitchen pair correctly matches temporary then permanent?", options: ["Melting fat, then boiling water", "Boiling water, then frying an egg", "Frying an egg, then baking bread", "Rusting a pan, then burning toast"], correctIndex: 1 }
    ]
  },
  {
    id: "classes-of-fire",
    title: "Classes of Fire",
    subtitle: "Fighting Fire Safely",
    description: "Match the right extinguisher to each class of fire and see what happens when the wrong agent is chosen.",
    icon: "🧯",
    subject: "Integrated Science — Safety and Chemistry",
    level: "Junior Secondary (Grade 7–9) & Senior School",
    overview: [
      "Throwing water on a burning pan of cooking oil or on live electrical wiring does not put the fire out — it makes it far more dangerous. Knowing which extinguisher matches which fire is a life-saving skill, and it belongs to everyone, not just firefighters.",
      "This simulation lets you start a fire safely, choose an extinguishing agent, and watch what actually happens. Correct choices bring the flames down steadily; wrong choices produce a flare-up, a steam explosion, or an electrocution warning, with a clear explanation of why.",
      "A fire-triangle panel shows which of heat, fuel or oxygen your chosen agent removed — the underlying principle behind every extinguisher."
    ],
    learningOutcomes: [
      "Name the classes of fire (A, B, C, D, F/K) and the fuel each involves.",
      "Match each class of fire to the correct extinguishing agent.",
      "Explain the fire triangle and how each extinguisher removes one of its sides.",
      "Predict the dangerous outcome of using the wrong agent.",
      "Describe safe evacuation practice and when not to fight a fire at all."
    ],
    howItWorks: [
      { step: 1, title: "Choose a fuel", description: "Wood/paper, petrol/solvent, live electrical equipment, reactive metal, or hot cooking oil." },
      { step: 2, title: "Ignite the fire", description: "The simulated fire grows, and the class label (A, B, C, D or F) is identified for you." },
      { step: 3, title: "Select an agent", description: "Water, foam, carbon dioxide, dry powder, wet chemical, or a fire blanket." },
      { step: 4, title: "Apply it", description: "Watch the flames either shrink and go out, or flare up dangerously with a hazard warning." },
      { step: 5, title: "Check the fire triangle", description: "The panel highlights which element — heat, fuel or oxygen — was removed, or explains why the attempt failed." }
    ],
    parameters: [
      { name: "Fuel type", controls: "Wood/paper, petrol/solvent, live electrical equipment, reactive metal, or hot cooking oil — the actual material burning." },
      { name: "Fire class", controls: "Automatically identified from the fuel: A, B, C, D or F/K." },
      { name: "Extinguishing agent", controls: "Water, foam, CO2, dry powder, wet chemical or fire blanket — each removes a different side of the fire triangle." },
      { name: "Fire size", controls: "How developed the fire is, which affects whether fighting it is safe or evacuation is the correct action." },
      { name: "Ventilation / oxygen supply", controls: "Airflow feeding the fire, showing why smothering works and why opening doors can worsen a blaze." },
      { name: "Response time (s)", controls: "How quickly action is taken — delays let a small fire grow beyond what an extinguisher can handle." }
    ],
    procedure: [
      "Start a Class A wood/paper fire and extinguish it with water; note how quickly the flames die.",
      "Start a Class B petrol fire and try water first; record the dangerous spreading you observe, then use foam.",
      "Start a Class C live electrical fire and try water; note the electrocution warning, then use CO2 or dry powder.",
      "Start a Class D reactive metal fire and confirm that only special dry powder is effective.",
      "Start a Class F cooking-oil fire; try water and observe the steam explosion, then use a wet chemical extinguisher or fire blanket.",
      "Tabulate every fuel with its class, its correct agent, and the fire-triangle element that agent removes."
    ],
    keyConcepts: [
      { title: "The Fire Triangle", description: "Fire needs heat, fuel and oxygen. Remove any one side and the fire goes out: water cools the heat away, a blanket or foam smothers the oxygen, and dry powder interrupts the chemical reaction itself." },
      { title: "Class A — Ordinary Combustibles", description: "Wood, paper, cloth and dry vegetation. Water and foam work well because cooling below the ignition temperature stops the fire." },
      { title: "Class B — Flammable Liquids", description: "Petrol, diesel, paraffin and solvents. Water spreads burning liquid, so foam, CO2 or dry powder must be used to smother it." },
      { title: "Class C — Electrical Fires", description: "Live wiring and appliances. Water conducts electricity and risks electrocution; CO2 and dry powder are non-conductive and safe." },
      { title: "Class D — Reactive Metals", description: "Magnesium, sodium and similar metals burn ferociously and react violently with water. Only specialised dry powder agents are safe." },
      { title: "Class F/K — Cooking Oils and Fats", description: "Hot oil is far above the boiling point of water, so water instantly turns to steam and throws burning oil into the air. Wet chemical extinguishers or a fire blanket are correct." }
    ],
    applications: [
      { title: "School and home safety", description: "Every classroom, kitchen and workshop should carry an extinguisher matched to the risks in that room." },
      { title: "Kitchen fire response", description: "Knowing to smother a burning sufuria of oil with a lid or blanket instead of throwing water prevents catastrophic burns." },
      { title: "Vehicle and fuel station safety", description: "Petrol stations across Kenya are required by law to keep foam or dry powder extinguishers on site because water cannot safely put out a fuel fire." },
      { title: "Electrical workshops", description: "CO2 extinguishers are placed near switchboards and server rooms because they leave no residue and do not conduct." },
      { title: "Industrial and laboratory settings", description: "Laboratories storing reactive metals must stock Class D powder, not the general-purpose extinguisher." },
      { title: "Community fire drills", description: "Practising extinguisher choice and evacuation routes reduces panic and injury during real incidents." }
    ],
    advantages: [
      "Saves lives by ensuring the correct, safe response instead of a dangerous guess.",
      "Lets learners experience the consequences of wrong choices without any real risk.",
      "Builds confidence to act quickly in the first critical seconds of a fire.",
      "Reduces property damage by matching the agent to the fuel.",
      "Reinforces when the safest action is to evacuate and call for help rather than fight."
    ],
    summary: [
      "Fire needs heat, fuel and oxygen; removing any one extinguishes it.",
      "Class A is ordinary combustibles, B flammable liquids, C electrical, D reactive metals, F cooking oils.",
      "Water is only safe on Class A fires.",
      "CO2 and dry powder are safe on electrical fires because they do not conduct electricity.",
      "A cooking-oil fire must be smothered with a blanket or wet chemical agent — never water."
    ],
    quizQuestions: [
      { question: "Which class of fire involves flammable liquids such as petrol?", options: ["Class A", "Class B", "Class C", "Class F"], correctIndex: 1 },
      { question: "Why must water never be used on a live electrical fire?", options: ["It is too cold", "Water conducts electricity and risks electrocution", "It smells bad", "It removes fuel too fast"], correctIndex: 1 },
      { question: "What happens when water is thrown on burning cooking oil?", options: ["The fire goes out immediately", "The water instantly turns to steam and throws burning oil outward", "The oil solidifies", "Nothing at all"], correctIndex: 1 },
      { question: "Which side of the fire triangle does a fire blanket remove?", options: ["Heat", "Fuel", "Oxygen", "Light"], correctIndex: 2 },
      { question: "In which situation should you evacuate instead of fighting the fire?", options: ["A small waste-bin fire", "The fire is larger than you, blocking your exit, or spreading fast", "A candle has fallen over", "Any Class A fire"], correctIndex: 1 }
    ]
  },
  {
    id: "plant-and-animal-cell",
    title: "Plant and Animal Cell",
    subtitle: "Journey Into the Building Blocks of Life",
    description: "Zoom into plant and animal cells, click each organelle to learn its function, and test yourself with a labelling exercise.",
    icon: "🔬",
    subject: "Integrated Science / Biology — Living Things",
    level: "Junior Secondary (Grade 7–9)",
    overview: [
      "Every living thing in Kenya — the acacia on the savannah, the tilapia in Lake Victoria, and you — is built from cells. The cell is the smallest unit that can be called alive, and although plant and animal cells share most of their machinery, three structures set them apart.",
      "This simulation is a virtual microscope. You switch between a plant cell and an animal cell, adjust magnification, click any organelle to read its function, and use comparison mode to highlight exactly what differs.",
      "A labelling exercise then hides the names and asks you to place them correctly, giving instant feedback so you can self-test before an assessment."
    ],
    learningOutcomes: [
      "Identify the main organelles of plant and animal cells and state their functions.",
      "Describe the three key differences: cell wall, chloroplasts and the large permanent vacuole.",
      "Explain how organelle structure relates to its function.",
      "Use a virtual microscope with appropriate magnification.",
      "Relate cell structure to real applications such as agriculture, medicine and biotechnology."
    ],
    howItWorks: [
      { step: 1, title: "Choose a cell", description: "Switch between the plant cell and the animal cell view." },
      { step: 2, title: "Adjust magnification", description: "Zoom from a whole-tissue view down to a single cell and its internal detail." },
      { step: 3, title: "Explore organelles", description: "Click any labelled structure to open a card describing what it does and why its shape suits its job." },
      { step: 4, title: "Compare", description: "Comparison mode highlights the cell wall, chloroplasts and large vacuole present only in plant cells." },
      { step: 5, title: "Test yourself", description: "The labelling exercise hides all names and scores your placements with instant feedback." }
    ],
    parameters: [
      { name: "Cell type", controls: "Plant or animal cell — changes which organelles are present in the view." },
      { name: "Magnification", controls: "Zoom level of the virtual microscope, from tissue overview to organelle detail." },
      { name: "Organelle selection", controls: "Which structure is highlighted and described in the information card." },
      { name: "Comparison mode", controls: "Overlays the plant and animal cell to highlight structural differences." },
      { name: "Labels visibility", controls: "Shows or hides organelle names for study versus self-testing." },
      { name: "Labelling exercise", controls: "Scores the learner's placement of organelle names against the correct positions." }
    ],
    procedure: [
      "Open the animal cell at low magnification and identify the cell membrane, cytoplasm and nucleus.",
      "Increase magnification and click each organelle in turn, recording its function in your notebook.",
      "Switch to the plant cell and repeat, noting the structures you did not see in the animal cell.",
      "Turn on comparison mode and list the three main differences.",
      "Hide the labels and complete the labelling exercise for both cell types.",
      "Write a short paragraph explaining why a plant cell needs a cell wall and chloroplasts but an animal cell does not."
    ],
    keyConcepts: [
      { title: "Cell Membrane", description: "A thin, partially permeable boundary that controls what enters and leaves the cell. Present in both plant and animal cells." },
      { title: "Nucleus", description: "The control centre containing DNA. It directs all cell activities including growth, protein synthesis and division." },
      { title: "Cytoplasm and Mitochondria", description: "Cytoplasm is the jelly-like medium where reactions occur. Mitochondria release energy from glucose during respiration — the powerhouses of the cell." },
      { title: "Cell Wall (plant only)", description: "A rigid cellulose layer outside the membrane that gives the plant cell its fixed shape, strength and protection against bursting when full of water." },
      { title: "Chloroplasts (plant only)", description: "Contain chlorophyll and carry out photosynthesis, converting light energy, carbon dioxide and water into glucose and oxygen." },
      { title: "Vacuole", description: "Plant cells have one large permanent vacuole full of cell sap that maintains turgor pressure and keeps the plant upright. Animal cells have only small temporary vacuoles, if any." }
    ],
    applications: [
      { title: "Medicine", description: "Understanding how cells divide and malfunction underpins the diagnosis and treatment of diseases such as cancer and sickle-cell anaemia." },
      { title: "Agriculture", description: "Knowing how plant cells absorb water and photosynthesise guides irrigation, spacing and fertiliser decisions on Kenyan farms." },
      { title: "Biotechnology", description: "Tissue culture, used to mass-produce disease-free banana and pyrethrum seedlings in Kenya, relies directly on understanding how plant cells grow and divide." },
      { title: "Forensic science", description: "Investigators can distinguish plant material from animal material at a crime scene by identifying cell wall structures under a microscope." },
      { title: "Food science", description: "Cell structure explains why vegetables wilt when they lose water and crisp up again when soaked." },
      { title: "Conservation", description: "Cell and tissue banks preserve genetic material of endangered Kenyan plant and animal species." }
    ],
    advantages: [
      "A working microscope experience without needing laboratory equipment or slides.",
      "Organelles are labelled clearly and can never be damaged or lost.",
      "Comparison mode makes the plant/animal differences immediately visible.",
      "Instant-feedback labelling builds exam confidence.",
      "Every learner gets the same clear view, unlike sharing one classroom microscope."
    ],
    summary: [
      "All living things are made of cells, the smallest unit of life.",
      "Plant and animal cells share the membrane, cytoplasm, nucleus, mitochondria and ribosomes.",
      "Only plant cells have a cellulose cell wall, chloroplasts and a large permanent vacuole.",
      "Each organelle's structure is suited to its specific function.",
      "Cell knowledge underpins medicine, agriculture, biotechnology and conservation."
    ],
    quizQuestions: [
      { question: "Which structure is found in plant cells but not animal cells?", options: ["Nucleus", "Cell wall", "Mitochondria", "Cell membrane"], correctIndex: 1 },
      { question: "What is the function of chloroplasts?", options: ["Release energy from glucose", "Carry out photosynthesis", "Control cell activities", "Store waste only"], correctIndex: 1 },
      { question: "Which organelle is described as the powerhouse of the cell?", options: ["Ribosome", "Mitochondrion", "Vacuole", "Nucleus"], correctIndex: 1 },
      { question: "The large permanent vacuole in a plant cell mainly:", options: ["Produces proteins", "Maintains turgor pressure to keep the plant upright", "Digests bacteria", "Stores DNA"], correctIndex: 1 },
      { question: "The cell membrane is best described as:", options: ["Fully impermeable", "Partially permeable, controlling what enters and leaves", "Rigid and made of cellulose", "Only present in animal cells"], correctIndex: 1 }
    ]
  }
];
