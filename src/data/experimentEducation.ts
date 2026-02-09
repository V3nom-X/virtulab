// Educational content for all experiments based on research knowledge base
import { biologyEducation } from './biologyEducation';
import { earthScienceEducation } from './earthScienceEducation';

export interface ExperimentEducation {
  id: string;
  overview: string;
  howItWorks: string[];
  keyConcepts: {
    title: string;
    description: string;
  }[];
  applications: {
    title: string;
    description: string;
  }[];
  conclusion: string;
  equations?: {
    name: string;
    formula: string;
    description: string;
  }[];
}

export const experimentEducation: Record<string, ExperimentEducation> = {
  pendulum: {
    id: 'pendulum',
    overview: `A simple pendulum is one of the most fundamental experiments in physics, demonstrating oscillatory motion through the continuous conversion between potential and kinetic energy. It consists of a small heavy object (bob) suspended from a fixed point by a light, inextensible string, swinging freely under gravity's influence.`,
    howItWorks: [
      'When displaced from rest and released, the bob swings in an arc due to gravity acting as the restoring force.',
      'At the highest points, the bob has maximum potential energy and zero kinetic energy.',
      'At the lowest point, the bob has maximum kinetic energy and minimum potential energy.',
      'For small angles (<15°), this creates Simple Harmonic Motion (SHM) with a predictable period.',
      'The time period depends only on length and gravity—not on mass or amplitude for small swings.'
    ],
    keyConcepts: [
      { title: 'Oscillatory Motion', description: 'Repetitive, predictable motion around a mean position that follows a regular cycle.' },
      { title: 'Simple Harmonic Motion', description: 'Motion where restoring force is proportional to displacement, creating sinusoidal oscillations.' },
      { title: 'Energy Conservation', description: 'Continuous conversion between potential and kinetic energy while total mechanical energy remains constant.' },
      { title: 'Time Period Formula', description: 'T = 2π√(L/g) — period depends only on length (L) and gravitational acceleration (g).' },
      { title: 'Independence of Mass', description: 'Surprisingly, the mass of the bob does not affect the oscillation period—a key Galilean insight.' }
    ],
    applications: [
      { title: 'Timekeeping Devices', description: 'Grandfather clocks and precision instruments historically used pendulums for their predictable period.' },
      { title: 'Measuring Gravity', description: 'Scientists use pendulums to calculate local gravitational acceleration and study Earth\'s gravity variations.' },
      { title: 'Seismology', description: 'Pendulum-based mechanisms detect earthquakes and measure ground vibrations.' },
      { title: 'Engineering Design', description: 'Understanding oscillation helps engineers design vibration-resistant bridges and buildings.' }
    ],
    conclusion: `The simple pendulum elegantly demonstrates fundamental physics principles—energy conservation, periodic motion, and gravitational effects—while providing a gateway to understanding more complex wave mechanics and oscillatory systems.`,
    equations: [
      { name: 'Time Period', formula: 'T = 2π√(L/g)', description: 'Time for one complete oscillation' },
      { name: 'Angular Frequency', formula: 'ω = √(g/L)', description: 'Rate of oscillation in radians per second' },
      { name: 'Kinetic Energy', formula: 'KE = ½mv²', description: 'Energy of motion at any point' }
    ]
  },
  projectile: {
    id: 'projectile',
    overview: `Projectile motion describes the curved path of an object launched into the air, influenced only by gravity. This two-dimensional motion combines horizontal (constant velocity) and vertical (accelerated) components, creating the characteristic parabolic trajectory seen in thrown balls, launched rockets, and jumping athletes.`,
    howItWorks: [
      'An object is launched with an initial velocity at a specific angle from horizontal.',
      'Horizontal motion continues at constant velocity (no horizontal forces in ideal conditions).',
      'Vertical motion experiences constant downward acceleration due to gravity.',
      'The combination creates a parabolic path called a trajectory.',
      'Maximum range occurs at a 45° launch angle (in vacuum conditions).',
      'Time of flight and maximum height depend on initial velocity and launch angle.'
    ],
    keyConcepts: [
      { title: 'Independence of Motion', description: 'Horizontal and vertical components are independent—gravity only affects vertical motion.' },
      { title: 'Parabolic Trajectory', description: 'The curved path results from combining constant horizontal velocity with accelerating vertical motion.' },
      { title: 'Range Optimization', description: 'For a given speed, 45° launch angle maximizes horizontal distance (complementary angles give equal range).' },
      { title: 'Symmetry of Motion', description: 'The ascending and descending portions are symmetric—time up equals time down.' },
      { title: 'Vector Decomposition', description: 'Breaking velocity into components (vₓ = v·cos θ, vᵧ = v·sin θ) simplifies calculations.' }
    ],
    applications: [
      { title: 'Sports Science', description: 'Analyzing ball trajectories in basketball, golf, and baseball for optimal performance.' },
      { title: 'Military Ballistics', description: 'Calculating artillery trajectories accounting for air resistance and wind.' },
      { title: 'Space Exploration', description: 'Planning satellite launches and calculating orbital insertion trajectories.' },
      { title: 'Video Game Physics', description: 'Realistic game engines simulate projectile motion for immersive gameplay.' }
    ],
    conclusion: `Projectile motion demonstrates how complex 2D trajectories emerge from simple 1D physics principles applied independently. Understanding this motion is essential for fields ranging from sports to aerospace engineering.`,
    equations: [
      { name: 'Horizontal Position', formula: 'x = v₀·cos(θ)·t', description: 'Distance traveled horizontally' },
      { name: 'Vertical Position', formula: 'y = v₀·sin(θ)·t - ½gt²', description: 'Height at any time t' },
      { name: 'Maximum Height', formula: 'H = v₀²·sin²(θ) / 2g', description: 'Peak of the trajectory' },
      { name: 'Range', formula: 'R = v₀²·sin(2θ) / g', description: 'Total horizontal distance' }
    ]
  },
  spring: {
    id: 'spring',
    overview: `Spring oscillation demonstrates Hooke's Law and simple harmonic motion through a mass attached to an elastic spring. When displaced and released, the restoring force creates periodic back-and-forth motion, illustrating fundamental concepts used in mechanical systems, shock absorbers, and musical instruments.`,
    howItWorks: [
      'A mass attached to a spring is displaced from its equilibrium position.',
      'The spring exerts a restoring force proportional to the displacement (Hooke\'s Law: F = -kx).',
      'When released, the mass accelerates toward equilibrium but overshoots due to inertia.',
      'This creates oscillatory motion with energy converting between kinetic and elastic potential.',
      'Damping (friction, air resistance) gradually reduces amplitude until motion stops.',
      'The period depends on mass and spring constant, not on amplitude.'
    ],
    keyConcepts: [
      { title: 'Hooke\'s Law', description: 'Force is proportional to displacement: F = -kx, where k is the spring constant.' },
      { title: 'Elastic Potential Energy', description: 'Energy stored in a deformed spring: PE = ½kx²' },
      { title: 'Natural Frequency', description: 'Every spring-mass system has a characteristic oscillation frequency: f = (1/2π)√(k/m)' },
      { title: 'Damping', description: 'Energy dissipation that reduces oscillation amplitude over time.' },
      { title: 'Resonance', description: 'Maximum amplitude occurs when driving frequency matches natural frequency.' }
    ],
    applications: [
      { title: 'Vehicle Suspension', description: 'Springs and dampers absorb road shocks, providing a smooth ride.' },
      { title: 'Mechanical Watches', description: 'Hairsprings regulate the oscillation of the balance wheel for accurate timekeeping.' },
      { title: 'Seismometers', description: 'Spring-mass systems detect and measure earthquake vibrations.' },
      { title: 'Musical Instruments', description: 'Piano strings and guitar pickups use spring-like oscillations to produce sound.' }
    ],
    conclusion: `Spring oscillation provides a tangible demonstration of energy storage, transfer, and dissipation in mechanical systems—principles that underpin countless engineering applications from precision instruments to earthquake-resistant structures.`,
    equations: [
      { name: 'Hooke\'s Law', formula: 'F = -kx', description: 'Restoring force proportional to displacement' },
      { name: 'Period', formula: 'T = 2π√(m/k)', description: 'Time for one complete oscillation' },
      { name: 'Elastic PE', formula: 'PE = ½kx²', description: 'Energy stored in spring' }
    ]
  },
  wave: {
    id: 'wave',
    overview: `Wave motion represents the transfer of energy through a medium without net movement of matter. This simulation demonstrates how disturbances propagate as oscillating patterns, fundamental to understanding sound, light, water waves, and electromagnetic radiation.`,
    howItWorks: [
      'A disturbance creates oscillation at one point in the medium.',
      'Adjacent particles are pulled by the oscillating particle, creating a chain reaction.',
      'Energy transfers through the medium as a traveling wave pattern.',
      'Transverse waves oscillate perpendicular to the direction of travel (like water waves).',
      'Longitudinal waves oscillate parallel to the direction of travel (like sound).',
      'Wave speed, frequency, and wavelength are related by: v = f × λ'
    ],
    keyConcepts: [
      { title: 'Wavelength (λ)', description: 'The distance between consecutive wave crests or compressions.' },
      { title: 'Frequency (f)', description: 'The number of complete oscillations per second, measured in Hertz (Hz).' },
      { title: 'Amplitude', description: 'The maximum displacement from equilibrium—determines wave energy.' },
      { title: 'Wave Equation', description: 'Velocity = Frequency × Wavelength (v = fλ)' },
      { title: 'Superposition', description: 'When waves meet, their displacements add together (constructive or destructive interference).' }
    ],
    applications: [
      { title: 'Communication', description: 'Radio, TV, and mobile signals use electromagnetic waves to transmit information.' },
      { title: 'Medical Imaging', description: 'Ultrasound uses sound waves to create images of internal body structures.' },
      { title: 'Music & Acoustics', description: 'Sound waves create music; concert halls are designed for optimal wave behavior.' },
      { title: 'Earthquake Detection', description: 'Seismic waves reveal Earth\'s internal structure and help predict earthquakes.' }
    ],
    conclusion: `Wave motion is a universal phenomenon connecting sound, light, ocean waves, and quantum mechanics. Understanding waves unlocks insights into how energy and information travel through our universe.`,
    equations: [
      { name: 'Wave Equation', formula: 'v = f × λ', description: 'Velocity equals frequency times wavelength' },
      { name: 'Period-Frequency', formula: 'T = 1/f', description: 'Period is inverse of frequency' },
      { name: 'Wave Intensity', formula: 'I ∝ A²', description: 'Intensity proportional to amplitude squared' }
    ]
  },
  collision: {
    id: 'collision',
    overview: `Collision physics demonstrates the fundamental laws of momentum and energy conservation when objects interact. This simulation shows how elastic and inelastic collisions transfer energy and momentum between bodies—principles essential for understanding car safety, sports, and particle physics.`,
    howItWorks: [
      'Two objects approach each other with initial velocities and masses.',
      'Upon impact, forces act equally and oppositely between them (Newton\'s 3rd Law).',
      'Total momentum is always conserved: m₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
      'In elastic collisions, kinetic energy is also conserved—objects bounce apart.',
      'In inelastic collisions, some kinetic energy converts to heat/deformation—objects may stick together.',
      'Coefficient of restitution measures "bounciness" (1 = perfectly elastic, 0 = perfectly inelastic).'
    ],
    keyConcepts: [
      { title: 'Conservation of Momentum', description: 'Total momentum before collision equals total momentum after—always conserved.' },
      { title: 'Elastic Collision', description: 'Both momentum AND kinetic energy are conserved—objects bounce apart.' },
      { title: 'Inelastic Collision', description: 'Momentum conserved but kinetic energy is lost—objects may stick together.' },
      { title: 'Impulse', description: 'Change in momentum equals force × time (J = FΔt = Δp)' },
      { title: 'Center of Mass', description: 'The weighted average position moves at constant velocity during collision.' }
    ],
    applications: [
      { title: 'Vehicle Safety', description: 'Crumple zones increase collision time to reduce force on passengers.' },
      { title: 'Sports Physics', description: 'Understanding ball-bat collisions optimizes hitting technique in baseball and tennis.' },
      { title: 'Particle Physics', description: 'Particle accelerators study fundamental physics through high-energy collisions.' },
      { title: 'Billiards & Pool', description: 'Predicting ball trajectories requires understanding elastic collision mechanics.' }
    ],
    conclusion: `Collision physics reveals how objects exchange energy and momentum during interactions. These principles, from Newton's laws to conservation principles, are fundamental to engineering safety systems and understanding the universe at every scale.`,
    equations: [
      { name: 'Momentum', formula: 'p = mv', description: 'Mass times velocity' },
      { name: 'Conservation', formula: 'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'', description: 'Total momentum conserved' },
      { name: 'Kinetic Energy', formula: 'KE = ½mv²', description: 'Energy of motion' }
    ]
  },
  ohmslaw: {
    id: 'ohmslaw',
    overview: `Ohm's Law describes the fundamental relationship between voltage, current, and resistance in electrical circuits. This interactive simulation visualizes how electric current flows through conductors, helping students understand the backbone of all electrical and electronic systems in the modern world.`,
    howItWorks: [
      'A voltage source (battery) creates an electric potential difference across the circuit.',
      'This potential difference pushes electrons through the conductor, creating current.',
      'The resistor opposes current flow, converting some electrical energy to heat.',
      'Current (I) is directly proportional to voltage (V) and inversely proportional to resistance (R).',
      'Adjusting voltage or resistance immediately changes the current flow.',
      'The ammeter measures current; the voltmeter measures voltage across components.'
    ],
    keyConcepts: [
      { title: 'Ohm\'s Law Formula', description: 'V = I × R: Voltage equals Current times Resistance.' },
      { title: 'Electric Current', description: 'The rate of charge flow through a conductor, measured in Amperes (A).' },
      { title: 'Voltage (Potential Difference)', description: 'The "push" that drives electrons through a circuit, measured in Volts (V).' },
      { title: 'Resistance', description: 'Opposition to current flow, measured in Ohms (Ω).' },
      { title: 'Power Dissipation', description: 'Energy converted to heat: P = I²R = V²/R = IV' }
    ],
    applications: [
      { title: 'Electronic Design', description: 'Engineers use Ohm\'s Law to select appropriate resistors and protect components.' },
      { title: 'Household Appliances', description: 'Every device from phones to refrigerators relies on these electrical principles.' },
      { title: 'Safety Engineering', description: 'Fuse ratings and circuit breakers are designed using Ohm\'s Law calculations.' },
      { title: 'Power Transmission', description: 'Optimizing power grid efficiency requires understanding resistance and voltage relationships.' }
    ],
    conclusion: `Ohm's Law is the cornerstone of electrical engineering, governing everything from simple flashlights to complex computer processors. Understanding this fundamental relationship is essential for anyone working with electrical systems.`,
    equations: [
      { name: 'Ohm\'s Law', formula: 'V = I × R', description: 'Voltage = Current × Resistance' },
      { name: 'Power', formula: 'P = I × V', description: 'Electrical power in Watts' },
      { name: 'Current', formula: 'I = V / R', description: 'Current when voltage and resistance are known' }
    ]
  },
  inclinedplane: {
    id: 'inclinedplane',
    overview: `The inclined plane experiment studies how forces affect motion on sloped surfaces. As one of the six classical simple machines, it demonstrates force decomposition, friction effects, and energy conservation—concepts fundamental to mechanics, engineering, and everyday applications like ramps and roads.`,
    howItWorks: [
      'An object is placed at the top of an angled surface with gravitational potential energy.',
      'Gravity pulls straight down, but the incline redirects this force along the slope.',
      'The gravitational force decomposes into parallel (causes motion) and perpendicular (causes normal force) components.',
      'Friction opposes motion and depends on surface materials and normal force.',
      'The object accelerates down the slope at a rate less than free fall.',
      'Steeper angles increase the parallel force component, causing faster acceleration.'
    ],
    keyConcepts: [
      { title: 'Force Decomposition', description: 'Breaking gravity into components parallel and perpendicular to the incline.' },
      { title: 'Normal Force', description: 'The perpendicular contact force from the surface, N = mg·cos(θ).' },
      { title: 'Friction Force', description: 'Opposes motion: f = μN = μmg·cos(θ), where μ is the friction coefficient.' },
      { title: 'Acceleration Formula', description: 'a = g(sin θ - μ cos θ) determines how fast the object accelerates.' },
      { title: 'Mechanical Advantage', description: 'Inclines reduce required force but increase the distance moved.' }
    ],
    applications: [
      { title: 'Accessibility Ramps', description: 'Wheelchair ramps use gentle angles to reduce the force needed to climb.' },
      { title: 'Road Engineering', description: 'Highway grades are designed considering vehicle acceleration and braking.' },
      { title: 'Loading Docks', description: 'Inclined conveyors move heavy goods with less effort than lifting.' },
      { title: 'Skiing & Sledding', description: 'Understanding slope physics helps optimize equipment and technique.' }
    ],
    conclusion: `The inclined plane elegantly demonstrates how surfaces redirect forces and how friction affects motion. These principles extend from simple ramps to complex machinery, making it a cornerstone of mechanical engineering education.`,
    equations: [
      { name: 'Parallel Force', formula: 'F∥ = mg·sin(θ)', description: 'Component causing acceleration' },
      { name: 'Normal Force', formula: 'N = mg·cos(θ)', description: 'Perpendicular contact force' },
      { name: 'Acceleration', formula: 'a = g(sin θ - μ cos θ)', description: 'Net acceleration down slope' }
    ]
  },
  lightoptics: {
    id: 'lightoptics',
    overview: `This light optics simulation demonstrates how light behaves when encountering different surfaces and media. Through interactive ray tracing, students explore reflection, refraction, and Snell's Law—fundamental principles that explain everything from mirrors and lenses to fiber optics and rainbows.`,
    howItWorks: [
      'A light ray travels in a straight line through a uniform medium.',
      'When encountering a mirror, light reflects at an angle equal to the angle of incidence.',
      'When entering a different medium (air→glass), light bends due to changing speed.',
      'Snell\'s Law (n₁sin θ₁ = n₂sin θ₂) predicts the exact bending angle.',
      'Total internal reflection occurs when light tries to exit a denser medium at steep angles.',
      'The refractive index measures how much a material slows light.'
    ],
    keyConcepts: [
      { title: 'Law of Reflection', description: 'Angle of incidence equals angle of reflection (θᵢ = θᵣ).' },
      { title: 'Refraction', description: 'Light bends when passing between media with different optical densities.' },
      { title: 'Snell\'s Law', description: 'n₁sin(θ₁) = n₂sin(θ₂) relates angles to refractive indices.' },
      { title: 'Refractive Index', description: 'Ratio of light speed in vacuum to speed in medium (n = c/v).' },
      { title: 'Total Internal Reflection', description: 'Complete reflection when angle exceeds critical angle in denser medium.' }
    ],
    applications: [
      { title: 'Eyeglasses & Lenses', description: 'Corrective lenses use refraction to focus light onto the retina.' },
      { title: 'Fiber Optics', description: 'Total internal reflection carries data through glass fibers at light speed.' },
      { title: 'Cameras & Telescopes', description: 'Optical instruments use lens combinations to magnify and focus images.' },
      { title: 'Rainbows', description: 'Sunlight refracting and reflecting in water droplets creates the spectrum.' }
    ],
    conclusion: `Understanding light behavior is essential for optical engineering, photography, vision science, and telecommunications. These fundamental principles enable technologies from microscopes to internet infrastructure.`,
    equations: [
      { name: 'Reflection Law', formula: 'θᵢ = θᵣ', description: 'Incident angle equals reflected angle' },
      { name: 'Snell\'s Law', formula: 'n₁sin(θ₁) = n₂sin(θ₂)', description: 'Refraction angle relationship' },
      { name: 'Critical Angle', formula: 'θc = arcsin(n₂/n₁)', description: 'Angle for total internal reflection' }
    ]
  },
  buoyancy: {
    id: 'buoyancy',
    overview: `The buoyancy simulation demonstrates Archimedes' Principle: an object submerged in fluid experiences an upward force equal to the weight of displaced fluid. This explains why some objects float while others sink—fundamental to ship design, submarine navigation, and understanding fluid dynamics.`,
    howItWorks: [
      'An object placed in fluid displaces a volume of that fluid.',
      'The displaced fluid creates an upward "buoyant force" on the object.',
      'Buoyant force equals the weight of the displaced fluid (Archimedes\' Principle).',
      'Objects float when buoyant force exceeds object weight (object density < fluid density).',
      'Objects sink when object weight exceeds buoyant force (object density > fluid density).',
      'Neutral buoyancy occurs when forces balance exactly.'
    ],
    keyConcepts: [
      { title: 'Archimedes\' Principle', description: 'Buoyant force = weight of displaced fluid (Fb = ρfluid × Vdisplaced × g).' },
      { title: 'Density Comparison', description: 'Objects float if their density is less than the fluid density.' },
      { title: 'Displaced Volume', description: 'The volume of fluid pushed aside equals the submerged volume of the object.' },
      { title: 'Apparent Weight', description: 'Objects feel lighter in fluid: W\' = W - Fb' },
      { title: 'Equilibrium Floating', description: 'Floating objects displace exactly enough fluid to balance their weight.' }
    ],
    applications: [
      { title: 'Ship Design', description: 'Hull shapes maximize displacement to carry heavy cargo while floating safely.' },
      { title: 'Submarines', description: 'Ballast tanks adjust buoyancy for diving, surfacing, and depth control.' },
      { title: 'Hot Air Balloons', description: 'Heated air is less dense than surrounding air, creating lift.' },
      { title: 'Swimming & Diving', description: 'Understanding buoyancy helps divers control their position in water.' }
    ],
    conclusion: `Buoyancy is a cornerstone of fluid mechanics, explaining everyday phenomena from floating ice to flying aircraft. Mastering these principles is essential for marine engineering, aerospace design, and understanding natural systems.`,
    equations: [
      { name: 'Buoyant Force', formula: 'Fb = ρfluid × V × g', description: 'Upward force from displaced fluid' },
      { name: 'Floating Condition', formula: 'ρobject < ρfluid', description: 'Object floats when less dense than fluid' },
      { name: 'Apparent Weight', formula: 'W\' = W - Fb', description: 'Weight felt when submerged' }
    ]
  },
  emspectrum: {
    id: 'emspectrum',
    overview: `The electromagnetic spectrum encompasses all types of electromagnetic radiation, from radio waves to gamma rays. This visualization shows how different wavelengths and frequencies create diverse forms of radiation—each with unique properties and applications in communication, medicine, and scientific research.`,
    howItWorks: [
      'Electromagnetic waves consist of oscillating electric and magnetic fields traveling at light speed.',
      'All EM waves travel at c = 3×10⁸ m/s in vacuum, but differ in wavelength and frequency.',
      'Energy is proportional to frequency: higher frequency = higher energy (E = hf).',
      'The spectrum ranges from radio waves (low energy, long wavelength) to gamma rays (high energy, short wavelength).',
      'Visible light occupies only a tiny portion of the full spectrum.',
      'Different wavelengths interact with matter in distinct ways, determining their applications.'
    ],
    keyConcepts: [
      { title: 'Wave-Particle Duality', description: 'EM radiation behaves as both waves and particles (photons).' },
      { title: 'Photon Energy', description: 'E = hf, where h is Planck\'s constant and f is frequency.' },
      { title: 'Wavelength-Frequency Relation', description: 'c = λf — as wavelength increases, frequency decreases.' },
      { title: 'Ionizing vs Non-Ionizing', description: 'High-energy radiation can ionize atoms; low-energy cannot.' },
      { title: 'Absorption & Emission', description: 'Materials absorb and emit specific wavelengths based on atomic structure.' }
    ],
    applications: [
      { title: 'Radio & Television', description: 'Long-wavelength radio waves carry broadcast signals worldwide.' },
      { title: 'Medical Imaging', description: 'X-rays reveal bone structure; gamma rays treat cancer.' },
      { title: 'Thermal Imaging', description: 'Infrared cameras detect heat signatures for security and rescue.' },
      { title: 'Astronomy', description: 'Observing different wavelengths reveals hidden cosmic phenomena.' }
    ],
    conclusion: `The electromagnetic spectrum unifies our understanding of light, radiation, and energy. From the radio waves enabling global communication to the gamma rays powering medical treatments, EM radiation shapes modern technology and scientific discovery.`,
    equations: [
      { name: 'Wave Equation', formula: 'c = λ × f', description: 'Speed = wavelength × frequency' },
      { name: 'Photon Energy', formula: 'E = h × f', description: 'Energy proportional to frequency' },
      { name: 'Speed of Light', formula: 'c = 3 × 10⁸ m/s', description: 'EM wave velocity in vacuum' }
    ]
  },
  chemistry: {
    id: 'chemistry',
    overview: `The chemistry lab provides an interactive molecular playground where students can explore atomic structure, chemical bonding, and molecular geometry. By dragging elements from the periodic table and observing how they combine, learners gain intuitive understanding of valence electrons, bond types, and reaction products.`,
    howItWorks: [
      'Elements are selected from the periodic table based on their properties.',
      'Atoms combine based on valence electron availability and electronegativity.',
      'Ionic bonds form between metals and nonmetals through electron transfer.',
      'Covalent bonds form between nonmetals through electron sharing.',
      'Molecular geometry emerges from electron pair repulsion (VSEPR theory).',
      'Properties like polarity and reactivity depend on molecular structure.'
    ],
    keyConcepts: [
      { title: 'Atomic Structure', description: 'Atoms consist of protons, neutrons (nucleus) and electrons (shells).' },
      { title: 'Valence Electrons', description: 'Outer shell electrons determine bonding behavior and reactivity.' },
      { title: 'Chemical Bonds', description: 'Ionic (electron transfer) and covalent (electron sharing) bonds hold molecules together.' },
      { title: 'Electronegativity', description: 'An atom\'s ability to attract electrons determines bond polarity.' },
      { title: 'Molecular Geometry', description: 'VSEPR theory predicts 3D shapes from electron pair repulsion.' }
    ],
    applications: [
      { title: 'Drug Development', description: 'Understanding molecular structure is essential for designing pharmaceutical compounds.' },
      { title: 'Materials Science', description: 'New materials are engineered by controlling atomic bonding and structure.' },
      { title: 'Environmental Chemistry', description: 'Analyzing pollutants and developing remediation strategies.' },
      { title: 'Food Science', description: 'Chemical reactions determine flavors, textures, and preservation methods.' }
    ],
    conclusion: `Chemistry is the study of matter and its transformations. By visualizing atomic interactions, students build intuition for the molecular world that underlies biology, medicine, materials science, and environmental sustainability.`
  },
  acidbase: {
    id: 'acidbase',
    overview: `Acids, bases, and indicators are fundamental to chemistry. Acids donate hydrogen ions (H⁺), bases accept them. pH measures acidity on a 0-14 scale. Chemical indicators change color at specific pH ranges, allowing visual identification of acidic or basic solutions.`,
    howItWorks: [
      'Acids dissolve in water and release hydrogen ions (H⁺), increasing acidity.',
      'Bases dissolve and release hydroxide ions (OH⁻), increasing alkalinity.',
      'The pH scale measures hydrogen ion concentration logarithmically from 0-14.',
      'Indicators are weak acids/bases that change color depending on the pH.',
      'Neutralization occurs when acids and bases react: H⁺ + OH⁻ → H₂O.',
      'Buffer solutions resist pH changes by absorbing excess H⁺ or OH⁻ ions.'
    ],
    keyConcepts: [
      { title: 'pH Scale', description: 'Logarithmic measure: pH = -log[H⁺]. Values 0-6 are acidic, 7 is neutral, 8-14 are basic.' },
      { title: 'Indicators', description: 'Substances like litmus, phenolphthalein, and universal indicator that change color at specific pH ranges.' },
      { title: 'Strong vs Weak Acids', description: 'Strong acids (HCl) fully dissociate; weak acids (acetic acid) partially dissociate.' },
      { title: 'Neutralization', description: 'Acid + Base → Salt + Water. The resulting pH depends on the relative strengths.' },
      { title: 'Buffers', description: 'Solutions that maintain relatively constant pH when small amounts of acid or base are added.' }
    ],
    applications: [
      { title: 'Medicine', description: 'Blood pH must stay at 7.35-7.45; antacids neutralize excess stomach acid.' },
      { title: 'Agriculture', description: 'Soil pH affects nutrient availability; farmers add lime (base) to acidic soil.' },
      { title: 'Food Industry', description: 'pH controls fermentation, preservation, and the taste of foods and beverages.' },
      { title: 'Water Treatment', description: 'pH adjustment is critical in water purification and wastewater treatment.' }
    ],
    conclusion: `Understanding acids, bases, and pH is essential for chemistry, biology, medicine, and environmental science. Indicators provide a visual bridge between invisible molecular behavior and observable color changes.`,
    equations: [
      { name: 'pH Definition', formula: 'pH = -log₁₀[H⁺]', description: 'Negative log of hydrogen ion concentration' },
      { name: 'Water Ionization', formula: 'Kw = [H⁺][OH⁻] = 10⁻¹⁴', description: 'Ion product of water at 25°C' },
      { name: 'pH + pOH', formula: 'pH + pOH = 14', description: 'Relationship between pH and pOH' }
    ]
  },
  friction: {
    id: 'friction',
    overview: `Friction is a force that opposes the relative motion between two surfaces in contact. It plays a crucial role in everyday life—from walking and driving to engineering and sports. Without friction, objects would slide indefinitely, and we couldn't grip anything.`,
    howItWorks: [
      'When two surfaces are pressed together, microscopic irregularities interlock.',
      'Static friction prevents motion until an applied force exceeds the maximum static friction.',
      'Once motion begins, kinetic friction opposes movement—usually less than static friction.',
      'The friction force depends on the normal force and the coefficient of friction (μ).',
      'Smoother surfaces have lower friction coefficients; rougher surfaces have higher ones.',
      'Lubrication reduces friction by creating a thin fluid layer between surfaces.'
    ],
    keyConcepts: [
      { title: 'Static Friction', description: 'Prevents stationary objects from moving. fs ≤ μs × N.' },
      { title: 'Kinetic Friction', description: 'Acts on moving objects. fk = μk × N, always opposing motion direction.' },
      { title: 'Coefficient of Friction (μ)', description: 'Dimensionless value depending on surface materials. Higher μ = more friction.' },
      { title: 'Normal Force', description: 'Perpendicular contact force between surfaces. On flat ground, N = mg.' },
      { title: 'Rolling Friction', description: 'Much less than sliding friction—why wheels revolutionized transportation.' }
    ],
    applications: [
      { title: 'Vehicle Braking', description: 'Brake pads use friction to convert kinetic energy to heat, stopping the vehicle.' },
      { title: 'Walking & Running', description: 'Friction between shoes and ground provides the grip needed for locomotion.' },
      { title: 'Industrial Machinery', description: 'Engineers optimize friction using lubricants to reduce wear and energy loss.' },
      { title: 'Sports Equipment', description: 'Tennis racket strings, climbing shoes, and ski wax all manipulate friction.' }
    ],
    conclusion: `Friction is both a help and a hindrance. Understanding its principles allows engineers to control it—maximizing grip where needed and minimizing energy waste where friction is unwanted.`,
    equations: [
      { name: 'Friction Force', formula: 'f = μ × N', description: 'Friction equals coefficient times normal force' },
      { name: 'Net Force', formula: 'F_net = F_applied - f', description: 'Net force determines acceleration' },
      { name: 'Acceleration', formula: 'a = F_net / m', description: 'Newton\'s second law' }
    ]
  },
  lever: {
    id: 'lever',
    overview: `The lever is one of the six classical simple machines. It consists of a rigid beam (lever arm) that pivots on a fixed point called the fulcrum. By adjusting the positions of the load and effort relative to the fulcrum, a lever can multiply force, making it easier to lift heavy objects.`,
    howItWorks: [
      'A rigid beam rests on a fulcrum (pivot point).',
      'A load (resistance) is placed on one side, effort (force) is applied on the other.',
      'Torque = Force × Distance from fulcrum determines the turning effect.',
      'When effort arm > load arm, less force is needed (mechanical advantage > 1).',
      'Balance occurs when clockwise torque equals counterclockwise torque.',
      'There are three classes of levers based on the relative positions of load, effort, and fulcrum.'
    ],
    keyConcepts: [
      { title: 'Mechanical Advantage', description: 'MA = Effort Arm / Load Arm. Greater MA means less effort needed.' },
      { title: 'Torque (Moment)', description: 'Turning effect of a force: τ = F × d. Must balance for equilibrium.' },
      { title: 'Fulcrum', description: 'The pivot point around which the lever rotates.' },
      { title: 'Lever Classes', description: 'Class 1: fulcrum between load/effort (seesaw). Class 2: load between (wheelbarrow). Class 3: effort between (tweezers).' },
      { title: 'Trade-off', description: 'Levers trade force for distance—less force but greater movement distance at the effort end.' }
    ],
    applications: [
      { title: 'Construction', description: 'Crowbars and pry bars use lever principles to lift heavy objects with minimal effort.' },
      { title: 'Human Body', description: 'Bones act as levers, joints as fulcrums, and muscles provide effort to move limbs.' },
      { title: 'Playground Equipment', description: 'Seesaws are Class 1 levers demonstrating balance and torque principles.' },
      { title: 'Tools', description: 'Scissors, pliers, and nutcrackers are all lever-based tools.' }
    ],
    conclusion: `The lever demonstrates how simple mechanics can multiply human effort. Understanding torque and mechanical advantage is fundamental to engineering, biomechanics, and everyday tool design.`,
    equations: [
      { name: 'Torque', formula: 'τ = F × d', description: 'Torque equals force times distance from fulcrum' },
      { name: 'Equilibrium', formula: 'F₁ × d₁ = F₂ × d₂', description: 'Balanced when torques are equal' },
      { name: 'Mechanical Advantage', formula: 'MA = d_effort / d_load', description: 'Ratio of arm lengths' }
    ]
  },
  expansion: {
    id: 'expansion',
    overview: `Thermal expansion is the tendency of materials to change size when temperature changes. As materials are heated, their particles vibrate more vigorously and occupy more space, causing the material to expand. This principle affects everything from bridge design to thermometer construction.`,
    howItWorks: [
      'Atoms and molecules vibrate about fixed positions in solids.',
      'Increasing temperature increases the average kinetic energy of particles.',
      'Greater vibration amplitude means particles push farther apart.',
      'Linear expansion: ΔL = α × L₀ × ΔT, where α is the coefficient of linear expansion.',
      'Different materials expand at different rates—metals typically more than ceramics.',
      'Cooling reverses the process, causing contraction.'
    ],
    keyConcepts: [
      { title: 'Linear Expansion', description: 'Change in length proportional to original length and temperature change: ΔL = αL₀ΔT.' },
      { title: 'Coefficient of Expansion (α)', description: 'Material-specific constant. Aluminum (23×10⁻⁶) expands more than iron (12×10⁻⁶).' },
      { title: 'Volume Expansion', description: 'For solids, β ≈ 3α. Liquids and gases expand more than solids.' },
      { title: 'Anomalous Expansion', description: 'Water expands when cooled below 4°C—why ice floats and pipes burst in winter.' },
      { title: 'Thermal Stress', description: 'If expansion is constrained, internal stresses build up that can crack or warp materials.' }
    ],
    applications: [
      { title: 'Bridge Design', description: 'Expansion joints allow bridges to lengthen in summer without buckling.' },
      { title: 'Thermometers', description: 'Mercury and alcohol expand predictably with temperature, enabling measurement.' },
      { title: 'Bimetallic Strips', description: 'Two metals with different α bonded together bend when heated—used in thermostats.' },
      { title: 'Railroad Tracks', description: 'Gaps between rails accommodate expansion to prevent dangerous buckling in hot weather.' }
    ],
    conclusion: `Thermal expansion is a fundamental property that engineers must account for in design. Understanding how materials respond to temperature changes prevents structural failures and enables precision instruments.`,
    equations: [
      { name: 'Linear Expansion', formula: 'ΔL = α × L₀ × ΔT', description: 'Change in length from temperature change' },
      { name: 'Volume Expansion', formula: 'ΔV = β × V₀ × ΔT', description: 'Change in volume (β ≈ 3α for solids)' },
      { name: 'Final Length', formula: 'L = L₀(1 + αΔT)', description: 'New length after temperature change' }
    ]
  },
  statesofmatter: {
    id: 'statesofmatter',
    overview: `Matter exists in three primary states—solid, liquid, and gas—determined by the arrangement and energy of its particles. Temperature and pressure control phase transitions: melting, boiling, freezing, and condensation. Understanding states of matter is fundamental to chemistry, physics, and materials science.`,
    howItWorks: [
      'In solids, particles are tightly packed in fixed positions, vibrating in place.',
      'In liquids, particles are close but can slide past each other, flowing freely.',
      'In gases, particles move rapidly and freely with large spaces between them.',
      'Adding heat energy increases particle motion and can cause phase transitions.',
      'Melting point: solid → liquid. Boiling point: liquid → gas.',
      'During phase transitions, temperature stays constant as energy breaks intermolecular bonds.'
    ],
    keyConcepts: [
      { title: 'Kinetic Molecular Theory', description: 'All matter consists of particles in constant motion. Temperature measures average kinetic energy.' },
      { title: 'Phase Transitions', description: 'Melting, freezing, boiling, condensation, sublimation—each involves energy transfer.' },
      { title: 'Latent Heat', description: 'Energy absorbed/released during phase change without temperature change.' },
      { title: 'Intermolecular Forces', description: 'Stronger forces (hydrogen bonds, ionic) = higher melting/boiling points.' },
      { title: 'Pressure Effects', description: 'Increasing pressure raises boiling point (pressure cookers) and can solidify gases.' }
    ],
    applications: [
      { title: 'Cooking', description: 'Boiling, melting butter, and pressure cooking all exploit phase transitions.' },
      { title: 'Refrigeration', description: 'Refrigerants absorb heat when evaporating and release heat when condensing.' },
      { title: 'Metallurgy', description: 'Melting and solidifying metals is essential for casting and manufacturing.' },
      { title: 'Weather', description: 'Water cycle involves continuous phase transitions driving weather patterns.' }
    ],
    conclusion: `States of matter demonstrate the interplay between particle energy and intermolecular forces. Understanding phase transitions is essential for cooking, industry, weather prediction, and materials engineering.`,
    equations: [
      { name: 'Latent Heat', formula: 'Q = mL', description: 'Energy for phase change = mass × latent heat' },
      { name: 'Heat Transfer', formula: 'Q = mcΔT', description: 'Energy for temperature change' },
      { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Relates pressure, volume, and temperature of gases' }
    ]
  },
  diffusionosmosis: {
    id: 'diffusionosmosis',
    overview: `Living organisms constantly exchange substances such as gases, nutrients, and water with their surroundings through two important biological processes: diffusion and osmosis. This experiment introduces learners to both processes using two classic experiments — the potassium permanganate diffusion experiment and the visking tubing osmosis experiment.

Diffusion and osmosis are passive processes, meaning they do not require energy from living cells. Instead, they depend on the natural movement of particles and differences in concentration. Because these movements happen at a microscopic level, they are difficult to observe directly in a physical classroom. A simulation-based experiment allows learners to visualize particle movement clearly, observe gradual changes over time, and repeat the experiments safely.

Part A — Diffusion Using Potassium Permanganate: A small crystal of potassium permanganate is placed in a beaker of still water. Over time, without stirring, the purple colour slowly spreads throughout the water until the entire beaker has a uniform light purple colour. The particles move randomly from a region of high concentration (near the crystal) to regions of low concentration (the clear water).

Part B — Osmosis Using Visking Tubing: Visking tubing represents a cell membrane. Sugar solution is sealed inside the tubing and placed in clean water. Over time, water molecules move from the beaker into the tubing through the semi-permeable membrane, causing the tubing to swell and become firm. Sugar molecules cannot pass through the membrane.`,
    howItWorks: [
      'A potassium permanganate crystal is placed in still water inside a beaker.',
      'The spread of purple colour is observed over time as particles diffuse.',
      'Concentration differences are identified between regions of colour and clear water.',
      'A visking tubing bag containing sugar solution is prepared and sealed.',
      'The tubing is placed in a beaker of clean water.',
      'Swelling of the tubing is observed as water enters by osmosis.',
      'Particle movement (diffusion) and water movement (osmosis) are compared.',
      'Conclusions are drawn: diffusion moves solute particles; osmosis moves water across a membrane.'
    ],
    keyConcepts: [
      { title: 'Diffusion', description: 'The movement of particles from a region of high concentration to a region of low concentration. Occurs in liquids and gases without requiring energy.' },
      { title: 'Osmosis', description: 'The movement of water molecules through a semi-permeable membrane from a dilute solution to a concentrated solution. Involves water only and requires a membrane.' },
      { title: 'Concentration Gradient', description: 'The difference in concentration between two regions. It provides the driving force for both diffusion and osmosis.' },
      { title: 'Semi-Permeable Membrane', description: 'A membrane that allows small molecules like water to pass through but prevents larger molecules (e.g. sugar) from crossing. Cell membranes behave this way.' },
      { title: 'Passive Transport', description: 'Both diffusion and osmosis are passive processes — they do not require energy from the cell. Movement is driven by concentration differences.' },
      { title: 'Tonicity', description: 'Hypertonic (more solute outside cell), Hypotonic (less solute outside), Isotonic (equal). Determines direction of osmotic water flow.' }
    ],
    applications: [
      { title: 'Animal Biology', description: 'Oxygen diffuses from lungs into blood; carbon dioxide diffuses out. Nutrients diffuse from intestines into bloodstream. Osmosis maintains water balance in cells.' },
      { title: 'Plant Biology', description: 'Roots absorb water by osmosis. Plant cells become turgid due to osmosis. Diffusion allows gas exchange through stomata and controls their opening/closing.' },
      { title: 'Medicine & Healthcare', description: 'IV drip solutions must match blood concentration (isotonic). Kidney dialysis uses diffusion principles. Drug absorption across membranes relies on diffusion.' },
      { title: 'Food Preservation', description: 'Salting and sugaring remove water from microbes by creating hypertonic conditions, preventing bacterial growth and food spoilage.' },
      { title: 'Agriculture', description: 'Soil salinity affects osmosis in plant roots. Excessive salt leads to poor osmosis, causing wilting and reduced crop yields.' }
    ],
    conclusion: `Diffusion and osmosis are passive transport mechanisms vital to life. They enable cells to exchange nutrients and waste, maintain water balance, and respond to their chemical environment. Understanding these processes is foundational for biology topics including respiration, nutrition, transpiration, and circulation.`,
    equations: [
      { name: "Fick's Law of Diffusion", formula: 'J = -D × (dC/dx)', description: 'Rate of diffusion is proportional to the concentration gradient' },
      { name: 'Osmotic Pressure', formula: 'π = iMRT', description: 'Pressure needed to prevent osmosis across a membrane' },
      { name: 'Water Potential', formula: 'Ψ = Ψs + Ψp', description: 'Determines direction of water movement in cells' }
    ]
  }
};

const allEducation = { ...experimentEducation, ...biologyEducation, ...earthScienceEducation };

export const getExperimentEducation = (experimentId: string): ExperimentEducation | null => {
  return allEducation[experimentId] || null;
};
