
import { FishType, Rarity, FishBehavior } from '../../../types';

export const UNCOMMON_FISH: FishType[] = [
  // Cá Trê
  { name: 'Cá Trê', rarity: Rarity.UNCOMMON, value: 60, tension: 30, color: '#4b5563', size: 24, weight: 80, allowedLocations: ['POND'], allowedTimes: ['SUNSET', 'NIGHT'], preferredBaits: ['bait_natural_2'] },
  // Cá Lóc
  { name: 'Cá Lóc', rarity: Rarity.UNCOMMON, value: 120, tension: 35, color: '#1e293b', size: 26, weight: 75, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Chim
  { name: 'Cá Chim', rarity: Rarity.UNCOMMON, value: 80, tension: 32, color: '#e2e8f0', size: 28, weight: 70, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Rô Phi
  { name: 'Cá Rô Phi', rarity: Rarity.UNCOMMON, value: 55, tension: 28, color: '#64748b', size: 22, weight: 85, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Lăng
  { name: 'Cá Lăng', rarity: Rarity.UNCOMMON, value: 150, tension: 40, color: '#475569', size: 30, weight: 60, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Nóc Hổ
  { name: 'Cá Nóc Hổ', rarity: Rarity.UNCOMMON, value: 180, tension: 42, color: '#fcd34d', size: 20, weight: 55, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_2'] },
  // Cá Bay
  { name: 'Cá Bay', rarity: Rarity.UNCOMMON, value: 200, tension: 38, color: '#60a5fa', size: 18, weight: 50, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_2'] },
  // Cá Đèn Lồng
  { name: 'Cá Đèn Lồng', rarity: Rarity.UNCOMMON, value: 220, tension: 48, color: '#020617', size: 25, weight: 65, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Bạch Tuộc Đốm
  { name: 'Bạch Tuộc Đốm', rarity: Rarity.UNCOMMON, value: 250, tension: 55, color: '#991b1b', size: 22, weight: 55, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'] },
  // Lươn Hang Tối
  { name: 'Lươn Hang Tối', rarity: Rarity.UNCOMMON, value: 200, tension: 50, color: '#451a03', size: 35, weight: 60, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Cá Vẹt Parrotfish
  { name: 'Cá Vẹt Parrotfish', rarity: Rarity.UNCOMMON, value: 280, tension: 45, color: '#4ade80', size: 25, weight: 65, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
];
