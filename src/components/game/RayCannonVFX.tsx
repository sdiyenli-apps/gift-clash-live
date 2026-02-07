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
// STUDIO-QUALITY RAY CANNON VFX
// Cinematic laser beam with electricity, plasma, and screen-shaking power
// =============================================

export const RayCannonVFX = memo(({ isActive, heroX, heroY, cameraX, duration = 3 }: RayCannonVFXProps) => {
  const [phase, setPhase] = useState<'charging' | 'firing' | 'cooling'>('charging');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setPhase('charging');
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 0.033;
        if (newTime < 0.4) setPhase('charging');
        else if (newTime < duration - 0.2) setPhase('firing');
        else setPhase('cooling');
        return newTime;
      });
      setPulseIntensity(Math.sin(Date.now() / 30) * 0.5 + 0.5);
    }, 33);
    
    return () => clearInterval(interval);
  }, [isActive, duration]);
  
  if (!isActive) return null;
  
  const screenX = heroX - cameraX + 60;
  const screenY = 280 - heroY - 25;
  
  return (
    <AnimatePresence>
      {/* CINEMATIC SCREEN OVERLAY - pulsing danger effect */}
      {phase === 'firing' && (
        <>
          {/* Screen-wide plasma glow */}
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 100% at 15% 50%, 
                rgba(255,0,100,${0.25 + pulseIntensity * 0.15}), 
                rgba(255,100,0,0.1) 40%,
                transparent 70%)`,
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          {/* Scanline overlay for retro feel */}
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            }}
          />
        </>
      )}
      
      {/* CHARGING PHASE - Dramatic energy gathering */}
      {phase === 'charging' && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{
            left: screenX - 30,
            bottom: screenY - 30,
            width: 60,
            height: 60,
          }}
        >
          {/* Core charging orb - plasma effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fff 0%, #ff0066 30%, #ff00ff 60%, rgba(255,0,100,0) 80%)',
              boxShadow: `
                0 0 20px #ff0066,
                0 0 40px #ff00ff,
                0 0 80px #ff0066,
                inset 0 0 20px rgba(255,255,255,0.8)
              `,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 2, 1.5, 2.2, 1.8],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          
          {/* Electric arc particles converging */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 4,
                  height: 16,
                  background: `linear-gradient(180deg, ${i % 2 === 0 ? '#00ffff' : '#ff0066'}, transparent)`,
                  borderRadius: 2,
                  left: 28,
                  top: 22,
                  transformOrigin: 'center bottom',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#00ffff' : '#ff0066'}`,
                }}
                animate={{
                  x: [Math.cos(angle) * 80, 0],
                  y: [Math.sin(angle) * 80, 0],
                  scale: [1.2, 0],
                  opacity: [1, 0.8, 0],
                  rotate: [angle * (180 / Math.PI), 0],
                }}
                transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.025 }}
              />
            );
          })}
          
          {/* Inner lightning crackle */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 0 15px #fff, inset 0 0 15px #fff',
            }}
            animate={{ 
              scale: [0.5, 1.2, 0.8, 1.4],
              opacity: [0.5, 1, 0.7, 1],
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
        </motion.div>
      )}
      
      {/* FIRING PHASE - DEVASTATING LASER BEAM */}
      {phase === 'firing' && (
        <>
          {/* Main beam - multi-layered plasma */}
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: screenX,
              bottom: screenY - 40,
              width: 800,
              height: 80,
            }}
          >
            {/* Outer plasma field - magenta glow */}
            <motion.div
              className="absolute"
              style={{
                left: -10,
                top: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255,0,102,0.7) 0%, rgba(255,0,102,0.5) 60%, transparent 95%)',
                filter: 'blur(16px)',
              }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                scaleY: [1, 1.3, 1],
              }}
              transition={{ duration: 0.06, repeat: Infinity }}
            />
            
            {/* Mid beam - orange/red plasma */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 15,
                width: '100%',
                height: 50,
                background: 'linear-gradient(90deg, rgba(255,100,0,0.8) 0%, rgba(255,50,0,0.7) 50%, transparent 90%)',
                filter: 'blur(8px)',
              }}
              animate={{ 
                opacity: [0.7, 1, 0.7],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 0.04, repeat: Infinity }}
            />
            
            {/* Core beam - WHITE HOT center */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 28,
                width: '100%',
                height: 24,
                background: 'linear-gradient(90deg, #fff 0%, #fff 70%, transparent 95%)',
                boxShadow: `
                  0 0 10px #fff,
                  0 0 20px #ff0066,
                  0 0 40px #ff6600,
                  0 0 80px #ff0066
                `,
              }}
              animate={{ 
                scaleY: [1, 1.3, 0.9, 1.2, 1],
                opacity: [1, 0.95, 1],
              }}
              transition={{ duration: 0.035, repeat: Infinity }}
            />
            
            {/* Inner core - ultra bright */}
            <motion.div
              className="absolute"
              style={{
                left: 0,
                top: 34,
                width: '95%',
                height: 12,
                background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.95) 80%, transparent 100%)',
              }}
              animate={{ scaleY: [1, 1.1, 1] }}
              transition={{ duration: 0.025, repeat: Infinity }}
            />
            
            {/* Energy pulses traveling along beam */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 40 + i * 5,
                  height: 40 + i * 5,
                  top: 20 - i * 2,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(0,255,255,0.6), transparent)',
                  boxShadow: '0 0 20px #00ffff, 0 0 40px #ff0066',
                }}
                animate={{
                  x: [0, 750],
                  scale: [0.5, 1.2, 0.8],
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{ 
                  duration: 0.4, 
                  repeat: Infinity, 
                  delay: i * 0.08,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Electric arcs along beam */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`arc-${i}`}
                className="absolute"
                style={{
                  left: 80 + i * 100,
                  top: 20 + (Math.random() - 0.5) * 30,
                  width: 60,
                  height: 3,
                  background: '#00ffff',
                  boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
                  transform: `rotate(${(Math.random() - 0.5) * 40}deg)`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleX: [0.3, 1.5, 0.5],
                }}
                transition={{ 
                  duration: 0.12, 
                  repeat: Infinity, 
                  delay: i * 0.06 + Math.random() * 0.1,
                }}
              />
            ))}
          </motion.div>
          
          {/* Muzzle flash - massive energy discharge */}
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: screenX - 50,
              bottom: screenY - 60,
              width: 120,
              height: 120,
            }}
          >
            {/* Main muzzle glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 0%, #ff0066 30%, #ff00ff 50%, transparent 70%)',
                boxShadow: `
                  0 0 40px #fff,
                  0 0 80px #ff0066,
                  0 0 120px #ff00ff
                `,
              }}
              animate={{ 
                scale: [1, 1.4, 1.1, 1.5, 1],
                opacity: [1, 0.9, 1, 0.85, 1],
              }}
              transition={{ duration: 0.08, repeat: Infinity }}
            />
            
            {/* Muzzle sparks */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  left: 57,
                  top: 57,
                  background: '#fff',
                  boxShadow: '0 0 8px #fff, 0 0 16px #ff0066',
                }}
                animate={{
                  x: [(Math.random() - 0.5) * 20, (Math.random() - 0.3) * 80],
                  y: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{ 
                  duration: 0.2 + Math.random() * 0.15, 
                  repeat: Infinity, 
                  delay: i * 0.02,
                }}
              />
            ))}
          </motion.div>
          
          {/* Impact explosions along beam - DESTRUCTION! */}
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={`impact-${i}`}
              className="absolute z-45 pointer-events-none"
              style={{
                left: screenX + 60 + i * 90,
                bottom: screenY - 50 + (Math.sin(i * 1.5) * 25),
                width: 80,
                height: 80,
              }}
            >
              {/* Impact fireball */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #fff 10%, #ffcc00 30%, #ff6600 50%, #ff0000 70%, transparent 90%)',
                  boxShadow: `0 0 20px #ff6600, 0 0 40px #ff0000`,
                }}
                animate={{ 
                  scale: [0.2, 1.8, 0.8, 1.5, 0.5],
                  opacity: [0.5, 1, 0.8, 0.9, 0.3],
                  y: [-10, 5, -5, 0],
                }}
                transition={{ 
                  duration: 0.25, 
                  repeat: Infinity, 
                  delay: i * 0.08,
                }}
              />
              {/* Impact sparks */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  left: 34,
                  top: 10,
                  background: '#ffff00',
                  boxShadow: '0 0 15px #ffff00',
                }}
                animate={{
                  y: [-30, 20],
                  x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [1, 0.2],
                }}
                transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
              />
            </motion.div>
          ))}
          
          {/* Screen edge intensity effect */}
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            style={{
              boxShadow: `
                inset 0 0 100px rgba(255,0,102,0.5),
                inset 0 0 200px rgba(255,100,0,0.3)
              `,
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          
          {/* POWER indicator */}
          <motion.div
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-60 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.12, repeat: Infinity }}
          >
            <div
              className="text-3xl font-black tracking-wider"
              style={{
                color: '#fff',
                textShadow: `
                  0 0 10px #ff0066,
                  0 0 20px #ff0066,
                  0 0 40px #ff00ff,
                  0 0 60px #ff0066,
                  2px 2px 0 #000,
                  -2px -2px 0 #000
                `,
                letterSpacing: '0.2em',
              }}
            >
              ⚡ RAY CANNON ⚡
            </div>
            <div
              className="text-center text-sm font-bold mt-1"
              style={{
                color: '#00ffff',
                textShadow: '0 0 10px #00ffff',
              }}
            >
              MAXIMUM POWER
            </div>
          </motion.div>
        </>
      )}
      
      {/* COOLING PHASE - Beam dissipating with residual energy */}
      {phase === 'cooling' && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{
            left: screenX,
            bottom: screenY - 20,
            width: 700,
            height: 40,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(255,0,102,0.6), rgba(255,100,0,0.3), transparent)',
              filter: 'blur(12px)',
            }}
          />
          {/* Residual sparks */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`residual-${i}`}
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                left: 50 + i * 120,
                top: 16,
                background: '#ff0066',
                boxShadow: '0 0 10px #ff0066',
              }}
              animate={{ 
                opacity: [1, 0], 
                y: [0, -20],
                scale: [1, 0.3],
              }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

RayCannonVFX.displayName = 'RayCannonVFX';
