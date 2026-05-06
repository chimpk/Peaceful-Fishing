
import React, { useState } from 'react';
import Header from '../ui/Header';
import BottomNav from '../ui/BottomNav';
import { UIView, RodType, BaitType, Quest } from '../../core/types';
import { RODS, BAITS } from '../../core/gameData';

interface ShopViewProps {
  gold: number;
  ownedRods: string[];
  currentRod: RodType;
  baitCounts: Record<string, number>;
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  onBuy: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  onSelect: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  setProfileTab?: (tab: any) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ 
  gold, ownedRods, currentRod, baitCounts, quests,
  setActiveView, onBuy, onSelect, setProfileTab 
}) => {
  const [shopTab, setShopTab] = useState<'rod' | 'bait'>('rod');

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="CỬA HÀNG ĐỒ CÂU" gold={gold} setActiveView={setActiveView} />
      <div className="px-8 flex gap-4 my-6">
         <button onClick={() => setShopTab('rod')} className={`flex-1 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all shadow-2xl border ${shopTab === 'rod' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>CẦN CÂU</button>
         <button onClick={() => setShopTab('bait')} className={`flex-1 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all shadow-2xl border ${shopTab === 'bait' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>MỒI CÂU</button>
      </div>

      <div className="flex-1 px-8 overflow-y-auto pb-10">
         <div className="grid grid-cols-1 gap-5">
            {shopTab === 'rod' && RODS.map(rod => {
              const isOwned = ownedRods.includes(rod.id);
              const isEquipped = currentRod.id === rod.id;
              return (
              <div key={rod.id} className={`relative bg-slate-900/60 p-6 rounded-[2.5rem] border transition-all duration-300 flex gap-6 items-center group overflow-hidden ${isEquipped ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                 <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shrink-0 shadow-inner animate-float">🎣</div>
                 <div className="flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black italic text-xl tracking-tight text-white/90">{rod.name}</h4>
                       <span className="text-[9px] bg-blue-900/60 text-blue-400 px-3 py-1 rounded-full font-black tracking-widest border border-blue-500/20">{rod.rarityText}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-4 font-medium leading-relaxed">{rod.description}</p>
                    <div className="flex gap-3 mb-5">
                       <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl text-[9px] text-blue-300 font-black border border-white/5">LỰC CĂNG: x{rod.lineStrength}</div>
                       <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl text-[9px] text-yellow-300 font-black border border-white/5">BONUS: +{Math.round((rod.control-1)*100)}%</div>
                    </div>
                    
                    {isOwned ? (
                      <button onClick={() => onSelect(rod, 'rod')} disabled={isEquipped} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isEquipped ? 'bg-blue-600/10 text-blue-400 border border-blue-400/30' : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'}`}>
                         {isEquipped ? 'ĐANG SỬ DỤNG' : 'TRANG BỊ'}
                      </button>
                    ) : (
                      <button onClick={() => onBuy(rod, 'rod')} disabled={rod.isLocked} className="w-full py-4 bg-yellow-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95 disabled:opacity-20">
                         {rod.isLocked ? 'CẦN KHÓA' : `MUA (${rod.price.toLocaleString()} 💰)`}
                      </button>
                    )}
                 </div>
              </div>
            )})}

            {shopTab === 'bait' && BAITS.map(bait => (
              <div key={bait.id} className="relative bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex gap-6 items-center group overflow-hidden transition-all hover:border-white/10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                 <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shrink-0 shadow-inner animate-float">🪱</div>
                 <div className="flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black italic text-xl tracking-tight text-white/90">{bait.name}</h4>
                       <span className="text-[9px] bg-green-900/60 text-green-400 px-3 py-1 rounded-full font-black tracking-widest border border-green-500/20 uppercase">{bait.rarityText}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-6 font-medium leading-relaxed">{bait.description}</p>
                    <button onClick={() => onBuy(bait, 'bait')} className="w-full py-4 bg-yellow-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95">
                      MUA x{bait.count} ({bait.price.toLocaleString()} 💰)
                    </button>
                 </div>
                 <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black border border-white/10 shadow-2xl">
                    CÓ: {baitCounts[bait.id] || 0}
                 </div>
              </div>
            ))}
         </div>
      </div>
      <BottomNav activeView={UIView.SHOP} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
    </div>
  );
};

export default ShopView;
