import { motion, AnimatePresence } from 'framer-motion';

interface EnemiesWaitingIndicatorProps {
  isVisible: boolean;
  enemyCount: number;
}

export const EnemiesWaitingIndicator = ({ isVisible, enemyCount }: EnemiesWaitingIndicatorProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Compact warning container */}
          <motion.div
            className="relative px-4 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,100,0,0.3), rgba(255,0,0,0.4))',
              border: '2px solid rgba(255,150,0,0.7)',
              boxShadow: '0 0 20px rgba(255,100,0,0.6), 0 0 40px rgba(255,50,0,0.4), inset 0 0 15px rgba(255,100,0,0.2)',
              backdropFilter: 'blur(8px)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,100,0,0.6), 0 0 40px rgba(255,50,0,0.4)',
                '0 0 30px rgba(255,100,0,0.8), 0 0 50px rgba(255,50,0,0.6)',
                '0 0 20px rgba(255,100,0,0.6), 0 0 40px rgba(255,50,0,0.4)',
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Inline warning content */}
            <div className="flex items-center gap-2">
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⚠️
              </motion.span>
              
              <motion.span
                className="font-bold text-sm tracking-wide"
                style={{
                  color: '#ff8800',
                  textShadow: '0 0 8px #ff4400, 0 0 15px #ff2200, 1px 1px 0 #000',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {enemyCount} ENEMIES WAITING
              </motion.span>
              
              <motion.span
                className="text-xs font-medium"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 5px #00ffff',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎁 Send gift!
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
