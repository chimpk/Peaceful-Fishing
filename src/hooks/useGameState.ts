
import { useState, useCallback, useEffect, useRef } from 'react';
import { InventoryItem, FishType, RodType, TackleType, BaitType, UIView, ProfileStats, Achievement, Rarity, Quest, PlayerSkills, NotificationItem, NotificationType } from '../types';
import { RODS, TACKLES, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from '../core/data/gameData';
import { soundManager } from '../core/systems/soundManager';

const SAVE_KEY = 'fishing_frenzy_save_v1';

export const useGameState = () => {
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryCapacity, setInventoryCapacity] = useState(20);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalGoldEarned: 0,
    totalFishCaught: 0,
    rarestFish: 'Chưa có',
    highestValue: 0,
    level: 1,
    xp: 0,
    fishCounts: {}
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [lastQuestReset, setLastQuestReset] = useState<number>(0);
  const [unlockedFish, setUnlockedFish] = useState<string[]>([]);
  const [skills, setSkills] = useState<PlayerSkills>({ 
    sharpEye: 0, fastHands: 0, lucky: 0, 
    focus: 0, powerReel: 0,
    deepSeaDiver: 0, weatherExpert: 0, masterAngler: 0 
  });
  const [dailyMarketBoosts, setDailyMarketBoosts] = useState<string[]>([]);

  const lastNotificationRef = useRef<{ message: string; timestamp: number } | null>(null);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const now = Date.now();
    // Prevent duplicate notifications within 500ms
    if (lastNotificationRef.current && 
        lastNotificationRef.current.message === message && 
        now - lastNotificationRef.current.timestamp < 500) {
      return;
    }
    lastNotificationRef.current = { message, timestamp: now };

    const id = Math.random().toString(36).substring(2, 9);
    const newNote: NotificationItem = { id, message, type, timestamp: now };
    setNotifications(prev => [...prev, newNote]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const updateStatsAndQuests = useCallback((newFish: FishType, isGolden: boolean) => {
    const finalValue = isGolden ? newFish.value * 2 : newFish.value;
    setStats(prev => {
      const isRarer = (fish: FishType, currentRarest: string) => {
        const rarities = [Rarity.JUNK, Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC];
        const fishIndex = rarities.indexOf(fish.rarity);
        const currentRarestIndex = rarities.findIndex(r => r === currentRarest);
        return fishIndex > currentRarestIndex;
      };

      const xpGains: Record<string, number> = {
        [Rarity.JUNK]: 5,
        [Rarity.COMMON]: 15,
        [Rarity.UNCOMMON]: 35,
        [Rarity.RARE]: 120,
        [Rarity.EPIC]: 350,
        [Rarity.LEGENDARY]: 1500,
        [Rarity.MYTHIC]: 6000
      };
      
      const xpGain = (xpGains[newFish.rarity] || 10) * (isGolden ? 3 : 1);
      let nextXp = (prev.xp || 0) + xpGain;
      let nextLevel = prev.level || 1;
      const xpToLevel = Math.floor(800 * Math.pow(1.3, nextLevel - 1));
      
      if (nextXp >= xpToLevel) {
        nextXp -= xpToLevel;
        nextLevel++;
        setTimeout(() => {
          addNotification(`LEVEL UP! Cấp độ mới: ${nextLevel}! +1000 vàng`, 'achievement');
          setGold(g => g + 1000);
          soundManager.playLevelUp();
          
          if (nextLevel === 15) {
            setSkills(s => ({ ...s, focus: 1 }));
            addNotification("KỸ NĂNG MỚI: TẬP TRUNG (Phím F) đã mở khóa!", "achievement");
          }
          if (nextLevel === 20) {
            setSkills(s => ({ ...s, powerReel: 1 }));
            addNotification("KỸ NĂNG MỚI: KÉO MẠNH (Phím G) đã mở khóa!", "achievement");
          }
        }, 800);
      }

      return {
        ...prev,
        totalFishCaught: prev.totalFishCaught + 1,
        highestValue: Math.max(prev.highestValue, finalValue),
        rarestFish: isRarer(newFish, prev.rarestFish) ? newFish.name : prev.rarestFish,
        level: nextLevel,
        xp: nextXp,
        fishCounts: {
          ...prev.fishCounts,
          [newFish.name]: (prev.fishCounts?.[newFish.name] || 0) + 1
        }
      };
    });

    setAchievements(prev => prev.map(ach => {
      if (ach.isCompleted) return ach;
      let newProgress = ach.progress;
      if (ach.id === 'ach_1' || ach.id === 'ach_2') newProgress++;
      if (ach.id === 'ach_4' && (newFish.rarity === Rarity.LEGENDARY || newFish.rarity === Rarity.MYTHIC)) newProgress = 1;
      
      const completed = newProgress >= ach.target;
      if (completed && !ach.isCompleted) {
        addNotification(`Thành tựu mới: ${ach.title}! +${ach.reward} vàng`, 'achievement');
        setGold(g => g + ach.reward);
        setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + ach.reward }));
        soundManager.playAchievement();
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
        addNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`, 'success');
      }
      return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
    }));
  }, [addNotification]);

  const updateEarnGoldQuest = useCallback((amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.type === 'EARN_GOLD' && !q.isCompleted) {
        const newProgress = q.progress + amount;
        const completed = newProgress >= q.target;
        if (completed && !q.isCompleted) {
          addNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`, 'success');
        }
        return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
      }
      return q;
    }));
  }, [addNotification]);

  const claimDailyReward = useCallback(() => {
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastClaimed = stats.lastDailyRewardClaimed ? new Date(stats.lastDailyRewardClaimed).setHours(0, 0, 0, 0) : 0;
    
    if (today <= lastClaimed && stats.lastDailyRewardClaimed !== 0) {
        addNotification("Bạn đã nhận quà hôm nay rồi! Hãy quay lại vào ngày mai.", "warning");
        return;
    }

    const currentStreak = (stats.dailyStreak || 0) + 1;
    const rewardGold = 1000 + (currentStreak * 500);
    const rewardBait = BAITS[Math.floor(Math.random() * BAITS.length)];

    setGold(g => g + rewardGold);
    setStats(prev => ({
      ...prev,
      dailyStreak: currentStreak,
      lastDailyRewardClaimed: now
    }));
    
    return { rewardGold, rewardBait, currentStreak };
  }, [stats.lastDailyRewardClaimed, stats.dailyStreak, addNotification]);

  const sellAllFish = useCallback(() => {
    if (inventory.length === 0) return 0;
    const totalValue = inventory.reduce((sum, item) => {
        let itemValue = item.isGolden ? item.fish.value * 2 : item.fish.value;
        if (dailyMarketBoosts.includes(item.fish.name)) itemValue *= 3;
        return sum + itemValue;
    }, 0);
    
    if (totalValue > 0) {
      setGold(prev => prev + totalValue);
      setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + totalValue }));
      updateEarnGoldQuest(totalValue);
      setInventory([]);
      addNotification(`Đã bán toàn bộ cá! Nhận được ${totalValue} vàng`, 'success');
      soundManager.playSell();
    }
    return totalValue;
  }, [inventory, dailyMarketBoosts, updateEarnGoldQuest, addNotification]);

  const sellFish = useCallback((timestamp: number) => {
    const item = inventory.find(i => i.timestamp === timestamp);
    if (!item) return;
    let value = item.isGolden ? item.fish.value * 2 : item.fish.value;
    if (dailyMarketBoosts.includes(item.fish.name)) value *= 3;
    setGold(prev => prev + value);
    setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + value }));
    updateEarnGoldQuest(value);
    setInventory(prev => prev.filter(i => i.timestamp !== timestamp));
    addNotification(`Đã bán ${item.fish.name}! +${value} vàng`, 'success');
    soundManager.playSell();
    return value;
  }, [inventory, dailyMarketBoosts, updateEarnGoldQuest, addNotification]);

  return {
    gold, setGold,
    inventory, setInventory,
    inventoryCapacity, setInventoryCapacity,
    notifications, addNotification,
    stats, setStats,
    achievements, setAchievements,
    quests, setQuests,
    lastQuestReset, setLastQuestReset,
    unlockedFish, setUnlockedFish,
    skills, setSkills,
    dailyMarketBoosts, setDailyMarketBoosts,
    updateStatsAndQuests,
    updateEarnGoldQuest,
    claimDailyReward,
    sellAllFish,
    sellFish,
    claimQuest: (questId: string) => {
      soundManager.playClick();
      const quest = quests.find(q => q.id === questId);
      if (quest && quest.isCompleted && !quest.isClaimed) {
        setGold(g => g + quest.rewardGold);
        if (quest.rewardBaitId && quest.rewardBaitCount) {
          // Note: baitCounts is in useGameSettings, so this needs to be handled in App.tsx
          // or we pass a handler to useGameState.
        }
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
        addNotification(`Đã nhận thưởng nhiệm vụ: +${quest.rewardGold} vàng!`, 'success');
        return quest; // Return quest so App.tsx can handle bait
      }
    }
  };
};
