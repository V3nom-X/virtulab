// Educational content for all experiments based on research knowledge base

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
  }
};

export const getExperimentEducation = (experimentId: string): ExperimentEducation | null => {
  return experimentEducation[experimentId] || null;
};
