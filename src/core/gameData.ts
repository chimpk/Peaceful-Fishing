
import { Rarity, FishType, RodType, TackleType, BaitType, Achievement, Quest, FishBehavior } from './types';

export const CANVAS_WIDTH = 1100;
export const CANVAS_HEIGHT = 650;
export const REEL_BAR_HEIGHT = 350;

export const WEATHER_BONUSES = {
  sunny: { attraction: 1.0, rarity: 1.0, speed: 1.0, tension: 1.0, label: 'Trời Đẹp: Chỉ số cơ bản' },
  rainy: { attraction: 1.4, rarity: 0.8, speed: 1.2, tension: 1.0, label: 'Trời Mưa: +40% Cá cắn câu, +20% Tốc độ cá, -20% Độ hiếm' },
  stormy: { attraction: 0.7, rarity: 3.5, speed: 2.0, tension: 1.45, label: 'Bão Lớn: x3.5 Độ hiếm, x2.0 Tốc độ cá, +45% Căng dây. CẢNH BÁO: Sét đánh có thể gây mất kiểm soát cần câu!' },
  foggy: { attraction: 1.6, rarity: 1.5, speed: 0.8, tension: 1.15, label: 'Sương Mù: ++Thu hút cá, +50% Độ hiếm, Cá bơi chậm nhưng khó kéo hơn!' },
  meteor_shower: { attraction: 1.2, rarity: 2.0, speed: 1.0, tension: 1.0, label: 'Mưa Sao Băng: x2 Độ hiếm, x2 Vàng nhận được. Điều ước sắp thành hiện thực!' },
  rainbow: { attraction: 2.0, rarity: 2.5, speed: 0.9, tension: 0.8, label: 'Cầu Vồng: ++Cá cắn câu, ++Độ hiếm, Giảm căng dây. May mắn ngập tràn!' },
  aurora: { attraction: 1.5, rarity: 4.0, speed: 1.1, tension: 1.2, label: 'Cực Quang: x4 Độ hiếm. Vẻ đẹp huyền bí của đại dương!' }
};

export const CHEST_TYPES: FishType[] = [
  { name: 'Rương Gỗ Cổ', rarity: Rarity.COMMON, value: 150, tension: 45, color: '#78350f', size: 30, weight: 10, isChest: true },
  { name: 'Rương Bạc Nạm Ngọc', rarity: Rarity.RARE, value: 500, tension: 70, color: '#94a3b8', size: 35, weight: 5, isChest: true },
  { name: 'Rương Vàng Hoàng Gia', rarity: Rarity.LEGENDARY, value: 2000, tension: 110, color: '#fbbf24', size: 40, weight: 2, isChest: true }
];

export const FISH_TYPES: FishType[] = [
  // --- RÁC (JUNK) ---
  { name: 'Giày Cũ', rarity: Rarity.JUNK, value: 5, tension: 5, color: '#78350f', size: 18, weight: 100 },
  { name: 'Lon Thiếc', rarity: Rarity.JUNK, value: 10, tension: 8, color: '#94a3b8', size: 14, weight: 100 },
  { name: 'Túi Nilon', rarity: Rarity.JUNK, value: 2, tension: 3, color: '#e2e8f0', size: 20, weight: 100 },
  { name: 'Vỏ Chai', rarity: Rarity.JUNK, value: 8, tension: 6, color: '#60a5fa', size: 12, weight: 100 },
  { name: 'Tảo Biển Mục', rarity: Rarity.JUNK, value: 12, tension: 10, color: '#166534', size: 25, weight: 80, allowedLocations: ['OCEAN'] },

  // --- PHỔ THÔNG (COMMON) ---
  { name: 'Cá Rô Đồng', rarity: Rarity.COMMON, value: 25, tension: 15, color: '#4ade80', size: 18, weight: 150, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1', 'bait_natural_2'] },
  { name: 'Cá Chép', rarity: Rarity.COMMON, value: 35, tension: 20, color: '#f59e0b', size: 22, weight: 150, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1', 'bait_natural_2', 'bait_natural_3'] },
  { name: 'Cá Diếc', rarity: Rarity.COMMON, value: 30, tension: 18, color: '#94a3b8', size: 16, weight: 140, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1'] },
  { name: 'Cá Mè', rarity: Rarity.COMMON, value: 40, tension: 22, color: '#cbd5e1', size: 24, weight: 130, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1'] },
  { name: 'Cá Bống', rarity: Rarity.COMMON, value: 20, tension: 12, color: '#78350f', size: 14, weight: 160, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1'] },
  { name: 'Cá Trôi', rarity: Rarity.COMMON, value: 32, tension: 19, color: '#94a3b8', size: 20, weight: 145, allowedLocations: ['POND'] },
  { name: 'Cá Đuối Cát', rarity: Rarity.COMMON, value: 45, tension: 25, color: '#d1d5db', size: 28, weight: 120, allowedLocations: ['OCEAN'] },
  { name: 'Cá Cơm', rarity: Rarity.COMMON, value: 15, tension: 10, color: '#e2e8f0', size: 10, weight: 180, allowedLocations: ['OCEAN'] },
  { name: 'Cá Mù Hang Động', rarity: Rarity.COMMON, value: 65, tension: 28, color: '#cbd5e1', size: 18, weight: 140, allowedLocations: ['CAVE'] },
  { name: 'Nòng Nọc Đột Biến', rarity: Rarity.COMMON, value: 45, tension: 25, color: '#166534', size: 15, weight: 120, allowedLocations: ['CAVE'] },

  // --- KHÔNG PHỔ BIẾN (UNCOMMON) ---
  { name: 'Cá Trê', rarity: Rarity.UNCOMMON, value: 60, tension: 30, color: '#4b5563', size: 24, weight: 80, allowedLocations: ['POND'], allowedTimes: ['SUNSET', 'NIGHT'], preferredBaits: ['bait_natural_1'] },
  { name: 'Cá Lóc', rarity: Rarity.UNCOMMON, value: 120, tension: 35, color: '#1e293b', size: 26, weight: 75, allowedLocations: ['POND'], preferredBaits: ['bait_natural_4'] },
  { name: 'Cá Chim', rarity: Rarity.UNCOMMON, value: 80, tension: 32, color: '#e2e8f0', size: 28, weight: 70, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  { name: 'Cá Rô Phi', rarity: Rarity.UNCOMMON, value: 55, tension: 28, color: '#64748b', size: 22, weight: 85, allowedLocations: ['POND'], preferredBaits: ['bait_natural_1', 'bait_natural_2'] },
  { name: 'Cá Lăng', rarity: Rarity.UNCOMMON, value: 150, tension: 40, color: '#475569', size: 30, weight: 60, allowedLocations: ['POND'], preferredBaits: ['bait_natural_2'] },
  { name: 'Cá Nóc Hổ', rarity: Rarity.UNCOMMON, value: 180, tension: 42, color: '#fcd34d', size: 20, weight: 55, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE },
  { name: 'Cá Bay', rarity: Rarity.UNCOMMON, value: 200, tension: 38, color: '#60a5fa', size: 18, weight: 50, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER },
  { name: 'Cá Đèn Lồng', rarity: Rarity.UNCOMMON, value: 220, tension: 48, color: '#020617', size: 25, weight: 65, allowedLocations: ['CAVE'] },
  { name: 'Bạch Tuộc Đốm', rarity: Rarity.UNCOMMON, value: 250, tension: 55, color: '#991b1b', size: 22, weight: 55, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE },
  { name: 'Lươn Hang Tối', rarity: Rarity.UNCOMMON, value: 200, tension: 50, color: '#451a03', size: 35, weight: 60, allowedLocations: ['CAVE'] },

  // --- HIẾM (RARE) ---
  { name: 'Cá Thu', rarity: Rarity.RARE, value: 350, tension: 45, color: '#60a5fa', size: 28, weight: 20, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'] },
  { name: 'Cá Trắm Đen', rarity: Rarity.RARE, value: 450, tension: 55, color: '#1e293b', size: 35, weight: 20, allowedLocations: ['POND'], preferredBaits: ['bait_natural_3'] },
  { name: 'Cá Hồi', rarity: Rarity.RARE, value: 400, tension: 55, color: '#f87171', size: 32, weight: 15, allowedLocations: ['POND', 'OCEAN'], behavior: FishBehavior.LEAPER },
  { name: 'Cá Ngựa', rarity: Rarity.RARE, value: 300, tension: 40, color: '#facc15', size: 18, weight: 15, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_1'] },
  { name: 'Cá Mập Con', rarity: Rarity.RARE, value: 650, tension: 65, color: '#94a3b8', size: 35, weight: 8, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, preferredBaits: ['bait_sea_3'] },
  { name: 'Cá Chình Điện', rarity: Rarity.RARE, value: 950, tension: 75, color: '#4338ca', size: 40, weight: 10, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE },
  { name: 'Cá Mao Tiên', rarity: Rarity.RARE, value: 750, tension: 62, color: '#ef4444', size: 30, weight: 12, allowedLocations: ['OCEAN'] },

  // --- SỬ THI (EPIC) ---
  { name: 'Cá Ngừ Đại Dương', rarity: Rarity.EPIC, value: 1200, tension: 70, color: '#312e81', size: 36, weight: 5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_2'], canBerserk: true },
  { name: 'Cá Nhám Búa', rarity: Rarity.EPIC, value: 2500, tension: 80, color: '#1e1b4b', size: 45, weight: 3, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  { name: 'Cá Mặt Trăng', rarity: Rarity.EPIC, value: 3500, tension: 60, color: '#cbd5e1', size: 55, weight: 2.5, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  { name: 'Cá Heo', rarity: Rarity.EPIC, value: 4500, tension: 65, color: '#38bdf8', size: 40, weight: 2, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  { name: 'Cá Rồng Huyết Long', rarity: Rarity.EPIC, value: 6000, tension: 75, color: '#991b1b', size: 45, weight: 1.5, allowedLocations: ['POND'], allowedTimes: ['SUNSET'], canBerserk: true },
  { name: 'Cá Buồm (Sailfish)', rarity: Rarity.EPIC, value: 7500, tension: 85, color: '#1e3a8a', size: 55, weight: 1.2, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, canBerserk: true },
  { name: 'Cá Sấu Mù', rarity: Rarity.EPIC, value: 8500, tension: 88, color: '#064e3b', size: 50, weight: 2, allowedLocations: ['CAVE'], behavior: FishBehavior.AGGRESSIVE, canBerserk: true },
  { name: 'Cua Khổng Lồ', rarity: Rarity.EPIC, value: 7000, tension: 85, color: '#b91c1c', size: 35, weight: 2.5, allowedLocations: ['CAVE'], canBerserk: true },

  // --- HUYỀN THOẠI (LEGENDARY) ---
  { name: 'Cá Kiếm Bạc', rarity: Rarity.LEGENDARY, value: 8000, tension: 90, color: '#e2e8f0', size: 50, weight: 0.8, allowedLocations: ['OCEAN'], behavior: FishBehavior.LEAPER, preferredBaits: ['bait_sea_3'], canBerserk: true },
  { name: 'Cá Mập Trắng', rarity: Rarity.LEGENDARY, value: 15000, tension: 94, color: '#94a3b8', size: 65, weight: 0.5, allowedLocations: ['OCEAN'], preferredBaits: ['bait_sea_3'], canBerserk: true },
  { name: 'Cá Rồng Vàng', rarity: Rarity.LEGENDARY, value: 20000, tension: 88, color: '#fbbf24', size: 45, weight: 0.4, allowedLocations: ['POND'], canBerserk: true },
  { name: 'Cá Voi Xanh Con', rarity: Rarity.LEGENDARY, value: 25000, tension: 92, color: '#1d4ed8', size: 70, weight: 0.3, allowedLocations: ['OCEAN'], canBerserk: true },
  { name: 'Cá Voi Sát Thủ', rarity: Rarity.LEGENDARY, value: 35000, tension: 96, color: '#020617', size: 85, weight: 0.2, allowedLocations: ['OCEAN'], behavior: FishBehavior.AGGRESSIVE, canBerserk: true },
  { name: 'Cá Vua (Oarfish)', rarity: Rarity.LEGENDARY, value: 45000, tension: 98, color: '#cbd5e1', size: 120, weight: 0.15, allowedLocations: ['CAVE'], allowedTimes: ['NIGHT'], canBerserk: true },

  // --- THẦN THOẠI (MYTHIC) ---
  { name: 'Long Ngư Phượng Hoàng', rarity: Rarity.MYTHIC, value: 55000, tension: 97, color: '#ef4444', size: 75, weight: 0.08, allowedLocations: ['CAVE'], canBerserk: true },
  { name: 'Hải Long Vương', rarity: Rarity.MYTHIC, value: 65000, tension: 99, color: '#3b82f6', size: 90, weight: 0.05, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT', 'SUNSET'], behavior: FishBehavior.AGGRESSIVE, canBerserk: true },
  { name: 'Kraken Con', rarity: Rarity.MYTHIC, value: 85000, tension: 99, color: '#7e22ce', size: 100, weight: 0.03, allowedLocations: ['CAVE'], canBerserk: true },
  { name: 'Leviathan Thần Thánh', rarity: Rarity.MYTHIC, value: 120000, tension: 99, color: '#10b981', size: 120, weight: 0.01, allowedLocations: ['CAVE'], canBerserk: true },
  { name: 'Cá Rồng Bạch Tạng', rarity: Rarity.MYTHIC, value: 150000, tension: 98, color: '#ffffff', size: 80, weight: 0.02, allowedLocations: ['POND'], allowedTimes: ['NIGHT'], canBerserk: true },
  { name: 'Hải Tượng Long', rarity: Rarity.MYTHIC, value: 200000, tension: 99, color: '#064e3b', size: 150, weight: 0.01, allowedLocations: ['POND'], behavior: FishBehavior.AGGRESSIVE, canBerserk: true },
];

export const RODS: RodType[] = [
  { 
    id: 'rod_1', 
    name: 'Cần Tre Cơ Bản', 
    description: 'Dành cho người mới bắt đầu. Chịu được cá dưới 300 vàng.',
    price: 0, 
    lineStrength: 1, 
    control: 1, 
    maxValue: 300,
    rarityText: 'PHỔ THÔNG',
    durability: 100,
    maxDurability: 100
  },
  { 
    id: 'rod_2', 
    name: 'Cần Carbon', 
    description: 'Nhẹ và linh hoạt. Chịu được cá dưới 1000 vàng.',
    price: 8000, 
    lineStrength: 1.8, 
    control: 1.3, 
    maxValue: 1000,
    rarityText: 'HIẾM',
    durability: 150,
    maxDurability: 150
  },
  { 
    id: 'rod_3', 
    name: 'Cần Thép Titan', 
    description: 'Cực kỳ chắc chắn. Chịu được cá dưới 5001 vàng.',
    price: 15000, 
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
    price: 50000, 
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
    description: 'Dành cho cá nhỏ. Tốt nhất cho cá dưới 301 vàng.',
    price: 500,
    attraction: 180,
    rarityBoost: 0.8,
    maxValue: 300,
    rarityText: 'CƠ BẢN',
    count: 1,
    durability: 30,
    maxDurability: 30
  },
  {
    id: 'tackle_2',
    name: 'Thẻo số 2',
    description: 'Câu được cá dưới 1001 vàng. Tăng sức bền so với thẻo 1.',
    price: 1000,
    attraction: 200,
    rarityBoost: 1.2,
    maxValue: 1000,
    rarityText: 'NÂNG CAO',
    count: 0,
    durability: 50,
    maxDurability: 50
  },
  {
    id: 'tackle_3',
    name: 'Thẻo số 3',
    description: 'Dùng cho cá dưới 5001 vàng. Phù hợp với nhiều loài cá vừa.',
    price: 5000,
    attraction: 240,
    rarityBoost: 1.8,
    maxValue: 5000,
    rarityText: 'CHUYÊN NGHIỆP',
    count: 0,
    durability: 80,
    maxDurability: 80
  },
  {
    id: 'tackle_4',
    name: 'Thẻo số 4',
    description: 'Cho cá dưới 10001 vàng. Tuyệt vời khi câu cá lớn.',
    price: 10000,
    attraction: 280,
    rarityBoost: 2.5,
    maxValue: 10000,
    rarityText: 'CAO CẤP',
    count: 0,
    durability: 120,
    maxDurability: 120
  },
  {
    id: 'tackle_5',
    name: 'Thẻo số 5',
    description: 'Dây câu mạnh mẽ, phù hợp cá dưới 50001 vàng.',
    price: 20000,
    attraction: 320,
    rarityBoost: 3.5,
    maxValue: 50000,
    rarityText: 'CỰC HẠNG',
    count: 0,
    durability: 200,
    maxDurability: 200
  },
];

export const NATURAL_BAITS: BaitType[] = [
  {
    id: 'bait_natural_1',
    name: 'Giun đất',
    description: 'Vua của các loại mồi tanh. Câu cá trê, rô phi, chép.',
    price: 10,
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
    price: 25,
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
    price: 15,
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
    price: 20,
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
    price: 10,
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
    price: 20,
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
    price: 50,
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
