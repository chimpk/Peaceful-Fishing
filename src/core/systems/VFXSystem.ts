
import { Particle } from '../../types';

export const updateParticles = (particles: Particle[]) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life!--;
    if ((p.life ?? 0) <= 0) {
      particles.splice(i, 1);
      continue;
    }

    if (p.vx !== undefined && p.vy !== undefined) {
      p.x += p.vx;
      p.y += p.vy;
      // Gravity only for physics particles
      if (p.type === 'circle' || p.type === 'star') {
        p.vy += 0.18;
        // Drag to prevent particles flying off screen forever
        p.vx *= 0.98;
      }
    }

    // Pre-compute opacity ratio once
    p.opacity = Math.max(0, (p.life ?? 0) / 60);
  }
};

/**
 * Draws all particles, batched by type to minimize ctx state changes.
 * Stars are drawn as scaled arcs (cheaper than polygon math per frame).
 */
export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  if (particles.length === 0) return;

  ctx.save();

  // --- Pass 1: ripples (stroke only) ---
  let hasRipple = false;
  for (const p of particles) {
    if (p.type !== 'ripple') continue;
    if (!hasRipple) {
      ctx.lineWidth = 2;
      hasRipple = true;
    }
    ctx.globalAlpha = p.opacity;
    ctx.strokeStyle = p.color ?? 'white';
    ctx.beginPath();
    ctx.arc(p.x, p.y, (1 - (p.life ?? 0) / 60) * 50, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- Pass 2: circles (fill, grouped) ---
  let lastColor = '';
  for (const p of particles) {
    if (p.type !== 'circle' && p.type !== 'trail') continue;
    ctx.globalAlpha = p.opacity;
    const col = p.color ?? 'white';
    if (col !== lastColor) {
      ctx.fillStyle = col;
      lastColor = col;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Pass 3: stars (simplified as oval using scale — much cheaper) ---
  lastColor = '';
  for (const p of particles) {
    if (p.type !== 'star') continue;
    ctx.globalAlpha = p.opacity;
    const col = p.color ?? '#fbbf24';
    if (col !== lastColor) {
      ctx.fillStyle = col;
      lastColor = col;
    }
    // Draw a 4-point diamond/star using two arcs scaled — no polygon loop needed
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};
