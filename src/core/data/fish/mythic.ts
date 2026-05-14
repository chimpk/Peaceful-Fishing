
import { FishType, Rarity, FishBehavior } from '../../../types';

export const MYTHIC_FISH: FishType[] = [
  // Long Ngư Phượng Hoàng
  { name: 'Long Ngư Phượng Hoàng', rarity: Rarity.MYTHIC, value: 55000, tension: 97, color: '#ef4444', size: 75, weight: 0.08, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Hải Long Vương
  { name: 'Hải Long Vương', rarity: Rarity.MYTHIC, value: 65000, tension: 99, color: '#3b82f6', size: 90, weight: 0.05, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT', 'SUNSET'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Kraken Con
  { name: 'Kraken Con', rarity: Rarity.MYTHIC, value: 85000, tension: 99, color: '#7e22ce', size: 100, weight: 0.03, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Leviathan Thần Thánh
  { name: 'Leviathan Thần Thánh', rarity: Rarity.MYTHIC, value: 120000, tension: 99, color: '#10b981', size: 120, weight: 0.01, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Rồng Bạch Tạng
  { name: 'Cá Rồng Bạch Tạng', rarity: Rarity.MYTHIC, value: 150000, tension: 98, color: '#ffffff', size: 80, weight: 0.02, allowedLocations: ['POND'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_natural_2'], canBerserk: true },
  // Hải Tượng Long
  { name: 'Hải Tượng Long', rarity: Rarity.MYTHIC, value: 200000, tension: 99, color: '#064e3b', size: 150, weight: 0.01, allowedLocations: ['POND'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_2'], canBerserk: true },
  // Cá Pha Lê Tím
  { name: 'Cá Pha Lê Tím', rarity: Rarity.MYTHIC, value: 180000, tension: 98, color: '#a855f7', size: 45, weight: 0.05, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Phượng Hoàng Lửa
  { name: 'Cá Phượng Hoàng Lửa', rarity: Rarity.MYTHIC, value: 220000, tension: 99, color: '#ef4444', size: 60, weight: 0.04, allowedLocations: ['POND'], allowedTimes: ['SUNSET'], preferredBaits: ['bait_natural_2'], canBerserk: true },
  // Cá Cổ Đại Megalodon
  { name: 'Cá Cổ Đại Megalodon', rarity: Rarity.MYTHIC, value: 300000, tension: 99, color: '#475569', size: 180, weight: 0.01, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'], canBerserk: true },
];
