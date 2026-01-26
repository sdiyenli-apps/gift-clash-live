import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

// =============================================
// BOSS ATTACK VFX - Cinematic attack effects
// =============================================

interface BossAttackVFXProps {
  attackType: 'fireball' | 'laser' | 'missile' | 'ground_pound' | 'screen_attack' | null;
  bossX: number;
  bossY: number;
  cameraX: number;
}

// Main boss attack VFX container - triggers flashes and effects based on attack type
export const BossAttackVFX = memo(({ attackType, bossX, bossY, cameraX }: BossAttackVFXProps) => {
  const [showEffect, setShowEffect] = useState(false);
  const screenX = bossX - cameraX;
  
  useEffect(() => {
    if (attackType) {
      setShowEffect(true);
      const timer = setTimeout(() => setShowEffect(false), 600);
      return () => clearTimeout(timer);
    }
  }, [attackType]);
  
  if (!showEffect || !attackType) return null;
  
  return (
    <AnimatePresence>
      {attackType === 'fireball' && (
        <FireballVFX x={screenX} y={bossY} />
      )}
      {attackType === 'laser' && (
        <LaserVFX x={screenX} y={bossY} />
      )}
      {attackType === 'missile' && (
        <MissileVFX />
      )}
      {attackType === 'ground_pound' && (
        <GroundPoundVFX x={screenX} y={bossY} />
      )}
      {attackType === 'screen_attack' && (
        <ScreenAttackVFX />
      )}
    </AnimatePresence>
  );
});

BossAttackVFX.displayName = 'BossAttackVFX';

// Fireball launch flash - orange/red burst from boss
const FireballVFX = memo(({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - 60,
        bottom: 280 - y - 60,
        width: 120,
        height: 120,
        zIndex: 45,
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: [0.3, 1.5, 1.2], opacity: [1, 1, 0] }}
      transition={{ duration: 0.4 }}
    >
      {/* Core flash */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff 10%, #ffaa00 30%, #ff4400 60%, transparent 70%)',
          boxShadow: '0 0 40px #ff6600, 0 0 80px #ff4400',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.2, repeat: 2 }}
      />
      
      {/* Fire streaks */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: 60 - 3,
              top: 60 - 15,
              width: 6,
              height: 30,
              background: 'linear-gradient(180deg, #fff, #ffaa00, transparent)',
              transformOrigin: 'center bottom',
              transform: `rotate(${angle}rad)`,
              borderRadius: '50%',
            }}
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: 1, opacity: 0 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          />
        );
      })}
      
      {/* Smoke puffs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute rounded-full"
          style={{
            left: 40 + Math.random() * 40,
            top: 40 + Math.random() * 40,
            width: 20,
            height: 20,
            background: 'radial-gradient(circle, rgba(80,80,80,0.6), transparent)',
          }}
          initial={{ scale: 0.5, opacity: 0.8, y: 0 }}
          animate={{ scale: 2, opacity: 0, y: -50, x: (Math.random() - 0.5) * 40 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
        />
      ))}
    </motion.div>
  );
});

FireballVFX.displayName = 'FireballVFX';

// Laser charging and firing VFX - electric blue with buildup
const LaserVFX = memo(({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - 80,
        bottom: 280 - y - 40,
        width: 160,
        height: 80,
        zIndex: 45,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Charging orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: 60,
          top: 20,
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, #fff, #00ffff, #0088ff)',
          boxShadow: '0 0 30px #00ffff, 0 0 60px #00aaff, 0 0 100px #0066ff',
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ 
          scale: [0.2, 1.5, 2, 0.5],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 0.5, times: [0, 0.3, 0.6, 1] }}
      />
      
      {/* Electric arcs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: 75,
            top: 35,
            width: 50 + i * 10,
            height: 2,
            background: 'linear-gradient(90deg, #00ffff, #fff, #00ffff)',
            transformOrigin: 'left center',
            transform: `rotate(${-30 + i * 12}deg)`,
            filter: 'blur(1px)',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ 
            duration: 0.4, 
            delay: i * 0.03,
            times: [0, 0.5, 1],
          }}
        />
      ))}
      
      {/* Flash burst on fire */}
      <motion.div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: 160,
          height: 80,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,255,0.8), transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.2, delay: 0.3 }}
      />
    </motion.div>
  );
});

LaserVFX.displayName = 'LaserVFX';

// Missile barrage VFX - warning indicators and launch trails
const MissileVFX = memo(() => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Warning lines falling from top */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 10}%`,
            top: 0,
            width: 2,
            height: '100%',
            background: 'linear-gradient(180deg, #ff0000, #ff6600, transparent 40%)',
            opacity: 0.6,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
        />
      ))}
      
      {/* Danger flash at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(180deg, rgba(255,100,0,0.7), transparent)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.15, repeat: 4 }}
      />
      
      {/* Incoming missile indicators */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`missile-${i}`}
          className="absolute text-2xl"
          style={{
            left: `${15 + i * 15}%`,
            top: 10,
          }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
        >
          🚀
        </motion.div>
      ))}
    </motion.div>
  );
});

MissileVFX.displayName = 'MissileVFX';

// Ground pound VFX - shockwave and debris
const GroundPoundVFX = memo(({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - 100,
        bottom: 0,
        width: 200,
        height: 150,
        zIndex: 45,
      }}
    >
      {/* Impact flash */}
      <motion.div
        className="absolute"
        style={{
          left: 50,
          bottom: 20,
          width: 100,
          height: 60,
          background: 'radial-gradient(ellipse at center bottom, #fff 0%, #ff00ff 30%, #ff0066 60%, transparent 80%)',
          boxShadow: '0 0 50px #ff00ff',
        }}
        initial={{ scaleX: 0.5, scaleY: 0.3, opacity: 1 }}
        animate={{ scaleX: 3, scaleY: 1.5, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Shockwave rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: 0,
            bottom: 15,
            width: 200,
            height: 30,
            border: '3px solid #ff00ff',
            borderRadius: '50%',
            boxShadow: '0 0 15px #ff00ff',
          }}
          initial={{ scaleX: 0.3, opacity: 1 }}
          animate={{ scaleX: 4, opacity: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        />
      ))}
      
      {/* Debris particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI;
        const dist = 60 + Math.random() * 40;
        return (
          <motion.div
            key={`debris-${i}`}
            className="absolute rounded"
            style={{
              left: 95,
              bottom: 25,
              width: 8 + Math.random() * 6,
              height: 8 + Math.random() * 6,
              background: i % 2 === 0 ? '#ff00ff' : '#666',
              boxShadow: i % 2 === 0 ? '0 0 8px #ff00ff' : 'none',
            }}
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: -Math.sin(angle) * dist - 20,
              rotate: 360 + Math.random() * 360,
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        );
      })}
    </motion.div>
  );
});

GroundPoundVFX.displayName = 'GroundPoundVFX';

// Screen attack VFX - full screen danger effects
const ScreenAttackVFX = memo(() => {
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-50">
      {/* Danger border pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          border: '8px solid #ff0000',
          boxShadow: 'inset 0 0 100px rgba(255,0,0,0.5)',
        }}
        animate={{ 
          opacity: [0, 1, 0],
          borderColor: ['#ff0000', '#ffff00', '#ff0000'],
        }}
        transition={{ duration: 0.15, repeat: 5 }}
      />
      
      {/* Warning skull */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl"
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ 
          scale: [0, 2, 1.5],
          opacity: [0, 1, 0],
          rotate: 0,
        }}
        transition={{ duration: 0.6 }}
      >
        ☠️
      </motion.div>
      
      {/* Danger text */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl font-black"
        style={{
          color: '#ff0000',
          textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
          fontFamily: 'Impact, sans-serif',
        }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          y: 0,
        }}
        transition={{ duration: 0.6, times: [0, 0.2, 0.8, 1] }}
      >
        ⚠️ MEGA ATTACK ⚠️
      </motion.div>
      
      {/* Screen flash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,0,0,0.6))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.3, delay: 0.4 }}
      />
    </motion.div>
  );
});

ScreenAttackVFX.displayName = 'ScreenAttackVFX';

// Bomb explosion VFX - for missile/bomb impacts
interface BombExplosionVFXProps {
  x: number;
  y: number;
  cameraX: number;
  size?: 'small' | 'medium' | 'large';
}

export const BombExplosionVFX = memo(({ x, y, cameraX, size = 'medium' }: BombExplosionVFXProps) => {
  const screenX = x - cameraX;
  if (screenX < -100 || screenX > 800) return null;
  
  const sizeMap = {
    small: { ring: 50, core: 25 },
    medium: { ring: 80, core: 40 },
    large: { ring: 120, core: 60 },
  };
  
  const s = sizeMap[size];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX - s.ring / 2,
        bottom: 280 - y - s.ring / 2,
        width: s.ring,
        height: s.ring,
        zIndex: 42,
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: [0.3, 1.3, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.4 }}
    >
      {/* Outer blast ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: '4px solid #ff6600',
          boxShadow: '0 0 25px #ff6600, 0 0 50px #ff440080',
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Fire core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: (s.ring - s.core) / 2,
          top: (s.ring - s.core) / 2,
          width: s.core,
          height: s.core,
          background: 'radial-gradient(circle, #fff 20%, #ffcc00 40%, #ff6600 70%, #ff0000 100%)',
          boxShadow: '0 0 40px #ffaa00, 0 0 60px #ff4400',
        }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: [1, 1.6, 0.8], opacity: [1, 0.9, 0] }}
        transition={{ duration: 0.35 }}
      />
      
      {/* Fire sparks */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const distance = s.ring * 0.9 + Math.random() * 20;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.ring / 2 - 4,
              top: s.ring / 2 - 4,
              width: 8,
              height: 8,
              background: i % 2 === 0 ? '#ffaa00' : '#ff4400',
              boxShadow: '0 0 10px #ff6600',
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 20,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.35 + Math.random() * 0.15, ease: 'easeOut' }}
          />
        );
      })}
      
      {/* Smoke columns */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute rounded-full"
          style={{
            left: s.ring / 2 - 20 + (i - 1) * 15,
            top: s.ring / 2 - 15,
            width: 30,
            height: 30,
            background: 'radial-gradient(circle, rgba(60,60,60,0.7), transparent)',
          }}
          initial={{ scale: 0.5, opacity: 0.8, y: 0 }}
          animate={{ scale: 2, opacity: 0, y: -60 }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  );
});

BombExplosionVFX.displayName = 'BombExplosionVFX';
