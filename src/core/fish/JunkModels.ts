
import { FishType } from '../types';

export const drawOldShoe = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  const shoeGrad = ctx.createLinearGradient(0, -size, 0, size);
  shoeGrad.addColorStop(0, color);
  shoeGrad.addColorStop(1, '#1a0d06');

  // Sole
  ctx.fillStyle = '#000';
  ctx.roundRect(-size, size * 0.4, size * 2.2, size * 0.4, 4);
  ctx.fill();

  // Upper
  ctx.fillStyle = shoeGrad;
  ctx.beginPath();
  ctx.moveTo(-size, size * 0.4);
  ctx.lineTo(-size, -size * 0.3);
  ctx.quadraticCurveTo(0, -size * 0.6, size * 1.0, size * 0.4);
  ctx.fill();

  // Details: Laces & Stitches
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); 
  for(let i=0; i<3; i++) {
    ctx.moveTo(-size * 0.2 + i*8, -size * 0.2); 
    ctx.lineTo(size * 0.2 + i*8, 0);
  }
  ctx.stroke();

  // Heel highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.arc(-size * 0.7, 0, size * 0.3, 0, Math.PI * 2); ctx.fill();
};

export const drawTinCan = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  const metalGrad = ctx.createLinearGradient(-size, 0, size, 0);
  metalGrad.addColorStop(0, '#475569');
  metalGrad.addColorStop(0.5, color);
  metalGrad.addColorStop(1, '#0f172a');

  // Body
  ctx.fillStyle = metalGrad;
  ctx.roundRect(-size * 0.7, -size, size * 1.4, size * 2, 6);
  ctx.fill();

  // Metallic Shine
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(-size * 0.2, -size, size * 0.3, size * 2);

  // Ridges
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for(let i=-3; i<=3; i++) {
    ctx.beginPath(); ctx.moveTo(-size * 0.7, i * size * 0.25); ctx.lineTo(size * 0.7, i * size * 0.25); ctx.stroke();
  }

  // Label remnant
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.fillRect(-size * 0.7, -size * 0.2, size * 1.4, size * 0.4);
};

export const drawPlasticBag = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const sway = Math.sin(frameCount * 0.05) * 8;
  const bagGrad = ctx.createRadialGradient(sway, 0, 0, 0, 0, size * 1.5);
  bagGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
  bagGrad.addColorStop(1, 'rgba(200,200,255,0.1)');

  ctx.fillStyle = bagGrad;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;

  // Crinkled body
  ctx.beginPath();
  ctx.moveTo(-size + sway, -size);
  ctx.bezierCurveTo(size, -size * 1.5, size + sway, size * 1.5, -size + sway, size);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Handles
  ctx.beginPath();
  ctx.ellipse(-size * 0.4 + sway, -size, size * 0.3, size * 0.5, 0.2, 0, Math.PI * 2);
  ctx.stroke();
};

export const drawBottle = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  const glassGrad = ctx.createLinearGradient(0, -size, 0, size);
  glassGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
  glassGrad.addColorStop(0.5, color);
  glassGrad.addColorStop(1, 'rgba(0,0,0,0.3)');

  ctx.save();
  ctx.globalAlpha = 0.7;
  // Bottle Body
  ctx.fillStyle = glassGrad;
  ctx.roundRect(-size * 0.6, -size * 0.5, size * 1.6, size * 1.0, 10);
  ctx.fill();
  
  // Reflection hit
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.3;
  ctx.roundRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.2, 5);
  ctx.fill();

  // Neck & Cap
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = color;
  ctx.fillRect(size * 0.8, -size * 0.25, size * 0.6, size * 0.5);
  ctx.fillStyle = 'white';
  ctx.fillRect(size * 1.3, -size * 0.3, size * 0.2, size * 0.6);
  
  ctx.restore();
};
