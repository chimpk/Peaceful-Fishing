
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
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.6, color);
  bodyGrad.addColorStop(1, '#020617');

  const flap = Math.sin(frameCount * 0.08) * 0.45;
  
  // 1. Wings (Diamond, smooth organic curves)
  ctx.save();
  ctx.scale(1, 1 + flap);
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0); // snout
  ctx.bezierCurveTo(size * 0.6, -size * 2.5, -size * 0.8, -size * 2.2, -size * 1.2, 0); // top wing
  ctx.bezierCurveTo(-size * 0.8, size * 2.2, size * 0.6, size * 2.5, size * 1.5, 0); // bottom wing
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Wing Edges & Veins
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.quadraticCurveTo(0, -size * i * 0.6, -size * 0.5, -size * i * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.quadraticCurveTo(0, size * i * 0.6, -size * 0.5, size * i * 0.6);
    ctx.stroke();
  }
  ctx.restore();

  ctx.shadowBlur = 0; // Turn off shadow for details

  // 2. Bioluminescent Spots
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  const pulse = (Math.sin(frameCount * 0.1) + 1) * 0.5;
  for(let i=0; i<12; i++) {
    const rx = -size * 0.2 + i * size * 0.1;
    const ry = Math.sin(i * 1.5) * size * 1.2;
    ctx.shadowBlur = 10 * pulse;
    ctx.shadowColor = 'white';
    ctx.beginPath(); ctx.arc(rx, ry, 2 + pulse * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 3. Eyes (Alien-like)
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.ellipse(size * 0.8, -size * 0.3, size * 0.15, size * 0.08, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.8, size * 0.3, size * 0.15, size * 0.08, 0.2, 0, Math.PI * 2); ctx.fill();

  // 4. Long Whip Tail with Physics
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const tailAnim = Math.sin(frameCount * 0.1);
  ctx.beginPath();
  ctx.moveTo(-size * 1.1, 0);
  ctx.bezierCurveTo(-size * 2.0, tailAnim * size * 1.5, -size * 3.0, -tailAnim * size * 1.5, -size * 4.5, 0);
  ctx.stroke();
  
  // Barb at end
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.moveTo(-size * 4.3, 0); ctx.lineTo(-size * 4.7, -4); ctx.lineTo(-size * 4.7, 4); ctx.fill();
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
  const segments = 15;
  const pulse = (Math.sin(frameCount * 0.1) + 1) * 0.5;
  
  // Shadow for floating effect
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  for(let i=0; i<segments; i++) {
    const t = i / segments;
    const segX = -size * 3.5 + (i * size * 6 / segments);
    const segY = Math.sin(frameCount * 0.08 + i * 0.5) * size * 1.5;
    const segSize = size * (1.2 - t * 0.8);
    
    // Intricate Scales Gradient
    const segGrad = ctx.createRadialGradient(segX, segY, 0, segX, segY, segSize);
    segGrad.addColorStop(0, '#fbbf24'); // Gold center
    segGrad.addColorStop(0.4, color);
    segGrad.addColorStop(1, '#450a0a'); // Dark edge

    ctx.fillStyle = segGrad;
    ctx.beginPath();
    // Diamond-shaped scales for the dragon body
    ctx.moveTo(segX + segSize, segY);
    ctx.lineTo(segX, segY + segSize);
    ctx.lineTo(segX - segSize, segY);
    ctx.lineTo(segX, segY - segSize);
    ctx.fill();

    // Dragon Fins/Spikes along the back
    if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'; // Gold spikes
        ctx.beginPath();
        ctx.moveTo(segX, segY - segSize);
        ctx.lineTo(segX - segSize * 0.5, segY - segSize * 2.5);
        ctx.lineTo(segX - segSize * 1.0, segY - segSize * 0.5);
        ctx.fill();
    }
  }

  // Turn off shadow for glowing bits
  ctx.shadowColor = 'transparent';

  // Majestic Dragon Head
  const headX = size * 3.0;
  const headY = Math.sin(frameCount * 0.08 + segments * 0.5) * size * 1.5;
  
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 1.5);
  headGrad.addColorStop(0, color);
  headGrad.addColorStop(1, '#7f1d1d');
  
  ctx.fillStyle = headGrad;
  ctx.beginPath(); 
  ctx.moveTo(headX + size * 1.5, headY); // Snout
  ctx.quadraticCurveTo(headX, headY - size * 1.5, headX - size * 1.5, headY - size * 0.5);
  ctx.lineTo(headX - size * 1.5, headY + size * 0.5);
  ctx.quadraticCurveTo(headX, headY + size * 1.5, headX + size * 1.5, headY);
  ctx.fill();
  
  // Antlers/Horns (Branched and regal)
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = size * 0.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.5, headY - size * 1.0);
  ctx.quadraticCurveTo(headX - size * 1.0, headY - size * 3.0, headX - size * 2.5, headY - size * 3.5);
  ctx.moveTo(headX - size * 1.5, headY - size * 2.5);
  ctx.lineTo(headX - size * 1.0, headY - size * 3.2);
  ctx.stroke();
  
  // Flowing Whiskers (Mustache)
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(headX + size * 1.2, headY + size * 0.2);
  ctx.quadraticCurveTo(headX - size * 1.0, headY + size * 3.0, headX - size * 3.0, headY + size * 2.0);
  ctx.stroke();

  // Glowing Eyes
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(headX + size * 0.5, headY - size * 0.4, size * 0.3, size * 0.15, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.arc(headX + size * 0.5, headY - size * 0.4, size * 0.08, 0, Math.PI * 2); ctx.fill();
};

export const drawKraken = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  // Shadow for colossal size
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.8;
  ctx.shadowOffsetY = size * 0.4;

  // Mantle (Bulbous & Pulsing)
  const pulse = Math.sin(frameCount * 0.04);
  const mantleGrad = ctx.createRadialGradient(size * 0.7, 0, 0, size * 0.7, 0, size * 1.5);
  mantleGrad.addColorStop(0, color);
  mantleGrad.addColorStop(0.5, color);
  mantleGrad.addColorStop(1, '#020617');
  
  ctx.save();
  ctx.translate(size * 0.6, 0);
  ctx.rotate(pulse * 0.05);
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.3, size * (1.0 + pulse * 0.08), 0, 0, Math.PI * 2);
  ctx.fill();

  // Mantle Texture (Wrinkled/Leathery)
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  for(let i=0; i<5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.5 + i * size * 0.2);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.4 + i * size * 0.2, size * 0.8, -size * 0.6 + i * size * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  ctx.shadowColor = 'transparent';

  // Bioluminescent Spots
  ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
  for(let i=0; i<8; i++) {
    const sx = size * (0.3 + i * 0.25);
    const sy = Math.sin(i + frameCount * 0.05) * size * 0.4;
    ctx.shadowBlur = 10; ctx.shadowColor = '#fef08a';
    ctx.beginPath(); ctx.arc(sx, sy, 3 + Math.random()*2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Giant Intelligent Eyes (Horrifying)
  const eyePulse = (Math.sin(frameCount * 0.06) + 1) / 2;
  ctx.save();
  ctx.shadowBlur = 25 + eyePulse * 20;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.ellipse(size * 0.4, -size * 0.5, size * 0.35, size * 0.2, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.4, size * 0.5, size * 0.35, size * 0.2, 0.2, 0, Math.PI * 2); ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#450a0a'; // Blood red iris
  ctx.beginPath(); ctx.arc(size * 0.45, -size * 0.5, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.45, size * 0.5, size * 0.18, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = 'black'; // Slit pupil
  ctx.beginPath(); ctx.ellipse(size * 0.48, -size * 0.5, size * 0.05, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.48, size * 0.5, size * 0.05, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Complex Tentacles (Sinuous movement, thick and menacing)
  for(let i=0; i<12; i++) {
    const angle = (i - 5.5) * 0.25;
    const tentWag = Math.sin(frameCount * 0.08 + i * 0.8) * size * 0.8;
    
    // Tentacle Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = size * (0.35 - Math.abs(i - 5.5) * 0.02);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(size * 0.2, angle * size * 0.8);
    ctx.bezierCurveTo(-size * 1.5, angle * size * 2 + tentWag, -size * 3.5, -tentWag * 1.5, -size * 6.0, angle * size * 3);
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';

    // Suction Cups (Glowing rings)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.lineWidth = 2;
    for(let j=1; j<6; j++) {
        const tX = -size * (j * 0.8);
        const tY = angle * size * 1.2 + Math.sin(frameCount * 0.08 + i * 0.8) * (size * 0.8 * (j/6));
        ctx.beginPath(); ctx.arc(tX, tY + ctx.lineWidth * 2, size * 0.08, 0, Math.PI * 2); ctx.stroke();
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

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;
  
  // 1. Sleek Torpedo Body
  const backGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  backGrad.addColorStop(0, '#020617'); // Pitch black top
  backGrad.addColorStop(0.6, '#0f172a');
  backGrad.addColorStop(1, '#e2e8f0'); // White belly
  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.moveTo(size * 2.5, 0); // Snout
  ctx.bezierCurveTo(size * 1.0, -size * 1.8, -size * 1.5, -size * 1.2, -size * 3.0, 0); // Back
  ctx.bezierCurveTo(-size * 1.5, size * 1.5, size * 1.0, size * 1.0, size * 2.5, 0); // Belly
  ctx.fill();
  
  ctx.shadowColor = 'transparent';

  // 2. Crisp White Markings (Eye patch & Saddle)
  ctx.fillStyle = '#ffffff';
  // Eye patch
  ctx.beginPath();
  ctx.ellipse(size * 1.5, -size * 0.3, size * 0.6, size * 0.25, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Saddle patch behind dorsal
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.ellipse(-size * 1.2, -size * 0.6, size * 0.8, size * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  
  // Eye (Small & intelligent)
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.8, -size * 0.1, size * 0.08, 0, Math.PI * 2); ctx.fill();
  
  // 3. Huge Dorsal Fin
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.9);
  ctx.quadraticCurveTo(-size * 0.2, -size * 2.8, -size * 1.0, -size * 2.8);
  ctx.quadraticCurveTo(-size * 0.8, -size * 1.5, -size * 1.2, -size * 0.8);
  ctx.fill();
  
  // 4. Paddle-like Pectoral Fins
  const pecWag = Math.sin(frameCount * 0.1) * 0.2;
  ctx.save();
  ctx.translate(size * 0.8, size * 0.5);
  ctx.rotate(pecWag);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.5, size * 1.5, -size * 1.0, size * 1.8);
  ctx.quadraticCurveTo(size * 0.5, size * 1.5, size * 0.4, 0);
  ctx.fill();
  ctx.restore();
  
  // 5. Powerful Fluke (Tail)
  ctx.translate(-size * 3.0, 0);
  const tailFlap = Math.sin(frameCount * wagFreq * 2) * 0.2;
  ctx.rotate(tailFlap);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.5, -size * 1.8, -size * 1.5, -size * 2.0);
  ctx.quadraticCurveTo(-size * 1.0, 0, -size * 1.5, size * 2.0);
  ctx.quadraticCurveTo(-size * 0.5, size * 1.8, 0, 0);
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

export const drawAnglerFish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  // Bulbous body
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Scary Teeth
  ctx.fillStyle = 'white';
  for(let i=0; i<4; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 1.0 + i * size * 0.15, size * 0.3);
    ctx.lineTo(size * 1.1 + i * size * 0.1, size * 0.1);
    ctx.lineTo(size * 1.2 + i * size * 0.15, size * 0.3);
    ctx.fill();
  }

  // Antenna & Glowing Lure
  const bob = Math.sin(frameCount * 0.05) * size * 0.5;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 1.0);
  ctx.quadraticCurveTo(size * 1.5, -size * 2.0, size * 2.0, -size * 0.5 + bob);
  ctx.stroke();

  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(size * 2.0, -size * 0.5 + bob, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.3, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f87171';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.3, size * 0.05, 0, Math.PI * 2); ctx.fill();
};

export const drawTadpole = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const wag = Math.sin(frameCount * 0.3) * 0.3;
  ctx.save();
  ctx.rotate(wag);
  
  // Big round head
  ctx.beginPath();
  ctx.arc(size * 0.5, 0, size * 1.2, 0, Math.PI * 2);
  const headGrad = ctx.createRadialGradient(size * 0.5, -size * 0.3, 0, size * 0.5, 0, size * 1.5);
  headGrad.addColorStop(0, '#86efac');
  headGrad.addColorStop(1, color);
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Long wiggly tail
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, 0);
  ctx.quadraticCurveTo(-size * 1.5, Math.sin(frameCount * 0.4) * size, -size * 2.5, 0);
  ctx.stroke();

  // Mutant Eyes
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.arc(size * 1.0, -size * 0.4, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.2, size * 0.2, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.8, size * 0.5, size * 0.2, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
};

export const drawBlindFish = (
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
  
  // 1. Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  // Ghostly translucent skin
  ctx.globalAlpha = 0.85;
  const bodyGrad = ctx.createLinearGradient(-size, -size, size, size);
  bodyGrad.addColorStop(0, '#ffffff'); // Pale white
  bodyGrad.addColorStop(0.4, color); // Pale grey/slate
  bodyGrad.addColorStop(1, '#fbcfe8'); // Pale pinkish underbelly

  // Draw Tail
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.8, -size * 0.8, -size * 1.2, -size * 0.4);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.8, 0);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 1.2, size * 0.4);
  ctx.quadraticCurveTo(-size * 0.8, size * 0.8, 0, 0);
  ctx.fillStyle = 'rgba(241, 245, 249, 0.7)'; // Translucent tail
  ctx.fill();
  
  // Tail ribs
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 1.0, -size * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 1.0, size * 0.3); ctx.stroke();
  ctx.restore();

  // Draw Body (Sleek and curved)
  ctx.beginPath();
  ctx.moveTo(size * 1.4, 0); // Snout
  ctx.bezierCurveTo(size * 1.0, -size * 0.9, -size * 0.4, -size * 0.8, -size * 1.2, 0); // Top curve
  ctx.bezierCurveTo(-size * 0.4, size * 0.9, size * 0.8, size * 1.0, size * 1.4, 0); // Bottom curve
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Remove shadow for internal details
  ctx.shadowColor = 'transparent';

  // Creepy exposed internal anatomy (Soft ribcage)
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.3)'; // Soft pink/red
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.8, 0);
  ctx.lineTo(-size * 0.8, 0); // Spine
  for(let i = 0; i < 6; i++) {
    const vx = size * 0.5 - i * size * 0.25;
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx - size * 0.1, -size * 0.5, vx - size * 0.3, -size * 0.6);
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx - size * 0.1, size * 0.5, vx - size * 0.3, size * 0.6);
  }
  ctx.stroke();

  // Bioluminescent lateral line
  ctx.strokeStyle = '#38bdf8'; // Glowing cyan
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size * 1.0, size * 0.1);
  ctx.quadraticCurveTo(0, size * 0.3, -size * 1.0, size * 0.1);
  ctx.stroke();

  // Sensory Barbels (Whiskers) since it has no eyes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'transparent';
  for(let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(size * 1.4, 0);
    const whiskerWag = Math.sin(frameCount * 0.08 + i) * size * 0.3;
    ctx.quadraticCurveTo(size * 1.8, i * size * 0.5 + whiskerWag, size * 2.2, i * size * 0.8 + whiskerWag);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 1.3, i * size * 0.2);
    ctx.quadraticCurveTo(size * 1.6, i * size * 0.8 + whiskerWag, size * 1.8, i * size * 1.2 + whiskerWag);
    ctx.stroke();
  }

  // Smooth blind socket (where eyes would be)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(size * 0.9, -size * 0.2, size * 0.2, size * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const drawOctopus = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const pulse = Math.sin(frameCount * 0.05);
  ctx.save();
  
  // Head/Mantle
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.5, size * 1.0, size * 0.8 + pulse * size * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Spots
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.8, size * 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.2, -size * 0.6, size * 0.15, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.5, -size * 1.0, size * 0.1, 0, Math.PI*2); ctx.fill();

  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.0, -size * 0.2, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.1, -size * 0.2, size * 0.08, 0, Math.PI * 2); ctx.fill();

  // Wiggling Tentacles
  ctx.lineWidth = size * 0.3;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i / 5) * Math.PI;
    const wag = Math.sin(frameCount * 0.1 + i) * size * 0.5;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.quadraticCurveTo(
      size * 0.5 + Math.cos(angle) * size * 1.5,
      Math.sin(angle) * size * 1.5 + wag,
      size * 0.5 + Math.cos(angle) * size * 2.5,
      Math.sin(angle) * size * 2.5
    );
    ctx.stroke();
  }
  
  ctx.restore();
};

export const drawBlindAlligator = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.2;

  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.translate(-size * 0.5, 0);
  ctx.rotate(wag * 0.5);

  // Armored Body
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#064e3b'); // Dark swamp green
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#022c22');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2.5, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bony Scutes (Armor plates)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for(let i=-2; i<=2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size * 0.6, -size * 0.7);
    ctx.lineTo(i * size * 0.6 + size * 0.2, -size * 0.9);
    ctx.lineTo(i * size * 0.6 + size * 0.4, -size * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(i * size * 0.6, size * 0.7);
    ctx.lineTo(i * size * 0.6 + size * 0.2, size * 0.9);
    ctx.lineTo(i * size * 0.6 + size * 0.4, size * 0.7);
    ctx.fill();
  }

  // Heavy Tail
  ctx.translate(-size * 2.5, 0);
  ctx.rotate(wag);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(-size * 2.0, 0);
  ctx.lineTo(0, size * 0.5);
  ctx.fill();
  ctx.restore();

  // Blind Head
  ctx.save();
  ctx.translate(size * 1.5, 0);
  ctx.rotate(wag * -0.2);
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.0, 0);
  ctx.quadraticCurveTo(size * 2.5, -size * 0.5, size * 3.0, -size * 0.2); // Snout
  ctx.lineTo(size * 3.0, size * 0.2);
  ctx.quadraticCurveTo(size * 2.5, size * 0.5, size * 1.0, 0);
  ctx.fill();
  
  // Teeth
  ctx.fillStyle = '#f8fafc';
  for(let i=0; i<5; i++) {
    ctx.beginPath(); ctx.moveTo(size * 1.5 + i * size * 0.3, -size * 0.3); ctx.lineTo(size * 1.6 + i * size * 0.3, -size * 0.45); ctx.lineTo(size * 1.7 + i * size * 0.3, -size * 0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(size * 1.5 + i * size * 0.3, size * 0.3); ctx.lineTo(size * 1.6 + i * size * 0.3, size * 0.45); ctx.lineTo(size * 1.7 + i * size * 0.3, size * 0.3); ctx.fill();
  }

  // Blind sockets (No eyes)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.ellipse(size * 1.2, -size * 0.4, size * 0.2, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 1.2, size * 0.4, size * 0.2, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

export const drawGiantCrab = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  // Carapace
  const shellGrad = ctx.createRadialGradient(0, -size * 0.5, 0, 0, 0, size * 2);
  shellGrad.addColorStop(0, '#ef4444');
  shellGrad.addColorStop(0.5, color);
  shellGrad.addColorStop(1, '#7f1d1d');

  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spikes on shell
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath(); ctx.moveTo(-size * 1.0, -size * 0.8); ctx.lineTo(-size * 1.2, -size * 1.5); ctx.lineTo(-size * 0.5, -size * 1.0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(size * 1.0, -size * 0.8); ctx.lineTo(size * 1.2, -size * 1.5); ctx.lineTo(size * 0.5, -size * 1.0); ctx.fill();

  // Legs (scuttling)
  ctx.strokeStyle = shellGrad;
  ctx.lineWidth = size * 0.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for(let i=0; i<3; i++) {
    const legWag = Math.sin(frameCount * 0.2 + i) * size * 0.3;
    // Top legs
    ctx.beginPath(); ctx.moveTo(-size * 0.5 + i * size * 0.5, -size * 1.0); ctx.lineTo(-size * 1.0 + i * size * 0.5, -size * 2.0 + legWag); ctx.lineTo(-size * 1.5 + i * size * 0.5, -size * 2.5 + legWag); ctx.stroke();
    // Bottom legs
    ctx.beginPath(); ctx.moveTo(-size * 0.5 + i * size * 0.5, size * 1.0); ctx.lineTo(-size * 1.0 + i * size * 0.5, size * 2.0 - legWag); ctx.lineTo(-size * 1.5 + i * size * 0.5, size * 2.5 - legWag); ctx.stroke();
  }

  // Giant Claws
  const clawPulse = Math.sin(frameCount * 0.1) * 0.2;
  ctx.save();
  ctx.translate(size * 1.5, -size * 0.8);
  ctx.rotate(-0.5 + clawPulse);
  ctx.beginPath(); ctx.ellipse(size * 0.8, 0, size * 0.8, size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  // Claw pincers
  ctx.fillStyle = '#f87171';
  ctx.beginPath(); ctx.moveTo(size * 1.5, -size * 0.2); ctx.lineTo(size * 2.5, -size * 0.5); ctx.lineTo(size * 1.5, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(size * 1.5, size * 0.2); ctx.lineTo(size * 2.5, size * 0.5); ctx.lineTo(size * 1.5, 0); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(size * 1.5, size * 0.8);
  ctx.rotate(0.5 - clawPulse);
  ctx.fillStyle = shellGrad;
  ctx.beginPath(); ctx.ellipse(size * 0.8, 0, size * 0.8, size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f87171';
  ctx.beginPath(); ctx.moveTo(size * 1.5, -size * 0.2); ctx.lineTo(size * 2.5, -size * 0.5); ctx.lineTo(size * 1.5, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(size * 1.5, size * 0.2); ctx.lineTo(size * 2.5, size * 0.5); ctx.lineTo(size * 1.5, 0); ctx.fill();
  ctx.restore();

  // Eyestalks
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath(); ctx.rect(size * 1.0, -size * 0.3, size * 0.4, size * 0.1); ctx.fill();
  ctx.beginPath(); ctx.rect(size * 1.0, size * 0.2, size * 0.4, size * 0.1); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.4, -size * 0.25, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.4, size * 0.25, size * 0.15, 0, Math.PI * 2); ctx.fill();
};
