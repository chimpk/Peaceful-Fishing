
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
  // 1. Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // 2. Beautiful Shark Gradient (Dark top, light belly)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.7, '#64748b');
  bodyGrad.addColorStop(1, 'white');

  // Draw Tail
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Upper tail
  ctx.quadraticCurveTo(-size * 0.5, -size * 1.2, -size * 1.2, -size * 1.5);
  ctx.quadraticCurveTo(-size * 0.6, -size * 0.5, -size * 0.4, 0);
  // Lower tail
  ctx.quadraticCurveTo(-size * 0.6, size * 0.5, -size * 1.0, size * 1.0);
  ctx.quadraticCurveTo(-size * 0.5, size * 0.8, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // 3. Torpedo Body
  ctx.beginPath();
  ctx.moveTo(size * 1.4, 0); // Snout
  ctx.bezierCurveTo(size * 1.0, -size * 1.1, -size * 0.5, -size * 1.0, -size * 1.4, 0); // Top
  ctx.bezierCurveTo(-size * 0.5, size * 0.8, size * 1.0, size * 0.6, size * 1.4, 0); // Bottom
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 4. White Belly Highlight
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(size * 1.2, size * 0.1);
  ctx.quadraticCurveTo(0, size * 0.7, -size * 1.0, size * 0.1);
  ctx.quadraticCurveTo(0, size * 0.4, size * 1.2, size * 0.1);
  ctx.fill();
  ctx.restore();

  // 5. Dorsal Fin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.85);
  ctx.quadraticCurveTo(-size * 0.3, -size * 1.8, -size * 0.8, -size * 1.8);
  ctx.quadraticCurveTo(-size * 0.6, -size * 1.0, -size * 0.5, -size * 0.8);
  ctx.fill();

  // 6. Pectoral Fin (Animates slightly)
  ctx.save();
  ctx.translate(size * 0.3, size * 0.3);
  ctx.rotate(-tailWag * 0.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.4, size * 1.2, -size * 0.8, size * 1.4);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.8, size * 0.2, 0);
  ctx.fill();
  ctx.restore();

  // 7. Gills
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const gx = size * 0.6 - i * (size * 0.15);
    ctx.beginPath();
    ctx.moveTo(gx, -size * 0.1);
    ctx.quadraticCurveTo(gx - size * 0.1, size * 0.1, gx + size * 0.05, size * 0.3);
    ctx.stroke();
  }

  // 8. Predator Eye
  const eyeX = size * 1.0;
  const eyeY = -size * 0.2;
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff3333'; // Angry red glow
  ctx.beginPath(); ctx.arc(eyeX + size * 0.03, eyeY, size * 0.04, 0, Math.PI * 2); ctx.fill();
  
  // Scary Mouth
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 1.2, size * 0.25);
  ctx.quadraticCurveTo(size * 0.9, size * 0.3, size * 0.7, size * 0.2);
  ctx.stroke();
  
  // Teeth
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(size * 1.0, size * 0.26);
  ctx.lineTo(size * 0.95, size * 0.35);
  ctx.lineTo(size * 0.9, size * 0.24);
  ctx.fill();
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
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#e2e8f0'); // Light belly

  // Tail
  ctx.save();
  ctx.translate(-size * 1.3, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.8, -size * 1.2, -size * 1.2, -size * 1.8); // Top lobe
  ctx.quadraticCurveTo(-size * 0.8, -size * 0.5, -size * 0.5, 0);
  ctx.quadraticCurveTo(-size * 0.8, size * 0.8, -size * 1.0, size * 1.0); // Bottom lobe
  ctx.quadraticCurveTo(-size * 0.5, size * 0.5, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // Torpedo Body
  ctx.beginPath();
  ctx.moveTo(size * 1.0, 0);
  ctx.bezierCurveTo(size * 0.8, -size * 1.0, -size * 0.5, -size * 0.8, -size * 1.4, 0);
  ctx.bezierCurveTo(-size * 0.5, size * 0.8, size * 0.8, size * 0.8, size * 1.0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Dorsal fin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.75);
  ctx.quadraticCurveTo(-size * 0.4, -size * 2.0, -size * 1.0, -size * 1.8);
  ctx.quadraticCurveTo(-size * 0.7, -size * 1.0, -size * 0.5, -size * 0.7);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Hammer Head (T-shape)
  const hammerGrad = ctx.createLinearGradient(size * 0.8, -size * 1.2, size * 0.8, size * 1.2);
  hammerGrad.addColorStop(0, '#0f172a');
  hammerGrad.addColorStop(0.5, color);
  hammerGrad.addColorStop(1, '#0f172a');
  
  ctx.fillStyle = hammerGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.9, 0, size * 0.4, size * 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Real Eyes at edges of the hammer
  ctx.fillStyle = '#fef08a'; // Yellowish predator eye
  ctx.beginPath(); ctx.ellipse(size * 0.9, -size * 1.3, size * 0.15, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.9, size * 1.3, size * 0.15, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.9, -size * 1.3, size * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.9, size * 1.3, size * 0.05, 0, Math.PI * 2); ctx.fill();
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
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  // Sleek Metallic Gradient
  const metallicGrad = ctx.createLinearGradient(0, -size * 1.2, 0, size * 1.2);
  metallicGrad.addColorStop(0, '#1e3a8a'); // Deep blue top
  metallicGrad.addColorStop(0.4, color);
  metallicGrad.addColorStop(0.7, '#94a3b8'); // Silver side
  metallicGrad.addColorStop(1, '#f8fafc'); // White belly

  // Tail (Fast crescent shape)
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.5, -size * 1.8, -size * 1.8, -size * 2.2);
  ctx.quadraticCurveTo(-size * 1.0, 0, -size * 1.8, size * 2.2);
  ctx.quadraticCurveTo(-size * 0.5, size * 1.8, 0, 0);
  ctx.fillStyle = metallicGrad;
  ctx.fill();
  ctx.restore();

  // Torpedo Body
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Snout base
  ctx.bezierCurveTo(size * 1.2, -size * 0.9, -size * 0.5, -size * 0.8, -size * 1.3, 0);
  ctx.bezierCurveTo(-size * 0.5, size * 0.8, size * 1.2, size * 0.7, size * 1.8, 0);
  ctx.fillStyle = metallicGrad;
  ctx.fill();

  // Tall Dorsal Fin (Sail-like)
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.7);
  ctx.quadraticCurveTo(-size * 0.2, -size * 2.5, -size * 0.8, -size * 2.2);
  ctx.quadraticCurveTo(-size * 0.5, -size * 1.0, -size * 0.2, -size * 0.7);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // The Sword (Long & Tapered)
  const swordGrad = ctx.createLinearGradient(size * 1.5, 0, size * 4.0, 0);
  swordGrad.addColorStop(0, '#94a3b8');
  swordGrad.addColorStop(1, 'rgba(248, 250, 252, 0)'); // Fades to tip
  ctx.strokeStyle = swordGrad;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(size * 1.5, -size * 0.1); ctx.lineTo(size * 4.0, -size * 0.1); ctx.stroke();

  // Professional Eye (Not googly!)
  const eyeX = size * 1.1;
  const eyeY = -size * 0.2;
  ctx.fillStyle = '#f8fafc'; // Sclera
  ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.15, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a'; // Pupil
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white'; // Catchlight
  ctx.beginPath(); ctx.arc(eyeX + size * 0.07, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2); ctx.fill();
};

