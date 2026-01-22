// 3D Builder Component Library - JSON format component definitions
export interface Builder3DComponent {
  id: string;
  name: string;
  category: 'containers' | 'equipment' | 'sensors' | 'physics' | 'chemistry' | 'electronics';
  icon: string;
  description: string;
  modelType: 'primitive' | 'custom'; // primitive = Three.js built-in, custom = .glb file
  primitiveConfig?: {
    geometry: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane';
    color: string;
    scale: [number, number, number];
  };
  modelUrl?: string; // For custom models
  properties: Record<string, {
    type: 'number' | 'string' | 'boolean' | 'color' | 'select';
    default: any;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    unit?: string;
  }>;
  snapPoints?: { position: [number, number, number]; direction: [number, number, number] }[];
}

export const builder3DComponents: Builder3DComponent[] = [
  // Containers
  {
    id: 'beaker',
    name: 'Beaker',
    category: 'containers',
    icon: '🧪',
    description: 'Standard laboratory beaker for holding liquids',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#88ccff',
      scale: [1, 1.5, 1],
    },
    properties: {
      volume: { type: 'number', default: 250, label: 'Volume', min: 50, max: 2000, step: 50, unit: 'mL' },
      material: { type: 'select', default: 'glass', label: 'Material', options: ['glass', 'plastic', 'pyrex'] },
      fillLevel: { type: 'number', default: 0, label: 'Fill Level', min: 0, max: 100, step: 5, unit: '%' },
      liquidColor: { type: 'color', default: '#4488ff', label: 'Liquid Color' },
    },
    snapPoints: [
      { position: [0, 1.5, 0], direction: [0, 1, 0] },
      { position: [0, 0, 0], direction: [0, -1, 0] },
    ],
  },
  {
    id: 'flask',
    name: 'Erlenmeyer Flask',
    category: 'containers',
    icon: '⚗️',
    description: 'Conical flask for mixing and heating',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cone',
      color: '#88ccff',
      scale: [1.2, 1.8, 1.2],
    },
    properties: {
      volume: { type: 'number', default: 500, label: 'Volume', min: 100, max: 2000, step: 100, unit: 'mL' },
      fillLevel: { type: 'number', default: 0, label: 'Fill Level', min: 0, max: 100, step: 5, unit: '%' },
      liquidColor: { type: 'color', default: '#44ff88', label: 'Liquid Color' },
    },
  },
  {
    id: 'test-tube',
    name: 'Test Tube',
    category: 'containers',
    icon: '🧫',
    description: 'Small cylindrical tube for samples',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#aaddff',
      scale: [0.3, 2, 0.3],
    },
    properties: {
      volume: { type: 'number', default: 20, label: 'Volume', min: 5, max: 50, step: 5, unit: 'mL' },
      fillLevel: { type: 'number', default: 0, label: 'Fill Level', min: 0, max: 100, step: 10, unit: '%' },
    },
  },
  
  // Equipment
  {
    id: 'bunsen-burner',
    name: 'Bunsen Burner',
    category: 'equipment',
    icon: '🔥',
    description: 'Gas burner for heating',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#666666',
      scale: [0.5, 1, 0.5],
    },
    properties: {
      flameHeight: { type: 'number', default: 5, label: 'Flame Height', min: 0, max: 15, step: 1, unit: 'cm' },
      gasFlow: { type: 'number', default: 50, label: 'Gas Flow', min: 0, max: 100, step: 10, unit: '%' },
      isLit: { type: 'boolean', default: false, label: 'Lit' },
    },
  },
  {
    id: 'hot-plate',
    name: 'Hot Plate',
    category: 'equipment',
    icon: '♨️',
    description: 'Electric heating surface',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'box',
      color: '#444444',
      scale: [2, 0.3, 2],
    },
    properties: {
      temperature: { type: 'number', default: 25, label: 'Temperature', min: 20, max: 400, step: 10, unit: '°C' },
      isOn: { type: 'boolean', default: false, label: 'Power On' },
    },
  },
  {
    id: 'tripod',
    name: 'Tripod Stand',
    category: 'equipment',
    icon: '🔺',
    description: 'Support stand for heating',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'torus',
      color: '#888888',
      scale: [1, 0.2, 1],
    },
    properties: {
      height: { type: 'number', default: 15, label: 'Height', min: 10, max: 30, step: 2, unit: 'cm' },
    },
  },
  
  // Physics
  {
    id: 'ball',
    name: 'Sphere',
    category: 'physics',
    icon: '⚪',
    description: 'Spherical object for physics simulations',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'sphere',
      color: '#ff6644',
      scale: [1, 1, 1],
    },
    properties: {
      mass: { type: 'number', default: 1, label: 'Mass', min: 0.1, max: 100, step: 0.1, unit: 'kg' },
      radius: { type: 'number', default: 0.5, label: 'Radius', min: 0.1, max: 5, step: 0.1, unit: 'm' },
      bounciness: { type: 'number', default: 0.8, label: 'Bounciness', min: 0, max: 1, step: 0.1 },
      color: { type: 'color', default: '#ff6644', label: 'Color' },
    },
  },
  {
    id: 'cube',
    name: 'Cube',
    category: 'physics',
    icon: '🟦',
    description: 'Cubic object for physics simulations',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'box',
      color: '#4466ff',
      scale: [1, 1, 1],
    },
    properties: {
      mass: { type: 'number', default: 1, label: 'Mass', min: 0.1, max: 100, step: 0.1, unit: 'kg' },
      size: { type: 'number', default: 1, label: 'Size', min: 0.1, max: 5, step: 0.1, unit: 'm' },
      friction: { type: 'number', default: 0.5, label: 'Friction', min: 0, max: 1, step: 0.1 },
      color: { type: 'color', default: '#4466ff', label: 'Color' },
    },
  },
  {
    id: 'ramp',
    name: 'Inclined Ramp',
    category: 'physics',
    icon: '📐',
    description: 'Angled surface for rolling experiments',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'box',
      color: '#885533',
      scale: [3, 0.2, 1.5],
    },
    properties: {
      angle: { type: 'number', default: 30, label: 'Angle', min: 0, max: 90, step: 5, unit: '°' },
      length: { type: 'number', default: 2, label: 'Length', min: 0.5, max: 5, step: 0.5, unit: 'm' },
      friction: { type: 'number', default: 0.3, label: 'Friction', min: 0, max: 1, step: 0.1 },
    },
  },
  {
    id: 'pendulum',
    name: 'Pendulum',
    category: 'physics',
    icon: '🎯',
    description: 'Swinging pendulum for oscillation studies',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'sphere',
      color: '#ffaa00',
      scale: [0.5, 0.5, 0.5],
    },
    properties: {
      length: { type: 'number', default: 2, label: 'String Length', min: 0.5, max: 5, step: 0.1, unit: 'm' },
      mass: { type: 'number', default: 1, label: 'Bob Mass', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
      initialAngle: { type: 'number', default: 30, label: 'Initial Angle', min: 0, max: 90, step: 5, unit: '°' },
    },
  },
  {
    id: 'spring',
    name: 'Spring',
    category: 'physics',
    icon: '🌀',
    description: 'Elastic spring for oscillation',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#00aaff',
      scale: [0.3, 2, 0.3],
    },
    properties: {
      stiffness: { type: 'number', default: 100, label: 'Spring Constant', min: 10, max: 500, step: 10, unit: 'N/m' },
      restLength: { type: 'number', default: 1, label: 'Rest Length', min: 0.5, max: 3, step: 0.1, unit: 'm' },
      damping: { type: 'number', default: 0.1, label: 'Damping', min: 0, max: 1, step: 0.05 },
    },
  },

  // Sensors
  {
    id: 'thermometer',
    name: 'Thermometer',
    category: 'sensors',
    icon: '🌡️',
    description: 'Temperature measurement device',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#ff3333',
      scale: [0.1, 2, 0.1],
    },
    properties: {
      minTemp: { type: 'number', default: -20, label: 'Min Temp', min: -50, max: 0, step: 10, unit: '°C' },
      maxTemp: { type: 'number', default: 120, label: 'Max Temp', min: 50, max: 500, step: 10, unit: '°C' },
      unit: { type: 'select', default: 'celsius', label: 'Unit', options: ['celsius', 'fahrenheit', 'kelvin'] },
    },
  },
  {
    id: 'timer',
    name: 'Stopwatch',
    category: 'sensors',
    icon: '⏱️',
    description: 'Time measurement device',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#333333',
      scale: [0.8, 0.2, 0.8],
    },
    properties: {
      precision: { type: 'select', default: 'ms', label: 'Precision', options: ['s', 'ms', 'μs'] },
    },
  },

  // Chemistry
  {
    id: 'molecule-h2o',
    name: 'Water Molecule',
    category: 'chemistry',
    icon: '💧',
    description: 'H₂O water molecule model',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'sphere',
      color: '#0088ff',
      scale: [0.8, 0.8, 0.8],
    },
    properties: {
      showBonds: { type: 'boolean', default: true, label: 'Show Bonds' },
      showLabels: { type: 'boolean', default: false, label: 'Show Labels' },
    },
  },
  {
    id: 'molecule-co2',
    name: 'Carbon Dioxide',
    category: 'chemistry',
    icon: '☁️',
    description: 'CO₂ carbon dioxide molecule',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'sphere',
      color: '#444444',
      scale: [0.6, 0.6, 0.6],
    },
    properties: {
      showBonds: { type: 'boolean', default: true, label: 'Show Bonds' },
      showLabels: { type: 'boolean', default: false, label: 'Show Labels' },
    },
  },

  // Electronics
  {
    id: 'battery',
    name: 'Battery',
    category: 'electronics',
    icon: '🔋',
    description: 'Power source for circuits',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#333333',
      scale: [0.4, 1, 0.4],
    },
    properties: {
      voltage: { type: 'number', default: 9, label: 'Voltage', min: 1.5, max: 24, step: 1.5, unit: 'V' },
      capacity: { type: 'number', default: 2000, label: 'Capacity', min: 500, max: 10000, step: 500, unit: 'mAh' },
    },
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'electronics',
    icon: '⚡',
    description: 'Electrical resistance component',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'cylinder',
      color: '#aa8866',
      scale: [0.2, 0.8, 0.2],
    },
    properties: {
      resistance: { type: 'number', default: 1000, label: 'Resistance', min: 1, max: 100000, step: 100, unit: 'Ω' },
      tolerance: { type: 'select', default: '5%', label: 'Tolerance', options: ['1%', '5%', '10%'] },
    },
  },
  {
    id: 'led',
    name: 'LED',
    category: 'electronics',
    icon: '💡',
    description: 'Light emitting diode',
    modelType: 'primitive',
    primitiveConfig: {
      geometry: 'sphere',
      color: '#ff0000',
      scale: [0.3, 0.3, 0.3],
    },
    properties: {
      color: { type: 'color', default: '#ff0000', label: 'LED Color' },
      forwardVoltage: { type: 'number', default: 2.1, label: 'Forward Voltage', min: 1.8, max: 3.5, step: 0.1, unit: 'V' },
    },
  },
];

// Get components by category
export const getComponentsByCategory = (category: Builder3DComponent['category']) => 
  builder3DComponents.filter(c => c.category === category);

// Get all categories
export const getCategories = () => 
  [...new Set(builder3DComponents.map(c => c.category))];

// Search components
export const searchComponents = (query: string) => 
  builder3DComponents.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );
