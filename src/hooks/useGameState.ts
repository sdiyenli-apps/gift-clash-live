import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS, TIKTOK_GIFTS
} from '@/types/game';

const GRAVITY = 2200;
const JUMP_VELOCITY = -700;
const GROUND_Y = 380;
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 80;
const BASE_LEVEL_LENGTH = 2000; // Base level length, doubles each wave
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000; // 8 seconds

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
};

const INITIAL_STATE: GameState = {
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
};

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  // Level length doubles each wave (capped for performance)
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.5, wave - 1), 50000);
  
  // Enemy count scales with wave
  const enemyDensity = 150 + Math.max(0, 50 - wave * 2); // More enemies as waves progress
  
  const enemyTypes: Enemy['type'][] = ['robot', 'drone', 'mech', 'ninja', 'tank', 'flyer'];
  
  for (let x = 400; x < levelLength - 800; x += enemyDensity + Math.random() * 100) {
    const typeRoll = Math.random();
    const waveBonus = Math.min(wave * 0.1, 2); // Wave difficulty scaling
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    if (typeRoll > 0.92) {
      enemyType = 'tank';
      width = 80; height = 70; health = 180 * (1 + waveBonus); speed = 25 + wave; damage = 25;
    } else if (typeRoll > 0.82) {
      enemyType = 'mech';
      width = 72; height = 80; health = 100 * (1 + waveBonus); speed = 45 + wave * 2; damage = 18;
    } else if (typeRoll > 0.7) {
      enemyType = 'ninja';
      width = 44; height = 52; health = 35 * (1 + waveBonus * 0.5); speed = 180 + wave * 5; damage = 12;
    } else if (typeRoll > 0.55) {
      enemyType = 'drone';
      width = 40; height = 40; health = 30 * (1 + waveBonus * 0.5); speed = 100 + wave * 3; damage = 8;
    } else if (typeRoll > 0.4) {
      enemyType = 'flyer';
      width = 50; height = 45; health = 40 * (1 + waveBonus * 0.5); speed = 90 + wave * 2; damage = 10;
    } else {
      enemyType = 'robot';
      width = 48; height = 56; health = 45 * (1 + waveBonus); speed = 65 + wave * 2; damage = 10;
    }
    
    enemies.push({
      id: `enemy-${x}-${Math.random()}`,
      x,
      y: ['drone', 'flyer'].includes(enemyType) ? GROUND_Y - 80 - Math.random() * 100 : GROUND_Y,
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
  
  // MASSIVE SCARY BOSS at the end (every 10 waves is an extra tough boss)
  const isMegaBoss = wave % 10 === 0;
  const bossScale = isMegaBoss ? 1.5 : 1;
  enemies.push({
    id: 'boss-omega',
    x: levelLength - 500,
    y: GROUND_Y - 60 * bossScale,
    width: 200 * bossScale,
    height: 220 * bossScale,
    health: (1500 + wave * 200) * bossScale,
    maxHealth: (1500 + wave * 200) * bossScale,
    speed: 40 + wave,
    damage: 35 + wave * 2,
    type: 'boss',
    isDying: false,
    deathTimer: 0,
    attackCooldown: 0,
    animationPhase: 0,
  });
  
  // Generate varied obstacles
  for (let x = 500; x < levelLength - 1000; x += 350 + Math.random() * 400) {
    const obstacleRoll = Math.random();
    
    if (obstacleRoll > 0.6) {
      obstacles.push({
        id: `platform-${x}`,
        x,
        y: GROUND_Y - 80 - Math.random() * 100,
        width: 100 + Math.random() * 100,
        height: 20,
        type: 'platform',
      });
    } else if (obstacleRoll > 0.4) {
      obstacles.push({
        id: `crate-${x}`,
        x,
        y: GROUND_Y,
        width: 50,
        height: 50,
        type: 'crate',
      });
    } else if (obstacleRoll > 0.2) {
      obstacles.push({
        id: `barrel-${x}`,
        x,
        y: GROUND_Y,
        width: 40,
        height: 55,
        type: 'barrel',
      });
    }
  }
  
  return { enemies, obstacles, levelLength };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Gifter[]>([]);
  const [notifications, setNotifications] = useState<GiftEvent[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const ultraModeActionsRef = useRef<number>(0);
  const helpRequestTimerRef = useRef<NodeJS.Timeout | null>(null);

  const createParticles = useCallback((x: number, y: number, count: number, type: Particle['type'], color?: string): Particle[] => {
    const particles: Particle[] = [];
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80', '#ff4400'];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: `particle-${Date.now()}-${Math.random()}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 500,
        velocityY: (Math.random() - 0.8) * 500,
        color: color || colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 10,
        life: 0.4 + Math.random() * 0.6,
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
    }, 3000);
  }, []);

  const requestHelp = useCallback(() => {
    const helpText = HELP_REQUESTS[Math.floor(Math.random() * HELP_REQUESTS.length)];
    showSpeechBubble(helpText, 'help');
  }, [showSpeechBubble]);

  const spawnEnemy = useCallback((atX?: number): Enemy => {
    const x = atX ?? gameState.player.x + 500 + Math.random() * 300;
    const types: Enemy['type'][] = ['robot', 'drone', 'mech', 'ninja'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const configs = {
      robot: { width: 48, height: 56, health: 45, speed: 65, damage: 10 },
      drone: { width: 40, height: 40, health: 30, speed: 100, damage: 8 },
      mech: { width: 72, height: 80, health: 100, speed: 45, damage: 18 },
      boss: { width: 200, height: 220, health: 1500, speed: 40, damage: 35 },
      ninja: { width: 44, height: 52, health: 35, speed: 180, damage: 12 },
      tank: { width: 80, height: 70, health: 180, speed: 25, damage: 25 },
      flyer: { width: 50, height: 45, health: 40, speed: 90, damage: 10 },
    };
    
    const config = configs[type];
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      x,
      y: ['drone', 'flyer'].includes(type) ? GROUND_Y - 100 : GROUND_Y,
      ...config,
      maxHealth: config.health,
      type,
      isDying: false,
      deathTimer: 0,
      attackCooldown: 0,
      animationPhase: 0,
    };
  }, [gameState.player.x]);

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
    showSpeechBubble(`WAVE ${wave}! LET'S SAVE THAT PRINCESS, CHAT! 🔥`, 'excited');
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
      }));
      showSpeechBubble(`WAVE ${nextWave} BEGINS! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Auto-dodge logic
  const shouldAutoDodge = useCallback((playerX: number, playerY: number, enemies: Enemy[]): boolean => {
    const dangerZone = enemies.some(enemy => 
      !enemy.isDying && 
      Math.abs(enemy.x - playerX) < 100 && 
      Math.abs(enemy.y - playerY) < 80
    );
    return dangerZone && Math.random() > 0.7; // 30% chance to auto-dodge when in danger
  }, []);

  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          // Move forward a fixed amount
          newState.player = {
            ...prev.player,
            x: prev.player.x + 80,
            animationState: 'run',
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 8, 'dash', '#00ffff')];
          newState.score += 10;
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 200);
          break;
          
        case 'move_up':
          // Move up (jump if grounded, otherwise float up)
          if (prev.player.isGrounded) {
            newState.player = {
              ...prev.player,
              velocityY: JUMP_VELOCITY * 0.7,
              isGrounded: false,
              isJumping: true,
              animationState: 'jump',
            };
          } else {
            newState.player = {
              ...prev.player,
              y: Math.max(100, prev.player.y - 50),
              velocityY: Math.min(prev.player.velocityY, -200),
            };
          }
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT, 8, 'spark', '#00ff88')];
          newState.score += 10;
          break;
          
        case 'move_down':
          // Move down (fast fall or duck)
          if (!prev.player.isGrounded) {
            newState.player = {
              ...prev.player,
              velocityY: Math.max(prev.player.velocityY + 400, 600),
            };
          }
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 8, 'spark', '#ff8800')];
          newState.score += 10;
          break;
          
        case 'dash_forward':
          newState.player = {
            ...prev.player,
            x: prev.player.x + 150,
            isDashing: true,
            animationState: 'dash',
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 20, 'dash', '#00ffff')];
          newState.score += 25;
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isDashing: false, animationState: 'idle' } })), 300);
          break;
          
        case 'jump':
          if (prev.player.isGrounded) {
            newState.player = {
              ...prev.player,
              velocityY: JUMP_VELOCITY,
              isGrounded: false,
              isJumping: true,
              animationState: 'jump',
            };
            newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT, 12, 'spark', '#00ffff')];
          }
          newState.score += 25;
          break;
          
        case 'double_jump':
          newState.player = {
            ...prev.player,
            velocityY: JUMP_VELOCITY * 1.4,
            isGrounded: false,
            isJumping: true,
            animationState: 'jump',
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT, 20, 'magic', '#ff00ff')];
          newState.score += 60;
          newState.screenShake = 0.3;
          break;
          
        case 'shoot':
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2 - 10,
            velocityX: 900,
            velocityY: 0,
            damage: 25,
            type: 'normal',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2 - 10, 8, 'muzzle', '#ffff00')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 200);
          newState.score += 20;
          
          if (Math.random() > 0.6) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
          }
          break;
          
        case 'triple_shot':
          const tripleShots: Projectile[] = [-15, 0, 15].map((angle, i) => ({
            id: `triple-${Date.now()}-${i}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2 - 10,
            velocityX: 800,
            velocityY: angle * 3,
            damage: 20,
            type: 'triple' as const,
          }));
          newState.projectiles = [...prev.projectiles, ...tripleShots];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 15, 'muzzle', '#ff8800')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 200);
          newState.score += 30;
          break;
          
        case 'mega_shot':
          const megaBullet: Projectile = {
            id: `mega-${Date.now()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2 - 15,
            velocityX: 1100,
            velocityY: 0,
            damage: 80,
            type: 'mega',
          };
          newState.projectiles = [...prev.projectiles, megaBullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 25, 'muzzle', '#ff00ff')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 250);
          newState.score += 120;
          newState.screenShake = 0.4;
          showSpeechBubble("MEGA BLAST! 💥💥💥", 'excited');
          break;
          
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + 40),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 20, 'magic', '#00ff00')];
          newState.score += 60;
          showSpeechBubble(`THANKS ${username.toUpperCase()}! HEALED UP! 💚`, 'normal');
          break;
          
        case 'shield':
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + 100),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 30, 'magic', '#00ffff')];
          newState.score += 250;
          newState.screenShake = 0.3;
          showSpeechBubble("I'M INVINCIBLE NOW! 🛡️💪", 'excited');
          break;
          
        case 'spawn_enemy':
          const newEnemies = [spawnEnemy(), spawnEnemy()];
          newState.enemies = [...prev.enemies, ...newEnemies];
          showSpeechBubble("MORE ROBOTS?! BRING IT! 😤", 'normal');
          break;
          
        case 'speed_boost':
          newState.player = {
            ...prev.player,
            speedMultiplier: 2,
          };
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, speedMultiplier: 1 } })), 5000);
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 20, 'spark', '#ffff00')];
          newState.score += 80;
          showSpeechBubble("GOTTA GO FAST! ⚡", 'excited');
          break;
          
        case 'ultra_mode':
          newState.isUltraMode = true;
          newState.ultraModeTimer = 6;
          ultraModeActionsRef.current = 0;
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 60, 'ultra', '#ff00ff')];
          newState.score += 600;
          newState.screenShake = 0.8;
          showSpeechBubble("🔥 ULTRA MODE ACTIVATED! 🔥💀🔥", 'excited');
          break;
          
        case 'nuke':
          const nukeParticles: Particle[] = [];
          prev.enemies.forEach(enemy => {
            nukeParticles.push(...createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 30, 'explosion', '#ff4400'));
          });
          newState.enemies = prev.enemies.map(e => ({ ...e, isDying: true, health: 0 }));
          newState.particles = [...prev.particles, ...nukeParticles];
          newState.score += prev.enemies.length * 150;
          newState.screenShake = 1;
          showSpeechBubble("KABOOOOM! TACTICAL NUKE! 💣💥", 'excited');
          break;
          
        case 'time_slow':
          newState.isSlowMotion = true;
          setTimeout(() => setGameState(s => ({ ...s, isSlowMotion: false })), 5000);
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 30, 'magic', '#8800ff')];
          newState.score += 150;
          showSpeechBubble("TIME SLOWS DOWN... ⏰🔮", 'normal');
          break;
      }
      
      return newState;
    });
  }, [createParticles, showSpeechBubble, spawnEnemy]);

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
    
    // Use the gift's direct action mapping
    processGiftAction(event.gift.action, event.username);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== event.id));
    }, 4000);
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

  // Game loop
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const gameLoop = () => {
      const now = Date.now();
      let delta = Math.min((now - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = now;
      
      setGameState(prev => {
        if (prev.phase !== 'playing') return prev;
        
        // Slow motion effect
        if (prev.isSlowMotion) {
          delta *= 0.3;
        }

        let newState = { ...prev };
        
        // Check for boss fight
        const bossEnemy = prev.enemies.find(e => e.type === 'boss' && !e.isDying);
        newState.isBossFight = bossEnemy !== undefined && prev.player.x > prev.levelLength - 800;
        
        // Boss taunt
        if (newState.isBossFight && !prev.isBossFight) {
          showSpeechBubble(BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)], 'urgent');
        }
        
        // Ultra mode auto-actions
        if (prev.isUltraMode) {
          newState.ultraModeTimer -= delta;
          
          // Auto move forward fast with style
          newState.player = {
            ...newState.player,
            x: newState.player.x + 450 * delta * newState.player.speedMultiplier,
            animationState: 'dash',
          };
          
          // Auto jump randomly
          if (newState.player.isGrounded && Math.random() > 0.85) {
            newState.player.velocityY = JUMP_VELOCITY * 1.2;
            newState.player.isGrounded = false;
            newState.player.animationState = 'jump';
          }
          
          // Auto shoot at nearby enemies with style
          const nearbyEnemies = prev.enemies.filter(e => 
            e.x > prev.player.x && 
            e.x < prev.player.x + 600 && 
            !e.isDying
          );
          
          nearbyEnemies.forEach(enemy => {
            if (Math.random() > 0.5) {
              const ultraBullet: Projectile = {
                id: `ultra-${Date.now()}-${Math.random()}`,
                x: prev.player.x + PLAYER_WIDTH,
                y: enemy.y + enemy.height / 2,
                velocityX: 1400,
                velocityY: 0,
                damage: 120,
                type: 'ultra',
              };
              newState.projectiles = [...newState.projectiles, ultraBullet];
              newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, ultraBullet.y, 15, 'muzzle', '#ff00ff')];
            }
          });
          
          // Ultra particles
          if (Math.random() > 0.3) {
            newState.particles = [...newState.particles, ...createParticles(
              prev.player.x + Math.random() * PLAYER_WIDTH, 
              prev.player.y + Math.random() * PLAYER_HEIGHT, 
              5, 'ultra', '#ff00ff'
            )];
          }
          
          if (newState.ultraModeTimer <= 0) {
            newState.isUltraMode = false;
            newState.player.animationState = 'idle';
          }
        }
        
        // Auto-dodge mechanic
        if (!prev.isUltraMode && shouldAutoDodge(prev.player.x, prev.player.y, prev.enemies)) {
          const dodgeDirection = Math.random() > 0.5 ? 1 : -1;
          newState.player = {
            ...newState.player,
            isDodging: true,
            y: prev.player.y - 50, // Quick hop
            velocityY: -300,
            animationState: 'dodge',
          };
          newState.particles = [...newState.particles, ...createParticles(prev.player.x, prev.player.y, 10, 'dash', '#00ff88')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isDodging: false, animationState: 'idle' } })), 400);
        }
        
        // Screen shake decay
        if (prev.screenShake > 0) {
          newState.screenShake = Math.max(0, prev.screenShake - delta * 3);
        }
        
        // Apply gravity to player
        if (!prev.player.isGrounded) {
          newState.player = {
            ...newState.player,
            velocityY: prev.player.velocityY + GRAVITY * delta,
            y: prev.player.y + prev.player.velocityY * delta,
          };
          
          // Ground check
          if (newState.player.y >= GROUND_Y) {
            newState.player.y = GROUND_Y;
            newState.player.velocityY = 0;
            newState.player.isGrounded = true;
            newState.player.isJumping = false;
            if (!newState.player.isDashing) {
              newState.player.animationState = 'idle';
            }
          }
        }
        
        // Update camera smoothly
        const targetCameraX = Math.max(0, newState.player.x - 200);
        newState.cameraX = prev.cameraX + (targetCameraX - prev.cameraX) * 0.1;
        newState.distance = newState.player.x;
        
        // Update projectiles
        newState.projectiles = prev.projectiles
          .map(p => ({ 
            ...p, 
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
          }))
          .filter(p => p.x < prev.cameraX + 1200);
        
        // Projectile-enemy collisions
        const hitEnemies = new Set<string>();
        const hitProjectiles = new Set<string>();
        
        newState.projectiles.forEach(proj => {
          newState.enemies.forEach(enemy => {
            if (hitProjectiles.has(proj.id) || enemy.isDying) return;
            
            if (
              proj.x < enemy.x + enemy.width &&
              proj.x + 20 > enemy.x &&
              proj.y < enemy.y + enemy.height &&
              proj.y + 10 > enemy.y
            ) {
              hitEnemies.add(enemy.id);
              hitProjectiles.add(proj.id);
              
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  health: newState.enemies[enemyIdx].health - proj.damage,
                };
                
                // Hit particles
                newState.particles = [...newState.particles, ...createParticles(
                  proj.x, proj.y, proj.type === 'ultra' ? 30 : 15, 'spark', 
                  proj.type === 'ultra' ? '#ff00ff' : '#ffff00'
                )];
                
                newState.screenShake = Math.max(newState.screenShake, 0.15);
                
                if (newState.enemies[enemyIdx].health <= 0) {
                  newState.enemies[enemyIdx].isDying = true;
                  newState.enemies[enemyIdx].deathTimer = 0.6;
                  
                  // Score based on enemy type
                  const scoreMap = { boss: 2000, tank: 300, mech: 200, ninja: 100, robot: 60, drone: 50, flyer: 70 };
                  newState.score += scoreMap[enemy.type] || 50;
                  newState.combo++;
                  newState.comboTimer = 2.5;
                  newState.killStreak++;
                  
                  // Death explosion
                  newState.particles = [...newState.particles, ...createParticles(
                    enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                    enemy.type === 'boss' ? 80 : 40, 'death', '#ff4400'
                  )];
                  
                  newState.screenShake = enemy.type === 'boss' ? 1.5 : 0.4;
                  
                  // Kill streak quips
                  if (newState.killStreak > 5 && newState.killStreak % 5 === 0) {
                    showSpeechBubble(`${newState.killStreak} KILL STREAK! 🔥🔥🔥`, 'excited');
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
        
        // Move enemies toward player with animations
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying) return enemy;
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          
          // Update animation phase
          const newAnimPhase = (enemy.animationPhase + delta * 8) % (Math.PI * 2);
          
          // Only chase if player is nearby
          if (Math.abs(dx) < 500) {
            // Flying enemies bob up and down
            const yOffset = ['drone', 'flyer'].includes(enemy.type) 
              ? Math.sin(newAnimPhase) * 30 
              : 0;
              
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta,
              y: ['drone', 'flyer'].includes(enemy.type) 
                ? GROUND_Y - 100 + yOffset 
                : enemy.y,
              animationPhase: newAnimPhase,
            };
          }
          return { ...enemy, animationPhase: newAnimPhase };
        });
        
        // Player-enemy collision with shield check
        newState.enemies.forEach(enemy => {
          if (enemy.isDying || prev.player.isDodging) return;
          
          if (
            prev.player.x < enemy.x + enemy.width - 10 &&
            prev.player.x + PLAYER_WIDTH - 10 > enemy.x &&
            prev.player.y < enemy.y + enemy.height &&
            prev.player.y + PLAYER_HEIGHT > enemy.y
          ) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage);
              newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 10, 'spark', '#00ffff')];
            } else {
              newState.player.health -= enemy.damage * delta * 2;
              newState.player.animationState = 'hurt';
              setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 200);
            }
            newState.combo = 0;
            newState.killStreak = 0;
          }
        });
        
        // Update particles
        newState.particles = prev.particles
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            velocityY: p.velocityY + 600 * delta,
            life: p.life - delta,
          }))
          .filter(p => p.life > 0);
        
        // Combo timer
        if (prev.comboTimer > 0) {
          newState.comboTimer = prev.comboTimer - delta;
          if (newState.comboTimer <= 0) {
            newState.combo = 0;
          }
        }
        
        // Check win condition (beat the boss)
        if (newState.player.x >= prev.levelLength - 150 && !bossEnemy) {
          newState.phase = 'victory';
          newState.screenShake = 2;
        }
        
        // Check lose condition
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
  }, [gameState.phase, createParticles, shouldAutoDodge, showSpeechBubble]);

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
