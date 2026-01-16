import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { Projectile as ProjectileType } from '@/types/game';

interface ProjectileProps {
  projectile: ProjectileType;
  cameraX: number;
}

interface FireballProps {
  fireball: { id: string; x: number; y: number; velocityX: number; velocityY: number; damage: number };
  cameraX: number;
}

export const ProjectileSprite = ({ projectile, cameraX }: ProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 1200) return null;
  
  const getProjectileStyle = () => {
    switch (projectile.type) {
      case 'ultra':
        return {
          width: 60,
          height: 16,
          background: 'linear-gradient(90deg, #fff, #ff00ff, #00ffff, #ff00ff)',
          boxShadow: '0 0 40px #ff00ff, 0 0 80px #00ffff, 0 0 120px #ff00ff',
        };
      case 'mega':
        return {
          width: 50,
          height: 14,
          background: 'linear-gradient(90deg, #fff, #ffff00, #ff6600)',
          boxShadow: '0 0 30px #ffff00, 0 0 60px #ff6600',
        };
      default:
        return {
          width: 24,
          height: 8,
          background: 'linear-gradient(90deg, #ffff00, #ff8800)',
          boxShadow: '0 0 15px #ffff00, 0 0 30px #ff8800',
        };
    }
  };
  
  const style = getProjectileStyle();
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: screenX,
        bottom: 280 - projectile.y - style.height / 2,
        ...style,
      }}
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        x: projectile.type === 'ultra' ? [0, 3, -3, 0] : 0,
      }}
      transition={{
        x: { duration: 0.1, repeat: Infinity },
      }}
    >
      {/* Inner bright core */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: '#fff',
          filter: 'blur(2px)',
          opacity: 0.8,
        }}
      />
      
      {/* Trail effect */}
      <motion.div
        className="absolute right-full top-1/2 -translate-y-1/2"
        animate={{ opacity: [1, 0.5] }}
        transition={{ duration: 0.05, repeat: Infinity }}
        style={{
          width: projectile.type === 'ultra' ? 100 : projectile.type === 'mega' ? 60 : 40,
          height: style.height - 2,
          background: `linear-gradient(90deg, transparent, ${projectile.type === 'ultra' ? '#ff00ff' : '#ffff00'})`,
        }}
      />
      
      {/* Energy rings for mega/ultra */}
      {projectile.type !== 'normal' && (
        <>
          {[0, 1].map(i => (
            <motion.div
              key={`pring-${i}`}
              className="absolute rounded-full"
              style={{
                left: -10 - i * 15,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 10,
                height: 10,
                border: `2px solid ${projectile.type === 'ultra' ? '#ff00ff' : '#ffff00'}`,
                opacity: 0.6 - i * 0.2,
              }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </>
      )}
      
      {/* Glow */}
      {projectile.type !== 'normal' && (
        <div 
          className="absolute inset-0 -m-4 rounded-full animate-pulse"
          style={{
            background: projectile.type === 'ultra' 
              ? 'radial-gradient(circle, rgba(255,0,255,0.5), transparent)' 
              : 'radial-gradient(circle, rgba(255,255,0,0.4), transparent)',
          }}
        />
      )}
    </motion.div>
  );
};

// Determine if this is a drone laser (neon cyan) or regular bullet (red)
interface EnemyLaserProps extends ProjectileProps {
  isDroneLaser?: boolean;
}

export const EnemyLaserSprite = forwardRef<HTMLDivElement, EnemyLaserProps>(
  ({ projectile, cameraX, isDroneLaser = false }, ref) => {
    const screenX = projectile.x - cameraX;
    
    if (screenX < -50 || screenX > 1200) return null;
    
    // Drone neon laser style
    if (isDroneLaser || projectile.damage === 8) {
      return (
        <motion.div
          ref={ref}
          className="absolute z-15"
          style={{
            left: screenX,
            bottom: 280 - projectile.y - 6,
            width: 40,
            height: 12,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Neon laser core */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #fff, #00ffff, #00aaff, #00ffff)',
              boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #0088ff',
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          {/* Neon glow pulse */}
          <motion.div
            className="absolute -inset-2 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,255,255,0.6), transparent)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {/* Neon trail */}
          <motion.div
            className="absolute left-full top-1/2 -translate-y-1/2"
            style={{
              width: 60,
              height: 8,
              background: 'linear-gradient(90deg, #00ffff, #0088ff66, transparent)',
              filter: 'blur(2px)',
            }}
          />
          {/* Leading spark */}
          <motion.div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fff, #00ffff, transparent)',
              boxShadow: '0 0 15px #00ffff',
            }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </motion.div>
      );
    }
    
    // Regular enemy bullet - more visible red/orange
    return (
      <motion.div
        ref={ref}
        className="absolute z-15"
        style={{
          left: screenX,
          bottom: 280 - projectile.y - 8,
          width: 24,
          height: 16,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {/* Bullet core */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, #fff, #ff4400, #ff0000)',
            boxShadow: '0 0 15px #ff4400, 0 0 30px #ff0000, 0 0 45px #ff4400',
          }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 0.08, repeat: Infinity }}
        />
        {/* Bullet trail */}
        <motion.div
          className="absolute left-full top-1/2 -translate-y-1/2"
          style={{
            width: 40,
            height: 10,
            background: 'linear-gradient(90deg, #ff4400, #ff000066, transparent)',
            filter: 'blur(2px)',
          }}
        />
        {/* Muzzle flash */}
        <motion.div
          className="absolute left-full top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ffff00, #ff4400, transparent)',
            boxShadow: '0 0 10px #ffff00',
          }}
          animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />
      </motion.div>
    );
  }
);
EnemyLaserSprite.displayName = 'EnemyLaserSprite';

export const FireballSprite = ({ fireball, cameraX }: FireballProps) => {
  const screenX = fireball.x - cameraX;
  
  if (screenX < -100 || screenX > 1200) return null;
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: 280 - fireball.y - 20,
        width: 40,
        height: 40,
      }}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        rotate: { duration: 0.5, repeat: Infinity, ease: 'linear' },
        scale: { duration: 0.3, repeat: Infinity },
      }}
    >
      {/* Fireball core */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff 0%, #ffff00 20%, #ff8800 50%, #ff0000 80%, transparent 100%)',
          boxShadow: '0 0 30px #ff4400, 0 0 60px #ff0000',
        }}
      />
      
      {/* Flame particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`flame-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: i % 2 === 0 ? '#ffff00' : '#ff4400',
            left: `${20 + Math.cos(i * Math.PI / 3) * 40}%`,
            top: `${50 + Math.sin(i * Math.PI / 3) * 40}%`,
          }}
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
      
      {/* Smoke trail */}
      <motion.div
        className="absolute right-full top-1/2 -translate-y-1/2"
        style={{
          width: 60,
          height: 20,
          background: 'linear-gradient(90deg, transparent, #ff440044, #ff880088)',
          filter: 'blur(5px)',
        }}
      />
    </motion.div>
  );
};
