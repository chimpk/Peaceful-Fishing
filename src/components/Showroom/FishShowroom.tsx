
import React, { useState, useEffect, useRef } from 'react';
import { FISH_TYPES } from '../../core/data/gameData';
import { FishType, Rarity } from '../../types';
import { drawFishByModel } from '../../core/entities';
import './FishShowroom.css';

interface FishShowroomProps {
  onClose: () => void;
}

const FishShowroom: React.FC<FishShowroomProps> = ({ onClose }) => {
  const [selectedFish, setSelectedFish] = useState<FishType | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    const render = () => {
      setFrameCount(prev => prev + 1);
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    if (selectedFish && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // AGGRESSIVE AUTO-SCALING for long/large fish
        const baseSize = selectedFish.size || 30;
        // Most fish are roughly 6-10x their 'size' property in actual pixel length (including tails)
        // We want the total length to fit within ~80% of canvas width (640 * 0.8 = 512)
        // So size * multiplier * zoom < 512. If multiplier is 10, size * zoom < 51.
        
        let zoom = 1.5; // Default zoom
        const targetBound = 25; // More conservative target size
        
        if (baseSize > targetBound) {
            zoom = (targetBound / baseSize) * 1.5;
        }
        
        // Extra shrink for specific long species (Dragon, Phoenix, Shark)
        const name = selectedFish.name.toLowerCase();
        if (name.includes('rồng') || name.includes('phượng') || name.includes('mập') || name.includes('kiếm')) {
            zoom *= 0.7; 
        }

        ctx.scale(zoom, zoom);
        
        // Use drawFishByModel - set isCaught (6th param) to true so junk/chests show real forms
        drawFishByModel(ctx, selectedFish, frameCount, false, 0.4, true, false);
        
        ctx.restore();
      }
    }
  }, [selectedFish, frameCount]);

  const rarityColors: Record<string, string> = {
    [Rarity.COMMON]: '#94a3b8',
    [Rarity.UNCOMMON]: '#22c55e',
    [Rarity.RARE]: '#3b82f6',
    [Rarity.EPIC]: '#a855f7',
    [Rarity.LEGENDARY]: '#f59e0b',
    [Rarity.MYTHIC]: '#ef4444',
  };

  return (
    <div className="showroom-overlay">
      <div className="showroom-container">
        <header className="showroom-header">
          <h1>PHÒNG TRƯNG BÀY CÁ SIÊU CẤP</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="showroom-content">
          <aside className="fish-list">
            {FISH_TYPES.map((fish, idx) => (
              <div 
                key={`${fish.name}-${idx}`} 
                className={`fish-item ${selectedFish?.name === fish.name ? 'active' : ''}`}
                onClick={() => setSelectedFish(fish)}
                style={{ borderLeftColor: rarityColors[fish.rarity] }}
              >
                <span className="fish-name">{fish.name}</span>
                <span className="fish-rarity" style={{ color: rarityColors[fish.rarity] }}>{fish.rarity}</span>
              </div>
            ))}
          </aside>

          <main className="fish-display">
            {selectedFish ? (
              <div className="display-card">
                <div className="canvas-wrapper">
                   <canvas ref={canvasRef} width={640} height={480} />
                </div>
                <div className="fish-details">
                  <h2>{selectedFish.name}</h2>
                  <div className="badge" style={{ backgroundColor: rarityColors[selectedFish.rarity] }}>
                    {selectedFish.rarity}
                  </div>
                  <p className="description">{selectedFish.description || "Một loài cá tuyệt đẹp vừa được nâng cấp hình ảnh."}</p>
                  <div className="stats-grid">
                    <div className="stat"><span>Giá trị:</span> {selectedFish.value} vàng</div>
                    <div className="stat"><span>Kích thước:</span> {selectedFish.size}cm</div>
                    <div className="stat"><span>Cân nặng:</span> {selectedFish.weight}kg</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-display">
                <p>Chọn một con cá để xem chiêm ngưỡng vẻ đẹp!</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FishShowroom;
