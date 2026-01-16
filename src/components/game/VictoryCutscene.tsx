import { motion, AnimatePresence } from 'framer-motion';
import princessSprite from '@/assets/princess-sprite.png';
import heroSprite from '@/assets/hero-sprite.png';

interface VictoryCutsceneProps {
  isVisible: boolean;
  wave: number;
  onContinue?: () => void;
}

export const VictoryCutscene = ({ isVisible, wave, onContinue }: VictoryCutsceneProps) => {
  const isFinalVictory = wave >= 1000;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background overlay */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: isFinalVictory 
                ? 'radial-gradient(circle, rgba(255,182,193,0.9), rgba(255,105,180,0.95), rgba(200,50,150,1))'
                : 'radial-gradient(circle, rgba(0,255,255,0.8), rgba(0,100,200,0.9), rgba(0,50,100,1))',
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Confetti particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ 
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: [0, 500],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['🎉', '✨', '💖', '🌟', '💎', '👑', '🎊', '💫'][Math.floor(Math.random() * 8)]}
            </motion.div>
          ))}
          
          {/* Main content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          >
            {/* Victory text */}
            <motion.h1
              className="text-6xl font-black mb-8"
              style={{
                color: '#fff',
                textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
              }}
              animate={{
                scale: [1, 1.1, 1],
                textShadow: [
                  '0 0 20px #ff00ff, 0 0 40px #ff00ff',
                  '0 0 40px #00ffff, 0 0 80px #00ffff',
                  '0 0 20px #ff00ff, 0 0 40px #ff00ff',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isFinalVictory ? '🎉 ULTIMATE VICTORY! 🎉' : '✨ LEVEL COMPLETE! ✨'}
            </motion.h1>
            
            {/* Characters */}
            <div className="flex items-end justify-center gap-8 mb-8">
              {/* Hero */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <motion.img
                  src={heroSprite}
                  alt="Hero"
                  className="w-32 h-40 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px #00ffff)',
                    transform: 'scaleX(-1)',
                  }}
                />
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00ffff, #0088ff)',
                    color: '#fff',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {isFinalVictory ? "WE DID IT, CHAT! 🔥" : "LET'S GOOO! 💪"}
                </motion.div>
              </motion.div>
              
              {/* Hearts between them */}
              <motion.div
                className="flex flex-col gap-2 pb-12"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {['💖', '💕', '💗'].map((heart, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {heart}
                  </motion.span>
                ))}
              </motion.div>
              
              {/* Princess */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.img
                  src={princessSprite}
                  alt="Princess"
                  className="w-28 h-36 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px #ff69b4)',
                  }}
                />
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                    color: '#fff',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {isFinalVictory ? "MY HERO! 💕" : "THANK YOU! 💖"}
                </motion.div>
              </motion.div>
            </div>
            
            {/* Wave info */}
            <motion.div
              className="text-2xl font-bold mb-6"
              style={{
                color: '#ffff00',
                textShadow: '0 0 10px #ffff00',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {isFinalVictory 
                ? "🏆 ALL 1000 WAVES COMPLETED! 🏆" 
                : `WAVE ${wave} CLEARED!`}
            </motion.div>
            
            {/* Thanks to chat */}
            <motion.div
              className="text-xl mb-8"
              style={{
                color: '#fff',
                textShadow: '0 0 5px #fff',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {isFinalVictory 
                ? "COULDN'T HAVE DONE IT WITHOUT CHAT! 🙏💖" 
                : "THANKS FOR THE GIFTS! 🎁"}
            </motion.div>
            
            {/* Continue button */}
            {!isFinalVictory && onContinue && (
              <motion.button
                className="px-8 py-4 rounded-full font-bold text-xl cursor-pointer border-none"
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00ffff)',
                  color: '#000',
                  boxShadow: '0 0 20px #00ffff',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                onClick={onContinue}
              >
                NEXT WAVE →
              </motion.button>
            )}
            
            {/* Final victory credits */}
            {isFinalVictory && (
              <motion.div
                className="mt-8 text-lg"
                style={{ color: '#fff' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <p className="mb-2">🎬 THE END 🎬</p>
                <p className="text-sm opacity-75">A Chat-Powered Adventure</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
