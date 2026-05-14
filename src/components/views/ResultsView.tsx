
import React from 'react';
import { UIView } from '../../types';

interface ResultsViewProps {
  competitionScore: number;
  setActiveView: (view: UIView) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ competitionScore, setActiveView }) => {
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center pointer-events-auto text-white p-10 z-[200] overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-600/10 rounded-full blur-[150px] animate-pulse"></div>
      
      <div className="relative max-w-lg w-full bg-slate-900/40 backdrop-blur-3xl border-2 border-orange-500/50 rounded-[4rem] p-12 flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-20 duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
         <div className="text-8xl mb-8 animate-float">🏆</div>
         <h2 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-orange-600 mb-3 tracking-tighter drop-shadow-2xl">HẾT GIỜ!</h2>
         <p className="text-[11px] text-white/40 font-black tracking-[0.5em] uppercase mb-12">THÀNH TÍCH THI ĐẤU CỦA BẠN</p>
         
         <div className="w-full bg-slate-950/60 rounded-[2.5rem] p-10 mb-12 border border-white/10 shadow-inner group">
            <div className="text-[10px] text-orange-400 font-black tracking-[0.3em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">TỔNG ĐIỂM TÍCH LŨY</div>
            <div className="text-6xl font-black italic text-white tracking-tighter mb-4 drop-shadow-2xl">{competitionScore.toLocaleString()}</div>
            <div className="inline-block px-6 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-500 font-black text-xs tracking-widest italic animate-pulse">
              XẾP HẠNG TRONG TOP 10
            </div>
         </div>

         <div className="flex flex-col gap-5 w-full">
            <button 
              onClick={() => setActiveView(UIView.LEADERBOARD)}
              className="group relative w-full py-6 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all active:scale-95 shadow-[0_20px_50px_rgba(234,88,12,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                 XEM BẢNG VÀNG <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button 
              onClick={() => setActiveView(UIView.GAME)}
              className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-3xl font-black text-[11px] text-slate-400 uppercase tracking-[0.3em] transition-all active:scale-90 border border-white/5"
            >
              QUAY LẠI TRANG CHỦ
            </button>
         </div>
      </div>
    </div>
  );
};

export default ResultsView;
