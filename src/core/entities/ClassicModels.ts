
import { FishType } from '../../types';
import { lerpColor } from '../graphics/Utils';

export const drawAnchovy = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.15;
  ctx.save();
  
  // 1. CHROME BODY (Ultra-thin silver)
  const chromeGrad = ctx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
  chromeGrad.addColorStop(0, '#f1f5f9');
  chromeGrad.addColorStop(0.5, color);
  chromeGrad.addColorStop(1, '#cbd5e1');

  ctx.fillStyle = chromeGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0);
  ctx.bezierCurveTo(size * 1.2, -size * 0.5, -size * 1.2, -size * 0.5, -size * 1.8, 0);
  ctx.bezierCurveTo(-size * 1.2, size * 0.5, size * 1.2, size * 0.5, size * 1.8, 0);
  ctx.fill();

  // 2. SILVER LATERAL LINE (Iconic anchovy feature)
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.lineTo(-size * 1.5, 0);
  ctx.stroke();

  // 3. DYNAMIC METALLIC SPARKLES
  ctx.globalAlpha = 0.8;
  for(let i=0; i<4; i++) {
    const ox = Math.sin(time + i * 2) * size * 1.2;
    const oy = (i - 1.5) * size * 0.15;
    const s = 1 + Math.sin(time * 2 + i) * 1;
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(ox, oy, s, 0, Math.PI * 2); ctx.fill();
  }
  
  // 4. ELEGANT FORKED TAIL
  ctx.save();
  ctx.translate(-size * 1.8, 0);
  ctx.rotate(Math.sin(time * 1.2) * 0.4);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.4, -size * 0.6, -size * 0.8, -size * 0.5, -size * 0.7, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 0.5, -size * 0.4, size * 0.6, 0, 0);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawPomfret = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * wagFreq;
  const wag = Math.sin(time) * wagAmp;
  ctx.save();
  
  // 1. DISK-SHAPED BODY (Iconic Pomfret/Butterflyfish silhouette)
  const silverGrad = ctx.createRadialGradient(size * 0.2, 0, 0, 0, 0, size * 2.0);
  silverGrad.addColorStop(0, '#f8fafc');
  silverGrad.addColorStop(0.6, color);
  silverGrad.addColorStop(1, '#475569');

  ctx.fillStyle = silverGrad;
  ctx.beginPath();
  // Very tall and thin body
  ctx.moveTo(size * 1.2, 0); // Snout
  ctx.bezierCurveTo(size * 1.0, -size * 2.2, -size * 0.8, -size * 2.0, -size * 1.2, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 2.0, size * 1.0, size * 2.2, size * 1.2, 0);
  ctx.fill();

  // 2. LONG SYMMETRICAL FINS (High dorsal and anal fins)
  ctx.save();
  const finColor = lerpColor(color, '#000000', 0.3);
  ctx.fillStyle = finColor;
  
  // Dorsal (Top) - High and pointy
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 1.8);
  ctx.lineTo(-size * 1.5, -size * 0.5);
  ctx.lineTo(-size * 0.4, -size * 1.2);
  ctx.fill();

  // Anal (Bottom) - Mirror of dorsal
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 1.8);
  ctx.lineTo(-size * 1.5, size * 0.5);
  ctx.lineTo(-size * 0.4, size * 1.2);
  ctx.fill();
  ctx.restore();

  // 3. EYE WITH BAND (Butterflyfish often have a dark eye band)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(size * 0.8, 0, size * 0.2, size * 1.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.8, -size * 0.4, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.85, -size * 0.4, size * 0.08, 0, Math.PI * 2); ctx.fill();

  // 4. FORKED TAIL
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(wag);
  ctx.fillStyle = finColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.2, -size * 1.4);
  ctx.lineTo(-size * 0.6, 0);
  ctx.lineTo(-size * 1.2, size * 1.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawMackerel = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * 0.1;
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  
  // 1. TORPEDO METALLIC BODY
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
  bodyGrad.addColorStop(0, '#1e3a8a'); // Deep ocean blue top
  bodyGrad.addColorStop(0.3, '#60a5fa'); // Metallic blue mid
  bodyGrad.addColorStop(0.7, '#f8fafc'); // Silver side
  bodyGrad.addColorStop(1, '#cbd5e1');   // White belly

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Sleek torpedo shape
  ctx.moveTo(size * 2.2, 0); // Snout
  ctx.bezierCurveTo(size * 1.5, -size * 0.7, -size * 1.0, -size * 0.6, -size * 2.2, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 0.6, size * 1.5, size * 0.7, size * 2.2, 0);
  ctx.fill();

  // 2. WAVY TIGER STRIPES (Họa tiết vằn đặc thù)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(size * 2.2, 0);
  ctx.bezierCurveTo(size * 1.5, -size * 0.7, -size * 1.0, -size * 0.6, -size * 2.2, 0);
  ctx.lineTo(-size * 2.2, -size * 0.2); // Only on top half
  ctx.lineTo(size * 2.2, -size * 0.2);
  ctx.clip();
  
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.lineWidth = 1.2;
  for (let i = -8; i < 8; i++) {
    const x = i * size * 0.3;
    // Irregular stripes: varying length and "wobble"
    const lengthMult = 0.4 + Math.random() * 0.4;
    const wobble = Math.sin(i * 2) * size * 0.1;
    
    ctx.beginPath();
    ctx.moveTo(x + wobble, -size * 0.8);
    ctx.bezierCurveTo(
      x + size * 0.1, -size * 0.5, 
      x - size * 0.1, -size * 0.2, 
      x + wobble * 0.5, -size * (0.8 - lengthMult)
    );
    ctx.stroke();
  }
  ctx.restore();
  
  // 4. POWERFUL FORKED TAIL
  ctx.save();
  ctx.translate(-size * 2.2, 0);
  ctx.rotate(tailWag * 1.5);
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.2, -size * 1.2);
  ctx.lineTo(-size * 0.7, 0);
  ctx.lineTo(-size * 1.2, size * 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 5. SHARP HEAD & EYE
  const eyeX = size * 1.6, eyeY = -size * 0.15;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.03, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawBlackCarp = (
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
  
  // 1. ELONGATED CHARCOAL BODY
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.7, 0, size * 0.7);
  bodyGrad.addColorStop(0, '#1e293b'); // Dark slate top
  bodyGrad.addColorStop(0.5, color);    // Deep charcoal
  bodyGrad.addColorStop(1, '#0f172a');   // Black bottom

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Strong, cylindrical body shape
  ctx.moveTo(size * 2.2, 0); // Snout
  ctx.bezierCurveTo(size * 1.5, -size * 0.9, -size * 1.2, -size * 0.8, -size * 2.2, 0);
  ctx.bezierCurveTo(-size * 1.2, size * 0.8, size * 1.5, size * 0.9, size * 2.2, 0);
  ctx.fill();

  // 2. LARGE DIAMOND SCALES (Vảy rồng lớn)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.8, size * 0.8, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.8;
  const scaleSize = size * 0.4;
  for (let x = -size * 2.2; x < size * 2.2; x += scaleSize * 0.6) {
      for (let y = -size; y < size; y += scaleSize * 0.5) {
          const shift = (Math.floor(x / (scaleSize * 0.6)) % 2) * (scaleSize * 0.3);
          // Overlapping Arcs (Scutes)
          ctx.beginPath();
          ctx.arc(x, y + shift, scaleSize * 0.5, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
      }
  }
  ctx.restore();

  // 3. STRONG SHARP FINS (Vây đen cứng cáp)
  ctx.fillStyle = '#020617';
  // Dorsal
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.8);
  ctx.lineTo(-size * 1.2, -size * 1.3);
  ctx.lineTo(-size * 0.8, -size * 0.6);
  ctx.fill();
  
  // Anal
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, size * 0.8);
  ctx.lineTo(-size * 1.3, size * 1.1);
  ctx.lineTo(-size * 0.9, size * 0.6);
  ctx.fill();

  // 4. POWERFUL TAIL
  ctx.save();
  ctx.translate(-size * 2.2, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.0, -size * 1.2, -size * 1.8, -size * 1.5, -size * 1.6, 0);
  ctx.bezierCurveTo(-size * 1.8, size * 1.5, -size * 1.0, size * 1.2, 0, 0);
  ctx.fill();
  ctx.restore();

  // 5. STURDY HEAD & EYE
  const eyeX = size * 1.65, eyeY = -size * 0.25;
  ctx.fillStyle = '#475569'; // Socket
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbbf24'; // Yellow eye typical of some black carp
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.1, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawTilapia = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * wagFreq;
  const wag = Math.sin(time) * wagAmp;
  ctx.save();
  
  // 1. PREMIUM CHUNKY BODY (With Iridescent Sheen)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.0, 0, size * 1.0);
  bodyGrad.addColorStop(0, lerpColor(color, '#94a3b8', 0.3)); // Slate-ish top
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.6, lerpColor(color, '#ffffff', 0.4)); // Iridescent highlight
  bodyGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, 0); // Snout
  ctx.bezierCurveTo(size * 1.2, -size * 1.4, -size * 0.8, -size * 1.4, -size * 1.6, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 1.4, size * 1.2, size * 1.4, size * 1.6, 0);
  ctx.fill();

  // Glossy Shine (Premium highlight layer)
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const shineGrad = ctx.createLinearGradient(0, -size * 1.2, 0, 0);
  shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shineGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.4, size * 1.4, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. ELEGANT SPINY DORSAL FIN (Realistic Spikes)
  ctx.save();
  const finGrad = ctx.createLinearGradient(0, -size * 1.5, 0, -size * 0.5);
  finGrad.addColorStop(0, lerpColor(color, '#000000', 0.4));
  finGrad.addColorStop(1, color);
  
  ctx.fillStyle = finGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.8, -size * 0.7);
  
  // Create realistic spikes
  const numSpikes = 10;
  for (let i = 0; i <= numSpikes; i++) {
    const t = i / numSpikes;
    const x = size * (0.8 - i * 0.25);
    const spikeHeight = size * (0.8 + Math.sin(t * Math.PI) * 0.8);
    ctx.lineTo(x, -size * 0.7 - spikeHeight);
    if (i < numSpikes) {
      ctx.lineTo(x - size * 0.1, -size * 0.7 - spikeHeight * 0.7); // The "dip" between spikes
    }
  }
  ctx.lineTo(-size * 1.6, -size * 0.4);
  ctx.closePath();
  ctx.fill();

  // High-contrast fin rays
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.2;
  for(let i=0; i<numSpikes; i++) {
    const x = size * (0.8 - i * 0.25);
    const spikeHeight = size * (0.8 + Math.sin((i/numSpikes) * Math.PI) * 0.8);
    ctx.beginPath(); 
    ctx.moveTo(x, -size * 0.7); 
    ctx.lineTo(x, -size * 0.7 - spikeHeight); 
    ctx.stroke();
  }
  ctx.restore();

  // 3. ARTISTIC VERTICAL BARS
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'black';
  for (let i = 0; i < 6; i++) {
      const x = size * (0.8 - i * 0.45);
      ctx.beginPath();
      ctx.ellipse(x, 0, size * 0.15, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 4. ICONIC STRIPED TAIL (Polished)
  ctx.save();
  ctx.translate(-size * 1.6, 0);
  ctx.rotate(wag);
  ctx.fillStyle = finGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.5, -size * 0.8, -size * 1.0, -size * 1.4, -size * 1.5, -size * 1.2);
  ctx.lineTo(-size * 1.2, 0);
  ctx.lineTo(-size * 1.5, size * 1.2);
  ctx.bezierCurveTo(-size * 1.0, size * 1.4, -size * 0.5, size * 0.8, 0, 0);
  ctx.fill();

  // Clean vertical white stripes on tail
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.3 * i, -size * 0.25 * i - size * 0.3);
      ctx.lineTo(-size * 0.3 * i, size * 0.25 * i + size * 0.3);
      ctx.stroke();
  }
  ctx.restore();

  // 5. DETAILED HEAD
  // Gill cover
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(size * 0.7, 0, size * 0.6, -0.6, 0.6); ctx.stroke();
  
  // Eye (with highlight)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.arc(size * 1.1, -size * 0.3, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 1.15, -size * 0.35, size * 0.05, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawHemibagrus = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * wagFreq;
  const wag = Math.sin(time) * wagAmp;
  ctx.save();
  
  // 1. ELONGATED CATFISH BODY (With Lateral Line)
  const bodyGrad = ctx.createLinearGradient(-size, 0, size * 2, 0);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.3, color);
  bodyGrad.addColorStop(1, lerpColor(color, '#ffffff', 0.15));

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 2.2, 0); 
  ctx.bezierCurveTo(size * 1.5, -size * 0.85, -size * 1.0, -size * 0.65, -size * 2.5, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 0.65, size * 1.5, size * 0.85, size * 2.2, 0);
  ctx.fill();

  // Glossy Skin Highlight (Wet catfish look)
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const wetGrad = ctx.createLinearGradient(0, -size * 0.8, 0, 0);
  wetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  wetGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = wetGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.3, size * 2.0, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Specular reflection on head
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath(); ctx.ellipse(size * 1.8, -size * 0.2, size * 0.3, size * 0.1, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Subtle lateral line
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.quadraticCurveTo(0, size * 0.1, -size * 2.0, 0);
  ctx.stroke();

  // Skin Mottling (Subtle spots common in Hemibagrus)
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'black';
  for(let i=0; i<8; i++) {
    const sx = size * (1.0 - i * 0.4);
    const sy = Math.sin(i * 1.5) * size * 0.3;
    ctx.beginPath(); ctx.arc(sx, sy, size * 0.08, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 2. ADIPOSE FIN (Dynamic sway)
  ctx.save();
  ctx.translate(-size * 1.5, -size * 0.5);
  ctx.rotate(Math.sin(time * 0.5) * 0.1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.3, -size * 0.8, 0.2 * size);
  ctx.fill();
  ctx.restore();

  // 3. DORSAL SPINE (With ray details)
  ctx.save();
  ctx.translate(size * 0.5, -size * 0.65);
  ctx.rotate(Math.sin(time * 0.3) * 0.05);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.2, -size * 0.8);
  ctx.lineTo(-size * 0.8, 0.2 * size);
  ctx.fill();
  // Fin rays
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(-size * 0.1, -size * 0.4); ctx.lineTo(-size * 0.2, -size * 0.8); ctx.stroke();
  ctx.restore();

  // 4. DYNAMIC LONG WHISKERS (Barbels with individual phases)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.2;
  const drawWhiskers = (side: number) => {
      // Long top whisker - waving with delay
      const wave1 = Math.sin(time * 0.8 + side) * 0.2;
      ctx.beginPath();
      ctx.moveTo(size * 1.9, side * size * 0.15);
      ctx.bezierCurveTo(
          size * 2.8, side * size * (1.2 + wave1), 
          size * 1.2, side * size * (2.2 - wave1), 
          size * 0.2, side * size * (1.8 + wave1)
      );
      ctx.stroke();
      
      // Short bottom whisker
      const wave2 = Math.cos(time * 1.2 + side) * 0.15;
      ctx.beginPath();
      ctx.moveTo(size * 2.1, side * size * 0.1);
      ctx.quadraticCurveTo(size * 2.8, side * size * (0.6 + wave2), size * 2.5, side * size * (0.9 - wave2));
      ctx.stroke();
  };
  drawWhiskers(-1); drawWhiskers(1);

  // 5. DEEPLY FORKED TAIL (Polished)
  ctx.save();
  ctx.translate(-size * 2.5, 0);
  ctx.rotate(wag);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.8, -size * 1.4);
  ctx.lineTo(-size * 1.0, 0);
  ctx.lineTo(-size * 1.8, size * 1.4);
  ctx.closePath();
  ctx.fill();
  // Tail rays
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.moveTo(-size * 0.5, -size * 0.4); ctx.lineTo(-size * 1.5, -size * 1.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-size * 0.5, size * 0.4); ctx.lineTo(-size * 1.5, size * 1.1); ctx.stroke();
  ctx.restore();

  // 6. DETAILED FACE
  // Eye with a small silver ring
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(size * 1.7, -size * 0.32, size * 0.12, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 1.7, -size * 0.32, size * 0.09, 0, Math.PI * 2); ctx.fill();
  
  // Mouth detail
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.moveTo(size * 2.2, size * 0.05); ctx.quadraticCurveTo(size * 2.0, size * 0.1, size * 1.8, size * 0.05); ctx.stroke();

  ctx.restore();
};

export const drawCaveEel = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * wagFreq;
  ctx.save();
  
  // 1. SINUOUS EXTREMELY LONG BODY
  const segments = 15;
  const segmentSize = size * 0.45;
  
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw Dorsal Fin first (Underneath)
  ctx.beginPath();
  ctx.strokeStyle = lerpColor(color, '#000000', 0.2);
  ctx.lineWidth = segmentSize * 1.5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = size * 1.5 - i * size * 0.45;
    const y = Math.sin(time + i * 0.5) * size * 0.8 * t;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw Body
  ctx.beginPath();
  const bodyGrad = ctx.createLinearGradient(size * 1.5, 0, -size * 4, 0);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(1, '#000000');
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = segmentSize;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = size * 1.5 - i * size * 0.45;
    const y = Math.sin(time + i * 0.5) * size * 0.8 * t;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 2. BIOLUMINESCENT SPOTS (Cave specialty)
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#fbbf24';
  ctx.fillStyle = '#fde68a';
  for (let i = 2; i < segments - 2; i++) {
    const x = size * 1.5 - i * size * 0.45;
    const y = Math.sin(time + i * 0.5) * size * 0.8 * (i/segments);
    const pulse = (Math.sin(time * 2 + i) + 1) * 0.5;
    if (pulse > 0.7) {
        ctx.beginPath(); 
        ctx.arc(x, y - segmentSize * 0.3, size * 0.08 * pulse, 0, Math.PI * 2); 
        ctx.fill();
    }
  }
  ctx.restore();

  // 3. HEAD & MILKY EYES (Blind cave look)
  const headX = size * 1.5;
  const headY = 0;
  ctx.translate(headX, headY);
  
  // Head shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.6, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Milky Eyes (Blind)
  ctx.shadowBlur = 15; ctx.shadowColor = 'white';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(size * 0.2, -size * 0.1, size * 0.08, 0, Math.PI * 2); ctx.fill();
  
  // Faint whiskers
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(size * 0.4, 0); ctx.quadraticCurveTo(size * 0.8, -size * 0.4, size * 1.0, -size * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size * 0.4, size * 0.1); ctx.quadraticCurveTo(size * 0.8, size * 0.4, size * 1.0, size * 0.2); ctx.stroke();

  ctx.restore();
};

export const drawGoby = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string
) => {
  const time = frameCount * 0.05;
  const wag = Math.sin(time * 4) * 0.2;
  ctx.save();
  
  // 1. FLAT HEAD & BULGING EYES (Iconic Goby look)
  const headGrad = ctx.createRadialGradient(size * 0.8, -size * 0.4, 0, size * 0.8, 0, size * 1.2);
  headGrad.addColorStop(0, color);
  headGrad.addColorStop(1, '#1e293b');
  
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, 0); // Flat head front
  ctx.bezierCurveTo(size * 1.2, -size * 1.2, -size * 0.5, -size * 1.0, -size * 2.0, 0);
  ctx.bezierCurveTo(-size * 0.5, size * 1.0, size * 1.2, size * 1.2, size * 1.6, 0);
  ctx.fill();

  // Bulging eyes on TOP
  const drawGobyEye = (side: number) => {
    ctx.save();
    ctx.translate(size * 0.8, side * size * 0.5);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(size * 0.05, 0, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  drawGobyEye(-1); drawGobyEye(1);

  // 2. LARGE FAN-LIKE PECTORAL FINS (For bottom dwelling)
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  for(let side = -1; side <=1; side +=2) {
    ctx.save();
    ctx.translate(size * 0.4, side * size * 0.4);
    ctx.rotate(side * (0.8 + wag));
    
    // Fan shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.8, side * size * 0.8, -size * 0.2, side * size * 1.5, -size * 0.8, side * size * 0.8);
    ctx.fill();
    
    // Fin rays
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for(let i=0; i<5; i++) {
        const fang = (i / 4) * Math.PI * 0.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(fang) * size * 1.0, side * Math.sin(fang) * size * 1.2);
        ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();

  // 3. SHORT TAIL
  ctx.save();
  ctx.translate(-size * 2.0, 0);
  ctx.rotate(wag * 1.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawSalmon = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  size: number,
  color: string,
  wagFreq: number,
  wagAmp: number
) => {
  const time = frameCount * 0.1;
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();
  
  // 1. SLEEK PINK-SILVER BODY
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.6);
  bodyGrad.addColorStop(0, '#f87171'); // Pinkish top
  bodyGrad.addColorStop(0.4, color);    // Base silver/pink
  bodyGrad.addColorStop(1, '#f1f5f9');   // Silver-white belly

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Elegant elongated shape
  ctx.moveTo(size * 2.0, 0); // Snout
  ctx.bezierCurveTo(size * 1.2, -size * 0.8, -size * 1.0, -size * 0.7, -size * 2.2, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 0.7, size * 1.2, size * 0.8, size * 2.0, 0);
  ctx.fill();

  // 2. SMALL BLACK SPECKLES (Đốm đen li ti)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.8, size * 0.6, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
  for (let i = 0; i < 40; i++) {
    const rx = size * (1.8 - Math.random() * 3.5);
    const ry = -size * (0.1 + Math.random() * 0.5);
    const dotSize = size * (0.02 + Math.random() * 0.04);
    ctx.beginPath(); ctx.arc(rx, ry, dotSize, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // 3. FINS (Including Adipose Fin)
  ctx.fillStyle = color;
  // Main Dorsal
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.7);
  ctx.lineTo(-size * 0.6, -size * 1.1);
  ctx.lineTo(-size * 0.4, -size * 0.6);
  ctx.fill();
  
  // ICONIC ADIPOSE FIN (Vây mỡ đặc trưng cá hồi)
  ctx.beginPath();
  ctx.ellipse(-size * 1.4, -size * 0.5, size * 0.2, size * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // 4. TAIL (Forked)
  ctx.save();
  ctx.translate(-size * 2.2, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.0, -size * 0.9);
  ctx.lineTo(-size * 0.6, 0);
  ctx.lineTo(-size * 1.0, size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 5. HEAD & HOOKED JAW (The Kype)
  ctx.save();
  ctx.translate(size * 2.0, 0);
  ctx.rotate(Math.sin(time * 0.5) * 0.05);
  
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Lower jaw with hook (kype)
  ctx.moveTo(0, size * 0.1);
  ctx.quadraticCurveTo(size * 0.5, size * 0.3, size * 0.3, -size * 0.2); // The hook
  ctx.lineTo(0, size * 0.1);
  ctx.fill();
  
  // Upper snout
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.2, 0, -size * 0.4);
  ctx.fill();
  ctx.restore();

  // Real Eye
  const eyeX = size * 1.5, eyeY = -size * 0.25;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.08, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

export const drawCrucian = (
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
  
  // 1. DEEP OVAL BRONZE BODY
  const bodyGrad = ctx.createRadialGradient(size * 0.5, -size * 0.5, size * 0.2, 0, 0, size * 2.2);
  bodyGrad.addColorStop(0, '#fde68a'); // Golden highlight
  bodyGrad.addColorStop(0.4, color);    // Base bronze/gold
  bodyGrad.addColorStop(1, '#451a03');   // Dark bottom shadow

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, 0);
  ctx.bezierCurveTo(size * 1.2, -size * 1.6, -size * 1.0, -size * 1.5, -size * 1.6, 0);
  ctx.bezierCurveTo(-size * 1.0, size * 1.5, size * 1.2, size * 1.6, size * 1.6, 0);
  ctx.fill();

  // 2. OVERLAPPING GOLDEN SCALES
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.4, size * 1.2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
  ctx.lineWidth = 1;
  for (let x = -size * 1.5; x < size * 1.5; x += size * 0.4) {
      for (let y = -size * 1.2; y < size * 1.2; y += size * 0.4) {
          const shift = (Math.floor(x / (size * 0.4)) % 2) * size * 0.2;
          ctx.beginPath();
          ctx.arc(x, y + shift, size * 0.25, -Math.PI * 0.1, Math.PI * 1.1);
          ctx.stroke();
      }
  }
  ctx.restore();

  // 3. HIGH DORSAL FIN (High and rounded)
  ctx.save();
  ctx.fillStyle = lerpColor(color, '#000', 0.2);
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 1.2);
  ctx.quadraticCurveTo(-size * 1.2, -size * 1.8, -size * 1.8, -size * 0.8);
  ctx.lineTo(-size * 0.8, -size * 0.8);
  ctx.fill();
  // Fin rays
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  for(let i=0; i<4; i++) {
      ctx.beginPath(); ctx.moveTo(-size * (0.6 + i*0.2), -size * 1.0); ctx.lineTo(-size * (0.8 + i*0.2), -size * 1.5); ctx.stroke();
  }
  ctx.restore();

  // 4. ROUNDED TAIL
  ctx.save();
  ctx.translate(-size * 1.5, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.8, -size * 1.2, -size * 1.6, -size * 1.0, -size * 1.4, 0);
  ctx.bezierCurveTo(-size * 1.6, size * 1.0, -size * 0.8, size * 1.2, 0, 0);
  ctx.fill();
  ctx.restore();

  // 5. HEAD & GILLS
  // Eye
  const eyeX = size * 1.1, eyeY = -size * 0.4;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();
  
  // Gill cover
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(size * 0.6, 0, size * 0.8, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  ctx.restore();
};

export const drawBigheadCarp = (
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
  
  // 1. DEEP BELLY SILVER BODY (Thân bụng phệ theo hình mẫu)
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.7, 0, size * 1.2);
  bodyGrad.addColorStop(0, '#64748b'); // Lưng xám đậm
  bodyGrad.addColorStop(0.3, color);    // Bạc chủ đạo
  bodyGrad.addColorStop(0.7, '#f8fafc'); // Bụng bạc sáng
  bodyGrad.addColorStop(1, '#fdba74');   // Ánh cam nhẹ ở dưới bụng

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Tạo dáng bụng phệ và sâu ở phía trước
  ctx.moveTo(size * 2.0, -size * 0.2); // Snout
  ctx.bezierCurveTo(size * 1.5, -size * 1.0, -size * 0.5, -size * 0.9, -size * 2.2, 0); // Lưng
  ctx.bezierCurveTo(-size * 1.0, size * 1.3, size * 1.5, size * 1.8, size * 2.0, -size * 0.2); // Bụng phệ
  ctx.fill();

  // 2. ULTRA-LOW EYES (Mắt nằm cực thấp sát miệng)
  const eyeX = size * 1.55, eyeY = size * 0.35;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.04, eyeY, size * 0.1, 0, Math.PI * 2); ctx.fill();

  // 3. REDDISH GILL/THROAT AREA (Vùng họng màu cam đỏ)
  ctx.save();
  const throatGrad = ctx.createRadialGradient(size * 1.5, size * 0.8, 0, size * 1.5, size * 0.8, size * 1.2);
  throatGrad.addColorStop(0, 'rgba(251, 146, 60, 0.3)');
  throatGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = throatGrad;
  ctx.beginPath();
  ctx.ellipse(size * 1.4, size * 0.6, size * 0.8, size * 0.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. DORSAL FIN (Vây lưng trên - gần đuôi)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size * 0.7);
  ctx.lineTo(-size * 1.1, -size * 1.0);
  ctx.lineTo(-size * 0.9, -size * 0.45);
  ctx.fill();

  // 5. ANAL FIN (Vây hậu môn dưới - gần đuôi)
  ctx.fillStyle = '#fb923c'; // Ánh cam theo hình mẫu
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, size * 0.7);
  ctx.lineTo(-size * 1.1, size * 1.0);
  ctx.lineTo(-size * 0.9, size * 0.45);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 6. POWERFUL FORKED TAIL (Đuôi xẻ sâu)
  ctx.save();
  ctx.translate(-size * 2.2, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.4, -size * 1.1);
  ctx.lineTo(-size * 0.8, 0);
  ctx.lineTo(-size * 1.4, size * 1.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawCarpGeneric = (
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
  
  // 1. DEEP ROUNDED BODY (Carp/Crucian style)
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.4, 0, size * 1.4);
  bodyGrad.addColorStop(0, lerpColor(color, '#000', 0.3));
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#f8fafc');

  // Tail
  ctx.save();
  ctx.translate(-size * 1.2, 0);
  ctx.rotate(tailWag * 1.3);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.bezierCurveTo(-size * 1.5, -size * 1.5, -size * 2.5, -size * 1.0, -size * 2.2, 0);
  ctx.bezierCurveTo(-size * 2.5, size * 1.0, -size * 1.5, size * 1.5, 0, 0);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0);
  ctx.bezierCurveTo(size * 1.0, -size * 1.6, -size * 0.8, -size * 1.4, -size * 1.5, 0);
  ctx.bezierCurveTo(-size * 0.8, size * 1.4, size * 1.0, size * 1.6, size * 1.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Scales (Golden/Silver reflection - Staggered arcs)
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, size * 1.6, size * 1.3, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(255,215,0,0.15)';
  ctx.lineWidth = 1;
  const cScaleSize = size * 0.35;
  for(let x = -size * 2; x < size * 2; x += cScaleSize * 0.7) {
    for(let y = -size * 1.5; y < size * 1.5; y += cScaleSize) {
      const stagger = (Math.floor(x / (cScaleSize * 0.7)) % 2) * (cScaleSize * 0.5);
      ctx.beginPath();
      ctx.arc(x, y + stagger, cScaleSize * 0.6, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Head
  const eyeX = size * 1.2, eyeY = -size * 0.4;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};
export const drawAnabas = (
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
  
  // 1. ROBUST BODY GRADIENT
  const bodyGrad = ctx.createLinearGradient(0, -size * 1.3, 0, size * 1.3);
  bodyGrad.addColorStop(0, '#064e3b'); // Dark green top
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, '#fef3c7'); // Pale belly

  // 2. ROUNDED CAUDAL FIN (Tail)
  ctx.save();
  ctx.translate(-size * 1.0, 0);
  ctx.rotate(tailWag * 1.2);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 1.5, -size * 1.8, -size * 3.0, -size * 1.2, -size * 2.8, 0);
  ctx.bezierCurveTo(-size * 3.0, size * 1.2, -size * 1.5, size * 1.8, 0, 0);
  ctx.fill();
  
  // Tail rays
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for(let i=-2; i<=2; i++) {
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-size * 2.5, i * size * 0.4); ctx.stroke();
  }
  ctx.restore();

  // 3. DEEP BODY (The iconic robust Anabas shape)
  ctx.beginPath();
  ctx.moveTo(size * 1.8, 0); // Blunt snout
  ctx.bezierCurveTo(size * 1.2, -size * 1.5, -size * 0.5, -size * 1.4, -size * 1.2, 0);
  ctx.bezierCurveTo(-size * 0.5, size * 1.4, size * 1.2, size * 1.5, size * 1.8, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 4. SPINY DORSAL FIN (Starts from head, very prominent)
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.9);
  // Spiny profile
  const numSpines = 7;
  for(let i=0; i<=numSpines; i++) {
    const tx = size * 0.5 - i * (size * 1.8 / numSpines);
    const ty = -size * (1.2 + Math.sin(i * 0.8) * 0.3);
    ctx.lineTo(tx, ty);
    // Add sharp point effect
    if (i < numSpines) ctx.lineTo(tx - size * 0.05, ty + size * 0.1);
  }
  ctx.lineTo(-size * 1.0, -size * 0.4);
  ctx.fill();
  ctx.restore();

  // 5. SPINY ANAL FIN
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.9);
  ctx.lineTo(-size * 0.4, size * 1.4);
  ctx.lineTo(-size * 0.8, size * 1.3);
  ctx.lineTo(-size * 1.1, size * 0.5);
  ctx.fill();
  ctx.restore();

  // 6. LARGE PECTORAL FIN
  ctx.save();
  ctx.translate(size * 0.4, size * 0.2);
  ctx.rotate(0.4 + tailWag * 0.5);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 7. HEAD DETAILS
  // Large Operculum (Gill cover)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size * 0.8, 0, size * 0.6, -Math.PI/3, Math.PI/3);
  ctx.stroke();

  // Eye
  const eyeX = size * 1.35, eyeY = -size * 0.3;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(eyeX, eyeY, size * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(eyeX + size * 0.05, eyeY, size * 0.12, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
};

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
  const time = frameCount * 0.05;
  const tailWag = Math.sin(frameCount * wagFreq) * wagAmp;
  ctx.save();

  // 1. SINUOUS BODY PHYSICS (Ribbon motion)
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, '#cbd5e1');

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(size * 2.0, 0); // Head front

  // Draw sinuous body segment by segment
  const segments = 20;
  for(let i=0; i<=segments; i++) {
    const x = size * 2.0 - (i / segments) * size * 6.5;
    const yWave = Math.sin(time * 4 - (i / segments) * 5) * size * 0.6;
    const thickness = size * (0.5 * (1 - (i / segments) * 0.6));
    
    // Top line
    if(i===0) ctx.lineTo(x, yWave - thickness);
    else ctx.quadraticCurveTo(x + size * 0.2, yWave - thickness, x, yWave - thickness);
  }
  for(let i=segments; i>=0; i--) {
    const x = size * 2.0 - (i / segments) * size * 6.5;
    const yWave = Math.sin(time * 4 - (i / segments) * 5) * size * 0.6;
    const thickness = size * (0.5 * (1 - (i / segments) * 0.6));
    
    // Bottom line
    ctx.lineTo(x, yWave + thickness);
  }
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // 2. HEAD DETAILS (Snakelike)
  ctx.save();
  ctx.translate(size * 1.8, Math.sin(time * 4) * size * 0.1);
  // Small predatory eye
  ctx.fillStyle = '#f87171';
  ctx.beginPath(); ctx.arc(0, -size * 0.15, size * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.02, -size * 0.15, size * 0.06, 0, Math.PI * 2); ctx.fill();
  
  // Mouth seam
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, size * 0.1); ctx.lineTo(-size * 0.5, size * 0.05); ctx.stroke();
  ctx.restore();

  ctx.restore();
};
