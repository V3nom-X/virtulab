import { ExperimentEducation } from './experimentEducation';

export const earthScienceEducation: Record<string, ExperimentEducation> = {
  weather: {
    id: 'weather',
    overview: `Weather is the state of the atmosphere at a specific time and place. Understanding weather involves studying temperature, humidity, pressure, wind, and precipitation patterns. Weather systems are driven by the uneven heating of Earth's surface by the Sun, creating dynamic atmospheric circulation.`,
    howItWorks: [
      'The Sun heats Earth\'s surface unevenly — equatorial regions receive more energy than poles.',
      'Warm air rises, creating low pressure areas; cool air sinks, creating high pressure areas.',
      'Air moves from high to low pressure, creating wind.',
      'As warm moist air rises, it cools and water vapor condenses, forming clouds and precipitation.',
      'Large-scale patterns like jet streams and ocean currents drive weather systems across continents.',
      'Fronts form where different air masses meet, often bringing storms and changing weather.'
    ],
    keyConcepts: [
      { title: 'Air Pressure', description: 'The weight of the atmosphere pressing down. Low pressure = rising air = clouds/rain. High pressure = sinking air = clear skies.' },
      { title: 'Water Cycle', description: 'Evaporation → Condensation → Precipitation → Collection. This cycle continuously moves water between oceans, atmosphere, and land.' },
      { title: 'Fronts', description: 'Boundaries between air masses. Cold fronts bring quick storms; warm fronts bring gradual, prolonged rainfall.' },
      { title: 'Coriolis Effect', description: 'Earth\'s rotation deflects moving air, causing curved wind patterns and the rotation of weather systems.' }
    ],
    applications: [
      { title: 'Weather Forecasting', description: 'Meteorologists use data from satellites, weather stations, and computer models to predict weather.' },
      { title: 'Agriculture', description: 'Farmers rely on weather predictions for planting, irrigating, and harvesting crops.' },
      { title: 'Disaster Preparedness', description: 'Understanding storms helps communities prepare for hurricanes, tornadoes, and floods.' },
      { title: 'Climate Science', description: 'Long-term weather patterns help scientists understand climate change and its impacts.' }
    ],
    conclusion: `Weather is a complex interplay of solar energy, atmospheric dynamics, and Earth's geography. Understanding these systems helps us predict conditions, protect lives, and appreciate the powerful forces shaping our planet.`,
    equations: [
      { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Relates pressure, volume, temperature, and amount of gas' },
      { name: 'Relative Humidity', formula: 'RH = (actual vapor / saturation vapor) × 100%', description: 'How saturated the air is with moisture' }
    ]
  },
  rockcycle: {
    id: 'rockcycle',
    overview: `The rock cycle describes how rocks are continuously transformed between three types: igneous (from cooling magma), sedimentary (from compressed sediments), and metamorphic (from heat and pressure). This cycle has been operating for billions of years, recycling Earth's crustal materials.`,
    howItWorks: [
      'Magma from Earth\'s interior cools and solidifies to form igneous rocks.',
      'Weathering and erosion break rocks into sediments that are transported by wind and water.',
      'Sediments accumulate in layers and are compacted/cemented into sedimentary rocks.',
      'Heat and pressure deep underground transform existing rocks into metamorphic rocks.',
      'If temperatures are high enough, any rock can melt back into magma, restarting the cycle.',
      'Plate tectonics drives the cycle by subducting rocks and creating volcanic activity.'
    ],
    keyConcepts: [
      { title: 'Igneous Rocks', description: 'Formed from cooled magma/lava. Examples: granite (slow cooling), basalt (fast cooling), obsidian (very fast).' },
      { title: 'Sedimentary Rocks', description: 'Formed from compacted sediments or precipitated minerals. Examples: sandstone, limestone, shale. Often contain fossils.' },
      { title: 'Metamorphic Rocks', description: 'Formed when existing rocks are transformed by heat and pressure. Examples: marble (from limestone), slate (from shale).' },
      { title: 'Weathering & Erosion', description: 'Physical and chemical processes that break down rocks. Water, wind, ice, and biological activity all contribute.' }
    ],
    applications: [
      { title: 'Mining & Resources', description: 'Understanding rock types helps locate valuable minerals, metals, and fossil fuels.' },
      { title: 'Construction', description: 'Different rock types serve different purposes: granite for countertops, limestone for cement, marble for sculpture.' },
      { title: 'Geology & History', description: 'Sedimentary layers reveal Earth\'s history, including ancient climates, extinct species, and past environments.' },
      { title: 'Soil Formation', description: 'Weathered rock material is the basis of soil, essential for agriculture and plant growth.' }
    ],
    conclusion: `The rock cycle demonstrates Earth's dynamic nature — nothing on our planet is truly permanent. Rocks are constantly being created, destroyed, and reformed in a cycle driven by heat from Earth's interior and energy from the Sun.`
  },
  platetectonics: {
    id: 'platetectonics',
    overview: `Plate tectonics is the theory that Earth's outer shell is divided into large plates that float on the semi-fluid asthenosphere below. These plates move, collide, and separate, causing earthquakes, volcanic activity, mountain formation, and the creation of ocean basins.`,
    howItWorks: [
      'Earth\'s lithosphere is broken into about 15 major tectonic plates.',
      'Convection currents in the mantle drive plate movement (a few centimeters per year).',
      'At divergent boundaries, plates move apart and new crust forms from rising magma.',
      'At convergent boundaries, plates collide — oceanic plates subduct under continental plates.',
      'At transform boundaries, plates slide past each other, causing earthquakes.',
      'Hot spots (like Hawaii) form where plumes of hot magma rise through the plate.'
    ],
    keyConcepts: [
      { title: 'Continental Drift', description: 'Alfred Wegener\'s theory that continents were once joined (Pangaea) and have since drifted apart.' },
      { title: 'Seafloor Spreading', description: 'New oceanic crust is created at mid-ocean ridges as magma rises and solidifies.' },
      { title: 'Subduction Zones', description: 'Where one plate dives under another, creating deep ocean trenches and volcanic arcs.' },
      { title: 'Ring of Fire', description: 'A horseshoe-shaped zone around the Pacific Ocean where most earthquakes and volcanic eruptions occur.' }
    ],
    applications: [
      { title: 'Earthquake Prediction', description: 'Understanding plate boundaries helps identify earthquake-prone regions and design safer buildings.' },
      { title: 'Volcanic Monitoring', description: 'Plate tectonics explains volcanic activity patterns and helps scientists monitor eruption risks.' },
      { title: 'Resource Location', description: 'Many mineral deposits and fossil fuels are found at ancient plate boundaries.' },
      { title: 'Understanding Geography', description: 'Plate tectonics explains why mountains, ocean trenches, and volcanic islands exist where they do.' }
    ],
    conclusion: `Plate tectonics is the unifying theory of geology, explaining the distribution of earthquakes, volcanoes, mountains, and ocean basins. It reveals Earth as a dynamic, ever-changing planet.`
  }
};

export interface EarthScienceTutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: { title: string; content: string; }[];
  quiz?: { question: string; options: string[]; correctAnswer: number; explanation: string; }[];
}

export const earthScienceTutorials: EarthScienceTutorial[] = [
  {
    id: 'weather-systems',
    title: 'Weather Systems and Patterns',
    description: 'Understand how weather forms, changes, and is predicted.',
    difficulty: 'beginner',
    duration: '12 min',
    steps: [
      { title: 'What Drives Weather?', content: 'The Sun heats Earth unevenly. Warm areas create low pressure (air rises), cool areas create high pressure (air sinks). Wind is air moving from high to low pressure.' },
      { title: 'Clouds and Precipitation', content: 'As warm air rises, it cools. Cool air holds less moisture, so water vapor condenses into tiny droplets forming clouds. When droplets grow heavy enough, they fall as precipitation.' },
      { title: 'Weather Fronts', content: 'A cold front occurs when cold air pushes under warm air — causing quick, heavy rain. A warm front occurs when warm air slides over cold air — causing light, prolonged rain.' },
      { title: 'Reading a Weather Map', content: 'H = high pressure (clear skies). L = low pressure (clouds/rain). Blue triangles = cold front. Red semicircles = warm front. Isobars connect points of equal pressure.' },
    ],
    quiz: [
      { question: 'What type of weather is associated with low pressure?', options: ['Clear and sunny', 'Cloudy and rainy', 'Cold and dry', 'Hot and dry'], correctAnswer: 1, explanation: 'Low pressure means air is rising, cooling, and condensing into clouds and precipitation.' },
      { question: 'What causes wind?', options: ['Earth rotation', 'Pressure differences', 'Ocean waves', 'Temperature alone'], correctAnswer: 1, explanation: 'Wind is caused by air moving from areas of high pressure to areas of low pressure.' },
    ]
  },
  {
    id: 'rock-cycle',
    title: 'The Rock Cycle',
    description: 'Discover how rocks are created, destroyed, and recycled over geological time.',
    difficulty: 'beginner',
    duration: '10 min',
    steps: [
      { title: 'Three Rock Types', content: 'Igneous: formed from cooled magma (granite, basalt). Sedimentary: formed from compressed sediments (sandstone, limestone). Metamorphic: transformed by heat/pressure (marble, slate).' },
      { title: 'The Cycle Process', content: 'Any rock can become any other type. Weathering breaks rocks into sediment. Heat/pressure transforms them. Melting returns them to magma. The cycle has no beginning or end.' },
      { title: 'Weathering and Erosion', content: 'Physical weathering: freezing water cracks rocks. Chemical weathering: acid rain dissolves minerals. Biological weathering: plant roots break apart rocks. Erosion transports the fragments.' },
    ],
    quiz: [
      { question: 'Which rock type often contains fossils?', options: ['Igneous', 'Sedimentary', 'Metamorphic', 'All types equally'], correctAnswer: 1, explanation: 'Sedimentary rocks form from layers of deposited material, often trapping and preserving organisms as fossils.' },
      { question: 'What transforms sedimentary rock into metamorphic rock?', options: ['Cooling', 'Heat and pressure', 'Erosion', 'Melting'], correctAnswer: 1, explanation: 'Heat and pressure deep underground change the mineral structure and texture of rocks, creating metamorphic rocks.' },
    ]
  },
  {
    id: 'plate-tectonics',
    title: 'Plate Tectonics',
    description: 'Explore how moving tectonic plates shape Earth\'s surface.',
    difficulty: 'intermediate',
    duration: '15 min',
    steps: [
      { title: 'Earth\'s Layers', content: 'Earth has layers: a solid inner core, liquid outer core, semi-fluid mantle, and solid crust (lithosphere). The lithosphere is broken into tectonic plates that float on the mantle.' },
      { title: 'Plate Boundaries', content: 'Divergent: plates move apart (mid-ocean ridges). Convergent: plates collide (mountains, subduction zones). Transform: plates slide past each other (earthquakes).' },
      { title: 'Evidence for Plate Tectonics', content: 'Matching coastlines (South America + Africa), identical fossils on separate continents, seafloor spreading at mid-ocean ridges, and distribution of earthquakes along plate boundaries.' },
      { title: 'Volcanoes and Earthquakes', content: 'Most occur at plate boundaries. The "Ring of Fire" around the Pacific has 75% of the world\'s volcanoes and 90% of earthquakes.' },
    ],
    quiz: [
      { question: 'What happens at a divergent plate boundary?', options: ['Plates collide', 'Plates move apart', 'Plates slide past each other', 'Nothing happens'], correctAnswer: 1, explanation: 'At divergent boundaries, plates move apart and new crust forms from rising magma.' },
      { question: 'What percentage of earthquakes occur in the Ring of Fire?', options: ['25%', '50%', '75%', '90%'], correctAnswer: 3, explanation: 'About 90% of the world\'s earthquakes occur along the Ring of Fire around the Pacific Ocean.' },
    ]
  }
];
