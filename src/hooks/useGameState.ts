import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, Player, Enemy, Projectile, Particle, GiftEvent, GiftAction, 
  GIFT_ACTIONS, Gifter, Obstacle, HERO_QUIPS, SpeechBubble 
} from '@/types/game';

const GRAVITY = 1800;
const JUMP_VELOCITY = -600;
const GROUND_Y = 380;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;
const LEVEL_LENGTH = 8000;

const INITIAL_PLAYER: Player = {
  health: 100,
  maxHealth: 100,
  shield: 0,
  x: 100,
  y: GROUND_Y,
  velocityY: 0,
  isGrounded: true,
  isJumping: false,
  isShooting: false,
  facingRight: true,
  speedMultiplier: 1,
};

const INITIAL_STATE: GameState = {
  phase: 'waiting',
  score: 0,
  distance: 0,
  levelLength: LEVEL_LENGTH,
  cameraX: 0,
  player: INITIAL_PLAYER,
  enemies: [],
  projectiles: [],
  obstacles: [],
  particles: [],
  speechBubble: null,
  isUltraMode: false,
  ultraModeTimer: 0,
  isFrozen: false,
  combo: 0,
  comboTimer: 0,
};

const generateLevel = (): { enemies: Enemy[], obstacles: Obstacle[] } => {
  const enemies: Enemy[] = [];
  const obstacles: Obstacle[] = [];
  
  // Generate enemies throughout the level
  for (let x = 400; x < LEVEL_LENGTH - 500; x += 250 + Math.random() * 300) {
    const type = Math.random();
    let enemyType: Enemy['type'] = 'robot';
    let width = 48, height = 56, health = 40, speed = 80;
    
    if (type > 0.85) {
      enemyType = 'mech';
      width = 72; height = 80; health = 120; speed = 40;
    } else if (type > 0.6) {
      enemyType = 'drone';
      width = 40; height = 40; health = 25; speed = 120;
    }
    
    enemies.push({
      id: `enemy-${x}-${Math.random()}`,
      x,
      y: enemyType === 'drone' ? GROUND_Y - 100 - Math.random() * 60 : GROUND_Y,
      width,
      height,
      health,
      maxHealth: health,
      speed,
      damage: enemyType === 'mech' ? 20 : 10,
      type: enemyType,
      isDying: false,
      deathTimer: 0,
    });
  }
  
  // Add a boss near the end
  enemies.push({
    id: 'boss-final',
    x: LEVEL_LENGTH - 400,
    y: GROUND_Y - 20,
    width: 120,
    height: 140,
    health: 500,
    maxHealth: 500,
    speed: 30,
    damage: 30,
    type: 'boss',
    isDying: false,
    deathTimer: 0,
  });
  
  // Generate platforms
  for (let x = 500; x < LEVEL_LENGTH - 800; x += 400 + Math.random() * 500) {
    if (Math.random() > 0.4) {
      obstacles.push({
        id: `platform-${x}`,
        x,
        y: GROUND_Y - 80 - Math.random() * 100,
        width: 120 + Math.random() * 80,
        height: 20,
        type: 'platform',
      });
    }
  }
  
  return { enemies, obstacles };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Gifter[]>([]);
  const [notifications, setNotifications] = useState<GiftEvent[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const ultraModeActionsRef = useRef<number>(0);

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
        size: 4 + Math.random() * 8,
        life: 0.5 + Math.random() * 0.5,
        type,
      });
    }
    return particles;
  }, []);

  const showSpeechBubble = useCallback((text: string) => {
    const bubble: SpeechBubble = {
      id: `speech-${Date.now()}`,
      text,
      timestamp: Date.now(),
    };
    setGameState(prev => ({ ...prev, speechBubble: bubble }));
    setTimeout(() => {
      setGameState(prev => prev.speechBubble?.id === bubble.id ? { ...prev, speechBubble: null } : prev);
    }, 2500);
  }, []);

  const spawnEnemy = useCallback((atX?: number): Enemy => {
    const x = atX ?? gameState.player.x + 600 + Math.random() * 200;
    const types: Enemy['type'][] = ['robot', 'drone', 'mech'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const configs = {
      robot: { width: 48, height: 56, health: 40, speed: 80, damage: 10 },
      drone: { width: 40, height: 40, health: 25, speed: 120, damage: 8 },
      mech: { width: 72, height: 80, health: 120, speed: 40, damage: 20 },
      boss: { width: 120, height: 140, health: 500, speed: 30, damage: 30 },
    };
    
    const config = configs[type];
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      x,
      y: type === 'drone' ? GROUND_Y - 100 : GROUND_Y,
      ...config,
      maxHealth: config.health,
      type,
      isDying: false,
      deathTimer: 0,
    };
  }, [gameState.player.x]);

  const startGame = useCallback(() => {
    const { enemies, obstacles } = generateLevel();
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      enemies,
      obstacles,
    });
    setGiftEvents([]);
    lastUpdateRef.current = Date.now();
    showSpeechBubble("Time to save the princess! 🎮");
  }, [showSpeechBubble]);

  const processGiftAction = useCallback((action: GiftAction, value: number, username: string) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev };
      
      switch (action) {
        case 'move_forward':
          newState.player = {
            ...prev.player,
            x: prev.player.x + value,
          };
          newState.score += 10;
          break;
          
        case 'jump':
          if (prev.player.isGrounded) {
            newState.player = {
              ...prev.player,
              velocityY: JUMP_VELOCITY,
              isGrounded: false,
              isJumping: true,
            };
            newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT, 8, 'spark', '#00ffff')];
          }
          newState.score += 20;
          break;
          
        case 'double_jump':
          newState.player = {
            ...prev.player,
            velocityY: JUMP_VELOCITY * 1.3,
            isGrounded: false,
            isJumping: true,
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y + PLAYER_HEIGHT, 15, 'spark', '#ff00ff')];
          newState.score += 50;
          break;
          
        case 'shoot':
          const bullet: Projectile = {
            id: `proj-${Date.now()}-${Math.random()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2 - 10,
            velocityX: 800,
            damage: value,
            type: 'normal',
          };
          newState.projectiles = [...prev.projectiles, bullet];
          newState.player = { ...prev.player, isShooting: true };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2 - 10, 5, 'muzzle', '#ffff00')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false } })), 150);
          newState.score += 15;
          
          if (Math.random() > 0.7) {
            showSpeechBubble(HERO_QUIPS[Math.floor(Math.random() * HERO_QUIPS.length)]);
          }
          break;
          
        case 'mega_shot':
          const megaBullet: Projectile = {
            id: `mega-${Date.now()}`,
            x: prev.player.x + PLAYER_WIDTH,
            y: prev.player.y + PLAYER_HEIGHT / 2 - 15,
            velocityX: 1000,
            damage: value,
            type: 'mega',
          };
          newState.projectiles = [...prev.projectiles, megaBullet];
          newState.player = { ...prev.player, isShooting: true };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, prev.player.y + PLAYER_HEIGHT / 2, 20, 'muzzle', '#ff00ff')];
          setTimeout(() => setGameState(s => ({ ...s, player: { ...s.player, isShooting: false } })), 200);
          newState.score += 100;
          showSpeechBubble("MEGA BLAST! 💥");
          break;
          
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + value),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 15, 'spark', '#00ff00')];
          newState.score += 50;
          showSpeechBubble("Thanks " + username + "! 💚");
          break;
          
        case 'shield':
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + value),
          };
          newState.particles = [...prev.particles, ...createParticles(prev.player.x + PLAYER_WIDTH/2, prev.player.y, 20, 'spark', '#00ffff')];
          newState.score += 200;
          showSpeechBubble("I'm INVINCIBLE! 🛡️");
          break;
          
        case 'spawn_enemy':
          newState.enemies = [...prev.enemies, spawnEnemy()];
          showSpeechBubble("More robots?! Bring it on!");
          break;
          
        case 'ultra_mode':
          newState.isUltraMode = true;
          newState.ultraModeTimer = value;
          ultraModeActionsRef.current = 0;
          newState.particles = [...prev.particles, ...createParticles(prev.player.x, prev.player.y, 50, 'ultra', '#ff00ff')];
          newState.score += 500;
          showSpeechBubble("ULTRA MODE ACTIVATED! 🔥💀🔥");
          break;
          
        case 'nuke':
          const nukeParticles: Particle[] = [];
          prev.enemies.forEach(enemy => {
            nukeParticles.push(...createParticles(enemy.x, enemy.y, 20, 'explosion', '#ff4400'));
          });
          newState.enemies = prev.enemies.map(e => ({ ...e, isDying: true, health: 0 }));
          newState.particles = [...prev.particles, ...nukeParticles];
          newState.score += prev.enemies.length * 100;
          showSpeechBubble("KABOOOOM! 💣💥");
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
    
    const actions = GIFT_ACTIONS[event.gift.tier];
    const actionConfig = actions[Math.floor(Math.random() * actions.length)];
    processGiftAction(actionConfig.action, actionConfig.value, event.username);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== event.id));
    }, 4000);
  }, [processGiftAction]);

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
        
        // Ultra mode auto-actions
        if (prev.isUltraMode) {
          newState.ultraModeTimer -= delta;
          
          // Auto move forward fast
          newState.player = {
            ...newState.player,
            x: newState.player.x + 400 * delta,
          };
          
          // Auto jump over gaps/obstacles
          if (newState.player.isGrounded && Math.random() > 0.85) {
            newState.player.velocityY = JUMP_VELOCITY;
            newState.player.isGrounded = false;
          }
          
          // Auto shoot at nearby enemies
          const nearbyEnemy = prev.enemies.find(e => 
            e.x > prev.player.x && 
            e.x < prev.player.x + 500 && 
            !e.isDying
          );
          
          if (nearbyEnemy && Math.random() > 0.7) {
            const ultraBullet: Projectile = {
              id: `ultra-${Date.now()}-${Math.random()}`,
              x: prev.player.x + PLAYER_WIDTH,
              y: nearbyEnemy.y + nearbyEnemy.height / 2,
              velocityX: 1200,
              damage: 100,
              type: 'ultra',
            };
            newState.projectiles = [...newState.projectiles, ultraBullet];
            newState.particles = [...newState.particles, ...createParticles(prev.player.x + PLAYER_WIDTH, ultraBullet.y, 15, 'muzzle', '#ff00ff')];
          }
          
          // Add ultra particles
          if (Math.random() > 0.5) {
            newState.particles = [...newState.particles, ...createParticles(
              prev.player.x + Math.random() * PLAYER_WIDTH, 
              prev.player.y + Math.random() * PLAYER_HEIGHT, 
              3, 'ultra', '#ff00ff'
            )];
          }
          
          if (newState.ultraModeTimer <= 0) {
            newState.isUltraMode = false;
          }
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
          }
        }
        
        // Update camera
        const targetCameraX = Math.max(0, newState.player.x - 200);
        newState.cameraX = targetCameraX;
        newState.distance = newState.player.x;
        
        // Update projectiles
        newState.projectiles = prev.projectiles
          .map(p => ({ ...p, x: p.x + p.velocityX * delta }))
          .filter(p => p.x < prev.cameraX + 1000);
        
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
                  proj.x, proj.y, proj.type === 'ultra' ? 25 : 10, 'spark', 
                  proj.type === 'ultra' ? '#ff00ff' : '#ffff00'
                )];
                
                if (newState.enemies[enemyIdx].health <= 0) {
                  newState.enemies[enemyIdx].isDying = true;
                  newState.enemies[enemyIdx].deathTimer = 0.5;
                  newState.score += enemy.type === 'boss' ? 1000 : enemy.type === 'mech' ? 200 : 50;
                  newState.combo++;
                  newState.comboTimer = 2;
                  
                  // Death explosion
                  newState.particles = [...newState.particles, ...createParticles(
                    enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                    30, 'death', '#ff4400'
                  )];
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
        
        // Move enemies toward player
        newState.enemies = newState.enemies.map(enemy => {
          if (enemy.isDying) return enemy;
          
          const dx = prev.player.x - enemy.x;
          const direction = dx > 0 ? 1 : -1;
          
          // Only chase if player is nearby
          if (Math.abs(dx) < 400) {
            return {
              ...enemy,
              x: enemy.x + direction * enemy.speed * delta,
            };
          }
          return enemy;
        });
        
        // Player-enemy collision
        newState.enemies.forEach(enemy => {
          if (enemy.isDying) return;
          
          if (
            prev.player.x < enemy.x + enemy.width &&
            prev.player.x + PLAYER_WIDTH > enemy.x &&
            prev.player.y < enemy.y + enemy.height &&
            prev.player.y + PLAYER_HEIGHT > enemy.y
          ) {
            if (newState.player.shield > 0) {
              newState.player.shield = Math.max(0, newState.player.shield - enemy.damage);
            } else {
              newState.player.health -= enemy.damage * delta * 2;
            }
            newState.combo = 0;
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
        
        // Combo timer
        if (prev.comboTimer > 0) {
          newState.comboTimer = prev.comboTimer - delta;
          if (newState.comboTimer <= 0) {
            newState.combo = 0;
          }
        }
        
        // Check win condition
        if (newState.player.x >= LEVEL_LENGTH - 200) {
          newState.phase = 'victory';
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
  }, [gameState.phase, createParticles]);

  return {
    gameState,
    giftEvents,
    leaderboard,
    notifications,
    startGame,
    handleGift,
  };
};
