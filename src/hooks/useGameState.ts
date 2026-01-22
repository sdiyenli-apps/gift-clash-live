import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken, GiftBlock, TIKTOK_GIFTS,
  ENEMY_TAUNTS, GIFT_REQUESTS, getBossName, Bomb, SupportUnit
} from '@/types/game';

// ============= PERFORMANCE CONSTANTS =============
const GRAVITY = 0;
const GROUND_Y = 160;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;
const BASE_LEVEL_LENGTH = 12000;
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;
const KILL_RADIUS = 70;
const ENEMY_MIN_DISTANCE = 100;
const ENEMY_COLLISION_DISTANCE = 60;
const SLASH_ATTACK_RANGE = 80;
const ROCKET_ATTACK_RANGE = 350;
const BOSS_FIREBALL_INTERVAL = 4;
const BOSS_MEGA_ATTACK_THRESHOLD = 0.25;
const BOSS_KEEP_DISTANCE = 400;
const HERO_FIXED_SCREEN_X = 28;
const ENEMY_ATTACK_DELAY = 2;
const PARTICLE_LIFETIME = 3;

// ============= PERFORMANCE LIMITS (Mobile Optimized) =============
const MAX_PARTICLES = 20;
const MAX_PROJECTILES = 15;
const MAX_ENEMY_LASERS = 12;
const MAX_SUPPORT_PROJECTILES = 8;
const MAX_ENEMIES_ON_SCREEN = 15;
const MAX_FIREBALLS = 8;
const MAX_BOMBS = 6;
const MAX_NEON_LASERS = 4;
const GIFT_QUEUE_MAX = 5;
const GIFT_PROCESS_INTERVAL = 100; // ms between gift processing

// ============= OBJECT POOLS =============
const particlePool: Particle[] = [];
const projectilePool: Projectile[] = [];

const getPooledParticle = (): Partial<Particle> => {
  return particlePool.pop() || {};
};

const returnToPool = (particle: Particle) => {
  if (particlePool.length < 50) {
    particlePool.push(particle);
  }
};

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

const BOSS_TAUNTS_TO_HERO = [
  "HAHAHAHA! PATHETIC SQUIRREL!",
  "YOU CANNOT DEFEAT ME!",
  "IS THAT ALL YOU'VE GOT?!",
  "TREMBLE BEFORE MY POWER!",
  "I WILL CRUSH YOU!",
];

const BOSS_TAUNTS_TO_PLAYERS = [
  "CHAT CAN'T SAVE YOU NOW! 😈",
  "YOUR GIFTS ARE WORTHLESS! 💀",
  "VIEWERS, WATCH YOUR HERO FALL!",
  "NO AMOUNT OF ROSES WILL HELP! 🌹❌",
  "CHAT IS TOO WEAK! HAHAHA!",
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

interface EMPGrenade {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  timer: number;
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
  allyCooldown: number;
  allyCharges: number;
  gameStartTime: number;
  particleResetTimer: number;
  // Performance tracking
  frameSkipCounter: number;
  giftQueue: { action: GiftAction; username: string }[];
  lastGiftProcessTime: number;
  performanceMode: 'normal' | 'reduced' | 'minimal';
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
  portalOpen: false,
  portalX: 0,
  heroEnteringPortal: false,
  bossTransformFlash: 0,
  supportUnits: [],
  supportProjectiles: [],
  empCooldown: 0,
  empCharges: 2,
  allyCooldown: 0,
  allyCharges: 2,
  gameStartTime: Date.now(),
  particleResetTimer: PARTICLE_LIFETIME,
  frameSkipCounter: 0,
  giftQueue: [],
  lastGiftProcessTime: 0,
  performanceMode: 'normal',
};

// Enemy spawn rates - balanced distribution
const ENEMY_TYPES = ['robot', 'drone', 'mech', 'ninja', 'tank', 'giant', 'bomber', 'sentinel'] as const;

// ============= OPTIMIZED LEVEL GENERATION (Streets of Rage Style) =============
const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number, gameStartTime: number } => {
  const gameStartTime = Date.now();
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.3, wave - 1), 50000);
  
  // ============= STREETS OF RAGE SPACING =============
  // Ground enemies spread horizontally with clear lanes
  // Flying enemies hover above, not blocking ground
  const GROUND_LANE_Y = GROUND_Y; // All ground enemies at same Y
  const MIN_HORIZONTAL_SPACING = 120; // Minimum gap between enemies
  const WAVE_SPACING = 300; // Gap between enemy waves/formations
  
  let currentX = 400;
  let formationIndex = 0;
  
  while (currentX < levelLength - 800) {
    const waveBonus = Math.min(wave * 0.15, 3);
    
    // Determine formation type
    const formationType = formationIndex % 4;
    let enemiesInFormation: { type: string; offsetX: number; isFlying: boolean }[] = [];
    
    switch (formationType) {
      case 0: // Single enemy
        enemiesInFormation = [{ type: 'robot', offsetX: 0, isFlying: false }];
        break;
      case 1: // Horizontal line of 3 (Streets of Rage style)
        enemiesInFormation = [
          { type: 'robot', offsetX: 0, isFlying: false },
          { type: 'mech', offsetX: MIN_HORIZONTAL_SPACING, isFlying: false },
          { type: 'robot', offsetX: MIN_HORIZONTAL_SPACING * 2, isFlying: false },
        ];
        break;
      case 2: // Mixed ground + 1 drone above
        enemiesInFormation = [
          { type: 'tank', offsetX: 0, isFlying: false },
          { type: 'robot', offsetX: MIN_HORIZONTAL_SPACING, isFlying: false },
          { type: 'drone', offsetX: MIN_HORIZONTAL_SPACING * 0.5, isFlying: true },
        ];
        break;
      case 3: // Heavy formation
        enemiesInFormation = [
          { type: 'sentinel', offsetX: 0, isFlying: false },
          { type: 'mech', offsetX: MIN_HORIZONTAL_SPACING * 1.5, isFlying: false },
        ];
        break;
    }
    
    // Random variation in formation
    if (Math.random() > 0.7) {
      const extraTypes = ['ninja', 'giant', 'bomber'];
      const extraType = extraTypes[Math.floor(Math.random() * extraTypes.length)];
      const isFlying = extraType === 'bomber';
      enemiesInFormation.push({ 
        type: extraType, 
        offsetX: (enemiesInFormation.length) * MIN_HORIZONTAL_SPACING, 
        isFlying 
      });
    }
    
    // Create enemies from formation
    for (const entry of enemiesInFormation) {
      const baseType = entry.type as Enemy['type'];
      let baseWidth: number, baseHeight: number, baseHealth: number, baseSpeed: number, baseDamage: number;
      
      switch (baseType) {
        case 'robot':
          baseWidth = 50; baseHeight = 58; baseHealth = 45 * (1 + waveBonus); baseSpeed = 55 + wave * 2.5; baseDamage = 9 + wave;
          break;
        case 'mech':
          baseWidth = 55; baseHeight = 60; baseHealth = 90 * (1 + waveBonus); baseSpeed = 32 + wave * 2.5; baseDamage = 16 + wave;
          break;
        case 'tank':
          baseWidth = 70; baseHeight = 65; baseHealth = 180 * (1 + waveBonus); baseSpeed = 18 + wave * 1.5; baseDamage = 22 + wave;
          break;
        case 'sentinel':
          baseWidth = 75; baseHeight = 80; baseHealth = 220 * (1 + waveBonus); baseSpeed = 35 + wave * 1.5; baseDamage = 25 + wave;
          break;
        case 'ninja':
          baseWidth = 45; baseHeight = 52; baseHealth = 35 * (1 + waveBonus * 0.6); baseSpeed = 150 + wave * 8; baseDamage = 12 + wave;
          break;
        case 'giant':
          baseWidth = 90; baseHeight = 100; baseHealth = 300 * (1 + waveBonus); baseSpeed = 25 + wave; baseDamage = 30 + wave * 2;
          break;
        case 'drone':
          baseWidth = 50; baseHeight = 50; baseHealth = 32 * (1 + waveBonus * 0.5); baseSpeed = 90 + wave * 3; baseDamage = 7 + Math.floor(wave / 2);
          break;
        case 'bomber':
          baseWidth = 55; baseHeight = 50; baseHealth = 50 * (1 + waveBonus * 0.6); baseSpeed = 60 + wave * 2; baseDamage = 15 + wave;
          break;
        default:
          baseWidth = 50; baseHeight = 58; baseHealth = 45; baseSpeed = 55; baseDamage = 9;
      }
      
      const sizeMultiplier = 0.9 + Math.random() * 0.2;
      const spawnX = currentX + entry.offsetX;
      
      enemies.push({
        id: `enemy-${spawnX}-${Math.random().toString(36).substr(2, 5)}`,
        x: spawnX,
        y: entry.isFlying ? GROUND_Y + 60 + Math.random() * 80 : GROUND_LANE_Y, // Ground units ALWAYS at GROUND_Y
        width: Math.floor(baseWidth * sizeMultiplier),
        height: Math.floor(baseHeight * sizeMultiplier),
        health: baseHealth,
        maxHealth: baseHealth,
        speed: baseSpeed,
        damage: baseDamage,
        type: baseType,
        isDying: false,
        deathTimer: 0,
        attackCooldown: 0,
        animationPhase: Math.random() * Math.PI * 2,
        isSpawning: true,
        spawnTimer: 0.6,
        isFlying: entry.isFlying,
        flyHeight: entry.isFlying ? 60 + Math.random() * 80 : 0,
        bombCooldown: baseType === 'bomber' ? 2 + Math.random() * 2 : undefined,
        droneVariant: Math.floor(Math.random() * 5),
      });
    }
    
    // Move to next formation with proper spacing
    const formationWidth = enemiesInFormation.length * MIN_HORIZONTAL_SPACING;
    currentX += formationWidth + WAVE_SPACING + Math.random() * 100;
    formationIndex++;
  }
  
  // Jet robots spawn at intervals (max 4 per level for performance)
  const jetRobotCount = Math.min(4, Math.floor(wave / 3) + 1);
  for (let i = 0; i < jetRobotCount; i++) {
    const jetX = 500 + (i / jetRobotCount) * (levelLength - 1000);
    enemies.push({
      id: `jetrobot-${jetX}-${Math.random().toString(36).substr(2, 5)}`,
      x: jetX,
      y: GROUND_Y + 120 + Math.random() * 60,
      width: 55,
      height: 50,
      health: 80 * (1 + wave * 0.1),
      maxHealth: 80 * (1 + wave * 0.1),
      speed: 70 + wave * 2,
      damage: 12 + wave,
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
    });
  }

  // Boss at end
  const isFinalBoss = wave === 1000;
  const isMegaBoss = wave % 100 === 0;
  const isMiniBoss = wave % 10 === 0;
  
  const baseBossSize = 180;
  const sizeMultiplier = isFinalBoss ? 4 : (1 + wave * 0.005);
  const bossSize = Math.min(baseBossSize * sizeMultiplier, isFinalBoss ? 500 : 320);
  
  const bossBaseHealth = isFinalBoss 
    ? 50000 
    : (1800 + wave * 250) * (isMegaBoss ? 2 : isMiniBoss ? 1.5 : 1);
  
  enemies.push({
    id: 'boss-monster',
    x: levelLength - 500,
    y: GROUND_Y - (bossSize * 0.4),
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
    bossPhase: 1,
  });
  
  // Sparse obstacles
  for (let x = 500; x < levelLength - 1000; x += 400 + Math.random() * 300) {
    if (Math.random() > 0.6) {
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
  const giftQueueRef = useRef<{ action: GiftAction; username: string }[]>([]);
  const lastGiftProcessRef = useRef<number>(0);

  // ============= OPTIMIZED PARTICLE CREATION =============
  const createParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string): Particle[] => {
    const particles: Particle[] = [];
    const colors = ['#ff00ff', '#00ffff', '#ffff00'];
    
    // Drastically reduced particle counts for performance
    const actualCount = Math.min(count, 3);
    
    for (let i = 0; i < actualCount; i++) {
      particles.push({
        id: `p-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: (Math.random() - 0.8) * 200,
        color: color || colors[i % colors.length],
        size: 3 + Math.random() * 3,
        life: 0.1 + Math.random() * 0.15,
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
    }, 2000);
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
    });
    setGiftEvents([]);
    lastUpdateRef.current = Date.now();
    giftQueueRef.current = [];
    showSpeechBubble(`WAVE ${wave}! GO! 🔥`, 'excited');
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
        enemyLasers: [],
        chickens: [],
        magicFlash: 0,
        bossTaunt: null,
        bossTauntTimer: 0,
        portalOpen: false,
        portalX: 0,
        heroEnteringPortal: false,
        gameStartTime,
        particleResetTimer: PARTICLE_LIFETIME,
        supportUnits: [],
        supportProjectiles: [],
        neonLasers: [],
        bombs: [],
        empGrenades: [],
      }));
      giftQueueRef.current = [];
      showSpeechBubble(`WAVE ${nextWave}! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Attack chickens (simplified)
  const createAttackChickens = (playerX: number, enemies: Enemy[]): Chicken[] => {
    const newChickens: Chicken[] = [];
    const visibleEnemies = enemies.filter(e => !e.isDying && !e.isSpawning && e.type !== 'boss');
    
    // Reduced chicken count for performance
    for (let i = 0; i < 4; i++) {
      const targetEnemy = visibleEnemies[i % Math.max(1, visibleEnemies.length)];
      newChickens.push({
        id: `chicken-${Date.now()}-${i}`,
        x: playerX + PLAYER_WIDTH / 2,
        y: GROUND_Y + 30,
        state: 'attacking',
        timer: 3,
        direction: 1,
        targetEnemyId: targetEnemy?.id,
        velocityX: 300 + Math.random() * 150,
        velocityY: 100 + Math.random() * 100,
      });
    }
    return newChickens;
  };

  // Dangerous enemies (optimized)
  const createDangerousEnemies = (playerX: number, count: number, existingEnemies: Enemy[]): Enemy[] => {
    const newEnemies: Enemy[] = [];
    const SPAWN_SPACING = 100;
    
    for (let i = 0; i < Math.min(count, 2); i++) { // Max 2 for performance
      const type = Math.random() > 0.5 ? 'tank' : 'mech';
      const spawnX = playerX + 250 + i * SPAWN_SPACING;
      
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
        spawnTimer: 0.6,
      });
    }
    return newEnemies;
  };

  // Support units (optimized)
  const createSupportUnits = (playerX: number, playerY: number, playerMaxHealth: number, playerShield: number, existingCount: number): SupportUnit[] => {
    const supportUnits: SupportUnit[] = [];
    const halfMaxHealth = Math.floor(playerMaxHealth / 2);
    const halfShield = Math.floor(playerShield / 2);
    const staggerOffset = existingCount * 80;
    
    supportUnits.push({
      id: `support-mech-${Date.now()}`,
      x: playerX + 60 + staggerOffset,
      y: playerY,
      width: 130,
      height: 140,
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'mech',
      timer: 15,
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 0.8,
    });
    
    supportUnits.push({
      id: `support-walker-${Date.now()}`,
      x: playerX + 200 + staggerOffset,
      y: playerY,
      width: 75,
      height: 85,
      health: halfMaxHealth,
      maxHealth: halfMaxHealth,
      shield: halfShield,
      maxShield: halfShield,
      type: 'walker',
      timer: 15,
      attackCooldown: 0,
      isLanding: true,
      landingTimer: 1.0,
    });
    
    return supportUnits;
  };

  // ============= QUEUED GIFT PROCESSING =============
  const queueGift = useCallback((action: GiftAction, username: string) => {
    if (giftQueueRef.current.length < GIFT_QUEUE_MAX) {
      giftQueueRef.current.push({ action, username });
    }
  }, []);

  // Process gift actions (throttled)
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          const moveDistance = 80;
          newState.player = {
            ...prev.player,
            x: prev.player.x + moveDistance,
            animationState: 'run',
          };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 2), ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 3, 'dash', '#00ffff')];
          newState.score += 15;
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 200);
          break;
          
        case 'shoot':
          const heroWorldX = prev.cameraX + 60 + 45;
          const armorY = prev.player.y + PLAYER_HEIGHT * 0.5;
          const bullet: Projectile = {
            id: `proj-${Date.now()}`,
            x: heroWorldX,
            y: armorY,
            velocityX: 800,
            velocityY: -8,
            damage: prev.player.isMagicDashing ? 150 : 60,
            type: prev.player.isMagicDashing ? 'ultra' : 'mega',
          };
          newState.projectiles = [...prev.projectiles.slice(-MAX_PROJECTILES + 1), bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 2), ...createParticles(heroWorldX, armorY, 3, 'muzzle', '#00ffff')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 100);
          newState.score += 20;
          
          // Allies also attack
          const activeAllyUnits = prev.supportUnits.filter(u => !u.isLanding && !u.isSelfDestructing && u.health > 0);
          activeAllyUnits.forEach((unit, idx) => {
            const nearestEnemy = newState.enemies.find(e => 
              !e.isDying && !e.isSpawning && e.x > unit.x - 50 && e.x < unit.x + 400
            );
            
            if (nearestEnemy && (newState.supportProjectiles?.length || 0) < MAX_SUPPORT_PROJECTILES) {
              const startX = unit.x + unit.width + 5;
              const startY = GROUND_Y + 40;
              const targetX = nearestEnemy.x + nearestEnemy.width / 2;
              const targetY = (nearestEnemy.y || GROUND_Y) + nearestEnemy.height / 2;
              const dx = targetX - startX;
              const dy = targetY - startY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist > 0) {
                const proj: Projectile = {
                  id: `ally-${unit.id}-${Date.now()}-${idx}`,
                  x: startX,
                  y: startY,
                  velocityX: (dx / dist) * 1000,
                  velocityY: (dy / dist) * 1000,
                  damage: unit.type === 'mech' ? 25 : 18,
                  type: unit.type === 'mech' ? 'ultra' : 'mega',
                  isAllyProjectile: true,
                };
                newState.supportProjectiles = [...(newState.supportProjectiles || []).slice(-MAX_SUPPORT_PROJECTILES + 1), proj];
              }
            }
          });
          break;
          
        case 'armor':
          newState.player = {
            ...prev.player,
            shield: Math.min(150, prev.player.shield + 60),
          };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 2), ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 3, 'magic', '#00ffff')];
          newState.score += 50;
          newState.screenShake = 0.1;
          showSpeechBubble(`+60 SHIELD! 🛡️`, 'excited');
          break;
          
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + 40),
          };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 2), ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 3, 'magic', '#00ff00')];
          newState.score += 40;
          showSpeechBubble(`HEALED! 💚`, 'normal');
          break;
          
        case 'magic_dash':
          newState.player = {
            ...prev.player,
            isMagicDashing: true,
            magicDashTimer: 6,
          };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 4), ...createParticles(prev.player.x, prev.player.y, 4, 'ultra', '#ff00ff')];
          newState.score += 300;
          newState.screenShake = 0.6;
          newState.magicFlash = 1.0;
          newState.chickens = [...prev.chickens.slice(-4), ...createAttackChickens(prev.player.x, prev.enemies)];
          
          // Reduced neon lasers
          const newNeonLasers: NeonLaser[] = [];
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            newNeonLasers.push({
              id: `neon-${Date.now()}-${i}`,
              x: prev.player.x + PLAYER_WIDTH / 2,
              y: prev.player.y + PLAYER_HEIGHT / 2,
              velocityX: Math.cos(angle) * 400,
              velocityY: Math.sin(angle) * 400,
              bounces: 2,
              life: 2,
            });
          }
          newState.neonLasers = [...prev.neonLasers.slice(-MAX_NEON_LASERS), ...newNeonLasers];
          showSpeechBubble("NEON FURY! 🦁", 'excited');
          break;

        case 'spawn_enemies':
          newState.enemies = [...prev.enemies, ...createDangerousEnemies(prev.player.x, 2, prev.enemies)];
          newState.screenShake = 0.3;
          showSpeechBubble("⚠️ DANGER! ⚠️", 'urgent');
          break;

        case 'emp_grenade':
          if (prev.empCharges <= 0) {
            showSpeechBubble("⚡ RELOADING... ⚡", 'normal');
            break;
          }
          
          const grenade: EMPGrenade = {
            id: `emp-${Date.now()}`,
            x: prev.player.x + PLAYER_WIDTH / 2,
            y: prev.player.y + PLAYER_HEIGHT + 30,
            velocityX: 180,
            velocityY: 650,
            timer: 1.5,
          };
          newState.empGrenades = [...prev.empGrenades.slice(-2), grenade];
          newState.empCharges = prev.empCharges - 1;
          newState.empCooldown = 10;
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 2), ...createParticles(grenade.x, grenade.y, 3, 'spark', '#00ffff')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 100);
          showSpeechBubble("⚡ EMP OUT! ⚡", 'excited');
          break;
          
        case 'summon_support':
          if (prev.allyCharges <= 0) {
            showSpeechBubble("🤖 ALLIES RELOADING... 🤖", 'normal');
            break;
          }
          
          const existingAllyCount = prev.supportUnits.length;
          newState.supportUnits = [
            ...prev.supportUnits.slice(-2),
            ...createSupportUnits(prev.player.x, prev.player.y, prev.player.maxHealth, prev.player.shield, existingAllyCount)
          ];
          newState.allyCharges = prev.allyCharges - 1;
          newState.allyCooldown = 15;
          newState.particles = [...prev.particles.slice(-MAX_PARTICLES + 4), ...createParticles(prev.player.x + 80, GROUND_Y + 50, 4, 'magic', '#00ff88')];
          newState.screenShake = 0.4;
          showSpeechBubble("🤖 ALLIES INCOMING! 🤖", 'excited');
          break;
      }
      
      return newState;
    });
  }, [createParticles, showSpeechBubble]);

  // ============= OPTIMIZED GAME LOOP =============
  const updateGame = useCallback(() => {
    const now = Date.now();
    const delta = Math.min((now - lastUpdateRef.current) / 1000, 0.05); // Cap delta
    lastUpdateRef.current = now;

    // Process queued gifts (throttled)
    if (giftQueueRef.current.length > 0 && now - lastGiftProcessRef.current > GIFT_PROCESS_INTERVAL) {
      const gift = giftQueueRef.current.shift();
      if (gift) {
        processGiftAction(gift.action, gift.username);
        lastGiftProcessRef.current = now;
      }
    }

    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev };
      
      // ============= PERFORMANCE MODE DETECTION =============
      const entityCount = prev.enemies.length + prev.projectiles.length + prev.particles.length + (prev.supportUnits?.length || 0);
      const performanceMode = entityCount > 60 ? 'minimal' : entityCount > 40 ? 'reduced' : 'normal';
      newState.performanceMode = performanceMode;
      
      // Skip particle updates in minimal mode
      const skipParticles = performanceMode === 'minimal';
      
      // ============= COOLDOWNS =============
      if (prev.empCooldown > 0) {
        newState.empCooldown = Math.max(0, prev.empCooldown - delta);
        if (newState.empCooldown <= 0 && prev.empCharges < 2) {
          newState.empCharges = Math.min(2, prev.empCharges + 1);
        }
      }
      if (prev.allyCooldown > 0) {
        newState.allyCooldown = Math.max(0, prev.allyCooldown - delta);
        if (newState.allyCooldown <= 0 && prev.allyCharges < 2) {
          newState.allyCharges = Math.min(2, prev.allyCharges + 1);
        }
      }
      
      // ============= PARTICLE MANAGEMENT =============
      newState.particleResetTimer = prev.particleResetTimer - delta;
      if (newState.particleResetTimer <= 0) {
        newState.particles = [];
        newState.particleResetTimer = PARTICLE_LIFETIME;
      } else if (!skipParticles) {
        newState.particles = prev.particles
          .map(p => ({ ...p, x: p.x + p.velocityX * delta, y: p.y + p.velocityY * delta, life: p.life - delta }))
          .filter(p => p.life > 0)
          .slice(-MAX_PARTICLES);
      }
      
      // ============= FLASH DECAY =============
      if (prev.redFlash > 0) newState.redFlash = Math.max(0, prev.redFlash - delta * 3);
      if (prev.magicFlash > 0) newState.magicFlash = Math.max(0, prev.magicFlash - delta * 3);
      if (prev.damageFlash > 0) newState.damageFlash = Math.max(0, prev.damageFlash - delta * 3);
      if (prev.shieldBlockFlash > 0) newState.shieldBlockFlash = Math.max(0, prev.shieldBlockFlash - delta * 3);
      if (prev.bossTransformFlash > 0) newState.bossTransformFlash = Math.max(0, prev.bossTransformFlash - delta * 2);
      if (prev.screenShake > 0) newState.screenShake = Math.max(0, prev.screenShake - delta * 4);
      
      // ============= COMBO DECAY =============
      if (prev.comboTimer > 0) {
        newState.comboTimer = prev.comboTimer - delta;
        if (newState.comboTimer <= 0) {
          newState.combo = 0;
          newState.killStreak = 0;
        }
      }
      
      // ============= MAGIC DASH =============
      if (prev.player.isMagicDashing) {
        newState.player = {
          ...prev.player,
          magicDashTimer: prev.player.magicDashTimer - delta,
          x: prev.player.x + 150 * delta,
          isMagicDashing: prev.player.magicDashTimer > delta,
          animationState: 'dash',
        };
        
        // Auto-fire during magic dash (reduced rate)
        if (Math.random() < 0.15 && newState.projectiles.length < MAX_PROJECTILES) {
          const magicBullet: Projectile = {
            id: `magic-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            x: prev.cameraX + 80,
            y: prev.player.y + PLAYER_HEIGHT * 0.5,
            velocityX: 900,
            velocityY: (Math.random() - 0.5) * 100,
            damage: 80,
            type: 'ultra',
          };
          newState.projectiles = [...newState.projectiles.slice(-MAX_PROJECTILES + 1), magicBullet];
        }
      }
      
      // ============= AUTO-MOVEMENT =============
      const moveSpeed = 35;
      if (!prev.player.isMagicDashing) {
        newState.player = {
          ...newState.player,
          x: prev.player.x + moveSpeed * delta * prev.player.speedMultiplier,
          animationState: 'run',
        };
      }
      
      // ============= BOSS DETECTION =============
      const bossEnemy = prev.enemies.find(e => e.type === 'boss' && !e.isDying);
      const bossIdx = bossEnemy ? prev.enemies.findIndex(e => e.id === bossEnemy.id) : -1;
      
      if (bossEnemy && !prev.isBossFight) {
        const distToBoss = bossEnemy.x - prev.player.x;
        if (distToBoss < 600) {
          newState.isBossFight = true;
          newState.bossTaunt = BOSS_TAUNTS_TO_HERO[0];
          showSpeechBubble("👹 BOSS INCOMING! 👹", 'urgent');
        }
      }
      
      // ============= BOSS ATTACKS (SIMPLIFIED) =============
      if (bossEnemy && prev.isBossFight && bossIdx !== -1) {
        const bossPhase = bossEnemy.bossPhase || 1;
        const bossHealthPercent = bossEnemy.health / bossEnemy.maxHealth;
        const timeSinceStart = (Date.now() - prev.gameStartTime) / 1000;
        
        // Boss shield timer
        if (bossEnemy.bossShieldTimer && bossEnemy.bossShieldTimer > 0) {
          newState.enemies[bossIdx] = {
            ...newState.enemies[bossIdx],
            bossShieldTimer: bossEnemy.bossShieldTimer - delta,
          };
        }
        
        // Boss attacks (simplified)
        newState.bossAttackCooldown = Math.max(0, prev.bossAttackCooldown - delta);
        
        if (newState.bossAttackCooldown <= 0 && timeSinceStart > ENEMY_ATTACK_DELAY) {
          const attackRoll = Math.random();
          let attackType: BossAttackType;
          
          if (attackRoll < 0.4) attackType = 'fireball';
          else if (attackRoll < 0.6) attackType = 'laser_sweep';
          else if (attackRoll < 0.8) attackType = 'ground_pound';
          else attackType = 'missile_barrage';
          
          newState.lastBossAttack = attackType;
          
          if (attackType === 'fireball' && newState.fireballs.length < MAX_FIREBALLS) {
            const fireballCount = Math.min(2 + bossPhase, 4);
            for (let i = 0; i < fireballCount; i++) {
              newState.fireballs = [...newState.fireballs, {
                id: `fireball-${Date.now()}-${i}`,
                x: bossEnemy.x,
                y: bossEnemy.y + bossEnemy.height / 2 + (i - 1) * 20,
                velocityX: -(350 + bossPhase * 50),
                velocityY: (Math.random() - 0.5) * 100,
                damage: 10 + bossPhase * 3,
              }];
            }
            newState.enemies[bossIdx] = { ...newState.enemies[bossIdx], attackCooldown: 1.5 };
            newState.bossTaunt = "FIRE!";
          }
          
          newState.bossAttackCooldown = 2.5 - (bossPhase * 0.3);
        }
        
        // Boss phase transitions
        const currentPhase = newState.enemies[bossIdx]?.bossPhase || 1;
        if (bossHealthPercent <= 0.5 && currentPhase < 2) {
          newState.enemies[bossIdx] = {
            ...newState.enemies[bossIdx],
            bossPhase: 2,
            damage: newState.enemies[bossIdx].damage * 1.3,
            speed: newState.enemies[bossIdx].speed * 1.2,
          };
          newState.screenShake = 1.5;
          newState.bossTransformFlash = 1.5;
          showSpeechBubble("💀 BOSS PHASE 2! 💀", 'urgent');
        }
        if (bossHealthPercent <= 0.25 && currentPhase < 3) {
          newState.enemies[bossIdx] = {
            ...newState.enemies[bossIdx],
            bossPhase: 3,
            damage: newState.enemies[bossIdx].damage * 1.5,
            speed: newState.enemies[bossIdx].speed * 1.3,
          };
          newState.screenShake = 2;
          newState.bossTransformFlash = 2;
          showSpeechBubble("☠️ BOSS PHASE 3! ☠️", 'urgent');
        }
      }
      
      // ============= FIREBALLS =============
      newState.fireballs = prev.fireballs
        .map(f => ({ ...f, x: f.x + f.velocityX * delta, y: f.y + f.velocityY * delta }))
        .filter(f => f.x > prev.cameraX - 100)
        .slice(-MAX_FIREBALLS);
      
      // Fireball collision
      newState.fireballs.forEach(fireball => {
        if (
          fireball.x < prev.player.x + PLAYER_WIDTH &&
          fireball.x + 30 > prev.player.x &&
          fireball.y < prev.player.y + PLAYER_HEIGHT &&
          fireball.y + 30 > prev.player.y
        ) {
          if (newState.player.shield > 0) {
            newState.player.shield = Math.max(0, newState.player.shield - fireball.damage);
            newState.shieldBlockFlash = 0.8;
          } else {
            newState.player.health -= fireball.damage;
            newState.damageFlash = 0.8;
          }
          newState.fireballs = newState.fireballs.filter(f => f.id !== fireball.id);
          newState.screenShake = 0.3;
        }
      });
      
      // ============= EMP GRENADES =============
      newState.empGrenades = prev.empGrenades
        .map(g => ({
          ...g,
          x: g.x + g.velocityX * delta,
          y: g.y + g.velocityY * delta,
          velocityY: g.velocityY - 400 * delta,
          timer: g.timer - delta,
        }))
        .filter(g => g.timer > 0);
      
      // EMP explosion
      prev.empGrenades.forEach(grenade => {
        if (grenade.timer <= delta) {
          const flyingKilled = newState.enemies.filter(e => 
            (e.type === 'drone' || e.type === 'bomber' || e.type === 'flyer' || e.type === 'jetrobot' || e.isFlying || e.empOnly) && 
            !e.isDying && !e.isSpawning &&
            e.x > prev.cameraX - 100 && e.x < prev.cameraX + 700
          );
          
          flyingKilled.forEach(enemy => {
            const idx = newState.enemies.findIndex(e => e.id === enemy.id);
            if (idx !== -1) {
              newState.enemies[idx] = { ...newState.enemies[idx], isDying: true, deathTimer: 0.4 };
              newState.score += 75;
            }
          });
          
          newState.screenShake = 0.8;
          newState.magicFlash = 0.6;
          if (flyingKilled.length > 0) {
            showSpeechBubble(`⚡ ${flyingKilled.length} FRIED! ⚡`, 'excited');
          }
        }
      });
      
      // ============= BOMBS =============
      newState.bombs = (prev.bombs || [])
        .map(b => ({ ...b, y: b.y - 180 * delta, timer: b.timer - delta }))
        .filter(b => b.y > 0 && b.timer > 0)
        .slice(-MAX_BOMBS);
      
      // Bomb collision
      (prev.bombs || []).forEach(bomb => {
        if (bomb.y <= 180 && bomb.timer > 0) {
          const bombScreenX = bomb.x - prev.cameraX;
          const heroScreenX = 60;
          const heroDistToBomb = Math.abs(bombScreenX - heroScreenX);
          
          if (heroDistToBomb < 100) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - bomb.damage);
              newState.shieldBlockFlash = 1;
            } else {
              newState.player.health -= bomb.damage * 0.7;
              newState.damageFlash = 1;
            }
            newState.screenShake = 0.5;
          }
          
          newState.bombs = newState.bombs.filter(b => b.id !== bomb.id);
        }
      });
      
      // ============= SUPPORT UNITS =============
      newState.supportUnits = prev.supportUnits
        .map(unit => {
          let newUnit = { ...unit };
          
          // Landing
          if (unit.isLanding && (unit.landingTimer || 0) > 0) {
            newUnit.landingTimer = (unit.landingTimer || 0) - delta;
            if (newUnit.landingTimer <= 0) {
              newUnit.isLanding = false;
            }
            return newUnit;
          }
          
          // Timer countdown
          newUnit.timer = unit.timer - delta;
          newUnit.attackCooldown = Math.max(0, unit.attackCooldown - delta);
          
          // Self-destruct when timer runs out
          if (unit.timer <= 3 && !unit.isSelfDestructing && unit.health > 0) {
            const nearestEnemy = newState.enemies.find(e => 
              !e.isDying && e.x > unit.x - 50 && e.x < unit.x + 300
            );
            if (nearestEnemy) {
              newUnit.isSelfDestructing = true;
              newUnit.selfDestructTimer = 0.8;
              newUnit.targetEnemyId = nearestEnemy.id;
            }
          }
          
          // Self-destruct movement
          if (unit.isSelfDestructing && unit.selfDestructTimer && unit.selfDestructTimer > 0) {
            newUnit.selfDestructTimer = unit.selfDestructTimer - delta;
            const targetEnemy = newState.enemies.find(e => e.id === unit.targetEnemyId);
            
            if (targetEnemy) {
              const dx = targetEnemy.x - unit.x;
              const dist = Math.abs(dx);
              
              if (dist < 50 || newUnit.selfDestructTimer <= 0) {
                // Explode!
                const dmgRadius = 120;
                newState.enemies = newState.enemies.map(e => {
                  const eDist = Math.abs(e.x - unit.x);
                  if (eDist < dmgRadius && !e.isDying && e.type !== 'boss') {
                    const damage = 100 * (1 - eDist / dmgRadius);
                    if (e.health - damage <= 0) {
                      newState.score += 100;
                      return { ...e, health: 0, isDying: true, deathTimer: 0.4 };
                    }
                    return { ...e, health: e.health - damage };
                  }
                  return e;
                });
                newState.screenShake = 0.5;
                return { ...newUnit, timer: -1 };
              }
              
              newUnit.x = unit.x + Math.sign(dx) * 500 * delta;
              newUnit.y = unit.y + 200 * delta;
            }
          }
          
          // Follow hero
          if (!unit.isSelfDestructing) {
            const baseOffset = unit.type === 'mech' ? 60 : 170;
            const targetX = prev.player.x + baseOffset;
            newUnit.x = unit.x + (targetX - unit.x) * 0.08;
          }
          
          // Attack
          if (newUnit.attackCooldown <= 0 && !unit.isLanding && !unit.isSelfDestructing && (newState.supportProjectiles?.length || 0) < MAX_SUPPORT_PROJECTILES) {
            const nearestEnemy = newState.enemies.find(e => 
              !e.isDying && !e.isSpawning && e.x > unit.x - 50 && e.x < unit.x + 400
            );
            
            if (nearestEnemy) {
              newUnit.attackCooldown = unit.type === 'mech' ? 0.5 : 0.35;
              const startX = unit.x + unit.width + 5;
              const startY = GROUND_Y + 35;
              const enemyY = nearestEnemy.isFlying ? (nearestEnemy.y || GROUND_Y) : GROUND_Y;
              const targetX = nearestEnemy.x + nearestEnemy.width / 2;
              const targetY = enemyY + nearestEnemy.height / 2;
              const dx = targetX - startX;
              const dy = targetY - startY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist > 0) {
                const proj: Projectile = {
                  id: `ally-${unit.id}-${Date.now()}`,
                  x: startX,
                  y: startY,
                  velocityX: (dx / dist) * 900,
                  velocityY: (dy / dist) * 900,
                  damage: 15,
                  type: unit.type === 'mech' ? 'ultra' : 'mega',
                  isAllyProjectile: true,
                };
                newState.supportProjectiles = [...(newState.supportProjectiles || []).slice(-MAX_SUPPORT_PROJECTILES + 1), proj];
              }
            }
          }
          
          return newUnit;
        })
        .filter(unit => unit.timer > 0);
      
      // ============= SUPPORT PROJECTILES =============
      newState.supportProjectiles = (prev.supportProjectiles || [])
        .slice(-MAX_SUPPORT_PROJECTILES)
        .map(p => ({ ...p, x: p.x + p.velocityX * delta, y: p.y + (p.velocityY || 0) * delta }))
        .filter(p => p.x < prev.cameraX + 800 && p.x > prev.cameraX - 50);
      
      // Support projectile collision
      const hitSupportProjs = new Set<string>();
      (newState.supportProjectiles || []).forEach(proj => {
        if (hitSupportProjs.has(proj.id)) return;
        
        for (const enemy of newState.enemies) {
          if (enemy.isDying || enemy.isSpawning || hitSupportProjs.has(proj.id)) continue;
          
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber';
          const enemyY = isFlying ? (enemy.y || GROUND_Y) : GROUND_Y;
          const dx = proj.x - (enemy.x + enemy.width / 2);
          const dy = proj.y - (enemyY + enemy.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 60) {
            hitSupportProjs.add(proj.id);
            
            const damage = enemy.bossShieldTimer && enemy.bossShieldTimer > 0 ? proj.damage * 0.3 : proj.damage;
            const idx = newState.enemies.findIndex(e => e.id === enemy.id);
            if (idx !== -1) {
              const newHealth = newState.enemies[idx].health - damage;
              if (newHealth <= 0 && !newState.enemies[idx].isDying) {
                newState.score += 60;
                newState.combo++;
                if (enemy.type === 'boss') {
                  newState.portalOpen = true;
                  newState.portalX = enemy.x + enemy.width / 2;
                }
                newState.enemies[idx] = { ...newState.enemies[idx], health: 0, isDying: true, deathTimer: 0.4 };
              } else {
                newState.enemies[idx] = { ...newState.enemies[idx], health: newHealth };
              }
            }
            break;
          }
        }
      });
      newState.supportProjectiles = (newState.supportProjectiles || []).filter(p => !hitSupportProjs.has(p.id));
      
      // ============= NEON LASERS =============
      const ARENA_TOP = 50;
      const ARENA_BOTTOM = 250;
      newState.neonLasers = prev.neonLasers
        .map(laser => {
          let newLaser = {
            ...laser,
            x: laser.x + laser.velocityX * delta,
            y: laser.y + laser.velocityY * delta,
            life: laser.life - delta,
          };
          if ((newLaser.y < ARENA_TOP || newLaser.y > ARENA_BOTTOM) && newLaser.bounces > 0) {
            newLaser.velocityY = -newLaser.velocityY * 0.9;
            newLaser.bounces--;
          }
          return newLaser;
        })
        .filter(laser => laser.life > 0)
        .slice(-MAX_NEON_LASERS);
      
      // Neon laser damage
      newState.neonLasers.forEach(laser => {
        newState.enemies.forEach((enemy, idx) => {
          if (enemy.isDying || enemy.type === 'boss') return;
          if (laser.x > enemy.x - 10 && laser.x < enemy.x + enemy.width + 10 &&
              laser.y > enemy.y - 10 && laser.y < enemy.y + enemy.height + 10) {
            newState.enemies[idx] = { ...newState.enemies[idx], health: newState.enemies[idx].health - 25 };
            if (newState.enemies[idx].health <= 0) {
              newState.enemies[idx] = { ...newState.enemies[idx], isDying: true, deathTimer: 0.4 };
              newState.score += 50;
            }
          }
        });
      });
      
      // ============= CAMERA =============
      const targetCameraX = Math.max(0, newState.player.x - HERO_FIXED_SCREEN_X);
      newState.cameraX = prev.cameraX + (targetCameraX - prev.cameraX) * 0.12;
      newState.distance = newState.player.x;
      
      // ============= PROJECTILES =============
      newState.projectiles = prev.projectiles
        .map(p => ({ ...p, x: p.x + p.velocityX * delta, y: p.y + p.velocityY * delta }))
        .filter(p => p.x < prev.cameraX + 1000)
        .slice(-MAX_PROJECTILES);
      
      // ============= ENEMY LASERS =============
      newState.enemyLasers = prev.enemyLasers
        .map(p => ({ ...p, x: p.x + p.velocityX * delta, y: p.y + p.velocityY * delta }))
        .filter(p => p.x > prev.cameraX - 50)
        .slice(-MAX_ENEMY_LASERS);
      
      // Enemy laser collision (simplified)
      const lasersToRemove = new Set<string>();
      newState.enemyLasers.forEach(laser => {
        if (lasersToRemove.has(laser.id)) return;
        
        // Check support unit intercept first
        for (const unit of newState.supportUnits) {
          if (unit.isSelfDestructing || unit.isLanding || unit.health <= 0) continue;
          const dx = laser.x - (unit.x + unit.width / 2);
          const dy = laser.y - (unit.y + unit.height / 2);
          if (Math.sqrt(dx * dx + dy * dy) < 60) {
            unit.shield > 0 ? unit.shield -= laser.damage * 0.7 : unit.health -= laser.damage * 0.7;
            lasersToRemove.add(laser.id);
            return;
          }
        }
        
        // Check player
        if (laser.x < newState.player.x + PLAYER_WIDTH + 5 && laser.x + 20 > newState.player.x - 5 &&
            laser.y < newState.player.y + PLAYER_HEIGHT + 10 && laser.y + 15 > newState.player.y - 10) {
          if (newState.player.shield > 0) {
            newState.player.shield = Math.max(0, newState.player.shield - laser.damage);
            newState.shieldBlockFlash = 0.8;
          } else {
            newState.player.health -= laser.damage;
            newState.damageFlash = 0.8;
          }
          lasersToRemove.add(laser.id);
        }
      });
      newState.enemyLasers = newState.enemyLasers.filter(l => !lasersToRemove.has(l.id));
      
      // ============= PROJECTILE-ENEMY COLLISION =============
      const hitProjectileIds = new Set<string>();
      newState.projectiles.forEach(proj => {
        newState.enemies.forEach(enemy => {
          if (hitProjectileIds.has(proj.id) || enemy.isDying || enemy.isSpawning) return;
          
          // Skip flying enemies for regular projectiles (need EMP)
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber' || enemy.type === 'jetrobot';
          if (isFlying && enemy.type !== 'boss') return;
          
          const enemyY = GROUND_Y;
          if (proj.x > enemy.x - 15 && proj.x < enemy.x + enemy.width + 15 &&
              proj.y > enemyY - 20 && proj.y < enemyY + enemy.height + 30) {
            hitProjectileIds.add(proj.id);
            
            const damage = enemy.bossShieldTimer && enemy.bossShieldTimer > 0 ? proj.damage * 0.2 : proj.damage;
            const idx = newState.enemies.findIndex(e => e.id === enemy.id);
            if (idx !== -1) {
              const newHealth = newState.enemies[idx].health - damage;
              if (newHealth <= 0 && !newState.enemies[idx].isDying) {
                const scoreMap: Record<string, number> = { boss: 2500, tank: 300, mech: 180, sentinel: 250, giant: 400, robot: 60 };
                newState.score += scoreMap[enemy.type] || 60;
                newState.combo++;
                newState.killStreak++;
                newState.comboTimer = 3;
                
                if (enemy.type === 'boss') {
                  newState.portalOpen = true;
                  newState.portalX = enemy.x + enemy.width / 2;
                  showSpeechBubble("💥 BOSS DOWN! 💥", 'excited');
                }
                
                newState.enemies[idx] = { ...newState.enemies[idx], health: 0, isDying: true, deathTimer: 0.4 };
              } else {
                newState.enemies[idx] = { ...newState.enemies[idx], health: newHealth };
              }
              newState.screenShake = Math.max(newState.screenShake, enemy.type === 'boss' ? 0.3 : 0.1);
            }
          }
        });
      });
      newState.projectiles = newState.projectiles.filter(p => !hitProjectileIds.has(p.id));
      
      // ============= PORTAL DETECTION =============
      if (prev.portalOpen && prev.portalX > 0) {
        const portalDist = Math.abs(prev.player.x - prev.portalX);
        if (portalDist < 80 && !prev.heroEnteringPortal) {
          newState.heroEnteringPortal = true;
          setTimeout(() => setGameState(s => ({ ...s, phase: 'victory' })), 1000);
        }
      }
      
      // ============= ENEMY UPDATES (OPTIMIZED) =============
      const timeSinceStart = (Date.now() - prev.gameStartTime) / 1000;
      const canAttack = timeSinceStart > ENEMY_ATTACK_DELAY;
      
      newState.enemies = prev.enemies
        .filter(e => !(e.isDying && e.deathTimer <= 0))
        .slice(0, MAX_ENEMIES_ON_SCREEN + 5) // Limit active enemies
        .map((enemy, idx) => {
          if (enemy.isDying) {
            return { ...enemy, deathTimer: enemy.deathTimer - delta };
          }
          
          if (enemy.isSpawning && (enemy.spawnTimer || 0) > 0) {
            return { ...enemy, spawnTimer: (enemy.spawnTimer || 0) - delta, isSpawning: (enemy.spawnTimer || 0) - delta > 0 };
          }
          
          // Jet robot drop
          if (enemy.isDropping && (enemy.dropTimer || 0) > 0) {
            return { ...enemy, dropTimer: (enemy.dropTimer || 0) - delta, isDropping: (enemy.dropTimer || 0) - delta > 0 };
          }
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          const distToHero = Math.abs(dx);
          const isOnScreen = enemy.x > prev.cameraX - 100 && enemy.x < prev.cameraX + 700;
          
          // Boss behavior
          if (enemy.type === 'boss') {
            let newX = enemy.x;
            if (distToHero > BOSS_KEEP_DISTANCE) {
              newX = enemy.x + direction * enemy.speed * delta * 0.5;
            } else if (distToHero < BOSS_KEEP_DISTANCE - 100) {
              newX = enemy.x - direction * enemy.speed * delta * 0.3;
            }
            return { ...enemy, x: newX, attackCooldown: Math.max(0, enemy.attackCooldown - delta) };
          }
          
          // Flying enemies (drone, bomber, jetrobot)
          const isFlying = enemy.isFlying || enemy.type === 'drone' || enemy.type === 'bomber' || enemy.type === 'jetrobot';
          
          if (isFlying) {
            const verticalPos = Math.sin((enemy.animationPhase || 0) + delta * 2);
            const targetY = GROUND_Y + (enemy.flyHeight || 80) + verticalPos * 30;
            
            // Attack behavior
            if (canAttack && enemy.attackCooldown <= 0 && distToHero < 400 && isOnScreen && newState.enemyLasers.length < MAX_ENEMY_LASERS) {
              if (enemy.type === 'bomber' && enemy.bombCooldown && enemy.bombCooldown <= 0) {
                // Drop bomb
                if ((newState.bombs || []).length < MAX_BOMBS) {
                  newState.bombs = [...(newState.bombs || []), {
                    id: `bomb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y,
                    velocityY: -180,
                    damage: enemy.damage,
                    timer: 5,
                  }];
                }
                return { ...enemy, y: targetY, x: enemy.x + direction * enemy.speed * delta * 0.2, animationPhase: (enemy.animationPhase || 0) + delta * 2, bombCooldown: 2.5 };
              } else if (enemy.type !== 'bomber') {
                // Fire projectile
                const laser: Projectile = {
                  id: `elaser-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  x: enemy.x,
                  y: targetY + enemy.height / 2,
                  velocityX: -600,
                  velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - targetY) * 0.3,
                  damage: 8,
                  type: 'normal',
                };
                newState.enemyLasers = [...newState.enemyLasers.slice(-MAX_ENEMY_LASERS + 1), laser];
                return { ...enemy, y: targetY, x: enemy.x + direction * enemy.speed * delta * 0.15, animationPhase: (enemy.animationPhase || 0) + delta * 2, attackCooldown: 1.2 };
              }
            }
            
            return {
              ...enemy,
              y: targetY,
              x: enemy.x + direction * enemy.speed * delta * 0.15,
              animationPhase: (enemy.animationPhase || 0) + delta * 2,
              attackCooldown: Math.max(0, (enemy.attackCooldown || 0) - delta),
              bombCooldown: enemy.bombCooldown ? Math.max(0, enemy.bombCooldown - delta) : undefined,
            };
          }
          
          // Ground enemies
          let newX = enemy.x;
          const attackRange = enemy.type === 'sentinel' ? 300 : SLASH_ATTACK_RANGE;
          
          if (distToHero > attackRange + 30) {
            newX = enemy.x + direction * enemy.speed * delta;
          }
          
          // Melee attack
          if (canAttack && distToHero < attackRange && enemy.attackCooldown <= 0 && isOnScreen) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage);
              newState.shieldBlockFlash = 0.8;
            } else {
              newState.player.health -= enemy.damage;
              newState.damageFlash = 0.8;
            }
            newState.screenShake = 0.2;
            return { ...enemy, x: newX, attackCooldown: 1.5, isSlashing: true, animationPhase: (enemy.animationPhase || 0) + delta };
          }
          
          return {
            ...enemy,
            x: newX,
            y: GROUND_Y, // ALWAYS force ground units to GROUND_Y
            attackCooldown: Math.max(0, (enemy.attackCooldown || 0) - delta),
            isSlashing: (enemy.attackCooldown || 0) > 1.2,
            animationPhase: (enemy.animationPhase || 0) + delta,
          };
        });
      
      // ============= CHICKENS (SIMPLIFIED) =============
      newState.chickens = prev.chickens
        .map(c => {
          if (c.state === 'attacking' && c.targetEnemyId) {
            const target = newState.enemies.find(e => e.id === c.targetEnemyId && !e.isDying);
            if (target) {
              const dx = target.x - c.x;
              const dy = (target.y || GROUND_Y) - c.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 40) {
                const idx = newState.enemies.findIndex(e => e.id === target.id);
                if (idx !== -1) {
                  newState.enemies[idx] = { ...newState.enemies[idx], health: newState.enemies[idx].health - 40 };
                  if (newState.enemies[idx].health <= 0) {
                    newState.enemies[idx] = { ...newState.enemies[idx], isDying: true, deathTimer: 0.4 };
                    newState.score += 80;
                  }
                }
                return { ...c, state: 'gone' as const, timer: 0 };
              }
              
              return {
                ...c,
                x: c.x + (dx / dist) * 400 * delta,
                y: c.y + (dy / dist) * 400 * delta,
                timer: c.timer - delta,
              };
            }
          }
          return { ...c, timer: c.timer - delta };
        })
        .filter(c => c.timer > 0 && c.state !== 'gone')
        .slice(-6);
      
      // ============= GAME OVER CHECK =============
      if (newState.player.health <= 0) {
        newState.phase = 'gameover';
      }
      
      // ============= VICTORY CHECK =============
      if (prev.enemies.every(e => e.isDying || e.health <= 0) && prev.enemies.length > 0) {
        if (!prev.portalOpen) {
          newState.portalOpen = true;
          newState.portalX = Math.max(...prev.enemies.map(e => e.x)) + 100;
        }
      }
      
      return newState;
    });
    
    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [createParticles, processGiftAction, showSpeechBubble]);

  // Start game loop
  useEffect(() => {
    if (gameState.phase === 'playing') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.phase, updateGame]);

  // Help request timer
  useEffect(() => {
    if (gameState.phase === 'playing') {
      helpRequestTimerRef.current = setInterval(() => {
        const timeSinceGift = Date.now() - gameState.lastGiftTime;
        if (timeSinceGift > HELP_REQUEST_DELAY) {
          requestHelp();
        }
      }, HELP_REQUEST_DELAY);
    }
    return () => {
      if (helpRequestTimerRef.current) {
        clearInterval(helpRequestTimerRef.current);
      }
    };
  }, [gameState.phase, gameState.lastGiftTime, requestHelp]);

  // ============= GIFT HANDLING =============
  const handleGift = useCallback((event: GiftEvent) => {
    setGiftEvents(prev => [...prev.slice(-10), event]);
    setNotifications(prev => [...prev.slice(-3), event]);
    
    // Queue the gift instead of processing immediately
    queueGift(event.action, event.username);
    
    // Update leaderboard
    setLeaderboard(prev => {
      const existing = prev.find(g => g.username === event.username);
      if (existing) {
        return prev.map(g => g.username === event.username 
          ? { ...g, totalDiamonds: g.totalDiamonds + event.gift.diamonds, giftCount: g.giftCount + 1 }
          : g
        ).sort((a, b) => b.totalDiamonds - a.totalDiamonds);
      }
      return [...prev, { username: event.username, totalDiamonds: event.gift.diamonds, giftCount: 1 }]
        .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
        .slice(0, 10);
    });
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== event.id));
    }, 2000);
  }, [queueGift]);

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
