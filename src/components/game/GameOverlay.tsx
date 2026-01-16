import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameOverlayProps {
  phase: GameState['phase'];
  score: number;
  distance: number;
  onStart: () => void;
}

export const GameOverlay = ({ phase, score, distance, onStart }: GameOverlayProps) => {
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
          exit={{ scale: 0.8, y: 20 }}
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
              
              {/* Hero preview */}
              <motion.div
                className="w-24 h-24 mx-auto relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-12 h-12 bg-gradient-to-b from-blue-500 to-blue-700 rounded-md mx-auto" />
                <div className="w-10 h-10 bg-[#ffd5b4] rounded-full absolute -top-6 left-1/2 -translate-x-1/2" />
                <div className="w-4 h-6 bg-[#ffb894] rounded-full absolute -top-3 left-1/2 translate-x-1" />
              </motion.div>
              
              <p className="text-xl text-gray-300 max-w-md mx-auto">
                Viewers control the hero with TikTok gifts!
                <br />
                <span className="text-cyan-400">Save the princess</span> from evil robots!
              </p>

              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="px-4 py-2 bg-gray-800 rounded-lg border border-cyan-500/30">
                  <span className="text-cyan-400">🌹 Small</span> = Move, Jump, Shoot
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-lg border border-purple-500/30">
                  <span className="text-purple-400">💗 Medium</span> = Power moves
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-400">✨ Large</span> = ULTRA MODE!
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-bold text-xl px-12 py-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #ff00ff, #00ffff)' }}
                >
                  🚀 START ADVENTURE
                </Button>
              </motion.div>

              <p className="text-xs text-gray-500">
                Demo mode: Click gifts on the right panel to control the hero
              </p>
            </>
          )}

          {phase === 'gameover' && (
            <>
              <motion.h1
                className="font-bold text-6xl text-red-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ textShadow: '0 0 30px #ff0000' }}
              >
                💀 GAME OVER 💀
              </motion.h1>
              
              <p className="text-2xl text-gray-400">
                The robots got our hero...
              </p>

              <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                <div className="bg-gray-800 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-sm text-gray-400">FINAL SCORE</div>
                  <div className="font-bold text-3xl text-yellow-400">{score.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-pink-500/30">
                  <div className="text-sm text-gray-400">DISTANCE</div>
                  <div className="font-bold text-3xl text-pink-400">{Math.floor(distance)}m</div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-bold text-xl px-12 py-6 bg-red-600 hover:bg-red-700 text-white"
                >
                  💪 TRY AGAIN
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
                👸
              </motion.div>
              
              <motion.h1
                className="font-bold text-6xl"
                style={{
                  background: 'linear-gradient(135deg, #ff66ff, #ffff00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🎉 PRINCESS SAVED! 🎉
              </motion.h1>
              
              <p className="text-2xl text-pink-400">
                "My hero! That nose is magnificent!"
              </p>

              <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500/30 max-w-xs mx-auto">
                <div className="text-sm text-gray-400">FINAL SCORE</div>
                <div className="font-bold text-5xl text-yellow-400">{score.toLocaleString()}</div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onStart}
                  size="lg"
                  className="font-bold text-xl px-12 py-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #ffff00, #ff00ff)' }}
                >
                  🔄 PLAY AGAIN
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
