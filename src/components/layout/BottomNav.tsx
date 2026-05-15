
import React from 'react';
import { UIView, Quest } from '../../types';
import { soundManager } from '../../core/systems/soundManager';

interface BottomNavProps {
  activeView: UIView;
  setActiveView: (view: UIView) => void;
  quests: Quest[];
  setProfileTab?: (tab: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, quests, setProfileTab }) => {
  const unclaimedQuests = quests.filter(q => q.isCompleted && !q.isClaimed).length;
  const navItems = [
    { view: UIView.GAME, label: 'TRANG CHỦ', icon: '🏠' },
    { view: UIView.SHOP, label: 'CỬA HÀNG', icon: '🏪' },
    { view: UIView.INVENTORY, label: 'TÚI ĐỒ', icon: '🎒' },
    { view: UIView.AQUARIUM, label: 'HỒ CÁ', icon: '🐠' },
    { view: UIView.QUESTS, label: 'NHIỆM VỤ', icon: '📜', badge: unclaimedQuests },
    { view: UIView.PROFILE, label: 'CÁ NHÂN', icon: '👤' },
  ];

  return (
    <div className="absolute bottom-4 md:bottom-8 inset-x-4 md:inset-x-8 h-20 md:h-24 glass-panel rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-around px-2 md:px-6 pointer-events-auto z-[60] shadow-[0_20px_100px_rgba(0,0,0,0.9)] border-white/10">
      {navItems.map(item => {
        const isActive = activeView === item.view;
        return (
          <button 
            key={item.view}
            onClick={() => { soundManager.playClick(); setActiveView(item.view); }} 
            className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-500 group py-3 md:py-4 px-3 md:px-5 rounded-[1.5rem] md:rounded-[2rem] ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/25 to-indigo-600/15 rounded-[1.25rem] md:rounded-[1.75rem] border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-in zoom-in-95 duration-500"></div>
            )}
            <div className={`relative text-xl md:text-2xl transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'group-hover:-translate-y-1 opacity-50 group-hover:opacity-100'}`}>
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 md:w-6 md:h-6 rounded-full text-[9px] md:text-[10px] font-black flex items-center justify-center border-2 md:border-4 border-slate-900 shadow-2xl animate-pulse">
                  {item.badge}
                </div>
              )}
            </div>
            <span className={`relative text-[6px] md:text-[7.5px] font-black tracking-[0.2em] md:tracking-[0.25em] uppercase transition-all duration-500 mt-1 hidden sm:block ${isActive ? 'opacity-100 text-blue-400' : 'opacity-40 text-slate-500 group-hover:opacity-100'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
