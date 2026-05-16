import { FishType, Rarity, FishBehavior } from '../../../types';

export const MYTHIC_FISH: FishType[] = [
  // Kraken Con
  { name: 'Kraken Con', rarity: Rarity.MYTHIC, value: 12000, tension: 99, color: '#7e22ce', size: 100, weight: 0.03, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Leviathan Thần Thánh
  { name: 'Leviathan Thần Thánh', rarity: Rarity.MYTHIC, value: 18000, tension: 99, color: '#10b981', size: 120, weight: 0.01, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Pha Lê Tím
  { name: 'Cá Pha Lê Tím', rarity: Rarity.MYTHIC, value: 25000, tension: 98, color: '#a855f7', size: 45, weight: 0.05, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Cổ Đại Megalodon
  { name: 'Cá Cổ Đại Megalodon', rarity: Rarity.MYTHIC, value: 45000, tension: 99, color: '#475569', size: 126, weight: 0.003, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Rồng Biển Lá
  { name: 'Cá Rồng Biển Lá', rarity: Rarity.MYTHIC, value: 20000, tension: 95, color: '#bef264', size: 50, weight: 0.03, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'], canBerserk: false },
];
