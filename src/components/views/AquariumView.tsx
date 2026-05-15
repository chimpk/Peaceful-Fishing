
import React, { useRef, useEffect } from 'react';
import { AquariumItem, UIView } from '../../types';
import * as Graphics from '../../core/graphics';

interface AquariumViewProps {
  aquarium: AquariumItem[];
  setAquarium: React.Dispatch<React.SetStateAction<AquariumItem[]>>;
  setActiveView: (view: UIView) => void;
  gold: number;
  calculateHourlyRate: () => number;
  returnFromAquarium: (index: number) => void;
}

const AquariumView: React.FC<AquariumViewProps> = ({ aquarium, setAquarium, setActiveView, gold, calculateHourlyRate, returnFromAquarium }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCount = useRef(0);
  const fishStatesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const TOP = 120;   // keep below title bar
    const BOT = H - 60;
    const LEFT = 70;
    const RIGHT = W - 70;

    const randX = () => LEFT + Math.random() * (RIGHT - LEFT);
    const randY = () => TOP + Math.random() * (BOT - TOP);
    const randSpeed = () => 0.55 + Math.random() * 0.7;

    type FishState = {
      x: number; y: number;
      vx: number; vy: number;
      tx: number; ty: number;
      speed: number;            // current max speed
      inertia: number;          // how fast it responds to steering (lower = heavier)
      dir: number;
      angle: number;
      targetAngle: number;
      arriveTimer: number;
      wagPhase: number;
      noiseOffset: number;
    };

    // SYNC Logic: Only update states if count changed, preserving existing positions
    if (fishStatesRef.current.length !== aquarium.length) {
      if (fishStatesRef.current.length < aquarium.length) {
        // Add new fish states
        const startIdx = fishStatesRef.current.length;
        for (let i = startIdx; i < aquarium.length; i++) {
          const item = aquarium[i];
          const size = item.fish.size || 40;
          // Big fish (size 100+) move slower and turn slower (lower inertia)
          // Small fish (size 20) are agile and fast
          const sizeFactor = Math.max(0.35, Math.min(1.2, 45 / size));
          
          fishStatesRef.current.push({
            x: randX(), y: randY(),
            vx: 0, vy: 0,
            tx: randX(), ty: randY(),
            speed: randSpeed() * sizeFactor,
            inertia: 0.04 * sizeFactor, 
            dir: 1,
            angle: 0,
            targetAngle: 0,
            arriveTimer: 180 + Math.random() * 240,
            wagPhase: Math.random() * Math.PI * 2,
            noiseOffset: Math.random() * 1000,
          });
        }
      } else {
        // Remove states if fish were removed
        fishStatesRef.current = fishStatesRef.current.slice(0, aquarium.length);
      }
    }

    const fishStates = fishStatesRef.current;

    const pickNewTarget = (s: FishState, i: number) => {
      s.tx = randX();
      s.ty = randY();
      const item = aquarium[i];
      const size = item?.fish.size || 40;
      const sizeFactor = Math.max(0.35, Math.min(1.2, 45 / size));
      s.speed = randSpeed() * sizeFactor;
      s.arriveTimer = 200 + Math.random() * 400;
    };

    let animId: number;
    const render = () => {
      frameCount.current++;
      ctx.clearRect(0, 0, W, H);

      // Tank background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0c1628');
      grad.addColorStop(0.5, '#0f2040');
      grad.addColorStop(1, '#0a1520');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Caustic shimmer
      for (let c = 0; c < 8; c++) {
        const cx = (Math.sin(frameCount.current * 0.01 + c * 1.3) * 0.5 + 0.5) * W;
        const cy = H - 30 - Math.sin(frameCount.current * 0.007 + c) * 15;
        const r  = 60 + Math.sin(frameCount.current * 0.02 + c) * 20;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        cg.addColorStop(0, 'rgba(56,189,248,0.06)');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Bubbles
      ctx.save();
      for (let b = 0; b < 12; b++) {
        const bx = ((b * 97 + Math.sin(b + frameCount.current * 0.015) * 30 + W) % W);
        const by = H - ((frameCount.current * 1.2 + b * 55) % (H + 10));
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 + (b % 3) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.12 + (b % 3) * 0.06})`;
        ctx.fill();
      }
      ctx.restore();

      // Fish AI & draw
      aquarium.forEach((item, i) => {
        const s = fishStates[i];
        if (!s) return;

        s.wagPhase += 0.06 + s.speed * 0.04;
        s.arriveTimer--;
        s.noiseOffset += 0.01;

        // Direction toward waypoint
        const dx = s.tx - s.x;
        const dy = s.ty - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Arrived or timed-out → new waypoint
        if (dist < 40 || s.arriveTimer <= 0) pickNewTarget(s, i);

        // Calculate desired velocity
        let desiredVx = 0, desiredVy = 0;
        if (dist > 1) {
          // Slow down when approaching waypoint (Arrival behavior)
          const approachSpeed = dist < 100 ? s.speed * (dist / 100) : s.speed;
          desiredVx = (dx / dist) * approachSpeed;
          desiredVy = (dy / dist) * approachSpeed;
          
          // Add organic "flutter" noise
          const noiseX = Math.sin(s.noiseOffset * 0.7) * 0.15;
          const noiseY = Math.cos(s.noiseOffset * 0.8) * 0.15;
          desiredVx += noiseX;
          desiredVy += noiseY;

          // Smoothly update velocity using fish's individual inertia
          s.vx += (desiredVx - s.vx) * s.inertia;
          s.vy += (desiredVy - s.vy) * s.inertia;
        }

        // Apply movement
        s.x += s.vx;
        s.y += s.vy;

        // Vertical bobbing (idle breathing)
        const bob = Math.sin(frameCount.current * 0.05 + i) * 0.15;
        s.y += bob;

        // Soft wall repulsion
        const margin = 80;
        if (s.x < LEFT + margin) {
          s.vx += 0.08;
          if (s.tx < s.x) pickNewTarget(s, i); // Force new target if currently trying to swim into left wall
        }
        if (s.x > RIGHT - margin) {
          s.vx -= 0.08;
          if (s.tx > s.x) pickNewTarget(s, i); // Force new target if currently trying to swim into right wall
        }
        if (s.y < TOP + margin)  s.vy += 0.08;
        if (s.y > BOT - margin)  s.vy -= 0.08;

        // Visual direction flipping: Look where you WANT to go (intention)
        // This prevents the "swimming backwards" (tail-first) glitch when changing targets
        if (Math.abs(desiredVx) > 0.01) {
          s.dir = desiredVx > 0 ? 1 : -1;
        }

        // Calculate tilt angle based on vertical movement
        // Limit tilt to ±35 degrees (0.6 rad) to avoid "nose-diving" look
        s.targetAngle = Math.max(-0.6, Math.min(0.6, s.vy * 0.6));
        s.angle += (s.targetAngle - s.angle) * 0.1;

        const swimSpeed = 0.3 + Math.abs(Math.sin(s.wagPhase)) * 0.7;

        Graphics.drawFishTexture(
          ctx, item.fish, frameCount.current, false,
          { 
            x: s.x, 
            y: s.y, 
            angle: s.angle, 
            direction: s.dir 
          },
          swimSpeed, 'glider', false, item.isGolden
        );
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [aquarium]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900/90 backdrop-blur-md p-6 pointer-events-auto">
      <div className="w-full max-w-5xl bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative">
        <canvas ref={canvasRef} width={1000} height={500} className="w-full h-auto block" />
        
        <div className="absolute top-6 left-6">
            <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">MY AQUARIUM</h2>
            <div className="flex flex-col gap-1 mt-1">
                <p className="text-blue-400 text-sm font-black italic tracking-widest">THU NHẬP: {calculateHourlyRate().toLocaleString()} VÀNG / GIỜ</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase">GIỚI HẠN TÍCH LŨY: 6 GIỜ OFFLINE</p>
            </div>
        </div>

        <button 
          onClick={() => setActiveView(UIView.GAME)}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors border border-white/10"
        >
          <span className="text-white text-xl">✕</span>
        </button>
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto w-full max-w-5xl pb-4">
          {aquarium.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-48 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 group hover:border-blue-500/50 transition-all">
                  <div className="text-xs font-black text-blue-400 mb-1">{item.fish.rarity}</div>
                  <div className="text-sm font-bold text-white mb-3">{item.isGolden ? '✨ ' : ''}{item.fish.name}</div>
                  <button 
                    onClick={() => returnFromAquarium(i)}
                    className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg transition-colors"
                  >
                    TRẢ VỀ TÚI
                  </button>
              </div>
          ))}
          {aquarium.length === 0 && (
              <div className="w-full text-center py-8 text-slate-500 font-bold italic">
                  HỒ CÁ ĐANG TRỐNG... HÃY THẢ CÁ TỪ TÚI ĐỒ VÀO ĐÂY!
              </div>
          )}
      </div>
    </div>
  );
};

export default AquariumView;
