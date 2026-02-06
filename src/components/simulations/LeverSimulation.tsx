import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

interface LeverSimulationProps {
  loadMass: number;
  effortForce: number;
  fulcrumPosition: number; // 0-1 along beam
  isPlaying: boolean;
  speed: number;
  onDataUpdate?: (data: { time: number; mechanicalAdvantage: number; effortRequired: number }) => void;
}

export interface LeverSimulationHandle { reset: () => void; }

export const LeverSimulation = forwardRef<LeverSimulationHandle, LeverSimulationProps>(({
  loadMass, effortForce, fulcrumPosition, isPlaying, speed, onDataUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const angleRef = useRef(0);

  useImperativeHandle(ref, () => ({ reset: () => { timeRef.current = 0; angleRef.current = 0; } }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    const beamLen = w * 0.7;
    const fulcrumX = w * 0.15 + beamLen * fulcrumPosition;
    const fulcrumY = h * 0.55;
    const loadArmLen = fulcrumPosition * beamLen;
    const effortArmLen = (1 - fulcrumPosition) * beamLen;

    // Calculate physics
    const g = 9.8;
    const loadWeight = loadMass * g;
    const loadTorque = loadWeight * loadArmLen;
    const effortTorque = effortForce * effortArmLen;
    const netTorque = effortTorque - loadTorque;
    const MA = effortArmLen > 0 ? loadArmLen / effortArmLen : 0;
    const effortRequired = loadArmLen > 0 && effortArmLen > 0 ? loadWeight * loadArmLen / effortArmLen : 0;

    if (isPlaying) {
      const dt = 0.016 * speed;
      timeRef.current += dt;
      // Animate tilt based on net torque
      const targetAngle = Math.max(-0.3, Math.min(0.3, netTorque * 0.001));
      angleRef.current += (targetAngle - angleRef.current) * 0.05 * speed;
      onDataUpdate?.({ time: +timeRef.current.toFixed(2), mechanicalAdvantage: +MA.toFixed(2), effortRequired: +effortRequired.toFixed(1) });
    }

    const angle = angleRef.current;

    // Fulcrum triangle
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(fulcrumX, fulcrumY);
    ctx.lineTo(fulcrumX - 20, fulcrumY + 35);
    ctx.lineTo(fulcrumX + 20, fulcrumY + 35);
    ctx.closePath();
    ctx.fill();

    // Ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, fulcrumY + 35, w, h - fulcrumY - 35);

    // Beam (rotated around fulcrum)
    ctx.save();
    ctx.translate(fulcrumX, fulcrumY);
    ctx.rotate(angle);

    ctx.fillStyle = '#666';
    ctx.fillRect(-loadArmLen, -5, beamLen, 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(-loadArmLen, -5, beamLen, 10);

    // Load (left side)
    const loadBoxW = 30 + loadMass * 3;
    const loadBoxH = 25 + loadMass * 3;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-loadArmLen - loadBoxW / 2 + 10, -5 - loadBoxH, loadBoxW, loadBoxH);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${loadMass} kg`, -loadArmLen + 10, -5 - loadBoxH / 2 + 4);

    // Load arrow (down)
    ctx.strokeStyle = '#e74c3c'; ctx.fillStyle = '#e74c3c'; ctx.lineWidth = 2;
    const lwLen = Math.min(loadWeight * 0.8, 60);
    ctx.beginPath(); ctx.moveTo(-loadArmLen + 10, 5); ctx.lineTo(-loadArmLen + 10, 5 + lwLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-loadArmLen + 10, 5 + lwLen); ctx.lineTo(-loadArmLen + 6, 5 + lwLen - 6); ctx.lineTo(-loadArmLen + 14, 5 + lwLen - 6); ctx.fill();

    // Effort arrow (down on right side, representing push)
    ctx.strokeStyle = '#2ecc71'; ctx.fillStyle = '#2ecc71';
    const efLen = Math.min(effortForce * 0.8, 60);
    const efX = effortArmLen - 10;
    ctx.beginPath(); ctx.moveTo(efX, -5 - efLen); ctx.lineTo(efX, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(efX, -5); ctx.lineTo(efX - 4, -5 - 6); ctx.lineTo(efX + 4, -5 - 6); ctx.fill();
    ctx.fillStyle = '#2ecc71';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${effortForce} N`, efX, -5 - efLen - 8);

    ctx.restore();

    // Distance labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Load Arm: ${(loadArmLen / 50).toFixed(1)} m`, fulcrumX - loadArmLen / 2, fulcrumY + 55);
    ctx.fillText(`Effort Arm: ${(effortArmLen / 50).toFixed(1)} m`, fulcrumX + effortArmLen / 2, fulcrumY + 55);

    // Info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    const balanced = Math.abs(netTorque) < 1;
    ctx.fillText(`MA = ${MA.toFixed(2)}`, 15, h * 0.88);
    ctx.fillText(`Effort Needed: ${effortRequired.toFixed(1)} N`, 15, h * 0.92);
    ctx.fillText(`Status: ${balanced ? '⚖️ Balanced' : netTorque > 0 ? '⬆️ Effort wins' : '⬇️ Load wins'}`, 15, h * 0.96);

    ctx.lineWidth = 1;
    animRef.current = requestAnimationFrame(draw);
  }, [loadMass, effortForce, fulcrumPosition, isPlaying, speed, onDataUpdate]);

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

LeverSimulation.displayName = 'LeverSimulation';
