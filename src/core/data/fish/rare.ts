import { FishType, Rarity, FishBehavior } from '../../../types';

export const RARE_FISH: FishType[] = [
  // Cá Thu
  { name: 'Cá Thu', rarity: Rarity.RARE, value: 350, tension: 45, color: '#60a5fa', size: 28, weight: 20, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'] },
  // Cá Trắm Đen
  { name: 'Cá Trắm Đen', rarity: Rarity.RARE, value: 450, tension: 55, color: '#1e293b', size: 35, weight: 20, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Hồi
  { name: 'Cá Hồi', rarity: Rarity.RARE, value: 400, tension: 55, color: '#f87171', size: 32, weight: 15, allowedLocations: ['POND', 'OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'] },
  // Cá Ngựa
  { name: 'Cá Ngựa', rarity: Rarity.RARE, value: 300, tension: 40, color: '#facc15', size: 18, weight: 15, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Mập Con
  { name: 'Cá Mập Con', rarity: Rarity.RARE, value: 650, tension: 65, color: '#94a3b8', size: 35, weight: 8, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'] },
  // Cá Chình Điện
  { name: 'Cá Chình Điện', rarity: Rarity.RARE, value: 950, tension: 75, color: '#4338ca', size: 40, weight: 10, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'] },
  // Cá Mao Tiên
  { name: 'Cá Mao Tiên', rarity: Rarity.RARE, value: 750, tension: 62, color: '#ef4444', size: 30, weight: 12, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'] },
  // Cá Kính Ghost Fish
  { name: 'Cá Kính Ghost Fish', rarity: Rarity.RARE, value: 550, tension: 50, color: '#bae6fd', size: 20, weight: 15, allowedLocations: ['POND', 'CAVE'], preferredBaits: ['bait_natural_3'] },
  // Cá Phát Sáng Hatchet
  { name: 'Cá Phát Sáng Hatchet', rarity: Rarity.RARE, value: 850, tension: 65, color: '#94a3b8', size: 22, weight: 12, allowedLocations: ['CAVE'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_natural_4'] },
];
