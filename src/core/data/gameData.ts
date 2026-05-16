
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
  rainy: { attraction: 1.4, rarity: 0.9, speed: 1.2, tension: 1.0, label: 'Trời Mưa: +40% Cá cắn câu, +20% Tốc độ cá, -10% Độ hiếm' },
  stormy: { attraction: 0.7, rarity: 2.2, speed: 2.0, tension: 1.45, label: 'Bão Lớn: x2.2 Độ hiếm, x2.0 Tốc độ cá, +45% Căng dây. CẢNH BÁO: Sét đánh có thể gây mất kiểm soát cần câu!' },
  foggy: { attraction: 1.6, rarity: 1.3, speed: 0.8, tension: 1.15, label: 'Sương Mù: ++Thu hút cá, +30% Độ hiếm, Cá bơi chậm nhưng khó kéo hơn!' },
  meteor_shower: { attraction: 1.2, rarity: 1.8, speed: 1.0, tension: 1.0, label: 'Mưa Sao Băng: x1.8 Độ hiếm, x2 Vàng nhận được. Điều ước sắp thành hiện thực!' },
  rainbow: { attraction: 2.0, rarity: 2.0, speed: 0.9, tension: 0.8, label: 'Cầu Vồng: ++Cá cắn câu, ++Độ hiếm, Giảm căng dây. May mắn ngập tràn!' },
  aurora: { attraction: 1.5, rarity: 2.5, speed: 1.1, tension: 1.2, label: 'Cực Quang: x2.5 Độ hiếm. Vẻ đẹp huyền bí của đại dương!' },
  deep_sea_current: { attraction: 0.8, rarity: 2.2, speed: 2.5, tension: 1.3, label: 'Dòng Hải Lưu: x2.2 Độ hiếm, Cá bơi cực nhanh (+150%), Giảm thu hút.' },
  crystal_resonance: { attraction: 1.2, rarity: 2.8, speed: 1.0, tension: 1.1, label: 'Cộng Hưởng Tinh Thể: x2.8 Độ hiếm. Tinh thể phát sáng thu hút những loài cá thần bí!' },
  falling_stalactite: { attraction: 1.1, rarity: 2.4, speed: 1.2, tension: 1.3, label: 'Thạch Nhũ Rơi: x2.4 Độ hiếm. CẢNH BÁO: Thạch nhũ rơi có thể làm hỏng cần câu hoặc làm cá hoảng sợ!' }
};

export const CHEST_TYPES: FishType[] = [
  { name: 'Rương Gỗ Cổ', rarity: Rarity.COMMON, value: 500, tension: 45, color: '#78350f', size: 30, weight: 10, isChest: true },
  { name: 'Rương Bạc Nạm Ngọc', rarity: Rarity.RARE, value: 3500, tension: 70, color: '#94a3b8', size: 35, weight: 5, isChest: true },
  { name: 'Rương Vàng Hoàng Gia', rarity: Rarity.LEGENDARY, value: 25000, tension: 110, color: '#fbbf24', size: 40, weight: 2, isChest: true }
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
    category: 'NATURAL',
    minLevel: 1
  },
  {
    id: 'bait_natural_1',
    name: 'Giun đất',
    description: 'Mồi tanh cơ bản. Phù hợp câu cá ở Ao Làng.',
    price: 600,
    attraction: 150,
    rarityBoost: 1.0,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL',
    minLevel: 1,
    requiredLocation: 'POND'
  },
  {
    id: 'bait_natural_2',
    name: 'Tôm đồng',
    description: 'Mồi nhạy cho cá lớn ở nước ngọt.',
    price: 1800,
    attraction: 200,
    rarityBoost: 1.5,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL',
    minLevel: 3,
    requiredLocation: 'POND'
  },
  {
    id: 'bait_natural_3',
    name: 'Ốc sên',
    description: 'Đặc trị các loài cá tầng đáy.',
    price: 1200,
    attraction: 180,
    rarityBoost: 1.2,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL',
    minLevel: 5,
    requiredLocation: 'POND'
  },
  {
    id: 'bait_natural_4',
    name: 'Nhái sống',
    description: 'Mồi săn mồi cấp cao cho Ao Làng.',
    price: 3500,
    attraction: 220,
    rarityBoost: 1.8,
    rarityText: 'TỰ NHIÊN',
    count: 10,
    category: 'NATURAL',
    minLevel: 8,
    requiredLocation: 'POND'
  }
];

export const SEA_BAITS: BaitType[] = [
  {
    id: 'bait_sea_1',
    name: 'Tôm biển',
    description: 'Mồi biển cơ bản cho người mới ra khơi.',
    price: 1500,
    attraction: 160,
    rarityBoost: 1.0,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA',
    minLevel: 5,
    requiredLocation: 'OCEAN'
  },
  {
    id: 'bait_sea_2',
    name: 'Mực tươi',
    description: 'Thu hút các loài cá săn mồi ở biển sâu.',
    price: 5000,
    attraction: 250,
    rarityBoost: 2.0,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA',
    minLevel: 10,
    requiredLocation: 'OCEAN'
  },
  {
    id: 'bait_sea_3',
    name: 'Cá mồi',
    description: 'Mồi tối thượng để săn quái vật biển.',
    price: 12000,
    attraction: 350,
    rarityBoost: 3.5,
    rarityText: 'BIỂN',
    count: 10,
    category: 'SEA',
    minLevel: 15,
    requiredLocation: 'OCEAN'
  }
];

export const SPECIAL_BAITS: BaitType[] = [
  {
    id: 'bait_special_1',
    name: 'Mồi phát quang',
    description: 'Tỏa sáng rực rỡ trong bóng tối. Đặc trị cá trong Hang Động.',
    price: 4500,
    attraction: 280,
    rarityBoost: 2.2,
    rarityText: 'ĐẶC BIỆT',
    count: 5,
    category: 'SPECIAL',
    minLevel: 12,
    requiredLocation: 'CAVE'
  },
  {
    id: 'bait_special_2',
    name: 'Mồi giả cơ khí',
    description: 'Mồi công nghệ cao với chuyển động cực kỳ bắt mắt.',
    price: 25000,
    attraction: 450,
    rarityBoost: 4.5,
    rarityText: 'ĐẶC BIỆT',
    count: 3,
    category: 'SPECIAL',
    minLevel: 20
  }
];

export const BAITS = [...NATURAL_BAITS, ...SEA_BAITS, ...SPECIAL_BAITS];

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
      description: 'Câu được tổng cộng 30 con cá.',
      target: 30,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 2000,
      rewardBaitId: 'bait_natural_1',
      rewardBaitCount: 15,
      type: 'CATCH_TOTAL'
    },
    {
      id: 'q_2',
      title: 'Thương Nhân Tài Ba',
      description: 'Kiếm được 20,000 vàng từ việc bán cá.',
      target: 20000,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 4000,
      type: 'EARN_GOLD'
    },
    {
      id: 'q_junk',
      title: 'Bảo Vệ Môi Trường',
      description: 'Câu được 8 món rác từ đại dương.',
      target: 8,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 1200,
      rewardBaitId: 'bait_free_1',
      rewardBaitCount: 30,
      type: 'CATCH_RARITY',
      rarityTarget: Rarity.JUNK
    },
    {
        id: 'q_golden',
        title: 'Ánh Kim Lấp Lánh',
        description: 'Câu được 1 con cá VÀNG (Golden).',
        target: 1,
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        rewardGold: 5000,
        rewardBaitId: 'bait_special_1',
        rewardBaitCount: 2,
        type: 'CATCH_GOLDEN'
    }
  ];

  // 4-6. Multiple Specific Fish Quests
  const locationNames: Record<string, string> = { POND: 'Ao Làng', OCEAN: 'Đại Dương', CAVE: 'Hang Tối' };
  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
  const selectedFish = shuffle(FISH_TYPES.filter(f => f.rarity !== Rarity.MYTHIC && !f.isChest)).slice(0, 3);
  
  selectedFish.forEach((f, index) => {
    const hint = f.allowedLocations ? ` (${locationNames[f.allowedLocations[0]]})` : '';
    quests.push({
      id: `q_fish_${index}`,
      title: `Thợ Săn: ${f.name}`,
      description: `Câu được 3 con ${f.name}.${hint}`,
      target: 3,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 2500,
      rewardBaitId: 'bait_natural_2',
      rewardBaitCount: 5,
      type: 'CATCH_SPECIFIC',
      fishTarget: f.name
    });
  });

  // 7-8. Location Specific Quests
  quests.push({
    id: 'q_ocean',
    title: 'Chinh Phục Đại Dương',
    description: 'Câu được 10 con cá tại Đại Dương.',
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 3500,
    rewardBaitId: 'bait_sea_2',
    rewardBaitCount: 5,
    type: 'LOCATION_CATCH',
    locationTarget: 'OCEAN'
  });

  quests.push({
    id: 'q_cave',
    title: 'Khám Phá Hang Tối',
    description: 'Câu được 10 con cá tại Hang Tối.',
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 5000,
    rewardBaitId: 'bait_special_1',
    rewardBaitCount: 5,
    type: 'LOCATION_CATCH',
    locationTarget: 'CAVE'
  });

  // 9. Elite Hunter
  quests.push({
    id: 'q_elite',
    title: 'Thợ Săn Tinh Anh',
    description: 'Câu được 5 con cá độ hiếm HIẾM trở lên.',
    target: 5,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 6000,
    rewardBaitId: 'bait_special_2',
    rewardBaitCount: 3,
    type: 'CATCH_RARITY',
    rarityTarget: Rarity.RARE
  });

  // 10. Epic Hunter
  quests.push({
    id: 'q_epic',
    title: 'Huyền Thoại Biển Khơi',
    description: 'Câu được 1 con cá độ hiếm SỬ THI trở lên.',
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 10000,
    rewardBaitId: 'bait_special_2',
    rewardBaitCount: 5,
    type: 'CATCH_RARITY',
    rarityTarget: Rarity.EPIC
  });

  // 11. Treasure Hunter (Small chance)
  if (Math.random() > 0.4) {
    quests.push({
      id: 'q_treasure',
      title: 'Kẻ Săn Kho Báu',
      description: 'Tìm thấy 1 Rương Kho Báu dưới đáy biển.',
      target: 1,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardGold: 12000,
      rewardBaitId: 'bait_special_2',
      rewardBaitCount: 2,
      type: 'CATCH_TREASURE'
    });
  }

  return quests;
};

export const LOCATION_DATA = {
  POND: { currentSpeed: 0, description: 'Ao làng yên bình. Thích hợp cho người mới.' },
  OCEAN: { currentSpeed: 0.0015, description: 'Biển khơi sóng dữ. Dòng chảy mạnh làm khó thợ câu.' },
  CAVE: { currentSpeed: 0.0008, description: 'Hang động huyền bí. Dòng chảy ngầm khó đoán.' }
};
