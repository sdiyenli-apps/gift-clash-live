import { motion } from 'framer-motion';
import { Projectile as ProjectileType } from '@/types/game';

interface ProjectileProps {
  projectile: ProjectileType;
  cameraX: number;
}

export const ProjectileSprite = ({ projectile, cameraX }: ProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 1000) return null;
  
  const getProjectileStyle = () => {
    switch (projectile.type) {
      case 'ultra':
        return {
          width: 40,
          height: 12,
          background: 'linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff)',
          boxShadow: '0 0 30px #ff00ff, 0 0 60px #00ffff',
        };
      case 'mega':
        return {
          width: 30,
          height: 10,
          background: 'linear-gradient(90deg, #ff00ff, #ff66ff)',
          boxShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
        };
      default:
        return {
          width: 16,
          height: 6,
          background: 'linear-gradient(90deg, #ffff00, #ff8800)',
          boxShadow: '0 0 10px #ffff00, 0 0 20px #ff8800',
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
        x: projectile.type === 'ultra' ? [0, 2, -2, 0] : 0,
      }}
      transition={{
        x: { duration: 0.1, repeat: Infinity },
      }}
    >
      {/* Trail effect */}
      <motion.div
        className="absolute right-full top-1/2 -translate-y-1/2"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.1 }}
        style={{
          width: projectile.type === 'ultra' ? 60 : 30,
          height: style.height - 2,
          background: `linear-gradient(90deg, transparent, ${projectile.type === 'ultra' ? '#ff00ff' : '#ffff00'})`,
        }}
      />
      
      {/* Glow */}
      {projectile.type !== 'normal' && (
        <div 
          className="absolute inset-0 -m-2 rounded-full animate-pulse"
          style={{
            background: projectile.type === 'ultra' 
              ? 'radial-gradient(circle, rgba(255,0,255,0.5), transparent)' 
              : 'radial-gradient(circle, rgba(255,0,255,0.3), transparent)',
          }}
        />
      )}
    </motion.div>
  );
};
