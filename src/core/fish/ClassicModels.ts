
import { FishType } from '../types';

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

  // Gradient
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
  // Đuôi thon dài
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.4, -size * 2.8, -size * 0.1);
  ctx.quadraticCurveTo(-size * 2.9, 0, -size * 2.8, size * 0.1);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.4, 0, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  
  // Vây đuôi mỏng (Continuous fin on the tail)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.25);
  ctx.quadraticCurveTo(-size * 1.5, -size * 0.8, -size * 3.0, 0);
  ctx.quadraticCurveTo(-size * 1.5, size * 0.8, 0, size * 0.25);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.restore();

  // === THÂN & ĐẦU (Head & Body) ===
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0); // Mõm
  // Lưng
  ctx.bezierCurveTo(size * 1.0, -size * 0.7, -size * 0.2, -size * 0.6, -size * 0.6, 0);
  // Bụng
  ctx.bezierCurveTo(-size * 0.2, size * 0.6, size * 1.0, size * 0.7, size * 1.5, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Mottled Skin
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    // Phân bố dọc theo thân
    const rx = size * 1.2 - t * size * 2.0;
    const ry = (Math.cos(i * 321) * size * 0.35);
    if (rx > -size * 0.5) { // Chỉ vẽ trên thân
      ctx.beginPath(); ctx.ellipse(rx, ry, size * 0.2 * (1-t*0.5), size * 0.1 * (1-t*0.5), Math.sin(i), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // Glowy Eyes (Deep sea/mud dweller)
  const eyeX = size * 0.9;
  const eyeY = -size * 0.25;
  ctx.shadowBlur = 10; 
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.ellipse(eyeX, eyeY, size * 0.12, size * 0.06, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.02, 0, Math.PI * 2); ctx.fill();

  // Long Dynamic Whiskers (Barbels)
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = 'round';
  const whiskAnim = Math.sin(frameCount * 0.15);
  
  // Râu trên (chĩa ra sau)
  ctx.beginPath();
  ctx.moveTo(size * 1.4, -size * 0.05);
  ctx.quadraticCurveTo(size * 1.7, -size * 0.5 + whiskAnim * size * 0.2, size * 0.5, -size * 0.9);
  ctx.stroke();
  
  // Râu dưới (chĩa xuống bùn)
  ctx.beginPath();
  ctx.moveTo(size * 1.3, size * 0.15);
  ctx.quadraticCurveTo(size * 1.6, size * 0.6 - whiskAnim * size * 0.2, size * 0.6, size * 1.0);
  ctx.stroke();
};
