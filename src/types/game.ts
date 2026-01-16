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
  | 'move_forward'
  | 'jump'
  | 'shoot'
  | 'double_jump'
  | 'mega_shot'
  | 'heal'
  | 'shield'
  | 'spawn_enemy'
  | 'ultra_mode'
  | 'nuke'
  | 'speed_boost';

export interface GiftActionConfig {
  action: GiftAction;
  name: string;
  description: string;
  effect: 'help' | 'sabotage' | 'chaos';
  value: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  damage: number;
  type: 'normal' | 'mega' | 'ultra';
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  type: 'robot' | 'drone' | 'mech' | 'boss';
  isDying: boolean;
  deathTimer: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'spike' | 'gap' | 'wall';
}

export interface Player {
  health: number;
  maxHealth: number;
  shield: number;
  x: number;
  y: number;
  velocityY: number;
  isGrounded: boolean;
  isJumping: boolean;
  isShooting: boolean;
  facingRight: boolean;
  speedMultiplier: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
  life: number;
  type: 'spark' | 'explosion' | 'muzzle' | 'death' | 'ultra';
}

export interface SpeechBubble {
  id: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  phase: 'waiting' | 'playing' | 'gameover' | 'victory';
  score: number;
  distance: number;
  levelLength: number;
  cameraX: number;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  obstacles: Obstacle[];
  particles: Particle[];
  speechBubble: SpeechBubble | null;
  isUltraMode: boolean;
  ultraModeTimer: number;
  isFrozen: boolean;
  combo: number;
  comboTimer: number;
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
    { action: 'move_forward', name: 'Move Forward', description: 'Walk forward', effect: 'help', value: 80 },
    { action: 'jump', name: 'Jump!', description: 'Jump over obstacles', effect: 'help', value: 1 },
    { action: 'shoot', name: 'Fire!', description: 'Shoot the cyber gun', effect: 'help', value: 20 },
  ],
  medium: [
    { action: 'double_jump', name: 'Double Jump', description: 'Jump extra high!', effect: 'help', value: 2 },
    { action: 'mega_shot', name: 'Mega Blast', description: 'Powerful shot!', effect: 'help', value: 50 },
    { action: 'heal', name: 'Heal Up', description: '+30 HP', effect: 'help', value: 30 },
    { action: 'spawn_enemy', name: 'Spawn Robot!', description: 'Add an enemy!', effect: 'sabotage', value: 1 },
  ],
  large: [
    { action: 'ultra_mode', name: 'ULTRA MODE! 🔥', description: '6s of auto-play madness!', effect: 'help', value: 6 },
    { action: 'nuke', name: 'Nuke \'em All', description: 'Clear all enemies!', effect: 'help', value: 0 },
    { action: 'shield', name: 'God Shield', description: 'Invincible shield!', effect: 'help', value: 100 },
  ],
};

export const HERO_QUIPS = [
  "Is that all you got, tin cans?!",
  "My nose detects danger... and victory!",
  "Time to make scrap metal!",
  "Princess, here I come!",
  "Beep boop THIS, robot!",
  "I've blown up bigger toasters!",
  "Who needs a hero when you've got THIS nose?!",
  "That's gonna leave a dent!",
  "Robot parts... everywhere!",
  "I'm just warming up!",
  "My grandma hits harder than you!",
  "Hasta la vista, metal-head!",
  "Keep 'em coming!",
  "Gift me strength, chat!",
  "This nose knows how to fight!",
];

export const ENEMY_DEATH_SOUNDS = [
  "BZZT-CRASH!",
  "KRRZZT!",
  "CLUNK-BOOM!",
  "SPARKS!",
  "SYSTEM... FAIL...",
  "ERROR 404!",
  "MALFUNCTION!",
];
