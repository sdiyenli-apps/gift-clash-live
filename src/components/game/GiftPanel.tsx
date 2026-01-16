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

  const tierLabels: Record<GiftTier, { label: string; color: string; desc: string }> = {
    small: { label: '🎮 MOVEMENT', color: 'text-cyan-400', desc: 'Forward, Up, Down, Shoot' },
    medium: { label: '⚡ POWER-UPS', color: 'text-purple-400', desc: 'Jump, Dash, Heal!' },
    large: { label: '🔥 ULTIMATE', color: 'text-yellow-400', desc: 'Game changers!' },
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 space-y-4">
      <h3 className="font-bold text-lg text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
        🎁 GIFT = ACTION
      </h3>
      <p className="text-xs text-center text-gray-400">
        Each gift does ONE specific action!
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
            {giftsByTier[tier].map(gift => {
              const actionInfo = GIFT_ACTION_INFO[gift.action];
              return (
                <motion.button
                  key={gift.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTriggerGift(gift.id)}
                  disabled={disabled}
                  className={`
                    px-3 py-2 rounded-lg border transition-all flex flex-col items-center min-w-[70px]
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
                  <div className="text-[10px] font-bold text-white">{actionInfo.name}</div>
                  <div className="text-[9px] text-gray-500">
                    💎{gift.diamonds}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-gray-700 pt-3">
        <div className="text-[10px] text-gray-500 text-center">
          🌹 = Forward • 🍦 = Up • 🍩 = Down • 🫰 = Shoot<br/>
          🧢 = Jump • 💗 = Triple Shot • 💐 = Heal • 🔥 = Dash<br/>
          🌌 = Ultra Mode • 🪐 = Nuke • ✨ = Shield • 🦁 = Slow-Mo
        </div>
      </div>
    </div>
  );
};
