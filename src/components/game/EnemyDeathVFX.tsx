import { motion } from 'framer-motion';
import { memo } from 'react';
import { Enemy } from '@/types/game';

interface EnemyDeathVFXProps {
  enemy: Enemy;
  cameraX: number;
}

// Unique death effects per enemy type
const DEATH_STYLES: Record<string, {
  primaryColor: string;
  secondaryColor: string;
  particleCount: number;
  ringColor: string;
  icon: string;
  effect: 'explosion' | 'dissolve' | 'electric' | 'fire' | 'implosion' | 'shatter';
}> = {
  robot: {
    primaryColor: '#ff4444',
    secondaryColor: '#ffaa00',
    particleCount: 12,
    ringColor: '#ff6600',
    icon: '⚙️',
    effect: 'explosion',
  },
  drone: {
    primaryColor: '#00ffff',
    secondaryColor: '#0088ff',
    particleCount: 10,
    ringColor: '#00aaff',
    icon: '💫',
    effect: 'electric',
  },
  mech: {
    primaryColor: '#ff8800',
    secondaryColor: '#ffcc00',
    particleCount: 16,
    ringColor: '#ff6600',
    icon: '🔥',
    effect: 'fire',
  },
  ninja: {
    primaryColor: '#8800ff',
    secondaryColor: '#ff00ff',
    particleCount: 8,
    ringColor: '#aa00ff',
    icon: '✨',
    effect: 'dissolve',
  },
  tank: {
    primaryColor: '#44aa44',
    secondaryColor: '#88ff88',
    particleCount: 20,
    ringColor: '#00ff00',
    icon: '💥',
    effect: 'explosion',
  },
  giant: {
    primaryColor: '#ff00ff',
    secondaryColor: '#ff88ff',
    particleCount: 24,
    ringColor: '#ff44ff',
    icon: '☠️',
    effect: 'shatter',
  },
  bomber: {
    primaryColor: '#ff6600',
    secondaryColor: '#ffff00',
    particleCount: 18,
    ringColor: '#ff8800',
    icon: '💣',
    effect: 'fire',
  },
  sentinel: {
    primaryColor: '#ff0066',
    secondaryColor: '#ff88aa',
    particleCount: 14,
    ringColor: '#ff0088',
    icon: '⚡',
    effect: 'electric',
  },
  flyer: {
    primaryColor: '#ff66ff',
    secondaryColor: '#ffaaff',
    particleCount: 8,
    ringColor: '#ff88ff',
    icon: '🌟',
    effect: 'dissolve',
  },
  jetrobot: {
    primaryColor: '#00ff88',
    secondaryColor: '#88ffcc',
    particleCount: 12,
    ringColor: '#00ffaa',
    icon: '🚀',
    effect: 'implosion',
  },
  boss: {
    primaryColor: '#ff0000',
    secondaryColor: '#ff6600',
    particleCount: 40,
    ringColor: '#ffff00',
    icon: '👑',
    effect: 'explosion',
  },
};

// Explosion effect - fiery burst
const ExplosionDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Main explosion ring */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: -size * 0.3,
        border: `3px solid ${style.ringColor}`,
        boxShadow: `0 0 20px ${style.primaryColor}, 0 0 40px ${style.secondaryColor}`,
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
    {/* Inner flash */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: size * 0.2,
        background: `radial-gradient(circle, #fff, ${style.primaryColor}, transparent)`,
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
    {/* Sparks */}
    {[...Array(style.particleCount)].map((_, i) => {
      const angle = (i / style.particleCount) * Math.PI * 2;
      const distance = size * 1.5 + Math.random() * size;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: 6 + Math.random() * 4,
            height: 6 + Math.random() * 4,
            background: i % 2 === 0 ? style.primaryColor : style.secondaryColor,
            boxShadow: `0 0 8px ${style.primaryColor}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.4 + Math.random() * 0.2, ease: 'easeOut' }}
        />
      );
    })}
  </>
));

// Electric death - sparking and zapping
const ElectricDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Electric arcs */}
    {[...Array(6)].map((_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: size * 1.2,
            height: 3,
            background: `linear-gradient(90deg, ${style.primaryColor}, #fff, ${style.primaryColor})`,
            transformOrigin: 'left center',
            transform: `rotate(${angle}rad)`,
            boxShadow: `0 0 10px ${style.primaryColor}`,
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        />
      );
    })}
    {/* Core flash */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: size * 0.1,
        background: `radial-gradient(circle, #fff, ${style.primaryColor}, transparent)`,
        boxShadow: `0 0 30px ${style.primaryColor}`,
      }}
      animate={{ opacity: [1, 0.3, 1, 0], scale: [1, 1.5, 0.8, 0] }}
      transition={{ duration: 0.4 }}
    />
    {/* Spark particles */}
    {[...Array(style.particleCount)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-sm"
        style={{
          left: '50%',
          top: '50%',
          width: 3,
          height: 8,
          background: i % 2 === 0 ? '#fff' : style.primaryColor,
        }}
        initial={{ x: 0, y: 0, rotate: Math.random() * 360 }}
        animate={{
          x: (Math.random() - 0.5) * size * 2.5,
          y: (Math.random() - 0.5) * size * 2,
          opacity: 0,
          rotate: Math.random() * 720,
        }}
        transition={{ duration: 0.35 }}
      />
    ))}
  </>
));

// Fire death - burning up
const FireDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Flame tongues */}
    {[...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: 15,
            height: size * 0.8,
            background: `linear-gradient(to top, ${style.primaryColor}, ${style.secondaryColor}, transparent)`,
            borderRadius: '50% 50% 0 0',
            transformOrigin: 'bottom center',
            transform: `rotate(${angle}rad) translateY(-${size * 0.3}px)`,
          }}
          initial={{ scaleY: 0, opacity: 1 }}
          animate={{ scaleY: [0, 1.5, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
        />
      );
    })}
    {/* Smoke puffs */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`smoke-${i}`}
        className="absolute rounded-full"
        style={{
          left: `${30 + Math.random() * 40}%`,
          top: `${30 + Math.random() * 40}%`,
          width: 20 + Math.random() * 15,
          height: 20 + Math.random() * 15,
          background: 'radial-gradient(circle, rgba(80,80,80,0.7), transparent)',
        }}
        initial={{ scale: 0.3, opacity: 0.8, y: 0 }}
        animate={{ scale: 2, opacity: 0, y: -50 }}
        transition={{ duration: 0.7, delay: i * 0.05 }}
      />
    ))}
  </>
));

// Dissolve death - fading away
const DissolveDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Dissolve particles rising */}
    {[...Array(style.particleCount)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 4 + Math.random() * 6,
          height: 4 + Math.random() * 6,
          background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? style.primaryColor : style.secondaryColor,
          boxShadow: `0 0 6px ${style.primaryColor}`,
        }}
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -size * 1.5, scale: 0 }}
        transition={{ duration: 0.6 + Math.random() * 0.3, delay: i * 0.02 }}
      />
    ))}
    {/* Shimmer effect */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle, ${style.primaryColor}40, transparent)`,
      }}
      animate={{ opacity: [0.8, 0], scale: [1, 1.5] }}
      transition={{ duration: 0.5 }}
    />
  </>
));

// Implosion death - sucked inward
const ImplosionDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Inward ring */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: -size,
        border: `2px solid ${style.primaryColor}`,
        boxShadow: `inset 0 0 30px ${style.primaryColor}`,
      }}
      initial={{ scale: 2, opacity: 1 }}
      animate={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeIn' }}
    />
    {/* Particles sucked in */}
    {[...Array(style.particleCount)].map((_, i) => {
      const angle = (i / style.particleCount) * Math.PI * 2;
      const startDist = size * 2;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: 5,
            height: 5,
            background: style.primaryColor,
          }}
          initial={{ x: Math.cos(angle) * startDist, y: Math.sin(angle) * startDist, opacity: 1 }}
          animate={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          transition={{ duration: 0.35, ease: 'easeIn' }}
        />
      );
    })}
    {/* Core implosion flash */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: size * 0.3,
        background: '#fff',
        boxShadow: `0 0 20px ${style.primaryColor}`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.3, delay: 0.2 }}
    />
  </>
));

// Shatter death - breaking apart
const ShatterDeath = memo(({ style, size }: { style: typeof DEATH_STYLES.robot; size: number }) => (
  <>
    {/* Shatter fragments */}
    {[...Array(style.particleCount)].map((_, i) => {
      const angle = (i / style.particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = size * 1.5 + Math.random() * size;
      const fragmentSize = 8 + Math.random() * 12;
      return (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: fragmentSize,
            height: fragmentSize * 0.6,
            background: `linear-gradient(135deg, ${style.primaryColor}, ${style.secondaryColor})`,
            clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)',
            boxShadow: `0 0 5px ${style.primaryColor}`,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance + 50, // Gravity effect
            rotate: Math.random() * 720 - 360,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      );
    })}
    {/* Impact flash */}
    <motion.div
      className="absolute rounded-full"
      style={{
        inset: 0,
        background: `radial-gradient(circle, #fff, ${style.primaryColor}, transparent)`,
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  </>
));

// Main component that selects the right death effect
export const EnemyDeathVFX = memo(({ enemy, cameraX }: EnemyDeathVFXProps) => {
  const screenX = enemy.x - cameraX;
  
  if (screenX < -100 || screenX > 800 || !enemy.isDying) return null;
  
  const style = DEATH_STYLES[enemy.type] || DEATH_STYLES.robot;
  const size = Math.max(enemy.width, enemy.height);
  const isElite = enemy.isElite;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX,
        bottom: 50 + (enemy.y || 160) - size / 2,
        width: size,
        height: size,
        zIndex: 45,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* Icon burst */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 1.5], opacity: [1, 1, 0], y: -30 }}
        transition={{ duration: 0.5 }}
      >
        {style.icon}
      </motion.div>
      
      {/* Elite bonus effect */}
      {isElite && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.4), transparent)',
            boxShadow: '0 0 30px #ffd700, 0 0 60px #ffd700',
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Select effect based on enemy type */}
      {style.effect === 'explosion' && <ExplosionDeath style={style} size={size} />}
      {style.effect === 'electric' && <ElectricDeath style={style} size={size} />}
      {style.effect === 'fire' && <FireDeath style={style} size={size} />}
      {style.effect === 'dissolve' && <DissolveDeath style={style} size={size} />}
      {style.effect === 'implosion' && <ImplosionDeath style={style} size={size} />}
      {style.effect === 'shatter' && <ShatterDeath style={style} size={size} />}
    </motion.div>
  );
});

EnemyDeathVFX.displayName = 'EnemyDeathVFX';

ExplosionDeath.displayName = 'ExplosionDeath';
ElectricDeath.displayName = 'ElectricDeath';
FireDeath.displayName = 'FireDeath';
DissolveDeath.displayName = 'DissolveDeath';
ImplosionDeath.displayName = 'ImplosionDeath';
ShatterDeath.displayName = 'ShatterDeath';
