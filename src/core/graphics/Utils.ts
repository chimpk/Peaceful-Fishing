
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../data/gameData';

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, w: number, h: number, r: any) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// Color Constants for Interpolation
export const SKY_COLORS = {
  DAY_SUNNY: ['#0c4a6e', '#38bdf8'],
  DAY_RAINY: ['#1e293b', '#475569'],
  DAY_STORMY: ['#020617', '#1e293b'],
  SUNSET: ['#c2410c', '#f59e0b'],
  NIGHT: ['#020617', '#0f172a'],
  CAVE: ['#09090b', '#18181b']
};

export const WATER_COLORS = {
  POND_DAY: ['#0ea5e9', '#0369a1', '#0c4a6e'],
  POND_SUNSET: ['#9a3412', '#9a3412', '#064e3b'],
  POND_NIGHT: ['#064e3b', '#064e3b', '#022c22'],
  OCEAN_DAY: ['#0369a1', '#0369a1', '#082f49'],
  OCEAN_SUNSET: ['#b45309', '#b45309', '#0c4a6e'],
  OCEAN_NIGHT: ['#1e293b', '#0f172a', '#020617'], // Slightly lighter top to separate from sky
  CAVE: ['#1e1b4b', '#1e1b4b', '#020617']
};

// Color Cache to avoid repetitive parsing
const hexToRgbCache: Record<string, {r: number, g: number, b: number}> = {};

export const parseHex = (hex: string) => {
  if (hexToRgbCache[hex]) return hexToRgbCache[hex];
  // Support #RRGGBB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const result = { r, g, b };
  hexToRgbCache[hex] = result;
  return result;
};

const lerpCache = new Map<string, string>();

export const lerpColor = (c1: string, c2: string, f: number) => {
  if (f <= 0) return c1;
  if (f >= 1) return c2;
  
  // Cache key with 2-decimal precision for transition smoothness
  const cacheKey = `${c1}${c2}${f.toFixed(2)}`;
  if (lerpCache.has(cacheKey)) return lerpCache.get(cacheKey)!;

  const rgb1 = parseHex(c1);
  const rgb2 = parseHex(c2);
  
  const r = (rgb1.r + (rgb2.r - rgb1.r) * f) | 0;
  const g = (rgb1.g + (rgb2.g - rgb1.g) * f) | 0;
  const b = (rgb1.b + (rgb2.b - rgb1.b) * f) | 0;
  
  const result = `rgb(${r},${g},${b})`;
  lerpCache.set(cacheKey, result);
  
  // Simple cache management
  if (lerpCache.size > 2000) {
      const firstKey = lerpCache.keys().next().value;
      if (firstKey) lerpCache.delete(firstKey);
  }
  
  return result;
};

export const drawVignette = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const grad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.3,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.8
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
