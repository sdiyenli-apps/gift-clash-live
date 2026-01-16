import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTION_INFO, GiftTier } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
}

export const GiftPanel = ({ onTriggerGift, disabled }: GiftPanelProps) => {
  const gifts = Object.values(TIKTOK_GIFTS);

  const getGiftStyle = (action: string) => {
    switch (action) {
      case 'move_forward':
        return 'border-cyan-400/60 bg-cyan-950/40 hover:border-cyan-300';
      case 'shoot':
        return 'border-orange-400/60 bg-orange-950/40 hover:border-orange-300';
      case 'armor':
        return 'border-blue-400/60 bg-blue-950/40 hover:border-blue-300';
      case 'heal':
        return 'border-green-400/60 bg-green-950/40 hover:border-green-300';
      case 'magic_dash':
        return 'border-purple-400/60 bg-purple-950/40 hover:border-purple-300';
      case 'spawn_enemies':
        return 'border-red-400/60 bg-red-950/40 hover:border-red-300';
      default:
        return 'border-gray-400/50 bg-gray-950/30';
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded border border-purple-500/30 p-1.5 space-y-1">
      <h3 className="font-black text-xs text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
        🎁 GIFT = ACTION
      </h3>

      {/* All gifts in a compact grid */}
      <div className="grid grid-cols-6 gap-1">
        {gifts.map(gift => {
          const actionInfo = GIFT_ACTION_INFO[gift.action];
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className={`
                p-1 rounded border transition-all flex flex-col items-center
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${getGiftStyle(gift.action)}
              `}
            >
              <motion.div 
                className="text-base"
                animate={gift.action === 'magic_dash' ? { rotate: [0, 360] } : { y: [0, -1, 0] }}
                transition={{ duration: gift.action === 'magic_dash' ? 2 : 0.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              <div className="text-[6px] font-bold text-white leading-tight text-center truncate w-full">
                {actionInfo?.name?.split(' ')[1] || gift.name}
              </div>
              <div className="text-[6px] text-gray-400 font-semibold">
                💎{gift.diamonds}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend - very compact */}
      <div className="border-t border-gray-700 pt-1">
        <div className="flex flex-wrap gap-0.5 justify-center text-[7px]">
          <span className="text-cyan-400">🌹Move</span>
          <span className="text-gray-500">•</span>
          <span className="text-orange-400">🫰Shoot</span>
          <span className="text-gray-500">•</span>
          <span className="text-blue-400">🧢Armor</span>
          <span className="text-gray-500">•</span>
          <span className="text-green-400">💐Heal</span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-400">🌌Magic</span>
          <span className="text-gray-500">•</span>
          <span className="text-red-400">💀Danger</span>
        </div>
        <div className="text-[7px] text-pink-400 text-center font-bold">
          👑 REACH THE PRINCESS TO WIN!
        </div>
      </div>
    </div>
  );
};
