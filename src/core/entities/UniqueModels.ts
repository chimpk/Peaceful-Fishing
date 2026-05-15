
import { FishType, Rarity } from '../../types';

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
  // Cá đuối mắt nằm trên lưng (dorsal surface) gần trung tâm, không phải bụng
  // Sau khi restore() từ scale wing, cần vẽ mắt tại tậa độ gốc (0,0)
  ctx.fillStyle = '#111827'; // Màu tối — mắt cá đuối nhỏ và lồi lên
  ctx.beginPath(); ctx.ellipse(size * 0.2, -size * 0.5, size * 0.12, size * 0.07, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.2, size * 0.5, size * 0.12, size * 0.07, 0.2, 0, Math.PI * 2); ctx.fill();
  // Catch light
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(size * 0.24, -size * 0.52, size * 0.03, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.24, size * 0.48, size * 0.03, 0, Math.PI * 2); ctx.fill();

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
  const time = frameCount * 0.05;
  const finWag = Math.sin(time * 0.8) * 0.35;
  const bodyWag = Math.sin(time * 0.15) * 0.04;

  ctx.save();
  ctx.rotate(bodyWag);

  // 1. Realistic Pearly Skin Shading (Multi-layered Gradients)
  const bodyGrad = ctx.createRadialGradient(size * 0.3, -size * 0.6, size * 0.2, 0, 0, size * 1.8);
  bodyGrad.addColorStop(0, '#f8fafc'); // Specular highlight on brow
  bodyGrad.addColorStop(0.3, color);   // Base color
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#0f172a'); // Deep edge shadow

  // === 2. BODY (The iconic tall disc shape) ===
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.25, size * 1.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // === 3. CLAVUS (The truncated tail) ===
  ctx.save();
  ctx.beginPath();
  const backX = -size * 0.7;
  ctx.moveTo(backX, -size * 1.45);
  // Scalloped back edge (Procedural wavy geometry)
  const numScallops = 8;
  for (let i = 0; i <= numScallops; i++) {
    const ty = -size * 1.45 + (i * size * 2.9 / numScallops);
    const tx = backX - size * (0.45 + Math.sin(i * 1.5) * 0.15);
    ctx.lineTo(tx, ty);
  }
  ctx.lineTo(backX, size * 1.45);
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Clavus texture rays
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for(let i=0; i<numScallops; i++) {
    const ty = -size * 1.4 + (i * size * 2.8 / numScallops);
    ctx.beginPath(); ctx.moveTo(backX, ty); ctx.lineTo(backX - size * 0.3, ty); ctx.stroke();
  }
  ctx.restore();

  // === 4. MASSIVE VERTICAL FINS ===
  const drawVerticalFin = (side: number) => {
    ctx.save();
    ctx.translate(-size * 0.2, side * size * 1.25);
    ctx.rotate(side * finWag);
    
    const finGrad = ctx.createLinearGradient(0, 0, -size * 0.5, side * size * 1.5);
    finGrad.addColorStop(0, color);
    finGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = finGrad;
    
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.bezierCurveTo(size * 0.4, side * size * 2.8, -size * 0.8, side * size * 2.5, -size * 0.5, 0);
    ctx.fill();
    
    // Fin rays (Biological structure)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    for(let i=0; i<3; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 0.2, side * size * 2.0); ctx.stroke();
    }
    ctx.restore();
  };
  drawVerticalFin(-1); // Dorsal
  drawVerticalFin(1);  // Anal

  // === 5. PECTORAL FIN (Tiny side fin) ===
  ctx.save();
  ctx.translate(size * 0.2, size * 0.1);
  ctx.rotate(Math.sin(time * 2) * 0.3);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.15, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === 6. HEAD & SENSES ===
  // Detailed Eye (Puffy sunfish eye)
  const eyeX = size * 0.7, eyeY = -size * 0.35;
  ctx.fillStyle = '#f8fafc'; // Sclera
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b'; // Pupil
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.14, 0, Math.PI * 2); ctx.fill();
  // Reflection
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();

  // Puckered Small Mouth
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = size * 0.1;
  ctx.beginPath();
  ctx.arc(size * 1.15, 0, size * 0.18, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();

  // Skin Texture (Rough patches/Parasites - common on Mola)
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for(let i=0; i<15; i++) {
    const rx = (Math.sin(i * 1.5) * size * 0.9);
    const ry = (Math.cos(i * 2.2) * size * 1.3);
    const rSize = size * (0.05 + (Math.sin(i * 0.8) + 1) * 0.05); // Deterministic size
    ctx.beginPath(); ctx.arc(rx, ry, rSize, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
};

export const drawSeahorse = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  // Seahorse đứng thẳng, sau rotate +90° thì đầu hướng phải
  ctx.rotate(Math.PI / 2);

  const pulse = Math.sin(frameCount * 0.4);
  const finVib = Math.sin(frameCount * 0.5) * 0.25;

  const bodyGrad = ctx.createLinearGradient(-size * 0.6, -size * 1.2, size * 0.6, size * 2.5);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.35, '#fcd34d');
  bodyGrad.addColorStop(0.65, color);
  bodyGrad.addColorStop(1, '#7c2d12');

  // === THÂN (filled bezier, phình ở ngực, thon xuống) ===
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.55, -size * 0.45);    // cổ phải
  ctx.bezierCurveTo(size * 0.85, size * 0.2, size * 0.72, size * 0.75, size * 0.35, size * 1.0);
  ctx.quadraticCurveTo(size * 0.1, size * 1.15, -size * 0.05, size * 1.0);
  ctx.bezierCurveTo(-size * 0.68, size * 0.75, -size * 0.82, size * 0.2, -size * 0.52, -size * 0.45);
  ctx.quadraticCurveTo(0, -size * 0.65, size * 0.55, -size * 0.45);
  ctx.fill();

  // === SEGMENTS (xương vòng cứng đặc trưng) ===
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = size * 0.04;
  for (let i = 0; i < 8; i++) {
    const sy = -size * 0.35 + i * size * 0.175;
    const halfW = size * (0.55 - i * 0.012);
    ctx.beginPath();
    ctx.ellipse(0, sy, halfW, size * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === ĐUÔI xoắn bezier có taper ===
  // Vẽ filled shape bên phải rồi bên trái để tạo độ dày giảm dần
  const tailSteps = 14;
  for (let i = tailSteps; i >= 1; i--) {
    const t = 1 - i / tailSteps;
    const angle = t * Math.PI * 1.7; // xoắn 306°
    const r = size * (1.0 - t * 0.82); // bán kính giảm
    const cx2 = size * 0.18;
    const cy2 = size * 1.05;
    const px = cx2 + Math.cos(Math.PI * 0.5 + angle) * r * 0.55;
    const py = cy2 + Math.sin(Math.PI * 0.5 + angle) * r * 0.6;
    const pw = size * (0.38 - t * 0.35); // độ dày taper
    ctx.strokeStyle = bodyGrad;
    ctx.lineWidth = pw;
    ctx.lineCap = 'round';
    if (i === tailSteps) {
      ctx.beginPath();
      ctx.moveTo(cx2, cy2);
    }
    ctx.beginPath();
    ctx.moveTo(
      cx2 + Math.cos(Math.PI * 0.5 + (t - 1/tailSteps) * Math.PI * 1.7) * size * (1 - (t - 1/tailSteps) * 0.82) * 0.55,
      cy2 + Math.sin(Math.PI * 0.5 + (t - 1/tailSteps) * Math.PI * 1.7) * size * (1 - (t - 1/tailSteps) * 0.82) * 0.6
    );
    ctx.lineTo(px, py);
    ctx.stroke();
  }

  // === ĐẦU ===
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.85, size * 0.48, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // === CORONET (vương miện gai) ===
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI * 0.75 + (i / 4) * Math.PI * 0.5;
    const bx = Math.cos(ang) * size * 0.42;
    const by = -size * 0.85 + Math.sin(ang) * size * 0.42;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(ang) * size * 0.28, by + Math.sin(ang) * size * 0.28);
    ctx.stroke();
  }

  // === MÕM ỐNG ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.72);
  ctx.bezierCurveTo(size * 0.85, -size * 1.1, size * 0.9, -size * 1.55, size * 0.55, -size * 1.72);
  ctx.bezierCurveTo(size * 0.3, -size * 1.58, size * 0.28, -size * 1.15, size * 0.3, -size * 0.72);
  ctx.fill();

  // === VÂY LƯNG rung ===
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, size * 0.15);
  ctx.quadraticCurveTo(-size * (0.85 + finVib * 0.3), -size * 0.2, -size * 0.38, -size * 0.45);
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.15, -size * 0.38, size * 0.15);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // === MẮT (scale theo size) ===
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(size * 0.26, -size * 1.02, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(size * 0.3, -size * 1.02, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size * 0.34, -size * 1.05, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const drawDragon = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const segments = 24; 
  const time = frameCount * 0.05;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;

  // === BODY (Serpentine Segmented Body with Scale Lighting) ===
  for(let i=0; i<segments; i++) {
    const t = i / (segments - 1);
    const segX = -size * 5.0 + (i * size * 9.5 / segments);
    const wave = Math.sin(time + i * 0.35);
    const segY = wave * size * 1.6;
    const segSize = size * (0.85 + Math.sin(t * Math.PI) * 0.45) * (1 - t * 0.4);
    
    ctx.save();
    ctx.translate(segX, segY);
    ctx.rotate(wave * 0.25);

    // Realistic Scale Gradient
    const segGrad = ctx.createRadialGradient(-segSize * 0.2, -segSize * 0.3, segSize * 0.1, 0, 0, segSize);
    segGrad.addColorStop(0, '#fef3c7'); // Specular highlight
    segGrad.addColorStop(0.3, color);
    segGrad.addColorStop(0.7, color);
    segGrad.addColorStop(1, '#1e1b4b'); // Deep shadow

    ctx.fillStyle = segGrad;
    // Overlapping Scale Shape
    ctx.beginPath();
    ctx.moveTo(segSize * 1.2, 0);
    ctx.bezierCurveTo(segSize * 0.8, segSize, -segSize * 0.8, segSize, -segSize * 1.2, 0);
    ctx.bezierCurveTo(-segSize * 0.8, -segSize, segSize * 0.8, -segSize, segSize * 1.2, 0);
    ctx.fill();
    
    // Scale Rim/Outline for texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dorsal Fins (Elegant flowing ribbons)
    if (i % 3 === 0) {
      const finTime = time + i * 0.2;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, -segSize * 0.8);
      ctx.bezierCurveTo(
        -segSize * 0.5, -segSize * 2.5 + Math.sin(finTime) * 10, 
        -segSize * 2.5, -segSize * 2.2 + Math.cos(finTime) * 15, 
        -segSize * 1.2, -segSize * 0.5
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // === HEAD (Detailed Majesty) ===
  const headX = size * 4.5;
  const headWave = Math.sin(time + segments * 0.35);
  const headY = headWave * size * 1.6;
  
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headWave * 0.15);

  const headGrad = ctx.createRadialGradient(size * 0.5, -size * 0.5, size * 0.2, 0, 0, size * 2.2);
  headGrad.addColorStop(0, '#fde68a');
  headGrad.addColorStop(0.4, color);
  headGrad.addColorStop(1, '#450a0a');
  
  ctx.fillStyle = headGrad;
  // Complex Head Shape (Brow, Snout, Jaw)
  ctx.beginPath();
  ctx.moveTo(size * 2.2, 0); // Nose
  ctx.bezierCurveTo(size * 1.8, -size * 1.8, -size * 0.5, -size * 2.2, -size * 1.8, -size * 0.8); // Brow to back
  ctx.lineTo(-size * 1.8, size * 0.8); // Back of head
  ctx.bezierCurveTo(-size * 0.5, size * 2.2, size * 1.8, size * 1.8, size * 2.2, 0); // Jaw to nose
  ctx.fill();

  // Dragon Mane (Voluminous translucent hair)
  for(let i=0; i<12; i++) {
    const angle = Math.PI + (i/11) * Math.PI - 0.5;
    const waveShift = Math.sin(time * 1.5 + i * 0.5) * 5;
    const maneGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * size * 4, Math.sin(angle) * size * 4);
    maneGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    maneGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = maneGrad;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.quadraticCurveTo(
        Math.cos(angle) * size * (3.5 + waveShift * 0.1), 
        Math.sin(angle) * size * (3.5 + waveShift * 0.1), 
        Math.cos(angle + 0.1) * size * 2, 
        Math.sin(angle + 0.1) * size * 2
    );
    ctx.fill();
  }

  // Antlers (Symmetric & Layered)
  const drawAntler = (side: number) => {
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = size * 0.25;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fcd34d';
    
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, side * size * 1.2);
    ctx.bezierCurveTo(-size * 2.0, side * size * 3.5, -size * 4.0, side * size * 3.2, -size * 4.5, side * size * 4.0);
    // Tines
    ctx.moveTo(-size * 2.2, side * size * 2.8);
    ctx.lineTo(-size * 1.8, side * size * 4.0);
    ctx.moveTo(-size * 3.2, side * size * 3.2);
    ctx.lineTo(-size * 2.8, side * size * 4.2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };
  drawAntler(-1);
  drawAntler(1);

  // Whiskers (Spring-like flow)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = size * 0.15;
  const whiskWave = Math.sin(time * 1.2);
  
  const drawWhisker = (side: number) => {
    ctx.beginPath();
    ctx.moveTo(size * 1.8, side * size * 0.3);
    ctx.bezierCurveTo(
        size * 3.5, side * size * 2.5, 
        -size * 1.5, side * size * 5.0 + whiskWave * size * 10, 
        -size * 4.0, side * size * 4.5 + whiskWave * size * 5
    );
    ctx.stroke();
  };
  drawWhisker(-1);
  drawWhisker(1);

  // Intelligent Glowing Eyes
  // Note: Already translated and rotated to head coordinates at line 404-405
  const drawEye = (side: number) => {
    ctx.save();
    ctx.translate(size * 0.8, side * size * 0.6);
    // Glow
    ctx.shadowBlur = 25; ctx.shadowColor = '#fef08a';
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.25, side * 0.2, 0, Math.PI * 2); ctx.fill();
    // Pupil
    ctx.shadowBlur = 0; ctx.fillStyle = '#450a0a';
    ctx.beginPath(); ctx.arc(size * 0.1, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  drawEye(-1);
  drawEye(1);

  ctx.restore(); // Restore head transform
  ctx.restore(); // Restore global transform (from line 346)
};

export const drawKraken = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  const pulse = Math.sin(time * 0.8) * 0.12;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.8;

  // === TENTACLES (High Detail with Suckers) ===
  const numTentacles = 8;
  for (let i = 0; i < numTentacles; i++) {
    const angle = (i / numTentacles) * Math.PI * 2 + Math.sin(time + i) * 0.35;
    const len = size * (2.8 + Math.sin(time * 1.1 + i) * 0.6);
    
    ctx.save();
    ctx.rotate(angle);
    
    const tentacleGrad = ctx.createLinearGradient(size * 0.5, 0, len, 0);
    tentacleGrad.addColorStop(0, color);
    tentacleGrad.addColorStop(1, '#1e1b4b');
    ctx.strokeStyle = tentacleGrad;
    ctx.lineWidth = size * 0.55;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    const cp1x = size * 1.8;
    const cp1y = Math.sin(time * 1.5 + i) * size * 1.5;
    const endX = len;
    const endY = Math.cos(time + i) * size * 0.8;
    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    ctx.stroke();

    // High-Detail Suckers
    for (let j = 1; j <= 6; j++) {
      const t = j / 7;
      const sx = size * 0.5 + (len - size * 0.5) * t;
      const sy = cp1y * (1-t) + endY * t + size * 0.25; 
      
      ctx.save();
      ctx.translate(sx, sy);
      // Sucker Rim
      ctx.fillStyle = '#f9a8d4';
      ctx.beginPath(); ctx.arc(0, 0, size * 0.15 * (1 - t * 0.5), 0, Math.PI * 2); ctx.fill();
      // Sucker Hole (Depth)
      ctx.fillStyle = '#9d174d';
      ctx.beginPath(); ctx.arc(0, 0, size * 0.08 * (1 - t * 0.5), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // === MANTLE (Textured Skin) ===
  const mantleGrad = ctx.createRadialGradient(-size * 0.3, -size * 0.4, size * 0.2, 0, 0, size * 2.0);
  mantleGrad.addColorStop(0, '#f472b6'); // Highlight
  mantleGrad.addColorStop(0.5, color);
  mantleGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.6, size * (1.3 + pulse), 0, 0, Math.PI * 2);
  ctx.fill();

  // Skin Texture (Spots & Veins)
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for(let i=0; i<15; i++) {
    const rx = (Math.sin(i * 1.5) * size * 1.2);
    const ry = (Math.cos(i * 2.5) * size * 0.8);
    const rSize = size * 0.12 * ((Math.sin(i * 0.5) + 1) * 0.5);
    ctx.beginPath(); ctx.arc(rx, ry, rSize, 0, Math.PI * 2); ctx.fill();
  }

  // Intelligent Eyes (Layered Depth)
  const drawEye = (side: number) => {
    const eyeX = size * 0.7, eyeY = side * size * 0.55;
    ctx.save();
    ctx.translate(eyeX, eyeY);
    // Sclera Glow
    ctx.shadowBlur = 20; ctx.shadowColor = '#fef08a';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.42, size * 0.28, side * 0.2, 0, Math.PI * 2); ctx.fill();
    // Iris
    ctx.shadowBlur = 0; ctx.fillStyle = '#450a0a';
    ctx.beginPath(); ctx.arc(size * 0.05, 0, size * 0.22, 0, Math.PI * 2); ctx.fill();
    // Slit Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.ellipse(size * 0.1, 0, size * 0.06, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    // Reflection
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(-size * 0.1, -size * 0.05, size * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  drawEye(-1); drawEye(1);

  ctx.restore();
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
  const time = frameCount * 0.05;
  
  ctx.save();
  ctx.rotate(wag * 0.5);

  // 1. SLEEK APEX PREDATOR BODY
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#020617'); // Pitch black dorsal
  bodyGrad.addColorStop(0.5, '#0f172a');
  bodyGrad.addColorStop(0.7, '#1e293b');
  bodyGrad.addColorStop(1, '#f8fafc'); // White ventral (belly)

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 3.0, 0); // Snout
  ctx.bezierCurveTo(size * 1.5, -size * 2.2, -size * 1.5, -size * 1.8, -size * 3.5, 0); // Back
  ctx.bezierCurveTo(-size * 1.5, size * 1.8, size * 1.5, size * 1.6, size * 3.0, 0); // Belly
  ctx.fill();

  // 2. ORGANIC WHITE MARKINGS
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop'; // Only draw on top of body
  ctx.fillStyle = 'white';
  
  // Belly patch (extends from chin to vent)
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.8, size * 2.5, size * 0.6, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye patch (Iconic white spot)
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.ellipse(size * 1.8, -size * 0.4, size * 0.7, size * 0.3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Saddle patch (Grayish-white behind dorsal)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-size * 1.0, -size * 0.8, size * 1.0, size * 0.3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. MASSIVE DORSAL FIN (Killer Whale signature)
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 1.2);
  ctx.bezierCurveTo(-size * 0.2, -size * 3.5, -size * 1.8, -size * 3.2, -size * 1.2, -size * 1.0);
  ctx.fill();

  // 4. PADDLE-LIKE PECTORAL FINS
  const drawOrcaPec = (side: number) => {
    ctx.save();
    ctx.translate(size * 1.2, side * size * 0.6);
    ctx.rotate(side * (0.4 + Math.sin(time) * 0.1));
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, side * size * 2.0, -size * 1.2, side * size * 1.8, -size * 0.8, 0);
    ctx.fill();
    ctx.restore();
  };
  drawOrcaPec(-1);
  drawOrcaPec(1);

  // 5. POWERFUL HORIZONTAL FLUKE (Tail)
  ctx.save();
  ctx.translate(-size * 3.5, 0);
  ctx.rotate(Math.sin(frameCount * wagFreq * 2) * 0.3);
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 2.2, -size * 2.5, -size * 2.5, -size * 1.8, 0);
  ctx.bezierCurveTo(-size * 2.5, size * 2.5, -size * 1.0, size * 2.2, 0, 0);
  ctx.fill();
  ctx.restore();

  // 6. EYE (Small, intelligent)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 2.2, -size * 0.1, size * 0.1, 0, Math.PI * 2); ctx.fill();
  // Small reflection
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 2.25, -size * 0.12, size * 0.03, 0, Math.PI * 2); ctx.fill();

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

  // === THÂN: bezier đẹp hơn ellipse thuần ===
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.1, 0, size * 1.1);
  const stripeCount = 8;
  for (let j = 0; j <= stripeCount; j++) {
    bodyGrad.addColorStop(j / stripeCount, j % 2 === 0 ? color : 'rgba(255,255,255,0.85)');
  }
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.3, 0);
  ctx.bezierCurveTo(size * 0.9, -size * 0.85, -size * 0.4, -size * 0.9, -size * 1.2, 0);
  ctx.bezierCurveTo(-size * 0.4, size * 0.75, size * 0.9, size * 0.75, size * 1.3, 0);
  ctx.fill();

  // Belly highlight
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(size * 1.1, size * 0.05);
  ctx.quadraticCurveTo(0, size * 0.65, -size * 1.0, size * 0.05);
  ctx.quadraticCurveTo(0, size * 0.3, size * 1.1, size * 0.05);
  ctx.fill();
  ctx.restore();

  // === GAI LƯİNG (dorsal): chỉ từ phía sau đầu đến đuôi, trên lưng ===
  // Góc: từ -π*0.85 đến -π*0.05 (nửa trên)
  const dorsalCount = 10;
  for (let i = 0; i < dorsalCount; i++) {
    const angle = -Math.PI * 0.85 + (i / (dorsalCount - 1)) * Math.PI * 0.8;
    const baseR = i < 3 ? size * 0.7 : size * 0.85; // gốc gai trên bề mặt thân
    const spineLen = size * (0.6 + Math.sin(frameCount * 0.1 + i * 0.7) * 0.25);
    const bx = Math.cos(angle) * baseR * (i < 3 ? 0.9 : 1.0);
    const by = Math.sin(angle) * baseR * 0.85;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.065;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle) * spineLen, by + Math.sin(angle) * spineLen);
    ctx.stroke();
    // Membrane giữa các gai lưng
    if (i < dorsalCount - 1) {
      const angle2 = -Math.PI * 0.85 + ((i + 1) / (dorsalCount - 1)) * Math.PI * 0.8;
      const spineLen2 = size * (0.6 + Math.sin(frameCount * 0.1 + (i + 1) * 0.7) * 0.25);
      ctx.fillStyle = `${color}55`;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(angle) * spineLen, by + Math.sin(angle) * spineLen);
      ctx.lineTo(
        Math.cos(angle2) * baseR + Math.cos(angle2) * spineLen2,
        Math.sin(angle2) * baseR * 0.85 + Math.sin(angle2) * spineLen2
      );
      ctx.lineTo(Math.cos(angle2) * baseR, Math.sin(angle2) * baseR * 0.85);
      ctx.fill();
    }
    // Đầu gai phát sáng
    ctx.fillStyle = 'rgba(255,200,200,0.9)';
    ctx.beginPath();
    ctx.arc(bx + Math.cos(angle) * spineLen, by + Math.sin(angle) * spineLen, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // === GAI BỤNG (anal spines): góc từ π*0.05 đến π*0.65 ===
  const analCount = 5;
  for (let i = 0; i < analCount; i++) {
    const angle = Math.PI * 0.1 + (i / (analCount - 1)) * Math.PI * 0.55;
    const spineLen = size * (0.4 + Math.sin(frameCount * 0.08 + i * 1.1) * 0.15);
    const bx = Math.cos(angle) * size * 0.82;
    const by = Math.sin(angle) * size * 0.72;
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle) * spineLen, by + Math.sin(angle) * spineLen);
    ctx.stroke();
  }

  // === VÂY NGỰC (pectoral) rộng như cánh ===
  ctx.fillStyle = `${color}99`;
  ctx.beginPath();
  ctx.moveTo(size * 0.4, size * 0.1);
  ctx.bezierCurveTo(size * 0.2, size * 1.2, -size * 0.5, size * 1.6, -size * 0.8, size * 1.2);
  ctx.bezierCurveTo(-size * 0.3, size * 0.8, size * 0.1, size * 0.5, size * 0.4, size * 0.1);
  ctx.fill();
  // Gai trong vây
  ctx.strokeStyle = `${color}cc`;
  ctx.lineWidth = size * 0.04;
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5;
    ctx.beginPath();
    ctx.moveTo(size * 0.4 - t * size * 0.3, size * 0.1 + t * size * 0.1);
    ctx.lineTo(-size * 0.8 * t, size * 1.2 * t + size * 0.1);
    ctx.stroke();
  }

  // === ĐUÔI ===
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp * 1.5;
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.7, -size * 0.9, -size * 0.5);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.3, 0);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.9, size * 0.5);
  ctx.quadraticCurveTo(-size * 0.4, size * 0.7, 0, 0);
  ctx.fill();
  ctx.restore();

  // === MẮT ===
  const eyeX = size * 1.0;
  const eyeY = -size * 0.15;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.06, size * 0.04, 0, Math.PI * 2); ctx.fill();

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
  // abs() — cánh không bao giờ biến mất hoàn toàn
  const wingFlap = Math.abs(Math.sin(frameCount * 0.22)) * 0.85 + 0.15;

  ctx.save();
  ctx.rotate(wag);

  // === THÂN: bezier thôn, không phải ellipse đơn ===
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.6);
  bodyGrad.addColorStop(0, '#93c5fd');
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.75, '#1d4ed8');
  bodyGrad.addColorStop(1, '#1e3a8a');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0);
  ctx.bezierCurveTo(size * 1.2, -size * 0.5, -size * 0.6, -size * 0.45, -size * 1.4, 0);
  ctx.bezierCurveTo(-size * 0.6, size * 0.38, size * 1.2, size * 0.42, size * 1.8, 0);
  ctx.fill();

  // Lateral stripe
  ctx.strokeStyle = 'rgba(147,197,253,0.5)';
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.bezierCurveTo(size * 0.5, -size * 0.15, -size * 0.5, -size * 0.12, -size * 1.2, 0);
  ctx.stroke();

  // === CÁNH TRÊN (pectoral wing, phần lưng) ===
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.scale(1, wingFlap);
  const wingGrad = ctx.createLinearGradient(size * 0.5, 0, -size * 1.5, -size * 2.5);
  wingGrad.addColorStop(0, 'rgba(219,234,254,0.9)');
  wingGrad.addColorStop(0.5, 'rgba(147,197,253,0.7)');
  wingGrad.addColorStop(1, 'rgba(29,78,216,0.3)');
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.6, -size * 0.1);
  ctx.bezierCurveTo(size * 0.3, -size * 1.5, -size * 0.3, -size * 2.6, -size * 1.5, -size * 0.7);
  ctx.bezierCurveTo(-size * 0.8, -size * 0.3, size * 0.1, -size * 0.15, size * 0.6, -size * 0.1);
  ctx.fill();
  // Gân cánh (wing veins)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = size * 0.03;
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5;
    ctx.beginPath();
    ctx.moveTo(size * 0.6, -size * 0.1);
    ctx.quadraticCurveTo(
      size * 0.1 - t * size * 0.8, -size * 1.2 * t,
      -size * 1.5 * t, -size * 0.7 * t
    );
    ctx.stroke();
  }
  ctx.restore();

  // === CÁNH DƯỚI (mirror of top wing) ===
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.scale(1, -wingFlap * 0.75); // cánh dưới nhỏ hơn một chút
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.1);
  ctx.bezierCurveTo(size * 0.2, -size * 1.3, -size * 0.4, -size * 2.0, -size * 1.3, -size * 0.6);
  ctx.bezierCurveTo(-size * 0.7, -size * 0.25, size * 0.1, -size * 0.12, size * 0.5, -size * 0.1);
  ctx.fill();
  ctx.restore();

  // === ĐUÔI chẻ (forked tail) ===
  const tailWag = Math.sin(frameCount * wagFreq * 1.5) * wagAmp * 2.0;
  ctx.save();
  ctx.translate(-size * 1.4, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = bodyGrad;
  // Ló trên
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.6, -size * 1.0, -size * 0.9);
  ctx.quadraticCurveTo(-size * 0.7, -size * 0.3, -size * 0.3, 0);
  ctx.fill();
  // Ló dưới
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.4, size * 0.6, -size * 1.0, size * 0.9);
  ctx.quadraticCurveTo(-size * 0.7, size * 0.3, -size * 0.3, 0);
  ctx.fill();
  ctx.restore();

  // === MẮT ===
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(size * 1.5, -size * 0.1, size * 0.14, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 1.55, -size * 0.1, size * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.59, -size * 0.13, size * 0.025, 0, Math.PI * 2); ctx.fill();

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
  // Dùng Math.sin() thay Math.random() — spike ổn định, không nhấp nháy
  if (isStruggling) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      // Chiều dài spike dao động theo sin() với phase riêng mỗi gai — không random
      const len = 6 + Math.sin(frameCount * 0.4 + i * 0.8) * 3;
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
  const bob = Math.sin(frameCount * 0.07) * size * 0.4;
  const lurePulse = (Math.sin(frameCount * 0.1) + 1) * 0.5;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.6;
  ctx.shadowOffsetY = size * 0.3;

  // Gradient: đầu sáng hơn, đuôi tối dần
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.2, 0, size * 1.0);
  bodyGrad.addColorStop(0, '#1e0533');
  bodyGrad.addColorStop(0.3, '#2d1b69');
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#000');

  // === THÂN CHÍNH: há miệng (gaping mouth) ===
  ctx.beginPath();
  ctx.moveTo(size * 1.2, -size * 0.3); // Môi trên
  // Lưng và đuôi
  ctx.bezierCurveTo(size * 0.8, -size * 1.4, -size * 0.8, -size * 1.2, -size * 1.6, 0); 
  // Bụng đến môi dưới
  ctx.bezierCurveTo(-size * 0.8, size * 1.2, size * 0.8, size * 1.4, size * 1.3, size * 0.6); 
  // Viền miệng dưới (từ môi dưới vào khóe miệng)
  ctx.quadraticCurveTo(size * 0.6, size * 0.5, size * 0.4, size * 0.15); 
  // Viền miệng trên (từ khóe miệng ra môi trên)
  ctx.quadraticCurveTo(size * 0.6, -size * 0.2, size * 1.2, -size * 0.3); 
  ctx.closePath();
  
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Reset shadow! Tránh lỗi bóng mắt đỏ và lồng đèn bị lệch xuống dưới
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  // Ánh bụng bioluminescent
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.moveTo(size * 0.9, size * 0.5);
  ctx.bezierCurveTo(size * 0.3, size * 0.9, -size * 0.8, size * 0.7, -size * 1.3, size * 0.1);
  ctx.bezierCurveTo(-size * 0.8, size * 0.5, size * 0.3, size * 0.65, size * 0.9, size * 0.5);
  ctx.fill();
  ctx.restore();

  // === RĂNG TRÊN (chỉa xuống, bám viền miệng trên) ===
  ctx.fillStyle = '#dde3f0';
  for (let i = 0; i < 5; i++) {
    const t = i / 4; // 0 to 1
    const base_x = size * 1.15 - t * size * 0.7; 
    const base_y = -size * 0.25 + t * size * 0.35; 
    const tipLen = size * (0.35 - t * 0.15);
    
    ctx.beginPath();
    ctx.moveTo(base_x - size * 0.05, base_y);
    ctx.lineTo(base_x + size * 0.02, base_y + tipLen); // đâm xuống
    ctx.lineTo(base_x + size * 0.07, base_y);
    ctx.fill();
  }

  // === RĂNG DƯỚI (chỉa lên, bám viền miệng dưới) ===
  for (let i = 0; i < 4; i++) {
    const t = i / 3; // 0 to 1
    const base_x = size * 1.25 - t * size * 0.75; 
    const base_y = size * 0.55 - t * size * 0.35; 
    const tipLen = size * (0.3 - t * 0.15);
    
    ctx.beginPath();
    ctx.moveTo(base_x - size * 0.05, base_y);
    ctx.lineTo(base_x + size * 0.02, base_y - tipLen); // đâm lên
    ctx.lineTo(base_x + size * 0.07, base_y);
    ctx.fill();
  }

  // === VÂY NGỰC nhỏ ===
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.2, size * 1.4, -size * 0.6, size * 1.1);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.9, size * 0.2, size * 0.6);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // === ILLICIUM (râu anten) ===
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.6, -size * 0.9);
  ctx.bezierCurveTo(size * 1.0, -size * 1.9, size * 2.3, -size * 1.6, size * 2.1, -size * 0.3 + bob);
  ctx.stroke();

  // === LURE phát sáng ===
  const lureX = size * 2.1;
  const lureY = -size * 0.3 + bob;
  ctx.shadowBlur = 25 + lurePulse * 20;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = `rgba(254,240,138,${0.8 + lurePulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(lureX, lureY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(lureX - size * 0.06, lureY - size * 0.06, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // === MẮT đỏ rùng rợn ===
  const eyeX = size * 0.55;
  const eyeY = -size * 0.35;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#f87171';
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(eyeX + size * 0.04, eyeY, size * 0.07, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(eyeX + size * 0.08, eyeY - size * 0.06, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const drawTadpole = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  // 1. Head: Large round head (~60% of total length)
  const headX = size * 0.3;
  const headR = size * 1.0;
  
  const headGrad = ctx.createRadialGradient(headX - size * 0.2, -size * 0.2, 0, headX, 0, headR);
  headGrad.addColorStop(0, '#94a3b8'); // Pale green/grey center
  headGrad.addColorStop(1, color);    // Darker edge matching color
  
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(headX, 0, headR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Translucent belly: showing gut/internal structure
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(headX, size * 0.2, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Tail: Flat, ribbon-like, filled bezier shape (wiggles in sine wave)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  
  const tailBaseX = -size * 0.5;
  const tailTipX = -size * 3.0;
  
  ctx.moveTo(tailBaseX, -size * 0.2);
  
  // Top edge of tail
  for (let x = tailBaseX; x >= tailTipX; x -= size * 0.2) {
    const t = (x - tailBaseX) / (tailTipX - tailBaseX);
    const yWave = Math.sin(frameCount * 0.3 - x * 0.5) * size * 0.5 * t;
    const thickness = size * 0.3 * (1 - t);
    ctx.lineTo(x, yWave - thickness);
  }
  
  // Bottom edge of tail
  for (let x = tailTipX; x <= tailBaseX; x += size * 0.2) {
    const t = (x - tailBaseX) / (tailTipX - tailBaseX);
    const yWave = Math.sin(frameCount * 0.3 - x * 0.5) * size * 0.5 * t;
    const thickness = size * 0.3 * (1 - t);
    ctx.lineTo(x, yWave + thickness);
  }
  ctx.closePath();
  ctx.fill();

  // 4. Eyes: 2 small black dots on the sides
  ctx.globalAlpha = 1.0;
  const drawEye = (side: number) => {
    const ex = size * 0.8;
    const ey = side * size * 0.5;
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(ex, ey, size * 0.12, 0, Math.PI * 2); ctx.fill();
    // Catchlight
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(ex + size * 0.04, ey - size * 0.04, size * 0.03, 0, Math.PI * 2); ctx.fill();
  };
  drawEye(-1);
  drawEye(1);
  
  // 5. Tiny mouth at front
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(size * 1.3, 0, size * 0.08, 0, Math.PI);
  ctx.stroke();

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
  
  // 1. Wiggling Tentacles (Fan spread from bottom)
  ctx.lineCap = 'round';
  const numTentacles = 8;
  const startAngle = Math.PI * 0.1;
  const endAngle = Math.PI * 0.9;
  
  for (let i = 0; i < numTentacles; i++) {
    const angle = startAngle + (i / (numTentacles - 1)) * (endAngle - startAngle);
    const wag = Math.sin(frameCount * 0.1 + i * 1.2);
    
    // Tentacle bases originate from the BOTTOM of the mantle
    const bx = size * 0.2 + Math.cos(angle) * size * 0.3;
    const by = size * 0.6 + Math.sin(angle) * size * 0.2;
    
    const tentacleSteps = 10;
    let px = bx;
    let py = by;
    ctx.strokeStyle = color;
    for (let j = 1; j <= tentacleSteps; j++) {
      const t = j / tentacleSteps;
      const tLen = size * 2.5 * (1/tentacleSteps);
      const curAngle = angle + Math.PI/2 + wag * t * 1.5; 
      
      const nx = px + Math.cos(curAngle) * tLen;
      const ny = py + Math.sin(curAngle) * tLen;
      
      ctx.lineWidth = size * 0.35 * (1 - t * 0.8);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
      
      // Suckers (concave side)
      const suckerAngle = curAngle + Math.PI / 2;
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(px + Math.cos(suckerAngle) * (ctx.lineWidth * 0.4), 
              py + Math.sin(suckerAngle) * (ctx.lineWidth * 0.4), 
              ctx.lineWidth * 0.25, 0, Math.PI * 2);
      ctx.fill();

      px = nx;
      py = ny;
    }
  }

  // 2. Head/Mantle (Bulbous bag)
  ctx.beginPath();
  ctx.ellipse(size * 0.4, -size * 0.2, size * 1.2, size * 1.0 + pulse * size * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // 3. Mantle Texture (Darker spots)
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
  for (let i = 0; i < 5; i++) {
    const sx = size * 0.4 + Math.cos(i * 1.2) * size * 0.6;
    const sy = -size * 0.2 + Math.sin(i * 1.2) * size * 0.5;
    ctx.beginPath(); ctx.arc(sx, sy, size * (0.1 + i * 0.02), 0, Math.PI * 2); ctx.fill();
  }

  // 4. Siphon (Small tube at side)
  ctx.beginPath();
  ctx.ellipse(size * 0.8, size * 0.3, size * 0.08, size * 0.15, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.stroke();

  // 5. Eyes (Front facing)
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.0, 0, size * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.1, -size * 0.4, size * 0.22, 0, Math.PI * 2); ctx.fill();
  
  // 6. Pupils (Horizontal slits)
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.ellipse(size * 1.05, 0, size * 0.05, size * 0.12, Math.PI/2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 1.15, -size * 0.4, size * 0.05, size * 0.12, Math.PI/2, 0, Math.PI * 2); ctx.fill();
  
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
  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  const time = frameCount * 0.05;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;

  // 1. Better Gradient for rugged skin
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.0, 0, size * 1.2);
  bodyGrad.addColorStop(0, '#064e3b'); // Dark forest green
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.7, '#022c22');
  bodyGrad.addColorStop(1, '#111827'); // Deep dark belly

  // === 1. LEGS (Drawn behind body) ===
  const drawLeg = (lx: number, ly: number, legIndex: number) => {
    const legWag = Math.sin(frameCount * 0.12 + legIndex * 1.5) * 0.25;
    const side = ly > 0 ? 1 : -1;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(side * (0.6 + legWag));
    
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = size * 0.3; // Much thicker
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.7, side * size * 0.3); // Thigh
    ctx.stroke();
    
    ctx.lineWidth = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(size * 0.7, side * size * 0.3);
    ctx.lineTo(size * 1.2, side * size * 0.8); // Calf
    ctx.stroke();
    
    // Foot/Claws
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.ellipse(size * 1.3, side * size * 0.8, size * 0.3, size * 0.15, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  
  // Rear legs (Behind body)
  drawLeg(-size * 1.2, -size * 0.5, 2); 
  drawLeg(-size * 1.2, size * 0.5, 3);

  // === 2. BODY (Continuous rugged shape) ===
  ctx.beginPath();
  ctx.moveTo(-size * 3.5, 0); // Tail base
  // Top edge with slight "bumps" for a rugged look
  for (let x = -size * 3.5; x <= size * 2.0; x += size * 0.5) {
    const t = (x + size * 3.5) / (size * 5.5);
    const bump = Math.sin(x * 2.0) * size * 0.05;
    const h = -size * (0.2 + Math.sin(t * Math.PI) * 0.7) + bump;
    ctx.lineTo(x, h);
  }
  ctx.lineTo(size * 2.0, -size * 0.6);
  ctx.lineTo(size * 2.0, size * 0.6);
  // Bottom edge
  for (let x = size * 2.0; x >= -size * 3.5; x -= size * 0.5) {
    const t = (x + size * 3.5) / (size * 5.5);
    const h = size * (0.2 + Math.sin(t * Math.PI) * 0.7);
    ctx.lineTo(x, h);
  }
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Texture: Alligator spots
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#020617';
  for(let i=0; i<15; i++) {
    const rx = (Math.sin(i * 123) * size * 2.5) - size * 0.5;
    const ry = (Math.cos(i * 88) * size * 0.4);
    ctx.beginPath(); ctx.arc(rx, ry, size * 0.25, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // === 3. SCUTES (Rugged rectangular plates) ===
  ctx.fillStyle = '#020617';
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const scuteX = -size * 2.8 + t * size * 4.5;
    const bodyH = size * (0.3 + Math.sin(t * Math.PI) * 0.6);
    
    ctx.beginPath();
    ctx.moveTo(scuteX - size * 0.2, -bodyH * 0.9);
    ctx.lineTo(scuteX, -bodyH * 1.4); // Peak
    ctx.lineTo(scuteX + size * 0.2, -bodyH * 0.9);
    ctx.fill();
  }

  // === 4. TAIL (Heavy and wagging) ===
  ctx.save();
  ctx.translate(-size * 3.5, 0);
  ctx.rotate(wag * 1.2);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.bezierCurveTo(-size * 1.5, -size * 0.4, -size * 3.0, -size * 0.3, -size * 4.5, 0);
  ctx.bezierCurveTo(-size * 3.0, size * 0.3, -size * 1.5, size * 0.4, 0, size * 0.2);
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  // Tail scutes
  ctx.fillStyle = '#020617';
  for(let i=0; i<4; i++) {
    ctx.beginPath();
    ctx.arc(-size * (1 + i), 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === 5. FRONT LEGS (Drawn on top) ===
  drawLeg(size * 0.8, -size * 0.6, 0); 
  drawLeg(size * 0.8, size * 0.6, 1);

  // === 6. HEAD (Predator jaw) ===
  ctx.save();
  ctx.translate(size * 2.0, 0);
  ctx.rotate(wag * 0.15);

  ctx.fillStyle = bodyGrad;
  // Upper jaw (Heavier)
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.bezierCurveTo(size * 1.2, -size * 1.0, size * 2.2, -size * 0.6, size * 2.5, 0);
  ctx.lineTo(size * 2.5, size * 0.08);
  ctx.lineTo(0, size * 0.08);
  ctx.fill();
  
  // Lower jaw
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  ctx.bezierCurveTo(size * 1.2, size * 0.8, size * 2.2, size * 0.5, size * 2.5, 0);
  ctx.lineTo(size * 2.5, -size * 0.08);
  ctx.lineTo(0, -size * 0.08);
  ctx.fill();

  // Teeth (Sharp and irregular)
  ctx.fillStyle = '#f8fafc';
  for (let i = 0; i < 7; i++) {
    const tx = size * 0.5 + i * size * 0.3;
    const tLen = size * (0.25 + Math.sin(i * 3) * 0.1);
    ctx.beginPath(); ctx.moveTo(tx, 0.08); ctx.lineTo(tx + size * 0.05, 0.08 + tLen); ctx.lineTo(tx + size * 0.1, 0.08); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx, -0.08); ctx.lineTo(tx + size * 0.05, -0.08 - tLen * 0.8); ctx.lineTo(tx + size * 0.1, -0.08); ctx.fill();
  }

  // Milky blind eyes with glow
  ctx.save();
  ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  // Position eye on the head
  ctx.beginPath(); ctx.ellipse(-size * 0.4, -size * 0.5, size * 0.28, size * 0.15, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-size * 0.4, size * 0.5, size * 0.28, size * 0.15, -0.15, 0, Math.PI * 2); ctx.fill();
  // Faint iris
  ctx.fillStyle = 'rgba(200,200,255,0.3)';
  ctx.beginPath(); ctx.arc(-size * 0.35, -size * 0.5, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-size * 0.35, size * 0.5, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.restore();
  ctx.restore();
};

export const drawGiantCrab = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  const shellGrad = ctx.createRadialGradient(0, -size * 0.5, 0, 0, 0, size * 2);
  shellGrad.addColorStop(0, '#ef4444');
  shellGrad.addColorStop(0.5, color);
  shellGrad.addColorStop(1, '#450a0a');

  // === MAI CUA (Angular/Bumpy Carapace) ===
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.bezierCurveTo(size * 1.5, -size * 1.2, size * 0.8, -size * 1.5, 0, -size * 1.5);
  ctx.bezierCurveTo(-size * 0.8, -size * 1.5, -size * 1.5, -size * 1.2, -size * 1.5, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 1.0, -size * 0.8, size * 1.2, 0, size * 1.2);
  ctx.bezierCurveTo(size * 0.8, size * 1.2, size * 1.5, size * 1.0, size * 1.5, 0);
  ctx.fill();

  // Shell Textures (Growth rings)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.5 * (i/4), size * 1.2 * (i/4), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === CHÂN KHỚP (Jointed Legs) ===
  ctx.strokeStyle = shellGrad;
  ctx.lineWidth = size * 0.25;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    const legOffset = (i - 1.5) * size * 0.7;
    const legWag = Math.sin(frameCount * 0.15 + i) * size * 0.3;
    
    // Top legs
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(legOffset * 0.5, -size * 0.8);
    ctx.lineTo(legOffset - size * 0.5, -size * 1.8 + legWag); // Joint 1
    ctx.lineTo(legOffset - size * 1.2, -size * 2.4 + legWag); // Joint 2 (Tip)
    ctx.stroke();
    ctx.restore();

    // Bottom legs
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(legOffset * 0.5, size * 0.8);
    ctx.lineTo(legOffset - size * 0.5, size * 1.8 - legWag); // Joint 1
    ctx.lineTo(legOffset - size * 1.2, size * 2.4 - legWag); // Joint 2 (Tip)
    ctx.stroke();
    ctx.restore();
  }

  // === CÀNG KHỔNG LỒ (Massive Crushing Claws) ===
  const clawPulse = Math.sin(frameCount * 0.1) * 0.15;
  
  const drawClaw = (side: number) => {
    ctx.save();
    ctx.translate(size * 1.2, side * size * 0.8);
    ctx.rotate(side * (0.4 + clawPulse));
    
    // Arm segment
    ctx.lineWidth = size * 0.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * 0.8, 0); ctx.stroke();
    
    // Pincer base (Hand)
    ctx.translate(size * 0.8, 0);
    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.ellipse(size * 0.5, 0, size * 1.0, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pincers (Upper & Lower)
    ctx.fillStyle = '#f87171';
    // Upper pincer
    ctx.save();
    ctx.translate(size * 1.2, -size * 0.2);
    ctx.rotate(-0.2 - clawPulse * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.8, -size * 0.2, size * 1.2, size * 0.4);
    ctx.lineTo(0, size * 0.3);
    ctx.fill();
    ctx.restore();
    
    // Lower pincer (Fixed)
    ctx.save();
    ctx.translate(size * 1.2, size * 0.2);
    ctx.rotate(0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.8, size * 0.2, size * 1.2, -size * 0.4);
    ctx.lineTo(0, -size * 0.3);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
  };

  drawClaw(-1); // Top claw
  drawClaw(1);  // Bottom claw

  // Eyestalks
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = size * 0.08;
  const eyeAnim = Math.sin(frameCount * 0.08) * 0.2;
  
  ctx.beginPath(); ctx.moveTo(size * 1.2, -size * 0.2); ctx.quadraticCurveTo(size * 1.6, -size * 0.5, size * 1.8, -size * 0.3 + eyeAnim); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 1.2, size * 0.2); ctx.quadraticCurveTo(size * 1.6, size * 0.5, size * 1.8, size * 0.3 - eyeAnim); ctx.stroke();
  
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.8, -size * 0.3 + eyeAnim, size * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.8, size * 0.3 - eyeAnim, size * 0.12, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawRobotFish = (
    ctx: CanvasRenderingContext2D,
    fish: FishType,
    frameCount: number,
    size: number,
    color: string
) => {
    const time = frameCount * 0.1;
    const glitch = Math.random() > 0.98 ? (Math.random() - 0.5) * 8 : 0;
    
    ctx.save();
    ctx.translate(glitch, 0);
    
    // 1. Metallic Gradient (#94a3b8 → #334155 → #0f172a)
    const metalGrad = ctx.createLinearGradient(-size * 1.5, -size, size * 1.5, size);
    metalGrad.addColorStop(0, '#94a3b8');
    metalGrad.addColorStop(0.5, '#334155');
    metalGrad.addColorStop(1, '#0f172a');
    
    // 2. Body Shape (Bezier fish silhouette but with mecha style)
    ctx.beginPath();
    ctx.moveTo(size * 1.6, 0); // Nose tip
    ctx.bezierCurveTo(size * 1.0, -size * 1.0, -size * 0.5, -size * 0.9, -size * 1.5, 0);
    ctx.bezierCurveTo(-size * 0.5, size * 0.9, size * 1.0, size * 1.0, size * 1.6, 0);
    ctx.fillStyle = metalGrad;
    ctx.fill();
    
    // 3. Panel Seams & Rivets
    ctx.save();
    // Clip to body shape
    ctx.beginPath();
    ctx.moveTo(size * 1.6, 0);
    ctx.bezierCurveTo(size * 1.0, -size * 1.0, -size * 0.5, -size * 0.9, -size * 1.5, 0);
    ctx.bezierCurveTo(-size * 0.5, size * 0.9, size * 1.0, size * 1.0, size * 1.6, 0);
    ctx.clip();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    // Horizontal panel line
    ctx.beginPath(); ctx.moveTo(-size * 1.5, 0); ctx.lineTo(size * 1.6, 0); ctx.stroke();
    // Vertical segmentation lines
    for (let i = -1; i <= 1; i++) {
        const px = i * size * 0.7;
        ctx.beginPath(); ctx.moveTo(px, -size); ctx.lineTo(px, size); ctx.stroke();
        
        // Rivets (small circular bolts along seams)
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        for (let j = -2; j <= 2; j++) {
            if (j === 0) continue;
            ctx.beginPath(); ctx.arc(px + size * 0.05, j * size * 0.35, 1.5, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
    
    // 4. Sharp Triangular Dorsal Fin
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.75);
    ctx.lineTo(size * 0.4, -size * 1.3);
    ctx.lineTo(size * 0.7, -size * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();

    // 5. Thruster Glow at tail base (Radial flame)
    const thrusterGlow = ctx.createRadialGradient(-size * 1.5, 0, 0, -size * 1.5, 0, size * 0.8);
    thrusterGlow.addColorStop(0, 'rgba(255, 120, 0, 0.8)'); // Inner orange
    thrusterGlow.addColorStop(0.5, 'rgba(0, 150, 255, 0.4)'); // Outer blue
    thrusterGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterGlow;
    ctx.beginPath();
    ctx.arc(-size * 1.5, 0, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 6. Rotating Fin-Blades (3 rigid triangular blades)
    ctx.save();
    ctx.translate(-size * 1.5, 0);
    ctx.rotate(frameCount * 0.05); // Slow rotation
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.8, -size * 0.35);
        ctx.lineTo(size * 0.8, size * 0.35);
        ctx.closePath();
        ctx.fill();
        // Blade edge highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
    
    // 7. Glowing LED Eye (Head position)
    const ledColor = Math.sin(time * 2.5) > 0 ? '#ef4444' : '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.shadowColor = ledColor;
    ctx.fillStyle = ledColor;
    ctx.fillRect(size * 0.85, -size * 0.25, size * 0.35, size * 0.15);
    
    ctx.restore();
};

export const drawCrystalFish = (
    ctx: CanvasRenderingContext2D,
    fish: FishType,
    frameCount: number,
    size: number,
    color: string
) => {
    const pulse = (Math.sin(frameCount * 0.05) + 1) / 2;
    
    ctx.save();
    ctx.globalAlpha = 0.75; // Translucent crystal effect
    
    // 1. Crystal Body Silhouette (Bezier fish shape)
    ctx.beginPath();
    ctx.moveTo(size * 1.5, 0); // Snout
    ctx.bezierCurveTo(size * 1.0, -size * 1.0, -size * 0.5, -size * 0.9, -size * 1.2, 0);
    ctx.bezierCurveTo(-size * 0.5, size * 0.9, size * 1.0, size * 1.0, size * 1.5, 0);
    
    const bodyGrad = ctx.createLinearGradient(-size, -size, size, size);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)'); // White highlights
    bodyGrad.addColorStop(0.5, color);                   // Crystal core color
    bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 2. Internal Refraction Facets (Angular lines fanning out)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        const angle = (i - 2.5) * 0.35;
        ctx.beginPath();
        ctx.moveTo(size * 1.4, 0);
        ctx.lineTo(size * 1.4 - Math.cos(angle) * size * 2.5, Math.sin(angle) * size * 1.2);
        ctx.stroke();
    }

    // 3. Sharp Triangular Dorsal Fin
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.6);
    ctx.lineTo(size * 0.2, -size * 1.1);
    ctx.lineTo(size * 0.5, -size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Angular V-Shape Tail (Crystal shard style)
    ctx.save();
    ctx.translate(-size * 1.2, 0);
    ctx.rotate(Math.sin(frameCount * 0.1) * 0.2); 
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 1.2, -size * 0.7);
    ctx.lineTo(-size * 0.6, 0);
    ctx.lineTo(-size * 1.2, size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Orbiting Crystal Shards
    for (let i = 0; i < 3; i++) {
        const angle = frameCount * 0.02 + i * Math.PI * 2 / 3;
        const orbitRadius = size * 1.8;
        const sx = Math.cos(angle) * orbitRadius;
        const sy = Math.sin(angle) * orbitRadius * 0.6;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle * 3);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(5, 0); ctx.lineTo(0, 10); ctx.lineTo(-5, 0); ctx.lineTo(0, -10); ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // 6. Glowing Eye Point
    const eyeX = size * 1.0;
    const eyeY = -size * 0.2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();
};

export const drawSeadragon = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  // Rotate ctx +90° so it faces right like other fish.
  ctx.rotate(Math.PI / 2);
  
  // Body: thin elongated S-curve using bezier
  ctx.beginPath();
  ctx.moveTo(0, size * 1.5); // head
  ctx.bezierCurveTo(size * 0.8, size * 0.5, -size * 0.8, -size * 0.5, 0, -size * 2.0); // tail tip
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Leaf appendages
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const attachX = Math.sin(t * Math.PI) * size * 0.1;
    const attachY = size * 1.5 - t * size * 3.5;
    
    ctx.save();
    ctx.translate(attachX, attachY);
    ctx.rotate(Math.sin(frameCount * 0.08 + i * 0.7) * 0.3);
    
    const lobeLen = size * (0.6 + Math.abs(Math.sin(i * 1.3)) * 0.8);
    const lobeGrad = ctx.createLinearGradient(0, 0, 0, -lobeLen);
    lobeGrad.addColorStop(0, color);
    lobeGrad.addColorStop(1, 'rgba(190, 242, 100, 0.4)'); // semi-transparent lime
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.3, -lobeLen * 0.3, size * 0.3, -lobeLen * 0.7, 0, -lobeLen);
    ctx.bezierCurveTo(-size * 0.3, -lobeLen * 0.7, -size * 0.3, -lobeLen * 0.3, 0, 0);
    ctx.fillStyle = lobeGrad;
    ctx.fill();
    ctx.restore();
  }

  // Snout: long thin tube
  ctx.beginPath();
  ctx.moveTo(0, size * 1.5);
  ctx.quadraticCurveTo(size * 0.2, size * 1.8, 0, size * 2.3);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(0, size * 1.4, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(0, size * 1.4, size * 0.04, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawParrotfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  // Body: deep and oval
  const bodyGrad = ctx.createLinearGradient(-size, -size, size, size);
  bodyGrad.addColorStop(0, '#4ade80');
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.7, '#818cf8');
  bodyGrad.addColorStop(1, '#f472b6');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.8, size * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scales grid (clipped)
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, size * 1.8, size * 1.1, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for(let x = -size * 2; x < size * 2; x += size * 0.4) {
    for(let y = -size * 1.5; y < size * 1.5; y += size * 0.4) {
      ctx.beginPath(); ctx.arc(x, y, size * 0.25, 0, Math.PI); ctx.stroke();
    }
  }
  ctx.restore();

  // Beak
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(size * 1.5, -size * 0.2);
  ctx.lineTo(size * 2.0, 0);
  ctx.lineTo(size * 1.5, size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.moveTo(size * 1.5, 0); ctx.lineTo(size * 2.0, 0); ctx.stroke();

  // Tail: lunate
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 1.6, 0);
  ctx.quadraticCurveTo(-size * 2.5, -size * 1.5, -size * 3.0, -size * 1.2);
  ctx.quadraticCurveTo(-size * 2.2, 0, -size * 3.0, size * 1.2);
  ctx.quadraticCurveTo(-size * 2.5, size * 1.5, -size * 1.6, 0);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(size * 1.2, -size * 0.4, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.25, -size * 0.4, size * 0.08, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawGiantSquid = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  // Mantle: torpedo
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2.0, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fins
  ctx.beginPath();
  ctx.moveTo(-size * 1.8, 0);
  ctx.lineTo(-size * 2.8, -size * 0.6);
  ctx.lineTo(-size * 2.8, size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Chromatophores
  for (let i = 0; i < 15; i++) {
    const pulse = (Math.sin(frameCount * 0.1 + i * 0.4) + 1) / 2;
    ctx.fillStyle = `rgba(255,255,255, ${pulse * 0.4})`;
    const px = (Math.sin(i * 3) * size * 1.5);
    const py = (Math.cos(i * 7) * size * 0.4);
    ctx.beginPath(); ctx.arc(px, py, size * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  // Arms
  for (let i = 0; i < 8; i++) {
    const angle = (i / 7) * Math.PI * 0.6 + Math.PI * 0.2;
    const al = size * 1.5;
    ctx.save();
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(size * 1.5, 0); ctx.lineTo(size * 1.5 + al, Math.sin(frameCount * 0.1 + i) * size * 0.3); ctx.stroke();
    ctx.restore();
  }

  // Feeding Tentacles
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? 1 : -1;
    const tl = size * 4.0;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.12;
    const wave = Math.sin(frameCount * 0.05 + i) * size * 0.6;
    ctx.beginPath();
    ctx.moveTo(size * 1.8, side * size * 0.2);
    ctx.bezierCurveTo(size * 3.0, side * size * 1.0 + wave, size * 4.0, side * size * 0.5, size * 1.8 + tl, side * size * 0.3 + wave);
    ctx.stroke();
    // Club tip
    ctx.translate(size * 1.8 + tl, side * size * 0.3 + wave);
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.4, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Eye
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.ellipse(size * 1.4, 0, size * 0.4, size * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.arc(size * 1.5, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawGoblinShark = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#fda4af');
  bodyGrad.addColorStop(0.5, '#fff1f2');
  bodyGrad.addColorStop(1, '#ffffff');
  
  // Body
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 2.2, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blade snout
  ctx.beginPath();
  ctx.moveTo(size * 1.5, -size * 0.4);
  ctx.lineTo(size * 3.5, -size * 0.1);
  ctx.lineTo(size * 3.5, size * 0.1);
  ctx.lineTo(size * 1.5, size * 0.4);
  ctx.fill();

  // Protruding Jaws
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, size * 0.2);
  ctx.quadraticCurveTo(size * 2.2, size * 0.8, size * 2.8, size * 0.4);
  ctx.stroke();
  // Teeth
  for(let i=0; i<8; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 1.8 + i * size * 0.1, size * 0.4);
    ctx.lineTo(size * 1.8 + i * size * 0.1, size * 0.6);
    ctx.stroke();
  }

  // Eye
  ctx.fillStyle = '#166534';
  ctx.beginPath(); ctx.arc(size * 1.2, -size * 0.2, size * 0.1, 0, Math.PI * 2); ctx.fill();

  // Fins
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 0.7); ctx.lineTo(-size * 1.2, -size * 1.2); ctx.lineTo(-size * 1.0, -size * 0.6);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-size * 2.0, 0);
  ctx.lineTo(-size * 3.5, -size * 1.2); // Upper long
  ctx.lineTo(-size * 2.8, 0);
  ctx.lineTo(-size * 3.2, size * 0.6); // Lower short
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

export const drawGlassfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  // Body transparent
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = 'rgba(150, 200, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Internal anatomy
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); // Spine
  ctx.moveTo(size * 1.2, 0);
  ctx.quadraticCurveTo(0, Math.sin(frameCount * 0.1) * size * 0.1, -size * 1.4, 0);
  ctx.stroke();
  
  // Ribs
  ctx.lineWidth = 1;
  for(let i=0; i<6; i++) {
    const rx = size * 0.8 - i * size * 0.3;
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.quadraticCurveTo(rx - size * 0.1, size * 0.4, rx - size * 0.2, size * 0.5); ctx.stroke();
  }

  // Heart
  const heartPulse = (Math.sin(frameCount * 0.15) + 1) / 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(size * 0.8, size * 0.1, size * (0.08 + heartPulse * 0.04), 0, Math.PI * 2); ctx.fill();

  // Eye
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(size * 1.1, -size * 0.2, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.15, -size * 0.2, size * 0.07, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawMandarinfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  ctx.save();
  ctx.rotate(Math.sin(time * 0.5) * 0.03);

  // 1. PSYCHEDELIC BODY (3D Shading)
  const bodyGrad = ctx.createRadialGradient(size * 0.3, -size * 0.3, size * 0.2, 0, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#60a5fa'); // Cyan highlight
  bodyGrad.addColorStop(0.4, '#3b82f6'); // Main blue
  bodyGrad.addColorStop(1, '#1e3a8a'); // Dark edge

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.4, size * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. PROCEDURAL LABYRINTH PATTERN (Mandarin signature)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.4, size * 1.1, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = '#f97316'; // Vibrant orange
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.8;
  
  for (let i = 0; i < 12; i++) {
    const ang = i * 0.6;
    const px = Math.cos(ang) * size * 1.2;
    const py = Math.sin(ang) * size * 0.9;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.bezierCurveTo(
      px + Math.sin(i + time) * size, 
      py + Math.cos(i) * size, 
      -px * 0.5, 
      -py * 0.5, 
      0, 0
    );
    ctx.stroke();
  }
  ctx.restore();

  // 3. FLOWING FINS (Translucent & Rayed)
  const drawMandarinFin = (x: number, y: number, rot: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot + Math.sin(time * 2) * 0.1);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size * 1.2 * s, -size * 0.8, -size * 1.0 * s, -size * 0.4, 0);
    ctx.fill();
    ctx.restore();
  };

  drawMandarinFin(size * 0.2, -size * 0.8, -0.2, 1.5); // Dorsal
  drawMandarinFin(-size * 0.2, size * 0.8, 2.5, 1.2); // Anal

  // 4. LARGE BULGING EYE
  const eyeX = size * 0.9, eyeY = -size * 0.35;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.05, size * 0.05, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawMarlin = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  const wag = Math.sin(time * 1.5) * 0.1;
  
  ctx.save();
  ctx.rotate(wag);

  // 1. ULTRA-METALLIC BODY
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size * 1.2);
  bodyGrad.addColorStop(0, '#001e3c'); // Deep navy
  bodyGrad.addColorStop(0.3, '#1e40af');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(0.8, '#94a3b8'); // Silver
  bodyGrad.addColorStop(1, '#f8fafc'); // White belly

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 3.5, 0); // Nose base
  ctx.bezierCurveTo(size * 2.0, -size * 1.2, -size * 1.5, -size * 1.0, -size * 3.0, 0); // Back
  ctx.bezierCurveTo(-size * 1.5, size * 1.0, size * 2.0, size * 1.2, size * 3.5, 0); // Belly
  ctx.fill();

  // 2. ELECTRIC BLUE STRIPES
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = size * 0.15;
  for(let i=0; i<12; i++) {
    const sx = -size * 2.5 + i * size * 0.5;
    ctx.beginPath(); 
    ctx.moveTo(sx, -size * 0.8); 
    ctx.quadraticCurveTo(sx + size * 0.2, 0, sx, size * 0.8); 
    ctx.stroke();
  }
  ctx.restore();

  // 3. THE BILL (Long Rostrum)
  const billGrad = ctx.createLinearGradient(size * 3.5, 0, size * 6.5, 0);
  billGrad.addColorStop(0, '#1e3a8a');
  billGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
  ctx.strokeStyle = billGrad;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(size * 3.5, 0); ctx.lineTo(size * 6.5, 0); ctx.stroke();

  // 4. MAJESTIC SAIL FIN
  ctx.fillStyle = 'rgba(30, 58, 138, 0.7)';
  ctx.beginPath();
  ctx.moveTo(size * 1.5, -size * 1.0);
  ctx.bezierCurveTo(size * 0.5, -size * 3.5, -size * 1.5, -size * 3.2, -size * 2.0, -size * 0.8);
  ctx.fill();
  // Sail rays
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  for(let i=0; i<10; i++) {
    ctx.beginPath(); ctx.moveTo(size * 1.0 - i * size * 0.3, -size * 0.9); ctx.lineTo(size * 0.5 - i * size * 0.3, -size * 2.5); ctx.stroke();
  }

  // 5. CRESENT TAIL
  ctx.save();
  ctx.translate(-size * 3.0, 0);
  ctx.rotate(Math.sin(time * 3) * 0.4);
  ctx.fillStyle = '#001e3c';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.5, -size * 3.0, -size * 3.5, -size * 2.5, -size * 2.5, 0);
  ctx.bezierCurveTo(-size * 3.5, size * 2.5, -size * 1.5, size * 3.0, 0, 0);
  ctx.fill();
  ctx.restore();

  // 6. EYE
  const eyeX = size * 2.8, eyeY = -size * 0.2;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawHatchetfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  ctx.translate(0, Math.sin(frameCount * 0.04) * size * 0.3);

  // Body
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.5, '#94a3b8');
  bodyGrad.addColorStop(1, '#f8fafc');
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.bezierCurveTo(size * 0.4, -size * 1.8, -size * 0.2, -size * 1.8, -size * 0.4, -size * 0.5);
  ctx.lineTo(-size * 0.4, size * 0.3);
  ctx.bezierCurveTo(size * 0.0, size * 2.2, size * 0.5, size * 2.0, size * 0.6, 0);
  ctx.fill();

  // Photophores
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#38bdf8';
  for(let i=0; i<10; i++) {
    const pulse = (0.7 + Math.sin(frameCount * 0.12 + i * 0.4) * 0.3);
    ctx.fillStyle = `rgba(125, 211, 252, ${pulse})`;
    ctx.beginPath(); ctx.arc(size * 0.3 - i * size * 0.08, size * 1.2 - i * size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Eyes (Tubular)
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath(); ctx.ellipse(size * 0.4, -size * 0.3, size * 0.15, size * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.ellipse(size * 0.42, -size * 0.45, size * 0.08, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawOarfish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  ctx.save();
  
  // Ribbon Body
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  const segments = 40;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = size * 2.5 - t * size * 10.5;
    const y = Math.sin(x * 0.4 + frameCount * 0.06) * size * 1.2;
    const thickness = size * 0.12 * (1 - t * 0.5);
    if (i === 0) ctx.moveTo(x, y - thickness);
    else ctx.lineTo(x, y - thickness);
  }
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const x = size * 2.5 - t * size * 10.5;
    const y = Math.sin(x * 0.4 + frameCount * 0.06) * size * 1.2;
    const thickness = size * 0.12 * (1 - t * 0.5);
    ctx.lineTo(x, y + thickness);
  }
  ctx.fill();

  // Crest
  ctx.fillStyle = '#ef4444';
  const hx = size * 2.5;
  const hy = Math.sin(hx * 0.4 + frameCount * 0.06) * size * 1.2;
  for(let i=0; i<5; i++) {
    ctx.beginPath();
    ctx.moveTo(hx - i * size * 0.2, hy - size * 0.1);
    ctx.lineTo(hx - i * size * 0.3, hy - size * 1.8);
    ctx.lineTo(hx - i * size * 0.4, hy - size * 0.1);
    ctx.fill();
  }

  // Eye
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath(); ctx.arc(size * 2.2, hy - size * 0.05, size * 0.2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

