import { GameState } from '../../types';

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  gameState: GameState,
  tilt: number,
  frameCount: number,
  rodAngle: number = 0,
  reelRotation: number = 0,
  layer: 'back' | 'front' | 'all' = 'all'
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  const breath = Math.sin(frameCount * 0.05) * 1;
  const blink  = frameCount % 200 < 5;

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const fill = (color: string) => { ctx.fillStyle = color; ctx.fill(); };
  const outline = (color = '#1a1a2e', lw = 2) => {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
  };
  const shape = (f: string, s = '#1a1a2e', lw = 2) => { fill(f); outline(s, lw); };

  const by = breath;

  if (layer === 'all' || layer === 'back') {
      // ── 1. Shadow ─────────────────────────────────────────────────────────────────
      ctx.beginPath();
      ctx.ellipse(0, 46, 20, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fill();

      // ── 2. LEGS ────────────────────────────────────────────────────────────────────
      ctx.beginPath(); ctx.roundRect(-13, 16, 11, 20, 3);
      shape('#1e293b');
      ctx.beginPath(); ctx.roundRect(2, 16, 11, 20, 3);
      shape('#1e293b');

      // Boots
      ctx.beginPath(); ctx.roundRect(-15, 32, 14, 12, 4);
      shape('#c2410c');
      ctx.beginPath(); ctx.roundRect(1, 32, 14, 12, 4);
      shape('#c2410c');

      // ── 3. BODY ────────────────────────────────────────────────────────────────────
      // Vest (wide chibi body)
      ctx.beginPath(); ctx.roundRect(-19, -14 + by, 38, 32, 10);
      shape('#4a7c20');

      // Collar / shirt peek
      ctx.beginPath(); ctx.roundRect(-8, -14 + by, 16, 10, 4);
      shape('#e2e8f0', '#94a3b8', 1.5);

      // Pockets
      ctx.beginPath(); ctx.roundRect(-15, 2 + by, 10, 9, 3);
      shape('#365314', '#1e3a0d', 1.5);
      ctx.beginPath(); ctx.roundRect(5, 2 + by, 10, 9, 3);
      shape('#365314', '#1e3a0d', 1.5);

      // ── 4. LEFT ARM (Holding handle base) ────────────────────────────────────────
      ctx.save();
      ctx.translate(-5, by);
      // IK-like hand positioning
      const leftHandX = 22 + Math.cos(rodAngle) * 12;
      const leftHandY = 0 + Math.sin(rodAngle) * 12;
      
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(leftHandX, leftHandY);
      ctx.strokeStyle = '#4a7c20'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(leftHandX, leftHandY, 6, 0, Math.PI * 2);
      shape('#f9a875', '#c8774e', 1.5);
      ctx.restore();
      
      // ── 5. NECK ──────────────────────────────────────────────────────────────────
      ctx.beginPath(); ctx.roundRect(-5, -22 + by, 10, 10, 3);
      fill('#f9a875');

      // ── 6. HEAD ──────────────────────────────────────────────────────────────────
      const hy = -38 + by;

      ctx.beginPath(); ctx.arc(0, hy, 20, 0, Math.PI * 2);
      shape('#f9a875', '#c8774e', 2);

      // Cheeks
      ctx.beginPath(); ctx.ellipse(-12, hy + 7, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,100,100,0.3)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, hy + 7, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,100,100,0.3)'; ctx.fill();

      // Eyes
      if (!blink) {
        ctx.beginPath(); ctx.ellipse(-7, hy - 2, 5, 5.5, 0, 0, Math.PI * 2);
        shape('#fff', '#1a1a2e', 1.5);
        ctx.beginPath(); ctx.ellipse(7, hy - 2, 5, 5.5, 0, 0, Math.PI * 2);
        shape('#fff', '#1a1a2e', 1.5);
        // Pupils
        ctx.beginPath(); ctx.arc(-6, hy - 1, 3, 0, Math.PI * 2); fill('#1a1a2e');
        ctx.beginPath(); ctx.arc(8,  hy - 1, 3, 0, Math.PI * 2); fill('#1a1a2e');
        // Catchlights
        ctx.beginPath(); ctx.arc(-5, hy - 3, 1.2, 0, Math.PI * 2); fill('#fff');
        ctx.beginPath(); ctx.arc(9,  hy - 3, 1.2, 0, Math.PI * 2); fill('#fff');
      } else {
        ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(-7, hy - 1, 5, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc( 7, hy - 1, 5, Math.PI, 0); ctx.stroke();
      }

      // Nose
      ctx.beginPath(); ctx.arc(0, hy + 5, 2, 0, Math.PI * 2);
      fill('rgba(180,90,60,0.5)');

      // Mouth based on state
      ctx.beginPath();
      if (gameState === GameState.REELING) {
        // Determined/Struggling mouth
        ctx.arc(0, hy + 8, 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#c0504d'; ctx.lineWidth = 2; ctx.stroke();
      } else {
        // Normal smile
        ctx.arc(0, hy + 5, 8, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = '#c0504d'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
      }

      // ── 7. HAT ───────────────────────────────────────────────────────────────────
      const hat_y = hy - 17;

      // Brim
      ctx.beginPath(); ctx.ellipse(0, hat_y + 10, 28, 7, 0, 0, Math.PI * 2);
      shape('#4d7c0f', '#2d4a07', 2);

      // Crown
      ctx.beginPath(); ctx.ellipse(0, hat_y, 19, 13, 0, 0, Math.PI * 2);
      shape('#4d7c0f', '#2d4a07', 2);

      // Hat band
      ctx.beginPath(); ctx.ellipse(0, hat_y + 7, 19, 5, 0, 0, Math.PI * 2);
      shape('#1a2e05', '#0d1a02', 1);

      // Badge
      ctx.beginPath(); ctx.arc(-10, hat_y + 7, 3, 0, Math.PI * 2);
      shape('#fbbf24', '#92400e', 1);
  }

  if (layer === 'all' || layer === 'front') {
      // ── 8. RIGHT ARM (Reeling action) ────────────────────────────────────────────
      ctx.save();
      ctx.translate(5, by);
      
      let rightHandX, rightHandY;
      
      // Calculate exact knob coordinates in world space
      const worldRodBaseX = x + 28; // x is pX - 40, so pX - 12 = x + 28
      const worldRodBaseY = y + breath; // y is pY
      
      // The reel base is translated by (12, 5) from rodBase in rod space
      const worldReelBaseX = worldRodBaseX + 12 * Math.cos(rodAngle) - 5 * Math.sin(rodAngle);
      const worldReelBaseY = worldRodBaseY + 12 * Math.sin(rodAngle) + 5 * Math.cos(rodAngle);
      
      if (gameState === GameState.REELING || (gameState === GameState.WAITING && reelRotation > 0)) {
          // Knob is 10 units away from reel base rotated by reelRotation
          const worldKnobX = worldReelBaseX + 10 * Math.cos(rodAngle + reelRotation);
          const worldKnobY = worldReelBaseY + 10 * Math.sin(rodAngle + reelRotation);
          
          // Inverse transform worldKnob to local arm coordinates
          const dx = worldKnobX - x;
          const dy = worldKnobY - y;
          const rx = dx * Math.cos(-tilt) - dy * Math.sin(-tilt);
          const ry = dx * Math.sin(-tilt) + dy * Math.cos(-tilt);
          
          rightHandX = rx - 5;
          rightHandY = ry - breath;
      } else {
          // Resting position, just use the rod body
          const worldRestX = worldRodBaseX + 25 * Math.cos(rodAngle);
          const worldRestY = worldRodBaseY + 25 * Math.sin(rodAngle);
          
          const dx = worldRestX - x;
          const dy = worldRestY - y;
          const rx = dx * Math.cos(-tilt) - dy * Math.sin(-tilt);
          const ry = dx * Math.sin(-tilt) + dy * Math.cos(-tilt);
          
          rightHandX = rx - 5;
          rightHandY = ry - breath;
      }

      // Vẽ cánh tay
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rightHandX, rightHandY);
      ctx.strokeStyle = '#4a7c20'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
      
      // Vẽ bàn tay
      ctx.beginPath(); ctx.arc(rightHandX, rightHandY, 6, 0, Math.PI * 2);
      shape('#f9a875', '#c8774e', 1.5);
      ctx.restore();
  }

  ctx.restore();
};