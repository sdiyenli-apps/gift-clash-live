export type GiftTier = 'small' | 'medium' | 'large';

export interface TikTokGift {
  id: string;
  name: string;
  tier: GiftTier;
  diamonds: number;
  emoji: string;
  action: GiftAction;
}

export interface GiftEvent {
  id: string;
  gift: TikTokGift;
  username: string;
  avatar?: string;
  timestamp: number;
  action: GiftAction;
}

// 7 Core actions
export type GiftAction = 
  | 'move_forward'
  | 'shoot'
  | 'armor'
  | 'heal'
  | 'magic_dash'
  | 'spawn_enemies'
  | 'emp_grenade';

export interface GiftActionConfig {
  action: GiftAction;
  name: string;
  description: string;
  effect: 'help' | 'chaos';
  value: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
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
  type: 'robot' | 'drone' | 'mech' | 'boss' | 'ninja' | 'tank' | 'flyer';
  isDying: boolean;
  deathTimer: number;
  attackCooldown: number;
  animationPhase: number;
  isFriendly?: boolean;
  isSpawning?: boolean;
  spawnTimer?: number;
  isFlying?: boolean;
  flyHeight?: number;
  bossPhase?: number; // 1 = normal, 2 = 50% health, 3 = 25% health
}

export interface FlyingRobot {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: 'ufo' | 'jet' | 'satellite';
}

export interface Chicken {
  id: string;
  x: number;
  y: number;
  state: 'appearing' | 'stopped' | 'walking' | 'gone';
  timer: number;
  direction: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'spike' | 'gap' | 'wall' | 'crate' | 'barrel' | 'trap';
  isDeadly?: boolean;
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
  animationState: 'idle' | 'run' | 'attack' | 'hurt' | 'dash';
  animationFrame: number;
  comboCount: number;
  lastDodgeTime: number;
  isMagicDashing: boolean;
  magicDashTimer: number;
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
  type: 'spark' | 'explosion' | 'muzzle' | 'death' | 'ultra' | 'blood' | 'magic' | 'dash' | 'neon' | 'confetti';
}

export interface NeonLight {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  size: number;
  timer: number;
}

export interface SpeechBubble {
  id: string;
  text: string;
  timestamp: number;
  type: 'normal' | 'urgent' | 'excited' | 'help' | 'funny';
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
  flyingRobots: FlyingRobot[];
  chickens: Chicken[];
  neonLights: NeonLight[];
  explosions: Explosion[];
}

export interface Gifter {
  username: string;
  avatar?: string;
  totalDiamonds: number;
  giftCount: number;
}

// 7 CORE GIFTS - Simple and clear!
export const TIKTOK_GIFTS: Record<string, TikTokGift> = {
  // MOVE FORWARD
  rose: { id: 'rose', name: 'Rose', tier: 'small', diamonds: 1, emoji: '🌹', action: 'move_forward' },
  
  // SHOOT
  finger_heart: { id: 'finger_heart', name: 'Finger Heart', tier: 'small', diamonds: 5, emoji: '🫰', action: 'shoot' },
  
  // ARMOR (Shield)
  cap: { id: 'cap', name: 'Cap', tier: 'medium', diamonds: 99, emoji: '🧢', action: 'armor' },
  
  // HEAL
  perfume: { id: 'perfume', name: 'Perfume', tier: 'medium', diamonds: 199, emoji: '💐', action: 'heal' },
  
  // MAGIC DASH (Auto-plays with effects for 6 seconds)
  galaxy: { id: 'galaxy', name: 'Galaxy', tier: 'large', diamonds: 1000, emoji: '🌌', action: 'magic_dash' },
  
  // SPAWN DANGEROUS ENEMIES (chaos gift)
  skull: { id: 'skull', name: 'Skull', tier: 'medium', diamonds: 50, emoji: '💀', action: 'spawn_enemies' },
  
  // EMP GRENADE - Kills all drones!
  lightning: { id: 'lightning', name: 'EMP Grenade', tier: 'medium', diamonds: 75, emoji: '⚡', action: 'emp_grenade' },
};

// Gift action descriptions for UI
export const GIFT_ACTION_INFO: Record<GiftAction, { name: string; description: string; effect: 'help' | 'chaos' }> = {
  move_forward: { name: '➡️ FORWARD', description: 'Move toward princess!', effect: 'help' },
  shoot: { name: '🔫 SHOOT', description: 'Attack enemies!', effect: 'help' },
  armor: { name: '🛡️ ARMOR', description: '+50 Shield!', effect: 'help' },
  heal: { name: '💚 HEAL', description: '+40 HP!', effect: 'help' },
  magic_dash: { name: '✨ MAGIC DASH', description: '6s auto-attack!', effect: 'help' },
  spawn_enemies: { name: '💀 DANGER', description: 'Spawns enemies!', effect: 'chaos' },
  emp_grenade: { name: '⚡ EMP', description: 'Kills all drones!', effect: 'help' },
};

// Bro-style hero quips
export const HERO_QUIPS = [
  "LET'S GOOO! 🔥",
  "THAT'S WHAT I'M TALKIN' ABOUT!",
  "YOU'RE INSANE, CHAT! 💪",
  "CERTIFIED W MOMENT!",
  "SHEEEESH! 🔥🔥🔥",
  "CHAT'S GOATED FR FR!",
  "PRINCESS, I'M COMING!",
  "EZ CLAP, NEXT!",
  "ABSOLUTE CINEMA! 🎬",
  "GG NO RE!",
];

// Help requests when no gifts for 8 seconds
export const HELP_REQUESTS = [
  "YO CHAT! HELP A BRO OUT! 🙏",
  "I'M KINDA STUCK HERE! 😅",
  "ANYONE THERE?! NEED BACKUP!",
  "BRO I'M LOWKEY DYING! 💀",
  "CHAT?! WHERE'S MY SUPPORT?!",
  "PLEASE, JUST ONE GIFT! 🎁",
  "I CAN'T DO THIS ALONE!",
  "SEND HELP! 🆘",
];

export const ENEMY_DEATH_SOUNDS = [
  "BZZT-CRASH!",
  "SYSTEM FAILURE!",
  "MALFUNCTION!",
  "ERROR 404!",
  "SHUTTING DOWN...",
];

export const BOSS_TAUNTS = [
  "FOOLISH HUMAN... YOU CANNOT WIN!",
  "I AM THE FINAL BOSS!",
  "YOUR GIFTS MEAN NOTHING!",
  "INITIATING DESTRUCTION!",
  "PREPARE TO BE DELETED!",
];
