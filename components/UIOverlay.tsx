
import React, { useState, useMemo } from 'react';
import { GameState, InventoryItem, FishType, RodType, BaitType, UIView, ProfileStats, Achievement, Rarity, Quest } from '../types';
import { RODS, BAITS } from '../gameData';

interface UIOverlayProps {
  gameState: GameState;
  activeView: UIView;
  setActiveView: (view: UIView) => void;
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  notification: string | null;
  currentRod: RodType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  stats: ProfileStats;
  achievements: Achievement[];
  quests: Quest[];
  onStart: () => void;
  onSellAll: () => void;
  onBuy: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  onSelect: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  onUpgradeCapacity: () => void;
  onResetData: () => void;
  onClaimQuest: (id: string) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, activeView, setActiveView, gold, inventory, inventoryCapacity, notification,
  currentRod, currentBait, baitCounts, ownedRods, stats, achievements, quests,
  onStart, onSellAll, onBuy, onSelect, onUpgradeCapacity, onResetData, onClaimQuest
}) => {
  const [shopTab, setShopTab] = useState<'rod' | 'bait'>('rod');
  const [inventoryTab, setInventoryTab] = useState<'items' | 'upgrade'>('items');
  const [showTutorial, setShowTutorial] = useState(false);

  const levelData = useMemo(() => {
    const level = Math.floor(Math.sqrt(stats.totalFishCaught)) + 1;
    const currentLevelExp = Math.pow(level - 1, 2);
    const nextLevelExp = Math.pow(level, 2);
    const totalForNext = nextLevelExp - currentLevelExp;
    const currentInLevel = stats.totalFishCaught - currentLevelExp;
    const progress = totalForNext > 0 ? (currentInLevel / totalForNext) * 100 : 100;
    
    let title = "Tân Thủ";
    if (level > 5) title = "Cần Thủ Tập Sự";
    if (level > 10) title = "Thợ Câu Lành Nghề";
    if (level > 20) title = "Bậc Thầy Đại Dương";
    if (level > 50) title = "Huyền Thoại Câu Cá";

    return { level, progress, title, nextCap: Math.max(0, nextLevelExp - stats.totalFishCaught) };
  }, [stats.totalFishCaught]);

  const renderHeader = (title: string, showBack = true) => (
    <div className="flex items-center justify-between p-6 bg-[#0f172a] shadow-lg z-50">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={() => setActiveView(UIView.GAME)}
            className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-slate-700 transition-all pointer-events-auto border border-white/5 active:scale-90"
          >
            ←
          </button>
        )}
        <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">{title}</h1>
      </div>
      <div className="bg-[#1e293b] px-4 py-2 rounded-full flex items-center gap-3 border border-slate-700 pointer-events-auto shadow-inner hover:scale-105 transition-transform">
        <span className="text-yellow-400 font-black text-xl">{gold.toLocaleString()}</span>
        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-black font-black">💰</div>
      </div>
    </div>
  );

  const renderBottomNav = () => {
    const unclaimedQuests = quests.filter(q => q.isCompleted && !q.isClaimed).length;
    return (
      <div className="absolute bottom-0 inset-x-0 h-20 bg-[#0f172a]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-4 pointer-events-auto z-[60]">
        <button onClick={() => setActiveView(UIView.GAME)} className={`flex flex-col items-center gap-1 transition-all ${activeView === UIView.GAME ? 'text-blue-400 scale-110' : 'text-slate-500 opacity-60 hover:opacity-100 hover:translate-y--1'}`}>
          <div className="text-2xl">🌊</div>
          <span className="text-[10px] font-black uppercase tracking-widest">CHƠI</span>
        </button>
        <button onClick={() => setActiveView(UIView.QUESTS)} className={`relative flex flex-col items-center gap-1 transition-all ${activeView === UIView.QUESTS ? 'text-blue-400 scale-110' : 'text-slate-500 opacity-60 hover:opacity-100 hover:translate-y--1'}`}>
          <div className="text-2xl">📜</div>
          <span className="text-[10px] font-black uppercase tracking-widest">HÀNG NGÀY</span>
          {unclaimedQuests > 0 && (
            <div className="absolute -top-1 -right-2 bg-red-600 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border-2 border-[#0f172a] animate-bounce">
              {unclaimedQuests}
            </div>
          )}
        </button>
        <button onClick={() => setActiveView(UIView.SHOP)} className={`flex flex-col items-center gap-1 transition-all ${activeView === UIView.SHOP ? 'text-blue-400 scale-110' : 'text-slate-500 opacity-60 hover:opacity-100 hover:translate-y--1'}`}>
          <div className="text-2xl">🏪</div>
          <span className="text-[10px] font-black uppercase tracking-widest">TIỆM</span>
        </button>
        <button onClick={() => setActiveView(UIView.INVENTORY)} className={`flex flex-col items-center gap-1 transition-all ${activeView === UIView.INVENTORY ? 'text-blue-400 scale-110' : 'text-slate-500 opacity-60 hover:opacity-100 hover:translate-y--1'}`}>
          <div className="text-2xl">🎒</div>
          <span className="text-[10px] font-black uppercase tracking-widest">TÚI</span>
        </button>
        <button onClick={() => setActiveView(UIView.PROFILE)} className={`flex flex-col items-center gap-1 transition-all ${activeView === UIView.PROFILE ? 'text-blue-400 scale-110' : 'text-slate-500 opacity-60 hover:opacity-100 hover:translate-y--1'}`}>
          <div className="text-2xl">👤</div>
          <span className="text-[10px] font-black uppercase tracking-widest">TÔI</span>
        </button>
      </div>
    );
  };

  if (activeView === UIView.GAME) {
    const currentBaitCount = baitCounts[currentBait.id] || 0;
    return (
      <div className="absolute inset-0 pointer-events-none text-white font-sans overflow-hidden">
        {gameState === GameState.START ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 pointer-events-auto backdrop-blur-md z-50">
            <div className="mb-12 text-center animate-in fade-in zoom-in duration-700">
              <h1 className="text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 mb-2 font-black tracking-tighter italic drop-shadow-2xl">
                FISHING FRENZY
              </h1>
              <p className="text-blue-400 tracking-[0.6em] font-black text-xs opacity-80">BẢN THẦN THOẠI 2025</p>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={onStart}
                className="group relative bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black text-2xl border-b-8 border-blue-800 hover:border-b-4 hover:translate-y-1 transition-all shadow-[0_20px_50px_rgba(30,64,175,0.3)] active:scale-95"
              >
                VÀO CÂU NGAY
              </button>
              <button 
                onClick={() => setShowTutorial(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-12 py-4 rounded-2xl font-bold text-sm border-b-4 border-slate-900 transition-all active:scale-95"
              >
                CÁCH CHƠI?
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start pointer-events-none z-10">
              <div />
              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <div className="bg-[#1e293b]/95 backdrop-blur-lg px-5 py-2.5 rounded-full flex items-center gap-3 border border-slate-700 shadow-2xl hover:scale-105 transition-transform">
                  <span className="text-yellow-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{gold.toLocaleString()}</span>
                  <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-md">VÀNG</span>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => setShowTutorial(true)} className="w-10 h-10 bg-slate-900/80 rounded-full border border-white/10 flex items-center justify-center text-white text-lg hover:bg-slate-700 transition-colors">❓</button>
                  <div 
                    onClick={() => setActiveView(UIView.INVENTORY)}
                    className="bg-slate-900/90 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-all shadow-lg group"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">🎒</span>
                    <span className="text-sm font-black">{inventory.length}/{inventoryCapacity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-24 left-6 flex flex-col gap-2 pointer-events-auto z-10">
              <div className="bg-slate-900/90 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg hover:translate-x-1 transition-transform">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm">⚓</div>
                <div>
                  <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">CẦN CÂU</div>
                  <div className="text-[11px] font-bold text-blue-100 truncate max-w-[120px]">{currentRod.name}</div>
                </div>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg relative hover:translate-x-1 transition-transform">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 text-sm">🐞</div>
                <div>
                  <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">MỒI CÂU</div>
                  <div className="text-[11px] font-bold text-green-100 truncate max-w-[120px]">{currentBait.name}</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black border-2 border-slate-900 animate-in zoom-in duration-300">
                  {currentBaitCount}
                </div>
              </div>
            </div>
            
            {gameState === GameState.IDLE && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-black/70 px-10 py-4 rounded-3xl border-2 border-white/10 backdrop-blur-xl animate-pulse pointer-events-none flex items-center gap-4">
                <span className="bg-white text-black px-3 py-1 rounded-lg font-black text-xs shadow-white/50 shadow-lg">SPACE</span>
                <span className="text-sm font-black tracking-wider uppercase opacity-80">GIỮ ĐỂ QUĂNG CẦN</span>
              </div>
            )}

            {notification && (
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-10 py-6 rounded-[2rem] border-2 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] z-[100] animate-in slide-in-from-top-20 zoom-in duration-500 pointer-events-auto flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-3xl animate-bounce shadow-inner">✨</div>
                <div className="text-center text-xl font-black italic tracking-tight">{notification}</div>
              </div>
            )}

            {renderBottomNav()}
          </>
        )}

        {showTutorial && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto z-[200] flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-slate-900 border-2 border-white/10 rounded-[3rem] p-8 animate-in zoom-in slide-in-from-bottom-5 duration-300">
                    <h2 className="text-3xl font-black italic text-blue-400 mb-6 text-center">HƯỚNG DẪN</h2>
                    <div className="space-y-6 text-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">⌨️</div>
                            <p className="opacity-80">Nhấn và giữ <b>SPACE</b> để chỉnh lực quăng cần.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">⚖️</div>
                            <p className="opacity-80">Khi cá cắn câu, nhấn <b>SPACE</b> để giữ thanh lực trong vùng an toàn.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">💔</div>
                            <p className="opacity-80">Đừng để thanh lực ra ngoài vùng quá lâu kẻo đứt dây!</p>
                        </div>
                    </div>
                    <button onClick={() => setShowTutorial(false)} className="w-full mt-10 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg">ĐÃ HIỂU!</button>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (activeView === UIView.QUESTS) {
    return (
      <div className="absolute inset-0 bg-[#0a0f1d] flex flex-col pointer-events-auto text-white overflow-hidden pb-20 animate-in fade-in duration-300">
        {renderHeader("NHIỆM VỤ HÀNG NGÀY")}
        <div className="px-6 py-4">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest opacity-60">Hoàn thành để nhận thưởng lớn!</p>
        </div>
        <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-10">
          {quests.map(q => {
            const progressPercent = (q.progress / q.target) * 100;
            return (
              <div key={q.id} className={`p-6 rounded-[2.5rem] border transition-all duration-300 ${q.isClaimed ? 'bg-slate-900/30 border-white/5 opacity-50' : q.isCompleted ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.1)] scale-102' : 'bg-slate-900/60 border-white/5 hover:border-white/20'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-black italic text-base ${q.isCompleted ? 'text-green-400' : 'text-white'}`}>{q.title}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-yellow-500">+{q.rewardGold} 💰</span>
                    {q.rewardBaitId && (
                      <span className="text-[8px] font-black text-green-400">+{q.rewardBaitCount} Mồi</span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-6 font-medium leading-relaxed">{q.description}</p>
                
                <div className="relative w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${q.isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-blue-600'}`} 
                    style={{ width: `${progressPercent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black opacity-90">
                    {q.progress} / {q.target}
                  </span>
                </div>

                <div className="mt-6 flex justify-end">
                  {q.isClaimed ? (
                    <span className="text-[9px] font-black text-slate-500 italic uppercase">ĐÃ NHẬN THƯỞNG</span>
                  ) : q.isCompleted ? (
                    <button 
                      onClick={() => onClaimQuest(q.id)}
                      className="bg-yellow-500 text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg active:scale-95 animate-pulse"
                    >
                      NHẬN THƯỞNG
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-blue-400 italic uppercase opacity-60">ĐANG TIẾN HÀNH</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  if (activeView === UIView.INVENTORY) {
    return (
      <div className="absolute inset-0 bg-[#0a0f1d] flex flex-col pointer-events-auto text-white overflow-hidden pb-20 animate-in fade-in duration-300">
        {renderHeader("KHO ĐỒ")}
        
        <div className="px-6 flex gap-3 mb-4">
           <button onClick={() => setInventoryTab('items')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${inventoryTab === 'items' ? 'bg-blue-600 shadow-lg' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>SẢN PHẨM</button>
           <button onClick={() => setInventoryTab('upgrade')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${inventoryTab === 'upgrade' ? 'bg-indigo-600 shadow-lg' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>NÂNG CẤP</button>
        </div>

        <div className="flex-1 p-6 pt-0 space-y-6 overflow-y-auto pb-10">
           {inventoryTab === 'items' ? (
             <>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#162031] p-4 rounded-2xl flex items-center gap-4 border border-slate-800 hover:border-blue-500/40 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-2xl">⚓</div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CẦN CÂU</div>
                      <div className="text-sm font-black truncate">{currentRod.name}</div>
                    </div>
                  </div>
                  <div className="bg-[#162031] p-4 rounded-2xl flex items-center gap-4 border border-slate-800 relative overflow-hidden hover:border-green-500/40 transition-colors">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 text-2xl">🐞</div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">MỒI CÂU</div>
                      <div className="text-sm font-black truncate">{currentBait.name}</div>
                    </div>
                    <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                      {baitCounts[currentBait.id] || 0}
                    </div>
                  </div>
               </div>

               <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black italic text-lg opacity-70">TÚI CỦA BẠN</h3>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black opacity-40">{inventory.length}/{inventoryCapacity}</span>
                        <button onClick={onSellAll} disabled={inventory.length === 0} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[10px] hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95">BÁN TẤT CẢ</button>
                     </div>
                  </div>
                  
                  {inventory.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-30">
                      <div className="text-6xl animate-bounce">🏜️</div>
                      <p className="font-bold italic">Chưa có gì trong túi...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                       {inventory.map((item, i) => (
                         <div key={i} className={`p-4 rounded-2xl border-l-4 shadow-lg flex flex-col gap-2 group transition-all hover:scale-105 relative overflow-hidden ${item.isGolden ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-800/40 border-slate-700'}`} style={!item.isGolden ? { borderLeftColor: item.fish.color } : {}}>
                            {item.isGolden && (
                                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[6px] font-black px-1.5 py-0.5 rounded-bl-lg">X2 GIÁ</div>
                            )}
                            <div className={`text-xs font-black uppercase truncate ${item.isGolden ? 'text-yellow-400' : 'opacity-60'}`}>
                                {item.isGolden ? '★ ' : ''}{item.fish.name}
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-yellow-500 font-bold text-xs">{(item.isGolden ? item.fish.value * 2 : item.fish.value).toLocaleString()} 💰</span>
                               <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full opacity-40">{item.fish.rarity}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
             </>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 p-8 rounded-[3rem] border border-white/5 shadow-xl flex flex-col items-center text-center">
                   <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-pulse">🎒</div>
                   <h3 className="text-xl font-black italic mb-2">DUNG LƯỢNG TÚI ĐỒ</h3>
                   <p className="text-xs text-slate-500 mb-8 max-w-[250px]">Nâng cấp túi đồ để chứa được nhiều cá hơn mỗi lần đi câu.</p>
                   
                   <div className="w-full flex justify-around items-center mb-10 px-4">
                      <div className="text-center">
                         <div className="text-[8px] text-slate-500 font-black uppercase mb-1">HIỆN TẠI</div>
                         <div className="text-2xl font-black text-white">{inventoryCapacity}</div>
                      </div>
                      <div className="text-xl text-blue-500 animate-pulse">➔</div>
                      <div className="text-center">
                         <div className="text-[8px] text-slate-500 font-black uppercase mb-1">MỚI</div>
                         <div className="text-2xl font-black text-blue-400">{inventoryCapacity + 5}</div>
                      </div>
                   </div>

                   <button 
                     onClick={onUpgradeCapacity}
                     className="w-full py-4 bg-yellow-500 text-black rounded-[1.5rem] font-black tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-lg active:scale-95"
                   >
                     NÂNG CẤP ({(inventoryCapacity * 100).toLocaleString()} VÀNG)
                   </button>
                </div>
             </div>
           )}
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  if (activeView === UIView.SHOP) {
    return (
      <div className="absolute inset-0 bg-[#0a0f1d] flex flex-col pointer-events-auto text-white overflow-hidden pb-20 animate-in fade-in duration-300">
        {renderHeader("TIỆM ĐỒ CÂU")}
        <div className="px-6 flex gap-3 mb-6">
           <button onClick={() => setShopTab('rod')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${shopTab === 'rod' ? 'bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.3)]' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>CẦN CÂU</button>
           <button onClick={() => setShopTab('bait')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${shopTab === 'bait' ? 'bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.3)]' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>MỒI CÂU</button>
        </div>

        <div className="flex-1 px-6 overflow-y-auto pb-10">
           <div className="grid grid-cols-1 gap-4">
              {shopTab === 'rod' && RODS.map(rod => (
                <div key={rod.id} className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 flex gap-5 items-center group transition-all hover:border-blue-500/30 hover:scale-102">
                   <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">🎣</div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-black italic text-sm">{rod.name}</h4>
                         <span className="text-[8px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full font-black">{rod.rarityText}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2 line-clamp-1">{rod.description}</p>
                      <div className="flex gap-2 mb-3">
                         <div className="bg-slate-800 px-2 py-0.5 rounded text-[7px] text-blue-300 font-black">LỰC CĂNG: x{rod.lineStrength}</div>
                         <div className="bg-slate-800 px-2 py-0.5 rounded text-[7px] text-yellow-300 font-black">CÁ VÀNG: +{Math.round((rod.control-1)*100)}%</div>
                      </div>
                      
                      {ownedRods.includes(rod.id) ? (
                        <button onClick={() => onSelect(rod, 'rod')} disabled={currentRod.id === rod.id} className="w-full py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-700 transition-colors">
                           {currentRod.id === rod.id ? 'ĐANG DÙNG' : 'SỬ DỤNG'}
                        </button>
                      ) : (
                        <button onClick={() => onBuy(rod, 'rod')} disabled={rod.isLocked} className="w-full py-2 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-20 active:scale-95">
                           {rod.isLocked ? 'LOCKED' : `${rod.price.toLocaleString()} VÀNG`}
                        </button>
                      )}
                   </div>
                </div>
              ))}

              {shopTab === 'bait' && BAITS.map(bait => (
                <div key={bait.id} className="bg-slate-900/60 p-5 rounded-3xl border border-white/5 flex gap-5 items-center group transition-all hover:border-green-500/30 hover:scale-102 relative overflow-hidden">
                   <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">🪱</div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-black italic text-sm">{bait.name}</h4>
                         <span className="text-[8px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full font-black uppercase">{bait.rarityText}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-4 line-clamp-1">{bait.description}</p>
                      <button onClick={() => onBuy(bait, 'bait')} className="w-full py-2 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95">
                        {bait.price.toLocaleString()} VÀNG (x{bait.count})
                      </button>
                   </div>
                   <div className="absolute top-2 right-2 bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black border border-white/5 shadow-lg">
                      SỞ HỮU: {baitCounts[bait.id] || 0}
                   </div>
                </div>
              ))}
           </div>
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  if (activeView === UIView.PROFILE) {
    return (
      <div className="absolute inset-0 bg-[#0a0f1d] flex flex-col pointer-events-auto text-white overflow-hidden pb-20 animate-in fade-in duration-300">
        {renderHeader("CÁ NHÂN")}
        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-10">
           <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                 <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-2 border-white/20 transform group-hover:rotate-6 transition-transform">🧑‍🌾</div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-black text-lg border-4 border-[#1e293b] shadow-lg animate-pulse">
                       {levelData.level}
                    </div>
                 </div>
                 
                 <div className="flex-1">
                    <h2 className="text-2xl font-black italic text-white tracking-tight leading-none mb-1">{levelData.title}</h2>
                    <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase opacity-70 mb-4">CẤP ĐỘ {levelData.level}</p>
                    
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-[8px] font-black opacity-60 uppercase">
                          <span>Kinh Nghiệm</span>
                          <span>{levelData.nextCap} cá nữa để lên cấp</span>
                       </div>
                       <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000"
                            style={{ width: `${levelData.progress}%` }}
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#162031] p-6 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-blue-500/30 transition-all hover:scale-105">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">🌊</div>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">SỰ NGHIỆP</span>
                 </div>
                 <div className="text-3xl font-black italic text-blue-400 mb-1">{stats.totalFishCaught}</div>
                 <div className="text-[8px] text-slate-500 font-bold uppercase">Tổng cá đã câu</div>
              </div>

              <div className="bg-[#162031] p-6 rounded-[2.5rem] border border-white/5 shadow-xl group hover:border-yellow-500/30 transition-all hover:scale-105">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-xl">💰</div>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">TÀI SẢN</span>
                 </div>
                 <div className="text-3xl font-black italic text-yellow-500 mb-1">{gold.toLocaleString()}</div>
                 <div className="text-[8px] text-slate-500 font-bold uppercase">Vàng hiện có</div>
              </div>
           </div>

           <div className="bg-[#162031] p-6 rounded-[3rem] border border-white/5 shadow-xl">
              <h3 className="text-xs font-black italic uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> 
                 KỶ LỤC CÁ NHÂN
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between bg-slate-800/40 p-5 rounded-3xl border border-white/5 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl">📈</div>
                       <div>
                          <div className="text-[10px] text-slate-500 font-black uppercase">Tổng thu nhập</div>
                          <div className="text-sm font-black italic text-blue-400">{stats.totalGoldEarned.toLocaleString()}</div>
                       </div>
                    </div>
                    <div className="text-[8px] bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full font-black border border-blue-500/20">TRỌN ĐỜI</div>
                 </div>

                 <div className="flex items-center justify-between bg-slate-800/40 p-5 rounded-3xl border border-white/5 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl">🦄</div>
                       <div>
                          <div className="text-[10px] text-slate-500 font-black uppercase">Loài hiếm nhất</div>
                          <div className="text-sm font-black italic text-purple-400">{stats.rarestFish}</div>
                       </div>
                    </div>
                    <div className="text-[8px] bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full font-black border border-purple-500/20">QUÝ HIẾM</div>
                 </div>
              </div>

              <div className="mt-8">
                 <button 
                  onClick={onResetData}
                  className="w-full py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600/20 transition-all active:scale-95"
                 >
                   XÓA TIẾN TRÌNH & CHƠI LẠI
                 </button>
              </div>
           </div>
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  return null;
};

export default UIOverlay;
