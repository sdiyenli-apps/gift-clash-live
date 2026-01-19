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
  
  if (screenX < -100 || screenX > 700) return null;
  
  const sprite = unit.type === 'mech' ? supportMech : supportWalker;
  const glowColor = unit.type === 'mech' ? '#ff8800' : '#00ff88';
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const shieldPercent = unit.maxShield > 0 ? (unit.shield / unit.maxShield) * 100 : 0;
  
  // Landing animation - starts from top of screen
  const isLanding = unit.isLanding && (unit.landingTimer || 0) > 0;
  const landProgress = isLanding ? 1 - ((unit.landingTimer || 0) / 1.2) : 1;
  
  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: screenX,
        bottom: isLanding ? 118 + 300 * (1 - landProgress) : 118,
        width: unit.width,
        height: unit.height,
      }}
      initial={{ opacity: 0, y: -200 }}
      animate={{ opacity: 1, y: 0 }}
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
      
      {/* Support unit sprite - faces RIGHT toward enemies */}
      <motion.div
        className="relative w-full h-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.4, repeat: Infinity }}
      >
        <img
          src={sprite}
          alt={unit.type}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0 0 12px ${glowColor})`,
          }}
        />
        
        {/* Ally indicator */}
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
        
        {/* Health/Shield bar */}
        <div className="absolute -bottom-4 left-0 right-0 h-2 bg-black/60 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: `${healthPercent}%`,
              background: 'linear-gradient(90deg, #00ff00, #88ff00)',
            }}
          />
          {shieldPercent > 0 && (
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
        
        {/* Timer indicator */}
        <div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold"
          style={{ color: glowColor, textShadow: `0 0 5px ${glowColor}` }}
        >
          {Math.ceil(unit.timer)}s
        </div>
      </motion.div>
    </motion.div>
  );
};