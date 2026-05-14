
import { FishType } from '../../types';

export const drawClassicFish = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  // 1. Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  
  // 2. Beautiful Body Gradient
  const bodyGrad = ctx.createLinearGradient(-size * 1.2, -size, size * 1.2, size);
  bodyGrad.addColorStop(0, 'white');
  bodyGrad.addColorStop(0.2, color);
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#020617');

  // Draw Tail first so it goes behind the body
  ctx.save();
  ctx.translate(-size * 0.8, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Upper tail lobe
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.8, -size * 0.9, -size * 0.6);
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.3, 0);
  // Lower tail lobe
  ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.9, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.5, size * 0.8, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Tail details
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-size * 0.8, -size * 0.4);
  ctx.moveTo(0, 0); ctx.lineTo(-size * 0.8, size * 0.4);
  ctx.stroke();
  ctx.restore();

  // 3. Body Shape (Sleek and organic)
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0); // Nose
  ctx.bezierCurveTo(size * 0.8, -size * 0.9, -size * 0.4, -size * 0.8, -size * 0.9, 0); // Top curve
  ctx.bezierCurveTo(-size * 0.4, size * 0.8, size * 0.8, size * 0.9, size * 1.2, 0); // Bottom curve
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Reset shadow for details
  ctx.shadowColor = 'transparent';

  // 4. Shiny Highlight
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(size * 0.3, -size * 0.3, size * 0.5, size * 0.15, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Scales Pattern (Hexagonal/Diamond illusion)
  // Dùng save/restore riêng để clip không ảnh hưởng context bên ngoài
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  // Tạo clipping region hình thân cá
  ctx.beginPath();
  ctx.moveTo(size * 1.2, 0);
  ctx.bezierCurveTo(size * 0.8, -size * 0.9, -size * 0.4, -size * 0.8, -size * 0.9, 0);
  ctx.bezierCurveTo(-size * 0.4, size * 0.8, size * 0.8, size * 0.9, size * 1.2, 0);
  ctx.clip();
  // Vảy: đường chéo tạo ảo giác kim cương/lục giác
  for (let i = -size; i < size; i += size * 0.2) {
    ctx.beginPath();
    ctx.moveTo(i, -size);
    ctx.lineTo(i + size * 0.3, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i + size * 0.3, -size);
    ctx.lineTo(i, size);
    ctx.stroke();
  }
  ctx.restore(); // clip được giải phóng hoàn toàn tại đây

  // 6. Fins
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  
  // Dorsal Fin — chiều cao vây lưng tăng lên size*1.4 cho tương xứng hơn
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.65);
  ctx.quadraticCurveTo(size * 0.1, -size * 1.4, size * 0.4, -size * 0.55);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.72, -size * 0.2, -size * 0.65);
  ctx.fill();

  // Pectoral Fin (Animates with swim)
  // Vây ngực đập NGƯỢC chiều đuôi (+tailWag*0.5) → giống bơi thật
  ctx.save();
  ctx.translate(size * 0.4, size * 0.2);
  ctx.rotate(tailWag * 0.5); // đúng vật lý: vây ngực phẳng khi đuôi quạt sang một bên
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.3, size * 0.4, -size * 0.5, size * 0.6);
  ctx.quadraticCurveTo(0, size * 0.4, size * 0.1, size * 0.1);
  ctx.fill();
  
  // Fin ribs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size * 0.4, size * 0.5); ctx.stroke();
  ctx.restore();

  // 7. Eye (More detailed)
  const eyeX = size * 0.85;
  const eyeY = -size * 0.15;
  
  // Outer gold rim
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2); ctx.fill();
  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  // Catch light
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.1, eyeY - size * 0.05, size * 0.04, 0, Math.PI * 2); ctx.fill();
  
  // Mouth
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(size * 1.15, size * 0.1);
  ctx.quadraticCurveTo(size * 1.0, size * 0.15, size * 0.9, size * 0.1);
  ctx.stroke();
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
  // Deep shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.2;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // Catfish Gradient (Darker head, muddy belly)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.0, 0, size * 1.0);
  bodyGrad.addColorStop(0, '#020617');
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(0.8, '#451a03'); 
  bodyGrad.addColorStop(1, '#0f172a');

  // === ĐUÔI VẪY (Wagging tail section) ===
  ctx.save();
  ctx.translate(-size * 0.5, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.4, -size * 2.8, -size * 0.1);
  ctx.quadraticCurveTo(-size * 2.9, 0, -size * 2.8, size * 0.1);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.4, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Vây đuôi mỏng
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.6, -size * 3.0, 0);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.6, 0, size * 0.2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // === THÂN & ĐẦU (Wide/Flat Catfish Head) ===
  ctx.beginPath();
  ctx.moveTo(size * 1.4, 0); // Shortened nose
  // Head is very wide/flat
  ctx.bezierCurveTo(size * 1.0, -size * 0.9, -size * 0.2, -size * 0.7, -size * 0.6, 0);
  ctx.bezierCurveTo(-size * 0.2, size * 0.7, size * 1.0, size * 0.9, size * 1.4, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Mottled Skin (Muddy spots)
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 10; i++) {
    const rx = size * 0.8 - i * size * 0.2;
    const ry = (Math.cos(i * 123) * size * 0.3);
    ctx.beginPath(); ctx.arc(rx, ry, size * 0.15, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Glowy Eyes (Set wide apart)
  const eyeX = size * 1.0;
  const eyeY = -size * 0.35;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.1, size * 0.05, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(eyeX, -eyeY, size * 0.1, size * 0.05, -0.2, 0, Math.PI * 2); ctx.fill();

  // EXTREME WHISKERS (The identifier)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  const whiskAnim = Math.sin(frameCount * 0.12);
  
  // 4 Whiskers (2 top, 2 bottom)
  for(let side = -1; side <= 1; side += 2) {
    // Long main whiskers
    ctx.beginPath();
    ctx.moveTo(size * 1.3, side * size * 0.1);
    ctx.quadraticCurveTo(size * 1.8, side * size * 0.6 + whiskAnim * size * 0.3, size * 0.4, side * size * 1.2);
    ctx.stroke();
    // Shorter secondary whiskers
    ctx.beginPath();
    ctx.moveTo(size * 1.2, side * size * 0.2);
    ctx.quadraticCurveTo(size * 1.5, side * size * 0.8 - whiskAnim * size * 0.2, size * 0.8, side * size * 1.0);
    ctx.stroke();
  }
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
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.4;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // Snake-like Gradient (TEST: Neon Green)
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#39ff14'); // Neon Green
  bodyGrad.addColorStop(0.5, '#39ff14');
  bodyGrad.addColorStop(1, '#39ff14');

  // === THÂN (Extremely long torpedo) ===
  ctx.save();
  ctx.rotate(tailWag * 0.15);
  ctx.beginPath();
  ctx.moveTo(size * 2.2, 0); // Very pointy head
  ctx.bezierCurveTo(size * 1.5, -size * 0.8, -size * 1.5, -size * 0.7, -size * 2.0, 0); 
  ctx.bezierCurveTo(-size * 1.5, size * 0.7, size * 1.5, size * 0.8, size * 2.2, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Heavy Snake Skin Pattern (Dark hex/diamonds)
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  for (let i = 0; i < 15; i++) {
    const tx = size * 1.6 - i * size * 0.25;
    const ty = Math.sin(i * 1.2) * size * 0.4;
    ctx.beginPath();
    ctx.moveTo(tx, ty - size * 0.15);
    ctx.lineTo(tx + size * 0.2, ty);
    ctx.lineTo(tx, ty + size * 0.15);
    ctx.lineTo(tx - size * 0.2, ty);
    ctx.fill();
  }
  ctx.restore();

  // EXTREME LONG DORSAL FIN (Snakehead signature)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(size * 0.8, -size * 0.5); // Starts further forward
  ctx.quadraticCurveTo(-size * 0.5, -size * 1.2, -size * 1.8, -size * 0.3);
  ctx.lineTo(-size * 1.7, 0);
  ctx.fill();

  // Long Anal Fin
  ctx.beginPath();
  ctx.moveTo(size * 1.0, size * 0.5);
  ctx.quadraticCurveTo(-size * 0.4, size * 1.1, -size * 1.8, size * 0.3);
  ctx.lineTo(-size * 1.7, 0);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // === ĐUÔI XOÈ TRÒN (Powerful fan tail) ===
  ctx.save();
  ctx.translate(-size * 2.0, 0);
  ctx.rotate(tailWag * 2.0);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 1.5, -size * 1.8, -size * 0.8, -size * 1.8, 0);
  ctx.bezierCurveTo(-size * 1.8, size * 0.8, -size * 1.0, size * 1.5, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Tail rays
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  for(let i=-2; i<=2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 1.6, i * size * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  // Predatory Eyes (Forward, red-tinted)
  const eyeX = size * 1.8;
  const eyeY = -size * 0.25;
  ctx.fillStyle = '#ef4444'; // Red predatory glow
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.1, 0, Math.PI * 2); ctx.fill();
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
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = size * 0.4;

  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;

  // Smooth skin gradient
  const bodyGrad = ctx.createLinearGradient(0, -size, 0, size);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#0f172a');

  // === THÂN (Sleek and very long) ===
  ctx.save();
  ctx.rotate(tailWag * 0.2);
  ctx.beginPath();
  ctx.moveTo(size * 2.0, 0); // Rounded snout
  ctx.bezierCurveTo(size * 1.5, -size * 0.7, -size * 1.5, -size * 0.6, -size * 2.5, 0); 
  ctx.bezierCurveTo(-size * 1.5, size * 0.6, size * 1.5, size * 0.7, size * 2.0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Slimy highlight
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.3, size * 1.2, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === ĐUÔI LUYÊN (Continuous fin style tail) ===
  ctx.save();
  ctx.translate(-size * 2.5, 0);
  ctx.rotate(tailWag * 1.8);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.8, -size * 0.6, -size * 1.5, -size * 0.4, -size * 1.8, 0);
  ctx.bezierCurveTo(-size * 1.5, size * 0.4, -size * 0.8, size * 0.6, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // Eyes (Small, set forward)
  const eyeX = size * 1.6;
  const eyeY = -size * 0.2;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.03, eyeY, size * 0.06, 0, Math.PI * 2); ctx.fill();
};
