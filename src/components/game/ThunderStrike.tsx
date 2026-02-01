import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

// =============================================
// THUNDER STRIKE VFX - Atmospheric battlefield effect
// =============================================

interface ThunderStrikeProps {
  isActive: boolean;
  strikeX?: number; // Optional specific X position
}

export const ThunderStrike = memo(({ isActive, strikeX }: ThunderStrikeProps) => {
  const [showFlash, setShowFlash] = useState(false);
  const [showBolt, setShowBolt] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      // Flash first
      setShowFlash(true);
      setTimeout(() => {
        setShowBolt(true);
      }, 50);
      setTimeout(() => {
        setShowFlash(false);
      }, 200);
      setTimeout(() => {
        setShowBolt(false);
      }, 400);
    }
  }, [isActive]);
  
  if (!isActive && !showFlash && !showBolt) return null;
  
  const x = strikeX ?? (100 + Math.random() * 400);
  
  return (
    <>
      {/* Screen flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(200,220,255,0.4) 50%, transparent 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, times: [0, 0.1, 0.2, 0.3, 1] }}
          />
        )}
      </AnimatePresence>
      
      {/* Lightning bolt */}
      <AnimatePresence>
        {showBolt && (
          <motion.div
            className="absolute pointer-events-none z-45"
            style={{
              left: x,
              top: 0,
              width: 40,
              height: '100%',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Main bolt */}
            <svg
              viewBox="0 0 40 400"
              className="w-full h-full"
              style={{
                filter: 'drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #00aaff)',
              }}
            >
              <motion.path
                d="M20 0 L15 80 L25 85 L10 160 L30 170 L5 250 L35 260 L15 350 L25 400"
                stroke="url(#lightning-gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1, 0.5, 0] }}
                transition={{ duration: 0.35, times: [0, 0.1, 0.5, 0.8, 1] }}
              />
              <defs>
                <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#00ffff" />
                  <stop offset="70%" stopColor="#00aaff" />
                  <stop offset="100%" stopColor="#0066ff" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Branch bolts */}
            {[1, 2, 3].map(i => (
              <motion.div
                key={`branch-${i}`}
                className="absolute"
                style={{
                  left: i % 2 === 0 ? -15 : 30,
                  top: 80 + i * 70,
                  width: 25,
                  height: 3,
                  background: 'linear-gradient(90deg, #00ffff, #ffffff, transparent)',
                  transform: `rotate(${i % 2 === 0 ? 30 : -30}deg)`,
                  boxShadow: '0 0 10px #00ffff',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1, 0.5], opacity: [0, 1, 0] }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              />
            ))}
            
            {/* Ground impact */}
            <motion.div
              className="absolute"
              style={{
                left: -40,
                bottom: 70,
                width: 120,
                height: 40,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,255,255,0.9) 0%, rgba(0,170,255,0.5) 50%, transparent 70%)',
                  boxShadow: '0 0 30px #00ffff, 0 0 60px #00aaff',
                }}
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: [0.3, 2, 2.5], opacity: [1, 0.7, 0] }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Ground sparks */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI;
                return (
                  <motion.div
                    key={`spark-${i}`}
                    className="absolute rounded-full"
                    style={{
                      left: 55,
                      top: 18,
                      width: 6,
                      height: 6,
                      background: '#00ffff',
                      boxShadow: '0 0 8px #00ffff',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos(angle) * (40 + Math.random() * 30),
                      y: -Math.sin(angle) * (20 + Math.random() * 15),
                      opacity: 0,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                );
              })}
              
              {/* Scorch mark */}
              <motion.div
                className="absolute"
                style={{
                  left: 35,
                  top: 25,
                  width: 50,
                  height: 15,
                  background: 'radial-gradient(ellipse, rgba(50,50,50,0.8), transparent)',
                  borderRadius: '50%',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.8, 0.6], scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

ThunderStrike.displayName = 'ThunderStrike';

// Thunder Controller - manages random thunder strikes
interface ThunderControllerProps {
  isBossFight: boolean;
}

export const ThunderController = memo(({ isBossFight }: ThunderControllerProps) => {
  const [isStriking, setIsStriking] = useState(false);
  const [strikeX, setStrikeX] = useState(300);
  
  useEffect(() => {
    // REDUCED frequency for better performance
    const interval = setInterval(() => {
      const chance = isBossFight ? 0.08 : 0.02; // Much lower chance
      if (Math.random() < chance) {
        setStrikeX(80 + Math.random() * 440);
        setIsStriking(true);
        setTimeout(() => setIsStriking(false), 400);
      }
    }, 4000); // Less frequent checks (was 2000)
    
    return () => clearInterval(interval);
  }, [isBossFight]);
  
  return <ThunderStrike isActive={isStriking} strikeX={strikeX} />;
});

ThunderController.displayName = 'ThunderController';
