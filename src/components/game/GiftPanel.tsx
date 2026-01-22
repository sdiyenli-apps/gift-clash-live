import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTION_INFO } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
}

// Memoized gift button for performance
const GiftButton = memo(({ 
  gift, 
  style, 
  onTrigger, 
  disabled 
}: { 
  gift: { id: string; emoji: string; action: string }; 
  style: { border: string; bg: string; glow: string }; 
  onTrigger: () => void;
  disabled: boolean;
}) => {
  const actionLabels: Record<string, string> = {
    emp_grenade: 'EMP',
    move_forward: 'GO',
    shoot: 'FIRE',
    armor: 'DEF',
    heal: 'HP',
    magic_dash: 'ULT',
    spawn_enemies: '⚠️',
    summon_support: 'ALLY',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onTrigger}
      disabled={disabled}
      className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation active:opacity-80"
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        boxShadow: disabled ? 'none' : style.glow,
        opacity: disabled ? 0.5 : 1,
        minHeight: '44px',
        minWidth: '44px',
      }}
    >
      <span className="text-xl sm:text-2xl">{gift.emoji}</span>
      <span 
        className="text-[6px] sm:text-[7px] font-bold mt-0.5 opacity-80 uppercase tracking-tight"
        style={{ color: style.border.replace('0.6', '1') }}
      >
        {actionLabels[gift.action] || ''}
      </span>
    </motion.button>
  );
});

GiftButton.displayName = 'GiftButton';

export const GiftPanel = memo(({ onTriggerGift, disabled }: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);

  const getGiftStyle = useCallback((action: string) => {
    const styles: Record<string, { border: string; bg: string; glow: string }> = {
      move_forward: { border: 'rgba(0,255,255,0.6)', bg: 'rgba(0,255,255,0.15)', glow: '0 0 8px rgba(0,255,255,0.3)' },
      shoot: { border: 'rgba(255,150,0,0.6)', bg: 'rgba(255,150,0,0.15)', glow: '0 0 8px rgba(255,150,0,0.3)' },
      armor: { border: 'rgba(0,150,255,0.6)', bg: 'rgba(0,150,255,0.15)', glow: '0 0 8px rgba(0,150,255,0.3)' },
      heal: { border: 'rgba(0,255,100,0.6)', bg: 'rgba(0,255,100,0.15)', glow: '0 0 8px rgba(0,255,100,0.3)' },
      magic_dash: { border: 'rgba(255,0,255,0.6)', bg: 'rgba(255,0,255,0.15)', glow: '0 0 8px rgba(255,0,255,0.3)' },
      spawn_enemies: { border: 'rgba(255,50,50,0.6)', bg: 'rgba(255,50,50,0.15)', glow: '0 0 8px rgba(255,50,50,0.3)' },
      emp_grenade: { border: 'rgba(255,255,0,0.6)', bg: 'rgba(255,255,0,0.15)', glow: '0 0 8px rgba(255,255,0,0.3)' },
      summon_support: { border: 'rgba(0,255,136,0.6)', bg: 'rgba(0,255,136,0.15)', glow: '0 0 8px rgba(0,255,136,0.3)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.05)', glow: 'none' };
  }, []);

  const handleTrigger = useCallback((giftId: string) => {
    onTriggerGift(giftId);
  }, [onTriggerGift]);

  return (
    <div 
      className="rounded-xl p-2"
      style={{
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Gift Grid - Large touch targets */}
      <div className="grid grid-cols-8 gap-1.5">
        {gifts.map(gift => (
          <GiftButton
            key={gift.id}
            gift={gift}
            style={getGiftStyle(gift.action)}
            onTrigger={() => handleTrigger(gift.id)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Legend - Minimal */}
      <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-center gap-3 text-[7px] text-gray-400">
        <span>🌹Move</span>
        <span>🫰Shoot</span>
        <span>⚡EMP</span>
        <span>🤖Ally</span>
      </div>
    </div>
  );
});

GiftPanel.displayName = 'GiftPanel';
