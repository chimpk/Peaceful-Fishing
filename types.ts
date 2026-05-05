
export enum GameState {
  START = 'START',
  IDLE = 'IDLE',
  CHARGING = 'CHARGING',
  CASTING = 'CASTING',
  WAITING = 'WAITING',
  REELING = 'REELING',
  CAUGHT = 'CAUGHT',
  GAMEOVER = 'GAMEOVER'
}

export enum UIView {
  GAME = 'GAME',
  INVENTORY = 'INVENTORY',
  SHOP = 'SHOP',
  PROFILE = 'PROFILE',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  QUESTS = 'QUESTS',
  COLLECTION = 'COLLECTION',
  SKILLS = 'SKILLS'
}

export enum Rarity {
  JUNK = 'RÁC',
  COMMON = 'PHỔ THÔNG',
  UNCOMMON = 'KHÔNG PHỔ BIẾN',
  RARE = 'HIẾM',
  EPIC = 'SỬ THI',
  LEGENDARY = 'HUYỀN THOẠI',
  MYTHIC = 'THẦN THOẠI'
}

export type LocationType = 'POND' | 'OCEAN' | 'CAVE';
export type TimeOfDay = 'DAY' | 'SUNSET' | 'NIGHT';

export interface FishType {
  name: string;
  weight: number; 
  value: number;
  color: string;
  tension: number;
  size: number;
  rarity: Rarity;
  allowedLocations?: LocationType[];
  allowedTimes?: TimeOfDay[];
}

export interface RodType {
  id: string;
  name: string;
  description: string;
  price: number;
  lineStrength: number;
  control: number;
  rarityText: string;
  isLocked?: boolean;
}

export interface BaitType {
  id: string;
  name: string;
  description: string;
  price: number;
  attraction: number;
  rarityBoost: number;
  rarityText: string;
  count?: number;
}

export interface FishInstance {
  id: string;
  x: number;
  y: number;
  speed: number;
  direction: number;
  type: FishType;
}

export interface InventoryItem {
  fish: FishType;
  timestamp: number;
  isGolden?: boolean;
}

export interface ProfileStats {
  totalGoldEarned: number;
  totalFishCaught: number;
  rarestFish: string;
  highestValue: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  reward: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewardGold: number;
  rewardBaitId?: string;
  rewardBaitCount?: number;
  type: 'CATCH_TOTAL' | 'CATCH_SPECIFIC' | 'EARN_GOLD';
  fishTarget?: string;
}

export interface PlayerSkills {
  sharpEye: number;
  fastHands: number;
  lucky: number;
}
