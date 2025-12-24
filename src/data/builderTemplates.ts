import { CanvasComponent } from '@/components/builder/DragDropCanvas';
import { Variable } from '@/components/builder/VariableControls';

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Physics' | 'Chemistry' | 'Electronics' | 'Mixed';
  components: CanvasComponent[];
  variables: Variable[];
  scriptCode: string;
  dataSeries?: { key: string; name: string; color: string; unit?: string }[];
}

export const builderTemplates: ExperimentTemplate[] = [
  {
    id: 'bouncing-ball',
    name: 'Bouncing Ball',
    description: 'Simple ball with gravity and floor collision',
    category: 'Physics',
    components: [
      {
        id: 'comp_ball_1',
        type: 'projectile',
        name: 'Ball',
        icon: '🎯',
        x: 200,
        y: 100,
        width: 150,
        height: 80,
        properties: { velocity: 0, angle: 90, mass: 1, restitution: 0.8 }
      },
      {
        id: 'comp_ramp_1',
        type: 'ramp',
        name: 'Floor',
        icon: '📐',
        x: 100,
        y: 300,
        width: 150,
        height: 80,
        properties: { angle: 0, friction: 0.1, isStatic: true }
      }
    ],
    variables: [
      { id: 'gravity', name: 'Gravity', value: 9.8, min: 0, max: 20, step: 0.1, unit: 'm/s²' },
      { id: 'restitution', name: 'Bounciness', value: 0.8, min: 0, max: 1, step: 0.05 }
    ],
    scriptCode: `// Bouncing ball simulation
// Modify gravity and restitution to see effects
function onUpdate(time, dt, api) {
  // Physics handled by Matter.js engine
}`,
    dataSeries: [
      { key: 'y', name: 'Height', color: 'hsl(var(--primary))', unit: 'm' },
      { key: 'velocity', name: 'Velocity', color: 'hsl(142, 71%, 45%)', unit: 'm/s' }
    ]
  },
  {
    id: 'pendulum-graph',
    name: 'Pendulum + Graph',
    description: 'Classic pendulum with real-time position and energy graphs',
    category: 'Physics',
    components: [
      {
        id: 'comp_pendulum_1',
        type: 'pendulum',
        name: 'Pendulum',
        icon: '🔄',
        x: 200,
        y: 50,
        width: 150,
        height: 80,
        properties: { length: 2, mass: 1, angle: 45, damping: 0.01 }
      },
      {
        id: 'comp_stopwatch_1',
        type: 'stopwatch',
        name: 'Timer',
        icon: '⏱️',
        x: 400,
        y: 50,
        width: 150,
        height: 80,
        properties: {}
      }
    ],
    variables: [
      { id: 'gravity', name: 'Gravity', value: 9.8, min: 1, max: 20, step: 0.1, unit: 'm/s²' },
      { id: 'length', name: 'Length', value: 2, min: 0.5, max: 5, step: 0.1, unit: 'm' },
      { id: 'damping', name: 'Damping', value: 0.01, min: 0, max: 0.5, step: 0.01 }
    ],
    scriptCode: `// Pendulum simulation with energy tracking
function onUpdate(time, dt, api) {
  const angle = api.getComponentValue('comp_pendulum_1', 'angle');
  const velocity = api.getComponentValue('comp_pendulum_1', 'velocity');
  
  // Calculate energies
  const PE = api.vars.gravity * api.vars.length * (1 - Math.cos(angle * Math.PI / 180));
  const KE = 0.5 * velocity * velocity;
  
  api.recordData({ angle, velocity, PE, KE, total: PE + KE });
}`,
    dataSeries: [
      { key: 'angle', name: 'Angle', color: 'hsl(var(--primary))', unit: '°' },
      { key: 'PE', name: 'Potential E', color: 'hsl(45, 93%, 47%)', unit: 'J' },
      { key: 'KE', name: 'Kinetic E', color: 'hsl(0, 84%, 60%)', unit: 'J' }
    ]
  },
  {
    id: 'collision-elastic',
    name: 'Collision Lab',
    description: 'Compare elastic vs inelastic collisions with momentum conservation',
    category: 'Physics',
    components: [
      {
        id: 'comp_ball_1',
        type: 'collision',
        name: 'Ball 1',
        icon: '💥',
        x: 100,
        y: 150,
        width: 150,
        height: 80,
        properties: { mass: 2, velocity: 5, elastic: true }
      },
      {
        id: 'comp_ball_2',
        type: 'collision',
        name: 'Ball 2',
        icon: '💥',
        x: 350,
        y: 150,
        width: 150,
        height: 80,
        properties: { mass: 1, velocity: -3, elastic: true }
      },
      {
        id: 'comp_scale_1',
        type: 'scale',
        name: 'Momentum Meter',
        icon: '⚖️',
        x: 225,
        y: 280,
        width: 150,
        height: 80,
        properties: { precision: 0.01 }
      }
    ],
    variables: [
      { id: 'mass1', name: 'Mass 1', value: 2, min: 0.5, max: 10, step: 0.5, unit: 'kg' },
      { id: 'mass2', name: 'Mass 2', value: 1, min: 0.5, max: 10, step: 0.5, unit: 'kg' },
      { id: 'v1', name: 'Velocity 1', value: 5, min: -10, max: 10, step: 1, unit: 'm/s' },
      { id: 'v2', name: 'Velocity 2', value: -3, min: -10, max: 10, step: 1, unit: 'm/s' }
    ],
    scriptCode: `// Collision simulation - momentum is always conserved!
function onUpdate(time, dt, api) {
  const p1 = api.vars.mass1 * api.vars.v1;
  const p2 = api.vars.mass2 * api.vars.v2;
  const totalP = p1 + p2;
  
  const KE1 = 0.5 * api.vars.mass1 * api.vars.v1 ** 2;
  const KE2 = 0.5 * api.vars.mass2 * api.vars.v2 ** 2;
  
  api.recordData({ momentum: totalP, kineticEnergy: KE1 + KE2 });
}`,
    dataSeries: [
      { key: 'momentum', name: 'Total Momentum', color: 'hsl(var(--primary))', unit: 'kg·m/s' },
      { key: 'kineticEnergy', name: 'Kinetic Energy', color: 'hsl(0, 84%, 60%)', unit: 'J' }
    ]
  },
  {
    id: 'simple-circuit',
    name: 'Battery → LED Circuit',
    description: 'Basic circuit with battery, resistor, and LED',
    category: 'Electronics',
    components: [
      {
        id: 'comp_battery_1',
        type: 'battery',
        name: 'Battery',
        icon: '🔋',
        x: 50,
        y: 150,
        width: 150,
        height: 80,
        properties: { voltage: 9 }
      },
      {
        id: 'comp_resistor_1',
        type: 'resistor',
        name: 'Resistor',
        icon: '〓',
        x: 250,
        y: 150,
        width: 150,
        height: 80,
        properties: { resistance: 330, unit: 'Ω' }
      },
      {
        id: 'comp_led_1',
        type: 'led',
        name: 'LED',
        icon: '💡',
        x: 450,
        y: 150,
        width: 150,
        height: 80,
        properties: { color: 'red', voltage: 2 }
      }
    ],
    variables: [
      { id: 'voltage', name: 'Battery Voltage', value: 9, min: 1, max: 24, step: 0.5, unit: 'V' },
      { id: 'resistance', name: 'Resistance', value: 330, min: 10, max: 1000, step: 10, unit: 'Ω' }
    ],
    scriptCode: `// Ohm's Law: V = I × R
function onUpdate(time, dt, api) {
  const V = api.vars.voltage;
  const R = api.vars.resistance;
  const ledVoltage = 2; // LED forward voltage
  
  const I = (V - ledVoltage) / R;
  const power = I * V;
  
  api.recordData({ current: I * 1000, power: power * 1000 }); // mA and mW
}`,
    dataSeries: [
      { key: 'current', name: 'Current', color: 'hsl(45, 93%, 47%)', unit: 'mA' },
      { key: 'power', name: 'Power', color: 'hsl(0, 84%, 60%)', unit: 'mW' }
    ]
  },
  {
    id: 'heated-beaker',
    name: 'Heated Beaker',
    description: 'Heat a beaker and observe temperature changes',
    category: 'Chemistry',
    components: [
      {
        id: 'comp_beaker_1',
        type: 'beaker',
        name: 'Beaker',
        icon: '🧪',
        x: 200,
        y: 50,
        width: 150,
        height: 80,
        properties: { volume: 500, content: 'water' }
      },
      {
        id: 'comp_burner_1',
        type: 'burner',
        name: 'Bunsen Burner',
        icon: '🔥',
        x: 200,
        y: 200,
        width: 150,
        height: 80,
        properties: { temperature: 500, active: true }
      },
      {
        id: 'comp_thermo_1',
        type: 'thermometer',
        name: 'Thermometer',
        icon: '🌡️',
        x: 400,
        y: 50,
        width: 150,
        height: 80,
        properties: { unit: 'C' }
      }
    ],
    variables: [
      { id: 'heatRate', name: 'Heat Rate', value: 50, min: 10, max: 200, step: 10, unit: 'J/s' },
      { id: 'volume', name: 'Water Volume', value: 500, min: 100, max: 1000, step: 50, unit: 'mL' }
    ],
    scriptCode: `// Heating water simulation
// Q = mcΔT, where c = 4.186 J/(g·°C) for water
let temperature = 25;

function onUpdate(time, dt, api) {
  const c = 4.186; // specific heat of water
  const mass = api.vars.volume; // 1 mL = 1 g for water
  
  // Heat gained per second
  const dT = (api.vars.heatRate * dt) / (mass * c);
  temperature = Math.min(100, temperature + dT);
  
  api.recordData({ temperature, boiling: temperature >= 100 ? 1 : 0 });
}`,
    dataSeries: [
      { key: 'temperature', name: 'Temperature', color: 'hsl(0, 84%, 60%)', unit: '°C' }
    ]
  },
  {
    id: 'projectile-launch',
    name: 'Projectile Launch',
    description: 'Launch projectiles with adjustable velocity and angle',
    category: 'Mixed',
    components: [
      {
        id: 'comp_projectile_1',
        type: 'projectile',
        name: 'Projectile',
        icon: '🎯',
        x: 50,
        y: 250,
        width: 150,
        height: 80,
        properties: { velocity: 20, angle: 45 }
      },
      {
        id: 'comp_ruler_1',
        type: 'ruler',
        name: 'Distance Marker',
        icon: '📏',
        x: 300,
        y: 300,
        width: 150,
        height: 80,
        properties: { unit: 'm' }
      },
      {
        id: 'comp_stopwatch_1',
        type: 'stopwatch',
        name: 'Timer',
        icon: '⏱️',
        x: 300,
        y: 50,
        width: 150,
        height: 80,
        properties: {}
      }
    ],
    variables: [
      { id: 'velocity', name: 'Initial Velocity', value: 20, min: 5, max: 50, step: 1, unit: 'm/s' },
      { id: 'angle', name: 'Launch Angle', value: 45, min: 5, max: 85, step: 1, unit: '°' },
      { id: 'gravity', name: 'Gravity', value: 9.8, min: 1, max: 20, step: 0.1, unit: 'm/s²' }
    ],
    scriptCode: `// Projectile motion equations
function onUpdate(time, dt, api) {
  const v0 = api.vars.velocity;
  const theta = api.vars.angle * Math.PI / 180;
  const g = api.vars.gravity;
  
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta) - g * time;
  
  const x = vx * time;
  const y = v0 * Math.sin(theta) * time - 0.5 * g * time * time;
  
  if (y >= 0) {
    api.recordData({ x, y, vx, vy: Math.abs(vy) });
  }
}`,
    dataSeries: [
      { key: 'x', name: 'X Position', color: 'hsl(var(--primary))', unit: 'm' },
      { key: 'y', name: 'Y Position', color: 'hsl(142, 71%, 45%)', unit: 'm' }
    ]
  }
];
