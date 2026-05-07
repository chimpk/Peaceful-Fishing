
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

  const flap = Math.sin(frameCount * 0.08) * 0.45;
  
  // 1. Wings (Diamond)
  ctx.save();
  ctx.scale(1, 1 + flap);
  ctx.beginPath();
  ctx.moveTo(size * 1.4, 0); 
  ctx.bezierCurveTo(size * 0.6, -size * 2.0, -size * 0.6, -size * 2.0, -size * 1.1, 0);
  ctx.bezierCurveTo(-size * 0.6, size * 2.0, size * 0.6, size * 2.0, size * 1.4, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Wing Edges (Detailed)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 2. Pattern (Spotted bioluminescence)
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  const pulse = (Math.sin(frameCount * 0.1) + 1) * 0.5;
  for(let i=0; i<10; i++) {
    const rx = -size * 0.5 + i * 10;
    const ry = Math.sin(i * 1.5) * 12;
    ctx.beginPath(); ctx.arc(rx, ry, 2.5 + pulse * 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // 3. Long Whip Tail
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.quadraticCurveTo(-size * 2.5, Math.sin(frameCount * 0.1) * 25, -size * 4, 0);
  ctx.stroke();
  // Barb at end
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-size * 3.8, 0); ctx.lineTo(-size * 4.2, -5); ctx.lineTo(-size * 4.2, 5); ctx.fill();
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
  const bodyGrad = ctx.createRadialGradient(size * 0.3, -size * 0.3, size * 0.2, 0, 0, size * 1.6);
  bodyGrad.addColorStop(0, '#f1f5f9');
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(1, '#0f172a');

  // Body (Circular but rough)
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.6, size * 1.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Texture (Pockmarks)
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for(let i=0; i<15; i++) {
    const tx = (Math.sin(i * 77) * size * 1.2);
    const ty = (Math.cos(i * 99) * size * 1.0);
    ctx.beginPath(); ctx.arc(tx, ty, size * 0.1, 0, Math.PI * 2); ctx.fill();
  }

  // Large Fins
  const finWag = Math.sin(frameCount * 0.05) * 0.4;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  // Dorsal
  ctx.save(); ctx.rotate(finWag);
  ctx.beginPath(); ctx.moveTo(0, -size * 0.9); ctx.quadraticCurveTo(-size * 0.6, -size * 3.0, size * 0.3, -size * 0.9); ctx.fill();
  ctx.restore();
  // Anal
  ctx.save(); ctx.rotate(-finWag);
  ctx.beginPath(); ctx.moveTo(0, size * 0.9); ctx.quadraticCurveTo(-size * 0.6, size * 3.0, size * 0.3, size * 0.9); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // Professional Eye
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.0, -size * 0.25, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.05, -size * 0.25, size * 0.12, 0, Math.PI * 2); ctx.fill();
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
  bodyGrad.addColorStop(0.5, '#fcd34d');
  bodyGrad.addColorStop(1, color);

  // Body Curve
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.6);
  ctx.quadraticCurveTo(size * 1.2, -size * 0.6, 0, size * 1.2);
  ctx.quadraticCurveTo(-size * 1.2, size * 2.2, -size * 0.4, size * 3.5);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = size * 0.9;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Head details
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(size * 0.45, -size * 1.8, size * 0.8, size * 0.3, 0.3, 0, Math.PI * 2); ctx.fill();
  // Spikes on back
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  for(let i=0; i<8; i++) {
    const sy = -size * 0.8 + i * 10;
    ctx.beginPath(); ctx.moveTo(-size * 0.4, sy); ctx.lineTo(-size * 0.8, sy - 5); ctx.stroke();
  }

  // Eye
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.35, -size * 1.9, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

export const drawDragon = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const segments = 12;
  const pulse = (Math.sin(frameCount * 0.1) + 1) * 0.5;
  
  // Floating Orbs/Bioluminescence
  ctx.save();
  ctx.shadowBlur = 15 + pulse * 10;
  ctx.shadowColor = color;
  
  for(let i=0; i<segments; i++) {
    const t = i / segments;
    const segX = -size * 2.5 + (i * size * 5 / segments);
    const segY = Math.sin(frameCount * 0.09 + i * 0.65) * 25;
    const segSize = size * (1.3 - t * 0.9);
    
    const segGrad = ctx.createRadialGradient(segX, segY, 0, segX, segY, segSize);
    segGrad.addColorStop(0, color);
    segGrad.addColorStop(0.7, color);
    segGrad.addColorStop(1, '#000000');

    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(segX, segY, segSize, segSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scale highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath(); ctx.arc(segX - 2, segY - 2, segSize * 0.3, 0, Math.PI * 2); ctx.fill();

    // Long glowing whiskers/tendrils
    if (i % 3 === 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(segX, segY);
        ctx.quadraticCurveTo(segX - 10, segY + 40, segX - 30, segY + 20);
        ctx.stroke();
    }
  }

  // Dragon Head (More majestic)
  const headX = size * 2.6;
  const headY = Math.sin(frameCount * 0.09 + segments * 0.65) * 25;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(headX, headY, size * 1.2, 0, Math.PI * 2); ctx.fill();
  
  // Horns
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(headX, headY - size * 0.8); ctx.quadraticCurveTo(headX - 10, headY - size * 2, headX + 15, headY - size * 2.5); ctx.stroke();
  
  // Glowing Eyes
  ctx.shadowBlur = 25;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(headX + size * 0.6, headY - size * 0.4, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

export const drawKraken = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  // Mantle (Bulbous & Pulsing)
  const pulse = Math.sin(frameCount * 0.04);
  const mantleGrad = ctx.createRadialGradient(size * 0.7, 0, 0, size * 0.7, 0, size * 1.2);
  mantleGrad.addColorStop(0, color);
  mantleGrad.addColorStop(0.8, color);
  mantleGrad.addColorStop(1, '#020617');
  
  ctx.save();
  ctx.translate(size * 0.6, 0);
  ctx.rotate(pulse * 0.05);
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.1, size * (0.9 + pulse * 0.05), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bioluminescent Spots
  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  for(let i=0; i<6; i++) {
    const sx = size * (0.3 + i * 0.2);
    const sy = Math.sin(i + frameCount * 0.05) * 10;
    ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
  }

  // Giant Intelligent Eyes
  const eyePulse = (Math.sin(frameCount * 0.06) + 1) / 2;
  ctx.save();
  ctx.shadowBlur = 15 + eyePulse * 20;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.arc(size * 0.4, -size * 0.4, size * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.4, size * 0.4, size * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.45, -size * 0.4, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.45, size * 0.4, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Complex Tentacles (Sinuous movement)
  for(let i=0; i<10; i++) {
    const angle = (i - 4.5) * 0.3;
    const tentWag = Math.sin(frameCount * 0.08 + i * 0.8) * 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * (0.3 - i * 0.01);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(size * 0.2, angle * 10);
    ctx.bezierCurveTo(-size * 1.5, angle * size + tentWag, -size * 2.5, -tentWag, -size * 4.5, angle * size * 2.2);
    ctx.stroke();
    // Suction Cups (Tiny beads)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for(let j=0; j<4; j++) {
        ctx.beginPath(); ctx.arc(-size * (1 + j), angle * size * 0.5 + tentWag * 0.3, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
};

export const drawOrca = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  ctx.save();
  ctx.rotate(wag);
  
  // 1. Back (Sleek Black)
  const backGrad = ctx.createLinearGradient(0, -size, 0, size);
  backGrad.addColorStop(0, '#0f172a');
  backGrad.addColorStop(1, '#020617');
  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2.8, size * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. Belly (Crisp White)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(size * 0.3, size * 0.45, size * 2.0, size * 0.6, 0, 0, Math.PI);
  ctx.fill();
  
  // 3. Eye Patch & Details
  ctx.beginPath();
  ctx.ellipse(size * 1.6, -size * 0.4, size * 0.5, size * 0.2, -0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // 4. Large Dorsal Fin
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.6);
  ctx.quadraticCurveTo(-size * 0.5, -size * 2.6, -size * 1.1, -size * 0.6);
  ctx.fill();
  
  // 5. Powerful Pec Fin
  ctx.beginPath();
  ctx.ellipse(size * 0.6, size * 0.3, size * 0.8, size * 0.4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

export const drawLionfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  ctx.save();
  ctx.rotate(wag);
  
  // Intricate Stripes
  const bodyGrad = ctx.createLinearGradient(-size * 1.5, 0, size * 1.5, 0);
  for(let i=0; i<=1; i+=0.1) {
    bodyGrad.addColorStop(i, i % 0.2 < 0.1 ? color : '#ffffff');
  }
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.6, size * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Poisonous Spines (Radiating)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 18; i++) {
    const angle = (i / 17) * Math.PI * 2;
    const len = size * (1.3 + Math.sin(frameCount * 0.12 + i) * 0.4);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size * 0.9, Math.sin(angle) * size * 0.7);
    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
    ctx.stroke();
    // Glowing tips
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath(); ctx.arc(Math.cos(angle) * len, Math.sin(angle) * len, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  
  ctx.restore();
};

export const drawFlyingFish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  const wingFlap = Math.sin(frameCount * 0.25);
  
  ctx.save();
  ctx.rotate(wag);
  
  // Body (Sleek & Blue)
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#60a5fa');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2.0, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Translucent Wings
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(219, 234, 254, 0.6)';
  ctx.scale(1, wingFlap);
  // Large pectoral "wings"
  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.quadraticCurveTo(0, -size * 3.5, -size * 1.5, -size * 0.8);
  ctx.fill();
  ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  
  ctx.restore();
};

export const drawPufferFish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  isStruggling: boolean
) => {
  const puff = isStruggling ? 1.9 : (1.0 + Math.sin(frameCount * 0.06) * 0.12);
  
  ctx.save();
  ctx.scale(puff, puff);
  
  // Gradient body
  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  bodyGrad.addColorStop(0, '#fef3c7');
  bodyGrad.addColorStop(0.6, color);
  bodyGrad.addColorStop(1, '#92400e');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Sharp Spikes
  if (isStruggling) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const len = 7 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.lineTo(Math.cos(angle) * (size + len), Math.sin(angle) * (size + len));
      ctx.stroke();
    }
  }
  
  // Face (Large cute eyes)
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.65, -size * 0.25, size * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.75, -size * 0.25, size * 0.15, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
};

