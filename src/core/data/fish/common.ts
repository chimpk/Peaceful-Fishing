
import { FishType, Rarity } from '../../../types';

export const COMMON_FISH: FishType[] = [
  // Cá Rô Đồng
  { name: 'Cá Rô Đồng', rarity: Rarity.COMMON, value: 25, tension: 15, color: '#4ade80', size: 18, weight: 150, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Chép
  { name: 'Cá Chép', rarity: Rarity.COMMON, value: 35, tension: 20, color: '#f59e0b', size: 22, weight: 150, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Diếc
  { name: 'Cá Diếc', rarity: Rarity.COMMON, value: 30, tension: 18, color: '#94a3b8', size: 16, weight: 140, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Mè
  { name: 'Cá Mè', rarity: Rarity.COMMON, value: 40, tension: 22, color: '#cbd5e1', size: 24, weight: 130, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Bống
  { name: 'Cá Bống', rarity: Rarity.COMMON, value: 20, tension: 12, color: '#78350f', size: 14, weight: 160, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Trôi
  { name: 'Cá Trôi', rarity: Rarity.COMMON, value: 32, tension: 19, color: '#94a3b8', size: 20, weight: 145, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Đuối Cát
  { name: 'Cá Đuối Cát', rarity: Rarity.COMMON, value: 45, tension: 25, color: '#d1d5db', size: 28, weight: 120, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  // Cá Cơm
  { name: 'Cá Cơm', rarity: Rarity.COMMON, value: 15, tension: 10, color: '#e2e8f0', size: 10, weight: 180, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  // Cá Mù Hang Động
  { name: 'Cá Mù Hang Động', rarity: Rarity.COMMON, value: 65, tension: 28, color: '#cbd5e1', size: 18, weight: 140, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Nòng Nọc Đột Biến
  { name: 'Nòng Nọc Đột Biến', rarity: Rarity.COMMON, value: 45, tension: 25, color: '#166534', size: 15, weight: 120, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_3'] },
];
