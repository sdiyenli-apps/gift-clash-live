import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTION_INFO, GiftTier } from '@/types/game';

interface GiftPanelProps {
  onTriggerGift: (giftId: string) => void;
  disabled: boolean;
}

export const GiftPanel = ({ onTriggerGift, disabled }: GiftPanelProps) => {
  const giftsByTier: Record<GiftTier, typeof TIKTOK_GIFTS[string][]> = {
    small: [],
    medium: [],
    large: [],
  };

  Object.values(TIKTOK_GIFTS).forEach(gift => {
    giftsByTier[gift.tier].push(gift);
  });

  const tierLabels: Record<GiftTier, { label: string; color: string; bgColor: string; desc: string }> = {
    small: { label: '🎮 CONTROLS', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', desc: '↑ UP ↓ DOWN → FORWARD' },
    medium: { label: '⚡ POWER-UPS', color: 'text-purple-400', bgColor: 'bg-purple-500/10', desc: 'Jump, Dash, Heal!' },
    large: { label: '🔥 ULTIMATE', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', desc: 'Game changers!' },
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 space-y-4">
      <h3 className="font-black text-xl text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
        🎁 GIFT = ACTION
      </h3>
      <p className="text-xs text-center text-gray-400">
        Each gift triggers ONE specific action!
      </p>

      {(['small', 'medium', 'large'] as GiftTier[]).map(tier => (
        <div key={tier} className={`space-y-2 p-3 rounded-lg ${tierLabels[tier].bgColor}`}>
          <div className="flex items-center justify-between">
            <span className={`font-bold text-sm ${tierLabels[tier].color}`}>
              {tierLabels[tier].label}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">{tierLabels[tier].desc}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {giftsByTier[tier].map(gift => {
              const actionInfo = GIFT_ACTION_INFO[gift.action] || { name: '⚡ ACTION', effect: 'help' };
              const isMovement = ['move_forward', 'move_up', 'move_down'].includes(gift.action);
              const isFunny = gift.action === 'spawn_chicken';
              
              return (
                <motion.button
                  key={gift.id}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onTriggerGift(gift.id)}
                  disabled={disabled}
                  className={`
                    px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center min-w-[72px]
                    ${disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-800 cursor-pointer'
                    }
                    ${isMovement ? 'border-cyan-400/50 bg-cyan-950/30 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]' : ''}
                    ${isFunny ? 'border-orange-400/50 bg-orange-950/30 hover:border-orange-300 hover:shadow-[0_0_15px_rgba(255,165,0,0.5)]' : ''}
                    ${tier === 'medium' && !isFunny ? 'border-purple-400/50 bg-purple-950/30 hover:border-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''}
                    ${tier === 'large' ? 'border-yellow-400/50 bg-yellow-950/30 hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.5)]' : ''}
                    ${tier === 'small' && !isMovement && !isFunny ? 'border-green-400/50 bg-green-950/30 hover:border-green-300 hover:shadow-[0_0_15px_rgba(0,255,100,0.5)]' : ''}
                  `}
                >
                  <motion.div 
                    className="text-2xl"
                    animate={isMovement ? { y: [0, -2, 0] } : isFunny ? { rotate: [-5, 5, -5] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {gift.emoji}
                  </motion.div>
                  <div className="text-[10px] font-bold text-white mt-1">{actionInfo.name}</div>
                  <div className="text-[9px] text-gray-400 font-semibold">
                    💎 {gift.diamonds}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-gray-700 pt-3 space-y-1">
        <div className="text-xs font-bold text-center text-cyan-400">
          🎯 SHOOT TARGETS ENEMIES!
        </div>
        <div className="text-[10px] text-gray-400 text-center">
          🌹 FORWARD • 🍦 UP • 🍩 DOWN • 🫰 SHOOT (auto-aim!)
        </div>
        <div className="text-[10px] text-pink-400 text-center font-bold">
          👑 REACH THE PRINCESS TO WIN!
        </div>
      </div>
    </div>
  );
};
