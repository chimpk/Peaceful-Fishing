
import { Rarity, FishType, RodType, BaitType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const FISH_TYPES: FishType[] = [
  { name: 'Giày Cũ', rarity: Rarity.JUNK, value: 5, tension: 5, color: '#78350f', size: 18, weight: 100 },
  { name: 'Lon Thiếc', rarity: Rarity.JUNK, value: 10, tension: 8, color: '#94a3b8', size: 14, weight: 100 },
  { name: 'Cá Rô', rarity: Rarity.COMMON, value: 25, tension: 15, color: '#4ade80', size: 18, weight: 150 },
  { name: 'Cá Chép', rarity: Rarity.COMMON, value: 35, tension: 20, color: '#86efac', size: 22, weight: 150 },
  { name: 'Cá Trê', rarity: Rarity.UNCOMMON, value: 60, tension: 30, color: '#4b5563', size: 24, weight: 80 },
  { name: 'Cá Thu', rarity: Rarity.RARE, value: 150, tension: 45, color: '#60a5fa', size: 28, weight: 40 },
  { name: 'Cá Hồi', rarity: Rarity.RARE, value: 200, tension: 55, color: '#f87171', size: 32, weight: 40 },
  { name: 'Cá Ngừ Đại Dương', rarity: Rarity.EPIC, value: 500, tension: 65, color: '#312e81', size: 36, weight: 15 },
  { name: 'Cá Kiếm Bạc', rarity: Rarity.LEGENDARY, value: 1500, tension: 85, color: '#e2e8f0', size: 44, weight: 5 },
  { name: 'Long Ngư Phượng Hoàng', rarity: Rarity.MYTHIC, value: 10000, tension: 96, color: '#ef4444', size: 65, weight: 1 },
];

export const RODS: RodType[] = [
  { 
    id: 'rod_1', 
    name: 'Cần Tre Cơ Bản', 
    description: 'Dành cho người mới bắt đầu. Độ bền thấp.',
    price: 2500, 
    lineStrength: 1, 
    control: 1, 
    rarityText: 'PHỔ THÔNG' 
  },
  { 
    id: 'rod_2', 
    name: 'Cần Carbon', 
    description: 'Nhẹ và linh hoạt. Giúp kiểm soát dây câu tốt hơn.',
    price: 8000, 
    lineStrength: 1.8, 
    control: 1.3, 
    rarityText: 'HIẾM' 
  },
  { 
    id: 'rod_3', 
    name: 'Cần Thép Titan', 
    description: 'Cực kỳ chắc chắn. Phù hợp để câu cá nặng.',
    price: 15000, 
    lineStrength: 2.8, 
    control: 1.6, 
    rarityText: 'SỬ THI' 
  },
  { 
    id: 'rod_4', 
    name: 'Cần Thần Thoại', 
    description: 'Sức mạnh từ các vị thần. Không loài cá nào có thể thoát.',
    price: 50000, 
    lineStrength: 4.5, 
    control: 2.2, 
    rarityText: 'HUYỀN THOẠI', 
    isLocked: true 
  },
];

export const BAITS: BaitType[] = [
  { 
    id: 'bait_1', 
    name: 'Trùn Đất', 
    description: 'Mồi phổ biến nhất. Thu hút cá nhỏ.',
    price: 200, 
    attraction: 180, 
    rarityBoost: 1, 
    rarityText: 'CƠ BẢN', 
    count: 10,
    category: 'NATURAL'
  },
  { 
    id: 'bait_2', 
    name: 'Tôm Biển', 
    description: 'Đặc sản biển sâu. Thu hút nhiều loài cá hiếm.',
    price: 500, 
    attraction: 300, 
    rarityBoost: 2.5, 
    rarityText: 'NÂNG CAO', 
    count: 10,
    category: 'NATURAL'
  },
  { 
    id: 'bait_3', 
    name: 'Mồi Giả Thần Kỳ', 
    description: 'Phát ra ánh sáng huyền bí. Chỉ dành cho thợ câu huyền thoại.',
    price: 2000, 
    attraction: 500, 
    rarityBoost: 6, 
    rarityText: 'Huyền Thoại', 
    count: 5,
    category: 'NATURAL'
  },
];

export const REEL_BAR_HEIGHT = 350;
