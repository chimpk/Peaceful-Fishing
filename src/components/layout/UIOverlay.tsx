
import React, { useState, useMemo } from 'react';
import { GameState, InventoryItem, FishType, RodType, TackleType, BaitType, UIView, ProfileStats, Achievement, Quest, PlayerSkills, LocationType, TimeOfDay, WeatherType, NotificationItem } from '../../types';

// Views
import GameView from '../views/GameView';
import ShopView from '../views/ShopView';
import QuestsView from '../views/QuestsView';
import ProfileView from '../views/ProfileView';
import ResultsView from '../views/ResultsView';
import LeaderboardView from '../views/LeaderboardView';
import InventoryView from '../views/InventoryView';

interface UIOverlayProps {
  gameState: GameState;
  activeView: UIView;
  setActiveView: (view: UIView) => void;
  gold: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  notifications: NotificationItem[];
  currentRod: RodType;
  currentTackle: TackleType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  ownedTackles: string[];
  stats: ProfileStats;
  achievements: Achievement[];
  quests: Quest[];
  startGame: () => void;
  sellAllFish: () => void;
  buyItem: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  handleSelect: (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => void;
  upgradeCapacity: () => void;
  onResetData: () => void;
  claimQuest: (id: string) => void;
  weather: WeatherType;
  sellFish: (timestamp: number) => void;
  epicCatch: { fish: { name: string; rarity: string; value: number }; isGolden: boolean } | null;
  unlockedFish: string[];
  skills: PlayerSkills;
  dailyMarketBoosts: string[];
  buySkill: (skillId: keyof PlayerSkills) => void;
  location: LocationType;
  timeOfDay: TimeOfDay;
  streak: number;
  setLocation: (loc: LocationType) => void;
  competitionMode: boolean;
  competitionTimeLeft: number;
  competitionScore: number;
  leaderboard: { score: number; date: string }[];
  startCompetition: () => void;
  liveBait: FishType | null;
  useFishAsBait: (timestamp: number) => void;
  claimDailyReward: () => void;
  handleRepair: (type: 'rod' | 'tackle') => void;
}

const UIOverlay: React.FC<UIOverlayProps> = (props) => {
  const { activeView, setActiveView, stats } = props;
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileTab, setProfileTab] = useState<'stats' | 'skills' | 'collection'>('stats');
  const [shopTab, setShopTab] = useState<'rod' | 'tackle' | 'bait'>('rod');

  const handleOpenShop = (tab: 'rod' | 'tackle' | 'bait') => {
    setShopTab(tab);
    setActiveView(UIView.SHOP);
  };

  const levelData = useMemo(() => {
    const level = stats.level || 1;
    const xp = stats.xp || 0;
    const xpToLevel = Math.floor(800 * Math.pow(1.3, level - 1));
    const progress = (xp / xpToLevel) * 100;
    
    let title = "Tân Thủ";
    if (level > 5) title = "Cần Thủ Tập Sự";
    if (level > 10) title = "Thợ Câu Lành Nghề";
    if (level > 20) title = "Bậc Thầy Đại Dương";
    if (level > 50) title = "Huyền Thoại Câu Cá";

    return { level, progress, title, xp, xpToLevel, nextCap: Math.max(0, xpToLevel - xp) };
  }, [stats.level, stats.xp]);

  const renderView = () => {
    switch (activeView) {
      case UIView.GAME:
        return (
          <GameView 
            {...props} 
            showTutorial={showTutorial} 
            setShowTutorial={setShowTutorial}
            setProfileTab={setProfileTab}
            onOpenShop={handleOpenShop}
            levelData={levelData}
          />
        );
      case UIView.SHOP:
        return <ShopView {...props} initialTab={shopTab} />;
      case UIView.QUESTS:
        return <QuestsView {...props} onClaimQuest={props.claimQuest} />;
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
      <div 
        key={activeView}
        className="absolute inset-0 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
      >
        {renderView()}
      </div>
    </div>
  );
};

export default UIOverlay;
