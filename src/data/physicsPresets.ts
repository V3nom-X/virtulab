export interface PhysicsPreset {
  id: string;
  name: string;
  gravity: number;
  description: string;
  icon: string;
}

export const physicsPresets: PhysicsPreset[] = [
  { id: 'earth', name: 'Earth', gravity: 9.8, description: 'Standard gravity', icon: '🌍' },
  { id: 'moon', name: 'Moon', gravity: 1.62, description: 'Lunar gravity', icon: '🌙' },
  { id: 'mars', name: 'Mars', gravity: 3.71, description: 'Martian gravity', icon: '🔴' },
  { id: 'jupiter', name: 'Jupiter', gravity: 24.79, description: 'Gas giant gravity', icon: '🟤' },
  { id: 'space', name: 'Space', gravity: 0, description: 'Zero gravity', icon: '🚀' },
  { id: 'underwater', name: 'Underwater', gravity: 1.0, description: 'Buoyancy simulation', icon: '🌊' },
  { id: 'custom', name: 'Custom', gravity: 9.8, description: 'Set your own value', icon: '⚙️' },
];

export function getPresetByGravity(gravity: number): PhysicsPreset | undefined {
  return physicsPresets.find(p => Math.abs(p.gravity - gravity) < 0.01 && p.id !== 'custom');
}
