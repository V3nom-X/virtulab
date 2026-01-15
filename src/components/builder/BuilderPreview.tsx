import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { CanvasComponent } from './DragDropCanvas';
import { Variable } from './VariableControls';

interface BuilderPreviewProps {
  components: CanvasComponent[];
  variables: Variable[];
  connections: Connection[];
  isRunning: boolean;
  onDataPoint?: (data: { time: number; [key: string]: number }) => void;
  className?: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort: 'in' | 'out';
  toPort: 'in' | 'out';
}

export function BuilderPreview({
  components,
  variables,
  connections,
  isRunning,
  onDataPoint,
  className = ''
}: BuilderPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Get variable value by name
  const getVarValue = useCallback((name: string): number => {
    const v = variables.find(v => v.name.toLowerCase() === name.toLowerCase() || v.id === name);
    return v?.value ?? 0;
  }, [variables]);

  // Create physics body from component
  const createBody = useCallback((comp: CanvasComponent, gravity: number): Matter.Body | null => {
    const x = comp.x + comp.width / 2;
    const y = comp.y + comp.height / 2;
    const props = comp.properties;

    switch (comp.type) {
      case 'projectile':
      case 'collision': {
        const velocity = props.velocity || 5;
        const angle = (props.angle || 0) * Math.PI / 180;
        const mass = props.mass || 1;
        const body = Matter.Bodies.circle(x, y, 20, {
          mass,
          restitution: props.restitution || 0.8,
          friction: props.friction || 0.001,
          label: comp.id,
          render: { fillStyle: '#22d3ee' }
        });
        Matter.Body.setVelocity(body, {
          x: velocity * Math.cos(angle),
          y: -velocity * Math.sin(angle)
        });
        return body;
      }
      case 'pendulum': {
        // Create pendulum as a constraint
        const length = (props.length || 2) * 50;
        const pivotX = x;
        const pivotY = y - length;
        const mass = props.mass || 1;
        const initialAngle = (props.angle || 45) * Math.PI / 180;
        
        const bobX = pivotX + length * Math.sin(initialAngle);
        const bobY = pivotY + length * Math.cos(initialAngle);
        
        const bob = Matter.Bodies.circle(bobX, bobY, 15 + mass * 5, {
          mass,
          friction: 0.0001,
          frictionAir: props.damping || 0.001,
          label: comp.id,
          render: { fillStyle: '#a855f7' }
        });
        
        // We'll handle the constraint separately
        return bob;
      }
      case 'ramp': {
        const angle = (props.angle || 30) * Math.PI / 180;
        const width = 200;
        const body = Matter.Bodies.rectangle(x, y, width, 10, {
          isStatic: true,
          angle: -angle,
          friction: props.friction || 0.3,
          label: comp.id,
          render: { fillStyle: '#64748b' }
        });
        return body;
      }
      case 'spring': {
        const mass = props.mass || 1;
        const body = Matter.Bodies.rectangle(x, y, 40, 40, {
          mass,
          friction: 0.01,
          label: comp.id,
          render: { fillStyle: '#22c55e' }
        });
        return body;
      }
      default: {
        // Generic component as static rectangle
        const body = Matter.Bodies.rectangle(x, y, comp.width - 20, comp.height - 20, {
          isStatic: props.isStatic !== false,
          friction: props.friction || 0.5,
          label: comp.id,
          render: { fillStyle: '#475569' }
        });
        return body;
      }
    }
  }, []);

  // Initialize physics engine
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: getVarValue('gravity') / 10 || 0.98 }
    });
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: container,
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

    // Add ground
    const ground = Matter.Bodies.rectangle(width / 2, height - 10, width, 20, {
      isStatic: true,
      friction: 0.8,
      render: { fillStyle: '#334155' }
    });
    Matter.Composite.add(engine.world, ground);

    // Add walls
    const leftWall = Matter.Bodies.rectangle(-10, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: '#334155' }
    });
    const rightWall = Matter.Bodies.rectangle(width + 10, height / 2, 20, height, {
      isStatic: true,
      render: { fillStyle: '#334155' }
    });
    Matter.Composite.add(engine.world, [leftWall, rightWall]);

    // Create bodies from components
    const constraints: Matter.Constraint[] = [];
    
    components.forEach(comp => {
      const body = createBody(comp, getVarValue('gravity'));
      if (body) {
        Matter.Composite.add(engine.world, body);
        bodiesMapRef.current.set(comp.id, body);

        // Add pendulum constraint
        if (comp.type === 'pendulum') {
          const length = (comp.properties.length || 2) * 50;
          const pivotX = comp.x + comp.width / 2;
          const pivotY = comp.y + comp.height / 2 - length;
          
          const constraint = Matter.Constraint.create({
            pointA: { x: pivotX, y: pivotY },
            bodyB: body,
            length: length,
            stiffness: 1,
            render: { strokeStyle: '#94a3b8', lineWidth: 2 }
          });
          constraints.push(constraint);
        }

        // Add spring constraint
        if (comp.type === 'spring') {
          const k = comp.properties.k || 50;
          const anchorX = comp.x + comp.width / 2;
          const anchorY = comp.y - 50;
          
          const constraint = Matter.Constraint.create({
            pointA: { x: anchorX, y: anchorY },
            bodyB: body,
            stiffness: k / 1000,
            damping: comp.properties.damping || 0.1,
            render: { strokeStyle: '#22c55e', lineWidth: 3 }
          });
          constraints.push(constraint);
        }
      }
    });

    Matter.Composite.add(engine.world, constraints);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Start renderer
    Matter.Render.run(render);

    startTimeRef.current = Date.now();
    frameCountRef.current = 0;

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      bodiesMapRef.current.clear();
    };
  }, [components, createBody, getVarValue]);

  // Handle running state
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isRunning) {
      Matter.Runner.run(runnerRef.current, engineRef.current);
      startTimeRef.current = Date.now();
      frameCountRef.current = 0;

      // Data collection interval
      const interval = setInterval(() => {
        if (!engineRef.current || !onDataPoint) return;
        
        frameCountRef.current++;
        const time = (Date.now() - startTimeRef.current) / 1000;
        
        // Collect data from first dynamic body
        let dataPoint: { time: number; [key: string]: number } = { time };
        
        bodiesMapRef.current.forEach((body, id) => {
          if (body && !body.isStatic && body.position && body.velocity) {
            const containerHeight = containerRef.current?.clientHeight || 400;
            dataPoint.x = Math.round(body.position.x);
            dataPoint.y = Math.round(containerHeight - body.position.y);
            dataPoint.velocity = Math.round(Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2) * 10) / 10;
            dataPoint.angle = Math.round((body.angle || 0) * 180 / Math.PI);
          }
        });
        
        onDataPoint(dataPoint);
      }, 100);

      return () => clearInterval(interval);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isRunning, onDataPoint]);

  // Update gravity when variable changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = getVarValue('gravity') / 10 || 0.98;
    }
  }, [getVarValue]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full bg-slate-900/50 rounded-lg overflow-hidden ${className}`}
    />
  );
}
