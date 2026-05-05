
import { Rarity, FishType, GameState, RodType } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, REEL_BAR_HEIGHT } from './gameData';


export const drawWaterAndSky = (ctx: CanvasRenderingContext2D, frame: number, weather: 'sunny' | 'rainy' | 'stormy' = 'sunny') => {
  // Deep Sky Gradient based on weather
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
  if (weather === 'sunny') {
    skyGrad.addColorStop(0, '#0c4a6e');
    skyGrad.addColorStop(1, '#38bdf8');
  } else if (weather === 'rainy') {
    skyGrad.addColorStop(0, '#1e293b');
    skyGrad.addColorStop(1, '#475569');
  } else {
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#1e293b');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 200);

  // Distant Mountains
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = weather === 'sunny' ? '#075985' : '#0f172a';
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.lineTo(150, 140);
  ctx.lineTo(300, 200);
  ctx.lineTo(450, 120);
  ctx.lineTo(650, 200);
  ctx.lineTo(CANVAS_WIDTH, 160);
  ctx.lineTo(CANVAS_WIDTH, 200);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Floating Clouds
  ctx.save();
  ctx.globalAlpha = weather === 'sunny' ? 0.3 : 0.1;
  ctx.fillStyle = 'white';
  for(let i=0; i<3; i++) {
    const cx = ((frame * (0.2 + i * 0.1)) + (i * 300)) % (CANVAS_WIDTH + 200) - 100;
    const cy = 40 + i * 30;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 20, cy - 10, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Water Background
  const waterGrad = ctx.createLinearGradient(0, 200, 0, CANVAS_HEIGHT);
  if (weather === 'sunny') {
    waterGrad.addColorStop(0, '#0ea5e9');
    waterGrad.addColorStop(0.5, '#0369a1');
    waterGrad.addColorStop(1, '#0c4a6e');
  } else {
    waterGrad.addColorStop(0, '#0f172a');
    waterGrad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 200, CANVAS_WIDTH, 400);

  // Animated Wave Layers
  const drawWave = (offsetY: number, amplitude: number, frequency: number, color: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
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

  if (weather === 'sunny') {
    drawWave(10, 5, 0.01, '#0284c7', 0.4);
    drawWave(30, 8, 0.008, '#0369a1', 0.3);
  } else {
    drawWave(10, 12, 0.015, '#1e293b', 0.5);
    drawWave(40, 15, 0.012, '#0f172a', 0.4);
  }

  // God Rays or Storm Lightning
  ctx.save();
  if (weather === 'sunny') {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 5; i++) {
      const xOffset = Math.sin(frame * 0.005 + i) * 20;
      ctx.beginPath();
      ctx.moveTo(100 + i * 200 + xOffset, 200);
      ctx.lineTo(250 + i * 200 + xOffset, 200);
      ctx.lineTo(150 + i * 200 + xOffset * 2, CANVAS_HEIGHT);
      ctx.lineTo(-50 + i * 200 + xOffset * 2, CANVAS_HEIGHT);
      ctx.fill();
    }
  } else if (weather === 'stormy' && Math.random() > 0.99) {
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
  ctx.save();
  if (customPos) {
    ctx.translate(customPos.x, customPos.y);
    ctx.rotate(customPos.angle);
    if (customPos.direction === -1) ctx.scale(-1, 1);
  }

  const { size, color, rarity, name } = fishType;
  const finalColor = isGolden ? '#fbbf24' : color;

  let wagFreq = 0.15;
  let wagAmp = 0.1;

  if (isStruggling) {
    wagFreq = 0.8;
    wagAmp = 0.5;
  } else {
    wagFreq = 0.05 + (currentSpeed * 0.12);
    wagAmp = 0.04 + (currentSpeed * 0.06);
    if (swimStyle === 'charger') { wagFreq *= 1.4; wagAmp *= 0.7; }
    else if (swimStyle === 'glider') { wagFreq *= 0.7; wagAmp *= 1.2; }
  }

  const bodyWiggle = Math.sin(frameCount * wagFreq) * (wagAmp * 0.3);
  ctx.rotate(bodyWiggle);

  if (isStruggling) {
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
  }

  // Golden Glow for Golden Fish or Caught state
  if (isCaught || isGolden) {
    ctx.shadowBlur = isGolden ? 35 : 30;
    ctx.shadowColor = '#fbbf24';
    
    // Outer golden aura
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(frameCount * 0.2) * 0.2;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.4, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (isGolden && !isCaught) {
        // Shine sparkles for golden fish in water
        if (frameCount % 10 === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc((Math.random()-0.5)*size, (Math.random()-0.5)*size, 2, 0, Math.PI*2);
            ctx.fill();
        }
    }
  } else {
    if (rarity === Rarity.MYTHIC || rarity === Rarity.LEGENDARY) {
        const pCount = 2;
        for(let i=0; i<pCount; i++) {
            const px = (Math.random() - 0.5) * size;
            const py = (Math.random() - 0.5) * size;
            ctx.fillStyle = rarity === Rarity.MYTHIC ? '#f87171' : '#fbbf24';
            ctx.globalAlpha = Math.random() * 0.4;
            ctx.beginPath(); ctx.arc(-size + px, py, Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }

    if (rarity === Rarity.MYTHIC) { ctx.shadowBlur = 25; ctx.shadowColor = '#ff0000'; }
    else if (rarity === Rarity.LEGENDARY) { ctx.shadowBlur = 15; ctx.shadowColor = '#fbbf24'; }
    else if (rarity === Rarity.EPIC) { ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7'; }
  }

  const gradient = ctx.createLinearGradient(-size, 0, size, 0);
  gradient.addColorStop(0, finalColor);
  gradient.addColorStop(1, isGolden ? '#ffffffaa' : '#ffffff44');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  if (name.includes('Long Ngư') || name.includes('Rồng')) { ctx.ellipse(0, 0, size * 1.6, size * 0.45, 0, 0, Math.PI * 2); }
  else if (name.includes('Kiếm')) { ctx.ellipse(0, 0, size * 1.1, size * 0.4, 0, 0, Math.PI * 2); }
  else { ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2); }
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.setLineDash([2, 4]);
  for(let i=-size; i<size; i+=8) {
    ctx.beginPath(); ctx.moveTo(i, -size); ctx.lineTo(i + 12, size); ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(size * 0.65, -size * 0.2, size * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath(); ctx.arc(size * 0.7, -size * 0.2, size * 0.08, 0, Math.PI * 2); ctx.fill();

  const finFlutter = Math.sin(frameCount * wagFreq * 2) * 0.15;
  ctx.save();
  ctx.rotate(finFlutter);
  ctx.fillStyle = finalColor;
  ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.moveTo(0, -size * 0.3); ctx.lineTo(-size * 0.6, -size * 0.9); ctx.lineTo(-size * 0.2, -size * 0.3); ctx.fill();
  ctx.restore();

  const tailWag = Math.sin(frameCount * wagFreq - 0.8) * (wagAmp * 1.2);
  ctx.save();
  ctx.rotate(tailWag);
  ctx.fillStyle = finalColor;
  ctx.beginPath();
  ctx.moveTo(-size * 0.85, 0);
  ctx.lineTo(-size * 1.6, -size * 0.8);
  ctx.lineTo(-size * 1.3, 0);
  ctx.lineTo(-size * 1.6, size * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

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
  const cpY = bendAmount * length * 0.6;
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
  fishTension: number = 0,
  currentRod: RodType,
  chargePower: number = 0
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
    rodBend = 0.8 * (fishTension / 100);
    charTilt = -0.08 * (fishTension / 50);
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

  // Character
  ctx.save();
  ctx.translate(pX - 40, pY - 20);
  ctx.rotate(charTilt);
  ctx.fillStyle = '#334155'; ctx.fillRect(10, 20, 8, 15); ctx.fillRect(22, 20, 8, 15); 
  ctx.fillStyle = '#e11d48'; ctx.fillRect(5, 0, 30, 25); 
  ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(25, 10); ctx.lineTo(45, 8); ctx.stroke(); 
  ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(20, -10, 12, 0, Math.PI * 2); ctx.fill(); 
  ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(20, -12, 14, Math.PI, Math.PI * 2); ctx.lineTo(38, -12); ctx.lineTo(2, -12); ctx.closePath(); ctx.fill(); 
  ctx.restore();

  const handX = pX - 15;
  const handY = pY - 12;
  drawRodTexture(ctx, currentRod, handX, handY, rodEndX, rodEndY, rodBend);

  // Line
  const visibleStates = [GameState.CHARGING, GameState.CASTING, GameState.WAITING, GameState.REELING, GameState.CAUGHT];
  if (visibleStates.includes(gameState)) {
    const isLowHealth = lineHealth < 30 && gameState === GameState.REELING;
    const isHighTension = fishTension > 75 && gameState === GameState.REELING;
    
    let shakeX = 0, shakeY = 0;
    if (gameState === GameState.REELING || gameState === GameState.CAUGHT) {
      const vibIntensity = (fishTension / 40) + (isLowHealth ? 4 : 0.5);
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
    ctx.moveTo(rodEndX, rodEndY + (rodBend * 50));
    let cpX = (rodEndX + hookX) / 2 + shakeX;
    let cpY = Math.min(rodEndY, hookY) - (isCasting ? 180 : 30) + shakeY; 
    if (gameState === GameState.REELING) cpY += 80;
    
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
  isInZone: boolean
) => {
  const bx = CANVAS_WIDTH - 70;
  const by = 120;
  const bw = 25;
  const hz = zoneSize / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'black';
  ctx.roundRect(bx - 45, by - 30, 115, REEL_BAR_HEIGHT + 60, 20);
  ctx.fill();

  ctx.fillStyle = '#1e293b'; ctx.fillRect(bx - 30, by, 10, REEL_BAR_HEIGHT);
  const progGrad = ctx.createLinearGradient(0, by, 0, by + REEL_BAR_HEIGHT);
  progGrad.addColorStop(0, '#60a5fa');
  progGrad.addColorStop(1, '#2563eb');
  ctx.fillStyle = progGrad; 
  ctx.fillRect(bx - 30, by + REEL_BAR_HEIGHT - (progress/100)*REEL_BAR_HEIGHT, 10, (progress/100)*REEL_BAR_HEIGHT);

  const dangerGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
  dangerGrad.addColorStop(0, '#7f1d1d');
  dangerGrad.addColorStop(0.5, '#ef4444');
  dangerGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = dangerGrad;
  ctx.fillRect(bx, by, bw, REEL_BAR_HEIGHT);
  
  const safeZoneTop = by + (tensionZone * REEL_BAR_HEIGHT) - (hz * REEL_BAR_HEIGHT);
  const safeZoneHeight = zoneSize * REEL_BAR_HEIGHT;
  
  const zoneGrad = ctx.createLinearGradient(bx, safeZoneTop, bx + bw, safeZoneTop);
  zoneGrad.addColorStop(0, '#166534');
  zoneGrad.addColorStop(0.5, '#4ade80');
  zoneGrad.addColorStop(1, '#166534');
  
  ctx.save();
  if (isInZone) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ade80';
  }
  ctx.fillStyle = zoneGrad;
  ctx.fillRect(bx, safeZoneTop, bw, safeZoneHeight);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, safeZoneTop, bw, safeZoneHeight);
  
  const cy = by + tensionCursor * REEL_BAR_HEIGHT;
  ctx.save();
  ctx.strokeStyle = '#ffffff'; 
  ctx.lineWidth = 5;
  ctx.shadowBlur = isInZone ? 12 : 0;
  ctx.shadowColor = 'white';
  ctx.beginPath(); 
  ctx.moveTo(bx - 10, cy); 
  ctx.lineTo(bx + bw + 10, cy); 
  ctx.stroke();
  
  if (isInZone) {
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(bx + bw/2, cy, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = '#1e293b'; ctx.fillRect(bx + 40, by, 10, REEL_BAR_HEIGHT);
  let healthColor = '#22c55e';
  if (health < 30) {
      healthColor = (Math.sin(Date.now() * 0.02) > 0) ? '#ef4444' : '#7f1d1d';
  } else if (health < 60) {
      healthColor = '#eab308';
  }
  ctx.fillStyle = healthColor;
  ctx.fillRect(bx + 40, by + REEL_BAR_HEIGHT - (health/100)*REEL_BAR_HEIGHT, 10, (health/100)*REEL_BAR_HEIGHT);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TIẾN ĐỘ', bx - 25, by - 14);
  ctx.fillText('LỰC CĂNG', bx + 12, by - 14);
  ctx.fillText('ĐỘ BỀN', bx + 45, by - 14);

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.font = 'bold 9px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('DANGER', bx + bw/2, by + 18);
  ctx.fillText('DANGER', bx + bw/2, by + REEL_BAR_HEIGHT - 12);
  if (zoneSize > 0.15) {
      ctx.fillText('SAFE', bx + bw/2, safeZoneTop + safeZoneHeight/2 + 4);
  }
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
