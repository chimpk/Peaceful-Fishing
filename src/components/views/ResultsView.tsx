
import React from 'react';
import { UIView } from '../../types';
import { soundManager } from '../../core/systems/soundManager';

interface ResultsViewProps {
  competitionScore: number;
  setActiveView: (view: UIView) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ competitionScore, setActiveView }) => {
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center pointer-events-auto text-white z-[200] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-orange-600/10 rounded-full blur-[180px] animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.9)_100%)]"></div>
      </div>
      
      {/* Rotating Light Rays (Amber Theme) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(245,158,11,0.3)_10%,_transparent_20%,_rgba(245,158,11,0.3)_30%,_transparent_40%,_rgba(245,158,11,0.3)_50%,_transparent_60%,_rgba(245,158,11,0.3)_70%,_transparent_80%,_rgba(245,158,11,0.3)_90%,_transparent_100%)] animate-ray"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {[...Array(8)].map((_, i) => (
           <div 
             key={i} 
             className="absolute bg-orange-400/10 rounded-full blur-sm animate-float"
             style={{
               width: Math.random() * 60 + 20,
               height: Math.random() * 60 + 20,
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animationDelay: `${Math.random() * 5}s`,
               animationDuration: `${Math.random() * 4 + 4}s`
             }}
           />
         ))}
      </div>

      <div className="relative max-w-lg w-full bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-20 duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
         <div className="relative mb-10">
            <div className="text-8xl animate-float filter drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">🏆</div>
            <div className="absolute inset-0 blur-3xl bg-orange-500/20 rounded-full -z-10 animate-pulse"></div>
         </div>

         <div className="mb-10">
           <h2 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-300 to-orange-600 tracking-tighter drop-shadow-2xl leading-tight">HẾT GIỜ!</h2>
           <div className="flex items-center justify-center gap-3 mt-2">
             <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
             <p className="text-[10px] text-white/30 font-black tracking-[0.4em] uppercase">THÀNH TÍCH THI ĐẤU</p>
             <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
           </div>
         </div>
         
         <div className="w-full bg-black/40 backdrop-blur-md rounded-[3rem] p-10 mb-10 border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Subtle inner light */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="text-[10px] text-orange-400/60 font-black tracking-[0.3em] uppercase mb-4">TỔNG ĐIỂM TÍCH LŨY</div>
            <div className="text-7xl font-black italic text-white tracking-tighter mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
               {competitionScore.toLocaleString()}
            </div>
            
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-500/5 rounded-full border border-yellow-500/10 text-yellow-500 font-black text-[10px] tracking-widest italic animate-pulse">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
              XẾP HẠNG TRONG TOP 10
            </div>
         </div>

         <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => { soundManager.playClick(); setActiveView(UIView.LEADERBOARD); }}
              className="group relative w-full py-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(234,88,12,0.3)] animate-shimmer overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                 XEM BẢNG VÀNG 
                 <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            <button 
              onClick={() => { soundManager.playClick(); setActiveView(UIView.GAME); }}
              className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-[2rem] font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] transition-all hover:text-white border border-white/5 active:scale-95"
            >
              QUAY LẠI TRANG CHỦ
            </button>
         </div>
      </div>
    </div>
  );
};

export default ResultsView;
