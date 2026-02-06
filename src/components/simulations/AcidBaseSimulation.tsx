import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

interface AcidBaseSimulationProps {
  pH: number;
  indicator: 'litmus' | 'phenolphthalein' | 'methyl_orange' | 'universal';
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; pH: number; hConcentration: number }) => void;
}

export interface AcidBaseSimulationHandle {
  reset: () => void;
}

const getIndicatorColor = (pH: number, indicator: string): string => {
  switch (indicator) {
    case 'litmus':
      return pH < 7 ? '#e74c3c' : pH > 7 ? '#3498db' : '#9b59b6';
    case 'phenolphthalein':
      return pH < 8.2 ? 'rgba(255,255,255,0.1)' : '#e91e9c';
    case 'methyl_orange':
      return pH < 3.1 ? '#e74c3c' : pH < 4.4 ? '#f39c12' : '#f1c40f';
    case 'universal':
      if (pH <= 2) return '#ff0000';
      if (pH <= 4) return '#ff6600';
      if (pH <= 6) return '#ffcc00';
      if (pH <= 7) return '#66cc00';
      if (pH <= 8) return '#00cc66';
      if (pH <= 10) return '#0066cc';
      if (pH <= 12) return '#3300cc';
      return '#6600cc';
    default:
      return '#ffffff';
  }
};

const getSubstanceName = (pH: number): string => {
  if (pH <= 1) return 'Battery Acid';
  if (pH <= 2) return 'Stomach Acid';
  if (pH <= 3) return 'Lemon Juice';
  if (pH <= 4) return 'Vinegar';
  if (pH <= 5) return 'Coffee';
  if (pH <= 6) return 'Milk';
  if (pH <= 7) return 'Pure Water';
  if (pH <= 8) return 'Baking Soda';
  if (pH <= 9) return 'Soap';
  if (pH <= 10) return 'Ammonia';
  if (pH <= 11) return 'Bleach';
  if (pH <= 12) return 'Lime';
  return 'Drain Cleaner';
};

export const AcidBaseSimulation = forwardRef<AcidBaseSimulationHandle, AcidBaseSimulationProps>(({
  pH, indicator, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const bubblesRef = useRef<{ x: number; y: number; r: number; speed: number; opacity: number }[]>([]);

  useImperativeHandle(ref, () => ({ reset: () => { timeRef.current = 0; bubblesRef.current = []; } }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Beaker
    const bx = w * 0.25, by = h * 0.15, bw = w * 0.5, bh = h * 0.65;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Liquid
    const liquidColor = getIndicatorColor(pH, indicator);
    const liquidH = bh * 0.75;
    const liquidY = by + bh - liquidH;
    
    const grad = ctx.createLinearGradient(bx, liquidY, bx, by + bh);
    grad.addColorStop(0, liquidColor);
    grad.addColorStop(1, liquidColor.replace(')', ', 0.7)').replace('rgb', 'rgba'));
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 2, liquidY, bw - 4, liquidH - 2);

    // Bubbles for acids (pH < 5)
    if (pH < 5 && isPlaying) {
      if (Math.random() < 0.1 * speed) {
        bubblesRef.current.push({
          x: bx + 10 + Math.random() * (bw - 20),
          y: by + bh - 10,
          r: 2 + Math.random() * 4,
          speed: 0.5 + Math.random() * 1.5,
          opacity: 0.8
        });
      }
    }

    bubblesRef.current = bubblesRef.current.filter(b => {
      b.y -= b.speed * speed;
      b.opacity -= 0.005;
      if (b.y < liquidY || b.opacity <= 0) return false;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${b.opacity})`;
      ctx.stroke();
      return true;
    });

    // pH Scale bar on right
    const scaleX = w * 0.82, scaleY = h * 0.1, scaleW = w * 0.06, scaleH = h * 0.8;
    const scaleGrad = ctx.createLinearGradient(scaleX, scaleY, scaleX, scaleY + scaleH);
    const colors = ['#ff0000','#ff6600','#ffcc00','#66cc00','#00cc66','#0066cc','#3300cc','#6600cc'];
    colors.forEach((c, i) => scaleGrad.addColorStop(i / (colors.length - 1), c));
    ctx.fillStyle = scaleGrad;
    ctx.fillRect(scaleX, scaleY, scaleW, scaleH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(scaleX, scaleY, scaleW, scaleH);

    // pH marker
    const markerY = scaleY + (pH / 14) * scaleH;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(scaleX - 8, markerY);
    ctx.lineTo(scaleX, markerY - 6);
    ctx.lineTo(scaleX, markerY + 6);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0 (Acid)', scaleX - 12, scaleY + 12);
    ctx.fillText('7 (Neutral)', scaleX - 12, scaleY + scaleH / 2 + 4);
    ctx.fillText('14 (Base)', scaleX - 12, scaleY + scaleH);

    // Info text
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`pH ${pH.toFixed(1)} — ${getSubstanceName(pH)}`, w / 2, h * 0.92);
    
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const type = pH < 7 ? 'Acidic' : pH > 7 ? 'Basic/Alkaline' : 'Neutral';
    ctx.fillText(`${type} | [H⁺] = ${Math.pow(10, -pH).toExponential(2)} mol/L`, w / 2, h * 0.96);

    if (isPlaying) {
      timeRef.current += 0.016 * speed;
      onDataUpdate?.({ time: parseFloat(timeRef.current.toFixed(2)), pH, hConcentration: Math.pow(10, -pH) });
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [pH, indicator, isPlaying, speed, onDataUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight; }
    };
    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animFrameRef.current); };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
});

AcidBaseSimulation.displayName = 'AcidBaseSimulation';
