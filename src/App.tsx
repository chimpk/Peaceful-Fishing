
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, FishType, RodType, TackleType, BaitType, UIView, Rarity, PlayerSkills, LocationType, NotificationType } from './types';
import { RODS, TACKLES, BAITS, INITIAL_ACHIEVEMENTS, generateDailyQuests, FISH_TYPES } from './core/data/gameData';
import GameCanvas from './components/canvas/GameCanvas';
import UIOverlay from './components/layout/UIOverlay';
import { soundManager } from './core/systems/soundManager';
import { BubblesBackground } from './components/layout/BubblesBackground';
import { useGameState } from './hooks/useGameState';
import { useGameSettings } from './hooks/useGameSettings';
import { useEnvironment } from './hooks/useEnvironment';
import { useCompetition } from './hooks/useCompetition';
import { useGamePersistence } from './hooks/useGamePersistence';
import { clearSave } from './core/systems/persistence';
import FishShowroom from './components/Showroom/FishShowroom';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeView, setActiveView] = useState<UIView>(UIView.GAME);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [epicCatch, setEpicCatch] = useState<{ fish: FishType; isGolden: boolean } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isBossSpawned, setIsBossSpawned] = useState<boolean>(false);
  const [showShowroom, setShowShowroom] = useState<boolean>(false);

  // Initialize hooks
  const state = useGameState();
  const settings = useGameSettings(state.gold, state.setGold, state.addNotification);
  const env = useEnvironment(isDataLoaded, state.addNotification);
  const comp = useCompetition(gameState, setGameState, setActiveView, state.addNotification);
  
  // Persistence
  useGamePersistence(isDataLoaded, setIsDataLoaded, state, settings, env, comp);

  // Sync ambient sound
  useEffect(() => {
    if (activeView === UIView.GAME) {
       soundManager.setAmbientLocation(env.currentLocation);
    }
  }, [env.currentLocation, activeView]);

  // Handle gameplay state transitions
  useEffect(() => {
    if (activeView !== UIView.GAME) {
      setGameState(prev => {
        if ([GameState.CHARGING, GameState.CASTING, GameState.WAITING, GameState.NIBBLING, GameState.REELING].includes(prev)) {
          return GameState.IDLE;
        }
        return prev;
      });
    }
  }, [activeView]);

  const handleBossDefeated = useCallback(() => {
    state.setGold(g => g + 5000);
    state.setStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + 5000 }));
  }, [state]);

  const handleSessionReset = useCallback(() => {
    comp.setSessionFishCount(0);
  }, [comp]);

  const startGame = () => {
    setGameState(GameState.IDLE);
    setActiveView(UIView.GAME);
    setTimeout(() => {
      try { soundManager.playClick(); } catch(e) {}
      try { soundManager.playMusic(); } catch(e) {}
      try { soundManager.setAmbientLocation(env.currentLocation); } catch(e) {}
    }, 10);
  };

  const addFishToInventory = useCallback((fish: FishType, isGolden: boolean) => {
    if (state.inventory.length >= state.inventoryCapacity) {
      state.addNotification("Túi đồ đã đầy! Hãy bán bớt cá hoặc nâng cấp túi.", "warning");
      setGameState(GameState.IDLE);
      return;
    }

    state.setInventory(prev => [{ fish, timestamp: Date.now(), isGolden }, ...prev]);
    
    setStreak(prev => {
      const newStreak = prev + 1;
      let comboMultiplier = 1;
      if (newStreak >= 10) comboMultiplier = 3;
      else if (newStreak >= 6) comboMultiplier = 2;
      else if (newStreak >= 3) comboMultiplier = 1.5;

      const caveBonus = (env.currentLocation === 'CAVE' && state.skills.deepSeaDiver > 0) ? 1.25 : 1;
      const finalValue = Math.floor((isGolden ? fish.value * 3 : fish.value) * comboMultiplier * caveBonus);
      
      // Update competition score directly inside setStreak to ensure we use the correct finalValue
      if (comp.competitionMode) {
        comp.setCompetitionScore(score => score + finalValue);
      }
      
      return newStreak;
    });
    
    const isEpic = fish.rarity === Rarity.LEGENDARY || fish.rarity === Rarity.MYTHIC || isGolden;
    if (isEpic) {
        soundManager.playTrophyCatch();
        setEpicCatch({ fish, isGolden });
        setTimeout(() => setEpicCatch(null), 2000);
    }
    
    state.setUnlockedFish(prev => !prev.includes(fish.name) ? [...prev, fish.name] : prev);
    state.addNotification(`Bắt được ${isGolden ? 'CÁ VÀNG ' : ''}${fish.name}!`, 'success');
    setGameState(GameState.CAUGHT);
    state.updateStatsAndQuests(fish, isGolden);

    // Rod breaking logic
    const rodLimit = settings.currentRod.maxValue ?? Infinity;
    if (fish.value > rodLimit && (settings.currentRod.durability || 0) > 0) {
      settings.setCurrentRod(prev => ({ ...prev, durability: 0 }));
      state.addNotification("Cần câu hiện tại đã gãy vì câu cá quá to! Hãy đi sửa chữa.", "warning");
    }
    
    // Boss spawn logic - only increment if fish was successfully caught and added
    comp.setSessionFishCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 20) {
        setTimeout(() => {
          soundManager.playBossWarning();
          state.addNotification("BOSS xuất hiện! Chuẩn bị chiến đấu!", "boss");
          setTimeout(() => setIsBossSpawned(true), 1200);
        }, 2500);
        return 0;
      }
      return newCount;
    });
    
    setTimeout(() => setGameState(GameState.IDLE), 1200);
  }, [state, settings, env, comp]);

  const handleResetData = useCallback(() => {
    clearSave();
    window.location.reload(); // Simple way to reset everything for now
  }, []);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const s = Math.min(window.innerWidth / 1100, window.innerHeight / 650);
      setScale(s);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 text-white overflow-hidden font-sans select-none flex items-center justify-center">
      <BubblesBackground />
      
      <div 
        className="relative z-10 overflow-hidden shrink-0 shadow-2xl"
        style={{
          width: 1100,
          height: 650,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <GameCanvas 
          gameState={gameState}
          setGameState={setGameState}
          onFishCaught={addFishToInventory}
          onFishLost={(reason) => {
            state.addNotification(reason || "Cá đã thoát rồi...", 'info');
            setGameState(GameState.IDLE);
            setStreak(0);
          }}
          currentRod={settings.currentRod}
          currentTackle={settings.currentTackle}
          currentBait={settings.currentBait}
          baitCounts={settings.baitCounts}
          ownedRods={settings.ownedRods}
          ownedTackles={settings.ownedTackles}
          weather={env.weather}
          skills={state.skills}
          location={env.currentLocation}
          timeOfDay={env.timeOfDay}
          streak={streak}
          onBossDefeated={handleBossDefeated}
          onSessionReset={handleSessionReset}
          onLineBroken={() => settings.handleDurabilityChange('tackle', 100)}
          onRodBroken={() => settings.handleDurabilityChange('rod', 100)}
          onCast={settings.handleCast}
          addNotification={state.addNotification}
          liveBait={settings.liveBait}
          setLiveBait={settings.setLiveBait}
          isBossSpawned={isBossSpawned}
          setIsBossSpawned={setIsBossSpawned}
          onDurabilityChange={settings.handleDurabilityChange}
          playerLevel={state.stats.level}
          inventoryCount={state.inventory.length}
          inventoryCapacity={state.inventoryCapacity}
        />

        <UIOverlay 
          gameState={gameState}
          activeView={activeView}
          setActiveView={setActiveView}
          gold={state.gold}
          inventory={state.inventory}
          inventoryCapacity={state.inventoryCapacity}
          currentRod={settings.currentRod}
          currentTackle={settings.currentTackle}
          currentBait={settings.currentBait}
          baitCounts={settings.baitCounts}
          ownedRods={settings.ownedRods}
          ownedTackles={settings.ownedTackles}
          stats={state.stats}
          achievements={state.achievements}
          quests={state.quests}
          notifications={state.notifications}
          weather={env.weather}
          timeOfDay={env.timeOfDay}
          location={env.currentLocation}
          setLocation={env.setCurrentLocation}
          skills={state.skills}
          buyItem={settings.buyItem}
          liveBait={settings.liveBait}
          handleSelect={settings.handleSelect}
          sellFish={state.sellFish}
          sellAllFish={state.sellAllFish}
          useFishAsBait={(ts) => {
            const item = state.inventory.find(i => i.timestamp === ts);
            if (item) {
              settings.setLiveBait(item.fish);
              state.setInventory(prev => prev.filter(i => i.timestamp !== ts));
              state.addNotification(`Đã sử dụng ${item.fish.name} làm mồi sống!`, 'success');
            }
          }}
          claimQuest={(questId) => {
            const quest = state.claimQuest(questId);
            // Xử lý phần thưởng mồi câu (bait reward) mà useGameState không tự xử lý được
            if (quest && quest.rewardBaitId && quest.rewardBaitCount) {
              settings.setBaitCounts(prev => ({
                ...prev,
                [quest.rewardBaitId!]: (prev[quest.rewardBaitId!] || 0) + quest.rewardBaitCount!
              }));
              state.addNotification(`Nhận được ${quest.rewardBaitCount}x mồi câu từ nhiệm vụ!`, 'success');
            }
          }}
          upgradeCapacity={() => {
            const cost = state.inventoryCapacity * 100;
            if (state.gold >= cost) {
              state.setGold(prev => prev - cost);
              state.setInventoryCapacity(prev => prev + 5);
              state.addNotification(`Đã nâng cấp túi đồ lên ${state.inventoryCapacity + 5} ô!`, 'success');
            } else {
              state.addNotification('Không đủ tiền nâng cấp!', 'warning');
            }
          }}
          buySkill={(id) => {
             const cost = (state.skills[id] + 1) * 2000;
             if (state.gold >= cost) {
                state.setGold(prev => prev - cost);
                state.setSkills(prev => ({ ...prev, [id]: prev[id] + 1 }));
                state.addNotification(`Đã nâng cấp kỹ năng!`, 'success');
             } else {
                state.addNotification('Không đủ tiền nâng cấp!', 'warning');
             }
          }}
          startCompetition={comp.startCompetition}
          competitionTimeLeft={comp.competitionTimeLeft}
          competitionScore={comp.competitionScore}
          competitionMode={comp.competitionMode}
          leaderboard={comp.leaderboard}
          handleRepair={settings.handleRepair}
          onResetData={handleResetData}
          startGame={startGame}
          dailyMarketBoosts={state.dailyMarketBoosts}
          claimDailyReward={() => {
            const reward = state.claimDailyReward();
            if (reward) {
              settings.setBaitCounts(prev => ({
                ...prev,
                [reward.rewardBait.id]: (prev[reward.rewardBait.id] || 0) + 5
              }));
              state.addNotification(`NHẬN QUÀ HÀNG NGÀY: +${reward.rewardGold} Vàng & 5x ${reward.rewardBait.name}! (Chuỗi: ${reward.currentStreak} ngày)`, "success");
              soundManager.playTrophyCatch();
            }
          }}
          unlockedFish={state.unlockedFish}
          streak={streak}
          epicCatch={epicCatch}
          onOpenShowroom={() => setShowShowroom(true)}
        />
      </div>

      {showShowroom && (
        <FishShowroom 
          onClose={() => setShowShowroom(false)} 
        />
      )}
    </div>
  );
};

export default App;
