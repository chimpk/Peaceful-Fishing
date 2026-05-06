
import React from 'react';
import { FishType } from '../../../core/types';
import { FISH_TYPES } from '../../../core/gameData';

interface CollectionTabProps {
  unlockedFish: string[];
}

const CollectionTab: React.FC<CollectionTabProps> = ({ unlockedFish }) => {
  return (
    <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
       <div className="flex justify-between items-center mb-8 bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-xl">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-60">KHÁM PHÁ ĐẠI DƯƠNG</span>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">TIẾN ĐỘ</span>
             <span className="text-2xl font-black italic text-white tracking-tighter">{unlockedFish.length} / {FISH_TYPES.length}</span>
          </div>
       </div>
       <div className="grid grid-cols-2 gap-5">
          {FISH_TYPES.map((fish, i) => {
             const isUnlocked = unlockedFish.includes(fish.name);
             return (
                <div key={i} className={`relative p-6 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-center text-center shadow-2xl group ${isUnlocked ? 'bg-slate-900/60 border-white/10 hover:border-blue-500/30' : 'bg-slate-950/40 border-white/5 opacity-40 grayscale'}`}>
                   <div className="w-24 h-24 rounded-3xl mb-4 flex items-center justify-center text-5xl shadow-inner transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: isUnlocked ? `${fish.color}22` : '#0f172a' }}>
                      <span className="animate-float" style={{ filter: isUnlocked ? `drop-shadow(0 0 15px ${fish.color})` : 'brightness(0) invert(0.2)' }}>🐟</span>
                   </div>
                   <h4 className={`font-black text-lg italic tracking-tight mb-2 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>{isUnlocked ? fish.name : '???'}</h4>
                   {isUnlocked ? (
                     <div className="text-[9px] px-3 py-1 rounded-full font-black tracking-widest border border-white/10 uppercase" style={{ color: fish.color }}>{fish.rarity}</div>
                   ) : (
                     <div className="text-[9px] font-black tracking-widest uppercase text-slate-700">CHƯA KHÁM PHÁ</div>
                   )}
                </div>
             )
          })}
       </div>
    </div>
  );
};

export default CollectionTab;
