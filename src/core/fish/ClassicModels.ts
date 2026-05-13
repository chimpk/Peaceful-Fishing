
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
  // 1. Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  // 2. Beautiful Body Gradient
  const bodyGrad = ctx.createLinearGradient(-size * 1.2, -size, size * 1.2, size);
  bodyGrad.addColorStop(0, 'white');
  bodyGrad.addColorStop(0.2, color);
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#020617');

  // Draw Tail first so it goes behind the body
  ctx.save();
  ctx.translate(-size * 0.8, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Upper tail lobe
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.8, -size * 0.9, -size * 0.6);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.3, 0);
  // Lower tail lobe
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.9, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.5, size * 0.8, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Tail details
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-size * 0.8, -size * 0.4);
  ctx.moveTo(0, 0); ctx.lineTo(-size * 0.8, size * 0.4);
  ctx.stroke();
  ctx.restore();

  // 3. Body Shape (Sleek and organic)
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0); // Nose
  ctx.bezierCurveTo(size * 0.8, -size * 0.9, -size * 0.4, -size * 0.8, -size * 0.9, 0); // Top curve
  ctx.bezierCurveTo(-size * 0.4, size * 0.8, size * 0.8, size * 0.9, size * 1.2, 0); // Bottom curve
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Reset shadow for details
  ctx.shadowColor = 'transparent';

  // 4. Shiny Highlight
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(size * 0.3, -size * 0.3, size * 0.5, size * 0.15, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Scales Pattern (Hexagonal/Diamond illusion)
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0);
  ctx.bezierCurveTo(size * 0.8, -size * 0.9, -size * 0.4, -size * 0.8, -size * 0.9, 0);
  ctx.bezierCurveTo(-size * 0.4, size * 0.8, size * 0.8, size * 0.9, size * 1.2, 0);
  ctx.clip();
  for (let i = -size; i < size; i += size * 0.2) {
    ctx.beginPath();
    ctx.moveTo(i, -size);
    ctx.lineTo(i + size * 0.3, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + size * 0.3, -size);
    ctx.lineTo(i, size);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Fins
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  
  // Dorsal Fin
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.65);
  ctx.quadraticCurveTo(size * 0.1, -size * 1.2, size * 0.4, -size * 0.55);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.7, -size * 0.2, -size * 0.65);
  ctx.fill();

  // Pectoral Fin (Animates with swim)
  ctx.save();
  ctx.translate(size * 0.4, size * 0.2);
  ctx.rotate(-tailWag);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.3, size * 0.4, -size * 0.5, size * 0.6);
  ctx.quadraticCurveTo(0, size * 0.4, size * 0.1, size * 0.1);
  ctx.fill();
  
  // Fin ribs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 0.4, size * 0.5); ctx.stroke();
  ctx.restore();

  // 7. Eye (More detailed)
  const eyeX = size * 0.85;
  const eyeY = -size * 0.15;
  
  // Outer gold rim
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2); ctx.fill();
  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  // Catch light
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();
  
  // Mouth
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(size * 1.15, size * 0.1);
  ctx.quadraticCurveTo(size * 1.0, size * 0.15, size * 0.9, size * 0.1);
  ctx.stroke();
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
  // Deep shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // Rich Gradient Body (Dark top, mud-colored belly)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#020617');
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(0.8, '#451a03'); // Muddy brown
  bodyGrad.addColorStop(1, '#0f172a');

  // Draw Flowing Tail
  ctx.save();
  ctx.translate(-size * 1.0, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.8, -size * 2.8, -size * 0.2);
  ctx.quadraticCurveTo(-size * 2.5, 0, -size * 2.8, size * 0.2);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.8, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  
  // Tail Ribbon Detail
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-size * 0.5, 0); ctx.lineTo(-size * 2.5, 0); ctx.stroke();
  ctx.restore();

  // Draw Thick Head & Body
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0);
  ctx.quadraticCurveTo(size * 1.0, -size * 1.0, 0, -size * 0.8);
  ctx.quadraticCurveTo(-size * 1.2, -size * 0.5, -size * 1.2, 0);
  ctx.quadraticCurveTo(-size * 1.2, size * 0.5, 0, size * 0.8);
  ctx.quadraticCurveTo(size * 1.0, size * 1.0, size * 1.2, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Mottled Catfish Skin Texture
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 20; i++) {
    const rx = (Math.sin(i * 123) * size * 0.8);
    const ry = (Math.cos(i * 321) * size * 0.6);
    ctx.beginPath(); ctx.ellipse(rx, ry, size * 0.2, size * 0.1, Math.sin(i), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Glowy Eyes (Deep sea/mud dweller)
  ctx.save();
  const eyeX = size * 0.8;
  const eyeY = -size * 0.3;
  ctx.shadowBlur = 12; 
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.15, size * 0.08, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.03, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Long Dynamic Whiskers
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const whiskAnim = Math.sin(frameCount * 0.1);
  
  // Upper whiskers
  ctx.beginPath();
  ctx.moveTo(size * 1.1, -size * 0.1);
  ctx.quadraticCurveTo(size * 1.8, -size * 0.8 + whiskAnim * size * 0.4, size * 1.5, -size * 1.4);
  ctx.stroke();
  
  // Lower whiskers
  ctx.beginPath();
  ctx.moveTo(size * 1.1, size * 0.1);
  ctx.quadraticCurveTo(size * 1.8, size * 0.8 - whiskAnim * size * 0.4, size * 1.5, size * 1.4);
  ctx.stroke();

  // Short chin whiskers
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(size * 0.9, size * 0.4); ctx.quadraticCurveTo(size * 1.2, size * 0.8, size * 0.8, size * 1.2); ctx.stroke();
};

