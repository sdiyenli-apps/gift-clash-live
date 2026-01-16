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
  | 'dash_forward'
  | 'jump'
  | 'shoot'
  | 'double_jump'
  | 'mega_shot'
  | 'heal'
  | 'shield'
  | 'spawn_enemy'
  | 'ultra_mode'
  | 'nuke'
  | 'speed_boost'
  | 'triple_shot'
  | 'time_slow';

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
  velocityY: number;
  damage: number;
  type: 'normal' | 'mega' | 'ultra' | 'triple';
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
  type: 'robot' | 'drone' | 'mech' | 'boss' | 'ninja' | 'tank' | 'flyer';
  isDying: boolean;
  deathTimer: number;
  attackCooldown: number;
  animationPhase: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'spike' | 'gap' | 'wall' | 'crate' | 'barrel';
}

export interface Player {
  health: number;
  maxHealth: number;
  shield: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  isJumping: boolean;
  isShooting: boolean;
  isDashing: boolean;
  isDodging: boolean;
  isIdle: boolean;
  facingRight: boolean;
  speedMultiplier: number;
  animationState: 'idle' | 'run' | 'jump' | 'attack' | 'dodge' | 'hurt' | 'dash';
  animationFrame: number;
  comboCount: number;
  lastDodgeTime: number;
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
  type: 'spark' | 'explosion' | 'muzzle' | 'death' | 'ultra' | 'blood' | 'magic' | 'dash';
}

export interface SpeechBubble {
  id: string;
  text: string;
  timestamp: number;
  type: 'normal' | 'urgent' | 'excited' | 'help';
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
  isBossFight: boolean;
  isFrozen: boolean;
  isSlowMotion: boolean;
  combo: number;
  comboTimer: number;
  lastGiftTime: number;
  screenShake: number;
  killStreak: number;
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

// Gift actions with TikTok-friendly descriptions
export const GIFT_ACTIONS: Record<GiftTier, GiftActionConfig[]> = {
  small: [
    { action: 'dash_forward', name: '⚡ DASH!', description: 'Quick dash forward', effect: 'help', value: 120 },
    { action: 'jump', name: '🦘 JUMP!', description: 'Jump over danger', effect: 'help', value: 1 },
    { action: 'shoot', name: '🔫 FIRE!', description: 'Pew pew pew!', effect: 'help', value: 25 },
    { action: 'triple_shot', name: '🔥 TRIPLE!', description: '3x bullets!', effect: 'help', value: 20 },
  ],
  medium: [
    { action: 'double_jump', name: '🚀 SUPER JUMP!', description: 'Go higher bro!', effect: 'help', value: 2 },
    { action: 'mega_shot', name: '💥 MEGA BLAST!', description: 'Huge damage!', effect: 'help', value: 80 },
    { action: 'heal', name: '💚 HEAL BRO!', description: '+40 HP for the hero', effect: 'help', value: 40 },
    { action: 'speed_boost', name: '⚡ SPEED UP!', description: 'Faster movement!', effect: 'help', value: 5 },
    { action: 'spawn_enemy', name: '👾 SPAWN ENEMY!', description: 'Chaos mode!', effect: 'sabotage', value: 1 },
  ],
  large: [
    { action: 'ultra_mode', name: '🔥 ULTRA MODE! 🔥', description: '6 sec of INSANE auto-play!', effect: 'help', value: 6 },
    { action: 'nuke', name: '💣 NUKE EM ALL!', description: 'Clear the screen!', effect: 'help', value: 0 },
    { action: 'shield', name: '🛡️ GOD SHIELD!', description: 'Invincible mode!', effect: 'help', value: 100 },
    { action: 'time_slow', name: '⏰ SLOW-MO!', description: 'Matrix style!', effect: 'help', value: 5 },
  ],
};

// Bro-style hero quips
export const HERO_QUIPS = [
  "LET'S GOOO! 🔥",
  "THAT'S WHAT I'M TALKIN' ABOUT, BRO!",
  "YOU'RE INSANE, CHAT! 💪",
  "CERTIFIED W MOMENT!",
  "MY NOSE TINGLES... DANGER AHEAD!",
  "NO CAP, THESE ROBOTS ARE TRASH!",
  "SHEEEESH! 🔥🔥🔥",
  "BRO THAT WAS FIRE!",
  "CHAT'S GOATED FR FR!",
  "PRINCESS, WAIT FOR ME!",
  "I'M BUILT DIFFERENT!",
  "EZ CLAP, NEXT!",
  "ABSOLUTE CINEMA! 🎬",
  "CHAT DIFF, GG!",
  "THEY CAN'T HANDLE THE NOSE!",
];

// Help requests when no gifts for 8 seconds
export const HELP_REQUESTS = [
  "YO CHAT! HELP A BRO OUT! 🙏",
  "I'M KINDA STUCK HERE, BROS! 😅",
  "ANYONE THERE?! NEED BACKUP!",
  "BRO I'M LOWKEY DYING HERE! 💀",
  "CHAT?! WHERE'S MY SUPPORT?!",
  "PLEASE BRO, JUST ONE GIFT! 🎁",
  "I CAN'T DO THIS ALONE, FAM!",
  "SEND HELP! 🆘",
  "ROBOTS ARE TOO OP WITHOUT Y'ALL!",
  "CHAT CARRIED ME BEFORE, DO IT AGAIN! 😭",
];

export const ENEMY_DEATH_SOUNDS = [
  "BZZT-CRASH!",
  "SYSTEM... CRITICAL...",
  "MALFUNCTION!",
  "ERROR 404: LIFE NOT FOUND",
  "SHUTTING... DOWN...",
  "*SPARKS INTENSELY*",
  "DOES NOT COMPUTE!",
];

export const BOSS_TAUNTS = [
  "FOOLISH HUMAN... YOUR NOSE CANNOT SAVE YOU!",
  "I AM THE FINAL BOSS... PREPARE TO BE DELETED!",
  "YOUR GIFTS MEAN NOTHING TO ME!",
  "INITIATING... DESTRUCTION PROTOCOL!",
  "YOU DARE CHALLENGE OMEGA-X9000?!",
];
