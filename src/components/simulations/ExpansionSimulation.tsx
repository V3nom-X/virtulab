import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface ExpansionSimulationProps {
  temperature: number;
  material: 'iron' | 'copper' | 'aluminum' | 'glass';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; expansion: number; temperature: number }) => void;
}

export interface ExpansionSimulationHandle { reset: () => void; }

const COEFFICIENTS: Record<string, number> = {
  iron: 12e-6, copper: 17e-6, aluminum: 23e-6, glass: 9e-6
};
const MAT_COLORS: Record<string, string> = {
  iron: '#7f8c8d', copper: '#e67e22', aluminum: '#bdc3c7', glass: '#85c1e9'
};

export const ExpansionSimulation = forwardRef<ExpansionSimulationHandle, ExpansionSimulationProps>(({
  temperature, material, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const currentTempRef = useRef(20);

  useImperativeHandle(ref, () => ({ reset: () => { timeRef.current = 0; currentTempRef.current = 20; } }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    if (isPlaying) {
      const dt = 0.016 * speed;
      timeRef.current += dt;
      currentTempRef.current += (temperature - currentTempRef.current) * 0.02 * speed;
    }

    const temp = currentTempRef.current;
    const alpha = COEFFICIENTS[material] || 12e-6;
    const deltaT = temp - 20; // reference at 20°C
    const originalLength = 1; // 1 meter
    const expansion = originalLength * alpha * deltaT;
    const expansionPercent = expansion * 100;

    // Thermometer
    const thX = w * 0.08, thY = h * 0.1, thH = h * 0.7;
    ctx.fillStyle = '#333';
    ctx.fillRect(thX - 8, thY, 16, thH);
    ctx.beginPath(); ctx.arc(thX, thY + thH + 12, 18, 0, Math.PI * 2); ctx.fill();

    const fillH = ((temp + 50) / 350) * thH;
    const tempColor = temp < 0 ? '#3498db' : temp < 100 ? '#e74c3c' : '#ff4500';
    ctx.fillStyle = tempColor;
    ctx.fillRect(thX - 5, thY + thH - fillH, 10, fillH);
    ctx.beginPath(); ctx.arc(thX, thY + thH + 12, 14, 0, Math.PI * 2); ctx.fill();

    // Temperature labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ['-50°C', '0°C', '100°C', '200°C', '300°C'].forEach((label, i) => {
      const y = thY + thH - (([0, 50, 150, 250, 350][i] || 0) / 350) * thH;
      ctx.fillText(label, thX + 14, y + 3);
      ctx.beginPath(); ctx.moveTo(thX + 8, y); ctx.lineTo(thX + 12, y); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
    });

    // Material bar - original
    const barY = h * 0.4;
    const barOrigW = w * 0.45;
    const barH = 35;
    const barX = w * 0.3;

    // Original outline (dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(barX, barY, barOrigW, barH);
    ctx.setLineDash([]);

    // Expanded bar
    const expandFactor = 1 + alpha * deltaT * 500; // exaggerated for visualization
    const expandedW = barOrigW * expandFactor;
    ctx.fillStyle = MAT_COLORS[material];
    ctx.fillRect(barX, barY, expandedW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.strokeRect(barX, barY, expandedW, barH);

    // Material label
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(material.charAt(0).toUpperCase() + material.slice(1), barX + expandedW / 2, barY + barH / 2 + 4);

    // Expansion indicator
    if (Math.abs(expandedW - barOrigW) > 1) {
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX + barOrigW, barY + barH + 10);
      ctx.lineTo(barX + expandedW, barY + barH + 10);
      ctx.stroke();
      ctx.fillStyle = '#2ecc71';
      ctx.font = '11px sans-serif';
      ctx.fillText(`ΔL = ${(expansion * 1000).toFixed(3)} mm`, barX + (barOrigW + expandedW) / 2, barY + barH + 25);
    }

    // Particle visualization
    const particleArea = { x: w * 0.3, y: h * 0.62, w: w * 0.5, h: h * 0.25 };
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(particleArea.x, particleArea.y, particleArea.w, particleArea.h);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Particle Motion', particleArea.x, particleArea.y - 5);

    const vibration = Math.max(0, temp / 100) * 3;
    const cols = 8, rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = particleArea.x + 20 + c * (particleArea.w - 40) / (cols - 1) + (Math.random() - 0.5) * vibration;
        const py = particleArea.y + 15 + r * (particleArea.h - 30) / (rows - 1) + (Math.random() - 0.5) * vibration;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = MAT_COLORS[material];
        ctx.fill();
      }
    }

    // Info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${temp.toFixed(0)}°C | α = ${(alpha * 1e6).toFixed(0)} × 10⁻⁶ /°C`, w / 2, h * 0.95);

    if (isPlaying) {
      onDataUpdate?.({ time: +timeRef.current.toFixed(2), expansion: +expansion.toFixed(8), temperature: +temp.toFixed(1) });
    }

    ctx.lineWidth = 1;
    animRef.current = requestAnimationFrame(draw);
  }, [temperature, material, isPlaying, speed, onDataUpdate]);

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

ExpansionSimulation.displayName = 'ExpansionSimulation';
