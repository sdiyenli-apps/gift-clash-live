import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

interface GiftComboIndicatorProps {
  giftCombo: number;
  giftComboTimer: number;
  damageMultiplier: number;
}

// Neon color palette based on combo tier
const getComboStyle = (combo: number) => {
  if (combo >= 10) return { 
    color: '#ff00ff', 
    glow: '#ff00ff',
    label: 'LEGENDARY',
    icon: '👑'
  };
  if (combo >= 7) return { 
    color: '#ff4400', 
    glow: '#ff6600',
    label: 'ULTRA',
    icon: '🔥'
  };
  if (combo >= 5) return { 
    color: '#ffaa00', 
    glow: '#ffcc00',
    label: 'SUPER',
    icon: '⚡'
  };
  if (combo >= 3) return { 
    color: '#00ffff', 
    glow: '#00aaff',
    label: 'COMBO',
    icon: '💥'
  };
  return { 
    color: '#00ff88', 
    glow: '#00ff44',
    label: 'COMBO',
    icon: '✨'
  };
};

export const GiftComboIndicator = memo(({ giftCombo, giftComboTimer, damageMultiplier }: GiftComboIndicatorProps) => {
  if (giftCombo < 2 || giftComboTimer <= 0) return null;
  
  const style = getComboStyle(giftCombo);
  const timePercent = (giftComboTimer / 3) * 100; // 3 second max timer
  
  return (
    <AnimatePresence>
      <motion.div
        key={`combo-${giftCombo}`}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Main combo container */}
        <div 
          className="relative px-6 py-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${style.color}20, ${style.glow}10, transparent)`,
            border: `2px solid ${style.color}`,
            boxShadow: `0 0 20px ${style.glow}60, 0 0 40px ${style.glow}30, inset 0 0 30px ${style.color}20`,
          }}
        >
          {/* Animated glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${style.glow}30, transparent 70%)`,
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          
          {/* Combo text */}
          <div className="flex items-center gap-3 relative z-10">
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {style.icon}
            </motion.span>
            
            <div className="flex flex-col items-center">
              <motion.span
                className="font-black text-xl tracking-wider"
                style={{ 
                  color: style.color,
                  textShadow: `0 0 10px ${style.glow}, 0 0 20px ${style.glow}`,
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                {giftCombo}x {style.label}!
              </motion.span>
              
              <span 
                className="text-xs font-bold tracking-wide"
                style={{ 
                  color: '#fff',
                  textShadow: `0 0 8px ${style.glow}`,
                }}
              >
                DMG: {damageMultiplier.toFixed(1)}x
              </span>
            </div>
            
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {style.icon}
            </motion.span>
          </div>
          
          {/* Timer bar */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div
              className="h-full"
              style={{
                width: `${timePercent}%`,
                background: `linear-gradient(90deg, ${style.color}, ${style.glow})`,
                boxShadow: `0 0 10px ${style.glow}`,
              }}
              initial={{ width: '100%' }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          {/* Corner accents */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2"
            style={{ borderColor: style.color }}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2"
            style={{ borderColor: style.color }}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2"
            style={{ borderColor: style.color }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2"
            style={{ borderColor: style.color }}
          />
        </div>
        
        {/* Particle bursts for high combos */}
        {giftCombo >= 5 && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  background: style.color,
                  boxShadow: `0 0 8px ${style.glow}`,
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 2) * 60],
                  y: [0, Math.sin(i * Math.PI / 2) * 40],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

GiftComboIndicator.displayName = 'GiftComboIndicator';
