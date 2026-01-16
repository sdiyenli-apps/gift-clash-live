import { useCallback, useEffect, useRef } from 'react';
import { GiftEvent, TIKTOK_GIFTS, TikTokGift } from '@/types/game';

const FAKE_USERNAMES = [
  'xXGamerProXx', 'NightWolf_99', 'StreamQueen', 'GiftKing2024',
  'LuckyViewer', 'ChaosLover', 'SaveTheStreamer', 'BossSpawner',
  'DiamondHands', 'ChatWarrior', 'NeonNinja', 'PixelPunk',
  'CryptoKitty', 'MoonWalker', 'StarDust_X', 'VibeMaster',
  'SkullCrusher', 'DragonSlayer', 'CosmicKid', 'RetroGamer',
];

export const useTikTokSimulator = (
  isActive: boolean,
  onGift: (event: GiftEvent) => void,
  intensity: 'low' | 'medium' | 'high' = 'medium'
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomGift = useCallback((): TikTokGift => {
    const gifts = Object.values(TIKTOK_GIFTS);
    const weights = {
      low: [0.7, 0.2, 0.1], // 70% small, 20% medium, 10% large
      medium: [0.5, 0.35, 0.15],
      high: [0.3, 0.4, 0.3],
    };
    
    const w = weights[intensity];
    const rand = Math.random();
    
    let tier: 'small' | 'medium' | 'large' = 'small';
    if (rand > w[0] + w[1]) tier = 'large';
    else if (rand > w[0]) tier = 'medium';
    
    const tierGifts = gifts.filter(g => g.tier === tier);
    return tierGifts[Math.floor(Math.random() * tierGifts.length)];
  }, [intensity]);

  const simulateGift = useCallback(() => {
    const gift = getRandomGift();
    const username = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    
    const event: GiftEvent = {
      id: `gift-${Date.now()}-${Math.random()}`,
      gift,
      username,
      timestamp: Date.now(),
      action: 'heal', // Will be determined by game state
    };
    
    onGift(event);
  }, [getRandomGift, onGift]);

  const triggerGift = useCallback((giftId: string, username: string = 'TestUser') => {
    const gift = TIKTOK_GIFTS[giftId];
    if (!gift) return;
    
    const event: GiftEvent = {
      id: `gift-${Date.now()}-${Math.random()}`,
      gift,
      username,
      timestamp: Date.now(),
      action: 'heal',
    };
    
    onGift(event);
  }, [onGift]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervals = {
      low: 8000,
      medium: 4000,
      high: 2000,
    };

    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance each interval
        simulateGift();
      }
    }, intervals[intensity]);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, intensity, simulateGift]);

  return { triggerGift, simulateGift };
};
