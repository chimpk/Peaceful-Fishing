
import { LocationType, TimeOfDay } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/gameData';
import { SKY_COLORS, WATER_COLORS, lerpColor, drawVignette } from './Utils';

export const drawWaterAndSky = (
  ctx: CanvasRenderingContext2D, 
  frame: number, 
  weather: 'sunny' | 'rainy' | 'stormy' | 'foggy' = 'sunny', 
  location: LocationType = 'POND', 
  timeOfDay: TimeOfDay = 'DAY',
  prevTimeOfDay: TimeOfDay = 'DAY',
  transition: number = 1 // 0 to 1
) => {
  const getSkyTarget = (t: TimeOfDay) => {
    if (location === 'CAVE') return SKY_COLORS.CAVE;
    if (t === 'NIGHT') return SKY_COLORS.NIGHT;
    if (t === 'SUNSET') return SKY_COLORS.SUNSET;
    if (weather === 'sunny') return SKY_COLORS.DAY_SUNNY;
    if (weather === 'rainy') return SKY_COLORS.DAY_RAINY;
    if (weather === 'foggy') return ['#94a3b8', '#cbd5e1'];
    return SKY_COLORS.DAY_STORMY;
  };

  const getWaterTarget = (t: TimeOfDay) => {
    if (location === 'CAVE') return WATER_COLORS.CAVE;
    const key = `${location}_${t}` as keyof typeof WATER_COLORS;
    return WATER_COLORS[key] || WATER_COLORS.POND_DAY;
  };

  const skyPrev = getSkyTarget(prevTimeOfDay);
  const skyCurr = getSkyTarget(timeOfDay);
  const waterPrev = getWaterTarget(prevTimeOfDay);
  const waterCurr = getWaterTarget(timeOfDay);

  // --- Draw Sky ---
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
  skyGrad.addColorStop(0, lerpColor(skyPrev[0], skyCurr[0], transition));
  skyGrad.addColorStop(1, lerpColor(skyPrev[1], skyCurr[1], transition));
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 200);

  // --- Background Scenery ---
  ctx.save();
  if (location === 'POND') {
    drawHills(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'OCEAN') {
    drawClouds(ctx, frame, transition, timeOfDay, prevTimeOfDay);
    if (weather === 'sunny') {
        drawBirds(ctx, frame);
    }
  } else if (location === 'CAVE') {
    drawCaveFormations(ctx, frame, transition);
  }
  ctx.restore();

  // Stars for Night
  const nightAlpha = timeOfDay === 'NIGHT' ? transition : (prevTimeOfDay === 'NIGHT' ? 1 - transition : 0);
  if (location !== 'CAVE' && nightAlpha > 0.05 && weather === 'sunny') {
    ctx.save();
    ctx.globalAlpha = nightAlpha;
    ctx.fillStyle = 'white';
    for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(i * 123) * 1000) % CANVAS_WIDTH;
        const sy = (Math.cos(i * 321) * 1000) % 200;
        ctx.beginPath();
        ctx.arc(Math.abs(sx), Math.abs(sy), Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }

  // --- Draw Water ---
  const waterGrad = ctx.createLinearGradient(0, 200, 0, CANVAS_HEIGHT);
  waterGrad.addColorStop(0, lerpColor(waterPrev[0], waterCurr[0], transition));
  waterGrad.addColorStop(0.5, lerpColor(waterPrev[1], waterCurr[1], transition));
  waterGrad.addColorStop(1, lerpColor(waterPrev[2], waterCurr[2], transition));
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 200, CANVAS_WIDTH, CANVAS_HEIGHT - 200);

  // --- Underwater Details ---
  if (location === 'POND') {
    drawUnderwaterPond(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'OCEAN') {
    drawUnderwaterOcean(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'CAVE') {
    drawUnderwaterCave(ctx, frame, transition);
  }

  drawUnderwaterParticles(ctx, frame, location);

  // Water Reflection
  if (location !== 'CAVE') {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.scale(1, -0.3);
    ctx.translate(0, -1333);
    if (location === 'POND') drawHills(ctx, frame, transition, timeOfDay, prevTimeOfDay);
    ctx.restore();
  }

  // Wave Layers
  const drawWave = (offsetY: number, amplitude: number, frequency: number, colors: string[], alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = lerpColor(colors[0], colors[1], transition);
    ctx.beginPath();
    ctx.moveTo(0, 200 + offsetY);
    for (let x = 0; x <= CANVAS_WIDTH; x += 10) {
      const y = Math.sin((x * frequency) + (frame * 0.02)) * amplitude;
      ctx.lineTo(x, 200 + offsetY + y);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const getWaveColors = (t: TimeOfDay) => {
    if (location === 'CAVE') return ['#312e81', '#1e1b4b'];
    if (location === 'OCEAN') {
      if (t === 'DAY') return ['#0284c7', '#0369a1'];
      if (t === 'SUNSET') return ['#7c2d12', '#9a3412'];
      return ['#1e293b', '#020617'];
    }
    if (t === 'DAY') return ['#0284c7', '#0369a1'];
    if (t === 'SUNSET') return ['#ea580c', '#c2410c'];
    return ['#064e3b', '#022c22'];
  };

  const wavePrev = getWaveColors(prevTimeOfDay);
  const waveCurr = getWaveColors(timeOfDay);
  drawWave(10, 5, 0.01, [wavePrev[0], waveCurr[0]], 0.4);
  drawWave(30, 8, 0.008, [wavePrev[1], waveCurr[1]], 0.3);

  // Surface Ripples
  ctx.save();
  ctx.fillStyle = 'white';
  for (let i = 0; i < 40; i++) {
     const py = 210 + (i * 9);
     const speed = 0.5 + (py - 200) * 0.003;
     const px = ((i * 173 + frame * speed) % (CANVAS_WIDTH + 200)) - 100;
     const width = 15 + Math.sin(frame * 0.05 + i) * 10 + (py - 200) * 0.15;
     const alpha = 0.05 + Math.sin(frame * 0.02 + i) * 0.04;
     
     if (alpha > 0) {
       ctx.globalAlpha = alpha;
       ctx.beginPath();
       if (ctx.roundRect) ctx.roundRect(px, py, width, 1.5, 1);
       else ctx.rect(px, py, width, 1.5);
       ctx.fill();
     }
  }
  ctx.restore();

  drawVignette(ctx);
};

const rainPool: { x: number; y: number; speed: number; len: number }[] = [];

export const drawWeatherEffects = (ctx: CanvasRenderingContext2D, frame: number, weather: string, location: LocationType) => {
  if (weather === 'sunny' || location === 'CAVE') {
    if (rainPool.length > 0) rainPool.length = 0;
    return;
  }

  if (weather === 'meteor_shower') {
      ctx.save();
      for (let i = 0; i < 12; i++) {
          const t = (frame * 0.02 + i * 0.3) % 1;
          const x = (i * 150 + t * 800) % (CANVAS_WIDTH + 200) - 100;
          const y = t * 400 - 50;
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.globalAlpha = (1 - t) * 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 40, y - 20);
          ctx.stroke();
          ctx.fillStyle = 'white';
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      return;
  }

  if (weather === 'rainbow') {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 10;
      const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
      const centerX = CANVAS_WIDTH * 0.7;
      const centerY = 350;
      const baseRadius = 250;
      colors.forEach((c, i) => {
          ctx.strokeStyle = c;
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + i * 10, Math.PI, Math.PI * 2);
          ctx.stroke();
      });
      ctx.restore();
      return;
  }

  if (weather === 'aurora') {
      ctx.save();
      for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 50 + i * 40);
          for (let x = 0; x <= CANVAS_WIDTH; x += 100) {
              const y = 50 + i * 40 + Math.sin(x * 0.003 + frame * 0.015 + i) * 50;
              ctx.lineTo(x, y);
          }
          const grad = ctx.createLinearGradient(0, 0, 0, 200);
          const alpha = 0.15 + Math.sin(frame * 0.01 + i) * 0.05;
          grad.addColorStop(0, `rgba(0, 255, 180, ${alpha})`);
          grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 80;
          ctx.globalCompositeOperation = 'lighter';
          ctx.stroke();
      }
      ctx.restore();
      return;
  }

  if (weather === 'foggy') {
      ctx.save();
      ctx.fillStyle = 'rgba(200, 210, 230, 0.2)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      for (let i = 0; i < 5; i++) {
          const shiftX = (frame * (0.6 + i * 0.2)) % CANVAS_WIDTH;
          const shiftY = Math.sin(frame * 0.005 + i) * 20;
          const fogGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
          fogGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          fogGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
          fogGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fogGrad;
          ctx.save();
          ctx.translate(shiftX - CANVAS_WIDTH, 50 + i * 120 + shiftY);
          ctx.fillRect(0, 0, CANVAS_WIDTH * 2, 200);
          ctx.restore();
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 15; i++) {
          const mx = (Math.sin(i * 123) * 1000 + frame * 0.4) % CANVAS_WIDTH;
          const my = (Math.cos(i * 321) * 1000 + frame * 0.15) % CANVAS_HEIGHT;
          ctx.beginPath();
          ctx.arc(Math.abs(mx), Math.abs(my), 60 + Math.sin(frame * 0.01 + i) * 30, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.restore();
      return;
  }

  if (rainPool.length === 0) {
    for (let i = 0; i < 120; i++) {
      rainPool.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 15 + Math.random() * 10,
        len: 12 + Math.random() * 10
      });
    }
  }

  const isStorm = weather === 'stormy';
  const intensity = isStorm ? 1.8 : 1;
  const count = isStorm ? 120 : 60;

  ctx.save();
  ctx.strokeStyle = isStorm ? 'rgba(200, 210, 230, 0.4)' : 'rgba(180, 190, 210, 0.3)';
  ctx.lineWidth = isStorm ? 1.5 : 1;
  
  for (let i = 0; i < count; i++) {
    const r = rainPool[i];
    r.y += r.speed * intensity;
    r.x += (isStorm ? 4 : 2);
    if (r.y > CANVAS_HEIGHT) {
      r.y = -20;
      r.x = Math.random() * CANVAS_WIDTH;
    }
    if (r.x > CANVAS_WIDTH) r.x = 0;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + (isStorm ? 4 : 2), r.y + r.len);
    ctx.stroke();
    if (Math.random() > 0.98) {
        ctx.beginPath();
        ctx.ellipse(r.x, 200 + Math.random() * 10, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
  }
  const grad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 200, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 600);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, isStorm ? 'rgba(15, 23, 42, 0.4)' : 'rgba(30, 41, 59, 0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
};

export const drawLightning = (ctx: CanvasRenderingContext2D, x: number, alpha: number) => {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    let curX = x;
    for (let i = 1; i <= 8; i++) {
        curX += (Math.random() - 0.5) * 80;
        ctx.lineTo(curX, i * 40);
    }
    ctx.stroke();
    ctx.restore();
};

export const drawHills = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const getHillColor = (t: TimeOfDay) => {
    if (t === 'DAY') return ['#166534', '#14532d'];
    if (t === 'SUNSET') return ['#7c2d12', '#451a03'];
    return ['#052e16', '#021a0a'];
  };

  const colorsPrev = getHillColor(prevTime);
  const colorsCurr = getHillColor(time);

  ctx.fillStyle = lerpColor(colorsPrev[1], colorsCurr[1], transition);
  ctx.beginPath();
  ctx.moveTo(0, 200);
  for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
    const y = 140 + Math.sin(x * 0.005 + 1) * 30 + Math.cos(x * 0.01) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.fill();

  ctx.fillStyle = lerpColor(colorsPrev[0], colorsCurr[0], transition);
  ctx.beginPath();
  ctx.moveTo(0, 200);
  for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
    const y = 160 + Math.sin(x * 0.008 + 2) * 25 + Math.cos(x * 0.015) * 15;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.fill();
};

export const drawClouds = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const alpha = time === 'NIGHT' ? (1 - transition) * 0.3 : (prevTime === 'NIGHT' ? transition * 0.3 : 0.6);
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'white';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 250 + frame * 0.1) % (CANVAS_WIDTH + 400)) - 200;
    const y = 40 + Math.sin(i + frame * 0.01) * 20;
    const size = 40 + (i % 3) * 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 1.2, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

export const drawCaveFormations = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
  ctx.fillStyle = '#18181b';
  for (let i = 0; i < 12; i++) {
    const x = i * 70 + (Math.sin(i) * 20);
    const h = 40 + Math.cos(i * 1.5) * 30;
    ctx.beginPath();
    ctx.moveTo(x - 20, 0);
    ctx.lineTo(x, h);
    ctx.lineTo(x + 20, 0);
    ctx.fill();
  }
  for (let i = 0; i < 8; i++) {
    const x = (i * 113) % CANVAS_WIDTH;
    const y = (i * 77) % 180;
    const size = 3 + Math.sin(frame * 0.05 + i) * 2;
    const hue = 200 + Math.sin(i) * 60;
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.8)`;
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 2);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size * 2);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

export const drawUnderwaterPond = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const getWeedColor = (t: TimeOfDay) => {
    if (t === 'DAY') return '#22c55e';
    if (t === 'SUNSET') return '#854d0e';
    return '#052e16';
  };
  ctx.strokeStyle = lerpColor(getWeedColor(prevTime), getWeedColor(time), transition);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 20; i++) {
    const x = (i * 45 + frame * 0.05) % (CANVAS_WIDTH + 100) - 50;
    const h = 50 + Math.sin(i * 1.5 + frame * 0.04) * 35;
    const sway = Math.sin(frame * 0.015 + i) * 20;
    ctx.beginPath();
    ctx.moveTo(x, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(x + sway, CANVAS_HEIGHT - h/2, x, CANVAS_HEIGHT - h);
    ctx.stroke();
    for (let j = 1; j <= 3; j++) {
      const leafY = CANVAS_HEIGHT - (h * (j/4));
      const leafSway = sway * (1 - j/4);
      ctx.beginPath();
      ctx.ellipse(x + leafSway + 5, leafY, 5, 2, Math.PI/4, 0, Math.PI*2);
      ctx.ellipse(x + leafSway - 5, leafY, 5, 2, -Math.PI/4, 0, Math.PI*2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const x = (i * 150 + frame * 0.03) % CANVAS_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.bezierCurveTo(x, 230, x + Math.sin(frame*0.01+i)*20, 240, x + Math.sin(frame*0.01+i)*10, 280);
    ctx.stroke();
  }
  if (time !== 'NIGHT') {
    ctx.save();
    ctx.globalAlpha = 0.4 * transition;
    for (let i = 0; i < 8; i++) {
      const lx = (i * 183 + frame * 0.4) % CANVAS_WIDTH;
      const ly = 220 + (i * 47 + frame * 0.2) % 350;
      const lrot = frame * 0.01 + i;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lrot);
      ctx.fillStyle = time === 'DAY' ? '#166534' : '#713f12';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
};

const bubblePool: { x: number; y: number; speed: number; size: number; sway: number }[] = [];
export const resetOceanBubbles = () => { bubblePool.length = 0; };

export const drawUnderwaterOcean = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const trenchGrad = ctx.createLinearGradient(0, 400, 0, CANVAS_HEIGHT);
  trenchGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  trenchGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = trenchGrad;
  ctx.fillRect(0, 400, CANVAS_WIDTH, 200);

  const drawSeaweedLayer = (count: number, hRange: number, color: string, speed: number, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha * transition;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
        const x = (i * (CANVAS_WIDTH / count) + Math.sin(i * 1.5) * 50);
        const h = hRange + Math.sin(i * 2 + frame * 0.02) * (hRange * 0.3);
        const sway = Math.sin(frame * 0.01 * speed + i) * 25;
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_HEIGHT);
        ctx.quadraticCurveTo(x + sway, CANVAS_HEIGHT - h/2, x + sway * 0.5, CANVAS_HEIGHT - h);
        ctx.stroke();
    }
    ctx.restore();
  };

  drawSeaweedLayer(8, 40, '#134e4a', 0.8, 0.4);
  drawSeaweedLayer(12, 60, '#0f766e', 1.2, 0.6);
  drawSeaweedLayer(6, 80, '#14b8a6', 1.5, 0.3);

  if (time !== 'NIGHT') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rayAlpha = (time === 'DAY' ? 0.18 : 0.1) * transition;
    for (let i = 0; i < 8; i++) {
      const x = (i * 180 + frame * 0.25) % (CANVAS_WIDTH + 400) - 200;
      const w = 40 + Math.sin(frame * 0.008 + i) * 20;
      const angle = 120 + Math.sin(frame * 0.004 + i) * 40;
      const beamGrad = ctx.createLinearGradient(x, 200, x + angle * 0.5, CANVAS_HEIGHT);
      beamGrad.addColorStop(0, `rgba(255, 255, 255, ${rayAlpha})`);
      beamGrad.addColorStop(0.4, `rgba(220, 245, 255, ${rayAlpha * 0.6})`);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(x, 200); ctx.lineTo(x + w, 200); ctx.lineTo(x + w + angle, CANVAS_HEIGHT); ctx.lineTo(x + angle, CANVAS_HEIGHT);
      ctx.fill();
    }
    ctx.restore();
  }

  if (bubblePool.length === 0) {
    for (let i = 0; i < 25; i++) {
        bubblePool.push({
            x: Math.random() * CANVAS_WIDTH,
            y: 200 + Math.random() * 400,
            speed: 0.5 + Math.random() * 1.5,
            size: 1 + Math.random() * 3,
            sway: Math.random() * Math.PI * 2
        });
    }
  }

  ctx.save();
  ctx.globalAlpha = 0.4 * transition;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  bubblePool.forEach((b, i) => {
    b.y -= b.speed;
    b.x += Math.sin(frame * 0.02 + b.sway) * 0.5;
    if (b.y < 200) { b.y = CANVAS_HEIGHT + 10; b.x = Math.random() * CANVAS_WIDTH; }
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  });
  ctx.restore();

  drawRocks(ctx, frame, transition);
  drawCorals(ctx, frame, transition);
  drawCrabs(ctx, frame);
};

export const drawUnderwaterCave = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
    const y = CANVAS_HEIGHT - 20 - Math.abs(Math.sin(x * 0.05)) * 40;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const x = (i * 147) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - 10 - (i % 4) * 8;
    const size = 5 + Math.sin(frame * 0.05 + i) * 3;
    const hue = 220 + Math.sin(i * 2) * 50;
    ctx.save();
    ctx.shadowBlur = 25; ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.8)`;
    ctx.fillStyle = `hsla(${hue}, 90%, 70%, 1)`;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.5); ctx.lineTo(x + size, y); ctx.lineTo(x, y + size * 1.5); ctx.lineTo(x - size, y); ctx.closePath();
    ctx.fill();
    if (frame % 30 === 0) {
        ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.6)`;
        ctx.beginPath(); ctx.arc(x + (Math.random()-0.5)*20, y - Math.random()*40, 1.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
};

export const drawUnderwaterParticles = (ctx: CanvasRenderingContext2D, frame: number, location: LocationType) => {
  const count = location === 'OCEAN' ? 50 : (location === 'CAVE' ? 60 : 20);
  ctx.save(); ctx.globalAlpha = 0.3;
  if (location !== 'CAVE') {
      ctx.fillStyle = 'white'; ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = (Math.sin(i * 123) * 1000 + frame * 0.2) % CANVAS_WIDTH;
        let y = (Math.cos(i * 321) * 1000 + frame * (location === 'OCEAN' ? 0.3 : 0.1)) % 400;
        y = 200 + Math.abs(y);
        const size = 1 + Math.sin(frame * 0.02 + i) * 0.5;
        ctx.moveTo(Math.abs(x) + size, Math.abs(y)); ctx.arc(Math.abs(x), Math.abs(y), size, 0, Math.PI * 2);
      }
      ctx.fill();
  } else {
      for (let i = 0; i < count; i++) {
        const x = (Math.sin(i * 123) * 1000 + frame * 0.2) % CANVAS_WIDTH;
        let y = (Math.cos(i * 321) * 1000 + frame * 0.1) % 400;
        y = 200 + Math.abs(y);
        const size = 1 + Math.sin(frame * 0.02 + i) * 0.5;
        ctx.fillStyle = `hsla(${200 + Math.sin(i) * 60}, 80%, 70%, 0.4)`;
        ctx.beginPath(); ctx.arc(Math.abs(x), Math.abs(y), size, 0, Math.PI * 2); ctx.fill();
      }
  }
  ctx.restore();
};

export const drawRocks = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
    ctx.save(); ctx.globalAlpha = 0.9 * transition;
    ctx.fillStyle = '#475569';
    for (let i = 0; i < 15; i++) {
        const px = (i * 97) % CANVAS_WIDTH; const py = CANVAS_HEIGHT - 3 - (i % 4);
        ctx.beginPath(); ctx.ellipse(px, py, 2 + (i % 3), 1 + (i % 2), 0, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
        const rx = (i * 350 + 200) % CANVAS_WIDTH; const ry = CANVAS_HEIGHT;
        const w = 40 + (i % 2) * 20; const h = 15 + (i % 3) * 10;
        const rockGrad = ctx.createLinearGradient(rx, ry - h, rx, ry);
        rockGrad.addColorStop(0, '#64748b'); rockGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rockGrad; ctx.beginPath();
        ctx.moveTo(rx - w/2, ry); ctx.quadraticCurveTo(rx - w/4, ry - h, rx, ry - h); ctx.quadraticCurveTo(rx + w/4, ry - h, rx + w/2, ry);
        ctx.fill(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
};

export const drawCorals = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
    ctx.save(); ctx.globalAlpha = 0.8 * transition;
    for (let i = 0; i < 5; i++) {
        const x = (i * 180 + 100) % CANVAS_WIDTH; const y = CANVAS_HEIGHT - 5;
        const sway = Math.sin(frame * 0.01 + i) * 5;
        const color = i % 2 === 0 ? '#f43f5e' : '#ec4899';
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway, y - 20, x + sway * 1.5, y - 35);
        ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + sway * 0.5, y - 15); ctx.quadraticCurveTo(x + sway - 15, y - 25, x + sway - 20, y - 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + sway * 0.8, y - 25); ctx.quadraticCurveTo(x + sway + 15, y - 35, x + sway + 20, y - 40); ctx.stroke();
    }
    ctx.restore();
};

export const drawBirds = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.save(); ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
        const speed = 0.5 + i * 0.2;
        const x = ((i * 400 + frame * speed) % (CANVAS_WIDTH + 200)) - 100;
        const y = 50 + Math.sin(frame * 0.02 + i) * 30;
        const wingSpan = 15; const flap = Math.sin(frame * 0.1 + i) * 10;
        ctx.beginPath(); ctx.moveTo(x - wingSpan, y + flap); ctx.quadraticCurveTo(x, y - 5, x + wingSpan, y + flap); ctx.stroke();
    }
    ctx.restore();
};

export const drawCrabs = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.save();
    for (let i = 0; i < 2; i++) {
        const x = ((i * 600 + frame * 0.4) % (CANVAS_WIDTH + 200)) - 100;
        const y = CANVAS_HEIGHT - 15; const size = 10;
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x - 4, y - 6, 2, 0, Math.PI * 2); ctx.arc(x + 4, y - 6, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        const legSway = Math.sin(frame * 0.2 + i) * 5;
        for (let j = 0; j < 3; j++) {
            ctx.beginPath(); ctx.moveTo(x - 8, y + (j * 4) - 4); ctx.lineTo(x - 14 + legSway, y + (j * 4) - 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + 8, y + (j * 4) - 4); ctx.lineTo(x + 14 - legSway, y + (j * 4) - 2); ctx.stroke();
        }
    }
    ctx.restore();
};

const fireflyPool: { x: number; y: number; phase: number; speed: number; size: number }[] = [];
const leafPool: { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number; opacity: number }[] = [];

export const drawAmbientNight = (ctx: CanvasRenderingContext2D, frame: number) => {
  if (fireflyPool.length === 0) {
    for (let i = 0; i < 18; i++) {
      fireflyPool.push({
        x: Math.random() * CANVAS_WIDTH, y: 80 + Math.random() * 120, phase: Math.random() * Math.PI * 2, speed: 0.2 + Math.random() * 0.4, size: 1.5 + Math.random() * 2,
      });
    }
  }
  if (leafPool.length === 0) {
    for (let i = 0; i < 12; i++) {
      leafPool.push({
        x: Math.random() * CANVAS_WIDTH, y: -Math.random() * 200, vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.6, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.05, size: 4 + Math.random() * 6, opacity: 0.3 + Math.random() * 0.5,
      });
    }
  }
  ctx.save();
  fireflyPool.forEach(f => {
    f.x += Math.sin(frame * f.speed * 0.05 + f.phase) * 0.8; f.y += Math.cos(frame * f.speed * 0.04 + f.phase) * 0.5;
    if (f.y > 200) f.y = 60 + Math.random() * 80;
    if (f.x < 0) f.x = CANVAS_WIDTH; if (f.x > CANVAS_WIDTH) f.x = 0;
    const glow = (Math.sin(frame * 0.07 + f.phase) + 1) / 2;
    ctx.save(); ctx.globalAlpha = 0.3 + glow * 0.7; ctx.shadowBlur = 10 + glow * 15; ctx.shadowColor = '#a3e635'; ctx.fillStyle = `rgba(163, 230, 53, ${0.6 + glow * 0.4})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.size * (0.6 + glow * 0.4), 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  leafPool.forEach(l => {
    l.x += l.vx + Math.sin(frame * 0.02) * 0.3; l.y += l.vy; l.rot += l.rotSpeed;
    if (l.y > 210) { l.y = -20; l.x = Math.random() * CANVAS_WIDTH; }
    ctx.save(); ctx.globalAlpha = l.opacity; ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.fillStyle = '#65a30d'; ctx.beginPath(); ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  ctx.restore();
};
