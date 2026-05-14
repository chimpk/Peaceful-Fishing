
import React from 'react';
import Header from '../layout/Header';
import BottomNav from '../layout/BottomNav';
import { UIView, Quest } from '../../types';

interface LeaderboardViewProps {
  gold: number;
  leaderboard: { score: number; date: string }[];
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  setProfileTab?: (tab: any) => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ gold, leaderboard, quests, setActiveView, setProfileTab }) => {
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="BẢNG VÀNG CẦN THỦ" gold={gold} setActiveView={setActiveView} />
      <div className="flex-1 px-8 py-10 overflow-y-auto pb-10">
         <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            <div className="bg-white/5 p-8 flex justify-between items-center border-b border-white/10">
               <span className="text-[11px] font-black tracking-[0.3em] text-blue-400 uppercase">HẠNG / THỜI GIAN</span>
               <span className="text-[11px] font-black tracking-[0.3em] text-blue-400 uppercase">ĐIỂM KỶ LỤC</span>
            </div>
            <div className="divide-y divide-white/5">
               {leaderboard.length === 0 ? (
                 <div className="py-32 text-center flex flex-col items-center gap-6 opacity-20">
                    <div className="text-7xl">🏜️</div>
                    <p className="text-sm font-black italic tracking-widest uppercase">CHƯA CÓ DỮ LIỆU XẾP HẠNG</p>
                 </div>
               ) : (
                 leaderboard.map((entry, i) => (
                   <div key={i} className={`p-8 flex justify-between items-center transition-all hover:bg-white/5 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black animate-float' : i === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black' : i === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-700 text-black' : 'bg-slate-800 text-white border border-white/10'}`}>
                           {i + 1}
                         </div>
                         <div>
                            <div className="text-sm font-black text-white/90 italic tracking-tight">{i === 0 ? 'NHÀ VÔ ĐỊCH' : i === 1 ? 'Á QUÂN I' : i === 2 ? 'Á QUÂN II' : 'CẦN THỦ'}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.date}</div>
                         </div>
                      </div>
                      <div className={`text-3xl font-black italic tracking-tighter ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_15px_#eab308]' : 'text-white/80'}`}>{entry.score.toLocaleString()}</div>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>
      <BottomNav activeView={UIView.LEADERBOARD} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
    </div>
  );
};

export default LeaderboardView;
