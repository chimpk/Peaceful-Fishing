
import React from 'react';
import { GameState, FishType, RodType, TackleType, BaitType, PlayerSkills, LocationType, TimeOfDay, WeatherType, NotificationType } from '../../types';
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

const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const { 
    canvasRef, 
    handlePressStart, 
    handlePressEnd,
    triggerSkill
  } = useGameEngine(props);

  return (
    <div className="relative w-full h-full">
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
      
      {/* Active Skills UI Overlay */}
      {props.gameState === GameState.REELING && (
        <div className="absolute bottom-[110px] right-[20px] flex gap-3 pointer-events-none">
          {props.skills.focus > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); triggerSkill('focus'); }}
              className="w-[76px] h-[40px] rounded-lg bg-blue-600/20 border border-blue-400/30 pointer-events-auto active:scale-95 transition-transform overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20"></div>
              <span className="relative text-[9px] font-black text-white block mt-1">F-FOCUS</span>
            </button>
          )}
          {props.skills.powerReel > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); triggerSkill('powerReel'); }}
              className="w-[76px] h-[40px] rounded-lg bg-orange-600/20 border border-orange-400/30 pointer-events-auto active:scale-95 transition-transform overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-orange-500/10 group-hover:bg-orange-500/20"></div>
              <span className="relative text-[9px] font-black text-white block mt-1">G-POWER</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
