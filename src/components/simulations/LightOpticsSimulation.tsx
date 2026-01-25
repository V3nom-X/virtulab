import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface LightOpticsSimulationProps {
  incidenceAngle: number; // degrees
  medium1: 'air' | 'water' | 'glass';
  medium2: 'air' | 'water' | 'glass';
  surfaceType: 'mirror' | 'transparent';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; incidenceAngle: number; reflectionAngle: number; refractionAngle: number }) => void;
}

export interface LightOpticsSimulationHandle {
  reset: () => void;
}

const refractiveIndices: Record<string, number> = {
  air: 1.0,
  water: 1.33,
  glass: 1.5
};

export const LightOpticsSimulation = forwardRef<LightOpticsSimulationHandle, LightOpticsSimulationProps>(({
  incidenceAngle,
  medium1,
  medium2,
  surfaceType,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const rayProgressRef = useRef(0);

  const n1 = refractiveIndices[medium1];
  const n2 = refractiveIndices[medium2];
  
  // Calculate angles
  const incidenceRad = (incidenceAngle * Math.PI) / 180;
  const reflectionAngle = incidenceAngle; // Law of reflection
  
  // Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  const sinRefraction = (n1 / n2) * Math.sin(incidenceRad);
  const totalInternalReflection = Math.abs(sinRefraction) > 1;
  const refractionRad = totalInternalReflection ? 0 : Math.asin(sinRefraction);
  const refractionAngle = totalInternalReflection ? 0 : (refractionRad * 180) / Math.PI;

  // Critical angle calculation
  const criticalAngle = n1 > n2 ? Math.asin(n2 / n1) * 180 / Math.PI : 90;

  const reset = () => {
    timeRef.current = 0;
    rayProgressRef.current = 0;
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

      const centerX = width / 2;
      const centerY = height / 2;
      const rayLength = Math.min(width, height) * 0.35;

      // Draw media backgrounds
      const getMediumColor = (medium: string, alpha: number = 1) => {
        switch (medium) {
          case 'water': return `hsla(200, 80%, 60%, ${alpha * 0.3})`;
          case 'glass': return `hsla(180, 20%, 70%, ${alpha * 0.4})`;
          default: return `hsla(220, 20%, 95%, ${alpha * 0.1})`;
        }
      };

      // Upper medium
      ctx.fillStyle = getMediumColor(medium1);
      ctx.fillRect(0, 0, width, centerY);
      
      // Lower medium
      ctx.fillStyle = getMediumColor(medium2);
      ctx.fillRect(0, centerY, width, height - centerY);

      // Draw interface line
      ctx.strokeStyle = 'hsl(220, 15%, 40%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw normal line (dashed)
      ctx.strokeStyle = 'hsl(220, 15%, 60%)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - rayLength - 20);
      ctx.lineTo(centerX, centerY + rayLength + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate ray endpoints
      const incidentEndX = centerX - rayLength * Math.sin(incidenceRad);
      const incidentEndY = centerY - rayLength * Math.cos(incidenceRad);

      const reflectedEndX = centerX + rayLength * Math.sin(incidenceRad);
      const reflectedEndY = centerY - rayLength * Math.cos(incidenceRad);

      const refractedEndX = centerX + rayLength * Math.sin(refractionRad);
      const refractedEndY = centerY + rayLength * Math.cos(refractionRad);

      // Animate ray progress
      if (isPlaying) {
        rayProgressRef.current = Math.min(rayProgressRef.current + speed * 0.02, 1);
      }
      const progress = rayProgressRef.current;

      // Draw incident ray
      const gradientIn = ctx.createLinearGradient(incidentEndX, incidentEndY, centerX, centerY);
      gradientIn.addColorStop(0, 'hsl(45, 100%, 50%)');
      gradientIn.addColorStop(1, 'hsl(45, 100%, 70%)');
      
      ctx.strokeStyle = gradientIn;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'hsl(45, 100%, 50%)';
      ctx.shadowBlur = isPlaying ? 10 : 5;
      ctx.beginPath();
      ctx.moveTo(incidentEndX, incidentEndY);
      const incidentProgress = Math.min(progress * 2, 1);
      ctx.lineTo(
        incidentEndX + (centerX - incidentEndX) * incidentProgress,
        incidentEndY + (centerY - incidentEndY) * incidentProgress
      );
      ctx.stroke();

      // Only draw reflected/refracted rays after incident ray reaches surface
      if (progress > 0.5) {
        const outProgress = (progress - 0.5) * 2;

        // Draw reflected ray
        if (surfaceType === 'mirror' || totalInternalReflection) {
          const gradientRef = ctx.createLinearGradient(centerX, centerY, reflectedEndX, reflectedEndY);
          gradientRef.addColorStop(0, 'hsl(45, 100%, 70%)');
          gradientRef.addColorStop(1, 'hsl(45, 100%, 50%)');
          
          ctx.strokeStyle = gradientRef;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + (reflectedEndX - centerX) * outProgress,
            centerY + (reflectedEndY - centerY) * outProgress
          );
          ctx.stroke();
        }

        // Draw refracted ray (only for transparent surfaces without TIR)
        if (surfaceType === 'transparent' && !totalInternalReflection) {
          const gradientFrac = ctx.createLinearGradient(centerX, centerY, refractedEndX, refractedEndY);
          gradientFrac.addColorStop(0, 'hsl(200, 100%, 60%)');
          gradientFrac.addColorStop(1, 'hsl(200, 100%, 50%)');
          
          ctx.strokeStyle = gradientFrac;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + (refractedEndX - centerX) * outProgress,
            centerY + (refractedEndY - centerY) * outProgress
          );
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;

      // Draw angle arcs
      ctx.strokeStyle = 'hsl(45, 100%, 60%)';
      ctx.lineWidth = 2;
      const arcRadius = 40;

      // Incidence angle arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, -Math.PI/2, -Math.PI/2 + incidenceRad, false);
      ctx.stroke();

      // Reflection angle arc (if reflecting)
      if (surfaceType === 'mirror' || totalInternalReflection) {
        ctx.strokeStyle = 'hsl(30, 100%, 50%)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, arcRadius + 5, -Math.PI/2, -Math.PI/2 - incidenceRad, true);
        ctx.stroke();
      }

      // Refraction angle arc (if refracting)
      if (surfaceType === 'transparent' && !totalInternalReflection) {
        ctx.strokeStyle = 'hsl(200, 100%, 60%)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, arcRadius, Math.PI/2, Math.PI/2 - refractionRad, true);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';

      // Medium labels
      ctx.fillText(`${medium1} (n=${n1})`, 10, 25);
      ctx.fillText(`${medium2} (n=${n2})`, 10, centerY + 25);

      // Angle labels
      ctx.fillStyle = 'hsl(45, 100%, 60%)';
      ctx.fillText(`θᵢ = ${incidenceAngle}°`, centerX + 50, centerY - 50);

      if (surfaceType === 'mirror' || totalInternalReflection) {
        ctx.fillStyle = 'hsl(30, 100%, 50%)';
        ctx.fillText(`θᵣ = ${reflectionAngle}°`, centerX + 50, centerY - 30);
      }

      if (surfaceType === 'transparent') {
        ctx.fillStyle = 'hsl(200, 100%, 60%)';
        if (totalInternalReflection) {
          ctx.fillText('Total Internal Reflection!', centerX + 50, centerY + 40);
          ctx.fillText(`Critical angle: ${criticalAngle.toFixed(1)}°`, centerX + 50, centerY + 60);
        } else {
          ctx.fillText(`θₜ = ${refractionAngle.toFixed(1)}°`, centerX + 50, centerY + 40);
        }
      }

      // Snell's Law display
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)`, width - 10, height - 10);
    };

    const animate = () => {
      draw();
      
      if (isPlaying) {
        timeRef.current += 0.016 * speed;
        onDataUpdate?.({
          time: timeRef.current,
          incidenceAngle,
          reflectionAngle,
          refractionAngle
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [incidenceAngle, medium1, medium2, surfaceType, n1, n2, reflectionAngle, refractionAngle, refractionRad, totalInternalReflection, criticalAngle, isPlaying, speed, onDataUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

LightOpticsSimulation.displayName = 'LightOpticsSimulation';
