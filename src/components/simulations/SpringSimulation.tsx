import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

interface SpringSimulationProps {
  mass: number;
  springConstant: number;
  damping: number;
  displacement: number;
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { displacement: number; velocity: number; force: number; time: number }) => void;
}

export interface SpringSimulationHandle {
  reset: () => void;
}

export const SpringSimulation = forwardRef<SpringSimulationHandle, SpringSimulationProps>(({
  mass,
  springConstant,
  damping,
  displacement,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const massRef = useRef<Matter.Body | null>(null);
  const equilibriumYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const springConstantRef = useRef(springConstant);
  const isInitializedRef = useRef(false);

  // Keep spring constant in sync
  springConstantRef.current = springConstant;

  const initSimulation = useCallback((props: { mass: number; springConstant: number; damping: number; displacement: number }) => {
    if (!canvasRef.current) return;

    // Clean up previous simulation - don't remove the canvas since we provide it
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
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
    engine.gravity.y = 0;
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

    // Fixed anchor
    const anchorY = height * 0.1;
    const anchor = Matter.Bodies.rectangle(width / 2, anchorY, 100, 20, {
      isStatic: true,
      render: {
        fillStyle: 'hsl(220, 9%, 36%)',
        strokeStyle: 'hsl(220, 9%, 26%)',
        lineWidth: 2
      }
    });

    // Equilibrium position
    const equilibriumY = height * 0.5;
    equilibriumYRef.current = equilibriumY;

    // Mass block
    const initialY = equilibriumY + props.displacement * 50;
    const massBody = Matter.Bodies.rectangle(width / 2, initialY, 60 + props.mass * 10, 60 + props.mass * 10, {
      frictionAir: props.damping * 0.01,
      render: {
        fillStyle: 'hsl(168, 76%, 46%)',
        strokeStyle: 'hsl(168, 76%, 36%)',
        lineWidth: 2
      }
    });
    massRef.current = massBody;

    // Add to world
    Matter.Composite.add(engine.world, [anchor, massBody]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    startTimeRef.current = Date.now();

    // Spring force - applied on each update using ref for current value
    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (massRef.current) {
        const currentY = massRef.current.position.y;
        const displacementFromEquilibrium = currentY - equilibriumYRef.current;
        
        // Hooke's Law: F = -kx (using ref for current value)
        const springForce = -springConstantRef.current * displacementFromEquilibrium * 0.0001;
        
        Matter.Body.applyForce(massRef.current, massRef.current.position, {
          x: 0,
          y: springForce
        });
      }
    });

    // Custom render for spring visualization
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const massBody = massRef.current;
      
      if (massBody) {
        // Draw spring
        const springTop = anchorY + 10;
        const springBottom = massBody.position.y - (30 + props.mass * 5);
        const springHeight = springBottom - springTop;
        const coils = 12;
        const coilWidth = 30;
        
        ctx.beginPath();
        ctx.moveTo(width / 2, springTop);
        
        for (let i = 0; i <= coils; i++) {
          const y = springTop + (springHeight / coils) * i;
          const x = width / 2 + (i % 2 === 0 ? coilWidth : -coilWidth);
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width / 2, springBottom);
        ctx.strokeStyle = 'hsl(220, 9%, 46%)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw equilibrium line
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(width * 0.3, equilibriumYRef.current);
        ctx.lineTo(width * 0.7, equilibriumYRef.current);
        ctx.strokeStyle = 'rgba(168, 168, 168, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = 'hsl(220, 9%, 46%)';
        ctx.font = '12px sans-serif';
        ctx.fillText('Equilibrium', width * 0.7 + 5, equilibriumYRef.current + 4);
      }
    });

    // Start render
    Matter.Render.run(render);
    isInitializedRef.current = true;

  }, []);

  const resetSimulation = useCallback(() => {
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    initSimulation({ mass, springConstant, damping, displacement });
  }, [mass, springConstant, damping, displacement, initSimulation]);

  // Expose reset function via ref
  useImperativeHandle(ref, () => ({
    reset: resetSimulation
  }), [resetSimulation]);

  // Initialize only on mount
  useEffect(() => {
    initSimulation({ mass, springConstant, damping, displacement });

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle damping changes (can update live)
  useEffect(() => {
    if (massRef.current && isInitializedRef.current) {
      massRef.current.frictionAir = damping * 0.01;
    }
  }, [damping]);

  // Handle play/pause
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isPlaying) {
      runnerRef.current.delta = (1000 / 60) / speed;
      Matter.Runner.run(runnerRef.current, engineRef.current);

      const interval = setInterval(() => {
        if (massRef.current) {
          const currentY = massRef.current.position.y;
          const currentDisplacement = (currentY - equilibriumYRef.current) / 50;
          const currentVelocity = massRef.current.velocity.y;
          const springForce = -springConstantRef.current * currentDisplacement;
          
          onDataUpdate?.({
            displacement: currentDisplacement,
            velocity: currentVelocity,
            force: springForce,
            time: (Date.now() - startTimeRef.current) / 1000
          });
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isPlaying, speed, onDataUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

SpringSimulation.displayName = 'SpringSimulation';
