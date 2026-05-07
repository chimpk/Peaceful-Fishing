
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, InventoryItem, FishType, RodType, BaitType, UIView, ProfileStats, Achievement, Rarity, Quest, PlayerSkills, LocationType, TimeOfDay, NotificationItem, NotificationType } from './core/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RODS, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from './core/gameData';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { soundManager } from './core/soundManager';

const SAVE_KEY = 'fishing_frenzy_save_v1';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeView, setActiveView] = useState<UIView>(UIView.GAME);
  
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryCapacity, setInventoryCapacity] = useState(20);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNote: NotificationItem = { id, message, type, timestamp: Date.now() };
    setNotifications(prev => [...prev, newNote]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);
  const [currentRod, setCurrentRod] = useState<RodType>(RODS[0]);
  const [currentBait, setCurrentBait] = useState<BaitType>(BAITS[0]);
  const [ownedRods, setOwnedRods] = useState<string[]>(['rod_1']);
  const [baitCounts, setBaitCounts] = useState<Record<string, number>>({ 'bait_1': 1 });
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
  
  const [currentLocation, setCurrentLocation] = useState<LocationType>('POND');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [streak, setStreak] = useState<number>(0);
  const [sessionFishCount, setSessionFishCount] = useState<number>(0);
  const [competitionMode, setCompetitionMode] = useState<boolean>(false);
  const [competitionTimeLeft, setCompetitionTimeLeft] = useState<number>(180); // 3 minutes
  const [competitionScore, setCompetitionScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<{ score: number; date: string }[]>([]);
  const [liveBait, setLiveBait] = useState<FishType | null>(null);
  const [isBossSpawned, setIsBossSpawned] = useState<boolean>(false);

  // --- TIME OF DAY CYCLE ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => {
        if (prev === 'DAY') return 'SUNSET';
        if (prev === 'SUNSET') return 'NIGHT';
        return 'DAY';
      });
    }, 90000); // Đổi thời gian mỗi 1.5 phút
    return () => clearInterval(interval);
  }, []);

  // --- DYNAMIC WEATHER CYCLE ---
  useEffect(() => {
    if (!isDataLoaded) return;
    const weatherOptions: ('sunny' | 'rainy' | 'stormy')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy'];
    const weatherNames = { sunny: '☀️ Trời Nắng', rainy: '🌧️ Trời Mưa', stormy: '⛈️ Bão Lớn' };
    // Random interval: 3-5 minutes
    const nextInterval = 180000 + Math.random() * 120000;
    const timer = setTimeout(() => {
      const next = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      setWeather(next);
      addNotification(`Thời tiết thay đổi: ${weatherNames[next]}`, 'info');
    }, nextInterval);
    return () => clearTimeout(timer);
  // Re-trigger every time weather changes to schedule the NEXT change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather, isDataLoaded]);

  // --- HANDLE TAB SWITCHING DURING GAMEPLAY ---
  useEffect(() => {
    if (activeView !== UIView.GAME) {
      setGameState(prev => {
        if ([
          GameState.CHARGING,
          GameState.CASTING, 
          GameState.WAITING, 
          GameState.NIBBLING, 
          GameState.REELING
        ].includes(prev)) {
          return GameState.IDLE;
        }
        return prev;
      });
    }
  }, [activeView]);

  // --- AMBIENT SOUND LOCATION UPDATE ---
  useEffect(() => {
    if (activeView === UIView.GAME) {
       soundManager.setAmbientLocation(currentLocation);
    }
  }, [currentLocation, activeView]);

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
        if (data.currentLocation) setCurrentLocation(data.currentLocation);
        if (data.sessionFishCount !== undefined) setSessionFishCount(data.sessionFishCount);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (!data.lastQuestReset || now - data.lastQuestReset > oneDay) {
          setGold(g => g + 1000);
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
      setGold(1500);
      setStats(s => ({ ...s, totalGoldEarned: 1500 }));
      setQuests(generateDailyQuests());
      setLastQuestReset(Date.now());
      const fishNames = FISH_TYPES.map(f => f.name);
      const boosts = [];
      for (let i = 0; i < 3; i++) {
         boosts.push(fishNames[Math.floor(Math.random() * fishNames.length)]);
      }
      setDailyMarketBoosts(boosts);
    }
    
    // Random weather on load and then every 3 minutes
    const weathers: ('sunny' | 'rainy' | 'stormy')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy'];
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    
    const weatherInterval = setInterval(() => {
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 180000);
    
    setIsDataLoaded(true);
    
    return () => clearInterval(weatherInterval);
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
      dailyMarketBoosts,
      currentLocation,
      sessionFishCount,
      leaderboard
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [gold, inventory, inventoryCapacity, ownedRods, baitCounts, stats, achievements, quests, lastQuestReset, currentRod, currentBait, isDataLoaded, unlockedFish, skills, dailyMarketBoosts, currentLocation, sessionFishCount, leaderboard]);

  const handleBossDefeated = useCallback(() => {
    setGold(g => g + 5000);
    setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + 5000 }));
  }, []);

  const handleSessionReset = useCallback(() => {
    setSessionFishCount(0);
  }, []);

  const handleResetData = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGold(500);
    setInventory([]);
    setInventoryCapacity(20);
    setCurrentRod(RODS[0]);
    setCurrentBait(BAITS[0]);
    setOwnedRods(['rod_1']);
    setBaitCounts({ 'bait_1': 10 });
    setStats({
      totalGoldEarned: 500,
      totalFishCaught: 0,
      rarestFish: 'Chưa có',
      highestValue: 0
    });
    setAchievements(INITIAL_ACHIEVEMENTS);
    setQuests(generateDailyQuests());
    setLastQuestReset(Date.now());
    setUnlockedFish([]);
    setSkills({ sharpEye: 0, fastHands: 0, lucky: 0 });
    setDailyMarketBoosts([]);
    setCurrentLocation('POND');
    setSessionFishCount(0);
    setStreak(0);
    setGameState(GameState.START);
    setActiveView(UIView.GAME);
    addNotification('Dữ liệu đã được reset!', 'info');
  }, [addNotification]);

  // --- COMPETITION LOGIC ---
  useEffect(() => {
    let timer: any;
    if (competitionMode && competitionTimeLeft > 0 && gameState !== GameState.BOSS_FIGHT) {
      timer = setInterval(() => {
        setCompetitionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCompetitionMode(false);
            setGameState(GameState.START);
            setActiveView(UIView.RESULTS);
            
            // Save to leaderboard
            setLeaderboard(prevLb => {
              // We need to use a functional update for competitionScore as well to avoid stale closure
              setCompetitionScore(currentScore => {
                 const newEntry = { score: currentScore, date: new Date().toLocaleDateString('vi-VN') };
                 const newList = [...prevLb, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
                 return currentScore; // Keep score as is, we just needed it for the leaderboard
              });
              
              // We return prevLb initially, the actual update happens via a separate setLeaderboard call inside
              // Or better, since we can't easily access the latest competitionScore inside setLeaderboard's callback without a ref,
              // let's just do it directly. A slight hack: we rely on the fact that competitionScore changes might trigger this effect,
              // but we only care about the value when time runs out. The functional update above is a bit messy.
              // Let's use a cleaner approach in the useEffect dependencies.
              return prevLb; 
            });
            
            // To properly fix the leaderboard, let's use functional state updates where possible or a ref.
            // Since we don't have a ref, we'll use a functional update trick.
            setCompetitionScore(finalScore => {
               setLeaderboard(prevLb => {
                 const newEntry = { score: finalScore, date: new Date().toLocaleDateString('vi-VN') };
                 return [...prevLb, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
               });
               return finalScore;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [competitionMode, competitionTimeLeft, gameState, competitionScore]);

  const startCompetition = () => {
    setCompetitionMode(true);
    setCompetitionTimeLeft(180);
    setCompetitionScore(0);
    setSessionFishCount(0);
    setGameState(GameState.IDLE);
    setActiveView(UIView.GAME);
    addNotification("CHẾ ĐỘ THI ĐẤU BẮT ĐẦU! Cố gắng kiếm nhiều vàng nhất trong 3 phút!", 'info');
  };

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
        addNotification(`Thành tựu mới: ${ach.title}! +${ach.reward} vàng`, 'achievement');
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
        addNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`, 'success');
      }
      return { ...q, progress: Math.min(q.target, newProgress), isCompleted: completed };
    }));
  }, [addNotification]);

  const handleLineBroken = useCallback(() => {
    setBaitCounts(prev => {
      const currentCount = prev[currentBait.id] || 0;
      if (currentCount <= 0) return prev; // Guard against negative count
      
      const nextCount = currentCount - 1;
      if (nextCount <= 0) {
        setCurrentBait(BAITS[0]);
      }
      return { ...prev, [currentBait.id]: nextCount };
    });
    addNotification('Thẻo bị đứt! Hãy mua thẻo mới.', 'warning');
  }, [currentBait.id, addNotification]);

  const startGame = () => {
    console.log("!!! startGame triggered !!!");
    setGameState(GameState.IDLE);
    setActiveView(UIView.GAME);
    
    // Play sounds after state transition to ensure no blocking
    setTimeout(() => {
      try { soundManager.playClick(); } catch(e) { console.error("Sound click error", e); }
      try { soundManager.setAmbientLocation(currentLocation); } catch(e) { console.error("Sound ambient error", e); }
    }, 10);
  };

  const addFishToInventory = useCallback((fish: FishType, isGolden: boolean) => {
    if (inventory.length >= inventoryCapacity) {
      addNotification("Túi đồ đã đầy! Hãy bán bớt cá hoặc nâng cấp túi.", "warning");
      setGameState(GameState.IDLE);
      return;
    }

    setInventory(prev => [{ fish, timestamp: Date.now(), isGolden }, ...prev]);
    
    let finalValue = 0;
    
    setStreak(prev => {
      const newStreak = prev + 1;
      let comboMultiplier = 1;
      if (newStreak >= 10) comboMultiplier = 3;
      else if (newStreak >= 6) comboMultiplier = 2;
      else if (newStreak >= 3) comboMultiplier = 1.5;

      finalValue = Math.floor((isGolden ? fish.value * 2 : fish.value) * comboMultiplier);
      return newStreak;
    });
    
    // Use a small timeout to allow setStreak to calculate finalValue before using it
    setTimeout(() => {
      if (competitionMode) {
        setCompetitionScore(prev => prev + finalValue);
      }
    }, 0);

    const isEpic = fish.rarity === Rarity.LEGENDARY || fish.rarity === Rarity.MYTHIC || isGolden;
    if (isEpic) {
        soundManager.playTrophyCatch();
        setEpicCatch({ fish, isGolden });
        setTimeout(() => setEpicCatch(null), 2000);
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

    addNotification(`Bắt được ${isGolden ? 'CÁ VÀNG ' : ''}${fish.name}!${bonusMessage}`, 'success');
    setGameState(GameState.CAUGHT);
    updateStatsAndQuests(fish, isGolden);

    // Rod breaking logic
    const currentRodMax = currentRod.maxValue ?? Infinity;
    if (finalValue > currentRodMax && ownedRods.includes(currentRod.id)) {
      setOwnedRods(prev => {
        const remaining = prev.filter(id => id !== currentRod.id);
        const nextRodId = remaining[0] || 'rod_1';
        const nextRod = RODS.find(r => r.id === nextRodId) || RODS[0];
        setCurrentRod(nextRod);
        return remaining;
      });
      addNotification("Cần câu hiện tại đã gãy vì câu cá quá to! Hãy mua lại cần mới.", "warning");
    }
    
    // Check for boss after catching fish
    setSessionFishCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 20) {
        setTimeout(() => {
          soundManager.playBossWarning();
          addNotification("BOSS xuất hiện! Chuẩn bị chiến đấu!", "boss");
          setTimeout(() => {
            setIsBossSpawned(true);
          }, 1200);
        }, 2500);
        return 0; // Reset session fish count when boss appears
      } else {
        setTimeout(() => {
          setGameState(GameState.IDLE);
        }, 1200);
        return newCount;
      }
    });
  }, [updateStatsAndQuests, inventory.length, inventoryCapacity, currentRod, ownedRods, addNotification]);

  const onFishLost = useCallback((reason: string = "Cá đã thoát rồi...") => {
    addNotification(reason, 'info');
    setGameState(GameState.IDLE);
    setStreak(0);
  }, [addNotification]);

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
            addNotification(`Nhiệm vụ hoàn tất: ${q.title}! Hãy nhận thưởng.`, 'success');
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
            addNotification(`Thành tựu mới: ${ach.title}! +${ach.reward} vàng`, 'achievement');
            setGold(g => g + ach.reward);
            setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + ach.reward }));
          }
          return { ...ach, progress: newProgress, isCompleted: completed };
        }
        return ach;
      }));

      setInventory([]);
      addNotification(`Đã bán toàn bộ cá! Nhận được ${totalValue} vàng`, 'success');
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
    addNotification(`Đã bán ${item.fish.name}! +${value} vàng`, 'success');
  };

  const useFishAsBait = (timestamp: number) => {
    const item = inventory.find(i => i.timestamp === timestamp);
    if (!item) return;
    
    // Only allow common/uncommon/rare for bait to prevent accidents with Mythics?
    // Actually, let player choose, but maybe a warning in UI.
    
    setLiveBait(item.fish);
    setInventory(prev => prev.filter(i => i.timestamp !== timestamp));
    addNotification(`Đã sử dụng ${item.fish.name} làm mồi sống!`, 'success');
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
      addNotification(`Đã nhận thưởng nhiệm vụ: +${quest.rewardGold} vàng!`, 'success');
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
      addNotification(`Đã mua ${item.name}!`, 'success');
    } else {
      addNotification('Không đủ tiền!', 'warning');
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
      addNotification(`Đã nâng cấp túi đồ lên ${inventoryCapacity + 5} ô!`, 'success');
    } else {
      addNotification('Không đủ tiền nâng cấp!', 'warning');
    }
  };

  const buySkill = (skillId: keyof PlayerSkills) => {
     const currentLevel = skills[skillId];
     const cost = (currentLevel + 1) * 2000;
     if (gold >= cost) {
        setGold(prev => prev - cost);
        setSkills(prev => ({ ...prev, [skillId]: currentLevel + 1 }));
        addNotification(`Đã nâng cấp kỹ năng!`, 'success');
     } else {
        addNotification('Không đủ tiền nâng cấp!', 'warning');
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
            baitCounts={baitCounts}
            ownedRods={ownedRods}
            weather={weather}
            skills={skills}
            location={currentLocation}
            timeOfDay={timeOfDay}
            streak={streak}
            onBossDefeated={handleBossDefeated}
            onSessionReset={handleSessionReset}
            onLineBroken={handleLineBroken}
            addNotification={addNotification}
            liveBait={liveBait}
            setLiveBait={setLiveBait}
            isBossSpawned={isBossSpawned}
            setIsBossSpawned={setIsBossSpawned}
          />
        )}
        
        <UIOverlay 
          gameState={gameState}
          activeView={activeView}
          setActiveView={setActiveView}
          gold={gold}
          inventory={inventory}
          inventoryCapacity={inventoryCapacity}
          notifications={notifications}
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
          location={currentLocation}
          timeOfDay={timeOfDay}
          streak={streak}
          onChangeLocation={(loc) => setCurrentLocation(loc)}
          competitionMode={competitionMode}
          competitionTimeLeft={competitionTimeLeft}
          competitionScore={competitionScore}
          leaderboard={leaderboard}
          onStartCompetition={startCompetition}
          liveBait={liveBait}
          onUseAsBait={useFishAsBait}
        />
      </div>
    </div>
  );
};

export default App;
