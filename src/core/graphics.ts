import { Rarity, FishType, GameState, RodType, BaitType, LocationType, TimeOfDay } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, REEL_BAR_HEIGHT } from './gameData';
import { drawPlayer } from './character';


// Color Constants for Interpolation
const SKY_COLORS = {
  DAY_SUNNY: ['#0c4a6e', '#38bdf8'],
  DAY_RAINY: ['#1e293b', '#475569'],
  DAY_STORMY: ['#020617', '#1e293b'],
  SUNSET: ['#c2410c', '#f59e0b'],
  NIGHT: ['#020617', '#0f172a'],
  CAVE: ['#09090b', '#18181b']
};

const WATER_COLORS = {
  POND_DAY: ['#0ea5e9', '#0369a1', '#0c4a6e'],
  POND_SUNSET: ['#9a3412', '#9a3412', '#064e3b'],
  POND_NIGHT: ['#064e3b', '#064e3b', '#022c22'],
  OCEAN_DAY: ['#0369a1', '#0369a1', '#082f49'],
  OCEAN_SUNSET: ['#b45309', '#b45309', '#0c4a6e'],
  OCEAN_NIGHT: ['#1e293b', '#0f172a', '#020617'], // Slightly lighter top to separate from sky
  CAVE: ['#1e1b4b', '#1e1b4b', '#020617']
};

// Helper to lerp colors
const lerpColor = (c1: string, c2: string, f: number) => {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const drawWaterAndSky = (
  ctx: CanvasRenderingContext2D, 
  frame: number, 
  weather: 'sunny' | 'rainy' | 'stormy' = 'sunny', 
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

  // --- Background Scenery (Task: Beautiful unique backgrounds) ---
  ctx.save();
  if (location === 'POND') {
    // Soft hills
    drawHills(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'OCEAN') {
    // Clouds only
    drawClouds(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'CAVE') {
    // Cave formations
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
  ctx.fillRect(0, 200, CANVAS_WIDTH, 400);

  // --- Underwater Details (Task: Background underwater) ---
  ctx.save();
  if (location === 'POND') {
    drawUnderwaterPond(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'OCEAN') {
    drawUnderwaterOcean(ctx, frame, transition, timeOfDay, prevTimeOfDay);
  } else if (location === 'CAVE') {
    drawUnderwaterCave(ctx, frame, transition);
  }
  ctx.restore();

  // Draw shared underwater particles (plankton/sediment)
  drawUnderwaterParticles(ctx, frame, location);

  // Water Reflection for scenery
  if (location !== 'CAVE') {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.scale(1, -0.3);
    ctx.translate(0, -1333); // Adjust for flipped reflection position
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
    // POND
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
     // Perspective depth: speed and width increase as y increases
     const speed = 0.5 + (py - 200) * 0.003;
     // Base x position + movement based on frame
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

  // Storm Lightning
  if (weather === 'stormy' && Math.random() > 0.99 && location !== 'CAVE') {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
};


// --- Procedural Background Helpers ---

const drawHills = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const getHillColor = (t: TimeOfDay) => {
    if (t === 'DAY') return ['#166534', '#14532d'];
    if (t === 'SUNSET') return ['#7c2d12', '#451a03'];
    return ['#052e16', '#021a0a']; // Darker, distinct from water
  };

  const colorsPrev = getHillColor(prevTime);
  const colorsCurr = getHillColor(time);

  // Far hills
  ctx.fillStyle = lerpColor(colorsPrev[1], colorsCurr[1], transition);
  ctx.beginPath();
  ctx.moveTo(0, 200);
  for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
    const y = 140 + Math.sin(x * 0.005 + 1) * 30 + Math.cos(x * 0.01) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.fill();

  // Near hills
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

const drawClouds = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
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

const drawCaveFormations = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
  ctx.fillStyle = '#18181b';
  
  // Stalactites
  for (let i = 0; i < 12; i++) {
    const x = i * 70 + (Math.sin(i) * 20);
    const h = 40 + Math.cos(i * 1.5) * 30;
    ctx.beginPath();
    ctx.moveTo(x - 20, 0);
    ctx.lineTo(x, h);
    ctx.lineTo(x + 20, 0);
    ctx.fill();
  }

  // Glowing Crystals
  for (let i = 0; i < 8; i++) {
    const x = (i * 113) % CANVAS_WIDTH;
    const y = (i * 77) % 180;
    const size = 3 + Math.sin(frame * 0.05 + i) * 2;
    const hue = 200 + Math.sin(i) * 60; // Blue to Purple
    
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

const drawUnderwaterPond = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  const getWeedColor = (t: TimeOfDay) => {
    if (t === 'DAY') return '#22c55e'; // Brighter green
    if (t === 'SUNSET') return '#854d0e';
    return '#052e16'; // Distinct from water #022c22
  };

  ctx.strokeStyle = lerpColor(getWeedColor(prevTime), getWeedColor(time), transition);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Draw swaying weeds at bottom
  for (let i = 0; i < 20; i++) {
    const x = (i * 45 + frame * 0.05) % (CANVAS_WIDTH + 100) - 50;
    const h = 50 + Math.sin(i * 1.5 + frame * 0.04) * 35;
    const sway = Math.sin(frame * 0.015 + i) * 20;
    
    ctx.beginPath();
    ctx.moveTo(x, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(x + sway, CANVAS_HEIGHT - h/2, x, CANVAS_HEIGHT - h);
    ctx.stroke();
    
    // Add leaf pairs along the stem
    for (let j = 1; j <= 3; j++) {
      const leafY = CANVAS_HEIGHT - (h * (j/4));
      const leafSway = sway * (1 - j/4);
      ctx.beginPath();
      ctx.ellipse(x + leafSway + 5, leafY, 5, 2, Math.PI/4, 0, Math.PI*2);
      ctx.ellipse(x + leafSway - 5, leafY, 5, 2, -Math.PI/4, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // Floating lily roots/stems from top
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const x = (i * 150 + frame * 0.03) % CANVAS_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.bezierCurveTo(x, 230, x + Math.sin(frame*0.01+i)*20, 240, x + Math.sin(frame*0.01+i)*10, 280);
    ctx.stroke();
  }
};

const drawUnderwaterOcean = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
  // Distant sea trenches (gradients)
  const trenchGrad = ctx.createLinearGradient(0, 400, 0, CANVAS_HEIGHT);
  trenchGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  trenchGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = trenchGrad;
  ctx.fillRect(0, 400, CANVAS_WIDTH, 200);

  // Sharp Caustics
  if (time !== 'NIGHT') {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.2 * (time === 'DAY' ? 1 : 0.5);
    for (let i = 0; i < 8; i++) {
      const x = (i * 120 + frame * 0.6) % (CANVAS_WIDTH + 200) - 100;
      const w = 30 + Math.sin(frame * 0.02 + i) * 15;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(x, 200);
      ctx.lineTo(x + w, 200);
      ctx.lineTo(x + w + 120, CANVAS_HEIGHT);
      ctx.lineTo(x + 120, CANVAS_HEIGHT);
      ctx.fill();
    }
    ctx.restore();
  }
};

const drawUnderwaterCave = (ctx: CanvasRenderingContext2D, frame: number, transition: number) => {
  ctx.fillStyle = '#09090b';
  
  // Rocky floor
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
    const y = CANVAS_HEIGHT - 20 - Math.abs(Math.sin(x * 0.05)) * 40;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fill();

  // Floor crystals with stronger glow
  for (let i = 0; i < 8; i++) {
    const x = (i * 147) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - 10 - (i % 4) * 8;
    const size = 5 + Math.sin(frame * 0.05 + i) * 3;
    const hue = 220 + Math.sin(i * 2) * 50;
    
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.8)`;
    ctx.fillStyle = `hsla(${hue}, 90%, 70%, 1)`;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.5);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size * 1.5);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

const drawUnderwaterParticles = (ctx: CanvasRenderingContext2D, frame: number, location: LocationType) => {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'white';
  
  const count = location === 'OCEAN' ? 40 : 20;
  for (let i = 0; i < count; i++) {
    const x = (Math.sin(i * 123) * 1000 + frame * 0.2) % CANVAS_WIDTH;
    const y = 200 + (Math.cos(i * 321) * 1000 + frame * 0.1) % 400;
    const size = 1 + Math.sin(frame * 0.02 + i) * 0.5;
    
    ctx.beginPath();
    ctx.arc(Math.abs(x), Math.abs(y), size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};


export const drawBubbles = (ctx: CanvasRenderingContext2D, bubbles: any[]) => {
  ctx.save();
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  });
  ctx.restore();
};

export const drawVFXParticles = (ctx: CanvasRenderingContext2D, particles: any[]) => {
  ctx.save();
  particles.forEach(p => {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color || 'white';
    if (p.type === 'star') {
        const size = p.size;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(p.x + size * Math.cos((18 + i * 72) * Math.PI / 180), p.y - size * Math.sin((18 + i * 72) * Math.PI / 180));
            ctx.lineTo(p.x + (size/2) * Math.cos((54 + i * 72) * Math.PI / 180), p.y - (size/2) * Math.sin((54 + i * 72) * Math.PI / 180));
        }
        ctx.closePath();
        ctx.fill();
    } else if (p.type === 'ripple') {
        ctx.strokeStyle = p.color || 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
  });
  ctx.restore();
};

export const drawRareDetectionFlash = (ctx: CanvasRenderingContext2D, rarity: Rarity) => {
  const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
  const opacity = 0.05 + pulse * 0.15;

  let baseColor = '255, 255, 255';
  if (rarity === Rarity.EPIC) baseColor = '168, 85, 247';
  if (rarity === Rarity.LEGENDARY) baseColor = '251, 191, 36';
  if (rarity === Rarity.MYTHIC) baseColor = '239, 68, 68';

  ctx.save();
  const gradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.8
  );
  
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(${baseColor}, ${opacity})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
};

export const drawAlert = (ctx: CanvasRenderingContext2D, x: number, y: number, rarity: Rarity) => {
  let color = '#ffffff';
  if (rarity === Rarity.EPIC) color = '#a855f7';
  if (rarity === Rarity.LEGENDARY) color = '#fbbf24';
  if (rarity === Rarity.MYTHIC) color = '#ef4444';

  const pulse = Math.sin(Date.now() * 0.01) * 5;
  
  ctx.save();
  ctx.translate(x, y - 50 + pulse);
  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 0, 0);
  ctx.restore();
};

export const drawBehaviorIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, type: 'jump' | 'dive' | 'thrash') => {
  const icons = {
    jump: { char: '⚠️', text: 'NHẢY!', color: '#fbbf24' },
    dive: { char: '⚓', text: 'LẶN!', color: '#60a5fa' },
    thrash: { char: '💢', text: 'VÙNG VẪY!', color: '#ef4444' }
  };
  const icon = icons[type];
  const pulse = Math.sin(Date.now() * 0.01) * 3;

  ctx.save();
  ctx.translate(x, y - 60 + pulse);
  
  // BG
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-40, -12, 80, 24, 12);
  else ctx.rect(-40, -12, 80, 24);
  ctx.fill();
  ctx.strokeStyle = icon.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${icon.char} ${icon.text}`, 0, 0);
  
  ctx.restore();
};

import { drawFishByModel } from './fish';

export const drawFishTexture = (
  ctx: CanvasRenderingContext2D, 
  fishType: FishType, 
  frameCount: number, 
  isStruggling: boolean = false,
  customPos?: { x: number, y: number, angle: number, direction: number },
  currentSpeed: number = 1,
  swimStyle: string = 'glider',
  isCaught: boolean = false,
  isGolden: boolean = false
) => {
  const { size, rarity } = fishType;

  ctx.save();
  if (customPos) {
    ctx.translate(customPos.x, customPos.y);
    ctx.rotate(customPos.angle);
    if (customPos.direction === -1) ctx.scale(-1, 1);
    
    // Offset to make the mouth touch the hook instead of the body center
    if (isStruggling || isCaught) {
        ctx.translate(-size * 1.0, 0);
    }
  }

  // --- GLOW EFFECTS ---
  if (isCaught || isGolden) {
    ctx.shadowBlur = isGolden ? 35 : 30;
    ctx.shadowColor = '#fbbf24';
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(frameCount * 0.2) * 0.2;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.4, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    if (rarity === Rarity.MYTHIC || rarity === Rarity.LEGENDARY) {
        ctx.shadowBlur = rarity === Rarity.MYTHIC ? 25 : 15;
        ctx.shadowColor = rarity === Rarity.MYTHIC ? '#ff0000' : '#fbbf24';
    } else if (rarity === Rarity.EPIC) {
        ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
    }
  }

  if (isStruggling) {
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
  }

  // --- DRAW SPECIALIZED MODEL ---
  drawFishByModel(ctx, fishType, frameCount, isStruggling, currentSpeed, isCaught, isGolden);

  ctx.restore();
};

export const drawRodTexture = (
  ctx: CanvasRenderingContext2D, 
  rod: RodType, 
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number,
  bendAmount: number = 0,
  reelRotation: number = 0
) => {
  ctx.save();
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx);
  
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  let rodColor = '#27272a';
  if (rod.id === 'rod_1') rodColor = '#d4d699';
  if (rod.id === 'rod_2') rodColor = '#18181b';
  if (rod.id === 'rod_3') rodColor = '#94a3b8';
  if (rod.id === 'rod_4') {
    rodColor = '#fbbf24';
    ctx.shadowBlur = 15; ctx.shadowColor = '#fbbf24';
  }

  // Tension heat effect
  if (bendAmount > 0.4) {
      ctx.shadowBlur = 10 * bendAmount;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
  }

  ctx.beginPath();
  ctx.moveTo(0, 0);
  const cpX = length * 0.5;
  const cpY = -bendAmount * length * 0.6;
  ctx.quadraticCurveTo(cpX, cpY, length, 0);
  
  ctx.strokeStyle = rodColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Glow on mythic rod
  if (rod.id === 'rod_4') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      ctx.stroke();
  }

  // --- DRAW REEL HANDLE ---
  ctx.save();
  ctx.translate(12, 5); // Base of rod
  
  // Reel Body
  ctx.fillStyle = '#3f3f46';
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#18181b'; ctx.lineWidth = 1; ctx.stroke();

  // Handle Arm
  ctx.rotate(reelRotation);
  ctx.strokeStyle = '#a1a1aa'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 0); ctx.stroke();

  // Handle Knob
  ctx.fillStyle = '#18181b';
  ctx.beginPath(); ctx.arc(10, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.restore();
};

export const drawPlayerEquipment = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  pX: number, pY: number,
  rodEndX: number, rodEndY: number,
  hookX: number, hookY: number,
  isCasting: boolean = false,
  lineHealth: number = 100,
  rodStress: number = 0,
  currentRod: RodType,
  chargePower: number = 0,
  currentBait?: BaitType,
  frameCount: number = 0,
  reelRotation: number = 0,
  location: LocationType = 'POND'
) => {
  let swayY = 0;
  let swayAngle = 0;
  if (location === 'OCEAN') {
    swayY = Math.sin(frameCount * 0.025) * 5;
    swayAngle = Math.cos(frameCount * 0.015) * 0.04;
  }
  const pivotX = 60;
  const pivotY = 180;

  // Apply Sway (Boat, Player, Rod)
  ctx.save();
  if (location === 'OCEAN') {
    ctx.translate(pivotX, pivotY);
    ctx.rotate(swayAngle);
    ctx.translate(-pivotX, -pivotY + swayY);
  }

  // Draw Background Platforms (POND, CAVE)
  if (location !== 'OCEAN') {
    ctx.save();
    if (location === 'CAVE') {
      // Rocky Platform (Jagged uneven boulders)
      const rockGrad = ctx.createLinearGradient(0, 150, 0, 200);
      rockGrad.addColorStop(0, '#52525b'); // Lighter on top
      rockGrad.addColorStop(1, '#18181b'); // Dark at bottom
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(25, 152);
      ctx.lineTo(50, 165);
      ctx.lineTo(85, 158);
      ctx.lineTo(115, 168);
      ctx.lineTo(135, 150); // Sharp rock edge
      ctx.lineTo(150, 175);
      ctx.lineTo(140, 200);
      ctx.lineTo(0, 200);
      ctx.closePath();
      ctx.fill();
      
      // Highlight top edges
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Rock texture / crevices
      ctx.strokeStyle = '#09090b'; // Deep dark cracks
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(25, 152); ctx.lineTo(35, 180); ctx.lineTo(15, 200);
      ctx.moveTo(85, 158); ctx.lineTo(75, 185); ctx.lineTo(95, 200);
      ctx.moveTo(135, 150); ctx.lineTo(120, 175); ctx.lineTo(130, 200);
      ctx.stroke();
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(0, 0, 0, 0); // reset
    } else {
      // Wooden Pier (POND)
      const pierGrad = ctx.createLinearGradient(0, 160, 0, 200);
      pierGrad.addColorStop(0, '#78350f');
      pierGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = pierGrad;
      ctx.fillRect(0, 160, 120, 40);
      // Plank lines
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let i = 20; i < 120; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 160); ctx.lineTo(i, 200); ctx.stroke();
      }
    }
    ctx.restore();
  }

  let charTilt = 0;
  let rodBend = 0;

  if (gameState === GameState.CHARGING) {
    charTilt = -0.15;
    rodBend = -0.5 * (chargePower / 100);
  } else if (gameState === GameState.CASTING) {
    charTilt = 0.2;
    rodBend = 0.3;
  } else if (gameState === GameState.REELING) {
    rodBend = Math.min(2.4, rodStress);
    charTilt = -0.08 * Math.min(1.4, rodStress);
  }

  // Calculate rod angle for hand alignment
  const rodBaseX = pX - 12;
  const rodBaseY = pY + (Math.sin(frameCount * 0.05) * 1); // Follow breathing
  const rodAngle = Math.atan2(rodEndY - rodBaseY, rodEndX - rodBaseX);

  // Professional Character Model (Included from character.ts)
  drawPlayer(ctx, pX - 40, pY, gameState, charTilt, frameCount, rodAngle, reelRotation, 'back');

  // Draw Foreground Platform (OCEAN Boat covers player legs)
  if (location === 'OCEAN') {
    ctx.save();
    // Boat Gradient
    const boatGrad = ctx.createLinearGradient(0, 140, 0, 200);
    boatGrad.addColorStop(0, '#78350f');
    boatGrad.addColorStop(1, '#290f02');
    ctx.fillStyle = boatGrad;
    
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.lineTo(100, 160);
    ctx.lineTo(130, 140);
    ctx.lineTo(150, 140);
    ctx.lineTo(130, 200);
    ctx.lineTo(0, 200);
    ctx.closePath();
    ctx.fill();
    
    // Highlight top edge
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.lineTo(100, 160);
    ctx.lineTo(130, 140);
    ctx.lineTo(150, 140);
    ctx.strokeStyle = '#b45309'; // Light wood highlight
    ctx.lineWidth = 2;
    ctx.stroke();

    // Side plank details
    ctx.beginPath();
    ctx.moveTo(10, 180);
    ctx.lineTo(110, 180);
    ctx.lineTo(135, 160);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  drawRodTexture(ctx, currentRod, rodBaseX, rodBaseY, rodEndX, rodEndY, rodBend, reelRotation);

  // Draw character's front arm ON TOP of the rod
  drawPlayer(ctx, pX - 40, pY, gameState, charTilt, frameCount, rodAngle, reelRotation, 'front');

  ctx.restore(); // END SWAY BLOCK

  // Ghost landing target
  if (gameState === GameState.CHARGING) {
      const targetX = 220 + (chargePower / 100) * 500;
      const targetY = 250 + (chargePower / 100) * 300;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY, 20, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
  }


  // Line
  const visibleStates = [GameState.CHARGING, GameState.CASTING, GameState.WAITING, GameState.NIBBLING, GameState.REELING, GameState.CAUGHT];
  if (visibleStates.includes(gameState)) {
    const isLowHealth = lineHealth < 30 && gameState === GameState.REELING;
    const isHighTension = rodStress > 0.75 && gameState === GameState.REELING;
    
    let shakeX = 0, shakeY = 0;
    if (gameState === GameState.REELING || gameState === GameState.CAUGHT) {
      const vibIntensity = (rodStress * 2) + (isLowHealth ? 4 : 0.5);
      shakeX = (Math.random() - 0.5) * vibIntensity;
      shakeY = (Math.random() - 0.5) * vibIntensity;
    }
    
    let actualRodEndX = rodEndX;
    let actualRodEndY = rodEndY;
    if (location === 'OCEAN') {
      const dx = rodEndX - pivotX;
      const dy = rodEndY - pivotY;
      actualRodEndX = pivotX + dx * Math.cos(swayAngle) - dy * Math.sin(swayAngle);
      actualRodEndY = pivotY + dx * Math.sin(swayAngle) + dy * Math.cos(swayAngle) + swayY;
    }

    ctx.save();
    if (isHighTension) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12; ctx.shadowColor = 'red';
    } else {
        ctx.strokeStyle = isLowHealth ? `rgba(239, 68, 68, 0.9)` : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
    }
    
    ctx.beginPath();
    ctx.moveTo(actualRodEndX, actualRodEndY);
    let cpX = (actualRodEndX + hookX) / 2 + shakeX;
    let cpY = Math.min(actualRodEndY, hookY) - (isCasting ? 180 : 30) + shakeY; 
    if (gameState === GameState.REELING) cpY += 80 + rodBend * 30;
    
    ctx.quadraticCurveTo(cpX, cpY, hookX + shakeX, hookY + shakeY);
    ctx.stroke();
    ctx.restore();

    // Bobber Particles and ripples
    if (hookY > 200 && (gameState === GameState.WAITING || gameState === GameState.REELING)) {
        ctx.save();
        const rippleSize = 12 + Math.sin(Date.now() * 0.012) * 6;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(hookX, hookY, rippleSize, rippleSize * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        if (gameState === GameState.REELING) {
            // Intense spray for reeling
            ctx.fillStyle = 'white';
            for(let i=0; i<3; i++) {
                ctx.beginPath();
                ctx.arc(hookX + (Math.random()-0.5)*20, hookY + (Math.random()-0.5)*10, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // --- BAIT GLOW (Task #13) ---
    if (currentBait) {
      ctx.save();
      const glowPulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
      let glowColor = 'transparent';
      if (currentBait.rarityText === 'NÂNG CAO') glowColor = 'rgba(74, 222, 128, 0.4)';
      if (currentBait.rarityText === 'CHUYÊN NGHIỆP') glowColor = 'rgba(56, 189, 248, 0.5)';
      if (currentBait.rarityText === 'CAO CẤP') glowColor = 'rgba(168, 85, 247, 0.6)';
      if (currentBait.rarityText === 'CỰC HẠNG') glowColor = 'rgba(251, 191, 36, 0.7)';

      if (glowColor !== 'transparent') {
        ctx.shadowBlur = 10 + glowPulse * 15;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(hookX + shakeX, hookY + shakeY, 8 + glowPulse * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(hookX + shakeX, hookY + shakeY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(hookX + shakeX, hookY + shakeY - 2, 3, 0, Math.PI * 2); ctx.fill();
  }
};

export const drawReelingInterface = (
  ctx: CanvasRenderingContext2D,
  progress: number,
  health: number,
  tensionCursor: number,
  tensionZone: number,
  zoneSize: number,
  isInZone: boolean,
  fish?: FishType
) => {
  const panelW = 340;
  const panelH = 120;
  const px = (CANVAS_WIDTH - panelW) / 2;
  const py = 145; // below header UI

  
  const barW = 280;
  const barH = 25;
  const bx = (CANVAS_WIDTH - barW) / 2;
  const by = py + 55;

  ctx.save();
  
  // 1. More transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Translucent Panel Backdrop
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 32); ctx.fill();
  
  // Panel Border
  ctx.strokeStyle = isInZone ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 32); ctx.stroke();

  // 3. Fish Info Header — MUST reset shadow before text or it blurs invisible
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  if (fish) {
    const rarityColors: Record<string, string> = {
      'junk': '#94a3b8', 'common': '#e2e8f0',
      'uncommon': '#4ade80', 'rare': '#60a5fa',
      'epic': '#c084fc', 'legendary': '#fbbf24', 'mythic': '#f472b6'
    };
    const rarityColor = rarityColors[fish.rarity] || '#e2e8f0';
    const weight = (fish.value / 100).toFixed(1);
    const rarityText = (fish as any).rarityText || fish.rarity.toUpperCase();

    // Semi-transparent pill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath(); ctx.roundRect(px + 12, py + 8, panelW - 24, 24, 8); ctx.fill();

    // Fish name — bold white left-aligned (Hidden during reeling for mystery!)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.fillText('???', px + 22, py + 25);


    // Rarity + weight — colored right-aligned (Hidden for mystery)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`???  •  ??? kg`, px + panelW - 16, py + 25);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }


  // 4. Main Horizontal Tension Bar
  // Background (Danger)
  const dangerGrad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
  dangerGrad.addColorStop(0, '#7f1d1d');
  dangerGrad.addColorStop(0.5, '#ef4444');
  dangerGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = dangerGrad;
  ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 8); ctx.fill();

  // Safe Zone
  const hz = zoneSize / 2;
  const safeX = bx + (tensionZone * barW) - (hz * barW);
  const safeW = zoneSize * barW;
  
  const zoneGrad = ctx.createLinearGradient(safeX, 0, safeX + safeW, 0);
  zoneGrad.addColorStop(0, '#166534');
  zoneGrad.addColorStop(0.5, '#4ade80');
  zoneGrad.addColorStop(1, '#166534');
  
  ctx.save();
  if (isInZone) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ade80';
    const pulse = Math.sin(Date.now() * 0.01) * 3;
    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.beginPath(); ctx.roundRect(safeX - 3 - pulse, by - 3 - pulse, safeW + 6 + pulse*2, barH + 6 + pulse*2, 10); ctx.fill();
  }
  ctx.fillStyle = zoneGrad;
  ctx.beginPath(); ctx.roundRect(safeX, by, safeW, barH, 6); ctx.fill();
  ctx.restore();

  // Bar Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, barW, barH);

  // 5. Tension Cursor (Arrow Indicator)
  const cx = bx + tensionCursor * barW;
  ctx.save();
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'black';
  ctx.fillStyle = 'white';
  
  // Arrow pointing UP
  ctx.beginPath();
  ctx.moveTo(cx, by + barH + 3);
  ctx.lineTo(cx - 8, by + barH + 12);
  ctx.lineTo(cx + 8, by + barH + 12);
  ctx.closePath();
  ctx.fill();
  
  // Vertical line across bar
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, by - 3);
  ctx.lineTo(cx, by + barH + 3);
  ctx.stroke();
  ctx.restore();

  // 6. Line Health Mini Bar
  const miniBarW = 200;
  const miniBarH = 10;
  const healX = (CANVAS_WIDTH - miniBarW) / 2;
  const healY = py + panelH - 24;

  // Visible track background (slate-700 — clearly distinguishable)
  ctx.fillStyle = '#334155';
  ctx.beginPath(); ctx.roundRect(healX, healY, miniBarW, miniBarH, 5); ctx.fill();

  // Colored fill
  let hColor = '#22c55e';
  if (health < 30) hColor = '#ef4444';
  else if (health < 60) hColor = '#eab308';

  // Flash animation only at critical
  if (health < 30 && Math.sin(Date.now() * 0.025) < 0) hColor = '#7f1d1d';

  const fillW = Math.max(0, (health / 100) * miniBarW);
  ctx.fillStyle = hColor;
  ctx.beginPath(); ctx.roundRect(healX, healY, fillW, miniBarH, 5); ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(healX, healY, miniBarW, miniBarH, 5); ctx.stroke();

  // Label above bar
  ctx.fillStyle = health < 30 ? '#fca5a5' : 'rgba(255,255,255,0.75)';
  ctx.font = `bold 9px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`ĐỘ BỀN DÂY: ${Math.ceil(health)}%`, CANVAS_WIDTH / 2, healY - 5);


  // 7. Instructions
  ctx.save();
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  const alpha = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
  ctx.globalAlpha = alpha;
  ctx.fillText('GIỮ SPACE ĐỂ KÉO - GIỮ TRONG VÙNG XANH!', CANVAS_WIDTH / 2, by - 10);
  ctx.restore();

  ctx.restore();
};

export const drawPowerBar = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  power: number
) => {
  const pbW = 200; const pbH = 22;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.shadowBlur = 15;
  ctx.roundRect(x - 20, y - 10, pbW + 40, pbH + 25, 12);
  ctx.fill();
  
  ctx.fillStyle = '#020617';
  ctx.fillRect(x, y, pbW, pbH);
  
  const gradient = ctx.createLinearGradient(x, 0, x + pbW, 0);
  gradient.addColorStop(0, '#22c55e');
  gradient.addColorStop(0.5, '#eab308');
  gradient.addColorStop(1, '#ef4444');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, (power/100) * pbW, pbH);

  // Perfect Cast indicator: glow when >= 95%
  if (power >= 95) {
    ctx.save();
    ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.02) * 8;
    ctx.shadowColor = '#fbbf24';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, pbW, pbH);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ HOÀN HẢO!', x + pbW / 2, y + pbH / 2 + 4);
    ctx.restore();
  } else {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, pbW, pbH);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QUĂNG CẦN: ' + Math.floor(power) + '%', x + pbW/2, y - 12);
  }
  ctx.restore();
};

// --- God Rays (Ocean only) ---
export const drawGodRays = (ctx: CanvasRenderingContext2D, frame: number) => {
  ctx.save();
  const cx = CANVAS_WIDTH * 0.4;
  const numRays = 8;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI + (frame * 0.0008);
    const opacity = 0.025 + Math.sin(frame * 0.015 + i * 1.3) * 0.015;
    const spread = 0.06 + Math.sin(frame * 0.01 + i) * 0.02;
    const length = 380 + Math.sin(frame * 0.02 + i) * 60;

    const x1 = cx + Math.cos(angle - spread) * 5;
    const y1 = 200;
    const x2 = cx + Math.cos(angle + spread) * 5;
    const y2 = 200;
    const x3 = cx + Math.cos(angle + spread) * length;
    const y3 = 200 + Math.sin(angle + spread) * length;
    const x4 = cx + Math.cos(angle - spread) * length;
    const y4 = 200 + Math.sin(angle - spread) * length;

    const grad = ctx.createLinearGradient(cx, 200, cx + Math.cos(angle) * length, 200 + Math.sin(angle) * length);
    grad.addColorStop(0, `rgba(150, 230, 255, ${opacity * 2})`);
    grad.addColorStop(1, `rgba(100, 200, 255, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

// --- Fireflies & Leaf Fall (Pond Night) ---
const fireflyPool: { x: number; y: number; phase: number; speed: number; size: number }[] = [];
const leafPool: { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number; opacity: number }[] = [];

export const drawAmbientNight = (ctx: CanvasRenderingContext2D, frame: number) => {
  // Init firefly pool once
  if (fireflyPool.length === 0) {
    for (let i = 0; i < 18; i++) {
      fireflyPool.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 80 + Math.random() * 120,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 2,
      });
    }
  }
  if (leafPool.length === 0) {
    for (let i = 0; i < 12; i++) {
      leafPool.push({
        x: Math.random() * CANVAS_WIDTH,
        y: -Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.4 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: 4 + Math.random() * 6,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
  }

  ctx.save();

  // Fireflies
  fireflyPool.forEach(f => {
    f.x += Math.sin(frame * f.speed * 0.05 + f.phase) * 0.8;
    f.y += Math.cos(frame * f.speed * 0.04 + f.phase) * 0.5;
    if (f.y > 200) f.y = 60 + Math.random() * 80;
    if (f.x < 0) f.x = CANVAS_WIDTH; if (f.x > CANVAS_WIDTH) f.x = 0;

    const glow = (Math.sin(frame * 0.07 + f.phase) + 1) / 2;
    ctx.save();
    ctx.globalAlpha = 0.3 + glow * 0.7;
    ctx.shadowBlur = 10 + glow * 15;
    ctx.shadowColor = '#a3e635';
    ctx.fillStyle = `rgba(163, 230, 53, ${0.6 + glow * 0.4})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * (0.6 + glow * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Falling leaves
  leafPool.forEach(l => {
    l.x += l.vx + Math.sin(frame * 0.02) * 0.3;
    l.y += l.vy;
    l.rot += l.rotSpeed;
    if (l.y > 210) { l.y = -20; l.x = Math.random() * CANVAS_WIDTH; }

    ctx.save();
    ctx.globalAlpha = l.opacity;
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
};

// --- Boss Health Bar Flash (hit feedback) ---
let bossHitFlash = 0;
export const triggerBossHitFlash = () => { bossHitFlash = 8; };
export const drawBossHealthBarFlash = (
  ctx: CanvasRenderingContext2D,
  bossHp: number,
  bossMaxHp: number,
  barX: number,
  barW: number,
  barH: number,
  barY: number,
  isEnraged: boolean,
  frame: number
) => {
  if (bossHitFlash > 0) bossHitFlash--;
  const isFlashing = bossHitFlash > 0;

  // BG
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 8, 10); ctx.fill();

  // Drain track
  ctx.fillStyle = '#450a0a';
  ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();

  // Health fill
  const hpRatio = bossHp / bossMaxHp;
  if (isFlashing) {
    // Flash white
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.roundRect(barX, barY, hpRatio * barW, barH, 6); ctx.fill();
    ctx.restore();
  } else {
    const hpColor = isEnraged ? '#ef4444' : '#991b1b';
    ctx.fillStyle = hpColor;
    // Subtle pulse when enraged
    if (isEnraged) {
      ctx.save();
      ctx.shadowBlur = 8 + Math.sin(frame * 0.15) * 6;
      ctx.shadowColor = '#ef4444';
      ctx.roundRect(barX, barY, hpRatio * barW, barH, 6); ctx.fill();
      ctx.restore();
    } else {
      ctx.roundRect(barX, barY, hpRatio * barW, barH, 6); ctx.fill();
    }
  }
};

