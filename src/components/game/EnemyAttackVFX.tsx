import { motion } from 'framer-motion';
import { memo } from 'react';

// =============================================
// ENEMY ATTACK VFX - Visual effects for enemy weapons
// Type-specific muzzle flashes, projectile trails, and impact effects
// =============================================

interface EnemyMuzzleFlashProps {
  enemyType: string;
  x: number;
  y: number;
  cameraX: number;
  isActive: boolean;
}

// Enhanced muzzle flash with type-specific visuals
export const EnemyMuzzleFlash = memo(({ enemyType, x, y, cameraX, isActive }: EnemyMuzzleFlashProps) => {
  const screenX = x - cameraX;
  
  if (!isActive || screenX < -50 || screenX > 700) return null;
  
  const getFlashConfig = () => {
    switch (enemyType) {
      case 'robot':
      case 'mech':
        return {
          color1: '#00ffff',
          color2: '#0088ff',
          size: 35,
          type: 'plasma',
        };
      case 'sentinel':
        return {
          color1: '#ff0066',
          color2: '#ff00ff',
          size: 50,
          type: 'laser',
        };
      case 'giant':
        return {
          color1: '#ff6600',
          color2: '#ffaa00',
          size: 60,
          type: 'cannon',
        };
      case 'drone':
      case 'flyer':
        return {
          color1: '#00ff88',
          color2: '#00ffff',
          size: 25,
          type: 'energy',
        };
      case 'bomber':
        return {
          color1: '#ff4400',
          color2: '#ff8800',
          size: 40,
          type: 'explosive',
        };
      case 'ninja':
        return {
          color1: '#ff3333',
          color2: '#ff6666',
          size: 30,
          type: 'claw',
        };
      default:
        return {
          color1: '#ff8800',
          color2: '#ffaa00',
          size: 30,
          type: 'bullet',
        };
    }
  };
  
  const config = getFlashConfig();
  
  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      style={{
        left: screenX - config.size / 2,
        bottom: 280 - y - config.size / 2,
        width: config.size,
        height: config.size,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 2], opacity: [1, 0.7, 0] }}
      transition={{ duration: 0.15 }}
    >
      {/* Main flash core */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, #fff 15%, ${config.color1} 40%, ${config.color2} 70%, transparent)`,
          boxShadow: `0 0 ${config.size / 2}px ${config.color1}, 0 0 ${config.size}px ${config.color2}`,
        }}
      />
      
      {/* Type-specific effects */}
      {config.type === 'laser' && (
        <>
          {/* Laser beam preview */}
          <motion.div
            className="absolute"
            style={{
              left: -100,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 120,
              height: 6,
              background: `linear-gradient(90deg, transparent, ${config.color1}, #fff)`,
              boxShadow: `0 0 15px ${config.color1}`,
            }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1.2, 0.8] }}
            transition={{ duration: 0.1, repeat: 2 }}
          />
        </>
      )}
      
      {config.type === 'cannon' && (
        <>
          {/* Heavy recoil smoke */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: config.size * 1.5,
              height: config.size * 1.5,
              left: -config.size * 0.25,
              top: -config.size * 0.25,
              background: 'radial-gradient(circle, rgba(100,100,100,0.6), rgba(50,50,50,0.3), transparent)',
            }}
            animate={{ scale: [0.5, 2.5], opacity: [0.8, 0] }}
            transition={{ duration: 0.4 }}
          />
          {/* Flame burst */}
          <motion.div
            className="absolute"
            style={{
              left: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 50,
              height: 20,
              background: `linear-gradient(90deg, transparent, ${config.color1}, #fff, ${config.color2})`,
              borderRadius: 10,
              filter: 'blur(2px)',
            }}
            animate={{ scaleX: [0.5, 1.5, 0.5], opacity: [1, 0.6, 0] }}
            transition={{ duration: 0.15 }}
          />
        </>
      )}
      
      {config.type === 'plasma' && (
        <>
          {/* Plasma rings */}
          {[0, 1].map(i => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                inset: -5 - i * 8,
                border: `2px solid ${config.color1}`,
                boxShadow: `0 0 8px ${config.color1}`,
              }}
              animate={{ scale: [0.5, 2], opacity: [1, 0] }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            />
          ))}
        </>
      )}
      
      {config.type === 'energy' && (
        <>
          {/* Electric arcs */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`arc-${i}`}
              className="absolute"
              style={{
                left: -10 - i * 8,
                top: config.size / 2 - 1,
                width: 15,
                height: 2,
                background: config.color1,
                boxShadow: `0 0 5px ${config.color1}`,
                transformOrigin: 'right center',
                transform: `rotate(${(i - 1) * 30}deg)`,
              }}
              animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.1, delay: i * 0.02 }}
            />
          ))}
        </>
      )}
      
      {config.type === 'claw' && (
        <>
          {/* Slash marks */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`slash-${i}`}
              className="absolute"
              style={{
                left: -20 + i * 5,
                top: config.size / 4 + i * 6,
                width: 25,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${config.color1}, #fff)`,
                borderRadius: 2,
                transform: `rotate(-20deg)`,
              }}
              initial={{ scaleX: 0, x: 20 }}
              animate={{ scaleX: [0, 1], x: [20, -30], opacity: [1, 0] }}
              transition={{ duration: 0.15, delay: i * 0.03 }}
            />
          ))}
        </>
      )}
      
      {/* Universal spark effects */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            left: config.size / 2,
            top: config.size / 2,
            background: '#fff',
            boxShadow: `0 0 4px ${config.color1}`,
          }}
          animate={{
            x: [-5 + Math.cos(i * Math.PI / 2) * 25, -10 + Math.cos(i * Math.PI / 2) * 40],
            y: [Math.sin(i * Math.PI / 2) * 25, Math.sin(i * Math.PI / 2) * 40],
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: 0.2, delay: i * 0.02 }}
        />
      ))}
    </motion.div>
  );
});

EnemyMuzzleFlash.displayName = 'EnemyMuzzleFlash';

// Enemy projectile with type-specific trail
interface EnemyProjectileTrailProps {
  enemyType: string;
  x: number;
  y: number;
  cameraX: number;
  velocityX: number;
}

export const EnemyProjectileTrail = memo(({ enemyType, x, y, cameraX, velocityX }: EnemyProjectileTrailProps) => {
  const screenX = x - cameraX;
  
  if (screenX < -30 || screenX > 700) return null;
  
  const getTrailConfig = () => {
    switch (enemyType) {
      case 'sentinel':
        return { color: '#ff0066', width: 100, height: 8, glow: '#ff00ff' };
      case 'giant':
        return { color: '#ff6600', width: 80, height: 12, glow: '#ff4400' };
      case 'drone':
      case 'flyer':
        return { color: '#00ff88', width: 40, height: 4, glow: '#00ffff' };
      case 'bomber':
        return { color: '#ff4400', width: 50, height: 6, glow: '#ff8800' };
      default:
        return { color: '#ffaa00', width: 35, height: 5, glow: '#ff8800' };
    }
  };
  
  const config = getTrailConfig();
  const direction = velocityX > 0 ? 1 : -1;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-35"
      style={{
        left: screenX,
        bottom: 280 - y - config.height / 2,
        width: config.width,
        height: config.height,
        transform: `scaleX(${-direction})`,
      }}
    >
      {/* Trail core */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.color}, #fff)`,
          borderRadius: config.height / 2,
          boxShadow: `0 0 10px ${config.glow}, 0 0 20px ${config.color}66`,
        }}
        animate={{ opacity: [0.8, 1, 0.8], scaleY: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.06, repeat: Infinity }}
      />
      
      {/* Projectile head */}
      <motion.div
        className="absolute rounded-full"
        style={{
          right: -config.height / 2,
          top: 0,
          width: config.height,
          height: config.height,
          background: `radial-gradient(circle, #fff, ${config.color})`,
          boxShadow: `0 0 15px ${config.glow}`,
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.08, repeat: Infinity }}
      />
    </motion.div>
  );
});

EnemyProjectileTrail.displayName = 'EnemyProjectileTrail';

// Charging indicator for heavy attacks
interface ChargingIndicatorProps {
  x: number;
  y: number;
  cameraX: number;
  progress: number; // 0-1
  color: string;
}

export const ChargingIndicator = memo(({ x, y, cameraX, progress, color }: ChargingIndicatorProps) => {
  const screenX = x - cameraX;
  
  if (screenX < -50 || screenX > 700 || progress <= 0) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-38"
      style={{
        left: screenX - 25,
        bottom: 280 - y + 30,
        width: 50,
        height: 8,
      }}
    >
      {/* Background bar */}
      <div
        className="absolute inset-0 rounded"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      />
      
      {/* Fill bar */}
      <motion.div
        className="absolute left-0.5 top-0.5 bottom-0.5 rounded"
        style={{
          width: `${Math.min(progress * 100, 100) - 2}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: progress > 0.8 ? `0 0 10px ${color}` : 'none',
        }}
      />
      
      {/* Charging text */}
      {progress > 0.5 && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold"
          style={{
            color: color,
            textShadow: `0 0 4px ${color}`,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        >
          CHARGING
        </motion.div>
      )}
    </motion.div>
  );
});

ChargingIndicator.displayName = 'ChargingIndicator';

// Warning indicator before heavy attack
interface AttackWarningProps {
  x: number;
  y: number;
  cameraX: number;
  attackType: 'laser' | 'missile' | 'bomb' | 'charge';
}

export const AttackWarning = memo(({ x, y, cameraX, attackType }: AttackWarningProps) => {
  const screenX = x - cameraX;
  
  if (screenX < -100 || screenX > 750) return null;
  
  const getWarningConfig = () => {
    switch (attackType) {
      case 'laser':
        return { icon: '⚡', color: '#ff0066', text: 'LASER!' };
      case 'missile':
        return { icon: '🚀', color: '#ff4400', text: 'MISSILE!' };
      case 'bomb':
        return { icon: '💣', color: '#ff8800', text: 'BOMB!' };
      case 'charge':
        return { icon: '⚠️', color: '#ffff00', text: 'CHARGE!' };
    }
  };
  
  const config = getWarningConfig();
  
  return (
    <motion.div
      className="absolute pointer-events-none z-45"
      style={{
        left: screenX - 30,
        bottom: 280 - y + 50,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Warning bubble */}
      <motion.div
        className="px-2 py-1 rounded font-black text-xs whitespace-nowrap"
        style={{
          background: `${config.color}dd`,
          color: '#fff',
          textShadow: '1px 1px 0 #000',
          boxShadow: `0 0 15px ${config.color}, 0 0 30px ${config.color}88`,
          border: '2px solid #fff',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        {config.icon} {config.text}
      </motion.div>
      
      {/* Pointer arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${config.color}`,
        }}
      />
    </motion.div>
  );
});

AttackWarning.displayName = 'AttackWarning';
