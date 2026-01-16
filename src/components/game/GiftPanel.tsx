import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTIONS, GiftTier } from '@/types/game';

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

  const tierLabels: Record<GiftTier, { label: string; color: string; desc: string }> = {
    small: { label: '🎮 CONTROLS', color: 'text-cyan-400', desc: 'Move, Jump, Shoot' },
    medium: { label: '⚡ POWER-UPS', color: 'text-purple-400', desc: 'Special moves!' },
    large: { label: '🔥 ULTIMATE', color: 'text-yellow-400', desc: 'Game changers!' },
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 space-y-4">
      <h3 className="font-bold text-lg text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
        🎁 GIFT CONTROLS
      </h3>
      <p className="text-xs text-center text-gray-400">
        Send gifts to control the hero!
      </p>

      {(['small', 'medium', 'large'] as GiftTier[]).map(tier => (
        <div key={tier} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-bold text-xs ${tierLabels[tier].color}`}>
              {tierLabels[tier].label}
            </span>
            <span className="text-[10px] text-gray-500">{tierLabels[tier].desc}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {giftsByTier[tier].map(gift => (
              <motion.button
                key={gift.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTriggerGift(gift.id)}
                disabled={disabled}
                className={`
                  px-3 py-2 rounded-lg border transition-all
                  ${disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-800 cursor-pointer'
                  }
                  ${tier === 'small' ? 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]' : ''}
                  ${tier === 'medium' ? 'border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''}
                  ${tier === 'large' ? 'border-yellow-500/30 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(255,255,0,0.3)]' : ''}
                `}
              >
                <div className="text-2xl">{gift.emoji}</div>
                <div className="text-[10px] text-gray-500">
                  💎{gift.diamonds}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-gray-700 pt-4">
        <h4 className="font-bold text-xs text-gray-500 mb-2">GIFT ACTIONS:</h4>
        <div className="space-y-2 text-xs">
          {Object.entries(GIFT_ACTIONS).map(([tier, actions]) => (
            <div key={tier} className="flex flex-wrap gap-1">
              {actions.map(action => (
                <span
                  key={action.action}
                  className={`
                    px-2 py-0.5 rounded-full text-[10px]
                    ${action.effect === 'help' ? 'bg-green-500/20 text-green-400' : ''}
                    ${action.effect === 'sabotage' ? 'bg-red-500/20 text-red-400' : ''}
                    ${action.effect === 'chaos' ? 'bg-purple-500/20 text-purple-400' : ''}
                  `}
                >
                  {action.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
