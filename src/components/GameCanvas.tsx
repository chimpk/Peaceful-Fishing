
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, FishInstance, FishType, RodType, TackleType, BaitType, Rarity, PlayerSkills, LocationType, TimeOfDay, NotificationType } from '../core/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FISH_TYPES, WEATHER_BONUSES, LOCATION_DATA, CHEST_TYPES } from '../core/gameData';
import * as Graphics from '../core/graphics';
import * as BossModels from '../core/fish/BossModels';
import { ChestModels } from '../core/fish/ChestModels';
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
  weather: 'sunny' | 'rainy' | 'stormy' | 'foggy';
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
  onDurabilityChange: (type: 'rod' | 'tackle', amount: number) => void;
  playerLevel?: number;
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
type FishAIState = 'wandering' | 'interested' | 'inspecting' | 'scared' | 'predatory';

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
  gameState, setGameState, onFishCaught, onFishLost, currentRod, currentTackle, currentBait, baitCounts, ownedRods, ownedTackles, weather, skills, location, timeOfDay, streak, onBossDefeated, onSessionReset, onLineBroken, onRodBroken, onCast, addNotification, liveBait, setLiveBait, isBossSpawned, setIsBossSpawned, onDurabilityChange, playerLevel
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
  const bossAttackTimer = useRef(0);
  const bossStrikeTimer = useRef(0);
  const bossStrikeStartX = useRef(0);
  const bossStrikeStartY = useRef(0);
  const bossLurkingX = useRef(0);
  const bossLurkingY = useRef(0);
  const bossExistTimer = useRef(3600);
  const bossFailCount = useRef(0);
  const bossInitialized = useRef(false);
  const playerHP = useRef(100);
  const playerMaxHP = useRef(100);
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
  
  // Lightning strike state
  const lightningStrikeTimer = useRef(0);
  const lightningStrikeX = useRef(0);
  const lightningStrikeAlpha = useRef(0);
  const stunTimer = useRef(0);
  
  // Unique Boss Mechanic State
  const inkAlpha = useRef(0);
  const torpedoActive = useRef(false);
  const torpedoX = useRef(0);
  const torpedoY = useRef(0);
  const torpedoTargetX = useRef(0);
  const torpedoTargetY = useRef(0);
  const torpedoProgress = useRef(0);

  const eventHandledRef = useRef<string | null>(null);

  // --- VISUAL EFFECTS ---
  const motionBlurAlpha = useRef(0);     

  // --- CINEMATIC CAMERA (Improved) ---
  const cameraZoom = useRef(1);          
  const cameraZoomTarget = useRef(1);    
  const cameraFocusX = useRef(CANVAS_WIDTH / 2);      
  const cameraFocusY = useRef(CANVAS_HEIGHT / 2);
  const cameraFocusXTarget = useRef(CANVAS_WIDTH / 2);
  const cameraFocusYTarget = useRef(CANVAS_HEIGHT / 2);

  useEffect(() => {
    eventHandledRef.current = null;
  }, [gameState]);

  useEffect(() => {
    if (timeOfDay !== prevTimeOfDayRef.current) {
        // Trigger transition if it was finished
        if (transitionProgressRef.current >= 1) {
            transitionProgressRef.current = 0;
        }
    }
  }, [timeOfDay]);

  useEffect(() => {
    if (weather === 'rainy' || weather === 'stormy') {
      soundManager.startRain();
    } else {
      soundManager.stopRain();
    }
  }, [weather]);

  const lerpAngle = (current: number, target: number, speed: number) => {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    // Smoother interpolation for very small differences
    if (Math.abs(diff) < 0.01) return target;
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
      
      // 1. Preferred Bait Bonus (NEW!)
      if (f.preferredBaits && f.preferredBaits.includes(currentBait.id)) {
        weight *= 3.5; // Significant boost for using the right bait
      }

      // 2. Location-specific Rarity Scaling (NEW!)
      if (location === 'POND') {
        if (f.rarity === Rarity.RARE) weight *= 0.7;
        if (f.rarity === Rarity.EPIC) weight *= 0.4;
        if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) weight *= 0.2;
      } else if (location === 'CAVE') {
        if (f.rarity === Rarity.RARE) weight *= 1.5;
        if (f.rarity === Rarity.EPIC) weight *= 2.0;
        if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) weight *= 3.0;
        if (f.rarity === Rarity.JUNK || f.rarity === Rarity.COMMON) weight *= 0.6;
      }

      let finalBoost = rarityBoost * frenzyBoost * castBoost;
      if (liveBait) {
          // Live bait dramatically increases chance for high rarity
          if (f.rarity === Rarity.EPIC) finalBoost *= 3;
          if (f.rarity === Rarity.LEGENDARY) finalBoost *= 8;
          if (f.rarity === Rarity.MYTHIC) finalBoost *= 15;
      }

      if (f.rarity === Rarity.RARE) weight *= (finalBoost * 0.5 + 0.5) * weatherBonus;
      if (f.rarity === Rarity.EPIC) weight *= finalBoost * weatherBonus;
      if (f.rarity === Rarity.LEGENDARY) weight *= (finalBoost * 1.5) * weatherBonus * (skills.masterAngler > 0 ? 2.0 : 1.0);
      if (f.rarity === Rarity.MYTHIC) weight *= (finalBoost * 2) * weatherBonus * (skills.masterAngler > 0 ? 3.0 : 1.0);
      return { type: f, weight };
    });
    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of weightedTypes) {
      if (random < item.weight) return item.type;
      random -= item.weight;
    }
    return pool[0];
  }, [weather, location, timeOfDay, liveBait, skills.masterAngler, currentBait.id]);

  const spawnSingleFish = useCallback(() => {
    // 5% chance to spawn a chest
    if (Math.random() < 0.05) {
        const type = CHEST_TYPES[Math.floor(Math.random() * CHEST_TYPES.length)];
        const y = 300 + Math.random() * 250;
        const initialDir = Math.random() > 0.5 ? 1 : -1;
        const baseSpeed = 0.3 + Math.random() * 0.4;
        return {
          id: Math.random().toString(36).substr(2, 9),
          x: initialDir === 1 ? -150 : CANVAS_WIDTH + 150,
          y: y, targetY: y, speed: baseSpeed, baseSpeed: baseSpeed, direction: initialDir, type,
          angle: initialDir === 1 ? 0 : Math.PI, targetAngle: initialDir === 1 ? 0 : Math.PI,
          personality: 'shy' as FishPersonality,
          swimStyle: 'glider' as FishSwimStyle,
          state: 'wandering' as FishAIState, stateTimer: 100,
          velocity: { x: initialDir * baseSpeed, y: 0 },
          isGolden: false
        };
    }
    const type = getRandomFishType(currentTackle.rarityBoost + currentBait.rarityBoost + skills.lucky * 1.5);
    
    // Depth Logic: Rare fish prefer deeper water (Higher Y)
    let yBase = 300;
    let yRange = 250;
    
    if (type.rarity === Rarity.RARE || type.rarity === Rarity.EPIC) {
        yBase = 380; // Starts deeper
    } else if (type.rarity === Rarity.LEGENDARY || type.rarity === Rarity.MYTHIC) {
        yBase = 450; // Very deep
        yRange = 150;
    } else if (type.rarity === Rarity.JUNK) {
        yBase = 250; // Often near surface or mid-water
        yRange = 200;
    }

    const y = yBase + Math.random() * yRange;
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
      // Spread out initial fish across a wider area, including off-screen edges
      fish.x = (Math.random() - 0.2) * (CANVAS_WIDTH * 1.4);
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
    if ((currentRod.durability || 0) <= 0) {
      addNotification('Cần câu đã hỏng. Hãy sửa chữa để tiếp tục!', 'warning');
      return false;
    }
    if ((currentTackle.durability || 0) <= 0) {
      addNotification('Thẻo câu đã hỏng. Hãy sửa chữa hoặc thay thẻo mới!', 'warning');
      return false;
    }
    if (currentBaitCount <= 0 && !liveBait) {
      addNotification('Đã hết mồi câu. Vui lòng mua thêm mồi câu hoặc chọn mồi sống từ túi đồ.', 'warning');
      return false;
    }
    return true;
  }, [baitCounts, currentBait.id, currentRod, currentTackle, ownedRods, addNotification, liveBait]);

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
            if (collidingFish.id === 'boss_dummy') {
                bossFailCount.current++;
                if (bossFailCount.current >= 2) {
                    setIsBossSpawned(false);
                    bossFailCount.current = 0;
                    addNotification("BOSS đã bỏ đi vì bạn quá yếu!", "warning");
                }
            }
            setGameState(GameState.IDLE);
            activeFish.current = null;
            return;
        }

        if (collidingFish.type.value > rodLimit) {
            onRodBroken();
            onFishLost("Cần câu đã gãy vì cá quá nặng!");
            if (collidingFish.id === 'boss_dummy') {
                bossFailCount.current++;
                if (bossFailCount.current >= 2) {
                    setIsBossSpawned(false);
                    bossFailCount.current = 0;
                    addNotification("BOSS đã bỏ đi vì bạn quá yếu!", "warning");
                }
            }
            setGameState(GameState.IDLE);
            activeFish.current = null;
            return;
        }

        if (collidingFish.id === 'boss_dummy') {
            setGameState(GameState.BOSS_FIGHT);
            bossHP.current = 100;
            playerHP.current = 100;
            bossAttackTimer.current = 0;
            playerAttackCharge.current = 0;
            inkAlpha.current = 0;
            torpedoActive.current = false;
            soundManager.playSuccess();
            shakeIntensity.current = 12; // Intense shake for boss hook
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

        willAutoEscape.current = false;

        soundManager.playSuccess();
        shakeIntensity.current = 8; // Normal shake for fish hook
      } else {
        // Too early
        createSplash(hookX.current, hookY.current, 1.2);
        if (activeFish.current?.id === 'boss_dummy') {
            bossFailCount.current++;
            if (bossFailCount.current >= 2) {
                setIsBossSpawned(false);
                bossFailCount.current = 0;
                addNotification("BOSS đã bỏ đi vì bạn quá yếu!", "warning");
            }
        }
        onFishLost("Giật quá sớm rồi! Cá đã chạy mất.");
        activeFish.current = null;
      }
    }
  }, [gameState, liveBait, onFishLost, setGameState, setLiveBait, currentTackle.maxValue, currentRod.maxValue, onLineBroken, onRodBroken, skills.sharpEye, currentRod.control, currentBait.attraction, frameCount]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (stunTimer.current > 0) return; // Cannot press Space while stunned
      
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
      if (skills.focus > 0) {
        if (focusCooldown.current <= 0 && !focusActive.current) {
          focusActive.current = true;
          focusTimer.current = 180; // 3 seconds at 60fps
          focusCooldown.current = 900; // 15s cooldown
          addNotification('TẬP TRUNG! Tension chậm lại 3 giây.', 'info');
        } else if (focusCooldown.current > 0) {
          addNotification(`Tập Trung đang hồi chiêu (${Math.ceil(focusCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Tập Trung chưa mở khóa (Cấp 15)', 'warning');
      }
    }
    // Active Skill: G = Power Reel (boost reel speed) — only during REELING
    if (e.code === 'KeyG' && gameState === GameState.REELING) {
      if (skills.powerReel > 0) {
        if (powerReelCooldown.current <= 0 && !powerReelActive.current) {
          powerReelActive.current = true;
          powerReelTimer.current = 120; // 2 seconds
          powerReelCooldown.current = 1200; // 20s cooldown
          addNotification('KÉO MẠNH! Reeling tăng tốc 2 giây!', 'success');
        } else if (powerReelCooldown.current > 0) {
          addNotification(`Kéo Mạnh đang hồi chiêu (${Math.ceil(powerReelCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Kéo Mạnh chưa mở khóa (Cấp 20)', 'warning');
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
    if (stunTimer.current > 0) return;
    
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
            if (eventHandledRef.current === 'boss_defeat') return;
            eventHandledRef.current = 'boss_defeat';

            addNotification("CHIẾN THẮNG BOSS HUYỀN THOẠI!", 'success');
            setIsBossSpawned(false);
            inkAlpha.current = 0;
            torpedoActive.current = false;
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
    
    // 1. Clear screen in IDENTITY space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
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

    // --- CINEMATIC CAMERA: Compute Targets ---
    const isCombat = gameState === GameState.NIBBLING || gameState === GameState.REELING || gameState === GameState.BOSS_FIGHT;
    const isCinematicActive = (isCombat || gameState === GameState.CAUGHT);
    
    if (isCinematicActive) {
        cameraZoomTarget.current = (gameState === GameState.BOSS_FIGHT) ? 1.08 : 1.25; 

        // 1. Calculate ideal focus (where the action is)
        let fX = CANVAS_WIDTH / 2;
        let fY = CANVAS_HEIGHT / 2;
        
        if (gameState === GameState.BOSS_FIGHT) {
            fX = bossX.current;
            fY = bossY.current;
        } else if (activeFish.current) {
            fX = hookX.current;
            fY = hookY.current;
            // Lean towards center (75% action, 25% center)
            fX = fX * 0.75 + (CANVAS_WIDTH / 2) * 0.25; 
            fY = fY * 0.75 + (CANVAS_HEIGHT / 2) * 0.25;
        } else {
            fX = hookX.current;
            fY = hookY.current;
        }
        
        // 2. Clamp target to prevent showing the edge of the world
        // Formula: minFocus = (screen/2) / zoom, maxFocus = totalSize - (screen/2) / zoom
        const halfVisibleW = (CANVAS_WIDTH / 2) / cameraZoomTarget.current;
        const halfVisibleH = (CANVAS_HEIGHT / 2) / cameraZoomTarget.current;
        
        cameraFocusXTarget.current = Math.max(halfVisibleW, Math.min(CANVAS_WIDTH - halfVisibleW, fX));
        cameraFocusYTarget.current = Math.max(halfVisibleH, Math.min(CANVAS_HEIGHT - halfVisibleH, fY));
    } else {
        cameraZoomTarget.current = 1;
        cameraFocusXTarget.current = CANVAS_WIDTH / 2;
        cameraFocusYTarget.current = CANVAS_HEIGHT / 2;
    }

    // Smoothly lerp towards targets for ALL states
    const zoomLerp = cameraZoomTarget.current === 1 ? 0.05 : 0.04;
    const focusLerp = cameraZoomTarget.current === 1 ? 0.07 : 0.05;
    
    cameraZoom.current += (cameraZoomTarget.current - cameraZoom.current) * zoomLerp;
    cameraFocusX.current += (cameraFocusXTarget.current - cameraFocusX.current) * focusLerp;
    cameraFocusY.current += (cameraFocusYTarget.current - cameraFocusY.current) * focusLerp;
    
    // Snap to identity ONLY when extremely close to prevent micro-jitter
    if (cameraZoomTarget.current === 1 && Math.abs(cameraZoom.current - 1) < 0.002) {
        cameraZoom.current = 1;
        cameraFocusX.current = CANVAS_WIDTH / 2;
        cameraFocusY.current = CANVAS_HEIGHT / 2;
    }

    const isHardResetState = [
        GameState.IDLE, GameState.START, GameState.GAMEOVER, GameState.WAITING, GameState.CHARGING, GameState.CASTING
    ].includes(gameState);

    // Still clear these immediately for responsiveness
    if (isHardResetState) {
        motionBlurAlpha.current = 0;
        shakeIntensity.current = 0;
    }

    // --- DYNAMIC CURRENTS ---
    const locInfo = LOCATION_DATA[location] || { currentSpeed: 0 };
    if (locInfo.currentSpeed > 0 && (gameState === GameState.WAITING || gameState === GameState.NIBBLING || gameState === GameState.REELING)) {
        const drift = Math.sin(frameCount.current * 0.01) * locInfo.currentSpeed;
        tensionZone.current += drift;
    }

    // Motion-blur vignette: ramp up for large fish (high tension)
    if (gameState === GameState.REELING) {
        const fishTension = activeFish.current?.type.tension || 0;
        const targetBlur = Math.min(0.55, (fishTension / 180) * 0.55);
        motionBlurAlpha.current += (targetBlur - motionBlurAlpha.current) * 0.04;
    } else {
        motionBlurAlpha.current *= 0.88; // fade out
    }

    // --- CAMERA TRANSFORM APPLICATION ---
    const hasActiveCamera = Math.abs(cameraZoom.current - 1) > 0.0005 || 
                            Math.abs(cameraFocusX.current - CANVAS_WIDTH / 2) > 0.5 || 
                            Math.abs(cameraFocusY.current - CANVAS_HEIGHT / 2) > 0.5;

    if (hasActiveCamera) {
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.scale(cameraZoom.current, cameraZoom.current);
        ctx.translate(-cameraFocusX.current, -cameraFocusY.current);
    }

    if (shakeIntensity.current > 0.05) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity.current, (Math.random() - 0.5) * shakeIntensity.current);
    }

    // --- SAFETY WATCHDOG ---
    if ((gameState === GameState.REELING || gameState === GameState.NIBBLING) && !activeFish.current) {
        setGameState(GameState.IDLE);
    }

    const isBossBite = isBossSpawned && gameState === GameState.WAITING && baitSettleTimer.current <= 0;

    // --- WORLD DRAWING STARTS ---

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
      ctx.fillStyle = 'white'; ctx.font = 'bold 11px "Be Vietnam Pro"'; ctx.textAlign = 'right';
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
    const isRainy = weather === 'rainy' || weather === 'stormy';
    if (isRainy) {
        soundManager.startRain();
    } else {
        soundManager.stopRain();
    }
    Graphics.drawWeatherEffects(ctx, frameCount.current, weather, location);

    // --- LIGHTNING STRIKE SYSTEM ---
    if (weather === 'stormy' && location !== 'CAVE') {
        if (lightningStrikeTimer.current > 0) {
            lightningStrikeTimer.current--;
            lightningStrikeAlpha.current *= 0.92;
            if (lightningStrikeAlpha.current > 0.05) {
                Graphics.drawLightning(ctx, lightningStrikeX.current, lightningStrikeAlpha.current);
            }
        } else {
            // Chance to trigger lightning
            if (Math.random() < 0.003) {
                lightningStrikeTimer.current = 60;
                lightningStrikeX.current = Math.random() * CANVAS_WIDTH;
                lightningStrikeAlpha.current = 0.8;
                soundManager.playLightningStrike();
                
                // Gameplay impact: if reeling, add a tension spike and stun
                if (gameState === GameState.REELING) {
                    tensionVelocity.current += (Math.random() - 0.5) * 0.08;
                    stunTimer.current = 20 + Math.random() * 30; // 0.3s - 0.5s stun
                    isSpacePressed.current = false; // Force release
                    shakeIntensity.current = 20;
                    addNotification("SÉT ĐÁNH! Mất kiểm soát cần câu!", "warning");
                }
            } else if (Math.random() < 0.001) {
                // Occasional distant thunder without lightning
                soundManager.playThunder();
            }
        }
    } else if (weather === 'rainy' && location !== 'CAVE') {
        // Occasional distant thunder during rain
        if (Math.random() < 0.0005) {
            soundManager.playThunder();
        }
    }

    if (stunTimer.current > 0) stunTimer.current--;

    // --- AMBIENT EFFECTS ---
    // God Rays: OCEAN only (as requested, Pond and Cave don't need them)
    if (location === 'OCEAN' && timeOfDay !== 'NIGHT') {
      Graphics.drawGodRays(ctx, frameCount.current, location, timeOfDay);
    }

    // Fireflies + Leaf Fall: Pond Night only
    if (location === 'POND' && timeOfDay === 'NIGHT') {
      Graphics.drawAmbientNight(ctx, frameCount.current);
    }

    // --- NEW: COMBO STREAK ---
    Graphics.drawComboStreak(ctx, streak, frameCount.current);

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

    // --- BOSS LURKING VISUAL ---
    if (isBossSpawned) {
        // Initialize timer if not already done
        if (!bossInitialized.current) {
            bossExistTimer.current = 3600; // 1 minute @ 60fps
            bossInitialized.current = true;
            bossFailCount.current = 0;
        }

        // Countdown only if not currently in a fight or reeling/nibbling the boss
        const isInteractingWithBoss = gameState === GameState.BOSS_FIGHT || activeFish.current?.id === 'boss_dummy';
        if (!isInteractingWithBoss) {
            bossExistTimer.current--;
            if (bossExistTimer.current <= 0) {
                setIsBossSpawned(false);
                bossInitialized.current = false;
                addNotification("CẢNH BÁO: BOSS đã rời khỏi khu vực này!", "info");
            }
        }
        const bTime = frameCount.current * 0.008;
        
        // Target lurking position (always calculating)
        const targetBx = (CANVAS_WIDTH / 2) + Math.cos(bTime) * (CANVAS_WIDTH * 0.4);
        const targetBy = (CANVAS_HEIGHT / 2) + Math.sin(bTime * 0.7) * (CANVAS_HEIGHT * 0.2) + 120;
        
        // Initialize if first time
        if (bossLurkingX.current === 0) {
            bossLurkingX.current = targetBx;
            bossLurkingY.current = targetBy;
        }

        // Smoothly update lurking position (lerp)
        // If not striking, follow the oscillation smoothly
        if (bossStrikeTimer.current <= 0) {
            bossLurkingX.current += (targetBx - bossLurkingX.current) * 0.05;
            bossLurkingY.current += (targetBy - bossLurkingY.current) * 0.05;
        } else {
            // During strike, move towards the hook
            const t = 1 - (bossStrikeTimer.current / 50); 
            const sX = bossStrikeStartX.current;
            const sY = bossStrikeStartY.current;
            bossLurkingX.current = sX + (hookX.current - sX) * t;
            bossLurkingY.current = sY + (hookY.current - sY) * t;
            bossStrikeTimer.current--;
        }
        
        // Final water surface clamp for the ref values
        bossLurkingY.current = Math.max(260, bossLurkingY.current);

        // Render silhouette if in appropriate game states
        const isActuallyActiveInCombat = activeFish.current?.id === 'boss_dummy' || gameState === GameState.BOSS_FIGHT;
        if (!isActuallyActiveInCombat && gameState !== GameState.REELING && gameState !== GameState.NIBBLING && gameState !== GameState.CAUGHT && gameState !== GameState.START) {
            ctx.save();
            const bx = bossLurkingX.current;
            const by = bossLurkingY.current;
            
            ctx.translate(bx, by);
            // Face movement direction
            const bDir = Math.sin(bTime) > 0 ? 1 : -1;
            ctx.scale(bDir * 1.5, 1.5);

            // Apply mouth offset to shadow when near the hook/striking
            if (bossStrikeTimer.current > 0 || isBossBite) {
                ctx.translate(-70, 0); 
            }

            ctx.globalAlpha = 0.25; 
            ctx.filter = 'brightness(0.2) contrast(1.2) blur(1px)';
            
            if (location === 'OCEAN') BossModels.drawAbyssalKraken(ctx, frameCount.current, 100, 100, false);
            else if (location === 'CAVE') BossModels.drawGhostOctopus(ctx, frameCount.current, 100, 100, false);
            else BossModels.drawMechaSharkBoss(ctx, frameCount.current, 100, 100, false);
            ctx.restore();
        }
    } else {
        bossInitialized.current = false;
    }

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
            if (distSq > 120) { // Increased distance slightly
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
          f.stateTimer = 60 + Math.random() * 200;
          if (f.state === 'wandering') {
            // Encourage moving towards edges or empty areas
            const inCenter = f.x > CANVAS_WIDTH * 0.3 && f.x < CANVAS_WIDTH * 0.7;
            const rightSideEmpty = fishRef.current.filter(fi => fi.x > CANVAS_WIDTH * 0.7).length < 3;
            
            let wanderDir;
            if (rightSideEmpty && f.x < CANVAS_WIDTH * 0.5) {
                wanderDir = 0; // Force head right
            } else if (inCenter && Math.random() > 0.3) {
                wanderDir = f.x > CANVAS_WIDTH / 2 ? Math.PI : 0; // Away from center
            } else {
                wanderDir = f.velocity.x > 0 ? 0 : Math.PI;
            }
            
            f.targetAngle = (Math.random() - 0.5) * 1.0 + wanderDir; 
            f.targetY = 280 + Math.random() * 280;
          }
        }
      }
      let moveSpeed = f.baseSpeed;
      if (f.state === 'scared') moveSpeed *= 2.8;
      else if (f.state === 'interested') moveSpeed *= 1.1; 
      else if (f.state === 'inspecting') moveSpeed *= 0.2;
      else if (f.state === 'predatory') moveSpeed *= 3.8;
      if (f.swimStyle === 'jerky') { const pulse = Math.sin(frameCount.current * 0.15); moveSpeed *= (pulse > 0 ? 2.0 : 0.1); }
      else if (f.swimStyle === 'charger') { moveSpeed *= 1.6; }
      const dx_hook = hookX.current - f.x;
      const dy_hook = hookY.current - f.y;
      const distToHook = Math.sqrt(dx_hook * dx_hook + dy_hook * dy_hook);

      // Prevent jitter when very close to hook
      if (f.state === 'interested' && distToHook < 15) {
          moveSpeed *= 0.2; // Slow down significantly
          if (distToHook < 5) moveSpeed = 0; // Stop
          
          // Rare fish aura/particles
          if ([Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity) && frameCount.current % 5 === 0) {
            const color = f.type.rarity === Rarity.MYTHIC ? '#a855f7' : '#eab308';
            createSparkles(f.x, f.y, 1, [color, '#ffffff']);
          }
      }

      // --- PREDATORY BEHAVIOR DETECTION ---
      const isSmallFishActive = activeFish.current && 
                               activeFish.current.id !== 'boss_dummy' && 
                               [Rarity.COMMON, Rarity.RARE].includes(activeFish.current.type.rarity);
      
      if (isSmallFishActive && (gameState === GameState.NIBBLING || gameState === GameState.REELING)) {
          const isBigFish = [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity);
          if (isBigFish && distToHook < 400 && f.state !== 'predatory') {
              // 0.2% chance per frame to notice and start hunting
              if (Math.random() < 0.002) {
                  f.state = 'predatory';
                  f.targetAngle = Math.atan2(dy_hook, dx_hook);
                  addNotification(`CẢNH BÁO: Một con ${f.type.name} đang nhắm vào cá của bạn!`, 'warning');
              }
          }
      }

      if (f.state === 'predatory') {
          // If the target fish is gone or player is no longer reeling/nibbling, stop hunting
          if (!isSmallFishActive || (gameState !== GameState.NIBBLING && gameState !== GameState.REELING)) {
              f.state = 'wandering';
              f.targetAngle = Math.random() * Math.PI * 2;
          } else {
              f.targetAngle = Math.atan2(dy_hook, dx_hook);
              f.targetY = hookY.current;
              
              if (distToHook < 15) {
                  // The eat event will be handled after the loop to avoid concurrent modification issues
                  (f as any)._shouldEat = true;
              }
          }
      }

      f.angle = lerpAngle(f.angle, f.targetAngle, f.state === 'scared' ? 0.25 : (f.state === 'interested' ? 0.045 : 0.06));
      const vx = Math.cos(f.angle) * moveSpeed; const vy = Math.sin(f.angle) * moveSpeed;
      f.velocity = { x: vx, y: vy }; f.x += vx; 
      
      // Smooth Y movement
      const yForce = (f.targetY - f.y) * 0.015;
      f.y += vy + yForce;

      if (f.x > CANVAS_WIDTH + 200) { f.x = -190; f.direction = 1; }
      if (f.x < -200) { f.x = CANVAS_WIDTH + 190; f.direction = -1; }
      if (f.y < 220) f.y = 220; if (f.y > CANVAS_HEIGHT) f.y = CANVAS_HEIGHT;
      
      // --- Fish Trails (Wakes/Bubbles) ---
      if (moveSpeed > 1.5 || f.state === 'scared' || f.state === 'interested') {
          if (frameCount.current % (f.state === 'scared' ? 2 : 6) === 0) {
              vfxParticlesRef.current.push({
                  x: f.x - Math.cos(f.angle) * (f.type.size * 0.8),
                  y: f.y - Math.sin(f.angle) * (f.type.size * 0.8),
                  size: 1 + Math.random() * 2,
                  speed: 0,
                  opacity: 0.4,
                  life: 20 + Math.random() * 10,
                  color: 'rgba(255,255,255,0.3)',
                  type: 'circle'
              });
          }
      }
      
      Graphics.drawFishTexture(ctx, f.type, frameCount.current, false, { x: f.x, y: f.y, angle: f.angle, direction: 1 }, moveSpeed, f.swimStyle, false, f.isGolden);
      
      if (f.state === 'interested' && [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) {
        Graphics.drawAlert(ctx, f.x, f.y, f.type.rarity);
      }
    });
    
    // --- HANDLE PREDATORY EAT EVENT ---
    const predator = fishRef.current.find(f => (f as any)._shouldEat);
    if (predator) {
        createSplash(hookX.current, hookY.current, 2.5);
        soundManager.playSplash();
        addNotification(`KINH NGẠC! ${predator.type.name} đã nuốt chửng con cá nhỏ!`, 'success');
        
        const bigFishInstance = { ...predator };
        delete (bigFishInstance as any)._shouldEat;
        bigFishInstance.state = 'interested'; // Change state to something standard
        
        activeFish.current = bigFishInstance;
        
        // Remove the predator from the world
        fishRef.current = fishRef.current.filter(fi => fi.id !== predator.id);
        
        if (gameState === GameState.NIBBLING) {
            // Reset nibbling for the new big fish
            nibbleCount.current = 0;
            nibbleTimer.current = 40;
            isBitingHard.current = false;
            
            const rarity = bigFishInstance.type.rarity;
            let minN = 3, maxN = 5;
            if (rarity === Rarity.LEGENDARY) { minN = 4; maxN = 6; }
            else if (rarity === Rarity.MYTHIC) { minN = 5; maxN = 8; }
            targetNibbles.current = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
            
            // Adjust approach side
            nibbleSide.current = bigFishInstance.x < hookX.current ? -1 : 1;
            bigFishInstance.x = hookX.current + 35 * nibbleSide.current;
            bigFishInstance.y = hookY.current + 2;
            lungeProgress.current = 0;
            lungeDelay.current = 30;
        } else if (gameState === GameState.REELING) {
            // Update reeling for the new big fish
            const lineLimit = currentTackle.maxValue || 300;
            const sizeMatch = Math.min(1, bigFishInstance.type.value / lineLimit);
            const mismatchPenalty = 1 - sizeMatch;
            tensionZoneSize.current = Math.max(0.18, 0.48 - (bigFishInstance.type.tension / 220) + (skills.sharpEye * 0.05) - mismatchPenalty * 0.18 + (currentBait.attraction / 1000));
            tensionCursor.current = Math.random() > 0.5 ? 0.8 : 0.2;
            shakeIntensity.current = 15;
            
            // Re-sync angle to face rod
            const dx = 220 - hookX.current; // rodEndX is usually 220
            const dy = 120 - hookY.current; // rodEndY is usually 120
            bigFishInstance.angle = Math.atan2(dy, dx);
        }
    }

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
        if (perfectCastBonus.current) shakeIntensity.current = 5; // Subtle shake for perfect landing
        setGameState(GameState.WAITING);
        // Settle timer: Perfect Cast = faster (2-3s), Normal = 4-8s, Frenzy = 1.5-3s
        const baseSettle = frenzyActive.current
          ? 90 + Math.random() * 90     // Frenzy: 1.5–3s
          : perfectCastBonus.current
            ? 120 + Math.random() * 60  // Perfect: 2–3s
            : 240 + Math.random() * 240; // Normal: 4–8s
        baitSettleTimer.current = baseSettle;
        baitSettleTotal.current = baseSettle;
        if (perfectCastBonus.current && eventHandledRef.current !== 'perfect_cast') {
          eventHandledRef.current = 'perfect_cast';
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

      // --- BAIT SETTLE LOGIC (Visual bar removed as requested) ---
      if (baitSettleTimer.current > 0) {
        baitSettleTimer.current--;
      }

      if (isBossBite && bossStrikeTimer.current === 0 && !activeFish.current) {
          // Check if we already finished the strike
          const dx = bossLurkingX.current - hookX.current;
          const dy = bossLurkingY.current - hookY.current;
          const distToHook = Math.sqrt(dx*dx + dy*dy);
          
          if (distToHook > 120) { // Increased distance to prevent snapping
              // Initiate Strike
              bossStrikeTimer.current = 50; // Slightly faster (0.8s)
              bossStrikeStartX.current = bossLurkingX.current;
              bossStrikeStartY.current = bossLurkingY.current;
              soundManager.playBossWarning();
              addNotification("CẢNH BÁO: BOSS ĐANG LAO TỚI MỒI!", "warning");
              return;
          }
      }

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
              color: location === 'OCEAN' ? '#4c1d95' : (location === 'CAVE' ? '#e0f2fe' : '#475569'),
              tension: 90,
              spriteInfo: { 
                color: location === 'OCEAN' ? '#4c1d95' : (location === 'CAVE' ? '#e0f2fe' : '#475569'), 
                shape: location === 'OCEAN' ? 'kraken' : (location === 'CAVE' ? 'kraken' : 'shark') 
              }
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
                if (eventHandledRef.current === 'fish_lost_window') return;
                eventHandledRef.current = 'fish_lost_window';

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
      const fishValue = activeFish.current.type.value;
      const sizeMatch = Math.min(1, lineLimit / fishValue); 
      const mismatchPenalty = Math.max(0, (fishValue - lineLimit) / lineLimit);
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

      // --- 1. BERSERK MODE (Final Struggle) ---
      const isBerserk = activeFish.current.type.canBerserk && reelingProgress.current > 80;
      if (isBerserk) {
          finalGravity *= 1.45; // Pulls harder
          shakeIntensity.current = Math.max(shakeIntensity.current, 10);
          // Visual feedback for Berserk
          if (frameCount.current % 15 < 7) {
              vfxParticlesRef.current.push({
                  x: hookX.current + (Math.random()-0.5)*40, y: hookY.current + (Math.random()-0.5)*40,
                  size: 3, speed: 0.5, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
                  life: 20, opacity: 1, color: '#ef4444', type: 'circle'
              });
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

      let weatherTension = WEATHER_BONUSES[weather].tension || 1.0;
      // weatherExpert: reduce negative weather effects by 50%
      if (skills.weatherExpert > 0 && weatherTension > 1.0) {
        weatherTension = 1.0 + (weatherTension - 1.0) * 0.5;
      }
      if (isSpacePressed.current) tensionVelocity.current -= finalLift * powerReelLift;
      else tensionVelocity.current += finalGravity * focusMultiplier * weatherTension;
      tensionVelocity.current *= 0.95;
      tensionCursor.current += tensionVelocity.current;
      tensionCursor.current = Math.max(0, Math.min(1, tensionCursor.current));
      
      // --- 2. DYNAMIC MOVEMENT PATTERNS (Task #2) ---
      const rarity = activeFish.current.type.rarity;
      
      // Speed scales with tension and gold value for higher difficulty
      let zoneSpeed = 0.005 + (ft / 100000) + (fishValue / 800000); 
      let wobble = 0.002 + ft / 60000 + (fishValue / 400000);
      let jitter = (Math.random() - 0.5) * (ft / 3000 + (fishValue / 20000));

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

      // Berserk boost to zone movement
      if (isBerserk) {
          zoneSpeed *= 1.8;
          wobble *= 1.6;
          jitter *= 2;
      }

      tensionZone.current += Math.sin(frameCount.current * zoneSpeed) * wobble + jitter;
      const hz = tensionZoneSize.current / 2; tensionZone.current = Math.max(hz, Math.min(1 - hz, tensionZone.current));
      const isInZone = Math.abs(tensionCursor.current - tensionZone.current) < hz;
      
      const progressFactor = 0.8 + sizeMatch * 0.2;
      const powerReelBoost = powerReelActive.current ? 2.0 : 1;
      if (isInZone) {
        reelingProgress.current += Math.max(0.12, 0.35 - (ft / 450)) * (1 + skills.fastHands * 0.25) * progressFactor * powerReelBoost;
        lineHealth.current = Math.min(100, lineHealth.current + 0.22 * progressFactor); // Reduced recovery speed (was 0.5)
        hookX.current = Math.max(rodEndX + 20, hookX.current - 0.5);
      } else {
        // Damage increased for more challenge (doubled as requested)
        let baseDamage = 4 * (0.28 + (ft / 350) + Math.min(1.0, mismatchPenalty * 0.25));
        let damage = baseDamage / currentRod.lineStrength; 

        // Miracle Save Mechanic: 2% base + skill bonus chance to ignore most damage when low HP
        const miracleChance = 0.02 + (skills.lucky * 0.03);
        if (lineHealth.current < 15 && Math.random() < miracleChance) {
            damage *= 0.1; // Hold on by a thread!
            if (frameCount.current % 120 === 0) addNotification("DÂY SẮP ĐỨT... NHƯNG BẠN VẪN ĐANG GIỮ ĐƯỢC!", "warning");
        }
        
        // Behavior penalties
        if (isBehaviorActive.current) {
            if (behaviorType.current === 'jump' && isSpacePressed.current) {
                damage *= 4.5; // Massive damage if reeling while jumping
                shakeIntensity.current = 10;
            }
            if (behaviorType.current === 'thrash') damage *= 1.4;
        }

        lineHealth.current -= damage;
        
        // --- DURABILITY CONSUMPTION (Under Strain) ---
        if (frameCount.current % 30 === 0) {
            onDurabilityChange('rod', 0.1);
            onDurabilityChange('tackle', 0.2);
        }

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
        
        // Final durability hit when catching
        onDurabilityChange('rod', 0.5);
        onDurabilityChange('tackle', 1.0);
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
        } else if (activeFish.current?.type.value > rodLimit) {
          onRodBroken();
        } else {
          onFishLost("Cá đã sổng mất rồi!");
        }
        activeFish.current = null;
      }
      
      if (frameCount.current % 8 === 0) {
        soundManager.playReel(Math.abs(tensionCursor.current - tensionZone.current) * 2);
      }

      // Reeling UI moved to Identity space at the bottom of update loop
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

        if (activeFish.current.type.isChest) {
            ChestModels.drawChest(ctx, activeFish.current.type.rarity, frameCount.current, jX, jY);
        } else {
            Graphics.drawFishTexture(
                ctx, activeFish.current.type, frameCount.current, true, 
                { x: jX, y: jY, angle: activeFish.current.angle, direction: 1 }, 
                2.2, activeFish.current.swimStyle, true, activeFish.current.isGolden
            );
        }

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
        
        // --- BOSS UNIQUE ABILITIES TRIGGER ---
        if (location === 'OCEAN' && hpRatio < 0.6) {
            // Kraken Ink Cloud (Blindness)
            inkAlpha.current = Math.min(0.85, inkAlpha.current + 0.005);
        } else if (location === 'POND' && isEnraged && !torpedoActive.current && Math.random() < 0.015) {
            // Mecha Shark Torpedo (Projectiles)
            torpedoActive.current = true;
            torpedoProgress.current = 0;
            torpedoX.current = bossX.current;
            torpedoY.current = bossY.current;
            torpedoTargetX.current = 40 + Math.random() * 200; 
            torpedoTargetY.current = CANVAS_HEIGHT - 70;
            addNotification("CẢNH BÁO: TÊN LỬA ĐANG LAO TỚI!", "warning");
        } else if (location === 'CAVE' && isEnraged && frameCount.current % 200 === 0) {
            // Ghost Octopus Spectral Pulse (Stamina Drain if charging)
            addNotification("CẢNH BÁO: XUNG ĐIỆN TÂM LINH!", "boss");
            createSparkles(bossX.current, bossY.current, 50, ['#00f2ff', '#e0f2fe', '#ffffff']);
            if (isBossCharging.current) {
                playerHP.current = Math.max(0, playerHP.current - 15);
                shakeIntensity.current = 15;
            }
        }

        if (playerHP.current <= 0) {
            setGameState(GameState.GAMEOVER);
            setIsBossSpawned(false);
            inkAlpha.current = 0;
            torpedoActive.current = false;
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
      } else if (location === 'CAVE') {
        // Ghost Octopus Camouflage: more transparent based on HP
        const hpMod = hpRatio < 0.4 ? 0.2 : (hpRatio < 0.7 ? 0.4 : 1.0);
        ctx.globalAlpha *= hpMod;
        BossModels.drawGhostOctopus(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning);
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
      ctx.font = 'bold 14px "Be Vietnam Pro"'; ctx.textAlign = 'center';
      const bossTitle = location === 'OCEAN' ? 'KRAKEN VỰC THẲM' : (location === 'CAVE' ? 'BẠCH TUỘC MA' : 'CÁ MẬP CƠ KHÍ');
      ctx.fillText(`${bossTitle} (HP: ${Math.ceil(bossHP.current)}%)`, CANVAS_WIDTH/2, 30);
      if (isWarning) {
          ctx.font = 'bold 10px "Be Vietnam Pro"';
          ctx.fillText('!!! CẢNH BÁO: BOSS SẮP TẤN CÔNG !!!', CANVAS_WIDTH/2, 65);
      }

      // Player HUD
      // HP Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(40, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill();
      ctx.fillStyle = playerHP.current < 30 ? '#ef4444' : '#22c55e';
      ctx.roundRect(40, CANVAS_HEIGHT - 70, (playerHP.current / playerMaxHP.current) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 11px "Be Vietnam Pro"'; ctx.textAlign = 'left';
      ctx.fillText(`SỨC BỀN NGƯỜI CHƠI: ${Math.ceil(playerHP.current)}%`, 45, CANVAS_HEIGHT - 75);

      // Charge Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill();
      const chargeColor = playerAttackCharge.current > 80 ? '#fbbf24' : '#eab308';
      ctx.fillStyle = chargeColor;
      ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, (playerAttackCharge.current / 100) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.textAlign = 'right';
      ctx.fillText('VẬN LỰC (GIỮ SPACE - THẢ ĐỂ ĐÁNH)', CANVAS_WIDTH - 45, CANVAS_HEIGHT - 75);

      // --- RENDER BOSS PROJECTILES ---
      if (torpedoActive.current) {
          torpedoProgress.current += 0.015;
          const tx = torpedoX.current + (torpedoTargetX.current - torpedoX.current) * torpedoProgress.current;
          const ty = torpedoY.current + (torpedoTargetY.current - torpedoY.current) * torpedoProgress.current;
          
          // Draw Torpedo
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(Math.atan2(torpedoTargetY.current - torpedoY.current, torpedoTargetX.current - torpedoX.current));
          ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.roundRect(-15, -5, 30, 10, 5); ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(-15, 0, 8 + Math.random() * 8, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          if (torpedoProgress.current >= 1) {
              torpedoActive.current = false;
              // If player is charging, they get hit! (Dodge by not charging)
              if (isBossCharging.current) {
                  playerHP.current = Math.max(0, playerHP.current - 25);
                  shakeIntensity.current = 25;
                  addNotification("HỨNG TRỌN TÊN LỬA! Thả Space để né đòn!", "warning");
              } else {
                  addNotification("NÉ ĐÒN THÀNH CÔNG!", "success");
                  createSparkles(tx, ty, 30, ['#ffffff', '#fbbf24']);
              }
          }
      }
    }

    // --- RENDER INK OVERLAY ---
    if (inkAlpha.current > 0) {
        ctx.save();
        const inkGrad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 600);
        inkGrad.addColorStop(0, 'rgba(0,0,0,0)');
        inkGrad.addColorStop(1, `rgba(0, 0, 0, ${inkAlpha.current})`);
        ctx.fillStyle = inkGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Random ink splotches
        ctx.fillStyle = `rgba(0, 0, 0, ${inkAlpha.current * 0.8})`;
        for(let i=0; i<5; i++) {
            const sx = (Math.sin(i * 10 + frameCount.current * 0.01) * 400) + CANVAS_WIDTH/2;
            const sy = (Math.cos(i * 20 + frameCount.current * 0.01) * 200) + CANVAS_HEIGHT/2;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 100 * inkAlpha.current, 60 * inkAlpha.current, i, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
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
    // --- VIGNETTE ---
    ctx.save();
    const vignette = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 200, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 600);
    const vignetteOpacity = location === 'CAVE' ? 0.7 : (timeOfDay === 'NIGHT' ? 0.5 : 0.2);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, `rgba(0, 0, 0, ${vignetteOpacity})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    // --- CINEMATIC MOTION-BLUR VIGNETTE (big fish reeling) ---
    if (motionBlurAlpha.current > 0.01) {
        ctx.save();
        // Pulsing chromatic-stress ring – outer edge goes red/white
        const pulse = 0.5 + 0.5 * Math.sin(frameCount.current * 0.18);
        const mbGrad = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.22,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.78
        );
        mbGrad.addColorStop(0, 'rgba(0,0,0,0)');
        mbGrad.addColorStop(0.6, `rgba(80,0,0,${motionBlurAlpha.current * 0.35})`);
        mbGrad.addColorStop(1, `rgba(200,30,30,${motionBlurAlpha.current * (0.55 + pulse * 0.15)})`);
        ctx.fillStyle = mbGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Horizontal speed-lines on the very edge for "blur" illusion
        ctx.globalAlpha = motionBlurAlpha.current * 0.12 * pulse;
        ctx.fillStyle = 'white';
        for (let i = 0; i < 6; i++) {
            const lineY = (i / 6) * CANVAS_HEIGHT + (frameCount.current * 1.5 * (i % 2 === 0 ? 1 : -1)) % CANVAS_HEIGHT;
            ctx.fillRect(0, lineY, 30, 2);
            ctx.fillRect(CANVAS_WIDTH - 30, lineY, 30, 2);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // --- WORLD DRAWING ENDS ---
    ctx.restore();

    // --- UI & OVERLAYS (Identity space) ---
    
    if (gameState === GameState.REELING && activeFish.current) {
        // Tension Bar - Now fixed at screen center (relative to UI)
        Graphics.drawReelingInterface(
            ctx, reelingProgress.current, lineHealth.current, 
            tensionCursor.current, tensionZone.current, tensionZoneSize.current, 
            Math.abs(tensionCursor.current - tensionZone.current) < (tensionZoneSize.current / 2), 
            activeFish.current?.type
        );

        // Behavior Indicators
        if (isBehaviorActive.current) {
            ctx.save();
            ctx.font = 'bold 18px "Be Vietnam Pro"';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 12; ctx.shadowColor = 'black';
            ctx.fillStyle = behaviorType.current === 'jump' ? '#ef4444' : '#fbbf24';
            const label = behaviorType.current === 'jump' ? '⚠️ CÁ NHẢY - THẢ SPACE!' : (behaviorType.current === 'dive' ? '⬇️ CÁ ĐANG LẶN!' : '💢 CÁ VÙNG VẪY!');
            ctx.fillText(label, CANVAS_WIDTH / 2, 175);
            ctx.restore();
        }

        // Skill HUD
        const hasFocus = skills.focus > 0;
        const hasPowerReel = skills.powerReel > 0;
        if (hasFocus || hasPowerReel) {
            const skillHudX = CANVAS_WIDTH - 180;
            const skillHudY = CANVAS_HEIGHT - 110;
            ctx.save();
            if (hasFocus) {
                const focusReady = focusCooldown.current <= 0 && !focusActive.current;
                ctx.globalAlpha = focusActive.current ? 1 : (focusReady ? 0.9 : 0.45);
                ctx.fillStyle = focusActive.current ? '#60a5fa' : (focusReady ? '#1e40af' : '#334155');
                ctx.roundRect(skillHudX, skillHudY, 76, 40, 8); ctx.fill();
                ctx.fillStyle = 'white'; ctx.font = 'bold 10px "Be Vietnam Pro"'; ctx.textAlign = 'center';
                ctx.fillText('[F] TẬP TRUNG', skillHudX + 38, skillHudY + 13);
                if (focusActive.current) {
                    ctx.fillStyle = '#bfdbfe';
                    ctx.fillText(`${Math.ceil(focusTimer.current / 60)}s`, skillHudX + 38, skillHudY + 30);
                } else if (!focusReady) {
                    ctx.fillStyle = '#94a3b8';
                    ctx.fillText(`${Math.ceil(focusCooldown.current / 60)}s CD`, skillHudX + 38, skillHudY + 30);
                } else {
                    ctx.fillStyle = '#93c5fd'; ctx.fillText('SẴN SÀNG', skillHudX + 38, skillHudY + 30);
                }
            }
            if (hasPowerReel) {
                const prReady = powerReelCooldown.current <= 0 && !powerReelActive.current;
                ctx.globalAlpha = powerReelActive.current ? 1 : (prReady ? 0.9 : 0.45);
                ctx.fillStyle = powerReelActive.current ? '#fb923c' : (prReady ? '#9a3412' : '#334155');
                ctx.roundRect(skillHudX + 84, skillHudY, 76, 40, 8); ctx.fill();
                ctx.fillStyle = 'white'; ctx.font = 'bold 10px "Be Vietnam Pro"'; ctx.textAlign = 'center';
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
            }
            ctx.restore();
        }
    }
  }, [gameState, onFishCaught, onFishLost, setGameState, currentRod, currentTackle, currentBait, spawnSingleFish, lerpAngle, createSplash, createSparkles, skills, weather, location, timeOfDay]);
  useEffect(() => {
    if (gameState === GameState.BOSS_FIGHT) {
      const scaledHP = 100 + ((playerLevel || 1) - 1) * 30; // Scale boss HP by level
      bossHP.current = scaledHP;
      bossMaxHP.current = scaledHP;
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

  // --- NEW: FORCE RESET ON STATE CHANGE ---
  // This ensures the camera is reset the instant the state changes, even before the next frame
  useEffect(() => {
    const isResting = [
        GameState.IDLE, GameState.START, GameState.GAMEOVER, 
        GameState.WAITING, GameState.CHARGING, GameState.CASTING
    ].includes(gameState);

    if (isResting) {
        // We no longer snap camera values here to allow for smooth animation in the update loop.
        // We only clear immediate effects and the active fish.
        motionBlurAlpha.current = 0;
        shakeIntensity.current = 0;
        activeFish.current = null; 
    }
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className={`block cursor-crosshair shadow-inner shadow-black/50 w-full h-full object-contain ${
        gameState === GameState.START ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      onTouchStart={(e) => { if (gameState !== GameState.START) { e.preventDefault(); handlePressStart(); } }}
      onTouchEnd={(e) => { if (gameState !== GameState.START) { e.preventDefault(); handlePressEnd(); } }}
      onMouseDown={() => { if (gameState !== GameState.START) handlePressStart(); }}
      onMouseUp={() => { if (gameState !== GameState.START) handlePressEnd(); }}
    />
  );
};

export default GameCanvas;
