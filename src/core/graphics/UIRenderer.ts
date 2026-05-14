
import { FishType, LocationType, TimeOfDay } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/gameData';

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
  const panelW = 340; const panelH = 120; const px = (CANVAS_WIDTH - panelW) / 2; const py = 180;
  const barW = 280; const barH = 25; const bx = (CANVAS_WIDTH - barW) / 2; const by = py + 55;
  ctx.save(); ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'; ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 32); ctx.fill();
  ctx.strokeStyle = isInZone ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 32); ctx.stroke();
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  if (fish) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'; ctx.beginPath(); ctx.roundRect(px + 12, py + 8, panelW - 24, 24, 8); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'; ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.fillText('???', px + 22, py + 25);
    ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'right'; ctx.fillText(`???  •  ??? kg`, px + panelW - 16, py + 25);
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }
  ctx.save();
  const dangerGrad = ctx.createLinearGradient(bx, 0, bx + barW, 0); dangerGrad.addColorStop(0, '#7f1d1d'); dangerGrad.addColorStop(0.5, '#ef4444'); dangerGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = dangerGrad; ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 8); ctx.fill();
  ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 8); ctx.clip();
  const hz = zoneSize / 2; const safeX = bx + (tensionZone * barW) - (hz * barW); const safeW = zoneSize * barW;
  const zoneGrad = ctx.createLinearGradient(safeX, 0, safeX + safeW, 0); zoneGrad.addColorStop(0, '#166534'); zoneGrad.addColorStop(0.5, '#4ade80'); zoneGrad.addColorStop(1, '#166534');
  if (isInZone) {
    ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = '#4ade80'; const pulse = Math.sin(Date.now() * 0.01) * 3; ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; ctx.beginPath(); ctx.roundRect(safeX - 3 - pulse, by - 3 - pulse, safeW + 6 + pulse*2, barH + 6 + pulse*2, 10); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle = zoneGrad; ctx.beginPath(); ctx.roundRect(safeX, by, safeW, barH, 6); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, barH);
  const clampedTension = Math.max(0, Math.min(1, tensionCursor)); const cx = bx + clampedTension * barW;
  ctx.save(); ctx.shadowBlur = 5; ctx.shadowColor = 'black'; ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.moveTo(cx, by + barH + 3); ctx.lineTo(cx - 8, by + barH + 12); ctx.lineTo(cx + 8, by + barH + 12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, by - 3); ctx.lineTo(cx, by + barH + 3); ctx.stroke(); ctx.restore();
  const miniBarW = 200; const miniBarH = 10; const healX = (CANVAS_WIDTH - miniBarW) / 2; const healY = py + panelH - 24;
  ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.roundRect(healX, healY, miniBarW, miniBarH, 5); ctx.fill();
  const clampedHealth = Math.min(100, Math.max(0, health)); let hColor = '#3b82f6';
  if (clampedHealth < 30) { hColor = Math.sin(Date.now() * 0.025) < 0 ? '#ef4444' : '#7f1d1d'; }
  else if (clampedHealth < 60) { hColor = '#eab308'; }
  if (clampedHealth > 0) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(healX, healY, miniBarW, miniBarH, 5); ctx.clip();
    ctx.fillStyle = hColor; ctx.fillRect(healX, healY, (clampedHealth / 100) * miniBarW, miniBarH); ctx.restore();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(healX, healY, miniBarW, miniBarH, 5); ctx.stroke();
  ctx.fillStyle = health < 30 ? '#fca5a5' : 'rgba(255,255,255,0.75)'; ctx.font = `bold 9px Arial`; ctx.textAlign = 'center'; ctx.fillText(`ĐỘ BỀN DÂY: ${Math.ceil(health)}%`, CANVAS_WIDTH / 2, healY - 5);
  ctx.save(); ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; const alpha = 0.6 + Math.sin(Date.now() * 0.01) * 0.4; ctx.globalAlpha = alpha; ctx.fillText('GIỮ SPACE ĐỂ KÉO - GIỮ TRONG VÙNG XANH!', CANVAS_WIDTH / 2, by - 10); ctx.restore();
  ctx.restore();
};

export const drawPowerBar = (ctx: CanvasRenderingContext2D, x: number, y: number, power: number) => {
  const pbW = 200; const pbH = 22;
  ctx.save(); ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; ctx.shadowBlur = 15; ctx.roundRect(x - 20, y - 10, pbW + 40, pbH + 25, 12); ctx.fill();
  ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.roundRect(x, y, pbW, pbH, 4); ctx.fill();
  const clampedPower = Math.min(100, Math.max(0, power)); const gradient = ctx.createLinearGradient(x, 0, x + pbW, 0); gradient.addColorStop(0, '#22c55e'); gradient.addColorStop(0.5, '#eab308'); gradient.addColorStop(1, '#ef4444');
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, pbW, pbH, 4); ctx.clip(); ctx.fillStyle = gradient; ctx.fillRect(x, y, (clampedPower/100) * pbW, pbH); ctx.restore();
  if (power >= 95) {
    ctx.save(); ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.02) * 8; ctx.shadowColor = '#fbbf24'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.strokeRect(x, y, pbW, pbH); ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText('⚡ HOÀN HẢO!', x + pbW / 2, y + pbH / 2 + 4); ctx.restore();
  } else {
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, pbW, pbH); ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('QUĂNG CẦN: ' + Math.floor(power) + '%', x + pbW/2, y - 12);
  }
  ctx.restore();
};

export const drawGodRays = (ctx: CanvasRenderingContext2D, frame: number, location: LocationType = 'OCEAN', time: TimeOfDay = 'DAY') => {
  ctx.save(); const cx = CANVAS_WIDTH * 0.45; const numRays = location === 'CAVE' ? 6 : 8;
  let rayColor = '150, 230, 255';
  if (location === 'POND') rayColor = '200, 255, 150';
  if (location === 'CAVE') rayColor = '200, 150, 255';
  if (time === 'SUNSET') rayColor = '255, 200, 100';
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI + (frame * 0.0006); const opacity = (location === 'CAVE' ? 0.04 : 0.02) + Math.sin(frame * 0.012 + i * 1.5) * 0.015; const spread = 0.07 + Math.sin(frame * 0.008 + i) * 0.02; const length = 450 + Math.sin(frame * 0.015 + i) * 80;
    const x1 = cx + Math.cos(angle - spread) * 5; const y1 = 200; const x2 = cx + Math.cos(angle + spread) * 5; const y2 = 200; const x3 = cx + Math.cos(angle + spread) * length; const y3 = 200 + Math.sin(angle + spread) * length; const x4 = cx + Math.cos(angle - spread) * length; const y4 = 200 + Math.sin(angle - spread) * length;
    const grad = ctx.createLinearGradient(cx, 200, cx + Math.cos(angle) * length, 200 + Math.sin(angle) * length);
    grad.addColorStop(0, `rgba(${rayColor}, ${opacity * 2.5})`); grad.addColorStop(0.5, `rgba(${rayColor}, ${opacity})`); grad.addColorStop(1, `rgba(${rayColor}, 0)`);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
};

export const drawComboStreak = (ctx: CanvasRenderingContext2D, combo: number, frame: number) => {
  if (combo < 2) return;
  ctx.save(); const tx = CANVAS_WIDTH / 2; const ty = 120; const pulse = Math.sin(frame * 0.15); const scale = 1 + Math.abs(pulse) * 0.1;
  ctx.translate(tx, ty); ctx.scale(scale, scale);
  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50); grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 15; ctx.shadowColor = '#fbbf24'; ctx.fillStyle = 'white'; ctx.font = 'bold 18px "Arial"'; ctx.textAlign = 'center'; ctx.fillText(`COMBO x${combo}`, 0, 0);
  ctx.font = 'bold 10px "Arial"'; ctx.fillStyle = '#fde047'; ctx.fillText('STREAK ACTIVE', 0, 15);
  ctx.restore();
};

let bossHitFlash = 0;
export const triggerBossHitFlash = () => { bossHitFlash = 8; };
export const drawBossHealthBarFlash = (ctx: CanvasRenderingContext2D, bossHp: number, bossMaxHp: number, barX: number, barW: number, barH: number, barY: number, isEnraged: boolean, frame: number) => {
  if (bossHitFlash > 0) bossHitFlash--;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 8, 10); ctx.fill();
  ctx.fillStyle = '#450a0a'; ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
  const hpRatio = Math.min(1, Math.max(0, bossHp / bossMaxHp));
  ctx.save(); ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.clip();
  if (bossHitFlash > 0) {
    ctx.save(); ctx.shadowBlur = 30; ctx.shadowColor = 'white'; ctx.fillStyle = 'white'; ctx.fillRect(barX, barY, hpRatio * barW, barH); ctx.restore();
  } else {
    const hpColor = isEnraged ? '#ef4444' : '#991b1b'; ctx.fillStyle = hpColor;
    if (isEnraged) { ctx.save(); ctx.shadowBlur = 8 + Math.sin(frame * 0.15) * 6; ctx.shadowColor = '#ef4444'; ctx.fillRect(barX, barY, hpRatio * barW, barH); ctx.restore(); }
    else { ctx.fillRect(barX, barY, hpRatio * barW, barH); }
  }
  ctx.restore();
};
