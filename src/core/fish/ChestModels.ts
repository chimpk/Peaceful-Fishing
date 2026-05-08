import { Rarity } from "../types";

export const ChestModels = {
  drawChest: (ctx: CanvasRenderingContext2D, rarity: Rarity, frame: number, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Bounce animation
    const bounce = Math.sin(frame * 0.15) * 5;
    ctx.translate(0, bounce);

    let primaryColor = '#78350f'; // Wood
    let secondaryColor = '#f59e0b'; // Gold trim
    let glowColor = 'rgba(251, 191, 36, 0.3)';

    if (rarity === Rarity.RARE || rarity === Rarity.EPIC) {
        primaryColor = '#94a3b8'; // Silver
        secondaryColor = '#38bdf8'; // Cyan trim
        glowColor = 'rgba(56, 189, 248, 0.4)';
    } else if (rarity === Rarity.LEGENDARY || rarity === Rarity.MYTHIC) {
        primaryColor = '#fbbf24'; // Gold
        secondaryColor = '#ef4444'; // Red trim
        glowColor = 'rgba(239, 68, 68, 0.5)';
    }

    // Shadow/Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;

    // Main Box
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-20, -15, 40, 30);
    
    // Lid line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(20, -5);
    ctx.stroke();

    // Trims
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-20, -15, 5, 30); // Left
    ctx.fillRect(15, -15, 5, 30);  // Right
    ctx.fillRect(-20, -15, 40, 5); // Top

    // Lock
    ctx.fillStyle = '#000';
    ctx.fillRect(-4, -8, 8, 8);
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(0, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
