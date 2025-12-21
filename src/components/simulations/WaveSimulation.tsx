import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';

interface WaveSimulationProps {
  frequency: number;
  amplitude: number;
  wavelength: number;
  waveType: 'transverse' | 'longitudinal';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { 
    time: number; 
    displacement: number; 
    velocity: number; 
    energy: number;
    phase: number;
  }) => void;
}

export interface WaveSimulationHandle {
  reset: () => void;
}

export const WaveSimulation = forwardRef<WaveSimulationHandle, WaveSimulationProps>(({
  frequency,
  amplitude,
  wavelength,
  waveType,
  isPlaying,
  speed,
  onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [particles, setParticles] = useState<{ x: number; y: number; baseY: number }[]>([]);

  const initSimulation = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initialize particles for longitudinal wave
    const newParticles: { x: number; y: number; baseY: number }[] = [];
    const particleCount = 40;
    const spacing = width / particleCount;
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: i * spacing + spacing / 2,
        y: height / 2,
        baseY: height / 2
      });
    }
    setParticles(newParticles);
    
    timeRef.current = 0;
    startTimeRef.current = Date.now();
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw center line
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const time = timeRef.current;
    const angularFrequency = 2 * Math.PI * frequency;
    const k = 2 * Math.PI / (wavelength * 50); // Scale wavelength

    if (waveType === 'transverse') {
      // Draw transverse wave
      ctx.beginPath();
      ctx.strokeStyle = 'hsl(168, 76%, 46%)';
      ctx.lineWidth = 3;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + amplitude * 30 * Math.sin(k * x - angularFrequency * time);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw wave envelope
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        ctx.moveTo(x, height / 2 - amplitude * 30);
        ctx.lineTo(x, height / 2 - amplitude * 30);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        ctx.moveTo(x, height / 2 + amplitude * 30);
        ctx.lineTo(x, height / 2 + amplitude * 30);
      }
      ctx.stroke();

      // Draw particles on wave
      for (let i = 0; i < 20; i++) {
        const x = (i / 20) * width;
        const y = height / 2 + amplitude * 30 * Math.sin(k * x - angularFrequency * time);
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(168, 76%, 46%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(168, 76%, 36%)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw velocity arrow
        const vy = -amplitude * 30 * angularFrequency * Math.cos(k * x - angularFrequency * time);
        const arrowScale = 0.02;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + vy * arrowScale);
        ctx.strokeStyle = 'hsl(0, 84%, 60%)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

    } else {
      // Draw longitudinal wave
      const particleCount = 40;
      const spacing = width / particleCount;

      for (let i = 0; i < particleCount; i++) {
        const baseX = i * spacing + spacing / 2;
        const displacement = amplitude * 20 * Math.sin(k * baseX - angularFrequency * time);
        const x = baseX + displacement;
        const y = height / 2;

        // Draw particle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        
        // Color based on compression/rarefaction
        const compressionFactor = Math.sin(k * baseX - angularFrequency * time);
        if (compressionFactor > 0) {
          ctx.fillStyle = `hsl(168, 76%, ${46 - compressionFactor * 20}%)`;
        } else {
          ctx.fillStyle = `hsl(168, 76%, ${46 - compressionFactor * 20}%)`;
        }
        ctx.fill();
        ctx.strokeStyle = 'hsl(168, 76%, 36%)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw spring connections
        if (i < particleCount - 1) {
          const nextBaseX = (i + 1) * spacing + spacing / 2;
          const nextDisplacement = amplitude * 20 * Math.sin(k * nextBaseX - angularFrequency * time);
          const nextX = nextBaseX + nextDisplacement;

          const springSegments = 8;
          const springWidth = 10;
          ctx.beginPath();
          ctx.moveTo(x + 8, y);
          
          for (let j = 1; j <= springSegments; j++) {
            const segX = x + 8 + ((nextX - x - 16) / springSegments) * j;
            const segY = y + (j % 2 === 0 ? springWidth : -springWidth);
            ctx.lineTo(segX, segY);
          }
          
          ctx.lineTo(nextX - 8, y);
          ctx.strokeStyle = 'hsl(220, 9%, 46%)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw compression/rarefaction labels
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'hsl(220, 9%, 46%)';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < 3; i++) {
        const labelX = (i + 0.5) * (width / 3);
        const phase = k * labelX - angularFrequency * time;
        const compressionFactor = -Math.cos(phase);
        
        if (compressionFactor > 0.5) {
          ctx.fillText('Compression', labelX, height / 2 + 50);
        } else if (compressionFactor < -0.5) {
          ctx.fillText('Rarefaction', labelX, height / 2 + 50);
        }
      }
    }

    // Draw wave info
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'hsl(220, 9%, 46%)';
    ctx.textAlign = 'left';
    ctx.fillText(`λ = ${wavelength.toFixed(1)} m`, 20, 30);
    ctx.fillText(`f = ${frequency.toFixed(1)} Hz`, 20, 50);
    ctx.fillText(`A = ${amplitude.toFixed(1)} m`, 20, 70);
    ctx.fillText(`v = ${(frequency * wavelength).toFixed(1)} m/s`, 20, 90);

  }, [frequency, amplitude, wavelength, waveType]);

  const resetSimulation = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    timeRef.current = 0;
    startTimeRef.current = Date.now();
    initSimulation();
    draw();
  }, [initSimulation, draw]);

  useImperativeHandle(ref, () => ({
    reset: resetSimulation
  }), [resetSimulation]);

  useEffect(() => {
    initSimulation();
    draw();

    const handleResize = () => {
      initSimulation();
      draw();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initSimulation, draw]);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      timeRef.current += 0.016 * speed;
      draw();

      // Calculate wave data at observation point
      const angularFrequency = 2 * Math.PI * frequency;
      const k = 2 * Math.PI / (wavelength * 50);
      const observationX = 200; // Fixed observation point
      
      const displacement = amplitude * Math.sin(k * observationX - angularFrequency * timeRef.current);
      const velocity = -amplitude * angularFrequency * Math.cos(k * observationX - angularFrequency * timeRef.current);
      const energy = 0.5 * amplitude * amplitude * angularFrequency * angularFrequency;
      const phase = (k * observationX - angularFrequency * timeRef.current) % (2 * Math.PI);

      onDataUpdate?.({
        time: (Date.now() - startTimeRef.current) / 1000,
        displacement,
        velocity,
        energy,
        phase
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speed, frequency, amplitude, wavelength, waveType, draw, onDataUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
});

WaveSimulation.displayName = 'WaveSimulation';
