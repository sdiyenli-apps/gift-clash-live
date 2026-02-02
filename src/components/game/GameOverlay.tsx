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
          className="text-center space-y-3 p-4 max-w-xs mx-auto"
        >
          {phase === 'waiting' && (
            <>
              <motion.h1
                className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255,0,255,0.3)',
                }}
              >
                CAPTAIN SQUIRBERT
              </motion.h1>
              <motion.p
                className="text-sm sm:text-base font-bold tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #ffff00, #ff00ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                COMMUNITY HERO
              </motion.p>
              
              <p className="text-xs sm:text-sm text-gray-300 font-semibold">
                🎁 Send Gifts to control the hero and save the world!
              </p>
              <p className="text-[10px] sm:text-xs text-cyan-400">
                🌹Move • 🫰Shoot • 🧢Armor • 💐Heal • ⚡EMP • 💀Danger
              </p>

              <div className="text-xs text-yellow-400 font-bold">
                {maxWaves} WAVES TO CONQUER!
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onStart()}
                  size="lg"
                  className="font-bold text-base sm:text-lg px-6 py-3 sm:px-10 sm:py-5 text-white shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                    boxShadow: '0 0 25px rgba(255,0,255,0.5), 0 0 50px rgba(0,255,255,0.3)',
                  }}
                >
                  🔫 START WAVE 1
                </Button>
              </motion.div>
            </>
          )}

          {phase === 'gameover' && (
            <>
              <motion.h1 className="font-bold text-3xl sm:text-5xl text-red-500" style={{ textShadow: '0 0 30px #ff0000' }}>
                💀 GAME OVER 💀
              </motion.h1>
              <p className="text-sm text-gray-400">Wave {currentWave} of {maxWaves}</p>
              <div className="font-bold text-xl text-yellow-400">Score: {score.toLocaleString()}</div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => onStart()} size="lg" className="font-bold text-sm sm:text-lg px-6 py-3 bg-red-600 text-white">
                  💪 RETRY WAVE {currentWave}
                </Button>
              </motion.div>
            </>
          )}

          {phase === 'victory' && (
            <>
              <motion.div className="text-5xl sm:text-7xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                {currentWave >= maxWaves ? '👑' : '👸'}
              </motion.div>
              <motion.h1
                className="font-bold text-xl sm:text-3xl"
                style={{ background: 'linear-gradient(135deg, #ff66ff, #ffff00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {currentWave >= maxWaves ? '🏆 COMPLETE! 🏆' : `🎉 WAVE ${currentWave} CLEARED! 🎉`}
              </motion.h1>
              <div className="font-bold text-lg text-yellow-400">Score: {score.toLocaleString()}</div>
              
              {currentWave < maxWaves && onNextWave && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onNextWave}
                    size="lg"
                    className="font-bold text-sm sm:text-lg px-6 py-3 text-white"
                    style={{ background: 'linear-gradient(135deg, #ffff00, #ff00ff)' }}
                  >
                    ⚡ NEXT ({currentWave + 1}/{maxWaves})
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
