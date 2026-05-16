
import { FishType, Rarity } from '../../../types';

export const COMMON_FISH: FishType[] = [
  // Cá Rô Đồng
  { name: 'Cá Rô Đồng', rarity: Rarity.COMMON, value: 120, tension: 15, color: '#4ade80', size: 18, weight: 150, displaySize: 15, displayWeight: 0.15, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Chép
  { name: 'Cá Chép', rarity: Rarity.COMMON, value: 180, tension: 20, color: '#f59e0b', size: 22, weight: 150, displaySize: 45, displayWeight: 1.8, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Diếc
  { name: 'Cá Diếc', rarity: Rarity.COMMON, value: 150, tension: 18, color: '#94a3b8', size: 16, weight: 140, displaySize: 20, displayWeight: 0.35, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Mè
  { name: 'Cá Mè', rarity: Rarity.COMMON, value: 210, tension: 22, color: '#cbd5e1', size: 24, weight: 130, displaySize: 55, displayWeight: 2.5, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Bống
  { name: 'Cá Bống', rarity: Rarity.COMMON, value: 95, tension: 12, color: '#78350f', size: 14, weight: 160, displaySize: 12, displayWeight: 0.08, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Trôi
  { name: 'Cá Trôi', rarity: Rarity.COMMON, value: 165, tension: 19, color: '#94a3b8', size: 20, weight: 145, displaySize: 40, displayWeight: 1.5, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  // Cá Đuối Cát
  { name: 'Cá Đuối Cát', rarity: Rarity.COMMON, value: 240, tension: 25, color: '#d1d5db', size: 28, weight: 120, displaySize: 80, displayWeight: 4.5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  // Cá Cơm
  { name: 'Cá Cơm', rarity: Rarity.COMMON, value: 75, tension: 10, color: '#e2e8f0', size: 10, weight: 180, displaySize: 10, displayWeight: 0.01, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  // Cá Mù Hang Động
  { name: 'Cá Mù Hang Động', rarity: Rarity.COMMON, value: 350, tension: 28, color: '#cbd5e1', size: 18, weight: 140, displaySize: 18, displayWeight: 0.15, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'] },
  // Nòng Nọc Đột Biến
  { name: 'Nòng Nọc Đột Biến', rarity: Rarity.COMMON, value: 280, tension: 25, color: '#166534', size: 15, weight: 120, displaySize: 12, displayWeight: 0.05, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_3'] },
];
