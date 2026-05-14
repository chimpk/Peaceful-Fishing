
import { FishType, Rarity } from '../../types';
import * as Classic from './ClassicModels';
import * as Sharks from './SharkModels';
import * as Unique from './UniqueModels';
import * as Junk from './JunkModels';
import { ChestModels } from './ChestModels';

const drawRarityEffects = (ctx: CanvasRenderingContext2D, fish: FishType, frameCount: number) => {
  const { rarity, size, color } = fish;
  
  if (rarity === Rarity.MYTHIC || rarity === Rarity.LEGENDARY || rarity === Rarity.EPIC) {
    ctx.save();
    
    // Glowing Aura
    const pulse = (Math.sin(frameCount * 0.05) + 1) / 2;
    const auraAlpha = rarity === Rarity.MYTHIC ? 0.4 : (rarity === Rarity.LEGENDARY ? 0.25 : 0.15);
    
    ctx.shadowBlur = size * (rarity === Rarity.MYTHIC ? 1.5 : 1.0);
    ctx.shadowColor = color;
    
    ctx.globalAlpha = auraAlpha * (0.8 + pulse * 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 2.2, size * 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Sparkles for Mythic
    if (rarity === Rarity.MYTHIC) {
      for (let i = 0; i < 5; i++) {
        const ang = (frameCount * 0.03 + i * (Math.PI * 2 / 5));
        const dist = size * 1.8;
        const px = Math.cos(ang) * dist;
        const py = Math.sin(ang) * dist;
        const s = 2 + Math.sin(frameCount * 0.1 + i) * 2;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }
};

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

  // DRAW RARITY EFFECTS (Global Aura)
  drawRarityEffects(ctx, fish, frameCount);

  // DISPATCHER
  // Normalize to NFC to handle Vietnamese accent variations in different environments
  const n = name.toLowerCase().normalize('NFC');
  const has = (key: string) => n.includes(key.normalize('NFC'));

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
    if (has('giày')) return Junk.drawOldShoe(ctx, fish, size, finalColor);
    if (has('lon')) return Junk.drawTinCan(ctx, fish, size, finalColor);
    if (has('túi')) return Junk.drawPlasticBag(ctx, fish, frameCount, size, finalColor);
    if (has('chai')) return Junk.drawBottle(ctx, fish, size, finalColor);
    return Junk.drawTinCan(ctx, fish, size, finalColor); // Fallback
  }

  // 2. SHARKS & AGGRESSIVE
  if (has('mập') || has('nhám')) {
    if (has('búa')) return Sharks.drawHammerhead(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
    return Sharks.drawShark(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  }
  if (has('kiếm') || has('buồm')) return Sharks.drawSwordfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);

  // 3. UNIQUE & EXOTIC
  if (has('đuối')) return Unique.drawRay(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('mặt trăng')) return Unique.drawSunfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('ngựa')) return Unique.drawSeahorse(ctx, fish, frameCount, size, finalColor);
  if (has('rồng') || has('long') || has('leviathan') || has('tượng')) return Unique.drawDragon(ctx, fish, frameCount, size, finalColor);
  if (has('kraken')) return Unique.drawKraken(ctx, fish, frameCount, size, finalColor);
  if (has('bạch tuộc')) return Unique.drawOctopus(ctx, fish, frameCount, size, finalColor);
  if (has('sát thủ')) return Unique.drawOrca(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('mao tiên')) return Unique.drawLionfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('cá bay')) return Unique.drawFlyingFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('nóc')) return Unique.drawPufferFish(ctx, fish, frameCount, size, finalColor, isStruggling);
  if (has('đèn lồng')) return Unique.drawAnglerFish(ctx, fish, frameCount, size, finalColor);
  if (has('nòng nọc')) return Unique.drawTadpole(ctx, fish, frameCount, size, finalColor);
  if (has('cá sấu mù')) return Unique.drawBlindAlligator(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('cá mù')) return Unique.drawBlindFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  if (has('cua khổng lồ')) return Unique.drawGiantCrab(ctx, fish, frameCount, size, finalColor);
  if (has('robot')) return Unique.drawRobotFish(ctx, fish, frameCount, size, finalColor);
  if (has('pha lê')) return Unique.drawCrystalFish(ctx, fish, frameCount, size, finalColor);
  if (has('linh hồn')) return Unique.drawCrystalFish(ctx, fish, frameCount, size, finalColor); // Soul fish uses crystal model
  if (has('thiên hà')) return Unique.drawCrystalFish(ctx, fish, frameCount, size, finalColor); // Galaxy goldfish uses crystal model
  if (has('phượng hoàng')) return Unique.drawDragon(ctx, fish, frameCount, size, finalColor); // Phoenix uses dragon model
  if (has('megalodon')) return Sharks.drawShark(ctx, fish, frameCount, size * 1.5, finalColor, wagFreq, wagAmp);
  if (has('vampire') || has('ma cà rồng')) return Unique.drawAnglerFish(ctx, fish, frameCount, size, finalColor); // Vampire uses angler model

  // 4. ELONGATED (Cá thân dài)
  // Ưu tiên Cá Lóc trước để tránh nhầm lẫn
  // Cá Chình/Lươn/Lăng dùng model Eel (thon trơn, không râu)
  if (has('chình') || has('lươn') || has('lăng')) {
    return Classic.drawEel(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  }

  // Cá Vua (Oarfish) rất dài, dùng Snakehead model (không râu) phù hợp hơn Catfish
  if (has('vua')) return Classic.drawSnakehead(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);

  // Cá Trê dùng model Catfish (đặc trưng có râu)
  if (has('trê')) {
    return Classic.drawCatfish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
  }

  // 5. CLASSIC (Fallback)
  return Classic.drawClassicFish(ctx, fish, frameCount, size, finalColor, wagFreq, wagAmp);
};
