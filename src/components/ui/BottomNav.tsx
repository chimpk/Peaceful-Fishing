
import React from 'react';
import { UIView, Quest } from '../../core/types';

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
    { view: UIView.QUESTS, label: 'NHIỆM VỤ', icon: '📜', badge: unclaimedQuests },
    { view: UIView.PROFILE, label: 'CÁ NHÂN', icon: '👤' },
  ];

  return (
    <div className="absolute bottom-0 inset-x-0 h-28 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-6 pointer-events-auto z-[60] shadow-[0_-30px_100px_rgba(0,0,0,0.8)]">
      {navItems.map(item => {
        const isActive = activeView === item.view;
        return (
          <button 
            key={item.view}
            onClick={() => setActiveView(item.view)} 
            className={`relative flex flex-col items-center justify-center gap-2 transition-all duration-500 group py-4 px-2 rounded-3xl ${isActive ? 'text-white' : 'text-slate-500 hover:text-white'}`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-blue-600/10 rounded-3xl border border-blue-500/20 animate-in zoom-in-90 duration-300"></div>
            )}
            <div className={`relative text-2xl transition-all duration-500 ${isActive ? 'scale-125 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100'}`}>
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <div className="absolute -top-3 -right-3 bg-red-600 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-slate-950 animate-bounce shadow-xl">
                  {item.badge}
                </div>
              )}
            </div>
            <span className={`relative text-[8px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_15px_#3b82f6] animate-pulse"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
