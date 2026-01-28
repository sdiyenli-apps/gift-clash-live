import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import bossLaserFx from '@/assets/boss-laser-fx.png';

// =============================================
// BOSS NEON LASER ATTACK - Lock-on laser that deals constant damage
// =============================================

interface BossNeonLaserProps {
  isActive: boolean;
  bossX: number;
  bossY: number;
  heroX: number;
  heroY: number;
  cameraX: number;
  duration?: number; // Lock-on duration in seconds
}

export const BossNeonLaser = memo(({ 
  isActive, 
  bossX, 
  bossY, 
  heroX, 
  heroY, 
  cameraX,
  duration = 3 
}: BossNeonLaserProps) => {
  const [phase, setPhase] = useState<'idle' | 'warning' | 'charging' | 'firing'>('idle');
  const [lockX, setLockX] = useState(0);
  const [lockY, setLockY] = useState(0);
  
  useEffect(() => {
    if (isActive) {
      // Phase 1: Warning (0.5s)
      setPhase('warning');
      setLockX(heroX);
      setLockY(heroY);
      
      // Phase 2: Charging (0.5s)
      const chargeTimer = setTimeout(() => {
        setPhase('charging');
      }, 500);
      
      // Phase 3: Firing (duration seconds)
      const fireTimer = setTimeout(() => {
        setPhase('firing');
      }, 1000);
      
      // End
      const endTimer = setTimeout(() => {
        setPhase('idle');
      }, 1000 + duration * 1000);
      
      return () => {
        clearTimeout(chargeTimer);
        clearTimeout(fireTimer);
        clearTimeout(endTimer);
      };
    } else {
      setPhase('idle');
    }
  }, [isActive, heroX, heroY, duration]);
  
  if (phase === 'idle') return null;
  
  const screenBossX = bossX - cameraX;
  const screenHeroX = heroX - cameraX;
  
  // Calculate laser angle and length
  const dx = screenHeroX - screenBossX;
  const dy = (280 - heroY) - (280 - bossY);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const length = Math.sqrt(dx * dx + dy * dy);
  
  return (
    <>
      {/* WARNING PHASE - Targeting reticle on hero */}
      <AnimatePresence>
        {phase === 'warning' && (
          <>
            {/* Warning indicator at hero position */}
            <motion.div
              className="absolute pointer-events-none z-50"
              style={{
                left: screenHeroX - 40,
                bottom: 280 - heroY - 40,
                width: 80,
                height: 80,
              }}
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: [2, 1, 1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Targeting circles */}
              <motion.div
                className="absolute inset-0 border-4 border-red-500 rounded-full"
                style={{ boxShadow: '0 0 20px #ff0000' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 border-2 border-red-400 rounded-full"
                style={{ boxShadow: '0 0 10px #ff0000' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-8 bg-red-500/50 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              
              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500" style={{ boxShadow: '0 0 5px #ff0000' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-0.5 bg-red-500" style={{ boxShadow: '0 0 5px #ff0000' }} />
              </div>
              
              {/* WARNING text */}
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 font-black text-sm whitespace-nowrap"
                style={{ textShadow: '0 0 10px #ff0000' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                ⚠️ LASER LOCK ⚠️
              </motion.div>
            </motion.div>
            
            {/* Warning line from boss to target */}
            <motion.div
              className="absolute pointer-events-none z-45"
              style={{
                left: screenBossX,
                bottom: 280 - bossY,
                width: length,
                height: 4,
                background: 'linear-gradient(90deg, rgba(255,0,0,0.3), rgba(255,0,0,0.8))',
                transformOrigin: 'left center',
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3], scaleX: 1 }}
              transition={{ duration: 0.5, opacity: { repeat: Infinity, duration: 0.2 } }}
            />
          </>
        )}
      </AnimatePresence>
      
      {/* CHARGING PHASE - Energy gathering at boss */}
      <AnimatePresence>
        {phase === 'charging' && (
          <motion.div
            className="absolute pointer-events-none z-50"
            style={{
              left: screenBossX - 60,
              bottom: 280 - bossY - 30,
              width: 120,
              height: 60,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Charging orb */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ff0000 0%, #ff4400 50%, transparent 70%)',
                boxShadow: '0 0 40px #ff0000, 0 0 80px #ff4400',
              }}
              animate={{ scale: [0.5, 1.5, 2], opacity: [0.5, 1, 0.8] }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Energy particles gathering */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: 55,
                    top: 25,
                    background: '#ff0000',
                    boxShadow: '0 0 10px #ff0000',
                  }}
                  initial={{
                    x: Math.cos(angle) * 80,
                    y: Math.sin(angle) * 80,
                    opacity: 0,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* FIRING PHASE - Full neon laser */}
      <AnimatePresence>
        {phase === 'firing' && (
          <>
            {/* Main laser beam using sprite */}
            <motion.div
              className="absolute pointer-events-none z-55"
              style={{
                left: screenBossX - 20,
                bottom: 280 - bossY - 30,
                width: length + 100,
                height: 80,
                transformOrigin: 'left center',
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Laser sprite - stretched to fill */}
              <motion.img
                src={bossLaserFx}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(1.5) saturate(1.2)',
                  mixBlendMode: 'screen',
                }}
                animate={{ 
                  filter: [
                    'brightness(1.5) saturate(1.2) hue-rotate(0deg)',
                    'brightness(2) saturate(1.5) hue-rotate(10deg)',
                    'brightness(1.5) saturate(1.2) hue-rotate(0deg)',
                  ] 
                }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
              
              {/* Core beam glow */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,0,0,0.8), rgba(255,100,0,0.6), rgba(255,0,0,0.4))',
                  filter: 'blur(8px)',
                }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.1, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Impact point at hero */}
            <motion.div
              className="absolute pointer-events-none z-55"
              style={{
                left: screenHeroX - 30,
                bottom: 280 - heroY - 30,
                width: 60,
                height: 60,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, #ff0000 40%, #ff4400 70%, transparent 100%)',
                  boxShadow: '0 0 30px #ff0000, 0 0 60px #ff4400',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 0.1, repeat: Infinity }}
              />
              
              {/* DAMAGE text */}
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-500 font-black text-xs whitespace-nowrap"
                style={{ textShadow: '0 0 5px #ff0000, 2px 2px 0 #000' }}
                animate={{ y: [-5, -15, -5], opacity: [1, 0.7, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🔥 BURNING 🔥
              </motion.div>
            </motion.div>
            
            {/* Screen flash during fire */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,0,0,0.2), transparent 60%)',
              }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
});

BossNeonLaser.displayName = 'BossNeonLaser';

// Large enemy laser attack (sentinel, giant)
interface EnemyLaserAttackProps {
  isActive: boolean;
  enemyX: number;
  enemyY: number;
  heroX: number;
  cameraX: number;
  enemyType: 'sentinel' | 'giant' | 'tank';
}

export const EnemyLaserAttack = memo(({ 
  isActive, 
  enemyX, 
  enemyY, 
  heroX,
  cameraX,
  enemyType 
}: EnemyLaserAttackProps) => {
  const [phase, setPhase] = useState<'idle' | 'lockon' | 'firing'>('idle');
  
  useEffect(() => {
    if (isActive) {
      setPhase('lockon');
      const fireTimer = setTimeout(() => setPhase('firing'), 500);
      const endTimer = setTimeout(() => setPhase('idle'), 2500); // 2s laser
      
      return () => {
        clearTimeout(fireTimer);
        clearTimeout(endTimer);
      };
    } else {
      setPhase('idle');
    }
  }, [isActive]);
  
  if (phase === 'idle') return null;
  
  const screenEnemyX = enemyX - cameraX;
  const screenHeroX = heroX - cameraX;
  const length = Math.abs(screenEnemyX - screenHeroX);
  
  const laserColor = enemyType === 'giant' ? '#ff6600' : enemyType === 'sentinel' ? '#ff00ff' : '#00ffff';
  
  return (
    <>
      {/* Lock-on warning */}
      {phase === 'lockon' && (
        <motion.div
          className="absolute pointer-events-none z-45"
          style={{
            left: Math.min(screenEnemyX, screenHeroX),
            bottom: 280 - enemyY,
            width: length,
            height: 6,
            background: `linear-gradient(90deg, transparent, ${laserColor}80, transparent)`,
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        />
      )}
      
      {/* Firing laser */}
      {phase === 'firing' && (
        <>
          <motion.div
            className="absolute pointer-events-none z-50"
            style={{
              left: Math.min(screenEnemyX, screenHeroX) - 10,
              bottom: 280 - enemyY - 8,
              width: length + 20,
              height: 16,
              background: `linear-gradient(90deg, ${laserColor}, white, ${laserColor})`,
              boxShadow: `0 0 20px ${laserColor}, 0 0 40px ${laserColor}`,
              borderRadius: 8,
            }}
            initial={{ scaleY: 0.3, opacity: 0 }}
            animate={{ scaleY: [0.3, 1, 0.8, 1], opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Laser core */}
          <motion.div
            className="absolute pointer-events-none z-51"
            style={{
              left: Math.min(screenEnemyX, screenHeroX),
              bottom: 280 - enemyY - 3,
              width: length,
              height: 6,
              background: 'white',
              boxShadow: '0 0 10px white',
              borderRadius: 3,
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </>
      )}
    </>
  );
});

EnemyLaserAttack.displayName = 'EnemyLaserAttack';
