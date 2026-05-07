
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
  onClaimDailyReward: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  gold, inventory, inventoryCapacity, stats, skills, unlockedFish, levelData, quests,
  setActiveView, onSellFish, onUpgradeCapacity, onResetData, onBuySkill, profileTab, setProfileTab, onClaimDailyReward
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
      <div className="px-4 md:px-8 flex flex-wrap gap-2 my-2 md:my-4 py-2 md:py-3 border-b border-white/5 bg-slate-900/40">
        {profileTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setProfileTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] tracking-widest transition-all shrink-0 border ${profileTab === tab.id ? 'bg-blue-600 border-blue-400 shadow-lg scale-105 z-10' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-sm md:text-base">{tab.icon}</span>
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
            onClaimDailyReward={onClaimDailyReward}
          />
        )}


        {profileTab === 'skills' && (
          <SkillsTab skills={skills} onBuySkill={onBuySkill} playerLevel={levelData.level} />
        )}

        {profileTab === 'collection' && (
          <CollectionTab unlockedFish={unlockedFish} fishCounts={stats.fishCounts || {}} />
        )}
      </div>
      <BottomNav activeView={UIView.PROFILE} setActiveView={setActiveView} quests={quests} />
    </div>
  );
};

export default ProfileView;
