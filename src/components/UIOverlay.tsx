
import React, { useState, useMemo } from 'react';
import { GameState, InventoryItem, FishType, RodType, BaitType, UIView, ProfileStats, Achievement, Quest, PlayerSkills, LocationType, TimeOfDay } from '../core/types';

// Views
import GameView from './views/GameView';
import ShopView from './views/ShopView';
import QuestsView from './views/QuestsView';
import ProfileView from './views/ProfileView';
import ResultsView from './views/ResultsView';
import LeaderboardView from './views/LeaderboardView';
import InventoryView from './views/InventoryView';

interface UIOverlayProps {
  gameState: GameState;
  activeView: UIView;
  setActiveView: (view: UIView) => void;
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  notification: string | null;
  currentRod: RodType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  stats: ProfileStats;
  achievements: Achievement[];
  quests: Quest[];
  onStart: () => void;
  onSellAll: () => void;
  onBuy: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  onSelect: (item: RodType | BaitType, type: 'rod' | 'bait') => void;
  onUpgradeCapacity: () => void;
  onResetData: () => void;
  onClaimQuest: (id: string) => void;
  weather: 'sunny' | 'rainy' | 'stormy';
  onSellFish: (timestamp: number) => void;
  epicCatch: { fish: { name: string; rarity: string; value: number }; isGolden: boolean } | null;
  unlockedFish: string[];
  skills: PlayerSkills;
  dailyMarketBoosts: string[];
  onBuySkill: (skillId: keyof PlayerSkills) => void;
  location: LocationType;
  timeOfDay: TimeOfDay;
  streak: number;
  onChangeLocation: (loc: LocationType) => void;
  competitionMode: boolean;
  competitionTimeLeft: number;
  competitionScore: number;
  leaderboard: { score: number; date: string }[];
  onStartCompetition: () => void;
  liveBait: FishType | null;
  onUseAsBait: (timestamp: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = (props) => {
  const { activeView, setActiveView, stats, gold, quests } = props;
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileTab, setProfileTab] = useState<'stats' | 'inventory' | 'skills' | 'collection'>('stats');

  const levelData = useMemo(() => {
    const level = Math.floor(Math.sqrt(stats.totalFishCaught)) + 1;
    const currentLevelExp = Math.pow(level - 1, 2);
    const nextLevelExp = Math.pow(level, 2);
    const totalForNext = nextLevelExp - currentLevelExp;
    const currentInLevel = stats.totalFishCaught - currentLevelExp;
    const progress = totalForNext > 0 ? (currentInLevel / totalForNext) * 100 : 100;
    
    let title = "Tân Thủ";
    if (level > 5) title = "Cần Thủ Tập Sự";
    if (level > 10) title = "Thợ Câu Lành Nghề";
    if (level > 20) title = "Bậc Thầy Đại Dương";
    if (level > 50) title = "Huyền Thoại Câu Cá";

    return { level, progress, title, nextCap: Math.max(0, nextLevelExp - stats.totalFishCaught) };
  }, [stats.totalFishCaught]);

  const renderView = () => {
    switch (activeView) {
      case UIView.GAME:
        return (
          <GameView 
            {...props} 
            showTutorial={showTutorial} 
            setShowTutorial={setShowTutorial}
            setProfileTab={setProfileTab}
          />
        );
      case UIView.SHOP:
        return <ShopView {...props} />;
      case UIView.QUESTS:
        return <QuestsView {...props} />;
      case UIView.PROFILE:
        return (
          <ProfileView 
            {...props} 
            levelData={levelData} 
            profileTab={profileTab}
            setProfileTab={setProfileTab}
          />
        );
      case UIView.INVENTORY:
        return <InventoryView {...props} />;
      case UIView.RESULTS:
        return <ResultsView {...props} />;
      case UIView.LEADERBOARD:
        return <LeaderboardView {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      {renderView()}
    </div>
  );
};

export default UIOverlay;
