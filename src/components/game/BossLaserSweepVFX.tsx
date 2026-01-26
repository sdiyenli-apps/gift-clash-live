import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState, useCallback } from 'react';
import bossLaserFx from '@/assets/boss-laser-fx.png';

// =============================================
// BOSS LASER SWEEP VFX - Sweeping laser attack
// Features: Warning indicators, ground explosions, debris, scorch marks
// =============================================

interface BossLaserSweepVFXProps {
  isActive: boolean;
  side?: 'left' | 'right' | 'both';
}

// Scorch mark that persists briefly
const ScorchMark = memo(({ x, delay }: { x: number; delay: number }) => (
  <motion.div
    className="absolute bottom-4"
    style={{
      left: `${x}%`,
      width: 80,
      height: 30,
      background: 'radial-gradient(ellipse at center, rgba(30,15,0,0.8), rgba(50,25,0,0.5), transparent)',
      borderRadius: '50%',
      filter: 'blur(3px)',
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: [0, 0.9, 0.7, 0.4, 0], scale: [0.5, 1.2, 1, 0.9, 0.8] }}
    transition={{ duration: 3, delay, times: [0, 0.1, 0.3, 0.7, 1] }}
  />
));
ScorchMark.displayName = 'ScorchMark';

// Ground explosion with debris
const GroundExplosion = memo(({ x, delay }: { x: number; delay: number }) => (
  <motion.div
    className="absolute bottom-0"
    style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
  >
    {/* Main explosion flash */}
    <motion.div
      className="absolute bottom-2"
      style={{
        width: 120,
        height: 80,
        left: -60,
        background: 'radial-gradient(ellipse at center bottom, #fff 0%, #ffaa00 30%, #ff4400 60%, transparent 80%)',
        filter: 'blur(8px)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 2, 0], opacity: [0, 1, 0.8, 0] }}
      transition={{ duration: 0.4, delay }}
    />
    
    {/* Explosion ring */}
    <motion.div
      className="absolute bottom-4 rounded-full"
      style={{
        width: 100,
        height: 50,
        left: -50,
        border: '4px solid #ff6600',
        boxShadow: '0 0 20px #ff4400, 0 0 40px #ff220088',
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: [0.3, 2.5], opacity: [1, 0] }}
      transition={{ duration: 0.5, delay }}
    />
    
    {/* Debris particles flying up */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`debris-${i}`}
        className="absolute rounded"
        style={{
          width: 6 + Math.random() * 6,
          height: 6 + Math.random() * 6,
          left: (Math.random() - 0.5) * 80,
          bottom: 10,
          background: i % 3 === 0 ? '#ff6600' : i % 3 === 1 ? '#888' : '#ffaa00',
          boxShadow: i % 3 === 0 ? '0 0 8px #ff4400' : 'none',
        }}
        initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
        animate={{
          y: [-10, -100 - Math.random() * 80],
          x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 120],
          opacity: [1, 0],
          rotate: [0, 360 + Math.random() * 360],
        }}
        transition={{ duration: 0.6 + Math.random() * 0.3, delay: delay + i * 0.03, ease: 'easeOut' }}
      />
    ))}
    
    {/* Spark shower */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`spark-${i}`}
        className="absolute rounded-full"
        style={{
          width: 3,
          height: 3,
          left: (Math.random() - 0.5) * 60,
          bottom: 15,
          background: '#ffff00',
          boxShadow: '0 0 6px #ffff00, 0 0 12px #ff8800',
        }}
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: [-5, -50 - Math.random() * 40],
          x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 80],
          opacity: [1, 0],
        }}
        transition={{ duration: 0.4, delay: delay + 0.05 + i * 0.02 }}
      />
    ))}
  </motion.div>
));
GroundExplosion.displayName = 'GroundExplosion';

// Warning indicator line before laser
const WarningLine = memo(({ side, delay }: { side: 'left' | 'right'; delay: number }) => (
  <motion.div
    className="absolute top-0 h-full pointer-events-none"
    style={{
      [side]: 0,
      width: '100%',
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Animated warning line that sweeps */}
    <motion.div
      className="absolute top-0 h-full"
      style={{
        width: 8,
        background: 'linear-gradient(180deg, transparent 0%, #ff0000 10%, #ff4400 50%, #ff0000 90%, transparent 100%)',
        boxShadow: '0 0 30px #ff0000, 0 0 60px #ff440088',
      }}
      initial={{ [side]: '-20px', opacity: 0 }}
      animate={{
        [side]: side === 'left' ? ['0%', '100%'] : ['100%', '0%'],
        opacity: [0, 1, 1, 0.5],
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        times: [0, 0.1, 0.8, 1],
      }}
    />
    
    {/* Flashing warning stripes */}
    <motion.div
      className="absolute top-0 h-full"
      style={{
        width: 40,
        [side]: 0,
        background: `repeating-linear-gradient(
          ${side === 'left' ? '45deg' : '-45deg'},
          transparent,
          transparent 10px,
          rgba(255,0,0,0.3) 10px,
          rgba(255,0,0,0.3) 20px
        )`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0, 0.8, 0] }}
      transition={{ duration: 0.4, delay, repeat: 2 }}
    />
    
    {/* Warning text */}
    <motion.div
      className="absolute top-1/3 font-black text-2xl"
      style={{
        [side]: 50,
        color: '#ff0000',
        textShadow: '0 0 15px #ff0000, 0 0 30px #ff4400, 2px 2px 0 #000',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
      transition={{ duration: 0.8, delay, times: [0, 0.2, 0.7, 1] }}
    >
      ⚠ DANGER ⚠
    </motion.div>
  </motion.div>
));
WarningLine.displayName = 'WarningLine';

export const BossLaserSweepVFX = memo(({ isActive, side = 'both' }: BossLaserSweepVFXProps) => {
  const [showEffect, setShowEffect] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExplosions, setShowExplosions] = useState(false);
  const [scorchPositions] = useState(() => 
    Array.from({ length: 6 }, () => 10 + Math.random() * 80)
  );
  const [explosionPositions] = useState(() => 
    Array.from({ length: 5 }, (_, i) => 15 + i * 18)
  );
  
  useEffect(() => {
    if (isActive) {
      // Show warning first
      setShowWarning(true);
      
      // Then show main laser effect
      const laserTimer = setTimeout(() => {
        setShowWarning(false);
        setShowEffect(true);
      }, 600);
      
      // Trigger explosions during sweep
      const explosionTimer = setTimeout(() => {
        setShowExplosions(true);
      }, 800);
      
      // Cleanup
      const endTimer = setTimeout(() => {
        setShowEffect(false);
        setShowExplosions(false);
      }, 2400);
      
      return () => {
        clearTimeout(laserTimer);
        clearTimeout(explosionTimer);
        clearTimeout(endTimer);
      };
    }
  }, [isActive]);
  
  if (!showEffect && !showWarning) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {/* WARNING PHASE - Shows danger zones before laser */}
        {showWarning && (
          <>
            {(side === 'left' || side === 'both') && (
              <WarningLine side="left" delay={0} />
            )}
            {(side === 'right' || side === 'both') && (
              <WarningLine side="right" delay={0.2} />
            )}
            
            {/* Pulsing screen border warning */}
            <motion.div
              className="absolute inset-0"
              style={{
                border: '6px solid #ff0000',
                boxShadow: 'inset 0 0 50px rgba(255,0,0,0.4)',
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          </>
        )}
        
        {/* MAIN LASER PHASE */}
        {showEffect && (
          <>
            {/* Screen shake effect via CSS animation */}
            <motion.div
              className="absolute inset-0"
              animate={{ x: [-3, 3, -2, 2, 0], y: [-2, 2, -1, 1, 0] }}
              transition={{ duration: 0.1, repeat: 10 }}
            />
            
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
                  left: ['-120px', '30%', '60%', '100%'],
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
                  delay: 0.3,
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
            
            {/* GROUND EXPLOSIONS - Where laser touches ground */}
            {showExplosions && explosionPositions.map((pos, i) => (
              <GroundExplosion key={`explosion-${i}`} x={pos} delay={i * 0.15} />
            ))}
            
            {/* SCORCH MARKS - Persist after explosions */}
            {showExplosions && scorchPositions.map((pos, i) => (
              <ScorchMark key={`scorch-${i}`} x={pos} delay={0.3 + i * 0.1} />
            ))}
            
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
          </>
        )}
      </div>
    </AnimatePresence>
  );
});

BossLaserSweepVFX.displayName = 'BossLaserSweepVFX';
