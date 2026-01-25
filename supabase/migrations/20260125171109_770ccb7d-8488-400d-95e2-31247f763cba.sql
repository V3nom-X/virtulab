-- Delete non-working experiments (keep pendulum, projectile, spring, wave)
DELETE FROM experiments WHERE simulation_type IN ('cell', 'reaction', 'ecosystem', 'molecule', 'tectonics', 'rock_cycle', 'weather');

-- Update circuit to use ohmslaw
UPDATE experiments SET simulation_type = 'ohmslaw', title = 'Ohm''s Law Circuit', description = 'Explore the relationship between voltage, current, and resistance with an interactive circuit simulation featuring animated electron flow.' WHERE simulation_type = 'circuit';

-- Insert new experiments aligned with the knowledge base
INSERT INTO experiments (title, description, category, difficulty, duration_minutes, simulation_type, is_featured) VALUES
('Inclined Plane Motion', 'Study motion on sloping surfaces with adjustable angle and friction. Visualize force vectors and calculate acceleration.', 'physics', 'intermediate', 15, 'inclinedplane', false),
('Light Reflection and Refraction', 'Explore how light behaves at surfaces using ray optics, Snell''s Law, and total internal reflection.', 'physics', 'intermediate', 20, 'lightoptics', false),
('Buoyancy and Floating', 'Understand why objects float or sink using Archimedes'' Principle with adjustable object and fluid densities.', 'physics', 'beginner', 15, 'buoyancy', false),
('Collision and Momentum', 'Explore elastic and inelastic collisions to understand momentum conservation and energy transfer.', 'physics', 'intermediate', 15, 'collision', true);