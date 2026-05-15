
import { useState, useCallback, useEffect, useRef } from 'react';
import { InventoryItem, AquariumItem, FishType, UIView, ProfileStats, Achievement, Rarity, Quest, PlayerSkills, NotificationItem, NotificationType } from '../types';
import { BAITS, INITIAL_ACHIEVEMENTS } from '../core/data/gameData';
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
  const [aquarium, setAquarium] = useState<AquariumItem[]>([]);
  const [autoSellJunk, setAutoSellJunk] = useState<boolean>(false);
  const [lastAquariumUpdate, setLastAquariumUpdate] = useState<number>(Date.now());

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

  // Passive Income from Aquarium (Calculated based on time delta)
  const calculateHourlyRate = useCallback(() => {
    const rarityIncome: Record<string, number> = {
        [Rarity.COMMON]: 20,
        [Rarity.UNCOMMON]: 60,
        [Rarity.RARE]: 200,
        [Rarity.EPIC]: 600,
        [Rarity.LEGENDARY]: 2000,
        [Rarity.MYTHIC]: 10000
    };
    
    let totalRate = 0;
    aquarium.forEach(item => {
        const base = rarityIncome[item.fish.rarity] || 0;
        totalRate += item.isGolden ? base * 3 : base;
    });
    return totalRate;
  }, [aquarium]);

  useEffect(() => {
    if (aquarium.length === 0) return;
    
    const interval = setInterval(() => {
        const now = Date.now();
        const hourlyRate = calculateHourlyRate();
        
        // Calculate delta since last update
        const deltaMs = now - lastAquariumUpdate;
        const maxDelta = 6 * 60 * 60 * 1000; // 6 hours cap
        const effectiveDelta = Math.min(deltaMs, maxDelta);
        
        // Income = (rate / hour) * (effectiveDelta / ms_in_hour)
        const income = Math.floor(hourlyRate * (effectiveDelta / (60 * 60 * 1000)));

        if (income > 0) {
            setGold(prev => prev + income);
            setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + income }));
            setLastAquariumUpdate(now);
        }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [aquarium, lastAquariumUpdate, calculateHourlyRate]);

  const updateStatsAndQuests = useCallback((newFish: FishType, isGolden: boolean) => {
    const finalValue = isGolden ? newFish.value * 2 : newFish.value;
    setStats(prev => {
      const isRarer = (fish: FishType, currentRarest: string) => {
        const rarities = [Rarity.JUNK, Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC];
        const fishIndex = rarities.indexOf(fish.rarity);
        // 'Chưa có' không thuộc enum Rarity → findIndex trả về -1, fishIndex luôn > -1 → đúng
        const currentRarestIndex = rarities.indexOf(currentRarest as Rarity);
        return fishIndex > currentRarestIndex;
      };

      const xpGains: Record<string, number> = {
        [Rarity.JUNK]: 2,
        [Rarity.COMMON]: 8,
        [Rarity.UNCOMMON]: 20,
        [Rarity.RARE]: 50,
        [Rarity.EPIC]: 120,
        [Rarity.LEGENDARY]: 350,
        [Rarity.MYTHIC]: 1000
      };
      
      const xpGain = (xpGains[newFish.rarity] || 10) * (isGolden ? 3 : 1);
      let nextXp = (prev.xp || 0) + xpGain;
      let nextLevel = prev.level || 1;
      const levelsGained: number[] = [];

      // While loop: hỗ trợ level-up nhiều cấp trong một lần câu
      let xpToLevel = 1000 + (nextLevel - 1) * 500;
      while (nextXp >= xpToLevel) {
        nextXp -= xpToLevel;
        nextLevel++;
        levelsGained.push(nextLevel);
        xpToLevel = 1000 + (nextLevel - 1) * 500;
      }

        if (levelsGained.length > 0) {
        setTimeout(() => {
          const goldReward = levelsGained.length * 250;
          addNotification(
            levelsGained.length > 1
              ? `LEVEL UP x${levelsGained.length}! Cấp độ mới: ${nextLevel}! +${goldReward} vàng`
              : `LEVEL UP! Cấp độ mới: ${nextLevel}! +250 vàng`,
            'achievement'
          );
          setGold(g => g + goldReward);
          soundManager.playLevelUp();

          // Kiểm tra mở kỹ năng theo từng level đã tăng
          if (levelsGained.includes(15)) {
            setSkills(s => ({ ...s, focus: 1 }));
            addNotification("KỸ NĂNG MỚI: TẬP TRUNG (Phím F) đã mở khóa!", "achievement");
          }
          if (levelsGained.includes(20)) {
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
        const normalCount = item.count - item.goldenCount;
        const normalValue = normalCount * item.fish.value;
        const goldenValue = item.goldenCount * item.fish.value * 2;
        let itemValue = normalValue + goldenValue;
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

    const hasNormal = item.count - item.goldenCount > 0;
    const isSellingGolden = !hasNormal && item.goldenCount > 0;
    let value = isSellingGolden ? item.fish.value * 2 : item.fish.value;
    if (dailyMarketBoosts.includes(item.fish.name)) value *= 3;

    setGold(prev => prev + value);
    setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + value }));
    updateEarnGoldQuest(value);

    setInventory(prev => prev.reduce<InventoryItem[]>((arr, i) => {
      if (i.timestamp !== timestamp) return [...arr, i];

      const nextCount = i.count - 1;
      const nextGoldenCount = i.goldenCount - (isSellingGolden ? 1 : 0);
      if (nextCount > 0) {
        arr.push({ ...i, count: nextCount, goldenCount: nextGoldenCount });
      }
      return arr;
    }, []));

    addNotification(`Đã bán ${item.fish.name}! +${value} vàng`, 'success');
    soundManager.playSell();
    return value;
  }, [inventory, dailyMarketBoosts, updateEarnGoldQuest, addNotification]);

  const moveToAquarium = useCallback((timestamp: number) => {
    const item = inventory.find(i => i.timestamp === timestamp);
    if (!item) return;

    if (item.fish.rarity === Rarity.JUNK) {
      addNotification("Không thể thả rác vào hồ cá được!", "warning");
      return;
    }

    if (aquarium.length >= 10) {
      addNotification("Hồ cá đã đầy! (Tối đa 10 con)", "warning");
      return;
    }

    setAquarium(prev => [...prev, {
      fish: item.fish,
      isGolden: item.goldenCount > 0,
      addedAt: Date.now()
    }]);

    setInventory(prev => prev.reduce<InventoryItem[]>((arr, i) => {
      if (i.timestamp !== timestamp) return [...arr, i];
      const nextCount = i.count - 1;
      const nextGoldenCount = i.goldenCount > 0 ? i.goldenCount - 1 : 0;
      if (nextCount > 0) arr.push({ ...i, count: nextCount, goldenCount: nextGoldenCount });
      return arr;
    }, []));

    addNotification(`Đã thả ${item.fish.name} vào hồ cá!`, 'success');
    soundManager.playSuccess?.();
  }, [inventory, aquarium, addNotification]);

  const returnFromAquarium = useCallback((index: number) => {
    if (index < 0 || index >= aquarium.length) return;
    
    if (inventory.length >= inventoryCapacity) {
      addNotification("Túi đồ đã đầy! Không thể trả cá về túi.", "warning");
      return;
    }

    const item = aquarium[index];
    
    // Add back to inventory
    setInventory(prev => {
      const existingIndex = prev.findIndex(i => i.fish.name === item.fish.name);
      if (existingIndex !== -1) {
        return prev.map((i, idx) => {
          if (idx !== existingIndex) return i;
          return {
            ...i,
            count: i.count + 1,
            goldenCount: i.goldenCount + (item.isGolden ? 1 : 0),
            timestamp: Date.now() // Update timestamp to put it at the top
          };
        });
      }
      return [{ fish: item.fish, count: 1, goldenCount: item.isGolden ? 1 : 0, timestamp: Date.now() }, ...prev];
    });

    // Remove from aquarium
    setAquarium(prev => prev.filter((_, i) => i !== index));
    addNotification(`Đã thu hồi ${item.fish.name} về túi đồ!`, 'success');
    soundManager.playClick();
  }, [aquarium, inventory, inventoryCapacity, addNotification]);

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
    aquarium, setAquarium,
    autoSellJunk, setAutoSellJunk,
    lastAquariumUpdate, setLastAquariumUpdate,
    calculateHourlyRate,
    updateStatsAndQuests,
    updateEarnGoldQuest,
    claimDailyReward,
    sellAllFish,
    sellFish,
    moveToAquarium,
    returnFromAquarium,
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
