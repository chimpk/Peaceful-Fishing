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
  OCEAN_NIGHT: ['#0f172a', '#0f172a', '#020617'],
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
      return ['#0f172a', '#020617'];
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

  // Storm Lightning
  if (weather === 'stormy' && Math.random() > 0.99 && location !== 'CAVE') {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
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
        ctx.translate(-size * 0.8, 0);
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
  bendAmount: number = 0
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
  frameCount: number = 0
) => {
  // Pier
  const pierGrad = ctx.createLinearGradient(0, 160, 0, 200);
  pierGrad.addColorStop(0, '#78350f');
  pierGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = pierGrad;
  ctx.fillRect(0, 160, 120, 40);

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

  // Calculate rod angle for hand alignment
  const rodBaseX = pX - 12;
  const rodBaseY = pY + (Math.sin(frameCount * 0.05) * 1); // Follow breathing
  const rodAngle = Math.atan2(rodEndY - rodBaseY, rodEndX - rodBaseX);

  // Professional Character Model (Included from character.ts)
  drawPlayer(ctx, pX - 40, pY, gameState, charTilt, frameCount, rodAngle);

  drawRodTexture(ctx, currentRod, rodBaseX, rodBaseY, rodEndX, rodEndY, rodBend);

  // Line
  const visibleStates = [GameState.CHARGING, GameState.CASTING, GameState.WAITING, GameState.REELING, GameState.CAUGHT];
  if (visibleStates.includes(gameState)) {
    const isLowHealth = lineHealth < 30 && gameState === GameState.REELING;
    const isHighTension = rodStress > 0.75 && gameState === GameState.REELING;
    
    let shakeX = 0, shakeY = 0;
    if (gameState === GameState.REELING || gameState === GameState.CAUGHT) {
      const vibIntensity = (rodStress * 2) + (isLowHealth ? 4 : 0.5);
      shakeX = (Math.random() - 0.5) * vibIntensity;
      shakeY = (Math.random() - 0.5) * vibIntensity;
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
    ctx.moveTo(rodEndX, rodEndY);
    let cpX = (rodEndX + hookX) / 2 + shakeX;
    let cpY = Math.min(rodEndY, hookY) - (isCasting ? 180 : 30) + shakeY; 
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
  const py = 60; // Move to top-middle area
  
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
  ctx.roundRect(px, py, panelW, panelH, 32);
  ctx.fill();
  
  // Panel Border
  ctx.strokeStyle = isInZone ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Fish Info Header
  if (fish) {
    const rarityColors: Record<string, string> = {
      'junk': '#94a3b8',
      'common': '#ffffff',
      'uncommon': '#4ade80',
      'rare': '#3b82f6',
      'epic': '#a855f7',
      'legendary': '#fbbf24',
      'mythic': '#f472b6'
    };
    const rarityColor = rarityColors[fish.rarity] || '#ffffff';
    const rarityLabel = fish.rarity.toUpperCase();
    
    const weight = (fish.value / 100).toFixed(1);
    const infoText = `🐟 ${fish.name.toUpperCase()}`;
    
    // Draw background for info
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.roundRect(CANVAS_WIDTH/2 - 140, py + 8, 280, 22, 6);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(infoText, CANVAS_WIDTH / 2 - 50, py + 24);
    
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`| ${rarityLabel} | ~${weight}kg`, CANVAS_WIDTH / 2 + 60, py + 23);
  }

  // 4. Main Horizontal Tension Bar
  // Background (Danger)
  const dangerGrad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
  dangerGrad.addColorStop(0, '#7f1d1d');
  dangerGrad.addColorStop(0.5, '#ef4444');
  dangerGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = dangerGrad;
  ctx.roundRect(bx, by, barW, barH, 8);
  ctx.fill();

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
    ctx.roundRect(safeX - 3 - pulse, by - 3 - pulse, safeW + 6 + pulse*2, barH + 6 + pulse*2, 10);
    ctx.fill();
  }
  ctx.fillStyle = zoneGrad;
  ctx.roundRect(safeX, by, safeW, barH, 6);
  ctx.fill();
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

  // 6. Line Health Mini Bar (Bottom Right)
  const miniBarW = 140;
  const miniBarH = 8;
  const healX = (CANVAS_WIDTH - miniBarW) / 2;
  const healY = py + panelH - 22;
  
  ctx.fillStyle = '#0f172a';
  ctx.roundRect(healX, healY, miniBarW, miniBarH, 4); ctx.fill();
  
  let hColor = '#22c55e';
  if (health < 30) hColor = (Math.sin(Date.now() * 0.02) > 0) ? '#ef4444' : '#7f1d1d';
  else if (health < 60) hColor = '#eab308';
  
  ctx.fillStyle = hColor;
  ctx.roundRect(healX, healY, (health/100) * miniBarW, miniBarH, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('ĐỘ BỀN DÂY', CANVAS_WIDTH / 2, healY - 6);

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
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, pbW, pbH);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QUĂNG CẦN: ' + Math.floor(power) + '%', x + pbW/2, y - 12);
  ctx.restore();
};
