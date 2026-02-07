import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
import ultBackgroundGif from '@/assets/ult-background.gif';

interface UltBackgroundEffectProps {
  isActive: boolean;
}

// Fullscreen ULT background effect - hyperspeed lines covering entire screen
export const UltBackgroundEffect = memo(({ isActive }: UltBackgroundEffectProps) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Main hyperspeed lines - tiled across screen */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${ultBackgroundGif})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              filter: 'brightness(1.3) saturate(1.2)',
              mixBlendMode: 'screen',
              opacity: 0.6,
            }}
          />
          
          {/* Additional horizontal streak layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${ultBackgroundGif})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat-x',
              filter: 'brightness(1.5) hue-rotate(20deg)',
              mixBlendMode: 'screen',
              opacity: 0.4,
            }}
            animate={{
              x: [0, -100, 0],
            }}
            transition={{ duration: 0.2, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Speed blur on edges */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(0,200,255,0.4) 0%, transparent 15%, transparent 85%, rgba(0,200,255,0.4) 100%),
                linear-gradient(180deg, rgba(0,200,255,0.2) 0%, transparent 20%, transparent 80%, rgba(0,200,255,0.2) 100%)
              `,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          
          {/* Center energy glow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="w-96 h-96"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.2) 40%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </motion.div>
          
          {/* "ULT MODE" indicator */}
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <motion.div
              className="text-2xl font-black tracking-widest"
              style={{
                color: '#00ffff',
                textShadow: '0 0 20px #00ffff, 0 0 40px #ff00ff, 2px 2px 0 #000',
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              ⚡ ULT MODE ACTIVE ⚡
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

UltBackgroundEffect.displayName = 'UltBackgroundEffect';
