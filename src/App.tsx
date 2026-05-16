import React, { useState, useCallback, useEffect } from 'react';
import { GameState, InventoryItem, FishType, UIView, Rarity, NotificationType } from './types';
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
import { isMobileDevice } from './utils/mobileUtils';
import MobileOptimizationPrompt from './components/layout/MobileOptimizationPrompt';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeView, setActiveView] = useState<UIView>(UIView.GAME);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [epicCatch, setEpicCatch] = useState<{ fish: FishType; isGolden: boolean } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isBossSpawned, setIsBossSpawned] = useState<boolean>(false);
  const [showShowroom, setShowShowroom] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobilePrompt, setShowMobilePrompt] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

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
       soundManager.startAmbient(env.currentLocation);
       if (env.weather === 'rainy' || env.weather === 'stormy') {
           soundManager.startRain();
       } else {
           soundManager.stopRain();
       }
    } else {
      soundManager.stopAmbient();
      soundManager.stopRain();
    }
  }, [env.currentLocation, env.weather, activeView]);

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
      try { soundManager.startAmbient(env.currentLocation); } catch(e) {}
    }, 10);
  };

  const addFishToInventory = useCallback((fish: FishType, isGolden: boolean) => {
    // QoL: Auto-sell Junk
    if (state.autoSellJunk && fish.rarity === Rarity.JUNK) {
        const val = isGolden ? fish.value * 2 : fish.value;
        state.setGold(g => g + val);
        state.addNotification(`Tự động bán ${fish.name} (+${val} vàng)`, 'info');
        setGameState(GameState.CAUGHT);
        state.updateStatsAndQuests(fish, isGolden, env.currentLocation);
        setTimeout(() => setGameState(GameState.IDLE), 1000);
        return;
    }

    const hasSlot = state.inventory.some(item => item.fish.name === fish.name);
    if (!hasSlot && state.inventory.length >= state.inventoryCapacity) {
      state.addNotification("Túi đồ đã đầy! Hãy bán bớt cá hoặc nâng cấp túi.", "warning");
      setGameState(GameState.IDLE);
      return;
    }

    state.setInventory(prev => {
      const existingIndex = prev.findIndex(item => item.fish.name === fish.name);
      if (existingIndex !== -1) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          return {
            ...item,
            count: item.count + 1,
            goldenCount: item.goldenCount + (isGolden ? 1 : 0),
            timestamp: Date.now()
          };
        });
      }

      return [{ fish, count: 1, goldenCount: isGolden ? 1 : 0, timestamp: Date.now() }, ...prev];
    });
    
    setStreak(prev => {
      const newStreak = prev + 1;
      let comboMultiplier = 1;
      if (newStreak >= 10) comboMultiplier = 3;
      else if (newStreak >= 6) comboMultiplier = 2;
      else if (newStreak >= 3) comboMultiplier = 1.5;

      const caveBonus = (env.currentLocation === 'CAVE' && state.skills.deepSeaDiver > 0) ? 1.25 : 1;
      // Hardcore: Golden multiplier reduced to 2x
      const finalValue = Math.floor((isGolden ? fish.value * 2 : fish.value) * comboMultiplier * caveBonus);
      
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
    state.updateStatsAndQuests(fish, isGolden, env.currentLocation);

    // 1. Wear and Tear logic (Hardcore - NERFED: Durability drops faster)
    const baseLoss = 2; // Increased from 1
    const rarityFactors: Record<string, number> = {
      [Rarity.JUNK]: 0.5,
      [Rarity.COMMON]: 1.2, // Increased
      [Rarity.UNCOMMON]: 2, // Increased
      [Rarity.RARE]: 4, // Increased
      [Rarity.EPIC]: 8, // Increased
      [Rarity.LEGENDARY]: 18, // Increased
      [Rarity.MYTHIC]: 40 // Significant nerf for Mythic
    };
    const weatherFactor = env.weather === 'stormy' ? 3.5 : 1;
    const totalLoss = Math.ceil(baseLoss * (rarityFactors[fish.rarity] || 1) * weatherFactor);
    
    settings.handleDurabilityChange('rod', totalLoss);
    settings.handleDurabilityChange('tackle', Math.ceil(totalLoss * 1.8)); // Tackles wear even faster now
    
    // 3. Boss spawn logic - only increment if fish was successfully caught and added
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
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    if (mobile) {
      setShowMobilePrompt(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);

      const baseWidth = 1100;
      const baseHeight = 650;
      
      let s: number;
      if (window.innerWidth < 1024) {
        // Mobile/Tablet: try to fit the container
        const padding = 20;
        const availableW = window.innerWidth - padding;
        const availableH = window.innerHeight - padding;
        s = Math.min(availableW / baseWidth, availableH / baseHeight);
      } else {
        s = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
      }
      
      setScale(Math.max(0.2, s));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 text-white overflow-hidden font-sans select-none flex items-center justify-center">
      <BubblesBackground />

      {showMobilePrompt && isMobile && (
        <MobileOptimizationPrompt onDismiss={() => setShowMobilePrompt(false)} />
      )}

      {isMobile && isPortrait && !showMobilePrompt && (
        <div className="fixed inset-0 z-[90] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
           <div className="animate-bounce mb-4">
              <svg className="w-16 h-16 text-cyan-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
           </div>
           <h3 className="text-xl font-bold text-white">Vui lòng xoay ngang</h3>
           <p className="text-slate-400 mt-2">Xoay điện thoại để bắt đầu câu cá!</p>
        </div>
      )}
      
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
          onBaitConsumed={settings.useBait}
          playerLevel={state.stats.level}
          inventoryCount={state.inventory.length}
          inventoryCapacity={state.inventoryCapacity}
          isMobile={isMobile}
          vfxEnabled={state.settings.vfxEnabled}
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
          setLocation={(loc) => {
            if (loc === 'OCEAN' && state.stats.level < 5) {
              state.addNotification("Yêu cầu Cấp độ 5 để ra Đại Dương!", "warning");
              soundManager.playError();
              return;
            }
            if (loc === 'CAVE' && state.stats.level < 12) {
              state.addNotification("Yêu cầu Cấp độ 12 để vào Hang Tối!", "warning");
              soundManager.playError();
              return;
            }
            env.setCurrentLocation(loc);
            soundManager.playClick();
          }}
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
              state.setInventory(prev => prev.reduce<InventoryItem[]>((arr, i) => {
                if (i.timestamp !== ts) return [...arr, i];
                const nextCount = i.count - 1;
                const nextGoldenCount = i.goldenCount > 0 ? i.goldenCount - 1 : 0;
                if (nextCount > 0) arr.push({ ...i, count: nextCount, goldenCount: nextGoldenCount });
                return arr;
              }, []));
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
            // Hardcore: Exponential upgrade cost
            const currentCap = state.inventoryCapacity;
            const upgradeIndex = (currentCap - 20) / 5;
            const cost = Math.floor(2500 * Math.pow(1.8, upgradeIndex));
            
            if (state.gold >= cost) {
              state.setGold(prev => prev - cost);
              state.setInventoryCapacity(prev => prev + 5);
              state.addNotification(`Đã nâng cấp túi đồ lên ${currentCap + 5} ô!`, 'success');
              soundManager.playPurchase();
            } else {
              state.addNotification(`Không đủ vàng nâng cấp! (Cần ${cost} vàng)`, 'warning');
              soundManager.playError();
            }
          }}
          buySkill={(id) => {
             // Max level caps per skill (must match SkillsTab SKILL_MAX_LEVELS)
             const SKILL_MAX: Record<string, number> = {
               sharpEye: 5, fastHands: 5, lucky: 5,
               focus: 1, powerReel: 1,
               deepSeaDiver: 3, weatherExpert: 3, masterAngler: 5,
             };
             const level = state.skills[id];
             const maxLevel = SKILL_MAX[id] ?? 5;
             if (level >= maxLevel) {
               state.addNotification(`Kỹ năng đã đạt cấp tối đa (${maxLevel})!`, 'warning');
               soundManager.playError();
               return;
             }
             // Hardcore: Exponential skill cost
             const cost = Math.floor(3000 * Math.pow(2.2, level));
             
             if (state.gold >= cost) {
                state.setGold(prev => prev - cost);
                state.setSkills(prev => ({ ...prev, [id]: prev[id] + 1 }));
                const newLevel = level + 1;
                state.addNotification(`Đã nâng cấp kỹ năng lên Cấp ${newLevel}${newLevel >= maxLevel ? ' (TỐI ĐA)' : ''}!`, 'success');
                soundManager.playPurchase();
             } else {
                state.addNotification(`Không đủ vàng nâng cấp kỹ năng! (Cần ${cost} vàng)`, 'warning');
                soundManager.playError();
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
          settings={state.settings}
          setSettings={state.setSettings}
          aquarium={state.aquarium}
          setAquarium={state.setAquarium}
          moveToAquarium={state.moveToAquarium}
          returnFromAquarium={state.returnFromAquarium}
          autoSellJunk={state.autoSellJunk}
          setAutoSellJunk={state.setAutoSellJunk}
          calculateHourlyRate={state.calculateHourlyRate}
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
