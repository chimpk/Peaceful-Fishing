
import React from 'react';
import { UIView } from '../../core/types';
import { soundManager } from '../../core/soundManager';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  gold: number;
  setActiveView: (view: UIView) => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = true, gold, setActiveView }) => {
  return (
    <div className="flex items-center justify-between p-7 bg-slate-950/40 backdrop-blur-3xl border-b border-white/5 z-50 sticky top-0">
      <div className="flex items-center gap-7">
        {showBack && (
          <button 
            onClick={() => { soundManager.playClick(); setActiveView(UIView.GAME); }}
            className="w-14 h-14 rounded-[1.25rem] glass-card flex items-center justify-center text-white transition-all pointer-events-auto border border-white/10 active:scale-90"
          >
            <span className="text-2xl text-blue-400">←</span>
          </button>
        )}
        <div className="flex flex-col relative">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
            <h1 className="text-3xl font-black tracking-tighter text-white italic drop-shadow-2xl leading-none uppercase">{title}</h1>
          </div>
          <p className="text-[9px] text-slate-500 font-bold tracking-[0.4em] uppercase mt-1.5 ml-5 opacity-60">Fishing Frenzy Elite System</p>
        </div>
      </div>
      <div className="glass-card px-7 py-4 flex items-center gap-5 pointer-events-auto shadow-2xl group cursor-default">
        <div className="w-11 h-11 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform duration-500">💰</div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase leading-none mb-1.5">TÀI KHOẢN</span>
          <span className="text-2xl font-black italic text-white tracking-tighter leading-none group-hover:text-yellow-400 transition-colors duration-300 drop-shadow-md">
            {gold.toLocaleString()}<span className="text-xs ml-1 text-yellow-500/50 not-italic uppercase tracking-tighter">Gold</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
