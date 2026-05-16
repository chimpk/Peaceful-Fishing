
import { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, FishType, RodType, TackleType, BaitType, Rarity, 
  PlayerSkills, LocationType, TimeOfDay, WeatherType, NotificationType,
  Particle
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, FISH_TYPES, WEATHER_BONUSES, 
  LOCATION_DATA, CHEST_TYPES, BOSS_EXIST_TIME, DURABILITY_CHECK_INTERVAL
} from '../core/data/gameData';
import * as Graphics from '../core/graphics';
import * as BossModels from '../core/entities/BossModels';
import { ChestModels } from '../core/entities/ChestModels';
import { soundManager } from '../core/systems/soundManager';
import { lerpAngle } from '../utils/math';
import * as VFXSystem from '../core/systems/VFXSystem';

export interface GameEngineProps {
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
  weather: WeatherType;
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
  inventoryCount: number;
  inventoryCapacity: number;
}



type FishPersonality = 'curious' | 'shy' | 'brave';
type FishSwimStyle = 'glider' | 'jerky' | 'charger';
type FishAIState = 'wandering' | 'interested' | 'inspecting' | 'scared' | 'predatory';

interface EnhancedFishInstance {
  id: string;
  x: number;
  y: number;
  targetY: number;
  speed: number;
  baseSpeed: number;
  direction: number;
  type: FishType;
  angle: number;
  targetAngle: number;
  personality: FishPersonality;
  swimStyle: FishSwimStyle;
  state: FishAIState;
  stateTimer: number;
  velocity: { x: number, y: number };
  isGolden: boolean;
}

export const useGameEngine = (props: GameEngineProps) => {
  const { 
    gameState, setGameState, onFishCaught, onFishLost, currentRod, 
    currentTackle, currentBait, baitCounts, ownedRods, ownedTackles, 
    weather, skills, location, timeOfDay, streak, onBossDefeated, 
    onSessionReset, onLineBroken, onRodBroken, onCast, addNotification, 
    liveBait, setLiveBait, isBossSpawned, setIsBossSpawned, 
    onDurabilityChange, playerLevel, inventoryCount, inventoryCapacity 
  } = props;

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
  const lastFrameTime = useRef(0);
  const MAX_VFX_PARTICLES = 120;
  
  const isSpacePressed = useRef(false);
  
  const tensionCursor = useRef(0.5);
  const tensionVelocity = useRef(0);
  const tensionZone = useRef(0.5); 
  const tensionZoneSize = useRef(0.32); 
  const reelingProgress = useRef(0); 
  const lineHealth = useRef(100); 

  const willAutoEscape = useRef(false);
  const autoEscapeTime = useRef(0);

  const jumpProgress = useRef(0);
  const isJumping = useRef(false);
  const shakeIntensity = useRef(0);
  
  const tugFactor = useRef(0);

  const bossHP = useRef(500);
  const bossMaxHP = useRef(500);
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
  const isBossDefeated = useRef(false);
  
  const behaviorTimer = useRef(0);
  const isBehaviorActive = useRef(false);
  const behaviorType = useRef<string | null>(null); 
  
  const nibbleTimer = useRef(0);
  const nibbleCount = useRef(0);
  const targetNibbles = useRef(3);
  const lungeProgress = useRef(0);
  const lungeDelay = useRef(0);
  const biteWindowTimer = useRef(0);
  const isBitingHard = useRef(false);
  const baitSettleTimer = useRef(0);
  const baitSettleTotal = useRef(0);
  const reelRotation = useRef(0);
  const nibbleSide = useRef(1);

  const frenzyActive = useRef(false);
  const frenzyTimer = useRef(0);
  const frenzyNotified = useRef(false);

  const perfectCastBonus = useRef(false);

  const focusActive = useRef(false);
  const focusTimer = useRef(0);
  const focusCooldown = useRef(0);
  const powerReelActive = useRef(false);
  const powerReelTimer = useRef(0);
  const powerReelCooldown = useRef(0);

  const prevTimeOfDayRef = useRef<TimeOfDay>(timeOfDay);
  const transitionProgressRef = useRef(1);
  
  const lightningStrikeTimer = useRef(0);
  const lightningStrikeX = useRef(0);
  const lightningStrikeAlpha = useRef(0);
  const stunTimer = useRef(0);
  
  const inkAlpha = useRef(0);
  const torpedoActive = useRef(false);
  const torpedoX = useRef(0);
  const torpedoY = useRef(0);
  const torpedoTargetX = useRef(0);
  const torpedoTargetY = useRef(0);
  const torpedoProgress = useRef(0);

  const eventHandledRef = useRef<string | null>(null);
  const lastSpawnedLocationRef = useRef<LocationType | null>(null);

  const fishPerLocationRef = useRef<Record<LocationType, EnhancedFishInstance[]>>({
    POND: [],
    OCEAN: [],
    CAVE: []
  });
  const bubblesPerLocationRef = useRef<Record<LocationType, Particle[]>>({
    POND: [],
    OCEAN: [],
    CAVE: []
  });

  const resetEventState = useCallback(() => {
    eventHandledRef.current = null;
    stunTimer.current = 0;
    inkAlpha.current = 0;
    torpedoActive.current = false;
  }, []);

  const motionBlurAlpha = useRef(0);     

  const cameraZoom = useRef(1);          
  const cameraZoomTarget = useRef(1);    
  const cameraFocusX = useRef(CANVAS_WIDTH / 2);      
  const cameraFocusY = useRef(CANVAS_HEIGHT / 2);
  const cameraFocusXTarget = useRef(CANVAS_WIDTH / 2);
  const cameraFocusYTarget = useRef(CANVAS_HEIGHT / 2);

  // Helper functions

  const createSplash = useCallback((x: number, y: number, intensity: number = 1) => {
    if (vfxParticlesRef.current.length >= MAX_VFX_PARTICLES) return;
    vfxParticlesRef.current.push({
        x, y, size: 5, speed: 0, opacity: 1, life: 60, type: 'ripple', color: 'rgba(255,255,255,0.6)'
    });
    // Reduce particle count on mobile (fewer = faster)
    const count = Math.min(8, Math.floor(8 * intensity));
    for(let i=0; i < count; i++) {
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
    const slots = MAX_VFX_PARTICLES - vfxParticlesRef.current.length;
    const actualCount = Math.min(count, slots, 20); // hard cap at 20 per call
    for(let i=0; i<actualCount; i++) {
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

  const checkBaitCompatibility = useCallback((fish: FishType, baitId: string): boolean => {
    // 1. Bread crumbs: only small/junk
    if (baitId === 'bait_free_1') {
      return fish.rarity === Rarity.JUNK || fish.rarity === Rarity.COMMON;
    }
    
    // 2. Large bait (Cá mồi): only rare and above (big fish)
    if (baitId === 'bait_sea_3') {
      return fish.rarity !== Rarity.JUNK && fish.rarity !== Rarity.COMMON && fish.rarity !== Rarity.UNCOMMON;
    }
    
    // 3. Live Frog (Nhái sống): only predators (Snakehead, Catfish, etc.)
    if (baitId === 'bait_natural_4') {
      const n = fish.name.toLowerCase().normalize('NFC');
      return n.includes('lóc') || n.includes('trê') || n.includes('mập') || n.includes('lăng') || n.includes('mao tiên');
    }

    // 4. Special Live Bait (catching a fish to use as bait)
    if (baitId === 'live_bait') {
      return fish.rarity === Rarity.EPIC || fish.rarity === Rarity.LEGENDARY || fish.rarity === Rarity.MYTHIC;
    }

    return true;
  }, []);

  const getRandomFishType = useCallback((rarityBoost: number): FishType => {
    const validFishes = FISH_TYPES.filter(f => 
      (!f.allowedLocations || f.allowedLocations.includes(location)) && 
      (!f.allowedTimes || f.allowedTimes.includes(timeOfDay))
    );
    const pool = validFishes.length > 0 ? validFishes : FISH_TYPES;

    // Hardcore Additive Multipliers
    const frenzyBonus = frenzyActive.current ? 1.5 : 0;
    const castBonus = perfectCastBonus.current ? 0.2 : 0;
    const weatherFactor = WEATHER_BONUSES[weather].rarity;

    const weightedTypes = pool.map(f => {
      let weight = f.weight;
      
      // Preferred bait still gives a strong 2.5x weight multiplier for specific fish
      if (f.preferredBaits && f.preferredBaits.includes(currentBait.id)) {
        weight *= 2.5;
      }

      // Check bait compatibility (Hardcore selective attraction)
      if (!checkBaitCompatibility(f, currentBait.id)) {
        weight = 0;
      }

      // Base boost starts at 1.0 (100%)
      let finalBoost = 1.0 + rarityBoost + frenzyBonus + castBonus;

      // Skills and Live Bait are now additive
      if (liveBait) {
          // Live bait filters out junk and common fish almost entirely
          if (f.rarity === Rarity.JUNK || f.rarity === Rarity.COMMON) {
            weight *= 0.05;
          }
          if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) finalBoost += 4.5;
          if (f.rarity === Rarity.EPIC) finalBoost += 2.0;
      }

      if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) {
          if (skills.masterAngler > 0) finalBoost += 1.0;
      }

      // Apply Location penalties/bonuses
      if (location === 'POND') {
        if (f.rarity === Rarity.RARE) weight *= 0.7;
        if (f.rarity === Rarity.EPIC) weight *= 0.4;
        if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) weight *= 0.2;
      } else if (location === 'CAVE') {
        if (f.rarity === Rarity.RARE) weight *= 1.5;
        if (f.rarity === Rarity.EPIC) weight *= 2.0;
        if (f.rarity === Rarity.LEGENDARY || f.rarity === Rarity.MYTHIC) weight *= 2.5;
      }

      // Apply the final additive boost and weather multiplier
      if (f.rarity === Rarity.RARE) weight *= (1 + (finalBoost - 1) * 0.5) * weatherFactor;
      if (f.rarity === Rarity.EPIC) weight *= finalBoost * weatherFactor;
      if (f.rarity === Rarity.LEGENDARY) weight *= (finalBoost * 1.5) * weatherFactor;
      if (f.rarity === Rarity.MYTHIC) weight *= (finalBoost * 2.0) * weatherFactor;

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
    
    let yBase = 300;
    let yRange = 250;
    
    if (type.rarity === Rarity.RARE || type.rarity === Rarity.EPIC) {
        yBase = 380;
    } else if (type.rarity === Rarity.LEGENDARY || type.rarity === Rarity.MYTHIC) {
        yBase = 450;
        yRange = 150;
    } else if (type.rarity === Rarity.JUNK) {
        yBase = 250;
        yRange = 200;
    }

    const y = yBase + Math.random() * yRange;
    const initialDir = Math.random() > 0.5 ? 1 : -1;
    const baseSpeed = (0.4 + Math.random() * 0.6) * WEATHER_BONUSES[weather].speed;
    const personalities: FishPersonality[] = ['curious', 'shy', 'brave'];
    const swimStyles: FishSwimStyle[] = ['glider', 'jerky', 'charger'];
    // Hardcore: Golden fish is 1.5% chance instead of 5%
    const isGolden = Math.random() < 0.015;

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
      fish.x = (Math.random() - 0.2) * (CANVAS_WIDTH * 1.4);
      initialFish.push(fish);
    }
    fishRef.current = initialFish;
  }, [spawnSingleFish]);

  const canStartFishing = useCallback(() => {
    const currentBaitCount = baitCounts[currentBait.id] || 0;
    const hasAvailableRod = ownedRods.includes(currentRod.id);

    if (!hasAvailableRod) {
      addNotification('Không có cần câu. Hãy mua lại cần mới.', 'warning');
      soundManager.playError();
      return false;
    }
    if ((currentRod.durability || 0) <= 0) {
      addNotification('Cần câu đã hỏng. Hãy sửa chữa để tiếp tục!', 'warning');
      soundManager.playError();
      return false;
    }
    if ((currentTackle.durability || 0) <= 0) {
      addNotification('Thẻo câu đã hỏng. Hãy sửa chữa hoặc thay thẻo mới!', 'warning');
      soundManager.playError();
      return false;
    }
    if (currentBaitCount <= 0 && !liveBait && currentBait.price > 0) {
      addNotification('Đã hết mồi câu. Vui lòng mua thêm mồi câu hoặc chọn mồi sống từ túi đồ.', 'warning');
      soundManager.playError();
      return false;
    }
    if (inventoryCount >= inventoryCapacity) {
      addNotification('Túi đồ đã đầy! Hãy bán bớt cá hoặc nâng cấp túi.', 'warning');
      soundManager.playError();
      return false;
    }
    return true;
  }, [baitCounts, currentBait.id, currentRod, currentTackle, ownedRods, addNotification, liveBait, inventoryCount, inventoryCapacity]);

  const handleHookAction = useCallback(() => {
    if (gameState === GameState.NIBBLING && activeFish.current) {
      if (isBitingHard.current) {
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
            const scaledHP = 500 + (playerLevel || 1) * 35; 
            bossHP.current = scaledHP;
            bossMaxHP.current = scaledHP;
            playerHP.current = 100;
            bossAttackTimer.current = 0;
            playerAttackCharge.current = 0;
            inkAlpha.current = 0;
            torpedoActive.current = false;
            soundManager.playSuccess();
            shakeIntensity.current = 12;
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
        
        const sizeMatchRatio = Math.min(1, collidingFish.type.value / lineLimit);
        const mismatchPenalty = 1 - sizeMatchRatio;
        // Hardcore: Base zone reduced, Sharp Eye nerfed, Tension penalty increased
        // Control Repurposed: Now increases green zone size by 5% per control unit
        const controlBonus = (currentRod.control - 1) * 0.05;
        tensionZoneSize.current = Math.max(0.1, 0.40 - (collidingFish.type.tension / 200) + (skills.sharpEye * 0.02) + controlBonus - mismatchPenalty * 0.2 + (currentBait.attraction / 1500));
        tensionZone.current = 0.5 - tensionZoneSize.current / 2;

        willAutoEscape.current = false;
        soundManager.playSuccess();
        shakeIntensity.current = 8;
      } else {
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
  }, [gameState, liveBait, onFishLost, setGameState, setLiveBait, currentTackle.maxValue, currentRod.maxValue, onLineBroken, onRodBroken, skills.sharpEye, currentRod.control, currentBait.attraction]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (stunTimer.current > 0) return;
      
      if (!isSpacePressed.current) {
        isSpacePressed.current = true;
        if (gameState === GameState.IDLE) {
          if (!canStartFishing()) return;
          resetEventState();
          setGameState(GameState.CHARGING);
          chargePower.current = 0;
          chargeDirection.current = 1;
        } else if (gameState === GameState.WAITING) {
          // Manual reeling back handled in update
        } else if (gameState === GameState.NIBBLING) {
           handleHookAction();
        } else if (gameState === GameState.REELING) {
          tensionVelocity.current -= 0.0035;
          tugFactor.current = 1.0;
        }
      }
    }
    if (e.code === 'KeyF' && gameState === GameState.REELING) {
      if (skills.focus > 0) {
        if (focusCooldown.current <= 0 && !focusActive.current) {
          focusActive.current = true;
          focusTimer.current = 180;
          focusCooldown.current = 900;
          addNotification('TẬP TRUNG! Tension chậm lại 3 giây.', 'info');
        } else if (focusCooldown.current > 0) {
          addNotification(`Tập Trung đang hồi chiêu (${Math.ceil(focusCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Tập Trung chưa mở khóa (Cấp 15)', 'warning');
      }
    }
    if (e.code === 'KeyG' && gameState === GameState.REELING) {
      if (skills.powerReel > 0) {
        if (powerReelCooldown.current <= 0 && !powerReelActive.current) {
          powerReelActive.current = true;
          powerReelTimer.current = 120;
          powerReelCooldown.current = 1200;
          addNotification('KÉO MẠNH! Reeling tăng tốc 2 giây!', 'success');
        } else if (powerReelCooldown.current > 0) {
          addNotification(`Kéo Mạnh đang hồi chiêu (${Math.ceil(powerReelCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Kéo Mạnh chưa mở khóa (Cấp 20)', 'warning');
      }
    }
  }, [gameState, canStartFishing, handleHookAction, addNotification, skills.focus, skills.powerReel]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = false;
      if (gameState === GameState.CHARGING) {
        perfectCastBonus.current = chargePower.current >= 95;
        targetHookX.current = 220 + (chargePower.current / 100) * 500;
        targetHookY.current = 250 + (chargePower.current / 100) * 300;
        castProgress.current = 0;
        onCast();
        soundManager.playCast();
        setGameState(GameState.CASTING);
        resetEventState();
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
      perfectCastBonus.current = chargePower.current >= 95;
      targetHookX.current = 220 + (chargePower.current / 100) * 500;
      targetHookY.current = 250 + (chargePower.current / 100) * 300;
      castProgress.current = 0;
      onCast();
      setGameState(GameState.CASTING);
    } else if (gameState === GameState.BOSS_FIGHT) {
      isBossCharging.current = false;
      
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
          if (isBossDefeated.current) return;
          isBossDefeated.current = true;
          
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
  }, [gameState, setGameState, addNotification, onBossDefeated, onSessionReset, onCast, skills.sharpEye, bossMaxHP]);

  const update = useCallback((ctx: CanvasRenderingContext2D, timestamp: number) => {
    // Delta-time cap: clamp to 50ms to prevent spiral-of-death on slow devices
    const delta = Math.min(timestamp - lastFrameTime.current, 50);
    lastFrameTime.current = timestamp;
    // Skip frame if tab is in background (delta too large)
    if (delta < 1) return;
    
    frameCount.current++;
    
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

    const isCombat = gameState === GameState.NIBBLING || gameState === GameState.REELING || gameState === GameState.BOSS_FIGHT;
    const isCinematicActive = (isCombat || gameState === GameState.CAUGHT);
    
    if (isCinematicActive) {
        cameraZoomTarget.current = (gameState === GameState.BOSS_FIGHT) ? 1.08 : 1.25; 
        let fX = CANVAS_WIDTH / 2;
        let fY = CANVAS_HEIGHT / 2;
        
        if (gameState === GameState.BOSS_FIGHT) {
            fX = bossX.current;
            fY = bossY.current;
        } else if (activeFish.current) {
            fX = hookX.current;
            fY = hookY.current;
            fX = fX * 0.75 + (CANVAS_WIDTH / 2) * 0.25; 
            fY = fY * 0.75 + (CANVAS_HEIGHT / 2) * 0.25;
        } else {
            fX = hookX.current;
            fY = hookY.current;
        }
        
        const halfVisibleW = (CANVAS_WIDTH / 2) / cameraZoomTarget.current;
        const halfVisibleH = (CANVAS_HEIGHT / 2) / cameraZoomTarget.current;
        
        cameraFocusXTarget.current = Math.max(halfVisibleW, Math.min(CANVAS_WIDTH - halfVisibleW, fX));
        cameraFocusYTarget.current = Math.max(halfVisibleH, Math.min(CANVAS_HEIGHT - halfVisibleH, fY));
    } else {
        cameraZoomTarget.current = 1;
        cameraFocusXTarget.current = CANVAS_WIDTH / 2;
        cameraFocusYTarget.current = CANVAS_HEIGHT / 2;
    }

    const zoomLerp = cameraZoomTarget.current === 1 ? 0.05 : 0.04;
    const focusLerp = cameraZoomTarget.current === 1 ? 0.07 : 0.05;
    
    cameraZoom.current += (cameraZoomTarget.current - cameraZoom.current) * zoomLerp;
    cameraFocusX.current += (cameraFocusXTarget.current - cameraFocusX.current) * focusLerp;
    cameraFocusY.current += (cameraFocusYTarget.current - cameraFocusY.current) * focusLerp;
    
    if (cameraZoomTarget.current === 1 && Math.abs(cameraZoom.current - 1) < 0.002) {
        cameraZoom.current = 1;
        cameraFocusX.current = CANVAS_WIDTH / 2;
        cameraFocusY.current = CANVAS_HEIGHT / 2;
    }

    const isHardResetState = [
        GameState.IDLE, GameState.START, GameState.GAMEOVER, GameState.WAITING, GameState.CHARGING, GameState.CASTING
    ].includes(gameState);

    if (isHardResetState) {
        motionBlurAlpha.current = 0;
        shakeIntensity.current = 0;
    }

    const locInfo = LOCATION_DATA[location] || { currentSpeed: 0 };
    if (locInfo.currentSpeed > 0 && (gameState === GameState.WAITING || gameState === GameState.NIBBLING || gameState === GameState.REELING)) {
        const drift = Math.sin(frameCount.current * 0.01) * locInfo.currentSpeed;
        tensionZone.current += drift;
    }

    if (gameState === GameState.REELING) {
        const fishTension = activeFish.current?.type.tension || 0;
        const targetBlur = Math.min(0.55, (fishTension / 180) * 0.55);
        motionBlurAlpha.current += (targetBlur - motionBlurAlpha.current) * 0.04;
    } else {
        motionBlurAlpha.current *= 0.88;
    }

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

    if ((gameState === GameState.REELING || gameState === GameState.NIBBLING) && !activeFish.current) {
        setGameState(GameState.IDLE);
    }

    const isBossBite = isBossSpawned && gameState === GameState.WAITING && baitSettleTimer.current <= 0;

    if (frenzyActive.current) {
      frenzyTimer.current--;
      if (!frenzyNotified.current) {
        frenzyNotified.current = true;
        addNotification('🔥 PEACEFUL FISHING! Cá hiếm xuất hiện nhiều hơn!', 'achievement');
      }
      if (frenzyTimer.current <= 0) {
        frenzyActive.current = false;
        frenzyTimer.current = 0;
        addNotification('Frenzy kết thúc...', 'info');
      }
      if (frameCount.current % 60 === 0 && fishRef.current.length < 25) {
        fishRef.current.push(spawnSingleFish());
      }
      const frenzyPulse = 0.08 + Math.sin(frameCount.current * 0.12) * 0.04;
      const frenzyGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
      );
      frenzyGrad.addColorStop(0, 'rgba(0,0,0,0)');
      frenzyGrad.addColorStop(1, `rgba(239,68,68,${frenzyPulse})`);
      ctx.fillStyle = frenzyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

    if (transitionProgressRef.current < 1) {
        transitionProgressRef.current += 0.003;
        if (transitionProgressRef.current >= 1) {
            transitionProgressRef.current = 1;
            prevTimeOfDayRef.current = timeOfDay;
        }
    }

    Graphics.drawWaterAndSky(ctx, frameCount.current, weather, location, timeOfDay, prevTimeOfDayRef.current, transitionProgressRef.current, cameraFocusX.current);
    Graphics.drawWeatherEffects(ctx, frameCount.current, weather, location);

    if (weather === 'stormy' && location !== 'CAVE') {
        if (lightningStrikeTimer.current > 0) {
            lightningStrikeTimer.current--;
            lightningStrikeAlpha.current *= 0.92;
            if (lightningStrikeAlpha.current > 0.05) Graphics.drawLightning(ctx, lightningStrikeX.current, lightningStrikeAlpha.current);
        } else {
            if (Math.random() < 0.003) {
                lightningStrikeTimer.current = 60;
                lightningStrikeX.current = Math.random() * CANVAS_WIDTH;
                lightningStrikeAlpha.current = 0.8;
                soundManager.playLightningStrike();
                if (gameState === GameState.REELING) {
                    tensionVelocity.current += (Math.random() - 0.5) * 0.08;
                    stunTimer.current = 20 + Math.random() * 30;
                    isSpacePressed.current = false;
                    shakeIntensity.current = 20;
                    addNotification("SÉT ĐÁNH! Mất kiểm soát cần câu!", "warning");
                }
            } else if (Math.random() < 0.001) soundManager.playThunder();
        }
    } else if (weather === 'rainy' && location !== 'CAVE' && Math.random() < 0.0005) soundManager.playThunder();

    if (stunTimer.current > 0) stunTimer.current--;

    if (location === 'OCEAN' && timeOfDay !== 'NIGHT') Graphics.drawGodRays(ctx, frameCount.current, location, timeOfDay);
    if (location === 'POND' && timeOfDay === 'NIGHT') Graphics.drawAmbientNight(ctx, frameCount.current);
    Graphics.drawComboStreak(ctx, streak, frameCount.current);

    bubblesRef.current.forEach(b => { b.y -= b.speed; if (b.y < 200) b.y = CANVAS_HEIGHT + 20; });
    Graphics.drawBubbles(ctx, bubblesRef.current);

    VFXSystem.updateParticles(vfxParticlesRef.current);
    VFXSystem.drawParticles(ctx, vfxParticlesRef.current);

    const pX = 80; const pY = 150; const rodEndX = 220; const rodEndY = 120; 
    if (isSpacePressed.current && (gameState === GameState.REELING || gameState === GameState.WAITING)) reelRotation.current += 0.25;

    if (baitSettleTimer.current > 0) baitSettleTimer.current--;
    const canAttractFish = gameState === GameState.WAITING && baitSettleTimer.current <= 0;
    const hookInWater = gameState === GameState.WAITING || gameState === GameState.REELING;
    let highestInterestedRarity: Rarity | null = null;

    if (isBossSpawned) {
        if (!bossInitialized.current) { bossExistTimer.current = BOSS_EXIST_TIME; bossInitialized.current = true; bossFailCount.current = 0; }
        const isActuallyActiveInCombat = activeFish.current?.id === 'boss_dummy' || gameState === GameState.BOSS_FIGHT;
        const isBusyFishing = [GameState.NIBBLING, GameState.REELING, GameState.CAUGHT].includes(gameState);

        if (!isActuallyActiveInCombat && !isBusyFishing) {
            bossExistTimer.current--;
            if (bossExistTimer.current <= 0) { 
              setIsBossSpawned(false); 
              bossInitialized.current = false; 
              addNotification("CẢNH BÁO: BOSS đã rời khỏi khu vực này!", "info"); 
            }
        }
        const bTime = frameCount.current * 0.008;
        const targetBx = (CANVAS_WIDTH / 2) + Math.cos(bTime) * (CANVAS_WIDTH * 0.4);
        const targetBy = (CANVAS_HEIGHT / 2) + Math.sin(bTime * 0.7) * (CANVAS_HEIGHT * 0.2) + 120;
        
        if (bossLurkingX.current === 0) { bossLurkingX.current = targetBx; bossLurkingY.current = targetBy; }
        if (bossStrikeTimer.current <= 0) { bossLurkingX.current += (targetBx - bossLurkingX.current) * 0.05; bossLurkingY.current += (targetBy - bossLurkingY.current) * 0.05; }
        else {
            const t = 1 - (bossStrikeTimer.current / 50); const sX = bossStrikeStartX.current; const sY = bossStrikeStartY.current;
            bossLurkingX.current = sX + (hookX.current - sX) * t; bossLurkingY.current = sY + (hookY.current - sY) * t;
            bossStrikeTimer.current--;
        }
        bossLurkingY.current = Math.max(260, bossLurkingY.current);

        if (!isActuallyActiveInCombat && ![GameState.REELING, GameState.NIBBLING, GameState.CAUGHT, GameState.START].includes(gameState)) {
            ctx.save(); const bx = bossLurkingX.current; const by = bossLurkingY.current;
            ctx.translate(bx, by); const bDir = Math.sin(bTime) > 0 ? 1 : -1; ctx.scale(bDir * 1.5, 1.5);
            if (bossStrikeTimer.current > 0 || isBossBite) ctx.translate(-70, 0); 
            ctx.globalAlpha = 0.25; ctx.filter = 'brightness(0.2) contrast(1.2) blur(1px)';
            if (location === 'OCEAN') BossModels.drawAbyssalKraken(ctx, frameCount.current, 100, 100, false);
            else if (location === 'CAVE') BossModels.drawGhostOctopus(ctx, frameCount.current, 100, 100, false);
            else BossModels.drawMechaSharkBoss(ctx, frameCount.current, 100, 100, false);
            ctx.restore();
        }
    } else bossInitialized.current = false;

    const fishArray = fishRef.current;
    // Throttle fish AI: update physics every frame but heavy AI logic every 2 frames
    const isAIFrame = frameCount.current % 2 === 0;
    const rightSideFishCount = isAIFrame ? fishArray.reduce((count, fi) => count + (fi.x > CANVAS_WIDTH * 0.7 ? 1 : 0), 0) : 0;
    const currentFrame = frameCount.current;
    const currentHookX = hookX.current;
    const currentHookY = hookY.current;
    const currentActiveFish = activeFish.current;

    for (let fishIndex = 0, fishLength = fishArray.length; fishIndex < fishLength; fishIndex++) {
      const f = fishArray[fishIndex];
      if (currentActiveFish?.id === f.id) continue;
      
      // Heavy AI state logic only on AI frames
      if (!isAIFrame) {
        // Just move the fish - skip state checks
        const moveSpeed = f.baseSpeed * (f.state === 'scared' ? 2.8 : f.state === 'interested' ? 1.1 : f.state === 'inspecting' ? 0.2 : 1);
        const vx = Math.cos(f.angle) * moveSpeed; const vy = Math.sin(f.angle) * moveSpeed;
        f.velocity = { x: vx, y: vy }; f.x += vx; f.y += vy + (f.targetY - f.y) * 0.015;
        if (f.x > CANVAS_WIDTH + 200) { f.x = -190; f.direction = 1; } if (f.x < -200) { f.x = CANVAS_WIDTH + 190; f.direction = -1; }
        if (f.y < 220) f.y = 220; if (f.y > CANVAS_HEIGHT) f.y = CANVAS_HEIGHT;
        Graphics.drawFishTexture(ctx, f.type, currentFrame, false, { x: f.x, y: f.y, angle: f.angle, direction: 1 }, moveSpeed, f.swimStyle, false, f.isGolden);
        continue;
      }
      
      const dx = currentHookX - f.x; const dy = currentHookY - f.y;
      const distSq = dx * dx + dy * dy;
      const lineLimit = currentTackle.maxValue || 300;
      const sizeMatchRatio = Math.min(1, f.type.value / lineLimit);
      const attractRange = (currentTackle.attraction + currentBait.attraction) * WEATHER_BONUSES[weather].attraction * (0.6 + sizeMatchRatio * 0.6) + 60;
      const interestChance = 0.4 + sizeMatchRatio * 0.5;
      f.stateTimer--;
      if (canAttractFish && distSq < attractRange * attractRange) {
        const isNearPier = currentHookX < 300; const scaredRange = isNearPier ? 80 : 120;
        
        // AI Personality: Shy fish are spooked by recent splashes
        const recentSplash = vfxParticlesRef.current.some(p => p.type === 'ripple' && Math.sqrt((p.x - f.x)**2 + (p.y - f.y)**2) < 150 && (p.life || 0) > 40);
        
        if (f.state !== 'interested' && f.state !== 'scared' && Math.random() < interestChance / 20) {
            // Hardcore selective attraction: Fish ignore baits they don't like
            if (!checkBaitCompatibility(f.type, currentBait.id)) {
                continue;
            }
            
            if ((f.personality === 'shy' && distSq < scaredRange * scaredRange) || (f.personality === 'shy' && recentSplash)) { 
                f.state = 'scared'; f.targetAngle = Math.atan2(-dy, -dx); f.stateTimer = 180; 
            }
            else f.state = 'interested';
        }
        
        if (f.state === 'scared') {
            f.targetAngle = Math.atan2(-dy, -dx);
            f.stateTimer--;
        }
        else if (f.state === 'interested') {
          if (f.personality === 'shy' && distSq < scaredRange * scaredRange) { f.state = 'scared'; f.targetAngle = Math.atan2(-dy, -dx); f.stateTimer = 180; }
          else { 
            if (distSq > 120) f.targetAngle = Math.atan2(dy, dx); f.targetY = currentHookY; 
            // AI Personality: Curious fish linger 2x longer
            if (f.personality === 'curious' && Math.random() < 0.5) f.stateTimer++; 
            
            if ([Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) {
              if (!highestInterestedRarity || f.type.rarity === Rarity.MYTHIC || (f.type.rarity === Rarity.LEGENDARY && highestInterestedRarity === Rarity.EPIC)) highestInterestedRarity = f.type.rarity;
            }
          }
        }
      } else {
        if (f.state === 'interested' || f.state === 'scared') { f.state = 'wandering'; f.stateTimer = 0; }
        if (f.stateTimer <= 0) {
          f.state = Math.random() > 0.8 ? 'inspecting' : 'wandering'; f.stateTimer = 60 + Math.random() * 200;
          if (f.state === 'wandering') {
            const inCenter = f.x > CANVAS_WIDTH * 0.3 && f.x < CANVAS_WIDTH * 0.7;
            const rightSideEmpty = rightSideFishCount < 3;
            let wanderDir = (rightSideEmpty && f.x < CANVAS_WIDTH * 0.5) ? 0 : (inCenter && Math.random() > 0.3 ? (f.x > CANVAS_WIDTH / 2 ? Math.PI : 0) : (f.velocity.x > 0 ? 0 : Math.PI));
            f.targetAngle = (Math.random() - 0.5) * 1.0 + wanderDir; f.targetY = 280 + Math.random() * 280;
          }
        }
      }
      let moveSpeed = f.baseSpeed;
      if (f.state === 'scared') moveSpeed *= 2.8; else if (f.state === 'interested') moveSpeed *= 1.1; else if (f.state === 'inspecting') moveSpeed *= 0.2; else if (f.state === 'predatory') moveSpeed *= 3.8;
      if (f.swimStyle === 'jerky') moveSpeed *= (Math.sin(currentFrame * 0.15) > 0 ? 2.0 : 0.1); else if (f.swimStyle === 'charger') moveSpeed *= 1.6;
      const dx_hook = currentHookX - f.x; const dy_hook = currentHookY - f.y; const distToHook = Math.sqrt(dx_hook * dx_hook + dy_hook * dy_hook);
      if (f.state === 'interested' && distToHook < 15) { moveSpeed *= 0.2; if (distToHook < 5) moveSpeed = 0; if ([Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity) && currentFrame % 5 === 0) createSparkles(f.x, f.y, 1, [f.type.rarity === Rarity.MYTHIC ? '#a855f7' : '#eab308', '#ffffff']); }
      const isSmallFishActive = currentActiveFish && currentActiveFish.id !== 'boss_dummy' && [Rarity.COMMON, Rarity.RARE].includes(currentActiveFish.type.rarity);
      if (isSmallFishActive && [GameState.NIBBLING, GameState.REELING].includes(gameState) && [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity) && distToHook < 400 && f.state !== 'predatory' && Math.random() < 0.002) { f.state = 'predatory'; f.targetAngle = Math.atan2(dy_hook, dx_hook); addNotification(`CẢNH BÁO: Một con ${f.type.name} đang nhắm vào cá của bạn!`, 'warning'); }
      if (f.state === 'predatory') {
          if (!isSmallFishActive || ![GameState.NIBBLING, GameState.REELING].includes(gameState)) { f.state = 'wandering'; f.targetAngle = Math.random() * Math.PI * 2; }
          else { f.targetAngle = Math.atan2(dy_hook, dx_hook); f.targetY = currentHookY; if (distToHook < 15) (f as any)._shouldEat = true; }
      }
      f.angle = lerpAngle(f.angle, f.targetAngle, f.state === 'scared' ? 0.25 : (f.state === 'interested' ? 0.045 : 0.06));
      const vx = Math.cos(f.angle) * moveSpeed; const vy = Math.sin(f.angle) * moveSpeed; f.velocity = { x: vx, y: vy }; f.x += vx; f.y += vy + (f.targetY - f.y) * 0.015;
      if (f.x > CANVAS_WIDTH + 200) { f.x = -190; f.direction = 1; } if (f.x < -200) { f.x = CANVAS_WIDTH + 190; f.direction = -1; }
      if (f.y < 220) f.y = 220; if (f.y > CANVAS_HEIGHT) f.y = CANVAS_HEIGHT;
      if ((moveSpeed > 1.5 || ['scared', 'interested'].includes(f.state)) && currentFrame % (f.state === 'scared' ? 2 : 6) === 0) vfxParticlesRef.current.push({ x: f.x - Math.cos(f.angle) * (f.type.size * 0.8), y: f.y - Math.sin(f.angle) * (f.type.size * 0.8), size: 1 + Math.random() * 2, speed: 0, opacity: 0.4, life: 20 + Math.random() * 10, color: 'rgba(255,255,255,0.3)', type: 'circle' });
      Graphics.drawFishTexture(ctx, f.type, currentFrame, false, { x: f.x, y: f.y, angle: f.angle, direction: 1 }, moveSpeed, f.swimStyle, false, f.isGolden);
      if (f.state === 'interested' && [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) Graphics.drawAlert(ctx, f.x, f.y, f.type.rarity, frameCount.current);
    }
    
    const predator = fishArray.find(f => (f as any)._shouldEat);
    if (predator) {
        createSplash(hookX.current, hookY.current, 2.5); soundManager.playSplash(); addNotification(`KINH NGẠC! ${predator.type.name} đã nuốt chửng con cá nhỏ!`, 'success');
        const bigFishInstance = { ...predator }; delete (bigFishInstance as any)._shouldEat; bigFishInstance.state = 'interested'; activeFish.current = bigFishInstance;
        fishRef.current = fishRef.current.filter(fi => fi.id !== predator.id);
        if (gameState === GameState.NIBBLING) {
            nibbleCount.current = 0; nibbleTimer.current = 40; isBitingHard.current = false;
            const rarity = bigFishInstance.type.rarity; let minN = 3, maxN = 5;
            if (rarity === Rarity.LEGENDARY) { minN = 4; maxN = 6; } else if (rarity === Rarity.MYTHIC) { minN = 5; maxN = 8; }
            targetNibbles.current = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
            nibbleSide.current = bigFishInstance.x < hookX.current ? -1 : 1; bigFishInstance.x = hookX.current + 35 * nibbleSide.current; bigFishInstance.y = hookY.current + 2;
            lungeProgress.current = 0; lungeDelay.current = 30;
        } else if (gameState === GameState.REELING) {
            const lineLimit = currentTackle.maxValue || 300; const sizeMatch = Math.min(1, bigFishInstance.type.value / lineLimit); const mismatchPenalty = 1 - sizeMatch;
            tensionZoneSize.current = Math.max(0.18, 0.48 - (bigFishInstance.type.tension / 220) + (skills.sharpEye * 0.05) - mismatchPenalty * 0.18 + (currentBait.attraction / 1000));
            tensionCursor.current = Math.random() > 0.5 ? 0.8 : 0.2; shakeIntensity.current = 15;
            const dx = 220 - hookX.current; const dy = 120 - hookY.current; bigFishInstance.angle = Math.atan2(dy, dx);
        }
    }

    if (highestInterestedRarity && hookInWater) Graphics.drawRareDetectionFlash(ctx, highestInterestedRarity, frameCount.current);
    if (gameState === GameState.IDLE) { hookX.current = rodEndX; hookY.current = rodEndY; }

    if (gameState === GameState.CHARGING) {
      chargePower.current += 1.8 * chargeDirection.current; if (chargePower.current >= 100) { chargePower.current = 100; chargeDirection.current = -1; } if (chargePower.current <= 0) { chargePower.current = 0; chargeDirection.current = 1; }
      Graphics.drawPowerBar(ctx, pX + 50, pY - 60, chargePower.current); hookX.current = rodEndX; hookY.current = rodEndY;
    }

    if (gameState === GameState.CASTING) {
      castProgress.current += 0.025; 
      hookX.current = rodEndX + (targetHookX.current - rodEndX) * castProgress.current;
      const t = castProgress.current; hookY.current = (1 - t) * rodEndY + t * targetHookY.current + (-200 * 4 * t * (1 - t));
      if (frameCount.current % 1 === 0) vfxParticlesRef.current.push({ x: hookX.current + (Math.random()-0.5)*10, y: hookY.current + (Math.random()-0.5)*10, size: 1 + Math.random()*2, speed: 0, opacity: 0.6, life: 10, color: 'rgba(255,255,255,0.4)', type: 'trail' });
      if (castProgress.current >= 1) {
        hookX.current = targetHookX.current; hookY.current = targetHookY.current;
        castProgress.current = 0;
        createSplash(hookX.current, hookY.current, perfectCastBonus.current ? 2.0 : 1.2); if (perfectCastBonus.current) shakeIntensity.current = 5;
        setGameState(GameState.WAITING); const baseSettle = frenzyActive.current ? 90 + Math.random() * 90 : perfectCastBonus.current ? 120 + Math.random() * 60 : 240 + Math.random() * 240;
        baitSettleTimer.current = baseSettle; baitSettleTotal.current = baseSettle;
        if (perfectCastBonus.current && eventHandledRef.current !== 'perfect_cast') { eventHandledRef.current = 'perfect_cast'; addNotification('QUĂNG HOÀN HẢO! +20% Attraction', 'success'); }
      }
    }

    if (gameState === GameState.WAITING) {
      if (isSpacePressed.current) {
        const dx = rodEndX - hookX.current; const dy = rodEndY - hookY.current; const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 20) { hookX.current += (dx / dist) * 4.5; hookY.current += (dy / dist) * 4.5; if (frameCount.current % 15 === 0) createSplash(hookX.current, hookY.current, 0.3); }
        else setGameState(GameState.IDLE);
      } else hookY.current += Math.sin(frameCount.current * 0.1) * 0.3;
      if (baitSettleTimer.current > 0) baitSettleTimer.current--;
      if (isBossBite && bossStrikeTimer.current === 0 && !activeFish.current) {
          const dx = bossLurkingX.current - hookX.current; const dy = bossLurkingY.current - hookY.current; const distToHook = Math.sqrt(dx*dx + dy*dy);
          if (distToHook > 120) { bossStrikeTimer.current = 50; bossStrikeStartX.current = bossLurkingX.current; bossStrikeStartY.current = bossLurkingY.current; soundManager.playBossWarning(); addNotification("CẢNH BÁO: BOSS ĐANG LAO TỚI MỒI!", "warning"); return; }
      }
      const collidingFish = isBossBite ? { id: 'boss_dummy', type: { name: location === 'OCEAN' ? 'KRAKEN VỰC THẲM' : (location === 'CAVE' ? 'BẠCH TUỘC MA' : 'CÁ MẬP CƠ KHÍ'), value: 5000, weight: 9999, rarity: Rarity.MYTHIC, size: 100, speed: 5.0, description: 'Boss huyền thoại', color: location === 'OCEAN' ? '#4c1d95' : (location === 'CAVE' ? '#e0f2fe' : '#475569'), tension: 90, spriteInfo: { color: location === 'OCEAN' ? '#4c1d95' : (location === 'CAVE' ? '#e0f2fe' : '#475569'), shape: location === 'OCEAN' ? 'kraken' : (location === 'CAVE' ? 'kraken' : 'shark') } }, x: hookX.current, y: hookY.current, targetY: hookY.current, angle: 0, targetAngle: 0, personality: 'brave' as FishPersonality, swimStyle: 'charger' as FishSwimStyle, state: 'interested' as FishAIState, stateTimer: 60, velocity: { x: 0, y: 0 }, baseSpeed: 5.0, isGolden: false, speed: 5.0, direction: 1 } : (baitSettleTimer.current <= 0 ? fishRef.current.find(f => { 
        // Hardcore selective attraction: Fish ignore baits they don't like even on collision
        if (!checkBaitCompatibility(f.type, currentBait.id)) return false;
        
        const mouthX = f.x + Math.cos(f.angle) * f.type.size; const mouthY = f.y + Math.sin(f.angle) * f.type.size; const dx = mouthX - hookX.current; const dy = mouthY - hookY.current; return (dx*dx + dy*dy) < 20*20; 
      }) : null);
      if (collidingFish) {
        activeFish.current = collidingFish; nibbleSide.current = collidingFish.x < hookX.current ? -1 : 1; activeFish.current.angle = 0; activeFish.current.x = hookX.current + 35 * nibbleSide.current; activeFish.current.y = hookY.current + 2; lungeProgress.current = 0; lungeDelay.current = 20 + Math.random() * 30;
        setGameState(GameState.NIBBLING); nibbleTimer.current = 30 + Math.random() * 40; nibbleCount.current = 0;
        const rarity = collidingFish.type.rarity; let minN = 1, maxN = 3; if (isBossBite) { minN = 5; maxN = 8; } else if (rarity === Rarity.RARE) { minN = 2; maxN = 4; } else if (rarity === Rarity.EPIC) { minN = 3; maxN = 5; } else if (rarity === Rarity.LEGENDARY) { minN = 4; maxN = 6; } else if (rarity === Rarity.MYTHIC) { minN = 5; maxN = 8; }
        targetNibbles.current = Math.floor(Math.random() * (maxN - minN + 1)) + minN; isBitingHard.current = false; soundManager.playBite();
      }
    }

    if (gameState === GameState.NIBBLING && activeFish.current) {
        activeFish.current.angle = 0;
        if (isBitingHard.current) {
            activeFish.current.x = hookX.current; activeFish.current.y = hookY.current + 2;
            biteWindowTimer.current--; if (biteWindowTimer.current <= 0) { if (eventHandledRef.current === 'fish_lost_window') return; eventHandledRef.current = 'fish_lost_window'; createSplash(hookX.current, hookY.current, 1.0); onFishLost("Hụt rồi! Cá đã sổng mất."); activeFish.current = null; }
        } else {
            const side = nibbleSide.current; const retreatDist = 35 * side;
            if (lungeDelay.current > 0) { lungeDelay.current--; activeFish.current.x = hookX.current + retreatDist; }
            else { lungeProgress.current += 0.035; const lunge = Math.sin(lungeProgress.current * Math.PI); activeFish.current.x = hookX.current + retreatDist * (1 - lunge); if (lunge > 0.9) { hookX.current += (Math.random() - 0.5) * 0.8; if (frameCount.current % 10 === 0) createSplash(hookX.current, hookY.current, 0.4); } if (lungeProgress.current >= 1) { lungeProgress.current = 0; lungeDelay.current = 60 + Math.random() * 90; } }
            activeFish.current.y = hookY.current + 2;
            nibbleTimer.current--; if (nibbleTimer.current <= 0) { nibbleCount.current++; if (nibbleCount.current >= targetNibbles.current) { isBitingHard.current = true; biteWindowTimer.current = Math.max(40, 70 - (activeFish.current.type.tension / 6)); createSplash(hookX.current, hookY.current, 2.2); soundManager.playBite(); } else { nibbleTimer.current = 35 + Math.random() * 45; createSplash(hookX.current, hookY.current, 0.5); soundManager.playBite(); } }
        }
        hookX.current += (Math.random() - 0.5) * 0.8;
        Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, { x: activeFish.current.x, y: activeFish.current.y, angle: activeFish.current.angle, direction: -nibbleSide.current }, 0.5, activeFish.current.swimStyle, false, activeFish.current.isGolden);
        if (isBitingHard.current) { ctx.save(); ctx.font = 'bold 60px Arial'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center'; ctx.shadowBlur = 20; ctx.shadowColor = 'white'; ctx.fillText('!', hookX.current, hookY.current - 50); ctx.restore(); }
    }

    if (gameState === GameState.REELING && activeFish.current) {
      const fishBehavior = activeFish.current.type.behavior;
      if (fishBehavior && fishBehavior !== 'NORMAL') {
        behaviorTimer.current--;
        if (behaviorTimer.current <= 0) {
          if (isBehaviorActive.current) { isBehaviorActive.current = false; behaviorType.current = null; behaviorTimer.current = 180 + Math.random() * 240; }
          else { isBehaviorActive.current = true; behaviorTimer.current = 45 + Math.random() * 60; if (fishBehavior === 'LEAPER') behaviorType.current = 'jump'; else if (fishBehavior === 'DIVER') behaviorType.current = 'dive'; else if (fishBehavior === 'AGGRESSIVE') behaviorType.current = 'thrash'; if (behaviorType.current === 'jump') createSplash(hookX.current, hookY.current, 1.2); else if (behaviorType.current === 'dive') soundManager.playClick(); }
        }
      }
      if (isBehaviorActive.current && behaviorType.current) Graphics.drawBehaviorIcon(ctx, hookX.current, hookY.current, behaviorType.current as any, frameCount.current);

      const lineLimit = currentTackle.maxValue || 300; const fishValue = activeFish.current.type.value; const sizeMatch = Math.min(1, lineLimit / fishValue); const mismatchPenalty = Math.max(0, (fishValue - lineLimit) / lineLimit);
      const dx = rodEndX - hookX.current; const dy = rodEndY - hookY.current; const distToRod = Math.sqrt(dx*dx + dy*dy);
      if (distToRod > 15) activeFish.current.angle = lerpAngle(activeFish.current.angle, Math.atan2(dy, dx), 0.2);
      if (tugFactor.current > 0) tugFactor.current -= 0.12; if (tugFactor.current < 0) tugFactor.current = 0;
      let jumpOffsetY = 0; if (isBehaviorActive.current && behaviorType.current === 'jump') jumpOffsetY = Math.sin(((behaviorTimer.current % 60) / 60) * Math.PI) * 80;
      const tugX = Math.cos(activeFish.current.angle) * (tugFactor.current * 10); const tugY = Math.sin(activeFish.current.angle) * (tugFactor.current * 10);
      Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, { x: hookX.current - tugX, y: hookY.current - tugY - jumpOffsetY, angle: activeFish.current.angle, direction: 1 }, 2.5, activeFish.current.swimStyle, false, activeFish.current.isGolden);

      const ft = activeFish.current.type.tension; let finalGravity = ((0.00045 + (ft / 160000)) / currentRod.control) * 4; let finalLift = 0.00135 * currentRod.control;
      if (isBehaviorActive.current) { if (behaviorType.current === 'dive') finalGravity += 0.006; if (behaviorType.current === 'thrash') tensionCursor.current += (Math.random() - 0.5) * 0.035; }
      const isBerserk = activeFish.current.type.canBerserk && reelingProgress.current > 80;
      if (isBerserk) { finalGravity *= 1.45; shakeIntensity.current = Math.max(shakeIntensity.current, 10); if (frameCount.current % 15 < 7) vfxParticlesRef.current.push({ x: hookX.current + (Math.random()-0.5)*40, y: hookY.current + (Math.random()-0.5)*40, size: 3, speed: 0.5, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 20, opacity: 1, color: '#ef4444', type: 'circle' }); }
      if (focusActive.current) { 
        focusTimer.current--; 
        if (focusTimer.current <= 0) focusActive.current = false;
        
        // Add Focus screen effect (pulsing blue vignette)
        const pulse = 0.5 + 0.5 * Math.sin(frameCount.current * 0.1);
        ctx.save();
        const focusGrad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 200, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 600);
        focusGrad.addColorStop(0, 'rgba(0,0,0,0)');
        focusGrad.addColorStop(1, `rgba(59, 130, 246, ${0.1 + pulse * 0.1})`);
        ctx.fillStyle = focusGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }
      if (focusCooldown.current > 0) focusCooldown.current--;
      
      if (powerReelActive.current) { 
        powerReelTimer.current--; 
        if (powerReelTimer.current <= 0) powerReelActive.current = false;
        
        // Add Power Reel particles at the reel/rod position
        if (frameCount.current % 3 === 0) {
            vfxParticlesRef.current.push({
                x: 100 + Math.random() * 20,
                y: 160 + Math.random() * 20,
                size: 2 + Math.random() * 3,
                speed: 1,
                vx: -2 - Math.random() * 4,
                vy: -Math.random() * 4,
                life: 30,
                opacity: 1,
                color: '#fb923c',
                type: 'star'
            });
        }
      }
      if (powerReelCooldown.current > 0) powerReelCooldown.current--;
      const focusMultiplier = focusActive.current ? 0.4 : 1; const powerReelLift = powerReelActive.current ? 1.8 : 1;
      let weatherTension = (skills.weatherExpert > 0 && (WEATHER_BONUSES[weather].tension || 1) > 1) ? 1 + (WEATHER_BONUSES[weather].tension - 1) * 0.5 : (WEATHER_BONUSES[weather].tension || 1);
      
      // Special effect for falling stalactites: random tension spikes and shakes
      if (weather === 'falling_stalactite') {
        if (frameCount.current % 180 < 30) {
            weatherTension *= 1.5;
            shakeIntensity.current = Math.max(shakeIntensity.current, 5);
        }
      }

      const tackleLift = (currentTackle as any).liftBonus || 1.0;
      if (isSpacePressed.current) tensionVelocity.current -= finalLift * powerReelLift * tackleLift; else tensionVelocity.current += finalGravity * focusMultiplier * weatherTension;
      tensionVelocity.current *= 0.95; tensionCursor.current += tensionVelocity.current; tensionCursor.current = Math.max(0, Math.min(1, tensionCursor.current));
      
      const tackleStability = (currentTackle as any).tensionStability || 1.0;
      const rarity = activeFish.current.type.rarity; let zoneSpeed = (0.005 + (ft / 100000) + (fishValue / 800000)) / tackleStability; let wobble = (0.002 + ft / 60000 + (fishValue / 400000)) / tackleStability; let jitter = ((Math.random() - 0.5) * (ft / 3000 + (fishValue / 20000))) / tackleStability;
      if (rarity === Rarity.RARE || rarity === Rarity.EPIC) { zoneSpeed *= 1.4; wobble *= 1.5; if (frameCount.current % 120 < 10) jitter *= 5; }
      else if (rarity === Rarity.LEGENDARY || rarity === Rarity.MYTHIC) { zoneSpeed *= 2 * (Math.sin(frameCount.current * 0.02) > 0.95 ? -1 : 1); wobble *= 2.2; if (frameCount.current % 60 < 5) jitter *= 8; }
      if (isBerserk) { zoneSpeed *= 1.8; wobble *= 1.6; jitter *= 2; }
      tensionZone.current += Math.sin(frameCount.current * zoneSpeed) * wobble + jitter; const hz = tensionZoneSize.current / 2; tensionZone.current = Math.max(hz, Math.min(1 - hz, tensionZone.current));
      const isInZone = Math.abs(tensionCursor.current - tensionZone.current) < hz;
      const progressFactor = 0.8 + sizeMatch * 0.2; const powerReelBoost = powerReelActive.current ? 2 : 1;
      if (isInZone) { reelingProgress.current += Math.max(0.12, 0.35 - (ft / 450)) * (1 + skills.fastHands * 0.25) * progressFactor * powerReelBoost; lineHealth.current = Math.min(100, lineHealth.current + 0.22 * progressFactor); hookX.current = Math.max(rodEndX + 20, hookX.current - 0.5); }
      else {
        let damage = (4 * (0.28 + (ft / 350) + Math.min(1, mismatchPenalty * 0.25))) / currentRod.lineStrength;
        if (lineHealth.current < 15 && Math.random() < (0.02 + skills.lucky * 0.03)) { damage *= 0.1; if (frameCount.current % 120 === 0) addNotification("DÂY SẮP ĐỨT... NHƯNG BẠN VẪN ĐANG GIỮ ĐƯỢC!", "warning"); }
        if (isBehaviorActive.current) { if (behaviorType.current === 'jump' && isSpacePressed.current) { damage *= 4.5; shakeIntensity.current = 10; } if (behaviorType.current === 'thrash') damage *= 1.4; }
        lineHealth.current -= damage;
        // Hardcore: Durability loss scaled to 60fps base
        if (frameCount.current % DURABILITY_CHECK_INTERVAL === 0) { onDurabilityChange('rod', 0.1); onDurabilityChange('tackle', 0.2); }
        if (frameCount.current % 5 === 0) vfxParticlesRef.current.push({ x: (rodEndX + hookX.current)/2, y: (rodEndY + hookY.current)/2, size: 2, speed: 1, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 15, opacity: 0.8, color: '#ef4444', type: 'circle' });
      }
      if (reelingProgress.current >= 100) { setGameState(GameState.CAUGHT); isJumping.current = true; jumpProgress.current = 0; createSparkles(hookX.current, hookY.current, 40, ['#fbbf24', '#f59e0b', '#ffffff']); onDurabilityChange('rod', 0.5); onDurabilityChange('tackle', 1.0); }      
      if (lineHealth.current <= 0) {
        const rodLimit = currentRod.maxValue || 300; createSplash(hookX.current, hookY.current, 1.2); for(let i=0; i<10; i++) vfxParticlesRef.current.push({ x: hookX.current, y: hookY.current, size: 2 + Math.random()*4, speed: 0.5, vx: (Math.random()-0.5)*4, vy: 2 + Math.random()*4, opacity: 0.8, life: 40, color: 'rgba(255,255,255,0.4)', type: 'circle' });
        if (activeFish.current?.type.value > lineLimit) onLineBroken(); else if (activeFish.current?.type.value > rodLimit) onRodBroken(); else onFishLost("Cá đã sổng mất rồi!");
        activeFish.current = null;
      }
      if (frameCount.current % 8 === 0) soundManager.playReel(Math.abs(tensionCursor.current - tensionZone.current) * 2);
    }

    if (gameState === GameState.CAUGHT && activeFish.current) {
      if (isJumping.current) {
        hookX.current += (80 - hookX.current) * 0.1; hookY.current += (150 - hookY.current) * 0.1; jumpProgress.current += 0.035;
        const jX = hookX.current; const jY = hookY.current - Math.sin(Math.PI * jumpProgress.current) * 100; 
        activeFish.current.angle = lerpAngle(activeFish.current.angle, (Math.PI * 1.5) + (jumpProgress.current * 4), 0.12);
        if (frameCount.current % 2 === 0) vfxParticlesRef.current.push({ x: jX + (Math.random() - 0.5) * 10, y: jY + (Math.random() - 0.5) * 10, size: 2 + Math.random() * 4, speed: 1, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 25, opacity: 1, color: '#fbbf24', type: 'star' });
        if (activeFish.current.type.isChest) ChestModels.drawChest(ctx, activeFish.current.type.rarity, frameCount.current, jX, jY);
        else Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, { x: jX, y: jY, angle: activeFish.current.angle, direction: 1 }, 2.2, activeFish.current.swimStyle, true, activeFish.current.isGolden);
        if (jumpProgress.current >= 1 || Math.abs(80 - hookX.current) < 10) { 
          const caughtType = activeFish.current.type; const caughtId = activeFish.current.id; const isGolden = activeFish.current.isGolden;
          createSparkles(80, 150, isGolden ? 60 : 30, ['#fbbf24', '#f59e0b', '#ffffff']);
          fishRef.current = fishRef.current.filter(f => f.id !== caughtId); onFishCaught(caughtType, isGolden); activeFish.current = null; isJumping.current = false; fishRef.current.push(spawnSingleFish());
        }
      }
    }

    if (gameState === GameState.BOSS_FIGHT) {
      const time = frameCount.current * 0.05; const hpRatio = bossHP.current / bossMaxHP.current; const isEnraged = hpRatio < 0.5;
      const moveSpeed = isEnraged ? 1.5 : 1; bossX.current = CANVAS_WIDTH / 2 + Math.cos(time * 0.8 * moveSpeed) * (150 + (isEnraged ? 50 : 0)); bossY.current = CANVAS_HEIGHT / 2 + Math.sin(time * 1.2 * moveSpeed) * (80 + (isEnraged ? 30 : 0));
      
      if (!isBossDefeated.current) {
        bossAttackTimer.current++; 
      }
      
      const attackThreshold = isEnraged ? 55 : 85; const isWarning = bossAttackTimer.current > attackThreshold - 20;
      if (bossAttackTimer.current >= attackThreshold) { 
        playerHP.current = Math.max(0, playerHP.current - (isEnraged ? 25 : 15)); 
        bossAttackTimer.current = 0; 
        shakeIntensity.current = 15;
        // Reduce particles during boss fight for performance
        if (frameCount.current % 2 === 0) {
          vfxParticlesRef.current.push({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, size: 100, speed: 0, opacity: 0.3, life: 10, color: '#ff0000', type: 'ripple' });
        }
        if (location === 'OCEAN' && hpRatio < 0.6) inkAlpha.current = Math.min(0.85, inkAlpha.current + 0.005);
        else if (location === 'POND' && isEnraged && !torpedoActive.current && Math.random() < 0.015) { torpedoActive.current = true; torpedoProgress.current = 0; torpedoX.current = bossX.current; torpedoY.current = bossY.current; torpedoTargetX.current = 40 + Math.random() * 200; torpedoTargetY.current = CANVAS_HEIGHT - 70; addNotification("CẢNH BÁO: TÊN LỬA ĐANG LAO TỚI!", "warning"); }
        else if (location === 'CAVE' && isEnraged && frameCount.current % 200 === 0) { addNotification("CẢNH BÁO: XUNG ĐIỆN TÂM LINH!", "boss"); createSparkles(bossX.current, bossY.current, 50, ['#00f2ff', '#e0f2fe', '#ffffff']); if (isBossCharging.current) { playerHP.current = Math.max(0, playerHP.current - 15); shakeIntensity.current = 15; } }
        if (playerHP.current <= 0) { setGameState(GameState.GAMEOVER); setIsBossSpawned(false); inkAlpha.current = 0; torpedoActive.current = false; addNotification("BẠN ĐÃ THẤT BẠI trước BOSS...", 'warning'); }
      }
      if (isBossCharging.current) playerAttackCharge.current = Math.min(100, playerAttackCharge.current + (2 + skills.fastHands * 0.8));
      else playerAttackCharge.current = Math.max(0, playerAttackCharge.current - 1.5);
      ctx.save(); 
      ctx.translate(bossX.current, bossY.current); 
      // Optimize: Remove expensive filter, use globalAlpha instead for warning effect
      if (isWarning && frameCount.current % 4 < 2) {
        ctx.globalAlpha = 0.85;
      }
      const bossSize = 1.8 + (isEnraged ? 0.4 : 0); 
      ctx.scale(bossSize, bossSize);
      if (location === 'OCEAN') BossModels.drawAbyssalKraken(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning);
      else if (location === 'CAVE') { ctx.globalAlpha *= (hpRatio < 0.4 ? 0.2 : (hpRatio < 0.7 ? 0.4 : 1)); BossModels.drawGhostOctopus(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning); }
      else BossModels.drawMechaSharkBoss(ctx, frameCount.current, bossHP.current, bossMaxHP.current, isWarning);
      ctx.restore();
      const barW = 450; const barH = 14; const barX = (CANVAS_WIDTH - barW) / 2; Graphics.drawBossHealthBarFlash(ctx, bossHP.current, bossMaxHP.current, barX, barW, barH, 40, isEnraged, frameCount.current);
      ctx.fillStyle = isWarning ? '#ef4444' : 'white'; ctx.font = 'bold 14px "Be Vietnam Pro"'; ctx.textAlign = 'center'; const bossTitle = location === 'OCEAN' ? 'KRAKEN VỰC THẲM' : (location === 'CAVE' ? 'BẠCH TUỘC MA' : 'CÁ MẬP CƠ KHÍ'); ctx.fillText(`${bossTitle} (HP: ${Math.ceil(bossHP.current)}%)`, CANVAS_WIDTH/2, 30);
      if (isWarning) { ctx.font = 'bold 10px "Be Vietnam Pro"'; ctx.fillText('!!! CẢNH BÁO: BOSS SẮP TẤN CÔNG !!!', CANVAS_WIDTH/2, 65); }
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.roundRect(40, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill(); ctx.fillStyle = playerHP.current < 30 ? '#ef4444' : '#22c55e'; ctx.roundRect(40, CANVAS_HEIGHT - 70, (playerHP.current / playerMaxHP.current) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 11px "Be Vietnam Pro"'; ctx.textAlign = 'left'; ctx.fillText(`SỨC BỀN NGƯỜI CHƠI: ${Math.ceil(playerHP.current)}%`, 45, CANVAS_HEIGHT - 75);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, 220, 15, 8); ctx.fill(); ctx.fillStyle = playerAttackCharge.current > 80 ? '#fbbf24' : '#eab308'; ctx.roundRect(CANVAS_WIDTH - 260, CANVAS_HEIGHT - 70, (playerAttackCharge.current / 100) * 220, 15, 8); ctx.fill();
      ctx.fillStyle = 'white'; ctx.textAlign = 'right'; ctx.fillText('VẬN LỰC (GIỮ SPACE - THẢ ĐỂ ĐÁNH)', CANVAS_WIDTH - 45, CANVAS_HEIGHT - 75);
      if (torpedoActive.current) {
          torpedoProgress.current += 0.015; 
          const tx = torpedoX.current + (torpedoTargetX.current - torpedoX.current) * torpedoProgress.current; 
          const ty = torpedoY.current + (torpedoTargetY.current - torpedoY.current) * torpedoProgress.current;
          ctx.save(); 
          ctx.translate(tx, ty); 
          ctx.rotate(Math.atan2(torpedoTargetY.current - torpedoY.current, torpedoTargetX.current - torpedoX.current)); 
          ctx.fillStyle = '#ef4444'; 
          ctx.beginPath(); 
          ctx.roundRect(-15, -5, 30, 10, 5); 
          ctx.fill(); 
          ctx.restore();
          if (torpedoProgress.current >= 1) { torpedoActive.current = false; if (isBossCharging.current) { playerHP.current = Math.max(0, playerHP.current - 40); shakeIntensity.current = 30; addNotification("HỨNG TRỌN TÊN LỬA! Thả Space để né đòn!", "warning"); } else { addNotification("NÉ ĐÒN THÀNH CÔNG!", "success"); createSparkles(tx, ty, 30, ['#ffffff', '#fbbf24']); } }
      }
    }

    if (inkAlpha.current > 0) {
        ctx.save(); 
        // Simplified ink effect - no gradient, just fill
        ctx.fillStyle = `rgba(0, 0, 0, ${inkAlpha.current * 0.5})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Fewer ink clouds for better performance
        ctx.fillStyle = `rgba(0, 0, 0, ${inkAlpha.current * 0.3})`;
        for(let i=0; i<3; i++) { 
          const sx = (Math.sin(i * 10 + frameCount.current * 0.01) * 400) + CANVAS_WIDTH/2; 
          const sy = (Math.cos(i * 20 + frameCount.current * 0.01) * 200) + CANVAS_HEIGHT/2; 
          ctx.beginPath(); 
          ctx.ellipse(sx, sy, 80 * inkAlpha.current, 50 * inkAlpha.current, i, 0, Math.PI * 2); 
          ctx.fill(); 
        }
        ctx.restore();
    }

    const rodStress = activeFish.current ? activeFish.current.type.value / Math.max(1, currentRod.maxValue ?? 300) : 0;
    const rodBendAmount = Math.min(2.4, rodStress * (0.6 + 0.4 * (gameState === GameState.REELING ? Math.max(0, Math.min(1, (reelingProgress.current - 50) / 50)) : 0)));

    Graphics.drawPlayerEquipment(ctx, gameState, pX, pY, rodEndX, rodEndY, hookX.current, hookY.current, gameState === GameState.CASTING, lineHealth.current, rodBendAmount, currentRod, chargePower.current, currentTackle, frameCount.current, reelRotation.current, location);
    
    // Simplified vignette - no gradient for better performance
    ctx.save(); 
    const vignetteAlpha = location === 'CAVE' ? 0.6 : (timeOfDay === 'NIGHT' ? 0.4 : 0.15);
    ctx.fillStyle = `rgba(0, 0, 0, ${vignetteAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    if (motionBlurAlpha.current > 0.01) {
        ctx.save(); 
        const pulse = 0.5 + 0.5 * Math.sin(frameCount.current * 0.18); 
        // Simplified motion blur - no gradient
        ctx.fillStyle = `rgba(80,0,0,${motionBlurAlpha.current * 0.2 * pulse})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
    }
    ctx.restore();

    if (gameState === GameState.REELING && activeFish.current) {
        Graphics.drawReelingInterface(ctx, reelingProgress.current, lineHealth.current, tensionCursor.current, tensionZone.current, tensionZoneSize.current, Math.abs(tensionCursor.current - tensionZone.current) < (tensionZoneSize.current / 2), activeFish.current?.type);
        if (isBehaviorActive.current) { ctx.save(); ctx.font = 'bold 18px "Be Vietnam Pro"'; ctx.textAlign = 'center'; ctx.shadowBlur = 12; ctx.shadowColor = 'black'; ctx.fillStyle = behaviorType.current === 'jump' ? '#ef4444' : '#fbbf24'; ctx.fillText(behaviorType.current === 'jump' ? '⚠️ CÁ NHẢY - THẢ SPACE!' : (behaviorType.current === 'dive' ? '⬇️ CÁ ĐANG LẶN!' : '💢 CÁ VÙNG VẪY!'), CANVAS_WIDTH / 2, 175); ctx.restore(); }
        const hasFocus = skills.focus > 0; const hasPowerReel = skills.powerReel > 0;
        if (hasFocus || hasPowerReel) {
            const sx = CANVAS_WIDTH - 180, sy = CANVAS_HEIGHT - 110; ctx.save();
            if (hasFocus) { const fr = focusCooldown.current <= 0 && !focusActive.current; ctx.globalAlpha = focusActive.current ? 1 : (fr ? 0.9 : 0.45); ctx.fillStyle = focusActive.current ? '#60a5fa' : (fr ? '#1e40af' : '#334155'); ctx.roundRect(sx, sy, 76, 40, 8); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = 'bold 10px "Be Vietnam Pro"'; ctx.textAlign = 'center'; ctx.fillText('[F] TẬP TRUNG', sx + 38, sy + 13); if (focusActive.current) { ctx.fillStyle = '#bfdbfe'; ctx.fillText(`${Math.ceil(focusTimer.current / 60)}s`, sx + 38, sy + 30); } else if (!fr) { ctx.fillStyle = '#94a3b8'; ctx.fillText(`${Math.ceil(focusCooldown.current / 60)}s CD`, sx + 38, sy + 30); } else { ctx.fillStyle = '#93c5fd'; ctx.fillText('SẴN SÀNG', sx + 38, sy + 30); } }
            if (hasPowerReel) { const prr = powerReelCooldown.current <= 0 && !powerReelActive.current; ctx.globalAlpha = powerReelActive.current ? 1 : (prr ? 0.9 : 0.45); ctx.fillStyle = powerReelActive.current ? '#fb923c' : (prr ? '#9a3412' : '#334155'); ctx.roundRect(sx + 84, sy, 76, 40, 8); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = 'bold 10px "Be Vietnam Pro"'; ctx.textAlign = 'center'; ctx.fillText('[G] KÉO MẠNH', sx + 122, sy + 13); if (powerReelActive.current) { ctx.fillStyle = '#fed7aa'; ctx.fillText(`${Math.ceil(powerReelTimer.current / 60)}s`, sx + 122, sy + 30); } else if (!prr) { ctx.fillStyle = '#94a3b8'; ctx.fillText(`${Math.ceil(powerReelCooldown.current / 60)}s CD`, sx + 122, sy + 30); } else { ctx.fillStyle = '#fdba74'; ctx.fillText('SẴN SÀNG', sx + 122, sy + 30); } }
            ctx.restore();
        }
    }
    if (gameState === GameState.IDLE && inventoryCount >= inventoryCapacity) {
        ctx.save();
        const msg = "TÚI ĐỒ ĐÃ ĐẦY - HÃY BÁN BỚT CÁ ĐỂ TIẾP TỤC";
        ctx.font = 'bold 13px "Be Vietnam Pro"';
        const tw = ctx.measureText(msg).width;
        const iconW = 22;
        const spacing = 8;
        const totalW = iconW + spacing + tw;
        
        const tx = CANVAS_WIDTH / 2, ty = CANVAS_HEIGHT - 130;
        const startX = tx - totalW / 2;
        
        const pulse = 0.5 + 0.5 * Math.sin(frameCount.current * 0.08);
        
        // Simplified background - no gradient, no shadow
        ctx.fillStyle = `rgba(127, 29, 29, ${0.7 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.roundRect(tx - totalW/2 - 30, ty - 28, totalW + 60, 42, 21);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Icon and text
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText('⚠️', startX, ty - 2);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px "Be Vietnam Pro"';
        ctx.fillText(msg, startX + iconW + spacing, ty - 2);
        
        ctx.restore();
    }
  }, [gameState, onFishCaught, onFishLost, setGameState, currentRod, currentTackle, currentBait, spawnSingleFish, createSplash, createSparkles, skills, weather, location, timeOfDay, isBossSpawned, setIsBossSpawned, addNotification, onBossDefeated, onSessionReset, onLineBroken, onRodBroken, onCast, liveBait, setLiveBait, onDurabilityChange, streak, inventoryCount, inventoryCapacity]);

  useEffect(() => {
    if (timeOfDay !== prevTimeOfDayRef.current && transitionProgressRef.current >= 1) transitionProgressRef.current = 0;
  }, [timeOfDay]);

  useEffect(() => {
    if (weather === 'rainy' || weather === 'stormy') soundManager.startRain(); else soundManager.stopRain();
  }, [weather]);

  useEffect(() => {
    if (location !== lastSpawnedLocationRef.current) {
      // 1. Save current state to the PREVIOUS location
      if (lastSpawnedLocationRef.current) {
        fishPerLocationRef.current[lastSpawnedLocationRef.current] = [...fishRef.current];
        bubblesPerLocationRef.current[lastSpawnedLocationRef.current] = [...bubblesRef.current];
      }

      // 2. Update current location track
      lastSpawnedLocationRef.current = location;

      // 3. Load or Generate state for the NEW location
      const savedFish = fishPerLocationRef.current[location];
      if (savedFish && savedFish.length > 0) {
        fishRef.current = savedFish;
        bubblesRef.current = bubblesPerLocationRef.current[location] || [];
      } else {
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
        // Save initial state
        fishPerLocationRef.current[location] = [...fishRef.current];
        bubblesPerLocationRef.current[location] = [...bubblesRef.current];
      }
    }
  }, [location, spawnInitialFish]);

  useEffect(() => {
    if (streak >= 10 && !frenzyActive.current) { frenzyActive.current = true; frenzyTimer.current = 1200; frenzyNotified.current = false; }
    if (streak < 5) { frenzyActive.current = false; frenzyTimer.current = 0; }
  }, [streak]);

  useEffect(() => {
    const handleBlur = () => { isSpacePressed.current = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); window.removeEventListener('blur', handleBlur); };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState === GameState.BOSS_FIGHT) {
      const scaledHP = 100 + ((playerLevel || 1) - 1) * 30;
      bossHP.current = scaledHP; bossMaxHP.current = scaledHP;
      playerHP.current = 100; playerMaxHP.current = 100;
      bossAttackTimer.current = 0; playerAttackCharge.current = 0;
      bossX.current = CANVAS_WIDTH / 2; bossY.current = CANVAS_HEIGHT / 2;
    }
    const isResting = [GameState.IDLE, GameState.START, GameState.GAMEOVER, GameState.WAITING, GameState.CHARGING, GameState.CASTING].includes(gameState);
    if (isResting) { 
      motionBlurAlpha.current = 0; 
      shakeIntensity.current = 0; 
      if (gameState === GameState.IDLE) {
        activeFish.current = null;
        isBossDefeated.current = false;
        resetEventState();
      }
    }
  }, [gameState, playerLevel]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    // Enable willReadFrequently for better performance on mobile
    const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: false }) as CanvasRenderingContext2D | null;
    if (!ctx) return;
    let animId: number;
    let running = true;
    const render = (timestamp: number) => {
      if (!running) return;
      update(ctx, timestamp);
      animId = window.requestAnimationFrame(render);
    };
    animId = window.requestAnimationFrame(render);
    return () => { running = false; window.cancelAnimationFrame(animId); };
  }, [update]);

  const triggerSkill = useCallback((skillId: 'focus' | 'powerReel') => {
    if (gameState !== GameState.REELING) return;
    
    if (skillId === 'focus') {
      if (skills.focus > 0) {
        if (focusCooldown.current <= 0 && !focusActive.current) {
          focusActive.current = true;
          focusTimer.current = 180;
          focusCooldown.current = 900;
          addNotification('TẬP TRUNG! Tension chậm lại 3 giây.', 'info');
        } else if (focusCooldown.current > 0) {
          addNotification(`Tập Trung đang hồi chiêu (${Math.ceil(focusCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Tập Trung chưa mở khóa (Cấp 15)', 'warning');
      }
    } else if (skillId === 'powerReel') {
      if (skills.powerReel > 0) {
        if (powerReelCooldown.current <= 0 && !powerReelActive.current) {
          powerReelActive.current = true;
          powerReelTimer.current = 120;
          powerReelCooldown.current = 1200;
          addNotification('KÉO MẠNH! Reeling tăng tốc 2 giây!', 'success');
        } else if (powerReelCooldown.current > 0) {
          addNotification(`Kéo Mạnh đang hồi chiêu (${Math.ceil(powerReelCooldown.current / 60)}s)`, 'warning');
        }
      } else {
        addNotification('Kỹ năng Kéo Mạnh chưa mở khóa (Cấp 20)', 'warning');
      }
    }
  }, [gameState, skills.focus, skills.powerReel, addNotification]);

  return {
    canvasRef,
    handlePressStart,
    handlePressEnd,
    triggerSkill
  };
};
