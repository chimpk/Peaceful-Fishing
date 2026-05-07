
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
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.6, color);
  bodyGrad.addColorStop(1, 'rgba(0,0,0,0.3)');

  // 1. Body Shape
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size, -size * 0.85, size * 0.5, -size * 0.85, size, 0);
  ctx.bezierCurveTo(size * 0.5, size * 0.85, -size, size * 0.85, -size, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 2. Highlights & Shimmer
  const shimmer = Math.sin(frameCount * 0.05) * (size * 0.2);
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(size * 0.2 + shimmer, -size * 0.35, size * 0.6, size * 0.12, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Lateral Line (Signature detail)
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.quadraticCurveTo(0, size * 0.1, size * 0.6, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Scale Pattern
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size, -size * 0.85, size * 0.5, -size * 0.85, size, 0);
  ctx.bezierCurveTo(size * 0.5, size * 0.85, -size, size * 0.85, -size, 0);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.8;
  for (let i = -size; i < size; i += 7) {
    ctx.beginPath(); ctx.moveTo(i, -size); ctx.lineTo(i + size * 0.5, size); ctx.stroke();
  }
  ctx.restore();

  // 5. Fins with Ribs
  const drawFinWithRibs = (drawFn: () => void) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    drawFn();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.clip();
    for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(-size, -size); ctx.lineTo(size, size); ctx.stroke();
    }
    ctx.restore();
  };

  // Dorsal
  drawFinWithRibs(() => {
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.5);
    ctx.quadraticCurveTo(size * 0.1, -size * 1.1, size * 0.6, -size * 0.3);
  });
  
  // Pectoral
  drawFinWithRibs(() => {
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size * 0.2);
    ctx.lineTo(-size * 0.1, size * 0.7);
    ctx.lineTo(size * 0.5, size * 0.35);
  });

  // 6. Eye (Advanced)
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.75, -size * 0.2, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.2, size * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.82, -size * 0.24, 2.5, 0, Math.PI * 2); ctx.fill();

  // 7. Tail (Animated + Detail)
  const tailWag = Math.sin(frameCount * wagFreq - 0.5) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.bezierCurveTo(-size * 1.6, -size * 1.0, -size * 1.6, -size * 0.2, -size * 1.2, 0);
  ctx.bezierCurveTo(-size * 1.6, size * 0.2, -size * 1.6, size * 1.0, -size * 0.8, 0);
  ctx.fillStyle = color;
  ctx.fill();
  // Tail ribs
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 0.5) {
    ctx.beginPath(); ctx.moveTo(-size * 0.9, 0); ctx.lineTo(-size * 1.5, size * 0.6 * i); ctx.stroke();
  }
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
  const bodyGrad = ctx.createRadialGradient(size * 0.4, 0, 0, size * 0.4, 0, size * 1.8);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#020617');

  // 1. Body
  ctx.beginPath();
  ctx.moveTo(-size * 1.1, 0);
  ctx.quadraticCurveTo(0, -size * 0.95, size, -size * 0.35);
  ctx.lineTo(size, size * 0.35);
  ctx.quadraticCurveTo(0, size * 0.95, -size * 1.1, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 2. Mottled Skin (Catfish detail)
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 12; i++) {
    const rx = (Math.sin(i * 123) * size);
    const ry = (Math.cos(i * 321) * size * 0.5);
    ctx.beginPath(); ctx.arc(rx, ry, size * 0.15, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // 3. Whiskers (Physics-like)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  const whiskAnim = Math.sin(frameCount * 0.07);
  // Main whiskers
  ctx.beginPath(); ctx.moveTo(size * 0.85, -size * 0.2); ctx.quadraticCurveTo(size * 1.8, -size * 0.7 + whiskAnim * 6, size * 1.4, -size * 1.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 0.85, size * 0.2); ctx.quadraticCurveTo(size * 1.8, size * 0.7 - whiskAnim * 6, size * 1.4, size * 1.1); ctx.stroke();
  // Secondary whiskers
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(size * 0.7, -size * 0.3); ctx.quadraticCurveTo(size * 1.2, -size * 0.6, size * 0.9, -size * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 0.7, size * 0.3); ctx.quadraticCurveTo(size * 1.2, size * 0.6, size * 0.9, size * 0.8); ctx.stroke();

  // 4. Eyes (Glowy)
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(size * 0.75, -size * 0.45, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.75, size * 0.45, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 5. Long Flowing Tail
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(-size * 1.0, 0);
  ctx.quadraticCurveTo(-size * 2.2, -size * 0.6, -size * 2.6, 0);
  ctx.quadraticCurveTo(-size * 2.2, size * 0.6, -size * 1.0, 0);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  // Ribbon details
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-size * 1.1, 0); ctx.lineTo(-size * 2.4, 0); ctx.stroke();
  ctx.restore();
};

