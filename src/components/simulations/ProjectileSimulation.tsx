import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

interface ProjectileSimulationProps {
  velocity: number;
  angle: number;
  gravity: number;
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { x: number; y: number; vx: number; vy: number; time: number }) => void;
}

export interface ProjectileSimulationHandle {
  reset: () => void;
}

export const ProjectileSimulation = forwardRef<ProjectileSimulationHandle, ProjectileSimulationProps>(({
  velocity,
  angle,
  gravity,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const projectileRef = useRef<Matter.Body | null>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const startTimeRef = useRef<number>(0);

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
    engine.gravity.y = gravity / 10;
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

    // Ground
    const ground = Matter.Bodies.rectangle(width / 2, height - 10, width, 20, {
      isStatic: true,
      render: {
        fillStyle: 'hsl(142, 76%, 36%)',
        strokeStyle: 'hsl(142, 76%, 26%)',
        lineWidth: 2
      }
    });

    // Launcher platform
    const platform = Matter.Bodies.rectangle(60, height - 50, 80, 20, {
      isStatic: true,
      render: {
        fillStyle: 'hsl(220, 9%, 36%)',
        strokeStyle: 'hsl(220, 9%, 26%)',
        lineWidth: 2
      }
    });

    // Projectile (starts at launcher)
    const angleRad = (angle * Math.PI) / 180;
    const projectile = Matter.Bodies.circle(60, height - 70, 12, {
      restitution: 0.6,
      friction: 0.1,
      frictionAir: 0.001,
      render: {
        fillStyle: 'hsl(0, 84%, 60%)',
        strokeStyle: 'hsl(0, 84%, 50%)',
        lineWidth: 2
      }
    });
    projectileRef.current = projectile;

    // Apply initial velocity
    const vx = velocity * Math.cos(angleRad) * 0.5;
    const vy = -velocity * Math.sin(angleRad) * 0.5;
    Matter.Body.setVelocity(projectile, { x: vx, y: vy });

    // Add to world
    Matter.Composite.add(engine.world, [ground, platform, projectile]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Clear trail
    trailRef.current = [];
    startTimeRef.current = Date.now();

    // Custom render with trail
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const proj = projectileRef.current;
      
      if (proj) {
        // Add to trail
        trailRef.current.push({ x: proj.position.x, y: proj.position.y });
        if (trailRef.current.length > 200) trailRef.current.shift();

        // Draw trail
        if (trailRef.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
          for (let i = 1; i < trailRef.current.length; i++) {
            ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
          }
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw velocity vector
        const scale = 3;
        ctx.beginPath();
        ctx.moveTo(proj.position.x, proj.position.y);
        ctx.lineTo(
          proj.position.x + proj.velocity.x * scale,
          proj.position.y + proj.velocity.y * scale
        );
        ctx.strokeStyle = 'hsl(168, 76%, 46%)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrow head
        const arrowSize = 8;
        const vAngle = Math.atan2(proj.velocity.y, proj.velocity.x);
        ctx.beginPath();
        ctx.moveTo(
          proj.position.x + proj.velocity.x * scale,
          proj.position.y + proj.velocity.y * scale
        );
        ctx.lineTo(
          proj.position.x + proj.velocity.x * scale - arrowSize * Math.cos(vAngle - Math.PI / 6),
          proj.position.y + proj.velocity.y * scale - arrowSize * Math.sin(vAngle - Math.PI / 6)
        );
        ctx.moveTo(
          proj.position.x + proj.velocity.x * scale,
          proj.position.y + proj.velocity.y * scale
        );
        ctx.lineTo(
          proj.position.x + proj.velocity.x * scale - arrowSize * Math.cos(vAngle + Math.PI / 6),
          proj.position.y + proj.velocity.y * scale - arrowSize * Math.sin(vAngle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    // Start render
    Matter.Render.run(render);

  }, [velocity, angle, gravity]);

  const resetSimulation = useCallback(() => {
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    trailRef.current = [];
    initSimulation();
  }, [initSimulation]);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: resetSimulation
  }), [resetSimulation]);

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

  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isPlaying) {
      runnerRef.current.delta = (1000 / 60) / speed;
      Matter.Runner.run(runnerRef.current, engineRef.current);

      const interval = setInterval(() => {
        if (projectileRef.current && canvasRef.current) {
          const proj = projectileRef.current;
          const height = canvasRef.current.clientHeight;
          
          onDataUpdate?.({
            x: proj.position.x,
            y: height - proj.position.y,
            vx: proj.velocity.x,
            vy: -proj.velocity.y,
            time: (Date.now() - startTimeRef.current) / 1000
          });
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isPlaying, speed, onDataUpdate]);

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
});

ProjectileSimulation.displayName = 'ProjectileSimulation';
