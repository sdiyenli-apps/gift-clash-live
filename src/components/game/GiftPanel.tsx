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
        return 'border-cyan-400/60 bg-cyan-950/40 hover:border-cyan-300 hover:shadow-[0_0_12px_rgba(0,255,255,0.5)]';
      case 'shoot':
        return 'border-orange-400/60 bg-orange-950/40 hover:border-orange-300 hover:shadow-[0_0_12px_rgba(255,165,0,0.5)]';
      case 'armor':
        return 'border-blue-400/60 bg-blue-950/40 hover:border-blue-300 hover:shadow-[0_0_12px_rgba(0,100,255,0.5)]';
      case 'heal':
        return 'border-green-400/60 bg-green-950/40 hover:border-green-300 hover:shadow-[0_0_12px_rgba(0,255,100,0.5)]';
      case 'magic_dash':
        return 'border-purple-400/60 bg-purple-950/40 hover:border-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]';
      default:
        return 'border-gray-400/50 bg-gray-950/30';
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-purple-500/30 p-3 space-y-3">
      <h3 className="font-black text-base text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
        🎁 GIFT = ACTION
      </h3>

      {/* All 5 gifts in a compact grid */}
      <div className="grid grid-cols-5 gap-2">
        {gifts.map(gift => {
          const actionInfo = GIFT_ACTION_INFO[gift.action];
          
          return (
            <motion.button
              key={gift.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTriggerGift(gift.id)}
              disabled={disabled}
              className={`
                p-2 rounded-lg border-2 transition-all flex flex-col items-center
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${getGiftStyle(gift.action)}
              `}
            >
              <motion.div 
                className="text-xl"
                animate={gift.action === 'magic_dash' ? { rotate: [0, 360] } : { y: [0, -2, 0] }}
                transition={{ duration: gift.action === 'magic_dash' ? 2 : 0.5, repeat: Infinity }}
              >
                {gift.emoji}
              </motion.div>
              <div className="text-[8px] font-bold text-white mt-1 leading-tight text-center">
                {actionInfo.name.split(' ')[1] || actionInfo.name}
              </div>
              <div className="text-[7px] text-gray-400 font-semibold">
                💎{gift.diamonds}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 pt-2 space-y-1">
        <div className="flex flex-wrap gap-1 justify-center text-[9px]">
          <span className="text-cyan-400">🌹 Move</span>
          <span className="text-gray-500">•</span>
          <span className="text-orange-400">🫰 Shoot</span>
          <span className="text-gray-500">•</span>
          <span className="text-blue-400">🧢 Armor</span>
          <span className="text-gray-500">•</span>
          <span className="text-green-400">💐 Heal</span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-400">🌌 Magic</span>
        </div>
        <div className="text-[9px] text-pink-400 text-center font-bold">
          👑 REACH THE PRINCESS TO WIN!
        </div>
      </div>
    </div>
  );
};
