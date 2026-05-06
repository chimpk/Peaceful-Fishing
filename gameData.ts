
import { Rarity, FishType, RodType, BaitType, Achievement, Quest } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const REEL_BAR_HEIGHT = 350;

export const WEATHER_BONUSES = {
  sunny: { attraction: 1.0, rarity: 1.0, speed: 1.0 },
  rainy: { attraction: 1.3, rarity: 0.8, speed: 1.2 },
  stormy: { attraction: 0.7, rarity: 2.5, speed: 1.8 }
};

export const FISH_TYPES: FishType[] = [
  // --- RÁC (JUNK) ---
  { name: 'Giày Cũ', rarity: Rarity.JUNK, value: 5, tension: 5, color: '#78350f', size: 18, weight: 100 },
  { name: 'Lon Thiếc', rarity: Rarity.JUNK, value: 10, tension: 8, color: '#94a3b8', size: 14, weight: 100 },
  { name: 'Túi Nilon', rarity: Rarity.JUNK, value: 2, tension: 3, color: '#e2e8f0', size: 20, weight: 100 },
  { name: 'Vỏ Chai', rarity: Rarity.JUNK, value: 8, tension: 6, color: '#60a5fa', size: 12, weight: 100 },
  { name: 'Tảo Biển Mục', rarity: Rarity.JUNK, value: 12, tension: 10, color: '#166534', size: 25, weight: 80, allowedLocations: ['OCEAN'] },

  // --- PHỔ THÔNG (COMMON) ---
  { name: 'Cá Rô Đồng', rarity: Rarity.COMMON, value: 25, tension: 15, color: '#4ade80', size: 18, weight: 150, allowedLocations: ['POND'] },
  { name: 'Cá Chép', rarity: Rarity.COMMON, value: 35, tension: 20, color: '#f59e0b', size: 22, weight: 150, allowedLocations: ['POND'] },
  { name: 'Cá Diếc', rarity: Rarity.COMMON, value: 30, tension: 18, color: '#94a3b8', size: 16, weight: 140, allowedLocations: ['POND'] },
  { name: 'Cá Mè', rarity: Rarity.COMMON, value: 40, tension: 22, color: '#cbd5e1', size: 24, weight: 130, allowedLocations: ['POND'] },
  { name: 'Cá Bống', rarity: Rarity.COMMON, value: 20, tension: 12, color: '#78350f', size: 14, weight: 160, allowedLocations: ['POND'] },

  // --- KHÔNG PHỔ BIẾN (UNCOMMON) ---
  { name: 'Cá Trê', rarity: Rarity.UNCOMMON, value: 60, tension: 30, color: '#4b5563', size: 24, weight: 80, allowedLocations: ['POND', 'CAVE'], allowedTimes: ['SUNSET', 'NIGHT'] },
  { name: 'Cá Lóc', rarity: Rarity.UNCOMMON, value: 75, tension: 35, color: '#1e293b', size: 26, weight: 75, allowedLocations: ['POND'] },
  { name: 'Cá Chim', rarity: Rarity.UNCOMMON, value: 80, tension: 32, color: '#e2e8f0', size: 28, weight: 70, allowedLocations: ['OCEAN'] },
  { name: 'Cá Rô Phi', rarity: Rarity.UNCOMMON, value: 55, tension: 28, color: '#64748b', size: 22, weight: 85, allowedLocations: ['POND'] },
  { name: 'Cá Đuối Nhỏ', rarity: Rarity.UNCOMMON, value: 90, tension: 40, color: '#475569', size: 30, weight: 60, allowedLocations: ['OCEAN'] },

  // --- HIẾM (RARE) ---
  { name: 'Cá Thu', rarity: Rarity.RARE, value: 150, tension: 45, color: '#60a5fa', size: 28, weight: 40, allowedLocations: ['OCEAN'] },
  { name: 'Cá Hồi', rarity: Rarity.RARE, value: 200, tension: 55, color: '#f87171', size: 32, weight: 40, allowedLocations: ['POND', 'OCEAN'] },
  { name: 'Cá Hề (Nemo)', rarity: Rarity.RARE, value: 300, tension: 35, color: '#fb923c', size: 16, weight: 35, allowedLocations: ['OCEAN'], allowedTimes: ['DAY', 'SUNSET'] },
  { name: 'Cá Ngựa', rarity: Rarity.RARE, value: 350, tension: 40, color: '#facc15', size: 18, weight: 30, allowedLocations: ['OCEAN'] },
  { name: 'Cá Mập Con', rarity: Rarity.RARE, value: 450, tension: 65, color: '#94a3b8', size: 35, weight: 25, allowedLocations: ['OCEAN'] },

  // --- SỬ THI (EPIC) ---
  { name: 'Cá Ngừ Đại Dương', rarity: Rarity.EPIC, value: 800, tension: 70, color: '#312e81', size: 36, weight: 15, allowedLocations: ['OCEAN'] },
  { name: 'Cá Nhám Búa', rarity: Rarity.EPIC, value: 1200, tension: 80, color: '#1e1b4b', size: 45, weight: 12, allowedLocations: ['OCEAN'] },
  { name: 'Cá Mặt Trăng', rarity: Rarity.EPIC, value: 1500, tension: 60, color: '#cbd5e1', size: 55, weight: 10, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT'] },
  { name: 'Cá Heo', rarity: Rarity.EPIC, value: 2000, tension: 65, color: '#38bdf8', size: 40, weight: 8, allowedLocations: ['OCEAN'] },
  { name: 'Cá Mập Cáo', rarity: Rarity.EPIC, value: 1800, tension: 75, color: '#475569', size: 42, weight: 10, allowedLocations: ['CAVE'], allowedTimes: ['NIGHT'] },

  // --- HUYỀN THOẠI (LEGENDARY) ---
  { name: 'Cá Kiếm Bạc', rarity: Rarity.LEGENDARY, value: 5000, tension: 90, color: '#e2e8f0', size: 50, weight: 5, allowedLocations: ['OCEAN'] },
  { name: 'Cá Mập Trắng', rarity: Rarity.LEGENDARY, value: 7500, tension: 94, color: '#94a3b8', size: 65, weight: 4, allowedLocations: ['OCEAN'] },
  { name: 'Cá Rồng Vàng', rarity: Rarity.LEGENDARY, value: 10000, tension: 88, color: '#fbbf24', size: 45, weight: 3, allowedLocations: ['POND'] },
  { name: 'Cá Voi Xanh Con', rarity: Rarity.LEGENDARY, value: 12000, tension: 92, color: '#1d4ed8', size: 70, weight: 2, allowedLocations: ['OCEAN'] },

  // --- THẦN THOẠI (MYTHIC) ---
  { name: 'Long Ngư Phượng Hoàng', rarity: Rarity.MYTHIC, value: 30000, tension: 97, color: '#ef4444', size: 75, weight: 1, allowedLocations: ['CAVE'] },
  { name: 'Hải Long Vương', rarity: Rarity.MYTHIC, value: 50000, tension: 99, color: '#3b82f6', size: 90, weight: 0.5, allowedLocations: ['OCEAN'], allowedTimes: ['NIGHT', 'SUNSET'] },
  { name: 'Kraken Con', rarity: Rarity.MYTHIC, value: 75000, tension: 98, color: '#7e22ce', size: 100, weight: 0.3, allowedLocations: ['CAVE'] },
  { name: 'Leviathan Thần Thánh', rarity: Rarity.MYTHIC, value: 100000, tension: 99, color: '#10b981', size: 120, weight: 0.1, allowedLocations: ['CAVE'] },
];

export const RODS: RodType[] = [
  { 
    id: 'rod_1', 
    name: 'Cần Tre Cơ Bản', 
    description: 'Dành cho người mới bắt đầu. Độ bền thấp.',
    price: 0, 
    lineStrength: 1, 
    control: 1, 
    maxValue: 300,
    rarityText: 'PHỔ THÔNG' 
  },
  { 
    id: 'rod_2', 
    name: 'Cần Carbon', 
    description: 'Nhẹ và linh hoạt. Giúp kiểm soát dây câu tốt hơn.',
    price: 8000, 
    lineStrength: 1.8, 
    control: 1.3, 
    maxValue: 1000,
    rarityText: 'HIẾM' 
  },
  { 
    id: 'rod_3', 
    name: 'Cần Thép Titan', 
    description: 'Cực kỳ chắc chắn. Phù hợp để câu cá nặng.',
    price: 15000, 
    lineStrength: 2.8, 
    control: 1.6, 
    maxValue: 5000,
    rarityText: 'SỬ THI' 
  },
  { 
    id: 'rod_4', 
    name: 'Cần Thần Thoại', 
    description: 'Sức mạnh từ các vị thần. Không loài cá nào có thể thoát.',
    price: 50000, 
    lineStrength: 4.5, 
    control: 2.2, 
    maxValue: 50000,
    rarityText: 'HUYỀN THOẠI', 
    isLocked: true 
  },
];

export const BAITS: BaitType[] = [
  {
    id: 'bait_1',
    name: 'Thẻo số 1',
    description: 'Dành cho cá nhỏ. Tốt nhất cho cá dưới 301 vàng.',
    price: 500,
    attraction: 180,
    rarityBoost: 0.8,
    maxValue: 300,
    rarityText: 'CƠ BẢN',
    count: 1
  },
  {
    id: 'bait_2',
    name: 'Thẻo số 2',
    description: 'Câu được cá dưới 1001 vàng. Tăng sức bền so với thẻo 1.',
    price: 1000,
    attraction: 200,
    rarityBoost: 1.2,
    maxValue: 1000,
    rarityText: 'NÂNG CAO',
    count: 0
  },
  {
    id: 'bait_3',
    name: 'Thẻo số 3',
    description: 'Dùng cho cá dưới 5001 vàng. Phù hợp với nhiều loài cá vừa.',
    price: 5000,
    attraction: 240,
    rarityBoost: 1.8,
    maxValue: 5000,
    rarityText: 'CHUYÊN NGHIỆP',
    count: 0
  },
  {
    id: 'bait_4',
    name: 'Thẻo số 4',
    description: 'Cho cá dưới 10001 vàng. Tuyệt vời khi câu cá lớn.',
    price: 10000,
    attraction: 280,
    rarityBoost: 2.5,
    maxValue: 10000,
    rarityText: 'CAO CẤP',
    count: 0
  },
  {
    id: 'bait_5',
    name: 'Thẻo số 5',
    description: 'Dây câu mạnh mẽ, phù hợp cá dưới 50001 vàng.',
    price: 20000,
    attraction: 320,
    rarityBoost: 3.5,
    maxValue: 50000,
    rarityText: 'CỰC HẠNG',
    count: 0
  },
];

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
      rewardBaitId: 'bait_1',
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

  // Random specific fish quest from Common to Rare pool
  const validFishForQuests = FISH_TYPES.filter(f => f.rarity === Rarity.COMMON || f.rarity === Rarity.UNCOMMON || f.rarity === Rarity.RARE);
  const targetFish = validFishForQuests[Math.floor(Math.random() * validFishForQuests.length)];

  quests.push({
    id: 'q_3',
    title: `Thử Thách: ${targetFish.name}`,
    description: `Câu được 3 con ${targetFish.name}.`,
    target: 3,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    rewardGold: 2000,
    rewardBaitId: 'bait_2',
    rewardBaitCount: 3,
    type: 'CATCH_SPECIFIC',
    fishTarget: targetFish.name
  });

  return quests;
};
