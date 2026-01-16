export type GiftTier = 'small' | 'medium' | 'large';

export interface TikTokGift {
  id: string;
  name: string;
  tier: GiftTier;
  diamonds: number;
  emoji: string;
  action: GiftAction; // Direct mapping of gift to action
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
  | 'move_up'
  | 'move_down'
  | 'shoot'
  | 'jump'
  | 'dash_forward'
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
  currentWave: number;
  maxWaves: number;
}

export interface Gifter {
  username: string;
  avatar?: string;
  totalDiamonds: number;
  giftCount: number;
}

// EACH GIFT HAS A SPECIFIC ACTION - Clear mapping for TikTok Live!
export const TIKTOK_GIFTS: Record<string, TikTokGift> = {
  // SMALL GIFTS - Basic controls
  rose: { id: 'rose', name: 'Rose', tier: 'small', diamonds: 1, emoji: '🌹', action: 'move_forward' },
  ice_cream: { id: 'ice_cream', name: 'Ice Cream', tier: 'small', diamonds: 1, emoji: '🍦', action: 'move_up' },
  finger_heart: { id: 'finger_heart', name: 'Finger Heart', tier: 'small', diamonds: 5, emoji: '🫰', action: 'shoot' },
  doughnut: { id: 'doughnut', name: 'Doughnut', tier: 'small', diamonds: 30, emoji: '🍩', action: 'move_down' },
  
  // MEDIUM GIFTS - Power moves
  cap: { id: 'cap', name: 'Cap', tier: 'medium', diamonds: 99, emoji: '🧢', action: 'jump' },
  hand_hearts: { id: 'hand_hearts', name: 'Hand Hearts', tier: 'medium', diamonds: 100, emoji: '💗', action: 'triple_shot' },
  perfume: { id: 'perfume', name: 'Perfume', tier: 'medium', diamonds: 199, emoji: '💐', action: 'heal' },
  fire: { id: 'fire', name: 'Fire', tier: 'medium', diamonds: 299, emoji: '🔥', action: 'dash_forward' },
  
  // LARGE GIFTS - Ultimate powers
  galaxy: { id: 'galaxy', name: 'Galaxy', tier: 'large', diamonds: 1000, emoji: '🌌', action: 'ultra_mode' },
  planet: { id: 'planet', name: 'Planet', tier: 'large', diamonds: 2000, emoji: '🪐', action: 'nuke' },
  universe: { id: 'universe', name: 'Universe', tier: 'large', diamonds: 5000, emoji: '✨', action: 'shield' },
  lion: { id: 'lion', name: 'Lion', tier: 'large', diamonds: 29999, emoji: '🦁', action: 'time_slow' },
};

// Gift action descriptions for UI
export const GIFT_ACTION_INFO: Record<GiftAction, { name: string; description: string; effect: 'help' | 'sabotage' | 'chaos' }> = {
  move_forward: { name: '➡️ FORWARD', description: 'Move hero forward!', effect: 'help' },
  move_up: { name: '⬆️ UP', description: 'Move hero up!', effect: 'help' },
  move_down: { name: '⬇️ DOWN', description: 'Move hero down!', effect: 'help' },
  shoot: { name: '🔫 SHOOT', description: 'Fire weapon!', effect: 'help' },
  jump: { name: '🦘 JUMP', description: 'Jump!', effect: 'help' },
  dash_forward: { name: '⚡ DASH', description: 'Quick dash!', effect: 'help' },
  double_jump: { name: '🚀 DOUBLE JUMP', description: 'Super jump!', effect: 'help' },
  mega_shot: { name: '💥 MEGA SHOT', description: 'Huge damage!', effect: 'help' },
  heal: { name: '💚 HEAL', description: '+40 HP!', effect: 'help' },
  shield: { name: '🛡️ SHIELD', description: 'Invincible!', effect: 'help' },
  spawn_enemy: { name: '👾 SPAWN', description: 'Add enemies!', effect: 'sabotage' },
  ultra_mode: { name: '🔥 ULTRA', description: '6s auto-play!', effect: 'help' },
  nuke: { name: '💣 NUKE', description: 'Clear screen!', effect: 'help' },
  speed_boost: { name: '⚡ SPEED', description: 'Faster!', effect: 'help' },
  triple_shot: { name: '🔥 TRIPLE', description: '3x bullets!', effect: 'help' },
  time_slow: { name: '⏰ SLOW-MO', description: 'Matrix mode!', effect: 'help' },
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
