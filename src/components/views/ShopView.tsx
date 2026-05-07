
import React, { useState } from 'react';
import Header from '../ui/Header';
import BottomNav from '../ui/BottomNav';
import { UIView, RodType, TackleType, BaitType, Quest, InventoryItem, FishType } from '../../core/types';
import { RODS, TACKLES, NATURAL_BAITS, SEA_BAITS } from '../../core/gameData';

interface ShopViewProps {
  gold: number;
  ownedRods: string[];
  ownedTackles: string[];
  currentRod: RodType;
  currentTackle: TackleType;
  baitCounts: Record<string, number>;
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  onBuy: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  onSelect: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  setProfileTab?: (tab: 'stats' | 'inventory' | 'collection' | 'skills') => void;
  inventory?: InventoryItem[];
  onUseAsBait?: (timestamp: number) => void;
  liveBait?: FishType | null;
  initialTab?: 'rod' | 'tackle' | 'bait';
}

const ShopView: React.FC<ShopViewProps> = ({ 
  gold, ownedRods, ownedTackles, currentRod, currentTackle, baitCounts, quests,
  setActiveView, onBuy, onSelect, setProfileTab, inventory = [], onUseAsBait, liveBait, initialTab = 'rod'
}) => {
  const [shopTab, setShopTab] = useState<'rod' | 'tackle' | 'bait'>(initialTab);

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="CỬA HÀNG ĐỒ CÂU" gold={gold} setActiveView={setActiveView} />
      <div className="px-8 flex gap-3 my-6">
         <button onClick={() => setShopTab('rod')} className={`flex-1 py-4 rounded-2xl font-black text-[9px] tracking-[0.2em] transition-all shadow-2xl border ${shopTab === 'rod' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>CẦN CÂU</button>
         <button onClick={() => setShopTab('tackle')} className={`flex-1 py-4 rounded-2xl font-black text-[9px] tracking-[0.2em] transition-all shadow-2xl border ${shopTab === 'tackle' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>THẺO CÂU</button>
         <button onClick={() => setShopTab('bait')} className={`flex-1 py-4 rounded-2xl font-black text-[9px] tracking-[0.2em] transition-all shadow-2xl border ${shopTab === 'bait' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>MỒI CÂU</button>
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

            {shopTab === 'tackle' && TACKLES.map(tackle => {
              const isOwned = ownedTackles.includes(tackle.id);
              const isEquipped = currentTackle.id === tackle.id;
              return (
              <div key={tackle.id} className={`relative bg-slate-900/60 p-6 rounded-[2.5rem] border transition-all duration-300 flex gap-6 items-center group overflow-hidden ${isEquipped ? 'border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-600/10 transition-all"></div>
                 <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shrink-0 shadow-inner animate-float">🔗</div>
                 <div className="flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black italic text-xl tracking-tight text-white/90">{tackle.name}</h4>
                       <span className="text-[9px] bg-orange-900/60 text-orange-400 px-3 py-1 rounded-full font-black tracking-widest border border-orange-500/20">{tackle.rarityText}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-4 font-medium leading-relaxed">{tackle.description}</p>
                    {isOwned ? (
                      <button onClick={() => onSelect(tackle, 'tackle')} disabled={isEquipped} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isEquipped ? 'bg-orange-600/10 text-orange-400 border border-orange-400/30' : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'}`}>
                         {isEquipped ? 'ĐANG SỬ DỤNG' : 'TRANG BỊ'}
                      </button>
                    ) : (
                      <button onClick={() => onBuy(tackle, 'tackle')} className="w-full py-4 bg-yellow-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95">
                         MUA ({tackle.price.toLocaleString()} 💰)
                      </button>
                    )}
                 </div>
              </div>
            )})}

            {shopTab === 'bait' && (
              <>
                <div className="text-[10px] text-blue-400 font-black tracking-widest uppercase opacity-60 mb-2 px-2">MỒI CÂU TỰ NHIÊN</div>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {NATURAL_BAITS.map(bait => (
                    <div key={bait.id} className="relative bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex gap-6 items-center group overflow-hidden transition-all hover:border-white/10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                      <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 shadow-inner animate-float">🪱</div>
                      <div className="flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black italic text-lg tracking-tight text-white/90">{bait.name}</h4>
                          </div>
                          <p className="text-[9px] text-slate-500 mb-4 font-medium leading-relaxed">{bait.description}</p>
                          <button onClick={() => onBuy(bait, 'bait')} className="w-full py-3 bg-yellow-500 text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95">
                            MUA x10 ({bait.price.toLocaleString()} 💰)
                          </button>
                      </div>
                      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/10 shadow-2xl">
                          CÓ: {baitCounts[bait.id] || 0}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-blue-400 font-black tracking-widest uppercase opacity-60 mb-2 px-2">MỒI CÂU BIỂN</div>
                <div className="grid grid-cols-1 gap-4">
                  {SEA_BAITS.map(bait => (
                    <div key={bait.id} className="relative bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex gap-6 items-center group overflow-hidden transition-all hover:border-white/10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                      <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 shadow-inner animate-float">🦐</div>
                      <div className="flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black italic text-lg tracking-tight text-white/90">{bait.name}</h4>
                          </div>
                          <p className="text-[9px] text-slate-500 mb-4 font-medium leading-relaxed">{bait.description}</p>
                          <button onClick={() => onBuy(bait, 'bait')} className="w-full py-3 bg-yellow-500 text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-lg active:scale-95">
                            MUA x10 ({bait.price.toLocaleString()} 💰)
                          </button>
                      </div>
                      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/10 shadow-2xl">
                          CÓ: {baitCounts[bait.id] || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

             {shopTab === 'bait' && (
               <div className="mt-8 mb-4 border-t border-white/10 pt-8">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="font-black italic text-xl tracking-tight text-white">🦐 MỒI SỐNG TỪ TÚI ĐỒ</h3>
                   {liveBait && (
                     <div className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/40 px-4 py-1.5 rounded-full animate-pulse">
                       <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Đang dùng:</span>
                       <span className="text-white text-[10px] font-black">{liveBait.name}</span>
                     </div>
                   )}
                 </div>
                 <p className="text-[10px] text-slate-400 mb-6 font-medium leading-relaxed">
                   Dùng cá làm mồi sống. Thu hút cá hiếm và lớn hơn mạnh hơn mồi thường.
                   Cá <span className="text-green-400 font-black">HIẾM+</span> làm mồi hiệu quả hơn.
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4">
                   {inventory.length === 0 ? (
                     <div className="col-span-2 text-center py-10 border border-white/5 border-dashed rounded-3xl bg-white/3 opacity-50 text-xs flex flex-col gap-2 items-center">
                       <span className="text-3xl">🎣</span>
                       <span className="text-slate-400">Túi đồ trống. Hãy câu thêm cá!</span>
                     </div>
                   ) : (
                     inventory.slice(0, 12).map(item => {
                       const isEquipped = liveBait?.name === item.fish.name;
                       const rarityColorMap: Record<string, string> = {
                         'RÁC': 'border-slate-600/30 bg-slate-800/40',
                         'PHỔ THÔNG': 'border-white/8 bg-slate-900/60',
                         'KHÔNG PHỔ BIẾN': 'border-green-500/30 bg-green-900/20',
                         'HIẾM': 'border-blue-500/40 bg-blue-900/20',
                         'SỬ THI': 'border-purple-500/40 bg-purple-900/20',
                         'HUYỀN THOẠI': 'border-yellow-500/40 bg-yellow-900/20',
                         'THẦN THOẠI': 'border-pink-500/40 bg-pink-900/20',
                       };
                       const rarityTextMap: Record<string, string> = {
                         'RÁC': 'text-slate-500', 'PHỔ THÔNG': 'text-slate-400',
                         'KHÔNG PHỔ BIẾN': 'text-green-400', 'HIẾM': 'text-blue-400',
                         'SỬ THI': 'text-purple-400', 'HUYỀN THOẠI': 'text-yellow-400', 'THẦN THOẠI': 'text-pink-400',
                       };
                       const borderClass = rarityColorMap[item.fish.rarity] || 'border-white/5 bg-slate-900/60';
                       const textClass = rarityTextMap[item.fish.rarity] || 'text-slate-400';
                       return (
                         <div key={item.timestamp} className={`p-4 rounded-[2rem] border text-center flex flex-col gap-2 transition-all ${borderClass} ${isEquipped ? 'ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''}`}>
                           <div className="text-2xl">{item.isGolden ? '⭐' : '🐟'}</div>
                           <div className="font-black text-xs text-white leading-tight">{item.fish.name}</div>
                           <div className={`text-[9px] font-black uppercase ${textClass}`}>{item.fish.rarity}</div>
                           <div className="text-[9px] text-yellow-400 font-bold">{item.fish.value.toLocaleString()} 💰</div>
                           <button 
                             onClick={() => onUseAsBait?.(item.timestamp)}
                             disabled={isEquipped}
                             className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${isEquipped ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                           >
                             {isEquipped ? '✓ ĐANG DÙNG' : 'LÀM MỒI 🦐'}
                           </button>
                         </div>
                       )
                     })
                   )}
                 </div>
               </div>
             )}

          </div>
      </div>
      <BottomNav activeView={UIView.SHOP} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
    </div>
  );
};

export default ShopView;
