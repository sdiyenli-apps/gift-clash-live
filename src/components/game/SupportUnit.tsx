import { motion } from 'framer-motion';
import { SupportUnit as SupportUnitType } from '@/types/game';
import { useRef, useEffect, useState } from 'react';
import supportMech from '@/assets/support-mech.gif';
import supportWalker from '@/assets/support-walker.gif';
import supportTank from '@/assets/support-tank.gif';
import tankExplosionGif from '@/assets/tank-explosion.gif';

interface SupportUnitProps {
  unit: SupportUnitType;
  cameraX: number;
}

export const SupportUnitSprite = ({ unit, cameraX }: SupportUnitProps) => {
  // Track tank attack count for explosion effect every 4th attack
  const attackCountRef = useRef(0);
  const [showExplosionFX, setShowExplosionFX] = useState(false);
  const wasAttackingRef = useRef(false);
  
  const screenX = unit.x - cameraX;
  const isTank = unit.type === 'tank';
  
  // Check if attacking - trigger when cooldown was just set (above threshold)
  // Tank: cooldown 0.08-0.18, Mech: 0.6, Walker: 0.4
  const isAttacking = unit.attackCooldown > 0 && unit.attackCooldown > (unit.type === 'mech' ? 0.55 : unit.type === 'tank' ? 0.06 : 0.35);
  
  // Track attack count for tank explosion FX - every 4th attack shows explosion GIF
  useEffect(() => {
    if (isTank && isAttacking && !wasAttackingRef.current) {
      attackCountRef.current++;
      if (attackCountRef.current % 4 === 0) {
        setShowExplosionFX(true);
        setTimeout(() => setShowExplosionFX(false), 800);
      }
    }
    wasAttackingRef.current = isAttacking;
  }, [isAttacking, isTank]);
  
  if (screenX < -150 || screenX > 750) return null;
  
  // Get sprite based on type
  const getSprite = () => {
    switch (unit.type) {
      case 'tank': return supportTank;
      case 'mech': return supportMech;
      default: return supportWalker;
    }
  };
  
  const sprite = getSprite();
  const glowColor = unit.type === 'mech' ? '#ff8800' : unit.type === 'tank' ? '#ff6600' : '#00ff88';
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const shieldPercent = unit.maxShield > 0 ? (unit.shield / unit.maxShield) * 100 : 0;
  
  // Size based on type - Tank is 3x larger
  const isMech = unit.type === 'mech';
  const baseScale = isTank ? 1.0 : 0.80; // Tank uses full size (already 3x in config)
  const displayWidth = unit.width * baseScale;
  const displayHeight = unit.height * baseScale;
  
  // Landing animation
  const isLanding = unit.isLanding && (unit.landingTimer || 0) > 0;
  const landProgress = isLanding ? 1 - ((unit.landingTimer || 0) / 1.2) : 1;
  
  // Self-destruct mode
  const isSelfDestructing = unit.isSelfDestructing;
  const selfDestructProgress = isSelfDestructing ? 1 - ((unit.selfDestructTimer || 1) / 1.0) : 0;
  
  // Tank has armor indicator
  const hasArmor = unit.hasArmor && (unit.armorTimer || 0) > 0;
  
  const baseBottom = isMech ? 100 : isTank ? 85 : 70;
  const selfDestructYOffset = isSelfDestructing ? (unit.y - 100) : 0;
  const leftOffset = -30;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: screenX + leftOffset,
        bottom: isLanding ? baseBottom + 300 * (1 - landProgress) : baseBottom + selfDestructYOffset,
        width: displayWidth,
        height: displayHeight,
        zIndex: 24,
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
      
      {/* TANK ARMOR INDICATOR */}
      {isTank && hasArmor && (
        <>
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #00aaff, #0066ff)',
              color: '#fff',
              boxShadow: '0 0 12px #00aaff',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            🛡️ ARMOR {Math.ceil(unit.armorTimer || 0)}s
          </motion.div>
          
          <motion.div
            className="absolute inset-0 -m-2 rounded-lg pointer-events-none"
            style={{
              border: '3px solid rgba(0,170,255,0.8)',
              boxShadow: '0 0 20px rgba(0,170,255,0.6), inset 0 0 15px rgba(0,170,255,0.3)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        </>
      )}
      
      {/* SELF-DESTRUCT MODE */}
      {isSelfDestructing && (
        <>
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #ff0000, #ff4400)',
              color: '#fff',
              boxShadow: '0 0 15px #ff0000',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            💥 SELF-DESTRUCT 💥
          </motion.div>
          
          <motion.div
            className="absolute inset-0 -m-4 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(255,100,0,${0.3 + selfDestructProgress * 0.5}), transparent)`,
              filter: 'blur(8px)',
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          
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
        </>
      )}
      
      {/* ATTACK EFFECTS - From FRONT of tank image, bullets for others */}
      {isAttacking && !isSelfDestructing && !isLanding && (
        <>
          {/* Muzzle flash - positioned at FRONT of unit */}
          <motion.div
            className="absolute"
            style={{
              // Tank fires from front (right edge of image)
              left: isTank ? displayWidth - 10 : undefined,
              right: isTank ? undefined : (isMech ? -30 : -25),
              top: isTank ? '35%' : '50%', // Tank cannon is higher
              transform: 'translateY(-50%)',
              width: isTank ? 70 : isMech ? 50 : 40,
              height: isTank ? 30 : isMech ? 50 : 40,
              background: isTank 
                ? 'linear-gradient(90deg, #ff0066, #ff00ff, #00ffff)'
                : isMech 
                  ? 'radial-gradient(circle, #fff, #ffaa00, #ff6600, transparent)'
                  : 'radial-gradient(circle, #fff, #00ffaa, #00ff88, transparent)',
              borderRadius: '50%',
              filter: 'blur(3px)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0.3] }}
            transition={{ duration: 0.12 }}
          />
          
          {/* Tank laser beam effect - from front of tank */}
          {isTank && (
            <motion.div
              className="absolute"
              style={{
                left: displayWidth + 20, // Fire from front edge
                top: '35%', // Tank cannon height
                transform: 'translateY(-50%)',
                width: 120,
                height: 10,
                background: 'linear-gradient(90deg, #ff0066, #ff00ff, transparent)',
                boxShadow: '0 0 15px #ff0066, 0 0 30px #ff00ff',
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 0.8], opacity: [0, 1, 0] }}
              transition={{ duration: 0.15 }}
            />
          )}
          
          {/* TANK EXPLOSION GIF - Every 4th attack */}
          {isTank && showExplosionFX && (
            <motion.div
              className="absolute pointer-events-none z-50"
              style={{
                left: displayWidth + 80,
                top: '20%',
                transform: 'translateY(-50%)',
                width: 150,
                height: 150,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <img
                src={tankExplosionGif}
                alt="Explosion"
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px #ff6600) drop-shadow(0 0 40px #ff4400) brightness(1.3)',
                  mixBlendMode: 'screen',
                }}
              />
              {/* Extra glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,100,0,0.5), transparent 70%)',
                  filter: 'blur(10px)',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.15, repeat: 5 }}
              />
            </motion.div>
          )}
          
          {/* Energy rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                right: -10 - i * 20,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
                border: `2px solid ${isTank ? '#ff0066' : isMech ? '#ffaa00' : '#00ff88'}`,
                opacity: 0.8 - i * 0.2,
              }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5 + i, opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            />
          ))}
          
          {/* Recoil flash */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: isTank 
                ? 'radial-gradient(ellipse at right, rgba(255,0,102,0.4), transparent 60%)'
                : isMech 
                  ? 'radial-gradient(ellipse at right, rgba(255,136,0,0.4), transparent 60%)'
                  : 'radial-gradient(ellipse at right, rgba(0,255,136,0.3), transparent 60%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.1 }}
          />
        </>
      )}
      
      {/* Support unit sprite */}
      <motion.div
        className="relative w-full h-full"
        animate={{ 
          y: isSelfDestructing ? [0, -5, 0] : [0, -3, 0],
          rotate: isSelfDestructing ? [0, 5, -5, 0] : isAttacking ? [0, -2, 0] : 0,
          x: isAttacking ? [0, 3, 0] : 0,
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
              : hasArmor
                ? `drop-shadow(0 0 15px #00aaff) brightness(1.1)`
                : isAttacking
                  ? `drop-shadow(0 0 15px ${glowColor}) brightness(1.2)`
                  : `drop-shadow(0 0 12px ${glowColor})`,
          }}
        />
        
        {/* Unit type indicator */}
        {!isSelfDestructing && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded"
            style={{
              background: isTank 
                ? 'linear-gradient(135deg, #ff8800, #ff6600)'
                : 'linear-gradient(135deg, #00ff88, #00aa55)',
              color: isTank ? '#fff' : '#000',
              boxShadow: `0 0 8px ${glowColor}`,
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {isTank ? 'TANK' : 'ALLY'}
          </motion.div>
        )}
        
        {/* Health bar */}
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
        
        {/* Timer indicator */}
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
