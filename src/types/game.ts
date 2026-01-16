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
  state: 'appearing' | 'stopped' | 'walking' | 'attacking' | 'gone';
  timer: number;
  direction: number;
  targetEnemyId?: string;
  velocityX?: number;
  velocityY?: number;
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

export interface GiftBlock {
  id: string;
  x: number;
  y: number;
  emoji: string;
  username: string;
  giftName: string;
  velocityX: number;
  life: number;
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
  giftBlocks: GiftBlock[];
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

// Bro-style hero quips - MEGA EXPANDED with taunts and gift requests!
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
  "IS THAT ALL YOU GOT?! 😏",
  "TOO EASY! NEXT! 💅",
  "GET REKT BOTS! 🤖💀",
  "SKILL DIFF! MASSIVE! 🧠",
  "I'M BUILT DIFFERENT! 💪",
  "YOOO THAT WAS CLEAN! ✨",
  "CHAT CARRYING ME RN! 🙌",
  "WE'RE SO BACK! 🔥",
  "NO CAP, THAT WAS FIRE! 🔥",
  "CALCULATED! ALL SKILL! 🎯",
  "THAT'S THAT ME ESPRESSO! ☕",
  "BUSSIN BUSSIN! 💯",
  "LOWKEY CRACKED AT THIS! 🎮",
  "CHAT IS MY MAIN CHARACTER! 👑",
  "POV: YOU JUST GOT DELETED! 📸",
  "W ENERGY ONLY TODAY! ⚡",
  "IT'S GIVING CHAMPION! 🏆",
  "SLAY! LITERALLY SLAY! 💅✨",
  "RATIO + SKILL ISSUE + YOU'RE METAL! 🤖",
  "I WOKE UP AND CHOSE VIOLENCE! 😈",
  "MAIN CHARACTER SYNDROME ACTIVATED! 🌟",
  "RENT FREE IN YOUR CPU! 🧠",
  "NOT ME BEING CRACKED! 😌",
  "VIBES ARE IMMACULATE! ✨",
  "ANOTHER ONE! DJ KHALED! 🎵",
];

// Taunts specifically for enemies - EXPANDED!
export const ENEMY_TAUNTS = [
  "HEY RUST BUCKET! OVER HERE! 🤖",
  "IMAGINE BEING A BOT! COULDN'T BE ME! 😂",
  "YOU CALL THAT AN ATTACK?! 💀",
  "MY GRANDMA HITS HARDER! 👵",
  "BRUH YOU'RE LAGGING IRL! 📶",
  "ERROR 404: YOUR SKILLS NOT FOUND! 🔍",
  "CTRL+ALT+DELETE YOURSELF! ⌨️",
  "YOU'RE MALWARE AND I'M THE ANTIVIRUS! 🛡️",
  "BEEP BOOP? MORE LIKE BEEP POOP! 💩",
  "1V1 ME BRO! OH WAIT, YOU CAN'T! 😎",
  "YOU WERE CODED BY AN INTERN! 💻",
  "WINDOWS 95 CALLED, IT WANTS YOU BACK! 🖥️",
  "I'VE SEEN BETTER AI IN A TOASTER! 🍞",
  "IS YOUR PROGRAMMER ON VACATION?! 🏖️",
  "YOU'RE RUNNING ON INTERNET EXPLORER! 🐌",
  "IMAGINE LOSING TO A SQUIRREL! 🐿️",
  "YOUR MOM'S A CALCULATOR! 🔢",
  "DID NVIDIA SPONSOR YOUR L?! 📉",
  "YOU'RE SO BUGGY EVEN RAID WON'T FIX IT! 🪲",
  "NICE FIREWALL! NOT! 🔥",
];

// Gift requests - asking for support - MEGA EXPANDED!
export const GIFT_REQUESTS = [
  "YO CHAT DROP SOME GIFTS! 🎁",
  "I NEED THAT ARMOR RN! 🛡️",
  "GALAXY GIFT = INSTANT W! 🌌",
  "SOMEONE HEAL ME! I'M FADING! 💚",
  "GIFTS = PRINCESS SAVED! 👸",
  "CHAT I BELIEVE IN YOU! 💪",
  "ONE MORE GIFT AND WE WIN THIS! 🏆",
  "SPAM THOSE ROSES! 🌹🌹🌹",
  "I'M SO CLOSE! HELP ME OUT! 🙏",
  "MAGIC DASH WOULD HIT RN! ✨",
  "GIFTS MAKE ME STRONGER! 💪🎁",
  "EMP GRENADE = BIG BRAIN PLAY! ⚡",
  "CHAT'S GENEROSITY HITS DIFFERENT! 💝",
  "DROP THAT GALAXY, KING/QUEEN! 👑",
  "ARMOR ME UP, FAM! 🛡️💎",
  "I'LL SHOUTOUT EVERY GIFTER! 📢",
  "GIFTS = MORE CONTENT! WIN-WIN! 🎬",
  "MY HEALTH BAR IS CRYING FOR HELP! 😭",
  "PRINCESS BELIEVES IN US! GIFT UP! 👸✨",
  "THE BOSS IS SCARED OF YOUR GIFTS! 😱",
  "BE MY HERO! SEND THAT ROSE! 🌹❤️",
  "CHAT CARRIES ARE THE BEST CARRIES! 🙌",
  "I'LL NAME MY NEXT PET AFTER YOU! 🐿️",
  "GIFTERS GET FRONT ROW AT THE WEDDING! 💒",
];

// Help requests when no gifts for 8 seconds - EXPANDED!
export const HELP_REQUESTS = [
  "YO CHAT! HELP A BRO OUT! 🙏",
  "I'M KINDA STUCK HERE! 😅",
  "ANYONE THERE?! NEED BACKUP!",
  "BRO I'M LOWKEY DYING! 💀",
  "CHAT?! WHERE'S MY SUPPORT?!",
  "PLEASE, JUST ONE GIFT! 🎁",
  "I CAN'T DO THIS ALONE!",
  "SEND HELP! 🆘",
  "DON'T LEAVE ME HANGING! 😭",
  "CHAT WENT AFK?! HELLO?! 📢",
  "THE PRINCESS IS COUNTING ON US! 👸",
  "MY SHIELD IS CRYING! 😢🛡️",
  "EVEN A ROSE WOULD HELP! 🌹",
  "I'M NOT MAD, JUST DISAPPOINTED! 😤",
  "VIBES ARE GETTING LOW! ⬇️",
  "ENEMY ROBOTS ARE LAUGHING AT ME! 🤖😂",
  "CHAT PLEASE I'M LITERALLY ONE HP! 💔",
  "THIS IS NOT A DRILL! NEED GIFTS! 🚨",
  "THE BOSS IS FLEXING ON ME! 💪👹",
  "I'D GIFT MYSELF IF I COULD! 🤷",
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

// Boss names that scale with wave number
export const getBossName = (wave: number): string => {
  if (wave >= 1000) return "OMEGA DESTROYER - THE FINAL NIGHTMARE";
  if (wave >= 900) return "APOCALYPSE ENGINE";
  if (wave >= 800) return "VOID CONSUMER";
  if (wave >= 700) return "REALITY SHREDDER";
  if (wave >= 600) return "DIMENSION RIPPER";
  if (wave >= 500) return "TITAN OVERLORD";
  if (wave >= 400) return "CHAOS INCARNATE";
  if (wave >= 300) return "DOOM HARBINGER";
  if (wave >= 200) return "MECHANICAL HORROR";
  if (wave >= 100) return "STEEL NIGHTMARE";
  if (wave >= 50) return "CYBER DEMON";
  if (wave >= 25) return "IRON TERROR";
  if (wave >= 10) return "CHROME BEAST";
  return "BIOMECH TERROR";
};
