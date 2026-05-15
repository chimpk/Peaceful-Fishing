
import { FishType, Rarity, FishBehavior } from '../../../types';

export const LEGENDARY_FISH: FishType[] = [
  // Cá Kiếm Bạc
  { name: 'Cá Kiếm Bạc', rarity: Rarity.LEGENDARY, value: 2500, tension: 90, color: '#e2e8f0', size: 50, weight: 0.8, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Mập Trắng
  { name: 'Cá Mập Trắng', rarity: Rarity.LEGENDARY, value: 3800, tension: 94, color: '#94a3b8', size: 65, weight: 0.5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Rồng Vàng
  { name: 'Cá Rồng Vàng', rarity: Rarity.LEGENDARY, value: 5000, tension: 88, color: '#fbbf24', size: 45, weight: 0.4, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'], canBerserk: true },
  // Cá Voi Xanh Con
  { name: 'Cá Voi Xanh Con', rarity: Rarity.LEGENDARY, value: 4200, tension: 92, color: '#1d4ed8', size: 70, weight: 0.3, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Voi Sát Thủ
  { name: 'Cá Voi Sát Thủ', rarity: Rarity.LEGENDARY, value: 6500, tension: 96, color: '#020617', size: 85, weight: 0.2, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Vua (Oarfish)
  { name: 'Cá Vua (Oarfish)', rarity: Rarity.LEGENDARY, value: 9500, tension: 98, color: '#cbd5e1', size: 120, weight: 0.15, allowedLocations: ['CAVE'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Vàng Thiên Hà
  { name: 'Cá Vàng Thiên Hà', rarity: Rarity.LEGENDARY, value: 8500, tension: 95, color: '#1e1b4b', size: 50, weight: 0.6, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Mực Khổng Lồ
  { name: 'Mực Khổng Lồ', rarity: Rarity.LEGENDARY, value: 7200, tension: 96, color: '#991b1b', size: 90, weight: 0.1, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Mác Xanh (Blue Marlin)
  { name: 'Cá Mác Xanh (Blue Marlin)', rarity: Rarity.LEGENDARY, value: 5500, tension: 92, color: '#1e3a8a', size: 80, weight: 0.15, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Phượng Hoàng Lửa
  { name: 'Cá Phượng Hoàng Lửa', rarity: Rarity.LEGENDARY, value: 4800, tension: 120, color: '#f97316', size: 65, weight: 3, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'] },
];
