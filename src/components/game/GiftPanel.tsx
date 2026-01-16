import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTION_INFO } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
}

export const GiftPanel = ({ onTriggerGift, disabled }: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);

  const getGiftStyle = (action: string) => {
    const styles: Record<string, { border: string; bg: string; glow: string }> = {
      move_forward: { border: 'rgba(0,255,255,0.5)', bg: 'rgba(0,255,255,0.15)', glow: '0 0 15px rgba(0,255,255,0.3)' },
      shoot: { border: 'rgba(255,150,0,0.5)', bg: 'rgba(255,150,0,0.15)', glow: '0 0 15px rgba(255,150,0,0.3)' },
      armor: { border: 'rgba(0,150,255,0.5)', bg: 'rgba(0,150,255,0.15)', glow: '0 0 15px rgba(0,150,255,0.3)' },
      heal: { border: 'rgba(0,255,100,0.5)', bg: 'rgba(0,255,100,0.15)', glow: '0 0 15px rgba(0,255,100,0.3)' },
      magic_dash: { border: 'rgba(255,0,255,0.5)', bg: 'rgba(255,0,255,0.15)', glow: '0 0 15px rgba(255,0,255,0.3)' },
      spawn_enemies: { border: 'rgba(255,50,50,0.5)', bg: 'rgba(255,50,50,0.15)', glow: '0 0 15px rgba(255,50,50,0.3)' },
      emp_grenade: { border: 'rgba(255,255,0,0.5)', bg: 'rgba(255,255,0,0.15)', glow: '0 0 15px rgba(255,255,0,0.3)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.05)', glow: 'none' };
  };

  return (
    <div 
      className="rounded-lg p-1.5"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Gift Grid - Smaller for mobile */}
      <div className="grid grid-cols-7 gap-1">
        {gifts.map(gift => {
          const style = getGiftStyle(gift.action);
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="relative rounded-lg flex flex-col items-center justify-center aspect-square touch-manipulation"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                boxShadow: style.glow,
                opacity: disabled ? 0.5 : 1,
                minHeight: '36px',
                maxHeight: '42px',
              }}
            >
              <motion.div 
                className="text-base"
                animate={gift.action === 'magic_dash' ? { rotate: [0, 360] } : { scale: [1, 1.08, 1] }}
                transition={{ duration: gift.action === 'magic_dash' ? 3 : 1.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend - Ultra compact */}
      <div className="mt-1 pt-1 border-t border-white/10 flex justify-center gap-1.5 text-[7px] text-gray-400">
        <span>🌹Mv</span>
        <span>🫰Sh</span>
        <span>🧢Ar</span>
        <span>💐Hp</span>
        <span>🌌Mg</span>
        <span>💀⚠️</span>
        <span>⚡Em</span>
      </div>
    </div>
  );
};