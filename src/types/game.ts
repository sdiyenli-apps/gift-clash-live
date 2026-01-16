export type GiftTier = 'small' | 'medium' | 'large';

export interface TikTokGift {
  id: string;
  name: string;
  tier: GiftTier;
  diamonds: number;
  emoji: string;
}

export interface GiftEvent {
  id: string;
  gift: TikTokGift;
  username: string;
  avatar?: string;
  timestamp: number;
  action: GiftAction;
}

export type GiftAction = 
  | 'heal'
  | 'shield'
  | 'speed_boost'
  | 'spawn_obstacle'
  | 'freeze_time'
  | 'power_weapon'
  | 'revive'
  | 'spawn_enemies'
  | 'boss_spawn'
  | 'instant_save'
  | 'chaos_mode'
  | 'nuke';

export interface GiftActionConfig {
  action: GiftAction;
  name: string;
  description: string;
  effect: 'help' | 'sabotage' | 'chaos';
  value: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  type: 'basic' | 'fast' | 'tank' | 'boss';
}

export interface Player {
  health: number;
  maxHealth: number;
  shield: number;
  speedMultiplier: number;
  x: number;
  y: number;
}

export interface GameState {
  phase: 'waiting' | 'playing' | 'gameover' | 'victory';
  wave: number;
  score: number;
  timeRemaining: number;
  player: Player;
  enemies: Enemy[];
  isFrozen: boolean;
  isChaosMode: boolean;
}

export interface Gifter {
  username: string;
  avatar?: string;
  totalDiamonds: number;
  giftCount: number;
}

export const TIKTOK_GIFTS: Record<string, TikTokGift> = {
  rose: { id: 'rose', name: 'Rose', tier: 'small', diamonds: 1, emoji: '🌹' },
  ice_cream: { id: 'ice_cream', name: 'Ice Cream', tier: 'small', diamonds: 1, emoji: '🍦' },
  finger_heart: { id: 'finger_heart', name: 'Finger Heart', tier: 'small', diamonds: 5, emoji: '🫰' },
  doughnut: { id: 'doughnut', name: 'Doughnut', tier: 'small', diamonds: 30, emoji: '🍩' },
  cap: { id: 'cap', name: 'Cap', tier: 'medium', diamonds: 99, emoji: '🧢' },
  hand_hearts: { id: 'hand_hearts', name: 'Hand Hearts', tier: 'medium', diamonds: 100, emoji: '💗' },
  perfume: { id: 'perfume', name: 'Perfume', tier: 'medium', diamonds: 199, emoji: '💐' },
  galaxy: { id: 'galaxy', name: 'Galaxy', tier: 'large', diamonds: 1000, emoji: '🌌' },
  planet: { id: 'planet', name: 'Planet', tier: 'large', diamonds: 2000, emoji: '🪐' },
  universe: { id: 'universe', name: 'Universe', tier: 'large', diamonds: 5000, emoji: '✨' },
};

export const GIFT_ACTIONS: Record<GiftTier, GiftActionConfig[]> = {
  small: [
    { action: 'heal', name: 'Quick Heal', description: '+10 HP', effect: 'help', value: 10 },
    { action: 'speed_boost', name: 'Speed Boost', description: '2x speed for 5s', effect: 'help', value: 5 },
    { action: 'spawn_obstacle', name: 'Drop Barrier', description: 'Block enemies', effect: 'help', value: 1 },
  ],
  medium: [
    { action: 'shield', name: 'Energy Shield', description: '+30 shield', effect: 'help', value: 30 },
    { action: 'power_weapon', name: 'Power Up', description: '2x damage for 10s', effect: 'help', value: 10 },
    { action: 'freeze_time', name: 'Time Freeze', description: 'Freeze 5 seconds', effect: 'help', value: 5 },
    { action: 'spawn_enemies', name: 'Spawn Wave', description: 'Add 5 enemies!', effect: 'sabotage', value: 5 },
  ],
  large: [
    { action: 'revive', name: 'Full Revive', description: 'Full HP + Shield', effect: 'help', value: 100 },
    { action: 'nuke', name: 'Nuclear Strike', description: 'Kill all enemies', effect: 'help', value: 0 },
    { action: 'boss_spawn', name: 'Boss Summon', description: 'SPAWN A BOSS!', effect: 'sabotage', value: 1 },
    { action: 'chaos_mode', name: 'CHAOS MODE', description: 'Everything goes crazy!', effect: 'chaos', value: 15 },
  ],
};
