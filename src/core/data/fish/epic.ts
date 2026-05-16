
import { FishType, Rarity, FishBehavior } from '../../../types';

export const EPIC_FISH: FishType[] = [
  // Cá Ngừ Đại Dương
  { name: 'Cá Ngừ Đại Dương', rarity: Rarity.EPIC, value: 1200, tension: 70, color: '#312e81', size: 36, weight: 5, displaySize: 120, displayWeight: 45, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Nhám Búa
  { name: 'Cá Nhám Búa', rarity: Rarity.EPIC, value: 2500, tension: 80, color: '#1e1b4b', size: 31, weight: 0.8, displaySize: 350, displayWeight: 180, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Mặt Trăng
  { name: 'Cá Mặt Trăng', rarity: Rarity.EPIC, value: 3500, tension: 60, color: '#cbd5e1', size: 55, weight: 2.5, displaySize: 300, displayWeight: 1000, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Heo
  { name: 'Cá Heo', rarity: Rarity.EPIC, value: 4500, tension: 65, color: '#38bdf8', size: 40, weight: 2, displaySize: 250, displayWeight: 200, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Buồm (Sailfish)
  { name: 'Cá Buồm (Sailfish)', rarity: Rarity.EPIC, value: 7500, tension: 85, color: '#1e3a8a', size: 55, weight: 1.2, displaySize: 300, displayWeight: 60, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'], canBerserk: true },
  // Cá Sấu Mù
  { name: 'Cá Sấu Mù', rarity: Rarity.EPIC, value: 8500, tension: 88, color: '#064e3b', size: 50, weight: 2, displaySize: 200, displayWeight: 150, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cua Khổng Lồ
  { name: 'Cua Khổng Lồ', rarity: Rarity.EPIC, value: 7000, tension: 85, color: '#b91c1c', size: 35, weight: 2.5, displaySize: 100, displayWeight: 15, allowedLocations: ['CAVE'], preferredBaits: ['bait_natural_4'], canBerserk: true },
  // Cá Robot Hư Hỏng
  { name: 'Cá Robot Hư Hỏng', rarity: Rarity.EPIC, value: 12000, tension: 85, color: '#64748b', size: 35, weight: 2.0, displaySize: 80, displayWeight: 12, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'] },
  // Cá Linh Hồn
  { name: 'Cá Linh Hồn', rarity: Rarity.EPIC, value: 9000, tension: 70, color: '#99f6e4', size: 30, weight: 1.5, displaySize: 40, displayWeight: 1.5, allowedLocations: ['POND'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_natural_3'] },
  // Cá Thần Tiên Mandarin
  { name: 'Cá Thần Tiên Mandarin', rarity: Rarity.EPIC, value: 8000, tension: 70, color: '#3b82f6', size: 25, weight: 1.8, displaySize: 30, displayWeight: 0.8, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  // Cá Origami
  { name: 'Cá Origami', rarity: Rarity.EPIC, value: 2500, tension: 75, color: '#f8fafc', size: 30, weight: 15, displaySize: 25, displayWeight: 0.05, allowedLocations: ['POND', 'OCEAN'], preferredBaits: ['bait_natural_3'] },
];
