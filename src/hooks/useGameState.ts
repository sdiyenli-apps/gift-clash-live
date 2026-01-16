import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  Gifter, Obstacle, HERO_QUIPS, SpeechBubble, HELP_REQUESTS, BOSS_TAUNTS,
  FlyingRobot
} from '@/types/game';

const GRAVITY = 0; // No gravity - static line
const GROUND_Y = 100; // Fixed Y position for static line (adjusted for 280px arena)
const PLAYER_WIDTH = 64;
const PLAYER_HEIGHT = 80;
const BASE_LEVEL_LENGTH = 2000;
const MAX_WAVES = 1000;
const HELP_REQUEST_DELAY = 8000;

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
  flyingRobots: [],
  chickens: [],
  neonLights: [],
  explosions: [],
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
    
    if (typeRoll > 0.9) {
      enemyType = 'tank';
      width = 60; height = 55; health = 150 * (1 + waveBonus); speed = 20 + wave; damage = 20;
    } else if (typeRoll > 0.8) {
      enemyType = 'mech';
      width = 55; height = 60; health = 80 * (1 + waveBonus); speed = 35 + wave * 2; damage = 15;
    } else if (typeRoll > 0.65) {
      enemyType = 'ninja';
      width = 35; height = 42; health = 30 * (1 + waveBonus * 0.5); speed = 140 + wave * 4; damage = 10;
    } else if (typeRoll > 0.5) {
      enemyType = 'drone';
      width = 32; height = 32; health = 25 * (1 + waveBonus * 0.5); speed = 80 + wave * 2; damage = 6;
    } else if (typeRoll > 0.35) {
      enemyType = 'flyer';
      width = 40; height = 36; health = 35 * (1 + waveBonus * 0.5); speed = 70 + wave * 2; damage = 8;
    } else {
      enemyType = 'robot';
      width = 40; height = 48; health = 40 * (1 + waveBonus); speed = 50 + wave * 2; damage = 8;
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
  
  // DRAGON BOSS at the end
  const isMegaBoss = wave % 10 === 0;
  const bossScale = isMegaBoss ? 1.3 : 1;
  enemies.push({
    id: 'boss-dragon',
    x: levelLength - 400,
    y: GROUND_Y - 40 * bossScale,
    width: 150 * bossScale,
    height: 160 * bossScale,
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
  
  // Simple obstacles (no deadly traps since no jump)
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
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
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
      }));
      showSpeechBubble(`WAVE ${nextWave} BEGINS! 🔥💪`, 'excited');
    }
  }, [gameState.currentWave, showSpeechBubble]);

  // Process the 5 gift actions
  const processGiftAction = useCallback((action: GiftAction, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev, lastGiftTime: Date.now() };
      
      switch (action) {
        case 'move_forward':
          // Move forward toward princess
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
          // Target nearest enemy and shoot
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
            velocityX: 900,
            velocityY: nearbyEnemy ? (targetY - (prev.player.y + PLAYER_HEIGHT / 2)) * 1.5 : 0,
            damage: prev.player.isMagicDashing ? 80 : 30,
            type: prev.player.isMagicDashing ? 'ultra' : 'normal',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true, animationState: 'attack' };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 10, 'muzzle', '#ffff00')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false, animationState: 'idle' } })), 180);
          newState.score += 20;
          
          if (nearbyEnemy) {
            showSpeechBubble(`TARGETING ${nearbyEnemy.type.toUpperCase()}! 🎯`, 'normal');
          } else if (Math.random() > 0.6) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)], 'excited');
          }
          break;
          
        case 'armor':
          // Add shield protection
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + 50),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 20, 'magic', '#00ffff')];
          newState.score += 50;
          newState.screenShake = 0.2;
          showSpeechBubble(`ARMOR UP! +50 SHIELD! 🛡️`, 'excited');
          break;
          
        case 'heal':
          // Heal the player
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + 40),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 15, 'magic', '#00ff00')];
          newState.score += 40;
          showSpeechBubble(`THANKS ${username.toUpperCase()}! HEALED! 💚`, 'normal');
          break;
          
        case 'magic_dash':
          // 6 second auto-play with special effects
          newState.player = {
            ...prev.player,
            isMagicDashing: true,
            magicDashTimer: 6,
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 40, 'ultra', '#ff00ff')];
          newState.score += 300;
          newState.screenShake = 0.6;
          showSpeechBubble("✨ MAGIC DASH ACTIVATED! 6 SECONDS! ✨", 'excited');
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

  // Game loop
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
        
        // Magic Dash auto-actions (6 second ability)
        if (prev.player.isMagicDashing) {
          newState.player = {
            ...newState.player,
            magicDashTimer: prev.player.magicDashTimer - delta,
          };
          
          // Auto move forward
          newState.player.x += 200 * delta;
          newState.player.animationState = 'dash';
          
          // Auto shoot at nearby enemies
          const nearbyEnemies = prev.enemies.filter(e => 
            e.x > prev.player.x && 
            e.x < prev.player.x + 400 && 
            !e.isDying
          );
          
          if (nearbyEnemies.length > 0 && Math.random() > 0.4) {
            const target = nearbyEnemies[0];
            const magicBullet: Projectile = {
              id: `magic-${Date.now()}-${Math.random()}`,
              x: prev.player.x + PLAYER_WIDTH,
              y: target.y + target.height / 2,
              velocityX: 1200,
              velocityY: 0,
              damage: 80,
              type: 'ultra',
            };
            newState.projectiles = [...newState.projectiles, magicBullet];
            newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, magicBullet.y, 10, 'muzzle', '#ff00ff')];
          }
          
          // Magic particles
          if (Math.random() > 0.4) {
            newState.particles = [...newState.particles, ...createParticles(
              prev.player.x + Math.random() * PLAYER_WIDTH, 
              prev.player.y + Math.random() * PLAYER_HEIGHT, 
              3, 'ultra', '#ff00ff'
            )];
          }
          
          if (newState.player.magicDashTimer <= 0) {
            newState.player.isMagicDashing = false;
            newState.player.animationState = 'idle';
            showSpeechBubble("Magic dash ended! 💫", 'normal');
          }
        }
        
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
          .filter(p => p.x < prev.cameraX + 1000);
        
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
                
                // Hit particles
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
                  
                  // Death explosion
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
        
        // Move enemies toward player - PREVENT OVERLAP
        const minSpacing = 50;
        newState.enemies = newState.enemies.map((enemy, idx) => {
          if (enemy.isDying) return enemy;
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          
          // Check if too close to another enemy
          const tooClose = newState.enemies.some((other, otherIdx) => {
            if (otherIdx === idx || other.isDying) return false;
            const dist = Math.abs(enemy.x - other.x);
            return dist < minSpacing && other.x < enemy.x;
          });
          
          const newAnimPhase = (enemy.animationPhase + delta * 6) % (Math.PI * 2);
          
          if (Math.abs(dx) < 400 && !tooClose) {
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta,
              animationPhase: newAnimPhase,
            };
          }
          return { ...enemy, animationPhase: newAnimPhase };
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
        
        // Update particles
        newState.particles = prev.particles
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            velocityY: p.velocityY + 500 * delta,
            life: p.life - delta,
          }))
          .filter(p => p.life > 0);
        
        // Flying robots (background decoration)
        newState.flyingRobots = prev.flyingRobots
          .map(robot => ({ ...robot, x: robot.x + robot.speed * delta }))
          .filter(robot => robot.x - prev.cameraX < 1200);
        
        if (Math.random() > 0.994) {
          const robotTypes: FlyingRobot['type'][] = ['ufo', 'jet', 'satellite'];
          newState.flyingRobots = [...newState.flyingRobots, {
            id: `flybot-${Date.now()}`,
            x: prev.cameraX - 80,
            y: 20 + Math.random() * 60,
            speed: 120 + Math.random() * 150,
            type: robotTypes[Math.floor(Math.random() * robotTypes.length)],
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
