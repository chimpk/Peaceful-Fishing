
import React from 'react';

interface StatsTabProps {
  levelData: { level: number; progress: number; title: string; nextCap: number };
  stats: { totalFishCaught: number; totalGoldEarned: number; rarestFish: string };
  gold: number;
  onResetData: () => void;
  onViewLeaderboard: () => void;
}

const StatsTab: React.FC<StatsTabProps> = ({ levelData, stats, gold, onResetData, onViewLeaderboard }) => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
       <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 p-10 rounded-[3.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
          
          <div className="flex items-center gap-8 relative z-10">
             <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border-4 border-white/10 transform group-hover:rotate-6 transition-all duration-500 animate-float">🧑‍🌾</div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black text-xl border-4 border-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-pulse">
                   {levelData.level}
                </div>
             </div>
             
             <div className="flex-1">
                <h2 className="text-3xl font-black italic text-white tracking-tighter leading-none mb-2">{levelData.title}</h2>
                <p className="text-[10px] text-blue-400 font-black tracking-[0.3em] uppercase opacity-60 mb-6">CẤP ĐỘ CẦN THỦ {levelData.level}</p>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black opacity-40 uppercase tracking-widest">
                      <span>KINH NGHIỆM</span>
                      <span>{levelData.nextCap} CÁ NỮA ĐỂ LÊN CẤP</span>
                   </div>
                   <div className="w-full h-4 bg-black/40 rounded-full border border-white/10 p-1 overflow-hidden shadow-inner relative">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-1000"
                        style={{ width: `${levelData.progress}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-5">
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-blue-500/40 transition-all hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-float">🌊</div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">SỰ NGHIỆP</span>
             </div>
             <div className="text-4xl font-black italic text-blue-400 mb-1 tracking-tighter">{stats.totalFishCaught}</div>
             <div className="text-[10px] text-slate-500 font-black uppercase opacity-60">TỔNG CÁ ĐÃ CÂU</div>
          </div>

          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-yellow-500/40 transition-all hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-float">💰</div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">TÀI SẢN</span>
             </div>
             <div className="text-4xl font-black italic text-yellow-500 mb-1 tracking-tighter">{gold.toLocaleString()}</div>
             <div className="text-[10px] text-slate-500 font-black uppercase opacity-60">VÀNG HIỆN CÓ</div>
          </div>
       </div>

       <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-[11px] font-black italic uppercase text-slate-500 mb-8 tracking-[0.3em] flex items-center gap-3">
             <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]"></span> 
             THÀNH TÍCH CÁ NHÂN
          </h3>
          
          <div className="space-y-5">
             <div className="flex items-center justify-between bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 hover:bg-slate-900 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📈</div>
                   <div>
                      <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">TỔNG THU NHẬP</div>
                      <div className="text-lg font-black italic text-blue-400 tracking-tight">{stats.totalGoldEarned.toLocaleString()} 💰</div>
                   </div>
                </div>
                <div className="text-[10px] bg-blue-900/40 text-blue-300 px-4 py-1.5 rounded-full font-black border border-blue-500/20 tracking-widest">TRỌN ĐỜI</div>
             </div>

             <div className="flex items-center justify-between bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 hover:bg-slate-900 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🦄</div>
                   <div>
                      <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">LOÀI HIẾM NHẤT</div>
                      <div className="text-lg font-black italic text-purple-400 tracking-tight">{stats.rarestFish || 'CHƯA CÓ'}</div>
                   </div>
                </div>
                <div className="text-[10px] bg-purple-900/40 text-purple-300 px-4 py-1.5 rounded-full font-black border border-purple-500/20 tracking-widest uppercase">HIẾM CÓ</div>
             </div>
          </div>

          <div className="mt-12 space-y-4">
             <button 
              onClick={onResetData}
              className="w-full py-5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600/20 transition-all active:scale-95"
             >
               XÓA TIẾN TRÌNH & CHƠI LẠI
             </button>
             <button 
              onClick={onViewLeaderboard}
              className="w-full py-5 bg-orange-600/10 text-orange-500 border border-orange-500/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600/20 transition-all active:scale-95 shadow-xl"
             >
               BẢNG XẾP HẠNG THI ĐẤU
             </button>
          </div>
       </div>
    </div>
  );
};

export default StatsTab;
