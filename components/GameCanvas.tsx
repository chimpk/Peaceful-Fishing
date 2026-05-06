
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, FishInstance, FishType, RodType, BaitType, Rarity, PlayerSkills, LocationType, TimeOfDay } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FISH_TYPES, WEATHER_BONUSES } from '../gameData';
import * as Graphics from '../graphics';
import { soundManager } from '../soundManager';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onFishCaught: (fish: FishType, isGolden: boolean) => void;
  onFishLost: (reason?: string) => void;
  currentRod: RodType;
  currentBait: BaitType;
  baitCounts: Record<string, number>;
  ownedRods: string[];
  weather: 'sunny' | 'rainy' | 'stormy';
  skills: PlayerSkills;
  location: LocationType;
  timeOfDay: TimeOfDay;
  onBossDefeated?: () => void;
  onSessionReset?: () => void;
  onLineBroken: () => void;
  setNotification: (msg: string | null) => void;
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
  gameState, setGameState, onFishCaught, onFishLost, currentRod, currentBait, baitCounts, ownedRods, weather, skills, location, timeOfDay, onBossDefeated, onSessionReset, onLineBroken, setNotification
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
  const bossX = useRef(CANVAS_WIDTH / 2);
  const bossY = useRef(CANVAS_HEIGHT / 2);

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

    const weightedTypes = pool.map(f => {
      let weight = f.weight;
      const weatherBonus = WEATHER_BONUSES[weather].rarity;
      if (f.rarity === Rarity.RARE) weight *= (rarityBoost * 0.5 + 0.5) * weatherBonus;
      if (f.rarity === Rarity.EPIC) weight *= rarityBoost * weatherBonus;
      if (f.rarity === Rarity.LEGENDARY) weight *= (rarityBoost * 1.5) * weatherBonus;
      if (f.rarity === Rarity.MYTHIC) weight *= (rarityBoost * 2) * weatherBonus;
      return { type: f, weight };
    });
    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of weightedTypes) {
      if (random < item.weight) return item.type;
      random -= item.weight;
    }
    return pool[0];
  }, [weather, location, timeOfDay]);

  const spawnSingleFish = useCallback(() => {
    const type = getRandomFishType(currentBait.rarityBoost + skills.lucky * 1.5);
    const y = 300 + Math.random() * 250;
    const initialDir = Math.random() > 0.5 ? 1 : -1;
    const baseSpeed = (0.4 + Math.random() * 0.6) * WEATHER_BONUSES[weather].speed;
    const personalities: FishPersonality[] = ['curious', 'shy', 'brave'];
    const swimStyles: FishSwimStyle[] = ['glider', 'jerky', 'charger'];
    
    const isGolden = Math.random() < 0.05;

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: initialDir === 1 ? -150 : CANVAS_WIDTH + 150,
      y: y, targetY: y, speed: baseSpeed, baseSpeed, direction: initialDir, type,
      angle: initialDir === 1 ? 0 : Math.PI, targetAngle: initialDir === 1 ? 0 : Math.PI,
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      swimStyle: swimStyles[Math.floor(Math.random() * swimStyles.length)],
      state: 'wandering' as FishAIState, stateTimer: Math.floor(Math.random() * 100),
      velocity: { x: initialDir * baseSpeed, y: 0 },
      isGolden
    };
  }, [currentBait, getRandomFishType, skills.lucky]);

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
  }, [spawnInitialFish]);

  const canStartFishing = useCallback(() => {
    const currentBaitCount = baitCounts[currentBait.id] || 0;
    const hasAvailableRod = ownedRods.includes(currentRod.id);

    if (!hasAvailableRod) {
      setNotification('Không có cần câu. Hãy mua lại cần mới.');
      return false;
    }
    if (currentBaitCount <= 0) {
      setNotification('Không có thẻo để câu. Hãy mua thêm thẻo.');
      return false;
    }
    return true;
  }, [baitCounts, currentBait.id, currentRod.id, ownedRods, setNotification]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!isSpacePressed.current) {
        isSpacePressed.current = true;
        if (gameState === GameState.IDLE) {
          if (!canStartFishing()) {
            return;
          }
          setGameState(GameState.CHARGING);
          chargePower.current = 0;
          chargeDirection.current = 1;
        }
        if (gameState === GameState.REELING) {
          tensionVelocity.current -= 0.0035;
          tugFactor.current = 1.0;
        }
      }
    }
  }, [gameState, setGameState, canStartFishing]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = false;
      if (gameState === GameState.CHARGING) {
        targetHookX.current = 220 + (chargePower.current / 100) * 500;
        targetHookY.current = 250 + (chargePower.current / 100) * 300;
        castProgress.current = 0;
        setGameState(GameState.CASTING);
      }
    }
  }, [gameState, setGameState]);

  const handlePressStart = useCallback(() => {
    if (!isSpacePressed.current) {
      isSpacePressed.current = true;
      if (gameState === GameState.IDLE) {
        if (!canStartFishing()) {
          return;
        }
        setGameState(GameState.CHARGING);
        chargePower.current = 0;
        chargeDirection.current = 1;
      }
      if (gameState === GameState.REELING) {
        tensionVelocity.current -= 0.0035;
        tugFactor.current = 1.0;
      }
    }
  }, [gameState, setGameState, canStartFishing]);

  const handlePressEnd = useCallback(() => {
    isSpacePressed.current = false;
    if (gameState === GameState.CHARGING) {
      targetHookX.current = 220 + (chargePower.current / 100) * 500;
      targetHookY.current = 250 + (chargePower.current / 100) * 300;
      castProgress.current = 0;
      setGameState(GameState.CASTING);
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    Graphics.drawWaterAndSky(ctx, frameCount.current, weather, location, timeOfDay);

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

    const canAttractFish = gameState === GameState.WAITING;
    const hookInWater = gameState === GameState.WAITING || gameState === GameState.REELING;
    let highestInterestedRarity: Rarity | null = null;

    fishRef.current.forEach(f => {
      if (activeFish.current?.id === f.id) return; 
      const dx = hookX.current - f.x; const dy = hookY.current - f.y;
      const distSq = dx * dx + dy * dy;
      const lineLimit = currentBait.maxValue || 300;
      const sizeMatchRatio = Math.min(1, f.type.value / lineLimit);
      const attractRange = currentBait.attraction * WEATHER_BONUSES[weather].attraction * (0.35 + sizeMatchRatio * 0.65);
      const interestChance = 0.15 + sizeMatchRatio * 0.75;
      f.stateTimer--;
      if (canAttractFish && distSq < attractRange * attractRange && Math.random() < interestChance) {
        if (f.personality === 'shy' && distSq < 100 * 100) {
          f.state = 'scared'; f.targetAngle = Math.atan2(-dy, -dx); f.stateTimer = 120;
        } else if (f.state !== 'scared') {
          f.state = 'interested'; f.targetAngle = Math.atan2(dy, dx);
          if ([Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC].includes(f.type.rarity)) {
            if (!highestInterestedRarity || f.type.rarity === Rarity.MYTHIC || (f.type.rarity === Rarity.LEGENDARY && highestInterestedRarity === Rarity.EPIC)) {
              highestInterestedRarity = f.type.rarity;
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
      else if (f.state === 'interested') moveSpeed *= 1.3;
      else if (f.state === 'inspecting') moveSpeed *= 0.2;
      if (f.swimStyle === 'jerky') { const pulse = Math.sin(frameCount.current * 0.15); moveSpeed *= (pulse > 0 ? 2.0 : 0.1); }
      else if (f.swimStyle === 'charger') { moveSpeed *= 1.6; }
      f.angle = lerpAngle(f.angle, f.targetAngle, f.state === 'scared' ? 0.25 : 0.06);
      const vx = Math.cos(f.angle) * moveSpeed; const vy = Math.sin(f.angle) * moveSpeed;
      f.velocity = { x: vx, y: vy }; f.x += vx; f.y += vy + (f.targetY - f.y) * 0.015;
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
        createSplash(hookX.current, hookY.current, 1.2);
        setGameState(GameState.WAITING);
      }
    }

    if (gameState === GameState.WAITING) {
      hookY.current += Math.sin(frameCount.current * 0.1) * 0.3;
      const collidingFish = fishRef.current.find(f => {
        const d2 = (f.x - hookX.current)**2 + (f.y - hookY.current)**2;
        return d2 < (f.type.size + 18)**2;
      });
      if (collidingFish) {
        const lineLimit = currentBait.maxValue || 300;
        if (collidingFish.type.value > lineLimit) {
          onLineBroken();
          onFishLost("Thẻo bị đứt vì cá quá to!");
          setGameState(GameState.IDLE);
          activeFish.current = null;
          return;
        }
        activeFish.current = collidingFish; createSplash(hookX.current, hookY.current, 0.8);
        setGameState(GameState.REELING); reelingProgress.current = 0; lineHealth.current = 100; tensionCursor.current = 0.5; tensionVelocity.current = 0;
        const sizeMatch = Math.min(1, collidingFish.type.value / lineLimit);
        const mismatchPenalty = 1 - sizeMatch;
        tensionZoneSize.current = Math.max(0.12, 0.42 - (collidingFish.type.tension / 220) + (skills.sharpEye * 0.05) - mismatchPenalty * 0.18);

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
      }
    }

    if (gameState === GameState.REELING && activeFish.current) {
      const lineLimit = currentBait.maxValue || 300;
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
      const tugX = Math.cos(activeFish.current.angle) * (tugFactor.current * 10);
      const tugY = Math.sin(activeFish.current.angle) * (tugFactor.current * 10);
      Graphics.drawFishTexture(ctx, activeFish.current.type, frameCount.current, true, { x: hookX.current - tugX, y: hookY.current - tugY, angle: activeFish.current.angle, direction: 1 }, 2.5, activeFish.current.swimStyle, false, activeFish.current.isGolden);

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
      if (isSpacePressed.current) tensionVelocity.current -= lift;
      else tensionVelocity.current += gravity;
      tensionVelocity.current *= 0.95;
      tensionCursor.current += tensionVelocity.current;
      tensionCursor.current = Math.max(0, Math.min(1, tensionCursor.current));
      
      const zoneSpeed = 0.005 + (ft / 100000); 
      tensionZone.current += Math.sin(frameCount.current * zoneSpeed) * (0.002 + ft / 60000) + (Math.random()-0.5)*(ft/3500);
      const hz = tensionZoneSize.current / 2; tensionZone.current = Math.max(hz, Math.min(1 - hz, tensionZone.current));
      const isInZone = Math.abs(tensionCursor.current - tensionZone.current) < hz;
      
      const progressFactor = 0.8 + sizeMatch * 0.2;
      if (isInZone) {
        reelingProgress.current += Math.max(0.12, 0.35 - (ft / 450)) * (1 + skills.fastHands * 0.25) * progressFactor;
        lineHealth.current = Math.min(100, lineHealth.current + 0.35 * progressFactor); 
        hookX.current = Math.max(rodEndX + 20, hookX.current - 0.5);
      } else {
        const damage = (0.35 + (ft / 250) + mismatchPenalty * 0.25) / currentRod.lineStrength; lineHealth.current -= damage;
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
        onLineBroken(); onFishLost("Thẻo bị đứt!"); activeFish.current = null; 
      }
      
      if (frameCount.current % 8 === 0) {
        soundManager.playReel(Math.abs(tensionCursor.current - tensionZone.current) * 2);
      }

      Graphics.drawReelingInterface(ctx, reelingProgress.current, lineHealth.current, tensionCursor.current, tensionZone.current, tensionZoneSize.current, isInZone);
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
      // Boss fight logic
      bossAttackTimer.current++;
      if (bossAttackTimer.current > 120) { // Attack every 2 seconds
        playerHP.current = Math.max(0, playerHP.current - 10); // Boss attacks player
        bossAttackTimer.current = 0;
        if (playerHP.current <= 0) {
          // Player defeated
          setTimeout(() => {
            setNotification("Thua Boss! Thử lại sau.");
            setGameState(GameState.IDLE);
            if (onSessionReset) onSessionReset();
          }, 1000);
        }
      }

      // Player attack charge
      if (isSpacePressed.current) {
        playerAttackCharge.current += 2;
        if (playerAttackCharge.current >= 100) {
          bossHP.current = Math.max(0, bossHP.current - 20); // Player attacks boss
          playerAttackCharge.current = 0;
          createSparkles(bossX.current, bossY.current, 20, ['#ff0000', '#ffff00']);
          if (bossHP.current <= 0) {
            // Boss defeated
            setTimeout(() => {
              setNotification("Thắng Boss! Nhận 5000 vàng!");
              if (onBossDefeated) onBossDefeated();
              setGameState(GameState.IDLE);
              if (onSessionReset) onSessionReset();
            }, 1000);
          }
        }
      } else {
        playerAttackCharge.current = Math.max(0, playerAttackCharge.current - 1);
      }

      // Render boss
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(bossX.current - 50, bossY.current - 50, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('BOSS', bossX.current - 20, bossY.current - 20);

      // Boss HP bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(50, 50, 200, 20);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(50, 50, (bossHP.current / bossMaxHP.current) * 200, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Boss HP: ${bossHP.current}/${bossMaxHP.current}`, 60, 65);

      // Player HP bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(50, 80, 200, 20);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(50, 80, (playerHP.current / playerMaxHP.current) * 200, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Your HP: ${playerHP.current}/${playerMaxHP.current}`, 60, 95);

      // Attack bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(50, 110, 200, 20);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(50, 110, (playerAttackCharge.current / 100) * 200, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Attack Charge', 60, 125);
    }

    Graphics.drawPlayerEquipment(
      ctx, gameState, pX, pY, rodEndX, rodEndY, hookX.current, hookY.current, 
      gameState === GameState.CASTING, lineHealth.current,
      activeFish.current ? activeFish.current.type.value / 500 : 0, currentRod, chargePower.current
    );
    ctx.restore();
  }, [gameState, onFishCaught, onFishLost, setGameState, currentRod, currentBait, spawnSingleFish, lerpAngle, createSplash, createSparkles, skills, weather, location, timeOfDay]);

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
      onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
    />
  );
};

export default GameCanvas;
