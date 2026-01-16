import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken
} from '@/types/game';

const GRAVITY = 0;
const GROUND_Y = 100;
const PLAYER_WIDTH = 32; // Half size
const PLAYER_HEIGHT = 55; // Half size
const BASE_LEVEL_LENGTH = 12000; // Longer levels
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;
const ARMOR_DURATION = 5;
const KILL_RADIUS = 60;
const ENEMY_MIN_DISTANCE = 120; // Boss keeps more distance
const BOSS_FIREBALL_INTERVAL = 5;
const BOSS_MEGA_ATTACK_THRESHOLD = 0.3;
const BOSS_KEEP_DISTANCE = 200; // Boss keeps this distance from player

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
  armorTimer: number;
  enemyLasers: Projectile[];
  magicFlash: number;
  bossTaunt: string | null;
  bossTauntTimer: number;
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
  fireballs: [],
  bossFireballTimer: BOSS_FIREBALL_INTERVAL,
  bossMegaAttackUsed: false,
  redFlash: 0,
  armorTimer: 0,
  enemyLasers: [],
  magicFlash: 0,
  bossTaunt: null,
  bossTauntTimer: 0,
};

// More varied enemy types
const ENEMY_TYPES = ['robot', 'drone', 'mech', 'ninja', 'tank', 'flyer', 'brute', 'sniper', 'swarm'] as const;

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.3, wave - 1), 50000);
  const enemyDensity = 200 + Math.max(0, 60 - wave * 3);
  
  for (let x = 400; x < levelLength - 800; x += enemyDensity + Math.random() * 100) {
    const typeRoll = Math.random();
    const waveBonus = Math.min(wave * 0.1, 2);
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    // More varied enemies
    if (typeRoll > 0.95) {
      enemyType = 'tank';
      width = 70; height = 65; health = 180 * (1 + waveBonus); speed = 18 + wave; damage = 22;
    } else if (typeRoll > 0.88) {
      enemyType = 'mech';
      width = 65; height = 70; health = 90 * (1 + waveBonus); speed = 32 + wave * 2; damage = 16;
    } else if (typeRoll > 0.78) {
      enemyType = 'ninja';
      width = 45; height = 52; health = 35 * (1 + waveBonus * 0.5); speed = 150 + wave * 5; damage = 12;
    } else if (typeRoll > 0.68) {
      enemyType = 'drone';
      width = 42; height = 42; health = 28 * (1 + waveBonus * 0.5); speed = 90 + wave * 2; damage = 7;
    } else if (typeRoll > 0.55) {
      enemyType = 'flyer';
      width = 50; height = 46; health = 40 * (1 + waveBonus * 0.5); speed = 75 + wave * 2; damage = 9;
    } else {
      enemyType = 'robot';
      width = 50; height = 58; health = 45 * (1 + waveBonus); speed = 55 + wave * 2; damage = 9;
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
    });
  }
  
  // SCARY BOSS - 50% more health
  const isMegaBoss = wave % 10 === 0;
  const bossBaseHealth = (1800 + wave * 200) * 1.5; // 50% more health
  enemies.push({
    id: 'boss-monster',
    x: levelLength - 500,
    y: GROUND_Y - 30,
    width: isMegaBoss ? 120 : 100,
    height: isMegaBoss ? 120 : 100,
    health: bossBaseHealth * (isMegaBoss ? 1.5 : 1),
    maxHealth: bossBaseHealth * (isMegaBoss ? 1.5 : 1),
    speed: 40 + wave,
    damage: 35 + wave * 2,
    type: 'boss',
    isDying: false,
    deathTimer: 0,
    attackCooldown: 0,
    animationPhase: 0,
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

  // Create dangerous enemies for spawn_enemies gift
  const createDangerousEnemies = (playerX: number, count: number): Enemy[] => {
    const newEnemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.5 ? 'tank' : 'mech';
      newEnemies.push({
        id: `spawn-enemy-${Date.now()}-${i}`,
        x: playerX + 200 + Math.random() * 300,
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
          const nearbyEnemy = prev.enemies
            .filter(e => !e.isDying && e.x > prev.player.x && e.x < prev.player.x + 500)
            .sort((a, b) => a.x - b.x)[0];
          
          const targetY = nearbyEnemy 
            ? nearbyEnemy.y + nearbyEnemy.height / 2 
            : prev.player.y + PLAYER_HEIGHT / 2;
          
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2,
            velocityX: 1400,
            velocityY: nearbyEnemy ? (targetY - (prev.player.y + PLAYER_HEIGHT / 2)) * 2.5 : 0,
            damage: prev.player.isMagicDashing ? 120 : 50,
            type: prev.player.isMagicDashing ? 'ultra' : 'mega',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 12, 'muzzle', '#ffff00')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 150);
          newState.score += 20;
          
          if (nearbyEnemy) {
            showSpeechBubble(`TARGETING ${nearbyEnemy.type.toUpperCase()}! 🎯`, 'normal');
          } else if (Math.random() > 0.7) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
          }
          break;
          
        case 'armor':
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + 60),
          };
          newState.armorTimer = ARMOR_DURATION;
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 15, 'magic', '#00ffff')];
          newState.score += 50;
          newState.screenShake = 0.15;
          showSpeechBubble(`ARMOR UP! 5 SEC SHIELD! 🛡️`, 'excited');
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
          newState.screenShake = 0.5;
          newState.magicFlash = 0.8; // Flash screen
          newState.chickens = [...prev.chickens, ...createChickens(prev.player.x)];
          showSpeechBubble("✨ MAGIC DASH + CHICKENS! 🐔✨", 'excited');
          break;

        case 'spawn_enemies' as GiftAction:
          // New gift that spawns dangerous enemies
          newState.enemies = [...prev.enemies, ...createDangerousEnemies(prev.player.x, 3)];
          newState.screenShake = 0.4;
          showSpeechBubble("⚠️ DANGER! ENEMIES SPAWNED! ⚠️", 'urgent');
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
        
        // Check for boss fight
        const bossEnemy = prev.enemies.find(e => e.type === 'boss' && !e.isDying);
        newState.isBossFight = bossEnemy !== undefined && prev.player.x > prev.levelLength - 700;
        
        // Boss taunt and laugh
        if (bossEnemy && newState.isBossFight) {
          newState.bossTauntTimer -= delta;
          if (newState.bossTauntTimer <= 0) {
            newState.bossTaunt = BOSS_LAUGHS[Math.floor(Math.random() * BOSS_LAUGHS.length)];
            newState.bossTauntTimer = 4 + Math.random() * 3; // Taunt every 4-7 seconds
          }
        } else {
          newState.bossTaunt = null;
        }
        
        // Boss fireball attack every 5 seconds
        if (bossEnemy && newState.isBossFight) {
          newState.bossFireballTimer -= delta;
          
          if (newState.bossFireballTimer <= 0) {
            const fireball: Fireball = {
              id: `fireball-${Date.now()}`,
              x: bossEnemy.x,
              y: bossEnemy.y + bossEnemy.height / 2,
              velocityX: -500,
              velocityY: (prev.player.y - bossEnemy.y) * 0.6,
              damage: 10,
            };
            newState.fireballs = [...newState.fireballs, fireball];
            newState.bossFireballTimer = BOSS_FIREBALL_INTERVAL;
            newState.screenShake = 0.3;
            showSpeechBubble("🔥 FIREBALL! 🔥", 'urgent');
          }
          
          // Boss mega attack at 30% health
          const bossHealthPercent = bossEnemy.health / bossEnemy.maxHealth;
          if (bossHealthPercent <= BOSS_MEGA_ATTACK_THRESHOLD && !newState.bossMegaAttackUsed) {
            newState.bossMegaAttackUsed = true;
            newState.player.health = Math.max(1, newState.player.health - 60);
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
        
        // Fireball-player collision - armor blocks fireballs
        newState.fireballs.forEach(fireball => {
          if (
            fireball.x < prev.player.x + PLAYER_WIDTH &&
            fireball.x + 30 > prev.player.x &&
            fireball.y < prev.player.y + PLAYER_HEIGHT &&
            fireball.y + 30 > prev.player.y
          ) {
            if (newState.player.shield > 0 || newState.armorTimer > 0) {
              // Armor blocks fireball damage
              newState.player.shield = Math.max(0, newState.player.shield - 20);
              showSpeechBubble("🛡️ BLOCKED! 🛡️", 'excited');
            } else {
              newState.player.health -= fireball.damage;
              newState.player.animationState = 'hurt';
            }
            newState.fireballs = newState.fireballs.filter(f => f.id !== fireball.id);
            newState.particles = [...newState.particles, ...createParticles(fireball.x, fireball.y, 15, 'explosion', '#ff4400')];
            newState.screenShake = 0.4;
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
        
        // Armor timer decay
        if (prev.armorTimer > 0) {
          newState.armorTimer = prev.armorTimer - delta;
          if (newState.armorTimer <= 0) {
            newState.player.shield = 0;
          }
        }
        
        // Magic Dash auto-actions
        if (prev.player.isMagicDashing) {
          newState.player = {
            ...newState.player,
            magicDashTimer: prev.player.magicDashTimer - delta,
            isShooting: true,
          };
          
          newState.player.x += 200 * delta;
          newState.player.animationState = 'dash';
          
          const nearbyEnemies = prev.enemies
            .filter(e => e.x > prev.player.x && e.x < prev.player.x + 500 && !e.isDying)
            .sort((a, b) => a.x - b.x);
          
          if (nearbyEnemies.length > 0 && Math.random() > 0.2) {
            const target = nearbyEnemies[0];
            const targetY = target.y + target.height / 2;
            const playerY = newState.player.y + PLAYER_HEIGHT / 2;
            
            const magicBullet: Projectile = {
              id: `magic-${Date.now()}-${Math.random()}`,
              x: newState.player.x + PLAYER_WIDTH,
              y: playerY,
              velocityX: 1800,
              velocityY: (targetY - playerY) * 3,
              damage: 150,
              type: 'ultra',
            };
            newState.projectiles = [...newState.projectiles, magicBullet];
            newState.particles = [...newState.particles, ...createParticles(newState.player.x + PLAYER_WIDTH, playerY, 10, 'muzzle', '#ff00ff')];
          }
          
          if (Math.random() > 0.3) {
            newState.particles = [...newState.particles, ...createParticles(
              newState.player.x + Math.random() * PLAYER_WIDTH, 
              newState.player.y + Math.random() * PLAYER_HEIGHT, 
              4, 'ultra', '#ff00ff'
            )];
          }
          
          if (newState.player.magicDashTimer <= 0) {
            newState.player.isMagicDashing = false;
            newState.player.isShooting = false;
            newState.player.animationState = 'idle';
            showSpeechBubble("Magic dash ended! 💫", 'normal');
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
        
        // Enemy laser-player collision
        newState.enemyLasers.forEach(laser => {
          if (
            laser.x < prev.player.x + PLAYER_WIDTH &&
            laser.x + 12 > prev.player.x &&
            laser.y < prev.player.y + PLAYER_HEIGHT &&
            laser.y + 6 > prev.player.y
          ) {
            if (newState.player.shield > 0 || newState.armorTimer > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - laser.damage);
            } else {
              newState.player.health -= laser.damage;
              newState.player.animationState = 'hurt';
            }
            newState.enemyLasers = newState.enemyLasers.filter(l => l.id !== laser.id);
            newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 6, 'spark', '#ff0000')];
          }
        });
        
        // Projectile-enemy collisions
        const hitProjectiles = new Set<string>();
        
        newState.projectiles.forEach(proj => {
          newState.enemies.forEach(enemy => {
            if (hitProjectiles.has(proj.id) || enemy.isDying) return;
            
            if (
              proj.x < enemy.x + enemy.width &&
              proj.x + 12 > enemy.x &&
              proj.y < enemy.y + enemy.height &&
              proj.y + 6 > enemy.y
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
                  
                  if (newState.killStreak > 4 && newState.killStreak % 5 === 0) {
                    showSpeechBubble(`${newState.killStreak} KILL STREAK! 🔥`, 'excited');
                  }
                }
              }
            }
          });
        });
        
        newState.projectiles = newState.projectiles.filter(p => !hitProjectiles.has(p.id));
        
        // Update dying enemies
        newState.enemies = newState.enemies
          .map(e => e.isDying ? { ...e, deathTimer: e.deathTimer - delta } : e)
          .filter(e => !e.isDying || e.deathTimer > 0);
        
        // Kill enemies automatically if near hero
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying || enemy.type === 'boss') return enemy;
          
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
        
        // Move enemies - boss keeps distance and shoots
        const minSpacing = 60;
        newState.enemies = newState.enemies.map((enemy, idx) => {
          if (enemy.isDying) return enemy;
          
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
          
          // Enemy shooting
          if (reachedMinDistance && enemy.attackCooldown <= 0 && Math.random() > 0.96) {
            const enemyLaser: Projectile = {
              id: `elaser-${Date.now()}-${Math.random()}`,
              x: enemy.x - 8,
              y: enemy.y + enemy.height / 2,
              velocityX: -400,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - enemy.y - enemy.height / 2) * 0.6,
              damage: 6,
              type: 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, enemyLaser];
            return { ...enemy, attackCooldown: 2 + Math.random() * 2, animationPhase: newAnimPhase };
          }
          
          if (Math.abs(dx) < 500 && !tooClose && !reachedMinDistance) {
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta,
              animationPhase: newAnimPhase,
              attackCooldown: Math.max(0, enemy.attackCooldown - delta),
            };
          }
          return { ...enemy, animationPhase: newAnimPhase, attackCooldown: Math.max(0, enemy.attackCooldown - delta) };
        });
        
        // Player-enemy collision
        newState.enemies.forEach(enemy => {
          if (enemy.isDying) return;
          
          if (
            prev.player.x < enemy.x + enemy.width - 6 &&
            prev.player.x + PLAYER_WIDTH - 6 > enemy.x &&
            prev.player.y < enemy.y + enemy.height &&
            prev.player.y + PLAYER_HEIGHT > enemy.y
          ) {
            if (newState.player.shield > 0 || newState.armorTimer > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage);
              newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 6, 'spark', '#00ffff')];
            } else {
              newState.player.health -= enemy.damage * delta * 2;
              newState.player.animationState = 'hurt';
              setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 150);
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
