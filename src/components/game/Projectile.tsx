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

// HIGH-END Hero Projectile with cinematic effects
export const ProjectileSprite = memo(({ projectile, cameraX }: ProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 1200) return null;
  
  const getProjectileStyle = () => {
    switch (projectile.type) {
      case 'ultra':
        return {
          width: 70,
          height: 20,
          coreColor: '#ffffff',
          primaryColor: '#ff00ff',
          secondaryColor: '#00ffff',
          trailLength: 120,
          glowIntensity: 3,
        };
      case 'mega':
        return {
          width: 55,
          height: 16,
          coreColor: '#ffffff',
          primaryColor: '#ffff00',
          secondaryColor: '#ff6600',
          trailLength: 80,
          glowIntensity: 2,
        };
      default:
        return {
          width: 32,
          height: 10,
          coreColor: '#ffffff',
          primaryColor: '#00ffff',
          secondaryColor: '#0088ff',
          trailLength: 50,
          glowIntensity: 1.5,
        };
    }
  };
  
  const style = getProjectileStyle();
  
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - projectile.y - style.height / 2,
        width: style.width,
        height: style.height,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.05 }}
    >
      {/* Outer energy field - pulsing aura */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -12,
          background: `radial-gradient(ellipse, ${style.primaryColor}40, ${style.secondaryColor}20, transparent)`,
          filter: 'blur(8px)',
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 0.08, repeat: Infinity }}
      />
      
      {/* Energy trail - long streaking effect */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: style.width * 0.8,
          width: style.trailLength,
          height: style.height * 0.8,
          background: `linear-gradient(90deg, transparent, ${style.primaryColor}20, ${style.primaryColor}60, ${style.secondaryColor})`,
          filter: 'blur(2px)',
          borderRadius: '50%',
        }}
      />
      
      {/* Hot inner trail */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: style.width * 0.6,
          width: style.trailLength * 0.5,
          height: style.height * 0.4,
          background: `linear-gradient(90deg, transparent, ${style.coreColor}80, ${style.coreColor})`,
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.05, repeat: Infinity }}
      />
      
      {/* Main projectile body - sleek energy core */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${style.secondaryColor}, ${style.primaryColor}, ${style.coreColor})`,
          boxShadow: `
            0 0 ${10 * style.glowIntensity}px ${style.primaryColor},
            0 0 ${20 * style.glowIntensity}px ${style.primaryColor}80,
            0 0 ${40 * style.glowIntensity}px ${style.secondaryColor}60,
            inset 0 0 10px ${style.coreColor}
          `,
        }}
        animate={{ 
          boxShadow: [
            `0 0 ${10 * style.glowIntensity}px ${style.primaryColor}, 0 0 ${20 * style.glowIntensity}px ${style.primaryColor}80, 0 0 ${40 * style.glowIntensity}px ${style.secondaryColor}60`,
            `0 0 ${15 * style.glowIntensity}px ${style.primaryColor}, 0 0 ${30 * style.glowIntensity}px ${style.primaryColor}, 0 0 ${50 * style.glowIntensity}px ${style.secondaryColor}`,
            `0 0 ${10 * style.glowIntensity}px ${style.primaryColor}, 0 0 ${20 * style.glowIntensity}px ${style.primaryColor}80, 0 0 ${40 * style.glowIntensity}px ${style.secondaryColor}60`,
          ],
        }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />
      
      {/* White-hot leading edge */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: style.width * 0.6,
          top: '20%',
          width: style.width * 0.35,
          height: '60%',
          background: `radial-gradient(ellipse at right, ${style.coreColor}, ${style.primaryColor}80, transparent)`,
        }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 0.04, repeat: Infinity }}
      />
      
      {/* Energy rings for mega/ultra - orbiting particles */}
      {projectile.type !== 'normal' && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                left: -8 - i * 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 8,
                height: 8,
                background: style.primaryColor,
                boxShadow: `0 0 6px ${style.primaryColor}, 0 0 12px ${style.primaryColor}`,
              }}
              animate={{ 
                scale: [1, 1.5, 0.5],
                opacity: [1, 0.5, 0],
              }}
              transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.04 }}
            />
          ))}
        </>
      )}
      
      {/* Spark particles - flying off the projectile */}
      {projectile.type !== 'normal' && [0, 1].map(i => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: style.coreColor,
            boxShadow: `0 0 6px ${style.coreColor}`,
          }}
          initial={{ 
            left: style.width * 0.3,
            top: style.height * 0.5,
          }}
          animate={{
            left: [-10, -30],
            top: [style.height * 0.5, style.height * (i === 0 ? -0.5 : 1.5)],
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </motion.div>
  );
});
ProjectileSprite.displayName = 'ProjectileSprite';

// HIGH-END Enemy Laser with aggressive visual style
interface EnemyLaserProps extends ProjectileProps {
  isDroneLaser?: boolean;
}

export const EnemyLaserSprite = memo(forwardRef<HTMLDivElement, EnemyLaserProps>(
  ({ projectile, cameraX, isDroneLaser = false }, ref) => {
    const screenX = projectile.x - cameraX;
    
    if (screenX < -50 || screenX > 1200) return null;
    
    // Drone neon laser style - HIGHLY VISIBLE cyan/blue
    if (isDroneLaser || projectile.damage === 8) {
      return (
        <motion.div
          ref={ref}
          className="absolute z-30 pointer-events-none"
          style={{
            left: screenX,
            bottom: 280 - projectile.y - 12,
            width: 55,
            height: 24,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Outer plasma field */}
          <motion.div
            className="absolute -inset-6 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,255,255,0.6), rgba(0,150,255,0.3), transparent)',
              filter: 'blur(10px)',
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          
          {/* Electric arc trail */}
          <div
            className="absolute left-full top-1/2 -translate-y-1/2"
            style={{
              width: 100,
              height: 16,
              background: 'linear-gradient(90deg, #00ffff, #0088ffaa, transparent)',
              filter: 'blur(4px)',
            }}
          />
          
          {/* Main laser body - plasma core */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00ffff, #00ddff, #ffffff, #00ffff)',
              boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #0088ff',
            }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 0.06, repeat: Infinity }}
          />
          
          {/* Inner white-hot core */}
          <div 
            className="absolute inset-[3px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #ffffff, #ccffff, #ffffff)' }}
          />
          
          {/* Leading spark cluster */}
          <motion.div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, #ffffff, #00ffff, transparent)',
              boxShadow: '0 0 25px #00ffff, 0 0 50px #00ffff',
            }}
            animate={{ scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          
          {/* Lightning tendrils */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`lightning-${i}`}
              className="absolute rounded-full"
              style={{
                width: 2,
                height: 12 + Math.random() * 8,
                background: '#00ffff',
                left: 8 + i * 14,
                top: i % 2 === 0 ? -10 : 'auto',
                bottom: i % 2 !== 0 ? -10 : 'auto',
                boxShadow: '0 0 8px #00ffff',
                transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (15 + i * 10)}deg)`,
              }}
              animate={{ scaleY: [0.5, 1.5, 0.5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.06, repeat: Infinity, delay: i * 0.02 }}
            />
          ))}
        </motion.div>
      );
    }
    
    // Regular enemy bullet - AGGRESSIVE RED with high visibility
    return (
      <motion.div
        ref={ref}
        className="absolute z-30 pointer-events-none"
        style={{
          left: screenX,
          bottom: 280 - projectile.y - 14,
          width: 38,
          height: 28,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {/* Danger glow aura */}
        <motion.div
          className="absolute -inset-5 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,68,0,0.7), rgba(255,0,0,0.4), transparent)',
            filter: 'blur(8px)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.08, repeat: Infinity }}
        />
        
        {/* Fire trail */}
        <motion.div
          className="absolute left-full top-1/2 -translate-y-1/2"
          style={{
            width: 70,
            height: 18,
            background: 'linear-gradient(90deg, #ff4400, #ff0000aa, transparent)',
            filter: 'blur(4px)',
          }}
        />
        
        {/* Bullet core - molten metal */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, #ffffff, #ffff00, #ff8800, #ff4400, #ff0000)',
            boxShadow: '0 0 20px #ff4400, 0 0 40px #ff0000, 0 0 60px #ff4400',
          }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 0.05, repeat: Infinity }}
        />
        
        {/* White hot center */}
        <div 
          className="absolute rounded-full"
          style={{ 
            top: 4, left: 4, right: 14, bottom: 4,
            background: 'radial-gradient(circle at 40% 40%, #ffffff, #ffff88, #ffcc00)',
          }}
        />
        
        {/* Flying embers */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={`ember-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#ffff00' : '#ff6600',
              boxShadow: `0 0 6px ${i % 2 === 0 ? '#ffff00' : '#ff6600'}`,
            }}
            initial={{ left: 10, top: 14 }}
            animate={{
              left: [-10 - i * 12, -30 - i * 12],
              top: [14, 14 + (i % 2 === 0 ? -15 : 15)],
              opacity: [1, 0],
              scale: [1, 0.3],
            }}
            transition={{ duration: 0.2, repeat: Infinity, delay: i * 0.06 }}
          />
        ))}
      </motion.div>
    );
  }
));
EnemyLaserSprite.displayName = 'EnemyLaserSprite';

// HIGH-END Boss Fireball with dramatic fire effects
export const FireballSprite = memo(({ fireball, cameraX }: FireballProps) => {
  const screenX = fireball.x - cameraX;
  
  if (screenX < -100 || screenX > 1200) return null;
  
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - fireball.y - 25,
        width: 50,
        height: 50,
      }}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        rotate: { duration: 0.4, repeat: Infinity, ease: 'linear' },
      }}
    >
      {/* Outer heat distortion */}
      <motion.div
        className="absolute -inset-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,100,0,0.5), rgba(255,50,0,0.2), transparent)',
          filter: 'blur(12px)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
      
      {/* Main fireball body */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #ffff00 15%, #ff8800 40%, #ff4400 65%, #ff0000 85%, #aa0000 100%)',
          boxShadow: '0 0 30px #ff4400, 0 0 60px #ff0000, 0 0 90px #ff4400',
        }}
        animate={{
          scale: [1, 1.15, 1],
          boxShadow: [
            '0 0 30px #ff4400, 0 0 60px #ff0000, 0 0 90px #ff4400',
            '0 0 50px #ff4400, 0 0 80px #ff0000, 0 0 120px #ff6600',
            '0 0 30px #ff4400, 0 0 60px #ff0000, 0 0 90px #ff4400',
          ],
        }}
        transition={{ duration: 0.15, repeat: Infinity }}
      />
      
      {/* White-hot core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '25%',
          left: '25%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, #ffffff, #ffffaa, #ffff00)',
        }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />
      
      {/* Flame tongues - organic fire shapes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const dist = 22;
        return (
          <motion.div
            key={`flame-${i}`}
            className="absolute rounded-full"
            style={{
              width: 10 + (i % 3) * 3,
              height: 10 + (i % 3) * 3,
              background: i % 2 === 0 ? '#ffff00' : '#ff6600',
              boxShadow: `0 0 8px ${i % 2 === 0 ? '#ffff00' : '#ff6600'}`,
              left: `calc(50% + ${Math.cos(angle) * dist}px - 5px)`,
              top: `calc(50% + ${Math.sin(angle) * dist}px - 5px)`,
            }}
            animate={{
              scale: [0.6, 1.4, 0.6],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.02 }}
          />
        );
      })}
      
      {/* Smoke trail */}
      <motion.div
        className="absolute right-full top-1/2 -translate-y-1/2"
        style={{
          width: 80,
          height: 30,
          background: 'linear-gradient(90deg, transparent, #ff440044, #ff880088, #ffaa00aa)',
          filter: 'blur(6px)',
        }}
      />
      
      {/* Trailing sparks */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: '#ffff00',
            boxShadow: '0 0 8px #ffff00',
            right: 50 + i * 15,
            top: 25 + (i % 2 === 0 ? -8 : 8),
          }}
          animate={{
            opacity: [1, 0],
            scale: [1, 0.2],
          }}
          transition={{ duration: 0.25, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
    </motion.div>
  );
});
FireballSprite.displayName = 'FireballSprite';
