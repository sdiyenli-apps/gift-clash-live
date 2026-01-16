import { motion } from 'framer-motion';
import { TIKTOK_GIFTS, GIFT_ACTIONS, GiftTier } from '@/types/game';
import { Button } from '@/components/ui/button';

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

  const tierLabels: Record<GiftTier, { label: string; color: string }> = {
    small: { label: 'SMALL GIFTS', color: 'text-neon-cyan' },
    medium: { label: 'MEDIUM GIFTS', color: 'text-neon-purple' },
    large: { label: 'LARGE GIFTS', color: 'text-neon-yellow' },
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 space-y-4">
      <h3 className="font-display text-lg text-center text-primary text-glow-pink">
        🎁 SIMULATE GIFTS
      </h3>
      <p className="text-xs text-center text-muted-foreground">
        Click to test gift actions (simulates TikTok Live)
      </p>

      {(['small', 'medium', 'large'] as GiftTier[]).map(tier => (
        <div key={tier} className="space-y-2">
          <div className={`font-display text-xs ${tierLabels[tier].color}`}>
            {tierLabels[tier].label}
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
                    : 'hover:bg-muted cursor-pointer'
                  }
                  ${tier === 'small' ? 'border-neon-cyan/30 hover:border-neon-cyan' : ''}
                  ${tier === 'medium' ? 'border-neon-purple/30 hover:border-neon-purple' : ''}
                  ${tier === 'large' ? 'border-neon-yellow/30 hover:border-neon-yellow' : ''}
                `}
              >
                <div className="text-2xl">{gift.emoji}</div>
                <div className="text-xs text-muted-foreground">
                  💎{gift.diamonds}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-border pt-4">
        <h4 className="font-display text-xs text-muted-foreground mb-2">POSSIBLE EFFECTS:</h4>
        <div className="space-y-1 text-xs">
          {Object.entries(GIFT_ACTIONS).map(([tier, actions]) => (
            <div key={tier} className="flex flex-wrap gap-1">
              {actions.map(action => (
                <span
                  key={action.action}
                  className={`
                    px-2 py-0.5 rounded-full text-[10px]
                    ${action.effect === 'help' ? 'bg-neon-green/20 text-neon-green' : ''}
                    ${action.effect === 'sabotage' ? 'bg-destructive/20 text-destructive' : ''}
                    ${action.effect === 'chaos' ? 'bg-neon-purple/20 text-neon-purple' : ''}
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
