import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useEffect } from 'react';

interface CinematicEffectsProps {
  isBossFight: boolean;
  killStreak: number;
  giftDamageMultiplier: number;
  screenShake: number;
}

// =============================================
// STUDIO QUALITY CINEMATIC EFFECTS - UPBEAT VERSION
// High-energy, exciting atmosphere with dynamic visuals
// =============================================

export const CinematicEffects = memo(({
  isBossFight,
  killStreak,
  giftDamageMultiplier,
  screenShake
}: CinematicEffectsProps) => {
  const [sparkPositions, setSparkPositions] = useState<{x: number; y: number; id: number; color: string}[]>([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [energyWave, setEnergyWave] = useState(0);
  
  // Generate colorful sparks for high action moments
  useEffect(() => {
    if (killStreak < 3 && giftDamageMultiplier < 1.3) return;
    
    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600'];
    const interval = setInterval(() => {
      setSparkPositions(prev => {
        const filtered = prev.filter(s => Date.now() - s.id < 800);
        if (filtered.length > 10) return filtered.slice(-10);
        
        return [...filtered, {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now(),
          color: colors[Math.floor(Math.random() * colors.length)]
        }];
      });
    }, 120);
    
    return () => clearInterval(interval);
  }, [killStreak, giftDamageMultiplier]);
  
  // Pulse animation for energy
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 0.08) % (Math.PI * 2));
      setEnergyWave(prev => (prev + 0.05) % 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);
  
  const pulseIntensity = Math.sin(pulsePhase) * 0.5 + 0.5;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* BACKGROUND ENERGY PULSE - Creates upbeat rhythm */}
      <motion.div
        className="absolute inset-0 z-5"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 120%, 
            rgba(0,255,255,${0.05 + pulseIntensity * 0.05}), 
            transparent 60%)`,
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 0.4, repeat: Infinity }}
      />
      
      {/* NEON EDGE GLOW - Dynamic border lighting */}
      <motion.div
        className="absolute inset-0 z-8"
        style={{
          boxShadow: `
            inset 0 0 30px rgba(0,255,255,${0.1 + pulseIntensity * 0.1}),
            inset 0 0 60px rgba(255,0,255,${0.05 + pulseIntensity * 0.08})
          `,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
      
      {/* RISING ENERGY PARTICLES - Upbeat floating orbs */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`energy-orb-${i}`}
          className="absolute rounded-full z-12"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            left: `${8 + i * 8}%`,
            bottom: -20,
            background: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
            boxShadow: `0 0 ${8 + i % 3 * 4}px ${i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00'}`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -400 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 80],
            opacity: [0, 0.8, 0.6, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* BOTTOM GLOW WAVE - Pulsing ground energy */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 z-10"
        style={{
          background: `linear-gradient(180deg, 
            transparent 0%,
            rgba(0,255,255,${0.1 + pulseIntensity * 0.1}) 50%,
            rgba(255,0,255,${0.15 + pulseIntensity * 0.1}) 100%)`,
          filter: 'blur(8px)',
        }}
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          scaleY: [1, 1.1, 1],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      
      {/* HORIZONTAL ENERGY WAVES - Flowing across screen */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-1 z-6"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.3), rgba(255,0,255,0.3), transparent)',
          filter: 'blur(4px)',
          transform: `translateX(${(energyWave - 0.5) * 200}%)`,
        }}
      />
      
      {/* CORNER FLARES - Dynamic corner accents */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, i) => (
        <motion.div
          key={corner}
          className={`absolute z-15 ${
            corner.includes('top') ? 'top-0' : 'bottom-0'
          } ${
            corner.includes('left') ? 'left-0' : 'right-0'
          }`}
          style={{
            width: 100,
            height: 100,
            background: `radial-gradient(circle at ${
              corner.includes('left') ? '0% ' : '100% '
            }${
              corner.includes('top') ? '0%' : '100%'
            }, rgba(${i % 2 === 0 ? '0,255,255' : '255,0,255'},0.15), transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
      
      {/* KILL STREAK ENERGY SPARKS - Celebratory effects */}
      <AnimatePresence>
        {killStreak >= 3 && sparkPositions.map(spark => (
          <motion.div
            key={spark.id}
            className="absolute z-20"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
            }}
            initial={{ scale: 0, opacity: 1, rotate: 0 }}
            animate={{ 
              scale: [0, 2, 0], 
              opacity: [1, 0.8, 0],
              rotate: [0, 180],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              style={{
                width: 3,
                height: 12,
                background: `linear-gradient(180deg, ${spark.color}, transparent)`,
                boxShadow: `0 0 10px ${spark.color}`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* MULTIPLIER POWER GLOW - Intensifies with damage multiplier */}
      {giftDamageMultiplier > 1 && (
        <motion.div
          className="absolute inset-0 z-5"
          style={{
            boxShadow: `
              inset 0 0 ${50 + (giftDamageMultiplier - 1) * 80}px rgba(255,${Math.floor(200 - (giftDamageMultiplier - 1) * 80)},0,${0.15 + (giftDamageMultiplier - 1) * 0.2})
            `,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
      
      {/* BOSS DANGER AURA - Red pulsing edges during boss fight */}
      {isBossFight && (
        <motion.div
          className="absolute inset-0 z-8"
          style={{
            boxShadow: 'inset 0 0 100px rgba(255,0,0,0.25), inset 0 0 200px rgba(100,0,0,0.2)',
          }}
          animate={{
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      
      {/* ACTION LINES - Speed lines during intense moments */}
      {screenShake > 0.5 && (
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`action-line-${i}`}
              className="absolute"
              style={{
                width: 4,
                height: 100 + Math.random() * 80,
                left: `${5 + i * 10}%`,
                top: `${10 + Math.random() * 50}%`,
                background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.5), transparent)`,
                transform: `rotate(${-20 + Math.random() * 15}deg)`,
              }}
              animate={{
                y: [-150, 500],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 0.25,
                repeat: Infinity,
                delay: i * 0.04,
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* AMBIENT FLOATING LIGHTS - Creates magical atmosphere */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ambient-light-${i}`}
          className="absolute rounded-full z-6"
          style={{
            width: 6,
            height: 6,
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 4) * 20}%`,
            background: i % 2 === 0 ? 'rgba(0,255,255,0.4)' : 'rgba(255,0,255,0.4)',
            boxShadow: `0 0 10px ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}`,
            filter: 'blur(2px)',
          }}
          animate={{
            y: [0, -20, 10, -15, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.3, 0.6, 0.4, 0.5, 0.3],
            scale: [1, 1.3, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
      
      {/* SCREEN EDGE ENERGY PULSES */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-2 z-12"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(0,255,255,0.5) 50%, transparent 90%)',
          filter: 'blur(2px)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2 z-12"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(255,0,255,0.5) 50%, transparent 90%)',
          filter: 'blur(2px)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
});

CinematicEffects.displayName = 'CinematicEffects';
