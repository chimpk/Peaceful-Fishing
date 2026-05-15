
import { describe, it, expect } from 'vitest';
import { lerpAngle } from './math';

describe('lerpAngle', () => {
  it('should lerp normally between simple angles', () => {
    // Start 0, Target 1, Speed 0.1 -> should be 0.1
    expect(lerpAngle(0, 1, 0.1)).toBeCloseTo(0.1);
  });

  it('should handle wrapping across PI (clockwise)', () => {
    // Start 3.0, Target -3.0. 
    // Target - Current = -6.0. 
    // Wrapped diff should be +0.28 (roughly) because -6.0 + 2*PI = 0.28
    const result = lerpAngle(3.0, -3.0, 0.5);
    expect(result).toBeGreaterThan(3.0); 
    expect(result).toBeLessThan(Math.PI + 0.1);
  });

  it('should handle wrapping across PI (counter-clockwise)', () => {
    // Start -3.0, Target 3.0
    const result = lerpAngle(-3.0, 3.0, 0.5);
    expect(result).toBeLessThan(-3.0);
    expect(result).toBeGreaterThan(-Math.PI - 0.1);
  });

  it('should return target if very close', () => {
    expect(lerpAngle(0, 0.005, 0.5)).toBe(0.005);
  });
});
