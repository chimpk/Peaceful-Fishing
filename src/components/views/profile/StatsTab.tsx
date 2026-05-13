
import React from 'react';
import { soundManager } from '../../../core/soundManager';

interface StatsTabProps {
  levelData: { level: number; progress: number; title: string; nextCap: number };
  stats: { totalFishCaught: number; totalGoldEarned: number; rarestFish: string; lastDailyRewardClaimed?: number; dailyStreak?: number };
  gold: number;
  onResetData: () => void;
  onViewLeaderboard: () => void;
  onClaimDailyReward: () => void;
}

const StatsTab: React.FC<StatsTabProps> = ({ levelData, stats, gold, onResetData, onViewLeaderboard, onClaimDailyReward }) => {
  const expRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (expRef.current) {
      expRef.current.style.width = `${levelData.progress}%`;
    }
  }, [levelData.progress]);

  const canClaimDaily = React.useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return !stats.lastDailyRewardClaimed || (now - stats.lastDailyRewardClaimed >= oneDay);
  }, [stats.lastDailyRewardClaimed]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
       {/* Daily Reward Section */}
       <div className={`p-8 rounded-[3rem] border transition-all shadow-2xl relative overflow-hidden ${canClaimDaily ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/60 border-yellow-500/30' : 'glass-card opacity-80'}`}>
          <div className="flex justify-between items-center relative z-10">
             <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-inner ${canClaimDaily ? 'bg-yellow-500/20 animate-bounce' : 'bg-slate-800'}`}>🎁</div>
                <div>
                   <h4 className="font-black text-lg italic text-white leading-none">QUÀ HÀNG NGÀY</h4>
                   <p className="text-[10px] text-yellow-500 font-black tracking-widest uppercase mt-2">CHUỖI: {stats.dailyStreak || 0} NGÀY</p>
                </div>
             </div>
             {canClaimDaily ? (
                <button 
                  onClick={() => { soundManager.playClick(); onClaimDailyReward(); }}
                  className="px-8 py-4 btn-premium text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                   NHẬN NGAY
                </button>
             ) : (
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-950/40 px-6 py-3 rounded-2xl border border-white/5">
                   ĐÃ NHẬN ✅
                </div>
             )}
          </div>
          {canClaimDaily && (
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          )}
       </div>

       {/* Level Profile Card */}
       <div className="glass-card p-10 relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
          
          <div className="flex items-center gap-8 relative z-10">
             <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border-4 border-white/10 transform group-hover:rotate-6 transition-all duration-500 animate-float">🧑‍🌾</div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black text-xl border-4 border-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-pulse">
                   {levelData.level}
                </div>
             </div>
             
             <div className="flex-1">
                <h2 className="text-4xl font-black italic text-white tracking-tighter leading-none mb-2 drop-shadow-lg">{levelData.title}</h2>
                <p className="text-[10px] text-blue-400 font-black tracking-[0.3em] uppercase opacity-60 mb-6">CẤP ĐỘ CẦN THỦ {levelData.level}</p>
                
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-black opacity-50 uppercase tracking-widest">
                      <span>TIẾN TRÌNH KINH NGHIỆM</span>
                      <span className="text-blue-400">{levelData.nextCap} CÁ NỮA ĐỂ LÊN CẤP</span>
                   </div>
                   <div className="w-full h-5 bg-black/40 rounded-full border border-white/5 p-1 overflow-hidden shadow-inner relative">
                      <div 
                        ref={expRef}
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] progress-fill" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-2 gap-5">
          <div className="glass-card p-8 group hover:border-blue-500/40 transition-all">
             <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform">🌊</div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">SỰ NGHIỆP</span>
             </div>
             <div className="text-4xl font-black italic text-blue-400 mb-1 tracking-tighter group-hover:scale-105 origin-left transition-transform">{stats.totalFishCaught}</div>
             <div className="text-[10px] text-slate-500 font-black uppercase opacity-60">TỔNG CÁ ĐÃ CÂU</div>
          </div>

          <div className="glass-card p-8 group hover:border-yellow-500/40 transition-all">
             <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform">💰</div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">TÀI SẢN</span>
             </div>
             <div className="text-4xl font-black italic text-yellow-500 mb-1 tracking-tighter group-hover:scale-105 origin-left transition-transform">{gold.toLocaleString()}</div>
             <div className="text-[10px] text-slate-500 font-black uppercase opacity-60">VÀNG HIỆN CÓ</div>
          </div>
       </div>

       {/* Achievements Section */}
       <div className="glass-panel p-10 rounded-[3.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          <h3 className="text-[11px] font-black italic uppercase text-slate-500 mb-8 tracking-[0.4em] flex items-center gap-4">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></span> 
             HỒ SƠ THÀNH TÍCH
          </h3>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between glass-card p-6 border-white/5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">📈</div>
                   <div>
                      <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1.5 opacity-60">TỔNG THU NHẬP</div>
                      <div className="text-xl font-black italic text-blue-400 tracking-tighter">{stats.totalGoldEarned.toLocaleString()} <span className="text-xs not-italic ml-1">💰</span></div>
                   </div>
                </div>
                <div className="text-[9px] bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full font-black border border-blue-500/20 tracking-widest uppercase">TRỌN ĐỜI</div>
             </div>

             <div className="flex items-center justify-between glass-card p-6 border-white/5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">🦄</div>
                   <div>
                      <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1.5 opacity-60">LOÀI HIẾM NHẤT</div>
                      <div className="text-xl font-black italic text-purple-400 tracking-tighter">{stats.rarestFish || 'CHƯA CÓ'}</div>
                   </div>
                </div>
                <div className="text-[9px] bg-purple-900/30 text-purple-300 px-4 py-2 rounded-full font-black border border-purple-500/20 tracking-widest uppercase">DANH HIỆU</div>
             </div>
          </div>

          <div className="mt-12 space-y-5">
             <button 
              onClick={() => { soundManager.playClick(); onViewLeaderboard(); }}
              className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-400 transition-all active:scale-95 shadow-[0_15px_40px_rgba(245,158,11,0.25)]"
             >
                BẢNG XẾP HẠNG THẾ GIỚI
             </button>
             <button 
              onClick={() => { soundManager.playClick(); onResetData(); }}
              className="w-full py-4 text-slate-600 hover:text-red-500 transition-colors font-black text-[9px] uppercase tracking-[0.4em] text-center"
             >
                CÀI LẠI TIẾN TRÌNH TRÒ CHƠI
             </button>
          </div>
       </div>
    </div>
  );
};

export default StatsTab;
