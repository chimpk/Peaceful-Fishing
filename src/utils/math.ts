
/**
 * Linearly interpolates between two angles, handling the wrap-around at PI.
 */
export const lerpAngle = (current: number, target: number, speed: number): number => {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) < 0.01) return target;
  return current + diff * speed;
};
