import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Player, Enemy, GiftEvent, GiftAction, GIFT_ACTIONS, Gifter } from '@/types/game';

const INITIAL_PLAYER: Player = {
  health: 100,
  maxHealth: 100,
  shield: 0,
  speedMultiplier: 1,
  x: 50,
  y: 50,
};

const INITIAL_STATE: GameState = {
  phase: 'waiting',
  wave: 0,
  score: 0,
  timeRemaining: 120,
  player: INITIAL_PLAYER,
  enemies: [],
  isFrozen: false,
  isChaosMode: false,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<Gifter[]>([]);
  const [notifications, setNotifications] = useState<GiftEvent[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const spawnEnemy = useCallback((type: Enemy['type'] = 'basic'): Enemy => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    switch (side) {
      case 0: x = Math.random() * 100; y = -5; break;
      case 1: x = 105; y = Math.random() * 100; break;
      case 2: x = Math.random() * 100; y = 105; break;
      case 3: x = -5; y = Math.random() * 100; break;
    }

    const configs = {
      basic: { health: 30, speed: 0.5, damage: 5 },
      fast: { health: 15, speed: 1.2, damage: 3 },
      tank: { health: 100, speed: 0.2, damage: 15 },
      boss: { health: 500, speed: 0.15, damage: 25 },
    };

    const config = configs[type];
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      x, y,
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      damage: config.damage,
      type,
    };
  }, []);

  const spawnWave = useCallback((wave: number) => {
    const enemies: Enemy[] = [];
    const baseCount = 3 + wave * 2;
    
    for (let i = 0; i < baseCount; i++) {
      const rand = Math.random();
      let type: Enemy['type'] = 'basic';
      if (wave > 2 && rand > 0.8) type = 'tank';
      else if (rand > 0.6) type = 'fast';
      enemies.push(spawnEnemy(type));
    }
    
    return enemies;
  }, [spawnEnemy]);

  const startGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      wave: 1,
      enemies: spawnWave(1),
    });
    setGiftEvents([]);
    lastUpdateRef.current = Date.now();
  }, [spawnWave]);

  const processGiftAction = useCallback((action: GiftAction, value: number) => {
    setGameState(prev => {
      if (prev.phase !== 'playing') return prev;
      
      let newState = { ...prev };
      
      switch (action) {
        case 'heal':
          newState.player = {
            ...prev.player,
            health: Math.min(prev.player.maxHealth, prev.player.health + value),
          };
          newState.score += 50;
          break;
          
        case 'shield':
          newState.player = {
            ...prev.player,
            shield: Math.min(100, prev.player.shield + value),
          };
          newState.score += 100;
          break;
          
        case 'speed_boost':
          newState.player = {
            ...prev.player,
            speedMultiplier: 2,
          };
          setTimeout(() => {
            setGameState(s => ({
              ...s,
              player: { ...s.player, speedMultiplier: 1 }
            }));
          }, value * 1000);
          newState.score += 75;
          break;
          
        case 'freeze_time':
          newState.isFrozen = true;
          setTimeout(() => {
            setGameState(s => ({ ...s, isFrozen: false }));
          }, value * 1000);
          newState.score += 150;
          break;
          
        case 'spawn_enemies':
          const newEnemies: Enemy[] = [];
          for (let i = 0; i < value; i++) {
            newEnemies.push(spawnEnemy(Math.random() > 0.5 ? 'fast' : 'basic'));
          }
          newState.enemies = [...prev.enemies, ...newEnemies];
          break;
          
        case 'boss_spawn':
          newState.enemies = [...prev.enemies, spawnEnemy('boss')];
          break;
          
        case 'revive':
          newState.player = {
            ...prev.player,
            health: prev.player.maxHealth,
            shield: 50,
          };
          newState.score += 500;
          break;
          
        case 'nuke':
          newState.enemies = [];
          newState.score += prev.enemies.length * 100;
          break;
          
        case 'chaos_mode':
          newState.isChaosMode = true;
          setTimeout(() => {
            setGameState(s => ({ ...s, isChaosMode: false }));
          }, value * 1000);
          newState.score += 300;
          break;
      }
      
      return newState;
    });
  }, [spawnEnemy]);

  const handleGift = useCallback((event: GiftEvent) => {
    setGiftEvents(prev => [event, ...prev].slice(0, 50));
    setNotifications(prev => [event, ...prev].slice(0, 5));
    
    // Update leaderboard
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
    
    // Get random action for gift tier
    const actions = GIFT_ACTIONS[event.gift.tier];
    const actionConfig = actions[Math.floor(Math.random() * actions.length)];
    processGiftAction(actionConfig.action, actionConfig.value);
    
    // Remove notification after delay
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== event.id));
    }, 4000);
  }, [processGiftAction]);

  // Game loop
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const gameLoop = () => {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setGameState(prev => {
        if (prev.phase !== 'playing' || prev.isFrozen) return prev;

        let newState = { ...prev };
        
        // Drain health over time (pressure mechanic)
        const drainRate = prev.isChaosMode ? 3 : 1;
        newState.player = {
          ...prev.player,
          health: Math.max(0, prev.player.health - drainRate * delta),
        };

        // Move enemies toward player
        const chaosSpeed = prev.isChaosMode ? 1.5 : 1;
        newState.enemies = prev.enemies.map(enemy => {
          const dx = prev.player.x - enemy.x;
          const dy = prev.player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 5) {
            // Enemy reached player, deal damage
            const damage = enemy.damage;
            if (newState.player.shield > 0) {
              const shieldDamage = Math.min(newState.player.shield, damage);
              newState.player.shield -= shieldDamage;
              newState.player.health -= (damage - shieldDamage);
            } else {
              newState.player.health -= damage;
            }
            return { ...enemy, health: 0 }; // Remove enemy
          }
          
          return {
            ...enemy,
            x: enemy.x + (dx / dist) * enemy.speed * chaosSpeed * delta * 30,
            y: enemy.y + (dy / dist) * enemy.speed * chaosSpeed * delta * 30,
          };
        }).filter(e => e.health > 0);

        // Update timer
        newState.timeRemaining = Math.max(0, prev.timeRemaining - delta);

        // Check win/lose conditions
        if (newState.player.health <= 0) {
          newState.phase = 'gameover';
        } else if (newState.enemies.length === 0 && prev.enemies.length > 0) {
          // Wave cleared
          if (prev.wave >= 10) {
            newState.phase = 'victory';
          } else {
            newState.wave = prev.wave + 1;
            newState.enemies = spawnWave(prev.wave + 1);
            newState.score += 200 * prev.wave;
          }
        }

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.phase, spawnWave]);

  return {
    gameState,
    giftEvents,
    leaderboard,
    notifications,
    startGame,
    handleGift,
  };
};
