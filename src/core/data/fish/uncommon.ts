
import { FishType, Rarity, FishBehavior } from '../../../types';

export const UNCOMMON_FISH: FishType[] = [
  // Cá Trê
  { name: 'Cá Trê', rarity: Rarity.UNCOMMON, value: 60, tension: 30, color: '#4b5563', size: 24, weight: 80, displaySize: 55, displayWeight: 3.5, allowedLocations: ['POND'], allowedTimes: ['SUNSET', 'NIGHT'], preferredBaits: ['bait_natural_2'] },
  // Cá Lóc
  { name: 'Cá Lóc', rarity: Rarity.UNCOMMON, value: 120, tension: 35, color: '#1e293b', size: 26, weight: 75, displaySize: 60, displayWeight: 4.2, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Chim
  { name: 'Cá Chim', rarity: Rarity.UNCOMMON, value: 80, tension: 32, color: '#e2e8f0', size: 28, weight: 70, displaySize: 45, displayWeight: 2.8, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Rô Phi
  { name: 'Cá Rô Phi', rarity: Rarity.UNCOMMON, value: 55, tension: 28, color: '#64748b', size: 22, weight: 85, displaySize: 35, displayWeight: 1.5, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Lăng
  { name: 'Cá Lăng', rarity: Rarity.UNCOMMON, value: 150, tension: 40, color: '#475569', size: 30, weight: 60, displaySize: 75, displayWeight: 8.5, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Nóc Hổ
  { name: 'Cá Nóc Hổ', rarity: Rarity.UNCOMMON, value: 180, tension: 42, color: '#fcd34d', size: 20, weight: 55, displaySize: 25, displayWeight: 0.8, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_2'] },
  // Cá Bay
  { name: 'Cá Bay', rarity: Rarity.UNCOMMON, value: 200, tension: 38, color: '#60a5fa', size: 18, weight: 50, displaySize: 30, displayWeight: 0.4, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_2'] },
  // Cá Đèn Lồng
  { name: 'Cá Đèn Lồng', rarity: Rarity.UNCOMMON, value: 220, tension: 48, color: '#020617', size: 25, weight: 65, displaySize: 35, displayWeight: 1.2, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Bạch Tuộc Đốm
  { name: 'Bạch Tuộc Đốm', rarity: Rarity.UNCOMMON, value: 250, tension: 55, color: '#991b1b', size: 22, weight: 55, displaySize: 40, displayWeight: 2.5, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'] },
  // Lươn Hang Tối
  { name: 'Lươn Hang Tối', rarity: Rarity.UNCOMMON, value: 200, tension: 50, color: '#451a03', size: 35, weight: 60, displaySize: 90, displayWeight: 1.8, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Cá Vẹt Parrotfish
  { name: 'Cá Vẹt Parrotfish', rarity: Rarity.UNCOMMON, value: 280, tension: 45, color: '#4ade80', size: 25, weight: 65, displaySize: 35, displayWeight: 1.5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Diếc (Uncommon)
  { name: 'Cá Diếc', rarity: Rarity.UNCOMMON, value: 75, tension: 25, color: '#94a3b8', size: 18, weight: 85, displaySize: 22, displayWeight: 0.45, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1'] },
  // Cá Mè Hoa
  { name: 'Cá Mè Hoa', rarity: Rarity.UNCOMMON, value: 90, tension: 35, color: '#cbd5e1', size: 35, weight: 70, displaySize: 65, displayWeight: 5.5, allowedLocations: ['POND'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_natural_3'] },
  // Cá Bướm
  { name: 'Cá Bướm', rarity: Rarity.UNCOMMON, value: 160, tension: 30, color: '#fbbf24', size: 15, weight: 80, displaySize: 15, displayWeight: 0.12, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
];
