import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WaveTransitionProps {
  isVisible: boolean;
  currentWave: number;
  maxWaves: number;
  score: number;
  onNextWave: () => void;
}

export const WaveTransition = ({ isVisible, currentWave, maxWaves, score, onNextWave }: WaveTransitionProps) => {
  const isFinalVictory = currentWave >= maxWaves;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,0,40,0.95) 50%, rgba(0,20,40,0.95) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center p-6 max-w-sm mx-auto"
          >
            {/* Victory Icon */}
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {isFinalVictory ? '👑' : '⭐'}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-black text-3xl sm:text-4xl mb-2"
              style={{
                background: isFinalVictory 
                  ? 'linear-gradient(135deg, #ffd700, #ff8800, #ffd700)'
                  : 'linear-gradient(135deg, #00ffff, #ff00ff, #ffff00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              {isFinalVictory ? '🏆 VICTORY! 🏆' : `WAVE ${currentWave} CLEARED!`}
            </motion.h1>

            {/* Wave Progress */}
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">
                {isFinalVictory ? 'ALL WAVES CONQUERED!' : `${currentWave} / ${maxWaves} Waves`}
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentWave / maxWaves) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Score */}
            <motion.div
              className="font-bold text-2xl mb-6"
              style={{ color: '#ffff00', textShadow: '0 0 20px #ffff00' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              ⭐ {score.toLocaleString()} PTS
            </motion.div>

            {/* Next Wave Button */}
            {!isFinalVictory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onNextWave}
                    size="lg"
                    className="font-black text-lg px-8 py-6 text-white border-0 w-full"
                    style={{
                      background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                      boxShadow: '0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(0,255,255,0.3)',
                    }}
                  >
                    ⚡ NEXT WAVE ({currentWave + 1}/{maxWaves}) ⚡
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Final Victory Message */}
            {isFinalVictory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-pink-400 font-bold text-lg mb-2">
                  👸 PRINCESS SAVED! 👸
                </p>
                <p className="text-gray-400 text-sm">
                  You've conquered all 1000 waves!
                </p>
              </motion.div>
            )}

            {/* Decorative particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffff00',
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};