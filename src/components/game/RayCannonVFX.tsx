import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

interface RayCannonVFXProps {
  isActive: boolean;
  heroX: number;
  heroY: number;
  cameraX: number;
  duration?: number;
}

// =============================================
// RAY CANNON VFX - Powerful laser beam attack
// Damages everything in its path for 3 seconds
// =============================================

export const RayCannonVFX = memo(({ isActive, heroX, heroY, cameraX, duration = 3 }: RayCannonVFXProps) => {
  const [phase, setPhase] = useState<'charging' | 'firing' | 'cooling'>('charging');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setPhase('charging');
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 0.05;
        if (newTime < 0.5) setPhase('charging');
        else if (newTime < duration - 0.3) setPhase('firing');
        else setPhase('cooling');
        return newTime;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive, duration]);
  
  if (!isActive) return null;
  
  const screenX = heroX - cameraX + 45; // Start from hero's right side
  const screenY = 280 - heroY - 20; // Hero's torso height
  
  return (
    <AnimatePresence>
      {/* Full screen danger flash during firing */}
      {phase === 'firing' && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(255,0,100,0.3), transparent 60%)',
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />
      )}
      
      {/* Charging phase - energy gathering */}
      {phase === 'charging' && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{
            left: screenX - 20,
            bottom: screenY - 20,
            width: 40,
            height: 40,
          }}
        >
          {/* Charging orb */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fff, #ff0066, #ff00ff)',
              boxShadow: '0 0 30px #ff0066, 0 0 60px #ff00ff',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1, 1.5] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          
          {/* Energy particles gathering */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#ff0066' : '#00ffff',
                  boxShadow: `0 0 8px ${i % 2 === 0 ? '#ff0066' : '#00ffff'}`,
                  left: 16,
                  top: 16,
                }}
                animate={{
                  x: [Math.cos(angle) * 50, 0],
                  y: [Math.sin(angle) * 50, 0],
                  scale: [1, 0],
                  opacity: [1, 0],
                }}
                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.04 }}
              />
            );
          })}
        </motion.div>
      )}
      
      {/* Firing phase - MASSIVE LASER BEAM */}
      {phase === 'firing' && (
        <>
          {/* Main beam - extends across entire screen */}
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: screenX,
              bottom: screenY - 25,
              width: 700, // Full screen width
              height: 50,
            }}
          >
            {/* Beam core - white hot center */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 15,
                width: '100%',
                height: 20,
                background: 'linear-gradient(90deg, #fff, #fff 80%, transparent)',
                boxShadow: '0 0 20px #fff, 0 0 40px #ff0066, 0 0 80px #ff00ff',
              }}
              animate={{ scaleY: [1, 1.2, 1] }}
              transition={{ duration: 0.05, repeat: Infinity }}
            />
            
            {/* Outer beam glow - magenta */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 5,
                width: '100%',
                height: 40,
                background: 'linear-gradient(90deg, rgba(255,0,102,0.8), rgba(255,0,102,0.6) 70%, transparent)',
                filter: 'blur(4px)',
              }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
            
            {/* Energy rings along beam */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full"
                style={{
                  left: 100 + i * 120,
                  top: 10,
                  width: 30,
                  height: 30,
                  border: '3px solid #00ffff',
                  boxShadow: '0 0 15px #00ffff',
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
          
          {/* Muzzle flash at hero */}
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: screenX - 30,
              bottom: screenY - 40,
              width: 80,
              height: 80,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 30%, #ff0066 60%, transparent 80%)',
                boxShadow: '0 0 50px #ff0066, 0 0 100px #ff00ff',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Impact explosions along beam path */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`impact-${i}`}
              className="absolute z-45 pointer-events-none"
              style={{
                left: screenX + 80 + i * 100,
                bottom: screenY - 30 + (Math.random() - 0.5) * 20,
                width: 60,
                height: 60,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #fff, #ff8800, #ff4400, transparent)',
                  boxShadow: '0 0 30px #ff6600',
                }}
                animate={{ 
                  scale: [0.3, 1.5, 0.5, 1.2],
                  opacity: [0.8, 1, 0.6, 0],
                }}
                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.1 }}
              />
            </motion.div>
          ))}
          
          {/* Screen shake simulation via edge flashes */}
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px rgba(255,0,102,0.4)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          
          {/* POWER text */}
          <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-60 pointer-events-none text-2xl font-black"
            style={{
              color: '#fff',
              textShadow: '0 0 20px #ff0066, 0 0 40px #ff00ff',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            ⚡ RAY CANNON ⚡
          </motion.div>
        </>
      )}
      
      {/* Cooling phase - beam dissipating */}
      {phase === 'cooling' && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{
            left: screenX,
            bottom: screenY - 15,
            width: 600,
            height: 30,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(255,0,102,0.6), transparent)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

RayCannonVFX.displayName = 'RayCannonVFX';
