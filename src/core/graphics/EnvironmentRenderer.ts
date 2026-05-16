
import { LocationType, TimeOfDay, WeatherType } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/gameData';
import { SKY_COLORS, WATER_COLORS, lerpColor, drawVignette } from './Utils';

export const drawWaterAndSky = (
  ctx: CanvasRenderingContext2D, 
  frame: number, 
  weather: WeatherType = 'sunny', 
  location: LocationType = 'POND', 
  timeOfDay: TimeOfDay = 'DAY',
  prevTimeOfDay: TimeOfDay = 'DAY',
  transition: number = 1, // 0 to 1
  scrollX: number = CANVAS_WIDTH / 2,
  vfxEnabled: boolean = true
) => {
  const parallaxOffset = (scrollX - CANVAS_WIDTH / 2);
  const getSkyTarget = (t: TimeOfDay) => {
    if (location === 'CAVE') return SKY_COLORS.CAVE;
    if (t === 'NIGHT') return SKY_COLORS.NIGHT;
    if (t === 'SUNSET') return SKY_COLORS.SUNSET;
    if (weather === 'sunny' || weather === 'rainbow' || weather === 'aurora') return SKY_COLORS.DAY_SUNNY;
    if (weather === 'rainy' || weather === 'deep_sea_current') return SKY_COLORS.DAY_RAINY;
    if (weather === 'foggy' || weather === 'crystal_resonance') return ['#94a3b8', '#cbd5e1'];
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

  // Sun/Moon
  if (location !== 'CAVE') {
    drawSunMoon(ctx, frame, timeOfDay, prevTimeOfDay, transition, weather, parallaxOffset);
  }

  // --- Background Scenery ---
  ctx.save();
  if (location === 'POND') {
    drawHills(ctx, frame, transition, timeOfDay, prevTimeOfDay, parallaxOffset);
    if (vfxEnabled) drawWindParticles(ctx, frame, transition, 'POND');
  } else if (location === 'OCEAN') {
    drawClouds(ctx, frame, transition, timeOfDay, prevTimeOfDay, parallaxOffset);
    drawDistantLighthouse(ctx, frame, transition, timeOfDay);
    if (vfxEnabled) {
      drawWindParticles(ctx, frame, transition, 'OCEAN');
      if (weather === 'sunny') drawBirds(ctx, frame);
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

  if (vfxEnabled) {
    drawBackgroundFish(ctx, frame, location);
    drawUnderwaterParticles(ctx, frame, location);
  }


  // Wave Layers
  const drawWave = (offsetY: number, amplitude: number, frequency: number, colors: string[], alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = lerpColor(colors[0], colors[1], transition);
    ctx.beginPath();
    ctx.moveTo(0, 200 + offsetY);
    // Optimization: Increased step size from 10 to 40 for faster path calculation
    for (let x = 0; x <= CANVAS_WIDTH + 40; x += 40) {
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

  if (vfxEnabled) {
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
         ctx.fillRect(px, py, width, 1.5);
       }
    }
    ctx.restore();
  }

  drawVignette(ctx);
};

const rainPool: { x: number; y: number; speed: number; len: number }[] = [];

export const drawWeatherEffects = (ctx: CanvasRenderingContext2D, frame: number, weather: string, location: LocationType) => {
  if (location === 'OCEAN' && weather === 'deep_sea_current') {
    drawDeepSeaCurrent(ctx, frame);
    return;
  }

  if (location === 'CAVE' && weather === 'crystal_resonance') {
    drawCrystalResonance(ctx, frame);
    return;
  }

  if (location === 'CAVE' && weather === 'falling_stalactite') {
    drawFallingStalactites(ctx, frame);
    return;
  }

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

export const drawDeepSeaCurrent = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.save();
    // Fast moving current lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        const speed = 15 + (i % 5) * 5;
        const x = (frame * speed + i * 200) % (CANVAS_WIDTH + 400) - 200;
        const y = 250 + (i * 20);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 100, y);
        ctx.stroke();
    }
    // Faster bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
        const x = (frame * 10 + i * 150) % (CANVAS_WIDTH + 200) - 100;
        const y = 200 + (Math.sin(frame * 0.05 + i) * 150) + 150;
        ctx.beginPath();
        ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

export const drawCrystalResonance = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.save();
    // Pulsing background glow
    const pulse = 0.1 + Math.sin(frame * 0.02) * 0.05;
    ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Floating crystals (Reduced count and complexity)
    for (let i = 0; i < 10; i++) { // Reduced from 15
        const x = (Math.sin(i * 123) * 1000 + frame * 0.4) % CANVAS_WIDTH;
        const y = (Math.cos(i * 321) * 1000 + Math.sin(frame * 0.01 + i) * 40) % (CANVAS_HEIGHT - 200) + 200;
        const size = 3 + Math.sin(frame * 0.05 + i) * 2;
        const alpha = 0.3 + Math.sin(frame * 0.03 + i) * 0.2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.015 + i);
        
        // Glow effect without shadowBlur
        ctx.fillStyle = `rgba(192, 132, 252, ${alpha * 0.3})`;
        ctx.beginPath(); ctx.arc(0, 0, size * 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -size * 2);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size * 2);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();
};

const stalactitePool: { x: number; y: number; speed: number; size: number; state: 'falling' | 'wait'; delay: number }[] = [];

export const drawFallingStalactites = (ctx: CanvasRenderingContext2D, frame: number) => {
    if (stalactitePool.length === 0) {
        for (let i = 0; i < 8; i++) {
            stalactitePool.push({
                x: Math.random() * CANVAS_WIDTH,
                y: -100,
                speed: 8 + Math.random() * 12,
                size: 15 + Math.random() * 25,
                state: 'wait',
                delay: frame + Math.random() * 600
            });
        }
    }

    ctx.save();
    stalactitePool.forEach(s => {
        if (s.state === 'wait') {
            if (frame > s.delay) {
                s.state = 'falling';
                s.x = Math.random() * CANVAS_WIDTH;
            }
        } else {
            s.y += s.speed;
            
            // Draw stalactite
            ctx.save();
            ctx.translate(s.x, s.y);
            const grad = ctx.createLinearGradient(0, -s.size, 0, s.size);
            grad.addColorStop(0, '#1f2937');
            grad.addColorStop(0.8, '#4b5563');
            grad.addColorStop(1, '#9ca3af');
            ctx.fillStyle = grad;
            
            ctx.beginPath();
            ctx.moveTo(-s.size * 0.4, -s.size);
            ctx.lineTo(s.size * 0.4, -s.size);
            ctx.lineTo(0, s.size);
            ctx.closePath();
            ctx.fill();
            
            // Highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            if (s.y > 200) {
                // Splash/impact on water surface
                ctx.beginPath();
                ctx.ellipse(s.x, 200, s.size * 0.8, s.size * 0.3, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Reset
                s.y = -100;
                s.state = 'wait';
                s.delay = frame + 200 + Math.random() * 500;
            }
        }
    });
    ctx.restore();
};

export const drawHills = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay, parallaxOffset: number = 0) => {
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
  const p1 = parallaxOffset * 0.15;
  for (let x = -100; x <= CANVAS_WIDTH + 100; x += 50) {
    const y = 140 + Math.sin((x + p1) * 0.005 + 1) * 30 + Math.cos((x + p1) * 0.01) * 10;
    ctx.lineTo(x - p1, y);
  }
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.fill();

  ctx.fillStyle = lerpColor(colorsPrev[0], colorsCurr[0], transition);
  ctx.beginPath();
  ctx.moveTo(0, 200);
  const p2 = parallaxOffset * 0.25;
  for (let x = -100; x <= CANVAS_WIDTH + 100; x += 40) {
    const y = 160 + Math.sin((x + p2) * 0.008 + 2) * 25 + Math.cos((x + p2) * 0.015) * 15;
    ctx.lineTo(x - p2, y);
  }
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.fill();

  // Add trees to hills
  drawTrees(ctx, frame, transition, time, prevTime, parallaxOffset);
  
  // Reeds in foreground
  drawReeds(ctx, frame, transition, time, prevTime);
};

export const drawReeds = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay) => {
    const getReedColor = (t: TimeOfDay) => {
        if (t === 'DAY') return '#166534';
        if (t === 'SUNSET') return '#451a03';
        return '#052e16';
    };
    
    ctx.save();
    ctx.globalAlpha = transition;
    ctx.fillStyle = lerpColor(getReedColor(prevTime), getReedColor(time), transition);
    
    for (let i = 0; i < 8; i++) {
        const x = (i * 120 + (Math.sin(i * 123) * 50)) % (CANVAS_WIDTH + 40);
        const h = 30 + (i % 3) * 15;
        const sway = Math.sin(frame * 0.02 + i) * 5;
        
        ctx.beginPath();
        ctx.moveTo(x, 200);
        ctx.quadraticCurveTo(x + sway, 200 - h/2, x, 200 - h);
        ctx.lineWidth = 3;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
        
        // Reed head
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.ellipse(x + sway * 0.8, 200 - h + 5, 3, 10, sway * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

export const drawTrees = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay, parallaxOffset: number = 0) => {
    const getTreeColor = (t: TimeOfDay) => {
        if (t === 'DAY') return '#064e3b';
        if (t === 'SUNSET') return '#451a03';
        return '#021a0a';
    };
    
    ctx.save();
    ctx.globalAlpha = transition;
    ctx.fillStyle = lerpColor(getTreeColor(prevTime), getTreeColor(time), transition);
    
    const p = parallaxOffset * 0.25;
    for (let i = 0; i < 15; i++) {
        const x = (i * 137) % CANVAS_WIDTH;
        const drawX = x - p;
        const hillY = 160 + Math.sin(x * 0.008 + 2) * 25 + Math.cos(x * 0.015) * 15;
        const h = 20 + (i % 3) * 10;
        const w = 8 + (i % 2) * 4;
        
        // Tree trunk
        ctx.fillRect(drawX - 2, hillY - 5, 4, 10);
        
        // Tree foliage (triangular)
        ctx.beginPath();
        ctx.moveTo(drawX - w, hillY - 5);
        ctx.lineTo(drawX, hillY - 5 - h);
        ctx.lineTo(drawX + w, hillY - 5);
        ctx.fill();
    }
    ctx.restore();
};

export const drawSunMoon = (ctx: CanvasRenderingContext2D, frame: number, time: TimeOfDay, prevTime: TimeOfDay, transition: number, weather: string, parallaxOffset: number = 0) => {
    const isNight = time === 'NIGHT' || (prevTime === 'NIGHT' && transition < 0.5);
    const alpha = (weather === 'sunny' || weather === 'rainbow') ? 1 : 0.3;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const p = parallaxOffset * 0.05;
    const x = (CANVAS_WIDTH * 0.2 + (time === 'SUNSET' ? CANVAS_WIDTH * 0.6 * transition : 0)) - p;
    const y = time === 'SUNSET' ? 120 + transition * 50 : 60;
    
    if (time === 'NIGHT' || (prevTime === 'NIGHT' && transition < 0.8)) {
        // Moon
        const moonAlpha = time === 'NIGHT' ? transition : 1 - transition;
        ctx.globalAlpha = moonAlpha * alpha;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fillStyle = '#f1f5f9';
        const moonX = CANVAS_WIDTH * 0.8 - p;
        ctx.beginPath();
        ctx.arc(moonX, 50, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon crater effect
        ctx.globalAlpha = moonAlpha * 0.2;
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(moonX - 8, 45, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(moonX + 5, 55, 8, 0, Math.PI * 2); ctx.fill();
    } else {
        // Sun
        const sunAlpha = (prevTime === 'NIGHT' && transition < 1) ? transition : 1;
        ctx.globalAlpha = sunAlpha * alpha;
        const sunColor = time === 'SUNSET' ? '#fbbf24' : '#fef3c7';
        const glowColor = time === 'SUNSET' ? '#f59e0b' : '#fbbf24';
        
        // Sun/Moon glow without shadowBlur
        ctx.fillStyle = `rgba(${time === 'SUNSET' ? '245, 158, 11' : '251, 191, 36'}, 0.3)`;
        ctx.beginPath(); ctx.arc(x, y, 50, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = sunColor;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun rays
        if (weather === 'sunny') {
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = sunAlpha * 0.3;
            for (let i = 0; i < 8; i++) {
                const angle = (i * 45 + frame * 0.2) * Math.PI / 180;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * 40, y + Math.sin(angle) * 40);
                ctx.lineTo(x + Math.cos(angle) * 60, y + Math.sin(angle) * 60);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
};

export const drawClouds = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay, prevTime: TimeOfDay, parallaxOffset: number = 0) => {
  const baseAlpha = time === 'NIGHT' ? (1 - transition) * 0.3 : (prevTime === 'NIGHT' ? transition * 0.3 : 0.6);
  if (baseAlpha <= 0) return;
  
  const drawCloudLayer = (count: number, speed: number, alphaMult: number, yOffset: number, scale: number) => {
    ctx.save();
    ctx.globalAlpha = baseAlpha * alphaMult;
    ctx.fillStyle = time === 'SUNSET' ? '#fed7aa' : 'white';
    const p = parallaxOffset * speed * 2; // Cloud parallax
    for (let i = 0; i < count; i++) {
      const x = ((i * (CANVAS_WIDTH/count*1.5) + frame * speed) % (CANVAS_WIDTH + 400)) - 200 - p;
      const y = yOffset + Math.sin(i + frame * 0.01) * 20;
      const size = (40 + (i % 3) * 20) * scale;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
      ctx.arc(x + size * 1.2, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawCloudLayer(4, 0.05, 0.4, 30, 0.8); // Distant slow clouds
  drawCloudLayer(5, 0.12, 1.0, 60, 1.0); // Main clouds
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
    const size = 2 + Math.sin(frame * 0.05 + i) * 1.5;
    const hue = 200 + Math.sin(i) * 60;
    ctx.save();
    // Fast glow
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
    ctx.beginPath(); ctx.arc(x, y, size * 4, 0, Math.PI * 2); ctx.fill();

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
  
  drawDrippingWater(ctx, frame);
};

const caveDripPool: { x: number; y: number; speed: number; delay: number }[] = [];

export const drawDrippingWater = (ctx: CanvasRenderingContext2D, frame: number) => {
    if (caveDripPool.length === 0) {
        for (let i = 0; i < 5; i++) {
            caveDripPool.push({
                x: (i * 150 + 100) % CANVAS_WIDTH,
                y: -10,
                speed: 2 + Math.random() * 2,
                delay: Math.random() * 200
            });
        }
    }
    
    ctx.save();
    ctx.fillStyle = 'rgba(125, 211, 252, 0.6)';
    caveDripPool.forEach(d => {
        if (frame > d.delay) {
            d.y += d.speed;
            if (d.y > 200) {
                // Ripple effect on water surface
                ctx.beginPath();
                ctx.ellipse(d.x, 200, 5, 2, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
                
                d.y = -10;
                d.delay = frame + Math.random() * 300;
            }
            
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.restore();
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

const bgFishPool: { x: number; y: number; speed: number; size: number; phase: number; color: string }[] = [];

export const drawBackgroundFish = (ctx: CanvasRenderingContext2D, frame: number, location: LocationType) => {
    if (bgFishPool.length === 0) {
        for (let i = 0; i < 10; i++) {
            bgFishPool.push({
                x: Math.random() * CANVAS_WIDTH,
                y: 250 + Math.random() * 300,
                speed: 0.5 + Math.random() * 1,
                size: 4 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2,
                color: location === 'OCEAN' ? 'rgba(125, 211, 252, 0.3)' : 'rgba(74, 222, 128, 0.2)'
            });
        }
    }
    
    ctx.save();
    bgFishPool.forEach(f => {
        f.x += f.speed;
        if (f.x > CANVAS_WIDTH + 50) {
            f.x = -50;
            f.y = 250 + Math.random() * 300;
        }
        
        const sway = Math.sin(frame * 0.05 + f.phase) * 3;
        ctx.fillStyle = f.color;
        
        ctx.beginPath();
        // Body
        ctx.ellipse(f.x, f.y + sway, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(f.x - f.size * 0.8, f.y + sway);
        ctx.lineTo(f.x - f.size * 1.5, f.y + sway - f.size * 0.4);
        ctx.lineTo(f.x - f.size * 1.5, f.y + sway + f.size * 0.4);
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
};

export const drawDistantLighthouse = (ctx: CanvasRenderingContext2D, frame: number, transition: number, time: TimeOfDay) => {
    const x = CANVAS_WIDTH * 0.85;
    const y = 195;
    
    ctx.save();
    // Island base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 5);
    ctx.quadraticCurveTo(x, y - 5, x + 30, y + 5);
    ctx.fill();
    
    // Lighthouse body
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x - 5, y - 30, 10, 30);
    
    // Red stripes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 5, y - 25, 10, 5);
    ctx.fillRect(x - 5, y - 10, 10, 5);
    
    // Top
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 7, y - 35, 14, 5);
    
    // Light
    if (time === 'NIGHT' || time === 'SUNSET') {
        const glow = (Math.sin(frame * 0.05) + 1) / 2;
        ctx.shadowBlur = 20 * glow;
        ctx.shadowColor = '#fde047';
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x, y - 32, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Light beam
        if (time === 'NIGHT') {
            ctx.save();
            ctx.globalAlpha = 0.2 * glow;
            const beamAngle = (frame * 0.02) % (Math.PI * 2);
            const beamGrad = ctx.createRadialGradient(x, y - 32, 0, x, y - 32, 150);
            beamGrad.addColorStop(0, '#fde047');
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(x, y - 32);
            ctx.arc(x, y - 32, 150, beamAngle - 0.2, beamAngle + 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    ctx.restore();
};

const windParticlePool: { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number; color: string }[] = [];

export const drawWindParticles = (ctx: CanvasRenderingContext2D, frame: number, transition: number, location: LocationType) => {
    if (windParticlePool.length === 0) {
        for (let i = 0; i < 15; i++) {
            windParticlePool.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * 200,
                vx: 1 + Math.random() * 2,
                vy: 0.2 + Math.random() * 0.5,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: 0.02 + Math.random() * 0.05,
                size: 3 + Math.random() * 3,
                color: location === 'POND' ? '#84cc16' : '#fecaca' // Leaves for Pond, Petals for Ocean
            });
        }
    }
    
    ctx.save();
    ctx.globalAlpha = 0.6 * transition;
    windParticlePool.forEach(p => {
        p.x += p.vx;
        p.y += p.vy + Math.sin(frame * 0.02 + p.x) * 0.2;
        p.rot += p.rotSpeed;
        
        if (p.x > CANVAS_WIDTH + 20) {
            p.x = -20;
            p.y = Math.random() * 180;
        }
        if (p.y > 200) p.y = 0;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    ctx.restore();
};
