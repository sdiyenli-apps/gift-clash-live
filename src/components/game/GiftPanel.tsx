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
      className="rounded-xl p-2"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Title */}
      <h3 
        className="font-black text-xs text-center mb-1.5"
        style={{
          background: 'linear-gradient(90deg, #ff00ff, #00ffff, #ffff00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        🎁 TAP TO SEND GIFT
      </h3>

      {/* Gift Grid - Optimized for mobile touch */}
      <div className="grid grid-cols-7 gap-1.5">
        {gifts.map(gift => {
          const actionInfo = GIFT_ACTION_INFO[gift.action];
          const style = getGiftStyle(gift.action);
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className="relative p-1.5 rounded-xl flex flex-col items-center justify-center aspect-square touch-manipulation"
              style={{
                background: style.bg,
                border: `2px solid ${style.border}`,
                boxShadow: style.glow,
                opacity: disabled ? 0.5 : 1,
                minHeight: '52px',
              }}
            >
              <motion.div 
                className="text-xl"
                animate={gift.action === 'magic_dash' ? { rotate: [0, 360] } : { scale: [1, 1.1, 1] }}
                transition={{ duration: gift.action === 'magic_dash' ? 3 : 1.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              <div className="text-[7px] font-bold text-white leading-tight text-center mt-0.5 truncate w-full">
                {actionInfo?.name?.split(' ')[1] || gift.name}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend - Minimal */}
      <div className="mt-1.5 pt-1.5 border-t border-white/10">
        <div className="flex justify-center gap-1 text-[8px]">
          <span className="text-cyan-400">🌹Move</span>
          <span className="text-orange-400">🫰Shoot</span>
          <span className="text-blue-400">🧢Shield</span>
          <span className="text-green-400">💐Heal</span>
          <span className="text-purple-400">🌌Magic</span>
          <span className="text-red-400">💀Danger</span>
          <span className="text-yellow-400">⚡EMP</span>
        </div>
      </div>
    </div>
  );
};