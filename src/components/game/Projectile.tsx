import { motion } from 'framer-motion';
import { forwardRef, memo } from 'react';
import { Projectile as ProjectileType } from '@/types/game';

interface ProjectileProps {
  projectile: ProjectileType;
  cameraX: number;
}

interface FireballProps {
  fireball: { id: string; x: number; y: number; velocityX: number; velocityY: number; damage: number };
  cameraX: number;
}

// ============= COLOR CODING =============
// Player bullets: GOLD/YELLOW (#FFD700, #FFA500)
// Ally bullets: GREEN (#00FF88, #00FFAA)
// Enemy bullets: RED variants by threat level

// PLAYER BULLET - Gold/Yellow, highly visible
export const ProjectileSprite = memo(({ projectile, cameraX }: ProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 800) return null;
  
  // All player bullets are gold/yellow for clarity
  const isUltra = projectile.type === 'ultra';
  const isMega = projectile.type === 'mega';
  
  const size = isUltra ? { w: 20, h: 8 } : isMega ? { w: 16, h: 7 } : { w: 14, h: 6 };
  
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - projectile.y - size.h / 2,
        width: size.w,
        height: size.h,
        background: isUltra 
          ? 'linear-gradient(90deg, #fff, #FFD700, #FFA500)'
          : 'linear-gradient(90deg, #fff, #FFD700, #FF8C00)',
        borderRadius: '50%',
        boxShadow: isUltra 
          ? '0 0 12px #FFD700, 0 0 24px #FFA500'
          : '0 0 8px #FFD700, 0 0 16px #FF8C00',
      }}
    >
      {/* Bright core */}
      <div 
        className="absolute rounded-full"
        style={{
          top: 1,
          left: 2,
          width: size.w * 0.4,
          height: size.h - 2,
          background: '#fff',
          filter: 'blur(1px)',
        }}
      />
      {/* Trail */}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2"
        style={{
          width: size.w * 1.5,
          height: size.h - 2,
          background: `linear-gradient(90deg, transparent, ${isUltra ? '#FFD70066' : '#FF8C0044'})`,
        }}
      />
    </div>
  );
});
ProjectileSprite.displayName = 'ProjectileSprite';

// ALLY BULLET - Green, distinct from player
export const AllyBulletSprite = memo(({ projectile, cameraX }: ProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 800) return null;
  
  const isMech = projectile.type === 'ultra';
  const size = isMech ? { w: 14, h: 6 } : { w: 12, h: 5 };
  
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - projectile.y - size.h / 2,
        width: size.w,
        height: size.h,
        background: 'linear-gradient(90deg, #fff, #00FF88, #00FFAA)',
        borderRadius: '50%',
        boxShadow: '0 0 8px #00FF88, 0 0 14px #00FFAA',
      }}
    >
      {/* Core */}
      <div 
        className="absolute rounded-full"
        style={{
          top: 1,
          left: 2,
          width: size.w * 0.35,
          height: size.h - 2,
          background: '#fff',
        }}
      />
    </div>
  );
});
AllyBulletSprite.displayName = 'AllyBulletSprite';

// ENEMY BULLET - Red variants by threat
// Normal enemies: Orange-Red
// Drones: Cyan (legacy kept for jetrobots only)
// Heavy enemies: Dark Red
export const EnemyLaserSprite = memo(forwardRef<HTMLDivElement, ProjectileProps>(
  ({ projectile, cameraX }, ref) => {
    const screenX = projectile.x - cameraX;
    
    if (screenX < -50 || screenX > 800) return null;
    
    // Threat level based on damage
    const isHighThreat = projectile.damage >= 15;
    const isMedThreat = projectile.damage >= 10;
    
    // Color by threat: high=dark red, medium=red, low=orange-red
    const colors = isHighThreat 
      ? { main: '#FF0000', glow: '#CC0000', trail: '#FF000066' }
      : isMedThreat
        ? { main: '#FF4400', glow: '#FF2200', trail: '#FF440066' }
        : { main: '#FF6600', glow: '#FF4400', trail: '#FF660044' };
    
    const size = isHighThreat ? { w: 18, h: 10 } : { w: 14, h: 8 };
    
    return (
      <div
        ref={ref}
        className="absolute z-30 pointer-events-none"
        style={{
          left: screenX,
          bottom: 280 - projectile.y - size.h / 2,
          width: size.w,
          height: size.h,
          background: `linear-gradient(90deg, ${colors.main}, #fff, ${colors.main})`,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}`,
        }}
      >
        {/* White hot center */}
        <div 
          className="absolute rounded-full"
          style={{
            top: 2,
            left: size.w * 0.3,
            width: size.w * 0.4,
            height: size.h - 4,
            background: '#fff',
          }}
        />
        {/* Trail */}
        <div
          className="absolute left-full top-1/2 -translate-y-1/2"
          style={{
            width: size.w * 2,
            height: size.h - 2,
            background: `linear-gradient(90deg, ${colors.trail}, transparent)`,
          }}
        />
        {/* Danger indicator for high threat */}
        {isHighThreat && (
          <div
            className="absolute -inset-2 rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.glow}44, transparent)`,
            }}
          />
        )}
      </div>
    );
  }
));
EnemyLaserSprite.displayName = 'EnemyLaserSprite';

// FIREBALL - Boss attack, clearly dangerous
export const FireballSprite = memo(({ fireball, cameraX }: FireballProps) => {
  const screenX = fireball.x - cameraX;
  
  if (screenX < -100 || screenX > 800) return null;
  
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - fireball.y - 16,
        width: 32,
        height: 32,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
    >
      {/* Fireball core */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff 0%, #FFFF00 25%, #FF8800 55%, #FF0000 80%, transparent 100%)',
          boxShadow: '0 0 20px #FF4400, 0 0 40px #FF0000',
        }}
      />
      {/* Inner glow */}
      <div
        className="absolute rounded-full"
        style={{
          top: 6,
          left: 6,
          right: 12,
          bottom: 12,
          background: 'radial-gradient(circle, #fff, #FFFF00)',
        }}
      />
      {/* Trail */}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2"
        style={{
          width: 40,
          height: 16,
          background: 'linear-gradient(90deg, transparent, #FF440066, #FF880088)',
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
  );
});
FireballSprite.displayName = 'FireballSprite';
