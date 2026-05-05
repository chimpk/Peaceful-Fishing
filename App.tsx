
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, InventoryItem, FishType, RodType, BaitType, UIView, ProfileStats, Achievement, Rarity, Quest, PlayerSkills } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RODS, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from './gameData';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { soundManager } from './soundManager';

const SAVE_KEY = 'fishing_frenzy_save_v1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeView, setActiveView] = useState<UIView>(UIView.GAME);
  
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryCapacity, setInventoryCapacity] = useState(20);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentRod, setCurrentRod] = useState<RodType>(RODS[0]);
  const [currentBait, setCurrentBait] = useState<BaitType>(BAITS[0]);
  const [ownedRods, setOwnedRods] = useState<string[]>(['rod_1']);
  const [baitCounts, setBaitCounts] = useState<Record<string, number>>({ 'bait_1': 10 });
  const [stats, setStats] = useState<ProfileStats>({
    totalGoldEarned: 0,
    totalFishCaught: 0,
    rarestFish: 'Chưa có',
    highestValue: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [lastQuestReset, setLastQuestReset] = useState<number>(0);
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'stormy'>('sunny');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [epicCatch, setEpicCatch] = useState<{ fish: FishType; isGolden: boolean } | null>(null);
  const [unlockedFish, setUnlockedFish] = useState<string[]>([]);
  const [skills, setSkills] = useState<PlayerSkills>({ sharpEye: 0, fastHands: 0, lucky: 0 });
  const [dailyMarketBoosts, setDailyMarketBoosts] = useState<string[]>([]);

  // --- PERSISTENCE LOGIC ---
  
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.gold !== undefined) setGold(data.gold);
        if (data.inventory) setInventory(data.inventory);
        if (data.inventoryCapacity) setInventoryCapacity(data.inventoryCapacity);
        if (data.ownedRods) setOwnedRods(data.ownedRods);
        if (data.baitCounts) setBaitCounts(data.baitCounts);
        if (data.stats) setStats(data.stats);
        if (data.achievements) setAchievements(data.achievements);
        if (data.unlockedFish) setUnlockedFish(data.unlockedFish);
        if (data.skills) setSkills(data.skills);
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (!data.lastQuestReset || now - data.lastQuestReset > oneDay) {
          setQuests(generateDailyQuests());
          setLastQuestReset(now);
          const fishNames = FISH_TYPES.map(f => f.name);
          const boosts = [];
          for (let i = 0; i < 3; i++) {
             boosts.push(fishNames[Math.floor(Math.random() * fishNames.length)]);
          }
          setDailyMarketBoosts(boosts);
        } else {
          setQuests(data.quests || generateDailyQuests());
          setLastQuestReset(data.lastQuestReset);
          setDailyMarketBoosts(data.dailyMarketBoosts || []);
        }

        if (data.currentRodId) {
          const rod = RODS.find(r => r.id === data.currentRodId);
          if (rod) setCurrentRod(rod);
        }
        if (data.currentBaitId) {
          const bait = BAITS.find(b => b.id === data.currentBaitId);
          if (bait) setCurrentBait(bait);
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu bản lưu:", e);
      }
    } else {
      setGold(500);
      setStats(s => ({ ...s, totalGoldEarned: 500 }));
      setQuests(generateDailyQuests());
      setLastQuestReset(Date.now());
      const fishNames = FISH_TYPES.map(f => f.name);
      const boosts = [];
      for (let i = 0; i < 3; i++) {
         boosts.push(fishNames[Math.floor(Math.random() * fishNames.length)]);
      }
      setDailyMarketBoosts(boosts);
    }
    
    // Random weather on load
    const weathers: ('sunny' | 'rainy' | 'stormy')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy'];
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const dataToSave = {
      gold,
      inventory,
      inventoryCapacity,
      ownedRods,
      baitCounts,
      stats,
      achievements,
      quests,
      lastQuestReset,
      currentRodId: currentRod.id,
      currentBaitId: currentBait.id,
      unlockedFish,
      skills,
      dailyMarketBoosts
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [gold, inventory, inventoryCapacity, ownedRods, baitCounts, stats, achievements, quests, lastQuestReset, currentRod, currentBait, isDataLoaded, unlockedFish, skills, dailyMarketBoosts]);

  const handleResetData = useCallback(() => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ tiến trình và chơi lại từ đầu?")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  }, []);

  // --- GAMEPLAY LOGIC ---

  const updateStatsAndQuests = useCallback((newFish: FishType, isGolden: boolean) => {
    const finalValue = isGolden ? newFish.value * 2 : newFish.value;
    setStats(prev => {
      const isRarer = (fish: FishType, currentRarest: string) => {
        const rarities = [Rarity.JUNK, Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC];
        const fishIndex = rarities.indexOf(fish.rarity);
        const currentRarestIndex = rarities.findIndex(r => r === currentRarest);
        return fishIndex > currentRarestIndex;
      };

      return {
        ...prev,
        totalFishCaught: prev.totalFishCaught + 1,
        highestValue: Math.max(prev.highestValue, finalValue),
        rarestFish: isRarer(newFish, prev.rarestFish) ? newFish.name : prev.rarestFish
      };
    });

    setAchievements(prev => prev.map(ach => {
      if (ach.isCompleted) return ach;
      let newProgress = ach.progress;
      if (ach.id === 'ach_1' || ach.id === 'ach_2') newProgress++;
      if (ach.id === 'ach_4' && (newFish.rarity === Rarity.LEGENDARY || newFish.rarity === Rarity.MYTHIC)) newProgress = 1;
      
      const completed = newProgress >= ach.target;
      if (completed && !ach.isCompleted) {
        setNotification(`Thành tựu mới: ${ach.title}! +${ach.reward} vàng`);
        setGold(g => g + ach.reward);
        setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + ach.reward }));
      }
      return { ...ach, progress: newProgress, isCompleted: completed };
    }));

    setQuests(prev => prev.map(q => {
      if (q.isCompleted) return q;
      let newProgress = q.progress;
      if (q.type === 'CATCH_TOTAL') newProgress++;
      if (q.type === 'CATCH_SPECIFIC' && q.fishTarget === newFish.name) newProgress++;
      
      const completed = newProgress >= q.target;
      if (completed && !q.isCompleted) {
        setNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`);
      }
      return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
    }));
  }, []);

  const consumeBait = useCallback(() => {
    setBaitCounts(prev => {
      const currentCount = prev[currentBait.id] || 0;
      if (currentCount <= 0) return prev;
      return { ...prev, [currentBait.id]: currentCount - 1 };
    });
  }, [currentBait.id]);

  const startGame = () => {
    try { soundManager.playClick(); } catch(e) {}
    try { (soundManager as any).startAmbient?.(); } catch(e) {}
    const count = baitCounts[currentBait.id] || 0;
    if (count <= 0) {
      setNotification("Hết mồi câu rồi! Hãy mua thêm ở Cửa hàng.");
      setTimeout(() => setNotification(null), 3000);
      // Vẫn cho vào game - không block người dùng
    }
    setGameState(GameState.IDLE);
    setActiveView(UIView.GAME);
  };

  const addFishToInventory = useCallback((fish: FishType, isGolden: boolean) => {
    if (inventory.length >= inventoryCapacity) {
      setNotification("Túi đồ đã đầy! Hãy bán bớt cá hoặc nâng cấp túi.");
      setGameState(GameState.IDLE);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    consumeBait(); 
    setInventory(prev => [{ fish, timestamp: Date.now(), isGolden }, ...prev]);
    const finalValue = isGolden ? fish.value * 2 : fish.value;
    
    const isEpic = fish.rarity === Rarity.LEGENDARY || fish.rarity === Rarity.MYTHIC || isGolden;
    if (isEpic) {
        soundManager.playSuccess();
        setEpicCatch({ fish, isGolden });
        setTimeout(() => setEpicCatch(null), 3500);
    }
    
    let bonusMessage = "";
    setUnlockedFish(prev => {
       if (!prev.includes(fish.name)) {
          const bonus = fish.value * 5;
          bonusMessage = `\n(Mới! +${bonus} vàng)`;
          setGold(g => g + bonus);
          return [...prev, fish.name];
       }
       return prev;
    });

    setNotification(`Bắt được ${isGolden ? 'CÁ VÀNG ' : ''}${fish.name}! +${finalValue} vàng${bonusMessage}`);
    setGameState(GameState.CAUGHT);
    updateStatsAndQuests(fish, isGolden);
    
    setTimeout(() => {
      setNotification(null);
      setGameState(GameState.IDLE);
    }, 2500);
  }, [consumeBait, updateStatsAndQuests, inventory.length, inventoryCapacity]);

  const onFishLost = useCallback((reason: string = "Cá đã thoát rồi...") => {
    consumeBait(); 
    setNotification(reason);
    setGameState(GameState.IDLE);
    setTimeout(() => setNotification(null), 2000);
  }, [consumeBait]);

  const sellAllFish = () => {
    const totalValue = inventory.reduce((sum, item) => {
        let itemValue = item.isGolden ? item.fish.value * 2 : item.fish.value;
        if (dailyMarketBoosts.includes(item.fish.name)) itemValue *= 3;
        return sum + itemValue;
    }, 0);
    if (totalValue > 0) {
      setGold(prev => prev + totalValue);
      setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + totalValue }));
      
      setQuests(prev => prev.map(q => {
        if (q.type === 'EARN_GOLD' && !q.isCompleted) {
          const newProgress = q.progress + totalValue;
          const completed = newProgress >= q.target;
          if (completed && !q.isCompleted) {
            setNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`);
          }
          return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
        }
        return q;
      }));

      setAchievements(prev => prev.map(ach => {
        if (ach.id === 'ach_3' && !ach.isCompleted) {
          const newProgress = Math.min(ach.target, stats.totalGoldEarned + totalValue);
          const completed = newProgress >= ach.target;
          if (completed) {
            setNotification(`Thành tựu mới: ${ach.title}! +${ach.reward} vàng`);
            setGold(g => g + ach.reward);
            setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + ach.reward }));
          }
          return { ...ach, progress: newProgress, isCompleted: completed };
        }
        return ach;
      }));

      setInventory([]);
      setNotification(`Đã bán toàn bộ cá! Nhận được ${totalValue} vàng`);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const sellFish = (timestamp: number) => {
    const item = inventory.find(i => i.timestamp === timestamp);
    if (!item) return;
    let value = item.isGolden ? item.fish.value * 2 : item.fish.value;
    if (dailyMarketBoosts.includes(item.fish.name)) value *= 3;
    setGold(prev => prev + value);
    setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + value }));
    setInventory(prev => prev.filter(i => i.timestamp !== timestamp));
    setQuests(prev => prev.map(q => {
      if (q.type === 'EARN_GOLD' && !q.isCompleted) {
        const newProgress = q.progress + value;
        const completed = newProgress >= q.target;
        return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
      }
      return q;
    }));
    setNotification(`Đã bán ${item.fish.name}! +${value} vàng`);
    setTimeout(() => setNotification(null), 1500);
  };

  const claimQuest = (questId: string) => {
    soundManager.playClick();
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.isCompleted && !quest.isClaimed) {
      setGold(g => g + quest.rewardGold);
      if (quest.rewardBaitId && quest.rewardBaitCount) {
        setBaitCounts(prev => ({
          ...prev,
          [quest.rewardBaitId!]: (prev[quest.rewardBaitId!] || 0) + quest.rewardBaitCount!
        }));
      }
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
      setNotification(`Đã nhận thưởng nhiệm vụ: +${quest.rewardGold} vàng!`);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const buyItem = (item: RodType | BaitType, type: 'rod' | 'bait') => {
    if (gold >= item.price) {
      setGold(prev => prev - item.price);
      if (type === 'rod') {
        setOwnedRods(prev => [...prev, item.id]);
        setCurrentRod(item as RodType);
      } else {
        const bait = item as BaitType;
        const addCount = bait.count || 1;
        setBaitCounts(prev => ({
          ...prev,
          [bait.id]: (prev[bait.id] || 0) + addCount
        }));
        setCurrentBait(bait); 
      }
      setNotification(`Đã mua ${item.name}!`);
      setTimeout(() => setNotification(null), 2000);
    } else {
      setNotification('Không đủ tiền!');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const selectItem = (item: RodType | BaitType, type: 'rod' | 'bait') => {
    soundManager.playClick();
    if (type === 'rod') {
      setCurrentRod(item as RodType);
    } else {
      setCurrentBait(item as BaitType);
    }
  };

  const upgradeCapacity = () => {
    const cost = inventoryCapacity * 100;
    if (gold >= cost) {
      setGold(prev => prev - cost);
      setInventoryCapacity(prev => prev + 5);
      setNotification(`Đã nâng cấp túi đồ lên ${inventoryCapacity + 5} ô!`);
      setTimeout(() => setNotification(null), 2000);
    } else {
      setNotification('Không đủ tiền nâng cấp!');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const buySkill = (skillId: keyof PlayerSkills) => {
     const currentLevel = skills[skillId];
     const cost = (currentLevel + 1) * 2000;
     if (gold >= cost) {
        setGold(prev => prev - cost);
        setSkills(prev => ({ ...prev, [skillId]: currentLevel + 1 }));
        setNotification(`Đã nâng cấp kỹ năng!`);
        setTimeout(() => setNotification(null), 2000);
     } else {
        setNotification('Không đủ tiền nâng cấp!');
        setTimeout(() => setNotification(null), 2000);
     }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-[#0a0f1d]">
      <div 
        className="relative bg-[#0f172a] rounded-3xl shadow-2xl border-4 border-[#1e293b] overflow-hidden"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {activeView === UIView.GAME && (
          <GameCanvas 
            gameState={gameState} 
            setGameState={setGameState}
            onFishCaught={addFishToInventory}
            onFishLost={onFishLost}
            currentRod={currentRod}
            currentBait={currentBait}
            weather={weather}
            skills={skills}
          />
        )}
        
        <UIOverlay 
          gameState={gameState}
          activeView={activeView}
          setActiveView={setActiveView}
          gold={gold}
          inventory={inventory}
          inventoryCapacity={inventoryCapacity}
          notification={notification}
          currentRod={currentRod}
          currentBait={currentBait}
          baitCounts={baitCounts}
          ownedRods={ownedRods}
          stats={stats}
          achievements={achievements}
          quests={quests}
          onStart={startGame}
          onSellAll={sellAllFish}
          onSellFish={sellFish}
          onBuy={buyItem}
          onSelect={selectItem}
          onUpgradeCapacity={upgradeCapacity}
          onResetData={handleResetData}
          onClaimQuest={claimQuest}
          weather={weather}
          epicCatch={epicCatch}
          unlockedFish={unlockedFish}
          skills={skills}
          dailyMarketBoosts={dailyMarketBoosts}
          onBuySkill={buySkill}
        />
      </div>
    </div>
  );
};

export default App;
