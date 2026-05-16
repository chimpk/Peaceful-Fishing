
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { 
  Container, 
  Sprite, 
  Graphics, 
  Texture, 
  DisplacementFilter
} from 'pixi.js';
import { GameState, FishType, RodType, TackleType, BaitType, PlayerSkills, LocationType, TimeOfDay, WeatherType, NotificationType } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/data/gameData';
import { useGameEngine } from '../../hooks/useGameEngine';

// Register PixiJS components
extend({ Container, Sprite, Graphics });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pixiContainer: any;
      pixiSprite: any;
      pixiGraphics: any;
    }
  }
}

interface PixiGameCanvasProps {
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

const PixiInternal: React.FC<{ 
  offscreenCanvas: HTMLCanvasElement, 
  updateEngine: (ctx: CanvasRenderingContext2D, timestamp: number) => void 
}> = ({ offscreenCanvas, updateEngine }) => {
  // Use a stable texture reference
  const texture = useMemo(() => Texture.from(offscreenCanvas), [offscreenCanvas]);
  const displacementSpriteRef = useRef<any>(null);
  const [filter, setFilter] = useState<DisplacementFilter | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Filter
  useEffect(() => {
    try {
        if (displacementSpriteRef.current && !filter) {
            const dFilter = new DisplacementFilter({
                sprite: displacementSpriteRef.current,
                scale: { x: 10, y: 10 }
            });
            setFilter(dFilter);
        }
    } catch (e: any) {
        setError(e.message);
    }
  }, [displacementSpriteRef.current]);

  useTick((ticker) => {
    try {
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
            updateEngine(ctx, ticker.lastTime);
            // v8 way to sync canvas texture
            texture.source.update();
        }

        if (displacementSpriteRef.current) {
            displacementSpriteRef.current.x += 0.5 * ticker.deltaTime;
            displacementSpriteRef.current.y += 0.3 * ticker.deltaTime;
        }
    } catch (e: any) {
        if (!error) setError(e.message);
    }
  });

  return (
    <pixiContainer>
      {/* Fallback Graphics to confirm rendering is active */}
      <pixiGraphics 
        draw={(g: any) => {
            g.clear();
            g.fill(0x1e293b);
            g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }}
      />

      <pixiSprite
        ref={displacementSpriteRef}
        texture={Texture.from('https://pixijs.com/assets/pixi-filters/displacement_map_repeat.jpg')}
        visible={false}
      />
      
      <pixiSprite
        texture={texture}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        filters={filter ? [filter] : []}
      />

      {error && (
        <pixiGraphics draw={(g: any) => {
            g.clear(); g.fill(0xff0000); g.rect(0, 0, CANVAS_WIDTH, 30);
        }} />
      )}
    </pixiContainer>
  );
};

const PixiGameCanvas: React.FC<PixiGameCanvasProps> = (props) => {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  if (!offscreenCanvasRef.current) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    offscreenCanvasRef.current = canvas;
  }

  const { 
    handlePressStart, 
    handlePressEnd,
    update,
    triggerSkill
  } = useGameEngine({ 
    ...props, 
    canvasRef: offscreenCanvasRef as any,
    disableInternalLoop: true
  });

  const isReeling = props.gameState === GameState.REELING;
  const hasFocus = props.skills.focus > 0;
  const hasPowerReel = props.skills.powerReel > 0;
  const showSkillBar = isReeling && (hasFocus || hasPowerReel);

  return (
    <div 
      className="relative w-full h-full bg-slate-900"
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
    >
      <Application
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        background="#0f172a"
        antialias={true}
        resolution={window.devicePixelRatio || 1}
        autoDensity={true}
      >
        <PixiInternal 
          offscreenCanvas={offscreenCanvasRef.current!} 
          updateEngine={update} 
        />
      </Application>
      
      {showSkillBar && (
        <div className="absolute flex gap-4 pointer-events-none" style={{ bottom: '24px', right: '24px', zIndex: 50 }}>
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

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] z-40" />
    </div>
  );
};

interface SkillButtonProps {
  label: string;
  hotkey: string;
  icon: string;
  color: 'blue' | 'orange';
  onActivate: () => void;
}

const SkillButton: React.FC<SkillButtonProps> = ({ label, hotkey, icon, color, onActivate }) => {
  const rippleRef = useRef<HTMLSpanElement>(null);
  const handleTap = (e: any) => {
    e.stopPropagation();
    if (rippleRef.current) {
      rippleRef.current.classList.remove('animate-ping');
      void rippleRef.current.offsetWidth;
      rippleRef.current.classList.add('animate-ping');
    }
    onActivate();
  };

  const colorMap = {
    blue: { bg: 'rgba(30,64,175,0.85)', border: 'rgba(96,165,250,0.6)', glow: '0 0 20px rgba(59,130,246,0.5)', text: '#93c5fd', ripple: 'rgba(96,165,250,0.4)' },
    orange: { bg: 'rgba(154,52,18,0.85)', border: 'rgba(251,146,60,0.6)', glow: '0 0 20px rgba(249,115,22,0.5)', text: '#fed7aa', ripple: 'rgba(251,146,60,0.4)' },
  }[color];

  return (
    <button
      className="pointer-events-auto relative overflow-hidden active:scale-95 transition-all select-none hover:brightness-110"
      style={{ width: '84px', height: '84px', borderRadius: '20px', background: colorMap.bg, border: `2px solid ${colorMap.border}`, boxShadow: colorMap.glow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer' }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={handleTap}
    >
      <span ref={rippleRef} className="absolute inset-0 rounded-2xl opacity-0" style={{ background: colorMap.ripple }} />
      <span style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '9px', fontWeight: 700, color: colorMap.text, background: 'rgba(0,0,0,0.4)', borderRadius: '4px', padding: '1px 6px' }}>[{hotkey}]</span>
    </button>
  );
};

export default PixiGameCanvas;
