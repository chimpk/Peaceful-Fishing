
import React, { useState } from 'react';
import BottomNav from '../ui/BottomNav';
import { UIView, GameState, RodType, BaitType, LocationType, TimeOfDay, InventoryItem, Quest } from '../../core/types';

interface GameViewProps {
  gameState: GameState;
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  currentRod: RodType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  location: LocationType;
  timeOfDay: TimeOfDay;
  weather: 'sunny' | 'rainy' | 'stormy';
  streak: number;
  competitionMode: boolean;
  competitionTimeLeft: number;
  competitionScore: number;
  notification: string | null;
  epicCatch: { fish: { name: string; rarity: string; value: number }; isGolden: boolean } | null;
  quests: Quest[];
  onStart: () => void;
  onStartCompetition: () => void;
  onChangeLocation: (loc: LocationType) => void;
  setActiveView: (view: UIView) => void;
  setProfileTab: (tab: any) => void;
  setShowTutorial: (show: boolean) => void;
  showTutorial: boolean;
}

const GameView: React.FC<GameViewProps> = ({ 
  gameState, gold, inventory, inventoryCapacity, currentRod, currentBait, baitCounts,
  location, timeOfDay, weather, streak, competitionMode, competitionTimeLeft, competitionScore,
  notification, epicCatch, quests, onStart, onStartCompetition, onChangeLocation,
  setActiveView, setProfileTab, setShowTutorial, showTutorial
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const currentBaitCount = baitCounts[currentBait.id] || 0;

  // Simple confetti mock since it's just visual
  const confettiItems = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.2 + Math.random() * 1,
    color: ['#fbbf24','#f87171','#34d399','#60a5fa','#a78bfa','#fb923c','#f472b6'][Math.floor(Math.random()*7)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div 
      className="absolute inset-0 text-white font-sans overflow-hidden"
      style={{ pointerEvents: gameState === GameState.START ? 'auto' : 'none', zIndex: 9999 }}
    >
      {gameState === GameState.START ? (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[10000] overflow-hidden"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-float"></div>

          <div className="relative mb-16 text-center animate-in fade-in zoom-in duration-1000">
            <div className="text-[10px] text-blue-400 font-black tracking-[0.5em] uppercase opacity-60 mb-4 animate-float">BẢN THẦN THOẠI 2025</div>
            <h1 className="text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-500 font-black tracking-tighter italic drop-shadow-[0_10px_30px_rgba(59,130,246,0.5)] leading-tight">
              FISHING<br/>FRENZY
            </h1>
          </div>

          <div className="relative flex flex-col gap-6 w-full max-w-sm px-8 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <button 
              onClick={onStart}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-400 text-white px-12 py-6 rounded-[2rem] font-black text-2xl tracking-tight transition-all active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_70px_rgba(37,99,235,0.5)] hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                VÀO CÂU NGAY <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button 
              onClick={onStartCompetition}
              className="group relative bg-slate-900 border border-white/10 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl hover:bg-slate-800 hover:-translate-y-1"
            >
              <span className="bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 text-transparent">CHẾ ĐỘ THI ĐẤU</span>
            </button>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowTutorial(true)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5 active:scale-95"
              >
                CÁCH CHƠI
              </button>
              <button 
                onClick={() => setActiveView(UIView.LEADERBOARD)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5 active:scale-95"
              >
                XẾP HẠNG
              </button>
            </div>
          </div>

          <div className="absolute bottom-12 text-slate-600 text-[10px] font-black tracking-widest uppercase opacity-40">
            © 2025 GOOGLE DEEPMIND TEAM • ANTIGRAVITY AI
          </div>
        </div>
      ) : (
        <>
          {/* Header info */}
          <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start pointer-events-none z-[60]">
            <div className="flex flex-col gap-3 pointer-events-auto">
              <div className="flex gap-2">
                 <div className="bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl group cursor-pointer hover:bg-slate-900 transition-all relative"
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
                   <span className="text-2xl group-hover:scale-110 transition-transform">📍</span>
                   <div>
                     <div className="text-[9px] text-blue-400 font-black tracking-widest uppercase opacity-60">KHU VỰC</div>
                     <div className="text-xs font-black text-white uppercase tracking-tight">{location === 'POND' ? 'Ao Làng' : location === 'OCEAN' ? 'Đại Dương' : 'Hang Tối'}</div>
                   </div>
                   <span className="text-[10px] opacity-30">▼</span>
                   {showLocationDropdown && (
                     <div className="absolute top-full left-0 mt-3 w-48 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-top-2 duration-300">
                        <button onClick={(e) => { e.stopPropagation(); onChangeLocation('POND'); setShowLocationDropdown(false); }} className={`w-full text-xs font-black px-5 py-4 rounded-2xl text-left transition-colors ${location === 'POND' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>AO LÀNG</button>
                        <button onClick={(e) => { e.stopPropagation(); onChangeLocation('OCEAN'); setShowLocationDropdown(false); }} className={`w-full text-xs font-black px-5 py-4 rounded-2xl text-left transition-colors ${location === 'OCEAN' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>ĐẠI DƯƠNG</button>
                        <button onClick={(e) => { e.stopPropagation(); onChangeLocation('CAVE'); setShowLocationDropdown(false); }} className={`w-full text-xs font-black px-5 py-4 rounded-2xl text-left transition-colors ${location === 'CAVE' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>HANG TỐI</button>
                     </div>
                   )}
                 </div>

                 <div className="bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                   <span className="text-2xl animate-float">{timeOfDay === 'DAY' ? '☀️' : timeOfDay === 'SUNSET' ? '🌅' : '🌙'}</span>
                   <div>
                     <div className="text-[9px] text-blue-400 font-black tracking-widest uppercase opacity-60">{weather === 'sunny' ? 'Trời Nắng' : weather === 'rainy' ? 'Trời Mưa' : 'Bão Lớn'}</div>
                     <div className="text-xs font-black text-white uppercase tracking-tight">{timeOfDay === 'DAY' ? 'Sáng Sớm' : timeOfDay === 'SUNSET' ? 'Hoàng Hôn' : 'Đêm Khuya'}</div>
                   </div>
                 </div>
              </div>

              {competitionMode && (
                <div className="bg-gradient-to-r from-orange-600/90 to-amber-600/90 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(249,115,22,0.4)] flex items-center gap-8 animate-in slide-in-from-left-10 duration-500">
                   <div className="flex flex-col">
                      <span className="text-[9px] text-white/60 font-black tracking-widest uppercase">THỜI GIAN CÒN LẠI</span>
                      <span className={`text-3xl font-black italic tracking-tighter ${competitionTimeLeft < 30 ? 'animate-pulse text-red-200' : 'text-white'}`}>
                        {Math.floor(competitionTimeLeft / 60)}:{String(competitionTimeLeft % 60).padStart(2, '0')}
                      </span>
                   </div>
                   <div className="w-px h-10 bg-white/20"></div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-white/60 font-black tracking-widest uppercase">ĐIỂM HIỆN TẠI</span>
                      <span className="text-3xl font-black italic tracking-tighter text-yellow-300">{competitionScore.toLocaleString()}</span>
                   </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <div className="bg-slate-950/60 backdrop-blur-xl px-6 py-4 rounded-[2rem] flex items-center gap-5 border border-white/10 shadow-2xl hover:scale-105 transition-all">
                <div className="text-right">
                  <div className="text-[9px] text-yellow-500 font-black tracking-widest uppercase opacity-60">SỐ DƯ VÀNG</div>
                  <div className="text-3xl font-black text-white tracking-tight leading-none">{gold.toLocaleString()}</div>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-float">💰</div>
              </div>
              
              <div className="flex gap-2">
                 <div 
                  onClick={() => { setActiveView(UIView.PROFILE); setProfileTab('inventory'); }}
                  className="bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-all shadow-2xl group"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🎒</span>
                  <div className="flex flex-col">
                     <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase opacity-60">TÚI ĐỒ</span>
                     <span className="text-sm font-black text-white">{inventory.length}/{inventoryCapacity}</span>
                  </div>
                </div>
                <button onClick={() => setShowTutorial(true)} className="w-12 h-12 bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center text-white text-xl hover:bg-slate-800 transition-all shadow-2xl active:scale-90">❓</button>
              </div>
            </div>
          </div>

          {/* Bottom Status */}
          <div className="absolute bottom-28 left-8 flex flex-col gap-3 pointer-events-auto z-10">
            <div className="bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl hover:translate-x-2 transition-all">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-lg shadow-inner">🎣</div>
              <div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">CẦN CÂU</div>
                <div className="text-sm font-black text-blue-100 truncate max-w-[150px]">{currentRod.name}</div>
              </div>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl relative overflow-visible hover:translate-x-2 transition-all">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 text-lg shadow-inner">🪱</div>
              <div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">MỒI CÂU</div>
                <div className="text-sm font-black text-green-100 truncate max-w-[150px]">{currentBait.name}</div>
              </div>
              <div className="absolute -top-2 -right-3 bg-red-500 text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] border-2 border-slate-950 animate-in zoom-in duration-300">
                x{currentBaitCount}
              </div>
            </div>
          </div>
          
          {/* Streak Indicator */}
          {streak >= 3 && (
            <div className="absolute top-32 right-6 bg-orange-500/20 border border-orange-500/50 px-4 py-2 rounded-full animate-bounce flex items-center gap-2 pointer-events-none shadow-lg z-50">
               <span className="text-xl">🔥</span>
               <span className="font-black text-orange-400 tracking-wider">COMBO x{streak >= 10 ? '3' : streak >= 6 ? '2' : '1.5'}</span>
            </div>
          )}
          
          {gameState === GameState.IDLE && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-black/70 px-10 py-4 rounded-3xl border-2 border-white/10 backdrop-blur-xl pointer-events-none flex flex-col items-center gap-3">
              <div className="flex items-center gap-4 animate-pulse">
                <span className="bg-white text-black px-3 py-1 rounded-lg font-black text-xs shadow-white/50 shadow-lg">SPACE</span>
                <span className="text-sm font-black tracking-wider uppercase opacity-80">GIỮ ĐỂ QUĂNG CẦN</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold opacity-60">hoặc nhấn giữ màn hình</div>
            </div>
          )}

          {notification && (
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-[500] pointer-events-none animate-in fade-in slide-in-from-top-10 zoom-in-95 duration-500">
              <div className="bg-slate-900/80 backdrop-blur-3xl px-12 py-7 rounded-[3rem] border-2 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex items-center gap-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-50"></div>
                <div className="relative w-20 h-20 bg-blue-600/20 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-white/10 animate-float">
                  {notification.includes('achievement') || notification.includes('thành tựu') ? '🏆' : '✨'}
                </div>
                <div className="relative flex flex-col">
                  <span className="text-[10px] text-blue-400 font-black tracking-[0.4em] uppercase mb-1 opacity-60">THÔNG BÁO</span>
                  <div className="text-2xl font-black italic text-white tracking-tight leading-tight max-w-[400px] drop-shadow-lg">
                    {notification}
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 blur-[50px] rounded-full group-hover:bg-blue-600/40 transition-all duration-1000"></div>
              </div>
            </div>
          )}

          <BottomNav activeView={UIView.GAME} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
        </>
      )}

      {/* Epic Catch Overlay */}
      {epicCatch && (() => {
        const isLegendaryPlus = epicCatch.fish.rarity === 'legendary' || epicCatch.fish.rarity === 'mythic';
        const isMythic = epicCatch.fish.rarity === 'mythic';
        const glowColor = isMythic ? '#7c3aed' : isLegendaryPlus ? '#d97706' : '#f59e0b';
        const textGradient = isMythic ? 'from-purple-300 via-pink-400 to-purple-600' : isLegendaryPlus ? 'from-yellow-200 via-amber-400 to-yellow-600' : 'from-yellow-300 via-yellow-400 to-yellow-600';
        const label = isMythic ? '✦ THẦN THOẠI ✦' : isLegendaryPlus ? '★ HUYỀN THOẠI ★' : epicCatch.isGolden ? '✦ CÁ VÀNG ✦' : '★ SỬ THI ★';
        return (
          <div className="absolute inset-0 pointer-events-none z-[300] flex items-center justify-center overflow-hidden" style={{ animation: 'epicFlash 0.35s ease-out' }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${glowColor}55 0%, transparent 70%)`, animation: 'epicGlow 1.5s ease-in-out infinite alternate' }} />
            {confettiItems.map(c => (
              <div key={c.id} className="absolute top-0 rounded-sm" style={{ left: `${c.x}%`, width: c.size, height: c.size * 0.5, backgroundColor: c.color, transform: `rotate(${c.rotation}deg)`, animation: `confettiFall ${c.duration}s ${c.delay}s ease-in forwards` }} />
            ))}
            <div className="relative flex flex-col items-center gap-4" style={{ animation: 'epicCardPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              <div className="text-xs font-black uppercase tracking-[0.3em] px-5 py-1.5 rounded-full border" style={{ color: glowColor, borderColor: glowColor, background: `${glowColor}22`, boxShadow: `0 0 20px ${glowColor}44` }}>{label}</div>
              <div className={`text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b ${textGradient} drop-shadow-2xl text-center leading-tight`} style={{ textShadow: `0 0 40px ${glowColor}` }}>{epicCatch.fish.name}</div>
              <div className="text-base font-black text-yellow-400">+{(epicCatch.isGolden ? epicCatch.fish.value * 2 : epicCatch.fish.value).toLocaleString()} 💰</div>
            </div>
          </div>
        );
      })()}

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
                  <button onClick={() => setShowTutorial(false)} className="w-full mt-10 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg pointer-events-auto">ĐÃ HIỂU!</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default GameView;
