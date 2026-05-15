
import React, { useState } from 'react';
import BottomNav from '../layout/BottomNav';
import { UIView, GameState, FishType, RodType, BaitType, TackleType, LocationType, TimeOfDay, InventoryItem, Quest, NotificationItem, ProfileStats, WeatherType } from '../../types';
import { RODS, TACKLES, BAITS, WEATHER_BONUSES } from '../../core/data/gameData';
import { soundManager } from '../../core/systems/soundManager';

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
  weather: WeatherType;
  streak: number;
  competitionMode: boolean;
  competitionTimeLeft: number;
  competitionScore: number;
  notifications: NotificationItem[];
  epicCatch: { fish: { name: string; rarity: string; value: number }; isGolden: boolean } | null;
  quests: Quest[];
  startGame: () => void;
  startCompetition: () => void;
  setLocation: (loc: LocationType) => void;
  setActiveView: (view: UIView) => void;
  setProfileTab: (tab: 'stats' | 'skills' | 'collection') => void;
  onOpenShop: (tab: 'rod' | 'tackle' | 'bait') => void;
  setShowTutorial: (show: boolean) => void;
  showTutorial: boolean;
  liveBait: FishType | null;
  handleSelect: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  levelData: { level: number; progress: number; title: string; xp: number; xpToLevel: number };
  handleRepair: (type: 'rod' | 'tackle') => void;
  dailyMarketBoosts: string[];
  stats?: ProfileStats;
  claimDailyReward?: () => void;
  onOpenShowroom: () => void;
}

const GameView: React.FC<GameViewProps> = ({ 
  gameState, gold, inventory, inventoryCapacity, currentRod, currentTackle, currentBait, baitCounts,
  location, timeOfDay, weather, streak, competitionMode, competitionTimeLeft, competitionScore,
  notifications, epicCatch, quests, startGame, startCompetition, setLocation,
  setActiveView, setProfileTab, setShowTutorial, showTutorial, liveBait, handleSelect, ownedRods, ownedTackles,
  levelData, handleRepair, onOpenShop, dailyMarketBoosts, stats, claimDailyReward, onOpenShowroom
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGearExpanded, setIsGearExpanded] = useState(false);
  const [showSpacePrompt, setShowSpacePrompt] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showRodDropdown, setShowRodDropdown] = useState(false);
  const [showTackleDropdown, setShowTackleDropdown] = useState(false);
  const [showBaitDropdown, setShowBaitDropdown] = useState(false);
  const progressRef = React.useRef<HTMLDivElement>(null);

  const canClaimDaily = React.useMemo(() => {
    if (!stats) return false;
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastClaimed = stats.lastDailyRewardClaimed ? new Date(stats.lastDailyRewardClaimed).setHours(0, 0, 0, 0) : 0;
    return stats.lastDailyRewardClaimed === 0 || today > lastClaimed;
  }, [stats?.lastDailyRewardClaimed]);

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
    if (nextRod) handleSelect(nextRod, 'rod');
  };

  const cycleTackle = () => {
    if (ownedTackles.length <= 1) return;
    const currentIndex = ownedTackles.indexOf(currentTackle.id);
    const nextIndex = (currentIndex + 1) % ownedTackles.length;
    const nextTackleId = ownedTackles[nextIndex];
    const nextTackle = TACKLES.find(t => t.id === nextTackleId);
    if (nextTackle) handleSelect(nextTackle, 'tackle');
  };

  const cycleBait = () => {
    const availableBaits = BAITS.filter(b => (baitCounts[b.id] || 0) > 0);
    if (availableBaits.length <= 1) return;
    const currentIndex = availableBaits.findIndex(b => b.id === currentBait.id);
    const nextIndex = (currentIndex + 1) % availableBaits.length;
    const nextBait = availableBaits[nextIndex];
    if (nextBait) handleSelect(nextBait, 'bait');
  };

  const isFishing = ![GameState.IDLE, GameState.START, GameState.CAUGHT, GameState.GAMEOVER].includes(gameState);

  return (
    <div className="absolute inset-0 text-white font-sans overflow-hidden pointer-events-none z-[9999]">
      {gameState === GameState.START ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[10000] overflow-hidden pointer-events-auto">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse-glow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.8)_100%)]"></div>
          </div>
          
          {/* Rotating Light Rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(59,130,246,0.2)_10%,_transparent_20%,_rgba(59,130,246,0.2)_30%,_transparent_40%,_rgba(59,130,246,0.2)_50%,_transparent_60%,_rgba(59,130,246,0.2)_70%,_transparent_80%,_rgba(59,130,246,0.2)_90%,_transparent_100%)] animate-ray"></div>
          </div>

          {/* Floating Particles Decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(12)].map((_, i) => (
               <div 
                 key={i} 
                 className="absolute bg-blue-400/20 rounded-full blur-sm animate-float"
                 style={{
                   width: Math.random() * 40 + 10,
                   height: Math.random() * 40 + 10,
                   left: `${Math.random() * 100}%`,
                   top: `${Math.random() * 100}%`,
                   animationDelay: `${Math.random() * 5}s`,
                   animationDuration: `${Math.random() * 3 + 3}s`
                 }}
               />
             ))}
          </div>

          {/* Content */}
          <div className="relative mb-20 text-center z-10">
            <div className="flex flex-col items-center">
              <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 animate-in fade-in zoom-in duration-700">
                <div className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase">BẢN THẦN THOẠI 2026</div>
              </div>
              
              <div className="relative group cursor-default">
                <h1 className="text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-600 font-black tracking-tighter italic drop-shadow-2xl leading-[0.85] animate-in fade-in slide-in-from-top-10 duration-1000">
                  PEACEFUL<br/>
                  <span className="text-blue-500 text-shadow-premium">FISHING</span>
                </h1>
                {/* Subtle outer glow that follows the text */}
                <div className="absolute inset-0 blur-3xl bg-blue-500/10 opacity-50 -z-10 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-5 w-full max-w-sm px-10 z-20 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <button 
              onClick={() => { soundManager.playClick(); startGame(); }} 
              className="group relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-2xl tracking-tight transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.4)] animate-shimmer overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                VÀO CÂU NGAY 
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button 
              onClick={() => { soundManager.playClick(); startCompetition(); }} 
              className="group relative bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:bg-slate-800 hover:border-orange-500/30"
            >
              <span className="bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 text-transparent group-hover:from-white group-hover:to-white transition-all">CHẾ ĐỘ THI ĐẤU</span>
              {/* Competition Badge */}
              <div className="absolute -top-2 -right-2 bg-red-600 text-[8px] px-2 py-0.5 rounded-full border border-red-400 animate-bounce">LIVE</div>
            </button>

            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => { soundManager.playClick(); setShowTutorial(true); }} 
                className="flex-1 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] border border-white/5 transition-all hover:-translate-y-1"
              >
                CÁCH CHƠI
              </button>
              <button 
                onClick={() => { soundManager.playClick(); onOpenShowroom(); }} 
                className="flex-1 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] border border-white/5 transition-all hover:-translate-y-1"
              >
                TRƯNG BÀY
              </button>
              <button 
                onClick={() => { soundManager.playClick(); setActiveView(UIView.LEADERBOARD); }} 
                className="flex-1 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] border border-white/5 transition-all hover:-translate-y-1"
              >
                XẾP HẠNG
              </button>
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
                 <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl group cursor-pointer relative" onClick={() => { soundManager.playClick(); setShowLocationDropdown(!showLocationDropdown); }}>
                   <span className="text-xl">📍</span>
                   <div>
                     <div className="text-[8px] text-blue-400 font-black tracking-widest uppercase opacity-60 leading-none">KHU VỰC</div>
                     <div className="text-[10px] font-black uppercase text-white">{location === 'POND' ? 'Ao Làng' : location === 'OCEAN' ? 'Đại Dương' : 'Hang Tối'}</div>
                   </div>
                   {showLocationDropdown && (
                     <div className="absolute top-full left-0 mt-2 w-40 bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl">
                        <button onClick={() => { soundManager.playClick(); setLocation('POND'); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">AO LÀNG</button>
                        <button onClick={() => { soundManager.playClick(); setLocation('OCEAN'); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">ĐẠI DƯƠNG</button>
                        <button onClick={() => { soundManager.playClick(); setLocation('CAVE'); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">HANG TỐI</button>
                     </div>
                   )}
                 </div>
                  <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl group relative">
                    <span className="text-xl animate-float">{timeOfDay === 'DAY' ? '☀️' : '🌙'}</span>
                    <div>
                      <div className="text-[8px] text-blue-400 font-black uppercase opacity-60 leading-none">
                        {weather === 'deep_sea_current' ? 'Hải Lưu' : 
                         weather === 'crystal_resonance' ? 'Cộng Hưởng' :
                         location === 'CAVE' ? (weather === 'sunny' ? 'Khô Ráo' : 'Hơi Nước') : 
                         (timeOfDay === 'NIGHT' ? (weather === 'sunny' ? 'Trời Quang' : 'Mưa Đêm') : 
                         (weather === 'sunny' ? 'Nắng' : (weather === 'rainy' ? 'Mưa' : (weather === 'stormy' ? 'Bão' : 'Sương mù'))))}
                      </div>
                      <div className="text-[10px] font-black uppercase text-white">
                        {weather === 'deep_sea_current' ? '🌊' : 
                         weather === 'crystal_resonance' ? '✨' :
                         location === 'CAVE' ? (weather === 'sunny' ? '💎' : '🌫️') : 
                         (timeOfDay === 'NIGHT' ? (weather === 'sunny' ? '🌙' : (weather === 'rainy' ? '🌧️' : '⛈️')) : 
                         (weather === 'sunny' ? '☀️' : weather === 'rainy' ? '🌧️' : weather === 'stormy' ? '⛈️' : '🌫️'))}
                      </div>
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
                 <div onClick={() => { soundManager.playClick(); setActiveView(UIView.INVENTORY); }} className="bg-slate-950/60 glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all shadow-2xl">
                   <span className="text-xl">🎒</span>
                   <div className="text-right">
                     <div className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">TÚI ĐỒ</div>
                     <div className="text-xs font-black">{inventory.length}/{inventoryCapacity}</div>
                   </div>
                 </div>
                 <button onClick={() => { soundManager.playClick(); setShowTutorial(true); }} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 glass-panel rounded-xl border border-blue-500/30 flex items-center gap-2 text-white transition-all group">
                   <span className="text-xs font-black tracking-widest uppercase">HƯỚNG DẪN</span>
                   <span className="group-hover:rotate-12 transition-transform">❓</span>
                 </button>
              </div>

              {/* Daily Market Boost Badge */}
              {dailyMarketBoosts.length > 0 && (
                <div className="bg-gradient-to-r from-orange-950/80 to-amber-950/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-yellow-500/20 flex items-center gap-2 shadow-2xl">
                  <span className="text-sm animate-pulse">🔥</span>
                  <div>
                    <div className="text-[7px] text-yellow-500 font-black tracking-widest uppercase leading-none">GIÁ x3 HÔM NAY</div>
                    <div className="text-[9px] font-bold text-yellow-300/80 truncate max-w-[120px]">{dailyMarketBoosts.slice(0, 2).join(', ')}{dailyMarketBoosts.length > 2 ? '...' : ''}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Level Display (Premium 2.0) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center pointer-events-auto">
              <div onClick={() => { soundManager.playClick(); setActiveView(UIView.PROFILE); }} className="bg-slate-950/60 glass-panel px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-all shadow-2xl">
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
                 onClick={() => { soundManager.playClick(); setIsGearExpanded(!isGearExpanded); }}
                 className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 pointer-events-auto hover:scale-110 transition-transform active:scale-90"
               >
                 <span className={`text-xs transition-transform duration-500 ${isGearExpanded ? 'rotate-180' : ''}`}>▶</span>
               </button>

                <div className="flex flex-col gap-1">
                  <div onClick={() => { soundManager.playClick(); setShowRodDropdown(!showRodDropdown); }} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group relative">
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
                        <button onClick={(e) => { e.stopPropagation(); soundManager.playClick(); handleRepair('rod'); }} className="bg-blue-600 hover:bg-blue-500 text-[8px] font-black px-2 py-1 rounded-lg transition-colors">SỬA</button>
                    )}
                  </div>
                  {showRodDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl z-50">
                      {ownedRods.map(rodId => {
                        const rod = RODS.find(r => r.id === rodId);
                        if (!rod) return null;
                        return (
                          <button key={rodId} onClick={() => { soundManager.playClick(); handleSelect(rod, 'rod'); setShowRodDropdown(false); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">
                            {rod.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div onClick={() => { soundManager.playClick(); setShowTackleDropdown(!showTackleDropdown); }} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group relative">
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
                        <button onClick={(e) => { e.stopPropagation(); soundManager.playClick(); handleRepair('tackle'); }} className="bg-blue-600 hover:bg-blue-500 text-[8px] font-black px-2 py-1 rounded-lg transition-colors">SỬA</button>
                    )}
                  </div>
                  {showTackleDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl z-50">
                      {ownedTackles.map(tackleId => {
                        const tackle = TACKLES.find(t => t.id === tackleId);
                        if (!tackle) return null;
                        return (
                          <button key={tackleId} onClick={() => { soundManager.playClick(); handleSelect(tackle, 'tackle'); setShowTackleDropdown(false); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">
                            {tackle.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

               <div onClick={() => { if (!liveBait) { soundManager.playClick(); setShowBaitDropdown(!showBaitDropdown); } }} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group relative">
                 {liveBait ? (
                   <>
                     <div className="w-10 h-10 bg-red-950/60 rounded-xl border border-red-500/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">🐟</div>
                     <div className="absolute top-1 right-1 bg-red-600 text-[7px] font-black px-1.5 py-1 rounded-full shadow-lg border border-red-400">x1</div>
                     {isGearExpanded && (
                       <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                         <span className="text-[7px] font-black text-red-400 uppercase tracking-widest">MỒI SỐNG</span>
                         <span className="text-[9px] font-black text-white whitespace-nowrap uppercase tracking-tighter truncate max-w-[120px]">{liveBait.name}</span>
                       </div>
                     )}
                   </>
                 ) : (
                   <>
                     <div className="w-10 h-10 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🪱</div>
                     <div onClick={(e) => { e.stopPropagation(); soundManager.playClick(); cycleBait(); }} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 active:scale-90 transition-all text-[7px] font-black px-1.5 py-1 rounded-full cursor-pointer shadow-lg border border-white/10">x{baitCounts[currentBait.id] || 0}</div>
                     {isGearExpanded && (
                       <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                         <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">MỒI CÂU</span>
                         <span className="text-[9px] font-black text-white whitespace-nowrap uppercase tracking-tighter truncate max-w-[120px]">{currentBait.name}</span>
                       </div>
                     )}
                   </>
                 )}
               </div>
               {showBaitDropdown && !liveBait && (
                 <div className="absolute top-full left-0 mt-2 w-40 bg-slate-950/95 border border-white/10 rounded-xl p-1 shadow-2xl z-50">
                   {BAITS.filter(b => (baitCounts[b.id] || 0) > 0).map(bait => (
                     <button key={bait.id} onClick={() => { soundManager.playClick(); handleSelect(bait, 'bait'); setShowBaitDropdown(false); }} className="w-full text-left p-2 hover:bg-white/10 rounded text-[10px] font-black">
                       {bait.name} (x{baitCounts[bait.id] || 0})
                     </button>
                   ))}
                 </div>
               )}
            </div>
          </div>

           {/* Idle prompt */}
           {gameState === GameState.IDLE && showSpacePrompt && (
             <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="flex items-center gap-3">
                 <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-black shadow-lg">SPACE</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">NHẤN GIỮ ĐỂ QUĂNG CẦN</span>
               </div>
             </div>
           )}

           {/* Daily Reward Banner */}
           {canClaimDaily && gameState === GameState.IDLE && (
             <div className="absolute bottom-32 right-8 bg-gradient-to-br from-yellow-900/80 to-amber-900/80 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-yellow-500/50 shadow-2xl flex flex-col items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-500 z-[90] pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setActiveView(UIView.PROFILE);
                    setProfileTab('stats');
                  }}>
                <div className="text-3xl animate-bounce">🎁</div>
                <div className="text-center">
                   <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none mb-1">QUÀ HÀNG NGÀY</div>
                   <div className="text-xs font-bold text-white">Đã Sẵn Sàng!</div>
                </div>
             </div>
           )}

          {/* Notifications */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 flex flex-col gap-3 pointer-events-none w-80 items-center z-[100]">
            {notifications.slice(0, 3).map(n => (
              <div key={n.id} className={`bg-slate-950/90 px-6 py-3 rounded-full border border-white/20 text-xs font-black text-center shadow-2xl animate-in slide-in-from-top-4 slide-out-to-top-4 fade-in fade-out duration-300 backdrop-blur-md ${n.type === 'boss' ? 'border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : n.type === 'warning' ? 'border-orange-500/50 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : n.type === 'achievement' ? 'border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'text-white'}`}>{n.message}</div>
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center p-6 pointer-events-auto animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-blue-400">HƯỚNG DẪN ({tutorialStep + 1}/3)</h2>
               <button onClick={() => { setShowTutorial(false); setTutorialStep(0); }} className="text-slate-500 hover:text-white font-black">✕</button>
            </div>
            
            <div className="relative h-48 w-full bg-slate-950/50 rounded-2xl mb-6 flex items-center justify-center border border-white/5 overflow-hidden">
               {tutorialStep === 0 && (
                 <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="w-48 h-4 bg-slate-800 rounded-full overflow-hidden relative">
                       <div className="absolute inset-y-0 left-0 bg-blue-500 animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '70%' }}></div>
                    </div>
                    <div className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce">NHẤN GIỮ [SPACE]</div>
                 </div>
               )}
               {tutorialStep === 1 && (
                 <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="w-12 h-32 bg-slate-800 rounded-full relative border-2 border-white/10 flex flex-col justify-end p-1">
                       <div className="absolute w-full h-12 bg-green-500/30 top-8 left-0 border-y border-green-500"></div>
                       <div className="w-full h-6 bg-yellow-400 rounded-full absolute transition-all duration-300 animate-[bounce_1.5s_ease-in-out_infinite] left-0"></div>
                    </div>
                    <div className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse">NHẤN NHẤP [SPACE]</div>
                 </div>
               )}
               {tutorialStep === 2 && (
                 <div className="flex gap-6 animate-in slide-in-from-right-8 fade-in duration-300">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-blue-600/20 rounded-xl border border-blue-500 flex items-center justify-center text-xl font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">F</div>
                       <span className="text-[9px] font-black uppercase text-slate-400">Tập trung</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-orange-600/20 rounded-xl border border-orange-500 flex items-center justify-center text-xl font-black text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]">G</div>
                       <span className="text-[9px] font-black uppercase text-slate-400">Kéo mạnh</span>
                    </div>
                 </div>
               )}
            </div>

            <p className="text-sm text-slate-300 h-16 text-center leading-relaxed font-medium">
              {tutorialStep === 0 && "Giữ phím SPACE để chọn lực quăng. Quăng trúng vùng xanh sẽ nhận được Bonus thả mồi hoàn hảo!"}
              {tutorialStep === 1 && "Khi cá cắn, hãy nhấp nhả SPACE để giữ thanh lực màu vàng nằm bên trong vùng an toàn màu xanh."}
              {tutorialStep === 2 && "Sử dụng kỹ năng đặc biệt khi bạn đã học chúng trong Cây Kỹ Năng để dễ dàng bắt cá hiếm hơn."}
            </p>

            <div className="flex gap-3 mt-6">
               {tutorialStep > 0 && (
                  <button onClick={() => setTutorialStep(prev => prev - 1)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">TRƯỚC</button>
               )}
               <button onClick={() => {
                  if (tutorialStep < 2) setTutorialStep(prev => prev + 1);
                  else { setShowTutorial(false); setTutorialStep(0); }
               }} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all active:scale-95">
                  {tutorialStep < 2 ? 'TIẾP THEO' : 'ĐÃ HIỂU'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
