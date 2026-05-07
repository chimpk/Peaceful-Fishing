
import { FishType } from '../types';

export const drawShark = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#020617');

  // 1. Body (Muscular)
  ctx.beginPath();
  ctx.moveTo(-size * 1.4, 0);
  ctx.quadraticCurveTo(0, -size * 1.1, size * 1.2, -size * 0.2);
  ctx.lineTo(size * 1.2, size * 0.2);
  ctx.quadraticCurveTo(0, size * 0.9, -size * 1.4, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 2. Highlights & Belly
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(size * 0.1, -size * 0.5, size * 0.9, size * 0.2, -0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.ellipse(-size * 0.2, size * 0.4, size * 1.1, size * 0.25, 0.1, 0, Math.PI); ctx.fill();
  ctx.restore();

  // 3. Sharp Fins
  ctx.fillStyle = color;
  // Dorsal (Iconic shark fin)
  ctx.beginPath(); 
  ctx.moveTo(-size * 0.2, -size * 0.65); 
  ctx.quadraticCurveTo(-size * 0.9, -size * 1.5, -size * 0.7, -size * 0.5); 
  ctx.fill();
  // Pectoral (Wide)
  ctx.beginPath(); 
  ctx.moveTo(size * 0.2, size * 0.1); 
  ctx.quadraticCurveTo(-size * 0.7, size * 1.2, size * 0.4, size * 0.25); 
  ctx.fill();

  // 4. Gills (Deep slits)
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for(let i=0; i<5; i++) {
    const gx = size * 0.45 - i * 7;
    ctx.beginPath(); ctx.moveTo(gx, -size * 0.25); ctx.quadraticCurveTo(gx - 2, 0, gx, size * 0.25); ctx.stroke();
  }

  // 5. Angry Eye
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'red';
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.18, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath(); ctx.arc(size * 0.87, -size * 0.2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 6. Powerful Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, 0);
  ctx.quadraticCurveTo(-size * 2.2, -size * 1.4, -size * 1.7, 0);
  ctx.quadraticCurveTo(-size * 2.2, size * 0.8, -size * 1.3, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

export const drawHammerhead = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(1, '#0f172a');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.4, 0);
  ctx.quadraticCurveTo(0, -size * 0.9, size * 1.0, -size * 0.2);
  ctx.lineTo(size * 1.0, size * 0.2);
  ctx.quadraticCurveTo(0, size * 0.7, -size * 1.4, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Hammer (T-shape)
  const hammerGrad = ctx.createLinearGradient(size * 0.7, -size, size * 1.2, size);
  hammerGrad.addColorStop(0, color);
  hammerGrad.addColorStop(1, '#020617');
  ctx.fillStyle = hammerGrad;
  ctx.beginPath();
  ctx.roundRect(size * 0.75, -size * 0.8, size * 0.55, size * 1.6, 8);
  ctx.fill();
  
  // Eyes at edges
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.05, -size * 0.65, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.05, size * 0.65, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.07, -size * 0.67, 1.2, 0, Math.PI * 2); ctx.fill();

  // Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, 0);
  ctx.lineTo(-size * 2.3, -size * 1.2);
  ctx.lineTo(-size * 1.7, 0);
  ctx.lineTo(-size * 2.1, size * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const drawSwordfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const metallicGrad = ctx.createLinearGradient(0, -size, 0, size);
  metallicGrad.addColorStop(0, '#94a3b8');
  metallicGrad.addColorStop(0.3, color);
  metallicGrad.addColorStop(0.7, color);
  metallicGrad.addColorStop(1, '#0f172a');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, 0);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.7, size * 1.2, -size * 0.2);
  ctx.lineTo(size * 1.2, size * 0.2);
  ctx.quadraticCurveTo(size * 0.2, size * 0.7, -size * 1.2, 0);
  ctx.fillStyle = metallicGrad;
  ctx.fill();

  // Sword (Long & Tapered)
  const swordGrad = ctx.createLinearGradient(size * 1.0, 0, size * 3.0, 0);
  swordGrad.addColorStop(0, '#cbd5e1');
  swordGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');
  ctx.strokeStyle = swordGrad;
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(size * 1.0, 0); ctx.lineTo(size * 3.2, 0); ctx.stroke();

  // Professional Eye
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.18, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 0.9, -size * 0.18, size * 0.12, 0, Math.PI * 2); ctx.fill();

  // Tail (Large & Fast)
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.1, 0);
  ctx.quadraticCurveTo(-size * 2.2, -size * 1.5, -size * 2.2, -size * 1.6);
  ctx.quadraticCurveTo(-size * 1.6, 0, -size * 2.2, size * 1.6);
  ctx.quadraticCurveTo(-size * 2.2, size * 1.5, -size * 1.1, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

