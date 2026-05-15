
import React, { useState } from 'react';
import Header from '../layout/Header';
import BottomNav from '../layout/BottomNav';
import { UIView, InventoryItem, RodType, BaitType, Quest, Rarity } from '../../types';
import { soundManager } from '../../core/systems/soundManager';

interface InventoryViewProps {
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  sellFish: (timestamp: number) => void;
  upgradeCapacity: () => void;
  sellAllFish: () => void;
  useFishAsBait: (timestamp: number) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
  gold, inventory, inventoryCapacity, quests,
  setActiveView, sellFish, upgradeCapacity, sellAllFish, useFishAsBait 
}) => {
  const [tab, setTab] = useState<'items' | 'upgrade'>('items');
  const [confirmSellTarget, setConfirmSellTarget] = useState<InventoryItem | null>(null);
  const [confirmSellAll, setConfirmSellAll] = useState(false);
  const [sortOption, setSortOption] = useState<'time' | 'value' | 'rarity'>('time');

  const sortedInventory = [...inventory].sort((a, b) => {
    if (sortOption === 'value') {
      const valA = a.isGolden ? a.fish.value * 2 : a.fish.value;
      const valB = b.isGolden ? b.fish.value * 2 : b.fish.value;
      return valB - valA;
    } else if (sortOption === 'rarity') {
      const rarityOrder = {
        [Rarity.MYTHIC]: 6,
        [Rarity.LEGENDARY]: 5,
        [Rarity.EPIC]: 4,
        [Rarity.RARE]: 3,
        [Rarity.UNCOMMON]: 2,
        [Rarity.COMMON]: 1,
        [Rarity.JUNK]: 0
      };
      return (rarityOrder[b.fish.rarity] || 0) - (rarityOrder[a.fish.rarity] || 0);
    }
    return b.timestamp - a.timestamp;
  });

  const handleSellClick = (item: InventoryItem) => {
    if (item.fish.rarity === Rarity.LEGENDARY || item.fish.rarity === Rarity.MYTHIC || item.fish.rarity === Rarity.EPIC) {
      setConfirmSellTarget(item);
    } else {
      sellFish(item.timestamp);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="TÚI ĐỒ CỦA BẠN" gold={gold} setActiveView={setActiveView} />
      
      <div className="px-8 flex gap-4 my-6">
          <button onClick={() => { soundManager.playClick(); setTab('items'); }} className={`flex-1 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all shadow-2xl border ${tab === 'items' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>VẬT PHẨM ({inventory.length}/{inventoryCapacity})</button>
          <button onClick={() => { soundManager.playClick(); setTab('upgrade'); }} className={`flex-1 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all shadow-2xl border ${tab === 'upgrade' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>NÂNG CẤP</button>
      </div>

      <div className="flex-1 px-8 overflow-y-auto pb-10">
        {tab === 'items' ? (
          <div className="space-y-6">
            {inventory.length > 0 && (
              <div className="flex gap-2 mb-4">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-[10px] font-black tracking-widest uppercase outline-none text-slate-300"
                >
                  <option value="time">Mới nhất</option>
                  <option value="value">Giá trị cao</option>
                  <option value="rarity">Độ hiếm</option>
                </select>
                <button 
                  onClick={() => {
                    soundManager.playClick();
                    const hasRare = inventory.some(i => [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(i.fish.rarity));
                    if (hasRare) {
                      setConfirmSellAll(true);
                    } else {
                      sellAllFish();
                    }
                  }}
                  className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
                >
                  BÁN TẤT CẢ ({inventory.length} cá)
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-5">
               {inventory.length === 0 ? (
                 <div className="col-span-2 py-20 text-center flex flex-col items-center gap-6">
                    <div className="text-7xl opacity-20">🎒</div>
                    <p className="text-sm font-black italic tracking-widest uppercase opacity-30">TÚI ĐỒ ĐANG TRỐNG</p>
                    <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">Hãy đi câu cá để lấp đầy túi đồ và bán kiếm vàng!</p>
                    <button 
                      onClick={() => { soundManager.playClick(); setActiveView(UIView.GAME); }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                    >
                      ĐI CÂU CÁ NGAY →
                    </button>
                 </div>
               ) : (
                 sortedInventory.map((item, i) => (
                   <div key={i} className="relative bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all shadow-xl overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl" style={{ background: item.fish.color }}></div>
                      <div className="w-20 h-20 bg-slate-950/60 rounded-3xl mb-4 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform animate-float">🐟</div>
                      <h4 className="font-black text-sm italic tracking-tight mb-2 text-white/90 line-clamp-1">{item.fish.name}</h4>
                      <div className="text-slate-300 text-[10px] mb-2">Số lượng: {item.count}</div>
                      {item.goldenCount > 0 && (
                        <div className="text-amber-300 text-[10px] mb-2">Vàng: {item.goldenCount}</div>
                      )}
                      <div className="text-yellow-500 font-black text-xs mb-4">{item.fish.value.toLocaleString()} 💰</div>
                      <div className="flex gap-2 w-full mt-auto">
                        <button onClick={() => { soundManager.playClick(); handleSellClick(item); }} className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all">BÁN LẺ</button>
                        <button onClick={() => { soundManager.playClick(); useFishAsBait(item.timestamp); }} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-500/30 transition-all">LÀM MỒI</button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 p-10 rounded-[3.5rem] border border-white/5 text-center shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
             <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-float">📦</div>
             <h3 className="text-2xl font-black italic text-white mb-4">NÂNG CẤP TÚI</h3>
             <p className="text-xs text-slate-500 mb-10 leading-relaxed">Mở rộng khoang chứa để mang theo nhiều chiến lợi phẩm hơn trong mỗi chuyến đi.</p>
             
             <div className="flex items-center justify-center gap-10 mb-12">
                <div className="flex flex-col items-center">
                   <div className="text-[10px] text-slate-500 font-black tracking-widest mb-2 uppercase">HIỆN TẠI</div>
                   <div className="text-4xl font-black text-white">{inventoryCapacity}</div>
                </div>
                <div className="text-4xl text-indigo-500 animate-pulse">➔</div>
                <div className="flex flex-col items-center">
                   <div className="text-[10px] text-indigo-400 font-black tracking-widest mb-2 uppercase">SAU NÂNG CẤP</div>
                   <div className="text-4xl font-black text-indigo-400">{inventoryCapacity + 5}</div>
                </div>
             </div>

             <button 
               onClick={() => { soundManager.playClick(); upgradeCapacity(); }}
               className="w-full py-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-3xl font-black tracking-widest text-sm hover:scale-105 transition-all shadow-[0_20px_50px_rgba(234,179,8,0.3)] active:scale-95"
             >
               NÂNG CẤP ({(inventoryCapacity * 100).toLocaleString()} 💰)
             </button>
          </div>
        )}
      </div>

      <BottomNav activeView={UIView.INVENTORY} setActiveView={setActiveView} quests={quests} />
      
      {/* Confirm Sell Overlay */}
      {confirmSellTarget && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-8 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-red-500/30 rounded-[3rem] p-8 max-w-sm w-full text-center shadow-[0_30px_60px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-6 animate-pulse">⚠️</div>
            <h3 className="text-2xl font-black italic text-red-400 mb-2">CẢNH BÁO</h3>
            <p className="text-sm text-slate-300 mb-8 leading-relaxed">
              Bạn đang bán một con cá hiếm (<span className="text-yellow-400 font-black">{confirmSellTarget.fish.name}</span>). Bạn có chắc chắn muốn bán nó không?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { soundManager.playClick(); setConfirmSellTarget(null); }}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest transition-all"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={() => {
                  soundManager.playClick();
                  sellFish(confirmSellTarget.timestamp);
                  setConfirmSellTarget(null);
                }}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                BÁN LUÔN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Sell All Overlay */}
      {confirmSellAll && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-8 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-red-500/30 rounded-[3rem] p-8 max-w-sm w-full text-center shadow-[0_30px_60px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-6 animate-pulse">⚠️</div>
            <h3 className="text-2xl font-black italic text-red-400 mb-2">CẢNH BÁO</h3>
            <p className="text-sm text-slate-300 mb-8 leading-relaxed">
              Túi đồ chứa cá <span className="text-yellow-400 font-black">HIẾM</span> (Sử Thi / Huyền Thoại / Thần Thoại). Bạn có chắc chắn muốn bán <span className="text-red-400 font-black">TẤT CẢ</span> không?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { soundManager.playClick(); setConfirmSellAll(false); }}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest transition-all"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={() => {
                  soundManager.playClick();
                  sellAllFish();
                  setConfirmSellAll(false);
                }}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                BÁN HẾT LUÔN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
