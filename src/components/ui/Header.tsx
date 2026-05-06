
import React from 'react';
import { UIView } from '../../core/types';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  gold: number;
  setActiveView: (view: UIView) => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = true, gold, setActiveView }) => {
  return (
    <div className="flex items-center justify-between p-7 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 z-50">
      <div className="flex items-center gap-7">
        {showBack && (
          <button 
            onClick={() => setActiveView(UIView.GAME)}
            className="w-14 h-14 rounded-[1.25rem] bg-slate-900/80 flex items-center justify-center text-white hover:bg-blue-600 transition-all pointer-events-auto border border-white/10 active:scale-90 shadow-2xl hover:shadow-blue-500/30"
          >
            <span className="text-2xl">←</span>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-white italic drop-shadow-2xl leading-none">{title}</h1>
          <div className="h-1 w-12 bg-blue-600 rounded-full mt-2"></div>
        </div>
      </div>
      <div className="bg-slate-900/90 backdrop-blur-xl px-6 py-3.5 rounded-2xl flex items-center gap-4 border border-white/10 pointer-events-auto shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-blue-500/30 transition-all group">
        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">💰</div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase leading-none mb-1">VÀNG</span>
          <span className="text-xl font-black italic text-white tracking-tight leading-none group-hover:text-yellow-400 transition-colors">{gold.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
