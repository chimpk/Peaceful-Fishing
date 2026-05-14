
import React from 'react';
import { GameState, FishType, RodType, TackleType, BaitType, PlayerSkills, LocationType, TimeOfDay, NotificationType } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/data/gameData';
import { useGameEngine } from '../../hooks/useGameEngine';

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
  inventoryCount: number;
  inventoryCapacity: number;
}

const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const { 
    canvasRef, 
    handlePressStart, 
    handlePressEnd 
  } = useGameEngine(props);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className={`block cursor-crosshair shadow-inner shadow-black/50 w-full h-full ${
        props.gameState === GameState.START ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      onTouchStart={(e) => { 
        if (props.gameState !== GameState.START) { 
          e.preventDefault(); 
          handlePressStart(); 
        } 
      }}
      onTouchEnd={(e) => { 
        if (props.gameState !== GameState.START) { 
          e.preventDefault(); 
          handlePressEnd(); 
        } 
      }}
      onMouseDown={() => { if (props.gameState !== GameState.START) handlePressStart(); }}
      onMouseUp={() => { if (props.gameState !== GameState.START) handlePressEnd(); }}
    />
  );
};

export default GameCanvas;
