
import { Particle } from '../../types';

export const updateParticles = (particles: Particle[]) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    if (p.vx !== undefined && p.vy !== undefined) {
      p.x += p.vx;
      p.y += p.vy;
      // Gravity for some particles
      if (p.type === 'circle' || p.type === 'star') {
        p.vy += 0.2;
      }
    }
    
    p.opacity = Math.max(0, p.life / 60);
  }
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    
    if (p.type === 'ripple') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (1 - p.life / 60) * 50, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'star') {
      const spikes = 5;
      const outerRadius = p.size;
      const innerRadius = p.size / 2;
      let rot = Math.PI / 2 * 3;
      let x = p.x;
      let y = p.y;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = p.x + Math.cos(rot) * outerRadius;
        y = p.y + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = p.x + Math.cos(rot) * innerRadius;
        y = p.y + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(p.x, p.y - outerRadius);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};
