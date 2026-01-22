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
      move_forward: { border: 'rgba(0,255,255,0.6)', bg: 'rgba(0,255,255,0.2)', glow: '0 0 12px rgba(0,255,255,0.4)' },
      shoot: { border: 'rgba(255,150,0,0.6)', bg: 'rgba(255,150,0,0.2)', glow: '0 0 12px rgba(255,150,0,0.4)' },
      armor: { border: 'rgba(0,150,255,0.6)', bg: 'rgba(0,150,255,0.2)', glow: '0 0 12px rgba(0,150,255,0.4)' },
      heal: { border: 'rgba(0,255,100,0.6)', bg: 'rgba(0,255,100,0.2)', glow: '0 0 12px rgba(0,255,100,0.4)' },
      magic_dash: { border: 'rgba(255,0,255,0.6)', bg: 'rgba(255,0,255,0.2)', glow: '0 0 12px rgba(255,0,255,0.4)' },
      spawn_enemies: { border: 'rgba(255,50,50,0.6)', bg: 'rgba(255,50,50,0.2)', glow: '0 0 12px rgba(255,50,50,0.4)' },
      emp_grenade: { border: 'rgba(255,255,0,0.6)', bg: 'rgba(255,255,0,0.2)', glow: '0 0 12px rgba(255,255,0,0.4)' },
      summon_support: { border: 'rgba(0,255,136,0.6)', bg: 'rgba(0,255,136,0.2)', glow: '0 0 12px rgba(0,255,136,0.4)' },
    };
    return styles[action] || { border: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.05)', glow: 'none' };
  };

  return (
    <div 
      className="rounded-xl p-2"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Gift Grid - Mobile optimized larger buttons */}
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
        {gifts.map(gift => {
          const style = getGiftStyle(gift.action);
          const actionInfo = GIFT_ACTION_INFO[gift.action];
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="relative rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation active:opacity-80"
              style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                boxShadow: style.glow,
                opacity: disabled ? 0.5 : 1,
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              <motion.div 
                className="text-xl sm:text-2xl"
                animate={gift.action === 'magic_dash' ? { rotate: [0, 360] } : { scale: [1, 1.12, 1] }}
                transition={{ duration: gift.action === 'magic_dash' ? 3 : 1.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              {/* Small action label */}
              <span 
                className="text-[6px] sm:text-[7px] font-bold mt-0.5 opacity-80 uppercase tracking-tight"
                style={{ color: style.border.replace('0.6', '1') }}
              >
                {gift.action === 'emp_grenade' ? 'EMP' : 
                 gift.action === 'move_forward' ? 'GO' :
                 gift.action === 'shoot' ? 'FIRE' :
                 gift.action === 'armor' ? 'DEF' :
                 gift.action === 'heal' ? 'HP' :
                 gift.action === 'magic_dash' ? 'ULT' :
                 gift.action === 'spawn_enemies' ? '⚠️' : 
                 gift.action === 'summon_support' ? 'ALLY' : ''}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend - Clearer mobile text */}
      <div className="mt-1.5 pt-1.5 border-t border-white/15 flex justify-center gap-2 text-[8px] sm:text-[9px] text-gray-300">
        <span className="flex items-center gap-0.5"><span className="opacity-70">🌹</span>Move</span>
        <span className="flex items-center gap-0.5"><span className="opacity-70">🫰</span>Shoot</span>
        <span className="flex items-center gap-0.5"><span className="opacity-70">⚡</span>EMP</span>
        <span className="flex items-center gap-0.5"><span className="opacity-70">🤖</span>Ally</span>
      </div>
    </div>
  );
};