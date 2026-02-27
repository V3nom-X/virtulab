// Experiment thumbnail images
import diffusionOsmosis from '@/assets/experiments/diffusion-osmosis.jpg';
import projectile from '@/assets/experiments/projectile.jpg';
import ohmslaw from '@/assets/experiments/ohmslaw.jpg';
import lightoptics from '@/assets/experiments/lightoptics.jpg';
import wave from '@/assets/experiments/wave.jpg';
import collision from '@/assets/experiments/collision.jpg';
import chemistry from '@/assets/experiments/chemistry.jpg';
import pendulum from '@/assets/experiments/pendulum.jpg';
import spring from '@/assets/experiments/spring.jpg';
import buoyancy from '@/assets/experiments/buoyancy.jpg';
import friction from '@/assets/experiments/friction.jpg';
import lever from '@/assets/experiments/lever.jpg';
import inclinedplane from '@/assets/experiments/inclinedplane.jpg';
import expansion from '@/assets/experiments/expansion.jpg';
import emspectrum from '@/assets/experiments/emspectrum.jpg';

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
  pendulum: pendulum,
  spring: spring,
  buoyancy: buoyancy,
  friction: friction,
  lever: lever,
  inclinedplane: inclinedplane,
  expansion: expansion,
  emspectrum: emspectrum,
};

export const getExperimentThumbnail = (simulationType?: string | null): string | null => {
  if (!simulationType) return null;
  return experimentThumbnails[simulationType] || null;
};
