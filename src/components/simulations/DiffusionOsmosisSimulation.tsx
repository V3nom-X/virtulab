import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface DiffusionOsmosisSimulationProps {
  mode: 'diffusion' | 'osmosis';
  concentrationLeft: number;
  concentrationRight: number;
  membranePermeability: number;
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; leftConc: number; rightConc: number }) => void;
}

export interface DiffusionOsmosisSimulationHandle { reset: () => void; }

interface Particle {
  x: number; y: number; vx: number; vy: number;
  type: 'solute' | 'water'; side: 'left' | 'right';
}

export const DiffusionOsmosisSimulation = forwardRef<DiffusionOsmosisSimulationHandle, DiffusionOsmosisSimulationProps>(({
  mode, concentrationLeft, concentrationRight, membranePermeability, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const leftConcRef = useRef(concentrationLeft);
  const rightConcRef = useRef(concentrationRight);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const midX = w / 2;
    const area = { y: h * 0.15, h: h * 0.65 };

    // Left side solute particles
    for (let i = 0; i < concentrationLeft * 5; i++) {
      particles.push({
        x: 30 + Math.random() * (midX - 50),
        y: area.y + 20 + Math.random() * (area.h - 40),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'solute', side: 'left'
      });
    }
    // Right side solute
    for (let i = 0; i < concentrationRight * 5; i++) {
      particles.push({
        x: midX + 20 + Math.random() * (midX - 50),
        y: area.y + 20 + Math.random() * (area.h - 40),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'solute', side: 'right'
      });
    }
    // Water particles on both sides
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: 30 + Math.random() * (midX - 50), y: area.y + 20 + Math.random() * (area.h - 40),
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        type: 'water', side: 'left'
      });
      particles.push({
        x: midX + 20 + Math.random() * (midX - 50), y: area.y + 20 + Math.random() * (area.h - 40),
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        type: 'water', side: 'right'
      });
    }
    particlesRef.current = particles;
    leftConcRef.current = concentrationLeft;
    rightConcRef.current = concentrationRight;
  }, [concentrationLeft, concentrationRight]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      timeRef.current = 0;
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

    const midX = w / 2;
    const area = { x: 20, y: h * 0.15, w: w - 40, h: h * 0.65 };

    // Container
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(area.x, area.y, area.w, area.h);

    // Membrane
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = mode === 'osmosis' ? '#e74c3c' : '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(midX, area.y); ctx.lineTo(midX, area.y + area.h); ctx.stroke();
    ctx.setLineDash([]);

    // Membrane pores
    const poreCount = Math.floor(membranePermeability * 6) + 1;
    for (let i = 0; i < poreCount; i++) {
      const py = area.y + (i + 1) * area.h / (poreCount + 1);
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(midX - 3, py - 5, 6, 10);
    }

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Higher Concentration', area.x + (midX - area.x) / 2, area.y - 5);
    ctx.fillText('Lower Concentration', midX + (area.x + area.w - midX) / 2, area.y - 5);

    // Update particles
    if (isPlaying) {
      timeRef.current += 0.016 * speed;

      particlesRef.current.forEach(p => {
        p.vx += (Math.random() - 0.5) * 0.3 * speed;
        p.vy += (Math.random() - 0.5) * 0.3 * speed;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Bounds
        if (p.y < area.y + 5) { p.y = area.y + 5; p.vy *= -1; }
        if (p.y > area.y + area.h - 5) { p.y = area.y + area.h - 5; p.vy *= -1; }
        if (p.x < area.x + 5) { p.x = area.x + 5; p.vx *= -1; }
        if (p.x > area.x + area.w - 5) { p.x = area.x + area.w - 5; p.vx *= -1; }

        // Membrane crossing logic
        const nearMembrane = Math.abs(p.x - midX) < 8;
        if (nearMembrane) {
          const canCross = Math.random() < membranePermeability * 0.02 * speed;
          if (mode === 'diffusion') {
            // Solute can cross if membrane allows
            if (p.type === 'solute' && canCross) {
              p.side = p.x < midX ? 'right' : 'left';
            } else if (p.type === 'solute' && !canCross) {
              p.vx *= -1; p.x += p.x < midX ? -3 : 3;
            }
            // Water always crosses freely
          } else {
            // Osmosis: only water crosses membrane, solute blocked
            if (p.type === 'solute') {
              p.vx *= -1; p.x += p.x < midX ? -3 : 3;
            }
            // Water moves toward higher solute concentration
          }
        }
      });

      // Count concentrations
      const leftSolute = particlesRef.current.filter(p => p.x < midX && p.type === 'solute').length;
      const rightSolute = particlesRef.current.filter(p => p.x >= midX && p.type === 'solute').length;
      leftConcRef.current = leftSolute / 5;
      rightConcRef.current = rightSolute / 5;

      onDataUpdate?.({
        time: +timeRef.current.toFixed(2),
        leftConc: +leftConcRef.current.toFixed(1),
        rightConc: +rightConcRef.current.toFixed(1)
      });
    }

    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.type === 'solute' ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'solute' ? '#e74c3c' : '#3498db';
      ctx.globalAlpha = p.type === 'water' ? 0.5 : 0.9;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mode === 'diffusion' ? '🔬 Diffusion' : '🧫 Osmosis', w / 2, h * 0.88);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`Left: ${leftConcRef.current.toFixed(1)} | Right: ${rightConcRef.current.toFixed(1)}`, w / 2, h * 0.93);

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(15, h * 0.88, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('Solute', 28, h * 0.88 + 8);
    ctx.fillStyle = '#3498db'; ctx.fillRect(15, h * 0.92, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('Water', 28, h * 0.92 + 8);

    ctx.lineWidth = 1;
    animRef.current = requestAnimationFrame(draw);
  }, [mode, membranePermeability, isPlaying, speed, onDataUpdate, initParticles]);

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

DiffusionOsmosisSimulation.displayName = 'DiffusionOsmosisSimulation';
