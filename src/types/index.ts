
export enum GameState {
  START = 'START',
  IDLE = 'IDLE',
  CHARGING = 'CHARGING',
  CASTING = 'CASTING',
  WAITING = 'WAITING',
  NIBBLING = 'NIBBLING',
  REELING = 'REELING',
  CAUGHT = 'CAUGHT',
  GAMEOVER = 'GAMEOVER',
  BOSS_FIGHT = 'BOSS_FIGHT'
}

export enum UIView {
  GAME = 'GAME',
  INVENTORY = 'INVENTORY',
  SHOP = 'SHOP',
  PROFILE = 'PROFILE',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  QUESTS = 'QUESTS',
  COLLECTION = 'COLLECTION',
  SKILLS = 'SKILLS',
  RESULTS = 'RESULTS',
  LEADERBOARD = 'LEADERBOARD'
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

export enum FishBehavior {
  NORMAL = 'NORMAL',
  LEAPER = 'LEAPER',    // Nhảy khỏi mặt nước, cần thả phím Space
  DIVER = 'DIVER',      // Lặn sâu, kéo dây xuống mạnh
  AGGRESSIVE = 'AGGRESSIVE' // Hung dữ, tăng tension nhanh
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
  behavior?: FishBehavior;
  canBerserk?: boolean; // Mới: Cá có thể vào trạng thái hung dữ cuối trận
  allowedLocations?: LocationType[];
  allowedTimes?: TimeOfDay[];
  preferredBaits?: string[];
  isChest?: boolean; // Mới: Phân biệt rương kho báu
  description?: string;
  spriteInfo?: { color?: string; shape?: string; [key: string]: any };
}

export interface RodType {
  id: string;
  name: string;
  description: string;
  price: number;
  lineStrength: number;
  control: number;
  maxValue?: number;
  rarityText: string;
  isLocked?: boolean;
  durability?: number;    // Mới: Độ bền hiện tại
  maxDurability?: number; // Mới: Độ bền tối đa
}

export interface TackleType {
  id: string;
  name: string;
  description: string;
  price: number;
  attraction: number;
  rarityBoost: number;
  maxValue?: number;
  rarityText: string;
  count?: number;
  durability?: number;    // Mới: Độ bền hiện tại
  maxDurability?: number; // Mới: Độ bền tối đa
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
  category: 'NATURAL' | 'SEA';
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
  level?: number;
  xp?: number;
  fishCounts?: Record<string, number>;
  lastDailyRewardClaimed?: number;
  dailyStreak?: number;
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
  focus: number;
  powerReel: number;
  deepSeaDiver: number;
  weatherExpert: number;
  masterAngler: number;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'achievement' | 'boss';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}
