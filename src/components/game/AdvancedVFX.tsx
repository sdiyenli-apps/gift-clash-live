import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

// =============================================
// ADVANCED VFX SYSTEM - High-end game effects
// =============================================

interface ExplosionVFXProps {
  x: number;
  y: number;
  cameraX: number;
  size?: 'small' | 'medium' | 'large' | 'boss';
  color?: string;
  onComplete?: () => void;
}

// Cinematic explosion with multiple layers
export const ExplosionVFX = memo(({ x, y, cameraX, size = 'medium', color = '#ff6600' }: ExplosionVFXProps) => {
  const screenX = x - cameraX;
  if (screenX < -100 || screenX > 800) return null;
  
  const sizeMap = {
    small: { ring: 40, core: 20, sparks: 6 },
    medium: { ring: 70, core: 35, sparks: 10 },
    large: { ring: 120, core: 60, sparks: 16 },
    boss: { ring: 200, core: 100, sparks: 24 },
  };
  
  const s = sizeMap[size];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX - s.ring / 2,
        bottom: 280 - y - s.ring / 2,
        width: s.ring,
        height: s.ring,
        zIndex: 40,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 1.2], opacity: [1, 1, 0] }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Outer shockwave ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `3px solid ${color}`,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Inner core flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: (s.ring - s.core) / 2,
          top: (s.ring - s.core) / 2,
          width: s.core,
          height: s.core,
          background: `radial-gradient(circle, #fff, ${color}, transparent)`,
          boxShadow: `0 0 30px #fff, 0 0 60px ${color}`,
        }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: [1, 1.5, 0.8], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.35 }}
      />
      
      {/* Flying sparks */}
      {[...Array(s.sparks)].map((_, i) => {
        const angle = (i / s.sparks) * Math.PI * 2;
        const distance = s.ring * 0.8 + Math.random() * 20;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.ring / 2 - 3,
              top: s.ring / 2 - 3,
              width: 6,
              height: 6,
              background: i % 2 === 0 ? '#fff' : color,
              boxShadow: `0 0 8px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.3 + Math.random() * 0.2, ease: 'easeOut' }}
          />
        );
      })}
      
      {/* Smoke puffs */}
      {size !== 'small' && [...Array(4)].map((_, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute rounded-full"
          style={{
            left: s.ring / 2 - 15 + Math.random() * 30,
            top: s.ring / 2 - 15 + Math.random() * 30,
            width: 30,
            height: 30,
            background: 'radial-gradient(circle, rgba(100,100,100,0.6), transparent)',
          }}
          initial={{ scale: 0.3, opacity: 0.8, y: 0 }}
          animate={{ scale: 1.5, opacity: 0, y: -40 }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  );
});

ExplosionVFX.displayName = 'ExplosionVFX';

// Muzzle flash with smoke
interface MuzzleFlashVFXProps {
  x: number;
  y: number;
  cameraX: number;
  direction?: number;
  color?: string;
}

export const MuzzleFlashVFX = memo(({ x, y, cameraX, direction = 1, color = '#ffaa00' }: MuzzleFlashVFXProps) => {
  const screenX = x - cameraX;
  if (screenX < -30 || screenX > 680) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - y,
        zIndex: 35,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Main flash */}
      <motion.div
        style={{
          width: 40,
          height: 20,
          background: `radial-gradient(ellipse at ${direction > 0 ? 'left' : 'right'}, #fff, ${color}, transparent)`,
          transform: `scaleX(${direction})`,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
        }}
        initial={{ scaleX: 0.5, scaleY: 0.5 }}
        animate={{ scaleX: 1.5, scaleY: 1 }}
        transition={{ duration: 0.08 }}
      />
      
      {/* Star burst lines */}
      {[0, 45, -45].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: direction > 0 ? 20 : -20,
            top: 8,
            width: 25,
            height: 2,
            background: `linear-gradient(${direction > 0 ? 90 : -90}deg, ${color}, transparent)`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: direction > 0 ? 'left center' : 'right center',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </motion.div>
  );
});

MuzzleFlashVFX.displayName = 'MuzzleFlashVFX';

// Impact hit effect
interface ImpactVFXProps {
  x: number;
  y: number;
  cameraX: number;
  color?: string;
  isCritical?: boolean;
}

export const ImpactVFX = memo(({ x, y, cameraX, color = '#00ffff', isCritical = false }: ImpactVFXProps) => {
  const screenX = x - cameraX;
  if (screenX < -30 || screenX > 680) return null;
  
  const size = isCritical ? 50 : 30;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX - size / 2,
        bottom: 280 - y - size / 2,
        width: size,
        height: size,
        zIndex: 38,
      }}
      initial={{ scale: 0.3, opacity: 1 }}
      animate={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Impact star */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, #fff, ${color}, transparent)`,
          borderRadius: '50%',
          boxShadow: `0 0 15px ${color}`,
        }}
      />
      
      {/* Cross burst */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: 'rotate(45deg)' }}
      >
        <motion.div
          className="absolute"
          style={{
            width: size * 1.5,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
        <motion.div
          className="absolute"
          style={{
            width: 4,
            height: size * 1.5,
            background: `linear-gradient(180deg, transparent, ${color}, #fff, ${color}, transparent)`,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1, opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      </div>
      
      {/* Critical sparks */}
      {isCritical && [...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: size / 2 - 2,
              top: size / 2 - 2,
              width: 4,
              height: 4,
              background: '#fff',
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ x: 0, y: 0 }}
            animate={{
              x: Math.cos(angle) * 40,
              y: Math.sin(angle) * 40,
              opacity: 0,
            }}
            transition={{ duration: 0.25 }}
          />
        );
      })}
    </motion.div>
  );
});

ImpactVFX.displayName = 'ImpactVFX';

// Lightning bolt effect
interface LightningVFXProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  cameraX: number;
  color?: string;
}

export const LightningVFX = memo(({ startX, startY, endX, endY, cameraX, color = '#00ffff' }: LightningVFXProps) => {
  const screenStartX = startX - cameraX;
  const screenEndX = endX - cameraX;
  
  // Generate jagged lightning path
  const segments = 5;
  const dx = (screenEndX - screenStartX) / segments;
  const dy = (endY - startY) / segments;
  
  const points: { x: number; y: number }[] = [{ x: screenStartX, y: startY }];
  for (let i = 1; i < segments; i++) {
    points.push({
      x: screenStartX + dx * i + (Math.random() - 0.5) * 20,
      y: startY + dy * i + (Math.random() - 0.5) * 30,
    });
  }
  points.push({ x: screenEndX, y: endY });
  
  // Create SVG path
  let pathD = `M ${points[0].x} ${280 - points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${280 - points[i].y}`;
  }
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 45 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow layer */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        style={{ filter: `blur(6px)` }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.05 }}
      />
      {/* Core layer */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.05 }}
      />
    </motion.svg>
  );
});

LightningVFX.displayName = 'LightningVFX';

// Boss attack warning indicator
interface BossAttackWarningProps {
  type: 'laser' | 'missile' | 'ground_pound' | 'screen_attack';
  targetX?: number;
  targetY?: number;
  cameraX: number;
}

export const BossAttackWarning = memo(({ type, targetX = 300, targetY = 150, cameraX }: BossAttackWarningProps) => {
  const screenX = targetX - cameraX;
  
  const warningStyles = {
    laser: { color: '#ff0000', icon: '🔴', label: 'LASER!' },
    missile: { color: '#ff6600', icon: '🚀', label: 'MISSILES!' },
    ground_pound: { color: '#ff00ff', icon: '💥', label: 'SHOCKWAVE!' },
    screen_attack: { color: '#ffff00', icon: '☠️', label: 'MEGA ATTACK!' },
  };
  
  const style = warningStyles[type];
  
  return (
    <motion.div
      className="absolute pointer-events-none flex flex-col items-center z-50"
      style={{
        left: screenX - 50,
        bottom: 280 - targetY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
      transition={{ duration: 0.8, times: [0, 0.2, 0.7, 1] }}
    >
      <motion.span
        className="text-3xl"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.2, repeat: 3 }}
      >
        {style.icon}
      </motion.span>
      <span
        className="font-black text-sm tracking-wider mt-1"
        style={{
          color: style.color,
          textShadow: `0 0 10px ${style.color}, 0 0 20px ${style.color}`,
        }}
      >
        ⚠️ {style.label}
      </span>
      
      {/* Danger lines */}
      <motion.div
        className="absolute w-24 h-0.5"
        style={{
          top: '50%',
          background: `linear-gradient(90deg, transparent, ${style.color}, transparent)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.15, repeat: Infinity }}
      />
    </motion.div>
  );
});

BossAttackWarning.displayName = 'BossAttackWarning';
