import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useEffect } from 'react';

interface CinematicEffectsProps {
  isBossFight: boolean;
  killStreak: number;
  giftDamageMultiplier: number;
  screenShake: number;
}

// =============================================
// STUDIO QUALITY CINEMATIC EFFECTS
// Adds atmosphere, energy, and polish to gameplay
// =============================================

export const CinematicEffects = memo(({
  isBossFight,
  killStreak,
  giftDamageMultiplier,
  screenShake
}: CinematicEffectsProps) => {
  const [sparkPositions, setSparkPositions] = useState<{x: number; y: number; id: number}[]>([]);
  const [smokePhase, setSmokePhase] = useState(0);
  
  // Generate random sparks for high action moments
  useEffect(() => {
    if (killStreak < 5 && giftDamageMultiplier < 1.5) return;
    
    const interval = setInterval(() => {
      setSparkPositions(prev => {
        const filtered = prev.filter(s => Date.now() - s.id < 1000);
        if (filtered.length > 6) return filtered.slice(-6);
        
        return [...filtered, {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now()
        }];
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [killStreak, giftDamageMultiplier]);
  
  // Smoke animation phase
  useEffect(() => {
    const interval = setInterval(() => {
      setSmokePhase(prev => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const smokeOffset = Math.sin(smokePhase) * 30;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* GROUND SMOKE - Dense battlefield atmosphere */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 z-12"
        style={{
          background: `
            linear-gradient(180deg, 
              transparent 0%, 
              rgba(40,45,55,0.4) 30%,
              rgba(35,40,50,0.6) 60%,
              rgba(30,35,45,0.8) 100%
            )
          `,
          filter: 'blur(8px)',
          transform: `translateX(${smokeOffset}px)`,
        }}
      />
      
      {/* Rising smoke wisps */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`smoke-wisp-${i}`}
          className="absolute z-11"
          style={{
            bottom: 60 + i * 20,
            left: `${15 + i * 25}%`,
            width: 80 + i * 30,
            height: 50 + i * 15,
            background: `radial-gradient(ellipse, rgba(50,55,65,${0.25 - i * 0.04}), transparent)`,
            filter: 'blur(12px)',
          }}
          animate={{
            x: [0, 40, -20, 30, 0],
            y: [0, -20, -10, -30, 0],
            opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
          }}
        />
      ))}
      
      {/* EMBERS - Floating fire particles in battle */}
      {isBossFight && [...Array(6)].map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full z-15"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${10 + i * 15}%`,
            bottom: 80,
            background: i % 2 === 0 ? '#ff6600' : '#ffaa00',
            boxShadow: `0 0 ${4 + i}px ${i % 2 === 0 ? '#ff4400' : '#ff8800'}`,
          }}
          animate={{
            y: [0, -200 - Math.random() * 150],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0.8, 0.6, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
      
      {/* KILL STREAK ENERGY - Corner sparks when on fire */}
      <AnimatePresence>
        {killStreak >= 5 && sparkPositions.map(spark => (
          <motion.div
            key={spark.id}
            className="absolute z-20"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-1 h-6"
              style={{
                background: 'linear-gradient(180deg, #ffff00, #ff6600, transparent)',
                transform: `rotate(${Math.random() * 360}deg)`,
                boxShadow: '0 0 10px #ff8800',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* MULTIPLIER GLOW - Screen edge glow based on damage multiplier */}
      {giftDamageMultiplier > 1 && (
        <motion.div
          className="absolute inset-0 z-5"
          style={{
            boxShadow: `
              inset 0 0 ${40 + (giftDamageMultiplier - 1) * 60}px rgba(255,${Math.floor(200 - (giftDamageMultiplier - 1) * 100)},0,${0.1 + (giftDamageMultiplier - 1) * 0.15})
            `,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      
      {/* BOSS DANGER ZONE - Red pulsing edges during boss fight */}
      {isBossFight && (
        <motion.div
          className="absolute inset-0 z-8"
          style={{
            boxShadow: 'inset 0 0 80px rgba(255,0,0,0.2), inset 0 0 150px rgba(100,0,0,0.15)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      {/* ACTION LINES - Speed lines during intense moments */}
      {screenShake > 0.5 && (
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`action-line-${i}`}
              className="absolute"
              style={{
                width: 3,
                height: 80 + Math.random() * 60,
                left: `${10 + i * 12}%`,
                top: `${20 + Math.random() * 40}%`,
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent)',
                transform: `rotate(${-15 + Math.random() * 10}deg)`,
              }}
              animate={{
                y: [-100, 400],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* DUST MOTES - Floating particles for atmosphere */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full z-6"
          style={{
            width: 2,
            height: 2,
            left: `${5 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: 'rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        />
      ))}
      
      {/* HEAT DISTORTION - Subtle wave at ground level */}
      <motion.div
        className="absolute bottom-20 left-0 right-0 h-20 z-9"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(0.5px)',
        }}
        animate={{
          scaleY: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
});

CinematicEffects.displayName = 'CinematicEffects';
