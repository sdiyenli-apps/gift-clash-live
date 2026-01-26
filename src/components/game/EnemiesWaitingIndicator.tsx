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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer glow container */}
          <motion.div
            className="relative px-8 py-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,100,0,0.2), rgba(255,0,0,0.3))',
              border: '2px solid rgba(255,150,0,0.6)',
              boxShadow: '0 0 40px rgba(255,100,0,0.5), 0 0 80px rgba(255,50,0,0.3), inset 0 0 30px rgba(255,100,0,0.2)',
              backdropFilter: 'blur(8px)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(255,100,0,0.5), 0 0 80px rgba(255,50,0,0.3), inset 0 0 30px rgba(255,100,0,0.2)',
                '0 0 60px rgba(255,100,0,0.7), 0 0 100px rgba(255,50,0,0.5), inset 0 0 40px rgba(255,100,0,0.3)',
                '0 0 40px rgba(255,100,0,0.5), 0 0 80px rgba(255,50,0,0.3), inset 0 0 30px rgba(255,100,0,0.2)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Scanning line effect */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{ pointerEvents: 'none' }}
            >
              <motion.div
                className="absolute w-full h-1"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,200,0,0.8), transparent)',
                  boxShadow: '0 0 20px rgba(255,200,0,0.6)',
                }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            
            {/* Warning icon */}
            <motion.div
              className="text-center mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span className="text-4xl">⚠️</span>
            </motion.div>
            
            {/* Main text */}
            <motion.div
              className="text-center font-black text-lg tracking-widest"
              style={{
                color: '#ff8800',
                textShadow: '0 0 10px #ff4400, 0 0 20px #ff4400, 0 0 30px #ff2200, 2px 2px 0 #000',
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ENEMIES WAITING...
            </motion.div>
            
            {/* Enemy count */}
            <motion.div
              className="text-center mt-2 font-bold text-sm tracking-wide"
              style={{
                color: '#ffcc00',
                textShadow: '0 0 8px #ffaa00, 1px 1px 0 #000',
              }}
            >
              {enemyCount} hostiles detected
            </motion.div>
            
            {/* Action hint */}
            <motion.div
              className="text-center mt-3 text-xs font-medium"
              style={{
                color: '#00ffff',
                textShadow: '0 0 6px #00ffff',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              🎁 Send a gift to start combat!
            </motion.div>
            
            {/* Corner decorations */}
            {[0, 1, 2, 3].map((corner) => (
              <motion.div
                key={corner}
                className="absolute w-4 h-4"
                style={{
                  top: corner < 2 ? -2 : 'auto',
                  bottom: corner >= 2 ? -2 : 'auto',
                  left: corner % 2 === 0 ? -2 : 'auto',
                  right: corner % 2 === 1 ? -2 : 'auto',
                  borderTop: corner < 2 ? '3px solid #ff8800' : 'none',
                  borderBottom: corner >= 2 ? '3px solid #ff8800' : 'none',
                  borderLeft: corner % 2 === 0 ? '3px solid #ff8800' : 'none',
                  borderRight: corner % 2 === 1 ? '3px solid #ff8800' : 'none',
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  boxShadow: [
                    '0 0 5px #ff8800',
                    '0 0 15px #ff8800',
                    '0 0 5px #ff8800',
                  ],
                }}
                transition={{ duration: 0.8, repeat: Infinity, delay: corner * 0.2 }}
              />
            ))}
          </motion.div>
          
          {/* Pulse rings */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={`ring-${ring}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 100,
                border: '2px solid rgba(255,100,0,0.3)',
              }}
              animate={{
                scale: [1, 2, 2.5],
                opacity: [0.6, 0.2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: ring * 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
