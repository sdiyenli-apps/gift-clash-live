import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import grenadeExplosionGif from '@/assets/grenade-explosion.gif';

interface GrenadeExplosion {
  id: string;
  x: number;
  y: number;
  timer: number;
}

interface GrenadeExplosionVFXProps {
  explosions: GrenadeExplosion[];
  cameraX: number;
}

// Individual explosion effect using the uploaded vortex GIF
const ExplosionEffect = memo(({ explosion, cameraX }: { explosion: GrenadeExplosion; cameraX: number }) => {
  const screenX = explosion.x - cameraX;
  
  // Don't render if off-screen
  if (screenX < -200 || screenX > 900) return null;
  
  // Map y from game coords to screen position
  const screenY = Math.min(500, Math.max(60, explosion.y - 80));
  
  return (
    <motion.div
      className="absolute pointer-events-none z-45"
      style={{
        left: screenX - 150, // Center the 300px explosion
        bottom: screenY - 100,
        width: 300,
        height: 300,
      }}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      {/* Main explosion GIF - THE VORTEX EFFECT */}
      <img
        src={grenadeExplosionGif}
        alt="Explosion"
        className="w-full h-full object-contain"
        style={{
          filter: 'brightness(1.3) saturate(1.2)',
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Electric/EMP overlay glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,255,255,0.6), rgba(0,200,255,0.3) 40%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
        animate={{ opacity: [0.8, 0.4, 0.8] }}
        transition={{ duration: 0.15, repeat: 6 }}
      />
      
      {/* Outer ring pulse */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '4px solid rgba(0,255,255,0.8)',
          boxShadow: '0 0 40px #00ffff, 0 0 80px rgba(0,255,255,0.5)',
        }}
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      
      {/* Secondary ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '3px solid rgba(255,255,0,0.7)',
          boxShadow: '0 0 30px #ffff00',
        }}
        initial={{ scale: 0.4, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      />
      
      {/* Electric arcs radiating outward */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={`arc-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: 120,
            height: 3,
            background: 'linear-gradient(90deg, #00ffff, #fff, transparent)',
            transformOrigin: 'left center',
            transform: `rotate(${i * 45}deg)`,
            filter: 'blur(1px)',
            boxShadow: '0 0 8px #00ffff',
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
        />
      ))}
      
      {/* Sparks flying out */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 100 + Math.random() * 80;
        return (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: 6,
              height: 6,
              background: i % 2 === 0 ? '#00ffff' : '#ffff00',
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#00ffff' : '#ffff00'}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.4 + Math.random() * 0.2, ease: 'easeOut' }}
          />
        );
      })}
    </motion.div>
  );
});

ExplosionEffect.displayName = 'ExplosionEffect';

// Main container for grenade explosions
export const GrenadeExplosionVFX = memo(({ explosions, cameraX }: GrenadeExplosionVFXProps) => {
  return (
    <AnimatePresence>
      {explosions.map((explosion) => (
        <ExplosionEffect 
          key={explosion.id} 
          explosion={explosion} 
          cameraX={cameraX} 
        />
      ))}
    </AnimatePresence>
  );
});

GrenadeExplosionVFX.displayName = 'GrenadeExplosionVFX';

// Hook to track grenade explosions
export const useGrenadeExplosions = () => {
  const [explosions, setExplosions] = useState<GrenadeExplosion[]>([]);
  
  const triggerExplosion = (x: number, y: number) => {
    const newExplosion: GrenadeExplosion = {
      id: `grenade-exp-${Date.now()}-${Math.random()}`,
      x,
      y,
      timer: 1.0, // 1 second duration for the explosion effect
    };
    setExplosions(prev => [...prev, newExplosion]);
    
    // Remove after animation completes
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== newExplosion.id));
    }, 1000);
  };
  
  return { explosions, triggerExplosion };
};
