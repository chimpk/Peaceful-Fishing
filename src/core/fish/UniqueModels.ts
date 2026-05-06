
import { FishType } from '../types';

export const drawRay = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(1, '#020617');

  const flap = Math.sin(frameCount * 0.08) * 0.4;
  
  // Wings (Diamond)
  ctx.save();
  ctx.scale(1, 1 + flap);
  ctx.beginPath();
  ctx.moveTo(size * 1.3, 0); 
  ctx.bezierCurveTo(size * 0.5, -size * 1.8, -size * 0.5, -size * 1.8, -size, 0);
  ctx.bezierCurveTo(-size * 0.5, size * 1.8, size * 0.5, size * 1.8, size * 1.3, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Wing Edges (Highlight)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Pattern
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for(let i=0; i<8; i++) {
    ctx.beginPath(); ctx.arc(-size*0.4 + i*8, Math.sin(i)*10, 3, 0, Math.PI*2); ctx.fill();
  }

  // Tail
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.quadraticCurveTo(-size * 2, Math.sin(frameCount * 0.1) * 15, -size * 3, 0);
  ctx.stroke();
};

export const drawSunfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const bodyGrad = ctx.createRadialGradient(size * 0.3, -size * 0.3, size * 0.2, 0, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#f8fafc');
  bodyGrad.addColorStop(0.2, color);
  bodyGrad.addColorStop(1, '#0f172a');

  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Rough skin texture
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for(let i=0; i<10; i++) {
    ctx.beginPath(); ctx.arc(0,0, size * (0.2 + i * 0.1), 0, Math.PI * 2); ctx.stroke();
  }

  const finWag = Math.sin(frameCount * 0.04) * 0.3;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  // Top Fin
  ctx.save(); ctx.rotate(finWag);
  ctx.beginPath(); ctx.moveTo(0, -size * 0.8); ctx.quadraticCurveTo(-size * 0.5, -size * 2.5, size * 0.2, -size * 0.8); ctx.fill();
  ctx.restore();
  // Bottom Fin
  ctx.save(); ctx.rotate(-finWag);
  ctx.beginPath(); ctx.moveTo(0, size * 0.8); ctx.quadraticCurveTo(-size * 0.5, size * 2.5, size * 0.2, size * 0.8); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.9, -size * 0.2, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.95, -size * 0.2, size * 0.1, 0, Math.PI * 2); ctx.fill();
};

export const drawSeahorse = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  ctx.rotate(Math.PI / 2);
  
  const bodyGrad = ctx.createLinearGradient(0, -size * 2, 0, size * 3);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.5, '#fbbf24');
  bodyGrad.addColorStop(1, color);

  ctx.beginPath();
  ctx.moveTo(0, -size * 1.5);
  ctx.quadraticCurveTo(size * 1.0, -size * 0.5, 0, size);
  ctx.quadraticCurveTo(-size * 1.0, size * 2.0, -size * 0.2, size * 3);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = size * 0.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Snout
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(size * 0.4, -size * 1.7, size * 0.7, size * 0.25, 0.3, 0, Math.PI * 2); ctx.fill();

  // Bony plates
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  for(let i=0; i<6; i++) {
    ctx.beginPath(); ctx.moveTo(-size * 0.3, -size + i * 8); ctx.lineTo(size * 0.3, -size + i * 8); ctx.stroke();
  }

  // Eye
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.3, -size * 1.8, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

export const drawDragon = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const segments = 10;
  for(let i=0; i<segments; i++) {
    const t = i / segments;
    const segX = -size * 2 + (i * size * 4 / segments);
    const segY = Math.sin(frameCount * 0.08 + i * 0.7) * 20;
    const segSize = size * (1.2 - t * 0.8);
    
    const segGrad = ctx.createRadialGradient(segX, segY, 0, segX, segY, segSize);
    segGrad.addColorStop(0, color);
    segGrad.addColorStop(0.8, color);
    segGrad.addColorStop(1, '#000000');

    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(segX, segY, segSize, segSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden scales for dragon
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.beginPath(); ctx.arc(segX, segY, segSize * 0.4, 0, Math.PI * 2); ctx.fill();

    // Spikes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(segX, segY - segSize * 0.5);
    ctx.lineTo(segX - 8, segY - segSize * 1.5);
    ctx.lineTo(segX + 2, segY - segSize * 0.5);
    ctx.fill();
  }

  // Dragon Head
  const headX = size * 2;
  const headY = Math.sin(frameCount * 0.08 + segments * 0.7) * 20;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(headX, headY, size, 0, Math.PI * 2); ctx.fill();
  // Glow for head
  ctx.shadowBlur = 20; ctx.shadowColor = color;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(headX + size * 0.5, headY - size * 0.3, 5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
};

export const drawKraken = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  // Mantle
  const mantleGrad = ctx.createRadialGradient(size * 0.5, 0, 0, size * 0.5, 0, size);
  mantleGrad.addColorStop(0, color);
  mantleGrad.addColorStop(1, '#020617');
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.6, 0, size * 1.0, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large bioluminescent eyes
  const pulse = (Math.sin(frameCount * 0.05) + 1) / 2;
  ctx.shadowBlur = 10 + pulse * 15;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.arc(size * 0.5, -size * 0.3, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.5, size * 0.3, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.55, -size * 0.3, size * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.55, size * 0.3, size * 0.12, 0, Math.PI * 2); ctx.fill();

  // Animated Tentacles
  for(let i=0; i<8; i++) {
    const angle = (i - 3.5) * 0.35;
    const tentWag = Math.sin(frameCount * 0.07 + i) * 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.25;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 2, angle * size + tentWag, -size * 3.5, angle * size * 1.8);
    ctx.stroke();
    // Suction cups
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(-size, angle * size + tentWag * 0.5, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1.0;
};
