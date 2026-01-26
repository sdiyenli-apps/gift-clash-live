import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import bossLaserFx from '@/assets/boss-laser-fx.png';

// =============================================
// BOSS LASER SWEEP VFX - Sweeping laser attack
// Uses custom sprite that phases left/right across screen
// =============================================

interface BossLaserSweepVFXProps {
  isActive: boolean;
  side?: 'left' | 'right' | 'both';
}

export const BossLaserSweepVFX = memo(({ isActive, side = 'both' }: BossLaserSweepVFXProps) => {
  const [showEffect, setShowEffect] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setShowEffect(true);
      const timer = setTimeout(() => setShowEffect(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  if (!showEffect) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {/* Screen warning flash */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.3), transparent 70%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3, 0.5, 0] }}
          transition={{ duration: 1.5, times: [0, 0.1, 0.3, 0.6, 1] }}
        />
        
        {/* Left laser beam - sweeps right */}
        {(side === 'left' || side === 'both') && (
          <motion.div
            className="absolute top-0 h-full"
            style={{
              width: 120,
              zIndex: 61,
            }}
            initial={{ left: '-120px', opacity: 0 }}
            animate={{ 
              left: ['−120px', '30%', '60%', '100%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ 
              duration: 1.5, 
              ease: 'easeInOut',
              times: [0, 0.2, 0.8, 1],
            }}
          >
            {/* Laser sprite */}
            <img
              src={bossLaserFx}
              alt=""
              className="h-full w-auto object-cover"
              style={{
                filter: 'drop-shadow(0 0 20px #ff0000) drop-shadow(0 0 40px #ff4400)',
              }}
            />
            
            {/* Additional glow layer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.4), rgba(255,100,0,0.3), transparent)',
                filter: 'blur(10px)',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
            
            {/* Ground impact sparks */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20"
              style={{
                background: 'radial-gradient(ellipse at center bottom, rgba(255,200,0,0.8), rgba(255,100,0,0.5), transparent)',
                filter: 'blur(5px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
            
            {/* Flying debris particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`debris-l-${i}`}
                className="absolute bottom-4 rounded-full"
                style={{
                  left: 40 + Math.random() * 40,
                  width: 4 + Math.random() * 4,
                  height: 4 + Math.random() * 4,
                  background: i % 2 === 0 ? '#ff6600' : '#ffaa00',
                  boxShadow: '0 0 8px #ff4400',
                }}
                animate={{
                  y: [-10, -60 - Math.random() * 40],
                  x: [0, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity,
                  delay: i * 0.08,
                }}
              />
            ))}
          </motion.div>
        )}
        
        {/* Right laser beam - sweeps left */}
        {(side === 'right' || side === 'both') && (
          <motion.div
            className="absolute top-0 h-full"
            style={{
              width: 120,
              zIndex: 61,
              transform: 'scaleX(-1)',
            }}
            initial={{ right: '-120px', opacity: 0 }}
            animate={{ 
              right: ['-120px', '30%', '60%', '100%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ 
              duration: 1.5, 
              ease: 'easeInOut',
              times: [0, 0.2, 0.8, 1],
              delay: 0.3, // Offset from left laser
            }}
          >
            {/* Laser sprite */}
            <img
              src={bossLaserFx}
              alt=""
              className="h-full w-auto object-cover"
              style={{
                filter: 'drop-shadow(0 0 20px #ff0000) drop-shadow(0 0 40px #ff4400)',
              }}
            />
            
            {/* Additional glow layer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.4), rgba(255,100,0,0.3), transparent)',
                filter: 'blur(10px)',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
            
            {/* Ground impact sparks */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20"
              style={{
                background: 'radial-gradient(ellipse at center bottom, rgba(255,200,0,0.8), rgba(255,100,0,0.5), transparent)',
                filter: 'blur(5px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
          </motion.div>
        )}
        
        {/* Warning text */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 text-4xl font-black"
          style={{
            color: '#ff0000',
            textShadow: '0 0 20px #ff0000, 0 0 40px #ff4400, 2px 2px 0 #000',
            fontFamily: 'Impact, sans-serif',
          }}
          initial={{ opacity: 0, scale: 2 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [2, 1, 1, 0.8],
          }}
          transition={{ duration: 1.2, times: [0, 0.15, 0.7, 1] }}
        >
          ⚠️ LASER SWEEP! ⚠️
        </motion.div>
        
        {/* Screen edge danger indicators */}
        <motion.div
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 100px rgba(255,0,0,0.5)',
            border: '4px solid rgba(255,0,0,0.6)',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      </div>
    </AnimatePresence>
  );
});

BossLaserSweepVFX.displayName = 'BossLaserSweepVFX';
