
import { FishType } from '../../types';
import { lerpColor } from '../graphics/Utils';

export const drawClassicFish = (
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

  // 1. DYNAMIC BODY GRADIENT (3D Volume Shading)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.2, 0, size * 1.2);
  bodyGrad.addColorStop(0, lerpColor(color, '#000', 0.5)); // Counter-shading (top)
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(0.6, color);
  bodyGrad.addColorStop(1, '#fff'); // Lighter belly

  // 2. CAUDAL FIN (Tail - Organic Rayed Structure)
  ctx.save();
  ctx.translate(-size * 1.0, 0);
  ctx.rotate(tailWag * 1.4);
  
  // Tail Outline
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.6, -size * 1.4, -size * 1.5, -size * 1.2, -size * 1.2, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 1.2, -size * 0.6, size * 1.4, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Tail Rays (Details)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  for(let i = -4; i <= 4; i++) {
    const angle = i * 0.22;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 1.1 * Math.cos(angle), size * 1.0 * Math.sin(angle));
    ctx.stroke();
  }
  ctx.restore();

  // 3. MAIN BODY (Anatomically correct torpedo)
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Nose
  ctx.bezierCurveTo(size * 1.2, -size * 1.1, -size * 0.6, -size * 1.0, -size * 1.1, 0);
  ctx.bezierCurveTo(-size * 0.6, size * 1.0, size * 1.2, size * 1.1, size * 1.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 4. SCALES (Layered Semi-Translucent Arcs)
  ctx.save();
  // Clip to body shape
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0);
  ctx.bezierCurveTo(size * 1.2, -size * 1.1, -size * 0.6, -size * 1.0, -size * 1.1, 0);
  ctx.bezierCurveTo(-size * 0.6, size * 1.0, size * 1.2, size * 1.1, size * 1.8, 0);
  ctx.clip();

  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 0.5;
  const scaleSize = size * 0.2;
  ctx.beginPath(); // Start ONE path for all scales
  for(let x = -size * 1.2; x < size * 1.8; x += scaleSize * 0.7) {
    for(let y = -size; y < size; y += scaleSize) {
      const stagger = (Math.floor(x / (scaleSize * 0.7)) % 2) * (scaleSize * 0.5);
      // Add to current path instead of stroking each one
      ctx.moveTo(x + scaleSize * 0.6, y + stagger); 
      ctx.arc(x, y + stagger, scaleSize * 0.6, -0.4 * Math.PI, 0.4 * Math.PI);
    }
  }
  ctx.stroke(); // Stroke once
  ctx.restore();

  // 5. FINS (Dorsal & Pectoral with Rays)
  const drawDetailedFin = (x: number, y: number, scale: number, rot: number, type: 'dorsal' | 'pectoral') => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (type === 'dorsal') {
      ctx.bezierCurveTo(-size * 0.2, -size * 1.2, -size * 1.0, -size * 1.0, -size * 0.8, 0);
    } else {
      ctx.rotate(tailWag * -0.3); // Inverse wag for realism
      ctx.bezierCurveTo(size * 0.3, size * 0.8, -size * 0.6, size * 0.9, -size * 0.4, 0);
    }
    ctx.fill();
    
    // Fin rays
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8;
    for(let i=1; i<=3; i++) {
        ctx.beginPath(); ctx.moveTo(0,0);
        const lx = -size * 0.7 * (i/3);
        const ly = (type === 'dorsal' ? -size : size) * 0.5 * (i/3);
        ctx.lineTo(lx, ly); ctx.stroke();
    }
    ctx.restore();
  };

  drawDetailedFin(size * 0.2, -size * 0.75, 1, 0, 'dorsal');
  drawDetailedFin(size * 0.6, size * 0.3, 0.8, 0.3, 'pectoral');

  // 6. HEAD DETAILS (Operculum & Realistic Eye)
  // Gill Cover (Operculum)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(size * 1.0, -size * 0.4);
  ctx.quadraticCurveTo(size * 0.75, 0, size * 1.0, size * 0.4);
  ctx.stroke();

  // Premium Eye
  const eyeX = size * 1.35, eyeY = -size * 0.2;
  // Eye socket shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.22, 0, Math.PI * 2); ctx.fill();
  // Iris
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.18, 0, Math.PI * 2); ctx.fill();
  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.1, 0, Math.PI * 2); ctx.fill();
  // Specular Highlight
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.08, eyeY - size * 0.06, size * 0.04, 0, Math.PI * 2); ctx.fill();

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
  const time = frameCount * 0.05;
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.4;

  // 1. Slimy Bottom-Dweller Gradient
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.8, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#0f172a'); // Dark top
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.7, '#475569'); // Slimy grey side
  bodyGrad.addColorStop(1, '#94a3b8');   // Pale belly

  // === 2. BODY & TAIL (Integrated sinuous shape) ===
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Flat snout
  // Top profile
  ctx.bezierCurveTo(size * 1.2, -size * 1.2, -size * 0.5, -size * 1.0, -size * 1.5, -size * 0.3);
  // Long tapering tail
  ctx.save();
  ctx.translate(-size * 1.5, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.lineTo(-size * 3.5, 0); // Tail tip
  ctx.lineTo(-size * 3.4, size * 0.2); // Taper back
  ctx.restore();
  // Bottom profile
  ctx.bezierCurveTo(-size * 0.5, size * 1.0, size * 1.2, size * 1.2, size * 1.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // === 3. MOTTLED SKIN TEXTURE ===
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#020617';
  for (let i = 0; i < 12; i++) {
    const rx = size * 1.0 - i * size * 0.3;
    const ry = Math.sin(i * 2.5 + time) * size * 0.5;
    const r = size * (0.15 + Math.sin(i * 0.8) * 0.1);
    ctx.beginPath(); ctx.ellipse(rx, ry, r * 1.4, r * 0.8, i * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // === 4. REALISTIC BARBELS (Whiskers - 4 pairs) ===
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  const whiskWave = Math.sin(time * 1.5);
  
  const drawBarbel = (side: number, angle: number, len: number, offset: number) => {
    ctx.save();
    ctx.translate(size * 1.5, side * size * 0.25);
    ctx.rotate(side * angle + side * whiskWave * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 1.2, side * size * 0.5, size * 0.8, side * size * 1.5, -size * len, side * size * offset);
    ctx.stroke();
    ctx.restore();
  };

  for(let side = -1; side <= 1; side += 2) {
    drawBarbel(side, 0.4, 1.8, 1.2); // Long top
    drawBarbel(side, 0.8, 1.2, 1.5); // Outer
    drawBarbel(side, -0.2, 0.8, 0.8); // Inner short
  }

  // === 5. EYES & FINISHING ===
  const drawEye = (side: number) => {
    const ex = size * 1.2, ey = side * size * 0.55;
    ctx.fillStyle = '#fbbf24'; // Muddy yellow eye
    ctx.beginPath(); ctx.arc(ex, ey, size * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(ex + size * 0.03, ey, size * 0.08, 0, Math.PI * 2); ctx.fill();
  };
  drawEye(-1); drawEye(1);

  ctx.restore();
};

export const drawSnakehead = (
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
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.4;

  // 1. Natural Camouflage Gradient (Dark Jungle Green/Brown)
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size * 1.2);
  bodyGrad.addColorStop(0, '#0f172a'); // Black top
  bodyGrad.addColorStop(0.3, color);   // Main color
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#f1f5f9'); // Pale belly

  // === 2. BODY (Long, powerful torpedo shape) ===
  ctx.beginPath();
  ctx.moveTo(size * 3.0, 0); // Sharp snout
  ctx.bezierCurveTo(size * 2.0, -size * 1.1, size * 0.5, -size * 1.2, -size * 2.0, -size * 0.8); // Long back
  ctx.quadraticCurveTo(-size * 3.5, -size * 0.4, -size * 4.0, 0); // Tail base
  ctx.quadraticCurveTo(-size * 3.5, size * 0.4, -size * 2.0, size * 0.8); // Bottom back
  ctx.bezierCurveTo(size * 0.5, size * 1.2, size * 2.0, size * 1.1, size * 3.0, 0); // Belly to jaw
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // === 3. SNAKE-SKIN PATTERN (Procedural Marbling) ===
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#020617';
  // Scale-like texture
  for (let i = 0; i < 18; i++) {
    const tx = size * 2.2 - i * size * 0.35;
    const ty = Math.sin(i * 1.8 + time) * size * 0.4;
    const r = size * (0.2 + Math.sin(i * 0.6) * 0.1);
    
    ctx.beginPath();
    ctx.ellipse(tx, ty, r * 1.8, r * 0.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(tx, -ty, r * 1.2, r * 0.6, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === 4. LONG MAJESTIC FINS ===
  // Dorsal Fin (Runs along the whole back)
  ctx.save();
  ctx.globalAlpha = 0.8;
  const finGrad = ctx.createLinearGradient(0, -size * 0.5, 0, -size * 1.8);
  finGrad.addColorStop(0, color);
  finGrad.addColorStop(1, '#020617');
  ctx.fillStyle = finGrad;
  
  ctx.beginPath();
  ctx.moveTo(size * 1.0, -size * 0.8);
  ctx.bezierCurveTo(0, -size * 1.6, -size * 2.5, -size * 1.4, -size * 3.8, -size * 0.2);
  ctx.lineTo(-size * 3.5, 0);
  ctx.fill();
  
  // Fin texture (Rays)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for(let i=0; i<12; i++) {
    const fx = size * 0.8 - i * size * 0.4;
    ctx.beginPath(); ctx.moveTo(fx, -size * 0.8); ctx.lineTo(fx - size * 0.3, -size * 1.4); ctx.stroke();
  }
  ctx.restore();

  // Anal Fin
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.8);
  ctx.bezierCurveTo(0, size * 1.4, -size * 2.5, size * 1.2, -size * 3.8, size * 0.2);
  ctx.lineTo(-size * 3.5, 0);
  ctx.fill();
  ctx.restore();

  // === 5. ROUNDED PREDATORY TAIL ===
  ctx.save();
  ctx.translate(-size * 4.0, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.2, -size * 1.6, -size * 2.8, -size * 1.0, -size * 2.8, 0);
  ctx.bezierCurveTo(-size * 2.8, size * 1.0, -size * 1.2, size * 1.6, 0, 0);
  ctx.fill();
  // Tail rays
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  for(let i=-2; i<=2; i++) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 2.5, i * size * 0.4); ctx.stroke();
  }
  ctx.restore();

  // === 6. HEAD & AGGRESSION ===
  const eyeX = size * 2.0, eyeY = -size * 0.35;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();

  // Strong Jawline
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.moveTo(size * 3.0, 0);
  ctx.lineTo(size * 1.2, size * 0.2);
  ctx.stroke();

  ctx.restore();
};

export const drawEel = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // 1. Body Gradient: dark top #1a1a2e, mottled side matching color, pale belly
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#1a1a2e'); // Dark top
  bodyGrad.addColorStop(0.5, color);    // Side
  bodyGrad.addColorStop(1, '#f1f5f9');  // Pale belly

  // === THÂN & VÂY (Very elongated body) ===
  ctx.save();
  ctx.rotate(tailWag * 0.15); // Subtle sinuous movement

  // 2. Continuous Ribbon Fin (Dorsal+Caudal+Anal merged)
  // Drawn as a thin wavy stroke along the entire dorsal edge
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.6;
  
  for (let x = size * 1.5; x >= -size * 3.5; x -= size * 0.1) {
    // Wave animation: Math.sin(x * 0.3 + frameCount * 0.1)
    const yOffset = Math.sin(x * 0.3 + frameCount * 0.1) * size * 0.1;
    const dorsalY = -size * 0.4 + yOffset;
    if (x === size * 1.5) ctx.moveTo(x, dorsalY);
    else ctx.lineTo(x, dorsalY);
  }
  ctx.stroke();
  ctx.restore();

  // 3. Body Shape (Elongated ribbon)
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Blunt/rounded head
  // Upper body (from head to tail tip at -3.5)
  ctx.bezierCurveTo(size * 1.5, -size * 0.6, -size * 1.5, -size * 0.5, -size * 3.5, 0);
  // Lower body (back to head)
  ctx.bezierCurveTo(-size * 1.5, size * 0.5, size * 1.5, size * 0.6, size * 1.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 4. Subtle Pattern (Smooth skin illusion)
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 15; i++) {
    const px = size * 1.2 - i * size * 0.3;
    const py = Math.sin(i * 1.5) * size * 0.2;
    ctx.beginPath(); ctx.arc(px, py, size * 0.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // 5. Head Details (Blunt/rounded head)
  const eyeX = size * 1.4;
  const eyeY = -size * 0.15;
  
  // Eye (Small, black)
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();
  
  // 6. Slightly Open Mouth
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(size * 1.8, size * 0.05);
  ctx.quadraticCurveTo(size * 1.6, size * 0.15, size * 1.3, size * 0.05);
  ctx.stroke();

  ctx.restore(); // End body rotation
};
