
import { FishType } from '../types';

export const drawOldShoe = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  ctx.save();
  const shoeGrad = ctx.createLinearGradient(0, -size, 0, size);
  shoeGrad.addColorStop(0, color);
  shoeGrad.addColorStop(1, '#1a0d06');

  // Sole (Thick and worn)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, size * 0.5);
  ctx.lineTo(size * 1.0, size * 0.5);
  ctx.quadraticCurveTo(size * 1.3, size * 0.5, size * 1.3, size * 0.2);
  ctx.lineTo(-size * 1.2, size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Shoe Body (Upper)
  ctx.fillStyle = shoeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 1.1, size * 0.2);
  ctx.lineTo(-size * 1.1, -size * 0.6); // Boot neck
  ctx.bezierCurveTo(-size * 0.2, -size * 0.6, size * 0.2, 0, size * 1.2, size * 0.2);
  ctx.fill();

  // Tongue & Laces
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for(let i=0; i<4; i++) {
    const ly = -size * 0.2 + i * size * 0.15;
    ctx.moveTo(-size * 0.3, ly);
    ctx.lineTo(size * 0.1, ly + size * 0.1);
    ctx.moveTo(size * 0.1, ly);
    ctx.lineTo(-size * 0.3, ly + size * 0.1);
  }
  ctx.stroke();

  // Hole in the toe
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(size * 0.8, size * 0.1, size * 0.2, size * 0.1, 0.2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawTinCan = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  ctx.save();
  const metalGrad = ctx.createLinearGradient(-size, -size, size, size);
  metalGrad.addColorStop(0, '#94a3b8');
  metalGrad.addColorStop(0.5, color);
  metalGrad.addColorStop(1, '#1e293b');

  // Dented Body
  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.7, -size);
  ctx.lineTo(size * 0.7, -size);
  ctx.quadraticCurveTo(size * 0.9, 0, size * 0.7, size); // Dented side
  ctx.lineTo(-size * 0.7, size);
  ctx.bezierCurveTo(-size * 0.9, size * 0.5, -size * 0.5, -size * 0.5, -size * 0.7, -size);
  ctx.fill();

  // Metallic Ridges
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  for(let i=-3; i<=3; i++) {
    if (i === 0) continue;
    ctx.beginPath(); 
    ctx.moveTo(-size * 0.65, i * size * 0.25); 
    ctx.lineTo(size * 0.65, i * size * 0.25); 
    ctx.stroke();
  }

  // Peeling Label
  ctx.fillStyle = '#ef4444';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.rect(-size * 0.7, -size * 0.3, size * 1.0, size * 0.5);
  ctx.fill();
  
  // Rust spots
  ctx.fillStyle = '#78350f';
  ctx.globalAlpha = 0.4;
  for(let i=0; i<3; i++) {
    ctx.beginPath(); ctx.arc(size * 0.3, -size * 0.6 + i*size*0.4, size*0.1, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
};

export const drawPlasticBag = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  ctx.save();
  
  // Floating animation
  const driftX = Math.sin(time) * size * 0.2;
  const driftY = Math.cos(time * 0.7) * size * 0.1;
  ctx.translate(driftX, driftY);
  ctx.rotate(Math.sin(time * 0.3) * 0.2);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  // Main Bag Body (Amorphous)
  ctx.beginPath();
  ctx.moveTo(-size, -size);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = size * (1.0 + Math.sin(time + i) * 0.2);
    ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Highlights/Wrinkles
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 0.5);
  ctx.quadraticCurveTo(0, 0, size * 0.5, size * 0.5);
  ctx.stroke();

  ctx.restore();
};

export const drawBottle = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  size: number,
  color: string
) => {
  ctx.save();
  
  // Glass Gradient
  const glassGrad = ctx.createLinearGradient(-size, 0, size, 0);
  glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.3)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  glassGrad.addColorStop(1, 'rgba(186, 230, 253, 0.4)');

  // Bottle Body
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.moveTo(-size * 1.5, -size * 0.6);
  ctx.lineTo(size * 0.5, -size * 0.6);
  ctx.quadraticCurveTo(size * 0.8, -size * 0.6, size * 1.0, -size * 0.3); // Neck start
  ctx.lineTo(size * 1.5, -size * 0.3); // Neck
  ctx.lineTo(size * 1.5, size * 0.3);
  ctx.lineTo(size * 1.0, size * 0.3);
  ctx.quadraticCurveTo(size * 0.8, size * 0.6, size * 0.5, size * 0.6);
  ctx.lineTo(-size * 1.5, size * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Liquid inside (Murky water)
  ctx.fillStyle = 'rgba(101, 163, 191, 0.3)';
  ctx.fillRect(-size * 1.4, size * 0.1, size * 1.8, size * 0.4);

  // Cork
  ctx.fillStyle = '#78350f';
  ctx.fillRect(size * 1.5, -size * 0.35, size * 0.2, size * 0.7);

  ctx.restore();
};
