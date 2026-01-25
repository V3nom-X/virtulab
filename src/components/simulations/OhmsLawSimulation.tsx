import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface OhmsLawSimulationProps {
  voltage: number;
  resistance: number;
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; current: number; power: number; voltage: number }) => void;
}

export interface OhmsLawSimulationHandle {
  reset: () => void;
}

export const OhmsLawSimulation = forwardRef<OhmsLawSimulationHandle, OhmsLawSimulationProps>(({
  voltage,
  resistance,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const electronsRef = useRef<{ x: number; y: number; pathIndex: number; progress: number }[]>([]);

  // Calculate current using Ohm's Law
  const current = voltage / resistance;
  const power = voltage * current;

  const reset = () => {
    timeRef.current = 0;
    electronsRef.current = [];
    initElectrons();
  };

  useImperativeHandle(ref, () => ({ reset }), []);

  const initElectrons = () => {
    const electronCount = Math.min(Math.max(Math.round(current * 3), 3), 20);
    electronsRef.current = Array.from({ length: electronCount }, (_, i) => ({
      x: 0,
      y: 0,
      pathIndex: 0,
      progress: (i / electronCount) * 100
    }));
  };

  useEffect(() => {
    initElectrons();
  }, [current]);

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

      // Circuit dimensions
      const padding = 40;
      const circuitWidth = width - padding * 2;
      const circuitHeight = height - padding * 2;
      const centerX = width / 2;
      const centerY = height / 2;

      // Wire path points (rectangular circuit)
      const path = [
        { x: padding, y: padding + circuitHeight / 2 },           // Left center (battery positive)
        { x: padding, y: padding },                                // Top left
        { x: padding + circuitWidth, y: padding },                 // Top right
        { x: padding + circuitWidth, y: padding + circuitHeight / 2 }, // Right center (resistor)
        { x: padding + circuitWidth, y: padding + circuitHeight }, // Bottom right
        { x: padding, y: padding + circuitHeight },                // Bottom left
        { x: padding, y: padding + circuitHeight / 2 }             // Back to battery
      ];

      // Draw wires
      ctx.strokeStyle = 'hsl(220, 9%, 46%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Draw battery (left side)
      const batteryX = padding - 15;
      const batteryY = centerY - 30;
      const batteryWidth = 30;
      const batteryHeight = 60;

      // Battery body
      ctx.fillStyle = 'hsl(220, 15%, 25%)';
      ctx.fillRect(batteryX, batteryY, batteryWidth, batteryHeight);
      ctx.strokeStyle = 'hsl(220, 15%, 35%)';
      ctx.lineWidth = 2;
      ctx.strokeRect(batteryX, batteryY, batteryWidth, batteryHeight);

      // Battery terminals
      ctx.fillStyle = 'hsl(45, 93%, 47%)';
      ctx.fillRect(batteryX + 8, batteryY - 8, 14, 8);
      ctx.fillStyle = 'hsl(220, 9%, 56%)';
      ctx.fillRect(batteryX + 10, batteryY + batteryHeight, 10, 5);

      // Voltage label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${voltage.toFixed(1)}V`, batteryX + batteryWidth / 2, batteryY + batteryHeight / 2 + 5);

      // Draw resistor (right side)
      const resistorX = width - padding - 20;
      const resistorY = centerY - 25;
      const resistorWidth = 40;
      const resistorHeight = 50;

      // Resistor body with heat glow effect based on power
      const heatIntensity = Math.min(power / 100, 1);
      if (heatIntensity > 0.1 && isPlaying) {
        ctx.shadowColor = `hsl(30, 100%, 50%)`;
        ctx.shadowBlur = 10 + heatIntensity * 20;
      }
      
      ctx.fillStyle = `hsl(30, ${20 + heatIntensity * 60}%, ${25 + heatIntensity * 25}%)`;
      ctx.fillRect(resistorX, resistorY, resistorWidth, resistorHeight);
      ctx.shadowBlur = 0;

      // Resistor stripes
      ctx.fillStyle = 'hsl(45, 80%, 50%)';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(resistorX + 8 + i * 10, resistorY + 5, 4, resistorHeight - 10);
      }

      // Resistance label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${resistance}Ω`, resistorX + resistorWidth / 2, resistorY + resistorHeight + 20);

      // Draw ammeter (top)
      const ammeterRadius = 25;
      const ammeterX = centerX;
      const ammeterY = padding;

      ctx.beginPath();
      ctx.arc(ammeterX, ammeterY, ammeterRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(220, 18%, 13%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('A', ammeterX, ammeterY - 5);
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${current.toFixed(2)}`, ammeterX, ammeterY + 10);

      // Draw voltmeter (bottom)
      const voltmeterX = centerX;
      const voltmeterY = height - padding;

      ctx.beginPath();
      ctx.arc(voltmeterX, voltmeterY, ammeterRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(220, 18%, 13%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(45, 93%, 47%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'hsl(45, 93%, 47%)';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('V', voltmeterX, voltmeterY - 5);
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${voltage.toFixed(1)}`, voltmeterX, voltmeterY + 10);

      // Draw electrons if playing
      if (isPlaying && current > 0) {
        const electronSpeed = current * speed * 0.5;
        
        electronsRef.current.forEach(electron => {
          electron.progress += electronSpeed;
          if (electron.progress >= 100) electron.progress = 0;

          // Calculate position along path
          const totalLength = path.length - 1;
          const segmentProgress = (electron.progress / 100) * totalLength;
          const segmentIndex = Math.floor(segmentProgress);
          const segmentFraction = segmentProgress - segmentIndex;

          const start = path[segmentIndex];
          const end = path[(segmentIndex + 1) % path.length];
          
          const x = start.x + (end.x - start.x) * segmentFraction;
          const y = start.y + (end.y - start.y) * segmentFraction;

          // Draw electron
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'hsl(200, 100%, 60%)';
          ctx.fill();
          
          // Glow effect
          ctx.shadowColor = 'hsl(200, 100%, 60%)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // Power display
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Power: ${power.toFixed(2)} W`, 10, height - 10);
    };

    const animate = () => {
      draw();
      
      if (isPlaying) {
        timeRef.current += 0.016 * speed;
        onDataUpdate?.({
          time: timeRef.current,
          current,
          power,
          voltage
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [voltage, resistance, current, power, isPlaying, speed, onDataUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

OhmsLawSimulation.displayName = 'OhmsLawSimulation';
