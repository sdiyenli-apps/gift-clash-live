import { motion } from 'framer-motion';
import { Projectile } from '@/types/game';

interface MetalSlugProjectileProps {
  projectile: Projectile & { originX?: number; originY?: number };
  cameraX: number;
  unitType: 'tank' | 'mech' | 'walker';
}

// Metal Slug-style projectile with shell casings and heavy muzzle effects
export const MetalSlugProjectile = ({ projectile, cameraX, unitType }: MetalSlugProjectileProps) => {
  const screenX = projectile.x - cameraX;
  
  if (screenX < -50 || screenX > 850) return null;
  
  const isTank = unitType === 'tank';
  const isMech = unitType === 'mech';
  
  // Metal Slug style sizing - chunky bullets
  const bulletSize = isTank ? 28 : isMech ? 16 : 14;
  const trailLength = isTank ? 80 : isMech ? 45 : 35;
  
  // Colors per unit type
  const colors = {
    tank: { primary: '#ff6600', secondary: '#ffcc00', glow: '#ff4400', trail: '#ff8800' },
    mech: { primary: '#ff8800', secondary: '#ffee00', glow: '#ff6600', trail: '#ffaa00' },
    walker: { primary: '#00ff88', secondary: '#88ffcc', glow: '#00ffaa', trail: '#00ff66' },
  };
  
  const c = colors[unitType];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX - bulletSize / 2,
        bottom: 280 - projectile.y - bulletSize / 2,
        width: bulletSize,
        height: bulletSize,
        zIndex: 35,
      }}
    >
      {/* Shell casing ejection effect - Metal Slug style */}
      <motion.div
        className="absolute"
        style={{
          left: -trailLength * 0.3,
          top: -8,
          width: 6,
          height: 12,
          background: 'linear-gradient(180deg, #ffcc00, #aa8800, #665500)',
          borderRadius: 2,
          boxShadow: '0 0 4px rgba(255,200,0,0.5)',
        }}
        initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
        animate={{ 
          y: [-5, -20, -15], 
          x: [-10, -25, -35], 
          rotate: [0, 180, 360],
          opacity: [1, 0.8, 0],
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      
      {/* Smoke puff from casing */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: -trailLength * 0.4,
          top: -5,
          width: 12,
          height: 12,
          background: 'radial-gradient(circle, rgba(200,200,200,0.6), rgba(150,150,150,0.3), transparent)',
        }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: [0.5, 2, 3], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main bullet trail - Metal Slug hot streak */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: bulletSize * 0.8,
          width: trailLength,
          height: isTank ? 14 : 8,
          background: `linear-gradient(90deg, transparent, ${c.trail}66, ${c.secondary}cc, ${c.primary})`,
          filter: 'blur(1px)',
        }}
      />
      
      {/* Hot streak core */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          right: bulletSize * 0.6,
          width: trailLength * 0.6,
          height: isTank ? 6 : 3,
          background: `linear-gradient(90deg, transparent, #fff, ${c.secondary})`,
        }}
        animate={{ opacity: [0.8, 1, 0.8], scaleY: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.06, repeat: Infinity }}
      />
      
      {/* Bullet core - chunky Metal Slug style */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, #fff, ${c.secondary}, ${c.primary}, ${c.glow})`,
          boxShadow: `0 0 ${isTank ? 20 : 12}px ${c.glow}, 0 0 ${isTank ? 40 : 24}px ${c.primary}88`,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.08, repeat: Infinity }}
      />
      
      {/* Inner hot core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '20%',
          left: '20%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, #fff, #ffffa0)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.05, repeat: Infinity }}
      />
      
      {/* Impact sparks around bullet */}
      {[...Array(isTank ? 4 : 2)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            background: c.secondary,
            boxShadow: `0 0 4px ${c.secondary}`,
          }}
          initial={{ 
            x: bulletSize / 2, 
            y: bulletSize / 2,
            opacity: 1,
          }}
          animate={{
            x: bulletSize / 2 + Math.cos(i * Math.PI / 2) * 20,
            y: bulletSize / 2 + Math.sin(i * Math.PI / 2) * 20,
            opacity: [1, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: 0.2, delay: i * 0.02, repeat: Infinity }}
        />
      ))}
      
      {/* Tank-specific: Extra muzzle flash residue */}
      {isTank && (
        <>
          <motion.div
            className="absolute -left-4 top-1/2 -translate-y-1/2"
            style={{
              width: 30,
              height: 30,
              background: 'radial-gradient(circle, rgba(255,200,0,0.6), rgba(255,100,0,0.3), transparent)',
              filter: 'blur(4px)',
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          
          {/* Tank targeting reticle */}
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black"
            style={{ color: '#ff6600', textShadow: '0 0 6px #ff4400' }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 0.12, repeat: Infinity }}
          >
            ⊕
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

// Metal Slug-style muzzle flash effect
export const MetalSlugMuzzleFlash = ({ 
  x, 
  y, 
  cameraX, 
  unitType 
}: { 
  x: number; 
  y: number; 
  cameraX: number; 
  unitType: 'tank' | 'mech' | 'walker';
}) => {
  const screenX = x - cameraX;
  const isTank = unitType === 'tank';
  
  const flashSize = isTank ? 60 : 35;
  
  const colors = {
    tank: '#ff6600',
    mech: '#ff8800',
    walker: '#00ff88',
  };
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenX,
        bottom: 280 - y - flashSize / 2,
        width: flashSize,
        height: flashSize,
        zIndex: 36,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 2], opacity: [1, 0.6, 0] }}
      transition={{ duration: 0.15 }}
    >
      {/* Main flash */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, #fff 20%, ${colors[unitType]} 50%, transparent)`,
          filter: 'blur(3px)',
        }}
      />
      
      {/* Flash spikes - Metal Slug style starburst */}
      {[...Array(isTank ? 8 : 5)].map((_, i) => (
        <motion.div
          key={`spike-${i}`}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: 4,
            height: isTank ? 35 : 20,
            background: `linear-gradient(180deg, ${colors[unitType]}, transparent)`,
            transformOrigin: 'center top',
            transform: `translateX(-50%) rotate(${i * (360 / (isTank ? 8 : 5))}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 1 }}
          animate={{ scaleY: [0, 1, 0.5], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.1, delay: i * 0.01 }}
        />
      ))}
      
      {/* Smoke ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid rgba(200,200,200,0.4)`,
        }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: [0.5, 2.5], opacity: [0.8, 0] }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
