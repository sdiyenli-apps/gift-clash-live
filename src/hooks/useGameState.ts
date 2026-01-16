import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken, GiftBlock, TIKTOK_GIFTS,
  ENEMY_TAUNTS, GIFT_REQUESTS, getBossName
} from '@/types/game';

const GRAVITY = 0;
const GROUND_Y = 100;
const PLAYER_WIDTH = 32; // Half size
const PLAYER_HEIGHT = 55; // Half size
const BASE_LEVEL_LENGTH = 12000; // Longer levels
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;
const KILL_RADIUS = 60;
const ENEMY_MIN_DISTANCE = 120; // Boss keeps more distance
const BOSS_FIREBALL_INTERVAL = 5;
const BOSS_MEGA_ATTACK_THRESHOLD = 0.3;
const BOSS_KEEP_DISTANCE = 200; // Boss keeps this distance from player

// Boss attack types
type BossAttackType = 'fireball' | 'laser_sweep' | 'missile_barrage' | 'ground_pound' | 'screen_attack';

interface BossAttack {
  id: string;
  type: BossAttackType;
  x: number;
  y: number;
  timer: number;
  data?: any;
}

// Boss taunts and laughs
const BOSS_LAUGHS = [
  "HAHAHAHA! PATHETIC!",
  "YOU CANNOT DEFEAT ME!",
  "IS THAT ALL YOU'VE GOT?!",
  "TREMBLE BEFORE ME!",
  "YOUR GIFTS ARE USELESS!",
  "I WILL CONSUME YOU!",
  "FOOLISH MORTAL!",
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
};

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
};

// More varied enemy types
const ENEMY_TYPES = ['robot', 'drone', 'mech', 'ninja', 'tank', 'flyer', 'brute', 'sniper', 'swarm'] as const;

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.3, wave - 1), 50000);
  // Harder difficulty: more enemies spawn as waves progress
  const baseDensity = 200;
  const densityReduction = Math.min(wave * 8, 120); // Reduces spacing as wave increases
  const enemyDensity = Math.max(80, baseDensity - densityReduction);
  
  // More drones as waves progress
  const droneChance = Math.min(0.35 + wave * 0.02, 0.55); // 35% base, up to 55%
  const ninjaChance = Math.min(0.12 + wave * 0.015, 0.25);
  const tankChance = Math.min(0.05 + wave * 0.01, 0.15);
  
  for (let x = 400; x < levelLength - 800; x += enemyDensity + Math.random() * 80) {
    const typeRoll = Math.random();
    const waveBonus = Math.min(wave * 0.15, 3); // Stronger scaling per wave
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    // Progressive difficulty with more varied enemies
    if (typeRoll < tankChance) {
      enemyType = 'tank';
      width = 70; height = 65; health = 180 * (1 + waveBonus); speed = 18 + wave * 1.5; damage = 22 + wave;
    } else if (typeRoll < tankChance + 0.08) {
      enemyType = 'mech';
      width = 65; height = 70; health = 90 * (1 + waveBonus); speed = 32 + wave * 2.5; damage = 16 + wave;
    } else if (typeRoll < tankChance + 0.08 + ninjaChance) {
      enemyType = 'ninja';
      width = 45; height = 52; health = 35 * (1 + waveBonus * 0.6); speed = 150 + wave * 8; damage = 12 + wave;
    } else if (typeRoll < tankChance + 0.08 + ninjaChance + droneChance) {
      // MORE DRONES - flying enemies that shoot lasers
      enemyType = 'drone';
      width = 42; height = 42; 
      health = 28 * (1 + waveBonus * 0.5); 
      speed = 90 + wave * 3; 
      damage = 7 + Math.floor(wave / 2);
      
      const droneEnemy = {
        id: `enemy-${x}-${Math.random()}`,
        x,
        y: GROUND_Y + 60 + Math.random() * 50, // Flying height
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
    } else if (typeRoll < tankChance + 0.08 + ninjaChance + droneChance + 0.12) {
      enemyType = 'flyer';
      width = 50; height = 46; health = 40 * (1 + waveBonus * 0.5); speed = 75 + wave * 3; damage = 9 + wave;
    } else {
      enemyType = 'robot';
      width = 50; height = 58; health = 45 * (1 + waveBonus); speed = 55 + wave * 2.5; damage = 9 + wave;
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
      enemies.push({
        id: `drone-swarm-${i}-${Math.random()}`,
        x: swarmX,
        y: GROUND_Y + 80 + Math.random() * 60,
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
      });
    }
  }
  
  // BOSS SCALING - gets scarier and bigger each wave!
  // Princess is ONLY at wave 1000 - final destination!
  const isFinalBoss = wave === 1000;
  const isMegaBoss = wave % 100 === 0; // Every 100 waves = mega boss
  const isMiniBoss = wave % 10 === 0; // Every 10 waves = mini boss
  
  // Boss size scales with wave - final boss covers half screen!
  const baseBossSize = 100;
  const sizeMultiplier = isFinalBoss ? 4 : (1 + wave * 0.003); // Final boss is 4x size
  const bossSize = Math.min(baseBossSize * sizeMultiplier, isFinalBoss ? 400 : 200);
  
  // Boss health scales dramatically
  const bossBaseHealth = isFinalBoss 
    ? 50000 // Final boss has 50k health
    : (1800 + wave * 250) * (isMegaBoss ? 2 : isMiniBoss ? 1.5 : 1);
  
  enemies.push({
    id: 'boss-monster',
    x: levelLength - 500,
    y: GROUND_Y - (bossSize * 0.3), // Bigger bosses need more ground clearance
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

  const createParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string): Particle[] => {
    const particles: Particle[] = [];
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
    
    for (let i = 0; i < Math.min(count, 15); i++) { // Limit particles
      particles.push({
        id: `particle-${Date.now()}-${Math.random()}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 350,
        velocityY: (Math.random() - 0.8) * 350,
        color: color || colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        life: 0.25 + Math.random() * 0.4,
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
      }));
      showSpeechBubble(`WAVE ${nextWave} BEGINS! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Create chickens
  const createChickens = (playerX: number): Chicken[] => {
    const newChickens: Chicken[] = [];
    for (let i = 0; i < 5; i++) {
      newChickens.push({
        id: `chicken-${Date.now()}-${i}`,
        x: playerX + (Math.random() - 0.5) * 250,
        y: GROUND_Y,
        state: 'appearing',
        timer: 3,
        direction: Math.random() > 0.5 ? 1 : -1,
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

  // Process gift actions
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          newState.player = {
            ...prev.player,
            x: prev.player.x + 50,
            animationState: 'run',
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 5, 'dash', '#00ffff')];
          newState.score += 10;
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 200);
          break;
          
        case 'shoot':
          // Hero fires FORWARD from hitbox (aim slightly lower to consistently hit ground enemies)
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: prev.player.x + PLAYER_WIDTH, // Start at edge of hero hitbox
            y: prev.player.y + PLAYER_HEIGHT * 0.7, // Lower than center to align with ground targets
            velocityX: 650, // SLOWER - more visible projectile speed
            velocityY: 0,
            damage: prev.player.isMagicDashing ? 120 : 50,
            type: prev.player.isMagicDashing ? 'ultra' : 'mega',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          // Muzzle flash particles at hero hitbox edge
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 15, 'muzzle', '#00ffff')];
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
          newState.chickens = [...prev.chickens, ...createChickens(prev.player.x)];
          
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
          // EMP kills all drones on screen
          const dronesKilled = prev.enemies.filter(e => 
            e.type === 'drone' && !e.isDying && !e.isSpawning &&
            e.x > prev.cameraX - 50 && e.x < prev.cameraX + 600
          );
          
          dronesKilled.forEach(drone => {
            const droneIdx = newState.enemies.findIndex(e => e.id === drone.id);
            if (droneIdx !== -1) {
              newState.enemies[droneIdx] = {
                ...newState.enemies[droneIdx],
                isDying: true,
                deathTimer: 0.5,
              };
              newState.score += 75;
              newState.particles = [...newState.particles, ...createParticles(
                drone.x + drone.width/2, drone.y + drone.height/2, 
                25, 'spark', '#00ffff'
              )];
            }
          });
          
          newState.screenShake = 0.5;
          newState.magicFlash = 0.4;
          showSpeechBubble(`⚡ EMP BLAST! ${dronesKilled.length} DRONES FRIED! ⚡`, 'excited');
          newState.score += 100;
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
    
    // Create a gift block that flies INSIDE the floor section
    const newGiftBlock: GiftBlock = {
      id: `gift-block-${Date.now()}-${Math.random()}`,
      x: gameState.cameraX - 50, // Start from left off-screen
      y: 20 + Math.random() * 40, // INSIDE the floor area (bottom section)
      emoji: event.gift.emoji,
      username: event.username,
      giftName: event.gift.name,
      velocityX: 250 + Math.random() * 150, // Fly forward across screen
      life: 8, // Lives to fly across
    };
    
    setGameState(prev => ({
      ...prev,
      giftBlocks: [...prev.giftBlocks, newGiftBlock].slice(-20), // Keep max 20 blocks
    }));
    
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
        
        // Check for boss fight - INITIATE FROM MUCH FURTHER AWAY
        const bossEnemy = prev.enemies.find(e => e.type === 'boss' && !e.isDying);
        const BOSS_ACTIVATION_DISTANCE = 1500; // Boss activates from further away
        newState.isBossFight = bossEnemy !== undefined && prev.player.x > prev.levelLength - BOSS_ACTIVATION_DISTANCE;
        
        // Boss taunt and laugh
        if (bossEnemy && newState.isBossFight) {
          newState.bossTauntTimer -= delta;
          if (newState.bossTauntTimer <= 0) {
            newState.bossTaunt = BOSS_LAUGHS[Math.floor(Math.random() * BOSS_LAUGHS.length)];
            newState.bossTauntTimer = 4 + Math.random() * 3; // Taunt every 4-7 seconds
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
            // Determine which attacks are available based on wave tier
            const availableAttacks: BossAttackType[] = ['fireball'];
            
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
              }
              
              // Set cooldown based on phase
              const baseCooldown = wave >= 100 ? 2 : 3;
              newState.bossAttackCooldown = baseCooldown - (bossPhase * 0.4) + Math.random();
            }
          }
          
          // Boss phase transitions - grows bigger and more evil!
          if (bossIdx !== -1) {
            const currentPhase = newState.enemies[bossIdx].bossPhase || 1;
            
            // Phase 2: 50% health
            if (bossHealthPercent <= 0.5 && currentPhase < 2) {
              newState.enemies[bossIdx] = {
                ...newState.enemies[bossIdx],
                bossPhase: 2,
                width: newState.enemies[bossIdx].width * 1.2,
                height: newState.enemies[bossIdx].height * 1.2,
                damage: newState.enemies[bossIdx].damage * 1.3,
              };
              newState.screenShake = 1.5;
              newState.redFlash = 1.5;
              newState.bossTaunt = "PHASE 2! I GROW STRONGER!";
              showSpeechBubble("💀 BOSS EVOLVED! PHASE 2! 💀", 'urgent');
            }
            
            // Phase 3: 25% health
            if (bossHealthPercent <= 0.25 && currentPhase < 3) {
              newState.enemies[bossIdx] = {
                ...newState.enemies[bossIdx],
                bossPhase: 3,
                width: newState.enemies[bossIdx].width * 1.25,
                height: newState.enemies[bossIdx].height * 1.25,
                damage: newState.enemies[bossIdx].damage * 1.5,
                speed: newState.enemies[bossIdx].speed * 1.5,
              };
              newState.screenShake = 2;
              newState.redFlash = 2;
              newState.bossTaunt = "FINAL PHASE! PREPARE TO DIE!!!";
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
                const scoreMap: Record<string, number> = { tank: 300, mech: 180, ninja: 100, robot: 60, drone: 50, flyer: 70 };
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
        
        // Update chickens
        newState.chickens = prev.chickens
          .map(chicken => {
            let newChicken = { ...chicken, timer: chicken.timer - delta };
            if (newChicken.timer <= 2 && chicken.state === 'appearing') {
              newChicken.state = 'stopped';
            }
            if (newChicken.timer <= 1 && chicken.state === 'stopped') {
              newChicken.state = 'walking';
            }
            if (newChicken.timer <= 0) {
              newChicken.state = 'gone';
            }
            return newChicken;
          })
          .filter(c => c.state !== 'gone');
        
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
        
        // Update camera - HERO STAYS ON LEFT SIDE
        const targetCameraX = Math.max(0, newState.player.x - 80); // Hero stays at left edge
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
            
            // Generous collision box for projectiles hitting enemies
            if (
              proj.x < enemy.x + enemy.width + 10 &&
              proj.x + projWidth > enemy.x - 10 &&
              proj.y < enemy.y + enemy.height + 15 &&
              proj.y + projHeight > enemy.y - 15
            ) {
              hitProjectiles.add(proj.id);
              
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  health: newState.enemies[enemyIdx].health - proj.damage,
                };
                
                newState.particles = [...newState.particles, ...createParticles(
                  proj.x, proj.y, proj.type === 'ultra' ? 15 : 8, 'spark', 
                  proj.type === 'ultra' ? '#ff00ff' : '#ffff00'
                )];
                
                newState.screenShake = Math.max(newState.screenShake, 0.1);
                
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
                  
                  // Hero taunts enemies on kills!
                  if (newState.killStreak > 4 && newState.killStreak % 5 === 0) {
                    showSpeechBubble(`${newState.killStreak} KILL STREAK! 🔥`, 'excited');
                  } else if (Math.random() > 0.75) {
                    // Random taunt or quip on kill
                    const allQuips = [...HERO_QUIPS, ...ENEMY_TAUNTS];
                    showSpeechBubble(allQuips[Math.floor(Math.random() * allQuips.length)], 'excited');
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
            return e;
          })
          .filter(e => !e.isDying || e.deathTimer > 0);
        
        // Kill enemies automatically if near hero (not spawning)
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying || enemy.type === 'boss' || enemy.isSpawning) return enemy;
          
          const distToHero = Math.abs(enemy.x - prev.player.x);
          if (distToHero < KILL_RADIUS) {
            newState.particles = [...newState.particles, ...createParticles(
              enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15, 'death', '#ff4400'
            )];
            newState.score += 30;
            return { ...enemy, isDying: true, deathTimer: 0.4 };
          }
          return enemy;
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
          
          // Boss behavior - keep distance and shoot
          if (enemy.type === 'boss') {
            const keepDistance = enemy.x < prev.player.x + BOSS_KEEP_DISTANCE;
            if (keepDistance) {
              return { 
                ...enemy, 
                x: enemy.x + 60 * delta, // Move away from player
                animationPhase: (enemy.animationPhase + delta * 4) % (Math.PI * 2),
              };
            }
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

          // ENEMIES ONLY SHOOT WHEN ON SCREEN
          const screenLeft = prev.cameraX - 50;
          const screenRight = prev.cameraX + 700;
          const isOnScreen = enemy.x >= screenLeft && enemy.x <= screenRight;
          
          const canShootDistance = Math.abs(dx) < 650 && isOnScreen;

          // DRONE shoots lasers MORE frequently - ONLY WHEN ON SCREEN
          if (enemy.type === 'drone' && canShootDistance && enemy.attackCooldown <= 0 && Math.random() > 0.6) {
            const enemyLaser: Projectile = {
              id: `elaser-${Date.now()}-${Math.random()}`,
              x: enemy.x - 8,
              y: currentY + enemy.height / 2,
              velocityX: -600,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - currentY - enemy.height / 2) * 0.8,
              damage: 8,
              type: 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, enemyLaser];
            return { ...enemy, y: currentY, attackCooldown: 0.5 + Math.random() * 0.3, animationPhase: newAnimPhase };
          }

          // NINJA teleports when close to player
          if (enemy.type === 'ninja' && Math.abs(dx) < 150 && Math.random() > 0.95) {
            // Teleport ahead of player
            const teleportX = prev.player.x + 200 + Math.random() * 150;
            newState.particles = [...newState.particles, ...createParticles(enemy.x, currentY, 10, 'magic', '#8800ff')];
            newState.particles = [...newState.particles, ...createParticles(teleportX, GROUND_Y, 10, 'magic', '#8800ff')];
            return { ...enemy, x: teleportX, y: GROUND_Y, animationPhase: newAnimPhase, attackCooldown: 0.8 };
          }

          // MECH and TANK shoot bullets - ONLY WHEN ON SCREEN
          if ((enemy.type === 'mech' || enemy.type === 'tank') && canShootDistance && enemy.attackCooldown <= 0 && Math.random() > 0.65) {
            const enemyBullet: Projectile = {
              id: `ebullet-${Date.now()}-${Math.random()}`,
              x: enemy.x - 8,
              y: currentY + enemy.height / 2,
              velocityX: enemy.type === 'tank' ? -350 : -450,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - currentY - enemy.height / 2) * 0.5,
              damage: enemy.type === 'tank' ? 12 : 8,
              type: 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, enemyBullet];
            return { ...enemy, y: currentY, attackCooldown: enemy.type === 'tank' ? 1.5 : 1.0, animationPhase: newAnimPhase };
          }

          // Regular enemy shooting - ONLY WHEN ON SCREEN
          if (canShootDistance && enemy.attackCooldown <= 0 && Math.random() > 0.7) {
            const enemyLaser: Projectile = {
              id: `elaser-${Date.now()}-${Math.random()}`,
              x: enemy.x - 8,
              y: currentY + enemy.height / 2,
              velocityX: -400,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - currentY - enemy.height / 2) * 0.6,
              damage: 6,
              type: 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, enemyLaser];
            return { ...enemy, y: currentY, attackCooldown: 0.8 + Math.random() * 0.5, animationPhase: newAnimPhase };
          }

          // Movement with back-and-forth pattern
          if (Math.abs(dx) < 500 && !tooClose && !reachedMinDistance) {
            const speedBoost = 1.3; // Faster movement
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta * moveMultiplier * speedBoost,
              y: nextY,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
            };
          }

          // Even at min distance, do back-and-forth
          if (reachedMinDistance) {
            const sway = Math.sin(newAnimPhase * 5) * 25 * delta; // Sway back and forth
            return {
              ...enemy,
              x: enemy.x + sway,
              y: nextY,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
            };
          }

          return { ...enemy, y: nextY, animationPhase: newAnimPhase, attackCooldown: Math.max(0, enemy.attackCooldown - delta) };
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
        
        // Update particles - limit
        newState.particles = prev.particles
          .slice(0, 80)
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            velocityY: p.velocityY + 450 * delta,
            life: p.life - delta,
          }))
          .filter(p => p.life > 0);
        
        // Flying robots - reduced
        newState.flyingRobots = prev.flyingRobots
          .map(robot => ({ ...robot, x: robot.x + robot.speed * delta }))
          .filter(robot => robot.x - prev.cameraX < 1000);
        
        if (Math.random() > 0.996) {
          const robotTypes: FlyingRobot['type'][] = ['ufo', 'jet', 'satellite'];
          newState.flyingRobots = [...newState.flyingRobots, {
            id: `flybot-${Date.now()}`,
            x: prev.cameraX - 60,
            y: 15 + Math.random() * 50,
            speed: 100 + Math.random() * 120,
            type: robotTypes[Math.floor(Math.random() * robotTypes.length)],
          }];
        }
        
        // Neon lights - reduced
        newState.neonLights = prev.neonLights.filter(light => light.x - prev.cameraX < 1000).slice(0, 8);
        
        if (Math.random() > 0.97) {
          const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0088', '#00ff88'];
          newState.neonLights = [...newState.neonLights, {
            id: `neon-${Date.now()}-${Math.random()}`,
            x: prev.cameraX + Math.random() * 700,
            y: 25 + Math.random() * 120,
            size: 8 + Math.random() * 25,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 80 + Math.random() * 80,
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
        
        // Win condition
        const princessX = prev.levelLength - 80;
        if (newState.player.x >= princessX - 30 && !bossEnemy) {
          newState.phase = 'victory';
          newState.screenShake = 1.2;
          showSpeechBubble("PRINCESS! I'M HERE! 💖👑", 'excited');
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
