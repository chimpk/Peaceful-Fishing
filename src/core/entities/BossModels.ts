
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
  const size = 65;
  const color = hpRatio < 0.3 ? '#991b1b' : '#4c1d95';
  
  ctx.save();
  
  // 1. SIMPLIFIED AURA - reduced complexity
  const glowRadius = 120 + Math.sin(time * 2) * 20;
  ctx.fillStyle = isAttacking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.1)';
  ctx.beginPath(); ctx.arc(0, 0, glowRadius, 0, Math.PI * 2); ctx.fill();

  // 2. OPTIMIZED TENTACLES - fewer suckers
  const numTentacles = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.4;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < numTentacles; i++) {
    const angle = (i / numTentacles) * Math.PI * 2 + Math.sin(time * 0.8 + i) * 0.25;
    const len = size * (2.2 + Math.sin(time * 1.2 + i) * 0.5);
    
    ctx.save();
    ctx.rotate(angle);
    
    const cp1x = size * 1.5;
    const cp1y = Math.sin(time * 1.5 + i) * size;
    const endX = len;
    const endY = Math.cos(time + i) * size * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(size * 0.4, 0);
    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    ctx.stroke();

    // Fewer suckers per tentacle
    const suckerCount = 3;
    ctx.fillStyle = hpRatio < 0.3 ? '#f87171' : '#f472b6';
    for (let j = 1; j <= suckerCount; j++) {
      const t = j / (suckerCount + 1);
      const sx = size * 0.4 + (len - size * 0.4) * t;
      const sy = cp1y * (1 - t) + endY * t;
      
      ctx.beginPath(); 
      ctx.arc(sx, sy, size * 0.1 * (1 - t * 0.5), 0, Math.PI * 2); 
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. SIMPLIFIED MANTLE
  const pulse = Math.sin(time * 1.2) * 0.08;
  ctx.fillStyle = hpRatio < 0.3 ? '#ef4444' : '#a855f7';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.9, size * (1.1 + pulse), 0, 0, Math.PI * 2);
  ctx.fill();

  // Minimal skin texture
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for(let i=0; i<6; i++) {
    const rx = Math.sin(i * 1.8) * size * 0.5;
    const ry = Math.cos(i * 2.2) * size * 0.7;
    ctx.beginPath(); ctx.arc(rx, ry, size * 0.06, 0, Math.PI * 2); ctx.fill();
  }

  // 4. SIMPLIFIED EYES - no shadow blur
  const drawBossEye = (side: number) => {
    const eyeX = size * 0.35, eyeY = side * size * 0.3;
    
    // Sclera
    ctx.fillStyle = isAttacking ? '#fee2e2' : '#fef9c3';
    ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.2, size * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    
    // Iris
    ctx.fillStyle = isAttacking ? '#991b1b' : '#4c1d95';
    ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
    
    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(eyeX + size * 0.08, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();
  };
  drawBossEye(-1);
  drawBossEye(1);

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
  const hpRatio = hp / maxHp;
  
  ctx.save();
  ctx.rotate(Math.sin(time * 0.3) * 0.1);

  // Metal Body
  const metalGrad = ctx.createLinearGradient(-60, -40, 60, 40);
  metalGrad.addColorStop(0, '#94a3b8');
  metalGrad.addColorStop(0.5, '#475569');
  metalGrad.addColorStop(1, '#1e293b');
  
  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.moveTo(-80, 0);
  ctx.bezierCurveTo(-60, -60, 40, -50, 90, -10);
  ctx.lineTo(90, 10);
  ctx.bezierCurveTo(40, 50, -60, 60, -80, 0);
  ctx.fill();
  
  // Armor Plates
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, 45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, -35); ctx.lineTo(30, 35); ctx.stroke();

  // Cyber Eye
  const eyeColor = isAttacking ? '#ff0000' : '#00f2ff';
  ctx.shadowBlur = 15; ctx.shadowColor = eyeColor;
  ctx.fillStyle = eyeColor;
  ctx.beginPath(); ctx.arc(60, -15, 8, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Thruster — dùng Math.sin() thay Math.random() để flame mượt mà, không random flicker
  const thrusterSize = 20 + Math.sin(time * 5) * 10;
  const fireGrad = ctx.createRadialGradient(-90, 0, 0, -90, 0, thrusterSize);
  fireGrad.addColorStop(0, '#fde047');
  fireGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = fireGrad;
  ctx.beginPath(); ctx.arc(-90, 0, thrusterSize, 0, Math.PI * 2); ctx.fill();

  // Jaws
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(80, 5);
  ctx.lineTo(110, 15 + (isAttacking ? 10 : 0));
  ctx.lineTo(85, 20);
  ctx.fill();

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
  const hpRatio = hp / maxHp;
  
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(time * 0.4) * 0.25; // More ghostly transparency

  // Outer spectral aura (Conic/Radial mix)
  const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 140);
  aura.addColorStop(0, isAttacking ? 'rgba(0, 255, 255, 0.5)' : 'rgba(125, 211, 252, 0.2)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(0, 0, 140, 0, Math.PI * 2); ctx.fill();

  // Spectral Tendrils (Longer, thinner, more wavy than Kraken)
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + Math.sin(time * 0.5 + i) * 0.5;
    const len = 110 + Math.cos(time * 0.8 + i) * 40;
    
    ctx.strokeStyle = isAttacking ? '#00f2ff' : '#bae6fd';
    ctx.lineWidth = 3 + hpRatio * 5; // Much thinner than Kraken
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Extra wavy bezier
    ctx.bezierCurveTo(
      Math.cos(angle - 0.8) * (len * 0.3), Math.sin(angle - 0.8) * (len * 0.3),
      Math.cos(angle + 0.8) * (len * 0.7), Math.sin(angle + 0.8) * (len * 0.7),
      Math.cos(angle) * len, Math.sin(angle) * len
    );
    ctx.stroke();
    
    // Bioluminescent "Nodes" along tendrils
    if (frameCount % 3 === 0) {
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); 
        ctx.arc(Math.cos(angle) * len * 0.6, Math.sin(angle) * len * 0.6, 2, 0, Math.PI*2); 
        ctx.fill();
    }
  }

  // Skeletal Head (More angular/skull-like)
  ctx.fillStyle = '#f0f9ff';
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.quadraticCurveTo(40, -40, 30, 10);
  ctx.lineTo(-30, 10);
  ctx.quadraticCurveTo(-40, -40, 0, -50);
  ctx.fill();

  // Internal "Ribs" (Visual distinction from Kraken's solid body)
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.4)';
  ctx.lineWidth = 2;
  for(let i=0; i<4; i++) {
      ctx.beginPath();
      ctx.moveTo(-20 + i*5, -30 + i*8);
      ctx.lineTo(20 - i*5, -30 + i*8);
      ctx.stroke();
  }

  // Multiple Small Eerie Eyes (Kraken has 2 large ones)
  const eyeColor = isAttacking ? '#ff0000' : '#00f2ff';
  ctx.shadowBlur = 10; ctx.shadowColor = eyeColor;
  ctx.fillStyle = eyeColor;
  for(let i=0; i<6; i++) {
      const ex = -20 + (i % 3) * 20;
      const ey = -20 + Math.floor(i / 3) * 15;
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.restore();
};
