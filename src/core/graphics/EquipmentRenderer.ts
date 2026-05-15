
import { GameState, RodType, TackleType, BaitType, LocationType } from '../../types';
import { drawPlayer } from './character';

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
  const dx = endX - startX; const dy = endY - startY;
  const length = Math.sqrt(dx*dx + dy*dy); const angle = Math.atan2(dy, dx);
  ctx.translate(startX, startY); ctx.rotate(angle);
  let rodColor = '#27272a';
  if (rod.id === 'rod_1') rodColor = '#d4d699';
  if (rod.id === 'rod_2') rodColor = '#18181b';
  if (rod.id === 'rod_3') rodColor = '#94a3b8';
  if (rod.id === 'rod_4') { rodColor = '#fbbf24'; ctx.shadowBlur = 15; ctx.shadowColor = '#fbbf24'; }
  ctx.beginPath(); ctx.moveTo(0, 0);
  const cpX = length * 0.5; const cpY = -bendAmount * length * 0.6;
  if (bendAmount > 0.8) {
      const heatFactor = Math.min(1, (bendAmount - 0.8) / 1.5);
      ctx.shadowBlur = 15 * heatFactor; ctx.shadowColor = `rgba(239, 68, 68, ${0.4 + heatFactor * 0.6})`;
      if (heatFactor > 0.4) {
          ctx.save(); ctx.globalAlpha = (heatFactor - 0.4) * 2; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(cpX, cpY, length, 0); ctx.stroke(); ctx.restore();
      }
  }
  ctx.quadraticCurveTo(cpX, cpY, length, 0);
  ctx.strokeStyle = rodColor; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  if (rod.id === 'rod_4') { ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3; ctx.stroke(); }
  ctx.save(); ctx.translate(12, 5); ctx.fillStyle = '#3f3f46'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#18181b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.rotate(reelRotation); ctx.strokeStyle = '#a1a1aa'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 0); ctx.stroke();
  ctx.fillStyle = '#18181b'; ctx.beginPath(); ctx.arc(10, 0, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
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
  currentTackle?: TackleType | BaitType,
  frameCount: number = 0,
  reelRotation: number = 0,
  location: LocationType = 'POND'
) => {
  let swayY = 0; let swayAngle = 0;
  if (location === 'OCEAN') { swayY = Math.sin(frameCount * 0.025) * 5; swayAngle = Math.cos(frameCount * 0.015) * 0.04; }
  const pivotX = 60; const pivotY = 180;
  ctx.save();
  if (location === 'OCEAN') { ctx.translate(pivotX, pivotY); ctx.rotate(swayAngle); ctx.translate(-pivotX, -pivotY + swayY); }
  if (location !== 'OCEAN') {
    ctx.save();
    if (location === 'CAVE') {
      const rockGrad = ctx.createLinearGradient(0, 150, 0, 200); rockGrad.addColorStop(0, '#52525b'); rockGrad.addColorStop(1, '#18181b');
      ctx.fillStyle = rockGrad; ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(25, 152); ctx.lineTo(50, 165); ctx.lineTo(85, 158); ctx.lineTo(115, 168); ctx.lineTo(135, 150); ctx.lineTo(150, 175); ctx.lineTo(140, 200); ctx.lineTo(0, 200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#71717a'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = '#09090b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(25, 152); ctx.lineTo(35, 180); ctx.lineTo(15, 200); ctx.moveTo(85, 158); ctx.lineTo(75, 185); ctx.lineTo(95, 200); ctx.moveTo(135, 150); ctx.lineTo(120, 175); ctx.lineTo(130, 200); ctx.stroke();
    } else {
      const pierGrad = ctx.createLinearGradient(0, 160, 0, 200); pierGrad.addColorStop(0, '#78350f'); pierGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = pierGrad; ctx.fillRect(0, 160, 120, 40); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      for (let i = 20; i < 120; i += 20) { ctx.beginPath(); ctx.moveTo(i, 160); ctx.lineTo(i, 200); ctx.stroke(); }
    }
    ctx.restore();
  }
  let charTilt = 0; let rodBend = 0;
  if (gameState === GameState.CHARGING) { charTilt = -0.15; rodBend = -0.5 * (chargePower / 100); }
  else if (gameState === GameState.CASTING) { charTilt = 0.2; rodBend = 0.3; }
  else if (gameState === GameState.REELING) { rodBend = Math.min(2.4, rodStress); charTilt = -0.08 * Math.min(1.4, rodStress); }
  const rodBaseX = pX - 12; const rodBaseY = pY + (Math.sin(frameCount * 0.05) * 1);
  const rodAngle = Math.atan2(rodEndY - rodBaseY, rodEndX - rodBaseX);
  drawPlayer(ctx, pX - 40, pY, gameState, charTilt, frameCount, rodAngle, reelRotation, 'back');
  if (location === 'OCEAN') {
    ctx.save(); const boatGrad = ctx.createLinearGradient(0, 140, 0, 200); boatGrad.addColorStop(0, '#78350f'); boatGrad.addColorStop(1, '#290f02');
    ctx.fillStyle = boatGrad; ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(100, 160); ctx.lineTo(130, 140); ctx.lineTo(150, 140); ctx.lineTo(130, 200); ctx.lineTo(0, 200); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(100, 160); ctx.lineTo(130, 140); ctx.lineTo(150, 140); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 180); ctx.lineTo(110, 180); ctx.lineTo(135, 160); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  drawRodTexture(ctx, currentRod, rodBaseX, rodBaseY, rodEndX, rodEndY, rodBend, reelRotation);
  drawPlayer(ctx, pX - 40, pY, gameState, charTilt, frameCount, rodAngle, reelRotation, 'front');
  ctx.restore();
  if (gameState === GameState.CHARGING) {
      const targetX = 220 + (chargePower / 100) * 500; const targetY = 250 + (chargePower / 100) * 300;
      ctx.save(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(targetX, targetY, 20, 8, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const visibleStates = [GameState.CHARGING, GameState.CASTING, GameState.WAITING, GameState.NIBBLING, GameState.REELING, GameState.CAUGHT];
  if (visibleStates.includes(gameState)) {
    const isLowHealth = lineHealth < 30 && gameState === GameState.REELING; const isHighTension = rodStress > 0.75 && gameState === GameState.REELING;
    let shakeX = 0, shakeY = 0;
    if (gameState === GameState.REELING || gameState === GameState.CAUGHT) {
      const vibIntensity = (rodStress * 2) + (isLowHealth ? 4 : 0.5); shakeX = (Math.random() - 0.5) * vibIntensity; shakeY = (Math.random() - 0.5) * vibIntensity;
    }
    let actualRodEndX = rodEndX; let actualRodEndY = rodEndY;
    if (location === 'OCEAN') {
      const dx = rodEndX - pivotX; const dy = rodEndY - pivotY; actualRodEndX = pivotX + dx * Math.cos(swayAngle) - dy * Math.sin(swayAngle); actualRodEndY = pivotY + dx * Math.sin(swayAngle) + dy * Math.cos(swayAngle) + swayY;
    }
    ctx.save(); ctx.beginPath(); ctx.moveTo(actualRodEndX, actualRodEndY);
    if (gameState === GameState.WAITING || gameState === GameState.NIBBLING) {
        const midX = (actualRodEndX + hookX) / 2; const midY = (actualRodEndY + hookY) / 2 + 18; ctx.quadraticCurveTo(midX, midY, hookX + shakeX, hookY + shakeY);
    } else {
        let cpX = (actualRodEndX + hookX) / 2 + shakeX; let cpY = Math.min(actualRodEndY, hookY) - (gameState === GameState.CASTING ? 180 : 30) + shakeY; 
        if (gameState === GameState.REELING) cpY += 80; ctx.quadraticCurveTo(cpX, cpY, hookX + shakeX, hookY + shakeY);
    }
    
    // Hardcore Line Visuals: Vibration and Color Shift
    const healthRatio = Math.max(0, lineHealth / 100);
    const lineRed = 255;
    const lineGreen = Math.floor(255 * healthRatio);
    const lineBlue = Math.floor(255 * healthRatio);
    
    ctx.strokeStyle = isLowHealth ? `rgb(${lineRed}, ${lineGreen}, ${lineBlue})` : (isHighTension ? `rgb(255, 255, ${lineBlue})` : 'rgba(255, 255, 255, 0.4)'); 
    ctx.lineWidth = isHighTension ? (1.8 + (1 - healthRatio) * 2.5) : 0.8;
    
    if (isHighTension) { 
        ctx.shadowBlur = 10 + (1 - healthRatio) * 20; 
        ctx.shadowColor = isLowHealth ? '#ef4444' : 'white'; 
        if (gameState === GameState.REELING) {
            const dashOffset = (frameCount * 0.8) % 20;
            ctx.setLineDash([10, 2]); 
            ctx.lineDashOffset = -dashOffset;
        }
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    if (hookY > 200 && (gameState === GameState.WAITING || gameState === GameState.REELING)) {
        ctx.save(); const rippleSize = 12 + Math.sin(Date.now() * 0.012) * 6; ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(hookX, hookY, rippleSize, rippleSize * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
        if (gameState === GameState.REELING) {
            ctx.fillStyle = 'white';
            for(let i=0; i<3; i++) { ctx.beginPath(); ctx.arc(hookX + (Math.random()-0.5)*20, hookY + (Math.random()-0.5)*10, 2, 0, Math.PI*2); ctx.fill(); }
        }
        ctx.restore();
    }
    if (currentTackle) {
      ctx.save(); const glowPulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5; let glowColor = 'transparent';
      if (currentTackle.rarityText === 'NÂNG CAO') glowColor = 'rgba(74, 222, 128, 0.4)';
      if (currentTackle.rarityText === 'CHUYÊN NGHIỆP') glowColor = 'rgba(56, 189, 248, 0.5)';
      if (currentTackle.rarityText === 'CAO CẤP') glowColor = 'rgba(168, 85, 247, 0.6)';
      if (currentTackle.rarityText === 'CỰC HẠNG') glowColor = 'rgba(251, 191, 36, 0.7)';
      if (glowColor !== 'transparent') { ctx.shadowBlur = 10 + glowPulse * 15; ctx.shadowColor = glowColor; ctx.fillStyle = glowColor; ctx.beginPath(); ctx.arc(hookX + shakeX, hookY + shakeY, 8 + glowPulse * 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(hookX + shakeX, hookY + shakeY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(hookX + shakeX, hookY + shakeY - 2, 3, 0, Math.PI * 2); ctx.fill();
  }
};
