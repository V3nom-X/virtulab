import { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';

interface PendulumSimulationProps {
  mass: number;
  length: number;
  gravity: number;
  angle: number;
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; angle: number; velocity: number; energy: number }) => void;
}

export const PendulumSimulation = ({
  mass,
  length,
  gravity,
  angle,
  isPlaying,
  speed,
  onDataUpdate
}: PendulumSimulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const bobRef = useRef<Matter.Body | null>(null);
  const [time, setTime] = useState(0);

  const initSimulation = useCallback(() => {
    if (!canvasRef.current) return;

    // Clean up previous simulation
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Create engine
    const engine = Matter.Engine.create();
    engine.gravity.y = gravity / 10; // Scale gravity
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Pivot point
    const pivotX = width / 2;
    const pivotY = height * 0.15;
    const ropeLength = length * 120; // Scale length to pixels

    // Calculate initial position
    const angleRad = (angle * Math.PI) / 180;
    const bobX = pivotX + ropeLength * Math.sin(angleRad);
    const bobY = pivotY + ropeLength * Math.cos(angleRad);

    // Create bob
    const bob = Matter.Bodies.circle(bobX, bobY, 15 + mass * 5, {
      density: mass * 0.001,
      friction: 0,
      frictionAir: 0.001,
      restitution: 0.9,
      render: {
        fillStyle: 'hsl(168, 76%, 46%)', // Primary color
        strokeStyle: 'hsl(168, 76%, 36%)',
        lineWidth: 2
      }
    });
    bobRef.current = bob;

    // Create pivot (static)
    const pivot = Matter.Bodies.circle(pivotX, pivotY, 8, {
      isStatic: true,
      render: {
        fillStyle: 'hsl(220, 9%, 16%)',
        strokeStyle: 'hsl(220, 9%, 26%)',
        lineWidth: 2
      }
    });

    // Create constraint (rope)
    const constraint = Matter.Constraint.create({
      bodyA: pivot,
      bodyB: bob,
      length: ropeLength,
      stiffness: 1,
      damping: 0,
      render: {
        strokeStyle: 'hsl(220, 9%, 36%)',
        lineWidth: 2
      }
    });
    constraintRef.current = constraint;

    // Add to world
    Matter.Composite.add(engine.world, [pivot, bob, constraint]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Start render
    Matter.Render.run(render);
    
    setTime(0);
  }, [mass, length, gravity, angle]);

  // Initialize simulation on mount and parameter changes
  useEffect(() => {
    initSimulation();

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
    };
  }, [initSimulation]);

  // Handle play/pause
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isPlaying) {
      runnerRef.current.delta = (1000 / 60) / speed;
      Matter.Runner.run(runnerRef.current, engineRef.current);
      
      // Data update interval
      const interval = setInterval(() => {
        if (bobRef.current && constraintRef.current) {
          const bob = bobRef.current;
          const pivotX = canvasRef.current!.clientWidth / 2;
          const pivotY = canvasRef.current!.clientHeight * 0.15;
          
          const dx = bob.position.x - pivotX;
          const dy = bob.position.y - pivotY;
          const currentAngle = Math.atan2(dx, dy) * (180 / Math.PI);
          const velocity = Math.sqrt(bob.velocity.x ** 2 + bob.velocity.y ** 2);
          const kineticEnergy = 0.5 * mass * velocity ** 2;
          const potentialEnergy = mass * gravity * (length * 120 - dy);
          
          setTime(t => t + 0.016 * speed);
          
          onDataUpdate?.({
            time: time,
            angle: currentAngle,
            velocity,
            energy: kineticEnergy + potentialEnergy
          });
        }
      }, 16);
      
      return () => clearInterval(interval);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isPlaying, speed, mass, gravity, length, time, onDataUpdate]);

  // Handle gravity changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = gravity / 10;
    }
  }, [gravity]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};
