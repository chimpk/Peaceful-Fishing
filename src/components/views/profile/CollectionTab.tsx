
import React, { useEffect, useRef } from 'react';
import { FishType, Rarity } from '../../../core/types';
import { FISH_TYPES } from '../../../core/gameData';
import { drawFishByModel } from '../../../core/fish';

interface FishCanvasProps {
  fish: FishType;
  isUnlocked: boolean;
}

const FishCanvas: React.FC<FishCanvasProps> = ({ fish, isUnlocked }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save state
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // If locked, draw a silhouette
      if (!isUnlocked) {
        ctx.filter = 'brightness(0) opacity(0.2)';
      }

      // Draw the fish
      drawFishByModel(
        ctx, 
        fish, 
        frameRef.current, 
        false, // isStruggling
        1.0,   // currentSpeed
        true,  // isCaught
        false  // isGolden
      );

      ctx.restore();
      
      frameRef.current += 1;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [fish, isUnlocked]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={80} 
      className="w-full h-full object-contain pointer-events-none"
    />
  );
};

interface CollectionTabProps {
  unlockedFish: string[];
}

const CollectionTab: React.FC<CollectionTabProps> = ({ unlockedFish }) => {
  return (
    <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
       <div className="flex justify-between items-center mb-8 bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-60">KHÁM PHÁ ĐẠI DƯƠNG</span>
            <span className="text-xs font-bold text-slate-400 mt-1">Khám phá các loài cá để xem thông tin chi tiết</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">TIẾN ĐỘ</span>
             <span className="text-2xl font-black italic text-white tracking-tighter">{unlockedFish.length} / {FISH_TYPES.length}</span>
          </div>
       </div>
       <div className="grid grid-cols-2 gap-5 pb-20">
          {FISH_TYPES.map((fish, i) => {
             const isUnlocked = unlockedFish.includes(fish.name);
             const rarityColor = {
               [Rarity.JUNK]: '#94a3b8',
               [Rarity.COMMON]: '#22c55e',
               [Rarity.UNCOMMON]: '#3b82f6',
               [Rarity.RARE]: '#a855f7',
               [Rarity.EPIC]: '#ec4899',
               [Rarity.LEGENDARY]: '#f59e0b',
               [Rarity.MYTHIC]: '#ef4444',
             }[fish.rarity];

             return (
                <div key={i} className={`relative p-5 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center shadow-2xl group ${isUnlocked ? 'bg-slate-900/60 border-white/10 hover:border-blue-500/30' : 'bg-slate-950/40 border-white/5 opacity-40 grayscale'}`}>
                   {/* Fish Preview Box */}
                   <div className="w-full h-28 rounded-3xl mb-4 flex items-center justify-center relative overflow-hidden bg-slate-950/40 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {/* Ambient Glow */}
                      {isUnlocked && (
                        <div className="absolute inset-0 bg-radial-gradient blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: `radial-gradient(circle, ${fish.color}, transparent)` }}></div>
                      )}
                      <FishCanvas fish={fish} isUnlocked={isUnlocked} />
                   </div>

                   {/* Fish Info */}
                   <div className="flex flex-col items-center">
                     <h4 className={`font-black text-lg italic tracking-tight mb-1 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                       {isUnlocked ? fish.name : '???'}
                     </h4>
                     
                     {isUnlocked ? (
                       <>
                         <div className="flex flex-col items-center gap-2">
                           <div className="text-[9px] px-3 py-1 rounded-full font-black tracking-widest border border-white/10 uppercase" style={{ color: rarityColor, borderColor: `${rarityColor}44` }}>
                             {fish.rarity}
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-yellow-500 text-xs">💰</span>
                             <span className="text-sm font-black text-white/80 tracking-tighter italic">~{fish.value.toLocaleString()} vàng</span>
                           </div>
                         </div>
                         
                         {/* Additional Stats if unlocked */}
                         <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-around opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Kích thước</span>
                              <span className="text-[10px] font-black text-blue-300">{fish.size}cm</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Sức mạnh</span>
                              <span className="text-[10px] font-black text-red-400">{fish.tension}</span>
                            </div>
                         </div>
                       </>
                     ) : (
                       <div className="text-[9px] font-black tracking-widest uppercase text-slate-700 mt-2">CHƯA KHÁM PHÁ</div>
                     )}
                   </div>

                   {/* Rarity Tag Decoration */}
                   {isUnlocked && (
                     <div className="absolute top-4 right-4 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ color: rarityColor, backgroundColor: rarityColor }}></div>
                   )}
                </div>
             )
          })}
       </div>
    </div>
  );
};

export default CollectionTab;
