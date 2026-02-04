import { memo } from 'react';

interface GiftComboIndicatorProps {
  giftCombo: number; // Now actually "kill combo"
  giftComboTimer: number;
  damageMultiplier: number;
}

// Compact color palette based on multiplier - minimal visual impact
const getMultiplierStyle = (multiplier: number) => {
  if (multiplier >= 3.0) return { 
    color: '#ff00ff', 
    label: '3x',
  };
  if (multiplier >= 2.5) return { 
    color: '#ff4400', 
    label: '2.5x',
  };
  if (multiplier >= 2.0) return { 
    color: '#ff8800', 
    label: '2x',
  };
  if (multiplier >= 1.5) return { 
    color: '#ffcc00', 
    label: '1.5x',
  };
  return { 
    color: '#00ff88', 
    label: '1x',
  };
};

export const GiftComboIndicator = memo(({ giftCombo, giftComboTimer, damageMultiplier }: GiftComboIndicatorProps) => {
  // Only show when multiplier is above 1.0
  if (damageMultiplier <= 1.0 || giftComboTimer <= 0) return null;
  
  const style = getMultiplierStyle(damageMultiplier);
  const timePercent = (giftComboTimer / 3) * 100;
  
  return (
    <div
      className="fixed top-2 right-2 z-50 pointer-events-none"
    >
      {/* Minimal multiplier indicator - no animations, no effects */}
      <div 
        className="px-2 py-1 rounded text-xs font-bold"
        style={{
          background: `${style.color}33`,
          border: `1px solid ${style.color}88`,
          color: style.color,
        }}
      >
        <span>{damageMultiplier.toFixed(1)}x DMG</span>
        
        {/* Simple timer bar */}
        <div 
          className="mt-1 h-0.5 rounded overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${timePercent}%`,
              background: style.color,
            }}
          />
        </div>
      </div>
    </div>
  );
});

GiftComboIndicator.displayName = 'GiftComboIndicator';
