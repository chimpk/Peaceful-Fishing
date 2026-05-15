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
  
  ctx.save();
  // SPEC: Facing LEFT. We flip to match spec direction.
  ctx.scale(-1, 1);

  // 1. ASYMMETRIC LENS BODY (380x130px ratio -> 19x6.5 unit ratio)
  // Widest point at 40% from left tip.
  const bodyW = size * 9.5;
  const bodyH = size * 3.25;
  const peakX = -size * 1.9; // 40% from left (-9.5 to +9.5 range, left is -9.5)

  // Top Color: Olive Green #6b7a3a
  ctx.fillStyle = '#6b7a3a';
  ctx.beginPath();
  ctx.moveTo(-bodyW, 0); // Snout
  ctx.quadraticCurveTo(peakX, -bodyH, bodyW, 0); // Top curve
  ctx.lineTo(-bodyW, 0);
  ctx.fill();

  // Bottom Color: Silver-White #dde8cc
  ctx.fillStyle = '#dde8cc';
  ctx.beginPath();
  ctx.moveTo(-bodyW, 0); // Snout
  ctx.quadraticCurveTo(peakX, bodyH, bodyW, 0); // Bottom curve
  ctx.lineTo(-bodyW, 0);
  ctx.fill();

  // 2. FINS (Flat Black #1a1e14 - Hard edged triangles)
  const finColor = '#1a1e14';
  ctx.fillStyle = finColor;

  // Dorsal Fin (90px height ~ size * 4.5)
  ctx.beginPath();
  ctx.moveTo(peakX - size * 2.0, -size * 1.0);
  ctx.lineTo(peakX, -size * 5.5); 
  ctx.lineTo(peakX + size * 2.0, -size * 1.0);
  ctx.fill();

  // Pectoral Fin (Mirror of dorsal)
  ctx.beginPath();
  ctx.moveTo(peakX - size * 2.0, size * 1.0);
  ctx.lineTo(peakX, size * 5.5); 
  ctx.lineTo(peakX + size * 2.0, size * 1.0);
  ctx.fill();

  // 3. TAIL (Two black triangles at RIGHT end)
  ctx.save();
  ctx.translate(bodyW, 0);
  ctx.rotate(tailWag * 0.6);
  ctx.fillStyle = finColor;
  // Upper triangle
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 4.5, -size * 4.5);
  ctx.lineTo(size * 1.2, -size * 0.5);
  ctx.fill();
  // Lower triangle
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 3.8, size * 3.8);
  ctx.lineTo(size * 1.0, size * 0.4);
  ctx.fill();
  ctx.restore();

  // 4. MOUTH & 8 JAGGED TEETH (Bottom-left)
  ctx.fillStyle = '#ffffff';
  const mouthStart = -bodyW * 0.75;
  for (let i = 0; i < 8; i++) {
    const tx = mouthStart + i * size * 0.45;
    const ty = size * 0.7 + i * 0.05;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + size * 0.25, ty + size * 0.8); // ~12px tall
    ctx.lineTo(tx + size * 0.5, ty);
    ctx.fill();
  }

  // 5. BOLD EYE (Red circle on the LEFT side)
  const eyeX = -bodyW * 0.75, eyeY = -size * 0.8;
  // Red base (radius 14px -> size * 0.7)
  ctx.fillStyle = '#cc1a1a';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.7, 0, Math.PI * 2); ctx.fill();
  // Pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.35, 0, Math.PI * 2); ctx.fill();
  // Highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(eyeX - size * 0.15, eyeY - size * 0.15, size * 0.1, 0, Math.PI * 2); ctx.fill();

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
  const time = frameCount * 0.05;
  
  ctx.save();
  
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, lerpColor(color, '#000', 0.4));
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#f1f5f9');

  // 1. REFINED HETEROCERCAL TAIL
  ctx.save();
  ctx.translate(-size * 1.8, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Upper lobe
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 0.5, -size * 2.5, -size * 3.5, -size * 3.0, -size * 1.5);
  ctx.bezierCurveTo(-size * 3.2, -size * 0.8, -size * 1.2, -size * 0.4, -size * 0.4, 0);
  // Lower lobe
  ctx.bezierCurveTo(-size * 1.2, size * 0.4, -size * 2.0, size * 1.8, -size * 1.5, size * 0.8);
  ctx.quadraticCurveTo(-size * 0.6, size * 0.2, 0, 0);
  ctx.fill();
  ctx.restore();

  // 2. MAIN TORPEDO BODY
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.bezierCurveTo(size * 1.0, -size * 1.4, -size * 1.0, -size * 1.2, -size * 2.2, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 1.2, size * 1.0, size * 1.4, size * 1.5, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 3. ORGANIC CEPHALOFOIL (Đầu búa đặc thù)
  ctx.save();
  ctx.translate(size * 1.5, 0);
  ctx.fillStyle = bodyGrad;
  
  // Cephalofoil shape
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  ctx.bezierCurveTo(size * 0.2, -size * 1.8, -size * 0.8, -size * 2.2, -size * 0.4, -size * 1.8); // Top wing
  ctx.lineTo(-size * 0.8, -size * 1.8);
  ctx.bezierCurveTo(-size * 1.2, -size * 1.8, -size * 1.0, -size * 0.4, -size * 0.8, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 0.4, -size * 1.2, size * 1.8, -size * 0.8, size * 1.8);
  ctx.lineTo(-size * 0.4, size * 1.8);
  ctx.bezierCurveTo(-size * 0.8, size * 2.2, size * 0.2, size * 1.8, 0, size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Hammer Detailing (Gờ nổi trên đầu)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 1.5);
  ctx.lineTo(-size * 0.2, size * 1.5);
  ctx.stroke();
  
  // Eyes on the extreme ends of the cephalofoil
  const eyeX = -size * 0.6;
  const drawEye = (side: number) => {
    const eyeY = side * size * 1.8;
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();
  };
  drawEye(-1);
  drawEye(1);
  ctx.restore();

  // 4. DORSAL FIN (Vây lưng cao đặc trưng)
  ctx.save();
  ctx.translate(-size * 0.2, -size * 1.0);
  ctx.fillStyle = lerpColor(color, '#000', 0.2);
  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.bezierCurveTo(0, -size * 2.8, -size * 1.5, -size * 2.5, -size * 1.0, 0);
  ctx.fill();
  ctx.restore();

  // 5. PECTORAL FINS
  const drawFin = (side: number) => {
    ctx.save();
    ctx.translate(size * 0.4, side * size * 0.6);
    ctx.rotate(side * (0.7 + Math.sin(time * 0.6) * 0.08));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.8, side * size * 2.5, -size * 2.0, side * size * 2.2, -size * 1.2, 0);
    ctx.fill();
    ctx.restore();
  };
  drawFin(-1);
  drawFin(1);

  // 6. GILL SLITS
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const gx = size * 0.8 - i * size * 0.3;
    ctx.beginPath(); 
    ctx.moveTo(gx, -size * 0.5); 
    ctx.quadraticCurveTo(gx - size * 0.15, 0, gx, size * 0.5); 
    ctx.stroke();
  }
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
  const time = frameCount * 0.05;
  
  ctx.save();
  
  // 1. METALLIC AERODYNAMIC SHADING
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#1e1b4b'); // Deep indigo top
  bodyGrad.addColorStop(0.4, color);   // Main body color
  bodyGrad.addColorStop(0.7, '#94a3b8'); // Silver/Blue side
  bodyGrad.addColorStop(1, '#f1f5f9');   // White belly
  
  // 2. TAIL (Mạnh mẽ hình trăng lưỡi liềm)
  ctx.save();
  ctx.translate(-size * 2.5, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 2.5, -size * 1.5, -size * 2.5, -size * 0.8, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 2.5, -size * 1.0, size * 2.5, 0, 0);
  ctx.fill();
  ctx.restore();

  // 3. ULTRA-SLEEK BODY
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.bezierCurveTo(size * 0.5, -size * 0.8, -size * 1.5, -size * 0.8, -size * 2.8, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 0.8, size * 0.5, size * 0.8, size * 1.5, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 4. ICONIC SWORD (Mũi kiếm sắc nhọn)
  const swordGrad = ctx.createLinearGradient(size * 1.5, 0, size * 5.0, 0);
  swordGrad.addColorStop(0, color);
  swordGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = swordGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.5, -size * 0.15);
  ctx.lineTo(size * 5.5, 0);
  ctx.lineTo(size * 1.5, size * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Sword texture
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(size * 1.5, 0); ctx.lineTo(size * 4.5, 0); ctx.stroke();

  // 5. LARGE SAIL-LIKE DORSAL FIN
  ctx.save();
  ctx.translate(-size * 0.5, -size * 0.6);
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, 0);
  ctx.bezierCurveTo(-size * 0.5, -size * 2.5, -size * 2.5, -size * 2.0, -size * 1.2, 0);
  ctx.fill();
  ctx.restore();

  // 6. PECTORAL FINS (Long and narrow)
  const drawFin = (side: number) => {
    ctx.save();
    ctx.translate(size * 0.5, side * size * 0.4);
    ctx.rotate(side * (1.1 + Math.sin(time) * 0.1));
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, side * size * 2.5, -size * 1.0, side * size * 2.2, -size * 0.2, 0);
    ctx.fill();
    ctx.restore();
  };
  drawFin(-1);
  drawFin(1);

  // 7. BIG JET-BLACK EYE
  const eyeX = size * 1.0, eyeY = -size * 0.2;
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.08, eyeY - size * 0.08, size * 0.05, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};
