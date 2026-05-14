
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
  const wag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  ctx.rotate(wag);

  const bodyGrad = ctx.createRadialGradient(size * 0.3, -size * 0.3, size * 0.2, 0, 0, size * 1.6);
  bodyGrad.addColorStop(0, '#f1f5f9');
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(1, '#0f172a');

  // Body (Mola mola shape, slightly flattened ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * 1.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Clavus (the specialized "tail" of the sunfish)
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, -size * 0.8);
  // scalloped/bumpy clavus
  ctx.bezierCurveTo(-size * 1.8, -size * 0.4, -size * 1.8, size * 0.4, -size * 1.3, size * 0.8);
  ctx.bezierCurveTo(-size * 1.6, size * 0.5, -size * 1.6, -size * 0.5, -size * 1.3, -size * 0.8);
  ctx.fill();
  
  // Clavus ridges
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = size * 0.05;
  for (let i = 0; i < 5; i++) {
    const y = -size * 0.6 + i * (size * 0.3);
    ctx.beginPath();
    ctx.moveTo(-size * 1.4, y);
    ctx.lineTo(-size * 1.6, y);
    ctx.stroke();
  }

  // Texture (Pockmarks)
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for(let i=0; i<15; i++) {
    const tx = (Math.sin(i * 77) * size * 1.2);
    const ty = (Math.cos(i * 99) * size * 1.0);
    if (tx * tx / (size * 1.5 * size * 1.5) + ty * ty / (size * 1.3 * size * 1.3) < 0.8) {
      ctx.beginPath(); ctx.arc(tx, ty, size * 0.1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Large Fins (Dorsal & Anal)
  const finWag = Math.sin(frameCount * 0.05) * 0.2;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  // Dorsal
  ctx.save(); ctx.translate(-size * 0.2, -size * 0.8); ctx.rotate(finWag);
  ctx.beginPath(); ctx.moveTo(size * 0.4, 0); ctx.quadraticCurveTo(-size * 0.2, -size * 1.6, -size * 0.4, 0); ctx.fill();
  ctx.restore();
  // Anal
  ctx.save(); ctx.translate(-size * 0.2, size * 0.8); ctx.rotate(-finWag);
  ctx.beginPath(); ctx.moveTo(size * 0.4, 0); ctx.quadraticCurveTo(-size * 0.2, size * 1.6, -size * 0.4, 0); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.2, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.2, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.9, -size * 0.25, size * 0.05, 0, Math.PI * 2); ctx.fill();

  // Tiny mouth
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = size * 0.05;
  ctx.beginPath(); ctx.arc(size * 1.5, 0, size * 0.1, -Math.PI / 4, Math.PI / 4); ctx.stroke();

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
  const segments = 18; // Tăng thêm segment cho mượt
  const time = frameCount * 0.05;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = size * 0.5;

  // === THÂN RỒNG (Serpentine Segmented Body) ===
  for(let i=0; i<segments; i++) {
    const t = i / (segments - 1);
    const segX = -size * 4.0 + (i * size * 8.0 / segments);
    const wave = Math.sin(time + i * 0.4);
    const segY = wave * size * 1.8;
    const segSize = size * (0.8 + Math.sin(t * Math.PI) * 0.4) * (1 - t * 0.5);
    
    ctx.save();
    ctx.translate(segX, segY);
    ctx.rotate(wave * 0.2);

    const segGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, segSize);
    segGrad.addColorStop(0, '#fde68a'); // Gold center
    segGrad.addColorStop(0.4, color);
    segGrad.addColorStop(1, '#450a0a'); 

    ctx.fillStyle = segGrad;
    // Diamond scale shape
    ctx.beginPath();
    ctx.moveTo(segSize, 0);
    ctx.lineTo(0, segSize * 0.8);
    ctx.lineTo(-segSize, 0);
    ctx.lineTo(0, -segSize * 0.8);
    ctx.fill();

    // Dorsal Fins (Fan style)
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, -segSize * 0.8);
      ctx.quadraticCurveTo(-segSize * 0.5, -segSize * 2.5, -segSize * 1.5, -segSize * 2.0);
      ctx.lineTo(-segSize * 0.5, -segSize * 0.5);
      ctx.fill();
    }
    ctx.restore();
  }

  // === ĐẦU RỒNG UY NGHI (Majestic Dragon Head) ===
  const headX = size * 3.5;
  const headWave = Math.sin(time + segments * 0.4);
  const headY = headWave * size * 1.8;
  
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headWave * 0.1);

  const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
  headGrad.addColorStop(0, color);
  headGrad.addColorStop(1, '#7f1d1d');
  
  ctx.fillStyle = headGrad;
  // Snout & Head shape
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Tip of snout
  ctx.bezierCurveTo(size * 1.5, -size * 1.5, -size * 0.5, -size * 1.5, -size * 1.2, -size * 0.5);
  ctx.lineTo(-size * 1.2, size * 0.5);
  ctx.bezierCurveTo(-size * 0.5, size * 1.5, size * 1.5, size * 1.2, size * 1.8, 0);
  ctx.fill();

  // Dragon Mane (Translucent hair)
  ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
  for(let i=0; i<8; i++) {
    const angle = Math.PI + (i/7) * Math.PI - 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.quadraticCurveTo(Math.cos(angle) * size * 3, Math.sin(angle) * size * 3, Math.cos(angle + 0.2) * size * 2.5, Math.sin(angle + 0.2) * size * 2.5);
    ctx.fill();
  }

  // Antlers (Branched)
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = size * 0.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 1.0);
  ctx.quadraticCurveTo(-size * 1.5, -size * 3.5, -size * 3.0, -size * 3.8);
  ctx.moveTo(-size * 1.2, -size * 2.2);
  ctx.lineTo(-size * 0.8, -size * 3.0);
  ctx.stroke();

  // Whiskers (Long & Flowing)
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.12;
  const whiskWave = Math.sin(time * 2);
  ctx.beginPath();
  ctx.moveTo(size * 1.5, size * 0.2);
  ctx.bezierCurveTo(size * 2.5, size * 2.0, -size, size * 4.0 + whiskWave * size, -size * 3.0, size * 3.0);
  ctx.stroke();

  // Glowing Eyes
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fef08a';
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.ellipse(size * 0.6, -size * 0.5, size * 0.4, size * 0.2, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.arc(size * 0.7, -size * 0.5, size * 0.12, 0, Math.PI * 2); ctx.fill();
  
  ctx.restore();
  ctx.restore();
};

export const drawKraken = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  const pulse = Math.sin(time * 0.8) * 0.1;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.8;

  // === XÚC TU (Powerful Wriggling Tentacles) ===
  const numTentacles = 8;
  for (let i = 0; i < numTentacles; i++) {
    const angle = (i / numTentacles) * Math.PI * 2 + Math.sin(time + i) * 0.3;
    const len = size * (2.5 + Math.sin(time * 1.2 + i) * 0.5);
    
    ctx.save();
    ctx.rotate(angle);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    const cp1x = size * 1.5;
    const cp1y = Math.sin(time + i) * size * 1.0;
    const endX = len;
    const endY = Math.cos(time + i) * size * 0.5;
    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    ctx.stroke();

    // Suckers
    ctx.fillStyle = '#fbcfe8';
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      const sx = size * 0.5 + (len - size * 0.5) * t;
      const sy = cp1y * (1-t) + endY * t; // Approx pos
      ctx.beginPath();
      ctx.arc(sx, sy + size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // === THÂN/ĐẦU (Pulsing Mantle) ===
  const mantleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
  mantleGrad.addColorStop(0, color);
  mantleGrad.addColorStop(0.6, color);
  mantleGrad.addColorStop(1, '#020617');

  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.5, size * (1.2 + pulse), 0, 0, Math.PI * 2);
  ctx.fill();

  // Mantle Texture (Scars/Leather)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for(let i=0; i<3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.5 + i * size * 0.4);
    ctx.lineTo(size * 0.5, -size * 0.3 + i * size * 0.4);
    ctx.stroke();
  }

  // Intelligent Eyes
  const eyeX = size * 0.6;
  const eyeY = size * 0.5;
  
  const drawEye = (side: number) => {
    ctx.save();
    ctx.translate(eyeX, side * eyeY);
    
    // Sclera
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fef08a';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.4, size * 0.25, side * 0.2, 0, Math.PI * 2); ctx.fill();
    
    // Iris
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#450a0a';
    ctx.beginPath(); ctx.arc(size * 0.05, 0, size * 0.2, 0, Math.PI * 2); ctx.fill();
    
    // Pupil (Slit)
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.ellipse(size * 0.08, 0, size * 0.05, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();
  };

  drawEye(-1);
  drawEye(1);

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
  // Sau khi vẽ vây lưng đen, reset fillStyle về backGrad — tránh vây ngực bị đen oan
  const pecWag = Math.sin(frameCount * 0.1) * 0.2;
  ctx.save();
  ctx.translate(size * 0.8, size * 0.5);
  ctx.rotate(pecWag);
  ctx.fillStyle = backGrad; // PHẢI reset fillStyle về màu thân
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

  // Long wiggly tail with taper
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  const tailSegments = 15;
  let prevX = -size * 0.5;
  let prevY = 0;
  for (let i = 1; i <= tailSegments; i++) {
    const t = i / tailSegments;
    const nextX = -size * 0.5 - t * size * 2.5;
    // wave amplitude increases towards the tip
    const nextY = Math.sin(frameCount * 0.4 - t * Math.PI * 2) * size * 0.8 * t; 
    
    ctx.lineWidth = size * 0.8 * (1 - t); // Taper!
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(nextX, nextY);
    ctx.stroke();
    
    prevX = nextX;
    prevY = nextY;
  }

  // Mutant Eyes
  ctx.fillStyle = 'red';
  ctx.beginPath(); ctx.arc(size * 1.0, -size * 0.4, size * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.2, size * 0.2, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.8, size * 0.5, size * 0.2, 0, Math.PI * 2); ctx.fill();
  
  // Pupils
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.05, -size * 0.4, size * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.25, size * 0.2, size * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.85, size * 0.5, size * 0.08, 0, Math.PI * 2); ctx.fill();
  
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
  
  // Wiggling Tentacles (drawn before body so they are behind)
  ctx.lineCap = 'round';
  const numTentacles = 8; // octopus has 8
  for (let i = 0; i < numTentacles; i++) {
    // Spread evenly around the bottom and sides (from roughly -120 deg to +120 deg)
    const angle = (Math.PI * 0.65) - (i / (numTentacles - 1)) * (Math.PI * 1.3);
    const wag = Math.sin(frameCount * 0.1 + i * 1.2);
    
    // Base of the tentacle on the mantle
    const bx = size * 0.4 + Math.cos(angle) * size * 0.8;
    const by = Math.sin(angle) * size * 0.6;
    
    // Tapering tentacle loop
    const tentacleSteps = 10;
    let px = bx;
    let py = by;
    ctx.strokeStyle = color;
    for (let j = 1; j <= tentacleSteps; j++) {
      const t = j / tentacleSteps;
      const tLen = size * 2.5 * (1/tentacleSteps); // length of this segment
      // Curve angle wiggles
      const curAngle = angle + wag * t * 1.5; 
      
      const nx = px + Math.cos(curAngle) * tLen;
      const ny = py + Math.sin(curAngle) * tLen;
      
      ctx.lineWidth = size * 0.35 * (1 - t * 0.8); // Tapering
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      
      // Suckers (drawn on the inner side of the curve)
      const suckerAngle = curAngle + Math.PI / 2;
      ctx.fillStyle = '#fbcfe8'; // light pink
      ctx.beginPath();
      ctx.arc(px + Math.cos(suckerAngle) * (ctx.lineWidth * 0.4), 
              py + Math.sin(suckerAngle) * (ctx.lineWidth * 0.4), 
              ctx.lineWidth * 0.25, 0, Math.PI * 2);
      ctx.fill();

      px = nx;
      py = ny;
    }
  }

  // Head/Mantle (drawn after tentacles so it overlaps their bases)
  ctx.beginPath();
  ctx.ellipse(size * 0.4, -size * 0.2, size * 1.2, size * 1.0 + pulse * size * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Texture Spots
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.6, size * 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.1, -size * 0.4, size * 0.15, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 0.3, -size * 0.8, size * 0.12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(-size * 0.2, -size * 0.1, size * 0.18, 0, Math.PI*2); ctx.fill();

  // Eyes (front facing, relatively large)
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.0, 0, size * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(size * 1.1, -size * 0.4, size * 0.22, 0, Math.PI * 2); ctx.fill();
  
  // Pupils (horizontal slits for octopus!)
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
  ctx.save();
  
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.3;

  const bodyGrad = ctx.createLinearGradient(0, -size * 1.5, 0, size * 1.5);
  bodyGrad.addColorStop(0, '#064e3b'); 
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#020617');

  // === THÂN GỒ GHỀ (Rugged Armored Body) ===
  ctx.save();
  ctx.rotate(wag * 0.3);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Shoulder area
  ctx.moveTo(size * 1.5, -size * 0.5);
  ctx.bezierCurveTo(size * 0.5, -size * 1.2, -size * 1.5, -size * 1.0, -size * 2.5, 0); // Lưng
  ctx.bezierCurveTo(-size * 1.5, size * 1.0, size * 0.5, size * 1.2, size * 1.5, size * 0.5); // Bụng
  ctx.fill();

  // Bony Scutes (Armor plates on back)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 6; i++) {
    const sx = size * 1.2 - i * size * 0.6;
    const sy = -size * 0.4 - Math.sin(i * 0.5) * size * 0.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - size * 0.3, sy - size * 0.2);
    ctx.lineTo(sx - size * 0.5, sy);
    ctx.fill();
  }
  ctx.restore();

  // === ĐUÔI CƠ BẮP (Powerful Muscular Tail) ===
  ctx.save();
  ctx.translate(-size * 2.5, 0);
  ctx.rotate(wag * 1.5);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  // Tail taper with a bit of a curve
  ctx.bezierCurveTo(-size * 1.5, -size * 0.6, -size * 3.0, -size * 0.2, -size * 4.0, 0);
  ctx.bezierCurveTo(-size * 3.0, size * 0.2, -size * 1.5, size * 0.6, 0, size * 0.4);
  ctx.fill();
  
  // Tail Spikes
  ctx.fillStyle = '#022c22';
  for (let i = 0; i < 4; i++) {
    const tx = -size * 0.8 - i * size * 0.8;
    ctx.beginPath();
    ctx.moveTo(tx, -size * 0.2);
    ctx.lineTo(tx - size * 0.4, -size * 0.5);
    ctx.lineTo(tx - size * 0.6, -size * 0.1);
    ctx.fill();
  }
  ctx.restore();

  // === ĐẦU CÁ SẤU (Heavy Croc Head) ===
  ctx.save();
  ctx.translate(size * 1.5, 0);
  ctx.rotate(wag * -0.15);
  ctx.fillStyle = bodyGrad;
  
  // Upper Jaw
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.bezierCurveTo(size * 1.5, -size * 0.8, size * 3.5, -size * 0.6, size * 3.5, -size * 0.1);
  ctx.lineTo(size * 3.5, size * 0.1);
  ctx.bezierCurveTo(size * 2.0, size * 0.1, size * 1.0, size * 0.2, 0, size * 0.5);
  ctx.fill();
  
  // Lower Jaw (Heavy)
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(size * 1.5, size * 0.8, size * 3.0, size * 0.7, size * 3.3, size * 0.25);
  ctx.lineTo(size * 3.3, size * 0.1);
  ctx.lineTo(0, size * 0.1);
  ctx.fill();

  // Teeth (Irregular & Menacing)
  ctx.fillStyle = '#f1f5f9';
  for (let i = 0; i < 6; i++) {
    const tx = size * 0.8 + i * size * 0.45;
    const tLen = size * (0.2 + Math.sin(i * 1.5) * 0.1);
    // Upper teeth
    ctx.beginPath();
    ctx.moveTo(tx, -size * 0.2);
    ctx.lineTo(tx + size * 0.1, -size * 0.2 + tLen);
    ctx.lineTo(tx + size * 0.2, -size * 0.2);
    ctx.fill();
    // Lower teeth
    ctx.beginPath();
    ctx.moveTo(tx + size * 0.2, size * 0.2);
    ctx.lineTo(tx + size * 0.3, size * 0.2 - tLen * 0.8);
    ctx.lineTo(tx + size * 0.4, size * 0.2);
    ctx.fill();
  }

  // Blind Eye Sockets (Sunken)
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.ellipse(size * 0.8, -size * 0.4, size * 0.3, size * 0.15, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.8, size * 0.4, size * 0.3, size * 0.15, -0.2, 0, Math.PI * 2); ctx.fill();
  
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
};
