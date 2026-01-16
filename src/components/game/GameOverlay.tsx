import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameOverlayProps {
  phase: GameState['phase'];
  score: number;
  distance: number;
  currentWave: number;
  maxWaves: number;
  onStart: () => void;
  onNextWave?: () => void;
}

export const GameOverlay = ({ phase, score, distance, currentWave, maxWaves, onStart, onNextWave }: GameOverlayProps) => {
  if (phase === 'playing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="text-center space-y-6 p-8"
        >
          {phase === 'waiting' && (
            <>
              <motion.h1
                className="font-bold text-5xl md:text-7xl"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BIG NOSE HERO
              </motion.h1>
              
              <p className="text-lg text-gray-300 max-w-md mx-auto">
                🎁 Each gift = One action!<br />
                <span className="text-cyan-400">🌹 Move • 🫰 Shoot • 🧢 Armor • 💐 Heal • 🌌 Magic</span>
              </p>

              <div className="text-sm text-yellow-400 font-bold">
                {maxWaves} WAVES TO CONQUER!
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onStart()}
                  size="lg"
                  className="font-bold text-xl px-12 py-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #ff00ff, #00ffff)' }}
                >
                  🚀 START WAVE 1
                </Button>
              </motion.div>
            </>
          )}

          {phase === 'gameover' && (
            <>
              <motion.h1 className="font-bold text-6xl text-red-500" style={{ textShadow: '0 0 30px #ff0000' }}>
                💀 GAME OVER 💀
              </motion.h1>
              <p className="text-xl text-gray-400">Wave {currentWave} of {maxWaves}</p>
              <div className="font-bold text-3xl text-yellow-400">Score: {score.toLocaleString()}</div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => onStart()} size="lg" className="font-bold text-xl px-12 py-6 bg-red-600 text-white">
                  💪 RETRY WAVE {currentWave}
                </Button>
              </motion.div>
            </>
          )}

          {phase === 'victory' && (
            <>
              <motion.div className="text-8xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                {currentWave >= maxWaves ? '👑' : '👸'}
              </motion.div>
              <motion.h1
                className="font-bold text-5xl"
                style={{ background: 'linear-gradient(135deg, #ff66ff, #ffff00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {currentWave >= maxWaves ? '🏆 ALL WAVES COMPLETE! 🏆' : `🎉 WAVE ${currentWave} CLEARED! 🎉`}
              </motion.h1>
              <div className="font-bold text-3xl text-yellow-400">Score: {score.toLocaleString()}</div>
              
              {currentWave < maxWaves && onNextWave && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onNextWave}
                    size="lg"
                    className="font-bold text-xl px-12 py-6 text-white"
                    style={{ background: 'linear-gradient(135deg, #ffff00, #ff00ff)' }}
                  >
                    ⚡ NEXT WAVE ({currentWave + 1}/{maxWaves})
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
