import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface FrictionSimulationProps {
  mass: number;
  appliedForce: number;
  frictionCoeff: number;
  surface: 'wood' | 'ice' | 'rubber' | 'steel';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; position: number; velocity: number; acceleration: number }) => void;
}

export interface FrictionSimulationHandle { reset: () => void; }

const SURFACE_COLORS: Record<string, string> = {
  wood: '#8B6914', ice: '#a8d8ea', rubber: '#333', steel: '#888'
};

export const FrictionSimulation = forwardRef<FrictionSimulationHandle, FrictionSimulationProps>(({
  mass, appliedForce, frictionCoeff, surface, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ time: 0, position: 0, velocity: 0 });

  useImperativeHandle(ref, () => ({
    reset: () => { stateRef.current = { time: 0, position: 0, velocity: 0 }; }
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const s = stateRef.current;
    const g = 9.8;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Ground / surface
    const groundY = h * 0.65;
    ctx.fillStyle = SURFACE_COLORS[surface] || '#666';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

    // Physics
    const normalForce = mass * g;
    const frictionForce = frictionCoeff * normalForce;
    const netForce = Math.max(0, appliedForce - frictionForce);
    const acceleration = netForce / mass;

    if (isPlaying) {
      const dt = 0.016 * speed;
      s.velocity += acceleration * dt;
      s.position += s.velocity * dt;
      s.time += dt;
      if (s.position > 15) { s.position = 0; s.velocity = 0; }
      onDataUpdate?.({ time: +s.time.toFixed(2), position: +s.position.toFixed(3), velocity: +s.velocity.toFixed(3), acceleration: +acceleration.toFixed(3) });
    }

    // Block
    const blockW = 60 + mass * 8;
    const blockH = 40 + mass * 5;
    const blockX = w * 0.15 + (s.position % 12) * (w * 0.05);
    const blockY = groundY - blockH;

    ctx.fillStyle = 'hsl(220, 60%, 50%)';
    ctx.fillRect(blockX, blockY, blockW, blockH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(blockX, blockY, blockW, blockH);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass} kg`, blockX + blockW / 2, blockY + blockH / 2 + 4);

    // Force arrows
    const centerX = blockX + blockW / 2;
    const centerY = blockY + blockH / 2;
    const arrowScale = 3;

    // Applied force (right)
    if (appliedForce > 0) {
      ctx.strokeStyle = '#2ecc71'; ctx.fillStyle = '#2ecc71'; ctx.lineWidth = 3;
      const len = appliedForce * arrowScale;
      ctx.beginPath(); ctx.moveTo(blockX + blockW, centerY); ctx.lineTo(blockX + blockW + len, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(blockX + blockW + len, centerY); ctx.lineTo(blockX + blockW + len - 8, centerY - 5); ctx.lineTo(blockX + blockW + len - 8, centerY + 5); ctx.fill();
      ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`F = ${appliedForce.toFixed(1)} N`, blockX + blockW + len + 5, centerY + 4);
    }

    // Friction force (left)
    if (frictionForce > 0 && (appliedForce > 0 || s.velocity > 0)) {
      ctx.strokeStyle = '#e74c3c'; ctx.fillStyle = '#e74c3c'; ctx.lineWidth = 3;
      const len = Math.min(frictionForce, appliedForce) * arrowScale;
      ctx.beginPath(); ctx.moveTo(blockX, centerY); ctx.lineTo(blockX - len, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(blockX - len, centerY); ctx.lineTo(blockX - len + 8, centerY - 5); ctx.lineTo(blockX - len + 8, centerY + 5); ctx.fill();
      ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(`f = ${frictionForce.toFixed(1)} N`, blockX - len - 5, centerY + 4);
    }

    // Weight (down)
    ctx.strokeStyle = '#f39c12'; ctx.fillStyle = '#f39c12'; ctx.lineWidth = 2;
    const wLen = Math.min(normalForce * 1.5, h * 0.15);
    ctx.beginPath(); ctx.moveTo(centerX, blockY + blockH); ctx.lineTo(centerX, blockY + blockH + wLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, blockY + blockH + wLen); ctx.lineTo(centerX - 4, blockY + blockH + wLen - 8); ctx.lineTo(centerX + 4, blockY + blockH + wLen - 8); ctx.fill();

    // Normal (up)
    ctx.strokeStyle = '#9b59b6'; ctx.fillStyle = '#9b59b6';
    ctx.beginPath(); ctx.moveTo(centerX, blockY); ctx.lineTo(centerX, blockY - wLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, blockY - wLen); ctx.lineTo(centerX - 4, blockY - wLen + 8); ctx.lineTo(centerX + 4, blockY - wLen + 8); ctx.fill();

    // Info panel
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Net Force: ${netForce.toFixed(1)} N`, 15, h * 0.88);
    ctx.fillText(`Acceleration: ${acceleration.toFixed(2)} m/s²`, 15, h * 0.92);
    ctx.fillText(`Velocity: ${s.velocity.toFixed(2)} m/s`, 15, h * 0.96);

    // Legend
    ctx.font = '11px sans-serif';
    const leg = [['Applied Force','#2ecc71'],['Friction','#e74c3c'],['Weight','#f39c12'],['Normal','#9b59b6']];
    leg.forEach(([label, color], i) => {
      ctx.fillStyle = color as string;
      ctx.fillRect(w - 140, 15 + i * 18, 10, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(label as string, w - 125, 24 + i * 18);
    });

    ctx.lineWidth = 1;
    animRef.current = requestAnimationFrame(draw);
  }, [mass, appliedForce, frictionCoeff, surface, isPlaying, speed, onDataUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { const p = canvas.parentElement; if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight; } };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
});

FrictionSimulation.displayName = 'FrictionSimulation';
