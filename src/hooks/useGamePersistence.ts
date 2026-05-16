
import { useEffect } from 'react';
import { saveGame, loadGame } from '../core/systems/persistence';
import { RODS, TACKLES, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from '../core/data/gameData';

export const useGamePersistence = (
  isDataLoaded: boolean,
  setIsDataLoaded: (v: boolean) => void,
  state: any,
  settings: any,
  env: any,
  comp: any
) => {
  // Load data
  useEffect(() => {
    const data = loadGame();
    if (data) {
      if (data.gold !== undefined) state.setGold(data.gold);
      if (data.inventory) {
        state.setInventory(data.inventory.map((item: any) => {
          const count = item.count !== undefined ? item.count : 1;
          const goldenCount = item.goldenCount !== undefined ? item.goldenCount : (item.isGolden ? count : 0);
          return {
            fish: item.fish,
            timestamp: item.timestamp,
            count,
            goldenCount
          };
        }));
      }
      if (data.inventoryCapacity) state.setInventoryCapacity(data.inventoryCapacity);
      if (data.ownedRods) settings.setOwnedRods(data.ownedRods);
      if (data.baitCounts) settings.setBaitCounts(data.baitCounts);
      if (data.stats) state.setStats({
        ...data.stats,
        level: data.stats.level || 1,
        xp: data.stats.xp || 0,
        fishCounts: data.stats.fishCounts || {},
        lastDailyRewardClaimed: data.stats.lastDailyRewardClaimed || 0,
        dailyStreak: data.stats.dailyStreak || 0
      });
      if (data.achievements) state.setAchievements(data.achievements);
      if (data.unlockedFish) state.setUnlockedFish(data.unlockedFish);
      if (data.skills) state.setSkills({
        sharpEye: 0, fastHands: 0, lucky: 0,
        focus: 0, powerReel: 0,
        deepSeaDiver: 0, weatherExpert: 0, masterAngler: 0,
        ...data.skills
      });
      if (data.currentLocation) env.setCurrentLocation(data.currentLocation);
      if (data.sessionFishCount !== undefined) comp.setSessionFishCount(data.sessionFishCount);
      if (data.leaderboard) comp.setLeaderboard(data.leaderboard);
      if (data.aquarium) state.setAquarium(data.aquarium);
      if (data.autoSellJunk !== undefined) state.setAutoSellJunk(data.autoSellJunk);
      
      const now = Date.now();
      const today = new Date(now).setHours(0, 0, 0, 0);
      const lastReset = data.lastQuestReset ? new Date(data.lastQuestReset).setHours(0, 0, 0, 0) : 0;

      if (today > lastReset) {
        state.setGold((g: number) => g + 1000);
        state.addNotification("Chào mừng trở lại! Bạn nhận được 1,000 vàng cho ngày mới.", "success");
        state.setQuests(generateDailyQuests());
        state.setLastQuestReset(now);
        const fishNames = FISH_TYPES.map(f => f.name);
        const boosts = [];
        for (let i = 0; i < 3; i++) {
           boosts.push(fishNames[Math.floor(Math.random() * fishNames.length)]);
        }
        state.setDailyMarketBoosts(boosts);
      } else {
        state.setQuests(data.quests || generateDailyQuests());
        state.setLastQuestReset(data.lastQuestReset);
        state.setDailyMarketBoosts(data.dailyMarketBoosts || []);
      }

      // Offline Aquarium Gold Calculation
      if (data.aquarium && data.aquarium.length > 0 && data.lastAquariumUpdate) {
          const now = Date.now();
          const lastUpdate = data.lastAquariumUpdate;
          const deltaMs = now - lastUpdate;
          const maxDelta = 6 * 60 * 60 * 1000; // 6 hours cap
          const effectiveDelta = Math.min(deltaMs, maxDelta);

          const rarityIncome: Record<string, number> = {
              ['PHỔ THÔNG']: 20,
              ['KHÔNG PHỔ BIẾN']: 60,
              ['HIẾM']: 200,
              ['SỬ THI']: 600,
              ['HUYỀN THOẠI']: 2000,
              ['THẦN THOẠI']: 10000
          };

          let hourlyRate = 0;
          data.aquarium.forEach((item: any) => {
              const base = rarityIncome[item.fish.rarity] || 0;
              hourlyRate += item.isGolden ? base * 3 : base;
          });

          const offlineIncome = Math.floor(hourlyRate * (effectiveDelta / (60 * 60 * 1000)));

          if (offlineIncome > 0) {
              state.setGold((g: number) => g + offlineIncome);
              state.setStats((s: any) => ({ ...s, totalGoldEarned: s.totalGoldEarned + offlineIncome }));
              state.addNotification(`Hồ cá đã sinh ra ${offlineIncome.toLocaleString()} vàng khi bạn vắng mặt! ${effectiveDelta === maxDelta ? '(Đạt giới hạn 6h)' : ''}`, "success");
              state.setLastAquariumUpdate(now);
          } else {
              state.setLastAquariumUpdate(data.lastAquariumUpdate);
          }
      } else {
          state.setLastAquariumUpdate(Date.now());
      }

      if (data.currentRodId) {
        const rod = RODS.find(r => r.id === data.currentRodId);
        if (rod) {
          settings.setCurrentRod({
            ...rod,
            durability: data.currentRodDurability !== undefined ? data.currentRodDurability : rod.maxDurability
          });
        }
      }
      if (data.currentTackleId) {
        const tackle = TACKLES.find(t => t.id === data.currentTackleId);
        if (tackle) {
          settings.setCurrentTackle({
            ...tackle,
            durability: data.currentTackleDurability !== undefined ? data.currentTackleDurability : tackle.maxDurability
          });
        }
      }
      if (data.currentBaitId) {
        const bait = BAITS.find(b => b.id === data.currentBaitId);
        if (bait) settings.setCurrentBait(bait);
      }
      if (data.ownedTackles) settings.setOwnedTackles(data.ownedTackles);
    } else {
      state.setGold(1500);
      state.setStats((s: any) => ({ ...s, totalGoldEarned: 1500 }));
      state.setQuests(generateDailyQuests());
      state.setLastQuestReset(Date.now());
      const fishNames = FISH_TYPES.map(f => f.name);
      const boosts = [];
      for (let i = 0; i < 3; i++) {
         boosts.push(fishNames[Math.floor(Math.random() * fishNames.length)]);
      }
      state.setDailyMarketBoosts(boosts);
    }
    
    setIsDataLoaded(true);
  }, []);

  // Save data
  useEffect(() => {
    if (!isDataLoaded) return;

    const dataToSave = {
      gold: state.gold,
      inventory: state.inventory,
      inventoryCapacity: state.inventoryCapacity,
      ownedRods: settings.ownedRods,
      ownedTackles: settings.ownedTackles,
      baitCounts: settings.baitCounts,
      stats: state.stats,
      achievements: state.achievements,
      quests: state.quests,
      lastQuestReset: state.lastQuestReset,
      currentRodId: settings.currentRod.id,
      currentRodDurability: settings.currentRod.durability,
      currentTackleId: settings.currentTackle.id,
      currentTackleDurability: settings.currentTackle.durability,
      currentBaitId: settings.currentBait.id,
      unlockedFish: state.unlockedFish,
      skills: state.skills,
      dailyMarketBoosts: state.dailyMarketBoosts,
      currentLocation: env.currentLocation,
      sessionFishCount: comp.sessionFishCount,
      leaderboard: comp.leaderboard,
      aquarium: state.aquarium,
      autoSellJunk: state.autoSellJunk,
      lastAquariumUpdate: state.lastAquariumUpdate
    };
    saveGame(dataToSave);
  }, [state, settings, env, comp, isDataLoaded]);
};
