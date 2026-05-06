
import React, { useState } from 'react';
import Header from '../ui/Header';
import BottomNav from '../ui/BottomNav';
import StatsTab from './profile/StatsTab';
import SkillsTab from './profile/SkillsTab';
import CollectionTab from './profile/CollectionTab';
import { UIView, ProfileStats, InventoryItem, PlayerSkills, Quest } from '../../core/types';

interface ProfileViewProps {
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  stats: ProfileStats;
  skills: PlayerSkills;
  unlockedFish: string[];
  levelData: { level: number; progress: number; title: string; nextCap: number };
  quests: Quest[];
  setActiveView: (view: UIView) => void;
  onSellFish: (timestamp: number) => void;
  onUpgradeCapacity: () => void;
  onResetData: () => void;
  onBuySkill: (skillId: keyof PlayerSkills) => void;
  profileTab: 'stats' | 'skills' | 'collection';
  setProfileTab: (tab: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  gold, inventory, inventoryCapacity, stats, skills, unlockedFish, levelData, quests,
  setActiveView, onSellFish, onUpgradeCapacity, onResetData, onBuySkill, profileTab, setProfileTab
}) => {

  const profileTabs = [
    { id: 'stats', label: 'HỒ SƠ', icon: '👤' },
    { id: 'skills', label: 'KỸ NĂNG', icon: '⚡' },
    { id: 'collection', label: 'SỔ TAY', icon: '📖' },
  ];

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col pointer-events-auto text-white overflow-hidden pb-24 animate-in fade-in duration-500">
      <Header title="TRANG CÁ NHÂN" gold={gold} setActiveView={setActiveView} />
      
      {/* Sub-tabs Navigation */}
      <div className="px-8 flex gap-2 my-4 bg-slate-900/40 py-3 border-b border-white/5 overflow-x-auto no-scrollbar">
        {profileTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setProfileTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all shrink-0 border ${profileTab === tab.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {profileTab === 'stats' && (
          <StatsTab 
            levelData={levelData} 
            stats={stats} 
            gold={gold} 
            onResetData={onResetData} 
            onViewLeaderboard={() => setActiveView(UIView.LEADERBOARD)} 
          />
        )}


        {profileTab === 'skills' && (
          <SkillsTab skills={skills} onBuySkill={onBuySkill} />
        )}

        {profileTab === 'collection' && (
          <CollectionTab unlockedFish={unlockedFish} />
        )}
      </div>
      <BottomNav activeView={UIView.PROFILE} setActiveView={setActiveView} quests={quests} />
    </div>
  );
};

export default ProfileView;
