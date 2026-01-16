import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameOverlayProps {
  phase: GameState['phase'];
  score: number;
  wave: number;
  onStart: () => void;
}

export const GameOverlay = ({ phase, score, wave, onStart }: GameOverlayProps) => {
  if (phase === 'playing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="text-center space-y-6 p-8"
        >
          {phase === 'waiting' && (
            <>
              <motion.h1
                className="font-display text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-purple to-secondary"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                GIFT ARENA
              </motion.h1>
              
              <p className="text-xl text-muted-foreground max-w-md mx-auto">
                Viewers control the game with TikTok gifts!
                <br />
                <span className="text-neon-green">Help</span> or <span className="text-destructive">Sabotage</span> the streamer!
              </p>

              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="px-4 py-2 bg-card rounded-lg border border-border">
                  <span className="text-neon-cyan">🌹 Small</span> = Minor boosts
                </div>
                <div className="px-4 py-2 bg-card rounded-lg border border-border">
                  <span className="text-neon-purple">💗 Medium</span> = Power ups
                </div>
                <div className="px-4 py-2 bg-card rounded-lg border border-border">
                  <span className="text-neon-yellow">🌌 Large</span> = GAME CHANGERS
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-display text-xl px-12 py-6 bg-gradient-to-r from-primary to-neon-purple hover:from-primary/90 hover:to-neon-purple/90 glow-pink"
                >
                  START GAME
                </Button>
              </motion.div>

              <p className="text-xs text-muted-foreground">
                Demo mode: Click gifts on the right panel to simulate TikTok Live
              </p>
            </>
          )}

          {phase === 'gameover' && (
            <>
              <motion.h1
                className="font-display text-6xl text-destructive"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                GAME OVER
              </motion.h1>
              
              <p className="text-2xl text-muted-foreground">
                The chat couldn't save you in time...
              </p>

              <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                <div className="bg-card p-4 rounded-xl border border-border">
                  <div className="text-sm text-muted-foreground">FINAL SCORE</div>
                  <div className="font-display text-3xl text-neon-yellow">{score.toLocaleString()}</div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                  <div className="text-sm text-muted-foreground">WAVE REACHED</div>
                  <div className="font-display text-3xl text-secondary">{wave}</div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-display text-xl px-12 py-6 bg-gradient-to-r from-primary to-neon-purple hover:from-primary/90 hover:to-neon-purple/90 glow-pink"
                >
                  TRY AGAIN
                </Button>
              </motion.div>
            </>
          )}

          {phase === 'victory' && (
            <>
              <motion.div
                className="text-8xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🏆
              </motion.div>
              
              <motion.h1
                className="font-display text-6xl text-neon-yellow text-glow-cyan"
                animate={{ 
                  textShadow: [
                    '0 0 20px hsl(var(--neon-yellow))',
                    '0 0 40px hsl(var(--neon-yellow))',
                    '0 0 20px hsl(var(--neon-yellow))',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                VICTORY!
              </motion.h1>
              
              <p className="text-2xl text-muted-foreground">
                The chat saved the day!
              </p>

              <div className="bg-card p-6 rounded-xl border border-neon-yellow/30">
                <div className="text-sm text-muted-foreground">FINAL SCORE</div>
                <div className="font-display text-5xl text-neon-yellow">{score.toLocaleString()}</div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-display text-xl px-12 py-6 bg-gradient-to-r from-neon-yellow to-neon-orange hover:from-neon-yellow/90 hover:to-neon-orange/90"
                >
                  PLAY AGAIN
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
