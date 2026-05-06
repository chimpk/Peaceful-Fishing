
import React from 'react';
import Header from '../ui/Header';
import BottomNav from '../ui/BottomNav';
import { UIView, Quest } from '../../core/types';

interface QuestsViewProps {
  gold: number;
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  onClaimQuest: (id: string) => void;
  setProfileTab?: (tab: any) => void;
}

const QuestsView: React.FC<QuestsViewProps> = ({ gold, quests, setActiveView, onClaimQuest, setProfileTab }) => {
  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="NHIỆM VỤ HÀNG NGÀY" gold={gold} setActiveView={setActiveView} />
      <div className="px-8 py-6">
        <h2 className="text-sm font-black text-blue-400 tracking-widest uppercase opacity-70">HOÀN THÀNH ĐỂ NHẬN QUÀ</h2>
      </div>
      <div className="flex-1 px-8 space-y-5 overflow-y-auto pb-10">
        {quests.map(q => {
          const progressPercent = (q.progress / q.target) * 100;
          return (
            <div key={q.id} className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden group ${q.isClaimed ? 'bg-slate-900/20 border-white/5 opacity-40' : q.isCompleted ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.1)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className={`text-xl font-black italic tracking-tight mb-1 ${q.isCompleted ? 'text-green-400' : 'text-white'}`}>{q.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[80%]">{q.description}</p>
                </div>
                <div className="flex flex-col items-end bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/5">
                  <span className="text-xs font-black text-yellow-500">+{q.rewardGold} 💰</span>
                  {q.rewardBaitId && (
                    <span className="text-[10px] font-black text-green-400">+{q.rewardBaitCount} Mồi</span>
                  )}
                </div>
              </div>
              
              <div className="relative w-full h-5 bg-black/40 rounded-full overflow-hidden border border-white/10 p-1 mb-6">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${q.isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`} 
                  style={{ width: `${progressPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest opacity-80 drop-shadow-md">
                  {q.progress} / {q.target}
                </span>
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${q.isCompleted ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-40">{q.isClaimed ? 'ĐÃ XONG' : q.isCompleted ? 'CHỜ NHẬN' : 'ĐANG LÀM'}</span>
                 </div>
                {q.isClaimed ? (
                  <span className="text-[10px] font-black text-slate-600 italic">REWARDED</span>
                ) : q.isCompleted ? (
                  <button 
                    onClick={() => onClaimQuest(q.id)}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_10px_30px_rgba(234,179,8,0.3)] active:scale-95 animate-glow"
                  >
                    NHẬN THƯỞNG
                  </button>
                ) : (
                  <div className="text-[10px] font-black text-blue-400/40 italic">IN PROGRESS</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav activeView={UIView.QUESTS} setActiveView={setActiveView} quests={quests} setProfileTab={setProfileTab} />
    </div>
  );
};

export default QuestsView;
