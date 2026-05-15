
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSettings } from './useGameSettings';
import { RODS } from '../core/data/gameData';

// Mock soundManager
vi.mock('../core/systems/soundManager', () => ({
  soundManager: {
    playClick: vi.fn(),
    playPurchase: vi.fn(),
    playError: vi.fn(),
  },
}));

describe('useGameSettings Integration', () => {
  it('should not charge for repair if durability is full', () => {
    let gold = 1000;
    const setGold = vi.fn((val) => {
        if (typeof val === 'function') gold = val(gold);
        else gold = val;
    });
    const addNotification = vi.fn();

    const { result } = renderHook(() => useGameSettings(gold, setGold, addNotification));

    // Initially rod is at 100% durability
    act(() => {
      result.current.handleRepair('rod');
    });

    expect(addNotification).toHaveBeenCalledWith(expect.stringContaining('vẫn còn rất tốt'), 'info');
    expect(setGold).not.toHaveBeenCalled();
  });

  it('should decrease gold and restore durability on repair', () => {
    let gold = 1000;
    const setGold = vi.fn((val) => {
        if (typeof val === 'function') gold = val(gold);
        else gold = val;
    });
    const addNotification = vi.fn();

    const { result } = renderHook(() => useGameSettings(gold, setGold, addNotification));

    // Simulate durability loss
    act(() => {
      result.current.handleDurabilityChange('rod', 50);
    });
    
    expect(result.current.currentRod.durability).toBe(50);

    // Repair
    act(() => {
      result.current.handleRepair('rod');
    });

    expect(result.current.currentRod.durability).toBe(100);
    expect(setGold).toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith(expect.stringContaining('Đã sửa'), 'success');
  });

  it('should not allow buying the same rod twice', () => {
    let gold = 1000000;
    const setGold = vi.fn();
    const addNotification = vi.fn();

    const { result } = renderHook(() => useGameSettings(gold, setGold, addNotification));

    const rod2 = RODS[1]; // Rod 2

    // First buy
    act(() => {
      result.current.buyItem(rod2, 'rod');
    });

    expect(result.current.ownedRods).toContain(rod2.id);
    const callCount = setGold.mock.calls.length;

    // Second buy attempt
    act(() => {
      result.current.buyItem(rod2, 'rod');
    });

    expect(setGold.mock.calls.length).toBe(callCount); // Should not have been called again
    expect(addNotification).toHaveBeenCalledWith(expect.stringContaining('đã sở hữu'), 'warning');
  });
});
