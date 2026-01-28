import { motion, AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState } from 'react';

// =============================================
// DAMAGE NUMBERS - Visual damage indicators
// =============================================

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isResist: boolean;
  isCrit: boolean;
  color: string;
  timestamp: number;
}

interface DamageNumbersProps {
  damageNumbers: DamageNumber[];
  cameraX: number;
}

// Individual damage number display
const DamageNumberDisplay = memo(({ dn, cameraX }: { dn: DamageNumber; cameraX: number }) => {
  const screenX = dn.x - cameraX;
  
  if (screenX < -50 || screenX > 700) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none font-black z-60"
      style={{
        left: screenX,
        bottom: 280 - dn.y,
        color: dn.color,
        textShadow: dn.isResist 
          ? '0 0 8px #ff0000, 2px 2px 0 #000, -1px -1px 0 #000'
          : dn.isCrit 
            ? '0 0 15px #ffff00, 0 0 30px #ff8800, 2px 2px 0 #000' 
            : '0 0 8px ' + dn.color + ', 2px 2px 0 #000',
        fontSize: dn.isResist ? '14px' : dn.isCrit ? '24px' : '16px',
        fontFamily: 'Impact, sans-serif',
      }}
      initial={{ 
        opacity: 1, 
        y: 0, 
        scale: dn.isCrit ? 1.5 : 1,
        x: 0,
      }}
      animate={{ 
        opacity: [1, 1, 0],
        y: -60,
        scale: dn.isCrit ? [1.5, 1.8, 1.2] : [1, 1.1, 0.9],
        x: (Math.random() - 0.5) * 30,
      }}
      transition={{ 
        duration: dn.isResist ? 1.2 : 0.8,
        ease: 'easeOut',
      }}
    >
      {dn.isResist ? (
        <span className="flex items-center gap-1">
          <span className="text-xs text-red-400">🛡️</span>
          RESIST
          <span className="text-xs opacity-70">-{Math.floor(dn.damage)}</span>
        </span>
      ) : (
        <span>
          {dn.isCrit && '💥 '}
          {Math.floor(dn.damage)}
          {dn.isCrit && ' 💥'}
        </span>
      )}
    </motion.div>
  );
});

DamageNumberDisplay.displayName = 'DamageNumberDisplay';

// Main damage numbers container
export const DamageNumbers = memo(({ damageNumbers, cameraX }: DamageNumbersProps) => {
  if (damageNumbers.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-60">
      <AnimatePresence>
        {damageNumbers.map(dn => (
          <DamageNumberDisplay key={dn.id} dn={dn} cameraX={cameraX} />
        ))}
      </AnimatePresence>
    </div>
  );
});

DamageNumbers.displayName = 'DamageNumbers';
