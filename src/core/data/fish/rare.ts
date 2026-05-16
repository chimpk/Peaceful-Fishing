import { FishType, Rarity, FishBehavior } from '../../../types';

export const RARE_FISH: FishType[] = [
  // Cá Thu
  { name: 'Cá Thu', rarity: Rarity.RARE, value: 2200, tension: 45, color: '#60a5fa', size: 28, weight: 20, displaySize: 65, displayWeight: 4.5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'] },
  // Cá Trắm Đen
  { name: 'Cá Trắm Đen', rarity: Rarity.RARE, value: 2800, tension: 55, color: '#1e293b', size: 35, weight: 20, displaySize: 120, displayWeight: 25, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Hồi
  { name: 'Cá Hồi', rarity: Rarity.RARE, value: 2500, tension: 55, color: '#f87171', size: 32, weight: 15, displaySize: 75, displayWeight: 6.5, allowedLocations: ['POND', 'OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'] },
  // Cá Ngựa
  { name: 'Cá Ngựa', rarity: Rarity.RARE, value: 1800, tension: 40, color: '#facc15', size: 18, weight: 15, displaySize: 15, displayWeight: 0.04, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Mập Con
  { name: 'Cá Mập Con', rarity: Rarity.RARE, value: 3800, tension: 65, color: '#94a3b8', size: 24, weight: 2, displaySize: 80, displayWeight: 15, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'] },
  // Cá Chình Điện
  { name: 'Cá Chình Điện', rarity: Rarity.RARE, value: 5200, tension: 75, color: '#4338ca', size: 40, weight: 10, displaySize: 180, displayWeight: 20, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'] },
  // Cá Mao Tiên
  { name: 'Cá Mao Tiên', rarity: Rarity.RARE, value: 4500, tension: 62, color: '#ef4444', size: 30, weight: 12, displaySize: 35, displayWeight: 0.8, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'] },
  // Cá Kính Ghost Fish
  { name: 'Cá Kính Ghost Fish', rarity: Rarity.RARE, value: 3200, tension: 50, color: '#bae6fd', size: 20, weight: 15, displaySize: 15, displayWeight: 0.05, allowedLocations: ['POND', 'CAVE'], preferredBaits: ['bait_natural_3'] },
  // Cá Phát Sáng Hatchet
  { name: 'Cá Phát Sáng Hatchet', rarity: Rarity.RARE, value: 4800, tension: 65, color: '#94a3b8', size: 22, weight: 12, displaySize: 10, displayWeight: 0.03, allowedLocations: ['CAVE'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_natural_4'] },
  // Cá Koi Kohaku
  { name: 'Cá Koi Kohaku', rarity: Rarity.RARE, value: 6500, tension: 60, color: '#ffffff', size: 45, weight: 10, displaySize: 70, displayWeight: 4.5, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Rồng Hang Động
  { name: 'Cá Rồng Hang Động', rarity: Rarity.RARE, value: 8500, tension: 90, color: '#4c1d95', size: 50, weight: 8, displaySize: 65, displayWeight: 3.5, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'] },
];
