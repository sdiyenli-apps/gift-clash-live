import { motion } from 'framer-motion';
import { memo } from 'react';
import { Enemy } from '@/types/game';

// =============================================
// DRONE ATTACK VFX - Visual effects for drone weapons
// Fire projectiles, muzzle flashes, and attack indicators
// =============================================

interface DroneAttackFlashProps {
  drone: Enemy;
  cameraX: number;
  isAttacking: boolean;
}

// Drone fire projectile muzzle flash
export const DroneFireFlash = memo(({ drone, cameraX, isAttacking }: DroneAttackFlashProps) => {
  const screenX = drone.x - cameraX;
  const variant = drone.droneVariant ?? 0;
  
  if (!isAttacking || screenX < -50 || screenX > 700) return null;
  
  // Heavy drone (variant 0) uses missiles, Insect drone (variant 1) uses plasma
  const isHeavyDrone = variant % 2 === 0;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{
        left: screenX - 30,
        bottom: 280 - (drone.y || 180) + (drone.flyHeight || 60),
        width: 60,
        height: 40,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.8, 0] }}
      transition={{ duration: 0.2 }}
    >
      {isHeavyDrone ? (
        // HEAVY DRONE - Missile/rocket fire blast
        <>
          {/* Main fire burst */}
          <motion.div
            className="absolute"
            style={{
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 50,
              height: 25,
              background: 'radial-gradient(ellipse at right, #fff 5%, #ff6600 30%, #ff3300 60%, transparent)',
              filter: 'blur(2px)',
              borderRadius: '50%',
            }}
            animate={{ scaleX: [0.5, 1.5, 1], opacity: [1, 0.8, 0] }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Fire sparks */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                left: 10,
                top: 15 + (i - 3) * 5,
                background: i % 2 === 0 ? '#ff6600' : '#ffff00',
                boxShadow: `0 0 6px ${i % 2 === 0 ? '#ff4400' : '#ffaa00'}`,
              }}
              animate={{
                x: [-10, -40 - Math.random() * 30],
                y: [(i - 3) * 3, (i - 3) * 8],
                opacity: [1, 0],
                scale: [1, 0.3],
              }}
              transition={{ duration: 0.2 + Math.random() * 0.1, delay: i * 0.02 }}
            />
          ))}
          
          {/* Smoke puff */}
          <motion.div
            className="absolute"
            style={{
              left: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 30,
              height: 20,
              background: 'radial-gradient(ellipse, rgba(100,100,100,0.5), transparent)',
              filter: 'blur(3px)',
            }}
            animate={{ x: [-10, -40], scaleX: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 0.3 }}
          />
        </>
      ) : (
        // INSECT DRONE - Plasma/energy burst
        <>
          {/* Plasma core */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 20,
              height: 20,
              background: 'radial-gradient(circle, #fff, #00ff88, #00ffff)',
              boxShadow: '0 0 20px #00ff88, 0 0 40px #00ffff',
            }}
            animate={{ scale: [0.5, 1.5, 0.5], opacity: [1, 0.7, 0] }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Energy rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                left: 5 - i * 5,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 15 + i * 10,
                height: 15 + i * 10,
                border: `2px solid ${i % 2 === 0 ? '#00ff88' : '#00ffff'}`,
                boxShadow: `0 0 8px ${i % 2 === 0 ? '#00ff88' : '#00ffff'}`,
              }}
              animate={{ scale: [0.3, 1.5], opacity: [1, 0] }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            />
          ))}
          
          {/* Electric arcs */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`arc-${i}`}
              className="absolute"
              style={{
                left: 5,
                top: 20,
                width: 20,
                height: 2,
                background: '#00ffff',
                boxShadow: '0 0 6px #00ffff',
                transformOrigin: 'right center',
                rotate: `${(i - 1.5) * 40}deg`,
              }}
              animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.1, delay: i * 0.02 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
});

DroneFireFlash.displayName = 'DroneFireFlash';

// Fire projectile trail for drone shots
interface DroneFireProjectileProps {
  x: number;
  y: number;
  cameraX: number;
  velocityX: number;
  velocityY: number;
  variant?: number;
}

export const DroneFireProjectile = memo(({ x, y, cameraX, velocityX, velocityY, variant = 0 }: DroneFireProjectileProps) => {
  const screenX = x - cameraX;
  
  if (screenX < -50 || screenX > 750) return null;
  
  const isHeavyDrone = variant % 2 === 0;
  const direction = velocityX > 0 ? 1 : -1;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-45"
      style={{
        left: screenX,
        bottom: 280 - y,
        transform: `scaleX(${-direction})`,
      }}
    >
      {isHeavyDrone ? (
        // HEAVY DRONE - Fire/missile projectile
        <>
          {/* Fire trail */}
          <motion.div
            className="absolute"
            style={{
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 60,
              height: 16,
              background: 'linear-gradient(90deg, transparent, #ff330066, #ff6600, #ffaa00, #fff)',
              filter: 'blur(2px)',
              borderRadius: 8,
            }}
            animate={{ width: [50, 70, 50], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          
          {/* Projectile core */}
          <motion.div
            className="absolute rounded-full"
            style={{
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 12,
              background: 'radial-gradient(ellipse, #fff, #ffaa00, #ff6600)',
              boxShadow: '0 0 15px #ff6600, 0 0 30px #ff4400',
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.06, repeat: Infinity }}
          />
          
          {/* Smoke trail */}
          <motion.div
            className="absolute"
            style={{
              right: 40,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 10,
              background: 'linear-gradient(90deg, transparent, rgba(100,100,100,0.4))',
              filter: 'blur(4px)',
            }}
            animate={{ width: [30, 50, 30] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </>
      ) : (
        // INSECT DRONE - Plasma projectile
        <>
          {/* Plasma trail */}
          <motion.div
            className="absolute"
            style={{
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 45,
              height: 8,
              background: 'linear-gradient(90deg, transparent, #00ff8866, #00ffff, #fff)',
              filter: 'blur(1px)',
              borderRadius: 4,
            }}
            animate={{ width: [40, 55, 40], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.06, repeat: Infinity }}
          />
          
          {/* Plasma orb */}
          <motion.div
            className="absolute rounded-full"
            style={{
              right: -6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 12,
              height: 12,
              background: 'radial-gradient(circle, #fff, #00ffff, #00ff88)',
              boxShadow: '0 0 12px #00ffff, 0 0 25px #00ff88',
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.05, repeat: Infinity }}
          />
        </>
      )}
    </motion.div>
  );
});

DroneFireProjectile.displayName = 'DroneFireProjectile';

// Attack warning indicator for drones preparing to fire
interface DroneAttackWarningProps {
  drone: Enemy;
  cameraX: number;
}

export const DroneAttackWarning = memo(({ drone, cameraX }: DroneAttackWarningProps) => {
  const screenX = drone.x - cameraX;
  const variant = drone.droneVariant ?? 0;
  const isHeavyDrone = variant % 2 === 0;
  
  if (screenX < -50 || screenX > 700) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-48"
      style={{
        left: screenX - 25,
        bottom: 280 - (drone.y || 180) + (drone.flyHeight || 60) + 40,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="px-2 py-1 rounded-lg font-black text-xs whitespace-nowrap"
        style={{
          background: isHeavyDrone 
            ? 'linear-gradient(135deg, #ff4400, #ff6600)' 
            : 'linear-gradient(135deg, #00ff88, #00ffff)',
          color: '#fff',
          textShadow: '1px 1px 0 #000, -1px -1px 0 #000',
          boxShadow: isHeavyDrone 
            ? '0 0 15px #ff4400, 0 0 30px #ff660088' 
            : '0 0 15px #00ff88, 0 0 30px #00ffff88',
          border: '2px solid rgba(255,255,255,0.8)',
        }}
        animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
        transition={{ duration: 0.15, repeat: Infinity }}
      >
        {isHeavyDrone ? '🔥 FIRE!' : '⚡ ZAP!'}
      </motion.div>
      
      {/* Pointer arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1"
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${isHeavyDrone ? '#ff6600' : '#00ffff'}`,
        }}
      />
    </motion.div>
  );
});

DroneAttackWarning.displayName = 'DroneAttackWarning';
