
import React, { useState } from 'react';
import BottomNav from '../ui/BottomNav';
import { UIView, GameState, FishType, RodType, BaitType, TackleType, LocationType, TimeOfDay, InventoryItem, Quest, NotificationItem } from '../../core/types';
import { RODS, TACKLES, BAITS, WEATHER_BONUSES } from '../../core/gameData';

interface GameViewProps {
  gameState: GameState;
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  currentRod: RodType;
  currentTackle: TackleType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  ownedTackles: string[];
  location: LocationType;
  timeOfDay: TimeOfDay;
  weather: 'sunny' | 'rainy' | 'stormy' | 'foggy';
  streak: number;
  competitionMode: boolean;
  competitionTimeLeft: number;
  competitionScore: number;
  notifications: NotificationItem[];
  epicCatch: { fish: { name: string; rarity: string; value: number }; isGolden: boolean } | null;
  quests: Quest[];
  onStart: () => void;
  onStartCompetition: () => void;
  onChangeLocation: (loc: LocationType) => void;
  setActiveView: (view: UIView) => void;
  setProfileTab: (tab: 'stats' | 'skills' | 'collection') => void;
  onOpenShop: (tab: 'rod' | 'tackle' | 'bait') => void;
  setShowTutorial: (show: boolean) => void;
  showTutorial: boolean;
  liveBait: FishType | null;
  onSelect: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  levelData: { level: number; progress: number; title: string; xp: number; xpToLevel: number };
  onRepair: (type: 'rod' | 'tackle') => void;
}

const GameView: React.FC<GameViewProps> = ({ 
  gameState, gold, inventory, inventoryCapacity, currentRod, currentTackle, currentBait, baitCounts,
  location, timeOfDay, weather, streak, competitionMode, competitionTimeLeft, competitionScore,
  notifications, epicCatch, quests, onStart, onStartCompetition, onChangeLocation,
  setActiveView, setProfileTab, setShowTutorial, showTutorial, liveBait, onSelect, ownedRods, ownedTackles,
  levelData, onRepair, onOpenShop
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGearExpanded, setIsGearExpanded] = useState(false);
  const [showSpacePrompt, setShowSpacePrompt] = useState(true);
  const progressRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (gameState === GameState.IDLE) {
      setShowSpacePrompt(true);
      const timer = setTimeout(() => setShowSpacePrompt(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  React.useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${levelData.progress}%`;
    }
  }, [levelData.progress]);
  
  const cycleRod = () => {
    if (ownedRods.length <= 1) return;
    const currentIndex = ownedRods.indexOf(currentRod.id);
    const nextIndex = (currentIndex + 1) % ownedRods.length;
    const nextRodId = ownedRods[nextIndex];
    const nextRod = RODS.find(r => r.id === nextRodId);
    if (nextRod) onSelect(nextRod, 'rod');
  };

  const cycleTackle = () => {
    if (ownedTackles.length <= 1) return;
    const currentIndex = ownedTackles.indexOf(currentTackle.id);
    const nextIndex = (currentIndex + 1) % ownedTackles.length;
    const nextTackleId = ownedTackles[nextIndex];
    const nextTackle = TACKLES.find(t => t.id === nextTackleId);
    if (nextTackle) onSelect(nextTackle, 'tackle');
  };

  const cycleBait = () => {
    const availableBaits = BAITS.filter(b => (baitCounts[b.id] || 0) > 0);
    if (availableBaits.length <= 1) return;
    const currentIndex = availableBaits.findIndex(b => b.id === currentBait.id);
    const nextIndex = (currentIndex + 1) % availableBaits.length;
    const nextBait = availableBaits[nextIndex];
    if (nextBait) onSelect(nextBait, 'bait');
  };

  const isFishing = ![GameState.IDLE, GameState.START, GameState.CAUGHT, GameState.GAMEOVER].includes(gameState);

  return (
    <div className="absolute inset-0 text-white font-sans overflow-hidden pointer-events-none z-[9999]">
      {gameState === GameState.START ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[10000] overflow-hidden pointer-events-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="relative mb-16 text-center animate-in fade-in zoom-in duration-1000">
            <div className="text-[10px] text-blue-400 font-black tracking-[0.5em] uppercase opacity-60 mb-4 animate-float">BẢN THẦN THOẠI 2025</div>
            <h1 className="text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-500 font-black tracking-tighter italic drop-shadow-[0_10px_30px_rgba(59,130,246,0.5)] leading-tight">
              FISHING<br/>FRENZY
            </h1>
          </div>
          <div className="relative flex flex-col gap-6 w-full max-w-sm px-8 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <button onClick={onStart} className="group relative bg-gradient-to-r from-blue-600 to-blue-400 text-white px-12 py-6 rounded-[2rem] font-black text-2xl tracking-tight transition-all active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
               VÀO CÂU NGAY →
            </button>
            <button onClick={onStartCompetition} className="group relative bg-slate-900 border border-white/10 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl hover:bg-slate-800">
              <span className="bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 text-transparent">CHẾ ĐỘ THI ĐẤU</span>
            </button>
            <div className="flex gap-4">
              <button onClick={() => setShowTutorial(true)} className="flex-1 bg-white/5 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/5">CÁCH CHƠI</button>
              <button onClick={() => setActiveView(UIView.LEADERBOARD)} className="flex-1 bg-white/5 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/5">XẾP HẠNG</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header UI */}
          <div className={`absolute top-0 inset-x-0 p-4 flex justify-between items-start pointer-events-none z-[60] transition-all duration-500 ${isFishing ? 'opacity-20 scale-95' : 'opacity-100'}`}>
            {/* Left Side: Location & Weather */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <div className="flex gap-2">
                 <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl group cursor-pointer relative" onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
                   <span className="text-xl">📍</span>
                   <div>
                     <div className="text-[8px] text-blue-400 font-black tracking-widest uppercase opacity-60 leading-none">KHU VỰC</div>
                     <div className="text-[10px] font-black uppercase text-white">{location === 'POND' ? 'Ao Làng' : location === 'OCEAN' ? 'Đại Dương' : 'Hang Tối'}</div>
                   </div>
                   {showLocationDropdown && (
                     <div className="absolute top-full left-0 mt-2 w-40 bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl">
                        <button onClick={() => onChangeLocation('POND')} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">AO LÀNG</button>
                        <button onClick={() => onChangeLocation('OCEAN')} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">ĐẠI DƯƠNG</button>
                        <button onClick={() => onChangeLocation('CAVE')} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">HANG TỐI</button>
                     </div>
                   )}
                 </div>
                  <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl group relative">
                    <span className="text-xl animate-float">{timeOfDay === 'DAY' ? '☀️' : '🌙'}</span>
                    <div>
                      <div className="text-[8px] text-blue-400 font-black uppercase opacity-60 leading-none">{weather === 'sunny' ? 'Nắng' : (weather === 'rainy' ? 'Mưa' : (weather === 'stormy' ? 'Bão' : 'Sương mù'))}</div>
                      <div className="text-[10px] font-black uppercase text-white">{weather === 'sunny' ? '☀️' : weather === 'rainy' ? '🌧️' : weather === 'stormy' ? '⛈️' : '🌫️'}</div>
                    </div>
                    {/* Weather Info Tooltip */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                       <div className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-wider">Hiệu ứng thời tiết</div>
                       <div className="text-xs text-white/80 leading-relaxed font-medium">
                          {WEATHER_BONUSES[weather].label}
                       </div>
                    </div>
                  </div>
              </div>
              {competitionMode && (
                <div className="bg-orange-600/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 flex gap-4">
                  <div className="flex flex-col"><span className="text-[7px] font-black">THỜI GIAN</span><span className="text-sm font-black">{Math.floor(competitionTimeLeft/60)}:{String(competitionTimeLeft%60).padStart(2,'0')}</span></div>
                  <div className="flex flex-col"><span className="text-[7px] font-black">ĐIỂM</span><span className="text-sm font-black text-yellow-300">{competitionScore}</span></div>
                </div>
              )}
            </div>

            {/* Right Side: Gold, Inventory */}
            <div className="flex flex-col items-end gap-2 pointer-events-auto">
              <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="text-right">
                  <div className="text-[8px] text-yellow-500 font-black tracking-widest uppercase leading-none">VÀNG</div>
                  <div className="text-xl font-black text-white">{gold.toLocaleString()}</div>
                </div>
                <span className="text-xl">💰</span>
              </div>

              <div className="flex gap-3 mt-1 pointer-events-auto">
                 <div onClick={() => setActiveView(UIView.INVENTORY)} className="bg-slate-950/60 glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all shadow-2xl">
                   <span className="text-xl">🎒</span>
                   <div className="text-right">
                     <div className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">TÚI ĐỒ</div>
                     <div className="text-xs font-black">{inventory.length}/{inventoryCapacity}</div>
                   </div>
                 </div>
                 <button onClick={() => setShowTutorial(true)} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 glass-panel rounded-xl border border-blue-500/30 flex items-center gap-2 text-white transition-all group">
                   <span className="text-xs font-black tracking-widest uppercase">HƯỚNG DẪN</span>
                   <span className="group-hover:rotate-12 transition-transform">❓</span>
                 </button>
              </div>
            </div>

            {/* Center: Level Display (Premium 2.0) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center pointer-events-auto">
              <div onClick={() => setActiveView(UIView.PROFILE)} className="bg-slate-950/60 glass-panel px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-all shadow-2xl">
                 <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-black text-sm border border-blue-500/30">{levelData.level}</div>
                 <div className="flex flex-col min-w-[160px]">
                    <div className="flex justify-between items-end text-[9px] font-black mb-1">
                      <span className="text-blue-400 uppercase tracking-widest">{levelData.title}</span>
                      <span className="text-slate-400">{levelData.xp} / {levelData.xpToLevel} XP</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div 
                        ref={progressRef}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 progress-fill rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      ></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Left Sidebar: Equipment (Collapsible 3.0) */}
          <div className={`absolute top-1/2 -translate-y-1/2 left-0 z-[70] transition-all duration-500 ${isFishing ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'} pointer-events-auto group/gear`}>
            <div className={`relative bg-slate-950/40 backdrop-blur-md border-y border-r border-white/5 p-2 rounded-r-[2rem] flex flex-col gap-3 shadow-2xl transition-all duration-500 ${isGearExpanded ? 'w-56 pr-6' : 'w-16'}`}>
               
               {/* Collapse/Expand Toggle */}
               <button 
                 onClick={() => setIsGearExpanded(!isGearExpanded)}
                 className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 pointer-events-auto hover:scale-110 transition-transform active:scale-90"
               >
                 <span className={`text-xs transition-transform duration-500 ${isGearExpanded ? 'rotate-180' : ''}`}>▶</span>
               </button>

                <div className="flex flex-col gap-1">
                  <div onClick={cycleRod} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
                    <div className="w-10 h-10 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform relative">
                        🎣
                        {/* Durability Dot */}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${(currentRod.durability || 0) > 50 ? 'bg-green-500' : (currentRod.durability || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    </div>
                    {isGearExpanded && (
                      <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">CẦN CÂU</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate max-w-[100px]">{currentRod.name}</span>
                        <div className="w-full h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${(currentRod.durability || 0) > 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} 
                              style={{ width: `${Math.max(5, ((currentRod.durability || 0) / (currentRod.maxDurability || 100)) * 100)}%` }}
                            ></div>
                        </div>
                      </div>
                    )}
                    {isGearExpanded && (currentRod.durability || 0) < (currentRod.maxDurability || 100) && (
                        <button onClick={(e) => { e.stopPropagation(); onRepair('rod'); }} className="bg-blue-600 hover:bg-blue-500 text-[8px] font-black px-2 py-1 rounded-lg transition-colors">SỬA</button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div onClick={cycleTackle} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
                    <div className="w-10 h-10 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform relative">
                        🔗
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${(currentTackle.durability || 0) > 50 ? 'bg-green-500' : (currentTackle.durability || 0) > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    </div>
                    {isGearExpanded && (
                      <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">THẺO CÂU</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate max-w-[100px]">{currentTackle.name}</span>
                        <div className="w-full h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${(currentTackle.durability || 0) > 0 ? 'bg-blue-500' : 'bg-red-500 animate-pulse'}`} 
                              style={{ width: `${Math.max(5, ((currentTackle.durability || 0) / (currentTackle.maxDurability || 30)) * 100)}%` }}
                            ></div>
                        </div>
                      </div>
                    )}
                    {isGearExpanded && (currentTackle.durability || 0) < (currentTackle.maxDurability || 30) && (
                        <button onClick={(e) => { e.stopPropagation(); onRepair('tackle'); }} className="bg-blue-600 hover:bg-blue-500 text-[8px] font-black px-2 py-1 rounded-lg transition-colors">SỬA</button>
                    )}
                  </div>
                </div>

               <div onClick={() => onOpenShop('bait')} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group relative">
                 <div className="w-10 h-10 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🪱</div>
                 <div onClick={(e) => { e.stopPropagation(); cycleBait(); }} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 active:scale-90 transition-all text-[7px] font-black px-1.5 py-1 rounded-full cursor-pointer shadow-lg border border-white/10">x{baitCounts[currentBait.id] || 0}</div>
                 {isGearExpanded && (
                   <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                     <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">MỒI CÂU</span>
                     <span className="text-[9px] font-black text-white whitespace-nowrap uppercase tracking-tighter truncate max-w-[120px]">{currentBait.name}</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Idle prompt (Moved to Bottom to avoid covering fish) */}
          {gameState === GameState.IDLE && showSpacePrompt && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex items-center gap-3">
                <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-black shadow-lg">SPACE</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">NHẤN GIỮ ĐỂ QUĂNG CẦN</span>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none w-full max-w-sm">
            {notifications.slice(0, 2).map(n => (
              <div key={n.id} className="bg-slate-950/90 px-4 py-3 rounded-2xl border border-white/10 text-xs font-black text-center shadow-2xl animate-in slide-in-from-top-2">{n.message}</div>
            ))}
          </div>

          {/* Bottom Nav */}
          <div className={`transition-all duration-500 ${isFishing ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
            <BottomNav activeView={UIView.GAME} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
          </div>
        </>
      )}

      {/* Epic Catch Overlay */}
      {epicCatch && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
           <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-500">
             <div className="text-xs font-black text-yellow-500 uppercase tracking-widest">{epicCatch.isGolden ? '✦ CÁ VÀNG ✦' : '★ HIẾM ★'}</div>
             <div className="text-4xl font-black italic text-white drop-shadow-2xl">{epicCatch.fish.name}</div>
           </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 pointer-events-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full">
            <h2 className="text-2xl font-black text-blue-400 mb-4 text-center">HƯỚNG DẪN</h2>
            <div className="space-y-4 text-sm opacity-80">
              <p>• Nhấn giữ <b>SPACE</b> để chọn lực quăng cần.</p>
              <p>• Nhấn nhấp <b>SPACE</b> để giữ thanh lực trong vùng màu khi kéo cá.</p>
              <p>• Nhấn <b>F</b> để Tập Trung, <b>G</b> để Kéo Mạnh (khi đã học).</p>
            </div>
            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-blue-600 rounded-xl font-black uppercase tracking-widest active:scale-95">ĐÃ HIỂU</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
