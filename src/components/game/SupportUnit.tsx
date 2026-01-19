import { motion } from 'framer-motion';
import { SupportUnit as SupportUnitType } from '@/types/game';
import supportMech from '@/assets/support-mech.gif';
import supportWalker from '@/assets/support-walker.gif';

interface SupportUnitProps {
  unit: SupportUnitType;
  cameraX: number;
}

export const SupportUnitSprite = ({ unit, cameraX }: SupportUnitProps) => {
  const screenX = unit.x - cameraX;
  
  if (screenX < -150 || screenX > 750) return null;
  
  const sprite = unit.type === 'mech' ? supportMech : supportWalker;
  const glowColor = unit.type === 'mech' ? '#ff8800' : '#00ff88';
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const shieldPercent = unit.maxShield > 0 ? (unit.shield / unit.maxShield) * 100 : 0;
  
  // Mech is double size
  const isMech = unit.type === 'mech';
  const displayWidth = isMech ? unit.width : unit.width;
  const displayHeight = isMech ? unit.height : unit.height;
  
  // Landing animation - starts from top of screen
  const isLanding = unit.isLanding && (unit.landingTimer || 0) > 0;
  const landProgress = isLanding ? 1 - ((unit.landingTimer || 0) / 1.2) : 1;
  
  // Self-destruct mode
  const isSelfDestructing = unit.isSelfDestructing;
  const selfDestructProgress = isSelfDestructing ? 1 - ((unit.selfDestructTimer || 1) / 1.0) : 0;
  
  // Check if currently attacking (cooldown just started)
  const isAttacking = unit.attackCooldown > 0 && unit.attackCooldown > (unit.type === 'mech' ? 1.0 : 0.4);
  
  // Calculate bottom position - account for self-destruct flying up and larger mech
  const baseBottom = isMech ? 108 : 118; // Mech sits slightly lower due to larger size
  const selfDestructYOffset = isSelfDestructing ? (unit.y - 120) : 0; // unit.y tracks actual Y during self-destruct
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: isLanding ? baseBottom + 300 * (1 - landProgress) : baseBottom + selfDestructYOffset,
        width: displayWidth,
        height: displayHeight,
      }}
      initial={{ opacity: 0, y: -200 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isSelfDestructing ? 1 + selfDestructProgress * 0.3 : 1,
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Landing trail effect */}
      {isLanding && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: -80,
            width: 15,
            height: 100,
            background: `linear-gradient(180deg, transparent, ${glowColor}, #fff)`,
            filter: 'blur(6px)',
          }}
          animate={{ opacity: [0.8, 0.4, 0.8], height: [100, 60, 100] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />
      )}
      
      {/* SELF-DESTRUCT MODE - Warning effects */}
      {isSelfDestructing && (
        <>
          {/* Danger warning */}
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #ff0000, #ff4400)',
              color: '#fff',
              boxShadow: '0 0 15px #ff0000',
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            💥 SELF-DESTRUCT 💥
          </motion.div>
          
          {/* Energy buildup glow */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(255,100,0,${0.3 + selfDestructProgress * 0.5}), transparent)`,
              filter: 'blur(8px)',
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          
          {/* Fire trail behind */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{
              left: -40 - selfDestructProgress * 20,
              width: 60 + selfDestructProgress * 40,
              height: 20,
              background: 'linear-gradient(90deg, transparent, #ff4400, #ffff00, #fff)',
              filter: 'blur(4px)',
              borderRadius: 10,
            }}
            animate={{ opacity: [0.8, 1, 0.8], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          
          {/* Sparks */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                background: i % 2 === 0 ? '#ffff00' : '#ff4400',
                left: -10 - i * 8,
                top: '50%',
              }}
              animate={{
                x: [0, -30 - Math.random() * 30],
                y: [(i - 2) * 10, (i - 2) * 20],
                opacity: [1, 0],
              }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </>
      )}
      
      {/* ATTACK EFFECTS - Muzzle flash and projectile trail */}
      {isAttacking && !isSelfDestructing && !isLanding && (
        <>
          {/* Muzzle flash glow */}
          <motion.div
            className="absolute"
            style={{
              right: -20,
              top: '40%',
              width: 30,
              height: 30,
              background: unit.type === 'mech' 
                ? 'radial-gradient(circle, #fff, #ff8800, #ff4400, transparent)'
                : 'radial-gradient(circle, #fff, #00ff88, #00ffff, transparent)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.5] }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Projectile beam/trail */}
          <motion.div
            className="absolute"
            style={{
              right: -60,
              top: '42%',
              width: unit.type === 'mech' ? 40 : 80,
              height: unit.type === 'mech' ? 12 : 6,
              background: unit.type === 'mech'
                ? 'linear-gradient(90deg, #ff8800, #ffff00, #fff)'
                : 'linear-gradient(90deg, #00ff88, #00ffff, #fff)',
              borderRadius: unit.type === 'mech' ? 6 : 3,
              boxShadow: unit.type === 'mech'
                ? '0 0 15px #ff8800, 0 0 30px #ff4400'
                : '0 0 10px #00ff88, 0 0 20px #00ffff',
            }}
            initial={{ scaleX: 0, x: 0 }}
            animate={{ scaleX: [0, 1, 0.5], x: [0, 40, 80], opacity: [1, 1, 0] }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Sparks */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`attack-spark-${i}`}
              className="absolute rounded-full"
              style={{
                right: -15,
                top: `${35 + i * 8}%`,
                width: 4,
                height: 4,
                background: unit.type === 'mech' ? '#ffff00' : '#00ffff',
                boxShadow: `0 0 4px ${unit.type === 'mech' ? '#ff8800' : '#00ff88'}`,
              }}
              animate={{
                x: [0, 30 + Math.random() * 20],
                y: [(i - 1.5) * 5, (i - 1.5) * 15],
                opacity: [1, 0],
                scale: [1, 0.5],
              }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
            />
          ))}
        </>
      )}
      
      {/* Support unit sprite - faces RIGHT toward enemies */}
      <motion.div
        className="relative w-full h-full"
        animate={{ 
          y: isSelfDestructing ? [0, -5, 0] : [0, -3, 0],
          rotate: isSelfDestructing ? [0, 5, -5, 0] : isAttacking ? [0, -2, 0] : 0,
          x: isAttacking ? [0, 3, 0] : 0, // Recoil effect
        }}
        transition={{ duration: isSelfDestructing ? 0.1 : isAttacking ? 0.1 : 0.4, repeat: Infinity }}
      >
        <img
          src={sprite}
          alt={unit.type}
          className="w-full h-full object-contain"
          style={{
            filter: isSelfDestructing 
              ? `drop-shadow(0 0 20px #ff4400) brightness(${1 + selfDestructProgress * 0.5})`
              : isAttacking
                ? `drop-shadow(0 0 15px ${glowColor}) brightness(1.2)`
                : `drop-shadow(0 0 12px ${glowColor})`,
          }}
        />
        
        {/* Ally indicator - hide during self-destruct */}
        {!isSelfDestructing && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded"
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00aa55)',
              color: '#000',
              boxShadow: `0 0 8px ${glowColor}`,
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ALLY
          </motion.div>
        )}
        
        {/* Health/Shield bar - changes to red during self-destruct */}
        <div className="absolute -bottom-4 left-0 right-0 h-2 bg-black/60 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: isSelfDestructing ? `${(1 - selfDestructProgress) * 100}%` : `${healthPercent}%`,
              background: isSelfDestructing 
                ? 'linear-gradient(90deg, #ff0000, #ff4400)'
                : 'linear-gradient(90deg, #00ff00, #88ff00)',
            }}
          />
          {shieldPercent > 0 && !isSelfDestructing && (
            <div
              className="absolute top-0 h-full transition-all duration-200"
              style={{
                width: `${shieldPercent}%`,
                background: 'linear-gradient(90deg, #00ffff, #0088ff)',
                opacity: 0.7,
              }}
            />
          )}
        </div>
        
        {/* Timer indicator - countdown during self-destruct */}
        <div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold"
          style={{ 
            color: isSelfDestructing ? '#ff4400' : glowColor, 
            textShadow: `0 0 5px ${isSelfDestructing ? '#ff4400' : glowColor}` 
          }}
        >
          {isSelfDestructing ? `💣 ${(unit.selfDestructTimer || 0).toFixed(1)}s` : `${Math.ceil(unit.timer)}s`}
        </div>
      </motion.div>
    </motion.div>
  );
};
