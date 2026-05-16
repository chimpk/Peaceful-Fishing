
import React, { useRef, useEffect } from 'react';
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

// Skill button states: ready | active | cooldown
type SkillState = 'ready' | 'active' | 'cooldown' | 'locked';

const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const { 
    canvasRef, 
    handlePressStart, 
    handlePressEnd,
    triggerSkill
  } = useGameEngine(props);

  const isReeling = props.gameState === GameState.REELING;
  const hasFocus = props.skills.focus > 0;
  const hasPowerReel = props.skills.powerReel > 0;
  const showSkillBar = isReeling && (hasFocus || hasPowerReel);

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

      {/* ─── Mobile Skill Buttons ─── */}
      {showSkillBar && (
        <div
          className="absolute flex gap-3 pointer-events-none"
          style={{
            bottom: 'clamp(8px, 3vw, 20px)',
            right: 'clamp(8px, 3vw, 20px)',
          }}
        >
          {hasFocus && (
            <SkillButton
              label="TẬP TRUNG"
              hotkey="F"
              icon="🧘"
              color="blue"
              onActivate={() => triggerSkill('focus')}
            />
          )}
          {hasPowerReel && (
            <SkillButton
              label="KÉO MẠNH"
              hotkey="G"
              icon="🦾"
              color="orange"
              onActivate={() => triggerSkill('powerReel')}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Reusable skill button with ripple feedback ───────────────────────────────
interface SkillButtonProps {
  label: string;
  hotkey: string;
  icon: string;
  color: 'blue' | 'orange';
  onActivate: () => void;
}

const SkillButton: React.FC<SkillButtonProps> = ({ label, hotkey, icon, color, onActivate }) => {
  const rippleRef = useRef<HTMLSpanElement>(null);

  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    // Ripple effect
    if (rippleRef.current) {
      rippleRef.current.classList.remove('animate-ping');
      void rippleRef.current.offsetWidth; // reflow
      rippleRef.current.classList.add('animate-ping');
    }
    onActivate();
  };

  const colorMap = {
    blue: {
      bg: 'rgba(30,64,175,0.85)',
      border: 'rgba(96,165,250,0.6)',
      glow: '0 0 16px rgba(59,130,246,0.5)',
      text: '#93c5fd',
      ripple: 'rgba(96,165,250,0.4)',
    },
    orange: {
      bg: 'rgba(154,52,18,0.85)',
      border: 'rgba(251,146,60,0.6)',
      glow: '0 0 16px rgba(249,115,22,0.5)',
      text: '#fed7aa',
      ripple: 'rgba(251,146,60,0.4)',
    },
  }[color];

  return (
    <button
      className="pointer-events-auto relative overflow-hidden active:scale-90 transition-transform select-none"
      style={{
        width: 'clamp(68px, 12vw, 88px)',
        height: 'clamp(68px, 12vw, 88px)',
        borderRadius: '16px',
        background: colorMap.bg,
        border: `2px solid ${colorMap.border}`,
        boxShadow: colorMap.glow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
      onTouchStart={(e) => { e.stopPropagation(); }}
      onTouchEnd={handleTap}
      onMouseDown={(e) => { e.stopPropagation(); }}
      onMouseUp={handleTap}
    >
      {/* Ripple overlay */}
      <span
        ref={rippleRef}
        className="absolute inset-0 rounded-2xl opacity-0"
        style={{ background: colorMap.ripple }}
      />

      {/* Icon */}
      <span style={{ fontSize: 'clamp(20px, 4vw, 28px)', lineHeight: 1 }}>{icon}</span>

      {/* Skill name */}
      <span style={{
        fontSize: 'clamp(7px, 1.2vw, 10px)',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        textAlign: 'center',
        padding: '0 4px',
      }}>
        {label}
      </span>

      {/* Hotkey badge */}
      <span style={{
        fontSize: 'clamp(7px, 1vw, 9px)',
        fontWeight: 700,
        color: colorMap.text,
        background: 'rgba(0,0,0,0.35)',
        borderRadius: '4px',
        padding: '1px 5px',
        letterSpacing: '0.1em',
      }}>
        [{hotkey}]
      </span>
    </button>
  );
};

export default GameCanvas;
