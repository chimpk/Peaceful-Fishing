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
  
  // 1. CLEAN BIOLOGICAL COLORS
  const deepNavy = '#0f172a';
  const slateGray = '#475569';
  const bellyWhite = '#f8fafc';
  const highlightWhite = 'rgba(255, 255, 255, 0.2)';

  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, deepNavy);
  bodyGrad.addColorStop(0.4, slateGray);
  bodyGrad.addColorStop(0.55, bellyWhite);
  bodyGrad.addColorStop(1, '#cbd5e1');

  // Helper for Clean Sharp Fins
  const drawPec = (side: number) => {
    ctx.save();
    ctx.translate(size * 2.5, side * size * 0.8);
    ctx.rotate(side * (0.9 + Math.sin(time * 0.4) * 0.05)); 
    ctx.fillStyle = side === -1 ? deepNavy : slateGray;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 1.2, side * size * 2.0, size * 2.0, side * size * 4.8);
    ctx.quadraticCurveTo(-size * 1.0, side * size * 2.5, -size * 1.8, 0);
    ctx.fill();
    ctx.restore();
  };

  // STEP 1: Far Fin
  drawPec(-1);

  // STEP 3: Sleek Torpedo Body
  ctx.beginPath();
  ctx.moveTo(size * 7.0, -size * 0.2);
  ctx.bezierCurveTo(size * 4.5, -size * 2.6, -size * 3.5, -size * 2.4, -size * 7.0, 0);
  ctx.bezierCurveTo(-size * 3.5, size * 2.6, size * 4.5, size * 2.4, size * 7.0, -size * 0.2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // STEP 4: Simplified Textures (Limited to front/mid body to keep tail clean)
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = bellyWhite;
  ctx.beginPath();
  // Start from -size * 3 to keep the tail-end (caudal peduncle) dark
  ctx.moveTo(-size * 3, size * 0.6);
  for(let x = -size * 3; x <= size * 8; x += size * 1.0) {
      const jag = Math.sin(x * 1.0 + time) * size * 0.2;
      ctx.lineTo(x, size * 0.6 + jag);
  }
  ctx.lineTo(size * 8, size * 4);
  ctx.lineTo(-size * 3, size * 4);
  ctx.fill();

  // Specular Highlight
  ctx.fillStyle = highlightWhite;
  ctx.beginPath();
  ctx.ellipse(size * 2.5, -size * 1.4, size * 5.0, size * 0.5, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // STEP 5: Solid Clean Tail (Drawn AFTER body to cover any overlap)
  ctx.save();
  ctx.translate(-size * 6.2, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = slateGray;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.5, -size * 3.0, -size * 6.0, -size * 6.0, -size * 5.0, -size * 4.0);
  ctx.bezierCurveTo(-size * 4.0, -size * 2.0, -size * 1.5, -size * 0.5, 0, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 1.6, -size * 5.0, size * 5.0, -size * 4.0, size * 2.5);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.5, 0, 0);
  ctx.fill();
  ctx.restore();

  // STEP 6: Near Fin
  drawPec(1);

  // STEP 6: Smaller Dorsal Fin (Vẩy trên nhỏ lại)
  ctx.save();
  ctx.translate(-size * 0.8, -size * 1.8);
  ctx.fillStyle = deepNavy;
  ctx.beginPath();
  ctx.moveTo(size * 2.2, 0);
  ctx.quadraticCurveTo(size * 1.0, -size * 3.5, size * 0.6, -size * 4.2); // Smaller peak
  ctx.quadraticCurveTo(-size * 1.5, -size * 3.0, -size * 2.0, 0);
  ctx.fill();
  ctx.restore();

  // STEP 7: Simple Mouth & Head Details
  // Gill Slits
  for(let i=0; i<5; i++) {
    const gx = size * 4.5 - i * size * 0.7;
    ctx.strokeStyle = `rgba(0,0,0,${0.4 - i * 0.05})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(gx, -size * 1.0);
    ctx.quadraticCurveTo(gx - size * 0.3, 0, gx, size * 1.2);
    ctx.stroke();
  }

  // Eye
  const eyeX = size * 5.6, eyeY = -size * 0.7;
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.08, eyeY - size * 0.08, size * 0.07, 0, Math.PI * 2); ctx.fill();

  // SIMPLE MOUTH
  ctx.save();
  ctx.translate(size * 4.2, size * 0.38); // Moved up
  ctx.rotate(0.08);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.5;
  const p0 = { x: 0, y: 0 }, p1 = { x: size * 1.2, y: size * 0.3 }, p2 = { x: size * 2.2, y: -size * 0.2 };
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
  ctx.stroke();
  
  // Just 3 simple sharp teeth
  ctx.fillStyle = '#ffffff';
  for(let i=0; i<3; i++) {
    const t = 0.2 + i * 0.3;
    const tx = Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const ty = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + size * 0.2, ty + size * 0.45);
    ctx.lineTo(tx + size * 0.4, ty);
    ctx.fill();
  }
  ctx.restore();

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
  
  // 1. UNIQUE HAMMERHEAD COLORS (Màu xanh đá lạnh lùng)
  const deepBlue = '#0f172a';
  const stoneBlue = '#334155';
  const bellySilver = '#f1f5f9';
  const highlight = 'rgba(255, 255, 255, 0.15)';

  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, deepBlue);
  bodyGrad.addColorStop(0.4, stoneBlue);
  bodyGrad.addColorStop(0.6, bellySilver);
  bodyGrad.addColorStop(1, '#cbd5e1');

  // Helper for Shark Fins (Same as standard shark for consistency)
  const drawSharpFin = (side: number) => {
    ctx.save();
    ctx.translate(size * 2.0, side * size * 0.8);
    ctx.rotate(side * (0.9 + Math.sin(time * 0.4) * 0.05)); 
    ctx.fillStyle = side === -1 ? deepBlue : stoneBlue;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 1.5, side * size * 2.5, size * 2.5, side * size * 5.5);
    ctx.quadraticCurveTo(-size * 1.5, side * size * 3.0, -size * 2.0, 0);
    ctx.fill();
    ctx.restore();
  };

  // STEP 1: Far Pectoral Fin
  drawSharpFin(-1);

  // STEP 2: SLEEK TORPEDO BODY (Form dáng cá mập chuẩn)
  ctx.beginPath();
  ctx.moveTo(size * 5.0, 0); // Head connection
  ctx.bezierCurveTo(size * 3.5, -size * 2.2, -size * 3.5, -size * 2.4, -size * 7.0, 0);
  ctx.bezierCurveTo(-size * 3.5, size * 2.4, size * 3.5, size * 2.2, size * 5.0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Specular Highlight for depth (Clipped to body)
  ctx.save();
  ctx.clip(); // Giới hạn mọi thứ vẽ sau đây chỉ nằm trong thân cá
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(size * 1.0, -size * 1.2, size * 4.0, size * 0.4, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // STEP 3: THE HAMMER (Cephalofoil - Organic & Aerodynamic)
  ctx.save();
  ctx.translate(size * 5.2, 0);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Central connection
  ctx.moveTo(0, -size * 0.5);
  // Top curve of the hammer
  ctx.bezierCurveTo(size * 0.5, -size * 2.5, size * 1.5, -size * 4.0, size * 0.5, -size * 4.8);
  // Outer tip (Sharp but organic)
  ctx.quadraticCurveTo(-size * 1.0, -size * 5.0, -size * 1.8, -size * 4.5);
  // Back curve to neck
  ctx.bezierCurveTo(-size * 1.2, -size * 3.0, -size * 0.8, -size * 1.0, -size * 1.2, 0);
  // Mirror for bottom half
  ctx.bezierCurveTo(-size * 0.8, size * 1.0, -size * 1.2, size * 3.0, -size * 1.8, size * 4.5);
  ctx.quadraticCurveTo(-size * 1.0, size * 5.0, size * 0.5, size * 4.8);
  ctx.bezierCurveTo(size * 1.5, size * 4.0, size * 0.5, size * 2.5, 0, size * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // High-fidelity details on the hammer
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size * 4.0); ctx.lineTo(-size * 0.5, -size * 4.0);
  ctx.moveTo(0, size * 4.0); ctx.lineTo(-size * 0.5, size * 4.0);
  ctx.stroke();

  // Eyes on the tips (Professional grade)
  const drawEye = (side: number) => {
    const eyY = side * size * 4.6;
    const eyX = -size * 0.2;
    // Sclera
    ctx.fillStyle = bellySilver;
    ctx.beginPath(); ctx.arc(eyX, eyY, size * 0.3, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.arc(eyX + size * 0.05, eyY, size * 0.18, 0, Math.PI * 2); ctx.fill();
    // Catch light
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(eyX + size * 0.12, eyY - size * 0.08, size * 0.06, 0, Math.PI * 2); ctx.fill();
  };
  drawEye(-1); drawEye(1);
  ctx.restore();

  // STEP 4: SHARP HETEROCERCAL TAIL (Đuôi mập chuẩn)
  ctx.save();
  ctx.translate(-size * 6.5, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = stoneBlue;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 2.0, -size * 4.0, -size * 7.0, -size * 7.0, -size * 6.0, -size * 5.0);
  ctx.bezierCurveTo(-size * 5.0, -size * 3.0, -size * 2.0, -size * 0.8, 0, 0);
  ctx.bezierCurveTo(-size * 2.0, size * 2.5, -size * 6.0, size * 6.0, -size * 5.0, size * 3.5);
  ctx.quadraticCurveTo(-size * 2.0, size * 0.8, 0, 0);
  ctx.fill();
  ctx.restore();

  // STEP 5: Near Pectoral Fin
  drawSharpFin(1);

  // STEP 6: Majestic Dorsal Fin (Vây lưng cao chuẩn mập)
  ctx.save();
  ctx.translate(-size * 1.0, -size * 1.5);
  ctx.fillStyle = deepBlue;
  ctx.beginPath();
  ctx.moveTo(size * 2.5, 0);
  ctx.quadraticCurveTo(size * 1.5, -size * 4.5, size * 1.0, -size * 5.5);
  ctx.quadraticCurveTo(-size * 1.8, -size * 4.0, -size * 2.5, 0);
  ctx.fill();
  ctx.restore();

  // STEP 7: Gill Slits & Details
  for(let i=0; i<5; i++) {
    const gx = size * 3.0 - i * size * 0.6;
    ctx.strokeStyle = `rgba(0,0,0,${0.35 - i * 0.05})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, -size * 0.8);
    ctx.quadraticCurveTo(gx - size * 0.2, 0, gx, size * 0.8);
    ctx.stroke();
  }

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
  ctx.rotate(tailWag * 0.1);

  // 1. HIGH-INTENSITY METALLIC SHADING
  // Chrome-like finish with deep blues and sharp highlights
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#1e1b4b'); // Midnight blue dorsal
  bodyGrad.addColorStop(0.3, '#334155'); 
  bodyGrad.addColorStop(0.45, '#94a3b8'); // Metallic silver side
  bodyGrad.addColorStop(0.5, '#f1f5f9');  // Specular peak
  bodyGrad.addColorStop(0.6, '#94a3b8');
  bodyGrad.addColorStop(1, '#e2e8f0');    // Belly silver

  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = size * 0.4;

  // 2. ULTRA-SLEEK TORPEDO BODY
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 2.5, -size * 0.1); // Base of sword
  ctx.bezierCurveTo(size * 1.0, -size * 1.4, -size * 2.0, -size * 1.2, -size * 5.0, 0); // Back
  ctx.bezierCurveTo(-size * 2.0, size * 1.2, size * 1.0, size * 1.4, size * 2.5, size * 0.1); // Belly
  ctx.fill();

  // Specular Shimmer (Moving highlight)
  const shimmerPos = (Math.sin(time) + 1) * size * 2;
  const shimmerGrad = ctx.createLinearGradient(shimmerPos - size * 5, 0, shimmerPos, 0);
  shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)');
  shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmerGrad;
  ctx.fill();

  // 3. RAZOR-SHARP SILVER BILL (The Sword)
  const swordGrad = ctx.createLinearGradient(size * 2.5, 0, size * 8.0, 0);
  swordGrad.addColorStop(0, '#94a3b8');
  swordGrad.addColorStop(0.5, '#f1f5f9');
  swordGrad.addColorStop(1, '#475569');
  
  ctx.fillStyle = swordGrad;
  ctx.beginPath();
  ctx.moveTo(size * 2.5, -size * 0.15);
  ctx.lineTo(size * 9.0, 0);
  ctx.lineTo(size * 2.5, size * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Sword Edge Highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(size * 2.5, 0); ctx.lineTo(size * 7.0, 0); ctx.stroke();

  // 4. POINTED DORSAL FIN (Distinct from sailfish)
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.8);
  ctx.quadraticCurveTo(-size * 0.2, -size * 2.8, -size * 1.5, -size * 0.6);
  ctx.fill();

  // 5. PECTORAL FINS (Long and narrow)
  const drawSwordPec = (side: number) => {
    ctx.save();
    ctx.translate(size * 1.0, side * size * 0.5);
    ctx.rotate(side * (1.1 + Math.sin(time) * 0.1));
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, side * size * 2.8, -size * 1.2, side * size * 2.5, -size * 0.2, 0);
    ctx.fill();
    ctx.restore();
  };
  drawSwordPec(-1);
  drawSwordPec(1);

  // 6. POWERFUL CRESCENT TAIL
  ctx.save();
  ctx.translate(-size * 5.0, 0);
  ctx.rotate(Math.sin(frameCount * wagFreq * 1.5) * 0.4);
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.2, -size * 3.5, -size * 2.5, -size * 3.5, -size * 1.5, 0);
  ctx.bezierCurveTo(-size * 2.5, size * 3.5, -size * 1.2, size * 3.5, 0, 0);
  ctx.fill();
  ctx.restore();

  // 7. DEEP SEA EYE (Large and reflecting)
  const eyeX = size * 1.5, eyeY = -size * 0.3;
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.1, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.15, eyeY - size * 0.15, size * 0.05, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

