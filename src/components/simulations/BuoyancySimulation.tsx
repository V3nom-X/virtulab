import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface BuoyancySimulationProps {
  objectDensity: number; // kg/m³
  fluidDensity: number; // kg/m³
  objectVolume: number; // m³ (scaled for display)
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; depth: number; buoyantForce: number; weight: number }) => void;
}

export interface BuoyancySimulationHandle {
  reset: () => void;
}

export const BuoyancySimulation = forwardRef<BuoyancySimulationHandle, BuoyancySimulationProps>(({
  objectDensity,
  fluidDensity,
  objectVolume,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);

  const g = 9.8;
  const mass = objectDensity * objectVolume;
  const weight = mass * g;
  const maxBuoyantForce = fluidDensity * objectVolume * g;
  
  // Determine if object floats, sinks, or is neutral
  const densityRatio = objectDensity / fluidDensity;
  const floats = densityRatio < 1;
  const equilibriumDepth = floats ? densityRatio : 1; // Fraction submerged at equilibrium

  const reset = () => {
    timeRef.current = 0;
    positionRef.current = 0;
    velocityRef.current = 0;
  };

  useImperativeHandle(ref, () => ({ reset }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, width, height);

      const padding = 40;
      const tankWidth = width - padding * 2;
      const tankHeight = height - padding * 2;
      const waterSurfaceY = padding + tankHeight * 0.25;
      const tankBottom = padding + tankHeight;

      // Draw tank
      ctx.strokeStyle = 'hsl(220, 15%, 40%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, tankBottom);
      ctx.lineTo(padding + tankWidth, tankBottom);
      ctx.lineTo(padding + tankWidth, padding);
      ctx.stroke();

      // Draw fluid
      const fluidGradient = ctx.createLinearGradient(0, waterSurfaceY, 0, tankBottom);
      if (fluidDensity < 1200) {
        // Water
        fluidGradient.addColorStop(0, 'hsla(200, 70%, 60%, 0.6)');
        fluidGradient.addColorStop(1, 'hsla(200, 70%, 40%, 0.8)');
      } else if (fluidDensity < 2000) {
        // Saltwater/oil
        fluidGradient.addColorStop(0, 'hsla(40, 60%, 50%, 0.6)');
        fluidGradient.addColorStop(1, 'hsla(40, 60%, 35%, 0.8)');
      } else {
        // Mercury
        fluidGradient.addColorStop(0, 'hsla(220, 10%, 60%, 0.8)');
        fluidGradient.addColorStop(1, 'hsla(220, 10%, 40%, 0.9)');
      }
      
      ctx.fillStyle = fluidGradient;
      ctx.fillRect(padding, waterSurfaceY, tankWidth, tankBottom - waterSurfaceY);

      // Water surface line
      ctx.strokeStyle = 'hsla(200, 70%, 70%, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, waterSurfaceY);
      ctx.lineTo(padding + tankWidth, waterSurfaceY);
      ctx.stroke();

      // Calculate object position
      const objectSize = 40 + objectVolume * 10;
      const objectX = width / 2 - objectSize / 2;
      
      // Physics simulation
      if (isPlaying) {
        const maxDepth = (tankBottom - waterSurfaceY - objectSize) / (tankBottom - waterSurfaceY);
        const currentDepth = Math.min(Math.max(positionRef.current, 0), 1);
        
        // Calculate submerged fraction
        const submergedFraction = Math.min(currentDepth + (objectSize / (tankBottom - waterSurfaceY)), 1);
        
        // Calculate forces
        const currentBuoyantForce = submergedFraction * maxBuoyantForce;
        const netForce = weight - currentBuoyantForce;
        
        // Apply damping for fluid resistance
        const damping = 0.02;
        const acceleration = (netForce / mass) * 0.001 - damping * velocityRef.current;
        
        velocityRef.current += acceleration * speed;
        positionRef.current += velocityRef.current * speed;
        
        // Clamp position
        if (positionRef.current < 0) {
          positionRef.current = 0;
          velocityRef.current = Math.abs(velocityRef.current) * 0.3;
        }
        if (positionRef.current > maxDepth) {
          positionRef.current = maxDepth;
          velocityRef.current = -Math.abs(velocityRef.current) * 0.3;
        }
      }

      const objectY = waterSurfaceY - objectSize + positionRef.current * (tankBottom - waterSurfaceY);
      
      // Calculate current buoyant force for display
      const submergedAmount = Math.max(0, Math.min(objectY + objectSize - waterSurfaceY, objectSize)) / objectSize;
      const currentBuoyantForce = submergedAmount * maxBuoyantForce;

      // Draw object
      const objectColor = objectDensity < fluidDensity 
        ? 'hsl(142, 71%, 45%)' 
        : objectDensity > fluidDensity 
          ? 'hsl(354, 70%, 54%)' 
          : 'hsl(45, 93%, 47%)';
      
      ctx.fillStyle = objectColor;
      ctx.strokeStyle = objectColor.replace(')', ', 0.8)').replace('hsl', 'hsla');
      ctx.lineWidth = 2;
      
      // Draw object with rounded corners
      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(objectX, objectY, objectSize, objectSize, radius);
      ctx.fill();
      ctx.stroke();

      // Draw force arrows
      const arrowScale = 0.5;
      
      // Weight arrow (down)
      const weightArrowLength = weight * arrowScale;
      ctx.strokeStyle = 'hsl(354, 70%, 54%)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(objectX + objectSize / 2, objectY + objectSize / 2);
      ctx.lineTo(objectX + objectSize / 2, objectY + objectSize / 2 + weightArrowLength);
      ctx.stroke();
      drawArrowHead(ctx, objectX + objectSize / 2, objectY + objectSize / 2 + weightArrowLength, Math.PI / 2);

      // Buoyant force arrow (up)
      if (submergedAmount > 0) {
        const buoyantArrowLength = currentBuoyantForce * arrowScale;
        ctx.strokeStyle = 'hsl(200, 100%, 60%)';
        ctx.beginPath();
        ctx.moveTo(objectX + objectSize / 2, objectY + objectSize / 2);
        ctx.lineTo(objectX + objectSize / 2, objectY + objectSize / 2 - buoyantArrowLength);
        ctx.stroke();
        drawArrowHead(ctx, objectX + objectSize / 2, objectY + objectSize / 2 - buoyantArrowLength, -Math.PI / 2);
      }

      // Labels and info
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';

      // Object info
      ctx.fillText(`Object: ρ = ${objectDensity} kg/m³`, padding + 10, padding + 20);
      ctx.fillText(`Fluid: ρ = ${fluidDensity} kg/m³`, padding + 10, padding + 40);

      // Force display
      ctx.font = '11px system-ui';
      const infoX = padding + tankWidth - 150;
      
      ctx.fillStyle = 'hsl(354, 70%, 54%)';
      ctx.fillText(`Weight: ${weight.toFixed(1)} N`, infoX, padding + 20);
      
      ctx.fillStyle = 'hsl(200, 100%, 60%)';
      ctx.fillText(`Buoyancy: ${currentBuoyantForce.toFixed(1)} N`, infoX, padding + 35);

      ctx.fillStyle = 'hsl(var(--foreground))';
      const netForce = weight - currentBuoyantForce;
      ctx.fillText(`Net: ${netForce.toFixed(1)} N ${netForce > 0.1 ? '↓' : netForce < -0.1 ? '↑' : '='} `, infoX, padding + 50);

      // Status
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      const status = floats ? 'FLOATS' : densityRatio === 1 ? 'NEUTRAL' : 'SINKS';
      ctx.fillStyle = objectColor;
      ctx.fillText(status, width / 2, tankBottom + 25);

      // Archimedes principle
      ctx.font = '10px system-ui';
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.fillText('Fᵦ = ρfluid × V × g', width / 2, tankBottom + 40);

      function drawArrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
        const headLength = 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    };

    const animate = () => {
      draw();
      
      if (isPlaying) {
        timeRef.current += 0.016 * speed;
        onDataUpdate?.({
          time: timeRef.current,
          depth: positionRef.current,
          buoyantForce: Math.min(positionRef.current, 1) * maxBuoyantForce,
          weight
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [objectDensity, fluidDensity, objectVolume, floats, weight, maxBuoyantForce, isPlaying, speed, onDataUpdate, mass]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

BuoyancySimulation.displayName = 'BuoyancySimulation';
