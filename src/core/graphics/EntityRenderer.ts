
import { Rarity, FishType } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/gameData';
import { drawFishByModel } from '../entities/index';

export const drawRareDetectionFlash = (ctx: CanvasRenderingContext2D, rarity: Rarity) => {
  const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
  const opacity = 0.05 + pulse * 0.15;
  let baseColor = '255, 255, 255';
  if (rarity === Rarity.EPIC) baseColor = '168, 85, 247';
  if (rarity === Rarity.LEGENDARY) baseColor = '251, 191, 36';
  if (rarity === Rarity.MYTHIC) baseColor = '239, 68, 68';
  ctx.save();
  const gradient = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.8);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(${baseColor}, ${opacity})`);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.restore();
};

export const drawAlert = (ctx: CanvasRenderingContext2D, x: number, y: number, rarity: Rarity) => {
  let color = '#ffffff';
  if (rarity === Rarity.EPIC) color = '#a855f7';
  if (rarity === Rarity.LEGENDARY) color = '#fbbf24';
  if (rarity === Rarity.MYTHIC) color = '#ef4444';
  const pulse = Math.sin(Date.now() * 0.01) * 5;
  ctx.save(); ctx.translate(x, y - 50 + pulse); ctx.shadowBlur = 15; ctx.shadowColor = color; ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 0); ctx.restore();
};

export const drawBehaviorIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, type: 'jump' | 'dive' | 'thrash') => {
  const icons = { jump: { char: '⚠️', text: 'NHẢY!', color: '#fbbf24' }, dive: { char: '⚓', text: 'LẶN!', color: '#60a5fa' }, thrash: { char: '💢', text: 'VÙNG VẪY!', color: '#ef4444' } };
  const icon = icons[type]; const pulse = Math.sin(Date.now() * 0.01) * 3;
  ctx.save(); ctx.translate(x, y - 60 + pulse); ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.beginPath(); ctx.roundRect(-40, -12, 80, 24, 12); ctx.fill();
  ctx.strokeStyle = icon.color; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'white'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${icon.char} ${icon.text}`, 0, 0); ctx.restore();
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
  const { size, rarity } = fishType;
  
  // High-fidelity isolation: Save full state and transform matrix
  ctx.save();
  const matrix = ctx.getTransform(); 

  if (customPos) {
    ctx.translate(customPos.x, customPos.y); 
    ctx.rotate(customPos.angle);
    if (customPos.direction === -1) ctx.scale(-1, 1);
    if (isStruggling || isCaught) ctx.translate(-size * 1.0, 0);
  }

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
        // Cap shadowBlur at 80 to prevent massive performance drops on large entities
        ctx.shadowBlur = Math.min(size * (rarity === Rarity.MYTHIC ? 1.2 : 0.8), 80); 
        ctx.shadowColor = rarity === Rarity.MYTHIC ? '#ff0000' : '#fbbf24';
    } else if (rarity === Rarity.EPIC) {
        ctx.shadowBlur = Math.min(size * 0.5, 40); 
        ctx.shadowColor = '#a855f7';
    }
  }

  if (isStruggling) ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);

  // Execution: Draw the model
  drawFishByModel(ctx, fishType, frameCount, isStruggling, currentSpeed, isCaught, isGolden);

  // Recovery: Hard-reset transform and restore stack
  ctx.setTransform(matrix);
  ctx.restore();
};
