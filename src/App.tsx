
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, InventoryItem, FishType, RodType, TackleType, BaitType, UIView, ProfileStats, Achievement, Rarity, Quest, PlayerSkills, LocationType, TimeOfDay, NotificationItem, NotificationType } from './core/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RODS, TACKLES, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from './core/gameData';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { soundManager } from './core/soundManager';

const SAVE_KEY = 'fishing_frenzy_save_v1';

const BubblesBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/10 blur-[1px] animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-20px`,
            width: `${Math.random() * 15 + 5}px`,
            height: `${Math.random() * 15 + 5}px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.1
          }}
        />
      ))}
    </div>
  );
};

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
  const [currentTackle, setCurrentTackle] = useState<TackleType>(TACKLES[0]);
  const [currentBait, setCurrentBait] = useState<BaitType>(BAITS[0]);
  const [ownedRods, setOwnedRods] = useState<string[]>(['rod_1']);
  const [ownedTackles, setOwnedTackles] = useState<string[]>(['tackle_1']);
  const [baitCounts, setBaitCounts] = useState<Record<string, number>>({ 'bait_natural_1': 10 });
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
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'stormy' | 'foggy'>('sunny');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [epicCatch, setEpicCatch] = useState<{ fish: FishType; isGolden: boolean } | null>(null);
  const [unlockedFish, setUnlockedFish] = useState<string[]>([]);
  const [skills, setSkills] = useState<PlayerSkills>({ 
    sharpEye: 0, fastHands: 0, lucky: 0, 
    focus: 0, powerReel: 0,
    deepSeaDiver: 0, weatherExpert: 0, masterAngler: 0 
  });
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

  const [weatherVersion, setWeatherVersion] = useState(0);

  // --- DYNAMIC WEATHER CYCLE ---
  useEffect(() => {
    if (!isDataLoaded) return;
    const weatherOptions: ('sunny' | 'rainy' | 'stormy' | 'foggy')[] = ['sunny', 'sunny', 'sunny', 'rainy', 'stormy', 'foggy'];
    const weatherNames = { sunny: '☀️ Trời Nắng', rainy: '🌧️ Trời Mưa', stormy: '⛈️ Bão Lớn', foggy: '🌫️ Sương Mù' };
    // Random interval: 3-5 minutes
    const nextInterval = 180000 + Math.random() * 120000;
    const timer = setTimeout(() => {
      const next = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      if (next !== weather) {
        setWeather(next);
        addNotification(`Thời tiết thay đổi: ${weatherNames[next]}`, 'info');
      }
      setWeatherVersion(v => v + 1);
    }, nextInterval);
    return () => clearTimeout(timer);
  // Re-trigger every time weather changes to schedule the NEXT change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherVersion, isDataLoaded]);

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

  // --- SYNC LEVEL-BASED SKILLS ---
  useEffect(() => {
    if (!isDataLoaded) return;
    setSkills(s => {
      let changed = false;
      const newSkills = { ...s };
      if (stats.level! >= 15 && s.focus === 0) {
        newSkills.focus = 1;
        changed = true;
      }
      if (stats.level! >= 20 && s.powerReel === 0) {
        newSkills.powerReel = 1;
        changed = true;
      }
      if (stats.level! >= 25 && s.deepSeaDiver === 0) {
        newSkills.deepSeaDiver = 1;
        changed = true;
      }
      if (stats.level! >= 30 && s.weatherExpert === 0) {
        newSkills.weatherExpert = 1;
        changed = true;
      }
      if (stats.level! >= 40 && s.masterAngler === 0) {
        newSkills.masterAngler = 1;
        changed = true;
      }
      return changed ? newSkills : s;
    });
  }, [isDataLoaded, stats.level]);

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
        if (data.stats) setStats({
          ...data.stats,
          level: data.stats.level || 1,
          xp: data.stats.xp || 0,
          fishCounts: data.stats.fishCounts || {},
          lastDailyRewardClaimed: data.stats.lastDailyRewardClaimed || 0,
          dailyStreak: data.stats.dailyStreak || 0
        });
        if (data.achievements) setAchievements(data.achievements);
        if (data.unlockedFish) setUnlockedFish(data.unlockedFish);
        if (data.skills) setSkills({
          sharpEye: 0, fastHands: 0, lucky: 0,
          focus: 0, powerReel: 0,
          deepSeaDiver: 0, weatherExpert: 0, masterAngler: 0,
          ...data.skills
        });
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
        if (data.currentTackleId) {
          const tackle = TACKLES.find(t => t.id === data.currentTackleId);
          if (tackle) setCurrentTackle(tackle);
        }
        if (data.currentBaitId) {
          const bait = BAITS.find(b => b.id === data.currentBaitId);
          if (bait) setCurrentBait(bait);
        }
        if (data.ownedTackles) setOwnedTackles(data.ownedTackles);
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
    
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const dataToSave = {
      gold,
      inventory,
      inventoryCapacity,
      ownedRods,
      ownedTackles,
      baitCounts,
      stats,
      achievements,
      quests,
      lastQuestReset,
      currentRodId: currentRod.id,
      currentTackleId: currentTackle.id,
      currentBaitId: currentBait.id,
      unlockedFish,
      skills,
      dailyMarketBoosts,
      currentLocation,
      sessionFishCount,
      leaderboard
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [gold, inventory, inventoryCapacity, ownedRods, ownedTackles, baitCounts, stats, achievements, quests, lastQuestReset, currentRod, currentTackle, currentBait, isDataLoaded, unlockedFish, skills, dailyMarketBoosts, currentLocation, sessionFishCount, leaderboard]);

  const handleBossDefeated = useCallback(() => {
    setGold(g => g + 5000);
    setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + 5000 }));
  }, []);

  const handleSessionReset = useCallback(() => {
    setSessionFishCount(0);
  }, []);

  const claimDailyReward = useCallback(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (stats.lastDailyRewardClaimed && now - stats.lastDailyRewardClaimed < oneDay) {
        addNotification("Bạn đã nhận quà hôm nay rồi! Hãy quay lại vào ngày mai.", "warning");
        return;
    }

    const currentStreak = (stats.dailyStreak || 0) + 1;
    const rewardGold = 1000 + (currentStreak * 500);
    const rewardBait = BAITS[Math.floor(Math.random() * BAITS.length)];

    setGold(g => g + rewardGold);
    setBaitCounts(prev => ({
        ...prev,
        [rewardBait.id]: (prev[rewardBait.id] || 0) + 5
    }));

    setStats(prev => ({
        ...prev,
        lastDailyRewardClaimed: now,
        dailyStreak: currentStreak,
        totalGoldEarned: prev.totalGoldEarned + rewardGold
    }));

    addNotification(`NHẬN QUÀ HÀNG NGÀY: +${rewardGold} Vàng & 5x ${rewardBait.name}! (Chuỗi: ${currentStreak} ngày)`, "success");
    soundManager.playTrophyCatch();
  }, [stats.lastDailyRewardClaimed, stats.dailyStreak, addNotification]);

  const handleResetData = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGold(500);
    setInventory([]);
    setInventoryCapacity(20);
    setCurrentRod(RODS[0]);
    setCurrentTackle(TACKLES[0]);
    setCurrentBait(BAITS[0]);
    setOwnedRods(['rod_1']);
    setOwnedTackles(['tackle_1']);
    setBaitCounts({ 'bait_natural_1': 10 });
    setStats({
      totalGoldEarned: 500,
      totalFishCaught: 0,
      rarestFish: 'Chưa có',
      highestValue: 0,
      level: 1,
      xp: 0,
      fishCounts: {}
    });
    setAchievements(INITIAL_ACHIEVEMENTS);
    setQuests(generateDailyQuests());
    setLastQuestReset(Date.now());
    setUnlockedFish([]);
    setSkills({ sharpEye: 0, fastHands: 0, lucky: 0, focus: 0, powerReel: 0 });
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

      const xpGains: Record<string, number> = {
        [Rarity.JUNK]: 5,
        [Rarity.COMMON]: 15,
        [Rarity.UNCOMMON]: 35,
        [Rarity.RARE]: 120,
        [Rarity.EPIC]: 350,
        [Rarity.LEGENDARY]: 1500,
        [Rarity.MYTHIC]: 6000
      };
      
      const xpGain = xpGains[newFish.rarity] || 10;
      let nextXp = (prev.xp || 0) + xpGain;
      let nextLevel = prev.level || 1;
      const xpToLevel = nextLevel * 800; // Faster leveling early
      
      if (nextXp >= xpToLevel) {
        nextXp -= xpToLevel;
        nextLevel++;
        setTimeout(() => {
          addNotification(`LEVEL UP! Cấp độ mới: ${nextLevel}! +5000 vàng`, 'achievement');
          setGold(g => g + 5000);
          soundManager.playTrophyCatch();
          
          // Auto-unlock active skills
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

  const handleRodBroken = useCallback(() => {
    setCurrentRod(prev => ({ ...prev, durability: 0 }));
    addNotification('Cần câu đã gãy! Hãy đi sửa chữa để tiếp tục sử dụng.', 'warning');
  }, [addNotification]);

  const handleLineBroken = useCallback(() => {
    setCurrentTackle(prev => ({ ...prev, durability: 0 }));
    addNotification('Thẻo đã đứt! Hãy đi sửa chữa hoặc thay thẻo mới.', 'warning');
  }, [addNotification]);

  const handleCast = useCallback(() => {
    setBaitCounts(prev => {
      const currentCount = prev[currentBait.id] || 0;
      if (currentCount <= 0) return prev;
      return { ...prev, [currentBait.id]: currentCount - 1 };
    });
  }, [currentBait.id]);

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
          // Bonus gold removed as requested (only when selling/claiming)
          return [...prev, fish.name];
       }
       return prev;
    });

    addNotification(`Bắt được ${isGolden ? 'CÁ VÀNG ' : ''}${fish.name}!${bonusMessage}`, 'success');
    setGameState(GameState.CAUGHT);
    updateStatsAndQuests(fish, isGolden);

    // Rod breaking logic (now just depletes durability)
    const currentRodMax = currentRod.maxValue ?? Infinity;
    if (finalValue > currentRodMax && (currentRod.durability || 0) > 0) {
      setCurrentRod(prev => ({ ...prev, durability: 0 }));
      addNotification("Cần câu hiện tại đã gãy vì câu cá quá to! Hãy đi sửa chữa.", "warning");
    }
    
    // Check for boss after catching fish
    setSessionFishCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 20) {
        return 0; // Reset session fish count when boss appears
      } else {
        return newCount;
      }
    });

    const isBossDue = sessionFishCount + 1 >= 20;
    if (isBossDue) {
      setTimeout(() => {
        soundManager.playBossWarning();
        addNotification("BOSS xuất hiện! Chuẩn bị chiến đấu!", "boss");
        setTimeout(() => {
          setIsBossSpawned(true);
        }, 1200);
      }, 2500);
    } 
    
    setTimeout(() => {
      setGameState(GameState.IDLE);
    }, 1200);
  }, [updateStatsAndQuests, inventory.length, inventoryCapacity, currentRod, ownedRods, addNotification, sessionFishCount]);

  const onFishLost = useCallback((reason: string = "Cá đã thoát rồi...") => {
    addNotification(reason, 'info');
    setGameState(GameState.IDLE);
    setStreak(0);
  }, [addNotification]);

  const handleDurabilityChange = useCallback((type: 'rod' | 'tackle', amount: number) => {
    if (type === 'rod') {
        setCurrentRod(prev => {
            const nextDur = Math.max(0, (prev.durability || 100) - amount);
            if (nextDur <= 0 && prev.durability! > 0) {
                addNotification(`Cần câu ${prev.name} đã hỏng! Hãy đi sửa chữa.`, 'warning');
            }
            return { ...prev, durability: nextDur };
        });
    } else {
        setCurrentTackle(prev => {
            const nextDur = Math.max(0, (prev.durability || 30) - amount);
            if (nextDur <= 0 && prev.durability! > 0) {
                addNotification(`Thẻo ${prev.name} đã hỏng! Hãy đi sửa chữa.`, 'warning');
            }
            return { ...prev, durability: nextDur };
        });
    }
  }, [addNotification]);

  const handleRepair = useCallback((type: 'rod' | 'tackle') => {
    if (type === 'rod') {
        const cost = Math.floor((currentRod.maxDurability! - currentRod.durability!) * 5);
        if (gold >= cost) {
            setGold(g => g - cost);
            setCurrentRod(prev => ({ ...prev, durability: prev.maxDurability }));
            addNotification(`Đã sửa cần câu hết ${cost} vàng.`, 'success');
        } else {
            addNotification(`Không đủ vàng để sửa chữa (Cần ${cost} vàng).`, 'warning');
        }
    } else {
        const cost = Math.floor((currentTackle.maxDurability! - currentTackle.durability!) * 10);
        if (gold >= cost) {
            setGold(g => g - cost);
            setCurrentTackle(prev => ({ ...prev, durability: prev.maxDurability }));
            addNotification(`Đã sửa thẻo hết ${cost} vàng.`, 'success');
        } else {
            addNotification(`Không đủ vàng để sửa chữa (Cần ${cost} vàng).`, 'warning');
        }
    }
  }, [gold, currentRod, currentTackle, addNotification]);

  const sellAllFish = () => {
    if (inventory.length === 0) return;
    const totalValue = inventory.reduce((sum, item) => {
        let itemValue = item.isGolden ? item.fish.value * 2 : item.fish.value;
        if (dailyMarketBoosts.includes(item.fish.name)) itemValue *= 3;
        return sum + itemValue;
    }, 0);
    
    if (totalValue > 0) {
      setGold(prev => prev + totalValue);
      setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + totalValue }));
      updateEarnGoldQuest(totalValue);

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
    updateEarnGoldQuest(value);
    setInventory(prev => prev.filter(i => i.timestamp !== timestamp));
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

  const buyItem = (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => {
    if (gold >= item.price) {
      setGold(prev => prev - item.price);
      if (type === 'rod') {
        const rod = { ...(item as RodType), durability: (item as RodType).maxDurability || 100 };
        setOwnedRods(prev => [...prev, item.id]);
        setCurrentRod(rod);
      } else if (type === 'tackle') {
        const tackle = { ...(item as TackleType), durability: (item as TackleType).maxDurability || 30 };
        setOwnedTackles(prev => [...prev, item.id]);
        setCurrentTackle(tackle);
      } else {
        const bait = item as BaitType;
        const addCount = bait.count || 10;
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

  const handleSelect = (item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => {
    soundManager.playClick();
    if (type === 'rod') {
      setCurrentRod(item as RodType);
    } else if (type === 'tackle') {
      setCurrentTackle(item as TackleType);
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
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-[#030712]">
      <BubblesBackground />
      
      {/* Premium CRT/Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative bg-[#0f172a] md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[6px] border-[#1e293b] overflow-hidden transition-all duration-700 w-[min(1100px,100vw)] h-[min(650px,100vh)] aspect-auto md:aspect-[1100/650] flex flex-col">
        {activeView === UIView.GAME && (
          <GameCanvas 
            gameState={gameState} 
            setGameState={setGameState}
            onFishCaught={addFishToInventory}
            onFishLost={onFishLost}
            currentRod={currentRod}
            currentTackle={currentTackle}
            currentBait={currentBait}
            baitCounts={baitCounts}
            ownedRods={ownedRods}
            ownedTackles={ownedTackles}
            weather={weather}
            skills={skills}
            location={currentLocation}
            timeOfDay={timeOfDay}
            streak={streak}
            onBossDefeated={handleBossDefeated}
            onSessionReset={handleSessionReset}
            onLineBroken={handleLineBroken}
            onRodBroken={handleRodBroken}
            onCast={handleCast}
            addNotification={addNotification}
            liveBait={liveBait}
            setLiveBait={setLiveBait}
            isBossSpawned={isBossSpawned}
            setIsBossSpawned={setIsBossSpawned}
            onDurabilityChange={handleDurabilityChange}
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
           currentTackle={currentTackle}
           currentBait={currentBait}
           baitCounts={baitCounts}
           ownedRods={ownedRods}
           ownedTackles={ownedTackles}
          stats={stats}
          achievements={achievements}
          quests={quests}
          onStart={startGame}
          onSellAll={sellAllFish}
          onSellFish={sellFish}
          onBuy={buyItem}
          onSelect={handleSelect}
          onUpgradeCapacity={upgradeCapacity}
          onResetData={handleResetData}
          onClaimQuest={claimQuest}
          onRepair={handleRepair}
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
          onClaimDailyReward={claimDailyReward}
        />
      </div>
    </div>
  );
};

export default App;
