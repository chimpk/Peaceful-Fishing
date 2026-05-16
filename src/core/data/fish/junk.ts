
import { FishType, Rarity } from '../../../types';

export const JUNK_FISH: FishType[] = [
  // Giày Cũ
  { name: 'Giày Cũ', rarity: Rarity.JUNK, value: 35, tension: 5, color: '#78350f', size: 18, weight: 100, displaySize: 30, displayWeight: 0.8, preferredBaits: ['bait_natural_1'] },
  // Lon Thiếc
  { name: 'Lon Thiếc', rarity: Rarity.JUNK, value: 45, tension: 8, color: '#94a3b8', size: 14, weight: 100, displaySize: 12, displayWeight: 0.1, preferredBaits: ['bait_natural_1'] },
  // Túi Nilon
  { name: 'Túi Nilon', rarity: Rarity.JUNK, value: 25, tension: 3, color: '#e2e8f0', size: 20, weight: 100, displaySize: 35, displayWeight: 0.02, preferredBaits: ['bait_natural_1'] },
  // Vỏ Chai
  { name: 'Vỏ Chai', rarity: Rarity.JUNK, value: 40, tension: 6, color: '#60a5fa', size: 12, weight: 100, displaySize: 25, displayWeight: 0.4, preferredBaits: ['bait_natural_1'] },
  // Tảo Biển Mục
  { name: 'Tảo Biển Mục', rarity: Rarity.JUNK, value: 65, tension: 10, color: '#166534', size: 25, weight: 80, displaySize: 60, displayWeight: 0.6, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
];
