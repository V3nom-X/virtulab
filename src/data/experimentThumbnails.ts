// Experiment thumbnail images
import diffusionOsmosis from '@/assets/experiments/diffusion-osmosis.jpg';
import projectile from '@/assets/experiments/projectile.jpg';
import ohmslaw from '@/assets/experiments/ohmslaw.jpg';
import lightoptics from '@/assets/experiments/lightoptics.jpg';
import wave from '@/assets/experiments/wave.jpg';
import collision from '@/assets/experiments/collision.jpg';
import chemistry from '@/assets/experiments/chemistry.jpg';

export const experimentThumbnails: Record<string, string> = {
  diffusionosmosis: diffusionOsmosis,
  'diffusion-osmosis': diffusionOsmosis,
  projectile: projectile,
  ohmslaw: ohmslaw,
  lightoptics: lightoptics,
  wave: wave,
  collision: collision,
  chemistry: chemistry,
  acidbase: chemistry,
  statesofmatter: chemistry,
  // Fallback mappings for remaining experiments
  pendulum: wave,
  spring: wave,
  buoyancy: projectile,
  friction: projectile,
  lever: projectile,
  inclinedplane: projectile,
  expansion: lightoptics,
  emspectrum: lightoptics,
};

export const getExperimentThumbnail = (simulationType?: string | null): string | null => {
  if (!simulationType) return null;
  return experimentThumbnails[simulationType] || null;
};
