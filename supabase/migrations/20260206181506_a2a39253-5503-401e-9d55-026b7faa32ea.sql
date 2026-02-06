
-- Insert new experiments from the research document
INSERT INTO experiments (title, description, category, difficulty, simulation_type, duration_minutes, is_featured)
VALUES 
  ('Acids, Bases, and Indicators', 'Explore the pH scale, test substances with indicators, and observe color changes that reveal acidic or basic properties.', 'chemistry', 'beginner', 'acidbase', 15, true),
  ('Friction and Its Effects', 'Investigate how friction affects motion on different surfaces. Measure the force needed to move objects and understand static vs kinetic friction.', 'physics', 'beginner', 'friction', 15, true),
  ('Load, Effort, and Fulcrum (Lever)', 'Experiment with levers to understand mechanical advantage. Move the fulcrum and adjust loads to discover how simple machines multiply force.', 'physics', 'intermediate', 'lever', 20, true),
  ('Expansion and Contraction of Materials', 'Observe how materials expand when heated and contract when cooled. Compare thermal expansion across solids, liquids, and gases.', 'physics', 'beginner', 'expansion', 15, true),
  ('States of Matter and Changes of State', 'Explore solids, liquids, and gases. Apply heat or cooling to observe melting, boiling, condensation, and freezing in real time.', 'chemistry', 'beginner', 'statesofmatter', 20, true),
  ('Diffusion and Osmosis in Living Things', 'Simulate how molecules move across membranes. Observe diffusion in action and understand osmosis in plant and animal cells.', 'biology', 'intermediate', 'diffusion', 20, true);
