
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
  const bodyGrad = ctx.createLinearGradient(-size, -size, -size, size);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#020617');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, 0);
  ctx.quadraticCurveTo(0, -size * 1.0, size * 1.1, -size * 0.15);
  ctx.lineTo(size * 1.1, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.8, -size * 1.3, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Highlight (Back)
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(0, -size * 0.4, size * 0.8, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Fins
  ctx.fillStyle = color;
  // Dorsal
  ctx.beginPath(); ctx.moveTo(-size * 0.3, -size * 0.6); ctx.lineTo(-size * 0.8, -size * 1.3); ctx.lineTo(size * 0.3, -size * 0.4); ctx.fill();
  // Pectoral
  ctx.beginPath(); ctx.moveTo(size * 0.1, size * 0.1); ctx.lineTo(-size * 0.5, size * 1.0); ctx.lineTo(size * 0.3, size * 0.2); ctx.fill();

  // Gills (Detailed)
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  for(let i=0; i<4; i++) {
    ctx.beginPath(); ctx.moveTo(size * 0.4 - i*5, -size * 0.2); ctx.lineTo(size * 0.4 - i*5, size * 0.2); ctx.stroke();
  }

  // Eye (Angry)
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.15, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.arc(size * 0.82, -size * 0.17, 1.5, 0, Math.PI * 2); ctx.fill();

  // Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, 0);
  ctx.lineTo(-size * 2.0, -size * 1.2); 
  ctx.lineTo(-size * 1.5, 0);
  ctx.lineTo(-size * 1.9, size * 0.7); 
  ctx.closePath();
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
  const bodyGrad = ctx.createLinearGradient(-size, -size, -size, size);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(1, '#0f172a');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, 0);
  ctx.quadraticCurveTo(0, -size * 0.8, size * 0.9, -size * 0.15);
  ctx.lineTo(size * 0.9, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.6, -size * 1.3, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Hammer
  ctx.fillStyle = color;
  ctx.roundRect(size * 0.7, -size * 0.7, size * 0.5, size * 1.4, 6);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.95, -size * 0.55, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.95, size * 0.55, 3, 0, Math.PI * 2); ctx.fill();

  // Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, 0);
  ctx.lineTo(-size * 2.1, -size * 1.0);
  ctx.lineTo(-size * 1.5, 0);
  ctx.lineTo(-size * 1.9, size * 0.6);
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
  metallicGrad.addColorStop(0.5, color);
  metallicGrad.addColorStop(1, '#0f172a');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.1, 0);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.6, size * 1.1, -size * 0.15);
  ctx.lineTo(size * 1.1, size * 0.15);
  ctx.quadraticCurveTo(size * 0.2, size * 0.6, -size * 1.1, 0);
  ctx.fillStyle = metallicGrad;
  ctx.fill();

  // Sword
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(size * 0.9, 0); ctx.lineTo(size * 2.8, 0); ctx.stroke();

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.15, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.15, size * 0.1, 0, Math.PI * 2); ctx.fill();

  // Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.0, 0);
  ctx.quadraticCurveTo(-size * 2.0, -size * 1.3, -size * 2.0, -size * 1.4);
  ctx.quadraticCurveTo(-size * 1.5, 0, -size * 2.0, size * 1.4);
  ctx.quadraticCurveTo(-size * 2.0, size * 1.3, -size * 1.0, 0);
  ctx.fill();
  ctx.restore();
};
