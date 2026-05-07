
import { FishType } from '../types';

export const drawAbyssalKraken = (
  ctx: CanvasRenderingContext2D,
  frameCount: number,
  hp: number,
  maxHp: number,
  isAttacking: boolean
) => {
  const time = frameCount * 0.05;
  const hpRatio = hp / maxHp;
  
  ctx.save();
  
  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
  glow.addColorStop(0, isAttacking ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.3)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fill();

  // Tentacles (8 of them)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.sin(time + i) * 0.2;
    const len = 70 + Math.sin(time * 1.5 + i) * 20;
    const tx = Math.cos(angle) * len;
    const ty = Math.sin(angle) * len;
    
    ctx.strokeStyle = hpRatio < 0.3 ? '#ef4444' : '#4c1d95';
    ctx.lineWidth = 15 * hpRatio + 5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(angle + 0.5) * (len * 0.6), 
      Math.sin(angle + 0.5) * (len * 0.6), 
      tx, ty
    );
    ctx.stroke();
    
    // Suction cups
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(tx * 0.7, ty * 0.7, 3, 0, Math.PI * 2); ctx.fill();
  }

  // Main Body (Mantle)
  const bodyGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, 40);
  bodyGrad.addColorStop(0, '#7c3aed');
  bodyGrad.addColorStop(1, '#1e1b4b');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 45, 55, Math.sin(time * 0.5) * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  const eyePulse = 1 + Math.sin(time * 4) * 0.1;
  ctx.fillStyle = isAttacking ? '#ffffff' : '#fef08a';
  ctx.shadowBlur = 15; ctx.shadowColor = isAttacking ? 'white' : 'yellow';
  ctx.beginPath(); ctx.ellipse(-15, -10, 8 * eyePulse, 12 * eyePulse, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(15, -10, 8 * eyePulse, 12 * eyePulse, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(-15, -10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(15, -10, 4, 0, Math.PI * 2); ctx.fill();

  // Angry Brows
  if (hpRatio < 0.5) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-25, -25); ctx.lineTo(-5, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, -25); ctx.lineTo(5, -15); ctx.stroke();
  }

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

  // Thruster
  const thrusterSize = 20 + Math.random() * 20;
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
