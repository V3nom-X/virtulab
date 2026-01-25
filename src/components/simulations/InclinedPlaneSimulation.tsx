import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

interface InclinedPlaneSimulationProps {
  angle: number; // degrees
  mass: number; // kg
  friction: number; // coefficient
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; position: number; velocity: number; acceleration: number }) => void;
}

export interface InclinedPlaneSimulationHandle {
  reset: () => void;
}

export const InclinedPlaneSimulation = forwardRef<InclinedPlaneSimulationHandle, InclinedPlaneSimulationProps>(({
  angle,
  mass,
  friction,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const blockRef = useRef<Matter.Body | null>(null);
  const timeRef = useRef(0);
  const initialPosRef = useRef({ x: 0, y: 0 });

  const g = 9.8;
  const angleRad = (angle * Math.PI) / 180;
  const theoreticalAccel = g * (Math.sin(angleRad) - friction * Math.cos(angleRad));

  const initSimulation = useCallback(() => {
    if (!canvasRef.current) return;

    // Cleanup
    if (renderRef.current) Matter.Render.stop(renderRef.current);
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Create engine with gravity
    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Calculate incline dimensions
    const padding = 60;
    const inclineLength = Math.min(width - padding * 2, height - padding * 2) * 0.9;
    const inclineHeight = inclineLength * Math.sin(angleRad);
    const inclineWidth = inclineLength * Math.cos(angleRad);

    // Position incline from bottom-left
    const baseX = padding;
    const baseY = height - padding;

    // Create inclined plane (rotated rectangle)
    const planeThickness = 20;
    const planeCenterX = baseX + inclineWidth / 2;
    const planeCenterY = baseY - inclineHeight / 2;

    const plane = Matter.Bodies.rectangle(
      planeCenterX,
      planeCenterY,
      inclineLength + 50,
      planeThickness,
      {
        isStatic: true,
        angle: -angleRad,
        friction: friction,
        render: {
          fillStyle: 'hsl(220, 15%, 25%)',
          strokeStyle: 'hsl(220, 15%, 35%)',
          lineWidth: 2
        }
      }
    );

    // Create block at top of incline
    const blockSize = 25 + mass * 5;
    const blockStartX = baseX + inclineWidth - blockSize;
    const blockStartY = baseY - inclineHeight - blockSize;

    const block = Matter.Bodies.rectangle(
      blockStartX,
      blockStartY,
      blockSize,
      blockSize,
      {
        friction: friction,
        frictionAir: 0,
        density: mass * 0.001,
        angle: -angleRad,
        render: {
          fillStyle: 'hsl(var(--primary))',
          strokeStyle: 'hsl(168, 76%, 36%)',
          lineWidth: 2
        }
      }
    );
    blockRef.current = block;
    initialPosRef.current = { x: blockStartX, y: blockStartY };

    // Create base platform
    const base = Matter.Bodies.rectangle(
      width / 2,
      height - padding / 2,
      width - padding,
      20,
      {
        isStatic: true,
        friction: 1,
        render: {
          fillStyle: 'hsl(220, 15%, 20%)',
          strokeStyle: 'hsl(220, 15%, 30%)',
          lineWidth: 2
        }
      }
    );

    // Add walls to contain the block
    const rightWall = Matter.Bodies.rectangle(
      width - 20,
      height / 2,
      40,
      height,
      {
        isStatic: true,
        render: { visible: false }
      }
    );

    Matter.Composite.add(engine.world, [plane, block, base, rightWall]);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    Matter.Render.run(render);
    timeRef.current = 0;

    // Custom rendering for force vectors
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.canvas.getContext('2d');
      if (!ctx || !blockRef.current) return;

      const block = blockRef.current;
      const bx = block.position.x;
      const by = block.position.y;

      // Draw force vectors
      const vectorScale = 30;

      // Gravity vector (straight down)
      ctx.strokeStyle = 'hsl(354, 70%, 54%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + mass * vectorScale);
      ctx.stroke();
      drawArrowHead(ctx, bx, by + mass * vectorScale, Math.PI / 2);

      // Parallel component (along slope)
      const parallelForce = mass * g * Math.sin(angleRad);
      const parallelX = bx + parallelForce * vectorScale * 0.1 * Math.cos(-angleRad);
      const parallelY = by + parallelForce * vectorScale * 0.1 * Math.sin(-angleRad);
      
      ctx.strokeStyle = 'hsl(142, 71%, 45%)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(parallelX, parallelY);
      ctx.stroke();
      drawArrowHead(ctx, parallelX, parallelY, -angleRad);

      // Normal force (perpendicular to slope)
      const normalForce = mass * g * Math.cos(angleRad);
      const normalAngle = -angleRad - Math.PI / 2;
      const normalX = bx + normalForce * vectorScale * 0.1 * Math.cos(normalAngle);
      const normalY = by + normalForce * vectorScale * 0.1 * Math.sin(normalAngle);
      
      ctx.strokeStyle = 'hsl(210, 100%, 60%)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(normalX, normalY);
      ctx.stroke();
      drawArrowHead(ctx, normalX, normalY, normalAngle);

      // Labels
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`θ = ${angle}°`, padding + 10, height - padding - 30);
      ctx.fillText(`a = ${theoreticalAccel.toFixed(2)} m/s²`, padding + 10, height - padding - 15);

      // Legend
      const legendY = 20;
      ctx.font = '11px system-ui';
      
      ctx.fillStyle = 'hsl(354, 70%, 54%)';
      ctx.fillText('● Gravity (mg)', width - 150, legendY);
      
      ctx.fillStyle = 'hsl(142, 71%, 45%)';
      ctx.fillText('● Parallel (mg·sinθ)', width - 150, legendY + 15);
      
      ctx.fillStyle = 'hsl(210, 100%, 60%)';
      ctx.fillText('● Normal (mg·cosθ)', width - 150, legendY + 30);
    });

    function drawArrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
      const headLength = 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x, y);
      ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }

  }, [angle, mass, friction, theoreticalAccel]);

  const resetSimulation = useCallback(() => {
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    timeRef.current = 0;
    initSimulation();
  }, [initSimulation]);

  useImperativeHandle(ref, () => ({ reset: resetSimulation }), [resetSimulation]);

  useEffect(() => {
    initSimulation();
    return () => {
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isPlaying) {
      runnerRef.current.delta = (1000 / 60) / speed;
      Matter.Runner.run(runnerRef.current, engineRef.current);

      const interval = setInterval(() => {
        if (blockRef.current) {
          const block = blockRef.current;
          const dx = block.position.x - initialPosRef.current.x;
          const dy = block.position.y - initialPosRef.current.y;
          const position = Math.sqrt(dx * dx + dy * dy) / 50;
          const velocity = Math.sqrt(block.velocity.x ** 2 + block.velocity.y ** 2);

          timeRef.current += 0.016 * speed;

          onDataUpdate?.({
            time: timeRef.current,
            position,
            velocity,
            acceleration: theoreticalAccel
          });
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      Matter.Runner.stop(runnerRef.current);
    }
  }, [isPlaying, speed, onDataUpdate, theoreticalAccel]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

InclinedPlaneSimulation.displayName = 'InclinedPlaneSimulation';
