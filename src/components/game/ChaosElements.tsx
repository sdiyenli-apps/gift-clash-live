import { motion, AnimatePresence } from 'framer-motion';
import { NeonLight, Explosion } from '@/types/game';
import { forwardRef } from 'react';

interface ChaosElementsProps {
  neonLights: NeonLight[];
  explosions: Explosion[];
  cameraX: number;
}

export const ChaosElements = ({ neonLights, explosions, cameraX }: ChaosElementsProps) => {
  return (
    <>
      {/* Neon Lights - reduced for performance */}
      {neonLights.slice(0, 2).map(light => (
        <div
          key={light.id}
          className="absolute pointer-events-none"
          style={{
            left: light.x - cameraX,
            top: light.y,
            width: light.size * 3,
            height: light.size,
            background: light.color,
            borderRadius: '50%',
            filter: `blur(${light.size / 4}px)`,
            opacity: 0.6,
          }}
        />
      ))}
      
      {/* Explosions - limited */}
      <AnimatePresence>
        {explosions.slice(0, 3).map(explosion => (
          <ExplosionSprite key={explosion.id} explosion={explosion} cameraX={cameraX} />
        ))}
      </AnimatePresence>
    </>
  );
};

const ExplosionSprite = forwardRef<HTMLDivElement, { explosion: Explosion; cameraX: number }>(
  ({ explosion, cameraX }, ref) => {
    const screenX = explosion.x - cameraX;
    if (screenX < -100 || screenX > 1100) return null;
    
    // Check if this is a tank explosion (larger size = tank)
    const isTankExplosion = explosion.size >= 100;
    const aoeRadius = isTankExplosion ? 120 : 0;
    
    return (
      <motion.div
        ref={ref}
        className="absolute pointer-events-none z-5"
        style={{
          left: screenX - explosion.size / 2,
          top: explosion.y - explosion.size / 2,
          width: explosion.size,
          height: explosion.size,
        }}
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: [0.3, 1.5, 2.5], opacity: [1, 0.9, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* TANK AOE RADIUS INDICATOR */}
        {isTankExplosion && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: aoeRadius * 2,
              height: aoeRadius * 2,
              marginLeft: -aoeRadius,
              marginTop: -aoeRadius,
              border: '3px solid rgba(255,100,0,0.8)',
              background: 'radial-gradient(circle, rgba(255,150,0,0.3), rgba(255,50,0,0.1), transparent 70%)',
              boxShadow: '0 0 30px rgba(255,100,0,0.6), inset 0 0 40px rgba(255,200,0,0.3)',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.2, 1], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
        
        {/* Core explosion */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isTankExplosion 
              ? 'radial-gradient(circle, #ffffff 0%, #ffcc00 15%, #ff8800 35%, #ff4400 55%, #ff0000 75%, transparent 100%)'
              : 'radial-gradient(circle, #ffffff 0%, #ffff00 20%, #ff8800 40%, #ff4400 60%, #ff0000 80%, transparent 100%)',
            filter: isTankExplosion ? 'blur(5px)' : 'blur(3px)',
          }}
        />
        
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: isTankExplosion ? -20 : -4,
            background: isTankExplosion 
              ? 'radial-gradient(circle, rgba(255,150,0,0.7), rgba(255,50,0,0.4) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(255,100,0,0.6), transparent 70%)',
          }}
          animate={{ scale: [1, 1.8], opacity: [0.9, 0] }}
          transition={{ duration: isTankExplosion ? 0.5 : 0.4 }}
        />
        
        {/* Explosion rings */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${i === 0 ? '#ffff00' : i === 1 ? '#ff8800' : '#ff4400'}`,
              boxShadow: `0 0 10px ${i === 0 ? '#ffff00' : i === 1 ? '#ff8800' : '#ff4400'}`,
            }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5 + i * 0.5, opacity: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          />
        ))}
        
        {/* Sparks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: 2,
              height: 2,
              background: i % 2 === 0 ? '#ffff00' : '#ff6600',
              boxShadow: `0 0 6px ${i % 2 === 0 ? '#ffff00' : '#ff6600'}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(i * Math.PI / 3) * explosion.size,
              y: Math.sin(i * Math.PI / 3) * explosion.size,
              opacity: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    );
  }
);
ExplosionSprite.displayName = 'ExplosionSprite';
