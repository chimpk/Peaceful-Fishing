
import { FishType } from '../../types';

export const drawAbyssalKraken = (
  ctx: CanvasRenderingContext2D,
  frameCount: number,
  hp: number,
  maxHp: number,
  isAttacking: boolean
) => {
  const time = frameCount * 0.05;
  const hpRatio = hp / maxHp;
  const size = 70;
  
  ctx.save();
  
  // 1. Layered Deep Sea Aura
  const auraPulse = Math.sin(time * 0.8) * 15;
  const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 160 + auraPulse);
  auraGrad.addColorStop(0, isAttacking ? 'rgba(239, 68, 68, 0.4)' : 'rgba(76, 29, 149, 0.3)');
  auraGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.1)');
  auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath(); ctx.arc(0, 0, 180, 0, Math.PI * 2); ctx.fill();

  // 2. High-Fidelity Tentacles
  const numTentacles = 6; // Reduced from 8
  for (let i = 0; i < numTentacles; i++) {
    const angle = (i / numTentacles) * Math.PI * 2 + Math.sin(time * 0.6 + i) * 0.3;
    const len = size * (2.2 + Math.sin(time * 1.1 + i) * 0.5); // Slightly shorter
    
    ctx.save();
    ctx.rotate(angle);
    
    // Tentacle Path
    const endX = len;
    const endY = Math.cos(time + i) * size * 0.3;
    const cp1x = size * 1.1;
    const cp1y = Math.sin(time * 1.4 + i) * size * 0.8;

    // Tentacle Color (Simplified - only one fill instead of gradient if needed, but linear is ok)
    ctx.strokeStyle = hpRatio < 0.4 ? '#ef4444' : '#8b5cf6';
    ctx.lineWidth = size * 0.35 * (1 - 0.4 * (len / (size * 3)));
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(size * 0.3, 0);
    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    ctx.stroke();

    // Bioluminescent Suckers (Reduced count)
    const suckerCount = 4; // Reduced from 6
    for (let j = 1; j <= suckerCount; j++) {
      const t = j / (suckerCount + 1);
      const sx = size * 0.3 + (len - size * 0.3) * t;
      const sy = cp1y * (1 - t) + endY * t;
      const sSize = size * 0.1 * (1 - t * 0.5);
      
      const sPulse = (Math.sin(time * 3 + i + j) + 1) / 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + sPulse * 0.6})`;
      ctx.beginPath(); ctx.arc(sx, sy, sSize, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 3. The Mantle (Head)
  const headPulse = Math.sin(time * 1.5) * 0.05;
  const headGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.3, 0, 0, 0, size * 1.2);
  headGrad.addColorStop(0, hpRatio < 0.4 ? '#dc2626' : '#8b5cf6');
  headGrad.addColorStop(1, hpRatio < 0.4 ? '#450a0a' : '#2e1065');
  
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.85, size * (1.15 + headPulse), 0, 0, Math.PI * 2);
  ctx.fill();

  // Decorative Spots (Procedural texture)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for(let i=0; i<10; i++) {
    const rx = Math.sin(i * 2.5) * size * 0.4;
    const ry = Math.cos(i * 3.1) * size * 0.7;
    ctx.beginPath(); ctx.arc(rx, ry, size * 0.05, 0, Math.PI * 2); ctx.fill();
  }

  // 4. Dreadful Eyes
  const drawEye = (side: number) => {
    const ex = size * 0.3, ey = side * size * 0.35;
    ctx.save();
    ctx.translate(ex, ey);
    
    // Outer Glow
    const eGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
    eGlow.addColorStop(0, isAttacking ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.3)');
    eGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = eGlow;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2); ctx.fill();

    // Sclera
    ctx.fillStyle = isAttacking ? '#fecaca' : '#fff7ed';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.18, size * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    
    // Iris
    const iGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
    iGrad.addColorStop(0, isAttacking ? '#ef4444' : '#f59e0b');
    iGrad.addColorStop(1, isAttacking ? '#7f1d1d' : '#9a3412');
    ctx.fillStyle = iGrad;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    
    // Pupil (Slit)
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.04, size * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    
    // Reflection
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-size * 0.05, -size * 0.08, size * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  drawEye(-1);
  drawEye(1);

  ctx.restore();
};


export const drawMechaSharkBoss = (
  ctx: CanvasRenderingContext2D,
  frameCount: number,
  hp: number,
  maxHp: number,
  isAttacking: boolean
) => {
  const time = frameCount * 0.05;
  
  ctx.save();
  ctx.rotate(Math.sin(time * 0.4) * 0.08);

  // 1. Chrome Body with Multi-layered Gradients
  const bodyGrad = ctx.createLinearGradient(-80, -40, 80, 40);
  bodyGrad.addColorStop(0, '#334155');
  bodyGrad.addColorStop(0.3, '#94a3b8');
  bodyGrad.addColorStop(0.5, '#f8fafc'); // High-gloss highlight
  bodyGrad.addColorStop(0.7, '#64748b');
  bodyGrad.addColorStop(1, '#0f172a');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-90, 0);
  ctx.bezierCurveTo(-70, -70, 50, -60, 100, -15);
  ctx.lineTo(100, 15);
  ctx.bezierCurveTo(50, 60, -70, 70, -90, 0);
  ctx.fill();
  
  // 2. Armor Plating and Circuitry
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for(let i=0; i<3; i++) {
    const x = -30 + i * 40;
    ctx.beginPath(); ctx.moveTo(x, -45 + i*5); ctx.lineTo(x, 45 - i*5); ctx.stroke();
    
    // Glowing circuits
    if (frameCount % 60 > 30) {
      ctx.strokeStyle = isAttacking ? '#ef4444' : '#06b6d4';
      ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + 10, -10); ctx.stroke();
    }
  }

  // 3. Cybernetic Eye (Lens effect)
  const eyeColor = isAttacking ? '#ef4444' : '#00f2ff';
  ctx.save();
  ctx.translate(65, -18);
  
  // Lens Glow
  const eGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  eGlow.addColorStop(0, eyeColor);
  eGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eGlow;
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  
  // Main Lens
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = eyeColor;
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  
  // Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(-3, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 4. Plasma Thruster
  const thrusterSize = 25 + Math.sin(time * 8) * 12;
  ctx.save();
  ctx.translate(-100, 0);
  
  // Core Flame
  const fGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, thrusterSize);
  fGrad.addColorStop(0, '#fff');
  fGrad.addColorStop(0.2, '#60a5fa');
  fGrad.addColorStop(0.5, '#2563eb');
  fGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
  ctx.fillStyle = fGrad;
  ctx.beginPath(); ctx.arc(0, 0, thrusterSize, 0, Math.PI * 2); ctx.fill();
  
  // Exhaust sparks
  if (frameCount % 2 === 0) {
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath(); ctx.arc(-10 - Math.random()*20, (Math.random()-0.5)*20, 2, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();

  // 5. Heavy Jaws (Mechanical)
  ctx.fillStyle = '#94a3b8';
  const jawAngle = isAttacking ? 0.3 : 0.05;
  ctx.save();
  ctx.translate(90, 5);
  ctx.rotate(jawAngle);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(35, 15); ctx.lineTo(0, 25); ctx.fill();
  // Teeth
  ctx.fillStyle = '#f8fafc';
  for(let i=0; i<3; i++) {
    ctx.beginPath(); ctx.moveTo(10+i*8, 5+i*3); ctx.lineTo(15+i*8, 12+i*3); ctx.lineTo(5+i*8, 12+i*3); ctx.fill();
  }
  ctx.restore();

  ctx.restore();
};

export const drawGhostOctopus = (
  ctx: CanvasRenderingContext2D,
  frameCount: number,
  hp: number,
  maxHp: number,
  isAttacking: boolean
) => {
  const time = frameCount * 0.05;
  
  ctx.save();
  // Set Composite Operation for "Spectral Glow"
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.6 + Math.sin(time * 0.5) * 0.2;

  // 1. Spectral Aura (Deep Glow)
  const sGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
  sGrad.addColorStop(0, isAttacking ? 'rgba(255, 50, 50, 0.4)' : 'rgba(56, 189, 248, 0.3)');
  sGrad.addColorStop(0.6, isAttacking ? 'rgba(127, 29, 29, 0.1)' : 'rgba(12, 74, 110, 0.1)');
  sGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sGrad;
  ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2); ctx.fill();

  // 2. Translucent Tendrils (Reduced count)
  for (let i = 0; i < 7; i++) { // Reduced from 10
    const angle = (i / 7) * Math.PI * 2 + Math.sin(time * 0.4 + i) * 0.5;
    const len = 110 + Math.cos(time * 0.7 + i) * 40;
    
    ctx.save();
    ctx.strokeStyle = isAttacking ? '#f87171' : '#7dd3fc';
    ctx.lineWidth = 1.5 + Math.sin(time + i) * 1.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      Math.cos(angle - 0.5) * (len * 0.4), Math.sin(angle - 0.5) * (len * 0.4),
      Math.cos(angle + 0.5) * (len * 0.8), Math.sin(angle + 0.5) * (len * 0.8),
      Math.cos(angle) * len, Math.sin(angle) * len
    );
    ctx.stroke();

    // Energy flow (Simpler drawing)
    const ePos = (time * 1.5 + i * 0.5) % 1;
    const ex = Math.cos(angle) * len * ePos;
    const ey = Math.sin(angle) * len * ePos;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex, ey, 2 * (1 - ePos), 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // 3. Eerie Skull Core
  const headGrad = ctx.createLinearGradient(-30, -50, 30, 20);
  headGrad.addColorStop(0, '#fff');
  headGrad.addColorStop(0.5, '#bae6fd');
  headGrad.addColorStop(1, '#38bdf8');
  
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.quadraticCurveTo(45, -50, 35, 20);
  ctx.lineTo(-35, 20);
  ctx.quadraticCurveTo(-45, -50, 0, -60);
  ctx.fill();

  // Internal Ribs / Spectral Structure
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for(let i=0; i<5; i++) {
      ctx.beginPath();
      ctx.moveTo(-25 + i*4, -35 + i*10);
      ctx.lineTo(25 - i*4, -35 + i*10);
      ctx.stroke();
  }

  // 4. Multiple Glowing Eyes (Hypnotic)
  const eyeColor = isAttacking ? '#ff0000' : '#00f2ff';
  for(let i=0; i<8; i++) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 4 + i);
      const ex = -25 + (i % 4) * 16 + Math.sin(time + i) * 3;
      const ey = -25 + Math.floor(i / 4) * 20 + Math.cos(time + i) * 3;
      
      ctx.fillStyle = eyeColor;
      ctx.globalAlpha = pulse;
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
      
      if (pulse > 0.8) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex, ey, 1.5, 0, Math.PI * 2); ctx.fill();
      }
  }

  ctx.restore();
};
