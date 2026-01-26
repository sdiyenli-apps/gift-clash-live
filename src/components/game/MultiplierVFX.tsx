import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

// =============================================
// AAA GAME-INSPIRED MULTIPLIER VFX
// Inspired by: Devil May Cry, Hades, Bayonetta
// =============================================

interface MultiplierVFXProps {
  damageMultiplier: number;
  previousMultiplier: number;
}

// Full-screen power surge effect (Devil May Cry style)
const PowerSurgeFlash = memo(({ color, intensity }: { color: string; intensity: number }) => (
  <motion.div
    className="fixed inset-0 z-[98] pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, intensity, 0] }}
    transition={{ duration: 0.5, times: [0, 0.15, 1] }}
  >
    {/* Radial burst */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${color}80, ${color}40 30%, transparent 60%)`,
      }}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6 }}
    />
    
    {/* Horizontal scan lines (Bayonetta style) */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-full h-0.5"
        style={{
          top: `${20 + i * 15}%`,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1.5, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 0.4, delay: i * 0.03 }}
      />
    ))}
  </motion.div>
));

PowerSurgeFlash.displayName = 'PowerSurgeFlash';

// Expanding ring burst (Hades style)
const RingBurst = memo(({ color, count = 3 }: { color: string; count?: number }) => (
  <div className="fixed inset-0 flex items-center justify-center z-[97] pointer-events-none">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          border: `3px solid ${color}`,
          boxShadow: `0 0 30px ${color}, inset 0 0 20px ${color}40`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 4 + i * 1.5], opacity: [1, 0] }}
        transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
      />
    ))}
  </div>
));

RingBurst.displayName = 'RingBurst';

// Lightning strike effect (Mortal Kombat style)
const LightningStrike = memo(({ color }: { color: string }) => {
  const bolts = [...Array(6)].map((_, i) => {
    const x = 15 + Math.random() * 70;
    const segments = 8;
    let path = `M ${x} 0`;
    let currentX = x;
    for (let j = 1; j <= segments; j++) {
      currentX += (Math.random() - 0.5) * 15;
      path += ` L ${currentX} ${(j / segments) * 100}`;
    }
    return { path, delay: Math.random() * 0.15 };
  });

  return (
    <svg className="fixed inset-0 w-full h-full z-[99] pointer-events-none">
      <defs>
        <filter id="lightning-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bolts.map((bolt, i) => (
        <motion.path
          key={i}
          d={bolt.path}
          fill="none"
          stroke={i % 2 === 0 ? '#fff' : color}
          strokeWidth={i % 2 === 0 ? 2 : 4}
          filter="url(#lightning-glow)"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: [0, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 0.2, delay: bolt.delay }}
          style={{ strokeLinecap: 'round' }}
        />
      ))}
    </svg>
  );
});

LightningStrike.displayName = 'LightningStrike';

// Particle explosion (DMC style rank up)
const ParticleExplosion = memo(({ color, intensity }: { color: string; intensity: number }) => {
  const particleCount = 20 + intensity * 15;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[96] pointer-events-none">
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 100 + Math.random() * 200 * intensity;
        const size = 4 + Math.random() * 8;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: i % 3 === 0 ? '#fff' : color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5 + Math.random() * 0.3, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
});

ParticleExplosion.displayName = 'ParticleExplosion';

// Screen chromatic aberration flash
const ChromaticFlash = memo(({ color }: { color: string }) => (
  <motion.div
    className="fixed inset-0 z-[95] pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(45deg, #ff000020, transparent, #00ff0020, transparent, #0000ff20)`,
        mixBlendMode: 'screen',
      }}
      animate={{ x: [0, 5, -5, 0], y: [0, -5, 5, 0] }}
      transition={{ duration: 0.15, repeat: 2 }}
    />
  </motion.div>
));

ChromaticFlash.displayName = 'ChromaticFlash';

// Text rank-up announcement (DMC/Bayonetta style)
const RankUpAnnouncement = memo(({ tier, color }: { tier: string; color: string }) => (
  <motion.div
    className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: [0, 1.3, 1], rotate: [-10, 5, 0] }}
      transition={{ duration: 0.4, ease: 'backOut' }}
    >
      {/* Glow backdrop */}
      <motion.div
        className="absolute inset-0 -m-8 blur-xl"
        style={{ background: color, opacity: 0.5 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.3] }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Main text */}
      <motion.span
        className="font-black text-5xl tracking-widest relative z-10"
        style={{
          color: '#fff',
          textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
          WebkitTextStroke: `2px ${color}`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.2, repeat: 3 }}
      >
        {tier}!
      </motion.span>
      
      {/* Slash lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1"
          style={{
            width: 200,
            left: -100,
            top: `${30 + i * 20}%`,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            transform: `rotate(${-15 + i * 15}deg)`,
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
        />
      ))}
    </motion.div>
  </motion.div>
));

RankUpAnnouncement.displayName = 'RankUpAnnouncement';

// Vignette pulse
const VignettePulse = memo(({ color, intensity }: { color: string; intensity: number }) => (
  <motion.div
    className="fixed inset-0 z-[94] pointer-events-none"
    style={{
      background: `radial-gradient(circle at center, transparent 30%, ${color}${Math.floor(intensity * 40).toString(16).padStart(2, '0')} 100%)`,
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0.3, 0] }}
    transition={{ duration: 0.8 }}
  />
));

VignettePulse.displayName = 'VignettePulse';

// SCREEN CRACK EFFECT - Glass shattering when multiplier rises
const ScreenCrackEffect = memo(({ intensity, color }: { intensity: number; color: string }) => {
  // Generate crack line paths - more cracks at higher intensity
  const crackCount = 3 + intensity * 2;
  const cracks = [...Array(crackCount)].map((_, i) => {
    // Start from random edge position
    const side = i % 4; // 0=top, 1=right, 2=bottom, 3=left
    let startX = 50, startY = 50;
    if (side === 0) { startX = 20 + Math.random() * 60; startY = 0; }
    if (side === 1) { startX = 100; startY = 20 + Math.random() * 60; }
    if (side === 2) { startX = 20 + Math.random() * 60; startY = 100; }
    if (side === 3) { startX = 0; startY = 20 + Math.random() * 60; }
    
    // Generate jagged path toward center
    const segments = 4 + Math.floor(Math.random() * 3);
    let path = `M ${startX} ${startY}`;
    let currentX = startX;
    let currentY = startY;
    const targetX = 40 + Math.random() * 20;
    const targetY = 40 + Math.random() * 20;
    
    for (let j = 1; j <= segments; j++) {
      const progress = j / segments;
      currentX = startX + (targetX - startX) * progress + (Math.random() - 0.5) * 15;
      currentY = startY + (targetY - startY) * progress + (Math.random() - 0.5) * 15;
      path += ` L ${currentX} ${currentY}`;
      
      // Add branching cracks
      if (j > 1 && Math.random() > 0.5) {
        const branchLength = 5 + Math.random() * 10;
        const branchAngle = Math.random() * Math.PI * 2;
        path += ` M ${currentX} ${currentY} L ${currentX + Math.cos(branchAngle) * branchLength} ${currentY + Math.sin(branchAngle) * branchLength}`;
        path += ` M ${currentX} ${currentY}`;
      }
    }
    
    return { path, delay: i * 0.02 };
  });

  return (
    <svg className="fixed inset-0 w-full h-full z-[101] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Glass shatter background flash */}
      <motion.rect
        x="0" y="0" width="100" height="100"
        fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Crack lines */}
      {cracks.map((crack, i) => (
        <motion.path
          key={i}
          d={crack.path}
          fill="none"
          stroke="#ffffff"
          strokeWidth={0.5 + intensity * 0.2}
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ 
            pathLength: [0, 1],
            opacity: [1, 1, 0.5, 0],
          }}
          transition={{ 
            duration: 0.8, 
            delay: crack.delay,
            opacity: { duration: 2, times: [0, 0.2, 0.7, 1] }
          }}
          style={{
            filter: `drop-shadow(0 0 2px ${color})`,
            strokeLinecap: 'round',
          }}
        />
      ))}
      
      {/* Glass shard effect at center */}
      <motion.circle
        cx="50" cy="50" r={intensity * 5}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3], opacity: [1, 0] }}
        transition={{ duration: 0.5 }}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
});

ScreenCrackEffect.displayName = 'ScreenCrackEffect';

// CHAOS EFFECT - Screen distortion and intensity when multiplier rises
const ChaosEffect = memo(({ intensity, color }: { intensity: number; color: string }) => (
  <>
    {/* Screen shake simulation via transform */}
    <motion.div
      className="fixed inset-0 z-[93] pointer-events-none"
      animate={{
        x: [0, -3, 3, -2, 2, 0],
        y: [0, 2, -2, 3, -3, 0],
      }}
      transition={{ duration: 0.15, repeat: 2 + intensity }}
    />
    
    {/* Chaos energy lines radiating from edges */}
    <div className="fixed inset-0 z-[92] pointer-events-none overflow-hidden">
      {[...Array(6 + intensity * 3)].map((_, i) => {
        const angle = (i / (6 + intensity * 3)) * 360;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 2,
              height: '150%',
              background: `linear-gradient(180deg, transparent, ${color}88, ${color}, ${color}88, transparent)`,
              transformOrigin: 'center center',
              transform: `rotate(${angle}deg)`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ 
              scaleY: [0, 1, 0.5],
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.02,
            }}
          />
        );
      })}
    </div>
    
    {/* Pulsing danger border */}
    <motion.div
      className="fixed inset-0 z-[91] pointer-events-none"
      style={{
        boxShadow: `inset 0 0 ${30 + intensity * 20}px ${color}`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.4, 0.6, 0] }}
      transition={{ duration: 0.8 }}
    />
    
    {/* Energy sparks */}
    {[...Array(intensity * 5)].map((_, i) => (
      <motion.div
        key={`spark-${i}`}
        className="fixed z-[90] pointer-events-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#ffffff' : color,
          boxShadow: `0 0 10px ${color}`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ 
          scale: [0, 2, 0],
          opacity: [1, 1, 0],
        }}
        transition={{ 
          duration: 0.3 + Math.random() * 0.2, 
          delay: Math.random() * 0.2,
        }}
      />
    ))}
  </>
));

ChaosEffect.displayName = 'ChaosEffect';

export const MultiplierVFX = memo(({ damageMultiplier, previousMultiplier }: MultiplierVFXProps) => {
  const [showVFX, setShowVFX] = useState(false);
  const [vfxTier, setVfxTier] = useState<{ name: string; color: string; intensity: number } | null>(null);

  useEffect(() => {
    // Only trigger on multiplier INCREASE
    if (damageMultiplier > previousMultiplier && damageMultiplier >= 1.5) {
      const tier = getTierInfo(damageMultiplier);
      setVfxTier(tier);
      setShowVFX(true);
      
      const timer = setTimeout(() => setShowVFX(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [damageMultiplier, previousMultiplier]);

  if (!showVFX || !vfxTier) return null;

  return (
    <AnimatePresence>
      {/* SCREEN CRACK - Glass shattering effect */}
      <ScreenCrackEffect intensity={vfxTier.intensity} color={vfxTier.color} />
      
      {/* CHAOS EFFECT - Energy and distortion */}
      <ChaosEffect intensity={vfxTier.intensity} color={vfxTier.color} />
      
      {/* Base flash */}
      <PowerSurgeFlash color={vfxTier.color} intensity={vfxTier.intensity * 0.6} />
      
      {/* Ring burst */}
      <RingBurst color={vfxTier.color} count={Math.min(vfxTier.intensity + 1, 4)} />
      
      {/* Particles */}
      <ParticleExplosion color={vfxTier.color} intensity={vfxTier.intensity} />
      
      {/* Chromatic aberration for high tiers */}
      {vfxTier.intensity >= 2 && <ChromaticFlash color={vfxTier.color} />}
      
      {/* Lightning for legendary */}
      {vfxTier.intensity >= 3 && <LightningStrike color={vfxTier.color} />}
      
      {/* Vignette */}
      <VignettePulse color={vfxTier.color} intensity={vfxTier.intensity} />
      
      {/* Rank announcement */}
      <RankUpAnnouncement tier={vfxTier.name} color={vfxTier.color} />
    </AnimatePresence>
  );
});

MultiplierVFX.displayName = 'MultiplierVFX';

function getTierInfo(multiplier: number): { name: string; color: string; intensity: number } {
  if (multiplier >= 3.0) return { name: 'LEGENDARY', color: '#ff00ff', intensity: 4 };
  if (multiplier >= 2.5) return { name: 'MYTHIC', color: '#ff0000', intensity: 3 };
  if (multiplier >= 2.0) return { name: 'ULTRA', color: '#ff6600', intensity: 2 };
  return { name: 'SUPER', color: '#ffaa00', intensity: 1 };
}
