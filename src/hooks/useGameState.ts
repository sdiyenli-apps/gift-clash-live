import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken, GiftBlock, TIKTOK_GIFTS,
  ENEMY_TAUNTS, GIFT_REQUESTS, getBossName, Bomb, SupportUnit
} from '@/types/game';

const GRAVITY = 0;
const GROUND_Y = 160; // Original ground level
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const BASE_LEVEL_LENGTH = 12000;
const MAX_WAVES = 10;
const HELP_REQUEST_DELAY = 8000;
const KILL_RADIUS = 70;
const ENEMY_MIN_DISTANCE = 100;
const ENEMY_COLLISION_DISTANCE = 60;
const SLASH_ATTACK_RANGE = 80;
const ROCKET_ATTACK_RANGE = 350;
const BOSS_FIREBALL_INTERVAL = 4;
const BOSS_MEGA_ATTACK_THRESHOLD = 0.25;
const BOSS_KEEP_DISTANCE = 100; // Boss stays CLOSE to hero for tighter combat
const HERO_FIXED_SCREEN_X = 30; // Hero on FAR LEFT side of screen
const BOSS_JUMP_ATTACK_DURATION = 5; // Boss jump attack takes 5 seconds (faster)
const ENEMY_ATTACK_DELAY = 2;
const PARTICLE_LIFETIME = 3;
const EVASION_CHANCE = 1 / 15;
const ARMOR_ACTIVATION_THRESHOLD = 0.2;
const ARMOR_DURATION = 3;
// BOSS PHASES - Phase 2 at 70%, Phase 3 at 50%
const BOSS_PHASE_2_THRESHOLD = 0.7; // 70% health
const BOSS_PHASE_3_THRESHOLD = 0.5; // 50% health
// BOSS ARMOR - activates at PHASE 3 (50% health), lasts 10 seconds
const BOSS_ARMOR_THRESHOLD = 0.5; // 50% health (Phase 3)
const BOSS_ARMOR_DURATION = 10; // 10 seconds of invulnerability
// Boss laser attack duration
const BOSS_LASER_LOCK_DURATION = 3; // 3 seconds lock-on laser
const BOSS_LASER_DAMAGE_PER_SECOND = 15; // Damage per second during laser

// Ground Y positions for entity movement - SPREAD OUT for depth effect
const GROUND_Y_BACK = GROUND_Y + 60;      // Back lane (furthest, smaller looking)
const GROUND_Y_MID_BACK = GROUND_Y + 35;  // Mid-back lane
const GROUND_Y_MIDDLE = GROUND_Y + 10;    // Middle lane (hero level)
const GROUND_Y_MID_FRONT = GROUND_Y - 15; // Mid-front lane
const GROUND_Y_FRONT = GROUND_Y - 40;     // Front lane (closest, larger looking)

// Boss attack types - includes neon_laser for lock-on attack
type BossAttackType = 'fireball' | 'laser_sweep' | 'missile_barrage' | 'ground_pound' | 'screen_attack' | 'shield' | 'jump_bomb' | 'neon_laser';

interface BossAttack {
  id: string;
  type: BossAttackType;
  x: number;
  y: number;
  timer: number;
  data?: any;
}

// Boss taunts and laughs
// Boss taunts - directed at hero AND players
const BOSS_TAUNTS_TO_HERO = [
  "HAHAHAHA! PATHETIC SQUIRREL!",
  "YOU CANNOT DEFEAT ME!",
  "IS THAT ALL YOU'VE GOT?!",
  "TREMBLE BEFORE MY POWER!",
  "I WILL CRUSH YOU!",
  "YOU'RE NOTHING BUT A RODENT!",
  "FOOLISH HERO! GIVE UP!",
  "YOUR PRINCESS WILL NEVER BE SAVED!",
  "PREPARE FOR DELETION!",
  "I'VE CRUSHED THOUSANDS LIKE YOU!",
];

const BOSS_TAUNTS_TO_PLAYERS = [
  "CHAT CAN'T SAVE YOU NOW! 😈",
  "YOUR GIFTS ARE WORTHLESS! 💀",
  "VIEWERS, WATCH YOUR HERO FALL!",
  "NO AMOUNT OF ROSES WILL HELP! 🌹❌",
  "CHAT IS TOO WEAK! HAHAHA!",
  "SEND ALL THE GIFTS YOU WANT!",
  "YOUR DONATIONS MEAN NOTHING!",
  "PATHETIC VIEWERS! YOU'LL ALL WATCH HIM LOSE!",
  "HAHAHA! CHAT IS POWERLESS!",
  "EVEN GALAXY WON'T SAVE YOU! 🌌💀",
];

interface Fireball {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
}

interface NeonLaser {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  bounces: number;
  life: number;
}

const INITIAL_PLAYER: Player = {
  health: 100,
  maxHealth: 100,
  shield: 0,
  x: 100,
  y: GROUND_Y,
  velocityX: 0,
  velocityY: 0,
  isGrounded: true,
  isJumping: false,
  isShooting: false,
  isDashing: false,
  isDodging: false,
  isIdle: true,
  facingRight: true,
  speedMultiplier: 1,
  animationState: 'idle',
  animationFrame: 0,
  comboCount: 0,
  lastDodgeTime: 0,
  isMagicDashing: false,
  magicDashTimer: 0,
  isAutoSlashing: false,
  autoSlashCooldown: 0,
};

// EMP Grenade projectile type
interface EMPGrenade {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  timer: number;
}

// Damage number for visual feedback
interface DamageNumberData {
  id: string;
  x: number;
  y: number;
  damage: number;
  isResist: boolean;
  isCrit: boolean;
  color: string;
  timestamp: number;
}

interface ExtendedGameState extends GameState {
  fireballs: Fireball[];
  bossFireballTimer: number;
  bossMegaAttackUsed: boolean;
  redFlash: number;
  enemyLasers: Projectile[];
  magicFlash: number;
  bossTaunt: string | null;
  bossTauntTimer: number;
  damageFlash: number;
  shieldBlockFlash: number;
  neonLasers: NeonLaser[];
  bossDroneSpawnTimer: number;
  bossAttacks: BossAttack[];
  bossAttackCooldown: number;
  laserSweepAngle: number;
  lastBossAttack: BossAttackType | null;
  empGrenades: EMPGrenade[];
  bombs: Bomb[];
  portalOpen: boolean;
  portalX: number;
  heroEnteringPortal: boolean;
  bossTransformFlash: number;
  supportUnits: SupportUnit[];
  supportProjectiles: Projectile[];
  empCooldown: number;
  empCharges: number;
  gameStartTime: number;
  particleResetTimer: number;
  evasionPopup: { x: number; y: number; timer: number; target: 'hero' | 'enemy' | 'ally' } | null;
  // Summon cooldowns (15 seconds each)
  allyCooldown: number;
  ultCooldown: number;
  tankCooldown: number;
  // Track if first gift was sent - enemies only start moving/attacking after first gift
  firstGiftSent: boolean;
  // GIFT COMBO SYSTEM - rapid gifts boost damage!
  giftCombo: number;
  giftComboTimer: number;
  giftDamageMultiplier: number;
  // VISUAL DAMAGE NUMBERS
  damageNumbers: DamageNumberData[];
  // BOSS NEON LASER ATTACK
  bossLaserActive: boolean;
  bossLaserTimer: number;
  // ENEMY LASER ATTACKS (for large enemies)
  enemyLaserAttacks: { enemyId: string; timer: number }[];
  // GO GIFT COUNTER - Every 10 GO gifts triggers flip attack
  goGiftCount: number;
  // RAY CANNON ATTACK - 3 second powerful laser
  rayCannonActive: boolean;
  rayCannonTimer: number;
}

const INITIAL_STATE: ExtendedGameState = {
  phase: 'waiting',
  score: 0,
  distance: 0,
  levelLength: BASE_LEVEL_LENGTH,
  cameraX: 0,
  player: INITIAL_PLAYER,
  enemies: [],
  projectiles: [],
  obstacles: [],
  particles: [],
  speechBubble: null,
  isUltraMode: false,
  ultraModeTimer: 0,
  isBossFight: false,
  isFrozen: false,
  isSlowMotion: false,
  combo: 0,
  comboTimer: 0,
  lastGiftTime: Date.now(),
  screenShake: 0,
  killStreak: 0,
  currentWave: 1,
  maxWaves: MAX_WAVES,
  flyingRobots: [],
  chickens: [],
  neonLights: [],
  explosions: [],
  giftBlocks: [],
  bombs: [],
  fireballs: [],
  bossFireballTimer: BOSS_FIREBALL_INTERVAL,
  bossMegaAttackUsed: false,
  redFlash: 0,
  enemyLasers: [],
  magicFlash: 0,
  bossTaunt: null,
  bossTauntTimer: 0,
  damageFlash: 0,
  shieldBlockFlash: 0,
  neonLasers: [],
  bossDroneSpawnTimer: 2,
  bossAttacks: [],
  bossAttackCooldown: 0,
  laserSweepAngle: 0,
  lastBossAttack: null,
  empGrenades: [],
  // Portal starts closed
  portalOpen: false,
  portalX: 0,
  heroEnteringPortal: false,
  // Boss transformation flash
  bossTransformFlash: 0,
  // REMOVED: neonBeams - All attacks are now projectiles
  // Support units
  supportUnits: [],
  supportProjectiles: [],
  // Cooldowns - start ready (0 = ready)
  empCooldown: 0,
  empCharges: 2,
  gameStartTime: Date.now(),
  particleResetTimer: PARTICLE_LIFETIME,
  evasionPopup: null,
  // Summon cooldowns - all start ready
  allyCooldown: 0,
  ultCooldown: 0,
  tankCooldown: 0,
  // First gift tracking - enemies don't move/attack until first gift is sent
  firstGiftSent: false,
  // GIFT COMBO SYSTEM - starts at 0
  giftCombo: 0,
  giftComboTimer: 0,
  giftDamageMultiplier: 1.0,
  // VISUAL DAMAGE NUMBERS
  damageNumbers: [],
  // BOSS NEON LASER ATTACK
  bossLaserActive: false,
  bossLaserTimer: 0,
  // ENEMY LASER ATTACKS (for large enemies)
  enemyLaserAttacks: [],
  // GO GIFT COUNTER - Every 10 GO gifts triggers flip attack
  goGiftCount: 0,
  // RAY CANNON ATTACK - starts inactive
  rayCannonActive: false,
  rayCannonTimer: 0,
};

// 8 enemy types: robot, drone, mech, ninja, tank, giant, bomber, sentinel - EQUAL SPAWN RATES
const ENEMY_TYPES = ['robot', 'drone', 'mech', 'ninja', 'tank', 'giant', 'bomber', 'sentinel'] as const;

// Enemy sizes based on type - calculated relative to screen (arena ~400px height, ~600px width)
// Base sizes are designed so smallest fits ~8% of height, largest ~25% of height
const ENEMY_BASE_SIZES: Record<string, { width: number; height: number }> = {
  robot: { width: 45, height: 52 },     // Small ground unit
  drone: { width: 90, height: 95 },     // Same size as hero (90x95)
  mech: { width: 55, height: 60 },      // Medium ground unit
  ninja: { width: 40, height: 48 },     // Small fast unit
  tank: { width: 70, height: 65 },      // Large slow unit
  giant: { width: 90, height: 100 },    // Very large unit
  bomber: { width: 50, height: 45 },    // Medium flying unit
  sentinel: { width: 75, height: 80 },  // Large ranged unit
  boss: { width: 100, height: 100 },    // SMALLER boss collision hitbox
  jetrobot: { width: 55, height: 50 },  // Medium flying unit
  flyer: { width: 42, height: 42 },     // Small flying unit
};

// Get scaled enemy size based on wave and type
const getEnemySize = (type: string, wave: number, isElite: boolean = false) => {
  const base = ENEMY_BASE_SIZES[type] || { width: 50, height: 55 };
  // Wave scaling: enemies get slightly larger each wave (max 1.3x at wave 100)
  const waveScale = 1 + Math.min(wave * 0.003, 0.3);
  // Elite enemies are 1.3x larger
  const eliteScale = isElite ? 1.3 : 1;
  return {
    width: Math.floor(base.width * waveScale * eliteScale),
    height: Math.floor(base.height * waveScale * eliteScale),
  };
};

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number, gameStartTime: number } => {
  const gameStartTime = Date.now(); // Track when game started for attack delay
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  // WAVE 1 = 12 enemies (VERY EASY to learn), then increase by 30% each wave
  // This gives players time to understand the gift-based combat system
  const baseEnemyCount = 12;
  const targetEnemyCount = Math.floor(baseEnemyCount * Math.pow(1.3, wave - 1));
  
  // Equal split between drones (flying) and ground enemies
  const droneCount = Math.floor(targetEnemyCount / 2);
  const groundCount = targetEnemyCount - droneCount;
  
  // Level length scales with enemy count
  const levelLength = Math.min(2500 + targetEnemyCount * 80, 50000);
  
  // DAMAGE SCALING - Wave 1 has VERY LOW damage for onboarding, scales progressively
  // Wave 1: base * 0.15 (very forgiving), Wave 5: base * 0.55, Wave 10: base * 1.05
  // This allows new players to survive longer and learn mechanics
  const damageMultiplier = 0.15 + (wave - 1) * 0.10;
  
  // HEALTH SCALING - Wave 1 enemies are also weaker to die faster
  // Gives satisfying kills early on, enemies get tankier in later waves
  const healthMultiplier = 0.6 + (wave - 1) * 0.10; // Wave 1: 0.6x, Wave 10: 1.5x
  const waveBonus = Math.min(wave * 0.15, 3); // Health scaling per wave
  
  // Spread enemies evenly across the level
  const groundSpacing = (levelLength - 1200) / Math.max(groundCount, 1);
  const droneSpacing = (levelLength - 1200) / Math.max(droneCount, 1);
  
  // SPAWN GROUND ENEMIES (50%)
  for (let i = 0; i < groundCount; i++) {
    const x = 400 + i * groundSpacing + Math.random() * (groundSpacing * 0.3);
    const typeRoll = Math.random();
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    // Ground enemy types distribution (50% of enemies)
    if (typeRoll < 0.15) {
      // ROBOT - ground unit
      enemyType = 'robot';
      const size = getEnemySize('robot', wave);
      width = size.width; height = size.height;
      health = Math.floor(45 * healthMultiplier * (1 + waveBonus)); speed = 55 + wave * 2.5; 
      damage = Math.floor((9 + wave) * damageMultiplier);
    } else if (typeRoll < 0.35) {
      // MECH - ground unit
      enemyType = 'mech';
      const size = getEnemySize('mech', wave);
      width = size.width; height = size.height;
      health = Math.floor(90 * healthMultiplier * (1 + waveBonus)); speed = 32 + wave * 2.5; 
      damage = Math.floor((16 + wave) * damageMultiplier);
    } else if (typeRoll < 0.50) {
      // TANK - ground unit
      enemyType = 'tank';
      const size = getEnemySize('tank', wave);
      width = size.width; height = size.height;
      health = Math.floor(180 * healthMultiplier * (1 + waveBonus)); speed = 18 + wave * 1.5; 
      damage = Math.floor((22 + wave) * damageMultiplier);
    } else if (typeRoll < 0.70) {
      // SENTINEL - Large ground mech
      enemyType = 'sentinel';
      const size = getEnemySize('sentinel', wave);
      width = size.width; height = size.height;
      health = Math.floor(220 * healthMultiplier * (1 + waveBonus));
      speed = 35 + wave * 1.5; 
      damage = Math.floor((25 + wave) * damageMultiplier);
    } else if (typeRoll < 0.85) {
      // NINJA - ground unit (fast)
      enemyType = 'ninja';
      const size = getEnemySize('ninja', wave);
      width = size.width; height = size.height;
      health = Math.floor(35 * healthMultiplier * (1 + waveBonus * 0.6)); speed = 150 + wave * 8; 
      damage = Math.floor((12 + wave) * damageMultiplier);
    } else {
      // GIANT - large ground unit
      enemyType = 'giant';
      const size = getEnemySize('giant', wave);
      width = size.width; height = size.height;
      health = Math.floor(300 * healthMultiplier * (1 + waveBonus)); speed = 25 + wave; 
      damage = Math.floor((30 + wave * 2) * damageMultiplier);
    }
    
    // Spread ground enemies across 5 different Y positions for depth effect
    const groundLevels = [GROUND_Y_BACK, GROUND_Y_MID_BACK, GROUND_Y_MIDDLE, GROUND_Y_MID_FRONT, GROUND_Y_FRONT];
    const enemyGroundY = groundLevels[Math.floor(Math.random() * groundLevels.length)];
    
    // Check if this should be an ELITE enemy (8 per wave - drops in ORDER: Ally, ULT, Tank, Ally, ULT, Tank, Ally, ULT)
    const currentEliteCount = enemies.filter(e => e.isElite).length;
    const shouldBeElite = currentEliteCount < 8 && Math.random() < 0.12; // ~12% chance, capped at 8
    let eliteDropType: 'ally' | 'ult' | 'tank' | undefined = undefined;
    
    if (shouldBeElite) {
      // Drops in FIXED ORDER: Ally, ULT, Tank, Ally, ULT, Tank, Ally, ULT
      const dropSequence: ('ally' | 'ult' | 'tank')[] = ['ally', 'ult', 'tank', 'ally', 'ult', 'tank', 'ally', 'ult'];
      eliteDropType = dropSequence[currentEliteCount] || 'ally';
    }
    
    enemies.push({
      id: `enemy-${x}-${Math.random()}`,
      x,
      y: enemyGroundY,
      width: shouldBeElite ? Math.floor(width * 1.3) : width,
      height: shouldBeElite ? Math.floor(height * 1.3) : height,
      health: shouldBeElite ? health * 2.5 : health,
      maxHealth: shouldBeElite ? health * 2.5 : health,
      speed: shouldBeElite ? speed * 0.7 : speed, // Elites are slower but tougher
      damage: shouldBeElite ? damage * 1.5 : damage,
      type: enemyType,
      isDying: false,
      deathTimer: 0,
      attackCooldown: 0,
      animationPhase: Math.random() * Math.PI * 2,
      isSpawning: true,
      spawnTimer: 0.8,
      groundY: enemyGroundY,
      isElite: shouldBeElite && !!eliteDropType,
      eliteDropType: eliteDropType,
    });
  }
  
  // SPAWN FLYING ENEMIES (50% - drones and bombers)
  for (let i = 0; i < droneCount; i++) {
    const x = 400 + i * droneSpacing + Math.random() * (droneSpacing * 0.3);
    const typeRoll = Math.random();
    
    if (typeRoll < 0.7) {
      // DRONE - flying enemy (70% of flying enemies)
      const isSpiralDrone = Math.random() < 0.25;
      // 30% of drones DESCEND FROM TOP of screen
      const isDescendingDrone = Math.random() < 0.3;
      const spiralCenterY = GROUND_Y + 120 + Math.random() * 80;
      const droneHealth = Math.floor(32 * healthMultiplier * (1 + waveBonus * 0.5));
      
      enemies.push({
        id: `drone-${x}-${Math.random()}`,
        x,
        y: isSpiralDrone ? spiralCenterY : (GROUND_Y + 60 + Math.random() * 50),
        width: 90,
        height: 95,
        health: droneHealth,
        maxHealth: droneHealth,
        speed: 90 + wave * 3,
        damage: Math.floor((10 + Math.floor(wave / 2)) * damageMultiplier), // INCREASED drone damage
        type: 'drone',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: !isDescendingDrone, // Descending drones don't spawn, they drop
        spawnTimer: isDescendingDrone ? 0 : 0.8,
        isFlying: true,
        flyHeight: 60 + Math.random() * 50,
        isSpiralDrone,
        spiralAngle: 0,
        spiralCenterX: x,
        spiralCenterY,
        bombCooldown: 1.5 + Math.random() * 2,
        droneVariant: Math.floor(Math.random() * 5),
        // Descending drones drop from top of screen
        isDropping: isDescendingDrone,
        dropTimer: isDescendingDrone ? 1.5 : 0,
      });
    } else {
      // BOMBER - flying enemy (30% of flying enemies)
      const bomberHealth = Math.floor(50 * healthMultiplier * (1 + waveBonus * 0.6));
      const bomberY = GROUND_Y + 220 + Math.random() * 60;
      
      enemies.push({
        id: `bomber-${x}-${Math.random()}`,
        x,
        y: bomberY,
        width: 55,
        height: 50,
        health: bomberHealth,
        maxHealth: bomberHealth,
        speed: 60 + wave * 2,
        damage: Math.floor((15 + wave) * damageMultiplier),
        type: 'bomber',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
        isFlying: true,
        flyHeight: 220 + Math.random() * 60,
        bombCooldown: 2 + Math.random() * 2,
        originalX: x,
        originalY: bomberY,
        droneVariant: Math.floor(Math.random() * 5),
      });
    }
  }
  
  // Add JET ROBOT enemies that DROP FROM TOP (scales with wave)
  const jetRobotCount = Math.max(0, Math.floor(wave * 0.5)); // 0 at wave 1, 5 at wave 10
  const jetSpacing = (levelLength - 1200) / Math.max(jetRobotCount, 1);
  for (let i = 0; i < jetRobotCount; i++) {
    const x = 450 + i * jetSpacing + Math.random() * (jetSpacing * 0.3);
    const jetHealth = 80 * (1 + wave * 0.1);
    const jetY = GROUND_Y + 120 + Math.random() * 60;
    enemies.push({
      id: `jetrobot-${x}-${Math.random()}`,
      x,
      y: jetY,
      width: 55,
      height: 50,
      health: jetHealth,
      maxHealth: jetHealth,
      speed: 70 + wave * 2,
      damage: Math.floor((12 + wave) * damageMultiplier),
      type: 'jetrobot',
      isDying: false,
      deathTimer: 0,
      attackCooldown: 0,
      animationPhase: Math.random() * Math.PI * 2,
      isSpawning: false,
      isDropping: true,
      dropTimer: 1.2,
      isFlying: true,
      flyHeight: 120 + Math.random() * 60,
      empOnly: true,
      originalX: x,
      originalY: jetY,
    });
  }

  // Princess is ONLY at wave 1000 - final destination!
  const isFinalBoss = wave === 1000;
  const isMegaBoss = wave % 100 === 0; // Every 100 waves = mega boss
  const isMiniBoss = wave % 10 === 0; // Every 10 waves = mini boss
  
  // Boss size - SMALLER for tighter combat feel, scales with wave
  // Levels 1-5 have smaller bosses, 6-10 have larger ones
  const baseBossSize = wave <= 5 ? 80 : 100; // Smaller boss hitbox for early levels
  const sizeMultiplier = isFinalBoss ? 2.0 : (1 + wave * 0.002); // Reduced scaling
  const bossSize = Math.min(baseBossSize * sizeMultiplier, isFinalBoss ? 200 : 140);
  
  // Boss health scales dramatically - balanced for longer battle time
  // Levels 1-5 have LESS health for quicker fights (only 2 phases)
  const bossBaseHealth = isFinalBoss 
    ? 100000 // Final boss has 100k health for epic battle
    : wave <= 5 
      ? (4000 + wave * 600) * (isMegaBoss ? 2.5 : isMiniBoss ? 1.8 : 1) // Lower health for early bosses
      : (6000 + wave * 800) * (isMegaBoss ? 2.5 : isMiniBoss ? 1.8 : 1);
  
  enemies.push({
    id: 'boss-monster',
    x: levelLength - 400, // Boss starts CLOSER to hero
    y: GROUND_Y - (bossSize * 0.35), // Adjusted ground clearance
    width: bossSize,
    height: bossSize,
    health: bossBaseHealth,
    maxHealth: bossBaseHealth,
    speed: 50 + wave * 0.5, // Slightly faster approach
    damage: isFinalBoss ? 100 : (35 + wave * 2),
    type: 'boss',
    isDying: false,
    deathTimer: 0,
    attackCooldown: 0,
    animationPhase: 0,
    bossPhase: 1, // Start at phase 1
  });
  
  // Obstacles
  for (let x = 500; x < levelLength - 1000; x += 350 + Math.random() * 250) {
    if (Math.random() > 0.55) {
      obstacles.push({
        id: `crate-${x}`,
        x,
        y: GROUND_Y,
        width: 35,
        height: 35,
        type: 'crate',
      });
    }
  }
  
  return { enemies, obstacles, levelLength, gameStartTime };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<ExtendedGameState>(INITIAL_STATE);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Gifter[]>([]);
  const [notifications, setNotifications] = useState<GiftEvent[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const helpRequestTimerRef = useRef<NodeJS.Timeout | null>(null);

  // PERFORMANCE: MINIMAL particle and FX limits - reduce lag significantly
  const MAX_PARTICLES = 2; // Reduced from 4
  const MAX_SUPPORT_PROJECTILES = 2;

  // Particle pool - reuse particle objects instead of creating new ones
  const particlePoolRef = useRef<Particle[]>([]);
  
  const createParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string): Particle[] => {
    // PERFORMANCE: Skip ALL particle creation except essential explosions
    // This eliminates particle residue from ally/tank shooting
    if (type === 'spark' || type === 'magic' || type === 'neon' || type === 'muzzle') return [];
    
    // Only create particles for death/explosion effects, and very few
    if (type !== 'explosion' && type !== 'death') return [];
    
    const colors = ['#ff00ff', '#00ffff', '#ffff00'];
    
    // Only create 1 particle max with ULTRA short life to prevent residue
    const particle: Particle = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x,
      y,
      velocityX: (Math.random() - 0.5) * 60,
      velocityY: (Math.random() - 0.8) * 60,
      color: color || colors[Math.floor(Math.random() * colors.length)],
      size: 2,
      life: 0.02 + Math.random() * 0.02, // ULTRA short lifespan (20-40ms)
      type,
    };
    return [particle];
  }, []);

  const showSpeechBubble = useCallback((text: string, type: SpeechBubble['type'] = 'normal') => {
    const bubble: SpeechBubble = {
      id: `speech-${Date.now()}`,
      text,
      timestamp: Date.now(),
      type,
    };
    setGameState(prev => ({ ...prev, speechBubble: bubble }));
    setTimeout(() => {
      setGameState(prev => prev.speechBubble?.id === bubble.id ? { ...prev, speechBubble: null } : prev);
    }, 2500);
  }, []);

  const requestHelp = useCallback(() => {
    const helpText = HELP_REQUESTS[Math.floor(Math.random() * HELP_REQUESTS.length)];
    showSpeechBubble(helpText, 'help');
  }, [showSpeechBubble]);

  const startGame = useCallback((wave: number = 1) => {
    const { enemies, obstacles, levelLength, gameStartTime } = generateLevel(wave);
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      enemies,
      obstacles,
      levelLength,
      lastGiftTime: Date.now(),
      currentWave: wave,
      gameStartTime,
      particleResetTimer: PARTICLE_LIFETIME,
      firstGiftSent: false, // Reset - enemies wait for first gift to be sent
    });
    setGiftEvents([]);
    lastUpdateRef.current = Date.now();
    showSpeechBubble(`WAVE ${wave}! SEND A GIFT TO START! 🎁`, 'excited');
  }, [showSpeechBubble]);

  const startNextWave = useCallback(() => {
    const nextWave = gameState.currentWave + 1;
    if (nextWave <= MAX_WAVES) {
      const { enemies, obstacles, levelLength, gameStartTime } = generateLevel(nextWave);
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        enemies,
        obstacles,
        levelLength,
        // RESET HERO TO FULL HEALTH at start of each wave
        player: { ...INITIAL_PLAYER, health: INITIAL_PLAYER.maxHealth, shield: 0 },
        distance: 0,
        cameraX: 0,
        projectiles: [],
        particles: [], // Reset particles on level end
        isUltraMode: false,
        ultraModeTimer: 0,
        isBossFight: false,
        currentWave: nextWave,
        lastGiftTime: Date.now(),
        fireballs: [],
        bossFireballTimer: BOSS_FIREBALL_INTERVAL,
        bossMegaAttackUsed: false,
        redFlash: 0,
        enemyLasers: [],
        chickens: [],
        magicFlash: 0,
        bossTaunt: null,
        bossTauntTimer: 0,
        // Reset portal for next wave
        portalOpen: false,
        portalX: 0,
        heroEnteringPortal: false,
        // Reset game timing
        gameStartTime,
        particleResetTimer: PARTICLE_LIFETIME,
        // Reset support units and projectiles for clean start
        supportUnits: [],
        supportProjectiles: [],
        bombs: [],
        empGrenades: [],
        powerups: [],
        // Reset first gift tracking - enemies wait for first gift to be sent
        firstGiftSent: false,
        // Reset GO gift counter for new wave
        goGiftCount: 0,
      }));
      showSpeechBubble(`WAVE ${nextWave} BEGINS! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Create chickens - now they FLY toward enemies!
  const createAttackChickens = (playerX: number, enemies: Enemy[]): Chicken[] => {
    const newChickens: Chicken[] = [];
    const visibleEnemies = enemies.filter(e => !e.isDying && !e.isSpawning && e.type !== 'boss');
    
    for (let i = 0; i < 8; i++) {
      // Find a target enemy
      const targetEnemy = visibleEnemies[i % Math.max(1, visibleEnemies.length)];
      
      newChickens.push({
        id: `chicken-${Date.now()}-${i}`,
        x: playerX + PLAYER_WIDTH / 2,
        y: GROUND_Y + 30,
        state: 'attacking',
        timer: 4,
        direction: 1,
        targetEnemyId: targetEnemy?.id,
        velocityX: 300 + Math.random() * 200,
        velocityY: 100 + Math.random() * 150,
      });
    }
    return newChickens;
  };

  // Create dangerous enemies for spawn_enemies gift - with spacing to prevent overlap
  const createDangerousEnemies = (playerX: number, count: number, existingEnemies: Enemy[]): Enemy[] => {
    const newEnemies: Enemy[] = [];
    const SPAWN_SPACING = 100; // Minimum space between enemies
    
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.5 ? 'tank' : 'mech';
      const baseX = playerX + 250 + i * SPAWN_SPACING;
      
      // Find a non-overlapping position
      let spawnX = baseX;
      const allEnemies = [...existingEnemies, ...newEnemies];
      for (const enemy of allEnemies) {
        if (Math.abs(enemy.x - spawnX) < SPAWN_SPACING) {
          spawnX = enemy.x + SPAWN_SPACING;
        }
      }
      
      newEnemies.push({
        id: `spawn-enemy-${Date.now()}-${i}`,
        x: spawnX,
        y: GROUND_Y,
        width: type === 'tank' ? 70 : 60,
        height: type === 'tank' ? 65 : 65,
        health: type === 'tank' ? 200 : 120,
        maxHealth: type === 'tank' ? 200 : 120,
        speed: type === 'tank' ? 25 : 45,
        damage: type === 'tank' ? 25 : 18,
        type,
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
      });
    }
    return newEnemies;
  };

  // Create support units - mech and walker allies that fight alongside hero
  // DOUBLED SIZE for better visibility - One positioned ABOVE hero, one BELOW hero on the ground
  const createSupportUnits = (playerX: number, playerY: number, playerMaxHealth: number, playerShield: number, existingCount: number): SupportUnit[] => {
    const supportUnits: SupportUnit[] = [];
    // Half of hero's stats
    const halfMaxHealth = Math.floor(playerMaxHealth / 2);
    const halfShield = Math.floor(playerShield / 2);
    
    // Stagger offset based on existing allies to prevent overlap
    const staggerOffset = existingCount * 100;
    
    // Mech unit - DOUBLED SIZE (5x base) - positioned ABOVE hero (higher Y)
    supportUnits.push({
      id: `support-mech-${Date.now()}-${Math.random()}`,
      x: playerX + 60 + staggerOffset,
      y: GROUND_Y_BACK, // Above hero's ground level (back lane)
      width: 260, // DOUBLED - 5x width
      height: 280, // DOUBLED - 5x height
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'mech',
      timer: 20, // 20 seconds - starts AFTER landing
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 1.0,
    });
    
    // Walker unit - DOUBLED SIZE (3x base), positioned BELOW hero (lower Y)
    supportUnits.push({
      id: `support-walker-${Date.now()}-${Math.random()}`,
      x: playerX + 250 + staggerOffset,
      y: GROUND_Y_FRONT, // Below hero's ground level (front lane)
      width: 150, // DOUBLED - 3x width
      height: 170, // DOUBLED - 3x height
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'walker',
      timer: 20, // 20 seconds - starts AFTER landing
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 1.2,
    });
    
    return supportUnits;
  };

  // Create tank support unit - rare drop with armor and lasers
  const createTankSupport = (playerX: number, playerY: number): SupportUnit => {
    return {
      id: `support-tank-${Date.now()}-${Math.random()}`,
      x: playerX + 100,
      y: GROUND_Y,
      width: 300, // 3x size
      height: 210, // 3x size
      health: 300,
      maxHealth: 300,
      shield: 0,
      maxShield: 0,
      type: 'tank',
      timer: 25, // 25 seconds duration
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 0.8,
      hasArmor: true, // Starts with armor
      armorTimer: 10, // 10 seconds of armor
    };
  };

  // Process gift actions
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      // MULTIPLIER NOW BASED ON KILLS - gifts just trigger actions, not multiplier!
      let newState = { 
        ...prev, 
        lastGiftTime: Date.now(),
      };
      
      // FLIP ATTACK - Every 15 KILLS triggers epic flip attack!
      // (Changed from gifts to kills - tracked by killStreak)
      if (prev.killStreak > 0 && prev.killStreak % 15 === 0 && !prev.player.isFlipAttacking && prev.killStreak !== (prev as any).lastFlipTriggerKills) {
        (newState as any).lastFlipTriggerKills = prev.killStreak;
        const heroScreenX = HERO_FIXED_SCREEN_X;
        const heroWorldX = prev.cameraX + heroScreenX + PLAYER_WIDTH / 2;
        
        // Create 8 projectiles in spread pattern
        const flipProjectiles: Projectile[] = [];
        const baseY = GROUND_Y - 80; // Jump height
        const spreadAngles = [-30, -20, -10, 0, 5, 10, 15, 25]; // 8 spread angles
        
        spreadAngles.forEach((angleDeg, idx) => {
          const angleRad = (angleDeg * Math.PI) / 180;
          const speed = 900;
          flipProjectiles.push({
            id: `flip-proj-${Date.now()}-${idx}`,
            x: heroWorldX + 30,
            y: baseY,
            velocityX: Math.cos(angleRad) * speed,
            velocityY: Math.sin(angleRad) * speed * 0.3,
            damage: 80 * prev.giftDamageMultiplier,
            type: 'ultra',
          });
        });
        
        newState.projectiles = [...prev.projectiles, ...flipProjectiles];
        newState.player = {
          ...prev.player,
          isFlipAttacking: true,
          flipAttackTimer: 1.2, // 1.2 second animation
          animationState: 'flip_attack',
          isShooting: true,
        };
        
        // Massive particle burst
        newState.particles = [
          ...prev.particles,
          ...createParticles(heroWorldX, baseY, 30, 'muzzle', '#ff00ff'),
          ...createParticles(heroWorldX, baseY, 20, 'spark', '#00ffff'),
          ...createParticles(heroWorldX, baseY, 15, 'magic', '#ffff00'),
        ];
        
        newState.screenShake = 0.6;
        newState.score += 500;
        showSpeechBubble("🌀 FLIP ATTACK! x8 SHOTS! 🌀", 'excited');
      }
      
      switch (action) {
        case 'move_forward':
          // Hero moves forward, camera follows to create movement feeling
          const moveDistance = 80;
          const newGoCount = (prev as any).goGiftCount + 1;
          
          newState.player = {
            ...prev.player,
            x: prev.player.x + moveDistance,
            animationState: 'run',
          };
          // Camera will smoothly follow via the game loop
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 8, 'dash', '#00ffff')];
          newState.score += 15;
          (newState as any).goGiftCount = newGoCount;
          
          // EVERY 10 GO GIFTS TRIGGERS FLIP ATTACK!
          if (newGoCount % 10 === 0 && !prev.player.isFlipAttacking) {
            const heroScreenX_go = HERO_FIXED_SCREEN_X;
            const heroWorldX_go = prev.cameraX + heroScreenX_go + PLAYER_WIDTH / 2;
            
            // Create 8 projectiles in spread pattern - fire through MIDDLE OF GROUND
            const flipProjectiles_go: Projectile[] = [];
            const baseY_go = GROUND_Y; // Middle ground level for projectiles
            const spreadAngles_go = [-15, -10, -5, 0, 3, 6, 10, 15]; // Tighter spread for ground combat
            
            spreadAngles_go.forEach((angleDeg, idx) => {
              const angleRad = (angleDeg * Math.PI) / 180;
              const speed = 950;
              flipProjectiles_go.push({
                id: `flip-go-${Date.now()}-${idx}`,
                x: heroWorldX_go + 30,
                y: baseY_go,
                velocityX: Math.cos(angleRad) * speed,
                velocityY: Math.sin(angleRad) * speed * 0.15, // Less vertical spread to stay in middle ground
                damage: 90 * prev.giftDamageMultiplier,
                type: 'ultra',
              });
            });
            
            newState.projectiles = [...(newState.projectiles || prev.projectiles), ...flipProjectiles_go];
            newState.player = {
              ...newState.player,
              isFlipAttacking: true,
              flipAttackTimer: 1.2,
              animationState: 'flip_attack',
              isShooting: true,
            };
            
            newState.screenShake = 0.7;
            newState.score += 600;
            showSpeechBubble(`🌀 x${newGoCount} GO! FLIP BARRAGE! 🌀`, 'excited');
          } else {
            showSpeechBubble("MOVING! 🏃", 'normal');
          }
          
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 300);
          break;
          
        case 'shoot':
          // Hero fires BULLET - position changes based on spaceship mode
          const heroScreenX = HERO_FIXED_SCREEN_X;
          const heroWorldX = prev.cameraX + heroScreenX + PLAYER_WIDTH / 2;
          // In spaceship mode, fire from spaceship height, else fire through MIDDLE OF GROUND
          const isSpaceshipMode = prev.player.isMagicDashing;
          // FIXED: All projectiles fire through the MIDDLE OF THE GROUND combat area
          const middleGroundY = GROUND_Y_MIDDLE; // Uses middle lane Y for all ground combat
          const spaceshipY = 200; // Spaceship flying height
          const bulletY = isSpaceshipMode ? spaceshipY + 30 : middleGroundY;
          
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: heroWorldX + (isSpaceshipMode ? 50 : 0), // Spaceship fires from front
            y: bulletY,
            velocityX: isSpaceshipMode ? 1000 : 800, // Faster in spaceship
            velocityY: 0, // Straight horizontal through middle ground
            damage: isSpaceshipMode ? 150 : 60,
            type: isSpaceshipMode ? 'ultra' : 'mega',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          // Particles from correct position
          newState.particles = [...prev.particles,
            ...createParticles(heroWorldX + (isSpaceshipMode ? 50 : 0), bulletY, 15, 'muzzle', isSpaceshipMode ? '#ff00ff' : '#00ffff'),
            ...createParticles(heroWorldX + (isSpaceshipMode ? 55 : 5), bulletY, 6, 'spark', '#ffffff'),
          ];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 150);
          newState.score += 20;
          
          // ALLIES ALSO ATTACK when fire gift is pressed - BULLETS ONLY!
          // Each ally fires bullet projectiles from CENTER OF BODY at nearest enemy
          const activeAllyUnits = prev.supportUnits.filter(u => !u.isLanding && !u.isSelfDestructing && u.health > 0);
          activeAllyUnits.forEach((unit, idx) => {
            // Find ALL enemies in range - allies use bullets for everything
            const allEnemies = prev.enemies.filter(e => 
              !e.isDying && !e.isSpawning && 
              e.x > unit.x - 50 && e.x < unit.x + 600
            ).sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x));
            
            // Bullet originates from CENTER of ally body
            const startX = unit.x + unit.width / 2; // Center X
            const startY = unit.y + unit.height / 2; // Center Y
            
            // Fire BULLET at nearest enemy - constrained to MIDDLE GROUND combat area
            if (allEnemies.length > 0) {
              const target = allEnemies[0];
              const targetX = target.x + target.width / 2;
              // Target the MIDDLE GROUND Y position for consistent combat
              const targetY = target.isFlying ? (target.y || GROUND_Y) + target.height / 2 : GROUND_Y_MIDDLE;
              
              const dx = targetX - startX;
              // Force projectiles to stay in middle ground zone - minimize vertical variance
              const dy = target.isFlying ? (targetY - startY) : 0;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist > 0) {
                const projSpeed = 1100; // Fast bullet
                const proj: Projectile = {
                  id: `ally-bullet-${unit.id}-${Date.now()}-${idx}`,
                  x: startX,
                  y: GROUND_Y_MIDDLE, // Always fire from middle ground level
                  velocityX: (dx / dist) * projSpeed,
                  velocityY: target.isFlying ? (dy / dist) * projSpeed * 0.3 : 0, // Only vertical if targeting flyers
                  damage: unit.type === 'mech' ? 25 : 18, // Mech does more damage
                  type: unit.type === 'mech' ? 'ultra' : 'mega',
                  isAllyProjectile: true,
                };
                newState.supportProjectiles = [...(newState.supportProjectiles || []), proj];
                
                // Bullet muzzle flash at body center
                // PERFORMANCE: No muzzle particles for ally attacks - reduces lag
              }
            }
          });
          
          if (Math.random() > 0.7) {
            const allyCount = activeAllyUnits.length;
            if (allyCount > 0) {
              showSpeechBubble(`SQUAD ATTACK! 🔥🤖`, 'excited');
            } else {
              showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
            }
          }
          break;
          
        case 'armor':
          // Armor is PERMANENT until depleted - no timer!
          newState.player = {
            ...prev.player,
            shield: Math.min(150, prev.player.shield + 60), // Higher max shield
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 15, 'magic', '#00ffff')];
          newState.score += 50;
          newState.screenShake = 0.15;
          showSpeechBubble(`ARMOR UP! +60 SHIELD! 🛡️`, 'excited');
          break;
          
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + 40),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 12, 'magic', '#00ff00')];
          newState.score += 40;
          showSpeechBubble(`THANKS ${username.toUpperCase()}! HEALED! 💚`, 'normal');
          break;
          
        case 'spawn_enemies' as GiftAction:
          // RAY CANNON - 3 second powerful laser that damages everything in its path!
          if (!prev.rayCannonActive) {
            newState.rayCannonActive = true;
            newState.rayCannonTimer = 3; // 3 seconds of destruction
            newState.screenShake = 1.5;
            newState.magicFlash = 1.2;
            newState.score += 150;
            showSpeechBubble("⚡ RAY CANNON ACTIVATED! ⚡", 'excited');
          }
          break;

        case 'emp_grenade' as GiftAction:
          // Check if EMP is available (has charges)
          if (prev.empCharges <= 0) {
            showSpeechBubble("⚡ EMP RELOADING... ⚡", 'normal');
            break;
          }
          
          // Hero THROWS an EMP grenade TO CENTER OF SCREEN - only damages drones!
          const screenCenterX = prev.cameraX + 290;
          const screenCenterY = 200;
          const dx = screenCenterX - (prev.player.x + PLAYER_WIDTH / 2);
          const arcHeight = 300;
          
          const grenade: EMPGrenade = {
            id: `emp-${Date.now()}`,
            x: prev.player.x + PLAYER_WIDTH / 2,
            y: prev.player.y + PLAYER_HEIGHT + 30,
            velocityX: dx / 1.8,
            velocityY: arcHeight,
            timer: 1.8,
          };
          newState.empGrenades = [...prev.empGrenades, grenade];
          newState.empCharges = prev.empCharges - 1;
          newState.empCooldown = 5;
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [
            ...prev.particles, 
            ...createParticles(prev.player.x + PLAYER_WIDTH / 2, prev.player.y + PLAYER_HEIGHT + 50, 10, 'spark', '#00ffff'),
          ];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 300);
          newState.score += 100;
          showSpeechBubble(`⚡ EMP TO CENTER! [${newState.empCharges}/2] ⚡`, 'excited');
          break;
      }
      
      // Mark that first gift was sent - enemies can now start moving/attacking
      newState.firstGiftSent = true;
      
      return newState;
    });
  }, [createParticles, showSpeechBubble]);

  const handleGift = useCallback((event: GiftEvent) => {
    setGiftEvents(prev => [event, ...prev].slice(0, 50));
    setNotifications(prev => [event, ...prev].slice(0, 5));
    
    setLeaderboard(prev => {
      const existing = prev.find(g => g.username === event.username);
      if (existing) {
        return prev.map(g => 
          g.username === event.username 
            ? { ...g, totalDiamonds: g.totalDiamonds + event.gift.diamonds, giftCount: g.giftCount + 1 }
            : g
        ).sort((a, b) => b.totalDiamonds - a.totalDiamonds);
      }
      return [...prev, {
        username: event.username,
        avatar: event.avatar,
        totalDiamonds: event.gift.diamonds,
        giftCount: 1,
      }].sort((a, b) => b.totalDiamonds - a.totalDiamonds);
    });
    
    // Process the gift action (no gift blocks flying)
    processGiftAction(event.gift.action, event.username);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== event.id));
    }, 3000);
  }, [processGiftAction]);

  // Help request timer
  useEffect(() => {
    if (gameState.phase !== 'playing') return;
    
    const checkHelpNeeded = () => {
      const timeSinceLastGift = Date.now() - gameState.lastGiftTime;
      if (timeSinceLastGift >= HELP_REQUEST_DELAY && !gameState.speechBubble) {
        requestHelp();
      }
    };
    
    helpRequestTimerRef.current = setInterval(checkHelpNeeded, 2000);
    return () => {
      if (helpRequestTimerRef.current) clearInterval(helpRequestTimerRef.current);
    };
  }, [gameState.phase, gameState.lastGiftTime, gameState.speechBubble, requestHelp]);

  // Main Game loop
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const gameLoop = () => {
      const now = Date.now();
      const delta = Math.min((now - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = now;

      setGameState(prev => {
        if (prev.phase !== 'playing') return prev;

        let newState = { ...prev };
        
        // Check for boss fight - INITIATE WHEN HERO GETS CLOSE TO BOSS
        const bossEnemy = prev.enemies.find(e => e.type === 'boss' && !e.isDying);
        const BOSS_PROXIMITY_TRIGGER = 600; // Boss fight starts when hero is within 600px of boss
        const distanceToBoss = bossEnemy ? bossEnemy.x - prev.player.x : Infinity;
        newState.isBossFight = bossEnemy !== undefined && distanceToBoss <= BOSS_PROXIMITY_TRIGGER;
        
        // Boss taunt and laugh - taunts both hero AND players
        if (bossEnemy && newState.isBossFight) {
          newState.bossTauntTimer -= delta;
          if (newState.bossTauntTimer <= 0) {
            // Alternate between taunting hero and taunting players/chat
            const tauntToHero = Math.random() > 0.4;
            const tauntList = tauntToHero ? BOSS_TAUNTS_TO_HERO : BOSS_TAUNTS_TO_PLAYERS;
            newState.bossTaunt = tauntList[Math.floor(Math.random() * tauntList.length)];
            newState.bossTauntTimer = 2.5 + Math.random() * 2; // Taunt every 2.5-4.5 seconds (more frequent)
          }
          
          // BOSS SPAWNS MINIONS BASED ON PHASE!
          newState.bossDroneSpawnTimer -= delta;
          if (newState.bossDroneSpawnTimer <= 0) {
            const bossPhase = bossEnemy.bossPhase || 1;
            const droneSpawnX = bossEnemy.x - 50 - Math.random() * 100;
            
            let minionType: 'drone' | 'ninja' | 'tank' | 'mech' = 'drone';
            let minionWidth = 42, minionHeight = 42, minionHealth = 25, minionSpeed = 100, minionDamage = 8;
            let isFlying = true;
            
            // Phase 1: Drones only
            // Phase 2: Drones + Ninjas
            // Phase 3: Drones + Ninjas + Tanks/Mechs
            if (bossPhase >= 3) {
              const roll = Math.random();
              if (roll > 0.7) {
                minionType = 'tank';
                minionWidth = 70; minionHeight = 65; minionHealth = 150; minionSpeed = 25; minionDamage = 20;
                isFlying = false;
              } else if (roll > 0.4) {
                minionType = 'mech';
                minionWidth = 65; minionHeight = 70; minionHealth = 90; minionSpeed = 40; minionDamage = 15;
                isFlying = false;
              } else if (roll > 0.2) {
                minionType = 'ninja';
                minionWidth = 45; minionHeight = 52; minionHealth = 35; minionSpeed = 150; minionDamage = 12;
                isFlying = false;
              }
            } else if (bossPhase >= 2) {
              if (Math.random() > 0.5) {
                minionType = 'ninja';
                minionWidth = 45; minionHeight = 52; minionHealth = 35; minionSpeed = 150; minionDamage = 12;
                isFlying = false;
              }
            }
            
            const newMinion: Enemy = {
              id: `boss-minion-${Date.now()}-${Math.random()}`,
              x: droneSpawnX,
              y: isFlying ? (GROUND_Y + 60 + Math.random() * 80) : GROUND_Y,
              width: minionWidth,
              height: minionHeight,
              health: minionHealth + prev.currentWave * 2,
              maxHealth: minionHealth + prev.currentWave * 2,
              speed: minionSpeed + prev.currentWave * 2,
              damage: minionDamage,
              type: minionType,
              isDying: false,
              deathTimer: 0,
              attackCooldown: 0.5,
              animationPhase: Math.random() * Math.PI * 2,
              isSpawning: true,
              spawnTimer: 0.5,
              isFlying: isFlying,
              flyHeight: isFlying ? (60 + Math.random() * 80) : undefined,
            };
            newState.enemies = [...newState.enemies, newMinion];
            
            // Faster spawns in later phases
            const spawnDelay = bossPhase >= 3 ? 1.2 : bossPhase >= 2 ? 1.8 : 2.5;
            newState.bossDroneSpawnTimer = spawnDelay + Math.random();
            newState.particles = [...newState.particles, ...createParticles(droneSpawnX, newMinion.y, 8, 'spark', '#ff0000')];
          }
        } else {
          newState.bossTaunt = null;
        }
        
        // BOSS ATTACK PATTERNS - varies by wave tier!
        if (bossEnemy && newState.isBossFight) {
          const wave = prev.currentWave;
          const bossPhase = bossEnemy.bossPhase || 1;
          const bossIdx = newState.enemies.findIndex(e => e.id === bossEnemy.id);
          const bossHealthPercent = bossEnemy.health / bossEnemy.maxHealth;
          
          // Attack cooldown
          newState.bossAttackCooldown -= delta;
          
          // BOSS SHIELD TIMER - ALWAYS decrement (FIXED: was only decrementing when cooldown <= 0)
          if (bossIdx !== -1 && bossEnemy.bossShieldTimer && bossEnemy.bossShieldTimer > 0) {
            newState.enemies[bossIdx] = {
              ...newState.enemies[bossIdx],
              bossShieldTimer: Math.max(0, bossEnemy.bossShieldTimer - delta),
            };
          }
          
          // BOSS ARMOR is now activated at Phase 3 (50% health) - see phase transition code below
          // This section removed to prevent duplicate armor activation
          
          if (newState.bossAttackCooldown <= 0 && bossIdx !== -1) {
            
            // LEVEL-SPECIFIC BOSS ATTACK STYLES!
            // Each wave boss has different attack patterns
            const availableAttacks: BossAttackType[] = [];
            
            // Level-specific attack patterns - EACH BOSS HAS UNIQUE SIGNATURE!
            // Attack style defines visual FX color and pattern
            // ALL BOSSES CAN DO JUMP BOMB ATTACK!
            switch (wave) {
              case 1: // NEON GUARDIAN - Single slow fireballs, cyan theme
                // Easy intro boss - telegraphed attacks, slow fireball
                availableAttacks.push('fireball', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 2.5; // Slow attacks
                break;
              case 2: // FACTORY FOREMAN - Fireballs + horizontal laser, orange theme
                // Introduces laser sweep mechanic
                availableAttacks.push('fireball', 'laser_sweep', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 2.0;
                break;
              case 3: // DATA DAEMON - Rapid laser sweeps, purple theme
                // Laser specialist - faster, more dangerous
                availableAttacks.push('laser_sweep', 'laser_sweep', 'laser_sweep', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.5;
                break;
              case 4: // ROOFTOP RAVAGER - Missile barrages from above, red theme
                // Introduces vertical threat with missiles
                availableAttacks.push('missile_barrage', 'missile_barrage', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.8;
                break;
              case 5: // BUNKER BREAKER - Ground pound specialist, green theme
                // Heavy ground attacks, shockwaves
                availableAttacks.push('ground_pound', 'ground_pound', 'ground_pound', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.6;
                break;
              case 6: // HIGHWAY HUNTER - Fast missiles + sweeping lasers, yellow theme
                // Speed-focused, fast attack combinations
                availableAttacks.push('missile_barrage', 'laser_sweep', 'missile_barrage', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.3;
                break;
              case 7: // MALL MONARCH - Varied attacks, pink theme
                // Master of all basic attacks
                availableAttacks.push('fireball', 'laser_sweep', 'missile_barrage', 'ground_pound', 'jump_bomb');
                newState.bossAttackCooldown = 1.4;
                break;
              case 8: // POWER TYRANT - Heavy ground + laser combos, electric blue theme
                // Power-focused, devastating combos
                availableAttacks.push('ground_pound', 'laser_sweep', 'ground_pound', 'laser_sweep', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.2;
                break;
              case 9: // SPACE OVERLORD - Missile hell, cosmic purple theme
                // Overwhelming ranged assault
                availableAttacks.push('missile_barrage', 'missile_barrage', 'missile_barrage', 'laser_sweep', 'fireball', 'jump_bomb');
                newState.bossAttackCooldown = 1.0;
                break;
              case 10: // OMEGA DESTROYER - ALL attacks + screen attack + neon laser, blood red theme
                // Final boss - uses everything, including screen-wide attack and neon laser
                availableAttacks.push('fireball', 'laser_sweep', 'missile_barrage', 'ground_pound', 'screen_attack', 'jump_bomb', 'neon_laser');
                newState.bossAttackCooldown = 0.8;
                break;
              default: // Higher waves - all attacks with phase scaling + neon laser
                availableAttacks.push('fireball', 'laser_sweep', 'missile_barrage', 'ground_pound', 'jump_bomb', 'neon_laser');
                if (bossPhase >= 3) availableAttacks.push('screen_attack');
                newState.bossAttackCooldown = Math.max(0.5, 1.5 - wave * 0.1);
            }
            
            // More attacks in higher phases
            const attackChance = bossPhase >= 3 ? 0.4 : bossPhase >= 2 ? 0.6 : 0.8;
            
            if (Math.random() > attackChance) {
              const attackType = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
              
              // Set the last boss attack for sound effect triggers
              newState.lastBossAttack = attackType;
              
              switch (attackType) {
                case 'fireball':
                  // Standard fireball(s)
                  const fireballCount = Math.min(1 + Math.floor(wave / 50), 5);
                  for (let i = 0; i < fireballCount; i++) {
                    const fireball: Fireball = {
                      id: `fireball-${Date.now()}-${i}`,
                      x: bossEnemy.x,
                      y: bossEnemy.y + bossEnemy.height / 2 + (i - fireballCount/2) * 20,
                      velocityX: -500 - wave * 2,
                      velocityY: (prev.player.y - bossEnemy.y) * 0.5 + (i - fireballCount/2) * 40,
                      damage: 25 + Math.floor(wave / 10), // INCREASED boss fireball damage
                    };
                    newState.fireballs = [...newState.fireballs, fireball];
                  }
                  newState.screenShake = 0.3;
                  showSpeechBubble("🔥 FIREBALL! 🔥", 'urgent');
                  break;
                  
                case 'laser_sweep':
                  // Laser sweep attack - sweeps across arena
                  newState.laserSweepAngle = Math.PI; // Start from boss side
                  const sweepLasers = Math.min(3 + Math.floor(wave / 100), 8);
                  for (let i = 0; i < sweepLasers; i++) {
                    const angle = -Math.PI/3 + (i / sweepLasers) * (2 * Math.PI / 3);
                    const laser: Projectile = {
                      id: `sweep-laser-${Date.now()}-${i}`,
                      x: bossEnemy.x,
                      y: bossEnemy.y + bossEnemy.height / 2,
                      velocityX: Math.cos(angle) * (400 + wave * 3),
                      velocityY: Math.sin(angle) * (400 + wave * 3),
                      damage: 35 + Math.floor(wave / 8), // MASSIVE laser sweep damage
                      type: 'ultra',
                    };
                    newState.enemyLasers = [...newState.enemyLasers, laser];
                  }
                  newState.screenShake = 0.5;
                  newState.redFlash = 0.5;
                  newState.bossTaunt = "LASER SWEEP!";
                  showSpeechBubble("⚡ LASER SWEEP! DODGE! ⚡", 'urgent');
                  break;
                  
                case 'missile_barrage':
                  // Raining missiles from above
                  const missileCount = Math.min(5 + Math.floor(wave / 50), 12);
                  for (let i = 0; i < missileCount; i++) {
                    setTimeout(() => {
                      setGameState(s => ({
                        ...s,
                        fireballs: [...s.fireballs, {
                          id: `missile-${Date.now()}-${i}`,
                          x: prev.cameraX + 50 + Math.random() * 500,
                          y: 300, // From above
                          velocityX: (Math.random() - 0.5) * 100,
                          velocityY: -400 - wave * 2,
                          damage: 20 + Math.floor(wave / 15), // INCREASED missile damage
                        }],
                        particles: [...s.particles, ...createParticles(
                          prev.cameraX + 50 + Math.random() * 500, 280, 5, 'spark', '#ff8800'
                        )],
                      }));
                    }, i * 100);
                  }
                  newState.screenShake = 0.4;
                  newState.bossTaunt = "MISSILE BARRAGE!";
                  showSpeechBubble("🚀 MISSILES! TAKE COVER! 🚀", 'urgent');
                  break;
                  
                case 'ground_pound':
                  // Ground pound - shockwave
                  newState.screenShake = 1.5;
                  newState.redFlash = 1;
                  const shockwaveDamage = 30 + Math.floor(wave / 10); // INCREASED ground pound damage
                  // Create shockwave projectiles traveling along ground
                  for (let i = 0; i < 3; i++) {
                    const shockwave: Projectile = {
                      id: `shockwave-${Date.now()}-${i}`,
                      x: bossEnemy.x - 30 * i,
                      y: GROUND_Y + 30,
                      velocityX: -600 - i * 50,
                      velocityY: 0,
                      damage: shockwaveDamage,
                      type: 'mega',
                    };
                    newState.enemyLasers = [...newState.enemyLasers, shockwave];
                  }
                  // Ground particles
                  for (let i = 0; i < 15; i++) {
                    newState.particles = [...newState.particles, ...createParticles(
                      bossEnemy.x - 50 - i * 30, GROUND_Y + 20, 3, 'explosion', '#ff4400'
                    )];
                  }
                  newState.bossTaunt = "GROUND POUND!";
                  showSpeechBubble("💥 GROUND POUND! JUMP! 💥", 'urgent');
                  break;
                  
                case 'screen_attack':
                  // Screen-wide attack - final boss special!
                  if (wave >= 100 || bossPhase >= 3) {
                    newState.redFlash = 2;
                    newState.screenShake = 2;
                    // Warning flash first
                    setTimeout(() => {
                      setGameState(s => {
                        // Deal MASSIVE damage if no shield - screen attack is devastating
                        const damage = s.player.shield > 0 
                          ? 0 
                          : Math.min(60 + Math.floor(wave / 5), 100); // INCREASED screen attack damage
                        return {
                          ...s,
                          player: { 
                            ...s.player, 
                            health: Math.max(1, s.player.health - damage),
                            shield: Math.max(0, s.player.shield - 50),
                          },
                          damageFlash: damage > 0 ? 1.5 : 0,
                          shieldBlockFlash: s.player.shield > 0 ? 1.5 : 0,
                          screenShake: 2,
                          particles: [...s.particles, 
                            ...createParticles(s.player.x, s.player.y, 30, 'explosion', '#ff0000'),
                          ],
                        };
                      });
                    }, 500);
                    newState.bossTaunt = "ULTIMATE DESTRUCTION!!!";
                    showSpeechBubble("☠️ SCREEN ATTACK! GET SHIELD! ☠️", 'urgent');
                  }
                  break;
                  
                case 'shield':
                  // Shield is now auto-activated at 70% health - this case is legacy/unused
                  // Do nothing - shield activation moved to health-based trigger above
                  break;
                  
                case 'jump_bomb':
                  // BOSS JUMP ATTACK - Jumps off screen, drops bombs, lands back (6 seconds total)
                  // Only if not already doing jump attack
                  if (!bossEnemy.isJumpAttacking) {
                    newState.enemies[bossIdx] = {
                      ...newState.enemies[bossIdx],
                      isJumpAttacking: true,
                      jumpAttackTimer: BOSS_JUMP_ATTACK_DURATION,
                      jumpAttackPhase: 'jumping',
                      originalBossY: bossEnemy.y,
                    };
                    newState.screenShake = 1.0;
                    newState.bossTaunt = "I'LL CRUSH YOU FROM ABOVE!";
                    showSpeechBubble("⚠️ BOSS JUMPING! WATCH THE SKY! ⚠️", 'urgent');
                    newState.particles = [...newState.particles, ...createParticles(
                      bossEnemy.x + bossEnemy.width / 2, bossEnemy.y, 
                      30, 'explosion', '#ff4400'
                    )];
                  }
                  break;
              }
              
              // Set cooldown based on phase
              const baseCooldown = wave >= 100 ? 2 : 3;
              newState.bossAttackCooldown = baseCooldown - (bossPhase * 0.4) + Math.random();
            }
          }
          
          // Boss phase transitions - LEVELS 1-5 only 2 phases, LEVELS 6+ get 3 phases
          if (bossIdx !== -1) {
            const currentPhase = newState.enemies[bossIdx].bossPhase || 1;
            const isEarlyBoss = wave <= 5;
            
            // EARLY BOSSES (1-5): Only 2 phases, less dramatic effects
            if (isEarlyBoss) {
              // Phase 2: 50% health - FINAL PHASE for early bosses with armor
              if (bossHealthPercent <= 0.5 && currentPhase < 2) {
                newState.enemies[bossIdx] = {
                  ...newState.enemies[bossIdx],
                  bossPhase: 2,
                  width: newState.enemies[bossIdx].width * 1.1, // Smaller growth
                  height: newState.enemies[bossIdx].height * 1.1,
                  damage: newState.enemies[bossIdx].damage * 1.2,
                  speed: newState.enemies[bossIdx].speed * 1.2,
                  // Early bosses get SHORTER armor duration
                  bossShieldTimer: 5, // 5 seconds armor (half of normal)
                  bossShieldUsed: true,
                };
                // REDUCED effects for early bosses to decrease lag
                newState.screenShake = 1.5;
                newState.redFlash = 1;
                newState.bossTransformFlash = 1;
                newState.bossTaunt = "FINAL FORM!";
                newState.lastBossAttack = 'shield';
                showSpeechBubble("💀 BOSS ENRAGED! FINAL PHASE! 💀", 'urgent');
              }
            } else {
              // LATER BOSSES (6+): Full 3 phases with all effects
              // Phase 2: 70% health
              if (bossHealthPercent <= BOSS_PHASE_2_THRESHOLD && currentPhase < 2) {
                newState.enemies[bossIdx] = {
                  ...newState.enemies[bossIdx],
                  bossPhase: 2,
                  width: newState.enemies[bossIdx].width * 1.1,
                  height: newState.enemies[bossIdx].height * 1.1,
                  damage: newState.enemies[bossIdx].damage * 1.3,
                  speed: newState.enemies[bossIdx].speed * 1.3,
                };
                // Moderate transformation effects
                newState.screenShake = 2;
                newState.redFlash = 1.5;
                newState.bossTransformFlash = 1.5;
                newState.bossTaunt = "PHASE 2! I GROW STRONGER!";
                showSpeechBubble("💀 BOSS EVOLVED! PHASE 2! 💀", 'urgent');
              }
              
              // Phase 3: 50% health - MAXIMUM TRANSFORMATION + ARMOR ACTIVATION
              if (bossHealthPercent <= BOSS_PHASE_3_THRESHOLD && currentPhase < 3) {
                newState.enemies[bossIdx] = {
                  ...newState.enemies[bossIdx],
                  bossPhase: 3,
                  width: newState.enemies[bossIdx].width * 1.15,
                  height: newState.enemies[bossIdx].height * 1.15,
                  damage: newState.enemies[bossIdx].damage * 1.5,
                  speed: newState.enemies[bossIdx].speed * 1.5,
                  // ARMOR ACTIVATES AT PHASE 3!
                  bossShieldTimer: BOSS_ARMOR_DURATION,
                  bossShieldUsed: true,
                };
                // Full dramatic effects for later bosses
                newState.screenShake = 3;
                newState.redFlash = 2;
                newState.magicFlash = 1;
                newState.bossTransformFlash = 2;
                newState.bossTaunt = "FINAL PHASE! ARMOR ACTIVATED!";
                newState.lastBossAttack = 'shield';
                showSpeechBubble("☠️ BOSS RAGE MODE! PHASE 3! ☠️", 'urgent');
              }
            }
          }
          
          // Mega attack at very low health (once)
          if (bossHealthPercent <= BOSS_MEGA_ATTACK_THRESHOLD && !newState.bossMegaAttackUsed) {
            newState.bossMegaAttackUsed = true;
            if (newState.player.shield > 0) {
              newState.player.shield = 0;
              newState.shieldBlockFlash = 2;
            } else {
              newState.player.health = Math.max(1, newState.player.health - 60);
              newState.damageFlash = 2;
            }
            newState.redFlash = 2;
            newState.screenShake = 2.5;
            newState.bossTaunt = "MEGA ATTACK! DIE!!!";
            showSpeechBubble("💀 MEGA ATTACK! 60% DMG! 💀", 'urgent');
          }
        }
        
        // Update fireballs
        newState.fireballs = newState.fireballs
          .map(f => ({ ...f, x: f.x + f.velocityX * delta, y: f.y + f.velocityY * delta }))
          .filter(f => f.x > prev.cameraX - 100);
        
        // Fireball-player collision - ARMOR ABSORBS DAMAGE with impact FX
        newState.fireballs.forEach(fireball => {
          if (
            fireball.x < prev.player.x + PLAYER_WIDTH &&
            fireball.x + 30 > prev.player.x &&
            fireball.y < prev.player.y + PLAYER_HEIGHT &&
            fireball.y + 30 > prev.player.y
          ) {
            if (newState.player.shield > 0) {
              // ARMOR ABSORBS FIREBALL!
              newState.player.shield = Math.max(0, newState.player.shield - fireball.damage);
              newState.shieldBlockFlash = 1;
              newState.screenShake = 0.3;
              newState.particles = [
                ...newState.particles, 
                ...createParticles(fireball.x, fireball.y, 25, 'spark', '#00ffff'),
                ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 15, 'spark', '#00ffff'),
              ];
              
              // Taunt on block!
              if (Math.random() > 0.6) {
                const taunt = ENEMY_TAUNTS[Math.floor(Math.random() * ENEMY_TAUNTS.length)];
                showSpeechBubble(taunt, 'excited');
              }
            } else {
              // NO ARMOR - Take damage
              newState.player.health -= fireball.damage;
              newState.player.animationState = 'hurt';
              newState.damageFlash = 1;
              newState.screenShake = 0.4;
              if (navigator.vibrate) {
                navigator.vibrate(150);
              }
              
              // Ask for gifts!
              if (Math.random() > 0.5) {
                const request = GIFT_REQUESTS[Math.floor(Math.random() * GIFT_REQUESTS.length)];
                showSpeechBubble(request, 'help');
              }
            }
            newState.fireballs = newState.fireballs.filter(f => f.id !== fireball.id);
            newState.particles = [...newState.particles, ...createParticles(fireball.x, fireball.y, 15, 'explosion', '#ff4400')];
            newState.screenShake = 0.4;
          }
        });
        
        // Update gift blocks - animate them moving forward on the floor
        newState.giftBlocks = prev.giftBlocks
          .map(block => ({
            ...block,
            x: block.x + block.velocityX * delta,
            life: block.life - delta,
          }))
          .filter(block => block.life > 0 && block.x < prev.cameraX + 700);
        
        // Update EMP Grenades - arc trajectory and explosion
        newState.empGrenades = prev.empGrenades
          .map(g => ({
            ...g,
            x: g.x + g.velocityX * delta,
            y: g.y + g.velocityY * delta,
            velocityY: g.velocityY - 450 * delta, // Slower gravity for higher arc
            timer: g.timer - delta,
          }))
          .filter(g => g.timer > 0);
        
        // Check for EMP grenade explosions - KILLS ALL FLYING ENEMIES (drones, bombers, flyers, jetrobots)!
        prev.empGrenades.forEach(grenade => {
          if (grenade.timer <= delta) {
            // EXPLODE AT CENTER! Kill ALL flying enemies within explosion radius
            const EMP_EXPLOSION_RADIUS = 350; // Large explosion radius
            
            // Find ALL flying/drone type enemies - EMP kills them all
            const flyingEnemiesKilled = newState.enemies.filter(e => {
              const isFlying = e.isFlying || e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer' || e.type === 'jetrobot';
              const inRange = Math.abs(e.x - grenade.x) < EMP_EXPLOSION_RADIUS;
              return isFlying && !e.isDying && !e.isSpawning && inRange && e.type !== 'boss';
            });
            
            flyingEnemiesKilled.forEach(enemy => {
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  isDying: true,
                  deathTimer: 0.5,
                  health: 0,
                };
                const scoreMap: Record<string, number> = { drone: 75, bomber: 120, flyer: 80, jetrobot: 150 };
                newState.score += scoreMap[enemy.type] || 75;
                newState.combo++;
                newState.killStreak++;
                newState.particles = [...newState.particles, ...createParticles(
                  enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                  35, 'spark', '#00ffff'
                )];
              }
            });
            
            // Big EMP explosion effect at grenade position - MASSIVE visual at CENTER
            newState.particles = [
              ...newState.particles,
              ...createParticles(grenade.x, grenade.y, 60, 'spark', '#00ffff'),
              ...createParticles(grenade.x, grenade.y, 50, 'explosion', '#ffff00'),
              ...createParticles(grenade.x, grenade.y, 35, 'magic', '#00ff88'),
            ];
            newState.screenShake = 1.2;
            newState.magicFlash = 1.0;
            
            if (flyingEnemiesKilled.length > 0) {
              showSpeechBubble(`⚡ EMP BLAST! ${flyingEnemiesKilled.length} FLYING ENEMIES DOWN! ⚡`, 'excited');
            } else {
              showSpeechBubble("⚡ EMP DEPLOYED! ALL DRONES BEWARE! ⚡", 'funny');
            }
          }
        });
        
        // Update bombs dropped by bombers - falling and collision
        newState.bombs = (prev.bombs || [])
          .map(b => ({
            ...b,
            y: b.y - 200 * delta, // Fall down (y decreases = falls toward ground)
            timer: b.timer - delta,
          }))
          .filter(b => b.y > 0 && b.timer > 0);
        
        // Bomb-player collision - ARMOR BLOCKS BOMBS! - AOE DAMAGE
        const BOMB_AOE_RADIUS = 100; // AOE radius for bomb explosions
        (prev.bombs || []).forEach(bomb => {
          const bombScreenX = bomb.x - prev.cameraX;
          const heroScreenX = 60; // Hero's fixed screen position
          
          // Check if bomb hit ground (raised ground at 160)
          if (bomb.y <= 180 && bomb.timer > 0) {
            // AOE damage check - affects hero AND support units within radius
            const heroDistToBomb = Math.abs(bombScreenX - heroScreenX);
            const hitHero = heroDistToBomb < BOMB_AOE_RADIUS;
            
            // Check if bomb hits support units (AOE)
            newState.supportUnits = newState.supportUnits.map(unit => {
              const unitScreenX = unit.x - prev.cameraX;
              const distToUnit = Math.abs(bombScreenX - unitScreenX);
              if (distToUnit < BOMB_AOE_RADIUS) {
                const aoeDamage = bomb.damage * (1 - distToUnit / BOMB_AOE_RADIUS) * 0.8;
                if (unit.shield > 0) {
                  return { ...unit, shield: Math.max(0, unit.shield - aoeDamage) };
                } else {
                  return { ...unit, health: unit.health - aoeDamage };
                }
              }
              return unit;
            });
            
            // Hero damage (if in range)
            if (hitHero) {
              const aoeDamageFactor = 1 - heroDistToBomb / BOMB_AOE_RADIUS;
              const aoeDamage = bomb.damage * aoeDamageFactor;
              
              if (newState.player.shield > 0) {
                // ARMOR BLOCKS THE BOMB!
                newState.player.shield = Math.max(0, newState.player.shield - aoeDamage * 0.7);
                newState.shieldBlockFlash = 1;
                newState.screenShake = 0.4;
                newState.particles = [
                  ...newState.particles, 
                  ...createParticles(bomb.x, 180, 20, 'spark', '#00ffff'),
                  ...createParticles(bomb.x, 180, 15, 'explosion', '#ffff00'),
                ];
                showSpeechBubble("🛡️ BOMB BLOCKED! 🛡️", 'excited');
              } else {
                // No armor - take damage!
                newState.player.health -= aoeDamage;
                newState.player.animationState = 'hurt';
                newState.damageFlash = 1.2;
                newState.screenShake = 0.6;
                newState.particles = [
                  ...newState.particles, 
                  ...createParticles(bomb.x, 180, 25, 'explosion', '#ff4400'),
                ];
                if (navigator.vibrate) {
                  navigator.vibrate(200);
                }
                showSpeechBubble("💣 OUCH! BOMB HIT! 💣", 'urgent');
              }
            }
            
            // Always create explosion effect when bomb hits ground
            newState.particles = [
              ...newState.particles, 
              ...createParticles(bomb.x, 165, 15, 'explosion', '#ff8800'),
            ];
            
            // Remove the bomb
            newState.bombs = newState.bombs.filter(b => b.id !== bomb.id);
          }
        });
        
        // REMOVED: Neon beam update - All attacks are now projectiles only
        
        // Magic flash decay
        if (prev.magicFlash > 0) {
          newState.magicFlash = prev.magicFlash - delta * 2;
        }
        
        // Red flash decay
        if (prev.redFlash > 0) {
          newState.redFlash = prev.redFlash - delta;
        }
        
        // (armor timer removed - shield is permanent until depleted)
        
        // Damage flash decay
        if (prev.damageFlash > 0) {
          newState.damageFlash = Math.max(0, prev.damageFlash - delta * 4);
        }
        
        // Shield block flash decay
        if (prev.shieldBlockFlash > 0) {
          newState.shieldBlockFlash = Math.max(0, prev.shieldBlockFlash - delta * 5);
        }
        
        // Boss transformation flash decay
        if (prev.bossTransformFlash > 0) {
          newState.bossTransformFlash = Math.max(0, prev.bossTransformFlash - delta * 3);
        }
        
        // Evasion popup timer decay
        if (prev.evasionPopup && prev.evasionPopup.timer > 0) {
          newState.evasionPopup = { ...prev.evasionPopup, timer: prev.evasionPopup.timer - delta };
          if (newState.evasionPopup.timer <= 0) {
            newState.evasionPopup = null;
          }
        }
        // PARTICLE CLEANUP - Aggressive cleanup every frame to prevent residue
        newState.particleResetTimer = prev.particleResetTimer - delta;
        
        // ULTRA-AGGRESSIVE particle cleanup - instant decay to prevent ANY residue
        newState.particles = prev.particles
          .filter(p => p.life > 0.005)
          .map(p => ({
            ...p,
            life: p.life - delta * 20, // VERY fast decay (was 12)
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
          }))
          .filter(p => {
            // Remove particles that go off-screen - tighter bounds
            const screenX = p.x - newState.cameraX;
            return screenX > -30 && screenX < 700 && p.y > -30 && p.y < 450;
          })
          .slice(-2); // HARD LIMIT: Max 2 particles at any time
        
        // Full reset every 0.5 seconds (faster cleanup to prevent residue)
        if (newState.particleResetTimer <= 0) {
          newState.particles = [];
          newState.supportProjectiles = [];
          newState.fireballs = newState.fireballs.filter(f => {
            const screenX = f.x - newState.cameraX;
            return screenX > -50 && screenX < 700;
          });
          newState.projectiles = newState.projectiles.filter(p => {
            const screenX = p.x - newState.cameraX;
            return screenX > -50 && screenX < 700;
          });
          newState.enemyLasers = newState.enemyLasers.filter(l => {
            const screenX = l.x - newState.cameraX;
            return screenX > -50 && screenX < 700;
          });
          // AGGRESSIVE: Clean neon lasers that are stuck
          newState.neonLasers = (newState.neonLasers || []).filter(l => l.life > 0 && l.bounces >= 0);
          newState.particleResetTimer = 0.5; // Reset every 0.5 seconds
        }
        
        // STRICT LIMITS - very low to prevent lag and stuck FX
        if (newState.particles.length > 2) {
          newState.particles = newState.particles.slice(-2);
        }
        if ((newState.supportProjectiles || []).length > MAX_SUPPORT_PROJECTILES) {
          newState.supportProjectiles = (newState.supportProjectiles || []).slice(-MAX_SUPPORT_PROJECTILES);
        }
        // Limit regular projectiles tightly
        if (newState.projectiles.length > 5) {
          newState.projectiles = newState.projectiles.slice(-5);
        }
        // Limit enemy lasers to prevent stuck FX
        if (newState.enemyLasers.length > 10) {
          newState.enemyLasers = newState.enemyLasers.slice(-10);
        }
        // Limit fireballs
        if (newState.fireballs.length > 6) {
          newState.fireballs = newState.fireballs.slice(-6);
        }
        
        // Summon cooldowns tick down
        if (prev.allyCooldown > 0) {
          newState.allyCooldown = Math.max(0, prev.allyCooldown - delta);
        }
        if (prev.ultCooldown > 0) {
          newState.ultCooldown = Math.max(0, prev.ultCooldown - delta);
        }
        if (prev.tankCooldown > 0) {
          newState.tankCooldown = Math.max(0, prev.tankCooldown - delta);
        }
        
        // EMP cooldown recharge
        if (prev.empCooldown > 0) {
          newState.empCooldown = prev.empCooldown - delta;
          if (newState.empCooldown <= 0 && prev.empCharges < 2) {
            newState.empCharges = Math.min(2, prev.empCharges + 1);
            newState.empCooldown = prev.empCharges < 1 ? 5 : 0;
          }
        }
        
        // RAY CANNON - 3 second laser that damages all visible enemies
        if (prev.rayCannonActive && prev.rayCannonTimer > 0) {
          newState.rayCannonTimer = prev.rayCannonTimer - delta;
          
          // Continuous damage to ALL visible enemies!
          const rayDamagePerSecond = 80 * prev.giftDamageMultiplier;
          const rayDamage = rayDamagePerSecond * delta;
          
          newState.enemies = newState.enemies.map(enemy => {
            if (enemy.isDying || enemy.isSpawning) return enemy;
            
            // Hit all enemies in front of hero
            if (enemy.x > prev.player.x && enemy.x < prev.cameraX + 700) {
              const newHealth = enemy.health - rayDamage;
              
              // Check for kill
              if (newHealth <= 0 && !enemy.isDying) {
                newState.score += enemy.type === 'boss' ? 2500 : 100;
                newState.killStreak++;
                return { ...enemy, health: 0, isDying: true, deathTimer: 0.5 };
              }
              
              return { ...enemy, health: newHealth };
            }
            return enemy;
          });
          
          // Continuous screen shake during ray cannon
          newState.screenShake = Math.max(newState.screenShake, 0.5);
          
          // Deactivate when timer runs out
          if (newState.rayCannonTimer <= 0) {
            newState.rayCannonActive = false;
            newState.rayCannonTimer = 0;
            showSpeechBubble("⚡ RAY CANNON COMPLETE! ⚡", 'excited');
          }
        }
        
        // Time since game start for attack delay check (used later in enemy attack section)
        // Magic Dash auto-actions - NUKE ALL ENEMIES ON SCREEN
        if (prev.player.isMagicDashing) {
          newState.player = {
            ...newState.player,
            magicDashTimer: prev.player.magicDashTimer - delta,
            isShooting: true,
          };
          
          // Fly forward faster
          newState.player.x += 350 * delta;
          newState.player.animationState = 'dash';
          
          // NUKE: Kill all visible enemies while magic dashing
          const visibleEnemies = newState.enemies.filter(e => 
            !e.isDying && 
            !e.isSpawning &&
            e.x > prev.cameraX - 50 && 
            e.x < prev.cameraX + 600
          );
          
          visibleEnemies.forEach(enemy => {
            if (enemy.type !== 'boss') {
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1 && !newState.enemies[enemyIdx].isDying) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  isDying: true,
                  deathTimer: 0.5,
                };
                const scoreMap: Record<string, number> = { tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250 };
                newState.score += scoreMap[enemy.type] || 60;
                newState.combo++;
                newState.killStreak++;
                
                // Explosion particles for each enemy
                newState.particles = [...newState.particles, ...createParticles(
                  enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                  20, 'explosion', '#ff00ff'
                )];
              }
            } else {
              // Boss takes heavy damage from nuke
              const bossIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (bossIdx !== -1) {
                newState.enemies[bossIdx] = {
                  ...newState.enemies[bossIdx],
                  health: newState.enemies[bossIdx].health - 200 * delta,
                };
                newState.particles = [...newState.particles, ...createParticles(
                  enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                  5, 'spark', '#ff00ff'
                )];
              }
            }
          });
          
          // Trail particles
          if (Math.random() > 0.2) {
            newState.particles = [...newState.particles, ...createParticles(
              newState.player.x + Math.random() * PLAYER_WIDTH, 
              newState.player.y + Math.random() * PLAYER_HEIGHT, 
              6, 'ultra', '#ff00ff'
            )];
          }
          
          // Screen shake during nuke
          newState.screenShake = 0.3;
          
          if (newState.player.magicDashTimer <= 0) {
            newState.player.isMagicDashing = false;
            newState.player.isShooting = false;
            newState.player.animationState = 'idle';
            showSpeechBubble("NUKE COMPLETE! 💥", 'excited');
          }
        }
        
        // FLIP ATTACK TIMER - count down and reset when done
        if (prev.player.isFlipAttacking && prev.player.flipAttackTimer) {
          newState.player = {
            ...newState.player,
            flipAttackTimer: prev.player.flipAttackTimer - delta,
          };
          
          if (newState.player.flipAttackTimer <= 0) {
            newState.player.isFlipAttacking = false;
            newState.player.flipAttackTimer = 0;
            newState.player.isShooting = false;
            newState.player.animationState = 'idle';
          }
        }
        
        // Update chickens - ATTACK ENEMIES!
        newState.chickens = prev.chickens
          .map(chicken => {
            let newChicken = { ...chicken, timer: chicken.timer - delta };
            
            // Attacking chickens fly toward enemies
            if (chicken.state === 'attacking' && chicken.targetEnemyId) {
              const targetEnemy = newState.enemies.find(e => e.id === chicken.targetEnemyId && !e.isDying);
              
              if (targetEnemy) {
                // Move toward enemy
                const dx = targetEnemy.x + targetEnemy.width / 2 - chicken.x;
                const dy = (targetEnemy.y + targetEnemy.height / 2) - chicken.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 20) {
                  const speed = 450;
                  newChicken.x = chicken.x + (dx / dist) * speed * delta;
                  newChicken.y = chicken.y + (dy / dist) * speed * delta;
                } else {
                  // HIT! Damage enemy and chicken disappears
                  const enemyIdx = newState.enemies.findIndex(e => e.id === chicken.targetEnemyId);
                  if (enemyIdx !== -1) {
                    newState.enemies[enemyIdx] = {
                      ...newState.enemies[enemyIdx],
                      health: newState.enemies[enemyIdx].health - 50,
                    };
                    newState.particles = [...newState.particles, ...createParticles(chicken.x, chicken.y, 15, 'explosion', '#ff8800')];
                    newState.score += 30;
                    
                    if (newState.enemies[enemyIdx].health <= 0) {
                      newState.enemies[enemyIdx].isDying = true;
                      newState.enemies[enemyIdx].deathTimer = 0.4;
                      newState.score += 50;
                      newState.combo++;
                    }
                  }
                  newChicken.state = 'gone';
                }
              } else {
                // No target, just fly forward
                newChicken.x = chicken.x + (chicken.velocityX || 300) * delta;
                newChicken.y = chicken.y + Math.sin(chicken.timer * 8) * 30 * delta;
                if (newChicken.x > prev.cameraX + 800) {
                  newChicken.state = 'gone';
                }
              }
            } else if (chicken.state === 'appearing') {
              if (newChicken.timer <= 2) {
                newChicken.state = 'stopped';
              }
            } else if (chicken.state === 'stopped') {
              if (newChicken.timer <= 1) {
                newChicken.state = 'walking';
              }
            } else if (chicken.state === 'walking') {
              newChicken.x = chicken.x + chicken.direction * 60 * delta;
            }
            
            if (newChicken.timer <= 0) {
              newChicken.state = 'gone';
            }
            return newChicken;
          })
          .filter(c => c.state !== 'gone');
        
        // UPDATE SUPPORT UNITS - move with hero, shoot enemies, count down timer
        const SELF_DESTRUCT_AOE_RADIUS = 120; // AOE damage radius
        const SELF_DESTRUCT_DAMAGE = 150; // Damage dealt on self-destruct
        
        newState.supportUnits = (prev.supportUnits || [])
          .map(unit => {
            // Timer only counts down AFTER landing
            const timerDecrement = unit.isLanding ? 0 : delta;
            
            let newUnit = { 
              ...unit, 
              timer: unit.timer - timerDecrement,
              attackCooldown: Math.max(0, unit.attackCooldown - delta),
            };
            
            // Handle landing animation
            if (unit.isLanding && unit.landingTimer !== undefined) {
              newUnit.landingTimer = (unit.landingTimer || 1) - delta;
              if (newUnit.landingTimer <= 0) {
                newUnit.isLanding = false;
                // TANK LANDING SCREEN SHAKE - big impact!
                if (unit.type === 'tank') {
                  newState.screenShake = 1.0; // Heavy screen shake
                  newState.explosions = [...(newState.explosions || []), {
                    id: `tank-landing-${Date.now()}`,
                    x: newUnit.x + newUnit.width / 2,
                    y: GROUND_Y,
                    size: 120,
                    timer: 0.5,
                  }];
                  showSpeechBubble("💥 TANK DEPLOYED! 💥", 'excited');
                }
              }
            }
            
            // Handle tank armor timer countdown
            if (unit.type === 'tank' && unit.hasArmor && unit.armorTimer !== undefined && unit.armorTimer > 0) {
              newUnit.armorTimer = unit.armorTimer - delta;
              if (newUnit.armorTimer <= 0) {
                newUnit.hasArmor = false;
                newUnit.armorTimer = 0;
              }
            }
            
            // Check if unit should start self-destruct (health critical or timer almost up)
            const shouldSelfDestruct = (newUnit.health <= 0 || newUnit.timer <= 0.5) && !unit.isSelfDestructing && !unit.isLanding;
            
            if (shouldSelfDestruct) {
              // RESET ALL PARTICLES AND PROJECTILES when ally starts self-destructing (clean up visual clutter)
              newState.particles = [];
              newState.supportProjectiles = [];
              newState.neonLasers = []; // Also clear neon lasers
              
              // Find nearest enemy to fly toward (including flying drones)
              const nearestEnemy = newState.enemies
                .filter(e => !e.isDying && !e.isSpawning && e.x > unit.x)
                .sort((a, b) => {
                  // Calculate true distance including Y position for flying enemies
                  const distA = Math.sqrt(Math.pow(a.x - unit.x, 2) + Math.pow((a.y || GROUND_Y) - unit.y, 2));
                  const distB = Math.sqrt(Math.pow(b.x - unit.x, 2) + Math.pow((b.y || GROUND_Y) - unit.y, 2));
                  return distA - distB;
                })[0];
              
              newUnit.isSelfDestructing = true;
              newUnit.selfDestructTimer = 1.0; // 1 second to reach and explode
              newUnit.targetEnemyId = nearestEnemy?.id;
              newUnit.health = Math.max(1, newUnit.health); // Keep alive during self-destruct
              newUnit.timer = 2; // Extend timer for self-destruct animation
              
              // Reset all enemy targetType when ally starts self-destructing
              newState.enemies = newState.enemies.map(e => ({ ...e, targetType: undefined }));
            }
            
            // Handle self-destruct flying forward
            if (unit.isSelfDestructing) {
              newUnit.selfDestructTimer = (unit.selfDestructTimer || 1) - delta;
              
              // Fly toward the closest enemy (including upward for flying enemies)
              const targetEnemy = newState.enemies.find(e => e.id === unit.targetEnemyId);
              if (targetEnemy) {
                // Move toward target enemy position
                const dx = targetEnemy.x - newUnit.x;
                const dy = (targetEnemy.y || GROUND_Y) - newUnit.y;
                const speed = 500;
                newUnit.x += (dx > 0 ? 1 : -1) * Math.min(Math.abs(dx), speed * delta);
                newUnit.y += (dy > 0 ? 1 : -1) * Math.min(Math.abs(dy), speed * delta * 0.5);
              } else {
                // No target, fly forward
                newUnit.x += 400 * delta;
              }
              
              // Explode when timer ends
              if (newUnit.selfDestructTimer <= 0) {
                // AOE DAMAGE to nearby enemies (including flying ones using 2D distance)
                newState.enemies = newState.enemies.map(enemy => {
                  if (enemy.isDying) return enemy;
                  const dx = enemy.x - newUnit.x;
                  const dy = (enemy.y || GROUND_Y) - newUnit.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < SELF_DESTRUCT_AOE_RADIUS) {
                    const newHealth = enemy.health - SELF_DESTRUCT_DAMAGE;
                    if (newHealth <= 0) {
                      const scoreMap: Record<string, number> = { tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250, giant: 400, bomber: 120 };
                      newState.score += scoreMap[enemy.type] || 60;
                      newState.combo++;
                      newState.killStreak++;
                      return { ...enemy, health: 0, isDying: true, deathTimer: 0.4, targetType: undefined };
                    }
                    return { ...enemy, health: newHealth, targetType: undefined };
                  }
                  return { ...enemy, targetType: undefined };
                });
                
                // RESET all particles on ally death for clean state
                newState.particles = [
                  ...createParticles(newUnit.x, newUnit.y + 30, 40, 'explosion', '#ff8800'),
                  ...createParticles(newUnit.x, newUnit.y + 30, 30, 'spark', '#ffff00'),
                  ...createParticles(newUnit.x, newUnit.y + 30, 20, 'magic', '#ff4400'),
                ];
                newState.supportProjectiles = []; // Clear ally projectiles
                newState.screenShake = 0.8;
                showSpeechBubble(`💥 ALLY SACRIFICED! 💥`, 'excited');
                
                // Remove the unit
                return { ...newUnit, timer: -1 };
              }
            }
            
            // Follow hero - stay IN FRONT of hero (between hero and enemies) - but not if self-destructing
            // Each unit gets a staggered position based on its index to prevent overlap
            if (!unit.isSelfDestructing) {
              // Find unit's index among all support units for staggering
              const unitIndex = prev.supportUnits.findIndex(u => u.id === unit.id);
              const pairIndex = Math.floor(unitIndex / 2); // Which pair of allies (0, 1, 2...)
              const staggerOffset = pairIndex * 50; // Each pair gets additional offset
              const baseOffset = unit.type === 'mech' ? 60 : 170;
              const targetX = prev.player.x + baseOffset + staggerOffset;
              newUnit.x = unit.x + (targetX - unit.x) * 0.08;
            }
            newUnit.y = GROUND_Y; // Stay on ground
            
            // Attack nearby enemies - Tank has ADVANCED AI TARGETING with extended range
            const currentProjCount = (newState.supportProjectiles || []).length;
            const isTank = unit.type === 'tank';
            const attackRange = isTank ? 800 : 500; // Tank has much longer range
            
            if (newUnit.attackCooldown <= 0 && !unit.isLanding && !unit.isSelfDestructing && currentProjCount < MAX_SUPPORT_PROJECTILES) {
              // TANK AI: Finds ALL enemies and prioritizes targets
              // Priority: 1. Closest threat, 2. Flying enemies, 3. Elite enemies
              const enemiesInRange = newState.enemies
                .filter(e => !e.isDying && !e.isSpawning && e.x > unit.x - 50 && e.x < unit.x + attackRange)
                .sort((a, b) => {
                  if (isTank) {
                    // Tank prioritizes: flying enemies > elites > closest
                    const aFlying = a.isFlying || a.type === 'drone' || a.type === 'bomber' || a.type === 'flyer' || a.type === 'jetrobot';
                    const bFlying = b.isFlying || b.type === 'drone' || b.type === 'bomber' || b.type === 'flyer' || b.type === 'jetrobot';
                    if (aFlying && !bFlying) return -1;
                    if (!aFlying && bFlying) return 1;
                    if (a.isElite && !b.isElite) return -1;
                    if (!a.isElite && b.isElite) return 1;
                  }
                  return Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x);
                });
              
              const nearestEnemy = enemiesInRange[0];
              
              if (nearestEnemy) {
                // Determine if target is flying for anti-air mode
                const targetIsFlying = nearestEnemy.isFlying || nearestEnemy.type === 'drone' || nearestEnemy.type === 'bomber' || nearestEnemy.type === 'flyer' || nearestEnemy.type === 'jetrobot';
                
                // TANK ANTI-AIR MODE: Machine gun burst for flying enemies, slower cannon for ground
                if (isTank && targetIsFlying) {
                  // Machine gun burst - 3 rapid shots at flying targets
                  newUnit.attackCooldown = 0.08; // Very fast for anti-air
                } else {
                  // Normal attack speed
                  newUnit.attackCooldown = isTank ? 0.18 : unit.type === 'mech' ? 0.6 : 0.4;
                }
                
                // Get enemy position
                const isFlying = targetIsFlying;
                
                const enemyCenterX = nearestEnemy.x + nearestEnemy.width / 2;
                const enemyCenterY = isFlying 
                  ? (nearestEnemy.y || GROUND_Y) + nearestEnemy.height / 2
                  : GROUND_Y + nearestEnemy.height / 2;
                
                // TANK fires from VERY TOP of image (turret tip), others from center/torso
                const startY = unit.type === 'tank' 
                  ? unit.y + unit.height * 0.02 
                  : GROUND_Y - 10;
                const startX = unit.x + unit.width + 5;
                
                // Calculate direction to enemy center
                const dx = enemyCenterX - startX;
                const dy = enemyCenterY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                  // Anti-air uses faster projectiles with spread
                  const projSpeed = isTank ? (targetIsFlying ? 1500 : 1200) : 1000;
                  
                  // Add slight spread for anti-air machine gun effect
                  const spreadAngle = isTank && targetIsFlying ? (Math.random() - 0.5) * 0.15 : 0;
                  const baseVelX = (dx / dist) * projSpeed;
                  const baseVelY = (dy / dist) * projSpeed;
                  const velocityX = baseVelX * Math.cos(spreadAngle) - baseVelY * Math.sin(spreadAngle);
                  const velocityY = baseVelX * Math.sin(spreadAngle) + baseVelY * Math.cos(spreadAngle);
                  
                  // Anti-air does less damage per shot but shoots faster
                  const projDamage = isTank 
                    ? (targetIsFlying ? 45 : 120) // Anti-air: 45 dmg fast, Ground: 120 dmg slow
                    : unit.type === 'mech' ? 25 : 15;
                  
                  const proj: Projectile = {
                    id: `ally-${unit.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    x: startX,
                    y: startY,
                    velocityX: velocityX,
                    velocityY: velocityY,
                    damage: projDamage,
                    type: isTank ? 'ultra' : unit.type === 'mech' ? 'ultra' : 'mega',
                    isAllyProjectile: true,
                    originX: startX,
                    originY: startY,
                  };
                  newState.supportProjectiles = [...(newState.supportProjectiles || []), proj];
                  
                  // Anti-air has orange tracer, ground has pink
                  const muzzleColor = isTank 
                    ? (targetIsFlying ? '#ff8800' : '#ff0066')
                    : unit.type === 'mech' ? '#ff6600' : '#00ff88';
                  newState.particles = [
                    ...newState.particles,
                    ...createParticles(startX, startY, isTank ? (targetIsFlying ? 4 : 8) : 2, 'muzzle', muzzleColor),
                  ];
                }
              }
            }
            
            return newUnit;
          })
          .filter(unit => unit.timer > 0);
        
        // Update support projectiles - aggressive cleanup to prevent residue
        newState.supportProjectiles = (prev.supportProjectiles || [])
          .slice(-MAX_SUPPORT_PROJECTILES) // Limit projectiles on screen
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + (p.velocityY || 0) * delta,
          }))
          .filter(p => {
            const screenX = p.x - prev.cameraX;
            // Remove projectiles that are off-screen or have traveled too far
            return screenX > -30 && screenX < 700 && p.y > -30 && p.y < 450;
          });
        
        // Support projectile-enemy collision - DAMAGES ALL ENEMIES (use ID-based map)
        const hitProjectileIds: Set<string> = new Set();
        const enemyDamageById: Map<string, number> = new Map(); // Track damage by enemy ID
        
        (newState.supportProjectiles || []).forEach(proj => {
          if (hitProjectileIds.has(proj.id)) return;
          
          for (const enemy of newState.enemies) {
            if (enemy.isDying || enemy.isSpawning) continue;
            if (hitProjectileIds.has(proj.id)) break;
            
            // Get enemy position
            const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber' || enemy.type === 'flyer' || enemy.type === 'jetrobot';
            const enemyY = isFlying ? (enemy.y || GROUND_Y) : GROUND_Y;
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemyY + enemy.height / 2;
            
            // Distance check
            const dx = proj.x - enemyCenterX;
            const dy = proj.y - enemyCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = isFlying ? 70 : 60; // Larger hit radius for ground enemies
            
            if (distance < hitRadius) {
              hitProjectileIds.add(proj.id);
              
              // BOSS SHIELD - COMPLETELY BLOCKS damage (FIXED: was allowing 30% through)
              if (enemy.bossShieldTimer && enemy.bossShieldTimer > 0) {
                // Shield absorbs hit completely - show spark only
                newState.particles = [...newState.particles, ...createParticles(
                  proj.x, proj.y, 8, 'spark', '#00ffff'
                )];
                return; // Shield absorbed - no damage!
              }
              
              // Calculate damage - apply gift combo multiplier!
              let damage = proj.damage * prev.giftDamageMultiplier;
              
              // Accumulate damage by enemy ID
              const currentDamage = enemyDamageById.get(enemy.id) || 0;
              enemyDamageById.set(enemy.id, currentDamage + damage);
              
              // Impact particles - TANK gets explosion FX with AOE damage
              const isTankProj = proj.id.includes('tank');
              if (isTankProj) {
                // Big explosion for tank bullets
                newState.explosions = [...(newState.explosions || []), {
                  id: `tank-explosion-${Date.now()}-${Math.random()}`,
                  x: proj.x,
                  y: proj.y,
                  size: 100,
                  timer: 0.5,
                }];
                newState.screenShake = Math.max(newState.screenShake, 0.4);
                
                // AOE DAMAGE - hit all enemies (ground and drones) within radius
                const TANK_AOE_RADIUS = 120;
                const TANK_AOE_DAMAGE = 40; // Half of direct hit damage
                newState.enemies = newState.enemies.map(aoeEnemy => {
                  if (aoeEnemy.id === enemy.id || aoeEnemy.isDying) return aoeEnemy; // Skip direct hit target
                  
                  const isAoeFlying = aoeEnemy.isFlying || aoeEnemy.type === 'drone' || aoeEnemy.type === 'bomber' || aoeEnemy.type === 'flyer' || aoeEnemy.type === 'jetrobot';
                  const aoeEnemyY = isAoeFlying ? (aoeEnemy.y || GROUND_Y) : GROUND_Y;
                  const aoeDx = proj.x - (aoeEnemy.x + aoeEnemy.width / 2);
                  const aoeDy = proj.y - (aoeEnemyY + aoeEnemy.height / 2);
                  const aoeDist = Math.sqrt(aoeDx * aoeDx + aoeDy * aoeDy);
                  
                  if (aoeDist < TANK_AOE_RADIUS) {
                    // Apply AOE damage (reduced by armor if active)
                    let aoeDamage = TANK_AOE_DAMAGE;
                    if (aoeEnemy.hasArmor && aoeEnemy.armorTimer && aoeEnemy.armorTimer > 0) {
                      aoeDamage *= 0.2; // 80% reduction with armor
                    }
                    
                    const newHealth = aoeEnemy.health - aoeDamage;
                    if (newHealth <= 0 && !aoeEnemy.isDying) {
                      const scoreMap: Record<string, number> = { tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250, giant: 400, bomber: 120, jetrobot: 150 };
                      newState.score += scoreMap[aoeEnemy.type] || 60;
                      newState.combo++;
                      newState.killStreak++;
                      return { ...aoeEnemy, health: 0, isDying: true, deathTimer: 0.4 };
                    }
                    return { ...aoeEnemy, health: newHealth };
                  }
                  return aoeEnemy;
                });
              } else {
                const impactColor = enemy.type === 'boss' ? '#ff00ff' : (isFlying ? '#00ffff' : '#00ff88');
                newState.particles = [...newState.particles, ...createParticles(proj.x, proj.y, 4, 'impact', impactColor)];
              }
              
              if (enemy.type === 'boss') {
                newState.screenShake = Math.max(newState.screenShake, 0.15);
              }
            }
          }
        });
        
        // Apply accumulated damage to enemies using ID lookup
        if (enemyDamageById.size > 0) {
          newState.enemies = newState.enemies.map(enemy => {
            const damage = enemyDamageById.get(enemy.id);
            if (!damage) return enemy;
            
            const newHealth = enemy.health - damage;
            
            if (newHealth <= 0 && !enemy.isDying) {
              const scoreMap: Record<string, number> = { boss: 2500, tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250, giant: 400, bomber: 120, jetrobot: 150 };
              newState.score += scoreMap[enemy.type] || 60;
              newState.combo++;
              newState.killStreak++;
              
              if (enemy.type === 'boss') {
                newState.portalOpen = true;
                newState.portalX = enemy.x + enemy.width / 2;
                showSpeechBubble("🤖 ALLY KILLED THE BOSS! 🤖", 'excited');
              }
              
              return { ...enemy, health: 0, isDying: true, deathTimer: 0.4 };
            }
            
            return { ...enemy, health: newHealth };
          });
        }
        
        // Remove projectiles that hit
        newState.supportProjectiles = (newState.supportProjectiles || []).filter(p => !hitProjectileIds.has(p.id));
        
        // UPDATE NEON LASERS - BOUNCE OFF WALLS!
        const ARENA_TOP = 50;
        const ARENA_BOTTOM = 250;
        const ARENA_LEFT = prev.cameraX - 20;
        const ARENA_RIGHT = prev.cameraX + 650;
        
        newState.neonLasers = prev.neonLasers
          .map(laser => {
            let newLaser = {
              ...laser,
              x: laser.x + laser.velocityX * delta,
              y: laser.y + laser.velocityY * delta,
              life: laser.life - delta,
            };
            
            // Bounce off horizontal walls
            if (newLaser.x < ARENA_LEFT || newLaser.x > ARENA_RIGHT) {
              if (newLaser.bounces > 0) {
                newLaser.velocityX = -newLaser.velocityX * 0.9;
                newLaser.bounces--;
                newLaser.x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, newLaser.x));
              }
            }
            
            // Bounce off vertical walls
            if (newLaser.y < ARENA_TOP || newLaser.y > ARENA_BOTTOM) {
              if (newLaser.bounces > 0) {
                newLaser.velocityY = -newLaser.velocityY * 0.9;
                newLaser.bounces--;
                newLaser.y = Math.max(ARENA_TOP, Math.min(ARENA_BOTTOM, newLaser.y));
              }
            }
            
            return newLaser;
          })
          .filter(laser => laser.life > 0 && laser.bounces >= 0);
        
        // Neon laser-enemy collision (they damage enemies!)
        newState.neonLasers.forEach(laser => {
          newState.enemies.forEach((enemy, idx) => {
            if (enemy.isDying || enemy.isSpawning || enemy.type === 'boss') return;
            
            if (
              laser.x > enemy.x - 10 && laser.x < enemy.x + enemy.width + 10 &&
              laser.y > enemy.y - 10 && laser.y < enemy.y + enemy.height + 10
            ) {
              newState.enemies[idx] = {
                ...newState.enemies[idx],
                health: newState.enemies[idx].health - 30,
              };
              newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 8, 'spark', '#ff00ff')];
              
              if (newState.enemies[idx].health <= 0) {
                newState.enemies[idx].isDying = true;
                newState.enemies[idx].deathTimer = 0.4;
                newState.score += 50;
                newState.combo++;
              }
            }
          });
        });
        
        // Screen shake decay
        if (prev.screenShake > 0) {
          newState.screenShake = Math.max(0, prev.screenShake - delta * 4);
        }
        
        // Update camera - HERO STAYS FIXED ON LEFT SIDE OF SCREEN
        // Camera follows player smoothly to create panning effect
        const targetCameraX = Math.max(0, newState.player.x - HERO_FIXED_SCREEN_X);
        // Smoother camera follow for better movement feel
        newState.cameraX = prev.cameraX + (targetCameraX - prev.cameraX) * 0.12;
        newState.distance = newState.player.x;
        
        // Update projectiles
        newState.projectiles = prev.projectiles
          .map(p => ({ 
            ...p, 
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
          }))
          .filter(p => p.x < prev.cameraX + 1000);
        
        // Update enemy lasers
        newState.enemyLasers = prev.enemyLasers
          .map(p => ({ 
            ...p, 
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
          }))
          .filter(p => p.x > prev.cameraX - 50);
        
        // Enemy laser collision - SUPPORT UNITS CAN INTERCEPT, otherwise hero takes damage
        {
          const lasersToRemove: Set<string> = new Set();

          newState.enemyLasers.forEach(laser => {
            if (lasersToRemove.has(laser.id)) return;

            const laserWidth = 20;
            const laserHeight = 15;
            const laserCenterX = laser.x + laserWidth / 2;
            const laserCenterY = laser.y + laserHeight / 2;

            // 1) Check if any support unit intercepts the laser
            for (const unit of newState.supportUnits) {
              if (unit.isSelfDestructing || unit.isLanding || unit.health <= 0) continue;

              const unitCenterX = unit.x + unit.width / 2;
              const unitCenterY = unit.y + unit.height / 2;
              const radius = Math.max(unit.width, unit.height) * 0.5 + 30; // generous, fixes drones firing from above

              const dx = laserCenterX - unitCenterX;
              const dy = laserCenterY - unitCenterY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < radius) {
                // ALLY BLOCKS THE ATTACK!
                const rawDamage = laser.damage ?? 0;
                const damage = rawDamage * 0.7; // Allies take 70% damage when blocking

                if (unit.shield > 0) {
                  unit.shield = Math.max(0, unit.shield - damage);
                  newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 15, 'spark', '#00ffff')];
                } else {
                  unit.health -= damage;
                  newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 12, 'spark', '#ff8800')];
                }

                newState.particles = [...newState.particles, ...createParticles(unitCenterX, unitCenterY, 8, 'impact', '#00ff88')];
                lasersToRemove.add(laser.id);
                return;
              }
            }

            // 2) If not blocked by ally, check player collision with IMPROVED HEIGHT-AWARE HITBOX
            // Hero hitbox is at GROUND_Y with height PLAYER_HEIGHT
            const heroBottomY = GROUND_Y;
            const heroTopY = GROUND_Y + PLAYER_HEIGHT;
            const heroCenterX = newState.player.x + PLAYER_WIDTH / 2;
            const heroCenterY = GROUND_Y + PLAYER_HEIGHT / 2;
            
            // Distance-based collision for more accurate hit detection
            const dx = laserCenterX - heroCenterX;
            const dy = laserCenterY - heroCenterY;
            const hitDistance = Math.sqrt(dx * dx + dy * dy);
            const heroHitRadius = 35; // Hero hitbox radius
            
            if (hitDistance < heroHitRadius) {
              // EVASION CHECK - 1 in 15 attacks are evaded!
              if (Math.random() < EVASION_CHANCE) {
                // Hero evades!
                newState.evasionPopup = { x: newState.player.x + PLAYER_WIDTH/2, y: newState.player.y, timer: 1.0, target: 'hero' };
                lasersToRemove.add(laser.id);
                newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 8, 'dash', '#00ff00')];
                showSpeechBubble("EVADED! 💨", 'excited');
                return;
              }
              
              const dmg = laser.damage ?? 0;

              // ARMOR ABSORBS DAMAGE FIRST!
              if (newState.player.shield > 0) {
                newState.player.shield = Math.max(0, newState.player.shield - dmg);
                newState.shieldBlockFlash = 1;
                newState.screenShake = 0.25;
                newState.particles = [
                  ...newState.particles,
                  ...createParticles(laser.x, laser.y, 20, 'spark', '#00ffff'),
                  ...createParticles(newState.player.x + PLAYER_WIDTH / 2, newState.player.y + PLAYER_HEIGHT / 2, 10, 'spark', '#00ffff'),
                ];
                if (Math.random() > 0.7) {
                  const taunt = ENEMY_TAUNTS[Math.floor(Math.random() * ENEMY_TAUNTS.length)];
                  showSpeechBubble(taunt, 'excited');
                }
              } else {
                newState.player.health -= dmg;
                newState.player.animationState = 'hurt';
                newState.damageFlash = 1;
                newState.screenShake = 0.3;
                if (navigator.vibrate) {
                  navigator.vibrate(100);
                }
                if (Math.random() > 0.6) {
                  const request = GIFT_REQUESTS[Math.floor(Math.random() * GIFT_REQUESTS.length)];
                  showSpeechBubble(request, 'help');
                }
              }

              newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 8, 'spark', '#ff0000')];
              lasersToRemove.add(laser.id);
            }
          });

          if (lasersToRemove.size > 0) {
            newState.enemyLasers = newState.enemyLasers.filter(l => !lasersToRemove.has(l.id));
          }
        }
        
        // Projectile-enemy collisions - LARGER hitboxes for reliable hits
        const hitProjectiles = new Set<string>();
        const projWidth = 25;
        const projHeight = 20;
        
        newState.projectiles.forEach(proj => {
          newState.enemies.forEach(enemy => {
            if (hitProjectiles.has(proj.id) || enemy.isDying || enemy.isSpawning) return;
            
            // LASER ONLY HITS GROUND ENEMIES - Flying enemies (drones, bombers, flyers, jetrobots) require EMP!
            const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber' || enemy.type === 'flyer' || enemy.type === 'jetrobot';
            const isEmpOnly = enemy.empOnly || enemy.type === 'jetrobot';
            if ((isFlying || isEmpOnly) && enemy.type !== 'boss') {
              // Skip flying and EMP-only enemies - they need EMP to be killed!
              return;
            }
            
            // Generous collision box for projectiles hitting GROUND enemies
            if (
              proj.x < enemy.x + enemy.width + 10 &&
              proj.x + projWidth > enemy.x - 10 &&
              proj.y < enemy.y + enemy.height + 15 &&
              proj.y + projHeight > enemy.y - 15
            ) {
              hitProjectiles.add(proj.id);
              
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                // BOSS SHIELD - if boss has active shield, block damage
                if (enemy.type === 'boss' && enemy.bossShieldTimer && enemy.bossShieldTimer > 0) {
                  // Shield blocks the attack - only show spark effect
                  newState.particles = [...newState.particles, ...createParticles(
                    proj.x, proj.y, 12, 'spark', '#00ffff'
                  )];
                  newState.screenShake = 0.15;
                  return; // Shield absorbed hit
                }
                
                // ENEMY ARMOR - if ground enemy has active armor, reduce damage by 80%
                // Apply GIFT COMBO MULTIPLIER to all damage!
                let actualDamage = proj.damage * prev.giftDamageMultiplier;
                
                // SIZE-BASED DAMAGE RESISTANCE - larger enemies take less damage
                // Boss: 40% damage, Giant: 50%, Tank/Sentinel: 60%, Mech: 80%, others: 100%
                const sizeResistance: Record<string, number> = {
                  boss: 0.4,      // Takes only 40% damage (60% reduction)
                  giant: 0.5,     // Takes only 50% damage
                  tank: 0.6,      // Takes only 60% damage
                  sentinel: 0.65, // Takes only 65% damage
                  mech: 0.8,      // Takes only 80% damage
                  ninja: 0.9,     // Takes only 90% damage
                  robot: 1.0,     // Full damage
                  drone: 1.0,     // Full damage
                  bomber: 1.0,    // Full damage
                  flyer: 1.0,     // Full damage
                  jetrobot: 0.9,  // Takes only 90% damage
                };
                const resistanceFactor = sizeResistance[enemy.type] || 1.0;
                actualDamage *= resistanceFactor;
                
                if (enemy.hasArmor && enemy.armorTimer && enemy.armorTimer > 0) {
                  actualDamage = (proj.damage * prev.giftDamageMultiplier * resistanceFactor) * 0.2; // Only 20% damage gets through
                  newState.particles = [...newState.particles, ...createParticles(
                    proj.x, proj.y, 10, 'spark', '#ff00ff'
                  )];
                }
                
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  health: newState.enemies[enemyIdx].health - actualDamage,
                };
                
                // ENHANCED IMPACT FX - more particles and screen feedback
                newState.particles = [
                  ...newState.particles, 
                  ...createParticles(proj.x, proj.y, proj.type === 'ultra' ? 18 : 12, 'impact', 
                    proj.type === 'ultra' ? '#ff00ff' : '#00ffff'),
                  ...createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 8, 'spark', '#ffff00'),
                ];
                
                newState.screenShake = Math.max(newState.screenShake, proj.type === 'ultra' ? 0.2 : 0.1);
                
                if (newState.enemies[enemyIdx].health <= 0) {
                  newState.enemies[enemyIdx].isDying = true;
                  newState.enemies[enemyIdx].deathTimer = 0.5;
                  
                  const scoreMap: Record<string, number> = { boss: 2500, tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250, giant: 350 };
                  newState.score += (enemy.isElite ? 2 : 1) * (scoreMap[enemy.type] || 60);
                  newState.combo++;
                  newState.comboTimer = 2;
                  newState.killStreak++;
                  
                  // KILL-BASED MULTIPLIER SYSTEM - increases every 3 kills!
                  newState.giftCombo = (prev.giftComboTimer > 0 ? prev.giftCombo : 0) + 1;
                  newState.giftComboTimer = 3; // 3 seconds to keep combo alive
                  const killTier = Math.floor(newState.giftCombo / 3);
                  newState.giftDamageMultiplier = Math.min(1.0 + killTier * 0.5, 3.0); // +0.5x per 3 kills, max 3.0x
                  
                  newState.particles = [...newState.particles, ...createParticles(
                    enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                    enemy.type === 'boss' ? 40 : enemy.isElite ? 30 : 20, 'death', enemy.isElite ? '#ffff00' : '#ff4400'
                  )];
                  
                  newState.screenShake = enemy.type === 'boss' ? 1.5 : enemy.isElite ? 0.4 : 0.25;
                  
                  // Elite bonus score
                  if (enemy.isElite) {
                    newState.score += 100;
                    showSpeechBubble("💎 ELITE DESTROYED! +100 💎", 'excited');
                  }
                  
                  // BOSS KILLED - Open the portal!
                  if (enemy.type === 'boss') {
                    newState.portalOpen = true;
                    newState.portalX = enemy.x + enemy.width / 2;
                    showSpeechBubble("BOSS DOWN! PORTAL OPENED! 🌀", 'excited');
                  }
                  
                  // Hero taunts enemies on kills - MORE FREQUENT!
                  if (newState.killStreak > 3 && newState.killStreak % 4 === 0) {
                    showSpeechBubble(`${newState.killStreak} KILL STREAK! 🔥`, 'excited');
                  } else if (Math.random() > 0.55) {
                    // Much more frequent quips and taunts!
                    const roll = Math.random();
                    if (roll > 0.7) {
                      // Gift request
                      showSpeechBubble(GIFT_REQUESTS[Math.floor(Math.random() * GIFT_REQUESTS.length)], 'help');
                    } else if (roll > 0.35) {
                      // Enemy taunt
                      showSpeechBubble(ENEMY_TAUNTS[Math.floor(Math.random() * ENEMY_TAUNTS.length)], 'excited');
                    } else {
                      // Hero quip
                      showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
                    }
                  }
                }
              }
            }
          });
        });
        
        newState.projectiles = newState.projectiles.filter(p => !hitProjectiles.has(p.id));
        
        // Update dying and spawning enemies, and handle ENEMY ARMOR ACTIVATION
        // FIRST: Check for any boss that's about to be removed - ensure portal opens!
        const dyingBoss = newState.enemies.find(e => e.type === 'boss' && e.isDying && e.deathTimer <= delta);
        if (dyingBoss && !newState.portalOpen) {
          newState.portalOpen = true;
          newState.portalX = dyingBoss.x + dyingBoss.width / 2;
          showSpeechBubble("🌀 BOSS DEFEATED! PORTAL OPEN! 🌀", 'excited');
          newState.screenShake = 1.5;
        }
        
        newState.enemies = newState.enemies
          .map(e => {
            if (e.isDying) return { ...e, deathTimer: e.deathTimer - delta };
            if (e.isSpawning && e.spawnTimer !== undefined) {
              const newTimer = e.spawnTimer - delta;
              if (newTimer <= 0) {
                return { ...e, isSpawning: false, spawnTimer: 0 };
              }
              return { ...e, spawnTimer: newTimer };
            }
            // Handle jet robots dropping from top of screen
            if (e.isDropping && e.dropTimer !== undefined) {
              const newDropTimer = e.dropTimer - delta;
              if (newDropTimer <= 0) {
                return { ...e, isDropping: false, dropTimer: 0 };
              }
              return { ...e, dropTimer: newDropTimer };
            }
            
            // ENEMY ARMOR SYSTEM - Different enemies have different armor thresholds!
            // GIANT (ground-5): Armor at 60% HP for 5 seconds
            // TANK (ground-6): Armor at 70% HP for 5 seconds  
            // Other ground enemies: Armor at 20% HP for 3 seconds
            const isGroundEnemy = !e.isFlying && e.type !== 'drone' && e.type !== 'bomber' && e.type !== 'flyer' && e.type !== 'jetrobot' && e.type !== 'boss';
            const healthPercent = e.health / e.maxHealth;
            
            // Type-specific armor thresholds and durations
            // Giant (ground-5) and Sentinel (ground-4) get 5 second armor (the last 2 enemy types)
            const isGiant = e.type === 'giant';
            const isSentinel = e.type === 'sentinel';
            const armorThreshold = isGiant ? 0.6 : isSentinel ? 0.7 : ARMOR_ACTIVATION_THRESHOLD;
            const armorDuration = isGiant ? 5 : isSentinel ? 5 : ARMOR_DURATION;
            
            // Check if should activate armor
            if (isGroundEnemy && healthPercent <= armorThreshold && !e.armorUsed && !e.hasArmor) {
              // Activate armor with type-specific VFX!
              // Giant (ground-5) = orange, Sentinel (ground-4) = red/magenta
              const armorColor = isGiant ? '#ff6600' : isSentinel ? '#ff00ff' : '#ff00ff';
              newState.particles = [...newState.particles, ...createParticles(
                e.x + e.width / 2, e.y + e.height / 2, 30, 'spark', armorColor
              )];
              newState.screenShake = isGiant || isSentinel ? 0.5 : 0.2;
              return { 
                ...e, 
                hasArmor: true, 
                armorTimer: armorDuration, 
                armorUsed: true 
              };
            }
            
            // Update armor timer if active
            if (e.hasArmor && e.armorTimer !== undefined && e.armorTimer > 0) {
              const newArmorTimer = e.armorTimer - delta;
              if (newArmorTimer <= 0) {
                return { ...e, hasArmor: false, armorTimer: 0 };
              }
              return { ...e, armorTimer: newArmorTimer };
            }
            
            return e;
          })
          .filter(e => !e.isDying || e.deathTimer > 0);
        
        // ENEMIES HIT ONCE THEN JUMP BACK - No auto-kill, enemies attack then retreat
        // Enemies only start moving/attacking after first gift is sent
        const ENEMY_ATTACK_RANGE = 70;
        const attackCooldownDecrement = delta;
        const timeSinceGameStart = (Date.now() - prev.gameStartTime) / 1000;
        // Enemies only attack after FIRST GIFT is sent AND 2 second delay has passed
        const canEnemiesAttack = prev.firstGiftSent && timeSinceGameStart >= ENEMY_ATTACK_DELAY;
        
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying || enemy.type === 'boss' || enemy.isSpawning) return enemy;
          
          // If enemies can't attack yet (within 2 seconds of game start), just decrease cooldown
          if (!canEnemiesAttack) {
            return { 
              ...enemy, 
              attackCooldown: Math.max(0, (enemy.attackCooldown || 0) - attackCooldownDecrement),
            };
          }
          
          const distToHero = Math.abs(enemy.x - prev.player.x);
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'flyer' || enemy.type === 'bomber' || enemy.type === 'jetrobot';
          
          // PRIORITY TARGETING: Attack support units first!
          // Find the closest alive support unit in front of the enemy
          let targetSupport: SupportUnit | null = null;
          let closestSupportDist = Infinity;
          
          for (const unit of newState.supportUnits) {
            if (unit.health <= 0 || unit.isSelfDestructing) continue;
            const distToUnit = Math.abs(enemy.x - unit.x);
            if (distToUnit < closestSupportDist && distToUnit < ENEMY_ATTACK_RANGE * 1.5) {
              closestSupportDist = distToUnit;
              targetSupport = unit;
            }
          }
          
          // Set target type for visual indicator
          const targetType = targetSupport ? 'ally' : 'hero';
          
          // Enemy attacks support unit first if one is in range
          if (targetSupport && closestSupportDist < ENEMY_ATTACK_RANGE && (enemy.attackCooldown || 0) <= 0 && !enemy.isRetreating) {
            const damage = enemy.damage * 0.5;
            
            // Damage the support unit (shield first, then health)
            if (targetSupport.shield > 0) {
              targetSupport.shield = Math.max(0, targetSupport.shield - damage);
              newState.particles = [...newState.particles, ...createParticles(targetSupport.x + targetSupport.width/2, targetSupport.y + targetSupport.height/2, 10, 'spark', '#00ffff')];
            } else {
              targetSupport.health -= damage;
              newState.particles = [...newState.particles, ...createParticles(targetSupport.x + targetSupport.width/2, targetSupport.y + targetSupport.height/2, 8, 'spark', '#ff8800')];
            }
            
            // Attack particles on enemy
            newState.particles = [...newState.particles, ...createParticles(
              enemy.x + enemy.width/2, enemy.y + enemy.height/2, 8, 'spark', '#ff4400'
            )];
            
            // Set enemy to retreat
            const retreatX = enemy.originalX ?? (enemy.x + 150 + Math.random() * 100);
            const retreatY = enemy.originalY ?? enemy.y;
            
            return { 
              ...enemy, 
              isRetreating: true,
              originalX: retreatX,
              originalY: retreatY,
              attackCooldown: 1.5 + Math.random() * 0.5,
              targetType,
            };
          }
          
          // No support unit to attack - attack hero if in range
          if (distToHero < ENEMY_ATTACK_RANGE && (enemy.attackCooldown || 0) <= 0 && !enemy.isRetreating) {
            // Enemy hits the player!
            const damage = enemy.damage * 0.5;
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - damage);
              newState.shieldBlockFlash = 0.5;
              newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT/2, 10, 'spark', '#00ffff')];
            } else {
              newState.player.health -= damage;
              newState.damageFlash = 0.4;
              newState.screenShake = 0.15;
            }
            
            // Attack particles
            newState.particles = [...newState.particles, ...createParticles(
              enemy.x + enemy.width/2, enemy.y + enemy.height/2, 8, 'spark', '#ff4400'
            )];
            
            // Set enemy to retreat to original position
            const retreatX = enemy.originalX ?? (enemy.x + 150 + Math.random() * 100);
            const retreatY = enemy.originalY ?? enemy.y;
            
            return { 
              ...enemy, 
              isRetreating: true,
              originalX: retreatX,
              originalY: retreatY,
              attackCooldown: 1.5 + Math.random() * 0.5,
              targetType: 'hero' as const,
            };
          }
          
          // Decrease attack cooldown
          return { 
            ...enemy, 
            attackCooldown: Math.max(0, (enemy.attackCooldown || 0) - attackCooldownDecrement),
          };
        });
        
        // Move enemies - boss keeps distance and shoots (skip spawning enemies)
        // Enemies now JUMP sometimes and FIRE more often
        const minSpacing = 60;
        newState.enemies = newState.enemies.map((enemy, idx) => {
          if (enemy.isDying || enemy.isSpawning) return enemy;
          
          // ENEMIES WAIT UNTIL FIRST GIFT IS SENT - no movement or attacks before that!
          if (!prev.firstGiftSent && enemy.type !== 'boss') {
            return { 
              ...enemy, 
              animationPhase: (enemy.animationPhase + delta * 2) % (Math.PI * 2), // Idle animation only
            };
          }
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          
          // Push enemy in front of player if behind
          if (enemy.x < prev.player.x - 10) {
            return { 
              ...enemy, 
              x: prev.player.x + PLAYER_WIDTH + 40 + Math.random() * 40,
              animationPhase: (enemy.animationPhase + delta * 6) % (Math.PI * 2),
            };
          }
          
          // Boss behavior - STAYS PUT until hero approaches, then engages
          if (enemy.type === 'boss') {
            const distanceToBoss = enemy.x - prev.player.x;
            const BOSS_ENGAGE_RANGE = 600; // Boss only engages when hero is within 600px
            
            // BOSS JUMP ATTACK ANIMATION - 6 second sequence!
            if (enemy.isJumpAttacking && enemy.jumpAttackTimer !== undefined) {
              const jumpTimer = enemy.jumpAttackTimer - delta;
              const originalY = enemy.originalBossY ?? enemy.y;
              
              // Phase 1 (0-1.5s): Jump UP off screen
              if (enemy.jumpAttackPhase === 'jumping') {
                const jumpProgress = (BOSS_JUMP_ATTACK_DURATION - jumpTimer) / 1.5;
                const newY = originalY + jumpProgress * 600; // Move 600px up (off screen)
                
                if (jumpTimer <= BOSS_JUMP_ATTACK_DURATION - 1.5) {
                  // Transition to bombing phase
                  return {
                    ...enemy,
                    y: originalY + 600, // Off screen
                    jumpAttackTimer: jumpTimer,
                    jumpAttackPhase: 'bombing',
                    animationPhase: (enemy.animationPhase + delta * 8) % (Math.PI * 2),
                  };
                }
                return {
                  ...enemy,
                  y: newY,
                  jumpAttackTimer: jumpTimer,
                  animationPhase: (enemy.animationPhase + delta * 8) % (Math.PI * 2),
                };
              }
              
              // Phase 2 (1.5-4.5s): Drop bombs from above - 3 seconds of bombing!
              if (enemy.jumpAttackPhase === 'bombing') {
                // Drop bombs every 0.3 seconds while in bombing phase
                const bombInterval = 0.3;
                const bombPhaseProgress = (BOSS_JUMP_ATTACK_DURATION - 1.5 - jumpTimer);
                if (bombPhaseProgress >= 0 && Math.floor(bombPhaseProgress / bombInterval) !== Math.floor((bombPhaseProgress - delta) / bombInterval)) {
                  // Drop a bomb at random X position on screen
                  const bombX = prev.cameraX + 50 + Math.random() * 500;
                  const newBomb: Bomb = {
                    id: `boss-jump-bomb-${Date.now()}-${Math.random()}`,
                    x: bombX,
                    y: 400, // From top of screen
                    velocityY: -280 - Math.random() * 100, // Fall down with varied speed
                    damage: 20 + Math.floor(prev.currentWave / 2),
                    timer: 5,
                  };
                  newState.bombs = [...(newState.bombs || []), newBomb];
                  newState.particles = [...newState.particles, ...createParticles(bombX, 350, 8, 'muzzle', '#ff4400')];
                  newState.screenShake = 0.2;
                }
                
                if (jumpTimer <= BOSS_JUMP_ATTACK_DURATION - 4.5) {
                  // Transition to landing phase
                  return {
                    ...enemy,
                    y: originalY + 600,
                    jumpAttackTimer: jumpTimer,
                    jumpAttackPhase: 'landing',
                    animationPhase: (enemy.animationPhase + delta * 6) % (Math.PI * 2),
                  };
                }
                return {
                  ...enemy,
                  jumpAttackTimer: jumpTimer,
                  animationPhase: (enemy.animationPhase + delta * 6) % (Math.PI * 2),
                };
              }
              
              // Phase 3 (4.5-6s): Land back down with ground pound
              if (enemy.jumpAttackPhase === 'landing') {
                const landProgress = (BOSS_JUMP_ATTACK_DURATION - 4.5 - jumpTimer) / 1.5; // 1.5s to land
                const newY = originalY + 600 - (landProgress * 600); // Move 600px down (back to ground)
                
                if (jumpTimer <= 0) {
                  // Landing complete! Ground pound effect
                  newState.screenShake = 2.0;
                  newState.redFlash = 1.0;
                  // Create shockwave
                  const shockwave: Projectile = {
                    id: `jump-shockwave-${Date.now()}`,
                    x: enemy.x,
                    y: GROUND_Y + 30,
                    velocityX: -700,
                    velocityY: 0,
                    damage: 25 + Math.floor(prev.currentWave / 3),
                    type: 'mega',
                  };
                  newState.enemyLasers = [...newState.enemyLasers, shockwave];
                  newState.particles = [...newState.particles, 
                    ...createParticles(enemy.x + enemy.width/2, originalY + enemy.height, 40, 'explosion', '#ff4400'),
                    ...createParticles(enemy.x + enemy.width/2, originalY + enemy.height, 30, 'spark', '#ffff00'),
                  ];
                  showSpeechBubble("💥 GROUND POUND LANDING! 💥", 'urgent');
                  
                  return {
                    ...enemy,
                    y: originalY,
                    isJumpAttacking: false,
                    jumpAttackTimer: undefined,
                    jumpAttackPhase: undefined,
                    animationPhase: (enemy.animationPhase + delta * 4) % (Math.PI * 2),
                  };
                }
                return {
                  ...enemy,
                  y: Math.max(originalY, newY),
                  jumpAttackTimer: jumpTimer,
                  animationPhase: (enemy.animationPhase + delta * 8) % (Math.PI * 2),
                };
              }
            }
            
            // If hero is NOT in range, boss stays completely still
            if (distanceToBoss > BOSS_ENGAGE_RANGE) {
              // Boss stays in original position, not moving at all
              return { 
                ...enemy, 
                animationPhase: (enemy.animationPhase + delta * 2) % (Math.PI * 2), // Slow idle animation
              };
            }
            
            // Hero is in range - boss now engages and maintains attack distance
            const tooClose = distanceToBoss < BOSS_KEEP_DISTANCE - 50;
            const tooFar = distanceToBoss > BOSS_KEEP_DISTANCE + 50 && distanceToBoss <= BOSS_ENGAGE_RANGE;
            
            // ENHANCED BOSS MOVEMENT - Dynamic jumping forward and backward with visible attacks!
            const bossJumpCycle = Math.sin(enemy.animationPhase * 3);
            const bossSecondJump = Math.cos(enemy.animationPhase * 1.8);
            const bossHopHeight = Math.abs(bossJumpCycle) * 40 + Math.abs(bossSecondJump) * 20; // Higher hops
            
            // Forward/backward lunge pattern - boss aggressively moves toward and away from hero
            const lungePhase = Math.sin(enemy.animationPhase * 0.8);
            const lungeMagnitude = 100 * lungePhase; // -100 to +100 px lunge range
            
            // Random aggressive jump toward hero (more frequent)
            const aggressiveJump = Math.random() > 0.98;
            const jumpForwardDistance = aggressiveJump ? -80 : 0; // Jump toward hero
            const jumpUpHeight = aggressiveJump ? 80 : 0;
            
            // Trigger ranged attack during aggressive jump
            if (aggressiveJump && (enemy.attackCooldown || 0) <= 0) {
              // Fire visible projectile during jump!
              const bossProjectile: Projectile = {
                id: `boss-jump-attack-${Date.now()}`,
                x: enemy.x - 20,
                y: GROUND_Y - 50,
                velocityX: -450,
                velocityY: (Math.random() - 0.3) * 100,
                damage: 18 + Math.floor(prev.currentWave / 2),
                type: 'mega',
              };
              newState.enemyLasers = [...newState.enemyLasers, bossProjectile];
              newState.particles = [...newState.particles, ...createParticles(enemy.x - 20, GROUND_Y - 50, 10, 'muzzle', '#ff00ff')];
            }
            
            // Random backward dodge when hero attacks
            const dodgeBackward = Math.random() > 0.992;
            const dodgeDistance = dodgeBackward ? 60 : 0;
            
            const totalBossJump = bossHopHeight + jumpUpHeight;
            const horizontalMove = lungeMagnitude * delta * 0.5 + jumpForwardDistance + dodgeDistance;
            
            if (tooClose) {
              // Move away with dramatic backward jump
              return { 
                ...enemy, 
                x: enemy.x + 50 * delta + horizontalMove,
                y: GROUND_Y - totalBossJump,
                animationPhase: (enemy.animationPhase + delta * 5) % (Math.PI * 2),
              };
            } else if (tooFar) {
              // Move closer with aggressive forward lunge
              return { 
                ...enemy, 
                x: enemy.x - 40 * delta + horizontalMove,
                y: GROUND_Y - totalBossJump,
                animationPhase: (enemy.animationPhase + delta * 5) % (Math.PI * 2),
              };
            }
            // At ideal distance - dynamic hopping and lunging
            return { 
              ...enemy, 
              x: enemy.x + horizontalMove,
              y: GROUND_Y - totalBossJump,
              animationPhase: (enemy.animationPhase + delta * 5) % (Math.PI * 2),
            };
          }
          
          const tooClose = newState.enemies.some((other, otherIdx) => {
            if (otherIdx === idx || other.isDying) return false;
            const dist = Math.abs(enemy.x - other.x);
            return dist < minSpacing && other.x < enemy.x;
          });
          
          const reachedMinDistance = enemy.x <= prev.player.x + ENEMY_MIN_DISTANCE;
          const newAnimPhase = (enemy.animationPhase + delta * 6) % (Math.PI * 2);
          
          // JUMPING - enemies randomly jump to DODGE player lasers
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'flyer';
          // Boss is handled earlier in this mapper, so everything here is ground-or-flying (non-boss).
          const baseY = GROUND_Y;
          const currentY = isFlying ? enemy.y : baseY;

          // Check if a player projectile is nearby - then jump to dodge!
          const nearbyProjectile = prev.projectiles.find(p => 
            Math.abs(p.x - enemy.x) < 150 && 
            Math.abs(p.y - (currentY + enemy.height / 2)) < 55
          );
          const shouldDodgeJump = !isFlying && !!nearbyProjectile && Math.random() > 0.4;
          const randomJump = !isFlying && Math.random() > 0.985;
          
          // SENTINEL HOPPING MOVEMENT - Sentinels make small hops to advance!
          const isSentinel = enemy.type === 'sentinel';
          const sentinelHopPhase = isSentinel ? Math.abs(Math.sin(newAnimPhase * 4)) : 0;
          const sentinelHopHeight = isSentinel ? sentinelHopPhase * 25 : 0; // Small 25px hops

          // IMPORTANT: Keep ground enemies anchored to baseY.
          // Jump is represented as a temporary offset (does not accumulate into enemy.y).
          const jumpOffset = (shouldDodgeJump || randomJump) ? (35 + Math.random() * 50) : sentinelHopHeight;
          const nextY = isFlying ? currentY : (baseY - jumpOffset);

          // PROGRESSIVE AGGRESSION - enemies get more aggressive as hero progresses!
          // Based on hero's X position (distance traveled through level)
          const progressPercent = Math.min(prev.distance / (prev.levelLength || 12000), 1);
          const aggressionBonus = 1 + progressPercent * 1.5; // Up to 2.5x more aggressive at end of level
          
          // ENHANCED DODGE BEHAVIOR - Ground enemies strafe forward/backward constantly!
          // They try to evade hero's attacks by moving erratically
          const dodgeCycleSpeed = 4 + progressPercent * 3; // Faster dodging as game progresses
          const dodgePhase = Math.sin(newAnimPhase * dodgeCycleSpeed);
          const dodgeIntensity = 0.4 + progressPercent * 0.4; // More intense dodging later
          
          // Forward/backward strafe pattern - makes ground combat feel like a real battle!
          const strafeDirection = dodgePhase > 0 ? 1 : -1;
          const strafeSpeed = enemy.speed * 0.3 * dodgeIntensity * strafeDirection;
          
          // Only strafe when within attack range of hero (not when too far)
          const distToHeroForStrafe = enemy.x - prev.player.x;
          const inStrafingRange = distToHeroForStrafe > 80 && distToHeroForStrafe < 400;
          const shouldStrafe = !isFlying && inStrafingRange && !isSentinel;
          
          // BACK AND FORTH MOVEMENT - enemies move erratically with enhanced dodging
          const movementPattern = Math.sin(newAnimPhase * 3) * 0.5 + 0.5; // 0-1 oscillation
          const moveBackward = Math.random() > (0.95 - progressPercent * 0.1); // More retreats as game progresses
          // Sentinels move in bursts (hop-pause pattern)
          const sentinelMoveMultiplier = isSentinel ? (sentinelHopPhase > 0.3 ? 1.5 : 0.3) : 1;
          const moveMultiplier = moveBackward ? -0.6 : (1 + movementPattern * 0.5) * sentinelMoveMultiplier * aggressionBonus;

          // COLLISION PREVENTION - enemies stop before overlapping hero
          const distToHero = enemy.x - prev.player.x;
          const wouldOverlap = distToHero < ENEMY_COLLISION_DISTANCE + PLAYER_WIDTH;
          
          // ENEMIES ONLY ATTACK WHEN CLOSE TO HERO (not just on screen)
          const screenLeft = prev.cameraX - 50;
          const screenRight = prev.cameraX + 700;
          const isOnScreen = enemy.x >= screenLeft && enemy.x <= screenRight;
          
          // DUAL ATTACK MODES: Slash when close, Rockets when far
          const isCloseForSlash = distToHero > 0 && distToHero < SLASH_ATTACK_RANGE;
          const isCloseForRocket = distToHero >= SLASH_ATTACK_RANGE && distToHero < ROCKET_ATTACK_RANGE;
          const canMeleeAttack = isCloseForSlash && isOnScreen;
          const canRangedAttack = isCloseForRocket && isOnScreen;

          // SPIRAL DRONE - flies in circles while DROPPING BOMBS!
          if ((enemy.type === 'drone' || enemy.type === 'flyer') && enemy.isSpiralDrone) {
            const spiralSpeed = 3.0; // Rotation speed
            const spiralRadius = 60; // Size of spiral
            const newSpiralAngle = (enemy.spiralAngle || 0) + spiralSpeed * delta;
            
            // Move spiral center toward player
            const centerX = (enemy.spiralCenterX || enemy.x) - enemy.speed * delta * 0.5;
            const centerY = enemy.spiralCenterY || (GROUND_Y + 120);
            
            // Calculate position on spiral
            const spiralX = centerX + Math.cos(newSpiralAngle) * spiralRadius;
            const spiralY = centerY + Math.sin(newSpiralAngle) * spiralRadius;
            
            // DROP BOMB while spiraling - every 1.5 seconds
            const bombCooldown = (enemy.bombCooldown || 0) - delta;
            if (bombCooldown <= 0 && enemy.x < prev.cameraX + 600 && spiralX > prev.player.x) {
              // Drop a bomb from center of body
              const newBomb: Bomb = {
                id: `spiral-bomb-${Date.now()}-${Math.random()}`,
                x: spiralX + enemy.width / 2, // Center of body
                y: spiralY + enemy.height / 2, // Center of body
                velocityY: -180, // Falls down
                damage: enemy.damage,
                timer: 5,
              };
              newState.bombs = [...(newState.bombs || []), newBomb];
              newState.particles = [...newState.particles, ...createParticles(spiralX + enemy.width/2, spiralY + enemy.height/2, 5, 'muzzle', '#ff8800')];
              
              return {
                ...enemy,
                x: spiralX,
                y: spiralY,
                spiralAngle: newSpiralAngle,
                spiralCenterX: centerX,
                bombCooldown: 1.5 + Math.random() * 0.5, // Bomb cooldown
                animationPhase: newAnimPhase,
              };
            }
            
            return {
              ...enemy,
              x: spiralX,
              y: spiralY,
              spiralAngle: newSpiralAngle,
              spiralCenterX: centerX,
              bombCooldown: Math.max(0, bombCooldown),
              animationPhase: newAnimPhase,
            };
          }

          // DRONE VERTICAL FLYING PATTERN - fly back and forth, slow to bomb, retreat
          if (enemy.type === 'drone' || enemy.type === 'flyer') {
            // Vertical movement - drones fly UP and DOWN the screen
            const verticalSpeed = 2.5;
            const maxHeight = 180; // Maximum height above floor
            const minHeight = 40;  // Minimum height above floor
            
            // Calculate new Y position using sine wave for smooth up/down
            const verticalPos = Math.sin(newAnimPhase * verticalSpeed);
            const targetY = GROUND_Y + minHeight + ((verticalPos + 1) / 2) * (maxHeight - minHeight);
            
            // RETREAT BEHAVIOR - zoom UP then RIGHT off screen, then slowly come back!
            const RETREAT_TRIGGER_DISTANCE = 60; // Distance at which drones trigger retreat
            const RETREAT_SPEED_VERTICAL = 800; // Fast zoom UP
            const RETREAT_SPEED_HORIZONTAL = 600; // Then zoom RIGHT
            const RETURN_SPEED = 80; // SLOW return to attack
            const BOMB_AOE_RANGE = 120; // AOE range for bombs
            const OFF_SCREEN_X = prev.cameraX + 800; // Off right side of screen
            const OFF_SCREEN_Y = GROUND_Y - 200; // High above screen
            
            if (enemy.isRetreating) {
              // Phase 1: Zoom UP first, then RIGHT
              const hasReachedTop = enemy.y < GROUND_Y - 100;
              
              if (!hasReachedTop) {
                // Phase 1: Zoom directly UP
                const newY = enemy.y - RETREAT_SPEED_VERTICAL * delta;
                return {
                  ...enemy,
                  y: newY,
                  animationPhase: newAnimPhase,
                };
              } else {
                // Phase 2: Zoom RIGHT off screen
                const newX = enemy.x + RETREAT_SPEED_HORIZONTAL * delta;
                
                if (newX > prev.cameraX + 700) {
                  // Reached off-screen - now slowly come back
                  return { 
                    ...enemy, 
                    x: OFF_SCREEN_X,
                    y: GROUND_Y + 80 + Math.random() * 80,
                    isRetreating: false,
                    animationPhase: newAnimPhase,
                    bombCooldown: 0.5 + Math.random() * 0.5,
                    originalX: OFF_SCREEN_X,
                    originalY: GROUND_Y + 100,
                  };
                }
                
                return {
                  ...enemy,
                  x: newX,
                  y: OFF_SCREEN_Y,
                  animationPhase: newAnimPhase,
                };
              }
            }
            
            // Check if touching hero - trigger zoom UP then RIGHT retreat!
            if (distToHero < RETREAT_TRIGGER_DISTANCE && !enemy.isRetreating) {
              // Touched hero! Zoom UP then RIGHT immediately
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                bombCooldown: 2.0, // Reset bomb cooldown
              };
            }
            
            // SLOW RETURN - drones returning from retreat move slowly toward hero
            const isReturning = enemy.x > prev.cameraX + 500 && !enemy.isRetreating;
            if (isReturning) {
              // Move slowly toward hero (RETURN_SPEED = 80)
              const moveX = -RETURN_SPEED * delta;
              return {
                ...enemy,
                x: enemy.x + moveX,
                y: targetY,
                animationPhase: newAnimPhase,
                attackCooldown: Math.max(0, enemy.attackCooldown - delta),
                bombCooldown: Math.max(0, (enemy.bombCooldown || 0) - delta),
              };
            }
            
            // DRONE DISTANCE FIRE ATTACK - Shoot fire projectiles from range!
            const attackCooldown = (enemy.attackCooldown || 0) - delta;
            if (distToHero < 400 && distToHero > 150 && attackCooldown <= 0) {
              // Fire a projectile at the hero - TARGET HERO'S GROUND POSITION properly!
              // Hero is at GROUND_Y, drones fly above - calculate proper trajectory
              const droneFireY = enemy.y + enemy.height / 2;
              const heroTargetY = GROUND_Y + PLAYER_HEIGHT / 2; // Hero center on ground
              const heroTargetX = prev.player.x + PLAYER_WIDTH / 2;
              
              // Calculate proper velocity to hit the hero
              const distX = enemy.x - heroTargetX;
              const distY = droneFireY - heroTargetY;
              const totalDist = Math.sqrt(distX * distX + distY * distY);
              
              // Normalize and scale for projectile speed
              const projSpeed = 400 + Math.random() * 100;
              const velX = -(distX / totalDist) * projSpeed; // Move toward hero X
              const velY = -(distY / totalDist) * projSpeed; // Move toward hero Y (downward usually)
              
              const fireProjectile: Projectile = {
                id: `drone-fire-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: droneFireY,
                velocityX: velX,
                velocityY: velY + (Math.random() - 0.5) * 30, // Slight randomness
                damage: Math.floor(enemy.damage * 0.8), // 80% of melee damage
                type: 'normal',
              };
              newState.enemyLasers = [...(newState.enemyLasers || []), fireProjectile];
              
              // Fire attack particles
              newState.particles = [
                ...newState.particles,
                ...createParticles(enemy.x, enemy.y + enemy.height / 2, 6, 'muzzle', '#ff6600'),
              ];
              
              // Set attack cooldown and continue moving
              return {
                ...enemy,
                x: enemy.x + direction * enemy.speed * delta * 0.15,
                y: targetY,
                animationPhase: newAnimPhase,
                attackCooldown: 1.2 + Math.random() * 0.5, // Fire attack cooldown
                bombCooldown: Math.max(0, (enemy.bombCooldown || 0) - delta),
              };
            }
            
            // Check if close enough to DROP BOMB - then retreat!
            const bombCooldown = (enemy.bombCooldown || 0) - delta;
            if (distToHero < BOMB_AOE_RANGE && distToHero >= RETREAT_TRIGGER_DISTANCE && bombCooldown <= 0) {
              // Drop bomb from CENTER OF BODY (torso)
              const centerX = enemy.x + enemy.width / 2;
              const centerY = enemy.y + enemy.height / 2; // Torso position
              
              const newBomb: Bomb = {
                id: `drone-bomb-${Date.now()}-${Math.random()}`,
                x: centerX, // Center of body
                y: centerY, // Torso height
                velocityY: -180, // Falls down
                damage: enemy.damage,
                timer: 5,
              };
              newState.bombs = [...(newState.bombs || []), newBomb];
              
              // Bomb drop particles from torso center
              newState.particles = [
                ...newState.particles,
                ...createParticles(centerX, centerY, 8, 'muzzle', '#ff8800'),
              ];
              
              // Now retreat off screen!
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                bombCooldown: 1.5 + Math.random() * 0.5, // Cooldown for next bomb
                originalX: enemy.originalX ?? enemy.x + 150,
                originalY: enemy.originalY ?? targetY,
                attackCooldown: 1.0, // Reset fire attack cooldown too
              };
            }


            // Smooth horizontal approach toward player
            const horizontalMove = direction * enemy.speed * delta * 0.25;
            
            // Calculate new X position
            let newX = enemy.x + horizontalMove;
            
            // DRONE BOUNDARY: Drones cannot go past the hero's position
            // This prevents drones from flying behind the player
            const heroLeftEdge = prev.player.x - 30; // Give small buffer before hero
            if (newX < heroLeftEdge) {
              newX = heroLeftEdge; // Stop at hero boundary
            }
            
            // Continue vertical flying movement
            return {
              ...enemy,
              y: targetY,
              x: newX,
              animationPhase: newAnimPhase,
              bombCooldown: Math.max(0, bombCooldown),
            };
          }
          
          // BOMBER - Flying enemy that PURSUES HERO and drops bombs from above!
          if (enemy.type === 'bomber') {
            const verticalSpeed = 1.5;
            const maxHeight = 280; // Higher flight ceiling
            const minHeight = 180; // Higher minimum to stay above hero
            
            // PURSUIT BEHAVIOR - Bombers fly toward position ABOVE the hero
            const heroScreenX = prev.player.x;
            const targetAboveHeroX = heroScreenX + 40; // Position slightly ahead of hero
            const targetAboveHeroY = GROUND_Y + 220; // High above the hero
            
            // Calculate direction to target position above hero
            const dxToTarget = targetAboveHeroX - enemy.x;
            const dyToTarget = targetAboveHeroY - enemy.y;
            const distToTarget = Math.sqrt(dxToTarget * dxToTarget + dyToTarget * dyToTarget);
            
            // Calculate Y position with vertical oscillation
            const verticalPos = Math.sin(newAnimPhase * verticalSpeed);
            const baseTargetY = GROUND_Y + minHeight + ((verticalPos + 1) / 2) * (maxHeight - minHeight);
            
            // PURSUIT MODE - When far from hero, aggressively pursue
            const PURSUIT_SPEED = 180;
            const BOMB_DROP_RANGE = 80; // Must be above hero to drop bomb
            const isAboveHero = Math.abs(enemy.x - heroScreenX) < BOMB_DROP_RANGE;
            
            // RETREAT BEHAVIOR after dropping bomb
            const RETREAT_DISTANCE = 100;
            const RETREAT_SPEED = 350;
            
            if (enemy.isRetreating) {
              const origX = enemy.originalX ?? enemy.x + 250;
              const origY = enemy.originalY ?? baseTargetY;
              const halfwayX = prev.player.x + (origX - prev.player.x) * 0.6;
              const halfwayY = maxHeight + GROUND_Y;
              
              const dxToHalfway = halfwayX - enemy.x;
              const dyToHalfway = halfwayY - enemy.y;
              const distToHalfway = Math.sqrt(dxToHalfway * dxToHalfway + dyToHalfway * dyToHalfway);
              
              if (distToHalfway < 50) {
                return { 
                  ...enemy, 
                  x: halfwayX, 
                  y: halfwayY, 
                  isRetreating: false,
                  animationPhase: newAnimPhase,
                  bombCooldown: 1.5,
                };
              }
              
              const moveX = (dxToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              const moveY = (dyToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              
              return {
                ...enemy,
                x: enemy.x + moveX,
                y: enemy.y + moveY,
                animationPhase: newAnimPhase,
              };
            }
            
            // DROP BOMB when directly above hero
            const bombCooldown = (enemy.bombCooldown || 0) - delta;
            
            if (isAboveHero && bombCooldown <= 0 && isOnScreen) {
              // Drop a bomb from CENTER OF BODY then retreat!
              const centerX = enemy.x + enemy.width / 2;
              const centerY = enemy.y + enemy.height / 2;
              
              const newBomb: Bomb = {
                id: `bomb-${Date.now()}-${Math.random()}`,
                x: centerX, // Center of body
                y: centerY, // Center of body
                velocityY: -180, // Falls down
                damage: enemy.damage,
                timer: 5,
              };
              newState.bombs = [...(newState.bombs || []), newBomb];
              
              // Bomb drop visual from body center
              newState.particles = [
                ...newState.particles,
                ...createParticles(centerX, centerY, 12, 'spark', '#ff8800'),
                ...createParticles(centerX, centerY, 6, 'muzzle', '#ffaa00'),
              ];
              
              // Now retreat after bombing!
              return {
                ...enemy,
                isRetreating: true,
                animationPhase: newAnimPhase,
                bombCooldown: 2.5,
                originalX: enemy.x + 200,
                originalY: maxHeight + GROUND_Y,
              };
            }
            
            // PURSUE - Move toward position above hero
            let moveX = 0;
            let moveY = 0;
            
            if (distToTarget > 30) {
              moveX = (dxToTarget / distToTarget) * PURSUIT_SPEED * delta;
              moveY = (dyToTarget / distToTarget) * PURSUIT_SPEED * delta * 0.8;
            }
            
            // Add some vertical oscillation while pursuing
            const oscillationY = Math.sin(newAnimPhase * 3) * 20 * delta;
            
            // Calculate new X position
            let newBomberX = enemy.x + moveX;
            
            // BOMBER BOUNDARY: Bombers cannot go past the hero's position
            const heroLeftBomberEdge = prev.player.x - 20;
            if (newBomberX < heroLeftBomberEdge) {
              newBomberX = heroLeftBomberEdge;
            }
            
            return {
              ...enemy,
              x: newBomberX,
              y: Math.max(minHeight + GROUND_Y, Math.min(maxHeight + GROUND_Y, enemy.y + moveY + oscillationY)),
              animationPhase: newAnimPhase,
              bombCooldown: Math.max(0, bombCooldown),
            };
          }

          // JETROBOT - Flying enemy that shoots NEON BEAMS (damage over time)
          if (enemy.type === 'jetrobot' && !enemy.isDropping) {
            const verticalSpeed = 1.8;
            const maxHeight = 200;
            const minHeight = 80;
            
            const verticalPos = Math.sin(newAnimPhase * verticalSpeed);
            const targetY = GROUND_Y + minHeight + ((verticalPos + 1) / 2) * (maxHeight - minHeight);
            
            // RETREAT BEHAVIOR - zoom back HALFWAY then attack again!
            const RETREAT_DISTANCE = 300; // Jet robots attack from much further distance
            const RETREAT_SPEED = 450;
            
            if (enemy.isRetreating) {
              const origX = enemy.originalX ?? enemy.x + 200;
              const origY = enemy.originalY ?? targetY;
              const halfwayX = prev.player.x + (origX - prev.player.x) * 0.5;
              const halfwayY = (enemy.y + origY) / 2;
              
              const dxToHalfway = halfwayX - enemy.x;
              const dyToHalfway = halfwayY - enemy.y;
              const distToHalfway = Math.sqrt(dxToHalfway * dxToHalfway + dyToHalfway * dyToHalfway);
              
              if (distToHalfway < 40) {
                return { 
                  ...enemy, 
                  x: halfwayX, 
                  y: halfwayY, 
                  isRetreating: false,
                  animationPhase: newAnimPhase,
                  attackCooldown: 0.6,
                };
              }
              
              const moveX = (dxToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              const moveY = (dyToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              
              return {
                ...enemy,
                x: enemy.x + moveX,
                y: enemy.y + moveY,
                animationPhase: newAnimPhase,
              };
            }
            
            // Horizontal movement - approaches player slowly
            const horizontalMove = direction * enemy.speed * delta * 0.2;
            
            // Attack with PROJECTILE when close, then retreat! (No more beams)
            const attackCooldown = (enemy.attackCooldown || 0) - delta;
            const isCloseToHero = distToHero < RETREAT_DISTANCE && distToHero > 0;
            
            if (isCloseToHero && attackCooldown <= 0 && isOnScreen) {
              // Fire IMPROVED PROJECTILE from CENTER OF BODY then retreat!
              const centerX = enemy.x + enemy.width / 2;
              const centerY = targetY + enemy.height / 2;
              
              // Calculate accurate trajectory to hero center
              const targetHeroX = prev.player.x + PLAYER_WIDTH / 2;
              const targetHeroY = prev.player.y + PLAYER_HEIGHT / 2;
              const dx = targetHeroX - centerX;
              const dy = targetHeroY - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const speed = 750; // Faster projectile
              
              const jetProjectile: Projectile = {
                id: `jetrobot-proj-${Date.now()}-${Math.random()}`,
                x: centerX, // Center of body
                y: centerY, // Center of body
                velocityX: (dx / distance) * speed,
                velocityY: (dy / distance) * speed,
                damage: 12,
                type: 'mega',
                originX: centerX,
                originY: centerY,
              };
              newState.enemyLasers = [...newState.enemyLasers, jetProjectile];
              
              // Screen shake on JetRobot attack
              newState.screenShake = Math.max(newState.screenShake || 0, 0.2);
              
              // Enhanced muzzle flash particles
              newState.particles = [
                ...newState.particles,
                ...createParticles(centerX, centerY, 8, 'muzzle', '#00ffff'),
              ];
              
              // Now retreat halfway!
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                attackCooldown: 1.2, // Faster attack cycle
                originalX: enemy.originalX ?? enemy.x + 150,
                originalY: enemy.originalY ?? targetY,
              };
            }
            
            return {
              ...enemy,
              y: targetY,
              x: enemy.x + horizontalMove,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, attackCooldown),
            };
          }

          // NINJA teleports when close to player
          if (enemy.type === 'ninja' && Math.abs(dx) < 150 && Math.random() > 0.95) {
            // Teleport ahead of player
            const teleportX = prev.player.x + 200 + Math.random() * 150;
            newState.particles = [...newState.particles, ...createParticles(enemy.x, currentY, 10, 'magic', '#8800ff')];
            newState.particles = [...newState.particles, ...createParticles(teleportX, GROUND_Y, 10, 'magic', '#8800ff')];
            return { ...enemy, x: teleportX, y: GROUND_Y, animationPhase: newAnimPhase, attackCooldown: 0.8 };
          }

          // MELEE/SLASH ATTACK - when close to hero, hit then retreat!
          if (canMeleeAttack && enemy.attackCooldown <= 0 && !enemy.isRetreating && Math.random() > 0.5) {
            // Slash attack - no projectile, direct damage with visual
            newState.particles = [
              ...newState.particles, 
              ...createParticles(enemy.x - 20, currentY + enemy.height / 2, 12, 'spark', '#ff4400'),
            ];
            
            // Slash hits player if very close
            if (distToHero < 70) {
              if (newState.player.shield > 0) {
                newState.player.shield = Math.max(0, newState.player.shield - enemy.damage * 0.8);
                newState.shieldBlockFlash = 0.8;
                newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT/2, 15, 'spark', '#00ffff')];
              } else {
                newState.player.health -= enemy.damage * 0.6;
                newState.damageFlash = 0.6;
                newState.screenShake = 0.2;
              }
            }
            
            // After hitting, retreat to original position!
            const retreatX = enemy.originalX ?? (enemy.x + 120 + Math.random() * 80);
            return { 
              ...enemy, 
              attackCooldown: 1.5 + Math.random() * 0.5,
              animationPhase: newAnimPhase,
              isSlashing: true,
              isRetreating: true,
              originalX: retreatX,
              originalY: GROUND_Y,
            };
          }
          
          // GROUND ENEMY RETREAT - zoom back to original position after attack
          if (enemy.isRetreating && !isFlying) {
            const origX = enemy.originalX ?? enemy.x + 150;
            const dxToOrigin = origX - enemy.x;
            
            if (Math.abs(dxToOrigin) < 20) {
              // Reached original position, stop retreating
              return { 
                ...enemy, 
                x: origX, 
                y: GROUND_Y,
                isRetreating: false,
                animationPhase: newAnimPhase,
                isSlashing: false,
              };
            }
            
            // Move toward original position quickly (jump back)
            const retreatSpeed = 280;
            const moveX = Math.sign(dxToOrigin) * retreatSpeed * delta;
            
            return {
              ...enemy,
              x: enemy.x + moveX,
              y: GROUND_Y + Math.sin(newAnimPhase * 10) * 15, // Slight hop while retreating
              animationPhase: newAnimPhase,
              isSlashing: false,
            };
          }

          // SENTINEL LASER ATTACK - powerful ground mech with screen flash!
          if (enemy.type === 'sentinel' && canRangedAttack && enemy.attackCooldown <= 0 && Math.random() > 0.5) {
            // Sentinel fires POWERFUL laser from CENTER OF BODY with screen flash effect!
            const centerX = enemy.x + enemy.width / 2;
            const centerY = currentY + enemy.height / 2;
            
            const sentinelLaser: Projectile = {
              id: `sentinel-laser-${Date.now()}-${Math.random()}`,
              x: centerX, // Center of body
              y: centerY, // Center of body
              velocityX: -600,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - centerY) * 0.3,
              damage: 18,
              type: 'ultra',
            };
            newState.enemyLasers = [...newState.enemyLasers, sentinelLaser];
            
            // SCREEN FLASH when sentinel fires!
            newState.redFlash = 0.4;
            newState.screenShake = 0.35;
            
            // Hot pink laser muzzle flash particles at center
            newState.particles = [
              ...newState.particles, 
              ...createParticles(centerX, centerY, 15, 'laser', '#ff0066'),
              ...createParticles(centerX, centerY, 10, 'muzzle', '#ff00ff'),
            ];
            
            return { 
              ...enemy, 
              y: currentY, 
              attackCooldown: 1.8, // Slower attack but more powerful
              animationPhase: newAnimPhase,
              isSlashing: false,
            };
          }

          if (canRangedAttack && enemy.attackCooldown <= 0 && Math.random() > 0.6 && enemy.type !== 'sentinel') {
            // Different projectile based on enemy type - FIRE FROM CENTER OF BODY
            const isHeavy = enemy.type === 'mech' || enemy.type === 'tank';
            const rocketSpeed = isHeavy ? -380 : -450;
            const rocketDamage = isHeavy ? 14 : 9;
            
            // Center of body calculation
            const centerX = enemy.x + enemy.width / 2;
            const centerY = currentY + enemy.height / 2;
            
            const rocket: Projectile = {
              id: `rocket-${Date.now()}-${Math.random()}`,
              x: centerX, // Center of body
              y: centerY, // Center of body
              velocityX: rocketSpeed,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - centerY) * 0.5,
              damage: rocketDamage,
              type: isHeavy ? 'mega' : 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, rocket];
            
            // SCREEN SHAKE when enemies fire!
            newState.screenShake = Math.max(newState.screenShake || 0, isHeavy ? 0.25 : 0.15);
            
            // Rocket launch particles at body center
            newState.particles = [
              ...newState.particles, 
              ...createParticles(enemy.x - 5, currentY + enemy.height / 2, 8, 'muzzle', '#ff8800'),
            ];
            
            return { 
              ...enemy, 
              y: currentY, 
              attackCooldown: isHeavy ? 1.2 : 0.9, 
              animationPhase: newAnimPhase,
              isSlashing: false,
            };
          }

          // Movement with collision prevention - enemies stop before overlapping
          const canMoveForward = !wouldOverlap && !tooClose && !reachedMinDistance;
          
          if (Math.abs(dx) < 500 && canMoveForward) {
            const speedBoost = 1.3 * aggressionBonus; // Faster movement, more aggressive later
            // Add strafing movement for ground enemies to dodge hero attacks
            const strafeX = shouldStrafe ? strafeSpeed * delta : 0;
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta * moveMultiplier * speedBoost + strafeX,
              y: nextY,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta * aggressionBonus), // Faster attack cooldown
              isSlashing: false,
            };
          }

          // JUMP BACK BEHAVIOR - when enemies get too close to hero, they jump back then come forward
          const isVeryCloseToHero = distToHero > 0 && distToHero < 80;
          const shouldJumpBack = isVeryCloseToHero && !isFlying && Math.random() > 0.85;
          
          if (shouldJumpBack) {
            // Jump back away from hero, then will come forward again on next frame
            const jumpBackDistance = 60 + Math.random() * 40;
            const jumpUpHeight = 30 + Math.random() * 25;
            newState.particles = [
              ...newState.particles,
              ...createParticles(enemy.x, currentY + enemy.height / 2, 6, 'spark', '#ffff00'),
            ];
            return {
              ...enemy,
              x: enemy.x + jumpBackDistance, // Jump away from hero
              y: baseY + jumpUpHeight, // Jump up temporarily
              animationPhase: newAnimPhase,
              attackCooldown: 0.3, // Brief cooldown after jumping back
              isSlashing: false,
            };
          }

          // At min distance or collision distance - sway but don't advance
          if (reachedMinDistance || wouldOverlap) {
            const sway = Math.sin(newAnimPhase * 5) * 15 * delta; // Sway back and forth
            // Push back if too close
            const pushBack = wouldOverlap ? 2 : 0;
            return {
              ...enemy,
              x: enemy.x + sway + pushBack,
              y: nextY,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
              isSlashing: false,
            };
          }

          return { ...enemy, y: nextY, animationPhase: newAnimPhase, attackCooldown: Math.max(0, enemy.attackCooldown - delta), isSlashing: false };
        });
        
        // Player-enemy collision - ARMOR ABSORBS DAMAGE with impact FX
        newState.enemies.forEach(enemy => {
          if (enemy.isDying || enemy.isSpawning) return;
          
          // Generous collision detection
          if (
            prev.player.x < enemy.x + enemy.width &&
            prev.player.x + PLAYER_WIDTH > enemy.x &&
            prev.player.y < enemy.y + enemy.height + 20 &&
            prev.player.y + PLAYER_HEIGHT > enemy.y - 20
          ) {
            if (newState.player.shield > 0) {
              // ARMOR ABSORBS CONTACT DAMAGE!
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage * 0.5);
              newState.shieldBlockFlash = 1;
              newState.screenShake = 0.25;
              newState.particles = [
                ...newState.particles, 
                ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 18, 'spark', '#00ffff'),
              ];
              
              // Taunt on block!
              if (Math.random() > 0.8) {
                const taunt = ENEMY_TAUNTS[Math.floor(Math.random() * ENEMY_TAUNTS.length)];
                showSpeechBubble(taunt, 'excited');
              }
            } else {
              // NO ARMOR - Take health damage
              newState.player.health -= enemy.damage * delta * 2;
              newState.player.animationState = 'hurt';
              newState.damageFlash = 0.5;
              newState.screenShake = 0.25;
              if (navigator.vibrate) {
                navigator.vibrate(50);
              }
              setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 150);
              
              // Ask for help!
              if (Math.random() > 0.7) {
                const request = GIFT_REQUESTS[Math.floor(Math.random() * GIFT_REQUESTS.length)];
                showSpeechBubble(request, 'help');
              }
            }
            newState.combo = 0;
            newState.killStreak = 0;
          }
        });
        
        // Update particles - aggressive cleanup for performance
        // Reset old particles to make room for new ones
        const activeParticles = prev.particles.filter(p => p.life > delta * 2);
        newState.particles = activeParticles
          .slice(-MAX_PARTICLES) // Keep only the most recent particles up to limit
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            velocityY: p.velocityY + 400 * delta,
            life: p.life - delta,
          }))
          .filter(p => p.life > 0);
        
        // Flying robots removed - replaced with war silhouettes in parallax
        newState.flyingRobots = [];
        
        // Neon lights - reduced
        newState.neonLights = prev.neonLights.filter(light => light.x - prev.cameraX < 800).slice(0, 4);
        
        if (Math.random() > 0.985) {
          const colors = ['#ff00ff', '#00ffff', '#ffff00'];
          newState.neonLights = [...newState.neonLights, {
            id: `neon-${Date.now()}`,
            x: prev.cameraX + Math.random() * 600,
            y: 25 + Math.random() * 100,
            size: 10 + Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 60 + Math.random() * 60,
          }];
        }
        
        // Explosions - reduced
        newState.explosions = prev.explosions
          .filter(exp => exp.timer > 0)
          .map(exp => ({ ...exp, timer: exp.timer - delta }))
          .slice(0, 4);
        
        if (Math.random() > 0.98) {
          newState.explosions = [...newState.explosions, {
            id: `exp-${Date.now()}-${Math.random()}`,
            x: prev.cameraX + 80 + Math.random() * 600,
            y: 35 + Math.random() * 100,
            size: 25 + Math.random() * 40,
            timer: 0.5,
          }];
        }
        
        // Kill combo timer
        if (prev.comboTimer > 0) {
          newState.comboTimer = prev.comboTimer - delta;
          if (newState.comboTimer <= 0) newState.combo = 0;
        }
        
        // GIFT COMBO TIMER - decays over 3 seconds
        if (prev.giftComboTimer > 0) {
          newState.giftComboTimer = prev.giftComboTimer - delta;
          if (newState.giftComboTimer <= 0) {
            newState.giftCombo = 0;
            newState.giftDamageMultiplier = 1.0;
          }
        }
        
        // Win condition - Hero must enter the portal after boss is defeated
        const portalX = newState.portalX || prev.levelLength - 200;
        const heroNearPortal = Math.abs(newState.player.x - portalX) < 50;
        
        // Check if portal is open and hero reaches it
        if (newState.portalOpen && heroNearPortal && !newState.heroEnteringPortal) {
          newState.heroEnteringPortal = true;
          newState.screenShake = 1.2;
          showSpeechBubble("ENTERING PORTAL! 🌀✨", 'excited');
          
          // Delay victory by a brief moment for the entering animation
          setTimeout(() => {
            setGameState(s => ({ ...s, phase: 'victory' }));
          }, 800);
        }
        
        // Lose condition
        if (newState.player.health <= 0) {
          newState.phase = 'gameover';
        }
        
        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.phase, createParticles, showSpeechBubble]);

  // Trigger summon with 15s cooldown
  const triggerSummon = useCallback((type: 'ally' | 'ult' | 'tank') => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev };
      
      if (type === 'ally' && prev.allyCooldown <= 0) {
        const activeAllies = prev.supportUnits.filter(u => !u.isSelfDestructing).length;
        if (activeAllies < 2) {
          const units = createSupportUnits(prev.player.x, prev.player.y, prev.player.maxHealth, prev.player.shield, activeAllies);
          newState.supportUnits = [...prev.supportUnits, ...units.slice(0, 2 - activeAllies)];
          newState.allyCooldown = 15;
          newState.screenShake = 1.0; // Heavy screen shake on ally landing
          newState.score += 200;
          showSpeechBubble("🤖 ALLIES DEPLOYED! 🤖", 'excited');
        }
      } else if (type === 'ult' && prev.ultCooldown <= 0) {
        newState.player = { ...prev.player, isMagicDashing: true, magicDashTimer: 6 };
        newState.ultCooldown = 15;
        newState.screenShake = 1.0;
        newState.magicFlash = 1.5;
        newState.score += 300;
        showSpeechBubble("🚀 SPACESHIP MODE! 🚀", 'excited');
      } else if (type === 'tank' && prev.tankCooldown <= 0) {
        const activeTanks = prev.supportUnits.filter(u => u.type === 'tank' && !u.isSelfDestructing).length;
        if (activeTanks < 1) {
          const tank = createTankSupport(prev.player.x, prev.player.y);
          newState.supportUnits = [...prev.supportUnits, tank];
          newState.tankCooldown = 15;
          newState.screenShake = 1.5; // Heavy screen shake on tank landing
          newState.score += 300;
          showSpeechBubble("🔫 TANK DEPLOYED! 🔫", 'excited');
        }
      }
      
      return newState;
    });
  }, [showSpeechBubble]);

  return {
    gameState,
    giftEvents,
    leaderboard,
    notifications,
    startGame,
    startNextWave,
    handleGift,
    triggerSummon,
  };
};
