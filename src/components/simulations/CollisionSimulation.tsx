import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

interface CollisionSimulationProps {
  mass1: number;
  mass2: number;
  velocity1: number;
  velocity2: number;
  collisionType: 'elastic' | 'inelastic';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { 
    time: number; 
    momentum: number; 
    kineticEnergy: number;
    v1: number;
    v2: number;
  }) => void;
}

export interface CollisionSimulationHandle {
  reset: () => void;
}

export const CollisionSimulation = forwardRef<CollisionSimulationHandle, CollisionSimulationProps>(({
  mass1,
  mass2,
  velocity1,
  velocity2,
  collisionType,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const body1Ref = useRef<Matter.Body | null>(null);
  const body2Ref = useRef<Matter.Body | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasCollidedRef = useRef(false);

  const initSimulation = useCallback((props: {
    mass1: number;
    mass2: number;
    velocity1: number;
    velocity2: number;
    collisionType: 'elastic' | 'inelastic';
  }) => {
    if (!canvasRef.current) return;

    // Clean up previous
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

    // Create engine with no gravity
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engine.gravity.x = 0;
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

    const centerY = height / 2;
    const radius1 = 20 + props.mass1 * 8;
    const radius2 = 20 + props.mass2 * 8;

    // Object 1 (left side)
    const body1 = Matter.Bodies.circle(width * 0.2, centerY, radius1, {
      mass: props.mass1,
      restitution: props.collisionType === 'elastic' ? 1 : 0,
      friction: 0,
      frictionAir: 0,
      render: {
        fillStyle: 'hsl(168, 76%, 46%)',
        strokeStyle: 'hsl(168, 76%, 36%)',
        lineWidth: 3
      },
      label: 'body1'
    });
    Matter.Body.setMass(body1, props.mass1);
    body1Ref.current = body1;

    // Object 2 (right side)
    const body2 = Matter.Bodies.circle(width * 0.8, centerY, radius2, {
      mass: props.mass2,
      restitution: props.collisionType === 'elastic' ? 1 : 0,
      friction: 0,
      frictionAir: 0,
      render: {
        fillStyle: 'hsl(0, 84%, 60%)',
        strokeStyle: 'hsl(0, 84%, 50%)',
        lineWidth: 3
      },
      label: 'body2'
    });
    Matter.Body.setMass(body2, props.mass2);
    body2Ref.current = body2;

    // Set initial velocities
    Matter.Body.setVelocity(body1, { x: props.velocity1 * 0.5, y: 0 });
    Matter.Body.setVelocity(body2, { x: -props.velocity2 * 0.5, y: 0 });

    // Boundaries
    const wallThickness = 50;
    const walls = [
      Matter.Bodies.rectangle(0, height / 2, wallThickness, height, { 
        isStatic: true, 
        restitution: 1,
        render: { fillStyle: 'hsl(220, 9%, 26%)' }
      }),
      Matter.Bodies.rectangle(width, height / 2, wallThickness, height, { 
        isStatic: true, 
        restitution: 1,
        render: { fillStyle: 'hsl(220, 9%, 26%)' }
      }),
    ];

    // Add to world
    Matter.Composite.add(engine.world, [body1, body2, ...walls]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    startTimeRef.current = Date.now();
    hasCollidedRef.current = false;

    // Handle inelastic collision (stick together)
    if (props.collisionType === 'inelastic') {
      Matter.Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;
          
          if ((bodyA.label === 'body1' && bodyB.label === 'body2') ||
              (bodyA.label === 'body2' && bodyB.label === 'body1')) {
            if (!hasCollidedRef.current) {
              hasCollidedRef.current = true;
              
              // Calculate final velocity for perfectly inelastic collision
              const m1 = body1Ref.current!.mass;
              const m2 = body2Ref.current!.mass;
              const v1 = body1Ref.current!.velocity.x;
              const v2 = body2Ref.current!.velocity.x;
              const vFinal = (m1 * v1 + m2 * v2) / (m1 + m2);
              
              // Create constraint to stick them together
              const constraint = Matter.Constraint.create({
                bodyA: body1Ref.current!,
                bodyB: body2Ref.current!,
                stiffness: 1,
                length: 0,
                render: { visible: false }
              });
              Matter.Composite.add(engine.world, constraint);
              
              // Set same velocity
              Matter.Body.setVelocity(body1Ref.current!, { x: vFinal, y: 0 });
              Matter.Body.setVelocity(body2Ref.current!, { x: vFinal, y: 0 });
            }
          }
        });
      });
    }

    // Custom render
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      
      // Draw velocity vectors
      [body1Ref.current, body2Ref.current].forEach((body, idx) => {
        if (body) {
          const scale = 10;
          ctx.beginPath();
          ctx.moveTo(body.position.x, body.position.y);
          ctx.lineTo(
            body.position.x + body.velocity.x * scale,
            body.position.y
          );
          ctx.strokeStyle = idx === 0 ? 'hsl(168, 76%, 60%)' : 'hsl(0, 84%, 70%)';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Arrow head
          if (Math.abs(body.velocity.x) > 0.1) {
            const direction = body.velocity.x > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(body.position.x + body.velocity.x * scale, body.position.y);
            ctx.lineTo(body.position.x + body.velocity.x * scale - direction * 10, body.position.y - 5);
            ctx.lineTo(body.position.x + body.velocity.x * scale - direction * 10, body.position.y + 5);
            ctx.closePath();
            ctx.fillStyle = idx === 0 ? 'hsl(168, 76%, 60%)' : 'hsl(0, 84%, 70%)';
            ctx.fill();
          }

          // Mass label
          ctx.fillStyle = 'white';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`m${idx + 1}`, body.position.x, body.position.y + 5);
        }
      });

      // Draw info
      ctx.fillStyle = 'hsl(220, 9%, 46%)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Collision Type: ${props.collisionType}`, 20, 25);
      ctx.fillText(`m₁ = ${props.mass1.toFixed(1)} kg, m₂ = ${props.mass2.toFixed(1)} kg`, 20, 45);
      
      if (body1Ref.current && body2Ref.current) {
        const totalMomentum = body1Ref.current.mass * body1Ref.current.velocity.x + 
                             body2Ref.current.mass * body2Ref.current.velocity.x;
        ctx.fillText(`Total Momentum: ${(totalMomentum / 0.5).toFixed(2)} kg·m/s`, 20, 65);
      }
    });

    // Start render
    Matter.Render.run(render);
  }, []);

  const resetSimulation = useCallback(() => {
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    initSimulation({ mass1, mass2, velocity1, velocity2, collisionType });
  }, [mass1, mass2, velocity1, velocity2, collisionType, initSimulation]);

  useImperativeHandle(ref, () => ({
    reset: resetSimulation
  }), [resetSimulation]);

  // Initialize on mount
  useEffect(() => {
    initSimulation({ mass1, mass2, velocity1, velocity2, collisionType });

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

  // Handle play/pause
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isPlaying) {
      runnerRef.current.delta = (1000 / 60) / speed;
      Matter.Runner.run(runnerRef.current, engineRef.current);

      const interval = setInterval(() => {
        if (body1Ref.current && body2Ref.current) {
          const v1 = body1Ref.current.velocity.x / 0.5;
          const v2 = body2Ref.current.velocity.x / 0.5;
          const momentum = (body1Ref.current.mass * v1 + body2Ref.current.mass * v2);
          const ke = 0.5 * body1Ref.current.mass * v1 * v1 + 0.5 * body2Ref.current.mass * v2 * v2;

          onDataUpdate?.({
            time: (Date.now() - startTimeRef.current) / 1000,
            momentum,
            kineticEnergy: ke,
            v1,
            v2
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

CollisionSimulation.displayName = 'CollisionSimulation';
