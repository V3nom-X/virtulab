import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface StatesOfMatterSimulationProps {
  temperature: number;
  substance: 'water' | 'iron' | 'oxygen' | 'wax';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; temperature: number; state: string }) => void;
}

export interface StatesOfMatterSimulationHandle { reset: () => void; }

const MELTING_BOILING: Record<string, [number, number]> = {
  water: [0, 100], iron: [1538, 2862], oxygen: [-218, -183], wax: [46, 300]
};
const SUB_COLORS: Record<string, string> = {
  water: '#3498db', iron: '#95a5a6', oxygen: '#85c1e9', wax: '#f0c27f'
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
}

export const StatesOfMatterSimulation = forwardRef<StatesOfMatterSimulationHandle, StatesOfMatterSimulationProps>(({
  temperature, substance, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const currentTempRef = useRef(25);

  const initParticles = useCallback((w: number, h: number) => {
    const cx = w * 0.5, cy = h * 0.5;
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: cx + (Math.random() - 0.5) * 150,
      y: cy + (Math.random() - 0.5) * 150,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      timeRef.current = 0;
      currentTempRef.current = 25;
      if (canvasRef.current) initParticles(canvasRef.current.width, canvasRef.current.height);
    }
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    if (particlesRef.current.length === 0) initParticles(w, h);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    if (isPlaying) {
      currentTempRef.current += (temperature - currentTempRef.current) * 0.02 * speed;
      timeRef.current += 0.016 * speed;
    }

    const temp = currentTempRef.current;
    const [mp, bp] = MELTING_BOILING[substance] || [0, 100];
    const state = temp < mp ? 'Solid' : temp < bp ? 'Liquid' : 'Gas';
    const color = SUB_COLORS[substance];

    // Container
    const cx = w * 0.2, cy = h * 0.15, cw = w * 0.6, ch = h * 0.6;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    // Update particles
    const speedMult = state === 'Solid' ? 0.2 : state === 'Liquid' ? 1.5 : 4;
    const boundPad = state === 'Gas' ? 5 : state === 'Liquid' ? 20 : 40;

    particlesRef.current.forEach(p => {
      if (!isPlaying) return;
      
      if (state === 'Solid') {
        // Vibrate in place
        p.vx = (Math.random() - 0.5) * speedMult * speed;
        p.vy = (Math.random() - 0.5) * speedMult * speed;
      } else {
        p.vx += (Math.random() - 0.5) * 0.5 * speedMult * speed;
        p.vy += (Math.random() - 0.5) * 0.5 * speedMult * speed;
        p.vx *= 0.98;
        p.vy *= 0.98;
      }
      
      if (state === 'Liquid') p.vy += 0.05; // Slight gravity

      p.x += p.vx;
      p.y += p.vy;

      // Bounds
      if (p.x < cx + boundPad) { p.x = cx + boundPad; p.vx *= -0.8; }
      if (p.x > cx + cw - boundPad) { p.x = cx + cw - boundPad; p.vx *= -0.8; }
      if (p.y < cy + boundPad) { p.y = cy + boundPad; p.vy *= -0.8; }
      if (p.y > cy + ch - boundPad) { p.y = cy + ch - boundPad; p.vy *= -0.8; }
    });

    // Draw particles
    const pSize = state === 'Solid' ? 7 : state === 'Liquid' ? 6 : 4;
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (state === 'Solid') {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
      }
    });

    // Bonds for solid
    if (state === 'Solid') {
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      particlesRef.current.forEach((p, i) => {
        particlesRef.current.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 30) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
      });
    }

    // State label and icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    const stateEmoji = state === 'Solid' ? '🧊' : state === 'Liquid' ? '💧' : '💨';
    ctx.fillText(`${stateEmoji} ${state}`, w / 2, h * 0.85);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${substance.charAt(0).toUpperCase() + substance.slice(1)} at ${temp.toFixed(0)}°C`, w / 2, h * 0.9);
    ctx.fillText(`MP: ${mp}°C | BP: ${bp}°C`, w / 2, h * 0.94);

    if (isPlaying) {
      onDataUpdate?.({ time: +timeRef.current.toFixed(2), temperature: +temp.toFixed(1), state });
    }

    ctx.lineWidth = 1;
    animRef.current = requestAnimationFrame(draw);
  }, [temperature, substance, isPlaying, speed, onDataUpdate, initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { const p = canvas.parentElement; if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight; } initParticles(canvas.width, canvas.height); };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animRef.current); };
  }, [draw, initParticles]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
});

StatesOfMatterSimulation.displayName = 'StatesOfMatterSimulation';
