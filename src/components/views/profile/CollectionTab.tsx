
import React, { useEffect, useRef } from 'react';
import { FishType, Rarity } from '../../../types';
import { FISH_TYPES } from '../../../core/data/gameData';
import { drawFishByModel } from '../../../core/entities/index';

interface FishCanvasProps {
  fish: FishType;
  isUnlocked: boolean;
}

const FishCanvas: React.FC<FishCanvasProps> = React.memo(({ fish, isUnlocked }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const frameRef = useRef<number>(0);
  const isAnimated = isUnlocked && isHovered;

  // Initial draw and update on hover
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Static draw function
    const draw = (frame: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      if (!isUnlocked) {
        ctx.filter = 'brightness(0) opacity(0.2)';
      }

      drawFishByModel(
        ctx, 
        fish, 
        frame, 
        false,
        0.5, // Slow movement
        true,
        false
      );
      ctx.restore();
    };

    // If not animated, just draw once
    if (!isAnimated) {
      draw(0);
      return;
    }

    // Animation loop ONLY when hovered
    let animationId: number;
    let lastTime = 0;
    const interval = 1000 / 30; // 30fps

    const render = (time: number) => {
      if (time - lastTime >= interval) {
        lastTime = time;
        draw(frameRef.current);
        frameRef.current += 1;
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [fish, isUnlocked, isAnimated]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full h-full flex items-center justify-center cursor-help"
    >
      <canvas 
        ref={canvasRef} 
        width={120} 
        height={80} 
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
});

interface CollectionTabProps {
  unlockedFish: string[];
  fishCounts: Record<string, number>;
}

const CollectionTab: React.FC<CollectionTabProps> = ({ unlockedFish, fishCounts }) => {
  // Use useMemo to prevent re-calculating the list on every render
  const fishList = React.useMemo(() => FISH_TYPES, []);

  return (
    <div className="p-8 animate-in fade-in duration-300">
       <div className="flex justify-between items-center mb-8 glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20"></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] opacity-60">BỘ SƯU TẬP ĐẠI DƯƠNG</span>
            <span className="text-xs font-bold text-slate-400 mt-2 italic leading-tight">Khám phá các loài cá thần thoại để hoàn tất thư viện</span>
          </div>
          <div className="flex items-center gap-5 relative z-10">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest leading-none mb-1.5">TIẾN ĐỘ</span>
                <span className="text-3xl font-black italic text-white tracking-tighter leading-none">{unlockedFish.length}<span className="text-sm not-italic opacity-30 mx-1">/</span>{fishList.length}</span>
             </div>
             <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">📚</div>
          </div>
       </div>
       <div className="grid grid-cols-2 gap-6 pb-24">
          {fishList.map((fish, i) => {
             const isUnlocked = unlockedFish.includes(fish.name);
             const rarityRGB = {
               [Rarity.JUNK]: '148, 163, 184',
               [Rarity.COMMON]: '34, 197, 94',
               [Rarity.UNCOMMON]: '59, 130, 246',
               [Rarity.RARE]: '168, 85, 247',
               [Rarity.EPIC]: '236, 72, 153',
               [Rarity.LEGENDARY]: '245, 158, 11',
               [Rarity.MYTHIC]: '239, 68, 68',
             }[fish.rarity];

             return (
                <div key={i} className={`relative p-6 rounded-[2.5rem] border transition-transform duration-300 flex flex-col items-center text-center shadow-2xl group ${isUnlocked ? 'glass-card' : 'bg-slate-950/40 border-white/5 opacity-40 grayscale'}`}>
                   {/* Fish Preview Box */}
                   <div className="w-full h-32 rounded-[2rem] mb-5 flex items-center justify-center relative overflow-hidden bg-slate-950/60 shadow-inner">
                      {isUnlocked && (
                        <div className={`absolute inset-0 fish-glow blur-3xl opacity-5 group-hover:opacity-20 transition-opacity [--glow-color:${fish.color}]`}></div>
                      )}
                      <FishCanvas fish={fish} isUnlocked={isUnlocked} />
                      
                      {/* Catch Count Badge */}
                      {isUnlocked && (
                         <div className="absolute top-4 left-4 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px] font-black tracking-tighter shadow-xl">
                            x{fishCounts[fish.name] || 0}
                         </div>
                       )}
                   </div>

                   {/* Fish Info */}
                   <div className="flex flex-col items-center w-full">
                     <h4 className={`font-black text-xl italic tracking-tighter mb-2 transition-colors duration-500 ${isUnlocked ? 'text-white group-hover:text-blue-400' : 'text-slate-700'}`}>
                       {isUnlocked ? fish.name : 'CHƯA PHÁT HIỆN'}
                     </h4>
                     
                     {isUnlocked ? (
                       <div className="w-full flex flex-col items-center gap-3">
                         <div className={`text-[9px] px-4 py-1.5 rounded-full font-black tracking-widest border uppercase rarity-badge transition-all duration-500 [--rarity-color:rgb(${rarityRGB})] [--rarity-rgb:${rarityRGB}] group-hover:shadow-[0_0_15px_rgba(var(--rarity-rgb),0.3)]`}>
                           {fish.rarity}
                         </div>
                         <div className="flex items-center gap-2 mt-1 px-4 py-2 bg-slate-950/40 rounded-xl border border-white/5">
                           <span className="text-yellow-500 text-xs">💰</span>
                           <span className="text-sm font-black text-white tracking-tighter italic">~{fish.value.toLocaleString()} <span className="text-[10px] not-italic opacity-40 ml-0.5">Vàng</span></span>
                         </div>
                         
                         {/* Detailed stats reveal on hover */}
                         <div className="mt-4 pt-4 border-t border-white/5 w-full grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            <div className="flex flex-col items-center bg-slate-950/40 p-2 rounded-xl border border-white/5">
                              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mb-1">Kích cỡ</span>
                              <span className="text-[10px] font-black text-blue-300 italic">{fish.size}cm</span>
                            </div>
                            <div className="flex flex-col items-center bg-slate-950/40 p-2 rounded-xl border border-white/5">
                              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mb-1">Lực chiến</span>
                              <span className="text-[10px] font-black text-red-400 italic">{fish.tension}</span>
                            </div>
                         </div>
                       </div>
                     ) : (
                       <div className="text-[8px] font-black tracking-[0.3em] uppercase text-slate-800 mt-2 px-6 py-3 border border-dashed border-slate-800/30 rounded-2xl w-full">
                          ???
                       </div>
                     )}
                   </div>

                   {/* Rarity Tag Decoration */}
                   {isUnlocked && (
                     <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full rarity-dot shadow-[0_0_10px_rgba(var(--rarity-rgb),0.8)] [--rarity-color:rgb(${rarityRGB})]`}></div>
                   )}
                </div>
             )
          })}
       </div>
    </div>
  );
};

export default CollectionTab;
