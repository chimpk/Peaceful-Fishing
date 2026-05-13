
import { FishType, Rarity } from '../types';
import * as Classic from './ClassicModels';
import * as Sharks from './SharkModels';
import * as Unique from './UniqueModels';
import * as Junk from './JunkModels';
import { ChestModels } from './ChestModels';

export const drawFishByModel = (
  ctx: CanvasRenderingContext2D,
  fish: FishType,
  frameCount: number,
  isStruggling: boolean,
  currentSpeed: number,
  isCaught: boolean,
  isGolden: boolean
) => {
  const { size, color, name, rarity } = fish;
  const finalColor = isGolden ? '#fbbf24' : color;

  // Animation parameters
  let wagFreq = 0.15;
  let wagAmp = 0.1;

  if (isStruggling) {
    wagFreq = 0.8;
    wagAmp = 0.5;
  } else {
    wagFreq = 0.05 + (currentSpeed * 0.12);
    wagAmp = 0.04 + (currentSpeed * 0.06);
  }

  // DISPATCHER
  const n = name.toLowerCase();

  // 0. CHESTS (Mystery Treasure)
  if (fish.isChest) {
    if (!isCaught) {
      // Look like a fish shadow while in water
      return Classic.drawClassicFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
    }
    // Reveal as a chest when caught
    return ChestModels.drawChest(ctx, rarity, frameCount, 0, 0);
  }

  // 1. JUNK (Mystery Catch)
  if (rarity === Rarity.JUNK) {
    // While in water or reeling, it looks like a generic fish
    if (!isCaught) {
      return Classic.drawClassicFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
    }
    
    // Once caught, reveal the true junk form
    if (n.includes('giày')) return Junk.drawOldShoe(ctx, fish, size, finalColor);
    if (n.includes('lon')) return Junk.drawTinCan(ctx, fish, size, finalColor);
    if (n.includes('túi')) return Junk.drawPlasticBag(ctx, fish, frameCount, size, finalColor);
    if (n.includes('chai')) return Junk.drawBottle(ctx, fish, size, finalColor);
    return Junk.drawTinCan(ctx, fish, size, finalColor); // Fallback
  }

  // 2. SHARKS & AGGRESSIVE
  if (n.includes('mập') || n.includes('nhám')) {
    if (n.includes('búa')) return Sharks.drawHammerhead(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
    return Sharks.drawShark(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  }
  if (n.includes('kiếm') || n.includes('buồm')) return Sharks.drawSwordfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);

  // 3. UNIQUE & EXOTIC
  if (n.includes('đuối')) return Unique.drawRay(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('mặt trăng')) return Unique.drawSunfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('ngựa')) return Unique.drawSeahorse(ctx, fish, frameCount, size, finalColor);
  if (n.includes('rồng') || n.includes('long ngư') || n.includes('leviathan') || n.includes('tượng long')) return Unique.drawDragon(ctx, fish, frameCount, size, finalColor);
  if (n.includes('kraken')) return Unique.drawKraken(ctx, fish, frameCount, size, finalColor);
  if (n.includes('bạch tuộc')) return Unique.drawOctopus(ctx, fish, frameCount, size, finalColor);
  if (n.includes('sát thủ')) return Unique.drawOrca(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('mao tiên')) return Unique.drawLionfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('cá bay')) return Unique.drawFlyingFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('nóc')) return Unique.drawPufferFish(ctx, fish, frameCount, size, finalColor, isStruggling);
  if (n.includes('đèn lồng')) return Unique.drawAnglerFish(ctx, fish, frameCount, size, finalColor);
  if (n.includes('nòng nọc')) return Unique.drawTadpole(ctx, fish, frameCount, size, finalColor);
  if (n.includes('cá mù')) return Unique.drawBlindFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('cá sấu mù')) return Unique.drawBlindAlligator(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (n.includes('cua khổng lồ')) return Unique.drawGiantCrab(ctx, fish, frameCount, size, finalColor);

  // 4. ELONGATED
  if (n.includes('trê') || n.includes('lóc') || n.includes('chình') || n.includes('cá vua') || n.includes('lươn')) return Classic.drawCatfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);

  // 5. CLASSIC (Fallback)
  return Classic.drawClassicFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
};
