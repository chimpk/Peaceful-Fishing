import { useState, useCallback } from 'react';
import React from 'react';
import { RodType, TackleType, BaitType, FishType, NotificationType } from '../types';
import { RODS, TACKLES, BAITS } from '../core/data/gameData';
import { soundManager } from '../core/systems/soundManager';

export const useGameSettings = (gold: number, setGold: React.Dispatch<React.SetStateAction<number>>, addNotification: (message: string, type?: NotificationType) => void) => {
  const [currentRod, setCurrentRod] = useState<RodType>(RODS[0]);
  const [currentTackle, setCurrentTackle] = useState<TackleType>(TACKLES[0]);
  const [currentBait, setCurrentBait] = useState<BaitType>(BAITS[0]);
  const [ownedRods, setOwnedRods] = useState<string[]>(['rod_1']);
  const [ownedTackles, setOwnedTackles] = useState<string[]>(['tackle_1']);
  const [baitCounts, setBaitCounts] = useState<Record<string, number>>({ 'bait_natural_1': 10 });
  const [liveBait, setLiveBait] = useState<FishType | null>(null);

  // Persistent Durability Mapping
  const [rodDurabilities, setRodDurabilities] = useState<Record<string, number>>({ 'rod_1': RODS[0].maxDurability || 100 });
  const [tackleDurabilities, setTackleDurabilities] = useState<Record<string, number>>({ 'tackle_1': TACKLES[0].maxDurability || 30 });

  const handleDurabilityChange = useCallback((type: 'rod' | 'tackle', amount: number) => {
    if (type === 'rod') {
        setCurrentRod(prev => {
            const nextDur = Math.max(0, (prev.durability || 100) - amount);
            if (nextDur <= 0 && prev.durability! > 0) {
                addNotification(`Cần câu ${prev.name} đã hỏng! Hãy đi sửa chữa.`, 'warning');
            }
            setRodDurabilities(d => ({ ...d, [prev.id]: nextDur }));
            return { ...prev, durability: nextDur };
        });
    } else {
        setCurrentTackle(prev => {
            const nextDur = Math.max(0, (prev.durability || 30) - amount);
            if (nextDur <= 0 && prev.durability! > 0) {
                addNotification(`Thẻo ${prev.name} đã hỏng! Hãy đi sửa chữa.`, 'warning');
            }
            setTackleDurabilities(d => ({ ...d, [prev.id]: nextDur }));
            return { ...prev, durability: nextDur };
        });
    }
  }, [addNotification]);

  const handleRepair = useCallback((type: 'rod' | 'tackle') => {
    if (type === 'rod') {
        const cost = Math.floor((currentRod.maxDurability! - currentRod.durability!) * 5);
        if (gold >= cost) {
            setGold(prev => prev - cost);
            const nextRod = { ...currentRod, durability: currentRod.maxDurability };
            setCurrentRod(nextRod);
            setRodDurabilities(d => ({ ...d, [currentRod.id]: currentRod.maxDurability || 100 }));
            addNotification(`Đã sửa cần câu hết ${cost} vàng.`, 'success');
            soundManager.playPurchase();
        } else {
            addNotification(`Không đủ vàng để sửa chữa (Cần ${cost} vàng).`, 'warning');
            soundManager.playError();
        }
    } else {
        const cost = Math.floor((currentTackle.maxDurability! - currentTackle.durability!) * 10);
        if (gold >= cost) {
            setGold(prev => prev - cost);
            const nextTackle = { ...currentTackle, durability: currentTackle.maxDurability };
            setCurrentTackle(nextTackle);
            setTackleDurabilities(d => ({ ...d, [currentTackle.id]: currentTackle.maxDurability || 30 }));
            addNotification(`Đã sửa thẻo hết ${cost} vàng.`, 'success');
            soundManager.playPurchase();
        } else {
            addNotification(`Không đủ vàng để sửa chữa (Cần ${cost} vàng).`, 'warning');
            soundManager.playError();
        }
    }
  }, [gold, currentRod, currentTackle, addNotification, setGold]);

  const handleSelect = useCallback((item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => {
    soundManager.playClick();
    if (type === 'rod') {
      const rod = item as RodType;
      // Pull durability from persistence map
      setCurrentRod(prev => ({ 
        ...rod, 
        durability: rodDurabilities[rod.id] ?? rod.maxDurability ?? 100 
      }));
    } else if (type === 'tackle') {
      const tackle = item as TackleType;
      setCurrentTackle(prev => ({ 
        ...tackle, 
        durability: tackleDurabilities[tackle.id] ?? tackle.maxDurability ?? 30 
      }));
    } else {
      setCurrentBait(item as BaitType);
    }
  }, [rodDurabilities, tackleDurabilities]);

  const buyItem = useCallback((item: RodType | TackleType | BaitType, type: 'rod' | 'tackle' | 'bait') => {
    if (gold >= item.price) {
      setGold(prev => prev - item.price);
      if (type === 'rod') {
        const rod = item as RodType;
        const newDur = rod.maxDurability || 100;
        setOwnedRods(prev => [...prev, rod.id]);
        setRodDurabilities(d => ({ ...d, [rod.id]: newDur }));
        setCurrentRod({ ...rod, durability: newDur });
      } else if (type === 'tackle') {
        const tackle = item as TackleType;
        const newDur = tackle.maxDurability || 30;
        setOwnedTackles(prev => [...prev, tackle.id]);
        setTackleDurabilities(d => ({ ...d, [tackle.id]: newDur }));
        setCurrentTackle({ ...tackle, durability: newDur });
      } else {
        const bait = item as BaitType;
        const addCount = bait.count || 10;
        setBaitCounts(prev => ({
          ...prev,
          [bait.id]: (prev[bait.id] || 0) + addCount
        }));
        setCurrentBait(bait); 
      }
      addNotification(`Đã mua ${item.name}!`, 'success');
      soundManager.playPurchase();
    } else {
      addNotification('Không đủ tiền!', 'warning');
      soundManager.playError();
    }
  }, [gold, setGold, addNotification]);

  const handleCast = useCallback(() => {
    if (liveBait) return; 

    setBaitCounts(prev => {
      const currentCount = prev[currentBait.id] || 0;
      if (currentCount <= 0) return prev;
      return { ...prev, [currentBait.id]: currentCount - 1 };
    });
  }, [currentBait.id, liveBait]);

  return {
    currentRod, setCurrentRod,
    currentTackle, setCurrentTackle,
    currentBait, setCurrentBait,
    ownedRods, setOwnedRods,
    ownedTackles, setOwnedTackles,
    baitCounts, setBaitCounts,
    liveBait, setLiveBait,
    handleDurabilityChange,
    handleRepair,
    handleSelect,
    buyItem,
    handleCast
  };
};
