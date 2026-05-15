
import React, { useState } from 'react';
import { InventoryItem } from '../../../types';
import { soundManager } from '../../../core/systems/soundManager';

interface InventoryTabProps {
  inventory: InventoryItem[];
  inventoryCapacity: number;
  onSellFish: (timestamp: number) => void;
  onUpgradeCapacity: () => void;
  onUseAsBait: (timestamp: number) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, inventoryCapacity, onSellFish, onUpgradeCapacity, onUseAsBait }) => {
  const [tab, setTab] = useState<'items' | 'upgrade'>('items');

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
       <div className="flex gap-4 mb-6">
          <button onClick={() => { soundManager.playClick(); setTab('items'); }} className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all shadow-2xl border ${tab === 'items' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>VẬT PHẨM</button>
          <button onClick={() => { soundManager.playClick(); setTab('upgrade'); }} className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all shadow-2xl border ${tab === 'upgrade' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900 text-slate-500 border-white/5 opacity-50'}`}>NÂNG CẤP</button>
       </div>

       {tab === 'items' ? (
         <div className="grid grid-cols-2 gap-5">
            {inventory.length === 0 ? (
              <div className="col-span-2 py-32 text-center flex flex-col items-center gap-6 opacity-20">
                 <div className="text-7xl">🎒</div>
                 <p className="text-sm font-black italic tracking-widest uppercase">TÚI ĐỒ ĐANG TRỐNG</p>
              </div>
            ) : (
              inventory.map((item, i) => (
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
                     <button onClick={() => { soundManager.playClick(); onSellFish(item.timestamp); }} className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all">BÁN LẺ</button>
                     <button onClick={() => { soundManager.playClick(); onUseAsBait(item.timestamp); }} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-500/30 transition-all">LÀM MỒI</button>
                   </div>
                </div>
              ))
            )}
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
              onClick={() => { soundManager.playClick(); onUpgradeCapacity(); }}
              className="w-full py-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-3xl font-black tracking-widest text-sm hover:scale-105 transition-all shadow-[0_20px_50px_rgba(234,179,8,0.3)] active:scale-95"
            >
              NÂNG CẤP ({(inventoryCapacity * 100).toLocaleString()} 💰)
            </button>
         </div>
       )}
    </div>
  );
};

export default InventoryTab;
