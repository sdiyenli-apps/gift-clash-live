import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot, NeonLight, Explosion, Chicken
} from '@/types/game';

const GRAVITY = 0;
const GROUND_Y = 100;
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 80;
const BASE_LEVEL_LENGTH = 6000;
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;
const ARMOR_DURATION = 5; // 5 seconds armor
const KILL_RADIUS = 80; // Enemies die if within this radius of hero
const ENEMY_MIN_DISTANCE = 100; // Enemies can only get this close to hero
const BOSS_FIREBALL_INTERVAL = 5; // Boss shoots every 5 seconds
const BOSS_MEGA_ATTACK_THRESHOLD = 0.3; // 30% health triggers mega attack

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
};

const generateLevel = (wave: number): { enemies: Enemy[], obstacles: Obstacle[], levelLength: number } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  const levelLength = Math.min(BASE_LEVEL_LENGTH * Math.pow(1.4, wave - 1), 40000);
  const enemyDensity = 180 + Math.max(0, 50 - wave * 3);
  
  for (let x = 300; x < levelLength - 600; x += enemyDensity + Math.random() * 80) {
    const typeRoll = Math.random();
    const waveBonus = Math.min(wave * 0.1, 2);
    let enemyType: Enemy['type'];
    let width: number, height: number, health: number, speed: number, damage: number;
    
    // Bigger enemy sizes
    if (typeRoll > 0.9) {
      enemyType = 'tank';
      width = 80; height = 75; health = 150 * (1 + waveBonus); speed = 20 + wave; damage = 20;
    } else if (typeRoll > 0.8) {
      enemyType = 'mech';
      width = 75; height = 80; health = 80 * (1 + waveBonus); speed = 35 + wave * 2; damage = 15;
    } else if (typeRoll > 0.65) {
      enemyType = 'ninja';
      width = 55; height = 62; health = 30 * (1 + waveBonus * 0.5); speed = 140 + wave * 4; damage = 10;
    } else if (typeRoll > 0.5) {
      enemyType = 'drone';
      width = 52; height = 52; health = 25 * (1 + waveBonus * 0.5); speed = 80 + wave * 2; damage = 6;
    } else if (typeRoll > 0.35) {
      enemyType = 'flyer';
      width = 60; height = 56; health = 35 * (1 + waveBonus * 0.5); speed = 70 + wave * 2; damage = 8;
    } else {
      enemyType = 'robot';
      width = 60; height = 68; health = 40 * (1 + waveBonus); speed = 50 + wave * 2; damage = 8;
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
  
  // DRAGON BOSS at the end - optimized size for visibility
  const isMegaBoss = wave % 10 === 0;
  const bossScale = isMegaBoss ? 1.0 : 0.85;
  enemies.push({
    id: 'boss-dragon',
    x: levelLength - 400,
    y: GROUND_Y - 20 * bossScale,
    width: 140 * bossScale,
    height: 140 * bossScale,
    health: (1200 + wave * 150) * bossScale,
    maxHealth: (1200 + wave * 150) * bossScale,
    speed: 30 + wave,
    damage: 30 + wave * 2,
    type: 'boss',
    isDying: false,
    deathTimer: 0,
    attackCooldown: 0,
    animationPhase: 0,
  });
  
  // Simple obstacles
  for (let x = 400; x < levelLength - 800; x += 300 + Math.random() * 200) {
    if (Math.random() > 0.6) {
      obstacles.push({
        id: `crate-${x}`,
        x,
        y: GROUND_Y,
        width: 40,
        height: 40,
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
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: `particle-${Date.now()}-${Math.random()}`,
        x,
        y,
        velocityX: (Math.random() - 0.5) * 400,
        velocityY: (Math.random() - 0.8) * 400,
        color: color || colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 8,
        life: 0.3 + Math.random() * 0.5,
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
    showSpeechBubble(`WAVE ${wave}! LET'S SAVE THE PRINCESS! 🔥`, 'excited');
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
      }));
      showSpeechBubble(`WAVE ${nextWave} BEGINS! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Create chickens for magic dash (returns array, doesn't set state)
  const createChickens = (playerX: number): Chicken[] => {
    const newChickens: Chicken[] = [];
    for (let i = 0; i < 5; i++) {
      newChickens.push({
        id: `chicken-${Date.now()}-${i}`,
        x: playerX + (Math.random() - 0.5) * 300,
        y: GROUND_Y,
        state: 'appearing',
        timer: 3,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    return newChickens;
  };

  // Process the 5 gift actions only
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          newState.player = {
            ...prev.player,
            x: prev.player.x + 60,
            animationState: 'run',
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT/2, 6, 'dash', '#00ffff')];
          newState.score += 10;
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 200);
          break;
          
        case 'shoot':
          const nearbyEnemy = prev.enemies
            .filter(e => !e.isDying && e.x > prev.player.x && e.x < prev.player.x + 600)
            .sort((a, b) => a.x - b.x)[0];
          
          const targetY = nearbyEnemy 
            ? nearbyEnemy.y + nearbyEnemy.height / 2 
            : prev.player.y + PLAYER_HEIGHT / 2;
          
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2,
            velocityX: 1200,
            velocityY: nearbyEnemy ? (targetY - (prev.player.y + PLAYER_HEIGHT / 2)) * 2 : 0,
            damage: prev.player.isMagicDashing ? 100 : 40,
            type: prev.player.isMagicDashing ? 'ultra' : 'mega', // More visual laser
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 15, 'muzzle', '#ffff00')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 180);
          newState.score += 20;
          
          if (nearbyEnemy) {
            showSpeechBubble(`TARGETING ${nearbyEnemy.type.toUpperCase()}! 🎯`, 'normal');
          } else if (Math.random() > 0.6) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
          }
          break;
          
        case 'armor':
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + 50),
          };
          newState.armorTimer = ARMOR_DURATION; // 5 second armor
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 20, 'magic', '#00ffff')];
          newState.score += 50;
          newState.screenShake = 0.2;
          showSpeechBubble(`ARMOR UP! 5 SEC SHIELD! 🛡️`, 'excited');
          break;
          
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + 40),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 15, 'magic', '#00ff00')];
          newState.score += 40;
          showSpeechBubble(`THANKS ${username.toUpperCase()}! HEALED! 💚`, 'normal');
          break;
          
        case 'magic_dash':
          newState.player = {
            ...prev.player,
            isMagicDashing: true,
            magicDashTimer: 6,
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 40, 'ultra', '#ff00ff')];
          newState.score += 300;
          newState.screenShake = 0.6;
          // Spawn funny chickens inline!
          newState.chickens = [...prev.chickens, ...createChickens(prev.player.x)];
          showSpeechBubble("✨ MAGIC DASH + CHICKENS! 🐔✨", 'excited');
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

  // Main Game loop - optimized
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
        newState.isBossFight = bossEnemy !== undefined && prev.player.x > prev.levelLength - 600;
        
        // Boss taunt
        if (newState.isBossFight && !prev.isBossFight) {
          showSpeechBubble(BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)], 'urgent');
        }
        
        // Boss fireball attack every 6 seconds
        if (bossEnemy && newState.isBossFight) {
          newState.bossFireballTimer -= delta;
          
          if (newState.bossFireballTimer <= 0) {
            // Spawn fireball
            const fireball: Fireball = {
              id: `fireball-${Date.now()}`,
              x: bossEnemy.x,
              y: bossEnemy.y + bossEnemy.height / 2,
              velocityX: -400,
              velocityY: (prev.player.y - bossEnemy.y) * 0.5,
              damage: 10, // 10% of hero life
            };
            newState.fireballs = [...newState.fireballs, fireball];
            newState.bossFireballTimer = BOSS_FIREBALL_INTERVAL;
            showSpeechBubble("🔥 FIREBALL INCOMING! 🔥", 'urgent');
          }
          
          // Boss mega attack at 30% health
          const bossHealthPercent = bossEnemy.health / bossEnemy.maxHealth;
          if (bossHealthPercent <= BOSS_MEGA_ATTACK_THRESHOLD && !newState.bossMegaAttackUsed) {
            newState.bossMegaAttackUsed = true;
            newState.player.health = Math.max(1, newState.player.health - 60); // 60% damage
            newState.redFlash = 1.5; // Flash screen red
            newState.screenShake = 2;
            showSpeechBubble("💀 MEGA ATTACK! 60% DAMAGE! 💀", 'urgent');
          }
        }
        
        // Update fireballs
        newState.fireballs = newState.fireballs
          .map(f => ({ ...f, x: f.x + f.velocityX * delta, y: f.y + f.velocityY * delta }))
          .filter(f => f.x > prev.cameraX - 100);
        
        // Fireball-player collision
        newState.fireballs.forEach(fireball => {
          if (
            fireball.x < prev.player.x + PLAYER_WIDTH &&
            fireball.x + 30 > prev.player.x &&
            fireball.y < prev.player.y + PLAYER_HEIGHT &&
            fireball.y + 30 > prev.player.y
          ) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - 30);
            } else {
              newState.player.health -= fireball.damage;
              newState.player.animationState = 'hurt';
            }
            newState.fireballs = newState.fireballs.filter(f => f.id !== fireball.id);
            newState.particles = [...newState.particles, ...createParticles(fireball.x, fireball.y, 20, 'explosion', '#ff4400')];
            newState.screenShake = 0.5;
          }
        });
        
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
        
        // Magic Dash auto-actions (6 second ability with auto-shoot)
        if (prev.player.isMagicDashing) {
          newState.player = {
            ...newState.player,
            magicDashTimer: prev.player.magicDashTimer - delta,
            isShooting: true,
          };
          
          newState.player.x += 250 * delta;
          newState.player.animationState = 'dash';
          
          // Auto shoot at nearby enemies rapidly
          const nearbyEnemies = prev.enemies
            .filter(e => e.x > prev.player.x && e.x < prev.player.x + 600 && !e.isDying)
            .sort((a, b) => a.x - b.x);
          
          if (nearbyEnemies.length > 0 && Math.random() > 0.15) {
            const target = nearbyEnemies[0];
            const targetY = target.y + target.height / 2;
            const playerY = newState.player.y + PLAYER_HEIGHT / 2;
            
            const magicBullet: Projectile = {
              id: `magic-${Date.now()}-${Math.random()}`,
              x: newState.player.x + PLAYER_WIDTH,
              y: playerY,
              velocityX: 1600,
              velocityY: (targetY - playerY) * 2.5,
              damage: 120,
              type: 'ultra',
            };
            newState.projectiles = [...newState.projectiles, magicBullet];
            newState.particles = [...newState.particles, ...createParticles(newState.player.x + PLAYER_WIDTH, playerY, 12, 'muzzle', '#ff00ff')];
          }
          
          // Magic particles trail
          if (Math.random() > 0.25) {
            newState.particles = [...newState.particles, ...createParticles(
              newState.player.x + Math.random() * PLAYER_WIDTH, 
              newState.player.y + Math.random() * PLAYER_HEIGHT, 
              5, 'ultra', '#ff00ff'
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
          newState.screenShake = Math.max(0, prev.screenShake - delta * 3);
        }
        
        // Update camera smoothly
        const targetCameraX = Math.max(0, newState.player.x - 150);
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
        
        // Update enemy lasers
        newState.enemyLasers = prev.enemyLasers
          .map(p => ({ 
            ...p, 
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
          }))
          .filter(p => p.x > prev.cameraX - 100);
        
        // Enemy laser-player collision
        newState.enemyLasers.forEach(laser => {
          if (
            laser.x < prev.player.x + PLAYER_WIDTH &&
            laser.x + 15 > prev.player.x &&
            laser.y < prev.player.y + PLAYER_HEIGHT &&
            laser.y + 8 > prev.player.y
          ) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - laser.damage);
            } else {
              newState.player.health -= laser.damage;
              newState.player.animationState = 'hurt';
            }
            newState.enemyLasers = newState.enemyLasers.filter(l => l.id !== laser.id);
            newState.particles = [...newState.particles, ...createParticles(laser.x, laser.y, 8, 'spark', '#ff0000')];
          }
        });
        
        // Projectile-enemy collisions
        const hitProjectiles = new Set<string>();
        
        newState.projectiles.forEach(proj => {
          newState.enemies.forEach(enemy => {
            if (hitProjectiles.has(proj.id) || enemy.isDying) return;
            
            if (
              proj.x < enemy.x + enemy.width &&
              proj.x + 15 > enemy.x &&
              proj.y < enemy.y + enemy.height &&
              proj.y + 8 > enemy.y
            ) {
              hitProjectiles.add(proj.id);
              
              const enemyIdx = newState.enemies.findIndex(e => e.id === enemy.id);
              if (enemyIdx !== -1) {
                newState.enemies[enemyIdx] = {
                  ...newState.enemies[enemyIdx],
                  health: newState.enemies[enemyIdx].health - proj.damage,
                };
                
                newState.particles = [...newState.particles, ...createParticles(
                  proj.x, proj.y, proj.type === 'ultra' ? 20 : 10, 'spark', 
                  proj.type === 'ultra' ? '#ff00ff' : '#ffff00'
                )];
                
                newState.screenShake = Math.max(newState.screenShake, 0.12);
                
                if (newState.enemies[enemyIdx].health <= 0) {
                  newState.enemies[enemyIdx].isDying = true;
                  newState.enemies[enemyIdx].deathTimer = 0.5;
                  
                  const scoreMap: Record<string, number> = { boss: 1500, tank: 250, mech: 150, ninja: 80, robot: 50, drone: 40, flyer: 60 };
                  newState.score += scoreMap[enemy.type] || 50;
                  newState.combo++;
                  newState.comboTimer = 2;
                  newState.killStreak++;
                  
                  newState.particles = [...newState.particles, ...createParticles(
                    enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                    enemy.type === 'boss' ? 60 : 30, 'death', '#ff4400'
                  )];
                  
                  newState.screenShake = enemy.type === 'boss' ? 1.2 : 0.3;
                  
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
        
        // Kill enemies automatically if near hero (within KILL_RADIUS)
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying || enemy.type === 'boss') return enemy;
          
          const distToHero = Math.abs(enemy.x - prev.player.x);
          if (distToHero < KILL_RADIUS) {
            // Auto-kill nearby enemy
            newState.particles = [...newState.particles, ...createParticles(
              enemy.x + enemy.width/2, enemy.y + enemy.height/2, 20, 'death', '#ff4400'
            )];
            newState.score += 30;
            return { ...enemy, isDying: true, deathTimer: 0.5 };
          }
          return enemy;
        });
        
        // Move enemies toward player - keep distance, shoot lasers
        const minSpacing = 80;
        newState.enemies = newState.enemies.map((enemy, idx) => {
          if (enemy.isDying) return enemy;
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          
          // Push enemy in front of player if behind
          if (enemy.x < prev.player.x - 10) {
            return { 
              ...enemy, 
              x: prev.player.x + PLAYER_WIDTH + 50 + Math.random() * 50,
              animationPhase: (enemy.animationPhase + delta * 6) % (Math.PI * 2),
            };
          }
          
          // Check if too close to another enemy
          const tooClose = newState.enemies.some((other, otherIdx) => {
            if (otherIdx === idx || other.isDying) return false;
            const dist = Math.abs(enemy.x - other.x);
            return dist < minSpacing && other.x < enemy.x;
          });
          
          // Enemies stop at ENEMY_MIN_DISTANCE from hero
          const reachedMinDistance = enemy.x <= prev.player.x + ENEMY_MIN_DISTANCE;
          
          const newAnimPhase = (enemy.animationPhase + delta * 6) % (Math.PI * 2);
          
          // Enemy shooting - only if close enough and random chance
          if (reachedMinDistance && enemy.attackCooldown <= 0 && Math.random() > 0.97) {
            const enemyLaser: Projectile = {
              id: `elaser-${Date.now()}-${Math.random()}`,
              x: enemy.x - 10,
              y: enemy.y + enemy.height / 2,
              velocityX: -350,
              velocityY: (prev.player.y + PLAYER_HEIGHT / 2 - enemy.y - enemy.height / 2) * 0.5,
              damage: 5,
              type: 'normal',
            };
            newState.enemyLasers = [...newState.enemyLasers, enemyLaser];
            return { ...enemy, attackCooldown: 2 + Math.random() * 2, animationPhase: newAnimPhase };
          }
          
          if (Math.abs(dx) < 600 && !tooClose && !reachedMinDistance) {
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
            prev.player.x < enemy.x + enemy.width - 8 &&
            prev.player.x + PLAYER_WIDTH - 8 > enemy.x &&
            prev.player.y < enemy.y + enemy.height &&
            prev.player.y + PLAYER_HEIGHT > enemy.y
          ) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage);
              newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y + PLAYER_HEIGHT/2, 8, 'spark', '#00ffff')];
            } else {
              newState.player.health -= enemy.damage * delta * 2;
              newState.player.animationState = 'hurt';
              setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, animationState: 'idle' } })), 180);
            }
            newState.combo = 0;
            newState.killStreak = 0;
          }
        });
        
        // Update particles - limit count for performance
        newState.particles = prev.particles
          .slice(0, 100) // Limit particles
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            velocityY: p.velocityY + 500 * delta,
            life: p.life - delta,
          }))
          .filter(p => p.life > 0);
        
        // Flying robots (background decoration) - reduced spawn rate
        newState.flyingRobots = prev.flyingRobots
          .map(robot => ({ ...robot, x: robot.x + robot.speed * delta }))
          .filter(robot => robot.x - prev.cameraX < 1200);
        
        if (Math.random() > 0.995) {
          const robotTypes: FlyingRobot['type'][] = ['ufo', 'jet', 'satellite'];
          newState.flyingRobots = [...newState.flyingRobots, {
            id: `flybot-${Date.now()}`,
            x: prev.cameraX - 80,
            y: 20 + Math.random() * 60,
            speed: 120 + Math.random() * 150,
            type: robotTypes[Math.floor(Math.random() * robotTypes.length)],
          }];
        }
        
        // Dynamic neon lights - reduced for performance
        newState.neonLights = prev.neonLights.filter(light => light.x - prev.cameraX < 1200).slice(0, 10);
        
        if (Math.random() > 0.96) {
          const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0088', '#00ff88', '#8800ff'];
          newState.neonLights = [...newState.neonLights, {
            id: `neon-${Date.now()}-${Math.random()}`,
            x: prev.cameraX + Math.random() * 800,
            y: 30 + Math.random() * 150,
            size: 10 + Math.random() * 30,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 100 + Math.random() * 100,
          }];
        }
        
        // Random explosions - reduced for performance
        newState.explosions = prev.explosions
          .filter(exp => exp.timer > 0)
          .map(exp => ({ ...exp, timer: exp.timer - delta }))
          .slice(0, 5);
        
        if (Math.random() > 0.97) {
          newState.explosions = [...newState.explosions, {
            id: `exp-${Date.now()}-${Math.random()}`,
            x: prev.cameraX + 100 + Math.random() * 700,
            y: 40 + Math.random() * 120,
            size: 30 + Math.random() * 50,
            timer: 0.6,
          }];
        }
        
        // Combo timer
        if (prev.comboTimer > 0) {
          newState.comboTimer = prev.comboTimer - delta;
          if (newState.comboTimer <= 0) newState.combo = 0;
        }
        
        // Win condition - REACH THE PRINCESS
        const princessX = prev.levelLength - 80;
        if (newState.player.x >= princessX - 40 && !bossEnemy) {
          newState.phase = 'victory';
          newState.screenShake = 1.5;
          showSpeechBubble("PRINCESS! YOUR HERO IS HERE! 💖👑", 'excited');
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
