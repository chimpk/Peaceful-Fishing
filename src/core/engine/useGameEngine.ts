
import { useRef, useCallback, useEffect } from 'react';
import { GameState, FishType, RodType, TackleType, BaitType, PlayerSkills, LocationType, TimeOfDay, NotificationType } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FISH_TYPES, WEATHER_BONUSES, LOCATION_DATA, CHEST_TYPES } from '../data/gameData';
import { soundManager } from '../systems/soundManager';
import * as Graphics from '../graphics/index';

export const useGameEngine = (props: any) => {
  const { gameState, setGameState, onFishCaught, onFishLost, currentRod, currentTackle, currentBait, baitCounts, ownedRods, ownedTackles, weather, skills, location, timeOfDay, streak, onBossDefeated, onSessionReset, onLineBroken, onRodBroken, onCast, addNotification, liveBait, setLiveBait, isBossSpawned, setIsBossSpawned, onDurabilityChange } = props;

  const fishRef = useRef<any[]>([]);
  const bubblesRef = useRef<any[]>([]);
  const vfxParticlesRef = useRef<any[]>([]);
  
  const hookX = useRef(220);
  const hookY = useRef(120);
  const targetHookX = useRef(0);
  const targetHookY = useRef(0);
  const castProgress = useRef(0);
  const chargePower = useRef(0);
  const chargeDirection = useRef(1);
  const activeFish = useRef<any | null>(null);
  const frameCount = useRef(0);
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

  // Boss fight refs
  const bossHP = useRef(100);
  const bossMaxHP = useRef(100);
  const bossAttackTimer = useRef(0);
  const bossStrikeTimer = useRef(0);
  const playerHP = useRef(100);
  const playerAttackCharge = useRef(0);
  const isBossCharging = useRef(false);
  const bossX = useRef(CANVAS_WIDTH / 2);
  const bossY = useRef(CANVAS_HEIGHT / 2);

  // Nibbling system
  const nibbleTimer = useRef(0);
  const nibbleCount = useRef(0);
  const targetNibbles = useRef(3);
  const biteWindowTimer = useRef(0);
  const isBitingHard = useRef(false);
  const baitSettleTimer = useRef(0);

  const createSplash = useCallback((x: number, y: number, intensity: number = 1) => {
    vfxParticlesRef.current.push({ x, y, size: 5, speed: 0, opacity: 1, life: 60, type: 'ripple', color: 'rgba(255,255,255,0.6)' });
    for(let i=0; i < 15 * intensity; i++) {
        vfxParticlesRef.current.push({ x, y, size: 1.5 + Math.random() * 3 * intensity, speed: 1, vx: (Math.random() - 0.5) * 8 * intensity, vy: -Math.random() * 12 * intensity, opacity: 1, life: 30 + Math.random() * 20, color: 'rgba(255, 255, 255, 0.8)', type: 'circle' });
    }
    soundManager.playSplash();
  }, []);

  const spawnSingleFish = useCallback(() => {
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const initialDir = Math.random() > 0.5 ? 1 : -1;
    const baseSpeed = 0.5;
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: initialDir === 1 ? -150 : CANVAS_WIDTH + 150,
      y: 300 + Math.random() * 250,
      speed: baseSpeed, direction: initialDir, type,
      angle: initialDir === 1 ? 0 : Math.PI, targetAngle: initialDir === 1 ? 0 : Math.PI,
      state: 'wandering', velocity: { x: initialDir * baseSpeed, y: 0 }
    };
  }, []);

  const update = useCallback((ctx: CanvasRenderingContext2D) => {
    frameCount.current++;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Simple update logic for now
    Graphics.drawWaterAndSky(ctx, frameCount.current, weather, location, timeOfDay, timeOfDay, 1);
    
    // Fish update
    fishRef.current.forEach(f => {
      f.x += f.velocity.x;
      if (f.x > CANVAS_WIDTH + 200) f.x = -150;
      if (f.x < -200) f.x = CANVAS_WIDTH + 150;
      Graphics.drawFishTexture(ctx, f.type, frameCount.current, false, { x: f.x, y: f.y, angle: f.angle, direction: f.direction });
    });

    // Player/Rod/Line update
    Graphics.drawPlayerEquipment(ctx, gameState, 80, 180, 200, 120, hookX.current, hookY.current, gameState === GameState.CASTING, lineHealth.current, 0, currentRod, chargePower.current, currentBait, frameCount.current, 0, location);
    
    if (gameState === GameState.REELING) {
      Graphics.drawReelingInterface(ctx, reelingProgress.current, lineHealth.current, tensionCursor.current, tensionZone.current, tensionZoneSize.current, true);
    }
  }, [gameState, weather, location, timeOfDay, currentRod, currentBait]);

  return {
    update,
    fishRef,
    hookX, hookY,
    chargePower,
    isSpacePressed
  };
};
