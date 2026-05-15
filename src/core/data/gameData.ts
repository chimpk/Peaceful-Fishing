
import { Rarity, FishType, RodType, TackleType, BaitType, Achievement, Quest, FishBehavior } from '../../types';

export const CANVAS_WIDTH = 1100;
export const CANVAS_HEIGHT = 650;
export const REEL_BAR_HEIGHT = 350;
export const BOSS_EXIST_TIME = 3600;
export const DURABILITY_CHECK_INTERVAL = 30;
export const BASE_REPAIR_COST_ROD = 50;
export const BASE_REPAIR_COST_TACKLE = 100;

export const WEATHER_BONUSES = {
  sunny: { attraction: 1.0, rarity: 1.0, speed: 1.0, tension: 1.0, label: 'Trời Đẹp: Chỉ số cơ bản' },
  rainy: { attraction: 1.4, rarity: 0.8, speed: 1.2, tension: 1.0, label: 'Trời Mưa: +40% Cá cắn câu, +20% Tốc độ cá, -20% Độ hiếm' },
  stormy: { attraction: 0.7, rarity: 3.5, speed: 2.0, tension: 1.45, label: 'Bão Lớn: x3.5 Độ hiếm, x2.0 Tốc độ cá, +45% Căng dây. CẢNH BÁO: Sét đánh có thể gây mất kiểm soát cần câu!' },
  foggy: { attraction: 1.6, rarity: 1.5, speed: 0.8, tension: 1.15, label: 'Sương Mù: ++Thu hút cá, +50% Độ hiếm, Cá bơi chậm nhưng khó kéo hơn!' },
  meteor_shower: { attraction: 1.2, rarity: 2.0, speed: 1.0, tension: 1.0, label: 'Mưa Sao Băng: x2 Độ hiếm, x2 Vàng nhận được. Điều ước sắp thành hiện thực!' },
  rainbow: { attraction: 2.0, rarity: 2.5, speed: 0.9, tension: 0.8, label: 'Cầu Vồng: ++Cá cắn câu, ++Độ hiếm, Giảm căng dây. May mắn ngập tràn!' },
  aurora: { attraction: 1.5, rarity: 4.0, speed: 1.1, tension: 1.2, label: 'Cực Quang: x4 Độ hiếm. Vẻ đẹp huyền bí của đại dương!' },
  deep_sea_current: { attraction: 0.8, rarity: 3.0, speed: 2.5, tension: 1.3, label: 'Dòng Hải Lưu: x3 Độ hiếm, Cá bơi cực nhanh (+150%), Giảm thu hút.' },
  crystal_resonance: { attraction: 1.2, rarity: 4.5, speed: 1.0, tension: 1.1, label: 'Cộng Hưởng Tinh Thể: x4.5 Độ hiếm. Tinh thể phát sáng thu hút những loài cá thần bí!' },
  falling_stalactite: { attraction: 1.1, rarity: 4.0, speed: 1.2, tension: 1.3, label: 'Thạch Nhũ Rơi: x4 Độ hiếm. CẢNH BÁO: Thạch nhũ rơi có thể làm hỏng cần câu hoặc làm cá hoảng sợ!' }
};

export const CHEST_TYPES: FishType[] = [
  { name: 'Rương Gỗ Cổ', rarity: Rarity.COMMON, value: 150, tension: 45, color: '#78350f', size: 30, weight: 10, isChest: true },
  { name: 'Rương Bạc Nạm Ngọc', rarity: Rarity.RARE, value: 500, tension: 70, color: '#94a3b8', size: 35, weight: 5, isChest: true },
  { name: 'Rương Vàng Hoàng Gia', rarity: Rarity.LEGENDARY, value: 2000, tension: 110, color: '#fbbf24', size: 40, weight: 2, isChest: true }
];

import { JUNK_FISH } from './fish/junk';
import { COMMON_FISH } from './fish/common';
import { UNCOMMON_FISH } from './fish/uncommon';
import { RARE_FISH } from './fish/rare';
import { EPIC_FISH } from './fish/epic';
import { LEGENDARY_FISH } from './fish/legendary';
import { MYTHIC_FISH } from './fish/mythic';

export const FISH_TYPES: FishType[] = [
  ...JUNK_FISH,
  ...COMMON_FISH,
  ...UNCOMMON_FISH,
  ...RARE_FISH,
  ...EPIC_FISH,
  ...LEGENDARY_FISH,
  ...MYTHIC_FISH,
];

export const RODS: RodType[] = [
  { 
    id: 'rod_1', 
    name: 'Cần Tre Cơ Bản', 
    description: 'Dành cho người mới bắt đầu. Chịu được cá dưới 150 vàng.',
    price: 0, 
    lineStrength: 1, 
    control: 1, 
    maxValue: 150,
    rarityText: 'PHỔ THÔNG',
    durability: 100,
    maxDurability: 100
  },
  { 
    id: 'rod_2', 
    name: 'Cần Carbon', 
    description: 'Nhẹ và linh hoạt. Chịu được cá dưới 800 vàng.',
    price: 12000, 
    lineStrength: 1.8, 
    control: 1.3, 
    maxValue: 800,
    rarityText: 'HIẾM',
    durability: 150,
    maxDurability: 150
  },
  { 
    id: 'rod_3', 
    name: 'Cần Thép Titan', 
    description: 'Cực kỳ chắc chắn. Chịu được cá dưới 5001 vàng.',
    price: 45000, 
    lineStrength: 2.8, 
    control: 1.6, 
    maxValue: 5000,
    rarityText: 'SỬ THI',
    durability: 250,
    maxDurability: 250
  },
  { 
    id: 'rod_4', 
    name: 'Cần Huyền Thoại', 
    description: 'Sức mạnh huyền thoại. Có thể câu được cá lớn hơn 5000 vàng.',
    price: 180000, 
    lineStrength: 4.5, 
    control: 2.2, 
    maxValue: 1000000,
    rarityText: 'HUYỀN THOẠI', 
    isLocked: true,
    durability: 500,
    maxDurability: 500
  },
];

export const TACKLES: TackleType[] = [
  {
    id: 'tackle_1',
    name: 'Thẻo số 1',
    description: 'Dành cho cá nhỏ. Tốt nhất cho cá dưới 101 vàng.',
    price: 500,
    attraction: 120,
    rarityBoost: 0.8,
    maxValue: 100,
    rarityText: 'CƠ BẢN',
    count: 1,
    durability: 30,
    maxDurability: 30,
    tensionStability: 1.0,
    liftBonus: 1.0
  },
  {
    id: 'tackle_2',
    name: 'Thẻo số 2',
    description: 'Câu được cá dưới 501 vàng. Thanh Tension di chuyển đầm hơn.',
    price: 1000,
    attraction: 180,
    rarityBoost: 1.2,
    maxValue: 500,
    rarityText: 'NÂNG CAO',
    count: 0,
    durability: 50,
    maxDurability: 50,
    tensionStability: 1.15,
    liftBonus: 1.0
  },
  {
    id: 'tackle_3',
    name: 'Thẻo số 3',
    description: 'Dùng cho cá dưới 5001 vàng. Tăng tốc độ kéo cá.',
    price: 8000,
    attraction: 240,
    rarityBoost: 1.8,
    maxValue: 5000,
    rarityText: 'CHUYÊN NGHIỆP',
    count: 0,
    durability: 80,
    maxDurability: 80,
    tensionStability: 1.05,
    liftBonus: 1.25
  },
  {
    id: 'tackle_4',
    name: 'Thẻo số 4',
    description: 'Cho cá dưới 10001 vàng. Cân bằng giữa sức kéo và sự ổn định.',
    price: 25000,
    attraction: 280,
    rarityBoost: 2.5,
    maxValue: 10000,
    rarityText: 'CAO CẤP',
    count: 0,
    durability: 120,
    maxDurability: 120,
    tensionStability: 1.25,
    liftBonus: 1.15
  },
  {
    id: 'tackle_5',
    name: 'Thẻo số 5',
    description: 'Kiệt tác câu cá. Tối ưu hóa mọi thông số kỹ thuật.',
    price: 75000,
    attraction: 320,
    rarityBoost: 3.5,
    maxValue: 50000,
    rarityText: 'CỰC HẠNG',
    count: 0,
    durability: 200,
    maxDurability: 200,
    tensionStability: 1.4,
    liftBonus: 1.4
  }
];

export const NATURAL_BAITS: BaitType[] = [
  {
    id: 'bait_free_1',
    name: 'Bánh mỳ vụn',
    description: 'Mồi miễn phí luôn có sẵn. Chỉ thu hút cá nhỏ và rác.',
    price: 0,
    attraction: 80,
    rarityBoost: 0.1,
    rarityText: 'MIỄN PHÍ',
    count: Infinity,
    category: 'NATURAL'
  },
  {
    id: 'bait_natural_1',
    name: 'Giun đất',
    description: 'Vua của các loại mồi tanh. Câu cá trê, rô phi, chép.',
    price: 600,
    attraction: 150,
    rarityBoost: 1.0,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL'
  },
  {
    id: 'bait_natural_2',
    name: 'Tôm đồng',
    description: 'Mồi nhạy cho cá rô phi, chép, cá lăng.',
    price: 1800,
    attraction: 200,
    rarityBoost: 1.5,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL'
  },
  {
    id: 'bait_natural_3',
    name: 'Ốc sên',
    description: 'Mồi chính để câu cá chép, trắm đen.',
    price: 1200,
    attraction: 180,
    rarityBoost: 1.2,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL'
  },
  {
    id: 'bait_natural_4',
    name: 'Nhái sống',
    description: 'Đặc trị câu cá lóc (cá quả).',
    price: 3500,
    attraction: 220,
    rarityBoost: 1.8,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL'
  }
];

export const SEA_BAITS: BaitType[] = [
  {
    id: 'bait_sea_1',
    name: 'Tôm biển',
    description: 'Dành cho gần như mọi loại cá nhỏ ở biển.',
    price: 1500,
    attraction: 160,
    rarityBoost: 1.0,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA'
  },
  {
    id: 'bait_sea_2',
    name: 'Mực tươi',
    description: 'Thu hút cá thu và cá ngừ.',
    price: 5000,
    attraction: 250,
    rarityBoost: 2.0,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA'
  },
  {
    id: 'bait_sea_3',
    name: 'Cá mồi',
    description: 'Giành cho các loại cá to dưới 5001 vàng ăn.',
    price: 12000,
    attraction: 350,
    rarityBoost: 3.5,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA'
  }
];

export const BAITS = [...NATURAL_BAITS, ...SEA_BAITS];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', title: 'Tân Thủ', description: 'Câu được con cá đầu tiên.', target: 1, progress: 0, isCompleted: false, reward: 500 },
  { id: 'ach_2', title: 'Thợ Câu Chuyên Nghiệp', description: 'Câu được 50 con cá.', target: 50, progress: 0, isCompleted: false, reward: 2000 },
  { id: 'ach_3', title: 'Triệu Phú Đại Dương', description: 'Kiếm được tổng cộng 50,000 vàng.', target: 50000, progress: 0, isCompleted: false, reward: 10000 },
  { id: 'ach_4', title: 'Thợ Săn Huyền Thoại', description: 'Câu được cá độ hiếm Huyền Thoại.', target: 1, progress: 0, isCompleted: false, reward: 20000 },
];

export const generateDailyQuests = (): Quest[] => {
  const quests: Quest[] = [
    {
      id: 'q_1',
      title: 'Kẻ Săn Cá Chuyên Cần',
    description: 'Câu được tổng cộng 15 con cá.',
      target: 15,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 1500,
      rewardBaitId: 'bait_natural_1',
      rewardBaitCount: 10,
      type: 'CATCH_TOTAL'
    },
    {
      id: 'q_2',
      title: 'Thương Nhân Tài Ba',
      description: 'Kiếm được 10,000 vàng từ việc bán cá.',
      target: 10000,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 3000,
      type: 'EARN_GOLD'
    }
  ];

  const validFishForQuests = FISH_TYPES.filter(f => f.rarity === Rarity.COMMON || f.rarity === Rarity.UNCOMMON || f.rarity === Rarity.RARE);
  const targetFish = validFishForQuests[Math.floor(Math.random() * validFishForQuests.length)];

  const locationNames: Record<string, string> = { POND: 'Ao Làng', OCEAN: 'Đại Dương', CAVE: 'Hang Tối' };
  const locationHint = targetFish.allowedLocations 
    ? ` (Tại: ${targetFish.allowedLocations.map(l => locationNames[l] || l).join(', ')})` 
    : '';

  quests.push({
    id: 'q_3',
    title: `Thử Thách: ${targetFish.name}`,
    description: `Câu được 3 con ${targetFish.name}.${locationHint}`,
    target: 3,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 2000,
    rewardBaitId: 'bait_natural_2',
    rewardBaitCount: 3,
    type: 'CATCH_SPECIFIC',
    fishTarget: targetFish.name
  });

  return quests;
};

export const LOCATION_DATA = {
  POND: { currentSpeed: 0, description: 'Ao làng yên bình. Thích hợp cho người mới.' },
  OCEAN: { currentSpeed: 0.0015, description: 'Biển khơi sóng dữ. Dòng chảy mạnh làm khó thợ câu.' },
  CAVE: { currentSpeed: 0.0008, description: 'Hang động huyền bí. Dòng chảy ngầm khó đoán.' }
};
