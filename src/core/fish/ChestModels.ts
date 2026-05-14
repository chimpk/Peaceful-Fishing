import { Rarity } from "../types";

export const ChestModels = {
  drawChest: (ctx: CanvasRenderingContext2D, rarity: Rarity, frame: number, x: number, y: number, size: number = 20) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Smooth floating animation
    const bounce = Math.sin(frame * 0.1) * (size * 0.2);
    ctx.translate(0, bounce);

    let primaryColor = '#78350f'; // Wood
    let secondaryColor = '#f59e0b'; // Gold trim
    let glowColor = 'rgba(251, 191, 36, 0.4)';

    if (rarity === Rarity.RARE || rarity === Rarity.EPIC) {
        primaryColor = '#475569'; // Steel/Silver
        secondaryColor = '#38bdf8'; // Cyan trim
        glowColor = 'rgba(56, 189, 248, 0.5)';
    } else if (rarity === Rarity.LEGENDARY || rarity === Rarity.MYTHIC) {
        primaryColor = '#fbbf24'; // Gold
        secondaryColor = '#ef4444'; // Red trim
        glowColor = 'rgba(239, 68, 68, 0.6)';
    }

    // Shadow & Outer Glow
    ctx.shadowBlur = size * 0.8;
    ctx.shadowColor = glowColor;

    // === THÂN RƯƠNG (Chest Body) ===
    const bodyGrad = ctx.createLinearGradient(-size, 0, size, 0);
    bodyGrad.addColorStop(0, primaryColor);
    bodyGrad.addColorStop(0.5, '#451a03'); // Darker center
    bodyGrad.addColorStop(1, primaryColor);
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-size, -size * 0.2);
    ctx.lineTo(size, -size * 0.2);
    ctx.lineTo(size, size * 0.8);
    ctx.lineTo(-size, size * 0.8);
    ctx.closePath();
    ctx.fill();

    // Wood Texture Lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for(let i=-2; i<=2; i++) {
        ctx.beginPath(); ctx.moveTo(-size, i * size * 0.2); ctx.lineTo(size, i * size * 0.2); ctx.stroke();
    }

    // === NẮP RƯƠNG VÒM (Curved Lid) ===
    ctx.save();
    ctx.translate(0, -size * 0.2);
    const lidGrad = ctx.createLinearGradient(-size, -size * 0.5, size, size * 0.5);
    lidGrad.addColorStop(0, primaryColor);
    lidGrad.addColorStop(1, '#1e1b4b');
    
    ctx.fillStyle = lidGrad;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.bezierCurveTo(-size, -size * 1.2, size, -size * 1.2, size, 0);
    ctx.fill();
    ctx.restore();

    // === ĐAI KIM LOẠI (Metal Bands) ===
    ctx.fillStyle = secondaryColor;
    ctx.shadowBlur = 0;
    // Left band
    ctx.beginPath();
    ctx.rect(-size * 0.8, -size * 0.8, size * 0.25, size * 1.6);
    ctx.fill();
    // Right band
    ctx.beginPath();
    ctx.rect(size * 0.55, -size * 0.8, size * 0.25, size * 1.6);
    ctx.fill();

    // === KHÓA RƯƠNG (The Lock) ===
    const lockPulse = (Math.sin(frame * 0.2) + 1) * 0.5;
    ctx.shadowBlur = 10 * lockPulse;
    ctx.shadowColor = secondaryColor;
    
    ctx.fillStyle = '#0f172a'; // Lock plate
    ctx.beginPath();
    ctx.roundRect(-size * 0.2, -size * 0.3, size * 0.4, size * 0.4, 2);
    ctx.fill();
    
    ctx.fillStyle = secondaryColor; // Keyhole
    ctx.beginPath();
    ctx.arc(0, -size * 0.15, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
