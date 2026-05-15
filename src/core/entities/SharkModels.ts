import { FishType } from '../../types';
import { lerpColor } from '../graphics/Utils';

export const drawShark = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  const time = frameCount * 0.05;
  
  ctx.save();
  
  // 1. APEX PREDATOR SHADING (Metallic & Muscular)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#0f172a'); // Dark dorsal (top)
  bodyGrad.addColorStop(0.35, color);
  bodyGrad.addColorStop(0.65, color);
  bodyGrad.addColorStop(1, '#f1f5f9'); // Counter-shaded belly (white)

  // 2. PECTORAL FINS (Powerful & Detailed)
  const drawSharkFin = (side: number) => {
    ctx.save();
    ctx.translate(size * 0.5, side * size * 0.4);
    ctx.rotate(side * (0.5 + Math.sin(time * 0.8) * 0.08));
    
    // Fin shape
    const finGrad = ctx.createLinearGradient(0, 0, 0, side * size * 1.5);
    finGrad.addColorStop(0, color);
    finGrad.addColorStop(1, '#0f172a');
    
    ctx.fillStyle = finGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.4, side * size * 1.8, -size * 1.5, side * size * 1.5, -size * 0.6, 0);
    ctx.fill();
    
    // Fin structural lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-size * 1.0, side * size * 1.0); ctx.stroke();
    ctx.restore();
  };
  drawSharkFin(-1);
  drawSharkFin(1);

  // 3. HETEROCERCAL TAIL (Iconic Shark Tail)
  ctx.save();
  ctx.translate(-size * 1.5, 0);
  ctx.rotate(tailWag * 1.1);
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Large upper lobe
  ctx.bezierCurveTo(-size * 1.0, -size * 2.5, -size * 2.5, -size * 2.8, -size * 2.0, -size * 0.5);
  ctx.quadraticCurveTo(-size * 0.8, -size * 0.2, -size * 0.5, 0);
  // Smaller lower lobe
  ctx.bezierCurveTo(-size * 1.2, size * 1.5, -size * 1.8, size * 1.8, -size * 1.5, size * 0.4);
  ctx.quadraticCurveTo(-size * 0.6, size * 0.2, 0, 0);
  ctx.fill();
  
  // Tail structural details
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-size * 0.3, 0); ctx.lineTo(-size * 1.5, -size * 1.2); ctx.stroke();
  ctx.restore();

  // 4. POWERFUL MUSCULAR BODY
  ctx.beginPath();
  ctx.moveTo(size * 2.8, 0); // Snout
  ctx.bezierCurveTo(size * 1.8, -size * 1.5, -size * 1.2, -size * 1.3, -size * 1.8, 0);
  ctx.bezierCurveTo(-size * 1.2, size * 1.3, size * 1.8, size * 1.5, size * 2.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 5. ICONIC DORSAL FIN
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 1.0);
  ctx.bezierCurveTo(0, -size * 2.8, -size * 1.5, -size * 2.5, -size * 1.0, -size * 1.0);
  ctx.fill();

  // 6. HEAD & GILLS (Gills are crucial for sharks)
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const gx = size * 1.2 - i * size * 0.22;
    ctx.beginPath();
    ctx.moveTo(gx, -size * 0.3);
    ctx.quadraticCurveTo(gx - size * 0.15, 0, gx, size * 0.3);
    ctx.stroke();
  }

  // Intense Predator Eye
  const eyeX = size * 2.1, eyeY = -size * 0.3;
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.16, 0, Math.PI * 2); ctx.fill();
  // Predator glint
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.06, eyeY - size * 0.04, size * 0.05, 0, Math.PI * 2); ctx.fill();

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
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#f1f5f9');

  // Tail
  ctx.save();
  ctx.translate(-size * 1.3, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 2.2, -size * 2.0, -size * 2.5, -size * 1.8, -size * 0.8);
  ctx.quadraticCurveTo(-size * 0.8, -size * 0.2, -size * 0.5, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 1.2, -size * 1.5, size * 1.5, -size * 1.2, size * 0.3);
  ctx.fill();
  ctx.restore();

  // Torpedo Body
  ctx.beginPath();
  ctx.moveTo(size * 1.0, 0);
  ctx.bezierCurveTo(size * 0.8, -size * 1.1, -size * 0.8, -size * 0.9, -size * 1.5, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 0.9, size * 0.8, size * 1.1, size * 1.0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Cephalofoil (The Hammer)
  ctx.save();
  ctx.translate(size * 1.0, 0);
  const hammerGrad = ctx.createLinearGradient(0, -size * 1.3, 0, size * 1.3);
  hammerGrad.addColorStop(0, '#0f172a');
  hammerGrad.addColorStop(0.5, color);
  hammerGrad.addColorStop(1, '#0f172a');
  
  ctx.fillStyle = hammerGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, 0);
  ctx.bezierCurveTo(size * 0.4, -size * 1.2, -size * 0.1, -size * 1.3, -size * 0.3, -size * 1.2);
  ctx.lineTo(-size * 0.3, size * 1.2);
  ctx.bezierCurveTo(-size * 0.1, size * 1.3, size * 0.4, size * 1.2, size * 0.3, 0);
  ctx.fill();
  
  const drawEye = (side: number) => {
    ctx.save();
    ctx.translate(0, side * size * 1.1);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.18, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(size * 0.05, 0, size * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  drawEye(-1); drawEye(1);
  ctx.restore();

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
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  
  const metallicGrad = ctx.createLinearGradient(0, -size * 1.2, 0, size * 1.2);
  metallicGrad.addColorStop(0, '#001e3c');
  metallicGrad.addColorStop(0.2, '#1e3a8a');
  metallicGrad.addColorStop(0.5, color);
  metallicGrad.addColorStop(0.7, '#94a3b8');
  metallicGrad.addColorStop(1, '#ffffff');

  // Tail
  ctx.save();
  ctx.translate(-size * 1.4, 0);
  ctx.rotate(tailWag * 1.6);
  ctx.fillStyle = metallicGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.8, -size * 2.2, -size * 2.2, -size * 2.5, -size * 2.0, -size * 0.2);
  ctx.bezierCurveTo(-size * 2.2, size * 2.5, -size * 0.8, size * 2.2, 0, 0);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.beginPath();
  ctx.moveTo(size * 2.0, 0);
  ctx.bezierCurveTo(size * 1.4, -size * 1.0, -size * 0.8, -size * 0.9, -size * 1.6, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 0.9, size * 1.4, size * 1.0, size * 2.0, 0);
  ctx.fillStyle = metallicGrad;
  ctx.fill();

  // Rostrum
  const swordGrad = ctx.createLinearGradient(size * 1.8, 0, size * 4.5, 0);
  swordGrad.addColorStop(0, '#475569');
  swordGrad.addColorStop(0.5, '#94a3b8');
  swordGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = swordGrad;
  ctx.lineWidth = size * 0.18;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(size * 1.8, 0); ctx.lineTo(size * 4.5, 0); ctx.stroke();

  // Eye
  const eyeX = size * 1.2, eyeY = -size * 0.25;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.18, size * 0.12, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.08, eyeY - size * 0.04, size * 0.03, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};
