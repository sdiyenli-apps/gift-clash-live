import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken, GiftBlock, TIKTOK_GIFTS,
  ENEMY_TAUNTS, GIFT_REQUESTS, getBossName, Bomb, SupportUnit
} from '@/types/game';

const GRAVITY = 0;
const GROUND_Y = 120; // Lowered ground for zoomed out view
const PLAYER_WIDTH = 32; // Slightly larger hitbox
const PLAYER_HEIGHT = 48; // Taller for run-and-gun style
const BASE_LEVEL_LENGTH = 12000; // Longer levels
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;
const KILL_RADIUS = 70; // Bigger kill radius
const ENEMY_MIN_DISTANCE = 100; // More space between enemies
const ENEMY_COLLISION_DISTANCE = 60; // Enemies stop here - no overlap with hero
const SLASH_ATTACK_RANGE = 80; // Closer melee range for better gameplay
const ROCKET_ATTACK_RANGE = 350; // Ranged attack distance
const BOSS_FIREBALL_INTERVAL = 4; // Faster boss attacks
const BOSS_MEGA_ATTACK_THRESHOLD = 0.25;
const BOSS_KEEP_DISTANCE = 400; // Boss combat distance
const HERO_FIXED_SCREEN_X = 50; // Hero position on screen

// Boss attack types
type BossAttackType = 'fireball' | 'laser_sweep' | 'missile_barrage' | 'ground_pound' | 'screen_attack' | 'shield';

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
  timer: number; // Time until explosion
}

// Neon beam fired by jet robots - deals damage over time
interface NeonBeam {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  life: number; // How long the beam lasts
  damageTimer: number; // Time between damage ticks
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
  // Sound event triggers
  lastBossAttack: BossAttackType | null;
  // EMP Grenade
  empGrenades: EMPGrenade[];
  // Bombs dropped by bomber enemies
  bombs: Bomb[];
  // Portal state
  portalOpen: boolean;
  portalX: number;
  heroEnteringPortal: boolean;
  // Boss transformation flash effect
  bossTransformFlash: number;
  // Neon beams from jet robots
  neonBeams: NeonBeam[];
  // Support units that fight alongside the hero
  supportUnits: SupportUnit[];
  // Support unit projectiles
  supportProjectiles: Projectile[];
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
  // Neon beams from jet robots
  neonBeams: [],
  // Support units
  supportUnits: [],
  supportProjectiles: [],
};

// 8 enemy types: robot, drone, mech, ninja, tank, giant, bomber, sentinel - EQUAL SPAWN RATES
const ENEMY_TYPES = ['robot', 'drone', 'mech', 'ninja', 'tank', 'giant', 'bomber', 'sentinel'] as const;
// Each enemy type gets roughly equal chance (12.5% each for 8 types)
const EQUAL_SPAWN_CHANCE = 1 / 8; // ~12.5% each

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.3, wave - 1), 50000);
  // Harder difficulty: more enemies spawn as waves progress
  const baseDensity = 200;
  const densityReduction = Math.min(wave * 8, 120); // Reduces spacing as wave increases
  const enemyDensity = Math.max(80, baseDensity - densityReduction);
  
  // EQUAL SPAWN RATES for all 8 enemy types (12.5% each)
  for (let x = 400; x < levelLength - 800; x += enemyDensity + Math.random() * 80) {
    const typeRoll = Math.random();
    const waveBonus = Math.min(wave * 0.15, 3); // Stronger scaling per wave
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    // EQUAL spawn chance for all 8 enemy types (~12.5% each)
    if (typeRoll < 0.125) {
      // ROBOT - ground unit
      enemyType = 'robot';
      width = 50; height = 58; health = 45 * (1 + waveBonus); speed = 55 + wave * 2.5; damage = 9 + wave;
    } else if (typeRoll < 0.25) {
      // MECH - ground unit
      enemyType = 'mech';
      width = 55; height = 60;
      health = 90 * (1 + waveBonus); speed = 32 + wave * 2.5; damage = 16 + wave;
    } else if (typeRoll < 0.375) {
      // TANK - ground unit
      enemyType = 'tank';
      width = 70; height = 65; health = 180 * (1 + waveBonus); speed = 18 + wave * 1.5; damage = 22 + wave;
    } else if (typeRoll < 0.5) {
      // SENTINEL - Large ground mech with laser attacks
      enemyType = 'sentinel';
      width = 75; height = 80;
      health = 220 * (1 + waveBonus);
      speed = 35 + wave * 1.5; 
      damage = 25 + wave;
    } else if (typeRoll < 0.625) {
      // NINJA - ground unit (fast)
      enemyType = 'ninja';
      width = 45; height = 52; health = 35 * (1 + waveBonus * 0.6); speed = 150 + wave * 8; damage = 12 + wave;
    } else if (typeRoll < 0.75) {
      // GIANT - large ground unit
      enemyType = 'giant';
      width = 90; height = 100; health = 300 * (1 + waveBonus); speed = 25 + wave; damage = 30 + wave * 2;
    } else if (typeRoll < 0.875) {
      // DRONE - flying enemy
      enemyType = 'drone';
      width = 50; height = 50;
      health = 32 * (1 + waveBonus * 0.5); 
      speed = 90 + wave * 3; 
      damage = 7 + Math.floor(wave / 2);
      
      const droneEnemy = {
        id: `enemy-${x}-${Math.random()}`,
        x,
        y: GROUND_Y + 60 + Math.random() * 50,
        width,
        height,
        health,
        maxHealth: health,
        speed,
        damage,
        type: enemyType as 'drone',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
        isFlying: true,
        flyHeight: 60 + Math.random() * 50,
      };
      enemies.push(droneEnemy);
      continue;
    } else {
      // BOMBER - flying enemy that drops bombs
      enemyType = 'bomber';
      width = 55; height = 50; 
      health = 50 * (1 + waveBonus * 0.6); 
      speed = 60 + wave * 2; 
      damage = 15 + wave;
      
      const bomberEnemy = {
        id: `bomber-${x}-${Math.random()}`,
        x,
        y: GROUND_Y + 220 + Math.random() * 60,
        width,
        height,
        health,
        maxHealth: health,
        speed,
        damage,
        type: enemyType as 'bomber',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
        isFlying: true,
        flyHeight: 220 + Math.random() * 60,
        bombCooldown: 2 + Math.random() * 2,
      };
      enemies.push(bomberEnemy);
      continue;
    }
    
    enemies.push({
      id: `enemy-${x}-${Math.random()}`,
      x,
      y: GROUND_Y,
      width,
      height,
      health,
      maxHealth: health,
      speed,
      damage,
      type: enemyType,
      isDying: false,
      deathTimer: 0,
      attackCooldown: 0,
      animationPhase: Math.random() * Math.PI * 2,
      isSpawning: true,
      spawnTimer: 0.8,
    });
  }
  
  // Add extra drone swarms at higher waves
  if (wave >= 3) {
    const droneSwarmCount = Math.min(Math.floor(wave / 2), 8);
    for (let i = 0; i < droneSwarmCount; i++) {
      const swarmX = 600 + Math.random() * (levelLength - 1400);
      const swarmY = GROUND_Y + 80 + Math.random() * 60;
      enemies.push({
        id: `drone-swarm-${i}-${Math.random()}`,
        x: swarmX,
        y: swarmY,
        width: 42,
        height: 42,
        health: 35 * (1 + wave * 0.1),
        maxHealth: 35 * (1 + wave * 0.1),
        speed: 100 + wave * 4,
        damage: 8 + wave,
        type: 'drone',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
        isFlying: true,
        flyHeight: 80 + Math.random() * 60,
        originalX: swarmX, // Store original position for retreat
        originalY: swarmY,
        droneVariant: Math.floor(Math.random() * 5), // Random drone variant 0-4
      });
    }
  }
  
  // Add bomber squadrons at higher waves
  if (wave >= 5) {
    const bomberCount = Math.min(Math.floor(wave / 4), 6);
    for (let i = 0; i < bomberCount; i++) {
      const bomberX = 700 + Math.random() * (levelLength - 1600);
      const bomberY = GROUND_Y + 230 + Math.random() * 60;
      enemies.push({
        id: `bomber-squadron-${i}-${Math.random()}`,
        x: bomberX,
        y: bomberY, // MUCH higher
        width: 55,
        height: 50,
        health: 55 * (1 + wave * 0.08),
        maxHealth: 55 * (1 + wave * 0.08),
        speed: 65 + wave * 2,
        damage: 18 + wave,
        type: 'bomber',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.8,
        isFlying: true,
        flyHeight: 230 + Math.random() * 60, // MUCH higher than drones
        bombCooldown: 1.5 + Math.random() * 2,
        originalX: bomberX, // Store original position for retreat
        originalY: bomberY,
        droneVariant: Math.floor(Math.random() * 5), // Random drone variant 0-4
      });
    }
  }
  
  // Add JET ROBOT enemies that DROP FROM TOP - same spawn rate as other enemies
  // Jet robots spawn throughout the level like regular enemies
  const jetRobotChance = 0.15; // 15% chance per spawn point
  for (let x = 450; x < levelLength - 800; x += enemyDensity + Math.random() * 100) {
    if (Math.random() < jetRobotChance) {
      const jetHealth = 80 * (1 + wave * 0.1);
      const jetY = GROUND_Y + 120 + Math.random() * 60;
      enemies.push({
        id: `jetrobot-${x}-${Math.random()}`,
        x,
        y: jetY, // Target flying height
        width: 55,
        height: 50,
        health: jetHealth,
        maxHealth: jetHealth,
        speed: 70 + wave * 2,
        damage: 12 + wave,
        type: 'jetrobot',
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: false,
        isDropping: true, // Drops from top of screen
        dropTimer: 1.2, // Drop animation time
        isFlying: true,
        flyHeight: 120 + Math.random() * 60,
        empOnly: true, // Can ONLY be killed by EMP
        originalX: x, // Store original position for retreat
        originalY: jetY,
      });
    }
  }

  // Princess is ONLY at wave 1000 - final destination!
  const isFinalBoss = wave === 1000;
  const isMegaBoss = wave % 100 === 0; // Every 100 waves = mega boss
  const isMiniBoss = wave % 10 === 0; // Every 10 waves = mini boss
  
  // Boss size scales with wave - MUCH LARGER boss!
  const baseBossSize = 180; // Larger base size
  const sizeMultiplier = isFinalBoss ? 4 : (1 + wave * 0.005); // Final boss is 4x size
  const bossSize = Math.min(baseBossSize * sizeMultiplier, isFinalBoss ? 500 : 320);
  
  // Boss health scales dramatically
  const bossBaseHealth = isFinalBoss 
    ? 50000 // Final boss has 50k health
    : (1800 + wave * 250) * (isMegaBoss ? 2 : isMiniBoss ? 1.5 : 1);
  
  enemies.push({
    id: 'boss-monster',
    x: levelLength - 500,
    y: GROUND_Y - (bossSize * 0.4), // Bigger bosses need more ground clearance
    width: bossSize,
    height: bossSize,
    health: bossBaseHealth,
    maxHealth: bossBaseHealth,
    speed: 40 + wave * 0.5,
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
  
  return { enemies, obstacles, levelLength };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<ExtendedGameState>(INITIAL_STATE);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Gifter[]>([]);
  const [notifications, setNotifications] = useState<GiftEvent[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const helpRequestTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Max particles limit for performance
  const MAX_PARTICLES = 30;

  const createParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string): Particle[] => {
    const particles: Particle[] = [];
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
    
    // Optimized: fewer particles for performance
    const maxParticles = Math.min(count, 6);
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        id: `p-${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 300,
        velocityY: (Math.random() - 0.8) * 300,
        color: color || colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        life: 0.15 + Math.random() * 0.2, // Shorter lifespan
        type,
      });
    }
    return particles;
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
    const { enemies, obstacles, levelLength } = generateLevel(wave);
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      enemies,
      obstacles,
      levelLength,
      lastGiftTime: Date.now(),
      currentWave: wave,
    });
    setGiftEvents([]);
    lastUpdateRef.current = Date.now();
    showSpeechBubble(`WAVE ${wave}! LET'S GO! 🔥`, 'excited');
  }, [showSpeechBubble]);

  const startNextWave = useCallback(() => {
    const nextWave = gameState.currentWave + 1;
    if (nextWave <= MAX_WAVES) {
      const { enemies, obstacles, levelLength } = generateLevel(nextWave);
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        enemies,
        obstacles,
        levelLength,
        player: { ...INITIAL_PLAYER },
        distance: 0,
        cameraX: 0,
        projectiles: [],
        particles: [],
        isUltraMode: false,
        ultraModeTimer: 0,
        isBossFight: false,
        currentWave: nextWave,
        lastGiftTime: Date.now(),
        fireballs: [],
        bossFireballTimer: BOSS_FIREBALL_INTERVAL,
        bossMegaAttackUsed: false,
        redFlash: 0,
        armorTimer: 0,
        enemyLasers: [],
        chickens: [],
        magicFlash: 0,
        bossTaunt: null,
        bossTauntTimer: 0,
        // Reset portal for next wave
        portalOpen: false,
        portalX: 0,
        heroEnteringPortal: false,
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
  const createSupportUnits = (playerX: number, playerY: number, playerMaxHealth: number, playerShield: number): SupportUnit[] => {
    const supportUnits: SupportUnit[] = [];
    // Half of hero's stats
    const halfMaxHealth = Math.floor(playerMaxHealth / 2);
    const halfShield = Math.floor(playerShield / 2);
    
    // Mech unit - heavier, shoots bombs
    // Mech unit - heavier, shoots bombs - positioned IN FRONT of hero
    supportUnits.push({
      id: `support-mech-${Date.now()}`,
      x: playerX + 80,
      y: playerY,
      width: 55,
      height: 60,
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'mech',
      timer: 10, // 10 seconds
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 1.0,
    });
    
    // Walker unit - lighter, shoots lasers - positioned IN FRONT of hero (further)
    supportUnits.push({
      id: `support-walker-${Date.now()}`,
      x: playerX + 140,
      y: playerY,
      width: 50,
      height: 55,
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'walker',
      timer: 10, // 10 seconds
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 1.2,
    });
    
    return supportUnits;
  };

  // Process gift actions
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          // Hero moves forward, camera follows to create movement feeling
          const moveDistance = 80;
          newState.player = {
            ...prev.player,
            x: prev.player.x + moveDistance,
            animationState: 'run',
          };
          // Camera will smoothly follow via the game loop
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 8, 'dash', '#00ffff')];
          newState.score += 15;
          showSpeechBubble("MOVING! 🏃", 'normal');
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 300);
          break;
          
        case 'shoot':
          // Hero fires LASER FROM ARMOR - shoots from chest/armor area toward ground enemies
          const heroScreenX = 60; // Hero's fixed screen position
          const heroWorldX = prev.cameraX + heroScreenX + 28; // Start from hero's armor/chest
          // Laser comes from ARMOR position (mid-chest area) - targets ground level
          const laserY = prev.player.y + PLAYER_HEIGHT * 0.4; // From armor/chest area
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: heroWorldX, // Start from armor
            y: laserY, // Armor height
            velocityX: 700, // Fast laser
            velocityY: 15, // Slight downward angle to hit ground enemies
            damage: prev.player.isMagicDashing ? 150 : 60,
            type: prev.player.isMagicDashing ? 'ultra' : 'mega',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          // Muzzle flash particles at armor origin - cyan glow
          newState.particles = [...prev.particles, 
            ...createParticles(heroWorldX, laserY, 18, 'muzzle', '#00ffff'),
            ...createParticles(heroWorldX - 5, laserY, 8, 'spark', '#ffffff'),
          ];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 150);
          newState.score += 20;
          
          if (Math.random() > 0.7) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
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
          
        case 'magic_dash':
          newState.player = {
            ...prev.player,
            isMagicDashing: true,
            magicDashTimer: 6,
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 30, 'ultra', '#ff00ff')];
          newState.score += 300;
          newState.screenShake = 1.0;
          newState.magicFlash = 1.5; // BIG FLASH!
          newState.redFlash = 0.3; // Extra flash
          newState.chickens = [...prev.chickens, ...createAttackChickens(prev.player.x, prev.enemies)];
          
          // SPAWN NEON LASERS THAT BOUNCE OFF WALLS!
          const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
          const newNeonLasers: NeonLaser[] = [];
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            newNeonLasers.push({
              id: `neon-${Date.now()}-${i}`,
              x: prev.player.x + PLAYER_WIDTH / 2,
              y: prev.player.y + PLAYER_HEIGHT / 2,
              velocityX: Math.cos(angle) * (400 + Math.random() * 300),
              velocityY: Math.sin(angle) * (400 + Math.random() * 300),
              bounces: 5,
              life: 4,
            });
          }
          newState.neonLasers = [...prev.neonLasers, ...newNeonLasers];
          
          showSpeechBubble("🦁 RAWWWWR! NEON FURY! 🦁", 'excited');
          break;

        case 'spawn_enemies' as GiftAction:
          // New gift that spawns dangerous enemies
          newState.enemies = [...prev.enemies, ...createDangerousEnemies(prev.player.x, 3, prev.enemies)];
          newState.screenShake = 0.4;
          showSpeechBubble("⚠️ DANGER! ENEMIES SPAWNED! ⚠️", 'urgent');
          break;

        case 'emp_grenade' as GiftAction:
          // Hero THROWS an EMP grenade - launches from TOP of hero
          const grenade: EMPGrenade = {
            id: `emp-${Date.now()}`,
            x: prev.player.x + PLAYER_WIDTH / 2,
            y: prev.player.y + PLAYER_HEIGHT + 30, // From TOP of hero (above head)
            velocityX: 300,
            velocityY: 350, // Higher arc since starting from top
            timer: 1.2, // Explodes after 1.2 seconds
          };
          newState.empGrenades = [...prev.empGrenades, grenade];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH / 2, prev.player.y + PLAYER_HEIGHT + 30, 12, 'spark', '#00ffff')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 300);
          newState.score += 100;
          showSpeechBubble("⚡ EMP OUT! YEET! ⚡", 'excited');
          break;

        case 'summon_support' as GiftAction:
          // Summon 2 support units that fight alongside the hero for 10 seconds
          const newSupportUnits = createSupportUnits(prev.player.x, prev.player.y, prev.player.maxHealth, prev.player.shield);
          newState.supportUnits = [...prev.supportUnits, ...newSupportUnits];
          newState.particles = [
            ...prev.particles, 
            ...createParticles(prev.player.x - 50, 400, 20, 'magic', '#00ff88'),
            ...createParticles(prev.player.x - 100, 400, 20, 'magic', '#ffaa00'),
          ];
          newState.screenShake = 0.5;
          newState.score += 200;
          showSpeechBubble("🤖 REINFORCEMENTS INCOMING! 🤖", 'excited');
          break;
      }
      
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
          
          if (newState.bossAttackCooldown <= 0 && bossIdx !== -1) {
            // Update boss shield timer
            if (bossEnemy.bossShieldTimer && bossEnemy.bossShieldTimer > 0) {
              newState.enemies[bossIdx] = {
                ...newState.enemies[bossIdx],
                bossShieldTimer: bossEnemy.bossShieldTimer - delta,
              };
            }
            
            // Determine which attacks are available based on wave tier
            // Shield only available if not used yet
            const availableAttacks: BossAttackType[] = ['fireball'];
            
            // Only add shield if not yet used
            if (!bossEnemy.bossShieldUsed) {
              availableAttacks.push('shield');
            }
            if (wave >= 10) availableAttacks.push('laser_sweep');
            if (wave >= 25) availableAttacks.push('missile_barrage');
            if (wave >= 50) availableAttacks.push('ground_pound');
            if (wave >= 100 || bossPhase >= 3) availableAttacks.push('screen_attack');
            
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
                      damage: 10 + Math.floor(wave / 20),
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
                      damage: 12 + Math.floor(wave / 25),
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
                          damage: 8 + Math.floor(wave / 30),
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
                  const shockwaveDamage = 15 + Math.floor(wave / 20);
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
                        // Deal damage if no shield
                        const damage = s.player.shield > 0 
                          ? 0 
                          : Math.min(40 + Math.floor(wave / 10), 80);
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
                  // Boss activates shield ONCE - blocks all damage for 1 second
                  if (!bossEnemy.bossShieldUsed && (!bossEnemy.bossShieldTimer || bossEnemy.bossShieldTimer <= 0)) {
                    newState.enemies[bossIdx] = {
                      ...newState.enemies[bossIdx],
                      bossShieldTimer: 1, // 1 second of invulnerability
                      bossShieldUsed: true, // Mark as used - can only use once
                    };
                    newState.screenShake = 0.4;
                    newState.bossTaunt = "MY SHIELD IS IMPENETRABLE!";
                    showSpeechBubble("🛡️ BOSS SHIELD! 1 SEC! 🛡️", 'urgent');
                    newState.particles = [...newState.particles, ...createParticles(
                      bossEnemy.x + bossEnemy.width / 2, bossEnemy.y + bossEnemy.height / 2, 
                      25, 'spark', '#00ffff'
                    )];
                  }
                  break;
              }
              
              // Set cooldown based on phase
              const baseCooldown = wave >= 100 ? 2 : 3;
              newState.bossAttackCooldown = baseCooldown - (bossPhase * 0.4) + Math.random();
            }
          }
          
          // Boss phase transitions - grows bigger and more evil!
          if (bossIdx !== -1) {
            const currentPhase = newState.enemies[bossIdx].bossPhase || 1;
            
            // Phase 2: 50% health - TRANSFORMATION WITH EFFECTS
            if (bossHealthPercent <= 0.5 && currentPhase < 2) {
              newState.enemies[bossIdx] = {
                ...newState.enemies[bossIdx],
                bossPhase: 2,
                width: newState.enemies[bossIdx].width * 1.15,
                height: newState.enemies[bossIdx].height * 1.15,
                damage: newState.enemies[bossIdx].damage * 1.3,
                speed: newState.enemies[bossIdx].speed * 1.3,
              };
              // DRAMATIC TRANSFORMATION EFFECTS
              newState.screenShake = 3; // Intense shake
              newState.redFlash = 2.5; // Bright flash
              newState.magicFlash = 1.5; // Additional flash
              newState.bossTransformFlash = 2; // White flash for transformation
              newState.bossTaunt = "PHASE 2! I GROW STRONGER!";
              // Explosion particles at boss
              const bossX = newState.enemies[bossIdx].x;
              const bossY = newState.enemies[bossIdx].y;
              newState.particles = [
                ...newState.particles,
                ...createParticles(bossX, bossY + 50, 40, 'explosion', '#ff0000'),
                ...createParticles(bossX, bossY + 50, 30, 'spark', '#ffff00'),
                ...createParticles(bossX, bossY + 50, 20, 'magic', '#ff00ff'),
              ];
              showSpeechBubble("💀 BOSS EVOLVED! PHASE 2! 💀", 'urgent');
            }
            
            // Phase 3: 25% health - MAXIMUM TRANSFORMATION EFFECTS
            if (bossHealthPercent <= 0.25 && currentPhase < 3) {
              newState.enemies[bossIdx] = {
                ...newState.enemies[bossIdx],
                bossPhase: 3,
                width: newState.enemies[bossIdx].width * 1.25,
                height: newState.enemies[bossIdx].height * 1.25,
                damage: newState.enemies[bossIdx].damage * 1.5,
                speed: newState.enemies[bossIdx].speed * 1.5,
              };
              // MAXIMUM DRAMATIC EFFECTS FOR FINAL PHASE
              newState.screenShake = 4; // Maximum shake
              newState.redFlash = 3; // Intense red flash
              newState.magicFlash = 2; // Purple flash
              newState.bossTransformFlash = 3; // Intense white flash
              newState.bossTaunt = "FINAL PHASE! PREPARE TO DIE!!!";
              // MASSIVE explosion particles at boss
              const bossX = newState.enemies[bossIdx].x;
              const bossY = newState.enemies[bossIdx].y;
              newState.particles = [
                ...newState.particles,
                ...createParticles(bossX, bossY + 50, 60, 'explosion', '#ff0000'),
                ...createParticles(bossX, bossY + 50, 50, 'spark', '#ff4400'),
                ...createParticles(bossX, bossY + 50, 40, 'magic', '#ff00ff'),
                ...createParticles(bossX, bossY + 50, 30, 'spark', '#ffffff'),
              ];
              showSpeechBubble("☠️ BOSS RAGE MODE! PHASE 3! ☠️", 'urgent');
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
            velocityY: g.velocityY - 600 * delta, // Gravity pulls down (negative = up on screen)
            timer: g.timer - delta,
          }))
          .filter(g => g.timer > 0);
        
        // Check for EMP grenade explosions
        prev.empGrenades.forEach(grenade => {
          if (grenade.timer <= delta) {
            // EXPLODE! Kill ALL FLYING ENEMIES and JET ROBOTS on screen
            const flyingEnemiesKilled = newState.enemies.filter(e => 
              (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer' || e.type === 'jetrobot' || e.isFlying || e.empOnly) && 
              !e.isDying && !e.isSpawning &&
              e.x > prev.cameraX - 100 && e.x < prev.cameraX + 700
            );
            
            flyingEnemiesKilled.forEach(enemy => {
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  isDying: true,
                  deathTimer: 0.5,
                };
                const scoreMap: Record<string, number> = { drone: 75, bomber: 120, flyer: 80, jetrobot: 150 };
                newState.score += scoreMap[enemy.type] || 75;
                newState.particles = [...newState.particles, ...createParticles(
                  enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                  30, 'spark', '#00ffff'
                )];
              }
            });
            
            // Big EMP explosion effect at grenade position - MASSIVE visual
            newState.particles = [
              ...newState.particles,
              ...createParticles(grenade.x, grenade.y, 50, 'spark', '#00ffff'),
              ...createParticles(grenade.x, grenade.y, 40, 'explosion', '#ffff00'),
              ...createParticles(grenade.x, grenade.y, 25, 'magic', '#00ff88'),
            ];
            newState.screenShake = 1.0;
            newState.magicFlash = 0.8;
            
            if (flyingEnemiesKilled.length > 0) {
              const types = flyingEnemiesKilled.map(e => e.type);
              const hasJetRobot = types.includes('jetrobot');
              const hasBomber = types.includes('bomber');
              const hasDrone = types.includes('drone');
              const msg = hasJetRobot 
                ? `⚡ JET ROBOTS FRIED! ${flyingEnemiesKilled.length} DOWN! ⚡`
                : hasBomber && hasDrone 
                  ? `⚡ EMP! ${flyingEnemiesKilled.length} FLYERS DOWN! ⚡`
                  : hasBomber 
                    ? `⚡ BOMBERS FRIED! ${flyingEnemiesKilled.length} DOWN! ⚡`
                    : `⚡ BOOM! ${flyingEnemiesKilled.length} DRONES FRIED! ⚡`;
              showSpeechBubble(msg, 'excited');
            } else {
              showSpeechBubble("⚡ EMP BLAST! SKY CLEAR! ⚡", 'funny');
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
        
        // Bomb-player collision - ARMOR BLOCKS BOMBS!
        (prev.bombs || []).forEach(bomb => {
          const bombScreenX = bomb.x - prev.cameraX;
          const heroScreenX = 60; // Hero's fixed screen position
          
          // Check if bomb hit ground near player (raised ground at 160)
          if (bomb.y <= 180 && 
              Math.abs(bombScreenX - heroScreenX) < 80 &&
              bomb.timer > 0
          ) {
            if (newState.player.shield > 0) {
              // ARMOR BLOCKS THE BOMB!
              newState.player.shield = Math.max(0, newState.player.shield - bomb.damage * 0.7);
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
              newState.player.health -= bomb.damage;
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
            // Remove the bomb
            newState.bombs = newState.bombs.filter(b => b.id !== bomb.id);
          }
          
          // Bomb hits ground (explodes harmlessly if not near player)
          if (bomb.y <= 160) {
            newState.particles = [
              ...newState.particles, 
              ...createParticles(bomb.x, 165, 15, 'explosion', '#ff8800'),
            ];
            newState.bombs = newState.bombs.filter(b => b.id !== bomb.id);
          }
        });
        
        // Update NEON BEAMS from jet robots - damage over time
        newState.neonBeams = (prev.neonBeams || [])
          .map(beam => ({
            ...beam,
            life: beam.life - delta,
            damageTimer: beam.damageTimer - delta,
            // Track player position for beam targeting
            targetX: prev.player.x + PLAYER_WIDTH / 2,
            targetY: prev.player.y + PLAYER_HEIGHT / 2,
          }))
          .filter(beam => beam.life > 0);
        
        // Neon beam-player collision - DAMAGE OVER TIME
        (prev.neonBeams || []).forEach(beam => {
          // Check if beam line intersects player hitbox
          const playerCenterX = prev.player.x + PLAYER_WIDTH / 2;
          const playerCenterY = prev.player.y + PLAYER_HEIGHT / 2;
          
          // Calculate distance from player to beam line
          const dx = beam.targetX - beam.x;
          const dy = beam.targetY - beam.y;
          const beamLength = Math.sqrt(dx * dx + dy * dy);
          
          // Point-to-line distance check (simplified - check if player is near the beam)
          const distToBeamStart = Math.sqrt(
            Math.pow(playerCenterX - beam.x, 2) + Math.pow(playerCenterY - beam.y, 2)
          );
          const distToBeamEnd = Math.sqrt(
            Math.pow(playerCenterX - beam.targetX, 2) + Math.pow(playerCenterY - beam.targetY, 2)
          );
          
          // If player is within beam path (within ~40px of beam line)
          const isInBeamPath = distToBeamStart < beamLength + 40 && distToBeamEnd < 60;
          
          if (isInBeamPath && beam.damageTimer <= 0) {
            const beamDamage = 3; // Damage per tick
            
            if (newState.player.shield > 0) {
              // Shield absorbs beam damage
              newState.player.shield = Math.max(0, newState.player.shield - beamDamage);
              newState.shieldBlockFlash = 0.3;
              newState.particles = [
                ...newState.particles,
                ...createParticles(playerCenterX, playerCenterY, 5, 'spark', '#00ffff'),
              ];
            } else {
              // Take health damage
              newState.player.health -= beamDamage;
              newState.damageFlash = 0.2;
              newState.particles = [
                ...newState.particles,
                ...createParticles(playerCenterX, playerCenterY, 4, 'spark', '#ff00ff'),
              ];
            }
            
            // Reset damage timer for this beam (0.2s between damage ticks)
            const beamIdx = newState.neonBeams.findIndex(b => b.id === beam.id);
            if (beamIdx !== -1) {
              newState.neonBeams[beamIdx] = {
                ...newState.neonBeams[beamIdx],
                damageTimer: 0.2,
              };
            }
          }
        });
        
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
        newState.supportUnits = (prev.supportUnits || [])
          .map(unit => {
            let newUnit = { 
              ...unit, 
              timer: unit.timer - delta,
              attackCooldown: Math.max(0, unit.attackCooldown - delta),
            };
            
            // Handle landing animation
            if (unit.isLanding && unit.landingTimer !== undefined) {
              newUnit.landingTimer = (unit.landingTimer || 1) - delta;
              if (newUnit.landingTimer <= 0) {
                newUnit.isLanding = false;
              }
            }
            
            // Follow hero - stay slightly behind
            // Follow hero - stay IN FRONT of hero (between hero and enemies)
            const targetX = prev.player.x + (unit.type === 'mech' ? 80 : 140);
            newUnit.x = unit.x + (targetX - unit.x) * 0.08;
            newUnit.y = GROUND_Y; // Stay on ground
            
            // Attack nearby enemies
            if (newUnit.attackCooldown <= 0 && !unit.isLanding) {
              const nearestEnemy = newState.enemies.find(e => 
                !e.isDying && !e.isSpawning && 
                e.x > unit.x && e.x < unit.x + 400 &&
                e.type !== 'boss' // Don't target boss
              );
              
              if (nearestEnemy) {
                newUnit.attackCooldown = unit.type === 'mech' ? 1.5 : 0.8; // Mech slower but bombs, walker faster lasers
                
                // Create projectile
                const projType = unit.type === 'mech' ? 'ultra' : 'mega'; // Mech shoots bombs (ultra), walker shoots lasers (mega)
                const proj: Projectile = {
                  id: `support-proj-${Date.now()}-${Math.random()}`,
                  x: unit.x + unit.width,
                  y: unit.y + unit.height * 0.5,
                  velocityX: unit.type === 'mech' ? 400 : 600,
                  velocityY: unit.type === 'mech' ? 80 : 0, // Mech bombs arc slightly
                  damage: unit.type === 'mech' ? 80 : 40,
                  type: projType,
                };
                newState.supportProjectiles = [...(newState.supportProjectiles || []), proj];
                
                // Muzzle flash
                newState.particles = [
                  ...newState.particles,
                  ...createParticles(unit.x + unit.width, unit.y + unit.height * 0.5, 8, 'muzzle', unit.type === 'mech' ? '#ff8800' : '#00ff88'),
                ];
              }
            }
            
            return newUnit;
          })
          .filter(unit => unit.timer > 0);
        
        // Update support projectiles
        newState.supportProjectiles = (prev.supportProjectiles || [])
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + (p.velocityY || 0) * delta,
          }))
          .filter(p => p.x < prev.cameraX + 1000);
        
        // Support projectile-enemy collision
        (newState.supportProjectiles || []).forEach(proj => {
          newState.enemies.forEach((enemy, idx) => {
            if (enemy.isDying || enemy.isSpawning) return;
            
            if (
              proj.x > enemy.x - 10 && proj.x < enemy.x + enemy.width + 10 &&
              proj.y > enemy.y - 10 && proj.y < enemy.y + enemy.height + 10
            ) {
              newState.enemies[idx] = {
                ...newState.enemies[idx],
                health: newState.enemies[idx].health - proj.damage,
              };
              newState.particles = [...newState.particles, ...createParticles(proj.x, proj.y, 10, 'impact', '#00ff88')];
              newState.supportProjectiles = (newState.supportProjectiles || []).filter(p => p.id !== proj.id);
              
              if (newState.enemies[idx].health <= 0) {
                newState.enemies[idx].isDying = true;
                newState.enemies[idx].deathTimer = 0.4;
                const scoreMap: Record<string, number> = { tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70, sentinel: 250, giant: 400, bomber: 120 };
                newState.score += scoreMap[enemy.type] || 60;
                newState.combo++;
                newState.killStreak++;
              }
            }
          });
        });
        
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
        
        // Enemy laser-player collision - ARMOR TAKES DAMAGE FIRST with impact FX
        newState.enemyLasers.forEach(laser => {
          const laserWidth = 20;
          const laserHeight = 15;
          if (
            laser.x < prev.player.x + PLAYER_WIDTH + 5 &&
            laser.x + laserWidth > prev.player.x - 5 &&
            laser.y < prev.player.y + PLAYER_HEIGHT + 10 &&
            laser.y + laserHeight > prev.player.y - 10
          ) {
            // ARMOR ABSORBS DAMAGE FIRST!
            if (newState.player.shield > 0) {
              // Armor absorbs the hit completely
              const damageToArmor = laser.damage;
              newState.player.shield = Math.max(0, newState.player.shield - damageToArmor);
              
              // ARMOR IMPACT FX!
              newState.shieldBlockFlash = 1;
              newState.screenShake = 0.25;
              
              // Spark burst at impact point
              newState.particles = [
                ...newState.particles, 
                ...createParticles(laser.x, laser.y, 20, 'spark', '#00ffff'),
                ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 10, 'spark', '#00ffff'),
              ];
              
              // Hero taunts when blocking!
              if (Math.random() > 0.7) {
                const taunt = ENEMY_TAUNTS[Math.floor(Math.random() * ENEMY_TAUNTS.length)];
                showSpeechBubble(taunt, 'excited');
              }
            } else {
              // NO ARMOR - Take health damage
              newState.player.health -= laser.damage;
              newState.player.animationState = 'hurt';
              newState.damageFlash = 1;
              newState.screenShake = 0.3;
              
              // Vibrate on damage
              if (navigator.vibrate) {
                navigator.vibrate(100);
              }
              
              // Ask for gifts when hurt!
              if (Math.random() > 0.6) {
                const request = GIFT_REQUESTS[Math.floor(Math.random() * GIFT_REQUESTS.length)];
                showSpeechBubble(request, 'help');
              }
            }
            newState.enemyLasers = newState.enemyLasers.filter(l => l.id !== laser.id);
            newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 8, 'spark', '#ff0000')];
          }
        });
        
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
                
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  health: newState.enemies[enemyIdx].health - proj.damage,
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
                  
                  const scoreMap: Record<string, number> = { boss: 2500, tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70 };
                  newState.score += scoreMap[enemy.type] || 60;
                  newState.combo++;
                  newState.comboTimer = 2;
                  newState.killStreak++;
                  
                  newState.particles = [...newState.particles, ...createParticles(
                    enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                    enemy.type === 'boss' ? 40 : 20, 'death', '#ff4400'
                  )];
                  
                  newState.screenShake = enemy.type === 'boss' ? 1.5 : 0.25;
                  
                  // BOSS KILLED - Open the portal!
                  if (enemy.type === 'boss') {
                    newState.portalOpen = true;
                    newState.portalX = enemy.x + enemy.width / 2; // Portal spawns where boss died
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
        
        // Update dying and spawning enemies
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
            return e;
          })
          .filter(e => !e.isDying || e.deathTimer > 0);
        
        // ENEMIES HIT ONCE THEN JUMP BACK - No auto-kill, enemies attack then retreat
        const ENEMY_ATTACK_RANGE = 70;
        const attackCooldownDecrement = delta;
        
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying || enemy.type === 'boss' || enemy.isSpawning) return enemy;
          
          const distToHero = Math.abs(enemy.x - prev.player.x);
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'flyer' || enemy.type === 'bomber' || enemy.type === 'jetrobot';
          
          // PRIORITY TARGETING: Attack support units first!
          // Find the closest alive support unit in front of the enemy
          let targetSupport: SupportUnit | null = null;
          let closestSupportDist = Infinity;
          
          for (const unit of newState.supportUnits) {
            if (unit.health <= 0) continue;
            const distToUnit = Math.abs(enemy.x - unit.x);
            if (distToUnit < closestSupportDist && distToUnit < ENEMY_ATTACK_RANGE * 1.5) {
              closestSupportDist = distToUnit;
              targetSupport = unit;
            }
          }
          
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
              attackCooldown: 1.5 + Math.random() * 0.5, // Cooldown before attacking again
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
            
            if (tooClose) {
              // Move away slightly to maintain distance
              return { 
                ...enemy, 
                x: enemy.x + 30 * delta,
                animationPhase: (enemy.animationPhase + delta * 4) % (Math.PI * 2),
              };
            } else if (tooFar) {
              // Move closer to stay in attack range
              return { 
                ...enemy, 
                x: enemy.x - 20 * delta,
                animationPhase: (enemy.animationPhase + delta * 4) % (Math.PI * 2),
              };
            }
            // At ideal distance - stay put and animate
            return { ...enemy, animationPhase: (enemy.animationPhase + delta * 4) % (Math.PI * 2) };
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

          // IMPORTANT: Keep ground enemies anchored to baseY.
          // Jump is represented as a temporary offset (does not accumulate into enemy.y).
          const jumpOffset = (shouldDodgeJump || randomJump) ? (35 + Math.random() * 50) : 0;
          const nextY = isFlying ? currentY : (baseY - jumpOffset);

          // BACK AND FORTH MOVEMENT - enemies move erratically
          const movementPattern = Math.sin(newAnimPhase * 3) * 0.5 + 0.5; // 0-1 oscillation
          const moveBackward = Math.random() > 0.92; // Sometimes retreat
          const moveMultiplier = moveBackward ? -0.6 : (1 + movementPattern * 0.5); // Fast forward, sometimes back

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

          // DRONE VERTICAL FLYING PATTERN - fly up and down the screen
          if (enemy.type === 'drone' || enemy.type === 'flyer') {
            // Vertical movement - drones fly UP and DOWN the screen
            const verticalSpeed = 2.5;
            const maxHeight = 180; // Maximum height above floor
            const minHeight = 40;  // Minimum height above floor
            
            // Calculate new Y position using sine wave for smooth up/down
            const verticalPos = Math.sin(newAnimPhase * verticalSpeed);
            const targetY = GROUND_Y + minHeight + ((verticalPos + 1) / 2) * (maxHeight - minHeight);
            
            // RETREAT BEHAVIOR - zoom back HALFWAY, then attack again!
            const RETREAT_DISTANCE = 100; // Distance at which flying enemies retreat
            const RETREAT_SPEED = 400; // How fast they zoom back
            
            if (enemy.isRetreating) {
              // Calculate halfway point between current position and original
              const origX = enemy.originalX ?? enemy.x + 200;
              const origY = enemy.originalY ?? targetY;
              const halfwayX = prev.player.x + (origX - prev.player.x) * 0.5; // Halfway back
              const halfwayY = (enemy.y + origY) / 2;
              
              const dxToHalfway = halfwayX - enemy.x;
              const dyToHalfway = halfwayY - enemy.y;
              const distToHalfway = Math.sqrt(dxToHalfway * dxToHalfway + dyToHalfway * dyToHalfway);
              
              if (distToHalfway < 40) {
                // Reached halfway position, stop retreating and prepare to attack again
                return { 
                  ...enemy, 
                  x: halfwayX, 
                  y: halfwayY, 
                  isRetreating: false,
                  animationPhase: newAnimPhase,
                  attackCooldown: 0.8, // Short cooldown before attacking again
                };
              }
              
              // Move toward halfway position quickly
              const moveX = (dxToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              const moveY = (dyToHalfway / distToHalfway) * RETREAT_SPEED * delta;
              
              return {
                ...enemy,
                x: enemy.x + moveX,
                y: enemy.y + moveY,
                animationPhase: newAnimPhase,
              };
            }
            
            // Check if close to hero and ready to attack - ATTACK FIRST then retreat!
            if (distToHero < RETREAT_DISTANCE && distToHero > 0 && enemy.attackCooldown <= 0) {
              // Fire attack before retreating!
              const enemyLaser: Projectile = {
                id: `elaser-${Date.now()}-${Math.random()}`,
                x: enemy.x - 8,
                y: targetY + enemy.height / 2,
                velocityX: -550,
                velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - targetY - enemy.height / 2) * 0.6,
                damage: 8,
                type: 'normal',
              };
              newState.enemyLasers = [...newState.enemyLasers, enemyLaser];
              
              // Attack particles
              newState.particles = [
                ...newState.particles,
                ...createParticles(enemy.x - 8, targetY + enemy.height / 2, 8, 'muzzle', '#00ffff'),
              ];
              
              // Now retreat!
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                attackCooldown: 1.0, // Cooldown for next attack
                originalX: enemy.originalX ?? enemy.x + 150, // Store original position if not set
                originalY: enemy.originalY ?? targetY,
              };
            }
            
            // Smooth horizontal approach toward player
            const horizontalMove = direction * enemy.speed * delta * 0.25;
            
            // Continue vertical flying movement
            return {
              ...enemy,
              y: targetY,
              x: enemy.x + horizontalMove,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
            };
          }
          
          // BOMBER - Flying enemy that drops bombs!
          if (enemy.type === 'bomber') {
            const verticalSpeed = 1.5; // Slower vertical movement than drones
            const maxHeight = 200;
            const minHeight = 100;
            
            // Calculate Y position - bombers fly higher
            const verticalPos = Math.sin(newAnimPhase * verticalSpeed);
            const targetY = GROUND_Y + minHeight + ((verticalPos + 1) / 2) * (maxHeight - minHeight);
            
            // RETREAT BEHAVIOR - zoom back HALFWAY then attack again!
            const RETREAT_DISTANCE = 130;
            const RETREAT_SPEED = 350;
            
            if (enemy.isRetreating) {
              const origX = enemy.originalX ?? enemy.x + 250;
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
                  bombCooldown: 0.8,
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
            
            // Horizontal movement - bombers fly across the screen
            const horizontalMove = direction * enemy.speed * delta * 0.3;
            
            // Attack first when close, then retreat!
            const bombCooldown = (enemy.bombCooldown || 0) - delta;
            const isCloseToHero = distToHero < RETREAT_DISTANCE && distToHero > 0;
            
            if (isCloseToHero && bombCooldown <= 0 && isOnScreen) {
              // Drop a bomb then retreat!
              const newBomb: Bomb = {
                id: `bomb-${Date.now()}-${Math.random()}`,
                x: enemy.x + enemy.width / 2,
                y: targetY,
                velocityY: -150,
                damage: enemy.damage,
                timer: 5,
              };
              newState.bombs = [...(newState.bombs || []), newBomb];
              
              newState.particles = [
                ...newState.particles,
                ...createParticles(enemy.x + enemy.width / 2, targetY - 10, 8, 'spark', '#ff8800'),
              ];
              
              // Now retreat halfway!
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                bombCooldown: 2.0,
                originalX: enemy.originalX ?? enemy.x + 180,
                originalY: enemy.originalY ?? targetY,
              };
            }
            
            // Continue flying
            return {
              ...enemy,
              y: targetY,
              x: enemy.x + horizontalMove,
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
            
            // Attack with neon beam when close, then retreat!
            const beamCooldown = (enemy.attackCooldown || 0) - delta;
            const isCloseToHero = distToHero < RETREAT_DISTANCE && distToHero > 0;
            
            if (isCloseToHero && beamCooldown <= 0 && isOnScreen) {
              // Fire neon beam then retreat!
              const newBeam: NeonBeam = {
                id: `neonbeam-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: targetY + enemy.height / 2,
                targetX: prev.player.x + PLAYER_WIDTH / 2,
                targetY: prev.player.y + PLAYER_HEIGHT / 2,
                life: 1.5,
                damageTimer: 0,
              };
              newState.neonBeams = [...newState.neonBeams, newBeam];
              
              newState.particles = [
                ...newState.particles,
                ...createParticles(enemy.x, targetY + enemy.height / 2, 12, 'spark', '#00ffff'),
              ];
              
              // Now retreat halfway!
              return {
                ...enemy,
                y: targetY,
                isRetreating: true,
                animationPhase: newAnimPhase,
                attackCooldown: 1.5,
                originalX: enemy.originalX ?? enemy.x + 150,
                originalY: enemy.originalY ?? targetY,
              };
            }
            
            return {
              ...enemy,
              y: targetY,
              x: enemy.x + horizontalMove,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, beamCooldown),
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
            // Sentinel fires POWERFUL laser with screen flash effect!
            const sentinelLaser: Projectile = {
              id: `sentinel-laser-${Date.now()}-${Math.random()}`,
              x: enemy.x - 10,
              y: currentY + enemy.height * 0.4,
              velocityX: -600,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - currentY - enemy.height * 0.4) * 0.3,
              damage: 18,
              type: 'ultra',
            };
            newState.enemyLasers = [...newState.enemyLasers, sentinelLaser];
            
            // SCREEN FLASH when sentinel fires!
            newState.redFlash = 0.4;
            newState.screenShake = 0.35;
            
            // Hot pink laser muzzle flash particles
            newState.particles = [
              ...newState.particles, 
              ...createParticles(enemy.x - 5, currentY + enemy.height * 0.4, 15, 'laser', '#ff0066'),
              ...createParticles(enemy.x - 5, currentY + enemy.height * 0.4, 10, 'muzzle', '#ff00ff'),
            ];
            
            return { 
              ...enemy, 
              y: currentY, 
              attackCooldown: 1.8, // Slower attack but more powerful
              animationPhase: newAnimPhase,
              isSlashing: false,
            };
          }

          // ROCKET/RANGED ATTACK - when further from hero
          if (canRangedAttack && enemy.attackCooldown <= 0 && Math.random() > 0.6 && enemy.type !== 'sentinel') {
            // Different projectile based on enemy type
            const isHeavy = enemy.type === 'mech' || enemy.type === 'tank';
            const rocketSpeed = isHeavy ? -380 : -450;
            const rocketDamage = isHeavy ? 14 : 9;
            
            const rocket: Projectile = {
              id: `rocket-${Date.now()}-${Math.random()}`,
              x: enemy.x - 10,
              y: currentY + enemy.height / 2,
              velocityX: rocketSpeed,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - currentY - enemy.height / 2) * 0.5,
              damage: rocketDamage,
              type: isHeavy ? 'mega' : 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, rocket];
            
            // Rocket launch particles
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
            const speedBoost = 1.3; // Faster movement
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta * moveMultiplier * speedBoost,
              y: nextY,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
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
        
        // Flying robots - reduced spawn rate
        newState.flyingRobots = prev.flyingRobots
          .map(robot => ({ ...robot, x: robot.x + robot.speed * delta }))
          .filter(robot => robot.x - prev.cameraX < 800)
          .slice(0, 3);
        
        if (Math.random() > 0.998) {
          const robotTypes: FlyingRobot['type'][] = ['ufo', 'jet', 'satellite'];
          newState.flyingRobots = [...newState.flyingRobots, {
            id: `flybot-${Date.now()}`,
            x: prev.cameraX - 60,
            y: 15 + Math.random() * 50,
            speed: 80 + Math.random() * 80,
            type: robotTypes[Math.floor(Math.random() * robotTypes.length)],
          }];
        }
        
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
        
        // Combo timer
        if (prev.comboTimer > 0) {
          newState.comboTimer = prev.comboTimer - delta;
          if (newState.comboTimer <= 0) newState.combo = 0;
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

  return {
    gameState,
    giftEvents,
    leaderboard,
    notifications,
    startGame,
    startNextWave,
    handleGift,
  };
};
