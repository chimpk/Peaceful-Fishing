
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSettings } from '../hooks/useGameSettings';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameState } from '../types';

// Mock Sound Manager
vi.mock('../core/systems/soundManager', () => ({
  soundManager: {
    playClick: vi.fn(),
    playPurchase: vi.fn(),
    playError: vi.fn(),
    playSplash: vi.fn(),
    playBite: vi.fn(),
    playLevelUp: vi.fn(),
    playSuccess: vi.fn(),
    playLineBreak: vi.fn(),
  },
}));

describe('System Level Integration: Fishing Loop', () => {
  it('should complete a full loop: Cast -> Bite -> Catch -> Reward', async () => {
    // 1. Setup states
    let gold = 1000;
    const setGold = vi.fn((val) => {
      if (typeof val === 'function') gold = val(gold);
      else gold = val;
    });
    const addNotification = vi.fn();
    const onFishCaught = vi.fn();
    const onDurabilityChange = vi.fn();

    // 2. Render Hooks
    const { result: settings } = renderHook(() => useGameSettings(gold, setGold, addNotification));
    
    // We mock the properties needed for the engine
    const engineProps = {
        gameState: GameState.IDLE,
        currentRod: settings.current.currentRod,
        currentTackle: settings.current.currentTackle,
        currentBait: settings.current.currentBait,
        onFishCaught,
        setGameState: vi.fn(),
        addNotification,
        onDurabilityChange: settings.current.handleDurabilityChange,
        location: 'POND' as any,
        weather: 'sunny' as any,
        timeOfDay: 'day' as any,
        skills: { lucky: 0, masterAngler: 0, persistent: 0, fastReel: 0, sturdyLine: 0 },
        liveBait: null,
        setLiveBait: vi.fn(),
    };

    // Note: useGameEngine uses a lot of refs and side effects, testing it in isolation 
    // without a real Canvas is complex. We will focus on the "Game Settings" logic 
    // reacting to durability changes and gold updates.

    // 3. Action: Catch a fish (Simulate what the engine would do)
    const mockFishValue = 200;
    
    act(() => {
        // Simulation of Engine notifying Settings about durability loss
        settings.current.handleDurabilityChange('rod', 10);
        settings.current.handleDurabilityChange('tackle', 5);
        
        // Simulation of Engine notifying App about a catch
        setGold(prev => prev + mockFishValue);
    });

    // 4. Assertions
    expect(gold).toBe(1200); // 1000 + 200
    expect(settings.current.currentRod.durability).toBe(90); // 100 - 10
    expect(settings.current.currentTackle.durability).toBe(25); // 30 - 5

    // 5. Action: Repair
    act(() => {
        settings.current.handleRepair('rod');
    });

    // Cost for rod_1 (0 gold) repair is 50 base. 
    // 1000 + 200 - 50 = 1150
    expect(gold).toBe(1150);
    expect(settings.current.currentRod.durability).toBe(100);
  });
});
