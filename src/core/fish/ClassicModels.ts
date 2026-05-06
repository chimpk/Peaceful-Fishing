
import { FishType } from '../types';

export const drawClassicFish = (
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
  bodyGrad.addColorStop(1, 'rgba(0,0,0,0.2)');

  // 1. Body Shape
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size, -size * 0.8, size * 0.4, -size * 0.8, size, 0);
  ctx.bezierCurveTo(size * 0.4, size * 0.8, -size, size * 0.8, -size, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 2. Highlights (Sheen)
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.3, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Scale Pattern (Subtle)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size, -size * 0.8, size * 0.4, -size * 0.8, size, 0);
  ctx.bezierCurveTo(size * 0.4, size * 0.8, -size, size * 0.8, -size, 0);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = -size; i < size; i += 6) {
    ctx.beginPath(); ctx.moveTo(i, -size); ctx.lineTo(i + 10, size); ctx.stroke();
  }
  ctx.restore();

  // 4. Fins (Semi-transparent)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;
  // Dorsal
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.1, -size * 1.0, size * 0.5, -size * 0.4);
  ctx.fill();
  // Pectoral
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 0.2);
  ctx.lineTo(-size * 0.1, size * 0.6);
  ctx.lineTo(size * 0.4, size * 0.3);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 5. Eye (Professional look)
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.7, -size * 0.2, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.arc(size * 0.75, -size * 0.2, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.77, -size * 0.23, 2, 0, Math.PI * 2); ctx.fill();

  // 6. Tail (Animated)
  const tailWag = Math.sin(frameCount * wagFreq - 0.5) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.bezierCurveTo(-size * 1.5, -size * 0.9, -size * 1.5, -size * 0.2, -size * 1.1, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 0.2, -size * 1.5, size * 0.9, -size * 0.8, 0);
  ctx.fillStyle = color;
  ctx.fill();
  // Tail Detail
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.moveTo(-size * 0.9, 0); ctx.lineTo(-size * 1.3, -size * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-size * 0.9, 0); ctx.lineTo(-size * 1.3, size * 0.4); ctx.stroke();
  ctx.restore();
};

export const drawCatfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const bodyGrad = ctx.createRadialGradient(size * 0.4, 0, 0, size * 0.4, 0, size * 1.5);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(1, '#020617');

  // Body
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.quadraticCurveTo(0, -size * 0.9, size, -size * 0.3);
  ctx.lineTo(size, size * 0.3);
  ctx.quadraticCurveTo(0, size * 0.9, -size, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Whiskers (Smoother)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  const whiskAnim = Math.sin(frameCount * 0.08);
  ctx.beginPath(); ctx.moveTo(size * 0.8, -size * 0.15); ctx.quadraticCurveTo(size * 1.6, -size * 0.6 + whiskAnim * 5, size * 1.3, -size); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 0.8, size * 0.15); ctx.quadraticCurveTo(size * 1.6, size * 0.6 - whiskAnim * 5, size * 1.3, size); ctx.stroke();

  // Skin spots
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.arc(-size * 0.4 + i * 10, (i % 2 === 0 ? 5 : -5), 4, 0, Math.PI * 2); ctx.fill();
  }

  // Eye
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(size * 0.7, -size * 0.4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.7, size * 0.4, 3, 0, Math.PI * 2); ctx.fill();

  // Long Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.quadraticCurveTo(-size * 1.8, -size * 0.5, -size * 2.2, 0);
  ctx.quadraticCurveTo(-size * 1.8, size * 0.5, -size * 0.9, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};
