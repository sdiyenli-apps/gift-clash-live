import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Enemy } from '@/types/game';
import arenaBg from '@/assets/arena-bg.jpg';

interface ArenaProps {
  gameState: GameState;
}

const EnemySprite = ({ enemy }: { enemy: Enemy }) => {
  const sizes = {
    basic: 'w-8 h-8',
    fast: 'w-6 h-6',
    tank: 'w-12 h-12',
    boss: 'w-20 h-20',
  };

  const colors = {
    basic: 'bg-neon-orange',
    fast: 'bg-neon-yellow',
    tank: 'bg-neon-purple',
    boss: 'bg-destructive',
  };

  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 2, opacity: 0 }}
      className="absolute"
      style={{
        left: `${enemy.x}%`,
        top: `${enemy.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative">
        <div className={`${sizes[enemy.type]} ${colors[enemy.type]} rounded-full glow-danger animate-pulse-neon`}>
          {enemy.type === 'boss' && (
            <span className="absolute inset-0 flex items-center justify-center text-2xl">👹</span>
          )}
        </div>
        {enemy.type !== 'basic' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-destructive transition-all"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PlayerSprite = ({ player, isChaosMode }: { player: GameState['player']; isChaosMode: boolean }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: isChaosMode ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.3,
        repeat: isChaosMode ? Infinity : 0,
      }}
    >
      <div className="relative">
        {/* Shield effect */}
        {player.shield > 0 && (
          <motion.div
            className="absolute -inset-4 rounded-full border-4 border-secondary opacity-50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ 
              boxShadow: '0 0 20px hsl(var(--secondary) / 0.5)',
            }}
          />
        )}
        
        {/* Player */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center glow-pink">
          <span className="text-3xl">🎮</span>
        </div>
        
        {/* Speed boost indicator */}
        {player.speedMultiplier > 1 && (
          <motion.div
            className="absolute -inset-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-neon-cyan rounded-full" />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-neon-cyan rounded-full" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const Arena = ({ gameState }: ArenaProps) => {
  const { player, enemies, isFrozen, isChaosMode } = gameState;

  return (
    <div 
      className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-primary/30"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-background/40" />
      
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--secondary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--secondary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-30" />

      {/* Frozen overlay */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-secondary/20 z-30 flex items-center justify-center"
          >
            <motion.span
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ❄️
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chaos mode overlay */}
      <AnimatePresence>
        {isChaosMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute inset-0 bg-destructive/20 z-20"
          />
        )}
      </AnimatePresence>

      {/* Enemies */}
      <AnimatePresence>
        {enemies.map(enemy => (
          <EnemySprite key={enemy.id} enemy={enemy} />
        ))}
      </AnimatePresence>

      {/* Player */}
      <PlayerSprite player={player} isChaosMode={isChaosMode} />

      {/* Wave indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="px-6 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border">
          <span className="font-display text-lg text-secondary text-glow-cyan">
            WAVE {gameState.wave}
          </span>
        </div>
      </div>
    </div>
  );
};
