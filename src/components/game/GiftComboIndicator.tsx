import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

interface GiftComboIndicatorProps {
  giftCombo: number; // Now actually "kill combo"
  giftComboTimer: number;
  damageMultiplier: number;
}

// Neon color palette based on combo tier - EVERY 3 KILLS increases tier
const getComboStyle = (combo: number, multiplier: number) => {
  // Tier is based on multiplier level (every 3 kills = +0.5x multiplier)
  if (multiplier >= 3.0) return { 
    color: '#ff00ff', 
    glow: '#ff00ff',
    label: 'LEGENDARY',
    icon: '👑',
    nextTier: null
  };
  if (multiplier >= 2.5) return { 
    color: '#ff0000', 
    glow: '#ff4400',
    label: 'MYTHIC',
    icon: '🔥',
    nextTier: 3 - (combo % 3) // Kills until next tier
  };
  if (multiplier >= 2.0) return { 
    color: '#ff4400', 
    glow: '#ff6600',
    label: 'ULTRA',
    icon: '⚡',
    nextTier: 3 - (combo % 3)
  };
  if (multiplier >= 1.5) return { 
    color: '#ffaa00', 
    glow: '#ffcc00',
    label: 'SUPER',
    icon: '💥',
    nextTier: 3 - (combo % 3)
  };
  // Starting tier - first 3 kills build to 1.5x
  return { 
    color: '#00ff88', 
    glow: '#00ff44',
    label: 'KILLS',
    icon: '💀',
    nextTier: 3 - (combo % 3)
  };
};

export const GiftComboIndicator = memo(({ giftCombo, giftComboTimer, damageMultiplier }: GiftComboIndicatorProps) => {
  if (giftCombo < 1 || giftComboTimer <= 0) return null;
  
  const style = getComboStyle(giftCombo, damageMultiplier);
  const timePercent = (giftComboTimer / 3) * 100; // 3 second max timer
  
  return (
    <AnimatePresence>
      {/* Screen flash effect on multiplier increase - subtle */}
      {damageMultiplier >= 1.5 && (
        <motion.div
          key={`flash-${Math.floor(damageMultiplier * 2)}`}
          className="fixed inset-0 z-[99] pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${style.color}30, transparent 50%)`,
          }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Compact multiplier indicator - TOP RIGHT CORNER */}
      <motion.div
        key={`combo-${giftCombo}`}
        className="fixed top-2 right-2 z-[100] pointer-events-none"
        initial={{ scale: 0.8, opacity: 0, x: 20 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.8, opacity: 0, x: 20 }}
      >
        {/* Power surge effect for high multipliers - smaller */}
        {damageMultiplier >= 2.0 && (
          <motion.div
            className="absolute inset-0 -m-4 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${style.glow}25, transparent 60%)`,
            }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
        
        {/* COMPACT combo container */}
        <div 
          className="relative px-3 py-1.5 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${style.color}25, ${style.glow}15, rgba(0,0,0,0.6))`,
            border: `1.5px solid ${style.color}`,
            boxShadow: `0 0 12px ${style.glow}50, 0 0 24px ${style.glow}25`,
          }}
        >
          {/* Animated glow pulse - subtle */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${style.glow}20, transparent 70%)`,
            }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          
          {/* Compact combo display */}
          <div className="flex items-center gap-2 relative z-10">
            <motion.span
              className="text-sm"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {style.icon}
            </motion.span>
            
            <div className="flex items-center gap-1.5">
              <motion.span
                className="font-black text-sm tracking-wide"
                style={{ 
                  color: style.color,
                  textShadow: `0 0 6px ${style.glow}`,
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                {damageMultiplier.toFixed(1)}x
              </motion.span>
              
              <span 
                className="text-[10px] font-bold opacity-80"
                style={{ 
                  color: '#fff',
                  textShadow: `0 0 4px ${style.glow}`,
                }}
              >
                {style.label}
              </span>
            </div>
          </div>
          
          {/* Timer bar - compact */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div
              className="h-full"
              style={{
                width: `${timePercent}%`,
                background: `linear-gradient(90deg, ${style.color}, ${style.glow})`,
                boxShadow: `0 0 6px ${style.glow}`,
              }}
              initial={{ width: '100%' }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
        
        {/* Small lightning for legendary tier */}
        {damageMultiplier >= 3.0 && (
          <motion.div
            className="absolute -left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            ⚡
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

GiftComboIndicator.displayName = 'GiftComboIndicator';
