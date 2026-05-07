
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, FishInstance, FishType, RodType, TackleType, BaitType, Rarity, PlayerSkills, LocationType, TimeOfDay, NotificationType } from '../core/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FISH_TYPES, WEATHER_BONUSES } from '../core/gameData';
import * as Graphics from '../core/graphics';
import * as BossModels from '../core/fish/BossModels';
import { soundManager } from '../core/soundManager';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onFishCaught: (fish: FishType, isGolden: boolean) => void;
  onFishLost: (reason?: string) => void;
  currentRod: RodType;
  currentTackle: TackleType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  ownedTackles: string[];
  weather: 'sunny' | 'rainy' | 'stormy';
  skills: PlayerSkills;
  location: LocationType;
  timeOfDay: TimeOfDay;
  streak: number;
  onBossDefeated?: () => void;
  onSessionReset?: () => void;
  onLineBroken: () => void;
  onRodBroken: () => void;
  onCast: () => void;
  addNotification: (msg: string, type: NotificationType) => void;
  liveBait: FishType | null;
  setLiveBait: (bait: FishType | null) => void;
  isBossSpawned: boolean;
  setIsBossSpawned: (v: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  vx?: number;
  vy?: number;
  color?: string;
  type?: 'circle' | 'star' | 'trail' | 'ripple';
  life?: number;
}

type FishPersonality = 'curious' | 'shy' | 'brave';
type FishSwimStyle = 'glider' | 'jerky' | 'charger';
type FishAIState = 'wandering' | 'interested' | 'inspecting' | 'scared';

interface EnhancedFishInstance extends FishInstance {
  targetY: number;
  angle: number;
  targetAngle: number;
  personality: FishPersonality;
  swimStyle: FishSwimStyle;
  state: FishAIState;
  stateTimer: number;
  velocity: { x: number, y: number };
  baseSpeed: number;
  isGolden: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, setGameState, onFishCaught, onFishLost, currentRod, currentTackle, currentBait, baitCounts, ownedRods, ownedTackles, weather, skills, location, timeOfDay, streak, onBossDefeated, onSessionReset, onLineBroken, onRodBroken, onCast, addNotification, liveBait, setLiveBait, isBossSpawned, setIsBossSpawned
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const fishRef = useRef<EnhancedFishInstance[]>([]);
  const bubblesRef = useRef<Particle[]>([]);
  const vfxParticlesRef = useRef<Particle[]>([]);
  
  const hookX = useRef(220);
  const hookY = useRef(120);
  const targetHookX = useRef(0);
  const targetHookY = useRef(0);
  const castProgress = useRef(0);
  
  const chargePower = useRef(0);
  const chargeDirection = useRef(1);
  const activeFish = useRef<EnhancedFishInstance | null>(null);
  const frameCount = useRef(0);
  
  const isSpacePressed = useRef(false);
  
  const tensionCursor = useRef(0.5);
  const tensionVelocity = useRef(0);
  const tensionZone = useRef(0.5); 
  const tensionZoneSize = useRef(0.32); 
  const reelingProgress = useRef(0); 
  const lineHealth = useRef(100); 

  // Auto-escape logic
  const willAutoEscape = useRef(false);
  const autoEscapeTime = useRef(0);

  const jumpProgress = useRef(0);
  const isJumping = useRef(false);
  const shakeIntensity = useRef(0);
  
  const tugFactor = useRef(0);

  // Boss fight refs
  const bossHP = useRef(100);
  const bossMaxHP = useRef(100);
  const playerHP = useRef(100);
  const playerMaxHP = useRef(100);
  const bossAttackTimer = useRef(0);
  const playerAttackCharge = useRef(0);
  const isBossCharging = useRef(false);
  const bossX = useRef(CANVAS_WIDTH / 2);
  const bossY = useRef(CANVAS_HEIGHT / 2);
  
  // Special behaviors refs
  const behaviorTimer = useRef(0);
  const isBehaviorActive = useRef(false);
  const behaviorType = useRef<string | null>(null); 
  
  // Nibbling system
  const nibbleTimer = useRef(0);
  const nibbleCount = useRef(0);
  const targetNibbles = useRef(3);
  const lungeProgress = useRef(0);
  const lungeDelay = useRef(0);
  const biteWindowTimer = useRef(0);
  const isBitingHard = useRef(false);
  const baitSettleTimer = useRef(0);
  const baitSettleTotal = useRef(0); // tracks initial settle duration for progress bar
  const reelRotation = useRef(0);
  const nibbleSide = useRef(1); // 1 = from right, -1 = from left

  // Fishing Frenzy Mode
  const frenzyActive = useRef(false);
  const frenzyTimer = useRef(0); // frames remaining in frenzy (20s = 1200 frames)
  const frenzyNotified = useRef(false);

  // Perfect Cast
  const perfectCastBonus = useRef(false); // active for this cast session

  // Active Skills
  const focusActive = useRef(false);     // F - slow tension increase 3s
  const focusTimer = useRef(0);          // frames remaining
  const focusCooldown = useRef(0);       // cooldown frames (15s = 900)
  const powerReelActive = useRef(false); // G - fast reel burst 2s
  const powerReelTimer = useRef(0);
  const powerReelCooldown = useRef(0);   // cooldown 20s = 1200 frames

  const prevTimeOfDayRef = useRef<TimeOfDay>(timeOfDay);
  const transitionProgressRef = useRef(1); // 0 to 1

  useEffect(() => {
    if (timeOfDay !== prevTimeOfDayRef.current) {
        // Trigger transition if it was finished
        if (transitionProgressRef.current >= 1) {
            transitionProgressRef.current = 0;
        }
    }
  }, [timeOfDay]);

  const lerpAngle = (current: number, target: number, speed: number) => {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * speed;
  };

  const createSplash = useCallback((x: number, y: number, intensity: number = 1) => {
    vfxParticlesRef.current.push({
        x, y, size: 5, speed: 0, opacity: 1, life: 60, type: 'ripple', color: 'rgba(255,255,255,0.6)'
    });

    for(let i=0; i < 15 * intensity; i++) {
        vfxParticlesRef.current.push({
            x, y,
            size: 1.5 + Math.random() * 3 * intensity,
            speed: 1,
            vx: (Math.random() - 0.5) * 8 * intensity,
            vy: -Math.random() * 12 * intensity,
            opacity: 1,
            life: 30 + Math.random() * 20,
            color: 'rgba(255, 255, 255, 0.8)',
            type: 'circle'
        });
    }
    soundManager.playSplash();
  }, []);

  const createSparkles = useCallback((x: number, y: number, count = 20, colorSet?: string[]) => {
    const colors = colorSet || ['#fbbf24', '#f59e0b', '#ffffff', '#60a5fa'];
    for(let i=0; i<count; i++) {
        vfxParticlesRef.current.push({
            x, y,
            size: 4 + Math.random() * 6,
            speed: 1,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            opacity: 1,
            life: 60 + Math.random() * 40,
            color: colors[Math.floor(Math.random()*colors.length)],
            type: 'star'
        });
    }
  }, []);

  const getRandomFishType = useCallback((rarityBoost: number): FishType => {
    const validFishes = FISH_TYPES.filter(f => 
      (!f.allowedLocations || f.allowedLocations.includes(location)) && 
      (!f.allowedTimes || f.allowedTimes.includes(timeOfDay))
    );
    const pool = validFishes.length > 0 ? validFishes : FISH_TYPES;

    // Frenzy + Perfect Cast both boost rarity
    const frenzyBoost = frenzyActive.current ? 2.5 : 1;
    const castBoost = perfectCastBonus.current ? 1.2 : 1;

    const weightedTypes = pool.map(f => {
      let weight = f.weight;
      const weatherBonus = WEATHER_BONUSES[weather].rarity;
      
      let finalBoost = rarityBoost * frenzyBoost * castBoost;
      if (liveBait) {
          // Live bait dramatically increases chance for high rarity
          if (f.rarity === Rarity.EPIC) finalBoost *= 3;
          if (f.rarity === Rarity.LEGENDARY) finalBoost *= 8;
          if (f.rarity === Rarity.MYTHIC) finalBoost *= 15;
      }

      if (f.rarity === Rarity.RARE) weight *= (finalBoost * 0.5 + 0.5) * weatherBonus;
      if (f.rarity === Rarity.EPIC) weight *= finalBoost * weatherBonus;
      if (f.rarity === Rarity.LEGENDARY) weight *= (finalBoost * 1.5) * weatherBonus;
      if (f.rarity === Rarity.MYTHIC) weight *= (finalBoost * 2) * weatherBonus;
      return { type: f, weight };
    });
    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of weightedTypes) {
      if (random < item.weight) return item.type;
      random -= item.weight;
    }
    return pool[0];
  }, [weather, location, timeOfDay, liveBait]);

  const spawnSingleFish = useCallback(() => {
    const type = getRandomFishType(currentTackle.rarityBoost + currentBait.rarityBoost + skills.lucky * 1.5);
    const y = 300 + Math.random() * 250;
    const initialDir = Math.random() > 0.5 ? 1 : -1;
    const baseSpeed = (0.4 + Math.random() * 0.6) * WEATHER_BONUSES[weather].speed;
    const personalities: FishPersonality[] = ['curious', 'shy', 'brave'];
    const swimStyles: FishSwimStyle[] = ['glider', 'jerky', 'charger'];
    
    const isGolden = Math.random() < 0.05;

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: initialDir === 1 ? -150 : CANVAS_WIDTH + 150,
      y: y, targetY: y, speed: baseSpeed, baseSpeed: baseSpeed, direction: initialDir, type,
      angle: initialDir === 1 ? 0 : Math.PI, targetAngle: initialDir === 1 ? 0 : Math.PI,
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      swimStyle: swimStyles[Math.floor(Math.random() * swimStyles.length)],
      state: 'wandering' as FishAIState, stateTimer: Math.floor(Math.random() * 100),
      velocity: { x: initialDir * baseSpeed, y: 0 },
      isGolden
    };
  }, [currentBait, currentTackle, getRandomFishType, skills.lucky, weather]);

  const spawnInitialFish = useCallback(() => {
    const initialFish: EnhancedFishInstance[] = [];
    for (let i = 0; i < 15; i++) {
      const fish = spawnSingleFish();
      fish.x = Math.random() * CANVAS_WIDTH;
      initialFish.push(fish);
    }
    fishRef.current = initialFish;
  }, [spawnSingleFish]);

  useEffect(() => {
    spawnInitialFish();
    const initialBubbles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      initialBubbles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: CANVAS_HEIGHT + Math.random() * 100,
        size: 1 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.4
      });
    }
    bubblesRef.current = initialBubbles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); 

  // Frenzy: activate when streak crosses 10, deactivate if streak drops below 10
  useEffect(() => {
    if (streak >= 10 && !frenzyActive.current) {
      frenzyActive.current = true;
      frenzyTimer.current = 1200; // 20 seconds at 60fps
      frenzyNotified.current = false;
    }
    if (streak < 5) {
      frenzyActive.current = false;
      frenzyTimer.current = 0;
    }
  }, [streak]);

  const canStartFishing = useCallback(() => {
    const currentBaitCount = baitCounts[currentBait.id] || 0;
    const hasAvailableRod = ownedRods.includes(currentRod.id);

    if (!hasAvailableRod) {
      addNotification('Không có cần câu. Hãy mua lại cần mới.', 'warning');
      return false;
    }
    if (currentBaitCount <= 0) {
      addNotification('Đã hết mồi câu. Vui lòng mua thêm mồi câu.', 'warning');
      return false;
    }
    return true;
  }, [baitCounts, currentBait.id, currentRod.id, ownedRods, addNotification]);

  const handleHookAction = useCallback(() => {
    if (gameState === GameState.NIBBLING && activeFish.current) {
      if (isBitingHard.current) {
        // Success!
        const collidingFish = activeFish.current;
        const lineLimit = currentTackle.maxValue || 300;
        const rodLimit = currentRod.maxValue || 300;
        
        if (collidingFish.type.value > lineLimit) {
            onLineBroken();
            onFishLost("Thẻo bị đứt vì cá quá to!");
            setGameState(GameState.IDLE);
            activeFish.current = null;
            return;
        }

        if (collidingFish.type.value > rodLimit) {
            onRodBroken();
            onFishLost("Cần câu đã gãy vì cá quá nặng!");
            setGameState(GameState.IDLE);
            activeFish.current = null;
            return;
        }

        if (collidingFish.id === 'boss_dummy') {
            setGameState(GameState.BOSS_FIGHT);
            soundManager.playSuccess();
            return;
        }

        setGameState(GameState.REELING);
        reelingProgress.current = 0;
        lineHealth.current = 100;
        tensionCursor.current = 0.5;
        tensionVelocity.current = 0;
        isBehaviorActive.current = false;
        behaviorType.current = null;
        behaviorTimer.current = 100;
        if (liveBait) setLiveBait(null);
        
        const sizeMatch = Math.min(1, collidingFish.type.value / lineLimit);
        const mismatchPenalty = 1 - sizeMatch;
        tensionZoneSize.current = Math.max(0.18, 0.48 - (collidingFish.type.tension / 220) + (skills.sharpEye * 0.05) - mismatchPenalty * 0.18 + (currentBait.attraction / 1000));
        tensionZone.current = 0.5 - tensionZoneSize.current / 2;

        const goldenBoost = (currentRod.control - 1) * 0.2; 
        if (Math.random() < goldenBoost) {
            activeFish.current.isGolden = true;
        }

        const baseEscapeChance = 0.25;
        const actualEscapeChance = Math.max(0.04, baseEscapeChance - (currentRod.control - 1) * 0.15);
        willAutoEscape.current = Math.random() < actualEscapeChance;
        if (willAutoEscape.current) {
            autoEscapeTime.current = frameCount.current + 120 + Math.random() * 120;
        }

        soundManager.playSuccess();
      } else {
        // Too early
        createSplash(hookX.current, hookY.current, 1.2);
        onFishLost("Giật quá sớm rồi! Cá đã chạy mất.");
        activeFish.current = null;
      }
    }
  }, [gameState, liveBait, onFishLost, setGameState, setLiveBait, currentTackle.maxValue, currentRod.maxValue, onLineBroken, onRodBroken, skills.sharpEye, currentRod.control, currentBait.attraction, frameCount]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!isSpacePressed.current) {
        isSpacePressed.current = true;
        if (gameState === GameState.IDLE) {
          if (!canStartFishing()) return;
          setGameState(GameState.CHARGING);
          chargePower.current = 0;
          chargeDirection.current = 1;
        } else if (gameState === GameState.WAITING) {
          // Reeling back manually
        } else if (gameState === GameState.NIBBLING) {
           handleHookAction();
        } else if (gameState === GameState.REELING) {
          tensionVelocity.current -= 0.0035;
          tugFactor.current = 1.0;
        }
      }
    }
    // Active Skill: F = Focus (slow tension) — only during REELING
    if (e.code === 'KeyF' && gameState === GameState.REELING) {
      if (focusCooldown.current <= 0 && !focusActive.current) {
        focusActive.current = true;
        focusTimer.current = 180; // 3 seconds at 60fps
        focusCooldown.current = 900; // 15s cooldown
        addNotification('TẬP TRUNG! Tension chậm lại 3 giây.', 'info');
      } else if (focusCooldown.current > 0) {
        addNotification(`Tập Trung đang hồi chiêu (${Math.ceil(focusCooldown.current / 60)}s)`, 'warning');
      }
    }
    // Active Skill: G = Power Reel (boost reel speed) — only during REELING
    if (e.code === 'KeyG' && gameState === GameState.REELING) {
      if (powerReelCooldown.current <= 0 && !powerReelActive.current) {
        powerReelActive.current = true;
        powerReelTimer.current = 120; // 2 seconds
        powerReelCooldown.current = 1200; // 20s cooldown
        addNotification('KÉO MẠNH! Reeling tăng tốc 2 giây!', 'success');
      } else if (powerReelCooldown.current > 0) {
        addNotification(`Kéo Mạnh đang hồi chiêu (${Math.ceil(powerReelCooldown.current / 60)}s)`, 'warning');
      }
    }
  }, [gameState, canStartFishing, handleHookAction, addNotification, focusActive, focusCooldown, powerReelActive, powerReelCooldown, skills.fastHands]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = false;
      if (gameState === GameState.CHARGING) {
        // Perfect Cast: power >= 95%
        perfectCastBonus.current = chargePower.current >= 95;
        targetHookX.current = 220 + (chargePower.current / 100) * 500;
        targetHookY.current = 250 + (chargePower.current / 100) * 300;
        castProgress.current = 0;
        onCast();
        setGameState(GameState.CASTING);
      }
    }
  }, [gameState, setGameState, onCast]);


  const handlePressStart = useCallback(() => {
    if (!isSpacePressed.current) {
      isSpacePressed.current = true;
      if (gameState === GameState.IDLE) {
        if (!canStartFishing()) return;
        setGameState(GameState.CHARGING);
        chargePower.current = 0;
        chargeDirection.current = 1;
      } else if (gameState === GameState.NIBBLING) {
        handleHookAction();
      } else if (gameState === GameState.BOSS_FIGHT) {
        isBossCharging.current = true;
      }
      if (gameState === GameState.REELING) {
        tensionVelocity.current -= 0.0035;
        tugFactor.current = 1.0;
      }
    }
  }, [gameState, canStartFishing, handleHookAction]);

  const handlePressEnd = useCallback(() => {
    isSpacePressed.current = false;
    if (gameState === GameState.CHARGING) {
      // Perfect Cast: power >= 95%
      perfectCastBonus.current = chargePower.current >= 95;
      targetHookX.current = 220 + (chargePower.current / 100) * 500;
      targetHookY.current = 250 + (chargePower.current / 100) * 300;
      castProgress.current = 0;
      onCast();
      setGameState(GameState.CASTING);
    } else if (gameState === GameState.BOSS_FIGHT) {
      isBossCharging.current = false;
      
      // Execute attack if charge is high enough
      if (playerAttackCharge.current > 20) {
        const charge = playerAttackCharge.current;
        let damage = (charge / 100) * (20 + skills.sharpEye * 5);
        
        const hpRatio = bossHP.current / bossMaxHP.current;
        const attackThreshold = hpRatio < 0.5 ? 70 : 100;
        const isWarning = bossAttackTimer.current > attackThreshold - 25;
        
        if (isWarning) {
            damage *= 2.5;
            addNotification('PHẢN ĐÒN HOÀN HẢO! (CRITICAL)', 'success');
            createSparkles(bossX.current, bossY.current, 60, ['#ffffff', '#fef08a', '#fbbf24']);
            bossAttackTimer.current = -30;
        } else {
            createSparkles(bossX.current, bossY.current, 30, ['#ef4444', '#f87171', '#ffffff']);
        }

        bossHP.current = Math.max(0, bossHP.current - damage);
        Graphics.triggerBossHitFlash();
        playerAttackCharge.current = 0;
        shakeIntensity.current = 8;

        if (bossHP.current <= 0) {
          setTimeout(() => {
            addNotification("CHIẾN THẮNG BOSS HUYỀN THOẠI!", 'success');
            setIsBossSpawned(false);
            setGameState(GameState.CAUGHT);
            isJumping.current = true;
            jumpProgress.current = 0;
            hookX.current = bossX.current;
            hookY.current = bossY.current;
            if (onBossDefeated) onBossDefeated();
            if (onSessionReset) onSessionReset();
            createSparkles(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, ['#fbbf24', '#f59e0b', '#ffffff']);
          }, 1000);
        }
      }
    }
  }, [gameState, setGameState, addNotification, onBossDefeated, onSessionReset, onCast, skills.sharpEye, bossMaxHP, bossHP]);

  useEffect(() => {
    const handleBlur = () => { isSpacePressed.current = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp]);

  const update = useCallback((ctx: CanvasRenderingContext2D) => {
    frameCount.current++;
    ctx.save();

    if (gameState === GameState.REELING) {
        const ft = activeFish.current?.type.tension || 0;
        const lineDamaged = Math.max(0, 100 - lineHealth.current);
        shakeIntensity.current = (ft / 80) + (lineDamaged / 40);
    } else if (gameState === GameState.CAUGHT && isJumping.current) {
        shakeIntensity.current = 1.5;
    } else {
        shakeIntensity.current *= 0.92;
    }

    if (shakeIntensity.current > 0.05) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity.current, (Math.random() - 0.5) * shakeIntensity.current);
    }

    // --- SAFETY WATCHDOG ---
    if (gameState === GameState.REELING && !activeFish.current) {
        setGameState(GameState.IDLE);
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- FRENZY MODE COUNTDOWN ---
    if (frenzyActive.current) {
      frenzyTimer.current--;
      // Notify on activation
      if (!frenzyNotified.current) {
        frenzyNotified.current = true;
        addNotification('🔥 FISHING FRENZY! Cá hiếm xuất hiện nhiều hơn!', 'achievement');
      }
      // Frenzy ends when timer hits 0
      if (frenzyTimer.current <= 0) {
        frenzyActive.current = false;
        frenzyTimer.current = 0;
        addNotification('Frenzy kết thúc...', 'info');
      }
      // Every 60 frames during frenzy: spawn an extra fish for density
      if (frameCount.current % 60 === 0 && fishRef.current.length < 25) {
        fishRef.current.push(spawnSingleFish());
      }
      // Frenzy screen tint: pulsing red/orange glow at edges
      const frenzyPulse = 0.08 + Math.sin(frameCount.current * 0.12) * 0.04;
      const frenzyGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
      );
      frenzyGrad.addColorStop(0, 'rgba(0,0,0,0)');
      frenzyGrad.addColorStop(1, `rgba(239,68,68,${frenzyPulse})`);
      ctx.fillStyle = frenzyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Frenzy timer bar at top
      const frenzyBarW = 300;
      const frenzyBarX = (CANVAS_WIDTH - frenzyBarW) / 2;
      const frenzyRatio = frenzyTimer.current / 1200;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.roundRect(frenzyBarX - 2, 14, frenzyBarW + 4, 12, 6); ctx.fill();
      const frenzyColor = frenzyTimer.current < 300 ? '#ef4444' : '#f97316';
      ctx.fillStyle = frenzyColor;
      ctx.roundRect(frenzyBarX, 16, frenzyBarW * frenzyRatio, 8, 4); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
      ctx.fillText(`🔥 FRENZY ${Math.ceil(frenzyTimer.current / 60)}s`, CANVAS_WIDTH / 2, 13);
    }

    // Update Time Transition
    if (transitionProgressRef.current < 1) {
        transitionProgressRef.current += 0.003; // ~5.5 seconds transition at 60fps
        if (transitionProgressRef.current >= 1) {
            transitionProgressRef.current = 1;
            prevTimeOfDayRef.current = timeOfDay;
        }
    }

    Graphics.drawWaterAndSky(
        ctx, 
        frameCount.current, 
        weather, 
        location, 
        timeOfDay, 
        prevTimeOfDayRef.current, 
        transitionProgressRef.current
    );

    // --- AMBIENT EFFECTS ---
    // God Rays: Ocean + Day/Sunset only
    if (location === 'OCEAN' && timeOfDay !== 'NIGHT') {
      Graphics.drawGodRays(ctx, frameCount.current);
    }
    // Fireflies + Leaf Fall: Pond Night only
    if (location === 'POND' && timeOfDay === 'NIGHT') {
      Graphics.drawAmbientNight(ctx, frameCount.current);
    }

    bubblesRef.current.forEach(b => {
      b.y -= b.speed; if (b.y < 200) b.y = CANVAS_HEIGHT + 20;
    });
    Graphics.drawBubbles(ctx, bubblesRef.current);

    vfxParticlesRef.current = vfxParticlesRef.current.filter(p => {
        p.x += (p.vx || 0);
        p.y += (p.vy || 0);
        if (p.type === 'ripple') {
            p.size += 1.5;
            p.opacity *= 0.95;
        } else {
            if (p.vy !== undefined) p.vy += (p.type === 'trail' ? 0.02 : 0.3); 
            p.opacity = (p.life || 1) / 50;
        }
        if (p.life !== undefined) p.life--;
        return (p.life || 1) > 0 && p.opacity > 0.01;
    });
    Graphics.drawVFXParticles(ctx, vfxParticlesRef.current);

    const pX = 80; const pY = 150; 
    const rodEndX = 220; const rodEndY = 120; 

    // Update reel rotation when reeling or waiting and pressing space
    if (isSpacePressed.current && (gameState === GameState.REELING || gameState === GameState.WAITING)) {
        reelRotation.current += 0.25;
    }

    if (baitSettleTimer.current > 0) baitSettleTimer.current--;
    const canAttractFish = gameState === GameState.WAITING && baitSettleTimer.current <= 0;
    const hookInWater = gameState === GameState.WAITING || gameState === GameState.REELING;
    let highestInterestedRarity: Rarity | null = null;

    fishRef.current.forEach(f => {
      if (activeFish.current?.id === f.id) return; 
      const dx = hookX.current - f.x; const dy = hookY.current - f.y;
      const distSq = dx * dx + dy * dy;
      const lineLimit = currentTackle.maxValue || 300;
      const sizeMatchRatio = Math.min(1, f.type.value / lineLimit);
      const attractRange = (currentTackle.attraction + currentBait.attraction) * WEATHER_BONUSES[weather].attraction * (0.6 + sizeMatchRatio * 0.6) + 60;
      const interestChance = 0.4 + sizeMatchRatio * 0.5;
      f.stateTimer--;
      if (canAttractFish && distSq < attractRange * attractRange) {
        const isNearPier = hookX.current < 300;
        const scaredRange = isNearPier ? 60 : 100; // Less scared if cast near pier

        // Only roll to change state if not already reacting to the bait
        if (f.state !== 'interested' && f.state !== 'scared') {
          // Adjust random chance because it runs every frame (~60fps). 
          // Divide by 20 so it reacts naturally over time instead of flickering.
          if (Math.random() < interestChance / 20) {
            if (f.personality === 'shy' && distSq < scaredRange * scaredRange) {
              f.state = 'scared'; f.targetAngle = Math.atan2(-dy, -dx); f.stateTimer = 120;
            } else {
              f.state = 'interested'; 
            }
          }
        }

        if (f.state === 'scared') {
          f.targetAngle = Math.atan2(-dy, -dx);
        } else if (f.state === 'interested') {
          // Shy fish gets spooked if it gets too close
          if (f.personality === 'shy' && distSq < scaredRange * scaredRange) {
            f.state = 'scared'; f.targetAngle = Math.atan2(-dy, -dx); f.stateTimer = 120;
          } else {
            // Prevent target angle from snapping/flipping wildly when extremely close to hook
            if (distSq > 150) {
                f.targetAngle = Math.atan2(dy, dx);
            }
            f.targetY = hookY.current; 

            if ([Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) {
              if (!highestInterestedRarity || f.type.rarity === Rarity.MYTHIC || (f.type.rarity === Rarity.LEGENDARY && highestInterestedRarity === Rarity.EPIC)) {
                highestInterestedRarity = f.type.rarity;
              }
            }
          }
        }
      } else {
        if (f.state === 'interested' || f.state === 'scared') { f.state = 'wandering'; f.stateTimer = 0; }
        if (f.stateTimer <= 0) {
          f.state = Math.random() > 0.8 ? 'inspecting' : 'wandering';
          f.stateTimer = 60 + Math.random() * 180;
          if (f.state === 'wandering') {
            const wanderDir = f.velocity.x > 0 ? 0 : Math.PI;
            f.targetAngle = (Math.random() - 0.5) * 0.8 + wanderDir; f.targetY = 250 + Math.random() * 300;
          }
        }
      }
      let moveSpeed = f.baseSpeed;
      if (f.state === 'scared') moveSpeed *= 2.8;
      else if (f.state === 'interested') moveSpeed *= 1.1; // More calm approach
      else if (f.state === 'inspecting') moveSpeed *= 0.2;
      if (f.swimStyle === 'jerky') { const pulse = Math.sin(frameCount.current * 0.15); moveSpeed *= (pulse > 0 ? 2.0 : 0.1); }
      else if (f.swimStyle === 'charger') { moveSpeed *= 1.6; }
      const dx_hook = hookX.current - f.x;
      const dy_hook = hookY.current - f.y;
      const distToHook = Math.sqrt(dx_hook * dx_hook + dy_hook * dy_hook);

      // Prevent jitter when very close to hook
      if (f.state === 'interested' && distToHook < 15) {
          moveSpeed *= 0.2; // Slow down significantly
          if (distToHook < 5) moveSpeed = 0; // Stop
      }

      f.angle = lerpAngle(f.angle, f.targetAngle, f.state === 'scared' ? 0.25 : (f.state === 'interested' ? 0.03 : 0.06));
      const vx = Math.cos(f.angle) * moveSpeed; const vy = Math.sin(f.angle) * moveSpeed;
      f.velocity = { x: vx, y: vy }; f.x += vx; 
      
      // Smooth Y movement
      const yForce = (f.targetY - f.y) * 0.015;
      f.y += vy + yForce;

      if (f.x > CANVAS_WIDTH + 200) { f.x = -190; f.direction = 1; }
      if (f.x < -200) { f.x = CANVAS_WIDTH + 190; f.direction = -1; }
      if (f.y < 220) f.y = 220; if (f.y > CANVAS_HEIGHT) f.y = CANVAS_HEIGHT;
      
      Graphics.drawFishTexture(ctx, f.type, frameCount.current, false, { x: f.x, y: f.y, angle: f.angle, direction: 1 }, moveSpeed, f.swimStyle, false, f.isGolden);
      
      if (f.state === 'interested' && [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) {
        Graphics.drawAlert(ctx, f.x, f.y, f.type.rarity);
      }
    });

    if (highestInterestedRarity && hookInWater) { Graphics.drawRareDetectionFlash(ctx, highestInterestedRarity); }
    if (gameState === GameState.IDLE) { hookX.current = rodEndX; hookY.current = rodEndY; }

    if (gameState === GameState.CHARGING) {
      chargePower.current += 1.8 * chargeDirection.current;
      if (chargePower.current >= 100) { chargePower.current = 100; chargeDirection.current = -1; }
      if (chargePower.current <= 0) { chargePower.current = 0; chargeDirection.current = 1; }
      Graphics.drawPowerBar(ctx, pX + 50, pY - 60, chargePower.current);
      hookX.current = rodEndX; hookY.current = rodEndY;
    }

    if (gameState === GameState.CASTING) {
      castProgress.current += 0.025; 
      
      // Safety: reset if stuck in casting
      if (castProgress.current > 1.5) {
        setGameState(GameState.IDLE);
        return;
      }

      hookX.current = rodEndX + (targetHookX.current - rodEndX) * castProgress.current;
      const t = castProgress.current;
      hookY.current = (1 - t) * rodEndY + t * targetHookY.current + (-200 * 4 * t * (1 - t));
      
      if (frameCount.current % 1 === 0) {
          vfxParticlesRef.current.push({
              x: hookX.current + (Math.random()-0.5)*10, y: hookY.current + (Math.random()-0.5)*10, 
              size: 1 + Math.random()*2, speed: 0, opacity: 0.6, life: 10, 
              color: 'rgba(255,255,255,0.4)', type: 'trail'
          });
      }

      if (castProgress.current >= 1) {
        hookX.current = targetHookX.current; hookY.current = targetHookY.current;
        createSplash(hookX.current, hookY.current, perfectCastBonus.current ? 2.0 : 1.2);
        setGameState(GameState.WAITING);
        // Settle timer: Perfect Cast = faster (2-3s), Normal = 4-8s, Frenzy = 1.5-3s
        const baseSettle = frenzyActive.current
          ? 90 + Math.random() * 90     // Frenzy: 1.5–3s
          : perfectCastBonus.current
            ? 120 + Math.random() * 60  // Perfect: 2–3s
            : 240 + Math.random() * 240; // Normal: 4–8s
        baitSettleTimer.current = baseSettle;
        baitSettleTotal.current = baseSettle;
        if (perfectCastBonus.current) {
          addNotification('QUĂNG HOÀN HẢO! +20% Attraction', 'success');
        }
      }
    }

    if (gameState === GameState.WAITING) {
      // Manual Reeling in Waiting State
      if (isSpacePressed.current) {
        const dx = rodEndX - hookX.current;
        const dy = rodEndY - hookY.current;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 20) {
            hookX.current += (dx / dist) * 4.5;
            hookY.current += (dy / dist) * 4.5;
            if (frameCount.current % 15 === 0) createSplash(hookX.current, hookY.current, 0.3);
        } else {
            setGameState(GameState.IDLE);
        }
      } else {
        hookY.current += Math.sin(frameCount.current * 0.1) * 0.3;
      }

      // --- BAIT SETTLE VISUAL BAR (no text, bar only) ---
      if (baitSettleTimer.current > 0) {
        baitSettleTimer.current--;
        const settleRatio = baitSettleTimer.current / Math.max(1, baitSettleTotal.current);
        const bx = hookX.current - 35;
        const by = hookY.current - 30;
        const barW = 70;
        const barH = 7;

        // Track background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 5); ctx.fill();

        // Progress fill — yellow → green when ready
        const fillW = barW * (1 - settleRatio);
        ctx.fillStyle = settleRatio > 0 ? '#facc15' : '#22c55e';
        ctx.beginPath(); ctx.roundRect(bx, by, Math.max(2, fillW), barH, 3); ctx.fill();
      }

      const isBossBite = isBossSpawned && baitSettleTimer.current <= 0;

      const collidingFish = isBossBite ? {
          id: 'boss_dummy',
          type: {
              name: location === 'OCEAN' ? 'KRAKEN VỰC THẲM' : (location === 'CAVE' ? 'BẠCH TUỘC MA' : 'CÁ MẬP CƠ KHÍ'),
              value: 5000,
              weight: 9999,
              rarity: Rarity.MYTHIC,
              size: 100,
              speed: 5.0,
              description: 'Boss huyền thoại',
              color: '#ef4444',
              tension: 90,
              spriteInfo: { color: '#ef4444', shape: 'shark' }
          },
          x: hookX.current,
          y: hookY.current,
          targetY: hookY.current,
          angle: 0,
          targetAngle: 0,
          personality: 'brave' as FishPersonality,
          swimStyle: 'charger' as FishSwimStyle,
          state: 'interested' as FishAIState,
          stateTimer: 60,
          velocity: { x: 0, y: 0 },
          baseSpeed: 5.0,
          isGolden: false,
          speed: 5.0,
          direction: 1
      } : (baitSettleTimer.current <= 0) ? fishRef.current.find(f => {
        if (!f) return false;
        // Calculate mouth position based on angle and size
        const mouthX = f.x + Math.cos(f.angle) * f.type.size;
        const mouthY = f.y + Math.sin(f.angle) * f.type.size;
        
        const dx = mouthX - hookX.current;
        const dy = mouthY - hookY.current;
        const d2 = dx*dx + dy*dy;
        return d2 < 20*20; // Tight mouth collision
      }) : null;

      if (collidingFish) {
        activeFish.current = collidingFish;
        // Determine which side the fish is approaching from
        nibbleSide.current = collidingFish.x < hookX.current ? -1 : 1;
        // Always angle=0; direction controls flip so mouth offset works correctly
        activeFish.current.angle = 0;
        
        // Place fish at retreat position immediately
        activeFish.current.x = hookX.current + 35 * nibbleSide.current;
        activeFish.current.y = hookY.current + 2;
        lungeProgress.current = 0;
        lungeDelay.current = 20 + Math.random() * 30; // Short pause before first approach
        
        setGameState(GameState.NIBBLING);
        nibbleTimer.current = 30 + Math.random() * 40;
        nibbleCount.current = 0;
        
        const rarity = collidingFish.type.rarity;
        let minN = 1, maxN = 3;
        if (isBossBite) { minN = 5; maxN = 8; }
        else if (rarity === Rarity.RARE) { minN = 2; maxN = 4; }
        else if (rarity === Rarity.EPIC) { minN = 3; maxN = 5; }
        else if (rarity === Rarity.LEGENDARY) { minN = 4; maxN = 6; }
        else if (rarity === Rarity.MYTHIC) { minN = 5; maxN = 8; }
        targetNibbles.current = Math.floor(Math.random() * (maxN - minN + 1)) + minN;

        isBitingHard.current = false;
        soundManager.playClick();
      }
    }

    if (gameState === GameState.NIBBLING && activeFish.current) {
        activeFish.current.angle = 0; // Always 0, direction handles sprite flip
        if (isBitingHard.current) {
            // When biting hard, fish MUST be at the hook
            activeFish.current.x = hookX.current;
            activeFish.current.y = hookY.current + 2;
            
            biteWindowTimer.current--;
            if (biteWindowTimer.current <= 0) {
                createSplash(hookX.current, hookY.current, 1.0);
                onFishLost("Hụt rồi! Cá đã sổng mất.");
                activeFish.current = null;
            }
        } else {
            // Advanced animation for nibbling: random delays between lunges
            const side = nibbleSide.current; // -1 = from left, 1 = from right
            const retreatDist = 35 * side; // Retreat to same side fish came from
            if (lungeDelay.current > 0) {
                lungeDelay.current--;
                activeFish.current.x = hookX.current + retreatDist;
            } else {
                lungeProgress.current += 0.035;
                // Lunge: 0=retreat, 1=hook-touch, 0=retreat again
                const lunge = Math.sin(lungeProgress.current * Math.PI);
                activeFish.current.x = hookX.current + retreatDist * (1 - lunge);
                
                // Splash and shake only at mouth-touch peak
                if (lunge > 0.9) {
                    hookX.current += (Math.random() - 0.5) * 1.2;
                    if (frameCount.current % 10 === 0) createSplash(hookX.current, hookY.current, 0.4);
                }

                if (lungeProgress.current >= 1) {
                    lungeProgress.current = 0;
                    lungeDelay.current = 60 + Math.random() * 90; 
                }
            }
            
            // Stabilize Y position to prevent up-down jitter
            activeFish.current.y = hookY.current + 2;

            nibbleTimer.current--;
            if (nibbleTimer.current <= 0) {
                nibbleCount.current++;
                if (nibbleCount.current >= targetNibbles.current) { 
                    isBitingHard.current = true;
                    // Extended window: 0.6s to 1.2s
                    biteWindowTimer.current = 70 - (activeFish.current.type.tension / 6); 
                    biteWindowTimer.current = Math.max(40, biteWindowTimer.current);
                    createSplash(hookX.current, hookY.current, 2.2);
                    soundManager.playSplash();
                } else {
                    // Small nibble splash
                    nibbleTimer.current = 35 + Math.random() * 45;
                    createSplash(hookX.current, hookY.current, 0.5);
                    soundManager.playClick();
                }
            }
        }
        // Horizontal shake only
        hookX.current += (Math.random() - 0.5) * 0.8;

        // Draw fish: direction faces toward hook (-nibbleSide)
        Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, 
            { x: activeFish.current.x, y: activeFish.current.y, angle: activeFish.current.angle, direction: -nibbleSide.current }, 
            0.5, activeFish.current.swimStyle, false, activeFish.current.isGolden);

        // Bite indicator (Only show !, no fish names)
        if (isBitingHard.current) {
            ctx.save();
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'white';
            ctx.fillText('!', hookX.current, hookY.current - 50);
            ctx.restore();
        }
    }

    if (gameState === GameState.REELING && activeFish.current) {
      // --- 4. SPECIAL BEHAVIORS (Task #1.1) ---
      const fishBehavior = activeFish.current.type.behavior;
      if (fishBehavior && fishBehavior !== 'NORMAL') {
        behaviorTimer.current--;
        if (behaviorTimer.current <= 0) {
          if (isBehaviorActive.current) {
            isBehaviorActive.current = false;
            behaviorType.current = null;
            behaviorTimer.current = 180 + Math.random() * 240; // Cooldown
          } else {
            isBehaviorActive.current = true;
            behaviorTimer.current = 45 + Math.random() * 60; // Duration
            if (fishBehavior === 'LEAPER') behaviorType.current = 'jump';
            else if (fishBehavior === 'DIVER') behaviorType.current = 'dive';
            else if (fishBehavior === 'AGGRESSIVE') behaviorType.current = 'thrash';
            
            if (behaviorType.current === 'jump') {
              createSplash(hookX.current, hookY.current, 1.2);
            } else if (behaviorType.current === 'dive') {
              soundManager.playClick();
            }
          }
        }
      }

      if (isBehaviorActive.current && behaviorType.current) {
          Graphics.drawBehaviorIcon(ctx, hookX.current, hookY.current, behaviorType.current as any);
      }

      const lineLimit = currentTackle.maxValue || 300;
      const sizeMatch = Math.min(1, activeFish.current.type.value / lineLimit);
      const mismatchPenalty = 1 - sizeMatch;
      const dx = rodEndX - hookX.current; const dy = rodEndY - hookY.current;
      const distToRod = Math.sqrt(dx*dx + dy*dy);
      if (distToRod > 15) {
        const targetReelAngle = Math.atan2(dy, dx);
        activeFish.current.angle = lerpAngle(activeFish.current.angle, targetReelAngle, 0.2);
      }
      if (tugFactor.current > 0) tugFactor.current -= 0.12;
      if (tugFactor.current < 0) tugFactor.current = 0;
      
      let jumpOffsetY = 0;
      if (isBehaviorActive.current && behaviorType.current === 'jump') {
          const t = (behaviorTimer.current % 60) / 60;
          jumpOffsetY = Math.sin(t * Math.PI) * 80;
      }

      const tugX = Math.cos(activeFish.current.angle) * (tugFactor.current * 10);
      const tugY = Math.sin(activeFish.current.angle) * (tugFactor.current * 10);
      Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, { x: hookX.current - tugX, y: hookY.current - tugY - jumpOffsetY, angle: activeFish.current.angle, direction: 1 }, 2.5, activeFish.current.swimStyle, false, activeFish.current.isGolden);

      const ft = activeFish.current.type.tension;

      if (willAutoEscape.current && frameCount.current >= autoEscapeTime.current) {
          createSplash(hookX.current, hookY.current, 1.5);
          onFishLost("Cá đã sổng mất rồi!");
          activeFish.current = null;
          willAutoEscape.current = false;
          return;
      }

      const gravity = (0.00045 + (ft / 160000)) / currentRod.control; 
      const lift = 0.00135 * currentRod.control; 
      
      let finalGravity = gravity;
      let finalLift = lift;

      if (isBehaviorActive.current) {
        if (behaviorType.current === 'dive') finalGravity += 0.006;
        if (behaviorType.current === 'thrash') {
           tensionCursor.current += (Math.random() - 0.5) * 0.035;
        }
      }

      // --- ACTIVE SKILL TIMERS & EFFECTS ---
      if (focusActive.current) {
        focusTimer.current--;
        if (focusTimer.current <= 0) {
          focusActive.current = false;
        }
      }
      if (focusCooldown.current > 0) focusCooldown.current--;

      if (powerReelActive.current) {
        powerReelTimer.current--;
        if (powerReelTimer.current <= 0) {
          powerReelActive.current = false;
        }
      }
      if (powerReelCooldown.current > 0) powerReelCooldown.current--;

      // Focus: reduce gravity by 60%
      const focusMultiplier = focusActive.current ? 0.4 : 1;
      // PowerReel: boosted lift
      const powerReelLift = powerReelActive.current ? 1.8 : 1;

      if (isSpacePressed.current) tensionVelocity.current -= finalLift * powerReelLift;
      else tensionVelocity.current += finalGravity * focusMultiplier;
      tensionVelocity.current *= 0.95;
      tensionCursor.current += tensionVelocity.current;
      tensionCursor.current = Math.max(0, Math.min(1, tensionCursor.current));
      
      // --- 2. DYNAMIC MOVEMENT PATTERNS (Task #2) ---
      const rarity = activeFish.current.type.rarity;
      // ft is already declared above at line 491
      
      let zoneSpeed = 0.005 + (ft / 120000); 
      let wobble = 0.002 + ft / 80000;
      let jitter = (Math.random() - 0.5) * (ft / 4000);

      // Specific patterns based on rarity
      if (rarity === Rarity.RARE || rarity === Rarity.EPIC) {
        zoneSpeed *= 1.4;
        wobble *= 1.5;
        if (frameCount.current % 120 < 10) jitter *= 5; // Jerky burst
      } else if (rarity === Rarity.LEGENDARY || rarity === Rarity.MYTHIC) {
        zoneSpeed *= 2.0;
        wobble *= 2.2;
        // Fake-out: sudden reversal
        const reversal = Math.sin(frameCount.current * 0.02) > 0.95 ? -1 : 1;
        zoneSpeed *= reversal;
        if (frameCount.current % 60 < 5) jitter *= 8; // Extreme jitter
      }

      tensionZone.current += Math.sin(frameCount.current * zoneSpeed) * wobble + jitter;
      const hz = tensionZoneSize.current / 2; tensionZone.current = Math.max(hz, Math.min(1 - hz, tensionZone.current));
      const isInZone = Math.abs(tensionCursor.current - tensionZone.current) < hz;
      
      const progressFactor = 0.8 + sizeMatch * 0.2;
      const powerReelBoost = powerReelActive.current ? 2.0 : 1;
      if (isInZone) {
        reelingProgress.current += Math.max(0.12, 0.35 - (ft / 450)) * (1 + skills.fastHands * 0.25) * progressFactor * powerReelBoost;
        lineHealth.current = Math.min(100, lineHealth.current + 0.5 * progressFactor); // faster recovery
        hookX.current = Math.max(rodEndX + 20, hookX.current - 0.5);
      } else {
        // Reduced damage: 0.15 base (was 0.35) so bar stays green longer for casual play
        let damage = (0.15 + (ft / 600) + mismatchPenalty * 0.15) / currentRod.lineStrength; 
        
        // Behavior penalties
        if (isBehaviorActive.current) {
            if (behaviorType.current === 'jump' && isSpacePressed.current) {
                damage *= 4.5; // Massive damage if reeling while jumping
                shakeIntensity.current = 10;
            }
            if (behaviorType.current === 'thrash') damage *= 1.4;
        }

        lineHealth.current -= damage;
        if (frameCount.current % 5 === 0) {
            vfxParticlesRef.current.push({
                x: (rodEndX + hookX.current)/2, y: (rodEndY + hookY.current)/2, 
                size: 2, speed: 1, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
                life: 15, opacity: 0.8, color: '#ef4444', type: 'circle'
            });
        }
      }

      if (reelingProgress.current >= 100) { 
        setGameState(GameState.CAUGHT); isJumping.current = true; jumpProgress.current = 0; 
        createSparkles(hookX.current, hookY.current, 40, ['#fbbf24', '#f59e0b', '#ffffff']);
      }      
      if (lineHealth.current <= 0) {
        const lineLimit = currentTackle.maxValue || 300;
        const rodLimit = currentRod.maxValue || 300;
        
        // --- 3. LOSS ANIMATION (Task #3) ---
        createSplash(hookX.current, hookY.current, 1.2);
        for(let i=0; i<10; i++) {
            vfxParticlesRef.current.push({
                x: hookX.current, y: hookY.current,
                size: 2 + Math.random()*4, speed: 0.5,
                vx: (Math.random()-0.5)*4, vy: 2 + Math.random()*4, // Diving down
                opacity: 0.8, life: 40, color: 'rgba(255,255,255,0.4)', type: 'circle'
            });
        }

        if (activeFish.current?.type.value > lineLimit) {
          onLineBroken(); 
          onFishLost("Thẻo bị đứt vì cá quá to!");
        } else if (activeFish.current?.type.value > rodLimit) {
          onRodBroken();
          onFishLost("Cần câu đã gãy vì cá quá nặng!");
        } else {
          onFishLost("Cá đã sổng mất rồi!");
        }
        activeFish.current = null;
      }
      
      if (frameCount.current % 8 === 0) {
        soundManager.playReel(Math.abs(tensionCursor.current - tensionZone.current) * 2);
      }

      Graphics.drawReelingInterface(ctx, reelingProgress.current, lineHealth.current, tensionCursor.current, tensionZone.current, tensionZoneSize.current, isInZone, activeFish.current?.type);
      
      // Behavior Indicators on UI
      if (isBehaviorActive.current) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.fillStyle = behaviorType.current === 'jump' ? '#ef4444' : '#fbbf24';
        const label = behaviorType.current === 'jump' ? '⚠️ CÁ NHẢY - THẢ SPACE!' : (behaviorType.current === 'dive' ? '⬇️ CÁ ĐANG LẶN!' : '💢 CÁ VÙNG VẪY!');
        ctx.fillText(label, CANVAS_WIDTH / 2, 170);
        ctx.restore();
      }

      // --- Active Skill HUD (bottom right corner) ---
      const skillHudX = CANVAS_WIDTH - 180;
      const skillHudY = CANVAS_HEIGHT - 110;
      ctx.save();
      // Focus skill (F)
      const focusReady = focusCooldown.current <= 0 && !focusActive.current;
      ctx.globalAlpha = focusActive.current ? 1 : (focusReady ? 0.9 : 0.45);
      ctx.fillStyle = focusActive.current ? '#60a5fa' : (focusReady ? '#1e40af' : '#334155');
      ctx.roundRect(skillHudX, skillHudY, 76, 40, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      ctx.fillText('[F] TẬP TRUNG', skillHudX + 38, skillHudY + 13);
      if (focusActive.current) {
        ctx.fillStyle = '#bfdbfe';
        ctx.fillText(`${Math.ceil(focusTimer.current / 60)}s`, skillHudX + 38, skillHudY + 30);
      } else if (!focusReady) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${Math.ceil(focusCooldown.current / 60)}s CD`, skillHudX + 38, skillHudY + 30);
      } else {
        ctx.fillStyle = '#93c5fd'; ctx.fillText('SẶN SÀNG', skillHudX + 38, skillHudY + 30);
      }
      // PowerReel skill (G)
      const prReady = powerReelCooldown.current <= 0 && !powerReelActive.current;
      ctx.globalAlpha = powerReelActive.current ? 1 : (prReady ? 0.9 : 0.45);
      ctx.fillStyle = powerReelActive.current ? '#fb923c' : (prReady ? '#9a3412' : '#334155');
      ctx.roundRect(skillHudX + 84, skillHudY, 76, 40, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.textAlign = 'center';
      ctx.fillText('[G] KÉO MẠNH', skillHudX + 122, skillHudY + 13);
      if (powerReelActive.current) {
        ctx.fillStyle = '#fed7aa';
        ctx.fillText(`${Math.ceil(powerReelTimer.current / 60)}s`, skillHudX + 122, skillHudY + 30);
      } else if (!prReady) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${Math.ceil(powerReelCooldown.current / 60)}s CD`, skillHudX + 122, skillHudY + 30);
      } else {
        ctx.fillStyle = '#fdba74'; ctx.fillText('SẴN SÀNG', skillHudX + 122, skillHudY + 30);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (gameState === GameState.CAUGHT && activeFish.current) {
      if (isJumping.current) {
        const dx = (80 - hookX.current) * 0.1; const dy = (150 - hookY.current) * 0.1;
        hookX.current += dx; hookY.current += dy;
        jumpProgress.current += 0.035;
        const jX = hookX.current; const jY = hookY.current - Math.sin(Math.PI * jumpProgress.current) * 100; 
        const finalTargetAngle = (Math.PI * 1.5) + (jumpProgress.current * 4);
        activeFish.current.angle = lerpAngle(activeFish.current.angle, finalTargetAngle, 0.12);
        
        if (frameCount.current % 2 === 0) {
            vfxParticlesRef.current.push({
                x: jX + (Math.random() - 0.5) * 10, 
                y: jY + (Math.random() - 0.5) * 10, 
                size: 2 + Math.random() * 4,
                speed: 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 25,
                opacity: 1,
                color: '#fbbf24',
                type: 'star'
            });
        }

        Graphics.drawFishTexture(
            ctx, activeFish.current.type, frameCount.current, true, 
            { x: jX, y: jY, angle: activeFish.current.angle, direction: 1 }, 
            2.2, activeFish.current.swimStyle, true, activeFish.current.isGolden
        );

        if (jumpProgress.current >= 1 || (Math.abs(80 - hookX.current) < 10)) { 
          const caughtType = activeFish.current.type; const caughtId = activeFish.current.id;
          const isGolden = activeFish.current.isGolden;
          
          createSparkles(80, 150, isGolden ? 60 : 30, ['#fbbf24', '#f59e0b', '#ffffff']);

          fishRef.current = fishRef.current.filter(f => f.id !== caughtId);
          onFishCaught(caughtType, isGolden); activeFish.current = null; isJumping.current = false; 
          fishRef.current.push(spawnSingleFish());
        }
      }
    }

    if (gameState === GameState.BOSS_FIGHT) {
      // --- BOSS FIGHT AI (Enhanced) ---
      const time = frameCount.current * 0.05;
      const hpRatio = bossHP.current / bossMaxHP.current;
      const isEnraged = hpRatio < 0.5;
      
      // Dynamic Boss Movement (More erratic when enraged)
      const moveSpeed = isEnraged ? 1.5 : 1.0;
      bossX.current = CANVAS_WIDTH / 2 + Math.cos(time * 0.8 * moveSpeed) * (150 + (isEnraged ? 50 : 0));
      bossY.current = CANVAS_HEIGHT / 2 + Math.sin(time * 1.2 * moveSpeed) * (80 + (isEnraged ? 30 : 0));
      
      bossAttackTimer.current++;
      const attackThreshold = isEnraged ? 70 : 100;
      const isWarning = bossAttackTimer.current > attackThreshold - 25;
      const isAttacking = bossAttackTimer.current >= attackThreshold;

      if (isAttacking) { 
        // --- BOSS ATTACK ---
        playerHP.current = Math.max(0, playerHP.current - (isEnraged ? 18 : 12));
        bossAttackTimer.current = 0;
        shakeIntensity.current = 15;
        vfxParticlesRef.current.push({
            x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, 
            size: 150, speed: 0, opacity: 0.4, life: 15, color: '#ff0000', type: 'ripple'
        });
        
        if (playerHP.current <= 0) {
            setGameState(GameState.GAMEOVER);
            setIsBossSpawned(false);
            addNotification("BẠN ĐÃ THẤT BẠI trước BOSS...", 'warning');
        }
      }

      if (isBossCharging.current) {
        playerAttackCharge.current = Math.min(100, playerAttackCharge.current + (2.0 + skills.fastHands * 0.8));
      } else {
        playerAttackCharge.current = Math.max(0, playerAttackCharge.current - 1.5);
      }

      // --- RENDER BOSS MODEL ---
      ctx.save();
      ctx.translate(bossX.current, bossY.current);
      if (isWarning && frameCount.current % 4 < 2) {
          ctx.filter = 'brightness(2) contrast(1.5)';
      }
      
      const bossSize = 1.8 + (isEnraged ? 0.4 : 0);
      ctx.scale(bossSize, bossSize);

      if (location === 'OCEAN') {
        BossModels.drawAbyssalKraken(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning);
      } else {
        BossModels.drawMechaSharkBoss(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning);
      }
      
      ctx.restore();

      // --- BOSS UI (Enhanced) ---
      // --- Boss Health Bar (with hit flash) ---
      const barW = 450; const barH = 14; const barX = (CANVAS_WIDTH - barW) / 2;
      Graphics.drawBossHealthBarFlash(ctx, bossHP.current, bossMaxHP.current, barX, barW, barH, 40, isEnraged, frameCount.current);
      
      // Boss Title
      ctx.fillStyle = isWarning ? '#ef4444' : 'white';
      ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
      const bossTitle = location === 'OCEAN' ? 'KRAKEN VỰC THẲM' : 'CÁ MẬP CƠ KHÍ';
      ctx.fillText(`${bossTitle} (HP: ${Math.ceil(bossHP.current)}%)`, CANVAS_WIDTH/2, 30);
      if (isWarning) {
          ctx.font = 'bold 10px Arial';
          ctx.fillText('!!! CẢNH BÁO: BOSS SẮP TẤN CÔNG !!!', CANVAS_WIDTH/2, 65);
      }

      // Player HUD
      // HP Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(40, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill();
      ctx.fillStyle = playerHP.current < 30 ? '#ef4444' : '#22c55e';
      ctx.roundRect(40, CANVAS_HEIGHT - 70, (playerHP.current / playerMaxHP.current) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'left';
      ctx.fillText(`SỨC BỀN NGƯỜI CHƠI: ${Math.ceil(playerHP.current)}%`, 45, CANVAS_HEIGHT - 75);

      // Charge Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill();
      const chargeColor = playerAttackCharge.current > 80 ? '#fbbf24' : '#eab308';
      ctx.fillStyle = chargeColor;
      ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, (playerAttackCharge.current / 100) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.textAlign = 'right';
      ctx.fillText('VẬN LỰC (GIỮ SPACE - THẢ ĐỂ ĐÁNH)', CANVAS_WIDTH - 45, CANVAS_HEIGHT - 75);
    }

    const rodStress = activeFish.current ? activeFish.current.type.value / Math.max(1, currentRod.maxValue ?? 300) : 0;
    const rodBendProgress = gameState === GameState.REELING ? Math.max(0, Math.min(1, (reelingProgress.current - 50) / 50)) : 0;
    const rodBendAmount = Math.min(2.4, rodStress * (0.6 + 0.4 * rodBendProgress));

    Graphics.drawPlayerEquipment(
      ctx, gameState, pX, pY, rodEndX, rodEndY, hookX.current, hookY.current, 
      gameState === GameState.CASTING, lineHealth.current,
      rodBendAmount, currentRod, chargePower.current, currentTackle,
      frameCount.current, reelRotation.current, location
    );
    ctx.restore();
  }, [gameState, onFishCaught, onFishLost, setGameState, currentRod, currentTackle, currentBait, spawnSingleFish, lerpAngle, createSplash, createSparkles, skills, weather, location, timeOfDay]);

  useEffect(() => {
    if (gameState === GameState.BOSS_FIGHT) {
      bossHP.current = 100;
      bossMaxHP.current = 100;
      playerHP.current = 100;
      playerMaxHP.current = 100;
      bossAttackTimer.current = 0;
      playerAttackCharge.current = 0;
      bossX.current = CANVAS_WIDTH / 2;
      bossY.current = CANVAS_HEIGHT / 2;
    }
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => { update(ctx); animId = window.requestAnimationFrame(render); };
    render(); return () => window.cancelAnimationFrame(animId);
  }, [update]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block cursor-crosshair shadow-inner shadow-black/50"
      style={{ pointerEvents: gameState === GameState.START ? 'none' : 'auto' }}
      onTouchStart={(e) => { if (gameState !== GameState.START) { e.preventDefault(); handlePressStart(); } }}
      onTouchEnd={(e) => { if (gameState !== GameState.START) { e.preventDefault(); handlePressEnd(); } }}
      onMouseDown={() => { if (gameState !== GameState.START) handlePressStart(); }}
      onMouseUp={() => { if (gameState !== GameState.START) handlePressEnd(); }}
    />
  );
};

export default GameCanvas;
